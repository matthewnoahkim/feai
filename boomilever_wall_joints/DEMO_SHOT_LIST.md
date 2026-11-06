# FEAI demo: click-by-click recording guide (2:00)

This guide goes with the voiceover in [DEMO_SCRIPT.md](DEMO_SCRIPT.md). Record each shot as its own clip and cut them together, then lay the voiceover over the top. Don't try to do it in one take.

**How the app opens pages:** opening a project from the dashboard opens its **Project Schematic** in a **new tab**. Double-clicking a step block in the schematic opens that step in **another new tab**. Plan for the tabs piling up; that's normal.

---

## Part A: setup (about 15 min, the day before)

### A1. Make sure the boomilever projects are current

Do this for **each** of boomilever 1X, 2X, 3X and 4X:
1. Open the project's **Setup** page (dashboard → double-click the project → in the schematic, double-click the **Setup** block).
2. On the **Boundary Conditions** tab, the support must read **"Back face under block_NX bolted to wall."**
3. Open **Results** → **Results Visualization**. The two prongs must have an **open gap** between them, not a solid bar.

If either check fails, the project still has an old simulation stored. Deploy the latest code and reopen it, or ask me to re-seed. **Don't record until all four pass.**

### A2. Browser
1. Use Chrome in a **fresh profile** or a guest window: no extensions, no bookmarks bar.
2. Set the window to exactly **1920×1080** (or record a 1920×1080 region). Page zoom **100%** (Ctrl+0).
3. Turn on Windows **Do Not Disturb**. Close Slack, Discord and email.
4. Sign in as **mattnoahkim@gmail.com**.

### A3. Scratch project for the CAD shot (so the demo projects stay untouched)
1. Dashboard → **New** → **New project**.
2. Name it **"Bracket sketch"** → create it. It opens in a new tab.
3. Get to the **Geometry** step (in the schematic, double-click **Geometry**) and close that tab for now.

### A4. Do a dry run once
- Run every shot below one time without recording. In particular, rehearse **Run Analysis Again** on 2X; it takes about 6–9 s.
- After the rehearsal, refresh each page so panels start in their default state.

### Never click these during the demo
| Page | Don't click | Why |
|---|---|---|
| Mesh | **Generate Mesh**, the 🗑 **Clear mesh** icon | Replaces the joint + block mesh and wipes the results |
| Setup | the 👁 **eye** icon on a support or load | Turns it off |
| Setup | the 🗑 **trash** icon | Deletes the support or load |
| Engineering Data | **Edit**, **Delete** | Changes the basswood material |
| Dashboard | **Delete**, **Edit** in Details | Changes or deletes the project |

---

## Part B: shots (record in this order)

Move the mouse **slowly**. Pause about 1 s after every click so the edit has room. When orbiting, drag with the **left mouse button**; zoom with the **scroll wheel**.

### Shot 1 · 0:00–0:08 · Hook (about 8 s)
1. **B-roll:** the photo of the 2X joint on the rig. Hold it 3–4 s (slow zoom-in in the editor).
2. **Screen:** open the FEAI home page `/`. Hold 1 s on the hero, then scroll down slowly about one screen. Stop.

### Shot 2 · 0:08–0:18 · Dashboard (about 10 s)
1. Start on **/dashboard** with the full project list visible: 11 projects, dates from Nov 2025 to Nov 2026.
2. Click **Sort** → **Date modified (newest first)**. Let the list reorder.
3. Click the **Search projects...** box and type `boomilever` slowly. The list filters to 1X–4X.
4. Click the **Details** button (top right) if the details pane isn't showing.
5. **Single-click** the **boomilever 2X** row. The details pane shows the name, description and the **Created** and **Date modified** dates. Hold 1.5 s.
6. Click **Open** in the details pane. A new tab opens on the schematic.

### Shot 3 · 0:18–0:30 · Project schematic (about 12 s)
1. Wait until the five blocks have loaded: **Engineering Data → Geometry → Mesh → Setup → Results**, each with a green check.
2. Hover slowly over the connection line from Mesh to Setup to Results. This is the "it all builds on itself" moment.
3. Move to the **Toolbox** on the left and hover it for 1 s. Don't drag anything out.
4. **Double-click the Engineering Data block.** It opens in a new tab.

### Shot 4 · 0:30–0:45 · Engineering Data (about 15 s)
1. The **Material Library** is showing. Click **Basswood (along grain)** in the list.
2. The **Material Properties** panel fills in. Hover slowly over, in order:
   - **Young's Modulus** (10.07 GPa)
   - **Density** (415 kg/m³)
   - **Yield Strength** (32.6 MPa)
3. Hover the **Duplicate as custom** icon so its tooltip shows. **Don't click it.** Hover **Set as default** the same way.
4. Switch back to the **schematic tab** → **double-click Geometry**.

### Shot 5a · 0:45–0:53 · Geometry, boomilever 2X (about 8 s)
1. The CAD editor loads with the **joint and block**. The **Feature Tree** on the left shows **Imported: wall_joint_2X.stl** and **Imported: block_2X.stl**.
2. Hover the two import entries in the **Feature Tree** one at a time.
3. Orbit the model a little (left-drag) so the **open slot** and the **block** sitting in the wall end are clear. Scroll-zoom in on the prong ends.
4. *Optional (rehearse first):* **right-click** a prong → **Measure** → click the prong's two side faces. The **Measurements** panel shows about **1.59 mm**. If it misbehaves in rehearsal, skip it; the voiceover still works.
5. The **AI Assistant** panel opens on the right by default. Leave it there; it's used in 5b.

### Shot 5b · 0:53–1:05 · CAD tools, scratch project "Bracket sketch" (about 12 s)
1. Switch to the scratch project's **Geometry** tab (open it from its schematic if you closed it).
2. Click **Sketch** in the toolbar → choose **Top Plane** in the dialog.
3. Click **Rect** (or press **R**) → drag a rectangle about 40 × 20 in the middle of the grid.
4. Click **Finish** (or press **Enter**).
5. Click **Extrude** → set the depth to about **10 mm** → confirm. A solid box appears.
6. Click **Fillet** → click one top edge → set the radius to about **3 mm** → confirm.
7. Click in the **AI Assistant** box (*"Describe what you want to create..."*) → type **`add a 6 mm hole through the center`** → press **Enter**. Hold while it runs.
   - **If the assistant doesn't respond in rehearsal:** skip step 7 and do a second **Fillet** on another edge.
8. Hover **Export STEP** in the toolbar so the tooltip *"Export the selected body as a real B-rep STEP file"* shows. Clicking it is optional; it only downloads a file.

### Shot 6 · 1:05–1:15 · Mesh, boomilever 2X (about 10 s)
1. Back on the **2X schematic tab** → **double-click Mesh**.
2. The **Mesh Preview** shows the tet mesh. Orbit slowly, then zoom toward the **slot root**, where the prongs meet the solid end.
3. Move the mouse over the **Mesh Generated** box, showing **Nodes 6,885**, **Elements 25,152** and **Element Type C3D4**. Then over **Quality Metrics** → **Avg Aspect Ratio**.
4. Remember: **don't touch Generate Mesh or the 🗑 icon.**

### Shot 7 · 1:15–1:30 · Analysis Setup, boomilever 2X (about 15 s)
1. Schematic tab → **double-click Setup**.
2. On the **Boundary Conditions (1)** tab, hover the support **"Back face under block_2X bolted to wall."**
3. Click the **› chevron** on that row to expand it and show the box region min/max. Click **›** again to collapse it. (Not the 👁 eye, not the 🗑 trash.)
4. Click the **Loads (2)** tab. Hover **"Prong ends pushed 5 N down (-Z, orthogonal to the joint)"** → click its **›** to expand it and show the force → collapse it.
5. Hover **"Self-weight (-Z)."**
6. In **Setup Preview**, orbit so the fixed patch under the block and the load at the prong ends are both visible.

### Shot 8 · 1:30–1:52 · Results, boomilever 2X (about 22 s, the main shot)
1. Schematic tab → **double-click Results**.
2. Click **Run Analysis Again** (left panel, under the summary). Keep the progress on screen; it finishes in about 6–9 s (speed it up in the edit) with **Analysis Complete**.
3. **Summary** tab: hover, in order:
   - **Max Displacement**, about **23.9 mm**
   - **Max Von Mises Stress**, about **131 MPa**
   - **Safety Factor**: **Min about 0.25** (below 1: the prong roots would yield)
   - **Reaction Forces**: **Fz about 5.0 N**
4. **Results Visualization** (right), with **Stress** selected:
   - Orbit to the **slot root / prong roots** (the hot spot) and zoom in a little.
   - Under **Parts**, **uncheck block_2X**. Hold 1 s to show inside the slot, then **re-check** it.
5. Click **Displacement** (the toggle at top left of the viewer). In the dropdown, choose **Deformed (true scale)**. The prongs bend visibly at true scale. Orbit to a side view so the bend reads.
6. Left panel: click the **Stress** tab and hover the **Principal Stresses** values for 1 s.
7. Click the **Export** tab and hover **Export CSV** (*"Spreadsheet-compatible format"*). If **Download VTK** (*"For ParaView visualization"*) is there, hover it too. Clicking is optional.

### Shot 9 · 1:52–2:00 · Compare 1X → 4X and close (about 8 s)
**Prep before this shot:** have the **Results** pages for **1X** and **4X** already open in their own tabs, each on the **Summary** tab.
1. Ctrl+Tab to **1X Results**. Hold 1.5 s on **Max Displacement**, about **27.1 mm**.
2. Ctrl+Tab to **4X Results**. Hold 1.5 s on **Max Displacement**, about **18.3 mm**.
3. *(Editing alternative: put the 1X and 4X results side by side in a split screen.)*
4. End card: the FEAI logo on white, 2 s.

---

## Part C: editing notes
- Speed up any loading waits (tab opens, editor load) to 2–4×, or cut them.
- Add a zoom-in on the cursor for: the search box, **Run Analysis Again**, the **block_2X** checkbox, and the **Deformed** dropdown.
- Captions to put on screen:
  - Shot 2: *"4 joint variants · 1X–4X"*
  - Shot 7: *"Bolted at the block · 5 N pushing the prong ends down"*
  - Shot 8: *"Solved in the browser · seconds"*
  - Shot 9: *"1X 27.1 mm → 4X 18.3 mm tip deflection"*
- If the video runs long, cut Shot 3's Toolbox hover and Shot 4's tooltip hovers first.
