import axios from 'axios';
import { query } from '../../../config/database';
import { buildWalkOfFamePayload } from '../../../services/walkOfFameService';
import {
  LEGENDARY_TV_VOICES,
  SHARED_CINEMA_VOICE_FRANCHISES,
  VOICE_ALBUM_CEILING,
  VOICE_IMMORTAL_AURA_ORDER,
  VOICE_MILESTONES,
  VOICE_TIER_ORDER,
  VoiceImmortalAuraId,
  VoiceRarityTier,
  computeVoiceXpSplit,
  resolveVoiceTier,
} from '../data/legendaryVoices';
import { ensureTvSchema } from '../schema';
import { TvShowRecord } from '../types';
import { listAllTvShows } from './catalogService';

const ANILIST_GRAPHQL_URL = 'https://graphql.anilist.co';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMG_W185 = 'https://image.tmdb.org/t/p/w185';
const PERSON_CACHE_TTL_MS = 14 * 24 * 60 * 60 * 1000;

function normalizeVoiceText(raw?: string | null): string {
  return String(raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripHtmlTags(raw?: string | null): string {
  if (!raw) return '';
  return String(raw)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/~!|!~/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export interface VoiceAlbumWorkItem {
  source: 'cinema' | 'tv';
  id: number;
  workKey: string;
  title: string;
  originalTitle: string | null;
  year: number | null;
  posterUrl: string | null;
  character: string | null;
  characterName: string | null;
  characterImageUrl: string | null;
  userRating: number | null;
  kindLabel: string; // 'Filme' | 'Anime' | 'Série' | 'Dorama'
}

export interface VoiceSkinOption {
  id: string;
  label: string;
  sublabel: string;
  imageUrl: string;
  kind: 'portrait' | 'wiki' | 'work_poster' | 'custom';
}

export interface VoiceDecadeEntry {
  decade: number;
  label: string;
  count: number;
  avgRating: number | null;
  topTitle: string | null;
}

export interface TvVoiceAlbumEntry {
  id: string;
  albumNumber: number;
  name: string;
  nationalityCode: 'jp' | 'us';
  nationalityLabel: string;
  icon: string;
  voiceType: string | null;
  hometown: string | null;
  birthday: string | null;
  deathday: string | null;
  isDeceased: boolean;
  photoUrl: string | null;
  activePhotoUrl: string | null;
  sourceOrigin: 'shared_cinema' | 'tv_curated' | 'discovered';
  tagline: string;
  knownFor: string;
  quote: string;
  quoteJp: string | null;
  rpgTitle: string;
  bio: string | null;
  wikiExtract: string | null;
  secretFact: string | null;
  curiosities: string[];
  signatureFranchises: string[];

  // Progresso & Raridade (Teto 35, 15/30/45/60/75/100 + ★ a cada +5 obras)
  percentage: number;
  ceiling: number;
  extraStars: number;
  worksToNextExtraStar: number;
  worksToUnlock15: number;
  nextMilestoneWorks: number | null;
  currentTier: VoiceRarityTier;
  tierLabel: string;
  tierIcon: string;
  tcgCode: string;
  rpgRank: string;
  nextTier: Exclude<VoiceRarityTier, 'locked'> | null;
  nextTierPct: number | null;
  nextTierXp: number | null;
  progressPercentage: number;

  // XP & Coleção
  xpEarned: number; // Potencial ou resgatado para referência
  potentialXp: number;
  claimedXp: number;
  unclaimedXp: number;
  claimedXpPct: number;
  claimedXpExtraStars: number;
  isStickerUnlocked: boolean;
  isStuck: boolean;
  stuckTier: VoiceRarityTier | null;
  previousStuckTier: VoiceRarityTier | null;
  stuckExtraStars: number;
  hasRarityUpgradeToStick: boolean;
  pendingPackId: number | null;
  pendingPackType: string | null;

  // Personalização
  skinOptions: VoiceSkinOption[];
  selectedSkinUrl: string | null;
  selectedSkinLabel: string | null;
  customSkinUrl: string | null;
  customSkinLabel: string | null;
  immortalAura: VoiceImmortalAuraId;
  signatureWorkKey: string | null;
  signatureWork: VoiceAlbumWorkItem | null;
  isFullArt: boolean;
  isFavoriteGuardian: boolean;

  // Métricas & Timeline
  watchedMoviesCount: number;
  watchedShowsCount: number;
  totalWorksCount: number;
  avgUserRating: number | null;
  topWork: VoiceAlbumWorkItem | null;
  decades: VoiceDecadeEntry[];
  favoriteDecade: VoiceDecadeEntry | null;
  watchedMovies: VoiceAlbumWorkItem[];
  watchedShows: VoiceAlbumWorkItem[];
  combinedWorks: VoiceAlbumWorkItem[];
}

export interface TvVoicePackItem {
  packId: number;
  voiceId: string;
  voiceName: string;
  voiceIcon: string;
  nationalityCode: 'jp' | 'us';
  photoUrl: string | null;
  rpgTitle: string;
  packType: string;
  fromTier: string | null;
  toTier: string;
  fromPct: number;
  toPct: number;
  extraStarsUnlocked: number;
  xpReward: number;
  triggerTitle: string | null;
  status: string;
  createdAt: string;
}

export interface TvVoiceAlbumPayload {
  voices: TvVoiceAlbumEntry[];
  pendingPacks: TvVoicePackItem[];
  summary: {
    totalVoices: number;
    unlockedVoices: number;
    stuckVoices: number;
    pendingPacksCount: number;
    jpCount: number;
    usCount: number;
    sharedMoviesMatches: number;
    tvShowsMatches: number;
    totalVoiceXp: number;
    potentialVoiceXp: number;
    rarityCounts: Record<VoiceRarityTier, number>;
    totalExtraStars: number;
  };
}

// ============================================================================
// SINCRONIZAÇÃO DE CRÉDITOS ANILIST & TMDB
// ============================================================================

async function upsertTvVoicePerson(
  name: string,
  imageUrl?: string | null,
  tmdbPersonId?: number | null
): Promise<number> {
  if (tmdbPersonId) {
    const res = await query(
      `INSERT INTO tv.people (name, image_url, tmdb_person_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (tmdb_person_id) DO UPDATE
         SET name = EXCLUDED.name,
             image_url = COALESCE(tv.people.image_url, EXCLUDED.image_url)
       RETURNING id`,
      [name, imageUrl || null, tmdbPersonId]
    );
    return Number(res.rows[0].id);
  }

  const existing = await query(
    `SELECT id FROM tv.people WHERE LOWER(name) = LOWER($1) LIMIT 1`,
    [name]
  );
  if (existing.rows.length > 0) {
    const id = Number(existing.rows[0].id);
    if (imageUrl) {
      await query(
        `UPDATE tv.people SET image_url = COALESCE(image_url, $1) WHERE id = $2`,
        [imageUrl, id]
      );
    }
    return id;
  }

  const ins = await query(
    `INSERT INTO tv.people (name, image_url) VALUES ($1, $2) RETURNING id`,
    [name, imageUrl || null]
  );
  return Number(ins.rows[0].id);
}

const ANILIST_CHARS_BY_MAL_QUERY = `
query ($malId: Int) {
  Media(idMal: $malId, type: ANIME) {
    id
    characters(sort: [ROLE, FAVOURITES_DESC], perPage: 14) {
      edges {
        role
        node {
          name { full }
          image { large medium }
        }
        voiceActorRoles {
          voiceActor {
            id
            name { full }
            languageV2
            image { large }
          }
        }
      }
    }
  }
}
`;

const ANILIST_CHARS_BY_SEARCH_QUERY = `
query ($search: String) {
  Media(search: $search, type: ANIME) {
    id
    characters(sort: [ROLE, FAVOURITES_DESC], perPage: 14) {
      edges {
        role
        node {
          name { full }
          image { large medium }
        }
        voiceActorRoles {
          voiceActor {
            id
            name { full }
            languageV2
            image { large }
          }
        }
      }
    }
  }
}
`;

const ANILIST_STAFF_QUERY = `
query ($search: String) {
  Staff(search: $search) {
    id
    name { full native }
    image { large medium }
    description
    homeTown
    dateOfBirth { year month day }
  }
}
`;

const inFlightVoiceSync = new Map<number, Promise<number>>();

export function syncShowVoiceCredits(show: TvShowRecord): Promise<number> {
  const existing = inFlightVoiceSync.get(show.id);
  if (existing) return existing;

  const task = performShowVoiceCreditsSync(show).finally(() => {
    if (inFlightVoiceSync.get(show.id) === task) {
      inFlightVoiceSync.delete(show.id);
    }
  });
  inFlightVoiceSync.set(show.id, task);
  return task;
}

async function performShowVoiceCreditsSync(show: TvShowRecord): Promise<number> {
  let savedCount = 0;

  if (show.kind === 'anime') {
    const malId = show.mal_id || show.seasons?.find((s) => s.mal_id)?.mal_id || null;
    let media: any = null;

    try {
      if (malId) {
        const res = await axios.post(
          ANILIST_GRAPHQL_URL,
          { query: ANILIST_CHARS_BY_MAL_QUERY, variables: { malId } },
          { timeout: 15000 }
        );
        media = res.data?.data?.Media || null;
      }
      if (!media) {
        const searchTitle = show.original_title || show.title;
        const res = await axios.post(
          ANILIST_GRAPHQL_URL,
          { query: ANILIST_CHARS_BY_SEARCH_QUERY, variables: { search: searchTitle } },
          { timeout: 15000 }
        );
        media = res.data?.data?.Media || null;
      }
    } catch (err: any) {
      console.warn('[TV Voice Sync AniList] Falha:', err?.message);
      return 0;
    }

    const edges: any[] = Array.isArray(media?.characters?.edges) ? media.characters.edges : [];
    for (const edge of edges) {
      const charName = String(edge?.node?.name?.full || '').trim();
      const charImageUrl = edge?.node?.image?.large || edge?.node?.image?.medium || null;
      const role = String(edge?.role || 'SUPPORTING').toUpperCase() === 'MAIN' ? 'Main' : 'Supporting';
      const vaRoles: any[] = Array.isArray(edge?.voiceActorRoles) ? edge.voiceActorRoles : [];

      for (const vr of vaRoles) {
        const va = vr?.voiceActor;
        const lang = String(va?.languageV2 || '').trim();
        if (lang !== 'Japanese' && lang !== 'English') continue;
        const album: 'jp' | 'us' = lang === 'Japanese' ? 'jp' : 'us';
        const vaName = String(va?.name?.full || '').trim();
        if (!vaName) continue;
        const imageUrl = va?.image?.large || va?.image?.medium || null;

        const personId = await upsertTvVoicePerson(vaName, imageUrl, null);
        await query(
          `INSERT INTO tv.voice_credits (show_id, person_id, character_name, role, album, character_image_url)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (show_id, person_id, character_name) DO UPDATE
             SET role = EXCLUDED.role,
                 album = EXCLUDED.album,
                 character_image_url = COALESCE(EXCLUDED.character_image_url, tv.voice_credits.character_image_url)`,
          [show.id, personId, charName, role, album, charImageUrl]
        );
        savedCount += 1;
      }
    }
    return savedCount;
  }

  // Séries ocidentais com gênero Animação (ex.: Liga da Justiça, Avatar, Arcane)
  const isAnimatedSeries =
    show.kind === 'series' &&
    Boolean(show.tmdb_tv_id) &&
    (show.genres || []).some((g) => /anima[çc][ãa]o|animation/i.test(g.name));

  if (isAnimatedSeries && show.tmdb_tv_id && process.env.TMDB_BEARER_TOKEN) {
    try {
      const res = await axios.get(`${TMDB_BASE_URL}/tv/${show.tmdb_tv_id}/aggregate_credits`, {
        timeout: 9000,
        headers: {
          Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
          Accept: 'application/json',
        },
        params: { language: 'pt-BR' },
      });
      const cast: any[] = Array.isArray(res.data?.cast) ? res.data.cast : [];
      for (const actor of cast.slice(0, 18)) {
        const actorName = String(actor?.name || '').trim();
        if (!actorName) continue;
        const rolesArr: any[] = Array.isArray(actor?.roles) ? actor.roles : [];
        const charName = String(rolesArr[0]?.character || '')
          .replace(/\(voice\)/gi, '')
          .trim();
        const imageUrl = actor?.profile_path ? `${TMDB_IMG_W185}${actor.profile_path}` : null;
        const tmdbPersonId = actor?.id ? Number(actor.id) : null;

        const personId = await upsertTvVoicePerson(actorName, imageUrl, tmdbPersonId);
        await query(
          `INSERT INTO tv.voice_credits (show_id, person_id, character_name, role, album)
           VALUES ($1, $2, $3, $4, 'us')
           ON CONFLICT (show_id, person_id, character_name) DO UPDATE
             SET role = EXCLUDED.role`,
          [show.id, personId, charName, actor?.order <= 6 ? 'Main' : 'Supporting']
        );
        savedCount += 1;
      }
    } catch (err: any) {
      console.warn('[TV Voice Sync TMDB] Falha:', err?.message);
      return 0;
    }
  }

  return savedCount;
}

// ============================================================================
// ENRIQUECIMENTO DE WIKIPÉDIA & ANILIST STAFF (CACHE ISOLADO EM tv.voice_person_cache)
// ============================================================================

interface PersonEnrichmentRow {
  person_key: string;
  wiki_title: string | null;
  wiki_extract: string | null;
  wiki_thumbnail: string | null;
  anilist_bio: string | null;
  anilist_image: string | null;
  hometown: string | null;
  birth_date: string | null;
  updated_at?: Date | string;
}

async function fetchWikipediaSummary(wikiTitle: string): Promise<{ extract: string | null; thumbnail: string | null }> {
  const headers = { 'User-Agent': 'CatalogMovieApp/1.0 (https://localhost)' };
  const langs = ['pt', 'en'];

  for (const lang of langs) {
    try {
      const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
      const res = await axios.get(url, { timeout: 3500, headers });
      const extract = res.data?.extract ? String(res.data.extract).trim() : null;
      const thumbnail = res.data?.thumbnail?.source ? String(res.data.thumbnail.source).trim() : null;
      if (extract && extract.length > 40) {
        return { extract, thumbnail };
      }
    } catch {
      // tenta próximo idioma
    }
  }
  return { extract: null, thumbnail: null };
}

async function fetchAniListStaffSafe(searchName: string): Promise<{
  image: string | null;
  bio: string | null;
  hometown: string | null;
  birthDate: string | null;
}> {
  try {
    const res = await axios.post(
      ANILIST_GRAPHQL_URL,
      { query: ANILIST_STAFF_QUERY, variables: { search: searchName } },
      { timeout: 4500 }
    );
    const st = res.data?.data?.Staff;
    if (!st) return { image: null, bio: null, hometown: null, birthDate: null };

    const image = st.image?.large || st.image?.medium || null;
    const bio = st.description ? stripHtmlTags(st.description).slice(0, 1200) : null;
    const hometown = st.homeTown ? String(st.homeTown).trim() : null;
    const dob = st.dateOfBirth;
    let birthDate: string | null = null;
    if (dob?.year) {
      const dd = dob.day ? String(dob.day).padStart(2, '0') : '??';
      const mm = dob.month ? String(dob.month).padStart(2, '0') : '??';
      birthDate = `${dd}/${mm}/${dob.year}`;
    }
    return { image, bio, hometown, birthDate };
  } catch {
    return { image: null, bio: null, hometown: null, birthDate: null };
  }
}

async function enrichPersonAndCache(
  personKey: string,
  name: string,
  wikiTitle?: string | null
): Promise<PersonEnrichmentRow | null> {
  const titleToQuery = wikiTitle || name.replace(/\s+/g, '_');
  const [wiki, anilist] = await Promise.all([
    fetchWikipediaSummary(titleToQuery),
    fetchAniListStaffSafe(name),
  ]);

  if (!wiki.extract && !wiki.thumbnail && !anilist.image && !anilist.bio) {
    // Grava marcador mínimo para não tentar toda hora
    await query(
      `INSERT INTO tv.voice_person_cache (person_key, wiki_title, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (person_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP`,
      [personKey, titleToQuery]
    ).catch(() => {});
    return null;
  }

  const res = await query(
    `INSERT INTO tv.voice_person_cache
      (person_key, wiki_title, wiki_extract, wiki_thumbnail, anilist_bio, anilist_image, hometown, birth_date, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
     ON CONFLICT (person_key) DO UPDATE SET
       wiki_title = COALESCE(EXCLUDED.wiki_title, tv.voice_person_cache.wiki_title),
       wiki_extract = COALESCE(EXCLUDED.wiki_extract, tv.voice_person_cache.wiki_extract),
       wiki_thumbnail = COALESCE(EXCLUDED.wiki_thumbnail, tv.voice_person_cache.wiki_thumbnail),
       anilist_bio = COALESCE(EXCLUDED.anilist_bio, tv.voice_person_cache.anilist_bio),
       anilist_image = COALESCE(EXCLUDED.anilist_image, tv.voice_person_cache.anilist_image),
       hometown = COALESCE(EXCLUDED.hometown, tv.voice_person_cache.hometown),
       birth_date = COALESCE(EXCLUDED.birth_date, tv.voice_person_cache.birth_date),
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [
      personKey,
      titleToQuery,
      wiki.extract,
      wiki.thumbnail,
      anilist.bio,
      anilist.image,
      anilist.hometown,
      anilist.birthDate,
    ]
  );

  return res.rows[0] || null;
}

export async function syncAllShowsVoiceCredits(): Promise<{ syncedShows: number; totalCreditsSaved: number }> {
  await ensureTvSchema();
  const { shows } = await listAllTvShows();
  let syncedShows = 0;
  let totalCreditsSaved = 0;

  for (const show of shows) {
    const count = await syncShowVoiceCredits(show);
    if (count > 0) {
      syncedShows += 1;
      totalCreditsSaved += count;
    }
  }

  // Aproveita a sincronização sob demanda para aquecer o cache de Wikipedia + AniList das lendas curadas sem cache recente
  const cacheRes = await query(`SELECT person_key, updated_at FROM tv.voice_person_cache`);
  const cachedMap = new Map<string, number>();
  for (const row of cacheRes.rows) {
    cachedMap.set(String(row.person_key), new Date(row.updated_at).getTime());
  }
  const now = Date.now();
  const missingCurated = LEGENDARY_TV_VOICES.filter((def) => {
    const key = normalizeVoiceText(def.name);
    const updated = cachedMap.get(key);
    return !updated || now - updated > PERSON_CACHE_TTL_MS;
  }).slice(0, 10);

  if (missingCurated.length > 0) {
    await Promise.allSettled(
      missingCurated.map((def) => enrichPersonAndCache(normalizeVoiceText(def.name), def.name, def.wikiTitle))
    );
  }

  return { syncedShows, totalCreditsSaved };
}

// ============================================================================
// HELPERS DE MATCH, SKINS & DECADES
// ============================================================================

function showMatchesFranchisePatterns(show: TvShowRecord, patterns: string[]): boolean {
  if (!patterns || patterns.length === 0) return false;
  const titleNorm = normalizeVoiceText(show.title);
  const origNorm = normalizeVoiceText(show.original_title);
  return patterns.some((p) => {
    const pNorm = normalizeVoiceText(p);
    return pNorm && (titleNorm.includes(pNorm) || origNorm.includes(pNorm));
  });
}

function getCharacterFromFranchiseExample(
  show: TvShowRecord,
  examples?: Record<string, string>
): string | null {
  if (!examples) return null;
  const t = normalizeVoiceText(show.title);
  const o = normalizeVoiceText(show.original_title);
  for (const [k, char] of Object.entries(examples)) {
    const kNorm = normalizeVoiceText(k);
    if (kNorm && (t.includes(kNorm) || o.includes(kNorm))) {
      return char;
    }
  }
  return null;
}

function buildVoiceDecadesAndStats(works: VoiceAlbumWorkItem[]): {
  decades: VoiceDecadeEntry[];
  favoriteDecade: VoiceDecadeEntry | null;
  avgUserRating: number | null;
  topWork: VoiceAlbumWorkItem | null;
} {
  const map = new Map<number, { count: number; ratings: number[]; topTitle: string | null; topRating: number }>();
  const allRatings: number[] = [];
  let topWork: VoiceAlbumWorkItem | null = null;
  let topWorkScore = -1;

  for (const w of works) {
    const r = typeof w.userRating === 'number' && Number.isFinite(w.userRating) ? w.userRating : null;
    if (r !== null) {
      allRatings.push(r);
      if (r > topWorkScore) {
        topWorkScore = r;
        topWork = w;
      }
    } else if (!topWork) {
      topWork = w;
    }

    const y = Number(w.year || 0);
    if (!Number.isFinite(y) || y < 1950) continue;
    const decade = Math.floor(y / 10) * 10;
    const entry = map.get(decade) || { count: 0, ratings: [], topTitle: w.title, topRating: -1 };
    entry.count += 1;
    if (r !== null) {
      entry.ratings.push(r);
      if (r > entry.topRating) {
        entry.topRating = r;
        entry.topTitle = w.title;
      }
    }
    map.set(decade, entry);
  }

  const decades: VoiceDecadeEntry[] = Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([decade, info]) => ({
      decade,
      label: decade < 2000 ? `Anos ${String(decade).slice(2)}` : `Anos ${decade}`,
      count: info.count,
      avgRating:
        info.ratings.length > 0
          ? Number((info.ratings.reduce((sum, x) => sum + x, 0) / info.ratings.length).toFixed(1))
          : null,
      topTitle: info.topTitle,
    }));

  const favoriteDecade =
    decades.length > 0
      ? [...decades].sort((a, b) => b.count - a.count || (b.avgRating ?? -1) - (a.avgRating ?? -1))[0]
      : null;

  const avgUserRating =
    allRatings.length > 0
      ? Number((allRatings.reduce((sum, x) => sum + x, 0) / allRatings.length).toFixed(1))
      : null;

  return { decades, favoriteDecade, avgUserRating, topWork };
}

function buildVoiceSkinOptions(params: {
  mainPhotoUrl: string | null;
  wikiThumbnail: string | null;
  works: VoiceAlbumWorkItem[];
  customSkinUrl: string | null;
  customSkinLabel: string | null;
}): VoiceSkinOption[] {
  const options: VoiceSkinOption[] = [];
  const seenUrls = new Set<string>();

  const pushOpt = (opt: VoiceSkinOption) => {
    if (!opt.imageUrl || seenUrls.has(opt.imageUrl)) return;
    seenUrls.add(opt.imageUrl);
    options.push(opt);
  };

  if (params.mainPhotoUrl) {
    pushOpt({
      id: 'default_portrait',
      label: 'Retrato Oficial',
      sublabel: 'Foto principal do artista',
      imageUrl: params.mainPhotoUrl,
      kind: 'portrait',
    });
  }

  if (params.wikiThumbnail) {
    pushOpt({
      id: 'wiki_portrait',
      label: 'Retrato Wikipédia',
      sublabel: 'Foto enciclopédica',
      imageUrl: params.wikiThumbnail,
      kind: 'wiki',
    });
  }

  // Até 4 pôsteres de obras assistidas (priorizando com poster e melhor nota)
  const sortedWorks = [...params.works]
    .filter((w) => Boolean(w.posterUrl))
    .sort((a, b) => (b.userRating ?? -1) - (a.userRating ?? -1));

  for (const w of sortedWorks.slice(0, 4)) {
    if (options.length >= 5 && !params.customSkinUrl) break;
    pushOpt({
      id: `work_${w.source}_${w.id}`,
      label: w.character ? w.character.slice(0, 24) : w.title.slice(0, 24),
      sublabel: `${w.title} (${w.kindLabel})`,
      imageUrl: w.posterUrl!,
      kind: 'work_poster',
    });
  }

  if (params.customSkinUrl) {
    pushOpt({
      id: 'custom_user_skin',
      label: params.customSkinLabel || 'Minha Imagem Customizada',
      sublabel: 'Upload / Link do Usuário',
      imageUrl: params.customSkinUrl,
      kind: 'custom',
    });
  }

  return options;
}

// ============================================================================
// CONSTRUTOR DO ÁLBUM + HIDRATAÇÃO DE ESTADO & PACOTES GACHA
// ============================================================================

export async function buildTvVoiceAlbumPayload(existingShows?: TvShowRecord[]): Promise<TvVoiceAlbumPayload> {
  await ensureTvSchema();

  const [shows, walkPayload, creditsRes, cacheRes, albumStateRes, packsRes] = await Promise.all([
    existingShows ? Promise.resolve(existingShows) : listAllTvShows().then((r) => r.shows),
    buildWalkOfFamePayload({ forceRefresh: false }).catch(() => null),
    query(`
      SELECT
        vc.show_id,
        vc.character_name,
        vc.role,
        vc.album,
        vc.character_image_url,
        p.id AS person_id,
        p.name AS person_name,
        p.image_url AS person_image
      FROM tv.voice_credits vc
      JOIN tv.people p ON p.id = vc.person_id
    `),
    query(`SELECT * FROM tv.voice_person_cache`),
    query(`SELECT * FROM tv.voice_album_state`),
    query(`
      SELECT *
      FROM tv.voice_packs
      WHERE status = 'pending'
      ORDER BY created_at ASC, id ASC
    `),
  ]);

  const showById = new Map<number, TvShowRecord>(shows.map((s) => [s.id, s]));

  const personCacheMap = new Map<string, PersonEnrichmentRow>();
  for (const row of cacheRes.rows) {
    personCacheMap.set(String(row.person_key), row);
  }

  const albumStateByVoiceId = new Map<string, any>();
  for (const row of albumStateRes.rows) {
    albumStateByVoiceId.set(String(row.voice_id), row);
  }

  // Enriquecimento progressivo rápido em background / batch pequeno para lendas curadas ainda sem foto em cache
  const missingCacheCurated = LEGENDARY_TV_VOICES.filter((def) => {
    const key = normalizeVoiceText(def.name);
    return !personCacheMap.has(key);
  }).slice(0, 4);

  if (missingCacheCurated.length > 0) {
    const enrichedResults = await Promise.allSettled(
      missingCacheCurated.map((def) => enrichPersonAndCache(normalizeVoiceText(def.name), def.name, def.wikiTitle))
    );
    for (const r of enrichedResults) {
      if (r.status === 'fulfilled' && r.value) {
        personCacheMap.set(String(r.value.person_key), r.value);
      }
    }
  }

  // Agrupa créditos sincronizados de tv.voice_credits por nome normalizado
  const creditsByNormName = new Map<
    string,
    {
      personName: string;
      imageUrl: string | null;
      album: 'jp' | 'us';
      items: Array<{ show: TvShowRecord; characterName: string; role: string; characterImageUrl: string | null }>;
    }
  >();

  for (const r of creditsRes.rows) {
    const show = showById.get(Number(r.show_id));
    if (!show) continue;
    const personName = String(r.person_name || '').trim();
    const norm = normalizeVoiceText(personName);
    if (!norm) continue;

    const bucket = creditsByNormName.get(norm) || {
      personName,
      imageUrl: r.person_image || null,
      album: (r.album === 'us' ? 'us' : 'jp') as 'jp' | 'us',
      items: [] as Array<{ show: TvShowRecord; characterName: string; role: string; characterImageUrl: string | null }>,
    };
    if (!bucket.imageUrl && r.person_image) bucket.imageUrl = r.person_image;
    bucket.items.push({
      show,
      characterName: String(r.character_name || '').trim(),
      role: String(r.role || 'Supporting'),
      characterImageUrl: r.character_image_url || null,
    });
    creditsByNormName.set(norm, bucket);
  }

  const attachTvMatchesToEntry = (
    nameCandidates: string[],
    patterns: string[],
    characterExamples?: Record<string, string>,
    fallbackChar?: string,
    preferAnimeOrAnimatedOnly = true
  ): { watchedShows: VoiceAlbumWorkItem[]; discoveredPhoto: string | null } => {
    const byShowId = new Map<number, VoiceAlbumWorkItem>();
    let discoveredPhoto: string | null = null;

    for (const candidate of nameCandidates) {
      const norm = normalizeVoiceText(candidate);
      const bucket = norm ? creditsByNormName.get(norm) : undefined;
      if (!bucket) continue;
      if (!discoveredPhoto && bucket.imageUrl) discoveredPhoto = bucket.imageUrl;

      for (const item of bucket.items) {
        const s = item.show;
        const prev = byShowId.get(s.id);
        const char = item.characterName || prev?.character || null;
        const charImg = item.characterImageUrl || prev?.characterImageUrl || s.poster_url || null;
        byShowId.set(s.id, {
          source: 'tv',
          id: s.id,
          workKey: `tv:${s.id}`,
          title: s.title,
          originalTitle: s.original_title,
          year: s.start_year,
          posterUrl: s.poster_url,
          character: char,
          characterName: char,
          characterImageUrl: charImg,
          userRating: s.user_rating !== null && s.user_rating !== undefined ? Number(s.user_rating) : null,
          kindLabel: s.kind === 'anime' ? 'Anime' : s.kind === 'dorama' ? 'Dorama' : 'Série',
        });
      }
    }

    for (const s of shows) {
      if (byShowId.has(s.id)) continue;
      if (preferAnimeOrAnimatedOnly) {
        const isAnime = s.kind === 'anime';
        const isAnimSeries =
          s.kind === 'series' &&
          (s.genres || []).some((g) => /anima[çc][ãa]o|animation/i.test(g.name));
        if (!isAnime && !isAnimSeries) continue;
      }
      if (showMatchesFranchisePatterns(s, patterns)) {
        const char = getCharacterFromFranchiseExample(s, characterExamples) || fallbackChar || null;
        byShowId.set(s.id, {
          source: 'tv',
          id: s.id,
          workKey: `tv:${s.id}`,
          title: s.title,
          originalTitle: s.original_title,
          year: s.start_year,
          posterUrl: s.poster_url,
          character: char,
          characterName: char,
          characterImageUrl: s.poster_url || null,
          userRating: s.user_rating !== null && s.user_rating !== undefined ? Number(s.user_rating) : null,
          kindLabel: s.kind === 'anime' ? 'Anime' : s.kind === 'dorama' ? 'Dorama' : 'Série',
        });
      }
    }

    return {
      watchedShows: Array.from(byShowId.values()),
      discoveredPhoto,
    };
  };

  interface RawVoiceDraft {
    id: string;
    name: string;
    nationalityCode: 'jp' | 'us';
    nationalityLabel: string;
    icon: string;
    voiceType: string | null;
    hometown: string | null;
    birthday: string | null;
    deathday: string | null;
    isDeceased: boolean;
    photoUrl: string | null;
    wikiThumbnail: string | null;
    sourceOrigin: 'shared_cinema' | 'tv_curated' | 'discovered';
    tagline: string;
    knownFor: string;
    quote: string;
    quoteJp: string | null;
    rpgTitle: string;
    bio: string | null;
    wikiExtract: string | null;
    secretFact: string | null;
    curiosities: string[];
    signatureFranchises: string[];
    watchedMovies: VoiceAlbumWorkItem[];
    watchedShows: VoiceAlbumWorkItem[];
    combinedWorks: VoiceAlbumWorkItem[];
  }

  const draftsByNorm = new Map<string, RawVoiceDraft>();

  // 1. Compartilha dubladores JP e US do modo Cinema (nunca inclui 'br')
  const cinemaStars: any[] = Array.isArray(walkPayload?.stars) ? walkPayload.stars : [];
  for (const star of cinemaStars) {
    if (star.kind !== 'dublador') continue;
    const nat = String(star.nationalityCode || '').toLowerCase();
    if (nat !== 'jp' && nat !== 'us') continue;

    const norm = normalizeVoiceText(star.name);
    const sharedHint = SHARED_CINEMA_VOICE_FRANCHISES[norm];
    const cacheRow = personCacheMap.get(norm);

    const watchedMovies: VoiceAlbumWorkItem[] = (star.watchedFilms || []).map((f: any) => ({
      source: 'cinema',
      id: Number(f.movieId),
      workKey: `cinema:${Number(f.movieId)}`,
      title: String(f.title),
      originalTitle: f.originalTitle || null,
      year: f.releaseYear || null,
      posterUrl: f.posterUrl || null,
      character: f.character || null,
      characterName: f.character || null,
      characterImageUrl: f.posterUrl || null,
      userRating: typeof f.userRating === 'number' ? f.userRating : null,
      kindLabel: 'Filme',
    }));

    const tvMatch = attachTvMatchesToEntry(
      [star.name, star.searchQuery],
      sharedHint?.patterns || [],
      undefined,
      sharedHint?.defaultCharacter,
      true
    );

    const combinedWorks = [...watchedMovies, ...tvMatch.watchedShows];
    const curiosities = Array.isArray(star.curiosities)
      ? star.curiosities.filter(Boolean).map(String)
      : [];

    draftsByNorm.set(norm, {
      id: String(star.id),
      name: String(star.name),
      nationalityCode: nat,
      nationalityLabel: nat === 'jp' ? 'Japão' : 'Estados Unidos',
      icon: star.icon || (nat === 'jp' ? '⛩️' : '🎙️'),
      voiceType: sharedHint?.voiceType || null,
      hometown: star.placeOfBirth || cacheRow?.hometown || null,
      birthday: star.birthday || cacheRow?.birth_date || null,
      deathday: star.deathday || null,
      isDeceased: Boolean(star.isDeceased),
      photoUrl: star.photoUrl || tvMatch.discoveredPhoto || cacheRow?.anilist_image || cacheRow?.wiki_thumbnail || null,
      wikiThumbnail: cacheRow?.wiki_thumbnail || null,
      sourceOrigin: 'shared_cinema',
      tagline: star.tagline || '',
      knownFor: star.knownFor || '',
      quote: star.quote || '',
      quoteJp: sharedHint?.quoteJp || null,
      rpgTitle: star.rpgTitle || 'Voz Imortal',
      bio: star.bio || star.wikiExtract || cacheRow?.wiki_extract || cacheRow?.anilist_bio || null,
      wikiExtract: star.wikiExtract || cacheRow?.wiki_extract || null,
      secretFact: star.secretFact || null,
      curiosities,
      signatureFranchises: sharedHint?.patterns || [],
      watchedMovies,
      watchedShows: tvMatch.watchedShows,
      combinedWorks,
    });
  }

  // 2. Adiciona Lendas Curadas do módulo TV
  for (const def of LEGENDARY_TV_VOICES) {
    const norm = normalizeVoiceText(def.name);
    if (draftsByNorm.has(norm)) continue;

    const cacheRow = personCacheMap.get(norm);
    const tvMatch = attachTvMatchesToEntry(
      [def.name, ...(def.aliases || [])],
      def.signatureFranchises,
      def.characterExamples,
      undefined,
      true
    );

    const combinedWorks = [...tvMatch.watchedShows];
    const mainPhoto =
      tvMatch.discoveredPhoto ||
      cacheRow?.anilist_image ||
      cacheRow?.wiki_thumbnail ||
      null;

    draftsByNorm.set(norm, {
      id: def.id,
      name: def.name,
      nationalityCode: def.nationalityCode,
      nationalityLabel: def.nationalityLabel,
      icon: def.icon,
      voiceType: def.voiceType || null,
      hometown: def.hometown || cacheRow?.hometown || null,
      birthday: cacheRow?.birth_date || (def.birthYear ? String(def.birthYear) : null),
      deathday: null,
      isDeceased: Boolean(def.isPosthumous),
      photoUrl: mainPhoto,
      wikiThumbnail: cacheRow?.wiki_thumbnail || null,
      sourceOrigin: 'tv_curated',
      tagline: def.tagline,
      knownFor: def.knownFor,
      quote: def.quote,
      quoteJp: def.quoteJp || null,
      rpgTitle: def.rpgTitle,
      bio: cacheRow?.wiki_extract || def.bio || cacheRow?.anilist_bio || null,
      wikiExtract: cacheRow?.wiki_extract || null,
      secretFact: def.secretFact || null,
      curiosities: def.curiosities || [],
      signatureFranchises: def.signatureFranchises,
      watchedMovies: [],
      watchedShows: tvMatch.watchedShows,
      combinedWorks,
    });
  }

  // 3. Descoberta automática em `tv.voice_credits` (papéis Main ou >= 2 obras)
  for (const [norm, bucket] of creditsByNormName.entries()) {
    if (draftsByNorm.has(norm)) continue;
    const aliasMatched = Array.from(draftsByNorm.values()).some(
      (e) => normalizeVoiceText(e.name) === norm
    );
    if (aliasMatched) continue;

    const hasMainRole = bucket.items.some((i) => i.role === 'Main');
    const uniqueShowMap = new Map<number, VoiceAlbumWorkItem>();
    for (const item of bucket.items) {
      if (!uniqueShowMap.has(item.show.id)) {
        uniqueShowMap.set(item.show.id, {
          source: 'tv',
          id: item.show.id,
          workKey: `tv:${item.show.id}`,
          title: item.show.title,
          originalTitle: item.show.original_title,
          year: item.show.start_year,
          posterUrl: item.show.poster_url,
          character: item.characterName || null,
          characterName: item.characterName || null,
          characterImageUrl: item.characterImageUrl || item.show.poster_url || null,
          userRating:
            item.show.user_rating !== null && item.show.user_rating !== undefined
              ? Number(item.show.user_rating)
              : null,
          kindLabel: item.show.kind === 'anime' ? 'Anime' : 'Série',
        });
      }
    }
    const watchedShows = Array.from(uniqueShowMap.values());
    if (!hasMainRole && watchedShows.length < 2) continue;

    const cacheRow = personCacheMap.get(norm);
    const charList = Array.from(
      new Set(bucket.items.map((i) => i.characterName).filter(Boolean))
    ).slice(0, 4);
    const worksListStr = watchedShows.map((w) => w.title).slice(0, 3).join(', ');

    draftsByNorm.set(norm, {
      id: `discovered_${norm.replace(/\s+/g, '_')}`,
      name: bucket.personName,
      nationalityCode: bucket.album,
      nationalityLabel: bucket.album === 'jp' ? 'Japão' : 'Estados Unidos',
      icon: bucket.album === 'jp' ? '⛩️' : '🎧',
      voiceType: bucket.album === 'jp' ? 'Seiyū Descoberto no Catálogo' : 'Voz Original da Animação',
      hometown: cacheRow?.hometown || null,
      birthday: cacheRow?.birth_date || null,
      deathday: null,
      isDeceased: false,
      photoUrl: bucket.imageUrl || cacheRow?.anilist_image || cacheRow?.wiki_thumbnail || null,
      wikiThumbnail: cacheRow?.wiki_thumbnail || null,
      sourceOrigin: 'discovered',
      tagline: `Descoberto no elenco oficial de ${worksListStr}.`,
      knownFor: charList.join(' • ') || watchedShows.map((s) => s.title).join(' • '),
      quote:
        charList.length > 0
          ? `Imortalizado no seu catálogo como a voz de ${charList[0]}.`
          : `Presente em ${watchedShows.length} obra(s) do seu catálogo.`,
      quoteJp: null,
      rpgTitle: bucket.album === 'jp' ? 'Seiyū do Santuário' : 'Voz da Animação',
      bio:
        cacheRow?.wiki_extract ||
        cacheRow?.anilist_bio ||
        `${bucket.personName} integra o elenco vocal descoberto automaticamente via API nas suas obras assistidas (${worksListStr}).`,
      wikiExtract: cacheRow?.wiki_extract || null,
      secretFact:
        cacheRow?.hometown
          ? `Originário de ${cacheRow.hometown}, ganhou destaque no seu catálogo dando vida a ${charList.join(', ') || worksListStr}.`
          : `Atua nas obras ${worksListStr} registradas no seu catálogo de Animes & Séries.`,
      curiosities: [
        `Participou de ${watchedShows.length} obra(s) do seu catálogo${charList.length > 0 ? `, incluindo ${charList[0]}` : ''}.`,
        `Sincronizado automaticamente diretamente dos créditos oficiais da obra.`,
        `Compartilha progresso unificado caso você assista filmes com sua voz no modo Cinema.`,
      ],
      signatureFranchises: [],
      watchedMovies: [],
      watchedShows,
      combinedWorks: watchedShows,
    });
  }

  // Ordena para atribuir albumNumber estável e hierárquico
  const sortedDrafts = Array.from(draftsByNorm.values()).sort((a, b) => {
    if (b.combinedWorks.length !== a.combinedWorks.length) {
      return b.combinedWorks.length - a.combinedWorks.length;
    }
    if (b.watchedShows.length !== a.watchedShows.length) {
      return b.watchedShows.length - a.watchedShows.length;
    }
    const originWeight = (o: RawVoiceDraft['sourceOrigin']) =>
      o === 'shared_cinema' ? 2 : o === 'tv_curated' ? 1 : 0;
    const oDiff = originWeight(b.sourceOrigin) - originWeight(a.sourceOrigin);
    if (oDiff !== 0) return oDiff;
    return a.name.localeCompare(b.name, 'pt');
  });

  // Garante pacotes pendentes automáticos caso uma figurinha tenha atingido >= 15% e subido além do último estado/pacote
  const pendingByVoiceId = new Map<string, any>();
  for (const row of packsRes.rows) {
    const vid = String(row.voice_id);
    if (!pendingByVoiceId.has(vid)) {
      pendingByVoiceId.set(vid, row);
    }
  }

  const packsToCreate: Array<{
    voiceId: string;
    packType: string;
    fromTier: string | null;
    toTier: string;
    fromPct: number;
    toPct: number;
    extraStars: number;
    xpReward: number;
    triggerTitle: string | null;
  }> = [];

  for (const d of sortedDrafts) {
    const tierInfo = resolveVoiceTier(d.combinedWorks.length);
    if (tierInfo.percentage < 15) continue;

    const albumRow = albumStateByVoiceId.get(d.id);
    const stuckTier = albumRow?.stuck_tier ? (String(albumRow.stuck_tier) as VoiceRarityTier) : null;
    const claimedPct = Number(albumRow?.claimed_xp_pct || 0);
    const claimedStars = Number(albumRow?.claimed_xp_extra_stars || 0);
    const stuckOrder = stuckTier ? VOICE_TIER_ORDER[stuckTier] || 0 : 0;
    const currOrder = VOICE_TIER_ORDER[tierInfo.currentTier] || 0;

    const needsNewPack =
      !stuckTier || currOrder > stuckOrder || tierInfo.extraStars > claimedStars;

    if (needsNewPack && !pendingByVoiceId.has(d.id)) {
      const existingPending = pendingByVoiceId.get(d.id);
      if (!existingPending) {
        const potentialXp = tierInfo.xpEarned;
        const alreadyClaimed = computeVoiceXpSplit(claimedPct, claimedStars).totalXp;
        const xpReward = Math.max(0, potentialXp - alreadyClaimed);
        if (xpReward > 0 || !stuckTier) {
          const packType = !stuckTier
            ? 'new_sticker'
            : currOrder > stuckOrder
            ? 'rarity_up'
            : 'extra_star';
          packsToCreate.push({
            voiceId: d.id,
            packType,
            fromTier: stuckTier,
            toTier: tierInfo.currentTier,
            fromPct: claimedPct,
            toPct: tierInfo.percentage,
            extraStars: tierInfo.extraStars,
            xpReward,
            triggerTitle: d.combinedWorks[0]?.title || null,
          });
        }
      }
    }
  }

  if (packsToCreate.length > 0) {
    const ins = await query(
      `INSERT INTO tv.voice_packs
        (voice_id, pack_type, from_tier, to_tier, from_pct, to_pct, extra_stars_unlocked, xp_reward, trigger_title, status)
       SELECT * FROM UNNEST(
         $1::varchar[], $2::varchar[], $3::varchar[], $4::varchar[],
         $5::int[], $6::int[], $7::int[], $8::int[], $9::varchar[], $10::varchar[]
       )
       RETURNING *`,
      [
        packsToCreate.map((p) => p.voiceId),
        packsToCreate.map((p) => p.packType),
        packsToCreate.map((p) => p.fromTier),
        packsToCreate.map((p) => p.toTier),
        packsToCreate.map((p) => p.fromPct),
        packsToCreate.map((p) => p.toPct),
        packsToCreate.map((p) => p.extraStars),
        packsToCreate.map((p) => p.xpReward),
        packsToCreate.map((p) => p.triggerTitle),
        packsToCreate.map(() => 'pending'),
      ]
    ).catch(() => ({ rows: [] }));

    for (const row of ins.rows) {
      pendingByVoiceId.set(String(row.voice_id), row);
    }
  }

  const draftById = new Map<string, RawVoiceDraft>(sortedDrafts.map((d) => [d.id, d]));

  // Monta payload hidratado final
  const voices: TvVoiceAlbumEntry[] = sortedDrafts.map((d, idx) => {
    const tierInfo = resolveVoiceTier(d.combinedWorks.length);
    const albumRow = albumStateByVoiceId.get(d.id);
    const pendingPackRow = pendingByVoiceId.get(d.id) || null;

    const isStickerUnlocked = tierInfo.percentage >= 15;
    const stuckTier = albumRow?.stuck_tier ? (String(albumRow.stuck_tier) as VoiceRarityTier) : null;
    const previousStuckTier = albumRow?.previous_stuck_tier
      ? (String(albumRow.previous_stuck_tier) as VoiceRarityTier)
      : null;
    const stuckExtraStars = Number(albumRow?.stuck_extra_stars || 0);
    const isStuck = Boolean(stuckTier && isStickerUnlocked);
    const hasRarityUpgradeToStick = Boolean(
      isStuck &&
        ((stuckTier ? VOICE_TIER_ORDER[tierInfo.currentTier] > VOICE_TIER_ORDER[stuckTier] : false) ||
          tierInfo.extraStars > stuckExtraStars)
    );

    const claimedXpPct = Math.max(0, Number(albumRow?.claimed_xp_pct || 0));
    const claimedXpExtraStars = Math.max(0, Number(albumRow?.claimed_xp_extra_stars || 0));
    const claimedXp = computeVoiceXpSplit(claimedXpPct, claimedXpExtraStars).totalXp;
    const potentialXp = tierInfo.xpEarned;
    const unclaimedXp = Math.max(0, potentialXp - claimedXp);

    const customSkinUrl = albumRow?.custom_skin_url ? String(albumRow.custom_skin_url) : null;
    const customSkinLabel = albumRow?.custom_skin_label ? String(albumRow.custom_skin_label) : null;
    const selectedSkinUrl = albumRow?.selected_skin_url ? String(albumRow.selected_skin_url) : null;
    const selectedSkinLabel = albumRow?.selected_skin_label ? String(albumRow.selected_skin_label) : null;

    const skinOptions = buildVoiceSkinOptions({
      mainPhotoUrl: d.photoUrl,
      wikiThumbnail: d.wikiThumbnail,
      works: d.combinedWorks,
      customSkinUrl,
      customSkinLabel,
    });

    const activePhotoUrl = selectedSkinUrl || d.photoUrl;

    const canCustomizeMythic = tierInfo.percentage >= 100;
    const rawAura = albumRow?.immortal_aura ? String(albumRow.immortal_aura) : 'sakura_prism';
    const auraIdx = VOICE_IMMORTAL_AURA_ORDER.indexOf(rawAura as VoiceImmortalAuraId);
    const immortalAura: VoiceImmortalAuraId =
      canCustomizeMythic && auraIdx >= 0 && tierInfo.extraStars >= auraIdx
        ? VOICE_IMMORTAL_AURA_ORDER[auraIdx]
        : 'sakura_prism';

    const statsAndDecades = buildVoiceDecadesAndStats(d.combinedWorks);

    const rawSigWorkKey = albumRow?.signature_work_key ? String(albumRow.signature_work_key) : null;
    const signatureWork =
      (rawSigWorkKey ? d.combinedWorks.find((w) => w.workKey === rawSigWorkKey) : null) ||
      statsAndDecades.topWork ||
      null;

    return {
      id: d.id,
      albumNumber: idx + 1,
      name: d.name,
      nationalityCode: d.nationalityCode,
      nationalityLabel: d.nationalityLabel,
      icon: d.icon,
      voiceType: d.voiceType,
      hometown: d.hometown,
      birthday: d.birthday,
      deathday: d.deathday,
      isDeceased: d.isDeceased,
      photoUrl: d.photoUrl,
      activePhotoUrl,
      sourceOrigin: d.sourceOrigin,
      tagline: d.tagline,
      knownFor: d.knownFor,
      quote: d.quote,
      quoteJp: d.quoteJp,
      rpgTitle: d.rpgTitle,
      bio: d.bio,
      wikiExtract: d.wikiExtract,
      secretFact: d.secretFact,
      curiosities: d.curiosities,
      signatureFranchises: d.signatureFranchises,

      percentage: tierInfo.percentage,
      ceiling: tierInfo.ceiling,
      extraStars: tierInfo.extraStars,
      worksToNextExtraStar: tierInfo.worksToNextExtraStar,
      worksToUnlock15: tierInfo.worksToUnlock15,
      nextMilestoneWorks: tierInfo.nextMilestoneWorks,
      currentTier: tierInfo.currentTier,
      tierLabel: tierInfo.tierLabel,
      tierIcon: tierInfo.tierIcon,
      tcgCode: tierInfo.tcgCode,
      rpgRank: tierInfo.rpgRank,
      nextTier: tierInfo.nextTier,
      nextTierPct: tierInfo.nextTierPct,
      nextTierXp: tierInfo.nextTierXp,
      progressPercentage: tierInfo.percentage,

      xpEarned: claimedXp,
      potentialXp,
      claimedXp,
      unclaimedXp,
      claimedXpPct,
      claimedXpExtraStars,
      isStickerUnlocked,
      isStuck,
      stuckTier,
      previousStuckTier,
      stuckExtraStars,
      hasRarityUpgradeToStick,
      pendingPackId: pendingPackRow ? Number(pendingPackRow.id) : null,
      pendingPackType: pendingPackRow ? String(pendingPackRow.pack_type) : null,

      skinOptions,
      selectedSkinUrl,
      selectedSkinLabel,
      customSkinUrl,
      customSkinLabel,
      immortalAura,
      signatureWorkKey: signatureWork ? signatureWork.workKey : null,
      signatureWork,
      isFullArt: Boolean(canCustomizeMythic && albumRow?.is_full_art),
      isFavoriteGuardian: Boolean(canCustomizeMythic && albumRow?.is_favorite_guardian),

      watchedMoviesCount: d.watchedMovies.length,
      watchedShowsCount: d.watchedShows.length,
      totalWorksCount: d.combinedWorks.length,
      avgUserRating: statsAndDecades.avgUserRating,
      topWork: statsAndDecades.topWork,
      decades: statsAndDecades.decades,
      favoriteDecade: statsAndDecades.favoriteDecade,
      watchedMovies: d.watchedMovies,
      watchedShows: d.watchedShows,
      combinedWorks: d.combinedWorks,
    };
  });

  const pendingPacks: TvVoicePackItem[] = [];
  for (const row of pendingByVoiceId.values()) {
    const d = draftById.get(String(row.voice_id));
    if (!d) continue;
    pendingPacks.push({
      packId: Number(row.id),
      voiceId: d.id,
      voiceName: d.name,
      voiceIcon: d.icon,
      nationalityCode: d.nationalityCode,
      photoUrl: d.photoUrl,
      rpgTitle: d.rpgTitle,
      packType: String(row.pack_type),
      fromTier: row.from_tier ? String(row.from_tier) : null,
      toTier: String(row.to_tier),
      fromPct: Number(row.from_pct || 0),
      toPct: Number(row.to_pct || 0),
      extraStarsUnlocked: Number(row.extra_stars_unlocked || 0),
      xpReward: Number(row.xp_reward || 0),
      triggerTitle: row.trigger_title ? String(row.trigger_title) : null,
      status: String(row.status),
      createdAt: String(row.created_at),
    });
  }

  const rarityCounts: Record<VoiceRarityTier, number> = {
    locked: 0,
    common: 0,
    uncommon: 0,
    rare: 0,
    super_rare: 0,
    legendary: 0,
    mythic: 0,
  };
  for (const v of voices) {
    rarityCounts[v.currentTier] = (rarityCounts[v.currentTier] || 0) + 1;
  }

  const unlockedVoices = voices.filter((v) => v.percentage >= 15).length;
  const stuckVoices = voices.filter((v) => v.isStuck).length;
  const jpCount = voices.filter((v) => v.nationalityCode === 'jp').length;
  const usCount = voices.filter((v) => v.nationalityCode === 'us').length;
  const sharedMoviesMatches = voices.reduce((sum, v) => sum + v.watchedMoviesCount, 0);
  const tvShowsMatches = voices.reduce((sum, v) => sum + v.watchedShowsCount, 0);
  const totalVoiceXp = voices.reduce((sum, v) => sum + v.claimedXp, 0);
  const potentialVoiceXp = voices.reduce((sum, v) => sum + v.potentialXp, 0);
  const totalExtraStars = voices.reduce((sum, v) => sum + v.extraStars, 0);

  return {
    voices,
    pendingPacks,
    summary: {
      totalVoices: voices.length,
      unlockedVoices,
      stuckVoices,
      pendingPacksCount: pendingPacks.length,
      jpCount,
      usCount,
      sharedMoviesMatches,
      tvShowsMatches,
      totalVoiceXp,
      potentialVoiceXp,
      rarityCounts,
      totalExtraStars,
    },
  };
}

// ============================================================================
// AÇÕES DE ÁLBUM: COLAR, DESCOLAR, ABRIR PACOTES, PREFERÊNCIAS & SKINS
// ============================================================================

export async function stickVoiceSticker(voiceId: string): Promise<{
  payload: TvVoiceAlbumPayload;
  xpGained: number;
}> {
  await ensureTvSchema();
  const payloadBefore = await buildTvVoiceAlbumPayload();
  const voice = payloadBefore.voices.find((v) => v.id === voiceId);
  if (!voice) {
    throw new Error('Dublador não encontrado no álbum.');
  }
  if (!voice.isStickerUnlocked) {
    throw new Error('Atingir 15% para liberar e colar esta figurinha.');
  }

  const prevRowRes = await query(
    `SELECT * FROM tv.voice_album_state WHERE voice_id = $1`,
    [voiceId]
  );
  const prevRow = prevRowRes.rows[0] || null;
  const prevClaimedPct = Math.max(0, Number(prevRow?.claimed_xp_pct || 0));
  const prevClaimedStars = Math.max(0, Number(prevRow?.claimed_xp_extra_stars || 0));

  const nextClaimedPct = Math.max(prevClaimedPct, voice.percentage);
  const nextClaimedStars = Math.max(prevClaimedStars, voice.extraStars);
  const prevXp = computeVoiceXpSplit(prevClaimedPct, prevClaimedStars).totalXp;
  const nextXp = computeVoiceXpSplit(nextClaimedPct, nextClaimedStars).totalXp;
  const xpGained = Math.max(0, nextXp - prevXp);

  const prevStuckTier = prevRow?.stuck_tier ? String(prevRow.stuck_tier) : null;

  await query(
    `INSERT INTO tv.voice_album_state
      (voice_id, stuck_tier, previous_stuck_tier, stuck_extra_stars, claimed_xp_pct, claimed_xp_extra_stars, stuck_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT (voice_id) DO UPDATE SET
       previous_stuck_tier = CASE
         WHEN tv.voice_album_state.stuck_tier IS NOT NULL AND tv.voice_album_state.stuck_tier <> EXCLUDED.stuck_tier
         THEN tv.voice_album_state.stuck_tier
         ELSE tv.voice_album_state.previous_stuck_tier
       END,
       stuck_tier = EXCLUDED.stuck_tier,
       stuck_extra_stars = EXCLUDED.stuck_extra_stars,
       claimed_xp_pct = GREATEST(tv.voice_album_state.claimed_xp_pct, EXCLUDED.claimed_xp_pct),
       claimed_xp_extra_stars = GREATEST(tv.voice_album_state.claimed_xp_extra_stars, EXCLUDED.claimed_xp_extra_stars),
       stuck_at = COALESCE(tv.voice_album_state.stuck_at, CURRENT_TIMESTAMP),
       updated_at = CURRENT_TIMESTAMP`,
    [
      voiceId,
      voice.currentTier,
      prevStuckTier && prevStuckTier !== voice.currentTier ? prevStuckTier : null,
      voice.extraStars,
      nextClaimedPct,
      nextClaimedStars,
    ]
  );

  // Marca pacotes pendentes desse dublador como abertos
  await query(
    `UPDATE tv.voice_packs
     SET status = 'opened', opened_at = CURRENT_TIMESTAMP
     WHERE voice_id = $1 AND status = 'pending'`,
    [voiceId]
  );

  const payload = await buildTvVoiceAlbumPayload();
  return { payload, xpGained };
}

export async function unstickVoiceSticker(voiceId: string): Promise<TvVoiceAlbumPayload> {
  await ensureTvSchema();
  await query(
    `UPDATE tv.voice_album_state
     SET stuck_tier = NULL, previous_stuck_tier = NULL, updated_at = CURRENT_TIMESTAMP
     WHERE voice_id = $1`,
    [voiceId]
  );
  return buildTvVoiceAlbumPayload();
}

export async function openVoicePack(packId: number): Promise<{
  payload: TvVoiceAlbumPayload;
  xpGained: number;
  voiceId: string;
}> {
  await ensureTvSchema();
  const packRes = await query(
    `SELECT * FROM tv.voice_packs WHERE id = $1 LIMIT 1`,
    [packId]
  );
  const pack = packRes.rows[0];
  if (!pack) {
    throw new Error('Pacote de invocação não encontrado.');
  }

  const voiceId = String(pack.voice_id);
  const { payload, xpGained } = await stickVoiceSticker(voiceId);
  return { payload, xpGained, voiceId };
}

export async function stickAllUnlockedVoices(): Promise<{
  payload: TvVoiceAlbumPayload;
  stuckCount: number;
  xpGained: number;
}> {
  await ensureTvSchema();
  const before = await buildTvVoiceAlbumPayload();
  const targets = before.voices.filter(
    (v) => v.isStickerUnlocked && (!v.isStuck || v.hasRarityUpgradeToStick || v.unclaimedXp > 0)
  );

  let totalXpGained = 0;
  for (const v of targets) {
    const prevRowRes = await query(
      `SELECT claimed_xp_pct, claimed_xp_extra_stars, stuck_tier FROM tv.voice_album_state WHERE voice_id = $1`,
      [v.id]
    );
    const prevRow = prevRowRes.rows[0] || null;
    const prevPct = Math.max(0, Number(prevRow?.claimed_xp_pct || 0));
    const prevStars = Math.max(0, Number(prevRow?.claimed_xp_extra_stars || 0));
    const nextPct = Math.max(prevPct, v.percentage);
    const nextStars = Math.max(prevStars, v.extraStars);
    const prevXp = computeVoiceXpSplit(prevPct, prevStars).totalXp;
    const nextXp = computeVoiceXpSplit(nextPct, nextStars).totalXp;
    totalXpGained += Math.max(0, nextXp - prevXp);

    await query(
      `INSERT INTO tv.voice_album_state
        (voice_id, stuck_tier, previous_stuck_tier, stuck_extra_stars, claimed_xp_pct, claimed_xp_extra_stars, stuck_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (voice_id) DO UPDATE SET
         previous_stuck_tier = CASE
           WHEN tv.voice_album_state.stuck_tier IS NOT NULL AND tv.voice_album_state.stuck_tier <> EXCLUDED.stuck_tier
           THEN tv.voice_album_state.stuck_tier
           ELSE tv.voice_album_state.previous_stuck_tier
         END,
         stuck_tier = EXCLUDED.stuck_tier,
         stuck_extra_stars = EXCLUDED.stuck_extra_stars,
         claimed_xp_pct = GREATEST(tv.voice_album_state.claimed_xp_pct, EXCLUDED.claimed_xp_pct),
         claimed_xp_extra_stars = GREATEST(tv.voice_album_state.claimed_xp_extra_stars, EXCLUDED.claimed_xp_extra_stars),
         stuck_at = COALESCE(tv.voice_album_state.stuck_at, CURRENT_TIMESTAMP),
         updated_at = CURRENT_TIMESTAMP`,
      [
        v.id,
        v.currentTier,
        prevRow?.stuck_tier && String(prevRow.stuck_tier) !== v.currentTier
          ? String(prevRow.stuck_tier)
          : null,
        v.extraStars,
        nextPct,
        nextStars,
      ]
    );

    await query(
      `UPDATE tv.voice_packs SET status = 'opened', opened_at = CURRENT_TIMESTAMP WHERE voice_id = $1 AND status = 'pending'`,
      [v.id]
    );
  }

  const payload = await buildTvVoiceAlbumPayload();
  return { payload, stuckCount: targets.length, xpGained: totalXpGained };
}

export async function updateVoicePreferences(
  voiceId: string,
  prefs: {
    selectedSkinUrl?: string | null;
    selectedSkinLabel?: string | null;
    immortalAura?: string | null;
    signatureWorkKey?: string | null;
    isFullArt?: boolean;
    isFavoriteGuardian?: boolean;
  }
): Promise<TvVoiceAlbumPayload> {
  await ensureTvSchema();
  await query(
    `INSERT INTO tv.voice_album_state (voice_id, updated_at)
     VALUES ($1, CURRENT_TIMESTAMP)
     ON CONFLICT (voice_id) DO NOTHING`,
    [voiceId]
  );

  const updates: string[] = ['updated_at = CURRENT_TIMESTAMP'];
  const values: any[] = [voiceId];

  const pushUpdate = (col: string, val: any) => {
    values.push(val);
    updates.push(`${col} = $${values.length}`);
  };

  if (prefs.selectedSkinUrl !== undefined) pushUpdate('selected_skin_url', prefs.selectedSkinUrl);
  if (prefs.selectedSkinLabel !== undefined) pushUpdate('selected_skin_label', prefs.selectedSkinLabel);
  if (prefs.immortalAura !== undefined) pushUpdate('immortal_aura', prefs.immortalAura);
  if (prefs.signatureWorkKey !== undefined) pushUpdate('signature_work_key', prefs.signatureWorkKey);
  if (prefs.isFullArt !== undefined) pushUpdate('is_full_art', Boolean(prefs.isFullArt));
  if (prefs.isFavoriteGuardian !== undefined) pushUpdate('is_favorite_guardian', Boolean(prefs.isFavoriteGuardian));

  await query(`UPDATE tv.voice_album_state SET ${updates.join(', ')} WHERE voice_id = $1`, values);
  return buildTvVoiceAlbumPayload();
}

export async function saveVoiceCustomSkin(
  voiceId: string,
  skinUrl: string,
  skinLabel?: string | null
): Promise<TvVoiceAlbumPayload> {
  await ensureTvSchema();
  const label = skinLabel?.trim() || 'Minha Imagem Customizada';
  await query(
    `INSERT INTO tv.voice_album_state
      (voice_id, custom_skin_url, custom_skin_label, selected_skin_url, selected_skin_label, updated_at)
     VALUES ($1, $2, $3, $2, $3, CURRENT_TIMESTAMP)
     ON CONFLICT (voice_id) DO UPDATE SET
       custom_skin_url = EXCLUDED.custom_skin_url,
       custom_skin_label = EXCLUDED.custom_skin_label,
       selected_skin_url = EXCLUDED.selected_skin_url,
       selected_skin_label = EXCLUDED.selected_skin_label,
       updated_at = CURRENT_TIMESTAMP`,
    [voiceId, skinUrl, label]
  );
  return buildTvVoiceAlbumPayload();
}

export async function getClaimedVoiceAlbumXpSummary(): Promise<{
  totalVoiceXp: number;
  stuckVoices: number;
}> {
  await ensureTvSchema();
  const res = await query(
    `SELECT voice_id, stuck_tier, claimed_xp_pct, claimed_xp_extra_stars
     FROM tv.voice_album_state`
  );
  let totalVoiceXp = 0;
  let stuckVoices = 0;
  for (const row of res.rows) {
    if (row.stuck_tier) stuckVoices += 1;
    const xp = computeVoiceXpSplit(
      Number(row.claimed_xp_pct || 0),
      Number(row.claimed_xp_extra_stars || 0)
    ).totalXp;
    totalVoiceXp += xp;
  }
  return { totalVoiceXp, stuckVoices };
}
