import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, LoaderCircle, Send } from 'lucide-react';
import { useState } from 'react';
const tipos = [
  { id: 'deposito', nombre: 'Depositar', Icono: ArrowDownLeft },
  { id: 'retiro', nombre: 'Retirar', Icono: ArrowUpRight },
  { id: 'transferencia', nombre: 'Transferir', Icono: ArrowLeftRight }
];
export default function FormOperacion({cuenta, cuentas, operando, alOperar}) {
  const [tipo, setTipo] = useState('transferencia');
  const [monto, setMonto] = useState('');
  const [destino, setDestino] = useState('');
  const otras = cuentas.filter(c => c.numero !== cuenta?.numero);
  const submit = async (e) => {
    e.preventDefault();
    if (!cuenta) return;
    const cuerpo = tipo === 'transferencia'
      ? { cuentaOrigen: cuenta.numero, cuentaDestino: destino, monto }
      : { cuentaId: cuenta.numero, monto };
    const exitoso = await alOperar(tipo, cuerpo);
    if (exitoso) { setMonto(''); setDestino(''); }
  };
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" id="form-operacion">
    <div className="mb-5 flex items-center justify-between"><div><h3 className="text-lg font-bold text-slate-900">Nueva operación</h3><p className="mt-1 text-xs text-slate-500">Gestiona tus movimientos fácilmente</p></div><div className="rounded-xl bg-sky-50 p-3 text-blue-600"><ArrowLeftRight size={21}/></div></div>
    <div className="mb-6 grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1.5">
      {tipos.map(({id, nombre, Icono}) => <button key={id} onClick={() => setTipo(id)} type="button" className={`flex flex-col items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-bold transition sm:flex-row sm:text-sm ${tipo === id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}><Icono size={16}/>{nombre}</button>)}
    </div>
    <form onSubmit={submit} className="space-y-4">
      <div><label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="monto">Monto en soles</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">S/</span><input required id="monto" type="number" min="0.01" step="0.01" max="999999999.99" inputMode="decimal" value={monto} onChange={e => setMonto(e.target.value)} placeholder="0.00" className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></div></div>
      {tipo === 'transferencia' && <div><label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="destino">Cuenta de destino</label><select id="destino" required value={destino} onChange={e => setDestino(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"><option value="">Seleccionar cuenta</option>{otras.map(c => <option value={c.numero} key={c.numero}>{c.numero} — {c.titular}</option>)}</select></div>}
      <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">{tipo === 'transferencia' ? 'Se validará la cuenta destino y la disponibilidad de fondos antes de transferir.' : tipo === 'retiro' ? 'Los retiros no pueden superar el saldo disponible.' : 'El depósito se añadirá a tu saldo cuando se confirme en la base de datos.'}</div>
      <button disabled={!cuenta || operando} type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{operando ? <><LoaderCircle size={18} className="animate-spin"/> Procesando...</> : <><Send size={17}/> {tipo === 'deposito' ? 'Confirmar depósito' : tipo === 'retiro' ? 'Confirmar retiro' : 'Realizar transferencia'}</>}</button>
    </form>
  </section>;
}
