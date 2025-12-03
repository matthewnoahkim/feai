/* addshell.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int addshell_(integer *nactdof, integer *node, doublereal *b,
	 integer *mi, integer *iperturb, integer *nmethod, doublereal *cam, 
	doublereal *v)
{
    /* Initialized data */

    static doublereal d__[9]	/* was [3][3] */ = { 1.,0.,0.,0.,1.,0.,0.,0.,
	    1. };
    static doublereal e[27]	/* was [3][3][3] */ = { 0.,0.,0.,0.,0.,-1.,0.,
	    1.,0.,0.,0.,1.,0.,0.,0.,-1.,0.,0.,0.,-1.,0.,1.,0.,0.,0.,0.,0. };

    /* System generated locals */
    integer nactdof_dim1, nactdof_offset, v_dim1, v_offset;
    doublereal d__1;

    /* Builtin functions */
    double sqrt(doublereal), cos(doublereal), sin(doublereal), acos(
	    doublereal);

    /* Local variables */
    integer i__, j, k, l;
    doublereal r__[9]	/* was [3][3] */, c1, c2, c3, r0[9]	/* was [3][3] 
	    */, dr[9]	/* was [3][3] */, th, xn[3], ww, bnac[6];


/*     updates the translational and rotational dofs */
/*     for true shells */

/*     the translational dofs are simply added; */

/*     the rotational dofs */
/*     are at the start of this routine available as rotational */
/*     vectors. These vectors are transformed into a rotational matrix, */
/*     both matrices are multiplied and reverted into a vector; */




/*     d(3,3): delta Dirac function */
/*     e(3,3,3): alternating symbol */

    /* Parameter adjustments */
    --b;
    --mi;
    v_dim1 = mi[2] - 0 + 1;
    v_offset = 0 + v_dim1;
    v -= v_offset;
    nactdof_dim1 = mi[2] - 0 + 1;
    nactdof_offset = 0 + nactdof_dim1;
    nactdof -= nactdof_offset;
    --iperturb;
    --cam;

    /* Function Body */

/*     storing the change in solution in bnac */

    for (j = 1; j <= 6; ++j) {
	if (nactdof[j + *node * nactdof_dim1] > 0) {
	    bnac[j - 1] = b[nactdof[j + *node * nactdof_dim1]];
	} else {
	    bnac[j - 1] = 0.;
	}
	if (iperturb[1] != 0 && abs(*nmethod) == 1) {
	    if ((d__1 = bnac[j - 1], abs(d__1)) > cam[1]) {
		cam[1] = (d__1 = bnac[j - 1], abs(d__1));
		cam[4] = nactdof[j + *node * nactdof_dim1] - .5;
	    }
	}
    }

/*     updata translational dofs */

    for (j = 1; j <= 3; ++j) {
	v[j + *node * v_dim1] += bnac[j - 1];
    }

/*     update rotational dofs */

/*     previous solution */

    xn[0] = v[*node * v_dim1 + 4];
    xn[1] = v[*node * v_dim1 + 5];
    xn[2] = v[*node * v_dim1 + 6];

    ww = sqrt(xn[0] * xn[0] + xn[1] * xn[1] + xn[2] * xn[2]);

    c1 = cos(ww);
    if (ww > 1e-10) {
	c2 = sin(ww) / ww;
    } else {
	c2 = 1.;
    }
    if (ww > 1e-5) {
/* Computing 2nd power */
	d__1 = ww;
	c3 = (1. - c1) / (d__1 * d__1);
    } else {
	c3 = .5;
    }

/*     rotation matrix r0 (Buch by Dhondt, Wiley(2004), Eq. (3.76)) */

    for (k = 1; k <= 3; ++k) {
	for (l = 1; l <= 3; ++l) {
	    r0[k + l * 3 - 4] = c1 * d__[k + l * 3 - 4] + c2 * (e[k + (l * 3 
		    + 1) * 3 - 13] * xn[0] + e[k + (l * 3 + 2) * 3 - 13] * xn[
		    1] + e[k + (l * 3 + 3) * 3 - 13] * xn[2]) + c3 * xn[k - 1]
		     * xn[l - 1];
	}
    }

/*     change in solution */

    xn[0] = bnac[3];
    xn[1] = bnac[4];
    xn[2] = bnac[5];

    ww = sqrt(xn[0] * xn[0] + xn[1] * xn[1] + xn[2] * xn[2]);

    c1 = cos(ww);
    if (ww > 1e-10) {
	c2 = sin(ww) / ww;
    } else {
	c2 = 1.;
    }
    if (ww > 1e-5) {
/* Computing 2nd power */
	d__1 = ww;
	c3 = (1. - c1) / (d__1 * d__1);
    } else {
	c3 = .5;
    }

/*     rotation matrix dr (Buch by Dhondt, Wiley(2004), Eq. (3.76)) */

    for (k = 1; k <= 3; ++k) {
	for (l = 1; l <= 3; ++l) {
	    dr[k + l * 3 - 4] = c1 * d__[k + l * 3 - 4] + c2 * (e[k + (l * 3 
		    + 1) * 3 - 13] * xn[0] + e[k + (l * 3 + 2) * 3 - 13] * xn[
		    1] + e[k + (l * 3 + 3) * 3 - 13] * xn[2]) + c3 * xn[k - 1]
		     * xn[l - 1];
	}
    }

/*     multiplying the matrices */

    for (i__ = 1; i__ <= 3; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    r__[i__ + j * 3 - 4] = 0.;
	    for (k = 1; k <= 3; ++k) {
		r__[i__ + j * 3 - 4] += dr[i__ + k * 3 - 4] * r0[k + j * 3 - 
			4];
	    }
	}
    }

/*     convert into a rotational vector (inverse formulas obtained by: */
/*     C_ii=1+2*cos(theta) */
/*     (C_ij-C_ji)/2=sin(theta)*e_ikj*n_k */

    th = acos((r__[0] + r__[4] + r__[8] - 1.) / 2.);

    if (abs(th) < 1e-10) {

/*       default: rotation of 1.d-10 about the x-axis */

	v[*node * v_dim1 + 4] = 1e-10;
	v[*node * v_dim1 + 5] = 0.;
	v[*node * v_dim1 + 6] = 0.;
    } else {
	th /= sin(th) * 2.;
	v[*node * v_dim1 + 4] = th * (r__[5] - r__[7]);
	v[*node * v_dim1 + 5] = th * (r__[6] - r__[2]);
	v[*node * v_dim1 + 6] = th * (r__[1] - r__[3]);
    }

    return 0;
} /* addshell_ */

