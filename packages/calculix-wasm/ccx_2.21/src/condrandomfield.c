/* condrandomfield.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int condrandomfield_(doublereal *ad, doublereal *au, integer 
	*jqs, integer *irows, integer *ndesi, doublereal *rhs, doublereal *
	vector, integer *idesvar, integer *jqc, doublereal *auc, integer *
	irowc)
{
    /* System generated locals */
    integer i__1, i__2;

    /* Local variables */
    integer i__, j, irow;


/*     computation of the conditional randomfield entries */




    /* Parameter adjustments */
    --irowc;
    --auc;
    --jqc;
    --vector;
    --rhs;
    --irows;
    --jqs;
    --au;
    --ad;

    /* Function Body */
    i__1 = *ndesi;
    for (i__ = 1; i__ <= i__1; ++i__) {
	i__2 = jqc[i__ + 1] - 1;
	for (j = jqc[i__]; j <= i__2; ++j) {
	    irow = irowc[j];
	    vector[i__] += rhs[irow] * auc[j];
	}
    }

/*     subtraction of diagonal entry */

    ad[*idesvar] -= vector[*idesvar];

/*     subtraction of subdiagonal entries */

    i__1 = jqs[*idesvar + 1] - 1;
    for (i__ = jqs[*idesvar]; i__ <= i__1; ++i__) {
	irow = irows[i__];
	au[i__] -= vector[irow];
    }

    return 0;
} /* condrandomfield_ */

