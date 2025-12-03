/* bsort.f -- translated by f2c (version 20200916).
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

static doublereal c_b2 = .25;


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

/* Subroutine */ int bsort_(integer *n, doublereal *x, doublereal *y, 
	doublereal *xmin, doublereal *xmax, doublereal *ymin, doublereal *
	ymax, doublereal *dmax__, integer *bin, integer *list)
{
    /* System generated locals */
    integer i__1;
    doublereal d__1, d__2;

    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *);
    integer i_dnnt(doublereal *);

    /* Local variables */
    integer i__, j, k, p, ndiv;
    doublereal factx, facty;
    extern /* Subroutine */ int qsorti_(integer *, integer *, integer *);





    /* Parameter adjustments */
    --list;
    --bin;
    --y;
    --x;

    /* Function Body */
    d__2 = (doublereal) ((real) (*n));
    d__1 = pow_dd(&d__2, &c_b2);
    ndiv = i_dnnt(&d__1);
    factx = (real) ndiv / ((*xmax - *xmin) * 1.01 / *dmax__);
    facty = (real) ndiv / ((*ymax - *ymin) * 1.01 / *dmax__);
    i__1 = *n;
    for (k = 1; k <= i__1; ++k) {
	p = list[k];
	i__ = (integer) (y[p] * facty);
	j = (integer) (x[p] * factx);
	if (i__ % 2 == 0) {
	    bin[p] = i__ * ndiv + j + 1;
	} else {
	    bin[p] = (i__ + 1) * ndiv - j;
	}
/* L10: */
    }
    qsorti_(n, &list[1], &bin[1]);
    return 0;
} /* bsort_ */

