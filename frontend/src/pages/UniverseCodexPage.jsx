import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { RefreshCw, Search } from 'lucide-react';
import { dispatchXpStatusUpdate, triggerUniverseVictory } from '../utils/xpSystem';
import UniverseConstellationView from '../components/universes/UniverseConstellationView';

const API_BASE_URL = 'http://localhost:5000/api';

const FILTER_TABS = [
  { id: 'all', label: '🌌 Todas' },
  { id: 'mythic', label: '💎 Míticas' },
  { id: 'missing_movies', label: '⏳ Filmes Faltantes' },
  { id: 'conquered_movies', label: '✅ Filmes Conquistados' },
  { id: 'almost_done', label: '🎯 Quase Lá' },
  { id: 'in_progress', label: '🔥 Em Progresso' },
  { id: 'completed', label: '🏆 Dominadas 100%' },
  { id: 'not_started', label: '🔒 Não Iniciadas' },
  { id: 'independent', label: '🧭 Independentes' },
];

const TIER_FILTER_OPTIONS = [
  { id: 'all', label: 'Todos Tiers' },
  { id: 'gold', label: '🥇 Ouro' },
  { id: 'epic', label: '💜 Épico' },
  { id: 'silver', label: '🥈 Prata' },
  { id: 'bronze', label: '🥉 Bronze' },
];

const SORT_OPTIONS = [
  { id: 'default', label: 'Ordem Padrão' },
  { id: 'almost', label: '🎯 Menos Faltantes' },
  { id: 'progress', label: '📈 Maior Progresso %' },
  { id: 'rating', label: '⭐ Maior Média Minha' },
  { id: 'xp', label: '💎 Maior XP' },
];

export default function UniverseCodexPage({
  navbarSearchQuery = '',
  onOpenAddMovieForUniverse = null,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [localSearch, setLocalSearch] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [sortMode, setSortMode] = useState('default');

  const loadCodex = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/universes`);
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        setError('Não foi possível carregar o Códice dos Universos.');
      }
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || 'Erro ao carregar Códice dos Universos.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCodex();
  }, [loadCodex]);

  const handleRetroactiveSync = async () => {
    setSyncing(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/universes/sync`);
      if (res.data?.success) {
        setData(res.data.data);
        if (res.data.xpStatus) {
          dispatchXpStatusUpdate(res.data.xpStatus);
        }
      }
    } catch (err) {
      console.error('[Universes] Falha na sincronização:', err);
    } finally {
      setSyncing(false);
    }
  };

  const summary = data?.summary || {
    totalSagas: 91,
    completedSagas: 0,
    totalMegaSagas: 14,
    completedMegaSagas: 0,
    unlockedCheckpoints: 0,
    totalCheckpoints: 0,
    totalUniverseXp: 0,
  };
  const megaSagas = useMemo(() => data?.megaSagas || [], [data]);
  const sagas = useMemo(() => data?.sagas || [], [data]);

  const codexFilmStats = useMemo(() => {
    const uniqueWatched = new Set();
    const uniqueMissing = new Set();
    let almostDoneCount = 0;

    sagas.forEach((s) => {
      const rem = Math.max((s.totalCount || 0) - (s.watchedCount || 0), 0);
      if (rem >= 1 && rem <= 2) almostDoneCount += 1;
      (s.movies || []).forEach((m) => {
        const key = m.movieId
          ? `id_${m.movieId}`
          : `${String(m.matchedTitle || m.title || '').toLowerCase().trim()}_${m.year || ''}`;
        if (m.watched) {
          uniqueWatched.add(key);
        } else {
          uniqueMissing.add(key);
        }
      });
    });

    return {
      conqueredCount: uniqueWatched.size,
      missingCount: uniqueMissing.size,
      almostDoneCount,
    };
  }, [sagas]);

  const effectiveSearch = (localSearch || navbarSearchQuery || '').trim();

  const handleReplaySagaVictory = useCallback((saga) => {
    triggerUniverseVictory(
      [
        {
          id: `replay_saga_${saga.id}`,
          universeId: saga.id,
          megaSagaId: saga.megaSagaId ?? null,
          entityType: 'saga',
          title: saga.title,
          icon: saga.icon,
          tier: saga.tier,
          xp: saga.completionXp,
          finalQuote: saga.finalQuote,
          customAudio: saga.customAudio || null,
          watchedCount: saga.watchedCount,
          totalCount: saga.totalCount,
          posters: (saga.movies || []).map((m) => ({
            title: m.matchedTitle || m.title,
            posterUrl: m.posterUrl,
            year: m.year,
            userRating: m.userRating,
            imdbRating: m.imdbRating,
            metacriticScore: m.metacriticScore,
            rottenTomatoesScore: m.rottenTomatoesScore,
          })),
        },
      ],
      true
    );
  }, []);

  const handleReplayMegaVictory = useCallback((ms) => {
    triggerUniverseVictory(
      [
        {
          id: `replay_mega_${ms.id}`,
          universeId: ms.id,
          megaSagaId: ms.id,
          entityType: 'mega_saga',
          title: ms.title,
          icon: ms.icon,
          tier: 'mythic',
          xp: ms.completionXp,
          finalQuote: ms.finalQuote,
          customAudio: ms.customAudio || null,
          watchedCount: ms.watchedMoviesCount,
          totalCount: ms.totalMoviesCount,
          posters: ms.posters || [],
        },
      ],
      true
    );
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Carregando Códice dos Universos...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-6 text-center text-rose-200 flex flex-col items-center gap-3">
        <p className="text-sm font-bold">{error}</p>
        <button
          type="button"
          onClick={loadCodex}
          className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-400/50 text-xs font-black uppercase cursor-pointer"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* HUD Superior do Códice dos Universos */}
      <section className="rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-slate-950 via-indigo-950/20 to-zinc-950 p-4 sm:p-5 shadow-2xl flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl">🌌</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white leading-tight">
                Códice dos Universos
              </h2>
              <p className="text-[11px] text-zinc-400">
                Explore os nós da constelação, veja filmes pendentes em P&amp;B e clique para cadastrar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Buscar saga ou filme..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-400"
              />
            </div>

            <button
              type="button"
              disabled={syncing}
              onClick={handleRetroactiveSync}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>
          </div>
        </div>

        {/* Contadores + Filtros */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-3 border-t border-zinc-800/80">
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 font-bold">
              🏆 {summary.completedSagas}/{summary.totalSagas} Sagas Dominadas
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-indigo-500/15 border border-indigo-400/40 text-indigo-200 font-bold">
              💬 {summary.unlockedCheckpoints}/{summary.totalCheckpoints} Marcos
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-fuchsia-500/15 border border-fuchsia-400/40 text-fuchsia-200 font-bold">
              💎 {summary.completedMegaSagas}/{summary.totalMegaSagas} Míticas
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 font-bold">
              ⚡ +{Number(summary.totalUniverseXp || 0).toLocaleString('pt-BR')} XP Total
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTER_TABS.map((tab) => {
              const active = filterMode === tab.id;
              const badgeCount =
                tab.id === 'missing_movies'
                  ? codexFilmStats.missingCount
                  : tab.id === 'conquered_movies'
                  ? codexFilmStats.conqueredCount
                  : tab.id === 'almost_done'
                  ? codexFilmStats.almostDoneCount
                  : null;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id)}
                  className={`px-3 py-1 rounded-xl border text-[11px] font-bold transition cursor-pointer inline-flex items-center gap-1.5 ${
                    active
                      ? 'bg-indigo-500/25 border-indigo-400 text-indigo-100 shadow-[0_0_16px_rgba(99,102,241,0.25)]'
                      : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  {badgeCount !== null && (
                    <span className="px-1.5 py-0.2 rounded-md bg-black/40 text-[10px] font-mono text-zinc-300">
                      {badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Barra Secundária: Filtro por Raridade (Tier) & Ordenação */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-zinc-800/60">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mr-1">
              Raridade:
            </span>
            {TIER_FILTER_OPTIONS.map((t) => {
              const active = tierFilter === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTierFilter(t.id)}
                  className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                    active
                      ? 'bg-amber-500/20 border-amber-400/70 text-amber-200'
                      : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Ordenar:
            </span>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-200 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Mapa Constelação / Skill Tree + Painel Inspetor */}
      <UniverseConstellationView
        megaSagas={megaSagas}
        sagas={sagas}
        searchQuery={effectiveSearch}
        filterMode={filterMode}
        tierFilter={tierFilter}
        sortMode={sortMode}
        onReplaySagaVictory={handleReplaySagaVictory}
        onReplayMegaVictory={handleReplayMegaVictory}
        onAddMovie={onOpenAddMovieForUniverse}
      />
    </div>
  );
}
