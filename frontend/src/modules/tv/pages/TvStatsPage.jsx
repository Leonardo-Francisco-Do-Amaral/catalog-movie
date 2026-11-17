import React, { useCallback, useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  Globe2,
  Tv,
  Film,
  Clock,
  Star,
  Music,
  Building2,
  Users,
  Sparkles,
  RefreshCw,
  Award,
  TrendingUp,
  Layers,
} from 'lucide-react';
import {
  TV_KIND_META,
  TV_STATUS_META,
  fetchTvStats,
  resolveTvPosterUrl,
} from '../utils/tvApi';

function SakuraTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  return (
    <div className="bg-zinc-950/95 border border-pink-500/40 rounded-xl px-3 py-2 text-xs shadow-2xl space-y-1">
      <div className="font-black text-pink-200">{label}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4">
          <span style={{ color: entry.color }} className="font-bold">
            {entry.name}:
          </span>
          <span className="font-black text-zinc-100">{entry.value}</span>
        </div>
      ))}
      {row?.topShowTitle && (
        <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800">
          Destaque: <span className="text-zinc-200 font-semibold">{row.topShowTitle}</span>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, accent = 'text-pink-400', border = 'border-zinc-800/90' }) {
  return (
    <div className={`bg-zinc-900/65 border ${border} rounded-2xl p-4 flex flex-col justify-between gap-2`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</span>
        <Icon className={`w-4 h-4 ${accent}`} />
      </div>
      <div className="text-2xl sm:text-3xl font-black text-zinc-100 leading-none">{value}</div>
      {sub && <div className="text-[11px] text-zinc-400">{sub}</div>}
    </div>
  );
}

export default function TvStatsPage({ onSelectShow }) {
  const [scope, setScope] = useState('tv'); // 'tv' | 'grand_total'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadStats = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await fetchTvStats();
      setStats(data);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Erro ao carregar estatísticas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-pink-400 animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Calculando Estatísticas...
        </span>
      </div>
    );
  }

  if (errorMsg || !stats) {
    return (
      <div className="max-w-2xl mx-auto bg-rose-500/10 border border-rose-500/40 rounded-2xl p-6 text-center space-y-3">
        <p className="text-sm text-rose-200 font-bold">{errorMsg || 'Dados indisponíveis.'}</p>
        <button
          type="button"
          onClick={loadStats}
          className="px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-black uppercase cursor-pointer"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const { overview, demographics, genres, studios, staff, decades, seenByYear, topRatedShows, topSongs, ratingComparison, grandTotal } =
    stats;

  const maxStudioCount = Math.max(1, ...(studios || []).map((s) => s.count));
  const maxGenreCount = Math.max(1, ...(genres || []).map((g) => g.count));

  return (
    <div className="space-y-6">
      {/* Cabeçalho + Seletor de Escopo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-500/15 pb-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-pink-400" />
          <div>
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-widest text-zinc-100">
              {scope === 'tv' ? 'Estatísticas — Animes, Séries & Doramas' : 'Total Geral — Filmes + Animes & Séries'}
            </h2>
            <p className="text-xs text-zinc-400">
              {scope === 'tv'
                ? 'Horas assistidas, estúdios, demografias, notas musicais e evolução por eras.'
                : 'Visão consolidada do seu tempo de tela em Cinema e Animes & Séries.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center bg-zinc-900/90 p-1 rounded-xl border border-pink-500/25">
            <button
              type="button"
              onClick={() => setScope('tv')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                scope === 'tv'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <span>⛩️</span>
              <span>Animes &amp; Séries</span>
            </button>
            <button
              type="button"
              onClick={() => setScope('grand_total')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                scope === 'grand_total'
                  ? 'bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Total Geral</span>
            </button>
          </div>

          <button
            type="button"
            onClick={loadStats}
            title="Recalcular estatísticas"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {scope === 'grand_total' ? (
        /* ============================================================================
           VISÃO TOTAL GERAL (FILMES + ANIMES & SÉRIES)
           ============================================================================ */
        <div className="space-y-6">
          {/* Dois Níveis Separados Lado a Lado (Decisão 12) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-amber-500/12 via-zinc-900/80 to-zinc-950 border border-amber-500/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  🎬 Nível Oficial de Cinema
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-black">
                  {(grandTotal.cinemaXp?.totalXp || 0).toLocaleString('pt-BR')} XP
                </span>
              </div>
              {grandTotal.cinemaXp ? (
                <>
                  <div className="text-lg font-black text-zinc-100">
                    LVL {grandTotal.cinemaXp.level} — {grandTotal.cinemaXp.levelTitle}
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-amber-500/20">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full"
                        style={{ width: `${Math.max(4, grandTotal.cinemaXp.progressPercentage || 0)}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-zinc-400 flex justify-between">
                      <span>
                        {grandTotal.cinemaXp.xpInCurrentLevel} / {grandTotal.cinemaXp.xpNeededForNextLevel} XP
                      </span>
                      <span>{grandTotal.cinemaXp.progressPercentage}%</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-zinc-400">Dados de XP de Cinema indisponíveis.</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-pink-500/12 via-purple-500/10 to-zinc-950 border border-pink-500/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">
                  ⛩️ Nível de Animes &amp; Séries
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-200 text-xs font-black">
                  {(grandTotal.tvXp?.totalXp || 0).toLocaleString('pt-BR')} XP
                </span>
              </div>
              <div className="text-lg font-black text-zinc-100">
                LVL {grandTotal.tvXp?.level ?? 1} — {grandTotal.tvXp?.levelTitle}
              </div>
              <div className="space-y-1">
                <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-pink-500/20">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 rounded-full"
                    style={{ width: `${Math.max(4, grandTotal.tvXp?.progressPercentage || 0)}%` }}
                  />
                </div>
                <div className="text-[11px] text-zinc-400 flex justify-between">
                  <span>
                    {grandTotal.tvXp?.xpInCurrentLevel ?? 0} / {grandTotal.tvXp?.xpNeededForNextLevel ?? 60} XP
                  </span>
                  <span>{grandTotal.tvXp?.progressPercentage ?? 0}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* KPIs Combinados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={Globe2}
              label="Total de Títulos"
              value={grandTotal.totalTitles}
              sub={`${grandTotal.moviesSummary.count} filmes + ${grandTotal.tvSummary.count} obras`}
              accent="text-purple-400"
              border="border-purple-500/30"
            />
            <KpiCard
              icon={Clock}
              label="Horas Totais de Tela"
              value={`${grandTotal.totalScreenHours.toLocaleString('pt-BR')}h`}
              sub={`${grandTotal.totalScreenDays} dias inteiros assistindo`}
              accent="text-pink-400"
              border="border-pink-500/30"
            />
            <KpiCard
              icon={Film}
              label="Modo Cinema"
              value={`${grandTotal.moviesSummary.hours.toLocaleString('pt-BR')}h`}
              sub={`${grandTotal.moviesSummary.count} filmes · Média ⭐ ${grandTotal.moviesSummary.avgRating ?? '—'}`}
              accent="text-amber-400"
              border="border-amber-500/30"
            />
            <KpiCard
              icon={Tv}
              label="Modo Animes & Séries"
              value={`${grandTotal.tvSummary.hours.toLocaleString('pt-BR')}h`}
              sub={`${grandTotal.tvSummary.episodes} eps · Média ⭐ ${grandTotal.tvSummary.avgRating ?? '—'}`}
              accent="text-fuchsia-400"
              border="border-fuchsia-500/30"
            />
          </div>

          {/* Proporção de Horas */}
          <div className="bg-zinc-900/65 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
              <span className="text-amber-300">🎬 Cinema ({grandTotal.moviesSharePct}%)</span>
              <span className="text-zinc-400">Divisão do Tempo de Tela</span>
              <span className="text-pink-300">⛩️ Animes &amp; Séries ({grandTotal.tvSharePct}%)</span>
            </div>
            <div className="w-full h-4 bg-zinc-950 rounded-full overflow-hidden flex border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                style={{ width: `${grandTotal.moviesSharePct}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                style={{ width: `${grandTotal.tvSharePct}%` }}
              />
            </div>
          </div>

          {/* Gráficos Combinados */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-zinc-900/65 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-pink-400" />
                Horas Assistidas por Ano (Cinema vs Animes &amp; Séries)
              </h3>
              {grandTotal.combinedSeenByYear?.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={grandTotal.combinedSeenByYear}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="year" stroke="#a1a1aa" fontSize={11} />
                      <YAxis stroke="#a1a1aa" fontSize={11} />
                      <Tooltip content={<SakuraTooltip />} />
                      <Bar dataKey="moviesHours" name="Horas Cinema" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="tvHours" name="Horas Animes/Séries" fill="#ec4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-10 text-center">
                  Informe o ano assistido nas obras para visualizar o histórico anual combinado.
                </p>
              )}
            </div>

            <div className="bg-zinc-900/65 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Obras por Década de Lançamento (Cinema vs Animes &amp; Séries)
              </h3>
              {grandTotal.combinedByDecade?.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={grandTotal.combinedByDecade}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="decade" stroke="#a1a1aa" fontSize={11} />
                      <YAxis stroke="#a1a1aa" fontSize={11} />
                      <Tooltip content={<SakuraTooltip />} />
                      <Bar dataKey="moviesCount" name="Filmes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="tvCount" name="Animes & Séries" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-10 text-center">Sem dados de décadas ainda.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================================
           ESTATÍSTICAS EXCLUSIVAS DE ANIMES, SÉRIES & DORAMAS
           ============================================================================ */
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={Tv}
              label="Obras no Catálogo"
              value={overview.totalShows}
              sub={`⛩️ ${overview.byKind.anime.count} Animes · 📺 ${overview.byKind.series.count} Séries · 🌸 ${overview.byKind.dorama.count} Doramas`}
              accent="text-pink-400"
              border="border-pink-500/30"
            />
            <KpiCard
              icon={Layers}
              label="Episódios & Temporadas"
              value={overview.totalEpisodesWatched.toLocaleString('pt-BR')}
              sub={`${overview.completedSeasons} de ${overview.totalSeasons} temporadas concluídas`}
              accent="text-purple-400"
              border="border-purple-500/30"
            />
            <KpiCard
              icon={Clock}
              label="Tempo Assistido"
              value={`${overview.totalHoursWatched.toLocaleString('pt-BR')}h`}
              sub={`Equivale a ${overview.totalDaysWatched} dias assistindo`}
              accent="text-fuchsia-400"
              border="border-fuchsia-500/30"
            />
            <KpiCard
              icon={Star}
              label="Médias de Avaliação"
              value={overview.avgUserRating !== null ? `⭐ ${overview.avgUserRating}` : '—'}
              sub={`MAL/IMDb: ${overview.avgExternalScore ?? '—'} · 🎵 Música: ${overview.avgMusicRating ?? '—'}`}
              accent="text-amber-400"
              border="border-zinc-800"
            />
          </div>

          {overview.totalShows === 0 ? (
            <div className="bg-zinc-900/50 border border-dashed border-pink-500/30 rounded-2xl p-10 text-center space-y-2">
              <p className="text-sm font-black text-zinc-200">Nenhuma obra cadastrada ainda.</p>
              <p className="text-xs text-zinc-400">
                Cadastre seus primeiros animes, séries ou doramas no Catálogo para preencher os gráficos e rankings.
              </p>
            </div>
          ) : (
            <>
              {/* Status + Demografias */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-zinc-900/65 border border-zinc-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200">
                    Distribuição por Status
                  </h3>
                  <div className="space-y-2.5">
                    {Object.entries(TV_STATUS_META).map(([statusKey, meta]) => {
                      const count = overview.byStatus[statusKey] || 0;
                      const pct = overview.totalShows > 0 ? Math.round((count / overview.totalShows) * 100) : 0;
                      return (
                        <div key={statusKey} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-zinc-200">
                              {meta.icon} {meta.label}
                            </span>
                            <span className="text-zinc-400 font-black">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-zinc-900/65 border border-zinc-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-fuchsia-400" />
                    Demografias (Shounen, Seinen, Shoujo...)
                  </h3>
                  {demographics.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-6 text-center">
                      Nenhuma demografia registrada ainda.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {demographics.map((d) => (
                        <div
                          key={d.name}
                          className="bg-zinc-950/80 border border-fuchsia-500/25 rounded-xl p-3 flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-black text-fuchsia-200">{d.name}</div>
                            <div className="text-[10px] text-zinc-400">
                              {d.episodes} eps · {d.hours}h
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-black text-zinc-100">{d.count}</div>
                            {d.avgRating !== null && (
                              <div className="text-[10px] text-pink-300 font-bold">⭐ {d.avgRating}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Gráficos: Eras/Décadas + Evolução por Ano Assistido */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-zinc-900/65 border border-zinc-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200">
                    Eras &amp; Décadas de Lançamento
                  </h3>
                  {decades.length > 0 ? (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={decades}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                          <XAxis dataKey="decade" stroke="#a1a1aa" fontSize={11} />
                          <YAxis stroke="#a1a1aa" fontSize={11} />
                          <Tooltip content={<SakuraTooltip />} />
                          <Bar dataKey="count" name="Obras" fill="#ec4899" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 py-10 text-center">Sem anos de estreia informados.</p>
                  )}
                </div>

                <div className="bg-zinc-900/65 border border-zinc-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200">
                    Evolução por Ano Assistido (Horas)
                  </h3>
                  {seenByYear.length > 0 ? (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={seenByYear}>
                          <defs>
                            <linearGradient id="tvSakuraArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.55} />
                              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                          <XAxis dataKey="year" stroke="#a1a1aa" fontSize={11} />
                          <YAxis stroke="#a1a1aa" fontSize={11} />
                          <Tooltip content={<SakuraTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="hours"
                            name="Horas assistidas"
                            stroke="#ec4899"
                            strokeWidth={2}
                            fill="url(#tvSakuraArea)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 py-10 text-center">
                      Informe "Ano Visto" na obra (ou por temporada) para gerar a linha do tempo.
                    </p>
                  )}
                </div>
              </div>

              {/* Estúdios + Gêneros + Autores/Diretores */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="bg-zinc-900/65 border border-zinc-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-pink-400" />
                    Top Estúdios
                  </h3>
                  {studios.length === 0 ? (
                    <p className="text-xs text-zinc-500">Sem estúdios cadastrados.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto tv-sakura-scroll pr-1">
                      {studios.map((st) => (
                        <div key={st.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-zinc-200 truncate">{st.name}</span>
                            <span className="text-[11px] text-zinc-400 shrink-0">
                              {st.count} · {st.episodes} eps
                              {st.avgRating !== null && ` · ⭐ ${st.avgRating}`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                              style={{ width: `${Math.round((st.count / maxStudioCount) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-zinc-900/65 border border-zinc-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200">
                    Top Gêneros
                  </h3>
                  {genres.length === 0 ? (
                    <p className="text-xs text-zinc-500">Sem gêneros cadastrados.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto tv-sakura-scroll pr-1">
                      {genres.map((g) => (
                        <div key={g.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-zinc-200 truncate">{g.name}</span>
                            <span className="text-[11px] text-zinc-400 shrink-0">
                              {g.count} {g.avgRating !== null && `· ⭐ ${g.avgRating}`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400 rounded-full"
                              style={{ width: `${Math.round((g.count / maxGenreCount) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-zinc-900/65 border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    Autores &amp; Diretores Frequentes
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] font-black uppercase text-pink-400 mb-1.5">
                        Autores Originais
                      </div>
                      {staff.creators?.length > 0 ? (
                        <div className="space-y-1">
                          {staff.creators.slice(0, 5).map((c) => (
                            <div
                              key={c.name}
                              className="flex items-center justify-between text-xs bg-zinc-950/75 px-2.5 py-1.5 rounded-lg border border-zinc-800/80"
                            >
                              <span className="text-zinc-200 truncate">{c.name}</span>
                              <span className="text-[11px] font-bold text-pink-300 shrink-0">
                                {c.count} {c.avgRating !== null && `· ⭐ ${c.avgRating}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-zinc-500">Sem autores registrados.</p>
                      )}
                    </div>

                    <div>
                      <div className="text-[10px] font-black uppercase text-purple-400 mb-1.5">
                        Direção
                      </div>
                      {staff.directors?.length > 0 ? (
                        <div className="space-y-1">
                          {staff.directors.slice(0, 5).map((d) => (
                            <div
                              key={d.name}
                              className="flex items-center justify-between text-xs bg-zinc-950/75 px-2.5 py-1.5 rounded-lg border border-zinc-800/80"
                            >
                              <span className="text-zinc-200 truncate">{d.name}</span>
                              <span className="text-[11px] font-bold text-purple-300 shrink-0">
                                {d.count} {d.avgRating !== null && `· ⭐ ${d.avgRating}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-zinc-500">Sem diretores registrados.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hall Musical + Melhores Obras + Minha Nota x MAL/IMDb */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-zinc-900/65 border border-fuchsia-500/25 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-fuchsia-300 flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Hall Musical (Melhores Aberturas &amp; Encerramentos)
                  </h3>
                  {topSongs.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-6 text-center">
                      Cadastre sua "Melhor Música" e "Nota da Música" nas obras para montar este ranking.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto tv-sakura-scroll pr-1">
                      {topSongs.map((item, idx) => {
                        const poster = resolveTvPosterUrl(item.poster_url);
                        return (
                          <div
                            key={`${item.showId}-${idx}`}
                            className="flex items-center gap-3 bg-zinc-950/85 border border-zinc-800 rounded-xl p-2.5"
                          >
                            <span className="text-xs font-black text-fuchsia-400 w-5 text-center">
                              #{idx + 1}
                            </span>
                            {poster && (
                              <img
                                src={poster}
                                alt={item.showTitle}
                                className="w-9 h-12 object-cover rounded shrink-0"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-black text-zinc-100 truncate">
                                {item.songTitle}
                              </div>
                              <div className="text-[10px] text-zinc-400 truncate">
                                {item.showTitle}
                                {item.bestSeasonLabel ? ` · 🏆 ${item.bestSeasonLabel}` : ''}
                              </div>
                            </div>
                            {item.musicRating !== null && (
                              <span className="px-2 py-0.5 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-200 text-xs font-black shrink-0">
                                🎵 {item.musicRating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-zinc-900/65 border border-zinc-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      Top Obras &amp; Comparativo (Minha Nota × MAL/IMDb)
                    </h3>
                    {overview.avgRatingDiff !== null && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                        Diferença média: {overview.avgRatingDiff > 0 ? '+' : ''}
                        {overview.avgRatingDiff}
                      </span>
                    )}
                  </div>

                  {topRatedShows.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-6 text-center">
                      Dê uma nota pessoal às obras para ver o ranking.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto tv-sakura-scroll pr-1">
                      {topRatedShows.map((item, idx) => {
                        const kindMeta = TV_KIND_META[item.kind] || TV_KIND_META.anime;
                        const comp = ratingComparison.find((c) => c.id === item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelectShow?.(item.id)}
                            className="w-full text-left flex items-center justify-between gap-3 bg-zinc-950/85 hover:border-pink-500/45 border border-zinc-800 rounded-xl px-3 py-2 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-xs font-black text-pink-400 w-5">#{idx + 1}</span>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-zinc-100 truncate">
                                  {kindMeta.icon} {item.title}
                                </div>
                                <div className="text-[10px] text-zinc-400">
                                  {item.start_year || '—'}
                                  {comp && (
                                    <span className="ml-2">
                                      · {kindMeta.scoreLabel}: {comp.externalScore} (
                                      <span
                                        className={
                                          comp.diff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                        }
                                      >
                                        {comp.diff > 0 ? '+' : ''}
                                        {comp.diff}
                                      </span>
                                      )
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-200 text-xs font-black shrink-0">
                              ⭐ {item.user_rating.toFixed(2).replace(/\.?0+$/, '')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
