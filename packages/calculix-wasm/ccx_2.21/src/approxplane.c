/* approxplane.f -- translated by f2c (version 20200916).
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
/*              Copyright (C) 1998 Guido Dhondt */

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

/* Subroutine */ int approxplane_(doublereal *col, doublereal *straight, 
	doublereal *xn, integer *nopes)
{
    /* System generated locals */
    integer i__1;

    /* Builtin functions */
    double sqrt(doublereal);

    /* Local variables */
    integer i__, j, k;
    doublereal dd, ps[24]	/* was [8][3] */, colmean[3];


/*     calculate the equation of the planes through the */
/*     edges of a quadrilateral and parallel to the vector xn together */
/*     with a plane perpendicular to xn and through the center of gravity */
/*     of the four corner nodes of the quadrilateral */
/*     (so-called mean quadrilateral plane) with */
/*     (col(1,1),col(2,1),col(3,1)),(col(1,2),col(2,2),col(3,2)), */
/*     (col(1,3),col(2,3),col(3,3)),(col(1,4),col(2,4),col(3,4)) */
/*     as vertices. The equation of the planes through the first edge */
/*     (connecting the first and the second node) is of the form */
/*     straight(1)*x+straight(2)*y+straight(3)*z+straight(4)=0, such that the */
/*     vector (straight(1),straight(2),straight(3)) points outwards (replace */
/*     (1) by (5),(9) and (13) for the second, third and fourth edge, */
/*     similar offset for (2),(3) and (4); */
/*     The equation of the mean quadrilateral plane is */
/*     straight(17)*x+straight(18)*y+straight(19)*z+straight(20)=0 such */
/*     that the quadrilateral is numbered clockwise when looking in the */
/*     direction of vector (straight(17),straight(18),straight(19)). */

/*     adapted for quadratic elements hex20, tet10 */
/*     Author: Saskia Sitzmann */






/*     sides of the quadrilateral */

    /* Parameter adjustments */
    --straight;
    --xn;
    col -= 4;

    /* Function Body */
    for (i__ = 1; i__ <= 3; ++i__) {
	i__1 = *nopes - 1;
	for (j = 1; j <= i__1; ++j) {
	    ps[j + (i__ << 3) - 9] = col[i__ + (j + 1) * 3] - col[i__ + j * 3]
		    ;
	}
	ps[*nopes + (i__ << 3) - 9] = col[i__ + 3] - col[i__ + *nopes * 3];
    }

/*     mean normal to the quadrilateral (given) */

    for (i__ = 1; i__ <= 3; ++i__) {
	straight[(*nopes << 2) + i__] = xn[i__];
    }

/*     ps(j,:) x xn */

    i__1 = *nopes;
    for (j = 1; j <= i__1; ++j) {
	k = j - 1 << 2;
	straight[k + 1] = ps[j + 7] * xn[3] - ps[j + 15] * xn[2];
	straight[k + 2] = ps[j + 15] * xn[1] - ps[j - 1] * xn[3];
	straight[k + 3] = ps[j - 1] * xn[2] - ps[j + 7] * xn[1];
	dd = sqrt(straight[k + 1] * straight[k + 1] + straight[k + 2] * 
		straight[k + 2] + straight[k + 3] * straight[k + 3]);
	for (i__ = 1; i__ <= 3; ++i__) {
	    straight[k + i__] /= dd;
	}
    }

/*     determining the inhomogeneous terms */

    for (i__ = 1; i__ <= 3; ++i__) {
	colmean[i__ - 1] = 0.;
    }
    i__1 = *nopes;
    for (j = 1; j <= i__1; ++j) {
	k = j - 1 << 2;
	straight[k + 4] = -straight[k + 1] * col[j * 3 + 1] - straight[k + 2] 
		* col[j * 3 + 2] - straight[k + 3] * col[j * 3 + 3];
	for (i__ = 1; i__ <= 3; ++i__) {
	    colmean[i__ - 1] += col[i__ + j * 3];
	}
    }
    straight[(*nopes << 2) + 4] = (-xn[1] * colmean[0] - xn[2] * colmean[1] - 
	    xn[3] * colmean[2]) / *nopes;

    return 0;
} /* approxplane_ */

