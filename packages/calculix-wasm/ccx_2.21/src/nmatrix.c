/* nmatrix.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int nmatrix_(doublereal *ad, doublereal *au, integer *jqs, 
	integer *irows, integer *ndesi, integer *nodedesi, doublereal *
	dgdxglob, integer *nactive, integer *nobject, integer *nnlconst, 
	integer *ipoacti, integer *nk)
{
    /* System generated locals */
    integer dgdxglob_dim2, dgdxglob_offset, i__1, i__2, i__3;
    doublereal d__1;

    /* Local variables */
    integer i__, j, idof, jdof, node, ipos, jpos;


/*     calculates the values of the expression: N^(T)N */




    /* Parameter adjustments */
    --ad;
    --au;
    --jqs;
    --irows;
    --nodedesi;
    --ipoacti;
    dgdxglob_dim2 = *nk;
    dgdxglob_offset = 1 + 2 * (1 + dgdxglob_dim2);
    dgdxglob -= dgdxglob_offset;

    /* Function Body */
    i__1 = *nactive;
    for (idof = 1; idof <= i__1; ++idof) {
	if (idof <= *nnlconst) {
	    ipos = ipoacti[idof];
	    i__2 = *ndesi;
	    for (i__ = 1; i__ <= i__2; ++i__) {
		node = nodedesi[i__];
/* Computing 2nd power */
		d__1 = dgdxglob[(node + ipos * dgdxglob_dim2 << 1) + 2];
		ad[idof] += d__1 * d__1;
	    }
	    i__2 = jqs[idof + 1] - 1;
	    for (i__ = jqs[idof]; i__ <= i__2; ++i__) {
		jdof = irows[i__];
		if (jdof <= *nnlconst) {
		    jpos = ipoacti[i__];
		    i__3 = *ndesi;
		    for (j = 1; j <= i__3; ++j) {
			node = nodedesi[j];
			au[i__] += dgdxglob[(node + ipos * dgdxglob_dim2 << 1)
				 + 2] * dgdxglob[(node + jpos * dgdxglob_dim2 
				<< 1) + 2];
		    }
		} else {
		    node = nodedesi[ipoacti[i__]];
		    au[i__] = dgdxglob[(node + ipos * dgdxglob_dim2 << 1) + 2]
			    ;
		}
	    }
	} else {
	    ad[idof] = 1.;
	}
    }

    return 0;
} /* nmatrix_ */

