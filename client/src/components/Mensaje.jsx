const ESTILOS = {
  exito: {
    contenedor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
    icono: 'bg-emerald-400/20 text-emerald-300',
  },
  error: {
    contenedor: 'border-rose-500/40 bg-rose-500/10 text-rose-100',
    icono: 'bg-rose-400/20 text-rose-300',
  },
};

export default function Mensaje({ mensaje, onCerrar }) {
  if (!mensaje) return null;

  const estilo = ESTILOS[mensaje.tipo] || ESTILOS.error;

  return (
    <div
      role={mensaje.tipo === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-tarjeta ${estilo.contenedor}`}
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${estilo.icono}`}
      >
        {mensaje.tipo === 'exito' ? 'OK' : '!'}
      </span>
      <p className="flex-1 leading-6">{mensaje.texto}</p>
      {onCerrar && (
        <button
          type="button"
          onClick={onCerrar}
          className="rounded-lg px-2 py-0.5 text-xs font-semibold opacity-70 transition hover:bg-white/10 hover:opacity-100"
          aria-label="Cerrar mensaje"
        >
          Cerrar
        </button>
      )}
    </div>
  );
}
