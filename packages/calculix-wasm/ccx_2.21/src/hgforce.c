/* hgforce.f -- translated by f2c (version 20200916).
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
/*              Copyright (C) 1998-2023 Guido Dhondt */

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

/* Subroutine */ int hgforce_(doublereal *fn, doublereal *elas, doublereal *a,
	 doublereal *gs, doublereal *vl, integer *mi, integer *konl)
{
    /* System generated locals */
    integer vl_dim1, vl_offset, fn_dim1, fn_offset;

    /* Local variables */
    integer i__, j, k;
    doublereal ahr, hglf[12]	/* was [3][4] */;


/*     hourglass control forces for 8-node solid mean strain element */

/*     Reference: Flanagan, D.P., Belytschko, T.; "Uniform  strain hexahedron */
/*     and quadrilateral with orthogonal Hourglass control". Int. J. Num. */
/*     Meth. Eng., Vol. 17, 679-706, 1981. */

/*     author: Otto-Ernst Bernhardi */




    /* Parameter adjustments */
    --elas;
    gs -= 9;
    --mi;
    vl_dim1 = mi[2] - 0 + 1;
    vl_offset = 0 + vl_dim1;
    vl -= vl_offset;
    fn_dim1 = mi[2] - 0 + 1;
    fn_offset = 0 + fn_dim1;
    fn -= fn_offset;
    --konl;

    /* Function Body */
    ahr = elas[1] * *a;

    for (i__ = 1; i__ <= 3; ++i__) {
	for (k = 1; k <= 4; ++k) {
	    hglf[i__ + k * 3 - 4] = 0.;
	    for (j = 1; j <= 8; ++j) {
		hglf[i__ + k * 3 - 4] += gs[j + (k << 3)] * vl[i__ + j * 
			vl_dim1];
	    }
	    hglf[i__ + k * 3 - 4] *= ahr;
	}
    }
    for (i__ = 1; i__ <= 3; ++i__) {
	for (j = 1; j <= 8; ++j) {
	    for (k = 1; k <= 4; ++k) {
		fn[i__ + konl[j] * fn_dim1] += hglf[i__ + k * 3 - 4] * gs[j + 
			(k << 3)];
	    }
	}
    }

    return 0;
} /* hgforce_ */

