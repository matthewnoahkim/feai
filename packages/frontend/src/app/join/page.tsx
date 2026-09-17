import Link from 'next/link';
import { LandingFooter, LandingNav } from '@/components/landing/Chrome';
import { Reveal } from '@/components/landing/Reveal';
import { TiltCard } from '@/components/landing/TiltCard';
import { ParallaxLayer } from '@/components/landing/ParallaxLayer';

const ROLES = [
  {
    index: '01',
    title: 'Software & Systems Engineering',
    body: 'The modeling kernel wrapper, the feature-tree editor, the real-time viewport, and the plumbing that turns a chat message into a B-rep operation. TypeScript/React on the front end, Python around FreeCAD on the back end.',
    tags: ['TYPESCRIPT', 'PYTHON', 'THREE.JS', 'FASTAPI'],
  },
  {
    index: '02',
    title: 'Mechanical & Simulation Engineering',
    body: "Meshing, boundary conditions, materials, solvers — and the judgment to know when a result is right. You'll shape what \"analysis\" means in a tool built on a real B-rep kernel, not a mesh approximation.",
    tags: ['FEA', 'MESHING', 'MATERIALS', 'VALIDATION'],
  },
  {
    index: '03',
    title: 'Research — ML & Numerical Methods',
    body: 'Grounding a language model in tools it can\'t hallucinate past: constrained action spaces, geometry-aware assistants, surrogate models that estimate a result before a full solve runs.',
    tags: ['LLM GROUNDING', 'SURROGATE MODELS', 'CONSTRAINT SOLVING'],
  },
];

const MAILTO = 'mailto:matthew@feai.app?subject=' + encodeURIComponent("I'd like to join FEAI") + '&body=' + encodeURIComponent('Hi — I\'m interested in joining FEAI.\n\nRole I\'m interested in: \nBackground: \nLink to work (GitHub/portfolio/paper): \n');

export default function JoinPage() {
  return (
    <div className="public-theme landing-theme">
      <div className="relative min-h-screen">
        <ParallaxLayer className="pointer-events-none absolute inset-x-0 top-0 h-[50vh] l-grid-bg l-fade-bottom" />
        <LandingNav current="join" />

        <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-10 md:pt-16">
          <Reveal>
            <p className="l-eyebrow mb-4">Join us</p>
            <h1 className="mb-6 max-w-3xl text-4xl font-light leading-[1.08] tracking-tight sm:text-5xl">
              Real kernel. Real solver. <span className="font-semibold" style={{ color: 'var(--l-accent)' }}>Real work.</span>
            </h1>
            <p className="mb-16 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: 'var(--l-muted)' }}>
              FEAI is built on a true B-rep modeling kernel and deterministic finite element
              solvers — the assistant grounds language in that, it doesn't replace it. If you'd
              rather work on real geometry and real physics than another chatbot wrapper, we want
              to hear from you.
            </p>
          </Reveal>

          <div className="mb-20 grid gap-4 md:grid-cols-3">
            {ROLES.map((role, i) => (
              <Reveal key={role.index} delay={i * 100}>
                <TiltCard className="l-card h-full p-6">
                  <div className="l-index mb-4">{role.index}/</div>
                  <h2 className="mb-3 text-xl font-medium">{role.title}</h2>
                  <p className="mb-5 text-sm leading-relaxed" style={{ color: 'var(--l-muted)' }}>{role.body}</p>
                  <div className="flex flex-wrap gap-2">
                    {role.tags.map(t => <span key={t} className="l-badge">{t}</span>)}
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <TiltCard className="tech-frame p-8 text-center" maxTilt={3}>
              <p className="l-eyebrow mb-4">How to apply</p>
              <h2 className="mx-auto mb-5 max-w-xl text-2xl font-light tracking-tight sm:text-3xl">
                No portal, no ATS. Just tell us what you'd want to build.
              </h2>
              <p className="mx-auto mb-8 max-w-lg text-base leading-relaxed" style={{ color: 'var(--l-muted)' }}>
                Send a note with your background and a link to work you're proud of — code,
                papers, a CAD model, anything real. We're a small team early on, so this is a
                direct line, not a form disappearing into a queue.
              </p>
              <a href={MAILTO} className="l-btn l-btn-primary">Email matthew@feai.app <span aria-hidden>→</span></a>
            </TiltCard>
          </Reveal>

          <p className="mt-10 text-center text-sm">
            <Link href="/technical-approach" className="hover:underline" style={{ color: 'var(--l-muted)' }}>
              Read more about the technical approach first →
            </Link>
          </p>
        </main>

        <LandingFooter />
      </div>
    </div>
  );
}
