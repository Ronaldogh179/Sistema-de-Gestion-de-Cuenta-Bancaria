import { ArrowUpRight, CreditCard, Eye, Wallet, RefreshCcw } from 'lucide-react';
export function moneda(valor) {return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(valor || 0));}
export default function SaldoCard({ cuenta, refrescar, cargando }) {
  return <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#16358e] via-[#2456bc] to-[#2478d3] p-6 text-white shadow-xl shadow-blue-900/15 sm:p-8">
    <div className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full border-[42px] border-white/[0.07]"/>
    <div className="pointer-events-none absolute -bottom-28 right-32 size-60 rounded-full border-[36px] border-white/[0.06]"/>
    <div className="relative flex items-start justify-between gap-2">
      <div><p className="text-sm font-medium text-blue-100">Saldo disponible</p><h2 className="mt-3 break-all text-4xl font-extrabold tracking-tight sm:text-5xl">{moneda(cuenta?.saldo)}</h2><p className="mt-3 text-xs text-blue-100/90">Saldo actualizado en tiempo real tras cada operación</p></div>
      <button onClick={refrescar} disabled={cargando} className="rounded-xl bg-white/15 p-2.5 transition hover:bg-white/25 disabled:opacity-50" aria-label="Actualizar saldo" title="Actualizar saldo"><RefreshCcw size={19} className={cargando ? 'animate-spin' : ''}/></button>
    </div>
    <div className="relative mt-9 flex flex-wrap items-end justify-between gap-5 border-t border-white/20 pt-5">
      <div><p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">Número de cuenta</p><p className="mt-1 flex items-center gap-2 font-mono text-sm font-semibold tracking-[0.12em]"><CreditCard size={17}/> {cuenta?.numero || '—'}</p></div>
      <div className="text-left sm:text-right"><p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">Titular</p><p className="mt-1 text-sm font-semibold">{cuenta?.titular || '—'}</p></div>
    </div>
  </section>;
}
