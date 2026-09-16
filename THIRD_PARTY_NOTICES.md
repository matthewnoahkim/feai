# Third-Party Notices

This file lists open-source software embedded in or used by this product, as required
by their licenses. It is a legal record, not marketing copy — components listed here are
not necessarily named as such in the product UI.

## FreeCAD

`packages/cad-server` (the modeling engine behind FEAI's CAD features) is built on
[FreeCAD](https://github.com/FreeCAD/FreeCAD), copyright the FreeCAD project and its
contributors.

- **License:** GNU Lesser General Public License v2.1 or later (LGPL-2.1-or-later), with
  some modules licensed under the GNU General Public License v2.0 or later
  (GPL-2.0-or-later). Full text: <https://github.com/FreeCAD/FreeCAD/blob/main/LICENSE>.
- **Version used:** 1.1.3 (vendored for reference at `third_party/freecad`; the running
  service installs the equivalent prebuilt conda-forge package — see
  `packages/cad-server/README.md`).
- **Modifications:** none to FreeCAD's own source. `packages/cad-server` calls FreeCAD's
  Python API (`Part`, `Mesh` modules) from a separate FastAPI application; it does not
  patch or relink FreeCAD itself.

Per the LGPL, this notice and FreeCAD's own license text (preserved at
`third_party/freecad/LICENSE`) must remain available with any distribution of this
software.
