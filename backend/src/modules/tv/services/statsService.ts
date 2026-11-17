import { query } from '../../../config/database';
import { getQuickXpSnapshot } from '../../../services/xpService';
import { TvShowKind, TvShowRecord, TvWatchStatus } from '../types';
import { listAllTvShows } from './catalogService';
import { getTvXpPreviewSnapshot } from './xpPreviewService';

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function avgOrNull(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return round2(sum / values.length);
}

interface BucketAcc {
  count: number;
  completedCount: number;
  episodes: number;
  hours: number;
  ratings: number[];
  mal_id?: number | null;
}

function pushBucket(
  map: Map<string, BucketAcc>,
  key: string,
  show: TvShowRecord,
  malId?: number | null
) {
  const existing = map.get(key) || {
    count: 0,
    completedCount: 0,
    episodes: 0,
    hours: 0,
    ratings: [],
    mal_id: malId ?? null,
  };
  existing.count += 1;
  if (show.watch_status === 'completed') existing.completedCount += 1;
  existing.episodes += show.watchedEpisodes || 0;
  existing.hours += show.totalHoursWatched || 0;
  if (show.user_rating !== null && show.user_rating !== undefined) {
    existing.ratings.push(Number(show.user_rating));
  }
  if (malId && !existing.mal_id) existing.mal_id = malId;
  map.set(key, existing);
}

export async function buildTvStatsPayload() {
  const [{ shows }, tvXp, cinemaXp, moviesAggRes, moviesRatingsRes, moviesDecadesRes, moviesSeenRes] =
    await Promise.all([
      listAllTvShows(),
      getTvXpPreviewSnapshot(),
      getQuickXpSnapshot().catch(() => null),
      query(`
        SELECT
          COUNT(*)::int AS count,
          ROUND(COALESCE(SUM(COALESCE(runtime, 0)), 0) / 60.0, 1)::float AS hours
        FROM public.movies
      `),
      query(`
        SELECT ROUND(AVG(user_rating)::numeric, 2)::float AS avg_rating
        FROM public.movie_views
        WHERE user_rating IS NOT NULL
      `),
      query(`
        SELECT
          (FLOOR(release_year / 10) * 10)::int AS decade_start,
          COUNT(*)::int AS count,
          ROUND(COALESCE(SUM(COALESCE(runtime, 0)), 0) / 60.0, 1)::float AS hours
        FROM public.movies
        WHERE release_year IS NOT NULL AND release_year >= 1900
        GROUP BY decade_start
        ORDER BY decade_start ASC
      `),
      query(`
        SELECT
          mv.year_seen::int AS year,
          COUNT(DISTINCT mv.movie_id)::int AS count,
          ROUND(COALESCE(SUM(COALESCE(m.runtime, 0)), 0) / 60.0, 1)::float AS hours
        FROM public.movie_views mv
        JOIN public.movies m ON m.id = mv.movie_id
        WHERE mv.year_seen IS NOT NULL AND mv.year_seen >= 1990
        GROUP BY mv.year_seen
        ORDER BY mv.year_seen ASC
      `),
    ]);

  // 1. Overview do módulo TV
  let totalSeasons = 0;
  let completedSeasons = 0;
  let totalEpisodesWatched = 0;
  let totalHoursWatched = 0;
  const userRatings: number[] = [];
  const externalScores: number[] = [];
  const musicRatings: number[] = [];

  const byKind: Record<TvShowKind, { count: number; episodes: number; hours: number }> = {
    anime: { count: 0, episodes: 0, hours: 0 },
    series: { count: 0, episodes: 0, hours: 0 },
    dorama: { count: 0, episodes: 0, hours: 0 },
  };
  const byStatus: Record<TvWatchStatus, number> = {
    watching: 0,
    completed: 0,
    on_hold: 0,
    dropped: 0,
  };

  const demoMap = new Map<string, BucketAcc>();
  const genreMap = new Map<string, BucketAcc>();
  const studioMap = new Map<string, BucketAcc>();
  const creatorMap = new Map<string, BucketAcc>();
  const directorMap = new Map<string, BucketAcc>();
  const decadeMap = new Map<
    number,
    {
      decadeStart: number;
      count: number;
      episodes: number;
      hours: number;
      ratings: number[];
      topShow: TvShowRecord | null;
    }
  >();
  const tvSeenYearMap = new Map<
    number,
    { year: number; showIds: Set<number>; seasonsCount: number; episodes: number; hours: number }
  >();

  for (const show of shows) {
    const showSeasons = show.seasons || [];
    totalSeasons += showSeasons.length;
    completedSeasons += showSeasons.filter(
      (s) => s.episodes_total !== null && s.episodes_total > 0 && s.episodes_watched >= s.episodes_total
    ).length;
    totalEpisodesWatched += show.watchedEpisodes || 0;
    totalHoursWatched += show.totalHoursWatched || 0;

    if (show.user_rating !== null && show.user_rating !== undefined) {
      userRatings.push(Number(show.user_rating));
    }
    if (show.external_score !== null && show.external_score !== undefined) {
      externalScores.push(Number(show.external_score));
    }
    if (show.music_rating !== null && show.music_rating !== undefined) {
      musicRatings.push(Number(show.music_rating));
    }

    if (byKind[show.kind]) {
      byKind[show.kind].count += 1;
      byKind[show.kind].episodes += show.watchedEpisodes || 0;
      byKind[show.kind].hours = round1(byKind[show.kind].hours + (show.totalHoursWatched || 0));
    }
    if (byStatus[show.watch_status] !== undefined) {
      byStatus[show.watch_status] += 1;
    }

    // Demografias e gêneros
    const seenDemo = new Set<string>();
    const seenGenre = new Set<string>();
    for (const g of show.genres || []) {
      if (g.group_type === 'demographic' && !seenDemo.has(g.name)) {
        seenDemo.add(g.name);
        pushBucket(demoMap, g.name, show);
      } else if (g.group_type === 'genre' && !seenGenre.has(g.name)) {
        seenGenre.add(g.name);
        pushBucket(genreMap, g.name, show);
      }
    }

    // Estúdios
    for (const st of show.studios || []) {
      pushBucket(studioMap, st.name, show, st.mal_id);
    }

    // Staff
    for (const c of show.creators || []) {
      pushBucket(creatorMap, c, show);
    }
    for (const d of show.directors || []) {
      pushBucket(directorMap, d, show);
    }

    // Década de lançamento
    if (show.start_year && show.start_year >= 1950) {
      const decStart = Math.floor(show.start_year / 10) * 10;
      const dec = decadeMap.get(decStart) || {
        decadeStart: decStart,
        count: 0,
        episodes: 0,
        hours: 0,
        ratings: [],
        topShow: null,
      };
      dec.count += 1;
      dec.episodes += show.watchedEpisodes || 0;
      dec.hours = round1(dec.hours + (show.totalHoursWatched || 0));
      if (show.user_rating !== null && show.user_rating !== undefined) {
        dec.ratings.push(Number(show.user_rating));
      }
      if (
        !dec.topShow ||
        (show.user_rating ?? -1) > (dec.topShow.user_rating ?? -1) ||
        ((show.user_rating ?? -1) === (dec.topShow.user_rating ?? -1) &&
          (show.watchedEpisodes || 0) > (dec.topShow.watchedEpisodes || 0))
      ) {
        dec.topShow = show;
      }
      decadeMap.set(decStart, dec);
    }

    // Evolução por ano assistido: COALESCE(season.year_seen, show.year_seen)
    for (const season of showSeasons) {
      const effYear = season.year_seen ?? show.year_seen;
      if (!effYear || effYear < 1990) continue;
      const entry = tvSeenYearMap.get(effYear) || {
        year: effYear,
        showIds: new Set<number>(),
        seasonsCount: 0,
        episodes: 0,
        hours: 0,
      };
      entry.showIds.add(show.id);
      entry.seasonsCount += 1;
      const eps = season.episodes_watched || 0;
      const dur = season.episode_duration_min || 24;
      entry.episodes += eps;
      entry.hours += (eps * dur) / 60;
      tvSeenYearMap.set(effYear, entry);
    }
  }

  totalHoursWatched = round1(totalHoursWatched);
  const avgUserRating = avgOrNull(userRatings);
  const avgExternalScore = avgOrNull(externalScores);
  const avgMusicRating = avgOrNull(musicRatings);

  const mapToRankedArray = (map: Map<string, BucketAcc>, limit?: number) => {
    const arr = Array.from(map.entries())
      .map(([name, b]) => ({
        name,
        mal_id: b.mal_id ?? null,
        count: b.count,
        completedCount: b.completedCount,
        episodes: b.episodes,
        hours: round1(b.hours),
        avgRating: avgOrNull(b.ratings),
      }))
      .sort((a, b) => b.count - a.count || b.episodes - a.episodes || a.name.localeCompare(b.name, 'pt'));
    return limit ? arr.slice(0, limit) : arr;
  };

  const decades = Array.from(decadeMap.values())
    .sort((a, b) => a.decadeStart - b.decadeStart)
    .map((d) => ({
      decade: `${d.decadeStart}s`,
      decadeStart: d.decadeStart,
      count: d.count,
      episodes: d.episodes,
      hours: d.hours,
      avgRating: avgOrNull(d.ratings),
      topShowTitle: d.topShow?.title || null,
    }));

  const seenByYear = Array.from(tvSeenYearMap.values())
    .sort((a, b) => a.year - b.year)
    .map((y) => ({
      year: y.year,
      showsCount: y.showIds.size,
      seasonsCount: y.seasonsCount,
      episodes: y.episodes,
      hours: round1(y.hours),
    }));

  const topRatedShows = [...shows]
    .filter((s) => s.user_rating !== null && s.user_rating !== undefined)
    .sort((a, b) => Number(b.user_rating) - Number(a.user_rating))
    .slice(0, 8)
    .map((s) => ({
      id: s.id,
      title: s.title,
      kind: s.kind,
      poster_url: s.poster_url,
      user_rating: Number(s.user_rating),
      external_score: s.external_score !== null ? Number(s.external_score) : null,
      start_year: s.start_year,
    }));

  const topSongs = [...shows]
    .filter((s) => Boolean(s.best_song_title))
    .sort((a, b) => {
      const mDiff = (b.music_rating ?? -1) - (a.music_rating ?? -1);
      if (mDiff !== 0) return mDiff;
      return (b.user_rating ?? -1) - (a.user_rating ?? -1);
    })
    .slice(0, 8)
    .map((s) => ({
      showId: s.id,
      showTitle: s.title,
      poster_url: s.poster_url,
      songTitle: s.best_song_title as string,
      songKind: s.best_song_kind || 'manual',
      musicRating: s.music_rating !== null ? Number(s.music_rating) : null,
      bestSeasonLabel: s.bestSeasonLabel,
    }));

  const ratingComparison = shows
    .filter(
      (s) =>
        s.user_rating !== null &&
        s.user_rating !== undefined &&
        s.external_score !== null &&
        s.external_score !== undefined
    )
    .map((s) => {
      const userRating = Number(s.user_rating);
      const externalScore = Number(s.external_score);
      return {
        id: s.id,
        title: s.title,
        kind: s.kind,
        poster_url: s.poster_url,
        userRating,
        externalScore,
        diff: round2(userRating - externalScore),
      };
    })
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  const avgRatingDiff =
    ratingComparison.length > 0
      ? round2(ratingComparison.reduce((sum, item) => sum + item.diff, 0) / ratingComparison.length)
      : null;

  // 2. Total Geral (Filmes read-only + Animes & Séries)
  const moviesCount = Number(moviesAggRes.rows[0]?.count || 0);
  const moviesHours = round1(Number(moviesAggRes.rows[0]?.hours || 0));
  const moviesAvgRating =
    moviesRatingsRes.rows[0]?.avg_rating !== null && moviesRatingsRes.rows[0]?.avg_rating !== undefined
      ? Number(moviesRatingsRes.rows[0].avg_rating)
      : null;

  const totalScreenHours = round1(moviesHours + totalHoursWatched);
  const totalScreenDays = round1(totalScreenHours / 24);
  const moviesSharePct =
    totalScreenHours > 0 ? Math.round((moviesHours / totalScreenHours) * 100) : 0;
  const tvSharePct = totalScreenHours > 0 ? 100 - moviesSharePct : 0;

  // Séries combinadas por ano assistido
  const combinedYearMap = new Map<
    number,
    { year: number; moviesHours: number; tvHours: number; moviesCount: number; tvEpisodes: number }
  >();
  for (const r of moviesSeenRes.rows) {
    const yr = Number(r.year);
    combinedYearMap.set(yr, {
      year: yr,
      moviesHours: round1(Number(r.hours || 0)),
      tvHours: 0,
      moviesCount: Number(r.count || 0),
      tvEpisodes: 0,
    });
  }
  for (const ty of seenByYear) {
    const curr = combinedYearMap.get(ty.year) || {
      year: ty.year,
      moviesHours: 0,
      tvHours: 0,
      moviesCount: 0,
      tvEpisodes: 0,
    };
    curr.tvHours = ty.hours;
    curr.tvEpisodes = ty.episodes;
    combinedYearMap.set(ty.year, curr);
  }
  const combinedSeenByYear = Array.from(combinedYearMap.values()).sort((a, b) => a.year - b.year);

  // Séries combinadas por década de lançamento
  const combinedDecadeMap = new Map<
    number,
    { decade: string; decadeStart: number; moviesCount: number; moviesHours: number; tvCount: number; tvHours: number }
  >();
  for (const r of moviesDecadesRes.rows) {
    const decStart = Number(r.decade_start);
    combinedDecadeMap.set(decStart, {
      decade: `${decStart}s`,
      decadeStart: decStart,
      moviesCount: Number(r.count || 0),
      moviesHours: round1(Number(r.hours || 0)),
      tvCount: 0,
      tvHours: 0,
    });
  }
  for (const td of decades) {
    const curr = combinedDecadeMap.get(td.decadeStart) || {
      decade: td.decade,
      decadeStart: td.decadeStart,
      moviesCount: 0,
      moviesHours: 0,
      tvCount: 0,
      tvHours: 0,
    };
    curr.tvCount = td.count;
    curr.tvHours = td.hours;
    combinedDecadeMap.set(td.decadeStart, curr);
  }
  const combinedByDecade = Array.from(combinedDecadeMap.values()).sort(
    (a, b) => a.decadeStart - b.decadeStart
  );

  return {
    overview: {
      totalShows: shows.length,
      totalSeasons,
      completedSeasons,
      totalEpisodesWatched,
      totalHoursWatched,
      totalDaysWatched: round1(totalHoursWatched / 24),
      avgUserRating,
      avgExternalScore,
      avgMusicRating,
      avgRatingDiff,
      byKind,
      byStatus,
    },
    demographics: mapToRankedArray(demoMap),
    genres: mapToRankedArray(genreMap, 12),
    studios: mapToRankedArray(studioMap, 15),
    staff: {
      creators: mapToRankedArray(creatorMap, 10),
      directors: mapToRankedArray(directorMap, 10),
    },
    decades,
    seenByYear,
    topRatedShows,
    topSongs,
    ratingComparison,
    grandTotal: {
      totalTitles: moviesCount + shows.length,
      totalScreenHours,
      totalScreenDays,
      moviesSharePct,
      tvSharePct,
      moviesSummary: {
        count: moviesCount,
        hours: moviesHours,
        avgRating: moviesAvgRating,
      },
      tvSummary: {
        count: shows.length,
        episodes: totalEpisodesWatched,
        seasons: totalSeasons,
        hours: totalHoursWatched,
        avgRating: avgUserRating,
      },
      cinemaXp: cinemaXp
        ? {
            level: cinemaXp.level,
            levelTitle: cinemaXp.levelTitle,
            totalXp: cinemaXp.totalXp,
            xpInCurrentLevel: cinemaXp.xpInCurrentLevel,
            xpNeededForNextLevel: cinemaXp.xpNeededForNextLevel,
            progressPercentage: cinemaXp.progressPercentage,
          }
        : null,
      tvXp,
      combinedSeenByYear,
      combinedByDecade,
    },
  };
}
