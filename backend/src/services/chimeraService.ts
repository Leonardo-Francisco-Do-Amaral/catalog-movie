import axios from 'axios';
import { query } from '../config/database';
import { resolveTerritoryDescriptor } from './worldChallengeService';
import {
  CYCLE_PERIOD_DAYS,
  getSaoPaulo15DayCycleInfo,
  computeCycleBankedBalance,
} from '../utils/cycleUtils';
import {
  assertClassPowerChargeAvailable,
  ClassPowerWalletStatus,
  consumeClassPowerCharge,
} from './classPowersService';

export type ChimeraEraKey = 'bw_relic' | 'golden' | 'vhs_classic' | 'modern';

export type ChimeraRuneRarity = 'common' | 'rare' | 'legendary';

export type ChimeraD20Difficulty = 'nightmare' | 'hard' | 'balanced' | 'blessed';

export type ChimeraPillarKey = 'year' | 'country' | 'genre' | 'tag';

export type ChimeraRuneEffectType =
  | 'oracle_xp'
  | 'extra_two_tags'
  | 'time_lens'
  | 'metronome_short'
  | 'bravery_xp'
  | 'double_passport'
  | 'double_mask'
  | 'twin_years'
  | 'twin_gold_tags'
  | 'extra_forge_chip'
  | 'blessed_dice_next'
  | 'escapist_decline'
  | 'transmute_pillar'
  | 'sacrifice_category'
  | 'dubbing_star'
  | 'titan_nations'
  | 'millennium_portal'
  | 'all_era_jackpot'
  | 'all_block_jackpot'
  | 'all_genre_jackpot'
  | 'all_tags_jackpot'
  | 'crimson_multiplier'
  | 'echo_supreme'
  | 'blind_twin_picks'
  | 'omni_second_draw'
  | 'tag_supernova'
  | 'genre_hurricane';

export type ChimeraRitualStyle =
  | 'd20_rpg'
  | 'wanted_poster'
  | 'alchemy_cauldron'
  | 'rogue_runes'
  | 'rpg_mashup';

export interface ChimeraFateRune {
  id: ChimeraRuneEffectType;
  rarity: ChimeraRuneRarity;
  runeName: string;
  icon: string;
  effectType: ChimeraRuneEffectType;
  bonusXp: number;
  label: string;
  shortTag: string;
  chosen?: boolean;
}

export interface ChimeraSuggestionMovie {
  tmdbId: number;
  title: string;
  originalTitle: string | null;
  releaseYear: number | null;
  posterUrl: string | null;
  voteCount: number;
  genres: string[];
}

export interface ChimeraSpecialRule {
  id: 'short_allowed' | 'underdog' | 'jackpot_boost';
  icon: string;
  label: string;
  hint: string;
  bonusXp: number;
  allowShort: boolean;
}

export interface ChimeraRecipe {
  eraKey: ChimeraEraKey;
  eraLabel: string;
  targetYear: number;
  windowSize: number;
  minYear: number;
  maxYear: number;
  baseYearXp: number;
  jackpotYearXp: number;

  blockKey: string;
  blockLabel: string;
  blockIcon: string;
  blockCountries: string[];
  blockIsoCodes: string[];
  jackpotCountry: string;
  jackpotCountryIso: string;
  baseCountryXp: number;
  jackpotCountryXp: number;

  genres: string[];
  genreIds: number[];
  baseGenreXp: number;
  jackpotGenreXp: number;

  tags: string[];
  jackpotTag: string;
  baseTagXp: number;
  jackpotTagXp: number;

  specialRule: ChimeraSpecialRule | null;
  totalBaseXp: number;
  maxJackpotBonusXp: number;
  tmdbSuggestions: ChimeraSuggestionMovie[];

  creatureTitle?: string;
  creatureSubtitle?: string;
  d20Roll?: number;
  d20Rolls?: {
    era: number;
    block: number;
    genre: number;
    tag: number;
  };
  isCriticalD20?: boolean;
  d20Difficulty?: ChimeraD20Difficulty;
  d20DifficultyLabel?: string;
  difficultyBonusXp?: number;
  ritualStyle?: ChimeraRitualStyle;
  fateRunes?: ChimeraFateRune[];
  chosenFateRune?: ChimeraFateRune | null;

  // Mutações reais aplicadas por Runas Comuns, Raras & Lendárias
  chosenFateRunes?: ChimeraFateRune[];
  runePicksRemaining?: number;
  revealRemainingRarities?: boolean;
  pendingPillarActions?: Array<'transmute' | 'sacrifice'>;
  pendingPillarAction?: 'transmute' | 'sacrifice' | null;
  transmutedPillars?: ChimeraPillarKey[];
  sacrificedPillars?: ChimeraPillarKey[];
  extraTargetYears?: number[];
  extraBlockLabel?: string | null;
  extraBlockCountries?: string[];
  extraBlockIsoCodes?: string[];
  extraJackpotCountries?: Array<{ name: string; iso: string }>;
  stackableCountryJackpots?: boolean;
  extraJackpotGenres?: string[];
  stackableGenreJackpots?: boolean;
  extraJackpotTags?: string[];
  stackableTagJackpots?: boolean;
  legendaryJackpotPillars?: ChimeraPillarKey[];
  jackpotMultiplierBonusRate?: number;
  flatRuneBonusXp?: number;
  allowPost2000?: boolean;
  requiresDubbedBonusXp?: number;
}

export interface ChimeraMatchedMovieSnapshot {
  movieId: number;
  title: string;
  originalTitle: string | null;
  releaseYear: number | null;
  posterUrl: string | null;
  runtime: number | null;
  voteCount: number;
  audioType?: string | null;
  countries: string[];
  genres: string[];
  tags: string[];
}

export interface ChimeraMatchDetails {
  baseYearOk: boolean;
  baseCountryOk: boolean;
  baseGenreOk: boolean;
  baseTagOk: boolean;
  matchedGenres: string[];
  matchedTags: string[];
  matchedCountries: string[];

  hitJackpotYear: boolean;
  hitJackpotCountry: boolean;
  hitJackpotGenre: boolean;
  hitJackpotTag: boolean;
  hitSpecialBonus: boolean;
  hitDubbingBonus?: boolean;
  jackpotsHitCount: number;

  baseXp: number;
  jackpotYearXp: number;
  jackpotCountryXp: number;
  jackpotGenreXp: number;
  jackpotTagXp: number;
  specialBonusXp: number;
  dubbingBonusXp?: number;
  runeBonusXp?: number;
  totalClaimableXp: number;
}

export interface ChimeraContract {
  id: number;
  status: 'active' | 'ready_to_claim' | 'claimed' | 'discarded';
  recipe: ChimeraRecipe;
  matchedMovieId: number | null;
  matchedMovie: ChimeraMatchedMovieSnapshot | null;
  matchDetails: ChimeraMatchDetails | null;
  xpAwarded: number;
  createdAt: string;
  matchedAt: string | null;
  claimedAt: string | null;
}

export interface ChimeraWallet {
  weekKey: string;
  cycleKey: string;
  weeklyAllowance: number;
  cycleAllowance: number;
  chipsRemaining: number;
  chipsUsedThisWeek: number;
  maxChipsBank: number;
  cycleDays: number;
  declineChipsRemaining: number;
  declineCycleAllowance: number;
  maxDeclineBank: number;
  nextBlessedRolls: number;
  nextResetLabel: string;
}

export interface ChimeraStatPoints {
  AGI: number;
  INT: number;
  DES: number;
  CAR: number;
  total: number;
}

export const EMPTY_CHIMERA_STAT_POINTS: ChimeraStatPoints = {
  AGI: 0,
  INT: 0,
  DES: 0,
  CAR: 0,
  total: 0,
};

export interface ChimeraXpSummary {
  claimedCount: number;
  totalXp: number;
  totalJackpotsHit: number;
  statPoints: ChimeraStatPoints;
  claimedMap: Record<
    string,
    {
      chimeraId: number;
      movieTitle: string;
      xp: number;
      jackpotsHitCount: number;
      statPoints: ChimeraStatPoints;
      claimedAt: string | null;
    }
  >;
}

export const EMPTY_CHIMERA_XP_SUMMARY: ChimeraXpSummary = {
  claimedCount: 0,
  totalXp: 0,
  totalJackpotsHit: 0,
  statPoints: { ...EMPTY_CHIMERA_STAT_POINTS },
  claimedMap: {},
};

export const WEEKLY_CHIMERA_CHIPS_LIMIT = 3;
export const MAX_CHIMERA_CHIPS_BANK = 5;
export const CHIMERA_DECLINE_CHIPS_LIMIT = 1;
export const MAX_CHIMERA_DECLINE_BANK = 2;
export const MAX_ACTIVE_CHIMERAS = 2;

const CHIMERA_ERAS: Array<{
  key: ChimeraEraKey;
  label: string;
  minTarget: number;
  maxTarget: number;
  windowSize: number;
  baseXp: number;
  jackpotXp: number;
  weight: number;
  minVotes: number;
}> = [
  { key: 'bw_relic', label: 'Relíquia P&B', minTarget: 1931, maxTarget: 1949, windowSize: 20, baseXp: 60, jackpotXp: 55, weight: 10, minVotes: 50 },
  { key: 'golden', label: 'Era de Ouro', minTarget: 1950, maxTarget: 1969, windowSize: 15, baseXp: 45, jackpotXp: 40, weight: 18, minVotes: 80 },
  { key: 'vhs_classic', label: 'Clássicos & VHS', minTarget: 1970, maxTarget: 1999, windowSize: 10, baseXp: 30, jackpotXp: 30, weight: 36, minVotes: 150 },
  { key: 'modern', label: 'Era Moderna', minTarget: 2000, maxTarget: 2025, windowSize: 5, baseXp: 15, jackpotXp: 20, weight: 36, minVotes: 200 },
];

interface CountryBlockDef {
  key: string;
  label: string;
  icon: string;
  baseXp: number;
  jackpotXp: number;
  weight: number;
  pre1970Weight: number;
  countries: Array<{ iso: string; name: string }>;
}

const CHIMERA_COUNTRY_BLOCKS: CountryBlockDef[] = [
  {
    key: 'na_anglo',
    label: 'América do Norte',
    icon: '🗽',
    baseXp: 10,
    jackpotXp: 15,
    weight: 16,
    pre1970Weight: 26,
    countries: [
      { iso: 'US', name: 'Estados Unidos' },
      { iso: 'CA', name: 'Canadá' },
      { iso: 'MX', name: 'México' },
    ],
  },
  {
    key: 'europe_west',
    label: 'Europa Ocidental',
    icon: '🏰',
    baseXp: 20,
    jackpotXp: 25,
    weight: 16,
    pre1970Weight: 24,
    countries: [
      { iso: 'GB', name: 'Reino Unido' },
      { iso: 'FR', name: 'França' },
      { iso: 'DE', name: 'Alemanha' },
      { iso: 'IE', name: 'Irlanda' },
      { iso: 'BE', name: 'Bélgica' },
      { iso: 'NL', name: 'Países Baixos' },
      { iso: 'CH', name: 'Suíça' },
      { iso: 'AT', name: 'Áustria' },
    ],
  },
  {
    key: 'latam_south',
    label: 'América do Sul & Caribe',
    icon: '🌎',
    baseXp: 25,
    jackpotXp: 25,
    weight: 15,
    pre1970Weight: 8,
    countries: [
      { iso: 'BR', name: 'Brasil' },
      { iso: 'AR', name: 'Argentina' },
      { iso: 'CL', name: 'Chile' },
      { iso: 'CO', name: 'Colômbia' },
      { iso: 'UY', name: 'Uruguai' },
      { iso: 'PE', name: 'Peru' },
      { iso: 'CU', name: 'Cuba' },
    ],
  },
  {
    key: 'europe_med',
    label: 'Europa Mediterrânea',
    icon: '🏛️',
    baseXp: 30,
    jackpotXp: 30,
    weight: 13,
    pre1970Weight: 18,
    countries: [
      { iso: 'IT', name: 'Itália' },
      { iso: 'ES', name: 'Espanha' },
      { iso: 'PT', name: 'Portugal' },
      { iso: 'GR', name: 'Grécia' },
    ],
  },
  {
    key: 'asia_east',
    label: 'Ásia Oriental',
    icon: '🏮',
    baseXp: 35,
    jackpotXp: 35,
    weight: 14,
    pre1970Weight: 14,
    countries: [
      { iso: 'JP', name: 'Japão' },
      { iso: 'KR', name: 'Coreia do Sul' },
      { iso: 'CN', name: 'China' },
      { iso: 'HK', name: 'Hong Kong' },
      { iso: 'TW', name: 'Taiwan' },
    ],
  },
  {
    key: 'nordics',
    label: 'Países Nórdicos',
    icon: '❄️',
    baseXp: 45,
    jackpotXp: 40,
    weight: 8,
    pre1970Weight: 8,
    countries: [
      { iso: 'SE', name: 'Suécia' },
      { iso: 'DK', name: 'Dinamarca' },
      { iso: 'NO', name: 'Noruega' },
      { iso: 'FI', name: 'Finlândia' },
      { iso: 'IS', name: 'Islândia' },
    ],
  },
  {
    key: 'europe_east',
    label: 'Leste Europeu & Eurásia',
    icon: '🪆',
    baseXp: 50,
    jackpotXp: 45,
    weight: 7,
    pre1970Weight: 8,
    countries: [
      { iso: 'PL', name: 'Polônia' },
      { iso: 'HU', name: 'Hungria' },
      { iso: 'CZ', name: 'Tchéquia' },
      { iso: 'RO', name: 'Romênia' },
      { iso: 'RU', name: 'Rússia' },
      { iso: 'SU', name: 'União Soviética' },
      { iso: 'UA', name: 'Ucrânia' },
      { iso: 'RS', name: 'Sérvia' },
    ],
  },
  {
    key: 'africa_oceania',
    label: 'África do Sul, África & Oceania',
    icon: '🦁',
    baseXp: 45,
    jackpotXp: 45,
    weight: 6,
    pre1970Weight: 3,
    countries: [
      { iso: 'ZA', name: 'África do Sul' },
      { iso: 'NG', name: 'Nigéria' },
      { iso: 'KE', name: 'Quênia' },
      { iso: 'SN', name: 'Senegal' },
      { iso: 'GH', name: 'Gana' },
      { iso: 'AU', name: 'Austrália' },
      { iso: 'NZ', name: 'Nova Zelândia' },
    ],
  },
  {
    key: 'asia_south',
    label: 'Sul & Sudeste Asiático',
    icon: '🪷',
    baseXp: 55,
    jackpotXp: 45,
    weight: 5,
    pre1970Weight: 4,
    countries: [
      { iso: 'IN', name: 'Índia' },
      { iso: 'TH', name: 'Tailândia' },
      { iso: 'ID', name: 'Indonésia' },
      { iso: 'PH', name: 'Filipinas' },
      { iso: 'VN', name: 'Vietnã' },
      { iso: 'MY', name: 'Malásia' },
    ],
  },
  {
    key: 'mena',
    label: 'Oriente Médio & Norte da África',
    icon: '🕌',
    baseXp: 65,
    jackpotXp: 55,
    weight: 4,
    pre1970Weight: 3,
    countries: [
      { iso: 'IR', name: 'Irã' },
      { iso: 'TR', name: 'Turquia' },
      { iso: 'EG', name: 'Egito' },
      { iso: 'MA', name: 'Marrocos' },
      { iso: 'LB', name: 'Líbano' },
      { iso: 'DZ', name: 'Argélia' },
      { iso: 'TN', name: 'Tunísia' },
      { iso: 'IL', name: 'Israel' },
    ],
  },
];

interface GenreDef {
  id: number;
  name: string;
  aliases: string[];
  cluster: 'dark' | 'scifi' | 'drama' | 'action' | 'light';
}

const CHIMERA_GENRES: GenreDef[] = [
  { id: 18, name: 'Drama', aliases: ['drama'], cluster: 'drama' },
  { id: 27, name: 'Terror', aliases: ['terror', 'horror', 'horor'], cluster: 'dark' },
  { id: 53, name: 'Suspense', aliases: ['suspense', 'thriller'], cluster: 'dark' },
  { id: 28, name: 'Ação', aliases: ['acao', 'action'], cluster: 'action' },
  { id: 878, name: 'Ficção Científica', aliases: ['ficcao cientifica', 'sci-fi', 'science fiction'], cluster: 'scifi' },
  { id: 12, name: 'Aventura', aliases: ['aventura', 'adventure'], cluster: 'action' },
  { id: 14, name: 'Fantasia', aliases: ['fantasia', 'fantasy'], cluster: 'scifi' },
  { id: 9648, name: 'Mistério', aliases: ['misterio', 'mystery'], cluster: 'dark' },
  { id: 35, name: 'Comédia', aliases: ['comedia', 'comedy'], cluster: 'light' },
  { id: 16, name: 'Animação', aliases: ['animacao', 'animation'], cluster: 'light' },
  { id: 80, name: 'Policial', aliases: ['policial', 'crime'], cluster: 'drama' },
  { id: 10749, name: 'Romance', aliases: ['romance'], cluster: 'drama' },
  { id: 10751, name: 'Família', aliases: ['familia', 'family'], cluster: 'light' },
  { id: 10752, name: 'Guerra', aliases: ['guerra', 'war'], cluster: 'drama' },
  { id: 37, name: 'Faroeste', aliases: ['faroeste', 'western'], cluster: 'action' },
];

// Tags explicitamente EXCLUÍDAS do sorteio (listas, franquias, repetição e notas pessoais subjetivas como Emocionante / Em Família)
const EXCLUDED_CHIMERA_TAG_NORMS = new Set([
  'sk',
  'top250',
  'top 250',
  'coletanea',
  'parodia',
  'repetido',
  'marvel',
  'dc',
  'x men',
  'xmen',
  'invocaversus',
  'invoca versus',
  'emocionante',
  'em familia',
  'final epico',
  'mudo',
]);

// Tags temáticas válidas mapeadas com afinidade de cluster + dificuldade real no catálogo
const CURATED_CHIMERA_TAGS: Array<{
  name: string;
  clusters: Array<GenreDef['cluster'] | 'any'>;
  difficulty: 'easy' | 'medium' | 'hard';
}> = [
  { name: 'Gore', clusters: ['dark', 'action'], difficulty: 'medium' },
  { name: 'Super Poder', clusters: ['scifi', 'action', 'light'], difficulty: 'easy' },
  { name: 'Abuso Familiar', clusters: ['drama', 'dark'], difficulty: 'medium' },
  { name: 'Trágico', clusters: ['drama', 'dark', 'any'], difficulty: 'easy' },
  { name: 'Personagem LGBT', clusters: ['drama', 'light', 'any'], difficulty: 'medium' },
  { name: 'Criança Malvada', clusters: ['dark', 'drama'], difficulty: 'hard' },
  { name: 'Preconceito', clusters: ['drama', 'any'], difficulty: 'easy' },
  { name: 'Religião', clusters: ['drama', 'dark'], difficulty: 'medium' },
  { name: 'Colegio/Escola', clusters: ['drama', 'light', 'dark'], difficulty: 'easy' },
  { name: 'Sequestro', clusters: ['dark', 'drama', 'action'], difficulty: 'easy' },
  { name: 'Fatos Reais', clusters: ['drama', 'any'], difficulty: 'easy' },
  { name: 'Vilão', clusters: ['action', 'dark', 'scifi'], difficulty: 'easy' },
  { name: 'Aliens', clusters: ['scifi', 'dark', 'action'], difficulty: 'medium' },
  { name: 'Bruxo', clusters: ['scifi', 'dark', 'light'], difficulty: 'hard' },
  { name: 'Crime real', clusters: ['drama', 'dark'], difficulty: 'medium' },
  { name: 'Demônio', clusters: ['dark', 'scifi'], difficulty: 'easy' },
  { name: 'Dystopia', clusters: ['scifi', 'drama', 'action'], difficulty: 'hard' },
  { name: 'Vampiro', clusters: ['dark', 'scifi', 'action'], difficulty: 'medium' },
  { name: 'Viagem no Tempo', clusters: ['scifi', 'action', 'light'], difficulty: 'medium' },
  { name: 'Animais antropomorficos', clusters: ['light', 'scifi'], difficulty: 'hard' },
  { name: 'Fantasma', clusters: ['dark', 'scifi'], difficulty: 'medium' },
  { name: 'Natal', clusters: ['light', 'drama'], difficulty: 'hard' },
  { name: 'Baseado em Anime', clusters: ['action', 'scifi', 'light'], difficulty: 'hard' },
  { name: 'Zumbi', clusters: ['dark', 'action', 'scifi'], difficulty: 'hard' },
  { name: 'Lobisomem', clusters: ['dark', 'scifi'], difficulty: 'hard' },
  { name: 'Baseado em jogo', clusters: ['action', 'scifi', 'light'], difficulty: 'hard' },
  { name: 'Multiverso', clusters: ['scifi', 'action'], difficulty: 'hard' },
  { name: 'Preto e branco', clusters: ['any'], difficulty: 'hard' },
];

const SPECIAL_RULES: ChimeraSpecialRule[] = [
  {
    id: 'short_allowed',
    icon: '🎞️',
    label: 'Especial: Vale Filme ou Curta!',
    hint: 'Permite usar curta-metragem (< 50 min) para concluir a Quimera — se for curta, ganha +25 XP extras!',
    bonusXp: 25,
    allowShort: true,
  },
  {
    id: 'underdog',
    icon: '💎',
    label: 'Especial: Garimpo Underground',
    hint: 'Se o filme escolhido tiver menos de 5.000 votos no TMDB, você leva +30 XP extras!',
    bonusXp: 30,
    allowShort: false,
  },
  {
    id: 'jackpot_boost',
    icon: '⚡',
    label: 'Especial: Turbo nos Jackpots',
    hint: 'Se acertar ao menos 1 Jackpot qualquer nesta Quimera, ganha +30 XP bônus imediatos!',
    bonusXp: 30,
    allowShort: false,
  },
];

let tablesEnsured = false;

function normalizeText(value: string | null | undefined): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase();
}

export async function ensureChimeraTables(): Promise<void> {
  if (tablesEnsured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS chimera_wallet (
      id INTEGER PRIMARY KEY DEFAULT 1,
      week_key VARCHAR(20) NOT NULL,
      weekly_allowance INTEGER NOT NULL DEFAULT 3,
      chips_remaining INTEGER NOT NULL DEFAULT 3,
      chips_used_this_week INTEGER NOT NULL DEFAULT 0,
      decline_chips_remaining INTEGER NOT NULL DEFAULT 1,
      next_blessed_rolls INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE chimera_wallet
      ADD COLUMN IF NOT EXISTS decline_chips_remaining INTEGER NOT NULL DEFAULT 1;

    ALTER TABLE chimera_wallet
      ADD COLUMN IF NOT EXISTS next_blessed_rolls INTEGER NOT NULL DEFAULT 0;

    CREATE TABLE IF NOT EXISTS chimera_contracts (
      id SERIAL PRIMARY KEY,
      status VARCHAR(32) NOT NULL DEFAULT 'active',
      recipe_json JSONB NOT NULL,
      matched_movie_id INTEGER NULL REFERENCES movies(id) ON DELETE SET NULL,
      matched_movie_json JSONB NULL,
      match_details_json JSONB NULL,
      xp_awarded INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      matched_at TIMESTAMP NULL,
      claimed_at TIMESTAMP NULL
    );

    CREATE INDEX IF NOT EXISTS idx_chimera_contracts_status
      ON chimera_contracts (status);
  `);
  tablesEnsured = true;
}

function mapChimeraWalletRow(row: any, nextResetLabel: string): ChimeraWallet {
  const cycleKey = String(row.week_key);
  return {
    weekKey: cycleKey,
    cycleKey,
    weeklyAllowance: WEEKLY_CHIMERA_CHIPS_LIMIT,
    cycleAllowance: WEEKLY_CHIMERA_CHIPS_LIMIT,
    chipsRemaining: Math.max(0, Number(row.chips_remaining ?? WEEKLY_CHIMERA_CHIPS_LIMIT)),
    chipsUsedThisWeek: Math.max(0, Number(row.chips_used_this_week || 0)),
    maxChipsBank: MAX_CHIMERA_CHIPS_BANK,
    cycleDays: CYCLE_PERIOD_DAYS,
    declineChipsRemaining: Math.max(
      0,
      Number(row.decline_chips_remaining ?? CHIMERA_DECLINE_CHIPS_LIMIT)
    ),
    declineCycleAllowance: CHIMERA_DECLINE_CHIPS_LIMIT,
    maxDeclineBank: MAX_CHIMERA_DECLINE_BANK,
    nextBlessedRolls: Math.max(0, Number(row.next_blessed_rolls || 0)),
    nextResetLabel,
  };
}

export async function ensureChimeraWallet(): Promise<ChimeraWallet> {
  await ensureChimeraTables();
  const { cycleIndex, cycleKey, nextResetLabel } = getSaoPaulo15DayCycleInfo();
  const curRes = await query(`SELECT * FROM chimera_wallet WHERE id = 1`);
  const row = curRes.rows[0];

  if (!row || String(row.week_key) !== cycleKey) {
    const nextForgeChips = row
      ? computeCycleBankedBalance({
          previousCycleKey: row.week_key,
          currentCycleIndex: cycleIndex,
          currentCycleKey: cycleKey,
          currentBalance: Number(row.chips_remaining ?? 0),
          allowancePerCycle: WEEKLY_CHIMERA_CHIPS_LIMIT,
          maxBankCap: MAX_CHIMERA_CHIPS_BANK,
        })
      : WEEKLY_CHIMERA_CHIPS_LIMIT;

    const nextDeclineChips = row
      ? computeCycleBankedBalance({
          previousCycleKey: row.week_key,
          currentCycleIndex: cycleIndex,
          currentCycleKey: cycleKey,
          currentBalance: Number(row.decline_chips_remaining ?? 0),
          allowancePerCycle: CHIMERA_DECLINE_CHIPS_LIMIT,
          maxBankCap: MAX_CHIMERA_DECLINE_BANK,
        })
      : CHIMERA_DECLINE_CHIPS_LIMIT;

    const nextBlessedRolls = Math.max(0, Number(row?.next_blessed_rolls || 0));

    const upd = await query(
      `INSERT INTO chimera_wallet (
         id, week_key, weekly_allowance, chips_remaining, chips_used_this_week,
         decline_chips_remaining, next_blessed_rolls, updated_at
       )
       VALUES (1, $1, $2, $3, 0, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         week_key = EXCLUDED.week_key,
         weekly_allowance = EXCLUDED.weekly_allowance,
         chips_remaining = EXCLUDED.chips_remaining,
         chips_used_this_week = 0,
         decline_chips_remaining = EXCLUDED.decline_chips_remaining,
         next_blessed_rolls = EXCLUDED.next_blessed_rolls,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [cycleKey, WEEKLY_CHIMERA_CHIPS_LIMIT, nextForgeChips, nextDeclineChips, nextBlessedRolls]
    );
    return mapChimeraWalletRow(upd.rows[0], nextResetLabel);
  }

  return mapChimeraWalletRow(row, nextResetLabel);
}

function pickWeighted<T>(items: T[], getWeight: (item: T) => number): T {
  const total = items.reduce((s, it) => s + Math.max(0, getWeight(it)), 0);
  if (total <= 0) return items[Math.floor(Math.random() * items.length)];
  let roll = Math.random() * total;
  for (const it of items) {
    roll -= Math.max(0, getWeight(it));
    if (roll <= 0) return it;
  }
  return items[items.length - 1];
}

function shuffleArr<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function computeEraWindow(era: (typeof CHIMERA_ERAS)[number], targetYear: number): { minYear: number; maxYear: number } {
  const span = era.windowSize;
  const maxAllowed = era.key === 'modern' ? new Date().getFullYear() : era.key === 'bw_relic' ? 1955 : 2026;
  const minAllowed = 1920;

  let minYear = targetYear - Math.floor((span - 1) / 2);
  let maxYear = minYear + span - 1;

  if (minYear < minAllowed) {
    minYear = minAllowed;
    maxYear = minYear + span - 1;
  }
  if (maxYear > maxAllowed) {
    maxYear = maxAllowed;
    minYear = Math.max(minAllowed, maxYear - span + 1);
  }
  return { minYear, maxYear };
}

const CHIMERA_TAGS_PER_RECIPE = 5;

async function loadAvailableThemeTags(
  g1: GenreDef,
  g2: GenreDef,
  minYear: number,
  desiredCount = CHIMERA_TAGS_PER_RECIPE,
  excludeNorms: Set<string> = new Set(),
  tagDiff: ChimeraD20Difficulty = 'balanced'
): Promise<string[]> {
  const dbRes = await query(`
    SELECT ut.name, COUNT(mt.movie_id)::int AS movie_count
    FROM user_tags ut
    LEFT JOIN movie_tags mt ON mt.tag_id = ut.id
    GROUP BY ut.name
    ORDER BY ut.name ASC
  `).catch(() => ({ rows: [] as any[] }));

  const curatedMap = new Map<
    string,
    { clusters: Array<GenreDef['cluster'] | 'any'>; difficulty: 'easy' | 'medium' | 'hard' }
  >(CURATED_CHIMERA_TAGS.map((t) => [normalizeText(t.name), { clusters: t.clusters, difficulty: t.difficulty }]));

  const candidates: Array<{ name: string; affinity: number; difficulty: 'easy' | 'medium' | 'hard' }> = [];
  const seen = new Set<string>(excludeNorms);

  const considerTag = (rawName: string, movieCount = 5) => {
    const clean = String(rawName || '').trim();
    const norm = normalizeText(clean);
    if (!norm || seen.has(norm) || EXCLUDED_CHIMERA_TAG_NORMS.has(norm)) return;
    seen.add(norm);
    const meta = curatedMap.get(norm);
    const clusters = meta?.clusters || ['any'];
    const hasMatch =
      clusters.includes('any') || clusters.includes(g1.cluster) || clusters.includes(g2.cluster);
    if (meta && !hasMatch && minYear < 1970) {
      return; // Evita tags incompatíveis em épocas clássicas (ex.: "Baseado em Anime" em 1945)
    }

    // Dificuldade real: respeita curadoria explícita + contagem real no catálogo
    let tier: 'easy' | 'medium' | 'hard' = meta?.difficulty || (movieCount <= 4 ? 'hard' : movieCount <= 12 ? 'medium' : 'easy');
    if (!meta && movieCount <= 5) tier = 'hard';
    if (!meta && movieCount >= 18) tier = 'easy';

    candidates.push({
      name: clean,
      affinity: hasMatch ? 3 : 1,
      difficulty: tier,
    });
  };

  for (const r of dbRes.rows || []) considerTag(r.name, Number(r.movie_count || 0));
  for (const c of CURATED_CHIMERA_TAGS) considerTag(c.name, 5);

  const hardPool = shuffleArr(candidates.filter((c) => c.difficulty === 'hard'));
  const medPool = shuffleArr(candidates.filter((c) => c.difficulty === 'medium'));
  const easyPool = shuffleArr(candidates.filter((c) => c.difficulty === 'easy'));

  let ordered: typeof candidates = [];
  if (tagDiff === 'nightmare') {
    ordered = [...hardPool, ...medPool, ...easyPool];
  } else if (tagDiff === 'hard') {
    ordered = [...hardPool.slice(0, 3), ...medPool.slice(0, 3), ...hardPool.slice(3), ...medPool.slice(3), ...easyPool];
  } else if (tagDiff === 'blessed') {
    ordered = [...easyPool, ...medPool, ...hardPool];
  } else {
    ordered = [...medPool.slice(0, 3), ...easyPool.slice(0, 2), ...hardPool.slice(0, 2), ...medPool.slice(3), ...easyPool.slice(2), ...hardPool.slice(2)];
  }

  const picked: string[] = [];
  for (const item of ordered) {
    if (!picked.includes(item.name)) picked.push(item.name);
    if (picked.length === desiredCount) break;
  }
  if (picked.length < desiredCount) {
    for (const c of shuffleArr(CURATED_CHIMERA_TAGS)) {
      if (picked.length >= desiredCount) break;
      const norm = normalizeText(c.name);
      if (!excludeNorms.has(norm) && !picked.some((p) => normalizeText(p) === norm)) {
        picked.push(c.name);
      }
    }
  }
  return picked;
}

async function fetchDiscoverSuggestionsForCandidate(params: {
  minYear: number;
  maxYear: number;
  blockIsoCodes: string[];
  genreIds: [number, number];
  minVotes: number;
  allowShort: boolean;
  watchedTmdbIds: Set<number>;
  watchedTitles: Set<string>;
}): Promise<{ totalResults: number; suggestions: ChimeraSuggestionMovie[] }> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return { totalResults: 10, suggestions: [] };
  }

  const genreNameById = new Map<number, string>(CHIMERA_GENRES.map((g) => [g.id, g.name]));
  const queryParams: Record<string, any> = {
    api_key: apiKey,
    language: 'pt-BR',
    include_adult: false,
    include_video: false,
    sort_by: 'popularity.desc',
    'primary_release_date.gte': `${params.minYear}-01-01`,
    'primary_release_date.lte': `${params.maxYear}-12-31`,
    with_origin_country: params.blockIsoCodes.join('|'),
    with_genres: `${params.genreIds[0]}|${params.genreIds[1]}`,
    without_genres: '99,36',
    'vote_count.gte': params.minVotes,
    page: 1,
  };
  if (!params.allowShort) {
    queryParams['with_runtime.gte'] = 45;
  }

  try {
    const resp = await axios.get('https://api.themoviedb.org/3/discover/movie', {
      params: queryParams,
      timeout: 7000,
    });
    const totalResults = Number(resp.data?.total_results || 0);
    let results: any[] = Array.isArray(resp.data?.results) ? resp.data.results : [];

    // Mistura página 2 se houver variedade para sugestões menos óbvias
    if (Number(resp.data?.total_pages || 1) >= 2 && totalResults >= 30) {
      try {
        const page2 = Math.min(3, Number(resp.data.total_pages));
        const r2 = await axios.get('https://api.themoviedb.org/3/discover/movie', {
          params: { ...queryParams, page: page2 },
          timeout: 6000,
        });
        if (Array.isArray(r2.data?.results)) {
          results = [...results.slice(0, 8), ...r2.data.results.slice(0, 8)];
        }
      } catch {
        // usa apenas página 1
      }
    }

    const filtered = results.filter((m) => {
      const tid = Number(m?.id || 0);
      if (!tid || params.watchedTmdbIds.has(tid)) return false;
      const tNorm = normalizeText(m?.title || m?.original_title);
      if (tNorm && params.watchedTitles.has(tNorm)) return false;
      return true;
    });

    const chosen = shuffleArr(filtered).slice(0, 5);
    const suggestions: ChimeraSuggestionMovie[] = chosen.map((m) => {
      const yMatch = String(m.release_date || '').match(/^(\d{4})/);
      const gNames = Array.isArray(m.genre_ids)
        ? m.genre_ids.map((gid: number) => genreNameById.get(Number(gid))).filter(Boolean)
        : [];
      return {
        tmdbId: Number(m.id),
        title: String(m.title || m.original_title || 'Sem título'),
        originalTitle: m.original_title ? String(m.original_title) : null,
        releaseYear: yMatch ? Number(yMatch[1]) : null,
        posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : null,
        voteCount: Number(m.vote_count || 0),
        genres: gNames.slice(0, 3),
      };
    });

    return { totalResults, suggestions };
  } catch {
    return { totalResults: 10, suggestions: [] };
  }
}

function buildCreatureIdentity(params: {
  g1: GenreDef;
  g2: GenreDef;
  blockLabel: string;
  jackpotCountry: string;
  minYear: number;
  jackpotTag: string;
}): { creatureTitle: string; creatureSubtitle: string } {
  const byCluster: Record<GenreDef['cluster'], string[]> = {
    dark: ['O Espectro', 'A Hidra Sombria', 'O Nosferatu', 'A Gárgula'],
    scifi: ['O Autômato', 'O Oráculo Astral', 'A Quimera Quântica', 'O Crononauta'],
    action: ['O Caçador', 'O Dragão de Ferro', 'O Colosso', 'O Ronin'],
    light: ['O Arlequim', 'O Espírito Brilhante', 'O Grifo Dourado', 'O Bardo'],
    drama: ['O Guardião', 'A Esfinge', 'O Cavaleiro Solitário', 'O Alquimista'],
  };
  const titles = byCluster[params.g1.cluster] || byCluster.drama;
  const pickTitle = titles[Math.floor(Math.random() * titles.length)];
  const dec = Math.floor(params.minYear / 10) * 10;
  return {
    creatureTitle: `${pickTitle} de ${params.jackpotCountry}`,
    creatureSubtitle: `Manifestação ${params.g1.name}/${params.g2.name} • Era ${dec}s • Aura "${params.jackpotTag}"`,
  };
}

export const CHIMERA_RUNE_CATALOG: ChimeraFateRune[] = [
  // ===== COMUNS =====
  {
    id: 'oracle_xp',
    rarity: 'common',
    runeName: 'Runa do Sábio',
    icon: '🔮',
    effectType: 'oracle_xp',
    bonusXp: 15,
    shortTag: '+15 XP Fixos',
    label: 'Concede +15 XP garantidos ao despertar e colher esta Quimera.',
  },
  {
    id: 'extra_two_tags',
    rarity: 'common',
    runeName: 'Leque Ampliado',
    icon: '🏷️',
    effectType: 'extra_two_tags',
    bonusXp: 0,
    shortTag: '+2 Tags Extras (7 no total)',
    label: 'Sorteia +2 Tags válidas extras na receita (sobe de 5 para 7 Tags possíveis!).',
  },
  {
    id: 'time_lens',
    rarity: 'common',
    runeName: 'Lente Cronológica',
    icon: '🔭',
    effectType: 'time_lens',
    bonusXp: 0,
    shortTag: 'Janela ±3 Anos',
    label: 'Expande a faixa de lançamento em 3 anos para trás e 3 para frente.',
  },
  {
    id: 'metronome_short',
    rarity: 'common',
    runeName: 'Runa do Metrônomo',
    icon: '🎞️',
    effectType: 'metronome_short',
    bonusXp: 20,
    shortTag: 'Libera Curta (+20 XP)',
    label: 'Ativa regra especial de Curta-metragem (<50 min) valendo +20 XP extras ou turbina o Especial atual em +15 XP.',
  },

  {
    id: 'bravery_xp',
    rarity: 'common',
    runeName: 'Coração Valente',
    icon: '🦁',
    effectType: 'bravery_xp',
    bonusXp: 25,
    shortTag: '+25 XP (se D20 ≤ 9) / +10 XP',
    label: 'Concede +25 XP se qualquer dado D20 da Quimera tiver caído Difícil/Pesadelo (≤ 9), ou +10 XP caso contrário.',
  },

  // ===== RARAS (2º SORTEIO / ECONOMIA / PODERES DE PILAR) =====
  {
    id: 'double_passport',
    rarity: 'rare',
    runeName: 'Passaporte Duplo',
    icon: '🌍',
    effectType: 'double_passport',
    bonusXp: 0,
    shortTag: '2º Bloco + 2º País Jackpot',
    label: 'Faz um 2º sorteio de Bloco Regional! Os dois blocos valem na base e você ganha um 2º País Jackpot!',
  },
  {
    id: 'double_mask',
    rarity: 'rare',
    runeName: 'Máscara Dupla',
    icon: '🎭',
    effectType: 'double_mask',
    bonusXp: 0,
    shortTag: '+1 Gênero (3 no total!)',
    label: 'Faz um 2º sorteio de Gênero (+1 Gênero extra)! Qualquer 1 libera a base e quaisquer 2 combinados dão o Jackpot!',
  },
  {
    id: 'twin_years',
    rarity: 'rare',
    runeName: 'Fenda dos Anos Gêmeos',
    icon: '⏳',
    effectType: 'twin_years',
    bonusXp: 0,
    shortTag: '2 Anos Jackpot na Faixa',
    label: 'Sorteia um 2º Ano Exato dentro da faixa! Acertar qualquer um dos 2 anos ativa o Jackpot de Época!',
  },
  {
    id: 'twin_gold_tags',
    rarity: 'rare',
    runeName: 'Duas Coroas',
    icon: '💎',
    effectType: 'twin_gold_tags',
    bonusXp: 0,
    shortTag: '2 Tags Douradas Jackpot',
    label: 'Promove uma 2ª Tag da receita para Tag Dourada! Qualquer uma das 2 ativa o Jackpot de Tag!',
  },
  {
    id: 'extra_forge_chip',
    rarity: 'rare',
    runeName: 'Selo da Recarga',
    icon: '🪙',
    effectType: 'extra_forge_chip',
    bonusXp: 10,
    shortTag: '+1 Ficha de Forja + 10 XP',
    label: 'Concede imediatamente +1 Ficha de Forja de Quimera na sua carteira e +10 XP bônus nesta Quimera!',
  },
  {
    id: 'blessed_dice_next',
    rarity: 'rare',
    runeName: 'Bênção do Próximo D20',
    icon: '✨',
    effectType: 'blessed_dice_next',
    bonusXp: 10,
    shortTag: 'Próx. Forja D20 (14–20) + 10 XP',
    label: 'Abencoa sua PRÓXIMA forja de Quimera para todos os 4 dados D20 caírem entre 14 e 20, além de dar +10 XP agora!',
  },
  {
    id: 'escapist_decline',
    rarity: 'rare',
    runeName: 'Pergaminho de Fuga',
    icon: '🪶',
    effectType: 'escapist_decline',
    bonusXp: 10,
    shortTag: '+1 Declínio na Carteira + 10 XP',
    label: 'Adiciona +1 Ficha de Declínio de Quimera na carteira e concede +10 XP bônus neste contrato!',
  },
  {
    id: 'transmute_pillar',
    rarity: 'rare',
    runeName: 'Alquimia de Categoria',
    icon: '🔀',
    effectType: 'transmute_pillar',
    bonusXp: 0,
    shortTag: 'Rerrolar 1 Pilar (D20 10–20)',
    label: 'Desbloqueia um poder único no card para escolher 1 categoria (Época, Bloco, Gênero ou Tags) e rerrolá-la com dado alto (10–20)!',
  },
  {
    id: 'sacrifice_category',
    rarity: 'rare',
    runeName: 'Sacrifício de Pilar',
    icon: '🗡️',
    effectType: 'sacrifice_category',
    bonusXp: 0,
    shortTag: 'Descarta 1 Pilar (-XP dele)',
    label: 'Permite descartar 1 das 4 categorias da Quimera (ela deixa de ser exigida no filme!), abrindo mão apenas do XP base e Jackpot dela.',
  },
  {
    id: 'dubbing_star',
    rarity: 'rare',
    runeName: 'Estrela da Dublagem',
    icon: '🎙️',
    effectType: 'dubbing_star',
    bonusXp: 50,
    shortTag: '+50 XP se Filme Dublado',
    label: 'Se você catalogar o filme escolhido com Áudio Dublado, ganha um bônus direto de +50 XP na colheita!',
  },
  {
    id: 'titan_nations',
    rarity: 'rare',
    runeName: 'Passaporte das 5 Potências',
    icon: '🗺️',
    effectType: 'titan_nations',
    bonusXp: 0,
    shortTag: '+EUA/BR/JP/UK/CA + Checkpot Acumulável',
    label: 'Adiciona EUA, Brasil, Japão, Reino Unido e Canadá aos países aceitos e marca 1 deles como País Checkpot que ACUMULA com o País Jackpot original!',
  },
  {
    id: 'millennium_portal',
    rarity: 'rare',
    runeName: 'Portal do Milênio',
    icon: '🚀',
    effectType: 'millennium_portal',
    bonusXp: 0,
    shortTag: 'Libera Qualquer 2000+ + Ano Jackpot',
    label: 'Libera QUALQUER filme lançado a partir de 2000 na categoria Época e sorteia +1 Ano Jackpot aleatório de 2000 em diante!',
  },

  // ===== LENDÁRIAS (PODERES SUPREMOS & CHECKPOTS ACUMULÁVEIS!) =====
  {
    id: 'all_era_jackpot',
    rarity: 'legendary',
    runeName: 'Tempo Absoluto',
    icon: '👑',
    effectType: 'all_era_jackpot',
    bonusXp: 0,
    shortTag: 'Época Inteira = JACKPOT',
    label: 'LENDÁRIA: Converte TODA a categoria Época em Jackpot! Qualquer filme na faixa já ganha o Jackpot de Ano!',
  },
  {
    id: 'all_block_jackpot',
    rarity: 'legendary',
    runeName: 'Soberania Global',
    icon: '👑',
    effectType: 'all_block_jackpot',
    bonusXp: 0,
    shortTag: 'Bloco Inteiro = JACKPOT',
    label: 'LENDÁRIA: Converte TODO o Bloco Regional em Jackpot! Qualquer país do bloco já ganha o Jackpot de País!',
  },
  {
    id: 'all_genre_jackpot',
    rarity: 'legendary',
    runeName: 'Harmonia Suprema',
    icon: '👑',
    effectType: 'all_genre_jackpot',
    bonusXp: 0,
    shortTag: 'Gêneros Inteiros = JACKPOT',
    label: 'LENDÁRIA: Converte Gêneros em Jackpot automático! Ter apenas 1 dos gêneros já paga o Jackpot Duplo!',
  },
  {
    id: 'all_tags_jackpot',
    rarity: 'legendary',
    runeName: 'Selo Dourado',
    icon: '👑',
    effectType: 'all_tags_jackpot',
    bonusXp: 0,
    shortTag: 'Todas Tags = JACKPOT',
    label: 'LENDÁRIA: Transforma TODAS as 5+ Tags em Tags Douradas! Qualquer Tag da receita garante o Jackpot!',
  },
  {
    id: 'crimson_multiplier',
    rarity: 'legendary',
    runeName: 'Coroa Escarlate',
    icon: '🔥',
    effectType: 'crimson_multiplier',
    bonusXp: 20,
    shortTag: '+50% em Todos Jackpots + 20 XP',
    label: 'LENDÁRIA: Aumenta em +50% o XP de TODOS os Jackpots acertados nesta Quimera e soma +20 XP fixos!',
  },
  {
    id: 'echo_supreme',
    rarity: 'legendary',
    runeName: 'Eco Supremo',
    icon: '👁️',
    effectType: 'echo_supreme',
    bonusXp: 0,
    shortTag: '+1 Escolha + Revela Raridades',
    label: 'LENDÁRIA: Concede +1 escolha extra no Altar das Runas E revela a raridade (Comum/Rara/Lendária) das cartas ainda fechadas!',
  },
  {
    id: 'blind_twin_picks',
    rarity: 'legendary',
    runeName: 'Gêmeos do Destino Oculto',
    icon: '🃏',
    effectType: 'blind_twin_picks',
    bonusXp: 0,
    shortTag: '+2 Escolhas às Cegas (3 Runas!)',
    label: 'LENDÁRIA: Permite selecionar MAIS 2 Runas ainda fechadas no Altar — mantendo tudo oculto até você clicar!',
  },
  {
    id: 'omni_second_draw',
    rarity: 'legendary',
    runeName: 'Convergência Quádrupla',
    icon: '🌌',
    effectType: 'omni_second_draw',
    bonusXp: 0,
    shortTag: '2º Sorteio em TODAS Categorias',
    label: 'LENDÁRIA: Executa um 2º sorteio simultâneo em TODAS as 4 categorias: +1 Ano Jackpot, +1 Bloco & País Jackpot, +1 Gênero e +1 Tag Ouro!',
  },
  {
    id: 'tag_supernova',
    rarity: 'legendary',
    runeName: 'Supernova de Tags',
    icon: '☄️',
    effectType: 'tag_supernova',
    bonusXp: 0,
    shortTag: '+10 Tags (2 Ouro Acumuláveis!)',
    label: 'LENDÁRIA: Sorteia +10 novas Tags (15 no total!) e promove 2 delas para Tags Ouro Checkpot — todas as Tags Ouro acertadas ACUMULAM +35 XP cada!',
  },
  {
    id: 'genre_hurricane',
    rarity: 'legendary',
    runeName: 'Furacão de Gêneros',
    icon: '🌀',
    effectType: 'genre_hurricane',
    bonusXp: 0,
    shortTag: '+6 Gêneros (2 Ouro Acumuláveis!)',
    label: 'LENDÁRIA: Sorteia +6 Gêneros extras (8 no total!) e marca 2 deles com Checkpot Ouro — cada Gênero Ouro acertado ACUMULA +25 XP extras!',
  },
];

function resolveD20Difficulty(d20Roll: number): {
  tier: ChimeraD20Difficulty;
  label: string;
  bonusXp: number;
} {
  if (d20Roll <= 4) {
    return { tier: 'nightmare', label: '💀 Provação Pesadelo', bonusXp: 20 };
  }
  if (d20Roll <= 9) {
    return { tier: 'hard', label: '🔥 Desafio Árduo', bonusXp: 10 };
  }
  if (d20Roll <= 15) {
    return { tier: 'balanced', label: '⚔️ Caçada Equilibrada', bonusXp: 0 };
  }
  return { tier: 'blessed', label: '🌟 Bênção do Oráculo', bonusXp: 0 };
}

const CHIMERA_ALTAR_CARDS_COUNT = 5;

function buildFateRuneDeck(params: {
  difficulty: ChimeraD20Difficulty;
  forceLegendary?: boolean;
}): ChimeraFateRune[] {
  const commons = shuffleArr(CHIMERA_RUNE_CATALOG.filter((r) => r.rarity === 'common'));
  const rares = shuffleArr(CHIMERA_RUNE_CATALOG.filter((r) => r.rarity === 'rare'));
  const legendaries = shuffleArr(CHIMERA_RUNE_CATALOG.filter((r) => r.rarity === 'legendary'));

  const picked: ChimeraFateRune[] = [];
  const usedIds = new Set<string>();

  const pickFromRarity = (rarity: ChimeraRuneRarity) => {
    const pool = rarity === 'legendary' ? legendaries : rarity === 'rare' ? rares : commons;
    const candidate = pool.find((r) => !usedIds.has(r.id));
    if (candidate) {
      usedIds.add(candidate.id);
      picked.push({ ...candidate });
      return true;
    }
    return false;
  };

  // Garante diversidade real nas 5 cartas do Altar: pelo menos 1 Comum, 1 Rara e (em Pesadelo/Lab) 1 Lendária
  pickFromRarity('common');
  pickFromRarity('rare');
  if (params.forceLegendary || params.difficulty === 'nightmare') {
    pickFromRarity('legendary');
  }

  const weights: Record<ChimeraD20Difficulty, { legendary: number; rare: number; common: number }> = {
    nightmare: { legendary: 34, rare: 48, common: 18 },
    hard: { legendary: 24, rare: 50, common: 26 },
    balanced: { legendary: 18, rare: 46, common: 36 },
    blessed: { legendary: 22, rare: 48, common: 30 },
  };
  const w = weights[params.difficulty];

  while (picked.length < CHIMERA_ALTAR_CARDS_COUNT) {
    const roll = Math.random() * 100;
    const targetRarity: ChimeraRuneRarity =
      roll < w.legendary ? 'legendary' : roll < w.legendary + w.rare ? 'rare' : 'common';
    if (!pickFromRarity(targetRarity)) {
      pickFromRarity('rare') || pickFromRarity('legendary') || pickFromRarity('common');
    }
  }

  return shuffleArr(picked);
}

const VALID_RITUAL_STYLES = new Set<ChimeraRitualStyle>([
  'd20_rpg',
  'wanted_poster',
  'alchemy_cauldron',
  'rogue_runes',
  'rpg_mashup',
]);

function rollD20ForMode(labD20Mode?: 'auto' | ChimeraD20Difficulty): number {
  if (labD20Mode === 'nightmare') return 1 + Math.floor(Math.random() * 4);
  if (labD20Mode === 'hard') return 5 + Math.floor(Math.random() * 5);
  if (labD20Mode === 'balanced') return 10 + Math.floor(Math.random() * 6);
  if (labD20Mode === 'blessed') return 17 + Math.floor(Math.random() * 4);
  return 1 + Math.floor(Math.random() * 20);
}

function getEraWeightByDifficulty(eraKey: ChimeraEraKey, diff: ChimeraD20Difficulty): number {
  if (diff === 'nightmare') {
    // 1-4: ESTRITAMENTE pré-1970 (zero chance de eras modernas!)
    return eraKey === 'bw_relic' ? 60 : eraKey === 'golden' ? 40 : 0;
  }
  if (diff === 'hard') {
    // 5-9: ESTRITAMENTE Era de Ouro ou VHS pré-1990 (zero Era Moderna 2000+!)
    return eraKey === 'bw_relic' ? 12 : eraKey === 'golden' ? 52 : eraKey === 'vhs_classic' ? 36 : 0;
  }
  if (diff === 'balanced') {
    return eraKey === 'bw_relic' ? 0 : eraKey === 'golden' ? 15 : eraKey === 'vhs_classic' ? 55 : 30;
  }
  if (diff === 'blessed') {
    // 16-20: Era Moderna predominante ou VHS recente
    return eraKey === 'modern' ? 78 : eraKey === 'vhs_classic' ? 22 : 0;
  }
  const base = CHIMERA_ERAS.find((e) => e.key === eraKey);
  return base?.weight || 20;
}

function getBlockWeightByDifficulty(block: CountryBlockDef, diff: ChimeraD20Difficulty, isEarlyEra: boolean): number {
  if (diff === 'nightmare') {
    // 1-4: ESTRITAMENTE blocos exóticos/difíceis (>= 45 XP base)
    return block.baseXp >= 50 ? 35 : block.baseXp >= 45 ? 25 : 0;
  }
  if (diff === 'hard') {
    // 5-9: ESTRITAMENTE blocos médios/difíceis (>= 30 XP base)
    return block.baseXp >= 45 ? 18 : block.baseXp >= 30 ? 30 : 0;
  }
  if (diff === 'balanced') {
    return block.baseXp >= 20 && block.baseXp <= 35 ? 25 : block.baseXp <= 45 ? 8 : 2;
  }
  if (diff === 'blessed') {
    // 16-20: ESTRITAMENTE blocos familiares (<= 25 XP base)
    return block.baseXp <= 25 ? 30 : 0;
  }
  return isEarlyEra ? block.pre1970Weight : block.weight;
}

export async function forgeChimeraContract(
  options: {
    ritualStyle?: ChimeraRitualStyle;
    labD20Mode?: 'auto' | ChimeraD20Difficulty;
    labForceLegendary?: boolean;
  } = {}
): Promise<{
  chimera: ChimeraContract;
  wallet: ChimeraWallet;
}> {
  const ritualStyle: ChimeraRitualStyle =
    options.ritualStyle && VALID_RITUAL_STYLES.has(options.ritualStyle)
      ? options.ritualStyle
      : 'rpg_mashup';
  const wallet = await ensureChimeraWallet();
  if (wallet.chipsRemaining <= 0) {
    throw new Error(
      `Suas fichas de Quimera acabaram (${wallet.cycleAllowance} a cada ${wallet.cycleDays} dias, máx. ${wallet.maxChipsBank})! Nova recarga: ${wallet.nextResetLabel}.`
    );
  }

  const activeCntRes = await query(
    `SELECT COUNT(*)::int AS cnt FROM chimera_contracts WHERE status IN ('active', 'ready_to_claim')`
  );
  const activeCnt = Number(activeCntRes.rows[0]?.cnt || 0);
  if (activeCnt >= MAX_ACTIVE_CHIMERAS) {
    throw new Error(
      `Você já tem ${activeCnt}/${MAX_ACTIVE_CHIMERAS} Quimeras ativas/aguardando colheita! Conclua, decline ou descarte uma antes de forjar outra.`
    );
  }

  const watchedRes = await query(`SELECT tmdb_id, title, original_title FROM movies`);
  const watchedTmdbIds = new Set<number>();
  const watchedTitles = new Set<string>();
  for (const r of watchedRes.rows || []) {
    if (r.tmdb_id) watchedTmdbIds.add(Number(r.tmdb_id));
    if (r.title) watchedTitles.add(normalizeText(r.title));
    if (r.original_title) watchedTitles.add(normalizeText(r.original_title));
  }

  const useBlessedRolls = wallet.nextBlessedRolls > 0 && (!options.labD20Mode || options.labD20Mode === 'auto');
  const rollCategoryD20 = () =>
    useBlessedRolls ? 14 + Math.floor(Math.random() * 7) : rollD20ForMode(options.labD20Mode);

  const rollEra = rollCategoryD20();
  const rollBlock = rollCategoryD20();
  const rollGenre = rollCategoryD20();
  const rollTag = rollCategoryD20();
  const d20Roll = Math.round((rollEra + rollBlock + rollGenre + rollTag) / 4);

  const eraDiff = resolveD20Difficulty(rollEra);
  const blockDiff = resolveD20Difficulty(rollBlock);
  const genreDiff = resolveD20Difficulty(rollGenre);
  const tagDiff = resolveD20Difficulty(rollTag);
  const overallDiff = resolveD20Difficulty(d20Roll);

  const survivalBonusXp =
    (rollEra <= 4 ? 8 : rollEra <= 9 ? 4 : 0) +
    (rollBlock <= 4 ? 8 : rollBlock <= 9 ? 4 : 0) +
    (rollGenre <= 4 ? 4 : 0) +
    (rollTag <= 4 ? 5 : 0);

  const diffMeta = {
    tier: overallDiff.tier,
    label: overallDiff.label,
    bonusXp: survivalBonusXp,
  };
  const isCriticalD20 =
    d20Roll >= 17 || d20Roll <= 4 || [rollEra, rollBlock, rollGenre, rollTag].some((v) => v <= 2 || v === 20);

  let finalRecipe: ChimeraRecipe | null = null;
  const MAX_ROLL_ATTEMPTS = 8;

  for (let attempt = 0; attempt < MAX_ROLL_ATTEMPTS; attempt++) {
    const era = pickWeighted(CHIMERA_ERAS, (e) => getEraWeightByDifficulty(e.key, eraDiff.tier));
    const maxCapForHard = eraDiff.tier === 'hard' && era.key === 'vhs_classic' ? 1986 : era.maxTarget;
    const minCapForBlessed = eraDiff.tier === 'blessed' && era.key === 'vhs_classic' ? 1990 : era.minTarget;
    const targetYear =
      minCapForBlessed + Math.floor(Math.random() * (Math.max(1, maxCapForHard - minCapForBlessed + 1)));
    const { minYear, maxYear } = computeEraWindow(era, targetYear);

    const isEarlyEra = targetYear < 1970;
    const block = pickWeighted(CHIMERA_COUNTRY_BLOCKS, (b) =>
      getBlockWeightByDifficulty(b, blockDiff.tier, isEarlyEra)
    );
    const jackpotCountryItem = block.countries[Math.floor(Math.random() * block.countries.length)];

    const genrePool = shuffleArr(CHIMERA_GENRES);
    const g1 =
      genreDiff.tier === 'nightmare'
        ? genrePool.find((g) => g.cluster === 'dark' || g.cluster === 'drama') || genrePool[0]
        : genrePool[0];
    const g2 = genrePool.find((g) => g.id !== g1.id) || genrePool[1];

    // Crítico positivo (gênero/tag alto >= 17) ou chance de ~22% desperta Regra Especial bônus
    const specialRule =
      rollGenre >= 17 || rollTag >= 17 || Math.random() < 0.22
        ? SPECIAL_RULES[Math.floor(Math.random() * SPECIAL_RULES.length)]
        : null;

    const minVotesNeeded =
      eraDiff.tier === 'nightmare' || blockDiff.tier === 'nightmare' || block.baseXp >= 50 || targetYear < 1955
        ? Math.min(12, era.minVotes)
        : era.minVotes;

    const discoverRes = await fetchDiscoverSuggestionsForCandidate({
      minYear,
      maxYear,
      blockIsoCodes: block.countries.map((c) => c.iso),
      genreIds: [g1.id, g2.id],
      minVotes: minVotesNeeded,
      allowShort: Boolean(specialRule?.allowShort),
      watchedTmdbIds,
      watchedTitles,
    });

    if (discoverRes.totalResults < 4 && discoverRes.suggestions.length < 2 && attempt < MAX_ROLL_ATTEMPTS - 1) {
      continue;
    }

    const tags = await loadAvailableThemeTags(
      g1,
      g2,
      minYear,
      CHIMERA_TAGS_PER_RECIPE,
      new Set(),
      tagDiff.tier
    );
    const jackpotTag = tags[0];

    const baseGenreXp = 15;
    const jackpotGenreXp = 25;
    const baseTagXp = 20;
    const jackpotTagXp = 35;

    const totalBaseXp = era.baseXp + block.baseXp + baseGenreXp + baseTagXp + survivalBonusXp;
    const maxJackpotBonusXp =
      era.jackpotXp +
      block.jackpotXp +
      jackpotGenreXp +
      jackpotTagXp +
      (specialRule?.bonusXp || 0);

    const identity = buildCreatureIdentity({
      g1,
      g2,
      blockLabel: block.label,
      jackpotCountry: jackpotCountryItem.name,
      minYear,
      jackpotTag,
    });

    const lowRollsCount = [rollEra, rollBlock, rollGenre, rollTag].filter((v) => v <= 4).length;
    const fateRunes = buildFateRuneDeck({
      difficulty: overallDiff.tier,
      forceLegendary: Boolean(options.labForceLegendary) || lowRollsCount >= 2,
    });

    finalRecipe = {
      eraKey: era.key,
      eraLabel: era.label,
      targetYear,
      windowSize: era.windowSize,
      minYear,
      maxYear,
      baseYearXp: era.baseXp,
      jackpotYearXp: era.jackpotXp,

      blockKey: block.key,
      blockLabel: block.label,
      blockIcon: block.icon,
      blockCountries: block.countries.map((c) => c.name),
      blockIsoCodes: block.countries.map((c) => c.iso),
      jackpotCountry: jackpotCountryItem.name,
      jackpotCountryIso: jackpotCountryItem.iso,
      baseCountryXp: block.baseXp,
      jackpotCountryXp: block.jackpotXp,

      genres: [g1.name, g2.name],
      genreIds: [g1.id, g2.id],
      baseGenreXp,
      jackpotGenreXp,

      tags,
      jackpotTag,
      baseTagXp,
      jackpotTagXp,

      specialRule,
      totalBaseXp,
      maxJackpotBonusXp,
      tmdbSuggestions: discoverRes.suggestions,

      creatureTitle: identity.creatureTitle,
      creatureSubtitle: identity.creatureSubtitle,
      d20Roll,
      d20Rolls: {
        era: rollEra,
        block: rollBlock,
        genre: rollGenre,
        tag: rollTag,
      },
      isCriticalD20,
      d20Difficulty: diffMeta.tier,
      d20DifficultyLabel: tagDiff.tier === 'nightmare' && overallDiff.tier === 'balanced' ? '🔥 Caçada Tensa' : diffMeta.label,
      difficultyBonusXp: survivalBonusXp,
      ritualStyle,
      fateRunes,
      chosenFateRune: null,
      chosenFateRunes: [],
      runePicksRemaining: 1,
      revealRemainingRarities: false,
      pendingPillarActions: [],
      pendingPillarAction: null,
      transmutedPillars: [],
      sacrificedPillars: [],
      legendaryJackpotPillars: [],
      jackpotMultiplierBonusRate: 0,
      flatRuneBonusXp: 0,
      allowPost2000: false,
      requiresDubbedBonusXp: 0,
    };
    break;
  }

  if (!finalRecipe) {
    throw new Error('Não foi possível forjar uma combinação válida no momento. Tente novamente!');
  }

  const insRes = await query(
    `INSERT INTO chimera_contracts (status, recipe_json)
     VALUES ('active', $1::jsonb)
     RETURNING *`,
    [JSON.stringify(finalRecipe)]
  );

  await query(
    `UPDATE chimera_wallet
     SET chips_remaining = GREATEST(0, chips_remaining - 1),
         chips_used_this_week = chips_used_this_week + 1,
         next_blessed_rolls = CASE
           WHEN $1::boolean THEN GREATEST(0, COALESCE(next_blessed_rolls, 0) - 1)
           ELSE COALESCE(next_blessed_rolls, 0)
         END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`,
    [useBlessedRolls]
  );

  const nextWallet = await ensureChimeraWallet();
  return {
    chimera: mapChimeraRow(insRes.rows[0]),
    wallet: nextWallet,
  };
}

function computeEffectiveBaseXp(recipe: ChimeraRecipe): number {
  const sac = new Set<ChimeraPillarKey>(recipe.sacrificedPillars || []);
  return (
    (sac.has('year') ? 0 : Number(recipe.baseYearXp || 0)) +
    (sac.has('country') ? 0 : Number(recipe.baseCountryXp || 0)) +
    (sac.has('genre') ? 0 : Number(recipe.baseGenreXp || 0)) +
    (sac.has('tag') ? 0 : Number(recipe.baseTagXp || 0)) +
    Number(recipe.difficultyBonusXp || 0)
  );
}

function expandGenreNormEquivalents(normGenre: string): string[] {
  if (normGenre === 'policial' || normGenre === 'crime') return ['policial', 'crime'];
  if (normGenre === 'suspense' || normGenre === 'thriller') return ['suspense', 'thriller'];
  if (normGenre === 'terror' || normGenre === 'horror' || normGenre === 'horor') return ['terror', 'horror'];
  if (normGenre === 'musica' || normGenre === 'musical') return ['musica', 'musical'];
  return [normGenre];
}

function resolveCountryIdentity(rawCountry: string): { normName: string; iso: string | null } {
  const terr = resolveTerritoryDescriptor(rawCountry);
  if (terr) {
    return { normName: normalizeText(terr.name), iso: terr.code.toUpperCase() };
  }
  const n = normalizeText(rawCountry);
  if (n === 'eua' || n === 'usa' || n === 'united states') return { normName: 'estados unidos', iso: 'US' };
  if (n === 'uk' || n === 'reino unido' || n === 'inglaterra') return { normName: 'reino unido', iso: 'GB' };
  return { normName: n, iso: null };
}

export function evaluateMovieAgainstChimera(
  recipe: ChimeraRecipe,
  movie: {
    movieId: number;
    title: string;
    originalTitle?: string | null;
    releaseYear: number | null;
    posterUrl?: string | null;
    runtime?: number | null;
    voteCount?: number;
    audioType?: string | null;
    countries: string[];
    genres: string[];
    tags: string[];
  }
): ChimeraMatchDetails | null {
  const sac = new Set<ChimeraPillarKey>(recipe.sacrificedPillars || []);
  const legPillars = new Set<ChimeraPillarKey>(recipe.legendaryJackpotPillars || []);

  // Regra padrão exige longa (>= 45 min) a menos que o especial "Vale Filme ou Curta!" esteja ativo
  const rt = Number(movie.runtime || 0);
  if (!recipe.specialRule?.allowShort && rt > 0 && rt < 45) {
    return null;
  }

  // 1. Época / Ano
  const relYear = Number(movie.releaseYear || 0);
  let hitJackpotYear = false;
  if (!sac.has('year')) {
    const inEraWindow = relYear >= recipe.minYear && relYear <= recipe.maxYear;
    const inPost2000 = Boolean(recipe.allowPost2000) && relYear >= 2000;
    if (!relYear || (!inEraWindow && !inPost2000)) {
      return null;
    }
    hitJackpotYear =
      relYear === recipe.targetYear ||
      (recipe.extraTargetYears || []).includes(relYear) ||
      legPillars.has('year');
  }

  // 2. País do bloco (+ Passaporte Duplo / 5 Potências / Convergência)
  const matchedCountries: string[] = [];
  let countryJackpotMultiplier = 0;
  if (!sac.has('country')) {
    const blockIsoSet = new Set(
      [...(recipe.blockIsoCodes || []), ...(recipe.extraBlockIsoCodes || [])].map((c) => c.toUpperCase())
    );
    const blockNameSet = new Set(
      [...(recipe.blockCountries || []), ...(recipe.extraBlockCountries || [])].map((c) => normalizeText(c))
    );
    const jackpotCountryTargets = [
      { iso: String(recipe.jackpotCountryIso || '').toUpperCase(), name: normalizeText(recipe.jackpotCountry) },
      ...(recipe.extraJackpotCountries || []).map((ej) => ({
        iso: String(ej.iso || '').toUpperCase(),
        name: normalizeText(ej.name),
      })),
    ];
    const hitJackpotCountryKeys = new Set<string>();

    for (const c of movie.countries || []) {
      const id = resolveCountryIdentity(c);
      const inBlock = (id.iso && blockIsoSet.has(id.iso)) || blockNameSet.has(id.normName);
      if (inBlock) {
        matchedCountries.push(c);
        for (const jt of jackpotCountryTargets) {
          if ((id.iso && jt.iso && id.iso === jt.iso) || id.normName === jt.name) {
            hitJackpotCountryKeys.add(jt.iso || jt.name);
          }
        }
      }
    }
    if (matchedCountries.length === 0) {
      return null;
    }
    countryJackpotMultiplier = recipe.stackableCountryJackpots
      ? Math.max(hitJackpotCountryKeys.size, legPillars.has('country') ? 1 : 0)
      : hitJackpotCountryKeys.size > 0 || legPillars.has('country')
      ? 1
      : 0;
  }
  const hitJackpotCountry = countryJackpotMultiplier > 0;

  // 3. Gêneros (basta 1; >= 2 = Jackpot; Furacão de Gêneros acumula Gêneros Ouro)
  const matchedGenres: string[] = [];
  let genreJackpotMultiplier = 0;
  if (!sac.has('genre')) {
    const movieGenreNorms = new Set<string>();
    for (const g of movie.genres || []) {
      for (const eq of expandGenreNormEquivalents(normalizeText(g))) {
        if (eq) movieGenreNorms.add(eq);
      }
    }
    for (const targetG of recipe.genres || []) {
      const eqs = expandGenreNormEquivalents(normalizeText(targetG));
      if (eqs.some((e) => movieGenreNorms.has(e))) {
        matchedGenres.push(targetG);
      }
    }
    if (matchedGenres.length === 0) {
      return null;
    }

    const baseGenreHit = matchedGenres.length >= 2 || legPillars.has('genre') ? 1 : 0;
    const uniqueGoldGenres = Array.from(new Set(recipe.extraJackpotGenres || []));
    const goldGenresHitCount = uniqueGoldGenres.filter((gg) =>
      expandGenreNormEquivalents(normalizeText(gg)).some((eq) => movieGenreNorms.has(eq))
    ).length;

    genreJackpotMultiplier =
      baseGenreHit + (recipe.stackableGenreJackpots ? goldGenresHitCount : goldGenresHitCount > 0 && baseGenreHit === 0 ? 1 : 0);
  }
  const hitJackpotGenre = genreJackpotMultiplier > 0;

  // 4. Tags pessoais (basta 1; Supernova acumula todas as Tags Ouro acertadas!)
  const matchedTags: string[] = [];
  let tagJackpotMultiplier = 0;
  if (!sac.has('tag')) {
    const movieTagNorms = new Set((movie.tags || []).map((t) => normalizeText(t)).filter(Boolean));
    for (const targetTag of recipe.tags || []) {
      if (movieTagNorms.has(normalizeText(targetTag))) {
        matchedTags.push(targetTag);
      }
    }
    if (matchedTags.length === 0) {
      return null;
    }
    const jackpotTagNormList = Array.from(
      new Set([recipe.jackpotTag, ...(recipe.extraJackpotTags || [])].map((t) => normalizeText(t)).filter(Boolean))
    );
    const goldTagsHitCount = jackpotTagNormList.filter((tNorm) => movieTagNorms.has(tNorm)).length;
    tagJackpotMultiplier = recipe.stackableTagJackpots
      ? Math.max(goldTagsHitCount, legPillars.has('tag') ? 1 : 0)
      : goldTagsHitCount > 0 || legPillars.has('tag')
      ? 1
      : 0;
  }
  const hitJackpotTag = tagJackpotMultiplier > 0;

  const jackpotsHitCount =
    (hitJackpotYear ? 1 : 0) +
    countryJackpotMultiplier +
    genreJackpotMultiplier +
    tagJackpotMultiplier;

  let hitSpecialBonus = false;
  let specialBonusXp = 0;
  if (recipe.specialRule) {
    if (recipe.specialRule.id === 'short_allowed' && rt > 0 && rt < 50) {
      hitSpecialBonus = true;
      specialBonusXp = recipe.specialRule.bonusXp;
    } else if (
      recipe.specialRule.id === 'underdog' &&
      Number(movie.voteCount || 0) > 0 &&
      Number(movie.voteCount || 0) < 5000
    ) {
      hitSpecialBonus = true;
      specialBonusXp = recipe.specialRule.bonusXp;
    } else if (recipe.specialRule.id === 'jackpot_boost' && jackpotsHitCount >= 1) {
      hitSpecialBonus = true;
      specialBonusXp = recipe.specialRule.bonusXp;
    }
  }

  const baseXp = computeEffectiveBaseXp(recipe);
  const jackpotYearXp = hitJackpotYear && !sac.has('year') ? Number(recipe.jackpotYearXp || 0) : 0;
  const jackpotCountryXp = !sac.has('country') ? Number(recipe.jackpotCountryXp || 0) * countryJackpotMultiplier : 0;
  const jackpotGenreXp = !sac.has('genre') ? Number(recipe.jackpotGenreXp || 0) * genreJackpotMultiplier : 0;
  const jackpotTagXp = !sac.has('tag') ? Number(recipe.jackpotTagXp || 0) * tagJackpotMultiplier : 0;

  const jackpotSum = jackpotYearXp + jackpotCountryXp + jackpotGenreXp + jackpotTagXp;
  const multiplierExtraXp =
    recipe.jackpotMultiplierBonusRate && jackpotSum > 0
      ? Math.round(jackpotSum * recipe.jackpotMultiplierBonusRate)
      : 0;

  const hitDubbingBonus =
    Number(recipe.requiresDubbedBonusXp || 0) > 0 &&
    normalizeText(movie.audioType || '').includes('dublad');
  const dubbingBonusXp = hitDubbingBonus ? Number(recipe.requiresDubbedBonusXp || 0) : 0;

  const runeBonusXp = Number(recipe.flatRuneBonusXp || 0) + multiplierExtraXp;

  const totalClaimableXp =
    baseXp +
    jackpotYearXp +
    jackpotCountryXp +
    jackpotGenreXp +
    jackpotTagXp +
    specialBonusXp +
    dubbingBonusXp +
    runeBonusXp;

  return {
    baseYearOk: true,
    baseCountryOk: true,
    baseGenreOk: true,
    baseTagOk: true,
    matchedGenres,
    matchedTags,
    matchedCountries,
    hitJackpotYear,
    hitJackpotCountry,
    hitJackpotGenre,
    hitJackpotTag,
    hitSpecialBonus,
    hitDubbingBonus,
    jackpotsHitCount,
    baseXp,
    jackpotYearXp,
    jackpotCountryXp,
    jackpotGenreXp,
    jackpotTagXp,
    specialBonusXp,
    dubbingBonusXp,
    runeBonusXp,
    totalClaimableXp,
  };
}

export async function checkChimeraMatchOnMovieSave(params: {
  movieId: number;
  title: string;
  originalTitle?: string | null;
  releaseYear: number | null;
  posterUrl?: string | null;
  runtime?: number | null;
  voteCount?: number;
  audioType?: string | null;
  countries: string[];
  genres: string[];
  tags: string[];
}): Promise<ChimeraContract[]> {
  await ensureChimeraTables();
  const activeRes = await query(
    `SELECT * FROM chimera_contracts WHERE status = 'active' ORDER BY created_at ASC, id ASC`
  );
  if (activeRes.rows.length === 0) return [];

  const matchedContracts: ChimeraContract[] = [];
  const snapshot: ChimeraMatchedMovieSnapshot = {
    movieId: params.movieId,
    title: params.title,
    originalTitle: params.originalTitle ?? null,
    releaseYear: params.releaseYear,
    posterUrl: params.posterUrl ?? null,
    runtime: params.runtime ?? null,
    voteCount: Number(params.voteCount || 0),
    audioType: params.audioType ?? null,
    countries: params.countries || [],
    genres: params.genres || [],
    tags: params.tags || [],
  };

  for (const row of activeRes.rows) {
    const contract = mapChimeraRow(row);
    const details = evaluateMovieAgainstChimera(contract.recipe, params);
    if (!details) continue;

    const upd = await query(
      `UPDATE chimera_contracts
       SET status = 'ready_to_claim',
           matched_movie_id = $2,
           matched_movie_json = $3::jsonb,
           match_details_json = $4::jsonb,
           matched_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [contract.id, params.movieId, JSON.stringify(snapshot), JSON.stringify(details)]
    );
    matchedContracts.push(mapChimeraRow(upd.rows[0]));
  }

  return matchedContracts;
}

export async function claimChimeraContract(chimeraId: number): Promise<ChimeraContract> {
  await ensureChimeraTables();
  const res = await query(`SELECT * FROM chimera_contracts WHERE id = $1`, [chimeraId]);
  if (res.rows.length === 0) {
    throw new Error('Quimera não encontrada.');
  }
  const current = mapChimeraRow(res.rows[0]);
  if (current.status !== 'ready_to_claim' || !current.matchDetails) {
    throw new Error('Esta Quimera ainda não está pronta para colheita de XP.');
  }

  const awardXp = Math.max(0, Number(current.matchDetails.totalClaimableXp || current.recipe.totalBaseXp || 50));
  const upd = await query(
    `UPDATE chimera_contracts
     SET status = 'claimed',
         xp_awarded = $2,
         claimed_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [chimeraId, awardXp]
  );
  return mapChimeraRow(upd.rows[0]);
}

const TITAN_NATIONS_LIST: Array<{ name: string; iso: string }> = [
  { name: 'Estados Unidos', iso: 'US' },
  { name: 'Brasil', iso: 'BR' },
  { name: 'Japão', iso: 'JP' },
  { name: 'Reino Unido', iso: 'GB' },
  { name: 'Canadá', iso: 'CA' },
];

function recalculateRecipeXpTotals(recipe: ChimeraRecipe): ChimeraRecipe {
  const sac = new Set<ChimeraPillarKey>(recipe.sacrificedPillars || []);
  const yearJackpotMax = sac.has('year') ? 0 : Number(recipe.jackpotYearXp || 0);
  const countryJackpotCount = sac.has('country')
    ? 0
    : recipe.stackableCountryJackpots
    ? Math.max(1, 1 + (recipe.extraJackpotCountries?.length || 0))
    : 1;
  const countryJackpotMax = Number(recipe.jackpotCountryXp || 0) * countryJackpotCount;

  const genreJackpotCount = sac.has('genre')
    ? 0
    : 1 + (recipe.stackableGenreJackpots ? recipe.extraJackpotGenres?.length || 0 : 0);
  const genreJackpotMax = Number(recipe.jackpotGenreXp || 0) * genreJackpotCount;

  const uniqueGoldTagCount = sac.has('tag')
    ? 0
    : new Set([recipe.jackpotTag, ...(recipe.extraJackpotTags || [])].map((t) => normalizeText(t)).filter(Boolean)).size;
  const tagJackpotCount = sac.has('tag')
    ? 0
    : recipe.stackableTagJackpots
    ? Math.max(1, uniqueGoldTagCount)
    : 1;
  const tagJackpotMax = Number(recipe.jackpotTagXp || 0) * tagJackpotCount;

  const baseJackpotMax = yearJackpotMax + countryJackpotMax + genreJackpotMax + tagJackpotMax;
  const crimsonMax =
    recipe.jackpotMultiplierBonusRate && baseJackpotMax > 0
      ? Math.round(baseJackpotMax * recipe.jackpotMultiplierBonusRate)
      : 0;

  return {
    ...recipe,
    totalBaseXp: computeEffectiveBaseXp(recipe),
    maxJackpotBonusXp:
      baseJackpotMax +
      crimsonMax +
      Number(recipe.specialRule?.bonusXp || 0) +
      Number(recipe.requiresDubbedBonusXp || 0) +
      Number(recipe.flatRuneBonusXp || 0),
  };
}

function applySecondYearMutation(recipe: ChimeraRecipe): void {
  const existing = new Set([recipe.targetYear, ...(recipe.extraTargetYears || [])]);
  const candidates: number[] = [];
  for (let y = recipe.minYear; y <= recipe.maxYear; y++) {
    if (!existing.has(y)) candidates.push(y);
  }
  if (candidates.length > 0) {
    const year2 = candidates[Math.floor(Math.random() * candidates.length)];
    recipe.extraTargetYears = [...(recipe.extraTargetYears || []), year2];
  } else {
    recipe.flatRuneBonusXp = Number(recipe.flatRuneBonusXp || 0) + 15;
  }
}

function applySecondBlockMutation(recipe: ChimeraRecipe): void {
  const otherBlocks = shuffleArr(CHIMERA_COUNTRY_BLOCKS.filter((b) => b.key !== recipe.blockKey));
  const extraBlock = otherBlocks[0];
  if (!extraBlock) return;
  const extraJackpotItem =
    extraBlock.countries[Math.floor(Math.random() * extraBlock.countries.length)];
  const nextLabel = `${extraBlock.icon} ${extraBlock.label}`;
  recipe.extraBlockLabel = recipe.extraBlockLabel ? `${recipe.extraBlockLabel} + ${nextLabel}` : nextLabel;
  recipe.extraBlockCountries = Array.from(
    new Set([...(recipe.extraBlockCountries || []), ...extraBlock.countries.map((c) => c.name)])
  );
  recipe.extraBlockIsoCodes = Array.from(
    new Set([...(recipe.extraBlockIsoCodes || []), ...extraBlock.countries.map((c) => c.iso)])
  );
  recipe.extraJackpotCountries = [...(recipe.extraJackpotCountries || []), extraJackpotItem];
}

function applyExtraGenresMutation(recipe: ChimeraRecipe, count = 1, promoteGoldCount = 0): void {
  const usedSet = new Set(recipe.genres || []);
  const unusedGenres = shuffleArr(CHIMERA_GENRES.filter((g) => !usedSet.has(g.name)));
  const added = unusedGenres.slice(0, count);
  if (added.length === 0) return;
  recipe.genres = [...(recipe.genres || []), ...added.map((g) => g.name)];
  recipe.genreIds = [...(recipe.genreIds || []), ...added.map((g) => g.id)];
  if (promoteGoldCount > 0) {
    const goldOnes = added.slice(0, promoteGoldCount).map((g) => g.name);
    recipe.extraJackpotGenres = Array.from(new Set([...(recipe.extraJackpotGenres || []), ...goldOnes]));
    recipe.stackableGenreJackpots = true;
  }
}

function applyExtraGoldTagMutation(recipe: ChimeraRecipe): void {
  const goldNorms = new Set(
    [recipe.jackpotTag, ...(recipe.extraJackpotTags || [])].map((t) => normalizeText(t))
  );
  const candidates = (recipe.tags || []).filter((t) => !goldNorms.has(normalizeText(t)));
  if (candidates.length > 0) {
    const secondGold = candidates[Math.floor(Math.random() * candidates.length)];
    recipe.extraJackpotTags = [...(recipe.extraJackpotTags || []), secondGold];
  }
}

export async function pickChimeraFateRune(
  chimeraId: number,
  runeId: string
): Promise<ChimeraContract> {
  await ensureChimeraTables();
  const res = await query(`SELECT * FROM chimera_contracts WHERE id = $1`, [chimeraId]);
  if (res.rows.length === 0) {
    throw new Error('Quimera não encontrada.');
  }
  const current = mapChimeraRow(res.rows[0]);
  if (current.status !== 'active') {
    throw new Error('Só é possível selar Runas em uma Quimera ativa.');
  }
  const recipe: ChimeraRecipe = { ...current.recipe };
  const remainingBefore = Number(
    recipe.runePicksRemaining ?? (recipe.chosenFateRune ? 0 : 1)
  );
  if (remainingBefore <= 0) {
    return current;
  }

  const deck = recipe.fateRunes || [];
  const chosen = deck.find((r) => r.id === runeId);
  if (!chosen) {
    throw new Error('Runa escolhida não encontrada nesta receita.');
  }
  if (chosen.chosen) {
    throw new Error('Esta Runa já foi selada neste Altar.');
  }

  const sealedRune: ChimeraFateRune = { ...chosen, chosen: true };
  const nextRunes = deck.map((r) => (r.id === runeId ? { ...r, chosen: true } : r));
  const prevChosenList = Array.isArray(recipe.chosenFateRunes)
    ? recipe.chosenFateRunes
    : recipe.chosenFateRune
    ? [recipe.chosenFateRune]
    : [];

  let nextPicksRemaining = remainingBefore - 1;
  let revealRemainingRarities = Boolean(recipe.revealRemainingRarities);
  const nextPendingActions = [...(recipe.pendingPillarActions || [])];

  const updatedRecipe: ChimeraRecipe = {
    ...recipe,
    fateRunes: nextRunes,
    chosenFateRune: sealedRune,
    chosenFateRunes: [...prevChosenList, sealedRune],
    revealRemainingRarities,
  };

  let grantForgeChips = 0;
  let grantDeclineChips = 0;
  let grantBlessedRolls = 0;

  // Aplica o efeito real de cada Runa (Comum, Rara ou Lendária) diretamente na receita/carteira!
  switch (chosen.effectType) {
    case 'oracle_xp': {
      updatedRecipe.flatRuneBonusXp = Number(recipe.flatRuneBonusXp || 0) + chosen.bonusXp;
      break;
    }

    case 'bravery_xp': {
      const rolls = recipe.d20Rolls
        ? [recipe.d20Rolls.era, recipe.d20Rolls.block, recipe.d20Rolls.genre, recipe.d20Rolls.tag]
        : [Number(recipe.d20Roll || 12)];
      const bonus = rolls.some((v) => Number(v) <= 9) ? 25 : 10;
      updatedRecipe.flatRuneBonusXp = Number(recipe.flatRuneBonusXp || 0) + bonus;
      break;
    }

    case 'extra_two_tags': {
      const g1Obj = CHIMERA_GENRES.find((g) => g.name === recipe.genres[0]) || CHIMERA_GENRES[0];
      const g2Obj = CHIMERA_GENRES.find((g) => g.name === recipe.genres[1]) || CHIMERA_GENRES[1];
      const excl = new Set((recipe.tags || []).map((t) => normalizeText(t)));
      const bonusTags = await loadAvailableThemeTags(g1Obj, g2Obj, recipe.minYear, 2, excl);
      updatedRecipe.tags = [...(recipe.tags || []), ...bonusTags];
      break;
    }

    case 'time_lens': {
      const currentYear = new Date().getFullYear();
      updatedRecipe.minYear = Math.max(1920, recipe.minYear - 3);
      updatedRecipe.maxYear = Math.min(currentYear, recipe.maxYear + 3);
      updatedRecipe.windowSize = updatedRecipe.maxYear - updatedRecipe.minYear + 1;
      break;
    }

    case 'metronome_short': {
      if (!updatedRecipe.specialRule) {
        updatedRecipe.specialRule = {
          id: 'short_allowed',
          icon: '🎞️',
          label: 'Runa: Vale Curta (<50m)!',
          hint: 'Permite curta-metragem e concede +20 XP bônus se assistir um curta.',
          bonusXp: 20,
          allowShort: true,
        };
      } else {
        updatedRecipe.specialRule = {
          ...updatedRecipe.specialRule,
          bonusXp: updatedRecipe.specialRule.bonusXp + 15,
          label: `${updatedRecipe.specialRule.label} (+15 XP)`,
        };
      }
      break;
    }

    case 'double_passport': {
      applySecondBlockMutation(updatedRecipe);
      break;
    }

    case 'double_mask': {
      applyExtraGenresMutation(updatedRecipe, 1, 0);
      break;
    }

    case 'twin_years': {
      applySecondYearMutation(updatedRecipe);
      break;
    }

    case 'twin_gold_tags': {
      applyExtraGoldTagMutation(updatedRecipe);
      break;
    }

    case 'extra_forge_chip': {
      grantForgeChips += 1;
      updatedRecipe.flatRuneBonusXp = Number(recipe.flatRuneBonusXp || 0) + 10;
      break;
    }

    case 'blessed_dice_next': {
      grantBlessedRolls += 1;
      updatedRecipe.flatRuneBonusXp = Number(recipe.flatRuneBonusXp || 0) + 10;
      break;
    }

    case 'escapist_decline': {
      grantDeclineChips += 1;
      updatedRecipe.flatRuneBonusXp = Number(recipe.flatRuneBonusXp || 0) + 10;
      break;
    }

    case 'transmute_pillar': {
      nextPendingActions.push('transmute');
      break;
    }

    case 'sacrifice_category': {
      nextPendingActions.push('sacrifice');
      break;
    }

    case 'dubbing_star': {
      updatedRecipe.requiresDubbedBonusXp = Number(recipe.requiresDubbedBonusXp || 0) + 50;
      break;
    }

    case 'titan_nations': {
      updatedRecipe.extraBlockCountries = Array.from(
        new Set([...(recipe.extraBlockCountries || []), ...TITAN_NATIONS_LIST.map((t) => t.name)])
      );
      updatedRecipe.extraBlockIsoCodes = Array.from(
        new Set([...(recipe.extraBlockIsoCodes || []), ...TITAN_NATIONS_LIST.map((t) => t.iso)])
      );
      const nextLabel = '🗺️ 5 Potências (EUA/BR/JP/UK/CA)';
      updatedRecipe.extraBlockLabel = updatedRecipe.extraBlockLabel
        ? `${updatedRecipe.extraBlockLabel} + ${nextLabel}`
        : nextLabel;
      const primaryIso = String(recipe.jackpotCountryIso || '').toUpperCase();
      const extraCandidates = TITAN_NATIONS_LIST.filter((t) => t.iso !== primaryIso);
      const jackpotTitan = (extraCandidates.length > 0 ? extraCandidates : TITAN_NATIONS_LIST)[
        Math.floor(Math.random() * (extraCandidates.length > 0 ? extraCandidates.length : TITAN_NATIONS_LIST.length))
      ];
      updatedRecipe.extraJackpotCountries = [...(recipe.extraJackpotCountries || []), jackpotTitan];
      updatedRecipe.stackableCountryJackpots = true;
      break;
    }

    case 'millennium_portal': {
      const currentYear = new Date().getFullYear();
      const post2000Year = 2000 + Math.floor(Math.random() * Math.max(1, currentYear - 2000 + 1));
      updatedRecipe.allowPost2000 = true;
      if (
        post2000Year !== recipe.targetYear &&
        !(updatedRecipe.extraTargetYears || []).includes(post2000Year)
      ) {
        updatedRecipe.extraTargetYears = [...(updatedRecipe.extraTargetYears || []), post2000Year];
      }
      break;
    }

    case 'all_era_jackpot': {
      updatedRecipe.legendaryJackpotPillars = [
        ...(recipe.legendaryJackpotPillars || []),
        'year',
      ];
      break;
    }

    case 'all_block_jackpot': {
      updatedRecipe.legendaryJackpotPillars = [
        ...(recipe.legendaryJackpotPillars || []),
        'country',
      ];
      break;
    }

    case 'all_genre_jackpot': {
      updatedRecipe.legendaryJackpotPillars = [
        ...(recipe.legendaryJackpotPillars || []),
        'genre',
      ];
      break;
    }

    case 'all_tags_jackpot': {
      updatedRecipe.legendaryJackpotPillars = [
        ...(recipe.legendaryJackpotPillars || []),
        'tag',
      ];
      break;
    }

    case 'crimson_multiplier': {
      updatedRecipe.jackpotMultiplierBonusRate = Number(recipe.jackpotMultiplierBonusRate || 0) + 0.5;
      updatedRecipe.flatRuneBonusXp = Number(recipe.flatRuneBonusXp || 0) + 20;
      break;
    }

    case 'echo_supreme': {
      revealRemainingRarities = true;
      nextPicksRemaining += 1;
      break;
    }

    case 'blind_twin_picks': {
      nextPicksRemaining += 2;
      break;
    }

    case 'omni_second_draw': {
      applySecondYearMutation(updatedRecipe);
      applySecondBlockMutation(updatedRecipe);
      applyExtraGenresMutation(updatedRecipe, 1, 0);
      applyExtraGoldTagMutation(updatedRecipe);
      break;
    }

    case 'tag_supernova': {
      const g1Obj = CHIMERA_GENRES.find((g) => g.name === recipe.genres[0]) || CHIMERA_GENRES[0];
      const g2Obj = CHIMERA_GENRES.find((g) => g.name === recipe.genres[1]) || CHIMERA_GENRES[1];
      const excl = new Set((recipe.tags || []).map((t) => normalizeText(t)));
      const newTags = await loadAvailableThemeTags(g1Obj, g2Obj, recipe.minYear, 10, excl, 'balanced');
      updatedRecipe.tags = [...(recipe.tags || []), ...newTags];
      const promotedGold = newTags.slice(0, 2);
      updatedRecipe.extraJackpotTags = Array.from(
        new Set([...(recipe.extraJackpotTags || []), ...promotedGold])
      );
      updatedRecipe.stackableTagJackpots = true;
      break;
    }

    case 'genre_hurricane': {
      applyExtraGenresMutation(updatedRecipe, 6, 2);
      break;
    }
  }

  const unpickedRemainingCount = nextRunes.filter((r) => !r.chosen).length;
  updatedRecipe.runePicksRemaining = Math.max(0, Math.min(unpickedRemainingCount, nextPicksRemaining));
  updatedRecipe.revealRemainingRarities = revealRemainingRarities;
  updatedRecipe.pendingPillarActions = nextPendingActions;
  updatedRecipe.pendingPillarAction = nextPendingActions[0] || null;

  const finalizedRecipe = recalculateRecipeXpTotals(updatedRecipe);

  if (grantForgeChips > 0 || grantDeclineChips > 0 || grantBlessedRolls > 0) {
    await ensureChimeraWallet();
    await query(
      `UPDATE chimera_wallet
       SET chips_remaining = chips_remaining + $1,
           decline_chips_remaining = COALESCE(decline_chips_remaining, 0) + $2,
           next_blessed_rolls = COALESCE(next_blessed_rolls, 0) + $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`,
      [grantForgeChips, grantDeclineChips, grantBlessedRolls]
    );
  }

  const upd = await query(
    `UPDATE chimera_contracts
     SET recipe_json = $2::jsonb
     WHERE id = $1
     RETURNING *`,
    [chimeraId, JSON.stringify(finalizedRecipe)]
  );
  return mapChimeraRow(upd.rows[0]);
}

export async function applyChimeraPillarAction(
  chimeraId: number,
  pillar: ChimeraPillarKey,
  actionType: 'transmute' | 'sacrifice'
): Promise<ChimeraContract> {
  await ensureChimeraTables();
  const res = await query(`SELECT * FROM chimera_contracts WHERE id = $1`, [chimeraId]);
  if (res.rows.length === 0) {
    throw new Error('Quimera não encontrada.');
  }
  const current = mapChimeraRow(res.rows[0]);
  if (current.status !== 'active') {
    throw new Error('Apenas Quimeras ativas podem receber poderes de categoria.');
  }

  const recipe: ChimeraRecipe = { ...current.recipe };
  const pendingList = Array.isArray(recipe.pendingPillarActions)
    ? [...recipe.pendingPillarActions]
    : recipe.pendingPillarAction
    ? [recipe.pendingPillarAction]
    : [];
  const actionIdx = pendingList.indexOf(actionType);
  if (actionIdx === -1) {
    throw new Error('Você não possui esta ação de categoria pendente nesta Quimera.');
  }

  const sacrificed = new Set<ChimeraPillarKey>(recipe.sacrificedPillars || []);
  if (sacrificed.has(pillar)) {
    throw new Error('Esta categoria já foi sacrificada nesta Quimera.');
  }

  const updated: ChimeraRecipe = { ...recipe };

  if (actionType === 'sacrifice') {
    sacrificed.add(pillar);
    updated.sacrificedPillars = Array.from(sacrificed);
    if (pillar === 'year') {
      updated.baseYearXp = 0;
      updated.jackpotYearXp = 0;
    } else if (pillar === 'country') {
      updated.baseCountryXp = 0;
      updated.jackpotCountryXp = 0;
    } else if (pillar === 'genre') {
      updated.baseGenreXp = 0;
      updated.jackpotGenreXp = 0;
    } else if (pillar === 'tag') {
      updated.baseTagXp = 0;
      updated.jackpotTagXp = 0;
    }
  } else {
    // Alquimia / Transmutação: rerrola a categoria escolhida garantindo D20 entre 10 e 20
    const newRoll = 10 + Math.floor(Math.random() * 11);
    const diff = resolveD20Difficulty(newRoll);
    updated.d20Rolls = {
      era: recipe.d20Rolls?.era ?? recipe.d20Roll ?? 12,
      block: recipe.d20Rolls?.block ?? recipe.d20Roll ?? 12,
      genre: recipe.d20Rolls?.genre ?? recipe.d20Roll ?? 12,
      tag: recipe.d20Rolls?.tag ?? recipe.d20Roll ?? 12,
    };

    if (pillar === 'year') {
      const era = pickWeighted(CHIMERA_ERAS, (e) => getEraWeightByDifficulty(e.key, diff.tier));
      const targetYear =
        era.minTarget + Math.floor(Math.random() * Math.max(1, era.maxTarget - era.minTarget + 1));
      const { minYear, maxYear } = computeEraWindow(era, targetYear);
      updated.eraKey = era.key;
      updated.eraLabel = era.label;
      updated.targetYear = targetYear;
      updated.windowSize = era.windowSize;
      updated.minYear = minYear;
      updated.maxYear = maxYear;
      updated.baseYearXp = era.baseXp;
      updated.jackpotYearXp = era.jackpotXp;
      updated.extraTargetYears = [];
      updated.d20Rolls.era = newRoll;
    } else if (pillar === 'country') {
      const isEarlyEra = recipe.targetYear < 1970;
      const pool = CHIMERA_COUNTRY_BLOCKS.filter((b) => b.key !== recipe.blockKey);
      const block = pickWeighted(pool.length > 0 ? pool : CHIMERA_COUNTRY_BLOCKS, (b) =>
        getBlockWeightByDifficulty(b, diff.tier, isEarlyEra)
      );
      const jackpotCountryItem = block.countries[Math.floor(Math.random() * block.countries.length)];
      updated.blockKey = block.key;
      updated.blockLabel = block.label;
      updated.blockIcon = block.icon;
      updated.blockCountries = block.countries.map((c) => c.name);
      updated.blockIsoCodes = block.countries.map((c) => c.iso);
      updated.jackpotCountry = jackpotCountryItem.name;
      updated.jackpotCountryIso = jackpotCountryItem.iso;
      updated.baseCountryXp = block.baseXp;
      updated.jackpotCountryXp = block.jackpotXp;
      updated.d20Rolls.block = newRoll;
    } else if (pillar === 'genre') {
      const oldSet = new Set(recipe.genres.slice(0, 2));
      const freshPool = shuffleArr(CHIMERA_GENRES.filter((g) => !oldSet.has(g.name)));
      const fallbackPool = freshPool.length >= 2 ? freshPool : shuffleArr(CHIMERA_GENRES);
      const g1 = fallbackPool[0];
      const g2 = fallbackPool[1];
      const preservedExtras = recipe.genres.slice(2).filter((gName) => gName !== g1.name && gName !== g2.name);
      const preservedIds = CHIMERA_GENRES.filter((g) => preservedExtras.includes(g.name)).map((g) => g.id);
      updated.genres = [g1.name, g2.name, ...preservedExtras];
      updated.genreIds = [g1.id, g2.id, ...preservedIds];
      updated.d20Rolls.genre = newRoll;
    } else if (pillar === 'tag') {
      const g1Obj = CHIMERA_GENRES.find((g) => g.name === recipe.genres[0]) || CHIMERA_GENRES[0];
      const g2Obj = CHIMERA_GENRES.find((g) => g.name === recipe.genres[1]) || CHIMERA_GENRES[1];
      const excl = new Set((recipe.tags || []).map((t) => normalizeText(t)));
      let freshTags = await loadAvailableThemeTags(g1Obj, g2Obj, recipe.minYear, CHIMERA_TAGS_PER_RECIPE, excl, diff.tier);
      if (freshTags.length < CHIMERA_TAGS_PER_RECIPE) {
        freshTags = await loadAvailableThemeTags(g1Obj, g2Obj, recipe.minYear, CHIMERA_TAGS_PER_RECIPE, new Set(), diff.tier);
      }
      const preservedExtras = (recipe.tags || [])
        .slice(CHIMERA_TAGS_PER_RECIPE)
        .filter((t) => !freshTags.some((ft) => normalizeText(ft) === normalizeText(t)));
      updated.tags = [...freshTags, ...preservedExtras];
      updated.jackpotTag = freshTags[0];
      updated.d20Rolls.tag = newRoll;
    }

    updated.transmutedPillars = [...(recipe.transmutedPillars || []), pillar];
    const r = updated.d20Rolls;
    updated.d20Roll = Math.round((r.era + r.block + r.genre + r.tag) / 4);
  }

  pendingList.splice(actionIdx, 1);
  updated.pendingPillarActions = pendingList;
  updated.pendingPillarAction = pendingList[0] || null;
  const finalized = recalculateRecipeXpTotals(updated);

  const upd = await query(
    `UPDATE chimera_contracts
     SET recipe_json = $2::jsonb
     WHERE id = $1
     RETURNING *`,
    [chimeraId, JSON.stringify(finalized)]
  );
  return mapChimeraRow(upd.rows[0]);
}

export async function declineChimeraContract(chimeraId: number): Promise<ChimeraWallet> {
  const wallet = await ensureChimeraWallet();
  if (wallet.declineChipsRemaining <= 0) {
    throw new Error(
      `Seus Declínios de Quimera acabaram (${wallet.declineCycleAllowance} a cada ${wallet.cycleDays} dias, máx. ${wallet.maxDeclineBank})! Nova recarga: ${wallet.nextResetLabel}. Você ainda pode usar "Descartar" sem estorno.`
    );
  }
  const res = await query(`SELECT status FROM chimera_contracts WHERE id = $1`, [chimeraId]);
  if (res.rows.length === 0) {
    throw new Error('Quimera não encontrada.');
  }
  const st = String(res.rows[0].status);
  if (st !== 'active' && st !== 'ready_to_claim') {
    throw new Error('Apenas Quimeras ativas podem ser declinadas.');
  }

  await query(`UPDATE chimera_contracts SET status = 'discarded' WHERE id = $1`, [chimeraId]);
  await query(
    `UPDATE chimera_wallet
     SET decline_chips_remaining = GREATEST(0, COALESCE(decline_chips_remaining, 1) - 1),
         chips_remaining = chips_remaining + 1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`
  );
  return ensureChimeraWallet();
}

export async function discardChimeraContract(chimeraId: number): Promise<void> {
  await ensureChimeraTables();
  const res = await query(`SELECT status FROM chimera_contracts WHERE id = $1`, [chimeraId]);
  if (res.rows.length === 0) {
    throw new Error('Quimera não encontrada.');
  }
  const st = String(res.rows[0].status);
  if (st !== 'active' && st !== 'ready_to_claim') {
    throw new Error('Apenas Quimeras ativas podem ser descartadas.');
  }
  await query(`UPDATE chimera_contracts SET status = 'discarded' WHERE id = $1`, [chimeraId]);
}

export async function labAddChimeraChip(
  amount = 1,
  chipType: 'forge' | 'decline' = 'forge'
): Promise<ChimeraWallet> {
  await ensureChimeraWallet();
  const add = Math.max(1, Math.min(10, Math.floor(Number(amount) || 1)));
  if (chipType === 'decline') {
    await query(
      `UPDATE chimera_wallet
       SET decline_chips_remaining = COALESCE(decline_chips_remaining, 0) + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`,
      [add]
    );
  } else {
    await query(
      `UPDATE chimera_wallet
       SET chips_remaining = chips_remaining + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`,
      [add]
    );
  }
  return ensureChimeraWallet();
}

export async function labSimulateMatchChimera(
  chimeraId: number,
  jackpotMode: 'normal' | 'full_jackpot' = 'normal'
): Promise<ChimeraContract> {
  await ensureChimeraTables();
  const res = await query(`SELECT * FROM chimera_contracts WHERE id = $1`, [chimeraId]);
  if (res.rows.length === 0) {
    throw new Error('Quimera não encontrada.');
  }
  const current = mapChimeraRow(res.rows[0]);
  if (current.status !== 'active') {
    throw new Error('Selecione uma Quimera ativa para simular a captura.');
  }

  const r = current.recipe;
  const firstSug = r.tmdbSuggestions?.[0];
  const isFull = jackpotMode === 'full_jackpot';

  const simCountries = isFull
    ? Array.from(
        new Set([r.jackpotCountry, ...(r.extraJackpotCountries || []).map((c) => c.name)].filter(Boolean))
      )
    : [r.blockCountries[0] || r.jackpotCountry];

  const simGenres = isFull
    ? Array.from(new Set([...(r.genres || []).slice(0, 2), ...(r.extraJackpotGenres || [])].filter(Boolean)))
    : [r.genres[0]];

  const simTags = isFull
    ? Array.from(
        new Set(
          [
            r.jackpotTag,
            ...(r.extraJackpotTags || []),
            r.tags.find((t) => t !== r.jackpotTag) || r.tags[0],
          ].filter(Boolean)
        )
      )
    : [r.tags.find((t) => normalizeText(t) !== normalizeText(r.jackpotTag)) || r.tags[0]];

  const simulatedMovie: ChimeraMatchedMovieSnapshot = {
    movieId: 0,
    title: firstSug?.title || `Filme Simulado • ${r.jackpotCountry}`,
    originalTitle: firstSug?.originalTitle || null,
    releaseYear: isFull ? r.targetYear : (firstSug?.releaseYear ?? r.targetYear),
    posterUrl: firstSug?.posterUrl || null,
    runtime: r.specialRule?.id === 'short_allowed' && isFull ? 28 : 108,
    voteCount: isFull ? 1800 : (firstSug?.voteCount || 4200),
    audioType: isFull ? 'Dublado' : 'Legendado',
    countries: simCountries,
    genres: simGenres,
    tags: simTags,
  };

  const details = evaluateMovieAgainstChimera(r, {
    ...simulatedMovie,
    movieId: 0,
  });

  if (!details) {
    throw new Error('Não foi possível montar uma simulação consistente para esta receita.');
  }

  const upd = await query(
    `UPDATE chimera_contracts
     SET status = 'ready_to_claim',
         matched_movie_id = NULL,
         matched_movie_json = $2::jsonb,
         match_details_json = $3::jsonb,
         matched_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [chimeraId, JSON.stringify(simulatedMovie), JSON.stringify(details)]
  );
  return mapChimeraRow(upd.rows[0]);
}

export async function labResetChimeras(): Promise<void> {
  await ensureChimeraTables();
  await query(`DELETE FROM chimera_contracts`);
  const { cycleKey } = getSaoPaulo15DayCycleInfo();
  await query(
    `INSERT INTO chimera_wallet (
       id, week_key, weekly_allowance, chips_remaining, chips_used_this_week,
       decline_chips_remaining, next_blessed_rolls, updated_at
     )
     VALUES (1, $1, $2, $2, 0, $3, 0, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE SET
       week_key = EXCLUDED.week_key,
       weekly_allowance = EXCLUDED.weekly_allowance,
       chips_remaining = EXCLUDED.chips_remaining,
       chips_used_this_week = 0,
       decline_chips_remaining = EXCLUDED.decline_chips_remaining,
       next_blessed_rolls = 0,
       updated_at = CURRENT_TIMESTAMP`,
    [cycleKey, WEEKLY_CHIMERA_CHIPS_LIMIT, CHIMERA_DECLINE_CHIPS_LIMIT]
  );
}

function roundStatTenths(v: number): number {
  return Math.round(v * 10) / 10;
}

/** Calcula pontos de atributos RPG (AGI/INT/DES/CAR) ganhos por uma Quimera colhida. */
export function computeChimeraContractStatPoints(
  recipe: Partial<ChimeraRecipe> | null | undefined,
  details: Partial<ChimeraMatchDetails> | null | undefined
): ChimeraStatPoints {
  const sac = new Set<ChimeraPillarKey>(recipe?.sacrificedPillars || []);

  const scoreMultiPillar = (
    pillar: ChimeraPillarKey,
    okFlag: boolean | undefined,
    matchedArr: unknown,
    unitXp: number,
    awardedXp: number,
    hitFlag: boolean | undefined
  ): number => {
    if (sac.has(pillar) || okFlag === false) return 0;
    const baseCount = Math.max(1, Array.isArray(matchedArr) ? matchedArr.length : 1);
    const jpHits =
      unitXp > 0 && awardedXp > 0 ? Math.max(1, Math.round(awardedXp / unitXp)) : hitFlag ? 1 : 0;
    return roundStatTenths(baseCount * 0.1 + jpHits * 0.5);
  };

  let INT = 0;
  if (!sac.has('year') && details?.baseYearOk !== false) {
    const yearJackpotHits =
      details?.hitJackpotYear || Number(details?.jackpotYearXp || 0) > 0 ? 1 : 0;
    INT = roundStatTenths(0.1 + yearJackpotHits * 0.5);
  }

  const DES = scoreMultiPillar(
    'country',
    details?.baseCountryOk,
    details?.matchedCountries,
    Number(recipe?.jackpotCountryXp || 0),
    Number(details?.jackpotCountryXp || 0),
    details?.hitJackpotCountry
  );

  const AGI = scoreMultiPillar(
    'genre',
    details?.baseGenreOk,
    details?.matchedGenres,
    Number(recipe?.jackpotGenreXp || 0),
    Number(details?.jackpotGenreXp || 0),
    details?.hitJackpotGenre
  );

  const CAR = scoreMultiPillar(
    'tag',
    details?.baseTagOk,
    details?.matchedTags,
    Number(recipe?.jackpotTagXp || 0),
    Number(details?.jackpotTagXp || 0),
    details?.hitJackpotTag
  );

  return {
    AGI,
    INT,
    DES,
    CAR,
    total: roundStatTenths(AGI + INT + DES + CAR),
  };
}

export async function getQuickChimeraXpSummary(): Promise<ChimeraXpSummary> {
  try {
    await ensureChimeraTables();
    const res = await query(
      `SELECT id, xp_awarded, recipe_json, matched_movie_json, match_details_json, claimed_at
       FROM chimera_contracts
       WHERE status = 'claimed' AND xp_awarded > 0
       ORDER BY claimed_at ASC, id ASC`
    );

    const claimedMap: ChimeraXpSummary['claimedMap'] = {};
    let totalXp = 0;
    let totalJackpotsHit = 0;
    let agiTotal = 0;
    let intTotal = 0;
    let desTotal = 0;
    let carTotal = 0;

    for (const r of res.rows || []) {
      const xp = Math.max(0, Number(r.xp_awarded || 0));
      const jackpotsHitCount = Math.max(0, Number(r.match_details_json?.jackpotsHitCount || 0));
      const movieTitle = String(r.matched_movie_json?.title || `Quimera #${r.id}`);
      const pts = computeChimeraContractStatPoints(r.recipe_json, r.match_details_json);

      totalXp += xp;
      totalJackpotsHit += jackpotsHitCount;
      agiTotal += pts.AGI;
      intTotal += pts.INT;
      desTotal += pts.DES;
      carTotal += pts.CAR;

      claimedMap[`chimera_${r.id}`] = {
        chimeraId: Number(r.id),
        movieTitle,
        xp,
        jackpotsHitCount,
        statPoints: pts,
        claimedAt: r.claimed_at ? new Date(r.claimed_at).toISOString() : null,
      };
    }

    const AGI = roundStatTenths(agiTotal);
    const INT = roundStatTenths(intTotal);
    const DES = roundStatTenths(desTotal);
    const CAR = roundStatTenths(carTotal);

    return {
      claimedCount: (res.rows || []).length,
      totalXp,
      totalJackpotsHit,
      statPoints: {
        AGI,
        INT,
        DES,
        CAR,
        total: roundStatTenths(AGI + INT + DES + CAR),
      },
      claimedMap,
    };
  } catch {
    return EMPTY_CHIMERA_XP_SUMMARY;
  }
}

export async function getChimeraStatus(): Promise<{
  wallet: ChimeraWallet;
  activeLimit: number;
  readyToClaimCount: number;
  activeChimeras: ChimeraContract[];
  readyChimeras: ChimeraContract[];
  claimedHistory: ChimeraContract[];
  xpSummary: ChimeraXpSummary;
  runeCatalog: ChimeraFateRune[];
  classPowerOptions: {
    countries: Array<{ iso: string; name: string; blockLabel: string }>;
    genres: string[];
    tags: string[];
  };
}> {
  await ensureChimeraTables();
  const [wallet, rowsRes, xpSummary] = await Promise.all([
    ensureChimeraWallet(),
    query(
      `SELECT * FROM chimera_contracts
       WHERE status IN ('ready_to_claim', 'active', 'claimed')
       ORDER BY CASE status WHEN 'ready_to_claim' THEN 0 WHEN 'active' THEN 1 ELSE 2 END,
                COALESCE(claimed_at, matched_at, created_at) DESC,
                id DESC
       LIMIT 60`
    ),
    getQuickChimeraXpSummary(),
  ]);

  const mapped = (rowsRes.rows || []).map(mapChimeraRow);
  const readyChimeras = mapped.filter((c) => c.status === 'ready_to_claim');
  const activeChimeras = mapped.filter((c) => c.status === 'active');
  const claimedHistory = mapped.filter((c) => c.status === 'claimed');

  const countries = CHIMERA_COUNTRY_BLOCKS.flatMap((blk) =>
    blk.countries.map((c) => ({ iso: c.iso, name: c.name, blockLabel: blk.label }))
  );

  return {
    wallet,
    activeLimit: MAX_ACTIVE_CHIMERAS,
    readyToClaimCount: readyChimeras.length,
    activeChimeras,
    readyChimeras,
    claimedHistory,
    xpSummary,
    runeCatalog: CHIMERA_RUNE_CATALOG,
    classPowerOptions: {
      countries,
      genres: CHIMERA_GENRES.map((g) => g.name),
      tags: CURATED_CHIMERA_TAGS.map((t) => t.name),
    },
  };
}

function mapChimeraRow(r: any): ChimeraContract {
  return {
    id: Number(r.id),
    status: r.status,
    recipe: r.recipe_json,
    matchedMovieId: r.matched_movie_id != null ? Number(r.matched_movie_id) : null,
    matchedMovie: r.matched_movie_json || null,
    matchDetails: r.match_details_json || null,
    xpAwarded: Number(r.xp_awarded || 0),
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    matchedAt: r.matched_at ? new Date(r.matched_at).toISOString() : null,
    claimedAt: r.claimed_at ? new Date(r.claimed_at).toISOString() : null,
  };
}

async function appendExtraTagsToRecipe(recipe: ChimeraRecipe, count: number): Promise<string[]> {
  const g1Obj = CHIMERA_GENRES.find((g) => g.name === recipe.genres?.[0]) || CHIMERA_GENRES[0];
  const g2Obj = CHIMERA_GENRES.find((g) => g.name === recipe.genres?.[1]) || CHIMERA_GENRES[1];
  const excl = new Set((recipe.tags || []).map((t) => normalizeText(t)));
  const added = await loadAvailableThemeTags(g1Obj, g2Obj, recipe.minYear, count, excl, 'balanced');
  recipe.tags = Array.from(new Set([...(recipe.tags || []), ...added]));
  return added;
}

export async function activateChimeraClassPower(params: {
  classId: string;
  chimeraId?: number;
  choiceValue?: string;
}): Promise<{
  message: string;
  chimera: ChimeraContract;
  classWallet: ClassPowerWalletStatus;
  data: Awaited<ReturnType<typeof getChimeraStatus>>;
}> {
  await ensureChimeraTables();
  await assertClassPowerChargeAvailable('chimera');

  const classId = String(params.classId || '').trim();
  const choiceValue = params.choiceValue ? String(params.choiceValue).trim() : '';

  const targetRes = params.chimeraId
    ? await query(`SELECT * FROM chimera_contracts WHERE id = $1`, [Number(params.chimeraId)])
    : await query(`SELECT * FROM chimera_contracts WHERE status = 'active' ORDER BY id DESC LIMIT 1`);

  if (targetRes.rows.length === 0) {
    throw new Error('Forje ou tenha pelo menos 1 Quimera ativa para ativar o poder da classe!');
  }
  const current = mapChimeraRow(targetRes.rows[0]);
  if (current.status !== 'active') {
    throw new Error('Apenas Quimeras ativas podem receber poderes de classe!');
  }

  const recipe: ChimeraRecipe = { ...current.recipe };
  let message = '';

  switch (classId) {
    case 'andarilho_setima_arte': {
      const added = await appendExtraTagsToRecipe(recipe, 2);
      message = `🎒 Cantil de Estrada: +${added.length} Tags adicionadas (${added.join(', ')})!`;
      break;
    }

    case 'barbaro_imax': {
      const heroNames = ['Ação', 'Aventura', 'Ficção Científica'];
      const heroObjs = CHIMERA_GENRES.filter((g) => heroNames.includes(g.name));
      recipe.genres = Array.from(new Set([...(recipe.genres || []), ...heroObjs.map((g) => g.name)]));
      recipe.genreIds = Array.from(new Set([...(recipe.genreIds || []), ...heroObjs.map((g) => g.id)]));
      message = '💥 Rugido Surround: Gêneros Ação, Aventura e Ficção Científica liberados na Quimera!';
      break;
    }

    case 'sicario_telonas': {
      const bonus = 15;
      if (!recipe.specialRule) {
        recipe.specialRule = {
          id: 'short_allowed',
          icon: '🗡️',
          label: 'Lâmina Curta (< 50 min)!',
          hint: 'Libera curta-metragem (< 50 min) na Quimera com +15 XP extras!',
          bonusXp: bonus,
          allowShort: true,
        };
      } else {
        recipe.specialRule = {
          ...recipe.specialRule,
          allowShort: true,
          bonusXp: Number(recipe.specialRule.bonusXp || 0) + bonus,
          label: `${recipe.specialRule.label} + Lâmina Curta`,
        };
      }
      message = '🗡️ Lâmina Curta ativa: Curtas-Metragens (< 50m) liberados com +15 XP extras!';
      break;
    }

    case 'bardo_herbert_richers': {
      recipe.requiresDubbedBonusXp = Number(recipe.requiresDubbedBonusXp || 0) + 40;
      message = '🔊 Estúdio Clássico: +40 XP bônus adicionados se o filme cadastrado for Dublado!';
      break;
    }

    case 'corsario_sete_mares': {
      applySecondBlockMutation(recipe);
      message = `⛵ Bandeira Pirata hasteada! Novo bloco regional e país Jackpot adicionados à rota!`;
      break;
    }

    case 'vampiro_madrugada': {
      const added = await appendExtraTagsToRecipe(recipe, 5);
      if (added[0]) {
        recipe.extraJackpotTags = Array.from(new Set([...(recipe.extraJackpotTags || []), added[0]]));
        recipe.stackableTagJackpots = true;
      }
      message = `🩸 Beijo da Meia-Noite: +${added.length} Tags noturnas adicionadas e "${added[0] || 'nova Tag'}" promovida a Tag Ouro!`;
      break;
    }

    case 'carnical_grindhouse': {
      const validPillars: ChimeraPillarKey[] = ['year', 'country', 'genre', 'tag'];
      const sacSet = new Set<ChimeraPillarKey>(recipe.sacrificedPillars || []);
      const targetPillar = (
        validPillars.includes(choiceValue as ChimeraPillarKey) ? choiceValue : ''
      ) as ChimeraPillarKey;
      if (!targetPillar) {
        throw new Error('Escolha qual pilar (Ano, País, Gênero ou Tags) deseja cortar com a Serra Elétrica!');
      }
      if (sacSet.has(targetPillar)) {
        throw new Error(`O pilar "${targetPillar}" já foi sacrificado nesta Quimera!`);
      }
      if (sacSet.size >= 3) {
        throw new Error('Pelo menos 1 pilar precisa permanecer ativo na Quimera!');
      }
      recipe.sacrificedPillars = [...sacSet, targetPillar];
      recipe.flatRuneBonusXp = Number(recipe.flatRuneBonusXp || 0) + 20;
      message = `🪚 Serra Elétrica: Pilar "${targetPillar}" dispensado desta Quimera + 20 XP de consolação!`;
      break;
    }

    case 'cacador_trufas': {
      recipe.specialRule = {
        id: 'underdog',
        icon: '🍄',
        label: 'Trufa Subterrânea (< 5.000 votos)',
        hint: 'Se o filme tiver menos de 5.000 votos no TMDB, concede +40 XP extras na colheita!',
        bonusXp: 40,
        allowShort: Boolean(recipe.specialRule?.allowShort),
      };
      message = '🍄 Trufa Subterrânea ativada: filmes com < 5.000 votos pagam +40 XP bônus!';
      break;
    }

    case 'cartografo_195_reinos': {
      if (!choiceValue) {
        throw new Error('Selecione qual País deseja adicionar e marcar como Ouro na Quimera!');
      }
      const allCountries = CHIMERA_COUNTRY_BLOCKS.flatMap((b) => b.countries);
      const foundCountry =
        allCountries.find(
          (c) =>
            c.iso.toUpperCase() === choiceValue.toUpperCase() ||
            normalizeText(c.name) === normalizeText(choiceValue)
        ) || { iso: '', name: choiceValue };
      recipe.extraBlockCountries = Array.from(
        new Set([...(recipe.extraBlockCountries || []), foundCountry.name])
      );
      if (foundCountry.iso) {
        recipe.extraBlockIsoCodes = Array.from(
          new Set([...(recipe.extraBlockIsoCodes || []), foundCountry.iso])
        );
      }
      recipe.extraBlockLabel = recipe.extraBlockLabel
        ? `${recipe.extraBlockLabel} + 🧭 ${foundCountry.name}`
        : `🧭 ${foundCountry.name}`;
      recipe.extraJackpotCountries = [
        ...(recipe.extraJackpotCountries || []),
        { iso: foundCountry.iso, name: foundCountry.name },
      ];
      recipe.stackableCountryJackpots = true;
      message = `🌍 Fronteira Livre: "${foundCountry.name}" adicionado e cravado como País Ouro Jackpot (+0.5 DES)!`;
      break;
    }

    case 'sacerdote_cinefilo': {
      recipe.revealRemainingRarities = true;
      recipe.flatRuneBonusXp = Number(recipe.flatRuneBonusXp || 0) + 15;
      message = '🕯️ Vela do Altar acesa: raridade de todas as Runas revelada + 15 XP na Quimera!';
      break;
    }

    case 'monge_tres_casas': {
      const currentYear = new Date().getFullYear();
      recipe.minYear = Math.max(1920, recipe.minYear - 4);
      recipe.maxYear = Math.min(currentYear, recipe.maxYear + 4);
      recipe.windowSize = recipe.maxYear - recipe.minYear + 1;
      applyExtraGoldTagMutation(recipe);
      recipe.stackableTagJackpots = true;
      recipe.flatRuneBonusXp = Number(recipe.flatRuneBonusXp || 0) + 20;
      message = `🎲 Equilíbrio dos Dados: janela de Ano ampliada (${recipe.minYear}–${recipe.maxYear}), +1 Tag Ouro e +20 XP!`;
      break;
    }

    case 'cavaleiro_laser_azul': {
      if (!choiceValue) {
        throw new Error('Escolha qual Gênero deseja gravar em Edição de Colecionador!');
      }
      const genreObj = CHIMERA_GENRES.find(
        (g) => normalizeText(g.name) === normalizeText(choiceValue)
      );
      if (!genreObj) {
        throw new Error('Gênero escolhido inválido.');
      }
      recipe.genres = Array.from(new Set([...(recipe.genres || []), genreObj.name]));
      recipe.genreIds = Array.from(new Set([...(recipe.genreIds || []), genreObj.id]));
      recipe.extraJackpotGenres = Array.from(
        new Set([...(recipe.extraJackpotGenres || []), genreObj.name])
      );
      recipe.stackableGenreJackpots = true;
      recipe.legendaryJackpotPillars = Array.from(
        new Set<ChimeraPillarKey>([...(recipe.legendaryJackpotPillars || []), 'genre'])
      );
      message = `📀 Edição de Colecionador: "${genreObj.name}" adicionado como Gênero Ouro Checkpot (+0.5 AGI garantido)!`;
      break;
    }

    case 'algoz_tomatometro': {
      const added = await appendExtraTagsToRecipe(recipe, 3);
      recipe.flatRuneBonusXp = Number(recipe.flatRuneBonusXp || 0) + 15;
      message = `🍅 Selo Fresco: +${added.length} Tags adicionadas e +15 XP na Quimera!`;
      break;
    }

    case 'gladiador_ps5': {
      const unpickedCount = (recipe.fateRunes || []).filter((r) => !r.chosen).length;
      if (unpickedCount > 0) {
        recipe.runePicksRemaining = Math.min(
          unpickedCount,
          Number(recipe.runePicksRemaining || 0) + 1
        );
        message = '🏆 Armadura de Platina: +1 escolha de Runa liberada no Altar desta Quimera!';
      } else {
        recipe.revealRemainingRarities = true;
        recipe.flatRuneBonusXp = Number(recipe.flatRuneBonusXp || 0) + 25;
        message = '🏆 Armadura de Platina: Altar já fechado, concedido +25 XP blindados na Quimera!';
      }
      break;
    }

    case 'arquimago_tempo': {
      const currentYear = new Date().getFullYear();
      recipe.minYear = Math.max(1920, recipe.minYear - 12);
      recipe.maxYear = Math.min(currentYear, recipe.maxYear + 12);
      recipe.windowSize = recipe.maxYear - recipe.minYear + 1;
      const bonusYears = new Set<number>(recipe.extraTargetYears || []);
      for (let d = -3; d <= 3; d++) {
        const y = recipe.targetYear + d;
        if (y >= 1920 && y <= currentYear && y !== recipe.targetYear) {
          bonusYears.add(y);
        }
      }
      recipe.extraTargetYears = Array.from(bonusYears);
      message = `🧙‍♂️ Fenda Cronológica Suprema: faixa estendida para ${recipe.minYear}–${recipe.maxYear} e anos ${recipe.targetYear - 3}–${recipe.targetYear + 3} valem Jackpot!`;
      break;
    }

    case 'paladino_oscar': {
      recipe.flatRuneBonusXp = Number(recipe.flatRuneBonusXp || 0) + 35;
      recipe.jackpotMultiplierBonusRate = Number(recipe.jackpotMultiplierBonusRate || 0) + 0.25;
      message = '🌟 Tapete Vermelho: +35 XP dourados e +25% extras em todos os Jackpots desta Quimera!';
      break;
    }

    case 'cronista_creditos_pos': {
      applySecondYearMutation(recipe);
      applySecondYearMutation(recipe);
      applyExtraGoldTagMutation(recipe);
      recipe.stackableTagJackpots = true;
      message = '🪝 Gancho Secreto: +2 Anos Jackpot na faixa e +1 Tag Ouro promovida!';
      break;
    }

    case 'alquimista_maratonas': {
      if (!choiceValue) {
        throw new Error('Escolha qual Tag deseja transmutar em Tag Ouro Jackpot!');
      }
      const norm = normalizeText(choiceValue);
      if (EXCLUDED_CHIMERA_TAG_NORMS.has(norm)) {
        throw new Error('Esta Tag subjetiva não é permitida na Quimera.');
      }
      recipe.tags = Array.from(new Set([...(recipe.tags || []), choiceValue]));
      recipe.extraJackpotTags = Array.from(
        new Set([...(recipe.extraJackpotTags || []), choiceValue])
      );
      recipe.stackableTagJackpots = true;
      const added = await appendExtraTagsToRecipe(recipe, 3);
      message = `🧪 Transmutação: "${choiceValue}" transmutada em Tag Ouro Jackpot (+0.5 CAR) + ${added.length} Tags aleatórias!`;
      break;
    }

    case 'oraculo_pelicula': {
      recipe.revealRemainingRarities = true;
      const unpicked = (recipe.fateRunes || []).filter((r) => !r.chosen).length;
      if (unpicked > 0) {
        recipe.runePicksRemaining = Math.min(unpicked, Number(recipe.runePicksRemaining || 0) + 1);
      }
      message = '👁️ Terceiro Olho do Altar: todas as 5 Runas reveladas + 1 escolha extra no Altar!';
      break;
    }

    case 'arquiteto_multiverso': {
      const validPillars: ChimeraPillarKey[] = ['year', 'country', 'genre', 'tag'];
      const pillar = (
        validPillars.includes(choiceValue as ChimeraPillarKey) ? choiceValue : ''
      ) as ChimeraPillarKey;
      if (!pillar) {
        throw new Error('Escolha qual pilar (Ano, País, Gênero ou Tags) deseja converter em Jackpot Garantido!');
      }
      if ((recipe.sacrificedPillars || []).includes(pillar)) {
        throw new Error('Não é possível converter um pilar que foi sacrificado!');
      }
      recipe.legendaryJackpotPillars = Array.from(
        new Set<ChimeraPillarKey>([...(recipe.legendaryJackpotPillars || []), pillar])
      );
      if (pillar === 'country') recipe.stackableCountryJackpots = true;
      if (pillar === 'genre') recipe.stackableGenreJackpots = true;
      if (pillar === 'tag') recipe.stackableTagJackpots = true;
      message = `👑 Convergência do Arquiteto: o pilar "${pillar}" agora é JACKPOT GARANTIDO ao cumprir a base!`;
      break;
    }

    default:
      throw new Error('Classe não reconhecida para poder da Quimera.');
  }

  const finalized = recalculateRecipeXpTotals(recipe);
  const upd = await query(
    `UPDATE chimera_contracts SET recipe_json = $2::jsonb WHERE id = $1 RETURNING *`,
    [current.id, JSON.stringify(finalized)]
  );
  const classWallet = await consumeClassPowerCharge('chimera');
  const data = await getChimeraStatus();

  return {
    message,
    chimera: mapChimeraRow(upd.rows[0]),
    classWallet,
    data,
  };
}
