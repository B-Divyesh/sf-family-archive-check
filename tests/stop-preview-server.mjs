import { existsSync, readdirSync, readFileSync, readlinkSync, realpathSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const port = Number.parseInt(process.env.FAC_TEST_PORT ?? '4173', 10);
const workspace = realpathSync(process.cwd());

function readLinuxListeningInodes() {
  const inodes = new Set();
  for (const table of ['/proc/net/tcp', '/proc/net/tcp6']) {
    if (!existsSync(table)) continue;
    for (const line of readFileSync(table, 'utf8').trim().split('\n').slice(1)) {
      const fields = line.trim().split(/\s+/);
      const [, rawPort] = fields[1]?.split(':') ?? [];
      if (fields[3] === '0A' && Number.parseInt(rawPort, 16) === port && fields[9]) inodes.add(fields[9]);
    }
  }
  return inodes;
}

function linuxOwners(inodes) {
  const owners = [];
  for (const entry of readdirSync('/proc')) {
    if (!/^\d+$/.test(entry)) continue;
    const fdDir = `/proc/${entry}/fd`;
    try {
      const ownsSocket = readdirSync(fdDir).some((fd) => {
        try {
          const socket = readlinkSync(`${fdDir}/${fd}`).match(/^socket:\[(\d+)\]$/)?.[1];
          return Boolean(socket && inodes.has(socket));
        } catch {
          return false;
        }
      });
      if (!ownsSocket) continue;
      owners.push({
        pid: Number(entry),
        command: readFileSync(`/proc/${entry}/cmdline`, 'utf8').replaceAll('\0', ' ').trim(),
        cwd: realpathSync(`/proc/${entry}/cwd`)
      });
    } catch {
      // A process can exit while this inspection is running.
    }
  }
  return owners;
}

function macOwners() {
  const result = spawnSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'], { encoding: 'utf8' });
  if (result.status !== 0 || !result.stdout.trim()) return [];
  return result.stdout.trim().split(/\s+/).map((value) => {
    const pid = Number(value);
    const command = spawnSync('ps', ['-p', value, '-o', 'command='], { encoding: 'utf8' }).stdout.trim();
    return { pid, command, cwd: workspace };
  });
}

function owners() {
  if (process.platform === 'linux') return linuxOwners(readLinuxListeningInodes());
  if (process.platform === 'darwin') return macOwners();
  return [];
}

function isWorkspacePreview(owner) {
  return owner.cwd === workspace && /(?:vite|serve-site\.mjs)/.test(owner.command);
}

const active = owners();
if (!active.length) process.exit(0);

const unexpected = active.filter((owner) => !isWorkspacePreview(owner));
if (unexpected.length) {
  throw new Error(`Refusing to stop a non-preview process on port ${port}: ${unexpected.map((owner) => `${owner.pid} ${owner.command}`).join('; ')}`);
}

for (const owner of active) process.kill(owner.pid, 'SIGTERM');
for (let attempt = 0; attempt < 50 && owners().length; attempt += 1) await new Promise((resolve) => setTimeout(resolve, 100));
for (const owner of owners()) process.kill(owner.pid, 'SIGKILL');
if (owners().length) throw new Error(`Preview server still owns port ${port} after cleanup.`);
