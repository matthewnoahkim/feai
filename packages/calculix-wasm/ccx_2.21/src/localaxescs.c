/* localaxescs.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int localaxescs_(doublereal *cs, integer *mcs, doublereal *
	e1, doublereal *e2, doublereal *xn)
{
    /* Builtin functions */
    double sqrt(doublereal);

    /* Local variables */
    integer i__;
    doublereal dd;
    integer imax;
    doublereal xmax;


/*     determines a local axis system based on the rotation axis */
/*     defined on a CYCLIC SYMMETRY MODEL card */




/*     xn: axis direction; first cyclic symmetry definition is taken */

    /* Parameter adjustments */
    --xn;
    --e2;
    --e1;
    cs -= 18;

    /* Function Body */
    for (i__ = 1; i__ <= 3; ++i__) {
	xn[1] = cs[26] - cs[23];
	xn[2] = cs[27] - cs[24];
	xn[3] = cs[28] - cs[25];
    }
    dd = sqrt(xn[1] * xn[1] + xn[2] * xn[2] + xn[3] * xn[3]);
    for (i__ = 1; i__ <= 3; ++i__) {
	xn[i__] /= dd;
    }

/*     e1: unit vector orthogonal to xn */

    if (xn[1] == 0.) {
	e1[1] = 1.;
	e1[2] = 0.;
	e1[3] = 0.;
    } else if (xn[2] == 0.) {
	e1[1] = 0.;
	e1[2] = 1.;
	e1[3] = 0.;
    } else if (xn[3] == 0.) {
	e1[1] = 0.;
	e1[2] = 0.;
	e1[3] = 1.;
    } else {

/*        determining the maximum entry in xn in absolute value */

	xmax = 0.;
	if (abs(xn[1]) > xmax) {
	    xmax = abs(xn[1]);
	    imax = 1;
	}
	if (abs(xn[2]) > xmax) {
	    xmax = abs(xn[2]);
	    imax = 2;
	}
	if (abs(xn[3]) > xmax) {
	    xmax = abs(xn[3]);
	    imax = 3;
	}

/*        creating a vector orthogonal to xn using the maximum */
/*        component value of xn */

	e1[1] = 1.;
	e1[2] = 1.;
	e1[3] = 1.;

	e1[imax] = -(xn[1] + xn[2] + xn[3] - xn[imax]) / xn[imax];

/*        normalizing e1 */

	dd = sqrt(e1[1] * e1[1] + e1[2] * e1[2] + e1[3] * e1[3]);
	for (i__ = 1; i__ <= 3; ++i__) {
	    e1[i__] /= dd;
	}
    }

/*     e2 = n x e1 */

    e2[1] = xn[2] * e1[3] - xn[3] * e1[2];
    e2[2] = xn[3] * e1[1] - xn[1] * e1[3];
    e2[3] = xn[1] * e1[2] - xn[2] * e1[1];

/*      write(*,*) 'localaxes',e1(1),e1(2),e1(3) */
/*      write(*,*) 'localaxes',e2(1),e2(2),e2(3) */
/*      write(*,*) 'localaxes',xn(1),xn(2),xn(3) */

    return 0;
} /* localaxescs_ */

