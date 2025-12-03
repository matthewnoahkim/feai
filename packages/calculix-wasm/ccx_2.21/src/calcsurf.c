/* calcsurf.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int calcsurf_(integer *n1, integer *n2, integer *n3, 
	doublereal *cotet, doublereal *surf)
{
    /* Builtin functions */
    double sqrt(doublereal);

    /* Local variables */
    doublereal s[3];


/*     calculates the surface of a tetrahedral face consisting */
/*     of nodes n1,n2 and n3 */




    /* Parameter adjustments */
    cotet -= 4;

    /* Function Body */
    s[0] = (cotet[*n2 * 3 + 2] - cotet[*n1 * 3 + 2]) * (cotet[*n3 * 3 + 3] - 
	    cotet[*n1 * 3 + 3]) - (cotet[*n2 * 3 + 3] - cotet[*n1 * 3 + 3]) * 
	    (cotet[*n3 * 3 + 2] - cotet[*n1 * 3 + 2]);
    s[1] = (cotet[*n2 * 3 + 3] - cotet[*n1 * 3 + 3]) * (cotet[*n3 * 3 + 1] - 
	    cotet[*n1 * 3 + 1]) - (cotet[*n2 * 3 + 1] - cotet[*n1 * 3 + 1]) * 
	    (cotet[*n3 * 3 + 3] - cotet[*n1 * 3 + 3]);
    s[2] = (cotet[*n2 * 3 + 1] - cotet[*n1 * 3 + 1]) * (cotet[*n3 * 3 + 2] - 
	    cotet[*n1 * 3 + 2]) - (cotet[*n2 * 3 + 2] - cotet[*n1 * 3 + 2]) * 
	    (cotet[*n3 * 3 + 1] - cotet[*n1 * 3 + 1]);
    *surf = sqrt(s[0] * s[0] + s[1] * s[1] + s[2] * s[2]) / 2.;

    return 0;
} /* calcsurf_ */

