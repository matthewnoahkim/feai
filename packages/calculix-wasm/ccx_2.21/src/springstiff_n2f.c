/* springstiff_n2f.f -- translated by f2c (version 20200916).
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

/* Table of constant values */

static integer c__9 = 9;
static integer c__1 = 1;
static integer c__201 = 201;


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

/* Subroutine */ int springstiff_n2f__(doublereal *xl, doublereal *elas, 
	integer *konl, doublereal *voldl, doublereal *s, integer *imat, 
	doublereal *elcon, integer *nelcon, integer *ncmat___, integer *
	ntmat___, integer *nope, char *lakonl, doublereal *t1l, integer *kode,
	 doublereal *elconloc, doublereal *plicon, integer *nplicon, integer *
	npmat___, integer *iperturb, doublereal *springarea, integer *nmethod,
	 integer *mi, integer *ne0, integer *nstate___, doublereal *xstateini,
	 doublereal *xstate, doublereal *reltime, integer *nasym, integer *
	ielorien, doublereal *orab, integer *norien, integer *nelem, ftnlen 
	lakonl_len)
{
    /* System generated locals */
    integer nplicon_dim1, nplicon_offset, ielorien_dim1, ielorien_offset, 
	    voldl_dim1, voldl_offset, elcon_dim1, elcon_dim2, elcon_offset, 
	    plicon_dim1, plicon_dim2, plicon_offset, xstate_dim1, xstate_dim2,
	     xstate_offset, xstateini_dim1, xstateini_dim2, xstateini_offset, 
	    i__1, i__2;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen);
    double sqrt(doublereal);
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);
    double atan(doublereal);
    integer i_dnnt(doublereal *);
    double log(doublereal), exp(doublereal);

    /* Local variables */
    doublereal plconloc[802];
    extern /* Subroutine */ int attach_2d__(doublereal *, doublereal *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *)
	    ;
    doublereal a[9]	/* was [3][3] */;
    integer i__, j, k, l;
    extern /* Subroutine */ int shape3tri_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *)
	    ;
    doublereal t[3];
    extern /* Subroutine */ int shape6tri_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *)
	    ;
    doublereal b1[30]	/* was [3][10] */, c1, c2, c3, c4, b2[30]	/* 
	    was [3][10] */;
    integer i1;
    doublereal a11, a12, a22, c11, c12, c22, dd, dg;
    integer id;
    doublereal al[3], dm, fk, et, pi, te[3], pl[30]	/* was [3][10] */, xi,
	     um, xk, xm[3], xn[3], tp[3], tu[90]	/* was [3][3][10] */, 
	    dd0, xn1[3], xn2[3], xs2[21]	/* was [3][7] */, dal[90]	
	    /* was [3][3][10] */, dfn[30]	/* was [3][10] */, det[30]	
	    /* was [3][10] */, dte, fnl[3], val, dxi[30]	/* was [3][10]
	     */, eps, fpu[90]	/* was [3][3][10] */, xmu[90]	/* was [3][3][
	    10] */, determinant, shp2[63]	/* was [7][9] */, overclosure,
	     beta;
    integer idof;
    doublereal dfnl, dval[30]	/* was [3][10] */, dist;
    integer niso;
    doublereal pres;
    extern /* Subroutine */ int exit_(integer *);
    doublereal dxmu[30]	/* was [3][10] */, xiso[200], yiso[200];
    integer idof1, idof2;
    doublereal qxxy[3], qxyy[3], qxyx[3], qyxy[3];
    integer iflag;
    doublereal alpha, clear;
    extern /* Subroutine */ int ident_(doublereal *, doublereal *, integer *, 
	    integer *);
    doublereal dftdt[9]	/* was [3][3] */, alnew[3], ratio[9], pproj[3], 
	    dpresdoverlap, ftrial[3];
    integer iorien, nterms;
    extern /* Subroutine */ int shape4q_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *)
	    , shape8q_(doublereal *, doublereal *, doublereal *, doublereal *,
	     doublereal *, doublereal *, integer *);
    doublereal dfshear;
    extern /* Subroutine */ int transformatrix_(doublereal *, doublereal *, 
	    doublereal *);
    doublereal dftrial, overlap;
    extern /* Subroutine */ int materialdata_sp__(doublereal *, integer *, 
	    integer *, integer *, integer *, doublereal *, doublereal *, 
	    integer *, doublereal *, integer *, integer *, doublereal *, 
	    integer *);

    /* Fortran I/O blocks */
    static cilist io___7 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };



/*     calculates the stiffness of a spring (node-to-face penalty) */
/*     (User's manual -> theory -> boundary conditions -> */
/*      node-to-face penalty contact) */





    /* Parameter adjustments */
    xl -= 4;
    --elas;
    --konl;
    s -= 61;
    nelcon -= 3;
    nplicon_dim1 = *ntmat___ - 0 + 1;
    nplicon_offset = 0 + nplicon_dim1;
    nplicon -= nplicon_offset;
    elcon_dim1 = *ncmat___ - 0 + 1;
    elcon_dim2 = *ntmat___;
    elcon_offset = 0 + elcon_dim1 * (1 + elcon_dim2);
    elcon -= elcon_offset;
    --elconloc;
    plicon_dim1 = 2 * *npmat___ - 0 + 1;
    plicon_dim2 = *ntmat___;
    plicon_offset = 0 + plicon_dim1 * (1 + plicon_dim2);
    plicon -= plicon_offset;
    --iperturb;
    --springarea;
    --mi;
    ielorien_dim1 = mi[3];
    ielorien_offset = 1 + ielorien_dim1;
    ielorien -= ielorien_offset;
    voldl_dim1 = mi[2] - 0 + 1;
    voldl_offset = 0 + voldl_dim1;
    voldl -= voldl_offset;
    xstate_dim1 = *nstate___;
    xstate_dim2 = mi[1];
    xstate_offset = 1 + xstate_dim1 * (1 + xstate_dim2);
    xstate -= xstate_offset;
    xstateini_dim1 = *nstate___;
    xstateini_dim2 = mi[1];
    xstateini_offset = 1 + xstateini_dim1 * (1 + xstateini_dim2);
    xstateini -= xstateini_offset;
    orab -= 8;

    /* Function Body */
    iflag = 4;

/*     actual positions of the nodes belonging to the contact spring */
/*     (otherwise no contact force) */

    i__1 = *nope;
    for (i__ = 1; i__ <= i__1; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    pl[j + i__ * 3 - 4] = xl[j + i__ * 3] + voldl[j + i__ * 
		    voldl_dim1];
	}
    }

    if (*(unsigned char *)&lakonl[6] == 'A') {
	if (s_cmp(lakonl + 3, "RNG", (ftnlen)3, (ftnlen)3) == 0) {

/*           SPRINGA-element */

/* Computing 2nd power */
	    d__1 = xl[7] - xl[4];
/* Computing 2nd power */
	    d__2 = xl[8] - xl[5];
/* Computing 2nd power */
	    d__3 = xl[9] - xl[6];
	    dd0 = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);
/* Computing 2nd power */
	    d__1 = pl[3] - pl[0];
/* Computing 2nd power */
	    d__2 = pl[4] - pl[1];
/* Computing 2nd power */
	    d__3 = pl[5] - pl[2];
	    dd = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);
	    if (dd <= 0.) {
		s_wsle(&io___7);
		do_lio(&c__9, &c__1, "*ERROR in springstiff_n2f: spring conn"
			"ects", (ftnlen)42);
		e_wsle();
		s_wsle(&io___8);
		do_lio(&c__9, &c__1, "       two nodes at the same location:",
			 (ftnlen)38);
		e_wsle();
		s_wsle(&io___9);
		do_lio(&c__9, &c__1, "       spring length is zero", (ftnlen)
			28);
		e_wsle();
		exit_(&c__201);
	    }
	    for (i__ = 1; i__ <= 3; ++i__) {
		xn[i__ - 1] = (pl[i__ + 2] - pl[i__ - 1]) / dd;
	    }
	    val = dd - dd0;

/*     interpolating the material data */

	    materialdata_sp__(&elcon[elcon_offset], &nelcon[3], imat, 
		    ntmat___, &i__, t1l, &elconloc[1], kode, &plicon[
		    plicon_offset], &nplicon[nplicon_offset], npmat___, 
		    plconloc, ncmat___);

/*     calculating the spring force and the spring constant */

	    if (*kode == 2) {
		xk = elconloc[1];
		fk = xk * val;
	    } else {
		niso = (integer) plconloc[800];
		i__1 = niso;
		for (i__ = 1; i__ <= i__1; ++i__) {
		    xiso[i__ - 1] = plconloc[(i__ << 1) - 2];
		    yiso[i__ - 1] = plconloc[(i__ << 1) - 1];
		}
		ident_(xiso, &val, &niso, &id);
		if (id == 0) {
		    xk = 0.;
		    fk = yiso[0];
		} else if (id == niso) {
		    xk = 0.;
		    fk = yiso[niso - 1];
		} else {
		    xk = (yiso[id] - yiso[id - 1]) / (xiso[id] - xiso[id - 1])
			    ;
		    fk = yiso[id - 1] + xk * (val - xiso[id - 1]);
		}
	    }

	    c1 = fk / dd;
	    c2 = xk - c1;
	    for (i__ = 1; i__ <= 3; ++i__) {
		for (j = 1; j <= 3; ++j) {
		    s[i__ + j * 60] = c2 * xn[i__ - 1] * xn[j - 1];
		}
		s[i__ + i__ * 60] += c1;
	    }
	} else {

/*           GAP-element */
/*           interpolating the material data */

	    materialdata_sp__(&elcon[elcon_offset], &nelcon[3], imat, 
		    ntmat___, &i__, t1l, &elconloc[1], kode, &plicon[
		    plicon_offset], &nplicon[nplicon_offset], npmat___, 
		    plconloc, ncmat___);

	    dd = elconloc[1];
	    xn[0] = elconloc[2];
	    xn[1] = elconloc[3];
	    xn[2] = elconloc[4];
	    xk = elconloc[5];
	    pi = atan(1.) * 4.;
	    eps = pi * elconloc[6] / xk;
	    overclosure = -dd - xn[0] * (voldl[(voldl_dim1 << 1) + 1] - voldl[
		    voldl_dim1 + 1]) - xn[1] * (voldl[(voldl_dim1 << 1) + 2] 
		    - voldl[voldl_dim1 + 2]) - xn[2] * (voldl[(voldl_dim1 << 
		    1) + 3] - voldl[voldl_dim1 + 3]);
	    fk = -xk * overclosure * (atan(overclosure / eps) / pi + .5);
/* Computing 2nd power */
	    d__1 = overclosure / eps;
	    c2 = xk * (atan(overclosure / eps) / pi + .5 + overclosure / (pi *
		     eps * (d__1 * d__1 + 1.)));
	    for (i__ = 1; i__ <= 3; ++i__) {
		for (j = 1; j <= 3; ++j) {
		    s[i__ + j * 60] = c2 * xn[i__ - 1] * xn[j - 1];
		}
	    }
	}

	for (i__ = 1; i__ <= 3; ++i__) {
	    for (j = 1; j <= 3; ++j) {
		s[i__ + 3 + j * 60] = -s[i__ + j * 60];
		s[i__ + (j + 3) * 60] = -s[i__ + j * 60];
		s[i__ + 3 + (j + 3) * 60] = s[i__ + j * 60];
	    }
	}
	return 0;
    } else if (*(unsigned char *)&lakonl[6] == '1') {

/*        spring1-element */
/*        determine the direction of action of the spring */

	idof = i_dnnt(&elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 3]);

	if (*norien > 0) {
/* Computing MAX */
	    i__1 = 0, i__2 = ielorien[*nelem * ielorien_dim1 + 1];
	    iorien = max(i__1,i__2);
	} else {
	    iorien = 0;
	}

	if (iorien == 0) {
	    for (i__ = 1; i__ <= 3; ++i__) {
		xn[i__ - 1] = 0.;
	    }
	    xn[idof - 1] = 1.;
	} else {
	    transformatrix_(&orab[iorien * 7 + 1], &xl[4], a);
	    for (i__ = 1; i__ <= 3; ++i__) {
		xn[i__ - 1] = a[i__ + idof * 3 - 4];
	    }
	}

/*     interpolating the material data */

	materialdata_sp__(&elcon[elcon_offset], &nelcon[3], imat, ntmat___, &
		i__, t1l, &elconloc[1], kode, &plicon[plicon_offset], &
		nplicon[nplicon_offset], npmat___, plconloc, ncmat___);

/*     calculating the spring constant */

	if (*kode == 2) {
	    xk = elconloc[1];
	} else {
	    niso = (integer) plconloc[800];
	    i__1 = niso;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		xiso[i__ - 1] = plconloc[(i__ << 1) - 2];
		yiso[i__ - 1] = plconloc[(i__ << 1) - 1];
	    }
	    ident_(xiso, &val, &niso, &id);
	    if (id == 0) {
		xk = 0.;
	    } else if (id == niso) {
		xk = 0.;
	    } else {
		xk = (yiso[id] - yiso[id - 1]) / (xiso[id] - xiso[id - 1]);
	    }
	}

/*        assembling the stiffness matrix */

	for (i__ = 1; i__ <= 3; ++i__) {
	    for (j = 1; j <= 3; ++j) {
		s[i__ + j * 60] = xk * xn[i__ - 1] * xn[j - 1];
	    }
	}
	return 0;
    } else if (*(unsigned char *)&lakonl[6] == '2') {

/*        spring2-element */
/*        determine the direction of action of the spring */

	idof1 = i_dnnt(&elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 3]);
	idof2 = i_dnnt(&elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 4]);

	if (*norien > 0) {
/* Computing MAX */
	    i__1 = 0, i__2 = ielorien[*nelem * ielorien_dim1 + 1];
	    iorien = max(i__1,i__2);
	} else {
	    iorien = 0;
	}

	if (iorien == 0) {
	    for (i__ = 1; i__ <= 3; ++i__) {
		xn1[i__ - 1] = 0.;
		xn2[i__ - 1] = 0.;
	    }
	    xn1[idof1 - 1] = 1.;
	    xn2[idof2 - 1] = 1.;
	} else {
	    transformatrix_(&orab[iorien * 7 + 1], &xl[4], a);
	    for (i__ = 1; i__ <= 3; ++i__) {
		xn1[i__ - 1] = a[i__ + idof1 * 3 - 4];
	    }
	    transformatrix_(&orab[iorien * 7 + 1], &xl[7], a);
	    for (i__ = 1; i__ <= 3; ++i__) {
		xn2[i__ - 1] = a[i__ + idof2 * 3 - 4];
	    }
	}

/*     interpolating the material data */

	materialdata_sp__(&elcon[elcon_offset], &nelcon[3], imat, ntmat___, &
		i__, t1l, &elconloc[1], kode, &plicon[plicon_offset], &
		nplicon[nplicon_offset], npmat___, plconloc, ncmat___);

/*        calculating the spring constant */

	if (*kode == 2) {
	    xk = elconloc[1];
	} else {
	    niso = (integer) plconloc[800];
	    i__1 = niso;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		xiso[i__ - 1] = plconloc[(i__ << 1) - 2];
		yiso[i__ - 1] = plconloc[(i__ << 1) - 1];
	    }
	    ident_(xiso, &val, &niso, &id);
	    if (id == 0) {
		xk = 0.;
	    } else if (id == niso) {
		xk = 0.;
	    } else {
		xk = (yiso[id] - yiso[id - 1]) / (xiso[id] - xiso[id - 1]);
	    }
	}

/*        assembling the stiffness matrix */

	for (i__ = 1; i__ <= 3; ++i__) {
	    for (j = 1; j <= 3; ++j) {
		s[i__ + j * 60] = xk * xn1[i__ - 1] * xn1[j - 1];
		s[i__ + (j + 3) * 60] = -xk * xn1[i__ - 1] * xn2[j - 1];
		s[i__ + 3 + j * 60] = -xk * xn2[i__ - 1] * xn1[j - 1];
		s[i__ + 3 + (j + 3) * 60] = xk * xn2[i__ - 1] * xn2[j - 1];
	    }
	}
	return 0;

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

/*     alpha and beta, taking the representative area into account */
/*     (conversion of pressure into force) */

    if ((integer) elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 3] == 1) {

/*        exponential overclosure */

	if ((d__1 = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 2], abs(
		d__1)) < 1e-30) {
	    elas[1] = 0.;
	    elas[2] = 0.;
	} else {
	    alpha = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 2] * 
		    springarea[1];
	    beta = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 1];
	    if (-beta * clear > 23. - log(alpha)) {
		beta = (log(alpha) - 23.) / clear;
	    }
	    elas[1] = exp(-beta * clear + log(alpha));
	    elas[2] = -beta * elas[1];
	}
    } else if ((integer) elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 3] == 
	    2) {

/*        linear overclosure */

	pi = atan(1.) * 4.;
	eps = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 1] * pi / elcon[(*
		imat * elcon_dim2 + 1) * elcon_dim1 + 2];
	elas[1] = -springarea[1] * elcon[(*imat * elcon_dim2 + 1) * 
		elcon_dim1 + 2] * clear * (atan(-clear / eps) / pi + .5);
/* Computing 2nd power */
	d__1 = clear / eps;
	elas[2] = -springarea[1] * elcon[(*imat * elcon_dim2 + 1) * 
		elcon_dim1 + 2] * (atan(-clear / eps) / pi + .5 - clear / (pi 
		* eps * (d__1 * d__1 + 1.)));
    } else if ((integer) elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 3] == 
	    3) {

/*        tabular overclosure */

/*        interpolating the material data */

	materialdata_sp__(&elcon[elcon_offset], &nelcon[3], imat, ntmat___, &
		i__, t1l, &elconloc[1], kode, &plicon[plicon_offset], &
		nplicon[nplicon_offset], npmat___, plconloc, ncmat___);
	overlap = -clear;
	niso = (integer) plconloc[800];
	i__1 = niso;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    xiso[i__ - 1] = plconloc[(i__ << 1) - 2];
	    yiso[i__ - 1] = plconloc[(i__ << 1) - 1];
	}
	ident_(xiso, &overlap, &niso, &id);
	if (id == 0) {
	    dpresdoverlap = 0.;
	    pres = yiso[0];
	} else if (id == niso) {
	    dpresdoverlap = 0.;
	    pres = yiso[niso - 1];
	} else {
	    dpresdoverlap = (yiso[id] - yiso[id - 1]) / (xiso[id] - xiso[id - 
		    1]);
	    pres = yiso[id - 1] + dpresdoverlap * (overlap - xiso[id - 1]);
	}
	elas[1] = springarea[1] * pres;
	elas[2] = -springarea[1] * dpresdoverlap;
    }

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

/*     Coulomb friction for static calculations */

    if (*ncmat___ >= 7) {
	um = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 6];
	if (um > 0.) {

/*     stiffness of shear stress versus slip curve */

	    xk = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 7] * 
		    springarea[1];

/*     calculating the relative displacement between the slave node */
/*     and its projection on the master surface */

	    for (i__ = 1; i__ <= 3; ++i__) {
		alnew[i__ - 1] = voldl[i__ + *nope * voldl_dim1];
		i__1 = nterms;
		for (j = 1; j <= i__1; ++j) {
		    alnew[i__ - 1] -= ratio[j - 1] * voldl[i__ + j * 
			    voldl_dim1];
		}
	    }

/*     calculating the difference in relative displacement since */
/*     the start of the increment = vec_s */

	    for (i__ = 1; i__ <= 3; ++i__) {
		al[i__ - 1] = alnew[i__ - 1] - xstateini[i__ + 3 + ((*ne0 + 
			konl[*nope + 1]) * xstateini_dim2 + 1) * 
			xstateini_dim1];
	    }

/*     s=||vec_s|| */

	    val = al[0] * xn[0] + al[1] * xn[1] + al[2] * xn[2];

/*     update the relative tangential displacement vec_t */

	    for (i__ = 1; i__ <= 3; ++i__) {
		t[i__ - 1] = xstateini[i__ + 6 + ((*ne0 + konl[*nope + 1]) * 
			xstateini_dim2 + 1) * xstateini_dim1] + al[i__ - 1] - 
			val * xn[i__ - 1];
	    }

/*     store the actual relative displacement and */
/*     the actual relative tangential displacement */

	    for (i__ = 1; i__ <= 3; ++i__) {
		xstate[i__ + 3 + ((*ne0 + konl[*nope + 1]) * xstate_dim2 + 1) 
			* xstate_dim1] = alnew[i__ - 1];
		xstate[i__ + 6 + ((*ne0 + konl[*nope + 1]) * xstate_dim2 + 1) 
			* xstate_dim1] = t[i__ - 1];
	    }

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
		    dval[i__ + k * 3 - 4] = al[0] * xmu[(i__ + k * 3) * 3 - 
			    12] + al[1] * xmu[(i__ + k * 3) * 3 - 11] + al[2] 
			    * xmu[(i__ + k * 3) * 3 - 10] - val * dxmu[i__ + 
			    k * 3 - 4] + xm[0] * dal[(i__ + k * 3) * 3 - 12] 
			    + xm[1] * dal[(i__ + k * 3) * 3 - 11] + xm[2] * 
			    dal[(i__ + k * 3) * 3 - 10];
		}
	    }

/*     d vec_t/d vec_u_k */

	    i__1 = *nope;
	    for (k = 1; k <= i__1; ++k) {
		for (j = 1; j <= 3; ++j) {
		    for (i__ = 1; i__ <= 3; ++i__) {
			tu[i__ + (j + k * 3) * 3 - 13] = dal[i__ + (j + k * 3)
				 * 3 - 13] - c1 * (xn[i__ - 1] * (dval[j + k *
				 3 - 4] - val * dxmu[j + k * 3 - 4]) + val * 
				xmu[i__ + (j + k * 3) * 3 - 13]);
		    }
		}
	    }

/*     size of normal force */

/* Computing 2nd power */
	    d__1 = fnl[0];
/* Computing 2nd power */
	    d__2 = fnl[1];
/* Computing 2nd power */
	    d__3 = fnl[2];
	    dfnl = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);

/*     maximum size of shear force */

	    dfshear = um * dfnl;

/*     plastic and elastic slip */

	    for (i__ = 1; i__ <= 3; ++i__) {
		tp[i__ - 1] = xstateini[i__ + ((*ne0 + konl[*nope + 1]) * 
			xstateini_dim2 + 1) * xstateini_dim1];
		te[i__ - 1] = t[i__ - 1] - tp[i__ - 1];
	    }

/*     the force due to normal contact is in -xn */
/*     direction (internal force) -> minus signs */

	    i__1 = *nope;
	    for (k = 1; k <= i__1; ++k) {
		for (i__ = 1; i__ <= 3; ++i__) {
		    dfn[i__ + k * 3 - 4] = -xn[0] * fpu[(i__ + k * 3) * 3 - 
			    12] - xn[1] * fpu[(i__ + k * 3) * 3 - 11] - xn[2] 
			    * fpu[(i__ + k * 3) * 3 - 10];
		}
	    }

	    dte = sqrt(te[0] * te[0] + te[1] * te[1] + te[2] * te[2]);

/*     trial force */

	    for (i__ = 1; i__ <= 3; ++i__) {
		ftrial[i__ - 1] = xk * te[i__ - 1];
	    }
/* Computing 2nd power */
	    d__1 = ftrial[0];
/* Computing 2nd power */
	    d__2 = ftrial[1];
/* Computing 2nd power */
	    d__3 = ftrial[2];
	    dftrial = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);

/*     check whether stick or slip */

	    if (dftrial < dfshear || dftrial <= 0.) {

/*     stick force */

		for (i__ = 1; i__ <= 3; ++i__) {
		    fnl[i__ - 1] += ftrial[i__ - 1];
		    xstate[i__ + ((*ne0 + konl[*nope + 1]) * xstate_dim2 + 1) 
			    * xstate_dim1] = tp[i__ - 1];
		}

/*     stick stiffness */

		i__1 = *nope;
		for (k = 1; k <= i__1; ++k) {
		    for (j = 1; j <= 3; ++j) {
			for (i__ = 1; i__ <= 3; ++i__) {
			    fpu[i__ + (j + k * 3) * 3 - 13] += xk * tu[i__ + (
				    j + k * 3) * 3 - 13];
			}
		    }
		}
	    } else {

/*     slip force */

		dg = (dftrial - dfshear) / xk;
		for (i__ = 1; i__ <= 3; ++i__) {
		    ftrial[i__ - 1] = te[i__ - 1] / dte;
		    fnl[i__ - 1] += dfshear * ftrial[i__ - 1];
		    xstate[i__ + ((*ne0 + konl[*nope + 1]) * xstate_dim2 + 1) 
			    * xstate_dim1] = tp[i__ - 1] + dg * ftrial[i__ - 
			    1];
		}

/*     slip stiffness */

		c1 = xk * dfshear / dftrial;
		for (i__ = 1; i__ <= 3; ++i__) {
		    for (j = 1; j <= 3; ++j) {
			dftdt[i__ + j * 3 - 4] = -c1 * ftrial[i__ - 1] * 
				ftrial[j - 1];
		    }
		    dftdt[i__ + i__ * 3 - 4] += c1;
		}

		i__1 = *nope;
		for (k = 1; k <= i__1; ++k) {
		    for (j = 1; j <= 3; ++j) {
			for (i__ = 1; i__ <= 3; ++i__) {
			    for (l = 1; l <= 3; ++l) {
				fpu[i__ + (j + k * 3) * 3 - 13] += dftdt[i__ 
					+ l * 3 - 4] * tu[l + (j + k * 3) * 3 
					- 13];
			    }
			    if (*nmethod != 4 || iperturb[1] > 1) {
				fpu[i__ + (j + k * 3) * 3 - 13] += um * 
					ftrial[i__ - 1] * dfn[j + k * 3 - 4];
			    }
			}
		    }
		}
	    }
	}
    }

/*     determining the stiffness matrix contributions */

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
} /* springstiff_n2f__ */

