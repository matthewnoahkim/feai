/* springdamp_n2f.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int springdamp_n2f__(doublereal *xl, doublereal *elas, 
	doublereal *voldl, doublereal *s, integer *imat, doublereal *elcon, 
	integer *ncmat___, integer *ntmat___, integer *nope, integer *
	iperturb, doublereal *springarea, integer *nmethod, integer *mi, 
	doublereal *reltime, integer *nasym)
{
    /* Initialized data */

    static integer iflag = 4;

    /* System generated locals */
    integer voldl_dim1, voldl_offset, elcon_dim1, elcon_dim2, elcon_offset, 
	    i__1, i__2;

    /* Builtin functions */
    double sqrt(doublereal);

    /* Local variables */
    extern /* Subroutine */ int attach_2d__(doublereal *, doublereal *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *)
	    ;
    integer i__, j, k, l;
    extern /* Subroutine */ int shape3tri_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *)
	    , shape6tri_(doublereal *, doublereal *, doublereal *, doublereal 
	    *, doublereal *, doublereal *, integer *);
    doublereal b1[30]	/* was [3][10] */, c1, c2, c3, c4, b2[30]	/* 
	    was [3][10] */;
    integer i1;
    doublereal a11, a12, a22, c11, c12, c22, al[3], dm, et, pl[30]	/* 
	    was [3][10] */, xi, xk, xm[3], xn[3], tu[90]	/* was [3][3][
	    10] */, xs2[21]	/* was [3][7] */, dal[90]	/* was [3][3][
	    10] */, det[30]	/* was [3][10] */, fnl[3], val, dxi[30]	/* 
	    was [3][10] */, fpu[90]	/* was [3][3][10] */, xmu[90]	/* 
	    was [3][3][10] */, determinant, shp2[63]	/* was [7][9] */, 
	    dval[30]	/* was [3][10] */, dist, dxmu[30]	/* was [3][10]
	     */, qxxy[3], qxyy[3], qxyx[3], qyxy[3], clear, alnew[3], ratio[9]
	    , pproj[3];
    integer nterms;
    extern /* Subroutine */ int shape4q_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *)
	    , shape8q_(doublereal *, doublereal *, doublereal *, doublereal *,
	     doublereal *, doublereal *, integer *);


/*     calculates the contact damping matrix (node-to-face penalty) */
/*     (User's manual -> theory -> boundary conditions -> */
/*      node-to-face penalty contact) */




    /* Parameter adjustments */
    xl -= 4;
    --elas;
    s -= 61;
    elcon_dim1 = *ncmat___ - 0 + 1;
    elcon_dim2 = *ntmat___;
    elcon_offset = 0 + elcon_dim1 * (1 + elcon_dim2);
    elcon -= elcon_offset;
    --iperturb;
    --springarea;
    --mi;
    voldl_dim1 = mi[2] - 0 + 1;
    voldl_offset = 0 + voldl_dim1;
    voldl -= voldl_offset;

    /* Function Body */

/*     actual positions of the nodes belonging to the contact spring */
/*     (otherwise no contact force) */

    i__1 = *nope;
    for (i__ = 1; i__ <= i__1; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    pl[j + i__ * 3 - 4] = xl[j + i__ * 3] + voldl[j + i__ * 
		    voldl_dim1];
	}
    }

/*     contact springs */

    nterms = *nope - 1;

/*     vector al connects the actual position of the slave node */
/*     with its projection on the master face = vec_r (User's */
/*     manual -> theory -> boundary conditions -> node-to-face */
/*     penalty contact) */

    for (i__ = 1; i__ <= 3; ++i__) {
	pproj[i__ - 1] = pl[i__ + *nope * 3 - 4];
    }
    attach_2d__(pl, pproj, &nterms, ratio, &dist, &xi, &et);
    for (i__ = 1; i__ <= 3; ++i__) {
	al[i__ - 1] = pl[i__ + *nope * 3 - 4] - pproj[i__ - 1];
    }

/*     determining the jacobian vector on the surface */

    if (nterms == 8) {
	shape8q_(&xi, &et, pl, xm, xs2, shp2, &iflag);
    } else if (nterms == 4) {
	shape4q_(&xi, &et, pl, xm, xs2, shp2, &iflag);
    } else if (nterms == 6) {
	shape6tri_(&xi, &et, pl, xm, xs2, shp2, &iflag);
    } else {
	shape3tri_(&xi, &et, pl, xm, xs2, shp2, &iflag);
    }

/*     d xi / d vec_u_j */
/*     d eta / d vec_u_j */

/*     dxi and det are determined from the orthogonality */
/*     condition */

    a11 = -(xs2[0] * xs2[0] + xs2[1] * xs2[1] + xs2[2] * xs2[2]) + al[0] * 
	    xs2[12] + al[1] * xs2[13] + al[2] * xs2[14];
    a12 = -(xs2[0] * xs2[3] + xs2[1] * xs2[4] + xs2[2] * xs2[5]) + al[0] * 
	    xs2[15] + al[1] * xs2[16] + al[2] * xs2[17];
    a22 = -(xs2[3] * xs2[3] + xs2[4] * xs2[4] + xs2[5] * xs2[5]) + al[0] * 
	    xs2[18] + al[1] * xs2[19] + al[2] * xs2[20];

    for (i__ = 1; i__ <= 3; ++i__) {
	i__1 = nterms;
	for (j = 1; j <= i__1; ++j) {
	    b1[i__ + j * 3 - 4] = shp2[j * 7 - 4] * xs2[i__ - 1] - shp2[j * 7 
		    - 7] * al[i__ - 1];
	    b2[i__ + j * 3 - 4] = shp2[j * 7 - 4] * xs2[i__ + 2] - shp2[j * 7 
		    - 6] * al[i__ - 1];
	}
	b1[i__ + *nope * 3 - 4] = -xs2[i__ - 1];
	b2[i__ + *nope * 3 - 4] = -xs2[i__ + 2];
    }

    determinant = a11 * a22 - a12 * a12;
    c11 = a22 / determinant;
    c12 = -a12 / determinant;
    c22 = a11 / determinant;

    for (i__ = 1; i__ <= 3; ++i__) {
	i__1 = *nope;
	for (j = 1; j <= i__1; ++j) {
	    dxi[i__ + j * 3 - 4] = c11 * b1[i__ + j * 3 - 4] + c12 * b2[i__ + 
		    j * 3 - 4];
	    det[i__ + j * 3 - 4] = c12 * b1[i__ + j * 3 - 4] + c22 * b2[i__ + 
		    j * 3 - 4];
	}
    }

/*     d vec_r / d vec_u_k */

    i__1 = *nope;
    for (i__ = 1; i__ <= i__1; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    for (k = 1; k <= 3; ++k) {
		dal[j + (k + i__ * 3) * 3 - 13] = -xs2[j - 1] * dxi[k + i__ * 
			3 - 4] - xs2[j + 2] * det[k + i__ * 3 - 4];
	    }
	}
    }
    i__1 = nterms;
    for (i__ = 1; i__ <= i__1; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    dal[j + (j + i__ * 3) * 3 - 13] -= shp2[i__ * 7 - 4];
	}
    }
    for (j = 1; j <= 3; ++j) {
	dal[j + (j + *nope * 3) * 3 - 13] += 1.;
    }

/*     d2q/dxx x dq/dy */

    qxxy[0] = xs2[13] * xs2[5] - xs2[14] * xs2[4];
    qxxy[1] = xs2[14] * xs2[3] - xs2[12] * xs2[5];
    qxxy[2] = xs2[12] * xs2[4] - xs2[13] * xs2[3];

/*     dq/dx x d2q/dyy */

    qxyy[0] = xs2[1] * xs2[20] - xs2[2] * xs2[19];
    qxyy[1] = xs2[2] * xs2[18] - xs2[0] * xs2[20];
    qxyy[2] = xs2[0] * xs2[19] - xs2[1] * xs2[18];

/*     Modified by Stefan Sicklinger */

/*     dq/dx x d2q/dxy */

    qxyx[0] = xs2[1] * xs2[17] - xs2[2] * xs2[16];
    qxyx[1] = xs2[2] * xs2[15] - xs2[0] * xs2[17];
    qxyx[2] = xs2[0] * xs2[16] - xs2[1] * xs2[15];

/*     d2q/dxy x dq/dy */

    qyxy[0] = xs2[16] * xs2[5] - xs2[17] * xs2[4];
    qyxy[1] = xs2[17] * xs2[3] - xs2[15] * xs2[5];
    qyxy[2] = xs2[15] * xs2[4] - xs2[16] * xs2[3];


/*     End modifications */

/*     normal on the surface */

    dm = sqrt(xm[0] * xm[0] + xm[1] * xm[1] + xm[2] * xm[2]);
    for (i__ = 1; i__ <= 3; ++i__) {
	xn[i__ - 1] = xm[i__ - 1] / dm;
    }

/*     distance from surface along normal (= clearance) */

    clear = al[0] * xn[0] + al[1] * xn[1] + al[2] * xn[2];
    if (*nmethod == 1) {
	clear -= springarea[2] * (1. - *reltime);
    }

/*     representative area: usually the slave surface stored in */
/*     springarea; however, if no area was assigned because the */
/*     node does not belong to any element, the master surface */
/*     is used */

    if (springarea[1] <= 0.) {
	if (nterms == 3) {
	    springarea[1] = dm / 2.;
	} else {
	    springarea[1] = dm * 4.;
	}
    }

    elas[2] = -springarea[1] * elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 
	    5];
    elas[1] = elas[2] * clear;

/*     contact force */

    for (i__ = 1; i__ <= 3; ++i__) {
	fnl[i__ - 1] = -elas[1] * xn[i__ - 1];
    }

/*     derivatives of the jacobian vector w.r.t. the displacement */
/*     vectors (d m / d u_k) */

    i__1 = nterms;
    for (k = 1; k <= i__1; ++k) {
	xmu[(k * 3 + 1) * 3 - 12] = 0.;
	xmu[(k * 3 + 2) * 3 - 11] = 0.;
	xmu[(k * 3 + 3) * 3 - 10] = 0.;
	xmu[(k * 3 + 2) * 3 - 12] = shp2[k * 7 - 7] * xs2[5] - shp2[k * 7 - 6]
		 * xs2[2];
	xmu[(k * 3 + 3) * 3 - 11] = shp2[k * 7 - 7] * xs2[3] - shp2[k * 7 - 6]
		 * xs2[0];
	xmu[(k * 3 + 1) * 3 - 10] = shp2[k * 7 - 7] * xs2[4] - shp2[k * 7 - 6]
		 * xs2[1];
	xmu[(k * 3 + 3) * 3 - 12] = -xmu[(k * 3 + 1) * 3 - 10];
	xmu[(k * 3 + 1) * 3 - 11] = -xmu[(k * 3 + 2) * 3 - 12];
	xmu[(k * 3 + 2) * 3 - 10] = -xmu[(k * 3 + 3) * 3 - 11];
    }
    for (i__ = 1; i__ <= 3; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    xmu[i__ + (j + *nope * 3) * 3 - 13] = 0.;
	}
    }

/*     correction due to change of xi and eta */

    i__1 = *nope;
    for (k = 1; k <= i__1; ++k) {
	for (j = 1; j <= 3; ++j) {
	    for (i__ = 1; i__ <= 3; ++i__) {

/*     modified by Stefan Sicklinger */

		xmu[i__ + (j + k * 3) * 3 - 13] = xmu[i__ + (j + k * 3) * 3 - 
			13] + (qxxy[i__ - 1] + qxyx[i__ - 1]) * dxi[j + k * 3 
			- 4] + (qxyy[i__ - 1] + qyxy[i__ - 1]) * det[j + k * 
			3 - 4];
	    }
	}
    }

/*     derivatives of the size of the jacobian vector w.r.t. the */
/*     displacement vectors (d ||m||/d u_k) */

    i__1 = *nope;
    for (k = 1; k <= i__1; ++k) {
	for (i__ = 1; i__ <= 3; ++i__) {
	    dxmu[i__ + k * 3 - 4] = xn[0] * xmu[(i__ + k * 3) * 3 - 12] + xn[
		    1] * xmu[(i__ + k * 3) * 3 - 11] + xn[2] * xmu[(i__ + k * 
		    3) * 3 - 10];
	}

/*        auxiliary variable: (d clear d u_k)*||m|| */

	for (i__ = 1; i__ <= 3; ++i__) {
	    dval[i__ + k * 3 - 4] = al[0] * xmu[(i__ + k * 3) * 3 - 12] + al[
		    1] * xmu[(i__ + k * 3) * 3 - 11] + al[2] * xmu[(i__ + k * 
		    3) * 3 - 10] - clear * dxmu[i__ + k * 3 - 4] + xm[0] * 
		    dal[(i__ + k * 3) * 3 - 12] + xm[1] * dal[(i__ + k * 3) * 
		    3 - 11] + xm[2] * dal[(i__ + k * 3) * 3 - 10];
	}

    }

    c1 = 1. / dm;
    c2 = c1 * c1;
    c3 = elas[2] * c2;
    c4 = elas[1] * c1;

/*     derivatives of the forces w.r.t. the displacement vectors */

    i__1 = *nope;
    for (k = 1; k <= i__1; ++k) {
	for (j = 1; j <= 3; ++j) {
	    for (i__ = 1; i__ <= 3; ++i__) {
		fpu[i__ + (j + k * 3) * 3 - 13] = -c3 * xm[i__ - 1] * dval[j 
			+ k * 3 - 4] + c4 * (xn[i__ - 1] * dxmu[j + k * 3 - 4]
			 - xmu[i__ + (j + k * 3) * 3 - 13]);
	    }
	}
    }

/*     tangential damping */

    if (elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 8] > 0.) {

/*     stiffness of shear stress versus slip curve */

	xk = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 8] * elcon[(*imat *
		 elcon_dim2 + 1) * elcon_dim1 + 5] * springarea[1];

/*     calculating the relative displacement between the slave node */
/*     and its projection on the master surface */

	for (i__ = 1; i__ <= 3; ++i__) {
	    alnew[i__ - 1] = voldl[i__ + *nope * voldl_dim1];
	    i__1 = nterms;
	    for (j = 1; j <= i__1; ++j) {
		alnew[i__ - 1] -= ratio[j - 1] * voldl[i__ + j * voldl_dim1];
	    }
	}

/*     calculating the difference in relative displacement since */
/*     the start of the increment = vec_s */

	for (i__ = 1; i__ <= 3; ++i__) {
	    al[i__ - 1] = alnew[i__ - 1];
	}

/*     s=||vec_s|| */

	val = al[0] * xn[0] + al[1] * xn[1] + al[2] * xn[2];

/*     d vec_s/ d vec_u_k */
/*     notice: xi & et are const. */

	i__1 = *nope;
	for (k = 1; k <= i__1; ++k) {
	    for (i__ = 1; i__ <= 3; ++i__) {
		for (j = 1; j <= 3; ++j) {
		    dal[i__ + (j + k * 3) * 3 - 13] = 0.;
		}
	    }
	}

	i__1 = nterms;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    for (j = 1; j <= 3; ++j) {
		dal[j + (j + i__ * 3) * 3 - 13] = -shp2[i__ * 7 - 4];
	    }
	}

	for (j = 1; j <= 3; ++j) {
	    dal[j + (j + *nope * 3) * 3 - 13] = 1.;
	}

/*     d s/ dvec_u_k.||m|| */

	i__1 = *nope;
	for (k = 1; k <= i__1; ++k) {
	    for (i__ = 1; i__ <= 3; ++i__) {
		dval[i__ + k * 3 - 4] = al[0] * xmu[(i__ + k * 3) * 3 - 12] + 
			al[1] * xmu[(i__ + k * 3) * 3 - 11] + al[2] * xmu[(
			i__ + k * 3) * 3 - 10] - val * dxmu[i__ + k * 3 - 4] 
			+ xm[0] * dal[(i__ + k * 3) * 3 - 12] + xm[1] * dal[(
			i__ + k * 3) * 3 - 11] + xm[2] * dal[(i__ + k * 3) * 
			3 - 10];
	    }
	}

/*     d vec_t/d vec_u_k */

	i__1 = *nope;
	for (k = 1; k <= i__1; ++k) {
	    for (j = 1; j <= 3; ++j) {
		for (i__ = 1; i__ <= 3; ++i__) {
		    tu[i__ + (j + k * 3) * 3 - 13] = dal[i__ + (j + k * 3) * 
			    3 - 13] - c1 * (xn[i__ - 1] * (dval[j + k * 3 - 4]
			     - val * dxmu[j + k * 3 - 4]) + val * xmu[i__ + (
			    j + k * 3) * 3 - 13]);
		}
	    }
	}

/*     damping matrix */

	i__1 = *nope;
	for (k = 1; k <= i__1; ++k) {
	    for (j = 1; j <= 3; ++j) {
		for (i__ = 1; i__ <= 3; ++i__) {
		    fpu[i__ + (j + k * 3) * 3 - 13] += xk * tu[i__ + (j + k * 
			    3) * 3 - 13];
		}
	    }
	}
    }

/*     determining the damping matrix contributions */

/*     complete field shp2 */

    shp2[*nope * 7 - 7] = 0.;
    shp2[*nope * 7 - 6] = 0.;
    shp2[*nope * 7 - 4] = -1.;

    i__1 = *nope;
    for (k = 1; k <= i__1; ++k) {
	i__2 = *nope;
	for (l = 1; l <= i__2; ++l) {
	    for (i__ = 1; i__ <= 3; ++i__) {
		i1 = i__ + (k - 1) * 3;
		for (j = 1; j <= 3; ++j) {
		    s[i1 + (j + (l - 1) * 3) * 60] = -shp2[k * 7 - 4] * fpu[
			    i__ + (j + l * 3) * 3 - 13] - shp2[k * 7 - 7] * 
			    fnl[i__ - 1] * dxi[j + l * 3 - 4] - shp2[k * 7 - 
			    6] * fnl[i__ - 1] * det[j + l * 3 - 4];
		}
	    }
	}
    }

/*     symmetrizing the matrix */
/*     this is done in the absence of friction or for modal dynamic */
/*     calculations */

    if (*nasym == 0 || *nmethod == 4 && iperturb[1] <= 1) {
	i__1 = *nope * 3;
	for (j = 1; j <= i__1; ++j) {
	    i__2 = j - 1;
	    for (i__ = 1; i__ <= i__2; ++i__) {
		s[i__ + j * 60] = (s[i__ + j * 60] + s[j + i__ * 60]) / 2.;
	    }
	}
    }

    return 0;
} /* springdamp_n2f__ */

