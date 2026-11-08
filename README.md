# 🎬 Cine Catalog (CineCatalog)

Um ecossistema completo para gerenciamento, exploração e gamificação do seu catálogo de cinema pessoal, integrando visualizações táticas, métricas de críticas globais, mapa mundial de coproduções e uma Sala de Troféus completa estilo PlayStation 5 (PS5 Edition).

---

## 🌟 Principais Recursos

- **Catálogo Inteligente:** Cadastro completo de filmes com integração automática de metadados, pôsteres e notas via TMDB e OMDb APIs.
- **Sala de Troféus (PS5 Edition):** Mais de 600 troféus distribuídos em 10 categorias temáticas e troféus multicategoria, sistema dinâmico de XP e níveis, alertas sonoros e visuais (Toast PS5) e ordenação interativa (Mais Recentes, Mais Raros, Maior Progresso e A-Z).
- **Desafio Volta ao Mundo:** Mapa tático interativo com acompanhamento de cobertura cinematográfica pelos 195 países membros da ONU.
- **Analytics & Crítica:** Comparativos de avaliações pessoais vs. Rotten Tomatoes, Metacritic e IMDb.
- **Filtros e Tags Customizadas:** Suporte a múltiplas tags personalizadas por filme (ex: `Em Família`, `Favoritos`, `Gore`, etc.).

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** (Vite)
- **Tailwind CSS**
- **Lucide Icons**
- **Canvas Confetti** & Web Audio API

### Backend
- **Node.js** & **TypeScript** (`tsx` / `tsc`)
- **Express**
- **PostgreSQL** (`pg`)
- **Integrações de API:** TMDB API & OMDb API

---

## 🚀 Como Executar o Projeto Localmente

### 1. Pré-requisitos
- Node.js (v18+)
- PostgreSQL (rodando localmente ou via container)

### 2. Configuração do Backend
```bash
cd backend
npm install
cp .env.example .env
# Preencha suas credenciais do PostgreSQL e chaves do TMDB/OMDb no arquivo .env
npm run dev
```

### 3. Configuração do Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📄 Licença
Projeto pessoal desenvolvido para fins de entretenimento e estudo.
