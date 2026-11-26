import { query } from '../config/database';
import { getSaoPauloMonthCycleInfo, getSaoPaulo15DayCycleInfo } from '../utils/cycleUtils';
import { labAddWeeklyDrawChip } from './secretDrawService';
import { labAddChimeraChip } from './chimeraService';
import { labAddBingoChip } from './bingoService';
import { labGrantClassPowerCharge } from './classPowersService';

export type BazaarItemKind =
  | 'skin'
  | 'backdrop'
  | 'frame'
  | 'bubble'
  | 'xp_bar'
  | 'relic'
  | 'power'
  | 'monthly';

export type BazaarRelicId = 'vip_seat' | 'golden_loupe' | 'house_insurance';

export type TacticalPowerKey =
  | 'secret_amulet'
  | 'secret_transmute'
  | 'secret_radar'
  | 'secret_hand_plus2'
  | 'secret_hand_plus5'
  | 'secret_special_storm'
  | 'chimera_oracle_2'
  | 'chimera_oracle_3'
  | 'chimera_tarot_reroll'
  | 'chimera_invert_essence'
  | 'chimera_golden_jackpot'
  | 'bingo_hybrid_seal';

export interface SecretArmedFlags {
  amuletArmed?: boolean;
  pendingExtraCards?: number;
  pendingSpecialStorm?: boolean;
  pendingRadar?: boolean;
}

export interface BazaarCatalogItemDef {
  id: string;
  name: string;
  kind: BazaarItemKind;
  targetId: string;
  priceCoins: number;
  monthlyLimit?: number;
  grantedSummary?: string;
}

const DEFAULT_OWNED_SKINS = ['classic', 'magneto'];
const DEFAULT_OWNED_BACKDROPS = ['casino_spotlight', 'magneto_storm'];
const DEFAULT_OWNED_FRAMES = ['velvet_casino', 'magneto_forge'];
const DEFAULT_OWNED_BUBBLES = ['classic', 'magneto'];
const DEFAULT_OWNED_XP_BAR_SKINS = ['classic'];

export const BAZAAR_CATALOG_ITEMS: Record<string, BazaarCatalogItemDef> = {
  // Skins oficiais compráveis (classic e magneto já iniciam liberadas)
  skin_brasileiro: {
    id: 'skin_brasileiro',
    name: 'Skin: Arlequim Brasileiro (Malandro 35mm)',
    kind: 'skin',
    targetId: 'brasileiro',
    priceCoins: 1100,
    grantedSummary: 'Skin oficial Arlequim Brasileiro desbloqueada para o seu Camarim!',
  },
  skin_terror: {
    id: 'skin_terror',
    name: 'Skin: Colecionador de Pesadelos (Slasher)',
    kind: 'skin',
    targetId: 'terror',
    priceCoins: 1350,
    grantedSummary: 'Skin oficial Colecionador de Pesadelos liberada para sua coleção!',
  },

  // Fundos / Cenários
  bg_noir_rain: {
    id: 'bg_noir_rain',
    name: 'Fundo: Beco Chuvoso Noir',
    kind: 'backdrop',
    targetId: 'noir_rain',
    priceCoins: 350,
    grantedSummary:
      'Fundo "Beco Chuvoso Noir" desbloqueado! Já disponível no Camarim da Classe para combinar com qualquer skin.',
  },
  bg_holo_vault: {
    id: 'bg_holo_vault',
    name: 'Fundo: Cofre Prisma Holo',
    kind: 'backdrop',
    targetId: 'holo_vault',
    priceCoins: 550,
    grantedSummary:
      'Fundo "Cofre Prisma Holo" desbloqueado! Já disponível no Camarim da Classe para combinar com qualquer skin.',
  },
  bg_sertanejo_dourado: {
    id: 'bg_sertanejo_dourado',
    name: 'Fundo: Sertão Dourado & Sol 35mm',
    kind: 'backdrop',
    targetId: 'sertanejo_dourado',
    priceCoins: 450,
    grantedSummary:
      'Fundo "Sertão Dourado & Sol 35mm" desbloqueado! Já disponível no Camarim da Classe para combinar com qualquer skin.',
  },
  bg_eclipse_terror: {
    id: 'bg_eclipse_terror',
    name: 'Fundo: Eclipse Sangrento & Corrente',
    kind: 'backdrop',
    targetId: 'eclipse_terror',
    priceCoins: 650,
    grantedSummary:
      'Fundo "Eclipse Sangrento & Corrente" desbloqueado! Já disponível no Camarim da Classe para combinar com qualquer skin.',
  },
  bg_clean_stage: {
    id: 'bg_clean_stage',
    name: 'Fundo: Palco Sombrio Minimalista',
    kind: 'backdrop',
    targetId: 'clean_stage',
    priceCoins: 200,
    grantedSummary:
      'Fundo "Palco Sombrio Minimalista" desbloqueado! Já disponível no Camarim da Classe para combinar com qualquer skin.',
  },

  // Molduras
  frame_noir_deco: {
    id: 'frame_noir_deco',
    name: 'Moldura: Art Déco Dourada',
    kind: 'frame',
    targetId: 'noir_deco',
    priceCoins: 300,
    grantedSummary:
      'Moldura "Art Déco Dourada" desbloqueada! Já disponível no Camarim da Classe para combinar com qualquer skin.',
  },
  frame_prism_holo: {
    id: 'frame_prism_holo',
    name: 'Moldura: Holográfica Mítica',
    kind: 'frame',
    targetId: 'prism_holo',
    priceCoins: 650,
    grantedSummary:
      'Moldura "Holográfica Mítica" desbloqueada! Já disponível no Camarim da Classe para combinar com qualquer skin.',
  },
  frame_cangaco_couro: {
    id: 'frame_cangaco_couro',
    name: 'Moldura: Couro & Sol Nordestino',
    kind: 'frame',
    targetId: 'cangaco_couro',
    priceCoins: 400,
    grantedSummary:
      'Moldura "Couro & Sol Nordestino" desbloqueada! Já disponível no Camarim da Classe para combinar com qualquer skin.',
  },
  frame_slasher_arame: {
    id: 'frame_slasher_arame',
    name: 'Moldura: Arame Farpado & Sangue',
    kind: 'frame',
    targetId: 'slasher_arame',
    priceCoins: 500,
    grantedSummary:
      'Moldura "Arame Farpado & Sangue" desbloqueada! Já disponível no Camarim da Classe para combinar com qualquer skin.',
  },

  // Balões de Fala
  bubble_brasileiro: {
    id: 'bubble_brasileiro',
    name: 'Balão: Cordel & Rádio 35mm',
    kind: 'bubble',
    targetId: 'brasileiro',
    priceCoins: 320,
    grantedSummary: 'Balão de Fala Cordel & Rádio desbloqueado!',
  },
  bubble_terror: {
    id: 'bubble_terror',
    name: 'Balão: Fita Maldita Rubra',
    kind: 'bubble',
    targetId: 'terror',
    priceCoins: 380,
    grantedSummary: 'Balão de Fala Fita Maldita Rubra desbloqueado!',
  },
  bubble_noir: {
    id: 'bubble_noir',
    name: 'Balão: Jornal Vintage 1940',
    kind: 'bubble',
    targetId: 'noir',
    priceCoins: 260,
    grantedSummary: 'Balão de Fala Jornal Vintage 1940 liberado!',
  },
  bubble_holo_prism: {
    id: 'bubble_holo_prism',
    name: 'Balão: Prisma Arco-Íris Holo',
    kind: 'bubble',
    targetId: 'holo_prism',
    priceCoins: 450,
    grantedSummary: 'Balão de Fala Prisma Holo liberado!',
  },

  // 10 Itens Mensais Reais da Guilda
  monthly_secret_draw_chip: {
    id: 'monthly_secret_draw_chip',
    name: '+1 Ficha da Sessão Secreta',
    kind: 'monthly',
    targetId: 'secret_draw_chip',
    priceCoins: 280,
    monthlyLimit: 1,
    grantedSummary: '+1 Ficha de Sorteio creditada diretamente na Sessão Secreta!',
  },
  monthly_chimera_forge: {
    id: 'monthly_chimera_forge',
    name: '+1 Ficha de Criação de Quimera',
    kind: 'monthly',
    targetId: 'chimera_forge_chip',
    priceCoins: 280,
    monthlyLimit: 1,
    grantedSummary: '+1 Ficha de Forja creditada na sua carteira da Quimera Cinéfila!',
  },
  monthly_bingo_board: {
    id: 'monthly_bingo_board',
    name: '+1 Cartela de Pergaminho 4×4',
    kind: 'monthly',
    targetId: 'bingo_forge_chip',
    priceCoins: 320,
    monthlyLimit: 1,
    grantedSummary: '+1 Ficha de Cartela creditada nos Pergaminhos da Guilda!',
  },
  monthly_secret_boomerang: {
    id: 'monthly_secret_boomerang',
    name: '+1 Bumerangue da Sessão Secreta',
    kind: 'monthly',
    targetId: 'secret_boomerang_chip',
    priceCoins: 220,
    monthlyLimit: 1,
    grantedSummary: '+1 Ficha Bumerangue adicionada à Sessão Secreta!',
  },
  monthly_chimera_decline: {
    id: 'monthly_chimera_decline',
    name: '+1 Declínio da Quimera',
    kind: 'monthly',
    targetId: 'chimera_decline_chip',
    priceCoins: 220,
    monthlyLimit: 1,
    grantedSummary: '+1 Declínio creditado na Quimera Cinéfila!',
  },
  monthly_bingo_upgrade: {
    id: 'monthly_bingo_upgrade',
    name: '+1 Sinete +Dificuldade (Pergaminho)',
    kind: 'monthly',
    targetId: 'bingo_upgrade_chip',
    priceCoins: 140,
    monthlyLimit: 3,
    grantedSummary: '+1 Sinete de Aumentar Dificuldade creditado nos Pergaminhos!',
  },
  monthly_bingo_downgrade: {
    id: 'monthly_bingo_downgrade',
    name: '+1 Sinete -Dificuldade (Pergaminho)',
    kind: 'monthly',
    targetId: 'bingo_downgrade_chip',
    priceCoins: 140,
    monthlyLimit: 3,
    grantedSummary: '+1 Sinete de Reduzir Dificuldade creditado nos Pergaminhos!',
  },
  monthly_power_secret: {
    id: 'monthly_power_secret',
    name: '+1 Carga de Poder (Sessão Secreta)',
    kind: 'monthly',
    targetId: 'power_secret_draw',
    priceCoins: 360,
    monthlyLimit: 1,
    grantedSummary: '+1 Carga de Poder de Classe creditada na Sessão Secreta!',
  },
  monthly_power_chimera: {
    id: 'monthly_power_chimera',
    name: '+1 Carga de Poder (Quimera)',
    kind: 'monthly',
    targetId: 'power_chimera',
    priceCoins: 360,
    monthlyLimit: 1,
    grantedSummary: '+1 Carga de Poder de Classe creditada na Quimera Cinéfila!',
  },
  monthly_power_bingo: {
    id: 'monthly_power_bingo',
    name: '+1 Carga de Poder (Pergaminhos)',
    kind: 'monthly',
    targetId: 'power_bingo',
    priceCoins: 360,
    monthlyLimit: 1,
    grantedSummary: '+1 Carga de Poder de Classe creditada nos Pergaminhos da Guilda!',
  },

  // Skins da Barra de XP do Topo
  xpbar_crimson_ruby: {
    id: 'xpbar_crimson_ruby',
    name: 'Barra de XP: Carmesim Rubi',
    kind: 'xp_bar',
    targetId: 'crimson_ruby',
    priceCoins: 220,
    grantedSummary: 'Skin Carmesim Rubi (Vermelha) liberada para a sua Barra de XP!',
  },
  xpbar_imperial_gold: {
    id: 'xpbar_imperial_gold',
    name: 'Barra de XP: Ouro Imperial',
    kind: 'xp_bar',
    targetId: 'imperial_gold',
    priceCoins: 280,
    grantedSummary: 'Skin Ouro Imperial (Amarela/Dourada) liberada para a sua Barra de XP!',
  },
  xpbar_violet_abyss: {
    id: 'xpbar_violet_abyss',
    name: 'Barra de XP: Abissal Violeta',
    kind: 'xp_bar',
    targetId: 'violet_abyss',
    priceCoins: 320,
    grantedSummary: 'Skin Abissal Violeta liberada para a sua Barra de XP!',
  },
  xpbar_prism_rainbow: {
    id: 'xpbar_prism_rainbow',
    name: 'Barra de XP: Espectro Arco-Íris',
    kind: 'xp_bar',
    targetId: 'prism_rainbow',
    priceCoins: 380,
    grantedSummary: 'Skin Espectro Arco-Íris Colorida liberada para a sua Barra de XP!',
  },
  xpbar_neon_rgb: {
    id: 'xpbar_neon_rgb',
    name: 'Barra de XP: Neon RGB Dinâmico',
    kind: 'xp_bar',
    targetId: 'neon_rgb',
    priceCoins: 520,
    grantedSummary: 'Skin Neon RGB Animada liberada para a sua Barra de XP!',
  },

  // Relíquias Permanentes do Bazar (Endgame)
  relic_vip_seat: {
    id: 'relic_vip_seat',
    name: 'Poltrona VIP Permanente',
    kind: 'relic',
    targetId: 'vip_seat',
    priceCoins: 1600,
    grantedSummary: 'Relíquia ativada para sempre: +1 vaga na fila da Sessão Secreta (11) e da Quimera (5)!',
  },
  relic_golden_loupe: {
    id: 'relic_golden_loupe',
    name: 'Lupa Eterna de Ouro',
    kind: 'relic',
    targetId: 'golden_loupe',
    priceCoins: 1800,
    grantedSummary: 'Relíquia ativada para sempre: +10% bônus permanente em TODO Ouro ganho no site!',
  },
  relic_house_insurance: {
    id: 'relic_house_insurance',
    name: 'Seguro da Casa',
    kind: 'relic',
    targetId: 'house_insurance',
    priceCoins: 1400,
    grantedSummary: 'Relíquia ativada: 1x por ciclo de 15 dias, devolve 1 ficha se pular mão sem pegar cartas!',
  },

  // Poderes Táticos Consumíveis
  power_secret_amulet: {
    id: 'power_secret_amulet',
    name: 'Amuleto Contra-Maldição (Escudo do Arlequim)',
    kind: 'power',
    targetId: 'secret_amulet',
    priceCoins: 180,
    grantedSummary: '+1 Amuleto Contra-Maldição guardado (protege Sessão Secreta e Tarô da Quimera)!',
  },
  power_secret_transmute: {
    id: 'power_secret_transmute',
    name: 'Selo de Transmutação (XP ↔ Ouro)',
    kind: 'power',
    targetId: 'secret_transmute',
    priceCoins: 220,
    grantedSummary: '+1 Selo de Transmutação guardado para inverter cartas da fila Secreta!',
  },
  power_secret_radar: {
    id: 'power_secret_radar',
    name: 'Radar do Croupier (Mão Antidisfarce)',
    kind: 'power',
    targetId: 'secret_radar',
    priceCoins: 160,
    grantedSummary: '+1 Radar do Croupier guardado para fazer Especiais piscarem na mesa!',
  },
  power_secret_plus2: {
    id: 'power_secret_plus2',
    name: 'Manga Cheia (+2 Cartas na Mesa)',
    kind: 'power',
    targetId: 'secret_hand_plus2',
    priceCoins: 190,
    grantedSummary: '+1 Manga Cheia (+2 cartas) pronta para armar na próxima mão Secreta!',
  },
  power_secret_plus5: {
    id: 'power_secret_plus5',
    name: 'Manga Cheia Suprema (+5 Cartas na Mesa)',
    kind: 'power',
    targetId: 'secret_hand_plus5',
    priceCoins: 340,
    grantedSummary: '+1 Manga Cheia Suprema (+5 cartas) pronta para turbinar sua próxima mesa!',
  },
  power_secret_special_storm: {
    id: 'power_secret_special_storm',
    name: 'Baralho Carregado (2 a 6 Especiais)',
    kind: 'power',
    targetId: 'secret_special_storm',
    priceCoins: 290,
    grantedSummary: '+1 Baralho Carregado (2–6 Especiais disfarçadas na próxima mão) guardado!',
  },
  power_chimera_oracle_2: {
    id: 'power_chimera_oracle_2',
    name: 'Oráculo Bis (2 Arcanos na Forja)',
    kind: 'power',
    targetId: 'chimera_oracle_2',
    priceCoins: 260,
    grantedSummary: '+1 Oráculo Bis guardado para escolher 2 Arcanos de Tarô em uma Quimera!',
  },
  power_chimera_oracle_3: {
    id: 'power_chimera_oracle_3',
    name: 'Oráculo Triplo (3 Arcanos na Forja)',
    kind: 'power',
    targetId: 'chimera_oracle_3',
    priceCoins: 420,
    grantedSummary: '+1 Oráculo Triplo guardado para escolher 3 Arcanos de Tarô em uma Quimera!',
  },
  power_chimera_tarot_reroll: {
    id: 'power_chimera_tarot_reroll',
    name: 'Novo Corte do Tarô (Re-roll de Arcanos)',
    kind: 'power',
    targetId: 'chimera_tarot_reroll',
    priceCoins: 170,
    grantedSummary: '+1 Novo Corte do Tarô guardado para reembaralhar Arcanos da mesa!',
  },
  power_chimera_invert_essence: {
    id: 'power_chimera_invert_essence',
    name: 'Alquimia Inversa (Virar XP ↔ Ouro)',
    kind: 'power',
    targetId: 'chimera_invert_essence',
    priceCoins: 240,
    grantedSummary: '+1 Alquimia Inversa guardada para inverter qualquer Quimera entre XP e Ouro!',
  },
  power_chimera_golden_jackpot: {
    id: 'power_chimera_golden_jackpot',
    name: 'Selo de Jackpot Dourado (Categoria)',
    kind: 'power',
    targetId: 'chimera_golden_jackpot',
    priceCoins: 230,
    grantedSummary: '+1 Selo de Jackpot Dourado guardado para dourar mais um fator em Ano, País ou Tag!',
  },
  power_bingo_hybrid_seal: {
    id: 'power_bingo_hybrid_seal',
    name: 'Sinete Híbrido dos Pergaminhos',
    kind: 'power',
    targetId: 'bingo_hybrid_seal',
    priceCoins: 190,
    grantedSummary: '+1 Sinete Híbrido guardado (50% XP + 50% 🪙 ou +25% 🪙 em pergaminho dourado)!',
  },
};

export interface GuildBazaarStatus {
  monthKey: string;
  nextResetMonthLabel: string;
  earnedCoins: number;
  bonusCoins: number;
  spentCoins: number;
  coinsBalance: number;
  labInfiniteMoney: boolean;
  avatarEnabled: boolean;
  ownedSkins: string[];
  ownedBackdrops: string[];
  ownedFrames: string[];
  ownedBubbles: string[];
  ownedXpBarSkins: string[];
  ownedRelics: BazaarRelicId[];
  equippedSkin: string;
  equippedBackdrop: string;
  equippedFrame: string;
  equippedBubble: string;
  equippedXpBarSkin: string;
  monthlyCounts: Record<string, number>;
  tacticalCharges: Record<string, number>;
  armedSecretFlags: SecretArmedFlags;
  houseInsuranceAvailableThisCycle: boolean;
}

let bazaarTablesEnsured = false;

export async function ensureGuildBazaarTables(): Promise<void> {
  if (bazaarTablesEnsured) return;
  const monthInfo = getSaoPauloMonthCycleInfo();
  await query(`
    CREATE TABLE IF NOT EXISTS guild_bazaar_profile (
      id INTEGER PRIMARY KEY DEFAULT 1,
      owned_skins JSONB NOT NULL DEFAULT '["classic","magneto"]'::jsonb,
      owned_backdrops JSONB NOT NULL DEFAULT '["casino_spotlight","magneto_storm"]'::jsonb,
      owned_frames JSONB NOT NULL DEFAULT '["velvet_casino","magneto_forge"]'::jsonb,
      owned_bubbles JSONB NOT NULL DEFAULT '["classic","magneto"]'::jsonb,
      owned_xp_bar_skins JSONB NOT NULL DEFAULT '["classic"]'::jsonb,
      owned_relics JSONB NOT NULL DEFAULT '[]'::jsonb,
      equipped_skin VARCHAR(40) NOT NULL DEFAULT 'magneto',
      equipped_backdrop VARCHAR(50) NOT NULL DEFAULT 'magneto_storm',
      equipped_frame VARCHAR(50) NOT NULL DEFAULT 'magneto_forge',
      equipped_bubble VARCHAR(40) NOT NULL DEFAULT 'magneto',
      equipped_xp_bar_skin VARCHAR(40) NOT NULL DEFAULT 'classic',
      avatar_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      lab_infinite_money BOOLEAN NOT NULL DEFAULT FALSE,
      spent_coins INTEGER NOT NULL DEFAULT 0,
      bonus_coins INTEGER NOT NULL DEFAULT 0,
      monthly_month_key VARCHAR(20) NOT NULL DEFAULT '${monthInfo.monthKey}',
      monthly_counts JSONB NOT NULL DEFAULT '{}'::jsonb,
      tactical_charges JSONB NOT NULL DEFAULT '{}'::jsonb,
      armed_secret_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
      insurance_cycle_key VARCHAR(32) NOT NULL DEFAULT '',
      insurance_used INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE guild_bazaar_profile
      ADD COLUMN IF NOT EXISTS owned_xp_bar_skins JSONB NOT NULL DEFAULT '["classic"]'::jsonb,
      ADD COLUMN IF NOT EXISTS owned_relics JSONB NOT NULL DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS equipped_xp_bar_skin VARCHAR(40) NOT NULL DEFAULT 'classic',
      ADD COLUMN IF NOT EXISTS tactical_charges JSONB NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS armed_secret_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS insurance_cycle_key VARCHAR(32) NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS insurance_used INTEGER NOT NULL DEFAULT 0;
  `);
  bazaarTablesEnsured = true;
}

function normalizeStringList(raw: unknown, defaults: string[]): string[] {
  const arr = Array.isArray(raw) ? raw.map((x) => String(x)) : [];
  const merged = new Set<string>([...defaults, ...arr]);
  return Array.from(merged);
}

async function ensureAndSyncBazaarRow(): Promise<{
  row: any;
  monthInfo: ReturnType<typeof getSaoPauloMonthCycleInfo>;
}> {
  await ensureGuildBazaarTables();
  const monthInfo = getSaoPauloMonthCycleInfo();
  const res = await query(`SELECT * FROM guild_bazaar_profile WHERE id = 1`);
  let row = res.rows[0];

  if (!row) {
    const ins = await query(
      `INSERT INTO guild_bazaar_profile (
         id, owned_skins, owned_backdrops, owned_frames, owned_bubbles,
         owned_xp_bar_skins, owned_relics,
         equipped_skin, equipped_backdrop, equipped_frame, equipped_bubble, equipped_xp_bar_skin,
         avatar_enabled, lab_infinite_money, spent_coins, bonus_coins,
         monthly_month_key, monthly_counts, tactical_charges, armed_secret_flags,
         insurance_cycle_key, insurance_used, updated_at
       ) VALUES (
         1, $1::jsonb, $2::jsonb, $3::jsonb, $4::jsonb,
         $5::jsonb, '[]'::jsonb,
         'magneto', 'magneto_storm', 'magneto_forge', 'magneto', 'classic',
         TRUE, FALSE, 0, 0,
         $6, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
         '', 0, CURRENT_TIMESTAMP
       )
       RETURNING *`,
      [
        JSON.stringify(DEFAULT_OWNED_SKINS),
        JSON.stringify(DEFAULT_OWNED_BACKDROPS),
        JSON.stringify(DEFAULT_OWNED_FRAMES),
        JSON.stringify(DEFAULT_OWNED_BUBBLES),
        JSON.stringify(DEFAULT_OWNED_XP_BAR_SKINS),
        monthInfo.monthKey,
      ]
    );
    row = ins.rows[0];
    return { row, monthInfo };
  }

  if (String(row.monthly_month_key || '') !== monthInfo.monthKey) {
    const upd = await query(
      `UPDATE guild_bazaar_profile
       SET monthly_month_key = $1,
           monthly_counts = '{}'::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1
       RETURNING *`,
      [monthInfo.monthKey]
    );
    row = upd.rows[0];
  }

  return { row, monthInfo };
}

async function buildStatusFromRow(
  row: any,
  monthInfo: ReturnType<typeof getSaoPauloMonthCycleInfo>
): Promise<GuildBazaarStatus> {
  // Economia real de moedas começa em 0 até definirmos todas as fontes de ganho pelo site
  const earnedCoins = 0;
  const bonusCoins = Number(row.bonus_coins || 0);
  const spentCoins = Math.max(0, Number(row.spent_coins || 0));
  const coinsBalance = Math.max(0, earnedCoins + bonusCoins - spentCoins);

  const ownedSkins = normalizeStringList(row.owned_skins, DEFAULT_OWNED_SKINS);
  const ownedBackdrops = normalizeStringList(row.owned_backdrops, DEFAULT_OWNED_BACKDROPS);
  const ownedFrames = normalizeStringList(row.owned_frames, DEFAULT_OWNED_FRAMES).filter(
    (id) => id !== 'minimal_free'
  );
  const ownedBubbles = normalizeStringList(row.owned_bubbles, DEFAULT_OWNED_BUBBLES);
  const ownedXpBarSkins = normalizeStringList(row.owned_xp_bar_skins, DEFAULT_OWNED_XP_BAR_SKINS);
  const ownedRelics: BazaarRelicId[] = Array.from(
    new Set<BazaarRelicId>(
      (Array.isArray(row.owned_relics) ? row.owned_relics : [])
        .map((r: any) => String(r) as BazaarRelicId)
        .filter((r: BazaarRelicId) => r === 'vip_seat' || r === 'golden_loupe' || r === 'house_insurance')
    )
  );

  const rawCounts = row.monthly_counts && typeof row.monthly_counts === 'object' ? row.monthly_counts : {};
  const monthlyCounts: Record<string, number> = {};
  for (const [k, v] of Object.entries(rawCounts)) {
    monthlyCounts[k] = Math.max(0, Number(v) || 0);
  }

  const rawCharges = row.tactical_charges && typeof row.tactical_charges === 'object' ? row.tactical_charges : {};
  const tacticalCharges: Record<string, number> = {};
  for (const [k, v] of Object.entries(rawCharges)) {
    tacticalCharges[k] = Math.max(0, Math.floor(Number(v) || 0));
  }

  const rawArmed = row.armed_secret_flags && typeof row.armed_secret_flags === 'object' ? row.armed_secret_flags : {};
  const armedSecretFlags: SecretArmedFlags = {
    amuletArmed: Boolean(rawArmed.amuletArmed),
    pendingExtraCards: Math.max(0, Math.floor(Number(rawArmed.pendingExtraCards) || 0)),
    pendingSpecialStorm: Boolean(rawArmed.pendingSpecialStorm),
    pendingRadar: Boolean(rawArmed.pendingRadar),
  };

  const current15DayCycle = getSaoPaulo15DayCycleInfo().cycleKey;
  const hasInsuranceRelic = ownedRelics.includes('house_insurance');
  const insuranceUsedThisCycle =
    String(row.insurance_cycle_key || '') === current15DayCycle && Number(row.insurance_used || 0) >= 1;

  return {
    monthKey: monthInfo.monthKey,
    nextResetMonthLabel: monthInfo.nextResetLabel,
    earnedCoins,
    bonusCoins,
    spentCoins,
    coinsBalance,
    labInfiniteMoney: Boolean(row.lab_infinite_money ?? false),
    avatarEnabled: Boolean(row.avatar_enabled ?? true),
    ownedSkins,
    ownedBackdrops,
    ownedFrames,
    ownedBubbles,
    ownedXpBarSkins,
    ownedRelics,
    equippedSkin: ownedSkins.includes(String(row.equipped_skin)) ? String(row.equipped_skin) : 'magneto',
    equippedBackdrop: ownedBackdrops.includes(String(row.equipped_backdrop))
      ? String(row.equipped_backdrop)
      : 'magneto_storm',
    equippedFrame: ownedFrames.includes(String(row.equipped_frame))
      ? String(row.equipped_frame)
      : 'magneto_forge',
    equippedBubble: ownedBubbles.includes(String(row.equipped_bubble))
      ? String(row.equipped_bubble)
      : 'magneto',
    equippedXpBarSkin: ownedXpBarSkins.includes(String(row.equipped_xp_bar_skin))
      ? String(row.equipped_xp_bar_skin)
      : 'classic',
    monthlyCounts,
    tacticalCharges,
    armedSecretFlags,
    houseInsuranceAvailableThisCycle: hasInsuranceRelic && !insuranceUsedThisCycle,
  };
}

export async function getGuildBazaarStatus(): Promise<GuildBazaarStatus> {
  const { row, monthInfo } = await ensureAndSyncBazaarRow();
  return buildStatusFromRow(row, monthInfo);
}

export async function grantGuildBazaarCoins(coins: number): Promise<GuildBazaarStatus> {
  const safeCoins = Math.max(0, Math.floor(Number(coins) || 0));
  const { row, monthInfo } = await ensureAndSyncBazaarRow();
  if (safeCoins <= 0) {
    return buildStatusFromRow(row, monthInfo);
  }
  const updatedRes = await query(
    `UPDATE guild_bazaar_profile
     SET bonus_coins = COALESCE(bonus_coins, 0) + $1,
         updated_at = NOW()
     WHERE id = 1
     RETURNING *`,
    [safeCoins]
  );
  return buildStatusFromRow(updatedRes.rows[0], monthInfo);
}

async function applyMonthlyRewardGrant(itemId: string): Promise<void> {
  switch (itemId) {
    case 'monthly_secret_draw_chip':
      await labAddWeeklyDrawChip(1, 'draw');
      break;
    case 'monthly_chimera_forge':
      await labAddChimeraChip(1, 'forge');
      break;
    case 'monthly_bingo_board':
      await labAddBingoChip('forge', 1);
      break;
    case 'monthly_secret_boomerang':
      await labAddWeeklyDrawChip(1, 'boomerang');
      break;
    case 'monthly_chimera_decline':
      await labAddChimeraChip(1, 'decline');
      break;
    case 'monthly_bingo_upgrade':
      await labAddBingoChip('upgrade', 1);
      break;
    case 'monthly_bingo_downgrade':
      await labAddBingoChip('downgrade', 1);
      break;
    case 'monthly_power_secret':
      await labGrantClassPowerCharge('secret_draw');
      break;
    case 'monthly_power_chimera':
      await labGrantClassPowerCharge('chimera');
      break;
    case 'monthly_power_bingo':
      await labGrantClassPowerCharge('bingo');
      break;
    default:
      throw new Error(`Item mensal desconhecido: ${itemId}`);
  }
}

export async function purchaseGuildBazaarItem(itemId: string): Promise<{
  status: GuildBazaarStatus;
  purchasedItem: BazaarCatalogItemDef;
  grantedSummary: string;
}> {
  const def = BAZAAR_CATALOG_ITEMS[String(itemId || '')];
  if (!def) {
    throw new Error('Item não encontrado no catálogo oficial do Bazar.');
  }

  const { row, monthInfo } = await ensureAndSyncBazaarRow();
  const curStatus = await buildStatusFromRow(row, monthInfo);

  if (def.kind === 'monthly') {
    const used = curStatus.monthlyCounts[def.id] || 0;
    const limit = def.monthlyLimit || 1;
    if (used >= limit) {
      throw new Error(
        `Limite mensal atingido para "${def.name}" (${used}/${limit}). Renova em ${monthInfo.nextResetLabel}.`
      );
    }
  } else if (def.kind === 'relic') {
    if (curStatus.ownedRelics.includes(def.targetId as BazaarRelicId)) {
      throw new Error(`Você já possui a relíquia permanente "${def.name}"!`);
    }
  } else if (def.kind !== 'power') {
    const ownedMap: Record<'skin' | 'backdrop' | 'frame' | 'bubble' | 'xp_bar', string[]> = {
      skin: curStatus.ownedSkins,
      backdrop: curStatus.ownedBackdrops,
      frame: curStatus.ownedFrames,
      bubble: curStatus.ownedBubbles,
      xp_bar: curStatus.ownedXpBarSkins,
    };
    if (ownedMap[def.kind].includes(def.targetId)) {
      throw new Error(`Você já possui "${def.name}" no seu Camarim!`);
    }
  }

  if (!curStatus.labInfiniteMoney && curStatus.coinsBalance < def.priceCoins) {
    throw new Error(
      `Moedas insuficientes! Você tem ${curStatus.coinsBalance} e precisa de ${def.priceCoins}.`
    );
  }

  const nextSpent = curStatus.labInfiniteMoney
    ? curStatus.spentCoins
    : curStatus.spentCoins + def.priceCoins;

  const nextSkins = [...curStatus.ownedSkins];
  const nextBackdrops = [...curStatus.ownedBackdrops];
  const nextFrames = [...curStatus.ownedFrames];
  const nextBubbles = [...curStatus.ownedBubbles];
  const nextXpBarSkins = [...curStatus.ownedXpBarSkins];
  const nextRelics = [...curStatus.ownedRelics];
  const nextMonthlyCounts = { ...curStatus.monthlyCounts };
  const nextTacticalCharges = { ...curStatus.tacticalCharges };

  if (def.kind === 'skin' && !nextSkins.includes(def.targetId)) nextSkins.push(def.targetId);
  if (def.kind === 'backdrop' && !nextBackdrops.includes(def.targetId)) {
    nextBackdrops.push(def.targetId);
  }
  if (def.kind === 'frame' && !nextFrames.includes(def.targetId)) nextFrames.push(def.targetId);
  if (def.kind === 'bubble' && !nextBubbles.includes(def.targetId)) nextBubbles.push(def.targetId);
  if (def.kind === 'xp_bar' && !nextXpBarSkins.includes(def.targetId)) {
    nextXpBarSkins.push(def.targetId);
  }
  if (def.kind === 'relic' && !nextRelics.includes(def.targetId as BazaarRelicId)) {
    nextRelics.push(def.targetId as BazaarRelicId);
  }
  if (def.kind === 'power') {
    nextTacticalCharges[def.targetId] = (nextTacticalCharges[def.targetId] || 0) + 1;
  }

  if (def.kind === 'monthly') {
    await applyMonthlyRewardGrant(def.id);
    nextMonthlyCounts[def.id] = (nextMonthlyCounts[def.id] || 0) + 1;
  }

  const upd = await query(
    `UPDATE guild_bazaar_profile
     SET owned_skins = $1::jsonb,
         owned_backdrops = $2::jsonb,
         owned_frames = $3::jsonb,
         owned_bubbles = $4::jsonb,
         owned_xp_bar_skins = $5::jsonb,
         owned_relics = $6::jsonb,
         spent_coins = $7,
         monthly_counts = $8::jsonb,
         tactical_charges = $9::jsonb,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1
     RETURNING *`,
    [
      JSON.stringify(nextSkins),
      JSON.stringify(nextBackdrops),
      JSON.stringify(nextFrames),
      JSON.stringify(nextBubbles),
      JSON.stringify(nextXpBarSkins),
      JSON.stringify(nextRelics),
      nextSpent,
      JSON.stringify(nextMonthlyCounts),
      JSON.stringify(nextTacticalCharges),
    ]
  );

  const nextStatus = await buildStatusFromRow(upd.rows[0], monthInfo);
  return {
    status: nextStatus,
    purchasedItem: def,
    grantedSummary: def.grantedSummary || `${def.name} desbloqueado com sucesso!`,
  };
}

export async function equipGuildBazaarCosmetics(params: {
  skin?: string;
  backdrop?: string;
  frame?: string;
  bubble?: string;
  xpBarSkin?: string;
}): Promise<GuildBazaarStatus> {
  const { row, monthInfo } = await ensureAndSyncBazaarRow();
  const cur = await buildStatusFromRow(row, monthInfo);

  const nextSkin =
    params.skin && cur.ownedSkins.includes(params.skin) ? params.skin : cur.equippedSkin;
  const nextBackdrop =
    params.backdrop && cur.ownedBackdrops.includes(params.backdrop)
      ? params.backdrop
      : cur.equippedBackdrop;
  const nextFrame =
    params.frame && cur.ownedFrames.includes(params.frame) ? params.frame : cur.equippedFrame;
  const nextBubble =
    params.bubble && cur.ownedBubbles.includes(params.bubble)
      ? params.bubble
      : cur.equippedBubble;
  const nextXpBarSkin =
    params.xpBarSkin && cur.ownedXpBarSkins.includes(params.xpBarSkin)
      ? params.xpBarSkin
      : cur.equippedXpBarSkin;

  const upd = await query(
    `UPDATE guild_bazaar_profile
     SET equipped_skin = $1,
         equipped_backdrop = $2,
         equipped_frame = $3,
         equipped_bubble = $4,
         equipped_xp_bar_skin = $5,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1
     RETURNING *`,
    [nextSkin, nextBackdrop, nextFrame, nextBubble, nextXpBarSkin]
  );

  return buildStatusFromRow(upd.rows[0], monthInfo);
}

export async function hasGuildRelic(relicId: BazaarRelicId): Promise<boolean> {
  const status = await getGuildBazaarStatus();
  return status.ownedRelics.includes(relicId);
}

export async function applyGoldenLoupeBonus(baseGold: number): Promise<{
  finalGold: number;
  bonusGold: number;
  applied: boolean;
}> {
  const cleanGold = Math.max(0, Math.round(Number(baseGold || 0)));
  if (cleanGold <= 0) return { finalGold: 0, bonusGold: 0, applied: false };
  const hasLoupe = await hasGuildRelic('golden_loupe');
  if (!hasLoupe) return { finalGold: cleanGold, bonusGold: 0, applied: false };
  const finalGold = Math.max(cleanGold + 1, Math.round(cleanGold * 1.1));
  return { finalGold, bonusGold: finalGold - cleanGold, applied: true };
}

export async function consumeTacticalPowerCharge(chargeKey: TacticalPowerKey): Promise<{
  remaining: number;
  status: GuildBazaarStatus;
}> {
  const { row, monthInfo } = await ensureAndSyncBazaarRow();
  const cur = await buildStatusFromRow(row, monthInfo);
  const currentCount = Math.max(0, Number(cur.tacticalCharges[chargeKey] || 0));
  if (currentCount <= 0) {
    throw new Error('Você não possui cargas deste Poder na mochila — compre no Bazar do Arlequim!');
  }
  const nextCharges = {
    ...cur.tacticalCharges,
    [chargeKey]: currentCount - 1,
  };
  const upd = await query(
    `UPDATE guild_bazaar_profile
     SET tactical_charges = $1::jsonb,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1
     RETURNING *`,
    [JSON.stringify(nextCharges)]
  );
  const status = await buildStatusFromRow(upd.rows[0], monthInfo);
  return { remaining: Math.max(0, currentCount - 1), status };
}

export async function grantTacticalPowerCharge(
  chargeKey: TacticalPowerKey,
  amount = 1
): Promise<GuildBazaarStatus> {
  const safeAmt = Math.max(1, Math.floor(Number(amount || 1)));
  const { row, monthInfo } = await ensureAndSyncBazaarRow();
  const cur = await buildStatusFromRow(row, monthInfo);
  const nextCharges = {
    ...cur.tacticalCharges,
    [chargeKey]: (cur.tacticalCharges[chargeKey] || 0) + safeAmt,
  };
  const upd = await query(
    `UPDATE guild_bazaar_profile
     SET tactical_charges = $1::jsonb,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1
     RETURNING *`,
    [JSON.stringify(nextCharges)]
  );
  return buildStatusFromRow(upd.rows[0], monthInfo);
}

export async function getSecretArmedFlags(): Promise<SecretArmedFlags> {
  const st = await getGuildBazaarStatus();
  return st.armedSecretFlags;
}

export async function updateSecretArmedFlags(patch: Partial<SecretArmedFlags>): Promise<GuildBazaarStatus> {
  const { row, monthInfo } = await ensureAndSyncBazaarRow();
  const cur = await buildStatusFromRow(row, monthInfo);
  const nextArmed: SecretArmedFlags = {
    ...cur.armedSecretFlags,
    ...patch,
  };
  const upd = await query(
    `UPDATE guild_bazaar_profile
     SET armed_secret_flags = $1::jsonb,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1
     RETURNING *`,
    [JSON.stringify(nextArmed)]
  );
  return buildStatusFromRow(upd.rows[0], monthInfo);
}

export async function tryConsumeHouseInsurance(): Promise<{
  refunded: boolean;
  status: GuildBazaarStatus;
}> {
  const { row, monthInfo } = await ensureAndSyncBazaarRow();
  const cur = await buildStatusFromRow(row, monthInfo);
  if (!cur.houseInsuranceAvailableThisCycle) {
    return { refunded: false, status: cur };
  }
  const cycleKey = getSaoPaulo15DayCycleInfo().cycleKey;
  const upd = await query(
    `UPDATE guild_bazaar_profile
     SET insurance_cycle_key = $1,
         insurance_used = 1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1
     RETURNING *`,
    [cycleKey]
  );
  const status = await buildStatusFromRow(upd.rows[0], monthInfo);
  return { refunded: true, status };
}

export async function updateGuildBazaarSettings(params: {
  avatarEnabled?: boolean;
  labInfiniteMoney?: boolean;
}): Promise<GuildBazaarStatus> {
  const { row, monthInfo } = await ensureAndSyncBazaarRow();
  const cur = await buildStatusFromRow(row, monthInfo);

  const nextAvatarEnabled =
    typeof params.avatarEnabled === 'boolean' ? params.avatarEnabled : cur.avatarEnabled;
  const nextInfiniteMoney =
    typeof params.labInfiniteMoney === 'boolean' ? params.labInfiniteMoney : cur.labInfiniteMoney;

  const upd = await query(
    `UPDATE guild_bazaar_profile
     SET avatar_enabled = $1,
         lab_infinite_money = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1
     RETURNING *`,
    [nextAvatarEnabled, nextInfiniteMoney]
  );

  return buildStatusFromRow(upd.rows[0], monthInfo);
}

export async function labResetGuildBazaar(): Promise<GuildBazaarStatus> {
  const { monthInfo } = await ensureAndSyncBazaarRow();
  const upd = await query(
    `UPDATE guild_bazaar_profile
     SET owned_skins = $1::jsonb,
         owned_backdrops = $2::jsonb,
         owned_frames = $3::jsonb,
         owned_bubbles = $4::jsonb,
         owned_xp_bar_skins = $5::jsonb,
         owned_relics = '[]'::jsonb,
         equipped_skin = 'magneto',
         equipped_backdrop = 'magneto_storm',
         equipped_frame = 'magneto_forge',
         equipped_bubble = 'magneto',
         equipped_xp_bar_skin = 'classic',
         spent_coins = 0,
         bonus_coins = 0,
         monthly_counts = '{}'::jsonb,
         tactical_charges = '{}'::jsonb,
         armed_secret_flags = '{}'::jsonb,
         insurance_cycle_key = '',
         insurance_used = 0,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1
     RETURNING *`,
    [
      JSON.stringify(DEFAULT_OWNED_SKINS),
      JSON.stringify(DEFAULT_OWNED_BACKDROPS),
      JSON.stringify(DEFAULT_OWNED_FRAMES),
      JSON.stringify(DEFAULT_OWNED_BUBBLES),
      JSON.stringify(DEFAULT_OWNED_XP_BAR_SKINS),
    ]
  );
  return buildStatusFromRow(upd.rows[0], monthInfo);
}
