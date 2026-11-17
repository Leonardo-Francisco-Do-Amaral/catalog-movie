import React, { Suspense, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Dashboard from './pages/Dashboard';
import PinLockScreen from './components/PinLockScreen';
import {
  API_BASE_URL,
  AUTH_REQUIRED_EVENT,
  clearStoredPinToken,
  getStoredPinToken,
} from './utils/apiConfig';

const TV_MODULE_ENABLED = import.meta.env.VITE_ENABLE_ANIME_MODULE === 'true';
const TvDashboard = TV_MODULE_ENABLED
  ? React.lazy(() => import('./modules/tv/TvDashboard'))
  : null;

const MODE_STORAGE_KEY = 'cine_catalog_app_mode';

function App() {
  const [authStatus, setAuthStatus] = useState(() =>
    getStoredPinToken() ? 'checking' : 'locked'
  );
  const [lockReason, setLockReason] = useState('');

  const [appMode, setAppMode] = useState(() => {
    if (!TV_MODULE_ENABLED) return 'movies';
    try {
      const saved = localStorage.getItem(MODE_STORAGE_KEY);
      return saved === 'tv' ? 'tv' : 'movies';
    } catch {
      return 'movies';
    }
  });

  useEffect(() => {
    if (!TV_MODULE_ENABLED) return;
    try {
      localStorage.setItem(MODE_STORAGE_KEY, appMode);
    } catch {
      // ignore storage errors
    }
  }, [appMode]);

  // Valida sessão salva no navegador contra o backend ao iniciar
  useEffect(() => {
    let cancelled = false;
    const token = getStoredPinToken();
    if (!token) {
      setAuthStatus('locked');
      return;
    }

    axios
      .get(`${API_BASE_URL}/auth/status`, { timeout: 25000 })
      .then((res) => {
        if (cancelled) return;
        if (res.data?.authenticated) {
          setAuthStatus('unlocked');
          setLockReason('');
        } else {
          clearStoredPinToken();
          setAuthStatus('locked');
          setLockReason('Sessão expirada ou PIN alterado. Digite o PIN novamente.');
        }
      })
      .catch(() => {
        if (cancelled) return;
        setAuthStatus('locked');
        setLockReason(
          'Não foi possível validar sua sessão salva. Informe o PIN para entrar novamente.'
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Escuta respostas 401 AUTH_REQUIRED de qualquer requisição da API
  useEffect(() => {
    const handleAuthRequired = () => {
      setAuthStatus('locked');
      setLockReason('Sua sessão foi encerrada. Digite o PIN novamente para salvar alterações.');
    };
    window.addEventListener(AUTH_REQUIRED_EVENT, handleAuthRequired);
    return () => window.removeEventListener(AUTH_REQUIRED_EVENT, handleAuthRequired);
  }, []);

  const handleUnlocked = useCallback(() => {
    setLockReason('');
    setAuthStatus('unlocked');
  }, []);

  const handleLockApp = useCallback(() => {
    clearStoredPinToken();
    setLockReason('');
    setAuthStatus('locked');
  }, []);

  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="w-9 h-9 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-amber-300">
          Verificando Acesso ao Cofre...
        </span>
      </div>
    );
  }

  if (authStatus !== 'unlocked') {
    return <PinLockScreen onUnlocked={handleUnlocked} reasonMessage={lockReason} />;
  }

  const activeMode = TV_MODULE_ENABLED ? appMode : 'movies';

  const modeSwitcher = TV_MODULE_ENABLED ? (
    <div
      className="inline-flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800/80 shadow-inner"
      role="tablist"
      aria-label="Alternar módulo do catálogo"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeMode === 'movies'}
        onClick={() => setAppMode('movies')}
        className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
          activeMode === 'movies'
            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
            : 'text-zinc-400 hover:text-zinc-100'
        }`}
      >
        <span>🎬</span>
        <span>Filmes</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeMode === 'tv'}
        onClick={() => setAppMode('tv')}
        className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
          activeMode === 'tv'
            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/25'
            : 'text-zinc-400 hover:text-pink-200'
        }`}
      >
        <span>⛩️</span>
        <span>Animes &amp; Séries</span>
      </button>
    </div>
  ) : null;

  return (
    <div
      className={`bg-zinc-950 min-h-screen text-zinc-100 ${
        activeMode === 'tv'
          ? 'selection:bg-pink-500/30 selection:text-pink-300'
          : 'selection:bg-amber-500/30 selection:text-amber-400'
      }`}
    >
      {activeMode === 'tv' && TvDashboard ? (
        <Suspense
          fallback={
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-zinc-950 text-pink-300">
              <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
              <span className="text-xs font-black uppercase tracking-widest">
                Carregando Módulo Animes &amp; Séries...
              </span>
            </div>
          }
        >
          <TvDashboard modeSwitcher={modeSwitcher} onLockApp={handleLockApp} />
        </Suspense>
      ) : (
        <Dashboard modeSwitcher={modeSwitcher} onLockApp={handleLockApp} />
      )}
    </div>
  );
}

export default App;
