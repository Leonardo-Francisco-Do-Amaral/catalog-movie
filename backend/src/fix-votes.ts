import pool from './config/database';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const OMDB_API_KEY = process.env.OMDB_API_KEY || 'trilogy';
const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;

async function run() {
  console.log('[Fix Votes] Iniciando varredura de filmes no banco com 0 votos...');
  
  const moviesRes = await pool.query(
    'SELECT id, title, imdb_id, tmdb_id, raw_api_data, vote_count FROM movies WHERE vote_count = 0 OR vote_count IS NULL'
  );
  
  const movies = moviesRes.rows;
  console.log(`[Fix Votes] Encontrados ${movies.length} filmes com 0 ou NULL votos.`);
  
  let fixedCount = 0;
  
  for (const movie of movies) {
    let voteCount: number | null = null;
    const rawData = movie.raw_api_data;
    
    // 1. Tentar extrair do raw_api_data
    if (rawData) {
      // Prioridade A: OMDb (imdbVotes)
      if (rawData.omdb && rawData.omdb.imdbVotes && rawData.omdb.imdbVotes !== 'N/A') {
        voteCount = parseInt(rawData.omdb.imdbVotes.replace(/,/g, ''), 10);
      }
      // Prioridade B: TMDB (vote_count)
      if (!voteCount && rawData.tmdb && rawData.tmdb.vote_count) {
        voteCount = Number(rawData.tmdb.vote_count);
      }
    }
    
    // 2. Se não conseguiu do JSON local, tenta buscar nas APIs em tempo real
    if (!voteCount && movie.imdb_id) {
      try {
        console.log(`[Fix Votes] Buscando votos do OMDb em tempo real para "${movie.title}" (${movie.imdb_id})...`);
        const url = `http://www.omdbapi.com/?i=${movie.imdb_id}&apikey=${OMDB_API_KEY}`;
        const response = await axios.get(url);
        if (response.data && response.data.Response === 'True' && response.data.imdbVotes && response.data.imdbVotes !== 'N/A') {
          voteCount = parseInt(response.data.imdbVotes.replace(/,/g, ''), 10);
        }
      } catch (err: any) {
        console.error(`[Fix Votes] Erro OMDb para "${movie.title}":`, err.message);
      }
    }
    
    if (!voteCount && movie.tmdb_id && TMDB_BEARER_TOKEN) {
      try {
        console.log(`[Fix Votes] Buscando votos do TMDB em tempo real para "${movie.title}" (TMDB ID: ${movie.tmdb_id})...`);
        const url = `https://api.themoviedb.org/3/movie/${movie.tmdb_id}`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${TMDB_BEARER_TOKEN}` }
        });
        if (response.data && response.data.vote_count) {
          voteCount = Number(response.data.vote_count);
        }
      } catch (err: any) {
        console.error(`[Fix Votes] Erro TMDB para "${movie.title}":`, err.message);
      }
    }
    
    // 3. Se ainda assim não encontrar, tenta busca textual no TMDB
    if (!voteCount && TMDB_BEARER_TOKEN) {
      try {
        console.log(`[Fix Votes] Buscando textual TMDB em tempo real para "${movie.title}"...`);
        const searchUrl = `https://api.themoviedb.org/3/search/movie`;
        const searchResponse = await axios.get(searchUrl, {
          headers: { Authorization: `Bearer ${TMDB_BEARER_TOKEN}` },
          params: { query: movie.title, language: 'pt-BR' }
        });
        const results = searchResponse.data?.results;
        if (results && results.length > 0) {
          const matched = results[0];
          // Busca detalhes do primeiro resultado
          const detailUrl = `https://api.themoviedb.org/3/movie/${matched.id}?append_to_response=external_ids`;
          const detailResponse = await axios.get(detailUrl, {
            headers: { Authorization: `Bearer ${TMDB_BEARER_TOKEN}` }
          });
          const imdbId = detailResponse.data?.external_ids?.imdb_id || detailResponse.data?.imdb_id;
          
          if (imdbId) {
            const omdbUrl = `http://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`;
            const omdbResponse = await axios.get(omdbUrl);
            if (omdbResponse.data && omdbResponse.data.Response === 'True' && omdbResponse.data.imdbVotes && omdbResponse.data.imdbVotes !== 'N/A') {
              voteCount = parseInt(omdbResponse.data.imdbVotes.replace(/,/g, ''), 10);
            }
          }
          if (!voteCount && detailResponse.data?.vote_count) {
            voteCount = Number(detailResponse.data.vote_count);
          }
        }
      } catch (err: any) {
        console.error(`[Fix Votes] Erro busca textual para "${movie.title}":`, err.message);
      }
    }
    
    // 4. Grava no banco se encontrou valor válido
    if (voteCount && !isNaN(voteCount)) {
      await pool.query('UPDATE movies SET vote_count = $1 WHERE id = $2', [voteCount, movie.id]);
      console.log(`✅ [Fix Votes] Atualizado "${movie.title}": ${voteCount} votos.`);
      fixedCount++;
    } else {
      console.log(`❌ [Fix Votes] Não foi possível encontrar votos para "${movie.title}". Mantido em 0.`);
    }
  }
  
  console.log(`\n🟢 [Fix Votes] Concluído! ${fixedCount} filmes foram atualizados com votos corretos.`);
}

run().then(() => pool.end());
