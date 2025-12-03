/* packaging.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int packaging_(integer *nodedesiboun, integer *ndesiboun, 
	char *objectset, doublereal *xo, doublereal *yo, doublereal *zo, 
	doublereal *x, doublereal *y, doublereal *z__, integer *nx, integer *
	ny, integer *nz, doublereal *co, integer *ifree, integer *ndesia, 
	integer *ndesib, integer *iobject, integer *ndesi, doublereal *
	dgdxglob, integer *nk, doublereal *extnor, doublereal *g0, integer *
	nodenum, ftnlen objectset_len)
{
    /* System generated locals */
    integer dgdxglob_dim2, dgdxglob_offset, i__1;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double sqrt(doublereal);

    /* Local variables */
    integer iactnode, irefnode, neighbor[10], j, irefnodeid;
    doublereal xdesi, ydesi, zdesi;
    extern /* Subroutine */ int near3d_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     integer *, integer *, doublereal *, doublereal *, doublereal *, 
	    integer *, integer *, integer *);
    doublereal deltax, deltay, deltaz;
    integer nnodes;
    doublereal actdist, funcval;


/*     calcualtion of the actual wall thickness */





/*     PACKAGING is related to a GE constraint: */
/*     actdist>=0.0 */

/*     find minimum distance */

    /* Parameter adjustments */
    --nodedesiboun;
    objectset -= 486;
    --xo;
    --yo;
    --zo;
    --x;
    --y;
    --z__;
    --nx;
    --ny;
    --nz;
    co -= 4;
    dgdxglob_dim2 = *nk;
    dgdxglob_offset = 1 + 2 * (1 + dgdxglob_dim2);
    dgdxglob -= dgdxglob_offset;
    extnor -= 4;
    --g0;
    --nodenum;

    /* Function Body */
    nnodes = 1;
    i__1 = *ndesib;
    for (j = *ndesia; j <= i__1; ++j) {

	iactnode = nodedesiboun[j];
	xdesi = co[iactnode * 3 + 1];
	ydesi = co[iactnode * 3 + 2];
	zdesi = co[iactnode * 3 + 3];

	near3d_(&xo[1], &yo[1], &zo[1], &x[1], &y[1], &z__[1], &nx[1], &ny[1],
		 &nz[1], &xdesi, &ydesi, &zdesi, ifree, neighbor, &nnodes);

/*       Calculate the distance between the design variable */
/*       and the closest node from the reference node set */

	irefnode = neighbor[0];
	deltax = xo[irefnode] - xdesi;
	deltay = yo[irefnode] - ydesi;
	deltaz = zo[irefnode] - zdesi;

/* Computing 2nd power */
	d__1 = deltax;
/* Computing 2nd power */
	d__2 = deltay;
/* Computing 2nd power */
	d__3 = deltaz;
	actdist = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);
	dgdxglob[(iactnode + *iobject * dgdxglob_dim2 << 1) + 1] = actdist;

/*       Calculate the function value of the objective function */

	irefnodeid = nodenum[irefnode];
	funcval = deltax * extnor[irefnodeid * 3 + 1] + deltay * extnor[
		irefnodeid * 3 + 2] + deltaz * extnor[irefnodeid * 3 + 3];
	dgdxglob[(iactnode + *iobject * dgdxglob_dim2 << 1) + 2] = funcval;

/*       count number of active nodes */

	if (dgdxglob[(iactnode + *iobject * dgdxglob_dim2 << 1) + 2] >= 0.) {
	    g0[*iobject] += 1.;
	}

    }

    return 0;
} /* packaging_ */

