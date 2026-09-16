import Link from 'next/link';
import { LandingFooter, LandingNav } from '@/components/landing/Chrome';

const PIPELINE = [
  ['language', 'A request in plain words, plus what is selected in the viewport.'],
  ['feature actions', 'The assistant answers with ordinary feature actions — extrude, revolve, fillet — not pixels or guesses.'],
  ['B-rep kernel', 'Actions run on a real solid-modeling kernel: exact boundary representation, booleans, fillets, mass properties.'],
  ['mesh', 'Tetrahedral or hexahedral finite elements generated from that geometry, with quality checks.'],
  ['solver', 'Deterministic finite element solvers compute stress, strain and displacement. No neural approximation stands in for the physics.'],
  ['results', 'Fields in the viewport; CSV and VTU exports for any other tool you trust.'],
];

const SECTIONS = [
  {
    index: '01',
    title: 'The challenge',
    body: 'Language models are trained on text. They can describe finite element analysis fluently, but they cannot perform it — ask a chatbot to "run an FEA" and you get plausible-sounding numbers, not a simulation. The answer is not a smarter chatbot; it is putting the model in front of real engineering tools and constraining what it may do.',
  },
  {
    index: '03',
    title: 'What the assistant does — and does not',
    body: 'It translates intent into parameters, chooses among the operations the engine actually exposes, and explains what it did. It does not compute physics, does not invent geometry outside the kernel, and does not bypass the feature tree: everything it creates is a normal feature you can inspect, edit and undo. The simulation math stays deterministic and verifiable.',
  },
  {
    index: '04',
    title: 'Grounding',
    body: 'The assistant can only emit actions the modeling engine implements. Unknown or ill-formed actions are rejected and reported, never silently accepted. There is no hidden computation between your request and the kernel — the action it emits is the action that runs.',
  },
  {
    index: '05',
    title: 'Validation',
    body: 'Every result can be taken elsewhere. Meshes, boundary conditions and material properties are exportable; results leave as CSV and VTU; whole projects travel as signed, encrypted .feai archives. If you want to check a number in commercial FEA software, you can.',
  },
];

export default function TechnicalApproachPage() {
  return (
    <div className="public-theme landing-theme">
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[50vh] l-grid-bg l-fade-bottom" aria-hidden />
        <LandingNav current="technical" />

        <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-10 md:pt-16">
          <p className="l-eyebrow mb-4">Technical approach</p>
          <h1 className="mb-6 max-w-3xl text-4xl font-light leading-[1.08] tracking-tight sm:text-5xl">
            Real physics. <span className="font-semibold">Assisted</span>, not approximated.
          </h1>
          <p className="mb-16 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: 'var(--l-muted)' }}>
            How FEAI combines a language assistant with a rigorous solid-modeling kernel and
            deterministic finite element solvers — and where the line between them sits.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {SECTIONS.slice(0, 1).map(s => (
              <article key={s.index} className="l-card p-6 md:col-span-2">
                <div className="l-index mb-4">{s.index}/</div>
                <h2 className="mb-3 text-xl font-medium">{s.title}</h2>
                <p className="text-base leading-relaxed" style={{ color: 'var(--l-muted)' }}>{s.body}</p>
              </article>
            ))}

            <section className="tech-frame p-6 md:col-span-2">
              <div className="l-index mb-4">02/</div>
              <h2 className="mb-2 text-xl font-medium">The pipeline</h2>
              <p className="mb-6 text-base" style={{ color: 'var(--l-muted)' }}>
                Six stages, each deterministic and inspectable. The assistant only ever touches the second.
              </p>
              <ol className="grid gap-px sm:grid-cols-2 lg:grid-cols-3" style={{ background: 'var(--l-border)' }}>
                {PIPELINE.map(([label, body], i) => (
                  <li key={label} className="p-4" style={{ background: 'var(--l-surface)' }}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="l-mono text-xs uppercase tracking-[0.14em]">{label}</span>
                      <span className="l-index">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--l-muted)' }}>{body}</p>
                  </li>
                ))}
              </ol>
            </section>

            {SECTIONS.slice(1).map(s => (
              <article key={s.index} className="l-card p-6">
                <div className="l-index mb-4">{s.index}/</div>
                <h2 className="mb-3 text-xl font-medium">{s.title}</h2>
                <p className="text-base leading-relaxed" style={{ color: 'var(--l-muted)' }}>{s.body}</p>
              </article>
            ))}

            <aside className="tech-frame p-6 md:col-span-2" style={{ background: 'var(--l-bg-2)' }}>
              <p className="l-eyebrow mb-3">Key principle</p>
              <p className="text-lg italic leading-relaxed">
                AI should make engineering more accessible, not replace engineering judgment.
                FEAI accelerates exploration while keeping the physics rigorous and checkable.
              </p>
            </aside>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4 border-t pt-8" style={{ borderColor: 'var(--l-border)' }}>
            <Link href="/dashboard" className="l-btn l-btn-primary">Open the editor <span aria-hidden>→</span></Link>
            <Link href="/" className="l-btn l-btn-ghost">← Back to home</Link>
          </div>
        </main>

        <LandingFooter />
      </div>
    </div>
  );
}
