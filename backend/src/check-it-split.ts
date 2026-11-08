import { query } from './config/database';

async function run() {
  const res = await query(`
    SELECT m.id, m.title, m.release_year, m.tmdb_id, m.poster_url, COUNT(mv.id) as view_count
    FROM movies m
    LEFT JOIN movie_views mv ON mv.movie_id = m.id
    WHERE m.title ILIKE '%It%'
    GROUP BY m.id
  `);
  console.log('=== VERIFICAÇÃO DOS FILMES "IT" NO BANCO ===');
  res.rows.forEach(r => {
    console.log(`Movie ID: ${r.id} | Title: ${r.title} | Year: ${r.release_year} | TMDB ID: ${r.tmdb_id} | Views: ${r.view_count}`);
    console.log(`- Poster URL: ${r.poster_url}`);
  });
}

run().then(() => process.exit(0));
