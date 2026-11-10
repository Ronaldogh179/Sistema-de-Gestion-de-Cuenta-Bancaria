import {
  ETIQUETAS_TIPO,
  formatearFecha,
  formatearMoneda,
} from '../utils/format.js';

const COLORES_TIPO = {
  deposito: 'bg-emerald-400/10 text-emerald-300',
  retiro: 'bg-rose-400/10 text-rose-300',
  transferencia: 'bg-sky-400/10 text-sky-300',
};

export default function MovimientoItem({ movimiento, cuentaId }) {
  const esTransferencia = movimiento.tipo === 'transferencia';
  const esEntrada =
    movimiento.tipo === 'deposito' ||
    (esTransferencia &&
      String(movimiento.cuentaDestino?._id) === String(cuentaId));

  const detalle = esTransferencia
    ? `${movimiento.cuentaOrigen?.numeroCuenta ?? '—'} → ${
        movimiento.cuentaDestino?.numeroCuenta ?? '—'
      }`
    : movimiento.tipo === 'deposito'
      ? `Abono a ${movimiento.cuentaDestino?.numeroCuenta ?? '—'}`
      : `Cargo de ${movimiento.cuentaOrigen?.numeroCuenta ?? '—'}`;

  return (
    <li className="flex items-center gap-3 py-4">
      <span
        aria-hidden="true"
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
          esEntrada
            ? 'bg-emerald-400/10 text-emerald-300'
            : 'bg-rose-400/10 text-rose-300'
        }`}
      >
        {esEntrada ? '+' : '−'}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-100">
            {ETIQUETAS_TIPO[movimiento.tipo] || movimiento.tipo}
          </p>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              COLORES_TIPO[movimiento.tipo] ||
              'bg-slate-700/50 text-slate-300'
            }`}
          >
            {movimiento.tipo}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500">{detalle}</p>
        <p className="mt-0.5 text-xs text-slate-600">
          {formatearFecha(movimiento.fecha)}
        </p>
      </div>

      <p
        className={`shrink-0 text-right text-sm font-bold ${
          esEntrada ? 'text-emerald-300' : 'text-rose-300'
        }`}
      >
        {esEntrada ? '+' : '−'}
        {formatearMoneda(movimiento.montoCents)}
      </p>
    </li>
  );
}
