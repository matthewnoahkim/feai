/* distattachline.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int distattachline_(doublereal *xig, doublereal *etg, 
	doublereal *pneigh, doublereal *pnode, doublereal *dist, integer *
	nterms, doublereal *xn, doublereal *p)
{
    /* System generated locals */
    integer i__1;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    doublereal a;
    integer i__, j;
    doublereal a2, et, xi, et2, xi2, etm, etp, xim, xip, etm2, xim2;
    extern /* Subroutine */ int exit_(integer *);
    doublereal coeff, ratio[8];

    /* Fortran I/O blocks */
    static cilist io___14 = { 0, 6, 0, 0, 0 };
    static cilist io___15 = { 0, 6, 0, 0, 0 };



/*     calculates the distance between a straight line through the node */
/*     with coordinates in "pnode" and direction vector "xn" and */
/*     the node with local coordinates xig and etg */
/*     in a face described by "nterms" nodes with coordinates */
/*     in "pneigh" */






    /* Parameter adjustments */
    --p;
    --xn;
    --pnode;
    pneigh -= 4;

    /* Function Body */
    if (*nterms == 3) {
	if (*xig + *etg <= 0.) {
	    ratio[1] = (*xig + 1.) / 2.;
	    ratio[2] = (*etg + 1.) / 2.;
	} else {
	    ratio[1] = (1. - *etg) / 2.;
	    ratio[2] = (1. - *xig) / 2.;
	}
	ratio[0] = 1. - ratio[1] - ratio[2];
    } else if (*nterms == 4) {
	xip = (*xig + 1.) / 4.;
	xim = (1. - *xig) / 4.;
	etp = *etg + 1.;
	etm = 1. - *etg;
	ratio[0] = xim * etm;
	ratio[1] = xip * etm;
	ratio[2] = xip * etp;
	ratio[3] = xim * etp;
    } else if (*nterms == 6) {
	if (*xig + *etg <= 0.) {
	    xi = (*xig + 1.) / 2.;
	    et = (*etg + 1.) / 2.;
	} else {
	    xi = (1. - *etg) / 2.;
	    et = (1. - *xig) / 2.;
	}
	a = 1. - xi - et;
	a2 = a * 2.;
	xi2 = xi * 2.;
	et2 = et * 2.;
	ratio[0] = a * (a2 - 1.);
	ratio[1] = xi * (xi2 - 1.);
	ratio[2] = et * (et2 - 1.);
	ratio[3] = xi2 * a2;
	ratio[4] = xi2 * et2;
	ratio[5] = et2 * a2;
    } else if (*nterms == 8) {
	xip = *xig + 1.;
	xim = 1. - *xig;
	xim2 = xip * xim / 2.;
	etp = *etg + 1.;
	etm = 1. - *etg;
	etm2 = etp * etm / 2.;
	ratio[4] = xim2 * etm;
	ratio[5] = xip * etm2;
	ratio[6] = xim2 * etp;
	ratio[7] = xim * etm2;
	xim /= 4.;
	xip /= 4.;
	ratio[0] = xim * etm * (-(*xig) - etp);
	ratio[1] = xip * etm * (*xig - etp);
	ratio[2] = xip * etp * (*xig - etm);
	ratio[3] = xim * etp * (-(*xig) - etm);
    } else {
	s_wsle(&io___14);
	do_lio(&c__9, &c__1, "*ERROR in distattach: case with ", (ftnlen)32);
	do_lio(&c__3, &c__1, (char *)&(*nterms), (ftnlen)sizeof(integer));
	e_wsle();
	s_wsle(&io___15);
	do_lio(&c__9, &c__1, "       terms is not covered", (ftnlen)27);
	e_wsle();
	exit_(&c__201);
    }

/*     calculating the position in the face */

    for (i__ = 1; i__ <= 3; ++i__) {
	p[i__] = 0.;
	i__1 = *nterms;
	for (j = 1; j <= i__1; ++j) {
	    p[i__] += ratio[j - 1] * pneigh[i__ + j * 3];
	}
    }

/*     calculating the distance */

    coeff = 0.;
    for (i__ = 1; i__ <= 3; ++i__) {
	coeff += xn[i__] * (p[i__] - pnode[i__]);
    }
/* Computing 2nd power */
    d__1 = p[1] - pnode[1] - coeff * xn[1];
/* Computing 2nd power */
    d__2 = p[2] - pnode[2] - coeff * xn[2];
/* Computing 2nd power */
    d__3 = p[3] - pnode[3] - coeff * xn[3];
    *dist = d__1 * d__1 + d__2 * d__2 + d__3 * d__3;

    return 0;
} /* distattachline_ */

