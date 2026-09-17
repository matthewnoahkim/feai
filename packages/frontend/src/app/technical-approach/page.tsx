import Link from 'next/link';
import { LandingFooter, LandingNav } from '@/components/landing/Chrome';

const PIPELINE = [
  ['language', 'You describe what you want in plain English.FEAI also passes along useful context from the viewport: selected faces, edges, bodies, existing materials, loads, constraints, and analysis settings.'],
  ['feature actions', 'The assistant converts that request into structured operations that FEAI already knows how to execute. That includes actions such as create sketch, extrude, revolve, fillet, assign material, constrain face, apply force. The model does not write arbitrary geometry code or directly modify the scene. It chooses from defined operations and fills in their parameters.'],
  ['B-rep kernel', 'Geometry operations are executed by the CAD kernel as boundary-representation solids. Faces, edges, vertices, shells, and solids remain real geometric entities rather than being reduced to a triangle mesh. That means operations such as booleans, fillets, selections, and mass-property calculations work on the underlying CAD model. The resulting model also remains editable through the feature tree.'],
  ['mesh', 'The solid is discretized into finite elements before solving. FEAI can generate tetrahedral or hexahedral meshes from the CAD geometry and checks basic mesh quality before analysis. The mesh stores the nodes, element connectivity, material regions, and the geometric surfaces used to transfer loads and constraints from the CAD model into the finite element model.'],
  ['solver', 'The finite element solver computes the response. For a linear static analysis, FEAI assembles the global system Ku = f where K is the stiffness matrix, u is the displacement vector, and f contains the applied loads. Boundary conditions modify the system, the solver computes nodal displacements, and element quantities are recovered afterward, including strain and stress. The language model is not involved in this calculation.'],
  ['results', 'Results are mapped back onto the model for inspection.  You can view quantities such as displacement, strain, stress, or von Mises stress.  The underlying numerical data can also be exported for independent analysis or visualization.'],
];

const SECTIONS = [
  {
    index: '01',
    title: 'The challenge',
    body: 'LA language model can understand a request like “fix this face and apply a 1 kN load here,” but understanding the request is not the same as solving the structure. Finite element analysis depends on geometry, material properties, boundary conditions, meshing, matrix assembly, and numerical solution. Those steps need to be explicit and reproducible. In FEAI, the assistant helps translate what you mean into those engineering operations. The geometry kernel and solver do the actual computation.',
  },
  {
    index: '03',
    title: 'The assistant',
    body: 'The assistant is an interface to the engineering system, not a replacement for it. It can interpret requests, identify selected geometry, choose supported operations, fill in parameters, and explain what FEAI did. For example, if you write: “Use steel, fix these mounting holes, and put 2 kN on this face”, the assistant might translate that into: material → structural steel; constraint → fixed, selected faces 14–17; load → 2000 N, selected face 23, −Z direction. Those actions are then executed by the same geometry and simulation systems that would run if you created them manually. Everything appears in the model normally, so you can inspect it, edit it, or remove it afterward.',
  },
  {
    index: '04',
    title: 'Grounding',
    body: 'FEAI does not let the language model invent commands and hope they work.  Each operation has a defined schema: the action name, required parameters, valid units, supported geometry references, and allowed values.  A load action, for example, needs an actual model entity, a magnitude, and a direction. A material assignment needs a valid body and material definition. Geometry operations need the parameters expected by the CAD kernel.  If a request cannot be represented by one of those operations, FEAI rejects it or asks for more information.  That creates a simple boundary:  the model decides what operation you probably want; the engineering system decides what operations are actually possible.',
  },
  {
    index: '05',
    title: 'Validation',
    body: 'A simulation is much more useful when you can inspect what went into it.  FEAI keeps the analysis inputs visible: geometry, mesh, material properties, loads, constraints, and solver settings. Meshes and numerical results can also be exported in standard formats such as VTU and CSV.  That makes it possible to inspect the mesh in another viewer, process results in Python, or compare the same problem against another FEA package.  For validation, we use problems with known or independently computed solutions and compare quantities such as:  displacement · reaction force · stress · mesh convergence  The goal is not simply to produce a contour plot. It is to make it possible to understand where the result came from.',
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
            How FEAI turns a request into an analysis.
          </h1>
          <p className="mb-16 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: 'var(--l-muted)' }}>
            FEAI uses a language model to help you build and set up analyses, but the model never computes the answer itself. Geometry is created by a solid-modeling kernel, meshes are generated explicitly, and finite element solvers calculate the response.
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
                Every analysis follows the same pipeline. The assistant turns your request into supported actions; the geometry kernel, mesher, and solver handle everything after that.
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
