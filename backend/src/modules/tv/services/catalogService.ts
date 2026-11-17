import { PoolClient } from 'pg';
import pool, { query } from '../../../config/database';
import { JikanMovieGuardError } from '../clients/jikanClient';
import {
  TvGenreGroupType,
  TvGenreItem,
  TvSeasonInput,
  TvSeasonRecord,
  TvShowInput,
  TvShowRecord,
  TvSongOption,
  TvStoppedAtInfo,
  TvStudioItem,
} from '../types';

function toNullableInt(val: any): number | null {
  if (val === undefined || val === null || val === '') return null;
  const num = Number(val);
  return Number.isFinite(num) ? Math.round(num) : null;
}

function toNullableNumeric(val: any): number | null {
  if (val === undefined || val === null || val === '') return null;
  const str = String(val).replace(',', '.').trim();
  if (!str) return null;
  const num = Number(str);
  return Number.isFinite(num) ? num : null;
}

function computeDerivedShowFields(
  seasons: TvSeasonRecord[],
  bestSeasonNumber: number | null
): {
  totalEpisodes: number | null;
  watchedEpisodes: number;
  totalHoursWatched: number;
  stoppedAt: TvStoppedAtInfo | null;
  bestSeasonLabel: string | null;
  allSongs: TvSongOption[];
} {
  let watchedEpisodes = 0;
  let totalMinutes = 0;
  let hasAnyTotal = false;
  let totalSum = 0;
  const allSongs: TvSongOption[] = [];
  const seenSongKeys = new Set<string>();

  for (const s of seasons) {
    const watched = Number(s.episodes_watched || 0);
    watchedEpisodes += watched;
    const dur = Number(s.episode_duration_min || 24);
    totalMinutes += watched * dur;

    if (s.episodes_total !== null && s.episodes_total !== undefined) {
      hasAnyTotal = true;
      totalSum += Number(s.episodes_total);
    }

    const openings = Array.isArray(s.themes?.openings) ? s.themes.openings : [];
    const endings = Array.isArray(s.themes?.endings) ? s.themes.endings : [];

    for (const op of openings) {
      const key = `opening::${op.toLowerCase()}`;
      if (!seenSongKeys.has(key)) {
        seenSongKeys.add(key);
        allSongs.push({
          title: op,
          kind: 'opening',
          seasonNumber: s.season_number,
          seasonLabel: s.label,
        });
      }
    }
    for (const ed of endings) {
      const key = `ending::${ed.toLowerCase()}`;
      if (!seenSongKeys.has(key)) {
        seenSongKeys.add(key);
        allSongs.push({
          title: ed,
          kind: 'ending',
          seasonNumber: s.season_number,
          seasonLabel: s.label,
        });
      }
    }
  }

  let stoppedAt: TvStoppedAtInfo | null = null;
  if (seasons.length > 0) {
    const firstUnfinished = seasons.find(
      (s) => s.episodes_total === null || s.episodes_watched < s.episodes_total
    );
    const refSeason = firstUnfinished || seasons[seasons.length - 1];
    stoppedAt = {
      seasonId: refSeason.id,
      seasonNumber: refSeason.season_number,
      label: refSeason.label,
      episodesWatched: refSeason.episodes_watched,
      episodesTotal: refSeason.episodes_total,
    };
  }

  const bestSeason =
    bestSeasonNumber !== null
      ? seasons.find((s) => s.season_number === bestSeasonNumber) || null
      : null;

  return {
    totalEpisodes: hasAnyTotal ? totalSum : null,
    watchedEpisodes,
    totalHoursWatched: Number((totalMinutes / 60).toFixed(1)),
    stoppedAt,
    bestSeasonLabel: bestSeason ? bestSeason.label : null,
    allSongs,
  };
}

export async function listAllTvShows(): Promise<{
  shows: TvShowRecord[];
  filters: {
    studios: string[];
    genres: string[];
    demographics: string[];
    platforms: string[];
    creators: string[];
    directors: string[];
    years: number[];
  };
}> {
  const [showsRes, seasonsRes, studiosRes, genresRes, staffRes] = await Promise.all([
    query(`
      SELECT
        id, kind, title, original_title, primary_source, mal_id, tmdb_tv_id, imdb_id,
        poster_url, synopsis, start_year, end_year, airing_status, origin_country,
        external_score, watch_status, user_rating, music_rating, best_song_title,
        best_song_kind, best_season_number, month_seen, year_seen, audio_type,
        platform, review_notes, created_at, updated_at
      FROM tv.shows
      ORDER BY COALESCE(year_seen, 0) DESC, COALESCE(month_seen, 0) DESC, updated_at DESC, id DESC
    `),
    query(`
      SELECT
        id, show_id, season_number, label, season_type, mal_id, tmdb_season_number,
        episodes_total, episodes_watched, episode_duration_min, year, external_score,
        poster_url, themes, month_seen, year_seen
      FROM tv.seasons
      ORDER BY show_id ASC, season_number ASC
    `),
    query(`
      SELECT ss.show_id, s.id, s.name, s.mal_id
      FROM tv.show_studios ss
      JOIN tv.studios s ON s.id = ss.studio_id
      ORDER BY s.name ASC
    `),
    query(`
      SELECT sg.show_id, g.id, g.name, g.group_type
      FROM tv.show_genres sg
      JOIN tv.genres g ON g.id = sg.genre_id
      ORDER BY g.name ASC
    `),
    query(`
      SELECT st.show_id, st.role, p.name
      FROM tv.show_staff st
      JOIN tv.people p ON p.id = st.person_id
      ORDER BY p.name ASC
    `),
  ]);

  const seasonsByShow = new Map<number, TvSeasonRecord[]>();
  for (const r of seasonsRes.rows) {
    const showId = Number(r.show_id);
    const list = seasonsByShow.get(showId) || [];
    const themes = r.themes && typeof r.themes === 'object' ? r.themes : {};
    list.push({
      id: Number(r.id),
      show_id: showId,
      season_number: Number(r.season_number),
      label: String(r.label),
      season_type: r.season_type || 'tv',
      mal_id: r.mal_id !== null ? Number(r.mal_id) : null,
      tmdb_season_number: r.tmdb_season_number !== null ? Number(r.tmdb_season_number) : null,
      episodes_total: r.episodes_total !== null ? Number(r.episodes_total) : null,
      episodes_watched: Number(r.episodes_watched || 0),
      episode_duration_min: r.episode_duration_min !== null ? Number(r.episode_duration_min) : 24,
      year: r.year !== null ? Number(r.year) : null,
      external_score: r.external_score !== null ? Number(r.external_score) : null,
      poster_url: r.poster_url || null,
      themes: {
        openings: Array.isArray(themes.openings) ? themes.openings : [],
        endings: Array.isArray(themes.endings) ? themes.endings : [],
      },
      month_seen: r.month_seen !== null ? Number(r.month_seen) : null,
      year_seen: r.year_seen !== null ? Number(r.year_seen) : null,
    });
    seasonsByShow.set(showId, list);
  }

  const studiosByShow = new Map<number, TvStudioItem[]>();
  for (const r of studiosRes.rows) {
    const showId = Number(r.show_id);
    const list = studiosByShow.get(showId) || [];
    list.push({
      id: Number(r.id),
      name: String(r.name),
      mal_id: r.mal_id !== null ? Number(r.mal_id) : null,
    });
    studiosByShow.set(showId, list);
  }

  const genresByShow = new Map<number, TvGenreItem[]>();
  for (const r of genresRes.rows) {
    const showId = Number(r.show_id);
    const list = genresByShow.get(showId) || [];
    list.push({
      id: Number(r.id),
      name: String(r.name),
      group_type: r.group_type as TvGenreGroupType,
    });
    genresByShow.set(showId, list);
  }

  const creatorsByShow = new Map<number, string[]>();
  const directorsByShow = new Map<number, string[]>();
  for (const r of staffRes.rows) {
    const showId = Number(r.show_id);
    if (r.role === 'creator') {
      const arr = creatorsByShow.get(showId) || [];
      arr.push(String(r.name));
      creatorsByShow.set(showId, arr);
    } else if (r.role === 'director') {
      const arr = directorsByShow.get(showId) || [];
      arr.push(String(r.name));
      directorsByShow.set(showId, arr);
    }
  }

  const studioSet = new Set<string>();
  const genreSet = new Set<string>();
  const demoSet = new Set<string>();
  const platformSet = new Set<string>();
  const creatorSet = new Set<string>();
  const directorSet = new Set<string>();
  const yearSet = new Set<number>();

  const shows: TvShowRecord[] = showsRes.rows.map((r) => {
    const showId = Number(r.id);
    const seasons = seasonsByShow.get(showId) || [];
    const studios = studiosByShow.get(showId) || [];
    const genres = genresByShow.get(showId) || [];
    const creators = creatorsByShow.get(showId) || [];
    const directors = directorsByShow.get(showId) || [];
    const bestSeasonNumber = r.best_season_number !== null ? Number(r.best_season_number) : null;

    studios.forEach((s) => studioSet.add(s.name));
    genres.forEach((g) => {
      if (g.group_type === 'demographic') demoSet.add(g.name);
      else if (g.group_type === 'genre') genreSet.add(g.name);
    });
    if (r.platform) platformSet.add(String(r.platform));
    creators.forEach((c) => creatorSet.add(c));
    directors.forEach((d) => directorSet.add(d));
    if (r.start_year) yearSet.add(Number(r.start_year));

    const derived = computeDerivedShowFields(seasons, bestSeasonNumber);

    return {
      id: showId,
      kind: r.kind,
      title: String(r.title),
      original_title: r.original_title || null,
      primary_source: r.primary_source,
      mal_id: r.mal_id !== null ? Number(r.mal_id) : null,
      tmdb_tv_id: r.tmdb_tv_id !== null ? Number(r.tmdb_tv_id) : null,
      imdb_id: r.imdb_id || null,
      poster_url: r.poster_url || null,
      synopsis: r.synopsis || null,
      start_year: r.start_year !== null ? Number(r.start_year) : null,
      end_year: r.end_year !== null ? Number(r.end_year) : null,
      airing_status: r.airing_status || null,
      origin_country: r.origin_country || null,
      external_score: r.external_score !== null ? Number(r.external_score) : null,
      watch_status: r.watch_status,
      user_rating: r.user_rating !== null ? Number(r.user_rating) : null,
      music_rating: r.music_rating !== null ? Number(r.music_rating) : null,
      best_song_title: r.best_song_title || null,
      best_song_kind: r.best_song_kind || null,
      best_season_number: bestSeasonNumber,
      month_seen: r.month_seen !== null ? Number(r.month_seen) : null,
      year_seen: r.year_seen !== null ? Number(r.year_seen) : null,
      audio_type: r.audio_type || null,
      platform: r.platform || null,
      review_notes: r.review_notes || null,
      created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      seasons,
      studios,
      genres,
      creators,
      directors,
      ...derived,
    };
  });

  return {
    shows,
    filters: {
      studios: Array.from(studioSet).sort((a, b) => a.localeCompare(b)),
      genres: Array.from(genreSet).sort((a, b) => a.localeCompare(b)),
      demographics: Array.from(demoSet).sort((a, b) => a.localeCompare(b)),
      platforms: Array.from(platformSet).sort((a, b) => a.localeCompare(b)),
      creators: Array.from(creatorSet).sort((a, b) => a.localeCompare(b)),
      directors: Array.from(directorSet).sort((a, b) => a.localeCompare(b)),
      years: Array.from(yearSet).sort((a, b) => b - a),
    },
  };
}

export async function getTvShowById(showId: number): Promise<TvShowRecord | null> {
  const { shows } = await listAllTvShows();
  return shows.find((s) => s.id === showId) || null;
}

async function syncStudios(
  client: PoolClient,
  showId: number,
  studios: Array<string | { name: string; mal_id?: number | null }> = []
) {
  await client.query('DELETE FROM tv.show_studios WHERE show_id = $1', [showId]);
  const seen = new Set<string>();

  for (const raw of studios) {
    const name = typeof raw === 'string' ? raw.trim() : String(raw?.name || '').trim();
    const malId = typeof raw === 'string' ? null : toNullableInt(raw?.mal_id);
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());

    const upsertRes = await client.query(
      `INSERT INTO tv.studios (name, mal_id)
       VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE
         SET mal_id = COALESCE(tv.studios.mal_id, EXCLUDED.mal_id)
       RETURNING id`,
      [name, malId]
    );
    const studioId = Number(upsertRes.rows[0].id);
    await client.query(
      `INSERT INTO tv.show_studios (show_id, studio_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [showId, studioId]
    );
  }
}

async function syncGenres(
  client: PoolClient,
  showId: number,
  genres: string[] = [],
  demographics: string[] = [],
  themes: string[] = []
) {
  await client.query('DELETE FROM tv.show_genres WHERE show_id = $1', [showId]);

  const pairs: Array<{ name: string; group: TvGenreGroupType }> = [];
  const seen = new Set<string>();

  const pushItems = (list: string[], group: TvGenreGroupType) => {
    for (const raw of list) {
      const name = String(raw || '').trim();
      if (!name) continue;
      const key = `${group}::${name.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({ name, group });
    }
  };

  pushItems(genres, 'genre');
  pushItems(demographics, 'demographic');
  pushItems(themes, 'theme');

  for (const item of pairs) {
    const res = await client.query(
      `INSERT INTO tv.genres (name, group_type)
       VALUES ($1, $2)
       ON CONFLICT (name, group_type) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [item.name, item.group]
    );
    const genreId = Number(res.rows[0].id);
    await client.query(
      `INSERT INTO tv.show_genres (show_id, genre_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [showId, genreId]
    );
  }
}

async function upsertPersonByName(client: PoolClient, name: string): Promise<number> {
  const existing = await client.query(
    `SELECT id FROM tv.people WHERE LOWER(name) = LOWER($1) ORDER BY id ASC LIMIT 1`,
    [name]
  );
  if (existing.rows.length > 0) {
    return Number(existing.rows[0].id);
  }
  const inserted = await client.query(
    `INSERT INTO tv.people (name) VALUES ($1) RETURNING id`,
    [name]
  );
  return Number(inserted.rows[0].id);
}

async function syncStaff(
  client: PoolClient,
  showId: number,
  creators: string[] = [],
  directors: string[] = []
) {
  await client.query(`DELETE FROM tv.show_staff WHERE show_id = $1`, [showId]);

  const insertRoleList = async (names: string[], role: 'creator' | 'director') => {
    const seen = new Set<string>();
    for (const raw of names) {
      const clean = String(raw || '').trim();
      if (!clean || seen.has(clean.toLowerCase())) continue;
      seen.add(clean.toLowerCase());
      const personId = await upsertPersonByName(client, clean);
      await client.query(
        `INSERT INTO tv.show_staff (show_id, person_id, role)
         VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [showId, personId, role]
      );
    }
  };

  await insertRoleList(creators, 'creator');
  await insertRoleList(directors, 'director');
}

async function validateExternalIdUniqueness(
  client: PoolClient,
  payload: TvShowInput,
  seasons: TvSeasonInput[],
  excludeShowId?: number
) {
  const tmdbId = toNullableInt(payload.tmdb_tv_id);
  if (tmdbId !== null) {
    const res = await client.query(
      `SELECT id, title FROM tv.shows WHERE tmdb_tv_id = $1 ${excludeShowId ? 'AND id <> $2' : ''}`,
      excludeShowId ? [tmdbId, excludeShowId] : [tmdbId]
    );
    if (res.rows.length > 0) {
      throw new Error(
        `Já existe uma obra cadastrada com este TMDB TV ID (${tmdbId}): "${res.rows[0].title}".`
      );
    }
  }

  const imdbId = payload.imdb_id ? String(payload.imdb_id).trim() : null;
  if (imdbId) {
    const res = await client.query(
      `SELECT id, title FROM tv.shows WHERE imdb_id = $1 ${excludeShowId ? 'AND id <> $2' : ''}`,
      excludeShowId ? [imdbId, excludeShowId] : [imdbId]
    );
    if (res.rows.length > 0) {
      throw new Error(
        `Já existe uma obra cadastrada com este IMDb ID (${imdbId}): "${res.rows[0].title}".`
      );
    }
  }

  const seasonMalIds = seasons
    .map((s) => toNullableInt(s.mal_id))
    .filter((id): id is number => id !== null);
  if (seasonMalIds.length > 0) {
    const res = await client.query(
      `SELECT se.mal_id, sh.title
       FROM tv.seasons se
       JOIN tv.shows sh ON sh.id = se.show_id
       WHERE se.mal_id = ANY($1::int[]) ${excludeShowId ? 'AND se.show_id <> $2' : ''}`,
      excludeShowId ? [seasonMalIds, excludeShowId] : [seasonMalIds]
    );
    if (res.rows.length > 0) {
      throw new Error(
        `A entrada MAL ID ${res.rows[0].mal_id} já faz parte da obra "${res.rows[0].title}".`
      );
    }
  }
}

function normalizeSeasonsInput(seasons: TvSeasonInput[] | undefined, fallbackTitle: string, payload: TvShowInput): TvSeasonInput[] {
  const list = Array.isArray(seasons) && seasons.length > 0
    ? seasons
    : [
        {
          season_number: 1,
          label: fallbackTitle || 'Temporada 1',
          season_type: 'tv' as const,
          mal_id: toNullableInt(payload.mal_id),
          episodes_total: null,
          episodes_watched: 0,
          episode_duration_min: payload.kind === 'anime' ? 24 : 45,
          year: toNullableInt(payload.start_year),
          external_score: toNullableNumeric(payload.external_score),
          themes: { openings: [], endings: [] },
        },
      ];

  return list.map((s, idx) => {
    const total = toNullableInt(s.episodes_total);
    const rawWatched = Math.max(0, toNullableInt(s.episodes_watched) ?? 0);
    const watched = total !== null && total > 0 ? Math.min(total, rawWatched) : rawWatched;

    return {
      id: toNullableInt(s.id) ?? undefined,
      season_number: idx + 1,
      label: String(s.label || `Temporada ${idx + 1}`).trim(),
      season_type: s.season_type || 'tv',
      mal_id: toNullableInt(s.mal_id),
      tmdb_season_number: toNullableInt(s.tmdb_season_number),
      episodes_total: total,
      episodes_watched: watched,
      episode_duration_min: toNullableInt(s.episode_duration_min) ?? (payload.kind === 'anime' ? 24 : 45),
      year: toNullableInt(s.year),
      external_score: toNullableNumeric(s.external_score),
      poster_url: s.poster_url || null,
      themes: {
        openings: Array.isArray(s.themes?.openings) ? s.themes.openings : [],
        endings: Array.isArray(s.themes?.endings) ? s.themes.endings : [],
      },
      month_seen: toNullableInt(s.month_seen),
      year_seen: toNullableInt(s.year_seen),
    };
  });
}

export async function createTvShow(payload: TvShowInput): Promise<TvShowRecord> {
  if (!payload.title || !String(payload.title).trim()) {
    throw new Error('O título da obra é obrigatório.');
  }
  if (String(payload.is_movie_guard_type || '').toLowerCase() === 'movie') {
    throw new JikanMovieGuardError(payload.title);
  }

  const cleanTitle = String(payload.title).trim();
  const normalizedSeasons = normalizeSeasonsInput(payload.seasons, cleanTitle, payload);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await validateExternalIdUniqueness(client, payload, normalizedSeasons);

    const bestSeasonNum = toNullableInt(payload.best_season_number);
    const validBestSeasonNum =
      bestSeasonNum !== null && normalizedSeasons.some((s) => s.season_number === bestSeasonNum)
        ? bestSeasonNum
        : null;

    const showRes = await client.query(
      `INSERT INTO tv.shows (
        kind, title, original_title, primary_source, mal_id, tmdb_tv_id, imdb_id,
        poster_url, synopsis, start_year, end_year, airing_status, origin_country,
        external_score, watch_status, user_rating, music_rating, best_song_title,
        best_song_kind, best_season_number, month_seen, year_seen, audio_type,
        platform, review_notes, raw_api_data
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23,
        $24, $25, $26
      ) RETURNING id`,
      [
        payload.kind || 'anime',
        cleanTitle,
        payload.original_title ? String(payload.original_title).trim() : null,
        payload.primary_source || 'manual',
        toNullableInt(payload.mal_id),
        toNullableInt(payload.tmdb_tv_id),
        payload.imdb_id ? String(payload.imdb_id).trim() : null,
        payload.poster_url || null,
        payload.synopsis || null,
        toNullableInt(payload.start_year),
        toNullableInt(payload.end_year),
        payload.airing_status || null,
        payload.origin_country || null,
        toNullableNumeric(payload.external_score),
        payload.watch_status || 'watching',
        toNullableNumeric(payload.user_rating),
        toNullableNumeric(payload.music_rating),
        payload.best_song_title ? String(payload.best_song_title).trim() : null,
        payload.best_song_kind || null,
        validBestSeasonNum,
        toNullableInt(payload.month_seen),
        toNullableInt(payload.year_seen),
        payload.audio_type || null,
        payload.platform ? String(payload.platform).trim() : null,
        payload.review_notes || null,
        JSON.stringify(payload.raw_api_data || {}),
      ]
    );

    const showId = Number(showRes.rows[0].id);

    for (const s of normalizedSeasons) {
      const seasonRes = await client.query(
        `INSERT INTO tv.seasons (
          show_id, season_number, label, season_type, mal_id, tmdb_season_number,
          episodes_total, episodes_watched, episode_duration_min, year, external_score,
          poster_url, themes, month_seen, year_seen
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id`,
        [
          showId,
          s.season_number,
          s.label,
          s.season_type || 'tv',
          s.mal_id ?? null,
          s.tmdb_season_number ?? null,
          s.episodes_total ?? null,
          s.episodes_watched ?? 0,
          s.episode_duration_min ?? 24,
          s.year ?? null,
          s.external_score ?? null,
          s.poster_url ?? null,
          JSON.stringify(s.themes || { openings: [], endings: [] }),
          s.month_seen ?? null,
          s.year_seen ?? null,
        ]
      );

      // Regra anti-farm de maratona: episódios já assistidos no momento do cadastro entram como backfill
      if ((s.episodes_watched ?? 0) > 0) {
        await client.query(
          `INSERT INTO tv.watch_log (show_id, season_id, episodes_delta, source)
           VALUES ($1, $2, $3, 'backfill')`,
          [showId, Number(seasonRes.rows[0].id), s.episodes_watched]
        );
      }
    }

    await syncStudios(client, showId, payload.studios || []);
    await syncGenres(client, showId, payload.genres || [], payload.demographics || [], payload.themes || []);
    await syncStaff(client, showId, payload.creators || [], payload.directors || []);

    await client.query('COMMIT');
    const created = await getTvShowById(showId);
    if (!created) throw new Error('Falha ao recarregar a obra cadastrada.');
    return created;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateTvShow(showId: number, payload: TvShowInput): Promise<TvShowRecord> {
  if (!payload.title || !String(payload.title).trim()) {
    throw new Error('O título da obra é obrigatório.');
  }
  if (String(payload.is_movie_guard_type || '').toLowerCase() === 'movie') {
    throw new JikanMovieGuardError(payload.title);
  }

  const cleanTitle = String(payload.title).trim();
  const normalizedSeasons = normalizeSeasonsInput(payload.seasons, cleanTitle, payload);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existsRes = await client.query(`SELECT id FROM tv.shows WHERE id = $1`, [showId]);
    if (existsRes.rows.length === 0) {
      throw new Error('Obra não encontrada no catálogo.');
    }

    await validateExternalIdUniqueness(client, payload, normalizedSeasons, showId);

    const bestSeasonNum = toNullableInt(payload.best_season_number);
    const validBestSeasonNum =
      bestSeasonNum !== null && normalizedSeasons.some((s) => s.season_number === bestSeasonNum)
        ? bestSeasonNum
        : null;

    await client.query(
      `UPDATE tv.shows SET
        kind = $1,
        title = $2,
        original_title = $3,
        primary_source = $4,
        mal_id = $5,
        tmdb_tv_id = $6,
        imdb_id = $7,
        poster_url = $8,
        synopsis = $9,
        start_year = $10,
        end_year = $11,
        airing_status = $12,
        origin_country = $13,
        external_score = $14,
        watch_status = $15,
        user_rating = $16,
        music_rating = $17,
        best_song_title = $18,
        best_song_kind = $19,
        best_season_number = $20,
        month_seen = $21,
        year_seen = $22,
        audio_type = $23,
        platform = $24,
        review_notes = $25,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $26`,
      [
        payload.kind || 'anime',
        cleanTitle,
        payload.original_title ? String(payload.original_title).trim() : null,
        payload.primary_source || 'manual',
        toNullableInt(payload.mal_id),
        toNullableInt(payload.tmdb_tv_id),
        payload.imdb_id ? String(payload.imdb_id).trim() : null,
        payload.poster_url || null,
        payload.synopsis || null,
        toNullableInt(payload.start_year),
        toNullableInt(payload.end_year),
        payload.airing_status || null,
        payload.origin_country || null,
        toNullableNumeric(payload.external_score),
        payload.watch_status || 'watching',
        toNullableNumeric(payload.user_rating),
        toNullableNumeric(payload.music_rating),
        payload.best_song_title ? String(payload.best_song_title).trim() : null,
        payload.best_song_kind || null,
        validBestSeasonNum,
        toNullableInt(payload.month_seen),
        toNullableInt(payload.year_seen),
        payload.audio_type || null,
        payload.platform ? String(payload.platform).trim() : null,
        payload.review_notes || null,
        showId,
      ]
    );

    // Sincroniza temporadas preservando IDs existentes e watch_log
    const existingRes = await client.query(
      `SELECT id, mal_id, episodes_watched FROM tv.seasons WHERE show_id = $1`,
      [showId]
    );
    const existingById = new Map<number, { id: number; episodes_watched: number }>();
    const existingByMalId = new Map<number, { id: number; episodes_watched: number }>();
    for (const row of existingRes.rows) {
      const entry = { id: Number(row.id), episodes_watched: Number(row.episodes_watched || 0) };
      existingById.set(entry.id, entry);
      if (row.mal_id !== null) existingByMalId.set(Number(row.mal_id), entry);
    }

    const matchedIds = new Set<number>();
    const seasonMappings = normalizedSeasons.map((s) => {
      let existing = s.id ? existingById.get(s.id) : undefined;
      if (!existing && s.mal_id) {
        existing = existingByMalId.get(s.mal_id);
      }
      if (existing && !matchedIds.has(existing.id)) {
        matchedIds.add(existing.id);
        return { input: s, existing };
      }
      return { input: s, existing: undefined };
    });

    const idsToDelete = Array.from(existingById.keys()).filter((id) => !matchedIds.has(id));
    if (idsToDelete.length > 0) {
      await client.query(`DELETE FROM tv.seasons WHERE id = ANY($1::int[])`, [idsToDelete]);
    }

    // Evita conflito de (show_id, season_number) ao reordenar temporadas existentes
    if (matchedIds.size > 0) {
      await client.query(
        `UPDATE tv.seasons SET season_number = -id WHERE show_id = $1 AND id = ANY($2::int[])`,
        [showId, Array.from(matchedIds)]
      );
    }

    for (const { input: s, existing } of seasonMappings) {
      if (existing) {
        await client.query(
          `UPDATE tv.seasons SET
            season_number = $1, label = $2, season_type = $3, mal_id = $4,
            tmdb_season_number = $5, episodes_total = $6, episodes_watched = $7,
            episode_duration_min = $8, year = $9, external_score = $10,
            poster_url = $11, themes = $12, month_seen = $13, year_seen = $14
          WHERE id = $15`,
          [
            s.season_number,
            s.label,
            s.season_type || 'tv',
            s.mal_id ?? null,
            s.tmdb_season_number ?? null,
            s.episodes_total ?? null,
            s.episodes_watched ?? 0,
            s.episode_duration_min ?? 24,
            s.year ?? null,
            s.external_score ?? null,
            s.poster_url ?? null,
            JSON.stringify(s.themes || { openings: [], endings: [] }),
            s.month_seen ?? null,
            s.year_seen ?? null,
            existing.id,
          ]
        );
        const delta = (s.episodes_watched ?? 0) - existing.episodes_watched;
        if (delta > 0) {
          await client.query(
            `INSERT INTO tv.watch_log (show_id, season_id, episodes_delta, source)
             VALUES ($1, $2, $3, 'progress')`,
            [showId, existing.id, delta]
          );
        }
      } else {
        const insRes = await client.query(
          `INSERT INTO tv.seasons (
            show_id, season_number, label, season_type, mal_id, tmdb_season_number,
            episodes_total, episodes_watched, episode_duration_min, year, external_score,
            poster_url, themes, month_seen, year_seen
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING id`,
          [
            showId,
            s.season_number,
            s.label,
            s.season_type || 'tv',
            s.mal_id ?? null,
            s.tmdb_season_number ?? null,
            s.episodes_total ?? null,
            s.episodes_watched ?? 0,
            s.episode_duration_min ?? 24,
            s.year ?? null,
            s.external_score ?? null,
            s.poster_url ?? null,
            JSON.stringify(s.themes || { openings: [], endings: [] }),
            s.month_seen ?? null,
            s.year_seen ?? null,
          ]
        );
        if ((s.episodes_watched ?? 0) > 0) {
          await client.query(
            `INSERT INTO tv.watch_log (show_id, season_id, episodes_delta, source)
             VALUES ($1, $2, $3, 'progress')`,
            [showId, Number(insRes.rows[0].id), s.episodes_watched]
          );
        }
      }
    }

    await syncStudios(client, showId, payload.studios || []);
    await syncGenres(client, showId, payload.genres || [], payload.demographics || [], payload.themes || []);
    await syncStaff(client, showId, payload.creators || [], payload.directors || []);

    await client.query('COMMIT');
    const updated = await getTvShowById(showId);
    if (!updated) throw new Error('Falha ao recarregar a obra atualizada.');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function incrementSeasonProgress(
  seasonId: number,
  options: { delta?: number; episodes_watched?: number; autoCompleteShow?: boolean }
): Promise<{ show: TvShowRecord; allSeasonsCompleted: boolean }> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const seasonRes = await client.query(
      `SELECT id, show_id, episodes_total, episodes_watched FROM tv.seasons WHERE id = $1 FOR UPDATE`,
      [seasonId]
    );
    if (seasonRes.rows.length === 0) {
      throw new Error('Temporada não encontrada.');
    }

    const row = seasonRes.rows[0];
    const showId = Number(row.show_id);
    const total = row.episodes_total !== null ? Number(row.episodes_total) : null;
    const prevWatched = Number(row.episodes_watched || 0);

    let nextWatched = prevWatched;
    if (options.episodes_watched !== undefined && options.episodes_watched !== null) {
      nextWatched = Math.max(0, Math.round(Number(options.episodes_watched)));
    } else {
      const delta = options.delta !== undefined ? Math.round(Number(options.delta)) : 1;
      nextWatched = Math.max(0, prevWatched + delta);
    }

    if (total !== null && total > 0) {
      nextWatched = Math.min(total, nextWatched);
    }

    await client.query(`UPDATE tv.seasons SET episodes_watched = $1 WHERE id = $2`, [
      nextWatched,
      seasonId,
    ]);

    const diff = nextWatched - prevWatched;
    if (diff > 0) {
      await client.query(
        `INSERT INTO tv.watch_log (show_id, season_id, episodes_delta, source)
         VALUES ($1, $2, $3, 'progress')`,
        [showId, seasonId, diff]
      );
    }

    const allSeasonsRes = await client.query(
      `SELECT season_type, episodes_total, episodes_watched FROM tv.seasons WHERE show_id = $1`,
      [showId]
    );
    const tvSeasons = allSeasonsRes.rows.filter((r) => r.season_type === 'tv');
    const checkList = tvSeasons.length > 0 ? tvSeasons : allSeasonsRes.rows;
    const allSeasonsCompleted =
      checkList.length > 0 &&
      checkList.every(
        (s) => s.episodes_total !== null && Number(s.episodes_total) > 0 && Number(s.episodes_watched) >= Number(s.episodes_total)
      );

    if (allSeasonsCompleted && options.autoCompleteShow) {
      await client.query(
        `UPDATE tv.shows SET watch_status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [showId]
      );
    } else {
      await client.query(`UPDATE tv.shows SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [showId]);
    }

    await client.query('COMMIT');
    const show = await getTvShowById(showId);
    if (!show) throw new Error('Obra não encontrada.');
    return { show, allSeasonsCompleted };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function appendSeasonToShow(
  showId: number,
  seasonInput: TvSeasonInput,
  extraStudios: Array<{ name: string; mal_id?: number | null }> = []
): Promise<TvShowRecord> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const showRes = await client.query(`SELECT id, kind, watch_status FROM tv.shows WHERE id = $1`, [showId]);
    if (showRes.rows.length === 0) {
      throw new Error('Obra não encontrada.');
    }
    const showKind = showRes.rows[0].kind;

    const malId = toNullableInt(seasonInput.mal_id);
    if (malId !== null) {
      const dupRes = await client.query(
        `SELECT sh.title FROM tv.seasons se JOIN tv.shows sh ON sh.id = se.show_id WHERE se.mal_id = $1`,
        [malId]
      );
      if (dupRes.rows.length > 0) {
        throw new Error(`Esta temporada (MAL ID ${malId}) já está cadastrada em "${dupRes.rows[0].title}".`);
      }
    }

    const maxNumRes = await client.query(
      `SELECT COALESCE(MAX(season_number), 0)::int AS max_num FROM tv.seasons WHERE show_id = $1`,
      [showId]
    );
    const nextSeasonNumber = Number(maxNumRes.rows[0]?.max_num || 0) + 1;

    const total = toNullableInt(seasonInput.episodes_total);
    const rawWatched = Math.max(0, toNullableInt(seasonInput.episodes_watched) ?? 0);
    const watched = total !== null && total > 0 ? Math.min(total, rawWatched) : rawWatched;

    const insRes = await client.query(
      `INSERT INTO tv.seasons (
        show_id, season_number, label, season_type, mal_id, tmdb_season_number,
        episodes_total, episodes_watched, episode_duration_min, year, external_score,
        poster_url, themes, month_seen, year_seen
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id`,
      [
        showId,
        nextSeasonNumber,
        String(seasonInput.label || `Temporada ${nextSeasonNumber}`).trim(),
        seasonInput.season_type || 'tv',
        malId,
        toNullableInt(seasonInput.tmdb_season_number),
        total,
        watched,
        toNullableInt(seasonInput.episode_duration_min) ?? (showKind === 'anime' ? 24 : 45),
        toNullableInt(seasonInput.year),
        toNullableNumeric(seasonInput.external_score),
        seasonInput.poster_url || null,
        JSON.stringify(seasonInput.themes || { openings: [], endings: [] }),
        toNullableInt(seasonInput.month_seen),
        toNullableInt(seasonInput.year_seen),
      ]
    );

    if (watched > 0) {
      await client.query(
        `INSERT INTO tv.watch_log (show_id, season_id, episodes_delta, source)
         VALUES ($1, $2, $3, 'progress')`,
        [showId, Number(insRes.rows[0].id), watched]
      );
    }

    // Adiciona novos estúdios se a temporada adicionada trouxe outro estúdio
    for (const st of extraStudios) {
      if (!st?.name) continue;
      const up = await client.query(
        `INSERT INTO tv.studios (name, mal_id)
         VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET mal_id = COALESCE(tv.studios.mal_id, EXCLUDED.mal_id)
         RETURNING id`,
        [st.name.trim(), toNullableInt(st.mal_id)]
      );
      await client.query(
        `INSERT INTO tv.show_studios (show_id, studio_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [showId, Number(up.rows[0].id)]
      );
    }

    // Se estava concluída e ganhou uma temporada ainda incompleta, move para assistindo
    if (showRes.rows[0].watch_status === 'completed' && (total === null || watched < total)) {
      await client.query(
        `UPDATE tv.shows SET watch_status = 'watching', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [showId]
      );
    } else {
      await client.query(`UPDATE tv.shows SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [showId]);
    }

    await client.query('COMMIT');
    const updated = await getTvShowById(showId);
    if (!updated) throw new Error('Obra não encontrada após anexar temporada.');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteTvShow(showId: number): Promise<boolean> {
  const res = await query(`DELETE FROM tv.shows WHERE id = $1 RETURNING id`, [showId]);
  return res.rows.length > 0;
}
