/* pk_cdi_rl.f -- translated by f2c (version 20200916).
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

/* Table of constant values */

static doublereal c_b2 = 2.33;


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

/* cd incompressible for long orifices (eq.6) */

/*     author: Yannick Muller */

/* Subroutine */ int pk_cdi_rl__(doublereal *lqd, doublereal *rqd, doublereal 
	*reynolds, doublereal *beta, doublereal *cdi_rl__)
{
    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *), exp(doublereal);

    /* Local variables */
    extern /* Subroutine */ int pk_cdi_r__(doublereal *, doublereal *, 
	    doublereal *, doublereal *);
    doublereal lrqd, cdi_r__, glrqd, rqd_cor__;




    rqd_cor__ = *rqd;

    if (rqd_cor__ > *lqd) {
	rqd_cor__ = *lqd;
    }

    lrqd = *lqd - rqd_cor__;

    pk_cdi_r__(&rqd_cor__, reynolds, beta, &cdi_r__);

    glrqd = (exp(pow_dd(&lrqd, &c_b2) * -1.593) * 1.298 + 1.) * (lrqd * .021 
	    + .435) / .99963000000000002;

    *cdi_rl__ = 1. - glrqd * (1. - cdi_r__);

    return 0;

} /* pk_cdi_rl__ */

