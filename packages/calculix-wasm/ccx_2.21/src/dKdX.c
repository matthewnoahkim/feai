/* dKdX.f -- translated by f2c (version 20200916).
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

static doublereal c_b2 = 1.6;
static doublereal c_b3 = 1.75;


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

/*     d{K(X)}/dX */

/*     author: Yannick Muller */

/* Subroutine */ int dkdx_(doublereal *x, doublereal *u, doublereal *uprime, 
	doublereal *rpar, integer *ipar)
{
    /* System generated locals */
    doublereal d__1, d__2, d__3, d__4;

    /* Builtin functions */
    double atan(doublereal), pow_dd(doublereal *, doublereal *);

    /* Local variables */
    doublereal zk0, phi;



/*     defining the parameters */
    /* Parameter adjustments */
    --rpar;
    --uprime;
    --u;

    /* Function Body */
    phi = rpar[1];
    zk0 = rpar[3];
    d__3 = zk0 * u[1];
    d__4 = (d__1 = 1. - u[1], abs(d__1));
    uprime[1] = atan(1.) * .315 / phi * pow_dd(x, &c_b2) * (pow_dd(&d__3, &
	    c_b3) - pow_dd(&d__4, &c_b3) * (1. - u[1]) / (d__2 = 1. - u[1], 
	    abs(d__2))) - u[1] * 2. / *x;

    return 0;

} /* dkdx_ */

