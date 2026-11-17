import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const ALLOWED_CORE_ENTRYPOINTS = new Set([
  path.normalize('backend/src/index.ts'),
  path.normalize('frontend/src/App.jsx'),
]);

const SCAN_ROOTS = [
  path.join(ROOT_DIR, 'backend', 'src'),
  path.join(ROOT_DIR, 'frontend', 'src'),
];

const TV_MODULE_DIRS = [
  path.normalize('backend/src/modules/tv'),
  path.normalize('frontend/src/modules/tv'),
];

const SOURCE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css']);

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(full));
    } else if (SOURCE_EXTS.has(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

function isInsideTvModule(relPath) {
  const norm = path.normalize(relPath);
  return TV_MODULE_DIRS.some((dir) => norm === dir || norm.startsWith(dir + path.sep));
}

const VIOLATION_PATTERNS = [
  /modules\/tv/i,
  /modules\\tv/i,
  /['"`]\/api\/tv\b/i,
  /\bFROM\s+tv\./i,
  /\bJOIN\s+tv\./i,
  /\bINTO\s+tv\./i,
  /\bUPDATE\s+tv\./i,
  /\bDELETE\s+FROM\s+tv\./i,
];

const violations = [];

for (const root of SCAN_ROOTS) {
  for (const filePath of walkFiles(root)) {
    const rel = path.normalize(path.relative(ROOT_DIR, filePath));
    if (isInsideTvModule(rel) || ALLOWED_CORE_ENTRYPOINTS.has(rel)) {
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      for (const pattern of VIOLATION_PATTERNS) {
        if (pattern.test(line)) {
          violations.push({
            file: rel,
            line: idx + 1,
            text: line.trim(),
          });
          break;
        }
      }
    });
  }
}

if (violations.length > 0) {
  console.error('[Boundary Check] FALHA: Core Cinema referencia modules/tv ou schema tv fora dos pontos de entrada permitidos:');
  for (const v of violations) {
    console.error(`  - ${v.file}:${v.line} -> ${v.text}`);
  }
  process.exit(1);
}

console.log('[Boundary Check] OK: Core Cinema está 100% isolado de modules/tv.');
