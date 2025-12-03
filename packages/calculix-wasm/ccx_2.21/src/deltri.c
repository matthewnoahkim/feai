/* deltri.f -- translated by f2c (version 20200916).
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

/*     S.W. Sloan, Adv.Eng.Software,1987,9(1),34-55. */
/*     Permission for use with the GPL license granted by Prof. Scott */
/*     Sloan on 17. Nov. 2013 */

/* Subroutine */ int deltri_(integer *numpts, integer *n, doublereal *x, 
	doublereal *y, integer *list, integer *bin, integer *v, integer *e, 
	integer *numtri)
{
    /* System generated locals */
    integer i__1;
    doublereal d__1, d__2;

    /* Local variables */
    integer i__, p;
    doublereal fact, dmax__, xmin, xmax, ymin, ymax;
    extern /* Subroutine */ int bsort_(integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, integer *), delaun_(integer *, integer *,
	     doublereal *, doublereal *, integer *, integer *, integer *, 
	    integer *, integer *);






    /* Parameter adjustments */
    e -= 4;
    v -= 4;
    --bin;
    --list;
    --y;
    --x;

    /* Function Body */
    xmin = x[list[1]];
    xmax = xmin;
    ymin = y[list[1]];
    ymax = ymin;
    i__1 = *n;
    for (i__ = 2; i__ <= i__1; ++i__) {
	p = list[i__];
/* Computing MIN */
	d__1 = xmin, d__2 = x[p];
	xmin = min(d__1,d__2);
/* Computing MAX */
	d__1 = xmax, d__2 = x[p];
	xmax = max(d__1,d__2);
/* Computing MIN */
	d__1 = ymin, d__2 = y[p];
	ymin = min(d__1,d__2);
/* Computing MAX */
	d__1 = ymax, d__2 = y[p];
	ymax = max(d__1,d__2);
/* L5: */
    }
/* Computing MAX */
    d__1 = xmax - xmin, d__2 = ymax - ymin;
    dmax__ = max(d__1,d__2);
    fact = 1. / dmax__;
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	p = list[i__];
	x[p] = (x[p] - xmin) * fact;
	y[p] = (y[p] - ymin) * fact;
/* L10: */
    }
    bsort_(n, &x[1], &y[1], &xmin, &xmax, &ymin, &ymax, &dmax__, &bin[1], &
	    list[1]);
    delaun_(numpts, n, &x[1], &y[1], &list[1], &bin[1], &v[4], &e[4], numtri);
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	p = list[i__];
	x[p] = x[p] * dmax__ + xmin;
	y[p] = y[p] * dmax__ + ymin;
/* L30: */
    }
    return 0;
} /* deltri_ */

