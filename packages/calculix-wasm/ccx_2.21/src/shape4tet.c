/* shape4tet.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int shape4tet_(doublereal *xi, doublereal *et, doublereal *
	ze, doublereal *xl, doublereal *xsj, doublereal *shp, integer *iflag)
{
    integer i__, j, k;
    doublereal sh[3], xs[9]	/* was [3][3] */, xsi[9]	/* was [3][3] 
	    */;


/*     shape functions and derivatives for a 4-node linear */
/*     isoparametric tetrahedral element. 0<=xi,et,ze<=1,xi+et+ze<=1. */

/*     iflag=1: calculate only the value of the shape functions */
/*     iflag=2: calculate the value of the shape functions and */
/*              the Jacobian determinant */
/*     iflag=3: calculate the value of the shape functions, the */
/*              value of their derivatives w.r.t. the global */
/*              coordinates and the Jacobian determinant */







/*     shape functions and their glocal derivatives */

/*     shape functions */

    /* Parameter adjustments */
    shp -= 5;
    xl -= 4;

    /* Function Body */
    shp[8] = 1. - *xi - *et - *ze;
    shp[12] = *xi;
    shp[16] = *et;
    shp[20] = *ze;

    if (*iflag == 1) {
	return 0;
    }

/*     local derivatives of the shape functions: xi-derivative */

    shp[5] = -1.;
    shp[9] = 1.;
    shp[13] = 0.;
    shp[17] = 0.;

/*     local derivatives of the shape functions: eta-derivative */

    shp[6] = -1.;
    shp[10] = 0.;
    shp[14] = 1.;
    shp[18] = 0.;

/*     local derivatives of the shape functions: zeta-derivative */

    shp[7] = -1.;
    shp[11] = 0.;
    shp[15] = 0.;
    shp[19] = 1.;

/*     computation of the local derivative of the global coordinates */
/*     (xs) */

    for (i__ = 1; i__ <= 3; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    xs[i__ + j * 3 - 4] = 0.;
	    for (k = 1; k <= 4; ++k) {
		xs[i__ + j * 3 - 4] += xl[i__ + k * 3] * shp[j + (k << 2)];
	    }
	}
    }

/*     computation of the jacobian determinant */

    *xsj = xs[0] * (xs[4] * xs[8] - xs[7] * xs[5]) - xs[3] * (xs[1] * xs[8] - 
	    xs[7] * xs[2]) + xs[6] * (xs[1] * xs[5] - xs[4] * xs[2]);

    if (*iflag == 2) {
	return 0;
    }

/*     computation of the global derivative of the local coordinates */
/*     (xsi) (inversion of xs) */

    xsi[0] = (xs[4] * xs[8] - xs[5] * xs[7]) / *xsj;
    xsi[3] = (xs[6] * xs[5] - xs[3] * xs[8]) / *xsj;
    xsi[6] = (xs[3] * xs[7] - xs[4] * xs[6]) / *xsj;
    xsi[1] = (xs[7] * xs[2] - xs[1] * xs[8]) / *xsj;
    xsi[4] = (xs[0] * xs[8] - xs[2] * xs[6]) / *xsj;
    xsi[7] = (xs[6] * xs[1] - xs[0] * xs[7]) / *xsj;
    xsi[2] = (xs[1] * xs[5] - xs[2] * xs[4]) / *xsj;
    xsi[5] = (xs[3] * xs[2] - xs[0] * xs[5]) / *xsj;
    xsi[8] = (xs[0] * xs[4] - xs[1] * xs[3]) / *xsj;

/*     computation of the global derivatives of the shape functions */

    for (k = 1; k <= 4; ++k) {
	for (j = 1; j <= 3; ++j) {
	    sh[j - 1] = shp[(k << 2) + 1] * xsi[j * 3 - 3] + shp[(k << 2) + 2]
		     * xsi[j * 3 - 2] + shp[(k << 2) + 3] * xsi[j * 3 - 1];
	}
	for (j = 1; j <= 3; ++j) {
	    shp[j + (k << 2)] = sh[j - 1];
	}
    }

    return 0;
} /* shape4tet_ */

