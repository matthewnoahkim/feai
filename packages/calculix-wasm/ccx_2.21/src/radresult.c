/* radresult.f -- translated by f2c (version 20200916).
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
static doublereal c_b5 = .25;


/*     CalculiX - A 3-dimensional finite element program */
/*     Copyright (C) 1998-2023 Guido Dhondt */

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

/* Subroutine */ int radresult_(integer *ntr, doublereal *xloadact, 
	doublereal *bcr, integer *nloadtr, doublereal *tarea, doublereal *
	tenv, doublereal *physcon, doublereal *erad, doublereal *auview, 
	doublereal *fenv, integer *irowrad, integer *jqrad, integer *nzsrad, 
	doublereal *q)
{
    /* System generated locals */
    integer i__1, i__2;
    doublereal d__1, d__2;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);
    double pow_dd(doublereal *, doublereal *);

    /* Local variables */
    integer i__, j, k;

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 6, 0, 0, 0 };






/*     calculating the flux and transforming the flux into an */
/*     equivalent temperature */

    /* Parameter adjustments */
    --bcr;
    xloadact -= 3;
    --nloadtr;
    --tarea;
    --tenv;
    --physcon;
    --erad;
    --auview;
    --fenv;
    --irowrad;
    --jqrad;
    --q;

    /* Function Body */
    s_wsle(&io___1);
    do_lio(&c__9, &c__1, "", (ftnlen)0);
    e_wsle();

    i__1 = *ntr;
    for (i__ = 1; i__ <= i__1; ++i__) {
	q[i__] = bcr[i__];
    }

/*        lower triangle */

    i__1 = *ntr;
    for (i__ = 1; i__ <= i__1; ++i__) {
	i__2 = jqrad[i__ + 1] - 1;
	for (j = jqrad[i__]; j <= i__2; ++j) {
	    k = irowrad[j];
	    q[k] -= auview[j] * bcr[i__];

/*        upper triangle */

	    q[i__] -= auview[*nzsrad + j] * bcr[k];
	}
    }

    i__1 = *ntr;
    for (i__ = 1; i__ <= i__1; ++i__) {
	j = nloadtr[i__];
/* Computing 4th power */
	d__1 = tenv[i__], d__1 *= d__1;
	q[i__] -= fenv[i__] * physcon[2] * (d__1 * d__1);
/* Computing MAX */
/* Computing 4th power */
	d__2 = tarea[i__], d__2 *= d__2;
	d__1 = d__2 * d__2 - q[i__] / (erad[i__] * physcon[2]);
	xloadact[(j << 1) + 2] = max(d__1,0.);
	xloadact[(j << 1) + 2] = pow_dd(&xloadact[(j << 1) + 2], &c_b5) + 
		physcon[1];
    }

    return 0;
} /* radresult_ */

