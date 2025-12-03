/* shape8humass.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int shape8humass_(doublereal *xi, doublereal *et, doublereal 
	*ze, doublereal *xl, doublereal *xsj, doublereal *shp, integer *iflag)
{
    integer i__, j, k;
    doublereal sh[3], xs[9]	/* was [3][3] */, omg, omh, opg, oph, omr, 
	    opr, xsi[9]	/* was [3][3] */, xsi0[9]	/* was [3][3] */;


/*     shape functions and derivatives for a 8-node linear isoparametric */
/*     solid element */

/*     iflag=1: calculate only the value of the shape functions */
/*     iflag=2: calculate the value of the shape functions and */
/*              the Jacobian determinant */
/*     iflag=3: calculate the value of the shape functions, the */
/*              value of their derivatives w.r.t. the global */
/*              coordinates and the Jacobian determinant */

/*     author: Otto-Ernst Bernhardi */







    /* Parameter adjustments */
    shp -= 5;
    xl -= 4;

    /* Function Body */
    if (*iflag > 2) {

/*        local derivatives at center point: xi-derivative */

	shp[5] = -.125;
	shp[9] = .125;
	shp[13] = .125;
	shp[17] = -.125;
	shp[21] = -.125;
	shp[25] = .125;
	shp[29] = .125;
	shp[33] = -.125;

/*        local derivatives at center point: eta-derivative */

	shp[6] = -.125;
	shp[10] = -.125;
	shp[14] = .125;
	shp[18] = .125;
	shp[22] = -.125;
	shp[26] = -.125;
	shp[30] = .125;
	shp[34] = .125;

/*        local derivatives at center point: zeta-derivative */

	shp[7] = -.125;
	shp[11] = -.125;
	shp[15] = -.125;
	shp[19] = -.125;
	shp[23] = .125;
	shp[27] = .125;
	shp[31] = .125;
	shp[35] = .125;

/*        computation of the local derivative of the global coordinates */
/*        (xs) at center point of element. */

	for (i__ = 1; i__ <= 3; ++i__) {
	    for (j = 1; j <= 3; ++j) {
		xs[i__ + j * 3 - 4] = 0.;
		for (k = 1; k <= 8; ++k) {
		    xs[i__ + j * 3 - 4] += xl[i__ + k * 3] * shp[j + (k << 2)]
			    ;
		}
	    }
	}

/*        computation of the jacobian determinant at center point */

	*xsj = xs[0] * (xs[4] * xs[8] - xs[7] * xs[5]) - xs[3] * (xs[1] * xs[
		8] - xs[7] * xs[2]) + xs[6] * (xs[1] * xs[5] - xs[4] * xs[2]);

/*        computation of the global derivative of the local coordinates */
/*        at center point of element. */

	xsi0[0] = (xs[4] * xs[8] - xs[5] * xs[7]) / *xsj;
	xsi0[3] = (xs[6] * xs[5] - xs[3] * xs[8]) / *xsj;
	xsi0[6] = (xs[3] * xs[7] - xs[4] * xs[6]) / *xsj;
	xsi0[1] = (xs[7] * xs[2] - xs[1] * xs[8]) / *xsj;
	xsi0[4] = (xs[0] * xs[8] - xs[2] * xs[6]) / *xsj;
	xsi0[7] = (xs[6] * xs[1] - xs[0] * xs[7]) / *xsj;
	xsi0[2] = (xs[1] * xs[5] - xs[2] * xs[4]) / *xsj;
	xsi0[5] = (xs[3] * xs[2] - xs[0] * xs[5]) / *xsj;
	xsi0[8] = (xs[0] * xs[4] - xs[1] * xs[3]) / *xsj;

    }

/*     shape functions and their global derivatives */

    omg = 1. - *xi;
    omh = 1. - *et;
    omr = 1. - *ze;
    opg = *xi + 1.;
    oph = *et + 1.;
    opr = *ze + 1.;

/*     shape functions */

    shp[8] = omg * omh * omr / 8.;
    shp[12] = opg * omh * omr / 8.;
    shp[16] = opg * oph * omr / 8.;
    shp[20] = omg * oph * omr / 8.;
    shp[24] = omg * omh * opr / 8.;
    shp[28] = opg * omh * opr / 8.;
    shp[32] = opg * oph * opr / 8.;
    shp[36] = omg * oph * opr / 8.;

/*     change on 190315: set shape functions to */
/*     zero in order to obtain convergence in */
/*     contact calculations with c3d8i */

/*      shp(4, 9)=0.d0 */
/*      shp(4,10)=0.d0 */
/*      shp(4,11)=0.d0 */
    shp[40] = 1. - *xi * *xi;
    shp[44] = 1. - *et * *et;
    shp[48] = 1. - *ze * *ze;

    if (*iflag == 1) {
	return 0;
    }

/*     local derivatives of the shape functions: xi-derivative */

    shp[5] = -omh * omr / 8.;
    shp[9] = omh * omr / 8.;
    shp[13] = oph * omr / 8.;
    shp[17] = -oph * omr / 8.;
    shp[21] = -omh * opr / 8.;
    shp[25] = omh * opr / 8.;
    shp[29] = oph * opr / 8.;
    shp[33] = -oph * opr / 8.;
    shp[37] = *xi * -2.;
    shp[41] = 0.;
    shp[45] = 0.;

/*     local derivatives of the shape functions: eta-derivative */

    shp[6] = -omg * omr / 8.;
    shp[10] = -opg * omr / 8.;
    shp[14] = opg * omr / 8.;
    shp[18] = omg * omr / 8.;
    shp[22] = -omg * opr / 8.;
    shp[26] = -opg * opr / 8.;
    shp[30] = opg * opr / 8.;
    shp[34] = omg * opr / 8.;
    shp[38] = 0.;
    shp[42] = *et * -2.;
    shp[46] = 0.;

/*     local derivatives of the shape functions: zeta-derivative */

    shp[7] = -omg * omh / 8.;
    shp[11] = -opg * omh / 8.;
    shp[15] = -opg * oph / 8.;
    shp[19] = -omg * oph / 8.;
    shp[23] = omg * omh / 8.;
    shp[27] = opg * omh / 8.;
    shp[31] = opg * oph / 8.;
    shp[35] = omg * oph / 8.;
    shp[39] = 0.;
    shp[43] = 0.;
    shp[47] = *ze * -2.;

/*     computation of the local derivative of the global coordinates */
/*     (xs). Incompatible modes are not included here. */

    for (i__ = 1; i__ <= 3; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    xs[i__ + j * 3 - 4] = 0.;
	    for (k = 1; k <= 8; ++k) {
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

    for (k = 1; k <= 8; ++k) {
	for (j = 1; j <= 3; ++j) {
	    sh[j - 1] = shp[(k << 2) + 1] * xsi[j * 3 - 3] + shp[(k << 2) + 2]
		     * xsi[j * 3 - 2] + shp[(k << 2) + 3] * xsi[j * 3 - 1];
	}
	for (j = 1; j <= 3; ++j) {
	    shp[j + (k << 2)] = sh[j - 1];
	}
    }
    for (k = 9; k <= 11; ++k) {
	for (j = 1; j <= 3; ++j) {
	    sh[j - 1] = shp[(k << 2) + 1] * xsi0[j * 3 - 3] + shp[(k << 2) + 
		    2] * xsi0[j * 3 - 2] + shp[(k << 2) + 3] * xsi0[j * 3 - 1]
		    ;
	}
	for (j = 1; j <= 3; ++j) {
	    shp[j + (k << 2)] = sh[j - 1];
	}
    }

    return 0;
} /* shape8humass_ */

