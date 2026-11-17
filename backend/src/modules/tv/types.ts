export type TvShowKind = 'anime' | 'series' | 'dorama';

export type TvWatchStatus = 'watching' | 'completed' | 'dropped' | 'on_hold';

export type TvPrimarySource = 'mal' | 'tmdb' | 'manual';

export type TvSeasonType = 'tv' | 'ova' | 'ona' | 'special';

export type TvSongKind = 'opening' | 'ending' | 'manual';

export type TvGenreGroupType = 'genre' | 'demographic' | 'theme';

export interface TvSeasonThemes {
  openings: string[];
  endings: string[];
}

export interface TvSeasonInput {
  id?: number;
  season_number: number;
  label: string;
  season_type?: TvSeasonType;
  mal_id?: number | null;
  tmdb_season_number?: number | null;
  episodes_total?: number | null;
  episodes_watched?: number;
  episode_duration_min?: number | null;
  year?: number | null;
  external_score?: number | null;
  poster_url?: string | null;
  themes?: TvSeasonThemes;
  month_seen?: number | null;
  year_seen?: number | null;
}

export interface TvSeasonRecord {
  id: number;
  show_id: number;
  season_number: number;
  label: string;
  season_type: TvSeasonType;
  mal_id: number | null;
  tmdb_season_number: number | null;
  episodes_total: number | null;
  episodes_watched: number;
  episode_duration_min: number | null;
  year: number | null;
  external_score: number | null;
  poster_url: string | null;
  themes: TvSeasonThemes;
  month_seen: number | null;
  year_seen: number | null;
}

export interface TvStudioItem {
  id: number;
  name: string;
  mal_id: number | null;
}

export interface TvGenreItem {
  id: number;
  name: string;
  group_type: TvGenreGroupType;
}

export interface TvStoppedAtInfo {
  seasonId: number;
  seasonNumber: number;
  label: string;
  episodesWatched: number;
  episodesTotal: number | null;
}

export interface TvSongOption {
  title: string;
  kind: 'opening' | 'ending';
  seasonNumber: number;
  seasonLabel: string;
}

export interface TvShowInput {
  kind: TvShowKind;
  title: string;
  original_title?: string | null;
  primary_source: TvPrimarySource;
  mal_id?: number | null;
  tmdb_tv_id?: number | null;
  imdb_id?: string | null;
  poster_url?: string | null;
  synopsis?: string | null;
  start_year?: number | null;
  end_year?: number | null;
  airing_status?: string | null;
  origin_country?: string | null;
  external_score?: number | null;
  watch_status: TvWatchStatus;
  user_rating?: number | null;
  music_rating?: number | null;
  best_song_title?: string | null;
  best_song_kind?: TvSongKind | null;
  best_season_number?: number | null;
  month_seen?: number | null;
  year_seen?: number | null;
  audio_type?: string | null;
  platform?: string | null;
  review_notes?: string | null;
  raw_api_data?: any;
  is_movie_guard_type?: string | null;
  studios?: Array<string | { name: string; mal_id?: number | null }>;
  genres?: string[];
  demographics?: string[];
  themes?: string[];
  creators?: string[];
  directors?: string[];
  seasons?: TvSeasonInput[];
}

export interface TvShowRecord {
  id: number;
  kind: TvShowKind;
  title: string;
  original_title: string | null;
  primary_source: TvPrimarySource;
  mal_id: number | null;
  tmdb_tv_id: number | null;
  imdb_id: string | null;
  poster_url: string | null;
  synopsis: string | null;
  start_year: number | null;
  end_year: number | null;
  airing_status: string | null;
  origin_country: string | null;
  external_score: number | null;
  watch_status: TvWatchStatus;
  user_rating: number | null;
  music_rating: number | null;
  best_song_title: string | null;
  best_song_kind: TvSongKind | null;
  best_season_number: number | null;
  bestSeasonLabel: string | null;
  month_seen: number | null;
  year_seen: number | null;
  audio_type: string | null;
  platform: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
  seasons: TvSeasonRecord[];
  studios: TvStudioItem[];
  genres: TvGenreItem[];
  creators: string[];
  directors: string[];
  totalEpisodes: number | null;
  watchedEpisodes: number;
  totalHoursWatched: number;
  stoppedAt: TvStoppedAtInfo | null;
  allSongs: TvSongOption[];
}

export interface TvSearchResultItem {
  source: 'jikan' | 'tmdb';
  id: number;
  title: string;
  original_title: string | null;
  year: number | null;
  poster_url: string | null;
  mediaTypeLabel: string;
  isMovie: boolean;
  suggestedKind: TvShowKind;
  episodes: number | null;
  external_score: number | null;
  origin_country: string | null;
  synopsis: string | null;
}

export interface TvRelatedSeasonOption {
  mal_id: number;
  title: string;
  relation: string;
  type: string;
  isMovie: boolean;
}

export interface TvPosterOption {
  file_path: string;
  url: string;
  thumb_url: string;
  iso_639_1: string | null;
}

export interface TvDetailsBundle {
  source: 'jikan' | 'tmdb';
  suggestedKind: TvShowKind;
  mal_id: number | null;
  tmdb_tv_id: number | null;
  imdb_id: string | null;
  title: string;
  original_title: string | null;
  poster_url: string | null;
  available_posters: TvPosterOption[];
  synopsis: string | null;
  start_year: number | null;
  end_year: number | null;
  airing_status: string | null;
  origin_country: string | null;
  external_score: number | null;
  studios: Array<{ name: string; mal_id?: number | null }>;
  genres: string[];
  demographics: string[];
  themes: string[];
  creators: string[];
  directors: string[];
  seasons: TvSeasonInput[];
  relatedSeasons: TvRelatedSeasonOption[];
  raw_api_data: any;
}

export interface TvXpSnapshot {
  totalXp: number;
  level: number;
  levelTitle: string;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercentage: number;
  xpRemaining: number;
  nextTitleMilestone: { level: number; title: string } | null;
  breakdown: {
    episodesWatched: number;
    episodeXp: number;
    completedSeasons: number;
    seasonXp: number;
    completedShows: number;
    showXp: number;
    marathonDays: number;
    marathonXp: number;
    unlockedStudios: number;
    studioLeagueXp: number;
    unlockedVoices: number;
    voiceAlbumXp: number;
  };
  recentMarathonDates?: string[];
}
