/* scalesen.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int scalesen_(doublereal *dgdxglob, doublereal *feasdir, 
	integer *nk, integer *nodedesi, integer *ndesi, char *objectset, 
	integer *iscaleflag, integer *iobject, integer *ne2d, ftnlen 
	objectset_len)
{
    /* System generated locals */
    integer dgdxglob_dim2, dgdxglob_offset, i__1;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double sqrt(doublereal);
    integer s_cmp(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    integer i__;
    doublereal dd, dd2;
    integer node;


/*     Scaling the sensitivities */

/*     iscaleflag=1: length of the vector is scaled to 1 */
/*     iscaleflag=2: greatest vector value is scaled to 1 */
/*     iscaleglag=3: sensitivities of the objective function are multiplied */
/*                   with -1 in case of a minimization task */
/*     iscaleflag=4: greatest vector value of the final feasible direction */
/*                   sensitivity feasdir is scaled to 1 */





    /* Parameter adjustments */
    feasdir -= 3;
    dgdxglob_dim2 = *nk;
    dgdxglob_offset = 1 + 2 * (1 + dgdxglob_dim2);
    dgdxglob -= dgdxglob_offset;
    --nodedesi;
    objectset -= 486;

    /* Function Body */
    if (*iscaleflag == 1) {

/*       normalization over all design nodes of a filtered design */
/*       response */

	if (*(unsigned char *)&objectset[(*iobject * 5 + 5) * 81 + 80] != 'G')
		 {
	    dd = 0.;
	    i__1 = *ndesi;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		node = nodedesi[i__];
/* Computing 2nd power */
		d__1 = dgdxglob[(node + *iobject * dgdxglob_dim2 << 1) + 2];
		dd += d__1 * d__1;
	    }
	    dd = sqrt(dd);
	    i__1 = *ndesi;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		node = nodedesi[i__];
		dgdxglob[(node + *iobject * dgdxglob_dim2 << 1) + 2] /= dd;
		if (*ne2d != 0) {
		    dgdxglob[(node + 1 + *iobject * dgdxglob_dim2 << 1) + 2] =
			     dgdxglob[(node + *iobject * dgdxglob_dim2 << 1) 
			    + 2];
		    dgdxglob[(node + 2 + *iobject * dgdxglob_dim2 << 1) + 2] =
			     dgdxglob[(node + *iobject * dgdxglob_dim2 << 1) 
			    + 2];
		}
	    }
	}
    } else if (*iscaleflag == 2) {
	if (*(unsigned char *)&objectset[(*iobject * 5 + 5) * 81 + 80] != 'G')
		 {
	    dd = 0.;
	    i__1 = *ndesi;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		node = nodedesi[i__];
/* Computing MAX */
		d__2 = dd, d__3 = (d__1 = dgdxglob[(node + *iobject * 
			dgdxglob_dim2 << 1) + 2], abs(d__1));
		dd = max(d__2,d__3);
	    }
	    i__1 = *ndesi;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		node = nodedesi[i__];
		dgdxglob[(node + *iobject * dgdxglob_dim2 << 1) + 2] /= dd;
	    }
	}
    } else if (*iscaleflag == 3) {
	if (s_cmp(objectset + 583, "MIN", (ftnlen)3, (ftnlen)3) == 0) {
	    i__1 = *ndesi;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		node = nodedesi[i__];
/*           NEXT LINE IS NOT NEEDED ??????????????? */
/*            dgdxglob(1,node,1)=-dgdxglob(1,node,1) */
		dgdxglob[(node + dgdxglob_dim2 << 1) + 2] = -dgdxglob[(node + 
			dgdxglob_dim2 << 1) + 2];
	    }
	}
    } else if (*iscaleflag == 4) {

/*       scaling such that the maximum over all design variables is one */

	dd = 0.;
	dd2 = 0.;
	i__1 = *ndesi;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    node = nodedesi[i__];
/* Computing MAX */
	    d__2 = dd2, d__3 = (d__1 = feasdir[(node << 1) + 2], abs(d__1));
	    dd2 = max(d__2,d__3);
	}
	if (dd2 <= 0.) {
	    dd2 = 1.f;
	}
	if (*ne2d == 0) {
	    i__1 = *ndesi;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		node = nodedesi[i__];
		feasdir[(node << 1) + 2] /= dd2;
	    }
	} else {

/*         for 2d-calculations: copy the results to the */
/*         other expanded nodes as well */

	    i__1 = *ndesi;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		node = nodedesi[i__];
		feasdir[(node << 1) + 2] /= dd2;
		feasdir[(node + 1 << 1) + 1] = feasdir[(node << 1) + 1];
		feasdir[(node + 2 << 1) + 1] = feasdir[(node << 1) + 1];
		feasdir[(node + 1 << 1) + 2] = feasdir[(node << 1) + 2];
		feasdir[(node + 2 << 1) + 2] = feasdir[(node << 1) + 2];
	    }
	}
    }

    return 0;
} /* scalesen_ */

