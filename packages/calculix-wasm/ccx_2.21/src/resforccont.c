/* resforccont.f -- translated by f2c (version 20200916).
   You must link the resulting object file with libf2c:
	on Microsoft Windows system, link with libf2c.lib;
	on Linux or Unix systems, link with .../path/to/libf2c.a -lm
	or, if you install libf2c.a in a standard place, with -lf2c -lm
	-- in that order, at the end of the command line, as in
		cc *.o -lf2c -lm
	Source for libf2c is in /netlib/f2c/libf2c.zip, e.g.,

		http://www.netlib.org/f2c/libf2c.zip
*/

#include "f2c.h"


/*     CalculiX - A 3-dimensional finite element program */
/*     Copyright (C) 1998-2023 Guido Dhondt */

/*     This program is free software; you can redistribute it and/or */
/*     modify it under the terms of the GNU General Public License as */
/*     published by the Free Software Foundation(version 2); */


/*     This program is distributed in the hope that it will be useful, */
/*     but WITHOUT ANY WARRANTY; without even the implied warranty of */
/*     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the */
/*     GNU General Public License for more details. */

/*     You should have received a copy of the GNU General Public License */
/*     along with this program; if not, write to the Free Software */
/*     Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA. */

/* Subroutine */ int resforccont_(doublereal *vold, integer *nk, integer *mi, 
	doublereal *aubi, integer *irowbi, integer *jqbi, integer *neqtot, 
	integer *ktot, doublereal *fext, doublereal *gapdisp, doublereal *
	auib, integer *irowib, integer *jqib, integer *nactdof, doublereal *
	volddof, integer *neq, doublereal *qik_kbi__)
{
    /* System generated locals */
    integer nactdof_dim1, nactdof_offset, vold_dim1, vold_offset, i__1;

    /* Local variables */
    integer i__, j, itranspose;
    extern /* Subroutine */ int mulmatvec_asym__(doublereal *, integer *, 
	    integer *, integer *, doublereal *, doublereal *, integer *);





/*     create field volddof, from vold (displacements) */
/*     from sorting nodes to DOF */

    /* Parameter adjustments */
    --mi;
    nactdof_dim1 = mi[2] - 0 + 1;
    nactdof_offset = 0 + nactdof_dim1;
    nactdof -= nactdof_offset;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;
    --aubi;
    --irowbi;
    --jqbi;
    --ktot;
    --fext;
    --gapdisp;
    --auib;
    --irowib;
    --jqib;
    --volddof;
    --neq;
    --qik_kbi__;

    /* Function Body */
    i__1 = *nk;
    for (i__ = 1; i__ <= i__1; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    if (nactdof[j + i__ * nactdof_dim1] > 0) {
		volddof[nactdof[j + i__ * nactdof_dim1]] = vold[j + i__ * 
			vold_dim1];
	    }
	}
    }

/*     We compute g as volddof=(Kbi*volddof)+(Kib*volddof) in qik_kbi */
/*     to account for the missing terms due to the low triangle structure */
/*     of the matrices */

/*     calculate Kbi*volddof */

    itranspose = 0;
    mulmatvec_asym__(&aubi[1], &jqbi[1], &irowbi[1], &neq[1], &volddof[1], &
	    qik_kbi__[1], &itranspose);

/*     calculate Kib^T*volddof and add to g. */
/*     transposed multiplication */

    itranspose = 1;
    mulmatvec_asym__(&auib[1], &jqib[1], &irowib[1], neqtot, &volddof[1], &
	    qik_kbi__[1], &itranspose);

/*     add external force of BOUNDARY DOF */

    i__1 = *neqtot;
    for (i__ = 1; i__ <= i__1; ++i__) {
	gapdisp[i__] = fext[ktot[i__]] - qik_kbi__[i__];
    }

    return 0;
} /* resforccont_ */

