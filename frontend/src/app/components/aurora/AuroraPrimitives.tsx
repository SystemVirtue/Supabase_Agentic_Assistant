import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-white/10 bg-white/[0.035] ${className}`}>{children}</section>
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70">{children}</span>
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="text-[10px] uppercase tracking-[.14em] text-white/35 font-semibold">{children}</div>
}

export function StateMessage({ kind, children }: { kind: 'empty' | 'loading' | 'error' | 'success'; children: ReactNode }) {
  const tone = kind === 'error' ? 'text-red-200 border-red-400/20 bg-red-400/5' : kind === 'success' ? 'text-emerald-200 border-emerald-400/20 bg-emerald-400/5' : 'text-white/45 border-white/10 bg-white/[0.02]'
  return <div role={kind === 'error' ? 'alert' : undefined} className={`rounded-lg border p-4 text-sm ${tone}`}>{children}</div>
}
