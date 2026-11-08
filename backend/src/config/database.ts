import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Garante o carregamento do .env independentemente do diretório de execução
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'movie_catalog',
});

// Helper genérico para queries
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

// Função para testar a conexão com o banco de dados
export const testConnection = async (): Promise<boolean> => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log(`[Database] Conexão estabelecida com sucesso. Hora do servidor DB: ${res.rows[0].now}`);
    
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
    
    return true;
  } catch (err: any) {
    console.error('[Database] Falha ao conectar ao banco de dados:', err.message);
    return false;
  }
};

export default pool;
