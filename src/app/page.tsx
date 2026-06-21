import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui";

export default function Home() {
  return (
    <div className="grid gap-6">
      <div className="glass-card relative overflow-hidden p-5 sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(6,182,212,0.5) 0%, transparent 70%)",
          }}
        />

        <h1 className="relative text-2xl font-bold tracking-tight gradient-text sm:text-3xl">
          Tracker pentru exerciții
        </h1>
        <p className="relative mt-3 max-w-lg text-sm text-[var(--muted)]">
          Datele sunt salvate server-side în{" "}
          <span className="font-mono text-cyan-300/80">data/track.json</span>.
          Urmărește progresul, greutatea și streak-ul tău.
        </p>
        <div className="relative mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/session" className="btn-gradient w-full sm:w-auto">
            Pornește o sesiune
          </Link>
          <Link href="/programs" className="btn-ghost w-full sm:w-auto">
            Gestionează programe
          </Link>
          <Link href="/stats" className="btn-ghost w-full sm:w-auto">
            Vezi statistici
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/30 to-cyan-500/20 text-sm font-bold text-violet-300">
            1
          </div>
          <CardTitle>Exerciții</CardTitle>
          <CardDescription>
            Creează exerciții cu sets/reps implicite, editabile per program sau
            sesiune.
          </CardDescription>
          <Link href="/exercises" className="link-accent mt-4 inline-flex">
            Mergi la Exerciții
          </Link>
        </Card>

        <Card>
          <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/30 to-orange-500/20 text-sm font-bold text-pink-300">
            2
          </div>
          <CardTitle>Programe & sesiuni</CardTitle>
          <CardDescription>
            Un program este o listă de exerciții. O sesiune are start/stop,
            program ales și greutatea ta la început.
          </CardDescription>
          <Link href="/session" className="link-accent mt-4 inline-flex">
            Începe o sesiune
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Sets / Reps", color: "from-violet-500 to-purple-600" },
          { label: "Streak", color: "from-cyan-500 to-teal-600" },
          { label: "Greutate", color: "from-pink-500 to-rose-600" },
        ].map(({ label, color }) => (
          <div
            key={label}
            className="glass-card flex flex-col items-center p-5 text-center"
          >
            <div
              className={`mb-2 h-1 w-12 rounded-full bg-gradient-to-r ${color}`}
            />
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              {label}
            </span>
            <span className="mt-1 text-sm text-zinc-400">
              Grafice în Statistici
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
