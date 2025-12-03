/* shape2l.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int shape2l_(doublereal *xi, doublereal *xl, doublereal *xsj,
	 doublereal *xs, doublereal *shp, integer *iflag)
{
    integer i__, k;


/*     shape functions and derivatives for a 2-node linear */
/*     isoparametric 1-D element. -1<=xi<=1 */

/*     iflag=2: calculate the value of the shape functions, */
/*              their derivatives w.r.t. the local coordinates */
/*              and the Jacobian (size of tangent vector to the */
/*              curved line) */






/*     shape functions and their glocal derivatives for an element */
/*     described with one local parameter and three global ones. */

/*     local derivatives of the shape functions: xi-derivative */

    /* Parameter adjustments */
    shp -= 8;
    xs -= 4;
    --xsj;
    xl -= 4;

    /* Function Body */
    shp[8] = -.5;
    shp[15] = .5;

/*     shape functions */

    shp[11] = (1. - *xi) / 2.;
    shp[18] = (*xi + 1.) / 2.;

/*     computation of the local derivative of the global coordinates */
/*     (xs) */

    for (i__ = 1; i__ <= 3; ++i__) {
	xs[i__ + 3] = 0.;
	for (k = 1; k <= 2; ++k) {
	    xs[i__ + 3] += xl[i__ + k * 3] * shp[k * 7 + 1];
	}
    }

/*     computation of the jacobian vector */

/*      xsj(1)=dsqrt(xs(1,1)**2+xs(2,1)**2+xs(3,1)**2) */

    xsj[1] = xs[4];
    xsj[2] = xs[5];
    xsj[3] = xs[6];

    return 0;
} /* shape2l_ */

