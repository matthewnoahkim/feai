/* cd_ms_ms.f -- translated by f2c (version 20200916).
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
static doublereal c_b3 = 1.2;
static doublereal c_b4 = .6;
static doublereal c_b5 = .9;


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

/* Subroutine */ int cd_ms_ms__(doublereal *p1, doublereal *p2, doublereal *
	t1, doublereal *rad, doublereal *d__, doublereal *xl, doublereal *
	kappa, doublereal *r__, doublereal *reynolds, doublereal *u, 
	doublereal *vid, doublereal *cd)
{
    /* System generated locals */
    doublereal d__1, d__2;

    /* Builtin functions */
    double exp(doublereal), pow_dd(doublereal *, doublereal *), sqrt(
	    doublereal);

    /* Local variables */
    doublereal q, c1, c2, c3, rv, aux, rzd, fakt, qlim, lkorr, qkorr;


/*     This subroutine enables to calculate the discharge coefficient for an */
/*     orifice (shap edged , rotating..) following the results obtained */
/*     by Mcgreehan and Schotsch */
/*     The decription of the method can be found in : */
/*     "Flow characteristics of long orifices with rotation and */
/*     corner radiusing" */
/*     ASME 87-GT-162 */

/*     author: Yannick Muller */



    qlim = 10.;

/*     taking in account the influence of the Reynolds number */

    *cd = 372. / *reynolds + .5885;
    *cd = min(*cd,1.);

/*     taking in account the edge radius */

    rzd = *rad / *d__;
    aux = exp(-(rzd * 3.5 + 5.5) * rzd);
    fakt = aux + (1. - aux) * .008;
    *cd = 1. - fakt * (1. - *cd);
/* Computing MIN */
    d__1 = max(*cd,0.);
    *cd = min(d__1,1.);

/*     taking in account the lenght of the orifice */

    lkorr = *xl - *rad;
    q = lkorr / *d__;
    qkorr = min(q,qlim);
    fakt = (exp(pow_dd(&qkorr, &c_b2) * -1.606) * 1.3 + 1.) * (qkorr * .021 + 
	    .435) / 1.0004999999999999;
    *cd = 1. - fakt * (1. - *cd);
/* Computing MIN */
    d__1 = max(*cd,0.);
    *cd = min(d__1,1.);

/*     taking in account the tangential velocity */

    if (*u != 0.) {
	d__1 = *p2 / *p1;
	d__2 = (*kappa - 1.) / *kappa;
	*vid = sqrt(*kappa * 2. / (*kappa - 1.) * *r__ * *t1 * (1. - pow_dd(&
		d__1, &d__2)));
/* Computing 3rd power */
	d__1 = .6 / *cd;
	rv = *u / *vid * (d__1 * (d__1 * d__1));
	c1 = exp(-pow_dd(&rv, &c_b3));
	c2 = pow_dd(&rv, &c_b4) * .5 * sqrt(.6 / *cd);
	c3 = exp(pow_dd(&rv, &c_b5) * -.5);
	*cd *= c1 + c2 * c3;
/* Computing MIN */
	d__1 = max(*cd,0.);
	*cd = min(d__1,1.);

    }


    return 0;
} /* cd_ms_ms__ */

