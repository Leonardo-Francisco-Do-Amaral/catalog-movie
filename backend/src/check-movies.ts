import { query } from './config/database';

async function run() {
  const ids = [267, 266, 265, 264, 263, 262, 261, 260, 259, 258, 257, 256, 255];
  const res = await query('SELECT id, title, original_title, poster_url FROM movies WHERE id = ANY($1)', [ids]);
  console.log('=== DADOS DOS FILMES NO BANCO ===');
  res.rows.forEach(r => {
    console.log(`ID: ${r.id} | Titulo: ${r.title} | Original: ${r.original_title} | Poster: ${r.poster_url}`);
  });
}

run().then(() => process.exit(0));
