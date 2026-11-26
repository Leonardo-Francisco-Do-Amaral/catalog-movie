import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { query } from '../config/database';
import { fetchMovieDetailsByTitle } from './movieIntegration';
import {
  buildWorldChallengePayload,
  resolveTerritoryDescriptor,
  WorldChallengePayload,
} from './worldChallengeService';
import {
  buildTimeMachinePayload,
  getDecadeCompletionXp,
  TIME_MACHINE_RARITY_META,
} from './timeMachineService';
import { buildCatalogIndex } from './trophies/catalogIndex';
import { evaluateCatalogDefinitions, PreviousCardState } from './trophies/trophyEvaluator';
import { TROPHY_DEFINITIONS, TrophyDefinition } from '../data/trophyDefinitions';
import { UNIVERSE_SAGAS } from '../data/universeDefinitions';
import { matchUniverseMovie } from './universeCodexService';
import { getCuratedMoviesForStar, WALK_OF_FAME_STARS } from '../data/walkOfFameData';
import { getCountryRarityTier } from '../data/unCountries195';
import {
  CYCLE_PERIOD_DAYS,
  getSaoPaulo15DayCycleInfo,
  computeCycleBankedBalance,
} from '../utils/cycleUtils';
import {
  assertClassPowerChargeAvailable,
  ClassPowerWalletStatus,
  consumeClassPowerCharge,
  getSecretDrawPowerBuff,
  labGrantClassPowerCharge,
  SecretDrawPowerBuff,
  setSecretDrawPowerBuff,
} from './classPowersService';
import {
  grantGuildBazaarCoins,
  hasGuildRelic,
  applyGoldenLoupeBonus,
  consumeTacticalPowerCharge,
  getSecretArmedFlags,
  updateSecretArmedFlags,
  tryConsumeHouseInsurance,
} from './guildBazaarService';

type ConsolidatedMovieData = Awaited<ReturnType<typeof fetchMovieDetailsByTitle>>;
type TimeMachinePayload = Awaited<ReturnType<typeof buildTimeMachinePayload>>;

export type SecretDrawDifficulty = 'common' | 'medium' | 'hard' | 'very_hard' | 'exotic';
export type SecretDrawSagaRule = 'redirect_first' | 'skip_sequels' | 'allow_any';

export const SECRET_DRAW_XP_BY_DIFFICULTY: Record<SecretDrawDifficulty, number> = {
  common: 35,
  medium: 45,
  hard: 70,
  very_hard: 100,
  exotic: 150,
};

export const SECRET_GOLD_PER_XP_RATE = 0.85;

export function computeSecretGoldFromPoints(points: number): number {
  return Math.max(8, Math.round(Number(points || 0) * SECRET_GOLD_PER_XP_RATE));
}

export const SECRET_DRAW_DIFFICULTY_META: Record<
  SecretDrawDifficulty,
  {
    key: SecretDrawDifficulty;
    label: string;
    pluralLabel: string;
    icon: string;
    xp: number;
  }
> = {
  common: { key: 'common', label: 'Comum', pluralLabel: 'Comuns', icon: '🟢', xp: 35 },
  medium: { key: 'medium', label: 'Mediano', pluralLabel: 'Medianos', icon: '🔵', xp: 45 },
  hard: { key: 'hard', label: 'Difícil', pluralLabel: 'Difíceis', icon: '💜', xp: 70 },
  very_hard: { key: 'very_hard', label: 'Muito Difícil', pluralLabel: 'Muito Difíceis', icon: '🔥', xp: 100 },
  exotic: { key: 'exotic', label: 'Exótico', pluralLabel: 'Exóticos', icon: '💎', xp: 150 },
};

export interface SecretDrawMilestonePrediction {
  system: 'world_challenge' | 'time_machine' | 'trophy' | 'universe' | 'walk_of_fame';
  icon: string;
  label: string;
  detail: string;
  tier?: string;
  rarityTier?: string;
}

export interface SecretDrawCardResolvedData {
  tmdbId: number | null;
  imdbId: string | null;
  title: string;
  originalTitle: string | null;
  releaseYear: number | null;
  runtime: number | null;
  posterUrl: string | null;
  synopsis: string | null;
  countries: string[];
  genres: string[];
  directors: string[];
  writers: string[];
  studios: string[];
  distributor: string | null;
  imdbRating: number | null;
  metacriticScore: number | null;
  rottenTomatoesScore: number | null;
  voteCount: number | null;
  oscarWins: number;
  oscarNominations: number;
  usedFallbackQuery?: string | null;
  usedNoYearFallback?: boolean;
  sagaRedirect?: {
    sagaTitle: string;
    originalTitle: string;
    originalYear: number | null;
    originalOrder: number;
    redirectedOrder: number;
    totalChapters: number;
  } | null;
}

export type SecretSpecialRarity = 'common' | 'rare' | 'legendary' | 'cursed' | 'bet';

export type SecretSpecialCardId =
  | 'duas_caras'
  | 'apresentador_vem_ca'
  | 'ocarina_floresta'
  | 'recarga_classe'
  | 'visao_marcos'
  | 'arlequim_revela_3'
  | 'arlequim_revela_5'
  | 'portal_dimensional'
  | 'pedra_filosofal'
  | 'armadilha_mecanica'
  | 'corrente_destino'
  | 'lamina_eclipse'
  | 'valete_troca_fichas'
  | 'valete_mao_leve'
  | 'dama_toque_dourado'
  | 'dama_espadas_inquisidora'
  | 'maldicao_imposto_ouro';

export interface SecretSpecialCardDef {
  id: SecretSpecialCardId;
  title: string;
  harlequinTitle?: string;
  icon: string;
  rarity: SecretSpecialRarity;
  shortTag: string;
  description: string;
  harlequinQuote?: string;
  lore?: string;
  images: string[];
  altImages?: string[];
  classicImages?: string[];
  weight: number;
}

export interface SecretDrawCardSpecialEvent {
  id: SecretSpecialCardId;
  title: string;
  harlequinTitle?: string;
  icon: string;
  rarity: SecretSpecialRarity;
  shortTag: string;
  description: string;
  harlequinQuote?: string;
  lore?: string;
  imageUrl: string;
  altImages?: string[];
  classicImages?: string[];
  triggered?: boolean;
  triggeredAt?: string | null;
  resultSummary?: string | null;
  outcomeData?: Record<string, any> | null;
}

export const SECRET_SPECIAL_CARDS_CATALOG: SecretSpecialCardDef[] = [
  {
    id: 'duas_caras',
    title: 'Rei Duas-Caras',
    harlequinTitle: 'Arlequim Duas-Caras',
    icon: '🪙',
    rarity: 'bet',
    shortTag: 'Moeda 50/50 na Fila',
    description:
      'Gira a moeda do destino para 1 filme pendente da sua fila! CARA: dobra (2×) o XP do filme. COROA: corta o XP pela metade (0.5×) e trava sem Passe Bumerangue!',
    harlequinQuote: 'O Arlequim lançou a moeda: resta saber se o lado que caiu traz bênção ou maldição.',
    lore: 'Trono dividido entre ouro e cinzas. O Arlequim gira a moeda apenas pelo prazer de assistir à sua aposta.',
    images: ['/secret-draw/especiais/arlequim/rei-duas-caras.jpg'],
    classicImages: ['/secret-draw/especiais/classicas/rei-duas-caras.jpg'],
    weight: 10,
  },
  {
    id: 'apresentador_vem_ca',
    title: 'Apresentador "Vem pra cá!"',
    harlequinTitle: 'O Chamado do Arlequim',
    icon: '🃏',
    rarity: 'common',
    shortTag: 'Puxa 1 Carta Aleatória da Mesa',
    description:
      'O Arlequim deu sua bênção, mas ele vai escolher o filme para você ver — puxando 1 outra carta fechada da mesa direto para a sua fila! Se esconder uma Carta Especial, ativa em cadeia.',
    harlequinQuote: 'O Arlequim deu sua bênção, mas hoje é ele quem escolhe o filme para você assistir.',
    lore: 'Com um laço de película 35mm, o croupier fisga direto do feltro a carta que você não teve coragem de virar.',
    images: ['/secret-draw/especiais/arlequim/chamado-arlequim.jpg'],
    classicImages: ['/secret-draw/especiais/classicas/apresentador.jpg'],
    weight: 13,
  },
  {
    id: 'ocarina_floresta',
    title: 'Ocarina da Floresta',
    harlequinTitle: 'Harpa do Tempo Reverso',
    icon: '⏳',
    rarity: 'rare',
    shortTag: 'Reembaralha a Mesa',
    description:
      'O Arlequim dedilha sua harpa sobre o relógio antigo para reembaralhar e sortear novos filmes em todas as cartas ainda fechadas da mão atual, sem gastar Ficha de Sorteio!',
    harlequinQuote: 'As notas voltam os ponteiros: o Arlequim reembaralhou o destino da mesa.',
    lore: 'Sentado sobre engrenagens antigas, ele toca a melodia reversa até rebobinar o baralho inteiro.',
    images: ['/secret-draw/especiais/arlequim/melodia-do-tempo.jpg'],
    classicImages: ['/secret-draw/especiais/classicas/ocarina-da-floresta.jpg'],
    weight: 10,
  },
  {
    id: 'recarga_classe',
    title: 'Recarga do Poder da Classe',
    harlequinTitle: 'Take 2 — Recarga Arcana',
    icon: '🎬',
    rarity: 'rare',
    shortTag: '+1 Carga da Classe (Sessão Secreta)',
    description:
      'O Arlequim estala a claquete do Take 2 e reativa imediatamente +1 uso do Poder Especial da sua Classe RPG exclusivamente para a Sessão Secreta!',
    harlequinQuote: 'Take 2. O Arlequim deu sinal verde para você usar o seu poder mais uma vez.',
    lore: 'Na cadeira de diretor da Sala Secreta, basta uma batida da claquete para reabrir a cena do seu poder.',
    images: ['/secret-draw/especiais/arlequim/recarga-classe.jpg'],
    classicImages: [
      '/secret-draw/especiais/classicas/recarga-classe-1.jpg',
      '/secret-draw/especiais/classicas/recarga-classe-2.jpg',
      '/secret-draw/especiais/classicas/recarga-classe-3.jpg',
    ],
    weight: 11,
  },
  {
    id: 'visao_marcos',
    title: 'Visão dos Marcos',
    harlequinTitle: 'Lentes da Sessão Oculta',
    icon: '🕶️',
    rarity: 'rare',
    shortTag: 'Revela Resumo dos Marcos na Mesa',
    description:
      'Através das lentes verde e rosa do Arlequim, o verso das cartas restantes da mesa revela quantos marcos simples cada filme escondido destrava sem entregar os títulos!',
    harlequinQuote: 'Por trás das lentes 3D, até o verso fechado denuncia o que cada filme esconde.',
    lore: 'Os óculos anaglíficos do Arlequim atravessam o papel do baralho para revelar troféus, países e eras ocultas.',
    images: ['/secret-draw/especiais/arlequim/visao-marcos.jpg'],
    classicImages: [
      '/secret-draw/especiais/classicas/visao-marcos-1.jpg',
      '/secret-draw/especiais/classicas/visao-marcos-2.jpg',
    ],
    weight: 11,
  },
  {
    id: 'arlequim_revela_3',
    title: 'Mini Arlequim — 3 Cartas',
    harlequinTitle: 'Olhar do Arlequim — 3 Cartas',
    icon: '🃏',
    rarity: 'rare',
    shortTag: 'Revela 3 Filmes Fechados',
    description:
      'O Arlequim levita sobre o baralho e revela o pôster e o título de até 3 outros filmes ainda fechados nesta mesa antes de você escolher!',
    harlequinQuote: 'Três cartas reveladas por cortesia da casa — agora escolha sem desculpas.',
    lore: 'Um favor discreto do croupier da Sessão Secreta para testar o olhar de quem aposta alto.',
    images: ['/secret-draw/especiais/arlequim/revela-3-alt.jpg'],
    altImages: ['/secret-draw/especiais/arlequim/revela-3.jpg'],
    weight: 10,
  },
  {
    id: 'arlequim_revela_5',
    title: 'Mini Arlequim Ascendido — 5 Cartas',
    harlequinTitle: 'Espetáculo do Arlequim — 5 Cartas',
    icon: '🌟',
    rarity: 'legendary',
    shortTag: 'Revela 5 Filmes Fechados',
    description:
      'LENDÁRIA: O Arlequim abre toda a mão e revela até 5 outros filmes escondidos nesta mesa com pôster, ano e raridade visíveis!',
    harlequinQuote: 'Cinco cartas iluminadas sobre o feltro. Hoje o Arlequim abriu os arquivos secretos.',
    lore: 'Quando o espetáculo chega ao auge, nem mesmo as cartas viradas conseguem esconder o que guardam.',
    images: ['/secret-draw/especiais/arlequim/revela-5-alt.jpg'],
    altImages: ['/secret-draw/especiais/arlequim/revela-5.jpg'],
    weight: 6,
  },
  {
    id: 'portal_dimensional',
    title: 'Portal Dimensional',
    harlequinTitle: 'Atalho do Portal',
    icon: '🌀',
    rarity: 'legendary',
    shortTag: 'Colhe XP + Volta ao Baralho',
    description:
      'LENDÁRIA: O Arlequim adora o filme sorteado da sua fila — abre um portal, entrega todo o XP dele na hora sem precisar assistir e devolve o filme intacto ao baralho!',
    harlequinQuote: 'O Arlequim adora esse filme — ele ainda vai te dar todo o XP sem precisar assistir.',
    lore: 'Por certas obras ele guarda um apreço especial: abre a fenda de película, paga a recompensa e guarda o rolo de volta.',
    images: ['/secret-draw/especiais/arlequim/portal-dimensional.jpg'],
    classicImages: [
      '/secret-draw/especiais/classicas/portal-dimensional-1.jpg',
      '/secret-draw/especiais/classicas/portal-dimensional-2.jpg',
      '/secret-draw/especiais/classicas/portal-dimensional-3.jpg',
      '/secret-draw/especiais/classicas/portal-dimensional-4.jpg',
    ],
    weight: 6,
  },
  {
    id: 'pedra_filosofal',
    title: 'Pedra Filosofal — Ascensão',
    harlequinTitle: 'Alquimia da Película',
    icon: '⚗️',
    rarity: 'legendary',
    shortTag: '+1 Raridade na Fila',
    description:
      'LENDÁRIA: Transmuta 1 filme aleatório da sua fila pendente (que ainda não seja Exótico) subindo 1 nível completo de raridade e aumentando seu XP!',
    harlequinQuote: 'Uma gota da pedra rubi basta para transformar uma sessão comum em ouro.',
    lore: 'Entre grimórios antigos e um alambique dourado, o Arlequim refina uma carta comum até ela brilhar mais alto.',
    images: ['/secret-draw/especiais/arlequim/pedra-filosofal.jpg'],
    classicImages: [
      '/secret-draw/especiais/classicas/ascensao-1.jpg',
      '/secret-draw/especiais/classicas/ascensao-2.jpg',
    ],
    weight: 6,
  },
  {
    id: 'armadilha_mecanica',
    title: 'A Armadilha Mecânica',
    harlequinTitle: 'Armadilha de Engrenagens',
    icon: '⚙️',
    rarity: 'cursed',
    shortTag: '-1 Raridade na Fila',
    description:
      'MALDIÇÃO: As engrenagens se fecham sobre 1 filme aleatório da sua fila (acima de Comum), rebaixando sua raridade em 1 nível e reduzindo seu XP!',
    harlequinQuote: 'Nem todo truque é favor. Quando as mandíbulas se fecham, até ouro vira ferro.',
    lore: 'Nos bastidores enferrujados da projeção, o sorriso do Arlequim fica mais afiado e cobra seu preço.',
    images: ['/secret-draw/especiais/arlequim/armadilha-mecanica.jpg'],
    classicImages: ['/secret-draw/especiais/classicas/armadilha-mecanica.jpg'],
    weight: 7,
  },
  {
    id: 'corrente_destino',
    title: 'Corrente do Destino',
    harlequinTitle: 'Correntes do Abismo',
    icon: '⛓️',
    rarity: 'cursed',
    shortTag: 'Trava Bumerangue na Fila',
    description:
      'MALDIÇÃO: Correntes pesadas prendem 1 filme aleatório da sua fila ativa, partindo o Bumerangue e proibindo devolver aquela carta para o baralho!',
    harlequinQuote: 'Sem fuga nem bumerangue: o Arlequim trancou essa escolha até o último crédito.',
    lore: 'Sob a máscara rachada e olhos carmesins, ele parte a rota de saída e acorrenta o filme à sua fila.',
    images: ['/secret-draw/especiais/arlequim/corrente-destino.jpg'],
    classicImages: ['/secret-draw/especiais/classicas/corrente-destino.jpg'],
    weight: 7,
  },
  {
    id: 'lamina_eclipse',
    title: 'Lâmina do Eclipse',
    harlequinTitle: 'Corte do Eclipse',
    icon: '💔',
    rarity: 'cursed',
    shortTag: 'Corta XP pela Metade (0.5×)',
    description:
      'MALDIÇÃO: Um golpe no escuro corta ao meio o prêmio de 1 filme aleatório da sua fila pendente, reduzindo o XP dele pela metade (0.5×)!',
    harlequinQuote: 'Um corte rápido no escuro: o filme continua na tela, mas o prêmio sangrou pela metade.',
    lore: 'Quando o eclipse escurece o baralho, o Arlequim estala as garras e rasga a recompensa ao meio.',
    images: ['/secret-draw/especiais/arlequim/lamina-eclipse.jpg'],
    altImages: ['/secret-draw/especiais/arlequim/lamina-eclipse-clara.jpg'],
    weight: 7,
  },
  {
    id: 'valete_troca_fichas',
    title: 'Valete de Ouros — Troca de Fichas',
    harlequinTitle: 'Valete das Fichas Douradas (J ♦)',
    icon: '🪙',
    rarity: 'rare',
    shortTag: 'Até 2 Cartas XP → Ouro (+15%)',
    description:
      'O Arlequim faz duas fichas douradas rodarem entre os dedos: converte até 2 cartas ainda fechadas da mesa que valiam XP em Ouro do Bazar (🪙) com +15% de bônus!',
    harlequinQuote: 'XP paga a sessão, mas ouro compra o camarim inteiro — o Arlequim trocou essas duas cartas antes da virada.',
    lore: 'Entre fichas girando no ar e cartas ainda fechadas, o Arlequim troca bilhetes de XP por ouro vivo antes mesmo do corte.',
    images: ['/secret-draw/especiais/arlequim/valete-troca-fichas.jpg'],
    weight: 9,
  },
  {
    id: 'valete_mao_leve',
    title: 'Valete de Paus — Mão Leve',
    harlequinTitle: 'Trapaceiro Mão Leve (J ♣)',
    icon: '🕵️',
    rarity: 'rare',
    shortTag: '+20 🪙 + Pisca Especiais na Mesa',
    description:
      'Sem puxar filme para sua fila, o Arlequim afana +20 🪙 da banca direto para o seu Bazar e faz pulsar um contorno misterioso nas cartas fechadas que escondem outra Carta Especial!',
    harlequinQuote: 'Vinte moedas já escorregaram pro bolso... e olha só quais cartas no feltro acabaram de piscar.',
    lore: 'Por trás do monóculo brilhante e de dedos leves sobre o feltro, o Arlequim limpa a banca e denuncia onde moram seus próprios segredos.',
    images: ['/secret-draw/especiais/arlequim/valete-mao-leve.jpg'],
    weight: 9,
  },
  {
    id: 'dama_toque_dourado',
    title: 'Dama de Ouros — Toque Dourado',
    harlequinTitle: 'Dama do Toque Dourado (Q ♦)',
    icon: '👑',
    rarity: 'legendary',
    shortTag: '1 Carta da Fila → Ouro (+25%)',
    description:
      'LENDÁRIA: O Arlequim toca 1 única carta ativa de XP na sua fila e a transmuta em Carta de Ouro (🪙) com +25% de conversão extra para gastar no Bazar!',
    harlequinQuote: 'Um único toque do Arlequim e a película inteira derrete em ouro puro.',
    lore: 'Com luvas banhadas em brilho líquido, o Arlequim envolve um filme escolhido na sua fila e sela seu destino em moedas raras.',
    images: ['/secret-draw/especiais/arlequim/dama-toque-dourado.jpg'],
    weight: 6,
  },
  {
    id: 'dama_espadas_inquisidora',
    title: 'Dama de Espadas — A Inquisidora',
    harlequinTitle: 'A Inquisidora Implacável (Q ♠)',
    icon: '⚔️',
    rarity: 'cursed',
    shortTag: 'Retira 1–4 Pares (XP + Ouro) da Mesa',
    description:
      'MALDIÇÃO: Sob a Dama de Espadas, o Arlequim rola de 1 a 4 e bane quantidades iguais da mesa (ex.: 2 cartas de XP e 2 cartas de Ouro — incluindo Especiais disfarçadas que estiverem lá!), pois não suporta esses filmes.',
    harlequinQuote: 'Equilíbrio na lâmina: se o Arlequim levar dois de XP, dois de Ouro também vão virar cinza.',
    lore: 'Vestindo negro e lâminas espelhadas no escuro do baralho, o Arlequim corta pares exatos de cartas até calar a sorte da mesa.',
    images: ['/secret-draw/especiais/arlequim/dama-espadas-inquisidora.jpg'],
    weight: 7,
  },
  {
    id: 'maldicao_imposto_ouro',
    title: '7 de Ouros — Sanguessuga Dourada',
    harlequinTitle: 'Tributo do Submundo (7 ♦)',
    icon: '🩸',
    rarity: 'cursed',
    shortTag: 'Corta Ouro da Fila (-50%)',
    description:
      'MALDIÇÃO: Se houver alguma carta valendo Ouro (🪙) ativa na sua fila, o Arlequim exige tributo na lâmina e corta as moedas dela pela metade (-50%). Se não houver carta de Ouro na fila, nada acontece!',
    harlequinQuote: 'Tem ouro brilhando na sua fila? O Arlequim cobra a metade antes mesmo dos créditos finais.',
    lore: 'Quando moedas demais brilham sobre a mesa, o Arlequim ergue sua adaga nas sombras e parte o espólio ao meio.',
    images: ['/secret-draw/especiais/arlequim/sanguessuga-dourada.jpg'],
    weight: 7,
  },
];

export interface SecretDrawCard {
  seat: number;
  poolId: number;
  difficulty: SecretDrawDifficulty;
  difficultyLabel: string;
  difficultyIcon: string;
  xpReward: number;
  rewardMode?: 'xp' | 'gold';
  goldReward?: number;
  milestones: SecretDrawMilestonePrediction[];
  totalMilestonesCount: number;
  mysteryTeaser: string;
  specialEvent?: SecretDrawCardSpecialEvent | null;
  revealedPreview?: boolean;
  simpleMilestonesHint?: boolean;
  decoyMilestones?: SecretDrawMilestonePrediction[] | null;
  decoyYear?: number | null;
  decoyRuntime?: number | null;
  boomerangLocked?: boolean;
  halfXpCursed?: boolean;
  twoFaceDoubled?: boolean;
  rarityChangedFrom?: SecretDrawDifficulty | null;
  portalHarvested?: boolean;
  specialPulseHint?: boolean;
  goldConvertedByJack?: boolean;
  goldConvertedByQueen?: boolean;
  transmutedByBazaar?: boolean;
  removedByCurse?: boolean;
  planilha: {
    sourceRow: number;
    rawTitle: string;
    rawYearStr: string;
    cleanedTitle: string;
    parsedYear: number | null;
    notesExtracted: string | null;
  };
  resolved: SecretDrawCardResolvedData;
}

export interface SecretDrawAuditEntry {
  attempt: number;
  poolId: number;
  sourceRow: number;
  rawTitle: string;
  rawYearStr: string;
  cleanedTitle: string;
  parsedYear: number | null;
  outcome:
    | 'selected'
    | 'skipped_watched_after_tmdb'
    | 'skipped_watched_before_api'
    | 'skipped_duplicate_in_draw'
    | 'skipped_saga_sequel'
    | 'skipped_not_found'
    | 'skipped_error';
  seat?: number;
  difficulty?: SecretDrawDifficulty;
  xpReward?: number;
  rewardMode?: 'xp' | 'gold';
  goldReward?: number;
  resolvedTitle?: string | null;
  resolvedOriginalTitle?: string | null;
  resolvedYear?: number | null;
  tmdbId?: number | null;
  matchedCatalogTitle?: string | null;
  matchedCatalogYear?: number | null;
  message: string;
}

export interface SecretDrawRoundPowerFlags {
  classId?: string;
  powerTitle?: string;
  xrayMilestones?: boolean;
  xrayUnconqueredYearsOnly?: boolean;
  simpleMilestonesVision?: boolean;
  revealYearRuntime?: boolean;
  allowExtraActivePick?: boolean;
  bonusNextPickXp?: number;
  prioritizeUnconqueredYears?: boolean;
  extraCardsAdded?: number;
  specialStormActive?: boolean;
}

export interface SecretDrawRound {
  id: number;
  mode: string;
  status: 'revealed' | 'active' | 'completed' | 'declined' | 'cancelled';
  requestedCardCount?: number;
  sagaRule?: SecretDrawSagaRule;
  powerFlags?: SecretDrawRoundPowerFlags | null;
  cards: SecretDrawCard[];
  auditLog: SecretDrawAuditEntry[];
  auditCount?: number;
  chosenSeat: number | null;
  chosenPoolId: number | null;
  chosenDifficulty: SecretDrawDifficulty | null;
  xpAwarded: number;
  lockedXp: number;
  completedMovieId: number | null;
  completedSource: string | null;
  declineReason: string | null;
  createdAt: string;
  chosenAt: string | null;
  completedAt: string | null;
  declinedAt: string | null;
}

export const MAX_ACTIVE_SECRET_PICKS = 10;
export const WEEKLY_DRAW_CHIPS_LIMIT = 3;
export const MAX_DRAW_CHIPS_BANK = 5;
export const WEEKLY_BOOMERANG_CHIPS_LIMIT = 2;
export const MAX_BOOMERANG_CHIPS_BANK = 4;

export interface SecretDrawChipsWallet {
  weekKey: string;
  weeklyAllowance: number;
  chipsRemaining: number;
  chipsUsedThisWeek: number;
  maxChipsBank: number;
  cycleDays: number;
  canChooseCardCount: boolean;
  boomerangAllowance: number;
  boomerangChipsRemaining: number;
  boomerangUsedThisWeek: number;
  maxBoomerangBank: number;
  nextResetLabel: string;
}

export interface SecretDrawPick {
  id: number;
  roundId: number;
  seat: number;
  poolId: number | null;
  difficulty: SecretDrawDifficulty;
  xpReward: number;
  xpAwarded: number;
  rewardMode?: 'xp' | 'gold';
  goldReward?: number;
  goldAwarded?: number;
  card: SecretDrawCard;
  status: 'active' | 'ready_to_claim' | 'completed' | 'declined' | 'boomerang';
  completedMovieId: number | null;
  completedSource: string | null;
  declineReason: string | null;
  pickedAt: string;
  completedAt: string | null;
  declinedAt: string | null;
}

export interface SecretDrawXpSummary {
  completedCount: number;
  totalXp: number;
  totalGold?: number;
  byDifficulty: Record<SecretDrawDifficulty, { count: number; totalXp: number }>;
  completedRoundsMap: Record<
    string,
    {
      roundId: number;
      title: string;
      difficulty: SecretDrawDifficulty;
      xp: number;
      gold?: number;
      completedAt: string | null;
    }
  >;
}

export const EMPTY_SECRET_DRAW_XP_SUMMARY: SecretDrawXpSummary = {
  completedCount: 0,
  totalXp: 0,
  totalGold: 0,
  byDifficulty: {
    common: { count: 0, totalXp: 0 },
    medium: { count: 0, totalXp: 0 },
    hard: { count: 0, totalXp: 0 },
    very_hard: { count: 0, totalXp: 0 },
    exotic: { count: 0, totalXp: 0 },
  },
  completedRoundsMap: {},
};

const PLATFORM_NOTE_REGEX =
  /^(netflix|nextflix|hbo|hbo\s*max|hboi\s*max|disney\+?|prime|prime\s*video|star\+?|apple\s*tv\+?|youtube|globoplay|paramount\+?|telecine|mubi|blu\s*-?\s*ray|dvd|cinema|anime|necessario.*|ver\s+por.*|por\s+ordem.*|ordem.*|sequencia.*|legendado|dublado|4k)$/i;

const TRAILING_NOTE_REGEX =
  /\s*(?:\bver o outro filme antes\b|\bver por sequencia\b|\bpor ordem e o \d+\b|\bblu\s*-?\s*ray\b|\bnextflix\b|\bnetflix\b|\bhboi?\s*max\b|\bprime\s*video\b|\bdisney\s*\+)\s*$/i;

let tablesEnsured = false;

export async function ensureSecretDrawTables(): Promise<void> {
  if (tablesEnsured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS secret_draw_pool (
      id SERIAL PRIMARY KEY,
      source_row INTEGER NOT NULL DEFAULT 0,
      raw_title TEXT NOT NULL,
      raw_year_str TEXT,
      cleaned_title TEXT NOT NULL,
      clean_norm TEXT NOT NULL,
      release_year INTEGER NULL,
      notes_extracted TEXT NULL,
      tmdb_id INTEGER NULL,
      imdb_id VARCHAR(32) NULL,
      resolved_json JSONB NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'available',
      matched_movie_id INTEGER NULL REFERENCES movies(id) ON DELETE SET NULL,
      skip_reason TEXT NULL,
      last_checked_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_secret_draw_pool_dedup
      ON secret_draw_pool (clean_norm, COALESCE(release_year, -1));

    CREATE INDEX IF NOT EXISTS idx_secret_draw_pool_status
      ON secret_draw_pool (status);

    CREATE TABLE IF NOT EXISTS secret_draw_rounds (
      id SERIAL PRIMARY KEY,
      mode VARCHAR(32) NOT NULL DEFAULT 'lab_infinite',
      status VARCHAR(32) NOT NULL DEFAULT 'revealed',
      cards_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      audit_log_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      chosen_seat INTEGER NULL,
      chosen_pool_id INTEGER NULL REFERENCES secret_draw_pool(id) ON DELETE SET NULL,
      chosen_difficulty VARCHAR(32) NULL,
      xp_awarded INTEGER NOT NULL DEFAULT 0,
      locked_xp INTEGER NOT NULL DEFAULT 0,
      completed_movie_id INTEGER NULL REFERENCES movies(id) ON DELETE SET NULL,
      completed_source VARCHAR(32) NULL,
      decline_reason TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      chosen_at TIMESTAMP NULL,
      completed_at TIMESTAMP NULL,
      declined_at TIMESTAMP NULL
    );

    CREATE TABLE IF NOT EXISTS secret_draw_sync_meta (
      id INTEGER PRIMARY KEY DEFAULT 1,
      last_sync_source TEXT NULL,
      total_raw_rows INTEGER NOT NULL DEFAULT 0,
      dedup_removed_count INTEGER NOT NULL DEFAULT 0,
      already_watched_at_sync INTEGER NOT NULL DEFAULT 0,
      sample_normalized_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      disk_file_hash VARCHAR(64) NULL,
      synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE secret_draw_sync_meta
      ADD COLUMN IF NOT EXISTS disk_file_hash VARCHAR(64) NULL;

    ALTER TABLE secret_draw_rounds
      ADD COLUMN IF NOT EXISTS requested_card_count INTEGER NOT NULL DEFAULT 5;

    ALTER TABLE secret_draw_rounds
      ADD COLUMN IF NOT EXISTS saga_rule VARCHAR(32) NOT NULL DEFAULT 'redirect_first';

    ALTER TABLE secret_draw_rounds
      ADD COLUMN IF NOT EXISTS power_flags_json JSONB NULL;

    CREATE TABLE IF NOT EXISTS secret_draw_picks (
      id SERIAL PRIMARY KEY,
      round_id INTEGER NOT NULL REFERENCES secret_draw_rounds(id) ON DELETE CASCADE,
      seat INTEGER NOT NULL,
      pool_id INTEGER NULL REFERENCES secret_draw_pool(id) ON DELETE SET NULL,
      difficulty VARCHAR(32) NOT NULL DEFAULT 'common',
      xp_reward INTEGER NOT NULL DEFAULT 35,
      xp_awarded INTEGER NOT NULL DEFAULT 0,
      card_json JSONB NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'active',
      completed_movie_id INTEGER NULL REFERENCES movies(id) ON DELETE SET NULL,
      completed_source VARCHAR(32) NULL,
      decline_reason TEXT NULL,
      picked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL,
      declined_at TIMESTAMP NULL,
      UNIQUE (round_id, seat)
    );

    CREATE INDEX IF NOT EXISTS idx_secret_draw_picks_status
      ON secret_draw_picks (status);

    ALTER TABLE secret_draw_picks
      ADD COLUMN IF NOT EXISTS reward_mode VARCHAR(12) NOT NULL DEFAULT 'xp';

    ALTER TABLE secret_draw_picks
      ADD COLUMN IF NOT EXISTS gold_reward INTEGER NOT NULL DEFAULT 0;

    ALTER TABLE secret_draw_picks
      ADD COLUMN IF NOT EXISTS gold_awarded INTEGER NOT NULL DEFAULT 0;

    CREATE TABLE IF NOT EXISTS secret_draw_wallet (
      id INTEGER PRIMARY KEY DEFAULT 1,
      week_key VARCHAR(20) NOT NULL,
      weekly_allowance INTEGER NOT NULL DEFAULT 2,
      chips_remaining INTEGER NOT NULL DEFAULT 2,
      chips_used_this_week INTEGER NOT NULL DEFAULT 0,
      boomerang_weekly_allowance INTEGER NOT NULL DEFAULT 2,
      boomerang_chips_remaining INTEGER NOT NULL DEFAULT 2,
      boomerang_chips_used_this_week INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE secret_draw_wallet
      ADD COLUMN IF NOT EXISTS boomerang_weekly_allowance INTEGER NOT NULL DEFAULT 2;

    ALTER TABLE secret_draw_wallet
      ADD COLUMN IF NOT EXISTS boomerang_chips_remaining INTEGER NOT NULL DEFAULT 2;

    ALTER TABLE secret_draw_wallet
      ADD COLUMN IF NOT EXISTS boomerang_chips_used_this_week INTEGER NOT NULL DEFAULT 0;

    CREATE TABLE IF NOT EXISTS secret_draw_special_stats (
      special_id VARCHAR(64) PRIMARY KEY,
      times_drawn INTEGER NOT NULL DEFAULT 0,
      last_drawn_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const statsCountRes = await query(`SELECT COUNT(*)::int AS cnt FROM secret_draw_special_stats`);
  if (Number(statsCountRes.rows[0]?.cnt || 0) === 0) {
    const existingRounds = await query(
      `SELECT cards_json FROM secret_draw_rounds WHERE mode <> 'lab_special_test'`
    );
    const seedCounts: Record<string, number> = {};
    for (const r of existingRounds.rows || []) {
      const cards = Array.isArray(r.cards_json) ? r.cards_json : [];
      for (const c of cards) {
        if (c?.specialEvent?.id && c.specialEvent.triggered) {
          const sid = String(c.specialEvent.id);
          seedCounts[sid] = (seedCounts[sid] || 0) + 1;
        }
      }
    }
    for (const [sid, count] of Object.entries(seedCounts)) {
      if (count > 0) {
        await query(
          `INSERT INTO secret_draw_special_stats (special_id, times_drawn, last_drawn_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (special_id) DO NOTHING`,
          [sid, count]
        );
      }
    }
  }

  // Migração idempotente de eventuais rodadas antigas de seleção única para secret_draw_picks
  const legacyRes = await query(
    `SELECT * FROM secret_draw_rounds
     WHERE status IN ('active', 'completed', 'declined')
       AND chosen_seat IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM secret_draw_picks p
         WHERE p.round_id = secret_draw_rounds.id AND p.seat = secret_draw_rounds.chosen_seat
       )`
  );
  for (const r of legacyRes.rows || []) {
    const cardsArr = Array.isArray(r.cards_json) ? r.cards_json : [];
    const card = cardsArr.find((c: any) => Number(c?.seat) === Number(r.chosen_seat));
    if (!card) continue;
    await query(
      `INSERT INTO secret_draw_picks (
         round_id, seat, pool_id, difficulty, xp_reward, xp_awarded,
         card_json, status, completed_movie_id, completed_source,
         decline_reason, picked_at, completed_at, declined_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, COALESCE($12, CURRENT_TIMESTAMP), $13, $14)
       ON CONFLICT (round_id, seat) DO NOTHING`,
      [
        Number(r.id),
        Number(r.chosen_seat),
        r.chosen_pool_id ?? card.poolId ?? null,
        String(r.chosen_difficulty || card.difficulty || 'common'),
        Number(card.xpReward || r.locked_xp || r.xp_awarded || 35),
        Number(r.xp_awarded || 0),
        JSON.stringify(card),
        String(r.status),
        r.completed_movie_id ?? null,
        r.completed_source ?? null,
        r.decline_reason ?? null,
        r.chosen_at ?? r.created_at ?? null,
        r.completed_at ?? null,
        r.declined_at ?? null,
      ]
    );
  }

  tablesEnsured = true;
}

function mapSecretDrawWalletRow(row: any, nextResetLabel: string): SecretDrawChipsWallet {
  const usedCount = Math.max(0, Number(row.chips_used_this_week || 0));
  return {
    weekKey: String(row.week_key),
    weeklyAllowance: WEEKLY_DRAW_CHIPS_LIMIT,
    chipsRemaining: Math.max(0, Number(row.chips_remaining ?? WEEKLY_DRAW_CHIPS_LIMIT)),
    chipsUsedThisWeek: usedCount,
    maxChipsBank: MAX_DRAW_CHIPS_BANK,
    cycleDays: CYCLE_PERIOD_DAYS,
    canChooseCardCount: usedCount >= 1,
    boomerangAllowance: WEEKLY_BOOMERANG_CHIPS_LIMIT,
    boomerangChipsRemaining: Math.max(
      0,
      Number(row.boomerang_chips_remaining ?? WEEKLY_BOOMERANG_CHIPS_LIMIT)
    ),
    boomerangUsedThisWeek: Math.max(0, Number(row.boomerang_chips_used_this_week || 0)),
    maxBoomerangBank: MAX_BOOMERANG_CHIPS_BANK,
    nextResetLabel,
  };
}

async function recordSpecialCardDrawn(specialId: SecretSpecialCardId | string): Promise<void> {
  if (!specialId) return;
  await query(
    `INSERT INTO secret_draw_special_stats (special_id, times_drawn, last_drawn_at)
     VALUES ($1, 1, CURRENT_TIMESTAMP)
     ON CONFLICT (special_id) DO UPDATE SET
       times_drawn = secret_draw_special_stats.times_drawn + 1,
       last_drawn_at = CURRENT_TIMESTAMP`,
    [String(specialId)]
  );
}

async function getSecretDrawSpecialCardStats(): Promise<{
  totalTriggered: number;
  countsById: Record<string, number>;
}> {
  const res = await query(`SELECT special_id, times_drawn FROM secret_draw_special_stats`);
  const countsById: Record<string, number> = {};
  let totalTriggered = 0;
  for (const r of res.rows || []) {
    const id = String(r.special_id || '').trim();
    const count = Math.max(0, Number(r.times_drawn || 0));
    if (!id || count <= 0) continue;
    countsById[id] = count;
    totalTriggered += count;
  }
  return { totalTriggered, countsById };
}

export async function ensureWeeklyChipsWallet(): Promise<SecretDrawChipsWallet> {
  await ensureSecretDrawTables();
  const { cycleIndex, cycleKey, nextResetLabel } = getSaoPaulo15DayCycleInfo();

  const curRes = await query(`SELECT * FROM secret_draw_wallet WHERE id = 1`);
  const row = curRes.rows[0];

  if (!row || String(row.week_key) !== cycleKey) {
    const nextDrawChips = row
      ? computeCycleBankedBalance({
          previousCycleKey: row.week_key,
          currentCycleIndex: cycleIndex,
          currentCycleKey: cycleKey,
          currentBalance: Number(row.chips_remaining ?? 0),
          allowancePerCycle: WEEKLY_DRAW_CHIPS_LIMIT,
          maxBankCap: MAX_DRAW_CHIPS_BANK,
        })
      : WEEKLY_DRAW_CHIPS_LIMIT;

    const nextBoomerangChips = row
      ? computeCycleBankedBalance({
          previousCycleKey: row.week_key,
          currentCycleIndex: cycleIndex,
          currentCycleKey: cycleKey,
          currentBalance: Number(row.boomerang_chips_remaining ?? 0),
          allowancePerCycle: WEEKLY_BOOMERANG_CHIPS_LIMIT,
          maxBankCap: MAX_BOOMERANG_CHIPS_BANK,
        })
      : WEEKLY_BOOMERANG_CHIPS_LIMIT;

    const upd = await query(
      `INSERT INTO secret_draw_wallet (
         id, week_key, weekly_allowance, chips_remaining, chips_used_this_week,
         boomerang_weekly_allowance, boomerang_chips_remaining, boomerang_chips_used_this_week, updated_at
       )
       VALUES (1, $1, $2, $3, 0, $4, $5, 0, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         week_key = EXCLUDED.week_key,
         weekly_allowance = EXCLUDED.weekly_allowance,
         chips_remaining = EXCLUDED.chips_remaining,
         chips_used_this_week = 0,
         boomerang_weekly_allowance = EXCLUDED.boomerang_weekly_allowance,
         boomerang_chips_remaining = EXCLUDED.boomerang_chips_remaining,
         boomerang_chips_used_this_week = 0,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        cycleKey,
        WEEKLY_DRAW_CHIPS_LIMIT,
        nextDrawChips,
        WEEKLY_BOOMERANG_CHIPS_LIMIT,
        nextBoomerangChips,
      ]
    );
    return mapSecretDrawWalletRow(upd.rows[0], nextResetLabel);
  }

  return mapSecretDrawWalletRow(row, nextResetLabel);
}

export async function labAddWeeklyDrawChip(
  amount = 1,
  chipType: 'draw' | 'boomerang' = 'draw'
): Promise<SecretDrawChipsWallet> {
  await ensureWeeklyChipsWallet();
  const add = Math.max(1, Math.min(10, Math.floor(Number(amount) || 1)));
  if (chipType === 'boomerang') {
    await query(
      `UPDATE secret_draw_wallet
       SET boomerang_chips_remaining = COALESCE(boomerang_chips_remaining, 2) + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`,
      [add]
    );
  } else {
    await query(
      `UPDATE secret_draw_wallet
       SET chips_remaining = chips_remaining + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`,
      [add]
    );
  }
  return ensureWeeklyChipsWallet();
}

export function normalizeCompareText(value: string | null | undefined): string {
  if (!value) return '';
  return String(value)
    .replace(/\u00A0/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’'`´"]/g, '')
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseRawYearValue(rawYear: unknown): number | null {
  if (rawYear === null || rawYear === undefined) return null;
  const s = String(rawYear).replace(/\u00A0/g, ' ').trim();
  if (!s) return null;

  const exact4 = s.match(/^(18\d{2}|19\d{2}|20[0-3]\d)$/);
  if (exact4) return Number(exact4[1]);

  // Suporta formatos como "10/2023"
  const slashMonthYear = s.match(/^\d{1,2}\/(18\d{2}|19\d{2}|20[0-3]\d)$/);
  if (slashMonthYear) return Number(slashMonthYear[1]);

  const any4 = s.match(/\b(18\d{2}|19\d{2}|20[0-3]\d)\b/);
  if (any4) return Number(any4[1]);

  return null;
}

export function cleanSpreadsheetTitleAndYear(
  rawTitleInput: unknown,
  rawYearInput: unknown
): {
  rawTitle: string;
  rawYearStr: string;
  cleanedTitle: string;
  cleanNorm: string;
  releaseYear: number | null;
  notesExtracted: string | null;
} {
  const rawTitle = String(rawTitleInput ?? '').replace(/\u00A0/g, ' ').trim();
  const rawYearStr = String(rawYearInput ?? '').replace(/\u00A0/g, ' ').trim();

  let releaseYear = parseRawYearValue(rawYearStr);
  let working = rawTitle.replace(/\s+/g, ' ').trim();
  const extractedNotes: string[] = [];

  // 1. Extrai e remove parênteses conhecidos: ano (2003), romano (I)/(II), plataformas/anotações
  working = working.replace(/\(([^)]+)\)/g, (full, innerRaw) => {
    const inner = String(innerRaw || '').trim();
    if (!inner) return ' ';

    const yearMatch = inner.match(/^(18\d{2}|19\d{2}|20[0-3]\d)$/);
    if (yearMatch) {
      if (!releaseYear) releaseYear = Number(yearMatch[1]);
      return ' ';
    }

    if (/^[IVX]{1,4}$/i.test(inner)) {
      extractedNotes.push(inner);
      return ' ';
    }

    if (PLATFORM_NOTE_REGEX.test(inner) || /netflix|nextflix|hbo|disney|prime|sequencia|ordem|anime|blu/i.test(inner)) {
      extractedNotes.push(inner);
      return ' ';
    }

    return full;
  });

  // 2. Remove anotações soltas no final sem parênteses ("ver o outro filme antes", "Blu Ray", etc.)
  for (let i = 0; i < 3; i++) {
    const m = working.match(TRAILING_NOTE_REGEX);
    if (!m) break;
    extractedNotes.push(m[0].trim());
    working = working.slice(0, m.index).trim();
  }

  // 3. Remove prefixo numérico de lista apenas quando tem espaço após o ponto (ex: "412. A Noite", "9. Berdreymi")
  const listPrefixMatch = working.match(/^(\d{1,4})\.\s+(.+)$/);
  if (listPrefixMatch) {
    extractedNotes.push(`#${listPrefixMatch[1]}`);
    working = listPrefixMatch[2].trim();
  }

  // 4. Remove aspas desbalanceadas e "+" solto nas extremidades sem corromper "'71" ou "10+"
  working = working.replace(/^["'`]+(?=[A-Za-zÀ-ÿ])/, '').trim();
  if (/^[^'"]+'$/.test(working) || /'$/.test(working) && !/^'\d+$/.test(working)) {
    working = working.replace(/['"+,;]+$/g, '').trim();
  } else {
    working = working.replace(/["+,;]+$/g, '').trim();
  }

  working = working.replace(/\s+/g, ' ').trim();
  const cleanedTitle = working || rawTitle;
  const cleanNorm = normalizeCompareText(cleanedTitle) || normalizeCompareText(rawTitle) || rawTitle.toLowerCase();

  return {
    rawTitle,
    rawYearStr,
    cleanedTitle,
    cleanNorm,
    releaseYear,
    notesExtracted: extractedNotes.length > 0 ? extractedNotes.join(' • ') : null,
  };
}

function buildSearchFallbackVariants(cleanedTitle: string, rawTitle: string): string[] {
  const variants: string[] = [];
  const push = (v: string) => {
    const t = v.trim();
    if (t && t.toLowerCase() !== cleanedTitle.toLowerCase() && !variants.includes(t)) {
      variants.push(t);
    }
  };

  const trailingYearMatch = cleanedTitle.match(/^(.{3,}?)\s+(18\d{2}|19\d{2}|20[0-3]\d)$/);
  if (trailingYearMatch) {
    push(trailingYearMatch[1]);
  }
  if (/\./.test(cleanedTitle)) {
    push(cleanedTitle.replace(/\./g, ' ').replace(/\s+/g, ' '));
    push(cleanedTitle.replace(/\./g, ''));
  }
  if (/&/.test(cleanedTitle)) {
    push(cleanedTitle.replace(/\s*&\s*/g, ' and '));
    push(cleanedTitle.replace(/\s*&\s*/g, ' e '));
  }
  if (cleanedTitle.includes(':')) {
    push(cleanedTitle.split(':')[0]);
  }
  if (cleanedTitle.includes(' - ')) {
    push(cleanedTitle.split(' - ')[0]);
  }
  if (rawTitle !== cleanedTitle) {
    push(rawTitle.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' '));
  }
  return variants;
}

function resolveDefaultSorteioPath(): string | null {
  const candidates = [
    path.resolve(process.cwd(), 'src/data/sorteio.xlsx'),
    path.resolve(process.cwd(), 'backend/src/data/sorteio.xlsx'),
    path.resolve(__dirname, '../data/sorteio.xlsx'),
  ];
  return candidates.find((p) => fs.existsSync(p)) || null;
}

interface CatalogWatchLookupRow {
  id: number;
  title: string;
  originalTitle: string | null;
  releaseYear: number | null;
  tmdbId: number | null;
  imdbId: string | null;
  normTitle: string;
  normOriginalTitle: string;
}

async function loadCatalogWatchLookup(): Promise<{
  byTmdbId: Map<number, CatalogWatchLookupRow>;
  byImdbId: Map<string, CatalogWatchLookupRow>;
  byTitleKey: Map<string, CatalogWatchLookupRow[]>;
}> {
  const res = await query(
    `SELECT id, title, original_title, release_year, tmdb_id, imdb_id FROM movies`
  );
  const byTmdbId = new Map<number, CatalogWatchLookupRow>();
  const byImdbId = new Map<string, CatalogWatchLookupRow>();
  const byTitleKey = new Map<string, CatalogWatchLookupRow[]>();

  for (const r of res.rows || []) {
    const item: CatalogWatchLookupRow = {
      id: Number(r.id),
      title: String(r.title || ''),
      originalTitle: r.original_title ? String(r.original_title) : null,
      releaseYear: r.release_year != null ? Number(r.release_year) : null,
      tmdbId: r.tmdb_id != null ? Number(r.tmdb_id) : null,
      imdbId: r.imdb_id ? String(r.imdb_id).trim().toLowerCase() : null,
      normTitle: normalizeCompareText(r.title),
      normOriginalTitle: normalizeCompareText(r.original_title),
    };
    if (item.tmdbId) byTmdbId.set(item.tmdbId, item);
    if (item.imdbId) byImdbId.set(item.imdbId, item);
    for (const k of [item.normTitle, item.normOriginalTitle]) {
      if (!k) continue;
      const list = byTitleKey.get(k);
      if (list) list.push(item);
      else byTitleKey.set(k, [item]);
    }
  }
  return { byTmdbId, byImdbId, byTitleKey };
}

function findMatchingCatalogMovie(
  lookup: Awaited<ReturnType<typeof loadCatalogWatchLookup>>,
  params: {
    tmdbId?: number | null;
    imdbId?: string | null;
    titles?: Array<string | null | undefined>;
    releaseYear?: number | null;
  }
): CatalogWatchLookupRow | null {
  if (params.tmdbId && lookup.byTmdbId.has(Number(params.tmdbId))) {
    return lookup.byTmdbId.get(Number(params.tmdbId))!;
  }
  const imdbClean = params.imdbId ? String(params.imdbId).trim().toLowerCase() : '';
  if (imdbClean && lookup.byImdbId.has(imdbClean)) {
    return lookup.byImdbId.get(imdbClean)!;
  }
  const norms = (params.titles || []).map(normalizeCompareText).filter(Boolean);
  for (const key of norms) {
    const candidates = lookup.byTitleKey.get(key);
    if (!candidates || candidates.length === 0) continue;
    if (!params.releaseYear) {
      if (candidates.length === 1) return candidates[0];
      continue;
    }
    const yearMatch = candidates.find(
      (c) => !c.releaseYear || Math.abs(c.releaseYear - params.releaseYear!) <= 1
    );
    if (yearMatch) return yearMatch;
  }
  return null;
}

export async function syncSecretDrawPoolFromBuffer(
  fileBuffer: Buffer,
  sourceName = 'sorteio.xlsx',
  options: { diskFileHash?: string | null; markMissingAsRemoved?: boolean } = {}
): Promise<{
  sourceName: string;
  totalRawRows: number;
  totalUniqueRows: number;
  dedupRemovedCount: number;
  alreadyWatchedAtSync: number;
  insertedCount: number;
}> {
  await ensureSecretDrawTables();

  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('A planilha enviada está vazia (nenhuma aba encontrada).');
  }
  const sheet = workbook.Sheets[sheetName];
  // CRITICAL: raw:false preserva títulos como '11/11/11' que seriam convertidos em serial Excel
  const rawRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, raw: false, defval: '' });

  const catalogLookup = await loadCatalogWatchLookup();
  const dedupMap = new Map<
    string,
    {
      sourceRow: number;
      rawTitle: string;
      rawYearStr: string;
      cleanedTitle: string;
      cleanNorm: string;
      releaseYear: number | null;
      notesExtracted: string | null;
      matchedCatalog: CatalogWatchLookupRow | null;
    }
  >();

  let totalRawRows = 0;
  let dedupRemovedCount = 0;
  const sampleNormalized: Array<{
    row: number;
    rawTitle: string;
    rawYearStr: string;
    cleanedTitle: string;
    releaseYear: number | null;
    notesExtracted: string | null;
  }> = [];

  for (let i = 0; i < rawRows.length; i++) {
    const row = Array.isArray(rawRows[i]) ? rawRows[i] : [];
    const col0 = String(row[0] ?? '').replace(/\u00A0/g, ' ').trim();
    const col1 = String(row[1] ?? '').replace(/\u00A0/g, ' ').trim();
    if (!col0) continue;

    // Pula eventual linha de cabeçalho literal caso alguém suba uma planilha com header
    if (i === 0 && /^(t[ií]tulo|title|filme|nome)$/i.test(col0) && /^(ano|year|lan[çc]amento|)$/i.test(col1)) {
      continue;
    }

    totalRawRows += 1;
    const cleaned = cleanSpreadsheetTitleAndYear(col0, col1);
    const dedupKey = `${cleaned.cleanNorm}::${cleaned.releaseYear ?? -1}`;

    if (dedupMap.has(dedupKey)) {
      dedupRemovedCount += 1;
      continue;
    }

    if (
      sampleNormalized.length < 18 &&
      (cleaned.cleanedTitle !== cleaned.rawTitle || Boolean(cleaned.notesExtracted) || (cleaned.rawYearStr && !/^\d{4}$/.test(cleaned.rawYearStr)))
    ) {
      sampleNormalized.push({
        row: i + 1,
        rawTitle: cleaned.rawTitle,
        rawYearStr: cleaned.rawYearStr,
        cleanedTitle: cleaned.cleanedTitle,
        releaseYear: cleaned.releaseYear,
        notesExtracted: cleaned.notesExtracted,
      });
    }

    const matchedCatalog = findMatchingCatalogMovie(catalogLookup, {
      titles: [cleaned.cleanedTitle, cleaned.rawTitle],
      releaseYear: cleaned.releaseYear,
    });

    dedupMap.set(dedupKey, {
      sourceRow: i + 1,
      rawTitle: cleaned.rawTitle,
      rawYearStr: cleaned.rawYearStr,
      cleanedTitle: cleaned.cleanedTitle,
      cleanNorm: cleaned.cleanNorm,
      releaseYear: cleaned.releaseYear,
      notesExtracted: cleaned.notesExtracted,
      matchedCatalog,
    });
  }

  const items = Array.from(dedupMap.values());
  let alreadyWatchedAtSync = 0;
  let insertedCount = 0;

  // Insere/atualiza em lotes rápidos sem fazer chamadas externas de API
  const BATCH_SIZE = 200;
  for (let start = 0; start < items.length; start += BATCH_SIZE) {
    const batch = items.slice(start, start + BATCH_SIZE);
    const values: any[] = [];
    const placeholders: string[] = [];

    batch.forEach((item, idx) => {
      const base = idx * 10;
      const status = item.matchedCatalog ? 'watched' : 'available';
      const skipReason = item.matchedCatalog
        ? `Já assistido no catálogo (${item.matchedCatalog.title}${item.matchedCatalog.releaseYear ? ` - ${item.matchedCatalog.releaseYear}` : ''})`
        : null;
      if (item.matchedCatalog) alreadyWatchedAtSync += 1;

      values.push(
        item.sourceRow,
        item.rawTitle,
        item.rawYearStr,
        item.cleanedTitle,
        item.cleanNorm,
        item.releaseYear,
        item.notesExtracted,
        status,
        item.matchedCatalog?.id ?? null,
        skipReason
      );
      placeholders.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10})`
      );
    });

    const res = await query(
      `INSERT INTO secret_draw_pool (
        source_row, raw_title, raw_year_str, cleaned_title, clean_norm,
        release_year, notes_extracted, status, matched_movie_id, skip_reason
      ) VALUES ${placeholders.join(', ')}
      ON CONFLICT (clean_norm, COALESCE(release_year, -1))
      DO UPDATE SET
        source_row = EXCLUDED.source_row,
        raw_title = EXCLUDED.raw_title,
        raw_year_str = EXCLUDED.raw_year_str,
        cleaned_title = EXCLUDED.cleaned_title,
        notes_extracted = COALESCE(EXCLUDED.notes_extracted, secret_draw_pool.notes_extracted),
        matched_movie_id = COALESCE(EXCLUDED.matched_movie_id, secret_draw_pool.matched_movie_id),
        status = CASE
          WHEN EXCLUDED.status = 'watched' AND secret_draw_pool.status IN ('available', 'removed') THEN 'watched'
          WHEN secret_draw_pool.status = 'removed' THEN EXCLUDED.status
          ELSE secret_draw_pool.status
        END,
        skip_reason = COALESCE(EXCLUDED.skip_reason, secret_draw_pool.skip_reason)`,
      values
    );
    insertedCount += res.rowCount || batch.length;
  }

  if (options.markMissingAsRemoved !== false && items.length > 0) {
    const activeKeys = items.map((it) => `${it.cleanNorm}::${it.releaseYear ?? -1}`);
    await query(
      `UPDATE secret_draw_pool
       SET status = 'removed'
       WHERE status = 'available'
         AND (clean_norm || '::' || COALESCE(release_year, -1)::text) <> ALL($1::text[])`,
      [activeKeys]
    );
  }

  let effectiveDiskHash = options.diskFileHash ?? null;
  if (!effectiveDiskHash) {
    const existingDiskPath = resolveDefaultSorteioPath();
    if (existingDiskPath && fs.existsSync(existingDiskPath)) {
      effectiveDiskHash = crypto.createHash('sha256').update(fs.readFileSync(existingDiskPath)).digest('hex');
    }
  }

  await query(
    `INSERT INTO secret_draw_sync_meta (
      id, last_sync_source, total_raw_rows, dedup_removed_count,
      already_watched_at_sync, sample_normalized_json, disk_file_hash, synced_at
    ) VALUES (1, $1, $2, $3, $4, $5::jsonb, $6, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO UPDATE SET
      last_sync_source = EXCLUDED.last_sync_source,
      total_raw_rows = EXCLUDED.total_raw_rows,
      dedup_removed_count = EXCLUDED.dedup_removed_count,
      already_watched_at_sync = EXCLUDED.already_watched_at_sync,
      sample_normalized_json = EXCLUDED.sample_normalized_json,
      disk_file_hash = COALESCE(EXCLUDED.disk_file_hash, secret_draw_sync_meta.disk_file_hash),
      synced_at = CURRENT_TIMESTAMP`,
    [sourceName, totalRawRows, dedupRemovedCount, alreadyWatchedAtSync, JSON.stringify(sampleNormalized), effectiveDiskHash]
  );

  return {
    sourceName,
    totalRawRows,
    totalUniqueRows: items.length,
    dedupRemovedCount,
    alreadyWatchedAtSync,
    insertedCount,
  };
}

let cachedPoolSheetState: { path: string; mtimeMs: number } | null = null;

export async function ensurePoolPopulatedIfEmpty(): Promise<void> {
  await ensureSecretDrawTables();
  const sheetPath = resolveDefaultSorteioPath();
  if (!sheetPath) return;

  const statMtime = fs.statSync(sheetPath).mtimeMs;
  if (
    cachedPoolSheetState &&
    cachedPoolSheetState.path === sheetPath &&
    cachedPoolSheetState.mtimeMs === statMtime
  ) {
    return;
  }

  const [countRes, metaRes] = await Promise.all([
    query(`SELECT COUNT(*)::int AS cnt FROM secret_draw_pool`),
    query(`SELECT disk_file_hash FROM secret_draw_sync_meta WHERE id = 1`),
  ]);

  const cnt = Number(countRes.rows[0]?.cnt || 0);
  const storedHash = metaRes.rows[0]?.disk_file_hash ? String(metaRes.rows[0].disk_file_hash) : null;
  const buf = fs.readFileSync(sheetPath);
  const currentHash = crypto.createHash('sha256').update(buf).digest('hex');

  if (cnt === 0 || !storedHash || storedHash !== currentHash) {
    await syncSecretDrawPoolFromBuffer(buf, path.basename(sheetPath), {
      diskFileHash: currentHash,
      markMissingAsRemoved: true,
    });
  }
  cachedPoolSheetState = { path: sheetPath, mtimeMs: statMtime };
}

// ============================================================================
// MOTOR DE PREVISÃO OBJETIVA (DESAFIO 195 + TEMPO + UNIVERSOS + FAMA + TROFÉUS)
// ============================================================================
const SUBJECTIVE_TARGET_TYPES = new Set([
  'platinum_dynamic',
  'tag_movie_count',
  'tag_double_and',
  'tag_hybrid_country',
  'tag_checklist_quota',
  'movie_zero_tags_count',
  'tag_platform_count',
  'tag_month',
  'tag_min_rating_count',
  'tag_multi_or_and',
  'tag_pool_sum',
  'tag_hybrid_exclude_country',
  'tag_hybrid_asian_horror',
  'tag_hybrid_continent',
  'genre_tag_and',
  'tag_and_tag_or_month',
  'tag_and_any_of_tags',
  'movies_min_tags_count',
  'terror_tragico_min_rating',
  'tags_or_physical_media_count',
  'tag_and_genres_or_year_range',
  'tag_decades_checklist',
  'genre_and_tag_and_any_tag',
  'genre_and_tags_or_max_rating',
  'tag_max_rating_count',
  'tag_non_br_us_count',
  'triple_combo_brasil',
  'triple_combo_europa',
  'genre_month',
  'all_12_months_coverage',
  'month_movie_count',
  'quad_pride_sem_fronteiras',
  'tag_month_range',
  'tag_months',
  'genre_or_month',
  'tag_or_month',
  'quad_natal_classico',
  'quad_outubro_macabro_mundo',
  'quad_natal_macabro',
  'hollywood_studio_or_tag_count',
  'hybrid_shyamalan_paradox',
  'hybrid_15_countries_masterpieces',
  'hybrid_curador_joias_raras',
  'rt_lt_ur_gte_count',
  'multi_critic_range_count',
  'ritual_nomade_telas',
  'ritual_petista',
  'cinema_specific_months_count',
  'hybrid_genre_tag',
  'hybrid_genre_studio_month',
  'hybrid_pixar_emotional_animals',
  'hybrid_gore_twisted_lionsgate',
  'hybrid_disney_vacation_july_dec',
  'hybrid_disney_fox_horror',
  'hybrid_top250_oscar_winner',
  'hybrid_sk_oscar',
  'hybrid_seven_deadly_sins',
  'memorial_luto_cycles',
]);

const SUBJECTIVE_RULE_SUBSTRINGS = [
  'ur_',
  'month',
  'outubro',
  'agosto',
  'dezembro',
  'julho',
  'fevereiro',
  'janeiro',
  'novembro',
  'cinema',
  'youtube',
  'netflix',
  'hbo',
  'prime_video',
  'physical',
  'midia_fisica',
  'internet',
  'streaming',
  'pirata',
  'audio_',
  'dublada',
  'legendado',
  'same_year',
  'seen_after',
  'time_capsule',
  'celso',
  'minecraft',
  'marvel_dc',
  'sk_',
  'lgbt',
  'gore',
  'natal',
  'final_epico',
  'emocionante',
  'a24_ur',
  'a24_conceitual',
  'sem_animes',
  'sem_gore',
  'senna',
  'copa',
  'viajante_imortal',
  'checklist_777',
  'checkpoint_777',
  'red_critic',
  'pharmacist',
  'four_scores',
  'bomba_ray_tracing',
  'conceitual',
];

function isObjectiveTrophyDefinition(def: TrophyDefinition): boolean {
  if (SUBJECTIVE_TARGET_TYPES.has(def.target_type)) return false;
  if (def.target_type === 'critic_tribunal_rule' || def.target_type === 'ritual_cinefilo_rule' || def.target_type === 'multi_ritual_rule') {
    const rule = String(def.target_metadata?.rule || def.id || '').toLowerCase();
    if (!rule) return false;
    return !SUBJECTIVE_RULE_SUBSTRINGS.some((sub) => rule.includes(sub));
  }
  return true;
}

const OBJECTIVE_TROPHY_DEFS: TrophyDefinition[] = TROPHY_DEFINITIONS.filter(isObjectiveTrophyDefinition);

interface PredictionContext {
  worldData: WorldChallengePayload;
  timeMachineData: TimeMachinePayload;
  unconqueredWorldByCode: Map<string, { name: string; rarityTier: string; isHistorical: boolean }>;
  unconqueredYearSet: Set<number>;
  conqueredYearSet: Set<number>;
  universeCatalogRows: Array<{
    movie_id: number;
    title: string;
    original_title: string | null;
    release_year: number | null;
    poster_url: string | null;
    user_rating: number | null;
    imdb_rating: number | null;
    metacritic_score: number | null;
    rotten_tomatoes_score: number | null;
  }>;
  directorStarsByNorm: Map<string, Array<{ id: string; name: string; icon: string }>>;
  actorStarsByNorm: Map<string, Array<{ id: string; name: string; icon: string }>>;
  baseTrophyPrevStates: Map<string, PreviousCardState>;
  baseProgressMap: Map<string, { unlocked: boolean; progress: number; extraStars: number }>;
}

function buildStarLookupMaps(): {
  directorStarsByNorm: Map<string, Array<{ id: string; name: string; icon: string }>>;
  actorStarsByNorm: Map<string, Array<{ id: string; name: string; icon: string }>>;
} {
  const directorStarsByNorm = new Map<string, Array<{ id: string; name: string; icon: string }>>();
  const actorStarsByNorm = new Map<string, Array<{ id: string; name: string; icon: string }>>();

  const add = (map: Map<string, Array<{ id: string; name: string; icon: string }>>, key: string, val: { id: string; name: string; icon: string }) => {
    const norm = normalizeCompareText(key);
    if (!norm) return;
    const arr = map.get(norm) || [];
    if (!arr.some((x) => x.id === val.id)) arr.push(val);
    map.set(norm, arr);
  };

  for (const star of WALK_OF_FAME_STARS) {
    const info = { id: star.id, name: star.name, icon: star.icon || '🌟' };
    if (star.kind === 'director') {
      add(directorStarsByNorm, star.name, info);
      if (star.searchQuery) add(directorStarsByNorm, star.searchQuery, info);
    } else if (star.kind === 'actor') {
      add(actorStarsByNorm, star.name, info);
      if (star.searchQuery) add(actorStarsByNorm, star.searchQuery, info);
    } else if (star.kind === 'group' && Array.isArray(star.groupMembers)) {
      for (const member of star.groupMembers) {
        add(actorStarsByNorm, member.name, info);
        if (member.searchQuery) add(actorStarsByNorm, member.searchQuery, info);
      }
    }
  }
  return { directorStarsByNorm, actorStarsByNorm };
}

async function createPredictionContext(): Promise<PredictionContext> {
  const worldData = await buildWorldChallengePayload();
  const timeMachineData = await buildTimeMachinePayload(worldData);

  const unconqueredWorldByCode = new Map<string, { name: string; rarityTier: string; isHistorical: boolean }>();
  for (const c of worldData.countries || []) {
    if (c.status !== 'conquered') {
      unconqueredWorldByCode.set(c.code.toLowerCase(), {
        name: c.name,
        rarityTier: c.rarityTier || getCountryRarityTier(c.code),
        isHistorical: false,
      });
    }
  }
  for (const h of worldData.historicalCountries || []) {
    if (h.status !== 'conquered') {
      unconqueredWorldByCode.set(h.code.toLowerCase(), {
        name: h.name,
        rarityTier: 'relic',
        isHistorical: true,
      });
    }
  }

  const unconqueredYearSet = new Set<number>();
  const conqueredYearSet = new Set<number>();
  for (const y of timeMachineData.years || []) {
    const yr = Number(y.year);
    if (y.status === 'conquered') conqueredYearSet.add(yr);
    else unconqueredYearSet.add(yr);
  }

  const universeCatalogRows = (worldData.catalogMovies || []).map((m: any) => ({
    movie_id: Number(m.movie_id),
    title: String(m.title || ''),
    original_title: m.original_title ? String(m.original_title) : null,
    release_year: m.release_year != null ? Number(m.release_year) : null,
    poster_url: m.poster_url ? String(m.poster_url) : null,
    user_rating: m.user_rating != null ? Number(m.user_rating) : null,
    imdb_rating: m.imdb_rating != null ? Number(m.imdb_rating) : null,
    metacritic_score: m.metacritic_score != null ? Number(m.metacritic_score) : null,
    rotten_tomatoes_score: m.rotten_tomatoes_score != null ? Number(m.rotten_tomatoes_score) : null,
  }));

  const { directorStarsByNorm, actorStarsByNorm } = buildStarLookupMaps();

  const baseIndex = buildCatalogIndex(worldData);
  const baseEval = evaluateCatalogDefinitions(OBJECTIVE_TROPHY_DEFS, baseIndex, new Map(), { isBaseline: true });
  const baseTrophyPrevStates = new Map<string, PreviousCardState>();
  const baseProgressMap = new Map<string, { unlocked: boolean; progress: number; extraStars: number }>();

  for (const card of baseEval.cards) {
    baseTrophyPrevStates.set(card.id, {
      is_unlocked: card.is_unlocked,
      unlocked_at: card.unlocked_at,
      test_override: null,
      is_new: false,
      progress_current: card.progress_current,
      progress_target: card.progress_target,
      progress_percentage: card.progress_percentage,
      extra_stars: card.extra_stars ?? 0,
      ranks_state: Array.isArray(card.ranks) ? card.ranks.map((r) => ({ ...r })) : null,
    });
    baseProgressMap.set(card.id, {
      unlocked: card.is_unlocked,
      progress: card.progress_current,
      extraStars: card.extra_stars ?? 0,
    });
    if (Array.isArray(card.ranks)) {
      for (const r of card.ranks) {
        baseProgressMap.set(`${card.id}::${r.id}`, {
          unlocked: r.is_unlocked,
          progress: r.progress_current,
          extraStars: 0,
        });
      }
    }
  }

  return {
    worldData,
    timeMachineData,
    unconqueredWorldByCode,
    unconqueredYearSet,
    conqueredYearSet,
    universeCatalogRows,
    directorStarsByNorm,
    actorStarsByNorm,
    baseTrophyPrevStates,
    baseProgressMap,
  };
}

export function computeFindDifficulty(
  movie: ConsolidatedMovieData,
  resolvedTerritories: NonNullable<ReturnType<typeof resolveTerritoryDescriptor>>[]
): SecretDrawDifficulty {
  let score = 0;

  // 1. Alcance global (votos no IMDb/TMDB)
  const votes = Number(movie.vote_count || 0);
  if (votes === 0 || votes < 400) score += 7;
  else if (votes < 1500) score += 5;
  else if (votes < 6000) score += 3;
  else if (votes < 25000) score += 2;
  else if (votes < 90000) score += 1;
  else if (votes >= 220000) score -= 2;

  // 2. Circulação atual no TMDB
  const popularity = Number((movie.raw_api_data as any)?.tmdb?.popularity || 0);
  if (popularity > 0 && popularity < 1.2) score += 2;
  else if (popularity >= 1.2 && popularity < 4) score += 1;
  else if (popularity >= 18) score -= 1;

  // 3. Idioma original
  const origLang = String((movie.raw_api_data as any)?.tmdb?.original_language || '').toLowerCase().trim();
  const mediumForeignLangs = new Set(['es', 'fr', 'it', 'de', 'ja', 'ko']);
  if (origLang && origLang !== 'en' && origLang !== 'pt') {
    score += mediumForeignLangs.has(origLang) ? 1 : 2;
  }

  // 4. País de origem (eixo mainstream vs raridade geográfica)
  // Bônus nacional (-2): filmes EXCLUSIVAMENTE brasileiros (sem coprodução internacional) são muito mais fáceis de achar por aqui
  const rawCountriesCount = Array.isArray(movie.countries) ? movie.countries.length : 0;
  const isExclusivelyBrazil =
    rawCountriesCount === 1 &&
    resolvedTerritories.length === 1 &&
    resolvedTerritories[0].code.toLowerCase() === 'br';
  if (isExclusivelyBrazil) {
    score -= 2;
  }

  const mainstreamCodes = new Set(['us', 'gb', 'ca', 'au', 'br']);
  const hasMainstreamCountry = resolvedTerritories.some((t) => mainstreamCodes.has(t.code.toLowerCase()));
  if (!hasMainstreamCountry && resolvedTerritories.length > 0) {
    let maxGeoBonus = 1;
    for (const terr of resolvedTerritories) {
      if (terr.rarityTier === 'mythic' || terr.rarityTier === 'relic') maxGeoBonus = Math.max(maxGeoBonus, 4);
      else if (terr.rarityTier === 'legendary' || terr.rarityTier === 'epic') maxGeoBonus = Math.max(maxGeoBonus, 3);
      else if (terr.rarityTier === 'rare') maxGeoBonus = Math.max(maxGeoBonus, 2);
    }
    score += maxGeoBonus;
  }

  // 5. Época e formato (filmes antigos, curtas, épicos longos e documentários são mais difíceis de localizar)
  const relYear = movie.release_year ? Number(movie.release_year) : null;
  if (relYear && relYear < 1955) score += 3;
  else if (relYear && relYear < 1975) score += 2;
  else if (relYear && relYear < 1995) score += 1;

  const runtime = Number(movie.runtime || 0);
  if (runtime >= 185 || (runtime > 0 && runtime <= 45)) score += 1;

  const genresLower = (movie.genres || []).map((g) => String(g || '').toLowerCase());
  if (genresLower.some((g) => g.includes('document'))) score += 1;

  if (score >= 11) return 'exotic';
  if (score >= 8) return 'very_hard';
  if (score >= 5) return 'hard';
  if (score >= 2) return 'medium';
  return 'common';
}

function predictObjectiveMilestonesAndDifficulty(
  ctx: PredictionContext,
  movie: ConsolidatedMovieData
): {
  milestones: SecretDrawMilestonePrediction[];
  difficulty: SecretDrawDifficulty;
} {
  const milestones: SecretDrawMilestonePrediction[] = [];

  // 1. Desafio 195 Países + Territórios Relíquia (máximo 1 marco por filme, pois cada filme conquista apenas 1 país)
  const resolvedTerritories = (movie.countries || [])
    .map((c) => resolveTerritoryDescriptor(c))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  const isSingleCountry = resolvedTerritories.length <= 1;
  const newlyConquerableCodes = new Set<string>();
  const unconqueredEntries: Array<{
    name: string;
    isHistorical: boolean;
    rarityTier: SecretDrawMilestonePrediction['rarityTier'];
  }> = [];

  for (const terr of resolvedTerritories) {
    const codeLower = terr.code.toLowerCase();
    const unc = ctx.unconqueredWorldByCode.get(codeLower);
    if (unc) {
      newlyConquerableCodes.add(codeLower);
      unconqueredEntries.push({
        name: unc.name,
        isHistorical: Boolean(unc.isHistorical),
        rarityTier: unc.rarityTier,
      });
    }
  }

  if (unconqueredEntries.length === 1) {
    const u = unconqueredEntries[0];
    milestones.push({
      system: 'world_challenge',
      icon: u.isHistorical ? '⏳' : '🌍',
      label: `País inédito: ${u.name}`,
      detail: isSingleCountry ? '100% conquista direta ao cadastrar' : 'Coprodução (elegível na curadoria)',
      rarityTier: u.rarityTier,
    });
  } else if (unconqueredEntries.length > 1) {
    const uniqueNames = Array.from(new Set(unconqueredEntries.map((u) => u.name)));
    milestones.push({
      system: 'world_challenge',
      icon: unconqueredEntries.some((u) => u.isHistorical) ? '⏳' : '🌍',
      label: `País inédito: ${uniqueNames.join(' / ')}`,
      detail: 'Coprodução (desbloqueia 1 país inédito à sua escolha na curadoria)',
      rarityTier: unconqueredEntries[0].rarityTier,
    });
  }

  // 2. Máquina do Tempo
  const relYear = movie.release_year ? Number(movie.release_year) : null;
  if (relYear && ctx.unconqueredYearSet.has(relYear)) {
    const yEntry = (ctx.timeMachineData.years || []).find((y: any) => Number(y.year) === relYear);
    const yRarity = (yEntry?.rarityTier || 'common') as keyof typeof TIME_MACHINE_RARITY_META;
    const meta = TIME_MACHINE_RARITY_META[yRarity] || TIME_MACHINE_RARITY_META.common;
    milestones.push({
      system: 'time_machine',
      icon: '⏳',
      label: `Ano inédito: ${relYear} (${meta.label})`,
      detail: `+${meta.xp} XP na Máquina do Tempo`,
      rarityTier: yRarity,
    });

    const decStart = Math.floor(relYear / 10) * 10;
    const decEntry = (ctx.timeMachineData.decades || []).find((d) => Number(d.decadeStart) === decStart);
    if (decEntry && !decEntry.isRelicUnlocked && decEntry.conqueredCount === decEntry.relicTargetCount - 1) {
      const decXp = decEntry.relicXp || getDecadeCompletionXp(decEntry.id);
      milestones.push({
        system: 'time_machine',
        icon: '🕰️',
        label: `Completa a Década ${decEntry.label}!`,
        detail: `+${decXp} XP bônus de década completa`,
        rarityTier: 'legendary',
      });
    }
  }

  // 3. Códice dos Universos
  const synthUniverseRow = {
    movie_id: -999999,
    title: movie.title || '',
    original_title: movie.original_title || null,
    release_year: relYear,
    poster_url: movie.poster_url || null,
    user_rating: null,
    imdb_rating: movie.imdb_rating ?? null,
    metacritic_score: movie.metacritic_score ?? null,
    rotten_tomatoes_score: movie.rotten_tomatoes_score ?? null,
  };
  for (const saga of UNIVERSE_SAGAS) {
    const usedIds = new Set<number>();
    let matchedWatched = 0;
    for (const req of saga.movies) {
      const found = ctx.universeCatalogRows.find((cm) => !usedIds.has(cm.movie_id) && matchUniverseMovie(cm, req));
      if (found) {
        usedIds.add(found.movie_id);
        matchedWatched += 1;
      }
    }
    const matchesUnusedSlot = saga.movies.some((req) => {
      const alreadyOwned = ctx.universeCatalogRows.some((cm) => matchUniverseMovie(cm, req));
      return !alreadyOwned && matchUniverseMovie(synthUniverseRow, req);
    });
    if (matchesUnusedSlot) {
      const nextCount = matchedWatched + 1;
      const total = saga.movies.length;
      const hitsCheckpoint = saga.checkpoints.some((cp) => cp.threshold === nextCount);
      milestones.push({
        system: 'universe',
        icon: saga.icon || '🌌',
        label:
          nextCount === total
            ? `Completa Saga: ${saga.title}!`
            : hitsCheckpoint
              ? `Checkpoint em ${saga.title} (${nextCount}/${total})`
              : `Avança Saga: ${saga.title} (${nextCount}/${total})`,
        detail:
          nextCount === total
            ? 'Fecha 100% da saga no Códice'
            : hitsCheckpoint
              ? '+30 XP de checkpoint garantido'
              : 'Novo filme catalogado da saga',
        tier: saga.tier,
      });
    }
  }

  // 4. Álbum da Fama (Diretores, Elenco & Figurinhas Curadas)
  const matchedStarIds = new Set<string>();
  const normMovieTitles = [movie.title, movie.original_title]
    .map((t) => normalizeCompareText(t))
    .filter(Boolean);

  for (const dir of movie.directors || []) {
    const hits = ctx.directorStarsByNorm.get(normalizeCompareText(dir)) || [];
    for (const st of hits) {
      if (matchedStarIds.has(st.id)) continue;
      matchedStarIds.add(st.id);
      milestones.push({
        system: 'walk_of_fame',
        icon: st.icon,
        label: `Álbum (Diretor): ${st.name}`,
        detail: 'Conta progresso na Calçada dos Diretores',
      });
    }
  }
  const tmdbCast: any[] = Array.isArray(movie.raw_api_data?.tmdb?.credits?.cast)
    ? movie.raw_api_data.tmdb.credits.cast.slice(0, 30)
    : [];
  for (const c of tmdbCast) {
    const hits = ctx.actorStarsByNorm.get(normalizeCompareText(c?.name)) || [];
    for (const st of hits) {
      if (matchedStarIds.has(st.id)) continue;
      matchedStarIds.add(st.id);
      milestones.push({
        system: 'walk_of_fame',
        icon: st.icon,
        label: `Álbum (Elenco): ${st.name}`,
        detail: 'Conta progresso em figurinha do Álbum da Fama',
      });
    }
  }
  for (const star of WALK_OF_FAME_STARS) {
    if (matchedStarIds.has(star.id)) continue;
    const curatedList = getCuratedMoviesForStar(star.id);
    if (!curatedList || curatedList.length === 0) continue;
    const hitCurated = curatedList.find((req) => {
      if (req.year && relYear && Math.abs(Number(req.year) - Number(relYear)) > 1) return false;
      return (req.patterns || []).some((pat) => {
        const normPat = normalizeCompareText(pat);
        return normPat && normMovieTitles.some((mt) => mt === normPat || mt.includes(normPat));
      });
    });
    if (hitCurated) {
      matchedStarIds.add(star.id);
      milestones.push({
        system: 'walk_of_fame',
        icon: star.icon || '🌟',
        label: `Álbum (Figurinha): ${star.name}`,
        detail: 'Figurinha curada do Álbum da Fama',
      });
    }
  }

  // 5. Motor Oficial de Troféus Objetivos (simulação real em memória)
  const syntheticMovie = {
    movie_id: -999999,
    view_id: -999999,
    title: movie.title,
    original_title: movie.original_title || null,
    release_year: relYear,
    runtime: movie.runtime || null,
    poster_url: movie.poster_url || null,
    user_rating: null as any,
    imdb_rating: movie.imdb_rating ?? null,
    metacritic_score: movie.metacritic_score ?? null,
    rotten_tomatoes_score: movie.rotten_tomatoes_score ?? null,
    vote_count: movie.vote_count ?? null,
    month_seen: null,
    year_seen: null,
    audio_type: null,
    platform: null,
    watched_at: null,
    directors: movie.directors || [],
    writers: movie.writers || [],
    studios: movie.studios || [],
    distributor: movie.distributor || null,
    countries: movie.countries || [],
    tags: [],
    genres: movie.genres || [],
    coproductionCountries: resolvedTerritories,
    defaultCountryCode: resolvedTerritories[0]?.code || null,
    primaryCountryCode: isSingleCountry ? resolvedTerritories[0]?.code || null : null,
    primaryCountryName: isSingleCountry ? resolvedTerritories[0]?.name || null : null,
    originMode: isSingleCountry ? 'manual' : 'auto',
    oscar_wins: movie.oscar_wins || 0,
    oscar_nominations: movie.oscar_nominations || 0,
    raw_api_data: movie.raw_api_data || null,
  };

  const simWorldData: any = {
    ...ctx.worldData,
    catalogMovies: [...(ctx.worldData.catalogMovies || []), syntheticMovie],
    countries:
      isSingleCountry && newlyConquerableCodes.size > 0
        ? (ctx.worldData.countries || []).map((c: any) =>
            newlyConquerableCodes.has(String(c.code).toLowerCase()) ? { ...c, status: 'conquered' } : c
          )
        : ctx.worldData.countries,
  };

  const simIndex = buildCatalogIndex(simWorldData);
  const simEval = evaluateCatalogDefinitions(OBJECTIVE_TROPHY_DEFS, simIndex, ctx.baseTrophyPrevStates, {
    includeChecklists: false,
  });

  const unlockedTrophyIdsInSim = new Set<string>();
  for (const unl of simEval.newlyUnlocked) {
    unlockedTrophyIdsInSim.add(unl.id);
    milestones.push({
      system: 'trophy',
      icon: unl.icon || '🏆',
      label: `Desbloqueia Troféu: ${unl.title}`,
      detail: `Patente ${String(unl.tier || 'bronze').toUpperCase()} pronta para cair no cadastro`,
      tier: unl.tier,
    });
  }

  for (const simCard of simEval.cards) {
    const base = ctx.baseProgressMap.get(simCard.id);
    if (!base) continue;
    const nextExtraStars = simCard.extra_stars ?? 0;
    if (nextExtraStars > base.extraStars) {
      milestones.push({
        system: 'trophy',
        icon: '🌟',
        label: `+Estrela Infinita em ${simCard.title}`,
        detail: `Vai de ★${base.extraStars} para ★${nextExtraStars}`,
        tier: 'mythic',
      });
      continue;
    }
    if (!simCard.is_unlocked && !unlockedTrophyIdsInSim.has(simCard.id) && simCard.progress_current > base.progress) {
      const targetStr = simCard.progress_target ? `/${simCard.progress_target}` : '';
      milestones.push({
        system: 'trophy',
        icon: simCard.icon || '🏅',
        label: `Avança Troféu: ${simCard.title}`,
        detail: `Progresso ${base.progress}${targetStr} → ${simCard.progress_current}${targetStr}`,
        tier: simCard.tier,
      });
    }
  }

  // Dificuldade reflete exclusivamente quão raro/difícil é achar esse filme (independente dos marcos!)
  const difficulty = computeFindDifficulty(movie, resolvedTerritories);

  // Prioriza desbloqueios, países, anos, sagas e Álbum da Fama acima de barras "+1" parciais de troféus!
  const priorityOrder: Record<SecretDrawMilestonePrediction['system'], number> = {
    world_challenge: 0,
    time_machine: 1,
    universe: 2,
    walk_of_fame: 3,
    trophy: 4,
  };
  milestones.sort((a, b) => {
    const aHigh =
      a.system === 'walk_of_fame' ||
      a.label.startsWith('Desbloqueia') ||
      a.label.startsWith('Completa') ||
      a.label.startsWith('País') ||
      a.label.startsWith('Ano')
        ? 0
        : 1;
    const bHigh =
      b.system === 'walk_of_fame' ||
      b.label.startsWith('Desbloqueia') ||
      b.label.startsWith('Completa') ||
      b.label.startsWith('País') ||
      b.label.startsWith('Ano')
        ? 0
        : 1;
    if (aHigh !== bHigh) return aHigh - bHigh;
    return priorityOrder[a.system] - priorityOrder[b.system];
  });

  return {
    milestones: milestones.slice(0, 16),
    difficulty,
  };
}

function toResolvedCardData(
  movie: ConsolidatedMovieData,
  extra: {
    usedFallbackQuery?: string | null;
    usedNoYearFallback?: boolean;
    sagaRedirect?: SecretDrawCardResolvedData['sagaRedirect'];
  } = {}
): SecretDrawCardResolvedData {
  return {
    tmdbId: movie.tmdb_id ?? null,
    imdbId: movie.imdb_id ?? null,
    title: movie.title,
    originalTitle: movie.original_title || null,
    releaseYear: movie.release_year ?? null,
    runtime: movie.runtime ?? null,
    posterUrl: movie.poster_url || null,
    synopsis: movie.synopsis || null,
    countries: Array.isArray(movie.countries) ? movie.countries : [],
    genres: Array.isArray(movie.genres) ? movie.genres : [],
    directors: Array.isArray(movie.directors) ? movie.directors : [],
    writers: Array.isArray(movie.writers) ? movie.writers : [],
    studios: Array.isArray(movie.studios) ? movie.studios : [],
    distributor: movie.distributor || null,
    imdbRating: movie.imdb_rating ?? null,
    metacriticScore: movie.metacritic_score ?? null,
    rottenTomatoesScore: movie.rotten_tomatoes_score ?? null,
    voteCount: movie.vote_count ?? null,
    oscarWins: movie.oscar_wins || 0,
    oscarNominations: movie.oscar_nominations || 0,
    usedFallbackQuery: extra.usedFallbackQuery ?? null,
    usedNoYearFallback: extra.usedNoYearFallback ?? false,
    sagaRedirect: extra.sagaRedirect ?? null,
  };
}

async function resolvePoolCandidate(row: any): Promise<{
  movie: ConsolidatedMovieData | null;
  usedFallbackQuery: string | null;
  usedNoYearFallback: boolean;
  errorMessage?: string;
}> {
  if (row.resolved_json && typeof row.resolved_json === 'object' && row.resolved_json.title) {
    return {
      movie: row.resolved_json as ConsolidatedMovieData,
      usedFallbackQuery: null,
      usedNoYearFallback: false,
    };
  }

  const cleanedTitle = String(row.cleaned_title || row.raw_title || '').trim();
  const rawTitle = String(row.raw_title || '').trim();
  const releaseYear = row.release_year != null ? Number(row.release_year) : undefined;
  const variants = buildSearchFallbackVariants(cleanedTitle, rawTitle);

  try {
    const movie = await fetchMovieDetailsByTitle(cleanedTitle, releaseYear, undefined, undefined, variants[0]);
    const matchedAlt =
      variants[0] && normalizeCompareText(movie.title) !== normalizeCompareText(cleanedTitle) ? variants[0] : null;
    await query(
      `UPDATE secret_draw_pool
       SET tmdb_id = $2, imdb_id = $3, resolved_json = $4::jsonb, last_checked_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [row.id, movie.tmdb_id ?? null, movie.imdb_id ?? null, JSON.stringify(movie)]
    );
    return { movie, usedFallbackQuery: matchedAlt, usedNoYearFallback: false };
  } catch (err: any) {
    // Tenta variantes extras (com ano primeiro, depois sem ano se divergir da estreia)
    for (const variant of variants) {
      try {
        const altMovie = await fetchMovieDetailsByTitle(variant, releaseYear);
        await query(
          `UPDATE secret_draw_pool
           SET tmdb_id = $2, imdb_id = $3, resolved_json = $4::jsonb, last_checked_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [row.id, altMovie.tmdb_id ?? null, altMovie.imdb_id ?? null, JSON.stringify(altMovie)]
        );
        return {
          movie: altMovie,
          usedFallbackQuery: variant,
          usedNoYearFallback: Boolean(releaseYear && altMovie.release_year && Math.abs(altMovie.release_year - releaseYear) > 1),
        };
      } catch {
        // segue próxima variante
      }
    }
    return {
      movie: null,
      usedFallbackQuery: null,
      usedNoYearFallback: false,
      errorMessage: err?.message || 'Não encontrado no TMDB.',
    };
  }
}

function buildMysteryTeaser(milestones: SecretDrawMilestonePrediction[], difficulty: SecretDrawDifficulty): string {
  const total = milestones.length;
  const meta = SECRET_DRAW_DIFFICULTY_META[difficulty];
  if (total === 0) {
    return `${meta.icon} Carta ${meta.label} (+${meta.xp} XP) — nenhum marco objetivo lacrado; surpresa pura na sessão!`;
  }
  return `${meta.icon} Carta ${meta.label} (+${meta.xp} XP) • ${total} marco${total > 1 ? 's' : ''} misterioso${total > 1 ? 's' : ''} oculto${total > 1 ? 's' : ''} — vire para descobrir!`;
}

const SEQUENTIAL_UNIVERSE_MEGA_IDS = new Set(['mega_mcu', 'mega_star_wars', 'mega_xmen']);

async function fetchTmdbCollectionParts(
  collectionId: number,
  cache: Map<number, any[]>
): Promise<any[]> {
  if (cache.has(collectionId)) return cache.get(collectionId)!;
  const token = process.env.TMDB_BEARER_TOKEN;
  if (!token) {
    cache.set(collectionId, []);
    return [];
  }
  try {
    const res = await axios.get(`https://api.themoviedb.org/3/collection/${collectionId}`, {
      params: { language: 'pt-BR' },
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      timeout: 6000,
    });
    const parts = Array.isArray(res.data?.parts) ? res.data.parts : [];
    const todayIso = new Date().toISOString().slice(0, 10);
    const released = parts
      .filter((p: any) => p?.id && p?.release_date && String(p.release_date) <= todayIso)
      .sort((a: any, b: any) => String(a.release_date).localeCompare(String(b.release_date)));
    cache.set(collectionId, released);
    return released;
  } catch {
    cache.set(collectionId, []);
    return [];
  }
}

async function resolveSagaOrderForCandidate(params: {
  movie: ConsolidatedMovieData;
  predCtx: PredictionContext;
  catalogLookup: Awaited<ReturnType<typeof loadCatalogWatchLookup>>;
  collectionCache: Map<number, any[]>;
  sagaRule: SecretDrawSagaRule;
}): Promise<
  | { action: 'keep'; movie: ConsolidatedMovieData }
  | { action: 'skip'; sagaTitle: string; originalOrder: number; targetTitle: string; targetOrder: number }
  | {
      action: 'redirect';
      redirectedMovie: ConsolidatedMovieData;
      sagaRedirect: NonNullable<SecretDrawCardResolvedData['sagaRedirect']>;
    }
> {
  const { movie, predCtx, catalogLookup, collectionCache, sagaRule } = params;
  if (sagaRule === 'allow_any') {
    return { action: 'keep', movie };
  }

  // 1. Prioridade: Coleção oficial do TMDB (cobre praticamente todas as franquias sequenciais do cinema)
  const colRef = (movie.raw_api_data as any)?.tmdb?.belongs_to_collection;
  if (colRef?.id) {
    const parts = await fetchTmdbCollectionParts(Number(colRef.id), collectionCache);
    if (parts.length >= 2) {
      const curIdx = parts.findIndex((p: any) => Number(p.id) === Number(movie.tmdb_id));
      if (curIdx > 0) {
        for (let idx = 0; idx < curIdx; idx++) {
          const prevPart = parts[idx];
          const prevYear = parseRawYearValue(String(prevPart.release_date || '').slice(0, 4));
          const alreadyWatched = findMatchingCatalogMovie(catalogLookup, {
            tmdbId: Number(prevPart.id),
            titles: [prevPart.title, prevPart.original_title],
            releaseYear: prevYear,
          });
          if (!alreadyWatched) {
            const targetTitle = String(prevPart.title || prevPart.original_title || '');
            if (sagaRule === 'skip_sequels') {
              return {
                action: 'skip',
                sagaTitle: String(colRef.name || 'Saga'),
                originalOrder: curIdx + 1,
                targetTitle,
                targetOrder: idx + 1,
              };
            }
            try {
              const redirectedMovie = await fetchMovieDetailsByTitle(
                targetTitle,
                prevYear ?? undefined,
                Number(prevPart.id)
              );
              return {
                action: 'redirect',
                redirectedMovie,
                sagaRedirect: {
                  sagaTitle: String(colRef.name || 'Saga'),
                  originalTitle: movie.title,
                  originalYear: movie.release_year ?? null,
                  originalOrder: curIdx + 1,
                  redirectedOrder: idx + 1,
                  totalChapters: parts.length,
                },
              };
            } catch {
              return { action: 'keep', movie };
            }
          }
        }
      }
    }
  }

  // 2. Fallback: Sagas lineares do Códice dos Universos (MCU Fases, Star Wars, X-Men)
  const rowForUni = {
    movie_id: -999999,
    title: movie.title || '',
    original_title: movie.original_title || null,
    release_year: movie.release_year ?? null,
    poster_url: null,
    user_rating: null,
    imdb_rating: null,
    metacritic_score: null,
    rotten_tomatoes_score: null,
  };

  for (const saga of UNIVERSE_SAGAS) {
    if (!saga.megaSagaId || !SEQUENTIAL_UNIVERSE_MEGA_IDS.has(saga.megaSagaId)) continue;
    const sortedMovies = [...saga.movies].sort((a, b) => a.order - b.order);
    const matchedIdx = sortedMovies.findIndex((req) => matchUniverseMovie(rowForUni, req));
    if (matchedIdx <= 0) continue;

    for (let i = 0; i < matchedIdx; i++) {
      const prevReq = sortedMovies[i];
      const alreadyWatched = predCtx.universeCatalogRows.some((cm) => matchUniverseMovie(cm, prevReq));
      if (!alreadyWatched) {
        if (sagaRule === 'skip_sequels') {
          return {
            action: 'skip',
            sagaTitle: saga.title,
            originalOrder: sortedMovies[matchedIdx].order,
            targetTitle: prevReq.title,
            targetOrder: prevReq.order,
          };
        }
        try {
          const redirectedMovie = await fetchMovieDetailsByTitle(
            prevReq.originalTitle || prevReq.title,
            prevReq.year
          );
          return {
            action: 'redirect',
            redirectedMovie,
            sagaRedirect: {
              sagaTitle: saga.title,
              originalTitle: movie.title,
              originalYear: movie.release_year ?? null,
              originalOrder: sortedMovies[matchedIdx].order,
              redirectedOrder: prevReq.order,
              totalChapters: sortedMovies.length,
            },
          };
        } catch {
          return { action: 'keep', movie };
        }
      }
    }
  }

  return { action: 'keep', movie };
}

function buildAssembledSecretDrawCard(
  row: any,
  movie: ConsolidatedMovieData,
  seat: number,
  prediction: { milestones: SecretDrawMilestonePrediction[]; difficulty: SecretDrawDifficulty },
  parsedYear: number | null,
  resolvedExtra: Parameters<typeof toResolvedCardData>[1] = {}
): SecretDrawCard {
  const meta = SECRET_DRAW_DIFFICULTY_META[prediction.difficulty];
  const xpReward = SECRET_DRAW_XP_BY_DIFFICULTY[prediction.difficulty];
  return {
    seat,
    poolId: Number(row.id),
    difficulty: prediction.difficulty,
    difficultyLabel: meta.label,
    difficultyIcon: meta.icon,
    xpReward,
    milestones: prediction.milestones,
    totalMilestonesCount: prediction.milestones.length,
    mysteryTeaser: buildMysteryTeaser(prediction.milestones, prediction.difficulty),
    planilha: {
      sourceRow: Number(row.source_row || 0),
      rawTitle: String(row.raw_title),
      rawYearStr: String(row.raw_year_str || ''),
      cleanedTitle: String(row.cleaned_title),
      parsedYear,
      notesExtracted: row.notes_extracted ? String(row.notes_extracted) : null,
    },
    resolved: toResolvedCardData(movie, resolvedExtra),
  };
}

export async function rebuildSecretDrawCardFromPoolRow(
  row: any,
  seat: number,
  difficultyOverride?: SecretDrawDifficulty | null
): Promise<SecretDrawCard> {
  const movie = row.resolved_json as ConsolidatedMovieData;
  const predCtx = await createPredictionContext();
  const prediction = predictObjectiveMilestonesAndDifficulty(predCtx, movie);
  const effectivePrediction = difficultyOverride
    ? { ...prediction, difficulty: difficultyOverride }
    : prediction;
  return buildAssembledSecretDrawCard(row, movie, seat, effectivePrediction, row.release_year ?? null);
}

const SECRET_DIFFICULTY_RANK: Record<SecretDrawDifficulty, number> = {
  common: 1,
  medium: 2,
  hard: 3,
  very_hard: 4,
  exotic: 5,
};

const SECRET_DIFFICULTY_ORDER: SecretDrawDifficulty[] = [
  'common',
  'medium',
  'hard',
  'very_hard',
  'exotic',
];

function pickWeightedSpecialCardDef(excludeIds = new Set<SecretSpecialCardId>()): SecretSpecialCardDef {
  const pool = SECRET_SPECIAL_CARDS_CATALOG.filter((c) => !excludeIds.has(c.id));
  const candidates = pool.length > 0 ? pool : SECRET_SPECIAL_CARDS_CATALOG;
  const totalWeight = candidates.reduce((acc, c) => acc + Math.max(1, c.weight), 0);
  let r = Math.random() * totalWeight;
  for (const item of candidates) {
    r -= Math.max(1, item.weight);
    if (r <= 0) return item;
  }
  return candidates[0];
}

function buildSpecialEventSnapshot(
  def: SecretSpecialCardDef,
  variantIdx?: number | null
): SecretDrawCardSpecialEvent {
  const allVariants = [
    ...def.images,
    ...(def.altImages || []),
    ...(def.classicImages || []),
  ];
  // Em sorteios normais (variantIdx == null), sorteia EXCLUSIVAMENTE dentre as artes oficiais do Arlequim (def.images)
  const chosenImage =
    variantIdx != null && variantIdx >= 0 && variantIdx < allVariants.length
      ? allVariants[variantIdx]
      : def.images[Math.floor(Math.random() * Math.max(1, def.images.length))] || def.images[0];
  return {
    id: def.id,
    title: def.title,
    harlequinTitle: def.harlequinTitle || def.title,
    icon: def.icon,
    rarity: def.rarity,
    shortTag: def.shortTag,
    description: def.description,
    harlequinQuote: def.harlequinQuote,
    lore: def.lore,
    imageUrl: chosenImage,
    altImages: def.altImages || [],
    classicImages: def.classicImages || [],
    triggered: false,
    triggeredAt: null,
    resultSummary: null,
    outcomeData: null,
  };
}

function buildEmptyResolvedMetadata(): SecretDrawCardResolvedData {
  return {
    tmdbId: null,
    imdbId: null,
    title: '',
    originalTitle: null,
    releaseYear: null,
    runtime: null,
    posterUrl: null,
    genres: [],
    countries: [],
    directors: [],
    writers: [],
    studios: [],
    distributor: null,
    imdbRating: null,
    metacriticScore: null,
    rottenTomatoesScore: null,
    voteCount: null,
    oscarWins: 0,
    oscarNominations: 0,
    synopsis: null,
    usedFallbackQuery: null,
    usedNoYearFallback: false,
    sagaRedirect: null,
  };
}

interface SecretDrawDecoyContext {
  unconqueredYears?: number[];
  unconqueredCountries?: string[];
  timeMachineYears?: Array<{ year: number; rarityTier: string }>;
  preferUnconqueredYearChance?: number;
  maxDecoyRuntime?: number | null;
}

const FALLBACK_DECOY_COUNTRIES = [
  'Irã',
  'Polônia',
  'Coreia do Sul',
  'Dinamarca',
  'Bélgica',
  'Taiwan',
  'Hungria',
  'Noruega',
];

const FALLBACK_DECOY_TROPHIES = [
  'Avança Troféu: Cidadão do Mundo',
  'Avança Troféu: Arquivista do Tempo',
  'Avança Troféu: Lente Sem Fronteiras',
  'Avança Troféu: Colecionador de Eras',
];

const FALLBACK_DECOY_STARS = [
  'Álbum (Diretor): Marco da Curadoria',
  'Álbum (Elenco): Ícone Clássico',
  'Álbum (Figurinha): Achado Cult',
];

function buildDecoyContextFromPredCtx(predCtx: PredictionContext): SecretDrawDecoyContext {
  return {
    unconqueredYears: Array.from(predCtx.unconqueredYearSet),
    unconqueredCountries: Array.from(predCtx.unconqueredWorldByCode.values()).map((c) => c.name),
    timeMachineYears: (predCtx.timeMachineData?.years || []).map((y: any) => ({
      year: Number(y.year),
      rarityTier: String(y.rarityTier || 'common'),
    })),
  };
}

function buildRandomTimeMachineDecoy(decoyCtx?: SecretDrawDecoyContext): SecretDrawMilestonePrediction | null {
  const pool = Array.isArray(decoyCtx?.unconqueredYears) ? decoyCtx.unconqueredYears : [];
  if (pool.length === 0) return null;
  const yr = pool[Math.floor(Math.random() * pool.length)];
  const entry = decoyCtx?.timeMachineYears?.find((y) => Number(y.year) === Number(yr));
  const yRarity = (entry?.rarityTier || 'common') as keyof typeof TIME_MACHINE_RARITY_META;
  const meta = TIME_MACHINE_RARITY_META[yRarity] || TIME_MACHINE_RARITY_META.common;
  return {
    system: 'time_machine',
    icon: '⏳',
    label: `Ano inédito: ${yr} (${meta.label})`,
    detail: `+${meta.xp} XP na Máquina do Tempo`,
    rarityTier: yRarity,
  };
}

function buildRandomDecoyMilestones(
  count: number,
  decoyCtx?: SecretDrawDecoyContext
): SecretDrawMilestonePrediction[] {
  const safeCount = Math.max(1, Math.min(5, Math.round(Number(count) || 1)));
  const results: SecretDrawMilestonePrediction[] = [];
  const usedUniqueSystems = new Set<string>();
  const usedLabels = new Set<string>();

  const tmChance = decoyCtx?.preferUnconqueredYearChance ?? 0.42;
  if (Math.random() < tmChance) {
    const tm = buildRandomTimeMachineDecoy(decoyCtx);
    if (tm) {
      results.push(tm);
      usedUniqueSystems.add('time_machine');
      usedLabels.add(tm.label);
    }
  }

  for (let i = results.length; i < safeCount; i += 1) {
    const roll = Math.random();
    if (roll < 0.28 && !usedUniqueSystems.has('world_challenge')) {
      const countryPool =
        decoyCtx?.unconqueredCountries && decoyCtx.unconqueredCountries.length > 0
          ? decoyCtx.unconqueredCountries
          : FALLBACK_DECOY_COUNTRIES;
      const country = countryPool[Math.floor(Math.random() * countryPool.length)];
      const label = `País inédito: ${country}`;
      usedUniqueSystems.add('world_challenge');
      usedLabels.add(label);
      results.push({
        system: 'world_challenge',
        icon: '🌍',
        label,
        detail: 'Curadoria mundial',
      });
      continue;
    }

    if (roll < 0.46 && !usedUniqueSystems.has('time_machine')) {
      const tm = buildRandomTimeMachineDecoy(decoyCtx);
      if (tm) {
        usedUniqueSystems.add('time_machine');
        usedLabels.add(tm.label);
        results.push(tm);
        continue;
      }
    }

    if (roll < 0.62 && !usedUniqueSystems.has('walk_of_fame')) {
      const starLabel = FALLBACK_DECOY_STARS[Math.floor(Math.random() * FALLBACK_DECOY_STARS.length)];
      usedUniqueSystems.add('walk_of_fame');
      usedLabels.add(starLabel);
      results.push({
        system: 'walk_of_fame',
        icon: '🌟',
        label: starLabel,
        detail: 'Álbum da Fama',
      });
      continue;
    }

    if (roll < 0.70 && !usedUniqueSystems.has('universe')) {
      usedUniqueSystems.add('universe');
      results.push({
        system: 'universe',
        icon: '🌌',
        label: 'Avança Saga: Onda Mundial',
        detail: 'Capítulo de saga',
      });
      continue;
    }

    const availableTrophies = FALLBACK_DECOY_TROPHIES.filter((t) => !usedLabels.has(t));
    const tLabel =
      availableTrophies.length > 0
        ? availableTrophies[Math.floor(Math.random() * availableTrophies.length)]
        : FALLBACK_DECOY_TROPHIES[i % FALLBACK_DECOY_TROPHIES.length];
    usedLabels.add(tLabel);
    results.push({
      system: 'trophy',
      icon: '🏆',
      label: tLabel,
      detail: 'Progresso de troféu',
    });
  }
  return results;
}

function buildDecoyVisualFields(
  totalCount: number,
  decoyCtx?: SecretDrawDecoyContext
): {
  decoyMilestones: SecretDrawMilestonePrediction[];
  decoyYear: number;
  decoyRuntime: number;
} {
  const decoyMilestones = buildRandomDecoyMilestones(totalCount, decoyCtx);
  const tmDecoy = decoyMilestones.find((m) => m.system === 'time_machine');
  const parsedMatch = tmDecoy ? /(\d{4})/.exec(String(tmDecoy.label || '')) : null;
  let decoyYear = parsedMatch ? Number(parsedMatch[1]) : 0;
  if (!decoyYear) {
    const uYears = decoyCtx?.unconqueredYears;
    if (Array.isArray(uYears) && uYears.length > 0 && Math.random() < 0.5) {
      decoyYear = Number(uYears[Math.floor(Math.random() * uYears.length)]);
    } else {
      decoyYear = 1958 + Math.floor(Math.random() * 65);
    }
  }
  const maxRt = decoyCtx?.maxDecoyRuntime && decoyCtx.maxDecoyRuntime >= 85 ? decoyCtx.maxDecoyRuntime : null;
  const decoyRuntime = maxRt
    ? 82 + Math.floor(Math.random() * Math.max(8, maxRt - 82))
    : 84 + Math.floor(Math.random() * 68);
  return { decoyMilestones, decoyYear, decoyRuntime };
}

function scrubSpecialSeatCard(
  card: SecretDrawCard,
  event: SecretDrawCardSpecialEvent,
  decoyCtx?: SecretDrawDecoyContext
): SecretDrawCard {
  const totalCount =
    card.totalMilestonesCount > 0
      ? Math.min(4, card.totalMilestonesCount)
      : 1 + Math.floor(Math.random() * 3);
  const decoys = event.triggered ? null : buildDecoyVisualFields(totalCount, decoyCtx);
  return {
    ...card,
    poolId: 0,
    milestones: [],
    totalMilestonesCount: totalCount,
    decoyMilestones: decoys ? decoys.decoyMilestones : null,
    decoyYear: decoys ? decoys.decoyYear : null,
    decoyRuntime: decoys ? decoys.decoyRuntime : null,
    simpleMilestonesHint: event.triggered ? false : card.simpleMilestonesHint,
    mysteryTeaser: 'Carta fechada com brilho misterioso.',
    specialEvent: event,
    resolved: buildEmptyResolvedMetadata(),
  };
}

function assignRoundRewardModesToCards(
  cards: SecretDrawCard[],
  auditLog?: SecretDrawAuditEntry[]
): void {
  if (!Array.isArray(cards) || cards.length === 0) return;
  const total = cards.length;
  const goldCount =
    total % 2 === 0
      ? total / 2
      : Math.random() < 0.5
      ? Math.floor(total / 2)
      : Math.ceil(total / 2);

  const modes: Array<'xp' | 'gold'> = [
    ...Array.from({ length: goldCount }, () => 'gold' as const),
    ...Array.from({ length: Math.max(0, total - goldCount) }, () => 'xp' as const),
  ];
  for (let i = modes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [modes[i], modes[j]] = [modes[j], modes[i]];
  }

  const cardBySeat = new Map<number, SecretDrawCard>();
  for (let i = 0; i < cards.length; i += 1) {
    const c = cards[i];
    const mode = modes[i] || 'xp';
    const basePts = Math.max(
      10,
      Number(c.xpReward || SECRET_DRAW_XP_BY_DIFFICULTY[c.difficulty || 'common'] || 35)
    );
    if (mode === 'gold') {
      const goldVal = computeSecretGoldFromPoints(basePts);
      cards[i] = {
        ...c,
        rewardMode: 'gold',
        goldReward: goldVal,
        xpReward: 0,
      };
    } else {
      cards[i] = {
        ...c,
        rewardMode: 'xp',
        goldReward: 0,
        xpReward: basePts,
      };
    }
    cardBySeat.set(Number(cards[i].seat), cards[i]);
  }

  if (Array.isArray(auditLog)) {
    for (const entry of auditLog) {
      if (entry.seat == null || entry.outcome !== 'selected') continue;
      const updated = cardBySeat.get(Number(entry.seat));
      if (!updated) continue;
      entry.rewardMode = updated.rewardMode;
      entry.goldReward = updated.goldReward;
      entry.xpReward = updated.xpReward;
      if (updated.rewardMode === 'gold') {
        entry.message = entry.message.replace(/\(\+\d+\s*XP/i, `(+${updated.goldReward} 🪙`);
      }
    }
  }
}

async function assignDisguisedSpecialsToCards(
  cards: SecretDrawCard[],
  auditLog?: SecretDrawAuditEntry[],
  options: { stormActive?: boolean; radarActive?: boolean; decoyCtx?: SecretDrawDecoyContext } = {}
): Promise<void> {
  if (!Array.isArray(cards) || cards.length === 0) return;
  let targetCount = 1;
  if (options.stormActive) {
    const safeMin = Math.min(2, cards.length);
    const safeMax = Math.max(safeMin, Math.min(6, cards.length > 2 ? cards.length - 1 : cards.length));
    targetCount = safeMin + Math.floor(Math.random() * (safeMax - safeMin + 1));
  } else {
    const maxSpecials = cards.length <= 4 ? 1 : cards.length <= 7 ? 2 : 3;
    targetCount = cards.length <= 3 ? 1 : 1 + Math.floor(Math.random() * maxSpecials);
  }
  const shuffledSeats = cards.map((c) => c.seat).sort(() => Math.random() - 0.5);
  const chosenSeats = new Set(shuffledSeats.slice(0, Math.min(targetCount, cards.length)));
  const usedIds = new Set<SecretSpecialCardId>();
  const releasedPoolIds: number[] = [];

  for (let i = 0; i < cards.length; i += 1) {
    const card = cards[i];
    if (!chosenSeats.has(card.seat)) continue;
    const def = pickWeightedSpecialCardDef(usedIds);
    usedIds.add(def.id);
    if (card.poolId) releasedPoolIds.push(Number(card.poolId));

    // Remove completamente os metadados do filme subjacente para nunca vazar "um filme que seria ali"
    const scrubbed = scrubSpecialSeatCard(card, buildSpecialEventSnapshot(def), options.decoyCtx);
    cards[i] = options.radarActive ? { ...scrubbed, specialPulseHint: true } : scrubbed;

    if (Array.isArray(auditLog)) {
      for (const entry of auditLog) {
        if (entry.seat === card.seat && entry.outcome === 'selected') {
          entry.resolvedTitle = 'Disfarce Especial';
          entry.resolvedOriginalTitle = null;
          entry.resolvedYear = null;
          entry.tmdbId = null;
          entry.message = `Carta #${card.seat} reservada com Disfarce Especial (Evento Puro).`;
        }
      }
    }
  }

  if (releasedPoolIds.length > 0) {
    await query(
      `UPDATE secret_draw_pool SET status = 'available' WHERE id = ANY($1::int[]) AND status = 'drawn'`,
      [releasedPoolIds]
    );
  }
}

async function resolveFreshMovieBatchForSeats(params: {
  targetSeats: number[];
  sagaRule: SecretDrawSagaRule;
  activeBuff?: SecretDrawPowerBuff | null;
  excludeKeys?: Set<string>;
}): Promise<{ cards: SecretDrawCard[]; auditLog: SecretDrawAuditEntry[]; decoyCtx: SecretDrawDecoyContext }> {
  const { targetSeats, sagaRule, activeBuff = null, excludeKeys } = params;
  if (targetSeats.length === 0) return { cards: [], auditLog: [], decoyCtx: {} };

  const [catalogLookup, predCtx, blockedTmdbRes] = await Promise.all([
    loadCatalogWatchLookup(),
    createPredictionContext(),
    query(`SELECT tmdb_id FROM secret_draw_pool WHERE status IN ('declined', 'completed', 'drawn') AND tmdb_id IS NOT NULL`),
  ]);

  const blockedTmdbSet = new Set<number>(
    (blockedTmdbRes.rows || []).map((r: any) => Number(r.tmdb_id)).filter((n: number) => n > 0)
  );
  const collectionCache = new Map<number, any[]>();
  const cards: SecretDrawCard[] = [];
  const auditLog: SecretDrawAuditEntry[] = [];
  const visitedPoolIds = new Set<number>();
  const seenResolvedKeys = new Set<string>(excludeKeys || []);
  const targetCount = targetSeats.length;
  let attempt = 0;
  const preferCachedOrder = Boolean(
    targetCount > 8 ||
      activeBuff?.filterMaxRuntime ||
      activeBuff?.minDifficulty ||
      activeBuff?.prioritizeUnconqueredYears
  );
  const MAX_TOTAL_ATTEMPTS = Math.max(40, targetCount * 8 + 20);

  while (cards.length < targetCount && attempt < MAX_TOTAL_ATTEMPTS) {
    const remaining = targetCount - cards.length;
    const needed = Math.min(remaining + (attempt === 0 ? 3 : 2), preferCachedOrder ? 12 : 8);
    const excludeArr = Array.from(visitedPoolIds);
    const orderSql = preferCachedOrder ? `(resolved_json IS NOT NULL) DESC, RANDOM()` : `RANDOM()`;
    const pickRes = await query(
      `SELECT *
       FROM secret_draw_pool
       WHERE status = 'available'
         AND ($1::int[] = '{}'::int[] OR id <> ALL($1::int[]))
       ORDER BY ${orderSql}
       LIMIT $2`,
      [excludeArr, needed]
    );

    if (pickRes.rows.length === 0) break;
    for (const r of pickRes.rows) visitedPoolIds.add(Number(r.id));

    const resolutions = await Promise.all(
      pickRes.rows.map(async (row) => {
        const preMatch = findMatchingCatalogMovie(catalogLookup, {
          tmdbId: row.tmdb_id,
          imdbId: row.imdb_id,
          titles: [row.cleaned_title, row.raw_title],
          releaseYear: row.release_year != null ? Number(row.release_year) : null,
        });
        if (preMatch) return { row, preMatch, resolution: null };
        const resolution = await resolvePoolCandidate(row);
        return { row, preMatch: null, resolution };
      })
    );

    for (const item of resolutions) {
      if (cards.length >= targetCount) break;
      attempt += 1;
      const row = item.row;
      const parsedYear = row.release_year != null ? Number(row.release_year) : null;
      const relaxedFallback = attempt >= Math.floor(MAX_TOTAL_ATTEMPTS * 0.72);

      if (item.preMatch) {
        await query(
          `UPDATE secret_draw_pool SET status = 'watched', matched_movie_id = $2, skip_reason = $3, last_checked_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [row.id, item.preMatch.id, `Já assistido no catálogo como "${item.preMatch.title}"`]
        );
        auditLog.push({
          attempt,
          poolId: Number(row.id),
          sourceRow: Number(row.source_row),
          rawTitle: String(row.raw_title),
          rawYearStr: String(row.raw_year_str || ''),
          cleanedTitle: String(row.cleaned_title),
          parsedYear,
          outcome: 'skipped_watched_before_api',
          matchedCatalogTitle: item.preMatch.title,
          matchedCatalogYear: item.preMatch.releaseYear,
          message: `Tentei sortear "${row.raw_title}"${parsedYear ? ` (${parsedYear})` : ''}, mas já está no catálogo como "${item.preMatch.title}" — sorteei outro!`,
        });
        continue;
      }

      const res = item.resolution;
      if (!res || !res.movie) {
        await query(
          `UPDATE secret_draw_pool SET status = 'not_found', skip_reason = $2, last_checked_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [row.id, res?.errorMessage || 'Não encontrado no TMDB']
        );
        auditLog.push({
          attempt,
          poolId: Number(row.id),
          sourceRow: Number(row.source_row),
          rawTitle: String(row.raw_title),
          rawYearStr: String(row.raw_year_str || ''),
          cleanedTitle: String(row.cleaned_title),
          parsedYear,
          outcome: 'skipped_not_found',
          message: `Tentei achar "${row.cleaned_title}"${parsedYear ? ` (${parsedYear})` : ''} (planilha: "${row.raw_title}"), mas não encontrei no TMDB — sorteei outro!`,
        });
        continue;
      }

      let movie = res.movie;
      const watchedAfterApi = findMatchingCatalogMovie(catalogLookup, {
        tmdbId: movie.tmdb_id,
        imdbId: movie.imdb_id,
        titles: [movie.title, movie.original_title],
        releaseYear: movie.release_year,
      });

      if (watchedAfterApi) {
        await query(
          `UPDATE secret_draw_pool SET status = 'watched', matched_movie_id = $2, skip_reason = $3 WHERE id = $1`,
          [row.id, watchedAfterApi.id, `Planilha "${row.raw_title}" bateu com TMDB "${movie.title}" que já estava no catálogo.`]
        );
        auditLog.push({
          attempt,
          poolId: Number(row.id),
          sourceRow: Number(row.source_row),
          rawTitle: String(row.raw_title),
          rawYearStr: String(row.raw_year_str || ''),
          cleanedTitle: String(row.cleaned_title),
          parsedYear,
          outcome: 'skipped_watched_after_tmdb',
          resolvedTitle: movie.title,
          resolvedOriginalTitle: movie.original_title || null,
          resolvedYear: movie.release_year ?? null,
          tmdbId: movie.tmdb_id ?? null,
          matchedCatalogTitle: watchedAfterApi.title,
          matchedCatalogYear: watchedAfterApi.releaseYear,
          message: `Tentei sortear "${row.raw_title}" → achei como "${movie.title}" (${movie.release_year || '?'}), mas você JÁ ASSISTIU ("${watchedAfterApi.title}")! Sorteando outro...`,
        });
        continue;
      }

      const sagaCheck = await resolveSagaOrderForCandidate({
        movie,
        predCtx,
        catalogLookup,
        collectionCache,
        sagaRule,
      });

      if (sagaCheck.action === 'skip') {
        auditLog.push({
          attempt,
          poolId: Number(row.id),
          sourceRow: Number(row.source_row),
          rawTitle: String(row.raw_title),
          rawYearStr: String(row.raw_year_str || ''),
          cleanedTitle: String(row.cleaned_title),
          parsedYear,
          outcome: 'skipped_saga_sequel',
          resolvedTitle: movie.title,
          resolvedYear: movie.release_year ?? null,
          tmdbId: movie.tmdb_id ?? null,
          message: `Pulei "${movie.title}" (Capítulo #${sagaCheck.originalOrder} de "${sagaCheck.sagaTitle}") porque "${sagaCheck.targetTitle}" (#${sagaCheck.targetOrder}) ainda não foi visto — sorteando outro!`,
        });
        continue;
      }

      let sagaRedirectMeta: SecretDrawCardResolvedData['sagaRedirect'] = null;
      if (sagaCheck.action === 'redirect') {
        const redir = sagaCheck.redirectedMovie;
        const redirWatched = findMatchingCatalogMovie(catalogLookup, {
          tmdbId: redir.tmdb_id,
          imdbId: redir.imdb_id,
          titles: [redir.title, redir.original_title],
          releaseYear: redir.release_year,
        });
        if (redirWatched || (redir.tmdb_id && blockedTmdbSet.has(Number(redir.tmdb_id)))) {
          auditLog.push({
            attempt,
            poolId: Number(row.id),
            sourceRow: Number(row.source_row),
            rawTitle: String(row.raw_title),
            rawYearStr: String(row.raw_year_str || ''),
            cleanedTitle: String(row.cleaned_title),
            parsedYear,
            outcome: 'skipped_saga_sequel',
            resolvedTitle: movie.title,
            tmdbId: movie.tmdb_id ?? null,
            message: `Tentei redirecionar "${movie.title}" para "${redir.title}" na saga "${sagaCheck.sagaRedirect.sagaTitle}", mas ele já estava concluído/declinado — sorteando outro!`,
          });
          continue;
        }
        sagaRedirectMeta = sagaCheck.sagaRedirect;
        movie = redir;
      }

      const dupKey = movie.tmdb_id
        ? `tmdb:${movie.tmdb_id}`
        : `${normalizeCompareText(movie.title)}:${movie.release_year || ''}`;
      if (seenResolvedKeys.has(dupKey)) {
        if (!sagaRedirectMeta) {
          await query(
            `UPDATE secret_draw_pool SET status = 'watched', skip_reason = $2 WHERE id = $1`,
            [row.id, `Duplicata na planilha resolvida para ${movie.title}`]
          );
        }
        auditLog.push({
          attempt,
          poolId: Number(row.id),
          sourceRow: Number(row.source_row),
          rawTitle: String(row.raw_title),
          rawYearStr: String(row.raw_year_str || ''),
          cleanedTitle: String(row.cleaned_title),
          parsedYear,
          outcome: 'skipped_duplicate_in_draw',
          resolvedTitle: movie.title,
          tmdbId: movie.tmdb_id ?? null,
          message: `Planilha "${row.raw_title}" resolveu para "${movie.title}", que já saiu neste sorteio — sorteando outro!`,
        });
        continue;
      }

      const prediction = predictObjectiveMilestonesAndDifficulty(predCtx, movie);

      if (!relaxedFallback && activeBuff?.filterMaxRuntime && movie.runtime && Number(movie.runtime) > activeBuff.filterMaxRuntime) {
        continue;
      }
      if (
        !relaxedFallback &&
        activeBuff?.minDifficulty &&
        SECRET_DIFFICULTY_RANK[prediction.difficulty] < SECRET_DIFFICULTY_RANK[activeBuff.minDifficulty]
      ) {
        continue;
      }
      if (
        !relaxedFallback &&
        activeBuff?.prioritizeUnconqueredYears &&
        cards.length < Math.min(4, targetSeats.length) &&
        attempt < 22 &&
        !prediction.milestones.some((m) => m.system === 'time_machine')
      ) {
        continue;
      }

      seenResolvedKeys.add(dupKey);
      const seat = targetSeats[cards.length];
      await query(`UPDATE secret_draw_pool SET status = 'drawn' WHERE id = $1`, [row.id]);

      const card = buildAssembledSecretDrawCard(
        row,
        movie,
        seat,
        prediction,
        parsedYear,
        {
          usedFallbackQuery: sagaRedirectMeta ? null : res.usedFallbackQuery,
          usedNoYearFallback: sagaRedirectMeta ? false : res.usedNoYearFallback,
          sagaRedirect: sagaRedirectMeta,
        }
      );
      const meta = SECRET_DRAW_DIFFICULTY_META[prediction.difficulty];
      const xpReward = card.xpReward;
      cards.push(card);

      auditLog.push({
        attempt,
        poolId: Number(row.id),
        sourceRow: Number(row.source_row),
        rawTitle: String(row.raw_title),
        rawYearStr: String(row.raw_year_str || ''),
        cleanedTitle: String(row.cleaned_title),
        parsedYear,
        outcome: 'selected',
        seat,
        difficulty: prediction.difficulty,
        xpReward,
        resolvedTitle: movie.title,
        resolvedOriginalTitle: movie.original_title || null,
        resolvedYear: movie.release_year ?? null,
        tmdbId: movie.tmdb_id ?? null,
        message: sagaRedirectMeta
          ? `Carta #${seat} (Ordem de Saga): "${row.raw_title}" era Cap. #${sagaRedirectMeta.originalOrder} de "${sagaRedirectMeta.sagaTitle}" → redirecionado para iniciar em "${movie.title}" (${movie.release_year || '?'}, Cap. #${sagaRedirectMeta.redirectedOrder}) • ${meta.label} (+${xpReward} XP, ${prediction.milestones.length} marcos).`
          : `Carta #${seat} definida: "${row.raw_title}" → "${movie.title}" (${movie.release_year || '?'}) • ${meta.label} (+${xpReward} XP, ${prediction.milestones.length} marcos).`,
      });
    }
  }

  return { cards, auditLog, decoyCtx: buildDecoyContextFromPredCtx(predCtx) };
}

export async function drawSecretCards(
  options: number | { requestedCount?: number | null; sagaRule?: SecretDrawSagaRule } = {}
): Promise<{
  round: SecretDrawRound;
  poolSummary: any;
}> {
  await ensurePoolPopulatedIfEmpty();

  // Verifica saldo de fichas do ciclo dias 1 e 15 (3 por recarga, acúmulo máx. 5) antes de consultar APIs
  const wallet = await ensureWeeklyChipsWallet();
  if (wallet.chipsRemaining <= 0) {
    throw new Error(
      `Suas fichas de sorteio acabaram (${wallet.weeklyAllowance} nos dias 1 e 15 do mês, máx. ${wallet.maxChipsBank})! Nova recarga: ${wallet.nextResetLabel}.`
    );
  }

  const activeBuff = await getSecretDrawPowerBuff();
  const [hasVipSeat, armedFlags] = await Promise.all([
    hasGuildRelic('vip_seat'),
    getSecretArmedFlags(),
  ]);
  const extraCardsArmed = Math.max(0, Number(armedFlags.pendingExtraCards || 0));

  // Regra das 2 fichas: a 1ª ficha da semana é SEMPRE sorteio aleatório (3 a 10); a 2ª libera escolher a quantidade!
  const rawRequested = typeof options === 'number' ? options : options?.requestedCount;
  const parsedRequested =
    wallet.canChooseCardCount && rawRequested != null && Number.isFinite(Number(rawRequested))
      ? Math.max(3, Math.min(10, Math.floor(Number(rawRequested))))
      : null;
  const baseCardCount = activeBuff?.forceCardCount
    ? Math.max(3, Math.min(15, Math.floor(Number(activeBuff.forceCardCount))))
    : parsedRequested ?? 3 + Math.floor(Math.random() * 8);
  const cardCount = Math.max(3, Math.min(18, baseCardCount + extraCardsArmed));
  const sagaRule: SecretDrawSagaRule =
    typeof options === 'object' && options?.sagaRule ? options.sagaRule : 'redirect_first';

  // Impede novo sorteio somente se a fila ativa já atingiu o limite máximo de filmes para assistir
  const activeCountRes = await query(
    `SELECT COUNT(*)::int AS cnt FROM secret_draw_picks WHERE status = 'active'`
  );
  const currentActiveCount = Number(activeCountRes.rows[0]?.cnt || 0);
  const effectiveActiveLimit =
    MAX_ACTIVE_SECRET_PICKS + (hasVipSeat ? 1 : 0) + (activeBuff?.allowExtraActivePick ? 1 : 0);
  if (currentActiveCount >= effectiveActiveLimit) {
    throw new Error(
      `Você já tem ${currentActiveCount}/${effectiveActiveLimit} filmes pendentes para assistir! Conclua ou decline um filme antes de sortear novas cartas.`
    );
  }

  // Libera APENAS as cartas NÃO escolhidas de eventual rodada 'revealed' anterior de volta ao pool
  const prevRevealedRes = await query(
    `SELECT id, cards_json FROM secret_draw_rounds WHERE status = 'revealed'`
  );
  for (const r of prevRevealedRes.rows || []) {
    await releaseUnpickedCardsFromRound(Number(r.id), Array.isArray(r.cards_json) ? r.cards_json : []);
    await query(
      `UPDATE secret_draw_rounds SET status = 'cancelled' WHERE id = $1`,
      [Number(r.id)]
    );
  }

  const targetSeats = Array.from({ length: cardCount }, (_, i) => i + 1);
  const { cards, auditLog, decoyCtx } = await resolveFreshMovieBatchForSeats({
    targetSeats,
    sagaRule,
    activeBuff,
  });

  if (cards.length === 0) {
    throw new Error('Não há mais filmes disponíveis na planilha para sortear!');
  }

  // Divide metade das cartas em Ouro (🪙) e metade em XP (⚡) ANTES de sortear os disfarces Especiais!
  assignRoundRewardModesToCards(cards, auditLog);

  // Disfarça aleatoriamente 1–3 (ou 2–6 com Baralho Carregado) Cartas Especiais atrás dos naipes desta mão!
  await assignDisguisedSpecialsToCards(cards, auditLog, {
    stormActive: Boolean(armedFlags.pendingSpecialStorm),
    radarActive: Boolean(armedFlags.pendingRadar),
    decoyCtx: {
      ...decoyCtx,
      preferUnconqueredYearChance:
        activeBuff?.xrayUnconqueredYearsOnly || activeBuff?.prioritizeUnconqueredYears ? 0.88 : 0.42,
      maxDecoyRuntime: activeBuff?.filterMaxRuntime || null,
    },
  });

  const powerFlags: SecretDrawRoundPowerFlags | null =
    activeBuff || extraCardsArmed > 0 || armedFlags.pendingSpecialStorm
      ? {
          classId: activeBuff?.classId,
          powerTitle: activeBuff?.powerTitle,
          xrayMilestones: Boolean(activeBuff?.revealMilestonesXray),
          xrayUnconqueredYearsOnly: Boolean(activeBuff?.xrayUnconqueredYearsOnly),
          revealYearRuntime: Boolean(activeBuff?.revealYearRuntime),
          allowExtraActivePick: Boolean(activeBuff?.allowExtraActivePick),
          bonusNextPickXp: Number(activeBuff?.bonusNextPickXp || 0),
          prioritizeUnconqueredYears: Boolean(activeBuff?.prioritizeUnconqueredYears),
          extraCardsAdded: extraCardsArmed > 0 ? extraCardsArmed : undefined,
          specialStormActive: Boolean(armedFlags.pendingSpecialStorm) || undefined,
        }
      : null;

  const insertRes = await query(
    `INSERT INTO secret_draw_rounds (mode, status, requested_card_count, saga_rule, power_flags_json, cards_json, audit_log_json)
     VALUES ('lab_weekly_2', 'revealed', $1, $2, $3::jsonb, $4::jsonb, $5::jsonb)
     RETURNING *`,
    [
      cardCount,
      sagaRule,
      powerFlags ? JSON.stringify(powerFlags) : null,
      JSON.stringify(cards),
      JSON.stringify(auditLog),
    ]
  );

  if (activeBuff) {
    await setSecretDrawPowerBuff(null);
  }
  if (extraCardsArmed > 0 || armedFlags.pendingSpecialStorm || armedFlags.pendingRadar) {
    await updateSecretArmedFlags({
      pendingExtraCards: 0,
      pendingSpecialStorm: false,
      pendingRadar: false,
    });
  }

  // Consome 1 ficha da semana apenas após gerar o sorteio com sucesso
  await query(
    `UPDATE secret_draw_wallet
     SET chips_remaining = GREATEST(0, chips_remaining - 1),
         chips_used_this_week = chips_used_this_week + 1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`
  );

  const statusPayload = await getSecretDrawStatus();
  return {
    round: mapRoundRow(insertRes.rows[0]),
    poolSummary: statusPayload.poolSummary,
  };
}

function normalizeCardWorldChallengeMilestones(card: any): any {
  if (!card || !Array.isArray(card.milestones)) return card;
  const worldMilestones = card.milestones.filter(
    (m: any) => m && m.system === 'world_challenge'
  );
  if (worldMilestones.length <= 1) return card;

  const countryNames = worldMilestones
    .map((m: any) =>
      String(m.label || '')
        .replace(/^País inédito:\s*/i, '')
        .trim()
    )
    .filter(Boolean);
  const firstWorld = worldMilestones[0];
  const mergedWorld: SecretDrawMilestonePrediction = {
    system: 'world_challenge',
    icon: worldMilestones.some((m: any) => m.icon === '⏳') ? '⏳' : firstWorld.icon || '🌍',
    label:
      countryNames.length > 0
        ? `País inédito: ${Array.from(new Set(countryNames)).join(' / ')}`
        : firstWorld.label,
    detail: 'Coprodução (desbloqueia 1 país inédito à sua escolha na curadoria)',
    rarityTier: firstWorld.rarityTier,
  };

  let inserted = false;
  const mergedList: SecretDrawMilestonePrediction[] = [];
  for (const m of card.milestones) {
    if (m && m.system === 'world_challenge') {
      if (!inserted) {
        mergedList.push(mergedWorld);
        inserted = true;
      }
    } else if (m) {
      mergedList.push(m);
    }
  }

  return {
    ...card,
    milestones: mergedList,
    totalMilestonesCount: mergedList.length,
  };
}

function mapRoundRow(r: any): SecretDrawRound {
  return {
    id: Number(r.id),
    mode: String(r.mode || 'lab_infinite'),
    status: r.status,
    requestedCardCount: Number(r.requested_card_count || (Array.isArray(r.cards_json) ? r.cards_json.length : 5)),
    sagaRule: (r.saga_rule as SecretDrawSagaRule) || 'redirect_first',
    powerFlags: r.power_flags_json || null,
    cards: Array.isArray(r.cards_json) ? r.cards_json.map(normalizeCardWorldChallengeMilestones) : [],
    auditLog: Array.isArray(r.audit_log_json) ? r.audit_log_json : [],
    auditCount:
      r.audit_count != null
        ? Number(r.audit_count)
        : Array.isArray(r.audit_log_json)
          ? r.audit_log_json.length
          : 0,
    chosenSeat: r.chosen_seat != null ? Number(r.chosen_seat) : null,
    chosenPoolId: r.chosen_pool_id != null ? Number(r.chosen_pool_id) : null,
    chosenDifficulty: r.chosen_difficulty || null,
    xpAwarded: Number(r.xp_awarded || 0),
    lockedXp: Number(r.locked_xp || 0),
    completedMovieId: r.completed_movie_id != null ? Number(r.completed_movie_id) : null,
    completedSource: r.completed_source || null,
    declineReason: r.decline_reason || null,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    chosenAt: r.chosen_at ? new Date(r.chosen_at).toISOString() : null,
    completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : null,
    declinedAt: r.declined_at ? new Date(r.declined_at).toISOString() : null,
  };
}

function mapPickRow(r: any): SecretDrawPick {
  const card = normalizeCardWorldChallengeMilestones(r.card_json);
  const rewardMode: 'xp' | 'gold' =
    r.reward_mode === 'gold' || card?.rewardMode === 'gold' ? 'gold' : 'xp';
  const difficulty =
    (String(r.difficulty || card?.difficulty || 'common') as SecretDrawDifficulty) || 'common';
  const defaultPts = SECRET_DRAW_XP_BY_DIFFICULTY[difficulty] || 35;
  const goldReward =
    rewardMode === 'gold'
      ? Math.max(0, Number(r.gold_reward ?? card?.goldReward ?? computeSecretGoldFromPoints(defaultPts)))
      : 0;
  const xpReward =
    rewardMode === 'gold' ? 0 : Number(r.xp_reward ?? card?.xpReward ?? defaultPts);

  return {
    id: Number(r.id),
    roundId: Number(r.round_id),
    seat: Number(r.seat),
    poolId: r.pool_id != null ? Number(r.pool_id) : null,
    difficulty,
    xpReward,
    xpAwarded: rewardMode === 'gold' ? 0 : Number(r.xp_awarded || 0),
    rewardMode,
    goldReward,
    goldAwarded: Number(r.gold_awarded || 0),
    card,
    status: r.status,
    completedMovieId: r.completed_movie_id != null ? Number(r.completed_movie_id) : null,
    completedSource: r.completed_source || null,
    declineReason: r.decline_reason || null,
    pickedAt: r.picked_at ? new Date(r.picked_at).toISOString() : new Date().toISOString(),
    completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : null,
    declinedAt: r.declined_at ? new Date(r.declined_at).toISOString() : null,
  };
}

async function releaseUnpickedCardsFromRound(roundId: number, cardsArr: any[]): Promise<void> {
  const pickedRes = await query(
    `SELECT seat, pool_id FROM secret_draw_picks WHERE round_id = $1`,
    [roundId]
  );
  const pickedSeats = new Set((pickedRes.rows || []).map((x: any) => Number(x.seat)));
  const pickedPoolIds = new Set(
    (pickedRes.rows || []).map((x: any) => Number(x.pool_id)).filter((n: number) => n > 0)
  );

  const returnPoolIds = cardsArr
    .filter((c: any) => !pickedSeats.has(Number(c?.seat)))
    .map((c: any) => Number(c?.poolId || 0))
    .filter((n: number) => n > 0 && !pickedPoolIds.has(n));

  if (returnPoolIds.length > 0) {
    await query(
      `UPDATE secret_draw_pool SET status = 'available' WHERE id = ANY($1::int[]) AND status = 'drawn'`,
      [returnPoolIds]
    );
  }
}

async function queueNormalSecretCardInPickTable(
  round: SecretDrawRound,
  chosenCard: SecretDrawCard
): Promise<SecretDrawPick> {
  const existingRes = await query(
    `SELECT * FROM secret_draw_picks WHERE round_id = $1 AND seat = $2`,
    [round.id, chosenCard.seat]
  );
  if (existingRes.rows.length > 0) {
    return mapPickRow(existingRes.rows[0]);
  }

  const activeCountRes = await query(
    `SELECT COUNT(*)::int AS cnt FROM secret_draw_picks WHERE status = 'active'`
  );
  const activeCount = Number(activeCountRes.rows[0]?.cnt || 0);
  const hasVipSeat = await hasGuildRelic('vip_seat');
  const effectiveActiveLimit =
    MAX_ACTIVE_SECRET_PICKS + (hasVipSeat ? 1 : 0) + (round.powerFlags?.allowExtraActivePick ? 1 : 0);
  if (activeCount >= effectiveActiveLimit) {
    throw new Error(
      `Limite máximo de ${effectiveActiveLimit} filmes para assistir atingido! Conclua ou decline um antes de escolher outro.`
    );
  }

  const bonusNextPickXp = Math.max(0, Number(round.powerFlags?.bonusNextPickXp || 0));
  const isGold = chosenCard.rewardMode === 'gold';
  const defaultDiffPts = SECRET_DRAW_XP_BY_DIFFICULTY[chosenCard.difficulty || 'common'] || 35;
  const finalXpReward = isGold ? 0 : Number(chosenCard.xpReward || defaultDiffPts) + bonusNextPickXp;
  const finalGoldReward = isGold
    ? Math.max(
        8,
        Number(chosenCard.goldReward || computeSecretGoldFromPoints(defaultDiffPts)) +
          (bonusNextPickXp > 0 ? computeSecretGoldFromPoints(bonusNextPickXp) : 0)
      )
    : 0;
  const storedCard: SecretDrawCard = {
    ...chosenCard,
    rewardMode: isGold ? 'gold' : 'xp',
    xpReward: finalXpReward,
    goldReward: finalGoldReward,
  };

  const insRes = await query(
    `INSERT INTO secret_draw_picks (
       round_id, seat, pool_id, difficulty, xp_reward, reward_mode, gold_reward, card_json, status
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, 'active')
     RETURNING *`,
    [
      round.id,
      chosenCard.seat,
      chosenCard.poolId,
      chosenCard.difficulty,
      finalXpReward,
      isGold ? 'gold' : 'xp',
      finalGoldReward,
      JSON.stringify(storedCard),
    ]
  );

  if (bonusNextPickXp > 0 && round.powerFlags) {
    const nextFlags: SecretDrawRoundPowerFlags = { ...round.powerFlags, bonusNextPickXp: 0 };
    await query(`UPDATE secret_draw_rounds SET power_flags_json = $2::jsonb WHERE id = $1`, [
      round.id,
      JSON.stringify(nextFlags),
    ]);
  }

  if (chosenCard.poolId) {
    await query(
      `UPDATE secret_draw_pool SET status = 'drawn' WHERE id = $1 AND status = 'available'`,
      [chosenCard.poolId]
    );
  }

  return mapPickRow(insRes.rows[0]);
}

async function pickRandomActiveQueueRow(predicate?: (pick: SecretDrawPick) => boolean): Promise<SecretDrawPick | null> {
  const res = await query(
    `SELECT * FROM secret_draw_picks WHERE status = 'active' ORDER BY RANDOM()`
  );
  const picks = (res.rows || []).map(mapPickRow);
  const filtered = predicate ? picks.filter(predicate) : picks;
  return filtered[0] || null;
}

async function shiftPickDifficultyStep(
  target: SecretDrawPick,
  direction: 1 | -1
): Promise<{
  prevDiff: SecretDrawDifficulty;
  nextDiff: SecretDrawDifficulty;
  prevXp: number;
  nextXp: number;
  rewardMode: 'xp' | 'gold';
  prevGold: number;
  nextGold: number;
}> {
  const curIdx = SECRET_DIFFICULTY_ORDER.indexOf(target.difficulty);
  const nextIdx = Math.max(0, Math.min(SECRET_DIFFICULTY_ORDER.length - 1, curIdx + direction));
  const nextDiff = SECRET_DIFFICULTY_ORDER[nextIdx];
  const nextMeta = SECRET_DRAW_DIFFICULTY_META[nextDiff];
  const prevBaseXp = SECRET_DRAW_XP_BY_DIFFICULTY[target.difficulty] || 35;
  const nextBaseXp = SECRET_DRAW_XP_BY_DIFFICULTY[nextDiff] || 35;
  const isGold = target.rewardMode === 'gold';

  const prevXp = isGold ? 0 : Number(target.xpReward || prevBaseXp);
  const nextXp = isGold ? 0 : Math.max(10, Math.round(prevXp + (nextBaseXp - prevBaseXp)));

  const prevBaseGold = computeSecretGoldFromPoints(prevBaseXp);
  const nextBaseGold = computeSecretGoldFromPoints(nextBaseXp);
  const prevGold = isGold ? Math.max(8, Number(target.goldReward || prevBaseGold)) : 0;
  const nextGold = isGold ? Math.max(8, Math.round(prevGold + (nextBaseGold - prevBaseGold))) : 0;

  const updatedCard: SecretDrawCard = {
    ...target.card,
    difficulty: nextDiff,
    difficultyLabel: nextMeta.label,
    difficultyIcon: nextMeta.icon,
    rewardMode: isGold ? 'gold' : 'xp',
    xpReward: nextXp,
    goldReward: nextGold,
    rarityChangedFrom: target.difficulty,
  };

  await query(
    `UPDATE secret_draw_picks
     SET difficulty = $2,
         xp_reward = $3,
         gold_reward = $4,
         card_json = $5::jsonb
     WHERE id = $1`,
    [target.id, nextDiff, nextXp, nextGold, JSON.stringify(updatedCard)]
  );

  return {
    prevDiff: target.difficulty,
    nextDiff,
    prevXp,
    nextXp,
    rewardMode: isGold ? 'gold' : 'xp',
    prevGold,
    nextGold,
  };
}

export interface SecretSpecialExecutionResult {
  kind: 'special';
  specialEvent: SecretDrawCardSpecialEvent;
  card?: SecretDrawCard | null;
  portalCompletedPick?: SecretDrawPick | null;
  chainedOutcome?: SecretSpecialExecutionResult | null;
  pulledMoviePick?: SecretDrawPick | null;
  reshuffledSeats?: number[];
}

const CURSED_SPECIAL_CARD_IDS = new Set<SecretSpecialCardId>([
  'armadilha_mecanica',
  'corrente_destino',
  'lamina_eclipse',
  'dama_espadas_inquisidora',
  'maldicao_imposto_ouro',
]);

async function executeSecretSpecialEffect(params: {
  baseEvent: SecretDrawCardSpecialEvent;
  roundId?: number | null;
  triggerSeat?: number | null;
  depth?: number;
  deferOcarina?: boolean;
  skipStatsRecord?: boolean;
}): Promise<SecretSpecialExecutionResult> {
  const depth = Number(params.depth || 0);
  const event: SecretDrawCardSpecialEvent = {
    ...params.baseEvent,
    triggered: true,
    triggeredAt: new Date().toISOString(),
  };

  if (CURSED_SPECIAL_CARD_IDS.has(event.id)) {
    const armed = await getSecretArmedFlags();
    if (armed.amuletArmed) {
      await updateSecretArmedFlags({ amuletArmed: false });
      event.resultSummary = `🛡️ Escudo do Arlequim Estilhaçou! O Amuleto Contra-Maldição protegeu você e anulou completamente "${event.harlequinTitle || event.title}"!`;
      event.outcomeData = {
        blockedByAmulet: true,
        blockedCurseId: event.id,
        blockedCurseTitle: event.harlequinTitle || event.title,
      };
      if (!params.skipStatsRecord && event.triggered) {
        await recordSpecialCardDrawn(event.id);
      }
      return {
        kind: 'special',
        specialEvent: event,
        portalCompletedPick: null,
        chainedOutcome: null,
        pulledMoviePick: null,
        reshuffledSeats: [],
      };
    }
  }

  let portalCompletedPick: SecretDrawPick | null = null;
  let chainedOutcome: SecretSpecialExecutionResult | null = null;
  let pulledMoviePick: SecretDrawPick | null = null;
  let reshuffledSeats: number[] = [];

  const loadRoundAndPicked = async (targetRoundId: number | null | undefined) => {
    if (!targetRoundId) return null;
    const [rRes, pRes] = await Promise.all([
      query(`SELECT * FROM secret_draw_rounds WHERE id = $1`, [targetRoundId]),
      query(`SELECT seat FROM secret_draw_picks WHERE round_id = $1`, [targetRoundId]),
    ]);
    if (rRes.rows.length === 0) return null;
    const round = mapRoundRow(rRes.rows[0]);
    const pickedSeats = new Set((pRes.rows || []).map((x: any) => Number(x.seat)));
    return { round, pickedSeats };
  };

  switch (event.id) {
    case 'duas_caras': {
      const target = await pickRandomActiveQueueRow();
      if (!target) {
        const coinFace = Math.random() < 0.5 ? 'heads' : 'tails';
        event.resultSummary = 'Sua fila de filmes estava vazia — a moeda girou no ar sem alvo na fila.';
        event.outcomeData = { noTarget: true, coinFace, coinRarity: coinFace === 'heads' ? 'legendary' : 'cursed' };
        break;
      }
      const coinFace = Math.random() < 0.5 ? 'heads' : 'tails';
      const isHeads = coinFace === 'heads';
      const isGoldTarget = target.rewardMode === 'gold';
      const prevXp = isGoldTarget ? 0 : Number(target.xpReward || 35);
      const nextXp = isGoldTarget ? 0 : isHeads ? prevXp * 2 : Math.max(10, Math.round(prevXp / 2));
      const prevGold = isGoldTarget
        ? Math.max(8, Number(target.goldReward || computeSecretGoldFromPoints(SECRET_DRAW_XP_BY_DIFFICULTY[target.difficulty] || 35)))
        : 0;
      const nextGold = isGoldTarget ? (isHeads ? prevGold * 2 : Math.max(8, Math.round(prevGold / 2))) : 0;

      const updatedCard: SecretDrawCard = {
        ...target.card,
        rewardMode: isGoldTarget ? 'gold' : 'xp',
        xpReward: nextXp,
        goldReward: nextGold,
        ...(isHeads
          ? { twoFaceDoubled: true }
          : { halfXpCursed: true, boomerangLocked: true }),
      };

      await query(
        `UPDATE secret_draw_picks SET xp_reward = $2, gold_reward = $3, card_json = $4::jsonb WHERE id = $1`,
        [target.id, nextXp, nextGold, JSON.stringify(updatedCard)]
      );

      const prevLabel = isGoldTarget ? `+${prevGold} 🪙` : `+${prevXp} XP`;
      const nextLabel = isGoldTarget ? `+${nextGold} 🪙` : `+${nextXp} XP`;

      event.resultSummary = isHeads
        ? `🪙 CARA — Bênção do Arlequim! Ele adorou a aposta e dobrou "${target.card?.resolved?.title}" de ${prevLabel} para ${nextLabel}!`
        : `🪙 COROA — Maldição da Moeda! O Arlequim cortou "${target.card?.resolved?.title}" pela metade (${prevLabel} → ${nextLabel}) e travou o Bumerangue!`;
      event.outcomeData = {
        coinFace,
        coinRarity: isHeads ? 'legendary' : 'cursed',
        rewardMode: isGoldTarget ? 'gold' : 'xp',
        targetPickId: target.id,
        targetTitle: target.card?.resolved?.title || 'Filme da Fila',
        prevXp,
        nextXp,
        prevGold,
        nextGold,
        boomerangLocked: !isHeads,
      };
      break;
    }

    case 'apresentador_vem_ca': {
      const ctx = await loadRoundAndPicked(params.roundId);
      if (!ctx) {
        event.resultSummary = 'Nenhuma mesa aberta no momento — abra um sorteio para o Arlequim puxar uma carta fechada!';
        event.outcomeData = { noTarget: true };
        break;
      }
      const { round, pickedSeats } = ctx;
      const closedCandidates = round.cards.filter(
        (c) =>
          Number(c.seat) !== Number(params.triggerSeat || 0) &&
          !pickedSeats.has(Number(c.seat)) &&
          !c.specialEvent?.triggered &&
          !c.removedByCurse
      );
      if (closedCandidates.length === 0) {
        event.resultSummary = 'Não restou nenhuma outra carta fechada na mesa para puxar!';
        event.outcomeData = { noTarget: true };
        break;
      }
      const chosen = closedCandidates[Math.floor(Math.random() * closedCandidates.length)];

      if (chosen.specialEvent && depth < 3) {
        if (chosen.poolId) {
          await query(
            `UPDATE secret_draw_pool SET status = 'available' WHERE id = $1 AND status = 'drawn'`,
            [chosen.poolId]
          );
        }
        chainedOutcome = await executeSecretSpecialEffect({
          baseEvent: chosen.specialEvent,
          roundId: round.id,
          triggerSeat: chosen.seat,
          depth: depth + 1,
          skipStatsRecord: params.skipStatsRecord,
        });
        const freshRoundRes = await query(`SELECT cards_json FROM secret_draw_rounds WHERE id = $1`, [round.id]);
        const latestCards: SecretDrawCard[] = Array.isArray(freshRoundRes.rows[0]?.cards_json)
          ? freshRoundRes.rows[0].cards_json
          : round.cards;
        const patched = latestCards.map((c) =>
          Number(c.seat) === Number(chosen.seat) ? { ...c, specialEvent: chainedOutcome!.specialEvent } : c
        );
        await query(`UPDATE secret_draw_rounds SET cards_json = $2::jsonb WHERE id = $1`, [
          round.id,
          JSON.stringify(patched),
        ]);
        event.resultSummary = `🃏 O Arlequim puxou a Carta #${chosen.seat} da mesa — e ela escondia ${chainedOutcome.specialEvent.icon} ${chainedOutcome.specialEvent.harlequinTitle || chainedOutcome.specialEvent.title} em cadeia!`;
        event.outcomeData = { pulledSeat: chosen.seat, chainedSpecial: true };
      } else {
        const activeCountRes = await query(
          `SELECT COUNT(*)::int AS cnt FROM secret_draw_picks WHERE status = 'active'`
        );
        const activeCount = Number(activeCountRes.rows[0]?.cnt || 0);
        const hasVipSeat = await hasGuildRelic('vip_seat');
        const effectiveActiveLimit =
          MAX_ACTIVE_SECRET_PICKS + (hasVipSeat ? 1 : 0) + (round.powerFlags?.allowExtraActivePick ? 1 : 0);
        if (activeCount >= effectiveActiveLimit) {
          event.triggered = false;
          event.resultSummary = `🃏 Sua fila está cheia (${activeCount}/${effectiveActiveLimit})! Libere 1 vaga (conclua, decline ou use Bumerangue) para o Arlequim puxar mais um filme da mesa.`;
          event.outcomeData = { queueFull: true };
        } else {
          pulledMoviePick = await queueNormalSecretCardInPickTable(round, chosen);
          const pulledRewardText =
            pulledMoviePick.rewardMode === 'gold'
              ? `+${pulledMoviePick.goldReward || 0} 🪙`
              : `+${pulledMoviePick.xpReward || 0} XP`;
          event.resultSummary = `🃏 O Arlequim deu sua bênção, mas ele vai escolher o filme para você ver — filme: "${chosen.resolved?.title}" (${chosen.difficultyLabel} • ${pulledRewardText})!`;
          event.outcomeData = {
            pulledSeat: chosen.seat,
            targetTitle: chosen.resolved?.title,
            rewardMode: pulledMoviePick.rewardMode || 'xp',
            xpReward: pulledMoviePick.xpReward,
            goldReward: pulledMoviePick.goldReward || 0,
          };
        }
      }
      break;
    }

    case 'ocarina_floresta': {
      if (params.deferOcarina) {
        event.resultSummary = '⏳ O Arlequim está dedilhando a harpa do tempo para reembaralhar todas as cartas fechadas da mesa!';
        event.outcomeData = {
          pendingOcarina: true,
          labPreview: Boolean(params.skipStatsRecord),
          roundId: params.roundId || null,
          triggerSeat: params.triggerSeat || null,
          createLabIfEmpty: !params.roundId,
        };
        break;
      }
      return executeOcarinaReshuffle({
        roundId: params.roundId || null,
        triggerSeat: params.triggerSeat || null,
        baseEvent: event,
        skipStatsRecord: params.skipStatsRecord,
      });
    }

    case 'recarga_classe': {
      const classWallet = await labGrantClassPowerCharge('secret_draw');
      event.resultSummary = `🎬 Take 2! O Arlequim estalou a claquete e recarregou +1 carga do Poder da sua Classe para a Sessão Secreta (${classWallet.secretCharges}/${classWallet.maxSecretCharges} disponível(is)).`;
      event.outcomeData = {
        secretCharges: classWallet.secretCharges,
        maxSecretCharges: classWallet.maxSecretCharges,
      };
      break;
    }

    case 'visao_marcos': {
      const ctx = await loadRoundAndPicked(params.roundId);
      if (!ctx) {
        event.resultSummary = 'Nenhuma mesa aberta — sorteie uma mão para ativar as Lentes da Sessão Oculta!';
        event.outcomeData = { noTarget: true };
        break;
      }
      const { round, pickedSeats } = ctx;
      let updatedCount = 0;
      const nextCards = round.cards.map((c) => {
        if (Number(c.seat) === Number(params.triggerSeat || 0)) {
          return { ...c, specialEvent: event };
        }
        if (!pickedSeats.has(Number(c.seat)) && !c.specialEvent?.triggered && !c.removedByCurse) {
          updatedCount += 1;
          if (c.specialEvent) {
            const decoyList =
              Array.isArray(c.decoyMilestones) && c.decoyMilestones.length > 0
                ? c.decoyMilestones
                : buildRandomDecoyMilestones(c.totalMilestonesCount || 2);
            return {
              ...c,
              decoyMilestones: decoyList,
              simpleMilestonesHint: true,
            };
          }
          return { ...c, simpleMilestonesHint: true };
        }
        return c;
      });
      const nextFlags: SecretDrawRoundPowerFlags = {
        ...(round.powerFlags || {}),
        simpleMilestonesVision: true,
      };
      await query(
        `UPDATE secret_draw_rounds SET cards_json = $2::jsonb, power_flags_json = $3::jsonb WHERE id = $1`,
        [round.id, JSON.stringify(nextCards), JSON.stringify(nextFlags)]
      );
      event.resultSummary = `🕶️ Com as lentes do Arlequim, ${updatedCount} carta(s) fechada(s) revelaram no verso os marcos secretos (Troféus, Países, Anos)!`;
      event.outcomeData = { updatedCount };
      break;
    }

    case 'arlequim_revela_3':
    case 'arlequim_revela_5': {
      const targetRevealCount = event.id === 'arlequim_revela_5' ? 5 : 3;
      const ctx = await loadRoundAndPicked(params.roundId);
      if (!ctx) {
        event.resultSummary = 'Nenhuma mesa aberta — sorteie uma mão para o Arlequim revelar cartas!';
        event.outcomeData = { noTarget: true };
        break;
      }
      const { round, pickedSeats } = ctx;
      const candidates = round.cards.filter(
        (c) =>
          Number(c.seat) !== Number(params.triggerSeat || 0) &&
          !pickedSeats.has(Number(c.seat)) &&
          !c.specialEvent &&
          !c.revealedPreview &&
          !c.removedByCurse
      );
      const pickedToReveal = candidates
        .sort(() => Math.random() - 0.5)
        .slice(0, targetRevealCount);
      const revealSet = new Set(pickedToReveal.map((c) => Number(c.seat)));

      const nextCards = round.cards.map((c) => {
        if (Number(c.seat) === Number(params.triggerSeat || 0)) {
          return { ...c, specialEvent: event };
        }
        if (revealSet.has(Number(c.seat))) {
          return { ...c, revealedPreview: true };
        }
        return c;
      });

      await query(`UPDATE secret_draw_rounds SET cards_json = $2::jsonb WHERE id = $1`, [
        round.id,
        JSON.stringify(nextCards),
      ]);

      const revealedTitles = pickedToReveal.map((c) => c.resolved?.title).filter(Boolean);
      event.resultSummary =
        pickedToReveal.length > 0
          ? `${event.icon} O Arlequim deu sua bênção e revelou ${pickedToReveal.length} filme(s) oculto(s) na mesa: ${revealedTitles.join(' • ')}!`
          : 'Todas as outras cartas da mesa já estavam reveladas!';
      event.outcomeData = {
        revealedCount: pickedToReveal.length,
        revealedSeats: Array.from(revealSet),
        revealedTitles,
      };
      break;
    }

    case 'portal_dimensional': {
      const target = await pickRandomActiveQueueRow();
      if (!target) {
        event.resultSummary = 'Sua fila está vazia — sem filme para colher pelo Portal Dimensional.';
        event.outcomeData = { noTarget: true };
        break;
      }
      const isGoldTarget = target.rewardMode === 'gold';
      const defaultPts = SECRET_DRAW_XP_BY_DIFFICULTY[target.difficulty || 'common'];
      const awardXp = isGoldTarget ? 0 : Number(target.xpReward || defaultPts);
      const baseAwardGold = isGoldTarget
        ? Math.max(8, Number(target.goldReward || computeSecretGoldFromPoints(defaultPts)))
        : 0;
      const loupeGold = baseAwardGold > 0 ? await applyGoldenLoupeBonus(baseAwardGold) : { finalGold: 0, bonusGold: 0, applied: false };
      const awardGold = loupeGold.finalGold;
      const updatedCard: SecretDrawCard = { ...target.card, portalHarvested: true };

      if (target.poolId) {
        await query(
          `UPDATE secret_draw_pool SET status = 'available', skip_reason = NULL WHERE id = $1`,
          [target.poolId]
        );
      }

      const upd = await query(
        `UPDATE secret_draw_picks
         SET status = 'completed',
             xp_awarded = $2,
             gold_awarded = $3,
             card_json = $4::jsonb,
             completed_source = 'portal_special',
             decline_reason = '🌀 O Arlequim adorou este filme — colhido via Portal (devolvido ao baralho)',
             completed_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [target.id, awardXp, awardGold, JSON.stringify(updatedCard)]
      );
      if (awardGold > 0) {
        await grantGuildBazaarCoins(awardGold);
      }
      portalCompletedPick = mapPickRow(upd.rows[0]);
      const rewardStr = isGoldTarget
        ? `+${awardGold} 🪙 no Bazar${loupeGold.applied ? ` (+${loupeGold.bonusGold} 🪙 Lupa)` : ''}`
        : `+${awardXp} XP`;
      event.resultSummary = `🌀 O Arlequim adora o filme "${target.card?.resolved?.title}" — ele ainda vai te dar ${rewardStr} sem precisar assistir e devolveu a carta intacta ao baralho!`;
      event.outcomeData = {
        rewardMode: isGoldTarget ? 'gold' : 'xp',
        targetPickId: target.id,
        targetTitle: target.card?.resolved?.title,
        awardXp,
        awardGold,
        goldenLoupeBonusGold: loupeGold.bonusGold,
      };
      break;
    }

    case 'pedra_filosofal': {
      const target = await pickRandomActiveQueueRow((p) => p.difficulty !== 'exotic');
      if (!target) {
        event.resultSummary = 'Nenhum filme elegível (abaixo de Exótico) na sua fila para ascender.';
        event.outcomeData = { noTarget: true };
        break;
      }
      const { prevDiff, nextDiff, prevXp, nextXp, rewardMode, prevGold, nextGold } = await shiftPickDifficultyStep(target, 1);
      const prevStr = rewardMode === 'gold' ? `+${prevGold} 🪙` : `+${prevXp} XP`;
      const nextStr = rewardMode === 'gold' ? `+${nextGold} 🪙` : `+${nextXp} XP`;
      event.resultSummary = `⚗️ Bênção Alquímica! O Arlequim transmutou "${target.card?.resolved?.title}" de ${SECRET_DRAW_DIFFICULTY_META[prevDiff].label} (${prevStr}) para ${SECRET_DRAW_DIFFICULTY_META[nextDiff].label} (${nextStr})!`;
      event.outcomeData = {
        targetPickId: target.id,
        targetTitle: target.card?.resolved?.title,
        rewardMode,
        prevDiff,
        nextDiff,
        prevXp,
        nextXp,
        prevGold,
        nextGold,
      };
      break;
    }

    case 'armadilha_mecanica': {
      const target = await pickRandomActiveQueueRow((p) => p.difficulty !== 'common');
      if (!target) {
        event.resultSummary = 'Nenhum filme acima de Comum na fila — você escapou da armadilha do Arlequim!';
        event.outcomeData = { noTarget: true };
        break;
      }
      const { prevDiff, nextDiff, prevXp, nextXp, rewardMode, prevGold, nextGold } = await shiftPickDifficultyStep(target, -1);
      const prevStr = rewardMode === 'gold' ? `+${prevGold} 🪙` : `+${prevXp} XP`;
      const nextStr = rewardMode === 'gold' ? `+${nextGold} 🪙` : `+${nextXp} XP`;
      event.resultSummary = `⚙️ Maldição! As engrenagens do Arlequim esmagaram "${target.card?.resolved?.title}": caiu de ${SECRET_DRAW_DIFFICULTY_META[prevDiff].label} (${prevStr}) para ${SECRET_DRAW_DIFFICULTY_META[nextDiff].label} (${nextStr})!`;
      event.outcomeData = {
        targetPickId: target.id,
        targetTitle: target.card?.resolved?.title,
        rewardMode,
        prevDiff,
        nextDiff,
        prevXp,
        nextXp,
        prevGold,
        nextGold,
      };
      break;
    }

    case 'corrente_destino': {
      const target = await pickRandomActiveQueueRow((p) => !p.card?.boomerangLocked);
      if (!target) {
        event.resultSummary = 'Nenhum filme livre para acorrentar na fila — o feitiço falhou!';
        event.outcomeData = { noTarget: true };
        break;
      }
      const updatedCard: SecretDrawCard = { ...target.card, boomerangLocked: true };
      await query(`UPDATE secret_draw_picks SET card_json = $2::jsonb WHERE id = $1`, [
        target.id,
        JSON.stringify(updatedCard),
      ]);
      event.resultSummary = `⛓️ Maldição! O Arlequim acorrentou "${target.card?.resolved?.title}" na sua fila — Passe Bumerangue bloqueado nesta carta!`;
      event.outcomeData = {
        targetPickId: target.id,
        targetTitle: target.card?.resolved?.title,
      };
      break;
    }

    case 'lamina_eclipse': {
      const target =
        (await pickRandomActiveQueueRow((p) => !p.card?.halfXpCursed)) ||
        (await pickRandomActiveQueueRow());
      if (!target) {
        event.resultSummary = 'Sua fila estava vazia — o golpe da Lâmina do Eclipse passou no vazio!';
        event.outcomeData = { noTarget: true };
        break;
      }
      const isGoldTarget = target.rewardMode === 'gold';
      const prevXp = isGoldTarget ? 0 : Number(target.xpReward || 35);
      const nextXp = isGoldTarget ? 0 : Math.max(10, Math.round(prevXp / 2));
      const prevGold = isGoldTarget
        ? Math.max(8, Number(target.goldReward || computeSecretGoldFromPoints(SECRET_DRAW_XP_BY_DIFFICULTY[target.difficulty] || 35)))
        : 0;
      const nextGold = isGoldTarget ? Math.max(8, Math.round(prevGold / 2)) : 0;

      const updatedCard: SecretDrawCard = {
        ...target.card,
        rewardMode: isGoldTarget ? 'gold' : 'xp',
        xpReward: nextXp,
        goldReward: nextGold,
        halfXpCursed: true,
      };
      await query(
        `UPDATE secret_draw_picks SET xp_reward = $2, gold_reward = $3, card_json = $4::jsonb WHERE id = $1`,
        [target.id, nextXp, nextGold, JSON.stringify(updatedCard)]
      );
      const prevStr = isGoldTarget ? `+${prevGold} 🪙` : `+${prevXp} XP`;
      const nextStr = isGoldTarget ? `+${nextGold} 🪙` : `+${nextXp} XP`;
      event.resultSummary = `💔 Maldição! A lâmina do Arlequim cortou "${target.card?.resolved?.title}" ao meio: ${prevStr} → ${nextStr}!`;
      event.outcomeData = {
        targetPickId: target.id,
        targetTitle: target.card?.resolved?.title,
        rewardMode: isGoldTarget ? 'gold' : 'xp',
        prevXp,
        nextXp,
        prevGold,
        nextGold,
      };
      break;
    }

    case 'valete_troca_fichas': {
      const ctx = await loadRoundAndPicked(params.roundId);
      if (!ctx) {
        event.resultSummary = 'Nenhuma mesa aberta no momento — sorteie uma mão para o Valete de Ouros trocar XP por Ouro!';
        event.outcomeData = { noTarget: true };
        break;
      }
      const { round, pickedSeats } = ctx;
      const closedXpCards = round.cards.filter(
        (c) =>
          Number(c.seat) !== Number(params.triggerSeat || 0) &&
          !pickedSeats.has(Number(c.seat)) &&
          !c.specialEvent?.triggered &&
          !c.removedByCurse &&
          c.rewardMode !== 'gold'
      );
      if (closedXpCards.length === 0) {
        event.resultSummary = 'Não havia cartas fechadas valendo XP na mesa para o Valete converter em Ouro!';
        event.outcomeData = { noTarget: true };
        break;
      }

      const targets = [...closedXpCards].sort(() => Math.random() - 0.5).slice(0, 2);
      const conversionMap = new Map<
        number,
        { seat: number; prevXp: number; nextGold: number; diffLabel: string }
      >();
      for (const tc of targets) {
        const prevXp = Math.max(
          10,
          Number(tc.xpReward || SECRET_DRAW_XP_BY_DIFFICULTY[tc.difficulty || 'common'] || 35)
        );
        const nextGold = computeSecretGoldFromPoints(Math.round(prevXp * 1.15));
        conversionMap.set(Number(tc.seat), {
          seat: Number(tc.seat),
          prevXp,
          nextGold,
          diffLabel: tc.difficultyLabel,
        });
      }

      const nextCards = round.cards.map((c) => {
        if (Number(c.seat) === Number(params.triggerSeat || 0)) {
          return { ...c, specialEvent: event };
        }
        const conv = conversionMap.get(Number(c.seat));
        if (conv) {
          return {
            ...c,
            rewardMode: 'gold' as const,
            xpReward: 0,
            goldReward: conv.nextGold,
            goldConvertedByJack: true,
          };
        }
        return c;
      });

      await query(`UPDATE secret_draw_rounds SET cards_json = $2::jsonb WHERE id = $1`, [
        round.id,
        JSON.stringify(nextCards),
      ]);

      const convertedList = Array.from(conversionMap.values());
      event.resultSummary = `🪙 Troca de Fichas! O Valete converteu ${convertedList.length} carta(s) fechada(s) de XP em Ouro (+15%): ${convertedList
        .map((x) => `Carta #${x.seat} (+${x.prevXp} XP → +${x.nextGold} 🪙)`)
        .join(' • ')}!`;
      event.outcomeData = {
        convertedCount: convertedList.length,
        convertedDetails: convertedList,
      };
      break;
    }

    case 'valete_mao_leve': {
      const stolenGold = 20;
      await grantGuildBazaarCoins(stolenGold);

      const ctx = await loadRoundAndPicked(params.roundId);
      if (!ctx) {
        event.resultSummary = `🕵️ Mão Leve! O Valete embolsou +${stolenGold} 🪙 para o seu Bazar (nenhuma mesa aberta no momento para rastrear).`;
        event.outcomeData = {
          bazaarGoldAdded: stolenGold,
          remainingSpecialsCount: 0,
          hintedSeats: [],
        };
        break;
      }

      const { round, pickedSeats } = ctx;
      const hiddenSpecialSeats = new Set<number>();
      for (const c of round.cards) {
        if (
          Number(c.seat) !== Number(params.triggerSeat || 0) &&
          !pickedSeats.has(Number(c.seat)) &&
          !c.specialEvent?.triggered &&
          !c.removedByCurse &&
          Boolean(c.specialEvent)
        ) {
          hiddenSpecialSeats.add(Number(c.seat));
        }
      }

      const nextCards = round.cards.map((c) => {
        if (Number(c.seat) === Number(params.triggerSeat || 0)) {
          return { ...c, specialEvent: event };
        }
        if (hiddenSpecialSeats.has(Number(c.seat))) {
          return { ...c, specialPulseHint: true };
        }
        return c;
      });

      await query(`UPDATE secret_draw_rounds SET cards_json = $2::jsonb WHERE id = $1`, [
        round.id,
        JSON.stringify(nextCards),
      ]);

      const cnt = hiddenSpecialSeats.size;
      event.resultSummary =
        cnt > 0
          ? `🕵️ Mão Leve! O Valete roubou +${stolenGold} 🪙 para o Bazar E fez piscar um contorno misterioso em ${cnt} carta(s) fechada(s) com Carta Especial disfarçada!`
          : `🕵️ Mão Leve! O Valete roubou +${stolenGold} 🪙 para o Bazar — e confirmou que não há mais nenhuma Carta Especial escondida nas fechadas restantes!`;
      event.outcomeData = {
        bazaarGoldAdded: stolenGold,
        remainingSpecialsCount: cnt,
        hintedSeats: Array.from(hiddenSpecialSeats),
      };
      break;
    }

    case 'dama_toque_dourado': {
      const target = await pickRandomActiveQueueRow((p) => p.rewardMode !== 'gold');
      if (!target) {
        event.resultSummary = '👑 Toque Dourado: Nenhuma carta ativa de XP na fila para transformar em Ouro (+25%)!';
        event.outcomeData = { noTarget: true };
        break;
      }
      const prevXp = Math.max(
        10,
        Number(target.xpReward || SECRET_DRAW_XP_BY_DIFFICULTY[target.difficulty || 'common'] || 35)
      );
      const nextGold = computeSecretGoldFromPoints(Math.round(prevXp * 1.25));
      const updatedCard: SecretDrawCard = {
        ...target.card,
        rewardMode: 'gold',
        xpReward: 0,
        goldReward: nextGold,
        goldConvertedByQueen: true,
      };
      await query(
        `UPDATE secret_draw_picks
         SET reward_mode = 'gold', xp_reward = 0, gold_reward = $2, card_json = $3::jsonb
         WHERE id = $1`,
        [target.id, nextGold, JSON.stringify(updatedCard)]
      );
      event.resultSummary = `👑 Toque Dourado! A Dama de Ouros transformou "${target.card?.resolved?.title}" de +${prevXp} XP em +${nextGold} 🪙 (+25% em Ouro)!`;
      event.outcomeData = {
        targetPickId: target.id,
        targetTitle: target.card?.resolved?.title || 'Filme da Fila',
        prevXp,
        nextGold,
      };
      break;
    }

    case 'dama_espadas_inquisidora': {
      const ctx = await loadRoundAndPicked(params.roundId);
      if (!ctx) {
        event.resultSummary = '⚔️ A Inquisidora não encontrou nenhuma mesa aberta no momento.';
        event.outcomeData = { noTarget: true };
        break;
      }
      const { round, pickedSeats } = ctx;
      const rolledK = 1 + Math.floor(Math.random() * 4);
      const closedPool = round.cards.filter(
        (c) =>
          Number(c.seat) !== Number(params.triggerSeat || 0) &&
          !pickedSeats.has(Number(c.seat)) &&
          !c.specialEvent?.triggered &&
          !c.removedByCurse
      );
      const xpCandidates = [...closedPool.filter((c) => c.rewardMode !== 'gold')].sort(() => Math.random() - 0.5);
      const goldCandidates = [...closedPool.filter((c) => c.rewardMode === 'gold')].sort(() => Math.random() - 0.5);

      const effectivePairs = Math.min(rolledK, xpCandidates.length, goldCandidates.length);
      if (effectivePairs <= 0) {
        event.resultSummary = `⚔️ A Dama de Espadas rolou ${rolledK}, mas não restaram pares equivalentes (XP + Ouro) para banir da mesa!`;
        event.outcomeData = {
          noTarget: true,
          rolledK,
          removedPairs: 0,
          removedSeats: [],
        };
        break;
      }

      const xpVictims = xpCandidates.slice(0, effectivePairs);
      const goldVictims = goldCandidates.slice(0, effectivePairs);
      const allVictims = [...xpVictims, ...goldVictims];
      const victimSeatSet = new Set(allVictims.map((v) => Number(v.seat)));

      const poolIdsToRelease = allVictims
        .map((v) => Number(v.poolId || 0))
        .filter((pid) => pid > 0);
      if (poolIdsToRelease.length > 0) {
        await query(
          `UPDATE secret_draw_pool SET status = 'available' WHERE id = ANY($1::int[]) AND status = 'drawn'`,
          [poolIdsToRelease]
        );
      }

      const nextCards = round.cards.map((c) => {
        if (Number(c.seat) === Number(params.triggerSeat || 0)) {
          return { ...c, specialEvent: event };
        }
        if (victimSeatSet.has(Number(c.seat))) {
          return {
            ...c,
            removedByCurse: true,
            specialPulseHint: false,
          };
        }
        return c;
      });

      await query(`UPDATE secret_draw_rounds SET cards_json = $2::jsonb WHERE id = $1`, [
        round.id,
        JSON.stringify(nextCards),
      ]);

      const sweptSpecialsCount = allVictims.filter((v) => Boolean(v.specialEvent)).length;
      const removedXpSum = xpVictims.reduce((acc, v) => acc + Number(v.xpReward || 0), 0);
      const removedGoldSum = goldVictims.reduce((acc, v) => acc + Number(v.goldReward || 0), 0);
      event.resultSummary = `⚔️ Maldição da Inquisidora (Q ♠)! Sorteou ${rolledK} e baniu ${effectivePairs} par(es) igual(is) da mesa: ${effectivePairs} de XP (-${removedXpSum} XP) e ${effectivePairs} de Ouro (-${removedGoldSum} 🪙)${
        sweptSpecialsCount > 0 ? ` — levando ${sweptSpecialsCount} Carta(s) Especial(is) na sorte!` : '!'
      }`;
      event.outcomeData = {
        rolledK,
        removedPairs: effectivePairs,
        removedTotal: allVictims.length,
        removedSeats: Array.from(victimSeatSet),
        removedXpSum,
        removedGoldSum,
        sweptSpecialsCount,
      };
      break;
    }

    case 'maldicao_imposto_ouro': {
      const target =
        (await pickRandomActiveQueueRow((p) => p.rewardMode === 'gold' && !p.card?.halfXpCursed)) ||
        (await pickRandomActiveQueueRow((p) => p.rewardMode === 'gold'));
      if (!target) {
        event.resultSummary = '🩸 Sanguessuga Dourada: Nenhuma carta valendo Ouro na sua fila ativa — nada aconteceu!';
        event.outcomeData = { noTarget: true };
        break;
      }
      const prevGold = Math.max(
        8,
        Number(
          target.goldReward ||
            computeSecretGoldFromPoints(SECRET_DRAW_XP_BY_DIFFICULTY[target.difficulty || 'common'] || 35)
        )
      );
      const nextGold = Math.max(4, Math.round(prevGold / 2));
      const updatedCard: SecretDrawCard = {
        ...target.card,
        rewardMode: 'gold',
        xpReward: 0,
        goldReward: nextGold,
        halfXpCursed: true,
      };
      await query(
        `UPDATE secret_draw_picks
         SET xp_reward = 0, gold_reward = $2, card_json = $3::jsonb
         WHERE id = $1`,
        [target.id, nextGold, JSON.stringify(updatedCard)]
      );
      event.resultSummary = `🩸 Sanguessuga Dourada! Como havia carta de Ouro na fila, "${target.card?.resolved?.title}" perdeu 50% do prêmio: +${prevGold} 🪙 → +${nextGold} 🪙!`;
      event.outcomeData = {
        targetPickId: target.id,
        targetTitle: target.card?.resolved?.title || 'Filme de Ouro',
        prevGold,
        nextGold,
      };
      break;
    }
  }

  if (
    !params.skipStatsRecord &&
    event.triggered &&
    !event.outcomeData?.pendingOcarina &&
    !event.outcomeData?.queueFull
  ) {
    await recordSpecialCardDrawn(event.id);
  }

  return {
    kind: 'special',
    specialEvent: event,
    portalCompletedPick,
    chainedOutcome,
    pulledMoviePick,
    reshuffledSeats,
  };
}

export async function executeOcarinaReshuffle(params: {
  roundId?: number | null;
  triggerSeat?: number | null;
  createLabIfEmpty?: boolean;
  baseEvent?: SecretDrawCardSpecialEvent | null;
  skipStatsRecord?: boolean;
}): Promise<SecretSpecialExecutionResult> {
  await ensureSecretDrawTables();
  const def = SECRET_SPECIAL_CARDS_CATALOG.find((c) => c.id === 'ocarina_floresta')!;
  const event: SecretDrawCardSpecialEvent = {
    ...(params.baseEvent || buildSpecialEventSnapshot(def)),
    triggered: true,
    triggeredAt: new Date().toISOString(),
  };

  let targetRoundId = params.roundId ? Number(params.roundId) : null;
  if (!targetRoundId) {
    const openRoundRes = await query(
      `SELECT id FROM secret_draw_rounds WHERE status = 'revealed' ORDER BY id DESC LIMIT 1`
    );
    targetRoundId = openRoundRes.rows[0]?.id ? Number(openRoundRes.rows[0].id) : null;
  }

  if (!targetRoundId && params.createLabIfEmpty) {
    const { cards, auditLog } = await resolveFreshMovieBatchForSeats({
      targetSeats: [1, 2, 3, 4, 5],
      sagaRule: 'redirect_first',
    });
    assignRoundRewardModesToCards(cards, auditLog);
    if (cards.length > 0) {
      await query(
        `INSERT INTO secret_draw_rounds (
           mode, status, requested_card_count, saga_rule, cards_json, audit_log_json
         ) VALUES ('lab_special_test', 'revealed', $1, 'redirect_first', $2::jsonb, $3::jsonb)`,
        [cards.length, JSON.stringify(cards), JSON.stringify(auditLog)]
      );
      const reshuffledSeats = cards.map((c) => Number(c.seat));
      event.resultSummary = `⏳ O Arlequim dedilhou a harpa do tempo e invocou ${cards.length} cartas novas na mesa de teste!`;
      event.outcomeData = {
        reshuffledCount: cards.length,
        reshuffledSeats,
        reshuffledDetails: cards.map((c) => ({
          seat: Number(c.seat),
          prevDiff: 'Nova',
          nextDiff: c.difficultyLabel,
          prevRewardMode: 'xp',
          prevXp: 0,
          prevGold: 0,
          nextRewardMode: c.rewardMode || 'xp',
          nextXp: c.xpReward,
          nextGold: c.goldReward || 0,
        })),
      };
      return { kind: 'special', specialEvent: event, reshuffledSeats };
    }
  }

  if (!targetRoundId) {
    event.resultSummary = 'Nenhuma mesa aberta — sorteie uma mão primeiro para tocar a Harpa do Tempo Reverso!';
    event.outcomeData = { noTarget: true };
    return { kind: 'special', specialEvent: event, reshuffledSeats: [] };
  }

  const [rRes, pRes] = await Promise.all([
    query(`SELECT * FROM secret_draw_rounds WHERE id = $1`, [targetRoundId]),
    query(`SELECT seat FROM secret_draw_picks WHERE round_id = $1`, [targetRoundId]),
  ]);
  if (rRes.rows.length === 0) {
    event.resultSummary = 'Rodada não encontrada para reembaralhar.';
    event.outcomeData = { noTarget: true };
    return { kind: 'special', specialEvent: event, reshuffledSeats: [] };
  }
  const round = mapRoundRow(rRes.rows[0]);
  const pickedSeats = new Set((pRes.rows || []).map((x: any) => Number(x.seat)));

  const toReshuffle = round.cards.filter(
    (c) =>
      Number(c.seat) !== Number(params.triggerSeat || 0) &&
      !pickedSeats.has(Number(c.seat)) &&
      !c.specialEvent?.triggered &&
      !c.removedByCurse
  );
  if (toReshuffle.length === 0) {
    event.resultSummary = 'Todas as outras cartas desta mesa já foram abertas! Sorteie uma nova mão para usar a Ocarina.';
    event.outcomeData = { noTarget: true };
    return { kind: 'special', specialEvent: event, reshuffledSeats: [] };
  }

  const poolIdsToRelease = toReshuffle.map((c) => Number(c.poolId || 0)).filter((n) => n > 0);
  const keepKeys = new Set<string>();
  for (const c of round.cards) {
    const k = c.resolved?.tmdbId
      ? `tmdb:${c.resolved.tmdbId}`
      : `${normalizeCompareText(c.resolved?.title)}:${c.resolved?.releaseYear || ''}`;
    if (k) keepKeys.add(k);
  }

  const oldBySeat = new Map<number, SecretDrawCard>(toReshuffle.map((c) => [Number(c.seat), c]));
  const targetSeats = toReshuffle.map((c) => Number(c.seat));

  const { cards: freshCards } = await resolveFreshMovieBatchForSeats({
    targetSeats,
    sagaRule: round.sagaRule || 'redirect_first',
    excludeKeys: keepKeys,
  });
  assignRoundRewardModesToCards(freshCards);

  if (poolIdsToRelease.length > 0) {
    await query(
      `UPDATE secret_draw_pool SET status = 'available' WHERE id = ANY($1::int[]) AND status = 'drawn'`,
      [poolIdsToRelease]
    );
  }

  const keepVision = Boolean(round.powerFlags?.simpleMilestonesVision);
  const freshBySeat = new Map<number, SecretDrawCard>(
    freshCards.map((fc) => [
      Number(fc.seat),
      keepVision ? { ...fc, simpleMilestonesHint: true } : fc,
    ])
  );
  const reshuffledSeats = Array.from(freshBySeat.keys());
  const reshuffledDetails = reshuffledSeats.map((seatNum) => {
    const prevCard = oldBySeat.get(seatNum);
    const nextCard = freshBySeat.get(seatNum);
    return {
      seat: seatNum,
      prevDiff: prevCard?.difficultyLabel || '',
      nextDiff: nextCard?.difficultyLabel || '',
      prevRewardMode: prevCard?.rewardMode || 'xp',
      prevXp: prevCard?.xpReward || 0,
      prevGold: prevCard?.goldReward || 0,
      nextRewardMode: nextCard?.rewardMode || 'xp',
      nextXp: nextCard?.xpReward || 0,
      nextGold: nextCard?.goldReward || 0,
    };
  });

  event.resultSummary = `⏳ O Arlequim tocou a melodia reversa e reembaralhou ${reshuffledSeats.length} carta(s) fechada(s) da mesa sem gastar ficha!`;
  event.outcomeData = {
    reshuffledCount: reshuffledSeats.length,
    reshuffledSeats,
    reshuffledDetails,
  };

  const nextCards = round.cards.map((oldC) => {
    if (Number(oldC.seat) === Number(params.triggerSeat || 0)) {
      return scrubSpecialSeatCard(oldC, event);
    }
    const replacement = freshBySeat.get(Number(oldC.seat));
    return replacement || oldC;
  });

  await query(`UPDATE secret_draw_rounds SET cards_json = $2::jsonb WHERE id = $1`, [
    round.id,
    JSON.stringify(nextCards),
  ]);

  const roundMode = String(rRes.rows[0]?.mode || '');
  const isLabPreview = Boolean(params.skipStatsRecord || params.baseEvent?.outcomeData?.labPreview || roundMode === 'lab_special_test');
  if (!isLabPreview && event.triggered) {
    await recordSpecialCardDrawn(event.id);
  }

  return {
    kind: 'special',
    specialEvent: event,
    reshuffledSeats,
  };
}

const XP_CAPABLE_SPECIAL_IDS = new Set<SecretSpecialCardId>([
  'portal_dimensional',
  'apresentador_vem_ca',
]);

export async function chooseSecretSeatAction(
  roundId: number,
  seat: number,
  options: { deferOcarina?: boolean; beforeXpCandidateSpecial?: () => Promise<void> } = {}
): Promise<
  | ({ kind: 'movie'; card: SecretDrawCard; pick: SecretDrawPick })
  | SecretSpecialExecutionResult
> {
  await ensureSecretDrawTables();
  const roundRes = await query(`SELECT * FROM secret_draw_rounds WHERE id = $1`, [roundId]);
  if (roundRes.rows.length === 0) {
    throw new Error('Rodada de sorteio não encontrada.');
  }
  const round = mapRoundRow(roundRes.rows[0]);
  if (round.status !== 'revealed') {
    throw new Error('Esta rodada já foi finalizada.');
  }
  const chosenCard = round.cards.find((c) => Number(c.seat) === Number(seat));
  if (!chosenCard) {
    throw new Error('Carta selecionada inválida.');
  }
  if (chosenCard.removedByCurse) {
    throw new Error('Esta carta foi banida da mesa pela Dama de Espadas — A Inquisidora!');
  }

  if (chosenCard.specialEvent) {
    if (chosenCard.specialEvent.triggered && !chosenCard.specialEvent.outcomeData?.pendingOcarina) {
      return {
        kind: 'special',
        specialEvent: chosenCard.specialEvent,
        card: chosenCard,
      };
    }

    if (
      XP_CAPABLE_SPECIAL_IDS.has(chosenCard.specialEvent.id) &&
      options.beforeXpCandidateSpecial
    ) {
      await options.beforeXpCandidateSpecial();
    }

    const result = await executeSecretSpecialEffect({
      baseEvent: chosenCard.specialEvent,
      roundId: round.id,
      triggerSeat: chosenCard.seat,
      deferOcarina: Boolean(options.deferOcarina),
    });

    if (result.specialEvent.outcomeData?.queueFull) {
      return {
        ...result,
        card: chosenCard,
      };
    }

    // Evento Puro (Opção A): libera o filme subjacente de volta ao pool apenas quando a carta especial foi efetivada
    if (chosenCard.poolId) {
      await query(
        `UPDATE secret_draw_pool SET status = 'available' WHERE id = $1 AND status = 'drawn'`,
        [chosenCard.poolId]
      );
    }

    // Persiste o specialEvent atualizado na carta (respeitando eventuais mutações em round.cards se Ocarina/Arlequim mexeu)
    const latestRes = await query(`SELECT cards_json FROM secret_draw_rounds WHERE id = $1`, [round.id]);
    const latestCards: SecretDrawCard[] = Array.isArray(latestRes.rows[0]?.cards_json)
      ? latestRes.rows[0].cards_json
      : round.cards;
    const scrubbedCard = scrubSpecialSeatCard(chosenCard, result.specialEvent);
    const nextCards = latestCards.map((c) =>
      Number(c.seat) === Number(chosenCard.seat) ? scrubbedCard : c
    );
    await query(`UPDATE secret_draw_rounds SET cards_json = $2::jsonb WHERE id = $1`, [
      round.id,
      JSON.stringify(nextCards),
    ]);

    return {
      ...result,
      card: scrubbedCard,
    };
  }

  const pick = await queueNormalSecretCardInPickTable(round, chosenCard);
  return {
    kind: 'movie',
    card: pick.card,
    pick,
  };
}

export async function labTriggerSecretSpecialCard(
  specialId: SecretSpecialCardId,
  variantIndex?: number | null,
  options: { deferOcarina?: boolean } = {}
): Promise<SecretSpecialExecutionResult> {
  await ensureSecretDrawTables();
  const def = SECRET_SPECIAL_CARDS_CATALOG.find((c) => c.id === specialId);
  if (!def) {
    throw new Error('Carta Especial não encontrada no catálogo.');
  }
  const openRoundRes = await query(
    `SELECT id FROM secret_draw_rounds WHERE status = 'revealed' ORDER BY id DESC LIMIT 1`
  );
  let openRoundId = openRoundRes.rows[0]?.id ? Number(openRoundRes.rows[0].id) : null;
  const baseEvent = buildSpecialEventSnapshot(def, variantIndex);

  if (specialId === 'ocarina_floresta' && options.deferOcarina) {
    return executeSecretSpecialEffect({
      baseEvent,
      roundId: openRoundId,
      triggerSeat: null,
      deferOcarina: true,
      skipStatsRecord: true,
    });
  }

  const TABLE_EFFECT_SPECIALS = new Set<SecretSpecialCardId>([
    'ocarina_floresta',
    'visao_marcos',
    'arlequim_revela_3',
    'arlequim_revela_5',
    'apresentador_vem_ca',
    'valete_troca_fichas',
    'valete_mao_leve',
    'dama_espadas_inquisidora',
  ]);

  // Se o usuário testou uma Carta Especial de Mesa no Lab sem nenhuma mão sorteada, abre uma mão grátis de teste na mesa!
  if (!openRoundId && TABLE_EFFECT_SPECIALS.has(specialId)) {
    const { cards, auditLog } = await resolveFreshMovieBatchForSeats({
      targetSeats: [1, 2, 3, 4, 5],
      sagaRule: 'redirect_first',
    });
    assignRoundRewardModesToCards(cards, auditLog);
    if (cards.length > 0) {
      const ins = await query(
        `INSERT INTO secret_draw_rounds (
           mode, status, requested_card_count, saga_rule, cards_json, audit_log_json
         ) VALUES ('lab_special_test', 'revealed', $1, 'redirect_first', $2::jsonb, $3::jsonb)
         RETURNING id`,
        [cards.length, JSON.stringify(cards), JSON.stringify(auditLog)]
      );
      openRoundId = Number(ins.rows[0].id);

      if (specialId === 'ocarina_floresta') {
        const reshuffledSeats = cards.map((c) => Number(c.seat));
        const event: SecretDrawCardSpecialEvent = {
          ...baseEvent,
          triggered: true,
          triggeredAt: new Date().toISOString(),
          resultSummary: `⏳ A Ocarina da Floresta invocou e embaralhou ${cards.length} cartas novas na mesa de teste!`,
          outcomeData: {
            reshuffledCount: cards.length,
            reshuffledSeats,
            reshuffledDetails: cards.map((c) => ({
              seat: Number(c.seat),
              prevDiff: 'Nova',
              nextDiff: c.difficultyLabel,
              prevXp: 0,
              nextXp: c.xpReward,
            })),
          },
        };
        return {
          kind: 'special',
          specialEvent: event,
          reshuffledSeats,
        };
      }
    }
  }

  return executeSecretSpecialEffect({
    baseEvent,
    roundId: openRoundId,
    triggerSeat: null,
    skipStatsRecord: true,
  });
}

export async function chooseSecretCard(roundId: number, seat: number): Promise<SecretDrawPick> {
  await ensureSecretDrawTables();
  const roundRes = await query(`SELECT * FROM secret_draw_rounds WHERE id = $1`, [roundId]);
  if (roundRes.rows.length === 0) {
    throw new Error('Rodada de sorteio não encontrada.');
  }
  const round = mapRoundRow(roundRes.rows[0]);
  if (round.status !== 'revealed') {
    throw new Error('Esta rodada já foi finalizada.');
  }
  const chosenCard = round.cards.find((c) => Number(c.seat) === Number(seat));
  if (!chosenCard) {
    throw new Error('Carta selecionada inválida.');
  }
  if (chosenCard.removedByCurse) {
    throw new Error('Esta carta foi banida da mesa pela Dama de Espadas — A Inquisidora!');
  }
  return queueNormalSecretCardInPickTable(round, chosenCard);
}

export async function unpickSecretCard(roundId: number, seat: number): Promise<void> {
  await ensureSecretDrawTables();
  const roundRes = await query(`SELECT status FROM secret_draw_rounds WHERE id = $1`, [roundId]);
  if (roundRes.rows.length === 0 || roundRes.rows[0].status !== 'revealed') {
    throw new Error('Só é possível desmarcar uma carta enquanto a mão do sorteio está aberta.');
  }
  await query(
    `DELETE FROM secret_draw_picks WHERE round_id = $1 AND seat = $2 AND status = 'active'`,
    [roundId, seat]
  );
}

export async function finishSecretDrawRound(
  roundId: number
): Promise<{ pickedCount: number; insuranceRefunded: boolean }> {
  await ensureSecretDrawTables();
  const roundRes = await query(`SELECT * FROM secret_draw_rounds WHERE id = $1`, [roundId]);
  if (roundRes.rows.length === 0) {
    throw new Error('Rodada não encontrada.');
  }
  const round = mapRoundRow(roundRes.rows[0]);
  if (round.status !== 'revealed') {
    return { pickedCount: 0, insuranceRefunded: false };
  }

  await releaseUnpickedCardsFromRound(roundId, round.cards);
  const cntRes = await query(
    `SELECT COUNT(*)::int AS cnt FROM secret_draw_picks WHERE round_id = $1`,
    [roundId]
  );
  const pickedCount = Number(cntRes.rows[0]?.cnt || 0);
  await query(
    `UPDATE secret_draw_rounds SET status = 'cancelled' WHERE id = $1`,
    [roundId]
  );

  let insuranceRefunded = false;
  if (pickedCount === 0 && round.mode !== 'lab_special_test') {
    const ins = await tryConsumeHouseInsurance();
    if (ins.refunded) {
      await ensureWeeklyChipsWallet();
      await query(
        `UPDATE secret_draw_wallet
         SET chips_remaining = chips_remaining + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = 1`
      );
      insuranceRefunded = true;
    }
  }

  return { pickedCount, insuranceRefunded };
}

export async function declineSecretPick(pickId: number, reason = 'Não encontrado para assistir'): Promise<SecretDrawPick> {
  await ensureSecretDrawTables();
  const pickRes = await query(`SELECT * FROM secret_draw_picks WHERE id = $1`, [pickId]);
  if (pickRes.rows.length === 0) {
    throw new Error('Carta selecionada não encontrada.');
  }
  const pick = mapPickRow(pickRes.rows[0]);
  if (pick.status !== 'active') {
    throw new Error('Apenas cartas ativas na fila podem ser declinadas.');
  }

  if (pick.poolId) {
    await query(
      `UPDATE secret_draw_pool SET status = 'declined', skip_reason = $2 WHERE id = $1`,
      [pick.poolId, reason]
    );
  }

  const upd = await query(
    `UPDATE secret_draw_picks
     SET status = 'declined',
         decline_reason = $2,
         declined_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [pickId, reason]
  );
  return mapPickRow(upd.rows[0]);
}

export async function boomerangSecretPick(
  pickId: number,
  reason = 'Não quero ver agora — volta para o baralho'
): Promise<SecretDrawPick> {
  const wallet = await ensureWeeklyChipsWallet();
  if (wallet.boomerangChipsRemaining <= 0) {
    throw new Error(
      `Suas Fichas Bumerangue acabaram (${wallet.boomerangAllowance} nos dias 1 e 15 do mês, máx. ${wallet.maxBoomerangBank})! Nova recarga: ${wallet.nextResetLabel}.`
    );
  }

  const pickRes = await query(`SELECT * FROM secret_draw_picks WHERE id = $1`, [pickId]);
  if (pickRes.rows.length === 0) {
    throw new Error('Carta selecionada não encontrada.');
  }
  const pick = mapPickRow(pickRes.rows[0]);
  if (pick.status !== 'active') {
    throw new Error('Apenas cartas ativas na fila podem usar a Ficha Bumerangue.');
  }
  if (pick.card?.boomerangLocked) {
    throw new Error('Esta carta está acorrentada/travada e não pode usar o Passe Bumerangue!');
  }

  // Diferente do declínio permanente, devolve ao baralho ('available') para poder sair novamente depois!
  if (pick.poolId) {
    await query(
      `UPDATE secret_draw_pool
       SET status = 'available',
           skip_reason = NULL
       WHERE id = $1 AND status = 'drawn'`,
      [pick.poolId]
    );
  }

  const upd = await query(
    `UPDATE secret_draw_picks
     SET status = 'boomerang',
         decline_reason = $2,
         declined_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [pickId, reason]
  );

  await query(
    `UPDATE secret_draw_wallet
     SET boomerang_chips_remaining = GREATEST(0, COALESCE(boomerang_chips_remaining, $1) - 1),
         boomerang_chips_used_this_week = COALESCE(boomerang_chips_used_this_week, 0) + 1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`,
    [WEEKLY_BOOMERANG_CHIPS_LIMIT]
  );

  return mapPickRow(upd.rows[0]);
}

export async function claimSecretDrawPick(pickId: number): Promise<SecretDrawPick> {
  await ensureSecretDrawTables();
  const pickRes = await query(`SELECT * FROM secret_draw_picks WHERE id = $1`, [pickId]);
  if (pickRes.rows.length === 0) {
    throw new Error('Carta selecionada não encontrada.');
  }
  const pick = mapPickRow(pickRes.rows[0]);
  if (pick.status !== 'ready_to_claim') {
    throw new Error('Esta carta ainda não está pronta para colher recompensa.');
  }

  const isGold = pick.rewardMode === 'gold';
  const defaultPts = SECRET_DRAW_XP_BY_DIFFICULTY[pick.difficulty || 'common'];
  const awardXp = isGold ? 0 : pick.xpReward || defaultPts;
  const baseAwardGold = isGold
    ? Math.max(8, Number(pick.goldReward || computeSecretGoldFromPoints(defaultPts)))
    : 0;
  const loupeGold = baseAwardGold > 0 ? await applyGoldenLoupeBonus(baseAwardGold) : { finalGold: 0, bonusGold: 0, applied: false };
  const awardGold = loupeGold.finalGold;

  const upd = await query(
    `UPDATE secret_draw_picks
     SET status = 'completed',
         xp_awarded = $2,
         gold_awarded = $3,
         completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP)
     WHERE id = $1
     RETURNING *`,
    [pickId, awardXp, awardGold]
  );

  if (awardGold > 0) {
    await grantGuildBazaarCoins(awardGold);
  }

  return mapPickRow(upd.rows[0]);
}

export async function labCompleteSecretPick(pickId: number): Promise<SecretDrawPick> {
  await ensureSecretDrawTables();
  const pickRes = await query(`SELECT * FROM secret_draw_picks WHERE id = $1`, [pickId]);
  if (pickRes.rows.length === 0) {
    throw new Error('Carta selecionada não encontrada.');
  }
  const pick = mapPickRow(pickRes.rows[0]);
  if (pick.status !== 'active') {
    throw new Error('Apenas cartas ativas na fila podem ser concluídas.');
  }

  if (pick.poolId) {
    await query(
      `UPDATE secret_draw_pool SET status = 'completed', skip_reason = 'Concluído no Lab Teste' WHERE id = $1`,
      [pick.poolId]
    );
  }

  const upd = await query(
    `UPDATE secret_draw_picks
     SET status = 'ready_to_claim',
         xp_awarded = 0,
         completed_source = 'lab_simulated',
         completed_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [pickId]
  );
  return mapPickRow(upd.rows[0]);
}

export async function labResetSecretDraws(): Promise<void> {
  await ensureSecretDrawTables();
  cachedPoolSheetState = null;
  await query(
    `UPDATE secret_draw_pool
     SET status = CASE WHEN matched_movie_id IS NOT NULL THEN 'watched' ELSE 'available' END,
         skip_reason = CASE WHEN matched_movie_id IS NOT NULL THEN skip_reason ELSE NULL END
     WHERE status IN ('drawn', 'declined', 'completed', 'not_found')`
  );
  await query(`DELETE FROM secret_draw_picks`);
  await query(`DELETE FROM secret_draw_rounds`);
  await query(`DELETE FROM secret_draw_special_stats`);
  const { cycleKey } = getSaoPaulo15DayCycleInfo();
  await query(
    `INSERT INTO secret_draw_wallet (
       id, week_key, weekly_allowance, chips_remaining, chips_used_this_week,
       boomerang_weekly_allowance, boomerang_chips_remaining, boomerang_chips_used_this_week, updated_at
     )
     VALUES (1, $1, $2, $2, 0, $3, $3, 0, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE SET
       week_key = EXCLUDED.week_key,
       weekly_allowance = EXCLUDED.weekly_allowance,
       chips_remaining = EXCLUDED.chips_remaining,
       chips_used_this_week = 0,
       boomerang_weekly_allowance = EXCLUDED.boomerang_weekly_allowance,
       boomerang_chips_remaining = EXCLUDED.boomerang_chips_remaining,
       boomerang_chips_used_this_week = 0,
       updated_at = CURRENT_TIMESTAMP`,
    [cycleKey, WEEKLY_DRAW_CHIPS_LIMIT, WEEKLY_BOOMERANG_CHIPS_LIMIT]
  );
}

export async function checkAndCompleteActiveDrawOnMovieSave(params: {
  movieId: number;
  tmdbId?: number | null;
  imdbId?: string | null;
  title?: string | null;
  originalTitle?: string | null;
  releaseYear?: number | null;
}): Promise<SecretDrawPick | null> {
  await ensureSecretDrawTables();
  const activeRes = await query(
    `SELECT * FROM secret_draw_picks WHERE status = 'active' ORDER BY picked_at DESC, id DESC`
  );
  if (activeRes.rows.length === 0) return null;

  const incomingImdbId = params.imdbId?.toLowerCase().trim() || null;
  const incomingTitles = [params.title, params.originalTitle].map(normalizeCompareText).filter(Boolean);

  for (const row of activeRes.rows) {
    const pick = mapPickRow(row);
    const chosenCard = pick.card;
    if (!chosenCard) continue;

    const targetTmdbId = chosenCard.resolved?.tmdbId;
    const targetImdbId = chosenCard.resolved?.imdbId?.toLowerCase().trim() || null;

    const matchesById =
      (targetTmdbId && params.tmdbId && Number(targetTmdbId) === Number(params.tmdbId)) ||
      (targetImdbId && incomingImdbId && targetImdbId === incomingImdbId);

    const cardTitles = new Set(
      [
        chosenCard.resolved?.title,
        chosenCard.resolved?.originalTitle,
        chosenCard.planilha?.cleanedTitle,
        chosenCard.planilha?.rawTitle,
      ]
        .map(normalizeCompareText)
        .filter(Boolean)
    );
    const yearMatches =
      !chosenCard.resolved?.releaseYear ||
      !params.releaseYear ||
      Math.abs(chosenCard.resolved.releaseYear - params.releaseYear) <= 1;

    const matchesByTitle = yearMatches && incomingTitles.some((t) => cardTitles.has(t));

    if (!matchesById && !matchesByTitle) {
      continue;
    }

    if (pick.poolId) {
      await query(
        `UPDATE secret_draw_pool
         SET status = 'completed', matched_movie_id = $2, skip_reason = 'Concluído via cadastro no catálogo'
         WHERE id = $1`,
        [pick.poolId, params.movieId]
      );
    }

    const upd = await query(
      `UPDATE secret_draw_picks
       SET status = 'ready_to_claim',
           xp_awarded = 0,
           completed_movie_id = $2,
           completed_source = 'catalog_save',
           completed_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [pick.id, params.movieId]
    );

    return mapPickRow(upd.rows[0]);
  }

  return null;
}

export async function getQuickSecretDrawXpSummary(): Promise<SecretDrawXpSummary> {
  try {
    await ensureSecretDrawTables();
    const res = await query(
      `SELECT id, round_id, difficulty, xp_awarded, gold_awarded, reward_mode, card_json, completed_at
       FROM secret_draw_picks
       WHERE status = 'completed'
       ORDER BY completed_at ASC, id ASC`
    );

    const byDifficulty: SecretDrawXpSummary['byDifficulty'] = {
      common: { count: 0, totalXp: 0 },
      medium: { count: 0, totalXp: 0 },
      hard: { count: 0, totalXp: 0 },
      very_hard: { count: 0, totalXp: 0 },
      exotic: { count: 0, totalXp: 0 },
    };
    const completedRoundsMap: SecretDrawXpSummary['completedRoundsMap'] = {};
    let totalXp = 0;
    let totalGold = 0;

    for (const r of res.rows || []) {
      const diff = (String(r.difficulty || 'common') as SecretDrawDifficulty) || 'common';
      const xp = Math.max(0, Number(r.xp_awarded || 0));
      const gold = Math.max(0, Number(r.gold_awarded || 0));
      totalXp += xp;
      totalGold += gold;
      if (byDifficulty[diff]) {
        byDifficulty[diff].count += 1;
        byDifficulty[diff].totalXp += xp;
      }
      const chosen = r.card_json || {};
      const title = chosen?.resolved?.title || chosen?.planilha?.cleanedTitle || `Carta #${r.id}`;
      completedRoundsMap[`pick_${r.id}`] = {
        roundId: Number(r.round_id || r.id),
        title,
        difficulty: diff,
        xp,
        gold,
        completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : null,
      };
    }

    return {
      completedCount: (res.rows || []).length,
      totalXp,
      totalGold,
      byDifficulty,
      completedRoundsMap,
    };
  } catch {
    return EMPTY_SECRET_DRAW_XP_SUMMARY;
  }
}

export async function getSecretDrawStatus(): Promise<{
  labMode: boolean;
  infiniteChips: boolean;
  chipsWallet: SecretDrawChipsWallet;
  activeWatchLimit: number;
  activeWatchCount: number;
  readyToClaimCount: number;
  readyToClaimPicks: SecretDrawPick[];
  poolSummary: {
    totalRawRows: number;
    totalUniqueRows: number;
    dedupRemovedCount: number;
    alreadyWatchedAtSync: number;
    availableCount: number;
    watchedCount: number;
    notFoundCount: number;
    declinedCount: number;
    completedCount: number;
    drawnCount: number;
    removedCount: number;
    lastSyncSource: string | null;
    syncedAt: string | null;
    sampleNormalized: any[];
  };
  deckStats: {
    totalRoundsCount: number;
    totalCardsDealtCount: number;
    completedRoundsCount: number;
    declinedRoundsCount: number;
    boomerangRoundsCount: number;
    activeRoundsCount: number;
  };
  xpSummary: SecretDrawXpSummary;
  currentRound: SecretDrawRound | null;
  currentRoundPickedSeats: number[];
  recentHistory: SecretDrawRound[];
  miniCatalog: SecretDrawPick[];
  specialCardsCatalog: SecretSpecialCardDef[];
  specialCardStats: {
    totalTriggered: number;
    countsById: Record<string, number>;
  };
}> {
  await ensurePoolPopulatedIfEmpty();

  const [countsRes, metaRes, currentRes, historyRes, miniCatalogRes, deckStatsRes, xpSummary, chipsWallet, specialCardStats] = await Promise.all([
    query(`SELECT status, COUNT(*)::int AS cnt FROM secret_draw_pool GROUP BY status`),
    query(`SELECT * FROM secret_draw_sync_meta WHERE id = 1`),
    query(
      `SELECT * FROM secret_draw_rounds WHERE status = 'revealed' ORDER BY id DESC LIMIT 1`
    ),
    query(
      `SELECT id, mode, status, requested_card_count, saga_rule, power_flags_json,
              cards_json, COALESCE(jsonb_array_length(audit_log_json), 0)::int AS audit_count,
              chosen_seat, chosen_pool_id, chosen_difficulty, xp_awarded, locked_xp,
              completed_movie_id, completed_source, decline_reason,
              created_at, chosen_at, completed_at, declined_at
       FROM secret_draw_rounds
       WHERE status IN ('completed', 'declined', 'cancelled')
       ORDER BY id DESC LIMIT 20`
    ),
    query(
      `SELECT * FROM secret_draw_picks
       ORDER BY CASE status WHEN 'ready_to_claim' THEN 0 WHEN 'active' THEN 1 WHEN 'completed' THEN 2 WHEN 'boomerang' THEN 3 ELSE 4 END,
                COALESCE(completed_at, declined_at, picked_at) DESC,
                id DESC
       LIMIT 80`
    ),
    query(
      `SELECT
         (SELECT COUNT(*)::int FROM secret_draw_rounds) AS total_rounds,
         (SELECT COALESCE(SUM(CASE WHEN jsonb_typeof(cards_json) = 'array' THEN jsonb_array_length(cards_json) ELSE 0 END), 0)::int FROM secret_draw_rounds) AS total_cards_dealt,
         (SELECT COUNT(*)::int FROM secret_draw_picks WHERE status = 'completed') AS completed_picks,
         (SELECT COUNT(*)::int FROM secret_draw_picks WHERE status = 'declined') AS declined_picks,
         (SELECT COUNT(*)::int FROM secret_draw_picks WHERE status = 'boomerang') AS boomerang_picks,
         (SELECT COUNT(*)::int FROM secret_draw_picks WHERE status = 'active') AS active_picks,
         (SELECT COUNT(*)::int FROM secret_draw_picks WHERE status = 'ready_to_claim') AS ready_picks`
    ),
    getQuickSecretDrawXpSummary(),
    ensureWeeklyChipsWallet(),
    getSecretDrawSpecialCardStats(),
  ]);

  const countsMap: Record<string, number> = {};
  let totalUniqueRows = 0;
  for (const r of countsRes.rows || []) {
    const cnt = Number(r.cnt || 0);
    countsMap[String(r.status)] = cnt;
    totalUniqueRows += cnt;
  }

  const currentRound = currentRes.rows[0] ? mapRoundRow(currentRes.rows[0]) : null;
  let currentRoundPickedSeats: number[] = [];
  if (currentRound) {
    const pickedRes = await query(
      `SELECT seat FROM secret_draw_picks WHERE round_id = $1`,
      [currentRound.id]
    );
    currentRoundPickedSeats = (pickedRes.rows || []).map((x: any) => Number(x.seat));
  }

  const meta = metaRes.rows[0] || {};
  const statsRow = deckStatsRes.rows[0] || {};
  const activeWatchCount = Number(statsRow.active_picks || 0);
  const readyToClaimCount = Number(statsRow.ready_picks || 0);
  const mappedMiniCatalog = (miniCatalogRes.rows || []).map(mapPickRow);
  const readyToClaimPicks = mappedMiniCatalog.filter((p) => p.status === 'ready_to_claim');
  const hasVipSeat = await hasGuildRelic('vip_seat');

  return {
    labMode: true,
    infiniteChips: false,
    chipsWallet,
    activeWatchLimit: MAX_ACTIVE_SECRET_PICKS + (hasVipSeat ? 1 : 0),
    activeWatchCount,
    readyToClaimCount,
    readyToClaimPicks,
    poolSummary: {
      totalRawRows: Number(meta.total_raw_rows || totalUniqueRows),
      totalUniqueRows,
      dedupRemovedCount: Number(meta.dedup_removed_count || 0),
      alreadyWatchedAtSync: Number(meta.already_watched_at_sync || 0),
      availableCount: countsMap.available || 0,
      watchedCount: countsMap.watched || 0,
      notFoundCount: countsMap.not_found || 0,
      declinedCount: countsMap.declined || 0,
      completedCount: countsMap.completed || 0,
      drawnCount: countsMap.drawn || 0,
      removedCount: countsMap.removed || 0,
      lastSyncSource: meta.last_sync_source || null,
      syncedAt: meta.synced_at ? new Date(meta.synced_at).toISOString() : null,
      sampleNormalized: Array.isArray(meta.sample_normalized_json) ? meta.sample_normalized_json : [],
    },
    deckStats: {
      totalRoundsCount: Number(statsRow.total_rounds || 0),
      totalCardsDealtCount: Number(statsRow.total_cards_dealt || 0),
      completedRoundsCount: Number(statsRow.completed_picks || 0),
      declinedRoundsCount: Number(statsRow.declined_picks || 0),
      boomerangRoundsCount: Number(statsRow.boomerang_picks || 0),
      activeRoundsCount: activeWatchCount,
    },
    xpSummary,
    currentRound,
    currentRoundPickedSeats,
    recentHistory: (historyRes.rows || []).map(mapRoundRow),
    miniCatalog: mappedMiniCatalog,
    specialCardsCatalog: SECRET_SPECIAL_CARDS_CATALOG,
    specialCardStats,
  };
}

const SECRET_DRAW_BUFF_PRESETS: Record<
  string,
  { buff: SecretDrawPowerBuff; message: string }
> = {
  andarilho_setima_arte: {
    buff: { classId: 'andarilho_setima_arte', powerTitle: 'Passo de Camaleão', forceCardCount: 7 },
    message: '🎒 Passo de Camaleão armado! Seu próximo sorteio abrirá 7 cartas na mesa.',
  },
  sicario_telonas: {
    buff: { classId: 'sicario_telonas', powerTitle: 'Saque Relâmpago', filterMaxRuntime: 105 },
    message: '⚡ Saque Relâmpago armado! O próximo sorteio buscará apenas filmes enxutos (≤ 105 min).',
  },
  corsario_sete_mares: {
    buff: { classId: 'corsario_sete_mares', powerTitle: 'Contrabando no Convés', allowExtraActivePick: true },
    message: '🏴‍☠️ Contrabando armado! Próximo sorteio aceita +1 carta acima do limite de pendentes!',
  },
  vampiro_madrugada: {
    buff: { classId: 'vampiro_madrugada', powerTitle: 'Voo Noturno', forceCardCount: 8, minDifficulty: 'medium' },
    message: '🦇 Voo Noturno armado! Próximo sorteio abrirá 8 cartas de raridade Mediana (♦) ou superior.',
  },
  cartografo_195_reinos: {
    buff: { classId: 'cartografo_195_reinos', powerTitle: 'Rosa dos Ventos', forceCardCount: 7, bonusNextPickXp: 20 },
    message: '🧭 Rosa dos Ventos armada! Próximo sorteio terá 7 cartas e +20 XP bônus na carta escolhida.',
  },
  cavaleiro_laser_azul: {
    buff: { classId: 'cavaleiro_laser_azul', powerTitle: 'Encarte com Luva', forceCardCount: 10 },
    message: '💿 Encarte com Luva armado! Próximo sorteio abrirá uma mão com 10 cartas.',
  },
  algoz_tomatometro: {
    buff: { classId: 'algoz_tomatometro', powerTitle: 'Leque Implacável', forceCardCount: 12, minDifficulty: 'medium' },
    message: '🎯 Leque Implacável armado! Próximo sorteio trará 12 cartas sem nenhuma Comum (♣)!',
  },
  arquimago_tempo: {
    buff: {
      classId: 'arquimago_tempo',
      powerTitle: 'Portal das Décadas',
      forceCardCount: 9,
      prioritizeUnconqueredYears: true,
      xrayUnconqueredYearsOnly: true,
    },
    message:
      '⏳ Portal das Décadas armado! Próximo sorteio abrirá 9 cartas destacando SOMENTE Anos Inéditos da Máquina do Tempo!',
  },
  cronista_creditos_pos: {
    buff: { classId: 'cronista_creditos_pos', powerTitle: 'Cena Pós-Créditos', forceCardCount: 9, bonusNextPickXp: 25 },
    message: '🎞️ Cena Pós-Créditos armada! Próximo sorteio trará 9 cartas e +25 XP extras na escolhida.',
  },
  oraculo_pelicula: {
    buff: {
      classId: 'oraculo_pelicula',
      powerTitle: 'Clarividência de 15 Cartas',
      forceCardCount: 15,
      revealMilestonesXray: true,
    },
    message: '🔮 Clarividência armada! Próximo sorteio abrirá 15 CARTAS com Raio-X completo de todos os marcos!',
  },
  arquiteto_multiverso: {
    buff: {
      classId: 'arquiteto_multiverso',
      powerTitle: 'Fenda de 10 Cartas Raras',
      forceCardCount: 10,
      minDifficulty: 'hard',
      revealMilestonesXray: true,
      allowExtraActivePick: true,
    },
    message: '🌌 Fenda Multiversal armada! Próximo sorteio trará 10 cartas Difícil (♠)+ com Raio-X e vaga extra na fila!',
  },
};

const SECRET_XP_BONUS_PRESETS: Record<string, { bonusXp: number; title: string; icon: string }> = {
  barbaro_imax: { bonusXp: 20, title: 'Ingresso de Pipoca', icon: '🍿' },
  monge_tres_casas: { bonusXp: 25, title: 'Peso Exato', icon: '⚖️' },
  gladiador_ps5: { bonusXp: 30, title: 'Troféu de Arena', icon: '🛡️' },
};

const SECRET_RARITY_LADDER: SecretDrawDifficulty[] = [
  'common',
  'medium',
  'hard',
  'very_hard',
  'exotic',
];

async function freeBoomerangReturnPick(pick: SecretDrawPick, reason: string): Promise<void> {
  if (pick.poolId) {
    await query(
      `UPDATE secret_draw_pool
       SET status = 'available', skip_reason = NULL
       WHERE id = $1 AND status = 'drawn'`,
      [pick.poolId]
    );
  }
  await query(
    `UPDATE secret_draw_picks
     SET status = 'boomerang', decline_reason = $2, declined_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [pick.id, reason]
  );
}

export async function activateSecretDrawClassPower(params: {
  classId: string;
  pickId?: number;
}): Promise<{
  message: string;
  classWallet: ClassPowerWalletStatus;
  data: Awaited<ReturnType<typeof getSecretDrawStatus>>;
}> {
  await ensureSecretDrawTables();
  const walletBefore = await assertClassPowerChargeAvailable('secret_draw');
  const classId = String(params.classId || '').trim();

  const [openRoundRes, activePicksRes] = await Promise.all([
    query(`SELECT * FROM secret_draw_rounds WHERE status = 'revealed' ORDER BY id DESC LIMIT 1`),
    query(`SELECT * FROM secret_draw_picks WHERE status = 'active' ORDER BY picked_at DESC, id DESC`),
  ]);

  const openRound = openRoundRes.rows[0] ? mapRoundRow(openRoundRes.rows[0]) : null;
  const activePicks = (activePicksRes.rows || []).map(mapPickRow);
  const selectedPick =
    params.pickId != null
      ? activePicks.find((p) => p.id === Number(params.pickId)) || null
      : null;
  if (params.pickId != null && !selectedPick) {
    throw new Error('A carta selecionada não está mais ativa na sua fila.');
  }

  let resultMessage = '';

  if (classId === 'bardo_herbert_richers' || classId === 'cacador_trufas') {
    const isXray = classId === 'cacador_trufas';
    const powerTitle = isXray ? 'Faro de Relíquias' : 'Refrão Nostálgico';
    if (openRound) {
      const curFlags = openRound.powerFlags || {};
      const alreadyActive = isXray ? curFlags.xrayMilestones : curFlags.revealYearRuntime;
      if (!alreadyActive) {
        const nextFlags: SecretDrawRoundPowerFlags = {
          ...curFlags,
          classId,
          powerTitle,
          ...(isXray ? { xrayMilestones: true } : { revealYearRuntime: true }),
        };
        const needsDecoyPatch = openRound.cards.some(
          (c) =>
            Boolean(c.specialEvent) &&
            !c.specialEvent?.triggered &&
            (!c.decoyYear ||
              !c.decoyRuntime ||
              !Array.isArray(c.decoyMilestones) ||
              c.decoyMilestones.some((m) => m.label === 'Marco Oculto'))
        );
        if (needsDecoyPatch) {
          const predCtx = await createPredictionContext();
          const decoyCtx = buildDecoyContextFromPredCtx(predCtx);
          const patchedCards = openRound.cards.map((c) => {
            if (!c.specialEvent || c.specialEvent.triggered) return c;
            const totalCount = Math.max(1, Number(c.totalMilestonesCount || c.decoyMilestones?.length || 2));
            const decoys = buildDecoyVisualFields(totalCount, decoyCtx);
            return {
              ...c,
              decoyMilestones: decoys.decoyMilestones,
              decoyYear: decoys.decoyYear,
              decoyRuntime: decoys.decoyRuntime,
            };
          });
          await query(
            `UPDATE secret_draw_rounds SET power_flags_json = $2::jsonb, cards_json = $3::jsonb WHERE id = $1`,
            [openRound.id, JSON.stringify(nextFlags), JSON.stringify(patchedCards)]
          );
        } else {
          await query(`UPDATE secret_draw_rounds SET power_flags_json = $2::jsonb WHERE id = $1`, [
            openRound.id,
            JSON.stringify(nextFlags),
          ]);
        }
        resultMessage = isXray
          ? `🍄 Raio-X de Marcos ativado nas ${openRound.cards.length} cartas abertas da mesa!`
          : `🎙️ Ano de lançamento e duração revelados nas ${openRound.cards.length} cartas da mesa!`;
      } else {
        throw new Error(`A mão aberta na mesa já possui ${powerTitle} ativo!`);
      }
    } else {
      if (walletBefore.secretBuff) {
        throw new Error(`Já existe o poder "${walletBefore.secretBuff.powerTitle}" armado para o próximo sorteio!`);
      }
      await setSecretDrawPowerBuff({
        classId,
        powerTitle,
        ...(isXray ? { revealMilestonesXray: true } : { revealYearRuntime: true }),
      });
      resultMessage = isXray
        ? '🍄 Faro de Relíquias armado! Seu próximo sorteio mostrará o Raio-X dos marcos no verso!'
        : '🎙️ Refrão Nostálgico armado! Próximo sorteio revelará ano e duração no verso das cartas!';
    }
  } else if (SECRET_DRAW_BUFF_PRESETS[classId]) {
    const preset = SECRET_DRAW_BUFF_PRESETS[classId];
    if (walletBefore.secretBuff) {
      throw new Error(`Já existe o poder "${walletBefore.secretBuff.powerTitle}" armado para o próximo sorteio!`);
    }
    await setSecretDrawPowerBuff(preset.buff);
    resultMessage = preset.message;
  } else if (SECRET_XP_BONUS_PRESETS[classId]) {
    const preset = SECRET_XP_BONUS_PRESETS[classId];
    if (selectedPick) {
      const isGold = selectedPick.rewardMode === 'gold';
      const deltaGold = isGold ? computeSecretGoldFromPoints(preset.bonusXp) : 0;
      const nextXp = isGold ? 0 : selectedPick.xpReward + preset.bonusXp;
      const nextGold = isGold ? Number(selectedPick.goldReward || 0) + deltaGold : 0;
      const nextCard = {
        ...selectedPick.card,
        rewardMode: isGold ? ('gold' as const) : ('xp' as const),
        xpReward: nextXp,
        goldReward: nextGold,
      };
      await query(
        `UPDATE secret_draw_picks SET xp_reward = $2, gold_reward = $3, card_json = $4::jsonb WHERE id = $1`,
        [selectedPick.id, nextXp, nextGold, JSON.stringify(nextCard)]
      );
      resultMessage = isGold
        ? `${preset.icon} ${preset.title}: +${deltaGold} 🪙 aplicados em "${selectedPick.card?.resolved?.title || `Carta #${selectedPick.id}`}" (agora vale +${nextGold} 🪙)!`
        : `${preset.icon} ${preset.title}: +${preset.bonusXp} XP aplicados em "${selectedPick.card?.resolved?.title || `Carta #${selectedPick.id}`}" (agora vale +${nextXp} XP)!`;
    } else {
      if (walletBefore.secretBuff) {
        throw new Error(`Já existe o poder "${walletBefore.secretBuff.powerTitle}" armado para o próximo sorteio!`);
      }
      await setSecretDrawPowerBuff({
        classId,
        powerTitle: preset.title,
        bonusNextPickXp: preset.bonusXp,
      });
      resultMessage = `${preset.icon} ${preset.title} armado! A próxima carta escolhida no sorteio ganhará +${preset.bonusXp} pts (em XP ou Ouro)!`;
    }
  } else if (classId === 'carnical_grindhouse' || classId === 'sacerdote_cinefilo') {
    const targetPick =
      selectedPick || (params.pickId == null && activePicks.length === 1 ? activePicks[0] : null);
    if (!targetPick) {
      throw new Error(
        activePicks.length > 1
          ? 'Selecione exatamente qual filme ativo da sua fila deve receber o poder!'
          : 'Tenha pelo menos 1 carta ativa na fila para usar este poder!'
      );
    }
    const isPriest = classId === 'sacerdote_cinefilo';
    if (isPriest && walletBefore.secretBuff) {
      throw new Error(`Já existe o poder "${walletBefore.secretBuff.powerTitle}" armado para o próximo sorteio!`);
    }
    await freeBoomerangReturnPick(
      targetPick,
      isPriest ? 'Purificado pelo Exorcismo de Naipe (Sacerdote)' : 'Devolvido por Fita Manjada (Carniçal)'
    );
    if (isPriest) {
      await setSecretDrawPowerBuff({
        classId,
        powerTitle: 'Exorcismo de Naipe',
        minDifficulty: 'hard',
      });
      resultMessage = `✝️ Carta "${targetPick.card?.resolved?.title || `#${targetPick.id}`}" purificada de volta ao baralho E próximo sorteio garantirá cartas Difícil (♠) ou superiores!`;
    } else {
      resultMessage = `📼 Fita Manjada usada! "${targetPick.card?.resolved?.title || `#${targetPick.id}`}" voltou para o baralho sem gastar Bumerangue!`;
    }
  } else if (classId === 'paladino_oscar') {
    const targetPick =
      selectedPick || (params.pickId == null && activePicks.length === 1 ? activePicks[0] : null);
    if (!targetPick) {
      throw new Error(
        activePicks.length > 1
          ? 'Selecione exatamente qual carta ativa da fila deseja consagrar!'
          : 'Tenha pelo menos 1 carta ativa na fila para consagrar!'
      );
    }
    const curIdx = SECRET_RARITY_LADDER.indexOf(targetPick.difficulty);
    if (curIdx === -1 || curIdx >= SECRET_RARITY_LADDER.length - 1) {
      throw new Error(`A carta "${targetPick.card?.resolved?.title}" já está no grau máximo Exótico (★)! Escolha outra carta ativa.`);
    }
    const nextDiff = SECRET_RARITY_LADDER[curIdx + 1];
    const nextMeta = SECRET_DRAW_DIFFICULTY_META[nextDiff];
    const isGold = targetPick.rewardMode === 'gold';
    const prevBasePts = SECRET_DRAW_XP_BY_DIFFICULTY[targetPick.difficulty];
    const nextBasePts = SECRET_DRAW_XP_BY_DIFFICULTY[nextDiff];
    const bonusDiff = isGold ? 0 : Math.max(0, targetPick.xpReward - prevBasePts);
    const nextXp = isGold ? 0 : nextBasePts + bonusDiff;
    const bonusGoldDiff = isGold
      ? Math.max(0, Number(targetPick.goldReward || 0) - computeSecretGoldFromPoints(prevBasePts))
      : 0;
    const nextGold = isGold ? computeSecretGoldFromPoints(nextBasePts) + bonusGoldDiff : 0;

    const updatedCard: SecretDrawCard = {
      ...targetPick.card,
      difficulty: nextDiff,
      difficultyLabel: nextMeta.label,
      difficultyIcon: nextMeta.icon,
      rewardMode: isGold ? 'gold' : 'xp',
      xpReward: nextXp,
      goldReward: nextGold,
    };
    await query(
      `UPDATE secret_draw_picks
       SET difficulty = $2, xp_reward = $3, gold_reward = $4, card_json = $5::jsonb
       WHERE id = $1`,
      [targetPick.id, nextDiff, nextXp, nextGold, JSON.stringify(updatedCard)]
    );
    resultMessage = isGold
      ? `👑 Decreto da Academia aplicado! "${targetPick.card?.resolved?.title}" subiu para ${nextMeta.icon} ${nextMeta.label} (+${nextGold} 🪙)!`
      : `👑 Decreto da Academia aplicado! "${targetPick.card?.resolved?.title}" subiu para ${nextMeta.icon} ${nextMeta.label} (+${nextXp} XP)!`;
  } else if (classId === 'alquimista_maratonas') {
    if (walletBefore.secretBuff) {
      throw new Error(`Já existe o poder "${walletBefore.secretBuff.powerTitle}" armado para o próximo sorteio!`);
    }
    await ensureWeeklyChipsWallet();
    await query(
      `UPDATE secret_draw_wallet
       SET boomerang_chips_remaining = COALESCE(boomerang_chips_remaining, 0) + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`
    );
    await setSecretDrawPowerBuff({
      classId,
      powerTitle: 'Destilado Cult',
      bonusNextPickXp: 20,
    });
    resultMessage = '⚗️ Destilado Cult ativado! +1 Ficha Bumerangue na carteira e +20 XP armados para o próximo sorteio!';
  } else {
    throw new Error('Classe não reconhecida para poder da Sessão Secreta.');
  }

  const classWallet = await consumeClassPowerCharge('secret_draw');
  const data = await getSecretDrawStatus();
  return {
    message: resultMessage,
    classWallet,
    data,
  };
}

export async function activateSecretDrawBazaarPower(params: {
  action:
    | 'arm_amulet'
    | 'arm_plus2'
    | 'arm_plus5'
    | 'arm_special_storm'
    | 'activate_radar'
    | 'transmute_pick';
  pickId?: number | null;
}): Promise<{
  message: string;
  bazaarStatus: any;
  data: Awaited<ReturnType<typeof getSecretDrawStatus>>;
}> {
  await ensureSecretDrawTables();
  const action = params.action;
  const armedBefore = await getSecretArmedFlags();
  let message = '';
  let bazaarStatus: any = null;

  if (action === 'arm_amulet') {
    if (armedBefore.amuletArmed) {
      throw new Error('O Escudo do Arlequim (Amuleto Contra-Maldição) já está armado!');
    }
    const cons = await consumeTacticalPowerCharge('secret_amulet');
    bazaarStatus = await updateSecretArmedFlags({ amuletArmed: true });
    message = `🛡️ Escudo do Arlequim armado! A próxima Carta Amaldiçoada será anulada (${cons.remaining} restante(s)).`;
  } else if (action === 'arm_plus2') {
    if (Number(armedBefore.pendingExtraCards || 0) > 0) {
      throw new Error(
        `Você já armou +${armedBefore.pendingExtraCards} carta(s) extra(s) para o próximo sorteio! Não é permitido acumular poderes que aumentam o número de cartas.`
      );
    }
    const cons = await consumeTacticalPowerCharge('secret_hand_plus2');
    const nextExtra = 2;
    bazaarStatus = await updateSecretArmedFlags({ pendingExtraCards: nextExtra });
    message = `🃏 Manga Cheia armada! O próximo sorteio virá com +${nextExtra} carta(s) extra(s) na mesa (${cons.remaining} restante(s)).`;
  } else if (action === 'arm_plus5') {
    if (Number(armedBefore.pendingExtraCards || 0) > 0) {
      throw new Error(
        `Você já armou +${armedBefore.pendingExtraCards} carta(s) extra(s) para o próximo sorteio! Não é permitido acumular poderes que aumentam o número de cartas.`
      );
    }
    const cons = await consumeTacticalPowerCharge('secret_hand_plus5');
    const nextExtra = 5;
    bazaarStatus = await updateSecretArmedFlags({ pendingExtraCards: nextExtra });
    message = `🌟 Manga Cheia Suprema armada! O próximo sorteio virá com +${nextExtra} carta(s) extra(s) na mesa (${cons.remaining} restante(s)).`;
  } else if (action === 'arm_special_storm') {
    if (armedBefore.pendingSpecialStorm) {
      throw new Error('Baralho Carregado (2–6 Especiais) já está armado para o próximo sorteio!');
    }
    const cons = await consumeTacticalPowerCharge('secret_special_storm');
    bazaarStatus = await updateSecretArmedFlags({ pendingSpecialStorm: true });
    message = `🌪️ Baralho Carregado armado! A próxima mão terá de 2 a 6 Cartas Especiais disfarçadas (${cons.remaining} restante(s)).`;
  } else if (action === 'activate_radar') {
    const openRes = await query(
      `SELECT * FROM secret_draw_rounds WHERE status = 'revealed' ORDER BY id DESC LIMIT 1`
    );
    if (openRes.rows.length > 0) {
      const round = mapRoundRow(openRes.rows[0]);
      const pickedRes = await query(`SELECT seat FROM secret_draw_picks WHERE round_id = $1`, [round.id]);
      const pickedSet = new Set((pickedRes.rows || []).map((r: any) => Number(r.seat)));
      const targets = round.cards.filter(
        (c) =>
          !pickedSet.has(Number(c.seat)) &&
          !c.removedByCurse &&
          !c.specialEvent?.triggered &&
          Boolean(c.specialEvent) &&
          !c.specialPulseHint
      );
      if (targets.length === 0) {
        const alreadyPulsing = round.cards.some(
          (c) => !pickedSet.has(Number(c.seat)) && !c.removedByCurse && c.specialPulseHint
        );
        throw new Error(
          alreadyPulsing
            ? 'As Cartas Especiais fechadas desta mesa já estão piscando no Radar!'
            : 'Nenhuma Carta Especial fechada oculta restante nesta mesa (ou todas já foram abertas).'
        );
      }
      const cons = await consumeTacticalPowerCharge('secret_radar');
      const targetSeats = new Set(targets.map((c) => Number(c.seat)));
      const nextCards = round.cards.map((c) =>
        targetSeats.has(Number(c.seat)) ? { ...c, specialPulseHint: true } : c
      );
      await query(`UPDATE secret_draw_rounds SET cards_json = $2::jsonb WHERE id = $1`, [
        round.id,
        JSON.stringify(nextCards),
      ]);
      bazaarStatus = cons.status;
      message = `🕵️ Radar do Croupier ativado! ${targetSeats.size} Carta(s) Especial(is) fechada(s) começaram a pulsar na mesa.`;
    } else {
      if (armedBefore.pendingRadar) {
        throw new Error('O Radar do Croupier já está armado para o próximo sorteio!');
      }
      const cons = await consumeTacticalPowerCharge('secret_radar');
      bazaarStatus = await updateSecretArmedFlags({ pendingRadar: true });
      message = `🕵️ Radar do Croupier armado! Assim que sortear a próxima mão, todas as Especiais ocultas já virão piscando (${cons.remaining} restante(s)).`;
    }
  } else if (action === 'transmute_pick') {
    const pid = Number(params.pickId || 0);
    if (!Number.isFinite(pid) || pid <= 0) {
      throw new Error('Selecione um filme ativo na fila para usar o Selo de Transmutação.');
    }
    const pRes = await query(`SELECT * FROM secret_draw_picks WHERE id = $1`, [pid]);
    if (pRes.rows.length === 0) {
      throw new Error('Carta da fila não encontrada.');
    }
    const pick = mapPickRow(pRes.rows[0]);
    if (pick.status !== 'active') {
      throw new Error('Apenas cartas ativas em andamento na fila podem usar o Selo de Transmutação.');
    }
    const cons = await consumeTacticalPowerCharge('secret_transmute');
    bazaarStatus = cons.status;

    const wasGold = pick.rewardMode === 'gold';
    const nextMode: 'xp' | 'gold' = wasGold ? 'xp' : 'gold';
    const baseDiffPts = SECRET_DRAW_XP_BY_DIFFICULTY[pick.difficulty || 'common'] || 35;
    const prevGold = Math.max(8, Number(pick.goldReward || computeSecretGoldFromPoints(baseDiffPts)));
    const prevXp = Math.max(10, Number(pick.xpReward || baseDiffPts));
    const nextXp = nextMode === 'xp' ? Math.max(10, Math.round(prevGold / SECRET_GOLD_PER_XP_RATE)) : 0;
    const nextGold = nextMode === 'gold' ? computeSecretGoldFromPoints(prevXp) : 0;

    const updatedCard: SecretDrawCard = {
      ...pick.card,
      rewardMode: nextMode,
      xpReward: nextXp,
      goldReward: nextGold,
      transmutedByBazaar: true,
    };

    await query(
      `UPDATE secret_draw_picks
       SET reward_mode = $2, xp_reward = $3, gold_reward = $4, card_json = $5::jsonb
       WHERE id = $1`,
      [pick.id, nextMode, nextXp, nextGold, JSON.stringify(updatedCard)]
    );

    message =
      nextMode === 'gold'
        ? `🪙 Selo de Transmutação: "${pick.card?.resolved?.title}" convertido de +${prevXp} XP para +${nextGold} 🪙!`
        : `⚡ Selo de Transmutação: "${pick.card?.resolved?.title}" convertido de +${prevGold} 🪙 para +${nextXp} XP!`;
  } else {
    throw new Error('Poder do Bazar desconhecido para Sessão Secreta.');
  }

  const data = await getSecretDrawStatus();
  return {
    message,
    bazaarStatus,
    data,
  };
}
