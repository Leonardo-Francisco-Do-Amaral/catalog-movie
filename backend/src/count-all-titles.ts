import axios from 'axios';

async function run() {
  try {
    const res = await axios.get('http://localhost:5000/api/movies/all');
    const movies = res.data.data;
    const titleCounts: Record<string, number> = {};
    
    movies.forEach((m: any) => {
      titleCounts[m.title] = (titleCounts[m.title] || 0) + 1;
    });

    console.log('=== CONTAGEM DE TÍTULOS NO RETORNO DA API ===');
    const sorted = Object.entries(titleCounts).sort((a, b) => b[1] - a[1]);
    console.log(sorted.slice(0, 15));
  } catch (err: any) {
    console.error('Erro ao conectar na API:', err.message);
  }
}

run();
