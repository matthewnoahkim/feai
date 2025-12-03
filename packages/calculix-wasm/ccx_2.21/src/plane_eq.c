/* plane_eq.f -- translated by f2c (version 20200916).
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

/*     Subroutine plane_eq.f */

/*     Creates the plane equation from three known points. */
/*     Gives the z-coordinate of the fourth point as an output. */

/*     x1,y1,z1: The coordinates of the first point */
/*     x2,y2,z2: The coordinates of the second point */
/*     x3,y3,z3: The coordinates of the third point */
/*     x0,y0: The x and y-coordinates for the fourth point */
/*     output: The z-coordinate according to the x0 and y0 */

/*     by: Jaro Hokkanen */

/* Subroutine */ int plane_eq__(doublereal *x1, doublereal *y1, doublereal *
	z1, doublereal *x2, doublereal *y2, doublereal *z2, doublereal *x3, 
	doublereal *y3, doublereal *z3, doublereal *x0, doublereal *y0, 
	doublereal *output)
{
    doublereal a, b, c__, d__;




    d__ = *x1 * *y2 * *z3 + *y1 * *z2 * *x3 + *z1 * *x2 * *y3 - *x1 * *z2 * *
	    y3 - *y1 * *x2 * *z3 - *z1 * *y2 * *x3;
    if (d__ != 0.) {
	a = 1. / d__ * (*y2 * *z3 + *y1 * *z2 + *z1 * *y3 - *z2 * *y3 - *y1 * 
		*z3 - *z1 * *y2);
    }
    if (d__ != 0.) {
	b = 1. / d__ * (*x1 * *z3 + *z2 * *x3 + *z1 * *x2 - *x1 * *z2 - *x2 * 
		*z3 - *z1 * *x3);
    }
    if (d__ != 0.) {
	c__ = 1. / d__ * (*x1 * *y2 + *y1 * *x3 + *x2 * *y3 - *x1 * *y3 - *y1 
		* *x2 - *y2 * *x3);
    }
    if (d__ != 0.) {
	*output = 1. / c__ * (1. - a * *x0 - b * *y0);
    } else {
	*output = 0.;
    }
    return 0;
} /* plane_eq__ */

