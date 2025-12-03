/* mult.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int mult_(doublereal *matrix, doublereal *trans, integer *n)
{
    doublereal a[9]	/* was [3][3] */;
    integer i__, j, k;




/*     3x3 matrix multiplication. If n=1 then */
/*        matrix=trans^T*matrix, */
/*     if n=2 then */
/*        matrix=matrix*trans. */

    /* Parameter adjustments */
    trans -= 4;
    matrix -= 4;

    /* Function Body */
    if (*n == 1) {
	for (i__ = 1; i__ <= 3; ++i__) {
	    for (j = 1; j <= 3; ++j) {
		a[i__ + j * 3 - 4] = 0.;
		for (k = 1; k <= 3; ++k) {
		    a[i__ + j * 3 - 4] += trans[k + i__ * 3] * matrix[k + j * 
			    3];
		}
	    }
	}
    } else if (*n == 2) {
	for (i__ = 1; i__ <= 3; ++i__) {
	    for (j = 1; j <= 3; ++j) {
		a[i__ + j * 3 - 4] = 0.;
		for (k = 1; k <= 3; ++k) {
		    a[i__ + j * 3 - 4] += matrix[i__ + k * 3] * trans[k + j * 
			    3];
		}
	    }
	}
    }

    for (i__ = 1; i__ <= 3; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    matrix[i__ + j * 3] = a[i__ + j * 3 - 4];
	}
    }

    return 0;
} /* mult_ */

