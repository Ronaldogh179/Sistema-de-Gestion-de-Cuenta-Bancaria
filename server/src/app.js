import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cuentaRoutes from './routes/cuentaRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
export function crearApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || true }));
  app.use(express.json({ limit: '20kb' }));
  app.use(morgan('dev'));
  app.get('/api/health', (_req, res) => res.json({ estado: 'ok', proyecto: 'Cuenta Bancaria' }));
  app.use('/api', cuentaRoutes);
  app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
  app.use(errorHandler);
  return app;
}
