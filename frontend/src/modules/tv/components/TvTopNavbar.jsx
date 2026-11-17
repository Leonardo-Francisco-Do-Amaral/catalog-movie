import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Plus,
  X,
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
  Building2,
  Tags,
  Users,
  Calendar,
  Check,
  Lock,
} from 'lucide-react';
import TvXpBar from './TvXpBar';
import { TV_KIND_META, TV_STATUS_META } from '../utils/tvApi';

const TV_TABS = [
  { id: 'catalog', label: '⛩️ Catálogo', activeClass: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20' },
  { id: 'analytics', label: '📊 Estatísticas', activeClass: 'bg-pink-500 text-slate-950 shadow-md shadow-pink-500/20' },
  { id: 'studios_league', label: '🏛️ Liga dos Estúdios', activeClass: 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-md shadow-fuchsia-500/20' },
  { id: 'voice_album', label: '🎙️ Álbum de Dubladores', activeClass: 'bg-purple-500 text-white shadow-md shadow-purple-500/20' },
  { id: 'trophies', label: '🏆 Troféus', activeClass: 'bg-fuchsia-500 text-white shadow-md shadow-fuchsia-500/20' },
];

export default function TvTopNavbar({
  modeSwitcher = null,
  onLockApp = null,
  activeTab = 'catalog',
  setActiveTab = () => {},
  searchQuery = '',
  setSearchQuery = () => {},
  kindFilter = 'all',
  setKindFilter = () => {},
  statusFilter = 'all',
  setStatusFilter = () => {},
  selectedDemographics = [],
  toggleDemographic = () => {},
  selectedGenres = [],
  toggleGenre = () => {},
  selectedStudios = [],
  toggleStudio = () => {},
  selectedStaff = [],
  toggleStaff = () => {},
  selectedYears = [],
  toggleYear = () => {},
  clearCategory = () => {},
  clearAllFilters = () => {},
  filterOptions = {},
  xpStatus = null,
  onAddShow = () => {},
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const staffOptions = useMemo(() => {
    const combined = new Set([
      ...(filterOptions.creators || []),
      ...(filterOptions.directors || []),
    ]);
    return Array.from(combined).sort((a, b) => a.localeCompare(b, 'pt'));
  }, [filterOptions]);

  const filterDropdowns = useMemo(
    () => [
      {
        key: 'demographics',
        label: 'Demografia (Tipo)',
        shortLabel: 'Demografia',
        icon: Sparkles,
        options: filterOptions.demographics || [],
        selected: selectedDemographics,
        toggle: toggleDemographic,
        align: 'left',
      },
      {
        key: 'genres',
        label: 'Gêneros',
        shortLabel: 'Gêneros',
        icon: Tags,
        options: filterOptions.genres || [],
        selected: selectedGenres,
        toggle: toggleGenre,
        align: 'left',
      },
      {
        key: 'studios',
        label: 'Estúdios',
        shortLabel: 'Estúdios',
        icon: Building2,
        options: filterOptions.studios || [],
        selected: selectedStudios,
        toggle: toggleStudio,
        align: 'left',
      },
      {
        key: 'staff',
        label: 'Autor / Direção',
        shortLabel: 'Autor/Dir.',
        icon: Users,
        options: staffOptions,
        selected: selectedStaff,
        toggle: toggleStaff,
        align: 'right',
      },
      {
        key: 'years',
        label: 'Ano de Estreia',
        shortLabel: 'Ano',
        icon: Calendar,
        options: (filterOptions.years || []).map(String),
        selected: selectedYears.map(String),
        toggle: (v) => toggleYear(Number(v)),
        align: 'right',
      },
    ],
    [
      filterOptions,
      selectedDemographics,
      toggleDemographic,
      selectedGenres,
      toggleGenre,
      selectedStudios,
      toggleStudio,
      staffOptions,
      selectedStaff,
      toggleStaff,
      selectedYears,
      toggleYear,
    ]
  );

  const activeChips = useMemo(() => {
    const chips = [];
    if (kindFilter !== 'all') {
      const m = TV_KIND_META[kindFilter];
      chips.push({ key: 'kind', label: `${m?.icon || ''} ${m?.label || kindFilter}`, onRemove: () => setKindFilter('all') });
    }
    if (statusFilter !== 'all') {
      const s = TV_STATUS_META[statusFilter];
      chips.push({ key: 'status', label: `${s?.icon || ''} ${s?.label || statusFilter}`, onRemove: () => setStatusFilter('all') });
    }
    selectedDemographics.forEach((v) => chips.push({ key: `demo-${v}`, label: `Tipo: ${v}`, onRemove: () => toggleDemographic(v) }));
    selectedGenres.forEach((v) => chips.push({ key: `gen-${v}`, label: `Gênero: ${v}`, onRemove: () => toggleGenre(v) }));
    selectedStudios.forEach((v) => chips.push({ key: `stu-${v}`, label: `Estúdio: ${v}`, onRemove: () => toggleStudio(v) }));
    selectedStaff.forEach((v) => chips.push({ key: `stf-${v}`, label: `Autor/Dir: ${v}`, onRemove: () => toggleStaff(v) }));
    selectedYears.forEach((v) => chips.push({ key: `yr-${v}`, label: `Ano: ${v}`, onRemove: () => toggleYear(v) }));
    return chips;
  }, [
    kindFilter,
    statusFilter,
    selectedDemographics,
    selectedGenres,
    selectedStudios,
    selectedStaff,
    selectedYears,
    setKindFilter,
    setStatusFilter,
    toggleDemographic,
    toggleGenre,
    toggleStudio,
    toggleStaff,
    toggleYear,
  ]);

  const handleToggleDropdown = (key) => {
    setDropdownSearch('');
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-40 w-full bg-zinc-950/90 backdrop-blur-xl border-b border-pink-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.65)]"
    >
      {/* LINHA 1: Brand + Seletor de Modo + Abas Exclusivas + Busca + XP Sakura + Nova Obra */}
      <div className="px-3 sm:px-6 lg:px-10 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap max-w-full min-w-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-black px-2 py-1 rounded tracking-widest uppercase shadow-md shadow-pink-500/20">
              OTAKU &amp; SÉRIES
            </div>
            <h1 className="text-sm sm:text-lg font-black tracking-wide bg-gradient-to-r from-pink-200 via-zinc-100 to-purple-300 bg-clip-text text-transparent">
              ANIME &amp; TV CATALOG
            </h1>
          </button>

          {modeSwitcher}

          {/* Abas exclusivas do módulo Animes & Séries */}
          <div className="w-full md:w-auto max-w-full overflow-x-auto scrollbar-hide flex items-center flex-nowrap md:flex-wrap gap-1 bg-zinc-900/75 p-1 rounded-xl border border-pink-500/20">
            {TV_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setOpenDropdown(null);
                }}
                className={`px-3 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === tab.id ? tab.activeClass : 'text-zinc-400 hover:text-pink-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Busca rápida */}
        <div className="flex-1 min-w-0 md:min-w-[220px] max-w-md mx-auto lg:mx-4 order-3 md:order-2 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400/80 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'catalog' && e.target.value.trim()) {
                  setActiveTab('catalog');
                }
              }}
              placeholder="Buscar título, estúdio, autor ou música..."
              className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-pink-500/60 rounded-xl py-2 pl-10 pr-8 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-pink-500/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 p-0.5 cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Direita: XP Sakura + Filtros Mobile + Botão Nova Obra */}
        <div className="flex items-center gap-2.5 order-2 md:order-3">
          <TvXpBar xpStatus={xpStatus} />

          {activeTab === 'catalog' && (
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((prev) => !prev)}
              className={`lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-black uppercase tracking-wider cursor-pointer ${
                mobileFiltersOpen || activeChips.length > 0
                  ? 'bg-pink-500/15 border-pink-500/45 text-pink-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtros</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAddShow}
            className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-pink-500/20 hover:scale-[1.02] cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Adicionar Obra</span>
            <span className="sm:hidden">Nova</span>
          </button>

          {onLockApp && (
            <button
              type="button"
              onClick={onLockApp}
              title="Bloquear acesso ao catálogo (PIN)"
              aria-label="Bloquear acesso ao catálogo"
              className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-pink-500/40 text-zinc-400 hover:text-pink-300 transition-colors cursor-pointer shrink-0"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* LINHA 2: Filtros de Tipo, Status e Dropdowns (apenas no Catálogo) */}
      {activeTab === 'catalog' && (
        <div
          className={`${
            mobileFiltersOpen ? 'flex' : 'hidden lg:flex'
          } flex-col border-t border-pink-500/10 bg-zinc-950/70 px-4 sm:px-6 lg:px-10 py-2.5 gap-2`}
        >
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro rápido de Tipo */}
            <div className="max-w-full overflow-x-auto scrollbar-hide inline-flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800/80">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'anime', label: '⛩️ Animes' },
                { id: 'series', label: '📺 Séries' },
                { id: 'dorama', label: '🌸 Doramas' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setKindFilter(opt.id)}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    kindFilter === opt.id
                      ? 'bg-pink-500 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Filtro rápido de Status */}
            <div className="max-w-full overflow-x-auto scrollbar-hide inline-flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800/80">
              {[
                { id: 'all', label: 'Qualquer Status' },
                { id: 'watching', label: '▶️ Assistindo' },
                { id: 'completed', label: '✅ Concluída' },
                { id: 'on_hold', label: '⏸️ Hiato' },
                { id: 'dropped', label: '✖️ Dropada' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Dropdowns Dinâmicos */}
            {filterDropdowns.map((cat) => {
              const Icon = cat.icon;
              const isOpen = openDropdown === cat.key;
              const count = cat.selected.length;
              const isActive = count > 0;
              const filteredOpts = dropdownSearch.trim()
                ? cat.options.filter((opt) =>
                    opt.toLowerCase().includes(dropdownSearch.toLowerCase().trim())
                  )
                : cat.options;

              return (
                <div key={cat.key} className="relative">
                  <button
                    type="button"
                    onClick={() => handleToggleDropdown(cat.key)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-pink-500/15 border-pink-500/50 text-pink-200'
                        : isOpen
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive || isOpen ? 'text-pink-400' : 'text-zinc-400'}`} />
                    <span>{cat.shortLabel}</span>
                    {isActive && (
                      <span className="bg-pink-500 text-white text-[9px] font-black px-1.5 rounded-full">
                        {count}
                      </span>
                    )}
                    <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180 text-pink-400' : 'text-zinc-500'}`} />
                  </button>

                  {isOpen && (
                    <div
                      className={`max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-44 max-sm:w-auto sm:absolute sm:top-full mt-2 w-64 sm:w-72 max-w-[calc(100vw-1.5rem)] bg-zinc-950/98 backdrop-blur-2xl border border-pink-500/30 rounded-2xl p-3.5 shadow-2xl z-50 flex flex-col gap-2.5 ${
                        cat.align === 'right' ? 'sm:right-0' : 'sm:left-0'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-zinc-100">
                          {cat.label}
                        </span>
                        {isActive && (
                          <button
                            type="button"
                            onClick={() => clearCategory(cat.key)}
                            className="text-[10px] font-black uppercase text-pink-400 hover:underline cursor-pointer"
                          >
                            Limpar ({count})
                          </button>
                        )}
                      </div>

                      {cat.options.length > 6 && (
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                          <input
                            type="text"
                            value={dropdownSearch}
                            onChange={(e) => setDropdownSearch(e.target.value)}
                            placeholder="Filtrar opções..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-zinc-200 focus:outline-none focus:border-pink-500/50"
                          />
                        </div>
                      )}

                      <div className="max-h-56 overflow-y-auto tv-sakura-scroll space-y-1 pr-1">
                        {filteredOpts.length === 0 ? (
                          <p className="text-xs text-zinc-500 py-3 text-center">Nenhuma opção ainda.</p>
                        ) : (
                          filteredOpts.map((opt) => {
                            const checked = cat.selected.includes(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => cat.toggle(opt)}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                                  checked
                                    ? 'bg-pink-500/20 text-pink-200 font-bold'
                                    : 'text-zinc-300 hover:bg-zinc-900'
                                }`}
                              >
                                <span className="truncate">{opt}</span>
                                {checked && <Check className="w-3.5 h-3.5 text-pink-400 shrink-0" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Chips Ativos */}
          {(activeChips.length > 0 || searchQuery.trim()) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1.5 bg-pink-500/15 border border-pink-500/35 text-pink-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  Busca: "{searchQuery}"
                  <button type="button" onClick={() => setSearchQuery('')} className="hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {activeChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1.5 bg-purple-500/15 border border-purple-500/35 text-purple-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                >
                  {chip.label}
                  <button type="button" onClick={chip.onRemove} className="hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[11px] font-black uppercase tracking-wider text-pink-400 hover:text-pink-300 ml-1 cursor-pointer"
              >
                Limpar tudo
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
