import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  Clock,
  Sparkles,
  Star,
  Search,
  Lock,
  Pin,
  Crown,
  CheckCircle2,
  X,
  Film,
  Award,
  Plus,
  RotateCcw,
  ArrowUpDown,
  FlaskConical,
  Zap,
  Calendar,
  TrendingUp,
  Layers,
  LayoutGrid,
} from 'lucide-react';
import {
  MIN_TIME_MACHINE_YEAR,
  getDecadeCompletionXp,
  TIME_MACHINE_XP_BY_RARITY,
  TIME_MACHINE_RARITY_META,
  DECADE_META,
  getMaxTimeMachineYear,
  getYearRarityTier,
  getDecadeKeyForYear,
  compareTimeMachineCandidates,
} from '../utils/xpSystem';
import TrophyTestPanelModal from './TrophyTestPanelModal';

const API_BASE_URL = 'http://localhost:5000/api';
const LOCAL_STORAGE_KEY = 'cine_time_machine_offline_v1';

const RARITY_KEYS_DESC = ['mythic', 'legendary', 'epic', 'rare', 'common'];

const resolvePosterUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
  return url;
};

function getChrononautRank(conqueredYears) {
  if (conqueredYears >= 100) {
    return {
      level: 6,
      title: 'Entidade Atemporal do Século',
      badgeClass: 'text-rose-200 border-rose-400/65 bg-rose-500/20',
    };
  }
  if (conqueredYears >= 75) {
    return {
      level: 5,
      title: 'Senhor do Tempo Cinematográfico',
      badgeClass: 'text-amber-200 border-amber-400/60 bg-amber-500/20',
    };
  }
  if (conqueredYears >= 50) {
    return {
      level: 4,
      title: 'Mestre do Capacitor de Fluxo',
      badgeClass: 'text-purple-200 border-purple-400/55 bg-purple-500/20',
    };
  }
  if (conqueredYears >= 30) {
    return {
      level: 3,
      title: 'Guardião das Décadas',
      badgeClass: 'text-cyan-200 border-cyan-400/55 bg-cyan-500/20',
    };
  }
  if (conqueredYears >= 12) {
    return {
      level: 2,
      title: 'Piloto de DeLorean',
      badgeClass: 'text-emerald-200 border-emerald-400/50 bg-emerald-500/15',
    };
  }
  return {
    level: 1,
    title: 'Turista Temporal',
    badgeClass: 'text-zinc-300 border-zinc-700 bg-zinc-900',
  };
}

function loadLocalTimeMachineState() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{"picks":{},"wishlists":{}}');
  } catch {
    return { picks: {}, wishlists: {} };
  }
}

function saveLocalTimeMachineState(state) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Fallback local idêntico ao backend caso o servidor esteja offline
 */
function buildOfflineTimeMachinePayload(movies = [], localState = {}) {
  const manualPicks = localState.picks || {};
  const maxYear = getMaxTimeMachineYear();

  const uniqueMap = new Map();
  (movies || []).forEach((m) => {
    const mid = Number(m.movie_id || m.id);
    if (!mid) return;
    if (!uniqueMap.has(mid)) {
      uniqueMap.set(mid, { ...m, movie_id: mid });
    }
  });

  const catalogMovies = Array.from(uniqueMap.values());
  const moviesByYear = new Map();

  catalogMovies.forEach((m) => {
    const y = Number(m.release_year);
    if (!Number.isFinite(y) || y < 1888 || y > maxYear + 2) return;
    if (!moviesByYear.has(y)) moviesByYear.set(y, []);
    moviesByYear.get(y).push(m);
  });

  const allYearsSet = new Set();
  for (let y = maxYear; y >= MIN_TIME_MACHINE_YEAR; y--) {
    allYearsSet.add(y);
  }
  for (const y of moviesByYear.keys()) allYearsSet.add(y);

  const sortedYearsDesc = Array.from(allYearsSet).sort((a, b) => b - a);
  const yearsEntries = [];

  const rarityTotals = { common: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 };
  sortedYearsDesc.forEach((y) => {
    const r = getYearRarityTier(y);
    if (y >= MIN_TIME_MACHINE_YEAR && y <= maxYear) {
      rarityTotals[r] += 1;
    } else if (moviesByYear.has(y)) {
      rarityTotals[r] += 1;
    }
  });

  const byRarity = {
    common: { ...TIME_MACHINE_RARITY_META.common, count: 0, total: rarityTotals.common, totalXp: 0 },
    rare: { ...TIME_MACHINE_RARITY_META.rare, count: 0, total: rarityTotals.rare, totalXp: 0 },
    epic: { ...TIME_MACHINE_RARITY_META.epic, count: 0, total: rarityTotals.epic, totalXp: 0 },
    legendary: { ...TIME_MACHINE_RARITY_META.legendary, count: 0, total: rarityTotals.legendary, totalXp: 0 },
    mythic: { ...TIME_MACHINE_RARITY_META.mythic, count: 0, total: rarityTotals.mythic, totalXp: 0 },
  };

  let yearsXp = 0;

  sortedYearsDesc.forEach((year) => {
    const sortedCandidates = [...(moviesByYear.get(year) || [])].sort(compareTimeMachineCandidates);
    const autoBestMovie = sortedCandidates[0] || null;
    let champion = null;
    let selectionMode = null;

    if (sortedCandidates.length > 0) {
      const manualId = manualPicks[year] ? Number(manualPicks[year]) : null;
      const manualFound = manualId
        ? sortedCandidates.find((c) => Number(c.movie_id) === manualId) || null
        : null;
      if (manualFound) {
        champion = manualFound;
        selectionMode = 'manual';
      } else {
        champion = autoBestMovie;
        selectionMode = 'auto';
      }
    }

    const rarityTier = getYearRarityTier(year);
    const xpReward = TIME_MACHINE_XP_BY_RARITY[rarityTier] || 20;

    if (champion) {
      byRarity[rarityTier].count += 1;
      byRarity[rarityTier].totalXp += xpReward;
      yearsXp += xpReward;
    }

    yearsEntries.push({
      year,
      decadeKey: getDecadeKeyForYear(year),
      rarityTier,
      xpReward,
      status: champion ? 'conquered' : 'locked',
      moviesCount: sortedCandidates.length,
      selectionMode,
      champion,
      autoBestMovie,
      candidates: sortedCandidates,
    });
  });

  const decadesMap = new Map();
  yearsEntries.forEach((entry) => {
    if (!decadesMap.has(entry.decadeKey)) decadesMap.set(entry.decadeKey, []);
    decadesMap.get(entry.decadeKey).push(entry);
  });

  const orderedDecadeKeys = Array.from(decadesMap.keys()).sort((a, b) => {
    const startA = DECADE_META[a]?.decadeStart ?? (parseInt(a, 10) || 0);
    const startB = DECADE_META[b]?.decadeStart ?? (parseInt(b, 10) || 0);
    return startB - startA;
  });

  let completedDecadesCount = 0;
  let decadesXp = 0;

  const decades = orderedDecadeKeys.map((decKey) => {
    const decYears = (decadesMap.get(decKey) || []).sort((a, b) => b.year - a.year);
    const meta = DECADE_META[decKey] || {
      id: decKey,
      decadeStart: parseInt(decKey, 10) || 1900,
      label: `Anos ${decKey.replace('s', '')}`,
      subtitle: 'Arquivo Histórico Cinematográfico',
      badgeIcon: '🕰️',
    };
    const conqueredCount = decYears.filter((y) => y.status === 'conquered').length;
    const isStandardDecade = decKey !== 'pioneers';
    let isRelicUnlocked = false;

    if (isStandardDecade && decYears.length >= 10) {
      let fullTen = true;
      for (let y = meta.decadeStart; y <= meta.decadeStart + 9; y++) {
        const found = decYears.find((item) => item.year === y);
        if (!found || found.status !== 'conquered') {
          fullTen = false;
          break;
        }
      }
      const relicXp = isStandardDecade ? getDecadeCompletionXp(decKey) : 0;
      isRelicUnlocked = fullTen;
      if (isRelicUnlocked) {
        completedDecadesCount += 1;
        decadesXp += relicXp;
      }
    }

    return {
      id: decKey,
      decadeStart: meta.decadeStart,
      label: meta.label,
      subtitle: meta.subtitle,
      badgeIcon: meta.badgeIcon,
      conqueredCount,
      availableYearsCount: decYears.length,
      relicTargetCount: isStandardDecade ? 10 : decYears.length,
      isRelicUnlocked,
      relicXp: isStandardDecade ? getDecadeCompletionXp(decKey) : 0,
      years: decYears,
    };
  });

  const officialYears = yearsEntries.filter(
    (y) => y.year >= MIN_TIME_MACHINE_YEAR && y.year <= maxYear
  );
  const officialConqueredCount = officialYears.filter((y) => y.status === 'conquered').length;
  const totalConqueredYears = yearsEntries.filter((y) => y.status === 'conquered').length;
  const conqueredSorted = yearsEntries.filter((y) => y.status === 'conquered');

  return {
    stats: {
      minOfficialYear: MIN_TIME_MACHINE_YEAR,
      maxOfficialYear: maxYear,
      totalOfficialYears: officialYears.length,
      officialConqueredCount,
      totalConqueredYears,
      remainingOfficialYears: Math.max(0, officialYears.length - officialConqueredCount),
      percentage:
        officialYears.length > 0
          ? Number(((officialConqueredCount / officialYears.length) * 100).toFixed(1))
          : 0,
      completedDecadesCount,
      totalClosedDecades: Math.floor((maxYear - MIN_TIME_MACHINE_YEAR + 1) / 10),
      multiMovieYearsCount: yearsEntries.filter((y) => y.moviesCount >= 2).length,
      manualOverridesCount: yearsEntries.filter((y) => y.selectionMode === 'manual').length,
      oldestMovieYear: conqueredSorted.slice(-1)[0]?.year || null,
      newestMovieYear: conqueredSorted[0]?.year || null,
      yearsXp,
      decadesXp,
      totalXp: yearsXp + decadesXp,
      byRarity,
    },
    decades,
    years: yearsEntries,
  };
}

const normalizeStr = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export default function TimeMachinePage({
  movies = [],
  navbarSearchQuery = '',
  onOpenAddMovieForYear,
}) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingAction, setSavingAction] = useState(false);

  // Filtros e ordenação
  const [searchTerm, setSearchTerm] = useState(navbarSearchQuery || '');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'conquered' | 'locked' | 'disputed' | 'manual'
  const [rarityFilter, setRarityFilter] = useState('all'); // 'all' | 'mythic' | 'legendary' | 'epic' | 'rare' | 'common'
  const [decadeFilter, setDecadeFilter] = useState('all'); // 'all' | '2020s' | ...
  const [chronoOrder, setChronoOrder] = useState('desc'); // 'desc' (Recentes->Antigos) | 'asc' (1920->Hoje)

  // Densidade / Colunas por linha (5, 7 ou 10)
  const [colsPerRow, setColsPerRow] = useState(() => {
    try {
      const saved = Number(localStorage.getItem('cine_time_machine_cols'));
      return [5, 7, 10].includes(saved) ? saved : 7;
    } catch {
      return 7;
    }
  });

  const handleColsChange = (num) => {
    setColsPerRow(num);
    try {
      localStorage.setItem('cine_time_machine_cols', String(num));
    } catch {
      // ignore
    }
  };

  // Sincroniza busca global da Navbar quando digitada
  useEffect(() => {
    if (navbarSearchQuery !== undefined) {
      setSearchTerm(navbarSearchQuery);
    }
  }, [navbarSearchQuery]);

  // Modal de inspeção do ano & troca manual do Campeão
  const [selectedYearNumber, setSelectedYearNumber] = useState(null);

  // Modal de Testes & Homologação
  const [isTestPanelOpen, setIsTestPanelOpen] = useState(false);
  const [trophiesForTestPanel, setTrophiesForTestPanel] = useState([]);

  const fetchTimeMachine = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/challenge/time-machine`);
      if (res.data?.success && res.data?.data) {
        setPayload(res.data.data);
        setLoading(false);
        return;
      }
    } catch {
      // fallback offline
    }
    const localState = loadLocalTimeMachineState();
    setPayload(buildOfflineTimeMachinePayload(movies, localState));
    setLoading(false);
  }, [movies]);

  useEffect(() => {
    fetchTimeMachine();
  }, [fetchTimeMachine]);

  const openTestPanel = async () => {
    if (trophiesForTestPanel.length === 0) {
      try {
        const res = await axios.get(`${API_BASE_URL}/trophies`);
        if (res.data?.success && res.data?.data?.trophies) {
          setTrophiesForTestPanel(res.data.data.trophies);
        }
      } catch {
        // ignore
      }
    }
    setIsTestPanelOpen(true);
  };

  // Mantém o ano selecionado sempre sincronizado com o payload mais recente
  const selectedYearEntry = useMemo(() => {
    if (!selectedYearNumber || !payload?.years) return null;
    return payload.years.find((y) => y.year === selectedYearNumber) || null;
  }, [selectedYearNumber, payload]);

  // Trocar manualmente o Campeão do Ano (ou voltar para Automático se movieId = null)
  const handleSelectChampion = async (year, movieId) => {
    setSavingAction(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/challenge/time-machine/pick/${year}`, {
        movieId,
      });
      if (res.data?.success && res.data?.data) {
        setPayload(res.data.data);
      }
      // Sincroniza espelho offline
      const local = loadLocalTimeMachineState();
      if (movieId === null) {
        delete local.picks[year];
      } else {
        local.picks[year] = movieId;
      }
      saveLocalTimeMachineState(local);
    } catch {
      const local = loadLocalTimeMachineState();
      if (movieId === null) {
        delete local.picks[year];
      } else {
        local.picks[year] = movieId;
      }
      saveLocalTimeMachineState(local);
      setPayload(buildOfflineTimeMachinePayload(movies, local));
    } finally {
      setSavingAction(false);
    }
  };

  // Filtragem inteligente das décadas e anos
  const filteredDecades = useMemo(() => {
    if (!payload?.decades) return [];
    const rawQ = (searchTerm || navbarSearchQuery || '').trim();
    const q = rawQ.toLowerCase();
    const normQ = normalizeStr(rawQ);

    // Quando o usuário digita uma busca (ex: 1994), pesquisa em TODAS as décadas
    const effectiveDecadeFilter = q ? 'all' : decadeFilter;

    const baseDecades =
      chronoOrder === 'asc' ? [...payload.decades].reverse() : [...payload.decades];

    return baseDecades
      .filter((dec) => effectiveDecadeFilter === 'all' || dec.id === effectiveDecadeFilter)
      .map((dec) => {
        const orderedYears =
          chronoOrder === 'asc' ? [...dec.years].reverse() : [...dec.years];

        const matchingYears = orderedYears.filter((yEntry) => {
          if (statusFilter === 'conquered' && yEntry.status !== 'conquered') return false;
          if (statusFilter === 'locked' && yEntry.status !== 'locked') return false;
          if (statusFilter === 'disputed' && yEntry.moviesCount < 2) return false;
          if (statusFilter === 'manual' && yEntry.selectionMode !== 'manual') return false;
          if (rarityFilter !== 'all' && yEntry.rarityTier !== rarityFilter) return false;

          if (normQ) {
            const matchYear = String(yEntry.year).includes(normQ);
            const matchCandidates = (yEntry.candidates || []).some((m) => {
              const t1 = normalizeStr(m.title);
              const t2 = normalizeStr(m.original_title);
              const dirs = (m.directors || []).map(normalizeStr);
              return (
                t1.includes(normQ) ||
                t2.includes(normQ) ||
                dirs.some((d) => d.includes(normQ))
              );
            });
            const matchChamp =
              yEntry.champion &&
              (normalizeStr(yEntry.champion.title).includes(normQ) ||
                normalizeStr(yEntry.champion.original_title).includes(normQ));

            if (!matchYear && !matchCandidates && !matchChamp) {
              return false;
            }
          }

          return true;
        });

        return {
          ...dec,
          filteredYears: matchingYears,
        };
      })
      .filter((dec) => dec.filteredYears.length > 0);
  }, [
    payload,
    searchTerm,
    navbarSearchQuery,
    statusFilter,
    rarityFilter,
    decadeFilter,
    chronoOrder,
  ]);

  if (loading || !payload) {
    return (
      <div className="h-72 flex flex-col items-center justify-center gap-3 text-cyan-300">
        <Clock className="w-9 h-9 animate-spin text-cyan-400" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Calibrando Capacitor de Fluxo & Linha do Tempo...
        </span>
      </div>
    );
  }

  const { stats, decades } = payload;
  const rank = getChrononautRank(stats.totalConqueredYears);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* =====================================================================
          HERO PAINEL TEMPORAL (CAPACITOR DE FLUXO & ECONOMIA DE XP)
         ===================================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-zinc-950 via-cyan-950/20 to-zinc-950 p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
        {/* Efeitos de Luz / Grid Cibernético */}
        <div className="pointer-events-none absolute -top-24 -left-16 w-80 h-80 bg-cyan-500/12 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(34,211,238,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(34,211,238,0.6) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 flex flex-col gap-6">
          {/* Topo: Título + Patente + Botão Painel de Testes */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/25 via-cyan-500/10 to-zinc-900 border border-cyan-400/50 flex items-center justify-center shrink-0 shadow-[0_0_28px_rgba(34,211,238,0.25)]">
                <Clock className="w-7 h-7 text-cyan-300" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/40">
                    <Zap className="w-3 h-3 text-amber-300" /> Página 5 • Desafio Oficial de XP
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${rank.badgeClass}`}
                  >
                    ⏳ Patente Nv.{rank.level}: {rank.title}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Máquina do Tempo:{' '}
                  <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 bg-clip-text text-transparent">
                    O Século do Cinema
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                  Conquiste cada ano da história do cinema ({stats.minOfficialYear} –{' '}
                  {stats.maxOfficialYear}). Quando houver mais de um filme no mesmo ano, assume a
                  vitrine aquele com a <strong className="text-amber-300">maior Minha Nota</strong>{' '}
                  — ou escolha manualmente o seu favorito!
                </p>
              </div>
            </div>

            {/* Ações Rápidas: Painel de Testes */}
            <div className="flex items-center gap-2.5 self-start lg:self-center">
              <button
                type="button"
                onClick={openTestPanel}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-cyan-500/35 text-xs font-black uppercase tracking-wider text-cyan-200 transition-all cursor-pointer shadow-lg"
                title="Testar animação da Máquina do Tempo + Troféus + Barra de XP"
              >
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                <span>Painel de Testes</span>
              </button>
            </div>
          </div>

          {/* 4 KPIs Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* KPI 1: Anos Conquistados */}
            <div className="bg-zinc-900/75 border border-zinc-800/90 rounded-2xl p-4 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Linha do Tempo Restaurada
                </span>
                <span className="text-xs font-mono font-black text-cyan-300">
                  {stats.percentage}%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-white leading-none">
                  {stats.totalConqueredYears}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  / {stats.totalOfficialYears} anos oficiais
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-400 transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(2, stats.percentage))}%` }}
                />
              </div>
            </div>

            {/* KPI 2: XP Temporal Gerado */}
            <div className="bg-zinc-900/75 border border-cyan-500/25 rounded-2xl p-4 flex flex-col justify-between gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300/90">
                  XP Temporal Acumulado
                </span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black font-mono text-emerald-300 leading-none">
                +{stats.totalXp.toLocaleString('pt-BR')}{' '}
                <span className="text-sm font-bold text-emerald-400/80">XP</span>
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">
                {stats.yearsXp.toLocaleString('pt-BR')} XP anos +{' '}
                {stats.decadesXp.toLocaleString('pt-BR')} XP décadas
              </div>
            </div>

            {/* KPI 3: Relíquias de Décadas */}
            <div className="bg-zinc-900/75 border border-zinc-800/90 rounded-2xl p-4 flex flex-col justify-between gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Relíquias de Década (10/10)
                </span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-amber-300 leading-none">
                  {stats.completedDecadesCount}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  / {stats.totalClosedDecades} décadas fechadas
                </span>
              </div>
              <div className="text-[11px] text-zinc-400">
                +100 a +1.100 XP bônus por década 100% completa
              </div>
            </div>

            {/* KPI 4: Amplitude & Disputas de Campeão */}
            <div className="bg-zinc-900/75 border border-zinc-800/90 rounded-2xl p-4 flex flex-col justify-between gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Amplitude & Curadoria
                </span>
                <Crown className="w-4 h-4 text-amber-300" />
              </div>
              <div className="text-xl font-black font-mono text-zinc-100 leading-tight">
                {stats.oldestMovieYear ? (
                  <>
                    <span className="text-rose-300">{stats.oldestMovieYear}</span>
                    <span className="text-zinc-500 mx-1.5">➔</span>
                    <span className="text-emerald-300">{stats.newestMovieYear}</span>
                  </>
                ) : (
                  <span className="text-zinc-500 text-sm">Sem filmes ainda</span>
                )}
              </div>
              <div className="text-[11px] text-zinc-400">
                <strong className="text-zinc-200">{stats.multiMovieYearsCount}</strong> anos com 2+
                filmes •{' '}
                <strong className="text-amber-300">{stats.manualOverridesCount}</strong> fixados
                manualmente
              </div>
            </div>
          </div>

          {/* Faixa Interativa das 5 Raridades Temporais */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {RARITY_KEYS_DESC.map((rKey) => {
              const meta = TIME_MACHINE_RARITY_META[rKey];
              const rStat = stats.byRarity?.[rKey] || { count: 0, total: 0, totalXp: 0 };
              const isSelected = rarityFilter === rKey;

              return (
                <button
                  key={rKey}
                  type="button"
                  onClick={() => setRarityFilter((prev) => (prev === rKey ? 'all' : rKey))}
                  className={`text-left rounded-2xl p-3 border transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? `${meta.badge} ring-1 ring-white/30 scale-[1.01]`
                      : 'bg-zinc-900/60 border-zinc-800/90 hover:border-zinc-700 text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[11px] font-black ${meta.color}`}>
                      {meta.icon} {meta.label}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded-md">
                      +{meta.xp} XP
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <span className="text-lg font-black font-mono text-white leading-none">
                      {rStat.count}
                      <span className="text-xs text-zinc-500">/{rStat.total}</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {meta.eraRangeLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          BARRA DE BUSCA, FILTROS E SALTO RÁPIDO POR DÉCADAS
         ===================================================================== */}
      <section className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl p-4 flex flex-col gap-3.5 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Busca */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar ano (ex: 1994), filme campeão ou diretor..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500/60 rounded-xl pl-10 pr-9 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Botões de Status, Alternar Ordem e Seletor de Colunas */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'Todos os Anos' },
              { id: 'conquered', label: `✅ Conquistados (${stats.totalConqueredYears})` },
              { id: 'locked', label: `🔒 Vazios (${stats.remainingOfficialYears})` },
              { id: 'disputed', label: `⚔️ 2+ Filmes (${stats.multiMovieYearsCount})` },
              { id: 'manual', label: `📌 Manuais (${stats.manualOverridesCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wide border transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 shadow-sm'
                    : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {/* Alternar Ordem Cronológica */}
            <button
              type="button"
              onClick={() => setChronoOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 text-amber-300 flex items-center gap-1.5 cursor-pointer"
              title="Inverter sentido da linha do tempo"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>
                {chronoOrder === 'desc'
                  ? `${stats.maxOfficialYear} ➔ ${stats.minOfficialYear}`
                  : `${stats.minOfficialYear} ➔ ${stats.maxOfficialYear}`}
              </span>
            </button>

            {/* Seletor de Densidade: 5, 7 ou 10 por linha */}
            <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-xl p-1">
              <span className="text-[10px] font-black text-zinc-500 uppercase px-1.5 hidden sm:inline">
                Linha:
              </span>
              {[
                { count: 5, label: '5' },
                { count: 7, label: '7' },
                { count: 10, label: '10' },
              ].map(({ count, label }) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => handleColsChange(count)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    colsPerRow === count
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                  title={`Exibir ${count} cards por linha ${
                    count === 10 ? '(1 década inteira por linha!)' : ''
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Salto Rápido por Décadas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setDecadeFilter('all')}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-black border transition-all cursor-pointer ${
              decadeFilter === 'all'
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Todas as Décadas
          </button>

          {decades.map((dec) => {
            const active = decadeFilter === dec.id;
            return (
              <button
                key={dec.id}
                type="button"
                onClick={() => setDecadeFilter((prev) => (prev === dec.id ? 'all' : dec.id))}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? 'bg-cyan-500/25 border-cyan-400/70 text-cyan-100'
                    : dec.isRelicUnlocked
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 hover:bg-amber-500/20'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{dec.badgeIcon}</span>
                <span>{dec.id === 'pioneers' ? '< 1920' : dec.id}</span>
                <span className="font-mono text-[10px] opacity-80">
                  {dec.conqueredCount}/{dec.availableYearsCount}
                </span>
                {dec.isRelicUnlocked && <span title="Década Platinada!">🏆</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          LISTAGEM DAS DÉCADAS E GRADE DE NÓS TEMPORAIS (5 POR LINHA)
         ===================================================================== */}
      {filteredDecades.length === 0 ? (
        <div className="h-56 rounded-2xl border border-dashed border-zinc-800 flex flex-col items-center justify-center gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Nenhum ano corresponde aos filtros selecionados.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setRarityFilter('all');
              setDecadeFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black cursor-pointer hover:bg-cyan-400"
          >
            Limpar Filtros Temporais
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {filteredDecades.map((dec) => {
            const decPct =
              dec.availableYearsCount > 0
                ? Math.round((dec.conqueredCount / dec.availableYearsCount) * 100)
                : 0;
            const isOngoing2020s = dec.id === '2020s' && dec.availableYearsCount < 10;

            return (
              <section
                key={dec.id}
                className="flex flex-col gap-4 bg-zinc-950/55 border border-zinc-800/80 rounded-3xl p-4 sm:p-6"
              >
                {/* Cabeçalho da Década */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-2xl shrink-0">
                      {dec.badgeIcon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                          {dec.label}
                        </h2>
                        <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-cyan-300">
                          {dec.conqueredCount}/{dec.availableYearsCount} anos ({decPct}%)
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{dec.subtitle}</p>
                    </div>
                  </div>

                  {/* Badge de Relíquia da Década */}
                  {dec.relicXp > 0 && (
                    <div className="self-start md:self-center">
                      {dec.isRelicUnlocked ? (
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/60 text-amber-200 text-xs font-black shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                          <Award className="w-4 h-4 text-amber-300" />
                          <span>RELÍQUIA DA DÉCADA CONQUISTADA (+{dec.relicXp} XP)</span>
                        </div>
                      ) : isOngoing2020s ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] font-semibold text-zinc-400">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>
                            Década em curso ({dec.conqueredCount}/10 para +{dec.relicXp} XP)
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] font-semibold text-zinc-400">
                          <Lock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>
                            Faltam {Math.max(0, 10 - dec.conqueredCount)} ano(s) para a Relíquia (+
                            {dec.relicXp} XP)
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Grade de Anos da Década (5, 7 ou 10 por Linha) */}
                <div
                  className={
                    colsPerRow === 10
                      ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2'
                      : colsPerRow === 7
                      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5'
                      : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5'
                  }
                >
                  {dec.filteredYears.map((yEntry) => {
                    const rMeta =
                      TIME_MACHINE_RARITY_META[yEntry.rarityTier] ||
                      TIME_MACHINE_RARITY_META.common;
                    const isConquered = yEntry.status === 'conquered' && yEntry.champion;
                    const posterUrl = isConquered
                      ? resolvePosterUrl(yEntry.champion.poster_url)
                      : null;
                    const isUltraDense = colsPerRow === 10;
                    const isDense = colsPerRow === 7;

                    return (
                      <div
                        key={yEntry.year}
                        onClick={() => setSelectedYearNumber(yEntry.year)}
                        className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer aspect-[2/3] flex flex-col justify-between ${
                          isConquered
                            ? `${rMeta.borderGlow} bg-zinc-900 hover:-translate-y-1`
                            : 'border-zinc-800/80 bg-zinc-950/90 hover:border-cyan-500/40 hover:bg-zinc-900/60'
                        }`}
                      >
                        {/* Pôster de fundo se conquistado */}
                        {isConquered && posterUrl && (
                          <img
                            src={posterUrl}
                            alt={yEntry.champion.title}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}

                        {/* Gradiente Cinematográfico sobre o pôster */}
                        {isConquered ? (
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/65" />
                        ) : (
                          <div
                            className="absolute inset-0 opacity-[0.06]"
                            style={{
                              backgroundImage:
                                'radial-gradient(circle at center, rgba(34,211,238,0.8) 1px, transparent 1px)',
                              backgroundSize: '14px 14px',
                            }}
                          />
                        )}

                        {/* Topo do Card: Ano + Raridade + Indicador de Campeão */}
                        <div
                          className={`relative z-10 flex items-start justify-between gap-1 ${
                            isUltraDense ? 'p-1.5' : isDense ? 'p-2' : 'p-2.5'
                          }`}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={`font-mono font-black leading-none rounded-lg backdrop-blur-md border ${
                                isUltraDense
                                  ? 'text-sm sm:text-base px-1.5 py-0.5'
                                  : isDense
                                  ? 'text-base sm:text-lg px-2 py-0.5'
                                  : 'text-xl sm:text-2xl px-2 py-1'
                              } ${
                                isConquered
                                  ? 'bg-black/70 text-white border-white/20 shadow-lg'
                                  : 'bg-zinc-900/90 text-zinc-400 border-zinc-800'
                              }`}
                            >
                              {yEntry.year}
                            </span>
                            <span
                              className={`inline-flex items-center gap-0.5 font-black rounded-md border backdrop-blur-md w-fit ${
                                isUltraDense
                                  ? 'text-[8px] px-1 py-0.5'
                                  : 'text-[9px] px-1.5 py-0.5'
                              } ${rMeta.badge}`}
                            >
                              <span>{rMeta.icon}</span>
                              <span>+{yEntry.xpReward} XP</span>
                            </span>
                          </div>

                          {/* Badges de Disputa / Escolha Manual */}
                          {isConquered && (
                            <div className="flex flex-col items-end gap-0.5">
                              {yEntry.selectionMode === 'manual' ? (
                                <span
                                  className={`inline-flex items-center gap-0.5 rounded-md bg-amber-500/90 text-slate-950 font-black uppercase shadow ${
                                    isUltraDense
                                      ? 'text-[8px] px-1 py-0.5'
                                      : 'text-[9px] px-1.5 py-0.5'
                                  }`}
                                  title="Campeão fixado manualmente por você"
                                >
                                  <Pin className="w-2.5 h-2.5" />
                                  {!isUltraDense && 'Manual'}
                                </span>
                              ) : yEntry.moviesCount > 1 ? (
                                <span
                                  className={`inline-flex items-center gap-0.5 rounded-md bg-emerald-500/85 text-slate-950 font-black uppercase shadow ${
                                    isUltraDense
                                      ? 'text-[8px] px-1 py-0.5'
                                      : 'text-[9px] px-1.5 py-0.5'
                                  }`}
                                  title="Selecionado automaticamente pela maior Minha Nota"
                                >
                                  <Crown className="w-2.5 h-2.5" />
                                  {!isUltraDense && 'Maior Nota'}
                                </span>
                              ) : null}

                              {yEntry.moviesCount > 1 && (
                                <span
                                  className={`inline-flex items-center gap-0.5 rounded-md bg-black/75 border border-white/15 font-mono font-bold text-zinc-200 backdrop-blur-md ${
                                    isUltraDense
                                      ? 'text-[8px] px-1 py-0.2'
                                      : 'text-[10px] px-1.5 py-0.5'
                                  }`}
                                >
                                  <Film className="w-2.5 h-2.5 text-cyan-300" />
                                  {yEntry.moviesCount}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Centro para Anos Bloqueados */}
                        {!isConquered && (
                          <div className="relative z-10 px-2 flex flex-col items-center text-center gap-1">
                            <Lock
                              className={`${
                                isUltraDense ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6'
                              } text-zinc-700 group-hover:text-cyan-400 transition-colors`}
                            />
                            <span
                              className={`${
                                isUltraDense ? 'text-[8px]' : 'text-[9px] sm:text-[10px]'
                              } font-bold uppercase tracking-wider text-zinc-600 group-hover:text-zinc-400`}
                            >
                              Vácuo Temporal
                            </span>
                          </div>
                        )}

                        {/* Rodapé do Card */}
                        <div
                          className={`relative z-10 ${
                            isUltraDense ? 'p-1.5' : isDense ? 'p-2' : 'p-3'
                          }`}
                        >
                          {isConquered ? (
                            <div className="flex flex-col gap-0.5">
                              <h3
                                className={`font-black text-white leading-tight drop-shadow ${
                                  isUltraDense
                                    ? 'text-[11px] line-clamp-1'
                                    : isDense
                                    ? 'text-xs line-clamp-2'
                                    : 'text-xs sm:text-sm line-clamp-2'
                                }`}
                              >
                                {yEntry.champion.title}
                              </h3>
                              <div className="flex items-center justify-between gap-1 mt-0.5">
                                <span
                                  className={`inline-flex items-center gap-0.5 rounded-md bg-amber-500/20 border border-amber-400/50 font-mono font-black text-amber-300 ${
                                    isUltraDense
                                      ? 'text-[9px] px-1 py-0.5'
                                      : 'text-[11px] px-1.5 py-0.5'
                                  }`}
                                >
                                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                  {Number(yEntry.champion.user_rating || 0).toFixed(
                                    isUltraDense ? 1 : 3
                                  )}
                                </span>
                                {Number(yEntry.champion.imdb_rating) > 0 && !isUltraDense && (
                                  <span className="text-[10px] font-mono font-bold text-zinc-300 truncate">
                                    IMDb {Number(yEntry.champion.imdb_rating).toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`w-full rounded-xl bg-zinc-900/90 group-hover:bg-cyan-500/20 border border-zinc-800 group-hover:border-cyan-400/50 font-black uppercase tracking-wider text-zinc-400 group-hover:text-cyan-200 text-center transition-colors ${
                                isUltraDense ? 'text-[8px] py-1' : 'text-[10px] py-1.5'
                              }`}
                            >
                              + Explorar {yEntry.year}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* =====================================================================
          MODAL DE INSPEÇÃO DO ANO & ESCOLHA MANUAL DO CAMPEÃO
         ===================================================================== */}
      {selectedYearEntry && (
        <div
          onClick={() => setSelectedYearNumber(null)}
          className="fixed inset-0 z-[8500] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-cyan-500/35 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.92)] flex flex-col"
          >
            {/* Header do Modal */}
            {(() => {
              const rMeta =
                TIME_MACHINE_RARITY_META[selectedYearEntry.rarityTier] ||
                TIME_MACHINE_RARITY_META.common;
              const isConquered = selectedYearEntry.status === 'conquered';

              return (
                <>
                  <div className="p-5 sm:p-6 border-b border-zinc-800/90 bg-gradient-to-r from-zinc-900/90 via-cyan-950/25 to-zinc-900/90 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${rMeta.badge}`}>
                          {rMeta.icon} Ano {rMeta.label} • +{selectedYearEntry.xpReward} XP
                        </span>
                        {isConquered ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Nó Temporal Conquistado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">
                            <Lock className="w-3 h-3" /> Vácuo Temporal Disponível
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-black font-mono text-white flex items-baseline gap-3">
                        <span>Ano {selectedYearEntry.year}</span>
                        <span className="text-xs font-sans font-bold text-zinc-400">
                          ({selectedYearEntry.moviesCount}{' '}
                          {selectedYearEntry.moviesCount === 1
                            ? 'filme cadastrado'
                            : 'filmes cadastrados'}
                          )
                        </span>
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedYearNumber(null)}
                      className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Corpo do Modal */}
                  <div className="p-5 sm:p-6 flex flex-col gap-5">
                    {isConquered ? (
                      <>
                        {/* Explicação do Modo Automático vs Manual */}
                        <div className="rounded-2xl p-3.5 bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="text-xs text-zinc-300">
                            {selectedYearEntry.selectionMode === 'manual' ? (
                              <span>
                                📌 <strong>Modo Manual Ativo:</strong> Você fixou manualmente{' '}
                                <strong className="text-amber-300">
                                  {selectedYearEntry.champion?.title}
                                </strong>{' '}
                                na capa de {selectedYearEntry.year}.
                              </span>
                            ) : (
                              <span>
                                👑 <strong>Modo Automático (Maior Minha Nota):</strong> Assume a
                                vitrine do ano o filme com a maior nota pessoal cadastrada.
                              </span>
                            )}
                          </div>

                          {selectedYearEntry.selectionMode === 'manual' && (
                            <button
                              type="button"
                              disabled={savingAction}
                              onClick={() => handleSelectChampion(selectedYearEntry.year, null)}
                              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/50 text-[11px] font-black text-cyan-200 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Usar Maior Minha Nota
                            </button>
                          )}
                        </div>

                        {/* Ranking completo de filmes daquele ano */}
                        <div className="flex flex-col gap-2.5">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                            Filmes de {selectedYearEntry.year} no Seu Catálogo (Ordenados por Minha
                            Nota)
                          </h4>

                          {selectedYearEntry.candidates.map((cand, index) => {
                            const isCurrentChampion =
                              Number(selectedYearEntry.champion?.movie_id) ===
                              Number(cand.movie_id);
                            const isAutoTop = index === 0;
                            const candPoster = resolvePosterUrl(cand.poster_url);

                            return (
                              <div
                                key={cand.movie_id}
                                className={`rounded-2xl p-3 border flex items-center gap-3.5 transition-all ${
                                  isCurrentChampion
                                    ? 'bg-cyan-950/35 border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.12)]'
                                    : 'bg-zinc-900/60 border-zinc-800/90 hover:border-zinc-700'
                                }`}
                              >
                                <div className="w-7 text-center font-mono text-xs font-black text-zinc-500 shrink-0">
                                  #{index + 1}
                                </div>

                                {candPoster ? (
                                  <img
                                    src={candPoster}
                                    alt={cand.title}
                                    className="w-12 h-16 object-cover rounded-lg border border-white/15 shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-16 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                                    <Film className="w-4 h-4 text-zinc-500" />
                                  </div>
                                )}

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-sm font-black text-white truncate">
                                      {cand.title}
                                    </span>
                                    {isAutoTop && (
                                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/35">
                                        1º em Minha Nota
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                                    {(cand.directors || []).join(', ') || 'Direção não informada'}
                                  </div>

                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="inline-flex items-center gap-1 text-xs font-mono font-black text-amber-300">
                                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                      {Number(cand.user_rating || 0).toFixed(3)}
                                    </span>
                                    {Number(cand.imdb_rating) > 0 && (
                                      <span className="text-[11px] font-mono text-zinc-400">
                                        IMDb {Number(cand.imdb_rating).toFixed(1)}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Botão Escolher Manualmente */}
                                <div className="shrink-0">
                                  {isCurrentChampion ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-[11px] font-black text-cyan-200">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Na Vitrine
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={savingAction}
                                      onClick={() =>
                                        handleSelectChampion(selectedYearEntry.year, cand.movie_id)
                                      }
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-slate-950 border border-zinc-700 hover:border-amber-400 text-[11px] font-black text-zinc-200 transition-all cursor-pointer"
                                    >
                                      <Pin className="w-3 h-3" /> Fixar Capa
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      /* Ano ainda bloqueado: CTA Direto de Cadastro */
                      <div className="flex flex-col gap-4">
                        <div className="rounded-2xl p-4 sm:p-5 bg-cyan-950/25 border border-cyan-500/35 text-xs sm:text-sm text-zinc-300 leading-relaxed flex flex-col gap-2">
                          <p>
                            Você ainda não possui nenhum filme lançado em{' '}
                            <strong className="text-white text-base font-mono">
                              {selectedYearEntry.year}
                            </strong>{' '}
                            no catálogo.
                          </p>
                          <p className="text-zinc-400">
                            Ao cadastrar o primeiro filme deste ano, o portal da{' '}
                            <strong className="text-cyan-300 font-bold">Máquina do Tempo</strong> será
                            ativado e você receberá instantaneamente{' '}
                            <strong className="text-amber-300 font-bold font-mono">
                              +{selectedYearEntry.xpReward} XP
                            </strong>{' '}
                            na sua barra de nível!
                          </p>
                        </div>

                        {onOpenAddMovieForYear && (
                          <button
                            type="button"
                            onClick={() => {
                              const yearToAdd = selectedYearEntry.year;
                              setSelectedYearNumber(null);
                              onOpenAddMovieForYear(yearToAdd, '');
                            }}
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-400 hover:from-cyan-400 hover:to-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider shadow-xl cursor-pointer transition-all duration-200"
                          >
                            <Plus className="w-4 h-4 stroke-[3]" />
                            Cadastrar Primeiro Filme de {selectedYearEntry.year} (+
                            {selectedYearEntry.xpReward} XP)
                          </button>
                        )}
                      </div>
                    )}

                    {/* Botão Rodapé: Cadastrar Outro Filme deste Ano (se já conquistado) */}
                    {isConquered && onOpenAddMovieForYear && (
                      <div className="pt-2 border-t border-zinc-800/80 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const yearToAdd = selectedYearEntry.year;
                            setSelectedYearNumber(null);
                            onOpenAddMovieForYear(yearToAdd, '');
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-cyan-400/50 text-cyan-200 text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar Mais um Filme de {selectedYearEntry.year}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal do Painel de Testes & Homologação */}
      {isTestPanelOpen && (
        <TrophyTestPanelModal
          isOpen={isTestPanelOpen}
          onClose={() => setIsTestPanelOpen(false)}
          trophies={trophiesForTestPanel}
          onRefreshData={fetchTimeMachine}
          onSyncSuccess={fetchTimeMachine}
        />
      )}
    </div>
  );
}
