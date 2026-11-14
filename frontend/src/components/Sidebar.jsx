import React, { useState } from 'react';
import { Search, Filter, X, Menu, ChevronDown, Film, Globe, Volume2, Plus, Target, Shield, Tv, Trophy, Headphones, Video, Building, Package, PenTool, Sparkles, Award } from 'lucide-react';import { useMemo } from 'react';

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

export default function Sidebar({
  searchQuery,
  setSearchQuery,
  
  // Tags Customizadas
  selectedTags,
  toggleTag,
  allTags = [],
  
  // Gêneros Oficiais
  selectedGenres,
  toggleGenre,
  allGenres = [],
  
  // País de Origem
  selectedCountries,
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
  selectedAudios,
  toggleAudio,
  allAudios = [],
  
  clearFilters,
  onAddMovie,
  activeTab = 'catalog',
  setActiveTab = () => {},
  movies = []
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Lógica de RPG / Ficha de Personagem baseada no catálogo
  const rpgStats = useMemo(() => {
    const totalMovies = movies.length;
    let totalMinutes = 0;
    let ratingSum = 0;
    let ratingCount = 0;

    const genreCounts = {};
    const directorCounts = {};
    const writerCounts = {};
    let hasOscarWins = false;
    let hasLongMovie = false;
    const countriesSet = new Set();
    let hasPerfectRating = false;

    movies.forEach(m => {
      if (m.runtime) totalMinutes += Number(m.runtime);
      const r = Number(m.user_rating);
      if (r > 0) {
        ratingSum += r;
        ratingCount++;
        if (r >= 10 || r <= 1) hasPerfectRating = true;
      }
      
      const genresList = m.genres || [];
      genresList.forEach(g => {
        if (g && g.trim()) {
          const name = g.trim();
          genreCounts[name] = (genreCounts[name] || 0) + 1;
        }
      });

      const directorName = m.director || (m.directors && m.directors.length > 0 ? m.directors[0] : null);
      if (directorName) {
        directorCounts[directorName] = (directorCounts[directorName] || 0) + 1;
      }

      if ((Number(m.oscar_wins) || 0) > 0) hasOscarWins = true;
      if ((Number(m.runtime) || 0) >= 185) hasLongMovie = true;

      const countriesList = m.countries || [];
      countriesList.forEach(c => {
        if (c && c.trim()) countriesSet.add(c.trim());
      });

      const writersList = Array.isArray(m.writers) 
        ? m.writers 
        : typeof m.writers === 'string' 
          ? m.writers.split(',').map(x => x.trim()) 
          : [];
      writersList.forEach(w => {
        if (w && w.trim()) {
          const name = w.trim();
          writerCounts[name] = (writerCounts[name] || 0) + 1;
        }
      });
    });

    const totalHours = Math.round(totalMinutes / 60);
    const avgRating = ratingCount > 0 ? (ratingSum / ratingCount) : 0;

    // Achar gênero principal
    let topGenre = '';
    let maxGenre = 0;
    Object.keys(genreCounts).forEach(g => {
      if (genreCounts[g] > maxGenre) {
        maxGenre = genreCounts[g];
        topGenre = g;
      }
    });

    // Achar diretor principal
    let topDirector = '';
    let maxDirector = 0;
    Object.keys(directorCounts).forEach(d => {
      if (directorCounts[d] > maxDirector) {
        maxDirector = directorCounts[d];
        topDirector = d;
      }
    });

    // Achar roteirista principal
    let topWriter = '';
    let maxWriter = 0;
    Object.keys(writerCounts).forEach(w => {
      if (writerCounts[w] > maxWriter) {
        maxWriter = writerCounts[w];
        topWriter = w;
      }
    });

    const xp = totalMovies * 100 + totalMinutes * 2;
    const level = Math.floor(Math.sqrt(xp / 200)) + 1;
    const nextLevelXp = Math.pow(level, 2) * 200;
    const prevLevelXp = Math.pow(level - 1, 2) * 200;
    const xpPercentage = Math.min(100, Math.max(0, ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100));

    let className = 'Cine-Aprendiz 🍿';
    if (totalMovies > 100) className = 'Cinéfilo Lendário 👑';
    else if (totalMovies > 50) className = 'Crítico Veterano 🎬';
    else if (totalMovies > 20) className = 'Cine-Aventureiro 🍿';

    return {
      totalMovies,
      totalHours,
      avgRating,
      topGenre: topGenre ? `${topGenre} (${maxGenre}x)` : 'N/A',
      topDirector: topDirector ? `${topDirector} (${maxDirector}x)` : 'N/A',
      topWriter: topWriter ? `${topWriter} (${maxWriter}x)` : 'N/A',
      xp,
      level,
      nextLevelXp,
      xpPercentage,
      className
    };
  }, [movies]);

  // Estados locais para controlar abertura de cada seção do Accordion
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [isGenresOpen, setIsGenresOpen] = useState(false);
  const [isCountriesOpen, setIsCountriesOpen] = useState(false);
  const [isDirectorsOpen, setIsDirectorsOpen] = useState(false);
  const [isWritersOpen, setIsWritersOpen] = useState(false);
  const [isStudiosOpen, setIsStudiosOpen] = useState(false);
  const [isDistributorsOpen, setIsDistributorsOpen] = useState(false);
  const [isPlatformsOpen, setIsPlatformsOpen] = useState(false);
  const [isOscarsOpen, setIsOscarsOpen] = useState(false);
  const [isAudioOpen, setIsAudioOpen] = useState(false);

  const hasAnyFilterActive = 
    selectedTags.length > 0 || 
    selectedGenres.length > 0 || 
    selectedCountries.length > 0 || 
    selectedAudios.length > 0 || 
    selectedPlatforms.length > 0 ||
    selectedDirectors.length > 0 ||
    selectedWriters.length > 0 ||
    selectedStudios.length > 0 ||
    selectedDistributors.length > 0 ||
    oscarFilter !== null ||
    searchQuery.trim() !== '';

  return (
    <>
      {/* Botão de Menu para Dispositivos Móveis */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-amber-500 hover:bg-amber-600 text-slate-950 p-3.5 rounded-full shadow-lg border border-amber-400 flex items-center justify-center transition-all duration-300"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-800/80 p-6 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-6 overflow-y-auto max-h-[85vh] scrollbar-hide pr-1">
          {/* Logo / Header */}
          <div className="flex flex-col gap-4 border-b border-zinc-800/80 pb-6">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-1.5 rounded tracking-widest uppercase">
                CRÍTICO
              </div>
              <h1 className="text-lg font-black tracking-wide bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                CINE CATALOG
              </h1>
            </div>
            
            {/* Botão Adicionar Filme */}
            <button
              onClick={onAddMovie}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/10 hover:scale-[1.01] mb-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Filme
            </button>

            {/* Alternador de Abas (HUD Gamer) */}
            <div className="grid grid-cols-2 gap-1.5 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/40">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('catalog');
                  setIsOpen(false);
                }}
                className={`py-2 text-[9px] uppercase font-black tracking-widest rounded-lg transition-all duration-300 cursor-pointer ${
                  activeTab === 'catalog'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/5'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                🎥 Catálogo
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('analytics');
                  setIsOpen(false);
                }}
                className={`py-2 text-[9px] uppercase font-black tracking-widest rounded-lg transition-all duration-300 cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/5'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                📊 Estatísticas
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('universes');
                setIsOpen(false);
              }}
              className={`w-full py-2 text-[9px] uppercase font-black tracking-widest rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'universes'
                  ? 'bg-indigo-400 text-slate-950 font-black shadow-md shadow-indigo-500/20'
                  : 'text-indigo-300/85 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/15'
              }`}
            >
              <span>🌌 Códice dos Universos</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('avatar_lab');
                setIsOpen(false);
              }}
              className={`w-full py-2 text-[9px] uppercase font-black tracking-widest rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'avatar_lab'
                  ? 'bg-purple-500 text-slate-950 font-black shadow-md shadow-purple-500/20'
                  : 'text-purple-300/80 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/15'
              }`}
            >
              <span>🍿 Avatar Lab</span>
              <span className="text-[7px] bg-purple-400 text-slate-950 px-1 py-0.2 rounded font-black">
                TESTE
              </span>
            </button>
          </div>

          {activeTab === 'catalog' ? (
            <>
              {/* Barra de Pesquisa (Fixo no topo da Sidebar) */}
              <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 flex items-center gap-1.5">
              <Search className="w-3 h-3 text-amber-500" />
              Buscar Filme
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Título ou diretor..."
                className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-amber-500/50 rounded-lg py-2.5 pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all duration-300"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
            </div>
          </div>

          {/* Cabeçalho de Ações Globais de Filtro */}
          {hasAnyFilterActive && (
            <div className="flex justify-between items-center bg-zinc-900/35 border border-zinc-800/50 rounded-lg px-3 py-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Filtros Ativos</span>
              <button
                onClick={clearFilters}
                className="text-[10px] text-amber-500 hover:text-amber-400 hover:underline uppercase font-black tracking-wider transition-colors"
              >
                Limpar Todos
              </button>
            </div>
          )}

          {/* Seção Colapsável: Minhas Tags */}
          <div className="border-b border-zinc-900 pb-4">
            <button
              onClick={() => setIsTagsOpen(!isTagsOpen)}
              className="w-full flex items-center justify-between py-1 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span className="text-xs uppercase font-black tracking-widest flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-amber-500" />
                Minhas Tags
              </span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${
                  isTagsOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isTagsOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-hide min-h-0">
                  {allTags.length === 0 ? (
                    <span className="text-xs text-zinc-600 italic">Nenhuma tag...</span>
                  ) : (
                    allTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`text-xs px-2.5 py-1.5 rounded-md border font-semibold transition-all duration-300 ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-bold scale-[1.02]'
                              : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seção Colapsável: Gêneros Oficiais */}
          <div className="border-b border-zinc-900 pb-4">
            <button
              onClick={() => setIsGenresOpen(!isGenresOpen)}
              className="w-full flex items-center justify-between py-1 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span className="text-xs uppercase font-black tracking-widest flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                Gêneros Oficiais
              </span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${
                  isGenresOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isGenresOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-hide min-h-0">
                  {allGenres.length === 0 ? (
                    <span className="text-xs text-zinc-600 italic">Nenhum gênero...</span>
                  ) : (
                    allGenres.map((genre) => {
                      const isSelected = selectedGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          onClick={() => toggleGenre(genre)}
                          className={`text-xs px-2.5 py-1.5 rounded-md border font-semibold transition-all duration-300 ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-bold scale-[1.02]'
                              : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          {genre}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seção Colapsável: País de Origem */}
          <div className="border-b border-zinc-900 pb-4">
            <button
              onClick={() => setIsCountriesOpen(!isCountriesOpen)}
              className="w-full flex items-center justify-between py-1 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span className="text-xs uppercase font-black tracking-widest flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                País de Origem
              </span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${
                  isCountriesOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isCountriesOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-hide min-h-0">
                  {allCountries.length === 0 ? (
                    <span className="text-xs text-zinc-600 italic">Nenhum país...</span>
                  ) : (
                    [...allCountries]
                      .sort((a, b) => {
                        if (a === 'Desconhecido') return 1;
                        if (b === 'Desconhecido') return -1;
                        return a.localeCompare(b, 'pt');
                      })
                      .map((countryName) => {
                        const isSelected = selectedCountries.includes(countryName);
                        const isDesconhecido = countryName === 'Desconhecido';
                        const flagUrl = getFlagUrl(countryName);
                        return (
                          <button
                            key={countryName}
                            onClick={() => toggleCountry(countryName)}
                            className={`text-xs px-3 py-2 rounded-lg border font-semibold flex items-center gap-2 transition-all duration-300 text-left ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-bold scale-[1.01]'
                                : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                            }`}
                          >
                            {isDesconhecido || !flagUrl ? (
                              <span className="text-xs shrink-0">🌐</span>
                            ) : (
                              <img 
                                src={flagUrl} 
                                alt={countryName} 
                                className="w-4.5 h-3 object-cover rounded-sm border border-zinc-800 shrink-0"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                            <span className="truncate">{countryName}</span>
                          </button>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seção Colapsável: Diretores Frequentes */}
          <div className="border-b border-zinc-900 pb-4">
            <button
              onClick={() => setIsDirectorsOpen(!isDirectorsOpen)}
              className="w-full flex items-center justify-between py-1 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span className="text-xs uppercase font-black tracking-widest flex items-center gap-2">
                <Video className="w-3.5 h-3.5 text-amber-500" />
                Diretores Frequentes
              </span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${
                  isDirectorsOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isDirectorsOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-hide min-h-0">
                  {frequentDirectors.length === 0 ? (
                    <span className="text-xs text-zinc-650 italic">Nenhum diretor...</span>
                  ) : (
                    frequentDirectors.map((director) => {
                      const isSelected = selectedDirectors.includes(director);
                      return (
                        <button
                          key={director}
                          onClick={() => toggleDirector(director)}
                          className={`text-xs px-2.5 py-1.5 rounded-md border font-semibold transition-all duration-300 ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-bold scale-[1.02]'
                              : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          {director}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seção Colapsável: Roteiristas Frequentes */}
          <div className="border-b border-zinc-900 pb-4">
            <button
              onClick={() => setIsWritersOpen(!isWritersOpen)}
              className="w-full flex items-center justify-between py-1 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span className="text-xs uppercase font-black tracking-widest flex items-center gap-2">
                <PenTool className="w-3.5 h-3.5 text-amber-500" />
                Roteiristas Frequentes
              </span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${
                  isWritersOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isWritersOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-hide min-h-0">
                  {frequentWriters.length === 0 ? (
                    <span className="text-xs text-zinc-650 italic">Nenhum roteirista...</span>
                  ) : (
                    frequentWriters.map((writer) => {
                      const isSelected = selectedWriters.includes(writer);
                      return (
                        <button
                          key={writer}
                          onClick={() => toggleWriter(writer)}
                          className={`text-xs px-2.5 py-1.5 rounded-md border font-semibold transition-all duration-300 ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-bold scale-[1.02]'
                              : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          {writer}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seção Colapsável: Estúdios Frequentes */}
          <div className="border-b border-zinc-900 pb-4">
            <button
              onClick={() => setIsStudiosOpen(!isStudiosOpen)}
              className="w-full flex items-center justify-between py-1 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span className="text-xs uppercase font-black tracking-widest flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-amber-500" />
                Estúdios Frequentes
              </span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${
                  isStudiosOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isStudiosOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-hide min-h-0">
                  {frequentStudios.length === 0 ? (
                    <span className="text-xs text-zinc-650 italic">Nenhum estúdio...</span>
                  ) : (
                    frequentStudios.map((studio) => {
                      const isSelected = selectedStudios.includes(studio);
                      return (
                        <button
                          key={studio}
                          onClick={() => toggleStudio(studio)}
                          className={`text-xs px-2.5 py-1.5 rounded-md border font-semibold transition-all duration-300 ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-bold scale-[1.02]'
                              : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          {studio}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seção Colapsável: Distribuidoras Frequentes */}
          <div className="border-b border-zinc-900 pb-4">
            <button
              onClick={() => setIsDistributorsOpen(!isDistributorsOpen)}
              className="w-full flex items-center justify-between py-1 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span className="text-xs uppercase font-black tracking-widest flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-amber-500" />
                Distribuidoras Frequentes
              </span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${
                  isDistributorsOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isDistributorsOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-hide min-h-0">
                  {frequentDistributors.length === 0 ? (
                    <span className="text-xs text-zinc-650 italic">Nenhuma distribuidora...</span>
                  ) : (
                    frequentDistributors.map((dist) => {
                      const isSelected = selectedDistributors.includes(dist);
                      return (
                        <button
                          key={dist}
                          onClick={() => toggleDistributor(dist)}
                          className={`text-xs px-2.5 py-1.5 rounded-md border font-semibold transition-all duration-300 ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-bold scale-[1.02]'
                              : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          {dist}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seção Colapsável: Visto Em (Plataforma) */}
          <div className="border-b border-zinc-900 pb-4">
            <button
              onClick={() => setIsPlatformsOpen(!isPlatformsOpen)}
              className="w-full flex items-center justify-between py-1 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span className="text-xs uppercase font-black tracking-widest flex items-center gap-2">
                <Tv className="w-3.5 h-3.5 text-amber-500" />
                Visto Em (Plataforma)
              </span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${
                  isPlatformsOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isPlatformsOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-hide min-h-0">
                  {allPlatforms.length === 0 ? (
                    <span className="text-xs text-zinc-650 italic">Nenhuma plataforma...</span>
                  ) : (
                    allPlatforms.map((platform) => {
                      const isSelected = selectedPlatforms.includes(platform);
                      return (
                        <button
                          key={platform}
                          onClick={() => togglePlatform(platform)}
                          className={`text-xs px-2.5 py-1.5 rounded-md border font-semibold transition-all duration-300 ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-bold scale-[1.02]'
                              : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          {platform}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seção Colapsável: Premiações (Especial) */}
          <div className="border-b border-zinc-900 pb-4">
            <button
              onClick={() => setIsOscarsOpen(!isOscarsOpen)}
              className="w-full flex items-center justify-between py-1 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span className="text-xs uppercase font-black tracking-widest flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Premiações (Oscar)
              </span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${
                  isOscarsOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOscarsOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-2 min-h-0 pb-1">
                  <button
                    onClick={() => setOscarFilter(oscarFilter === 'wins' ? null : 'wins')}
                    className={`text-xs px-3 py-2 rounded-lg border font-bold flex items-center gap-2 transition-all duration-300 ${
                      oscarFilter === 'wins'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)] font-black scale-[1.01]'
                        : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-amber-400 hover:border-amber-500/30'
                    }`}
                  >
                    <span>🏆</span>
                    <span>Ganhadores do Oscar</span>
                  </button>
                  <button
                    onClick={() => setOscarFilter(oscarFilter === 'nominations' ? null : 'nominations')}
                    className={`text-xs px-3 py-2 rounded-lg border font-bold flex items-center gap-2 transition-all duration-300 ${
                      oscarFilter === 'nominations'
                        ? 'bg-zinc-100 text-slate-950 border-zinc-300 shadow-[0_0_12px_rgba(255,255,255,0.15)] font-black scale-[1.01]'
                        : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <span>🎬</span>
                    <span>Indicados ao Oscar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Colapsável: Tipo de Áudio */}
          <div className="pb-4">
            <button
              onClick={() => setIsAudioOpen(!isAudioOpen)}
              className="w-full flex items-center justify-between py-1 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span className="text-xs uppercase font-black tracking-widest flex items-center gap-2">
                <Headphones className="w-3.5 h-3.5 text-amber-500" />
                Tipo de Áudio
              </span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${
                  isAudioOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isAudioOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-1.5 min-h-0">
                  {allAudios.length === 0 ? (
                    <span className="text-xs text-zinc-600 italic">Nenhum áudio...</span>
                  ) : (
                    allAudios.map((audio) => {
                      const isSelected = selectedAudios.includes(audio);
                      return (
                        <button
                          key={audio}
                          onClick={() => toggleAudio(audio)}
                          className={`text-xs px-3 py-2 rounded-lg border font-semibold text-center transition-all duration-300 ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-bold scale-[1.01]'
                              : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          {audio}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-5 py-2 animate-fade-in">
          <div className="border border-zinc-800/80 bg-zinc-900/40 p-4 rounded-2xl flex flex-col gap-4 relative overflow-hidden group shadow-lg">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-12 h-12 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-colors"></div>
            
            {/* Cabeçalho do Personagem */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase font-black text-amber-500 tracking-widest">Ficha de Cineasta</span>
              <span className="text-sm font-black text-zinc-100 uppercase tracking-wide truncate">{rpgStats.className}</span>
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Classificação de Crítico</span>
            </div>

            {/* Level e XP */}
            <div className="flex flex-col gap-1.5 border-t border-zinc-800/80 pt-3">
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-zinc-300">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  Nível {rpgStats.level}
                </span>
                <span className="text-zinc-500">{rpgStats.xp} / {rpgStats.nextLevelXp} XP</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-zinc-950 h-2 rounded-full border border-zinc-850 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${rpgStats.xpPercentage}%` }}
                />
              </div>
            </div>

            {/* Substats */}
            <div className="grid grid-cols-2 gap-2 border-t border-zinc-800/80 pt-3">
              <div className="flex flex-col gap-0.5 bg-zinc-950/60 p-2 rounded-xl border border-zinc-900">
                <span className="text-[8px] uppercase text-zinc-500 font-black tracking-wide">Total Visto</span>
                <span className="text-[11px] font-black text-zinc-200">{rpgStats.totalMovies} Filmes</span>
              </div>
              <div className="flex flex-col gap-0.5 bg-zinc-950/60 p-2 rounded-xl border border-zinc-900">
                <span className="text-[8px] uppercase text-zinc-500 font-black tracking-wide">Tempo Total</span>
                <span className="text-[11px] font-black text-zinc-200">{rpgStats.totalHours} Horas</span>
              </div>
            </div>
          </div>

          {/* Specialties / Atributos */}
          <div className="border border-zinc-800/80 bg-zinc-900/40 p-4 rounded-2xl flex flex-col gap-3 shadow-lg">
            <span className="text-[9px] uppercase font-black text-zinc-400 tracking-widest border-b border-zinc-800/50 pb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-500" />
              Atributos & Foco
            </span>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500 font-bold uppercase tracking-wider">Gênero Favorito</span>
                <span className="text-amber-500 font-black uppercase text-[10px]">{rpgStats.topGenre || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] border-t border-zinc-800/50 pt-2">
                <span className="text-zinc-500 font-bold uppercase tracking-wider">Diretor Frequente</span>
                <span className="text-amber-500 font-black uppercase text-[10px] truncate max-w-[120px] text-right">{rpgStats.topDirector || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] border-t border-zinc-800/50 pt-2">
                <span className="text-zinc-500 font-bold uppercase tracking-wider">Roteirista Frequente</span>
                <span className="text-amber-500 font-black uppercase text-[10px] truncate max-w-[120px] text-right">{rpgStats.topWriter || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

    {/* Rodapé da Sidebar */}
    <div className="border-t border-zinc-800/80 pt-6 text-[10px] text-zinc-600 flex flex-col gap-1 text-center font-medium tracking-wide shrink-0">
          <span>Portfólio de Engenharia</span>
          <span className="text-amber-500/50 font-bold">Catálogo Crítico de Filmes</span>
          <span>© 2026 - Desenvolvido com React</span>
        </div>
      </aside>

      {/* Overlay para fechar no Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}
