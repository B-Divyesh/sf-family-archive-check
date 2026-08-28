import type { CheckResult, FileRecord, MediaKind, TargetScan } from './types';

const photoExtensions = new Set(['jpg', 'jpeg', 'png', 'heic', 'heif', 'gif', 'webp', 'tif', 'tiff', 'raw', 'dng']);
const videoExtensions = new Set(['mp4', 'mov', 'm4v', 'avi', 'mkv', 'webm', 'mts', 'm2ts', '3gp']);

export function mediaKind(path: string): MediaKind {
  const extension = path.toLowerCase().split('.').pop() ?? '';
  if (photoExtensions.has(extension)) return 'photo';
  if (videoExtensions.has(extension)) return 'video';
  return 'other';
}

export function compareScans(primary: TargetScan, backup: TargetScan): CheckResult {
  const primaryByPath = new Map(primary.files.map((file) => [file.relativePath, file]));
  const backupByPath = new Map(backup.files.map((file) => [file.relativePath, file]));
  const missingFromBackup: string[] = [];
  const changed: string[] = [];
  let matched = 0;

  for (const [path, source] of primaryByPath) {
    const copy = backupByPath.get(path);
    if (!copy) {
      missingFromBackup.push(path);
    } else if (!source.readable || !copy.readable) {
      // Readability is reported separately; an unreadable pair is not a match.
    } else if (source.size !== copy.size || (source.hash && copy.hash && source.hash !== copy.hash)) {
      changed.push(path);
    } else {
      matched += 1;
    }
  }

  const extraOnBackup = [...backupByPath.keys()].filter((path) => !primaryByPath.has(path));
  const unreadable = [...new Set([...primary.files, ...backup.files]
    .filter((file) => !file.readable)
    .map((file) => file.relativePath))];
  const media = primary.files.filter((file) => file.kind !== 'other');
  const dated = media.filter((file) => file.captureYear).length;
  const sampledHashes = [...primaryByPath].filter(([path, source]) => {
    const copy = backupByPath.get(path);
    return Boolean(source.hash && copy?.hash);
  }).length;

  return {
    version: 1,
    checkId: globalThis.crypto?.randomUUID?.() ?? `check-${Date.now()}`,
    checkedAt: new Date().toISOString(),
    primary,
    backup,
    matched,
    missingFromBackup,
    extraOnBackup,
    changed,
    unreadable,
    sampledHashes,
    dateCoverage: media.length ? Math.round((dated / media.length) * 100) : 0,
    verdict: missingFromBackup.length || changed.length || unreadable.length ? 'attention' : 'ready'
  };
}

export function summarize(scan: TargetScan) {
  return scan.files.reduce(
    (sum, file) => {
      sum.files += 1;
      sum.bytes += file.size;
      sum[file.kind] += 1;
      if (!file.readable) sum.unreadable += 1;
      return sum;
    },
    { files: 0, bytes: 0, photo: 0, video: 0, other: 0, unreadable: 0 }
  );
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unit = units[0];
  for (let index = 1; index < units.length && value >= 1024; index += 1) {
    value /= 1024;
    unit = units[index];
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
}

export function exportName(result: CheckResult) {
  return `family-archive-manifest-${result.checkedAt.slice(0, 10)}.json`;
}

function sampleScore(path: string) {
  let score = 2166136261;
  for (const byte of new TextEncoder().encode(path)) {
    score ^= byte;
    score = Math.imul(score, 16777619) >>> 0;
  }
  return score;
}

export async function scanBrowserFiles(files: FileList, label: string): Promise<TargetScan> {
  const startedAt = new Date().toISOString();
  const list = Array.from(files);
  const root = list[0]?.webkitRelativePath.split('/')[0] || label;
  const relativePath = (file: File) => file.webkitRelativePath.split('/').slice(1).join('/') || file.name;
  const sampledPaths = new Set(list
    .map(relativePath)
    .filter((path) => mediaKind(path) !== 'other')
    .sort((left, right) => sampleScore(left) - sampleScore(right) || left.localeCompare(right))
    .slice(0, 48));
  const records: FileRecord[] = [];

  for (const file of list) {
    const path = relativePath(file);
    const sampled = sampledPaths.has(path);
    let hash: string | undefined;
    let readable = true;
    try {
      const bytes = await (sampled ? file : file.slice(0, 16)).arrayBuffer();
      if (sampled) {
        const digest = await crypto.subtle.digest('SHA-256', bytes);
        hash = [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('');
      }
    } catch {
      readable = false;
    }
    const yearMatch = path.match(/(?:19|20)\d{2}/);
    records.push({ relativePath: path, size: file.size, modified: file.lastModified, kind: mediaKind(path), readable, sampled, hash, captureYear: yearMatch ? Number(yearMatch[0]) : undefined });
  }

  return { path: root, label, files: records, startedAt, completedAt: new Date().toISOString(), fileSystem: 'Browser folder access' };
}
