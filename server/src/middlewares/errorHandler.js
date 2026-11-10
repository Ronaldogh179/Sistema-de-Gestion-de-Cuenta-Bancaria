import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';

export function notFound(req, res) {
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err?.type === 'entity.parse.failed') {
    return res
      .status(400)
      .json({ error: 'El cuerpo de la solicitud no contiene JSON válido.' });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: 'Identificador inválido.' });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const primerError = Object.values(err.errors)[0];
    return res
      .status(400)
      .json({ error: primerError?.message || 'Datos inválidos.' });
  }

  if (err?.code === 20 || err?.codeName === 'IllegalOperation') {
    console.error(err);
    return res.status(500).json({
      error:
        'La operación requiere que MongoDB esté configurado como replica set. ' +
        'Ejecuta `npm run mongo:setup` en server/ y revisa el README.',
    });
  }

  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor.' });
}
