import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Sparkles, ArrowRight, Gift, Layers, CheckCircle2 } from 'lucide-react';
import TvVoiceStickerCard from './TvVoiceStickerCard';
import {
  VOICE_UNLOCK_ROADMAP,
  applySimulatedVoiceMilestone,
  computeVoiceXpForSimPct,
  getThemeForVoiceTier,
  tierKeyForVoicePct,
} from '../utils/tvVoiceStickers';
import {
  playTvGachaPackSound,
  playTvRarityRevealSound,
  playTvSignatureSound,
  playTvStickerPasteSound,
  playTvTypeTickSound,
} from '../utils/tvAudio';

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

function TypewriterReveal({ lines = [], speedMs = 22, accentHex = '#f472b6', onComplete }) {
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

    let curr = 0;
    const id = setInterval(() => {
      curr += 1;
      setVisibleLen(curr);
      const ch = fullText[curr - 1];
      if (ch && ch !== ' ' && ch !== '\n' && curr % 4 === 1) {
        playTvTypeTickSound();
      }
      if (curr >= fullText.length) {
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
    <div className="whitespace-pre-line text-xs text-zinc-200 leading-relaxed font-medium">
      <span>{shown}</span>
      {isTyping && (
        <span
          aria-hidden="true"
          className="inline-block w-[3px] h-[1em] align-middle ml-1 rounded-full tv-typewriter-cursor"
          style={{
            backgroundColor: accentHex,
            boxShadow: `0 0 10px ${accentHex}`,
          }}
        />
      )}
    </div>
  );
}

function LightShockBurst({ accentHex = '#f472b6' }) {
  return (
    <div
      aria-hidden="true"
      className="relative w-0 h-0 flex items-center justify-center pointer-events-none select-none"
    >
      <span
        className="absolute w-24 h-24 rounded-full border tv-pack-shockwave"
        style={{
          borderColor: accentHex,
          boxShadow: `0 0 28px ${accentHex}aa`,
        }}
      />
      {LIGHT_SPARKS.map((sp, idx) => (
        <span
          key={idx}
          className="tv-pack-shard absolute rounded-full"
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

export default function TvVoicePackModal({
  pack,
  voice,
  pendingTotal = 0,
  onClose,
  onClaimPack,
  onNextPack,
}) {
  const [phase, setPhase] = useState('sealed'); // 'sealed' | 'spinning' | 'revealed'
  const [revealIndex, setRevealIndex] = useState(0);
  const [claiming, setClaiming] = useState(false);

  const toPct = Number(pack?.toPct ?? voice?.percentage ?? 15);
  const fromPct = Number(pack?.fromPct ?? 0);
  const extraStars = Number(pack?.extraStarsUnlocked ?? voice?.extraStars ?? 0);
  const targetTierKey = pack?.toTier || tierKeyForVoicePct(toPct);
  const theme = getThemeForVoiceTier(targetTierKey);

  // Quais marcos estão sendo desbloqueados neste pacote
  const unlockedMilestones = useMemo(() => {
    return VOICE_UNLOCK_ROADMAP.filter((m) => toPct >= m.pct && fromPct < m.pct);
  }, [toPct, fromPct]);

  const effectiveMilestones = useMemo(() => {
    if (unlockedMilestones.length > 0) return unlockedMilestones;
    const top = [...VOICE_UNLOCK_ROADMAP].reverse().find((m) => toPct >= m.pct);
    return top ? [top] : [VOICE_UNLOCK_ROADMAP[0]];
  }, [unlockedMilestones, toPct]);

  // Carta visualizada no alvo do pacote
  const previewVoice = useMemo(() => {
    if (!voice) return null;
    return applySimulatedVoiceMilestone(voice, toPct, extraStars);
  }, [voice, toPct, extraStars]);

  const packXpReward = useMemo(() => {
    if (typeof pack?.xpReward === 'number' && pack.xpReward > 0) return pack.xpReward;
    const prev = computeVoiceXpForSimPct(fromPct, 0);
    const next = computeVoiceXpForSimPct(toPct, extraStars);
    return Math.max(30, next - prev);
  }, [pack, fromPct, toPct, extraStars]);

  useEffect(() => {
    setPhase('sealed');
    setRevealIndex(0);
    setClaiming(false);
  }, [pack?.packId, pack?.toPct, voice?.id]);

  const handleOpenSeal = () => {
    if (phase !== 'sealed') return;
    setPhase('spinning');
    playTvGachaPackSound();

    setTimeout(() => {
      setPhase('revealed');
      playTvRarityRevealSound(targetTierKey);
      if (toPct >= 100) {
        setTimeout(() => playTvSignatureSound(), 350);
      }
    }, 2050);
  };

  const handleStickReward = async () => {
    setClaiming(true);
    playTvStickerPasteSound();
    try {
      await onClaimPack?.(pack, voice);
    } finally {
      setClaiming(false);
    }
  };

  if (!voice) return null;

  const currentMilestone = effectiveMilestones[Math.min(revealIndex, effectiveMilestones.length - 1)];

  const getRewardPreviewLines = (milestone) => {
    if (!milestone) return [];
    switch (milestone.pct) {
      case 15:
        return [
          `🎟️ COMUM (C) DESBLOQUEADA (+30 XP)!`,
          `✨ Invocação Inicial no Fichário liberada com Personagem Principal e Medalhão de Voz.`,
          voice.quote ? `“${voice.quote}”` : '',
        ];
      case 30:
        return [
          `⚔️ INCOMUM (UC) DESBLOQUEADA (+55 XP)!`,
          `📜 Grimório de Papéis liberado + Selo Camaleão Vocal para múltiplos papéis!`,
          ...(voice.curiosities?.slice(0, 2) || ['Bastidores exclusivos revelados no dossiê!']),
        ];
      case 45:
        return [
          `🧪 RARA (R) DESBLOQUEADA (+75 XP)!`,
          `🎨 Troca de Arte Livre entre personagens + Flip 3D (Frente/Verso com Ficha de Poder)!`,
        ];
      case 60:
        return [
          `⚡ SUPER RARA (SR) DESBLOQUEADA (+90 XP)!`,
          `🎯 Radar de Afinidade Vocal + Cálculo automático de gêneros dominantes!`,
          voice.secretFact || '',
        ];
      case 75:
        return [
          `🌟 LENDÁRIA (LR) DESBLOQUEADA (+130 XP)!`,
          `⏳ Crônica de Batalha (Desempenho por década & Média geral do catálogo) liberada!`,
        ];
      case 100:
        return [
          `🩸 MÍTICA SUPREMA (UR) DESBLOQUEADA (+180 XP)!`,
          '✍️ Despertar Supremo: Assinatura Caligráfica + Obra-Prima fixada + Todas as Auras Anime!',
          extraStars > 0 ? `★ Prestígio Infinito: +${extraStars} Estrela(s) (+${extraStars * 75} XP)!` : '',
        ];
      default:
        return [`${milestone.icon} ${milestone.title}`];
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl rounded-3xl bg-zinc-950/95 border border-pink-500/40 shadow-2xl overflow-hidden"
        style={{
          boxShadow: `0 0 80px ${theme.accentHex}33, 0 25px 60px rgba(0,0,0,0.9)`,
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/70">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-black uppercase tracking-widest text-pink-200">
              {pack?.isSimulated ? '🧪 Simulador de Invocação Gacha' : '⛩️ Pacote de Invocação Seiyū'}
            </span>
            {pendingTotal > 1 && (
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-[10px] font-black text-pink-300">
                {pendingTotal} pendentes
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center min-h-[460px]">
          {phase === 'sealed' && (
            <div className="flex flex-col items-center text-center gap-5 max-w-md">
              <button
                type="button"
                onClick={handleOpenSeal}
                className="group relative w-52 aspect-[3/4] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-5 transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden"
                style={{
                  borderColor: theme.accentHex,
                  background: 'radial-gradient(circle at 50% 35%, rgba(236,72,153,0.22), #09090b 80%)',
                  boxShadow: `0 0 40px ${theme.accentHex}35`,
                }}
              >
                <div className="absolute inset-0 anime-conic-spin opacity-25 pointer-events-none"
                  style={{
                    background: `conic-gradient(from 0deg, transparent, ${theme.accentHex}, transparent 180deg, #a855f7, transparent)`,
                  }}
                />
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-zinc-900/90 border border-pink-400/50 flex items-center justify-center text-4xl shadow-xl mb-3 group-hover:scale-110 transition-transform">
                  {voice.icon || '🎴'}
                </div>
                <span className="relative z-10 text-xs font-mono font-black px-2.5 py-1 rounded bg-black/80 border border-white/20 text-pink-300">
                  {theme.tcgCode} • {toPct}%
                </span>
                <h3 className="relative z-10 mt-3 text-base font-black text-white">{voice.name}</h3>
                <p className="relative z-10 text-[11px] text-pink-300 font-bold">{voice.rpgTitle}</p>
                <div className="relative z-10 mt-5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs shadow-lg flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Romper Selo!</span>
                </div>
              </button>

              <p className="text-xs text-zinc-400">
                Clique na carta lacrada para revelar a raridade{' '}
                <strong style={{ color: theme.accentHex }}>{theme.label}</strong> e resgatar{' '}
                <strong className="text-emerald-300">+{packXpReward} XP</strong>!
              </p>
            </div>
          )}

          {phase === 'spinning' && (
            <div className="flex flex-col items-center justify-center gap-5 py-6">
              <div className="relative w-52 aspect-[3/4] tv-pack-spin-plin">
                {previewVoice && (
                  <TvVoiceStickerCard
                    voice={previewVoice}
                    signatureMode="writing"
                  />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-pink-300 animate-pulse">
                <Sparkles className="w-4 h-4" />
                <span>Invocando Raridade {theme.label}...</span>
              </div>
            </div>
          )}

          {phase === 'revealed' && (
            <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 flex flex-col items-center relative">
                <LightShockBurst accentHex={theme.accentHex} />
                <div className="w-56 relative z-10">
                  {previewVoice && (
                    <TvVoiceStickerCard
                      voice={previewVoice}
                      justStuck
                      signatureMode={toPct >= 100 ? 'writing' : 'normal'}
                    />
                  )}
                </div>
              </div>

              <div className="md:col-span-7 flex flex-col gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase border"
                      style={theme.badgeStyle}
                    >
                      {theme.icon} {theme.label} ({theme.tcgCode})
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-[10px] font-black">
                      +{packXpReward} XP Sakura
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">{voice.name}</h3>
                  <p className="text-xs font-bold text-pink-300">{voice.rpgTitle}</p>
                </div>

                {/* Caixa Typewriter dos Marcos */}
                <div className="bg-zinc-900/90 border border-pink-500/35 rounded-2xl p-4 min-h-[135px] flex flex-col justify-between space-y-3">
                  <TypewriterReveal
                    key={`${currentMilestone?.pct}-${revealIndex}`}
                    lines={getRewardPreviewLines(currentMilestone)}
                    accentHex={theme.accentHex}
                  />

                  {effectiveMilestones.length > 1 && (
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[11px]">
                      <span className="text-zinc-500 font-mono">
                        Marco {revealIndex + 1} de {effectiveMilestones.length}
                      </span>
                      <div className="flex gap-1.5">
                        {effectiveMilestones.map((m, idx) => (
                          <button
                            key={m.pct}
                            type="button"
                            onClick={() => setRevealIndex(idx)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              idx === revealIndex
                                ? 'bg-pink-500 text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {m.pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {!pack?.isSimulated ? (
                    <button
                      type="button"
                      disabled={claiming}
                      onClick={handleStickReward}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 hover:brightness-110 text-white font-black text-xs shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{claiming ? 'Colando no Álbum...' : `Colar no Álbum (+${packXpReward} XP)`}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Concluir Prévia</span>
                    </button>
                  )}

                  {onNextPack && pendingTotal > 1 && (
                    <button
                      type="button"
                      onClick={onNextPack}
                      className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Próximo Pacote</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
