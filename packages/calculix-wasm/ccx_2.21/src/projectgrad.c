/* projectgrad.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int projectgrad_(doublereal *vector, integer *ndesi, integer 
	*nodedesi, doublereal *dgdxglob, integer *nactive, integer *nobject, 
	integer *nnlconst, integer *ipoacti, integer *nk, doublereal *rhs, 
	integer *iconst, char *objectset, doublereal *xlambd, doublereal *xtf,
	 doublereal *objnorm, doublereal *gradproj, doublereal *g0, ftnlen 
	objectset_len)
{
    /* System generated locals */
    integer dgdxglob_dim2, dgdxglob_offset, i__1, i__2;

    /* Local variables */
    doublereal val;
    integer node, icol, ipos, irow;
    doublereal scalar;


/*     calculates the projected gradient, the lagrange multipliers and */
/*     the correction term due to nonlinear constraints */





/*     calculation of the vector */

    /* Parameter adjustments */
    --vector;
    --nodedesi;
    --ipoacti;
    dgdxglob_dim2 = *nk;
    dgdxglob_offset = 1 + 2 * (1 + dgdxglob_dim2);
    dgdxglob -= dgdxglob_offset;
    --rhs;
    objectset -= 486;
    --xlambd;
    --xtf;
    --objnorm;
    gradproj -= 4;
    --g0;

    /* Function Body */
    i__1 = *ndesi;
    for (irow = 1; irow <= i__1; ++irow) {
	i__2 = *nactive;
	for (icol = 1; icol <= i__2; ++icol) {
	    if (icol <= *nnlconst) {
		ipos = ipoacti[icol];
		node = nodedesi[irow];
		vector[irow] += rhs[icol] * dgdxglob[(node + ipos * 
			dgdxglob_dim2 << 1) + 2];
	    } else {
		if (ipoacti[icol] == irow) {
		    vector[irow] += rhs[icol];
		}
	    }
	}
    }

/*     calculation of the scalar value */

    scalar = 0.;
    if (*iconst <= *nnlconst) {
	i__1 = *ndesi;
	for (irow = 1; irow <= i__1; ++irow) {
	    ipos = ipoacti[*iconst];
	    node = nodedesi[irow];
	    scalar += dgdxglob[(node + dgdxglob_dim2 << 1) + 2] * dgdxglob[(
		    node + ipos * dgdxglob_dim2 << 1) + 2];
	}
    } else {
	node = nodedesi[ipoacti[*iconst]];
	scalar = dgdxglob[(node + dgdxglob_dim2 << 1) + 2];
    }

/*     multiplication of scalar and vector */

    i__1 = *ndesi;
    for (irow = 1; irow <= i__1; ++irow) {
	node = nodedesi[irow];
	gradproj[node * 3 + 2] += vector[irow] * scalar;
    }

/*     calculation of lagrange multiplier */

    i__1 = *nactive;
    for (icol = 1; icol <= i__1; ++icol) {
	xlambd[icol] += -rhs[icol] * xtf[*iconst];
    }

/*     calculation of correction term */

    if (objnorm[*iconst] > 0.) {
	if (*iconst <= *nnlconst) {
	    i__1 = *ndesi;
	    for (irow = 1; irow <= i__1; ++irow) {
		node = nodedesi[irow];
		gradproj[node * 3 + 1] += vector[irow] * objnorm[*iconst];
	    }
	} else {
	    irow = ipoacti[*iconst];
	    node = nodedesi[irow];
	    val = vector[irow] * objnorm[*iconst];
	    gradproj[node * 3 + 1] += vector[irow] * objnorm[*iconst];
	}
    }

    return 0;
} /* projectgrad_ */

