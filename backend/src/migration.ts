import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import pool from './config/database';
import { fetchMovieDetailsByTitle, normalizeGenre } from './services/movieIntegration';
import { ConsolidatedMovieData } from './types';

// Função utilitária de delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Função para gerar slugs amigáveis para as tags
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // remove acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '') // remove caracteres especiais
    .replace(/\s+/g, '-') // substitui espaços por hifens
    .replace(/-+/g, '-'); // colapsa hifens repetidos
}

// Função utilitária para normalizar títulos de filmes para comparação de strings
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Normalizador para corrigir erros comuns de digitação de tags ao longo de 11 anos
function normalizeTag(tagName: string): string {
  // Remove hifens, barras ou espaços residuais no início/fim
  const clean = tagName.trim().replace(/^[-/]+|[-/]+$/g, '').trim();
  const lower = clean.toLowerCase();
  
  if (!clean) return '';
  
  if (lower === 'gori' || lower === 'gore') return 'Gore';
  if (lower.includes('lgbt') || lower.includes('persoangem') || lower.includes('persomagem') || lower.includes('presonagem')) return 'Personagem LGBT';
  if (lower.includes('colegio') || lower.includes('colegico') || lower.includes('cologio') || lower.includes('escola')) return 'Colegio/Escola';
  if (lower.startsWith('emoci') || lower.startsWith('emocin') || lower.includes('emocionan')) return 'Emocionante';
  if (lower.includes('criança malvada') || lower.includes('crianção malvada') || lower.includes('crianca malvada')) return 'Criança Malvada';
  if (lower.includes('preconceito') || lower.includes('precoceito')) return 'Preconceito';
  
  // Unifica Super-Herói, Herói e Super Poder na tag única "Super Poder"
  if (
    lower.includes('super hero') || 
    lower.includes('superhero') || 
    lower === 'heroi' || 
    lower === 'heroí' || 
    lower.includes('super poder') || 
    lower.includes('superpoder')
  ) {
    return 'Super Poder';
  }
  
  if (lower.includes('viajem') || lower.includes('viagem') || lower.includes('viajaem')) return 'Viagem no Tempo';
  if (lower === 'alies' || lower === 'aliens') return 'Aliens';
  if (lower.includes('multiver')) return 'Multiverso';
  if (lower.includes('parodia') || lower.includes('paródia')) return 'Paródia';
  if (lower.includes('demonio') || lower.includes('demônio')) return 'Demônio';
  if (lower.includes('fatos reais') || lower.includes('fatos reias')) return 'Fatos Reais';
  if (lower.includes('tragico') || lower.includes('trágico')) return 'Trágico';
  if (lower.includes('lobisomen') || lower.includes('lobisomem')) return 'Lobisomem';
  if (lower.includes('religiao') || lower.includes('religião') || lower.includes('religão')) return 'Religião';
  if (lower === 'preto branco' || lower === 'preto e branco') return 'Preto e branco';
  if (lower === 'x-men' || lower === 'x-man' || lower === 'x-men ') return 'X-Men';
  if (lower.includes('final epico') || lower.includes('final épico')) return 'Final Epico';
  
  if (lower === 'x' || lower === 'men' || lower === 'man') return ''; // descarta resíduos indesejados
  
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function sanitizePlatform(rawPlatform: string | undefined): string {
  if (!rawPlatform || !rawPlatform.trim()) return 'Não Informado';
  const p = rawPlatform.toLowerCase().trim();
  if (p.includes('aplle') || p.includes('apple')) return 'Apple TV+';
  if (p.includes('cinema')) return 'Cinema';
  if (p.includes('internet')) return 'Internet';
  if (p.includes('netflix')) return 'Netflix';
  return rawPlatform.trim();
}

interface CSVRow {
  'Nome Original': string;
  'Tradução': string;
  'Imagem': string;
  'Pais de Origem': string;
  'Ano do filme': string;
  'Mês visto': string;
  'ano visto ': string; // com espaço no final
  'Áudio': string;
  'Visto em': string;
  'Gênero/Tema': string;
  'Tag': string;
  'Total de analise IMDB': string;
  'Faixa etaria': string;
  'minha nota': string;
  'IMDB': string;
  'MetaScore': string;
  'Nota tolal': string;
  'Clasificação': string;
  'produção/Estudio': string;
  'Distribuição': string;
  'nomeação a óscar': string;
  'Oscar ganho': string;
  'Duração em minutos': string;
  'Direção': string;
  'Roteiro': string;
}

// Ler todas as linhas do CSV e retorná-las como array
function readCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`Arquivo CSV não encontrado no caminho: ${filePath}`));
    }
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

// Mapeamento manual para corrigir filmes com nomes ambíguos ou muito comuns que o TMDB confunde
const MANUAL_TMDB_OVERRIDES: Record<string, number> = {
  'Pentecost': 99581,
  'Where the Wild Things Are': 16523,
  'Onde Vivem os Monstros': 16523,
  'Limbo - Children of night': 308650,
  'The Son': -1,
  'Hann': -1,
};

async function runMigration() {
  const csvPath = path.join(__dirname, '../Filmes versao reboot 2.0 att 29-04-2024 (1) (2).xlsm - Filmes.csv');
  console.log(`[Migration] Iniciando leitura do CSV em: ${csvPath}`);

  let rows: any[] = [];
  try {
    rows = await readCSV(csvPath);
    console.log(`[Migration] Leitura do CSV concluída. Total de registros: ${rows.length}`);
  } catch (err: any) {
    console.error(`[Migration] Erro ao ler arquivo CSV:`, err.message);
    process.exit(1);
  }

  // LIMPEZA DO BANCO: Deleta apenas registros de filmes não customizados (is_custom = FALSE)
  try {
    console.log('[Migration] Limpando dados antigos não customizados do banco de dados...');
    await pool.query(`
      DELETE FROM movie_views WHERE movie_id IN (SELECT id FROM movies WHERE is_custom = FALSE);
      DELETE FROM movie_tags WHERE movie_id IN (SELECT id FROM movies WHERE is_custom = FALSE);
      DELETE FROM movie_api_genres WHERE movie_id IN (SELECT id FROM movies WHERE is_custom = FALSE);
      DELETE FROM movie_directors WHERE movie_id IN (SELECT id FROM movies WHERE is_custom = FALSE);
      DELETE FROM movie_writers WHERE movie_id IN (SELECT id FROM movies WHERE is_custom = FALSE);
      DELETE FROM movie_studios WHERE movie_id IN (SELECT id FROM movies WHERE is_custom = FALSE);
      DELETE FROM movie_countries WHERE movie_id IN (SELECT id FROM movies WHERE is_custom = FALSE);
      DELETE FROM movies WHERE is_custom = FALSE;

      DELETE FROM user_tags WHERE id NOT IN (SELECT tag_id FROM movie_tags);
      DELETE FROM api_genres WHERE id NOT IN (SELECT genre_id FROM movie_api_genres);
      DELETE FROM directors WHERE id NOT IN (SELECT director_id FROM movie_directors);
      DELETE FROM writers WHERE id NOT IN (SELECT writer_id FROM movie_writers);
      DELETE FROM studios WHERE id NOT IN (SELECT studio_id FROM movie_studios);
      DELETE FROM countries WHERE id NOT IN (SELECT country_id FROM movie_countries);
    `);
    console.log(`[Migration] Banco de dados limpo com sucesso (preservando filmes customizados)!`);
  } catch (err: any) {
    console.error(`[Migration] Erro ao limpar o banco de dados:`, err.message);
    process.exit(1);
  }

  // Estatísticas de processamento
  let successCount = 0;
  let apiSuccessCount = 0;
  let apiFallbackCount = 0;
  let failCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const rawRow = rows[i];
    
    // Limpar espaços extras em branco das chaves das colunas do CSV
    const row: any = {};
    for (const key of Object.keys(rawRow)) {
      row[key.trim()] = rawRow[key];
    }

    const originalTitle = row['Nome Original']?.trim();
    const translatedTitle = row['Tradução']?.trim();
    
    let movieTitleForSearch = originalTitle || translatedTitle;
    let releaseYearStr = row['Ano do filme']?.trim();
    let releaseYear = releaseYearStr ? parseInt(releaseYearStr, 10) : undefined;

    // Ajuste manual específico para diferenciar "It: A Coisa" (2017) de "It: Capítulo Dois" (2019)
    // na busca das APIs, evitando que ambos resolvam para o filme de 2019
    if (originalTitle === 'It' || translatedTitle === 'It: A Coisa') {
      movieTitleForSearch = 'It';
      releaseYear = 2017;
    }

    const manualTmdbId = movieTitleForSearch ? MANUAL_TMDB_OVERRIDES[movieTitleForSearch] : undefined;

    let rawCountriesStr = row['Pais de Origem']?.trim() || '';
    
    // Substituições prévias no texto bruto antes de quebrar em '-'
    rawCountriesStr = rawCountriesStr.replace(/A-lemanha-Ocidental/gi, 'Alemanha Ocidental');
    rawCountriesStr = rawCountriesStr.replace(/Espanha\s*\n\s*Espanha\s*Tailândia/gi, 'Espanha');
    rawCountriesStr = rawCountriesStr.replace(/Espanha\s*\r\n\s*Espanha\s*Tailândia/gi, 'Espanha');
    rawCountriesStr = rawCountriesStr.replace(/Espanha\s+Espanha\s+Tailândia/gi, 'Espanha');

    const parsedCountries = rawCountriesStr
      ? rawCountriesStr
          .split('-')
          .map((c: string) => {
            const trimmed = c.trim().replace(/\r?\n|\r/g, ' '); // Remove quebras de linha
            const lower = trimmed.toLowerCase();

            // Ignorar lixo contendo Espanha/Tailândia mesclados
            if (
              (lower.includes('tailândia') && lower.includes('espanha')) ||
              (lower.includes('tailandia') && lower.includes('espenha')) ||
              (lower.includes('tailandia') && lower.includes('espanha'))
            ) {
              return '';
            }

            // Mapeamentos específicos de unificação e correção
            if (lower === 'eua') {
              return 'Estados Unidos';
            }
            if (lower === 'alemanha ocidental') {
              return 'Alemanha Ocidental';
            }
            if (lower === 'a' || lower === 'lemanha' || lower === 'ocidental') {
              return 'Alemanha';
            }
            if (lower === 'africa do sul') {
              return 'África do Sul';
            }
            if (lower === 'australia') {
              return 'Austrália';
            }
            if (lower === 'austria') {
              return 'Áustria';
            }
            if (lower === 'bulgaria') {
              return 'Bulgária';
            }
            if (lower === 'canada' || lower === 'canadá') {
              return 'Canadá';
            }
            if (lower === 'espanha' || lower === 'espenha') {
              return 'Espanha';
            }
            if (lower === 'frança') {
              return 'França';
            }
            if (lower === 'islandia') {
              return 'Islândia';
            }
            if (lower === 'korei da sul' || lower === 'coreia do sul') {
              return 'Coreia do Sul';
            }
            if (lower === 'mexico') {
              return 'México';
            }
            if (lower === 'nova zelandia') {
              return 'Nova Zelândia';
            }
            if (lower === 'paises baixo' || lower === 'paisses baixos' || lower === 'países baixos') {
              return 'Países Baixos';
            }
            if (lower === 'pôlonia' || lower === 'polonia') {
              return 'Polônia';
            }
            if (lower === 'republica checa') {
              return 'República Checa';
            }
            if (lower === 'roménia' || lower === 'romenia') {
              return 'Romênia';
            }
            if (lower === 'suecia') {
              return 'Suécia';
            }

            // Capitaliza a primeira letra de cada palavra por padrão se não cair em regras específicas
            return trimmed
              .split(' ')
              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');
          })
          .filter(Boolean)
      : [];

    if (!movieTitleForSearch) {
      console.warn(`[Migration] [Linha ${i + 2}] Ignorando linha vazia ou sem título.`);
      continue;
    }

    console.log(`\n--------------------------------------------------`);
    console.log(`[Migration] [${i + 1}/${rows.length}] Processando: "${movieTitleForSearch}" (${releaseYear || 'Ano N/A'})`);

    const rawWins = parseInt(row['Oscar ganho']?.trim() || '0', 10);
    const rawNoms = parseInt(row['nomeação a óscar']?.trim() || '0', 10);
    const oscarWins = isNaN(rawWins) ? 0 : rawWins;
    const oscarNominations = isNaN(rawNoms) ? 0 : rawNoms;

    let movieData: ConsolidatedMovieData & { is_custom?: boolean };
    let usingAPI = false;
    let commitLogMessage = '';

    // 1. Tenta buscar informações completas nas APIs (TMDB + OMDb)
    try {
      const apiMovieData = await fetchMovieDetailsByTitle(movieTitleForSearch, releaseYear, manualTmdbId);
      
      // Validação de correspondência (Match Validation)
      const normApiTitle = normalizeTitle(apiMovieData.title || '');
      const normApiOrigTitle = normalizeTitle(apiMovieData.original_title || '');
      const normCsvTrans = translatedTitle ? normalizeTitle(translatedTitle) : '';
      const normCsvOrig = originalTitle ? normalizeTitle(originalTitle) : '';

      const titleMatches = 
        (normCsvTrans && (normApiTitle === normCsvTrans || normApiOrigTitle === normCsvTrans)) ||
        (normCsvOrig && (normApiTitle === normCsvOrig || normApiOrigTitle === normCsvOrig));

      let yearMatches = true;
      if (releaseYear && apiMovieData.release_year) {
        const diff = Math.abs(apiMovieData.release_year - releaseYear);
        yearMatches = diff <= 1;
      }

      const isValidMatch = !!manualTmdbId || (titleMatches && yearMatches);

      if (isValidMatch) {
        movieData = { ...apiMovieData, is_custom: false, oscar_wins: oscarWins, oscar_nominations: oscarNominations };
        usingAPI = true;
        apiSuccessCount++;
        commitLogMessage = `🟢 [Migration] Sucesso (API): "${movieTitleForSearch}"`;
      } else {
        commitLogMessage = `🟡 [Migration] Segurança (Fallback Planilha): "${movieTitleForSearch}" - API trouxe o filme errado: "${apiMovieData.title}"`;
        
        // Lógica de Fallback Automático (O Filme Customizado)
        const countryCode = row['Pais de Origem'] ? row['Pais de Origem'].substring(0, 10) : null;
        const runtime = row['Duração em minutos'] ? parseInt(row['Duração em minutos'], 10) : null;
        const rawVotes = row['Total de analise IMDB']?.trim() || '';
        const parsedVotes = rawVotes ? parseInt(rawVotes.replace(/,/g, ''), 10) : 0;
        const voteCount = isNaN(parsedVotes) ? 0 : parsedVotes;
        
        const genres = row['Gênero/Tema'] 
          ? row['Gênero/Tema'].split('-').map((g: string) => g.trim()).filter(Boolean) 
          : [];
        
        const directors = row['Direção'] 
          ? row['Direção'].split('-').map((d: string) => d.trim()).filter(Boolean) 
          : [];
        
        const writers = row['Roteiro'] 
          ? row['Roteiro'].split('-').map((w: string) => w.trim()).filter(Boolean) 
          : [];
        
        const studios = row['produção/Estudio'] 
          ? row['produção/Estudio'].split('-').map((s: string) => s.trim()).filter(Boolean) 
          : [];

        movieData = {
          title: translatedTitle || originalTitle,
          original_title: originalTitle,
          release_year: releaseYear || null,
          runtime: isNaN(Number(runtime)) ? null : runtime,
          synopsis: null,
          poster_url: null,
          country_code: countryCode,
        countries: [],
          imdb_rating: null,
          metacritic_score: null,
          rotten_tomatoes_score: null,
          imdb_id: null,
          tmdb_id: 0,
          directors,
          writers,
          studios,
          genres,
          raw_api_data: { tmdb: null, omdb: null },
          is_custom: true,
          oscar_wins: oscarWins,
          oscar_nominations: oscarNominations,
          vote_count: voteCount
        };
        apiFallbackCount++;
      }
    } catch (err: any) {
      commitLogMessage = `🟡 [Migration] Segurança (Fallback Planilha): "${movieTitleForSearch}" - API falhou ou não encontrou o filme. Usando dados da planilha.`;
      
      const countryCode = row['Pais de Origem'] ? row['Pais de Origem'].substring(0, 10) : null;
      const runtime = row['Duração em minutos'] ? parseInt(row['Duração em minutos'], 10) : null;
      const rawVotes = row['Total de analise IMDB']?.trim() || '';
      const parsedVotes = rawVotes ? parseInt(rawVotes.replace(/,/g, ''), 10) : 0;
      const voteCount = isNaN(parsedVotes) ? 0 : parsedVotes;
      
      const genres = row['Gênero/Tema'] 
        ? row['Gênero/Tema'].split('-').map((g: string) => g.trim()).filter(Boolean) 
        : [];
      
      const directors = row['Direção'] 
        ? row['Direção'].split('-').map((d: string) => d.trim()).filter(Boolean) 
        : [];
      
      const writers = row['Roteiro'] 
        ? row['Roteiro'].split('-').map((w: string) => w.trim()).filter(Boolean) 
        : [];
      
      const studios = row['produção/Estudio'] 
        ? row['produção/Estudio'].split('-').map((s: string) => s.trim()).filter(Boolean) 
        : [];

      movieData = {
        title: translatedTitle || originalTitle,
        original_title: originalTitle,
        release_year: releaseYear || null,
        runtime: isNaN(Number(runtime)) ? null : runtime,
        synopsis: null,
        poster_url: null,
        country_code: countryCode,
        countries: [],
        imdb_rating: null,
        metacritic_score: null,
        rotten_tomatoes_score: null,
        imdb_id: null,
        tmdb_id: 0,
        directors,
        writers,
        studios,
        genres,
        raw_api_data: { tmdb: null, omdb: null },
        is_custom: true,
        oscar_wins: oscarWins,
        oscar_nominations: oscarNominations,
        vote_count: voteCount
      };
      apiFallbackCount++;
    }

    // Se a duração do filme for inferior a 50 minutos, adicionamos o gênero "Curta" automaticamente se não existir
    if (movieData.runtime && movieData.runtime < 50) {
      const hasCurta = movieData.genres.some(g => normalizeGenre(g) === 'Curta');
      if (!hasCurta) {
        movieData.genres.push('Curta');
      }
    }

    // 2. Persistir no Banco de Dados usando uma Transação SQL
    const dbClient = await pool.connect();
    try {
      await dbClient.query('BEGIN');

      // a) Verificar se o filme já existe (por imdb_id, tmdb_id ou título + ano de lançamento)
      let movieId: number | null = null;

      if (movieData.imdb_id) {
        const checkImdb = await dbClient.query('SELECT id FROM movies WHERE imdb_id = $1', [movieData.imdb_id]);
        if (checkImdb.rows.length > 0) movieId = checkImdb.rows[0].id;
      }

      // Verificação por tmdb_id, imdb_id ou (original_csv_title e release_year)
      if (movieData.tmdb_id && movieData.tmdb_id > 0) {
        const checkTmdb = await dbClient.query('SELECT id FROM movies WHERE tmdb_id = $1', [movieData.tmdb_id]);
        if (checkTmdb.rows.length > 0) movieId = checkTmdb.rows[0].id;
      }

      if (!movieId && movieData.imdb_id) {
        const checkImdb = await dbClient.query('SELECT id FROM movies WHERE imdb_id = $1', [movieData.imdb_id]);
        if (checkImdb.rows.length > 0) movieId = checkImdb.rows[0].id;
      }

      if (!movieId && movieTitleForSearch && movieData.release_year) {
        const checkCsvTitle = await dbClient.query(
          'SELECT id FROM movies WHERE original_csv_title = $1 AND release_year = $2',
          [movieTitleForSearch, movieData.release_year]
        );
        if (checkCsvTitle.rows.length > 0) movieId = checkCsvTitle.rows[0].id;
      }

      if (!movieId && movieData.release_year) {
        const checkTitle = await dbClient.query(
          'SELECT id FROM movies WHERE (title = $1 OR original_title = $2) AND release_year = $3',
          [movieData.title, movieData.original_title, movieData.release_year]
        );
        if (checkTitle.rows.length > 0) movieId = checkTitle.rows[0].id;
      }
 
      if (movieId) {
        console.log(`🔵 Mantido (Customizado pelo Usuário): "${movieTitleForSearch}"`);
        await dbClient.query('COMMIT');
        continue;
      }

      // Se não existir, insere o filme
      if (!movieId) {
        const rawDistributor = row['Distribuição']?.trim() || null;
        const insertMovieRes = await dbClient.query(
          `INSERT INTO movies (imdb_id, tmdb_id, title, original_title, release_year, runtime, synopsis, poster_url, imdb_rating, metacritic_score, rotten_tomatoes_score, raw_api_data, is_custom, oscar_wins, oscar_nominations, original_csv_title, vote_count, distributor)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING id`,
          [
            movieData.imdb_id || null,
            movieData.tmdb_id > 0 ? movieData.tmdb_id : null,
            movieData.title,
            movieData.original_title || null,
            movieData.release_year,
            movieData.runtime,
            movieData.synopsis,
            movieData.poster_url,
            movieData.imdb_rating,
            movieData.metacritic_score,
            movieData.rotten_tomatoes_score,
            movieData.raw_api_data.tmdb || movieData.raw_api_data.omdb ? JSON.stringify(movieData.raw_api_data) : null,
            movieData.is_custom || false,
            movieData.oscar_wins || 0,
            movieData.oscar_nominations || 0,
            movieData.title, // original_csv_title
            movieData.vote_count || 0,
            rawDistributor
          ]
        );
        movieId = insertMovieRes.rows[0].id;
        console.log(`[Migration] Novo filme cadastrado. DB ID: ${movieId}`);
      }

      // b) Inserir e Vincular Diretores
      for (const directorName of movieData.directors) {
        if (!directorName.trim()) continue;
        const dirRes = await dbClient.query(
          `INSERT INTO directors (name) VALUES ($1) 
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
          [directorName.trim()]
        );
        const directorId = dirRes.rows[0].id;
        await dbClient.query(
          `INSERT INTO movie_directors (movie_id, director_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [movieId, directorId]
        );
      }

      // Inserir e Vincular Roteiristas
      const writersList = movieData.writers || [];
      for (const writerName of writersList) {
        if (!writerName.trim()) continue;
        const writRes = await dbClient.query(
          `INSERT INTO writers (name) VALUES ($1) 
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
          [writerName.trim()]
        );
        const writerId = writRes.rows[0].id;
        await dbClient.query(
          `INSERT INTO movie_writers (movie_id, writer_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [movieId, writerId]
        );
      }

      // Inserir e Vincular Estúdios
      for (const studioName of movieData.studios) {
        if (!studioName.trim()) continue;
        const studioRes = await dbClient.query(
          `INSERT INTO studios (name) VALUES ($1) 
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
          [studioName.trim()]
        );
        const studioId = studioRes.rows[0].id;
        await dbClient.query(
          `INSERT INTO movie_studios (movie_id, studio_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [movieId, studioId]
        );
      }

      // Inserir e Vincular Gêneros
      for (const genreName of movieData.genres) {
        const normalized = normalizeGenre(genreName);
        if (!normalized) continue;
        const genreRes = await dbClient.query(
          `INSERT INTO api_genres (name) VALUES ($1) 
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
          [normalized]
        );
        const genreId = genreRes.rows[0].id;
        await dbClient.query(
          `INSERT INTO movie_api_genres (movie_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [movieId, genreId]
        );
      }

      // Inserir e Vincular Países (Muitos-para-Muitos) do CSV
      for (const countryName of parsedCountries) {
        if (!countryName.trim()) continue;
        const countryRes = await dbClient.query(
          `INSERT INTO countries (name) VALUES ($1) 
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
          [countryName.trim()]
        );
        const countryId = countryRes.rows[0].id;
        await dbClient.query(
          `INSERT INTO movie_countries (movie_id, country_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [movieId, countryId]
        );
      }

      // c) Processar e Inserir Dados Pessoais de Visualização (movie_views)
      const rawUserRating = row['minha nota']?.trim();
      const userRating = rawUserRating ? parseFloat(rawUserRating.replace(',', '.')) : 0;
      const monthSeen = row['Mês visto'] ? parseInt(row['Mês visto'].trim(), 10) : null;
      const yearSeen = row['ano visto'] ? parseInt(row['ano visto'].trim(), 10) : null;
      let audioType = row['Áudio']?.trim() || null;
      if (audioType) {
        const lowerAudio = audioType.toLowerCase();
        if (lowerAudio === 'dublado') {
          audioType = 'Dublado';
        } else if (lowerAudio === 'legendado') {
          audioType = 'Legendado';
        } else if (lowerAudio.includes('youtube')) {
          audioType = 'Legendado pelo Youtube';
        } else if (lowerAudio === 'original') {
          audioType = 'Original';
        }
      }
      const platform = sanitizePlatform(row['Visto em']?.trim());
      const reviewNotes = row['Clasificação']?.trim() || null;

      // Idempotência: Evita duplicar visualização igual (null-safe)
      const viewCheck = await dbClient.query(
        `SELECT id FROM movie_views 
         WHERE movie_id = $1 
           AND user_rating = $2 
           AND (month_seen = $3 OR (month_seen IS NULL AND $3 IS NULL)) 
           AND (year_seen = $4 OR (year_seen IS NULL AND $4 IS NULL))`,
        [movieId, userRating, monthSeen, yearSeen]
      );

      if (viewCheck.rows.length === 0) {
        await dbClient.query(
          `INSERT INTO movie_views (movie_id, user_rating, month_seen, year_seen, audio_type, platform, review_notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [movieId, userRating, monthSeen, yearSeen, audioType, platform, reviewNotes]
        );
        console.log(`[Migration] Visualização inserida com sucesso (Nota: ${userRating}, Plataforma: ${platform}).`);
      } else {
        console.log(`[Migration] Visualização já existente no banco de dados. Ignorando inserção da view.`);
      }

      // d) Processar Tags Customizadas do usuário com normalização de erros de escrita
      const tagsStr = row['Tag'] || '';
      // Separar as tags quando houver espaço em volta do hífen para preservar hifens internos (como X-Men)
      // O regex suporta hifens com espaço de um dos lados apenas para capturar formatações imperfeitas (como "Gore -Abuso")
      const customTagsRaw = tagsStr.split(/\s+-\s*|\s*-\s+/).map((t: string) => t.trim()).filter(Boolean);
      
      // Normaliza as tags e deduplica tags na mesma linha
      const customTags = Array.from(new Set(customTagsRaw.map(normalizeTag))).filter(Boolean) as string[];

      for (const tagName of customTags) {
        const slug = slugify(tagName);
        if (!tagName || !slug) continue;

        let tagId: number | null = null;
        const tagCheck = await dbClient.query(
          'SELECT id FROM user_tags WHERE name = $1 OR slug = $2',
          [tagName, slug]
        );

        if (tagCheck.rows.length > 0) {
          tagId = tagCheck.rows[0].id;
        } else {
          const tagRes = await dbClient.query(
            `INSERT INTO user_tags (name, slug) VALUES ($1, $2) RETURNING id`,
            [tagName, slug]
          );
          tagId = tagRes.rows[0].id;
        }

        await dbClient.query(
          `INSERT INTO movie_tags (movie_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [movieId, tagId]
        );
      }

      await dbClient.query('COMMIT');
      console.log(commitLogMessage);
      successCount++;
    } catch (err: any) {
      await dbClient.query('ROLLBACK');
      console.error(`🔴 [Migration] Erro Crítico: "${movieTitleForSearch}" - ${err.message}`);
      failCount++;
    } finally {
      dbClient.release();
    }

    // 3. Delay rate-limit friendly de 200ms
    if (usingAPI && i < rows.length - 1) {
      await sleep(200);
    }
  }

  // Exibir resumo do processamento
  console.log(`\n==================================================`);
  console.log(`[Migration] Processamento Finalizado!`);
  console.log(`- Registros totais no CSV: ${rows.length}`);
  console.log(`- Importados com sucesso: ${successCount}`);
  console.log(`- Sucesso via APIs (TMDB + OMDb): ${apiSuccessCount}`);
  console.log(`- Fallbacks locais da planilha: ${apiFallbackCount}`);
  console.log(`- Falhas ao salvar no banco: ${failCount}`);
  console.log(`==================================================`);
  
  pool.end();
  process.exit(0);
}

runMigration();
