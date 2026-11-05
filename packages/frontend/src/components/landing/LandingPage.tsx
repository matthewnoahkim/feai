import Link from 'next/link'
import HeroSceneLoader from './HeroSceneLoader'
import { LandingFooter, LandingNav } from './Chrome'
import { Reveal } from './Reveal'
import { TiltCard } from './TiltCard'
import { AnimatedNumber } from './AnimatedNumber'
import { ParallaxLayer } from './ParallaxLayer'
import { ScrollProgress } from './ScrollProgress'
import { CursorGlow } from './CursorGlow'
import { ScrollScale } from './ScrollScale'
import { ScrollMarquee } from './ScrollMarquee'
import { StickyScroll, type StickyStep } from './StickyScroll'
import { PartVisual } from './PartVisual'

const WORKFLOW = [
  {
    index: '01',
    title: 'Design',
    visual: 'kernel' as const,
    body: 'Sketch a shape, then extrude, revolve, sweep, or loft it into a solid. Cuts, fillets, and chamfers work on the real geometry, not a rough approximation.',
    tags: ['B-REP', 'PARAMETRIC', 'EDGE PICKING'],
  },
  {
    index: '02',
    title: 'Mesh',
    visual: 'mesh' as const,
    body: "Turn that solid into a mesh — tet or hex elements — and check the mesh quality before you run anything.",
    tags: ['C3D4 / C3D10', 'C3D8 / C3D20', 'QUALITY'],
  },
  {
    index: '03',
    title: 'Simulate',
    visual: 'results' as const,
    body: 'Add supports and loads, run the analysis, and see stress, strain, and displacement right there in the viewport.',
    tags: ['STATIC', 'THERMAL', 'CSV / VTU'],
  },
]

const PIPELINE: StickyStep[] = [
  {
    index: '01',
    title: 'language',
    visual: 'prompt',
    body: "You just describe what you want. FEAI also knows what's going on in your viewport — selected faces, edges, materials, loads, whatever's relevant.",
  },
  {
    index: '02',
    title: 'feature actions',
    visual: 'action',
    body: "The assistant turns that into real actions FEAI already knows how to run — sketch, extrude, fillet, assign a material, apply a force. It's not writing code or touching the scene directly, just picking from a fixed list of moves and filling in the details.",
  },
  {
    index: '03',
    title: 'B-rep kernel',
    visual: 'kernel',
    body: "Those actions run through a real CAD kernel, not a triangle mesh. Faces, edges, and solids stay real geometry, so booleans, fillets, and measurements all work properly, and you can still edit everything afterward in the feature tree.",
  },
  {
    index: '04',
    title: 'mesh',
    visual: 'mesh',
    body: "Before solving, that solid gets broken into a mesh — tet or hex elements — with a quality check first. The mesh keeps track of how it connects back to the original geometry, so loads and constraints carry over correctly.",
  },
  {
    index: '05',
    title: 'solver',
    visual: 'solver',
    body: "This is where the actual math happens. For a simple static analysis, FEAI solves Ku = f — stiffness times displacement equals load — and works out strain and stress from there. The AI has nothing to do with this step; it's standard finite element math.",
  },
  {
    index: '06',
    title: 'results',
    visual: 'results',
    body: "The results get mapped back onto your model so you can look at displacement, stress, or strain. You can also export the raw numbers if you want to check them yourself.",
  },
]

const TECH_SECTIONS = [
  {
    index: '01',
    title: 'The challenge',
    visual: 'prompt' as const,
    body: 'An AI model can understand "fix this face and apply 1 kN here" — but understanding the request isn\'t the same as solving it. Real FEA needs real geometry, real materials, a real mesh, and real math, done the same way every time. FEAI\'s assistant translates what you mean into those steps; the kernel and solver handle the actual computation.',
  },
  {
    index: '02',
    title: 'The assistant',
    visual: 'action' as const,
    body: 'Think of the assistant as a translator, not a replacement for the engineering. Say "use steel, fix these mounting holes, and put 2 kN on this face," and it turns that into real parameters — steel as the material, those faces fixed, 2000 N applied in the right direction. Those run through the same systems you\'d use by hand, so you can inspect, edit, or delete them like anything else.',
  },
  {
    index: '03',
    title: 'Grounding',
    visual: 'kernel' as const,
    body: "The model can't just make things up. Every action has a strict definition — what it needs, what units, what's valid. A load needs a real face, a real magnitude, a real direction. If a request doesn't fit any known action, FEAI asks for clarification instead of guessing.",
  },
  {
    index: '04',
    title: 'Validation',
    visual: 'results' as const,
    body: 'A simulation is only useful if you can trust it. FEAI shows you everything that went in — geometry, mesh, materials, loads, solver settings — and lets you export the mesh and results as VTU or CSV so you can check them anywhere. The goal isn\'t a pretty picture. It\'s a number you can trust.',
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

// Volumes are the engine's own results for these shapes (they're also the smoke-test
// cases) — kept as plain numbers, not pre-formatted strings, so AnimatedNumber can count
// up to them instead of just printing static text.
const GALLERY = [
  { label: 'box 10³', volume: 1000.00, svg: BoxGlyph },
  { label: 'cylinder r5 h10', volume: 785.40, svg: CylinderGlyph },
  { label: 'sphere r5', volume: 523.60, svg: SphereGlyph },
  { label: 'cone r5 h10', volume: 261.80, svg: ConeGlyph },
  { label: 'torus R10 r2 · revolve', volume: 789.57, svg: TorusGlyph },
  { label: 'box − ¼ cylinder · cut', volume: 803.65, svg: CutGlyph },
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
      <ScrollProgress />
      <ParallaxLayer className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] l-grid-bg l-fade-bottom" />

      <LandingNav />

      {/* Hero */}
      <CursorGlow className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-12 md:grid-cols-2 md:pt-20">
        <div className="l-reveal">
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="l-badge"><span className="dot l-pulse" />Engine · online</span>
            <span className="l-badge">B-rep kernel</span>
            <span className="l-badge">FEA native</span>
          </div>
          <h1 className="mb-6 text-4xl font-light leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Finite element analysis,<br />
            <span className="font-semibold" style={{ color: 'var(--l-accent)' }}>made intelligent.</span>
          </h1>
          <p className="mb-8 max-w-xl text-base leading-relaxed sm:text-lg" style={{ color: 'var(--l-muted)' }}>
            FEAI starts with real CAD — sketch, extrude, revolve, the same tools you already
            know — because a good simulation starts with a good model. Design and simulate in
            one place, and just describe what you want instead of hunting through menus.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="l-btn l-btn-primary">Open the editor <span aria-hidden>→</span></Link>
            <Link href="#technical-approach" className="l-btn l-btn-ghost">Technical approach</Link>
          </div>
          <p className="l-eyebrow mt-10">Parametric CAD today · intelligent FEA is where it's going</p>
        </div>

        <ScrollScale className="l-reveal tech-frame p-2" style={{ animationDelay: '120ms' }}>
          <div className="relative">
            <HeroSceneLoader />
            <div className="l-scanline" aria-hidden />
            <div className="pointer-events-none absolute left-3 top-3 l-eyebrow">hero_bracket.feai</div>
            <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap justify-between gap-2 l-mono text-[0.68rem]" style={{ color: 'var(--l-dim)' }}>
              <span>solid · 116 edges · fillet r1.5</span>
              <span>V = 30 862.76 mm³ · A = 9 946.91 mm²</span>
            </div>
          </div>
        </ScrollScale>
      </CursorGlow>

      {/* Stack ticker */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="border-y py-4" style={{ borderColor: 'var(--l-border)' }}>
          <ScrollMarquee items={CAPABILITIES.map(c => c.name.toUpperCase())} />
        </div>
      </div>

      {/* Workflow */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="l-eyebrow mb-3">Workflow</p>
        <h2 className="mb-10 text-2xl font-light tracking-tight sm:text-3xl">From sketch to stress field, in order.</h2>
        <StickyScroll steps={WORKFLOW} />
      </section>

      {/* Chat to CAD */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2">
        <Reveal>
          <p className="l-eyebrow mb-3">Chat to CAD</p>
          <h2 className="mb-5 text-2xl font-light tracking-tight sm:text-3xl">Every prompt becomes a feature you can inspect.</h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--l-muted)' }}>
            The assistant isn't drawing pixels — it's using the same tools you would. Every
            extrude, revolve, or fillet it creates shows up in your feature tree, just like you
            built it yourself. You can edit it, undo it, whatever you'd normally do.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="tech-frame p-1">
            <div className="flex items-center justify-between border-b px-4 py-2 l-eyebrow" style={{ borderColor: 'var(--l-border)' }}>
              <span>action · 1 of 3</span>
              <span style={{ color: 'var(--l-accent)' }}>applied</span>
            </div>
            <pre className="l-code m-0 border-0">{CHAT_ACTION}</pre>
          </div>
        </Reveal>
      </section>

      {/* Technical approach */}
      <section id="technical-approach" className="mx-auto max-w-6xl scroll-mt-10 px-6 py-20">
        <Reveal>
          <p className="l-eyebrow mb-4">Technical approach</p>
          <h2 className="mb-6 max-w-2xl text-3xl font-light leading-[1.1] tracking-tight sm:text-4xl">
            How a typed request turns into an actual analysis.
          </h2>
          <p className="mb-10 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: 'var(--l-muted)' }}>
            FEAI uses AI to help you set things up, but it never does the actual math. A real
            CAD kernel builds the geometry, a mesher builds the mesh, and a finite element
            solver does the calculation.
          </p>
        </Reveal>

        <Reveal className="mb-16">
          <div className="border-y py-4" style={{ borderColor: 'var(--l-border)' }}>
            <ScrollMarquee items={PIPELINE.map(s => s.title.toUpperCase())} />
          </div>
        </Reveal>

        <Reveal>
          <article className="l-card mb-16 grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="l-index mb-4">{TECH_SECTIONS[0].index}/</div>
              <h3 className="mb-3 text-xl font-medium">{TECH_SECTIONS[0].title}</h3>
              <p className="text-base leading-relaxed" style={{ color: 'var(--l-muted)' }}>{TECH_SECTIONS[0].body}</p>
            </div>
            <div className="w-full sm:w-56">
              <PartVisual mode="prompt" />
            </div>
          </article>
        </Reveal>

        <div className="mb-20">
          <p className="l-eyebrow mb-3">The pipeline</p>
          <h3 className="mb-3 text-2xl font-light tracking-tight sm:text-3xl">Every request goes through the same six steps.</h3>
          <p className="mb-16 max-w-2xl text-base" style={{ color: 'var(--l-muted)' }}>
            The assistant turns your request into real actions. From there, the geometry kernel,
            mesher, and solver take over. Scroll through to see exactly where the AI's job ends
            and the engineering begins.
          </p>
          <StickyScroll steps={PIPELINE} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {TECH_SECTIONS.slice(1).map((s, i) => (
            <Reveal key={s.index} delay={i * 100}>
              <TiltCard className="l-card flex h-full flex-col gap-5 p-6">
                <div className="w-20">
                  <PartVisual mode={s.visual} />
                </div>
                <div>
                  <div className="l-index mb-3">{s.index}/</div>
                  <h3 className="mb-3 text-lg font-medium">{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--l-muted)' }}>{s.body}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
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
          {CAPABILITIES.map((c, i) => (
            <Reveal key={c.name} delay={(i % 4) * 80}>
              <TiltCard className="l-card flex h-full flex-col gap-3 p-5" maxTilt={5}>
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium">{c.name}</span>
                  <span className={`l-badge ${c.status === 'planned' ? 'is-planned' : ''}`}>
                    {c.status === 'live' ? <><span className="dot l-pulse" />live</> : 'planned'}
                  </span>
                </div>
                <span className="l-mono text-xs" style={{ color: 'var(--l-dim)' }}>{c.detail}</span>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="l-eyebrow mb-3">Verified geometry</p>
        <h2 className="mb-3 text-2xl font-light tracking-tight sm:text-3xl">Numbers, not approximations.</h2>
        <p className="mb-10 max-w-2xl text-base" style={{ color: 'var(--l-muted)' }}>
          These are real test cases. The volumes below are what the engine actually
          calculated — matching the exact math to floating-point precision.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GALLERY.map((item, i) => {
            const Glyph = item.svg
            return (
              <Reveal key={item.label} delay={(i % 3) * 100}>
                <TiltCard className="l-card p-5" style={{ color: 'var(--l-accent)' }}>
                  <div className="mb-4 aspect-[4/3] w-full opacity-90"><Glyph /></div>
                  <div className="flex items-center justify-between l-mono text-xs">
                    <span style={{ color: 'var(--l-text)' }}>{item.label}</span>
                    <span style={{ color: 'var(--l-dim)' }}>V = <AnimatedNumber value={item.volume} /> mm³</span>
                  </div>
                </TiltCard>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* FEA strip */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <p className="l-eyebrow mb-3">Where this is going</p>
          <h2 className="mb-3 text-2xl font-light tracking-tight sm:text-3xl">The CAD is the foundation. The analysis is the point.</h2>
          <p className="mb-10 max-w-2xl text-base" style={{ color: 'var(--l-muted)' }}>
            Up next: the assistant suggesting a setup based on your geometry, quick estimates
            before a full simulation runs, and being able to ask questions about your results
            right in chat.
          </p>
        </Reveal>
        <div className="tech-frame grid gap-px md:grid-cols-3" style={{ background: 'var(--l-border)' }}>
          {[
            ['Mesh', "Tet or hex elements, sized to fit the geometry, with a quality check before anything runs."],
            ['Boundary conditions', 'Supports, gravity, pressure, forces, thermal loads — the usual boundary conditions, applied right on the model.'],
            ['Results', 'See stress, strain, and displacement in the viewport, or export the numbers as CSV or VTU.'],
          ].map(([title, body], i) => (
            <Reveal key={title} delay={i * 100} className="h-full">
              <div className="h-full p-6" style={{ background: 'var(--l-surface)' }}>
                <h3 className="mb-2 font-medium">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--l-muted)' }}>{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Careers */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <TiltCard className="l-card flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center" maxTilt={3}>
            <div>
              <p className="l-eyebrow mb-3">We're hiring</p>
              <h2 className="mb-3 text-2xl font-light tracking-tight sm:text-3xl">Building the geometry engine, the solver, and the AI that connects them.</h2>
              <p className="max-w-xl text-base leading-relaxed" style={{ color: 'var(--l-muted)' }}>
                We're looking for engineers and researchers who want to work on real solid
                modeling and real physics — not another chatbot wrapper.
              </p>
            </div>
            <Link href="/join" className="l-btn l-btn-primary flex-shrink-0">See open roles <span aria-hidden>→</span></Link>
          </TiltCard>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <Reveal>
          <p className="l-eyebrow mb-4">Ownership</p>
          <h2 className="mx-auto mb-5 max-w-2xl text-3xl font-light tracking-tight sm:text-4xl">
            Your projects are signed, encrypted archives you can take anywhere.
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-base" style={{ color: 'var(--l-muted)' }}>
            Export a project as a single <span className="l-mono">.feai</span> file and open it
            on any account. Nothing about your geometry is locked in.
          </p>
          <Link href="/dashboard" className="l-btn l-btn-primary">Start building <span aria-hidden>→</span></Link>
        </Reveal>
      </section>

      <LandingFooter />
    </div>
  )
}
