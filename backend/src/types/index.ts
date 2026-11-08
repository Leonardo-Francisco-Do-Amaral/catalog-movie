// Interfaces para o Banco de Dados
export interface Movie {
  id?: number;
  imdb_id?: string;
  tmdb_id?: number;
  title: string;
  original_title?: string;
  release_year?: number;
  runtime?: number;
  synopsis?: string;
  poster_url?: string;
  country_code?: string;
  imdb_rating?: number;
  metacritic_score?: number;
  rotten_tomatoes_score?: number;
  raw_api_data?: any;
  oscar_wins?: number;
  oscar_nominations?: number;
  vote_count?: number;
  distributor?: string;
  created_at?: Date;
}

export interface MovieView {
  id?: number;
  movie_id: number;
  user_rating: number;
  month_seen?: number;
  year_seen?: number;
  audio_type?: 'Dublado' | 'Legendado' | 'Original' | string;
  platform?: string;
  review_notes?: string;
  watched_at?: Date;
}

export interface Director {
  id?: number;
  name: string;
}

export interface Studio {
  id?: number;
  name: string;
}

export interface Genre {
  id?: number;
  name: string;
}

export interface Tag {
  id?: number;
  name: string;
  slug: string;
}

// Interfaces de resposta das APIs externas

// TMDB - Search Movie Result
export interface TMDBSearchResult {
  id: number;
  title: string;
  original_title: string;
  release_date?: string;
  poster_path?: string;
  overview?: string;
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBSearchResult[];
  total_pages: number;
  total_results: number;
}

// TMDB - Movie Details with external_ids & credits appended
export interface TMDBMovieDetails {
  id: number;
  imdb_id?: string | null;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  runtime?: number | null;
  poster_path: string | null;
  production_countries: Array<{ iso_3166_1: string; name: string }>;
  production_companies: Array<{ id: number; name: string }>;
  genres: Array<{ id: number; name: string }>;
  vote_count?: number;
  external_ids?: {
    imdb_id?: string;
  };
  credits?: {
    crew: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
    }>;
  };
}

// OMDb - Movie Details Response
export interface OMDbMovieResponse {
  Title?: string;
  Year?: string;
  Runtime?: string; // ex: "148 min"
  Genre?: string;
  Director?: string;
  Awards?: string; // ex: "Won 2 Oscars. 15 wins & 30 nominations total"
  Metascore?: string; // ex: "74" ou "N/A"
  imdbRating?: string; // ex: "8.8" ou "N/A"
  imdbVotes?: string; // ex: "1,234,567" ou "N/A"
  imdbID?: string;
  Ratings?: Array<{ Source: string; Value: string }>;
  Production?: string;
  Response: string; // "True" ou "False"
  Error?: string;
}

// Objeto de dados consolidado retornado pelo serviço de integração
export interface ConsolidatedMovieData {
  title: string;
  original_title: string;
  release_year: number | null;
  runtime: number | null;
  synopsis: string | null;
  poster_url: string | null;
  country_code: string | null;
  countries: string[];
  imdb_rating: number | null;
  metacritic_score: number | null;
  rotten_tomatoes_score: number | null;
  imdb_id: string | null;
  tmdb_id: number;
  directors: string[];
  writers: string[];
  studios: string[];
  genres: string[];
  oscar_wins?: number;
  oscar_nominations?: number;
  vote_count?: number | null;
  distributor?: string | null;
  raw_api_data: {
    tmdb: any;
    omdb: any;
  };
}
