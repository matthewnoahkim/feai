/* calcmac.f -- translated by f2c (version 20200916).
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

/*      You should have received a copy of the GNU General Public License */
/*      along with this program; if not, write to the Free Software */
/*      Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA. */

/*      INPUT Parameters: */
/*      neq:      number of equations, length of eigenvectors */
/*                (non-cyclic-symmetry) */
/*      nev:      number of eigenvectors */
/*      neqact:   length of eigenvectors (cyclic symmetry) */
/*      z:        Matrix of eigenvectors out of frequency analysis */
/*                storage: for each eigenvalue: first complete real part, */
/*                         then complete imaginary part of eigenvector */
/*                         (imaginary part only for cyclic symmetry) */
/*      zz:       Matrix of eigenvectors out of complex frequency analysis */
/*                storage: for each eigenvalue: first complete real part, */
/*                         then complete imaginary part of eigenvector */
/*      istartnmd:first number of nev of nodal diameter l */
/*      iendnmd:  last number ov nev of nodal diameter l */
/*      nmd:      Number of nodal diameters (cyclic symmetry) */

/*      OUTPUT Parameters */
/*      xmac:     Matrix that contains absolute MAC-values of all vectors */
/*                combined */
/*                with all vectors; in case of cyclic symmetry: only eigenvectors */
/*                of the same nodal diameter are taken in account */
/*      xmaccpx:  Matrix that contains the complex MAC-values of all vectors */
/*                combined with all vectors; in case of cyclic symmetry: */
/*                only eigenvectors of the same nodal diameter are taken */
/*                in account */

/* Subroutine */ int calcmac_(integer *neq, doublereal *z__, doublereal *zz, 
	integer *nev, doublereal *xmac, doublecomplex *xmaccpx, integer *
	istartnmd, integer *iendnmd, integer *nmd, integer *cyclicsymmetry, 
	integer *neqact, doublereal *bett, doublereal *betm, integer *
	nevcomplex)
{
    /* System generated locals */
    integer xmac_dim1, xmac_offset, z_dim1, z_offset, zz_dim1, zz_offset, 
	    xmaccpx_dim1, xmaccpx_offset, i__1, i__2, i__3, i__4, i__5, i__6, 
	    i__7, i__8, i__9, i__10;
    doublereal d__1, d__2;
    doublecomplex z__1, z__2, z__3, z__4, z__5, z__6;

    /* Builtin functions */
    double sqrt(doublereal), z_abs(doublecomplex *);

    /* Local variables */
    integer i__, j, k, l;


/*     calculates the Modal Assurance Criterium MAC=<z,zz>/(||z||*||zz||) */





    /* Parameter adjustments */
    z_dim1 = *neq;
    z_offset = 1 + z_dim1;
    z__ -= z_offset;
    xmaccpx_dim1 = *nev;
    xmaccpx_offset = 1 + xmaccpx_dim1;
    xmaccpx -= xmaccpx_offset;
    xmac_dim1 = *nev;
    xmac_offset = 1 + xmac_dim1;
    xmac -= xmac_offset;
    --istartnmd;
    --iendnmd;
    zz_dim1 = 2 * *neqact;
    zz_offset = 1 + zz_dim1;
    zz -= zz_offset;
    --bett;
    --betm;

    /* Function Body */
    if (*cyclicsymmetry == 0) {
/*     size of vectors */
	i__1 = *nev;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    i__2 = *neq;
	    for (k = 1; k <= i__2; ++k) {
/* Computing 2nd power */
		d__1 = z__[k + i__ * z_dim1];
		bett[i__] += d__1 * d__1;
	    }
	}
	i__1 = *nevcomplex;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    i__2 = *neq;
	    for (k = 1; k <= i__2; ++k) {
/* Computing 2nd power */
		d__1 = zz[k + i__ * zz_dim1];
/* Computing 2nd power */
		d__2 = zz[k + *neq + i__ * zz_dim1];
		betm[i__] = betm[i__] + d__1 * d__1 + d__2 * d__2;
	    }
	}

	i__1 = *nev;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    bett[i__] = sqrt(bett[i__]);
	}
	i__1 = *nevcomplex;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    betm[i__] = sqrt(betm[i__]);
	}
/*     Calculation of MAC */
	i__1 = *nev;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    i__2 = *nevcomplex;
	    for (j = 1; j <= i__2; ++j) {
		i__3 = *neq;
		for (k = 1; k <= i__3; ++k) {
		    i__4 = i__ + j * xmaccpx_dim1;
		    i__5 = i__ + j * xmaccpx_dim1;
		    i__6 = k + i__ * z_dim1;
		    i__7 = k + j * zz_dim1;
		    i__8 = k + *neq + j * zz_dim1;
		    z__4.r = zz[i__8] * 0., z__4.i = zz[i__8] * 1.;
		    z__3.r = zz[i__7] + z__4.r, z__3.i = z__4.i;
		    z__2.r = z__[i__6] * z__3.r, z__2.i = z__[i__6] * z__3.i;
		    z__1.r = xmaccpx[i__5].r + z__2.r, z__1.i = xmaccpx[i__5]
			    .i + z__2.i;
		    xmaccpx[i__4].r = z__1.r, xmaccpx[i__4].i = z__1.i;
		}
		xmac[i__ + j * xmac_dim1] = z_abs(&xmaccpx[i__ + j * 
			xmaccpx_dim1]);
		xmac[i__ + j * xmac_dim1] = xmac[i__ + j * xmac_dim1] / bett[
			i__] / betm[j];
	    }
	}

/*     Cyclic Symmetry */
/*     size of vectors */

    } else {
	i__1 = *nev;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    i__2 = *neqact;
	    for (k = 1; k <= i__2; ++k) {
/* Computing 2nd power */
		d__1 = z__[k + i__ * z_dim1];
/* Computing 2nd power */
		d__2 = z__[k + *neqact + i__ * z_dim1];
		bett[i__] = bett[i__] + d__1 * d__1 + d__2 * d__2;
/* Computing 2nd power */
		d__1 = zz[k + i__ * zz_dim1];
/* Computing 2nd power */
		d__2 = zz[k + *neqact + i__ * zz_dim1];
		betm[i__] = betm[i__] + d__1 * d__1 + d__2 * d__2;
	    }
	    bett[i__] = sqrt(bett[i__]);
	    betm[i__] = sqrt(betm[i__]);
	}
/*     Calculation of MAC */
	i__1 = *nmd;
	for (l = 1; l <= i__1; ++l) {
	    i__2 = iendnmd[l];
	    for (i__ = istartnmd[l]; i__ <= i__2; ++i__) {
		i__3 = iendnmd[l];
		for (j = istartnmd[l]; j <= i__3; ++j) {
		    xmac[i__ + j * xmac_dim1] = 0.;
		    i__4 = *neqact;
		    for (k = 1; k <= i__4; k += 2) {
			i__5 = i__ + j * xmaccpx_dim1;
			i__6 = i__ + j * xmaccpx_dim1;
			i__7 = k + i__ * z_dim1;
			i__8 = k + *neqact + i__ * z_dim1;
			z__4.r = z__[i__8] * 0., z__4.i = z__[i__8] * 1.;
			z__3.r = z__[i__7] - z__4.r, z__3.i = -z__4.i;
			i__9 = k + j * zz_dim1;
			i__10 = k + *neqact + j * zz_dim1;
			z__6.r = zz[i__10] * 0., z__6.i = zz[i__10] * 1.;
			z__5.r = zz[i__9] + z__6.r, z__5.i = z__6.i;
			z__2.r = z__3.r * z__5.r - z__3.i * z__5.i, z__2.i = 
				z__3.r * z__5.i + z__3.i * z__5.r;
			z__1.r = xmaccpx[i__6].r + z__2.r, z__1.i = xmaccpx[
				i__6].i + z__2.i;
			xmaccpx[i__5].r = z__1.r, xmaccpx[i__5].i = z__1.i;
		    }
		    xmac[i__ + j * xmac_dim1] = z_abs(&xmaccpx[i__ + j * 
			    xmaccpx_dim1]);
		    xmac[i__ + j * xmac_dim1] = xmac[i__ + j * xmac_dim1] / 
			    bett[i__] / betm[j];
		}
	    }
	}
    }

    return 0;
} /* calcmac_ */

