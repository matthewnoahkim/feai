/* umpc_dist.f -- translated by f2c (version 20200916).
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

static integer c__9 = 9;
static integer c__1 = 1;


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

/* Subroutine */ int umpc_dist__(doublereal *x, doublereal *u, doublereal *f, 
	doublereal *a, integer *jdof, integer *n, doublereal *force, integer *
	iit, integer *idiscon)
{
    /* System generated locals */
    doublereal d__1, d__2, d__3, d__4;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    integer ifix;
    doublereal dist[3];

    /* Fortran I/O blocks */
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___4 = { 0, 6, 0, 0, 0 };
    static cilist io___5 = { 0, 6, 0, 0, 0 };
    static cilist io___6 = { 0, 6, 0, 0, 0 };



/*     updates the coefficients in a dist mpc (name DIST) */

/*     a dist mpc specifies that the distance between two nodes */
/*     a and b must not exceed value d */

/*     input nodes: a,a,a,b,b,b,c */

/*     node c is a fictitious node. The value d must be assigned */
/*     to the first coordinate of node c by means of a *NODE card; */
/*     the other coordinates of the node can be arbitrary. */

/*     A value of zero must be assigned to the first DOF of node c by using */
/*     a *BOUNDARY card. The second DOF of node c is not constrained and is */
/*     used when the distance between nodes a and b is less than d: in */
/*     that case there is no constraint at all. */

/*     INPUT: */

/*     x(3,n)             Carthesian coordinates of the nodes in the */
/*                        user mpc. */
/*     u(3,n)             Actual displacements of the nodes in the */
/*                        user mpc. */
/*     jdof               Actual degrees of freedom of the mpc terms */
/*     n                  number of terms in the user mpc */
/*     force              Actual value of the mpc force */
/*     iit                iteration number */

/*     OUTPUT: */

/*     f                  Actual value of the mpc. If the mpc is */
/*                        exactly satisfied, this value is zero */
/*     a(n)               coefficients of the linearized mpc */
/*     jdof               Corrected degrees of freedom of the mpc terms */
/*     idiscon            0: no discontinuity */
/*                        1: discontinuity */
/*                        If a discontinuity arises the previous */
/*                        results are not extrapolated at the start of */
/*                        a new increment */




/*      write(*,*) (jdof(i),i=1,7) */
    /* Parameter adjustments */
    --jdof;
    --a;
    u -= 4;
    x -= 4;

    /* Function Body */
    if (jdof[7] == 1) {
	ifix = 1;
    } else {
	ifix = 0;
	jdof[7] = 2;
    }

    dist[0] = x[4] + u[4] - x[13] - u[13];
    dist[1] = x[5] + u[5] - x[14] - u[14];
    dist[2] = x[6] + u[6] - x[15] - u[15];

/* Computing 2nd power */
    d__1 = dist[0];
/* Computing 2nd power */
    d__2 = dist[1];
/* Computing 2nd power */
    d__3 = dist[2];
/* Computing 2nd power */
    d__4 = x[22];
    *f = d__1 * d__1 + d__2 * d__2 + d__3 * d__3 - d__4 * d__4;

/*      write(*,*) 'mpcforc=, f= ',force,f */

    a[7] = -1.;

/*     only one change per increment is allowed */
/*        (change= from free to linked or vice versa) */
/*     ifix=0: free */
/*     ifix=1: linked */

    if (ifix == 0) {

/*        previous state: free */

	if (*f < 0.) {

/*           new state: free */

	    *f = 0.;
	} else if (*iit <= 1) {

/*           new state: linked */

	    s_wsle(&io___3);
	    do_lio(&c__9, &c__1, "switch to linked", (ftnlen)16);
	    e_wsle();
	    s_wsle(&io___4);
	    e_wsle();
	    jdof[7] = 1;
	    *idiscon = 1;
	} else {

/*           new state: free */

	    *f = 0.;
	}
    } else {

/*        previous state: linked */

	if (*force <= 0.) {

/*           new state: linked */

	} else if (*iit <= 1) {

/*           new state: free */

	    s_wsle(&io___5);
	    do_lio(&c__9, &c__1, "switch to free", (ftnlen)14);
	    e_wsle();
	    s_wsle(&io___6);
	    e_wsle();
	    jdof[7] = 2;
	    *f = 0.;
	    *idiscon = 1;
	} else {

/*           new state: linked */

	}
    }

    if ((d__1 = dist[jdof[1] - 1], abs(d__1)) > 1e-10) {
	a[1] = dist[jdof[1] - 1] * 2.;
	if (jdof[1] == 1) {
	    jdof[2] = 2;
	    jdof[3] = 3;
	} else if (jdof[1] == 2) {
	    jdof[2] = 3;
	    jdof[3] = 1;
	} else {
	    jdof[2] = 1;
	    jdof[3] = 2;
	}
	a[2] = dist[jdof[2] - 1] * 2.;
	a[3] = dist[jdof[3] - 1] * 2.;
    } else {
	if (jdof[1] == 3) {
	    jdof[1] = 1;
	} else {
	    ++jdof[1];
	}
	if ((d__1 = dist[jdof[1] - 1], abs(d__1)) > 1e-10) {
	    a[1] = dist[jdof[1] - 1] * 2.;
	    if (jdof[1] == 1) {
		jdof[2] = 2;
		jdof[3] = 3;
	    } else if (jdof[1] == 2) {
		jdof[2] = 3;
		jdof[3] = 1;
	    } else {
		jdof[2] = 1;
		jdof[3] = 2;
	    }
	    a[2] = dist[jdof[2] - 1] * 2.;
	    a[3] = dist[jdof[3] - 1] * 2.;
	} else {
	    if (jdof[1] == 3) {
		jdof[1] = 1;
	    } else {
		++jdof[1];
	    }
	    if ((d__1 = dist[jdof[1] - 1], abs(d__1)) > 1e-10) {
		a[1] = dist[jdof[1] - 1] * 2.;
		if (jdof[1] == 1) {
		    jdof[2] = 2;
		    jdof[3] = 3;
		} else if (jdof[1] == 2) {
		    jdof[2] = 3;
		    jdof[3] = 1;
		} else {
		    jdof[2] = 1;
		    jdof[3] = 2;
		}
		a[2] = dist[jdof[2] - 1] * 2.;
		a[3] = dist[jdof[3] - 1] * 2.;
	    }
	}
    }

    a[4] = dist[0] * -2.;
    a[5] = dist[1] * -2.;
    a[6] = dist[2] * -2.;
    jdof[4] = 1;
    jdof[5] = 2;
    jdof[6] = 3;

/*      write(*,*) 'jdof,a' */
/*      do i=1,7 */
/*         write(*,*) jdof(i),a(i) */
/*      enddo */
/*      write(*,*) 'f ',f */

    return 0;
} /* umpc_dist__ */

