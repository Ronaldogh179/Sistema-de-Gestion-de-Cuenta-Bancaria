import { useState } from 'react';
import FormularioDeposito from './FormularioDeposito.jsx';
import FormularioRetiro from './FormularioRetiro.jsx';
import FormularioTransferencia from './FormularioTransferencia.jsx';

const OPERACIONES = [
  { id: 'deposito', etiqueta: 'Depositar' },
  { id: 'retiro', etiqueta: 'Retirar' },
  { id: 'transferencia', etiqueta: 'Transferir' },
];

export default function PanelOperaciones({ cuentaId, cuentas, onExito }) {
  const [operacion, setOperacion] = useState('deposito');

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-tarjeta backdrop-blur sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Operaciones</h2>
          <p className="text-sm text-slate-400">Elige y registra un movimiento.</p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl bg-slate-950/60 p-1.5">
        {OPERACIONES.map((item) => {
          const activa = operacion === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setOperacion(item.id)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                activa
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              {item.etiqueta}
            </button>
          );
        })}
      </div>

      {operacion === 'deposito' && (
        <FormularioDeposito cuentaId={cuentaId} onExito={onExito} />
      )}

      {operacion === 'retiro' && (
        <FormularioRetiro cuentaId={cuentaId} onExito={onExito} />
      )}

      {operacion === 'transferencia' && (
        <FormularioTransferencia
          cuentaId={cuentaId}
          cuentas={cuentas}
          onExito={onExito}
        />
      )}
    </section>
  );
}
