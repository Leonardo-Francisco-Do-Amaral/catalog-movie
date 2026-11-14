import { query } from '../config/database';
import { buildWorldChallengePayload, ChallengeMovieItem } from './worldChallengeService';

export type TimeMachineRarityTier = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export const MIN_TIME_MACHINE_YEAR = 1920;
export const DECADE_COMPLETION_XP = 100;

export const DECADE_COMPLETION_XP_BY_DECADE: Record<string, number> = {
  '1920s': 1100,
  '1930s': 1000,
  '1940s': 900,
  '1950s': 800,
  '1960s': 700,
  '1970s': 600,
  '1980s': 500,
  '1990s': 400,
  '2000s': 300,
  '2010s': 200,
  '2020s': 100,
};

export function getDecadeCompletionXp(decadeIdOrStart: string | number): number {
  if (typeof decadeIdOrStart === 'string') {
    const key = decadeIdOrStart.trim();
    if (key === 'pioneers') return 0;
    if (DECADE_COMPLETION_XP_BY_DECADE[key] !== undefined) {
      return DECADE_COMPLETION_XP_BY_DECADE[key];
    }
    const parsed = parseInt(key, 10);
    if (!Number.isFinite(parsed) || parsed < MIN_TIME_MACHINE_YEAR) return 0;
    const decStart = Math.floor(parsed / 10) * 10;
    return DECADE_COMPLETION_XP_BY_DECADE[`${decStart}s`] ?? Math.max(100, 100 + ((2020 - decStart) / 10) * 100);
  }
  const num = Number(decadeIdOrStart);
  if (!Number.isFinite(num) || num < MIN_TIME_MACHINE_YEAR) return 0;
  const decStart = Math.floor(num / 10) * 10;
  return DECADE_COMPLETION_XP_BY_DECADE[`${decStart}s`] ?? Math.max(100, 100 + ((2020 - decStart) / 10) * 100);
}

export function getMaxTimeMachineYear(): number {
  return Math.max(2027, new Date().getFullYear());
}

export const TIME_MACHINE_XP_BY_RARITY: Record<TimeMachineRarityTier, number> = {
  common: 20,
  rare: 35,
  epic: 55,
  legendary: 90,
  mythic: 200,
};

export const TIME_MACHINE_RARITY_META: Record<
  TimeMachineRarityTier,
  {
    key: TimeMachineRarityTier;
    label: string;
    pluralLabel: string;
    eraRangeLabel: string;
    xp: number;
    icon: string;
  }
> = {
  common: {
    key: 'common',
    label: 'Contemporâneo',
    pluralLabel: 'Contemporâneos',
    eraRangeLabel: '2015 – Hoje',
    xp: 20,
    icon: '🟢',
  },
  rare: {
    key: 'rare',
    label: 'Moderno',
    pluralLabel: 'Modernos',
    eraRangeLabel: '1995 – 2014',
    xp: 35,
    icon: '🔵',
  },
  epic: {
    key: 'epic',
    label: 'Era VHS & Cult',
    pluralLabel: 'Era VHS & Cult',
    eraRangeLabel: '1975 – 1994',
    xp: 55,
    icon: '💜',
  },
  legendary: {
    key: 'legendary',
    label: 'Era de Ouro',
    pluralLabel: 'Era de Ouro',
    eraRangeLabel: '1950 – 1974',
    xp: 90,
    icon: '🥇',
  },
  mythic: {
    key: 'mythic',
    label: 'Relíquia P&B',
    pluralLabel: 'Relíquias P&B',
    eraRangeLabel: 'Pré-1950',
    xp: 200,
    icon: '💎',
  },
};

export const DECADE_META: Record<
  string,
  {
    id: string;
    decadeStart: number;
    label: string;
    subtitle: string;
    badgeIcon: string;
  }
> = {
  '2020s': {
    id: '2020s',
    decadeStart: 2020,
    label: 'Anos 2020',
    subtitle: 'Novo Cinema Global, Multiversos & Retorno às Salas',
    badgeIcon: '🚀',
  },
  '2010s': {
    id: '2010s',
    decadeStart: 2010,
    label: 'Anos 2010',
    subtitle: 'Revolução do Streaming, A24 & Sagas Épicas',
    badgeIcon: '📱',
  },
  '2000s': {
    id: '2000s',
    decadeStart: 2000,
    label: 'Anos 2000',
    subtitle: 'Virada do Milênio, Era Digital & Trilogias Lendárias',
    badgeIcon: '💿',
  },
  '1990s': {
    id: '1990s',
    decadeStart: 1990,
    label: 'Anos 1990',
    subtitle: 'Explosão Indie, Videolocadoras & Revolução CGI',
    badgeIcon: '📼',
  },
  '1980s': {
    id: '1980s',
    decadeStart: 1980,
    label: 'Anos 1980',
    subtitle: 'Era dos Blockbusters, Synthwave & Aventura Clássica',
    badgeIcon: '🕹️',
  },
  '1970s': {
    id: '1970s',
    decadeStart: 1970,
    label: 'Anos 1970',
    subtitle: 'Nova Hollywood, Cinema de Autor & Suspenses Políticos',
    badgeIcon: '🎞️',
  },
  '1960s': {
    id: '1960s',
    decadeStart: 1960,
    label: 'Anos 1960',
    subtitle: 'Nouvelle Vague, Western Spaghetti & Contracultura',
    badgeIcon: '🕶️',
  },
  '1950s': {
    id: '1950s',
    decadeStart: 1950,
    label: 'Anos 1950',
    subtitle: 'Esplendor Technicolor, CinemaScope & Mestres do Suspense',
    badgeIcon: '🎭',
  },
  '1940s': {
    id: '1940s',
    decadeStart: 1940,
    label: 'Anos 1940',
    subtitle: 'Sombras do Film Noir, Neorrealismo & Clássicos Eternos',
    badgeIcon: '🕵️',
  },
  '1930s': {
    id: '1930s',
    decadeStart: 1930,
    label: 'Anos 1930',
    subtitle: 'Triunfo do Cinema Falado, Monstros Clássicos & Era de Ouro',
    badgeIcon: '🎙️',
  },
  '1920s': {
    id: '1920s',
    decadeStart: 1920,
    label: 'Anos 1920',
    subtitle: 'Apogeu do Cinema Mudo, Expressionismo & Montagem Soviética',
    badgeIcon: '🎩',
  },
  pioneers: {
    id: 'pioneers',
    decadeStart: 1888,
    label: 'Era dos Pioneiros (< 1920)',
    subtitle: 'A Invenção da Sétima Arte, Lumière & Georges Méliès',
    badgeIcon: '🕯️',
  },
};

export function getYearRarityTier(year: number): TimeMachineRarityTier {
  if (year >= 2015) return 'common';
  if (year >= 1995) return 'rare';
  if (year >= 1975) return 'epic';
  if (year >= 1950) return 'legendary';
  return 'mythic';
}

export function getDecadeKeyForYear(year: number): string {
  if (year < MIN_TIME_MACHINE_YEAR) return 'pioneers';
  const decadeStart = Math.floor(year / 10) * 10;
  return `${decadeStart}s`;
}

/**
 * Ordena os filmes candidatos de um mesmo ano:
 * 1º Maior Nota Pessoal (Minha Nota / user_rating DESC)
 * 2º Maior Nota IMDb (imdb_rating DESC)
 * 3º Visualização mais recente (year_seen, month_seen DESC)
 * 4º ID mais recente (movie_id DESC)
 */
export function compareTimeMachineCandidates(a: any, b: any): number {
  const rDiff = (Number(b.user_rating) || 0) - (Number(a.user_rating) || 0);
  if (Math.abs(rDiff) > 0.0001) return rDiff;

  const imdbDiff = (Number(b.imdb_rating) || 0) - (Number(a.imdb_rating) || 0);
  if (Math.abs(imdbDiff) > 0.0001) return imdbDiff;

  const ysDiff = (Number(b.year_seen) || 0) - (Number(a.year_seen) || 0);
  if (ysDiff !== 0) return ysDiff;

  const msDiff = (Number(b.month_seen) || 0) - (Number(a.month_seen) || 0);
  if (msDiff !== 0) return msDiff;

  return (Number(b.movie_id || b.id) || 0) - (Number(a.movie_id || a.id) || 0);
}

export interface TimeMachineXpSummary {
  totalConqueredYears: number;
  totalOfficialYears: number;
  conqueredYears: Record<
    number,
    {
      year: number;
      rarity: TimeMachineRarityTier;
      xp: number;
      moviesCount: number;
      topMovieTitle: string;
      topMoviePoster: string | null;
      topUserRating: number;
    }
  >;
  completedDecades: Record<
    string,
    {
      id: string;
      label: string;
      xp: number;
    }
  >;
  byRarity: Record<
    TimeMachineRarityTier,
    {
      label: string;
      pluralLabel: string;
      eraRangeLabel: string;
      xp: number;
      icon: string;
      count: number;
      total: number;
      totalXp: number;
    }
  >;
  yearsXp: number;
  decadesXp: number;
  totalXp: number;
}

/**
 * Cálculo síncrono e determinístico do XP da Máquina do Tempo a partir dos filmes do catálogo.
 * Usado diretamente por xpService.ts sem consultas extras ao banco.
 */
export function computeTimeMachineXpSummary(catalogMovies: any[] = []): TimeMachineXpSummary {
  const maxYear = getMaxTimeMachineYear();
  const moviesByYear = new Map<number, any[]>();

  for (const m of catalogMovies || []) {
    const y = Number(m.release_year);
    if (!Number.isFinite(y) || y < 1888 || y > maxYear + 2) continue;
    if (!moviesByYear.has(y)) {
      moviesByYear.set(y, []);
    }
    moviesByYear.get(y)!.push(m);
  }

  // Totais disponíveis na grade oficial (1920..maxYear)
  const rarityTotals: Record<TimeMachineRarityTier, number> = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };

  for (let y = MIN_TIME_MACHINE_YEAR; y <= maxYear; y++) {
    const r = getYearRarityTier(y);
    rarityTotals[r] += 1;
  }

  // Inclui eventuais anos pioneiros (< 1920) ou pré-estreias (> maxYear) conquistados no total mítico/comum
  for (const y of moviesByYear.keys()) {
    if (y < MIN_TIME_MACHINE_YEAR || y > maxYear) {
      const r = getYearRarityTier(y);
      rarityTotals[r] += 1;
    }
  }

  const byRarity: TimeMachineXpSummary['byRarity'] = {
    common: { ...TIME_MACHINE_RARITY_META.common, count: 0, total: rarityTotals.common, totalXp: 0 },
    rare: { ...TIME_MACHINE_RARITY_META.rare, count: 0, total: rarityTotals.rare, totalXp: 0 },
    epic: { ...TIME_MACHINE_RARITY_META.epic, count: 0, total: rarityTotals.epic, totalXp: 0 },
    legendary: { ...TIME_MACHINE_RARITY_META.legendary, count: 0, total: rarityTotals.legendary, totalXp: 0 },
    mythic: { ...TIME_MACHINE_RARITY_META.mythic, count: 0, total: rarityTotals.mythic, totalXp: 0 },
  };

  const conqueredYears: TimeMachineXpSummary['conqueredYears'] = {};
  let yearsXp = 0;

  const sortedConqueredYears = Array.from(moviesByYear.keys()).sort((a, b) => b - a);
  for (const y of sortedConqueredYears) {
    const candidates = [...(moviesByYear.get(y) || [])].sort(compareTimeMachineCandidates);
    if (candidates.length === 0) continue;

    const top = candidates[0];
    const rarity = getYearRarityTier(y);
    const xpVal = TIME_MACHINE_XP_BY_RARITY[rarity] || 20;

    byRarity[rarity].count += 1;
    byRarity[rarity].totalXp += xpVal;
    yearsXp += xpVal;

    conqueredYears[y] = {
      year: y,
      rarity,
      xp: xpVal,
      moviesCount: candidates.length,
      topMovieTitle: String(top.title || ''),
      topMoviePoster: top.poster_url || null,
      topUserRating: Number(top.user_rating) || 0,
    };
  }

  // Bônus de Décadas Completas (10/10 anos da década conquistados: 1920s..2020s)
  const completedDecades: TimeMachineXpSummary['completedDecades'] = {};
  let decadesXp = 0;

  for (let decStart = MIN_TIME_MACHINE_YEAR; decStart <= Math.floor(maxYear / 10) * 10; decStart += 10) {
    const decKey = `${decStart}s`;
    let allTenConquered = true;
    for (let y = decStart; y <= decStart + 9; y++) {
      if (!conqueredYears[y]) {
        allTenConquered = false;
        break;
      }
    }
    if (allTenConquered) {
      const meta = DECADE_META[decKey] || {
        id: decKey,
        label: `Anos ${decStart}`,
      };
      const decadeXp = getDecadeCompletionXp(decKey);
      completedDecades[decKey] = {
        id: decKey,
        label: meta.label,
        xp: decadeXp,
      };
      decadesXp += decadeXp;
    }
  }

  return {
    totalConqueredYears: Object.keys(conqueredYears).length,
    totalOfficialYears: maxYear - MIN_TIME_MACHINE_YEAR + 1,
    conqueredYears,
    completedDecades,
    byRarity,
    yearsXp,
    decadesXp,
    totalXp: yearsXp + decadesXp,
  };
}

let timeMachineTablesEnsured = false;

export async function ensureTimeMachineTables(): Promise<void> {
  if (timeMachineTablesEnsured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS time_machine_picks (
      year INTEGER PRIMARY KEY,
      champion_movie_id INTEGER REFERENCES movies(id) ON DELETE SET NULL,
      wishlist_title VARCHAR(255),
      wishlist_director VARCHAR(255),
      wishlist_poster_url TEXT,
      wishlist_notes TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  timeMachineTablesEnsured = true;
}

export interface TimeMachineYearEntry {
  year: number;
  decadeKey: string;
  rarityTier: TimeMachineRarityTier;
  xpReward: number;
  status: 'conquered' | 'locked';
  moviesCount: number;
  selectionMode: 'auto' | 'manual' | null;
  champion: ChallengeMovieItem | null;
  autoBestMovie: ChallengeMovieItem | null;
  candidates: ChallengeMovieItem[];
  wishlist: {
    title: string;
    director: string | null;
    poster_url: string | null;
    notes: string | null;
  } | null;
}

export interface TimeMachineDecadeEntry {
  id: string;
  decadeStart: number;
  label: string;
  subtitle: string;
  badgeIcon: string;
  conqueredCount: number;
  availableYearsCount: number;
  relicTargetCount: number;
  isRelicUnlocked: boolean;
  relicXp: number;
  years: TimeMachineYearEntry[];
}

export async function buildTimeMachinePayload(existingWorldData?: any) {
  await ensureTimeMachineTables();

  const [worldData, picksRes] = await Promise.all([
    existingWorldData ? Promise.resolve(existingWorldData) : buildWorldChallengePayload(),
    query('SELECT * FROM time_machine_picks ORDER BY year DESC'),
  ]);

  const picksByYear = new Map<number, any>();
  for (const row of picksRes.rows || []) {
    picksByYear.set(Number(row.year), row);
  }

  const maxYear = getMaxTimeMachineYear();
  const catalogMovies: ChallengeMovieItem[] = worldData.catalogMovies || [];

  const moviesByYear = new Map<number, ChallengeMovieItem[]>();
  for (const m of catalogMovies) {
    const y = Number(m.release_year);
    if (!Number.isFinite(y) || y < 1888 || y > maxYear + 2) continue;
    if (!moviesByYear.has(y)) {
      moviesByYear.set(y, []);
    }
    moviesByYear.get(y)!.push(m);
  }

  // Lista completa de anos oficiais (maxYear decrescendo até 1920) + eventuais anos pioneiros (< 1920) ou pré-estreias
  const allYearsSet = new Set<number>();
  for (let y = maxYear; y >= MIN_TIME_MACHINE_YEAR; y--) {
    allYearsSet.add(y);
  }
  for (const y of moviesByYear.keys()) {
    allYearsSet.add(y);
  }
  for (const y of picksByYear.keys()) {
    if (y >= 1888 && y <= maxYear + 2) {
      allYearsSet.add(y);
    }
  }

  const sortedYearsDesc = Array.from(allYearsSet).sort((a, b) => b - a);
  const yearsEntries: TimeMachineYearEntry[] = [];

  for (const year of sortedYearsDesc) {
    const rawCandidates = moviesByYear.get(year) || [];
    const sortedCandidates = [...rawCandidates].sort(compareTimeMachineCandidates);
    const pickRow = picksByYear.get(year);

    let champion: ChallengeMovieItem | null = null;
    let selectionMode: 'auto' | 'manual' | null = null;
    const autoBestMovie = sortedCandidates.length > 0 ? sortedCandidates[0] : null;

    if (sortedCandidates.length > 0) {
      const manualId = pickRow?.champion_movie_id ? Number(pickRow.champion_movie_id) : null;
      const manualCandidate = manualId
        ? sortedCandidates.find((c) => Number(c.movie_id) === manualId) || null
        : null;

      if (manualCandidate) {
        champion = manualCandidate;
        selectionMode = 'manual';
      } else {
        champion = autoBestMovie;
        selectionMode = 'auto';
      }
    }

    const wishlist =
      pickRow && pickRow.wishlist_title
        ? {
            title: String(pickRow.wishlist_title),
            director: pickRow.wishlist_director ? String(pickRow.wishlist_director) : null,
            poster_url: pickRow.wishlist_poster_url ? String(pickRow.wishlist_poster_url) : null,
            notes: pickRow.wishlist_notes ? String(pickRow.wishlist_notes) : null,
          }
        : null;

    const rarityTier = getYearRarityTier(year);
    yearsEntries.push({
      year,
      decadeKey: getDecadeKeyForYear(year),
      rarityTier,
      xpReward: TIME_MACHINE_XP_BY_RARITY[rarityTier] || 20,
      status: champion ? 'conquered' : 'locked',
      moviesCount: sortedCandidates.length,
      selectionMode,
      champion,
      autoBestMovie,
      candidates: sortedCandidates,
      wishlist,
    });
  }

  // Agrupa em décadas (2020s -> 1920s -> pioneers se existir)
  const decadesMap = new Map<string, TimeMachineYearEntry[]>();
  for (const entry of yearsEntries) {
    if (!decadesMap.has(entry.decadeKey)) {
      decadesMap.set(entry.decadeKey, []);
    }
    decadesMap.get(entry.decadeKey)!.push(entry);
  }

  const orderedDecadeKeys = Array.from(decadesMap.keys()).sort((a, b) => {
    const startA = DECADE_META[a]?.decadeStart ?? (parseInt(a, 10) || 0);
    const startB = DECADE_META[b]?.decadeStart ?? (parseInt(b, 10) || 0);
    return startB - startA;
  });

  const decades: TimeMachineDecadeEntry[] = orderedDecadeKeys.map((decKey) => {
    const decYears = (decadesMap.get(decKey) || []).sort((a, b) => b.year - a.year);
    const meta = DECADE_META[decKey] || {
      id: decKey,
      decadeStart: parseInt(decKey, 10) || 1900,
      label: `Anos ${decKey.replace('s', '')}`,
      subtitle: 'Arquivo Histórico Cinematográfico',
      badgeIcon: '🕰️',
    };

    const conqueredCount = decYears.filter((y) => y.status === 'conquered').length;
    const isStandardDecade = decKey !== 'pioneers';
    const relicTargetCount = isStandardDecade ? 10 : decYears.length;

    let isRelicUnlocked = false;
    if (isStandardDecade) {
      isRelicUnlocked = conqueredCount >= 10;
      if (decYears.length >= 10) {
        let fullTen = true;
        for (let y = meta.decadeStart; y <= meta.decadeStart + 9; y++) {
          const found = decYears.find((item) => item.year === y);
          if (!found || found.status !== 'conquered') {
            fullTen = false;
            break;
          }
        }
        isRelicUnlocked = fullTen;
      } else {
        isRelicUnlocked = false;
      }
    }

    return {
      id: decKey,
      decadeStart: meta.decadeStart,
      label: meta.label,
      subtitle: meta.subtitle,
      badgeIcon: meta.badgeIcon,
      conqueredCount,
      availableYearsCount: decYears.length,
      relicTargetCount,
      isRelicUnlocked,
      relicXp: isStandardDecade ? getDecadeCompletionXp(decKey) : 0,
      years: decYears,
    };
  });

  const xpSummary = computeTimeMachineXpSummary(catalogMovies);
  const officialYears = yearsEntries.filter(
    (y) => y.year >= MIN_TIME_MACHINE_YEAR && y.year <= maxYear
  );
  const officialConqueredCount = officialYears.filter((y) => y.status === 'conquered').length;
  const multiMovieYearsCount = yearsEntries.filter((y) => y.moviesCount >= 2).length;
  const manualOverridesCount = yearsEntries.filter((y) => y.selectionMode === 'manual').length;
  const oldestMovieYear =
    yearsEntries.filter((y) => y.status === 'conquered').slice(-1)[0]?.year || null;
  const newestMovieYear =
    yearsEntries.find((y) => y.status === 'conquered')?.year || null;

  return {
    stats: {
      minOfficialYear: MIN_TIME_MACHINE_YEAR,
      maxOfficialYear: maxYear,
      totalOfficialYears: officialYears.length,
      officialConqueredCount,
      totalConqueredYears: xpSummary.totalConqueredYears,
      remainingOfficialYears: Math.max(0, officialYears.length - officialConqueredCount),
      percentage:
        officialYears.length > 0
          ? Number(((officialConqueredCount / officialYears.length) * 100).toFixed(1))
          : 0,
      completedDecadesCount: Object.keys(xpSummary.completedDecades).length,
      totalClosedDecades: Math.floor((maxYear - MIN_TIME_MACHINE_YEAR + 1) / 10),
      multiMovieYearsCount,
      manualOverridesCount,
      oldestMovieYear,
      newestMovieYear,
      yearsXp: xpSummary.yearsXp,
      decadesXp: xpSummary.decadesXp,
      totalXp: xpSummary.totalXp,
      byRarity: xpSummary.byRarity,
    },
    decades,
    years: yearsEntries,
  };
}

export async function setManualYearPick(year: number, movieId: number | null) {
  await ensureTimeMachineTables();
  const parsedYear = Number(year);
  if (!Number.isFinite(parsedYear) || parsedYear < 1888 || parsedYear > 2100) {
    throw new Error('Ano inválido para a Máquina do Tempo.');
  }

  await query(
    `
    INSERT INTO time_machine_picks (year, champion_movie_id, updated_at)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    ON CONFLICT (year)
    DO UPDATE SET
      champion_movie_id = EXCLUDED.champion_movie_id,
      updated_at = CURRENT_TIMESTAMP
  `,
    [parsedYear, movieId]
  );

  return buildTimeMachinePayload();
}

export async function setYearWishlistTarget(
  year: number,
  wishlist: {
    title?: string | null;
    director?: string | null;
    poster_url?: string | null;
    notes?: string | null;
  } | null
) {
  await ensureTimeMachineTables();
  const parsedYear = Number(year);
  if (!Number.isFinite(parsedYear) || parsedYear < 1888 || parsedYear > 2100) {
    throw new Error('Ano inválido para a Máquina do Tempo.');
  }

  const title = wishlist?.title?.trim() || null;
  const director = wishlist?.director?.trim() || null;
  const posterUrl = wishlist?.poster_url?.trim() || null;
  const notes = wishlist?.notes?.trim() || null;

  await query(
    `
    INSERT INTO time_machine_picks (year, wishlist_title, wishlist_director, wishlist_poster_url, wishlist_notes, updated_at)
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    ON CONFLICT (year)
    DO UPDATE SET
      wishlist_title = EXCLUDED.wishlist_title,
      wishlist_director = EXCLUDED.wishlist_director,
      wishlist_poster_url = EXCLUDED.wishlist_poster_url,
      wishlist_notes = EXCLUDED.wishlist_notes,
      updated_at = CURRENT_TIMESTAMP
  `,
    [parsedYear, title, director, posterUrl, notes]
  );

  return buildTimeMachinePayload();
}
