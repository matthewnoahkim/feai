/* dKdm.f -- translated by f2c (version 20200916).
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

static doublereal c_b2 = 1.75;
static doublereal c_b3 = 28.;
static doublereal c_b5 = .75;
static doublereal c_b7 = 1.6;
static doublereal c_b8 = .8;


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

/*     d{K(X)}/dxflow */

/*     author: Yannick Muller */

/* Subroutine */ int dkdm_(doublereal *x, doublereal *u, doublereal *uprime, 
	doublereal *rpar, integer *ipar)
{
    /* System generated locals */
    doublereal d__1, d__2, d__3, d__4;

    /* Builtin functions */
    double sqrt(doublereal), pow_dd(doublereal *, doublereal *);

    /* Local variables */
    doublereal zk0;
    extern doublereal f_k__(doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *);
    doublereal phi, k_x__, kup, pup, tup, f1_x__, rurd, df1dk, xflow, lambda1;




/*     defining the parameters */
    /* Parameter adjustments */
    --rpar;
    --uprime;
    --u;

    /* Function Body */
    phi = rpar[1];
    lambda1 = rpar[2];
    zk0 = rpar[3];
    pup = rpar[4];
    tup = rpar[5];
    rurd = rpar[6];
    xflow = rpar[7];
    kup = rpar[8];

/*     find K(X) for the given x */
    k_x__ = f_k__(x, &phi, &lambda1, &zk0, &pup, &tup, &rurd, &xflow, &kup);

    k_x__ = sqrt(k_x__ / *x);

/*     f1_x */
    d__3 = zk0 * k_x__;
    d__4 = (d__2 = 1 - k_x__, abs(d__2));
    f1_x__ = pow_dd(&d__3, &c_b2) - (1 - k_x__) / (d__1 = 1 - k_x__, abs(d__1)
	    ) * pow_dd(&d__4, &c_b3);

/*     df1dK */
    d__2 = (d__1 = 1 - k_x__, abs(d__1));
    df1dk = pow_dd(&zk0, &c_b2) * 1.75 * pow_dd(&k_x__, &c_b5) + pow_dd(&d__2,
	     &c_b5) * 1.75;


/* Computing 2nd power */
    d__1 = xflow;
    uprime[1] = -pow_dd(x, &c_b7) * lambda1 * pow_dd(&pup, &c_b8) / (d__1 * 
	    d__1 * pow_dd(&tup, &c_b8)) * f1_x__ + u[1] * (lambda1 * pow_dd(x,
	     &c_b7) * pow_dd(&pup, &c_b8) / (xflow * pow_dd(&tup, &c_b8)) * 
	    df1dk - 2 / *x);

    return 0;

} /* dkdm_ */

