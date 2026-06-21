import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 sm:mb-6">
      <h1 className="text-xl font-semibold tracking-tight gradient-text sm:text-2xl">
        {title}
      </h1>
      {description && (
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
          {description}
        </p>
      )}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass-card p-4 sm:p-6 ${className}`}>{children}</div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-semibold text-zinc-100">{children}</h2>;
}

export function CardDescription({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-sm text-[var(--muted)]">{children}</p>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-white/10 bg-white/2 px-4 py-8 text-center text-sm text-[var(--muted)]">
      {children}
    </p>
  );
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-zinc-400">
      {children}
    </label>
  );
}

export function FieldGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-col">{children}</div>;
}

export function LoadingState({ label = "Se încarcă datele..." }: { label?: string }) {
  return (
    <p className="rounded-xl border border-white/10 bg-white/2 px-4 py-12 text-center text-sm text-[var(--muted)]">
      {label}
    </p>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {message}
    </p>
  );
}
