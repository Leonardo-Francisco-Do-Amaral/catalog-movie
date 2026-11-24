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

function getHalfMonthInfoFromParts(year: number, month: number, day: number): Cycle15Info {
  const isSecondHalf = day >= 15;
  const half = isSecondHalf ? 2 : 1;
  const cycleIndex = (year * 12 + (month - 1)) * 2 + (isSecondHalf ? 1 : 0);
  const mm = String(month).padStart(2, '0');

  let nextResetLabel: string;
  if (!isSecondHalf) {
    nextResetLabel = `15/${mm}/${year} às 00:00 (Brasília)`;
  } else {
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    nextResetLabel = `01/${String(nextMonth).padStart(2, '0')}/${nextYear} às 00:00 (Brasília)`;
  }

  return {
    cycleIndex,
    cycleKey: `H-${year}-${mm}-${half}`,
    nextResetLabel,
  };
}

/**
 * Calcula o ciclo quinzenal fixo no fuso America/Sao_Paulo com viradas no dia 1 e no dia 15 de cada mês.
 */
export function getSaoPaulo15DayCycleInfo(referenceDate = new Date()): Cycle15Info {
  const { year, month, day } = getSaoPauloDateParts(referenceDate);
  return getHalfMonthInfoFromParts(year, month, day);
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
  const hMatch = previousKey.match(/^H-(\d{4})-(\d{2})-(1|2)$/);
  if (hMatch) {
    const year = Number(hMatch[1]);
    const month = Number(hMatch[2]);
    const isSecondHalf = hMatch[3] === '2';
    return (year * 12 + (month - 1)) * 2 + (isSecondHalf ? 1 : 0);
  }
  if (previousKey.startsWith('Q15-')) {
    const idx = Number(previousKey.slice(4));
    if (!Number.isFinite(idx) || idx < 0) return null;
    // Converte o formato legado Q15-N para o ciclo dia 1 / dia 15 correspondente ao fim daquela janela
    const periodEndDt = new Date(CYCLE_ANCHOR_UTC_MS + (idx * 15 + 14) * MS_PER_DAY);
    return getHalfMonthInfoFromParts(
      periodEndDt.getUTCFullYear(),
      periodEndDt.getUTCMonth() + 1,
      periodEndDt.getUTCDate()
    ).cycleIndex;
  }
  const mMatch = previousKey.match(/^M-(\d{4})-(\d{2})$/);
  if (mMatch) {
    return Number(mMatch[1]) * 12 + (Number(mMatch[2]) - 1);
  }
  return null;
}

export function formatCycleKeyLabel(rawKey: string | null | undefined, short = false): string {
  const clean = String(rawKey || '').trim();
  if (!clean) return 'Temporada Atual';
  const monthsFull = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  const monthsShort = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];
  const names = short ? monthsShort : monthsFull;

  const hMatch = clean.match(/^H-(\d{4})-(\d{2})-(1|2)$/);
  if (hMatch) {
    const mIdx = Math.max(0, Math.min(11, Number(hMatch[2]) - 1));
    const halfLabel = hMatch[3] === '1' ? '1ª Quinzena' : '2ª Quinzena';
    return short ? `${halfLabel} • ${names[mIdx]}/${hMatch[1]}` : `${halfLabel} de ${names[mIdx]}/${hMatch[1]}`;
  }
  const mMatch = clean.match(/^M-(\d{4})-(\d{2})$/);
  if (mMatch) {
    const mIdx = Math.max(0, Math.min(11, Number(mMatch[2]) - 1));
    return `${names[mIdx]}/${mMatch[1]}`;
  }
  return clean;
}

/**
 * Calcula o novo saldo acumulado de fichas na virada de ciclo (dias 1/15 ou mensal), respeitando o teto máximo.
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
  const curBal = Math.max(0, Number(params.currentBalance || 0));
  if (prev === params.currentCycleKey) {
    return curBal;
  }
  const prevIdx = parsePreviousCycleIndex(prev);
  if (prevIdx !== null) {
    const elapsed = Math.max(0, params.currentCycleIndex - prevIdx);
    if (elapsed === 0) {
      return Math.min(params.maxBankCap, curBal);
    }
    return Math.min(
      params.maxBankCap,
      curBal + params.allowancePerCycle * elapsed
    );
  }
  // Primeira migração a partir de formato semanal antigo (YYYY-Wxx) ou registro inicial
  return Math.min(
    params.maxBankCap,
    Math.max(params.allowancePerCycle, Number(params.currentBalance ?? params.allowancePerCycle))
  );
}
