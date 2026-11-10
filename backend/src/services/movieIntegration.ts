import axios from 'axios';
import * as dotenv from 'dotenv';
import { 
  TMDBSearchResponse, 
  TMDBMovieDetails, 
  TMDBPosterOption,
  OMDbMovieResponse, 
  ConsolidatedMovieData 
} from '../types';

dotenv.config();

// Mapeamento de códigos ISO-3166-1 alpha-2 para nomes padronizados no banco e no Globo 3D
const ISO_COUNTRY_OVERRIDES: Record<string, string> = {
  US: 'Estados Unidos',
  BR: 'Brasil',
  GB: 'Reino Unido',
  UK: 'Reino Unido',
  FR: 'França',
  JP: 'Japão',
  KR: 'Coreia do Sul',
  KP: 'Coreia do Norte',
  DE: 'Alemanha',
  XG: 'Alemanha Oriental',
  IT: 'Itália',
  ES: 'Espanha',
  SE: 'Suécia',
  DK: 'Dinamarca',
  IE: 'Irlanda',
  CA: 'Canadá',
  LB: 'Líbano',
  CY: 'Chipre',
  QA: 'Catar',
  AR: 'Argentina',
  NL: 'Países Baixos',
  PL: 'Polônia',
  IS: 'Islândia',
  NO: 'Noruega',
  ZA: 'África do Sul',
  NZ: 'Nova Zelândia',
  RU: 'Rússia',
  SU: 'União Soviética',
  MX: 'México',
  CO: 'Colômbia',
  CL: 'Chile',
  IN: 'Índia',
  CN: 'China',
  HK: 'Hong Kong',
  TW: 'Taiwan',
  TH: 'Tailândia',
  AU: 'Austrália',
  AT: 'Áustria',
  BE: 'Bélgica',
  BG: 'Bulgária',
  FI: 'Finlândia',
  HU: 'Hungria',
  MT: 'Malta',
  MA: 'Marrocos',
  CZ: 'República Checa',
  XC: 'Checoslováquia',
  RO: 'Romênia',
  RS: 'Sérvia',
  YU: 'Iugoslávia',
  SG: 'Singapura',
  PT: 'Portugal',
  CH: 'Suíça',
  GR: 'Grécia',
  TR: 'Turquia',
  IR: 'Irã',
  UA: 'Ucrânia',
  PE: 'Peru',
  UY: 'Uruguai',
  PY: 'Paraguai',
  VE: 'Venezuela',
  EC: 'Equador',
  CU: 'Cuba',
  PH: 'Filipinas',
  ID: 'Indonésia',
  VN: 'Vietnã',
  EG: 'Egito',
  IL: 'Israel',
  AE: 'Emirados Árabes Unidos',
  SA: 'Arábia Saudita',
  NG: 'Nigéria',
  KE: 'Quênia',
  SN: 'Senegal'
};

const ptRegionFormatter = new Intl.DisplayNames(['pt-BR'], { type: 'region' });

/**
 * Converte código ISO do TMDB (ex: "US", "GB", "KR") para o nome em português usado no banco.
 */
export function translateIsoCountryToPt(isoCode?: string | null, fallbackName?: string | null): string {
  if (isoCode) {
    const upper = isoCode.trim().toUpperCase();
    if (ISO_COUNTRY_OVERRIDES[upper]) {
      return ISO_COUNTRY_OVERRIDES[upper];
    }
    try {
      const translated = ptRegionFormatter.of(upper);
      if (translated && translated.toUpperCase() !== upper) {
        if (translated === 'Tchéquia') return 'República Checa';
        return translated;
      }
    } catch {
      // Ignora código ISO inválido e segue para o fallback
    }
  }
  return fallbackName ? normalizeCountryName(fallbackName) : '';
}

/**
 * Padroniza nomes de países vindos de planilhas ou digitação manual.
 */
export function normalizeCountryName(rawName: string): string {
  if (!rawName) return '';
  const trimmed = rawName.trim().replace(/\r?\n|\r/g, ' ');
  const lower = trimmed
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (!lower) return '';
  if (lower === 'eua' || lower === 'usa' || lower === 'estados unidos' || lower === 'united states' || lower === 'united states of america') return 'Estados Unidos';
  if (lower === 'uk' || lower === 'reino unido' || lower === 'inglaterra' || lower === 'united kingdom' || lower === 'great britain') return 'Reino Unido';
  if (lower === 'brasil' || lower === 'brazil') return 'Brasil';
  if (lower === 'alemanha ocidental' || lower === 'west germany') return 'Alemanha Ocidental';
  if (lower === 'alemanha' || lower === 'germany') return 'Alemanha';
  if (lower === 'africa do sul' || lower === 'south africa') return 'África do Sul';
  if (lower === 'australia') return 'Austrália';
  if (lower === 'austria') return 'Áustria';
  if (lower === 'belgica' || lower === 'belgium') return 'Bélgica';
  if (lower === 'bulgaria') return 'Bulgária';
  if (lower === 'canada') return 'Canadá';
  if (lower === 'catar' || lower === 'qatar') return 'Catar';
  if (lower === 'colombia') return 'Colômbia';
  if (lower === 'coreia do sul' || lower === 'korei da sul' || lower === 'coreia' || lower === 'south korea') return 'Coreia do Sul';
  if (lower === 'dinamarca' || lower === 'denmark') return 'Dinamarca';
  if (lower === 'espanha' || lower === 'espenha' || lower === 'spain') return 'Espanha';
  if (lower === 'finlandia' || lower === 'finland') return 'Finlândia';
  if (lower === 'franca' || lower === 'france') return 'França';
  if (lower === 'grecia' || lower === 'greece') return 'Grécia';
  if (lower === 'holanda' || lower === 'paises baixos' || lower === 'paises baixo' || lower === 'paisses baixos' || lower === 'netherlands') return 'Países Baixos';
  if (lower === 'hungria' || lower === 'hungary') return 'Hungria';
  if (lower === 'india') return 'Índia';
  if (lower === 'ira' || lower === 'iran') return 'Irã';
  if (lower === 'irlanda' || lower === 'ireland') return 'Irlanda';
  if (lower === 'islandia' || lower === 'iceland') return 'Islândia';
  if (lower === 'italia' || lower === 'italy') return 'Itália';
  if (lower === 'japao' || lower === 'japan') return 'Japão';
  if (lower === 'libano' || lower === 'lebanon') return 'Líbano';
  if (lower === 'mexico') return 'México';
  if (lower === 'noruega' || lower === 'norway') return 'Noruega';
  if (lower === 'nova zelandia' || lower === 'new zealand') return 'Nova Zelândia';
  if (lower === 'polonia' || lower === 'poland') return 'Polônia';
  if (lower === 'republica checa' || lower === 'republica tcheca' || lower === 'tchequia' || lower === 'czech republic') return 'República Checa';
  if (lower === 'romenia' || lower === 'romania') return 'Romênia';
  if (lower === 'russia') return 'Rússia';
  if (lower === 'servia' || lower === 'serbia') return 'Sérvia';
  if (lower === 'suecia' || lower === 'sweden') return 'Suécia';
  if (lower === 'suica' || lower === 'switzerland') return 'Suíça';
  if (lower === 'tailandia' || lower === 'thailand') return 'Tailândia';
  if (lower === 'ucrania' || lower === 'ukraine') return 'Ucrânia';
  if (lower === 'uniao sovietica' || lower === 'urss' || lower === 'soviet union') return 'União Soviética';

  if (trimmed.length === 2) {
    const byIso = translateIsoCountryToPt(trimmed);
    if (byIso) return byIso;
  }

  return trimmed
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function normalizeGenre(name: string): string {
  if (!name) return '';
  const clean = name.trim();
  const lower = clean.toLowerCase();
  
  if (lower === 'comedia') return 'Comédia';
  if (lower === 'curta' || lower === 'curta-metragem') return 'Curta';
  if (lower === 'famalia' || lower === 'familia' || lower === 'família') return 'Família';
  if (lower === 'fantasia') return 'Fantasia';
  if (
    lower.includes('ficçao') || 
    lower.includes('ficcao') || 
    lower.includes('cientica') ||
    lower.includes('cientifica') || 
    lower.includes('científica') || 
    lower.includes('cietifica')
  ) {
    return 'Ficção Científica';
  }
  if (lower === 'horor' || lower === 'horro' || lower === 'horror' || lower === 'terror') return 'Terror';
  if (lower === 'misteiro' || lower === 'misterio' || lower === 'mistério') return 'Mistério';
  if (lower === 'supense' || lower === 'suspense' || lower === 'thriller') return 'Suspense';
  if (lower === 'musical' || lower === 'música' || lower === 'musica') return 'Música';
  
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/**
 * Extrai vitórias e indicações ao Oscar a partir do texto "Awards" do OMDb, quando disponível.
 */
function parseOscarFromAwards(awardsText?: string): { wins: number; nominations: number } {
  if (!awardsText || awardsText === 'N/A') return { wins: 0, nominations: 0 };
  let wins = 0;
  let nominations = 0;

  const wonMatch = awardsText.match(/Won\s+(\d+)\s+Oscar/i);
  if (wonMatch) {
    wins = parseInt(wonMatch[1], 10) || 0;
  }

  const nomMatch = awardsText.match(/Nominated\s+for\s+(\d+)\s+Oscar/i);
  if (nomMatch) {
    nominations = parseInt(nomMatch[1], 10) || 0;
  } else if (wins > 0) {
    nominations = wins;
  }

  return { wins, nominations };
}

/**
 * Busca dados combinados do TMDB e OMDb baseados no título, ano ou IDs manuais do filme.
 */
export async function fetchMovieDetailsByTitle(
  title: string,
  year?: number,
  manualTmdbId?: number,
  manualImdbId?: string,
  fallbackTitle?: string
): Promise<ConsolidatedMovieData> {
  // Recarrega variáveis de ambiente para refletir alterações sem precisar de restart do processo Node
  dotenv.config({ override: true });
  const tmdbBearerToken = process.env.TMDB_BEARER_TOKEN;
  const omdbApiKey = process.env.OMDB_API_KEY || 'trilogy';

  if (!tmdbBearerToken) {
    throw new Error('Configuração ausente: TMDB_BEARER_TOKEN não está definido no ambiente.');
  }
  if (!omdbApiKey) {
    throw new Error('Configuração ausente: OMDB_API_KEY não está definido no ambiente.');
  }

  const tmdbClient = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    headers: {
      Authorization: `Bearer ${tmdbBearerToken}`,
      Accept: 'application/json',
    },
  });

  console.log(
    `[Integration] Iniciando busca para: "${title}"${year ? ` (${year})` : ''}${manualTmdbId ? ` (TMDB: ${manualTmdbId})` : ''}${manualImdbId ? ` (IMDb: ${manualImdbId})` : ''}`
  );

  let tmdbId = manualTmdbId && manualTmdbId > 0 ? manualTmdbId : undefined;

  // 0. Se houver IMDb ID manual, resolve o TMDB ID exato via endpoint /find
  if (!tmdbId && manualImdbId && manualImdbId.trim().startsWith('tt')) {
    try {
      const findRes = await tmdbClient.get(`/find/${manualImdbId.trim()}`, {
        params: { external_source: 'imdb_id', language: 'pt-BR' },
      });
      const movieResults = findRes.data?.movie_results;
      if (Array.isArray(movieResults) && movieResults.length > 0) {
        tmdbId = movieResults[0].id;
        console.log(`[Integration] Filme resolvido via IMDb ID (${manualImdbId}): TMDB ID ${tmdbId}`);
      }
    } catch (err: any) {
      console.warn(`[Integration] Falha ao resolver IMDb ID ${manualImdbId} no TMDB:`, err.message);
    }
  }

  if (!tmdbId) {
    const searchCandidates = [title, fallbackTitle]
      .map((t) => (t ? t.trim() : ''))
      .filter((t, idx, arr) => t.length > 0 && arr.indexOf(t) === idx);

    let foundResult: any = null;

    for (const candidateTitle of searchCandidates) {
      // 1a. Tenta com o ano (se informado)
      try {
        const searchResponse = await tmdbClient.get<TMDBSearchResponse>('/search/movie', {
          params: {
            query: candidateTitle,
            language: 'pt-BR',
            ...(year ? { primary_release_year: year } : {}),
          },
        });
        if (searchResponse.data.results && searchResponse.data.results.length > 0) {
          foundResult = searchResponse.data.results[0];
          break;
        }
      } catch (err: any) {
        console.error('[Integration] Erro ao pesquisar filme no TMDB:', err.message);
        throw new Error(`Falha ao conectar com o TMDB: ${err.message}`);
      }

      // 1b. Se tinha ano e não achou, tenta +/- 1 ano ou sem ano (comum em estreias em festivais vs Brasil)
      if (!foundResult && year) {
        try {
          const searchNoYear = await tmdbClient.get<TMDBSearchResponse>('/search/movie', {
            params: {
              query: candidateTitle,
              language: 'pt-BR',
            },
          });
          const list = searchNoYear.data.results || [];
          // Prioriza resultado cujo ano bata em +-1 ano antes de pegar o primeiro geral
          const closeYearMatch = list.find((r) => {
            if (!r.release_date) return false;
            const ry = parseInt(r.release_date.split('-')[0], 10);
            return !isNaN(ry) && Math.abs(ry - year) <= 1;
          });
          if (closeYearMatch || list.length > 0) {
            foundResult = closeYearMatch || list[0];
            break;
          }
        } catch (err: any) {
          console.warn('[Integration] Erro ao buscar sem ano:', err.message);
        }
      }
    }

    if (!foundResult) {
      throw new Error(`Nenhum filme encontrado no TMDB para o título: "${title}"`);
    }

    tmdbId = foundResult.id;
    console.log(`[Integration] Filme encontrado no TMDB. ID: ${tmdbId}, Título: "${foundResult.title}"`);
  } else {
    console.log(`[Integration] Usando ID TMDB: ${tmdbId}`);
  }

  // 2. Busca de detalhes completos no TMDB (incluindo external_ids, credits e images)
  let tmdbDetails: TMDBMovieDetails;
  try {
    const detailsResponse = await tmdbClient.get<TMDBMovieDetails>(`/movie/${tmdbId}`, {
      params: {
        append_to_response: 'external_ids,credits,images',
        include_image_language: 'pt,en,null',
        language: 'pt-BR',
      },
    });
    tmdbDetails = detailsResponse.data;
  } catch (err: any) {
    console.error(`[Integration] Erro ao obter detalhes do filme ID ${tmdbId} no TMDB:`, err.message);
    throw new Error(`Falha ao obter detalhes do filme no TMDB: ${err.message}`);
  }

  // 3. Extração e mapeamento de campos do TMDB
  const releaseYear = tmdbDetails.release_date 
    ? parseInt(tmdbDetails.release_date.split('-')[0], 10) 
    : null;

  const posterUrl = tmdbDetails.poster_path 
    ? `https://image.tmdb.org/t/p/w500${tmdbDetails.poster_path}` 
    : null;

  const rawPosters = tmdbDetails.images?.posters || [];
  const seenPosterPaths = new Set<string>();
  const posterOptions: TMDBPosterOption[] = [];

  const pushPosterOption = (p: {
    file_path: string;
    iso_639_1?: string | null;
    width?: number;
    height?: number;
    vote_average?: number;
  }) => {
    if (!p?.file_path || seenPosterPaths.has(p.file_path)) return;
    seenPosterPaths.add(p.file_path);
    posterOptions.push({
      file_path: p.file_path,
      url: `https://image.tmdb.org/t/p/w500${p.file_path}`,
      thumb_url: `https://image.tmdb.org/t/p/w342${p.file_path}`,
      iso_639_1: p.iso_639_1 || null,
      width: p.width || 0,
      height: p.height || 0,
      vote_average: p.vote_average || 0,
    });
  };

  if (tmdbDetails.poster_path) {
    const matchedDefault = rawPosters.find((p) => p.file_path === tmdbDetails.poster_path);
    pushPosterOption(
      matchedDefault || {
        file_path: tmdbDetails.poster_path,
        iso_639_1: 'pt',
      }
    );
  }

  const posterLangRank = (iso?: string | null) => {
    if (iso === 'pt') return 0;
    if (iso === 'en') return 1;
    if (!iso) return 2;
    return 3;
  };

  [...rawPosters]
    .sort((a, b) => {
      const rankDiff = posterLangRank(a.iso_639_1) - posterLangRank(b.iso_639_1);
      if (rankDiff !== 0) return rankDiff;
      return (b.vote_average || 0) - (a.vote_average || 0);
    })
    .slice(0, 30)
    .forEach(pushPosterOption);

  const countryCode = tmdbDetails.production_countries && tmdbDetails.production_countries.length > 0
    ? tmdbDetails.production_countries[0].iso_3166_1
    : null;

  // Converte todos os países de produção do TMDB para os nomes em Português do catálogo
  const countries = tmdbDetails.production_countries
    ? Array.from(
        new Set(
          tmdbDetails.production_countries
            .map((c) => translateIsoCountryToPt(c.iso_3166_1, c.name))
            .filter(Boolean)
        )
      )
    : [];

  const studios = tmdbDetails.production_companies 
    ? tmdbDetails.production_companies.map((c) => c.name) 
    : [];

  const genres = tmdbDetails.genres 
    ? Array.from(new Set(tmdbDetails.genres.map((g) => normalizeGenre(g.name))))
    : [];

  // Extrair diretores da equipe técnica (crew)
  const directors = tmdbDetails.credits?.crew
    ? Array.from(
        new Set(
          tmdbDetails.credits.crew
            .filter((member) => member.job.toLowerCase() === 'director')
            .map((member) => member.name)
        )
      )
    : [];

  // Extrair roteiristas da equipe técnica (crew)
  const writers = tmdbDetails.credits?.crew
    ? Array.from(
        new Set(
          tmdbDetails.credits.crew
            .filter((member) => {
              const job = member.job.toLowerCase();
              return job === 'screenplay' || job === 'writer' || job === 'writing' || job === 'story';
            })
            .map((member) => member.name)
        )
      )
    : [];

  const imdbId = tmdbDetails.imdb_id || tmdbDetails.external_ids?.imdb_id || manualImdbId || null;

  // 4. Consumo da API do OMDb caso o IMDb ID exista
  let omdbData: OMDbMovieResponse | null = null;
  let metacriticScore: number | null = null;
  let imdbRating: number | null = null;
  let runtime: number | null = null;
  let rottenTomatoesScore: number | null = null;
  let voteCount: number | null = null;
  let detectedOscars = { wins: 0, nominations: 0 };

  if (imdbId) {
    try {
      const omdbUrl = `http://www.omdbapi.com/?i=${imdbId}&apikey=${omdbApiKey}`;
      const omdbResponse = await axios.get<OMDbMovieResponse>(omdbUrl);
      omdbData = omdbResponse.data;

      if (omdbData && omdbData.Response === 'True') {
        if (omdbData.Metascore && omdbData.Metascore !== 'N/A') {
          metacriticScore = parseInt(omdbData.Metascore, 10);
        }

        if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') {
          imdbRating = parseFloat(omdbData.imdbRating);
        }

        if (omdbData.Runtime && omdbData.Runtime !== 'N/A') {
          const runtimeMatch = omdbData.Runtime.match(/\d+/);
          if (runtimeMatch) {
            runtime = parseInt(runtimeMatch[0], 10);
          }
        }

        if (omdbData.Ratings && omdbData.Ratings.length > 0) {
          const rtRating = omdbData.Ratings.find((r) => r.Source === 'Rotten Tomatoes');
          if (rtRating && rtRating.Value) {
            const rtMatch = rtRating.Value.match(/\d+/);
            if (rtMatch) {
              rottenTomatoesScore = parseInt(rtMatch[0], 10);
            }
          }
        }

        if (omdbData.imdbVotes && omdbData.imdbVotes !== 'N/A') {
          voteCount = parseInt(omdbData.imdbVotes.replace(/,/g, ''), 10);
        }

        detectedOscars = parseOscarFromAwards(omdbData.Awards);
      }
    } catch (err: any) {
      console.error(`[Integration] Erro ao consumir API OMDb para o IMDb ID ${imdbId}:`, err.message);
    }
  }

  // Fallback para runtime do TMDB quando o OMDb não retornar duração
  if (!runtime && tmdbDetails.runtime && tmdbDetails.runtime > 0) {
    runtime = tmdbDetails.runtime;
  }

  // Fallback para TMDB vote_count se não obteve do OMDb/IMDb
  if (!voteCount) {
    voteCount = tmdbDetails.vote_count || null;
  }

  // Se for curta-metragem (< 50 min), adiciona gênero "Curta" automaticamente
  if (runtime && runtime > 0 && runtime < 50) {
    if (!genres.includes('Curta')) {
      genres.push('Curta');
    }
  }

  // 5. Consolidar e retornar dados
  return {
    title: tmdbDetails.title,
    original_title: tmdbDetails.original_title,
    release_year: releaseYear,
    runtime,
    synopsis: tmdbDetails.overview || null,
    poster_url: posterUrl,
    country_code: countryCode,
    countries,
    imdb_rating: imdbRating,
    metacritic_score: metacriticScore,
    rotten_tomatoes_score: rottenTomatoesScore,
    imdb_id: imdbId,
    tmdb_id: tmdbId ?? tmdbDetails.id,
    directors,
    writers,
    studios,
    genres,
    oscar_wins: detectedOscars.wins,
    oscar_nominations: detectedOscars.nominations,
    vote_count: voteCount,
    distributor: omdbData && omdbData.Production && omdbData.Production !== 'N/A' ? omdbData.Production : null,
    available_posters: posterOptions,
    images: {
      posters: posterOptions,
    },
    raw_api_data: {
      tmdb: tmdbDetails,
      omdb: omdbData,
    },
  };
}

export interface ExternalMetricsRefreshResult {
  imdb_rating: number | null;
  metacritic_score: number | null;
  rotten_tomatoes_score: number | null;
  omdb_vote_count: number | null;
  tmdb_vote_count: number | null;
  oscar_wins: number | null;
  oscar_nominations: number | null;
  omdb_found: boolean;
}

/**
 * Busca EXCLUSIVAMENTE métricas externas (IMDb, Metacritic, RT, votos e Oscars) no OMDb/TMDB.
 */
export async function fetchExternalMetricsOnly(params: {
  imdbId?: string | null;
  tmdbId?: number | null;
  title: string;
  originalTitle?: string | null;
  releaseYear?: number | null;
}): Promise<ExternalMetricsRefreshResult> {
  dotenv.config({ override: true });
  const tmdbBearerToken = process.env.TMDB_BEARER_TOKEN;
  const omdbApiKey = process.env.OMDB_API_KEY || 'trilogy';

  const cleanImdbId = params.imdbId && params.imdbId.trim().startsWith('tt') ? params.imdbId.trim() : null;
  const cleanTmdbId = params.tmdbId && Number(params.tmdbId) > 0 ? Number(params.tmdbId) : null;

  let imdbRating: number | null = null;
  let metacriticScore: number | null = null;
  let rottenTomatoesScore: number | null = null;
  let omdbVoteCount: number | null = null;
  let tmdbVoteCount: number | null = null;
  let oscarWins: number | null = null;
  let oscarNominations: number | null = null;
  let omdbFound = false;

  // Se temos imdb_id válido, consultamos OMDb diretamente (rápido e exato)
  if (cleanImdbId && omdbApiKey) {
    try {
      const omdbRes = await axios.get<OMDbMovieResponse>(`http://www.omdbapi.com/?i=${encodeURIComponent(cleanImdbId)}&apikey=${omdbApiKey}`);
      const o = omdbRes.data;
      if (o && o.Response === 'True') {
        omdbFound = true;
        if (o.imdbRating && o.imdbRating !== 'N/A') {
          const parsed = parseFloat(o.imdbRating);
          if (!Number.isNaN(parsed)) imdbRating = parsed;
        }
        if (o.Metascore && o.Metascore !== 'N/A') {
          const parsed = parseInt(o.Metascore, 10);
          if (!Number.isNaN(parsed)) metacriticScore = parsed;
        }
        if (o.Ratings && o.Ratings.length > 0) {
          const rt = o.Ratings.find((r) => r.Source === 'Rotten Tomatoes');
          if (rt && rt.Value) {
            const match = rt.Value.match(/\d+/);
            if (match) rottenTomatoesScore = parseInt(match[0], 10);
          }
        }
        if (o.imdbVotes && o.imdbVotes !== 'N/A') {
          const parsed = parseInt(o.imdbVotes.replace(/,/g, ''), 10);
          if (!Number.isNaN(parsed)) omdbVoteCount = parsed;
        }
        if (o.Awards && o.Awards !== 'N/A') {
          const oscars = parseOscarFromAwards(o.Awards);
          oscarWins = oscars.wins;
          oscarNominations = oscars.nominations;
        }
      }
    } catch (err: any) {
      console.warn(`[RefreshAPI] Falha OMDb para ${cleanImdbId}:`, err.message);
    }
  }

  // Fallback / complemento via TMDB ou título original caso faltem dados ou não haja imdb_id
  if (!cleanImdbId || !omdbFound || omdbVoteCount === null) {
    try {
      const consolidated = await fetchMovieDetailsByTitle(
        params.originalTitle || params.title,
        params.releaseYear || undefined,
        cleanTmdbId || undefined,
        cleanImdbId || undefined,
        params.title
      );
      if (imdbRating === null && consolidated.imdb_rating !== null) imdbRating = consolidated.imdb_rating;
      if (metacriticScore === null && consolidated.metacritic_score !== null) metacriticScore = consolidated.metacritic_score;
      if (rottenTomatoesScore === null && consolidated.rotten_tomatoes_score !== null) rottenTomatoesScore = consolidated.rotten_tomatoes_score;
      if (consolidated.raw_api_data?.omdb?.Response === 'True') {
        omdbFound = true;
        if (consolidated.raw_api_data.omdb.imdbVotes && consolidated.raw_api_data.omdb.imdbVotes !== 'N/A') {
          const parsed = parseInt(consolidated.raw_api_data.omdb.imdbVotes.replace(/,/g, ''), 10);
          if (!Number.isNaN(parsed)) omdbVoteCount = parsed;
        }
        if (oscarWins === null && consolidated.oscar_wins !== undefined) oscarWins = consolidated.oscar_wins;
        if (oscarNominations === null && consolidated.oscar_nominations !== undefined) oscarNominations = consolidated.oscar_nominations;
      }
      if (consolidated.raw_api_data?.tmdb?.vote_count) {
        tmdbVoteCount = Number(consolidated.raw_api_data.tmdb.vote_count) || null;
      }
    } catch (err: any) {
      if (!omdbFound && !tmdbBearerToken) {
        throw err;
      }
      console.warn('[RefreshAPI] Fallback TMDB indisponível:', err.message);
    }
  }

  return {
    imdb_rating: imdbRating,
    metacritic_score: metacriticScore,
    rotten_tomatoes_score: rottenTomatoesScore,
    omdb_vote_count: omdbVoteCount,
    tmdb_vote_count: tmdbVoteCount,
    oscar_wins: oscarWins,
    oscar_nominations: oscarNominations,
    omdb_found: omdbFound,
  };
}

/**
 * Busca todas as opções de pôster disponíveis para um filme no TMDB.
 */
export async function fetchMoviePosters(params: {
  tmdbId?: number | null;
  imdbId?: string | null;
  title?: string;
  year?: number | null;
}): Promise<TMDBPosterOption[]> {
  const details = await fetchMovieDetailsByTitle(
    params.title || '',
    params.year || undefined,
    params.tmdbId || undefined,
    params.imdbId || undefined
  );
  return details.available_posters || [];
}
