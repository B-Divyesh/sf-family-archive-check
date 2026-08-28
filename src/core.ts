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
    } else if (source.size !== copy.size || (source.hash && copy.hash && source.hash !== copy.hash)) {
      changed.push(path);
    } else {
      matched += 1;
    }
  }

  const extraOnBackup = [...backupByPath.keys()].filter((path) => !primaryByPath.has(path));
  const unreadable = [...primary.files, ...backup.files]
    .filter((file) => !file.readable)
    .map((file) => file.relativePath);
  const media = primary.files.filter((file) => file.kind !== 'other');
  const dated = media.filter((file) => file.captureYear).length;
  const sampledHashes = [...primary.files, ...backup.files].filter((file) => file.sampled && file.hash).length;

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

export async function scanBrowserFiles(files: FileList, label: string): Promise<TargetScan> {
  const startedAt = new Date().toISOString();
  const list = Array.from(files);
  const root = list[0]?.webkitRelativePath.split('/')[0] || label;
  const sampleStep = Math.max(1, Math.ceil(list.length / 48));
  const records: FileRecord[] = [];

  for (let index = 0; index < list.length; index += 1) {
    const file = list[index];
    const relativePath = file.webkitRelativePath.split('/').slice(1).join('/') || file.name;
    const sampled = index % sampleStep === 0 && mediaKind(relativePath) !== 'other';
    let hash: string | undefined;
    let readable = true;
    try {
      const bytes = await file.slice(0, sampled ? 1024 * 1024 : 16).arrayBuffer();
      if (sampled) {
        const digest = await crypto.subtle.digest('SHA-256', bytes);
        hash = [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('');
      }
    } catch {
      readable = false;
    }
    const yearMatch = relativePath.match(/(?:19|20)\d{2}/);
    records.push({ relativePath, size: file.size, modified: file.lastModified, kind: mediaKind(relativePath), readable, sampled, hash, captureYear: yearMatch ? Number(yearMatch[0]) : undefined });
  }

  return { path: root, label, files: records, startedAt, completedAt: new Date().toISOString(), fileSystem: 'Browser folder access' };
}
