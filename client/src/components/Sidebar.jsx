import { Landmark, LayoutDashboard, ArrowLeftRight, History, ShieldCheck, CircleHelp, X } from 'lucide-react';
const items = [
  { id: 'resumen', nombre: 'Panel general', Icono: LayoutDashboard },
  { id: 'operaciones', nombre: 'Operaciones', Icono: ArrowLeftRight },
  { id: 'movimientos', nombre: 'Movimientos', Icono: History }
];
export default function Sidebar({ seccion, onSeccion, movil, onClose }) {
  return <>
    {movil && <button className="fixed inset-0 z-30 bg-slate-950/60 lg:hidden" onClick={onClose} aria-label="Cerrar menú" />}
    <aside className={`${movil ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#0b1735] px-5 pb-5 pt-7 text-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:shrink-0`}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 shadow-lg shadow-indigo-950/40"><Landmark size={23} /></div>
          <div><p className="text-lg font-extrabold tracking-tight">Banca<span className="text-sky-400">Nova</span></p><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Banca digital</p></div>
        </div>
        <button onClick={onClose} className="lg:hidden" aria-label="Cerrar"><X size={20}/></button>
      </div>
      <p className="mb-4 mt-12 px-3 text-[11px] font-semibold uppercase tracking-[0.23em] text-slate-500">Menú principal</p>
      <nav className="space-y-2" aria-label="Navegación principal">
        {items.map(({id,nombre,Icono}) => <button key={id} onClick={() => {onSeccion(id); onClose()}} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-semibold transition ${seccion === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}><Icono size={19}/>{nombre}</button>)}
      </nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.06] p-4">
        <ShieldCheck className="mb-3 text-emerald-400" size={26}/>
        <p className="text-sm font-bold">Entorno académico</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">Operaciones simuladas con datos de prueba. No utilizar con dinero real.</p>
      </div>
      <div className="mt-5 flex items-center gap-2 px-2 text-xs text-slate-400"><CircleHelp size={14}/> Proyecto Ingeniería Web</div>
    </aside>
  </>;
}
