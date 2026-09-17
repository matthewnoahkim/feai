import Link from 'next/link';
import { LandingFooter, LandingNav } from '@/components/landing/Chrome';
import { Reveal } from '@/components/landing/Reveal';
import { TiltCard } from '@/components/landing/TiltCard';
import { ParallaxLayer } from '@/components/landing/ParallaxLayer';
import { ScrollProgress } from '@/components/landing/ScrollProgress';
import { Accordion } from '@/components/landing/Accordion';

const ROLES = [
  {
    index: '01',
    title: 'Software & Systems Engineering',
    body: 'Build the systems behind FEAI: the geometry kernel integration, feature tree, 3D viewport, APIs, and everything that turns a user request into an actual modeling operation. The frontend is built with TypeScript, React, and Three.js. The backend uses Python, FastAPI, and FreeCAD.',
    tags: ['TYPESCRIPT', 'PYTHON', 'THREE.JS', 'FASTAPI'],
  },
  {
    index: '02',
    title: 'Mechanical & Simulation Engineering',
    body: "Work on the engineering side of FEAI: meshing, boundary conditions, materials, solvers, and validation. We want analyses that are not only easy to set up, but also physically correct. You’ll help us improve the solver workflow, test results against known problems, and make FEAI something engineers can trust.",
    tags: ['FEA', 'MESHING', 'MATERIALS', 'VALIDATION'],
  },
  {
    index: '03',
    title: 'Research — ML & Numerical Methods',
    body: 'Explore better ways to use machine learning in engineering software. That could mean building assistants that understand geometry and simulation tools, limiting AI actions to physically meaningful operations, or developing fast models that can estimate results before running a full simulation.',
    tags: ['LLM GROUNDING', 'SURROGATE MODELS', 'CONSTRAINT SOLVING'],
  },
];

const MAILTO = 'mailto:matthew@feai.app?subject=' + encodeURIComponent("I'd like to join FEAI") + '&body=' + encodeURIComponent('Hi — I\'m interested in joining FEAI.\n\nRole I\'m interested in: \nBackground: \nLink to work (GitHub/portfolio/paper): \n');

const FAQ = [
  {
    q: 'Do I need FEA or CAD experience?',
    a: "It depends on the role. For mechanical/simulation work, yes — we need people who already know meshing, boundary conditions, and solvers well enough to judge whether a result is right. For software and research roles, we care more about your ability to work through hard, well-specified problems; you can pick up the domain from us.",
  },
  {
    q: 'Is this remote?',
    a: "We're a small, early team and currently work closely together in person, but we're open to remote for the right person, especially for research and mechanical engineering roles where deep, focused work matters more than being in the same room.",
  },
  {
    q: "What's the interview process?",
    a: "There's no portal or multi-week pipeline. You email us, we talk about what you've built and what you want to work on, and if it looks like a fit we'll usually work through a real problem together — something close to what you'd actually do here.",
  },
  {
    q: 'What stage is the company at?',
    a: 'Early. The CAD kernel and modeling workflow are live and used daily; FEA meshing, solving, and the assistant layer are actively being built. Joining now means shaping how those systems work, not maintaining something already decided.',
  },
];

export default function JoinPage() {
  return (
    <div className="public-theme landing-theme">
      <div className="relative min-h-screen">
        <ScrollProgress />
        <ParallaxLayer className="pointer-events-none absolute inset-x-0 top-0 h-[50vh] l-grid-bg l-fade-bottom" />
        <LandingNav current="join" />

        <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-10 md:pt-16">
          <Reveal>
            <p className="l-eyebrow mb-4">Join us</p>
            <h1 className="mb-6 max-w-3xl text-4xl font-light leading-[1.08] tracking-tight sm:text-5xl">
              Help us build <span className="font-semibold" style={{ color: 'var(--l-accent)' }}>FEAI.</span>
            </h1>
            <p className="mb-16 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: 'var(--l-muted)' }}>
              We're a small team building a new kind of engineering tool. If you want to work on the
              intersection of CAD, simulation, and AI, we want to hear from you. We're looking for
              engineers and researchers who can help us build a tool that is both powerful and easy to use.  
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
                Tell us what you’d like to work on.
              </h2>
              <p className="mx-auto mb-8 max-w-lg text-base leading-relaxed" style={{ color: 'var(--l-muted)' }}>
                Send us a short note about yourself and a link to something you’ve built or worked on—code, research, a CAD model, or anything else you’re proud of. We’re a small team, so there’s no application portal or long hiring process. Just send us an email and tell us what interests you.
              </p>
              <a href={MAILTO} className="l-btn l-btn-primary">Email matthew@feai.app <span aria-hidden>→</span></a>
            </TiltCard>
          </Reveal>

          <Reveal>
            <div className="mb-16 mt-20">
              <p className="l-eyebrow mb-4 text-center">Questions</p>
              <h2 className="mx-auto mb-10 max-w-xl text-center text-2xl font-light tracking-tight sm:text-3xl">
                Before you email us.
              </h2>
              <div className="mx-auto max-w-2xl">
                <Accordion items={FAQ} />
              </div>
            </div>
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
