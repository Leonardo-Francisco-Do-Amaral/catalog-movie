import { query } from './config/database';

async function run() {
  const highRated = await query("SELECT m.id, m.title, mv.user_rating FROM movie_views mv JOIN movies m ON mv.movie_id = m.id WHERE mv.user_rating >= 9.5");
  console.log('=== FILMES COM NOTA >= 9.5 NO BANCO ===');
  console.log(highRated.rows);
  console.log('Total:', highRated.rows.length);
}

run().then(() => process.exit(0));
