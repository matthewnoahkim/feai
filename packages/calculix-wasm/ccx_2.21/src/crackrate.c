/* crackrate.f -- translated by f2c (version 20200916).
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
static integer c__5 = 5;


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

/* Subroutine */ int crackrate_(integer *nfront, integer *ifrontrel, 
	doublereal *xkeq, doublereal *phi, integer *ifront, doublereal *dadn, 
	integer *ncyc, integer *icritic, doublereal *datarget, doublereal *
	crcon, doublereal *temp, integer *ncrtem, doublereal *crconloc, 
	integer *ncrconst, doublereal *xk1, doublereal *xk2, doublereal *xk3, 
	integer *nstep, doublereal *acrack, doublereal *wk1, doublereal *wk2, 
	doublereal *wk3, doublereal *xkeqmin, doublereal *xkeqmax, doublereal 
	*dkeq, doublereal *domstep, doublereal *domphi, char *param, integer *
	nparam, integer *law, integer *ier, doublereal *r__, ftnlen param_len)
{
    /* System generated locals */
    integer xkeq_dim1, xkeq_offset, phi_dim1, phi_offset, crcon_dim1, 
	    crcon_offset, xk1_dim1, xk1_offset, xk2_dim1, xk2_offset, 
	    xk3_dim1, xk3_offset, temp_dim1, temp_offset, i__1, i__2;
    doublereal d__1, d__2;

    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *);
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);
    double exp(doublereal);
    integer i_dnnt(doublereal *);

    /* Local variables */
    integer i__, m;
    doublereal w, fr, xm;
    extern /* Subroutine */ int materialdata_crack__(doublereal *, integer *, 
	    integer *, doublereal *, doublereal *);
    doublereal t1l, dkc, dkth, delta, damax, dkref, dadnref;
    integer noderel;
    doublereal epsilon;

    /* Fortran I/O blocks */
    static cilist io___15 = { 0, 6, 0, 0, 0 };
    static cilist io___16 = { 0, 6, 0, 0, 0 };
    static cilist io___17 = { 0, 6, 0, 0, 0 };
    static cilist io___18 = { 0, 6, 0, 0, 0 };



/*     User Subroutine */

/*     calculate the crack propagation rate and the number of */
/*     cycles for this increment */

/*     INPUT: */

/*     nfront             total number of crack front-nodes */
/*     ifrontrel(i)       entry of front-node i in field ibounnod */
/*     xkeq(m,i)          equivalent K-factor for step m in front-node i */
/*     phi(m,i)           deflection angle for step m in front-node i */
/*     ifront(i)          (global) node number of front-node i */
/*     datarget           target crack propagation increment size */
/*     crcon(0,1..ncrtem) temperature data points for the crack propagation */
/*                        data */
/*     crcon(1..ncrconst,j) */
/*                        crack propagation constants for temperature data */
/*                        point j */
/*     temp(j,i)          temperature in step j at boundary node ibounnod(i) */
/*     ncrtem             number of temperature data points in the material */
/*                        law */
/*     crconloc(i)        interpolated crack propagation constant i for a */
/*                        concrete temperature */
/*     ncrconst           number of constants in the crack propagation law */
/*                        for a given temperature */
/*     xk1(m,i)           K1-factor for step m in front-node i */
/*     xk2(m,i)           K2-factor for step m in front-node i */
/*     xk3(m,i)           K3-factor for step m in front-node i */
/*     nstep              number of steps for which stresses (and */
/*                        optionally temperatures) are available */
/*     acrack(i)          crack length in front-node i; */
/*     param(1...nparam)  parameters returned from the crack propagation */
/*                        data routine for use in the propagation */
/*                        law (character*132) */
/*     nparam             number of parameters (integer) */
/*     law                number of the crack propagation law (integer) */
/*     ier                error parameter; entry value: 0. */


/*     OUTPUT */

/*     dadn(i)            crack propagation rate in front-node i */
/*     ncyc               number of cycles in this increment */
/*     icritic            0: Kc is nowhere reached */
/*                        <0: nowhere propagation */
/*                        >0: Kc is reached in at least one front-node: */
/*                            CalculiX will stop after returning from */
/*                            this subroutine */
/*     wk1(i)             worst K1-factor in front-node i; */
/*                        wk1(i) = xk1(m,i) if dabs(xk1(m,i)) is maximal */
/*                        over all steps */
/*     wk2(i)             worst K2-factor in front-node i; */
/*     wk3(i)             worst K3-factor in front-node i; */
/*     xkeqmin(i)         minimum value of xkeq(m,i) over all steps */
/*     xkeqmax(i)         maximum value of xkeq(m,i) over all steps */
/*     dkeq(i)            range of the equivalent stress intensity factor */
/*                        of the main cycle at front-node i */
/*     r(i)               r-value of the main cycle at front-node i */
/*     domstep(i)         the step dictating the deflection angle at */
/*                        front-node i (dominant step) */
/*     domphi(i)          deflection angle for the crack propagation in */
/*                        front-node i */
/*     ier                error parameter; */
/*                        0: no error occurred in the present routine */
/*                        1: an error occurred and CalculiX should stop */





/*     determine the maximal crack propagation in one iteration */

    /* Parameter adjustments */
    --ifrontrel;
    --ifront;
    --dadn;
    --crconloc;
    crcon_dim1 = *ncrconst - 0 + 1;
    crcon_offset = 0 + crcon_dim1;
    crcon -= crcon_offset;
    xk3_dim1 = *nstep;
    xk3_offset = 1 + xk3_dim1;
    xk3 -= xk3_offset;
    xk2_dim1 = *nstep;
    xk2_offset = 1 + xk2_dim1;
    xk2 -= xk2_offset;
    xk1_dim1 = *nstep;
    xk1_offset = 1 + xk1_dim1;
    xk1 -= xk1_offset;
    temp_dim1 = *nstep;
    temp_offset = 1 + temp_dim1;
    temp -= temp_offset;
    phi_dim1 = *nstep;
    phi_offset = 1 + phi_dim1;
    phi -= phi_offset;
    xkeq_dim1 = *nstep;
    xkeq_offset = 1 + xkeq_dim1;
    xkeq -= xkeq_offset;
    --acrack;
    --wk1;
    --wk2;
    --wk3;
    --xkeqmin;
    --xkeqmax;
    --dkeq;
    --domstep;
    --domphi;
    param -= 132;
    --r__;

    /* Function Body */
    damax = 0.;
    i__1 = *nfront;
    for (i__ = 1; i__ <= i__1; ++i__) {

/*     look for maximum keq across all steps in the mission; this */
/*     step is considered to be dominant and the crack propagation */
/*     in the mission is defined as the crack propagation of this */
/*     step (same applies to the deflection angle: the deflection */
/*     angle of the mission is the deflection angle of this step) */

	xkeqmin[i__] = 1e30;
	xkeqmax[i__] = -1e30;
	wk1[i__] = 0.;
	wk2[i__] = 0.;
	wk3[i__] = 0.;

	i__2 = *nstep;
	for (m = 1; m <= i__2; ++m) {
	    if (xkeq[m + i__ * xkeq_dim1] > xkeqmax[i__]) {
		xkeqmax[i__] = xkeq[m + i__ * xkeq_dim1];
		domphi[i__] = phi[m + i__ * phi_dim1];
		domstep[i__] = m * 1.;
	    }
/* Computing MIN */
	    d__1 = xkeqmin[i__], d__2 = xkeq[m + i__ * xkeq_dim1];
	    xkeqmin[i__] = min(d__1,d__2);
	    if ((d__1 = xk1[m + i__ * xk1_dim1], abs(d__1)) > (d__2 = wk1[i__]
		    , abs(d__2))) {
		wk1[i__] = xk1[m + i__ * xk1_dim1];
	    }
	    if ((d__1 = xk2[m + i__ * xk2_dim1], abs(d__1)) > (d__2 = wk2[i__]
		    , abs(d__2))) {
		wk2[i__] = xk2[m + i__ * xk2_dim1];
	    }
	    if ((d__1 = xk3[m + i__ * xk3_dim1], abs(d__1)) > (d__2 = wk3[i__]
		    , abs(d__2))) {
		wk3[i__] = xk3[m + i__ * xk3_dim1];
	    }
	}

/*     if only one step: 0-max cycle is assumed */

	if (*nstep == 1) {
	    xkeqmin[i__] = 0.;
	}
	dkeq[i__] = xkeqmax[i__] - xkeqmin[i__];

/*       determine the R-value */

	if ((d__1 = xkeqmax[i__], abs(d__1)) < 1e-10) {
	    if (xkeqmax[i__] < 0.) {
		r__[i__] = 1e10;
	    } else {
		r__[i__] = -1e10;
	    }
	} else {
	    r__[i__] = xkeqmin[i__] / xkeqmax[i__];
	}

/*     determine the crack propagation data for the local temperature */

	noderel = ifrontrel[i__];
	t1l = temp[noderel * temp_dim1 + 1];
	materialdata_crack__(&crcon[crcon_offset], ncrconst, ncrtem, &t1l, &
		crconloc[1]);

/*     constants for a simple material law */

	dadnref = crconloc[1];
	dkref = crconloc[2];
	xm = crconloc[3];
	epsilon = crconloc[4];
	dkth = crconloc[5];
	delta = crconloc[6];
	dkc = crconloc[7];
	w = crconloc[8];

/*       determine the R-correction */

	if ((d__1 = 1. - r__[i__], abs(d__1)) < 1e-10) {
	    fr = 0.;
	} else {
	    d__1 = 1. - r__[i__];
	    d__2 = (1. - w) * xm;
	    fr = 1. / pow_dd(&d__1, &d__2);
	}

	if (dkeq[i__] >= dkc) {
	    s_wsle(&io___15);
	    do_lio(&c__9, &c__1, "*WARNING in crackrate: Kc is reached", (
		    ftnlen)36);
	    e_wsle();
	    s_wsle(&io___16);
	    do_lio(&c__9, &c__1, "         original K-value: ", (ftnlen)27);
	    do_lio(&c__5, &c__1, (char *)&dkeq[i__], (ftnlen)sizeof(
		    doublereal));
	    e_wsle();
	    dkeq[i__] = dkth + (dkc - dkth) * .999f;
	    s_wsle(&io___17);
	    do_lio(&c__9, &c__1, "         dk is reduced to ", (ftnlen)26);
	    do_lio(&c__5, &c__1, (char *)&dkeq[i__], (ftnlen)sizeof(
		    doublereal));
	    e_wsle();
	    s_wsle(&io___18);
	    e_wsle();
	    ++(*icritic);
	}

	if (dkeq[i__] <= dkth) {
	    dadn[i__] = 0.;
	} else {
	    d__1 = dkeq[i__] / dkref;
	    dadn[i__] = dadnref * pow_dd(&d__1, &xm) * (1. - exp(epsilon * (
		    1. - dkeq[i__] / dkth))) / (1. - exp(delta * (xkeqmax[i__]
		     / dkc - 1.))) * fr;
	}

/* Computing MAX */
	d__1 = dadn[i__];
	damax = max(d__1,damax);
    }

/*     determine the number of cycles */
/*     for ier=1 the calculation has to be stopped */

    if (*icritic > 0) {
	*ncyc = 0;
	return 0;
    } else if (damax > 0.) {
	d__1 = *datarget / damax;
	*ncyc = i_dnnt(&d__1);

/*       too close to the critical value */

	if (*ncyc == 0) {
	    *icritic = 1;
	    return 0;
	}
    } else {

/*       no propagation */

	*icritic = -1;
	*ncyc = 1;
    }

    return 0;
} /* crackrate_ */

