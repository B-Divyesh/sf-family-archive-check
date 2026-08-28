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
    const result = compareScans(
      target('main', [file('2001/a.jpg'), file('2001/b.mov'), file('2001/c.png')]),
      target('copy', [file('2001/a.jpg'), file('2001/b.mov', 12)])
    );
    expect(result.matched).toBe(1);
    expect(result.changed).toEqual(['2001/b.mov']);
    expect(result.missingFromBackup).toEqual(['2001/c.png']);
    expect(result.sampledHashes).toBe(5);
    expect(result.verdict).toBe('attention');
  });

  it('recognises common photo and video extensions', () => {
    expect(mediaKind('photo.HEIC')).toBe('photo');
    expect(mediaKind('clip.MOV')).toBe('video');
    expect(mediaKind('notes.txt')).toBe('other');
  });
});
