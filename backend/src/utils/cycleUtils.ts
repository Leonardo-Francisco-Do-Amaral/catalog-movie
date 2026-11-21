const CYCLE_ANCHOR_UTC_MS = Date.UTC(2026, 0, 1);
const MS_PER_DAY = 86_400_000;
export const CYCLE_PERIOD_DAYS = 15;

export interface Cycle15Info {
  cycleIndex: number;
  cycleKey: string;
  nextResetLabel: string;
}

export interface MonthlyCycleInfo {
  monthIndex: number;
  monthKey: string;
  nextResetLabel: string;
}

function getSaoPauloDateParts(referenceDate = new Date()): { year: number; month: number; day: number } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [yStr, mStr, dStr] = fmt.format(referenceDate).split('-');
  return {
    year: Number(yStr),
    month: Number(mStr),
    day: Number(dStr),
  };
}

/**
 * Calcula o ciclo fixo de 15 dias no fuso America/Sao_Paulo ancorado em 01/01/2026.
 */
export function getSaoPaulo15DayCycleInfo(referenceDate = new Date()): Cycle15Info {
  const { year, month, day } = getSaoPauloDateParts(referenceDate);
  const todayUtcMs = Date.UTC(year, month - 1, day);
  const daysSinceAnchor = Math.floor((todayUtcMs - CYCLE_ANCHOR_UTC_MS) / MS_PER_DAY);
  const cycleIndex = Math.max(0, Math.floor(daysSinceAnchor / CYCLE_PERIOD_DAYS));
  const nextCycleMs = CYCLE_ANCHOR_UTC_MS + (cycleIndex + 1) * CYCLE_PERIOD_DAYS * MS_PER_DAY;
  const nextDt = new Date(nextCycleMs);
  const dd = String(nextDt.getUTCDate()).padStart(2, '0');
  const mm = String(nextDt.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = nextDt.getUTCFullYear();

  return {
    cycleIndex,
    cycleKey: `Q15-${cycleIndex}`,
    nextResetLabel: `${dd}/${mm}/${yyyy} às 00:00 (Brasília)`,
  };
}

/**
 * Calcula a chave mensal no fuso America/Sao_Paulo (ex.: M-2026-11) e próxima virada.
 */
export function getSaoPauloMonthCycleInfo(referenceDate = new Date()): MonthlyCycleInfo {
  const { year, month } = getSaoPauloDateParts(referenceDate);
  const monthIndex = year * 12 + (month - 1);
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  return {
    monthIndex,
    monthKey: `M-${year}-${String(month).padStart(2, '0')}`,
    nextResetLabel: `01/${String(nextMonth).padStart(2, '0')}/${nextYear} às 00:00 (Brasília)`,
  };
}

function parsePreviousCycleIndex(previousKey: string): number | null {
  if (previousKey.startsWith('Q15-')) {
    const idx = Number(previousKey.slice(4));
    return Number.isFinite(idx) ? idx : null;
  }
  const mMatch = previousKey.match(/^M-(\d{4})-(\d{2})$/);
  if (mMatch) {
    return Number(mMatch[1]) * 12 + (Number(mMatch[2]) - 1);
  }
  return null;
}

/**
 * Calcula o novo saldo acumulado de fichas na virada de ciclo (15 dias ou mensal), respeitando o teto máximo.
 */
export function computeCycleBankedBalance(params: {
  previousCycleKey: string | null | undefined;
  currentCycleIndex: number;
  currentCycleKey: string;
  currentBalance: number;
  allowancePerCycle: number;
  maxBankCap: number;
}): number {
  const prev = String(params.previousCycleKey || '');
  if (prev === params.currentCycleKey) {
    return Math.max(0, Number(params.currentBalance || 0));
  }
  const prevIdx = parsePreviousCycleIndex(prev);
  if (prevIdx !== null) {
    const elapsed =
      params.currentCycleIndex > prevIdx ? params.currentCycleIndex - prevIdx : 1;
    return Math.min(
      params.maxBankCap,
      Math.max(0, Number(params.currentBalance || 0)) + params.allowancePerCycle * elapsed
    );
  }
  // Primeira migração a partir do formato semanal antigo (YYYY-Wxx) ou registro inicial
  return Math.min(
    params.maxBankCap,
    Math.max(params.allowancePerCycle, Number(params.currentBalance ?? params.allowancePerCycle))
  );
}
