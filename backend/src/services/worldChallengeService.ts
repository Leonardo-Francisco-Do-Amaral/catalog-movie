import { query } from '../config/database';
import {
  UN_COUNTRIES_195,
  HISTORICAL_TERRITORIES,
  ContinentName,
  CountryRarityTier,
  getCountryRarityTier,
} from '../data/unCountries195';

let tablesEnsured = false;

export async function ensureChallengeTables(): Promise<void> {
  if (tablesEnsured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS world_challenge_picks (
      country_code VARCHAR(16) PRIMARY KEY,
      country_name VARCHAR(120) NOT NULL,
      champion_movie_id INTEGER REFERENCES movies(id) ON DELETE SET NULL,
      wishlist_title VARCHAR(255),
      wishlist_year INTEGER,
      wishlist_tmdb_id INTEGER,
      wishlist_poster_url TEXT,
      wishlist_director VARCHAR(255),
      wishlist_notes TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS world_challenge_movie_origins (
      movie_id INTEGER PRIMARY KEY REFERENCES movies(id) ON DELETE CASCADE,
      primary_country_code VARCHAR(16) NOT NULL,
      exclusive BOOLEAN DEFAULT TRUE,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  tablesEnsured = true;
}

export interface CoproductionCountryRef {
  code: string;
  name: string;
  flagCode: string | null;
  isHistorical?: boolean;
  rarityTier?: CountryRarityTier;
}

export interface ChallengeMovieItem {
  movie_id: number;
  view_id: number;
  title: string;
  original_title: string | null;
  release_year: number | null;
  runtime: number | null;
  poster_url: string | null;
  user_rating: number;
  user_rating_raw?: string | number | null;
  imdb_rating: number | null;
  metacritic_score: number | null;
  rotten_tomatoes_score?: number | null;
  vote_count?: number | null;
  month_seen: number | null;
  year_seen: number | null;
  audio_type?: string | null;
  platform?: string | null;
  watched_at: string | null;
  directors: string[];
  countries: string[];
  tags: string[];
  genres: string[];
  coproductionCountries: CoproductionCountryRef[];
  defaultCountryCode: string | null;
  primaryCountryCode: string | null;
  primaryCountryName: string | null;
  originMode: 'manual' | 'auto';
  writers?: string[];
  studios?: string[];
  distributor?: string | null;
  oscar_wins?: number;
  oscar_nominations?: number;
  raw_api_data?: any;
}

export interface BorderDisputeItem {
  movie: ChallengeMovieItem;
  allocatedToCode: string;
  allocatedToName: string;
  isChampionAtOwner: boolean;
}

export interface ChallengeWishlistItem {
  title: string;
  year: number | null;
  tmdb_id: number | null;
  poster_url: string | null;
  director: string | null;
  notes: string | null;
}

export interface ChallengeCountryEntry {
  code: string;
  iso3: string;
  name: string;
  continent: ContinentName;
  lat: number;
  lon: number;
  rarityTier: CountryRarityTier;
  status: 'conquered' | 'wishlist' | 'unconquered';
  selectionMode: 'manual' | 'auto' | null;
  champion: ChallengeMovieItem | null;
  candidates: ChallengeMovieItem[];
  totalCandidates: number;
  borderDisputes: BorderDisputeItem[];
  wishlist: ChallengeWishlistItem | null;
}

export interface HistoricalCountryEntry {
  code: string;
  flagCode?: string;
  name: string;
  era: string;
  description: string;
  isSpecialTerritory?: boolean;
  status: 'conquered' | 'unconquered';
  selectionMode: 'manual' | 'auto' | null;
  champion: ChallengeMovieItem | null;
  candidates: ChallengeMovieItem[];
  totalCandidates: number;
  borderDisputes: BorderDisputeItem[];
}

function cleanStr(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Índices rápidos para os 195 países e territórios históricos
const unByCode = new Map(UN_COUNTRIES_195.map((c) => [c.code, c]));
const histByCode = new Map(HISTORICAL_TERRITORIES.map((h) => [h.code, h]));

const unLookupMap = new Map<string, string>(); // alias limpo -> country.code
for (const c of UN_COUNTRIES_195) {
  unLookupMap.set(cleanStr(c.code), c.code);
  unLookupMap.set(cleanStr(c.iso3), c.code);
  unLookupMap.set(cleanStr(c.name), c.code);
  if (c.aliases) {
    for (const al of c.aliases) {
      unLookupMap.set(cleanStr(al), c.code);
    }
  }
}

const histLookupMap = new Map<string, string>(); // alias limpo -> hist.code
for (const h of HISTORICAL_TERRITORIES) {
  histLookupMap.set(cleanStr(h.code), h.code);
  histLookupMap.set(cleanStr(h.name), h.code);
  for (const al of h.aliases) {
    histLookupMap.set(cleanStr(al), h.code);
  }
}

const SPECIAL_CINEMA_TERRITORIES: Record<
  string,
  { code: string; flagCode: string; name: string; description: string }
> = {
  'hong kong': {
    code: 'spec_hk',
    flagCode: 'hk',
    name: 'Hong Kong',
    description: 'Região Administrativa Especial com tradição cinematográfica própria (Action/New Wave de HK).',
  },
  taiwan: {
    code: 'spec_tw',
    flagCode: 'tw',
    name: 'Taiwan',
    description: 'Polo histórico do Novo Cinema Taiwanês (Edward Yang, Hou Hsiao-hsien, Ang Lee).',
  },
  'porto rico': {
    code: 'spec_pr',
    flagCode: 'pr',
    name: 'Porto Rico',
    description: 'Território caribenho não-incorporado listado separadamente em bases cinematográficas.',
  },
  'puerto rico': {
    code: 'spec_pr',
    flagCode: 'pr',
    name: 'Porto Rico',
    description: 'Território caribenho não-incorporado listado separadamente em bases cinematográficas.',
  },
  kosovo: {
    code: 'spec_xk',
    flagCode: 'xk',
    name: 'Kosovo',
    description: 'Território balcânico parcialmente reconhecido fora da lista de 195 assentos da ONU.',
  },
};

const dynamicExtraTerritories = new Map<
  string,
  { code: string; flagCode?: string; name: string; era: string; description: string; isSpecialTerritory?: boolean }
>();

export function resolveTerritoryDescriptor(rawCountry: string): CoproductionCountryRef | null {
  const cleaned = cleanStr(rawCountry);
  if (!cleaned || cleaned === 'desconhecido') return null;

  // 1. Verifica Territórios Históricos / Extintos
  const histCode = histLookupMap.get(cleaned);
  if (histCode) {
    const hDef = histByCode.get(histCode)!;
    return {
      code: hDef.code,
      name: hDef.name,
      flagCode: hDef.flagCode || null,
      isHistorical: true,
    };
  }

  // 2. Verifica os 195 Países Oficiais da ONU
  const unCode = unLookupMap.get(cleaned);
  if (unCode) {
    const uDef = unByCode.get(unCode)!;
    return {
      code: uDef.code,
      name: uDef.name,
      flagCode: uDef.code,
      isHistorical: false,
      rarityTier: uDef.rarityTier,
    };
  }

  // 3. Verifica Territórios Especiais / Fora da ONU (ex.: Hong Kong, Taiwan)
  const spec = SPECIAL_CINEMA_TERRITORIES[cleaned];
  if (spec) {
    dynamicExtraTerritories.set(spec.code, {
      code: spec.code,
      flagCode: spec.flagCode,
      name: spec.name,
      era: 'Território Autônomo / Não-ONU',
      description: spec.description,
      isSpecialTerritory: true,
    });
    return {
      code: spec.code,
      name: spec.name,
      flagCode: spec.flagCode,
      isHistorical: true,
    };
  }

  const dynCode = `extra_${cleaned.replace(/[^a-z0-9]/g, '_').slice(0, 10)}`;
  if (!dynamicExtraTerritories.has(dynCode)) {
    dynamicExtraTerritories.set(dynCode, {
      code: dynCode,
      name: rawCountry.trim(),
      era: 'Arquivo Histórico / Especial',
      description: 'Território listado no catálogo fora das 195 fronteiras atuais da ONU.',
    });
  }
  return {
    code: dynCode,
    name: rawCountry.trim(),
    flagCode: null,
    isHistorical: true,
  };
}

export function getTerritoryNameByCode(code: string | null): string | null {
  if (!code) return null;
  if (unByCode.has(code)) return unByCode.get(code)!.name;
  if (histByCode.has(code)) return histByCode.get(code)!.name;
  if (dynamicExtraTerritories.has(code)) return dynamicExtraTerritories.get(code)!.name;
  return code.toUpperCase();
}

function compareChallengeCandidates(a: ChallengeMovieItem, b: ChallengeMovieItem): number {
  const rDiff = (Number(b.user_rating) || 0) - (Number(a.user_rating) || 0);
  if (Math.abs(rDiff) > 0.0001) return rDiff;

  const ysDiff = (Number(b.year_seen) || 0) - (Number(a.year_seen) || 0);
  if (ysDiff !== 0) return ysDiff;

  const msDiff = (Number(b.month_seen) || 0) - (Number(a.month_seen) || 0);
  if (msDiff !== 0) return msDiff;

  const ryDiff = (Number(b.release_year) || 0) - (Number(a.release_year) || 0);
  if (ryDiff !== 0) return ryDiff;

  const tA = a.watched_at ? new Date(a.watched_at).getTime() : 0;
  const tB = b.watched_at ? new Date(b.watched_at).getTime() : 0;
  if (tB !== tA) return tB - tA;

  return b.movie_id - a.movie_id;
}

/**
 * Monta todo o estado consolidado do Desafio Volta ao Mundo em 195 Filmes.
 * Regra de Unicidade Estrita: CADA FILME OCUPA NO MÁXIMO UM ÚNICO PAÍS NO DESAFIO.
 */
export async function buildWorldChallengePayload() {
  await ensureChallengeTables();

  const [moviesRes, picksRes, originsRes] = await Promise.all([
    query(`
      SELECT DISTINCT ON (m.id)
             m.id as movie_id,
             mv.id as view_id,
             m.title,
             m.original_title,
             m.release_year,
             m.runtime,
             m.poster_url,
             m.imdb_rating,
             m.metacritic_score,
             m.rotten_tomatoes_score,
             m.vote_count,
             m.distributor,
             m.oscar_wins,
             m.oscar_nominations,
             m.raw_api_data,
             mv.user_rating,
             mv.month_seen,
             mv.year_seen,
             mv.audio_type,
             mv.platform,
             mv.watched_at,
             COALESCE(
               (
                 SELECT array_agg(DISTINCT d.name)
                 FROM movie_directors md
                 JOIN directors d ON d.id = md.director_id
                 WHERE md.movie_id = m.id
               ),
               '{}'
             ) as directors,
             COALESCE(
               (
                 SELECT array_agg(DISTINCT w.name)
                 FROM movie_writers mw
                 JOIN writers w ON w.id = mw.writer_id
                 WHERE mw.movie_id = m.id
               ),
               '{}'
             ) as writers,
             COALESCE(
               (
                 SELECT array_agg(DISTINCT s.name)
                 FROM movie_studios ms
                 JOIN studios s ON s.id = ms.studio_id
                 WHERE ms.movie_id = m.id
               ),
               '{}'
             ) as studios,
             COALESCE(
               (
                 SELECT array_agg(c.name ORDER BY mc.ctid ASC)
                 FROM movie_countries mc
                 JOIN countries c ON c.id = mc.country_id
                 WHERE mc.movie_id = m.id
               ),
               '{}'
             ) as countries,
             COALESCE(
               (
                 SELECT array_agg(DISTINCT ut.name)
                 FROM movie_tags mt
                 JOIN user_tags ut ON ut.id = mt.tag_id
                 WHERE mt.movie_id = m.id
               ),
               '{}'
             ) as tags,
             COALESCE(
               (
                 SELECT array_agg(DISTINCT g.name)
                 FROM movie_api_genres mg
                 JOIN api_genres g ON g.id = mg.genre_id
                 WHERE mg.movie_id = m.id
               ),
               '{}'
             ) as genres
      FROM movies m
      JOIN movie_views mv ON mv.movie_id = m.id
      ORDER BY m.id, mv.user_rating DESC NULLS LAST, mv.watched_at DESC
    `),
    query('SELECT * FROM world_challenge_picks ORDER BY updated_at DESC'),
    query('SELECT * FROM world_challenge_movie_origins'),
  ]);

  const originsByMovieId = new Map<number, string>();
  for (const row of originsRes.rows) {
    if (row.primary_country_code) {
      originsByMovieId.set(Number(row.movie_id), String(row.primary_country_code).toLowerCase().trim());
    }
  }

  const picksByCode = new Map<
    string,
    {
      champion_movie_id: number | null;
      wishlist: ChallengeWishlistItem | null;
    }
  >();

  // Se algum filme foi fixado manualmente em world_challenge_picks mas ainda não tinha linha em origins,
  // garantimos que apenas o país mais recente o detenha.
  const manualPickOwnerByMovieId = new Map<number, string>();

  for (const row of picksRes.rows) {
    const code = String(row.country_code).toLowerCase().trim();
    const hasWishlist = Boolean(row.wishlist_title && String(row.wishlist_title).trim());
    const rawChampId = row.champion_movie_id ? Number(row.champion_movie_id) : null;

    let validChampId: number | null = rawChampId;
    if (rawChampId !== null) {
      const explicitOrigin = originsByMovieId.get(rawChampId);
      if (explicitOrigin && explicitOrigin !== code) {
        validChampId = null;
      } else if (manualPickOwnerByMovieId.has(rawChampId)) {
        validChampId = null;
      } else {
        manualPickOwnerByMovieId.set(rawChampId, code);
      }
    }

    picksByCode.set(code, {
      champion_movie_id: validChampId,
      wishlist: hasWishlist
        ? {
            title: String(row.wishlist_title).trim(),
            year: row.wishlist_year ? Number(row.wishlist_year) : null,
            tmdb_id: row.wishlist_tmdb_id ? Number(row.wishlist_tmdb_id) : null,
            poster_url: row.wishlist_poster_url || null,
            director: row.wishlist_director || null,
            notes: row.wishlist_notes || null,
          }
        : null,
    });
  }

  const allMoviesMap = new Map<number, ChallengeMovieItem>();
  const candidatesByCode = new Map<string, Map<number, ChallengeMovieItem>>();

  const addCandidate = (code: string, movie: ChallengeMovieItem) => {
    if (!candidatesByCode.has(code)) {
      candidatesByCode.set(code, new Map());
    }
    candidatesByCode.get(code)!.set(movie.movie_id, movie);
  };

  for (const r of moviesRes.rows) {
    const movieId = Number(r.movie_id);
    const rawCountries: string[] = Array.isArray(r.countries) ? r.countries : [];

    // Resolve países da coprodução preservando a ordem exata (1º país listado = padrão)
    const coproductionCountries: CoproductionCountryRef[] = [];
    const seenCodes = new Set<string>();

    for (const rawName of rawCountries) {
      const ref = resolveTerritoryDescriptor(rawName);
      if (ref && !seenCodes.has(ref.code)) {
        seenCodes.add(ref.code);
        coproductionCountries.push(ref);
      }
    }

    const isCoproduction =
      coproductionCountries.length > 1 ||
      (rawCountries.length > 1 && coproductionCountries.length >= 1);
    const defaultCountryCode = coproductionCountries[0]?.code || null;
    const manualOriginCode = originsByMovieId.get(movieId) || manualPickOwnerByMovieId.get(movieId) || null;
    // REGRA DE OURO DAS COPRODUÇÕES:
    // - Filme de 1 único país (!isCoproduction): atribuição automática imediata ao país.
    // - Coprodução (> 1 país): vai para a Central de Curadoria de Coproduções e SÓ conquista país
    //   no Desafio 195 (e libera o XP do país) quando o usuário atribuir manualmente (manualOriginCode)!
    const primaryCountryCode = isCoproduction ? manualOriginCode : manualOriginCode || defaultCountryCode;
    const originMode: 'manual' | 'auto' = manualOriginCode ? 'manual' : 'auto';

    // Caso o usuário tenha atribuído manualmente o filme a um país que não estava nos créditos originais,
    // adicionamos esse país na lista de fronteiras do filme para exibição consistente na UI
    if (primaryCountryCode && !seenCodes.has(primaryCountryCode)) {
      const uDef = unByCode.get(primaryCountryCode);
      const hDef = histByCode.get(primaryCountryCode);
      const dDef = dynamicExtraTerritories.get(primaryCountryCode);
      if (uDef) {
        coproductionCountries.unshift({
          code: uDef.code,
          name: uDef.name,
          flagCode: uDef.code,
          isHistorical: false,
          rarityTier: uDef.rarityTier,
        });
      } else if (hDef || dDef) {
        const target = (hDef || dDef)!;
        coproductionCountries.unshift({
          code: target.code,
          name: target.name,
          flagCode: target.flagCode || null,
          isHistorical: true,
        });
      }
    }

    const primaryCountryName = getTerritoryNameByCode(primaryCountryCode);

    const movieItem: ChallengeMovieItem = {
      movie_id: movieId,
      view_id: Number(r.view_id),
      title: r.title,
      original_title: r.original_title || null,
      release_year: r.release_year ? Number(r.release_year) : null,
      runtime: r.runtime ? Number(r.runtime) : null,
      poster_url: r.poster_url || null,
      user_rating: r.user_rating !== null && r.user_rating !== undefined ? Number(r.user_rating) : 0,
      user_rating_raw: r.user_rating !== null && r.user_rating !== undefined ? r.user_rating : null,
      imdb_rating: r.imdb_rating !== null && r.imdb_rating !== undefined ? Number(r.imdb_rating) : null,
      metacritic_score:
        r.metacritic_score !== null && r.metacritic_score !== undefined ? Number(r.metacritic_score) : null,
      rotten_tomatoes_score:
        r.rotten_tomatoes_score !== null && r.rotten_tomatoes_score !== undefined ? Number(r.rotten_tomatoes_score) : null,
      vote_count:
        r.vote_count !== null && r.vote_count !== undefined ? Number(r.vote_count) : null,
      month_seen: r.month_seen ? Number(r.month_seen) : null,
      year_seen: r.year_seen ? Number(r.year_seen) : null,
      audio_type: r.audio_type || null,
      platform: r.platform || null,
      watched_at: r.watched_at ? String(r.watched_at) : null,
      directors: Array.isArray(r.directors) ? r.directors : [],
      writers: Array.isArray(r.writers) ? r.writers : [],
      studios: Array.isArray(r.studios) ? r.studios : [],
      distributor: r.distributor || null,
      oscar_wins: r.oscar_wins !== null && r.oscar_wins !== undefined ? Number(r.oscar_wins) : 0,
      oscar_nominations:
        r.oscar_nominations !== null && r.oscar_nominations !== undefined ? Number(r.oscar_nominations) : 0,
      raw_api_data: r.raw_api_data || null,
      countries: rawCountries,
      tags: Array.isArray(r.tags) ? r.tags : [],
      genres: Array.isArray(r.genres) ? r.genres : [],
      coproductionCountries,
      defaultCountryCode,
      primaryCountryCode,
      primaryCountryName,
      originMode,
    };

    allMoviesMap.set(movieId, movieItem);

    // UNICIDADE ESTRITA: o filme entra APENAS na piscina de candidatos do seu País Primário!
    if (primaryCountryCode) {
      addCandidate(primaryCountryCode, movieItem);
    }
  }

  // Passo 1: Determina o Campeão único de cada um dos 195 países e territórios históricos
  const championMovieIdByTerritory = new Map<string, number>();

  const countriesResult: ChallengeCountryEntry[] = UN_COUNTRIES_195.map((def) => {
    const code = def.code;
    const pick = picksByCode.get(code);
    const candMap = candidatesByCode.get(code) || new Map<number, ChallengeMovieItem>();
    const sortedCandidates = Array.from(candMap.values()).sort(compareChallengeCandidates);

    let champion: ChallengeMovieItem | null = null;
    let selectionMode: 'manual' | 'auto' | null = null;

    if (pick?.champion_movie_id && candMap.has(pick.champion_movie_id)) {
      champion = { ...candMap.get(pick.champion_movie_id)! };
      selectionMode = 'manual';
    } else if (sortedCandidates.length > 0) {
      champion = { ...sortedCandidates[0] };
      selectionMode = 'auto';
    }

    if (champion) {
      championMovieIdByTerritory.set(code, champion.movie_id);
    }

    const wishlist = pick?.wishlist || null;
    const status: 'conquered' | 'wishlist' | 'unconquered' = champion
      ? 'conquered'
      : wishlist
        ? 'wishlist'
        : 'unconquered';

    return {
      code,
      iso3: def.iso3,
      name: def.name,
      continent: def.continent,
      lat: def.lat,
      lon: def.lon,
      rarityTier: def.rarityTier || getCountryRarityTier(code),
      status,
      selectionMode,
      champion,
      candidates: sortedCandidates,
      totalCandidates: sortedCandidates.length,
      borderDisputes: [],
      wishlist,
    };
  });

  const combinedHistoricalDefs = [
    ...HISTORICAL_TERRITORIES.map((h) => ({ ...h, isSpecialTerritory: false })),
    ...Array.from(dynamicExtraTerritories.values()),
  ];

  const historicalCountries: HistoricalCountryEntry[] = combinedHistoricalDefs.map((hDef) => {
    const pick = picksByCode.get(hDef.code);
    const candMap = candidatesByCode.get(hDef.code) || new Map<number, ChallengeMovieItem>();
    const sortedCandidates = Array.from(candMap.values()).sort(compareChallengeCandidates);

    let champion: ChallengeMovieItem | null = null;
    let selectionMode: 'manual' | 'auto' | null = null;

    if (pick?.champion_movie_id && candMap.has(pick.champion_movie_id)) {
      champion = { ...candMap.get(pick.champion_movie_id)! };
      selectionMode = 'manual';
    } else if (sortedCandidates.length > 0) {
      champion = { ...sortedCandidates[0] };
      selectionMode = 'auto';
    }

    if (champion) {
      championMovieIdByTerritory.set(hDef.code, champion.movie_id);
    }

    return {
      code: hDef.code,
      flagCode: hDef.flagCode,
      name: hDef.name,
      era: hDef.era,
      description: hDef.description,
      isSpecialTerritory: Boolean(hDef.isSpecialTerritory),
      status: champion ? 'conquered' : 'unconquered',
      selectionMode,
      champion,
      candidates: sortedCandidates,
      totalCandidates: sortedCandidates.length,
      borderDisputes: [],
    };
  });

  // Passo 2: Indexa "Disputas de Fronteira" — coproduções ligadas a um país mas alocadas em outro país primário
  const disputesByCode = new Map<string, BorderDisputeItem[]>();
  for (const movie of allMoviesMap.values()) {
    if (!movie.primaryCountryCode || movie.coproductionCountries.length <= 1) continue;
    const ownerChampId = championMovieIdByTerritory.get(movie.primaryCountryCode);

    for (const cp of movie.coproductionCountries) {
      if (cp.code === movie.primaryCountryCode) continue;
      if (!disputesByCode.has(cp.code)) {
        disputesByCode.set(cp.code, []);
      }
      disputesByCode.get(cp.code)!.push({
        movie,
        allocatedToCode: movie.primaryCountryCode,
        allocatedToName: movie.primaryCountryName || movie.primaryCountryCode.toUpperCase(),
        isChampionAtOwner: ownerChampId === movie.movie_id,
      });
    }
  }

  for (const c of countriesResult) {
    const list = disputesByCode.get(c.code) || [];
    c.borderDisputes = list.sort((a, b) => compareChallengeCandidates(a.movie, b.movie));
  }

  for (const h of historicalCountries) {
    const list = disputesByCode.get(h.code) || [];
    h.borderDisputes = list.sort((a, b) => compareChallengeCandidates(a.movie, b.movie));
  }

  // Estatísticas globais do HUD + Progresso por Continente + Progresso por Raridade RPG
  const conqueredList = countriesResult.filter((c) => c.status === 'conquered');
  const conqueredCount = conqueredList.length;
  const wishlistCount = countriesResult.filter((c) => c.status === 'wishlist').length;
  const manualPicksCount =
    countriesResult.filter((c) => c.selectionMode === 'manual').length +
    Array.from(allMoviesMap.values()).filter((m) => m.originMode === 'manual').length;

  const ratingSum = conqueredList.reduce((acc, c) => acc + (c.champion?.user_rating || 0), 0);
  const avgChampionRating =
    conqueredCount > 0 ? Number((ratingSum / conqueredCount).toFixed(2)) : 0;

  const continentsOrder: ContinentName[] = ['Américas', 'Europa', 'Ásia', 'África', 'Oceania'];
  const continentStats: Record<string, { total: number; conquered: number; percentage: number }> = {};

  for (const cont of continentsOrder) {
    const inCont = countriesResult.filter((c) => c.continent === cont);
    const conqInCont = inCont.filter((c) => c.status === 'conquered').length;
    continentStats[cont] = {
      total: inCont.length,
      conquered: conqInCont,
      percentage: inCont.length > 0 ? Math.round((conqInCont / inCont.length) * 100) : 0,
    };
  }

  const rarityOrder: CountryRarityTier[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];
  const rarityStats: Record<CountryRarityTier, { total: number; conquered: number; percentage: number }> = {
    common: { total: 0, conquered: 0, percentage: 0 },
    rare: { total: 0, conquered: 0, percentage: 0 },
    epic: { total: 0, conquered: 0, percentage: 0 },
    legendary: { total: 0, conquered: 0, percentage: 0 },
    mythic: { total: 0, conquered: 0, percentage: 0 },
  };

  for (const tier of rarityOrder) {
    const inTier = countriesResult.filter((c) => c.rarityTier === tier);
    const conqInTier = inTier.filter((c) => c.status === 'conquered').length;
    rarityStats[tier] = {
      total: inTier.length,
      conquered: conqInTier,
      percentage: inTier.length > 0 ? Math.round((conqInTier / inTier.length) * 100) : 0,
    };
  }

  const historicalConqueredCount = historicalCountries.filter(
    (h) => !h.isSpecialTerritory && h.status === 'conquered'
  ).length;

  const catalogMovies = Array.from(allMoviesMap.values()).sort(compareChallengeCandidates);

  return {
    summary: {
      totalCountries: 195,
      conqueredCount,
      unconqueredCount: 195 - conqueredCount,
      wishlistCount,
      percentage: Number(((conqueredCount / 195) * 100).toFixed(1)),
      avgChampionRating,
      manualPicksCount,
      continentStats,
      rarityStats,
      historicalConqueredCount,
    },
    countries: countriesResult,
    historicalCountries,
    catalogMovies,
  };
}

/**
 * Fixa ou remove o representante manual (Campeão) de um país ou território histórico.
 * Como cada filme só pode ocupar UM ÚNICO PAÍS no desafio, ao fixar um filme em um país,
 * ele é transferido automaticamente como País Primário para essa nação e liberado de qualquer outro país.
 */
export async function setManualCountryPick(
  countryCode: string,
  countryName: string,
  movieId: number | null,
  _lockExclusiveOrigin: boolean = true
) {
  await ensureChallengeTables();
  const code = countryCode.toLowerCase().trim();

  if (movieId !== null) {
    // Remove eventual fixação anterior deste mesmo filme em outro país
    await query(
      `UPDATE world_challenge_picks
       SET champion_movie_id = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE champion_movie_id = $1 AND country_code <> $2`,
      [movieId, code]
    );

    // Define este país como o País Primário oficial deste filme no desafio
    await query(
      `INSERT INTO world_challenge_movie_origins (movie_id, primary_country_code, exclusive, updated_at)
       VALUES ($1, $2, TRUE, CURRENT_TIMESTAMP)
       ON CONFLICT (movie_id)
       DO UPDATE SET
         primary_country_code = EXCLUDED.primary_country_code,
         exclusive = TRUE,
         updated_at = CURRENT_TIMESTAMP`,
      [movieId, code]
    );
  }

  await query(
    `
    INSERT INTO world_challenge_picks (country_code, country_name, champion_movie_id, updated_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    ON CONFLICT (country_code)
    DO UPDATE SET
      country_name = EXCLUDED.country_name,
      champion_movie_id = EXCLUDED.champion_movie_id,
      updated_at = CURRENT_TIMESTAMP
    `,
    [code, countryName || code.toUpperCase(), movieId]
  );

  return buildWorldChallengePayload();
}

/**
 * Altera (ou restaura para o 1º país listado se countryCode = null) a qual nação o filme pertence
 * como "País Primário do Desafio". O país anterior recalcula automaticamente seu campeão!
 */
export async function setMovieCulturalOrigin(movieId: number, countryCode: string | null) {
  await ensureChallengeTables();

  if (!countryCode) {
    await query('DELETE FROM world_challenge_movie_origins WHERE movie_id = $1', [movieId]);
    await query(
      `UPDATE world_challenge_picks
       SET champion_movie_id = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE champion_movie_id = $1`,
      [movieId]
    );
  } else {
    const code = countryCode.toLowerCase().trim();

    // Desfaz qualquer fixação manual deste filme em outros países para que o país anterior recalcule
    await query(
      `UPDATE world_challenge_picks
       SET champion_movie_id = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE champion_movie_id = $1 AND country_code <> $2`,
      [movieId, code]
    );

    await query(
      `
      INSERT INTO world_challenge_movie_origins (movie_id, primary_country_code, exclusive, updated_at)
      VALUES ($1, $2, TRUE, CURRENT_TIMESTAMP)
      ON CONFLICT (movie_id)
      DO UPDATE SET
        primary_country_code = EXCLUDED.primary_country_code,
        exclusive = TRUE,
        updated_at = CURRENT_TIMESTAMP
      `,
      [movieId, code]
    );
  }

  return buildWorldChallengePayload();
}

/**
 * Define ou limpa um Filme Alvo (Backlog / Wishlist) para um país pendente ("Terra Incógnita").
 */
export async function setCountryWishlistTarget(
  countryCode: string,
  countryName: string,
  wishlist: Partial<ChallengeWishlistItem> | null
) {
  await ensureChallengeTables();
  const code = countryCode.toLowerCase().trim();
  const cleanTitle = wishlist?.title?.trim() || null;

  await query(
    `
    INSERT INTO world_challenge_picks (
      country_code, country_name, wishlist_title, wishlist_year,
      wishlist_tmdb_id, wishlist_poster_url, wishlist_director, wishlist_notes, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
    ON CONFLICT (country_code)
    DO UPDATE SET
      country_name = EXCLUDED.country_name,
      wishlist_title = EXCLUDED.wishlist_title,
      wishlist_year = EXCLUDED.wishlist_year,
      wishlist_tmdb_id = EXCLUDED.wishlist_tmdb_id,
      wishlist_poster_url = EXCLUDED.wishlist_poster_url,
      wishlist_director = EXCLUDED.wishlist_director,
      wishlist_notes = EXCLUDED.wishlist_notes,
      updated_at = CURRENT_TIMESTAMP
    `,
    [
      code,
      countryName || code.toUpperCase(),
      cleanTitle,
      cleanTitle && wishlist?.year ? Number(wishlist.year) : null,
      cleanTitle && wishlist?.tmdb_id ? Number(wishlist.tmdb_id) : null,
      cleanTitle ? wishlist?.poster_url || null : null,
      cleanTitle ? wishlist?.director || null : null,
      cleanTitle ? wishlist?.notes || null : null,
    ]
  );

  return buildWorldChallengePayload();
}
