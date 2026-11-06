# FEAI demo: Boomilever wall joints 1X–4X (2:00)

One take per scene, cut together. **VO** = voiceover (about 280 words total, read at a relaxed pace). **Caption** = optional on-screen text.

## Before you record

- [ ] Signed in as the account that holds **boomilever 1X–4X**. Open each project once beforehand. The first open re-solves an outdated seed and takes a few seconds, and you don't want that on camera.
- [ ] Browser at 1920×1080, zoom 100%, bookmarks bar hidden, notifications off.
- [ ] Open **one fresh "New Project"** you can throw away, for the CAD and AI shots in scene 3. Don't model in the boomilever projects.
- [ ] **Don't click "Clear mesh" or "Generate Mesh"** in a boomilever project. That replaces the conforming joint and block mesh and wipes the results.
- [ ] Rehearse **Run Analysis Again** on 2X once. It's a live solve of about 3 s.
- [ ] Have the photo of the 2X joint on the test rig ready as a B-roll still for scene 1.

Reference numbers (5 N pull down the prongs; block bolted to the wall):

| Variant | Nodes / tets | Max displacement | Max von Mises | Min safety factor |
|---|---|---|---|---|
| 1X | 4,554 / 12,576 | 10.1 µm | 0.82 MPa | 39.8 |
| 2X | 4,689 / 13,536 | 8.9 µm | 0.75 MPa | 43.4 |
| 3X | 4,824 / 14,496 | 8.5 µm | 0.75 MPa | 43.5 |
| 4X | 4,959 / 15,456 | 8.1 µm | 0.75 MPa | 43.6 |

---

## 0:00–0:08 · Hook

**Screen:** Photo of the 2X joint bolted to the wall with the strips pulled down. Hard cut to the FEAI landing page and scroll the hero once.
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

**Screen:** **Analysis Setup**. On the **Boundary Conditions** tab, click the bolt support and show its box region under the block. Switch to **Loads (2)**: the 5 N prong pull and self-weight. Orbit the **Setup Preview** so the support and arrows show.
**VO:** "We set it up the way it's tested. The block's back face is bolted to the wall, and the prongs are pulled five newtons straight down, plus self-weight."

## 1:30–1:52 · Results (the payoff)

**Screen:**
1. **Results**: click **Run Analysis Again**. The live solve takes about 3 s; leave the progress bar on screen.
2. **Summary**: max displacement, max von Mises and safety factor around 43.
3. In **Results Visualization**: **Stress**. Orbit to the prong roots, the red spot. Untick **block_2X** under **Parts** to look inside the slot, then tick it back.
4. **Displacement** with **Deformed (x…)** from the dropdown.
5. A quick cut to the **Stress** tab (principal stresses), then **Export** (**Export CSV** / **Download VTK**).

**VO:** "Solve. It runs right here, in a few seconds. Peak stress is at the prong roots, where the joint narrows. Hide the block to look inside, or exaggerate the deformation. Then export to CSV, or to ParaView."

## 1:52–2:00 · Compare and close

**Screen:** A fast four-way split, or quick cuts of the **1X → 4X** results summaries. Then the FEAI logo.
**VO:** "Across all four, the deepest joint deflects about twenty percent less than the shallowest, and every one has about forty times margin before yield. That's FEAI."
**Caption:** *1X: 10.1 µm → 4X: 8.1 µm · min safety factor ≈ 40*

---

## Full voiceover, word for word (about 320 words, about 2:00 at a lively pace)

**[0:00 · photo, then landing page]**
Okay, so this is a boomilever wall joint. It's the piece that bolts to the wall and holds up the whole build, and these two strips? They get pulled straight down. So before we go build and break four of these for real, let's test 'em in FEAI, right in the browser.

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
Now setup, and we're doing it exactly how it's tested. The block's bolted flat to the wall, the prongs get pulled five newtons straight down, plus self-weight.

**[1:30 · results]**
Alright, let's run it… and done! About three seconds, right in the browser. Peak stress is right at the prong roots, where the joint narrows. I can hide the block to see inside the slot, crank up the deformation so you can actually see it stretch, and export everything to CSV, or VTK for ParaView.

**[1:52 · compare and close]**
So, the verdict? Going from 1X to 4X cuts deflection by about twenty percent, and every one has around forty times margin before yield. That's FEAI.

---

### If you're short on time

Cut scene 3 (schematic) first, then scene 4 (materials). The setup → results run (1:15–1:52) is the core of the video; keep it whole.
