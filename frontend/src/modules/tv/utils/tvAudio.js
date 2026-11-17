let audioCtx = null;

function getCtx() {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq, startTime, duration, type = 'sine', gainPeak = 0.08) {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainPeak, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.03);
}

/**
 * Som de carregamento de Ki / Gacha Pack abrindo (sweep + acorde cristalino Anime).
 */
export function playTvGachaPackSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Sweep ascendente de invocação
  const sweepOsc = ctx.createOscillator();
  const sweepGain = ctx.createGain();
  sweepOsc.type = 'triangle';
  sweepOsc.frequency.setValueAtTime(180, now);
  sweepOsc.frequency.exponentialRampToValueAtTime(880, now + 1.15);
  sweepGain.gain.setValueAtTime(0.001, now);
  sweepGain.gain.linearRampToValueAtTime(0.06, now + 0.9);
  sweepGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);
  sweepOsc.connect(sweepGain);
  sweepGain.connect(ctx.destination);
  sweepOsc.start(now);
  sweepOsc.stop(now + 1.3);

  // Acorde "Plin!" brilhante no momento da revelação (1.3s)
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  notes.forEach((f, idx) => {
    playTone(f, now + 1.25 + idx * 0.045, 0.55, 'sine', 0.075);
  });
}

/**
 * Som específico por raridade desbloqueada.
 */
export function playTvRarityRevealSound(tierKey = 'common') {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  const chordMap = {
    common: [440, 554.37, 659.25],
    uncommon: [493.88, 622.25, 739.99],
    rare: [523.25, 659.25, 783.99, 1046.5],
    super_rare: [587.33, 739.99, 880, 1174.66],
    legendary: [659.25, 830.61, 987.77, 1318.51, 1567.98],
    mythic: [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0],
  };
  const freqs = chordMap[tierKey] || chordMap.common;
  freqs.forEach((f, i) => {
    playTone(f, now + i * 0.055, 0.45, i % 2 === 0 ? 'triangle' : 'sine', 0.07);
  });
}

/**
 * Tick estilo Visual Novel / RPG ao revelar textos do dossiê/pacote.
 */
export function playTvTypeTickSound() {
  const ctx = getCtx();
  if (!ctx) return;
  playTone(760 + Math.random() * 110, ctx.currentTime, 0.03, 'sine', 0.025);
}

/**
 * Som satisfatório de figurinha colada no álbum.
 */
export function playTvStickerPasteSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(392.0, now, 0.08, 'triangle', 0.06);
  playTone(587.33, now + 0.06, 0.14, 'sine', 0.075);
  playTone(880.0, now + 0.12, 0.3, 'sine', 0.065);
}

/**
 * Som de escrita caligráfica Sumi-e (assinatura em 100%).
 */
export function playTvSignatureSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  [659.25, 783.99, 987.77, 1318.51].forEach((f, i) => {
    playTone(f, now + i * 0.07, 0.32, 'sine', 0.05);
  });
}
