import Link from 'next/link'
import HeroSceneLoader from './HeroSceneLoader'
import { LandingFooter, LandingNav } from './Chrome'

const WORKFLOW = [
  {
    index: '01',
    title: 'Design',
    body: 'Sketch profiles, then extrude, revolve, sweep and loft them into real solids. Booleans, fillets and chamfers run on a true B-rep kernel, not a mesh approximation.',
    tags: ['B-REP', 'PARAMETRIC', 'EDGE PICKING'],
  },
  {
    index: '02',
    title: 'Mesh',
    body: 'Generate tetrahedral or hexahedral finite element meshes from the same geometry, with element-quality checks before anything is solved.',
    tags: ['C3D4 / C3D10', 'C3D8 / C3D20', 'QUALITY'],
  },
  {
    index: '03',
    title: 'Simulate',
    body: 'Apply supports, loads, pressure and thermal conditions, run the analysis, and read stress, strain and displacement fields in the same viewport.',
    tags: ['STATIC', 'THERMAL', 'CSV / VTU'],
  },
]

const CAPABILITIES: { name: string; detail: string; status: 'live' | 'planned' }[] = [
  { name: 'Extrude', detail: 'blind · symmetric · draft', status: 'live' },
  { name: 'Revolve', detail: 'full · partial · symmetric', status: 'live' },
  { name: 'Sweep', detail: 'profile along line or arc', status: 'live' },
  { name: 'Loft', detail: 'through N profiles', status: 'live' },
  { name: 'Boolean', detail: 'union · cut · intersect', status: 'live' },
  { name: 'Fillet & chamfer', detail: 'pick real B-rep edges', status: 'live' },
  { name: 'Mesh import', detail: 'STL becomes a solid', status: 'live' },
  { name: 'Mass properties', detail: 'volume · CoM · inertia', status: 'live' },
  { name: 'Chat to CAD', detail: 'describe it, get a feature', status: 'live' },
  { name: 'Patterns & mirror', detail: 'linear · circular', status: 'planned' },
  { name: 'STEP / IGES / DXF', detail: 'import & export', status: 'planned' },
  { name: 'Constraints & assemblies', detail: 'solver-driven sketches, mates', status: 'planned' },
]

// Volumes are the engine's own results for these shapes (they're also the smoke-test cases).
const GALLERY = [
  { label: 'box 10³', value: 'V = 1000.00 mm³', svg: BoxGlyph },
  { label: 'cylinder r5 h10', value: 'V = 785.40 mm³', svg: CylinderGlyph },
  { label: 'sphere r5', value: 'V = 523.60 mm³', svg: SphereGlyph },
  { label: 'cone r5 h10', value: 'V = 261.80 mm³', svg: ConeGlyph },
  { label: 'torus R10 r2 · revolve', value: 'V = 789.57 mm³', svg: TorusGlyph },
  { label: 'box − ¼ cylinder · cut', value: 'V = 803.65 mm³', svg: CutGlyph },
]

const glyphProps = { viewBox: '0 0 120 90', fill: 'none', stroke: 'currentColor', strokeWidth: 1.25, strokeLinejoin: 'round' as const }

function BoxGlyph() {
  return (
    <svg {...glyphProps}>
      <path d="M30 30 L70 18 L98 32 L58 44 Z" />
      <path d="M30 30 V62 L58 76 V44" />
      <path d="M98 32 V64 L58 76" />
      <path d="M70 18 V50" strokeDasharray="3 3" opacity="0.5" />
    </svg>
  )
}
function CylinderGlyph() {
  return (
    <svg {...glyphProps}>
      <ellipse cx="60" cy="24" rx="26" ry="9" />
      <path d="M34 24 V66" /><path d="M86 24 V66" />
      <path d="M34 66 A26 9 0 0 0 86 66" />
      <path d="M34 66 A26 9 0 0 1 86 66" strokeDasharray="3 3" opacity="0.5" />
    </svg>
  )
}
function SphereGlyph() {
  return (
    <svg {...glyphProps}>
      <circle cx="60" cy="45" r="28" />
      <ellipse cx="60" cy="45" rx="28" ry="9" opacity="0.6" />
      <ellipse cx="60" cy="45" rx="9" ry="28" opacity="0.6" />
    </svg>
  )
}
function ConeGlyph() {
  return (
    <svg {...glyphProps}>
      <path d="M60 14 L34 66" /><path d="M60 14 L86 66" />
      <path d="M34 66 A26 9 0 0 0 86 66" />
      <path d="M34 66 A26 9 0 0 1 86 66" strokeDasharray="3 3" opacity="0.5" />
    </svg>
  )
}
function TorusGlyph() {
  return (
    <svg {...glyphProps}>
      <ellipse cx="60" cy="45" rx="40" ry="16" />
      <ellipse cx="60" cy="45" rx="14" ry="5" />
      <path d="M20 45 Q60 62 100 45" opacity="0.5" />
    </svg>
  )
}
function CutGlyph() {
  return (
    <svg {...glyphProps}>
      <path d="M30 30 L70 18 L98 32 L58 44 Z" />
      <path d="M30 30 V62 L58 76 V44" />
      <path d="M98 32 V64 L58 76" />
      <path d="M58 44 A14 6 0 0 1 84 38" opacity="0.7" />
      <path d="M58 76 A14 6 0 0 1 84 70" opacity="0.7" />
      <path d="M84 38 V70" opacity="0.7" />
    </svg>
  )
}

const CHAT_ACTION = `{
  "type": "extrude",
  "body": {
    "sketchId": "sk_01",
    "profileIds": ["r_01"],
    "depth1": 8,
    "operation": "new"
  }
}`

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] l-grid-bg l-fade-bottom" aria-hidden />

      <LandingNav />

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-12 md:grid-cols-2 md:pt-20">
        <div className="l-reveal">
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="l-badge"><span className="dot" />Engine · online</span>
            <span className="l-badge">B-rep kernel</span>
            <span className="l-badge">FEA native</span>
          </div>
          <h1 className="mb-6 text-4xl font-light leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Finite element analysis,<br />
            <span className="font-semibold" style={{ color: 'var(--l-accent)' }}>made intelligent.</span>
          </h1>
          <p className="mb-8 max-w-xl text-base leading-relaxed sm:text-lg" style={{ color: 'var(--l-muted)' }}>
            FEAI starts with a real parametric CAD kernel — sketch, extrude, revolve, sweep, loft,
            boolean, fillet — because good analysis begins with good geometry. Mesh and simulate in
            the same workspace, and let the assistant build parts from a description.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="l-btn l-btn-primary">Open the editor <span aria-hidden>→</span></Link>
            <Link href="/technical-approach" className="l-btn l-btn-ghost">Technical approach</Link>
          </div>
          <p className="l-eyebrow mt-10">Parametric CAD today · intelligent FEA is where it's going</p>
        </div>

        <div className="l-reveal tech-frame p-2" style={{ animationDelay: '120ms' }}>
          <div className="relative">
            <HeroSceneLoader />
            <div className="l-scanline" aria-hidden />
            <div className="pointer-events-none absolute left-3 top-3 l-eyebrow">hero_bracket.feai</div>
            <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap justify-between gap-2 l-mono text-[0.68rem]" style={{ color: 'var(--l-dim)' }}>
              <span>solid · 116 edges · fillet r1.5</span>
              <span>V = 30 862.76 mm³ · A = 9 946.91 mm²</span>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="l-eyebrow mb-3">Workflow</p>
        <h2 className="mb-10 text-2xl font-light tracking-tight sm:text-3xl">From sketch to stress field, in order.</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {WORKFLOW.map(step => (
            <div key={step.index} className="l-card p-6">
              <div className="l-index mb-4">{step.index}/</div>
              <h3 className="mb-3 text-xl font-medium">{step.title}</h3>
              <p className="mb-5 text-sm leading-relaxed" style={{ color: 'var(--l-muted)' }}>{step.body}</p>
              <div className="flex flex-wrap gap-2">
                {step.tags.map(t => <span key={t} className="l-badge">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Chat to CAD */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2">
        <div>
          <p className="l-eyebrow mb-3">Chat to CAD</p>
          <h2 className="mb-5 text-2xl font-light tracking-tight sm:text-3xl">Every prompt becomes a feature you can inspect.</h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--l-muted)' }}>
            The assistant doesn't paint pixels. It emits ordinary feature actions — the same
            extrudes, revolves and fillets you'd create by hand — so everything it builds shows up
            in the feature tree, can be edited, and can be undone.
          </p>
        </div>
        <div className="tech-frame p-1">
          <div className="flex items-center justify-between border-b px-4 py-2 l-eyebrow" style={{ borderColor: 'var(--l-border)' }}>
            <span>action · 1 of 3</span>
            <span style={{ color: 'var(--l-accent)' }}>applied</span>
          </div>
          <pre className="l-code m-0 border-0">{CHAT_ACTION}</pre>
        </div>
      </section>

      {/* Capabilities */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="l-eyebrow mb-3">Modeling engine</p>
            <h2 className="text-2xl font-light tracking-tight sm:text-3xl">What's live, and what's next.</h2>
          </div>
          <p className="l-mono text-xs" style={{ color: 'var(--l-dim)' }}>solid = shipped · dashed = in progress</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map(c => (
            <div key={c.name} className="l-card flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium">{c.name}</span>
                <span className={`l-badge ${c.status === 'planned' ? 'is-planned' : ''}`}>
                  {c.status === 'live' ? <><span className="dot" />live</> : 'planned'}
                </span>
              </div>
              <span className="l-mono text-xs" style={{ color: 'var(--l-dim)' }}>{c.detail}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="l-eyebrow mb-3">Verified geometry</p>
        <h2 className="mb-3 text-2xl font-light tracking-tight sm:text-3xl">Numbers, not approximations.</h2>
        <p className="mb-10 max-w-2xl text-base" style={{ color: 'var(--l-muted)' }}>
          Each of these is a case the engine is tested against, and the volumes below are its
          actual results — matching the closed-form answer to floating-point precision.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GALLERY.map(item => {
            const Glyph = item.svg
            return (
              <div key={item.label} className="l-card p-5" style={{ color: 'var(--l-accent)' }}>
                <div className="mb-4 aspect-[4/3] w-full opacity-90"><Glyph /></div>
                <div className="flex items-center justify-between l-mono text-xs">
                  <span style={{ color: 'var(--l-text)' }}>{item.label}</span>
                  <span style={{ color: 'var(--l-dim)' }}>{item.value}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* FEA strip */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="l-eyebrow mb-3">Where this is going</p>
        <h2 className="mb-3 text-2xl font-light tracking-tight sm:text-3xl">The CAD is the foundation. The analysis is the point.</h2>
        <p className="mb-10 max-w-2xl text-base" style={{ color: 'var(--l-muted)' }}>
          Next on the roadmap: analysis setup proposed from the geometry itself, surrogate models
          that estimate results before a full solve, and result interpretation you can interrogate
          in chat.
        </p>
        <div className="tech-frame grid gap-px md:grid-cols-3" style={{ background: 'var(--l-border)' }}>
          {[
            ['Mesh', 'Tet and hex elements, linear or quadratic, sized to the feature. Quality metrics before you solve.'],
            ['Boundary conditions', 'Fixed and displacement supports, symmetry, gravity, pressure, point and surface forces, thermal loads.'],
            ['Results', 'Stress, strain and displacement fields in the viewport; export CSV and VTU for downstream tools.'],
          ].map(([title, body]) => (
            <div key={title} className="p-6" style={{ background: 'var(--l-surface)' }}>
              <h3 className="mb-2 font-medium">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--l-muted)' }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <p className="l-eyebrow mb-4">Ownership</p>
        <h2 className="mx-auto mb-5 max-w-2xl text-3xl font-light tracking-tight sm:text-4xl">
          Your projects are signed, encrypted archives you can take anywhere.
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-base" style={{ color: 'var(--l-muted)' }}>
          Export a project as a single <span className="l-mono">.feai</span> file, re-import it on
          any account. Nothing about your geometry is locked in.
        </p>
        <Link href="/dashboard" className="l-btn l-btn-primary">Start building <span aria-hidden>→</span></Link>
      </section>

      <LandingFooter />
    </div>
  )
}
