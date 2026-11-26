import { isAudioMuted } from './trophyAudio';

let harlequinAudioCtx = null;

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!harlequinAudioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      harlequinAudioCtx = new AudioContextClass();
    }
  }
  if (harlequinAudioCtx && harlequinAudioCtx.state === 'suspended') {
    harlequinAudioCtx.resume().catch(() => {});
  }
  return harlequinAudioCtx;
}

const SKIN_VOICE_PROFILE = {
  classic: {
    wave: 'triangle',
    baseHz: 560,
    scale: [0, 2, 4, 7, 9, 12],
    bellHz: 1180,
    decay: 0.055,
  },
  arquimago: {
    wave: 'sine',
    baseHz: 660,
    scale: [0, 4, 7, 11, 12, 14],
    bellHz: 1480,
    decay: 0.065,
  },
  magneto: {
    wave: 'sawtooth',
    baseHz: 250,
    scale: [0, 3, 5, 7, 10, 12],
    bellHz: 620,
    decay: 0.06,
  },
  brasileiro: {
    wave: 'triangle',
    baseHz: 490,
    scale: [0, 4, 5, 7, 9, 12, 14],
    bellHz: 1080,
    decay: 0.055,
  },
  terror: {
    wave: 'sawtooth',
    baseHz: 195,
    scale: [0, 1, 3, 6, 7, 10],
    bellHz: 440,
    decay: 0.075,
  },
};

function semitoneToHz(baseHz, semitones) {
  return baseHz * Math.pow(2, semitones / 12);
}

/**
 * Toca o estalo da carta + tilintar característico de sininho estilo Balatro ao clicar no Arlequim.
 */
export function playHarlequinCardTapSound(skinId = 'classic', mood = 'neutral', localMuted = false) {
  if (localMuted || isAudioMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const profile = SKIN_VOICE_PROFILE[skinId] || SKIN_VOICE_PROFILE.classic;

  // 1. Clique tátil da carta (thock curto)
  const tapOsc = ctx.createOscillator();
  const tapGain = ctx.createGain();
  tapOsc.type = 'triangle';
  tapOsc.frequency.setValueAtTime(190, now);
  tapOsc.frequency.exponentialRampToValueAtTime(75, now + 0.055);
  tapGain.gain.setValueAtTime(0.16, now);
  tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
  tapOsc.connect(tapGain);
  tapGain.connect(ctx.destination);
  tapOsc.start(now);
  tapOsc.stop(now + 0.07);

  // 2. Sininho / acorde de humor (2 notas rápidas)
  const moodOffsets =
    mood === 'sad' || mood === 'dice_1'
      ? [0, -3]
      : mood === 'curse'
        ? [0, -6]
        : [0, 4];

  moodOffsets.forEach((semi, idx) => {
    const startAt = now + 0.025 + idx * 0.055;
    const bellOsc = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(semitoneToHz(profile.bellHz, semi), startAt);
    bellGain.gain.setValueAtTime(0.075, startAt);
    bellGain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.16);
    bellOsc.connect(bellGain);
    bellGain.connect(ctx.destination);
    bellOsc.start(startAt);
    bellOsc.stop(startAt + 0.17);
  });
}

/**
 * Toca uma sílaba melódica estilo voz do Jimbo (Balatro) sincronizada com a digitação das letras.
 */
export function playHarlequinVoiceBlip(
  skinId = 'classic',
  stepIdx = 0,
  mood = 'neutral',
  localMuted = false
) {
  if (localMuted || isAudioMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const profile = SKIN_VOICE_PROFILE[skinId] || SKIN_VOICE_PROFILE.classic;

  const scaleIdx = (stepIdx * 5 + Math.floor(Math.random() * 3)) % profile.scale.length;
  let semitone = profile.scale[scaleIdx];
  if (mood === 'sad' || mood === 'dice_1') semitone -= 4;
  if (mood === 'curse') semitone -= 6;
  if (mood === 'happy' || mood === 'jackpot_20') semitone += 2;

  const freq = semitoneToHz(profile.baseHz, semitone) * (0.97 + Math.random() * 0.06);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = profile.wave;
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.04, now + 0.032);

  const peakVol = skinId === 'magneto' ? 0.038 : 0.052;
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(peakVol, now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.001, now + profile.decay);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + profile.decay + 0.01);
}

/**
 * Impacto sonoro rápido ao disparar o Cut-In estilo anime/RPG.
 */
export function playHarlequinCutInSound(skinId = 'classic', triggerId = 'jackpot_20', localMuted = false) {
  if (localMuted || isAudioMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const profile = SKIN_VOICE_PROFILE[skinId] || SKIN_VOICE_PROFILE.classic;
  const isNegative = triggerId === 'dice_1' || triggerId === 'curse';
  const notes = isNegative ? [0, -3, -6] : [0, 4, 7, 12];

  notes.forEach((semi, i) => {
    const t = now + i * 0.055;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isNegative ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(semitoneToHz(profile.baseHz * 1.15, semi), t);
    gain.gain.setValueAtTime(isNegative ? 0.065 : 0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.26);
  });
}

/**
 * Som tátil de moedas caindo no balcão + batida do carimbo de cera na compra RPG.
 */
export function playShopCoinSound(localMuted = false) {
  if (localMuted || isAudioMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Batida grave do carimbo/balcão (110Hz -> 48Hz)
  const stampOsc = ctx.createOscillator();
  const stampGain = ctx.createGain();
  stampOsc.type = 'triangle';
  stampOsc.frequency.setValueAtTime(110, now);
  stampOsc.frequency.exponentialRampToValueAtTime(48, now + 0.085);
  stampGain.gain.setValueAtTime(0.18, now);
  stampGain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
  stampOsc.connect(stampGain);
  stampGain.connect(ctx.destination);
  stampOsc.start(now);
  stampOsc.stop(now + 0.1);

  // 2. Duas moedas metálicas agudas (1318Hz -> 1760Hz)
  [1318, 1760].forEach((freq, idx) => {
    const startAt = now + 0.03 + idx * 0.075;
    const coinOsc = ctx.createOscillator();
    const coinGain = ctx.createGain();
    coinOsc.type = 'sine';
    coinOsc.frequency.setValueAtTime(freq, startAt);
    coinGain.gain.setValueAtTime(0.095, startAt);
    coinGain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.24);
    coinOsc.connect(coinGain);
    coinGain.connect(ctx.destination);
    coinOsc.start(startAt);
    coinOsc.stop(startAt + 0.25);
  });
}

/**
 * Som mecânico rápido de alavanca / embaralhamento de fichas no Reroll da loja RPG.
 */
export function playShopRerollSound(localMuted = false) {
  if (localMuted || isAudioMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const clicks = [420, 560, 720, 960];

  clicks.forEach((freq, idx) => {
    const startAt = now + idx * 0.045;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startAt);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.18, startAt + 0.032);
    gain.gain.setValueAtTime(0.085, startAt);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.055);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + 0.06);
  });
}

/**
 * Fanfarra triunfal com moedas e impacto para a animação épica de compra no Bazar RPG.
 */
export function playShopPurchaseFanfare(rarity = 'epic', localMuted = false) {
  if (localMuted || isAudioMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Impacto grave de carimbo na mesa
  const thud = ctx.createOscillator();
  const thudGain = ctx.createGain();
  thud.type = 'triangle';
  thud.frequency.setValueAtTime(135, now);
  thud.frequency.exponentialRampToValueAtTime(46, now + 0.14);
  thudGain.gain.setValueAtTime(0.22, now);
  thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
  thud.connect(thudGain);
  thudGain.connect(ctx.destination);
  thud.start(now);
  thud.stop(now + 0.17);

  // Arpejo ascendente conforme raridade
  const notes =
    rarity === 'mythic'
      ? [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98]
      : rarity === 'legendary'
      ? [523.25, 659.25, 783.99, 1046.5, 1318.5]
      : [493.88, 659.25, 783.99, 1046.5];

  notes.forEach((freq, idx) => {
    const startAt = now + 0.04 + idx * 0.075;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = idx === notes.length - 1 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, startAt);
    gain.gain.setValueAtTime(0.095, startAt);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + (idx === notes.length - 1 ? 0.55 : 0.24));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + 0.58);
  });
}
