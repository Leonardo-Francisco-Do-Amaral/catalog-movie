import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function run() {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent('Children of the Night')}&language=pt-BR`;
  const res = await axios.get(url);
  console.log('=== RESULTADOS PARA CHILDREN OF THE NIGHT NO TMDB ===');
  res.data.results.slice(0, 15).forEach((m: any) => {
    console.log(`Title: ${m.title} | Release Date: ${m.release_date} | TMDB ID: ${m.id} | Overview: ${m.overview?.substring(0, 100)}...`);
  });
}

run();
