import pool, { query } from './config/database';
import { fetchMovieDetailsByTitle } from './services/movieIntegration';

async function run() {
  try {
    // 1. Localizar o filme no banco
    const movieRes = await query("SELECT id FROM movies WHERE title ILIKE '%Vantagens%'");
    if (movieRes.rows.length === 0) {
      console.log('Filme "As Vantagens de Ser Invisível" não localizado no banco.');
      return;
    }
    const movieId = movieRes.rows[0].id;
    console.log(`Localizado filme "As Vantagens de Ser Invisível" com ID no banco: ${movieId}`);

    // 2. Buscar detalhes no TMDB
    console.log('Buscando dados no TMDB...');
    const data = await fetchMovieDetailsByTitle('The Perks of Being a Wallflower', 2012);
    
    // 3. Atualizar no banco
    await query(
      `UPDATE movies 
       SET imdb_id = $1, tmdb_id = $2, title = $3, original_title = $4, release_year = $5, runtime = $6, 
           synopsis = $7, poster_url = $8, country_code = $9, imdb_rating = $10, metacritic_score = $11, 
           rotten_tomatoes_score = $12, raw_api_data = $13
       WHERE id = $14`,
      [
        data.imdb_id,
        data.tmdb_id,
        data.title,
        data.original_title,
        data.release_year,
        data.runtime,
        data.synopsis,
        data.poster_url,
        data.country_code,
        data.imdb_rating,
        data.metacritic_score,
        data.rotten_tomatoes_score,
        JSON.stringify(data.raw_api_data),
        movieId
      ]
    );

    console.log('🟢 Filme "As Vantagens de Ser Invisível" atualizado com sucesso no banco de dados com imagem e metadados!');
  } catch (err: any) {
    console.error('Erro ao atualizar o filme:', err.message);
  } finally {
    pool.end();
  }
}

run();
