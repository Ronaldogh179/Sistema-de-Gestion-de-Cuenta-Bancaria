import { useEffect, useState } from 'react';
import { transferir } from '../api/cuentaApi.js';
import { montoACentimos } from '../utils/format.js';
import BotonOperacion from './BotonOperacion.jsx';
import CampoMonto from './CampoMonto.jsx';
import ErrorFormulario from './ErrorFormulario.jsx';

export default function FormularioTransferencia({ cuentaId, cuentas, onExito }) {
  const destinos = cuentas.filter((cuenta) => cuenta.id !== cuentaId);
  const [destinoId, setDestinoId] = useState(destinos[0]?.id ?? '');
  const [monto, setMonto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const opciones = cuentas.filter((cuenta) => cuenta.id !== cuentaId);
    if (!opciones.some((cuenta) => cuenta.id === destinoId)) {
      setDestinoId(opciones[0]?.id ?? '');
    }
  }, [cuentaId, cuentas, destinoId]);

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError('');

    if (!destinoId) {
      setError('Selecciona una cuenta de destino.');
      return;
    }

    let montoCents;
    try {
      montoCents = montoACentimos(monto);
    } catch (errorValidacion) {
      setError(errorValidacion.message);
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await transferir({
        cuentaOrigenId: cuentaId,
        cuentaDestinoId: destinoId,
        montoCents,
      });
      setMonto('');
      await onExito(respuesta.mensaje);
    } catch (errorPeticion) {
      setError(errorPeticion.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={manejarEnvio} className="space-y-4">
      <p className="text-sm leading-6 text-slate-400">
        La transferencia actualiza ambos saldos y registra el movimiento en una
        sola transacción de MongoDB.
      </p>

      <div>
        <label
          htmlFor="cuenta-destino"
          className="mb-1.5 block text-sm font-medium text-slate-300"
        >
          Cuenta de destino
        </label>
        <select
          id="cuenta-destino"
          value={destinoId}
          onChange={(evento) => setDestinoId(evento.target.value)}
          disabled={enviando || destinos.length === 0}
          className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {destinos.map((cuenta) => (
            <option key={cuenta.id} value={cuenta.id} className="bg-slate-900">
              {cuenta.numeroCuenta} · {cuenta.titular}
            </option>
          ))}
        </select>
      </div>

      <CampoMonto
        id="monto-transferencia"
        valor={monto}
        onChange={(evento) => setMonto(evento.target.value)}
        deshabilitado={enviando}
        ayuda="Se valida que la cuenta de origen tenga saldo suficiente."
      />

      <ErrorFormulario mensaje={error} />

      <BotonOperacion
        enviando={enviando}
        texto="Transferir"
        textoEnviando="Procesando transferencia..."
        deshabilitado={!cuentaId || destinos.length === 0}
      />
    </form>
  );
}
