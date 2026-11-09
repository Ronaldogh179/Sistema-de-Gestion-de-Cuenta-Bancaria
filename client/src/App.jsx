import { useCallback, useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Bell, CalendarDays, CheckCircle2, ChevronDown, CircleAlert, Landmark, Menu, RefreshCw, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import SaldoCard, { moneda } from './components/SaldoCard.jsx';
import FormOperacion from './components/FormOperacion.jsx';
import HistorialTransacciones from './components/HistorialTransacciones.jsx';
import { api } from './lib/api.js';

export default function App() {
  const [seccion, setSeccion] = useState('resumen');
  const [menuMovil, setMenuMovil] = useState(false);
  const [cuentas, setCuentas] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [cuenta, setCuenta] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [operando, setOperando] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const cargarCuentas = useCallback(async () => {
    const { cuentas: data } = await api('/cuentas');
    setCuentas(data);
    setSelectedId(actual => actual || data[0]?.numero || '');
  }, []);
  const cargarDatos = useCallback(async (id) => {
    if (!id) return;
    const [cuentaRes, historialRes] = await Promise.all([
      api(`/cuenta/${encodeURIComponent(id)}`),
      api(`/cuenta/${encodeURIComponent(id)}/historial`)
    ]);
    setCuenta(cuentaRes.cuenta);
    setMovimientos(historialRes.movimientos);
  }, []);
  useEffect(() => {
    let activo = true;
    cargarCuentas().catch(e => { if (activo) setFeedback({ tipo: 'error', texto: e.message }); }).finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [cargarCuentas]);
  useEffect(() => {
    if (!selectedId) return;
    let activo = true;
    setCargando(true);
    Promise.all([api(`/cuenta/${encodeURIComponent(selectedId)}`), api(`/cuenta/${encodeURIComponent(selectedId)}/historial`)])
      .then(([c, h]) => { if (activo) { setCuenta(c.cuenta); setMovimientos(h.movimientos); } })
      .catch(e => { if (activo) setFeedback({ tipo: 'error', texto: e.message }); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [selectedId]);

  const refrescar = async () => {
    if (!selectedId) return;
    setCargando(true);
    try { await Promise.all([cargarDatos(selectedId), cargarCuentas()]); setFeedback(null); }
    catch (e) { setFeedback({ tipo: 'error', texto: e.message }); }
    finally { setCargando(false); }
  };
  const realizarOperacion = async (tipo, cuerpo) => {
    setOperando(true); setFeedback(null);
    try {
      const rutas = { deposito: '/cuenta/deposito', retiro: '/cuenta/retiro', transferencia: '/cuenta/transferencia' };
      const resultado = await api(rutas[tipo], { method: 'POST', body: cuerpo });
      await Promise.all([cargarDatos(selectedId), cargarCuentas()]);
      setFeedback({ tipo: 'ok', texto: resultado.mensaje + ' Saldos e historial actualizados.' });
      return true;
    } catch (e) {
      setFeedback({ tipo: 'error', texto: e.message });
      return false;
    } finally { setOperando(false); }
  };

  const nav = (s) => { setSeccion(s); setFeedback(null); };
  return <div className="min-h-screen bg-[#f7f9fd] text-slate-900 lg:flex">
    <Sidebar seccion={seccion} onSeccion={nav} movil={menuMovil} onClose={() => setMenuMovil(false)} />
    <main className="min-w-0 flex-1">
      <header className="flex h-[76px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8 lg:px-10">
        <div className="flex items-center gap-3"><button className="rounded-lg border border-slate-200 p-2 lg:hidden" onClick={() => setMenuMovil(true)} aria-label="Abrir menú"><Menu size={21}/></button><div><p className="text-xs font-semibold tracking-wide text-slate-400">BANCA DIGITAL</p><h1 className="text-base font-extrabold tracking-tight sm:text-lg">{seccion === 'resumen' ? 'Panel general' : seccion === 'operaciones' ? 'Operaciones bancarias' : 'Historial completo'}</h1></div></div>
        <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 sm:flex"><CalendarDays size={15}/>{new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</div><span className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-sm font-extrabold text-blue-700">{(cuenta?.titular || 'B').charAt(0)}</span></div>
      </header>
      <div className="mx-auto max-w-[1360px] space-y-6 px-4 pb-12 pt-7 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-slate-500">Hola, {cuenta?.titular?.split(' ')[0] || 'bienvenido'} 👋</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#102041] sm:text-3xl">Tu dinero, bajo control</h2><p className="mt-2 text-sm text-slate-500">Consulta tus cuentas y gestiona operaciones de manera sencilla.</p></div><div className="w-full sm:w-auto"><label className="mb-1.5 block text-xs font-semibold text-slate-500" htmlFor="selector-cuenta">Cuenta activa</label><div className="relative"><select className="h-11 w-full min-w-60 appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-blue-500" id="selector-cuenta" value={selectedId} onChange={e => setSelectedId(e.target.value)}>{cuentas.length === 0 && <option value="">Sin cuentas disponibles</option>}{cuentas.map(c => <option key={c.numero} value={c.numero}>{c.numero} — {c.titular}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-3 text-slate-500"/></div></div></div>
        {feedback && <div role="alert" className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${feedback.tipo === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>{feedback.tipo === 'ok' ? <CheckCircle2 size={19} className="shrink-0"/> : <CircleAlert size={19} className="shrink-0"/>}<span>{feedback.texto}</span><button className="ml-auto font-bold" onClick={() => setFeedback(null)} aria-label="Cerrar notificación">×</button></div>}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(310px,1fr)]">
          <SaldoCard cuenta={cuenta} refrescar={refrescar} cargando={cargando}/>
          <div className="grid grid-cols-2 gap-3 sm:gap-4"><div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><ArrowDownLeft size={21}/></div><div className="mt-4"><p className="text-xs font-semibold text-slate-500">Ingresos recientes</p><p className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">{moneda(movimientos.filter(m => m.tipo === 'DEPOSITO' || (m.tipo === 'TRANSFERENCIA' && m.cuentaDestino === selectedId)).reduce((v,m) => v+Number(m.monto),0))}</p><p className="mt-2 text-[11px] text-emerald-600">Últimos 50 movimientos</p></div></div><div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex size-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><ArrowUpRight size={21}/></div><div className="mt-4"><p className="text-xs font-semibold text-slate-500">Egresos recientes</p><p className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">{moneda(movimientos.filter(m => m.tipo === 'RETIRO' || (m.tipo === 'TRANSFERENCIA' && m.cuentaOrigen === selectedId)).reduce((v,m) => v+Number(m.monto),0))}</p><p className="mt-2 text-[11px] text-slate-400">Últimos 50 movimientos</p></div></div></div>
        </div>
        {seccion !== 'movimientos' && <div className="grid items-start gap-6 xl:grid-cols-[minmax(310px,1fr)_minmax(0,1.3fr)]"><FormOperacion cuenta={cuenta} cuentas={cuentas} operando={operando} alOperar={realizarOperacion} /><div className="space-y-6"><HistorialTransacciones movimientos={movimientos} cuentaId={selectedId}/><button onClick={() => setSeccion('movimientos')} className="w-full rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100">Ver historial completo →</button></div></div>}
        {seccion === 'movimientos' && <HistorialTransacciones movimientos={movimientos} cuentaId={selectedId} completo/>}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-xs text-slate-500"><span className="flex items-center gap-2"><ShieldCheck size={17} className="text-emerald-600"/> Transacciones ACID con MongoDB Replica Set</span><span>Aplicación educativa · Node.js + React + MongoDB · Sin operaciones reales</span></div>
      </div>
    </main>
  </div>;
}
