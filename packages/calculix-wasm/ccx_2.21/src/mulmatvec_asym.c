/* mulmatvec_asym.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int mulmatvec_asym__(doublereal *au, integer *jq, integer *
	irow, integer *ncol, doublereal *x, doublereal *y, integer *
	itranspose)
{
    /* System generated locals */
    integer i__1, i__2;

    /* Local variables */
    integer i__, j;


/*     asymmetric sparse matrix vector multiplication in */
/*     Compressed Sparse Column (CSC) format: y = a*x */




/*     itranspose=0: non transposed */
/*     itranspose=1: transposed */

    /* Parameter adjustments */
    --y;
    --x;
    --irow;
    --jq;
    --au;

    /* Function Body */
    if (*itranspose == 0) {

/*     NONtransposed multiplication */

	i__1 = *ncol;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    i__2 = jq[i__ + 1] - 1;
	    for (j = jq[i__]; j <= i__2; ++j) {
		y[irow[j]] += au[j] * x[i__];
	    }
	}

    } else {

/*     transposed multiplication */

	i__1 = *ncol;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    i__2 = jq[i__ + 1] - 1;
	    for (j = jq[i__]; j <= i__2; ++j) {
		y[i__] += au[j] * x[irow[j]];
	    }
	}
    }

    return 0;
} /* mulmatvec_asym__ */

