/* ranstarefine.f -- translated by f2c (version 20200916).
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

static integer c__2 = 2;

/* Subroutine */ int ranstarefine_(integer *n, doublereal *x, D_fp fu, 
	doublereal *eps, doublereal *f0, integer *ier, doublereal *cotet, 
	integer *kontet, integer *ipoeln, integer *ieln, integer *node, 
	integer *iedge, integer *ipoeled, integer *ieled, integer *iedgmid, 
	integer *iedtet)
{
    /* System generated locals */
    integer i__1, i__2;

    /* Builtin functions */
    integer pow_ii(integer *, integer *);

    /* Local variables */
    doublereal h__;
    integer k, l, n2, ll, nn, nt;
    doublereal rs[216], xs[216];
    extern /* Subroutine */ int iniran_(void);
    extern doublereal ranuwh_(void);


/* Random search to determine a point with a function value that is */
/* different from the one found at the starting point X */
/* This is an auxiliary subroutine to support the minimization */
/* subroutine FMINSI */

/*   FMINSI - Fortran subroutines for unconstrained function minimization */
/*   Copyright (C) 1986, 1993, 2001  Hugo Pfoertner */

/*   This library is free software; you can redistribute it and/or */
/*   modify it under the terms of the GNU Lesser General Public */
/*   License as published by the Free Software Foundation; either */
/*   version 2.1 of the License, or (at your option) any later version. */

/*   This library is distributed in the hope that it will be useful, */
/*   but WITHOUT ANY WARRANTY; without even the implied warranty of */
/*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU */
/*   Lesser General Public License for more details. */

/*   You should have received a copy of the GNU Lesser General Public */
/*   License along with this library; if not, write to the Free Software */
/*   Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307 */
/*   USA */

/*   Contact info: mailto:hugo@pfoertner.org */
/*   or use the information provided at http://www.pfoertner.org/ */

/* Author: Hugo Pfoertner, Oberhaching, Germany */

/* Version History (left in German): */
/* 22.06.21 adapted fminsi for the mesh refinement procedure in CalculiX */
/*          Author: Guido Dhondt */
/* 02.06.01 English translation of comments, LGPL header added */
/* 27.11.93 ZUFALLSZAHLENGENERATOR RANEWR UND INIRAN EINGEBAUT */
/* 16.11.92 DIMENSIONIERUNG AUF 128 ERHOEHT */
/* 15.01.91 ABFRAGE AUF AENDERUNG STATT AUF VERMINDERUNG DES */
/*          FUNKTIONSWERTES */
/* 09.04.86 BASISVERSION */

/* The meaning of the parameters is the same as in subroutine FMINSI */
/* Output: */
/* F0 ...  Changed function value */
/* X ...   Variable vector of point with different function value */
/*         if such a point has been found, unchanged otherwise */
/* IER ... 0, if a point with changed function value has been found */
/*         3 otherwise (search stopped without success after 100*N */
/*         function evaluations. */

/* Dimension of local arrays has to be compliant with corresponding */
/* size within FMINSI */
/* Uniform random number generator and corresponding initialization */


/* Preset return code with "No success" */
    /* Parameter adjustments */
    --eps;
    --x;
    cotet -= 4;
    kontet -= 5;
    --ipoeln;
    ieln -= 3;
    --ipoeled;
    ieled -= 3;
    --iedgmid;
    iedtet -= 7;

    /* Function Body */
    *ier = 3;

/* Initialize uniform random number generator */

    iniran_();

/* Set initial step size */
    i__1 = *n;
    for (k = 1; k <= i__1; ++k) {
	rs[k - 1] = eps[k] * 10.f;
/* L10: */
    }

/* After N2 function evaluations, an increase in variance is tried */
    n2 = pow_ii(&c__2, n);

/* Maximum number of function evaluations */
    nt = *n * 100;

/* Function value at starting point */
    *f0 = (*fu)(n, &x[1], &cotet[4], &kontet[5], &ipoeln[1], &ieln[3], node, 
	    iedge, &ipoeled[1], &ieled[3], &iedgmid[1], &iedtet[7]);
    ll = 0;

/* Loop over maximum number of trials */
    i__1 = nt;
    for (l = 1; l <= i__1; ++l) {
	i__2 = *n;
	for (nn = 1; nn <= i__2; ++nn) {

/* Set co-ordinates to starting point + random increment */
/* in the range +-RS(i) */
	    xs[nn - 1] = x[nn] + rs[nn - 1] * 2.f * ((doublereal) ranuwh_() - 
		    .5f);
/* L30: */
	}

/* Corresponding function value */
	h__ = (*fu)(n, xs, &cotet[4], &kontet[5], &ipoeln[1], &ieln[3], node, 
		iedge, &ipoeled[1], &ieled[3], &iedgmid[1], &iedtet[7]);

/* Check for change */
	if (h__ != *f0) {

/* Loop is terminated at first occurrence of changed value */
	    *f0 = h__;
	    i__2 = *n;
	    for (k = 1; k <= i__2; ++k) {
/* L40: */
		x[k] = xs[k - 1];
	    }
	    *ier = 0;
	    goto L999;
	}

/* After N2 trials without success, the variance is increased */

	++ll;
	if (ll >= n2) {
	    i__2 = *n;
	    for (k = 1; k <= i__2; ++k) {
/* L50: */
		rs[k - 1] += rs[k - 1];
	    }
	    ll = 0;
	}

/* End of loop over maximum number of trials */
/* L20: */
    }

L999:
    return 0;
/* End of subroutine RANSTA */
} /* ranstarefine_ */

