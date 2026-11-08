import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const moviesToTest = [
  { title: 'The Imitation Game', year: 2015 },
  { title: 'To Save a Life', year: 2010 },
  { title: 'O Menino do Cinco', year: 2012 }, // Let's check
  { title: 'Ju-on: Owari no hajimari', year: 2014 },
  { title: 'Slapface', year: 2021 },
  { title: 'After Yang', year: 2021 },
  { title: 'Wilkolak', year: 2018 },
  { title: 'The Butcher Boy', year: 1997 },
  { title: 'Ich seh, Ich seh', year: 2014 },
  { title: 'The Cabin in the Woods', year: 2012 },
  { title: 'Emelie', year: 2015 },
  { title: 'Assassin\'s Creed', year: 2016 },
  { title: 'Limbo', year: 2021 },
  { title: 'Mysterious Skin', year: 2004 }
];

async function testSearch(title: string, year?: number) {
  try {
    // 1. Testar com ano
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=pt-BR`;
    if (year) url += `&year=${year}`;
    
    let res = await axios.get(url);
    if (res.data.results && res.data.results.length > 0) {
      const match = res.data.results[0];
      console.log(`✅ [Com ano] "${title}" (${year}) -> Achou: "${match.title}" (ID: ${match.id}) | Lançado em: ${match.release_date}`);
      return;
    }

    // 2. Testar sem ano
    let urlNoYear = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=pt-BR`;
    let resNoYear = await axios.get(urlNoYear);
    if (resNoYear.data.results && resNoYear.data.results.length > 0) {
      const match = resNoYear.data.results[0];
      console.log(`⚠️ [Sem ano] "${title}" (${year}) -> Achou apenas sem ano: "${match.title}" (ID: ${match.id}) | Lançado em: ${match.release_date}`);
    } else {
      console.log(`❌ [Falhou total] "${title}" (${year}) -> Nenhum resultado no TMDB`);
    }
  } catch (err: any) {
    console.error(`Erro ao buscar "${title}":`, err.message);
  }
}

async function run() {
  console.log('=== TESTANDO BUSCAS DO TMDB ===');
  for (const m of moviesToTest) {
    await testSearch(m.title, m.year);
  }
}

run();
