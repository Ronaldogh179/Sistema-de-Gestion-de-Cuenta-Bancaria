import { formatearFecha, formatearMoneda } from '../utils/format.js';

export default function SaldoCard({ cuenta, cargando, error }) {
  if (error) {
    return (
      <section className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-6 shadow-tarjeta">
        <p className="text-sm font-semibold text-rose-200">No se pudo cargar la cuenta</p>
        <p className="mt-1 text-sm text-rose-100/70">{error}</p>
      </section>
    );
  }

  if (cargando || !cuenta) {
    return (
      <section className="animate-pulse rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-tarjeta">
        <div className="h-3 w-28 rounded bg-slate-700" />
        <div className="mt-6 h-10 w-48 rounded bg-slate-700" />
        <div className="mt-8 h-3 w-40 rounded bg-slate-800" />
        <div className="mt-3 h-3 w-56 rounded bg-slate-800" />
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-[1px] shadow-tarjeta">
      <div className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-slate-950/90 p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-emerald-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-10 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl"
        />

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-400">Saldo disponible</p>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              Actualizado
            </span>
          </div>

          <p className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {formatearMoneda(cuenta.saldoCents)}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Titular</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">{cuenta.titular}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Número de cuenta</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">
                {cuenta.numeroCuenta}
              </p>
            </div>
          </div>

          <p className="mt-6 border-t border-slate-800 pt-4 text-xs text-slate-500">
            Última actualización: {formatearFecha(cuenta.updatedAt)}
          </p>
        </div>
      </div>
    </section>
  );
}
