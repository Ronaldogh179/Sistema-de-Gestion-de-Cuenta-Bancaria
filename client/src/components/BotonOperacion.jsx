export default function BotonOperacion({
  enviando,
  texto,
  textoEnviando = 'Procesando...',
  deshabilitado = false,
}) {
  return (
    <button
      type="submit"
      disabled={enviando || deshabilitado}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {enviando && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900"
        />
      )}
      {enviando ? textoEnviando : texto}
    </button>
  );
}
