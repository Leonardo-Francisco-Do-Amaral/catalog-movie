import { testConnection } from './config/database';
import { fetchMovieDetailsByTitle } from './services/movieIntegration';

async function runTest() {
  console.log('=== TESTANDO CONEXÃO COM O BANCO DE DADOS ===');
  await testConnection();

  console.log('\n=== TESTANDO INTEGRAÇÃO DE APIS (BUSCA DE FILME) ===');
  const movieTitle = 'Inception';
  try {
    const movieData = await fetchMovieDetailsByTitle(movieTitle);
    console.log('Filme retornado com sucesso!');
    const { raw_api_data, ...cleanData } = movieData;
    console.log(JSON.stringify(cleanData, null, 2));
  } catch (err: any) {
    console.error('Erro ao buscar filme:', err.message);
  }
}

runTest().then(() => {
  console.log('\nTeste finalizado.');
  process.exit(0);
});
