/* sortev.f -- translated by f2c (version 20200916).
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

/*     ADDITIONAL INPUT Parameters: */
/*     ipev:     Position of Eigenvalues, saves original Position of */
/*            Eigenvalues before sorting */
/*     eigxr:   Real Part of Eigenvalues out of eigxx, used for */
/*            sorting Eigenvalues in increasing order */

/* Subroutine */ int sortev_(integer *nev, integer *nmd, doublecomplex *eigxx,
	 integer *cyclicsymmetry, doublecomplex *x, doublereal *eigxr, 
	integer *ipev, integer *istartnmd, integer *iendnmd, doublecomplex *a,
	 doublecomplex *b, integer *nevcomplex)
{
    /* System generated locals */
    integer b_dim1, b_offset, x_dim1, x_offset, i__1, i__2, i__3, i__4, i__5;

    /* Builtin functions */
    double z_abs(doublecomplex *);

    /* Local variables */
    integer i__, j, k, l, m;
    extern /* Subroutine */ int dsort_(doublereal *, integer *, integer *, 
	    integer *);


/*     sorts the eigenvalues and eigenvectors of complex frequency */





    /* Parameter adjustments */
    b_dim1 = *nev;
    b_offset = 1 + b_dim1;
    b -= b_offset;
    --a;
    x_dim1 = *nev;
    x_offset = 1 + x_dim1;
    x -= x_offset;
    --eigxx;
    --eigxr;
    --ipev;
    --istartnmd;
    --iendnmd;

    /* Function Body */
    if (*cyclicsymmetry == 0) {

/*     sorting the eigenvalues according to their size */

	i__1 = *nevcomplex;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    ipev[i__] = i__;
	    eigxr[i__] = z_abs(&eigxx[i__]);
	}
	dsort_(&eigxr[1], &ipev[1], nevcomplex, &c__2);

/*     sorting the eigenvectors */

	i__1 = *nevcomplex;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    i__2 = i__;
	    i__3 = ipev[i__];
	    a[i__2].r = eigxx[i__3].r, a[i__2].i = eigxx[i__3].i;
	    i__2 = *nev;
	    for (j = 1; j <= i__2; ++j) {
		i__3 = j + i__ * b_dim1;
		i__4 = j + ipev[i__] * x_dim1;
		b[i__3].r = x[i__4].r, b[i__3].i = x[i__4].i;
	    }
	}

/*     copying in the original fields */

	i__1 = *nevcomplex;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    i__2 = i__;
	    i__3 = i__;
	    eigxx[i__2].r = a[i__3].r, eigxx[i__2].i = a[i__3].i;
	    i__2 = *nev;
	    for (j = 1; j <= i__2; ++j) {
		i__3 = j + i__ * x_dim1;
		i__4 = j + i__ * b_dim1;
		x[i__3].r = b[i__4].r, x[i__3].i = b[i__4].i;
	    }
	}
    } else {

/*     Cyclic Symmetry */

	i__1 = *nmd;
	for (l = 1; l <= i__1; ++l) {

/*     sorting the eigenvalues according to their size */


	    i__2 = iendnmd[l];
	    for (i__ = istartnmd[l]; i__ <= i__2; ++i__) {
		if (l == 1) {
		    ipev[i__] = i__;
		    eigxr[i__] = z_abs(&eigxx[i__]);
		    k = i__;
		} else {
		    k = i__ - istartnmd[l] + 1;
		    ipev[k] = i__;
		    eigxr[i__] = z_abs(&eigxx[i__]);
		}
	    }
	    dsort_(&eigxr[1], &ipev[1], &k, &c__2);

/*     sorting the eigenvectors */

	    i__2 = iendnmd[l];
	    for (i__ = istartnmd[l]; i__ <= i__2; ++i__) {
		if (l == 1) {
		    m = ipev[i__];
		    i__3 = i__;
		    i__4 = m;
		    a[i__3].r = eigxx[i__4].r, a[i__3].i = eigxx[i__4].i;
		    i__3 = iendnmd[l];
		    for (j = istartnmd[l]; j <= i__3; ++j) {
			i__4 = j + i__ * b_dim1;
			i__5 = j + m * x_dim1;
			b[i__4].r = x[i__5].r, b[i__4].i = x[i__5].i;
		    }
		} else {
		    k = i__ - istartnmd[l] + 1;
		    i__3 = i__;
		    i__4 = ipev[k];
		    a[i__3].r = eigxx[i__4].r, a[i__3].i = eigxx[i__4].i;
		    i__3 = iendnmd[l];
		    for (j = istartnmd[l]; j <= i__3; ++j) {
			i__4 = j + i__ * b_dim1;
			i__5 = j + m * x_dim1;
			b[i__4].r = x[i__5].r, b[i__4].i = x[i__5].i;
		    }
		}
	    }
	}

/*     copying in the original fields */

	i__1 = *nmd;
	for (l = 1; l <= i__1; ++l) {
	    i__2 = istartnmd[l];
	    i__3 = istartnmd[l] + istartnmd[l] * b_dim1;
	    if ((a[i__2].r != 0. || a[i__2].i != 0.) && (b[i__3].r != 0. || b[
		    i__3].i != 0.)) {
		i__2 = iendnmd[l];
		for (i__ = istartnmd[l]; i__ <= i__2; ++i__) {
		    i__3 = i__;
		    i__4 = i__;
		    eigxx[i__3].r = a[i__4].r, eigxx[i__3].i = a[i__4].i;
		    i__3 = iendnmd[l];
		    for (j = istartnmd[l]; j <= i__3; ++j) {
			i__4 = i__ + j * x_dim1;
			i__5 = i__ + j * b_dim1;
			x[i__4].r = b[i__5].r, x[i__4].i = b[i__5].i;
		    }
		}
	    }
	}
    }

    return 0;
} /* sortev_ */

