import { HttpError } from '../utils/httpError.js';
export function errorHandler(err, _req, res, _next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El JSON enviado no es válido.' });
  }
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  console.error('Error interno:', err);
  return res.status(500).json({ error: 'Error interno del servidor.' });
}
