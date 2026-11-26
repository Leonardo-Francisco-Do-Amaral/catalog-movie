import { query } from '../config/database';
import { getSaoPauloMonthCycleInfo, computeCycleBankedBalance } from '../utils/cycleUtils';
import { matchUniverseMovie } from './universeCodexService';
import { UNIVERSE_SAGAS } from '../data/universeDefinitions';
import {
  assertClassPowerChargeAvailable,
  ClassPowerWalletStatus,
  consumeClassPowerCharge,
} from './classPowersService';
import {
  grantGuildBazaarCoins,
  applyGoldenLoupeBonus,
  consumeTacticalPowerCharge,
} from './guildBazaarService';

export type BingoFamily =
  | 'secret_draw'
  | 'chimera'
  | 'stickers'
  | 'trophies'
  | 'map_duel'
  | 'counters'
  | 'film_habit';

export type BingoDifficultyState = 'normal' | 'upgraded' | 'downgraded';

export type BingoChipType = 'forge' | 'board_reroll' | 'square_reroll' | 'upgrade' | 'downgrade';

export type BingoRpgStatKey = 'AGI' | 'INT' | 'DES' | 'SOR' | 'VIT' | 'FOR' | 'CAR';

export interface BingoStatPoints {
  AGI: number;
  INT: number;
  DES: number;
  SOR: number;
  VIT: number;
  FOR: number;
  CAR: number;
  total: number;
}

export const EMPTY_BINGO_STAT_POINTS: BingoStatPoints = {
  AGI: 0,
  INT: 0,
  DES: 0,
  SOR: 0,
  VIT: 0,
  FOR: 0,
  CAR: 0,
  total: 0,
};

export interface BingoGoalVariant {
  title: string;
  desc: string;
  target: number;
  xpReward: number;
  evaluatorKey: string;
}

export interface BingoGoalDefinition {
  key: string;
  family: BingoFamily;
  statKey: BingoRpgStatKey;
  icon: string;
  normal: BingoGoalVariant;
  upgraded: BingoGoalVariant;
  downgraded: BingoGoalVariant;
}

export type BingoRewardMode = 'xp' | 'gold' | 'hybrid';

export interface BingoSquare {
  index: number;
  goalKey: string;
  evaluatorKey: string;
  family: BingoFamily;
  statKey: BingoRpgStatKey;
  icon: string;
  title: string;
  desc: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  rewardMode?: BingoRewardMode;
  baseXpValue?: number;
  xpReward: number;
  xpAwarded: number;
  goldReward?: number;
  goldAwarded?: number;
  hybridGoldBoost?: boolean;
  difficultyState: BingoDifficultyState;
  lineWildcard?: boolean;
  preserveNormalStat?: boolean;
  progressMeta?: {
    seenDecades?: string[];
    seenCountries?: string[];
    contributors?: Array<string | number>;
  };
}

export interface BingoLineReward {
  id: string;
  label: string;
  indices: [number, number, number, number];
  completed: boolean;
  claimed: boolean;
  rewardMode?: BingoRewardMode;
  xpReward: number;
  xpAwarded: number;
  goldReward?: number;
  goldAwarded?: number;
  hybridGoldBoost?: boolean;
}

export interface BingoBoardData {
  squares: BingoSquare[];
  lines: BingoLineReward[];
  blackout: {
    completed: boolean;
    claimed: boolean;
    rewardMode?: BingoRewardMode;
    xpReward: number;
    xpAwarded: number;
    goldReward?: number;
    goldAwarded?: number;
  };
}

export interface BingoBoardRecord {
  id: number;
  monthKey: string;
  status: 'active' | 'completed' | 'archived';
  board: BingoBoardData;
  xpAwarded: number;
  goldAwarded: number;
  readyToClaimCount: number;
  readyToClaimXp: number;
  readyToClaimGold: number;
  completedSquaresCount: number;
  completedLinesCount: number;
  createdAt: string;
  completedAt: string | null;
}

export interface BingoWallet {
  monthKey: string;
  nextResetLabel: string;
  forgeChips: number;
  maxForgeChips: number;
  boardRerollChips: number;
  maxBoardRerollChips: number;
  squareRerollChips: number;
  maxSquareRerollChips: number;
  upgradeChips: number;
  maxUpgradeChips: number;
  downgradeChips: number;
  maxDowngradeChips: number;
}

export interface BingoXpSummary {
  completedBoardsCount: number;
  claimedRewardsCount: number;
  claimedSquaresTotal: number;
  totalXp: number;
  statPoints: BingoStatPoints;
  claimedMap: Record<
    string,
    {
      boardId: number;
      monthKey: string;
      xp: number;
      completedSquares: number;
      completedLines: number;
      updatedAt: string | null;
    }
  >;
}

export const EMPTY_BINGO_XP_SUMMARY: BingoXpSummary = {
  completedBoardsCount: 0,
  claimedRewardsCount: 0,
  claimedSquaresTotal: 0,
  totalXp: 0,
  statPoints: { ...EMPTY_BINGO_STAT_POINTS },
  claimedMap: {},
};

/** Divisão exata dos 35 contratos entre os 7 atributos RPG (5 por atributo). */
export const BINGO_GOAL_STAT_BY_KEY: Record<string, BingoRpgStatKey> = {
  // ⚡ AGI (5): Vigor de Tela (duração, ritmo e gêneros)
  short_film_1: 'AGI',
  long_film_1: 'AGI',
  genres_25: 'AGI',
  streaming_3: 'AGI',
  dubbed_5: 'AGI',

  // 🧠 INT (5): Sabedoria Temporal (épocas, décadas, resenhas e universos)
  classic_pre_1980: 'INT',
  decades_4: 'INT',
  review_notes_3: 'INT',
  universe_franchise_film: 'INT',
  chimera_complete_1: 'INT',

  // 🌍 DES (5): Diplomacia Global (fronteiras, países, Lado B e exibição física)
  foreign_subbed_1: 'DES',
  countries_4: 'DES',
  new_year_or_country: 'DES',
  hidden_gem_cult_1: 'DES',
  physical_cinema_1: 'DES',

  // 🎯 SOR (5): Olhar Clínico & Fortuna (Sessão Secreta, Jackpot e apostas)
  sd_complete_1: 'SOR',
  sd_complete_2: 'SOR',
  sd_hard_1: 'SOR',
  chimera_jackpot: 'SOR',
  imdb_low_69: 'SOR',

  // 🛡️ VIT (5): Caça-Troféus (Troféus PS5, estrelas infinitas e volume)
  trophies_new_or_inf_10: 'VIT',
  trophy_infinite_1: 'VIT',
  trophies_new_10: 'VIT',
  trophies_progress_50: 'VIT',
  movies_10: 'VIT',

  // 👑 FOR (5): Prestígio Áureo (Oscar, duelos de campeão, crítica e notas altas)
  oscar_movie_1: 'FOR',
  duel_champion: 'FOR',
  critic_acclaimed_1: 'FOR',
  imdb_high_7: 'FOR',
  user_rating_8: 'FOR',

  // 🌟 CAR (5): Aura de Estrela (Figurinhas do Álbum da Fama e Tags)
  sticker_any: 'CAR',
  sticker_dublador: 'CAR',
  sticker_director: 'CAR',
  sticker_actor_couple: 'CAR',
  tags_50: 'CAR',
};

export const BINGO_WALLET_RULES = {
  forge: { allowance: 1, max: 3 },
  board_reroll: { allowance: 1, max: 3 },
  square_reroll: { allowance: 2, max: 4 },
  upgrade: { allowance: 1, max: 3 },
  downgrade: { allowance: 1, max: 3 },
} as const;

export const BINGO_LINE_XP = 75;
export const BINGO_BLACKOUT_XP = 200;

const PHYSICAL_PLATFORMS = new Set(['cinema', 'blu ray', 'bluray', 'blu-ray', 'dvd']);

const BINGO_LINES_SPEC: Array<{ id: string; label: string; indices: [number, number, number, number] }> = [
  { id: 'row_0', label: 'Linha 1 (Horizontal)', indices: [0, 1, 2, 3] },
  { id: 'row_1', label: 'Linha 2 (Horizontal)', indices: [4, 5, 6, 7] },
  { id: 'row_2', label: 'Linha 3 (Horizontal)', indices: [8, 9, 10, 11] },
  { id: 'row_3', label: 'Linha 4 (Horizontal)', indices: [12, 13, 14, 15] },
  { id: 'col_0', label: 'Coluna 1 (Vertical)', indices: [0, 4, 8, 12] },
  { id: 'col_1', label: 'Coluna 2 (Vertical)', indices: [1, 5, 9, 13] },
  { id: 'col_2', label: 'Coluna 3 (Vertical)', indices: [2, 6, 10, 14] },
  { id: 'col_3', label: 'Coluna 4 (Vertical)', indices: [3, 7, 11, 15] },
  { id: 'diag_main', label: 'Diagonal Principal (↘)', indices: [0, 5, 10, 15] },
  { id: 'diag_anti', label: 'Diagonal Inversa (↙)', indices: [3, 6, 9, 12] },
];

const RAW_BINGO_GOAL_CATALOG: Array<Omit<BingoGoalDefinition, 'statKey'>> = [
  // ===== SESSÃO SECRETA (3) =====
  {
    key: 'sd_complete_1',
    family: 'secret_draw',
    icon: '🃏',
    normal: { title: 'Sessão Secreta', desc: 'Concluir 1 carta da Sessão Secreta', target: 1, xpReward: 35, evaluatorKey: 'sd_any' },
    upgraded: { title: 'Sessão Secreta (2×)', desc: 'Concluir 2 cartas da Sessão Secreta', target: 2, xpReward: 70, evaluatorKey: 'sd_any' },
    downgraded: { title: 'Desafio da Guilda', desc: 'Concluir 1 Sessão Secreta OU 1 Quimera', target: 1, xpReward: 20, evaluatorKey: 'guild_any' },
  },
  {
    key: 'sd_complete_2',
    family: 'secret_draw',
    icon: '🃏',
    normal: { title: 'Dupla Secreta', desc: 'Concluir 2 cartas da Sessão Secreta', target: 2, xpReward: 55, evaluatorKey: 'sd_any' },
    upgraded: { title: 'Tripla Secreta', desc: 'Concluir 3 cartas da Sessão Secreta', target: 3, xpReward: 95, evaluatorKey: 'sd_any' },
    downgraded: { title: 'Sessão Simples', desc: 'Concluir 1 carta da Sessão Secreta', target: 1, xpReward: 30, evaluatorKey: 'sd_any' },
  },
  {
    key: 'sd_hard_1',
    family: 'secret_draw',
    icon: '♠️',
    normal: { title: 'Carta Pesada', desc: 'Concluir 1 carta Difícil+ (♠/♥/★) da Sessão Secreta', target: 1, xpReward: 50, evaluatorKey: 'sd_hard' },
    upgraded: { title: 'Duas Cartas Pesadas', desc: 'Concluir 2 cartas Difícil+ na Sessão Secreta', target: 2, xpReward: 95, evaluatorKey: 'sd_hard' },
    downgraded: { title: 'Carta Livre', desc: 'Concluir 1 carta de qualquer naipe da Sessão Secreta', target: 1, xpReward: 30, evaluatorKey: 'sd_any' },
  },

  // ===== QUIMERA (2) =====
  {
    key: 'chimera_complete_1',
    family: 'chimera',
    icon: '🧬',
    normal: { title: 'Caçador de Quimeras', desc: 'Concluir e colher 1 Quimera Cinéfila', target: 1, xpReward: 45, evaluatorKey: 'chimera_any' },
    upgraded: { title: 'Quimera Dourada (2+)', desc: 'Colher 1 Quimera com 2+ Jackpots ou 2 Quimeras', target: 1, xpReward: 85, evaluatorKey: 'chimera_jackpot_2' },
    downgraded: { title: 'Missão da Guilda', desc: 'Concluir 1 Quimera OU 1 Sessão Secreta', target: 1, xpReward: 25, evaluatorKey: 'guild_any' },
  },
  {
    key: 'chimera_jackpot',
    family: 'chimera',
    icon: '🎰',
    normal: { title: 'Quimera Premiada', desc: 'Concluir 1 Quimera com pelo menos 1 Jackpot', target: 1, xpReward: 55, evaluatorKey: 'chimera_jackpot_1' },
    upgraded: { title: 'Mega Quimera', desc: 'Concluir 1 Quimera com 2+ Jackpots', target: 1, xpReward: 95, evaluatorKey: 'chimera_jackpot_2' },
    downgraded: { title: 'Quimera Normal', desc: 'Concluir 1 Quimera (sem exigir Jackpot)', target: 1, xpReward: 35, evaluatorKey: 'chimera_any' },
  },

  // ===== ÁLBUM DA FAMA / FIGURINHAS (4) =====
  {
    key: 'sticker_any',
    family: 'stickers',
    icon: '🌟',
    normal: { title: 'Figurinha no Álbum', desc: 'Ganhar ou evoluir 1 figurinha no Álbum da Fama', target: 1, xpReward: 30, evaluatorKey: 'sticker_any' },
    upgraded: { title: 'Par de Figurinhas', desc: 'Ganhar ou evoluir 2 figurinhas no Álbum da Fama', target: 2, xpReward: 65, evaluatorKey: 'sticker_any' },
    downgraded: { title: 'Passo na Coleção', desc: 'Colar/evoluir 1 figurinha OU 3 avanços de troféu', target: 1, xpReward: 20, evaluatorKey: 'sticker_any' },
  },
  {
    key: 'sticker_dublador',
    family: 'stickers',
    icon: '🎙️',
    normal: { title: 'Voz Imortal', desc: 'Ganhar ou evoluir 1 figurinha de Dublador', target: 1, xpReward: 40, evaluatorKey: 'sticker_dublador' },
    upgraded: { title: 'Estúdio de Vozes', desc: 'Ganhar ou evoluir 2 figurinhas de Dublador', target: 2, xpReward: 75, evaluatorKey: 'sticker_dublador' },
    downgraded: { title: 'Figurinha Qualquer', desc: 'Ganhar ou evoluir 1 figurinha (qualquer categoria)', target: 1, xpReward: 25, evaluatorKey: 'sticker_any' },
  },
  {
    key: 'sticker_director',
    family: 'stickers',
    icon: '🎬',
    normal: { title: 'Autor do Cinema', desc: 'Ganhar ou evoluir 1 figurinha de Diretor / Roteirista', target: 1, xpReward: 40, evaluatorKey: 'sticker_director' },
    upgraded: { title: 'Mestres da Direção', desc: 'Ganhar ou evoluir 2 figurinhas de Diretor / Roteirista', target: 2, xpReward: 75, evaluatorKey: 'sticker_director' },
    downgraded: { title: 'Figurinha Qualquer', desc: 'Ganhar ou evoluir 1 figurinha (qualquer categoria)', target: 1, xpReward: 25, evaluatorKey: 'sticker_any' },
  },
  {
    key: 'sticker_actor_couple',
    family: 'stickers',
    icon: '🎭',
    normal: { title: 'Estrela do Elenco', desc: 'Ganhar ou evoluir 1 figurinha de Ator ou Casal', target: 1, xpReward: 35, evaluatorKey: 'sticker_actor_couple' },
    upgraded: { title: 'Elenco Estelar (2×)', desc: 'Ganhar ou evoluir 2 figurinhas de Ator ou Casal', target: 2, xpReward: 70, evaluatorKey: 'sticker_actor_couple' },
    downgraded: { title: 'Figurinha Qualquer', desc: 'Ganhar ou evoluir 1 figurinha (qualquer categoria)', target: 1, xpReward: 25, evaluatorKey: 'sticker_any' },
  },

  // ===== TROFÉUS (4) =====
  {
    key: 'trophies_new_or_inf_10',
    family: 'trophies',
    icon: '🏆',
    normal: { title: 'Chuva de Conquistas', desc: 'Ganhar 10 troféus novos ou estrelas infinitas (★)', target: 10, xpReward: 50, evaluatorKey: 'trophy_new_or_inf' },
    upgraded: { title: 'Tempestade de Troféus', desc: 'Ganhar 16 troféus novos ou estrelas (★)', target: 16, xpReward: 90, evaluatorKey: 'trophy_new_or_inf' },
    downgraded: { title: 'Brisa de Troféus', desc: 'Ganhar 5 troféus novos ou estrelas (★)', target: 5, xpReward: 25, evaluatorKey: 'trophy_new_or_inf' },
  },
  {
    key: 'trophy_infinite_1',
    family: 'trophies',
    icon: '♾️',
    normal: { title: 'Além do Limite', desc: 'Ganhar 1 Estrela Infinita (★) de troféu', target: 1, xpReward: 45, evaluatorKey: 'trophy_infinite' },
    upgraded: { title: 'Tríade Infinita', desc: 'Ganhar 3 Estrelas Infinitas (★) de troféus', target: 3, xpReward: 90, evaluatorKey: 'trophy_infinite' },
    downgraded: { title: 'Conquista Direta', desc: 'Ganhar 2 troféus novos ou 1 estrela ★', target: 2, xpReward: 25, evaluatorKey: 'trophy_new_or_inf' },
  },
  {
    key: 'trophies_new_10',
    family: 'trophies',
    icon: '🥇',
    normal: { title: 'Colecionador de Troféus', desc: 'Ganhar 10 novos troféus/ranks', target: 10, xpReward: 50, evaluatorKey: 'trophy_new' },
    upgraded: { title: 'Arsenal de Ouro', desc: 'Ganhar 15 novos troféus/ranks', target: 15, xpReward: 85, evaluatorKey: 'trophy_new' },
    downgraded: { title: 'Primeiros Troféus', desc: 'Ganhar 4 novos troféus/ranks', target: 4, xpReward: 25, evaluatorKey: 'trophy_new' },
  },
  {
    key: 'trophies_progress_50',
    family: 'trophies',
    icon: '📈',
    normal: { title: 'Progresso Contínuo', desc: 'Evoluir o progresso de 50 troféus no mês', target: 50, xpReward: 40, evaluatorKey: 'trophy_progress' },
    upgraded: { title: 'Maratona de Progresso', desc: 'Evoluir o progresso de 85 troféus no mês', target: 85, xpReward: 75, evaluatorKey: 'trophy_progress' },
    downgraded: { title: 'Impulso Inicial', desc: 'Evoluir o progresso de 20 troféus no mês', target: 20, xpReward: 20, evaluatorKey: 'trophy_progress' },
  },

  // ===== DUELOS, MAPA MUNDI, TEMPO & UNIVERSOS (3) =====
  {
    key: 'duel_champion',
    family: 'map_duel',
    icon: '⚔️',
    normal: { title: 'Duelo de Trono', desc: 'Superar a nota do Campeão de um Ano ou País', target: 1, xpReward: 45, evaluatorKey: 'duel_win' },
    upgraded: { title: 'Duplo Reinado', desc: 'Vencer 2 Duelos de Campeão (Ano ou País)', target: 2, xpReward: 85, evaluatorKey: 'duel_win' },
    downgraded: { title: 'Glória no Trono', desc: 'Vencer 1 Duelo OU conquistar Ano/País novo', target: 1, xpReward: 25, evaluatorKey: 'duel_or_new' },
  },
  {
    key: 'new_year_or_country',
    family: 'map_duel',
    icon: '🧭',
    normal: { title: 'Território Inédito', desc: 'Conquistar 1 Ano ou País novo no catálogo', target: 1, xpReward: 40, evaluatorKey: 'new_year_country' },
    upgraded: { title: 'Explorador Nato', desc: 'Conquistar 2 Anos ou Países inéditos', target: 2, xpReward: 75, evaluatorKey: 'new_year_country' },
    downgraded: { title: 'Fronteira ou Trono', desc: 'Conquistar Ano/País novo OU vencer Duelo', target: 1, xpReward: 25, evaluatorKey: 'duel_or_new' },
  },
  {
    key: 'universe_franchise_film',
    family: 'map_duel',
    icon: '🌌',
    normal: { title: 'Eco dos Universos', desc: 'Assistir 1 filme de qualquer franquia do Códice', target: 1, xpReward: 30, evaluatorKey: 'universe_film' },
    upgraded: { title: 'Sagas em Sequência', desc: 'Assistir 2 filmes de franquias do Códice', target: 2, xpReward: 65, evaluatorKey: 'universe_film' },
    downgraded: { title: 'Franquia ou Obra-Prima', desc: 'Assistir 1 filme do Códice OU dar nota ≥ 8.0', target: 1, xpReward: 20, evaluatorKey: 'universe_or_8' },
  },

  // ===== CONTADORES GERAIS (8) =====
  {
    key: 'movies_10',
    family: 'counters',
    icon: '🎞️',
    normal: { title: 'Ritmo de Cinema', desc: 'Cadastrar 10 filmes no período', target: 10, xpReward: 45, evaluatorKey: 'movie_count' },
    upgraded: { title: 'Maratona Mensal', desc: 'Cadastrar 15 filmes no período', target: 15, xpReward: 80, evaluatorKey: 'movie_count' },
    downgraded: { title: 'Sessão Tranquila', desc: 'Cadastrar 5 filmes no período', target: 5, xpReward: 25, evaluatorKey: 'movie_count' },
  },
  {
    key: 'streaming_3',
    family: 'counters',
    icon: '📺',
    normal: { title: 'Noite de Streaming', desc: 'Assistir 3 filmes via Streaming em geral', target: 3, xpReward: 30, evaluatorKey: 'streaming_count' },
    upgraded: { title: 'Maratona Streaming', desc: 'Assistir 6 filmes via Streaming em geral', target: 6, xpReward: 60, evaluatorKey: 'streaming_count' },
    downgraded: { title: 'Play Rápido', desc: 'Assistir 1 filme via Streaming em geral', target: 1, xpReward: 15, evaluatorKey: 'streaming_count' },
  },
  {
    key: 'dubbed_5',
    family: 'counters',
    icon: '🗣️',
    normal: { title: 'Vozes Brasileiras (5×)', desc: 'Assistir 5 filmes Dublados', target: 5, xpReward: 35, evaluatorKey: 'dubbed_count' },
    upgraded: { title: 'Vozes Brasileiras (8×)', desc: 'Assistir 8 filmes Dublados', target: 8, xpReward: 65, evaluatorKey: 'dubbed_count' },
    downgraded: { title: 'Sessão Dublada', desc: 'Assistir 2 filmes Dublados', target: 2, xpReward: 20, evaluatorKey: 'dubbed_count' },
  },
  {
    key: 'genres_25',
    family: 'counters',
    icon: '🎭',
    normal: { title: 'Mosaico de Gêneros', desc: 'Somar 25 gêneros entre filmes catalogados', target: 25, xpReward: 35, evaluatorKey: 'genre_points' },
    upgraded: { title: 'Enciclopédia de Gêneros', desc: 'Somar 40 gêneros entre filmes catalogados', target: 40, xpReward: 65, evaluatorKey: 'genre_points' },
    downgraded: { title: 'Dose de Gêneros', desc: 'Somar 12 gêneros entre filmes catalogados', target: 12, xpReward: 20, evaluatorKey: 'genre_points' },
  },
  {
    key: 'tags_50',
    family: 'counters',
    icon: '🏷️',
    normal: { title: 'Mestre das Tags', desc: 'Somar 50 tags entre filmes catalogados', target: 50, xpReward: 40, evaluatorKey: 'tag_points' },
    upgraded: { title: 'Arquivista Supremo', desc: 'Somar 80 tags entre filmes catalogados', target: 80, xpReward: 75, evaluatorKey: 'tag_points' },
    downgraded: { title: 'Caçador de Tags', desc: 'Somar 25 tags entre filmes catalogados', target: 25, xpReward: 20, evaluatorKey: 'tag_points' },
  },
  {
    key: 'review_notes_3',
    family: 'counters',
    icon: '📝',
    normal: { title: 'Crítico de Caderneta', desc: 'Escrever resenha/anotação em 3 filmes', target: 3, xpReward: 30, evaluatorKey: 'review_count' },
    upgraded: { title: 'Colunista Cinéfilo', desc: 'Escrever resenha/anotação em 6 filmes', target: 6, xpReward: 60, evaluatorKey: 'review_count' },
    downgraded: { title: 'Primeira Resenha', desc: 'Escrever resenha/anotação em 1 filme', target: 1, xpReward: 15, evaluatorKey: 'review_count' },
  },
  {
    key: 'decades_4',
    family: 'counters',
    icon: '🕰️',
    normal: { title: 'Viajante de 4 Décadas', desc: 'Assistir filmes de 4 décadas diferentes', target: 4, xpReward: 35, evaluatorKey: 'distinct_decades' },
    upgraded: { title: 'Viajante de 6 Décadas', desc: 'Assistir filmes de 6 décadas diferentes', target: 6, xpReward: 70, evaluatorKey: 'distinct_decades' },
    downgraded: { title: 'Duas Décadas', desc: 'Assistir filmes de 2 décadas diferentes', target: 2, xpReward: 20, evaluatorKey: 'distinct_decades' },
  },
  {
    key: 'countries_4',
    family: 'counters',
    icon: '🌎',
    normal: { title: 'Passaporte Mensal', desc: 'Assistir filmes de 4 países diferentes', target: 4, xpReward: 35, evaluatorKey: 'distinct_countries' },
    upgraded: { title: 'Volta ao Mundo', desc: 'Assistir filmes de 6 países diferentes', target: 6, xpReward: 70, evaluatorKey: 'distinct_countries' },
    downgraded: { title: 'Ponte Internacional', desc: 'Assistir filmes de 2 países diferentes', target: 2, xpReward: 20, evaluatorKey: 'distinct_countries' },
  },

  // ===== HÁBITOS DE FILME (11) =====
  {
    key: 'physical_cinema_1',
    family: 'film_habit',
    icon: '🍿',
    normal: { title: 'Tela Grande ou Mídia Física', desc: 'Assistir 1 filme no Cinema, Blu-ray ou DVD', target: 1, xpReward: 35, evaluatorKey: 'physical_1' },
    upgraded: { title: 'Sessão Sala & Disco (2×)', desc: 'Assistir 2 filmes no Cinema, Blu-ray ou DVD', target: 2, xpReward: 70, evaluatorKey: 'physical_1' },
    downgraded: { title: 'Qualquer Tela', desc: 'Catalogar 1 filme em qualquer plataforma', target: 1, xpReward: 15, evaluatorKey: 'movie_count' },
  },
  {
    key: 'short_film_1',
    family: 'film_habit',
    icon: '⚡',
    normal: { title: 'Dose Curta', desc: 'Assistir 1 Curta-Metragem (< 45 min)', target: 1, xpReward: 30, evaluatorKey: 'short_45' },
    upgraded: { title: 'Sessão Dupla de Curtas', desc: 'Assistir 2 Curtas (< 45 min)', target: 2, xpReward: 60, evaluatorKey: 'short_45' },
    downgraded: { title: 'FilmeEnxuto', desc: 'Assistir 1 filme com menos de 90 min', target: 1, xpReward: 15, evaluatorKey: 'short_90' },
  },
  {
    key: 'long_film_1',
    family: 'film_habit',
    icon: '⏳',
    normal: { title: 'Épico de Fôlego', desc: 'Assistir 1 filme longo (> 130 min)', target: 1, xpReward: 35, evaluatorKey: 'long_130' },
    upgraded: { title: 'Dupla Maratona Épica', desc: 'Assistir 2 filmes longos (> 130 min)', target: 2, xpReward: 70, evaluatorKey: 'long_130' },
    downgraded: { title: 'Sessão Estendida', desc: 'Assistir 1 filme com ≥ 105 min', target: 1, xpReward: 15, evaluatorKey: 'long_105' },
  },
  {
    key: 'foreign_subbed_1',
    family: 'film_habit',
    icon: '🌐',
    normal: { title: 'Cinema Sem Fronteiras', desc: 'Assistir 1 filme fora do eixo EUA/Brasil', target: 1, xpReward: 30, evaluatorKey: 'non_us_br' },
    upgraded: { title: 'Roteiro Internacional', desc: 'Assistir 2 filmes fora do eixo EUA/Brasil', target: 2, xpReward: 60, evaluatorKey: 'non_us_br' },
    downgraded: { title: 'Fora de Hollywood', desc: 'Assistir 1 filme produzido fora dos EUA', target: 1, xpReward: 15, evaluatorKey: 'non_us' },
  },
  {
    key: 'user_rating_8',
    family: 'film_habit',
    icon: '⭐',
    normal: { title: 'Clássico Pessoal', desc: 'Dar Minha Nota acima de 8.0 para 1 filme', target: 1, xpReward: 25, evaluatorKey: 'rating_gt_8' },
    upgraded: { title: 'Obras Memoráveis', desc: 'Dar Minha Nota acima de 8.0 em 2 filmes', target: 2, xpReward: 55, evaluatorKey: 'rating_gt_8' },
    downgraded: { title: 'Bom Entretenimento', desc: 'Dar Minha Nota ≥ 7.0 para 1 filme', target: 1, xpReward: 15, evaluatorKey: 'rating_gte_7' },
  },
  {
    key: 'classic_pre_1980',
    family: 'film_habit',
    icon: '📽️',
    normal: { title: 'Relíquia do Século XX', desc: 'Assistir 1 clássico lançado antes de 1980', target: 1, xpReward: 35, evaluatorKey: 'pre_1980' },
    upgraded: { title: 'Museu Vivo (2×)', desc: 'Assistir 2 clássicos lançados antes de 1980', target: 2, xpReward: 70, evaluatorKey: 'pre_1980' },
    downgraded: { title: 'Sessão Nostalgia', desc: 'Assistir 1 filme lançado antes de 1995', target: 1, xpReward: 20, evaluatorKey: 'pre_1995' },
  },
  {
    key: 'oscar_movie_1',
    family: 'film_habit',
    icon: '🏆',
    normal: { title: 'Tapete Vermelho', desc: 'Assistir 1 filme indicado ou vencedor do Oscar', target: 1, xpReward: 30, evaluatorKey: 'oscar_any' },
    upgraded: { title: 'Festival da Academia', desc: 'Assistir 2 filmes indicados/vencedores do Oscar', target: 2, xpReward: 60, evaluatorKey: 'oscar_any' },
    downgraded: { title: 'Destaque em Alta', desc: 'Assistir 1 Oscar OU 1 filme com Minha Nota ≥ 8.0', target: 1, xpReward: 15, evaluatorKey: 'oscar_or_8' },
  },
  {
    key: 'imdb_high_7',
    family: 'film_habit',
    icon: '💎',
    normal: { title: 'Selo IMDb Alto', desc: 'Assistir 1 filme com nota IMDb ≥ 7.0', target: 1, xpReward: 25, evaluatorKey: 'imdb_gte_70' },
    upgraded: { title: 'Dupla IMDb Alto', desc: 'Assistir 2 filmes com nota IMDb ≥ 7.0', target: 2, xpReward: 55, evaluatorKey: 'imdb_gte_70' },
    downgraded: { title: 'IMDb Sólido', desc: 'Assistir 1 filme com nota IMDb ≥ 6.2', target: 1, xpReward: 15, evaluatorKey: 'imdb_gte_62' },
  },
  {
    key: 'imdb_low_69',
    family: 'film_habit',
    icon: '🧪',
    normal: { title: 'Aposta Alternativa', desc: 'Assistir 1 filme com nota IMDb ≤ 6.9', target: 1, xpReward: 30, evaluatorKey: 'imdb_lte_69' },
    upgraded: { title: 'Sobrevivente Cult', desc: 'Assistir 2 filmes com nota IMDb ≤ 6.9', target: 2, xpReward: 60, evaluatorKey: 'imdb_lte_69' },
    downgraded: { title: 'Abaixo do Hype', desc: 'Assistir 1 filme com nota IMDb ≤ 7.4', target: 1, xpReward: 15, evaluatorKey: 'imdb_lte_74' },
  },
  {
    key: 'critic_acclaimed_1',
    family: 'film_habit',
    icon: '🍅',
    normal: { title: 'Aclamado pela Crítica', desc: 'Assistir 1 filme com Rotten ≥ 85% ou Metacritic ≥ 75', target: 1, xpReward: 35, evaluatorKey: 'critic_high' },
    upgraded: { title: 'Consenso da Crítica', desc: 'Assistir 2 filmes com Rotten ≥ 85% ou Metacritic ≥ 75', target: 2, xpReward: 70, evaluatorKey: 'critic_high' },
    downgraded: { title: 'Tomate Fresco', desc: 'Assistir 1 filme com Rotten ≥ 70% ou Metacritic ≥ 60', target: 1, xpReward: 20, evaluatorKey: 'critic_med' },
  },
  {
    key: 'hidden_gem_cult_1',
    family: 'film_habit',
    icon: '🕵️',
    normal: { title: 'Cult / Lado B', desc: 'Descobrir 1 filme com menos de 5.000 votos no TMDB', target: 1, xpReward: 35, evaluatorKey: 'votes_lt_5000' },
    upgraded: { title: 'Garimpo Profundo', desc: 'Descobrir 2 filmes com menos de 5.000 votos no TMDB', target: 2, xpReward: 75, evaluatorKey: 'votes_lt_5000' },
    downgraded: { title: 'Fora do Mainstream', desc: 'Descobrir 1 filme com menos de 15.000 votos no TMDB', target: 1, xpReward: 20, evaluatorKey: 'votes_lt_15000' },
  },
];

export const BINGO_GOAL_CATALOG: BingoGoalDefinition[] = RAW_BINGO_GOAL_CATALOG.map((g) => ({
  ...g,
  statKey: BINGO_GOAL_STAT_BY_KEY[g.key] || 'SOR',
}));

const FAMILY_BOARD_CAP: Record<BingoFamily, number> = {
  trophies: 2,
  stickers: 2,
  secret_draw: 2,
  chimera: 2,
  map_duel: 2,
  counters: 4,
  film_habit: 5,
};

let bingoTablesEnsured = false;

export async function ensureBingoTables(): Promise<void> {
  if (bingoTablesEnsured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS bingo_wallet (
      id INTEGER PRIMARY KEY DEFAULT 1,
      month_key VARCHAR(20) NOT NULL,
      forge_chips INTEGER NOT NULL DEFAULT 1,
      board_reroll_chips INTEGER NOT NULL DEFAULT 1,
      square_reroll_chips INTEGER NOT NULL DEFAULT 2,
      upgrade_chips INTEGER NOT NULL DEFAULT 1,
      downgrade_chips INTEGER NOT NULL DEFAULT 1,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bingo_boards (
      id SERIAL PRIMARY KEY,
      month_key VARCHAR(20) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'active',
      board_json JSONB NOT NULL,
      xp_awarded INTEGER NOT NULL DEFAULT 0,
      gold_awarded INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL
    );

    ALTER TABLE bingo_boards
      ADD COLUMN IF NOT EXISTS gold_awarded INTEGER NOT NULL DEFAULT 0;

    CREATE INDEX IF NOT EXISTS idx_bingo_boards_status
      ON bingo_boards (status);
  `);
  bingoTablesEnsured = true;
}

function mapBingoWalletRow(row: any, nextResetLabel: string): BingoWallet {
  return {
    monthKey: String(row.month_key),
    nextResetLabel,
    forgeChips: Math.max(0, Number(row.forge_chips ?? BINGO_WALLET_RULES.forge.allowance)),
    maxForgeChips: BINGO_WALLET_RULES.forge.max,
    boardRerollChips: Math.max(0, Number(row.board_reroll_chips ?? BINGO_WALLET_RULES.board_reroll.allowance)),
    maxBoardRerollChips: BINGO_WALLET_RULES.board_reroll.max,
    squareRerollChips: Math.max(0, Number(row.square_reroll_chips ?? BINGO_WALLET_RULES.square_reroll.allowance)),
    maxSquareRerollChips: BINGO_WALLET_RULES.square_reroll.max,
    upgradeChips: Math.max(0, Number(row.upgrade_chips ?? BINGO_WALLET_RULES.upgrade.allowance)),
    maxUpgradeChips: BINGO_WALLET_RULES.upgrade.max,
    downgradeChips: Math.max(0, Number(row.downgrade_chips ?? BINGO_WALLET_RULES.downgrade.allowance)),
    maxDowngradeChips: BINGO_WALLET_RULES.downgrade.max,
  };
}

export async function ensureBingoWallet(): Promise<BingoWallet> {
  await ensureBingoTables();
  const { monthIndex, monthKey, nextResetLabel } = getSaoPauloMonthCycleInfo();
  const curRes = await query(`SELECT * FROM bingo_wallet WHERE id = 1`);
  const row = curRes.rows[0];

  if (!row || String(row.month_key) !== monthKey) {
    const calcNext = (col: unknown, rule: { allowance: number; max: number }) =>
      row
        ? computeCycleBankedBalance({
            previousCycleKey: row.month_key,
            currentCycleIndex: monthIndex,
            currentCycleKey: monthKey,
            currentBalance: Number(col ?? 0),
            allowancePerCycle: rule.allowance,
            maxBankCap: rule.max,
          })
        : rule.allowance;

    const upd = await query(
      `INSERT INTO bingo_wallet (
         id, month_key, forge_chips, board_reroll_chips, square_reroll_chips, upgrade_chips, downgrade_chips, updated_at
       )
       VALUES (1, $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         month_key = EXCLUDED.month_key,
         forge_chips = EXCLUDED.forge_chips,
         board_reroll_chips = EXCLUDED.board_reroll_chips,
         square_reroll_chips = EXCLUDED.square_reroll_chips,
         upgrade_chips = EXCLUDED.upgrade_chips,
         downgrade_chips = EXCLUDED.downgrade_chips,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        monthKey,
        calcNext(row?.forge_chips, BINGO_WALLET_RULES.forge),
        calcNext(row?.board_reroll_chips, BINGO_WALLET_RULES.board_reroll),
        calcNext(row?.square_reroll_chips, BINGO_WALLET_RULES.square_reroll),
        calcNext(row?.upgrade_chips, BINGO_WALLET_RULES.upgrade),
        calcNext(row?.downgrade_chips, BINGO_WALLET_RULES.downgrade),
      ]
    );
    return mapBingoWalletRow(upd.rows[0], nextResetLabel);
  }

  return mapBingoWalletRow(row, nextResetLabel);
}

function shuffleArr<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const BINGO_GOLD_PER_XP_RATE = 0.85;

export function computeBingoGoldFromXp(xp: number): number {
  return Math.max(12, Math.round(Math.max(0, Number(xp || 0)) * BINGO_GOLD_PER_XP_RATE));
}

function applySquareRewardMode(
  sq: BingoSquare,
  mode: BingoRewardMode,
  basePoints: number,
  hybridGoldBoost = false
): BingoSquare {
  const cleanBase = Math.max(10, Math.round(Number(basePoints || 0)));
  if (mode === 'gold') {
    const baseGold = computeBingoGoldFromXp(cleanBase);
    const goldVal = hybridGoldBoost ? Math.max(baseGold + 2, Math.round(baseGold * 1.25)) : baseGold;
    return {
      ...sq,
      rewardMode: 'gold',
      baseXpValue: cleanBase,
      xpReward: 0,
      goldReward: goldVal,
      hybridGoldBoost,
    };
  }
  if (mode === 'hybrid') {
    const halfXp = Math.max(1, Math.round(cleanBase / 2));
    const halfGold = Math.max(6, Math.round(computeBingoGoldFromXp(cleanBase) / 2));
    return {
      ...sq,
      rewardMode: 'hybrid',
      baseXpValue: cleanBase,
      xpReward: halfXp,
      goldReward: halfGold,
      hybridGoldBoost: false,
    };
  }
  return {
    ...sq,
    rewardMode: 'xp',
    baseXpValue: cleanBase,
    xpReward: cleanBase,
    goldReward: 0,
    hybridGoldBoost: false,
  };
}

function createSquareFromDef(
  def: BingoGoalDefinition,
  index: number,
  difficultyState: BingoDifficultyState = 'normal',
  rewardMode: BingoRewardMode = 'xp',
  hybridGoldBoost = false
): BingoSquare {
  const variant = def[difficultyState];
  const baseSq: BingoSquare = {
    index,
    goalKey: def.key,
    evaluatorKey: variant.evaluatorKey,
    family: def.family,
    statKey: def.statKey || BINGO_GOAL_STAT_BY_KEY[def.key] || 'SOR',
    icon: def.icon,
    title: variant.title,
    desc: variant.desc,
    target: variant.target,
    progress: 0,
    completed: false,
    claimed: false,
    rewardMode: 'xp',
    baseXpValue: variant.xpReward,
    xpReward: variant.xpReward,
    xpAwarded: 0,
    goldReward: 0,
    goldAwarded: 0,
    hybridGoldBoost: false,
    difficultyState,
    progressMeta: { seenDecades: [], seenCountries: [], contributors: [] },
  };
  return applySquareRewardMode(baseSq, rewardMode, variant.xpReward, hybridGoldBoost);
}

function recalculateBoardState(board: BingoBoardData): BingoBoardData {
  const squares = board.squares.map((sq) => {
    const done = sq.progress >= sq.target;
    const mode: BingoRewardMode = sq.rewardMode === 'gold' || sq.rewardMode === 'hybrid' ? sq.rewardMode : 'xp';
    return {
      ...sq,
      rewardMode: mode,
      goldReward: Number(sq.goldReward || 0),
      goldAwarded: Number(sq.goldAwarded || 0),
      statKey: sq.statKey || BINGO_GOAL_STAT_BY_KEY[sq.goalKey] || 'SOR',
      completed: done,
      progress: Math.min(sq.target, Math.max(0, sq.progress)),
    };
  });

  const existingLinesMap = new Map((board.lines || []).map((l) => [l.id, l]));
  const lines: BingoLineReward[] = BINGO_LINES_SPEC.map((spec) => {
    const prev = existingLinesMap.get(spec.id);
    const allDone = spec.indices.every((idx) =>
      Boolean(squares[idx]?.completed || squares[idx]?.lineWildcard)
    );
    const lineMode: BingoRewardMode =
      prev?.rewardMode === 'gold' || prev?.rewardMode === 'hybrid' ? prev.rewardMode : 'xp';
    return {
      id: spec.id,
      label: spec.label,
      indices: spec.indices,
      completed: allDone,
      claimed: Boolean(prev?.claimed),
      rewardMode: lineMode,
      xpReward: prev?.xpReward ?? BINGO_LINE_XP,
      xpAwarded: prev?.xpAwarded ?? 0,
      goldReward: Number(prev?.goldReward || 0),
      goldAwarded: Number(prev?.goldAwarded || 0),
      hybridGoldBoost: Boolean(prev?.hybridGoldBoost),
    };
  });

  const all16Done = squares.length === 16 && squares.every((s) => s.completed);
  const blackout = {
    completed: all16Done,
    claimed: Boolean(board.blackout?.claimed),
    rewardMode: (board.blackout?.rewardMode === 'gold' || board.blackout?.rewardMode === 'hybrid'
      ? board.blackout.rewardMode
      : 'xp') as BingoRewardMode,
    xpReward: board.blackout?.xpReward ?? BINGO_BLACKOUT_XP,
    xpAwarded: board.blackout?.xpAwarded ?? 0,
    goldReward: Number(board.blackout?.goldReward || 0),
    goldAwarded: Number(board.blackout?.goldAwarded || 0),
  };

  return { squares, lines, blackout };
}

function summarizeBoardMetrics(board: BingoBoardData): {
  readyToClaimCount: number;
  readyToClaimXp: number;
  readyToClaimGold: number;
  completedSquaresCount: number;
  completedLinesCount: number;
} {
  const completedSquaresCount = board.squares.filter((s) => s.completed).length;
  const completedLinesCount = board.lines.filter((l) => l.completed).length;
  const unclaimedSquares = board.squares.filter((s) => s.completed && !s.claimed);
  const unclaimedLines = board.lines.filter((l) => l.completed && !l.claimed);
  const unclaimedBlackout = board.blackout.completed && !board.blackout.claimed;

  return {
    completedSquaresCount,
    completedLinesCount,
    readyToClaimCount: unclaimedSquares.length + unclaimedLines.length + (unclaimedBlackout ? 1 : 0),
    readyToClaimXp:
      unclaimedSquares.reduce((s, sq) => s + Number(sq.xpReward || 0), 0) +
      unclaimedLines.reduce((s, l) => s + Number(l.xpReward || 0), 0) +
      (unclaimedBlackout ? Number(board.blackout.xpReward || 0) : 0),
    readyToClaimGold:
      unclaimedSquares.reduce((s, sq) => s + Number(sq.goldReward || 0), 0) +
      unclaimedLines.reduce((s, l) => s + Number(l.goldReward || 0), 0) +
      (unclaimedBlackout ? Number(board.blackout.goldReward || 0) : 0),
  };
}

function mapBingoBoardRow(row: any): BingoBoardRecord {
  const board = recalculateBoardState(row.board_json);
  const metrics = summarizeBoardMetrics(board);
  return {
    id: Number(row.id),
    monthKey: String(row.month_key),
    status: row.status,
    board,
    xpAwarded: Number(row.xp_awarded || 0),
    goldAwarded: Number(row.gold_awarded || 0),
    ...metrics,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null,
  };
}

async function generateBalanced16Squares(
  preservedSquares: Map<number, BingoSquare> = new Map(),
  excludedGoalKeys: Set<string> = new Set()
): Promise<BingoSquare[]> {
  const familyCounts: Record<BingoFamily, number> = {
    trophies: 0,
    stickers: 0,
    secret_draw: 0,
    chimera: 0,
    map_duel: 0,
    counters: 0,
    film_habit: 0,
  };
  const usedKeys = new Set<string>(excludedGoalKeys);

  for (const sq of preservedSquares.values()) {
    familyCounts[sq.family] = (familyCounts[sq.family] || 0) + 1;
    usedKeys.add(sq.goalKey);
  }

  const pool = shuffleArr(BINGO_GOAL_CATALOG);
  const result: BingoSquare[] = new Array(16);

  for (let i = 0; i < 16; i++) {
    const fixed = preservedSquares.get(i);
    if (fixed) {
      result[i] = fixed;
      continue;
    }

    const rowIdx = Math.floor(i / 4);
    const rowFamilies = new Set<BingoFamily>();
    for (let c = 0; c < i % 4; c++) {
      const sq = result[rowIdx * 4 + c];
      if (sq) rowFamilies.add(sq.family);
    }

    // Preferência: sem repetir família na linha e dentro do limite de família na cartela
    let candidate = pool.find(
      (def) =>
        !usedKeys.has(def.key) &&
        familyCounts[def.family] < FAMILY_BOARD_CAP[def.family] &&
        !rowFamilies.has(def.family)
    );
    if (!candidate) {
      candidate = pool.find(
        (def) => !usedKeys.has(def.key) && familyCounts[def.family] < FAMILY_BOARD_CAP[def.family]
      );
    }
    if (!candidate) {
      candidate = pool.find((def) => !usedKeys.has(def.key));
    }
    if (!candidate) {
      candidate = BINGO_GOAL_CATALOG[i % BINGO_GOAL_CATALOG.length];
    }

    usedKeys.add(candidate.key);
    familyCounts[candidate.family] = (familyCounts[candidate.family] || 0) + 1;
    result[i] = createSquareFromDef(candidate, i, 'normal');
  }

  // Sorteia 1 Pergaminho Dourado (Ouro do Bazar) por fileira para criar cartelas mistas XP + Ouro!
  for (let row = 0; row < 4; row += 1) {
    const rowOpenIndices: number[] = [];
    let rowAlreadyHasGold = false;
    for (let col = 0; col < 4; col += 1) {
      const idx = row * 4 + col;
      if (result[idx]?.rewardMode === 'gold' || result[idx]?.rewardMode === 'hybrid') {
        rowAlreadyHasGold = true;
      } else if (!preservedSquares.has(idx)) {
        rowOpenIndices.push(idx);
      }
    }
    if (!rowAlreadyHasGold && rowOpenIndices.length > 0) {
      const pickIdx = rowOpenIndices[Math.floor(Math.random() * rowOpenIndices.length)];
      const basePts = Number(result[pickIdx]?.baseXpValue || result[pickIdx]?.xpReward || 35);
      result[pickIdx] = applySquareRewardMode(result[pickIdx], 'gold', basePts, false);
    }
  }

  return result;
}

export async function forgeBingoBoard(): Promise<{ board: BingoBoardRecord; wallet: BingoWallet }> {
  const wallet = await ensureBingoWallet();
  if (wallet.forgeChips <= 0) {
    throw new Error(`Suas fichas de sorteio de Bingo acabaram! Próxima ficha: ${wallet.nextResetLabel}.`);
  }

  const activeRes = await query(`SELECT * FROM bingo_boards WHERE status = 'active' LIMIT 1`);
  if (activeRes.rows.length > 0) {
    throw new Error('Já existe uma cartela de Bingo ativa! Conclua ou arquive a atual antes de sortear outra.');
  }

  const squares = await generateBalanced16Squares();
  const initialBoard = recalculateBoardState({
    squares,
    lines: [],
    blackout: { completed: false, claimed: false, xpReward: BINGO_BLACKOUT_XP, xpAwarded: 0 },
  });

  const ins = await query(
    `INSERT INTO bingo_boards (month_key, status, board_json)
     VALUES ($1, 'active', $2::jsonb)
     RETURNING *`,
    [wallet.monthKey, JSON.stringify(initialBoard)]
  );

  await query(
    `UPDATE bingo_wallet
     SET forge_chips = GREATEST(0, forge_chips - 1),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`
  );

  const nextWallet = await ensureBingoWallet();
  return {
    board: mapBingoBoardRow(ins.rows[0]),
    wallet: nextWallet,
  };
}

export async function archiveExpiredBingoBoard(boardId: number): Promise<void> {
  const wallet = await ensureBingoWallet();
  const res = await query(`SELECT * FROM bingo_boards WHERE id = $1 AND status = 'active'`, [boardId]);
  if (res.rows.length === 0) {
    throw new Error('Cartela ativa não encontrada.');
  }
  const boardMonthKey = String(res.rows[0].month_key);
  if (boardMonthKey === wallet.monthKey) {
    throw new Error('Você só pode arquivar cartelas de meses anteriores depois da virada do mês!');
  }
  await query(
    `UPDATE bingo_boards SET status = 'archived', completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP) WHERE id = $1`,
    [boardId]
  );
}

export async function applyBingoBoardAction(params: {
  boardId: number;
  action: 'board_reroll' | 'square_reroll' | 'upgrade' | 'downgrade';
  squareIndex?: number;
}): Promise<{ board: BingoBoardRecord; wallet: BingoWallet }> {
  const wallet = await ensureBingoWallet();
  const res = await query(`SELECT * FROM bingo_boards WHERE id = $1`, [params.boardId]);
  if (res.rows.length === 0) {
    throw new Error('Cartela de Bingo não encontrada.');
  }
  const current = mapBingoBoardRow(res.rows[0]);
  if (current.status !== 'active') {
    throw new Error('Apenas a cartela ativa pode receber modificadores.');
  }

  let nextBoard: BingoBoardData = {
    ...current.board,
    squares: current.board.squares.map((sq) => ({ ...sq })),
  };
  let walletColumn: string;

  if (params.action === 'board_reroll') {
    if (wallet.boardRerollChips <= 0) {
      throw new Error(`Sem ficha de Alterar Cartela Inteira (+1/mês, máx. 3). Recarga: ${wallet.nextResetLabel}.`);
    }
    const preserved = new Map<number, BingoSquare>();
    const prevOpenKeys = new Set<string>();
    for (const sq of nextBoard.squares) {
      if (sq.completed || sq.claimed) {
        preserved.set(sq.index, sq);
      } else {
        prevOpenKeys.add(sq.goalKey);
      }
    }
    if (preserved.size === 16) {
      throw new Error('Todas as 16 casas já estão concluídas!');
    }
    const regenerated = await generateBalanced16Squares(preserved, prevOpenKeys);
    nextBoard = recalculateBoardState({ ...nextBoard, squares: regenerated });
    walletColumn = 'board_reroll_chips';
  } else {
    const idx = Number(params.squareIndex);
    if (!Number.isInteger(idx) || idx < 0 || idx >= 16) {
      throw new Error('Índice de quadrado inválido (0 a 15).');
    }
    const sq = nextBoard.squares[idx];
    if (!sq) {
      throw new Error('Quadrado não encontrado.');
    }
    if (sq.completed || sq.claimed) {
      throw new Error('Não é possível alterar um quadrado já concluído.');
    }

    if (params.action === 'square_reroll') {
      if (wallet.squareRerollChips <= 0) {
        throw new Error(`Sem ficha de Trocar Quadrado (+2/mês, máx. 4). Recarga: ${wallet.nextResetLabel}.`);
      }
      const usedKeys = new Set(nextBoard.squares.map((s) => s.goalKey));
      const candidates = shuffleArr(BINGO_GOAL_CATALOG).filter((g) => !usedKeys.has(g.key));
      const replacement = candidates[0] || BINGO_GOAL_CATALOG.find((g) => g.key !== sq.goalKey);
      if (!replacement) {
        throw new Error('Não há outro desafio disponível para substituir.');
      }
      nextBoard.squares[idx] = createSquareFromDef(
        replacement,
        idx,
        'normal',
        sq.rewardMode || 'xp',
        Boolean(sq.hybridGoldBoost)
      );
      walletColumn = 'square_reroll_chips';
    } else if (params.action === 'upgrade') {
      if (wallet.upgradeChips <= 0) {
        throw new Error(`Sem ficha de Evoluir Desafio (+1/mês, máx. 3). Recarga: ${wallet.nextResetLabel}.`);
      }
      if (sq.difficultyState === 'upgraded') {
        throw new Error('Este quadrado já está evoluído ao nível máximo!');
      }
      const def = BINGO_GOAL_CATALOG.find((g) => g.key === sq.goalKey);
      if (!def) throw new Error('Definição do desafio não encontrada.');
      const nextState: BingoDifficultyState = sq.difficultyState === 'downgraded' ? 'normal' : 'upgraded';
      const upgraded = createSquareFromDef(
        def,
        idx,
        nextState,
        sq.rewardMode || 'xp',
        Boolean(sq.hybridGoldBoost)
      );
      upgraded.progress = Math.min(upgraded.target, sq.progress);
      upgraded.progressMeta = sq.progressMeta;
      nextBoard.squares[idx] = upgraded;
      walletColumn = 'upgrade_chips';
    } else {
      if (wallet.downgradeChips <= 0) {
        throw new Error(`Sem ficha de Reduzir Desafio (+1/mês, máx. 3). Recarga: ${wallet.nextResetLabel}.`);
      }
      if (sq.difficultyState === 'downgraded') {
        throw new Error('Este quadrado já está na dificuldade reduzida!');
      }
      const def = BINGO_GOAL_CATALOG.find((g) => g.key === sq.goalKey);
      if (!def) throw new Error('Definição do desafio não encontrada.');
      const nextState: BingoDifficultyState = sq.difficultyState === 'upgraded' ? 'normal' : 'downgraded';
      const downgraded = createSquareFromDef(
        def,
        idx,
        nextState,
        sq.rewardMode || 'xp',
        Boolean(sq.hybridGoldBoost)
      );
      downgraded.progress = Math.min(downgraded.target, sq.progress);
      downgraded.progressMeta = sq.progressMeta;
      nextBoard.squares[idx] = downgraded;
      walletColumn = 'downgrade_chips';
    }
    nextBoard = recalculateBoardState(nextBoard);
  }

  await query(
    `UPDATE bingo_wallet
     SET ${walletColumn} = GREATEST(0, ${walletColumn} - 1),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`
  );

  const upd = await query(
    `UPDATE bingo_boards
     SET board_json = $2::jsonb
     WHERE id = $1
     RETURNING *`,
    [params.boardId, JSON.stringify(nextBoard)]
  );

  const nextWallet = await ensureBingoWallet();
  return {
    board: mapBingoBoardRow(upd.rows[0]),
    wallet: nextWallet,
  };
}

function advanceSquaresOnActiveBoard(
  boardData: BingoBoardData,
  updater: (sq: BingoSquare) => number | null
): { changed: boolean; nextBoard: BingoBoardData; newlyCompletedSquares: BingoSquare[] } {
  let changed = false;
  const newlyCompletedSquares: BingoSquare[] = [];

  const updatedSquares = boardData.squares.map((sq) => {
    if (sq.completed) return sq;
    const copy: BingoSquare = {
      ...sq,
      progressMeta: {
        seenDecades: [...(sq.progressMeta?.seenDecades || [])],
        seenCountries: [...(sq.progressMeta?.seenCountries || [])],
        contributors: [...(sq.progressMeta?.contributors || [])],
      },
    };
    const nextProgress = updater(copy);
    if (nextProgress === null || nextProgress <= copy.progress) {
      return copy;
    }
    changed = true;
    copy.progress = Math.min(copy.target, nextProgress);
    if (copy.progress >= copy.target) {
      copy.completed = true;
      newlyCompletedSquares.push(copy);
    }
    return copy;
  });

  if (!changed) {
    return { changed: false, nextBoard: boardData, newlyCompletedSquares: [] };
  }
  return {
    changed: true,
    nextBoard: recalculateBoardState({ ...boardData, squares: updatedSquares }),
    newlyCompletedSquares,
  };
}

async function applyUpdaterToActiveBingoBoard(
  updater: (sq: BingoSquare) => number | null
): Promise<BingoBoardRecord | null> {
  await ensureBingoTables();
  const res = await query(`SELECT * FROM bingo_boards WHERE status = 'active' ORDER BY id DESC LIMIT 1`);
  if (res.rows.length === 0) return null;

  const current = mapBingoBoardRow(res.rows[0]);
  const { changed, nextBoard } = advanceSquaresOnActiveBoard(current.board, updater);
  if (!changed) return current;

  const upd = await query(
    `UPDATE bingo_boards SET board_json = $2::jsonb WHERE id = $1 RETURNING *`,
    [current.id, JSON.stringify(nextBoard)]
  );
  return mapBingoBoardRow(upd.rows[0]);
}

function normalizePlatformNorm(raw: string | null | undefined): string {
  return String(raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export async function evaluateBingoOnMovieSave(params: {
  movieId: number;
  tmdbId?: number | null;
  title: string;
  originalTitle?: string | null;
  releaseYear: number | null;
  runtime: number | null;
  voteCount: number;
  imdbRating: number | null;
  rottenTomatoesScore: number | null;
  metacriticScore: number | null;
  userRating: number | null;
  audioType: string | null;
  platform: string | null;
  reviewNotes: string | null;
  oscarWins: number;
  oscarNominations: number;
  countries: string[];
  genres: string[];
  tags: string[];
  newlyUnlockedTrophiesCount: number;
  extraTrophyStarsDelta: number;
  progressedTrophiesCount: number;
  wonYearOrCountryDuel: boolean;
  conqueredNewYearOrCountry: boolean;
  isNewMovie?: boolean;
}): Promise<BingoBoardRecord | null> {
  const movieContribKey = `m:${params.movieId}`;
  const isDubbed = normalizePlatformNorm(params.audioType).includes('dublad');
  const platNorm = normalizePlatformNorm(params.platform);
  const isPhysicalOrCinema = Boolean(platNorm && PHYSICAL_PLATFORMS.has(platNorm));
  const isStreaming = Boolean(platNorm && !isPhysicalOrCinema);

  const countryNorms = (params.countries || []).map((c) => normalizePlatformNorm(c)).filter(Boolean);
  const isNonUs = countryNorms.some((c) => c !== 'estados unidos' && c !== 'eua' && c !== 'usa' && c !== 'united states');
  const isNonUsBr = countryNorms.some(
    (c) =>
      c !== 'estados unidos' &&
      c !== 'eua' &&
      c !== 'usa' &&
      c !== 'united states' &&
      c !== 'brasil' &&
      c !== 'brazil'
  );

  const rt = Number(params.runtime || 0);
  const yr = Number(params.releaseYear || 0);
  const imdb = params.imdbRating !== null && Number.isFinite(params.imdbRating) ? Number(params.imdbRating) : null;
  const userRating = params.userRating !== null && Number.isFinite(params.userRating) ? Number(params.userRating) : null;
  const votes = Number(params.voteCount || 0);
  const hasOscar = Number(params.oscarWins || 0) > 0 || Number(params.oscarNominations || 0) > 0;
  const rotten = params.rottenTomatoesScore !== null ? Number(params.rottenTomatoesScore) : null;
  const meta = params.metacriticScore !== null ? Number(params.metacriticScore) : null;

  const universeMovieRow = {
    movie_id: params.movieId,
    title: params.title,
    original_title: params.originalTitle ?? null,
    release_year: params.releaseYear,
    poster_url: null,
    user_rating: userRating,
    imdb_rating: imdb,
    metacritic_score: meta,
    rotten_tomatoes_score: rotten,
  };
  const isUniverseMovie = UNIVERSE_SAGAS.some((saga) =>
    saga.movies.some((req) => matchUniverseMovie(universeMovieRow, req))
  );

  const addOnceByMovie = (sq: BingoSquare, amount: number): number | null => {
    if (amount <= 0) return null;
    const contribs = sq.progressMeta?.contributors || [];
    if (contribs.includes(movieContribKey)) return null;
    contribs.push(movieContribKey);
    return sq.progress + amount;
  };

  return applyUpdaterToActiveBingoBoard((sq) => {
    switch (sq.evaluatorKey) {
      case 'movie_count':
        return params.isNewMovie === false ? null : addOnceByMovie(sq, 1);
      case 'streaming_count':
        return isStreaming ? addOnceByMovie(sq, 1) : null;
      case 'physical_1':
        return isPhysicalOrCinema ? addOnceByMovie(sq, 1) : null;
      case 'dubbed_count':
        return isDubbed ? addOnceByMovie(sq, 1) : null;
      case 'short_45':
        return rt > 0 && rt < 45 ? addOnceByMovie(sq, 1) : null;
      case 'short_90':
        return rt > 0 && rt < 90 ? addOnceByMovie(sq, 1) : null;
      case 'long_130':
        return rt > 130 ? addOnceByMovie(sq, 1) : null;
      case 'long_105':
        return rt >= 105 ? addOnceByMovie(sq, 1) : null;
      case 'non_us_br':
        return isNonUsBr ? addOnceByMovie(sq, 1) : null;
      case 'non_us':
        return isNonUs ? addOnceByMovie(sq, 1) : null;
      case 'rating_gt_8':
        return userRating !== null && userRating > 8.0 ? addOnceByMovie(sq, 1) : null;
      case 'rating_gte_7':
        return userRating !== null && userRating >= 7.0 ? addOnceByMovie(sq, 1) : null;
      case 'pre_1980':
        return yr > 0 && yr < 1980 ? addOnceByMovie(sq, 1) : null;
      case 'pre_1995':
        return yr > 0 && yr < 1995 ? addOnceByMovie(sq, 1) : null;
      case 'oscar_any':
        return hasOscar ? addOnceByMovie(sq, 1) : null;
      case 'oscar_or_8':
        return hasOscar || (userRating !== null && userRating >= 8.0) ? addOnceByMovie(sq, 1) : null;
      case 'imdb_gte_70':
        return imdb !== null && imdb >= 7.0 ? addOnceByMovie(sq, 1) : null;
      case 'imdb_gte_62':
        return imdb !== null && imdb >= 6.2 ? addOnceByMovie(sq, 1) : null;
      case 'imdb_lte_69':
        return imdb !== null && imdb <= 6.9 ? addOnceByMovie(sq, 1) : null;
      case 'imdb_lte_74':
        return imdb !== null && imdb <= 7.4 ? addOnceByMovie(sq, 1) : null;
      case 'critic_high':
        return (rotten !== null && rotten >= 85) || (meta !== null && meta >= 75)
          ? addOnceByMovie(sq, 1)
          : null;
      case 'critic_med':
        return (rotten !== null && rotten >= 70) || (meta !== null && meta >= 60)
          ? addOnceByMovie(sq, 1)
          : null;
      case 'votes_lt_5000':
        return votes > 0 && votes < 5000 ? addOnceByMovie(sq, 1) : null;
      case 'votes_lt_15000':
        return votes > 0 && votes < 15000 ? addOnceByMovie(sq, 1) : null;
      case 'review_count':
        return String(params.reviewNotes || '').trim().length > 0 ? addOnceByMovie(sq, 1) : null;
      case 'genre_points': {
        const gCount = new Set((params.genres || []).map((g) => g.trim()).filter(Boolean)).size;
        return addOnceByMovie(sq, gCount);
      }
      case 'tag_points': {
        const tCount = new Set((params.tags || []).map((t) => t.trim()).filter(Boolean)).size;
        return addOnceByMovie(sq, tCount);
      }
      case 'distinct_decades': {
        if (!yr || yr < 1890) return null;
        const dec = `${Math.floor(yr / 10) * 10}s`;
        const seen = sq.progressMeta!.seenDecades!;
        if (seen.includes(dec)) return null;
        seen.push(dec);
        return seen.length;
      }
      case 'distinct_countries': {
        const seen = sq.progressMeta!.seenCountries!;
        let added = false;
        for (const c of countryNorms) {
          if (!seen.includes(c)) {
            seen.push(c);
            added = true;
          }
        }
        return added ? seen.length : null;
      }
      case 'universe_film':
        return isUniverseMovie ? addOnceByMovie(sq, 1) : null;
      case 'universe_or_8':
        return isUniverseMovie || (userRating !== null && userRating >= 8.0) ? addOnceByMovie(sq, 1) : null;
      case 'duel_win':
        return params.wonYearOrCountryDuel ? addOnceByMovie(sq, 1) : null;
      case 'new_year_country':
        return params.conqueredNewYearOrCountry ? addOnceByMovie(sq, 1) : null;
      case 'duel_or_new':
        return params.wonYearOrCountryDuel || params.conqueredNewYearOrCountry ? addOnceByMovie(sq, 1) : null;
      case 'trophy_new':
        return params.newlyUnlockedTrophiesCount > 0 ? sq.progress + params.newlyUnlockedTrophiesCount : null;
      case 'trophy_infinite':
        return params.extraTrophyStarsDelta > 0 ? sq.progress + params.extraTrophyStarsDelta : null;
      case 'trophy_new_or_inf': {
        const totalDelta = params.newlyUnlockedTrophiesCount + params.extraTrophyStarsDelta;
        return totalDelta > 0 ? sq.progress + totalDelta : null;
      }
      case 'trophy_progress':
        return params.progressedTrophiesCount > 0 ? sq.progress + params.progressedTrophiesCount : null;
      default:
        return null;
    }
  });
}

export async function evaluateBingoOnSecretDrawClaim(params: {
  pickId: number;
  difficulty: string;
}): Promise<BingoBoardRecord | null> {
  const key = `sd:${params.pickId}`;
  const isHard = ['hard', 'very_hard', 'exotic'].includes(String(params.difficulty || '').toLowerCase());
  return applyUpdaterToActiveBingoBoard((sq) => {
    if (sq.evaluatorKey === 'sd_any' || sq.evaluatorKey === 'guild_any') {
      const contribs = sq.progressMeta!.contributors!;
      if (contribs.includes(key)) return null;
      contribs.push(key);
      return sq.progress + 1;
    }
    if (sq.evaluatorKey === 'sd_hard' && isHard) {
      const contribs = sq.progressMeta!.contributors!;
      if (contribs.includes(key)) return null;
      contribs.push(key);
      return sq.progress + 1;
    }
    return null;
  });
}

export async function evaluateBingoOnChimeraClaim(params: {
  chimeraId: number;
  jackpotsHitCount: number;
}): Promise<BingoBoardRecord | null> {
  const key = `ch:${params.chimeraId}`;
  const jp = Number(params.jackpotsHitCount || 0);
  return applyUpdaterToActiveBingoBoard((sq) => {
    if (sq.evaluatorKey === 'chimera_any' || sq.evaluatorKey === 'guild_any') {
      const contribs = sq.progressMeta!.contributors!;
      if (contribs.includes(key)) return null;
      contribs.push(key);
      return sq.progress + 1;
    }
    if (sq.evaluatorKey === 'chimera_jackpot_1' && jp >= 1) {
      const contribs = sq.progressMeta!.contributors!;
      if (contribs.includes(key)) return null;
      contribs.push(key);
      return sq.progress + 1;
    }
    if (sq.evaluatorKey === 'chimera_jackpot_2' && jp >= 2) {
      const contribs = sq.progressMeta!.contributors!;
      if (contribs.includes(key)) return null;
      contribs.push(key);
      return sq.progress + 1;
    }
    return null;
  });
}

export async function evaluateBingoOnStickerGain(
  stars: Array<{ id: string; kind?: string; alameda?: string; statusTierKey?: string; extraStars?: number }>
): Promise<BingoBoardRecord | null> {
  if (!Array.isArray(stars) || stars.length === 0) return null;
  return applyUpdaterToActiveBingoBoard((sq) => {
    if (
      sq.evaluatorKey !== 'sticker_any' &&
      sq.evaluatorKey !== 'sticker_dublador' &&
      sq.evaluatorKey !== 'sticker_director' &&
      sq.evaluatorKey !== 'sticker_actor_couple'
    ) {
      return null;
    }
    const contribs = sq.progressMeta!.contributors!;
    let added = 0;
    for (const s of stars) {
      const kind = String(s.kind || '').toLowerCase();
      const alameda = String(s.alameda || '').toLowerCase();
      const matches =
        sq.evaluatorKey === 'sticker_any' ||
        (sq.evaluatorKey === 'sticker_dublador' && (kind === 'dublador' || alameda === 'vozes')) ||
        (sq.evaluatorKey === 'sticker_director' && (kind === 'director' || alameda === 'diretores')) ||
        (sq.evaluatorKey === 'sticker_actor_couple' &&
          (kind === 'actor' || kind === 'group' || alameda === 'brasil' || alameda === 'hollywood' || alameda === 'casais' || alameda === 'grupos'));
      if (!matches) continue;
      const contribKey = `st:${s.id}:${s.statusTierKey || 'base'}:${Number(s.extraStars || 0)}`;
      if (!contribs.includes(contribKey)) {
        contribs.push(contribKey);
        added += 1;
      }
    }
    return added > 0 ? sq.progress + added : null;
  });
}

export async function claimBingoReward(params: {
  boardId: number;
  targetType: 'square' | 'line' | 'blackout' | 'all';
  targetId?: string | number;
}): Promise<{
  board: BingoBoardRecord;
  claimedXp: number;
  claimedGold: number;
  goldenLoupeBonusGold: number;
  bazaarStatus: any;
}> {
  await ensureBingoTables();
  const res = await query(`SELECT * FROM bingo_boards WHERE id = $1`, [params.boardId]);
  if (res.rows.length === 0) {
    throw new Error('Cartela de Bingo não encontrada.');
  }
  const current = mapBingoBoardRow(res.rows[0]);
  const board: BingoBoardData = {
    squares: current.board.squares.map((s) => ({ ...s })),
    lines: current.board.lines.map((l) => ({ ...l })),
    blackout: { ...current.board.blackout },
  };

  let claimedXp = 0;
  let baseClaimedGold = 0;

  const claimSquareObj = (sq: BingoSquare) => {
    const xpVal = Number(sq.xpReward || 0);
    const goldVal = Number(sq.goldReward || 0);
    sq.claimed = true;
    sq.xpAwarded = xpVal;
    sq.goldAwarded = goldVal;
    claimedXp += xpVal;
    baseClaimedGold += goldVal;
  };

  const claimLineObj = (line: BingoLineReward) => {
    const xpVal = Number(line.xpReward || 0);
    const goldVal = Number(line.goldReward || 0);
    line.claimed = true;
    line.xpAwarded = xpVal;
    line.goldAwarded = goldVal;
    claimedXp += xpVal;
    baseClaimedGold += goldVal;
  };

  if (params.targetType === 'all') {
    for (const sq of board.squares) {
      if (sq.completed && !sq.claimed) claimSquareObj(sq);
    }
    for (const line of board.lines) {
      if (line.completed && !line.claimed) claimLineObj(line);
    }
    if (board.blackout.completed && !board.blackout.claimed) {
      const bXp = Number(board.blackout.xpReward || 0);
      const bGold = Number(board.blackout.goldReward || 0);
      board.blackout.claimed = true;
      board.blackout.xpAwarded = bXp;
      board.blackout.goldAwarded = bGold;
      claimedXp += bXp;
      baseClaimedGold += bGold;
    }
  } else if (params.targetType === 'square') {
    const idx = Number(params.targetId);
    const sq = board.squares[idx];
    if (!sq || !sq.completed) throw new Error('Esta casa ainda não foi concluída.');
    if (sq.claimed) throw new Error('A recompensa desta casa já foi colhida.');
    claimSquareObj(sq);
  } else if (params.targetType === 'line') {
    const line = board.lines.find((l) => l.id === String(params.targetId));
    if (!line || !line.completed) throw new Error('Esta linha ainda não está completa.');
    if (line.claimed) throw new Error('Bônus desta linha já foi colhido.');
    claimLineObj(line);
  } else if (params.targetType === 'blackout') {
    if (!board.blackout.completed) throw new Error('A Cartela Cheia ainda não foi completada.');
    if (board.blackout.claimed) throw new Error('Bônus de Cartela Cheia já foi colhido.');
    const bXp = Number(board.blackout.xpReward || 0);
    const bGold = Number(board.blackout.goldReward || 0);
    board.blackout.claimed = true;
    board.blackout.xpAwarded = bXp;
    board.blackout.goldAwarded = bGold;
    claimedXp += bXp;
    baseClaimedGold += bGold;
  }

  if (claimedXp <= 0 && baseClaimedGold <= 0) {
    throw new Error('Nenhuma recompensa pronta para colheita no momento.');
  }

  let claimedGold = baseClaimedGold;
  let goldenLoupeBonusGold = 0;
  let bazaarStatus: any = null;
  if (baseClaimedGold > 0) {
    const loupe = await applyGoldenLoupeBonus(baseClaimedGold);
    claimedGold = loupe.finalGold;
    goldenLoupeBonusGold = loupe.bonusGold;
    bazaarStatus = await grantGuildBazaarCoins(claimedGold);
  }

  const totalBoardXp =
    board.squares.reduce((s, sq) => s + Number(sq.xpAwarded || 0), 0) +
    board.lines.reduce((s, l) => s + Number(l.xpAwarded || 0), 0) +
    Number(board.blackout.xpAwarded || 0);

  const totalBoardGold =
    Number(current.goldAwarded || 0) + claimedGold;

  const allHarvested =
    board.squares.every((s) => s.completed && s.claimed) &&
    board.lines.every((l) => l.completed && l.claimed) &&
    board.blackout.completed &&
    board.blackout.claimed;

  const upd = await query(
    `UPDATE bingo_boards
     SET board_json = $2::jsonb,
         xp_awarded = $3,
         gold_awarded = $4,
         status = CASE WHEN $5::boolean THEN 'completed' ELSE status END,
         completed_at = CASE WHEN $5::boolean THEN CURRENT_TIMESTAMP ELSE completed_at END
     WHERE id = $1
     RETURNING *`,
    [params.boardId, JSON.stringify(board), totalBoardXp, totalBoardGold, allHarvested]
  );

  return {
    board: mapBingoBoardRow(upd.rows[0]),
    claimedXp,
    claimedGold,
    goldenLoupeBonusGold,
    bazaarStatus,
  };
}

export async function labAddBingoChip(chipType: BingoChipType | 'all' = 'forge', amount = 1): Promise<BingoWallet> {
  await ensureBingoWallet();
  const add = Math.max(1, Math.min(10, Math.floor(Number(amount) || 1)));
  if (chipType === 'all') {
    await query(
      `UPDATE bingo_wallet
       SET forge_chips = COALESCE(forge_chips, 0) + $1,
           board_reroll_chips = COALESCE(board_reroll_chips, 0) + $1,
           square_reroll_chips = COALESCE(square_reroll_chips, 0) + $1,
           upgrade_chips = COALESCE(upgrade_chips, 0) + $1,
           downgrade_chips = COALESCE(downgrade_chips, 0) + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`,
      [add]
    );
    return ensureBingoWallet();
  }
  const colMap: Record<BingoChipType, string> = {
    forge: 'forge_chips',
    board_reroll: 'board_reroll_chips',
    square_reroll: 'square_reroll_chips',
    upgrade: 'upgrade_chips',
    downgrade: 'downgrade_chips',
  };
  const col = colMap[chipType] || 'forge_chips';
  await query(
    `UPDATE bingo_wallet SET ${col} = COALESCE(${col}, 0) + $1, updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
    [add]
  );
  return ensureBingoWallet();
}

export async function labSimulateBingoProgress(params: {
  boardId: number;
  mode: 'complete_square' | 'complete_line' | 'advance_all' | 'almost_blackout';
  squareIndex?: number;
}): Promise<BingoBoardRecord> {
  await ensureBingoTables();
  const res = await query(`SELECT * FROM bingo_boards WHERE id = $1`, [params.boardId]);
  if (res.rows.length === 0) throw new Error('Cartela não encontrada.');
  const current = mapBingoBoardRow(res.rows[0]);
  if (current.status !== 'active') throw new Error('Selecione uma cartela ativa.');

  const squares = current.board.squares.map((sq) => ({ ...sq }));

  if (params.mode === 'complete_square') {
    const idx =
      params.squareIndex !== undefined && Number.isInteger(Number(params.squareIndex))
        ? Number(params.squareIndex)
        : squares.find((s) => !s.completed)?.index ?? 0;
    if (squares[idx]) {
      squares[idx].progress = squares[idx].target;
      squares[idx].completed = true;
    }
  } else if (params.mode === 'complete_line') {
    const firstIncompleteLine = current.board.lines.find((l) => !l.completed) || current.board.lines[0];
    for (const idx of firstIncompleteLine.indices) {
      squares[idx].progress = squares[idx].target;
      squares[idx].completed = true;
    }
  } else if (params.mode === 'almost_blackout') {
    const incompleteIndices = squares.filter((s) => !s.completed).map((s) => s.index);
    const leaveLastIdx = incompleteIndices.length > 0 ? incompleteIndices[incompleteIndices.length - 1] : 15;
    for (const sq of squares) {
      if (sq.index !== leaveLastIdx) {
        sq.progress = sq.target;
        sq.completed = true;
      }
    }
  } else {
    for (const sq of squares) {
      if (!sq.completed) {
        sq.progress = Math.min(sq.target, sq.progress + 1);
        sq.completed = sq.progress >= sq.target;
      }
    }
  }

  const nextBoard = recalculateBoardState({ ...current.board, squares });
  const upd = await query(
    `UPDATE bingo_boards SET board_json = $2::jsonb WHERE id = $1 RETURNING *`,
    [current.id, JSON.stringify(nextBoard)]
  );
  return mapBingoBoardRow(upd.rows[0]);
}

export async function labSimulateBingoMonthRollover(): Promise<BingoWallet> {
  await ensureBingoWallet();
  const { monthIndex } = getSaoPauloMonthCycleInfo();
  const prevIdx = monthIndex - 1;
  const py = Math.floor(prevIdx / 12);
  const pm = ((prevIdx % 12) + 12) % 12 + 1;
  const prevMonthKey = `M-${py}-${String(pm).padStart(2, '0')}`;

  await query(`UPDATE bingo_wallet SET month_key = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 1`, [prevMonthKey]);
  await query(`UPDATE bingo_boards SET month_key = $1 WHERE status = 'active'`, [prevMonthKey]);
  return ensureBingoWallet();
}

export async function labResetBingo(): Promise<void> {
  await ensureBingoTables();
  await query(`DELETE FROM bingo_boards`);
  const { monthKey } = getSaoPauloMonthCycleInfo();
  await query(
    `INSERT INTO bingo_wallet (
       id, month_key, forge_chips, board_reroll_chips, square_reroll_chips, upgrade_chips, downgrade_chips, updated_at
     )
     VALUES (1, $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE SET
       month_key = EXCLUDED.month_key,
       forge_chips = EXCLUDED.forge_chips,
       board_reroll_chips = EXCLUDED.board_reroll_chips,
       square_reroll_chips = EXCLUDED.square_reroll_chips,
       upgrade_chips = EXCLUDED.upgrade_chips,
       downgrade_chips = EXCLUDED.downgrade_chips,
       updated_at = CURRENT_TIMESTAMP`,
    [
      monthKey,
      BINGO_WALLET_RULES.forge.allowance,
      BINGO_WALLET_RULES.board_reroll.allowance,
      BINGO_WALLET_RULES.square_reroll.allowance,
      BINGO_WALLET_RULES.upgrade.allowance,
      BINGO_WALLET_RULES.downgrade.allowance,
    ]
  );
}

const roundBingoTenths = (v: number): number => Math.round(v * 10) / 10;

export async function getQuickBingoXpSummary(): Promise<BingoXpSummary> {
  try {
    await ensureBingoTables();
    const res = await query(
      `SELECT id, month_key, status, xp_awarded, gold_awarded, board_json, completed_at, created_at
       FROM bingo_boards
       WHERE xp_awarded > 0 OR gold_awarded > 0
       ORDER BY id ASC`
    );

    let totalXp = 0;
    let completedBoardsCount = 0;
    let claimedRewardsCount = 0;
    let claimedSquaresTotal = 0;
    const statPoints: BingoStatPoints = { ...EMPTY_BINGO_STAT_POINTS };
    const claimedMap: BingoXpSummary['claimedMap'] = {};

    for (const row of res.rows || []) {
      const xp = Math.max(0, Number(row.xp_awarded || 0));
      totalXp += xp;
      if (row.status === 'completed') completedBoardsCount += 1;
      const b = recalculateBoardState(row.board_json);
      const claimedSquares = b.squares.filter((s) => s.claimed);
      claimedSquaresTotal += claimedSquares.length;
      claimedRewardsCount +=
        claimedSquares.length +
        b.lines.filter((l) => l.claimed).length +
        (b.blackout.claimed ? 1 : 0);

      for (const sq of claimedSquares) {
        const pts =
          sq.difficultyState === 'upgraded'
            ? 0.2
            : sq.difficultyState === 'downgraded'
              ? sq.preserveNormalStat
                ? 0.1
                : 0
              : 0.1;
        if (pts > 0) {
          const statKey = sq.statKey || BINGO_GOAL_STAT_BY_KEY[sq.goalKey] || 'SOR';
          statPoints[statKey] += pts;
        }
      }

      claimedMap[`bingo_${row.id}`] = {
        boardId: Number(row.id),
        monthKey: String(row.month_key),
        xp,
        completedSquares: b.squares.filter((s) => s.completed).length,
        completedLines: b.lines.filter((l) => l.completed).length,
        updatedAt: (row.completed_at || row.created_at)
          ? new Date(row.completed_at || row.created_at).toISOString()
          : null,
      };
    }

    const keys: BingoRpgStatKey[] = ['AGI', 'INT', 'DES', 'SOR', 'VIT', 'FOR', 'CAR'];
    let sumTotal = 0;
    for (const k of keys) {
      statPoints[k] = roundBingoTenths(statPoints[k]);
      sumTotal += statPoints[k];
    }
    statPoints.total = roundBingoTenths(sumTotal);

    return {
      completedBoardsCount,
      claimedRewardsCount,
      claimedSquaresTotal,
      totalXp,
      statPoints,
      claimedMap,
    };
  } catch {
    return EMPTY_BINGO_XP_SUMMARY;
  }
}

export async function getBingoStatus(): Promise<{
  wallet: BingoWallet;
  activeBoard: BingoBoardRecord | null;
  history: BingoBoardRecord[];
  xpSummary: BingoXpSummary;
  readyToClaimCount: number;
  goalCatalogCount: number;
  goalCatalog: BingoGoalDefinition[];
}> {
  await ensureBingoTables();
  const [wallet, rowsRes, xpSummary] = await Promise.all([
    ensureBingoWallet(),
    query(`SELECT * FROM bingo_boards ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, id DESC LIMIT 20`),
    getQuickBingoXpSummary(),
  ]);

  const mapped = (rowsRes.rows || []).map(mapBingoBoardRow);
  const activeBoard = mapped.find((b) => b.status === 'active') || null;
  const history = mapped.filter((b) => b.status !== 'active');

  return {
    wallet,
    activeBoard,
    history,
    xpSummary,
    readyToClaimCount: activeBoard ? activeBoard.readyToClaimCount : 0,
    goalCatalogCount: BINGO_GOAL_CATALOG.length,
    goalCatalog: BINGO_GOAL_CATALOG,
  };
}

function buildNormalSquareFromCatalogDef(def: BingoGoalDefinition, index: number): BingoSquare {
  return {
    index,
    goalKey: def.key,
    evaluatorKey: def.normal.evaluatorKey,
    family: def.family,
    statKey: def.statKey,
    icon: def.icon,
    title: def.normal.title,
    desc: def.normal.desc,
    target: def.normal.target,
    progress: 0,
    completed: false,
    claimed: false,
    xpReward: def.normal.xpReward,
    xpAwarded: 0,
    difficultyState: 'normal',
    progressMeta: {
      seenDecades: [],
      seenCountries: [],
      contributors: [],
    },
  };
}

function isPassportDiplomaticSquare(sq: BingoSquare): boolean {
  const allowedKeys = new Set([
    'new_year_or_country',
    'decades_4',
    'countries_4',
    'foreign_subbed_1',
    'classic_pre_1980',
    'hidden_gem_cult_1',
    'imdb_low_69',
  ]);
  if (allowedKeys.has(sq.goalKey)) return true;
  if (sq.statKey === 'DES') return true;
  const ev = String(sq.evaluatorKey || '');
  return (
    ev.includes('country') ||
    ev.includes('decade') ||
    ev.includes('pre_19') ||
    ev.includes('non_us') ||
    ev.includes('votes_lt_')
  );
}

export async function activateBingoClassPower(params: {
  classId: string;
  boardId?: number;
  squareIndex?: number;
  chosenGoalKey?: string;
}): Promise<{
  message: string;
  effectLabel: string;
  status: Awaited<ReturnType<typeof getBingoStatus>>;
  classPowerWallet: ClassPowerWalletStatus;
}> {
  await ensureBingoTables();
  await ensureBingoWallet();
  await assertClassPowerChargeAvailable('bingo');

  const classId = String(params.classId || '').trim();
  if (!classId) {
    throw new Error('Classe não informada para ativar o poder.');
  }

  const boardQuery = params.boardId
    ? `SELECT * FROM bingo_boards WHERE id = $1 AND status = 'active' LIMIT 1`
    : `SELECT * FROM bingo_boards WHERE status = 'active' ORDER BY id DESC LIMIT 1`;
  const boardRes = await query(boardQuery, params.boardId ? [params.boardId] : []);
  if (!boardRes.rows.length) {
    throw new Error('Nenhum Pergaminho da Guilda ativo no momento. Abra a mesa do mês primeiro!');
  }

  const row = boardRes.rows[0];
  let board: BingoBoardData = recalculateBoardState(row.board_json);

  const requireOpenSquare = (): { idx: number; sq: BingoSquare; def: BingoGoalDefinition | undefined } => {
    const idx = Number(params.squareIndex);
    if (!Number.isInteger(idx) || idx < 0 || idx >= 16 || !board.squares[idx]) {
      throw new Error('Selecione um pergaminho válido (0 a 15) na mesa para aplicar o poder.');
    }
    const sq = { ...board.squares[idx] };
    if (sq.claimed) {
      throw new Error('Este pergaminho já foi reivindicado. Escolha um contrato em aberto.');
    }
    if (sq.completed) {
      throw new Error('Este pergaminho já está concluído! Escolha um contrato em aberto.');
    }
    const def = BINGO_GOAL_CATALOG.find((g) => g.key === sq.goalKey);
    return { idx, sq, def };
  };

  let message = '';
  let effectLabel = '';
  let boardMutated = false;

  switch (classId) {
    case 'andarilho_setima_arte': {
      const { idx, sq } = requireOpenSquare();
      if (sq.target <= 1) {
        throw new Error('Este contrato já possui meta 1 — selecione um contrato com meta ≥ 2.');
      }
      const delta = sq.target >= 8 ? 3 : 1;
      sq.target = Math.max(1, sq.target - delta);
      sq.desc = `${sq.desc} (Mochila: -${delta} meta)`;
      board.squares[idx] = sq;
      boardMutated = true;
      effectLabel = `🎒 Mochila de Improviso (-${delta} meta)`;
      message = `Mochila de Improviso reduziu a meta de "${sq.title}" em -${delta} (novo alvo: ${sq.target}).`;
      break;
    }

    case 'barbaro_imax': {
      const { idx, sq } = requireOpenSquare();
      if (sq.target <= 1) {
        throw new Error('O Balde Gigante não atua em metas de valor 1 — escolha um contrato com meta ≥ 2.');
      }
      const prevProg = sq.progress;
      sq.progress = Math.min(sq.target, sq.progress + 2);
      board.squares[idx] = sq;
      boardMutated = true;
      effectLabel = '🥤 Balde Gigante (+2 progresso)';
      message = `Balde Gigante avançou "${sq.title}" de ${prevProg}/${sq.target} para ${sq.progress}/${sq.target}!`;
      break;
    }

    case 'sicario_telonas': {
      const { idx, sq } = requireOpenSquare();
      if (sq.target <= 1) {
        throw new Error('O Corte Rápido exige um contrato com meta ≥ 2.');
      }
      const cut = Math.max(1, Math.round(sq.target * 0.25));
      sq.target = Math.max(1, sq.target - cut);
      sq.desc = `${sq.desc} (Corte: -${cut})`;
      board.squares[idx] = sq;
      boardMutated = true;
      effectLabel = `✂️ Corte Rápido (-${cut} meta)`;
      message = `Corte Rápido reduziu a meta de "${sq.title}" em -25% (-${cut}, novo alvo: ${sq.target}).`;
      break;
    }

    case 'bardo_herbert_richers': {
      const { idx, sq, def } = requireOpenSquare();
      if (sq.difficultyState === 'downgraded') {
        throw new Error('Este contrato já está no nível reduzido (❄️ -Dif). Escolha outro contrato.');
      }
      const normalXp = def ? def.normal.xpReward : sq.xpReward;
      if (def?.downgraded) {
        const sameEvaluator = def.downgraded.evaluatorKey === sq.evaluatorKey;
        sq.title = def.downgraded.title;
        sq.desc = `${def.downgraded.desc} (Dublagem Clássica: XP Normal & +0.1 atributo preservados!)`;
        sq.target = def.downgraded.target;
        sq.evaluatorKey = def.downgraded.evaluatorKey;
        if (!sameEvaluator) {
          sq.progress = Math.min(sq.target, sq.progress);
          sq.progressMeta = { seenDecades: [], seenCountries: [], contributors: [] };
        }
      } else {
        sq.target = Math.max(1, sq.target - 1);
      }
      sq.difficultyState = 'downgraded';
      sq.xpReward = Math.max(sq.xpReward, normalXp);
      sq.preserveNormalStat = true;
      board.squares[idx] = sq;
      boardMutated = true;
      effectLabel = '🎙️ Versão Brasileira (-Dif com XP & Atributo Normal)';
      message = `Versão Brasileira aliviou "${sq.title}" preservando ${sq.xpReward} XP e +0.1 ${sq.statKey}!`;
      break;
    }

    case 'corsario_sete_mares': {
      const { idx, sq } = requireOpenSquare();
      const usedKeys = new Set(board.squares.map((s) => s.goalKey));
      let candidates = BINGO_GOAL_CATALOG.filter((g) => !usedKeys.has(g.key));
      if (!candidates.length) {
        candidates = BINGO_GOAL_CATALOG.filter((g) => g.key !== sq.goalKey);
      }
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      if (!chosen) {
        throw new Error('Nenhum contrato alternativo disponível no Grimório.');
      }
      board.squares[idx] = buildNormalSquareFromCatalogDef(chosen, idx);
      boardMutated = true;
      effectLabel = `🗺️ Mapa Rasgado → ${chosen.normal.title}`;
      message = `Mapa Rasgado substituiu "${sq.title}" por "${chosen.normal.title}" grátis!`;
      break;
    }

    case 'vampiro_madrugada': {
      const { idx, sq } = requireOpenSquare();
      sq.xpReward += 20;
      sq.desc = `${sq.desc} (+20 XP Sede Noturna)`;
      board.squares[idx] = sq;
      boardMutated = true;
      effectLabel = '🌙 Sede Noturna (+20 XP)';
      message = `Sede Noturna enriqueceu "${sq.title}" para ${sq.xpReward} XP!`;
      break;
    }

    case 'carnical_grindhouse': {
      const { idx, sq, def } = requireOpenSquare();
      if (sq.difficultyState === 'upgraded') {
        throw new Error('Este contrato já está em 🔥 +Dif!');
      }
      if (sq.difficultyState === 'downgraded' && def) {
        sq.title = def.normal.title;
        sq.desc = def.normal.desc;
        sq.target = def.normal.target;
        sq.evaluatorKey = def.normal.evaluatorKey;
      }
      const maxXp = def ? Math.max(def.upgraded.xpReward, sq.xpReward + 25) : sq.xpReward + 35;
      sq.difficultyState = 'upgraded';
      sq.xpReward = maxXp;
      sq.preserveNormalStat = false;
      sq.desc = `${sq.desc} (Banho de Sangue: 🔥 +Dif com meta Normal!)`;
      board.squares[idx] = sq;
      boardMutated = true;
      effectLabel = '🩸 Banho de Sangue (🔥 +Dif / Meta Normal)';
      message = `Banho de Sangue elevou "${sq.title}" para 🔥 +Dif (${sq.xpReward} XP e +0.2 ${sq.statKey}) mantendo a meta ${sq.target}!`;
      break;
    }

    case 'cacador_trufas': {
      const { idx, sq } = requireOpenSquare();
      const prevProg = sq.progress;
      sq.progress = Math.min(sq.target, sq.progress + 1);
      board.squares[idx] = sq;
      boardMutated = true;
      effectLabel = '⛏️ Garimpo Fino (+1 avanço)';
      message =
        sq.target === 1
          ? `Garimpo Fino desenterrou e concluiu "${sq.title}" (${sq.progress}/${sq.target})!`
          : `Garimpo Fino avançou "${sq.title}" de ${prevProg}/${sq.target} para ${sq.progress}/${sq.target}!`;
      break;
    }

    case 'cartografo_195_reinos': {
      const { idx, sq } = requireOpenSquare();
      if (!isPassportDiplomaticSquare(sq)) {
        throw new Error(
          'Passaporte Diplomático só pode ser aplicado em contratos de Países, Anos, Fronteiras ou Cult/Lado B.'
        );
      }
      const prevProg = sq.progress;
      sq.progress = sq.target === 1 ? 1 : Math.min(sq.target, sq.progress + 2);
      board.squares[idx] = sq;
      boardMutated = true;
      effectLabel = '🛂 Passaporte Diplomático';
      message = `Passaporte Diplomático carimbou "${sq.title}" (${prevProg}/${sq.target} → ${sq.progress}/${sq.target})!`;
      break;
    }

    case 'sacerdote_cinefilo': {
      const { idx, sq } = requireOpenSquare();
      if (sq.target <= 1) {
        throw new Error('Água Benta exige um contrato com meta ≥ 2.');
      }
      const cut = Math.max(1, Math.round(sq.target * 0.35));
      sq.target = Math.max(1, sq.target - cut);
      sq.desc = `${sq.desc} (Água Benta: -${cut} meta)`;
      board.squares[idx] = sq;
      boardMutated = true;
      effectLabel = `💧 Água Benta (-${cut} meta)`;
      message = `Água Benta abençoou "${sq.title}" reduzindo a exigência em -35% (novo alvo: ${sq.target}).`;
      break;
    }

    case 'monge_tres_casas': {
      const { idx, sq } = requireOpenSquare();
      if (sq.target <= 1) {
        throw new Error('A Balança Micrométrica exige um contrato com meta ≥ 2.');
      }
      const oldTarget = sq.target;
      sq.target = Math.max(1, Math.floor(sq.target / 2));
      sq.desc = `${sq.desc} (Balança: ${oldTarget}→${sq.target})`;
      board.squares[idx] = sq;
      boardMutated = true;
      effectLabel = `⚖️ Balança Micrométrica (${oldTarget}→${sq.target})`;
      message = `Balança Micrométrica cortou a meta de "${sq.title}" pela metade: ${oldTarget} → ${sq.target}!`;
      break;
    }

    case 'cavaleiro_laser_azul': {
      await query(
        `UPDATE bingo_wallet
         SET square_reroll_chips = square_reroll_chips + 1,
             upgrade_chips = upgrade_chips + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = (SELECT id FROM bingo_wallet ORDER BY id ASC LIMIT 1)`
      );
      effectLabel = '✨ Laser Limpo (+1 Trocar 1 & +1 +Dif)';
      message = 'Laser Limpo adicionou +1 ficha de Trocar 1 Contrato e +1 Sinete 🔥 +Dif ao seu estoque do mês!';
      break;
    }

    case 'algoz_tomatometro': {
      const { idx, sq } = requireOpenSquare();
      sq.xpReward += 25;
      if (sq.target > 1) {
        sq.target = Math.max(1, sq.target - 1);
      } else {
        sq.progress = Math.min(sq.target, sq.progress + 1);
      }
      sq.desc = `${sq.desc} (Caneta Vermelha: +25 XP)`;
      board.squares[idx] = sq;
      boardMutated = true;
      effectLabel = '🖊️ Caneta Vermelha (+25 XP & ajuste)';
      message = `Caneta Vermelha deu +25 XP a "${sq.title}" (${sq.xpReward} XP total) e suavizou sua meta (${sq.progress}/${sq.target})!`;
      break;
    }

    case 'gladiador_ps5': {
      const { idx, sq } = requireOpenSquare();
      if (sq.lineWildcard) {
        throw new Error('Este contrato já possui o Lacre de Ferro (Coringa). Escolha outro.');
      }
      sq.lineWildcard = true;
      sq.desc = `${sq.desc} [⚔️ Lacre de Ferro: conta como Coringa para fechar Fileiras]`;
      board.squares[idx] = sq;
      boardMutated = true;
      effectLabel = '⚔️ Lacre de Ferro (Coringa de Fileira)';
      message = `Lacre de Ferro cravado em "${sq.title}"! Ele já conta como Coringa para fechar as Fileiras (+75 XP) que passam por ele.`;
      break;
    }

    case 'arquimago_tempo': {
      const { idx, sq } = requireOpenSquare();
      const prevProg = sq.progress;
      sq.progress = Math.min(sq.target, sq.progress + 2);
      board.squares[idx] = sq;
      boardMutated = true;
      effectLabel = '⌛ Ampulheta Arcana (+2 progresso)';
      message = `Ampulheta Arcana adiantou o tempo de "${sq.title}" (${prevProg}/${sq.target} → ${sq.progress}/${sq.target})!`;
      break;
    }

    case 'paladino_oscar': {
      const { idx, sq, def } = requireOpenSquare();
      if (sq.difficultyState === 'upgraded' && sq.target <= 1) {
        throw new Error('Este contrato já está em 🔥 +Dif com meta mínima 1.');
      }
      if (def?.upgraded && sq.difficultyState !== 'upgraded') {
        sq.title = def.upgraded.title;
        sq.desc = def.upgraded.desc;
        sq.target = def.upgraded.target;
        sq.xpReward = def.upgraded.xpReward;
        sq.evaluatorKey = def.upgraded.evaluatorKey;
        sq.progressMeta = { seenDecades: [], seenCountries: [], contributors: [] };
        sq.progress = Math.min(sq.target, sq.progress);
      } else if (sq.difficultyState !== 'upgraded') {
        sq.xpReward += 35;
      }
      sq.difficultyState = 'upgraded';
      sq.preserveNormalStat = false;
      if (sq.target > 1) {
        const cut = Math.max(1, Math.round(sq.target * 0.25));
        sq.target = Math.max(1, sq.target - cut);
      }
      sq.desc = `${sq.desc} (Estatueta Dourada: +Dif & -25% meta)`;
      board.squares[idx] = sq;
      boardMutated = true;
      effectLabel = '🏆 Estatueta Dourada (🔥 +Dif & -25% meta)';
      message = `Estatueta Dourada promoveu "${sq.title}" para 🔥 +Dif (${sq.xpReward} XP) e reduziu a meta para ${sq.target}!`;
      break;
    }

    case 'cronista_creditos_pos': {
      const { idx, sq } = requireOpenSquare();
      const chosenKey = String(params.chosenGoalKey || '').trim();
      if (!chosenKey) {
        throw new Error('Escolha no Grimório qual missão deseja escrever com a Super Ficha do Cartório.');
      }
      const chosenDef = BINGO_GOAL_CATALOG.find((g) => g.key === chosenKey);
      if (!chosenDef) {
        throw new Error('Missão escolhida não encontrada no Grimório dos Pergaminhos.');
      }
      const duplicateOnBoard = board.squares.some((s, i) => i !== idx && s.goalKey === chosenKey);
      if (duplicateOnBoard) {
        throw new Error('Essa missão já está em outro pergaminho desta mesa. Escolha outra do Grimório!');
      }
      board.squares[idx] = buildNormalSquareFromCatalogDef(chosenDef, idx);
      boardMutated = true;
      effectLabel = `📜 Super Ficha → ${chosenDef.normal.title}`;
      message = `Super Ficha do Cartório reescreveu "${sq.title}" diretamente para "${chosenDef.normal.title}"!`;
      break;
    }

    case 'alquimista_maratonas': {
      const openSquares = board.squares
        .map((sq, idx) => ({ sq: { ...sq }, idx }))
        .filter((item) => !item.sq.completed && !item.sq.claimed);
      if (!openSquares.length) {
        throw new Error('Todos os 16 pergaminhos desta mesa já foram concluídos!');
      }
      const prioritized = [
        ...openSquares.filter((item) => item.sq.target > 1),
        ...openSquares.filter((item) => item.sq.target <= 1),
      ].slice(0, 3);

      const touchedTitles: string[] = [];
      for (const item of prioritized) {
        const inc = item.sq.target >= 8 ? 3 : 1;
        item.sq.progress = Math.min(item.sq.target, item.sq.progress + inc);
        board.squares[item.idx] = item.sq;
        touchedTitles.push(`${item.sq.title} (${item.sq.progress}/${item.sq.target})`);
      }
      boardMutated = true;
      effectLabel = `🧫 Elixir Triplo (${prioritized.length} contratos)`;
      message = `Elixir Triplo destilou progresso em ${prioritized.length} contratos: ${touchedTitles.join(' • ')}`;
      break;
    }

    case 'oraculo_pelicula': {
      const { idx, sq } = requireOpenSquare();
      sq.xpReward += 35;
      sq.progress = Math.min(sq.target, sq.progress + 1);
      sq.desc = `${sq.desc} (Profecia: +35 XP)`;
      board.squares[idx] = sq;
      boardMutated = true;
      effectLabel = '✨ Profecia do Sinete (+35 XP & +1)';
      message = `Profecia do Sinete abençoou "${sq.title}" (+35 XP → ${sq.xpReward} XP) e avançou para ${sq.progress}/${sq.target}!`;
      break;
    }

    case 'arquiteto_multiverso': {
      const { idx, sq, def } = requireOpenSquare();
      if (sq.difficultyState === 'upgraded' && sq.target <= 1) {
        throw new Error('Este contrato já está no auge (🔥 +Dif e meta 1).');
      }
      if (def?.upgraded && sq.difficultyState !== 'upgraded') {
        sq.title = def.upgraded.title;
        sq.desc = def.upgraded.desc;
        sq.target = def.upgraded.target;
        sq.xpReward = def.upgraded.xpReward;
        sq.evaluatorKey = def.upgraded.evaluatorKey;
        sq.progressMeta = { seenDecades: [], seenCountries: [], contributors: [] };
        sq.progress = Math.min(sq.target, sq.progress);
      } else if (sq.difficultyState !== 'upgraded') {
        sq.xpReward += 40;
      }
      sq.difficultyState = 'upgraded';
      sq.preserveNormalStat = false;
      if (sq.target > 1) {
        sq.target = Math.max(1, Math.floor(sq.target / 2));
      }
      sq.desc = `${sq.desc} (Decreto do Multiverso: 🔥 +Dif & -50% meta)`;
      board.squares[idx] = sq;
      boardMutated = true;
      effectLabel = '🌌 Decreto do Multiverso (🔥 +Dif & -50% meta)';
      message = `Decreto do Multiverso elevou "${sq.title}" para 🔥 +Dif (${sq.xpReward} XP) e cortou a meta pela metade (${sq.target})!`;
      break;
    }

    default:
      throw new Error(`Classe "${classId}" não reconhecida para os Pergaminhos da Guilda.`);
  }

  if (boardMutated) {
    // Se alguma Classe adicionou +XP num Pergaminho Dourado, converte esse bônus proporcionalmente para Ouro!
    for (let i = 0; i < board.squares.length; i += 1) {
      const sq = board.squares[i];
      if (sq?.rewardMode === 'gold' && Number(sq.xpReward || 0) > 0) {
        const addedGold = computeBingoGoldFromXp(Number(sq.xpReward));
        board.squares[i] = {
          ...sq,
          goldReward: Number(sq.goldReward || 0) + addedGold,
          xpReward: 0,
        };
      }
    }
    board = recalculateBoardState(board);
    await query(`UPDATE bingo_boards SET board_json = $1 WHERE id = $2`, [
      JSON.stringify(board),
      row.id,
    ]);
  }

  const classPowerWallet = await consumeClassPowerCharge('bingo');
  const status = await getBingoStatus();
  return {
    message,
    effectLabel,
    status,
    classPowerWallet,
  };
}

export async function activateBingoBazaarPower(params: {
  boardId: number;
  targetType: 'square' | 'line';
  squareIndex?: number | null;
  lineId?: string | null;
}): Promise<{
  message: string;
  bazaarStatus: any;
  status: Awaited<ReturnType<typeof getBingoStatus>>;
}> {
  await ensureBingoTables();
  const res = await query(`SELECT * FROM bingo_boards WHERE id = $1`, [params.boardId]);
  if (res.rows.length === 0) {
    throw new Error('Cartela de Bingo não encontrada.');
  }
  const current = mapBingoBoardRow(res.rows[0]);
  if (current.status !== 'active') {
    throw new Error('Só é possível aplicar o Sinete Híbrido na cartela ativa.');
  }

  const board: BingoBoardData = {
    squares: current.board.squares.map((s) => ({ ...s })),
    lines: current.board.lines.map((l) => ({ ...l })),
    blackout: { ...current.board.blackout },
  };

  let message = '';
  if (params.targetType === 'line') {
    const lineIdx = board.lines.findIndex((l) => l.id === String(params.lineId || ''));
    if (lineIdx === -1) {
      throw new Error('Selecione uma Fileira válida para aplicar o Sinete Híbrido.');
    }
    const line = board.lines[lineIdx];
    if (line.claimed) {
      throw new Error('Esta Fileira já foi colhida.');
    }
    if (line.rewardMode === 'hybrid' || (line.rewardMode === 'gold' && line.hybridGoldBoost)) {
      throw new Error('Esta Fileira já recebeu o Sinete Híbrido!');
    }
    const cons = await consumeTacticalPowerCharge('bingo_hybrid_seal');
    if (line.rewardMode === 'gold') {
      const curG = Math.max(12, Number(line.goldReward || computeBingoGoldFromXp(BINGO_LINE_XP)));
      const nextG = Math.max(curG + 2, Math.round(curG * 1.25));
      board.lines[lineIdx] = { ...line, goldReward: nextG, hybridGoldBoost: true };
      message = `⚖️ Sinete Híbrido aplicou +25% de Ouro na ${line.label}: +${nextG} 🪙!`;
    } else {
      const basePts = Math.max(10, Number(line.xpReward || BINGO_LINE_XP));
      const halfXp = Math.round(basePts / 2);
      const halfGold = Math.round(computeBingoGoldFromXp(basePts) / 2);
      board.lines[lineIdx] = {
        ...line,
        rewardMode: 'hybrid',
        xpReward: halfXp,
        goldReward: halfGold,
      };
      message = `⚖️ Sinete Híbrido converteu a ${line.label} em +${halfXp} XP + ${halfGold} 🪙!`;
    }
    const recalc = recalculateBoardState(board);
    await query(`UPDATE bingo_boards SET board_json = $2::jsonb WHERE id = $1`, [
      current.id,
      JSON.stringify(recalc),
    ]);
    return {
      message,
      bazaarStatus: cons.status,
      status: await getBingoStatus(),
    };
  }

  const idx = Number(params.squareIndex);
  if (!Number.isInteger(idx) || idx < 0 || idx >= 16 || !board.squares[idx]) {
    throw new Error('Selecione um pergaminho válido (0 a 15) para aplicar o Sinete Híbrido.');
  }
  const sq = board.squares[idx];
  if (sq.claimed) {
    throw new Error('Este pergaminho já foi colhido — escolha um contrato em aberto ou ainda não lacrado.');
  }
  if (sq.rewardMode === 'hybrid') {
    throw new Error('Este pergaminho já está convertido no modo Híbrido (50% XP / 50% 🪙)!');
  }
  if (sq.rewardMode === 'gold' && sq.hybridGoldBoost) {
    throw new Error('Este Pergaminho Dourado já recebeu o bônus de +25% Moedas!');
  }

  const cons = await consumeTacticalPowerCharge('bingo_hybrid_seal');
  if (sq.rewardMode === 'gold') {
    const def = BINGO_GOAL_CATALOG.find((g) => g.key === sq.goalKey);
    const basePts = Number(sq.baseXpValue || def?.[sq.difficultyState || 'normal']?.xpReward || 35);
    const boosted = applySquareRewardMode(sq, 'gold', basePts, true);
    board.squares[idx] = {
      ...boosted,
      goldReward: Math.max(
        Number(boosted.goldReward || 0),
        Math.round(Number(sq.goldReward || computeBingoGoldFromXp(basePts)) * 1.25)
      ),
      hybridGoldBoost: true,
    };
    message = `🪙 Sinete Híbrido turbinou o Pergaminho Dourado "${sq.title}" em +25% (+${board.squares[idx].goldReward} 🪙)!`;
  } else {
    const basePts = Math.max(10, Number(sq.xpReward || sq.baseXpValue || 35));
    board.squares[idx] = applySquareRewardMode(sq, 'hybrid', basePts, false);
    message = `⚖️ Sinete Híbrido dividiu "${sq.title}" em +${board.squares[idx].xpReward} XP + ${board.squares[idx].goldReward} 🪙!`;
  }

  const recalc = recalculateBoardState(board);
  await query(`UPDATE bingo_boards SET board_json = $2::jsonb WHERE id = $1`, [
    current.id,
    JSON.stringify(recalc),
  ]);
  return {
    message,
    bazaarStatus: cons.status,
    status: await getBingoStatus(),
  };
}
