/* eslint-disable no-control-regex */
/* eslint-disable no-console */
/* eslint-disable no-continue */

import fs from 'fs';
import { execSync, spawn } from 'child_process';
import path from 'path';

type Workspace = `@imtbl/${string}@workspace:${string}`;

const lockFileName = `dev-mode-${process.pid}.lock`;

const childProcesses: ReturnType<typeof spawn>[] = [];

const packageName = process.argv[2];
if (!packageName) {
  console.error('Please specify a package name, e.g., @imtbl/passport');
  process.exit(1);
}

// Function to check for the existence of a lock file in a workspace
const workspaceLocked = (workspacePath: string) => {
  const lockFiles = fs.readdirSync(workspacePath)
    .filter((file) => file.startsWith('dev-mode-') && file.endsWith('.lock'));

  for (const lockFile of lockFiles) {
    const lockFilePath = path.join(workspacePath, lockFile);
    // Extract PID from the lock file name
    const pidMatch = lockFile.match(/dev-mode-(\d+)\.lock/);
    if (pidMatch) {
      const pid = parseInt(pidMatch[1], 10);
      try {
        // Attempt to send a signal 0 to the process. If the process exists, no error is thrown.
        process.kill(pid, 0);
        return true; // PID is still running
      } catch (e: any) {
        if (e.code === 'ESRCH') {
          // No process with the given PID exists, meaning the lock file is stale
          fs.unlinkSync(lockFilePath); // Consider cleaning up the stale lock file
          continue; // Check next lock file if any
        }
        // For other errors (e.g., permission issues), assume the process is still running
        return true;
      }
    }
  }
  return false; // No relevant lock file exists or all found were stale and removed
};

// Function to run the "dev" script in a workspace
const runDevScript = (workspace: Workspace) => {
  const workspacePath = path.join(__dirname, workspace.split('@workspace:')[1]);
  // if lockfile exists and the pid in the lockfile name is still running, skip running the dev script
  if (workspaceLocked(workspacePath)) return;

  const lockFilePath = path.join(workspacePath, lockFileName);

  const devProcess = spawn('yarn', ['run', 'dev'], {
    cwd: workspacePath,
    stdio: 'inherit',
    shell: true, // Use shell to interpret the command correctly on all platforms
  });

  childProcesses.push(devProcess);

  // Write the PID of the dev process to the lock file
  fs.writeFileSync(lockFilePath, '');

  devProcess.on('error', (error) => {
    console.error(`Error running 'dev' script for ${workspace}: ${error}`);
  });
};

const workspaces = (execSync(`yarn workspace ${packageName} info --dependents --name-only --recursive`)
  .toString()
  .trim()
  .split('\n')
  .filter((line) => line.includes('@imtbl') && !line.includes('@npm')))
  .map((line) => line.split('─ ')[1].trim().replace(/\x1B\[[0-9;]*m/g, '') as Workspace);

if (!workspaces.some((workspace) => workspace.split('@workspace')[0] === packageName)) {
  console.error(`No workspaces found for package ${packageName}`);
  process.exit(1);
}

const mainWorkspacePath = workspaces.find((workspace) => workspace.includes(packageName))?.split('@workspace:')[1];

if (!mainWorkspacePath) {
  console.error(`Could not find path for ${packageName}`);
  process.exit(1);
}

const fixedMainWorkspacePath = path.join(__dirname, mainWorkspacePath);

const watchPaths = workspaces
  .filter((workspace) => !workspace.includes(packageName))
  .map((workspace) => {
    if (!fixedMainWorkspacePath) {
      console.error(`Could not find path for ${packageName}`);
      process.exit(1);
    }

    const workspacePath = workspace.split('@workspace:')[1].concat('/dist/index.js');

    // Assuming the script is run from the package directory, make paths relative to it
    const relativePath = path.relative(mainWorkspacePath, workspacePath);
    return relativePath;
  });

const removeLockFile = () => {
  workspaces.forEach((workspace) => {
    const workspacePath = path.join(__dirname, workspace.split('@workspace:')[1]);
    const lockFilePath = path.join(workspacePath, lockFileName);

    if (fs.existsSync(lockFilePath)) {
      fs.rmSync(lockFilePath);
    }
  });
};

if (workspaceLocked(fixedMainWorkspacePath)) {
  console.error(`A lock file and running dev process exists for ${packageName}. Exiting...`);
  process.exit(1);
}

execSync(`yarn workspace ${packageName} build:all`, {
  cwd: __dirname,
  stdio: 'inherit',
});

workspaces.forEach((workspace) => {
  if (!workspace.includes(packageName)) {
    runDevScript(workspace);
  }
});

const tsupCommand = `yarn workspace ${packageName} tsup --watch src --watch ${watchPaths.join(' --watch ')}`;
// eslint-disable-next-line max-len
const tscCommand = `yarn workspace ${packageName} tsc --watch --noEmit false --declaration --emitDeclarationOnly --preserveWatchOutput`;

fs.writeFileSync(path.join(fixedMainWorkspacePath, lockFileName), '');

const [command, ...args] = tsupCommand.split(/\s+/);
const tsupProcess = spawn(command, args, { stdio: 'inherit' });

tsupProcess.on('error', (error) => console.error(`Spawn error: ${error}`));

const [tscCommandName, ...tscArgs] = tscCommand.split(/\s+/);
const tscProcess = spawn(tscCommandName, tscArgs, { stdio: 'inherit' });

tscProcess.on('error', (error) => console.error(`Spawn error: ${error}`));

childProcesses.push(tsupProcess, tscProcess);

const handleClose = () => {
  childProcesses.forEach((child) => child.kill());
  removeLockFile();
  process.exit(0);
};

process.on('SIGINT', handleClose);
process.on('SIGTERM', handleClose);
process.on('close', handleClose);
