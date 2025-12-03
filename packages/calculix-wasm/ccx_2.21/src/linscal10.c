/* linscal10.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int linscal10_(doublereal *scal, integer *konl, doublereal *
	scall, integer *idim, doublereal *shp)
{
    /* System generated locals */
    integer scal_dim1, scal_offset;


/*     calculates a linear approximation to the quadratic interpolation */
/*     of the temperatures in a C3D10 element. A */
/*     quadratic interpolation of the temperatures leads to quadratic */
/*     thermal stresses, which cannot be handled by the elements */
/*     displacement functions (which lead to linear stresses). Thus, */
/*     the temperatures are approximated by a linear function. */




    /* Parameter adjustments */
    --konl;
    scal_dim1 = *idim - 0 + 1;
    scal_offset = 0 + scal_dim1;
    scal -= scal_offset;
    shp -= 5;

    /* Function Body */
    *scall = (shp[8] + (shp[24] + shp[32] + shp[36]) / 2.) * scal[konl[1] * 
	    scal_dim1] + (shp[12] + (shp[24] + shp[28] + shp[40]) / 2.) * 
	    scal[konl[2] * scal_dim1] + (shp[16] + (shp[28] + shp[32] + shp[
	    44]) / 2.) * scal[konl[3] * scal_dim1] + (shp[20] + (shp[36] + 
	    shp[40] + shp[44]) / 2.) * scal[konl[4] * scal_dim1];

    return 0;
} /* linscal10_ */

