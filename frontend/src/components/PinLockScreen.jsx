import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Film, Lock, ShieldCheck, Sparkles, Unlock } from 'lucide-react';
import { API_BASE_URL, setStoredPinToken } from '../utils/apiConfig';

export default function PinLockScreen({ onUnlocked, reasonMessage = '' }) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(reasonMessage || '');
  const [shakeKey, setShakeKey] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    // Pré-aquece o servidor (útil no plano gratuito do Render ao sair do sleep)
    axios.get(`${API_BASE_URL}/health`, { timeout: 15000 }).catch(() => {});
  }, []);

  useEffect(() => {
    if (reasonMessage) {
      setErrorMsg(reasonMessage);
    }
  }, [reasonMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const candidate = pin;
    if (!candidate.trim()) {
      setErrorMsg('Digite o PIN de acesso para entrar.');
      setShakeKey((k) => k + 1);
      inputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/verify`,
        { password: candidate },
        { timeout: 30000 }
      );
      if (res.data?.success && res.data?.token) {
        setStoredPinToken(res.data.token);
        onUnlocked(res.data.token);
        return;
      }
      setErrorMsg('Não foi possível validar o PIN.');
      setShakeKey((k) => k + 1);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setErrorMsg(err.response?.data?.error || 'PIN incorreto. Tente novamente.');
      } else {
        setErrorMsg(
          'Não foi possível conectar ao servidor agora (se estiver acordando no Render, aguarde alguns segundos e tente novamente).'
        );
      }
      setShakeKey((k) => k + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 relative overflow-hidden flex items-center justify-center px-4 py-8">
      {/* Brilho cinematográfico de fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.16),transparent_42%),radial-gradient(circle_at_80%_75%,rgba(168,85,247,0.14),transparent_46%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:36px_36px]"
      />

      <div
        key={shakeKey}
        className={`relative z-10 w-full max-w-md rounded-3xl border border-amber-500/30 bg-zinc-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.75),0_0_45px_rgba(245,158,11,0.12)] ${
          errorMsg ? 'animate-[shake_0.36s_ease-in-out]' : ''
        }`}
      >
        {/* Cabeçalho do Cofre */}
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 p-[2px] shadow-[0_0_28px_rgba(245,158,11,0.35)]">
              <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center">
                <Lock className="w-7 h-7 text-amber-400" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-zinc-950 text-[9px] font-black uppercase tracking-widest shadow">
              VIP
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-widest">
            <Film className="w-3.5 h-3.5" />
            <span>Cine Catalog • Cofre do Crítico</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Acesso Restrito
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm">
            Informe o PIN secreto para desbloquear seu acervo, estatísticas, troféus e alterações no banco.
          </p>
        </div>

        {/* Formulário de PIN */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cine-pin-input"
              className="text-[11px] font-black uppercase tracking-widest text-zinc-400 flex items-center justify-between"
            >
              <span>PIN de Desbloqueio</span>
              <span className="text-amber-400/80 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Protegido
              </span>
            </label>

            <div className="relative flex items-center">
              <input
                ref={inputRef}
                id="cine-pin-input"
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Digite o PIN..."
                autoFocus
                autoComplete="current-password"
                enterKeyHint="go"
                disabled={submitting}
                className="w-full min-h-[48px] pl-4 pr-12 py-3 rounded-2xl bg-zinc-950/90 border border-zinc-700/80 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-base text-white placeholder:text-zinc-600 font-semibold tracking-wide outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPin((prev) => !prev)}
                aria-label={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                className="absolute right-2 p-2.5 rounded-xl text-zinc-400 hover:text-amber-300 hover:bg-zinc-800/70 transition-colors cursor-pointer"
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-xs font-semibold text-rose-300 leading-relaxed"
            >
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[50px] rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:brightness-105 active:scale-[0.99] disabled:opacity-60 disabled:cursor-wait text-zinc-950 font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_10px_28px_rgba(245,158,11,0.32)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>Desbloquear Catálogo</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-center gap-2 text-[11px] text-zinc-500 font-medium text-center">
          <Sparkles className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />
          <span>A sessão permanece salva neste navegador até você bloquear manualmente.</span>
        </div>
      </div>
    </div>
  );
}
