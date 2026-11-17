import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  RefreshCw,
  Plus,
  CheckCircle2,
  Star,
  Clock,
  Tv,
  Sparkles,
} from 'lucide-react';
import { STUDIO_TIER_META, fetchTvStudiosLeague, resolveTvPosterUrl } from '../utils/tvApi';

const TIER_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'unlocked', label: 'Conquistados (Bronze+)' },
  { id: 'in_progress', label: 'Em Andamento' },
  { id: 'locked', label: 'Bloqueados' },
];

export default function TvStudiosLeaguePage({ onAddShowByTitle, onEditShowById }) {
  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [sortMode, setSortMode] = useState('tier'); // 'tier' | 'hours' | 'alpha'

  const loadLeague = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetchTvStudiosLeague();
      setLeague(res.data || null);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Erro ao carregar a Liga dos Estúdios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeague();
  }, [loadLeague]);

  const filteredStudios = useMemo(() => {
    const list = league?.studios || [];
    const filtered = list.filter((st) => {
      if (filterMode === 'unlocked') return st.currentTier !== 'none';
      if (filterMode === 'in_progress') return st.totalShowsCount > 0 && st.currentTier === 'none';
      if (filterMode === 'locked') return st.totalShowsCount === 0;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === 'hours') return b.hoursWatched - a.hoursWatched || b.completedCount - a.completedCount;
      if (sortMode === 'alpha') return a.name.localeCompare(b.name, 'pt');
      return 0; // já vem ordenado por tier -> concluídas -> total -> nome do backend
    });
  }, [league, filterMode, sortMode]);

  if (loading) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-fuchsia-400 animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Carregando Liga dos Estúdios Lendários...
        </span>
      </div>
    );
  }

  if (errorMsg || !league) {
    return (
      <div className="max-w-xl mx-auto bg-rose-500/10 border border-rose-500/40 rounded-2xl p-6 text-center space-y-3">
        <p className="text-sm text-rose-200 font-bold">{errorMsg || 'Liga indisponível.'}</p>
        <button
          type="button"
          onClick={loadLeague}
          className="px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-black uppercase cursor-pointer"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const { summary } = league;
  const overallPct = Math.round(
    (summary.unlockedStudiosCount / Math.max(1, summary.totalStudiosCount)) * 100
  );

  return (
    <div className="space-y-6">
      {/* Banner da Liga */}
      <div className="bg-gradient-to-br from-fuchsia-500/15 via-purple-500/10 to-zinc-950 border border-fuchsia-500/35 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-fuchsia-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Desafio Exclusivo do Modo Anime</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-zinc-100">
              🏛️ Liga dos Estúdios Lendários
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl">
              Conclua animes dos 19 estúdios que marcaram a história da animação japonesa para subir de patente e ganhar bônus de XP Sakura.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-zinc-950/80 border border-pink-500/35 rounded-xl px-4 py-2.5 text-center">
              <div className="text-[10px] font-black uppercase text-zinc-400">Estúdios Ativos</div>
              <div className="text-xl font-black text-pink-300">
                {summary.unlockedStudiosCount} / {summary.totalStudiosCount}
              </div>
            </div>
            <div className="bg-zinc-950/80 border border-purple-500/35 rounded-xl px-4 py-2.5 text-center">
              <div className="text-[10px] font-black uppercase text-zinc-400">XP da Liga</div>
              <div className="text-xl font-black text-purple-300">+{summary.totalLeagueXp} XP</div>
            </div>
          </div>
        </div>

        {/* Progresso Geral + Tiers */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-3 font-bold">
              <span className="text-amber-300">🥉 Bronze: {summary.bronzeCount}</span>
              <span className="text-slate-200">🥈 Prata: {summary.silverCount}</span>
              <span className="text-purple-300">🔮 Épico: {summary.epicCount ?? 0}</span>
              <span className="text-yellow-300">🥇 Ouro: {summary.goldCount}</span>
              <span className="text-red-300">🩸 Mítico: {summary.mythicCount ?? 0}</span>
              {(summary.totalExtraStars ?? 0) > 0 && (
                <span className="text-amber-200 font-black">★ {summary.totalExtraStars} Extra</span>
              )}
            </div>
            <span className="text-[11px] font-black text-fuchsia-300">{overallPct}% dos estúdios</span>
          </div>
          <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(overallPct > 0 ? 3 : 0, overallPct)}%` }}
            />
          </div>
        </div>

        {/* Legenda de Regras */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-300 pt-1">
          <span className="text-zinc-500 font-black uppercase text-[10px]">Raridades RPG:</span>
          <span className="text-amber-300">🥉 Bronze: 1 (+20 XP)</span>
          <span className="text-slate-200">🥈 Prata: 3 (+30 XP)</span>
          <span className="text-purple-300">🔮 Épico: 5 (+50 XP)</span>
          <span className="text-yellow-300">🥇 Ouro: 10 (+100 XP)</span>
          <span className="text-red-300">🩸 Mítico: 17 (+170 XP)</span>
          <span className="text-amber-200 font-bold">★ +1 Estrela a cada 3 obras (+30 XP)</span>
        </div>
      </div>

      {/* Filtros + Ordenação */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          {TIER_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterMode(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === f.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs">
          <span className="text-zinc-500">Ordenar:</span>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
            className="bg-transparent text-zinc-200 font-bold focus:outline-none cursor-pointer"
          >
            <option value="tier" className="bg-zinc-950">Maior Tier / Concluídas</option>
            <option value="hours" className="bg-zinc-950">Mais Horas Assistidas</option>
            <option value="alpha" className="bg-zinc-950">Ordem Alfabética (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Grade dos Estúdios */}
      {filteredStudios.length === 0 ? (
        <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl p-8 text-center text-xs text-zinc-400">
          Nenhum estúdio encontrado neste filtro.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStudios.map((studio) => {
            const tierMeta = STUDIO_TIER_META[studio.currentTier] || STUDIO_TIER_META.none;
            const nextMeta = studio.nextTier ? STUDIO_TIER_META[studio.nextTier] : null;
            const existingTitlesLower = new Set(
              studio.matchedShows.map((m) => m.title.toLowerCase())
            );

            return (
              <article
                key={studio.id}
                className={`relative border rounded-2xl p-4 flex flex-col gap-3 transition-all duration-300 overflow-hidden ${tierMeta.cardClass} ${tierMeta.neonClass}`}
              >
                {/* Efeito Visual Especial de Dificuldade / Rarity Sheen */}
                {studio.currentTier === 'mythic' && (
                  <>
                    <div className="absolute -inset-1 pointer-events-none opacity-30 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 blur-lg animate-pulse" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />
                  </>
                )}
                {studio.currentTier === 'gold' && (
                  <div className="absolute -inset-y-10 w-16 pointer-events-none anime-card-sheen-sweep bg-gradient-to-r from-transparent via-yellow-300/40 to-transparent" />
                )}
                {studio.currentTier === 'epic' && (
                  <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent animate-pulse" />
                )}
                {studio.currentTier === 'silver' && (
                  <div className="absolute -inset-y-10 w-12 pointer-events-none anime-card-sheen-sweep bg-gradient-to-r from-transparent via-slate-200/25 to-transparent" />
                )}

                {/* Topo do Card */}
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950/90 border border-zinc-800 flex items-center justify-center text-xl shrink-0 shadow-inner">
                      {studio.emoji}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-zinc-100 truncate flex items-center gap-1.5">
                        {studio.name}
                      </h3>
                      <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1.5">
                        <span>Fundado em {studio.foundedYear}</span>
                        {studio.currentTier !== 'none' && (
                          <span className="text-zinc-500">· {tierMeta.auraLabel}</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider ${tierMeta.badgeClass}`}
                    >
                      {tierMeta.icon} {tierMeta.label}
                      {(studio.extraStars ?? 0) > 0 && (
                        <span className="ml-1 text-amber-200 font-black animate-pulse">
                          ★{studio.extraStars}
                        </span>
                      )}
                    </span>
                    {studio.xpEarned > 0 && (
                      <span className="text-[10px] font-black text-pink-300">
                        +{studio.xpEarned} XP
                      </span>
                    )}
                  </div>
                </div>

                <p className="relative z-10 text-[11px] text-zinc-400 leading-relaxed">{studio.motto}</p>

                {/* Progresso para próximo Tier */}
                <div className="bg-zinc-950/75 border border-zinc-800/80 rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-zinc-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {studio.completedCount}{' '}
                      {studio.completedCount === 1 ? 'obra concluída' : 'obras concluídas'}
                      {studio.inProgressCount > 0 && (
                        <span className="text-zinc-400 font-normal">
                          (+{studio.inProgressCount} em andamento)
                        </span>
                      )}
                    </span>
                    {nextMeta ? (
                      <span className="text-[10px] text-zinc-400 font-bold">
                        Próx: {nextMeta.icon} {studio.nextTierTarget}
                      </span>
                    ) : studio.nextStarTarget ? (
                      <span className="text-[10px] text-amber-300 font-black">
                        Próx ★ em {studio.nextStarTarget}
                      </span>
                    ) : (
                      <span className="text-[10px] text-red-300 font-black">MÍTICO!</span>
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${tierMeta.barClass}`}
                      style={{ width: `${studio.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9.5px] text-zinc-500 pt-0.5">
                    <span>{tierMeta.difficultyHint}</span>
                    <span className="font-semibold text-zinc-400">{studio.progressPercentage}% concluído</span>
                  </div>
                </div>

                {/* Estatísticas no Estúdio */}
                {studio.totalShowsCount > 0 && (
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-300">
                    <span className="inline-flex items-center gap-1">
                      <Tv className="w-3.5 h-3.5 text-pink-400" />
                      {studio.episodesWatched} eps
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      {studio.hoursWatched}h
                    </span>
                    {studio.avgUserRating !== null && (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-300">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {studio.avgUserRating}
                      </span>
                    )}
                  </div>
                )}

                {/* Obras do usuário nesse estúdio */}
                {studio.matchedShows.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                      Suas Obras ({studio.matchedShows.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {studio.matchedShows.map((m) => {
                        const thumb = resolveTvPosterUrl(m.poster_url);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => onEditShowById?.(m.id)}
                            className="inline-flex items-center gap-1.5 bg-zinc-950/90 hover:border-pink-500/50 border border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-200 cursor-pointer transition-colors max-w-full"
                          >
                            {thumb && (
                              <img src={thumb} alt={m.title} className="w-4 h-5 object-cover rounded shrink-0" />
                            )}
                            <span className="truncate max-w-[150px]">{m.title}</span>
                            {m.watch_status === 'completed' ? (
                              <span className="text-emerald-400 text-[10px]">✓</span>
                            ) : (
                              <span className="text-sky-400 text-[10px]">▶</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sugestões / Clássicos do Estúdio */}
                <div className="mt-auto pt-2 border-t border-zinc-800/70 space-y-1.5">
                  <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-fuchsia-400" />
                    <span>Clássicos do Estúdio (clique para cadastrar)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {studio.signatureWorks.map((workTitle) => {
                      const hasSimilar = Array.from(existingTitlesLower).some((t) =>
                        t.includes(workTitle.toLowerCase().slice(0, 8))
                      );
                      return (
                        <button
                          key={workTitle}
                          type="button"
                          onClick={() => onAddShowByTitle?.(workTitle)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-colors cursor-pointer ${
                            hasSimilar
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : 'bg-zinc-950/80 hover:bg-pink-500/15 border-zinc-800 hover:border-pink-500/45 text-zinc-300'
                          }`}
                        >
                          {!hasSimilar && <Plus className="w-2.5 h-2.5 text-pink-400" />}
                          <span>{workTitle}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
