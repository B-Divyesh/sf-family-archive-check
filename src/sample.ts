import type { CheckResult, FileRecord, TargetScan } from './types';
import { compareScans } from './core';

const examples: FileRecord[] = [
  ['1987/08-Lake-camping/Dad-by-the-tent.jpg', 3_840_211, 'photo', 1987],
  ['1994/12-Christmas/Grandma-and-Leo.jpg', 4_110_289, 'photo', 1994],
  ['2003/06-Graduation/graduation-tape-01.mov', 811_420_113, 'video', 2003],
  ['2011/04/New-home/kitchen-before.jpg', 2_948_221, 'photo', 2011],
  ['2018/07-Reunion/family-table.jpg', 5_611_430, 'photo', 2018],
  ['2024/01-New-year/fireworks.mp4', 288_821_092, 'video', 2024]
].map(([relativePath, size, kind, captureYear], index) => ({
  relativePath: String(relativePath),
  size: Number(size),
  modified: Date.UTC(Number(captureYear), index, 10),
  kind: kind as 'photo' | 'video',
  captureYear: Number(captureYear),
  readable: true,
  sampled: true,
  hash: `sample-${index}-verified`
}));

function target(path: string, label: string, files: FileRecord[]): TargetScan {
  return { path, label, files, startedAt: '2026-08-28T09:00:00.000Z', completedAt: '2026-08-28T09:00:08.000Z', fileSystem: label === 'Main archive' ? 'APFS' : 'exFAT' };
}

export function sampleResult(): CheckResult {
  const primary = target('/Volumes/Family Photos', 'Main archive', examples);
  const backupFiles = examples.slice(0, -1).map((file) => ({ ...file }));
  const result = compareScans(primary, target('/Volumes/Blue Backup', 'Independent copy', backupFiles));
  result.checkId = 'sample-family-archive';
  result.checkedAt = '2026-08-28T09:00:08.000Z';
  return result;
}
