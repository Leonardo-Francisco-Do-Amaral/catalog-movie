import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  Search,
  RefreshCw,
  Sparkles,
  Award,
  Layers,
  Eye,
  RotateCcw,
  Gift,
  FlaskConical,
  Palette,
  Star,
  Trophy,
  Clock,
  Upload,
  Link2,
} from 'lucide-react';
import WalkOfFameDossierModal from '../components/WalkOfFameDossierModal';
import WalkOfFameStickerCard from '../components/WalkOfFameStickerCard';
import WalkOfFamePackModal from '../components/WalkOfFamePackModal';
import WalkOfFameTimelineModal from '../components/WalkOfFameTimelineModal';
import {
  STICKER_TIER_THEMES,
  WALK_UNLOCK_ROADMAP,
  IMMORTAL_AURA_LIST,
  resolveEffectiveImmortalAura,
  applySimulatedMilestoneToStar,
  resolveWalkMediaUrl,
  computeWalkXpClient,
} from '../utils/walkOfFameStickers';
import { triggerXPGainToast, dispatchXpStatusUpdate } from '../utils/xpSystem';

const API_BASE_URL = 'http://localhost:5000/api';

const TEST_MILESTONE_PRESETS = [
  { label: 'Dados Reais', pct: null, badge: 'Real' },
  { label: 'Bloqueada', pct: 0, badge: '0%' },
  { label: 'Frase Marcante', pct: 15, badge: '15%' },
  { label: 'Curiosidade #1', pct: 30, badge: '30%' },
  { label: '5 Skins + Foto', pct: 45, badge: '45%' },
  { label: 'Curios. #2–#3', pct: 60, badge: '60%' },
  { label: 'Linha do Tempo', pct: 75, badge: '75%' },
  { label: 'Ed. Assinada', pct: 90, badge: '90%' },
  { label: '100% +★', pct: 100, badge: '100%+★' },
];

const PACK_TEST_PRESETS = [
  { key: 'lock_15', label: '15% Estreia', desc: 'Marco 15%: Frase (+20 XP)', fromTier: null, toTier: 'bronze', fromPct: 0, toPct: 15, extraStarsUnlocked: 0, packType: 'new_sticker' },
  { key: 'lock_30', label: '30% Cena', desc: 'Marco 30%: Curios. #1 (+30 XP)', fromTier: 'bronze', toTier: 'silver', fromPct: 15, toPct: 30, extraStarsUnlocked: 0, packType: 'rarity_up' },
  { key: 'lock_45', label: '45% Holofote', desc: 'Marco 45%: 5 Skins (+40 XP)', fromTier: 'silver', toTier: 'epic', fromPct: 30, toPct: 45, extraStarsUnlocked: 0, packType: 'rarity_up' },
  { key: 'lock_60', label: '60% Estrela', desc: 'Marco 60%: Curios. #2–3 (+55 XP)', fromTier: 'epic', toTier: 'gold', fromPct: 45, toPct: 60, extraStarsUnlocked: 0, packType: 'rarity_up' },
  { key: 'lock_75', label: '75% Lenda', desc: 'Marco 75%: Timeline (+75 XP)', fromTier: 'gold', toTier: 'mythic', fromPct: 60, toPct: 75, extraStarsUnlocked: 0, packType: 'rarity_up' },
  { key: 'lock_90', label: '90% Assinada', desc: 'Marco 90%: Assinatura (+105 XP)', fromTier: 'mythic', toTier: 'diamond', fromPct: 75, toPct: 90, extraStarsUnlocked: 0, packType: 'rarity_up' },
  { key: 'all_6', label: 'Jornada 15→90%', desc: 'Sequência (+385 XP)', fromTier: null, toTier: 'diamond', fromPct: 0, toPct: 90, extraStarsUnlocked: 1, packType: 'new_sticker' },
  { key: 'extra_star', label: '★ Estrela Bônus', desc: 'Nova Aura (+60 XP)', fromTier: 'diamond', toTier: 'diamond', fromPct: 90, toPct: 100, extraStarsUnlocked: 1, packType: 'extra_star' },
];

function buildSimulatedWalkXpGain(pack) {
  const toPct = Number(pack?.toPct ?? pack?.toPercentage ?? 15);
  const fromPct = Number(pack?.fromPct ?? pack?.fromPercentage ?? 0);
  const extraAfter = Number(pack?.extraStarsUnlocked ?? 0);
  const computedXp = Math.max(
    0,
    computeWalkXpClient(toPct, extraAfter) - computeWalkXpClient(fromPct, 0)
  );
  const packXp = Math.max(5, Number(pack?.packXp ?? computedXp) || 15);
  const prevInLevel = 273;
  const levelCap = 400;
  const totalNextInLevel = prevInLevel + packXp;
  const levelsGained = Math.floor(totalNextInLevel / levelCap);
  const xpInCurrentLevel = totalNextInLevel % levelCap;
  return {
    gainedXp: packXp,
    prevTotalXp: 7300,
    nextTotalXp: 7300 + packXp,
    prevLevel: 21,
    newLevel: 21 + levelsGained,
    prevPercentage: Math.round((prevInLevel / levelCap) * 100),
    newPercentage: Math.round((xpInCurrentLevel / levelCap) * 100),
    leveledUp: levelsGained > 0,
    levelsGained,
    prevTitle: 'Quantas Armadilhas Você Fez para Chegar Aqui?',
    newTitle: 'Quantas Armadilhas Você Fez para Chegar Aqui?',
    titleChanged: false,
    xpInCurrentLevel,
    xpNeededForNextLevel: levelCap,
    xpRemaining: levelCap - xpInCurrentLevel,
    tags: [
      {
        type: 'walk_of_fame',
        icon: '🌟',
        label: `+${packXp} XP Calçada (${pack?.star?.name || 'Figurinha'})`,
        xp: packXp,
      },
    ],
  };
}

export default function WalkOfFamePage({ onOpenAddMovieForStar, onPacksChanged }) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [prefError, setPrefError] = useState(null);

  const [selectedAlameda, setSelectedAlameda] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('watched');
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [timelineStar, setTimelineStar] = useState(null);

  const [justStuckId, setJustStuckId] = useState(null);
  const [previewAllStickers, setPreviewAllStickers] = useState(false);
  const [activePackModal, setActivePackModal] = useState(null);
  const [nextPackChoiceCount, setNextPackChoiceCount] = useState(0);

  // Laboratório de Testes (escondido por padrão, abre pelo botão quando precisar)
  const [isTestLabOpen, setIsTestLabOpen] = useState(false);
  const [testStarId, setTestStarId] = useState('');
  const [simPct, setSimPct] = useState(null);
  const [simExtraStars, setSimExtraStars] = useState(2);
  const [simApplyToGrid, setSimApplyToGrid] = useState(false);
  const [simOverridesByStar, setSimOverridesByStar] = useState({});
  const [labCustomUrl, setLabCustomUrl] = useState('');
  const [labCustomLabel, setLabCustomLabel] = useState('');
  const [labUploadingSkin, setLabUploadingSkin] = useState(false);

  const applyPayload = useCallback(
    (nextPayload) => {
      setPayload(nextPayload);
      onPacksChanged?.(nextPayload?.pendingPacks || []);
    },
    [onPacksChanged]
  );

  const fetchWalkOfFame = useCallback(
    async (forceRefresh = false) => {
      try {
        if (forceRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const url = forceRefresh
          ? `${API_BASE_URL}/walk-of-fame/refresh`
          : `${API_BASE_URL}/walk-of-fame`;
        const res = forceRefresh ? await axios.post(url) : await axios.get(url);

        if (res.data?.success && res.data?.data) {
          applyPayload(res.data.data);
        } else {
          throw new Error(res.data?.error || 'Resposta inválida ao carregar Álbum da Calçada da Fama.');
        }
      } catch (err) {
        setError(err?.response?.data?.error || err.message || 'Erro ao carregar dados.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [applyPayload]
  );

  useEffect(() => {
    fetchWalkOfFame(false);
  }, [fetchWalkOfFame]);

  const triggerCardPasteAnim = useCallback((starId) => {
    setJustStuckId(starId);
    setTimeout(() => setJustStuckId((curr) => (curr === starId ? null : curr)), 2450);
  }, []);

  const handleStick = useCallback(
    async (starId) => {
      try {
        const res = await axios.post(`${API_BASE_URL}/walk-of-fame/stickers/${starId}/stick`);
        if (res.data?.success && res.data?.data) {
          applyPayload(res.data.data);
          triggerCardPasteAnim(starId);
          if (res.data.data.xpStatus) {
            dispatchXpStatusUpdate(res.data.data.xpStatus);
          }
          if (res.data.data.xpGain) {
            triggerXPGainToast(res.data.data.xpGain, res.data.data.xpStatus || null, true);
          }
        }
      } catch (err) {
        console.warn('[WalkOfFame] Não foi possível colar:', err?.response?.data?.error || err.message);
      }
    },
    [applyPayload, triggerCardPasteAnim]
  );

  const handleUnstick = useCallback(
    async (starId) => {
      try {
        const res = await axios.post(`${API_BASE_URL}/walk-of-fame/stickers/${starId}/unstick`);
        if (res.data?.success && res.data?.data) {
          applyPayload(res.data.data);
        }
      } catch (err) {
        console.warn('[WalkOfFame] Falha ao descolar:', err?.message);
      }
    },
    [applyPayload]
  );

  const openSinglePackModal = useCallback((pack) => {
    setNextPackChoiceCount(0);
    setActivePackModal(pack || null);
  }, []);

  const handleStickPack = useCallback(
    async (pack) => {
      if (pack.isDemo) {
        setActivePackModal(null);
        setNextPackChoiceCount(0);
        if (pack.star?.id) triggerCardPasteAnim(pack.star.id);
        triggerXPGainToast(pack.demoXpGain || buildSimulatedWalkXpGain(pack), null, true);
        return;
      }
      try {
        const res = await axios.post(`${API_BASE_URL}/walk-of-fame/packs/${pack.packId}/open`, {
          stickImmediately: true,
        });
        if (res.data?.success && res.data?.data) {
          applyPayload(res.data.data);
          triggerCardPasteAnim(pack.star.id);
          if (res.data.data.xpStatus) {
            dispatchXpStatusUpdate(res.data.data.xpStatus);
          }
          if (res.data.data.xpGain) {
            triggerXPGainToast(res.data.data.xpGain, res.data.data.xpStatus || null, true);
          }
          const remaining = res.data.data.pendingPacks || [];
          setActivePackModal(null);
          setNextPackChoiceCount(remaining.length);
        } else {
          setActivePackModal(null);
          setNextPackChoiceCount(0);
        }
      } catch {
        setActivePackModal(null);
        setNextPackChoiceCount(0);
      }
    },
    [applyPayload, triggerCardPasteAnim]
  );

  const handleSavePackForLater = useCallback(
    async (pack) => {
      if (pack.isDemo) {
        setActivePackModal(null);
        setNextPackChoiceCount(0);
        triggerXPGainToast(pack.demoXpGain || buildSimulatedWalkXpGain(pack), null, true);
        return;
      }
      try {
        const res = await axios.post(`${API_BASE_URL}/walk-of-fame/packs/${pack.packId}/open`, {
          stickImmediately: false,
        });
        if (res.data?.success && res.data?.data) {
          applyPayload(res.data.data);
          if (res.data.data.xpStatus) {
            dispatchXpStatusUpdate(res.data.data.xpStatus);
          }
          if (res.data.data.xpGain) {
            triggerXPGainToast(res.data.data.xpGain, res.data.data.xpStatus || null, true);
          }
          const remaining = res.data.data.pendingPacks || [];
          setActivePackModal(null);
          setNextPackChoiceCount(remaining.length);
        } else {
          setActivePackModal(null);
          setNextPackChoiceCount(0);
        }
      } catch {
        setActivePackModal(null);
        setNextPackChoiceCount(0);
      }
    },
    [applyPayload]
  );

  const stars = useMemo(() => payload?.stars || [], [payload]);
  const alamedas = payload?.alamedas || [];
  const pendingPacks = payload?.pendingPacks || [];

  const sampleStars = useMemo(() => {
    const withPhoto = stars.filter((s) => s.photoUrl);
    return withPhoto.length > 0 ? withPhoto : stars;
  }, [stars]);

  useEffect(() => {
    if (!testStarId && stars.length > 0) {
      const preferred =
        stars.find((s) => s.photoUrl && Array.isArray(s.skinOptions) && s.skinOptions.length >= 2) ||
        stars.find((s) => s.photoUrl) ||
        stars[0];
      if (preferred?.id) setTestStarId(preferred.id);
    }
  }, [stars, testStarId]);

  const testBaseStar = useMemo(() => {
    if (stars.length === 0) return null;
    return stars.find((s) => s.id === testStarId) || stars.find((s) => s.photoUrl) || stars[0];
  }, [stars, testStarId]);

  const effectiveLabStars = simPct != null ? (simPct >= 90 ? simExtraStars : 0) : null;

  const testStarSimulated = useMemo(() => {
    if (!testBaseStar) return null;
    if (simPct == null) return testBaseStar;
    return applySimulatedMilestoneToStar(
      testBaseStar,
      simPct,
      effectiveLabStars,
      simOverridesByStar[testBaseStar.id] || null
    );
  }, [testBaseStar, simPct, effectiveLabStars, simOverridesByStar]);

  const displayStars = useMemo(() => {
    if (!simApplyToGrid || simPct == null) return stars;
    return stars.map((s) =>
      applySimulatedMilestoneToStar(
        s,
        simPct,
        effectiveLabStars,
        simOverridesByStar[s.id] || null
      )
    );
  }, [stars, simApplyToGrid, simPct, effectiveLabStars, simOverridesByStar]);

  const topWatchedPodium = useMemo(() => {
    if (!simApplyToGrid && Array.isArray(payload?.summary?.topWatchedPodium)) {
      return payload.summary.topWatchedPodium;
    }
    return [...displayStars]
      .filter((s) => s.watchedCount > 0)
      .sort(
        (a, b) =>
          b.watchedCount - a.watchedCount ||
          (b.avgUserRating ?? -1) - (a.avgUserRating ?? -1) ||
          b.percentage - a.percentage ||
          a.albumNumber - b.albumNumber
      )
      .slice(0, 3)
      .map((s, idx) => ({
        rankPosition: idx + 1,
        id: s.id,
        albumNumber: s.albumNumber,
        name: s.name,
        icon: s.icon,
        tagline: s.tagline,
        photoUrl: s.activePhotoUrl || s.photoUrl,
        watchedCount: s.watchedCount,
        ceiling: s.ceiling,
        avgUserRating: s.avgUserRating,
        percentage: s.percentage,
        extraStars: s.extraStars,
        isDeceased: s.isDeceased,
      }));
  }, [payload, simApplyToGrid, displayStars]);

  const selectedStar = useMemo(() => {
    if (!selectedDossier?.starId) return null;
    if (selectedDossier.fromLab && testStarSimulated && testStarSimulated.id === selectedDossier.starId) {
      return testStarSimulated;
    }
    return displayStars.find((s) => s.id === selectedDossier.starId) || null;
  }, [selectedDossier, testStarSimulated, displayStars]);

  const activeTimelineStar = useMemo(() => {
    if (!timelineStar?.starId) return null;
    if (timelineStar.fromLab && testStarSimulated && testStarSimulated.id === timelineStar.starId) {
      return testStarSimulated;
    }
    return displayStars.find((s) => s.id === timelineStar.starId) || null;
  }, [timelineStar, testStarSimulated, displayStars]);

  const showPrefError = useCallback((msg) => {
    setPrefError(msg);
    setTimeout(() => setPrefError((curr) => (curr === msg ? null : curr)), 4500);
  }, []);

  const handleUpdatePreferences = useCallback(
    async (starId, prefs, isSimulated = false) => {
      setPrefError(null);
      if (isSimulated || (simApplyToGrid && simPct != null)) {
        setSimOverridesByStar((prev) => ({
          ...prev,
          [starId]: {
            ...(prev[starId] || {}),
            ...prefs,
          },
        }));
        return;
      }

      try {
        const res = await axios.post(
          `${API_BASE_URL}/walk-of-fame/stickers/${starId}/preferences`,
          prefs
        );
        if (res.data?.success && res.data?.data) {
          applyPayload(res.data.data);
        } else {
          showPrefError(res.data?.error || 'Não foi possível salvar preferência.');
        }
      } catch (err) {
        showPrefError(
          err?.response?.data?.error || err.message || 'Erro ao salvar preferência da estrela.'
        );
      }
    },
    [applyPayload, showPrefError, simApplyToGrid, simPct]
  );

  const handleUploadCustomSkin = useCallback(
    async (starId, { file = null, url = '', label = 'Foto Personalizada' }, isSimulated = false) => {
      setPrefError(null);
      if (isSimulated || (simApplyToGrid && simPct != null)) {
        const localUrl = file ? URL.createObjectURL(file) : String(url || '').trim();
        if (!localUrl) {
          showPrefError('Selecione uma imagem ou informe um link válido.');
          return;
        }
        const cleanLabel = String(label || 'Minha Foto').trim() || 'Minha Foto';
        setSimOverridesByStar((prev) => ({
          ...prev,
          [starId]: {
            ...(prev[starId] || {}),
            customSkinUrl: localUrl,
            customSkinLabel: cleanLabel,
            selectedSkinUrl: localUrl,
            selectedSkinLabel: cleanLabel,
          },
        }));
        return;
      }

      try {
        let res;
        if (file) {
          const form = new FormData();
          form.append('skin_file', file);
          form.append('skin_label', label || 'Minha Foto');
          res = await axios.post(
            `${API_BASE_URL}/walk-of-fame/stickers/${starId}/custom-skin`,
            form
          );
        } else {
          res = await axios.post(
            `${API_BASE_URL}/walk-of-fame/stickers/${starId}/custom-skin`,
            { skinUrl: url, skinLabel: label || 'Foto via Link' }
          );
        }
        if (res.data?.success && res.data?.data) {
          applyPayload(res.data.data);
        } else {
          showPrefError(res.data?.error || 'Não foi possível salvar a foto personalizada.');
        }
      } catch (err) {
        showPrefError(
          err?.response?.data?.error || err.message || 'Erro ao enviar foto personalizada.'
        );
      }
    },
    [applyPayload, showPrefError, simApplyToGrid, simPct]
  );

  const filteredStars = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = displayStars.filter((s) => {
      if (selectedAlameda !== 'all' && s.alameda !== selectedAlameda) return false;
      if (statusFilter === 'unlocked' && !s.isStickerUnlocked) return false;
      if (statusFilter === 'diamond' && !s.isDiamond) return false;
      if (statusFilter === 'progress_locked' && (s.watchedCount === 0 || s.isStickerUnlocked))
        return false;
      if (statusFilter === 'zero' && s.watchedCount > 0) return false;
      if (q) {
        const hay = `${s.name} ${s.tagline} ${s.knownFor}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sortBy === 'progress')
        return b.percentage - a.percentage || b.watchedCount - a.watchedCount || a.albumNumber - b.albumNumber;
      if (sortBy === 'watched') return b.watchedCount - a.watchedCount || b.percentage - a.percentage;
      if (sortBy === 'az') return a.name.localeCompare(b.name, 'pt-BR');
      return a.albumNumber - b.albumNumber;
    });
    return sorted;
  }, [displayStars, selectedAlameda, statusFilter, searchQuery, sortBy]);

  const unlockedCount = useMemo(
    () => displayStars.filter((s) => s.isStickerUnlocked).length,
    [displayStars]
  );
  const stuckCount = useMemo(
    () => displayStars.filter((s) => s.isStuck).length,
    [displayStars]
  );
  const realStuckCount = useMemo(() => stars.filter((s) => s.isStuck).length, [stars]);

  const handleStickAllUnlocked = async () => {
    const toStick = stars.filter((s) => (s.isStickerUnlocked && !s.isStuck) || s.hasRarityUpgradeToStick);
    for (const s of toStick) {
      await handleStick(s.id);
    }
  };

  const handleUnstickAll = async () => {
    const toUnstick = stars.filter((s) => s.isStuck);
    for (const s of toUnstick) {
      await handleUnstick(s.id);
    }
  };

  const buildDemoPackPayload = (preset) => {
    const base =
      testBaseStar ||
      sampleStars[preset.packType === 'new_sticker' ? 7 % Math.max(1, sampleStars.length) : 8 % Math.max(1, sampleStars.length)] ||
      stars[0];
    if (!base) return null;
    const simulatedStar = applySimulatedMilestoneToStar(
      base,
      preset.toPct,
      preset.extraStarsUnlocked ?? 0
    );
    const packXp = Math.max(
      0,
      computeWalkXpClient(preset.toPct, preset.extraStarsUnlocked ?? 0) -
        computeWalkXpClient(preset.fromPct, 0)
    );
    const demoPack = {
      isDemo: true,
      packId: `demo_${preset.key}_${Date.now()}`,
      packType: preset.packType,
      fromTier: preset.fromTier,
      toTier: preset.toTier,
      fromPct: preset.fromPct,
      toPct: preset.toPct,
      fromPercentage: preset.fromPct,
      toPercentage: preset.toPct,
      extraStarsBefore: 0,
      extraStarsAfter: preset.extraStarsUnlocked ?? 0,
      extraStarsUnlocked: preset.extraStarsUnlocked ?? 0,
      packXp,
      triggerMovieTitle: simulatedStar.watchedFilms?.[0]?.title || `Teste: ${preset.label}`,
      star: simulatedStar,
    };
    demoPack.demoXpGain = buildSimulatedWalkXpGain(demoPack);
    return demoPack;
  };

  const openDemoPackPreset = (preset) => {
    const demoPack = buildDemoPackPayload(preset);
    if (demoPack) openSinglePackModal(demoPack);
  };

  const triggerDemoPackToast = (preset) => {
    const demoPack = buildDemoPackPayload(preset);
    if (!demoPack) return;
    window.dispatchEvent(new CustomEvent('cine-walk-pack-toast', { detail: [demoPack] }));
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn pb-16">
      {/* =====================================================================
          HERO DO ÁLBUM DE FIGURINHAS + PACOTINHOS PENDENTES
         ===================================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 border border-amber-500/30 p-5 sm:p-7 shadow-2xl">
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-12 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/35 text-amber-300 font-mono">
                  CALÇADA DA FAMA • ÁLBUM OFICIAL #001–#{String(stars.length || 38).padStart(3, '0')}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Teto: 10 (≤20 filmes), 15 (21–28) ou 20 (&gt;28) • +1 ★ a cada 2 filmes extras • XP ao abrir pacotes
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                📖 Álbum de Figurinhas — Atores &amp; Dubladores
              </h1>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {payload?.summary && (
                <div className="flex items-center gap-2 text-xs font-mono bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2">
                  <span className="text-amber-300 font-black">
                    📖 {stuckCount}/{stars.length} coladas
                  </span>
                  <span className="text-zinc-600">|</span>
                  <span className="text-emerald-300 font-bold">
                    🔓 {unlockedCount} liberadas (≥15%)
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => fetchWalkOfFame(true)}
                disabled={refreshing || loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-bold text-zinc-200 transition-colors cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Atualizando...' : 'Atualizar Bios'}</span>
              </button>
            </div>
          </div>

          {/* Pódio Top 3 Automático — Mais Filmes Assistidos */}
          {payload?.summary && (
            <div className="pt-2 border-t border-zinc-800/80">
              <div className="rounded-2xl bg-zinc-900/75 border border-amber-500/25 p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pódio Top 3 • Mais Filmes Catalogados</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-zinc-400">
                    Automático pelo seu catálogo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[0, 1, 2].map((slotIdx) => {
                    const p = topWatchedPodium[slotIdx];
                    const medal = slotIdx === 0 ? '🥇' : slotIdx === 1 ? '🥈' : '🥉';
                    const slotBorder =
                      slotIdx === 0
                        ? 'border-amber-400/60 bg-gradient-to-br from-amber-500/15 via-zinc-950 to-yellow-500/5'
                        : slotIdx === 1
                        ? 'border-slate-300/45 bg-gradient-to-br from-slate-400/10 via-zinc-950 to-zinc-950'
                        : 'border-orange-500/45 bg-gradient-to-br from-orange-500/10 via-zinc-950 to-zinc-950';
                    if (!p) {
                      return (
                        <div
                          key={slotIdx}
                          className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 px-2.5 py-2 flex items-center gap-2 text-zinc-500"
                        >
                          <span className="text-base shrink-0 opacity-45">{medal}</span>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold truncate">Lugar #{slotIdx + 1}</p>
                            <p className="text-[9px] text-zinc-600 truncate">Assista filmes da lista</p>
                          </div>
                        </div>
                      );
                    }
                    const photoSrc = resolveWalkMediaUrl(p.photoUrl);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedDossier({ starId: p.id, fromLab: simApplyToGrid })}
                        className={`rounded-xl border ${slotBorder} px-2.5 py-1.5 flex items-center gap-2 text-left hover:brightness-110 transition-all cursor-pointer`}
                      >
                        <div className="relative shrink-0">
                          {photoSrc ? (
                            <img
                              src={photoSrc}
                              alt={p.name}
                              className="w-8 h-8 rounded-full object-cover object-top border border-amber-300/70"
                            />
                          ) : (
                            <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm">
                              {p.icon}
                            </span>
                          )}
                          <span className="absolute -bottom-1 -right-1 text-[11px] leading-none">
                            {medal}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-black text-white truncate">{p.name}</span>
                          </div>
                          <p className="text-[9px] font-mono text-amber-300 truncate">
                            🎬 {p.watchedCount} filme{p.watchedCount === 1 ? '' : 's'}
                            {p.avgUserRating !== null ? ` • ★${p.avgUserRating.toFixed(1)}` : ''}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Banner de Pacotinhos Pendentes */}
          <div className="flex flex-col gap-3 pt-3 border-t border-zinc-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {pendingPacks.length > 0 ? (
                <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-400/60 rounded-2xl px-4 py-2.5 flex-1">
                  <Gift className="w-5 h-5 text-amber-300 animate-bounce shrink-0" />
                  <div className="text-xs">
                    <strong className="text-amber-200 block">
                      Você tem {pendingPacks.length} pacotinho(s) lacrado(s) aguardando abertura!
                    </strong>
                    <span className="text-zinc-300">
                      Abre 1 pacote por vez — rasgue para revelar quem saiu e resgatar o XP!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openSinglePackModal(pendingPacks[0])}
                    className="ml-auto px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs shadow cursor-pointer shrink-0"
                  >
                    Abrir Pacote!
                  </button>
                </div>
              ) : (
                <div className="text-xs text-zinc-400 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span>
                    Ao cadastrar um filme que libere (≥15%) ou aumente a raridade de um artista, você recebe um pacotinho para abrir um por vez e colar no álbum.
                  </span>
                </div>
              )}
            </div>

            {nextPackChoiceCount > 0 && pendingPacks.length > 0 && !activePackModal && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-amber-950/60 border border-emerald-400/50 px-4 py-2.5 shadow-lg">
                <div className="flex items-center gap-2.5 text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span className="text-emerald-100">
                    <strong>Pacote finalizado!</strong> Ainda resta(m){' '}
                    <strong className="text-amber-300">{pendingPacks.length} pacote(s)</strong> pendente(s). Quer abrir o próximo agora?
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openSinglePackModal(pendingPacks[0])}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Abrir Novo Pacote ({pendingPacks.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNextPackChoiceCount(0)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-xs cursor-pointer"
                  >
                    Depois
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          CONTROLES E FILTROS DO ÁLBUM
         ===================================================================== */}
      {!loading && (
        <div className="rounded-2xl bg-zinc-950/85 border border-zinc-800/90 p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedAlameda('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedAlameda === 'all'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                🌐 Todas ({stars.length})
              </button>
              {alamedas.map((a) => {
                const count = stars.filter((s) => s.alameda === a.id).length;
                const active = selectedAlameda === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedAlameda(a.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      active
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {a.icon} {a.label} ({count})
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                disabled={pendingPacks.length === 0}
                onClick={() => pendingPacks.length > 0 && openSinglePackModal(pendingPacks[0])}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 transition-all ${
                  pendingPacks.length > 0
                    ? 'bg-gradient-to-r from-rose-500/25 via-amber-500/25 to-yellow-500/20 border-amber-400/70 text-amber-200 hover:brightness-110 shadow-lg shadow-amber-500/15 cursor-pointer'
                    : 'bg-zinc-900/70 border-zinc-800 text-zinc-500 cursor-default opacity-70'
                }`}
                title={
                  pendingPacks.length > 0
                    ? `Abrir 1 dos ${pendingPacks.length} pacote(s) pendente(s)`
                    : 'Nenhum pacote pendente no momento'
                }
              >
                <Gift className={`w-3.5 h-3.5 ${pendingPacks.length > 0 ? 'text-amber-300 animate-bounce' : 'text-zinc-500'}`} />
                <span>Pacotes Pendentes ({pendingPacks.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setIsTestLabOpen((o) => !o)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isTestLabOpen
                    ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 shadow-lg shadow-cyan-500/10'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>{isTestLabOpen ? 'Ocultar Testes' : '🧪 Lab de Testes'}</span>
              </button>
              <button
                type="button"
                onClick={handleStickAllUnlocked}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Colar Liberadas</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar artista, dublador ou filme famoso..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="all">Todos os Estados</option>
                <option value="unlocked">🔓 Liberadas (≥ 15%)</option>
                <option value="diamond">💎 Cracked Ice (≥ 90%)</option>
                <option value="progress_locked">⏳ Bloqueadas em Progresso (1%–14%)</option>
                <option value="zero">🔒 Bloqueadas (0%)</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="watched">Ordenar: Mais Filmes</option>
                <option value="album">Ordenar: Nº Álbum (#001–#{String(stars.length || 38).padStart(3, '0')})</option>
                <option value="progress">Ordenar: Maior %</option>
                <option value="az">Ordenar: A–Z</option>
              </select>
            </div>
          </div>

          {prefError && (
            <div className="rounded-xl bg-red-950/60 border border-red-500/50 px-3 py-2 text-xs font-bold text-red-200">
              ⚠️ {prefError}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          LABORATÓRIO INTERATIVO DE TESTES (0% → 100% + 9 ★)
         ===================================================================== */}
      {!loading && isTestLabOpen && testStarSimulated && (
        <section className="rounded-3xl bg-gradient-to-br from-cyan-950/35 via-zinc-950 to-purple-950/30 border border-cyan-500/40 p-5 shadow-2xl flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 font-mono">
                  🧪 MODO DE SIMULAÇÃO NÃO DESTRUTIVA
                </span>
                {simPct != null && (
                  <span className="text-[10px] font-mono font-bold text-amber-300">
                    Testando {simPct}% {simPct >= 90 ? `• ${effectiveLabStars}★ extras` : ''} • Nenhuma alteração salva no banco
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-cyan-400" />
                <span>Laboratório de Marcos, 10 Auras (★), 5 Skins &amp; Linha do Tempo</span>
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={testStarSimulated.id}
                onChange={(e) => setTestStarId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {stars.map((s) => (
                  <option key={s.id} value={s.id}>
                    #{String(s.albumNumber).padStart(3, '0')} — {s.name} ({s.percentage}% real)
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-xs font-bold text-zinc-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={simApplyToGrid}
                  onChange={(e) => setSimApplyToGrid(e.target.checked)}
                  disabled={simPct == null}
                  className="accent-cyan-400 cursor-pointer"
                />
                <span>Aplicar na grade</span>
              </label>

              <button
                type="button"
                onClick={() => setPreviewAllStickers((p) => !p)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                  previewAllStickers
                    ? 'bg-purple-500/20 border-purple-400/50 text-purple-200'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{previewAllStickers ? 'Prévia Cheia: Ativa' : 'Destravar Todas'}</span>
              </button>

              {realStuckCount > 0 && (
                <button
                  type="button"
                  onClick={handleUnstickAll}
                  className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Descolar Tudo</span>
                </button>
              )}
            </div>
          </div>

          {/* Testador de Pacotes por Raridade (Desbloqueio Automático + Assinatura em 90%) */}
          <div className="rounded-2xl bg-zinc-950/75 border border-amber-500/35 p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Testar Pacotes por Raridade (Desbloqueio Automático + Assinatura ao Vivo em 90%)</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Usa o artista selecionado acima
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
              {PACK_TEST_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => openDemoPackPreset(preset)}
                  className={`p-2 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                    preset.key === 'lock_90' || preset.key === 'all_6'
                      ? 'bg-sky-500/15 hover:bg-sky-500/25 border-sky-400/55 text-sky-100'
                      : 'bg-zinc-900 hover:bg-zinc-800 border-amber-500/35 text-amber-100'
                  }`}
                >
                  <span className="font-mono text-[10px] font-black flex items-center gap-1">
                    <Gift className="w-3 h-3 shrink-0 text-amber-300" />
                    <span className="truncate">{preset.label}</span>
                  </span>
                  <span className="text-[9px] text-zinc-400 truncate">{preset.desc}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
              <span className="text-[10px] font-mono font-bold text-cyan-200">
                🔔 Simular Notificação do Pacotinho no Canto (XP só entra na barra após abrir):
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { key: 'lock_15', label: '🎟️ Notif. 15% (+20 XP)' },
                  { key: 'lock_75', label: '🎞️ Notif. 75% Timeline (+75 XP)' },
                  { key: 'lock_90', label: '💎 Notif. 90% Assinada (+105 XP)' },
                ].map((btn) => {
                  const preset = PACK_TEST_PRESETS.find((p) => p.key === btn.key);
                  if (!preset) return null;
                  return (
                    <button
                      key={btn.key}
                      type="button"
                      onClick={() => triggerDemoPackToast(preset)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/50 text-[10px] font-black text-cyan-100 cursor-pointer transition-all"
                    >
                      {btn.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Seletor de Marcos 0% → 100%+★ */}
          <div className="flex flex-wrap items-center gap-1.5">
            {TEST_MILESTONE_PRESETS.map((preset) => {
              const active = simPct === preset.pct;
              return (
                <button
                  key={String(preset.pct)}
                  type="button"
                  onClick={() => {
                    setSimPct(preset.pct);
                    if (preset.pct == null) setSimApplyToGrid(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-cyan-400 text-zinc-950 border-cyan-300 shadow-lg shadow-cyan-500/20'
                      : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-700/80 text-zinc-200'
                  }`}
                >
                  <span className="font-mono font-black">{preset.badge}</span>
                  <span className={active ? 'text-zinc-900' : 'text-zinc-400'}>• {preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Preview lado a lado: Card Ao Vivo + Controles Rápidos */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pt-2 border-t border-zinc-800/80">
            {/* Carta ao Vivo */}
            <div className="lg:col-span-4 flex flex-col items-center gap-2.5">
              <div className="w-[220px] sm:w-[240px]">
                <WalkOfFameStickerCard
                  star={testStarSimulated}
                  isStuck={Boolean(
                    testStarSimulated.isStuck ||
                      (previewAllStickers && testStarSimulated.isStickerUnlocked)
                  )}
                  justStuck={justStuckId === testStarSimulated.id}
                  forceUnlocked={Boolean(previewAllStickers || (simPct != null && simPct >= 15))}
                  onStick={(id) =>
                    simPct != null ? triggerCardPasteAnim(id) : handleStick(id)
                  }
                  onUnstick={simPct != null ? undefined : handleUnstick}
                  onSelectProtagonist={(id, memberName) =>
                    handleUpdatePreferences(id, { featuredMemberName: memberName }, simPct != null)
                  }
                  onSelect={() =>
                    setSelectedDossier({ starId: testStarSimulated.id, fromLab: true })
                  }
                  onOpenTimeline={() =>
                    setTimelineStar({ starId: testStarSimulated.id, fromLab: true })
                  }
                />
              </div>
              <p className="text-[11px] text-center text-zinc-400 max-w-[260px]">
                {testStarSimulated.unlocks?.timelineUnlocked ? (
                  <span className="text-cyan-300 font-semibold">
                    💡 Clique em <strong>⏳ Linha</strong> no topo da carta para abrir a Linha do Tempo!
                  </span>
                ) : (
                  <span>
                    Atinja <strong>75%</strong> no simulador acima para testar a{' '}
                    <strong>Linha do Tempo</strong> na carta.
                  </span>
                )}
              </p>
            </div>

            {/* Controles de Skins, Poderes Imortais & Checklist */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* 45%+ : 5 Skins Alternativas */}
              <div className="rounded-2xl bg-zinc-900/75 border border-zinc-800 p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-purple-400" />
                    <span>Skins Alternativas da Carta (Até 5 visuais • Libera em 45%)</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-zinc-400">
                    {testStarSimulated.unlocks?.skinsUnlocked ? '✓ Liberado' : '🔒 Bloqueado (<45%)'}
                  </span>
                </div>

                {Array.isArray(testStarSimulated.skinOptions) &&
                testStarSimulated.skinOptions.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {testStarSimulated.skinOptions.map((sk) => {
                      const isSelected =
                        (testStarSimulated.selectedSkinUrl &&
                          testStarSimulated.selectedSkinUrl === sk.imageUrl) ||
                        (!testStarSimulated.selectedSkinUrl && sk.id === 'default_portrait');
                      const unlocked = Boolean(testStarSimulated.unlocks?.skinsUnlocked);
                      return (
                        <button
                          key={sk.id}
                          type="button"
                          disabled={!unlocked}
                          onClick={() =>
                            handleUpdatePreferences(
                              testStarSimulated.id,
                              {
                                selectedSkinUrl:
                                  sk.id === 'default_portrait' ? null : sk.imageUrl,
                                selectedSkinLabel:
                                  sk.id === 'default_portrait' ? null : sk.label,
                              },
                              simPct != null
                            )
                          }
                          className={`group relative rounded-xl overflow-hidden border-2 text-left transition-all ${
                            !unlocked
                              ? 'border-zinc-800 opacity-40 grayscale cursor-not-allowed'
                              : isSelected
                              ? 'border-purple-400 ring-2 ring-purple-400/50 cursor-pointer'
                              : 'border-zinc-700 hover:border-purple-300/70 cursor-pointer'
                          }`}
                        >
                          <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-950">
                            <img
                              src={resolveWalkMediaUrl(sk.imageUrl)}
                              alt={sk.label}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                          <div className="px-1.5 py-1 bg-zinc-950/95">
                            <p className="text-[10px] font-bold text-white truncate">{sk.label}</p>
                            <p className="text-[9px] text-zinc-400 truncate">{sk.sublabel}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">
                    Clique em &quot;Atualizar Bios&quot; no topo se ainda não houver fotos extras em cache para esta estrela.
                  </p>
                )}

                {/* Upload PC / Link URL rápido no Lab (45%+) */}
                {testStarSimulated.unlocks?.skinsUnlocked && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!labCustomUrl.trim()) return;
                      setLabUploadingSkin(true);
                      try {
                        await handleUploadCustomSkin(
                          testStarSimulated.id,
                          { url: labCustomUrl.trim(), label: labCustomLabel.trim() || 'Foto via Link' },
                          simPct != null
                        );
                        setLabCustomUrl('');
                        setLabCustomLabel('');
                      } finally {
                        setLabUploadingSkin(false);
                      }
                    }}
                    className="pt-2 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                  >
                    <input
                      type="text"
                      value={labCustomLabel}
                      onChange={(e) => setLabCustomLabel(e.target.value)}
                      placeholder="Nome (ex: Bastidores)"
                      className="sm:col-span-3 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
                    />
                    <div className="sm:col-span-5 relative">
                      <Link2 className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={labCustomUrl}
                        onChange={(e) => setLabCustomUrl(e.target.value)}
                        placeholder="Cole o link da foto (https://...)"
                        className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={labUploadingSkin || !labCustomUrl.trim()}
                      className="sm:col-span-2 px-2.5 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 disabled:opacity-45 text-zinc-950 font-black text-[11px] cursor-pointer"
                    >
                      Usar Link
                    </button>
                    <label className="sm:col-span-2 px-2.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-dashed border-purple-400/50 text-[11px] font-bold text-purple-200 flex items-center justify-center gap-1 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{labUploadingSkin ? '...' : 'Foto PC'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={labUploadingSkin}
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          setLabUploadingSkin(true);
                          try {
                            await handleUploadCustomSkin(
                              testStarSimulated.id,
                              {
                                file: f,
                                label: labCustomLabel.trim() || f.name.replace(/\.[^.]+$/, ''),
                              },
                              simPct != null
                            );
                          } finally {
                            setLabUploadingSkin(false);
                            e.target.value = '';
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </form>
                )}
              </div>

              {/* 75%+ & 90%+ : 10 Auras por ★ + Obra-Prima + Linha do Tempo + Dossiê */}
              <div className="rounded-2xl bg-zinc-900/75 border border-sky-500/30 p-3.5 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider text-sky-300">
                    💎 Testes de 75%+ / 90%+ (10 Auras por ★, Obra-Prima &amp; Linha do Tempo)
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {testStarSimulated.isDeceased && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-[10px] font-mono font-black text-amber-200">
                        🕊️ Em Memória
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-yellow-500/15 border border-yellow-400/40 text-[10px] font-mono font-black text-yellow-200">
                      ★ Atuais: {Number(testStarSimulated.extraStars || 0)}★
                    </span>
                  </div>
                </div>

                {/* Simulador de Estrelas Bônus 0★ → 9★ para testar as 10 Auras */}
                {simPct != null && simPct >= 90 && (
                  <div className="flex items-center justify-between gap-2 flex-wrap rounded-xl bg-zinc-950/75 border border-zinc-800 px-3 py-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                      Simular Estrelas Bônus (desbloqueia 1 cor por ★):
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setSimExtraStars(n)}
                          className={`px-2 py-0.5 rounded-lg font-mono text-[10px] font-black border transition-all cursor-pointer ${
                            simExtraStars === n
                              ? 'bg-amber-400 text-zinc-950 border-amber-200 shadow'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
                          }`}
                        >
                          {n}★
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 10 Cores de Aura (Prisma em 90% + 1 por ★) */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {IMMORTAL_AURA_LIST.map((aura) => {
                    const testStarsCount = Number(testStarSimulated.extraStars || 0);
                    const effectiveAura = resolveEffectiveImmortalAura(
                      testStarSimulated.immortalAura || 'prism',
                      testStarsCount
                    );
                    const activeAura = effectiveAura.id === aura.id;
                    const unlocked =
                      Boolean(testStarSimulated.unlocks?.immortalUnlocked) &&
                      testStarsCount >= aura.requiredStars;
                    return (
                      <button
                        key={aura.id}
                        type="button"
                        disabled={!unlocked}
                        onClick={() =>
                          handleUpdatePreferences(
                            testStarSimulated.id,
                            { immortalAura: aura.id },
                            simPct != null
                          )
                        }
                        title={
                          unlocked
                            ? `${aura.label} (${aura.requiredStars === 0 ? '90%' : `${aura.requiredStars}★`})`
                            : `${aura.label} — requer ${
                                !testStarSimulated.unlocks?.immortalUnlocked
                                  ? '90%'
                                  : `${aura.requiredStars}★`
                              }`
                        }
                        className={`py-1.5 px-1 rounded-xl border flex flex-col items-center gap-0.5 transition-all ${
                          !unlocked
                            ? 'border-zinc-800 opacity-45 cursor-not-allowed bg-zinc-950 text-zinc-500'
                            : activeAura
                            ? 'border-white bg-zinc-800 text-white cursor-pointer shadow'
                            : 'border-zinc-700 bg-zinc-950/70 text-zinc-400 hover:border-zinc-500 cursor-pointer'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-white/40"
                          style={{ background: aura.swatch }}
                        />
                        <span className="text-[9px] font-bold truncate max-w-full">
                          {aura.shortLabel}
                        </span>
                        <span className="text-[8px] font-mono opacity-80">
                          {unlocked
                            ? aura.requiredStars === 0
                              ? '90%'
                              : `${aura.requiredStars}★`
                            : `🔒${aura.requiredStars}★`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                  {/* Obra-Prima Favorita 90%+ */}
                  <div className="sm:col-span-8">
                    <select
                      disabled={
                        !testStarSimulated.unlocks?.immortalUnlocked ||
                        !testStarSimulated.watchedFilms?.length
                      }
                      value={testStarSimulated.signatureMovieId || ''}
                      onChange={(e) =>
                        handleUpdatePreferences(
                          testStarSimulated.id,
                          { signatureMovieId: Number(e.target.value) },
                          simPct != null
                        )
                      }
                      className="w-full px-2.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-bold text-zinc-100 disabled:opacity-45 focus:outline-none focus:border-amber-400 cursor-pointer"
                      title="Obra-Prima fixada na figurinha (90%+)"
                    >
                      {(testStarSimulated.watchedFilms || []).map((f) => (
                        <option key={f.movieId} value={f.movieId}>
                          🏆 {f.title} {typeof f.userRating === 'number' ? `(★${f.userRating.toFixed(1)})` : ''}
                        </option>
                      ))}
                      {(!testStarSimulated.watchedFilms ||
                        testStarSimulated.watchedFilms.length === 0) && (
                        <option value="">Obra-Prima (simule ≥90%)</option>
                      )}
                    </select>
                  </div>

                  {/* Botão Linha do Tempo Cinemática (75%+) */}
                  <button
                    type="button"
                    disabled={!testStarSimulated.unlocks?.timelineUnlocked}
                    onClick={() =>
                      setTimelineStar({ starId: testStarSimulated.id, fromLab: true })
                    }
                    className={`sm:col-span-2 py-2 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
                      !testStarSimulated.unlocks?.timelineUnlocked
                        ? 'bg-zinc-950 border border-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-sky-400 to-cyan-300 text-zinc-950 shadow-lg hover:brightness-110 cursor-pointer'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Timeline</span>
                  </button>

                  {/* Botão Dossiê */}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedDossier({ starId: testStarSimulated.id, fromLab: true })
                    }
                    className="sm:col-span-2 py-2 px-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs flex items-center justify-center gap-1 shadow cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Dossiê</span>
                  </button>
                </div>
              </div>

              {/* Resumo do Desbloqueio por Marco */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {WALK_UNLOCK_ROADMAP.map((step) => {
                  const unlocked = testStarSimulated.percentage >= step.pct;
                  return (
                    <div
                      key={step.pct}
                      className={`rounded-xl px-3 py-2 border text-xs flex items-center gap-2 transition-all ${
                        unlocked
                          ? 'bg-emerald-950/35 border-emerald-500/45 text-emerald-100'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <span className="text-base shrink-0">{unlocked ? step.icon : '🔒'}</span>
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] font-black block">
                          {step.pct}% • {unlocked ? 'LIBERADO' : 'BLOQUEADO'}
                        </span>
                        <span className="text-[11px] font-semibold truncate block">{step.short}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          GRADE PRINCIPAL DO ÁLBUM (#001 – #023)
         ===================================================================== */}
      {loading ? (
        <div className="rounded-3xl bg-zinc-950/90 border border-zinc-800 p-12 flex flex-col items-center justify-center gap-3 text-center">
          <Award className="w-10 h-10 text-amber-400 animate-bounce" />
          <p className="text-sm font-bold text-zinc-200">
            Carregando Álbum da Calçada da Fama...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-950/40 border border-red-500/40 p-6 text-center">
          <p className="text-sm font-bold text-red-200">{error}</p>
          <button
            type="button"
            onClick={() => fetchWalkOfFame(false)}
            className="mt-3 px-4 py-2 rounded-xl bg-red-500/20 border border-red-400/50 text-xs font-bold text-red-100 hover:bg-red-500/30 cursor-pointer"
          >
            Tentar Novamente
          </button>
        </div>
      ) : filteredStars.length === 0 ? (
        <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800 p-10 text-center text-sm text-zinc-400">
          Nenhuma figurinha encontrada com esses filtros.
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredStars.map((star) => (
            <WalkOfFameStickerCard
              key={star.id}
              star={star}
              isStuck={Boolean(star.isStuck || (previewAllStickers && star.isStickerUnlocked))}
              justStuck={justStuckId === star.id}
              forceUnlocked={Boolean(
                previewAllStickers || (simApplyToGrid && simPct != null && simPct >= 15)
              )}
              onStick={(id) =>
                simApplyToGrid && simPct != null ? triggerCardPasteAnim(id) : handleStick(id)
              }
              onUnstick={simApplyToGrid && simPct != null ? undefined : handleUnstick}
              onSelectProtagonist={(id, memberName) =>
                handleUpdatePreferences(
                  id,
                  { featuredMemberName: memberName },
                  Boolean(simApplyToGrid && simPct != null)
                )
              }
              onSelect={(s) =>
                setSelectedDossier({
                  starId: s.id,
                  fromLab: Boolean(simApplyToGrid && simPct != null),
                })
              }
              onOpenTimeline={(s) =>
                setTimelineStar({
                  starId: s.id,
                  fromLab: Boolean(simApplyToGrid && simPct != null),
                })
              }
            />
          ))}
        </div>
      )}

      {/* Legenda Oficial dos Marcos */}
      <footer className="rounded-2xl bg-zinc-950/70 border border-zinc-800/80 p-4 flex flex-wrap items-center justify-center gap-2.5 text-xs">
        <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Acabamentos Oficiais:
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] font-bold text-zinc-300">
          🔒 <span className="font-mono text-zinc-400">0%–14%</span> Bloqueada
        </span>
        {['bronze', 'silver', 'epic', 'gold', 'mythic', 'diamond'].map((k) => {
          const t = STICKER_TIER_THEMES[k];
          return (
            <span
              key={k}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border text-[11px] font-bold"
              style={{ borderColor: `${t.accentHex}55`, color: '#e4e4e7' }}
            >
              <span>{t.icon}</span>
              <span className="font-mono" style={{ color: t.accentHex }}>
                {t.pctHint}
              </span>
              <span>{t.label}</span>
            </span>
          );
        })}
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-400/40 text-[11px] font-bold text-yellow-200">
          <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" /> +1 ★ / 2 filmes após o teto (+60 XP/★)
        </span>
      </footer>

      <WalkOfFameDossierModal
        star={selectedStar}
        onClose={() => setSelectedDossier(null)}
        onAddMovie={(title, year) => {
          setSelectedDossier(null);
          onOpenAddMovieForStar?.(title, year);
        }}
        onUpdatePreferences={handleUpdatePreferences}
        onUploadCustomSkin={handleUploadCustomSkin}
        onOpenTimeline={(s) =>
          setTimelineStar({
            starId: s.id,
            fromLab: Boolean(selectedDossier?.fromLab),
          })
        }
      />

      <WalkOfFameTimelineModal
        star={activeTimelineStar}
        onClose={() => setTimelineStar(null)}
      />

      <WalkOfFamePackModal
        pack={activePackModal}
        onStickPack={handleStickPack}
        onSaveForLater={handleSavePackForLater}
        onClose={() => setActivePackModal(null)}
      />
    </div>
  );
}
