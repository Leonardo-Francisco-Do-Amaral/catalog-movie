import { query } from './config/database';

async function run() {
  const res = await query(`
    SELECT id, title, original_title, tmdb_id, poster_url, raw_api_data
    FROM movies
    WHERE title ILIKE '%100%' OR title ILIKE '%Steve%' OR title ILIKE '%Pentecostal%'
  `);
  console.log('=== FILMES MISTERIOSOS NO BANCO ===');
  res.rows.forEach(r => {
    console.log(`\nID: ${r.id} | Title: ${r.title} | Original: ${r.original_title} | TMDB ID: ${r.tmdb_id}`);
    if (r.raw_api_data) {
      const api = typeof r.raw_api_data === 'string' ? JSON.parse(r.raw_api_data) : r.raw_api_data;
      const tmdbTitle = api.tmdb ? api.tmdb.title : 'N/A';
      console.log(`- TMDB search result title: ${tmdbTitle}`);
      console.log(`- Raw search query: ${api.tmdb?.original_title || 'N/A'}`);
    }
  });
}

run().then(() => process.exit(0));
