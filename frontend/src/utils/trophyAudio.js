/**
 * Motor de Áudio para Troféus, Desafios, Duelos e XP.
 * Reproduz os áudios customizados em /sounds/... em canal único (sem sobreposição caótica)
 * com fallback automático em Web Audio API sintético para eventos ainda sem arquivo.
 */

let audioCtx = null;
let activeAudioEl = null;
let activeDelayTimer = null;
let audioSequenceToken = 0;

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

export function stopAllTrophyAudio() {
  audioSequenceToken += 1;
  if (activeDelayTimer) {
    clearTimeout(activeDelayTimer);
    activeDelayTimer = null;
  }
  if (activeAudioEl) {
    try {
      activeAudioEl.onended = null;
      activeAudioEl.onerror = null;
      activeAudioEl.pause();
      activeAudioEl.currentTime = 0;
    } catch {
      // Ignora erro ao limpar áudio anterior
    }
    activeAudioEl = null;
  }
}

export function setAudioMuted(muted) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MUTED, muted ? 'true' : 'false');
  if (muted) {
    stopAllTrophyAudio();
  }
  window.dispatchEvent(new CustomEvent('cine-audio-mute-change', { detail: { muted: Boolean(muted) } }));
}

export function toggleAudioMute() {
  const current = isAudioMuted();
  setAudioMuted(!current);
  return !current;
}

const SOUND_PATHS = {
  trophyProgress: '/sounds/trofeus/progresso/26f8b9_sonic_ring_sound_effect.mp3',
  trophyByTier: {
    bronze: '/sounds/trofeus/bronze/all-chaos-emeralds-sonic-3-knuckles.mp3',
    silver: '/sounds/trofeus/prata/two-time-respawne-forsaken.mp3',
    epic: '/sounds/trofeus/epico/ocarina-of-time-puzzle-solve-jingle-secret-sound.mp3',
    gold: '/sounds/trofeus/ouro/ps4-trophy.mp3',
    mythic: '/sounds/trofeus/mitico/ps5-original-trophy.mp3',
    platinum: '/sounds/trofeus/platina/seu-madruga-nossa.mp3',
  },
  // Prioridade 1 na leva de troféus: mapear id ou título normalizado para áudio próprio
  trophySpecific: {},
  worldDefaultPlane: '/sounds/paises/geral/25_plane.wav',
  countryByCode: {
    cn: '/sounds/paises/por-pais/cn_2F_announcer_china.wav',
    ru: '/sounds/paises/por-pais/ru_30_announcer_ussr.wav',
    su: '/sounds/paises/por-pais/ru_30_announcer_ussr.wav',
    th: '/sounds/paises/por-pais/th_33_announcer_thailand.wav',
  },
  timeMachineRandom: [
    '/sounds/maquina-do-tempo/arch-vile sight.wav',
    '/sounds/maquina-do-tempo/life_is_strange-consequences.mp3',
    '/sounds/maquina-do-tempo/stranger-things-clock-final-sound.mp3',
    '/sounds/maquina-do-tempo/za-warudo-sfx-no-voice.mp3',
    '/sounds/maquina-do-tempo/zelda-ocarina-of-time-zelda-lullaby.mp3',
  ],
  duelEffects: {
    shatter_glass: '/sounds/duelos/efeitos/shatter_glass_glass-breaking.mp3',
    slash_cleave: '/sounds/duelos/efeitos/slash_cleave_katana-1-hit.mp3',
    thanos_snap: '/sounds/duelos/efeitos/thanos_snap_thanos-snap-sound-effect.mp3',
    card_drop: '/sounds/duelos/efeitos/card_drop_shotgun.wav',
  },
  duelChallenger: '/sounds/duelos/desafiante/here-comes-a-new-challenger.mp3',
  xp: {
    orb: '/sounds/xp-e-nivel/xp/orb.mp3',
    levelUp: '/sounds/xp-e-nivel/level-up/levelup_sVAqjan.mp3',
    milestoneTitle: '/sounds/xp-e-nivel/patamar/ragnarok_MVP.m4a',
    classUnlock: '/sounds/xp-e-nivel/classe/final-fantasy-vii-victory-fanfare-1_dZiSUE7.mp3',
  },
  walkOfFamePackOpen: '/sounds/extras-memes/banco-reserva/digimon-tamers-card-spin.mp3',
  // Áudios customizáveis da Linha do Tempo & Cadeados/Assinatura. Se null, usa Web Audio API:
  walkOfFameTimelineOpen: null,
  walkOfFameTimelineStep: null,
  walkOfFameTimelineComplete: null,
  walkOfFameLockUnlock: null,
  walkOfFameSignatureWrite: null,
};

const TIER_ALIAS_MAP = {
  bronze: 'bronze',
  prata: 'silver',
  silver: 'silver',
  epico: 'epic',
  épico: 'epic',
  epic: 'epic',
  ouro: 'gold',
  gold: 'gold',
  mitico: 'mythic',
  mítico: 'mythic',
  mythic: 'mythic',
  platina: 'platinum',
  platinum: 'platinum',
};

const TIER_WEIGHT = {
  bronze: 10,
  silver: 20,
  epic: 30,
  gold: 40,
  mythic: 50,
  platinum: 60,
};

function normalizeTierKey(tier = 'bronze') {
  const key = String(tier || 'bronze').toLowerCase().trim();
  return TIER_ALIAS_MAP[key] || 'bronze';
}

function normalizeAudioKey(text = '') {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

let lastTimeMachineSoundIdx = -1;

function encodeAudioSrc(url) {
  try {
    return encodeURI(decodeURI(url));
  } catch {
    return encodeURI(url);
  }
}

function playAudioFile(url, { volume = 0.85, interrupt = true, onEnded = null, onFallback = null } = {}) {
  if (typeof window === 'undefined' || isAudioMuted() || !url) return false;
  if (typeof Audio === 'undefined') {
    onFallback?.();
    return false;
  }

  if (interrupt) {
    stopAllTrophyAudio();
  }
  const myToken = audioSequenceToken;

  try {
    const audio = new Audio(encodeAudioSrc(url));
    audio.volume = Math.max(0, Math.min(1, volume));
    activeAudioEl = audio;

    let handled = false;
    audio.onended = () => {
      if (myToken !== audioSequenceToken) return;
      if (activeAudioEl === audio) activeAudioEl = null;
      onEnded?.();
    };
    audio.onerror = () => {
      if (handled || myToken !== audioSequenceToken) return;
      handled = true;
      if (activeAudioEl === audio) activeAudioEl = null;
      onFallback?.();
    };

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((err) => {
        if (handled || myToken !== audioSequenceToken) return;
        handled = true;
        if (activeAudioEl === audio) activeAudioEl = null;
        console.warn('[TrophyAudio] Falha ao reproduzir arquivo:', url, err);
        onFallback?.();
      });
    }
    return true;
  } catch (err) {
    console.warn('[TrophyAudio] Erro ao inicializar áudio:', url, err);
    onFallback?.();
    return false;
  }
}

export function getSpecificTrophySoundUrl(trophy) {
  if (!trophy) return null;
  const byId = trophy.id ? SOUND_PATHS.trophySpecific[String(trophy.id)] : null;
  if (byId) return byId;
  const normalizedTitle = trophy.title ? SOUND_PATHS.trophySpecific[normalizeAudioKey(trophy.title)] : null;
  if (normalizedTitle) return normalizedTitle;
  return trophy.customSoundUrl || null;
}

/**
 * Prioridade única por leva de até 4 cards na tela:
 * 1) Troféu específico com áudio próprio (desbloqueado primeiro, desempatado por raridade)
 * 2) Grau do troféu desbloqueado mais raro da leva (Platina > Mítico > Ouro > Épico > Prata > Bronze)
 * 3) Som de progresso parcial (1 único som se toda a leva for só progresso)
 */
export function playTrophyBatchSound(items = []) {
  if (isAudioMuted() || !Array.isArray(items) || items.length === 0) return;

  const unlocked = items
    .filter((item) => item && item.type !== 'progress' && item.trophy)
    .sort((a, b) => {
      const wa = TIER_WEIGHT[normalizeTierKey(a.trophy?.tier)] || 0;
      const wb = TIER_WEIGHT[normalizeTierKey(b.trophy?.tier)] || 0;
      return wb - wa;
    });

  // Prioridade 1: Troféu específico com som cadastrado
  const specificUnlocked = unlocked.find((item) => Boolean(getSpecificTrophySoundUrl(item.trophy)));
  if (specificUnlocked) {
    playTrophySound(specificUnlocked.trophy?.tier, specificUnlocked.trophy);
    return;
  }

  const specificProgress = items.find((item) => item?.trophy && Boolean(getSpecificTrophySoundUrl(item.trophy)));
  if (unlocked.length === 0 && specificProgress) {
    playTrophySound(specificProgress.trophy?.tier, specificProgress.trophy);
    return;
  }

  // Prioridade 2: Grau mais raro entre os conquistados da leva
  if (unlocked.length > 0) {
    const rarest = unlocked[0];
    playTrophySound(rarest.trophy?.tier, rarest.trophy);
    return;
  }

  // Prioridade 3: Apenas cards de progresso nessa leva
  playCollectibleChimeSound();
}

/**
 * Toca o efeito sonoro de acordo com o Tier da conquista (ou som específico do troféu se existir).
 */
export function playTrophySound(tier = 'bronze', trophy = null) {
  if (isAudioMuted()) return;
  const specificUrl = getSpecificTrophySoundUrl(trophy);
  const tierKey = normalizeTierKey(tier);
  const customUrl = specificUrl || SOUND_PATHS.trophyByTier[tierKey];

  if (customUrl) {
    playAudioFile(customUrl, {
      onFallback: () => playSyntheticTrophySound(tierKey),
    });
    return;
  }

  playSyntheticTrophySound(tierKey);
}

/**
 * Toca o som de conclusão (Letreiro de Vitória 100%) de uma Saga ou Mega-Saga Mítica do Códice.
 * Temporariamente silenciado por padrão até a inclusão do novo áudio oficial de conquista de saga.
 */
export function playUniverseVictorySound(_tier = 'gold', customAudio = null) {
  if (isAudioMuted()) return;
  const cleanCustom = customAudio ? String(customAudio).trim() : '';
  if (!cleanCustom) {
    return;
  }

  const resolvedUrl =
    cleanCustom.startsWith('http') || cleanCustom.startsWith('/')
      ? cleanCustom
      : `/sounds/${cleanCustom.replace(/^sounds\//i, '')}`;
  playAudioFile(resolvedUrl);
}

function playSyntheticTrophySound(tier = 'bronze') {
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
 * Toca o som do bloco de XP/Nível/Classe respeitando prioridade:
 * Nova Classe > Novo Patamar (título de 5 em 5 níveis) > Level Up > Barra XP (orb)
 */
export function playXpEventSound({ leveledUp = false, titleChanged = false, unlockedClass = null } = {}) {
  if (isAudioMuted()) return;

  let targetUrl = SOUND_PATHS.xp.orb;
  if (unlockedClass) {
    targetUrl = SOUND_PATHS.xp.classUnlock;
  } else if (leveledUp && titleChanged) {
    targetUrl = SOUND_PATHS.xp.milestoneTitle;
  } else if (leveledUp) {
    targetUrl = SOUND_PATHS.xp.levelUp;
  }

  playAudioFile(targetUrl, {
    onFallback: () => playSyntheticXpGainSound(Boolean(leveledUp || unlockedClass)),
  });
}

/**
 * Efeito sonoro estilo RPG para ganho de XP e Level Up
 */
export function playXpGainSound(isLevelUp = false, options = {}) {
  playXpEventSound({ leveledUp: isLevelUp, ...options });
}

function playSyntheticXpGainSound(isLevelUp = false) {
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
 * Efeito sonoro de progresso parcial em troféus (ex: 47/50)
 */
export function playCollectibleChimeSound() {
  if (isAudioMuted()) return;
  playAudioFile(SOUND_PATHS.trophyProgress, {
    onFallback: playSyntheticCollectibleChimeSound,
  });
}

/**
 * Efeito sonoro secundário de progresso (usado quando há troféus principais ativos simultaneamente).
 * Não cancela a fanfarra principal do troféu e suporta delay de respiro.
 */
export function playSecondaryChimeSound(delayMs = 0) {
  if (isAudioMuted()) return;
  const trigger = () => {
    try {
      const audio = new Audio(SOUND_PATHS.trophyProgress);
      audio.volume = 0.5; // Mais suave para harmonizar com a fanfarra principal
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => playSyntheticCollectibleChimeSound());
      }
    } catch {
      playSyntheticCollectibleChimeSound();
    }
  };

  if (delayMs > 0) {
    setTimeout(trigger, delayMs);
  } else {
    trigger();
  }
}

function playSyntheticCollectibleChimeSound() {
  try {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { f: 1046.5, t: 0.0, d: 0.18, gain: 0.12 },
      { f: 1318.5, t: 0.05, d: 0.22, gain: 0.14 },
      { f: 1567.98, t: 0.11, d: 0.28, gain: 0.16 },
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

/**
 * Efeito sonoro exclusivo da Máquina do Tempo ("Flux Capacitor / Portal Temporal").
 * Escolhe aleatoriamente um dos efeitos cadastrados em `/sounds/maquina-do-tempo/`
 * para filmes de um novo ano (com fallback sintético caso falhe).
 */
export function playTimeMachineSound(rarityOrKind = 'epic') {
  if (isAudioMuted()) return;

  const pool = SOUND_PATHS.timeMachineRandom;
  if (Array.isArray(pool) && pool.length > 0) {
    let idx = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && idx === lastTimeMachineSoundIdx) {
      idx = (idx + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length;
    }
    lastTimeMachineSoundIdx = idx;
    playAudioFile(pool[idx], {
      onFallback: () => playSyntheticTimeMachineSound(rarityOrKind),
    });
    return;
  }

  playSyntheticTimeMachineSound(rarityOrKind);
}

function playSyntheticTimeMachineSound(rarityOrKind = 'epic') {
  try {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const isHighRarity =
      rarityOrKind === 'mythic' ||
      rarityOrKind === 'legendary' ||
      rarityOrKind === 'decade_relic';

    // 1. Dobra Temporal (Sweep ascendente estilo DeLorean / Portal)
    const sweepOsc = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweepOsc.type = 'sine';
    sweepOsc.frequency.setValueAtTime(196.0, now);
    sweepOsc.frequency.exponentialRampToValueAtTime(isHighRarity ? 1174.66 : 880.0, now + 0.28);
    sweepGain.gain.setValueAtTime(0.001, now);
    sweepGain.gain.linearRampToValueAtTime(0.18, now + 0.09);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    sweepOsc.connect(sweepGain);
    sweepGain.connect(ctx.destination);
    sweepOsc.start(now);
    sweepOsc.stop(now + 0.34);

    // 2. Micro-pulsos digitais do odômetro travando no ano (3 cliques rítmicos)
    [0.06, 0.13, 0.2].forEach((offset, idx) => {
      const tickOsc = ctx.createOscillator();
      const tickGain = ctx.createGain();
      tickOsc.type = 'triangle';
      tickOsc.frequency.setValueAtTime(900 + idx * 240, now + offset);
      tickGain.gain.setValueAtTime(0.08, now + offset);
      tickGain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.045);
      tickOsc.connect(tickGain);
      tickGain.connect(ctx.destination);
      tickOsc.start(now + offset);
      tickOsc.stop(now + offset + 0.05);
    });

    // 3. Acorde de Ancoragem Temporal (pousando no ano conquistado)
    const chord = isHighRarity
      ? [
          { f: 587.33, t: 0.26, d: 0.85, g: 0.16 }, // D5
          { f: 880.0, t: 0.31, d: 0.9, g: 0.17 },   // A5
          { f: 1108.73, t: 0.36, d: 1.0, g: 0.18 }, // C#6
          { f: 1479.98, t: 0.42, d: 1.15, g: 0.16 }, // F#6
        ]
      : [
          { f: 523.25, t: 0.25, d: 0.65, g: 0.14 }, // C5
          { f: 783.99, t: 0.3, d: 0.72, g: 0.15 },  // G5
          { f: 1174.66, t: 0.35, d: 0.85, g: 0.15 }, // D6
        ];

    chord.forEach(({ f, t, d, g }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + t);
      gain.gain.setValueAtTime(0.0001, now + t);
      gain.gain.linearRampToValueAtTime(g, now + t + 0.025);
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

const DUEL_SFX_CUES = {
  card_drop: [
    { type: 'sine', f0: 660, f1: 150, t: 0.42, d: 0.34, g: 0.14 },
    { type: 'triangle', f0: 120, f1: 48, t: 0.76, d: 0.16, g: 0.24 },
  ],
  thanos_snap: [
    { type: 'triangle', f0: 2500, f1: 920, t: 0.42, d: 0.06, g: 0.22 },
    { type: 'sine', f0: 1180, f1: 310, t: 0.48, d: 0.48, g: 0.1 },
  ],
  slash_cleave: [
    { type: 'sawtooth', f0: 3100, f1: 720, t: 0.42, d: 0.22, g: 0.14 },
    { type: 'triangle', f0: 1850, f1: 420, t: 0.46, d: 0.18, g: 0.11 },
  ],
  shatter_glass: [
    { type: 'sine', f0: 3200, f1: 2800, t: 0.42, d: 0.09, g: 0.13 },
    { type: 'sine', f0: 3950, f1: 3400, t: 0.46, d: 0.1, g: 0.13 },
    { type: 'sine', f0: 4520, f1: 3800, t: 0.51, d: 0.11, g: 0.11 },
    { type: 'sine', f0: 2740, f1: 2100, t: 0.56, d: 0.13, g: 0.1 },
  ],
};

function scheduleDuelEffectCue(ctx, now, duelEffect) {
  const steps = duelEffect ? DUEL_SFX_CUES[duelEffect] : null;
  if (!steps) return;
  steps.forEach(({ type, f0, f1, t, d, g }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, now + t);
    if (f1 && f1 !== f0) {
      osc.frequency.exponentialRampToValueAtTime(f1, now + t + d);
    }
    gain.gain.setValueAtTime(0.0001, now + t);
    gain.gain.linearRampToValueAtTime(g, now + t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + t + d);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + t);
    osc.stop(now + t + d + 0.03);
  });
}

/**
 * Efeito sonoro de Tomada de Trono / Duelo Vencido (Ano ou País):
 * Toca primeiro o efeito específico da derrota (cristal, katana, estalo do Thanos ou shotgun)
 * e em seguida encadeia o "Here comes a new challenger!".
 */
export function playDethroneSound(duelEffect = null) {
  if (isAudioMuted()) return;

  stopAllTrophyAudio();
  const myToken = audioSequenceToken;
  const effectUrl = duelEffect ? SOUND_PATHS.duelEffects[duelEffect] : null;
  const challengerUrl = SOUND_PATHS.duelChallenger;

  const playChallengerNext = () => {
    if (myToken !== audioSequenceToken || isAudioMuted()) return;
    if (challengerUrl) {
      playAudioFile(challengerUrl, { interrupt: false });
    }
  };

  activeDelayTimer = setTimeout(() => {
    activeDelayTimer = null;
    if (myToken !== audioSequenceToken || isAudioMuted()) return;

    if (effectUrl) {
      playAudioFile(effectUrl, {
        interrupt: false,
        onEnded: playChallengerNext,
        onFallback: () => {
          playSyntheticDethroneSound(duelEffect);
          activeDelayTimer = setTimeout(playChallengerNext, 900);
        },
      });
    } else {
      playSyntheticDethroneSound(duelEffect);
      activeDelayTimer = setTimeout(playChallengerNext, 900);
    }
  }, 240);
}

function playSyntheticDethroneSound(duelEffect = null) {
  try {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(190, now);
    subOsc.frequency.exponentialRampToValueAtTime(52, now + 0.24);
    subGain.gain.setValueAtTime(0.28, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.28);

    const clashOsc = ctx.createOscillator();
    const clashGain = ctx.createGain();
    clashOsc.type = 'sawtooth';
    clashOsc.frequency.setValueAtTime(1650, now + 0.02);
    clashOsc.frequency.exponentialRampToValueAtTime(620, now + 0.16);
    clashGain.gain.setValueAtTime(0.11, now + 0.02);
    clashGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    clashOsc.connect(clashGain);
    clashGain.connect(ctx.destination);
    clashOsc.start(now + 0.02);
    clashOsc.stop(now + 0.2);

    const crownNotes = [
      { f: 440.0, t: 0.14, d: 0.22, g: 0.14 },
      { f: 554.37, t: 0.21, d: 0.25, g: 0.15 },
      { f: 659.25, t: 0.28, d: 0.35, g: 0.16 },
      { f: 880.0, t: 0.36, d: 0.95, g: 0.19 },
    ];
    crownNotes.forEach(({ f, t, d, g }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);
      gain.gain.setValueAtTime(0.0001, now + t);
      gain.gain.linearRampToValueAtTime(g, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + d + 0.04);
    });

    scheduleDuelEffectCue(ctx, now, duelEffect);
  } catch {
    // Silencioso em bloqueios de autoplay
  }
}

/**
 * Efeito sonoro de Desbloqueio / Conquista Territorial do Desafio 195.
 * Sempre toca o avião (`25_plane.wav`) em país novo; quando o país possui áudio específico,
 * encadeia o locutor logo após o som do avião.
 */
export function playWorldConquestSound(
  rarity = 'common',
  isDethrone = false,
  duelEffect = null,
  countryCode = null
) {
  if (isDethrone) {
    playDethroneSound(duelEffect);
    return;
  }
  if (isAudioMuted()) return;

  const codeKey = countryCode ? String(countryCode).toLowerCase().trim() : '';
  const specificCountryUrl = codeKey ? SOUND_PATHS.countryByCode[codeKey] : null;
  const planeUrl = SOUND_PATHS.worldDefaultPlane;

  stopAllTrophyAudio();
  const myToken = audioSequenceToken;

  if (specificCountryUrl) {
    const playSpecificNext = () => {
      if (myToken !== audioSequenceToken || isAudioMuted()) return;
      playAudioFile(specificCountryUrl, {
        interrupt: false,
        onFallback: () => playSyntheticWorldConquestSound(rarity),
      });
    };

    if (planeUrl) {
      playAudioFile(planeUrl, {
        interrupt: false,
        onEnded: playSpecificNext,
        onFallback: playSpecificNext,
      });
      return;
    }

    playSpecificNext();
    return;
  }

  if (planeUrl) {
    playAudioFile(planeUrl, {
      interrupt: false,
      onFallback: () => playSyntheticWorldConquestSound(rarity),
    });
    return;
  }

  playSyntheticWorldConquestSound(rarity);
}

export function playWalkOfFamePackSound({ onEnded = null, onFallback = null } = {}) {
  if (typeof window === 'undefined' || isAudioMuted()) {
    return false;
  }
  return playAudioFile(SOUND_PATHS.walkOfFamePackOpen, {
    volume: 0.9,
    interrupt: true,
    onEnded,
    onFallback,
  });
}

function playSynthTimelineTone({ frequency = 440, endFrequency = null, duration = 0.22, gainPeak = 0.08, type = 'sine', delay = 0 } = {}) {
  const ctx = getAudioContext();
  if (!ctx) return false;
  try {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const startAt = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startAt);
    if (endFrequency && endFrequency !== frequency) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFrequency), startAt + duration);
    }
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, gainPeak), startAt + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.03);
    return true;
  } catch {
    return false;
  }
}

export function playWalkOfFameTimelineOpenSound() {
  if (typeof window === 'undefined' || isAudioMuted()) {
    return false;
  }
  const synth = () => {
    playSynthTimelineTone({ frequency: 261.63, endFrequency: 392, duration: 0.26, gainPeak: 0.075, type: 'triangle', delay: 0 });
    playSynthTimelineTone({ frequency: 523.25, duration: 0.34, gainPeak: 0.06, type: 'sine', delay: 0.11 });
  };
  if (SOUND_PATHS.walkOfFameTimelineOpen) {
    const ok = playAudioFile(SOUND_PATHS.walkOfFameTimelineOpen, { volume: 0.75, interrupt: false, onFallback: synth });
    if (ok) return true;
  }
  synth();
  return true;
}

export function playWalkOfFameTimelineStepSound({ rating = null, delta = 0 } = {}) {
  if (typeof window === 'undefined' || isAudioMuted()) {
    return false;
  }
  const synth = () => {
    const numericRating = Number(rating);
    const clampedScore = Number.isFinite(numericRating) ? Math.min(10, Math.max(0, numericRating)) : 7;
    const baseFreq = 260 + clampedScore * 36;
    const numDelta = Number(delta || 0);
    const isUp = numDelta > 0.05;
    const isDown = numDelta < -0.05;
    const endFreq = isUp ? baseFreq * 1.18 : isDown ? baseFreq * 0.84 : baseFreq * 1.03;
    playSynthTimelineTone({
      frequency: baseFreq,
      endFrequency: endFreq,
      duration: 0.22,
      gainPeak: 0.065,
      type: isDown ? 'triangle' : 'sine',
    });
  };
  if (SOUND_PATHS.walkOfFameTimelineStep) {
    const ok = playAudioFile(SOUND_PATHS.walkOfFameTimelineStep, { volume: 0.55, interrupt: false, onFallback: synth });
    if (ok) return true;
  }
  synth();
  return true;
}

export function playWalkOfFameTimelineCompleteSound() {
  if (typeof window === 'undefined' || isAudioMuted()) {
    return false;
  }
  const synth = () => {
    const chord = [392.0, 493.88, 587.33, 783.99];
    chord.forEach((freq, idx) => {
      playSynthTimelineTone({
        frequency: freq,
        duration: 0.45,
        gainPeak: 0.055,
        type: 'sine',
        delay: idx * 0.07,
      });
    });
  };
  if (SOUND_PATHS.walkOfFameTimelineComplete) {
    const ok = playAudioFile(SOUND_PATHS.walkOfFameTimelineComplete, { volume: 0.8, interrupt: false, onFallback: synth });
    if (ok) return true;
  }
  synth();
  return true;
}

export function playWalkOfFameLockUnlockSound({ isFinal = false } = {}) {
  if (typeof window === 'undefined' || isAudioMuted()) {
    return false;
  }
  const synth = () => {
    // Impacto de selo/cadeado raro quebrando + estilhaços cristalinos
    playSynthTimelineTone({ frequency: 190, endFrequency: 65, duration: 0.14, gainPeak: 0.11, type: 'sawtooth', delay: 0 });
    playSynthTimelineTone({ frequency: 480, endFrequency: 920, duration: 0.12, gainPeak: 0.085, type: 'triangle', delay: 0.04 });
    playSynthTimelineTone({ frequency: 1320, endFrequency: 1760, duration: 0.18, gainPeak: 0.06, type: 'sine', delay: 0.1 });
    playSynthTimelineTone({ frequency: 783.99, duration: 0.28, gainPeak: 0.065, type: 'sine', delay: 0.14 });
    if (isFinal) {
      playSynthTimelineTone({ frequency: 1046.5, duration: 0.34, gainPeak: 0.07, type: 'sine', delay: 0.22 });
      playSynthTimelineTone({ frequency: 1567.98, duration: 0.44, gainPeak: 0.055, type: 'sine', delay: 0.3 });
    }
  };
  if (SOUND_PATHS.walkOfFameLockUnlock) {
    const ok = playAudioFile(SOUND_PATHS.walkOfFameLockUnlock, { volume: 0.8, interrupt: false, onFallback: synth });
    if (ok) return true;
  }
  synth();
  return true;
}

export function playWalkOfFameTypeTickSound() {
  if (typeof window === 'undefined' || isAudioMuted()) {
    return false;
  }
  return playSynthTimelineTone({
    frequency: 620,
    endFrequency: 310,
    duration: 0.025,
    gainPeak: 0.016,
    type: 'triangle',
    delay: 0,
  });
}

export function playWalkOfFameSignatureSound() {
  if (typeof window === 'undefined' || isAudioMuted()) {
    return false;
  }
  const synth = () => {
    // Notas delicadas espaçadas acompanhando a caneta escrevendo devagar (~3s)
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    notes.forEach((freq, idx) => {
      playSynthTimelineTone({
        frequency: freq,
        endFrequency: freq * 1.04,
        duration: 0.32,
        gainPeak: 0.032,
        type: 'sine',
        delay: 0.22 + idx * 0.44,
      });
    });
  };
  if (SOUND_PATHS.walkOfFameSignatureWrite) {
    const ok = playAudioFile(SOUND_PATHS.walkOfFameSignatureWrite, { volume: 0.65, interrupt: false, onFallback: synth });
    if (ok) return true;
  }
  synth();
  return true;
}

function playSyntheticWorldConquestSound(rarity = 'common') {
  try {
    if (isAudioMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const isRareOrHigher = rarity === 'mythic' || rarity === 'legendary' || rarity === 'epic';

    const pingOsc = ctx.createOscillator();
    const pingGain = ctx.createGain();
    pingOsc.type = 'sine';
    pingOsc.frequency.setValueAtTime(740, now);
    pingOsc.frequency.exponentialRampToValueAtTime(1108.73, now + 0.14);
    pingGain.gain.setValueAtTime(0.14, now);
    pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    pingOsc.connect(pingGain);
    pingGain.connect(ctx.destination);
    pingOsc.start(now);
    pingOsc.stop(now + 0.2);

    const fanfare = isRareOrHigher
      ? [
          { f: 523.25, t: 0.12, d: 0.45, g: 0.14 },
          { f: 659.25, t: 0.18, d: 0.55, g: 0.15 },
          { f: 783.99, t: 0.24, d: 0.7, g: 0.16 },
          { f: 1046.5, t: 0.31, d: 1.0, g: 0.17 },
        ]
      : [
          { f: 523.25, t: 0.12, d: 0.35, g: 0.13 },
          { f: 783.99, t: 0.19, d: 0.65, g: 0.15 },
          { f: 1046.5, t: 0.27, d: 0.75, g: 0.15 },
        ];

    fanfare.forEach(({ f, t, d, g }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + t);
      gain.gain.setValueAtTime(0.0001, now + t);
      gain.gain.linearRampToValueAtTime(g, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + d + 0.04);
    });
  } catch {
    // Silencioso em bloqueios de autoplay
  }
}
