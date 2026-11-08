import axios from 'axios';

async function run() {
  try {
    const res = await axios.get('http://localhost:5000/api/movies/horror-suspense');
    const movies = res.data.data;
    console.log('=== RETORNO DO BACKEND (/api/movies/horror-suspense) ===');
    console.log(`Total de filmes: ${movies.length}`);
    movies.slice(0, 25).forEach((m: any, idx: number) => {
      console.log(`${idx + 1}. ID: ${m.id} | Titulo: ${m.title} | Rating: ${m.user_rating} | Watched At: ${m.watched_at}`);
    });
  } catch (err: any) {
    console.error('Erro ao conectar na API:', err.message);
  }
}

run();
