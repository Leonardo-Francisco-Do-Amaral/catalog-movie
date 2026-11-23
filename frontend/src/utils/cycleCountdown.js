const CYCLE_ANCHOR_UTC_MS = Date.UTC(2026, 0, 1);
const MS_PER_DAY = 86_400_000;
const CYCLE_PERIOD_DAYS = 15;

function getSaoPauloNowParts(referenceDate = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(referenceDate);
  const map = {};
  for (const p of parts) {
    map[p.type] = Number(p.value);
  }
  const hour = map.hour === 24 ? 0 : map.hour;
  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour,
    minute: map.minute,
  };
}

function formatCountdown(diffMin, immediateText, suffixText) {
  if (diffMin <= 0) return immediateText;
  const days = Math.floor(diffMin / (60 * 24));
  const hours = Math.floor((diffMin % (60 * 24)) / 60);
  if (days >= 1) return `⏳ Faltam ${days}d ${hours}h ${suffixText}`;
  if (hours >= 1) return `⏳ Faltam ${hours}h ${diffMin % 60}m ${suffixText}`;
  return immediateText;
}

/**
 * Contagem regressiva até o dia 1º do próximo mês às 00:00 no horário de Brasília.
 */
export function getNextMonthCountdownLabel(referenceDate = new Date()) {
  try {
    const { year, month, day, hour, minute } = getSaoPauloNowParts(referenceDate);
    const nowSpMs = Date.UTC(year, month - 1, day, hour, minute);
    const nextMonthSpMs = Date.UTC(year, month, 1, 0, 0);
    const diffMin = Math.max(0, Math.floor((nextMonthSpMs - nowSpMs) / 60000));
    return formatCountdown(diffMin, '⏳ Virada do mês em instantes!', 'para o próximo ciclo');
  } catch {
    return null;
  }
}

/**
 * Contagem regressiva até a próxima virada do ciclo fixo de 15 dias em Brasília.
 */
export function getCycle15CountdownLabel(referenceDate = new Date()) {
  try {
    const { year, month, day, hour, minute } = getSaoPauloNowParts(referenceDate);
    const todayUtcMs = Date.UTC(year, month - 1, day);
    const nowSpMs = Date.UTC(year, month - 1, day, hour, minute);
    const daysSinceAnchor = Math.floor((todayUtcMs - CYCLE_ANCHOR_UTC_MS) / MS_PER_DAY);
    const cycleIndex = Math.max(0, Math.floor(daysSinceAnchor / CYCLE_PERIOD_DAYS));
    const nextCycleMs = CYCLE_ANCHOR_UTC_MS + (cycleIndex + 1) * CYCLE_PERIOD_DAYS * MS_PER_DAY;
    const diffMin = Math.max(0, Math.floor((nextCycleMs - nowSpMs) / 60000));
    return formatCountdown(diffMin, '⏳ Recarga de ciclo em instantes!', 'para a próxima recarga');
  } catch {
    return null;
  }
}
