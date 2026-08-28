import { describe, expect, it } from 'vitest';
import { compareScans, mediaKind } from '../src/core';
import type { TargetScan } from '../src/types';

const target = (path: string, files: TargetScan['files']): TargetScan => ({
  path,
  label: path,
  files,
  startedAt: '2026-01-01T00:00:00Z',
  completedAt: '2026-01-01T00:00:01Z'
});

const file = (relativePath: string, size = 10, hash = 'same') => ({
  relativePath,
  size,
  modified: 1,
  kind: mediaKind(relativePath),
  readable: true,
  sampled: true,
  hash,
  captureYear: 2001
});

describe('archive comparison', () => {
  it('@claim:compare-copies finds missing and changed files', () => {
    const unreadable = { ...file('2001/d.jpg'), readable: false, sampled: false, hash: undefined };
    const result = compareScans(
      target('main', [file('2001/a.jpg'), file('2001/b.mov'), file('2001/c.png'), unreadable]),
      target('copy', [file('2001/a.jpg'), file('2001/b.mov', 12), file('2001/d.jpg'), file('2001/extra.jpg')])
    );
    expect(result.matched).toBe(1);
    expect(result.changed).toEqual(['2001/b.mov']);
    expect(result.missingFromBackup).toEqual(['2001/c.png']);
    expect(result.extraOnBackup).toEqual(['2001/extra.jpg']);
    expect(result.unreadable).toEqual(['2001/d.jpg']);
    expect(result.sampledHashes).toBe(2);
    expect(result.verdict).toBe('attention');
  });

  it('allows a complete copy that contains extra files', () => {
    const result = compareScans(
      target('main', [file('2001/a.jpg')]),
      target('copy', [file('2001/a.jpg'), file('2001/extra.jpg')])
    );
    expect(result.extraOnBackup).toEqual(['2001/extra.jpg']);
    expect(result.verdict).toBe('ready');
  });

  it('counts only hashes that can be compared on both copies', () => {
    const sourceOnlyHash = { ...file('2001/a.jpg'), hash: 'source' };
    const unhashedCopy = { ...file('2001/a.jpg'), sampled: false, hash: undefined };
    const result = compareScans(target('main', [sourceOnlyHash]), target('copy', [unhashedCopy]));
    expect(result.sampledHashes).toBe(0);
    expect(result.verdict).toBe('ready');
  });

  it('recognises common photo and video extensions', () => {
    expect(mediaKind('photo.HEIC')).toBe('photo');
    expect(mediaKind('clip.MOV')).toBe('video');
    expect(mediaKind('notes.txt')).toBe('other');
  });
});
