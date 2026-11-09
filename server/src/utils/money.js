import { HttpError } from './httpError.js';

/** Convierte un monto de hasta dos decimales a centavos SIN errores de coma flotante. */
export function parseMonto(value) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new HttpError(400, 'El monto debe ser numérico y positivo.');
  }
  const s = String(value).trim();
  const match = /^(0|[1-9]\d{0,8})(?:\.(\d{1,2}))?$/.exec(s);
  if (!match) throw new HttpError(400, 'Ingrese un monto positivo con máximo dos decimales.');
  const centavos = Number(match[1]) * 100 + Number((match[2] || '').padEnd(2, '0'));
  if (!Number.isSafeInteger(centavos) || centavos <= 0) {
    throw new HttpError(400, 'El monto debe ser mayor que cero.');
  }
  return centavos;
}
export function centavosASoles(centavos) {
  return (centavos / 100).toFixed(2);
}
