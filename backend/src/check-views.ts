import { query } from './config/database';

async function run() {
  const ids = [267, 266, 265, 264, 263, 262, 261, 260, 259, 258, 257, 256, 255];
  const res = await query('SELECT id, movie_id, user_rating FROM movie_views WHERE id = ANY($1)', [ids]);
  console.log('=== ASSOCIAÇÃO DE VISUALIZAÇÕES COM FILMES ===');
  res.rows.forEach(r => {
    console.log(`View ID: ${r.id.toString().padEnd(3)} | Movie ID: ${r.movie_id.toString().padEnd(3)} | User Rating: ${r.user_rating}`);
  });
}

run().then(() => process.exit(0));
