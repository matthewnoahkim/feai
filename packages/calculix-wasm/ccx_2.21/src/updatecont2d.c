/* updatecont2d.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int updatecont2d_(integer *koncont, integer *ncont, 
	doublereal *co, doublereal *cg, doublereal *straight)
{
    /* System generated locals */
    integer i__1;

    /* Local variables */
    integer i__, j, k;
    doublereal col[6]	/* was [2][3] */;
    integer node;
    extern /* Subroutine */ int straighteq2d_(doublereal *, doublereal *);


/*     update geometric date of the contact master surface triangulation */




    /* Parameter adjustments */
    straight -= 10;
    cg -= 3;
    co -= 3;
    koncont -= 4;

    /* Function Body */
    i__1 = *ncont;
    for (i__ = 1; i__ <= i__1; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    node = koncont[j + i__ * 3];
	    for (k = 1; k <= 2; ++k) {
		col[k + (j << 1) - 3] = co[k + (node << 1)];
	    }
	}

/*        center of gravity of the triangles */

	for (k = 1; k <= 2; ++k) {
	    cg[k + (i__ << 1)] = col[k - 1];
	}
	for (j = 2; j <= 3; ++j) {
	    for (k = 1; k <= 2; ++k) {
		cg[k + (i__ << 1)] += col[k + (j << 1) - 3];
	    }
	}
	for (k = 1; k <= 2; ++k) {
	    cg[k + (i__ << 1)] /= 3.;
	}

/*        calculating the equation of the triangle plane and the planes */
/*        perpendicular on it and through the triangle edges */

	straighteq2d_(col, &straight[i__ * 9 + 1]);

    }

    return 0;
} /* updatecont2d_ */

