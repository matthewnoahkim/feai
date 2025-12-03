/* springforc_n2f.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int springforc_n2f__(doublereal *xl, integer *konl, 
	doublereal *vl, integer *imat, doublereal *elcon, integer *nelcon, 
	doublereal *elas, doublereal *fnl, integer *ncmat___, integer *
	ntmat___, integer *nope, char *lakonl, doublereal *t1l, integer *kode,
	 doublereal *elconloc, doublereal *plicon, integer *nplicon, integer *
	npmat___, doublereal *senergy, integer *nener, doublereal *cstr, 
	integer *mi, doublereal *springarea, integer *nmethod, integer *ne0, 
	integer *nstate___, doublereal *xstateini, doublereal *xstate, 
	doublereal *reltime, integer *ielas, doublereal *venergy, integer *
	ielorien, doublereal *orab, integer *norien, integer *nelem, 
	doublereal *smscale, integer *mscalmethod, ftnlen lakonl_len)
{
    /* System generated locals */
    integer nplicon_dim1, nplicon_offset, ielorien_dim1, ielorien_offset, 
	    vl_dim1, vl_offset, elcon_dim1, elcon_dim2, elcon_offset, 
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
    integer i__, j;
    extern /* Subroutine */ int shape3tri_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *)
	    ;
    doublereal t[3];
    extern /* Subroutine */ int shape6tri_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *)
	    ;
    doublereal t1[3], t2[3], dd, dg;
    integer id;
    doublereal al[3], dm, fk, te[3], et, pi, pl[30]	/* was [3][10] */, xi,
	     xk, tp[3], xn[3], um, dd0, dt1, xn1[3], xn2[3], xs2[21]	/* 
	    was [3][7] */, dte, val, eps, shp2[63]	/* was [7][9] */, 
	    xsj2[3], overclosure, beta;
    integer idof;
    doublereal dfnl, dist;
    integer niso;
    doublereal pres;
    extern /* Subroutine */ int exit_(integer *);
    doublereal xiso[200], yiso[200];
    integer idof1, idof2, iflag;
    doublereal alpha, clear;
    extern /* Subroutine */ int ident_(doublereal *, doublereal *, integer *, 
	    integer *);
    doublereal alnew[3], ratio[9], pproj[3], ftrial[3];
    integer iorien, nterms;
    extern /* Subroutine */ int calcspringforc_(integer *, doublereal *, 
	    integer *, integer *, integer *, doublereal *, integer *, 
	    doublereal *, integer *, integer *, doublereal *, integer *, 
	    doublereal *, doublereal *), shape4q_(doublereal *, doublereal *, 
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
    static cilist io___45 = { 0, 6, 0, 0, 0 };
    static cilist io___46 = { 0, 6, 0, 0, 0 };
    static cilist io___47 = { 0, 6, 0, 0, 0 };
    static cilist io___48 = { 0, 6, 0, 0, 0 };



/*     calculates the force of the spring (node-to-face penalty) */




    /* Parameter adjustments */
    xl -= 4;
    --konl;
    nelcon -= 3;
    --elas;
    fnl -= 4;
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
    --cstr;
    --mi;
    ielorien_dim1 = mi[3];
    ielorien_offset = 1 + ielorien_dim1;
    ielorien -= ielorien_offset;
    vl_dim1 = mi[2] - 0 + 1;
    vl_offset = 0 + vl_dim1;
    vl -= vl_offset;
    --springarea;
    xstate_dim1 = *nstate___;
    xstate_dim2 = mi[1];
    xstate_offset = 1 + xstate_dim1 * (1 + xstate_dim2);
    xstate -= xstate_offset;
    xstateini_dim1 = *nstate___;
    xstateini_dim2 = mi[1];
    xstateini_offset = 1 + xstateini_dim1 * (1 + xstateini_dim2);
    xstateini -= xstateini_offset;
    orab -= 8;
    --smscale;

    /* Function Body */
    iflag = 2;

/*     actual positions of the nodes belonging to the contact spring */
/*     (otherwise no contact force) */

    if (*nmethod != 2) {
	i__1 = *nope;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    for (j = 1; j <= 3; ++j) {
		pl[j + i__ * 3 - 4] = xl[j + i__ * 3] + vl[j + i__ * vl_dim1];
	    }
	}
    } else {

/*        for frequency calculations the eigenmodes are freely */
/*        scalable, leading to problems with contact finding */

	i__1 = *nope;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    for (j = 1; j <= 3; ++j) {
		pl[j + i__ * 3 - 4] = xl[j + i__ * 3];
	    }
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
		do_lio(&c__9, &c__1, "*ERROR in springforc_n2f: spring conne"
			"cts", (ftnlen)41);
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

/*           calculating the spring force and the spring energy */

	    calcspringforc_(imat, &elcon[elcon_offset], &nelcon[3], ncmat___, 
		    ntmat___, t1l, kode, &plicon[plicon_offset], &nplicon[
		    nplicon_offset], npmat___, senergy, nener, &fk, &val);

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
	    overclosure = -dd - xn[0] * (vl[(vl_dim1 << 1) + 1] - vl[vl_dim1 
		    + 1]) - xn[1] * (vl[(vl_dim1 << 1) + 2] - vl[vl_dim1 + 2])
		     - xn[2] * (vl[(vl_dim1 << 1) + 3] - vl[vl_dim1 + 3]);
	    fk = -xk * overclosure * (atan(overclosure / eps) / pi + .5);
	}

	for (i__ = 1; i__ <= 3; ++i__) {
	    fnl[i__ + 3] = -fk * xn[i__ - 1];
	    fnl[i__ + 6] = fk * xn[i__ - 1];
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

/*        change in spring length */

	val = vl[vl_dim1 + 1] * xn[0] + vl[vl_dim1 + 2] * xn[1] + vl[vl_dim1 
		+ 3] * xn[2];

/*        calculating the spring force and the spring energy */

	calcspringforc_(imat, &elcon[elcon_offset], &nelcon[3], ncmat___, 
		ntmat___, t1l, kode, &plicon[plicon_offset], &nplicon[
		nplicon_offset], npmat___, senergy, nener, &fk, &val);

	for (i__ = 1; i__ <= 3; ++i__) {
	    fnl[i__ + 3] = fk * xn[i__ - 1];
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

/*        change in spring length */

	val = vl[vl_dim1 + 1] * xn1[0] + vl[vl_dim1 + 2] * xn1[1] + vl[
		vl_dim1 + 3] * xn1[2] - (vl[(vl_dim1 << 1) + 1] * xn2[0] + vl[
		(vl_dim1 << 1) + 2] * xn2[1] + vl[(vl_dim1 << 1) + 3] * xn2[2]
		);

/*        calculating the spring force and the spring energy */

	calcspringforc_(imat, &elcon[elcon_offset], &nelcon[3], ncmat___, 
		ntmat___, t1l, kode, &plicon[plicon_offset], &nplicon[
		nplicon_offset], npmat___, senergy, nener, &fk, &val);

	for (i__ = 1; i__ <= 3; ++i__) {
	    fnl[i__ + 3] = fk * xn1[i__ - 1];
	    fnl[i__ + 6] = -fk * xn2[i__ - 1];
	}
	return 0;
    }

    nterms = *nope - 1;

/*     vector al connects the dependent node with its projection */
/*     on the independent face = vec_r (User's */
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
	shape8q_(&xi, &et, pl, xsj2, xs2, shp2, &iflag);
    } else if (nterms == 4) {
	shape4q_(&xi, &et, pl, xsj2, xs2, shp2, &iflag);
    } else if (nterms == 6) {
	shape6tri_(&xi, &et, pl, xsj2, xs2, shp2, &iflag);
    } else {
	shape3tri_(&xi, &et, pl, xsj2, xs2, shp2, &iflag);
    }

/*     normal on the surface */

    dm = sqrt(xsj2[0] * xsj2[0] + xsj2[1] * xsj2[1] + xsj2[2] * xsj2[2]);
    for (i__ = 1; i__ <= 3; ++i__) {
	xn[i__ - 1] = xsj2[i__ - 1] / dm;
    }

/*     distance from surface along normal (= clearance) */

    clear = al[0] * xn[0] + al[1] * xn[1] + al[2] * xn[2];

/*     check for a reduction of the initial penetration, if any */

    if (*nmethod == 1) {
	clear -= springarea[2] * (1. - *reltime);
    }
    cstr[1] = clear;

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

    if ((integer) elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 3] == 1) {

/*        exponential overclosure */

	if ((d__1 = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 2], abs(
		d__1)) < 1e-30) {
	    elas[1] = 0.;
	    beta = 1.;
	} else {

	    alpha = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 2] * 
		    springarea[1];
	    beta = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 1];
	    if (-beta * clear > 23. - log(alpha)) {
		beta = (log(alpha) - 23.) / clear;
	    }
	    elas[1] = exp(-beta * clear + log(alpha));
	}
	if (*nener == 1) {
	    *senergy = elas[1] / beta;
	}
    } else if ((integer) elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 3] == 
	    2) {

/*        linear overclosure */

/*     MPADD start */
	if (*nmethod == 4) {

/*     Conputation of the force (only if negative clearance) */
/*       the energy is computed with the exact potential */

	    if (clear <= 0.) {
		pi = atan(1.) * 4.;
		xk = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 2];

/*              spring scaling for explicit dynamics */

		if (*mscalmethod == 2 || *mscalmethod == 3) {
		    xk *= smscale[*nelem];
		}

		eps = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 1] * pi / 
			xk;
		elas[1] = -springarea[1] * xk * clear * (atan(-clear / eps) / 
			pi + .5);
		if (*nener == 1) {
/* Computing 2nd power */
		    d__1 = clear;
/* Computing 2nd power */
		    d__2 = clear;
/* Computing 2nd power */
		    d__3 = eps;
		    *senergy = springarea[1] * xk * (d__1 * d__1 / 4. + (atan(
			    -clear / eps) * .5 * (d__2 * d__2) + (eps * clear 
			    + atan(-clear / eps) * (d__3 * d__3)) * .5) / pi);
		}
	    } else {
		elas[1] = 0.;
		if (*nener == 1) {
		    *senergy = 0.;
		}
	    }

	} else {
	    pi = atan(1.) * 4.;
	    eps = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 1] * pi / 
		    elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 2];
	    elas[1] = -springarea[1] * elcon[(*imat * elcon_dim2 + 1) * 
		    elcon_dim1 + 2] * clear * (atan(-clear / eps) / pi + .5);
/*               write(*,*) 'springforc_n2f.f',clear,springarea(1),elas(1) */
	    if (*nener == 1) {
		*senergy = -elas[1] * clear / 2.;
	    }
	}
/*     MPADD end */
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
	    pres = yiso[0];
	    if (*nener == 1) {
		*senergy = yiso[0] * overlap;
	    }
	} else if (id == niso) {
	    pres = yiso[niso - 1];
	    if (*nener == 1) {
		*senergy = yiso[0] * xiso[0];
		i__1 = niso;
		for (i__ = 2; i__ <= i__1; ++i__) {
		    *senergy += (xiso[i__ - 1] - xiso[i__ - 2]) * (yiso[i__ - 
			    1] + yiso[i__ - 2]) / 2.;
		}
		*senergy += (pres - xiso[niso - 1]) * yiso[niso - 1];
	    }
	} else {
	    xk = (yiso[id] - yiso[id - 1]) / (xiso[id] - xiso[id - 1]);
	    pres = yiso[id - 1] + xk * (overlap - xiso[id - 1]);
	    if (*nener == 1) {
		*senergy = yiso[0] * xiso[0];
		i__1 = id;
		for (i__ = 2; i__ <= i__1; ++i__) {
		    *senergy += (xiso[i__ - 1] - xiso[i__ - 2]) * (yiso[i__ - 
			    1] + yiso[i__ - 2]) / 2.;
		}
		*senergy += (overlap - xiso[id - 1]) * (pres + yiso[id - 1]) /
			 2.;
	    }
	}
	elas[1] = springarea[1] * pres;
	if (*nener == 1) {
	    *senergy = springarea[1] * *senergy;
	}
    } else {
	s_wsle(&io___45);
	do_lio(&c__9, &c__1, "*ERROR in springforc: no overclosure model", (
		ftnlen)42);
	e_wsle();
	s_wsle(&io___46);
	do_lio(&c__9, &c__1, "       selected. This is mandatory in a penalty"
		, (ftnlen)47);
	e_wsle();
	s_wsle(&io___47);
	do_lio(&c__9, &c__1, "       contact calculation. Please use the", (
		ftnlen)42);
	e_wsle();
	s_wsle(&io___48);
	do_lio(&c__9, &c__1, "       *SURFACE BEHAVIOR card.", (ftnlen)30);
	e_wsle();
	exit_(&c__201);
    }

/*     forces in the nodes of the contact element */

    for (i__ = 1; i__ <= 3; ++i__) {
	fnl[i__ + *nope * 3] = -elas[1] * xn[i__ - 1];
    }
    cstr[4] = elas[1] / springarea[1];

/*     Coulomb friction for static calculations */

    if (*ncmat___ >= 7) {
	um = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 6];
	if (um > 0.) {
	    if (1. - abs(xn[0]) < 1.5231e-6) {

/*     calculating the local directions on master surface */

		t1[0] = -xn[2] * xn[0];
		t1[1] = -xn[2] * xn[1];
		t1[2] = 1. - xn[2] * xn[2];
	    } else {
		t1[0] = 1. - xn[0] * xn[0];
		t1[1] = -xn[0] * xn[1];
		t1[2] = -xn[0] * xn[2];
	    }
	    dt1 = sqrt(t1[0] * t1[0] + t1[1] * t1[1] + t1[2] * t1[2]);
	    for (i__ = 1; i__ <= 3; ++i__) {
		t1[i__ - 1] /= dt1;
	    }
	    t2[0] = xn[1] * t1[2] - xn[2] * t1[1];
	    t2[1] = xn[2] * t1[0] - xn[0] * t1[2];
	    t2[2] = xn[0] * t1[1] - xn[1] * t1[0];

/*     linear stiffness of the shear stress versus */
/*     slip curve */

	    xk = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 7] * 
		    springarea[1];

/*           spring scaling for explicit dynamics */

	    if (*mscalmethod == 2 || *mscalmethod == 3) {
		xk *= smscale[*nelem];
	    }

/*     calculating the relative displacement between the slave node */
/*     and its projection on the master surface */

	    for (i__ = 1; i__ <= 3; ++i__) {
		alnew[i__ - 1] = vl[i__ + *nope * vl_dim1];
		i__1 = nterms;
		for (j = 1; j <= i__1; ++j) {
		    alnew[i__ - 1] -= ratio[j - 1] * vl[i__ + j * vl_dim1];
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

/*     size of normal force */

/* Computing 2nd power */
	    d__1 = fnl[*nope * 3 + 1];
/* Computing 2nd power */
	    d__2 = fnl[*nope * 3 + 2];
/* Computing 2nd power */
	    d__3 = fnl[*nope * 3 + 3];
	    dfnl = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);

/*     maximum size of shear force */

	    dfshear = um * dfnl;

/*     plastic and elastic slip */

	    for (i__ = 1; i__ <= 3; ++i__) {
		tp[i__ - 1] = xstateini[i__ + ((*ne0 + konl[*nope + 1]) * 
			xstateini_dim2 + 1) * xstateini_dim1];
		te[i__ - 1] = t[i__ - 1] - tp[i__ - 1];
	    }
	    dte = sqrt(te[0] * te[0] + te[1] * te[1] + te[2] * te[2]);

/*     trial force */

	    for (i__ = 1; i__ <= 3; ++i__) {
		ftrial[i__ - 1] = xk * te[i__ - 1];
	    }
	    dftrial = xk * dte;

/*     check whether stick or slip */

	    if (dftrial < dfshear || dftrial <= 0. || *ielas == 1) {

/*     stick */

/*     write(*,*)'STICK' */
		for (i__ = 1; i__ <= 3; ++i__) {
		    fnl[i__ + *nope * 3] += ftrial[i__ - 1];
		    xstate[i__ + ((*ne0 + konl[*nope + 1]) * xstate_dim2 + 1) 
			    * xstate_dim1] = tp[i__ - 1];
		}
		cstr[5] = (ftrial[0] * t1[0] + ftrial[1] * t1[1] + ftrial[2] *
			 t1[2]) / springarea[1];
		cstr[6] = (ftrial[0] * t2[0] + ftrial[1] * t2[1] + ftrial[2] *
			 t2[2]) / springarea[1];

/*              shear elastic energy */

		if (*nener == 1) {
		    *senergy += dftrial * dte / 2.;
		}
	    } else {

/*     slip */

		dg = (dftrial - dfshear) / xk;
		for (i__ = 1; i__ <= 3; ++i__) {
		    ftrial[i__ - 1] = te[i__ - 1] / dte;
		    fnl[i__ + *nope * 3] += dfshear * ftrial[i__ - 1];
		    xstate[i__ + ((*ne0 + konl[*nope + 1]) * xstate_dim2 + 1) 
			    * xstate_dim1] = tp[i__ - 1] + dg * ftrial[i__ - 
			    1];
		}
		cstr[5] = (dfshear * ftrial[0] * t1[0] + dfshear * ftrial[1] *
			 t1[1] + dfshear * ftrial[2] * t1[2]) / springarea[1];
		cstr[6] = (dfshear * ftrial[0] * t2[0] + dfshear * ftrial[1] *
			 t2[1] + dfshear * ftrial[2] * t2[2]) / springarea[1];

/*              shear elastic and viscous energy */

		if (*nener == 1) {
		    *senergy += dfshear * dfshear / (xk * 2.);
		    *venergy += dg * dfshear;
		}

	    }
	}

/*     storing the tangential displacements */

	cstr[2] = t[0] * t1[0] + t[1] * t1[1] + t[2] * t1[2];
	cstr[3] = t[0] * t2[0] + t[1] * t2[1] + t[2] * t2[2];
    }

/*     force in the master nodes */

    for (i__ = 1; i__ <= 3; ++i__) {
	i__1 = nterms;
	for (j = 1; j <= i__1; ++j) {
	    fnl[i__ + j * 3] = -ratio[j - 1] * fnl[i__ + *nope * 3];
	}
    }

    return 0;
} /* springforc_n2f__ */

