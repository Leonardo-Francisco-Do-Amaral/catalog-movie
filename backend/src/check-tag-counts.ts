import { query } from './config/database';

async function run() {
  const res = await query(`
    SELECT ut.name as tag_name, COUNT(DISTINCT mv.id) as view_count,
           array_agg(DISTINCT m.title) as movies
    FROM movie_tags mt
    JOIN user_tags ut ON mt.tag_id = ut.id
    JOIN movies m ON mt.movie_id = m.id
    JOIN movie_views mv ON mv.movie_id = m.id
    GROUP BY ut.name
    ORDER BY view_count DESC
  `);
  console.log('=== CONTAGEM DE VISUALIZAÇÕES POR TAG NO BANCO ===');
  res.rows.forEach(r => {
    console.log(`Tag: ${r.tag_name.padEnd(25)} | Qtd Views: ${r.view_count} | Filmes: ${r.movies.slice(0, 5).join(', ')}`);
  });
}

run().then(() => process.exit(0));
