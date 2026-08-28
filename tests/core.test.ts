import { describe, expect, it } from 'vitest';
import { compareScans, exceedsFreeLimit, folderIndependenceProblem, hasValidMediaStructure, mediaKind } from '../src/core';
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

  it('@claim:media-readable rejects empty and truncated media structures', () => {
    for (const extension of ['jpg', 'jpeg', 'png', 'heic', 'heif', 'gif', 'webp', 'tif', 'tiff', 'raw', 'dng', 'mp4', 'mov', 'm4v', 'avi', 'mkv', 'webm', 'mts', 'm2ts', '3gp']) {
      expect(hasValidMediaStructure(`empty.${extension}`, new Uint8Array()), extension).toBe(false);
    }
    expect(hasValidMediaStructure('truncated.jpg', new Uint8Array([0xff, 0xd8, 0xff]))).toBe(false);
    expect(hasValidMediaStructure('truncated.png', new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(false);
    expect(hasValidMediaStructure('valid.jpg', new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0xff, 0xd9]))).toBe(true);
  });

  it('@claim:independent-folders rejects the same folder and storage device', () => {
    expect(folderIndependenceProblem(target('/photos', []), target('/photos', []))).toContain('same folder');
    expect(folderIndependenceProblem({ ...target('/main', []), storageId: 'device:7' }, { ...target('/copy', []), storageId: 'device:7' })).toContain('same storage device');
    expect(folderIndependenceProblem({ ...target('/main', []), storageId: 'device:7' }, { ...target('/copy', []), storageId: 'device:8' })).toBeUndefined();
  });

  it('@claim:free-limit allows 500 files and requires a license for 501', () => {
    expect(exceedsFreeLimit(500, 500, false)).toBe(false);
    expect(exceedsFreeLimit(501, 501, false)).toBe(true);
    expect(exceedsFreeLimit(501, 501, true)).toBe(false);
  });
});
