import pool from './config/database';

async function run() {
  try {
    console.log('[Schema Migration] Iniciando alteração da estrutura do banco de dados...');
    
    // 1. Criar tabela de países
    await pool.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      )
    `);
    console.log('✅ Tabela "countries" criada/verificada.');

    // 2. Criar tabela pivô movie_countries
    await pool.query(`
      CREATE TABLE IF NOT EXISTS movie_countries (
        movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
        country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
        PRIMARY KEY (movie_id, country_id)
      )
    `);
    console.log('✅ Tabela pivô "movie_countries" criada/verificada.');

    // 3. Remover coluna antiga country_code
    await pool.query(`
      ALTER TABLE movies DROP COLUMN IF EXISTS country_code
    `);
    console.log('✅ Coluna "country_code" removida da tabela "movies".');

    // 4. Adicionar coluna is_custom a tabela movies
    await pool.query(`
      ALTER TABLE movies ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE
    `);
    console.log('✅ Coluna "is_custom" adicionada à tabela "movies".');

    // 5. Adicionar colunas do Oscar
    await pool.query(`
      ALTER TABLE movies ADD COLUMN IF NOT EXISTS oscar_wins INTEGER DEFAULT 0;
      ALTER TABLE movies ADD COLUMN IF NOT EXISTS oscar_nominations INTEGER DEFAULT 0;
    `);
    console.log('✅ Colunas "oscar_wins" e "oscar_nominations" adicionadas à tabela "movies".');

    // 6. Coluna original_csv_title
    await pool.query(`
      ALTER TABLE movies ADD COLUMN IF NOT EXISTS original_csv_title VARCHAR(255);
    `);
    console.log('✅ Coluna "original_csv_title" adicionada.');

    // 7. Criar tabelas de estúdios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS studios (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );
      CREATE TABLE IF NOT EXISTS movie_studios (
        movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
        studio_id INTEGER REFERENCES studios(id) ON DELETE CASCADE,
        PRIMARY KEY (movie_id, studio_id)
      );
    `);
    console.log('✅ Tabelas "studios" e "movie_studios" criadas/verificadas.');

    // 8. Adicionar coluna vote_count à tabela movies
    await pool.query(`
      ALTER TABLE movies ADD COLUMN IF NOT EXISTS vote_count INTEGER DEFAULT 0;
    `);
    console.log('✅ Coluna "vote_count" adicionada/verificada.');

    // 9. Adicionar coluna distributor à tabela movies
    await pool.query(`
      ALTER TABLE movies ADD COLUMN IF NOT EXISTS distributor VARCHAR(255);
    `);
    console.log('✅ Coluna "distributor" adicionada/verificada.');

    // 10. Criar tabelas de roteiristas (writers e movie_writers)
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
    `);
    console.log('✅ Tabelas "writers" e "movie_writers" criadas/verificadas.');

    console.log('🟢 [Schema Migration] Estrutura do banco de dados updated successfully!');
  } catch (err: any) {
    console.error('🔴 Erro na migração de esquema:', err.message);
  } finally {
    pool.end();
  }
}

run();
