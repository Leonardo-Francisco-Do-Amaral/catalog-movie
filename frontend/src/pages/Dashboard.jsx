import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import TopNavbar from '../components/TopNavbar';
import MovieCard from '../components/MovieCard';
import MovieFormModal from '../components/MovieFormModal';
import SpreadsheetImportModal from '../components/SpreadsheetImportModal';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import WorldChallengePage from '../components/WorldChallengePage';
import TimeMachinePage from '../components/TimeMachinePage';
import TrophiesPage from './TrophiesPage';
import PS5TrophyToastContainer, { triggerPS5TrophyToast, triggerTrophyBatch } from '../components/PS5TrophyToastContainer';
import TimeMachineToastContainer from '../components/TimeMachineToastContainer';
import XPGainToastContainer from '../components/XPGainToastContainer';
import { evaluateTrophiesClientSide } from '../utils/trophyEngineClient';
import {
  calculateClientXpStatus,
  computeXpGainEvent,
  triggerXPGainToast,
  triggerTimeMachineUnlock,
  dispatchXpStatusUpdate,
} from '../utils/xpSystem';
import { Film, RefreshCw, AlertTriangle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

// Remove acentos para busca textual inteligente em Português
const stripAccents = (str) =>
  str
    ? String(str)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
    : '';

// Função de normalização de estúdios/distribuidoras (padronização de dados das APIs)
const normalizeName = (text) => {
  if (!text) return "";
  const name = text.toLowerCase().trim();
  if (name === "dc" || name.includes("dc entertainment") || name === "dc comics") return "DC Entertainment";
  if (name.includes("warner")) return "Warner Bros.";
  if (name.includes("disney") || name.includes("pixar")) return "Disney / Pixar";
  if (name.includes("universal")) return "Universal Pictures";
  if (name.includes("paramount")) return "Paramount";
  if (name.includes("sony") || name.includes("columbia")) return "Sony Pictures";
  if (name.includes("netflix")) return "Netflix";
  if (name.includes("a24")) return "A24";
  if (name.includes("lionsgate") || name.includes("liongate")) return "Lionsgate";
  if (name.includes("paris filmes")) return "Paris Filmes";
  return text.trim();
};

// Divide uma string de distribuidoras por delimitadores como "-", "/" ou "e"
const getDistributorsList = (distributorStr) => {
  if (!distributorStr) return [];
  return distributorStr
    .split(/\s+-\s*|\s*-\s+|\s*\/\s*|\s*,\s*|\s+e\s+/)
    .map(d => normalizeName(d.trim()))
    .filter(Boolean);
};

// Dados mockados de fallback baseados na planilha do usuário para rodar imediatamente
const MOCK_MOVIES = [
  {
    id: 1,
    title: 'As Vantagens de Ser Invisível',
    original_title: 'The Perks of Being a Wallflower',
    release_year: 2012,
    runtime: 103,
    synopsis: 'Charlie é um jovem tímido que luta contra a depressão e o luto enquanto tenta se adaptar a uma nova escola. Sua vida muda completamente quando conhece dois irmãos carismáticos, Sam e Patrick, que o apresentam ao mundo da música, da amizade verdadeira e do primeiro amor.',
    poster_url: 'https://image.tmdb.org/t/p/w500/9e3Dz7aCANy5aRUQF745IlNloJ1.jpg',
    user_rating: 9.581,
    imdb_rating: 7.9,
    metacritic_score: 67,
    tags: ['Colegio/Escola', 'Emocionante', 'Personagem LGBT', 'Final Epico', 'Natal', 'Abuso Familiar', 'Tragico'],
    genres: ['Drama', 'Romance'],
    audio_type: 'Dublado',
    countries: ['Estados Unidos']
  },
  {
    id: 2,
    title: 'O Nevoeiro',
    original_title: 'The Mist',
    release_year: 2007,
    runtime: 126,
    synopsis: 'Após uma violenta tempestade, uma misteriosa e densa névoa encobre uma pequena cidade do Maine. David Drayton e seu filho ficam presos em um supermercado local com outros moradores, descobrindo que terríveis criaturas assassinas espreitam na névoa.',
    poster_url: 'https://image.tmdb.org/t/p/w500/5243HlCpeR6Q2a4W0QGjZ0b5K56.jpg',
    user_rating: 8.987,
    imdb_rating: 7.1,
    metacritic_score: 58,
    tags: ['Gore', 'Final Epico', 'Emocionante', 'Aliens', 'Tragico'],
    genres: ['Horror', 'Ficção Científica', 'Suspense'],
    audio_type: 'Dublado',
    countries: ['Estados Unidos']
  },
  {
    id: 3,
    title: 'Vingadores: Era de Ultron',
    original_title: 'Avengers: Age of Ultron',
    release_year: 2015,
    runtime: 141,
    synopsis: 'Quando Tony Stark tenta reiniciar um programa de manutenção de paz desativado, as coisas vão mal e os super-heróis mais poderosos da Terra devem parar o terrível Ultron antes que ele execute seus planos de extinguir a humanidade.',
    poster_url: 'https://image.tmdb.org/t/p/w500/t98g7w04Nf5f2g4wU2b5J7v7sXs.jpg',
    user_rating: 8.888,
    imdb_rating: 7.3,
    metacritic_score: 66,
    tags: ['Marvel', 'Super hero', 'Super poder'],
    genres: ['Ação', 'Aventura', 'Ficção Científica'],
    audio_type: 'Dublado',
    countries: ['Estados Unidos']
  },
  {
    id: 4,
    title: 'Deixa Ela Entrar',
    original_title: 'Låt den rätte komma in',
    release_year: 2008,
    runtime: 114,
    synopsis: 'Oskar é um garoto frágil de 12 anos hostilizado na escola. Ele se apaixona por sua nova vizinha, Eli, uma garota misteriosa e pálida que só sai à noite e guarda um segredo terrível envolvendo mortes brutais na vizinhança.',
    poster_url: 'https://image.tmdb.org/t/p/w500/vGvF0a4Nf5f3e4w5v8X3s7s6s5X.jpg',
    user_rating: 8.960,
    imdb_rating: 7.9,
    metacritic_score: 82,
    tags: ['Vampiro', 'Criança Malvada', 'Colegio/Escola', 'Abuso Familiar', 'Suspense', 'Horror'],
    genres: ['Horror', 'Drama', 'Fantasia'],
    audio_type: 'Legendado',
    countries: ['Suécia']
  },
  {
    id: 5,
    title: 'A Caça',
    original_title: 'Jagten',
    release_year: 2012,
    runtime: 115,
    synopsis: 'Lucas é um homem solitário tentando reconstruir sua vida após o divórcio. Ele consegue um emprego em uma creche local e começa a se recuperar, mas uma mentira inocente contada por uma criança transforma sua vida em um pesadelo de paranoia e linchamento social.',
    poster_url: 'https://image.tmdb.org/t/p/w500/x26G2w4Nf5f4e4w5v8X3s7s6s5Y.jpg',
    user_rating: 8.910,
    imdb_rating: 8.3,
    metacritic_score: 77,
    tags: ['Fatos Reais', 'Colegio/Escola', 'Preconceito', 'Drama'],
    genres: ['Drama', 'Suspense'],
    audio_type: 'Legendado',
    countries: ['Dinamarca']
  },
  {
    id: 6,
    title: 'O Anjo Malvado',
    original_title: 'The Good Son',
    release_year: 1993,
    runtime: 97,
    synopsis: 'Após a morte de sua mãe, o garoto Mark vai passar um tempo com seu tio e primo Henry. Mark logo percebe que Henry demonstra um comportamento sádico e violento por trás de seu rosto angelical, colocando a família em perigo mortal.',
    poster_url: 'https://image.tmdb.org/t/p/w500/y6wG2w4Nf5f5e4w5v8X3s7s6s5Z.jpg',
    user_rating: 8.770,
    imdb_rating: 6.4,
    metacritic_score: 45,
    tags: ['Criança Malvada', 'Abuso Familiar', 'Tragico', 'Suspense'],
    genres: ['Suspense', 'Drama', 'Horror'],
    audio_type: 'Dublado',
    countries: ['Estados Unidos']
  },
  {
    id: 7,
    title: 'Vingadores: Ultimato',
    original_title: 'Avengers: Endgame',
    release_year: 2019,
    runtime: 181,
    synopsis: 'Após Thanos eliminar metade de toda a vida no universo, os Vingadores restantes devem se reunir mais uma vez para reverter as ações do Titã Louco e restaurar o equilíbrio do universo a qualquer custo.',
    poster_url: 'https://image.tmdb.org/t/p/w500/9gk22w4Nf5f6e4w5v8X3s7s6s5A.jpg',
    user_rating: 9.800,
    imdb_rating: 8.4,
    metacritic_score: 78,
    tags: ['Marvel', 'Super Poder', 'Super Hero', 'Emocionante', 'Final Epico'],
    genres: ['Ação', 'Aventura', 'Ficção Científica'],
    audio_type: 'Dublado',
    countries: ['Estados Unidos']
  },
  {
    id: 8,
    title: 'O Quarto de Jack',
    original_title: 'Room',
    release_year: 2015,
    runtime: 118,
    synopsis: 'Jack é um garoto de cinco anos que vive sob o cuidado de sua mãe num pequeno quarto sem janelas. Para Jack, aquele espaço representa todo o universo conhecido. Ao planejar uma fuga arriscada, os dois encaram as maravilhas e perigos do mundo exterior.',
    poster_url: 'https://image.tmdb.org/t/p/w500/2gk22w4Nf5f7e4w5v8X3s7s6s5B.jpg',
    user_rating: 8.950,
    imdb_rating: 8.1,
    metacritic_score: 86,
    tags: ['Sequestro', 'Abuso Familiar', 'Emocionante', 'Drama'],
    genres: ['Drama', 'Suspense'],
    audio_type: 'Legendado',
    countries: ['Irlanda', 'Estados Unidos', 'Canadá', 'Reino Unido']
  }
];

export default function Dashboard() {
  const [allMovies, setAllMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [activeTab, setActiveTab] = useState('catalog');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedAudios, setSelectedAudios] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedDirectors, setSelectedDirectors] = useState([]);
  const [selectedWriters, setSelectedWriters] = useState([]);
  const [selectedStudios, setSelectedStudios] = useState([]);
  const [selectedDistributors, setSelectedDistributors] = useState([]);
  const [oscarFilter, setOscarFilter] = useState(null); // 'wins' | 'nominations' | null
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [initialReleaseYear, setInitialReleaseYear] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [reviewedMovieIds, setReviewedMovieIds] = useState([]);

  // Calcula diretores, roteiristas, estúdios e distribuidoras frequentes no catálogo
  const { frequentDirectors, frequentWriters, frequentStudios, frequentDistributors } = useMemo(() => {
    const directorCounts = {};
    const writerCounts = {};
    const studioCounts = {};
    const distributorCounts = {};

    allMovies.forEach(movie => {
      const directorsList = Array.isArray(movie.directors) && movie.directors.length > 0
        ? movie.directors
        : (movie.director ? [movie.director] : []);
      directorsList.forEach(directorName => {
        if (directorName) {
          directorCounts[directorName] = (directorCounts[directorName] || 0) + 1;
        }
      });

      const writersList = movie.writers || [];
      writersList.forEach(writerName => {
        if (writerName) {
          writerCounts[writerName] = (writerCounts[writerName] || 0) + 1;
        }
      });
      
      const studiosList = movie.studios || [];
      studiosList.forEach(studioName => {
        const cleanStudio = normalizeName(studioName);
        if (cleanStudio) {
          studioCounts[cleanStudio] = (studioCounts[cleanStudio] || 0) + 1;
        }
      });

      if (movie.distributor) {
        const dists = getDistributorsList(movie.distributor);
        dists.forEach(cleanDist => {
          distributorCounts[cleanDist] = (distributorCounts[cleanDist] || 0) + 1;
        });
      }
    });

    const directors = Object.keys(directorCounts).filter(d => directorCounts[d] >= 2);
    const writers = Object.keys(writerCounts).filter(w => writerCounts[w] >= 2);
    const studios = Object.keys(studioCounts).filter(s => studioCounts[s] >= 3);
    const distributors = Object.keys(distributorCounts).filter(d => distributorCounts[d] >= 3);

    return { 
      frequentDirectors: directors.sort(), 
      frequentWriters: writers.sort(), 
      frequentStudios: studios.sort(), 
      frequentDistributors: distributors.sort() 
    };
  }, [allMovies]);

  const [allTags, setAllTags] = useState([]);
  const [systemTags, setSystemTags] = useState([]);
  const [allGenres, setAllGenres] = useState([]);
  const [allCountries, setAllCountries] = useState([]);
  const [allAudios, setAllAudios] = useState([]);
  const [allPlatforms, setAllPlatforms] = useState([]);
  const [sortBy, setSortBy] = useState('seen_desc');

  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [xpStatus, setXpStatus] = useState(null);

  const unlockedTrophyIdsRef = useRef(new Set());
  const initialTrophyScanDoneRef = useRef(false);
  const xpStatusRef = useRef(null);

  const applyXpStatus = useCallback((nextXp) => {
    if (!nextXp) return;
    xpStatusRef.current = nextXp;
    setXpStatus(nextXp);
    dispatchXpStatusUpdate(nextXp);
  }, []);

  useEffect(() => {
    const onExternalXpSync = (e) => {
      if (e?.detail) {
        xpStatusRef.current = e.detail;
        setXpStatus(e.detail);
      }
    };
    window.addEventListener('cine-xp-status-sync', onExternalXpSync);
    return () => window.removeEventListener('cine-xp-status-sync', onExternalXpSync);
  }, []);

  const checkTrophyUnlocks = useCallback(async (currentMovies = allMovies, forceAlerts = false) => {
    try {
      // 1. Tenta avaliar pelo backend
      const res = await axios.post(`${API_BASE_URL}/trophies/evaluate`, { markNew: true });
      if (res.data?.success && res.data?.data) {
        const newlyUnlocked = res.data.data.newlyUnlocked || [];
        const progressedTrophies = res.data.data.progressedTrophies || [];
        if (progressedTrophies.length > 0 || newlyUnlocked.length > 0) {
          triggerTrophyBatch({
            progressed: progressedTrophies,
            unlocked: newlyUnlocked,
          });
        }
        if (newlyUnlocked.length > 0) {
          axios.post(`${API_BASE_URL}/trophies/ack-new`, {
            trophyIds: newlyUnlocked.map((x) => x.id),
          }).catch(() => {});
        }
        res.data.data.trophies.forEach((t) => {
          if (t.is_unlocked) unlockedTrophyIdsRef.current.add(t.id);
        });
        initialTrophyScanDoneRef.current = true;
        if (res.data.data.xpStatus) {
          applyXpStatus(res.data.data.xpStatus);
          return res.data.data.xpStatus;
        }
        return null;
      }
    } catch {
      // Fallback: modo local / mock
    }

    if (Array.isArray(currentMovies) && currentMovies.length > 0) {
      try {
        const clientResult = evaluateTrophiesClientSide(currentMovies);
        const newUnlocks = [];
        clientResult.trophies.forEach((t) => {
          if (t.is_unlocked) {
            if (!unlockedTrophyIdsRef.current.has(t.id)) {
              if (initialTrophyScanDoneRef.current || forceAlerts) {
                newUnlocks.push(t);
              }
              unlockedTrophyIdsRef.current.add(t.id);
            }
          }
        });

        if (newUnlocks.length > 0) {
          newUnlocks.forEach((t, i) => {
            setTimeout(() => {
              triggerPS5TrophyToast(t);
            }, i * 650);
          });
        }
        initialTrophyScanDoneRef.current = true;
        const localXp = calculateClientXpStatus(currentMovies, clientResult.trophies);
        applyXpStatus(localXp);
        return localXp;
      } catch (e) {
        console.error('[Dashboard] Erro no check local de troféus:', e);
      }
    }
    return null;
  }, [allMovies, applyXpStatus]);

  // Função para carregar todos os dados do banco
  const fetchData = async (options = { runTrophyScan: true }) => {
    setLoading(true);
    try {
      const [allRes, platformsRes, tagsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/movies/all`),
        axios.get(`${API_BASE_URL}/platforms/active`),
        axios.get(`${API_BASE_URL}/tags/all`).catch(() => ({ data: { data: [] } }))
      ]);

      const loadedMovies = allRes.data.data || [];
      const loadedSystemTags = (tagsRes?.data?.data || []).map((t) => t.name).filter(Boolean);
      setSystemTags(loadedSystemTags);
      setAllMovies(loadedMovies);
      setAllPlatforms((platformsRes.data.data || []).map(p => p.platform));
      setUsingMock(false);
      if (options.runTrophyScan !== false) {
        await checkTrophyUnlocks(loadedMovies);
      }
      return loadedMovies;
    } catch {
      console.warn('[Dashboard] Backend indisponível. Utilizando dados mockados de demonstração.');
      setAllMovies(MOCK_MOVIES);
      setAllPlatforms(['Netflix', 'My Family Cine', 'Cinema', 'Prime Video', 'Youtube', 'HBO MAX']);
      setUsingMock(true);
      if (options.runTrophyScan !== false) {
        await checkTrophyUnlocks(MOCK_MOVIES);
      }
      return MOCK_MOVIES;
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchData();
  }, []);

  // Extrai tags, gêneros, países e áudios únicos de todos os filmes da base para os filtros
  useEffect(() => {
    if (allMovies.length > 0 || systemTags.length > 0) {
      const tagSet = new Set();
      const genreSet = new Set();
      const countrySet = new Set();
      const audioSet = new Set();

      allMovies.forEach(movie => {
        // Extrai tags
        if (movie.tags) {
          movie.tags.forEach(tag => tagSet.add(tag));
        }
        // Extrai gêneros oficiais
        if (movie.genres) {
          movie.genres.forEach(genre => genreSet.add(genre));
        }
        // Extrai países de origem
        if (movie.countries && movie.countries.length > 0) {
          movie.countries.forEach(country => countrySet.add(country.trim()));
        } else {
          countrySet.add('Desconhecido');
        }
        // Extrai tipos de áudio da planilha
        if (movie.audio_type && movie.audio_type.trim()) {
          audioSet.add(movie.audio_type.trim());
        }
      });

      // Inclui todas as tags cadastradas no sistema
      systemTags.forEach(tag => tagSet.add(tag));

      setAllTags(Array.from(tagSet).sort());
      setAllGenres(Array.from(genreSet).sort());
      setAllCountries(Array.from(countrySet).sort());
      setAllAudios(Array.from(audioSet).sort());
    }
  }, [allMovies, systemTags]);

  // Executa os filtros de busca, tags, gêneros, países, áudio e ordenação em tempo real no cliente
  useEffect(() => {
    let result = [...allMovies];

    // 1. Filtro por Busca Textual sem acentos (Título, Original, Diretor, Roteirista, Tag ou Gênero)
    if (searchQuery.trim()) {
      const query = stripAccents(searchQuery.trim());
      result = result.filter(movie => 
        stripAccents(movie.title).includes(query) ||
        stripAccents(movie.original_title).includes(query) ||
        movie.directors?.some(dir => stripAccents(dir).includes(query)) ||
        movie.writers?.some(wri => stripAccents(wri).includes(query)) ||
        movie.tags?.some(tag => stripAccents(tag).includes(query)) ||
        movie.genres?.some(genre => stripAccents(genre).includes(query))
      );
    }

    // 2. Filtro por Tags Customizadas (AND) - Deve conter TODAS as tags selecionadas
    if (selectedTags.length > 0) {
      result = result.filter(movie => 
        selectedTags.every(tag => movie.tags?.includes(tag))
      );
    }

    // 3. Filtro por Gêneros Oficiais (AND) - Deve conter TODOS os gêneros selecionados
    if (selectedGenres.length > 0) {
      result = result.filter(movie => 
        selectedGenres.every(genre => movie.genres?.includes(genre))
      );
    }

    // 4. Filtro por País de Origem (AND) - Deve conter TODOS os países selecionados
    if (selectedCountries.length > 0) {
      result = result.filter(movie => {
        if (!movie.countries || movie.countries.length === 0) {
          return selectedCountries.includes('Desconhecido') && selectedCountries.length === 1;
        }
        return selectedCountries.every(country => 
          movie.countries.some(mc => mc.trim() === country.trim())
        );
      });
    }

    // 5. Filtro por Tipo de Áudio (OR) - Pode ter qualquer um dos áudios selecionados
    if (selectedAudios.length > 0) {
      result = result.filter(movie => 
        selectedAudios.includes(movie.audio_type)
      );
    }

    // 4.6. Filtro por Visto Em / Plataforma (OR) - Pode ter qualquer uma das plataformas selecionadas
    if (selectedPlatforms.length > 0) {
      result = result.filter(movie => 
        selectedPlatforms.includes(movie.platform)
      );
    }

    // Filtro por Diretor Frequente (OR)
    if (selectedDirectors.length > 0) {
      result = result.filter(movie => {
        const directorsList = Array.isArray(movie.directors) && movie.directors.length > 0
          ? movie.directors
          : (movie.director ? [movie.director] : []);
        return directorsList.some(d => selectedDirectors.includes(d));
      });
    }

    // Filtro por Roteirista Frequente (OR)
    if (selectedWriters.length > 0) {
      result = result.filter(movie => {
        const writersList = movie.writers || [];
        return writersList.some(w => selectedWriters.includes(w));
      });
    }

    // Filtro por Estúdio Frequente (OR)
    if (selectedStudios.length > 0) {
      result = result.filter(movie => {
        const studiosList = movie.studios || [];
        return studiosList.some(s => {
          const normalized = normalizeName(s);
          return normalized && selectedStudios.includes(normalized);
        });
      });
    }

    // Filtro por Distribuidora Frequente (OR)
    if (selectedDistributors.length > 0) {
      result = result.filter(movie => {
        const dists = getDistributorsList(movie.distributor);
        return dists.some(d => selectedDistributors.includes(d));
      });
    }

    // 5.7. Filtro por Premiações do Oscar
    if (oscarFilter === 'wins') {
      result = result.filter(movie => (Number(movie.oscar_wins) || 0) > 0);
    } else if (oscarFilter === 'nominations') {
      result = result.filter(movie => (Number(movie.oscar_nominations) || 0) > 0);
    }

    // 6. Ordenação Dinâmica
    result.sort((a, b) => {
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '', 'pt');
      }
      if (sortBy === 'user_rating') {
        const ratingA = Number(a.user_rating) || 0;
        const ratingB = Number(b.user_rating) || 0;
        return ratingB - ratingA;
      }
      if (sortBy === 'imdb_rating') {
        const ratingA = Number(a.imdb_rating) || 0;
        const ratingB = Number(b.imdb_rating) || 0;
        return ratingB - ratingA;
      }
      if (sortBy === 'metacritic') {
        const scoreA = Number(a.metacritic_score) || 0;
        const scoreB = Number(b.metacritic_score) || 0;
        return scoreB - scoreA;
      }
      if (sortBy === 'runtime_desc') {
        const rA = Number(a.runtime) || 0;
        const rB = Number(b.runtime) || 0;
        return rB - rA;
      }
      if (sortBy === 'runtime_asc') {
        const rA = Number(a.runtime) || 999999;
        const rB = Number(b.runtime) || 999999;
        return rA - rB;
      }
      if (sortBy === 'release_desc') {
        const yA = Number(a.release_year) || 0;
        const yB = Number(b.release_year) || 0;
        return yB - yA;
      }
      if (sortBy === 'release_asc') {
        const yA = Number(a.release_year) || 9999;
        const yB = Number(b.release_year) || 9999;
        return yA - yB;
      }
      if (sortBy === 'seen_desc') {
        const yrA = Number(a.year_seen) || 0;
        const yrB = Number(b.year_seen) || 0;
        if (yrB !== yrA) return yrB - yrA;
        const moA = Number(a.month_seen) || 0;
        const moB = Number(b.month_seen) || 0;
        if (moB !== moA) return moB - moA;
        const dateA = a.watched_at ? new Date(a.watched_at).getTime() : 0;
        const dateB = b.watched_at ? new Date(b.watched_at).getTime() : 0;
        if (dateB !== dateA) return dateB - dateA;
        return (Number(b.id) || 0) - (Number(a.id) || 0);
      }
      if (sortBy === 'seen_asc') {
        const yrA = Number(a.year_seen) || 9999;
        const yrB = Number(b.year_seen) || 9999;
        if (yrA !== yrB) return yrA - yrB;
        const moA = Number(a.month_seen) || 13;
        const moB = Number(b.month_seen) || 13;
        if (moA !== moB) return moA - moB;
        return (Number(a.id) || 0) - (Number(b.id) || 0);
      }
      if (sortBy === 'vistos') {
        const votesA = typeof a.vote_count === 'string' ? parseInt(a.vote_count.replace(/,/g, ''), 10) : (a.vote_count || 0);
        const votesB = typeof b.vote_count === 'string' ? parseInt(b.vote_count.replace(/,/g, ''), 10) : (b.vote_count || 0);
        return votesB - votesA;
      }
      // Ordenação por Data de Cadastro no Banco (watched_at decrescente)
      const dateA = a.watched_at ? new Date(a.watched_at).getTime() : 0;
      const dateB = b.watched_at ? new Date(b.watched_at).getTime() : 0;
      if (dateB !== dateA) return dateB - dateA;
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });

    setFilteredMovies(result);
  }, [searchQuery, selectedTags, selectedGenres, selectedCountries, selectedAudios, selectedPlatforms, selectedDirectors, selectedWriters, selectedStudios, selectedDistributors, oscarFilter, sortBy, allMovies]);

  // Alterna tag no filtro
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const toggleGenre = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre) 
        : [...prev, genre]
    );
  };

  const toggleCountry = (country) => {
    setSelectedCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country) 
        : [...prev, country]
    );
  };

  const toggleAudio = (audio) => {
    setSelectedAudios(prev => 
      prev.includes(audio) 
        ? prev.filter(a => a !== audio) 
        : [...prev, audio]
    );
  };

  const togglePlatform = (platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };

  const toggleDirector = (director) => {
    setSelectedDirectors(prev => 
      prev.includes(director) 
        ? prev.filter(d => d !== director) 
        : [...prev, director]
    );
  };

  const toggleWriter = (writer) => {
    setSelectedWriters(prev => 
      prev.includes(writer) 
        ? prev.filter(w => w !== writer) 
        : [...prev, writer]
    );
  };

  const toggleStudio = (studio) => {
    setSelectedStudios(prev => 
      prev.includes(studio) 
        ? prev.filter(s => s !== studio) 
        : [...prev, studio]
    );
  };

  const toggleDistributor = (distributor) => {
    setSelectedDistributors(prev => 
      prev.includes(distributor) 
        ? prev.filter(d => d !== distributor) 
        : [...prev, distributor]
    );
  };

  // Limpa apenas uma categoria de filtro específica
  const clearCategory = (categoryKey) => {
    switch (categoryKey) {
      case 'tags': setSelectedTags([]); break;
      case 'genres': setSelectedGenres([]); break;
      case 'countries': setSelectedCountries([]); break;
      case 'directors': setSelectedDirectors([]); break;
      case 'writers': setSelectedWriters([]); break;
      case 'studios': setSelectedStudios([]); break;
      case 'distributors': setSelectedDistributors([]); break;
      case 'platforms': setSelectedPlatforms([]); break;
      case 'audios': setSelectedAudios([]); break;
      case 'oscar': setOscarFilter(null); break;
      default: break;
    }
  };

  // Limpa todos os filtros ativos
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedGenres([]);
    setSelectedCountries([]);
    setSelectedAudios([]);
    setSelectedPlatforms([]);
    setSelectedDirectors([]);
    setSelectedWriters([]);
    setSelectedStudios([]);
    setSelectedDistributors([]);
    setOscarFilter(null);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedTags.length > 0 ||
    selectedGenres.length > 0 ||
    selectedCountries.length > 0 ||
    selectedAudios.length > 0 ||
    selectedPlatforms.length > 0 ||
    selectedDirectors.length > 0 ||
    selectedWriters.length > 0 ||
    selectedStudios.length > 0 ||
    selectedDistributors.length > 0 ||
    oscarFilter !== null;

  const handleDeleteMovie = async (movieId) => {
    try {
      await axios.delete(`${API_BASE_URL}/movies/${movieId}`);
      console.log(`[Dashboard] Filme ${movieId} deletado com sucesso.`);
      await fetchData(); // Recarrega os dados do banco após a exclusão
    } catch (err) {
      console.error('[Dashboard] Erro ao excluir filme:', err);
      alert('Erro ao excluir filme do banco de dados.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      
      {/* Barra Superior Fixa com Busca, Abas, Ficha RPG e Filtros em Dropdowns */}
      <TopNavbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        
        selectedTags={selectedTags}
        toggleTag={toggleTag}
        allTags={allTags}
        
        selectedGenres={selectedGenres}
        toggleGenre={toggleGenre}
        allGenres={allGenres}
        
        selectedCountries={selectedCountries}
        toggleCountry={toggleCountry}
        allCountries={allCountries}

        selectedDirectors={selectedDirectors}
        toggleDirector={toggleDirector}
        frequentDirectors={frequentDirectors}

        selectedWriters={selectedWriters}
        toggleWriter={toggleWriter}
        frequentWriters={frequentWriters}

        selectedStudios={selectedStudios}
        toggleStudio={toggleStudio}
        frequentStudios={frequentStudios}

        selectedDistributors={selectedDistributors}
        toggleDistributor={toggleDistributor}
        frequentDistributors={frequentDistributors}

        selectedPlatforms={selectedPlatforms}
        togglePlatform={togglePlatform}
        allPlatforms={allPlatforms}

        oscarFilter={oscarFilter}
        setOscarFilter={setOscarFilter}
        
        selectedAudios={selectedAudios}
        toggleAudio={toggleAudio}
        allAudios={allAudios}
        
        clearCategory={clearCategory}
        clearFilters={clearFilters}
        onAddMovie={() => {
          setEditingMovie(null);
          setReviewSearchQuery('');
          setIsFormOpen(true);
        }}
        onOpenImport={() => setIsImportOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        movies={allMovies}
        xpStatus={xpStatus}
      />

      {/* Painel Central e Conteúdo da Grelha em Largura Total */}
      <main className="flex-1 w-full flex flex-col gap-8 px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
        
        {/* Banner informativo de Mocks se o backend não estiver no ar */}
        {usingMock && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-xl text-amber-400 text-xs font-semibold">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <span>
              <strong>Modo de Demonstração Ativo:</strong> Conexão com o backend (`http://localhost:5000`) indisponível. Exibindo dados locais extraídos da sua planilha para demonstração visual das interações.
            </span>
          </div>
        )}

        {loading ? (
          <div className="flex-grow min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
            <span className="text-zinc-500 text-sm font-semibold tracking-wider uppercase">Carregando Catálogo...</span>
          </div>
        ) : activeTab === 'analytics' ? (
          <AnalyticsDashboard movies={allMovies} />
        ) : activeTab === 'challenge' ? (
          <WorldChallengePage
            movies={allMovies}
            onOpenAddMovieForCountry={(_countryName, wishTitle) => {
              setEditingMovie(null);
              setInitialReleaseYear('');
              setReviewSearchQuery(wishTitle || '');
              setIsFormOpen(true);
            }}
          />
        ) : activeTab === 'trophies' ? (
          <TrophiesPage movies={allMovies} />
        ) : activeTab === 'time_machine' ? (
          <TimeMachinePage
            movies={allMovies}
            onOpenAddMovieForYear={(yearNumber, wishTitle) => {
              setEditingMovie(null);
              setInitialReleaseYear(yearNumber ? String(yearNumber) : '');
              setReviewSearchQuery(wishTitle || '');
              setIsFormOpen(true);
            }}
          />
        ) : (
          /* Grelha Dinâmica Principal (Resultados de Busca / Todos os Filmes - 5 por linha no Desktop) */
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/80 pb-4 px-1 gap-4">
              <div className="flex items-center gap-3">
                <Film className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-black uppercase tracking-widest text-zinc-100">
                  {hasActiveFilters ? 'Resultados do Filtro' : 'Seu Catálogo Completo'}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {/* Seletor de Ordenação */}
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800/80 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-300">
                  <span className="text-zinc-500">Ordenar por:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border-none text-zinc-200 focus:outline-none cursor-pointer font-bold pr-2"
                  >
                    <option value="seen_desc" className="bg-zinc-950">Vistos Recentemente (Ano/Mês)</option>
                    <option value="seen_asc" className="bg-zinc-950">Vistos há Mais Tempo (Ano/Mês)</option>
                    <option value="date" className="bg-zinc-950">Adicionados Recentemente (Cadastro)</option>
                    <option value="user_rating" className="bg-zinc-950">Minha Nota</option>
                    <option value="imdb_rating" className="bg-zinc-950">Nota IMDb</option>
                    <option value="metacritic" className="bg-zinc-950">Nota Metacritic</option>
                    <option value="vistos" className="bg-zinc-950">Mais Vistos / Populares</option>
                    <option value="title" className="bg-zinc-950">Ordem Alfabética (A-Z)</option>
                    <option value="runtime_desc" className="bg-zinc-950">Duração: Mais Longos</option>
                    <option value="runtime_asc" className="bg-zinc-950">Duração: Mais Curtos</option>
                    <option value="release_desc" className="bg-zinc-950">Lançamento: Mais Novos</option>
                    <option value="release_asc" className="bg-zinc-950">Lançamento: Clássicos</option>
                  </select>
                </div>

                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  {filteredMovies.length} {filteredMovies.length === 1 ? 'filme localizado' : 'filmes localizados'}
                </span>
              </div>
            </div>

            {filteredMovies.length === 0 ? (
              <div className="h-60 flex flex-col items-center justify-center border border-zinc-800/50 border-dashed rounded-2xl gap-3">
                <span className="text-zinc-600 text-sm font-bold uppercase tracking-wider">Nenhum filme corresponde aos filtros.</span>
                <button 
                  onClick={clearFilters}
                  className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer"
                >
                  Resetar Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 xl:gap-7">
                {filteredMovies.map((movie) => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    onEdit={(m) => {
                      setEditingMovie(m);
                      setReviewSearchQuery('');
                      setIsFormOpen(true);
                    }}
                    onDelete={handleDeleteMovie}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de Importação de Planilha (.csv / .xlsx) */}
      <SpreadsheetImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={async () => {
          const prevXp = xpStatusRef.current;
          const loaded = await fetchData({ runTrophyScan: false });
          const nextXp = await checkTrophyUnlocks(loaded, true);
          if (prevXp && nextXp) {
            const gain = computeXpGainEvent(prevXp, nextXp);
            if (gain) {
              if (Array.isArray(gain.timeMachineUnlocks) && gain.timeMachineUnlocks.length > 0) {
                triggerTimeMachineUnlock(gain.timeMachineUnlocks.slice(0, 4));
              }
              triggerXPGainToast(gain, nextXp);
            }
          }
        }}
        reviewedMovieIds={reviewedMovieIds}
        onReviewMovie={(movieToReview, rawTitle) => {
          setEditingMovie(movieToReview);
          setInitialReleaseYear('');
          setReviewSearchQuery(rawTitle || movieToReview?.title || '');
          setIsFormOpen(true);
        }}
      />

      {/* Modal Unificado de Cadastro e Edição */}
      <MovieFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMovie(null);
          setReviewSearchQuery('');
          setInitialReleaseYear('');
        }}
        movie={editingMovie}
        initialSearchQuery={reviewSearchQuery}
        initialReleaseYear={initialReleaseYear}
        allTags={allTags}
        onSave={(_newlyUnlocked, _savedMovie, updatedXpStatus) => {
          if (editingMovie?.movie_id) {
            setReviewedMovieIds((prev) =>
              prev.includes(editingMovie.movie_id) ? prev : [...prev, editingMovie.movie_id]
            );
          }
          if (updatedXpStatus) {
            applyXpStatus(updatedXpStatus);
          }
          // O MovieFormModal já disparou as notificações de troféus e XP diretamente.
          // Aqui apenas atualizamos a listagem de filmes sem re-disparar scans redundantes.
          fetchData({ runTrophyScan: !updatedXpStatus });
        }}
      />

      {/* 1º Estágio: Notificações de Troféus Estilo PlayStation 5 com Empilhamento Vertical */}
      <PS5TrophyToastContainer />

      {/* 2º Estágio: Portal da Máquina do Tempo (Dispara após os troféus sumirem!) */}
      <TimeMachineToastContainer />

      {/* 3º Estágio: Pop-up / HUD Animado de Ganho de XP e Level Up (Dispara por último!) */}
      <XPGainToastContainer />
    </div>
  );
}
