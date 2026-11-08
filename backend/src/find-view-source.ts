import { query } from './config/database';

async function run() {
  const res = await query(`
    SELECT mv.*, m.title, m.original_title 
    FROM movie_views mv 
    JOIN movies m ON mv.movie_id = m.id 
    WHERE m.id IN (210, 161)
  `);
  console.log('=== DADOS DAS VISUALIZAÇÕES DOS FILMES MISTERIOSOS ===');
  res.rows.forEach(r => {
    console.log(`\nFilme: ${r.title} (ID Filme: ${r.movie_id})`);
    console.log(`- Nota do usuário: ${r.user_rating}`);
    console.log(`- Data Vista: Mês ${r.month_seen}, Ano ${r.year_seen}`);
    console.log(`- Plataforma: ${r.platform}`);
    console.log(`- Áudio: ${r.audio_type}`);
    console.log(`- Classificação (review_notes): ${r.review_notes}`);
  });
}

run().then(() => process.exit(0));
