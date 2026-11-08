#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

console.log('[Wrapper] Executando o script de migração compilado/transpilado via tsx...');

const child = spawn('npx', ['tsx', 'src/migration.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  process.exit(code);
});
