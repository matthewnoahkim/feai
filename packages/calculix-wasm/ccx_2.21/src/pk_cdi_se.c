/* pk_cdi_se.f -- translated by f2c (version 20200916).
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

static doublereal c_b2 = 2.1;
static doublereal c_b3 = 8.;
static doublereal c_b4 = 4.;
static doublereal c_b6 = 3.;
static doublereal c_b7 = 1.75;
static doublereal c_b8 = .75;


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

/* cd incompressible for sharp edged orifices( eq.3) */

/*     author: Yannick Muller */

/* Subroutine */ int pk_cdi_se__(doublereal *reynolds, doublereal *beta, 
	doublereal *cdi_se__)
{
    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *);

    /* Local variables */
    doublereal reynolds_cor__;




    if (*reynolds == 0.) {
	reynolds_cor__ = 1.;
    } else {
	reynolds_cor__ = *reynolds;
    }

    *cdi_se__ = pow_dd(beta, &c_b2) * .0312 + .5959 - pow_dd(beta, &c_b3) * 
	    .184 + pow_dd(beta, &c_b4) * .038996999999999997 / (1. - pow_dd(
	    beta, &c_b4)) - pow_dd(beta, &c_b6) * .015838999999999999 + 
	    pow_dd(beta, &c_b7) * 91.71 / pow_dd(&reynolds_cor__, &c_b8);

    return 0;

} /* pk_cdi_se__ */

