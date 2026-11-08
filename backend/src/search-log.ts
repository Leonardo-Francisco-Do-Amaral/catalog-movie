import * as fs from 'fs';

function run() {
  const logPath = 'C:\\Users\\leo_v\\.gemini\\antigravity\\brain\\86d6f50b-e88b-4575-b7fe-52755ac95f9e\\.system_generated\\tasks\\task-560.log';
  if (!fs.existsSync(logPath)) {
    console.error('Arquivo de log não encontrado:', logPath);
    return;
  }
  const content = fs.readFileSync(logPath, 'utf-8');
  const lines = content.split('\n');
  console.log('=== ERROS E AVISOS NA MIGRAÇÃO ===');
  lines.forEach(line => {
    if (line.includes('🔴 [Migration]') || line.includes('warn') || line.includes('Erro ao salvar')) {
      console.log(line);
    }
  });
}

run();
