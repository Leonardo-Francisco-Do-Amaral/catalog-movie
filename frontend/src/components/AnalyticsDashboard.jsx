import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  Film,
  Clock,
  Star,
  Calendar,
  Shield,
  Trophy,
  Flame,
  Target,
  Sparkles,
  TrendingUp,
  Zap,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Save,
  Search,
  BookOpen,
  X,
} from 'lucide-react';
import { getCountryIsoFromName } from './InteractiveGlobe3D';
import TrophyChecklistModal from './TrophyChecklistModal';
import { evaluateTrophiesClientSide } from '../utils/trophyEngineClient';
import {
  TROPHY_XP_BY_TIER,
  TROPHY_TIER_META,
  COUNTRY_RARITY_META,
  TIME_MACHINE_RARITY_META,
} from '../utils/xpSystem';
import {
  MONTH_NAMES,
  resolvePosterUrl,
  computeRatingsPantheon,
  computeExtremeRecords,
  computeSaveCheckpoints,
  computeYearShowdown,
  computeRpgAndGuilds,
} from '../utils/analyticsEngine';

const API_BASE_URL = 'http://localhost:5000/api';

const CanisterBar = (props) => {
  const { fill, x, y, width, height } = props;
  if (!height || !width) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={4} fill={fill} opacity={0.16} />
      <rect x={x} y={y} width={width} height={height} rx={4} fill="none" stroke={fill} strokeWidth={1.5} />
      <rect x={x + 2} y={y + 2} width={Math.max(0, width - 4)} height={Math.max(0, height - 4)} rx={2} fill={fill} opacity={0.82} />
      <line x1={x + 4} y1={y + 4} x2={x + 4} y2={y + height - 4} stroke="rgba(255,255,255,0.45)" strokeWidth={1} />
    </g>
  );
};

const RARITY_CARD_THEMES = {
  mythic: {
    border: 'border-rose-500/50 hover:border-rose-400',
    bg: 'from-rose-950/35 via-zinc-950 to-zinc-950',
    badge: 'bg-rose-500/20 border-rose-400/50 text-rose-200',
    stat: 'bg-rose-500/20 border-rose-400/50 text-rose-200',
    glow: 'shadow-[0_0_28px_rgba(244,63,94,0.15)]',
  },
  legendary: {
    border: 'border-amber-500/50 hover:border-amber-400',
    bg: 'from-amber-950/30 via-zinc-950 to-zinc-950',
    badge: 'bg-amber-500/20 border-amber-400/50 text-amber-200',
    stat: 'bg-amber-500/20 border-amber-400/50 text-amber-200',
    glow: 'shadow-[0_0_28px_rgba(245,158,11,0.14)]',
  },
  epic: {
    border: 'border-purple-500/50 hover:border-purple-400',
    bg: 'from-purple-950/30 via-zinc-950 to-zinc-950',
    badge: 'bg-purple-500/20 border-purple-400/50 text-purple-200',
    stat: 'bg-purple-500/20 border-purple-400/50 text-purple-200',
    glow: 'shadow-[0_0_26px_rgba(168,85,247,0.14)]',
  },
  rare: {
    border: 'border-cyan-500/50 hover:border-cyan-400',
    bg: 'from-cyan-950/30 via-zinc-950 to-zinc-950',
    badge: 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200',
    stat: 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200',
    glow: 'shadow-[0_0_24px_rgba(34,211,238,0.12)]',
  },
};

const SLOT_ACCENTS = {
  emerald: 'border-emerald-500/55 bg-emerald-950/20 text-emerald-200',
  amber: 'border-amber-400/65 bg-amber-950/20 text-amber-200',
  purple: 'border-purple-500/55 bg-purple-950/20 text-purple-200',
  rose: 'border-rose-500/60 bg-rose-950/20 text-rose-200',
  sky: 'border-sky-500/50 bg-sky-950/20 text-sky-200',
  cyan: 'border-cyan-500/50 bg-cyan-950/20 text-cyan-200',
};

function PosterThumb({ url, title, className = 'w-12 h-16 rounded-lg' }) {
  const resolved = resolvePosterUrl(url);
  if (!resolved) {
    return (
      <div className={`${className} bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0`}>
        <Film className="w-4 h-4 text-zinc-600" />
      </div>
    );
  }
  return (
    <img
      src={resolved}
      alt={title || 'Pôster'}
      loading="lazy"
      className={`${className} object-cover border border-white/15 shrink-0 bg-zinc-900`}
    />
  );
}

export default function AnalyticsDashboard({
  movies = [],
  xpStatus: xpStatusProp = null,
  onNavigateTab,
}) {
  const [selectedYear, setSelectedYear] = useState('Geral');
  const [activeWing, setActiveWing] = useState('all');
  const [unifiedMode, setUnifiedMode] = useState('best'); // 'best' | 'worst'
  const [checkpointMode, setCheckpointMode] = useState('registration'); // 'registration' | 'watched'
  const [compareMode, setCompareMode] = useState('combined'); // 'combined' | 'grid' | 'table'
  const [showFullRoadmap, setShowFullRoadmap] = useState(false);
  const [inspectingTrophy, setInspectingTrophy] = useState(null);
  const [isGrimoireOpen, setIsGrimoireOpen] = useState(false);
  const [equippedClassId, setEquippedClassId] = useState(null);
  const [grimoireSearch, setGrimoireSearch] = useState('');
  const [showAttributeHelp, setShowAttributeHelp] = useState(false);

  const [liveXp, setLiveXp] = useState(xpStatusProp);
  const [trophiesList, setTrophiesList] = useState([]);

  const isYearFilterActive = selectedYear !== 'Geral';

  const sectionTabs = useMemo(() => {
    if (isYearFilterActive) {
      return [
        { id: 'all', label: `✨ Temporada ${selectedYear}` },
        { id: 'pantheon', label: '👑 Panteão das 4 Notas' },
        { id: 'relics', label: '💎 Recordes da Temporada' },
        { id: 'years', label: '📅 Ritmo & Gráficos' },
        { id: 'guilds', label: '🎙️ Áudio, Países & Guildas' },
      ];
    }
    return [
      { id: 'all', label: '✨ Visão Geral Completa' },
      { id: 'xp_rpg', label: '⚡ XP & Ficha RPG' },
      { id: 'pantheon', label: '👑 Panteão das 4 Notas' },
      { id: 'relics', label: '💎 Relíquias & Recordes' },
      { id: 'checkpoints', label: '💾 Save Slots (#1, #50, #100...)' },
      { id: 'years', label: '📅 Anos & Gravações' },
      { id: 'guilds', label: '🎙️ Áudio, Países & Guildas' },
    ];
  }, [isYearFilterActive, selectedYear]);

  // Se trocar para um ano específico e estiver numa aba exclusiva da visão geral, volta para 'all'
  useEffect(() => {
    if (isYearFilterActive && (activeWing === 'xp_rpg' || activeWing === 'checkpoints')) {
      setActiveWing('all');
    }
  }, [isYearFilterActive, activeWing]);

  useEffect(() => {
    if (xpStatusProp) setLiveXp(xpStatusProp);
  }, [xpStatusProp]);

  // Busca dados oficiais de XP e Troféus do servidor (com fallback local instantâneo)
  useEffect(() => {
    let mounted = true;
    const loadServerInsights = async () => {
      try {
        const [xpRes, trRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/xp`),
          axios.get(`${API_BASE_URL}/trophies`),
        ]);
        if (!mounted) return;
        if (xpRes.status === 'fulfilled' && xpRes.value.data?.success && xpRes.value.data?.data) {
          setLiveXp(xpRes.value.data.data);
        }
        if (trRes.status === 'fulfilled' && trRes.value.data?.success && trRes.value.data?.data?.trophies) {
          setTrophiesList(trRes.value.data.data.trophies);
          return;
        }
      } catch {
        // fallback abaixo
      }
      if (mounted && movies.length > 0) {
        try {
          const fallback = evaluateTrophiesClientSide(movies);
          setTrophiesList(fallback?.trophies || []);
        } catch {
          // ignore
        }
      }
    };
    loadServerInsights();

    const onSync = (e) => {
      if (e?.detail && mounted) setLiveXp(e.detail);
    };
    window.addEventListener('cine-xp-status-sync', onSync);
    return () => {
      mounted = false;
      window.removeEventListener('cine-xp-status-sync', onSync);
    };
  }, [movies]);

  // Anos disponíveis (year_seen)
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    movies.forEach((m) => {
      if (m.year_seen) yearsSet.add(String(m.year_seen));
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [movies]);

  // Filmes filtrados pela temporada selecionada
  const filteredMovies = useMemo(() => {
    if (selectedYear === 'Geral') return movies;
    return movies.filter((m) => String(m.year_seen) === selectedYear);
  }, [movies, selectedYear]);

  // Motores Analíticos Principais
  const rpgData = useMemo(
    () => computeRpgAndGuilds(filteredMovies, movies, liveXp, trophiesList),
    [filteredMovies, movies, liveXp, trophiesList]
  );

  const pantheon = useMemo(
    () => computeRatingsPantheon(filteredMovies),
    [filteredMovies]
  );

  const extremeRecords = useMemo(
    () => computeExtremeRecords(filteredMovies),
    [filteredMovies]
  );

  const checkpoints = useMemo(
    () => computeSaveCheckpoints(movies, checkpointMode),
    [movies, checkpointMode]
  );

  const yearShowdown = useMemo(
    () => computeYearShowdown(filteredMovies, movies),
    [filteredMovies, movies]
  );

  // Dados de gráficos temporais e geográficos
  const { monthlyData, monthlyComparisonData, ratingDistData, decadesChartData, countryCounts, topCountriesList } =
    useMemo(() => {
      // 1. Mensal simples
      const mData = MONTH_NAMES.map((name) => ({
        name,
        quantidade: 0,
        somaNota: 0,
        qtdNotas: 0,
        notaMedia: 0,
      }));
      filteredMovies.forEach((m) => {
        if (m.month_seen) {
          const idx = parseInt(String(m.month_seen), 10) - 1;
          if (idx >= 0 && idx < 12) {
            mData[idx].quantidade += 1;
            const r = Number(m.user_rating);
            if (r > 0) {
              mData[idx].somaNota += r;
              mData[idx].qtdNotas += 1;
            }
          }
        }
      });
      mData.forEach((it) => {
        it.notaMedia = it.qtdNotas > 0 ? parseFloat((it.somaNota / it.qtdNotas).toFixed(2)) : 0;
      });

      // 2. Comparativo multiano
      const compData = MONTH_NAMES.map((name) => {
        const row = { name };
        availableYears.forEach((yr) => { row[yr] = 0; });
        return row;
      });
      movies.forEach((m) => {
        if (m.year_seen && m.month_seen) {
          const yr = String(m.year_seen);
          const idx = parseInt(String(m.month_seen), 10) - 1;
          if (idx >= 0 && idx < 12 && compData[idx] && compData[idx][yr] !== undefined) {
            compData[idx][yr]++;
          }
        }
      });

      // 3. Curva de Notas
      const rBuckets = {};
      filteredMovies.forEach((m) => {
        const v = Number(m.user_rating);
        if (v > 0) {
          const b = v >= 10 ? 10 : Math.floor(v);
          rBuckets[b] = (rBuckets[b] || 0) + 1;
        }
      });
      const rDist = Object.keys(rBuckets)
        .map((k) => ({ name: `Nota ${k}`, quantidade: rBuckets[k], num: Number(k) }))
        .sort((a, b) => a.num - b.num);

      // 4. Décadas de Gravação (1920s..2020s)
      const decBuckets = {
        'Pré-60': 0,
        '1960s': 0,
        '1970s': 0,
        '1980s': 0,
        '1990s': 0,
        '2000s': 0,
        '2010s': 0,
        '2020s': 0,
      };
      filteredMovies.forEach((m) => {
        const ry = Number(m.release_year);
        if (!ry) return;
        if (ry < 1960) decBuckets['Pré-60']++;
        else if (ry < 1970) decBuckets['1960s']++;
        else if (ry < 1980) decBuckets['1970s']++;
        else if (ry < 1990) decBuckets['1980s']++;
        else if (ry < 2000) decBuckets['1990s']++;
        else if (ry < 2010) decBuckets['2000s']++;
        else if (ry < 2020) decBuckets['2010s']++;
        else decBuckets['2020s']++;
      });
      const decChart = Object.entries(decBuckets).map(([name, quantidade]) => ({ name, quantidade }));

      // 5. Países
      const cCounts = {};
      filteredMovies.forEach((m) => {
        (m.countries || []).forEach((c) => {
          if (c && c.trim()) {
            const clean = c.trim();
            if (clean !== 'União Soviética' && clean !== 'Alemanha Ocidental') {
              cCounts[clean] = (cCounts[clean] || 0) + 1;
            }
          }
        });
      });
      const topCountries = Object.entries(cCounts)
        .map(([name, count]) => ({ name, count, iso: getCountryIsoFromName(name) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        monthlyData: mData,
        monthlyComparisonData: compData,
        ratingDistData: rDist,
        decadesChartData: decChart,
        countryCounts: cCounts,
        topCountriesList: topCountries,
      };
    }, [filteredMovies, movies, availableYears]);

  const {
    activeXp,
    characterClass,
    totalStatPoints,
    campaignKpis,
    rpgAttributes,
    audioFactions,
    guilds,
    trophyInsights,
    levelRoadmap,
  } = rpgData;

  const activeDisplayClass = useMemo(() => {
    if (equippedClassId && characterClass?.allClasses) {
      const found = characterClass.allClasses.find((c) => c.id === equippedClassId);
      if (found) {
        return {
          ...characterClass,
          ...found,
          isCustomEquipped: true,
        };
      }
    }
    return {
      ...characterClass,
      isCustomEquipped: false,
    };
  }, [equippedClassId, characterClass]);

  const xpSources = activeXp?.sources || {};
  const totalXp = Math.max(1, activeXp?.totalXp || 0);

  const moviesXp = xpSources.movies?.totalXp || 0;
  const trophiesXp = xpSources.trophies?.totalXp || 0;
  const countriesXp = xpSources.countries?.totalXp || 0;
  const timeMachineXp = xpSources.timeMachine?.totalXp || 0;

  const pctMoviesXp = ((moviesXp / totalXp) * 100).toFixed(1);
  const pctTrophiesXp = ((trophiesXp / totalXp) * 100).toFixed(1);
  const pctCountriesXp = ((countriesXp / totalXp) * 100).toFixed(1);
  const pctTimeMachineXp = ((timeMachineXp / totalXp) * 100).toFixed(1);

  const showSection = (id) => {
    if (isYearFilterActive && (id === 'xp_rpg' || id === 'checkpoints')) {
      return false;
    }
    return activeWing === 'all' || activeWing === id;
  };

  const unifiedDisplayedList =
    unifiedMode === 'best' ? pantheon.top5Unified : pantheon.bottom5Unified;

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* =====================================================================
          BARRA DE COMANDO DO QUARTEL-GENERAL (ALAS & TEMPORADAS)
         ===================================================================== */}
      <section className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900/90 to-zinc-950 p-4 sm:p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/25 via-purple-500/15 to-cyan-500/20 border border-amber-400/50 flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
              {isYearFilterActive ? (
                <Calendar className="w-6 h-6 text-cyan-400" />
              ) : (
                <Shield className="w-6 h-6 text-amber-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {isYearFilterActive ? (
                  <>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/40">
                      📅 Temporada Anual • {selectedYear}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/35">
                      {filteredMovies.length} Filmes Assistidos em {selectedYear}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/40">
                      ⚔️ Quartel-General & Santuário RPG
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/35">
                      Nível {activeXp?.level || 1} • {(activeXp?.totalXp || 0).toLocaleString('pt-BR')} XP
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                {isYearFilterActive
                  ? `Relatório Anual de Desempenho & Notas de ${selectedYear}`
                  : 'Estatísticas Supremas, Economia de XP & Hall de Recordes'}
              </h1>
              {isYearFilterActive && (
                <p className="text-xs text-zinc-400 mt-0.5">
                  Visualizando exclusivamente os dados e filmes assistidos no ano de {selectedYear}. As métricas gerais de conta (XP, Nível e Saves históricos) ficam na aba Campanha Geral.
                </p>
              )}
            </div>
          </div>

          {/* Seletor de Temporada (Geral vs Ano Visto) */}
          <div className="flex items-center gap-1.5 flex-wrap bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800/90">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 px-2 hidden sm:inline">
              Temporada:
            </span>
            <button
              type="button"
              onClick={() => setSelectedYear('Geral')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                selectedYear === 'Geral'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Campanha Geral ({movies.length})
            </button>
            {availableYears.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Abas / Alas do Santuário */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {sectionTabs.map((tab) => {
            const active = activeWing === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveWing(tab.id)}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-black tracking-wide border transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-amber-500/25 via-purple-500/20 to-cyan-500/25 border-amber-400/60 text-white shadow-lg'
                    : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* KPIs Exclusivos da Temporada no Topo (Quando ano específico estiver selecionado) */}
        {isYearFilterActive && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2 border-t border-zinc-800/80">
            <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-3.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Tempo de Tela em {selectedYear}
              </span>
              <div className="text-2xl font-black font-mono text-white mt-1">
                {campaignKpis.hours.toLocaleString('pt-BR')}h
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                {campaignKpis.totalMinutes.toLocaleString('pt-BR')} minutos assistidos
              </div>
            </div>

            <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-3.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5" /> Obras Assistidas
              </span>
              <div className="text-2xl font-black font-mono text-white mt-1">
                {campaignKpis.totalMovies}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Média de {campaignKpis.avgRuntime} min por filme
              </div>
            </div>

            <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-3.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" /> Sua Média no Ano
              </span>
              <div className="text-2xl font-black font-mono text-white mt-1">
                {campaignKpis.avgUserRating}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                {campaignKpis.masterpiecesCount} obras com nota 9.000+
              </div>
            </div>

            <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-3.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Oscars Vistos em {selectedYear}
              </span>
              <div className="text-2xl font-black font-mono text-white mt-1">
                🏆 {campaignKpis.oscarWinsTotal}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                {campaignKpis.moviesWithOscarWin} filmes premiados na safra
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =====================================================================
          ALA 1: FICHA SUPREMA DE PERSONAGEM & ANATOMIA COMPLETA DO XP
         ===================================================================== */}
      {showSection('xp_rpg') && (
        <section className="flex flex-col gap-6">
          {/* Card Principal de Nível, Patente e Barra Multicor de XP */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/35 bg-gradient-to-br from-zinc-950 via-amber-950/15 to-zinc-950 p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
            <div className="pointer-events-none absolute -top-24 -right-16 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6">
              {/* Identidade RPG + Barra de Level Up */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
                {/* Emblema Nível + Classe */}
                <div className="xl:col-span-7 flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 p-[2px] shrink-0 shadow-[0_0_35px_rgba(245,158,11,0.35)]">
                    <div className="w-full h-full rounded-[22px] bg-zinc-950 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                        NÍVEL
                      </span>
                      <span className="text-4xl font-black font-mono text-white leading-none mt-0.5">
                        {activeXp?.level || 1}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/50 text-amber-300">
                        👑 Patente Oficial Desbloqueada
                      </span>
                      <span className="text-[11px] font-bold text-cyan-300">
                        {rpgData.characterSubclass}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent leading-tight">
                      “{activeXp?.levelTitle || 'Turista da Sessão da Tarde'}”
                    </h2>

                    {/* Barra de Progresso do Nível Atual */}
                    <div className="mt-1 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-300 font-bold">
                          Progresso Nv.{activeXp?.level}:{' '}
                          <strong className="text-amber-300">
                            {activeXp?.xpInCurrentLevel || 0} / {activeXp?.xpNeededForNextLevel || 300} XP
                          </strong>{' '}
                          ({activeXp?.progressPercentage || 0}%)
                        </span>
                        <span className="text-emerald-300 font-black">
                          Faltam {activeXp?.xpRemaining || 0} XP p/ Nv.{(activeXp?.level || 1) + 1}
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-zinc-900 border border-zinc-800 p-0.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-700"
                          style={{
                            width: `${Math.min(100, Math.max(3, activeXp?.progressPercentage || 0))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* XP Total + Próximo Título */}
                <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="rounded-2xl bg-zinc-900/80 border border-emerald-500/30 p-4 flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> XP Global da Conta
                    </span>
                    <div className="text-3xl font-black font-mono text-white mt-1">
                      {(activeXp?.totalXp || 0).toLocaleString('pt-BR')}{' '}
                      <span className="text-sm text-emerald-400">XP</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 mt-1">
                      Soma real de Filmes + Troféus + Países + Anos
                    </span>
                  </div>

                  <div className="rounded-2xl bg-zinc-900/80 border border-purple-500/30 p-4 flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-300 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-purple-400" /> Próxima Patente
                    </span>
                    {activeXp?.nextTitleMilestone ? (
                      <>
                        <div className="text-sm font-black text-white leading-snug mt-1 line-clamp-2">
                          Nv.{activeXp.nextTitleMilestone.level}: “{activeXp.nextTitleMilestone.title}”
                        </div>
                        <span className="text-[11px] text-amber-300 font-bold mt-1">
                          Faltam {activeXp.nextTitleMilestone.level - (activeXp.level || 1)} nível(is)!
                        </span>
                      </>
                    ) : (
                      <div className="text-sm font-black text-amber-300 mt-2">
                        👑 Nível Máximo Lendário Alcançado!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Barra Empilhada da Composição de XP (4 Motores do Jogo) */}
              <div className="rounded-2xl bg-zinc-900/75 border border-zinc-800/90 p-4 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Anatomia Completa do XP — De Onde Vem o Seu Poder?
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    4 Sistemas Integrados • 100% Tempo Real
                  </span>
                </div>

                {/* Barra Segmentada */}
                <div className="w-full h-4 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden flex p-0.5 gap-0.5">
                  <div
                    style={{ width: `${pctTrophiesXp}%` }}
                    className="h-full bg-purple-500 rounded-l-full transition-all"
                    title={`Troféus PS5: ${trophiesXp} XP (${pctTrophiesXp}%)`}
                  />
                  <div
                    style={{ width: `${pctMoviesXp}%` }}
                    className="h-full bg-amber-400 transition-all"
                    title={`Catálogo de Filmes: ${moviesXp} XP (${pctMoviesXp}%)`}
                  />
                  <div
                    style={{ width: `${pctTimeMachineXp}%` }}
                    className="h-full bg-cyan-400 transition-all"
                    title={`Máquina do Tempo: ${timeMachineXp} XP (${pctTimeMachineXp}%)`}
                  />
                  <div
                    style={{ width: `${pctCountriesXp}%` }}
                    className="h-full bg-emerald-400 rounded-r-full transition-all"
                    title={`Desafio 195 Países: ${countriesXp} XP (${pctCountriesXp}%)`}
                  />
                </div>

                {/* Legenda dos 4 Motores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                  <div className="flex items-center justify-between rounded-xl bg-zinc-950/90 border border-purple-500/30 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <span className="text-xs font-bold text-zinc-200">🏆 Troféus PS5</span>
                    </div>
                    <span className="text-xs font-mono font-black text-purple-300">
                      +{trophiesXp.toLocaleString('pt-BR')} XP ({pctTrophiesXp}%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-zinc-950/90 border border-amber-500/30 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="text-xs font-bold text-zinc-200">
                        🎬 Filmes ({xpSources.movies?.count || 0}×10)
                      </span>
                    </div>
                    <span className="text-xs font-mono font-black text-amber-300">
                      +{moviesXp.toLocaleString('pt-BR')} XP ({pctMoviesXp}%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-zinc-950/90 border border-cyan-500/30 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                      <span className="text-xs font-bold text-zinc-200">⏳ Máquina do Tempo</span>
                    </div>
                    <span className="text-xs font-mono font-black text-cyan-300">
                      +{timeMachineXp.toLocaleString('pt-BR')} XP ({pctTimeMachineXp}%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-zinc-950/90 border border-emerald-500/30 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="text-xs font-bold text-zinc-200">🌍 Desafio 195</span>
                    </div>
                    <span className="text-xs font-mono font-black text-emerald-300">
                      +{countriesXp.toLocaleString('pt-BR')} XP ({pctCountriesXp}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 KPIs Vitais da Temporada / Campanha */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Tempo de Tela ({selectedYear})
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                    {campaignKpis.hours.toLocaleString('pt-BR')}h
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Equivale a <strong className="text-zinc-200">{campaignKpis.days} dias</strong> ({campaignKpis.totalMinutes.toLocaleString('pt-BR')} min)
                  </div>
                </div>

                <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5" /> Filmes Concluídos
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                    {campaignKpis.totalMovies}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Média de <strong className="text-zinc-200">{campaignKpis.avgRuntime} min</strong> por sessão
                  </div>
                </div>

                <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" /> Média Pessoal & Elite
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                    {campaignKpis.avgUserRating}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    <strong className="text-amber-300">{campaignKpis.masterpiecesCount} obras-primas</strong> com nota 9.000+
                  </div>
                </div>

                <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" /> Glória do Oscar Vista
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                    🏆 {campaignKpis.oscarWinsTotal}{' '}
                    <span className="text-sm text-zinc-500">/ 🎬 {campaignKpis.oscarNomsTotal}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Em <strong className="text-emerald-300">{campaignKpis.moviesWithOscarWin} filmes</strong> vencedores da Academia
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DETALHAMENTO PROFUNDO DOS 3 GRANDES SUBSISTEMAS DE XP */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Subsistema 1: Troféus PS5 por Tier */}
            <div className="rounded-3xl bg-zinc-950/90 border border-purple-500/30 p-5 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                      Sistema de Conquistas PS5
                    </span>
                    <h3 className="text-base font-black text-white">
                      🏆 {xpSources.trophies?.totalUnlocked || 0} / {xpSources.trophies?.totalAvailable || 0} Troféus
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-200">
                    +{trophiesXp.toLocaleString('pt-BR')} XP
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {['platinum', 'mythic', 'gold', 'epic', 'silver', 'bronze'].map((tierKey) => {
                    const tInfo = xpSources.trophies?.byTier?.[tierKey];
                    if (!tInfo) return null;
                    const tMeta = TROPHY_TIER_META[tierKey] || {};
                    const tColor = tInfo.color || tMeta.color || 'text-zinc-200';
                    const tIcon = tInfo.icon || tMeta.icon || '🏅';
                    const tLabel = tInfo.label || tMeta.label || tierKey;
                    const tXpEach = tInfo.xpEach ?? tMeta.xpEach ?? 0;
                    const pct = tInfo.total > 0 ? Math.round((tInfo.count / tInfo.total) * 100) : 0;
                    return (
                      <div key={tierKey} className="rounded-xl bg-zinc-900/70 border border-zinc-800/90 px-3 py-2 flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-black ${tColor}`}>
                            {tIcon} {tLabel} <span className="text-[10px] text-zinc-500">({tXpEach} XP)</span>
                          </span>
                          <span className="font-mono font-bold text-zinc-200">
                            {tInfo.count}/{tInfo.total}{' '}
                            <span className="text-amber-300 ml-1">+{tInfo.totalXp} XP</span>
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                          <div className="h-full bg-purple-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('trophies')}
                  className="w-full py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/40 text-xs font-black uppercase tracking-wider text-purple-200 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>Abrir Salão de Troféus</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Subsistema 2: Desafio Mundial 195 Países por Raridade */}
            <div className="rounded-3xl bg-zinc-950/90 border border-emerald-500/30 p-5 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                      Geopolítica Cinematográfica
                    </span>
                    <h3 className="text-base font-black text-white">
                      🌍 {xpSources.countries?.totalConqueredCount || 0} / 195 Países ONU
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200">
                    +{countriesXp.toLocaleString('pt-BR')} XP
                  </span>
                </div>

                {xpSources.countries?.pendingCoproductionsCount > 0 && (
                  <div className="rounded-xl bg-amber-500/15 border border-amber-400/40 px-3 py-2 flex items-center gap-2 text-[11px] text-amber-200 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {xpSources.countries.pendingCoproductionsCount} coprodução(ões) aguardando bandeira oficial (XP retido!)
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {['mythic', 'legendary', 'epic', 'rare', 'common'].map((rKey) => {
                    const rInfo = xpSources.countries?.byRarity?.[rKey];
                    if (!rInfo) return null;
                    const rMeta = COUNTRY_RARITY_META[rKey] || {};
                    const rColor = rInfo.color || rMeta.color || 'text-zinc-200';
                    const rIcon = rInfo.icon || rMeta.icon || '🌍';
                    const rLabel = rInfo.pluralLabel || rMeta.pluralLabel || rInfo.label || rKey;
                    const rXpEach = rInfo.xpEach ?? rMeta.xpEach ?? 0;
                    const pct = rInfo.total > 0 ? Math.round((rInfo.count / rInfo.total) * 100) : 0;
                    return (
                      <div key={rKey} className="rounded-xl bg-zinc-900/70 border border-zinc-800/90 px-3 py-2 flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-black ${rColor}`}>
                            {rIcon} {rLabel} <span className="text-[10px] text-zinc-500">({rXpEach} XP)</span>
                          </span>
                          <span className="font-mono font-bold text-zinc-200">
                            {rInfo.count}/{rInfo.total}{' '}
                            <span className="text-emerald-300 ml-1">+{rInfo.totalXp} XP</span>
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('challenge')}
                  className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-xs font-black uppercase tracking-wider text-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>Abrir Passaporte 195 Países</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Subsistema 3: Máquina do Tempo por Era & Décadas */}
            <div className="rounded-3xl bg-zinc-950/90 border border-cyan-500/30 p-5 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                      Capacitor de Fluxo Temporal
                    </span>
                    <h3 className="text-base font-black text-white">
                      ⏳ {xpSources.timeMachine?.totalConqueredYears || 0} / {xpSources.timeMachine?.totalOfficialYears || 108} Anos
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200">
                    +{timeMachineXp.toLocaleString('pt-BR')} XP
                  </span>
                </div>

                {/* Décadas Platinadas */}
                <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 px-3 py-2 flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300 font-bold">
                      🏆 Relíquias de Década (10/10):
                    </span>
                    <span className="font-mono font-black text-amber-300">
                      {Object.keys(xpSources.timeMachine?.completedDecades || {}).length} décadas (+{xpSources.timeMachine?.decadesXp || 0} XP)
                    </span>
                  </div>
                  {Object.keys(xpSources.timeMachine?.completedDecades || {}).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {Object.values(xpSources.timeMachine.completedDecades).map((dec) => (
                        <span
                          key={dec.id}
                          className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/40 text-amber-200"
                        >
                          👑 {dec.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {['mythic', 'legendary', 'epic', 'rare', 'common'].map((rKey) => {
                    const rInfo = xpSources.timeMachine?.byRarity?.[rKey];
                    if (!rInfo) return null;
                    const tmMeta = TIME_MACHINE_RARITY_META[rKey] || {};
                    const tmColor = rInfo.color || tmMeta.color || 'text-zinc-200';
                    const tmIcon = rInfo.icon || tmMeta.icon || '⏳';
                    const tmLabel = rInfo.label || tmMeta.label || rKey;
                    const tmEra = rInfo.eraRangeLabel || tmMeta.eraRangeLabel || '';
                    const tmXpEach = rInfo.xp ?? rInfo.xpEach ?? tmMeta.xpEach ?? 0;
                    const pct = rInfo.total > 0 ? Math.round((rInfo.count / rInfo.total) * 100) : 0;
                    return (
                      <div key={rKey} className="rounded-xl bg-zinc-900/70 border border-zinc-800/90 px-3 py-2 flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-black ${tmColor}`}>
                            {tmIcon} {tmLabel}{' '}
                            <span className="text-[10px] text-zinc-500">
                              ({tmEra} • {tmXpEach} XP)
                            </span>
                          </span>
                          <span className="font-mono font-bold text-zinc-200">
                            {rInfo.count}/{rInfo.total}{' '}
                            <span className="text-cyan-300 ml-1">+{rInfo.totalXp} XP</span>
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                          <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('time_machine')}
                  className="w-full py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-xs font-black uppercase tracking-wider text-cyan-200 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>Abrir Máquina do Tempo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* FICHA DE ATRIBUTOS POR PONTOS & CLASSE DO PERSONAGEM */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            {/* Coluna da Esquerda (Card da Classe do Personagem - 6 colunas) */}
            <div className="xl:col-span-6 rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900/90 to-zinc-950 border border-amber-500/35 p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-xl relative overflow-hidden">
              <div className="pointer-events-none absolute -top-20 -right-16 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl" />

              <div className="relative z-10 flex flex-col gap-4">
                {/* Topo: Emblema e Badge da Classe */}
                <div className="flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 via-purple-500/15 to-cyan-500/20 border border-amber-400/50 flex items-center justify-center text-3xl shrink-0 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                      {activeDisplayClass.classIcon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/40">
                          {activeDisplayClass.tierLabel}
                        </span>
                        {activeDisplayClass.isCustomEquipped ? (
                          <span className="text-[10px] font-mono font-bold text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40">
                            Equipada Manualmente
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-emerald-300 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40">
                            Classe Atual (Desbloqueada)
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                        {activeDisplayClass.className}
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-black px-3 py-1.5 rounded-xl bg-zinc-900 border border-amber-400/35 text-amber-300 shrink-0">
                    {totalStatPoints} pts
                  </span>
                </div>

                {/* Subtítulo / Título de Honra */}
                <div className="text-xs font-bold text-cyan-300 flex items-center justify-between">
                  <span>{activeDisplayClass.titleFlavor}</span>
                  {activeDisplayClass.isCustomEquipped && (
                    <button
                      type="button"
                      onClick={() => setEquippedClassId(null)}
                      className="text-[10px] text-zinc-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      Restaurar Automático
                    </button>
                  )}
                </div>

                {/* Lore / História Cômica */}
                <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/90 p-3.5 text-xs text-zinc-300 leading-relaxed italic relative">
                  <span className="text-amber-400 font-serif text-lg leading-none mr-1">“</span>
                  {activeDisplayClass.lore}
                  <span className="text-amber-400 font-serif text-lg leading-none ml-1">”</span>
                </div>

                {/* Destaques: Filme Favorito / Arma Relíquia + Habilidade Passiva */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-3 flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                      🎬 Filme Favorito / Relíquia:
                    </span>
                    <span className="text-xs font-bold text-white line-clamp-2">
                      {activeDisplayClass.favoriteMovie}
                    </span>
                  </div>

                  <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-3 flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
                      ✨ Habilidade Passiva:
                    </span>
                    <span className="text-xs text-zinc-300 line-clamp-2">
                      {activeDisplayClass.passiveSkill}
                    </span>
                  </div>
                </div>

                {/* Próximo Nível de Evolução de Classe */}
                {activeDisplayClass.nextTierName && (
                  <div className="rounded-2xl bg-purple-950/20 border border-purple-500/30 p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-zinc-400 text-[10px] uppercase font-bold block">
                          Próximo Nível de Evolução:
                        </span>
                        <span className="text-purple-200 font-black truncate">
                          {activeDisplayClass.nextTierName}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-mono">
                      <span className="text-amber-300 font-black">+{activeDisplayClass.ptsToNextTier} pts</span>
                      <span className="text-zinc-500 text-[10px] block">para evoluir</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Barra de Pontos Totais de Atributo + Acesso ao Grimório */}
              <div className="relative z-10 pt-2 border-t border-zinc-800/80 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-400 font-bold">
                    Pontos Totais de Atributo Investidos:
                  </span>
                  <span className="text-amber-300 font-black">
                    {totalStatPoints} / {activeDisplayClass.maxPossibleStats} pts ({activeDisplayClass.statsProgressPct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-purple-400 to-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${activeDisplayClass.statsProgressPct}%` }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsGrimoireOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-xs font-black uppercase tracking-wider text-amber-200 hover:text-amber-100 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md group mt-1"
                >
                  <BookOpen className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>📖 Grimório Completo das 16 Classes Cinéfilas</span>
                </button>
              </div>
            </div>

            {/* Coluna da Direita (Os 6 Atributos em Linhas com Barra de XP - 6 colunas) */}
            <div className="xl:col-span-6 rounded-3xl bg-zinc-950/90 border border-zinc-800/90 p-5 sm:p-6 flex flex-col justify-between gap-3 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    ⚔️ Ficha de Atributos do Personagem
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Pontuação individual baseada nos feitos reais do seu acervo
                  </p>
                </div>
                {/* Legenda de Ranks com SS+ e SS++ */}
                <div className="flex items-center gap-1 font-mono text-[9px] font-black px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex-wrap">
                  <span className="text-emerald-400" title="C: Iniciante">C</span>
                  <span>•</span>
                  <span className="text-cyan-400" title="B: Intermediário">B</span>
                  <span>•</span>
                  <span className="text-purple-400" title="A: Veterano">A</span>
                  <span>•</span>
                  <span className="text-amber-400" title="S: Lendário">S</span>
                  <span>•</span>
                  <span className="text-rose-400" title="SS: Supremo">SS</span>
                  <span>•</span>
                  <span className="text-fuchsia-300 font-extrabold" title="SS+: Cósmico">SS+</span>
                  <span>•</span>
                  <span className="text-yellow-200 font-extrabold animate-pulse" title="SS++: Mítico Supremo">SS++</span>
                </div>
              </div>

              {/* Lista dos 6 Atributos na Ordem Clássica com Mini-Barras de XP */}
              <div className="flex flex-col gap-2.5">
                {rpgAttributes.map((attr) => (
                  <div
                    key={attr.key}
                    className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-3 flex flex-col gap-1.5 hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-mono font-black px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-amber-300">
                          {attr.key}
                        </span>
                        <span className="font-black text-white flex items-center gap-1 truncate">
                          <span>{attr.icon}</span>
                          <span className="truncate">{attr.label}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-sm font-black text-white">
                          {attr.score} <span className="text-[10px] text-zinc-500 font-normal">/ 99</span>
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${attr.color}`}>
                          {attr.grade}
                        </span>
                      </div>
                    </div>

                    {/* Barra de XP do Atributo */}
                    <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${attr.barColor || 'from-amber-400 to-yellow-300'}`}
                        style={{ width: `${Math.min(100, Math.max(2, attr.score))}%` }}
                      />
                    </div>

                    <div className="text-[10px] text-zinc-400 font-mono truncate">
                      {attr.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quests Quase em 100% + Maestria por Categoria */}
          <div className="rounded-3xl bg-zinc-950/90 border border-zinc-800/90 p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                  🎯 Quests Ativas Quase em 100% & Domínio de Categorias
                </span>
                <span className="text-[10px] font-mono text-emerald-300">Próximos Drops de XP</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Coluna Esquerda: Quests Quase em 100% */}
                <div className="lg:col-span-6 flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    🏆 Missões a um passo de completar:
                  </span>
                  {trophyInsights.almostThereQuests.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {trophyInsights.almostThereQuests.slice(0, 3).map((q) => {
                        const tierKey = String(q.tier || 'bronze').toLowerCase();
                        const xpReward = TROPHY_XP_BY_TIER[tierKey] || 15;
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setInspectingTrophy(q)}
                            className="rounded-xl bg-zinc-900/80 hover:bg-zinc-800/95 border border-zinc-800 hover:border-amber-400/60 px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-all text-left group shadow-sm hover:shadow-amber-500/10"
                            title="Clique para inspecionar os requisitos e checklist deste troféu"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-black text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5 truncate">
                                <span>{q.icon || '🏅'}</span>
                                <span className="truncate">{q.cleanTitle}</span>
                                <Search className="w-3 h-3 text-zinc-500 group-hover:text-amber-400 shrink-0 ml-0.5 transition-colors" />
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-zinc-950 mt-1.5 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full"
                                  style={{ width: `${q.pct}%` }}
                                />
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-xs font-mono font-black text-cyan-300">
                                {q.currentVal}/{q.targetVal} ({q.pct}%)
                              </div>
                              <div className="text-[10px] font-mono font-bold text-amber-300">
                                +{xpReward} XP
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 italic py-2">
                      Continue cadastrando filmes para revelar missões próximas de 100%!
                    </div>
                  )}
                </div>

                {/* Coluna Direita: Domínio de Categorias e Vitrine de Raros */}
                <div className="lg:col-span-6 flex flex-col gap-3">
                  {/* Barras Compactas de Maestria nas Categorias de Troféus */}
                  {trophyInsights.categoryMastery.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        📊 Maestria por Categoria:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {trophyInsights.categoryMastery.slice(0, 6).map((cat) => (
                          <div
                            key={cat.key}
                            className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 px-2.5 py-1.5 flex flex-col gap-1"
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-black text-zinc-200 truncate">
                                {cat.icon} {cat.label}
                              </span>
                              <span className="font-mono font-bold text-amber-300">{cat.pct}%</span>
                            </div>
                            <div className="w-full h-1 rounded-full bg-zinc-950 overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${cat.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vitrine Rápida: Troféus Mais Raros Desbloqueados */}
                  {trophyInsights.rarestUnlocked.length > 0 && (
                    <div className="pt-1 flex flex-col gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-300">
                        💎 Conquistas de Maior Raridade na Sua Estante:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {trophyInsights.rarestUnlocked.slice(0, 4).map((ut) => {
                          const tKey = String(ut.tier || 'gold').toLowerCase();
                          const badgeCls =
                            TROPHY_TIER_META[tKey]?.badge ||
                            'bg-amber-500/15 border-amber-400/40 text-amber-200';
                          return (
                            <button
                              key={ut.id}
                              type="button"
                              onClick={() => setInspectingTrophy(ut)}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border truncate max-w-[230px] cursor-pointer hover:scale-105 hover:border-white transition-all text-left ${badgeCls}`}
                              title={`Clique para inspecionar checklist de "${ut.cleanTitle}"`}
                            >
                              {ut.icon || TROPHY_TIER_META[tKey]?.icon || '🏆'} {ut.cleanTitle}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botão Expansor da Árvore Completa de Patentes Nv.1–100 */}
            <button
              type="button"
              onClick={() => setShowFullRoadmap((prev) => !prev)}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/35 text-xs font-black uppercase tracking-wider text-amber-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>📜 {showFullRoadmap ? 'Ocultar' : 'Ver'} Árvore Completa das 21 Patentes (Nv. 1 ao 100)</span>
              {showFullRoadmap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Árvore Expansível das 21 Patentes */}
          {showFullRoadmap && (
            <div className="rounded-3xl bg-zinc-950 border border-amber-500/35 p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {levelRoadmap.map((r) => {
                const curLvl = activeXp?.level || 1;
                const isCurrent =
                  curLvl >= r.minLevel && (r.maxLevel === null || curLvl <= r.maxLevel);
                const isConquered = r.maxLevel !== null && curLvl > r.maxLevel;
                return (
                  <div
                    key={r.minLevel}
                    className={`rounded-2xl p-3 border flex items-start gap-2.5 ${
                      isCurrent
                        ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                        : isConquered
                        ? 'bg-emerald-950/20 border-emerald-500/35'
                        : 'bg-zinc-900/50 border-zinc-800/80 opacity-65'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCurrent ? (
                        <Flame className="w-4 h-4 text-amber-400" />
                      ) : isConquered ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-zinc-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono font-black uppercase text-zinc-400">
                        Nível {r.minLevel} {r.maxLevel ? `– ${r.maxLevel}` : '+ (Máximo)'}
                        {isCurrent && <span className="ml-1.5 text-amber-300">• ATUAL</span>}
                      </div>
                      <div className="text-xs font-black text-white leading-snug mt-0.5">
                        {r.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          ALA 2: O PANTEÃO DAS 4 NOTAS & CAMPEÃO SUPREMO UNIFICADO (0-100)
         ===================================================================== */}
      {showSection('pantheon') && (
        <section className="flex flex-col gap-6">
          {/* Painel Principal: TOP 5 SUPREMO UNIFICADO */}
          <div className="rounded-3xl border border-amber-400/40 bg-gradient-to-br from-zinc-950 via-amber-950/15 to-zinc-950 p-5 sm:p-7 shadow-2xl flex flex-col gap-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/45">
                    👑 Consenso Absoluto das 4 Escalas Normalizadas (0–100)
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {pantheon.usingStrict4
                      ? `${pantheon.strict4Count} filmes com as 4 notas completas`
                      : `${pantheon.eligibleUnifiedCount} filmes elegíveis (3+ notas)`}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {unifiedMode === 'best'
                    ? '🌟 Top 5 Melhores Filmes — Todas as 4 Notas Unidas'
                    : '💀 Top 5 Submundo — Menores Médias nas 4 Notas Unidas'}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Fórmula Oficial: <strong className="text-amber-200">(Minha Nota × 10 + IMDb × 10 + Metacritic + Rotten Tomatoes) ÷ 4</strong>
                </p>
              </div>

              {/* Toggle Olimpo vs Submundo */}
              <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 p-1 rounded-2xl self-start lg:self-center">
                <button
                  type="button"
                  onClick={() => setUnifiedMode('best')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    unifiedMode === 'best'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  👑 Top 5 Melhores
                </button>
                <button
                  type="button"
                  onClick={() => setUnifiedMode('worst')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    unifiedMode === 'worst'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  💀 Top 5 Submundo
                </button>
              </div>
            </div>

            {/* 5 Cards do Pódio Unificado */}
            {unifiedDisplayedList.length === 0 ? (
              <div className="text-center py-10 text-xs text-zinc-500 italic">
                Nenhum filme com notas suficientes nesta seleção.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                {unifiedDisplayedList.map((m, idx) => {
                  const rankMedal =
                    unifiedMode === 'best'
                      ? idx === 0
                        ? '👑 #1 CAMPEÃO'
                        : idx === 1
                        ? '🥈 #2 VICE'
                        : idx === 2
                        ? '🥉 #3 BRONZE'
                        : `#${idx + 1}`
                      : `💀 #${idx + 1}`;

                  return (
                    <div
                      key={m.movie_id || m.id}
                      className={`rounded-2xl p-4 border flex flex-col justify-between gap-3 transition-all hover:-translate-y-1 ${
                        idx === 0 && unifiedMode === 'best'
                          ? 'bg-gradient-to-b from-amber-950/45 via-zinc-900 to-zinc-950 border-amber-400/70 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                          : 'bg-zinc-900/75 border-zinc-800/90 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <PosterThumb
                          url={m.poster_url}
                          title={m.title}
                          className="w-16 h-24 rounded-xl shadow-lg"
                        />
                        <div className="min-w-0 flex-1 flex flex-col gap-1">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md w-fit ${
                              idx === 0 && unifiedMode === 'best'
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            {rankMedal}
                          </span>
                          <h3 className="text-sm font-black text-white line-clamp-2 leading-snug mt-0.5">
                            {m.title}
                          </h3>
                          <span className="text-[11px] font-mono text-zinc-400">
                            {m.release_year || '—'}
                          </span>
                        </div>
                      </div>

                      {/* Score Unificado + 4 Notas Originais */}
                      <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800/80">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                            Média Suprema
                          </span>
                          <span className="text-2xl font-black font-mono text-amber-300">
                            {m.unifiedFormatted}
                            <span className="text-xs text-zinc-500">/100</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono font-bold">
                          <div className="px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 flex justify-between">
                            <span>⭐ Minha</span>
                            <span>{m.rawUser !== null ? m.rawUser.toFixed(3) : '—'}</span>
                          </div>
                          <div className="px-2 py-1 rounded-lg bg-yellow-500/15 border border-yellow-500/30 text-yellow-200 flex justify-between">
                            <span>🟡 IMDb</span>
                            <span>{m.rawImdb !== null ? m.rawImdb.toFixed(1) : '—'}</span>
                          </div>
                          <div className="px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 flex justify-between">
                            <span>🟩 Meta</span>
                            <span>{m.rawMeta !== null ? m.rawMeta : '—'}</span>
                          </div>
                          <div className="px-2 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-200 flex justify-between">
                            <span>🍅 Rotten</span>
                            <span>{m.rawRotten !== null ? `${m.rawRotten}%` : '—'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Termômetro Comparativo dos 4 Juízes */}
            <div className="rounded-2xl bg-zinc-950/90 border border-zinc-800 p-4 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                  ⚖️ Termômetro dos 4 Juízes (Média Geral Normalizada 0–100 no Catálogo)
                </span>
                {pantheon.harshest && pantheon.mostGenerous && (
                  <span className="text-[11px] text-cyan-300 font-bold">
                    Mais Generoso: <strong>{pantheon.mostGenerous.shortLabel} ({pantheon.mostGenerous.avg100.toFixed(1)})</strong> • Mais Carrasco: <strong className="text-rose-300">{pantheon.harshest.shortLabel} ({pantheon.harshest.avg100.toFixed(1)})</strong>
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {pantheon.judges.map((j) => (
                  <div key={j.id} className="rounded-xl bg-zinc-900/70 border border-zinc-800/90 p-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-zinc-200">{j.icon} {j.label}</span>
                      <span className={`font-mono font-black ${j.textColor}`}>{j.avg100.toFixed(1)}/100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${j.barColor}`}
                        style={{ width: `${Math.min(100, j.avg100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Escala original: {j.rawDisplay} ({j.count} filmes)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* OS 4 TRONOS INDIVIDUAIS (TOP 5 DE CADA NOTA) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                key: 'user',
                title: '⭐ Top 5 Minha Nota',
                subtitle: 'Suas maiores notas pessoais (0–10.000)',
                border: 'border-amber-500/35',
                badgeBg: 'bg-amber-500/20 border-amber-400/50 text-amber-200',
                items: pantheon.top5User,
                renderScore: (m) => Number(m.rawUser).toFixed(3),
              },
              {
                key: 'imdb',
                title: '🟡 Top 5 IMDb',
                subtitle: 'A elite segundo o público mundial',
                border: 'border-yellow-500/35',
                badgeBg: 'bg-yellow-500/20 border-yellow-400/50 text-yellow-200',
                items: pantheon.top5Imdb,
                renderScore: (m) => `${Number(m.rawImdb).toFixed(1)} / 10`,
              },
              {
                key: 'meta',
                title: '🟩 Top 5 Metacritic',
                subtitle: 'A nata da crítica especializada',
                border: 'border-emerald-500/35',
                badgeBg: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200',
                items: pantheon.top5Metacritic,
                renderScore: (m) => `${m.rawMeta} / 100`,
              },
              {
                key: 'rotten',
                title: '🍅 Top 5 Rotten Tomatoes',
                subtitle: 'Maior aprovação no Tomatômetro',
                border: 'border-rose-500/35',
                badgeBg: 'bg-rose-500/20 border-rose-400/50 text-rose-200',
                items: pantheon.top5Rotten,
                renderScore: (m) => `${m.rawRotten}%`,
              },
            ].map((col) => (
              <div
                key={col.key}
                className={`rounded-3xl bg-zinc-950/90 border ${col.border} p-4 flex flex-col gap-3 shadow-xl`}
              >
                <div className="border-b border-zinc-800/80 pb-2.5">
                  <h3 className="text-sm font-black text-white">{col.title}</h3>
                  <p className="text-[11px] text-zinc-400">{col.subtitle}</p>
                </div>

                <div className="flex flex-col gap-2.5">
                  {col.items.map((m, idx) => (
                    <div
                      key={m.movie_id || m.id}
                      className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-2.5 flex items-center gap-2.5 hover:border-zinc-700 transition-all"
                    >
                      <span className="w-5 text-center font-mono text-xs font-black text-zinc-400 shrink-0">
                        #{idx + 1}
                      </span>
                      <PosterThumb url={m.poster_url} title={m.title} className="w-10 h-14 rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-white truncate">{m.title}</div>
                        <div className="text-[10px] font-mono text-zinc-400">{m.release_year || '—'}</div>
                      </div>
                      <span className={`text-xs font-mono font-black px-2 py-1 rounded-lg border shrink-0 ${col.badgeBg}`}>
                        {col.renderScore(m)}
                      </span>
                    </div>
                  ))}
                  {col.items.length === 0 && (
                    <div className="text-xs text-zinc-500 italic py-4 text-center">Sem dados</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================================
          ALA 3: MUSEU DE RELÍQUIAS, LOOT RARO & RECORDES EXTREMOS
         ===================================================================== */}
      {showSection('relics') && (
        <section className="rounded-3xl border border-purple-500/35 bg-zinc-950/90 p-5 sm:p-7 shadow-2xl flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
                💎 Inventário de Itens Lendários & Curiosidades Extremas
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Museu de Relíquias & Recordes Absolutos do Catálogo
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {extremeRecords.length} Artefatos Identificados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {extremeRecords.map((rec) => {
              const theme = RARITY_CARD_THEMES[rec.rarity] || RARITY_CARD_THEMES.rare;
              return (
                <div
                  key={rec.id}
                  className={`rounded-2xl border bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.glow} p-4 flex flex-col justify-between gap-3 transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${theme.badge}`}>
                        {rec.rarityLabel}
                      </span>
                      <span className="text-lg">{rec.icon}</span>
                    </div>

                    <div>
                      <h3 className="text-xs uppercase font-black tracking-wider text-zinc-300">
                        {rec.title}
                      </h3>
                      <p className="text-[11px] text-zinc-500">{rec.subtitle}</p>
                    </div>

                    {/* Filme Detentor */}
                    <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl p-2.5">
                      <PosterThumb
                        url={rec.movie?.poster_url}
                        title={rec.movie?.title}
                        className="w-12 h-17 rounded-lg"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-black text-white line-clamp-2 leading-tight">
                          {rec.movie?.title}
                        </div>
                        <span className={`inline-block mt-1.5 text-[11px] font-mono font-black px-2 py-0.5 rounded-md border ${theme.stat}`}>
                          {rec.statBadge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 pt-2 border-t border-zinc-800/80">
                    <div className="text-[11px] text-zinc-300 line-clamp-2">{rec.statDetail}</div>
                    {rec.runnerUp && (
                      <div className="text-[10px] font-mono text-zinc-500 truncate">
                        {rec.runnerUp}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =====================================================================
          ALA 4: MEMORY CARD — CHECKPOINTS DE CADASTRO (#1, #50, #100, #150... + ÚLTIMO)
         ===================================================================== */}
      {showSection('checkpoints') && (
        <section className="rounded-3xl border border-cyan-500/35 bg-gradient-to-br from-zinc-950 via-cyan-950/10 to-zinc-950 p-5 sm:p-7 shadow-2xl flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" /> Memory Card Oficial da Sua Campanha ({checkpoints.totalCount} Saves)
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Linha do Tempo de Checkpoints: 1º Filme, #50, #100, #150... até o Último!
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Veja exatamente quais obras marcaram o início e cada marco histórico de 50 em 50 filmes da sua coleção.
              </p>
            </div>

            {/* Seletor Ordem de Cadastro vs Ordem Assistida */}
            <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 p-1 rounded-2xl self-start lg:self-center">
              <button
                type="button"
                onClick={() => setCheckpointMode('registration')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  checkpointMode === 'registration'
                    ? 'bg-cyan-400 text-slate-950 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                💾 Ordem de Cadastro
              </button>
              <button
                type="button"
                onClick={() => setCheckpointMode('watched')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  checkpointMode === 'watched'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                📅 Ordem Assistida
              </button>
            </div>
          </div>

          {/* Grid dos Save Slots (#1, #25, #50, #100, #150... + Último + Próximo Bloqueado) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {checkpoints.slots.map((slot) => {
              const accentCls = SLOT_ACCENTS[slot.accent] || SLOT_ACCENTS.cyan;
              return (
                <div
                  key={slot.number}
                  className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-all hover:-translate-y-1 ${accentCls}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-black/50 border border-white/15">
                      {slot.badgeLabel}
                    </span>
                    <span className="text-xs font-mono font-bold opacity-80">
                      #{slot.number}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <PosterThumb
                      url={slot.movie?.poster_url}
                      title={slot.movie?.title}
                      className="w-14 h-20 rounded-xl shadow-md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-black uppercase tracking-wider opacity-75">
                        {slot.slotTitle}
                      </div>
                      <h3 className="text-sm font-black text-white line-clamp-2 leading-snug mt-0.5">
                        {slot.movie?.title}
                      </h3>
                      <div className="text-[11px] font-mono text-zinc-300 mt-1 flex items-center gap-2">
                        <span>({slot.movie?.release_year || '—'})</span>
                        {Number(slot.movie?.user_rating) > 0 && (
                          <span className="text-amber-300 font-black">
                            ⭐ {Number(slot.movie.user_rating).toFixed(3)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-zinc-300">
                    <span>Visto: {slot.seenLabel}</span>
                    {slot.formattedSavedDate && <span>Save: {slot.formattedSavedDate}</span>}
                  </div>
                </div>
              );
            })}

            {/* Card do Próximo Marco de 50 Bloqueado */}
            {checkpoints.nextCheckpoint && (
              <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-4 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">
                    🔒 SAVE #{checkpoints.nextCheckpoint.targetNumber} • FUTURO
                  </span>
                  <Lock className="w-4 h-4 text-zinc-500" />
                </div>

                <div className="my-2">
                  <div className="text-sm font-black text-zinc-200">
                    Próximo Grande Marco #{checkpoints.nextCheckpoint.targetNumber}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Faltam <strong className="text-cyan-300">{checkpoints.nextCheckpoint.remaining} filmes</strong> para desbloquear este slot no Memory Card!
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                    <span>Progresso do Bloco</span>
                    <span>{checkpoints.nextCheckpoint.progressPct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 rounded-full"
                      style={{ width: `${checkpoints.nextCheckpoint.progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Primeiras Vezes Históricas */}
          {checkpoints.specialFirsts.length > 0 && (
            <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-3">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                🏅 Primeiras Vezes Históricas na Jornada
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {checkpoints.specialFirsts.map((sf) => (
                  <div
                    key={sf.id}
                    className="rounded-2xl bg-zinc-900/75 border border-zinc-800 p-3 flex items-center gap-3"
                  >
                    <PosterThumb url={sf.movie?.poster_url} title={sf.movie?.title} className="w-11 h-16 rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-black uppercase text-amber-300 truncate">
                        {sf.icon} {sf.label}
                      </div>
                      <div className="text-xs font-black text-white truncate mt-0.5">
                        {sf.movie?.title}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 mt-0.5 truncate">
                        Slot #{sf.slotNum} • {sf.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          ALA 5: DUELO TEMPORAL — ANO QUE MAIS ASSISTI vs ANO COM MAIS GRAVAÇÕES
         ===================================================================== */}
      {showSection('years') && (
        <section className="flex flex-col gap-6">
          {/* Dois Cards de Duelo Temporal Histórico (Exclusivo da Campanha Geral) */}
          {!isYearFilterActive && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Esquerda: O Ano em que Você Mais Assistiu Filmes (year_seen) */}
              <div className="rounded-3xl border border-purple-500/40 bg-gradient-to-br from-zinc-950 via-purple-950/15 to-zinc-950 p-5 sm:p-6 shadow-xl flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
                      🍿 Recorde Pessoal de Consumo Real
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      O Ano em que Você Mais Viu Filmes
                    </h3>
                  </div>
                  {yearShowdown.championWatchedYear && (
                    <span className="text-2xl sm:text-3xl font-black font-mono px-3.5 py-1 rounded-2xl bg-purple-500/20 border border-purple-400/50 text-purple-200">
                      {yearShowdown.championWatchedYear.year}
                    </span>
                  )}
                </div>

                {yearShowdown.championWatchedYear ? (
                  <>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-3">
                        <div className="text-[10px] uppercase font-bold text-zinc-400">Filmes Vistos</div>
                        <div className="text-2xl font-black font-mono text-white mt-0.5">
                          {yearShowdown.championWatchedYear.count}
                        </div>
                        <div className="text-[10px] text-purple-300 font-mono">
                          ~{yearShowdown.championWatchedYear.avgPerMonth}/mês
                        </div>
                      </div>
                      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-3">
                        <div className="text-[10px] uppercase font-bold text-zinc-400">Horas no Ano</div>
                        <div className="text-2xl font-black font-mono text-cyan-300 mt-0.5">
                          {yearShowdown.championWatchedYear.hours}h
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">de maratona</div>
                      </div>
                      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-3">
                        <div className="text-[10px] uppercase font-bold text-zinc-400">Média Dada</div>
                        <div className="text-2xl font-black font-mono text-amber-300 mt-0.5">
                          {yearShowdown.championWatchedYear.avgRating}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">precisão</div>
                      </div>
                    </div>

                    {yearShowdown.peakMonthEver && (
                      <div className="rounded-2xl bg-purple-500/10 border border-purple-500/30 px-4 py-2.5 flex items-center justify-between text-xs">
                        <span className="text-zinc-200 font-bold">
                          🔥 Mês Mais Insano da Sua História:
                        </span>
                        <span className="font-mono font-black text-purple-200">
                          {yearShowdown.peakMonthEver.label} ({yearShowdown.peakMonthEver.count} filmes!)
                        </span>
                      </div>
                    )}

                    {/* Ranking de Todos os Anos Assistidos */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Ranking Geral de Anos Assistidos
                      </span>
                      <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
                        {yearShowdown.watchedYearsRanked.map((yrItem, i) => {
                          const maxC = yearShowdown.championWatchedYear.count || 1;
                          const wPct = Math.round((yrItem.count / maxC) * 100);
                          return (
                            <div key={yrItem.year} className="rounded-xl bg-zinc-900/65 border border-zinc-800/80 px-3 py-2 flex flex-col gap-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono font-black text-white">
                                  #{i + 1} • Temporada {yrItem.year}
                                </span>
                                <span className="font-mono text-zinc-300">
                                  <strong className="text-purple-300">{yrItem.count} filmes</strong> • {yrItem.hours}h • ⭐ {yrItem.avgRating}
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                                <div className="h-full bg-purple-400 rounded-full" style={{ width: `${wPct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-zinc-500 italic py-8 text-center">Sem registros de ano assistido.</div>
                )}
              </div>

              {/* Direita: O Ano com Mais Gravações / Lançamentos (release_year) */}
              <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-zinc-950 via-amber-950/15 to-zinc-950 p-5 sm:p-6 shadow-xl flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                      🎥 Safra Favorita da História do Cinema
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      O Ano com Mais Filmes Gravados/Lançados
                    </h3>
                  </div>
                  {yearShowdown.championReleaseYear && (
                    <span className="text-2xl sm:text-3xl font-black font-mono px-3.5 py-1 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-200">
                      {yearShowdown.championReleaseYear.year}
                    </span>
                  )}
                </div>

                {yearShowdown.championReleaseYear ? (
                  <>
                    {/* Destaque do Ano Campeão + Melhor Filme da Safra */}
                    <div className="rounded-2xl bg-zinc-900/80 border border-amber-500/30 p-3.5 flex items-center gap-3.5">
                      <PosterThumb
                        url={yearShowdown.championReleaseYear.bestMovie?.poster_url}
                        title={yearShowdown.championReleaseYear.bestMovie?.title}
                        className="w-14 h-20 rounded-xl"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-amber-300">
                          🏆 {yearShowdown.championReleaseYear.count} filmes gravados/lançados em {yearShowdown.championReleaseYear.year}!
                        </div>
                        <div className="text-[11px] text-zinc-300 mt-0.5">
                          Campeão da safra:{' '}
                          <strong className="text-white">
                            {yearShowdown.championReleaseYear.bestMovie?.title}
                          </strong>{' '}
                          (⭐ {Number(yearShowdown.championReleaseYear.bestMovie?.user_rating || 0).toFixed(3)})
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400 mt-1">
                          {yearShowdown.championReleaseYear.hours}h somadas • Média da safra: ⭐ {yearShowdown.championReleaseYear.avgRating}
                        </div>
                      </div>
                    </div>

                    {/* Top 10 Anos de Lançamento */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Top 10 Anos de Lançamento Mais Presentes ({yearShowdown.totalDistinctReleaseYears} anos distintos)
                      </span>
                      <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
                        {yearShowdown.releaseYearsRanked.map((ryItem, i) => {
                          const maxC = yearShowdown.championReleaseYear.count || 1;
                          const wPct = Math.round((ryItem.count / maxC) * 100);
                          return (
                            <div key={ryItem.year} className="rounded-xl bg-zinc-900/65 border border-zinc-800/80 px-3 py-2 flex flex-col gap-1">
                              <div className="flex items-center justify-between text-xs gap-2">
                                <span className="font-mono font-black text-white shrink-0">
                                  #{i + 1} • Safra {ryItem.year}
                                </span>
                                <span className="text-[11px] text-zinc-400 truncate">
                                  Top: {ryItem.bestMovie?.title}
                                </span>
                                <span className="font-mono font-black text-amber-300 shrink-0">
                                  {ryItem.count}x
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${wPct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-zinc-500 italic py-8 text-center">Sem anos de lançamento.</div>
                )}
              </div>
            </div>
          )}

          {/* Gráficos Temporais: Evolução Mensal + Curva de Notas & Décadas */}
          <div className="rounded-3xl bg-zinc-950/90 border border-zinc-800/90 p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Ritmo de Sessões Mês a Mês ({selectedYear})
              </span>
              {selectedYear === 'Geral' && (
                <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-[10px] font-black uppercase">
                  {[
                    { id: 'combined', label: 'Mesclado' },
                    { id: 'grid', label: 'Grade Anual' },
                    { id: 'table', label: 'Planilha' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCompareMode(m.id)}
                      className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                        compareMode === m.id
                          ? 'bg-purple-500/25 text-purple-300 border border-purple-400/40'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedYear === 'Geral' && compareMode === 'table' ? (
              <div className="w-full overflow-x-auto border border-zinc-800 rounded-2xl bg-zinc-900/40">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-950 border-b border-zinc-800">
                      <th className="p-2.5 text-zinc-400 font-black uppercase">Mês</th>
                      {availableYears.map((yr) => (
                        <th key={yr} className="p-2.5 text-zinc-200 font-mono font-black text-center">{yr}</th>
                      ))}
                      <th className="p-2.5 text-amber-300 font-black uppercase text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MONTH_NAMES.map((mName, mIdx) => {
                      let rTotal = 0;
                      return (
                        <tr key={mName} className="border-b border-zinc-800/50 hover:bg-zinc-900/50">
                          <td className="p-2.5 font-bold text-zinc-200">{mName}</td>
                          {availableYears.map((yr) => {
                            const c = monthlyComparisonData[mIdx]?.[yr] || 0;
                            rTotal += c;
                            return (
                              <td key={yr} className="p-2.5 text-center font-mono text-zinc-300">
                                {c > 0 ? c : '—'}
                              </td>
                            );
                          })}
                          <td className="p-2.5 text-center font-mono font-black text-amber-300">{rTotal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : selectedYear === 'Geral' && compareMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableYears.map((yr, idx) => {
                  const colors = ['#22d3ee', '#d946ef', '#f59e0b', '#10b981', '#f43f5e', '#3b82f6'];
                  const color = colors[idx % colors.length];
                  const yrData = MONTH_NAMES.map((mName, mIdx) => ({
                    name: mName,
                    quantidade: monthlyComparisonData[mIdx]?.[yr] || 0,
                  }));
                  const yrSum = yrData.reduce((a, b) => a + b.quantidade, 0);
                  return (
                    <div key={yr} className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-3.5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black text-white font-mono">Ano {yr}</span>
                        <span className="text-[10px] font-mono font-bold text-cyan-300">{yrSum} filmes</span>
                      </div>
                      <div className="h-28 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={yrData} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                            <XAxis dataKey="name" stroke="#3f3f46" tickLine={false} tick={{ fill: '#71717a', fontSize: 9 }} />
                            <YAxis stroke="#3f3f46" tickLine={false} tick={{ fill: '#71717a', fontSize: 9 }} />
                            <Area type="monotone" dataKey="quantidade" stroke={color} strokeWidth={2} fill={color} fillOpacity={0.12} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {selectedYear === 'Geral' ? (
                    <AreaChart data={monthlyComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#52525b" tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 'bold' }} />
                      <YAxis stroke="#52525b" tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px' }}
                      />
                      {availableYears.map((yr, idx) => {
                        const colors = ['#22d3ee', '#d946ef', '#f59e0b', '#10b981', '#f43f5e', '#3b82f6'];
                        const c = colors[idx % colors.length];
                        return (
                          <Area key={yr} type="monotone" dataKey={yr} name={`Ano ${yr}`} stroke={c} strokeWidth={2} fill={c} fillOpacity={0.05} />
                        );
                      })}
                    </AreaChart>
                  ) : (
                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#52525b" tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 'bold' }} />
                      <YAxis stroke="#52525b" tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px' }}
                      />
                      <Area type="monotone" dataKey="quantidade" name="Filmes" stroke="#d946ef" strokeWidth={2.5} fill="#d946ef" fillOpacity={0.18} />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Curva de Notas Pessoais + Gravações por Década */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-3xl bg-zinc-950/90 border border-zinc-800/90 p-5 flex flex-col gap-4">
              <span className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                <Star className="w-4 h-4" /> Curva de Distribuição das Suas Notas
              </span>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ratingDistData} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#52525b" tickLine={false} tick={{ fill: '#e4e4e7', fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis stroke="#52525b" tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px' }} />
                    <Bar dataKey="quantidade" name="Filmes" fill="#d946ef" shape={<CanisterBar />} barSize={26} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl bg-zinc-950/90 border border-zinc-800/90 p-5 flex flex-col gap-4">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                <Calendar className="w-4 h-4" /> Volume de Obras por Década de Lançamento
              </span>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={decadesChartData} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#52525b" tickLine={false} tick={{ fill: '#e4e4e7', fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis stroke="#52525b" tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px' }} />
                    <Bar dataKey="quantidade" name="Filmes" fill="#22d3ee" shape={<CanisterBar />} barSize={26} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          ALA 6: CABO-DE-GUERRA DE ÁUDIO, TOP PAÍSES & GUILDAS DE HOLLYWOOD
         ===================================================================== */}
      {(showSection('guilds') || showSection('atlas')) && (
        <section className="flex flex-col gap-6">
          {/* Grid de 2 Colunas Amplas: Facções de Áudio + Top 10 Países */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Coluna 1: Facções de Áudio (Dublado vs Legendado) */}
            <div className="rounded-3xl bg-zinc-950/90 border border-amber-500/30 p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-xl">
              <div className="border-b border-zinc-800/80 pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  🎙️ Preferência Auditiva
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Duelo de Facções de Áudio: Dublado vs Legendado
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Comparativo de volume e afinidade crítica das suas sessões.
                </p>
              </div>

              {/* Barra de Cabo de Guerra */}
              <div className="flex flex-col gap-2">
                <div className="w-full h-5 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex p-0.5 gap-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-l-full transition-all"
                    style={{ width: `${audioFactions.dublado.pct}%` }}
                    title={`Dublado: ${audioFactions.dublado.count} filmes (${audioFactions.dublado.pct}%)`}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 rounded-r-full transition-all"
                    style={{ width: `${audioFactions.legendado.pct}%` }}
                    title={`Legendado: ${audioFactions.legendado.count} filmes (${audioFactions.legendado.pct}%)`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3.5 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-amber-300">🎙️ Dublado</span>
                      <span className="font-mono font-black text-amber-200">{audioFactions.dublado.pct}%</span>
                    </div>
                    <div className="text-2xl font-black font-mono text-white mt-0.5">
                      {audioFactions.dublado.count} <span className="text-xs font-normal text-zinc-400">filmes</span>
                    </div>
                    <div className="text-[11px] font-mono text-amber-300/90 font-bold">
                      Média pessoal: ⭐ {audioFactions.dublado.avg}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-cyan-500/10 border border-cyan-500/30 p-3.5 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-cyan-300">💬 Legendado</span>
                      <span className="font-mono font-black text-cyan-200">{audioFactions.legendado.pct}%</span>
                    </div>
                    <div className="text-2xl font-black font-mono text-white mt-0.5">
                      {audioFactions.legendado.count} <span className="text-xs font-normal text-zinc-400">filmes</span>
                    </div>
                    <div className="text-[11px] font-mono text-cyan-300/90 font-bold">
                      Média pessoal: ⭐ {audioFactions.legendado.avg}
                    </div>
                  </div>
                </div>
              </div>

              {audioFactions.outros.count > 0 && (
                <span className="text-[11px] text-zinc-500 font-mono text-center">
                  {audioFactions.outros.count} filme(s) sem classificação de áudio ou mudos ({audioFactions.outros.pct}%).
                </span>
              )}
            </div>

            {/* Coluna 2: Top 10 Países Mais Assistidos */}
            <div className="rounded-3xl bg-zinc-950/90 border border-zinc-800/90 p-5 sm:p-6 flex flex-col justify-between gap-3 shadow-xl">
              <div className="border-b border-zinc-800/80 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
                    🌍 Geografia Cinematográfica
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    Top 10 Países Mais Assistidos
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-zinc-400 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800">
                  {Object.keys(countryCounts).length} territórios
                </span>
              </div>

              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {topCountriesList.map((c, idx) => {
                  const maxCountryCount = topCountriesList[0]?.count || 1;
                  const pct = Math.round((c.count / maxCountryCount) * 100);
                  return (
                    <div
                      key={c.name}
                      className="rounded-xl bg-zinc-900/70 border border-zinc-800/80 px-3.5 py-2 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-zinc-500 font-bold w-5">#{idx + 1}</span>
                          {c.iso ? (
                            <img
                              src={`https://flagcdn.com/w40/${c.iso}.png`}
                              alt={c.name}
                              className="w-5 h-3.5 object-cover rounded border border-zinc-700 shrink-0"
                            />
                          ) : (
                            <span>🏳️</span>
                          )}
                          <span className="font-bold text-zinc-100 truncate">{c.name}</span>
                        </div>
                        <span className="font-mono font-black text-cyan-300 shrink-0">
                          {c.count}x
                        </span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-zinc-950 overflow-hidden">
                        <div className="h-full bg-cyan-400/80 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SALÃO DAS 6 GUILDAS DE HOLLYWOOD (CONTAGEM + NOTA MÉDIA!) */}
          <div className="rounded-3xl bg-zinc-950/90 border border-zinc-800/90 p-5 sm:p-7 flex flex-col gap-5">
            <div className="border-b border-zinc-800/80 pb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                🕴️ Hall da Fama & Afinidade Crítica
              </span>
              <h2 className="text-xl font-black text-white mt-0.5">
                Guildas Dominantes: Diretores, Roteiristas, Estúdios, Distribuidoras, Tags & Plataformas
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[
                { key: 'directors', title: '🎬 Top 10 Diretores', accent: 'text-amber-300', list: guilds.directors },
                { key: 'writers', title: '✍️ Top 10 Roteiristas', accent: 'text-cyan-300', list: guilds.writers },
                { key: 'studios', title: '🏢 Top 10 Estúdios', accent: 'text-purple-300', list: guilds.studios },
                { key: 'distributors', title: '📦 Top 10 Distribuidoras', accent: 'text-emerald-300', list: guilds.distributors },
                { key: 'tags', title: '🏷️ Top 10 Minhas Tags', accent: 'text-rose-300', list: guilds.tags },
                { key: 'platforms', title: '📺 Top 10 Plataformas / Mídias', accent: 'text-sky-300', list: guilds.platforms },
              ].map((gBox) => (
                <div key={gBox.key} className="rounded-2xl bg-zinc-900/55 border border-zinc-800 p-4 flex flex-col gap-3">
                  <span className={`text-xs font-black uppercase tracking-wider border-b border-zinc-800 pb-2 ${gBox.accent}`}>
                    {gBox.title}
                  </span>
                  <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
                    {gBox.list.map((item, idx) => (
                      <div
                        key={item.name}
                        className="rounded-xl bg-zinc-950/80 border border-zinc-800/80 px-3 py-2 flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="font-bold text-zinc-200 truncate">
                          <span className="font-mono text-zinc-500 mr-1.5">{idx + 1}.</span>
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2 shrink-0 font-mono">
                          <span className="text-[10px] text-amber-300 font-bold">
                            ⭐ {item.avgFormatted}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-white font-black text-[11px]">
                            {item.count}x
                          </span>
                        </div>
                      </div>
                    ))}
                    {gBox.list.length === 0 && (
                      <span className="text-xs text-zinc-500 italic py-3 text-center">Sem dados</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Modal de Detalhes / Checklist do Troféu */}
      {inspectingTrophy && (
        <TrophyChecklistModal
          trophy={inspectingTrophy}
          onClose={() => setInspectingTrophy(null)}
        />
      )}

      {/* MODAL DA TRILHA DE CLASSES CINÉFILAS */}
      {isGrimoireOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Topo do Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl">
                  📖
                </div>
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    Trilha das 16 Classes Cinéfilas
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Desbloqueie novas classes acumulando pontos de atributo na sua jornada. Você pode equipar qualquer classe já conquistada!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGrimoireOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de Busca & Status de Equipamento */}
            <div className="px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={grimoireSearch}
                  onChange={(e) => setGrimoireSearch(e.target.value)}
                  placeholder="Buscar por classe, filme ou passiva..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs">
                {equippedClassId && (
                  <button
                    type="button"
                    onClick={() => setEquippedClassId(null)}
                    className="font-black text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Restaurar Mais Alta Desbloqueada
                  </button>
                )}
                <span className="font-mono text-zinc-400">
                  <strong className="text-amber-300">{characterClass.unlockedClassesCount || 11}</strong> / {characterClass.totalClassesCount || 16} Desbloqueadas
                </span>
              </div>
            </div>

            {/* Conteúdo do Grimório (Grid das 16 Classes em Ordem de Desbloqueio) */}
            <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {(characterClass.allClasses || [])
                .filter((cls) => {
                  if (!grimoireSearch) return true;
                  const q = grimoireSearch.toLowerCase();
                  return (
                    cls.className.toLowerCase().includes(q) ||
                    cls.titleFlavor.toLowerCase().includes(q) ||
                    cls.lore.toLowerCase().includes(q) ||
                    cls.favoriteMovie.toLowerCase().includes(q) ||
                    cls.passiveSkill.toLowerCase().includes(q)
                  );
                })
                .map((cls) => {
                  const isEquipped = activeDisplayClass.id === cls.id;
                  const isUnlocked = cls.isUnlocked;

                  return (
                    <div
                      key={cls.id}
                      className={`rounded-2xl p-4 border flex flex-col justify-between gap-3 transition-all ${
                        !isUnlocked
                          ? 'bg-zinc-950/40 border-zinc-800/40 opacity-55 border-dashed'
                          : isEquipped
                          ? 'bg-amber-500/10 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                          : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`text-2xl p-2 rounded-xl bg-zinc-950 border ${isUnlocked ? 'border-zinc-800' : 'border-zinc-800/60 grayscale'}`}>
                              {cls.classIcon}
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-sm font-black text-white leading-tight truncate">
                                {cls.className}
                              </h4>
                              <p className="text-[11px] font-bold text-amber-300/90 truncate mt-0.5">
                                {cls.titleFlavor}
                              </p>
                            </div>
                          </div>

                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                            isUnlocked
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}>
                            {isUnlocked ? `✅ Desbloqueada (${cls.unlockPts} pts)` : `🔒 Requer ${cls.unlockPts} pts`}
                          </span>
                        </div>

                        {/* Lore sem cortes */}
                        <p className="text-xs text-zinc-300 italic bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/60 leading-relaxed">
                          “{cls.lore}”
                        </p>

                        {/* Destaques sem cortes */}
                        <div className="text-[11px] flex flex-col gap-2 text-zinc-300">
                          <div className="rounded-xl bg-zinc-950/40 p-2.5 border border-zinc-800/40 flex flex-col gap-0.5">
                            <span className="text-[10px] font-black uppercase text-amber-400">🎬 Filme Favorito / Relíquia:</span>
                            <span className="text-zinc-100 font-medium leading-relaxed">{cls.favoriteMovie}</span>
                          </div>
                          <div className="rounded-xl bg-zinc-950/40 p-2.5 border border-zinc-800/40 flex flex-col gap-0.5">
                            <span className="text-[10px] font-black uppercase text-cyan-300">✨ Habilidade Passiva:</span>
                            <span className="text-zinc-200 leading-relaxed">{cls.passiveSkill}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-zinc-400">
                          {isUnlocked ? (
                            isEquipped ? '👑 Atualmente Equipada' : 'Desbloqueada para uso'
                          ) : (
                            <span className="text-amber-400/90 font-bold">Faltam {cls.ptsRemaining} pts de atributo</span>
                          )}
                        </span>

                        {isUnlocked ? (
                          <button
                            type="button"
                            onClick={() => {
                              setEquippedClassId(cls.id);
                              setIsGrimoireOpen(false);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
                              isEquipped
                                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                            }`}
                          >
                            {isEquipped ? 'Equipada' : 'Equipar Classe'}
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 flex items-center gap-1 cursor-not-allowed">
                            <Lock className="w-3 h-3" /> Bloqueada
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EXPLICAÇÃO DAS FÓRMULAS DE ATRIBUTO (?) */}
      {showAttributeHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-zinc-950 border border-amber-500/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Topo do Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl font-black text-amber-300">
                  ?
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    Como Ganhar Cada Ponto de Atributo?
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Regras e métricas oficiais que calculam sua pontuação (0 a 99 em cada atributo)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAttributeHelp(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Explicativo das 6 Fórmulas */}
            <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* AGI */}
                <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                      <span>⚡</span> AGI • Vigor de Tela (Agilidade)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300">
                      Máx 99 pts
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Mede a sua resistência física e fôlego de maratona de cinema.
                  </p>
                  <div className="rounded-xl bg-zinc-950/80 p-2.5 border border-zinc-800/80 text-[11px] font-mono flex flex-col gap-1 text-zinc-300">
                    <div>• <strong>+1 pt</strong> a cada <strong>8 horas</strong> de filmes assistidos (até 75 pts)</div>
                    <div>• <strong>+0.8 pt</strong> por cada filme épico com <strong>&ge; 140 min</strong> (até 24 pts)</div>
                  </div>
                </div>

                {/* INT */}
                <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                      <span>🧠</span> INT • Sabedoria Temporal (Inteligência)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300">
                      Máx 99 pts
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Mede o seu alcance cronológico e conhecimento das eras da história.
                  </p>
                  <div className="rounded-xl bg-zinc-950/80 p-2.5 border border-zinc-800/80 text-[11px] font-mono flex flex-col gap-1 text-zinc-300">
                    <div>• <strong>+0.78 pt</strong> por cada ano preenchido na <strong>Máquina do Tempo</strong> (1918–2026, até 85 pts)</div>
                    <div>• <strong>+0.5 pt</strong> por cada filme lançado <strong>antes de 2000</strong> (até 14 pts)</div>
                  </div>
                </div>

                {/* DES */}
                <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                      <span>🌍</span> DES • Diplomacia Global (Destreza)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300">
                      Máx 99 pts
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Mede a sua leitura rápida de legendas e fuga do cinema tradicional.
                  </p>
                  <div className="rounded-xl bg-zinc-950/80 p-2.5 border border-zinc-800/80 text-[11px] font-mono flex flex-col gap-1 text-zinc-300">
                    <div>• <strong>+1.23 pt</strong> para cada país catalogado no <strong>Desafio das 195 Nações da ONU</strong></div>
                    <div>• Meta de 80 nações diferentes para atingir o teto de 99 pontos</div>
                  </div>
                </div>

                {/* SOR */}
                <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                      <span>🎯</span> SOR • Olhar Clínico (Sorte / Precisão)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300">
                      Máx 99 pts
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Mede o volume do seu acervo e capacidade de garimpar obras.
                  </p>
                  <div className="rounded-xl bg-zinc-950/80 p-2.5 border border-zinc-800/80 text-[11px] font-mono flex flex-col gap-1 text-zinc-300">
                    <div>• Base inicial garantida de <strong>34 pontos</strong></div>
                    <div>• <strong>+0.21 pt</strong> para cada filme novo catalogado (meta de 300 filmes para atingir 99 pts)</div>
                  </div>
                </div>

                {/* VIT */}
                <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                      <span>🛡️</span> VIT • Caça-Troféus PS5 (Vitalidade)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300">
                      Máx 99 pts
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Mede a sua taxa de conclusão e perseverança em busca de platinas.
                  </p>
                  <div className="rounded-xl bg-zinc-950/80 p-2.5 border border-zinc-800/80 text-[11px] font-mono flex flex-col gap-1 text-zinc-300">
                    <div>• Pontuação calculada proporcionalmente ao total de troféus desbloqueados</div>
                    <div>• Conquistar 82% dos troféus disponíveis do sistema garante os 99 pontos</div>
                  </div>
                </div>

                {/* FOR */}
                <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-yellow-300 flex items-center gap-1.5">
                      <span>👑</span> FOR • Prestígio Áureo (Força)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300">
                      Máx 99 pts
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Mede o impacto e aclamação solene das obras-primas da sua coleção.
                  </p>
                  <div className="rounded-xl bg-zinc-950/80 p-2.5 border border-zinc-800/80 text-[11px] font-mono flex flex-col gap-1 text-zinc-300">
                    <div>• <strong>+0.7 pt</strong> por vitória de Oscar / <strong>+0.35 pt</strong> por indicação (até 60 pts)</div>
                    <div>• <strong>+0.7 pt</strong> para cada obra avaliada com sua <strong>nota pessoal &ge; 9.000</strong> (até 39 pts)</div>
                  </div>
                </div>
              </div>

              {/* Box de Resumo da Progressão */}
              <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-cyan-500/15 border border-amber-500/35 p-4 text-xs text-zinc-200 leading-relaxed">
                <span className="font-black text-amber-300 uppercase tracking-wider block mb-1">
                  🌟 O que a soma total de pontos desbloqueia?
                </span>
                A soma dos seus 6 atributos (máximo de 594 pontos) eleva seus <strong>7 Graus de Evolução de Classe</strong> (Aprendiz &rarr; Aventureiro &rarr; Veterano &rarr; Transclasse &rarr; 3ª Evolução &rarr; Hiperclasse &rarr; Entidade Cósmica) e destrava progressivamente todas as <strong>16 Classes Cinéfilas</strong> na sua Trilha!
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/40 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAttributeHelp(false)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer transition-all"
              >
                Entendido!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
