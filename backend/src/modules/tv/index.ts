import { Express } from 'express';
import multer from 'multer';
import { createTvRouter } from './routes';
import { ensureTvSchema } from './schema';

export async function registerTvModule(app: Express, uploadMiddleware: multer.Multer): Promise<void> {
  await ensureTvSchema();
  const router = createTvRouter(uploadMiddleware);
  app.use('/api/tv', router);
  console.log('[TV Module] Módulo ⛩️ Animes, Séries & Doramas montado em /api/tv (schema tv isolado).');
}
