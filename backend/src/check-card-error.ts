import { query } from './config/database';

async function run() {
  // Buscar o 13º filme ("Do Começo ao Fim") e os filmes da tag "Preto e branco" ("A Infância de Ivan", "O Sétimo Selo")
  const res = await query(`
    SELECT m.*, mv.user_rating, 
           (SELECT COALESCE(array_agg(ut.name), '{}') FROM movie_tags mt JOIN user_tags ut ON mt.tag_id = ut.id WHERE mt.movie_id = m.id) as tags
    FROM movies m
    JOIN movie_views mv ON mv.movie_id = m.id
    WHERE m.title IN ('Do Começo ao Fim', 'A Infância de Ivan', 'O Sétimo Selo')
  `);
  console.log('=== PROPRIEDADES DOS FILMES SUSPEITOS ===');
  res.rows.forEach(r => {
    console.log(`\nFilme: ${r.title} (ID: ${r.id})`);
    console.log(`- Original: ${r.original_title}`);
    console.log(`- Poster: ${r.poster_url}`);
    console.log(`- User Rating: ${r.user_rating} (Type: ${typeof r.user_rating})`);
    console.log(`- IMDb Rating: ${r.imdb_rating} (Type: ${typeof r.imdb_rating})`);
    console.log(`- Metacritic Score: ${r.metacritic_score} (Type: ${typeof r.metacritic_score})`);
    console.log(`- Tags:`, r.tags, `(IsArray: ${Array.isArray(r.tags)})`);
  });
}

run().then(() => process.exit(0));
