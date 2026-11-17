import { query } from '../../../config/database';
import {
  LEGENDARY_STUDIOS,
  STUDIO_TIER_RANK,
  StudioTier,
  matchShowToLegendaryStudios,
  resolveStudioTier,
} from '../data/legendaryStudios';
import { TV_XP_VALUES, calculateTvLevelFromXp } from '../data/levelTitles';
import { TvShowRecord, TvXpSnapshot } from '../types';
import { listAllTvShows } from './catalogService';
import { TvVoiceAlbumPayload, buildTvVoiceAlbumPayload } from './voiceAlbumService';

export interface StudioLeagueEntry {
  id: string;
  name: string;
  malId: number;
  foundedYear: number;
  emoji: string;
  motto: string;
  signatureWorks: string[];
  completedCount: number;
  inProgressCount: number;
  totalShowsCount: number;
  episodesWatched: number;
  hoursWatched: number;
  avgUserRating: number | null;
  currentTier: StudioTier;
  xpEarned: number;
  extraStars: number;
  extraStarsXp: number;
  nextTier: Exclude<StudioTier, 'none'> | null;
  nextTierTarget: number | null;
  nextStarTarget: number | null;
  progressPercentage: number;
  matchedShows: Array<{
    id: number;
    title: string;
    poster_url: string | null;
    watch_status: string;
    user_rating: number | null;
    watchedEpisodes: number;
    start_year: number | null;
  }>;
}

export interface StudiosLeaguePayload {
  studios: StudioLeagueEntry[];
  summary: {
    unlockedStudiosCount: number;
    totalStudiosCount: number;
    bronzeCount: number;
    silverCount: number;
    epicCount: number;
    goldCount: number;
    mythicCount: number;
    totalExtraStars: number;
    totalLeagueXp: number;
  };
}

export interface TvStudioUpgradeEvent {
  studioId: string;
  studioName: string;
  emoji: string;
  prevTier: StudioTier;
  newTier: Exclude<StudioTier, 'none'>;
  prevExtraStars: number;
  newExtraStars: number;
  newXpEarned: number;
}

export interface TvXpMutationEvent {
  xpDelta: number;
  leveledUp: boolean;
  prevLevel: number;
  newLevel: number;
  titleChanged: boolean;
  newTitle: string;
  newlyUpgradedStudios: TvStudioUpgradeEvent[];
}

export async function buildStudiosLeaguePayload(existingShows?: TvShowRecord[]): Promise<StudiosLeaguePayload> {
  const shows = existingShows || (await listAllTvShows()).shows;

  const bucketByStudioId = new Map<string, TvShowRecord[]>();
  for (const def of LEGENDARY_STUDIOS) {
    bucketByStudioId.set(def.id, []);
  }

  for (const show of shows) {
    const matchedDefs = matchShowToLegendaryStudios(show.studios || []);
    for (const def of matchedDefs) {
      bucketByStudioId.get(def.id)!.push(show);
    }
  }

  let unlockedStudiosCount = 0;
  let bronzeCount = 0;
  let silverCount = 0;
  let epicCount = 0;
  let goldCount = 0;
  let mythicCount = 0;
  let totalExtraStars = 0;
  let totalLeagueXp = 0;

  const studios: StudioLeagueEntry[] = LEGENDARY_STUDIOS.map((def) => {
    const list = bucketByStudioId.get(def.id) || [];
    const completedCount = list.filter((s) => s.watch_status === 'completed').length;
    const inProgressCount = list.length - completedCount;
    const episodesWatched = list.reduce((sum, s) => sum + (s.watchedEpisodes || 0), 0);
    const hoursWatched = Math.round(list.reduce((sum, s) => sum + (s.totalHoursWatched || 0), 0) * 10) / 10;

    const ratings = list
      .map((s) => s.user_rating)
      .filter((r): r is number => r !== null && r !== undefined);
    const avgUserRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + Number(b), 0) / ratings.length) * 100) / 100
        : null;

    const tierInfo = resolveStudioTier(completedCount);
    if (tierInfo.currentTier !== 'none') unlockedStudiosCount += 1;
    if (tierInfo.currentTier === 'bronze') bronzeCount += 1;
    if (tierInfo.currentTier === 'silver') silverCount += 1;
    if (tierInfo.currentTier === 'epic') epicCount += 1;
    if (tierInfo.currentTier === 'gold') goldCount += 1;
    if (tierInfo.currentTier === 'mythic') mythicCount += 1;
    totalExtraStars += tierInfo.extraStars;
    totalLeagueXp += tierInfo.xpEarned;

    return {
      id: def.id,
      name: def.name,
      malId: def.malId,
      foundedYear: def.foundedYear,
      emoji: def.emoji,
      motto: def.motto,
      signatureWorks: def.signatureWorks,
      completedCount,
      inProgressCount,
      totalShowsCount: list.length,
      episodesWatched,
      hoursWatched,
      avgUserRating,
      ...tierInfo,
      matchedShows: list.map((s) => ({
        id: s.id,
        title: s.title,
        poster_url: s.poster_url,
        watch_status: s.watch_status,
        user_rating: s.user_rating,
        watchedEpisodes: s.watchedEpisodes,
        start_year: s.start_year,
      })),
    };
  });

  studios.sort((a, b) => {
    const tierDiff = STUDIO_TIER_RANK[b.currentTier] - STUDIO_TIER_RANK[a.currentTier];
    if (tierDiff !== 0) return tierDiff;
    if (b.extraStars !== a.extraStars) return b.extraStars - a.extraStars;
    if (b.completedCount !== a.completedCount) return b.completedCount - a.completedCount;
    if (b.totalShowsCount !== a.totalShowsCount) return b.totalShowsCount - a.totalShowsCount;
    return a.name.localeCompare(b.name, 'pt');
  });

  return {
    studios,
    summary: {
      unlockedStudiosCount,
      totalStudiosCount: LEGENDARY_STUDIOS.length,
      bronzeCount,
      silverCount,
      epicCount,
      goldCount,
      mythicCount,
      totalExtraStars,
      totalLeagueXp,
    },
  };
}

export async function getTvXpSnapshot(options?: {
  shows?: TvShowRecord[];
  league?: StudiosLeaguePayload;
  voiceAlbum?: TvVoiceAlbumPayload;
}): Promise<TvXpSnapshot> {
  const [showsData, marathonsRes] = await Promise.all([
    options?.shows ? Promise.resolve(options.shows) : listAllTvShows().then((r) => r.shows),
    query(`
      SELECT logged_on::text AS day
      FROM tv.watch_log
      WHERE source = 'progress'
      GROUP BY logged_on
      HAVING SUM(episodes_delta) >= 6
      ORDER BY logged_on DESC
    `),
  ]);

  const [league, voiceAlbum] = await Promise.all([
    options?.league ? Promise.resolve(options.league) : buildStudiosLeaguePayload(showsData),
    options?.voiceAlbum ? Promise.resolve(options.voiceAlbum) : buildTvVoiceAlbumPayload(showsData),
  ]);

  let episodesWatched = 0;
  let completedSeasons = 0;
  let completedShows = 0;

  for (const show of showsData) {
    episodesWatched += show.watchedEpisodes || 0;
    if (show.watch_status === 'completed') completedShows += 1;
    for (const s of show.seasons || []) {
      if (s.episodes_total !== null && s.episodes_total > 0 && s.episodes_watched >= s.episodes_total) {
        completedSeasons += 1;
      }
    }
  }

  const recentMarathonDates = marathonsRes.rows.map((r: any) => String(r.day).slice(0, 10));
  const marathonDays = recentMarathonDates.length;

  const episodeXp = episodesWatched * TV_XP_VALUES.EPISODE_WATCHED;
  const seasonXp = completedSeasons * TV_XP_VALUES.SEASON_COMPLETED;
  const showXp = completedShows * TV_XP_VALUES.SHOW_COMPLETED;
  const marathonXp = marathonDays * TV_XP_VALUES.MARATHON_DAY;
  const studioLeagueXp = league.summary.totalLeagueXp;
  const voiceAlbumXp = voiceAlbum.summary.totalVoiceXp;

  const totalXp = episodeXp + seasonXp + showXp + marathonXp + studioLeagueXp + voiceAlbumXp;
  const levelInfo = calculateTvLevelFromXp(totalXp);

  return {
    ...levelInfo,
    breakdown: {
      episodesWatched,
      episodeXp,
      completedSeasons,
      seasonXp,
      completedShows,
      showXp,
      marathonDays,
      marathonXp,
      unlockedStudios: league.summary.unlockedStudiosCount,
      studioLeagueXp,
      unlockedVoices: voiceAlbum.summary.unlockedVoices,
      voiceAlbumXp,
    },
    recentMarathonDates: recentMarathonDates.slice(0, 10),
  };
}

export async function captureTvXpState(): Promise<{
  xpStatus: TvXpSnapshot;
  league: StudiosLeaguePayload;
}> {
  const { shows } = await listAllTvShows();
  const [league, voiceAlbum] = await Promise.all([
    buildStudiosLeaguePayload(shows),
    buildTvVoiceAlbumPayload(shows),
  ]);
  const xpStatus = await getTvXpSnapshot({ shows, league, voiceAlbum });
  return { xpStatus, league };
}

export function computeTvXpMutationEvent(
  prevState: { xpStatus: TvXpSnapshot; league: StudiosLeaguePayload },
  nextState: { xpStatus: TvXpSnapshot; league: StudiosLeaguePayload }
): TvXpMutationEvent {
  const prevXp = prevState.xpStatus;
  const nextXp = nextState.xpStatus;

  const prevById = new Map(prevState.league.studios.map((s) => [s.id, s]));
  const newlyUpgradedStudios: TvStudioUpgradeEvent[] = [];

  for (const st of nextState.league.studios) {
    const prev = prevById.get(st.id);
    const prevTier = prev?.currentTier || 'none';
    const prevStars = prev?.extraStars || 0;
    const upgradedTier = STUDIO_TIER_RANK[st.currentTier] > STUDIO_TIER_RANK[prevTier];
    const gainedStar = st.extraStars > prevStars;

    if ((upgradedTier || gainedStar) && st.currentTier !== 'none') {
      newlyUpgradedStudios.push({
        studioId: st.id,
        studioName: st.name,
        emoji: st.emoji,
        prevTier,
        newTier: st.currentTier,
        prevExtraStars: prevStars,
        newExtraStars: st.extraStars,
        newXpEarned: st.xpEarned,
      });
    }
  }

  return {
    xpDelta: Math.max(0, nextXp.totalXp - prevXp.totalXp),
    leveledUp: nextXp.level > prevXp.level,
    prevLevel: prevXp.level,
    newLevel: nextXp.level,
    titleChanged: nextXp.levelTitle !== prevXp.levelTitle,
    newTitle: nextXp.levelTitle,
    newlyUpgradedStudios,
  };
}
