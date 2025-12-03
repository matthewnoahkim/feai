/* norshell4.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int norshell4_(doublereal *xi, doublereal *et, doublereal *
	xl, doublereal *xnor)
{
    integer i__, j, k;
    doublereal xs[21]	/* was [3][7] */, shp[28]	/* was [7][4] */;


/*     calculates the normal on a quadratic shell element in a point */
/*     with local coordinates xi and et. The coordinates of the nodes */
/*     belonging to the element are stored in xl */





/*     shape functions and their glocal derivatives for an element */
/*     described with two local parameters and three global ones. */

/*     local derivatives of the shape functions: xi-derivative */

    /* Parameter adjustments */
    --xnor;
    xl -= 4;

    /* Function Body */
    shp[0] = -(1. - *et) / 4.;
    shp[7] = (1. - *et) / 4.;
    shp[14] = (*et + 1.) / 4.;
    shp[21] = -(*et + 1.) / 4.;

/*     local derivatives of the shape functions: eta-derivative */

    shp[1] = -(1. - *xi) / 4.;
    shp[8] = -(*xi + 1.) / 4.;
    shp[15] = (*xi + 1.) / 4.;
    shp[22] = (1. - *xi) / 4.;

/*     computation of the local derivative of the global coordinates */
/*     (xs) */

    for (i__ = 1; i__ <= 3; ++i__) {
	for (j = 1; j <= 2; ++j) {
	    xs[i__ + j * 3 - 4] = 0.;
	    for (k = 1; k <= 4; ++k) {
		xs[i__ + j * 3 - 4] += xl[i__ + k * 3] * shp[j + k * 7 - 8];
	    }
	}
    }

/*     computation of the jacobian vector */

    xnor[1] = xs[1] * xs[5] - xs[2] * xs[4];
    xnor[2] = xs[3] * xs[2] - xs[5] * xs[0];
    xnor[3] = xs[0] * xs[4] - xs[1] * xs[3];

    return 0;
} /* norshell4_ */

