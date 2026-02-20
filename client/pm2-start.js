// PM2 wrapper to start Vite dev server (ES module)
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const vitePath = join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');

const child = spawn('node', [vitePath], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: false
});

child.on('error', (err) => {
  console.error('Failed to start Vite:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

// Handle graceful shutdown
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
