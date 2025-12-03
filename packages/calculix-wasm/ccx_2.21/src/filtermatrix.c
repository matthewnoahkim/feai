/* filtermatrix.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int filtermatrix_(doublereal *au, integer *jq, integer *irow,
	 integer *icol, integer *ndesi, integer *nodedesi, doublereal *
	filterrad, doublereal *co, integer *nk, doublereal *denominator, char 
	*objectset, doublereal *filterval, doublereal *xdesi, doublereal *
	distmin, ftnlen objectset_len)
{
    /* System generated locals */
    integer i__1, i__2;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen);
    double sqrt(doublereal), atan(doublereal), exp(doublereal);

    /* Local variables */
    integer jj, kk;
    doublereal pi, dx, dy, dz, dist;
    integer ipos;
    doublereal sigma;
    integer inode1, inode2;
    doublereal scalar;
    integer actdir;


/*     calculates the filtervalues of the filter matrix */





/*     Check if direction weighting is turned on */

    /* Parameter adjustments */
    xdesi -= 4;
    --filterval;
    objectset -= 486;
    --denominator;
    co -= 4;
    --nodedesi;
    --icol;
    --irow;
    --jq;
    --au;

    /* Function Body */
    if (s_cmp(objectset + 580, "DIR", (ftnlen)3, (ftnlen)3) == 0) {
	actdir = 1;
    } else {
	actdir = 0;
    }

/*     loop over all columns */
    i__1 = *ndesi;
    for (kk = 1; kk <= i__1; ++kk) {
	inode1 = nodedesi[kk];

/*        loop over all rows */
	i__2 = jq[kk + 1] - 1;
	for (jj = jq[kk]; jj <= i__2; ++jj) {
	    ipos = irow[jj];
	    inode2 = nodedesi[ipos];

	    dx = co[inode1 * 3 + 1] - co[inode2 * 3 + 1];
	    dy = co[inode1 * 3 + 2] - co[inode2 * 3 + 2];
	    dz = co[inode1 * 3 + 3] - co[inode2 * 3 + 3];
/* Computing 2nd power */
	    d__1 = dx;
/* Computing 2nd power */
	    d__2 = dy;
/* Computing 2nd power */
	    d__3 = dz;
	    dist = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);
	    if (actdir == 1) {
/* Computing 2nd power */
		d__1 = *distmin;
		scalar = (xdesi[kk * 3 + 1] * xdesi[ipos * 3 + 1] + xdesi[kk *
			 3 + 2] * xdesi[ipos * 3 + 2] + xdesi[kk * 3 + 3] * 
			xdesi[ipos * 3 + 3]) / (d__1 * d__1);
		if (scalar < 0.) {
		    scalar = 0.;
		}
	    } else {
		scalar = 1.;
	    }

/*           calculate filter filtervalue */

	    if (s_cmp(objectset + 567, "LIN", (ftnlen)3, (ftnlen)3) == 0) {
		filterval[ipos] = (1 - dist / *filterrad) * *filterrad;
	    } else if (s_cmp(objectset + 567, "QUAD", (ftnlen)4, (ftnlen)4) ==
		     0) {
		filterval[ipos] = -(dist / *filterrad + 1) * (dist / *
			filterrad - 1) * *filterrad;
	    } else if (s_cmp(objectset + 567, "CUBIC", (ftnlen)5, (ftnlen)5) 
		    == 0) {
/* Computing 3rd power */
		d__1 = dist / *filterrad;
/* Computing 2nd power */
		d__2 = dist / *filterrad;
		filterval[ipos] = (d__1 * (d__1 * d__1) * 2 - d__2 * d__2 * 3 
			+ 1) * *filterrad;
	    } else if (s_cmp(objectset + 567, "GAUSS", (ftnlen)5, (ftnlen)5) 
		    == 0) {
		pi = atan(1.) * 4.;
		sigma = *filterrad / 3;
/* Computing 2nd power */
		d__1 = dist;
/* Computing 2nd power */
		d__2 = sigma;
		filterval[ipos] = 1 / (sqrt(pi * 2) * sigma) * exp(-(d__1 * 
			d__1) / (d__2 * d__2 * 2));
	    }

	    denominator[kk] += filterval[ipos];
	    filterval[ipos] *= scalar;
	}

/*        loop over all rows in column */
	i__2 = jq[kk + 1] - 1;
	for (jj = jq[kk]; jj <= i__2; ++jj) {
	    ipos = irow[jj];
	    if (denominator[kk] != 0.) {
		au[jj] = filterval[ipos] / denominator[kk];
	    }
	}
    }

/*      do kk=1,ndesi */
/*         do jj=jq(kk),jq(kk+1)-1 */
/*      write(5,*) kk,jj,au(jj) */
/*         enddo */
/*      enddo */
    return 0;
} /* filtermatrix_ */

