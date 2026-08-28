export type MediaKind = 'photo' | 'video' | 'other';

export interface FileRecord {
  relativePath: string;
  size: number;
  modified: number;
  kind: MediaKind;
  readable: boolean;
  sampled: boolean;
  hash?: string;
  captureYear?: number;
}

export interface TargetScan {
  path: string;
  label: string;
  files: FileRecord[];
  startedAt: string;
  completedAt: string;
  fileSystem?: string;
  storageId?: string;
}

export interface CheckResult {
  version: 1;
  checkId: string;
  checkedAt: string;
  primary: TargetScan;
  backup: TargetScan;
  matched: number;
  missingFromBackup: string[];
  extraOnBackup: string[];
  changed: string[];
  unreadable: string[];
  sampledHashes: number;
  dateCoverage: number;
  verdict: 'ready' | 'attention';
}

export interface LicenseState {
  active: boolean;
  checkedAt?: number;
  reason?: string;
}
