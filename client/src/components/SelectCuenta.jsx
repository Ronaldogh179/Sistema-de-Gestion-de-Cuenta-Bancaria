export default function SelectCuenta({
  cuentas,
  cuentaId,
  onChange,
  deshabilitado = false,
}) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-tarjeta backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Cuenta activa
        </h2>
        <span className="text-xs text-slate-500">{cuentas.length} cuentas demo</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {cuentas.map((cuenta) => {
          const activa = cuenta.id === cuentaId;

          return (
            <button
              key={cuenta.id}
              type="button"
              onClick={() => onChange(cuenta.id)}
              disabled={deshabilitado || activa}
              aria-pressed={activa}
              className={`rounded-2xl border px-3 py-3 text-left transition ${
                activa
                  ? 'border-emerald-400/60 bg-emerald-400/10 text-white'
                  : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-600 hover:bg-slate-800/60'
              } disabled:cursor-default`}
            >
              <span className="block text-xs font-medium text-slate-400">
                {cuenta.numeroCuenta}
              </span>
              <span className="mt-0.5 block truncate text-sm font-semibold">
                {cuenta.titular}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
