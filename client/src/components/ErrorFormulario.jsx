export default function ErrorFormulario({ mensaje }) {
  if (!mensaje) return null;

  return (
    <p
      role="alert"
      className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
    >
      {mensaje}
    </p>
  );
}
