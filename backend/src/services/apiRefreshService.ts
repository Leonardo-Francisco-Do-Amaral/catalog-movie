import { query } from '../config/database';
import { fetchExternalMetricsOnly } from './movieIntegration';
import { evaluateTrophies } from './trophyService';
import { getQuickXpSnapshot, computeXpGainEvent, computeTimeMachineUnlocks } from './xpService';

export interface MetricDiffValue<T = number | null> {
  before: T;
  after: T;
  changed: boolean;
}

export interface ApiRefreshMovieChanges {
  imdb_rating: MetricDiffValue<number | null>;
  metacritic_score: MetricDiffValue<number | null>;
  rotten_tomatoes_score: MetricDiffValue<number | null>;
  vote_count: MetricDiffValue<number | null>;
  oscar_wins: MetricDiffValue<number>;
  oscar_nominations: MetricDiffValue<number>;
}

export interface ApiRefreshMovieDiff {
  movieId: number;
  title: string;
  metrics: {
    imdb_rating: number | null;
    metacritic_score: number | null;
    rotten_tomatoes_score: number | null;
    vote_count: number | null;
    oscar_wins: number;
    oscar_nominations: number;
  };
  changes: ApiRefreshMovieChanges;
  anyChanged: boolean;
}

export interface ApiRefreshJob {
  jobId: string;
  status: 'running' | 'completed' | 'cancelled' | 'error';
  total: number;
  processed: number;
  updatedCount: number;
  unchangedCount: number;
  errorCount: number;
  currentTitle: string;
  updatedMovies: ApiRefreshMovieDiff[];
  errors: Array<{ movieId: number; title: string; error: string }>;
  trophyEvaluation: {
    newlyUnlocked: any[];
    progressedTrophies: any[];
    timeMachineUnlocks: any[];
    xpStatus: any;
    xpGain: any;
  } | null;
  startedAt: string;
  finishedAt?: string;
}

const jobs = new Map<string, ApiRefreshJob>();

function toNullableNum(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
}

/**
 * Busca e atualiza EXCLUSIVAMENTE as métricas externas seguras de 1 filme:
 * - imdb_rating, metacritic_score, rotten_tomatoes_score
 * - vote_count (visualizações/votos globais)
 * - oscar_wins, oscar_nominations
 * Protegido para nunca zerar campos ausentes, nunca reduzir Oscars manuais e jamais alterar dados do usuário.
 */
export async function refreshSingleMovieExternalMetrics(movieRow: {
  id: number;
  imdb_id?: string | null;
  tmdb_id?: number | null;
  title: string;
  original_title?: string | null;
  release_year?: number | null;
  imdb_rating?: any;
  metacritic_score?: any;
  rotten_tomatoes_score?: any;
  vote_count?: any;
  oscar_wins?: any;
  oscar_nominations?: any;
}): Promise<ApiRefreshMovieDiff> {
  const movieId = Number(movieRow.id);
  const prevImdb = toNullableNum(movieRow.imdb_rating);
  const prevMc = toNullableNum(movieRow.metacritic_score);
  const prevRt = toNullableNum(movieRow.rotten_tomatoes_score);
  const prevVotes = toNullableNum(movieRow.vote_count);
  const prevOscarWins = toNullableNum(movieRow.oscar_wins) ?? 0;
  const prevOscarNoms = toNullableNum(movieRow.oscar_nominations) ?? 0;

  let fresh;
  try {
    fresh = await fetchExternalMetricsOnly({
      imdbId: movieRow.imdb_id,
      tmdbId: movieRow.tmdb_id,
      title: movieRow.title,
      originalTitle: movieRow.original_title,
      releaseYear: movieRow.release_year ? Number(movieRow.release_year) : null,
    });
  } catch (firstErr) {
    // 1 retentativa rápida para evitar falhas transitórias de rede em lote
    await new Promise((r) => setTimeout(r, 350));
    fresh = await fetchExternalMetricsOnly({
      imdbId: movieRow.imdb_id,
      tmdbId: movieRow.tmdb_id,
      title: movieRow.title,
      originalTitle: movieRow.original_title,
      releaseYear: movieRow.release_year ? Number(movieRow.release_year) : null,
    });
  }

  // Proteção rigorosa: campos ausentes/N/A nunca convertem valores existentes em 0 ou null
  const nextImdb =
    fresh.imdb_rating !== null && !Number.isNaN(fresh.imdb_rating) ? fresh.imdb_rating : prevImdb;
  const nextMc =
    fresh.metacritic_score !== null && !Number.isNaN(fresh.metacritic_score) ? fresh.metacritic_score : prevMc;
  const nextRt =
    fresh.rotten_tomatoes_score !== null && !Number.isNaN(fresh.rotten_tomatoes_score)
      ? fresh.rotten_tomatoes_score
      : prevRt;

  let nextVotes = prevVotes;
  if (fresh.omdb_vote_count !== null && fresh.omdb_vote_count > 0) {
    nextVotes = fresh.omdb_vote_count;
  } else if ((prevVotes === null || prevVotes === 0) && fresh.tmdb_vote_count !== null && fresh.tmdb_vote_count > 0) {
    nextVotes = fresh.tmdb_vote_count;
  }

  // Oscar: nunca rebaixa indicações/vitórias manuais caso OMDb omita ou traga número menor
  const nextOscarWins = fresh.oscar_wins !== null ? Math.max(prevOscarWins, fresh.oscar_wins) : prevOscarWins;
  let nextOscarNoms = fresh.oscar_nominations !== null ? Math.max(prevOscarNoms, fresh.oscar_nominations) : prevOscarNoms;
  if (nextOscarWins > nextOscarNoms) {
    nextOscarNoms = nextOscarWins;
  }

  const changes: ApiRefreshMovieChanges = {
    imdb_rating: { before: prevImdb, after: nextImdb, changed: prevImdb !== nextImdb },
    metacritic_score: { before: prevMc, after: nextMc, changed: prevMc !== nextMc },
    rotten_tomatoes_score: { before: prevRt, after: nextRt, changed: prevRt !== nextRt },
    vote_count: { before: prevVotes, after: nextVotes, changed: prevVotes !== nextVotes },
    oscar_wins: { before: prevOscarWins, after: nextOscarWins, changed: prevOscarWins !== nextOscarWins },
    oscar_nominations: { before: prevOscarNoms, after: nextOscarNoms, changed: prevOscarNoms !== nextOscarNoms },
  };

  const anyChanged =
    changes.imdb_rating.changed ||
    changes.metacritic_score.changed ||
    changes.rotten_tomatoes_score.changed ||
    changes.vote_count.changed ||
    changes.oscar_wins.changed ||
    changes.oscar_nominations.changed;

  if (anyChanged) {
    await query(
      `UPDATE movies
       SET imdb_rating = $1,
           metacritic_score = $2,
           rotten_tomatoes_score = $3,
           vote_count = $4,
           oscar_wins = $5,
           oscar_nominations = $6
       WHERE id = $7`,
      [nextImdb, nextMc, nextRt, nextVotes, nextOscarWins, nextOscarNoms, movieId]
    );
  }

  return {
    movieId,
    title: movieRow.title,
    metrics: {
      imdb_rating: nextImdb,
      metacritic_score: nextMc,
      rotten_tomatoes_score: nextRt,
      vote_count: nextVotes,
      oscar_wins: nextOscarWins,
      oscar_nominations: nextOscarNoms,
    },
    changes,
    anyChanged,
  };
}

/**
 * Inicia job assíncrono para atualizar notas externas, votos e Oscars de TODOS os filmes do catálogo.
 */
export async function startCatalogApiRefreshJob(): Promise<ApiRefreshJob> {
  // Evita dois jobs rodando simultaneamente
  for (const existing of jobs.values()) {
    if (existing.status === 'running') {
      return existing;
    }
  }

  const res = await query(
    `SELECT id, imdb_id, tmdb_id, title, original_title, release_year,
            imdb_rating, metacritic_score, rotten_tomatoes_score,
            vote_count, oscar_wins, oscar_nominations
     FROM movies
     ORDER BY id DESC`
  );
  const allMovieRows = res.rows || [];
  const prevXp = await getQuickXpSnapshot().catch(() => null);

  const jobId = `api_refresh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const job: ApiRefreshJob = {
    jobId,
    status: 'running',
    total: allMovieRows.length,
    processed: 0,
    updatedCount: 0,
    unchangedCount: 0,
    errorCount: 0,
    currentTitle: allMovieRows[0]?.title || '',
    updatedMovies: [],
    errors: [],
    trophyEvaluation: null,
    startedAt: new Date().toISOString(),
  };

  jobs.set(jobId, job);

  // Executa em segundo plano com concorrência controlada
  (async () => {
    const CONCURRENCY = 4;
    let cursor = 0;

    const worker = async () => {
      while (cursor < allMovieRows.length) {
        if (job.status === 'cancelled') return;
        const idx = cursor++;
        const row = allMovieRows[idx];
        if (!row) continue;

        job.currentTitle = row.title;
        try {
          const diff = await refreshSingleMovieExternalMetrics(row);
          if (diff.anyChanged) {
            job.updatedCount++;
            job.updatedMovies.push(diff);
          } else {
            job.unchangedCount++;
          }
        } catch (err: any) {
          job.errorCount++;
          job.errors.push({
            movieId: Number(row.id),
            title: row.title,
            error: err?.message || 'Erro desconhecido ao consultar API',
          });
        } finally {
          job.processed++;
        }
      }
    };

    try {
      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, Math.max(1, allMovieRows.length)) }, () => worker()));

      if (job.status !== 'cancelled') {
        job.status = 'completed';
      }

      if (job.updatedCount > 0) {
        try {
          const trophyResult = await evaluateTrophies({ markNew: true });
          const xpStatus = trophyResult.xpStatus || (await getQuickXpSnapshot().catch(() => null));
          job.trophyEvaluation = {
            newlyUnlocked: trophyResult.newlyUnlocked || [],
            progressedTrophies: trophyResult.progressedTrophies || [],
            timeMachineUnlocks: computeTimeMachineUnlocks(prevXp, xpStatus),
            xpStatus,
            xpGain: computeXpGainEvent(prevXp, xpStatus),
          };
        } catch (tErr: any) {
          console.error('[ApiRefreshJob] Erro ao reavaliar troféus após atualização em lote:', tErr.message);
        }
      }
    } catch (fatalErr: any) {
      job.status = 'error';
      console.error('[ApiRefreshJob] Erro fatal no batch de atualização:', fatalErr.message);
    } finally {
      job.finishedAt = new Date().toISOString();
    }
  })();

  return job;
}

export function getCatalogApiRefreshJob(jobId: string): ApiRefreshJob | null {
  return jobs.get(jobId) || null;
}

export function cancelCatalogApiRefreshJob(jobId: string): boolean {
  const job = jobs.get(jobId);
  if (!job || job.status !== 'running') return false;
  job.status = 'cancelled';
  return true;
}
