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
 * Contagem regressiva até a próxima recarga fixa (dia 1º ou dia 15 do mês às 00:00 em Brasília).
 */
export function getCycle15CountdownLabel(referenceDate = new Date()) {
  try {
    const { year, month, day, hour, minute } = getSaoPauloNowParts(referenceDate);
    const nowSpMs = Date.UTC(year, month - 1, day, hour, minute);
    const nextResetMs =
      day < 15
        ? Date.UTC(year, month - 1, 15, 0, 0)
        : Date.UTC(year, month, 1, 0, 0);
    const diffMin = Math.max(0, Math.floor((nextResetMs - nowSpMs) / 60000));
    return formatCountdown(diffMin, '⏳ Recarga de ciclo em instantes!', 'para a próxima recarga');
  } catch {
    return null;
  }
}

const MONTH_NAMES_FULL = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const MONTH_NAMES_SHORT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

/**
 * Converte chaves internas de ciclo (H-YYYY-MM-half / M-YYYY-MM / Q15-N) em rótulos legíveis em português.
 */
export function formatCycleKeyLabel(rawKey, { short = false, fallback = '' } = {}) {
  const clean = String(rawKey || '').trim();
  if (!clean) return fallback;

  const halfMatch = clean.match(/^H-(\d{4})-(\d{2})-(1|2)$/);
  if (halfMatch) {
    const year = halfMatch[1];
    const mIdx = Math.max(0, Math.min(11, Number(halfMatch[2]) - 1));
    const monthName = (short ? MONTH_NAMES_SHORT : MONTH_NAMES_FULL)[mIdx] || halfMatch[2];
    const halfLabel = halfMatch[3] === '1' ? '1ª Quinzena' : '2ª Quinzena';
    return short ? `${halfLabel} • ${monthName}/${year}` : `${halfLabel} de ${monthName}/${year}`;
  }

  const monthMatch = clean.match(/^M-(\d{4})-(\d{2})$/);
  if (monthMatch) {
    const year = monthMatch[1];
    const mIdx = Math.max(0, Math.min(11, Number(monthMatch[2]) - 1));
    const monthName = (short ? MONTH_NAMES_SHORT : MONTH_NAMES_FULL)[mIdx] || monthMatch[2];
    return `${monthName}/${year}`;
  }

  const q15Match = clean.match(/^Q15-(\d+)$/);
  if (q15Match) {
    return `Ciclo #${q15Match[1]}`;
  }

  return clean;
}
