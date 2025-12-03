/* shape8qtilde.f -- translated by f2c (version 20200916).
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


/*     function to evaluate transformed shape funciton \f$ shape(\xi,\eta) \f$ */
/*     for quad-quad mortar method, see phd-thesis Sitzmann Chapter 4.1. */

/*     Author: Saskia Sitzmann */

/*  [in] xi		xi-coordinate */
/*  [in] et		eta-coordinate */
/*  [in] xl		local node coordinates */
/*  [out] xsj		jacobian vector */
/*  [out] xs		local derivative of the global coordinates */
/*  [out] shp		evaluated shape functions and derivatives */
/*  [in] iflag		flag indicating what to compute */

/* Subroutine */ int shape8qtilde_(doublereal *xi, doublereal *et, doublereal 
	*xl, doublereal *xsj, doublereal *xs, doublereal *shp, integer *iflag)
{
    integer i__, j, k;
    doublereal sh[3], xsi[6]	/* was [2][3] */, alpha, shpold[56]	/* 
	    was [7][8] */;


/*     shape functions and derivatives for a 8-node quadratic */
/*     isoparametric quadrilateral element. -1<=xi,et<=1 */

/*     iflag=1: calculate only the value of the shape functions */
/*     iflag=2: calculate the value of the shape functions, */
/*              their derivatives w.r.t. the local coordinates */
/*              and the Jacobian vector (local normal to the */
/*              surface) */
/*     iflag=3: calculate the value of the shape functions, the */
/*              value of their derivatives w.r.t. the global */
/*              coordinates and the Jacobian vector (local normal */
/*              to the surface) */
/*     iflag=4: calculate the value of the shape functions, the */
/*              value of their 1st and 2nd order derivatives */
/*              w.r.t. the local coordinates, the Jacobian vector */
/*              (local normal to the surface) */






/*     shape functions and their glocal derivatives for an element */
/*     described with two local parameters and three global ones. */

    /* Parameter adjustments */
    shp -= 8;
    xs -= 4;
    --xsj;
    xl -= 4;

    /* Function Body */
    alpha = .20000000000000001f;

/*     shape functions */

    shpold[3] = (1. - *xi) * (1. - *et) * (-(*xi) - *et - 1.) / 4.;
    shpold[10] = (*xi + 1.) * (1. - *et) * (*xi - *et - 1.) / 4.;
    shpold[17] = (*xi + 1.) * (*et + 1.) * (*xi + *et - 1.) / 4.;
    shpold[24] = (1. - *xi) * (*et + 1.) * (-(*xi) + *et - 1.) / 4.;
    shpold[31] = (1. - *xi * *xi) * (1. - *et) / 2.;
    shpold[38] = (*xi + 1.) * (1. - *et * *et) / 2.;
    shpold[45] = (1. - *xi * *xi) * (*et + 1.) / 2.;
    shpold[52] = (1. - *xi) * (1. - *et * *et) / 2.;

    shp[11] = shpold[3] * 1.f + alpha * shpold[31] + alpha * shpold[52];
    shp[18] = shpold[10] * 1.f + alpha * shpold[31] + alpha * shpold[38];
    shp[25] = shpold[17] * 1.f + alpha * shpold[38] + alpha * shpold[45];
    shp[32] = shpold[24] * 1.f + alpha * shpold[45] + alpha * shpold[52];
    shp[39] = (1.f - alpha * 2.f) * shpold[31];
    shp[46] = (1.f - alpha * 2.f) * shpold[38];
    shp[53] = (1.f - alpha * 2.f) * shpold[45];
    shp[60] = (1.f - alpha * 2.f) * shpold[52];

/*     Caution: derivatives and exspecially jacobian for untransformed */
/*     basis functions are given */
/*     needed for consistent integration */

    if (*iflag == 1) {
	return 0;
    }

/*     local derivatives of the shape functions: xi-derivative */

    shp[8] = (1. - *et) * (*xi * 2. + *et) / 4.;
    shp[15] = (1. - *et) * (*xi * 2. - *et) / 4.;
    shp[22] = (*et + 1.) * (*xi * 2. + *et) / 4.;
    shp[29] = (*et + 1.) * (*xi * 2. - *et) / 4.;
    shp[36] = -(*xi) * (1. - *et);
    shp[43] = (1. - *et * *et) / 2.;
    shp[50] = -(*xi) * (*et + 1.);
    shp[57] = -(1. - *et * *et) / 2.;

/*     local derivatives of the shape functions: eta-derivative */

    shp[9] = (1. - *xi) * (*et * 2. + *xi) / 4.;
    shp[16] = (*xi + 1.) * (*et * 2. - *xi) / 4.;
    shp[23] = (*xi + 1.) * (*et * 2. + *xi) / 4.;
    shp[30] = (1. - *xi) * (*et * 2. - *xi) / 4.;
    shp[37] = -(1. - *xi * *xi) / 2.;
    shp[44] = -(*et) * (*xi + 1.);
    shp[51] = (1. - *xi * *xi) / 2.;
    shp[58] = -(*et) * (1. - *xi);

/*     computation of the local derivative of the global coordinates */
/*     (xs) */

    for (i__ = 1; i__ <= 3; ++i__) {
	for (j = 1; j <= 2; ++j) {
	    xs[i__ + j * 3] = 0.;
	    for (k = 1; k <= 8; ++k) {
		xs[i__ + j * 3] += xl[i__ + k * 3] * shp[j + k * 7];
	    }
	}
    }

/*     computation of the jacobian vector */

    xsj[1] = xs[5] * xs[9] - xs[6] * xs[8];
    xsj[2] = xs[7] * xs[6] - xs[9] * xs[4];
    xsj[3] = xs[4] * xs[8] - xs[5] * xs[7];

    if (*iflag == 3) {

/*     computation of the global derivative of the local coordinates */
/*     (xsi) (inversion of xs) */

	if (abs(xsj[3]) > 1e-10) {
	    xsi[0] = xs[8] / xsj[3];
	    xsi[3] = xs[4] / xsj[3];
	    xsi[2] = -xs[7] / xsj[3];
	    xsi[1] = -xs[5] / xsj[3];
	    if (abs(xsj[2]) > 1e-10) {
		xsi[5] = xs[4] / (-xsj[2]);
		xsi[4] = -xs[7] / (-xsj[2]);
	    } else if (abs(xsj[1]) > 1e-10) {
		xsi[5] = xs[5] / xsj[1];
		xsi[4] = -xs[8] / xsj[1];
	    } else {
		xsi[5] = 0.;
		xsi[4] = 0.;
	    }
	} else if (abs(xsj[2]) > 1e-10) {
	    xsi[0] = xs[9] / (-xsj[2]);
	    xsi[5] = xs[4] / (-xsj[2]);
	    xsi[4] = -xs[7] / (-xsj[2]);
	    xsi[1] = -xs[6] / (-xsj[2]);
	    if (abs(xsj[1]) > 1e-10) {
		xsi[2] = xs[9] / xsj[1];
		xsi[3] = -xs[6] / xsj[1];
	    } else {
		xsi[2] = 0.;
		xsi[3] = 0.;
	    }
	} else {
	    xsi[2] = xs[9] / xsj[1];
	    xsi[5] = xs[5] / xsj[1];
	    xsi[4] = -xs[8] / xsj[1];
	    xsi[3] = -xs[6] / xsj[1];
	    xsi[0] = 0.;
	    xsi[1] = 0.;
	}

/*     computation of the global derivatives of the shape functions */

	for (k = 1; k <= 8; ++k) {
	    for (j = 1; j <= 3; ++j) {
		sh[j - 1] = shp[k * 7 + 1] * xsi[(j << 1) - 2] + shp[k * 7 + 
			2] * xsi[(j << 1) - 1];
	    }
	    for (j = 1; j <= 3; ++j) {
		shp[j + k * 7] = sh[j - 1];
	    }
	}

    } else if (*iflag == 4) {

/*     local 2nd order derivatives of the shape functions: xi,xi-derivative */

	shp[12] = (1. - *et) / 2.;
	shp[19] = (1. - *et) / 2.;
	shp[26] = (*et + 1.) / 2.;
	shp[33] = (*et + 1.) / 2.;
	shp[40] = -(1. - *et);
	shp[47] = 0.;
	shp[54] = -(*et + 1.);
	shp[61] = 0.;

	shp[12] = shpold[4] * 1.f + alpha * shpold[32] + alpha * shpold[53];
	shp[19] = shpold[11] * 1.f + alpha * shpold[32] + alpha * shpold[39];
	shp[26] = shpold[18] * 1.f + alpha * shpold[39] + alpha * shpold[46];
	shp[33] = shpold[25] * 1.f + alpha * shpold[46] + alpha * shpold[53];
	shp[40] = (1.f - alpha * 2.f) * shpold[32];
	shp[47] = (1.f - alpha * 2.f) * shpold[39];
	shp[54] = (1.f - alpha * 2.f) * shpold[46];
	shp[61] = (1.f - alpha * 2.f) * shpold[53];

/*     local 2nd order derivatives of the shape functions: xi,eta-derivative */

	shp[13] = (1. - (*xi + *et) * 2.) / 4.;
	shp[20] = (-1. - (*xi - *et) * 2.) / 4.;
	shp[27] = ((*xi + *et) * 2. + 1.) / 4.;
	shp[34] = (-1. - (*xi + *et) * 2.) / 4.;
	shp[41] = *xi;
	shp[48] = -(*et);
	shp[55] = -(*xi);
	shp[62] = *et;

	shp[13] = shpold[5] * 1.f + alpha * shpold[33] + alpha * shpold[54];
	shp[20] = shpold[12] * 1.f + alpha * shpold[33] + alpha * shpold[40];
	shp[27] = shpold[19] * 1.f + alpha * shpold[40] + alpha * shpold[47];
	shp[34] = shpold[26] * 1.f + alpha * shpold[47] + alpha * shpold[54];
	shp[41] = (1.f - alpha * 2.f) * shpold[33];
	shp[48] = (1.f - alpha * 2.f) * shpold[40];
	shp[55] = (1.f - alpha * 2.f) * shpold[47];
	shp[62] = (1.f - alpha * 2.f) * shpold[54];

/*     local 2nd order derivatives of the shape functions: eta,eta-derivative */

	shp[14] = (1. - *xi) / 2.;
	shp[21] = (*xi + 1.) / 2.;
	shp[28] = (*xi + 1.) / 2.;
	shp[35] = (1. - *xi) / 2.;
	shp[42] = 0.;
	shp[49] = -(*xi + 1.);
	shp[56] = 0.;
	shp[63] = -(1. - *xi);

	shp[14] = shpold[6] * 1.f + alpha * shpold[34] + alpha * shpold[55];
	shp[21] = shpold[13] * 1.f + alpha * shpold[34] + alpha * shpold[41];
	shp[28] = shpold[20] * 1.f + alpha * shpold[41] + alpha * shpold[48];
	shp[35] = shpold[27] * 1.f + alpha * shpold[48] + alpha * shpold[55];
	shp[42] = (1.f - alpha * 2.f) * shpold[34];
	shp[49] = (1.f - alpha * 2.f) * shpold[41];
	shp[56] = (1.f - alpha * 2.f) * shpold[48];
	shp[63] = (1.f - alpha * 2.f) * shpold[55];

/*     computation of the local 2nd derivatives of the global coordinates */
/*     (xs) */

	for (i__ = 1; i__ <= 3; ++i__) {
	    for (j = 5; j <= 7; ++j) {
		xs[i__ + j * 3] = 0.;
		for (k = 1; k <= 8; ++k) {
		    xs[i__ + j * 3] += xl[i__ + k * 3] * shp[j + k * 7];
		}
	    }
	}
    }

    return 0;
} /* shape8qtilde_ */

