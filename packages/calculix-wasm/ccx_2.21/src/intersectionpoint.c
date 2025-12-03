/* intersectionpoint.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int intersectionpoint_(doublereal *pa, doublereal *pb, 
	doublereal *xcp, doublereal *t, doublereal *xinters)
{
    /* System generated locals */
    doublereal d__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    integer k;
    doublereal pab[3], diff;
    extern /* Subroutine */ int exit_(integer *);
    doublereal tnull;
    extern doublereal eplane_(doublereal *, doublereal *, doublereal *);

    /* Fortran I/O blocks */
    static cilist io___5 = { 0, 6, 0, 0, 0 };
    static cilist io___6 = { 0, 6, 0, 0, 0 };






    /* Parameter adjustments */
    --xinters;
    --xcp;
    --pb;
    --pa;

    /* Function Body */
    for (k = 1; k <= 3; ++k) {
	pab[k - 1] = pb[k] - pa[k];
    }

    diff = 0.;
    tnull = 0.;

    if ((d__1 = eplane_(pab, &xcp[1], &tnull), abs(d__1)) < 1e-13) {
	s_wsle(&io___5);
	do_lio(&c__9, &c__1, "SH: IP no intersection point can be found", (
		ftnlen)41);
	e_wsle();
	s_wsle(&io___6);
	do_lio(&c__9, &c__1, "SH: IP pab paralell to plane! ", (ftnlen)30);
	e_wsle();
	exit_(&c__201);
    } else {
	diff = -eplane_(&pa[1], &xcp[1], t) / eplane_(pab, &xcp[1], &tnull);
    }
    for (k = 1; k <= 3; ++k) {
	xinters[k] = pa[k] + diff * pab[k - 1];
    }
    return 0;
} /* intersectionpoint_ */

