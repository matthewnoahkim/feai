/* cd_pk_ms.f -- translated by f2c (version 20200916).
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

static doublereal c_b2 = -3.;
static doublereal c_b3 = 1.2;
static doublereal c_b4 = .6;
static doublereal c_b5 = .9;


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

/* Subroutine */ int cd_pk_ms__(doublereal *rad, doublereal *d__, doublereal *
	xl, doublereal *reynolds, doublereal *p2, doublereal *p1, doublereal *
	beta, doublereal *kappa, doublereal *cd, doublereal *u, doublereal *
	t1, doublereal *r__)
{
    /* System generated locals */
    doublereal d__1, d__2;

    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *), sqrt(doublereal), exp(
	    doublereal);

    /* Local variables */
    doublereal beta_cor__, c1, c2, c3;
    extern /* Subroutine */ int pk_cdc_cl1__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *), 
	    pk_cdc_cl3__(doublereal *, doublereal *, doublereal *, doublereal 
	    *, doublereal *, doublereal *, doublereal *);
    doublereal rv, lqd, p2p1, vid, rqd, rldb, ms_cdr__, cdc_cl1__, cdc_cl3__;


/*     This subroutines enable to calculate the compressible discharge */
/*     coefficient for thin and long orifices with corner radiusing; */

/*     author: Yannick Muller */



    p2p1 = *p2 / *p1;
    rqd = *rad / *d__;
    lqd = *xl / *d__;
    rldb = max(lqd,0.);

/*     the method of cd calculation for a sharp edged aperture is only valid */
/*     for beta comprised between 0 and 0.7 */

    if (*beta > .7) {
	beta_cor__ = .7;
    } else {
	beta_cor__ = *beta;
    }

/*     differences between class1 or class2 or class3 */

    if (lqd == rqd) {

/*     class1 */

	pk_cdc_cl1__(&lqd, reynolds, &p2p1, &beta_cor__, kappa, &cdc_cl1__);
	*cd = cdc_cl1__;
    } else {

/*     class2 or class3 (clas2 is a sub class of class3 ) */

	pk_cdc_cl3__(&lqd, &rqd, reynolds, &p2p1, &beta_cor__, kappa, &
		cdc_cl3__);
	*cd = cdc_cl3__;
    }

/*     if rotating orifice with Mac Greehan & Scotch */
/*     The decription of the method can be found in : */
/*     "Flow characteristics of long orifices with rotation and */
/*     corner radiusing" ASME 87-GT-16 */

/*     rotating case eq 17 */
    if (*u != 0.) {
	d__1 = *p2 / *p1;
	d__2 = (*kappa - 1.) / *kappa;
	vid = sqrt(*kappa * 2. / (*kappa - 1.) * *r__ * *t1 * (1. - pow_dd(&
		d__1, &d__2)));
	d__1 = *cd / .6;
	rv = *u / vid * pow_dd(&d__1, &c_b2);
	c1 = exp(-pow_dd(&rv, &c_b3));
	c2 = pow_dd(&rv, &c_b4) * .5 * sqrt(.6 / *cd);
	c3 = exp(pow_dd(&rv, &c_b5) * -.5);
	ms_cdr__ = *cd * (c1 + c2 * c3);
	*cd = ms_cdr__;
/* Computing MIN */
	d__1 = max(*cd,0.);
	*cd = min(d__1,1.);
    }

    return 0;
} /* cd_pk_ms__ */

