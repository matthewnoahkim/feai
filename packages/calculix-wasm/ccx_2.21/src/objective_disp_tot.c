/* objective_disp_tot.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int objective_disp_tot__(doublereal *dgdx, doublereal *df, 
	integer *ndesi, integer *iobject, integer *jqs, integer *irows, 
	doublereal *dgdu)
{
    /* System generated locals */
    integer dgdx_dim1, dgdx_offset, i__1, i__2;

    /* Local variables */
    integer j, idof, idesvar;






/*     ---------------------------------------------------------------- */
/*     Calculation of the total differential: */
/*     non-linear:  dgdx = dgdx + dgdu * ( df ) */
/*     ---------------------------------------------------------------- */

/*     Calculation of the total differential: */

    /* Parameter adjustments */
    --df;
    dgdx_dim1 = *ndesi;
    dgdx_offset = 1 + dgdx_dim1;
    dgdx -= dgdx_offset;
    --jqs;
    --irows;
    --dgdu;

    /* Function Body */
    i__1 = *ndesi;
    for (idesvar = 1; idesvar <= i__1; ++idesvar) {
	i__2 = jqs[idesvar + 1] - 1;
	for (j = jqs[idesvar]; j <= i__2; ++j) {
	    idof = irows[j];
	    dgdx[idesvar + *iobject * dgdx_dim1] += dgdu[idof] * df[j];
	}
    }

    return 0;
} /* objective_disp_tot__ */

