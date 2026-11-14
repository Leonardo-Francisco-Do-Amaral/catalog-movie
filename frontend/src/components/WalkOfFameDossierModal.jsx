import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  MapPin,
  Film,
  Plus,
  Quote,
  Award,
  CheckCircle2,
  Lock,
  Users,
  HeartHandshake,
  Palette,
  Upload,
  Link2,
  Clock,
  BarChart3,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import {
  WALK_UNLOCK_ROADMAP,
  IMMORTAL_AURA_LIST,
  resolveEffectiveImmortalAura,
  resolveWalkMediaUrl,
  resolveWalkRpgRank,
} from '../utils/walkOfFameStickers';

const REWARD_HINT_BY_PCT = Object.fromEntries(WALK_UNLOCK_ROADMAP.map((r) => [r.pct, r.short]));

function DossierLockBanner({ requiredPct, tierTitle, rewardLabel }) {
  return (
    <div className="rounded-xl bg-zinc-950/75 border border-dashed border-zinc-700/80 p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0 text-zinc-400">
          <Lock className="w-3.5 h-3.5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-black text-zinc-300 truncate">{rewardLabel} bloqueado</p>
          <p className="text-[11px] text-zinc-500">
            Alcance <strong className="text-amber-400">{requiredPct}%</strong> ({tierTitle}) para liberar
          </p>
        </div>
      </div>
      <span className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-[10px] font-black text-zinc-400 shrink-0">
        🔒 {requiredPct}%
      </span>
    </div>
  );
}

export default function WalkOfFameDossierModal({
  star,
  onClose,
  onAddMovie,
  onUpdatePreferences,
  onUploadCustomSkin,
  onOpenTimeline,
}) {
  const [filmTab, setFilmTab] = useState('watched');
  const [showCustomSkinBox, setShowCustomSkinBox] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [customLabelInput, setCustomLabelInput] = useState('');
  const [uploadingSkin, setUploadingSkin] = useState(false);
  const [isBioOpen, setIsBioOpen] = useState(false);
  const [selectedMemberName, setSelectedMemberName] = useState(null);

  const watchedCount = star?.watchedFilms?.length || 0;
  useEffect(() => {
    setFilmTab(watchedCount > 0 ? 'watched' : 'pending');
    setShowCustomSkinBox(false);
    setCustomUrlInput('');
    setCustomLabelInput('');
  }, [star?.id, watchedCount]);

  useEffect(() => {
    setSelectedMemberName(null);
    setIsBioOpen(false);
  }, [star?.id]);

  useEffect(() => {
    if (!star) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [star, onClose]);

  if (!star) return null;

  const isDiamond = star.isDiamond;
  const accentHex = star.accentHex || '#f59e0b';
  const pct = Number(star.percentage || 0);
  const unlocks = star.unlocks || {
    quoteUnlocked: pct >= 15,
    curiosity1Unlocked: pct >= 30,
    skinsUnlocked: pct >= 45,
    curiosities23Unlocked: pct >= 60,
    timelineUnlocked: pct >= 75,
    immortalUnlocked: pct >= 90,
  };
  const skinOptions = Array.isArray(star.skinOptions) ? star.skinOptions : [];
  const activePortrait = resolveWalkMediaUrl(
    unlocks.skinsUnlocked && star.activePhotoUrl ? star.activePhotoUrl : star.photoUrl
  );
  const extraStars = Number(star.extraStars || 0);
  const currentAura = resolveEffectiveImmortalAura(star.immortalAura || 'prism', extraStars).id;
  const rpgRank = star.rpgRank || resolveWalkRpgRank(pct, extraStars);

  const groupMembers = Array.isArray(star.groupMembers) ? star.groupMembers : [];
  const activeMember =
    star.kind === 'group' && selectedMemberName
      ? groupMembers.find((m) => m.name === selectedMemberName) || null
      : null;

  const displayPortrait = activeMember
    ? resolveWalkMediaUrl(activeMember.photoUrl) || activePortrait
    : activePortrait;
  const displayName = activeMember ? activeMember.name : star.name;
  const displayClassLabel =
    activeMember?.rpgClassLabel || star.rpgClassLabel || star.rpgTitle || star.tagline;
  const displayBioSource = activeMember ? activeMember.bioSource || star.bioSource : star.bioSource;
  const displayBiography = activeMember ? activeMember.biography || star.biography : star.biography;
  const displayLifespan = activeMember ? activeMember.lifespanLabel : star.lifespanLabel;
  const displayBirthdayBr = activeMember ? activeMember.birthdayBr : star.birthdayBr;
  const displayDeathdayBr = activeMember ? activeMember.deathdayBr : star.deathdayBr;
  const displayIsDeceased = activeMember ? Boolean(activeMember.isDeceased) : Boolean(star.isDeceased);
  const displayPlaceOfBirth = activeMember ? activeMember.placeOfBirth : star.placeOfBirth;
  const displayWatchedCount = activeMember ? Number(activeMember.watchedCount || 0) : Number(star.watchedCount || 0);
  const displayAvgRating =
    activeMember !== null ? activeMember.avgUserRating : star.avgUserRating;
  const displayTopFilm =
    activeMember !== null
      ? activeMember.topUserFilm
      : star.topUserFilm || (star.topUserFilmTitle ? { title: star.topUserFilmTitle } : null);
  const displayWorstFilm = activeMember !== null ? activeMember.worstUserFilm : star.worstUserFilm;
  const displayOscarWins = activeMember
    ? Number(activeMember.oscarWins || 0)
    : Number(star.oscarWins || 0);
  const displayOscarNominations = activeMember
    ? Number(activeMember.oscarNominations || 0)
    : Number(star.oscarNominations || 0);

  const handleSaveUrlSkin = async (e) => {
    e.preventDefault();
    if (!customUrlInput.trim() || !onUploadCustomSkin) return;
    setUploadingSkin(true);
    try {
      await onUploadCustomSkin(
        star.id,
        {
          url: customUrlInput.trim(),
          label: customLabelInput.trim() || 'Foto via Link',
        },
        Boolean(star.isSimulated)
      );
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
      await onUploadCustomSkin(
        star.id,
        {
          file,
          label: customLabelInput.trim() || file.name.replace(/\.[^.]+$/, '') || 'Minha Foto',
        },
        Boolean(star.isSimulated)
      );
      setShowCustomSkinBox(false);
    } finally {
      setUploadingSkin(false);
      e.target.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-3xl bg-zinc-950 border shadow-2xl text-zinc-100"
        style={{
          borderColor: isDiamond ? 'rgba(56, 189, 248, 0.55)' : `${accentHex}55`,
          boxShadow: isDiamond
            ? '0 0 60px rgba(56, 189, 248, 0.2), 0 25px 60px rgba(0,0,0,0.85)'
            : `0 0 50px ${accentHex}22, 0 25px 60px rgba(0,0,0,0.85)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Spotlight de topo */}
        <div
          className="h-1.5 w-full sticky top-0 z-20"
          style={{
            background: isDiamond
              ? 'linear-gradient(90deg, #38bdf8, #a855f7, #f59e0b, #38bdf8)'
              : `linear-gradient(90deg, transparent, ${accentHex}, transparent)`,
          }}
        />

        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="sticky top-4 float-right mr-4 mt-4 z-30 p-2 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Fechar Dossiê"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* ===============================================================
              COLUNA ESQUERDA: Retrato VIP + Dados Biográficos + Stats Pessoais
             =============================================================== */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Moldura do Retrato */}
            <div
              className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border-2 shadow-xl"
              style={{
                borderColor: isDiamond ? '#38bdf8' : accentHex,
              }}
            >
              {displayPortrait ? (
                <img
                  src={displayPortrait}
                  alt={displayName}
                  className={`w-full h-full object-cover object-top transition-all duration-500 ${
                    pct < 15 ? 'grayscale contrast-110 brightness-60' : ''
                  }`}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-6xl bg-zinc-900">
                  <span>{star.icon}</span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />

              {/* Selo do Álbum e Homenagem */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-black/75 border border-white/15 font-mono text-xs font-black text-amber-300">
                    #{String(star.albumNumber).padStart(3, '0')}
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-black/80 border border-amber-400/50 font-mono text-[11px] font-black text-amber-200">
                    RANK {rpgRank}
                  </span>
                  {star.isSimulated && (
                    <span className="px-2 py-1 rounded-lg bg-purple-500/85 border border-purple-300/60 text-[10px] font-black text-white">
                      🧪 PRÉVIA
                    </span>
                  )}
                  {displayIsDeceased && (
                    <span className="px-2 py-1 rounded-lg bg-zinc-900/90 border border-zinc-600/60 text-[10px] font-bold text-zinc-200 flex items-center gap-1">
                      <HeartHandshake className="w-3 h-3 text-amber-300" /> In Memoriam
                    </span>
                  )}
                </div>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wide border"
                    style={{
                      backgroundColor: `${accentHex}26`,
                      borderColor: `${accentHex}66`,
                      color: isDiamond ? '#bae6fd' : '#fef3c7',
                    }}
                  >
                    <span>{star.statusIcon}</span>
                    <span>{star.statusLabel}</span>
                  </span>
                  <span className="font-mono text-xl font-black text-white drop-shadow">
                    {star.percentage}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800/90 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.max(star.percentage, star.watchedCount > 0 ? 4 : 0)}%`,
                      background: isDiamond
                        ? 'linear-gradient(90deg, #38bdf8, #a855f7, #f59e0b)'
                        : accentHex,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ===============================================================
                45%+ : SELETOR DE SKINS (FOTOS REAIS + PC UPLOAD / LINK)
               =============================================================== */}
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-purple-400" />
                  <span>Skins da Figurinha</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-300">
                  {unlocks.skinsUnlocked ? '✓ Liberado (45%+)' : '🔒 45%'}
                </span>
              </div>

              {skinOptions.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {skinOptions.map((sk) => {
                    const isSelected =
                      (star.selectedSkinUrl && star.selectedSkinUrl === sk.imageUrl) ||
                      (!star.selectedSkinUrl && sk.id === 'default_portrait');
                    const imgSrc = resolveWalkMediaUrl(sk.imageUrl);
                    return (
                      <button
                        key={sk.id}
                        type="button"
                        disabled={!unlocks.skinsUnlocked}
                        onClick={() =>
                          onUpdatePreferences?.(
                            star.id,
                            {
                              selectedSkinUrl: sk.id === 'default_portrait' ? null : sk.imageUrl,
                              selectedSkinLabel: sk.id === 'default_portrait' ? null : sk.label,
                            },
                            Boolean(star.isSimulated)
                          )
                        }
                        title={`${sk.label} — ${sk.sublabel}`}
                        className={`group relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                          !unlocks.skinsUnlocked
                            ? 'border-zinc-800 opacity-45 grayscale cursor-not-allowed'
                            : isSelected
                            ? 'border-purple-400 ring-2 ring-purple-400/50 scale-[1.04] cursor-pointer'
                            : 'border-zinc-700 hover:border-purple-300/70 cursor-pointer'
                        }`}
                      >
                        <img src={imgSrc} alt={sk.label} className="w-full h-full object-cover object-top" />
                        {sk.kind === 'custom' && (
                          <span className="absolute top-0.5 left-0.5 px-1 rounded bg-purple-600/90 text-[8px] font-black text-white">
                            SUA
                          </span>
                        )}
                        {isSelected && unlocks.skinsUnlocked && (
                          <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-purple-400 text-zinc-950 text-[9px] font-black flex items-center justify-center">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-zinc-500">Carregando visuais dos filmes...</p>
              )}

              {!unlocks.skinsUnlocked ? (
                <p className="text-[11px] text-zinc-400">
                  Alcance <strong className="text-purple-300">45%</strong> (Queridinho dos Holofotes) para escolher visuais ou subir foto do seu computador!
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-zinc-400 truncate">
                      Ativa:{' '}
                      <strong className="text-purple-200">
                        {skinOptions.find((s) => s.imageUrl === (star.selectedSkinUrl || star.photoUrl))?.label ||
                          star.selectedSkinLabel ||
                          'Retrato Oficial'}
                      </strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowCustomSkinBox((v) => !v)}
                      className="px-2 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/45 text-[10px] font-black text-purple-200 cursor-pointer shrink-0"
                    >
                      {showCustomSkinBox ? 'Fechar' : '+ Foto PC / Link'}
                    </button>
                  </div>

                  {showCustomSkinBox && (
                    <form
                      onSubmit={handleSaveUrlSkin}
                      className="rounded-xl bg-zinc-950/90 border border-purple-500/35 p-2.5 flex flex-col gap-2"
                    >
                      <input
                        type="text"
                        value={customLabelInput}
                        onChange={(e) => setCustomLabelInput(e.target.value)}
                        placeholder="Nome opcional (ex: Bastidores 1994)"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
                      />
                      <div className="flex items-center gap-1.5">
                        <div className="relative flex-1">
                          <Link2 className="w-3.5 h-3.5 text-zinc-500 absolute left-2 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            value={customUrlInput}
                            onChange={(e) => setCustomUrlInput(e.target.value)}
                            placeholder="Cole o link da imagem (https://...)"
                            className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={uploadingSkin || !customUrlInput.trim()}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-zinc-950 font-black text-[10px] cursor-pointer shrink-0"
                        >
                          Usar Link
                        </button>
                      </div>

                      <label className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-dashed border-purple-400/50 text-[11px] font-bold text-purple-200 flex items-center justify-center gap-1.5 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingSkin ? 'Enviando...' : 'Ou escolher imagem do computador'}</span>
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

            {/* ===============================================================
                90%+ : MÉTODO 1 — EDIÇÃO ASSINADA (AURA + OBRA-PRIMA FAVORITA)
               =============================================================== */}
            <div className="rounded-2xl bg-gradient-to-br from-sky-500/10 via-zinc-900/85 to-zinc-950 border border-sky-500/30 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-sky-300">
                  💎 Edição Assinada da Carta
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-950 border border-sky-500/35 text-sky-200">
                  {unlocks.immortalUnlocked ? '✓ Ativa' : '🔒 90%'}
                </span>
              </div>

              {/* Aura da borda — 10 cores (Prisma em 90% + 1 nova cor por ★ extra) */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Aura Holográfica da Borda (10 Cores)
                  </span>
                  <span className="text-[10px] font-mono text-sky-300 font-bold">
                    {extraStars}★ disponível
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {IMMORTAL_AURA_LIST.map((aura) => {
                    const selected = currentAura === aura.id;
                    const auraUnlocked = unlocks.immortalUnlocked && extraStars >= aura.requiredStars;
                    return (
                      <button
                        key={aura.id}
                        type="button"
                        disabled={!auraUnlocked}
                        onClick={() =>
                          onUpdatePreferences?.(
                            star.id,
                            { immortalAura: aura.id },
                            Boolean(star.isSimulated)
                          )
                        }
                        title={
                          auraUnlocked
                            ? `${aura.label} (${aura.requiredStars === 0 ? '90%' : `${aura.requiredStars}★`})`
                            : `${aura.label} — requer ${
                                !unlocks.immortalUnlocked ? '90%' : `${aura.requiredStars}★`
                              }`
                        }
                        className={`p-1.5 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all ${
                          !auraUnlocked
                            ? 'border-zinc-800 opacity-45 cursor-not-allowed bg-zinc-950 text-zinc-500'
                            : selected
                            ? 'border-white bg-zinc-800/90 text-white shadow cursor-pointer'
                            : 'border-zinc-700/80 bg-zinc-900/80 text-zinc-300 hover:border-zinc-500 cursor-pointer'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-white/40"
                          style={{ background: aura.swatch }}
                        />
                        <span className="truncate max-w-full text-[9px]">{aura.shortLabel}</span>
                        <span className="font-mono text-[8px] opacity-80">
                          {auraUnlocked ? (aura.requiredStars === 0 ? '90%' : `${aura.requiredStars}★`) : `🔒${aura.requiredStars}★`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selo Obra-Prima Favorita na Carta */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  🏆 Obra-Prima Fixada na Figurinha
                </span>
                <select
                  disabled={!unlocks.immortalUnlocked || star.watchedFilms.length === 0}
                  value={star.signatureMovieId || ''}
                  onChange={(e) =>
                    onUpdatePreferences?.(
                      star.id,
                      { signatureMovieId: Number(e.target.value) },
                      Boolean(star.isSimulated)
                    )
                  }
                  className="w-full px-2.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-semibold text-zinc-100 disabled:opacity-50 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {star.watchedFilms.length === 0 ? (
                    <option value="">Nenhum filme assistido ainda</option>
                  ) : (
                    star.watchedFilms.map((f) => (
                      <option key={f.movieId} value={f.movieId}>
                        {f.title} {typeof f.userRating === 'number' ? `(★ ${f.userRating.toFixed(1)})` : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Identidade Biográfica */}
            <div className="rounded-2xl bg-zinc-900/75 border border-zinc-800 p-4 flex flex-col gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">
                    {displayIsDeceased ? 'Legado & Vida' : 'Idade & Nascimento'}
                  </span>
                  <span className="font-semibold text-zinc-100">
                    {displayLifespan || 'Data não informada'}
                    {displayBirthdayBr ? ` • ${displayBirthdayBr}` : ''}
                    {displayDeathdayBr ? ` → ✝ ${displayDeathdayBr}` : ''}
                  </span>
                </div>
              </div>

              {displayPlaceOfBirth && (
                <div className="flex items-center gap-2 text-zinc-300">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">
                      Origem
                    </span>
                    <span className="font-semibold text-zinc-100">{displayPlaceOfBirth}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-zinc-300">
                <Film className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">
                    Filmes & Estrelas Bônus
                  </span>
                  <span className="font-semibold text-zinc-100">
                    {displayWatchedCount} {displayWatchedCount === 1 ? 'filme catalogado' : 'filmes catalogados'}
                    {star.extraStars > 0 && (
                      <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black">
                        +{star.extraStars} ★ bônus
                      </span>
                    )}
                    {!activeMember && star.watchedCount >= star.ceiling && (
                      <span className="text-amber-300/80 font-normal block text-[11px]">
                        Faltam {star.filmsToNextExtraStar} filme(s) além do teto para +1 ★ (+60 XP)
                      </span>
                    )}
                    {!star.isStickerUnlocked && (
                      <span className="text-zinc-400 font-normal block text-[11px]">
                        Slot bloqueado (0%–14%): atinja 15% para liberar a figurinha
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-zinc-300">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">
                    Oscar & Academia
                  </span>
                  {displayOscarWins > 0 ? (
                    <span className="font-semibold text-amber-300">
                      🏆 {displayOscarWins} {displayOscarWins === 1 ? 'vitória' : 'vitórias'} / {displayOscarNominations}{' '}
                      {displayOscarNominations === 1 ? 'indicação' : 'indicações'}
                    </span>
                  ) : displayOscarNominations > 0 ? (
                    <span className="font-semibold text-blue-300">
                      🎬 {displayOscarNominations}{' '}
                      {displayOscarNominations === 1 ? 'indicação ao Oscar' : 'indicações ao Oscar'}
                    </span>
                  ) : (
                    <span className="font-normal text-zinc-400">
                      Sem indicações registradas na Academia
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Membros do Grupo/Dupla — Clicáveis para inspecionar individualmente */}
            {groupMembers.length > 0 && (
              <div className="rounded-2xl bg-zinc-900/75 border border-zinc-800 p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>Integrantes desta Estrela</span>
                  </div>
                  {activeMember && (
                    <button
                      type="button"
                      onClick={() => setSelectedMemberName(null)}
                      className="text-[10px] font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
                    >
                      Ver conjunto
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {groupMembers.map((gm) => {
                    const isViewing = activeMember?.name === gm.name;
                    const isCardProtagonist =
                      star.featuredMemberName === gm.name ||
                      (!star.featuredMemberName && groupMembers[0]?.name === gm.name);
                    return (
                      <div
                        key={gm.name}
                        className={`rounded-xl border transition-all ${
                          isViewing
                            ? 'bg-purple-500/15 border-purple-400/70 shadow'
                            : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedMemberName(isViewing ? null : gm.name)}
                          className="w-full flex items-center gap-3 p-2 text-left cursor-pointer"
                          title="Clique para ver biografia e estatísticas deste integrante"
                        >
                          {gm.photoUrl ? (
                            <img
                              src={resolveWalkMediaUrl(gm.photoUrl)}
                              alt={gm.name}
                              className="w-10 h-10 rounded-full object-cover object-top border border-amber-500/40 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm shrink-0">
                              🎬
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-zinc-100 truncate">{gm.name}</p>
                              {isCardProtagonist && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-400/45 text-[9px] font-black text-amber-200 shrink-0">
                                  Carta
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400 truncate">
                              {gm.watchedCount ?? 0} {(gm.watchedCount ?? 0) === 1 ? 'filme' : 'filmes'}
                              {typeof gm.avgUserRating === 'number' ? ` • ★ ${gm.avgUserRating.toFixed(1)}` : ''}
                              {gm.age ? ` • ${gm.age} anos` : ''}
                              {Number(gm.oscarWins || 0) > 0
                                ? ` • 🏆 ${gm.oscarWins}W/${gm.oscarNominations || 0}N`
                                : Number(gm.oscarNominations || 0) > 0
                                  ? ` • 🎬 ${gm.oscarNominations} ind.`
                                  : ''}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-purple-300 shrink-0">
                            {isViewing ? 'Ativo' : 'Ver →'}
                          </span>
                        </button>

                        {star.isStickerUnlocked && !isCardProtagonist && onUpdatePreferences && (
                          <div className="px-2 pb-2 pt-0.5 flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdatePreferences(
                                  star.id,
                                  { featuredMemberName: gm.name },
                                  Boolean(star.isSimulated)
                                )
                              }
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-[10px] font-bold text-amber-200 cursor-pointer transition-colors"
                            >
                              <RefreshCw className="w-2.5 h-2.5" />
                              <span>Definir foto na carta</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ===============================================================
              COLUNA DIREITA: Bio, Escada 15%-90%, Curiosidades & Posters
             =============================================================== */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* Cabeçalho */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-amber-400">
                  {star.kind === 'dublador'
                    ? '🎙️ Lenda da Dublagem'
                    : star.kind === 'group'
                    ? '👥 Estrela Coletiva'
                    : '⭐ Estrela Individual'}
                </span>
                <span className="text-[11px] font-mono font-black px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/45 text-amber-200">
                  RANK {rpgRank}
                </span>
                {displayClassLabel && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-purple-500/15 border border-purple-400/40 text-purple-200">
                    🎭 {displayClassLabel}
                  </span>
                )}
                {displayOscarWins > 0 && (
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/50 text-amber-300">
                    🏆 {displayOscarWins} {displayOscarWins === 1 ? 'VITÓRIA' : 'VITÓRIAS'} / {displayOscarNominations}{' '}
                    {displayOscarNominations === 1 ? 'INDICAÇÃO' : 'INDICAÇÕES'}
                  </span>
                )}
                {displayOscarWins === 0 && displayOscarNominations > 0 && (
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-blue-950/60 border border-blue-500/50 text-blue-300">
                    🎬 {displayOscarNominations}{' '}
                    {displayOscarNominations === 1 ? 'INDICAÇÃO AO OSCAR' : 'INDICAÇÕES AO OSCAR'}
                  </span>
                )}
                <span className="text-[11px] font-mono text-zinc-400 px-2 py-0.5 rounded-md bg-zinc-900/70 border border-zinc-800/70">
                  Fonte Bio: {displayBioSource}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <span>{star.icon}</span>
                  <span>{displayName}</span>
                </h2>
                {activeMember && (
                  <button
                    type="button"
                    onClick={() => setSelectedMemberName(null)}
                    className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-purple-400/45 text-xs font-bold text-purple-200 cursor-pointer"
                  >
                    ← Voltar para {star.name}
                  </button>
                )}
              </div>
              <p className="text-sm text-amber-300/90 font-semibold mt-0.5">
                {activeMember ? activeMember.roleLabel : star.tagline}
              </p>
              <p className="text-xs text-zinc-400 mt-1">{star.knownFor}</p>
            </div>

            {/* Escada de Progressão 15% → 90% */}
            <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-4">
              <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Jornada na Calçada da Fama (15% → 90%)</span>
                </span>
                {star.nextMilestone ? (
                  <span className="text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                    Falta{star.nextMilestone.remainingFilms === 1 ? '' : 'm'}{' '}
                    <strong>{star.nextMilestone.remainingFilms}</strong> filme
                    {star.nextMilestone.remainingFilms === 1 ? '' : 's'} para{' '}
                    {star.nextMilestone.icon} {star.nextMilestone.label} ({star.nextMilestone.thresholdPct}%)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-sky-300 bg-sky-500/15 border border-sky-400/40 px-2.5 py-1 rounded-lg">
                    💎 Nível Máximo Imortal Conquistado!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {(star.milestones || []).map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-xl p-2.5 border text-center transition-all ${
                      m.unlocked
                        ? 'bg-zinc-950/90 shadow-md'
                        : 'bg-zinc-950/40 border-zinc-800/70 opacity-60'
                    }`}
                    style={{
                      borderColor: m.unlocked ? `${m.accentHex}88` : undefined,
                      boxShadow: m.unlocked ? `0 0 18px ${m.accentHex}22` : undefined,
                    }}
                  >
                    <div className="text-lg">{m.icon}</div>
                    <div className="font-mono text-xs font-black text-white mt-0.5">
                      {m.thresholdPct}%
                    </div>
                    <div className="text-[10px] font-bold text-zinc-200 leading-tight mt-0.5">
                      {m.label}
                    </div>
                    <div className="text-[9px] text-amber-300/90 font-semibold leading-tight mt-1">
                      {REWARD_HINT_BY_PCT[m.thresholdPct] || ''}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 mt-1">
                      {m.unlocked ? '✓ Liberado' : `${m.targetCount} filmes`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ===============================================================
                BIOGRAFIA + MELHOR FILME / PIOR FILME / MÉDIA (COLAPSÁVEL)
               =============================================================== */}
            {(displayBiography || displayTopFilm || displayWorstFilm || typeof displayAvgRating === 'number') && (
              <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/90 p-4 sm:p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                    <span>📖 Biografia</span>
                    {displayBioSource && (
                      <span className="text-[10px] font-mono font-normal text-zinc-400">
                        ({displayBioSource})
                      </span>
                    )}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsBioOpen((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950/90 hover:bg-zinc-800 border border-zinc-700/80 text-[11px] font-bold text-zinc-200 cursor-pointer transition-colors"
                  >
                    {isBioOpen ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Ocultar Biografia</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-amber-300" />
                        <span>Ver Biografia</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Resumo Crítico: Média Geral + Melhor Filme + Pior Filme */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-2 rounded-xl bg-zinc-950/80 border border-amber-500/30 p-2.5 flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300/85">
                      Sua Média
                    </span>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <span className="font-mono text-base font-black text-white">
                        {typeof displayAvgRating === 'number' ? `★ ${displayAvgRating.toFixed(1)}` : '—'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {displayWatchedCount} {displayWatchedCount === 1 ? 'filme' : 'filmes'}
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-5 rounded-xl bg-zinc-950/80 border border-emerald-500/30 p-2.5 flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                      🏆 Melhor Filme
                    </span>
                    <div className="mt-1 flex flex-col gap-0.5">
                      <p className="text-xs font-bold text-zinc-100 leading-snug break-words">
                        {displayTopFilm?.title || 'Sem avaliação'}
                      </p>
                      {typeof displayTopFilm?.userRating === 'number' && (
                        <span className="text-[11px] font-mono font-black text-emerald-300">
                          ★ {displayTopFilm.userRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-5 rounded-xl bg-zinc-950/80 border border-rose-500/30 p-2.5 flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-300">
                      📉 Pior Filme
                    </span>
                    <div className="mt-1 flex flex-col gap-0.5">
                      <p className="text-xs font-bold text-zinc-100 leading-snug break-words">
                        {displayWorstFilm?.title || 'Sem avaliação'}
                      </p>
                      {typeof displayWorstFilm?.userRating === 'number' && (
                        <span className="text-[11px] font-mono font-black text-rose-300">
                          ★ {displayWorstFilm.userRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isBioOpen && displayBiography && (
                  <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line animate-fadeIn">
                    {displayBiography}
                  </p>
                )}
              </div>
            )}

            {/* ===============================================================
                15%+ FRASE MARCANTE
               =============================================================== */}
            <div className="rounded-2xl bg-zinc-900/55 border border-zinc-800/90 p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Quote className="w-4 h-4 text-amber-400" />
                  <span>Frase Marcante</span>
                </h3>
                <span className="text-[10px] font-mono font-bold text-zinc-400">
                  {unlocks.quoteUnlocked ? '🎟️ Desbloqueada (15%+)' : '🔒 15%'}
                </span>
              </div>

              {unlocks.quoteUnlocked ? (
                <div className="flex items-start gap-2.5 text-sm italic text-amber-100 bg-amber-500/10 border border-amber-500/25 rounded-xl p-3.5">
                  <Quote className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>"{star.quote}"</span>
                </div>
              ) : (
                <DossierLockBanner
                  requiredPct={15}
                  tierTitle="Teste de Elenco"
                  rewardLabel="Frase Marcante"
                />
              )}
            </div>

            {/* ===============================================================
                30%+ (1ª) & 60%+ (2ª e 3ª) CURIOSIDADES
               =============================================================== */}
            {Array.isArray(star.curiosities) && star.curiosities.length > 0 && (
              <div className="rounded-2xl bg-zinc-900/55 border border-zinc-800/90 p-4 flex flex-col gap-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Curiosidades de Bastidores</span>
                </h3>

                <ul className="space-y-2">
                  {/* Curiosidade #1 (30%+) */}
                  {star.curiosities[0] && (
                    unlocks.curiosity1Unlocked ? (
                      <li className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-200 bg-zinc-950/60 border border-zinc-800 rounded-xl p-3">
                        <span className="text-sky-300 font-black mt-0.5 shrink-0">🎬 #1</span>
                        <span>{star.curiosities[0]}</span>
                      </li>
                    ) : (
                      <li>
                        <DossierLockBanner
                          requiredPct={30}
                          tierTitle="Rouba-Cena"
                          rewardLabel="Curiosidade #1"
                        />
                      </li>
                    )
                  )}

                  {/* Curiosidades #2 e #3 (60%+) */}
                  {star.curiosities.length > 1 && (
                    unlocks.curiosities23Unlocked ? (
                      star.curiosities.slice(1).map((fact, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-200 bg-zinc-950/60 border border-amber-500/20 rounded-xl p-3"
                        >
                          <span className="text-amber-400 font-black mt-0.5 shrink-0">
                            🌟 #{idx + 2}
                          </span>
                          <span>{fact}</span>
                        </li>
                      ))
                    ) : (
                      <li>
                        <DossierLockBanner
                          requiredPct={60}
                          tierTitle="Estrela na Calçada"
                          rewardLabel="Curiosidades #2 e #3"
                        />
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* ===============================================================
                75%+ : LINHA DO TEMPO CINEMÁTICA & RAIO-X DAS DÉCADAS
               =============================================================== */}
            <div className="rounded-2xl bg-gradient-to-br from-sky-500/10 via-zinc-900/80 to-purple-500/10 border border-sky-400/35 p-4 sm:p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-xs font-black uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>Linha do Tempo Cinemática &amp; Raio-X das Décadas</span>
                </h3>
                <span className="text-[10px] font-mono font-bold text-zinc-400">
                  {unlocks.timelineUnlocked ? '🎞️ Liberado (75%+)' : '🔒 75%'}
                </span>
              </div>

              {unlocks.timelineUnlocked ? (
                <div className="flex flex-col gap-4">
                  {/* Botão Tela Escura Linha do Tempo Cinemática */}
                  <button
                    type="button"
                    onClick={() => onOpenTimeline?.(star)}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-400 to-amber-400 hover:brightness-110 text-zinc-950 font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.99] cursor-pointer"
                  >
                    <Clock className="w-4 h-4" />
                    <span>⏳ Ver Linha do Tempo Cinemática (Eixo Reto + Variação de Notas)</span>
                  </button>

                  {/* Raio-X das Décadas */}
                  <div className="rounded-xl bg-zinc-950/85 border border-zinc-800 p-3.5 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Raio-X das Décadas</span>
                      </span>
                      {star.decadeBreakdown?.favoriteDecade && (
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-400/40 font-mono text-[9px] font-black text-purple-200">
                          Era: {star.decadeBreakdown.favoriteDecade.label}
                        </span>
                      )}
                    </div>

                    {star.decadeBreakdown?.decades?.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {star.decadeBreakdown.decades.map((dec) => {
                          const maxDecCount = Math.max(
                            1,
                            ...star.decadeBreakdown.decades.map((d) => d.count)
                          );
                          const widthPct = Math.round((dec.count / maxDecCount) * 100);
                          return (
                            <div key={dec.decade} className="flex items-center gap-2 text-[11px] font-mono">
                              <span className="w-16 text-zinc-300 font-bold shrink-0">{dec.label}</span>
                              <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-purple-400 to-sky-400"
                                  style={{ width: `${Math.max(10, widthPct)}%` }}
                                />
                              </div>
                              <span className="w-20 text-right text-zinc-200 shrink-0">
                                {dec.count}x{' '}
                                <span className="text-amber-300">
                                  {dec.avgRating !== null ? `★${dec.avgRating.toFixed(1)}` : ''}
                                </span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-zinc-500">
                        Assista e avalie filmes dessa estrela para gerar o gráfico das décadas!
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <DossierLockBanner
                  requiredPct={75}
                  tierTitle="Lenda Viva do Set"
                  rewardLabel="Linha do Tempo Cinemática & Raio-X das Décadas"
                />
              )}
            </div>

            {/* Filmografia no Catálogo + Sugestões */}
            <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-4">
              <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFilmTab('watched')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      filmTab === 'watched'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Assistidos no Catálogo ({star.watchedFilms.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilmTab('pending')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      filmTab === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Para Completar ({star.pendingFilms.length})</span>
                  </button>
                </div>
              </div>

              {filmTab === 'watched' ? (
                star.watchedFilms.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400 text-sm">
                    Nenhum filme desta estrela encontrado no seu catálogo ainda. Veja a aba{' '}
                    <button
                      type="button"
                      onClick={() => setFilmTab('pending')}
                      className="text-amber-400 underline font-bold cursor-pointer"
                    >
                      Para Completar
                    </button>{' '}
                    para começar!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                    {star.watchedFilms.map((film) => (
                      <div
                        key={film.movieId}
                        className="rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/90 flex flex-col"
                      >
                        <div className="relative aspect-[2/3] bg-zinc-900">
                          {film.posterUrl ? (
                            <img
                              src={resolveWalkMediaUrl(film.posterUrl)}
                              alt={film.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl text-zinc-600">
                              🎬
                            </div>
                          )}
                          {film.userRating !== null && (
                            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-black">
                              ★ {film.userRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <div className="p-2.5 flex-1 flex flex-col justify-between gap-1.5">
                          <p className="text-xs font-bold text-zinc-100 line-clamp-2 leading-tight">
                            {film.title}
                          </p>
                          <div className="flex flex-col gap-0.5 text-[10px] text-zinc-500">
                            <span className="font-mono text-zinc-400 shrink-0">
                              {film.releaseYear || '—'}
                            </span>
                            {film.character && (
                              <span
                                className="text-[11px] font-medium text-amber-300/85 leading-snug line-clamp-2"
                                title={film.character}
                              >
                                {film.character}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {star.pendingFilms.map((film, idx) => (
                    <div
                      key={`${film.title}_${idx}`}
                      className="rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/80 flex flex-col group"
                    >
                      <div className="relative aspect-[2/3] bg-zinc-900">
                        {film.posterUrl ? (
                          <img
                            src={film.posterUrl}
                            alt={film.title}
                            className="w-full h-full object-cover grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 text-center bg-zinc-900/90">
                            <Film className="w-6 h-6 text-zinc-600" />
                            <span className="text-[10px] text-zinc-500 font-semibold line-clamp-2">
                              {film.title}
                            </span>
                          </div>
                        )}
                        {onAddMovie && (
                          <button
                            type="button"
                            onClick={() => onAddMovie(film.title, film.releaseYear)}
                            className="absolute bottom-2 left-2 right-2 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-[11px] flex items-center justify-center gap-1 shadow-lg transition-transform active:scale-95 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Cadastrar</span>
                          </button>
                        )}
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col justify-between gap-1.5">
                        <p className="text-xs font-bold text-zinc-200 line-clamp-2 leading-tight">
                          {film.title}
                        </p>
                        <div className="flex flex-col gap-0.5 text-[10px] text-zinc-500">
                          <span className="font-mono text-zinc-400 shrink-0">
                            {film.releaseYear || 'Sugerido'}
                          </span>
                          {film.character && (
                            <span
                              className="text-[11px] font-medium text-zinc-300/85 leading-snug line-clamp-2"
                              title={film.character}
                            >
                              {film.character}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
