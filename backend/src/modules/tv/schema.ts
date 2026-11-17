import { query } from '../../config/database';

let tvSchemaEnsured = false;
let ensurePromise: Promise<void> | null = null;

/**
 * Cria o schema Postgres `tv` e todas as tabelas do módulo de Animes, Séries e Doramas
 * de forma totalmente isolada do schema `public` (modo Cinema).
 */
export async function ensureTvSchema(): Promise<void> {
  if (tvSchemaEnsured) return;
  if (ensurePromise) return ensurePromise;

  ensurePromise = (async () => {
    await query('CREATE SCHEMA IF NOT EXISTS tv;');

    await query(`
      CREATE TABLE IF NOT EXISTS tv.shows (
        id SERIAL PRIMARY KEY,
        kind VARCHAR(16) NOT NULL CHECK (kind IN ('anime', 'series', 'dorama')),
        title VARCHAR(255) NOT NULL,
        original_title VARCHAR(255),
        primary_source VARCHAR(8) NOT NULL CHECK (primary_source IN ('mal', 'tmdb', 'manual')),
        mal_id INT,
        tmdb_tv_id INT,
        imdb_id VARCHAR(24),
        poster_url TEXT,
        synopsis TEXT,
        start_year INT,
        end_year INT,
        airing_status VARCHAR(64),
        origin_country VARCHAR(16),
        external_score NUMERIC(4,2),
        watch_status VARCHAR(16) NOT NULL DEFAULT 'watching'
          CHECK (watch_status IN ('watching', 'completed', 'dropped', 'on_hold')),
        user_rating NUMERIC(5,3),
        music_rating NUMERIC(5,3),
        best_song_title VARCHAR(255),
        best_song_kind VARCHAR(16),
        best_season_number INT,
        month_seen INT,
        year_seen INT,
        audio_type VARCHAR(32),
        platform VARCHAR(64),
        review_notes TEXT,
        raw_api_data JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX IF NOT EXISTS tv_shows_tmdb_uq
        ON tv.shows (tmdb_tv_id)
        WHERE tmdb_tv_id IS NOT NULL;

      CREATE UNIQUE INDEX IF NOT EXISTS tv_shows_imdb_uq
        ON tv.shows (imdb_id)
        WHERE imdb_id IS NOT NULL AND imdb_id <> '';

      CREATE TABLE IF NOT EXISTS tv.seasons (
        id SERIAL PRIMARY KEY,
        show_id INT NOT NULL REFERENCES tv.shows(id) ON DELETE CASCADE,
        season_number INT NOT NULL,
        label VARCHAR(200) NOT NULL,
        season_type VARCHAR(16) NOT NULL DEFAULT 'tv'
          CHECK (season_type IN ('tv', 'ova', 'ona', 'special')),
        mal_id INT,
        tmdb_season_number INT,
        episodes_total INT,
        episodes_watched INT NOT NULL DEFAULT 0,
        episode_duration_min INT DEFAULT 24,
        year INT,
        external_score NUMERIC(4,2),
        poster_url TEXT,
        themes JSONB NOT NULL DEFAULT '{"openings":[],"endings":[]}'::jsonb,
        month_seen INT,
        year_seen INT,
        UNIQUE (show_id, season_number)
      );

      CREATE UNIQUE INDEX IF NOT EXISTS tv_seasons_mal_uq
        ON tv.seasons (mal_id)
        WHERE mal_id IS NOT NULL;

      CREATE TABLE IF NOT EXISTS tv.watch_log (
        id SERIAL PRIMARY KEY,
        show_id INT NOT NULL REFERENCES tv.shows(id) ON DELETE CASCADE,
        season_id INT NOT NULL REFERENCES tv.seasons(id) ON DELETE CASCADE,
        episodes_delta INT NOT NULL,
        logged_on DATE NOT NULL DEFAULT CURRENT_DATE,
        source VARCHAR(16) NOT NULL DEFAULT 'progress'
          CHECK (source IN ('progress', 'backfill')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS tv_watch_log_logged_on_idx
        ON tv.watch_log (logged_on, source);

      CREATE TABLE IF NOT EXISTS tv.studios (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        mal_id INT
      );

      CREATE TABLE IF NOT EXISTS tv.show_studios (
        show_id INT NOT NULL REFERENCES tv.shows(id) ON DELETE CASCADE,
        studio_id INT NOT NULL REFERENCES tv.studios(id) ON DELETE CASCADE,
        PRIMARY KEY (show_id, studio_id)
      );

      CREATE TABLE IF NOT EXISTS tv.genres (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        group_type VARCHAR(16) NOT NULL DEFAULT 'genre'
          CHECK (group_type IN ('genre', 'demographic', 'theme')),
        UNIQUE (name, group_type)
      );

      CREATE TABLE IF NOT EXISTS tv.show_genres (
        show_id INT NOT NULL REFERENCES tv.shows(id) ON DELETE CASCADE,
        genre_id INT NOT NULL REFERENCES tv.genres(id) ON DELETE CASCADE,
        PRIMARY KEY (show_id, genre_id)
      );

      CREATE TABLE IF NOT EXISTS tv.people (
        id SERIAL PRIMARY KEY,
        mal_id INT UNIQUE,
        tmdb_person_id INT UNIQUE,
        name VARCHAR(255) NOT NULL,
        image_url TEXT,
        fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tv.show_staff (
        show_id INT NOT NULL REFERENCES tv.shows(id) ON DELETE CASCADE,
        person_id INT NOT NULL REFERENCES tv.people(id) ON DELETE CASCADE,
        role VARCHAR(24) NOT NULL,
        PRIMARY KEY (show_id, person_id, role)
      );

      CREATE TABLE IF NOT EXISTS tv.voice_credits (
        show_id INT NOT NULL REFERENCES tv.shows(id) ON DELETE CASCADE,
        person_id INT NOT NULL REFERENCES tv.people(id) ON DELETE CASCADE,
        character_name VARCHAR(255) NOT NULL DEFAULT '',
        role VARCHAR(24),
        album VARCHAR(4) NOT NULL CHECK (album IN ('jp', 'us')),
        character_image_url TEXT,
        PRIMARY KEY (show_id, person_id, character_name)
      );

      ALTER TABLE tv.voice_credits ADD COLUMN IF NOT EXISTS character_image_url TEXT;

      CREATE TABLE IF NOT EXISTS tv.voice_person_cache (
        person_key VARCHAR(120) PRIMARY KEY,
        wiki_title VARCHAR(255),
        wiki_extract TEXT,
        wiki_thumbnail TEXT,
        anilist_bio TEXT,
        anilist_image TEXT,
        hometown VARCHAR(255),
        birth_date VARCHAR(64),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tv.voice_album_state (
        voice_id VARCHAR(120) PRIMARY KEY,
        stuck_tier VARCHAR(32) NULL,
        previous_stuck_tier VARCHAR(32) NULL,
        stuck_extra_stars INTEGER NOT NULL DEFAULT 0,
        claimed_xp_pct INTEGER NOT NULL DEFAULT 0,
        claimed_xp_extra_stars INTEGER NOT NULL DEFAULT 0,
        selected_skin_url TEXT NULL,
        selected_skin_label VARCHAR(120) NULL,
        custom_skin_url TEXT NULL,
        custom_skin_label VARCHAR(120) NULL,
        immortal_aura VARCHAR(32) NULL,
        signature_work_key VARCHAR(120) NULL,
        is_full_art BOOLEAN NOT NULL DEFAULT FALSE,
        is_favorite_guardian BOOLEAN NOT NULL DEFAULT FALSE,
        stuck_at TIMESTAMP NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tv.voice_packs (
        id SERIAL PRIMARY KEY,
        voice_id VARCHAR(120) NOT NULL,
        pack_type VARCHAR(32) NOT NULL,
        from_tier VARCHAR(32) NULL,
        to_tier VARCHAR(32) NOT NULL,
        from_pct INTEGER NOT NULL DEFAULT 0,
        to_pct INTEGER NOT NULL DEFAULT 0,
        extra_stars_unlocked INTEGER NOT NULL DEFAULT 0,
        xp_reward INTEGER NOT NULL DEFAULT 0,
        trigger_title VARCHAR(255) NULL,
        status VARCHAR(24) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        opened_at TIMESTAMP NULL
      );

      CREATE TABLE IF NOT EXISTS tv.trophies (
        id VARCHAR(80) PRIMARY KEY,
        category VARCHAR(64) NOT NULL DEFAULT 'volume',
        categories JSONB NOT NULL DEFAULT '[]'::jsonb,
        tier VARCHAR(32) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(64) NOT NULL,
        target_type VARCHAR(64) NOT NULL,
        target_value INTEGER NOT NULL DEFAULT 1,
        target_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS tv.user_trophies (
        trophy_id VARCHAR(80) PRIMARY KEY REFERENCES tv.trophies(id) ON DELETE CASCADE,
        is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
        unlocked_at TIMESTAMP NULL,
        progress_current INTEGER NOT NULL DEFAULT 0,
        progress_target INTEGER NOT NULL DEFAULT 1,
        progress_percentage INTEGER NOT NULL DEFAULT 0,
        checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_new BOOLEAN NOT NULL DEFAULT FALSE,
        test_override BOOLEAN DEFAULT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    tvSchemaEnsured = true;
  })().catch((err) => {
    ensurePromise = null;
    throw err;
  });

  return ensurePromise;
}
