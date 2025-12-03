/* calc_ider_tee.f -- translated by f2c (version 20200916).
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
/*     Copyright (C) 1998-2023 Guido Dhondt */

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

/*     author: Yannick Muller */

/* Subroutine */ int calc_ider_tee__(doublereal *df, doublereal *pt1, 
	doublereal *tt1, doublereal *xflow1, doublereal *xflow2, doublereal *
	pt2, doublereal *tt2, doublereal *a1, doublereal *a2, doublereal *
	zeta_fac__, doublereal *kappa, doublereal *r__, integer *ider, 
	integer *iflag, doublereal *zeta)
{
    /* System generated locals */
    doublereal d__1;

    /* Local variables */
    doublereal h__, f0;
    extern doublereal calc_residual_tee__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, integer *, doublereal *);
    doublereal eps;




/*     Accuracy of the numerical derivatives */
/*     Step for the derivative */

    /* Parameter adjustments */
    --df;

    /* Function Body */
    eps = 1e-8f;

    f0 = calc_residual_tee__(pt1, tt1, xflow1, xflow2, pt2, tt2, a1, a2, 
	    zeta_fac__, kappa, r__, ider, iflag, zeta);

    h__ = eps * abs(*pt1);
    if (h__ == 0.) {
	h__ = eps;
    }
    d__1 = *pt1 + h__;
    df[1] = (calc_residual_tee__(&d__1, tt1, xflow1, xflow2, pt2, tt2, a1, a2,
	     zeta_fac__, kappa, r__, ider, iflag, zeta) - f0) / h__;

    h__ = eps * abs(*tt1);
    if (h__ == 0.) {
	h__ = eps;
    }
    d__1 = *tt1 + h__;
    df[2] = (calc_residual_tee__(pt1, &d__1, xflow1, xflow2, pt2, tt2, a1, a2,
	     zeta_fac__, kappa, r__, ider, iflag, zeta) - f0) / h__;

    h__ = eps * abs(*xflow1);
    if (h__ == 0.) {
	h__ = eps;
    }
    d__1 = *xflow1 + h__;
    df[3] = (calc_residual_tee__(pt1, tt1, &d__1, xflow2, pt2, tt2, a1, a2, 
	    zeta_fac__, kappa, r__, ider, iflag, zeta) - f0) / h__;

    h__ = eps * abs(*xflow2);
    if (h__ == 0.) {
	h__ = eps;
    }
    d__1 = *xflow2 + h__;
    df[4] = (calc_residual_tee__(pt1, tt1, xflow1, &d__1, pt2, tt2, a1, a2, 
	    zeta_fac__, kappa, r__, ider, iflag, zeta) - f0) / h__;

    h__ = eps * abs(*pt2);
    if (h__ == 0.) {
	h__ = eps;
    }
    d__1 = *pt2 + h__;
    df[5] = (calc_residual_tee__(pt1, tt1, xflow1, xflow2, &d__1, tt2, a1, a2,
	     zeta_fac__, kappa, r__, ider, iflag, zeta) - f0) / h__;

    h__ = eps * abs(*tt2);
    if (h__ == 0.) {
	h__ = eps;
    }
    d__1 = *tt2 + h__;
    df[6] = (calc_residual_tee__(pt1, tt1, xflow1, xflow2, pt2, &d__1, a1, a2,
	     zeta_fac__, kappa, r__, ider, iflag, zeta) - f0) / h__;

    return 0;
} /* calc_ider_tee__ */

