/* fsub.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int fsub_(doublereal *time, doublereal *t, doublereal *a, 
	doublereal *b, doublereal *dd, doublereal *h1, doublereal *h2, 
	doublereal *h3, doublereal *h4, doublereal *func, doublereal *funcp)
{
    /* Builtin functions */
    double exp(doublereal), sin(doublereal), cos(doublereal);

    /* Local variables */
    doublereal h8, h9, h10, h11, h12, h13, fcos, fsin, fexp;




    fexp = exp(-(*h1) * *t);
    fsin = sin(*dd * *t);
    fcos = cos(*dd * *t);
    h8 = (*a + *b * *time) * fexp / *h2;
    h9 = -(*b) * fexp / *h2;
    h10 = -h8 * *h1;
    h11 = h8 * *dd;
    h12 = h9 * (-(*h1) * *t - *h3 / *h2);
    h13 = h9 * (*dd * *t + *h4);

/*     function */

/*      fsub=(a+b*time)*fexp*(-h1*fsin-dd*fcos)/h2-b*fexp/h2*((-h1*t-h3/h2)* */
/*     &     fsin-(dd*t+h4)*fcos) */
    *func = h10 * fsin - h11 * fcos + h12 * fsin - h13 * fcos;

/*     derivative of the function */

    *funcp = -(*h1) * *func + *dd * (h10 * fcos + h11 * fsin + h12 * fcos + 
	    h13 * fsin);

    return 0;
} /* fsub_ */

