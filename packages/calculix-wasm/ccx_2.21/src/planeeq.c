/* planeeq.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int planeeq_(doublereal *cotet, integer *nodef, doublereal *
	planfal)
{
    /* Builtin functions */
    double sqrt(doublereal);

    /* Local variables */
    doublereal x1, y1, z1, x2, y2, z2, dd;


/*     calculate the equation of a plane through the points nodef(1), */
/*     nodef(2) and nodef(3). The equation of the plane is */
/*     planfal(1)*x+planfal(2)*y+planfal(3)*z+planfal(4)=0; the */
/*     coordinates of the nodes are stored in cotet */

/*     the vector (planefal(1),planfal(2),planfal(3)) is orthogonal */
/*     to the plane and is normalized */



    /* Parameter adjustments */
    --planfal;
    --nodef;
    cotet -= 4;

    /* Function Body */
    x1 = cotet[nodef[1] * 3 + 1] - cotet[nodef[2] * 3 + 1];
    y1 = cotet[nodef[1] * 3 + 2] - cotet[nodef[2] * 3 + 2];
    z1 = cotet[nodef[1] * 3 + 3] - cotet[nodef[2] * 3 + 3];

    x2 = cotet[nodef[1] * 3 + 1] - cotet[nodef[3] * 3 + 1];
    y2 = cotet[nodef[1] * 3 + 2] - cotet[nodef[3] * 3 + 2];
    z2 = cotet[nodef[1] * 3 + 3] - cotet[nodef[3] * 3 + 3];

    planfal[1] = y1 * z2 - y2 * z1;
    planfal[2] = x2 * z1 - x1 * z2;
    planfal[3] = x1 * y2 - x2 * y1;

    dd = sqrt(planfal[1] * planfal[1] + planfal[2] * planfal[2] + planfal[3] *
	     planfal[3]);

    if (dd < 1e-10) {
	planfal[1] = 0.;
	planfal[2] = 0.;
	planfal[3] = 0.;
	planfal[4] = 0.;
	return 0;
    }

    planfal[1] /= dd;
    planfal[2] /= dd;
    planfal[3] /= dd;

    planfal[4] = -(planfal[1] * cotet[nodef[1] * 3 + 1] + planfal[2] * cotet[
	    nodef[1] * 3 + 2] + planfal[3] * cotet[nodef[1] * 3 + 3]);

    return 0;
} /* planeeq_ */

