/* preconditioning.f -- translated by f2c (version 20200916).
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

/*     diagonal preconditioning of a matrix */

/* Subroutine */ int preconditioning_(doublereal *ad, doublereal *au, 
	doublereal *b, integer *neq, integer *irow, integer *jq, doublereal *
	adaux)
{
    /* System generated locals */
    integer i__1, i__2;
    doublereal d__1;

    /* Builtin functions */
    double sqrt(doublereal);

    /* Local variables */
    integer i__, ic, ir;
    doublereal adc;





/*     inverse of the square root of the diagonal */
/*     the sign takes care that the diagonal term becomes 1 */
/*     (and not -1) */

/*     taking zero's on the diagonal into account (adaux(i)=1 in such case) */

/*      do i=1,neq */
/*         if(dabs(ad(i)).lt.1.d-30) then */
/*            adaux(i)=dsign(1.d0,ad(i)) */
/*         else */
/*            adaux(i)=dsign(1.d0/dsqrt(dabs(ad(i))),ad(i)) */
/*         endif */
/*      enddo */
    /* Parameter adjustments */
    --adaux;
    --jq;
    --irow;
    --b;
    --au;
    --ad;

    /* Function Body */
    i__1 = *neq;
    for (i__ = 1; i__ <= i__1; ++i__) {
	if ((d__1 = ad[i__], abs(d__1)) < 1e-30) {
	    adaux[i__] = 1.;
	} else {
	    adaux[i__] = 1. / sqrt((d__1 = ad[i__], abs(d__1)));
	}
    }
/*      do i=1,neq */
/*         adaux(i)=1.d0/dsqrt(dabs(ad(i))) */
/*      enddo */

/*     scaling the matrix and the right hand side */

    i__1 = *neq;
    for (ic = 1; ic <= i__1; ++ic) {
	adc = (d__1 = adaux[ic], abs(d__1));

/*        scaling the diagonal */

	ad[ic] = ad[ic] * adc * adaux[ic];

/*        scaling the off-diagonal terms */

	i__2 = jq[ic + 1] - 1;
	for (i__ = jq[ic]; i__ <= i__2; ++i__) {
	    ir = irow[i__];
/*            write(*,*) 'au before',i,au(i),adc,ir,adaux(ir) */
	    au[i__] = au[i__] * adc * adaux[ir];
/*            write(*,*) 'au after',i,au(i) */
	}

/*        scaling the right hand side */

	b[ic] *= adaux[ic];
    }

/*     taking the absolute value */

    i__1 = *neq;
    for (i__ = 1; i__ <= i__1; ++i__) {
	adaux[i__] = (d__1 = adaux[i__], abs(d__1));
    }

    return 0;
} /* preconditioning_ */

