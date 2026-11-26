import React, { useEffect, useId, useRef, useState } from 'react';
import {
  SECRET_SPECIAL_SUSPENSE_BACK,
  SPECIAL_RARITY_META,
  getSecretCardUrl,
  getSecretPlayingCardMeta,
  getSecretSuitBackImage,
  getSpecialCardArtGallery,
  getSpecialCardDisplayMeta,
  resolveSpecialCardPrimaryUrl,
} from '../utils/secretSpecialCardsCatalog';
import {
  playChimeraTarotRarityRevealSound,
  playSecretCardFlipSound,
  playSecretFireCracklingSound,
  stopAllTrophyAudio,
  stopSecretFireCracklingSound,
} from '../utils/trophyAudio';

const DIFFICULTY_META = {
  common: {
    label: 'Comum • Paus',
    suit: '♣',
    rank: 'C',
    badgeClass: 'bg-emerald-500/20 border-emerald-400/55 text-emerald-200',
    ringGradient: 'conic-gradient(from 0deg, #10b981, #34d399, transparent 45%, #10b981)',
    tarotRarity: 'common',
    panelAccent: 'border-emerald-400/35 bg-emerald-950/30',
  },
  medium: {
    label: 'Médio • Ouros',
    suit: '♦',
    rank: 'M',
    badgeClass: 'bg-sky-500/20 border-sky-400/55 text-sky-200',
    ringGradient: 'conic-gradient(from 0deg, #38bdf8, #818cf8, transparent 45%, #38bdf8)',
    tarotRarity: 'rare',
    panelAccent: 'border-sky-400/35 bg-sky-950/30',
  },
  hard: {
    label: 'Difícil • Espadas',
    suit: '♠',
    rank: 'D',
    badgeClass: 'bg-purple-500/25 border-purple-400/55 text-purple-200',
    ringGradient: 'conic-gradient(from 0deg, #a855f7, #ec4899, transparent 45%, #a855f7)',
    tarotRarity: 'rare',
    panelAccent: 'border-purple-400/35 bg-purple-950/30',
  },
  very_hard: {
    label: 'Muito Difícil • Copas',
    suit: '♥',
    rank: 'MD',
    badgeClass: 'bg-amber-500/25 border-amber-400/65 text-amber-200',
    ringGradient: 'conic-gradient(from 0deg, #f59e0b, #fbbf24, transparent 45%, #f59e0b)',
    tarotRarity: 'legendary',
    panelAccent: 'border-amber-400/40 bg-amber-950/30',
  },
  exotic: {
    label: 'Exótico • Coringa Prisma',
    suit: '★',
    rank: 'EX',
    badgeClass: 'bg-gradient-to-r from-rose-500/30 via-fuchsia-500/30 to-amber-500/30 border-rose-300/75 text-rose-100',
    ringGradient: 'conic-gradient(from 0deg, #f43f5e, #e879f9, #fbbf24, transparent 45%, #f43f5e)',
    tarotRarity: 'legendary',
    panelAccent: 'border-rose-400/45 bg-fuchsia-950/35',
  },
};

const MILESTONE_SYSTEM_PILL = {
  trophy: 'border-amber-400/40 bg-amber-500/15 text-amber-200',
  world_challenge: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200',
  time_machine: 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200',
  universe: 'border-purple-400/40 bg-purple-500/15 text-purple-200',
  walk_of_fame: 'border-yellow-400/45 bg-yellow-500/15 text-yellow-100',
};

export default function SecretDrawCardRevealModal({
  session,
  onClose,
  onOpenChainedSpecial,
  specialCardsCatalog = null,
}) {
  const rawReactId = useId();
  const svgUid = rawReactId.replace(/[^a-zA-Z0-9_-]/g, '');
  const [stage, setStage] = useState('burning'); // Movie: 'burning'|'vibrating'|'flipped' ; Special: 'burning'(bar)->'burning'(burn)->'flipped'(revealed)
  const [mysteryStep, setMysteryStep] = useState(0); // Movie: 0=Back/Flip -> 1=Title -> 2=Countries/Genres -> 3=Milestones | Special: 3=Result
  const [coinSettled, setCoinSettled] = useState(false);
  const [sealChargePct, setSealChargePct] = useState(0);
  const [burnProgress, setBurnProgress] = useState(0);
  const [selectedArtIdx, setSelectedArtIdx] = useState(0);
  const timersRef = useRef([]);
  const rafRef = useRef(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const sessionKey = session?.key || null;

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  useEffect(() => {
    const handleEsc = (ev) => {
      if (ev.key === 'Escape') {
        clearAllTimers();
        stopAllTrophyAudio();
        onClose?.(sessionRef.current);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    const activeSession = sessionRef.current;
    if (!activeSession || !sessionKey) return undefined;
    clearAllTimers();
    setStage('burning');
    setMysteryStep(0);
    setCoinSettled(false);
    setSealChargePct(0);
    setBurnProgress(0);
    setSelectedArtIdx(0);

    if (activeSession.mode === 'movie') {
      // Cartas normais (não especiais): apenas um som simples de virar carta, independente da dificuldade
      const t1 = setTimeout(() => {
        setStage('vibrating');
      }, 220);
      const t2 = setTimeout(() => {
        setStage('flipped');
        playSecretCardFlipSound();
      }, 480);
      const t3 = setTimeout(() => {
        setMysteryStep(1);
      }, 920);
      const t4 = setTimeout(() => {
        setMysteryStep(2);
      }, 1360);
      const t5 = setTimeout(() => {
        setMysteryStep(3);
      }, 1800);

      timersRef.current.push(t1, t2, t3, t4, t5);
    } else if (activeSession.mode === 'special') {
      const event = activeSession.outcome?.specialEvent;
      const rarity = event?.rarity || 'rare';
      const isTwoFace = event?.id === 'duas_caras';
      const coinFace = event?.outcomeData?.coinFace;
      let revealSoundKey = SPECIAL_RARITY_META[rarity]?.soundKey || 'rare';
      if (rarity === 'bet') {
        revealSoundKey = coinFace === 'tails' ? 'cursed' : coinFace === 'heads' ? 'legendary' : 'rare';
      }

      // Cronologia Especial balanceada para suspense misterioso:
      // 0ms -> 950ms: Barrinha carrega até 100% (suspense crescente)
      // 950ms -> 2900ms: Selo queima do centro para fora com som fire-crackling.mp3
      // 2900ms: Arte especial revelada + som da carta especial (exceto Rei Duas-Caras que espera a moeda!)
      const BAR_MS = 950;
      const BURN_MS = 1950;
      const startAt = performance.now();
      let fireStarted = false;
      let burnFinished = false;

      const tickBurn = (now) => {
        const elapsed = now - startAt;
        if (elapsed < BAR_MS) {
          setSealChargePct((elapsed / BAR_MS) * 100);
          rafRef.current = requestAnimationFrame(tickBurn);
          return;
        }

        setSealChargePct(100);
        if (!fireStarted) {
          fireStarted = true;
          if (!isTwoFace) {
            playSecretFireCracklingSound();
          }
        }

        const burnElapsed = elapsed - BAR_MS;
        const linearT = Math.min(1, burnElapsed / BURN_MS);
        // Curva suave acelerando do meio para as bordas
        const easedBurn =
          linearT < 0.5
            ? 2 * linearT * linearT
            : 1 - Math.pow(-2 * linearT + 2, 2) / 2;
        setBurnProgress(easedBurn);

        if (linearT < 1) {
          rafRef.current = requestAnimationFrame(tickBurn);
        } else if (!burnFinished) {
          burnFinished = true;
          rafRef.current = null;
          stopSecretFireCracklingSound();
          setStage('flipped');
          setMysteryStep(1);
          if (!isTwoFace || !coinFace) {
            playChimeraTarotRarityRevealSound(revealSoundKey);
          }

          const tStep2 = setTimeout(() => {
            setMysteryStep(2);
            if (isTwoFace && coinFace) {
              const tCoin = setTimeout(() => {
                setCoinSettled(true);
                setMysteryStep(3);
                playChimeraTarotRarityRevealSound(coinFace === 'heads' ? 'legendary' : 'cursed');
              }, 1200);
              timersRef.current.push(tCoin);
            } else {
              setCoinSettled(true);
            }
          }, 420);

          const postTimers = [tStep2];
          if (!(isTwoFace && coinFace)) {
            const tStep3 = setTimeout(() => {
              setMysteryStep(3);
            }, 820);
            postTimers.push(tStep3);
          }
          timersRef.current.push(...postTimers);
        }
      };

      rafRef.current = requestAnimationFrame(tickBurn);
    }

    return () => {
      clearAllTimers();
      stopSecretFireCracklingSound();
    };
  }, [sessionKey]);

  if (!session) return null;

  const isMovie = session.mode === 'movie';
  const card = session.card || {};
  const outcome = session.outcome || {};
  const specialEvent = outcome.specialEvent || card.specialEvent || {};

  const skipReveal = () => {
    clearAllTimers();
    stopSecretFireCracklingSound();
    if (!isMovie && specialEvent?.id === 'duas_caras' && !coinSettled) {
      const cf = specialEvent?.outcomeData?.coinFace;
      playChimeraTarotRarityRevealSound(cf === 'heads' ? 'legendary' : cf === 'tails' ? 'cursed' : 'rare');
    } else if (!isMovie && stage !== 'flipped') {
      const rKey = SPECIAL_RARITY_META[specialEvent?.rarity || 'rare']?.soundKey || 'rare';
      playChimeraTarotRarityRevealSound(rKey);
    }
    setSealChargePct(100);
    setBurnProgress(1);
    setStage('flipped');
    setMysteryStep(3);
    setCoinSettled(true);
  };

  const handleClose = () => {
    clearAllTimers();
    stopAllTrophyAudio();
    onClose?.(session);
  };

  // Config visual conforme modo
  const movieDiff = card.difficulty || 'common';
  const movieMeta = DIFFICULTY_META[movieDiff] || DIFFICULTY_META.common;
  const specRarity = specialEvent.rarity || 'rare';
  const specMeta = SPECIAL_RARITY_META[specRarity] || SPECIAL_RARITY_META.rare;
  const activeRingGradient = isMovie ? movieMeta.ringGradient : specMeta.ringGradient;
  const activePanelAccent = isMovie ? movieMeta.panelAccent : specMeta.panelAccent;

  const isFlipped = stage === 'flipped';
  // Mantém a vibração neutra enquanto estiver fechada para não dar spoiler de maldição antes do flip!
  const isCursedVibrating = !isMovie && isFlipped && specRarity === 'cursed' && stage === 'vibrating';
  const isNormalVibrating = stage === 'vibrating' && !isCursedVibrating;

  const specialCoinFace = specialEvent?.outcomeData?.coinFace || null;
  const pulledMovie = outcome?.pulledMoviePick || null;
  const chainedOutcome = outcome?.chainedOutcome || null;
  const cardIsGold = card?.rewardMode === 'gold';
  const cardRewardText = cardIsGold ? `+${card.goldReward || 0} 🪙` : `+${card.xpReward || 0} XP`;
  const deckCardMeta = getSecretPlayingCardMeta(card, session.roundId || outcome?.roundId || 1);
  const specialGallery = !isMovie ? getSpecialCardArtGallery(specialEvent, specialCardsCatalog) : [];
  const safeArtIdx = Math.min(selectedArtIdx, Math.max(0, specialGallery.length - 1));
  const displayedSpecialUrl =
    specialGallery[safeArtIdx]?.url ||
    resolveSpecialCardPrimaryUrl(specialEvent, specialCardsCatalog) ||
    specialEvent?.imageUrl ||
    '';
  const specialDisplayMeta = !isMovie
    ? getSpecialCardDisplayMeta(specialEvent, specialCardsCatalog)
    : null;
  const effectiveSpecialOutcomeKind =
    specRarity === 'cursed' || specialCoinFace === 'tails'
      ? 'cursed'
      : specRarity === 'bet' && !specialCoinFace
        ? 'bet'
        : 'blessing';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && mysteryStep >= 3) {
          handleClose();
        }
      }}
    >
      {/* Botão Fechar Flutuante */}
      <button
        type="button"
        onClick={handleClose}
        title="Fechar janela (Esc)"
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/85 hover:text-white flex items-center justify-center text-base transition shadow-xl"
      >
        ✕
      </button>

      {/* Palco Aberto sem moldura/card externo — foco total na carta gigante */}
      <div className="relative w-full max-w-6xl flex flex-col items-center gap-6 my-auto">
        {/* Banner Flutuante Superior */}
        <div className="relative z-10 text-center">
          {!isMovie ? (
            <div className="inline-flex flex-col items-center gap-1.5">
              <div
                className={`secret-burn-banner px-5 py-2 rounded-full border text-xs sm:text-base font-black tracking-wide uppercase ${
                  !isFlipped
                    ? 'border-amber-400/50 bg-[#141118]/90 text-amber-200 shadow-[0_0_28px_rgba(245,158,11,0.35)]'
                    : effectiveSpecialOutcomeKind === 'cursed'
                      ? 'border-rose-500/65 bg-gradient-to-r from-zinc-950 via-rose-950/85 to-zinc-950 text-rose-200 shadow-[0_0_32px_rgba(244,63,94,0.45)]'
                      : effectiveSpecialOutcomeKind === 'bet'
                        ? 'border-amber-400/65 bg-gradient-to-r from-zinc-950 via-amber-950/70 to-zinc-950 text-amber-200 shadow-[0_0_28px_rgba(245,158,11,0.45)]'
                        : 'border-emerald-400/55 bg-gradient-to-r from-zinc-950 via-emerald-950/80 to-zinc-950 text-emerald-200 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                }`}
              >
                {!isFlipped
                  ? '🃏 O Arlequim deu uma carta especial'
                  : effectiveSpecialOutcomeKind === 'cursed'
                    ? '🩸 Maldição do Arlequim Revelada'
                    : specialCoinFace === 'heads'
                      ? '🪙 Aposta Vencida — Bênção do Arlequim'
                      : '✦ Bênção do Arlequim em Cena'}
              </div>
              <p className="text-xs sm:text-sm text-zinc-300/90 drop-shadow">
                {!isFlipped
                  ? 'Agora é só saber se é bênção ou maldição...'
                  : `${specMeta.icon} ${specialDisplayMeta?.title} • ${specMeta.label}`}
              </p>
            </div>
          ) : (
            <div className="inline-flex flex-col items-center gap-1.5">
              <div className={`px-4 py-1 rounded-full border text-xs sm:text-sm font-extrabold tracking-wide uppercase ${movieMeta.badgeClass}`}>
                {!isFlipped
                  ? `${movieMeta.suit} Carta Secreta • ${movieMeta.label}`
                  : `${deckCardMeta.rank} ${deckCardMeta.symbol} • ${deckCardMeta.fullName} (${movieMeta.label})`}
              </div>
              <p className="text-xs sm:text-sm text-white/70 drop-shadow">
                {!isFlipped
                  ? 'O Arlequim está virando a carta...'
                  : mysteryStep < 3
                    ? 'Decifrando pistas e marcos do filme...'
                    : `O Arlequim revelou a sessão: "${card.resolved?.title || card.planilha?.rawTitle}"`}
              </p>
            </div>
          )}
        </div>

        {/* Corpo Central Aberto: Carta Gigante (Esquerda) + Detalhes Flutuantes (Direita) */}
        <div className="relative z-10 w-full flex flex-col lg:flex-row items-center lg:items-center justify-center gap-7 sm:gap-10">
          {/* COLUNA DA CARTA 3D GIGANTE */}
          <div className="relative flex flex-col items-center justify-center shrink-0">
            {/* Bloom neon externo atrás da cena 3D (z-0 para nunca cobrir a carta) */}
            <div
              className={`pointer-events-none absolute -inset-5 rounded-[36px] blur-2xl opacity-75 z-0 ${
                !isMovie && !isFlipped ? 'secret-burn-aura' : ''
              }`}
              style={{
                background: !isMovie && !isFlipped
                  ? 'radial-gradient(circle, rgba(249,115,22,0.55), rgba(220,38,38,0.28), transparent 72%)'
                  : isMovie
                  ? 'radial-gradient(circle, rgba(168,85,247,0.35), rgba(16,185,129,0.2), transparent 72%)'
                  : `radial-gradient(circle, ${specMeta.auraColor}, transparent 72%)`,
              }}
            />

            <div
              onClick={() => {
                if (mysteryStep < 3) skipReveal();
              }}
              className={`secret-card-scene relative z-10 w-[285px] sm:w-[345px] md:w-[385px] aspect-[2/3] cursor-pointer ${
                isMovie && isNormalVibrating ? 'chimera-spell-vibrate' : ''
              }`}
              title={mysteryStep < 3 ? 'Clique para revelar na hora' : undefined}
            >
              {isMovie ? (
              <div
                className={`secret-card-inner rounded-[22px] ${
                  isFlipped ? 'is-flipped secret-mode-prism' : ''
                }`}
              >
                {/* VERSO GIGANTE (APENAS FILMES NORMAIS) */}
                <div className="secret-card-face secret-card-face-back rounded-[22px] p-[3.5px] overflow-hidden bg-zinc-950 shadow-[0_24px_65px_rgba(0,0,0,0.9)]">
                  <div
                    className="chimera-neon-orbit-fast pointer-events-none absolute left-1/2 top-1/2 w-[180%] aspect-square"
                    style={{ background: activeRingGradient }}
                  />
                  <div className="relative z-10 w-full h-full rounded-[19px] overflow-hidden bg-[#090710]">
                    <img
                      src={getSecretSuitBackImage(movieDiff)}
                      alt={`Verso ${movieMeta.label}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/92 via-black/55 to-transparent text-center">
                      <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-white/90">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/75 border border-white/20">
                          {movieMeta.rank} {movieMeta.suit}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full border ${
                            cardIsGold
                              ? 'bg-amber-400/30 border-amber-300/70 text-amber-200'
                              : 'bg-amber-500/25 border-amber-300/45 text-amber-200'
                          }`}
                        >
                          {cardRewardText}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FRENTE GIGANTE (ESTÉTICA DE CARTA DE BARALHO NO FILME NORMAL) */}
                <div className="secret-card-face secret-card-face-front rounded-[22px] p-[3.5px] overflow-hidden bg-zinc-950 shadow-[0_24px_75px_rgba(0,0,0,0.95)]">
                  <div
                    className="chimera-neon-orbit pointer-events-none absolute left-1/2 top-1/2 w-[180%] aspect-square"
                    style={{ background: activeRingGradient }}
                  />
                  <div className="relative z-10 w-full h-full rounded-[19px] overflow-hidden bg-[#0d0b14]">
                    {/* MOLDURA DE CARTA DE BARALHO PARA FILMES NORMAIS (Ex: 7 ♥, 10 ♦, Q ♠) */}
                    <div className="w-full h-full bg-gradient-to-b from-[#171226] via-[#0e0b16] to-[#171226] p-2.5 sm:p-3 flex flex-col">
                      <div className="relative flex-1 rounded-xl border border-amber-200/35 bg-black/35 p-2 sm:p-2.5 flex flex-col justify-between overflow-hidden">
                        {/* Cantos Ornamentais Discretos */}
                        <div className="pointer-events-none absolute inset-1.5 rounded-lg border border-amber-200/15" />

                        {/* Cabeçalho da Carta: Valor/Naipe Esquerdo + +XP Direito */}
                        <div className="relative z-10 flex items-start justify-between gap-2">
                          <div className="flex flex-col items-center leading-none px-1.5 py-1 rounded-lg bg-black/75 border border-amber-200/25 shadow">
                            <span className={`text-xl sm:text-2xl font-black font-serif ${deckCardMeta.accentText}`}>
                              {deckCardMeta.rank}
                            </span>
                            <span className={`text-base sm:text-lg leading-none ${deckCardMeta.accentText}`}>
                              {deckCardMeta.symbol}
                            </span>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-full border text-xs sm:text-sm font-black shadow ${
                              cardIsGold
                                ? 'border-amber-300/80 bg-amber-500/25 text-amber-200'
                                : 'border-amber-300/60 bg-black/80 text-amber-200'
                            }`}
                          >
                            {cardRewardText}
                          </span>
                        </div>

                        {/* Quadro Central com Pôster do Filme */}
                        <div className="relative z-10 flex-1 my-2 mx-2.5 rounded-xl overflow-hidden border-2 border-amber-200/45 shadow-[0_8px_28px_rgba(0,0,0,0.85)] bg-zinc-900">
                          {card.resolved?.posterUrl ? (
                            <img
                              src={card.resolved.posterUrl}
                              alt={card.resolved?.title || 'Pôster do Filme'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-zinc-800 to-zinc-950">
                              <span className="text-5xl mb-2">🎬</span>
                              <span className="text-sm font-bold text-white">
                                {card.resolved?.title || card.planilha?.rawTitle}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Rodapé da Carta: Título do Naipe + Valor/Naipe Invertido */}
                        <div className="relative z-10 flex items-end justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-black/75 border border-white/15 text-[10px] sm:text-xs font-extrabold text-amber-100/90 truncate">
                            {deckCardMeta.fullName} • {movieMeta.rank}
                          </span>

                          <div className="flex flex-col items-center leading-none rotate-180 px-1.5 py-1 rounded-lg bg-black/75 border border-amber-200/25 shadow shrink-0">
                            <span className={`text-xl sm:text-2xl font-black font-serif ${deckCardMeta.accentText}`}>
                              {deckCardMeta.rank}
                            </span>
                            <span className={`text-base sm:text-lg leading-none ${deckCardMeta.accentText}`}>
                              {deckCardMeta.symbol}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ) : (
              /* CARTA ESPECIAL: QUEIMA DE DENTRO PARA FORA (SEM GIRAR) */
              <div className="relative w-full h-full rounded-[22px] p-[3.5px] overflow-hidden bg-zinc-950 shadow-[0_24px_75px_rgba(0,0,0,0.95)]">
                <div
                  className="chimera-neon-orbit-fast pointer-events-none absolute left-1/2 top-1/2 w-[180%] aspect-square"
                  style={{
                    background: !isFlipped
                      ? 'conic-gradient(from 0deg, #f97316, #fbbf24, #ef4444, transparent 45%, #f97316)'
                      : activeRingGradient,
                  }}
                />
                <div className="relative z-10 w-full h-full rounded-[19px] overflow-hidden bg-[#090710]">
                  {/* Arte final da Carta Especial esperando por baixo do selo */}
                  <img
                    src={getSecretCardUrl(displayedSpecialUrl)}
                    alt={
                      isFlipped
                        ? specialDisplayMeta?.title || specialEvent.title || 'Carta Especial'
                        : 'Carta Especial Oculta'
                    }
                    className={`w-full h-full object-cover ${
                      specRarity === 'cursed' && safeArtIdx === 0 ? 'bg-zinc-950' : 'bg-white'
                    }`}
                  />

                  {isFlipped && (
                    <>
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 secret-mystery-step">
                        <span className={`px-2.5 py-0.5 rounded-md border text-[11px] font-extrabold backdrop-blur-sm ${specMeta.badgeClass}`}>
                          {specMeta.icon} {specRarity.toUpperCase()}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-black/80 border border-white/20 text-[11px] font-bold text-white/95 truncate">
                          {specialEvent.shortTag}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Camada Superior do Selo que Queima Radialmente de Dentro para Fora */}
                  {!isFlipped && burnProgress < 1 && (() => {
                    const burnRadius = burnProgress * 235;
                    const filterId = `burnEdge_${svgUid}`;
                    const maskId = `burnMask_${svgUid}`;
                    const strokeGradId = `flameGrad_${svgUid}`;
                    return (
                      <div className="absolute inset-0 z-20 pointer-events-none">
                        <svg
                          viewBox="0 0 200 300"
                          preserveAspectRatio="none"
                          className="w-full h-full block"
                        >
                          <defs>
                            <filter id={filterId} x="-25%" y="-25%" width="150%" height="150%">
                              <feTurbulence
                                type="fractalNoise"
                                baseFrequency="0.045"
                                numOctaves="3"
                                seed="11"
                                result="noise"
                              />
                              <feDisplacementMap
                                in="SourceGraphic"
                                in2="noise"
                                scale="24"
                                xChannelSelector="R"
                                yChannelSelector="G"
                              />
                            </filter>
                            <mask id={maskId}>
                              <rect x="-40" y="-40" width="280" height="380" fill="white" />
                              {burnProgress > 0 && (
                                <circle
                                  cx="100"
                                  cy="150"
                                  r={burnRadius}
                                  fill="black"
                                  filter={`url(#${filterId})`}
                                />
                              )}
                            </mask>
                            <linearGradient id={strokeGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#fef08a" />
                              <stop offset="50%" stopColor="#f97316" />
                              <stop offset="100%" stopColor="#dc2626" />
                            </linearGradient>
                          </defs>

                          {/* Verso especial coberto com máscara radial queimando */}
                          <image
                            href={SECRET_SPECIAL_SUSPENSE_BACK}
                            x="0"
                            y="0"
                            width="200"
                            height="300"
                            preserveAspectRatio="xMidYMid slice"
                            mask={`url(#${maskId})`}
                          />

                          {/* Faisca incandescente central e borda em chamas comendo o papel */}
                          {burnProgress > 0 && (
                            <>
                              {burnProgress < 0.22 && (
                                <circle
                                  cx="100"
                                  cy="150"
                                  r={Math.max(4, burnRadius * 0.9)}
                                  fill="#fb923c"
                                  opacity={1 - burnProgress * 3.5}
                                  filter={`url(#${filterId})`}
                                />
                              )}
                              <circle
                                cx="100"
                                cy="150"
                                r={Math.max(2, burnRadius + 3)}
                                fill="none"
                                stroke="#2c0b04"
                                strokeWidth="14"
                                opacity="0.9"
                                filter={`url(#${filterId})`}
                              />
                              <circle
                                cx="100"
                                cy="150"
                                r={Math.max(2, burnRadius + 1)}
                                fill="none"
                                stroke={`url(#${strokeGradId})`}
                                strokeWidth="8.5"
                                filter={`url(#${filterId})`}
                              />
                              <circle
                                cx="100"
                                cy="150"
                                r={Math.max(1.5, burnRadius)}
                                fill="none"
                                stroke="#fef9c3"
                                strokeWidth="2.5"
                                opacity={Math.max(0.25, 1 - burnProgress * 0.6)}
                                filter={`url(#${filterId})`}
                              />
                            </>
                          )}
                        </svg>

                        {/* Tag na base desaparecendo conforme a barra termina */}
                        <div
                          className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/45 to-transparent text-center transition-opacity duration-300"
                          style={{ opacity: Math.max(0, 1 - burnProgress * 2.2) }}
                        >
                          <span className="inline-block px-3 py-1 rounded-full bg-orange-950/85 border border-orange-400/65 text-xs font-black text-amber-200">
                            🔥 ???
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
              )}
            </div>

            {mysteryStep < 3 && (
              <button
                type="button"
                onClick={skipReveal}
                className="mt-3 text-xs text-white/65 hover:text-white underline underline-offset-2 transition cursor-pointer"
              >
                ⏭ Pular animação e revelar tudo
              </button>
            )}

            {/* Seletor discreto para espiar outras artes da carta (alternativas / clássicas) */}
            {!isMovie && isFlipped && specialGallery.length > 1 && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-3 flex flex-wrap items-center justify-center gap-1 px-2.5 py-1.5 rounded-full bg-zinc-950/90 border border-white/15 shadow-lg max-w-[360px]"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
                  Outras artes:
                </span>
                {specialGallery.map((art, aIdx) => (
                  <button
                    key={art.url}
                    type="button"
                    onClick={() => setSelectedArtIdx(aIdx)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                      safeArtIdx === aIdx
                        ? art.kind === 'classic'
                          ? 'bg-amber-400/25 text-amber-200 border border-amber-300/60'
                          : 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/60'
                        : 'bg-white/5 text-zinc-400 hover:text-zinc-200 border border-transparent'
                    }`}
                    title={`Visualizar arte: ${art.label}`}
                  >
                    {art.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLUNA DIREITA: PROGRESSÃO MISTERIOSA OU RESULTADO ESPECIAL (PAINÉIS SOLTOS NO PALCO) */}
          <div className="flex-1 w-full max-w-lg flex flex-col justify-center min-w-0 gap-4">
            {isMovie ? (
              <div className="space-y-3.5">
                {/* Passo 1: Título & Ano */}
                <div
                  className={`rounded-2xl border p-4 transition-all duration-300 ${
                    mysteryStep >= 1
                      ? `${activePanelAccent} secret-mystery-step`
                      : 'border-white/8 bg-white/[0.02] opacity-40'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/55 mb-1">
                    Pista 1 • Obra Sorteada
                  </div>
                  {mysteryStep >= 1 ? (
                    <>
                      <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                        {card.resolved?.title || card.planilha?.rawTitle}{' '}
                        {card.resolved?.releaseYear ? (
                          <span className="text-base font-bold text-white/60">
                            ({card.resolved.releaseYear})
                          </span>
                        ) : null}
                      </h3>
                      {card.resolved?.originalTitle &&
                        card.resolved.originalTitle !== card.resolved.title && (
                          <p className="text-xs text-white/55 italic mt-0.5">
                            Original: {card.resolved.originalTitle}
                          </p>
                        )}
                      {card.resolved?.redirectedFromSaga && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/35 text-[11px] text-amber-200">
                          🪄 Franquia redirecionada para o Capítulo {card.resolved.redirectedFromSaga.redirectedOrder}/{card.resolved.redirectedFromSaga.totalChapters}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-7 flex items-center text-sm text-white/40 animate-pulse">
                      ??? Decifrando título do filme...
                    </div>
                  )}
                </div>

                {/* Passo 2: Países, Gêneros & Duração */}
                <div
                  className={`rounded-2xl border p-4 transition-all duration-300 ${
                    mysteryStep >= 2
                      ? 'border-white/15 bg-white/[0.04] secret-mystery-step'
                      : 'border-white/8 bg-white/[0.02] opacity-40'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/55 mb-2">
                    Pista 2 • Origem, Gênero & Duração
                  </div>
                  {mysteryStep >= 2 ? (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {Array.isArray(card.resolved?.countries) && card.resolved.countries.length > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/35 text-emerald-200 font-semibold">
                          🌍 {card.resolved.countries.join(' • ')}
                        </span>
                      )}
                      {Array.isArray(card.resolved?.genres) && card.resolved.genres.length > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-400/35 text-sky-200 font-semibold">
                          🎭 {card.resolved.genres.slice(0, 3).join(', ')}
                        </span>
                      )}
                      {card.resolved?.runtime ? (
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-400/35 text-purple-200 font-semibold">
                          ⏱ {card.resolved.runtime} min
                        </span>
                      ) : null}
                      {card.planilha?.notesExtracted ? (
                        <span className="px-2.5 py-1 rounded-lg bg-white/8 border border-white/15 text-white/75">
                          📝 {card.planilha.notesExtracted}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="h-6 flex items-center text-xs text-white/40 animate-pulse">
                      🌍 Consultando mapa e gêneros...
                    </div>
                  )}
                </div>

                {/* Passo 3: Marcos & Recompensas */}
                <div
                  className={`rounded-2xl border p-4 transition-all duration-300 ${
                    mysteryStep >= 3
                      ? 'border-amber-400/30 bg-amber-950/20 secret-mystery-step'
                      : 'border-white/8 bg-white/[0.02] opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200/80">
                      Pista 3 • Marcos & Conquistas Ocultas
                    </span>
                    <span className="text-xs font-black text-amber-300">
                      {cardRewardText} ao concluir
                    </span>
                  </div>
                  {mysteryStep >= 3 ? (
                    Array.isArray(card.milestones) && card.milestones.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                        {card.milestones.map((m, idx) => (
                          <span
                            key={`${m.system}-${m.label}-${idx}`}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                              MILESTONE_SYSTEM_PILL[m.system] ||
                              'border-white/20 bg-white/10 text-white/85'
                            }`}
                          >
                            <span>{m.icon || '✨'}</span>
                            <span>{m.label}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-white/65">
                        Nenhum marco extra além do catálogo — puro cinema &amp; {cardRewardText}!
                      </p>
                    )
                  ) : (
                    <div className="h-6 flex items-center text-xs text-white/40 animate-pulse">
                      🔮 Escaneando troféus, países e décadas...
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* PAINEL DE CARTA ESPECIAL — ZERO SPOILERS ANTES DO FLIP! */
              !isFlipped ? (
                <div className="rounded-2xl border backdrop-blur-md p-5 sm:p-6 space-y-4 border-amber-400/35 bg-[#0c0a10]/85 shadow-[0_0_40px_rgba(245,158,11,0.12)]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-black uppercase tracking-widest animate-pulse border-amber-400/45 bg-amber-950/45 text-amber-200">
                      🃏 Carta do Arlequim • ???
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                      {sealChargePct < 100 ? 'O Arlequim entrou em cena...' : 'Revelando Destino...'}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 italic">
                      O Arlequim te deu uma carta especial — agora é só saber se é bênção ou maldição.
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    {/* Barra 1 */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className={sealChargePct >= 100 ? 'text-emerald-300' : 'text-amber-200'}>
                          {sealChargePct >= 100 ? '✓ Pronta' : '⏳ Preparando...'}
                        </span>
                        <span className="font-mono text-amber-200">{Math.round(sealChargePct)}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-white/10 border border-amber-400/25 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            sealChargePct >= 100
                              ? 'bg-gradient-to-r from-emerald-400 to-amber-300'
                              : 'bg-gradient-to-r from-amber-300 to-orange-400 shadow-[0_0_12px_rgba(251,191,36,0.85)]'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, sealChargePct))}%` }}
                        />
                      </div>
                    </div>

                    {/* Barra 2 */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className={burnProgress > 0 ? 'text-orange-200' : 'text-white/45'}>
                          {burnProgress > 0 ? '🔥 Revelando...' : 'Aguardando...'}
                        </span>
                        <span className="font-mono text-orange-300">{Math.round(burnProgress * 100)}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-white/10 border border-orange-500/25 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 shadow-[0_0_14px_rgba(239,68,68,0.9)]"
                          style={{ width: `${Math.min(100, Math.max(0, burnProgress * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`rounded-2xl border p-4 secret-mystery-step ${activePanelAccent}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-black ${specMeta.badgeClass}`}>
                        {specMeta.icon} {specMeta.label}
                      </span>
                      <span className="text-xs font-semibold text-white/75">
                        ⚡ Efeito Puro (não ocupa vaga na fila)
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-2">
                      <span>{specialEvent.icon}</span>
                      <span>{specialDisplayMeta?.title || specialEvent.title}</span>
                    </h3>
                    {specialDisplayMeta?.quote && (
                      <p className="text-xs italic text-amber-200/90 mt-1.5 border-l-2 border-amber-400/55 pl-2.5">
                        “{specialDisplayMeta.quote}”
                      </p>
                    )}
                    <p className="text-sm text-white/80 mt-2 leading-relaxed">
                      {specialDisplayMeta?.description || specialEvent.description}
                    </p>
                  </div>

                {/* MOEDA 3D PARA REI DUAS-CARAS */}
                {specialEvent.id === 'duas_caras' && specialCoinFace && mysteryStep >= 2 && (
                  <div className="rounded-2xl border border-amber-400/35 bg-black/45 p-4 flex items-center gap-4 secret-mystery-step">
                    <div className="secret-coin-scene w-20 h-20 shrink-0">
                      <div
                        className={`secret-coin-3d w-full h-full ${
                          specialCoinFace === 'heads' ? 'is-heads' : 'is-tails'
                        }`}
                      >
                        <div className="secret-coin-face bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 border-2 border-amber-100 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(251,191,36,0.75)]">
                          <span className="text-2xl leading-none">👑</span>
                          <span className="text-[10px] font-black text-amber-950 uppercase mt-0.5">
                            CARA 2×
                          </span>
                        </div>
                        <div className="secret-coin-face secret-coin-face-tails bg-gradient-to-br from-rose-700 via-red-900 to-zinc-950 border-2 border-rose-300 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.75)]">
                          <span className="text-2xl leading-none">⛓️</span>
                          <span className="text-[9px] font-black text-rose-100 uppercase mt-0.5">
                            COROA ½×
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-wider text-white/60">
                        {coinSettled ? 'Resultado da Moeda do Destino' : 'Girando Moeda no Ar...'}
                      </div>
                      {coinSettled ? (
                        <div className="mt-1">
                          <div
                            className={`text-base font-black ${
                              specialCoinFace === 'heads' ? 'text-amber-300' : 'text-rose-300'
                            }`}
                          >
                            {specialCoinFace === 'heads'
                              ? '✨ DEU CARA! PRÊMIO DOBRADO (2×)!'
                              : '💀 DEU COROA! PRÊMIO PELA METADE + BUMERANGUE TRAVADO!'}
                          </div>
                          {specialEvent.outcomeData?.targetTitle && (
                            <p className="text-xs text-white/80 mt-1">
                              Alvo: <strong className="text-white">{specialEvent.outcomeData.targetTitle}</strong> (
                              {specialEvent.outcomeData?.rewardMode === 'gold'
                                ? `${specialEvent.outcomeData.prevGold} → ${specialEvent.outcomeData.nextGold} 🪙`
                                : `${specialEvent.outcomeData.prevXp ?? specialEvent.outcomeData.oldXp} → ${specialEvent.outcomeData.nextXp ?? specialEvent.outcomeData.newXp} XP`}
                              )
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-amber-200/85 animate-pulse mt-1">
                          Cara (2× Prêmio) ou Coroa (0.5× + Corrente)...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* RESULTADO APLICADO */}
                <div
                  className={`rounded-2xl border p-4 transition-all duration-300 ${
                    mysteryStep >= 3
                      ? 'border-white/20 bg-white/[0.06] secret-mystery-step'
                      : 'border-white/8 bg-white/[0.02] opacity-40'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                    Desfecho Aplicado
                  </div>
                  {mysteryStep >= 3 ? (
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-white leading-snug">
                        {specialEvent.resultSummary || 'Efeito especial ativado!'}
                      </p>

                      {specialEvent.outcomeData?.blockedByAmulet && (
                        <div className="rounded-xl bg-emerald-950/75 border border-emerald-300/65 px-3 py-2.5 text-xs text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.28)]">
                          <div className="font-black text-emerald-200 flex items-center gap-1.5">
                            <span>🛡️ ESCUDO DO ARLEQUIM ESTILHAÇOU!</span>
                          </div>
                          <div className="mt-0.5 text-emerald-100/85">
                            Seu Amuleto Contra-Maldição protegeu a mesa e anulou completamente:{' '}
                            <strong>{specialEvent.outcomeData?.blockedCurseTitle || specialEvent.title}</strong>.
                          </div>
                        </div>
                      )}

                      {specialEvent.id === 'portal_dimensional' &&
                        specialEvent.outcomeData?.targetTitle &&
                        !specialEvent.outcomeData?.noTarget && (
                          <div className="rounded-xl bg-cyan-950/55 border border-cyan-400/40 px-3 py-2.5 text-xs text-cyan-100">
                            <span className="font-black text-cyan-200">
                              🌀 O Arlequim adora este filme — ele ainda vai te dar o prêmio!
                            </span>{' '}
                            <span className="text-white/85">
                              Filme: <strong>{specialEvent.outcomeData.targetTitle}</strong> (
                              {specialEvent.outcomeData.rewardMode === 'gold'
                                ? `+${specialEvent.outcomeData.awardGold || 0} 🪙 no Bazar`
                                : `+${specialEvent.outcomeData.awardXp || 0} XP`}{' '}
                              liberados sem assistir).
                            </span>
                          </div>
                        )}

                      {Array.isArray(specialEvent.outcomeData?.convertedDetails) &&
                        specialEvent.outcomeData.convertedDetails.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {specialEvent.outcomeData.convertedDetails.map((item) => (
                              <span
                                key={item.seat}
                                className="px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-300/60 text-[11px] font-bold text-amber-100"
                              >
                                🪙 Carta #{item.seat}: +{item.prevXp} XP → +{item.nextGold} 🪙 (+15%)
                              </span>
                            ))}
                          </div>
                        )}

                      {specialEvent.id === 'valete_mao_leve' && (
                        <div className="rounded-xl bg-amber-950/50 border border-amber-300/50 px-3 py-2 text-xs text-amber-100 flex flex-wrap items-center justify-between gap-2">
                          <span>🪙 <strong>+{specialEvent.outcomeData?.bazaarGoldAdded || 20} 🪙</strong> direto no Bazar</span>
                          <span className="font-bold text-fuchsia-200">
                            {Number(specialEvent.outcomeData?.remainingSpecialsCount || 0) > 0
                              ? `🚨 ${specialEvent.outcomeData.remainingSpecialsCount} Carta(s) Especial(is) piscando!`
                              : '✓ Nenhuma outra Especial nas fechadas'}
                          </span>
                        </div>
                      )}

                      {specialEvent.id === 'dama_toque_dourado' &&
                        specialEvent.outcomeData?.targetTitle &&
                        !specialEvent.outcomeData?.noTarget && (
                          <div className="rounded-xl bg-amber-950/55 border border-amber-300/55 px-3 py-2 text-xs text-amber-100">
                            👑 <strong>{specialEvent.outcomeData.targetTitle}</strong>: +{specialEvent.outcomeData.prevXp} XP →{' '}
                            <strong className="text-yellow-300">+{specialEvent.outcomeData.nextGold} 🪙</strong> (+25%)
                          </div>
                        )}

                      {specialEvent.id === 'dama_espadas_inquisidora' &&
                        !specialEvent.outcomeData?.noTarget && (
                          <div className="rounded-xl bg-rose-950/60 border border-rose-400/55 px-3 py-2 text-xs text-rose-100">
                            ⚔️ Dado: <strong>{specialEvent.outcomeData?.rolledK}</strong> • Banidos{' '}
                            <strong>{specialEvent.outcomeData?.removedPairs} par(es)</strong> ({specialEvent.outcomeData?.removedTotal} cartas: -
                            {specialEvent.outcomeData?.removedXpSum} XP / -{specialEvent.outcomeData?.removedGoldSum} 🪙)
                          </div>
                        )}

                      {specialEvent.id === 'maldicao_imposto_ouro' &&
                        specialEvent.outcomeData?.targetTitle &&
                        !specialEvent.outcomeData?.noTarget && (
                          <div className="rounded-xl bg-rose-950/60 border border-rose-400/55 px-3 py-2 text-xs text-rose-100">
                            🩸 <strong>{specialEvent.outcomeData.targetTitle}</strong>: +{specialEvent.outcomeData.prevGold} →{' '}
                            <strong className="text-rose-300">+{specialEvent.outcomeData.nextGold} 🪙</strong> (-50%)
                          </div>
                        )}

                      {Array.isArray(specialEvent.outcomeData?.reshuffledDetails) &&
                        specialEvent.outcomeData.reshuffledDetails.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {specialEvent.outcomeData.reshuffledDetails.map((item) => {
                              const prevStr = item.prevRewardMode === 'gold' ? `+${item.prevGold || 0} 🪙` : `+${item.prevXp || 0} XP`;
                              const nextStr = item.nextRewardMode === 'gold' ? `+${item.nextGold || 0} 🪙` : `+${item.nextXp || 0} XP`;
                              return (
                                <span
                                  key={item.seat}
                                  className="px-2 py-1 rounded-lg bg-sky-500/15 border border-sky-400/40 text-[11px] font-bold text-sky-100"
                                >
                                  Carta #{item.seat}: {prevStr} → {nextStr} ({item.nextDiff})
                                </span>
                              );
                            })}
                          </div>
                        )}

                      {pulledMovie && (
                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/50 border border-emerald-400/30">
                          {pulledMovie.card?.resolved?.posterUrl && (
                            <img
                              src={pulledMovie.card.resolved.posterUrl}
                              alt={pulledMovie.card?.resolved?.title || pulledMovie.movieTitle}
                              className="w-11 h-16 object-cover rounded-lg border border-white/15 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold text-emerald-300">
                              {`🃏 O Arlequim deu sua bênção, mas ele escolheu o filme (${pulledMovie.card?.difficultyLabel}):`}
                            </div>
                            <div className="text-sm font-black text-white truncate">
                              Filme: {pulledMovie.card?.resolved?.title || pulledMovie.movieTitle}
                            </div>
                            <div className="text-xs text-amber-300 font-bold">
                              {pulledMovie.rewardMode === 'gold'
                                ? `+${pulledMovie.goldReward || 0} 🪙`
                                : `+${pulledMovie.xpReward || 0} XP`}
                            </div>
                          </div>
                        </div>
                      )}

                      {chainedOutcome?.specialEvent && (
                        <button
                          type="button"
                          onClick={() => onOpenChainedSpecial?.(chainedOutcome)}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/30 via-fuchsia-500/30 to-rose-500/30 hover:from-amber-500/45 hover:to-rose-500/45 border border-amber-300/60 text-amber-100 text-xs sm:text-sm font-black transition shadow-lg"
                        >
                          ⚡ A Carta Puxada Escondia "{chainedOutcome.specialEvent.icon}{' '}
                          {chainedOutcome.specialEvent.harlequinTitle || chainedOutcome.specialEvent.title}" — Abrir Revelação em Cadeia!
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="h-6 flex items-center text-xs text-white/40 animate-pulse">
                      ✨ Aplicando efeito na mesa e na fila...
                    </div>
                  )}
                </div>
              </div>
              )
            )}

            {/* Rodapé CTA */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              {mysteryStep < 3 && (
                <button
                  type="button"
                  onClick={skipReveal}
                  className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-white/80 transition cursor-pointer"
                >
                  ⏭ {isFlipped ? 'Revelar Desfecho Agora' : 'Virar Carta Agora'}
                </button>
              )}
              {isFlipped && (
                <button
                  type="button"
                  onClick={handleClose}
                  className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer ${
                    !isMovie &&
                    specialEvent?.id === 'ocarina_floresta' &&
                    (outcome?.reshuffledSeats?.length > 0 || specialEvent?.outcomeData?.pendingOcarina)
                      ? 'bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-300 hover:to-emerald-300 text-slate-950 shadow-[0_10px_28px_rgba(56,189,248,0.4)]'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 shadow-[0_10px_28px_rgba(16,185,129,0.35)]'
                  }`}
                >
                  {isMovie
                    ? '✓ Carta Adicionada à Fila • Continuar'
                    : specialEvent?.id === 'ocarina_floresta' &&
                      (outcome?.reshuffledSeats?.length > 0 || specialEvent?.outcomeData?.pendingOcarina)
                    ? '⏳ Embaralhar Todas na Mesa Agora!'
                    : '✓ Continuar na Mesa'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
