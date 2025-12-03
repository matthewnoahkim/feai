/* subspace.f -- translated by f2c (version 20200916).
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
static integer c__3 = 3;
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

/* Subroutine */ int subspace_(doublereal *d__, doublereal *aa, doublereal *
	bb, doublereal *cc, doublereal *alpham, doublereal *betam, integer *
	nev, doublereal *xini, doublereal *cd, doublereal *cv, doublereal *
	time, doublereal *rwork, integer *lrw, integer *m, integer *jout, 
	doublereal *rpar, doublereal *bj, integer *iwork, integer *liw, 
	integer *iddebdf, doublereal *bjp)
{
    /* System generated locals */
    integer cc_dim1, cc_offset, i__1, i__2;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    integer i__, j;
    extern /* Subroutine */ int df_();
    integer id, iaa, ibb, nev2;
    extern /* Subroutine */ int djac_();
    integer idid, info[15];
    doublereal atol;
    extern /* Subroutine */ int exit_(integer *);
    doublereal rtol;
    static doublereal time0;
    extern /* Subroutine */ int ddebdf_(U_fp, integer *, doublereal *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     integer *, doublereal *, integer *, integer *, integer *, 
	    doublereal *, integer *, U_fp), ddeabm_(U_fp, integer *, 
	    doublereal *, doublereal *, doublereal *, integer *, doublereal *,
	     doublereal *, integer *, doublereal *, integer *, integer *, 
	    integer *, doublereal *, integer *);

    /* Fortran I/O blocks */
    static cilist io___12 = { 0, 6, 0, 0, 0 };
    static cilist io___13 = { 0, 6, 0, 0, 0 };
    static cilist io___14 = { 0, 6, 0, 0, 0 };
    static cilist io___15 = { 0, 6, 0, 0, 0 };
    static cilist io___16 = { 0, 6, 0, 0, 0 };



/*     solves the linear dynamic equations mapped on the subspace */
/*     of the eigenvectors (only if there are dashpots in the */
/*     model) */







    /* Parameter adjustments */
    --d__;
    cc_dim1 = *nev;
    cc_offset = 1 + cc_dim1;
    cc -= cc_offset;
    --bb;
    --aa;
    --xini;
    --cd;
    --cv;
    --rwork;
    --rpar;
    --bj;
    --iwork;
    --bjp;

    /* Function Body */
    nev2 = *nev << 1;

/*     transferring fields into global field rpar */
/*     (needed for subroutine fd) */
/*     rpar contains (field, size): m+0.5, 1 */
/*                                  alpham, 1 */
/*                                  betam, 1 */
/*                                  cc, nev**2 */
/*                                  d, nev */
/*                                  time */
/*                                  aa(1)..aa(nev), nev */
/*                                  bb(1)..bb(nev), nev */

    if (*m == 1) {
	rpar[2] = *alpham;
	rpar[3] = *betam;
	i__1 = *nev;
	for (j = 1; j <= i__1; ++j) {
	    i__2 = *nev;
	    for (i__ = 1; i__ <= i__2; ++i__) {
		rpar[(j - 1) * *nev + 3 + i__] = cc[i__ + j * cc_dim1];
	    }
	}
	id = *nev * *nev + 3;
	i__1 = *nev;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    rpar[id + i__] = d__[i__];
	}

/*        copying the initial conditions for the system of first order */
/*        differential equations */

	i__1 = *nev;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    xini[i__] = cd[i__];
	    xini[*nev + i__] = cv[i__];
	}
    }

    iaa = *nev * (*nev + 1) + 4;
    rpar[iaa] = *time;
    ibb = iaa + *nev;
    i__1 = *nev;
    for (i__ = 1; i__ <= i__1; ++i__) {
	rpar[iaa + i__] = aa[i__];
	rpar[ibb + i__] = bb[i__];
    }

    for (i__ = 1; i__ <= 3; ++i__) {
	info[i__ - 1] = 0;
    }
    info[3] = 1;
    info[4] = 1;
    info[5] = 0;
    rwork[1] = *time;

/*     absolute and relative tolerance for dderkf */

    rtol = 1e-5;
    atol = .001;

    if (*iddebdf == 0) {
	ddeabm_((U_fp)df_, &nev2, &time0, &xini[1], time, info, &rtol, &atol, 
		&idid, &rwork[1], lrw, &iwork[1], liw, &rpar[1], nev);

	if (idid != 2 && idid != 3) {
	    s_wsle(&io___12);
	    do_lio(&c__9, &c__1, "*WARNING in subspace: ddeabm did not conve"
		    "rge properly", (ftnlen)54);
	    e_wsle();
	    s_wsle(&io___13);
	    do_lio(&c__9, &c__1, "         idid= ", (ftnlen)15);
	    do_lio(&c__3, &c__1, (char *)&idid, (ftnlen)sizeof(integer));
	    e_wsle();
	    s_wsle(&io___14);
	    do_lio(&c__9, &c__1, "         switch to routine ddebdf", (ftnlen)
		    33);
	    e_wsle();
	    *iddebdf = 2;
	    return 0;
	}
    } else {
	ddebdf_((U_fp)df_, &nev2, &time0, &xini[1], time, info, &rtol, &atol, 
		&idid, &rwork[1], lrw, &iwork[1], liw, &rpar[1], nev, (U_fp)
		djac_);
	if (idid != 2 && idid != 3) {
	    s_wsle(&io___15);
	    do_lio(&c__9, &c__1, "*ERROR in subspace: ddebdf did not converg"
		    "e properly", (ftnlen)52);
	    e_wsle();
	    s_wsle(&io___16);
	    do_lio(&c__9, &c__1, "       idid= ", (ftnlen)13);
	    do_lio(&c__3, &c__1, (char *)&idid, (ftnlen)sizeof(integer));
	    e_wsle();
	    exit_(&c__201);
	}
    }

/*     copying the solution into field bj */

    i__1 = *nev;
    for (i__ = 1; i__ <= i__1; ++i__) {
	bj[i__] = xini[i__];
	bjp[i__] = xini[*nev + i__];
    }

    return 0;
} /* subspace_ */


/*     subroutine df expressing the first order derivative as a function */
/*     of time and the function itself */

/* Subroutine */ int df_(doublereal *x, doublereal *u, doublereal *uprime, 
	doublereal *rpar, integer *nev)
{
    /* System generated locals */
    integer i__1, i__2;

    /* Local variables */
    integer i__, j, id, iaa, ibb;





    /* Parameter adjustments */
    --rpar;
    --uprime;
    --u;

    /* Function Body */
    iaa = *nev * (*nev + 1) + 4;
    ibb = iaa + *nev;
    id = *nev * *nev + 3;

    i__1 = *nev;
    for (i__ = 1; i__ <= i__1; ++i__) {
	uprime[i__] = u[*nev + i__];
	uprime[*nev + i__] = rpar[iaa + i__] + *x * rpar[ibb + i__] - rpar[id 
		+ i__] * rpar[id + i__] * u[i__] - (rpar[2] + rpar[3] * rpar[
		id + i__] * rpar[id + i__]) * u[*nev + i__];

/*        contribution of the dashpots */

	i__2 = *nev;
	for (j = 1; j <= i__2; ++j) {
	    uprime[*nev + i__] -= rpar[(j - 1) * *nev + 3 + i__] * u[*nev + j]
		    ;
	}
    }

    return 0;
} /* df_ */


/*     subroutine djac */

/* Subroutine */ int djac_(doublereal *x, doublereal *u, doublereal *pd, 
	integer *nrowpd, doublereal *rpar, integer *nev)
{
    /* System generated locals */
    integer pd_dim1, pd_offset, i__1, i__2;

    /* Local variables */
    integer i__, j, id;





    /* Parameter adjustments */
    --u;
    pd_dim1 = *nrowpd;
    pd_offset = 1 + pd_dim1;
    pd -= pd_offset;
    --rpar;

    /* Function Body */
    id = *nev * *nev + 3;

    i__1 = *nev;
    for (i__ = 1; i__ <= i__1; ++i__) {
	pd[i__ + (*nev + i__) * pd_dim1] = 1.;
	pd[*nev + i__ + i__ * pd_dim1] = -rpar[id + i__] * rpar[id + i__];
	pd[*nev + i__ + (*nev + i__) * pd_dim1] = -(rpar[2] + rpar[3] * rpar[
		id + i__] * rpar[id + i__]);

/*        contribution of the dashpots */

	i__2 = *nev;
	for (j = 1; j <= i__2; ++j) {
	    pd[*nev + i__ + (*nev + j) * pd_dim1] -= rpar[(j - 1) * *nev + 3 
		    + i__];
	}
    }

    return 0;
} /* djac_ */

