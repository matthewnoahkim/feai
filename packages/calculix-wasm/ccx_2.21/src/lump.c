/* lump.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int lump_(doublereal *adb, doublereal *aub, doublereal *adl, 
	integer *irow, integer *jq, integer *neq)
{
    /* System generated locals */
    integer i__1, i__2;

    /* Local variables */
    integer i__, j, k;


/*     lumping the matrix stored in adb,aub and storing the result */
/*     in adl */




    /* Parameter adjustments */
    --jq;
    --irow;
    --adl;
    --aub;
    --adb;

    /* Function Body */
    i__1 = *neq;
    for (i__ = 1; i__ <= i__1; ++i__) {
	adl[i__] = adb[i__];
    }

    i__1 = *neq;
    for (j = 1; j <= i__1; ++j) {
	i__2 = jq[j + 1] - 1;
	for (k = jq[j]; k <= i__2; ++k) {
	    i__ = irow[k];
	    adl[i__] += aub[k];
	    adl[j] += aub[k];
	}
    }

/*     change of meaning of adb and adl */
/*     first adb is replaced by adb-adl */
/*     then, adl is replaced by 1./adl */

    i__1 = *neq;
    for (i__ = 1; i__ <= i__1; ++i__) {
	adb[i__] -= adl[i__];
	adl[i__] = 1. / adl[i__];
    }

    return 0;
} /* lump_ */

