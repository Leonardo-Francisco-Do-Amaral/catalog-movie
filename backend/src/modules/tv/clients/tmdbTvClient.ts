import axios from 'axios';
import * as dotenv from 'dotenv';
import {
  TvDetailsBundle,
  TvPosterOption,
  TvSearchResultItem,
  TvSeasonInput,
  TvShowKind,
} from '../types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMG_W500 = 'https://image.tmdb.org/t/p/w500';
const TMDB_IMG_W185 = 'https://image.tmdb.org/t/p/w185';
const DORAMA_COUNTRIES = new Set(['KR', 'CN', 'TW', 'TH']);

function getTmdbClient() {
  dotenv.config({ override: false });
  const token = process.env.TMDB_BEARER_TOKEN;
  if (!token) {
    throw new Error('Configuração ausente: TMDB_BEARER_TOKEN não está definido no ambiente.');
  }
  return axios.create({
    baseURL: TMDB_BASE_URL,
    timeout: 12000,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
}

function inferKindFromTmdb(originCountries: string[], genreIdsOrNames: Array<number | string>): TvShowKind {
  const countries = originCountries.map((c) => String(c || '').toUpperCase());
  const isAnimation = genreIdsOrNames.some(
    (g) => g === 16 || String(g).toLowerCase() === 'animação' || String(g).toLowerCase() === 'animation'
  );

  if (countries.some((c) => DORAMA_COUNTRIES.has(c))) {
    return 'dorama';
  }
  if (countries.includes('JP')) {
    return isAnimation ? 'anime' : 'dorama';
  }
  return 'series';
}

function mapTmdbStatus(status?: string | null): string | null {
  const s = String(status || '').trim().toLowerCase();
  if (!s) return null;
  if (s === 'returning series' || s === 'in production') return 'Em exibição';
  if (s === 'ended' || s === 'canceled') return 'Finalizada';
  if (s === 'planned') return 'Planejada';
  return status || null;
}

export async function searchTvOnTmdb(
  queryStr: string,
  year?: number
): Promise<TvSearchResultItem[]> {
  const cleanQuery = String(queryStr || '').trim();
  if (!cleanQuery) return [];

  const client = getTmdbClient();
  const res = await client.get('/search/tv', {
    params: {
      query: cleanQuery,
      language: 'pt-BR',
      ...(year && Number.isFinite(year) ? { first_air_date_year: year } : {}),
    },
  });

  const results: any[] = Array.isArray(res.data?.results) ? res.data.results : [];

  return results.slice(0, 15).map((item) => {
    const originCountries: string[] = Array.isArray(item.origin_country) ? item.origin_country : [];
    const genreIds: number[] = Array.isArray(item.genre_ids) ? item.genre_ids : [];
    const suggestedKind = inferKindFromTmdb(originCountries, genreIds);
    const firstAirYear = item.first_air_date
      ? parseInt(String(item.first_air_date).slice(0, 4), 10) || null
      : null;

    return {
      source: 'tmdb',
      id: Number(item.id),
      title: String(item.name || item.original_name || '').trim() || 'Sem título',
      original_title: item.original_name ? String(item.original_name).trim() : null,
      year: firstAirYear,
      poster_url: item.poster_path ? `${TMDB_IMG_W500}${item.poster_path}` : null,
      mediaTypeLabel:
        suggestedKind === 'dorama' ? 'Dorama / TV' : suggestedKind === 'anime' ? 'Anime (TMDB)' : 'Série TV',
      isMovie: false,
      suggestedKind,
      episodes: null,
      external_score:
        typeof item.vote_average === 'number' && item.vote_average > 0
          ? Number(Number(item.vote_average).toFixed(1))
          : null,
      origin_country: originCountries[0] || null,
      synopsis: item.overview ? String(item.overview) : null,
    };
  });
}

async function fetchOmdbSeriesRating(imdbId?: string | null): Promise<{ rating: number | null; raw: any }> {
  const cleanId = imdbId ? String(imdbId).trim() : '';
  if (!cleanId) return { rating: null, raw: null };
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) return { rating: null, raw: null };

  try {
    const res = await axios.get('https://www.omdbapi.com/', {
      timeout: 7000,
      params: {
        i: cleanId,
        type: 'series',
        apikey: apiKey,
      },
    });
    const data = res.data;
    if (data?.Response === 'True') {
      const parsed = parseFloat(String(data.imdbRating || ''));
      return {
        rating: Number.isFinite(parsed) ? parsed : null,
        raw: data,
      };
    }
    return { rating: null, raw: data };
  } catch {
    return { rating: null, raw: null };
  }
}

export async function fetchTmdbTvBundle(tmdbTvId: number): Promise<TvDetailsBundle> {
  const client = getTmdbClient();
  const detailsRes = await client.get(`/tv/${tmdbTvId}`, {
    params: {
      append_to_response: 'external_ids,credits,images',
      include_image_language: 'pt,en,null',
      language: 'pt-BR',
    },
  });

  const d = detailsRes.data;
  const imdbId = d?.external_ids?.imdb_id ? String(d.external_ids.imdb_id).trim() : null;
  const omdbResult = await fetchOmdbSeriesRating(imdbId);

  const originCountries: string[] = Array.isArray(d?.origin_country) ? d.origin_country : [];
  const genreNames: string[] = Array.isArray(d?.genres)
    ? d.genres.map((g: any) => String(g?.name || '').trim()).filter(Boolean)
    : [];

  const suggestedKind = inferKindFromTmdb(originCountries, genreNames);
  const startYear = d?.first_air_date ? parseInt(String(d.first_air_date).slice(0, 4), 10) || null : null;
  const endYear = d?.last_air_date ? parseInt(String(d.last_air_date).slice(0, 4), 10) || null : null;

  const avgRuntime =
    Array.isArray(d?.episode_run_time) && d.episode_run_time.length > 0
      ? Number(d.episode_run_time[0]) || 45
      : suggestedKind === 'anime'
      ? 24
      : 45;

  const rawSeasons: any[] = Array.isArray(d?.seasons) ? d.seasons : [];
  const mappedSeasons: TvSeasonInput[] = [];
  let seqNumber = 1;

  for (const s of rawSeasons) {
    const tmdbSeasonNo = Number(s?.season_number);
    if (!Number.isFinite(tmdbSeasonNo)) continue;
    const isSpecial = tmdbSeasonNo === 0;
    const epCount = typeof s?.episode_count === 'number' ? s.episode_count : null;
    if (isSpecial && (!epCount || epCount <= 0)) continue;

    const seasonYear = s?.air_date ? parseInt(String(s.air_date).slice(0, 4), 10) || null : null;
    mappedSeasons.push({
      season_number: isSpecial ? 990 + seqNumber : seqNumber++,
      label: String(s?.name || (isSpecial ? 'Especiais' : `Temporada ${tmdbSeasonNo}`)).trim(),
      season_type: isSpecial ? 'special' : 'tv',
      mal_id: null,
      tmdb_season_number: tmdbSeasonNo,
      episodes_total: epCount,
      episodes_watched: 0,
      episode_duration_min: avgRuntime,
      year: seasonYear,
      external_score: null,
      poster_url: s?.poster_path ? `${TMDB_IMG_W500}${s.poster_path}` : null,
      themes: { openings: [], endings: [] },
      month_seen: null,
      year_seen: null,
    });
  }

  // Reordena colocando regulares antes dos especiais e normalizando season_number sequencial 1..N
  mappedSeasons.sort((a, b) => {
    const aSpecial = a.season_type === 'special' ? 1 : 0;
    const bSpecial = b.season_type === 'special' ? 1 : 0;
    if (aSpecial !== bSpecial) return aSpecial - bSpecial;
    return (a.tmdb_season_number ?? a.season_number) - (b.tmdb_season_number ?? b.season_number);
  });
  mappedSeasons.forEach((s, idx) => {
    s.season_number = idx + 1;
  });

  if (mappedSeasons.length === 0) {
    mappedSeasons.push({
      season_number: 1,
      label: 'Temporada 1',
      season_type: 'tv',
      mal_id: null,
      tmdb_season_number: 1,
      episodes_total: typeof d?.number_of_episodes === 'number' ? d.number_of_episodes : null,
      episodes_watched: 0,
      episode_duration_min: avgRuntime,
      year: startYear,
      external_score: null,
      poster_url: d?.poster_path ? `${TMDB_IMG_W500}${d.poster_path}` : null,
      themes: { openings: [], endings: [] },
      month_seen: null,
      year_seen: null,
    });
  }

  const creators: string[] = Array.isArray(d?.created_by)
    ? d.created_by.map((c: any) => String(c?.name || '').trim()).filter(Boolean)
    : [];

  const crewList: any[] = Array.isArray(d?.credits?.crew) ? d.credits.crew : [];
  const directors: string[] = [];
  for (const c of crewList) {
    const job = String(c?.job || '').trim().toLowerCase();
    const name = String(c?.name || '').trim();
    if (!name) continue;
    if ((job === 'director' || job === 'series director') && !directors.includes(name)) {
      directors.push(name);
    }
  }

  const studioNames = new Set<string>();
  const studios: Array<{ name: string; mal_id?: number | null }> = [];
  const prodCompanies: any[] = Array.isArray(d?.production_companies) ? d.production_companies : [];
  const networks: any[] = Array.isArray(d?.networks) ? d.networks : [];
  for (const item of [...prodCompanies, ...networks]) {
    const name = String(item?.name || '').trim();
    if (name && !studioNames.has(name.toLowerCase())) {
      studioNames.add(name.toLowerCase());
      studios.push({ name, mal_id: null });
    }
  }

  const postersRaw: any[] = Array.isArray(d?.images?.posters) ? d.images.posters : [];
  const availablePosters: TvPosterOption[] = postersRaw
    .slice(0, 12)
    .map((p) => ({
      file_path: String(p.file_path || ''),
      url: `${TMDB_IMG_W500}${p.file_path}`,
      thumb_url: `${TMDB_IMG_W185}${p.file_path}`,
      iso_639_1: p.iso_639_1 ?? null,
    }))
    .filter((p) => p.file_path.length > 0);

  const primaryPoster = d?.poster_path
    ? `${TMDB_IMG_W500}${d.poster_path}`
    : availablePosters[0]?.url || null;

  const fallbackTmdbScore =
    typeof d?.vote_average === 'number' && d.vote_average > 0
      ? Number(Number(d.vote_average).toFixed(1))
      : null;

  return {
    source: 'tmdb',
    suggestedKind,
    mal_id: null,
    tmdb_tv_id: Number(d.id),
    imdb_id: imdbId,
    title: String(d?.name || d?.original_name || '').trim() || `Série #${tmdbTvId}`,
    original_title: d?.original_name ? String(d.original_name).trim() : null,
    poster_url: primaryPoster,
    available_posters: availablePosters,
    synopsis: d?.overview ? String(d.overview) : null,
    start_year: startYear,
    end_year: endYear,
    airing_status: mapTmdbStatus(d?.status),
    origin_country: originCountries[0] || null,
    external_score: omdbResult.rating ?? fallbackTmdbScore,
    studios,
    genres: Array.from(new Set(genreNames)),
    demographics: [],
    themes: [],
    creators,
    directors: directors.slice(0, 5),
    seasons: mappedSeasons,
    relatedSeasons: [],
    raw_api_data: { tmdb: d, omdb: omdbResult.raw },
  };
}
