/* subtracthmatrix.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int subtracthmatrix_(integer *neqp, doublereal *aubh, 
	doublereal *adbh, doublereal *aux, doublereal *dp, integer *jqp, 
	integer *irowp, doublereal *b, doublereal *theta1, doublereal *dtimef)
{
    /* System generated locals */
    integer i__1, i__2;

    /* Local variables */
    doublereal constant;
    integer i__, j, ic, ir;
    doublereal value;


/*     transfer effect of H-matrix for compressible fluids to the */
/*     rhs */




    /* Parameter adjustments */
    --b;
    --irowp;
    --jqp;
    --dp;
    --aux;
    --adbh;
    --aubh;

    /* Function Body */
    i__1 = *neqp;
    for (i__ = 1; i__ <= i__1; ++i__) {
	aux[i__] = adbh[i__] * dp[i__];
    }

    i__1 = *neqp;
    for (ic = 1; ic <= i__1; ++ic) {
	i__2 = jqp[ic + 1] - 1;
	for (j = jqp[ic]; j <= i__2; ++j) {
	    ir = irowp[j];
	    value = aubh[j];
	    aux[ir] += value * dp[ic];
	    aux[ic] += value * dp[ir];
	}
    }

    constant = *dtimef * *dtimef * *theta1;

    i__1 = *neqp;
    for (i__ = 1; i__ <= i__1; ++i__) {
	b[i__] -= constant * aux[i__];
    }

    return 0;
} /* subtracthmatrix_ */

