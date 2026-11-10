import { useCallback, useEffect, useState } from 'react';
import { obtenerCuenta, obtenerHistorial } from './api/cuentaApi.js';
import Historial from './components/Historial.jsx';
import Mensaje from './components/Mensaje.jsx';
import PanelOperaciones from './components/PanelOperaciones.jsx';
import SaldoCard from './components/SaldoCard.jsx';
import SelectCuenta from './components/SelectCuenta.jsx';
import { CUENTAS_DEMO } from './data/cuentasDemo.js';

export default function App() {
  const [cuentaId, setCuentaId] = useState(CUENTAS_DEMO[0].id);
  const [cuenta, setCuenta] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [mensaje, setMensaje] = useState(null);

  const cargarDatos = useCallback(async (id) => {
    setCargando(true);
    setErrorCarga('');

    try {
      const [respuestaCuenta, respuestaHistorial] = await Promise.all([
        obtenerCuenta(id),
        obtenerHistorial(id),
      ]);

      setCuenta(respuestaCuenta.cuenta);
      setMovimientos(respuestaHistorial.movimientos);
    } catch (error) {
      setCuenta(null);
      setMovimientos([]);
      setErrorCarga(error.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos(cuentaId);
  }, [cuentaId, cargarDatos]);

  function cambiarCuenta(id) {
    if (id === cuentaId) return;
    setMensaje(null);
    setCuentaId(id);
  }

  const manejarExito = useCallback(
    async (texto) => {
      setMensaje({ tipo: 'exito', texto });
      await cargarDatos(cuentaId);
    },
    [cargarDatos, cuentaId]
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M3 21h18" />
                <path d="M5 21V10" />
                <path d="M9.5 21V10" />
                <path d="M14.5 21V10" />
                <path d="M19 21V10" />
                <path d="m12 3 9 5H3l9-5Z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
                Banco Demo
              </p>
              <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                Gestión de Cuenta Bancaria
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-400 sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            MongoDB local · Transacciones
          </div>
        </header>

        {errorCarga && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>
              No se pudo conectar con la API o la cuenta no existe: {errorCarga}
            </p>
            <button
              type="button"
              onClick={() => cargarDatos(cuentaId)}
              className="self-start rounded-lg border border-rose-300/30 bg-rose-400/10 px-3 py-1.5 text-xs font-bold text-rose-100 transition hover:bg-rose-400/20 sm:self-auto"
            >
              Reintentar
            </button>
          </div>
        )}

        <main className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.25fr)]">
          <div className="space-y-6">
            <SelectCuenta
              cuentas={CUENTAS_DEMO}
              cuentaId={cuentaId}
              onChange={cambiarCuenta}
              deshabilitado={cargando}
            />

            <SaldoCard cuenta={cuenta} cargando={cargando} error={errorCarga} />
          </div>

          <div className="space-y-6">
            <Mensaje mensaje={mensaje} onCerrar={() => setMensaje(null)} />

            <PanelOperaciones
              cuentaId={cuentaId}
              cuentas={CUENTAS_DEMO}
              onExito={manejarExito}
            />
          </div>
        </main>

        <div className="mt-6">
          <Historial
            movimientos={movimientos}
            cargando={cargando}
            cuentaId={cuentaId}
          />
        </div>

        <footer className="mt-10 flex flex-col gap-2 border-t border-slate-800/80 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Sistema de Gestión de Cuenta Bancaria Simplificada</p>
          <p>Montos en céntimos enteros · Transferencias atómicas</p>
        </footer>
      </div>
    </div>
  );
}
