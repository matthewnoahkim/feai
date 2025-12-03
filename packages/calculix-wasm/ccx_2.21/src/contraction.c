/* contraction.f -- translated by f2c (version 20200916).
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
static integer c__201 = 201;


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
/*     in channels with a non-erosive bottom: sluice gate */

/* Subroutine */ int contraction_(integer *nelem, integer *ielprop, 
	doublereal *prop, integer *nup, integer *nmid, integer *ndo, 
	doublereal *dg, char *mode, doublereal *xflow, doublereal *rho, 
	integer *nelup, integer *neldo, integer *istack, integer *nstack, 
	integer *mi, doublereal *v, integer *inv, doublereal *epsilon, 
	doublereal *co, ftnlen mode_len)
{
    /* System generated locals */
    integer v_dim1, v_offset;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double atan(doublereal);
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);
    double sqrt(doublereal), tan(doublereal);

    /* Local variables */
    doublereal d__, e, b1, b2, s0, dl, hk, pi, xk, bdo, hdo, bup, hup;
    extern /* Subroutine */ int exit_(integer *);
    doublereal alpha, dgmod;
    integer index;
    extern /* Subroutine */ int hcrit_(doublereal *, doublereal *, doublereal 
	    *, doublereal *, doublereal *, doublereal *, doublereal *);
    doublereal tthdo, tthup, theta1, theta2, areado, sqrts0, areaup, thetado;
    extern /* Subroutine */ int henergy_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, char *, doublereal *, ftnlen);
    doublereal thetaup;

    /* Fortran I/O blocks */
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___10 = { 0, 6, 0, 0, 0 };
    static cilist io___11 = { 0, 6, 0, 0, 0 };
    static cilist io___14 = { 0, 6, 0, 0, 0 };
    static cilist io___15 = { 0, 6, 0, 0, 0 };
    static cilist io___16 = { 0, 6, 0, 0, 0 };
    static cilist io___17 = { 0, 6, 0, 0, 0 };



/*     treats the channel elements CONTRACTION, ENLARGEMENT, STEP */
/*     and DROP */





    /* Parameter adjustments */
    --ielprop;
    --prop;
    istack -= 3;
    --mi;
    v_dim1 = mi[2] - 0 + 1;
    v_offset = 0 + v_dim1;
    v -= v_offset;
    co -= 4;

    /* Function Body */
    pi = atan(1.) * 4.;

/*     determining the properties */

    index = ielprop[*nelem];

/*     width of the channel at node 1 */

    b1 = prop[index + 1];

/*     trapezoidal angle of the channel at node 1 */

    theta1 = prop[index + 2];

/*     width of the channel at the other end node (node 3) */

    b2 = prop[index + 3];

/*     trapezoidal angle of the channel at the other end node (node 3) */

    theta2 = prop[index + 4];

/*     size of the step going from node 1 to node 3 (a negative value */
/*     corresponds to a drop of the channel bottom) */

    d__ = prop[index + 5];
    if (d__ != 0. && (b2 != 0. && b1 != b2 || theta2 != 0. && theta2 != 
	    theta1)) {
	s_wsle(&io___8);
	do_lio(&c__9, &c__1, "*ERROR in contraction", (ftnlen)21);
	e_wsle();
	s_wsle(&io___9);
	do_lio(&c__9, &c__1, "       step height is nonzero and", (ftnlen)33);
	e_wsle();
	s_wsle(&io___10);
	do_lio(&c__9, &c__1, "       cross section is changing at the", (
		ftnlen)39);
	e_wsle();
	s_wsle(&io___11);
	do_lio(&c__9, &c__1, "       same time; this is not allowed", (ftnlen)
		37);
	e_wsle();
	exit_(&c__201);
    }

/*     step/drop: section does not change */

    if (d__ != 0.) {
	b2 = b1;
	theta2 = theta1;
    }

/*     if the length of the element is negative, it is determined from */
/*     the coordinates */

    dl = prop[index + 6];
    if (dl <= 0.) {
/* Computing 2nd power */
	d__1 = co[*nup * 3 + 1] - co[*ndo * 3 + 1];
/* Computing 2nd power */
	d__2 = co[*nup * 3 + 2] - co[*ndo * 3 + 2];
/* Computing 2nd power */
	d__3 = co[*nup * 3 + 3] - co[*ndo * 3 + 3];
	dl = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);
    }

/*     s0: sine of downstream slope (the slope is the angle phi between the */
/*         channel bottom and a plane orthogonal to the gravity vector */
/*     sqrts0: cosine of downstream slope */
/*     needed to calculate the normal depth (he) */

    s0 = prop[index + 7];
    if (s0 < -1.) {
	s_wsle(&io___14);
	do_lio(&c__9, &c__1, "*ERROR in contraction: sine of slope", (ftnlen)
		36);
	e_wsle();
	s_wsle(&io___15);
	do_lio(&c__9, &c__1, "       must be given explicitly", (ftnlen)31);
	e_wsle();
	s_wsle(&io___16);
	do_lio(&c__9, &c__1, "       for a contraction, enlargement,", (
		ftnlen)38);
	e_wsle();
	s_wsle(&io___17);
	do_lio(&c__9, &c__1, "       step or drop", (ftnlen)19);
	e_wsle();
	exit_(&c__201);
    }
    sqrts0 = 1. - s0 * s0;
    if (sqrts0 < 0.) {
	sqrts0 = 0.;
    } else {
	sqrts0 = sqrt(sqrts0);
    }

/*     check the direction of the flow */

    if (*inv == 1) {
	bup = b1;
	thetaup = theta1;
	bdo = b2;
	thetado = theta2;
    } else {
	bup = b2;
	thetaup = theta2;
	bdo = b1;
	thetado = theta1;
	d__ = -d__;
    }

/*     calculating the contraction/expansion angle */

    if (d__ == 0.) {
	if (dl == 0.) {
	    if (bdo > bup) {
		alpha = pi / 2.;
	    } else if (bdo < bup) {
		alpha = -pi / 2.;
	    } else {
		alpha = 0.;
	    }
	} else {
	    alpha = atan((bdo - bup) / (dl * 2.));
	}
    }

/*     modifying g by the head loss coefficient */

    dgmod = *dg;

/*     head loss coefficient: contraction */

    if (d__ == 0.) {
	if (alpha <= 0.) {
	    if (*(unsigned char *)mode == 'F') {
		dgmod = pi * *dg / (pi + alpha);
	    } else {
		dgmod = pi * *dg / (pi - alpha);
	    }
	}

/*       head loss coefficient: enlargement */

	if (alpha > 0.) {
	    if (alpha >= .79) {
		xk = .87;
	    } else if (alpha >= .46) {
		xk = (alpha - .46) * .5757 + .68;
	    } else if (alpha >= .32) {
		xk = (alpha - .32) * 1.9286 + .41;
	    } else if (alpha >= .25) {
		xk = (alpha - .25) * 2. + .27;
	    } else {
		xk = alpha * .27 / .25;
	    }
	    if (*(unsigned char *)mode == 'F') {
		dgmod = *dg / (xk + 1.);
	    } else {
		dgmod = *dg / (1. - xk);
	    }
	}
    }
/* *** */
/*      dgmod=dg */
/* *** */

    v[*nmid * v_dim1 + 1] = *inv * *xflow;

    if (*(unsigned char *)mode == 'F') {

/*        frontwater curve */

	tthup = tan(thetaup);
	hup = v[*nup * v_dim1 + 2] / sqrts0;
	if (hup <= 0.) {

/*         take the critical depth upstream */

	    hcrit_(xflow, rho, &bup, &thetaup, dg, &sqrts0, &hk);
	    areaup = (bup + hk * tthup) * hk;
/* Computing 2nd power */
	    d__1 = *xflow / (areaup * *rho);
	    e = d__1 * d__1 / (dgmod * 2.) + (hk - d__) * sqrts0;
	} else {
	    areaup = (bup + hup * tthup) * hup;
/* Computing 2nd power */
	    d__1 = *xflow / (areaup * *rho);
	    e = d__1 * d__1 / (dgmod * 2.) + (hup - d__) * sqrts0;
	}

/*       calculate the downstream height */

	henergy_(xflow, rho, &bdo, &thetado, &dgmod, &sqrts0, &e, mode, &hdo, 
		(ftnlen)1);

	if (hdo > 0.) {

/*         first calculate the backwater curve starting in nup */

	    if (hup <= 0.) {
		v[*nup * v_dim1 + 2] = hk * sqrts0;
		*ndo = *nup;
		*nelem = *nelup;
		*(unsigned char *)mode = 'B';
		++(*nstack);
		istack[(*nstack << 1) + 1] = *nelup;
		istack[(*nstack << 1) + 2] = *nup;
		return 0;
	    }

	    v[*ndo * v_dim1 + 2] = hdo * sqrts0;

/*         calculate the critical depth for output purposes */

	    hcrit_(xflow, rho, &bup, &thetaup, dg, &sqrts0, &hk);
	    v[*nup * v_dim1 + 3] = hk;

	    *nelup = *nelem;
	    *nelem = 0;
	    *nup = *ndo;
	} else {

/*         no solution, raise downstream to the critical height corresponding to */
/*         the fluid flow */

	    hcrit_(xflow, rho, &bdo, &thetado, dg, &sqrts0, &hk);
	    v[*ndo * v_dim1 + 3] = hk;

	    v[*ndo * v_dim1 + 2] = hk * sqrts0;

/*         store the actual element and downstream node as start of a */
/*         frontwater curve */

	    ++(*nstack);
	    istack[(*nstack << 1) + 1] = *nelem;
	    istack[(*nstack << 1) + 2] = *ndo;

/*         repeat the calculation of the actual element with the */
/*         downstream node as the start of a backwater curve */

	    *(unsigned char *)mode = 'B';
	}
    } else {

/*       backwater curve */

	hdo = v[*ndo * v_dim1 + 2] / sqrts0;
	tthdo = tan(thetado);
	areado = (bdo + hdo * tthdo) * hdo;
/* Computing 2nd power */
	d__1 = *xflow / (areado * *rho);
	e = d__1 * d__1 / (dgmod * 2.) + (hdo + d__) * sqrts0;

/*       calculate the upstream height */

	henergy_(xflow, rho, &bup, &thetaup, &dgmod, &sqrts0, &e, mode, &hup, 
		(ftnlen)1);

	if (hup > 0.) {
	    v[*nup * v_dim1 + 2] = hup * sqrts0;

/*         calculate the critical depth for output purposes */

	    hcrit_(xflow, rho, &bdo, &thetado, dg, &sqrts0, &hk);
	    v[*ndo * v_dim1 + 3] = hk;

	    *ndo = *nup;
	    *neldo = *nelem;
	    *nelem = 0;
	} else {

/*         no solution, drop upstream to the critical height corresponding to */
/*         the fluid flow */

	    hcrit_(xflow, rho, &bup, &thetaup, dg, &sqrts0, &hk);
	    v[*nup * v_dim1 + 3] = hk;

	    v[*nup * v_dim1 + 2] = hk * sqrts0;

	    ++(*nstack);
	    istack[(*nstack << 1) + 1] = *nelup;
	    istack[(*nstack << 1) + 2] = *nup;

	    *ndo = *nup;
	    *nelem = *nelup;
	    *neldo = *nelem;
	}
    }

    return 0;
} /* contraction_ */

