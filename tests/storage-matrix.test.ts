import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('mounted filesystem acceptance matrix', () => {
  it('@claim:filesystem-matrix keeps APFS, NTFS, and exFAT fixture scans in the published CI matrix', () => {
    const workflow = readFileSync('.github/workflows/quality.yml', 'utf8');
    const macos = readFileSync('tests/storage-volume-macos.sh', 'utf8');
    const windows = readFileSync('tests/storage-volume.ps1', 'utf8');
    const linux = readFileSync('tests/storage-volume.sh', 'utf8');
    const scanner = readFileSync('src-tauri/src/lib.rs', 'utf8');

    expect(workflow).toMatch(/platform: macos-latest\s+filesystem: APFS\s+command: bash tests\/storage-volume-macos\.sh/s);
    expect(workflow).toMatch(/platform: windows-latest\s+filesystem: NTFS\s+command: \.\/tests\/storage-volume\.ps1/s);
    expect(workflow).toMatch(/platform: ubuntu-22\.04\s+filesystem: exFAT\s+command: bash tests\/storage-volume\.sh exfat/s);
    expect(workflow).toContain('Scan valid media on the mounted target filesystem (Unix)');
    expect(workflow).toContain('Scan valid media on the mounted target filesystem (Windows)');

    expect(macos).toContain('diskutil info');
    expect(macos).toContain('FAC_EXPECTED_FILESYSTEM="apfs"');
    expect(windows).toContain('Get-Volume -FilePath $root');
    expect(windows).toContain("FAC_EXPECTED_FILESYSTEM = 'ntfs'");
    expect(linux).toContain('mkfs.exfat');
    expect(linux).toContain('fsck.exfat -n');
    expect(linux).toContain('FAC_EXPECTED_FILESYSTEM="exfat|fuse"');

    for (const fixture of ['valid.jpg', 'valid.png', 'valid.heic', 'valid.mp4', 'valid.mov']) {
      expect(scanner).toContain(`"${fixture}"`);
    }
    expect(scanner).toContain('mounted_volume_fixture_scans_the_expected_real_filesystem');
  });
});
