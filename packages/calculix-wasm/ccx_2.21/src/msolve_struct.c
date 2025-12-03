/* msolve_struct.f -- translated by f2c (version 20200916).
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

/*     matrix preconditioning: used in dgmres.f */

/* Subroutine */ int msolve_struct__(integer *n, doublereal *r__, doublereal *
	z__, integer *nelt, integer *ia, integer *ja, doublereal *a, integer *
	isym, doublereal *rwork, integer *iwork)
{
    /* System generated locals */
    integer i__1;

    /* Local variables */
    integer i__;





/* $omp parallel default(none) */
/* $omp& shared(n,z,r,rwork) */
/* $omp& private(i) */
/* $omp do */
    /* Parameter adjustments */
    --iwork;
    --rwork;
    --a;
    --ja;
    --ia;
    --z__;
    --r__;

    /* Function Body */
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	z__[i__] = r__[i__] * rwork[i__];
    }
/* $omp end do */
/* $omp end parallel */

    return 0;
} /* msolve_struct__ */

