/* calcdhds.f -- translated by f2c (version 20200916).
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

static doublereal c_b2 = 1.3333333333333333;
static doublereal c_b3 = 3.3333333333333335;


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

/*     Solve the Bresse equation for the turbulent stationary flow */
/*     in channels with a non-erosive bottom */

/* Subroutine */ int calcdhds_(doublereal *xflow, doublereal *b, doublereal *
	tth, doublereal *cthi, doublereal *s0, doublereal *sqrts0, doublereal 
	*friction, doublereal *xks, doublereal *h__, doublereal *dg, 
	doublereal *rho, doublereal *dhds)
{
    /* System generated locals */
    doublereal d__1, d__2;

    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *);

    /* Local variables */
    doublereal p, bb, sf, area;




    area = *h__ * (*b + *h__ * *tth);
    bb = *b + *h__ * 2. * *tth;
    p = *b + *h__ * 2. * *cthi;

    if (*xks > 0.) {

/*       White-Colebrook */

/* Computing 2nd power */
	d__1 = *xflow / *rho;
/* Computing 3rd power */
	d__2 = area;
	sf = *friction * p * (d__1 * d__1) / (*dg * 8. * (d__2 * (d__2 * d__2)
		));
    } else {

/*       Manning */

/* Computing 2nd power */
	d__1 = *xks * *xflow / *rho;
	sf = d__1 * d__1 * pow_dd(&p, &c_b2) / pow_dd(&area, &c_b3);
    }

/* Computing 2nd power */
    d__1 = *xflow / *rho;
/* Computing 3rd power */
    d__2 = area;
    *dhds = (*s0 - sf) / (*sqrts0 - d__1 * d__1 * bb / (*dg * (d__2 * (d__2 * 
	    d__2))));

    return 0;
} /* calcdhds_ */

