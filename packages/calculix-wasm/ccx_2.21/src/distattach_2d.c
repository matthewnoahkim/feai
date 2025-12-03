/* distattach_2d.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int distattach_2d__(doublereal *xig, doublereal *etg, 
	doublereal *pneigh, doublereal *pnode, doublereal *a, doublereal *p, 
	doublereal *ratio, integer *nterms)
{
    /* System generated locals */
    integer i__1;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    integer i__, j;
    doublereal a2, et, xi, et2, xi2, etm, etp, xim, xip, etm2, xim2;
    extern /* Subroutine */ int exit_(integer *);

    /* Fortran I/O blocks */
    static cilist io___12 = { 0, 6, 0, 0, 0 };
    static cilist io___13 = { 0, 6, 0, 0, 0 };



/*     calculates the distance between the node with coordinates */
/*     in "pnode" and the node with local coordinates xig and etg */
/*     in a face described by "nterms" nodes with coordinates */
/*     in pneigh */




    /* Parameter adjustments */
    --ratio;
    --p;
    --pnode;
    pneigh -= 4;

    /* Function Body */
    if (*nterms == 3) {
	if (*xig + *etg <= 0.) {
	    ratio[2] = (*xig + 1.) / 2.;
	    ratio[3] = (*etg + 1.) / 2.;
	} else {
	    ratio[2] = (1. - *etg) / 2.;
	    ratio[3] = (1. - *xig) / 2.;
	}
	ratio[1] = 1. - ratio[2] - ratio[3];
    } else if (*nterms == 4) {
	xip = (*xig + 1.) / 4.;
	xim = (1. - *xig) / 4.;
	etp = *etg + 1.;
	etm = 1. - *etg;
	ratio[1] = xim * etm;
	ratio[2] = xip * etm;
	ratio[3] = xip * etp;
	ratio[4] = xim * etp;
    } else if (*nterms == 6) {
	if (*xig + *etg <= 0.) {
	    xi = (*xig + 1.) / 2.;
	    et = (*etg + 1.) / 2.;
	} else {
	    xi = (1. - *etg) / 2.;
	    et = (1. - *xig) / 2.;
	}
	*a = 1. - xi - et;
	a2 = *a * 2.;
	xi2 = xi * 2.;
	et2 = et * 2.;
	ratio[1] = *a * (a2 - 1.);
	ratio[2] = xi * (xi2 - 1.);
	ratio[3] = et * (et2 - 1.);
	ratio[4] = xi2 * a2;
	ratio[5] = xi2 * et2;
	ratio[6] = et2 * a2;
    } else if (*nterms == 8) {
	xip = *xig + 1.;
	xim = 1. - *xig;
	xim2 = xip * xim / 2.;
	etp = *etg + 1.;
	etm = 1. - *etg;
	etm2 = etp * etm / 2.;
	ratio[5] = xim2 * etm;
	ratio[6] = xip * etm2;
	ratio[7] = xim2 * etp;
	ratio[8] = xim * etm2;
	xim /= 4.;
	xip /= 4.;
	ratio[1] = xim * etm * (-(*xig) - etp);
	ratio[2] = xip * etm * (*xig - etp);
	ratio[3] = xip * etp * (*xig - etm);
	ratio[4] = xim * etp * (-(*xig) - etm);
    } else {
	s_wsle(&io___12);
	do_lio(&c__9, &c__1, "*ERROR in distattach_2d: case with ", (ftnlen)
		35);
	do_lio(&c__3, &c__1, (char *)&(*nterms), (ftnlen)sizeof(integer));
	e_wsle();
	s_wsle(&io___13);
	do_lio(&c__9, &c__1, "       terms is not covered", (ftnlen)27);
	e_wsle();
	exit_(&c__201);
    }

/*     calculating the position in the face */

    for (i__ = 1; i__ <= 3; ++i__) {
	p[i__] = 0.;
	i__1 = *nterms;
	for (j = 1; j <= i__1; ++j) {
	    p[i__] += ratio[j] * pneigh[i__ + j * 3];
	}
    }

/*     calculating the distance */

/* Computing 2nd power */
    d__1 = pnode[1] - p[1];
/* Computing 2nd power */
    d__2 = pnode[2] - p[2];
/* Computing 2nd power */
    d__3 = pnode[3] - p[3];
    *a = d__1 * d__1 + d__2 * d__2 + d__3 * d__3;

    return 0;
} /* distattach_2d__ */

