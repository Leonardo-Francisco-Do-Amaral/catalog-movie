import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, Sparkles, ArrowRight, Gift, Layers } from 'lucide-react';
import WalkOfFameStickerCard from './WalkOfFameStickerCard';
import {
  getThemeForTier,
  WALK_UNLOCK_ROADMAP,
  resolveWalkMediaUrl,
} from '../utils/walkOfFameStickers';
import {
  playWalkOfFamePackSound,
  playWalkOfFameLockUnlockSound,
  playWalkOfFameSignatureSound,
  playWalkOfFameTypeTickSound,
  stopAllTrophyAudio,
} from '../utils/trophyAudio';

const TIER_DEFAULT_PCT = {
  cement: 0,
  carving: 0,
  bronze: 15,
  silver: 30,
  epic: 45,
  gold: 60,
  mythic: 75,
  diamond: 90,
};

const LIGHT_SPARKS = [
  { tx: '-84px', ty: '-54px', rot: '-35deg', size: 7, delay: '0s' },
  { tx: '-38px', ty: '-78px', rot: '25deg', size: 5, delay: '0.04s' },
  { tx: '34px', ty: '-82px', rot: '-20deg', size: 6, delay: '0.02s' },
  { tx: '88px', ty: '-48px', rot: '45deg', size: 8, delay: '0.05s' },
  { tx: '96px', ty: '14px', rot: '15deg', size: 5, delay: '0.03s' },
  { tx: '64px', ty: '68px', rot: '-40deg', size: 7, delay: '0.06s' },
  { tx: '-58px', ty: '64px', rot: '35deg', size: 6, delay: '0.02s' },
  { tx: '-96px', ty: '10px', rot: '-15deg', size: 5, delay: '0.04s' },
];

const MINI_TIMELINE_NODES = [
  { year: '2014', score: '8.2', offsetY: -6 },
  { year: '2017', score: '9.4', offsetY: -18 },
  { year: '2020', score: '6.9', offsetY: 12 },
  { year: '2024', score: '9.7', offsetY: -20 },
];

/**
 * Texto estilo máquina de escrever solto no espaço escuro, disparando onComplete ao concluir.
 */
function TypewriterTextBlock({
  lines = [],
  speedMs = 24,
  accentHex = '#fbbf24',
  className = '',
  onComplete,
}) {
  const fullText = useMemo(() => lines.filter(Boolean).join('\n'), [lines]);
  const [visibleLen, setVisibleLen] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setVisibleLen(0);
    if (!fullText) {
      onCompleteRef.current?.();
      return undefined;
    }

    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setVisibleLen(current);
      const ch = fullText[current - 1];
      if (ch && ch !== ' ' && ch !== '\n' && current % 3 === 1) {
        playWalkOfFameTypeTickSound();
      }
      if (current >= fullText.length) {
        clearInterval(id);
        onCompleteRef.current?.();
      }
    }, speedMs);

    return () => clearInterval(id);
  }, [fullText, speedMs]);

  if (!fullText) return null;

  const shown = fullText.slice(0, visibleLen);
  const isTyping = visibleLen < fullText.length;

  return (
    <div className={`whitespace-pre-line ${className}`}>
      <span>{shown}</span>
      {isTyping && (
        <span
          aria-hidden="true"
          className="inline-block w-[3px] h-[1em] align-middle ml-1 rounded-full typewriter-cursor"
          style={{
            backgroundColor: accentHex,
            boxShadow: `0 0 10px ${accentHex}`,
          }}
        />
      )}
    </div>
  );
}

/**
 * Explosão sutil de partículas e onda de luz (sem cadeado!) quando um marco abre automaticamente.
 */
function RareLightBurst({ accentHex = '#fbbf24' }) {
  return (
    <div
      aria-hidden="true"
      className="relative w-0 h-0 flex items-center justify-center pointer-events-none select-none"
    >
      <span
        className="absolute w-24 h-24 rounded-full border rare-shockwave-ring"
        style={{
          borderColor: accentHex,
          boxShadow: `0 0 28px ${accentHex}aa`,
        }}
      />
      {LIGHT_SPARKS.map((sp, idx) => (
        <span
          key={idx}
          className="rare-shard-fly absolute rounded-full"
          style={{
            width: `${sp.size}px`,
            height: `${sp.size}px`,
            background: idx % 2 === 0 ? '#fef08a' : accentHex,
            boxShadow: `0 0 12px ${accentHex}`,
            '--tx': sp.tx,
            '--ty': sp.ty,
            '--rot': sp.rot,
            animationDelay: sp.delay,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Assinatura cursiva escrevendo devagar ao vivo com ponta de caneta luminosa (90%+).
 */
function SigningPenShowcase({ starName, accentHex = '#38bdf8', isDone = false }) {
  return (
    <div className="flex flex-col items-center md:items-start gap-1.5 select-none">
      <div className="relative inline-block py-2 pr-4">
        <span
          className="text-3xl sm:text-4xl italic font-semibold tracking-wide block leading-tight autograph-write-text"
          style={{
            fontFamily: "'Brush Script MT', 'Segoe Script', 'Snell Roundhand', Georgia, serif",
            color: '#fef08a',
            textShadow: `0 0 18px ${accentHex}, 0 4px 12px rgba(0,0,0,0.95)`,
          }}
        >
          {starName}
        </span>

        {/* Faisca e pena caligráfica deslizando pelo traço enquanto assina */}
        {!isDone && (
          <div
            aria-hidden="true"
            className="signing-hand-pen absolute pointer-events-none z-20 flex items-center"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: 'radial-gradient(circle, #ffffff, #fde047 65%, transparent 100%)',
                boxShadow: `0 0 14px 4px #fde047, 0 0 22px ${accentHex}`,
              }}
            />
            <svg
              viewBox="0 0 28 28"
              className="w-6 h-6 -ml-1 -mt-5 drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)]"
            >
              <path
                d="M3 25 L9 14 L22 2 L26 6 L14 19 Z"
                fill="url(#sleekNibGrad)"
                stroke="#09090b"
                strokeWidth="1.2"
              />
              <path d="M3 25 L9 20 L7.5 18 Z" fill="#ffffff" />
              <defs>
                <linearGradient id="sleekNibGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="55%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor={accentHex} />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}

        <svg viewBox="0 0 120 12" className="w-52 sm:w-64 h-3 opacity-95 mt-0.5">
          <path
            d="M4 8 Q 56 1, 116 6"
            fill="none"
            stroke={accentHex}
            strokeWidth="2.2"
            strokeLinecap="round"
            className="autograph-write-line"
          />
        </svg>
      </div>
    </div>
  );
}

/**
 * Mini prévia luminosa da Linha do Tempo flutuando no espaço ao desbloquear 75%.
 */
function FloatingTimelinePreview({ accentHex = '#22d3ee' }) {
  return (
    <div className="relative w-full max-w-sm h-16 flex items-center justify-between px-3 select-none">
      <div
        className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[2px] rounded-full opacity-70"
        style={{
          background: `linear-gradient(90deg, ${accentHex}, #fbbf24, #a855f7)`,
          boxShadow: `0 0 14px ${accentHex}`,
        }}
      />
      {MINI_TIMELINE_NODES.map((node, idx) => (
        <div
          key={node.year}
          className="relative z-10 flex flex-col items-center transition-transform"
          style={{
            transform: `translateY(${node.offsetY}px)`,
            animationDelay: `${idx * 120}ms`,
          }}
        >
          <span className="text-[10px] font-mono font-black text-amber-300 drop-shadow">
            ★{node.score}
          </span>
          <span
            className="w-3 h-3 rounded-full border-2 border-zinc-950 my-0.5"
            style={{
              backgroundColor: idx % 2 === 0 ? accentHex : '#fbbf24',
              boxShadow: `0 0 12px ${accentHex}`,
            }}
          />
          <span className="text-[9px] font-mono font-bold text-zinc-400">{node.year}</span>
        </div>
      ))}
    </div>
  );
}

export default function WalkOfFamePackModal({
  pack,
  onStickPack,
  onSaveForLater,
  onClose,
}) {
  // 'sealed' | 'opening' | 'revealed' | 'pasting'
  const [phase, setPhase] = useState('sealed');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [unlockedKeys, setUnlockedKeys] = useState([]);
  const [burstNonce, setBurstNonce] = useState(0);
  const [stepFinishedTyping, setStepFinishedTyping] = useState(false);
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true);
  // 'idle' | 'writing' | 'done'
  const [signatureState, setSignatureState] = useState('idle');

  const openingDoneRef = useRef(false);
  const autoAdvanceTimerRef = useRef(null);

  const handleClose = useCallback(() => {
    clearTimeout(autoAdvanceTimerRef.current);
    stopAllTrophyAudio();
    if (pack && phase !== 'sealed' && phase !== 'pasting') {
      onSaveForLater?.(pack);
      return;
    }
    onClose?.();
  }, [onClose, onSaveForLater, pack, phase]);

  // Lista ordenada de marcos desbloqueados dentro deste pacotinho (15% -> 90% + Estrela Bônus)
  const unlockAnalysis = useMemo(() => {
    if (!pack || !pack.star) {
      return {
        packUnlockItems: [],
        roadmapWithState: [],
      };
    }

    const resolvedTier = pack.toTier || pack.star.statusTierKey || 'bronze';
    const effFromTier =
      pack.fromTier && pack.fromTier !== 'cement' && pack.fromTier !== 'carving'
        ? pack.fromTier
        : null;

    const rawFromPct =
      pack.fromPct != null ? Number(pack.fromPct) : effFromTier ? TIER_DEFAULT_PCT[effFromTier] || 0 : 0;
    const rawToPct =
      pack.toPct != null
        ? Number(pack.toPct)
        : Math.max(TIER_DEFAULT_PCT[resolvedTier] || 15, Number(pack.star.percentage || 0));

    let items = WALK_UNLOCK_ROADMAP.filter((step) => step.pct > rawFromPct && step.pct <= rawToPct).map(
      (step) => ({ ...step, key: step.pct })
    );

    if (items.length === 0 && pack.packType === 'extra_star') {
      items = [
        {
          key: 'extra_star',
          pct: 100,
          tierKey: 'diamond',
          icon: '⭐',
          title: 'Estrela Bônus ★ & Nova Cor de Aura',
          short: `Estrela ★${pack.extraStarsUnlocked || pack.star.extraStars || 1}`,
        },
      ];
    } else if (items.length === 0) {
      const targetStep =
        WALK_UNLOCK_ROADMAP.find((s) => s.tierKey === resolvedTier) || WALK_UNLOCK_ROADMAP[0];
      items = [{ ...targetStep, key: targetStep.pct }];
    }

    const packStepKeys = new Set(items.map((i) => i.key));
    const roadmapWithState = WALK_UNLOCK_ROADMAP.map((step) => ({
      ...step,
      key: step.pct,
      isAlreadyUnlocked: step.pct <= rawFromPct && !packStepKeys.has(step.pct),
      isInPack: packStepKeys.has(step.pct),
    }));

    return { packUnlockItems: items, roadmapWithState };
  }, [pack]);

  const { packUnlockItems, roadmapWithState } = unlockAnalysis;

  const activateStepAt = useCallback(
    (idx, { stopAuto = false } = {}) => {
      clearTimeout(autoAdvanceTimerRef.current);
      if (idx < 0 || idx >= packUnlockItems.length) return;
      const item = packUnlockItems[idx];
      const isFinal = item.key === 90;

      if (stopAuto) {
        setAutoAdvanceEnabled(false);
      }
      setActiveStepIndex(idx);
      setStepFinishedTyping(false);
      setBurstNonce((n) => n + 1);
      setUnlockedKeys((prev) => (prev.includes(item.key) ? prev : [...prev, item.key]));
      playWalkOfFameLockUnlockSound({ isFinal });

      if (isFinal) {
        setSignatureState('writing');
        playWalkOfFameSignatureSound();
      }
    },
    [packUnlockItems]
  );

  const enterRevealedDirectly = useCallback(() => {
    setPhase('revealed');
    setAutoAdvanceEnabled(true);
    setSignatureState('idle');
    if (packUnlockItems.length > 0) {
      activateStepAt(0);
    }
  }, [packUnlockItems.length, activateStepAt]);

  useEffect(() => {
    clearTimeout(autoAdvanceTimerRef.current);
    setPhase('sealed');
    setActiveStepIndex(0);
    setUnlockedKeys([]);
    setBurstNonce(0);
    setStepFinishedTyping(false);
    setAutoAdvanceEnabled(true);
    setSignatureState('idle');
    openingDoneRef.current = false;
  }, [pack?.packId, pack?.star?.id, pack?.packType]);

  // Garantia de transição ao fim do giro 3D (2.85s) caso onEnded do áudio dispare antes/depois
  useEffect(() => {
    if (phase !== 'opening') return undefined;
    openingDoneRef.current = false;

    const t = setTimeout(() => {
      if (openingDoneRef.current) return;
      openingDoneRef.current = true;
      enterRevealedDirectly();
    }, 2900);

    return () => clearTimeout(t);
  }, [phase, enterRevealedDirectly]);

  // Controle do tempo de escrita da assinatura em 90%
  useEffect(() => {
    if (signatureState !== 'writing') return undefined;
    const t = setTimeout(() => {
      setSignatureState('done');
    }, 3400);
    return () => clearTimeout(t);
  }, [signatureState]);

  // Avança automaticamente para o próximo marco desbloqueado ao terminar de escrever o atual
  useEffect(() => {
    if (phase !== 'revealed' || !autoAdvanceEnabled) return undefined;
    const currentItem = packUnlockItems[activeStepIndex];
    if (!currentItem) return undefined;

    const hasNext = activeStepIndex + 1 < packUnlockItems.length;
    if (!hasNext) return undefined;

    const readyToAdvance =
      currentItem.key === 90
        ? signatureState === 'done' && stepFinishedTyping
        : stepFinishedTyping;

    if (!readyToAdvance) return undefined;

    autoAdvanceTimerRef.current = setTimeout(() => {
      activateStepAt(activeStepIndex + 1);
    }, 1350);

    return () => clearTimeout(autoAdvanceTimerRef.current);
  }, [
    phase,
    autoAdvanceEnabled,
    activeStepIndex,
    packUnlockItems,
    stepFinishedTyping,
    signatureState,
    activateStepAt,
  ]);

  useEffect(() => {
    if (phase !== 'pasting' || !pack) return undefined;
    const t = setTimeout(() => {
      onStickPack?.(pack);
    }, 2450);
    return () => clearTimeout(t);
  }, [phase, pack, onStickPack]);

  const startOpening = () => {
    openingDoneRef.current = false;
    setPhase('opening');
    playWalkOfFamePackSound({
      onEnded: () => {
        if (!openingDoneRef.current) {
          openingDoneRef.current = true;
          enterRevealedDirectly();
        }
      },
    });
  };

  if (!pack || !pack.star) return null;

  const { star, packType, fromTier, toTier, extraStarsUnlocked } = pack;
  const resolvedToTier = toTier || star.statusTierKey || 'bronze';
  const toTheme = getThemeForTier(resolvedToTier);
  const effectiveFromTier =
    fromTier && fromTier !== 'cement' && fromTier !== 'carving' ? fromTier : null;
  const fromTheme = effectiveFromTier ? getThemeForTier(effectiveFromTier) : null;
  const isOverlayUpgrade = Boolean((packType === 'rarity_up' || star.isStuck) && effectiveFromTier);

  const currentItem = packUnlockItems[activeStepIndex] || packUnlockItems[0] || null;
  const activeRewardKey = currentItem?.key ?? null;
  const activeStepTheme = getThemeForTier(currentItem?.tierKey || resolvedToTier);

  const hasFinal90InPack = packUnlockItems.some((item) => item.key === 90);
  const is90Reached = unlockedKeys.includes(90);

  let cardSignatureMode = 'normal';
  if (hasFinal90InPack) {
    cardSignatureMode = is90Reached ? 'writing' : 'hidden';
  }

  const allMilestonesRevealed =
    activeStepIndex >= packUnlockItems.length - 1 &&
    (activeRewardKey === 90
      ? signatureState === 'done' && stepFinishedTyping
      : stepFinishedTyping);

  const headline =
    packType === 'rarity_up'
      ? 'A raridade da sua figurinha aumentou!'
      : packType === 'extra_star'
      ? 'Sua figurinha ganhou uma Estrela Bônus!'
      : 'Você tem uma nova figurinha!';

  const subHeadline =
    packType === 'rarity_up' && fromTheme
      ? `${fromTheme.icon} ${fromTheme.label} → ${toTheme.icon} ${toTheme.label}`
      : packType === 'extra_star'
      ? `Total agora: ${extraStarsUnlocked || star.extraStars} ★ extra(s) além do teto!`
      : `Figurinha #${String(star.albumNumber).padStart(3, '0')} (${toTheme.label})`;

  // Renderização aberta e solta no escuro (sem quadrados, sem cadeado, tudo automático!)
  const renderLooseAutoStage = () => {
    const key = activeRewardKey;
    const handleTyped = () => setStepFinishedTyping(true);

    if (key === 15) {
      return (
        <div
          key={`stage_${key}_${burstNonce}`}
          className="flex flex-col items-center md:items-start text-center md:text-left gap-3 rare-reveal-enter max-w-md"
        >
          <span className="text-[11px] font-mono font-black uppercase tracking-[0.24em] text-amber-300">
            ✨ VOCÊ DESBLOQUEOU A FRASE MARCANTE!
          </span>
          <div className="relative pl-1">
            <span className="text-4xl font-serif text-amber-400/50 leading-none select-none block -mb-3">
              “
            </span>
            <TypewriterTextBlock
              key={`${star.id}_15_${burstNonce}`}
              lines={[`${star.quote}”`]}
              speedMs={28}
              accentHex="#fbbf24"
              onComplete={handleTyped}
              className="text-lg sm:text-xl italic font-serif text-amber-100 leading-relaxed drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]"
            />
          </div>
        </div>
      );
    }

    if (key === 30) {
      return (
        <div
          key={`stage_${key}_${burstNonce}`}
          className="flex flex-col items-center md:items-start text-center md:text-left gap-3 rare-reveal-enter max-w-md"
        >
          <span className="text-[11px] font-mono font-black uppercase tracking-[0.24em] text-sky-200">
            🔍 VOCÊ DESBLOQUEOU A 1ª CURIOSIDADE!
          </span>
          <TypewriterTextBlock
            key={`${star.id}_30_${burstNonce}`}
            lines={[star.curiosities?.[0] || 'Curiosidade de bastidores liberada no álbum!']}
            speedMs={23}
            accentHex="#bae6fd"
            onComplete={handleTyped}
            className="text-sm sm:text-base font-medium text-zinc-100 leading-relaxed drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]"
          />
        </div>
      );
    }

    if (key === 45) {
      const skins = Array.isArray(star.skinOptions) ? star.skinOptions.slice(0, 5) : [];
      return (
        <div
          key={`stage_${key}_${burstNonce}`}
          className="flex flex-col items-center md:items-start text-center md:text-left gap-4 rare-reveal-enter max-w-md"
        >
          <span className="text-[11px] font-mono font-black uppercase tracking-[0.24em] text-emerald-300">
            🎨 VOCÊ DESBLOQUEOU 5 SKINS + FOTO PRÓPRIA!
          </span>
          {skins.length > 0 && (
            <div className="flex items-center justify-center md:justify-start py-1">
              {skins.map((sk, idx) => {
                const rot = (idx - (skins.length - 1) / 2) * 7;
                return (
                  <img
                    key={sk.id}
                    src={resolveWalkMediaUrl(sk.imageUrl)}
                    alt={sk.label}
                    style={{ transform: `rotate(${rot}deg)` }}
                    className={`w-14 h-20 sm:w-16 sm:h-24 rounded-xl object-cover object-top border-2 border-emerald-300/80 shadow-[0_12px_24px_rgba(0,0,0,0.85)] transition-transform hover:scale-110 hover:z-20 ${
                      idx > 0 ? '-ml-3' : ''
                    }`}
                  />
                );
              })}
            </div>
          )}
          <TypewriterTextBlock
            key={`${star.id}_45_${burstNonce}`}
            lines={['Escolha fotos de bastidores e revistas ou envie sua imagem do computador no dossiê.']}
            speedMs={22}
            accentHex="#34d399"
            onComplete={handleTyped}
            className="text-sm font-medium text-emerald-100/95 leading-relaxed"
          />
        </div>
      );
    }

    if (key === 60) {
      return (
        <div
          key={`stage_${key}_${burstNonce}`}
          className="flex flex-col items-center md:items-start text-center md:text-left gap-3 rare-reveal-enter max-w-md"
        >
          <span className="text-[11px] font-mono font-black uppercase tracking-[0.24em] text-yellow-300">
            ✨ VOCÊ DESBLOQUEOU AS CURIOSIDADES!
          </span>
          <TypewriterTextBlock
            key={`${star.id}_60_${burstNonce}`}
            lines={[
              star.curiosities?.[1] ? `• ${star.curiosities[1]}` : '• Segunda curiosidade liberada!',
              star.curiosities?.[2] ? `• ${star.curiosities[2]}` : '',
            ]}
            speedMs={22}
            accentHex="#fde047"
            onComplete={handleTyped}
            className="text-sm sm:text-[15px] font-medium text-zinc-100 leading-relaxed drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]"
          />
        </div>
      );
    }

    if (key === 75) {
      return (
        <div
          key={`stage_${key}_${burstNonce}`}
          className="flex flex-col items-center md:items-start text-center md:text-left gap-3 rare-reveal-enter max-w-md"
        >
          <span className="text-[11px] font-mono font-black uppercase tracking-[0.24em] text-cyan-300">
            🎞️ VOCÊ DESBLOQUEOU A LINHA DO TEMPO!
          </span>
          <FloatingTimelinePreview accentHex={activeStepTheme.accentHex} />
          <TypewriterTextBlock
            key={`${star.id}_75_${burstNonce}`}
            lines={[
              `A Linha do Tempo Cinemática (ordem assistida, lançamento e variação de notas) e o Raio-X das Décadas de ${star.name} agora estão abertos!`,
            ]}
            speedMs={21}
            accentHex="#22d3ee"
            onComplete={handleTyped}
            className="text-xs sm:text-sm font-medium text-cyan-50/95 leading-relaxed drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]"
          />
        </div>
      );
    }

    if (key === 90) {
      return (
        <div
          key={`stage_${key}_${burstNonce}`}
          className="flex flex-col items-center md:items-start text-center md:text-left gap-2 rare-reveal-enter max-w-md"
        >
          <span className="text-[11px] font-mono font-black uppercase tracking-[0.24em] text-sky-300">
            💎 VOCÊ DESBLOQUEOU A EDIÇÃO ASSINADA!
          </span>
          <SigningPenShowcase
            starName={star.name}
            accentHex={toTheme.accentHex}
            isDone={signatureState === 'done'}
          />
          <TypewriterTextBlock
            key={`${star.id}_90_note_${burstNonce}`}
            lines={[
              'Autógrafo gravado ao vivo! Personalize até 10 Auras por ★ e fixe sua Obra-Prima Favorita.',
            ]}
            speedMs={24}
            accentHex="#38bdf8"
            onComplete={handleTyped}
            className="text-xs sm:text-sm text-sky-100/90 leading-relaxed"
          />
        </div>
      );
    }

    return (
      <div
        key={`stage_extra_${burstNonce}`}
        className="flex flex-col items-center md:items-start text-center md:text-left gap-3 rare-reveal-enter max-w-md"
      >
        <span className="text-[11px] font-mono font-black uppercase tracking-[0.24em] text-yellow-300">
          ⭐ ESTRELA BÔNUS CONQUISTADA!
        </span>
        <TypewriterTextBlock
          key={`${star.id}_extra_${burstNonce}`}
          lines={[
            `Você ganhou +1★ além do teto e destravou uma nova cor de Aura para ${star.name}!`,
          ]}
          speedMs={23}
          accentHex="#facc15"
          onComplete={handleTyped}
          className="text-sm sm:text-base font-semibold text-yellow-100 leading-relaxed"
        />
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[9880] flex items-center justify-center p-4 sm:p-8 bg-black/92 backdrop-blur-2xl animate-fadeIn overflow-y-auto"
      onClick={handleClose}
    >
      {/* Luzes ambientes soltas sem nenhuma caixa */}
      <div
        className="fixed top-1/4 left-1/3 w-[460px] h-[460px] rounded-full blur-[120px] opacity-25 pointer-events-none"
        style={{ backgroundColor: activeStepTheme.accentHex || toTheme.accentHex }}
      />
      <div className="fixed bottom-1/4 right-1/3 w-[380px] h-[380px] rounded-full bg-amber-500/15 blur-[110px] pointer-events-none" />

      {/* Botão Fechar flutuando livre no canto */}
      <button
        type="button"
        onClick={handleClose}
        className="fixed top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white cursor-pointer z-40 transition-colors"
        title="Fechar"
      >
        <X className="w-5 h-5" />
      </button>

      <div
        className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center gap-6 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* FASE 1: PACOTINHO SECRETO SOLTO NO ESCURO */}
        {phase === 'sealed' && (
          <div className="flex flex-col items-center gap-6 animate-fadeIn">
            <span className="text-[11px] font-mono font-black uppercase tracking-[0.28em] text-amber-300 drop-shadow">
              🎁 PACOTINHO DA CALÇADA DA FAMA
            </span>

            <div
              onClick={startOpening}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && startOpening()}
              className="group relative w-56 aspect-[3/4] rounded-2xl p-[3px] cursor-pointer transition-transform hover:scale-105 active:scale-95"
              style={{
                background:
                  'linear-gradient(135deg, #fde047, #f59e0b, #fb7185, #38bdf8, #fde047)',
                boxShadow: '0 24px 70px rgba(245,158,11,0.38)',
              }}
            >
              <div className="w-full h-full rounded-[13px] bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 border border-amber-300/40 flex flex-col items-center justify-between p-4 relative overflow-hidden">
                <div
                  className="absolute -inset-y-8 w-20 pointer-events-none sticker-sheen-bar"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, rgba(254,249,195,0.6), transparent)',
                  }}
                />
                <div className="w-full flex items-center justify-between text-[10px] font-mono text-amber-300/90">
                  <span>CINE ÁLBUM</span>
                  <span>#???</span>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-amber-500/15 border-2 border-amber-400/60 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
                    <Gift className="w-10 h-10 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-wider text-amber-200">
                      Pacotinho Misterioso
                    </p>
                    <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">
                      🎁 Figurinha Secreta Lacrada
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-200 font-mono text-[10px] font-black shadow">
                      ⚡ XP surpresa ao abrir
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-zinc-400">
                  Toque para rasgar o lacre
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={startOpening}
              className="px-9 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-zinc-950 font-black text-sm shadow-[0_0_32px_rgba(251,191,36,0.45)] flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Abrir Pacote!</span>
            </button>
          </div>
        )}

        {/* FASE 2: GIRO 3D CONTÍNUO -> PARADA NÍTIDA -> FLASH "PLIN!" SINCRONIZADO AO SOM */}
        {phase === 'opening' && (
          <div className="py-6 flex flex-col items-center gap-6">
            <div className="relative flex items-center justify-center">
              <div
                className="absolute w-80 h-80 rounded-full blur-2xl pack-spin-halo"
                style={{
                  background: `radial-gradient(circle, ${toTheme.accentHex}, transparent 70%)`,
                }}
              />
              <div
                className="absolute w-72 h-72 rounded-full border-2 pointer-events-none pack-plin-ring"
                style={{
                  borderColor: toTheme.accentHex,
                  boxShadow: `0 0 32px ${toTheme.accentHex}`,
                }}
              />
              <div className="w-56 sticker-pack-spin relative z-10">
                <WalkOfFameStickerCard
                  star={star}
                  isStuck
                  forceUnlocked
                  signatureMode={hasFinal90InPack ? 'hidden' : 'normal'}
                  overrideTierKey={resolvedToTier}
                  overridePct={pack.toPct || star.percentage}
                  overrideExtraStars={extraStarsUnlocked ?? star.extraStars}
                />
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-20">
                  <div
                    className="w-2/3 h-full pack-plin-sheen"
                    style={{
                      background:
                        'linear-gradient(105deg, transparent 10%, rgba(255,255,255,0.85) 50%, transparent 90%)',
                    }}
                  />
                </div>
              </div>
            </div>
            <p className="text-sm font-black uppercase tracking-[0.26em] text-amber-300 animate-pulse">
              ✨ Revelando figurinha...
            </p>
          </div>
        )}

        {/* FASE 3: DESBLOQUEIO AUTOMÁTICO DIRETO NO ESCURO + MÁQUINA DE ESCREVER / ASSINATURA AO VIVO */}
        {phase === 'revealed' && (
          <div className="w-full flex flex-col items-center gap-6 animate-fadeIn">
            {/* Cabeçalho solto */}
            <div className="flex flex-col items-center gap-1.5">
              <span
                className="text-[11px] font-mono font-black uppercase tracking-[0.26em]"
                style={{ color: toTheme.accentHex }}
              >
                {packType === 'rarity_up'
                  ? '⚡ Upgrade de Raridade'
                  : packType === 'extra_star'
                  ? '⭐ Estrela Extra'
                  : '🎉 Nova Descoberta'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                {headline}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-amber-200/90">{subHeadline}</p>

              {/* Trilha minimalista de marcos (clicável apenas se usuário quiser rever algum marco já revelado) */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
                {roadmapWithState.map((step, i) => {
                  const packIdx = packUnlockItems.findIndex((p) => p.key === step.key);
                  const unlockedNow = unlockedKeys.includes(step.key);
                  const isCurrent = currentItem?.key === step.key;
                  const done = unlockedNow || step.isAlreadyUnlocked;
                  const clickable = unlockedNow && packIdx >= 0;

                  return (
                    <React.Fragment key={step.key}>
                      {i > 0 && (
                        <span
                          className={`w-4 sm:w-5 h-[2px] rounded-full ${
                            done ? 'bg-emerald-400/70' : 'bg-white/15'
                          }`}
                        />
                      )}
                      <button
                        type="button"
                        disabled={!clickable}
                        onClick={() => clickable && activateStepAt(packIdx, { stopAuto: true })}
                        title={step.short}
                        className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full transition-all ${
                          isCurrent
                            ? 'text-zinc-950 bg-amber-300 scale-110 shadow-lg'
                            : unlockedNow
                            ? 'text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/35 cursor-pointer'
                            : step.isAlreadyUnlocked
                            ? 'text-zinc-400/80'
                            : 'text-zinc-600'
                        }`}
                      >
                        {step.pct}%
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Palco Aberto: Carta Flutuando à Esquerda + Recompensa Automática Solta à Direita */}
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 py-2">
              <div className="relative w-52 sm:w-56 shrink-0">
                <div
                  className="absolute -inset-6 rounded-full blur-2xl opacity-45 pointer-events-none"
                  style={{ background: activeStepTheme.accentHex || toTheme.accentHex }}
                />
                <div className="relative z-10">
                  <WalkOfFameStickerCard
                    star={star}
                    isStuck
                    forceUnlocked
                    signatureMode={cardSignatureMode}
                    overrideTierKey={resolvedToTier}
                    overrideUnderlayTierKey={isOverlayUpgrade ? effectiveFromTier : null}
                    overridePct={pack.toPct || star.percentage}
                    overrideExtraStars={extraStarsUnlocked ?? star.extraStars}
                  />
                </div>
              </div>

              <div className="relative flex-1 flex flex-col items-center md:items-start justify-center min-h-[200px]">
                {/* Faísca sutil flutuante a cada desbloqueio automático */}
                <div className="absolute left-1/2 md:left-12 top-8">
                  <RareLightBurst
                    key={burstNonce}
                    accentHex={activeStepTheme.accentHex || toTheme.accentHex}
                  />
                </div>

                {renderLooseAutoStage()}
              </div>
            </div>

            {/* Ações finais flutuantes */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {allMilestonesRevealed ? (
                <button
                  type="button"
                  onClick={() => setPhase('pasting')}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-zinc-950 font-black text-sm shadow-[0_0_32px_rgba(251,191,36,0.45)] flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 animate-fadeIn"
                >
                  {isOverlayUpgrade ? (
                    <Layers className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>
                    {isOverlayUpgrade
                      ? 'Colar nova edição por cima!'
                      : 'Colar Figurinha no Álbum!'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setPhase('pasting')}
                  className="px-6 py-2.5 rounded-full bg-amber-400/20 hover:bg-amber-400/35 border border-amber-300/60 text-amber-200 font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {signatureState === 'writing'
                      ? '✍️ Assinando... (Colar agora)'
                      : isOverlayUpgrade
                      ? 'Colar nova edição agora'
                      : 'Colar Figurinha agora'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onSaveForLater?.(pack)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Deixar para colar no Álbum
              </button>
            </div>
          </div>
        )}

        {/* FASE 4: COLANDO NO ÁLBUM COM ROLO ADESIVO DEVAGAR (2.4s) */}
        {phase === 'pasting' && (
          <div className="py-5 flex flex-col items-center gap-5">
            <span className="text-[11px] font-mono font-black uppercase tracking-[0.26em] text-emerald-300">
              {isOverlayUpgrade ? '⚡ Colando por cima da antiga...' : '🧻 Desenrolando e alisando no Álbum...'}
            </span>

            <div className="relative w-52 aspect-[3/4]">
              {!isOverlayUpgrade && (
                <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-amber-400/60 bg-zinc-900/50 flex items-center justify-center text-xs font-mono text-amber-300/70">
                  SLOT #{String(star.albumNumber).padStart(3, '0')}
                </div>
              )}

              <WalkOfFameStickerCard
                star={star}
                isStuck
                justStuck
                forceUnlocked
                overrideTierKey={resolvedToTier}
                overrideUnderlayTierKey={isOverlayUpgrade ? effectiveFromTier : null}
                overridePct={pack.toPct || star.percentage}
                overrideExtraStars={extraStarsUnlocked ?? star.extraStars}
              />
            </div>

            <p className="text-xs font-bold text-zinc-300">
              {isOverlayUpgrade && fromTheme
                ? `Alisando ${toTheme.label} por cima de ${fromTheme.label}...`
                : `Colando figurinha #${String(star.albumNumber).padStart(3, '0')}...`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
