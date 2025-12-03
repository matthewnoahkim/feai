/* pk_cdc_cl3d.f -- translated by f2c (version 20200916).
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

static doublereal c_b2 = 2.;
static doublereal c_b3 = 7.;
static doublereal c_b4 = 1.5;


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

/* cd compressible for class 3 orifices where l/d>0 and r/d>0 */
/* type d) with 0.5<=l/d<=2 (eq. 27) */

/*     author: Yannick Muller */

/* Subroutine */ int pk_cdc_cl3d__(doublereal *lqd, doublereal *rqd, 
	doublereal *reynolds, doublereal *p2p1, doublereal *beta, doublereal *
	cdc_cl3d__)
{
    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *), exp(doublereal);

    /* Local variables */
    extern /* Subroutine */ int pk_cdi_rl__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *);
    doublereal zeta, cdc_cl3_choked__, cdi_rl__, jpsqpt;




    cdc_cl3_choked__ = 1. - (exp(*rqd * -5.5 - pow_dd(rqd, &c_b2) * 3.5) * 
	    .992 + .008) * .16200000000000003;

    pk_cdi_rl__(lqd, rqd, reynolds, beta, &cdi_rl__);

/*     help function for eq 26 */
    if (*p2p1 >= 1.) {
	jpsqpt = 1.;
    } else if (*p2p1 >= .1) {
	zeta = (1. - *p2p1) / .6;
	jpsqpt = exp(pow_dd(&zeta, &c_b3) * -4.6 - pow_dd(&zeta, &c_b4) * 2.2)
		;
    } else {
	jpsqpt = 0.;
    }

    *cdc_cl3d__ = cdc_cl3_choked__ - jpsqpt * (cdc_cl3_choked__ - cdi_rl__);

    return 0;

} /* pk_cdc_cl3d__ */

