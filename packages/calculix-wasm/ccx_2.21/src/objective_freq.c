/* objective_freq.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int objective_freq__(doublereal *dgdx, doublereal *df, 
	doublereal *vold, integer *ndesi, integer *iobject, integer *mi, 
	integer *nactdofinv, integer *jqs, integer *irows)
{
    /* System generated locals */
    integer dgdx_dim1, dgdx_offset, vold_dim1, vold_offset, i__1, i__2;

    /* Local variables */
    integer j, mt, idof, node, idir, inode, idesvar;





/*     ---------------------------------------------------------------- */
/*     Calculation of the total differential: */
/*     dgdx = dgdx + vold^(T) * ( df ) */
/*     ---------------------------------------------------------------- */

    /* Parameter adjustments */
    --df;
    dgdx_dim1 = *ndesi;
    dgdx_offset = 1 + dgdx_dim1;
    dgdx -= dgdx_offset;
    --mi;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;
    --nactdofinv;
    --jqs;
    --irows;

    /* Function Body */
    mt = mi[2] + 1;

    i__1 = *ndesi;
    for (idesvar = 1; idesvar <= i__1; ++idesvar) {
	i__2 = jqs[idesvar + 1] - 1;
	for (j = jqs[idesvar]; j <= i__2; ++j) {
	    idof = irows[j];
	    inode = nactdofinv[idof];
	    node = inode / mt + 1;
	    idir = inode - mt * (inode / mt);
	    dgdx[idesvar + *iobject * dgdx_dim1] += vold[idir + node * 
		    vold_dim1] * df[j];
	}
    }

    return 0;
} /* objective_freq__ */

