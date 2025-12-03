/* pk_y0_yg.f -- translated by f2c (version 20200916).
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

static doublereal c_b2 = 4.;
static doublereal c_b4 = 2.;


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

/* Subroutine */ int pk_y0_yg__(doublereal *p2p1, doublereal *beta, 
	doublereal *kappa, doublereal *y0, doublereal *yg)
{
    /* System generated locals */
    doublereal d__1, d__2;

    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *), sqrt(doublereal);

    /* Local variables */
    doublereal pcrit;




/*     adiabatic expansion factor y0 measured (eq.15-17) */

/*     author: Yannick Muller */

    d__1 = 2. / (*kappa + 1.);
    d__2 = *kappa / (*kappa - 1.);
    pcrit = pow_dd(&d__1, &d__2);
    if (*p2p1 >= .63) {
	*y0 = 1. - (pow_dd(beta, &c_b2) * .35 + .41) / *kappa * (1. - *p2p1);
    } else {
	*y0 = 1. - (pow_dd(beta, &c_b2) * .35 + .41) / *kappa * .37 - (pow_dd(
		beta, &c_b4) * .1207 + .3475 - pow_dd(beta, &c_b2) * .3177) * 
		(.63 - *p2p1);

    }

/*     adiabatic expension factor yg isentropic eq 18 */

    if (*p2p1 >= 1.) {
	*yg = 1.;

    } else if (*p2p1 >= pcrit) {
	d__1 = 1. / *kappa;
	d__2 = (*kappa - 1.) / *kappa;
	*yg = pow_dd(p2p1, &d__1) * sqrt(*kappa / (*kappa - 1.) * (1. - 
		pow_dd(p2p1, &d__2))) / sqrt(1. - *p2p1);

    } else {
/*     critical pressure ratio */
	d__1 = 2. / (*kappa + 1.);
	d__2 = 1. / (*kappa - 1.);
	*yg = pow_dd(&d__1, &d__2) * sqrt(*kappa / (*kappa + 1.)) / sqrt(1. - 
		*p2p1);
    }

    return 0;

} /* pk_y0_yg__ */

