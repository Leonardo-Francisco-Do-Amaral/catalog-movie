import { AsyncLocalStorage } from 'node:async_hooks';
import { Pool, PoolClient } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Garante o carregamento do .env independentemente do diretório de execução
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const databaseUrl = process.env.DATABASE_URL?.trim();
const useSsl = Boolean(databaseUrl) || String(process.env.DB_SSL || '').toLowerCase() === 'true';

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'movie_catalog',
      ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    });

const transactionClientStorage = new AsyncLocalStorage<PoolClient>();

export const runWithTransactionClient = <T>(
  client: PoolClient,
  fn: () => Promise<T>
): Promise<T> => transactionClientStorage.run(client, fn);

// Helper genérico para queries (roteia automaticamente para a transação ativa em simulações/dry-run)
export const query = (text: string, params?: any[]) => {
  const activeClient = transactionClientStorage.getStore();
  if (activeClient) {
    return activeClient.query(text, params);
  }
  return pool.query(text, params);
};

let baseSchemaEnsured = false;

// Função para testar a conexão com o banco de dados
export const testConnection = async (): Promise<boolean> => {
  try {
    const res = await pool.query('SELECT NOW()');
    if (baseSchemaEnsured) {
      return true;
    }
    console.log(`[Database] Conexão estabelecida com sucesso. Hora do servidor DB: ${res.rows[0].now}`);
    
    // Garante estrutura base do catálogo (essencial para bancos vazios na nuvem como Neon)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        imdb_id VARCHAR(20) UNIQUE,
        tmdb_id INTEGER UNIQUE,
        title VARCHAR(255) NOT NULL,
        original_title VARCHAR(255),
        release_year INTEGER,
        runtime INTEGER,
        synopsis TEXT,
        poster_url TEXT,
        imdb_rating NUMERIC,
        metacritic_score INTEGER,
        rotten_tomatoes_score INTEGER,
        raw_api_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_custom BOOLEAN DEFAULT FALSE,
        oscar_wins INTEGER DEFAULT 0,
        oscar_nominations INTEGER DEFAULT 0,
        original_csv_title VARCHAR(255),
        vote_count INTEGER DEFAULT 0,
        distributor VARCHAR(255)
      );
      CREATE TABLE IF NOT EXISTS movie_views (
        id SERIAL PRIMARY KEY,
        movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
        user_rating NUMERIC NOT NULL,
        month_seen INTEGER CHECK (month_seen >= 1 AND month_seen <= 12),
        year_seen INTEGER,
        audio_type VARCHAR(50),
        platform VARCHAR(100),
        review_notes TEXT,
        watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS user_tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        slug VARCHAR(100)
      );
      CREATE TABLE IF NOT EXISTS movie_tags (
        movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES user_tags(id) ON DELETE CASCADE,
        PRIMARY KEY (movie_id, tag_id)
      );
      CREATE TABLE IF NOT EXISTS api_genres (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      );
      CREATE TABLE IF NOT EXISTS movie_api_genres (
        movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
        genre_id INTEGER REFERENCES api_genres(id) ON DELETE CASCADE,
        PRIMARY KEY (movie_id, genre_id)
      );
      CREATE TABLE IF NOT EXISTS directors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );
      CREATE TABLE IF NOT EXISTS movie_directors (
        movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
        director_id INTEGER REFERENCES directors(id) ON DELETE CASCADE,
        PRIMARY KEY (movie_id, director_id)
      );
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      );
      CREATE TABLE IF NOT EXISTS movie_countries (
        movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
        country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
        PRIMARY KEY (movie_id, country_id)
      );
      CREATE TABLE IF NOT EXISTS studios (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );
      CREATE TABLE IF NOT EXISTS movie_studios (
        movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
        studio_id INTEGER REFERENCES studios(id) ON DELETE CASCADE,
        PRIMARY KEY (movie_id, studio_id)
      );
      CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(release_year);
      CREATE INDEX IF NOT EXISTS idx_movies_imdb_id ON movies(imdb_id);
      CREATE INDEX IF NOT EXISTS idx_movie_views_rating ON movie_views(user_rating);
    `);

    // Auto-migração para garantir a coluna distributor, tabelas de roteiristas, tabelas do Desafio 195 Países e Sistema de Troféus
    await pool.query('ALTER TABLE movies ADD COLUMN IF NOT EXISTS distributor VARCHAR(255)');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS writers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );
      CREATE TABLE IF NOT EXISTS movie_writers (
        movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
        writer_id INTEGER REFERENCES writers(id) ON DELETE CASCADE,
        PRIMARY KEY (movie_id, writer_id)
      );
      CREATE TABLE IF NOT EXISTS world_challenge_picks (
        country_code VARCHAR(16) PRIMARY KEY,
        country_name VARCHAR(120) NOT NULL,
        champion_movie_id INTEGER REFERENCES movies(id) ON DELETE SET NULL,
        wishlist_title VARCHAR(255),
        wishlist_year INTEGER,
        wishlist_tmdb_id INTEGER,
        wishlist_poster_url TEXT,
        wishlist_director VARCHAR(255),
        wishlist_notes TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS world_challenge_movie_origins (
        movie_id INTEGER PRIMARY KEY REFERENCES movies(id) ON DELETE CASCADE,
        primary_country_code VARCHAR(16) NOT NULL,
        exclusive BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS trophies (
        id VARCHAR(80) PRIMARY KEY,
        category VARCHAR(64) DEFAULT 'volta_ao_mundo',
        tier VARCHAR(32) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(64) NOT NULL,
        target_type VARCHAR(64) NOT NULL,
        target_value INTEGER NOT NULL DEFAULT 1,
        target_metadata JSONB DEFAULT '{}'::jsonb,
        sort_order INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS user_trophies (
        trophy_id VARCHAR(80) PRIMARY KEY REFERENCES trophies(id) ON DELETE CASCADE,
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
    baseSchemaEnsured = true;
    return true;
  } catch (err: any) {
    console.error('[Database] Falha ao conectar ao banco de dados:', err.message);
    return false;
  }
};

export default pool;
