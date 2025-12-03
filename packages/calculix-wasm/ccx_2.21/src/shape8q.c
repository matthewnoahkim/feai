/* shape8q.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int shape8q_(doublereal *xi, doublereal *et, doublereal *xl, 
	doublereal *xsj, doublereal *xs, doublereal *shp, integer *iflag)
{
    integer i__, j, k;
    doublereal sh[3], etm, etp, xim, xip, xsi[6]	/* was [2][3] */, 
	    etm2, xim2, ximet, xipet;


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
/*     iflag=5: calculate the value of the shape functions and */
/*              their derivatives w.r.t. the local coordinates */




/*     shape functions and their glocal derivatives for an element */
/*     described with two local parameters and three global ones. */

    /* Parameter adjustments */
    shp -= 8;
    xs -= 4;
    --xsj;
    xl -= 4;

    /* Function Body */
    xip = *xi + 1.;
    xim = 1. - *xi;
    xim2 = xip * xim;

    etp = *et + 1.;
    etm = 1. - *et;
    etm2 = etp * etm;

    xipet = *xi + *et;
    ximet = *xi - *et;

/*     shape functions */

    shp[11] = xim * etm * (-xipet - 1.) / 4.;
    shp[18] = xip * etm * (ximet - 1.) / 4.;
    shp[25] = xip * etp * (xipet - 1.) / 4.;
    shp[32] = xim * etp * (-ximet - 1.) / 4.;
    shp[39] = xim2 * etm / 2.;
    shp[46] = xip * etm2 / 2.;
    shp[53] = xim2 * etp / 2.;
    shp[60] = xim * etm2 / 2.;

    if (*iflag == 1) {
	return 0;
    }

/*     local derivatives of the shape functions: xi-derivative */

    shp[8] = etm * (*xi + xipet) / 4.;
    shp[15] = etm * (*xi + ximet) / 4.;
    shp[22] = etp * (*xi + xipet) / 4.;
    shp[29] = etp * (*xi + ximet) / 4.;
    shp[36] = -(*xi) * etm;
    shp[43] = etm2 / 2.;
    shp[50] = -(*xi) * etp;
    shp[57] = -etm2 / 2.;

/*     local derivatives of the shape functions: eta-derivative */

    shp[9] = xim * (*et + xipet) / 4.;
    shp[16] = xip * (*et - ximet) / 4.;
    shp[23] = xip * (*et + xipet) / 4.;
    shp[30] = xim * (*et - ximet) / 4.;
    shp[37] = -xim2 / 2.;
    shp[44] = -(*et) * xip;
    shp[51] = xim2 / 2.;
    shp[58] = -(*et) * xim;

    if (*iflag == 5) {
	return 0;
    }

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

	shp[12] = etm / 2.;
	shp[19] = etm / 2.;
	shp[26] = etp / 2.;
	shp[33] = etp / 2.;
	shp[40] = -etm;
	shp[47] = 0.;
	shp[54] = -etp;
	shp[61] = 0.;

/*     local 2nd order derivatives of the shape functions: xi,eta-derivative */

	shp[13] = (1. - xipet * 2.) / 4.;
	shp[20] = (-1. - ximet * 2.) / 4.;
	shp[27] = (xipet * 2. + 1.) / 4.;
	shp[34] = (ximet * 2. - 1.) / 4.;
	shp[41] = *xi;
	shp[48] = -(*et);
	shp[55] = -(*xi);
	shp[62] = *et;

/*     local 2nd order derivatives of the shape functions: eta,eta-derivative */

	shp[14] = xim / 2.;
	shp[21] = xip / 2.;
	shp[28] = xip / 2.;
	shp[35] = xim / 2.;
	shp[42] = 0.;
	shp[49] = -xip;
	shp[56] = 0.;
	shp[63] = -xim;

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
} /* shape8q_ */

