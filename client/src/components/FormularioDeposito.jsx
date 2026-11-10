import { useState } from 'react';
import { depositar } from '../api/cuentaApi.js';
import { montoACentimos } from '../utils/format.js';
import BotonOperacion from './BotonOperacion.jsx';
import CampoMonto from './CampoMonto.jsx';
import ErrorFormulario from './ErrorFormulario.jsx';

export default function FormularioDeposito({ cuentaId, onExito }) {
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
      const respuesta = await depositar({ cuentaId, montoCents });
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
        Ingresa el monto que deseas abonar a la cuenta seleccionada.
      </p>

      <CampoMonto
        id="monto-deposito"
        valor={monto}
        onChange={(evento) => setMonto(evento.target.value)}
        deshabilitado={enviando}
        ayuda="Se guardará el movimiento automáticamente."
      />

      <ErrorFormulario mensaje={error} />

      <BotonOperacion
        enviando={enviando}
        texto="Depositar"
        textoEnviando="Procesando depósito..."
        deshabilitado={!cuentaId}
      />
    </form>
  );
}
