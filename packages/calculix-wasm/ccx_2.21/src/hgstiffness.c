/* hgstiffness.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int hgstiffness_(doublereal *s, doublereal *elas, doublereal 
	*a, doublereal *gs)
{
    /* System generated locals */
    integer i__1;

    /* Local variables */
    integer m1, ii, jj, ii1, jj1;
    doublereal ahr, hgls;


/*     hourglass control stiffness for 8-node solid mean strain element */

/*     Reference: Flanagan, D.P., Belytschko, T.; "Uniform  strain hexahedron */
/*     and quadrilateral with orthogonal Hourglass control". Int. J. Num. */
/*     Meth. Engg., Vol. 17, 679-706, 1981. */

/*     author: Otto-Ernst Bernhardi */






    /* Parameter adjustments */
    gs -= 9;
    --elas;
    s -= 61;

    /* Function Body */
    ahr = elas[1] * *a;
/*     write(6,*) "stiffness:", ahr */

    jj1 = 1;
    for (jj = 1; jj <= 8; ++jj) {
	ii1 = 1;
	i__1 = jj;
	for (ii = 1; ii <= i__1; ++ii) {
	    hgls = 0.;
	    for (m1 = 1; m1 <= 4; ++m1) {
		hgls += gs[jj + (m1 << 3)] * gs[ii + (m1 << 3)];
	    }
	    hgls *= ahr;
	    s[ii1 + jj1 * 60] += hgls;
	    s[ii1 + 1 + (jj1 + 1) * 60] += hgls;
	    s[ii1 + 2 + (jj1 + 2) * 60] += hgls;
	    ii1 += 3;
	}
	jj1 += 3;
    }
    return 0;
} /* hgstiffness_ */

