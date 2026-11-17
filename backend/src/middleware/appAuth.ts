import crypto from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

const TOKEN_DOMAIN = 'cine-catalog-pin-session-v1';

export function getConfiguredAppPassword(): string {
  const configured = process.env.APP_PASSWORD;
  return configured && configured.length > 0 ? configured : 'leoholycinema';
}

export function derivePinSessionToken(secret: string): string {
  return crypto.createHmac('sha256', secret).update(TOKEN_DOMAIN).digest('hex');
}

function safeEqualStrings(a: string, b: string): boolean {
  const digestA = crypto.createHash('sha256').update(a, 'utf8').digest();
  const digestB = crypto.createHash('sha256').update(b, 'utf8').digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

export function verifyAppPassword(candidate: string): boolean {
  if (!candidate) return false;
  return safeEqualStrings(String(candidate), getConfiguredAppPassword());
}

export function isRequestAuthenticated(req: Request): boolean {
  const secret = getConfiguredAppPassword();
  const expectedToken = derivePinSessionToken(secret);

  const authHeader = String(req.headers.authorization || '').trim();
  const bearerToken = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : '';
  const headerToken = String(req.headers['x-app-token'] || '').trim();
  const headerPassword = String(req.headers['x-app-password'] || '');

  if (bearerToken && (safeEqualStrings(bearerToken, expectedToken) || safeEqualStrings(bearerToken, secret))) {
    return true;
  }
  if (headerToken && safeEqualStrings(headerToken, expectedToken)) {
    return true;
  }
  if (headerPassword && safeEqualStrings(headerPassword, secret)) {
    return true;
  }
  return false;
}

export function requireWriteAuth(req: Request, res: Response, next: NextFunction) {
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return next();
  }
  const cleanPath = req.path.replace(/\/+$/, '') || '/';
  if (cleanPath === '/auth/verify' && method === 'POST') {
    return next();
  }
  if (isRequestAuthenticated(req)) {
    return next();
  }
  return res.status(401).json({
    success: false,
    code: 'AUTH_REQUIRED',
    error: 'Acesso bloqueado: informe o PIN de acesso para alterar dados no catálogo.',
  });
}
