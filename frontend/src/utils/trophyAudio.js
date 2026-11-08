/**
 * Motor de Áudio Web Audio API para Troféus e Conquistas (Estilo PS5)
 * Gera efeitos sonoros sintéticos em tempo real sem depender de arquivos .mp3 externos.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

const STORAGE_KEY_MUTED = 'cinecatalog_trophy_muted';

export function isAudioMuted() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY_MUTED) === 'true';
}

export function setAudioMuted(muted) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MUTED, muted ? 'true' : 'false');
}

export function toggleAudioMute() {
  const current = isAudioMuted();
  setAudioMuted(!current);
  return !current;
}

/**
 * Toca o efeito sonoro de acordo com o Tier da conquista:
 * - bronze: Clique metálico rápido e nítido.
 * - silver: Chime duplo cristalino.
 * - epic: Efeito de sintetizador/energia crescente.
 * - gold: Fanfarra orquestral triunfal encorpada.
 * - mythic: Acorde místico grave com eco e impacto celestial.
 * - platinum: Fanfarra épica máxima completa estilo PS5.
 */
export function playTrophySound(tier = 'bronze') {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const tierKey = String(tier || 'bronze').toLowerCase();

    switch (tierKey) {
      case 'bronze': {
        // Bronze: Clique metálico rápido e nítido com ressonância metálica
        const osc = ctx.createOscillator();
        const metalOsc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.16);

        metalOsc.type = 'sine';
        metalOsc.frequency.setValueAtTime(2450, now);
        metalOsc.frequency.exponentialRampToValueAtTime(800, now + 0.12);

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(400, now);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(filter);
        metalOsc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        metalOsc.start(now);
        osc.stop(now + 0.24);
        metalOsc.stop(now + 0.24);
        break;
      }

      case 'silver':
      case 'prata': {
        // Prata: Chime duplo cristalino (duas notas brilhantes com cauda suave)
        const notes = [
          { freq: 1760, time: 0.0, dur: 0.5 }, // A6
          { freq: 2349.32, time: 0.12, dur: 0.75 } // D7
        ];

        notes.forEach(({ freq, time, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + time);

          gain.gain.setValueAtTime(0.001, now + time);
          gain.gain.linearRampToValueAtTime(0.28, now + time + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + time);
          osc.stop(now + time + dur + 0.05);
        });
        break;
      }

      case 'epic':
      case 'épico':
      case 'epico': {
        // Épico: Efeito de sintetizador com sweep de energia crescente e ressonância espacial
        const osc = ctx.createOscillator();
        const oscSub = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(1380, now + 0.65);

        oscSub.type = 'triangle';
        oscSub.frequency.setValueAtTime(160, now);
        oscSub.frequency.exponentialRampToValueAtTime(690, now + 0.65);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(2200, now + 0.65);
        filter.Q.setValueAtTime(4.5, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

        osc.connect(filter);
        oscSub.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        oscSub.start(now);
        osc.stop(now + 1.15);
        oscSub.stop(now + 1.15);
        break;
      }

      case 'gold':
      case 'ouro': {
        // Ouro: Fanfarra orquestral triunfal encorpada (Acorde triunfal C-E-G-C)
        const notes = [
          { freq: 523.25, time: 0.0, dur: 0.25 }, // C5
          { freq: 659.25, time: 0.14, dur: 0.25 }, // E5
          { freq: 783.99, time: 0.28, dur: 0.3 }, // G5
          { freq: 1046.5, time: 0.44, dur: 0.95 }, // C6 (sustentado)
          { freq: 1318.51, time: 0.44, dur: 0.95 } // E6 harmônico
        ];

        notes.forEach(({ freq, time, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + time);

          gain.gain.setValueAtTime(0.001, now + time);
          gain.gain.linearRampToValueAtTime(0.25, now + time + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + time);
          osc.stop(now + time + dur + 0.05);
        });
        break;
      }

      case 'mythic':
      case 'mítico':
      case 'mitico': {
        // Mítico: Acorde místico grave com eco e impacto celestial
        // Sub-bass boom
        const boomOsc = ctx.createOscillator();
        const boomGain = ctx.createGain();
        boomOsc.type = 'sine';
        boomOsc.frequency.setValueAtTime(85, now);
        boomOsc.frequency.exponentialRampToValueAtTime(35, now + 0.7);
        boomGain.gain.setValueAtTime(0.4, now);
        boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        boomOsc.connect(boomGain);
        boomGain.connect(ctx.destination);
        boomOsc.start(now);
        boomOsc.stop(now + 0.85);

        // Shimmer celestial com eco
        const mysticFreqs = [587.33, 880.0, 1174.66, 1760.0]; // Refrão místico D-A-D-A
        mysticFreqs.forEach((freq, idx) => {
          const mOsc = ctx.createOscillator();
          const mGain = ctx.createGain();

          mOsc.type = 'sine';
          mOsc.frequency.setValueAtTime(freq, now + 0.08 + idx * 0.06);

          mGain.gain.setValueAtTime(0.001, now + 0.08 + idx * 0.06);
          mGain.gain.linearRampToValueAtTime(0.18, now + 0.15 + idx * 0.06);
          mGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

          mOsc.connect(mGain);
          mGain.connect(ctx.destination);

          mOsc.start(now + 0.08 + idx * 0.06);
          mOsc.stop(now + 1.45);
        });
        break;
      }

      case 'platinum':
      case 'platina': {
        // Platina: Fanfarra épica máxima completa estilo PS5
        // 1. Sub-bass expansivo de celebração
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(110, now);
        subOsc.frequency.exponentialRampToValueAtTime(42, now + 1.2);
        subGain.gain.setValueAtTime(0.42, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 1.35);

        // 2. Cascata heroica de abertura (5 notas crescentes)
        const arpeggio = [
          { f: 440.0, t: 0.0, d: 0.35 }, // A4
          { f: 554.37, t: 0.12, d: 0.35 }, // C#5
          { f: 659.25, t: 0.24, d: 0.35 }, // E5
          { f: 880.0, t: 0.36, d: 0.4 }, // A5
          { f: 1108.73, t: 0.48, d: 1.8 }, // C#6 (acorde máx)
          { f: 1318.51, t: 0.48, d: 1.8 }, // E6
          { f: 1760.0, t: 0.52, d: 1.9 } // A6 cintilante
        ];

        arpeggio.forEach(({ f, t, d }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = t >= 0.48 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(f, now + t);

          gain.gain.setValueAtTime(0.001, now + t);
          gain.gain.linearRampToValueAtTime(0.26, now + t + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + t + d);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + t);
          osc.stop(now + t + d + 0.1);
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.warn('[TrophyAudio] Não foi possível reproduzir som sintético:', err);
  }
}

/**
 * Efeito sonoro estilo RPG para ganho de XP e Level Up
 */
export function playXpGainSound(isLevelUp = false) {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const sequence = isLevelUp
      ? [
          { f: 523.25, t: 0.0, d: 0.22 }, // C5
          { f: 659.25, t: 0.09, d: 0.22 }, // E5
          { f: 783.99, t: 0.18, d: 0.25 }, // G5
          { f: 1046.5, t: 0.28, d: 0.9 }, // C6
          { f: 1318.51, t: 0.32, d: 0.95 }, // E6 brilho harmônico
        ]
      : [
          { f: 587.33, t: 0.0, d: 0.16 }, // D5
          { f: 880.0, t: 0.08, d: 0.35 }, // A5
        ];

    sequence.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isLevelUp ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, now + t);
      gain.gain.setValueAtTime(0.001, now + t);
      gain.gain.linearRampToValueAtTime(isLevelUp ? 0.22 : 0.15, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + d + 0.05);
    });
  } catch {
    // Silencioso em bloqueios de autoplay
  }
}

/**
 * Efeito sonoro sutil estilo "Item Colecionável / HUD de Progresso" (chime cristalino ~0.28s)
 * Perfeito para avisos parciais como "47/50", sem competir com a fanfarra completa de 100%.
 */
export function playCollectibleChimeSound() {
  try {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Chime cristalino em tríade ascendente C6 -> E6 -> G6 rápido e suave
    const notes = [
      { f: 1046.5, t: 0.0, d: 0.18, gain: 0.12 }, // C6
      { f: 1318.5, t: 0.05, d: 0.22, gain: 0.14 }, // E6
      { f: 1567.98, t: 0.11, d: 0.28, gain: 0.16 }, // G6
    ];

    notes.forEach(({ f, t, d, gain: targetGain }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0.0001, now + t);
      gain.gain.linearRampToValueAtTime(targetGain, now + t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + d);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + d + 0.03);
    });
  } catch {
    // Silencioso em bloqueios de autoplay ou exceções de áudio
  }
}
