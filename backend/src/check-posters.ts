import { query } from './config/database';

async function run() {
  const ids = [127, 267, 266, 265, 264, 263, 262, 261, 260, 259, 258, 257, 256, 255];
  const res = await query('SELECT id, title, poster_url FROM movies WHERE id = ANY($1)', [ids]);
  console.log('=== PÔSTERES DOS FILMES NO BANCO ===');
  res.rows.forEach(r => {
    console.log(`ID: ${r.id.toString().padEnd(3)} | Titulo: ${r.title.padEnd(30)} | Poster: ${r.poster_url}`);
  });
}

run().then(() => process.exit(0));
