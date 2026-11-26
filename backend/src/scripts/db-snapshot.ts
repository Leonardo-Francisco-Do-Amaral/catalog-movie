import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import { Pool, PoolClient, types as pgTypes } from 'pg';

const REPO_ROOT = path.resolve(__dirname, '../../..');
const BACKUPS_DIR = path.join(REPO_ROOT, 'backups');

const ENV_CANDIDATES = [
  path.join(REPO_ROOT, 'backend', '.env'),
  path.join(REPO_ROOT, '.env'),
  path.resolve(process.cwd(), 'backend', '.env'),
  path.resolve(process.cwd(), '.env'),
];

for (const envPath of ENV_CANDIDATES) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

// Preserva representação textual exata do PostgreSQL (evita conversão de fuso em DATE/TIMESTAMP e arredondamento em NUMERIC)
const RAW_STRING_OIDS = [
  114,  // json
  1082, // date
  1083, // time
  1114, // timestamp
  1184, // timestamptz
  1186, // interval
  1266, // timetz
  1700, // numeric
  3802, // jsonb
];

function createSnapshotPool(): Pool {
  for (const oid of RAW_STRING_OIDS) {
    pgTypes.setTypeParser(oid, (val: string) => val);
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();
  const useSsl = Boolean(databaseUrl) || String(process.env.DB_SSL || '').toLowerCase() === 'true';

  if (databaseUrl) {
    return new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    });
  }

  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'movie_catalog',
    ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });
}

interface SnapshotColumn {
  name: string;
  dataType: string;
  udtName: string;
}

interface SnapshotTable {
  schema: string;
  name: string;
  columns: SnapshotColumn[];
  rows: Record<string, unknown>[];
}

interface SnapshotSequence {
  schema: string;
  name: string;
  lastValue: string;
  isCalled: boolean;
}

interface SnapshotPayload {
  version: 1;
  createdAt: string;
  schemas: string[];
  tableOrder: string[];
  tables: Record<string, SnapshotTable>;
  sequences: SnapshotSequence[];
}

function quoteIdent(ident: string): string {
  return `"${ident.replace(/"/g, '""')}"`;
}

function fullTableName(schema: string, table: string): string {
  return `${schema}.${table}`;
}

function resolvePgCast(col: SnapshotColumn): string {
  if (col.dataType === 'ARRAY' && col.udtName.startsWith('_')) {
    const base = col.udtName.slice(1).replace(/[^a-zA-Z0-9_]/g, '');
    return `${base}[]`;
  }
  const safe = col.udtName.replace(/[^a-zA-Z0-9_]/g, '');
  return safe || 'text';
}

function sortTablesTopologically(tables: string[], edges: Array<{ child: string; parent: string }>): string[] {
  const deps = new Map<string, Set<string>>();
  const dependents = new Map<string, Set<string>>();

  for (const t of tables) {
    deps.set(t, new Set());
    dependents.set(t, new Set());
  }

  for (const { child, parent } of edges) {
    if (child === parent) continue;
    if (!deps.has(child) || !deps.has(parent)) continue;
    deps.get(child)!.add(parent);
    dependents.get(parent)!.add(child);
  }

  const queue: string[] = [];
  for (const t of tables) {
    if (deps.get(t)!.size === 0) queue.push(t);
  }
  queue.sort();

  const ordered: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    ordered.push(current);
    const children = Array.from(dependents.get(current) || []).sort();
    for (const child of children) {
      const childDeps = deps.get(child)!;
      childDeps.delete(current);
      if (childDeps.size === 0) {
        queue.push(child);
        queue.sort();
      }
    }
  }

  for (const t of tables) {
    if (!ordered.includes(t)) ordered.push(t);
  }
  return ordered;
}

async function captureSnapshot(client: PoolClient): Promise<SnapshotPayload> {
  const tableRes = await client.query<{ schemaname: string; tablename: string }>(`
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    ORDER BY schemaname, tablename
  `);

  const schemas = Array.from(new Set(tableRes.rows.map((r) => r.schemaname))).sort();
  const tableKeys = tableRes.rows.map((r) => fullTableName(r.schemaname, r.tablename));

  const fkRes = await client.query<{
    child_schema: string;
    child_table: string;
    parent_schema: string;
    parent_table: string;
  }>(`
    SELECT
      n1.nspname AS child_schema, c1.relname AS child_table,
      n2.nspname AS parent_schema, c2.relname AS parent_table
    FROM pg_constraint con
    JOIN pg_class c1 ON c1.oid = con.conrelid
    JOIN pg_namespace n1 ON n1.oid = c1.relnamespace
    JOIN pg_class c2 ON c2.oid = con.confrelid
    JOIN pg_namespace n2 ON n2.oid = c2.relnamespace
    WHERE con.contype = 'f'
      AND n1.nspname NOT IN ('pg_catalog', 'information_schema')
  `);

  const tableOrder = sortTablesTopologically(
    tableKeys,
    fkRes.rows.map((r) => ({
      child: fullTableName(r.child_schema, r.child_table),
      parent: fullTableName(r.parent_schema, r.parent_table),
    }))
  );

  const colRes = await client.query<{
    table_schema: string;
    table_name: string;
    column_name: string;
    data_type: string;
    udt_name: string;
    is_generated: string;
  }>(`
    SELECT table_schema, table_name, column_name, data_type, udt_name, is_generated
    FROM information_schema.columns
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      AND is_generated = 'NEVER'
    ORDER BY table_schema, table_name, ordinal_position
  `);

  const columnsByTable = new Map<string, SnapshotColumn[]>();
  for (const c of colRes.rows) {
    const key = fullTableName(c.table_schema, c.table_name);
    const list = columnsByTable.get(key) || [];
    list.push({ name: c.column_name, dataType: c.data_type, udtName: c.udt_name });
    columnsByTable.set(key, list);
  }

  const pkRes = await client.query<{
    table_schema: string;
    table_name: string;
    column_name: string;
  }>(`
    SELECT n.nspname AS table_schema, cls.relname AS table_name, a.attname AS column_name
    FROM pg_constraint con
    JOIN pg_class cls ON cls.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = cls.relnamespace
    JOIN LATERAL unnest(con.conkey) WITH ORDINALITY AS k(attnum, ord) ON TRUE
    JOIN pg_attribute a ON a.attrelid = cls.oid AND a.attnum = k.attnum
    WHERE con.contype = 'p'
      AND n.nspname NOT IN ('pg_catalog', 'information_schema')
    ORDER BY n.nspname, cls.relname, k.ord
  `);

  const pkByTable = new Map<string, string[]>();
  for (const p of pkRes.rows) {
    const key = fullTableName(p.table_schema, p.table_name);
    const list = pkByTable.get(key) || [];
    list.push(p.column_name);
    pkByTable.set(key, list);
  }

  const tables: Record<string, SnapshotTable> = {};
  for (const key of tableOrder) {
    const [schema, name] = key.split('.');
    const columns = columnsByTable.get(key) || [];
    const colSelect = columns.map((c) => quoteIdent(c.name)).join(', ');
    const pks = pkByTable.get(key) || [];
    const orderClause = pks.length > 0 ? `ORDER BY ${pks.map(quoteIdent).join(', ')}` : '';
    const dataRes =
      columns.length > 0
        ? await client.query(`SELECT ${colSelect} FROM ${quoteIdent(schema)}.${quoteIdent(name)} ${orderClause}`)
        : { rows: [] };

    tables[key] = {
      schema,
      name,
      columns,
      rows: dataRes.rows,
    };
  }

  const seqRes = await client.query<{ schemaname: string; sequencename: string }>(`
    SELECT schemaname, sequencename
    FROM pg_sequences
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    ORDER BY schemaname, sequencename
  `);

  const sequences: SnapshotSequence[] = [];
  for (const s of seqRes.rows) {
    const valRes = await client.query<{ last_value: string; is_called: boolean }>(
      `SELECT last_value::text AS last_value, is_called FROM ${quoteIdent(s.schemaname)}.${quoteIdent(s.sequencename)}`
    );
    const v = valRes.rows[0];
    sequences.push({
      schema: s.schemaname,
      name: s.sequencename,
      lastValue: String(v?.last_value ?? '1'),
      isCalled: Boolean(v?.is_called ?? false),
    });
  }

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    schemas,
    tableOrder,
    tables,
    sequences,
  };
}

function summarizeSnapshot(snap: SnapshotPayload): {
  totalTables: number;
  totalRows: number;
  totalSequences: number;
  highlights: string[];
} {
  let totalRows = 0;
  for (const key of snap.tableOrder) {
    totalRows += snap.tables[key]?.rows?.length || 0;
  }

  const count = (key: string) => snap.tables[key]?.rows?.length ?? 0;
  const bazaar = snap.tables['public.guild_bazaar_profile']?.rows?.[0] as Record<string, unknown> | undefined;
  const bonusCoins = Number(bazaar?.bonus_coins || 0);
  const spentCoins = Number(bazaar?.spent_coins || 0);
  const xpSkin = String(bazaar?.equipped_xp_bar_skin || 'classic');
  const labInfinite = Boolean(bazaar?.lab_infinite_money || false);

  return {
    totalTables: snap.tableOrder.length,
    totalRows,
    totalSequences: snap.sequences.length,
    highlights: [
      `Filmes (movies/views): ${count('public.movies')} / ${count('public.movie_views')}`,
      `Séries TV (shows/watch_log): ${count('tv.shows')} / ${count('tv.watch_log')}`,
      `Sessão Secreta (rounds/picks/pool): ${count('public.secret_draw_rounds')} / ${count('public.secret_draw_picks')} / ${count('public.secret_draw_pool')}`,
      `Quimeras: ${count('public.chimera_contracts')} | Bingo boards: ${count('public.bingo_boards')}`,
      `Bazar -> coinsBalance: ${Math.max(0, bonusCoins - spentCoins)} | labInfinite: ${labInfinite} | xpBar: ${xpSkin}`,
    ],
  };
}

function resolveBackupFile(arg?: string): string {
  if (!arg) {
    throw new Error('Informe o arquivo ou nome do snapshot.');
  }
  const direct = path.resolve(arg);
  if (fs.existsSync(direct)) return direct;

  const withExt = arg.endsWith('.json') ? arg : `${arg}.json`;
  const inBackups = path.join(BACKUPS_DIR, withExt);
  if (fs.existsSync(inBackups)) return inBackups;

  throw new Error(`Snapshot não encontrado: "${arg}" (procurei em ${direct} e ${inBackups})`);
}

function writeSnapshotFile(targetPath: string, payload: SnapshotPayload): void {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const tmpPath = `${targetPath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(payload), 'utf8');
  fs.renameSync(tmpPath, targetPath);
}

async function restoreSnapshot(client: PoolClient, snap: SnapshotPayload): Promise<void> {
  const existingRes = await client.query<{ schemaname: string; tablename: string }>(`
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
  `);
  const existingSet = new Set(existingRes.rows.map((r) => fullTableName(r.schemaname, r.tablename)));

  const truncateTargets = snap.tableOrder
    .filter((key) => existingSet.has(key))
    .map((key) => {
      const [schema, name] = key.split('.');
      return `${quoteIdent(schema)}.${quoteIdent(name)}`;
    });

  await client.query('BEGIN');
  try {
    if (truncateTargets.length > 0) {
      await client.query(`TRUNCATE TABLE ${truncateTargets.join(', ')} RESTART IDENTITY CASCADE`);
    }

    for (const key of snap.tableOrder) {
      const table = snap.tables[key];
      if (!table || table.rows.length === 0 || table.columns.length === 0) continue;

      const colNames = table.columns.map((c) => quoteIdent(c.name)).join(', ');
      const colCasts = table.columns.map((c) => resolvePgCast(c));
      const maxBatchRows = Math.max(1, Math.min(200, Math.floor(30000 / table.columns.length)));

      for (let start = 0; start < table.rows.length; start += maxBatchRows) {
        const chunk = table.rows.slice(start, start + maxBatchRows);
        const params: unknown[] = [];
        const tuples: string[] = [];

        for (const row of chunk) {
          const placeholders: string[] = [];
          for (let cIdx = 0; cIdx < table.columns.length; cIdx++) {
            const col = table.columns[cIdx];
            let val = row[col.name];
            if (val === undefined) val = null;
            if ((col.udtName === 'jsonb' || col.udtName === 'json') && val !== null && typeof val !== 'string') {
              val = JSON.stringify(val);
            }
            params.push(val);
            placeholders.push(`$${params.length}::${colCasts[cIdx]}`);
          }
          tuples.push(`(${placeholders.join(', ')})`);
        }

        const insertSql = `INSERT INTO ${quoteIdent(table.schema)}.${quoteIdent(table.name)} (${colNames}) VALUES ${tuples.join(', ')}`;
        await client.query(insertSql, params);
      }

      const verifyRes = await client.query<{ n: number }>(
        `SELECT COUNT(*)::int AS n FROM ${quoteIdent(table.schema)}.${quoteIdent(table.name)}`
      );
      if (verifyRes.rows[0]?.n !== table.rows.length) {
        throw new Error(
          `Divergência ao restaurar ${key}: esperado ${table.rows.length}, encontrado ${verifyRes.rows[0]?.n}`
        );
      }
    }

    for (const seq of snap.sequences) {
      await client.query(`SELECT setval($1::regclass, $2::bigint, $3::boolean)`, [
        `${quoteIdent(seq.schema)}.${quoteIdent(seq.name)}`,
        seq.lastValue,
        seq.isCalled,
      ]);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

async function main(): Promise<void> {
  const [command = 'status', targetArg] = process.argv.slice(2);
  const pool = createSnapshotPool();

  try {
    if (command === 'save') {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const safeName = (targetArg || `snapshot-${stamp}`).replace(/[^a-zA-Z0-9._-]/g, '-');
      const fileName = safeName.endsWith('.json') ? safeName : `${safeName}.json`;
      const outPath = path.join(BACKUPS_DIR, fileName);

      const client = await pool.connect();
      try {
        await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
        const snap = await captureSnapshot(client);
        await client.query('COMMIT');
        writeSnapshotFile(outPath, snap);
        const summary = summarizeSnapshot(snap);
        const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
        console.log(`✅ Snapshot salvo em: ${outPath} (${sizeKb} KB)`);
        console.log(
          `   ${summary.totalTables} tabelas | ${summary.totalRows} registros | ${summary.totalSequences} sequences`
        );
        for (const line of summary.highlights) console.log(`   - ${line}`);
      } finally {
        client.release();
      }
      return;
    }

    if (command === 'status') {
      const client = await pool.connect();
      try {
        const snap = await captureSnapshot(client);
        const summary = summarizeSnapshot(snap);
        console.log(
          `📊 Banco atual: ${summary.totalTables} tabelas | ${summary.totalRows} registros | ${summary.totalSequences} sequences`
        );
        for (const line of summary.highlights) console.log(`   - ${line}`);
      } finally {
        client.release();
      }
      return;
    }

    if (command === 'inspect') {
      const filePath = resolveBackupFile(targetArg);
      const snap = JSON.parse(fs.readFileSync(filePath, 'utf8')) as SnapshotPayload;
      const summary = summarizeSnapshot(snap);
      console.log(`📦 Snapshot: ${filePath} (criado em ${snap.createdAt})`);
      console.log(
        `   ${summary.totalTables} tabelas | ${summary.totalRows} registros | ${summary.totalSequences} sequences`
      );
      for (const line of summary.highlights) console.log(`   - ${line}`);
      return;
    }

    if (command === 'restore') {
      const filePath = resolveBackupFile(targetArg);
      const snap = JSON.parse(fs.readFileSync(filePath, 'utf8')) as SnapshotPayload;
      if (snap.version !== 1 || !Array.isArray(snap.tableOrder)) {
        throw new Error('Arquivo de snapshot inválido.');
      }

      const client = await pool.connect();
      try {
        // Backup preventivo automático antes de sobrescrever qualquer dado atual
        const preStamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const prePath = path.join(BACKUPS_DIR, `auto-before-restore-${preStamp}.json`);
        const currentSnap = await captureSnapshot(client);
        writeSnapshotFile(prePath, currentSnap);
        console.log(`🛡️  Backup preventivo do estado pré-restauração salvo em: ${prePath}`);

        await restoreSnapshot(client, snap);
        const summary = summarizeSnapshot(snap);
        console.log(`♻️  Banco restaurado com sucesso a partir de: ${filePath}`);
        console.log(
          `   ${summary.totalTables} tabelas | ${summary.totalRows} registros | ${summary.totalSequences} sequences verificados`
        );
        for (const line of summary.highlights) console.log(`   - ${line}`);
      } finally {
        client.release();
      }
      return;
    }

    console.error('Uso: db-snapshot <save [nome] | restore <arquivo> | inspect <arquivo> | status>');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('❌ Erro no db-snapshot:', err);
  process.exit(1);
});
