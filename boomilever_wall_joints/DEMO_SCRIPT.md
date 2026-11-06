# FEAI demo: Boomilever wall joints 1X–4X (2:00)

One take per scene, cut together. **VO** = voiceover (about 280 words total, read at a relaxed pace). **Caption** = optional on-screen text.

## Before you record

- [ ] Signed in as the account that holds **boomilever 1X–4X**. Open each project once beforehand. The first open re-solves an outdated seed and takes a few seconds, and you don't want that on camera.
- [ ] Browser at 1920×1080, zoom 100%, bookmarks bar hidden, notifications off.
- [ ] Open **one fresh "New Project"** you can throw away, for the CAD and AI shots in scene 3. Don't model in the boomilever projects.
- [ ] **Don't click "Clear mesh" or "Generate Mesh"** in a boomilever project. That replaces the conforming joint and block mesh and wipes the results.
- [ ] Rehearse **Run Analysis Again** on 2X once. It's a live solve of about 6–9 s.
- [ ] Have the photo of the 2X joint on the test rig ready as a B-roll still for scene 1.

Reference numbers (block bolted; prong ends pushed 5 N down, orthogonal to the joint):

| Variant | Nodes / tets | Max displacement | Max von Mises | Min safety factor |
|---|---|---|---|---|
| 1X | 6,750 / 24,192 | 27.1 mm | 154 MPa | 0.21 |
| 2X | 6,885 / 25,152 | 23.9 mm | 131 MPa | 0.25 |
| 3X | 7,020 / 26,112 | 21.0 mm | 142 MPa | 0.23 |
| 4X | 7,155 / 27,072 | 18.3 mm | 120 MPa | 0.27 |

A safety factor below 1 means the model predicts the prong roots yield under this load. Peak stress sits at a sharp inside corner, so it varies a bit with the mesh.

---

## 0:00–0:08 · Hook

**Screen:** Photo of the 2X joint on the rig, with the strips loading the prongs downward. Hard cut to the FEAI landing page and scroll the hero once.
**VO:** "This is a Science Olympiad boomilever wall joint. Before we build and break four versions of it, let's test them in FEAI, right in the browser."
**Caption:** *FEAI: CAD to FEA in the browser*

## 0:08–0:18 · Dashboard

**Screen:** Dashboard. Type `boomilever` in **Search projects…** to filter to 1X–4X. Switch the sort to **Date modified**. Click a row to show the details panel (created Nov 2025), then open **boomilever 2X**.
**VO:** "Here are four variants. The only difference is how deep the block-and-slot section at the bolt is: one, two, three, or four sixteenths of an inch."

## 0:18–0:30 · Project schematic

**Screen:** **Project Schematic**: Engineering Data → Geometry → Mesh → Setup → Results, all complete. Hover the **Toolbox** briefly.
**VO:** "Every project is a workflow, from material to results. Each step is a node you can open, and they all build on one another."

## 0:30–0:45 · Engineering data

**Screen:** **Engineering Data**: the **Material Library**. Click **Basswood (along grain)** to show Young's modulus 10.07 GPa, density 415 kg/m³ and yield 32.6 MPa. Hover **Set as default** and **Duplicate as custom**.
**VO:** "Materials come from a shared library. This is basswood, along the grain, using USDA Wood Handbook values. You can duplicate any material and tune it."

## 0:45–1:05 · Geometry and CAD

**Screen (boomilever 2X, about 8 s):** The **Geometry** step. Orbit the joint and block. Show the **Feature Tree** with the two imported STLs. Measure the prong width (1.59 mm) with the measure tool.
**Screen (scratch project, about 12 s):** **Sketch** → **Rect** → **Finish** → **Extrude** → **Fillet** an edge. Then open **AI Assistant** and type *"add a 5 mm hole through the center"*. If the assistant isn't configured, skip it and do one more **Fillet**. Flash **Export STEP**.
**VO:** "Import STL, STEP or IGES, or model it here: sketch, extrude, fillet, patterns, lofts. There's an AI assistant you can just ask. And you can export a real STEP file."

## 1:05–1:15 · Mesh

**Screen:** Back in **boomilever 2X**, the **Mesh** step. Orbit the **Mesh Preview**. Hold on **Quality Metrics**: nodes, elements, average aspect ratio.
**VO:** "Next comes a conforming tetrahedral mesh. The joint and block share nodes along the glue line, so they act as one bonded part."

## 1:15–1:30 · Setup

**Screen:** **Analysis Setup**. On the **Boundary Conditions** tab, click the bolt support and show its box region under the block. Switch to **Loads (2)**: the 5 N downward push on the prong ends, and self-weight. Orbit the **Setup Preview** so the support and arrows show.
**VO:** "We set it up the way it's tested. The block's bolted down, and the prong ends get pushed five newtons straight down, plus self-weight."

## 1:30–1:52 · Results (the payoff)

**Screen:**
1. **Results**: click **Run Analysis Again**. The live solve takes about 6–9 s (speed it up in the edit); leave the progress bar on screen.
2. **Summary**: max displacement (about 24 mm), max von Mises and the safety factor (below 1).
3. In **Results Visualization**: **Stress**. Orbit to the prong roots, the red spot. Untick **block_2X** under **Parts** to look inside the slot, then tick it back.
4. **Displacement** with **Deformed (x…)** from the dropdown.
5. A quick cut to the **Stress** tab (principal stresses), then **Export** (**Export CSV** / **Download VTK**).

**VO:** "Solve. It runs right here, in a few seconds. Peak stress is at the prong roots, where the joint narrows. Hide the block to look inside, or exaggerate the deformation. Then export to CSV, or to ParaView."

## 1:52–2:00 · Compare and close

**Screen:** A fast four-way split, or quick cuts of the **1X → 4X** results summaries. Then the FEAI logo.
**VO:** "Across all four, the deepest joint deflects about a third less than the shallowest, and the stress plot shows exactly where each one gives first: the prong roots. That's FEAI."
**Caption:** *1X: 27.1 mm → 4X: 18.3 mm tip deflection*

---

## Full voiceover, word for word (about 320 words, about 2:00 at a lively pace)

**[0:00 · photo, then landing page]**
Okay, so this is a boomilever wall joint. It's the piece that bolts to the wall and holds up the whole build, and these two prongs? They get loaded straight down. So before we go build and break four of these for real, let's test 'em in FEAI, right in the browser.

**[0:08 · dashboard]**
Here's my dashboard. I'll search "boomilever," and there they are: 1X, 2X, 3X, and 4X. Same joint every time. The only thing that changes is how deep that solid section at the bolt is. Let's open 2X.

**[0:18 · schematic]**
Every project's laid out as a workflow: material, geometry, mesh, setup, results. Click any step and you're in.

**[0:30 · engineering data]**
First, materials. This is basswood, along the grain, straight from the USDA Wood Handbook. Want your own? Just duplicate it and tweak.

**[0:45 · geometry and CAD]**
Here's the geometry: the joint and its block, imported right from STL. Let me measure a prong… one point six millimeters. Tiny! And you're not stuck importing. Sketch, extrude, fillet, or just ask the AI assistant to do it for you. Then export a real STEP file.

**[1:05 · mesh]**
Next up, the mesh. Thousands of tetrahedra, and the joint and block share nodes right along the glue line, so they act like one bonded part.

**[1:15 · setup]**
Now setup, and we're doing it exactly how it's tested. The block's bolted down, the prong ends get pushed five newtons straight down, plus self-weight.

**[1:30 · results]**
Alright, let's run it… and done! Just a few seconds, right in the browser. Peak stress is right at the prong roots, where the joint narrows. I can hide the block to see inside the slot, flip to the deformed shape so you can actually see the prongs bend, and export everything to CSV, or VTK for ParaView.

**[1:52 · compare and close]**
So, the verdict? Going from 1X to 4X cuts tip deflection by about a third, and the stress plot shows exactly where each one gives first: right at the prong roots. That's FEAI.

---

### If you're short on time

Cut scene 3 (schematic) first, then scene 4 (materials). The setup → results run (1:15–1:52) is the core of the video; keep it whole.
