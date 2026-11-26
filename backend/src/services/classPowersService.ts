import { query } from '../config/database';
import {
  CYCLE_PERIOD_DAYS,
  getSaoPaulo15DayCycleInfo,
  getSaoPauloMonthCycleInfo,
  computeCycleBankedBalance,
} from '../utils/cycleUtils';

export type ClassPowerMode = 'secret_draw' | 'chimera' | 'bingo';

export interface SecretDrawPowerBuff {
  classId: string;
  powerTitle: string;
  forceCardCount?: number;
  minDifficulty?: 'common' | 'medium' | 'hard' | 'very_hard' | 'exotic';
  filterMaxRuntime?: number;
  prioritizeUnconqueredYears?: boolean;
  revealMilestonesXray?: boolean;
  xrayUnconqueredYearsOnly?: boolean;
  revealYearRuntime?: boolean;
  allowExtraActivePick?: boolean;
  bonusNextPickXp?: number;
}

export interface ClassPowerWalletStatus {
  cycle15Key: string;
  nextReset15Label: string;
  cycleDays: number;
  monthKey: string;
  nextResetMonthLabel: string;
  secretCharges: number;
  maxSecretCharges: number;
  chimeraCharges: number;
  maxChimeraCharges: number;
  bingoCharges: number;
  maxBingoCharges: number;
  secretBuff: SecretDrawPowerBuff | null;
}

export const SECRET_POWER_ALLOWANCE = 1;
export const SECRET_POWER_MAX_BANK = 2;
export const CHIMERA_POWER_ALLOWANCE = 1;
export const CHIMERA_POWER_MAX_BANK = 2;
export const BINGO_POWER_ALLOWANCE = 1;
export const BINGO_POWER_MAX_BANK = 2;

let powerTablesEnsured = false;

export async function ensureClassPowerTables(): Promise<void> {
  if (powerTablesEnsured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS guild_class_powers_wallet (
      id INTEGER PRIMARY KEY DEFAULT 1,
      cycle_15d_key VARCHAR(20) NOT NULL,
      month_key VARCHAR(20) NOT NULL,
      secret_charges INTEGER NOT NULL DEFAULT 1,
      chimera_charges INTEGER NOT NULL DEFAULT 1,
      bingo_charges INTEGER NOT NULL DEFAULT 1,
      secret_buff_json JSONB NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  powerTablesEnsured = true;
}

function mapWalletRow(
  row: any,
  info15: ReturnType<typeof getSaoPaulo15DayCycleInfo>,
  infoMonth: ReturnType<typeof getSaoPauloMonthCycleInfo>
): ClassPowerWalletStatus {
  return {
    cycle15Key: String(row.cycle_15d_key || info15.cycleKey),
    nextReset15Label: info15.nextResetLabel,
    cycleDays: CYCLE_PERIOD_DAYS,
    monthKey: String(row.month_key || infoMonth.monthKey),
    nextResetMonthLabel: infoMonth.nextResetLabel,
    secretCharges: Math.max(0, Number(row.secret_charges ?? SECRET_POWER_ALLOWANCE)),
    maxSecretCharges: SECRET_POWER_MAX_BANK,
    chimeraCharges: Math.max(0, Number(row.chimera_charges ?? CHIMERA_POWER_ALLOWANCE)),
    maxChimeraCharges: CHIMERA_POWER_MAX_BANK,
    bingoCharges: Math.max(0, Number(row.bingo_charges ?? BINGO_POWER_ALLOWANCE)),
    maxBingoCharges: BINGO_POWER_MAX_BANK,
    secretBuff: row.secret_buff_json || null,
  };
}

export async function getClassPowerWalletStatus(): Promise<ClassPowerWalletStatus> {
  await ensureClassPowerTables();
  const info15 = getSaoPaulo15DayCycleInfo();
  const infoMonth = getSaoPauloMonthCycleInfo();

  const curRes = await query(`SELECT * FROM guild_class_powers_wallet WHERE id = 1`);
  const row = curRes.rows[0];

  const needs15dUpdate = !row || String(row.cycle_15d_key) !== info15.cycleKey;
  const needsMonthUpdate = !row || String(row.month_key) !== infoMonth.monthKey;

  if (needs15dUpdate || needsMonthUpdate) {
    const nextSecret = needs15dUpdate
      ? row
        ? computeCycleBankedBalance({
            previousCycleKey: row.cycle_15d_key,
            currentCycleIndex: info15.cycleIndex,
            currentCycleKey: info15.cycleKey,
            currentBalance: Number(row.secret_charges ?? 0),
            allowancePerCycle: SECRET_POWER_ALLOWANCE,
            maxBankCap: SECRET_POWER_MAX_BANK,
          })
        : SECRET_POWER_ALLOWANCE
      : Number(row.secret_charges ?? SECRET_POWER_ALLOWANCE);

    const nextChimera = needs15dUpdate
      ? row
        ? computeCycleBankedBalance({
            previousCycleKey: row.cycle_15d_key,
            currentCycleIndex: info15.cycleIndex,
            currentCycleKey: info15.cycleKey,
            currentBalance: Number(row.chimera_charges ?? 0),
            allowancePerCycle: CHIMERA_POWER_ALLOWANCE,
            maxBankCap: CHIMERA_POWER_MAX_BANK,
          })
        : CHIMERA_POWER_ALLOWANCE
      : Number(row.chimera_charges ?? CHIMERA_POWER_ALLOWANCE);

    const nextBingo = needsMonthUpdate
      ? row
        ? computeCycleBankedBalance({
            previousCycleKey: row.month_key,
            currentCycleIndex: infoMonth.monthIndex,
            currentCycleKey: infoMonth.monthKey,
            currentBalance: Number(row.bingo_charges ?? 0),
            allowancePerCycle: BINGO_POWER_ALLOWANCE,
            maxBankCap: BINGO_POWER_MAX_BANK,
          })
        : BINGO_POWER_ALLOWANCE
      : Number(row.bingo_charges ?? BINGO_POWER_ALLOWANCE);

    const upd = await query(
      `INSERT INTO guild_class_powers_wallet (
         id, cycle_15d_key, month_key, secret_charges, chimera_charges, bingo_charges, secret_buff_json, updated_at
       )
       VALUES (1, $1, $2, $3, $4, $5, $6::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         cycle_15d_key = EXCLUDED.cycle_15d_key,
         month_key = EXCLUDED.month_key,
         secret_charges = EXCLUDED.secret_charges,
         chimera_charges = EXCLUDED.chimera_charges,
         bingo_charges = EXCLUDED.bingo_charges,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        info15.cycleKey,
        infoMonth.monthKey,
        nextSecret,
        nextChimera,
        nextBingo,
        row?.secret_buff_json ? JSON.stringify(row.secret_buff_json) : null,
      ]
    );
    return mapWalletRow(upd.rows[0], info15, infoMonth);
  }

  return mapWalletRow(row, info15, infoMonth);
}

export async function assertClassPowerChargeAvailable(mode: ClassPowerMode): Promise<ClassPowerWalletStatus> {
  const wallet = await getClassPowerWalletStatus();
  if (mode === 'secret_draw' && wallet.secretCharges <= 0) {
    throw new Error(
      `Sua carga de Poder da Sessão Secreta acabou (1 nos dias 1 e 15 do mês, máx. ${wallet.maxSecretCharges}). Recarga: ${wallet.nextReset15Label}.`
    );
  }
  if (mode === 'chimera' && wallet.chimeraCharges <= 0) {
    throw new Error(
      `Sua carga de Poder da Quimera acabou (1 nos dias 1 e 15 do mês, máx. ${wallet.maxChimeraCharges}). Recarga: ${wallet.nextReset15Label}.`
    );
  }
  if (mode === 'bingo' && wallet.bingoCharges <= 0) {
    throw new Error(
      `Sua carga de Poder dos Pergaminhos acabou (1 por mês, máx. ${wallet.maxBingoCharges}). Recarga: ${wallet.nextResetMonthLabel}.`
    );
  }
  return wallet;
}

export async function consumeClassPowerCharge(mode: ClassPowerMode): Promise<ClassPowerWalletStatus> {
  await ensureClassPowerTables();
  const col =
    mode === 'secret_draw'
      ? 'secret_charges'
      : mode === 'chimera'
        ? 'chimera_charges'
        : 'bingo_charges';
  await query(
    `UPDATE guild_class_powers_wallet
     SET ${col} = GREATEST(0, ${col} - 1),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`
  );
  return getClassPowerWalletStatus();
}

export async function getSecretDrawPowerBuff(): Promise<SecretDrawPowerBuff | null> {
  const w = await getClassPowerWalletStatus();
  return w.secretBuff;
}

export async function setSecretDrawPowerBuff(
  buff: SecretDrawPowerBuff | null
): Promise<ClassPowerWalletStatus> {
  await getClassPowerWalletStatus();
  await query(
    `UPDATE guild_class_powers_wallet
     SET secret_buff_json = $1::jsonb,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`,
    [buff ? JSON.stringify(buff) : null]
  );
  return getClassPowerWalletStatus();
}

export async function labGrantClassPowerCharge(
  mode: ClassPowerMode | 'all' = 'all'
): Promise<ClassPowerWalletStatus> {
  await getClassPowerWalletStatus();
  if (mode === 'all') {
    await query(
      `UPDATE guild_class_powers_wallet
       SET secret_charges = secret_charges + 1,
           chimera_charges = chimera_charges + 1,
           bingo_charges = bingo_charges + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`
    );
  } else {
    const col =
      mode === 'secret_draw'
        ? 'secret_charges'
        : mode === 'chimera'
          ? 'chimera_charges'
          : 'bingo_charges';
    await query(
      `UPDATE guild_class_powers_wallet
       SET ${col} = ${col} + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`
    );
  }
  return getClassPowerWalletStatus();
}
