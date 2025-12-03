/* linvec10.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int linvec10_(doublereal *vec, integer *konl, doublereal *
	vecl, integer *istart, integer *iend, doublereal *shp)
{
    /* System generated locals */
    integer vec_dim1, vec_offset;

    /* Local variables */
    integer j;


/*     calculates a linear approximation to the quadratic interpolation */
/*     of the temperatures in a C3D10 element. A */
/*     quadratic interpolation of the temperatures leads to quadratic */
/*     thermal stresses, which cannot be handled by the elements */
/*     displacement functions (which lead to linear stresses). Thus, */
/*     the temperatures are approximated by a linear function. */




    /* Parameter adjustments */
    --konl;
    --vecl;
    vec_dim1 = *iend - *istart + 1;
    vec_offset = *istart + vec_dim1;
    vec -= vec_offset;
    shp -= 5;

    /* Function Body */
    for (j = 1; j <= 3; ++j) {
	vecl[j] = (shp[8] + (shp[24] + shp[32] + shp[36]) / 2.) * vec[j + 
		konl[1] * vec_dim1] + (shp[12] + (shp[24] + shp[28] + shp[40])
		 / 2.) * vec[j + konl[2] * vec_dim1] + (shp[16] + (shp[28] + 
		shp[32] + shp[44]) / 2.) * vec[j + konl[3] * vec_dim1] + (shp[
		20] + (shp[36] + shp[40] + shp[44]) / 2.) * vec[j + konl[4] * 
		vec_dim1];
    }

    return 0;
} /* linvec10_ */

