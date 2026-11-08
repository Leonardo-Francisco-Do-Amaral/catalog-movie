import { query } from './config/database';

async function run() {
  const res = await query(
    "SELECT id, title, imdb_id, tmdb_id FROM movies WHERE poster_url = 'https://image.tmdb.org/t/p/w500/qjKvLv6Z2D9QWEOdnsrffguazHk.jpg'"
  );
  console.log('=== FILMES COM O MESMO PÔSTER DE IT ===');
  console.log(res.rows);
  console.log('Total:', res.rows.length);
}

run().then(() => process.exit(0));
