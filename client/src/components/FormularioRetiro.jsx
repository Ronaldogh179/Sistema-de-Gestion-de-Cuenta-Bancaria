import { useState } from 'react';
import { retirar } from '../api/cuentaApi.js';
import { montoACentimos } from '../utils/format.js';
import BotonOperacion from './BotonOperacion.jsx';
import CampoMonto from './CampoMonto.jsx';
import ErrorFormulario from './ErrorFormulario.jsx';

export default function FormularioRetiro({ cuentaId, onExito }) {
  const [monto, setMonto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError('');

    let montoCents;
    try {
      montoCents = montoACentimos(monto);
    } catch (errorValidacion) {
      setError(errorValidacion.message);
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await retirar({ cuentaId, montoCents });
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
        Retira fondos sin superar el saldo disponible. El saldo nunca será negativo.
      </p>

      <CampoMonto
        id="monto-retiro"
        valor={monto}
        onChange={(evento) => setMonto(evento.target.value)}
        deshabilitado={enviando}
        ayuda="El backend valida el saldo antes de confirmar."
      />

      <ErrorFormulario mensaje={error} />

      <BotonOperacion
        enviando={enviando}
        texto="Retirar"
        textoEnviando="Procesando retiro..."
        deshabilitado={!cuentaId}
      />
    </form>
  );
}
