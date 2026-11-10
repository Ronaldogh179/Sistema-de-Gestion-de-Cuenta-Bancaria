import MovimientoItem from './MovimientoItem.jsx';

export default function Historial({ movimientos, cargando, cuentaId }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-tarjeta backdrop-blur sm:p-6">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white">Historial de movimientos</h2>
          <p className="text-sm text-slate-400">
            Depósitos, retiros y transferencias de la cuenta activa.
          </p>
        </div>
        <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-semibold text-slate-400">
          {movimientos.length} movimiento{movimientos.length === 1 ? '' : 's'}
        </span>
      </div>

      {cargando ? (
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="flex animate-pulse items-center gap-3 rounded-2xl bg-slate-950/40 px-3 py-4"
            >
              <span className="h-10 w-10 rounded-full bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 rounded bg-slate-800" />
                <div className="h-3 w-44 rounded bg-slate-800/70" />
              </div>
              <div className="h-4 w-20 rounded bg-slate-800" />
            </div>
          ))}
        </div>
      ) : movimientos.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 px-5 py-10 text-center">
          <p className="text-sm font-semibold text-slate-300">
            Aún no hay movimientos
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Realiza un depósito, retiro o transferencia para verlo aquí.
          </p>
        </div>
      ) : (
        <ul className="mt-2 divide-y divide-slate-800/80">
          {movimientos.map((movimiento) => (
            <MovimientoItem
              key={movimiento._id}
              movimiento={movimiento}
              cuentaId={cuentaId}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
