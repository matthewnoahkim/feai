/* plane3.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int plane3_(doublereal *co, integer *nodep, doublereal *a, 
	doublereal *b, doublereal *c__, doublereal *d__)
{
    /* Builtin functions */
    double sqrt(doublereal);

    /* Local variables */
    integer i__;
    doublereal dd, p12[3], p31[3], p23[3];


/*     calculate the equation of the plane through the */
/*     nodes nodep(1),nodep(2) and nodep(3) in the form */
/*     a*x+b*y+c*z+d=0 such that the triangle through the */
/*     nodes nodep(1),nodep(2),nopep(3) is numbered clockwise */
/*     when looking in the direction of vector (a,b,c) */




/*     sides of the triangle */

    /* Parameter adjustments */
    --nodep;
    co -= 4;

    /* Function Body */
    for (i__ = 1; i__ <= 3; ++i__) {
	p12[i__ - 1] = co[i__ + nodep[2] * 3] - co[i__ + nodep[1] * 3];
	p23[i__ - 1] = co[i__ + nodep[3] * 3] - co[i__ + nodep[2] * 3];
	p31[i__ - 1] = co[i__ + nodep[1] * 3] - co[i__ + nodep[3] * 3];
    }

/*     normalized vector normal to the triangle: xn = p12 x p23 */

    *a = p12[1] * p23[2] - p12[2] * p23[1];
    *b = p12[2] * p23[0] - p12[0] * p23[2];
    *c__ = p12[0] * p23[1] - p12[1] * p23[0];
    dd = sqrt(*a * *a + *b * *b + *c__ * *c__);
    *a /= dd;
    *b /= dd;
    *c__ /= dd;

/*     determining the inhomogeneous term */

    *d__ = -(*a) * co[nodep[1] * 3 + 1] - *b * co[nodep[1] * 3 + 2] - *c__ * 
	    co[nodep[1] * 3 + 3];

    return 0;
} /* plane3_ */

