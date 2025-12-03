/* evalshapefunc.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int evalshapefunc_(doublereal *xil, doublereal *etl, 
	doublereal *xl2, integer *nopes, doublereal *p)
{
    /* System generated locals */
    integer i__1;

    /* Local variables */
    integer i__, j;
    extern /* Subroutine */ int shape3tri_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *)
	    , shape6tri_(doublereal *, doublereal *, doublereal *, doublereal 
	    *, doublereal *, doublereal *, integer *);
    doublereal xs2[6]	/* was [3][2] */, shp2[56]	/* was [7][8] */, 
	    xsj2[3];
    integer iflag;
    extern /* Subroutine */ int shape4q_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *)
	    , shape8q_(doublereal *, doublereal *, doublereal *, doublereal *,
	     doublereal *, doublereal *, integer *);





    /* Parameter adjustments */
    --p;
    xl2 -= 4;

    /* Function Body */
    iflag = 1;
    for (j = 1; j <= 3; ++j) {
	p[j] = 0.;
    }
    if (*nopes == 8) {
	shape8q_(xil, etl, &xl2[4], xsj2, xs2, shp2, &iflag);
    } else if (*nopes == 4) {
	shape4q_(xil, etl, &xl2[4], xsj2, xs2, shp2, &iflag);
    } else if (*nopes == 6) {
	shape6tri_(xil, etl, &xl2[4], xsj2, xs2, shp2, &iflag);
    } else {
	shape3tri_(xil, etl, &xl2[4], xsj2, xs2, shp2, &iflag);
    }
    i__1 = *nopes;
    for (i__ = 1; i__ <= i__1; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    p[j] += xl2[j + i__ * 3] * shp2[i__ * 7 - 4];
	}
    }

    return 0;
} /* evalshapefunc_ */

