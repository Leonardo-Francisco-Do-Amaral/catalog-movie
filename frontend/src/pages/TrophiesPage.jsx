import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  Trophy,
  Search,
  Lock,
  CheckCircle2,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Settings,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Shield,
  Layers,
  Flame,
  Award
} from 'lucide-react';
import { isAudioMuted, toggleAudioMute } from '../utils/trophyAudio';
import { triggerPS5TrophyToast, TIER_THEMES } from '../components/PS5TrophyToastContainer';
import TrophyChecklistModal from '../components/TrophyChecklistModal';
import TrophyTestPanelModal from '../components/TrophyTestPanelModal';
import { TrophyCardBadges, CATEGORY_BADGE_CONFIG, getCleanTrophyTitle } from '../components/TrophyBadges';
import { evaluateTrophiesClientSide } from '../utils/trophyEngineClient';
import { dispatchXpStatusUpdate, TROPHY_XP_BY_TIER } from '../utils/xpSystem';

const API_BASE_URL = 'http://localhost:5000/api';
const STORAGE_KEY_DISPLAY_COUNT = 'cinecatalog_trophies_per_row';
const STORAGE_KEY_SORT_BY = 'cinecatalog_trophies_sort_by';
const VALID_DISPLAY_COUNTS = [3, 5, 7, 10];

const SORT_OPTIONS = [
  { id: 'recent', label: 'Mais Recentes', icon: '🕒' },
  { id: 'newest', label: 'Recém-Criados', icon: '🆕' },
  { id: 'last_movie', label: 'Último Filme', icon: '🎬' },
  { id: 'rarity', label: 'Mais Raros', icon: '💎' },
  { id: 'progress', label: 'Maior Progresso', icon: '🎯' },
  { id: 'az', label: 'A-Z', icon: '🔤' },
];

const TIER_ORDER = ['platinum', 'mythic', 'gold', 'epic', 'silver', 'bronze'];

function LastMovieProgressPill({ lastAct, compact = false }) {
  if (!lastAct) return null;
  const text = lastAct.unlockedNow
    ? compact
      ? '✨ Desbloqueado!'
      : '✨ Desbloqueado nesse filme!'
    : compact
    ? `📈 +${lastAct.increasedBy}`
    : `📈 +${lastAct.increasedBy} (${lastAct.previousCount} → ${lastAct.currentCount})`;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border font-mono font-black ${
        compact ? 'text-[8px] px-1 py-0.5' : 'text-[10px] px-1.5 py-0.5'
      } ${
        lastAct.unlockedNow
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
          : 'bg-cyan-500/20 text-cyan-200 border-cyan-400/45'
      }`}
    >
      {text}
    </span>
  );
}

export const CATEGORY_NAMES = {
  volta_ao_mundo: 'Volta ao Mundo',
  dna_cinefilo: 'DNA Cinéfilo',
  anatomia_cinema: 'Anatomia do Cinema',
  data_limite: 'Data Limite',
  mafia_hollywood: 'A Máfia de Hollywood',
  tribunal_critica: 'Tribunal da Crítica',
  ritual_cinefilo: 'O Ritual do Cinéfilo',
  sessao_secreta: 'Sessão Secreta',
};

export default function TrophiesPage({ movies = [], onOpenWalkOfFame }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localOverrides, setLocalOverrides] = useState({});

  // Filtros de Categoria, Tier, Status e Busca
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'volta_ao_mundo', 'dna_cinefilo', 'anatomia_cinema', 'data_limite', 'mafia_hollywood', etc.
  const [onlyMultiCategory, setOnlyMultiCategory] = useState(false);
  const [selectedTier, setSelectedTier] = useState('all'); // 'all', 'bronze', 'silver', 'epic', 'gold', 'mythic', 'platinum'
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all', 'unlocked', 'in_progress', 'locked'
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(() => {
    if (typeof window === 'undefined') return 3;
    const saved = Number(localStorage.getItem(STORAGE_KEY_DISPLAY_COUNT));
    return VALID_DISPLAY_COUNTS.includes(saved) ? saved : 3;
  });

  const handleChangeDisplayCount = (num) => {
    if (!VALID_DISPLAY_COUNTS.includes(num)) return;
    setDisplayCount(num);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_DISPLAY_COUNT, String(num));
    }
  };

  // Ordenação dos Troféus (com persistência no localStorage)
  const [sortBy, setSortBy] = useState(() => {
    if (typeof window === 'undefined') return 'recent';
    const saved = localStorage.getItem(STORAGE_KEY_SORT_BY);
    return ['recent', 'newest', 'last_movie', 'rarity', 'progress', 'az'].includes(saved)
      ? saved
      : 'recent';
  });

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SORT_BY, newSort);
    }
  };

  // Modais
  const [inspectingTrophy, setInspectingTrophy] = useState(null);
  const [isTestPanelOpen, setIsTestPanelOpen] = useState(false);

  // Mute State
  const [muted, setMuted] = useState(isAudioMuted());

  const handleToggleMute = () => {
    const next = toggleAudioMute();
    setMuted(next);
  };

  const loadTrophies = useCallback(async (isInitial = false) => {
    setLoading(true);
    setError(null);
    try {
      try {
        const res = await axios.get(`${API_BASE_URL}/trophies`);
        if (res.data?.success && res.data?.data) {
          setData(res.data.data);
          if (res.data.data.xpStatus) {
            dispatchXpStatusUpdate(res.data.data.xpStatus);
          }

          // Se houver troféus com is_new, dispara as notificações do PS5 e confirma o reconhecimento
          const newlyUnlocked = res.data.data.newlyUnlocked || [];
          if (newlyUnlocked.length > 0 && !isInitial) {
            newlyUnlocked.forEach((t, i) => {
              setTimeout(() => {
                triggerPS5TrophyToast(t);
              }, i * 600);
            });
            axios.post(`${API_BASE_URL}/trophies/ack-new`, {
              trophyIds: newlyUnlocked.map((x) => x.id),
            }).catch(() => {});
          }
          return;
        }
      } catch (err) {
        console.warn('[TrophiesPage] Backend offline ou indisponível, avaliando troféus via motor client-side local:', err.message);
      }

      // Fallback: Avaliação local inteligente a partir do catálogo
      try {
        const clientResult = evaluateTrophiesClientSide(movies, localOverrides);
        setData(clientResult);
      } catch (clientErr) {
        console.error('[TrophiesPage] Erro no cálculo client-side:', clientErr);
        setError('Falha ao processar os troféus.');
      }
    } finally {
      setLoading(false);
    }
  }, [movies, localOverrides]);

  useEffect(() => {
    loadTrophies(true);
  }, [loadTrophies]);

  const allTrophies = data?.trophies || [];

  // Filtragem dinâmica pela Categoria selecionada e Toggle Multicategoria
  const categoryTrophies = useMemo(() => {
    let list = allTrophies;
    if (selectedCategory !== 'all') {
      list = list.filter((t) => {
        const cats = Array.isArray(t.categories) && t.categories.length > 0 ? t.categories : [t.category];
        return cats.includes(selectedCategory);
      });
    }
    if (onlyMultiCategory) {
      list = list.filter((t) => {
        const cats = Array.isArray(t.categories) && t.categories.length > 0 ? t.categories : [t.category];
        return cats.length >= 2;
      });
    }
    return list;
  }, [allTrophies, selectedCategory, onlyMultiCategory]);

  // Estatísticas por Tier reativas à Categoria selecionada
  const activeTierStats = useMemo(() => {
    const stats = {};
    TIER_ORDER.forEach((tierKey) => {
      const list = categoryTrophies.filter((t) => t.tier === tierKey);
      const unlocked = list.filter((t) => t.is_unlocked).length;
      const total = list.length;
      const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;
      stats[tierKey] = { total, unlocked, percentage };
    });
    return stats;
  }, [categoryTrophies]);

  // Estatísticas Gerais reativas à Categoria selecionada
  const activeOverallStats = useMemo(() => {
    const total = categoryTrophies.length;
    const unlocked = categoryTrophies.filter((t) => t.is_unlocked).length;
    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;
    return { total, unlocked, percentage };
  }, [categoryTrophies]);

  const lastActivityMap = useMemo(() => {
    const map = new Map();
    const entries = data?.lastActivity?.entries;
    if (Array.isArray(entries)) {
      entries.forEach((entry) => {
        if (entry?.trophyId) {
          map.set(entry.trophyId, entry);
        }
      });
    }
    return map;
  }, [data]);

  // Filtragem final e Ordenação Obrigatória PS5
  const filteredTrophies = useMemo(() => {
    let list = [...categoryTrophies];

    // Filtro por Tier
    if (selectedTier !== 'all') {
      list = list.filter((t) => t.tier === selectedTier);
    }

    // Filtro por Status
    if (selectedStatus === 'unlocked') {
      list = list.filter((t) => t.is_unlocked);
    } else if (selectedStatus === 'in_progress') {
      list = list.filter((t) => !t.is_unlocked && t.progress_current > 0);
    } else if (selectedStatus === 'locked') {
      list = list.filter((t) => !t.is_unlocked && t.progress_current === 0);
    }

    // Busca textual inteligente (título, descrição, tags, países, itens de checklist)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t) => {
        const titleMatch = t.title?.toLowerCase().includes(q);
        const descMatch = t.description?.toLowerCase().includes(q);
        const tagMatch =
          t.target_metadata?.tag?.toLowerCase().includes(q) ||
          (Array.isArray(t.target_metadata?.tags) &&
            t.target_metadata.tags.some((tg) => tg.toLowerCase().includes(q))) ||
          (Array.isArray(t.target_metadata?.tagPool) &&
            t.target_metadata.tagPool.some((tg) => tg.toLowerCase().includes(q)));
        const countryMatch =
          t.target_metadata?.country?.toLowerCase().includes(q) ||
          t.target_metadata?.continent?.toLowerCase().includes(q);
        const checklistMatch = t.checklist?.some((c) =>
          c.name?.toLowerCase().includes(q) || c.movie_title?.toLowerCase().includes(q)
        );
        return titleMatch || descMatch || tagMatch || countryMatch || checklistMatch;
      });
    }

    // =========================================================================
    // SISTEMA DE ORDENAÇÃO SELECIONÁVEL
    // 1. [ 🕒 Mais Recentes ]: Desbloqueados por unlocked_at DESC (desempate: Raridade DESC); depois Bloqueados por % DESC
    // 2. [ 🆕 Recém-Criados ]: Troféus adicionados mais recentemente no catálogo (sort_order DESC)
    // 3. [ 🎬 Último Filme ]: Somente troféus que ganharam progresso ou desbloquearam no último cadastro
    // 4. [ 💎 Mais Raros ]: Desbloqueados (Raridade DESC) -> Bloqueados (Raridade DESC priorizando maior progresso)
    // 5. [ 🎯 Maior Progresso ]: Bloqueados com progresso no topo (% DESC) -> Bloqueados 0% -> Conquistados
    // 6. [ 🔤 A-Z ]: Ordem alfabética pelo título limpo do troféu
    // =========================================================================
    const TIER_WEIGHT = {
      platinum: 6,
      mythic: 5,
      gold: 4,
      epic: 3,
      silver: 2,
      bronze: 1,
    };

    if (sortBy === 'newest') {
      list.sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0));
      return list;
    }

    if (sortBy === 'last_movie') {
      list = list.filter((t) => lastActivityMap.has(t.id));
      list.sort((a, b) => {
        const actA = lastActivityMap.get(a.id);
        const actB = lastActivityMap.get(b.id);
        const unlA = actA?.unlockedNow ? 1 : 0;
        const unlB = actB?.unlockedNow ? 1 : 0;
        if (unlB !== unlA) return unlB - unlA;

        const incDiff = (actB?.increasedBy || 0) - (actA?.increasedBy || 0);
        if (incDiff !== 0) return incDiff;

        const pctDiff = (Number(b.progress_percentage) || 0) - (Number(a.progress_percentage) || 0);
        if (pctDiff !== 0) return pctDiff;

        const tierDiff = (TIER_WEIGHT[b.tier?.toLowerCase()] || 0) - (TIER_WEIGHT[a.tier?.toLowerCase()] || 0);
        if (tierDiff !== 0) return tierDiff;

        return (a.sort_order || 0) - (b.sort_order || 0);
      });
      return list;
    }

    if (sortBy === 'az') {
      list.sort((a, b) => {
        const titleA = getCleanTrophyTitle(a.title);
        const titleB = getCleanTrophyTitle(b.title);
        return titleA.localeCompare(titleB, 'pt');
      });
      return list;
    }

    if (sortBy === 'progress') {
      // 1. Bloqueados com progresso (> 0%)
      // 2. Bloqueados sem progresso (0%)
      // 3. Conquistados
      const getProgressBucket = (t) => {
        if (!t.is_unlocked) {
          const pct = Number(t.progress_percentage) || 0;
          const cur = Number(t.progress_current) || 0;
          return pct > 0 || cur > 0 ? 1 : 2;
        }
        return 3;
      };

      list.sort((a, b) => {
        const bA = getProgressBucket(a);
        const bB = getProgressBucket(b);
        if (bA !== bB) return bA - bB;

        if (bA === 1) {
          // Bloqueados com progresso: Maior % primeiro
          const pctDiff = (Number(b.progress_percentage) || 0) - (Number(a.progress_percentage) || 0);
          if (pctDiff !== 0) return pctDiff;

          const curDiff = (Number(b.progress_current) || 0) - (Number(a.progress_current) || 0);
          if (curDiff !== 0) return curDiff;

          const tierDiff = (TIER_WEIGHT[b.tier?.toLowerCase()] || 0) - (TIER_WEIGHT[a.tier?.toLowerCase()] || 0);
          if (tierDiff !== 0) return tierDiff;

          return (a.sort_order || 0) - (b.sort_order || 0);
        }

        if (bA === 2) {
          // Bloqueados 0%: Mais raros primeiro
          const tierDiff = (TIER_WEIGHT[b.tier?.toLowerCase()] || 0) - (TIER_WEIGHT[a.tier?.toLowerCase()] || 0);
          if (tierDiff !== 0) return tierDiff;

          return (a.sort_order || 0) - (b.sort_order || 0);
        }

        // Conquistados: Mais recente primeiro, desempate por raridade
        const tA = a.unlocked_at ? new Date(a.unlocked_at).getTime() : 0;
        const tB = b.unlocked_at ? new Date(b.unlocked_at).getTime() : 0;
        if (tB !== tA) return tB - tA;

        const tierDiff = (TIER_WEIGHT[b.tier?.toLowerCase()] || 0) - (TIER_WEIGHT[a.tier?.toLowerCase()] || 0);
        if (tierDiff !== 0) return tierDiff;

        return (a.sort_order || 0) - (b.sort_order || 0);
      });
      return list;
    }

    if (sortBy === 'rarity') {
      // 1. Conquistados: Raridade Platina -> Bronze (desempate: mais recente)
      // 2. Bloqueados: Raridade Platina -> Bronze (desempate: maior progresso)
      list.sort((a, b) => {
        const unlA = a.is_unlocked ? 1 : 2;
        const unlB = b.is_unlocked ? 1 : 2;
        if (unlA !== unlB) return unlA - unlB;

        // Desempate por Raridade Decrescente
        const tierDiff = (TIER_WEIGHT[b.tier?.toLowerCase()] || 0) - (TIER_WEIGHT[a.tier?.toLowerCase()] || 0);
        if (tierDiff !== 0) return tierDiff;

        if (unlA === 1) {
          // Entre conquistados da mesma raridade: conquista mais recente primeiro
          const tA = a.unlocked_at ? new Date(a.unlocked_at).getTime() : 0;
          const tB = b.unlocked_at ? new Date(b.unlocked_at).getTime() : 0;
          if (tB !== tA) return tB - tA;

          return (a.sort_order || 0) - (b.sort_order || 0);
        }

        // Entre bloqueados da mesma raridade: mais próximo de concluir primeiro
        const pctDiff = (Number(b.progress_percentage) || 0) - (Number(a.progress_percentage) || 0);
        if (pctDiff !== 0) return pctDiff;

        const curDiff = (Number(b.progress_current) || 0) - (Number(a.progress_current) || 0);
        if (curDiff !== 0) return curDiff;

        return (a.sort_order || 0) - (b.sort_order || 0);
      });
      return list;
    }

    // Padrão: sortBy === 'recent' (Mais Recentes)
    // 1º Grupo (Conquistados): Desbloqueados por Data Recente DESC
    // Desempate (mesma data/timestamp): Raridade Decrescente (Platina > Mítico > Ouro > Épico > Prata > Bronze)
    // 2º Grupo (Bloqueados): Maior Progresso (% DESC) e depois Raridade
    list.sort((a, b) => {
      const unlA = a.is_unlocked ? 1 : 2;
      const unlB = b.is_unlocked ? 1 : 2;
      if (unlA !== unlB) return unlA - unlB;

      if (unlA === 1) {
        // Conquistados: Data de desbloqueio mais recente primeiro
        const tA = a.unlocked_at ? new Date(a.unlocked_at).getTime() : 0;
        const tB = b.unlocked_at ? new Date(b.unlocked_at).getTime() : 0;
        if (tB !== tA) return tB - tA;

        // Critério de Desempate: Raridade Decrescente
        const tierDiff = (TIER_WEIGHT[b.tier?.toLowerCase()] || 0) - (TIER_WEIGHT[a.tier?.toLowerCase()] || 0);
        if (tierDiff !== 0) return tierDiff;

        return (a.sort_order || 0) - (b.sort_order || 0);
      }

      // Bloqueados: Maior Progresso (% DESC)
      const pctDiff = (Number(b.progress_percentage) || 0) - (Number(a.progress_percentage) || 0);
      if (pctDiff !== 0) return pctDiff;

      const curDiff = (Number(b.progress_current) || 0) - (Number(a.progress_current) || 0);
      if (curDiff !== 0) return curDiff;

      // Desempate: Raridade Decrescente
      const tierDiff = (TIER_WEIGHT[b.tier?.toLowerCase()] || 0) - (TIER_WEIGHT[a.tier?.toLowerCase()] || 0);
      if (tierDiff !== 0) return tierDiff;

      return (a.sort_order || 0) - (b.sort_order || 0);
    });

    return list;
  }, [categoryTrophies, selectedTier, selectedStatus, searchQuery, sortBy, lastActivityMap]);

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn pb-16">
      {/* =========================================================================
          1. HEADER DO USUÁRIO & HUD PLAYSTATION 5
         ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900/90 via-zinc-950/95 to-zinc-950 border border-zinc-800/90 p-5 sm:p-7 shadow-2xl">
        {/* Glows de ambientação estilo PS5 */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          {/* Top Bar do Header: Título + Controles de Som & Testes */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 via-zinc-800 to-zinc-900 border border-amber-500/30 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/5">
                🏆
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-zinc-900/90 px-2.5 py-0.5 rounded-md border border-zinc-800 font-mono">
                    {onlyMultiCategory
                      ? `MULTICATEGORIA • ${categoryTrophies.length} TROFÉUS`
                      : selectedCategory === 'all'
                      ? `TODAS AS CATEGORIAS • ${allTrophies.length} TROFÉUS`
                      : `${(CATEGORY_NAMES[selectedCategory] || selectedCategory).toUpperCase()} • ${categoryTrophies.length} TROFÉUS`}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight mt-0.5">
                  Sala de Troféus & Conquistas
                </h1>
              </div>
            </div>

            {/* Ações Rápidas: Lab Calçada da Fama + Som Mute + Painel de Testes */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {onOpenWalkOfFame && (
                <button
                  type="button"
                  onClick={onOpenWalkOfFame}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/15 hover:from-amber-500/30 hover:to-yellow-500/25 border border-amber-400/55 text-amber-200 text-xs font-black transition-all cursor-pointer shadow-[0_0_16px_rgba(245,158,11,0.2)]"
                  title="Abrir Laboratório Visual da Calçada da Fama (3 Modos)"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>📖 Álbum Calçada da Fama</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleToggleMute}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  muted
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                }`}
                title={muted ? 'Áudio Mudo. Clique para Ativar' : 'Áudio Ativado. Clique para Silenciar'}
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{muted ? 'Áudio: Mudo' : 'Áudio: Ativo'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTestPanelOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 hover:border-amber-500/40 text-zinc-200 text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <Settings className="w-4 h-4 text-amber-400" />
                <span>⚙️ Painel de Testes</span>
              </button>

              <button
                type="button"
                onClick={() => loadTrophies(false)}
                disabled={loading}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Recarregar Troféus"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* =========================================================================
              PAINEL DE CATEGORIAS E MODOS GLOBAIS
             ========================================================================= */}
          <div className="flex flex-col gap-3.5 border-b border-zinc-800/80 pb-4">
            {/* Topo do Painel: Modos Globais (Todas as Conquistas / Apenas Multicategoria) + Status Ativo */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Modo Global: Todas as Conquistas */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setOnlyMultiCategory(false);
                    setSelectedTier('all');
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border shadow-sm ${
                    selectedCategory === 'all' && !onlyMultiCategory
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-[1.02]'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="text-base select-none">🌟</span>
                  <span>Todas as Conquistas</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      selectedCategory === 'all' && !onlyMultiCategory
                        ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {allTrophies.length}
                  </span>
                </button>

                {/* Modo Especial: Apenas Multicategoria */}
                <button
                  type="button"
                  onClick={() => {
                    setOnlyMultiCategory((prev) => !prev);
                    setSelectedTier('all');
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border shadow-sm ${
                    onlyMultiCategory
                      ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-rose-600 border-amber-300 text-white shadow-[0_0_25px_rgba(249,115,22,0.45)] scale-[1.02]'
                      : 'bg-zinc-900/80 border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500'
                  }`}
                  title="Filtrar troféus que combinam 2 ou mais categorias simultâneas (Multicategoria / Crossovers)"
                >
                  <Flame className={`w-4 h-4 ${onlyMultiCategory ? 'animate-bounce text-yellow-200' : 'text-orange-400'}`} />
                  <span>Apenas Multicategoria</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      onlyMultiCategory ? 'bg-black/40 text-white' : 'bg-orange-500/20 text-orange-300'
                    }`}
                  >
                    {allTrophies.filter((t) => (t.categories || [t.category]).length >= 2).length}
                  </span>
                </button>
              </div>

              {/* Indicador de Visualização Atual */}
              <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-[11px] text-zinc-400 font-medium">
                <span className="text-zinc-500">Exibindo:</span>
                <span className="text-amber-400 font-bold font-mono">
                  {onlyMultiCategory
                    ? '🔥 Multicategoria'
                    : selectedCategory === 'all'
                    ? '🌟 Visão Geral (9 Categorias)'
                    : CATEGORY_NAMES[selectedCategory] || selectedCategory}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-300 font-mono font-semibold">
                  {categoryTrophies.length} troféus
                </span>
              </div>
            </div>

            {/* Grid Harmônico 3x3 das 9 Categorias Temáticas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                {
                  id: 'volta_ao_mundo',
                  label: 'Volta ao Mundo',
                  icon: '🌍',
                  count: allTrophies.filter((t) => (t.categories || [t.category]).includes('volta_ao_mundo')).length,
                },
                {
                  id: 'dna_cinefilo',
                  label: 'DNA Cinéfilo',
                  icon: '🧬',
                  count: allTrophies.filter((t) => (t.categories || [t.category]).includes('dna_cinefilo')).length,
                },
                {
                  id: 'anatomia_cinema',
                  label: 'Anatomia do Cinema',
                  icon: '🎬',
                  count: allTrophies.filter((t) => (t.categories || [t.category]).includes('anatomia_cinema')).length,
                },
                {
                  id: 'data_limite',
                  label: 'Data Limite',
                  icon: '📅',
                  count: allTrophies.filter((t) => (t.categories || [t.category]).includes('data_limite')).length,
                },
                {
                  id: 'mafia_hollywood',
                  label: 'A Máfia de Hollywood',
                  icon: '🕴️',
                  count: allTrophies.filter((t) => (t.categories || [t.category]).includes('mafia_hollywood')).length,
                },
                {
                  id: 'tribunal_critica',
                  label: 'Tribunal da Crítica',
                  icon: '⚖️',
                  count: allTrophies.filter((t) => (t.categories || [t.category]).includes('tribunal_critica')).length,
                },
                {
                  id: 'ritual_cinefilo',
                  label: 'O Ritual do Cinéfilo',
                  icon: '🍿',
                  count: allTrophies.filter((t) => (t.categories || [t.category]).includes('ritual_cinefilo')).length,
                },
                {
                  id: 'sessao_secreta',
                  label: 'Sessão Secreta',
                  icon: '🕵️‍♂️',
                  count: allTrophies.filter((t) => (t.categories || [t.category]).includes('sessao_secreta')).length,
                },
              ].map((cat) => {
                const isSelected = selectedCategory === cat.id && !onlyMultiCategory;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setOnlyMultiCategory(false);
                      setSelectedTier('all');
                    }}
                    className={`flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-left ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/40 scale-[1.02]'
                        : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-base select-none shrink-0">{cat.icon}</span>
                      <span className="truncate uppercase tracking-wider text-[11px] font-black">{cat.label}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        isSelected ? 'bg-amber-500/30 text-amber-200' : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* HUD de Contadores Lado a Lado (Platina, Mítico, Ouro, Épico, Prata, Bronze) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {TIER_ORDER.map((tierKey) => {
              const theme = TIER_THEMES[tierKey];
              const st = activeTierStats[tierKey] || { total: 0, unlocked: 0, percentage: 0 };
              const isNoPlat =
                (selectedCategory === 'data_limite' ||
                  selectedCategory === 'sessao_secreta') &&
                tierKey === 'platinum';

              return (
                <div
                  key={tierKey}
                  onClick={() => setSelectedTier(selectedTier === tierKey ? 'all' : tierKey)}
                  className={`relative p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
                    selectedTier === tierKey
                      ? `${theme.border} bg-zinc-900 ${theme.glow} scale-[1.03]`
                      : 'border-zinc-800/80 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl select-none">{theme.symbol}</span>
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ color: theme.color, backgroundColor: `${theme.color}15` }}
                    >
                      {theme.name}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl sm:text-2xl font-black text-zinc-100 font-mono tracking-tight">
                      {isNoPlat ? '—' : st.unlocked}
                    </span>
                    <span className="text-xs text-zinc-500 font-bold font-mono">
                      {isNoPlat ? '(Sem Platina)' : `/ ${st.total}`}
                    </span>
                  </div>

                  {/* Micro barra de progresso */}
                  <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${isNoPlat ? 0 : st.percentage}%`,
                        backgroundColor: theme.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Barra de Progresso Geral de Conclusão da Categoria Selecionada */}
          <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black">
                {activeOverallStats.percentage}%
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                    {onlyMultiCategory
                      ? 'Progresso Multicategoria (Híbridos & Crossovers)'
                      : selectedCategory === 'volta_ao_mundo'
                      ? 'Progresso Volta ao Mundo'
                      : selectedCategory === 'dna_cinefilo'
                      ? 'Progresso DNA Cinéfilo'
                      : selectedCategory === 'anatomia_cinema'
                      ? 'Progresso Anatomia do Cinema'
                      : selectedCategory === 'data_limite'
                      ? 'Progresso Data Limite (Sazonal)'
                      : selectedCategory === 'mafia_hollywood'
                      ? 'Progresso A Máfia de Hollywood (Diretores, Estúdios & Oscar)'
                      : selectedCategory === 'tribunal_critica'
                      ? 'Progresso Tribunal da Crítica (Notas, Agregadores & Reviews)'
                      : selectedCategory === 'ritual_cinefilo'
                      ? 'Progresso O Ritual do Cinéfilo (Plataformas, Áudio, Duração & Anos)'
                      : selectedCategory === 'sessao_secreta'
                      ? 'Progresso Sessão Secreta (Listas Temáticas, Tropos & Desafios)'
                      : 'Progresso Geral (Todas as Categorias)'}
                  </span>
                  <span className="text-[11px] font-bold text-amber-400 font-mono">
                    ({activeOverallStats.unlocked} / {activeOverallStats.total} Troféus)
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  {selectedCategory === 'volta_ao_mundo'
                    ? 'Desbloqueie todos os troféus da Volta ao Mundo para obter a Platina Definitiva.'
                    : selectedCategory === 'dna_cinefilo'
                    ? 'Desbloqueie todos os troféus de tags para obter a Platina Arquivista Supremo.'
                    : selectedCategory === 'anatomia_cinema'
                    ? 'Desbloqueie todos os troféus de gêneros para obter a Platina O Mestre Supremo dos Gêneros.'
                    : selectedCategory === 'data_limite'
                    ? 'Categoria Sazonal por Mês Assistido. Não possui troféu de Platina.'
                    : selectedCategory === 'mafia_hollywood'
                    ? 'Desbloqueie todos os troféus da Máfia de Hollywood para obter a Platina O Poderoso Chefão dos Estúdios.'
                    : selectedCategory === 'tribunal_critica'
                    ? 'Desbloqueie todos os troféus do Tribunal da Crítica para obter a Platina O Juiz Final do Cinema.'
                    : selectedCategory === 'ritual_cinefilo'
                    ? 'Desbloqueie todos os troféus de O Ritual do Cinéfilo para obter a Platina O Mestre da Cabine de Projeção.'
                    : selectedCategory === 'sessao_secreta'
                    ? 'Categoria de Listas Temáticas, Tropos Pop e Desafios Cult. Não possui troféu de Platina.'
                    : 'Desafios geográficos, tags, gêneros, franquias, diretores, plataformas e críticas.'}
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-md w-full flex flex-col gap-1.5">
              <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-teal-400 to-blue-400 transition-all duration-700 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                  style={{ width: `${activeOverallStats.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>{activeOverallStats.unlocked} Conquistados</span>
                <span>{activeOverallStats.total - activeOverallStats.unlocked} Pendentes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. FILTROS, ABAS, DENSIDADE DE EXIBIÇÃO E BUSCA RÁPIDA
         ========================================================================= */}
      <section className="bg-zinc-950/70 p-3 sm:p-3.5 rounded-2xl border border-zinc-800/80 flex flex-col gap-3 shadow-lg">
        {/* Linha 1: Abas por Tier (Todos + Platina, Mítico, Ouro, Épico, Prata, Bronze) - Sempre 100% visíveis */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin scrollbar-thumb-zinc-800">
          <button
            type="button"
            onClick={() => setSelectedTier('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
              selectedTier === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 border border-zinc-800/80'
            }`}
          >
            Todos ({categoryTrophies.length})
          </button>

          {['platinum', 'mythic', 'gold', 'epic', 'silver', 'bronze'].map((tr) => {
            const theme = TIER_THEMES[tr];
            const isSelected = selectedTier === tr;
            const count = categoryTrophies.filter((t) => t.tier === tr).length;

            return (
              <button
                key={tr}
                type="button"
                onClick={() => setSelectedTier(tr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? `${theme.border} bg-zinc-900 font-black shadow-md ring-1 ring-amber-500/30`
                    : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
                style={{ color: isSelected ? theme.color : undefined }}
              >
                <span>{theme.symbol}</span>
                <span>{theme.name}</span>
                <span className="text-[10px] font-mono opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Linha 2: Ferramentas (Exibir por Linha, Filtro de Status e Busca Rápida) */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 pt-2 border-t border-zinc-800/60">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Seletor de Quantidade de Troféus por Linha */}
            <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 shrink-0">
              <span className="px-2 text-[10px] font-black uppercase tracking-wider text-zinc-500 select-none">
                Exibir:
              </span>
              {VALID_DISPLAY_COUNTS.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleChangeDisplayCount(num)}
                  title={`Exibir ${num} troféus por linha`}
                  className={`min-w-[26px] px-2 py-1 text-[11px] font-black font-mono rounded-lg transition-all cursor-pointer ${
                    displayCount === num
                      ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Seletor de Status */}
            <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 shrink-0">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'unlocked', label: 'Conquistados' },
                { id: 'in_progress', label: 'Em Progresso' },
                { id: 'locked', label: 'Bloqueados' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStatus(st.id)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                    selectedStatus === st.id
                      ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Seletor de Ordenação */}
            <div className="flex flex-wrap items-center gap-1 bg-zinc-900/80 border border-zinc-800 rounded-xl p-1">
              <span className="px-2 text-[10px] font-black uppercase tracking-wider text-zinc-500 select-none">
                Ordenar:
              </span>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSortChange(opt.id)}
                  title={`Ordenar por ${opt.label}`}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    sortBy === opt.id
                      ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30 font-black'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70'
                  }`}
                >
                  <span className="text-xs select-none">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative min-w-[200px] flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar troféu, tag ou país..."
              className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-amber-500/50 rounded-xl py-1.5 pl-8 pr-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Banner de destaque quando em modo "Último Filme" */}
      {sortBy === 'last_movie' && (
        <div className="rounded-2xl bg-gradient-to-r from-cyan-950/60 via-zinc-950/90 to-amber-950/40 border border-cyan-500/35 px-4 py-3 flex flex-wrap items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="text-base">🎬</span>
            {data?.lastActivity?.movieTitle ? (
              <span className="text-zinc-300">
                Troféus que evoluíram ou desbloquearam no último cadastro:{' '}
                <strong className="text-cyan-300 font-black">{data.lastActivity.movieTitle}</strong>
              </span>
            ) : (
              <span className="text-zinc-400">
                Cadastre um filme para listar aqui os troféus que avançaram ou foram desbloqueados com ele.
              </span>
            )}
          </div>
          {data?.lastActivity?.movieTitle && (
            <span className="text-[11px] font-mono font-black px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-200">
              {filteredTrophies.length} troféu{filteredTrophies.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
      )}

      {/* =========================================================================
          3. CARDS DE TROFÉUS (ESTILO PSN / WAR ROOM RPG — DENSIDADE 3, 5, 7 ou 10)
         ========================================================================= */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Consultando Motor de Conquistas...
          </span>
        </div>
      ) : filteredTrophies.length === 0 ? (
        <div className="min-h-[35vh] flex flex-col items-center justify-center gap-3 bg-zinc-950/60 border border-zinc-800 rounded-3xl p-8 text-center">
          <Trophy className="w-10 h-10 text-zinc-600" />
          <h3 className="text-sm font-black text-zinc-300 uppercase tracking-wider">
            {sortBy === 'last_movie'
              ? 'Nenhum troféu deste recorte avançou no último filme'
              : 'Nenhum troféu encontrado para os filtros atuais'}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm">
            {sortBy === 'last_movie'
              ? 'Limpe os filtros de Categoria/Tier/Status para ver todos os troféus impactados pelo último filme cadastrado.'
              : 'Tente redefinir o campo de busca ou selecionar outro Tier / Status acima.'}
          </p>
          <button
            type="button"
            onClick={() => {
              if (sortBy === 'last_movie') {
                setSelectedCategory('all');
                setOnlyMultiCategory(false);
              }
              setSelectedTier('all');
              setSelectedStatus('all');
              setSearchQuery('');
            }}
            className="mt-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/40 transition-colors cursor-pointer"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div
          className={
            displayCount === 10
              ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-10 gap-2'
              : displayCount === 7
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2.5'
              : displayCount === 5
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'
              : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
          }
        >
          {filteredTrophies.map((trophy) => {
            const tierKey = String(trophy.tier || 'bronze').toLowerCase();
            const theme = TIER_THEMES[tierKey] || TIER_THEMES.bronze;
            const isUnlocked = Boolean(trophy.is_unlocked);
            const cleanTitle = getCleanTrophyTitle(trophy.title);
            const xpReward = TROPHY_XP_BY_TIER[tierKey] || 15;
            const curProg = Math.min(trophy.progress_current || 0, trophy.progress_target || 1);
            const pctProg = Math.min(100, trophy.progress_percentage || 0);
            const lastAct = lastActivityMap.get(trophy.id) || null;

            const cats =
              Array.isArray(trophy.categories) && trophy.categories.length > 0
                ? trophy.categories
                : trophy.category
                ? [trophy.category]
                : ['volta_ao_mundo'];

            // Formatação de data
            const unlockedDateStr = trophy.unlocked_at
              ? new Date(trophy.unlocked_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : null;

            // =====================================================================
            // MODO 10 POR LINHA: MOSAICO ULTRA-COMPACTO PSN
            // =====================================================================
            if (displayCount === 10) {
              return (
                <div
                  key={trophy.id}
                  onClick={() => setInspectingTrophy(trophy)}
                  title={`${cleanTitle} (${theme.name} • +${xpReward} XP)\n${trophy.description}\nProgresso: ${curProg}/${trophy.progress_target} (${pctProg}%)`}
                  className={`relative overflow-hidden rounded-xl border p-2.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                    isUnlocked
                      ? `bg-zinc-950/90 ${theme.border} hover:scale-[1.03] hover:shadow-lg ${theme.glow}`
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40 opacity-90'
                  }`}
                >
                  {isUnlocked && (
                    <div
                      className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl opacity-15 pointer-events-none"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  )}

                  <div className="relative z-10">
                    {/* Topo: Ícone + Tier/Categorias */}
                    <div className="flex items-center justify-between gap-1.5 mb-2">
                      <div
                        className={`shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${theme.iconBg} border ${
                          isUnlocked ? theme.border : 'border-zinc-800'
                        } flex items-center justify-center text-base shadow-inner relative`}
                      >
                        <span className={isUnlocked ? '' : 'grayscale opacity-60'}>
                          {trophy.icon || theme.symbol}
                        </span>
                        {isUnlocked ? (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-[1px] shadow">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          </div>
                        ) : (
                          <div className="absolute -bottom-1 -right-1 bg-zinc-900 text-zinc-500 rounded-full p-[1px] border border-zinc-700">
                            <Lock className="w-2 h-2" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-0.5 min-w-0">
                        <span
                          className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border leading-none ${theme.badgeBg}`}
                        >
                          {theme.symbol}
                        </span>
                        <div className="flex items-center gap-0.5 text-[10px] leading-none">
                          {cats.map((ck) => (
                            <span key={ck} title={CATEGORY_BADGE_CONFIG[ck]?.label || ck}>
                              {CATEGORY_BADGE_CONFIG[ck]?.icon || '🏷️'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Título Compacto */}
                    <h4 className="text-[11px] font-bold text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-2 leading-tight min-h-[28px]">
                      {cleanTitle}
                    </h4>
                  </div>

                  {/* Rodapé: Progresso Ultra-Compacto */}
                  <div className="mt-2 pt-1.5 border-t border-zinc-800/70 flex flex-col gap-1 relative z-10">
                    {sortBy === 'last_movie' && lastAct && (
                      <LastMovieProgressPill lastAct={lastAct} compact />
                    )}
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="font-bold text-zinc-300">
                        {curProg}/{trophy.progress_target}
                      </span>
                      <span className={isUnlocked ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                        {pctProg}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pctProg}%`,
                          backgroundColor: isUnlocked ? theme.accentColor : '#71717a',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            }

            // =====================================================================
            // MODO 7 POR LINHA: CARD VERTICAL CONDENSADO
            // =====================================================================
            if (displayCount === 7) {
              return (
                <div
                  key={trophy.id}
                  onClick={() => setInspectingTrophy(trophy)}
                  title={`${cleanTitle} (+${xpReward} XP) — ${trophy.description}`}
                  className={`relative overflow-hidden rounded-xl border p-3 transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                    isUnlocked
                      ? `bg-zinc-950/90 ${theme.border} hover:scale-[1.02] hover:shadow-lg ${theme.glow}`
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40 opacity-90'
                  }`}
                >
                  {isUnlocked && (
                    <div
                      className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  )}

                  <div className="relative z-10">
                    {/* Topo: Ícone + Badges Compactas */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div
                        className={`shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br ${theme.iconBg} border ${
                          isUnlocked ? theme.border : 'border-zinc-800'
                        } flex items-center justify-center text-lg shadow-inner relative`}
                      >
                        <span className={isUnlocked ? '' : 'grayscale opacity-60'}>
                          {trophy.icon || theme.symbol}
                        </span>
                        {isUnlocked ? (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5 shadow">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          </div>
                        ) : (
                          <div className="absolute -bottom-1 -right-1 bg-zinc-900 text-zinc-500 rounded-full p-0.5 border border-zinc-700">
                            <Lock className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1 min-w-0">
                        <span
                          className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border leading-none ${theme.badgeBg}`}
                        >
                          {theme.symbol} {theme.name}
                        </span>
                        <div className="flex items-center gap-1 flex-wrap justify-end">
                          {cats.map((ck) => {
                            const conf = CATEGORY_BADGE_CONFIG[ck];
                            return (
                              <span
                                key={ck}
                                title={conf?.label || ck}
                                className={`text-[9px] px-1 py-0.5 rounded border leading-none ${
                                  conf?.bg || 'bg-zinc-800 text-zinc-300 border-zinc-700'
                                }`}
                              >
                                {conf?.icon || '🏷️'}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <h4 className="text-xs font-black text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                      {cleanTitle}
                    </h4>
                    <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                      {trophy.description}
                    </p>
                  </div>

                  {/* Rodapé: Status + Progresso */}
                  <div className="mt-2.5 pt-2 border-t border-zinc-800/70 flex flex-col gap-1.5 relative z-10">
                    {sortBy === 'last_movie' && lastAct && (
                      <LastMovieProgressPill lastAct={lastAct} />
                    )}
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span
                        className={
                          isUnlocked
                            ? 'text-emerald-400 font-bold text-[9px]'
                            : curProg > 0
                            ? 'text-amber-400 font-bold text-[9px]'
                            : 'text-zinc-500 text-[9px]'
                        }
                      >
                        {isUnlocked
                          ? unlockedDateStr || 'Conquistado'
                          : curProg > 0
                          ? 'Em Progresso'
                          : `+${xpReward} XP`}
                      </span>
                      <span className="font-bold text-zinc-300">
                        {curProg}/{trophy.progress_target}{' '}
                        <span className="text-zinc-500">({pctProg}%)</span>
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pctProg}%`,
                          backgroundColor: isUnlocked ? theme.accentColor : '#71717a',
                          boxShadow: isUnlocked ? `0 0 8px ${theme.accentColor}80` : 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            }

            // =====================================================================
            // MODO 5 POR LINHA: CARD COMPACTO EQUILIBRADO
            // =====================================================================
            if (displayCount === 5) {
              return (
                <div
                  key={trophy.id}
                  onClick={() => setInspectingTrophy(trophy)}
                  className={`relative overflow-hidden rounded-2xl border p-3.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                    isUnlocked
                      ? `bg-zinc-950/90 ${theme.border} hover:scale-[1.015] hover:shadow-xl ${theme.glow}`
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40 opacity-90'
                  }`}
                >
                  {isUnlocked && (
                    <div
                      className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-15 pointer-events-none"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  )}

                  <div className="flex items-start gap-2.5 relative z-10">
                    <div
                      className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${theme.iconBg} border ${
                        isUnlocked ? theme.border : 'border-zinc-800'
                      } flex items-center justify-center text-xl shadow-inner relative group-hover:scale-105 transition-transform`}
                    >
                      <span className={isUnlocked ? '' : 'grayscale opacity-60'}>
                        {trophy.icon || theme.symbol}
                      </span>
                      {isUnlocked ? (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5 shadow-md">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="absolute -bottom-1 -right-1 bg-zinc-900 text-zinc-500 rounded-full p-0.5 border border-zinc-700">
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Badges Compactas (Tier + Ícone/Categoria + Status) */}
                      <div className="flex items-center gap-1 mb-1 flex-wrap">
                        <span
                          className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${theme.badgeBg}`}
                        >
                          {theme.symbol} {theme.name}
                        </span>
                        {cats.map((ck) => {
                          const conf = CATEGORY_BADGE_CONFIG[ck];
                          return (
                            <span
                              key={ck}
                              title={conf?.label || ck}
                              className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${
                                conf?.bg || 'bg-zinc-800 text-zinc-300 border-zinc-700'
                              }`}
                            >
                              <span>{conf?.icon || '🏷️'}</span>
                              {cats.length === 1 && (
                                <span className="truncate max-w-[95px]">{conf?.label || ck}</span>
                              )}
                            </span>
                          );
                        })}
                        {isUnlocked ? (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                            ✓ {unlockedDateStr || 'Conquistado'}
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                            {curProg > 0 ? 'Em Progresso' : 'Bloqueado'}
                          </span>
                        )}
                      </div>

                      <h4 className="text-[13px] font-black text-zinc-100 tracking-tight group-hover:text-amber-400 transition-colors line-clamp-1">
                        {cleanTitle}
                      </h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                        {trophy.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-800/70 flex flex-col gap-1.5 relative z-10">
                    {sortBy === 'last_movie' && lastAct && (
                      <LastMovieProgressPill lastAct={lastAct} />
                    )}
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-amber-400/90 font-bold">+{xpReward} XP</span>
                      <span className="font-bold text-zinc-300">
                        {curProg} / {trophy.progress_target}{' '}
                        {trophy.target_metadata?.curatedCount && (
                          <span className="text-[10px] text-amber-400 font-normal">
                            (Lista com {trophy.target_metadata.curatedCount}){' '}
                          </span>
                        )}
                        <span className="text-zinc-500">({pctProg}%)</span>
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pctProg}%`,
                          backgroundColor: isUnlocked ? theme.accentColor : '#71717a',
                          boxShadow: isUnlocked ? `0 0 8px ${theme.accentColor}80` : 'none',
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      <span>{trophy.checklist?.length || 0} item(ns)</span>
                      <span className="flex items-center gap-0.5 font-bold text-amber-400/90 group-hover:text-amber-300">
                        Detalhes <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            // =====================================================================
            // MODO PADRÃO 3 POR LINHA: CARD COMPLETO PSN WAR ROOM
            // =====================================================================
            return (
              <div
                key={trophy.id}
                onClick={() => setInspectingTrophy(trophy)}
                className={`relative overflow-hidden rounded-2xl border p-4.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                  isUnlocked
                    ? `bg-zinc-950/90 ${theme.border} hover:scale-[1.015] hover:shadow-xl ${theme.glow}`
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40 opacity-90'
                }`}
              >
                {/* Glow de fundo se desbloqueado */}
                {isUnlocked && (
                  <div
                    className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-15 pointer-events-none"
                    style={{ backgroundColor: theme.accentColor }}
                  />
                )}

                {/* Linha Superior: Ícone + Título + Status */}
                <div className="flex items-start gap-3.5 relative z-10">
                  {/* Ícone Estilo PS5 */}
                  <div
                    className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${theme.iconBg} border ${
                      isUnlocked ? theme.border : 'border-zinc-800'
                    } flex items-center justify-center text-2xl shadow-inner relative group-hover:scale-105 transition-transform`}
                  >
                    <span className={isUnlocked ? '' : 'grayscale opacity-60'}>
                      {trophy.icon || theme.symbol}
                    </span>
                    {isUnlocked && (
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5 shadow-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {!isUnlocked && (
                      <div className="absolute -bottom-1 -right-1 bg-zinc-900 text-zinc-500 rounded-full p-0.5 border border-zinc-700">
                        <Lock className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Detalhes Textuais */}
                  <div className="flex-1 min-w-0">
                    {/* Badges de Categoria, Tier, Tags e País */}
                    <TrophyCardBadges
                      trophy={trophy}
                      theme={theme}
                      isUnlocked={isUnlocked}
                      unlockedDateStr={unlockedDateStr}
                    />

                    <h4 className="text-sm font-black text-zinc-100 tracking-tight group-hover:text-amber-400 transition-colors line-clamp-1">
                      {cleanTitle}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {trophy.description}
                    </p>
                  </div>
                </div>

                {/* Linha Inferior: Barra de Progresso + Botão de Checklist */}
                <div className="mt-4 pt-3 border-t border-zinc-800/70 flex flex-col gap-2 relative z-10">
                  {sortBy === 'last_movie' && lastAct && (
                    <LastMovieProgressPill lastAct={lastAct} />
                  )}
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                      {isUnlocked ? 'Requisitos Cumpridos' : 'Progresso Atual'}
                    </span>
                    <span className="font-bold text-zinc-300">
                      {curProg} / {trophy.progress_target}{' '}
                      {trophy.target_metadata?.curatedCount && (
                        <span className="text-[11px] text-amber-400 font-normal">
                          (Lista com {trophy.target_metadata.curatedCount} filmes){' '}
                        </span>
                      )}
                      <span className="text-zinc-500">
                        ({pctProg}%)
                      </span>
                    </span>
                  </div>

                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80 p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pctProg}%`,
                        backgroundColor: isUnlocked ? theme.accentColor : '#71717a',
                        boxShadow: isUnlocked ? `0 0 10px ${theme.accentColor}80` : 'none',
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    <div className="flex items-center gap-2">
                      <span>{trophy.checklist?.length || 0} item(ns) no checklist</span>
                      <span className="text-[10px] font-mono font-bold text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                        +{xpReward} XP
                      </span>
                    </div>
                    <span className="flex items-center gap-1 font-bold text-amber-400/90 group-hover:text-amber-300">
                      Ver Detalhes <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          4. MODAL DE CHECKLIST DETALHADO DO TROFÉU
         ========================================================================= */}
      {inspectingTrophy && (
        <TrophyChecklistModal
          trophy={inspectingTrophy}
          onClose={() => setInspectingTrophy(null)}
        />
      )}

      {/* =========================================================================
          5. MODAL DO PAINEL DE TESTES & HOMOLOGAÇÃO
         ========================================================================= */}
      {isTestPanelOpen && (
        <TrophyTestPanelModal
          trophies={allTrophies}
          movies={movies}
          onSyncSuccess={(newData) => {
            if (newData) {
              setData(newData);
            }
          }}
          onClose={() => setIsTestPanelOpen(false)}
        />
      )}
    </div>
  );
}
