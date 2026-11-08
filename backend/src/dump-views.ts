import { query } from './config/database';

async function run() {
  const res = await query('SELECT id, movie_id, user_rating FROM movie_views ORDER BY id ASC');
  console.log('=== DUMP DE TODAS AS VISUALIZAÇÕES NO BANCO ===');
  console.log(`Total de visualizações: ${res.rows.length}`);
  res.rows.forEach(r => {
    if (r.movie_id === 127) {
      console.log(`>>> VIEW ID: ${r.id} | MOVIE ID: ${r.movie_id} | Rating: ${r.user_rating} (IT)`);
    } else {
      console.log(`    View ID: ${r.id.toString().padEnd(3)} | Movie ID: ${r.movie_id.toString().padEnd(3)} | Rating: ${r.user_rating}`);
    }
  });
}

run().then(() => process.exit(0));
