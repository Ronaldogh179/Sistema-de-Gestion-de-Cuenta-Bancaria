import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, History, Receipt } from 'lucide-react';
import { moneda } from './SaldoCard.jsx';
export default function HistorialTransacciones({ movimientos, cuentaId, completo = false }) {
  const datos = completo ? movimientos : movimientos.slice(0, 5);
  const detalle = m => {
    if (m.tipo === 'DEPOSITO') return { texto: 'Depósito recibido', positivo: true, icono: ArrowDownLeft, sub: 'Ingreso a tu cuenta' };
    if (m.tipo === 'RETIRO') return { texto: 'Retiro de fondos', positivo: false, icono: ArrowUpRight, sub: 'Salida de tu cuenta' };
    const recibido = m.cuentaDestino === cuentaId;
    return { texto: recibido ? 'Transferencia recibida' : 'Transferencia enviada', positivo: recibido, icono: ArrowLeftRight, sub: recibido ? `Desde ${m.cuentaOrigen}` : `Hacia ${m.cuentaDestino}` };
  };
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-3 text-blue-600"><History size={21}/></div><div><h3 className="text-lg font-bold text-slate-900">{completo ? 'Historial de movimientos' : 'Movimientos recientes'}</h3><p className="text-xs text-slate-500">{movimientos.length} operaciones registradas</p></div></div>
    {datos.length === 0 ? <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center"><Receipt size={30} className="text-slate-300"/><p className="mt-3 text-sm font-bold text-slate-700">Aún no hay movimientos</p><p className="mt-1 max-w-xs text-xs text-slate-500">Realiza un depósito, retiro o transferencia para ver tu primera transacción.</p></div> :
    <div className="divide-y divide-slate-100">{datos.map(m => { const d=detalle(m); const Icono=d.icono; return <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5"><div className="flex min-w-0 items-center gap-3"><div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${d.positivo ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}><Icono size={19}/></div><div className="min-w-0"><p className="text-sm font-semibold text-slate-900">{d.texto}</p><p className="truncate text-xs text-slate-500">{d.sub}</p><p className="mt-0.5 text-[11px] text-slate-400">{new Date(m.fecha).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })}</p></div></div><span className={`ml-auto whitespace-nowrap text-sm font-extrabold ${d.positivo ? 'text-emerald-600' : 'text-slate-800'}`}>{d.positivo ? '+' : '−'} {moneda(m.monto)}</span></div>;})}</div>}
  </section>;
}
