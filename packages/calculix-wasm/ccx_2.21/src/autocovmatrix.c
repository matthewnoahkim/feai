/* autocovmatrix.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int autocovmatrix_(doublereal *co, doublereal *ad, 
	doublereal *au, integer *jqs, integer *irows, integer *ndesi, integer 
	*nodedesi, doublereal *corrlen, doublereal *randomval, integer *
	irobustdesign)
{
    /* System generated locals */
    integer i__1, i__2;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double sqrt(doublereal), exp(doublereal);

    /* Local variables */
    integer j, idof, jdof;
    doublereal dist;
    integer node1, node2;
    doublereal sigma1, sigma2;


/*     calculates the values of the autocovariance matrix */




    /* Parameter adjustments */
    --irobustdesign;
    randomval -= 3;
    --nodedesi;
    --irows;
    --jqs;
    --au;
    --ad;
    co -= 4;

    /* Function Body */
    if (irobustdesign[2] == 1) {
/*     case of homogeneous random field */
	sigma1 = randomval[4];
	i__1 = *ndesi;
	for (idof = 1; idof <= i__1; ++idof) {
	    ad[idof] = sigma1 * sigma1;
	    i__2 = jqs[idof + 1] - 1;
	    for (j = jqs[idof]; j <= i__2; ++j) {
		jdof = irows[j];
		node1 = nodedesi[idof];
		node2 = nodedesi[jdof];
/* Computing 2nd power */
		d__1 = co[node1 * 3 + 1] - co[node2 * 3 + 1];
/* Computing 2nd power */
		d__2 = co[node1 * 3 + 2] - co[node2 * 3 + 2];
/* Computing 2nd power */
		d__3 = co[node1 * 3 + 3] - co[node2 * 3 + 3];
		dist = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);

/*     assign the value to the autocovariance matrix */

/* Computing 2nd power */
		d__1 = dist / *corrlen;
		au[j] = ad[idof] * exp(-(d__1 * d__1));
	    }
	}
    } else {

/*     case of inhomogeneous random field */

	i__1 = *ndesi;
	for (idof = 1; idof <= i__1; ++idof) {
	    node1 = nodedesi[idof];
	    sigma1 = randomval[(node1 << 1) + 2];
	    ad[idof] = sigma1 * sigma1;
	    i__2 = jqs[idof + 1] - 1;
	    for (j = jqs[idof]; j <= i__2; ++j) {
		jdof = irows[j];
		node2 = nodedesi[jdof];
		sigma2 = randomval[(node2 << 1) + 2];
/* Computing 2nd power */
		d__1 = co[node1 * 3 + 1] - co[node2 * 3 + 1];
/* Computing 2nd power */
		d__2 = co[node1 * 3 + 2] - co[node2 * 3 + 2];
/* Computing 2nd power */
		d__3 = co[node1 * 3 + 3] - co[node2 * 3 + 3];
		dist = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);

/*     assign the value to the autocovariance matrix */

/* Computing 2nd power */
		d__1 = dist / *corrlen;
		au[j] = sigma1 * sigma2 * exp(-(d__1 * d__1));
	    }
	}
    }

    return 0;
} /* autocovmatrix_ */

