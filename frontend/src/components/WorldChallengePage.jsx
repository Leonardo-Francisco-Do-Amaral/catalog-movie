import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { triggerPS5TrophyToast } from './PS5TrophyToastContainer';
import {
  triggerXPGainToast,
  dispatchXpStatusUpdate,
  calculateClientXpStatus,
  computeXpGainEvent
} from '../utils/xpSystem';
import {
  Globe,
  Map as MapIcon,
  LayoutGrid,
  Trophy,
  Star,
  Target,
  Search,
  Lock,
  Pin,
  History,
  Crown,
  CheckCircle2,
  X,
  RefreshCw,
  Film,
  Compass,
  Swords,
  Flag,
  AlertCircle,
  ArrowRightLeft,
  RotateCcw,
  Check
} from 'lucide-react';
import { UN_COUNTRIES_195, HISTORICAL_TERRITORIES } from '../data/unCountries195';
import {
  RARITY_ORDER,
  RARITY_RANK_WEIGHT,
  RARITY_TIER_CONFIG,
  getRarityMeta,
  getCountryRarityTier
} from '../data/countryRarityTiers';
import TacticalWorldMap from './TacticalWorldMap';
import CountryInspectionDrawer from './CountryInspectionDrawer';
import HistoricalTerritoriesDrawer from './HistoricalTerritoriesDrawer';

const API_BASE_URL = 'http://localhost:5000/api';

const CONTINENTS = ['Todos', 'Américas', 'Europa', 'Ásia', 'África', 'Oceania'];

const cleanStr = (str) =>
  str
    ? String(str)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    : '';

const resolvePosterUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
  return url;
};

// Patentes / Ranks de Explorador Cinematográfico (Estilo RPG / War Room)
function getExplorerRank(conqueredCount) {
  if (conqueredCount >= 195) {
    return {
      level: 7,
      title: 'Soberano dos 195 Territórios',
      nextAt: 195,
      badgeClass: 'text-amber-300 border-amber-400/60 bg-amber-500/20'
    };
  }
  if (conqueredCount >= 150) {
    return {
      level: 6,
      title: 'Lenda Sem Fronteiras',
      nextAt: 195,
      badgeClass: 'text-amber-300 border-amber-500/50 bg-amber-500/15'
    };
  }
  if (conqueredCount >= 100) {
    return {
      level: 5,
      title: 'Comandante Geopolítico',
      nextAt: 150,
      badgeClass: 'text-purple-300 border-purple-500/50 bg-purple-500/15'
    };
  }
  if (conqueredCount >= 50) {
    return {
      level: 4,
      title: 'Embaixador Intercontinental',
      nextAt: 100,
      badgeClass: 'text-cyan-300 border-cyan-500/50 bg-cyan-500/15'
    };
  }
  if (conqueredCount >= 25) {
    return {
      level: 3,
      title: 'Cartógrafo da Sétima Arte',
      nextAt: 50,
      badgeClass: 'text-emerald-300 border-emerald-500/50 bg-emerald-500/15'
    };
  }
  if (conqueredCount >= 10) {
    return {
      level: 2,
      title: 'Mochileiro de Festival',
      nextAt: 25,
      badgeClass: 'text-emerald-400 border-emerald-500/35 bg-emerald-500/10'
    };
  }
  return {
    level: 1,
    title: 'Recruta Cartógrafo',
    nextAt: 10,
    badgeClass: 'text-zinc-300 border-zinc-700 bg-zinc-900'
  };
}

// Construtor local de fallback caso o backend esteja offline (respeitando Unicidade Estrita + 5 Tiers)
function buildOfflineChallengePayload(movies = [], localState = {}) {
  const manualPicks = localState.picks || {};
  const manualOrigins = localState.origins || {};
  const wishlists = localState.wishlists || {};

  const unByCode = new Map(UN_COUNTRIES_195.map((c) => [c.code, c]));
  const histByCode = new Map(HISTORICAL_TERRITORIES.map((h) => [h.code, h]));

  const unLookup = new Map();
  UN_COUNTRIES_195.forEach((c) => {
    unLookup.set(cleanStr(c.code), c.code);
    unLookup.set(cleanStr(c.iso3), c.code);
    unLookup.set(cleanStr(c.name), c.code);
    (c.aliases || []).forEach((al) => unLookup.set(cleanStr(al), c.code));
  });

  const histLookup = new Map();
  HISTORICAL_TERRITORIES.forEach((h) => {
    histLookup.set(cleanStr(h.code), h.code);
    histLookup.set(cleanStr(h.name), h.code);
    (h.aliases || []).forEach((al) => histLookup.set(cleanStr(al), h.code));
  });

  const compareCandidates = (a, b) => {
    if (b.user_rating !== a.user_rating) return b.user_rating - a.user_rating;
    if ((b.year_seen || 0) !== (a.year_seen || 0)) return (b.year_seen || 0) - (a.year_seen || 0);
    if ((b.month_seen || 0) !== (a.month_seen || 0)) return (b.month_seen || 0) - (a.month_seen || 0);
    if ((b.release_year || 0) !== (a.release_year || 0)) {
      return (b.release_year || 0) - (a.release_year || 0);
    }
    return (b.movie_id || 0) - (a.movie_id || 0);
  };

  const catalogMap = new Map();
  movies.forEach((m) => {
    const mid = Number(m.movie_id || m.id);
    if (!mid) return;

    const rawCountries = Array.isArray(m.countries) ? m.countries : [];
    const coproductionCountries = [];
    const seen = new Set();

    rawCountries.forEach((rawName) => {
      const cleaned = cleanStr(rawName);
      const u = unLookup.get(cleaned);
      if (u && !seen.has(u)) {
        seen.add(u);
        const uDef = unByCode.get(u);
        coproductionCountries.push({
          code: u,
          name: uDef.name,
          flagCode: u,
          isHistorical: false,
          rarityTier: uDef.rarityTier
        });
      } else {
        const h = histLookup.get(cleaned);
        if (h && !seen.has(h)) {
          seen.add(h);
          const hDef = histByCode.get(h);
          coproductionCountries.push({
            code: h,
            name: hDef.name,
            flagCode: hDef.flagCode || null,
            isHistorical: true
          });
        }
      }
    });

    const isCoproduction =
      coproductionCountries.length > 1 ||
      (rawCountries.length > 1 && coproductionCountries.length >= 1);
    const defaultCountryCode = coproductionCountries[0]?.code || null;
    const manualCode = manualOrigins[mid] || null;
    const primaryCountryCode = isCoproduction ? manualCode : manualCode || defaultCountryCode;
    const primaryCountryName = primaryCountryCode
      ? unByCode.get(primaryCountryCode)?.name ||
        histByCode.get(primaryCountryCode)?.name ||
        primaryCountryCode.toUpperCase()
      : null;

    const item = {
      movie_id: mid,
      view_id: m.id,
      title: m.title,
      original_title: m.original_title || null,
      release_year: m.release_year || null,
      runtime: m.runtime || null,
      poster_url: m.poster_url || null,
      user_rating: m.user_rating !== null && m.user_rating !== undefined ? Number(m.user_rating) : 0,
      imdb_rating: m.imdb_rating || null,
      metacritic_score: m.metacritic_score || null,
      month_seen: m.month_seen || null,
      year_seen: m.year_seen || null,
      watched_at: m.watched_at || null,
      directors: Array.isArray(m.directors) ? m.directors : [],
      countries: rawCountries,
      coproductionCountries,
      defaultCountryCode,
      primaryCountryCode,
      primaryCountryName,
      originMode: manualCode ? 'manual' : 'auto'
    };

    const prev = catalogMap.get(mid);
    if (!prev || compareCandidates(item, prev) < 0) {
      catalogMap.set(mid, item);
    }
  });

  const candidatesByCode = new Map();
  UN_COUNTRIES_195.forEach((c) => candidatesByCode.set(c.code, []));
  HISTORICAL_TERRITORIES.forEach((h) => candidatesByCode.set(h.code, []));

  // Unicidade Estrita: cada filme vai APENAS para seu primaryCountryCode
  catalogMap.forEach((movie) => {
    if (movie.primaryCountryCode && candidatesByCode.has(movie.primaryCountryCode)) {
      candidatesByCode.get(movie.primaryCountryCode).push(movie);
    }
  });

  const champIdByCode = new Map();

  const countriesResult = UN_COUNTRIES_195.map((c) => {
    const cands = [...(candidatesByCode.get(c.code) || [])].sort(compareCandidates);
    const manualId = manualPicks[c.code];
    let champion = null;
    let selectionMode = null;

    if (manualId && cands.some((x) => x.movie_id === Number(manualId))) {
      champion = cands.find((x) => x.movie_id === Number(manualId));
      selectionMode = 'manual';
    } else if (cands.length > 0) {
      champion = cands[0];
      selectionMode = 'auto';
    }

    if (champion) champIdByCode.set(c.code, champion.movie_id);
    const wish = wishlists[c.code] || null;
    const status = champion ? 'conquered' : wish ? 'wishlist' : 'unconquered';

    return {
      ...c,
      rarityTier: c.rarityTier || getCountryRarityTier(c.code),
      status,
      selectionMode,
      champion,
      candidates: cands,
      totalCandidates: cands.length,
      borderDisputes: [],
      wishlist: wish
    };
  });

  const historicalCountries = HISTORICAL_TERRITORIES.map((h) => {
    const cands = [...(candidatesByCode.get(h.code) || [])].sort(compareCandidates);
    const manualId = manualPicks[h.code];
    let champion = null;
    let selectionMode = null;

    if (manualId && cands.some((x) => x.movie_id === Number(manualId))) {
      champion = cands.find((x) => x.movie_id === Number(manualId));
      selectionMode = 'manual';
    } else if (cands.length > 0) {
      champion = cands[0];
      selectionMode = 'auto';
    }

    if (champion) champIdByCode.set(h.code, champion.movie_id);

    return {
      ...h,
      status: champion ? 'conquered' : 'unconquered',
      selectionMode,
      champion,
      candidates: cands,
      totalCandidates: cands.length,
      borderDisputes: []
    };
  });

  // Popula disputas de fronteira
  const disputesByCode = new Map();
  catalogMap.forEach((movie) => {
    if (!movie.primaryCountryCode || movie.coproductionCountries.length <= 1) return;
    const isChampOwner = champIdByCode.get(movie.primaryCountryCode) === movie.movie_id;
    movie.coproductionCountries.forEach((cp) => {
      if (cp.code === movie.primaryCountryCode) return;
      if (!disputesByCode.has(cp.code)) disputesByCode.set(cp.code, []);
      disputesByCode.get(cp.code).push({
        movie,
        allocatedToCode: movie.primaryCountryCode,
        allocatedToName: movie.primaryCountryName,
        isChampionAtOwner: isChampOwner
      });
    });
  });

  countriesResult.forEach((c) => {
    c.borderDisputes = (disputesByCode.get(c.code) || []).sort((a, b) =>
      compareCandidates(a.movie, b.movie)
    );
  });
  historicalCountries.forEach((h) => {
    h.borderDisputes = (disputesByCode.get(h.code) || []).sort((a, b) =>
      compareCandidates(a.movie, b.movie)
    );
  });

  const conqueredCount = countriesResult.filter((c) => c.status === 'conquered').length;
  const wishlistCount = countriesResult.filter((c) => Boolean(c.wishlist)).length;
  const ratedChamps = countriesResult.filter((c) => c.champion && c.champion.user_rating > 0);
  const avgChampionRating =
    ratedChamps.length > 0
      ? Number(
          (
            ratedChamps.reduce((acc, cur) => acc + cur.champion.user_rating, 0) / ratedChamps.length
          ).toFixed(2)
        )
      : 0;

  const continentStats = {};
  ['Américas', 'Europa', 'Ásia', 'África', 'Oceania'].forEach((cont) => {
    const inCont = countriesResult.filter((c) => c.continent === cont);
    const conq = inCont.filter((c) => c.status === 'conquered').length;
    continentStats[cont] = {
      conquered: conq,
      total: inCont.length,
      percentage: inCont.length > 0 ? Math.round((conq / inCont.length) * 100) : 0
    };
  });

  const rarityStats = {};
  RARITY_ORDER.forEach((tier) => {
    const inTier = countriesResult.filter((c) => c.rarityTier === tier);
    const conq = inTier.filter((c) => c.status === 'conquered').length;
    rarityStats[tier] = {
      conquered: conq,
      total: inTier.length,
      percentage: inTier.length > 0 ? Math.round((conq / inTier.length) * 100) : 0
    };
  });

  return {
    summary: {
      totalCountries: 195,
      conqueredCount,
      unconqueredCount: 195 - conqueredCount,
      wishlistCount,
      percentage: Number(((conqueredCount / 195) * 100).toFixed(1)),
      avgChampionRating,
      manualPicksCount: Object.keys(manualPicks).length + Object.keys(manualOrigins).length,
      continentStats,
      rarityStats,
      historicalConqueredCount: historicalCountries.filter((h) => h.status === 'conquered').length
    },
    countries: countriesResult,
    historicalCountries,
    catalogMovies: Array.from(catalogMap.values()).sort(compareCandidates)
  };
}

export default function WorldChallengePage({ movies = [], onOpenAddMovieForCountry }) {
  const [challengeData, setChallengeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [savingAction, setSavingAction] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Controles de Visão e Filtros do HUD
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'cards'
  const [selectedContinent, setSelectedContinent] = useState('Todos');
  const [rarityFilter, setRarityFilter] = useState('all'); // 'all' | 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'conquered' | 'fog' | 'pending' | 'wishlist'
  const [coprodValidationFilter, setCoprodValidationFilter] = useState('pending'); // 'pending' | 'validated' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [cardSortBy, setCardSortBy] = useState('conquered_first');

  // Gavetas de Inspeção e Territórios Perdidos
  const [selectedCountryCode, setSelectedCountryCode] = useState(null);
  const [isHistoricalOpen, setIsHistoricalOpen] = useState(false);

  const showToast = useCallback((text) => {
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage((prev) => (prev === text ? null : prev));
    }, 3400);
  }, []);

  const loadChallenge = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/challenge/world-195`);
      if (res.data?.success && res.data?.data) {
        setChallengeData(res.data.data);
        setOfflineMode(false);
        setLoading(false);
        return;
      }
    } catch {
      let savedLocal = {};
      try {
        savedLocal = JSON.parse(localStorage.getItem('world_challenge_195_offline') || '{}');
      } catch {
        savedLocal = {};
      }
      setChallengeData(buildOfflineChallengePayload(movies, savedLocal));
      setOfflineMode(true);
    } finally {
      setLoading(false);
    }
  }, [movies]);

  useEffect(() => {
    loadChallenge();
  }, [loadChallenge]);

  // País (ou território histórico) atualmente aberto no Drawer — derivado ao vivo!
  const activeInspectedCountry = useMemo(() => {
    if (!selectedCountryCode || !challengeData) return null;
    const fromUn = challengeData.countries?.find((c) => c.code === selectedCountryCode);
    if (fromUn) return fromUn;
    const fromHist = challengeData.historicalCountries?.find((h) => h.code === selectedCountryCode);
    return fromHist || null;
  }, [selectedCountryCode, challengeData]);

  // Filtragem inteligente dos 195 países (Continente + Raridade RPG + Status + Busca)
  const filteredCountries = useMemo(() => {
    if (!challengeData?.countries) return [];
    const q = cleanStr(searchQuery);

    const list = challengeData.countries.filter((c) => {
      if (selectedContinent !== 'Todos' && c.continent !== selectedContinent) return false;
      const cTier = c.rarityTier || getCountryRarityTier(c.code);
      if (rarityFilter !== 'all' && cTier !== rarityFilter) return false;
      if (statusFilter === 'conquered' && c.status !== 'conquered') return false;
      if (statusFilter === 'fog' && (c.status === 'conquered' || c.wishlist)) return false;
      if (statusFilter === 'pending' && c.status === 'conquered') return false;
      if (statusFilter === 'wishlist' && !c.wishlist) return false;

      if (q) {
        const matchCountry =
          cleanStr(c.name).includes(q) ||
          cleanStr(c.code).includes(q) ||
          cleanStr(c.iso3).includes(q);
        const matchChampion =
          c.champion &&
          (cleanStr(c.champion.title).includes(q) ||
            (c.champion.directors || []).some((d) => cleanStr(d).includes(q)));
        const matchWish = c.wishlist && cleanStr(c.wishlist.title).includes(q);
        if (!matchCountry && !matchChampion && !matchWish) return false;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      const tierA = RARITY_RANK_WEIGHT[a.rarityTier || getCountryRarityTier(a.code)] || 1;
      const tierB = RARITY_RANK_WEIGHT[b.rarityTier || getCountryRarityTier(b.code)] || 1;

      if (cardSortBy === 'rarity_desc') {
        if (tierB !== tierA) return tierB - tierA;
        const sa = a.status === 'conquered' ? 1 : 0;
        const sb = b.status === 'conquered' ? 1 : 0;
        if (sb !== sa) return sb - sa;
        return a.name.localeCompare(b.name, 'pt-BR');
      }
      if (cardSortBy === 'rarity_asc') {
        if (tierA !== tierB) return tierA - tierB;
        return a.name.localeCompare(b.name, 'pt-BR');
      }
      if (cardSortBy === 'movies_desc') {
        const ma = a.totalCandidates ?? a.candidates?.length ?? 0;
        const mb = b.totalCandidates ?? b.candidates?.length ?? 0;
        if (mb !== ma) return mb - ma;
        const ra = a.champion ? Number(a.champion.user_rating || 0) : -1;
        const rb = b.champion ? Number(b.champion.user_rating || 0) : -1;
        if (rb !== ra) return rb - ra;
        return a.name.localeCompare(b.name, 'pt-BR');
      }
      if (cardSortBy === 'rating_desc') {
        const ra = a.champion ? Number(a.champion.user_rating || 0) : -1;
        const rb = b.champion ? Number(b.champion.user_rating || 0) : -1;
        if (rb !== ra) return rb - ra;
        return a.name.localeCompare(b.name, 'pt-BR');
      }
      if (cardSortBy === 'conquered_first') {
        const sa = a.status === 'conquered' ? 2 : a.wishlist ? 1 : 0;
        const sb = b.status === 'conquered' ? 2 : b.wishlist ? 1 : 0;
        if (sb !== sa) return sb - sa;
        if (tierB !== tierA) return tierB - tierA;
        return a.name.localeCompare(b.name, 'pt-BR');
      }
      if (cardSortBy === 'pending_first') {
        const sa = a.status === 'conquered' ? 1 : 0;
        const sb = b.status === 'conquered' ? 1 : 0;
        if (sa !== sb) return sa - sb;
        if (tierB !== tierA) return tierB - tierA;
        return a.name.localeCompare(b.name, 'pt-BR');
      }
      return a.name.localeCompare(b.name, 'pt-BR');
    });
  }, [challengeData, selectedContinent, rarityFilter, statusFilter, searchQuery, cardSortBy]);

  // Conjunto de países destacados no Mapa Tático quando há busca/filtro ativo
  const visibleCodesSet = useMemo(() => {
    const hasFilter =
      selectedContinent !== 'Todos' ||
      rarityFilter !== 'all' ||
      statusFilter !== 'all' ||
      searchQuery.trim().length > 0;
    if (!hasFilter) return null;
    return new Set(filteredCountries.map((c) => c.code));
  }, [filteredCountries, selectedContinent, rarityFilter, statusFilter, searchQuery]);

  // Destaques rápidos abaixo do Mapa Tático
  const sectorTopChampions = useMemo(() => {
    return filteredCountries
      .filter((c) => c.status === 'conquered' && c.champion)
      .sort((a, b) => {
        const tA = RARITY_RANK_WEIGHT[a.rarityTier || getCountryRarityTier(a.code)] || 1;
        const tB = RARITY_RANK_WEIGHT[b.rarityTier || getCountryRarityTier(b.code)] || 1;
        if (tB !== tA) return tB - tA;
        return Number(b.champion.user_rating || 0) - Number(a.champion.user_rating || 0);
      })
      .slice(0, 6);
  }, [filteredCountries]);

  const sectorWishlistTargets = useMemo(() => {
    return filteredCountries.filter((c) => c.status !== 'conquered' && c.wishlist);
  }, [filteredCountries]);

  // Coleta todas as coproduções (>1 país nos créditos) do catálogo
  const allCoproductionMovies = useMemo(() => {
    const list = challengeData?.catalogMovies || [];
    return list.filter(
      (m) =>
        (Array.isArray(m.coproductionCountries) && m.coproductionCountries.length > 1) ||
        (Array.isArray(m.countries) && m.countries.length > 1)
    );
  }, [challengeData]);

  // Estatísticas de coproduções
  const coprodStats = useMemo(() => {
    const total = allCoproductionMovies.length;
    const pending = allCoproductionMovies.filter((m) => m.originMode !== 'manual').length;
    const validated = allCoproductionMovies.filter((m) => m.originMode === 'manual').length;
    return { total, pending, validated };
  }, [allCoproductionMovies]);

  // Coproduções filtradas por continente, busca e status de validação
  const filteredCoproductionMovies = useMemo(() => {
    const q = cleanStr(searchQuery);

    return allCoproductionMovies
      .filter((m) => {
        // Filtro de validação: 'pending' (sem bandeira), 'validated' (com bandeira), 'all' (todas)
        if (coprodValidationFilter === 'pending' && m.originMode === 'manual') return false;
        if (coprodValidationFilter === 'validated' && m.originMode !== 'manual') return false;

        // Filtro de continente (o filme deve ter algum país coprodutor naquele continente)
        if (selectedContinent !== 'Todos') {
          const hasInContinent = (m.coproductionCountries || []).some((cp) => {
            const def = UN_COUNTRIES_195.find((u) => u.code === cp.code);
            return def && def.continent === selectedContinent;
          });
          if (!hasInContinent) return false;
        }

        // Filtro de busca textual
        if (q) {
          const matchTitle = cleanStr(m.title).includes(q);
          const matchOrig = cleanStr(m.original_title).includes(q);
          const matchDir = (m.directors || []).some((d) => cleanStr(d).includes(q));
          const matchCountry = (m.coproductionCountries || []).some((cp) =>
            cleanStr(cp.name).includes(q)
          );
          if (!matchTitle && !matchOrig && !matchDir && !matchCountry) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.originMode !== b.originMode) {
          return a.originMode === 'manual' ? 1 : -1;
        }
        return Number(b.user_rating || 0) - Number(a.user_rating || 0);
      });
  }, [allCoproductionMovies, coprodValidationFilter, selectedContinent, searchQuery]);

  // ============================================================================
  // HANDLERS DE CURADORIA E DISPUTA DE FRONTEIRA (SEM RECARREGAR A TELA)
  // ============================================================================
  const handlePickChampion = async (targetCountry, movieId) => {
    if (!targetCountry) return;
    setSavingAction(true);
    try {
      if (!offlineMode) {
        const res = await axios.put(`${API_BASE_URL}/challenge/world-195/pick/${targetCountry.code}`, {
          countryName: targetCountry.name,
          movieId,
          lockExclusiveOrigin: true
        });
        if (res.data?.success && res.data?.data) {
          setChallengeData(res.data.data);
          const newlyUnlocked = res.data.newlyUnlocked || [];
          if (Array.isArray(newlyUnlocked) && newlyUnlocked.length > 0) {
            newlyUnlocked.forEach((t, i) => {
              setTimeout(() => {
                triggerPS5TrophyToast(t);
              }, i * 650);
            });
            axios.post(`${API_BASE_URL}/trophies/ack-new`, {
              trophyIds: newlyUnlocked.map((x) => x.id),
            }).catch(() => {});
          }
          if (res.data.xpGain) {
            triggerXPGainToast(res.data.xpGain, res.data.xpStatus);
          } else if (res.data.xpStatus) {
            dispatchXpStatusUpdate(res.data.xpStatus);
          }
          showToast(
            movieId
              ? `Campeão fixado em ${targetCountry.name}! Fronteiras sincronizadas.`
              : `${targetCountry.name} voltou para seleção automática.`
          );
          return;
        }
      }

      const prevSaved = JSON.parse(localStorage.getItem('world_challenge_195_offline') || '{}');
      const prevXp = calculateClientXpStatus(movies, null, prevSaved);
      const saved = JSON.parse(localStorage.getItem('world_challenge_195_offline') || '{}');
      saved.picks = saved.picks || {};
      saved.origins = saved.origins || {};
      if (movieId) {
        Object.keys(saved.picks).forEach((k) => {
          if (Number(saved.picks[k]) === Number(movieId) && k !== targetCountry.code) {
            delete saved.picks[k];
          }
        });
        saved.picks[targetCountry.code] = movieId;
        saved.origins[movieId] = targetCountry.code;
      } else {
        delete saved.picks[targetCountry.code];
      }
      localStorage.setItem('world_challenge_195_offline', JSON.stringify(saved));
      const nextXp = calculateClientXpStatus(movies, null, saved);
      triggerXPGainToast(computeXpGainEvent(prevXp, nextXp), nextXp);
      setChallengeData(buildOfflineChallengePayload(movies, saved));
      showToast(`Representante de ${targetCountry.name} atualizado!`);
    } catch (err) {
      console.error('Erro ao fixar representante:', err);
      showToast('Erro ao salvar representante no servidor.');
    } finally {
      setSavingAction(false);
    }
  };

  const handleChangeMoviePrimaryCountry = async (movieObj, targetCountryCode, targetCountryName) => {
    if (!movieObj) return;
    setSavingAction(true);
    try {
      if (!offlineMode) {
        const res = await axios.put(
          `${API_BASE_URL}/challenge/world-195/origin/${movieObj.movie_id}`,
          {
            countryCode: targetCountryCode
          }
        );
        if (res.data?.success && res.data?.data) {
          setChallengeData(res.data.data);
          const newlyUnlocked = res.data.newlyUnlocked || [];
          if (Array.isArray(newlyUnlocked) && newlyUnlocked.length > 0) {
            newlyUnlocked.forEach((t, i) => {
              setTimeout(() => {
                triggerPS5TrophyToast(t);
              }, i * 650);
            });
            axios.post(`${API_BASE_URL}/trophies/ack-new`, {
              trophyIds: newlyUnlocked.map((x) => x.id),
            }).catch(() => {});
          }
          if (res.data.xpGain) {
            triggerXPGainToast(res.data.xpGain, res.data.xpStatus);
          } else if (res.data.xpStatus) {
            dispatchXpStatusUpdate(res.data.xpStatus);
          }
          showToast(
            targetCountryCode
              ? `"${movieObj.title}" validado em ${targetCountryName}! Desafio 195 e XP atualizados.`
              : `"${movieObj.title}" devolvido para Aguardando Curadoria.`
          );
          return;
        }
      }

      const prevSaved = JSON.parse(localStorage.getItem('world_challenge_195_offline') || '{}');
      const prevXp = calculateClientXpStatus(movies, null, prevSaved);
      const saved = JSON.parse(localStorage.getItem('world_challenge_195_offline') || '{}');
      saved.origins = saved.origins || {};
      saved.picks = saved.picks || {};
      Object.keys(saved.picks).forEach((k) => {
        if (Number(saved.picks[k]) === Number(movieObj.movie_id) && k !== targetCountryCode) {
          delete saved.picks[k];
        }
      });
      if (targetCountryCode) saved.origins[movieObj.movie_id] = targetCountryCode;
      else delete saved.origins[movieObj.movie_id];
      localStorage.setItem('world_challenge_195_offline', JSON.stringify(saved));
      const nextXp = calculateClientXpStatus(movies, null, saved);
      triggerXPGainToast(computeXpGainEvent(prevXp, nextXp), nextXp);
      setChallengeData(buildOfflineChallengePayload(movies, saved));
      showToast('País Primário do filme atualizado!');
    } catch (err) {
      console.error('Erro ao transferir País Primário:', err);
      showToast('Erro ao transferir País Primário do filme.');
    } finally {
      setSavingAction(false);
    }
  };

  const handleSaveWishlist = async (targetCountry, wishlistPayload) => {
    if (!targetCountry) return;
    setSavingAction(true);
    try {
      if (!offlineMode) {
        const res = await axios.put(
          `${API_BASE_URL}/challenge/world-195/wishlist/${targetCountry.code}`,
          {
            countryName: targetCountry.name,
            wishlist: wishlistPayload
          }
        );
        if (res.data?.success && res.data?.data) {
          setChallengeData(res.data.data);
          showToast(
            wishlistPayload
              ? `Alvo marcado no radar para ${targetCountry.name}!`
              : `Alvo removido de ${targetCountry.name}.`
          );
          return;
        }
      }

      const saved = JSON.parse(localStorage.getItem('world_challenge_195_offline') || '{}');
      saved.wishlists = saved.wishlists || {};
      if (wishlistPayload) saved.wishlists[targetCountry.code] = wishlistPayload;
      else delete saved.wishlists[targetCountry.code];
      localStorage.setItem('world_challenge_195_offline', JSON.stringify(saved));
      setChallengeData(buildOfflineChallengePayload(movies, saved));
      showToast('Radar de missão atualizado!');
    } catch (err) {
      console.error('Erro ao salvar wishlist:', err);
      showToast('Erro ao salvar filme-alvo.');
    } finally {
      setSavingAction(false);
    }
  };

  if (loading && !challengeData) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-9 h-9 text-amber-500 animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Inicializando War Room • Carregando 195 Territórios...
        </span>
      </div>
    );
  }

  const summary = challengeData?.summary || {
    totalCountries: 195,
    conqueredCount: 0,
    unconqueredCount: 195,
    wishlistCount: 0,
    percentage: 0,
    avgChampionRating: 0,
    manualPicksCount: 0,
    continentStats: {},
    rarityStats: {},
    historicalConqueredCount: 0
  };

  const explorerRank = getExplorerRank(summary.conqueredCount);
  const historicalTotalCount = challengeData?.historicalCountries?.length || 0;

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Toast Tático Flutuante */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-zinc-950/95 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-md text-xs font-black uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================
       * A. HUD SUPERIOR (PAINEL TÁTICO DO JOGADOR / WAR ROOM)
       * ======================================================================== */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800/90 bg-gradient-to-br from-[#0b101d] via-zinc-950 to-[#090d16] p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-rose-500/5 blur-3xl" />

        {/* Linha 1 do HUD: Título da Operação + Patente RPG + Botão Territórios Perdidos */}
        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-5 pb-5 border-b border-zinc-800/80">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                <Globe className="w-3.5 h-3.5" />
                Operação Cine-Atlas
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${explorerRank.badgeClass}`}
              >
                <Trophy className="w-3.5 h-3.5" />
                Rank Nv.{explorerRank.level} • {explorerRank.title}
              </span>

              {summary.conqueredCount < 195 && (
                <span className="text-[10px] font-mono text-zinc-500">
                  (Faltam {explorerRank.nextAt - summary.conqueredCount} países p/ próximo rank)
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-zinc-100">
              Desafio Volta ao Mundo em{' '}
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
                195 Filmes
              </span>
            </h1>
            <p className="text-xs text-zinc-400 max-w-2xl">
              Conquiste cada nação da ONU com 1 representante único. Cada obra pode ocupar{' '}
              <strong className="text-zinc-200">apenas 1 único país</strong> (coproduções vão por
              padrão para o 1º país listado e podem ser transferidas com 1 clique).
            </p>
          </div>

          {/* KPIs Rápidos + Botão de Territórios Históricos */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-zinc-900/75 border border-zinc-800 rounded-xl px-3.5 py-2.5 flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Média Campeões
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-black text-zinc-100">
                  {summary.avgChampionRating > 0 ? summary.avgChampionRating.toFixed(2) : '—'}
                </span>
              </div>
            </div>

            <div className="bg-zinc-900/75 border border-zinc-800 rounded-xl px-3.5 py-2.5 flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Alvos no Radar
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-sm font-black text-amber-300">{summary.wishlistCount}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsHistoricalOpen(true)}
              className="bg-zinc-900/90 hover:bg-amber-500/15 border border-amber-500/35 hover:border-amber-400 text-amber-300 px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shadow-lg"
            >
              <History className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Territórios Perdidos / Históricos
                </span>
                <span className="text-[10px] text-zinc-400 font-semibold">
                  {summary.historicalConqueredCount} relíquias ativas ({historicalTotalCount} arquivos)
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Linha 2 do HUD: Barra de Progresso Tática Global [XX / 195] */}
        <div className="relative py-4 border-b border-zinc-800/80 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm sm:text-base font-black tracking-wider text-emerald-400">
                [{String(summary.conqueredCount).padStart(2, '0')} / 195 Países Conquistados]
              </span>
              <span className="text-xs font-bold text-zinc-400">
                • Restam {summary.unconqueredCount} em Névoa de Guerra
              </span>
            </div>

            <div className="flex items-center gap-3">
              {summary.manualPicksCount > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Pin className="w-3 h-3" /> {summary.manualPicksCount} curadorias manuais
                </span>
              )}
              <span className="font-mono text-base font-black text-amber-400">
                {summary.percentage.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Barra Tática Segmentada */}
          <div className="relative h-3.5 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-400 to-amber-400 transition-all duration-700 shadow-[0_0_16px_rgba(16,185,129,0.5)]"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(summary.conqueredCount > 0 ? 1.5 : 0, summary.percentage)
                )}%`
              }}
            />
            <div className="pointer-events-none absolute inset-0 flex justify-between px-[25%]">
              <div className="w-px h-full bg-zinc-950/70" />
              <div className="w-px h-full bg-zinc-950/70" />
              <div className="w-px h-full bg-zinc-950/70" />
            </div>
          </div>
        </div>

        {/* Linha 3 do HUD: Continentes + Tiers de Raridade RPG + Alternador de Visão + Busca */}
        <div className="relative pt-4 flex flex-col gap-3">
          {/* Sub-linha A: Continentes + Alternador [Mapa Tático] vs [Grade de Cartas] */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {CONTINENTS.map((cont) => {
                const isSelected = selectedContinent === cont;
                const stat =
                  cont === 'Todos'
                    ? { conquered: summary.conqueredCount, total: 195 }
                    : summary.continentStats?.[cont] || { conquered: 0, total: 0 };

                return (
                  <button
                    key={cont}
                    type="button"
                    onClick={() => setSelectedContinent(cont)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/15'
                        : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                    }`}
                  >
                    <span>{cont}</span>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.2 rounded-md ${
                        isSelected
                          ? 'bg-slate-950/20 text-slate-950 font-black'
                          : 'bg-zinc-950 text-zinc-400'
                      }`}
                    >
                      {stat.conquered}/{stat.total}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Alternador Oficial de Visão */}
            <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 self-start lg:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Modo Mapa Tático</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Modo Grade de Cartas</span>
              </button>
            </div>
          </div>

          {/* Sub-linha B: Filtro pelos 5 Tiers de Raridade RPG do País */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mr-1">
              Raridade RPG:
            </span>
            <button
              type="button"
              onClick={() => setRarityFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                rarityFilter === 'all'
                  ? 'bg-zinc-200 text-slate-950 border-white'
                  : 'bg-zinc-950/70 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Todas (195)
            </button>

            {RARITY_ORDER.map((tierKey) => {
              const cfg = RARITY_TIER_CONFIG[tierKey];
              const isSelected = rarityFilter === tierKey;
              const serverStat = summary.rarityStats?.[tierKey];
              const stat =
                serverStat && serverStat.total > 0
                  ? serverStat
                  : (() => {
                      const list = (challengeData?.countries || []).filter(
                        (c) => (c.rarityTier || getCountryRarityTier(c.code)) === tierKey
                      );
                      return {
                        conquered: list.filter((c) => c.status === 'conquered').length,
                        total: list.length
                      };
                    })();

              return (
                <button
                  key={tierKey}
                  type="button"
                  onClick={() => setRarityFilter(isSelected ? 'all' : tierKey)}
                  title={cfg.shortDesc}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? cfg.badge
                      : `${cfg.softBadge} opacity-80 hover:opacity-100`
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                  <span>{tierKey === 'mythic' ? `🔥 ${cfg.label}` : cfg.label}</span>
                  <span className="font-mono text-[9px] opacity-90">
                    {stat.conquered}/{stat.total}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sub-linha C: Filtro de Status + Busca + Ordenação de Cartas */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: `Todos (${challengeData?.summary?.totalCountries || 195})` },
                { id: 'conquered', label: `Conquistados (${challengeData?.summary?.conqueredCount || 0})` },
                { id: 'fog', label: `Névoa (${challengeData?.summary?.unconqueredCount || 0})` },
                {
                  id: 'pending',
                  label: `⚠️ Coprod. Pendentes (${coprodStats.pending})`,
                  highlight: coprodStats.pending > 0
                },
                { id: 'wishlist', label: `Alvos (${challengeData?.summary?.wishlistCount || 0})` }
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st.id);
                    if (st.id === 'pending') {
                      setViewMode('cards');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === st.id
                      ? st.id === 'pending'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                        : 'bg-zinc-800 text-amber-300 border-amber-500/40'
                      : st.highlight
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/35 hover:bg-amber-500/20'
                        : 'bg-zinc-950/60 text-zinc-500 border-zinc-800/80 hover:text-zinc-300'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[240px] flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filtrar país, sigla ou filme campeão..."
                  className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-amber-500/60 rounded-xl py-1.5 pl-8 pr-7 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {viewMode === 'cards' && (
                <select
                  value={cardSortBy}
                  onChange={(e) => setCardSortBy(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-200 focus:outline-none cursor-pointer"
                >
                  <option value="conquered_first">Conquistados Primeiro</option>
                  <option value="movies_desc">Mais Filmes Cadastrados</option>
                  <option value="rarity_desc">Raridade (Mítico → Comum)</option>
                  <option value="rarity_asc">Raridade (Comum → Mítico)</option>
                  <option value="rating_desc">Maior Nota do Filme</option>
                  <option value="alpha">Ordem Alfabética (A-Z)</option>
                  <option value="pending_first">Missões Pendentes Primeiro</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================
       * B. VISÃO 1: MODO MAPA-MÚNDI TÁTICO (FOG OF WAR + ZOOM NOS BOTÕES)
       * ======================================================================== */}
      {viewMode === 'map' ? (
        <div className="flex flex-col gap-5">
          <TacticalWorldMap
            countries={challengeData?.countries || []}
            selectedContinent={selectedContinent}
            visibleCodesSet={visibleCodesSet}
            onSelectCountry={(countryObj) => setSelectedCountryCode(countryObj.code)}
          />

          {/* Faixa Tática de Reconhecimento Rápido abaixo do Mapa */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  Conquistas Mais Raras no Filtro ({selectedContinent})
                </span>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Ver todas as {filteredCountries.length} cartas →
                </button>
              </div>

              {sectorTopChampions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                  {sectorTopChampions.map((c) => {
                    const rMeta = getRarityMeta(c.rarityTier || c.code);
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setSelectedCountryCode(c.code)}
                        className={`flex items-center gap-2.5 p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border text-left transition-all cursor-pointer group ${rMeta.border}`}
                      >
                        {resolvePosterUrl(c.champion.poster_url) ? (
                          <img
                            src={resolvePosterUrl(c.champion.poster_url)}
                            alt={c.champion.title}
                            className="w-10 h-14 object-cover rounded-lg border border-zinc-700 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-14 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                            <Film className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <img
                                src={`https://flagcdn.com/w40/${c.code}.png`}
                                alt={c.name}
                                className="w-4 h-3 object-cover rounded-[2px] shrink-0"
                              />
                              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-200 truncate">
                                {c.name}
                              </span>
                            </div>
                            <span
                              className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border shrink-0 ${rMeta.softBadge}`}
                            >
                              {rMeta.label}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-zinc-100 truncate mt-0.5">
                            {c.champion.title}
                          </div>
                          <div className="text-[10px] font-black text-amber-400 mt-0.5 flex items-center gap-1 flex-wrap">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span>{Number(c.champion.user_rating || 0).toFixed(2)}</span>
                            {(c.totalCandidates ?? c.candidates?.length ?? 0) > 0 && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-black/80 border border-white/15 font-mono font-bold text-zinc-200 text-[9px] px-1.5 py-0.2 ml-1">
                                <Film className="w-2.5 h-2.5 text-cyan-300" />
                                {c.totalCandidates ?? c.candidates?.length}
                              </span>
                            )}
                            {c.champion.originMode === 'manual' && (
                              <span className="text-[9px] text-emerald-400 font-black ml-1 flex items-center gap-0.5">
                                <Flag className="w-2 h-2 fill-current" /> Validado
                              </span>
                            )}
                            {c.champion.coproductionCountries?.length > 1 && (
                              <span className="text-[9px] text-zinc-400 ml-1 truncate">
                                • Coprod. ({c.champion.coproductionCountries.length})
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                  Nenhum país conquistado neste filtro ainda. Clique em qualquer território no mapa
                  para inspecionar!
                </div>
              )}
            </div>

            {/* Coluna 3: Radar de Missões Pendentes / Alvos Marcados */}
            <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  Alvos Marcados p/ Assistir ({sectorWishlistTargets.length})
                </span>
              </div>

              {sectorWishlistTargets.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
                  {sectorWishlistTargets.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setSelectedCountryCode(c.code)}
                      className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-amber-500/5 hover:bg-amber-500/15 border border-amber-500/25 text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={`https://flagcdn.com/w40/${c.code}.png`}
                          alt={c.name}
                          className="w-5 h-3.5 object-cover rounded-[2px] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] font-black text-zinc-100 truncate">
                            {c.name}
                          </div>
                          <div className="text-[10px] text-amber-300 truncate">
                            🎯 {c.wishlist.title}{' '}
                            {c.wishlist.year ? `(${c.wishlist.year})` : ''}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase text-amber-400 shrink-0">
                        Abrir →
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4 px-2 border border-dashed border-zinc-800 rounded-xl gap-1.5">
                  <Target className="w-5 h-5 text-zinc-600" />
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Clique em qualquer país escuro (<strong>Terra Incógnita</strong>) no mapa para
                    planejar um filme-alvo ou reivindicar coproduções!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================================
         * D. VISÃO 2: GRADE DE CARTAS COLECIONÁVEIS & CENTRAL DE COPRODUÇÕES
         * ====================================================================== */
        statusFilter === 'pending' ? (
          /* ====================================================================
           * CENTRAL TÁTICA DE CURADORIA DE COPRODUÇÕES (TODOS OS PENDENTES EM UM LUGAR)
           * ==================================================================== */
          <div className="flex flex-col gap-4">
            {/* Header da Central com Seletor: [Não Validados] vs [Validados] vs [Todos] */}
            <div className="bg-gradient-to-r from-amber-950/30 via-zinc-900/60 to-zinc-950 border border-amber-500/35 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 shrink-0 mt-0.5">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black uppercase tracking-wider text-zinc-100">
                      Central de Curadoria de Coproduções
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                      {coprodStats.pending} pendente{coprodStats.pending === 1 ? '' : 's'} de validação
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                    Todos os filmes com mais de um país cadastrado reunidos em um só lugar. Escolha
                    abaixo a qual nação cada obra pertence no Desafio 195 para estampar a bandeira{' '}
                    <strong className="text-emerald-300">🚩 Validado</strong> no mapa e nas cartas.
                  </p>
                </div>
              </div>

              {/* Seletor de Validação: Não Validados (Sem Bandeira) | Validados | Todos */}
              <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950/90 p-1.5 rounded-xl border border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setCoprodValidationFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    coprodValidationFilter === 'pending'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Pendentes / Sem Bandeira ({coprodStats.pending})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCoprodValidationFilter('validated')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    coprodValidationFilter === 'validated'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5 fill-current" />
                  <span>Já Validados ({coprodStats.validated})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCoprodValidationFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    coprodValidationFilter === 'all'
                      ? 'bg-zinc-200 text-slate-950 shadow-md font-black'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>Todas ({coprodStats.total})</span>
                </button>
              </div>
            </div>

            {/* Lista/Grade de Filmes de Coprodução */}
            {filteredCoproductionMovies.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl gap-3 p-6 text-center">
                {coprodValidationFilter === 'pending' ? (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Check className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-black uppercase tracking-wider text-emerald-400">
                      Nenhuma coprodução pendente sem bandeira!
                    </div>
                    <p className="text-xs text-zinc-400 max-w-md">
                      Todas as coproduções foram revisadas e marcadas com a bandeira de país validado.
                      Alterne para a aba &quot;Já Validados&quot; para rever as suas escolhas.
                    </p>
                    <button
                      type="button"
                      onClick={() => setCoprodValidationFilter('validated')}
                      className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-black uppercase tracking-wider text-zinc-200 cursor-pointer"
                    >
                      Ver Coproduções Validadas ({coprodStats.validated})
                    </button>
                  </>
                ) : (
                  <>
                    <Film className="w-8 h-8 text-zinc-600" />
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
                      Nenhuma coprodução encontrada para os filtros atuais.
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCoproductionMovies.map((movie) => {
                  const isValidated = movie.originMode === 'manual';
                  const poster = resolvePosterUrl(movie.poster_url);
                  const currentCountryCode = movie.primaryCountryCode;
                  const currentCountryName = movie.primaryCountryName;

                  return (
                    <div
                      key={movie.movie_id}
                      className={`rounded-2xl border p-4 flex flex-col justify-between gap-3.5 transition-all bg-zinc-950 ${
                        isValidated
                          ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-zinc-950 to-zinc-950'
                          : 'border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-zinc-950 to-zinc-950 shadow-md'
                      }`}
                    >
                      {/* Topo do Card: Pôster + Informações do Filme + Badges */}
                      <div className="flex gap-3.5">
                        {poster ? (
                          <img
                            src={poster}
                            alt={movie.title}
                            className="w-16 h-24 object-cover rounded-xl border border-zinc-700 shadow-md shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-24 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                            <Film className="w-6 h-6" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center justify-between gap-1.5">
                              {isValidated ? (
                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 flex items-center gap-1 shadow-sm">
                                  <Flag className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400" />
                                  País Validado
                                </span>
                              ) : (
                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                                  <AlertCircle className="w-2.5 h-2.5" />
                                  Aguardando Revisão
                                </span>
                              )}

                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-lg shrink-0">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                {Number(movie.user_rating || 0).toFixed(1)}
                              </span>
                            </div>

                            <h4 className="text-sm font-black text-zinc-100 truncate mt-1">
                              {movie.title}
                            </h4>
                            <div className="text-[10px] text-zinc-400 truncate">
                              {movie.release_year || 'S/Ano'}
                              {movie.directors?.length > 0 ? ` • ${movie.directors.join(', ')}` : ''}
                            </div>
                          </div>

                          {/* País atualmente alocado no Desafio */}
                          <div className="mt-2 bg-zinc-900/90 border border-zinc-800 rounded-lg px-2.5 py-1 flex items-center justify-between text-[10px]">
                            <span className="text-zinc-500 font-bold uppercase tracking-wider">
                              Alocado em:
                            </span>
                            <span className="text-zinc-200 font-black flex items-center gap-1.5 truncate ml-1">
                              {currentCountryCode && (
                                <img
                                  src={`https://flagcdn.com/w40/${currentCountryCode.toLowerCase()}.png`}
                                  alt={currentCountryName || ''}
                                  className="w-4 h-2.5 object-cover rounded-[2px]"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <span className="truncate">{currentCountryName || 'Aguardando Curadoria'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Seletor Rápido de Coprodução (Botões de 1 Clique) */}
                      <div className="border-t border-zinc-800/80 pt-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-1 text-[10px]">
                          <span className="font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                            <ArrowRightLeft className="w-3 h-3" />
                            Selecione o País Correto no Desafio:
                          </span>
                          {isValidated && (
                            <button
                              type="button"
                              disabled={savingAction}
                              onClick={() =>
                                handleChangeMoviePrimaryCountry(movie, null, '1º país padrão')
                              }
                              title="Desfazer validação manual e voltar para atribuição automática"
                              className="text-[9px] font-bold uppercase text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-2.5 h-2.5" /> Desmarcar
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          {(movie.coproductionCountries || []).map((cp) => {
                            const isCurrent = cp.code === currentCountryCode;
                            const isValidatedHere = isCurrent && isValidated;

                            return (
                              <button
                                key={cp.code}
                                type="button"
                                disabled={savingAction || isValidatedHere}
                                onClick={() =>
                                  handleChangeMoviePrimaryCountry(movie, cp.code, cp.name)
                                }
                                title={
                                  isValidatedHere
                                    ? `Este filme já está validado como pertencente a ${cp.name}`
                                    : isCurrent
                                      ? `Confirmar este filme como representante de ${cp.name} (Validar)`
                                      : `Mover este filme para ${cp.name} e marcar como Validado`
                                }
                                className={`p-2 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center justify-between gap-1.5 transition-all text-left ${
                                  isValidatedHere
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60 shadow-sm cursor-default'
                                    : isCurrent
                                      ? 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border-emerald-500/40 hover:border-emerald-400 cursor-pointer'
                                      : 'bg-zinc-900 hover:bg-amber-500 text-zinc-200 hover:text-slate-950 border-zinc-700 hover:border-amber-400 cursor-pointer'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {cp.flagCode && (
                                    <img
                                      src={`https://flagcdn.com/w40/${cp.flagCode.toLowerCase()}.png`}
                                      alt={cp.name}
                                      className="w-4 h-3 object-cover rounded-[2px] shrink-0"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  )}
                                  <span className="truncate">{cp.name}</span>
                                </div>

                                {isValidatedHere ? (
                                  <span className="shrink-0 flex items-center gap-0.5 text-emerald-400 text-[9px] font-black">
                                    <Flag className="w-2.5 h-2.5 fill-current" />
                                    OK
                                  </span>
                                ) : isCurrent ? (
                                  <span className="shrink-0 text-[8px] font-black bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded border border-emerald-500/40">
                                    VALIDAR
                                  </span>
                                ) : (
                                  <span className="shrink-0 text-[9px] opacity-75 font-bold">
                                    MOVER →
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ====================================================================
           * VISÃO PADRÃO: GRADE DE 195 CARTAS DE TERRITÓRIOS
           * ==================================================================== */
          <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
              Exibindo {filteredCountries.length} de 195 Cartas de Território
            </span>

            {/* Legenda dos 5 Tiers de Raridade do País */}
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-wider">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Comum
              </span>
              <span className="text-sky-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> Raro
              </span>
              <span className="text-purple-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400" /> Épico
              </span>
              <span className="text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Lendário
              </span>
              <span className="text-rose-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Mítico (18)
              </span>
            </div>
          </div>

          {filteredCountries.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl gap-3">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
                Nenhuma carta territorial corresponde a este filtro.
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedContinent('Todos');
                  setRarityFilter('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Mostrar Todos os 195 Países
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {filteredCountries.map((country) => {
                const isConquered = country.status === 'conquered' && Boolean(country.champion);
                const rarity = getRarityMeta(country.rarityTier || country.code);
                const isMythic = rarity.key === 'mythic';

                if (isConquered) {
                  const champ = country.champion;
                  const poster = resolvePosterUrl(champ.poster_url);
                  const coprodCount = champ.coproductionCountries?.length || 0;

                  return (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => setSelectedCountryCode(country.code)}
                      className={`group relative h-80 rounded-2xl border-2 overflow-hidden bg-zinc-950 text-left flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 cursor-pointer ${rarity.border} ${rarity.glow}`}
                    >
                      {/* Efeito de brilho superior especial para países MÍTICOS */}
                      {isMythic && (
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-amber-300 to-rose-500 z-20" />
                      )}

                      {/* Pôster de Fundo com Vinheta Escura */}
                      {poster ? (
                        <img
                          src={poster}
                          alt={champ.title}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-95 transition-all duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center">
                          <Film className="w-10 h-10 text-zinc-800" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/25" />

                      {/* Topo da Carta: Bandeira + Selo de Raridade do PAÍS */}
                      <div className="relative z-10 p-3 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 bg-zinc-950/85 backdrop-blur-md border border-zinc-700/80 px-2 py-1 rounded-lg">
                          <img
                            src={`https://flagcdn.com/w40/${country.code}.png`}
                            alt={country.name}
                            className="w-4 h-3 object-cover rounded-[2px]"
                          />
                          <span className="font-mono text-[10px] font-black text-zinc-200">
                            {country.iso3}
                          </span>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border shadow ${rarity.badge}`}
                          >
                            {isMythic ? `🔥 ${rarity.label}` : rarity.label}
                          </span>
                          {champ.originMode === 'manual' && (
                            <span className="text-[8px] font-black uppercase bg-emerald-950/90 text-emerald-300 border border-emerald-400/60 px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow">
                              <Flag className="w-2 h-2 fill-emerald-400 text-emerald-400" /> Validado
                            </span>
                          )}
                          {country.selectionMode === 'manual' && (
                            <span className="text-[8px] font-black uppercase bg-zinc-950/90 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Pin className="w-2.5 h-2.5" /> Fixado
                            </span>
                          )}
                          {(country.totalCandidates ?? country.candidates?.length ?? 0) > 0 && (
                            <span
                              className="inline-flex items-center gap-1 rounded-md bg-black/80 border border-white/15 font-mono font-bold text-zinc-100 backdrop-blur-md text-[10px] px-1.5 py-0.5 shadow"
                              title={`${country.totalCandidates ?? country.candidates?.length} filme(s) neste país no Desafio 195`}
                            >
                              <Film className="w-2.5 h-2.5 text-cyan-300" />
                              {country.totalCandidates ?? country.candidates?.length}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rodapé da Carta: País + Badge Interno de Nota + Filme Campeão + Coproduções */}
                      <div className="relative z-10 p-3.5 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest truncate ${rarity.accentText}`}
                          >
                            {country.name}
                          </span>

                          {/* Nota do filme mantida exclusivamente como badge interno de pontuação */}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-zinc-700 bg-zinc-950/90 text-amber-300 text-[11px] font-black backdrop-blur-md shrink-0">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {Number(champ.user_rating || 0).toFixed(1)}
                          </span>
                        </div>

                        <h3 className="text-sm font-black text-white leading-tight line-clamp-2 drop-shadow">
                          {champ.title}
                        </h3>

                        <div className="flex items-center justify-between text-[10px] text-zinc-300 font-semibold pt-0.5 border-t border-white/10">
                          <span className="truncate">
                            {coprodCount > 1
                              ? `Coprod. (${coprodCount} países)`
                              : champ.directors?.[0] || country.continent}
                          </span>
                          <span className="font-mono text-zinc-400 shrink-0 ml-1">
                            {champ.release_year || ''}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                }

                /* Carta Não Conquistada (Silhueta Escura / Terra Incógnita com Selo de Raridade do País) */
                const hasWish = Boolean(country.wishlist);

                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => setSelectedCountryCode(country.code)}
                    className={`group relative h-80 rounded-2xl border p-3.5 text-left flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden ${
                      hasWish
                        ? 'bg-gradient-to-b from-amber-950/20 via-zinc-950 to-zinc-950 border-amber-500/45 hover:border-amber-400'
                        : isMythic
                          ? `bg-gradient-to-b from-rose-950/25 via-zinc-950 to-zinc-950 ${rarity.lockedBorder}`
                          : `bg-zinc-950/75 hover:bg-zinc-900/60 ${rarity.lockedBorder}`
                    }`}
                  >
                    {/* Topo: Bandeira Desaturada + Selo de Raridade da Nação */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 px-2 py-1 rounded-lg">
                        <img
                          src={`https://flagcdn.com/w40/${country.code}.png`}
                          alt={country.name}
                          className={`w-4 h-3 object-cover rounded-[2px] ${
                            hasWish ? 'opacity-85' : 'grayscale opacity-40 group-hover:opacity-75'
                          }`}
                        />
                        <span className="font-mono text-[10px] font-bold text-zinc-500">
                          {country.iso3}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${rarity.lockedBadge}`}
                      >
                        {isMythic ? `🔥 ${rarity.label}` : rarity.label}
                      </span>
                    </div>

                    {/* Centro: Silhueta Misteriosa, Coprodução Reivindicável ou Poster do Alvo */}
                    <div className="my-auto flex flex-col items-center justify-center text-center px-2 gap-2">
                      {hasWish ? (
                        <>
                          {country.wishlist.poster_url ? (
                            <img
                              src={resolvePosterUrl(country.wishlist.poster_url)}
                              alt={country.wishlist.title}
                              className="w-16 h-24 object-cover rounded-lg border border-amber-500/40 opacity-85 shadow-md"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                              <Target className="w-6 h-6" />
                            </div>
                          )}
                          <div className="text-[11px] font-bold text-amber-200 line-clamp-2">
                            🎯 {country.wishlist.title}
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-colors ${
                              isMythic
                                ? 'bg-rose-950/40 border-rose-500/30 text-rose-400/80 group-hover:text-rose-300'
                                : 'bg-zinc-900/90 border-zinc-800 text-zinc-700 group-hover:text-amber-400 group-hover:border-amber-500/30'
                            }`}
                          >
                            <Lock className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400">
                            Terra Incógnita
                          </span>
                        </>
                      )}
                    </div>

                    {/* Rodapé da Silhueta */}
                    <div className="flex flex-col gap-0.5 border-t border-zinc-900 pt-2.5">
                      <span className="text-xs font-black uppercase tracking-wide text-zinc-300 group-hover:text-zinc-100 truncate">
                        {country.name}
                      </span>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span>{country.continent}</span>
                        <span className="text-amber-400/80 opacity-0 group-hover:opacity-100 font-bold transition-opacity">
                          Inspecionar →
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        )
      )}

      {/* ========================================================================
       * C. GAVETA DE INSPEÇÃO DA PROVÍNCIA (PAÍS CONQUISTADO OU TERRA INCÓGNITA)
       * ======================================================================== */}
      <CountryInspectionDrawer
        country={activeInspectedCountry}
        isOpen={Boolean(activeInspectedCountry)}
        onClose={() => setSelectedCountryCode(null)}
        catalogMovies={challengeData?.catalogMovies || []}
        savingAction={savingAction}
        onPickChampion={handlePickChampion}
        onChangeMoviePrimaryCountry={handleChangeMoviePrimaryCountry}
        onSaveWishlist={handleSaveWishlist}
        onRegisterWatchedFromWishlist={(countryObj, wishTitle) => {
          setSelectedCountryCode(null);
          if (onOpenAddMovieForCountry) {
            onOpenAddMovieForCountry(countryObj?.name || '', wishTitle || '');
          }
        }}
      />

      {/* ========================================================================
       * GAVETA DE TERRITÓRIOS PERDIDOS / HISTÓRICOS (URSS, IUGOSLÁVIA, ETC.)
       * ======================================================================== */}
      <HistoricalTerritoriesDrawer
        isOpen={isHistoricalOpen}
        onClose={() => setIsHistoricalOpen(false)}
        historicalCountries={challengeData?.historicalCountries || []}
        onInspectHistorical={(histItem) => {
          setIsHistoricalOpen(false);
          setSelectedCountryCode(histItem.code);
        }}
      />
    </div>
  );
}
