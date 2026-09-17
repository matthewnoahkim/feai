import Link from 'next/link';
import { LandingFooter, LandingNav } from '@/components/landing/Chrome';
import { Reveal } from '@/components/landing/Reveal';
import { ParallaxLayer } from '@/components/landing/ParallaxLayer';
import { ScrollProgress } from '@/components/landing/ScrollProgress';
import { StickyScroll, type StickyStep } from '@/components/landing/StickyScroll';
import { PartVisual } from '@/components/landing/PartVisual';
import { ScrollMarquee } from '@/components/landing/ScrollMarquee';

const PIPELINE: StickyStep[] = [
  {
    index: '01',
    title: 'language',
    visual: 'prompt',
    body: 'You describe what you want in plain English. FEAI also passes along useful context from the viewport: selected faces, edges, bodies, existing materials, loads, constraints, and analysis settings.',
  },
  {
    index: '02',
    title: 'feature actions',
    visual: 'action',
    body: 'The assistant converts that request into structured operations that FEAI already knows how to execute. That includes actions such as create sketch, extrude, revolve, fillet, assign material, constrain face, apply force. The model does not write arbitrary geometry code or directly modify the scene. It chooses from defined operations and fills in their parameters.',
  },
  {
    index: '03',
    title: 'B-rep kernel',
    visual: 'kernel',
    body: 'Geometry operations are executed by the CAD kernel as boundary-representation solids. Faces, edges, vertices, shells, and solids remain real geometric entities rather than being reduced to a triangle mesh. That means operations such as booleans, fillets, selections, and mass-property calculations work on the underlying CAD model. The resulting model also remains editable through the feature tree.',
  },
  {
    index: '04',
    title: 'mesh',
    visual: 'mesh',
    body: 'The solid is discretized into finite elements before solving. FEAI can generate tetrahedral or hexahedral meshes from the CAD geometry and checks basic mesh quality before analysis. The mesh stores the nodes, element connectivity, material regions, and the geometric surfaces used to transfer loads and constraints from the CAD model into the finite element model.',
  },
  {
    index: '05',
    title: 'solver',
    visual: 'solver',
    body: 'The finite element solver computes the response. For a linear static analysis, FEAI assembles the global system Ku = f where K is the stiffness matrix, u is the displacement vector, and f contains the applied loads. Boundary conditions modify the system, the solver computes nodal displacements, and element quantities are recovered afterward, including strain and stress. The language model is not involved in this calculation.',
  },
  {
    index: '06',
    title: 'results',
    visual: 'results',
    body: 'Results are mapped back onto the model for inspection. You can view quantities such as displacement, strain, stress, or von Mises stress. The underlying numerical data can also be exported for independent analysis or visualization.',
  },
];

const SECTIONS = [
  {
    index: '01',
    title: 'The challenge',
    body: 'A language model can understand a request like “fix this face and apply a 1 kN load here,” but understanding the request is not the same as solving the structure. Finite element analysis depends on geometry, material properties, boundary conditions, meshing, matrix assembly, and numerical solution. Those steps need to be explicit and reproducible. In FEAI, the assistant helps translate what you mean into those engineering operations. The geometry kernel and solver do the actual computation.',
  },
  {
    index: '03',
    title: 'The assistant',
    body: 'The assistant is an interface to the engineering system, not a replacement for it. It can interpret requests, identify selected geometry, choose supported operations, fill in parameters, and explain what FEAI did. For example, if you write: “Use steel, fix these mounting holes, and put 2 kN on this face”, the assistant might translate that into: material → structural steel; constraint → fixed, selected faces 14–17; load → 2000 N, selected face 23, −Z direction. Those actions are then executed by the same geometry and simulation systems that would run if you created them manually. Everything appears in the model normally, so you can inspect it, edit it, or remove it afterward.',
  },
  {
    index: '04',
    title: 'Grounding',
    body: 'FEAI does not let the language model invent commands and hope they work. Each operation has a defined schema: the action name, required parameters, valid units, supported geometry references, and allowed values. A load action, for example, needs an actual model entity, a magnitude, and a direction. A material assignment needs a valid body and material definition. Geometry operations need the parameters expected by the CAD kernel. If a request cannot be represented by one of those operations, FEAI rejects it or asks for more information. That creates a simple boundary: the model decides what operation you probably want; the engineering system decides what operations are actually possible.',
  },
  {
    index: '05',
    title: 'Validation',
    body: 'A simulation is much more useful when you can inspect what went into it. FEAI keeps the analysis inputs visible: geometry, mesh, material properties, loads, constraints, and solver settings. Meshes and numerical results can also be exported in standard formats such as VTU and CSV. That makes it possible to inspect the mesh in another viewer, process results in Python, or compare the same problem against another FEA package. For validation, we use problems with known or independently computed solutions and compare quantities such as displacement, reaction force, stress, and mesh convergence. The goal is not simply to produce a contour plot. It is to make it possible to understand where the result came from.',
  },
];

export default function TechnicalApproachPage() {
  return (
    <div className="public-theme landing-theme">
      <div className="relative min-h-screen">
        <ScrollProgress />
        <ParallaxLayer className="pointer-events-none absolute inset-x-0 top-0 h-[50vh] l-grid-bg l-fade-bottom" />
        <LandingNav current="technical" />

        <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-10 md:pt-16">
          <Reveal>
            <p className="l-eyebrow mb-4">Technical approach</p>
            <h1 className="mb-6 max-w-3xl text-4xl font-light leading-[1.08] tracking-tight sm:text-5xl">
              How FEAI turns a request into an analysis.
            </h1>
            <p className="mb-10 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: 'var(--l-muted)' }}>
              FEAI uses a language model to help you build and set up analyses, but the model never computes the answer itself. Geometry is created by a solid-modeling kernel, meshes are generated explicitly, and finite element solvers calculate the response.
            </p>
          </Reveal>

          <Reveal className="mb-20">
            <div className="border-y py-4" style={{ borderColor: 'var(--l-border)' }}>
              <ScrollMarquee items={PIPELINE.map(s => s.title.toUpperCase())} />
            </div>
          </Reveal>

          <Reveal>
            <article className="l-card mb-20 grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="l-index mb-4">{SECTIONS[0].index}/</div>
                <h2 className="mb-3 text-xl font-medium">{SECTIONS[0].title}</h2>
                <p className="text-base leading-relaxed" style={{ color: 'var(--l-muted)' }}>{SECTIONS[0].body}</p>
              </div>
              <div className="w-full sm:w-56">
                <PartVisual mode="prompt" />
              </div>
            </article>
          </Reveal>

          <section className="mb-24">
            <p className="l-eyebrow mb-3">02/ The pipeline</p>
            <h2 className="mb-3 text-2xl font-light tracking-tight sm:text-3xl">Every analysis follows the same six stages.</h2>
            <p className="mb-16 max-w-2xl text-base" style={{ color: 'var(--l-muted)' }}>
              The assistant turns your request into supported actions; the geometry kernel, mesher, and solver handle everything after that. Scroll to see where the language model's job ends and the engineering system's job begins.
            </p>
            <StickyScroll steps={PIPELINE} />
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            {SECTIONS.slice(1).map((s, i) => (
              <Reveal key={s.index} delay={i * 100}>
                <article className="l-card flex h-full flex-col gap-5 p-6 sm:flex-row sm:items-start">
                  <div className="w-full sm:w-32 sm:flex-shrink-0">
                    <PartVisual mode={(['action', 'kernel', 'results'] as const)[i]} />
                  </div>
                  <div>
                    <div className="l-index mb-4">{s.index}/</div>
                    <h2 className="mb-3 text-xl font-medium">{s.title}</h2>
                    <p className="text-base leading-relaxed" style={{ color: 'var(--l-muted)' }}>{s.body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-12 flex flex-wrap items-center gap-4 border-t pt-8" style={{ borderColor: 'var(--l-border)' }}>
              <Link href="/dashboard" className="l-btn l-btn-primary">Open the editor <span aria-hidden>→</span></Link>
              <Link href="/" className="l-btn l-btn-ghost">← Back to home</Link>
            </div>
          </Reveal>
        </main>

        <LandingFooter />
      </div>
    </div>
  );
}
