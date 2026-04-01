import { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{children}</section>;
}

export function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      {desc ? <p className="mt-1 text-sm text-slate-600">{desc}</p> : null}
    </div>
  );
}
