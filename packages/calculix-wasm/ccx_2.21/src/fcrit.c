/* fcrit.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int fcrit_(doublereal *time, doublereal *t, doublereal *a, 
	doublereal *b, doublereal *ze, doublereal *d__, doublereal *dd, 
	doublereal *h1, doublereal *h2, doublereal *h3, doublereal *h4, 
	doublereal *func, doublereal *funcp)
{
    /* Builtin functions */
    double exp(doublereal);

    /* Local variables */
    doublereal fexp;




    fexp = exp(-(*h1) * *t);

/*     function */

    *func = ((*a + *b * *time) * (-(*t) * *h2 - *h3) - *b * (-(*t) * *t * *h2 
	    - *t * 2. * *h3 - *h4 * 2.)) * fexp;

/*     derivative of the function */

    *funcp = ((*a + *b * *time) * *t - *b * (*h3 + *t * *h2 + *t * *t)) * 
	    fexp;

    return 0;
} /* fcrit_ */

