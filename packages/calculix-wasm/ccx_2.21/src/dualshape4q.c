/* dualshape4q.f -- translated by f2c (version 20200916).
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


/*     function to evaluate dual shape funciton \f$ shape(\xi,\eta) \f$ */

/*  [in] xi		xi-coordinate */
/*  [in] et		eta-coordinate */
/*  [in] xl		local node coordinates */
/*  [out] xsj		jacobian vector */
/*  [out] xs		local derivative of the global coordinates */
/*  [out] shp		evaluated shape functions and derivatives */
/*  [in] ns		current slave face */
/*  [in] pslavdual 	(:,i)coefficients \f$ \alpha_{ij}\f$, */
/*                       \f$ 1,j=1,..8\f$ for dual shape functions for face i */
/*  [in] iflag		flag indicating what to compute */

/* Subroutine */ int dualshape4q_(doublereal *xi, doublereal *et, doublereal *
	xl, doublereal *xsj, doublereal *xs, doublereal *shp, integer *ns, 
	doublereal *pslavdual, integer *iflag)
{
    integer i__, j, k;
    doublereal sh[3], xsi[6]	/* was [2][3] */;


/*     iflag=2: calculate the value of the shape functions, */
/*              their derivatives w.r.t. the local coordinates */
/*              and the Jacobian vector (local normal to the */
/*              surface) */
/*     iflag=3: calculate the value of the shape functions, the */
/*              value of their derivatives w.r.t. the global */
/*              coordinates and the Jacobian vector (local normal */
/*              to the surface) */







/*     shape functions and their glocal derivatives for an element */
/*     described with two local parameters and three global ones. */

/*     Caution: derivatives and exspecially jacobian for standard */
/*     basis functions are given */
/*     needed for consistent integration */

/*     local derivatives of the shape functions: xi-derivative */

    /* Parameter adjustments */
    pslavdual -= 65;
    shp -= 8;
    xs -= 4;
    --xsj;
    xl -= 4;

    /* Function Body */
    shp[8] = -(1. - *et) / 4.;
    shp[15] = (1. - *et) / 4.;
    shp[22] = (*et + 1.) / 4.;
    shp[29] = -(*et + 1.) / 4.;

/*     local derivatives of the shape functions: eta-derivative */

    shp[9] = -(1. - *xi) / 4.;
    shp[16] = -(*xi + 1.) / 4.;
    shp[23] = (*xi + 1.) / 4.;
    shp[30] = (1. - *xi) / 4.;

/*     standard shape functions */

    shp[10] = (1. - *xi) * (1. - *et) / 4.;
    shp[17] = (*xi + 1.) * (1. - *et) / 4.;
    shp[24] = (*xi + 1.) * (*et + 1.) / 4.;
    shp[31] = (1. - *xi) * (*et + 1.) / 4.;

/*     Dual shape functions */
/*     with Mass Matrix pslavdual */

    for (i__ = 1; i__ <= 4; ++i__) {
	shp[i__ * 7 + 4] = 0.f;
	for (j = 1; j <= 4; ++j) {
	    shp[i__ * 7 + 4] += pslavdual[(i__ - 1 << 3) + j + (*ns << 6)] * 
		    shp[j * 7 + 3];
	}
    }

/*     computation of the local derivative of the global coordinates */
/*     (xs) */

    for (i__ = 1; i__ <= 3; ++i__) {
	for (j = 1; j <= 2; ++j) {
	    xs[i__ + j * 3] = 0.;
	    for (k = 1; k <= 4; ++k) {
		xs[i__ + j * 3] += xl[i__ + k * 3] * shp[j + k * 7];
	    }
	}
    }

/*     computation of the jacobian vector */

    xsj[1] = xs[5] * xs[9] - xs[6] * xs[8];
    xsj[2] = xs[7] * xs[6] - xs[9] * xs[4];
    xsj[3] = xs[4] * xs[8] - xs[5] * xs[7];

    if (*iflag == 2) {
	return 0;
    }

/*     computation of the global derivative of the local coordinates */
/*     (xsi) (inversion of xs) */

    xsi[0] = xs[8] / xsj[3];
    xsi[1] = -xs[5] / xsj[3];
    xsi[2] = -xs[7] / xsj[3];
    xsi[3] = xs[4] / xsj[3];
    xsi[4] = -xs[8] / xsj[1];
    xsi[5] = xs[5] / xsj[1];

/*     computation of the global derivatives of the shape functions */

    for (k = 1; k <= 4; ++k) {
	for (j = 1; j <= 3; ++j) {
	    sh[j - 1] = shp[k * 7 + 1] * xsi[(j << 1) - 2] + shp[k * 7 + 2] * 
		    xsi[(j << 1) - 1];
	}
	for (j = 1; j <= 3; ++j) {
	    shp[j + k * 7] = sh[j - 1];
	}
    }

    return 0;
} /* dualshape4q_ */

