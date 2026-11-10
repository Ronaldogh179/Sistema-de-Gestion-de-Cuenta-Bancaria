const formatoMoneda = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

const formatoFecha = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatearMoneda(cents) {
  return formatoMoneda.format(Number(cents || 0) / 100);
}

export function formatearFecha(fecha) {
  if (!fecha) return '';
  return formatoFecha.format(new Date(fecha));
}

export function montoACentimos(texto) {
  const limpio = String(texto).trim().replace(',', '.');

  if (!/^\d+(\.\d{1,2})?$/.test(limpio)) {
    throw new Error('Ingresa un monto válido con hasta dos decimales.');
  }

  const [enteros, decimales = ''] = limpio.split('.');
  const cents = Number(enteros) * 100 + Number(decimales.padEnd(2, '0'));

  if (!Number.isSafeInteger(cents) || cents <= 0) {
    throw new Error('El monto debe ser mayor a cero.');
  }

  return cents;
}

export const ETIQUETAS_TIPO = {
  deposito: 'Depósito',
  retiro: 'Retiro',
  transferencia: 'Transferencia',
};
