import express, { type Express, type Request, type Response } from 'express';
import { logger } from './logger.js';

export const app: Express = express();

// JSON body parsing. (Helmet/CORS/rate-limit diterapkan ketika auth & internet-facing dirancang — roadmap M5+.)
app.use(express.json());

/**
 * Health/liveness check — tidak membutuhkan DB agar bisa dipakai di M3 (repository foundation).
 * Business logic & DB-aware endpoints menyusul di milestone-nya masing-masing.
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'mobiljuragan-api',
    version: process.env.APP_VERSION ?? 'dev',
    time: new Date().toISOString(),
  });
});

// Catch-all untuk rute yang belum diimplementasikan — jangan sampai mengklaim selesai.
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.path} belum diimplementasikan pada milestone ini.`,
      details: {},
    },
  });
});

logger.info('Express app configured.');
