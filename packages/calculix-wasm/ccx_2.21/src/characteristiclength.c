/* characteristiclength.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int characteristiclength_(doublereal *co, integer *
	istartcrackfro, integer *iendcrackfro, integer *ncrack, integer *
	ifront, doublereal *charlen, doublereal *datarget)
{
    /* System generated locals */
    integer i__1, i__2;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double sqrt(doublereal);

    /* Local variables */
    integer i__, k, m, n1, n2;
    doublereal sum, dist;


/*     determine the mesh characteristic length for each front */




/*     first increment: determine for each front a characteristic length */

    /* Parameter adjustments */
    --charlen;
    --ifront;
    --iendcrackfro;
    --istartcrackfro;
    co -= 4;

    /* Function Body */
    i__1 = *ncrack;
    for (i__ = 1; i__ <= i__1; ++i__) {

/*     loop over all nodes belonging to the crack front(s) */

	k = 0;
	sum = 0.;
	i__2 = iendcrackfro[i__] - 1;
	for (m = istartcrackfro[i__]; m <= i__2; ++m) {

/*     distance between two adjacent front nodes */

	    n1 = ifront[m];
	    n2 = ifront[m + 1];
/* Computing 2nd power */
	    d__1 = co[n2 * 3 + 1] - co[n1 * 3 + 1];
/* Computing 2nd power */
	    d__2 = co[n2 * 3 + 2] - co[n1 * 3 + 2];
/* Computing 2nd power */
	    d__3 = co[n2 * 3 + 3] - co[n2 * 3 + 3];
	    dist = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);
	    ++k;
	    sum = (sum * (k - 1) + dist) / k;
	}

/*     charlen is the mean distance between front nodes for each front */
/*     however, charlen should not be smaller than the target crack */
/*     propagation increment (favorizes smooth surfaces) */

	charlen[i__] = max(*datarget,sum);
    }

    return 0;
} /* characteristiclength_ */

