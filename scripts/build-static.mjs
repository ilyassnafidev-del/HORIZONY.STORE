import { spawn } from 'node:child_process';

if (!process.env.npm_execpath) throw new Error('Run this command with npm run build:static.');
const child = spawn(process.execPath, [process.env.npm_execpath, 'run', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, HORISONY_OUTPUT: 'export' },
});
child.once('error', error => { console.error(error); process.exitCode = 1; });
child.once('exit', code => { process.exitCode = code ?? 1; });
