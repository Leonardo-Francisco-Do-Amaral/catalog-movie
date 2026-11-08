import { Readable } from 'stream';
import csv from 'csv-parser';
import * as XLSX from 'xlsx';
import pool, { query } from '../config/database';
import {
  fetchMovieDetailsByTitle,
  normalizeCountryName,
  normalizeGenre,
} from './movieIntegration';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ImportRowResult {
  rowNumber: number;
  inputTitle: string;
  inputYear: number | null;
  status: 'imported_api' | 'needs_review' | 'skipped' | 'error';
  message: string;
  movieId?: number;
  movie?: any; // Objeto completo compatível com MovieFormModal para revisão em 1 clique
  suggestedApi?: {
    tmdb_id: number;
    title: string;
    original_title: string;
    release_year: number | null;
    poster_url: string | null;
  };
}

export interface ImportJobState {
  jobId: string;
  fileName: string;
  status: 'running' | 'completed' | 'cancelled' | 'failed';
  total: number;
  processed: number;
  currentTitle: string;
  counts: {
    importedApi: number;
    needsReview: number;
    skipped: number;
    errors: number;
  };
  items: ImportRowResult[];
  errorMessage?: string;
  startedAt: number;
  finishedAt?: number;
  cancelRequested?: boolean;
}

const importJobs = new Map<string, ImportJobState>();

export function getImportJob(jobId: string): ImportJobState | undefined {
  return importJobs.get(jobId);
}

export function cancelImportJob(jobId: string): boolean {
  const job = importJobs.get(jobId);
  if (!job || job.status !== 'running') return false;
  job.cancelRequested = true;
  return true;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function normalizeTitle(title: string): string {
  if (!title) return '';
  return title
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function normalizeHeaderKey(key: string): string {
  return key
    .toString()
    .replace(/^\uFEFF/, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function normalizeTag(tagName: string): string {
  const clean = tagName.trim().replace(/^[-/]+|[-/]+$/g, '').trim();
  const lower = clean.toLowerCase();

  if (!clean) return '';
  if (lower === 'gori' || lower === 'gore') return 'Gore';
  if (lower.includes('lgbt') || lower.includes('persoangem') || lower.includes('persomagem') || lower.includes('presonagem')) return 'Personagem LGBT';
  if (lower.includes('colegio') || lower.includes('colegico') || lower.includes('cologio') || lower.includes('escola')) return 'Colegio/Escola';
  if (lower.startsWith('emoci') || lower.startsWith('emocin') || lower.includes('emocionan')) return 'Emocionante';
  if (lower.includes('criança malvada') || lower.includes('crianção malvada') || lower.includes('crianca malvada')) return 'Criança Malvada';
  if (lower.includes('preconceito') || lower.includes('precoceito')) return 'Preconceito';
  if (
    lower.includes('super hero') ||
    lower.includes('superhero') ||
    lower === 'heroi' ||
    lower === 'heroí' ||
    lower.includes('super poder') ||
    lower.includes('superpoder')
  ) {
    return 'Super Poder';
  }
  if (lower.includes('viajem') || lower.includes('viagem') || lower.includes('viajaem')) return 'Viagem no Tempo';
  if (lower === 'alies' || lower === 'aliens') return 'Aliens';
  if (lower.includes('multiver')) return 'Multiverso';
  if (lower.includes('parodia') || lower.includes('paródia')) return 'Paródia';
  if (lower.includes('demonio') || lower.includes('demônio')) return 'Demônio';
  if (lower.includes('fatos reais') || lower.includes('fatos reias')) return 'Fatos Reais';
  if (lower.includes('tragico') || lower.includes('trágico')) return 'Trágico';
  if (lower.includes('lobisomen') || lower.includes('lobisomem')) return 'Lobisomem';
  if (lower.includes('religiao') || lower.includes('religião') || lower.includes('religão')) return 'Religião';
  if (lower === 'preto branco' || lower === 'preto e branco') return 'Preto e branco';
  if (lower === 'x-men' || lower === 'x-man' || lower === 'x-men ') return 'X-Men';
  if (lower.includes('final epico') || lower.includes('final épico')) return 'Final Epico';
  if (lower === 'x' || lower === 'men' || lower === 'man') return '';

  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function sanitizePlatform(rawPlatform?: string): string {
  if (!rawPlatform || !rawPlatform.trim()) return 'Não Informado';
  const p = rawPlatform.toLowerCase().trim();
  if (p.includes('aplle') || p.includes('apple')) return 'Apple TV+';
  if (p.includes('cinema')) return 'Cinema';
  if (p.includes('internet')) return 'Internet';
  if (p.includes('netflix')) return 'Netflix';
  if (p.includes('prime')) return 'Prime Video';
  if (p.includes('disney')) return 'Disney+';
  if (p.includes('hbo') || p === 'max') return 'HBO MAX';
  return rawPlatform.trim();
}

function parseMonth(rawMonth: any): number | null {
  if (rawMonth === undefined || rawMonth === null) return null;
  const s = String(rawMonth).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (!s) return null;
  const num = parseInt(s, 10);
  if (!isNaN(num) && num >= 1 && num <= 12) return num;

  const monthsMap: Record<string, number> = {
    jan: 1, janeiro: 1,
    fev: 2, fevereiro: 2,
    mar: 3, marco: 3,
    abr: 4, abril: 4,
    mai: 5, maio: 5,
    jun: 6, junho: 6,
    jul: 7, julho: 7,
    ago: 8, agosto: 8,
    set: 9, setembro: 9,
    out: 10, outubro: 10,
    nov: 11, novembro: 11,
    dez: 12, dezembro: 12,
  };
  return monthsMap[s] || null;
}

function parseDecimal(rawVal: any): number | null {
  if (rawVal === undefined || rawVal === null) return null;
  if (typeof rawVal === 'number') return isNaN(rawVal) ? null : rawVal;
  const s = String(rawVal).trim().replace(',', '.');
  if (!s || s.toLowerCase() === 'n' || s.toLowerCase() === 'n/a' || s.toLowerCase() === 'nao' || s.toLowerCase() === 'não') {
    return null;
  }
  const num = parseFloat(s);
  return isNaN(num) ? null : num;
}

function parseIntSafe(rawVal: any): number | null {
  if (rawVal === undefined || rawVal === null) return null;
  if (typeof rawVal === 'number') return isNaN(rawVal) ? null : Math.round(rawVal);
  const s = String(rawVal).trim().replace(/\./g, '').replace(/,/g, '');
  if (!s || s.toLowerCase() === 'n' || s.toLowerCase() === 'n/a' || s.toLowerCase() === 'nao' || s.toLowerCase() === 'não') {
    return null;
  }
  const num = parseInt(s, 10);
  return isNaN(num) ? null : num;
}

/**
 * Lê um buffer CSV ou Excel (.xlsx, .xlsm, .xls) e devolve array de objetos.
 */
export async function parseSpreadsheetBuffer(buffer: Buffer, originalName: string): Promise<any[]> {
  const ext = originalName.toLowerCase().split('.').pop() || '';

  if (ext === 'csv') {
    const content = buffer.toString('utf8').replace(/^\uFEFF/, '');
    const firstLine = content.split(/\r?\n/)[0] || '';
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const separator = semicolonCount > commaCount ? ';' : ',';

    return new Promise((resolve, reject) => {
      const results: any[] = [];
      Readable.from(content)
        .pipe(csv({ separator }))
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
  }

  // Planilhas Excel (.xlsx, .xlsm, .xls)
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error(' Nenhuma aba encontrada no arquivo Excel.');
  }

  // Procura aba chamada "Filmes" ou a primeira aba que contenha cabeçalhos conhecidos
  let targetSheetName = workbook.SheetNames.find((n) => n.trim().toLowerCase() === 'filmes');
  if (!targetSheetName) {
    for (const sheetName of workbook.SheetNames) {
      const preview = XLSX.utils.sheet_to_json<any>(workbook.Sheets[sheetName], { header: 1 });
      if (preview.length > 0 && Array.isArray(preview[0])) {
        const headersNorm = preview[0].map((h: any) => normalizeHeaderKey(String(h || '')));
        if (
          headersNorm.some((h: string) =>
            ['nomeoriginal', 'traducao', 'titulo', 'filme', 'minhanota'].includes(h)
          )
        ) {
          targetSheetName = sheetName;
          break;
        }
      }
    }
  }
  if (!targetSheetName) {
    targetSheetName = workbook.SheetNames[0];
  }

  const sheet = workbook.Sheets[targetSheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
}

/**
 * Gera um arquivo .xlsx limpo de modelo para o usuário preencher novos filmes.
 */
export function generateTemplateXlsxBuffer(): Buffer {
  const wb = XLSX.utils.book_new();

  const sampleRows = [
    {
      'Nome Original': 'Dune: Part Two',
      'Tradução': 'Duna: Parte 2',
      'Ano do filme': 2024,
      'minha nota': 9.25,
      'Mês visto': 3,
      'ano visto': 2026,
      'Áudio': 'Legendado',
      'Visto em': 'HBO MAX',
      'Tag': 'Final Epico - Ficção - Visual Incrível',
      'Clasificação': 'Quase espetacular',
      'Oscar ganho': '',
      'nomeação a óscar': '',
      'Distribuição': 'Warner Bros.',
      'IMDb ID': '',
    },
  ];

  const wsFilmes = XLSX.utils.json_to_sheet(sampleRows);
  wsFilmes['!cols'] = [
    { wch: 28 }, // Nome Original
    { wch: 28 }, // Tradução
    { wch: 14 }, // Ano do filme
    { wch: 12 }, // minha nota
    { wch: 11 }, // Mês visto
    { wch: 11 }, // ano visto
    { wch: 14 }, // Áudio
    { wch: 18 }, // Visto em
    { wch: 38 }, // Tag
    { wch: 28 }, // Clasificação
    { wch: 13 }, // Oscar ganho
    { wch: 17 }, // nomeação a óscar
    { wch: 20 }, // Distribuição
    { wch: 14 }, // IMDb ID
  ];
  XLSX.utils.book_append_sheet(wb, wsFilmes, 'Filmes');

  const instructions = [
    { Coluna: 'Nome Original', Obrigatorio: 'Recomendado', Explicacao: 'Título original do filme (ajuda a cravar 100% na API). Preencha este, a Tradução, ou ambos.' },
    { Coluna: 'Tradução', Obrigatorio: 'Recomendado', Explicacao: 'Título em português.' },
    { Coluna: 'Ano do filme', Obrigatorio: 'Sim (Recomendado)', Explicacao: 'Ano de lançamento (evita confundir remakes ou filmes de mesmo nome).' },
    { Coluna: 'minha nota', Obrigatorio: 'Sim', Explicacao: 'Sua nota pessoal de 0 a 10 (ex: 8,75 ou 9.581).' },
    { Coluna: 'Mês visto', Obrigatorio: 'Opcional', Explicacao: 'Número do mês de 1 a 12 (ou nome do mês).' },
    { Coluna: 'ano visto', Obrigatorio: 'Sim', Explicacao: 'Ano em que você assistiu ao filme (ex: 2025, 2026).' },
    { Coluna: 'Áudio', Obrigatorio: 'Opcional', Explicacao: 'Dublado, Legendado ou Original.' },
    { Coluna: 'Visto em', Obrigatorio: 'Opcional', Explicacao: 'Plataforma onde assistiu (Netflix, Cinema, Prime Video, HBO MAX, etc.).' },
    { Coluna: 'Tag', Obrigatorio: 'Opcional', Explicacao: 'Suas tags separadas por " - " ou vírgula (ex: Final Epico - Gore - Plot Twist).' },
    { Coluna: 'Clasificação', Obrigatorio: 'Opcional', Explicacao: 'Sua crítica, observação ou frase resumo.' },
    { Coluna: 'Oscar ganho / nomeação a óscar', Obrigatorio: 'Opcional', Explicacao: 'Deixe em branco para usar detecção automática (vitórias) ou informe manualmente.' },
    { Coluna: 'Distribuição', Obrigatorio: 'Opcional', Explicacao: 'Distribuidora comercial, caso queira filtrar por ela.' },
    { Coluna: 'IMDb ID', Obrigatorio: 'Opcional', Explicacao: 'Ex: tt15239678. Só preencha para curtas obscuros ou títulos muito ambíguos.' },
    { Coluna: 'AUTOMÁTICO PELA API', Obrigatorio: 'Não preencher!', Explicacao: 'Capa/Pôster, Sinopse, Países, Gêneros, Diretores, Roteiristas, Estúdios, Duração, Nota IMDb, Metacritic, Rotten Tomatoes e Votos vêm sozinhos!' },
  ];
  const wsInfo = XLSX.utils.json_to_sheet(instructions);
  wsInfo['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 95 }];
  XLSX.utils.book_append_sheet(wb, wsInfo, 'Instruções');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

/**
 * Extrai campos padronizados de uma linha qualquer da planilha (formato antigo ou novo).
 */
function extractRowFields(rawRow: Record<string, any>) {
  const norm: Record<string, any> = {};
  for (const key of Object.keys(rawRow)) {
    const nk = normalizeHeaderKey(key);
    if (nk && (norm[nk] === undefined || norm[nk] === '')) {
      norm[nk] = rawRow[key];
    }
  }

  const getStr = (...keys: string[]): string => {
    for (const k of keys) {
      if (norm[k] !== undefined && norm[k] !== null && String(norm[k]).trim() !== '') {
        return String(norm[k]).trim();
      }
    }
    return '';
  };

  const originalTitle = getStr('nomeoriginal', 'titulooriginal', 'originaltitle');
  const translatedTitle = getStr('traducao', 'titulo', 'tituloemportugues', 'filme', 'nome');
  const releaseYear = parseIntSafe(getStr('anodofilme', 'ano', 'anolancamento', 'anodelancamento', 'releaseyear'));
  const userRating = parseDecimal(getStr('minhanota', 'nota', 'notapessoal', 'userrating')) ?? 0;
  const monthSeen = parseMonth(getStr('mesvisto', 'mes'));
  const yearSeen = parseIntSafe(getStr('anovisto'));

  let audioType: string | null = getStr('audio', 'tipodeaudio') || null;
  if (audioType) {
    const la = audioType.toLowerCase();
    if (la === 'dublado') audioType = 'Dublado';
    else if (la === 'legendado') audioType = 'Legendado';
    else if (la.includes('youtube')) audioType = 'Legendado pelo Youtube';
    else if (la === 'original') audioType = 'Original';
  }

  const rawPlat = getStr('vistoem', 'plataforma', 'ondevi');
  const platform = rawPlat ? sanitizePlatform(rawPlat) : null;
  const reviewNotes = getStr('clasificacao', 'classificacao', 'critica', 'minhacritica', 'observacoes', 'observacao', 'resenha') || null;

  const rawTags = getStr('tag', 'tags', 'minhastags');
  const customTagsRaw = rawTags
    ? rawTags
        .split(/\s+-\s*|\s*-\s+|,|;/)
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  const customTags = Array.from(new Set(customTagsRaw.map(normalizeTag))).filter(Boolean);

  const oscarWinsManual = parseIntSafe(getStr('oscarganho', 'oscarsganhos', 'vitoriasoscar'));
  const oscarNomsManual = parseIntSafe(getStr('nomeacaoaoscar', 'indicacoesoscar', 'indicacoes', 'nomeacoesoscar'));

  const distributorManual = getStr('distribuicao', 'distribuidora') || null;
  const manualImdbId = getStr('imdbid', 'idimdb') || undefined;
  const manualTmdbIdNum = parseIntSafe(getStr('tmdbid', 'idtmdb'));
  const manualTmdbId = manualTmdbIdNum && manualTmdbIdNum > 0 ? manualTmdbIdNum : undefined;

  const rawCountries = getStr('paisdeorigem', 'pais', 'paises');
  const manualCountries = rawCountries
    ? Array.from(
        new Set(
          rawCountries
            .split(/\s+-\s*|\s*-\s+|,|\/|;/)
            .map((c) => normalizeCountryName(c))
            .filter(Boolean)
        )
      )
    : [];

  // Campos extras opcionais de fallback (caso venham da planilha antiga de 25 colunas)
  const fallbackRuntime = parseIntSafe(getStr('duracaoemminutos', 'duracao', 'minutos'));
  const fallbackVotes = parseIntSafe(getStr('totaldeanaliseimdb', 'votos', 'qtddevotos'));
  const fallbackImdbRating = parseDecimal(getStr('imdb', 'notaimdb'));
  const fallbackMetacriticRaw = parseDecimal(getStr('metascore', 'metacritic'));
  const fallbackMetacritic =
    fallbackMetacriticRaw !== null
      ? fallbackMetacriticRaw <= 10
        ? Math.round(fallbackMetacriticRaw * 10)
        : Math.round(fallbackMetacriticRaw)
      : null;

  const fallbackGenres = getStr('generotema', 'genero', 'generos')
    ? getStr('generotema', 'genero', 'generos')
        .split(/\s+-\s*|\s*-\s+|,/)
        .map((g) => normalizeGenre(g.trim()))
        .filter(Boolean)
    : [];

  const fallbackDirectors = getStr('direcao', 'diretor', 'diretores')
    ? getStr('direcao', 'diretor', 'diretores')
        .split(/\s+-\s*|\s*-\s+|,/)
        .map((d) => d.trim())
        .filter(Boolean)
    : [];

  const fallbackWriters = getStr('roteiro', 'roteirista', 'roteiristas')
    ? getStr('roteiro', 'roteirista', 'roteiristas')
        .split(/\s+-\s*|\s*-\s+|,/)
        .map((w) => w.trim())
        .filter(Boolean)
    : [];

  const fallbackStudios = getStr('producaoestudio', 'estudio', 'estudios')
    ? getStr('producaoestudio', 'estudio', 'estudios')
        .split(/\s+-\s*|\s*-\s+|,/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return {
    originalTitle,
    translatedTitle,
    releaseYear,
    userRating,
    monthSeen,
    yearSeen,
    audioType,
    platform,
    reviewNotes,
    customTags,
    oscarWinsManual,
    oscarNomsManual,
    distributorManual,
    manualImdbId,
    manualTmdbId,
    manualCountries,
    fallbackRuntime,
    fallbackVotes,
    fallbackImdbRating,
    fallbackMetacritic,
    fallbackGenres,
    fallbackDirectors,
    fallbackWriters,
    fallbackStudios,
  };
}

/**
 * Busca o filme recém-cadastrado completo (com arrays agregados) para o modal de Revisão em 1 Clique.
 */
async function fetchFullMovieById(movieId: number): Promise<any | null> {
  const sql = `
    SELECT mv.id, m.id as movie_id, m.imdb_id, m.tmdb_id, m.title, m.original_title, m.release_year, m.runtime, m.synopsis, m.poster_url, m.imdb_rating, m.metacritic_score, m.rotten_tomatoes_score, m.is_custom, m.oscar_wins, m.oscar_nominations, m.vote_count, m.distributor,
           mv.user_rating, mv.month_seen, mv.year_seen, mv.audio_type, mv.platform, mv.review_notes, mv.watched_at,
           COALESCE(array_agg(DISTINCT ut.name) FILTER (WHERE ut.name IS NOT NULL), '{}') as tags,
           COALESCE(array_agg(DISTINCT ag.name) FILTER (WHERE ag.name IS NOT NULL), '{}') as genres,
           COALESCE(array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL), '{}') as countries,
           COALESCE(array_agg(DISTINCT d.name) FILTER (WHERE d.name IS NOT NULL), '{}') as directors,
           COALESCE(array_agg(DISTINCT w.name) FILTER (WHERE w.name IS NOT NULL), '{}') as writers,
           COALESCE(array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}') as studios
    FROM movie_views mv
    JOIN movies m ON mv.movie_id = m.id
    LEFT JOIN movie_tags mt ON m.id = mt.movie_id
    LEFT JOIN user_tags ut ON mt.tag_id = ut.id
    LEFT JOIN movie_api_genres mag ON m.id = mag.movie_id
    LEFT JOIN api_genres ag ON mag.genre_id = ag.id
    LEFT JOIN movie_countries mc ON m.id = mc.movie_id
    LEFT JOIN countries c ON mc.country_id = c.id
    LEFT JOIN movie_directors md ON m.id = md.movie_id
    LEFT JOIN directors d ON md.director_id = d.id
    LEFT JOIN movie_writers mw ON m.id = mw.movie_id
    LEFT JOIN writers w ON mw.writer_id = w.id
    LEFT JOIN movie_studios ms ON m.id = ms.movie_id
    LEFT JOIN studios s ON ms.studio_id = s.id
    WHERE m.id = $1
    GROUP BY m.id, mv.id
    LIMIT 1;
  `;
  const res = await query(sql, [movieId]);
  return res.rows[0] || null;
}

/**
 * Inicia o processamento assíncrono incremental da planilha (NUNCA apaga registros existentes).
 */
export async function startSpreadsheetImportJob(buffer: Buffer, fileName: string): Promise<ImportJobState> {
  const rawRows = await parseSpreadsheetBuffer(buffer, fileName);

  // Filtra linhas completamente vazias
  const validRows = rawRows
    .map((raw, index) => ({ raw, rowNumber: index + 2, fields: extractRowFields(raw) }))
    .filter((item) => item.fields.originalTitle || item.fields.translatedTitle || item.fields.manualImdbId || item.fields.manualTmdbId);

  const jobId = `import_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const job: ImportJobState = {
    jobId,
    fileName,
    status: 'running',
    total: validRows.length,
    processed: 0,
    currentTitle: validRows.length > 0 ? (validRows[0].fields.translatedTitle || validRows[0].fields.originalTitle) : '',
    counts: {
      importedApi: 0,
      needsReview: 0,
      skipped: 0,
      errors: 0,
    },
    items: [],
    startedAt: Date.now(),
  };

  importJobs.set(jobId, job);

  // Dispara execução em background sem bloquear a resposta HTTP inicial
  processImportJob(job, validRows).catch((err) => {
    console.error(`[Importer] Falha crítica no job ${jobId}:`, err);
    job.status = 'failed';
    job.errorMessage = err.message;
    job.finishedAt = Date.now();
  });

  return job;
}

async function processImportJob(
  job: ImportJobState,
  rows: Array<{ raw: any; rowNumber: number; fields: ReturnType<typeof extractRowFields> }>
) {
  // Carrega mapa rápido dos filmes existentes no banco para evitar chamadas desnecessárias à API
  const existingRes = await query(
    'SELECT id, title, original_title, original_csv_title, release_year, imdb_id, tmdb_id FROM movies'
  );

  const byImdb = new Map<string, { id: number; title: string }>();
  const byTmdb = new Map<number, { id: number; title: string }>();
  const existingList = existingRes.rows.map((r: any) => {
    if (r.imdb_id) byImdb.set(String(r.imdb_id).trim(), { id: r.id, title: r.title });
    if (r.tmdb_id) byTmdb.set(Number(r.tmdb_id), { id: r.id, title: r.title });
    return {
      id: r.id as number,
      title: r.title as string,
      normTitle: normalizeTitle(r.title || ''),
      normOrig: normalizeTitle(r.original_title || ''),
      normCsv: normalizeTitle(r.original_csv_title || ''),
      year: r.release_year ? Number(r.release_year) : null,
    };
  });

  const findExistingLocal = (
    origTitle: string,
    transTitle: string,
    year: number | null,
    imdbId?: string,
    tmdbId?: number
  ): { id: number; title: string } | null => {
    if (imdbId && byImdb.has(imdbId.trim())) return byImdb.get(imdbId.trim())!;
    if (tmdbId && byTmdb.has(tmdbId)) return byTmdb.get(tmdbId)!;

    const nOrig = normalizeTitle(origTitle);
    const nTrans = normalizeTitle(transTitle);

    for (const ex of existingList) {
      const titleHit =
        (nOrig && (ex.normOrig === nOrig || ex.normTitle === nOrig || ex.normCsv === nOrig)) ||
        (nTrans && (ex.normTitle === nTrans || ex.normOrig === nTrans || ex.normCsv === nTrans));

      if (!titleHit) continue;

      if (year && ex.year) {
        if (Math.abs(year - ex.year) <= 1) {
          return { id: ex.id, title: ex.title };
        }
      } else {
        return { id: ex.id, title: ex.title };
      }
    }
    return null;
  };

  for (let i = 0; i < rows.length; i++) {
    if (job.cancelRequested) {
      job.status = 'cancelled';
      job.finishedAt = Date.now();
      return;
    }

    const { rowNumber, fields } = rows[i];
    const displayTitle = fields.translatedTitle || fields.originalTitle || fields.manualImdbId || `Linha ${rowNumber}`;
    job.currentTitle = displayTitle;

    // 1. Checagem rápida local (pula filmes que já estão cadastrados no banco!)
    const localHit = findExistingLocal(
      fields.originalTitle,
      fields.translatedTitle,
      fields.releaseYear,
      fields.manualImdbId,
      fields.manualTmdbId
    );

    if (localHit) {
      job.counts.skipped++;
      job.items.push({
        rowNumber,
        inputTitle: displayTitle,
        inputYear: fields.releaseYear,
        status: 'skipped',
        message: `Já existe no catálogo ("${localHit.title}"). Mantido sem alterações.`,
        movieId: localHit.id,
      });
      job.processed++;
      continue;
    }

    // 2. Busca automática nas APIs (TMDB + OMDb)
    let searchPrimary = fields.originalTitle || fields.translatedTitle;
    let searchFallback = fields.originalTitle && fields.translatedTitle ? fields.translatedTitle : undefined;
    let searchYear = fields.releaseYear || undefined;

    if (fields.originalTitle === 'It' || fields.translatedTitle === 'It: A Coisa') {
      searchPrimary = 'It';
      searchYear = 2017;
    }

    let apiMovieData: Awaited<ReturnType<typeof fetchMovieDetailsByTitle>> | null = null;
    let isConfidentApiMatch = false;
    let reviewReason = '';

    try {
      apiMovieData = await fetchMovieDetailsByTitle(
        searchPrimary,
        searchYear,
        fields.manualTmdbId,
        fields.manualImdbId,
        searchFallback
      );

      // Verifica se o ID retornado pela API já existe no catálogo (ex: grafia levemente diferente na planilha)
      const apiDuplicate =
        (apiMovieData.imdb_id && byImdb.get(apiMovieData.imdb_id)) ||
        (apiMovieData.tmdb_id && byTmdb.get(apiMovieData.tmdb_id));

      if (apiDuplicate) {
        job.counts.skipped++;
        job.items.push({
          rowNumber,
          inputTitle: displayTitle,
          inputYear: fields.releaseYear,
          status: 'skipped',
          message: `Já existe no catálogo como "${apiDuplicate.title}" (mesmo ID oficial).`,
          movieId: apiDuplicate.id,
        });
        job.processed++;
        await sleep(120);
        continue;
      }

      // Validação inteligente de correspondência
      if (fields.manualTmdbId || fields.manualImdbId) {
        isConfidentApiMatch = true;
      } else {
        const normApiTitle = normalizeTitle(apiMovieData.title || '');
        const normApiOrig = normalizeTitle(apiMovieData.original_title || '');
        const normInOrig = normalizeTitle(fields.originalTitle);
        const normInTrans = normalizeTitle(fields.translatedTitle);

        const isCloseString = (a: string, b: string) => {
          if (!a || !b) return false;
          if (a === b) return true;
          const minLen = Math.min(a.length, b.length);
          const maxLen = Math.max(a.length, b.length);
          if (minLen >= 5 && (a.startsWith(b) || b.startsWith(a)) && minLen / maxLen >= 0.78) {
            return true;
          }
          return false;
        };

        const titleMatches =
          isCloseString(normApiTitle, normInTrans) ||
          isCloseString(normApiOrig, normInTrans) ||
          isCloseString(normApiTitle, normInOrig) ||
          isCloseString(normApiOrig, normInOrig);

        let yearMatches = true;
        if (fields.releaseYear && apiMovieData.release_year) {
          yearMatches = Math.abs(apiMovieData.release_year - fields.releaseYear) <= 1;
        }

        isConfidentApiMatch = titleMatches && yearMatches;

        if (!isConfidentApiMatch) {
          reviewReason = `API sugeriu "${apiMovieData.title}" (${apiMovieData.release_year || 'S/Ano'}), diferente da planilha. Revise com 1 clique!`;
        }
      }
    } catch (err: any) {
      apiMovieData = null;
      isConfidentApiMatch = false;
      reviewReason = 'Não encontrado automaticamente no TMDB. Clique em Revisar para buscar ou completar.';
    }

    // 3. Monta payload para salvar no banco (ou completo da API, ou rascunho seguro com seus dados pessoais)
    const dbClient = await pool.connect();
    try {
      await dbClient.query('BEGIN');

      const useApi = isConfidentApiMatch && apiMovieData !== null;

      const finalTitle = useApi
        ? apiMovieData!.title
        : fields.translatedTitle || fields.originalTitle || displayTitle;
      const finalOrigTitle = useApi
        ? apiMovieData!.original_title || fields.originalTitle || null
        : fields.originalTitle || null;
      const finalYear = useApi
        ? apiMovieData!.release_year ?? fields.releaseYear
        : fields.releaseYear;
      const finalRuntime = useApi
        ? apiMovieData!.runtime ?? fields.fallbackRuntime
        : fields.fallbackRuntime;
      const finalSynopsis = useApi ? apiMovieData!.synopsis : null;
      const finalPoster = useApi ? apiMovieData!.poster_url : null;
      const finalImdbId = useApi ? apiMovieData!.imdb_id : fields.manualImdbId || null;
      const finalTmdbId = useApi && apiMovieData!.tmdb_id > 0 ? apiMovieData!.tmdb_id : null;
      const finalImdbRating = useApi ? apiMovieData!.imdb_rating ?? fields.fallbackImdbRating : fields.fallbackImdbRating;
      const finalMetacritic = useApi ? apiMovieData!.metacritic_score ?? fields.fallbackMetacritic : fields.fallbackMetacritic;
      const finalRotten = useApi ? apiMovieData!.rotten_tomatoes_score : null;
      const finalVotes = useApi ? apiMovieData!.vote_count ?? fields.fallbackVotes ?? 0 : fields.fallbackVotes ?? 0;

      const finalOscarWins =
        fields.oscarWinsManual !== null
          ? fields.oscarWinsManual
          : useApi
            ? apiMovieData!.oscar_wins || 0
            : 0;
      const finalOscarNoms =
        fields.oscarNomsManual !== null
          ? fields.oscarNomsManual
          : useApi
            ? Math.max(finalOscarWins, apiMovieData!.oscar_nominations || 0)
            : finalOscarWins;

      const finalDistributor =
        fields.distributorManual || (useApi ? apiMovieData!.distributor || null : null);

      const finalCountries =
        fields.manualCountries.length > 0
          ? fields.manualCountries
          : useApi
            ? apiMovieData!.countries || []
            : [];

      const finalGenres = useApi
        ? [...(apiMovieData!.genres || [])]
        : [...fields.fallbackGenres];

      if (finalRuntime && finalRuntime > 0 && finalRuntime < 50 && !finalGenres.includes('Curta')) {
        finalGenres.push('Curta');
      }

      const finalDirectors = useApi ? apiMovieData!.directors || [] : fields.fallbackDirectors;
      const finalWriters = useApi ? apiMovieData!.writers || [] : fields.fallbackWriters;
      const finalStudios = useApi ? apiMovieData!.studios || [] : fields.fallbackStudios;

      const insertRes = await dbClient.query(
        `INSERT INTO movies (
          imdb_id, tmdb_id, title, original_title, release_year, runtime, synopsis, poster_url,
          imdb_rating, metacritic_score, rotten_tomatoes_score, raw_api_data, is_custom,
          oscar_wins, oscar_nominations, original_csv_title, vote_count, distributor
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        RETURNING id`,
        [
          finalImdbId,
          finalTmdbId,
          finalTitle,
          finalOrigTitle,
          finalYear,
          finalRuntime,
          finalSynopsis,
          finalPoster,
          finalImdbRating,
          finalMetacritic,
          finalRotten,
          useApi ? JSON.stringify(apiMovieData!.raw_api_data) : null,
          !useApi, // Rascunhos sem API ficam como is_custom = true
          finalOscarWins,
          finalOscarNoms,
          displayTitle,
          finalVotes,
          finalDistributor,
        ]
      );

      const newMovieId: number = insertRes.rows[0].id;

      // Diretores
      for (const name of finalDirectors) {
        if (!name.trim()) continue;
        const r = await dbClient.query(
          `INSERT INTO directors (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
          [name.trim()]
        );
        await dbClient.query(
          `INSERT INTO movie_directors (movie_id, director_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [newMovieId, r.rows[0].id]
        );
      }

      // Roteiristas
      for (const name of finalWriters) {
        if (!name.trim()) continue;
        const r = await dbClient.query(
          `INSERT INTO writers (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
          [name.trim()]
        );
        await dbClient.query(
          `INSERT INTO movie_writers (movie_id, writer_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [newMovieId, r.rows[0].id]
        );
      }

      // Estúdios
      for (const name of finalStudios) {
        if (!name.trim()) continue;
        const r = await dbClient.query(
          `INSERT INTO studios (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
          [name.trim()]
        );
        await dbClient.query(
          `INSERT INTO movie_studios (movie_id, studio_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [newMovieId, r.rows[0].id]
        );
      }

      // Gêneros
      for (const name of finalGenres) {
        const ng = normalizeGenre(name);
        if (!ng) continue;
        const r = await dbClient.query(
          `INSERT INTO api_genres (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
          [ng]
        );
        await dbClient.query(
          `INSERT INTO movie_api_genres (movie_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [newMovieId, r.rows[0].id]
        );
      }

      // Países (vindos automaticamente do TMDB em Português ou da planilha!)
      for (const name of finalCountries) {
        if (!name.trim()) continue;
        const r = await dbClient.query(
          `INSERT INTO countries (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
          [name.trim()]
        );
        await dbClient.query(
          `INSERT INTO movie_countries (movie_id, country_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [newMovieId, r.rows[0].id]
        );
      }

      // Tags do usuário
      for (const tagName of fields.customTags) {
        const slug = slugify(tagName);
        if (!tagName || !slug) continue;
        const tagCheck = await dbClient.query('SELECT id FROM user_tags WHERE name = $1 OR slug = $2', [tagName, slug]);
        let tagId: number;
        if (tagCheck.rows.length > 0) {
          tagId = tagCheck.rows[0].id;
        } else {
          const tr = await dbClient.query('INSERT INTO user_tags (name, slug) VALUES ($1, $2) RETURNING id', [tagName, slug]);
          tagId = tr.rows[0].id;
        }
        await dbClient.query(
          `INSERT INTO movie_tags (movie_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [newMovieId, tagId]
        );
      }

      // Visualização pessoal (movie_views)
      await dbClient.query(
        `INSERT INTO movie_views (movie_id, user_rating, month_seen, year_seen, audio_type, platform, review_notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          newMovieId,
          fields.userRating,
          fields.monthSeen,
          fields.yearSeen,
          fields.audioType,
          fields.platform,
          fields.reviewNotes,
        ]
      );

      await dbClient.query('COMMIT');

      // Registra em memória para evitar duplicatas dentro da própria planilha
      if (finalImdbId) byImdb.set(finalImdbId, { id: newMovieId, title: finalTitle });
      if (finalTmdbId) byTmdb.set(finalTmdbId, { id: newMovieId, title: finalTitle });
      existingList.push({
        id: newMovieId,
        title: finalTitle,
        normTitle: normalizeTitle(finalTitle),
        normOrig: normalizeTitle(finalOrigTitle || ''),
        normCsv: normalizeTitle(displayTitle),
        year: finalYear,
      });

      if (useApi) {
        job.counts.importedApi++;
        job.items.push({
          rowNumber,
          inputTitle: displayTitle,
          inputYear: fields.releaseYear,
          status: 'imported_api',
          message: `Importado com API: "${finalTitle}" (${finalYear || 'S/Ano'})`,
          movieId: newMovieId,
        });
      } else {
        job.counts.needsReview++;
        const fullMovie = await fetchFullMovieById(newMovieId);
        job.items.push({
          rowNumber,
          inputTitle: displayTitle,
          inputYear: fields.releaseYear,
          status: 'needs_review',
          message: reviewReason,
          movieId: newMovieId,
          movie: fullMovie,
          suggestedApi: apiMovieData
            ? {
                tmdb_id: apiMovieData.tmdb_id,
                title: apiMovieData.title,
                original_title: apiMovieData.original_title,
                release_year: apiMovieData.release_year,
                poster_url: apiMovieData.poster_url,
              }
            : undefined,
        });
      }
    } catch (dbErr: any) {
      await dbClient.query('ROLLBACK');
      job.counts.errors++;
      job.items.push({
        rowNumber,
        inputTitle: displayTitle,
        inputYear: fields.releaseYear,
        status: 'error',
        message: `Erro ao gravar no banco: ${dbErr.message}`,
      });
    } finally {
      dbClient.release();
    }

    job.processed++;

    // Pequeno intervalo amigável para não estourar limite de requisições do TMDB/OMDb
    if (i < rows.length - 1) {
      await sleep(160);
    }
  }

  job.status = 'completed';
  job.finishedAt = Date.now();
}
