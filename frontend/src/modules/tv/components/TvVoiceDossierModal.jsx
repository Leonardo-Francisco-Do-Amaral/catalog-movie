import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  MapPin,
  Film,
  Tv,
  Plus,
  Quote,
  Award,
  Lock,
  Palette,
  Upload,
  Link2,
  Clock,
  BarChart3,
  BookOpen,
  Mic,
  Gift,
  ShieldCheck,
  Zap,
  Trash2,
} from 'lucide-react';
import {
  VOICE_IMMORTAL_AURA_LIST,
  VOICE_RANK_META,
  VOICE_UNLOCK_ROADMAP,
  getThemeForVoiceTier,
  resolveEffectiveVoiceAura,
  resolveVoiceUnlocksForPct,
} from '../utils/tvVoiceStickers';
import { resolveTvPosterUrl } from '../utils/tvApi';
import { playTvTypeTickSound, playTvRarityRevealSound } from '../utils/tvAudio';

const ANIME_STAGE_NAMES = {
  15: 'Comum (C)',
  30: 'Incomum (UC)',
  45: 'Rara (R)',
  60: 'Super Rara (SR)',
  75: 'Lendária (LR)',
  100: 'Mítica Suprema (UR)',
};

function DossierLockBanner({ requiredPct, tierLabel, rewardLabel, xpReward }) {
  return (
    <div className="rounded-2xl bg-zinc-950/80 border border-dashed border-zinc-700/80 p-3.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0 text-zinc-400">
          <Lock className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-black text-zinc-300 truncate">{rewardLabel} bloqueado</p>
          <p className="text-[11px] text-zinc-500">
            Alcance <strong className="text-pink-400">{requiredPct}%</strong> ({tierLabel} · +{xpReward} XP) para liberar
          </p>
        </div>
      </div>
      <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-[10px] font-black text-zinc-400 shrink-0">
        🔒 {requiredPct}%
      </span>
    </div>
  );
}

export function VisualNovelCutInOverlay({ voice, accentHex = '#f472b6', onClose }) {
  const [typedLen, setTypedLen] = useState(0);
  const fullQuote = voice.quote || voice.tagline || `${voice.name} em cena!`;

  useEffect(() => {
    playTvRarityRevealSound(voice.currentTier || 'rare');
    setTypedLen(0);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setTypedLen(i);
      if (i % 3 === 1) playTvTypeTickSound();
      if (i >= fullQuote.length) clearInterval(timer);
    }, 24);
    return () => clearInterval(timer);
  }, [fullQuote, voice.currentTier]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl rounded-3xl overflow-hidden border-2 bg-zinc-950 shadow-2xl"
        style={{
          borderColor: accentHex,
          boxShadow: `0 0 70px ${accentHex}66`,
        }}
      >
        {/* Faixa diagonal estilo Persona / Visual Novel */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            background: `linear-gradient(115deg, ${accentHex} 0%, transparent 55%, #a855f7 100%)`,
          }}
        />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          <div
            className="w-28 h-36 sm:w-36 sm:h-48 rounded-2xl overflow-hidden border-2 shrink-0 shadow-2xl -rotate-2"
            style={{ borderColor: accentHex }}
          >
            <img
              src={resolveTvPosterUrl(voice.activePhotoUrl || voice.photoUrl)}
              alt={voice.name}
              className="w-full h-full object-cover object-top"
            />
          </div>

          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/80 border border-white/15 text-[10px] font-black uppercase tracking-widest text-pink-300">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Cut-In de Voz • {voice.rpgTitle}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-wide text-white">
              {voice.name}
            </h3>

            {voice.quoteJp && (
              <p
                className="text-base sm:text-lg font-black tracking-wider"
                style={{ color: accentHex }}
              >
                「{voice.quoteJp}」
              </p>
            )}

            <p className="text-sm sm:text-base font-bold text-zinc-100 italic leading-relaxed min-h-[3.5rem] bg-black/60 p-3.5 rounded-2xl border border-white/10">
              “{fullQuote.slice(0, typedLen)}”
            </p>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black uppercase tracking-wider text-white cursor-pointer"
              >
                Fechar Cut-In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TvVoiceDossierModal({
  voice,
  onClose,
  onAddShowByTitle,
  onEditShowById,
  onStick,
  onUnstick,
  onOpenPack,
  onTestPackAnimation,
  onUpdatePreferences,
  onUploadCustomSkin,
}) {
  const [workTab, setWorkTab] = useState('watched');
  const [showCustomSkinBox, setShowCustomSkinBox] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [customLabelInput, setCustomLabelInput] = useState('');
  const [uploadingSkin, setUploadingSkin] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [showCutIn, setShowCutIn] = useState(false);

  if (!voice) return null;

  const pct = Number(voice.percentage || 0);
  const extraStars = Number(voice.extraStars || 0);
  const currentTier = voice.currentTier || 'locked';
  const theme = getThemeForVoiceTier(currentTier);
  const unlocks = resolveVoiceUnlocksForPct(pct);
  const isMythic = unlocks.mythicSignedUnlocked;
  const accentHex = isMythic
    ? resolveEffectiveVoiceAura(voice.immortalAura, extraStars).accent
    : theme.accentHex;
  const auraPreset = resolveEffectiveVoiceAura(voice.immortalAura, extraStars);
  const displayPortrait = resolveTvPosterUrl(voice.activePhotoUrl || voice.photoUrl);
  const rankMeta = VOICE_RANK_META[voice.rpgRank] || VOICE_RANK_META.E;
  const isSim = Boolean(voice.isSimulated);

  const handleSaveUrlSkin = async (e) => {
    e.preventDefault();
    if (!customUrlInput.trim() || !onUploadCustomSkin) return;
    setUploadingSkin(true);
    try {
      await onUploadCustomSkin(voice.id, {
        url: customUrlInput.trim(),
        label: customLabelInput.trim() || 'Foto via Link',
      });
      setCustomUrlInput('');
      setCustomLabelInput('');
      setShowCustomSkinBox(false);
    } finally {
      setUploadingSkin(false);
    }
  };

  const handleFileSkinChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadCustomSkin) return;
    setUploadingSkin(true);
    try {
      await onUploadCustomSkin(voice.id, {
        file,
        label: customLabelInput.trim() || file.name.replace(/\.[^.]+$/, '') || 'Minha Imagem',
      });
      setShowCustomSkinBox(false);
    } finally {
      setUploadingSkin(false);
      e.target.value = '';
    }
  };

  const maxDecadeCount = Math.max(1, ...(voice.decades || []).map((d) => d.count));

  return (
    <>
      {showCutIn && (
        <VisualNovelCutInOverlay
          voice={voice}
          accentHex={accentHex}
          onClose={() => setShowCutIn(false)}
        />
      )}

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto tv-sakura-scroll rounded-3xl bg-zinc-950 border shadow-2xl text-zinc-100 anime-card-unfold-modal"
          style={{
            borderColor: `${accentHex}66`,
            boxShadow: `0 0 55px ${accentHex}24, 0 25px 60px rgba(0,0,0,0.88)`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="h-1.5 w-full sticky top-0 z-30"
            style={{
              background: isMythic
                ? auraPreset.frameBg
                : `linear-gradient(90deg, transparent, ${accentHex}, transparent)`,
            }}
          />

          <button
            type="button"
            onClick={onClose}
            className="sticky top-4 float-right mr-4 mt-4 z-30 p-2 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
            title="Fechar Dossiê"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* ===============================================================
                COLUNA ESQUERDA: Retrato VIP + Skins (45%) + Auras Míticas (100%)
               =============================================================== */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border-2 shadow-xl"
                style={{ borderColor: accentHex }}
              >
                {displayPortrait ? (
                  <img
                    src={displayPortrait}
                    alt={voice.name}
                    className={`w-full h-full object-cover object-top transition-all duration-500 ${
                      pct < 15 ? 'grayscale contrast-110 brightness-60' : ''
                    } ${isMythic && voice.isFullArt ? 'grayscale contrast-150' : ''}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl bg-zinc-900">
                    <span>{voice.icon || '🎙️'}</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />

                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-black/80 border border-white/15 font-mono text-xs font-black text-pink-300">
                      #{String(voice.albumNumber || 1).padStart(3, '0')}
                    </span>
                    <span className={`px-2 py-1 rounded-lg border font-mono text-[11px] font-black ${rankMeta.badgeClass}`}>
                      RANK {rankMeta.rank}
                    </span>
                    {isSim && (
                      <span className="px-2 py-1 rounded-lg bg-purple-500/85 border border-purple-300/60 text-[10px] font-black text-white">
                        🧪 PRÉVIA
                      </span>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wide border"
                      style={theme.badgeStyle}
                    >
                      <span>{theme.icon}</span>
                      <span>{theme.label}</span>
                    </span>
                    <span className="font-mono text-xl font-black text-white drop-shadow">
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-800/90 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max(pct, voice.totalWorksCount > 0 ? 4 : 0)}%`,
                        background: isMythic ? auraPreset.frameBg : accentHex,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 45%+ RARA: Skins & Flip de Personagem */}
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-emerald-400" />
                    <span>Skins &amp; Verso da Carta ({voice.skinOptions?.length || 1})</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-300">
                    {unlocks.skinsUnlocked ? '✓ Liberado (45%+)' : '🔒 45% Despertar'}
                  </span>
                </div>

                {!unlocks.skinsUnlocked ? (
                  <p className="text-[11px] text-zinc-500">
                    Alcance <strong className="text-emerald-400">45% (Despertar · +75 XP)</strong> para liberar o <strong>Verso da Carta (Personagem Supremo)</strong> e skins personalizadas.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-5 gap-1.5">
                      {(voice.skinOptions || []).map((sk) => {
                        const activeUrl = voice.selectedSkinUrl || voice.photoUrl;
                        const isActive = sk.imageUrl === activeUrl;
                        return (
                          <button
                            key={sk.id}
                            type="button"
                            disabled={isSim}
                            onClick={() =>
                              onUpdatePreferences?.(voice.id, {
                                selectedSkinUrl: sk.kind === 'portrait' ? null : sk.imageUrl,
                                selectedSkinLabel: sk.kind === 'portrait' ? null : sk.label,
                              })
                            }
                            title={`${sk.label} (${sk.sublabel})`}
                            className={`aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all cursor-pointer disabled:opacity-60 ${
                              isActive
                                ? 'border-pink-400 ring-2 ring-pink-400/35 scale-105'
                                : 'border-zinc-800 hover:border-zinc-500 opacity-75 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={resolveTvPosterUrl(sk.imageUrl)}
                              alt={sk.label}
                              className="w-full h-full object-cover object-top"
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-zinc-400 truncate">
                        Ativa: <strong>{voice.selectedSkinLabel || 'Retrato Oficial'}</strong>
                      </span>
                      <button
                        type="button"
                        disabled={isSim}
                        onClick={() => setShowCustomSkinBox((v) => !v)}
                        className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/45 text-[10px] font-black text-emerald-200 cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {showCustomSkinBox ? 'Fechar' : '+ Foto PC / Link'}
                      </button>
                    </div>

                    {showCustomSkinBox && (
                      <form
                        onSubmit={handleSaveUrlSkin}
                        className="rounded-xl bg-zinc-950/90 border border-emerald-500/35 p-2.5 flex flex-col gap-2"
                      >
                        <input
                          type="text"
                          value={customLabelInput}
                          onChange={(e) => setCustomLabelInput(e.target.value)}
                          placeholder="Rótulo opcional (ex: Ichigo Bankai)"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                        />
                        <div className="flex items-center gap-1.5">
                          <div className="relative flex-1">
                            <Link2 className="w-3.5 h-3.5 text-zinc-500 absolute left-2 top-1/2 -translate-y-1/2" />
                            <input
                              type="url"
                              value={customUrlInput}
                              onChange={(e) => setCustomUrlInput(e.target.value)}
                              placeholder="Cole o link da imagem (https://...)"
                              className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={uploadingSkin || !customUrlInput.trim()}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-black text-[10px] cursor-pointer shrink-0"
                          >
                            Usar Link
                          </button>
                        </div>

                        <label className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-dashed border-emerald-400/50 text-[11px] font-bold text-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingSkin ? 'Enviando...' : 'Ou escolher imagem do PC'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingSkin}
                            onChange={handleFileSkinChange}
                            className="hidden"
                          />
                        </label>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* 100% MÍTICA: Auras Anime + Modo Mangá */}
              <div className="rounded-2xl bg-gradient-to-br from-rose-500/10 via-zinc-900/85 to-zinc-950 border border-rose-500/30 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-300">
                    🩸 Edição Mítica Bankai
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-950 border border-rose-500/35 text-rose-200">
                    {unlocks.aurasUnlocked ? '✓ Liberada (100%)' : '🔒 100%'}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      10 Auras Lendárias (1 ★ = +3 obras)
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 font-bold">
                      {extraStars}★ ativo
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {VOICE_IMMORTAL_AURA_LIST.map((aura) => {
                      const selected = (voice.immortalAura || 'sakura_prism') === aura.id;
                      const auraUnlocked = unlocks.aurasUnlocked && extraStars >= aura.requiredStars;
                      return (
                        <button
                          key={aura.id}
                          type="button"
                          disabled={!auraUnlocked || isSim}
                          onClick={() => onUpdatePreferences?.(voice.id, { immortalAura: aura.id })}
                          title={
                            auraUnlocked
                              ? `${aura.label}`
                              : `${aura.label} — requer ${!unlocks.aurasUnlocked ? '100%' : `${aura.requiredStars}★`}`
                          }
                          className={`p-1.5 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all ${
                            !auraUnlocked
                              ? 'border-zinc-800 opacity-40 cursor-not-allowed bg-zinc-950 text-zinc-500'
                              : selected
                              ? 'border-white bg-zinc-800 text-white shadow cursor-pointer'
                              : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 cursor-pointer'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-white/40"
                            style={{ background: aura.swatch }}
                          />
                          <span className="truncate max-w-full text-[8.5px]">{aura.shortLabel}</span>
                          <span className="font-mono text-[8px] opacity-80">
                            {auraUnlocked ? (aura.requiredStars === 0 ? '100%' : `${aura.requiredStars}★`) : `🔒${aura.requiredStars}★`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    🏆 Obra-Prima Fixada na Figurinha
                  </span>
                  <select
                    disabled={!unlocks.mythicSignedUnlocked || isSim || !(voice.combinedWorks?.length > 0)}
                    value={voice.signatureWorkKey || ''}
                    onChange={(e) =>
                      onUpdatePreferences?.(voice.id, { signatureWorkKey: e.target.value })
                    }
                    className="w-full px-2.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-semibold text-zinc-100 disabled:opacity-50 focus:outline-none focus:border-pink-400 cursor-pointer"
                  >
                    {!(voice.combinedWorks?.length > 0) ? (
                      <option value="">Nenhuma obra assistida ainda</option>
                    ) : (
                      voice.combinedWorks.map((w) => (
                        <option key={w.workKey} value={w.workKey}>
                          {w.title} ({w.kindLabel}) {typeof w.userRating === 'number' ? `★ ${w.userRating.toFixed(1)}` : ''}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {unlocks.mythicSignedUnlocked && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isSim}
                      onClick={() =>
                        onUpdatePreferences?.(voice.id, { isFullArt: !voice.isFullArt })
                      }
                      className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                        voice.isFullArt
                          ? 'bg-pink-500/25 border-pink-400 text-pink-100'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      📖 Modo Mangá {voice.isFullArt ? 'ON' : 'OFF'}
                    </button>
                    <button
                      type="button"
                      disabled={isSim}
                      onClick={() =>
                        onUpdatePreferences?.(voice.id, {
                          isFavoriteGuardian: !voice.isFavoriteGuardian,
                        })
                      }
                      className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
                        voice.isFavoriteGuardian
                          ? 'bg-amber-500/25 border-amber-400 text-amber-100'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>Guardião</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Ficha Biográfica Rápida */}
              <div className="rounded-2xl bg-zinc-900/75 border border-zinc-800 p-4 flex flex-col gap-2.5 text-xs">
                {voice.voiceType && (
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Mic className="w-4 h-4 text-pink-400 shrink-0" />
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold">Timbre &amp; Estilo</span>
                      <span className="font-semibold text-zinc-100">{voice.voiceType}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-zinc-300">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Nascimento</span>
                    <span className="font-semibold text-zinc-100">
                      {voice.birthday || 'Informação em sincronização'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-zinc-300">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Origem</span>
                    <span className="font-semibold text-zinc-100">
                      {voice.nationalityCode === 'jp' ? '🇯🇵' : '🇺🇸'}{' '}
                      {voice.hometown || voice.nationalityLabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-zinc-300">
                  <Film className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">
                      Progresso (Teto {voice.ceiling} obras)
                    </span>
                    <span className="font-semibold text-zinc-100">
                      {voice.totalWorksCount} obras (🎬 {voice.watchedMoviesCount} · ⛩️ {voice.watchedShowsCount})
                    </span>
                  </div>
                </div>

                {!isSim && voice.isStuck && onUnstick && (
                  <button
                    type="button"
                    onClick={() => {
                      onUnstick(voice.id);
                      onClose();
                    }}
                    className="mt-1 w-full py-1.5 rounded-xl bg-zinc-950 hover:bg-rose-500/15 border border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-300 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Descolar Figurinha da Página</span>
                  </button>
                )}
              </div>
            </div>

            {/* ===============================================================
                COLUNA DIREITA: Bio/Wiki, Jornada Temática, Cut-in, Curiosidades
               =============================================================== */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-pink-300">
                      {voice.nationalityCode === 'jp' ? '🇯🇵 Seiyū Lendário' : '🇺🇸 Voz Americana'}
                    </span>
                    <span className={`text-[11px] font-mono font-black px-2.5 py-0.5 rounded-md border ${rankMeta.badgeClass}`}>
                      RANK {rankMeta.rank}
                    </span>
                    {voice.sourceOrigin === 'shared_cinema' && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/40 text-amber-200">
                        🎬+⛩️ Compartilhado c/ Cinema
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {!isSim && voice.isStickerUnlocked && (!voice.isStuck || voice.hasRarityUpgradeToStick) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (voice.pendingPackId && onOpenPack) {
                            onOpenPack(voice.pendingPackId);
                          } else {
                            onStick?.(voice.id);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-110 text-white text-xs font-black flex items-center gap-1.5 shadow-lg cursor-pointer"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>
                          {voice.pendingPackId ? 'Abrir Pacote Gacha!' : `Colar no Álbum (+${voice.unclaimedXp} XP)`}
                        </span>
                      </button>
                    )}
                    {onTestPackAnimation && (
                      <button
                        type="button"
                        onClick={() => onTestPackAnimation(voice)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                        <span>Simular Invocação</span>
                      </button>
                    )}
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight flex items-center gap-2">
                  <span>{voice.icon}</span>
                  <span>{voice.name}</span>
                </h2>
                <p className="text-sm font-bold text-pink-400 mt-0.5">{voice.rpgTitle}</p>
                {voice.tagline && (
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{voice.tagline}</p>
                )}
              </div>

              {/* Escada de Raridades Temática de Anime */}
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Jornada de Despertar (Teto {voice.ceiling} obras)</span>
                  </span>
                  <span className="text-[11px] font-mono text-pink-300 font-bold">
                    {voice.claimedXp} / {Math.max(voice.potentialXp, 560)} XP base
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {VOICE_UNLOCK_ROADMAP.map((step) => {
                    const unlocked = pct >= step.pct;
                    const stepTheme = getThemeForVoiceTier(step.tierKey);
                    const animeTitle = ANIME_STAGE_NAMES[step.pct] || step.tierLabel;
                    return (
                      <div
                        key={step.pct}
                        className={`p-2 rounded-xl border text-center flex flex-col justify-between gap-1 transition-all ${
                          unlocked
                            ? 'bg-zinc-950/90 text-white'
                            : 'bg-zinc-950/50 border-zinc-800/80 text-zinc-500 opacity-65'
                        }`}
                        style={unlocked ? { borderColor: `${stepTheme.accentHex}99` } : undefined}
                        title={step.title}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono font-black">
                          <span>{step.pct}%</span>
                          <span>{unlocked ? '✓' : '🔒'}</span>
                        </div>
                        <div className="text-base">{step.icon}</div>
                        <div
                          className="text-[10.5px] font-black leading-tight"
                          style={unlocked ? { color: stepTheme.accentHex } : undefined}
                        >
                          {animeTitle}
                        </div>
                        <div className="text-[9.5px] font-bold text-emerald-300">+{step.xpReward} XP</div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10.5px] text-zinc-400">
                  ★ Acima de {voice.ceiling} obras (Mítica): cada <strong>+3 obras</strong> rende <strong>+1 Estrela (+75 XP)</strong> e libera uma nova Aura Elemental!
                </p>
              </div>

              {/* 15%+ COMUM: Bordão + Botão Cut-In Visual Novel */}
              {unlocks.quoteUnlocked ? (
                <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-transparent border-l-4 border-pink-500 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-pink-300">
                      <Quote className="w-3.5 h-3.5" />
                      <span>Bordão Icônico &amp; Cut-In (15%+ Figurante)</span>
                    </div>
                    <p className="text-sm text-zinc-100 font-semibold italic leading-relaxed">
                      “{voice.quote || voice.tagline}”
                    </p>
                    {voice.quoteJp && (
                      <p className="text-xs font-bold text-amber-300/95">{voice.quoteJp}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCutIn(true)}
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/35 border border-pink-400/50 text-pink-200 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Invocar Cut-In</span>
                  </button>
                </div>
              ) : (
                <DossierLockBanner
                  requiredPct={15}
                  tierLabel="Figurante"
                  rewardLabel="Bordão Icônico & Cut-In Visual Novel"
                  xpReward={30}
                />
              )}

              {/* Biografia & Wikipédia PT/EN */}
              <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>Biografia &amp; Enciclopédia Wikipédia</span>
                  </span>
                  {voice.wikiExtract && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/35 text-purple-200">
                      Wikipedia Integrada ✓
                    </span>
                  )}
                </div>
                <p className={`text-xs text-zinc-300 leading-relaxed ${!isBioExpanded ? 'line-clamp-4' : ''}`}>
                  {voice.bio || `${voice.name} integra o acervo de vozes do Santuário Anime.`}
                </p>
                {(voice.bio?.length || 0) > 220 && (
                  <button
                    type="button"
                    onClick={() => setIsBioExpanded((v) => !v)}
                    className="text-[11px] font-bold text-pink-400 hover:text-pink-300 cursor-pointer"
                  >
                    {isBioExpanded ? 'Mostrar menos ▲' : 'Ler biografia completa ▼'}
                  </button>
                )}
              </div>

              {/* 30%+ INCOMUM: 3 Curiosidades */}
              {unlocks.curiositiesUnlocked && voice.curiosities?.length > 0 ? (
                <div className="rounded-2xl bg-zinc-900/75 border border-slate-400/35 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                      📜 3 Curiosidades de Bastidores &amp; Estúdio Seiyū (30%+ Protagonista)
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {voice.curiosities.map((c, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-zinc-300 bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-2.5 leading-relaxed"
                      >
                        <span className="w-5 h-5 rounded-md bg-slate-500/20 border border-slate-400/40 text-slate-200 font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          #{idx + 1}
                        </span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <DossierLockBanner
                  requiredPct={30}
                  tierLabel="Protagonista"
                  rewardLabel="3 Curiosidades de Bastidores Seiyū"
                  xpReward={55}
                />
              )}

              {/* 60%+ SUPER RARA: Segredo de Estúdio */}
              {unlocks.secretAndVocalUnlocked ? (
                <div className="rounded-2xl bg-gradient-to-br from-purple-500/15 via-zinc-900/85 to-zinc-950 border border-purple-500/40 p-4 space-y-2">
                  <div className="text-xs font-black uppercase tracking-wider text-purple-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Segredo de Estúdio &amp; Alcance Vocal (60%+ Voz de Ouro)</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed">
                    {voice.secretFact || 'Curiosidade secreta de estúdio sobre a atuação de ' + voice.name + '.'}
                  </p>
                  {voice.knownFor && (
                    <p className="text-[11px] text-purple-200/90 pt-1 border-t border-purple-500/20">
                      <strong>Papéis Icônicos:</strong> {voice.knownFor}
                    </p>
                  )}
                </div>
              ) : (
                <DossierLockBanner
                  requiredPct={60}
                  tierLabel="Voz de Ouro"
                  rewardLabel="Segredo de Estúdio & Enciclopédia Vocal"
                  xpReward={90}
                />
              )}

              {/* 75%+ LENDÁRIA: Crônica das Eras */}
              {unlocks.timelineUnlocked ? (
                <div className="rounded-2xl bg-zinc-900/80 border border-yellow-400/35 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-yellow-300 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4" />
                      <span>Crônica das Eras &amp; Raio-X (75%+ Lenda Shonen)</span>
                    </span>
                    {voice.favoriteDecade && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-yellow-500/15 border border-yellow-400/40 text-yellow-200">
                        Era Forte: {voice.favoriteDecade.label} ({voice.favoriteDecade.count} obras)
                      </span>
                    )}
                  </div>

                  {(voice.decades || []).length === 0 ? (
                    <p className="text-xs text-zinc-500">Cadastre animes ou filmes para preencher a linha do tempo das eras.</p>
                  ) : (
                    <div className="space-y-2">
                      {voice.decades.map((dec) => {
                        const barPct = Math.round((dec.count / maxDecadeCount) * 100);
                        return (
                          <div key={dec.decade} className="space-y-1 text-xs">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-zinc-200">
                                <Clock className="w-3 h-3 inline mr-1 text-yellow-400" />
                                {dec.label}
                                {dec.topTitle && <span className="text-zinc-500 font-normal ml-2">· {dec.topTitle}</span>}
                              </span>
                              <span className="font-mono font-bold text-yellow-300">
                                {dec.count} obra(s) {dec.avgRating !== null ? `· ★ ${dec.avgRating}` : ''}
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-zinc-950 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-300"
                                style={{ width: `${Math.max(6, barPct)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <DossierLockBanner
                  requiredPct={75}
                  tierLabel="Lenda Shonen"
                  rewardLabel="Crônica das Eras & Linha do Tempo"
                  xpReward={130}
                />
              )}

              {/* Galeria de Obras Assistidas + Sugestões */}
              <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setWorkTab('watched')}
                      className={`px-3 py-1 rounded-xl text-xs font-black uppercase cursor-pointer ${
                        workTab === 'watched'
                          ? 'bg-pink-500 text-white'
                          : 'bg-zinc-950 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Obras Assistidas ({voice.combinedWorks?.length || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkTab('franchises')}
                      className={`px-3 py-1 rounded-xl text-xs font-black uppercase cursor-pointer ${
                        workTab === 'franchises'
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-950 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Franquias &amp; Sugestões ({voice.signatureFranchises?.length || 0})
                    </button>
                  </div>
                </div>

                {workTab === 'watched' ? (
                  !(voice.combinedWorks?.length > 0) ? (
                    <p className="text-xs text-zinc-400 text-center py-4">
                      Nenhuma obra assistida ainda — veja a aba <strong>Franquias &amp; Sugestões</strong> ao lado para adicionar rapidamente!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto tv-sakura-scroll pr-1">
                      {voice.combinedWorks.map((w, idx) => {
                        const thumb = resolveTvPosterUrl(w.posterUrl);
                        const isCinema = w.source === 'cinema';
                        return (
                          <div
                            key={`${w.workKey}-${idx}`}
                            onClick={() => {
                              if (!isCinema && w.id) {
                                onEditShowById?.(w.id);
                                onClose?.();
                              }
                            }}
                            className={`flex items-center gap-2.5 p-2 rounded-xl border bg-zinc-950/80 border-zinc-800 transition-colors ${
                              !isCinema ? 'hover:border-pink-500/50 cursor-pointer' : ''
                            }`}
                          >
                            <div className="w-10 h-14 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                              {thumb ? (
                                <img src={thumb} alt={w.title} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs">{isCinema ? '🎬' : '⛩️'}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1 text-[9.5px]">
                                {isCinema ? (
                                  <span className="text-amber-400 font-black flex items-center gap-0.5">
                                    <Film className="w-2.5 h-2.5" /> Cinema
                                  </span>
                                ) : (
                                  <span className="text-pink-400 font-black flex items-center gap-0.5">
                                    <Tv className="w-2.5 h-2.5" /> {w.kindLabel}
                                  </span>
                                )}
                                {w.year && <span className="text-zinc-500">· {w.year}</span>}
                                {typeof w.userRating === 'number' && (
                                  <span className="text-amber-300 font-bold ml-auto">★ {w.userRating.toFixed(1)}</span>
                                )}
                              </div>
                              <h4 className="text-xs font-bold text-zinc-100 truncate">{w.title}</h4>
                              {w.character && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-pink-500/15 border border-pink-500/30 text-[9.5px] font-black text-pink-300 truncate max-w-full">
                                  Papel: {w.character}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(voice.signatureFranchises || []).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => {
                          onAddShowByTitle?.(f);
                          onClose?.();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-pink-500/20 border border-zinc-800 hover:border-pink-500/45 text-xs font-bold text-zinc-200 cursor-pointer transition-colors capitalize"
                      >
                        <Plus className="w-3.5 h-3.5 text-pink-400" />
                        <span>{f}</span>
                      </button>
                    ))}
                    {!(voice.signatureFranchises?.length > 0) && (
                      <p className="text-xs text-zinc-500">Use o botão "+ Adicionar Obra" no catálogo para cadastrar animes com este dublador.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}