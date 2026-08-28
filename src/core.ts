import type { CheckResult, FileRecord, MediaKind, TargetScan } from './types';

const photoExtensions = new Set(['jpg', 'jpeg', 'png', 'heic', 'heif', 'gif', 'webp', 'tif', 'tiff', 'raw', 'dng']);
const videoExtensions = new Set(['mp4', 'mov', 'm4v', 'avi', 'mkv', 'webm', 'mts', 'm2ts', '3gp']);

const bytesEqual = (bytes: Uint8Array, offset: number, expected: number[]) =>
  expected.every((value, index) => bytes[offset + index] === value);

function hasIsoBox(bytes: Uint8Array, name: string) {
  const wanted = [...new TextEncoder().encode(name)];
  for (let offset = 4; offset + 4 <= bytes.length; offset += 1) {
    if (bytesEqual(bytes, offset, wanted)) return true;
  }
  return false;
}

/** Rejects empty, truncated, or wrongly labelled sampled media before it can be called readable. */
export function hasValidMediaStructure(path: string, bytes: Uint8Array): boolean {
  const extension = path.toLowerCase().split('.').pop() ?? '';
  if (!photoExtensions.has(extension) && !videoExtensions.has(extension)) return bytes.length > 0;
  if (bytes.length < 12) return false;

  if (extension === 'jpg' || extension === 'jpeg') {
    return bytesEqual(bytes, 0, [0xff, 0xd8, 0xff]) && bytesEqual(bytes, bytes.length - 2, [0xff, 0xd9]);
  }
  if (extension === 'png') {
    return bytesEqual(bytes, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) &&
      bytesEqual(bytes, bytes.length - 12, [0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44]);
  }
  if (extension === 'gif') {
    const header = new TextDecoder().decode(bytes.slice(0, 6));
    return (header === 'GIF87a' || header === 'GIF89a') && bytes.at(-1) === 0x3b;
  }
  if (extension === 'webp') {
    return bytesEqual(bytes, 0, [0x52, 0x49, 0x46, 0x46]) && bytesEqual(bytes, 8, [0x57, 0x45, 0x42, 0x50]);
  }
  if (['tif', 'tiff', 'dng', 'raw'].includes(extension)) {
    const little = bytesEqual(bytes, 0, [0x49, 0x49, 0x2a, 0x00]);
    const big = bytesEqual(bytes, 0, [0x4d, 0x4d, 0x00, 0x2a]);
    return little || big;
  }
  if (['heic', 'heif', 'mp4', 'mov', 'm4v', '3gp'].includes(extension)) {
    return hasIsoBox(bytes, 'ftyp') && (hasIsoBox(bytes, 'mdat') || hasIsoBox(bytes, 'meta'));
  }
  if (extension === 'avi') {
    return bytesEqual(bytes, 0, [0x52, 0x49, 0x46, 0x46]) && bytesEqual(bytes, 8, [0x41, 0x56, 0x49, 0x20]) && hasIsoBox(bytes, 'movi');
  }
  if (extension === 'mkv' || extension === 'webm') {
    return bytesEqual(bytes, 0, [0x1a, 0x45, 0xdf, 0xa3]) && bytes.some((value, index) => value === 0x18 && bytesEqual(bytes, index, [0x18, 0x53, 0x80, 0x67]));
  }
  if (extension === 'mts' || extension === 'm2ts') {
    const offset = extension === 'm2ts' ? 4 : 0;
    return bytes[offset] === 0x47 && (bytes.length < offset + 189 || bytes[offset + 188] === 0x47);
  }
  return false;
}

async function browserCanDecodePhoto(file: File, path: string) {
  const extension = path.toLowerCase().split('.').pop() ?? '';
  if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension) || typeof createImageBitmap !== 'function') return true;
  try {
    const bitmap = await createImageBitmap(file);
    const valid = bitmap.width > 0 && bitmap.height > 0;
    bitmap.close();
    return valid;
  } catch {
    return false;
  }
}

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
    return Boolean(source.readable && copy?.readable && source.hash && copy.hash);
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

export function folderIndependenceProblem(primary: TargetScan, backup: TargetScan): string | undefined {
  if (primary.path.trim().toLocaleLowerCase() === backup.path.trim().toLocaleLowerCase()) {
    return 'The same folder was chosen twice. Choose the independent copy on another drive.';
  }
  if (primary.storageId && backup.storageId && primary.storageId === backup.storageId) {
    return 'Both folders are on the same storage device. Choose an independent copy on another drive.';
  }
  return undefined;
}

export function exceedsFreeLimit(primaryCount: number, backupCount: number, licenseActive: boolean) {
  return Math.max(primaryCount, backupCount) > 500 && !licenseActive;
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

export async function scanBrowserFiles(files: FileList | File[], label: string): Promise<TargetScan> {
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
      if (sampled && !hasValidMediaStructure(path, new Uint8Array(bytes))) readable = false;
      if (sampled && readable && !(await browserCanDecodePhoto(file, path))) readable = false;
      if (sampled && readable) {
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
