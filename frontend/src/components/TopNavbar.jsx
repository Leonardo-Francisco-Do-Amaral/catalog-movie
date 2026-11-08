import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  X,
  ChevronDown,
  Globe,
  Plus,
  Target,
  Shield,
  Tv,
  Trophy,
  Headphones,
  Video,
  Building,
  Package,
  PenTool,
  Sparkles,
  Check,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { calculateClientXpStatus } from '../utils/xpSystem';
import LevelDetailsModal from './LevelDetailsModal';

const COUNTRY_TO_ISO = {
  'estados unidos': 'us',
  'brasil': 'br',
  'reino unido': 'gb',
  'frança': 'fr',
  'japão': 'jp',
  'coreia do sul': 'kr',
  'alemanha': 'de',
  'alemanha ocidental': 'de',
  'itália': 'it',
  'espanha': 'es',
  'suécia': 'se',
  'dinamarca': 'dk',
  'irlanda': 'ie',
  'canadá': 'ca',
  'líbano': 'lb',
  'chipre': 'cy',
  'catar': 'qa',
  'argentina': 'ar',
  'holanda': 'nl',
  'países baixos': 'nl',
  'polônia': 'pl',
  'islândia': 'is',
  'noruega': 'no',
  'áfrica do sul': 'za',
  'nova zelândia': 'nz',
  'rússia': 'ru',
  'méxico': 'mx',
  'colômbia': 'co',
  'chile': 'cl',
  'índia': 'in',
  'china': 'cn',
  'hong kong': 'hk',
  'taiwan': 'tw',
  'tailândia': 'th',
  'austrália': 'au',
  'áustria': 'at',
  'bélgica': 'be',
  'bulgária': 'bg',
  'finlândia': 'fi',
  'hungria': 'hu',
  'malta': 'mt',
  'marrocos': 'ma',
  'república checa': 'cz',
  'romênia': 'ro',
  'sérvia': 'rs',
  'singapura': 'sg',
  'união soviética': 'su'
};

const getFlagUrl = (countryName) => {
  if (!countryName || countryName === 'Desconhecido') return null;
  const key = countryName.toLowerCase().trim();
  const code = COUNTRY_TO_ISO[key];
  return code ? `https://flagcdn.com/w20/${code}.png` : null;
};

export default function TopNavbar({
  searchQuery,
  setSearchQuery,

  // Tags Customizadas
  selectedTags = [],
  toggleTag,
  allTags = [],

  // Gêneros Oficiais
  selectedGenres = [],
  toggleGenre,
  allGenres = [],

  // País de Origem
  selectedCountries = [],
  toggleCountry,
  allCountries = [],

  // Diretores Frequentes
  selectedDirectors = [],
  toggleDirector = () => {},
  frequentDirectors = [],

  // Roteiristas Frequentes
  selectedWriters = [],
  toggleWriter = () => {},
  frequentWriters = [],

  // Estúdios Frequentes
  selectedStudios = [],
  toggleStudio = () => {},
  frequentStudios = [],

  // Distribuidoras Frequentes
  selectedDistributors = [],
  toggleDistributor = () => {},
  frequentDistributors = [],

  // Plataformas
  selectedPlatforms = [],
  togglePlatform = () => {},
  allPlatforms = [],

  // Oscar
  oscarFilter = null,
  setOscarFilter = () => {},

  // Tipo de Áudio
  selectedAudios = [],
  toggleAudio,
  allAudios = [],

  clearCategory = () => {},
  clearFilters,
  onAddMovie,
  onOpenImport,
  activeTab = 'catalog',
  setActiveTab = () => {},
  movies = [],
  xpStatus = null
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [liveXpStatus, setLiveXpStatus] = useState(xpStatus);
  const navRef = useRef(null);

  useEffect(() => {
    if (xpStatus) {
      setLiveXpStatus(xpStatus);
    }
  }, [xpStatus]);

  useEffect(() => {
    const handleXpSync = (e) => {
      if (e?.detail) {
        setLiveXpStatus(e.detail);
      }
    };
    window.addEventListener('cine-xp-status-sync', handleXpSync);
    return () => window.removeEventListener('cine-xp-status-sync', handleXpSync);
  }, []);

  // Fecha dropdown ao clicar fora ou apertar ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
        setDropdownSearch('');
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setDropdownSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggleDropdown = (key) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
    setDropdownSearch('');
  };

  // Lógica de RPG / Ficha de Personagem baseada no catálogo
  const rpgStats = useMemo(() => {
    const totalMovies = movies.length;
    let totalMinutes = 0;
    let ratingSum = 0;
    let ratingCount = 0;

    const genreCounts = {};
    const directorCounts = {};
    const writerCounts = {};

    movies.forEach((m) => {
      if (m.runtime) totalMinutes += Number(m.runtime);
      const r = Number(m.user_rating);
      if (r > 0) {
        ratingSum += r;
        ratingCount++;
      }

      const genresList = m.genres || [];
      genresList.forEach((g) => {
        if (g && g.trim()) {
          const name = g.trim();
          genreCounts[name] = (genreCounts[name] || 0) + 1;
        }
      });

      const directorsList = Array.isArray(m.directors) && m.directors.length > 0
        ? m.directors
        : m.director
          ? [m.director]
          : [];
      directorsList.forEach((d) => {
        if (d && d.trim()) {
          const name = d.trim();
          directorCounts[name] = (directorCounts[name] || 0) + 1;
        }
      });

      const writersList = Array.isArray(m.writers)
        ? m.writers
        : typeof m.writers === 'string'
          ? m.writers.split(',').map((x) => x.trim())
          : [];
      writersList.forEach((w) => {
        if (w && w.trim()) {
          const name = w.trim();
          writerCounts[name] = (writerCounts[name] || 0) + 1;
        }
      });
    });

    const totalHours = Math.round(totalMinutes / 60);
    const avgRating = ratingCount > 0 ? ratingSum / ratingCount : 0;

    let topGenre = '';
    let maxGenre = 0;
    Object.keys(genreCounts).forEach((g) => {
      if (genreCounts[g] > maxGenre) {
        maxGenre = genreCounts[g];
        topGenre = g;
      }
    });

    let topDirector = '';
    let maxDirector = 0;
    Object.keys(directorCounts).forEach((d) => {
      if (directorCounts[d] > maxDirector) {
        maxDirector = directorCounts[d];
        topDirector = d;
      }
    });

    let topWriter = '';
    let maxWriter = 0;
    Object.keys(writerCounts).forEach((w) => {
      if (writerCounts[w] > maxWriter) {
        maxWriter = writerCounts[w];
        topWriter = w;
      }
    });

    const fallbackXp = calculateClientXpStatus(movies);
    const activeXp = liveXpStatus || fallbackXp;

    return {
      totalMovies,
      totalHours,
      avgRating,
      topGenre: topGenre ? `${topGenre} (${maxGenre}x)` : 'N/A',
      topDirector: topDirector ? `${topDirector} (${maxDirector}x)` : 'N/A',
      topWriter: topWriter ? `${topWriter} (${maxWriter}x)` : 'N/A',
      xp: activeXp.totalXp,
      level: activeXp.level,
      nextLevelXp: activeXp.nextLevelThresholdXp,
      xpPercentage: activeXp.progressPercentage,
      className: activeXp.levelTitle,
      xpStatus: activeXp
    };
  }, [movies, liveXpStatus]);

  const sortedCountries = useMemo(() => {
    return [...allCountries].sort((a, b) => {
      if (a === 'Desconhecido') return 1;
      if (b === 'Desconhecido') return -1;
      return a.localeCompare(b, 'pt');
    });
  }, [allCountries]);

  // Configuração das categorias de dropdown
  const filterCategories = [
    {
      key: 'tags',
      label: 'Minhas Tags',
      shortLabel: 'Tags',
      icon: Target,
      options: allTags,
      selected: selectedTags,
      onToggle: toggleTag,
      hint: 'Combina as selecionadas',
      align: 'left'
    },
    {
      key: 'genres',
      label: 'Gêneros Oficiais',
      shortLabel: 'Gêneros',
      icon: Shield,
      options: allGenres,
      selected: selectedGenres,
      onToggle: toggleGenre,
      hint: 'Combina os selecionados',
      align: 'left'
    },
    {
      key: 'countries',
      label: 'País de Origem',
      shortLabel: 'Países',
      icon: Globe,
      options: sortedCountries,
      selected: selectedCountries,
      onToggle: toggleCountry,
      hint: 'Combina os selecionados',
      isCountry: true,
      align: 'left'
    },
    {
      key: 'directors',
      label: 'Diretores Frequentes',
      shortLabel: 'Diretores',
      icon: Video,
      options: frequentDirectors,
      selected: selectedDirectors,
      onToggle: toggleDirector,
      hint: '2+ filmes no catálogo',
      align: 'left'
    },
    {
      key: 'writers',
      label: 'Roteiristas Frequentes',
      shortLabel: 'Roteiristas',
      icon: PenTool,
      options: frequentWriters,
      selected: selectedWriters,
      onToggle: toggleWriter,
      hint: '2+ filmes no catálogo',
      align: 'left'
    },
    {
      key: 'studios',
      label: 'Estúdios Frequentes',
      shortLabel: 'Estúdios',
      icon: Building,
      options: frequentStudios,
      selected: selectedStudios,
      onToggle: toggleStudio,
      hint: '3+ filmes no catálogo',
      align: 'right'
    },
    {
      key: 'distributors',
      label: 'Distribuidoras Frequentes',
      shortLabel: 'Distribuidoras',
      icon: Package,
      options: frequentDistributors,
      selected: selectedDistributors,
      onToggle: toggleDistributor,
      hint: '3+ filmes no catálogo',
      align: 'right'
    },
    {
      key: 'platforms',
      label: 'Visto Em (Plataforma)',
      shortLabel: 'Plataforma',
      icon: Tv,
      options: allPlatforms,
      selected: selectedPlatforms,
      onToggle: togglePlatform,
      hint: 'Qualquer selecionada',
      align: 'right'
    },
    {
      key: 'audios',
      label: 'Tipo de Áudio',
      shortLabel: 'Áudio',
      icon: Headphones,
      options: allAudios,
      selected: selectedAudios,
      onToggle: toggleAudio,
      hint: 'Qualquer selecionado',
      align: 'right'
    }
  ];

  // Lista unificada de chips ativos para fácil remoção em 1 clique
  const activeChips = useMemo(() => {
    const chips = [];
    selectedTags.forEach((v) => chips.push({ key: `tag-${v}`, label: `Tag: ${v}`, onRemove: () => toggleTag(v) }));
    selectedGenres.forEach((v) => chips.push({ key: `genre-${v}`, label: `Gênero: ${v}`, onRemove: () => toggleGenre(v) }));
    selectedCountries.forEach((v) => chips.push({ key: `country-${v}`, label: `País: ${v}`, onRemove: () => toggleCountry(v) }));
    selectedDirectors.forEach((v) => chips.push({ key: `dir-${v}`, label: `Diretor: ${v}`, onRemove: () => toggleDirector(v) }));
    selectedWriters.forEach((v) => chips.push({ key: `wri-${v}`, label: `Roteiro: ${v}`, onRemove: () => toggleWriter(v) }));
    selectedStudios.forEach((v) => chips.push({ key: `stu-${v}`, label: `Estúdio: ${v}`, onRemove: () => toggleStudio(v) }));
    selectedDistributors.forEach((v) => chips.push({ key: `dist-${v}`, label: `Distrib.: ${v}`, onRemove: () => toggleDistributor(v) }));
    selectedPlatforms.forEach((v) => chips.push({ key: `plat-${v}`, label: `Visto em: ${v}`, onRemove: () => togglePlatform(v) }));
    selectedAudios.forEach((v) => chips.push({ key: `aud-${v}`, label: `Áudio: ${v}`, onRemove: () => toggleAudio(v) }));
    if (oscarFilter === 'wins') {
      chips.push({ key: 'oscar-wins', label: '🏆 Ganhadores do Oscar', onRemove: () => setOscarFilter(null) });
    } else if (oscarFilter === 'nominations') {
      chips.push({ key: 'oscar-noms', label: '🎬 Indicados ao Oscar', onRemove: () => setOscarFilter(null) });
    }
    return chips;
  }, [
    selectedTags,
    selectedGenres,
    selectedCountries,
    selectedDirectors,
    selectedWriters,
    selectedStudios,
    selectedDistributors,
    selectedPlatforms,
    selectedAudios,
    oscarFilter,
    toggleTag,
    toggleGenre,
    toggleCountry,
    toggleDirector,
    toggleWriter,
    toggleStudio,
    toggleDistributor,
    togglePlatform,
    toggleAudio,
    setOscarFilter
  ]);

  const totalActiveFilterCount = activeChips.length + (searchQuery.trim() ? 1 : 0);

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-40 w-full bg-zinc-950/88 backdrop-blur-xl border-b border-zinc-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
    >
      {/* LINHA 1: Logo + Abas + Busca + Ficha RPG + Adicionar Filme */}
      <div className="px-4 sm:px-6 lg:px-10 py-3 flex flex-wrap items-center justify-between gap-3">
        
        {/* Esquerda: Marca + Alternador de Abas */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setActiveTab('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-1 rounded tracking-widest uppercase shadow-md shadow-amber-500/10 group-hover:bg-amber-400 transition-colors">
              CRÍTICO
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-wide bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              CINE CATALOG
            </h1>
          </button>

          {/* Alternador de Abas (HUD Gamer) */}
          <div className="flex items-center gap-1 bg-zinc-900/70 p-1 rounded-xl border border-zinc-800/60">
            <button
              type="button"
              onClick={() => {
                setActiveTab('catalog');
                setOpenDropdown(null);
              }}
              className={`px-3 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all duration-300 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🎥 Catálogo
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('analytics');
                setOpenDropdown(null);
              }}
              className={`px-3 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all duration-300 cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              📊 Estatísticas
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('challenge');
                setOpenDropdown(null);
              }}
              className={`px-3 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all duration-300 cursor-pointer ${
                activeTab === 'challenge'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-emerald-400/90 hover:text-emerald-300 hover:bg-emerald-500/10'
              }`}
            >
              🌍 Desafio 195
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('trophies');
                setOpenDropdown(null);
              }}
              className={`px-3 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all duration-300 cursor-pointer ${
                activeTab === 'trophies'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25'
                  : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-400/10'
              }`}
            >
              🏆 Troféus
            </button>
          </div>
        </div>

        {/* Centro: Barra de Pesquisa Rápida */}
        <div className="flex-1 min-w-[220px] max-w-md mx-auto lg:mx-4 order-3 md:order-2 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/80 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'catalog' && e.target.value.trim()) {
                  setActiveTab('catalog');
                }
              }}
              placeholder="Buscar título, diretor, roteirista ou tag..."
              className="w-full bg-zinc-900/75 border border-zinc-800 focus:border-amber-500/60 rounded-xl py-2 pl-10 pr-8 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/25 transition-all duration-300"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 p-0.5 rounded transition-colors cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Direita: Ficha RPG Popover + Botão Mobile Filtros + Adicionar Filme */}
        <div className="flex items-center gap-2.5 order-2 md:order-3">
          
          {/* Mini HUD RPG (Abre o Modal Detalhado de Nível, Troféus e XP) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setOpenDropdown(null);
                setIsLevelModalOpen(true);
              }}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                isLevelModalOpen
                  ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-zinc-900/70 border-zinc-800/80 hover:border-amber-500/40 text-zinc-200'
              }`}
              title={`LVL ${rpgStats.level} • ${rpgStats.className} (${rpgStats.xp.toLocaleString('pt-BR')} XP) — Clique para abrir detalhes completos`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="flex flex-col items-start leading-none gap-1">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                  <span className="text-amber-400 shrink-0">LVL {rpgStats.level}</span>
                  <span className="text-zinc-600 hidden sm:inline">•</span>
                  <span className="text-zinc-200 max-w-[140px] lg:max-w-[200px] xl:max-w-[250px] truncate hidden sm:inline">
                    {rpgStats.className}
                  </span>
                </div>
                <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800/80">
                  <div
                    className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(rpgStats.xpPercentage > 0 ? 4 : 0, rpgStats.xpPercentage)}%` }}
                  />
                </div>
              </div>
            </button>
          </div>

          {/* Botão Mobile para expandir/recolher barra de filtros */}
          {activeTab === 'catalog' && (
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((prev) => !prev)}
              className={`lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                mobileFiltersOpen || activeChips.length > 0
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtros</span>
              {activeChips.length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                  {activeChips.length}
                </span>
              )}
            </button>
          )}

          {/* Botão: Importar Planilha (.csv / .xlsx) */}
          {onOpenImport && (
            <button
              type="button"
              onClick={onOpenImport}
              title="Importar filmes novos de uma planilha (.xlsx ou .csv)"
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/40 hover:border-emerald-400/70 text-emerald-400 text-xs font-black uppercase tracking-wider px-3 py-2 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/5 hover:scale-[1.02] cursor-pointer shrink-0"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden xl:inline">Importar Planilha</span>
              <span className="xl:hidden">Planilha</span>
            </button>
          )}

          {/* Botão Principal: Adicionar Filme */}
          <button
            type="button"
            onClick={onAddMovie}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/15 hover:scale-[1.02] cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Adicionar Filme</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>

      {/* LINHA 2: Barra Horizontal de Filtros Compactos em Dropdowns (Apenas na aba Catálogo) */}
      {activeTab === 'catalog' && (
        <div
          className={`${
            mobileFiltersOpen ? 'flex' : 'hidden lg:flex'
          } flex-col border-t border-zinc-900/90 bg-zinc-950/60 px-4 sm:px-6 lg:px-10 py-2.5 gap-2`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mr-1 hidden xl:flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-amber-500" />
              Filtros:
            </span>

            {/* 9 Categorias baseadas em listas */}
            {filterCategories.map((cat) => {
              const Icon = cat.icon;
              const isOpen = openDropdown === cat.key;
              const count = cat.selected.length;
              const isActive = count > 0;

              const filteredOptions = dropdownSearch.trim()
                ? cat.options.filter((opt) =>
                    opt.toLowerCase().includes(dropdownSearch.toLowerCase().trim())
                  )
                : cat.options;

              return (
                <div key={cat.key} className="relative">
                  <button
                    type="button"
                    onClick={() => handleToggleDropdown(cat.key)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.12)]'
                        : isOpen
                          ? 'bg-zinc-800/90 border-zinc-700 text-zinc-100'
                          : 'bg-zinc-900/60 border-zinc-800/90 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive || isOpen ? 'text-amber-400' : 'text-zinc-400'}`} />
                    <span>{cat.shortLabel}</span>
                    {isActive && (
                      <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 rounded-full leading-tight">
                        {count}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3 h-3 text-zinc-500 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-amber-400' : ''
                      }`}
                    />
                  </button>

                  {/* Menu Suspenso (Popover) */}
                  {isOpen && (
                    <div
                      className={`absolute top-full mt-2 w-72 sm:w-80 bg-zinc-950/98 backdrop-blur-2xl border border-zinc-800 rounded-2xl p-3.5 shadow-[0_15px_50px_rgba(0,0,0,0.85)] z-50 flex flex-col gap-2.5 ${
                        cat.align === 'right' ? 'right-0' : 'left-0'
                      }`}
                    >
                      {/* Cabeçalho do Dropdown */}
                      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black uppercase tracking-wider text-zinc-100">
                            {cat.label}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-semibold">{cat.hint}</span>
                        </div>
                        {isActive && (
                          <button
                            type="button"
                            onClick={() => clearCategory(cat.key)}
                            className="text-[10px] font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
                          >
                            Limpar ({count})
                          </button>
                        )}
                      </div>

                      {/* Busca rápida interna quando houver mais de 8 itens */}
                      {cat.options.length > 8 && (
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                          <input
                            type="text"
                            autoFocus
                            value={dropdownSearch}
                            onChange={(e) => setDropdownSearch(e.target.value)}
                            placeholder={`Filtrar em ${cat.shortLabel.toLowerCase()}...`}
                            className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500/50 rounded-lg py-1.5 pl-8 pr-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
                          />
                        </div>
                      )}

                      {/* Opções */}
                      <div className="max-h-64 overflow-y-auto pr-1 scrollbar-hide">
                        {filteredOptions.length === 0 ? (
                          <span className="text-xs text-zinc-500 italic block py-3 text-center">
                            Nenhuma opção encontrada...
                          </span>
                        ) : cat.isCountry ? (
                          <div className="flex flex-col gap-1">
                            {filteredOptions.map((countryName) => {
                              const isSelected = cat.selected.includes(countryName);
                              const flagUrl = getFlagUrl(countryName);
                              return (
                                <button
                                  key={countryName}
                                  type="button"
                                  onClick={() => cat.onToggle(countryName)}
                                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer text-left ${
                                    isSelected
                                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                                      : 'bg-zinc-900/50 text-zinc-300 border-zinc-800/80 hover:border-zinc-700 hover:text-zinc-100'
                                  }`}
                                >
                                  <span className="flex items-center gap-2 truncate">
                                    {countryName === 'Desconhecido' || !flagUrl ? (
                                      <span className="text-xs shrink-0">🌐</span>
                                    ) : (
                                      <img
                                        src={flagUrl}
                                        alt={countryName}
                                        className="w-4 h-3 object-cover rounded-sm border border-zinc-800 shrink-0"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <span className="truncate">{countryName}</span>
                                  </span>
                                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {filteredOptions.map((item) => {
                              const isSelected = cat.selected.includes(item);
                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => cat.onToggle(item)}
                                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all duration-150 flex items-center gap-1 cursor-pointer ${
                                    isSelected
                                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                                      : 'bg-zinc-900/60 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-zinc-100'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 shrink-0" />}
                                  <span>{item}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* 10ª Categoria: Premiações (Oscar) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => handleToggleDropdown('oscar')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                  oscarFilter !== null
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.12)]'
                    : openDropdown === 'oscar'
                      ? 'bg-zinc-800/90 border-zinc-700 text-zinc-100'
                      : 'bg-zinc-900/60 border-zinc-800/90 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100'
                }`}
              >
                <Trophy
                  className={`w-3.5 h-3.5 ${
                    oscarFilter !== null || openDropdown === 'oscar' ? 'text-amber-400' : 'text-zinc-400'
                  }`}
                />
                <span>Oscar</span>
                {oscarFilter !== null && (
                  <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 rounded-full leading-tight">
                    1
                  </span>
                )}
                <ChevronDown
                  className={`w-3 h-3 text-zinc-500 transition-transform duration-200 ${
                    openDropdown === 'oscar' ? 'rotate-180 text-amber-400' : ''
                  }`}
                />
              </button>

              {openDropdown === 'oscar' && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-950/98 backdrop-blur-2xl border border-zinc-800 rounded-2xl p-3.5 shadow-[0_15px_50px_rgba(0,0,0,0.85)] z-50 flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-zinc-100">
                      Premiações (Oscar)
                    </span>
                    {oscarFilter !== null && (
                      <button
                        type="button"
                        onClick={() => setOscarFilter(null)}
                        className="text-[10px] font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOscarFilter(oscarFilter === 'wins' ? null : 'wins');
                      setOpenDropdown(null);
                    }}
                    className={`text-xs px-3 py-2 rounded-xl border font-bold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      oscarFilter === 'wins'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                        : 'bg-zinc-900/50 text-zinc-300 border-zinc-800 hover:border-amber-500/40 hover:text-amber-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🏆</span>
                      <span>Ganhadores do Oscar</span>
                    </span>
                    {oscarFilter === 'wins' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOscarFilter(oscarFilter === 'nominations' ? null : 'nominations');
                      setOpenDropdown(null);
                    }}
                    className={`text-xs px-3 py-2 rounded-xl border font-bold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      oscarFilter === 'nominations'
                        ? 'bg-zinc-100 text-slate-950 border-zinc-300 font-black'
                        : 'bg-zinc-900/50 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-zinc-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🎬</span>
                      <span>Indicados ao Oscar</span>
                    </span>
                    {oscarFilter === 'nominations' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Botão rápido "Limpar Todos" na própria linha quando houver filtro ativo */}
            {totalActiveFilterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  clearFilters();
                  setOpenDropdown(null);
                }}
                className="ml-auto text-[10px] font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                Limpar Tudo ({totalActiveFilterCount})
              </button>
            )}
          </div>

          {/* Faixa enxuta de Chips Ativos (aparece somente quando há filtros marcados nos dropdowns) */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-zinc-900/80">
              <span className="text-[9px] uppercase font-black tracking-wider text-zinc-500 mr-1">
                Ativos:
              </span>
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/15 hover:bg-rose-500/20 text-amber-300 hover:text-rose-300 border border-amber-500/30 hover:border-rose-500/40 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                  title="Clique para remover este filtro"
                >
                  <span>{chip.label}</span>
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Detalhado do Nível, Troféus e Extrato Oficial de XP */}
      <LevelDetailsModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        xpStatus={rpgStats.xpStatus}
        catalogStats={rpgStats}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />
    </header>
  );
}
