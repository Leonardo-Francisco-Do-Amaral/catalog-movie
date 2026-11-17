import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Mic,
  RefreshCw,
  Search,
  Sparkles,
  Gift,
  FlaskConical,
  CheckCircle2,
  X,
  RotateCcw,
  Users,
  Zap,
} from 'lucide-react';
import {
  fetchTvVoiceAlbum,
  openTvVoicePack,
  stickAllTvVoiceStickers,
  stickTvVoiceSticker,
  syncTvVoiceAlbum,
  unstickTvVoiceSticker,
  updateTvVoicePreferences,
  uploadTvVoiceCustomSkin,
} from '../utils/tvApi';
import {
  VOICE_RARITY_THEMES,
  applySimulatedVoiceMilestone,
} from '../utils/tvVoiceStickers';
import { playTvStickerPasteSound } from '../utils/tvAudio';
import TvVoiceStickerCard from '../components/TvVoiceStickerCard';
import TvVoiceDossierModal, { VisualNovelCutInOverlay } from '../components/TvVoiceDossierModal';
import TvVoicePackModal from '../components/TvVoicePackModal';

const CATEGORY_TABS = [
  { id: 'all', label: '🌐 Todos (JP + EUA)' },
  { id: 'jp', label: '🇯🇵 Seiyūs do Japão' },
  { id: 'us', label: '🇺🇸 Vozes dos EUA' },
  { id: 'ready', label: '🎁 Invocações / Colar' },
  { id: 'guardians', label: '🛡️ Guardiões ★' },
  { id: 'shared', label: '🎬+⛩️ Compartilhados Cinema' },
];

const RARITY_FILTERS = [
  { id: 'all', label: 'Todas Raridades' },
  { id: 'stuck', label: 'Somente Coladas' },
  { id: 'mythic', label: '🩸 Mítica Suprema UR (20 obras)' },
  { id: 'legendary', label: '🌟 Lendária LR (14 obras)' },
  { id: 'super_rare', label: '⚡ Super Rara SR (11 obras)' },
  { id: 'rare', label: '🧪 Rara R (8 obras)' },
  { id: 'uncommon', label: '⚔️ Incomum UC (5 obras)' },
  { id: 'common', label: '🎟️ Comum C (3 obras)' },
  { id: 'locked', label: '🔒 Lacradas 封印 (0–2 obras)' },
];

const LAB_JUMP_PRESETS = [
  { label: 'Dados Reais', works: null, badge: 'Real' },
  { label: '0 Lacrada', works: 0, badge: '0 obras' },
  { label: '3 C', works: 3, badge: '+30 XP' },
  { label: '5 UC', works: 5, badge: '+55 XP' },
  { label: '8 R', works: 8, badge: '+75 XP' },
  { label: '11 SR', works: 11, badge: '+90 XP' },
  { label: '14 LR', works: 14, badge: '+130 XP' },
  { label: '20 UR', works: 20, badge: '+180 XP' },
  { label: '29 UR+3★', works: 29, badge: '+3★' },
  { label: '38 UR+6★', works: 38, badge: '+6★' },
  { label: '50 UR+★10', works: 50, badge: '★ 10' },
];

const CARD_VISUAL_THEMES = [
  { id: 'prism_gacha', label: '✨ Holo-Prismático', desc: 'SSR Reflexo Arco-íris & Sakura' },
  { id: 'shonen_manga', label: '📖 Mangá Shonen', desc: 'Jump P&B + Speedlines & Neon' },
  { id: 'cyber_mecha', label: '⚡ Cyber-Mecha', desc: 'HUD Akihabara & Laser 45°' },
  { id: 'dark_grimoire', label: '🔥 Grimório Dourado', desc: 'RPG Carmesim & Runas Alquimia' },
];

export default function TvVoiceAlbumPage({ onAddShowByTitle, onEditShowById, onXpUpdated }) {
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [stickingAll, setStickingAll] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [categoryTab, setCategoryTab] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedVoiceId, setSelectedVoiceId] = useState(null);
  const [justStuckId, setJustStuckId] = useState(null);
  const [activePackModal, setActivePackModal] = useState(null);

  // Super Laboratório de Testes
  const [showLab, setShowLab] = useState(false);
  const [simWorks, setSimWorks] = useState(null);
  const [activeVisualTheme, setActiveVisualTheme] = useState('prism_gacha');
  const [globalFlip, setGlobalFlip] = useState(false);
  const [globalSwapArt, setGlobalSwapArt] = useState(false);
  const [cutInVoice, setCutInVoice] = useState(null);

  const onXpUpdatedRef = useRef(onXpUpdated);
  useEffect(() => {
    onXpUpdatedRef.current = onXpUpdated;
  }, [onXpUpdated]);

  const loadAlbum = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetchTvVoiceAlbum();
      setAlbum(res.data || null);
      if (res.xpStatus) onXpUpdatedRef.current?.(res.xpStatus);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error || err.message || 'Erro ao carregar Fichário de Dubladores.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlbum();
  }, [loadAlbum]);

  const applyServerPayload = useCallback((res, feedbackText = '') => {
    if (res?.data) setAlbum(res.data);
    if (res?.xpStatus) onXpUpdatedRef.current?.(res.xpStatus);
    if (feedbackText) {
      setActionMsg(feedbackText);
      setTimeout(() => {
        setActionMsg((curr) => (curr === feedbackText ? '' : curr));
      }, 4500);
    }
  }, []);

  const handleSyncVoices = async () => {
    setSyncing(true);
    setErrorMsg('');
    try {
      const res = await syncTvVoiceAlbum();
      const sr = res.syncResult;
      applyServerPayload(
        res,
        sr
          ? `Sincronização concluída: ${sr.syncedShows} obra(s) atualizada(s) com ${sr.totalCreditsSaved} crédito(s) + Wikipédia atualizada!`
          : 'Elencos e personagens sincronizados!'
      );
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Erro ao sincronizar elencos.');
    } finally {
      setSyncing(false);
    }
  };

  const handleStickVoice = async (voiceId) => {
    try {
      playTvStickerPasteSound();
      const res = await stickTvVoiceSticker(voiceId);
      setJustStuckId(voiceId);
      setTimeout(() => {
        setJustStuckId((curr) => (curr === voiceId ? null : curr));
      }, 1100);
      applyServerPayload(
        res,
        res.xpGained > 0
          ? `Carta invocada e colada no fichário! +${res.xpGained} XP Sakura resgatados!`
          : 'Carta colada no fichário!'
      );
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    }
  };

  const handleUnstickVoice = async (voiceId) => {
    try {
      const res = await unstickTvVoiceSticker(voiceId);
      applyServerPayload(res, 'Carta recolhida do fichário (XP conquistado mantido).');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    }
  };

  const handleStickAll = async () => {
    setStickingAll(true);
    try {
      playTvStickerPasteSound();
      const res = await stickAllTvVoiceStickers();
      applyServerPayload(
        res,
        `${res.stuckCount} carta(s) coladas no fichário (+${res.xpGained} XP)!`
      );
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setStickingAll(false);
    }
  };

  const handleOpenPackById = (packId) => {
    const packs = album?.pendingPacks || [];
    const targetPack = packs.find((p) => p.packId === packId) || packs[0];
    if (!targetPack) return;
    const targetVoice = (album?.voices || []).find((v) => v.id === targetPack.voiceId);
    if (!targetVoice) return;
    setActivePackModal({ pack: targetPack, voice: targetVoice });
  };

  const handleClaimPack = async (pack, voice) => {
    try {
      const res = pack?.packId
        ? await openTvVoicePack(pack.packId)
        : await stickTvVoiceSticker(voice.id);
      setJustStuckId(voice.id);
      setTimeout(() => {
        setJustStuckId((curr) => (curr === voice.id ? null : curr));
      }, 1200);
      applyServerPayload(
        res,
        res.xpGained > 0
          ? `Pacote aberto e ${voice.name} colada no fichário (+${res.xpGained} XP)!`
          : `${voice.name} colada no fichário!`
      );

      const nextPacks = res.data?.pendingPacks || [];
      if (nextPacks.length > 0) {
        const nextP = nextPacks[0];
        const nextV = (res.data?.voices || []).find((v) => v.id === nextP.voiceId);
        if (nextV) {
          setActivePackModal({ pack: nextP, voice: nextV });
          return;
        }
      }
      setActivePackModal(null);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
      setActivePackModal(null);
    }
  };

  const handleTestPackAnimation = (voice, targetWorks = 20) => {
    const target = targetWorks ?? Math.max(3, voice.totalWorksCount || 20);
    setActivePackModal({
      pack: {
        isSimulated: true,
        fromPct: 0,
        toPct: target >= 20 ? 100 : target >= 14 ? 75 : target >= 11 ? 60 : target >= 8 ? 45 : target >= 5 ? 30 : 15,
        extraStarsUnlocked: target > 20 ? Math.floor((target - 20) / 3) : 0,
      },
      voice,
    });
  };

  const handleUpdatePreferences = async (voiceId, prefs) => {
    try {
      const res = await updateTvVoicePreferences(voiceId, prefs);
      applyServerPayload(res);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    }
  };

  const handleUploadCustomSkin = async (voiceId, skinPayload) => {
    try {
      const res = await uploadTvVoiceCustomSkin(voiceId, skinPayload);
      applyServerPayload(res, 'Imagem customizada aplicada à carta!');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    }
  };

  // Simulação instantânea em memória de todas as cartas
  const simulatedVoices = useMemo(() => {
    const raw = album?.voices || [];
    if (simWorks === null) return raw;
    return raw.map((v) => applySimulatedVoiceMilestone(v, simWorks));
  }, [album, simWorks]);

  // Radar de Sinergia de Elenco (Animes e Séries com 2+ Dubladores Desbloqueados)
  const castSynergies = useMemo(() => {
    const unlockedVoices = simulatedVoices.filter((v) => v.totalWorksCount >= 3 || v.isStuck);
    const byWork = new Map();

    unlockedVoices.forEach((voice) => {
      (voice.combinedWorks || []).forEach((w) => {
        if (!w.title) return;
        const key = w.title.toLowerCase();
        if (!byWork.has(key)) {
          byWork.set(key, {
            title: w.title,
            source: w.source,
            kindLabel: w.kindLabel,
            members: [],
          });
        }
        const entry = byWork.get(key);
        if (!entry.members.some((m) => m.id === voice.id)) {
          entry.members.push({
            id: voice.id,
            name: voice.name,
            character: w.character || w.characterName,
          });
        }
      });
    });

    return Array.from(byWork.values())
      .filter((s) => s.members.length >= 2)
      .sort((a, b) => b.members.length - a.members.length)
      .slice(0, 10);
  }, [simulatedVoices]);

  const filteredVoices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return simulatedVoices.filter((v) => {
      if (categoryTab === 'jp' && v.nationalityCode !== 'jp') return false;
      if (categoryTab === 'us' && v.nationalityCode !== 'us') return false;
      if (categoryTab === 'shared' && v.sourceOrigin !== 'shared_cinema') return false;
      if (categoryTab === 'guardians' && !v.isFavoriteGuardian && v.extraStars <= 0) return false;
      if (
        categoryTab === 'ready' &&
        !(v.isStickerUnlocked && (!v.isStuck || v.hasRarityUpgradeToStick || v.pendingPackId))
      ) {
        return false;
      }

      if (rarityFilter === 'stuck' && !v.isStuck) return false;
      if (rarityFilter !== 'all' && rarityFilter !== 'stuck' && v.currentTier !== rarityFilter) {
        return false;
      }

      if (q) {
        const worksText = (v.combinedWorks || [])
          .map((w) => `${w.title} ${w.character || w.characterName || ''}`)
          .join(' ');
        const hay = `${v.name} ${v.knownFor} ${v.rpgTitle} ${worksText}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [simulatedVoices, categoryTab, rarityFilter, searchQuery]);

  const selectedVoice = useMemo(() => {
    if (!selectedVoiceId) return null;
    return simulatedVoices.find((v) => v.id === selectedVoiceId) || null;
  }, [simulatedVoices, selectedVoiceId]);

  if (loading) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-pink-400 animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Carregando Fichário Seiyū TCG &amp; Cartas Colecionáveis...
        </span>
      </div>
    );
  }

  if (errorMsg && !album) {
    return (
      <div className="max-w-xl mx-auto bg-rose-500/10 border border-rose-500/40 rounded-2xl p-6 text-center space-y-3">
        <p className="text-sm text-rose-200 font-bold">{errorMsg}</p>
        <button
          type="button"
          onClick={loadAlbum}
          className="px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-black uppercase cursor-pointer"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const summary = album?.summary || {
    totalVoices: 0,
    unlockedVoices: 0,
    stuckVoices: 0,
    pendingPacksCount: 0,
    jpCount: 0,
    usCount: 0,
    sharedMoviesMatches: 0,
    tvShowsMatches: 0,
    totalVoiceXp: 0,
    rarityCounts: {},
    totalExtraStars: 0,
  };

  const pendingPacks = album?.pendingPacks || [];
  const albumPct =
    summary.totalVoices > 0
      ? Math.round((summary.stuckVoices / summary.totalVoices) * 100)
      : 0;
  const readyToStickCount = simulatedVoices.filter(
    (v) => v.isStickerUnlocked && (!v.isStuck || v.hasRarityUpgradeToStick || v.unclaimedXp > 0)
  ).length;

  return (
    <div className="space-y-6">
      {/* Cut-In de Voz em tela cheia se acionado pelo botão de teste */}
      {cutInVoice && (
        <VisualNovelCutInOverlay
          voice={cutInVoice}
          accentHex="#f472b6"
          onClose={() => setCutInVoice(null)}
        />
      )}

      {/* =====================================================================
          HERO DO FICHÁRIO SEIYŪ TCG
         ===================================================================== */}
      <div className="bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-zinc-950 border border-purple-500/35 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-pink-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fichário Colecionável Seiyū TCG • Teto 20 Obras</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-zinc-100 flex items-center gap-2">
              <Mic className="w-6 h-6 text-pink-400" />
              <span>Santuário dos Seiyūs &amp; Cartas TCG Colecionáveis</span>
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Cada <strong>🇯🇵 Seiyū</strong> e <strong>🇺🇸 Voz dos EUA</strong> soma filmes do Cinema e animes/séries daqui! Desbloqueie de <strong>15% (3 obras · Comum C)</strong> até <strong>100% (20 obras · Mítica Suprema UR)</strong>, alterne o foco da arte, vire as cartas em <strong>45%+</strong> para a Ficha de Poder 3D e ganhe <strong>+1 ★ (+75 XP)</strong> a cada +3 obras extras infinitamente!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 shrink-0">
            <div className="bg-zinc-950/85 border border-purple-500/35 rounded-2xl px-3.5 py-2.5 text-center">
              <div className="text-[9.5px] font-black uppercase text-zinc-400">Coladas</div>
              <div className="text-xl font-black text-purple-200">
                {summary.stuckVoices} / {summary.totalVoices}
              </div>
              <div className="text-[10px] text-zinc-500">{albumPct}% do fichário</div>
            </div>

            <div className="bg-zinc-950/85 border border-pink-500/35 rounded-2xl px-3.5 py-2.5 text-center">
              <div className="text-[9.5px] font-black uppercase text-zinc-400">XP do Fichário</div>
              <div className="text-xl font-black text-pink-300">+{summary.totalVoiceXp}</div>
              <div className="text-[10px] text-zinc-500">
                {(summary.totalExtraStars || 0) > 0 ? `${summary.totalExtraStars}★ Prestígio` : 'XP Sakura'}
              </div>
            </div>

            <div className="bg-zinc-950/85 border border-amber-500/35 rounded-2xl px-3.5 py-2.5 text-center">
              <div className="text-[9.5px] font-black uppercase text-zinc-400">Obras Somadas</div>
              <div className="text-xl font-black text-amber-200">
                {summary.sharedMoviesMatches + summary.tvShowsMatches}
              </div>
              <div className="text-[10px] text-zinc-500">
                🎬 {summary.sharedMoviesMatches} · ⛩️ {summary.tvShowsMatches}
              </div>
            </div>
          </div>
        </div>

        {/* Barra de progresso global do Fichário + Distribuição das Raridades */}
        <div className="space-y-2">
          <div className="w-full h-2 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 transition-all duration-500"
              style={{ width: `${Math.max(albumPct > 0 ? 3 : 0, albumPct)}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex flex-wrap items-center gap-3 font-bold">
              {['common', 'uncommon', 'rare', 'super_rare', 'legendary', 'mythic'].map((key) => {
                const t = VOICE_RARITY_THEMES[key];
                const cnt = summary.rarityCounts?.[key] || 0;
                return (
                  <span key={key} style={{ color: t.accentHex }}>
                    {t.icon} {t.label} ({t.tcgCode}): {cnt}
                  </span>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {pendingPacks.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleOpenPackById(pendingPacks[0].packId)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-pink-500 hover:brightness-110 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow-lg animate-pulse cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Abrir Pacote ({pendingPacks.length})</span>
                </button>
              )}

              {readyToStickCount > 0 && simWorks === null && (
                <button
                  type="button"
                  disabled={stickingAll}
                  onClick={handleStickAll}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 font-black text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{stickingAll ? 'Colando...' : `Colar Todas (${readyToStickCount})`}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowLab((v) => !v)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  showLab || simWorks !== null
                    ? 'bg-purple-500/25 border-purple-400 text-purple-200'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Laboratório Sandbox</span>
              </button>

              <button
                type="button"
                disabled={syncing}
                onClick={handleSyncVoices}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Sincronizando...' : 'Sincronizar API & Wiki'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Radar de Sinergia de Elenco (Animes e Séries com 2+ Dubladores Desbloqueados) */}
        {castSynergies.length > 0 && (
          <div className="bg-zinc-950/85 border border-amber-500/35 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-300">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Radar de Sinergia de Elenco ({castSynergies.length} Combos Ativos)</span>
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[11px] font-bold text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Limpar Filtro</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {castSynergies.map((sq) => {
                const isActive = searchQuery.toLowerCase() === sq.title.toLowerCase();
                return (
                  <button
                    key={sq.title}
                    type="button"
                    onClick={() => setSearchQuery(isActive ? '' : sq.title)}
                    title={sq.members.map((m) => `${m.name}${m.character ? ` (${m.character})` : ''}`).join(' • ')}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      isActive
                        ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                        : 'bg-zinc-900/90 border-amber-500/30 text-amber-100 hover:bg-amber-500/20 hover:border-amber-400/60'
                    }`}
                  >
                    <span>⚔️ {sq.title}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-black ${
                        isActive ? 'bg-zinc-950 text-amber-300' : 'bg-amber-400/20 text-amber-300'
                      }`}
                    >
                      {sq.members.length} vozes
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PAINEL DO SUPER LABORATÓRIO DE TESTES 100% LIBERADO */}
        {(showLab || simWorks !== null) && (
          <div className="bg-zinc-950/95 border-2 border-purple-500/50 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/25 pb-3">
              <div className="flex items-center gap-2 text-sm font-black text-purple-200">
                <FlaskConical className="w-5 h-5 text-purple-400 animate-pulse" />
                <span>Super Laboratório Criativo — Testes TCG 100% Liberados</span>
              </div>
              {simWorks !== null && (
                <button
                  type="button"
                  onClick={() => setSimWorks(null)}
                  className="text-xs font-bold text-pink-300 hover:text-pink-100 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-pink-500/20 border border-pink-400/40 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Dados Reais do Catálogo</span>
                </button>
              )}
            </div>

            {/* 1. SLIDER CONTÍNUO DE OBRAS (0 a 60 obras) */}
            <div className="space-y-1.5 bg-zinc-900/80 border border-zinc-800 rounded-xl p-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-zinc-300">
                  Progresso Contínuo: <strong className="text-pink-400 text-sm">{simWorks !== null ? simWorks : 'Real'}</strong> obras assistidas
                </span>
                <span className="text-[11px] font-bold text-purple-300">
                  {simWorks !== null
                    ? simWorks >= 20
                      ? `100% Mítica Suprema UR ${simWorks > 20 ? `(+${Math.floor((simWorks - 20) / 3)}★ Prestígio)` : ''}`
                      : simWorks >= 14
                      ? '75% Lendária LR'
                      : simWorks >= 11
                      ? '60% Super Rara SR'
                      : simWorks >= 8
                      ? '45% Rara R'
                      : simWorks >= 5
                      ? '30% Incomum UC'
                      : simWorks >= 3
                      ? '15% Comum C'
                      : '0%–14% Lacrada (封印)'
                    : 'Escala 0 a 60 Obras'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="1"
                value={simWorks !== null ? simWorks : 20}
                onChange={(e) => setSimWorks(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>0 Lacrada</span>
                <span>3 C</span>
                <span>5 UC</span>
                <span>8 R</span>
                <span>11 SR</span>
                <span>14 LR</span>
                <span className="text-pink-400 font-bold">20 UR (100%)</span>
                <span>29 (+3★)</span>
                <span>38 (+6★)</span>
                <span className="text-amber-400 font-bold">50 (+★10)</span>
                <span>60 (+★13)</span>
              </div>
            </div>

            {/* 2. BOTÕES DE SALTO IMEDIATO DE MARCOS */}
            <div className="space-y-1">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-zinc-400 block">
                Saltos Rápidos de Raridade &amp; Estrelas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {LAB_JUMP_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setSimWorks(p.works)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      simWorks === p.works
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 border-pink-400 text-white shadow-lg'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="text-[9.5px] opacity-75 font-mono">({p.badge})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. SELEÇÃO DOS 4 MOTORES VISUAIS EM TEMPO REAL */}
            <div className="space-y-1">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-zinc-400 block">
                Motor / Tema Visual da Carta (Tempo Real):
              </span>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {CARD_VISUAL_THEMES.map((th) => {
                  const isSelected = activeVisualTheme === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setActiveVisualTheme(th.id)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-pink-500/20 border-pink-400 text-white shadow-[0_0_15px_rgba(236,72,153,0.35)]'
                          : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-black">{th.label}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5 truncate">{th.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. CONTROLES DE TESTE INTERATIVO */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-purple-500/25">
              <button
                type="button"
                onClick={() => setGlobalFlip((prev) => !prev)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 text-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{globalFlip ? 'Mostrar Frente das Cartas' : 'Virar Todas as Cartas (Flip 3D)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setGlobalSwapArt((prev) => !prev)}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{globalSwapArt ? 'Foco: Personagem no Destaque' : 'Inverter Arte (Personagem ↔ Dublador)'}</span>
              </button>

              {simulatedVoices[0] && (
                <button
                  type="button"
                  onClick={() =>
                    handleTestPackAnimation(
                      simulatedVoices[0],
                      simWorks !== null ? simWorks : Math.max(3, simulatedVoices[0].totalWorksCount || 20)
                    )
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-pink-500 hover:brightness-110 text-zinc-950 text-xs font-black flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Testar Abertura de Pacote Gacha</span>
                </button>
              )}

              {simulatedVoices[0] && (
                <button
                  type="button"
                  onClick={() => setCutInVoice(simulatedVoices[0])}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/50 text-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Testar Cut-In de Fala</span>
                </button>
              )}
            </div>
          </div>
        )}

        {actionMsg && (
          <div className="text-xs text-emerald-200 bg-emerald-500/15 border border-emerald-500/40 rounded-xl px-3.5 py-2 font-semibold">
            {actionMsg}
          </div>
        )}
        {errorMsg && (
          <div className="text-xs text-rose-200 bg-rose-500/15 border border-rose-500/40 rounded-xl px-3.5 py-2">
            {errorMsg}
          </div>
        )}
      </div>

      {/* =====================================================================
          FILTROS DE ÁLBUM, RARIDADES E BUSCA
         ===================================================================== */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex flex-wrap items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
            {CATEGORY_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setCategoryTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  categoryTab === t.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-200 focus:outline-none cursor-pointer"
          >
            {RARITY_FILTERS.map((f) => (
              <option key={f.id} value={f.id} className="bg-zinc-950">
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full xl:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-pink-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar seiyū, personagem ou anime..."
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500/60 rounded-xl py-2 pl-9 pr-8 text-xs text-zinc-100 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* =====================================================================
          FICHÁRIO DE CARTAS COLECIONÁVEIS (GRID DE CARDS 3:4)
         ===================================================================== */}
      {filteredVoices.length === 0 ? (
        <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-3xl p-12 text-center text-xs text-zinc-400 space-y-2">
          <div className="text-3xl">🎴</div>
          <p className="font-bold text-zinc-300">
            Nenhuma carta encontrada para estes filtros.
          </p>
          <p className="text-zinc-500 max-w-md mx-auto">
            Cadastre animes no catálogo, limpe o filtro de raridade ou clique em &quot;Sincronizar API &amp; Wiki&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredVoices.map((voice) => (
            <TvVoiceStickerCard
              key={voice.id}
              voice={voice}
              justStuck={justStuckId === voice.id}
              signatureMode={justStuckId === voice.id ? 'writing' : 'normal'}
              activeVisualTheme={activeVisualTheme}
              flipped={globalFlip ? true : null}
              swapArt={globalSwapArt ? true : null}
              onSelect={(v) => setSelectedVoiceId(v.id)}
              onStick={handleStickVoice}
              onUnstick={handleUnstickVoice}
              onOpenPack={handleOpenPackById}
            />
          ))}
        </div>
      )}

      {/* Dossiê Completo ao clicar em qualquer carta */}
      {selectedVoice && (
        <TvVoiceDossierModal
          voice={selectedVoice}
          onClose={() => setSelectedVoiceId(null)}
          onAddShowByTitle={onAddShowByTitle}
          onEditShowById={onEditShowById}
          onStick={handleStickVoice}
          onUnstick={handleUnstickVoice}
          onOpenPack={handleOpenPackById}
          onTestPackAnimation={(v) => handleTestPackAnimation(v, Math.max(3, v.totalWorksCount || 20))}
          onUpdatePreferences={handleUpdatePreferences}
          onUploadCustomSkin={handleUploadCustomSkin}
        />
      )}

      {/* Modal Animado de Abertura de Pacote Gacha */}
      {activePackModal && (
        <TvVoicePackModal
          pack={activePackModal.pack}
          voice={activePackModal.voice}
          pendingTotal={pendingPacks.length}
          onClose={() => setActivePackModal(null)}
          onClaimPack={handleClaimPack}
          onNextPack={() => {
            const next = pendingPacks.find((p) => p.packId !== activePackModal.pack?.packId);
            if (next) {
              const v = (album?.voices || []).find((x) => x.id === next.voiceId);
              if (v) setActivePackModal({ pack: next, voice: v });
            }
          }}
        />
      )}
    </div>
  );
}
