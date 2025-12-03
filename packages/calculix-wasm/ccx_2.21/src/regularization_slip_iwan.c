/* regularization_slip_iwan.f -- translated by f2c (version 20200916).
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
static integer c__3 = 3;
static integer c__5 = 5;


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

/* regularization function for tangential mortar contact, iwan model */
/* see phd-thesis Sitzmann Chapter 3.2.2., semi-smooth Newton for tangential contact */

/*  [in] lambdan   		normal contact pressure */
/*  [in] utilt			\f$ \tilde{u}_\tau=\tau \cdot (\hat{u}-\bar{u}) \f$ */
/*  [in] bp			friction bound */
/*  [in] atau2			tangential stiffness */
/*  [out] resreg			evaluated regularization function */
/*  [in] divmode 			indicates whether funtion (==0) or derivate (==1) should be called */
/*  [in] regmode        		selects used semi-Newton (==2 is active) */
/*  [in,out] lambdaiwan   	Lagrange multiplier splitted to Iwan elements */
/*  [in,out] lambdaiwanini    	Lagrange multiplier splitted to Iwan elements at start of increment */
/*  [in] inode			slave node number */
/*  [in] n			slave normal */
/*  [in] t			slave tangent */
/*  [in] mu			friction coefficient */
/*  [out] rslip			matrix used in semi-smooth Newton */
/*  [out] ltslip			matrix used in semi-smooth Newton */
/*  [out] ltu			vector used in semi-smooth Newton */
/*  [out] yielded			debugging parameter */
/*  [in] debug			debug output flag */
/*  [in] iwan			number of iwan elements */
/*  [in] dut			\f$ \Delta \tilde{u}_\tau \f$ */

/* Subroutine */ int regularization_slip_iwan__(doublereal *lambdan, 
	doublereal *utilt, doublereal *bp, doublereal *atau2, doublereal *
	resreg, integer *divmode, integer *regmode, doublereal *lambdaiwan, 
	doublereal *lambdaiwanini, integer *inode, doublereal *n, doublereal *
	t, doublereal *mu, doublereal *rslip, doublereal *ltslip, doublereal *
	ltu, integer *yielded, integer *iit, integer *debug, integer *iwan, 
	doublereal *dut)
{
    /* System generated locals */
    integer lambdaiwan_dim2, lambdaiwan_offset, lambdaiwanini_dim2, 
	    lambdaiwanini_offset, i__1;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double sqrt(doublereal);
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    doublereal d__[2];
    integer i__, j, k;
    doublereal nd, ep, fp[4], lp[4], mp[4], det, lpt[2], nlpt, alpha[10], 
	    nhelp, kiwan, fstar[10];
    integer imodification;
    doublereal lptini[2];

    /* Fortran I/O blocks */
    static cilist io___10 = { 0, 6, 0, 0, 0 };
    static cilist io___11 = { 0, 6, 0, 0, 0 };
    static cilist io___12 = { 0, 6, 0, 0, 0 };
    static cilist io___13 = { 0, 6, 0, 0, 0 };
    static cilist io___20 = { 0, 6, 0, 0, 0 };
    static cilist io___21 = { 0, 6, 0, 0, 0 };
    static cilist io___22 = { 0, 6, 0, 0, 0 };
    static cilist io___23 = { 0, 6, 0, 0, 0 };
    static cilist io___24 = { 0, 6, 0, 0, 0 };
    static cilist io___25 = { 0, 6, 0, 0, 0 };
    static cilist io___26 = { 0, 6, 0, 0, 0 };
    static cilist io___27 = { 0, 6, 0, 0, 0 };
    static cilist io___29 = { 0, 6, 0, 0, 0 };
    static cilist io___30 = { 0, 6, 0, 0, 0 };
    static cilist io___33 = { 0, 6, 0, 0, 0 };
    static cilist io___34 = { 0, 6, 0, 0, 0 };
    static cilist io___35 = { 0, 6, 0, 0, 0 };
    static cilist io___36 = { 0, 6, 0, 0, 0 };
    static cilist io___37 = { 0, 6, 0, 0, 0 };
    static cilist io___38 = { 0, 6, 0, 0, 0 };
    static cilist io___39 = { 0, 6, 0, 0, 0 };
    static cilist io___40 = { 0, 6, 0, 0, 0 };
    static cilist io___41 = { 0, 6, 0, 0, 0 };
    static cilist io___42 = { 0, 6, 0, 0, 0 };
    static cilist io___43 = { 0, 6, 0, 0, 0 };
    static cilist io___44 = { 0, 6, 0, 0, 0 };



/*     regularization function of tangential contact */
/*     implementation of iwan-model */
/*     Author: Saskia Sitzmann */




    /* Parameter adjustments */
    --utilt;
    --resreg;
    --n;
    --t;
    --rslip;
    --ltslip;
    --ltu;
    lambdaiwanini_dim2 = *iwan;
    lambdaiwanini_offset = 1 + 3 * (1 + lambdaiwanini_dim2);
    lambdaiwanini -= lambdaiwanini_offset;
    lambdaiwan_dim2 = *iwan;
    lambdaiwan_offset = 1 + 3 * (1 + lambdaiwan_dim2);
    lambdaiwan -= lambdaiwan_offset;
    --dut;

    /* Function Body */
    kiwan = *atau2;
    imodification = *regmode;
    i__1 = *iwan;
    for (i__ = 1; i__ <= i__1; ++i__) {
	alpha[i__ - 1] = (real) i__ * 2.f / ((real) (*iwan) * (real) (*iwan + 
		1));
	fstar[i__ - 1] = alpha[i__ - 1] * *bp * (real) (*iwan);
    }
    *yielded = 0;
    resreg[1] = 0.f;
    resreg[2] = 0.f;
    if (imodification == 1) {
	if (*divmode == 0) {

/*     update lambdaiwan */

	    i__1 = *iwan;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		lptini[0] = lambdaiwanini[(i__ + *inode * lambdaiwanini_dim2) 
			* 3 + 1] * t[1] + lambdaiwanini[(i__ + *inode * 
			lambdaiwanini_dim2) * 3 + 2] * t[2] + lambdaiwanini[(
			i__ + *inode * lambdaiwanini_dim2) * 3 + 3] * t[3];
		lptini[1] = lambdaiwanini[(i__ + *inode * lambdaiwanini_dim2) 
			* 3 + 1] * t[4] + lambdaiwanini[(i__ + *inode * 
			lambdaiwanini_dim2) * 3 + 2] * t[5] + lambdaiwanini[(
			i__ + *inode * lambdaiwanini_dim2) * 3 + 3] * t[6];
		d__[0] = *iwan * lptini[0] + kiwan * utilt[1];
		d__[1] = *iwan * lptini[1] + kiwan * utilt[2];
		nd = sqrt(d__[0] * d__[0] + d__[1] * d__[1]);
		nhelp = sqrt(utilt[1] * utilt[1] + utilt[2] * utilt[2]);
		if (*debug == 1) {
		    s_wsle(&io___10);
		    do_lio(&c__9, &c__1, "imodification", (ftnlen)13);
		    do_lio(&c__3, &c__1, (char *)&imodification, (ftnlen)
			    sizeof(integer));
		    e_wsle();
		    s_wsle(&io___11);
		    do_lio(&c__9, &c__1, "lini", (ftnlen)4);
		    do_lio(&c__5, &c__1, (char *)&lptini[0], (ftnlen)sizeof(
			    doublereal));
		    do_lio(&c__5, &c__1, (char *)&lptini[1], (ftnlen)sizeof(
			    doublereal));
		    e_wsle();
		    s_wsle(&io___12);
		    do_lio(&c__9, &c__1, "d", (ftnlen)1);
		    do_lio(&c__5, &c__1, (char *)&d__[0], (ftnlen)sizeof(
			    doublereal));
		    do_lio(&c__5, &c__1, (char *)&d__[1], (ftnlen)sizeof(
			    doublereal));
		    e_wsle();
		}
		if (nd <= fstar[i__ - 1]) {

/*     update ok */

		    resreg[1] += d__[0] / (real) (*iwan);
		    resreg[2] += d__[1] / (real) (*iwan);
		} else {

/*     radial return mapping */

		    ++(*yielded);
		    d__[0] = fstar[i__ - 1] * d__[0] / nd;
		    d__[1] = fstar[i__ - 1] * d__[1] / nd;
		    resreg[1] += d__[0] / (real) (*iwan);
		    resreg[2] += d__[1] / (real) (*iwan);
		}
		if (*debug == 1) {
		    s_wsle(&io___13);
		    do_lio(&c__9, &c__1, "liwan", (ftnlen)5);
		    d__1 = d__[0] / (real) (*iwan);
		    do_lio(&c__5, &c__1, (char *)&d__1, (ftnlen)sizeof(
			    doublereal));
		    d__2 = d__[1] / (real) (*iwan);
		    do_lio(&c__5, &c__1, (char *)&d__2, (ftnlen)sizeof(
			    doublereal));
		    e_wsle();
		}
	    }
	} else if (*divmode == 1) {

/*     Newton iteration */

	    for (i__ = 1; i__ <= 6; ++i__) {
		rslip[i__] = t[i__];
		ltslip[i__] = 0.f;
	    }
	    for (i__ = 1; i__ <= 2; ++i__) {
		ltu[i__] = 0.f;
	    }
	    i__1 = *iwan;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		lptini[0] = lambdaiwanini[(i__ + *inode * lambdaiwanini_dim2) 
			* 3 + 1] * t[1] + lambdaiwanini[(i__ + *inode * 
			lambdaiwanini_dim2) * 3 + 2] * t[2] + lambdaiwanini[(
			i__ + *inode * lambdaiwanini_dim2) * 3 + 3] * t[3];
		lptini[1] = lambdaiwanini[(i__ + *inode * lambdaiwanini_dim2) 
			* 3 + 1] * t[4] + lambdaiwanini[(i__ + *inode * 
			lambdaiwanini_dim2) * 3 + 2] * t[5] + lambdaiwanini[(
			i__ + *inode * lambdaiwanini_dim2) * 3 + 3] * t[6];
		d__[0] = *iwan * lptini[0] + kiwan * utilt[1];
		d__[1] = *iwan * lptini[1] + kiwan * utilt[2];
		nd = sqrt(d__[0] * d__[0] + d__[1] * d__[1]);
		nhelp = sqrt(utilt[1] * utilt[1] + utilt[2] * utilt[2]);
		resreg[1] = d__[0];
		resreg[2] = d__[1];
		if (nd < fstar[i__ - 1] || *iit == 1) {

/*     update ok */

		    for (j = 1; j <= 3; ++j) {
			for (k = 1; k <= 2; ++k) {
			    ltslip[(k - 1) * 3 + j] += kiwan / (real) (*iwan) 
				    * t[(k - 1) * 3 + j];
			}
		    }
		    ltu[1] += d__[0] / (real) (*iwan);
		    ltu[2] += d__[1] / (real) (*iwan);
		} else {

/*     radial return mapping */

		    ++(*yielded);
		    ep = fstar[i__ - 1] / (nd * (real) (*iwan));
		    fp[0] = d__[0] * d__[0] / (nd * nd);
		    fp[1] = d__[0] * d__[1] / (nd * nd);
		    fp[2] = d__[1] * d__[0] / (nd * nd);
		    fp[3] = d__[1] * d__[1] / (nd * nd);
		    mp[0] = -(ep * fp[0] - ep);
		    mp[1] = -ep * fp[1];
		    mp[2] = -ep * fp[2];
		    mp[3] = -(ep * fp[3] - ep);
		    lp[0] = kiwan * mp[0];
		    lp[1] = kiwan * mp[1];
		    lp[2] = kiwan * mp[2];
		    lp[3] = kiwan * mp[3];
		    if (*debug == 1) {
			s_wsle(&io___20);
			do_lio(&c__9, &c__1, "t1", (ftnlen)2);
			do_lio(&c__5, &c__1, (char *)&t[1], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&t[2], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&t[3], (ftnlen)sizeof(
				doublereal));
			e_wsle();
			s_wsle(&io___21);
			do_lio(&c__9, &c__1, "t1", (ftnlen)2);
			do_lio(&c__5, &c__1, (char *)&t[4], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&t[5], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&t[6], (ftnlen)sizeof(
				doublereal));
			e_wsle();
			s_wsle(&io___22);
			do_lio(&c__9, &c__1, "ep", (ftnlen)2);
			do_lio(&c__5, &c__1, (char *)&ep, (ftnlen)sizeof(
				doublereal));
			e_wsle();
			s_wsle(&io___23);
			do_lio(&c__9, &c__1, "fp", (ftnlen)2);
			do_lio(&c__5, &c__1, (char *)&fp[0], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&fp[1], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&fp[2], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&fp[3], (ftnlen)sizeof(
				doublereal));
			e_wsle();
			s_wsle(&io___24);
			do_lio(&c__9, &c__1, "mp", (ftnlen)2);
			do_lio(&c__5, &c__1, (char *)&mp[0], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&mp[1], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&mp[2], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&mp[3], (ftnlen)sizeof(
				doublereal));
			e_wsle();
			s_wsle(&io___25);
			do_lio(&c__9, &c__1, "lp", (ftnlen)2);
			do_lio(&c__5, &c__1, (char *)&lp[0], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&lp[1], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&lp[2], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&lp[3], (ftnlen)sizeof(
				doublereal));
			e_wsle();
			s_wsle(&io___26);
			do_lio(&c__9, &c__1, "rn", (ftnlen)2);
			d__1 = d__[0] / nd * alpha[i__ - 1] * *mu * n[1];
			do_lio(&c__5, &c__1, (char *)&d__1, (ftnlen)sizeof(
				doublereal));
			d__2 = d__[0] / nd * alpha[i__ - 1] * *mu * n[2];
			do_lio(&c__5, &c__1, (char *)&d__2, (ftnlen)sizeof(
				doublereal));
			d__3 = d__[0] / nd * alpha[i__ - 1] * *mu * n[3];
			do_lio(&c__5, &c__1, (char *)&d__3, (ftnlen)sizeof(
				doublereal));
			e_wsle();
			s_wsle(&io___27);
			do_lio(&c__9, &c__1, "rn", (ftnlen)2);
			d__1 = d__[1] / nd * alpha[i__ - 1] * *mu * n[1];
			do_lio(&c__5, &c__1, (char *)&d__1, (ftnlen)sizeof(
				doublereal));
			d__2 = d__[1] / nd * alpha[i__ - 1] * *mu * n[2];
			do_lio(&c__5, &c__1, (char *)&d__2, (ftnlen)sizeof(
				doublereal));
			d__3 = d__[1] / nd * alpha[i__ - 1] * *mu * n[3];
			do_lio(&c__5, &c__1, (char *)&d__3, (ftnlen)sizeof(
				doublereal));
			e_wsle();
			det = lp[0] * lp[3] - lp[1] * lp[2];
			s_wsle(&io___29);
			do_lio(&c__9, &c__1, "det", (ftnlen)3);
			do_lio(&c__5, &c__1, (char *)&det, (ftnlen)sizeof(
				doublereal));
			e_wsle();
		    }
		    for (j = 1; j <= 3; ++j) {
			for (k = 1; k <= 2; ++k) {
			    ltslip[(k - 1) * 3 + j] = ltslip[(k - 1) * 3 + j] 
				    + lp[(k - 1) * 2] * t[j] + lp[(k - 1 << 1)
				     + 1] * t[j + 3];

			    rslip[(k - 1) * 3 + j] -= d__[k - 1] / nd * alpha[
				    i__ - 1] * *mu * n[j];
			}
		    }
		}
	    }
	}
    } else {

/*     alternative Newton iteration */

	if (*debug == 1) {
	    s_wsle(&io___30);
	    do_lio(&c__9, &c__1, "imodification", (ftnlen)13);
	    do_lio(&c__3, &c__1, (char *)&imodification, (ftnlen)sizeof(
		    integer));
	    e_wsle();
	}
	if (*divmode == 0) {

/*     update lambdaiwan */

	    i__1 = *iwan;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		lptini[0] = lambdaiwanini[(i__ + *inode * lambdaiwanini_dim2) 
			* 3 + 1] * t[1] + lambdaiwanini[(i__ + *inode * 
			lambdaiwanini_dim2) * 3 + 2] * t[2] + lambdaiwanini[(
			i__ + *inode * lambdaiwanini_dim2) * 3 + 3] * t[3];
		lptini[1] = lambdaiwanini[(i__ + *inode * lambdaiwanini_dim2) 
			* 3 + 1] * t[4] + lambdaiwanini[(i__ + *inode * 
			lambdaiwanini_dim2) * 3 + 2] * t[5] + lambdaiwanini[(
			i__ + *inode * lambdaiwanini_dim2) * 3 + 3] * t[6];
		lpt[0] = lambdaiwan[(i__ + *inode * lambdaiwan_dim2) * 3 + 1] 
			* t[1] + lambdaiwan[(i__ + *inode * lambdaiwan_dim2) *
			 3 + 2] * t[2] + lambdaiwan[(i__ + *inode * 
			lambdaiwan_dim2) * 3 + 3] * t[3];
		lpt[1] = lambdaiwan[(i__ + *inode * lambdaiwan_dim2) * 3 + 1] 
			* t[4] + lambdaiwan[(i__ + *inode * lambdaiwan_dim2) *
			 3 + 2] * t[5] + lambdaiwan[(i__ + *inode * 
			lambdaiwan_dim2) * 3 + 3] * t[6];
		nlpt = sqrt(lpt[0] * lpt[0] + lpt[1] * lpt[1]);
		d__[0] = *iwan * lptini[0] + kiwan * utilt[1];
		d__[1] = *iwan * lptini[1] + kiwan * utilt[2];
		nd = sqrt(d__[0] * d__[0] + d__[1] * d__[1]);
		nhelp = sqrt(utilt[1] * utilt[1] + utilt[2] * utilt[2]);
		if (*debug == 1) {
		    s_wsle(&io___33);
		    do_lio(&c__9, &c__1, "lini", (ftnlen)4);
		    do_lio(&c__5, &c__1, (char *)&lptini[0], (ftnlen)sizeof(
			    doublereal));
		    do_lio(&c__5, &c__1, (char *)&lptini[1], (ftnlen)sizeof(
			    doublereal));
		    e_wsle();
		    s_wsle(&io___34);
		    do_lio(&c__9, &c__1, "d", (ftnlen)1);
		    do_lio(&c__5, &c__1, (char *)&d__[0], (ftnlen)sizeof(
			    doublereal));
		    do_lio(&c__5, &c__1, (char *)&d__[1], (ftnlen)sizeof(
			    doublereal));
		    do_lio(&c__5, &c__1, (char *)&nd, (ftnlen)sizeof(
			    doublereal));
		    e_wsle();
		}
		if (nd <= fstar[i__ - 1]) {

/*     update ok */

		    d__[0] = (d__[0] + kiwan * dut[1]) / (real) (*iwan);
		    d__[1] = (d__[1] + kiwan * dut[2]) / (real) (*iwan);
		    lambdaiwan[(i__ + *inode * lambdaiwan_dim2) * 3 + 1] = 
			    d__[0] * t[1];
		    lambdaiwan[(i__ + *inode * lambdaiwan_dim2) * 3 + 2] = 
			    d__[0] * t[2];
		    lambdaiwan[(i__ + *inode * lambdaiwan_dim2) * 3 + 3] = 
			    d__[0] * t[3];
		    lambdaiwan[(i__ + *inode * lambdaiwan_dim2) * 3 + 1] += 
			    d__[1] * t[4];
		    lambdaiwan[(i__ + *inode * lambdaiwan_dim2) * 3 + 2] += 
			    d__[1] * t[5];
		    lambdaiwan[(i__ + *inode * lambdaiwan_dim2) * 3 + 3] += 
			    d__[1] * t[6];
		    resreg[1] += d__[0];
		    resreg[2] += d__[1];
		} else {

/*     radial return mapping */

		    ++(*yielded);
		    ep = fstar[i__ - 1] / (nd * (real) (*iwan));
/* Computing MAX */
		    d__1 = fstar[i__ - 1] / (real) (*iwan);
		    fp[0] = lpt[0] * d__[0] / (nd * max(d__1,nlpt));
/* Computing MAX */
		    d__1 = fstar[i__ - 1] / (real) (*iwan);
		    fp[1] = lpt[0] * d__[1] / (nd * max(d__1,nlpt));
/* Computing MAX */
		    d__1 = fstar[i__ - 1] / (real) (*iwan);
		    fp[2] = lpt[1] * d__[0] / (nd * max(d__1,nlpt));
/* Computing MAX */
		    d__1 = fstar[i__ - 1] / (real) (*iwan);
		    fp[3] = lpt[1] * d__[1] / (nd * max(d__1,nlpt));
		    mp[0] = -(ep * fp[0] - ep);
		    mp[1] = -ep * fp[1];
		    mp[2] = -ep * fp[2];
		    mp[3] = -(ep * fp[3] - ep);
		    lp[0] = kiwan * mp[0];
		    lp[1] = kiwan * mp[1];
		    lp[2] = kiwan * mp[2];
		    lp[3] = kiwan * mp[3];
		    d__[0] = *mu * *lambdan * d__[0] * alpha[i__ - 1] / nd + 
			    lp[0] * dut[1] + lp[1] * dut[2];
		    d__[1] = *mu * *lambdan * d__[1] * alpha[i__ - 1] / nd + 
			    lp[2] * dut[1] + lp[3] * dut[2];
		    lambdaiwan[(i__ + *inode * lambdaiwan_dim2) * 3 + 1] = 
			    d__[0] * t[1];
		    lambdaiwan[(i__ + *inode * lambdaiwan_dim2) * 3 + 2] = 
			    d__[0] * t[2];
		    lambdaiwan[(i__ + *inode * lambdaiwan_dim2) * 3 + 3] = 
			    d__[0] * t[3];
		    lambdaiwan[(i__ + *inode * lambdaiwan_dim2) * 3 + 1] += 
			    d__[1] * t[4];
		    lambdaiwan[(i__ + *inode * lambdaiwan_dim2) * 3 + 2] += 
			    d__[1] * t[5];
		    lambdaiwan[(i__ + *inode * lambdaiwan_dim2) * 3 + 3] += 
			    d__[1] * t[6];
		    resreg[1] += d__[0];
		    resreg[2] += d__[1];
		}
		if (*debug == 1) {
		    s_wsle(&io___35);
		    do_lio(&c__9, &c__1, "liwan", (ftnlen)5);
		    do_lio(&c__5, &c__1, (char *)&d__[0], (ftnlen)sizeof(
			    doublereal));
		    do_lio(&c__5, &c__1, (char *)&d__[1], (ftnlen)sizeof(
			    doublereal));
		    e_wsle();
		}
	    }
	} else if (*divmode == 1) {

/*     Newton iteration */

	    for (i__ = 1; i__ <= 6; ++i__) {
		rslip[i__] = t[i__];
		ltslip[i__] = 0.f;
	    }
	    for (i__ = 1; i__ <= 2; ++i__) {
		ltu[i__] = 0.f;
	    }
	    i__1 = *iwan;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		lptini[0] = lambdaiwanini[(i__ + *inode * lambdaiwanini_dim2) 
			* 3 + 1] * t[1] + lambdaiwanini[(i__ + *inode * 
			lambdaiwanini_dim2) * 3 + 2] * t[2] + lambdaiwanini[(
			i__ + *inode * lambdaiwanini_dim2) * 3 + 3] * t[3];
		lptini[1] = lambdaiwanini[(i__ + *inode * lambdaiwanini_dim2) 
			* 3 + 1] * t[4] + lambdaiwanini[(i__ + *inode * 
			lambdaiwanini_dim2) * 3 + 2] * t[5] + lambdaiwanini[(
			i__ + *inode * lambdaiwanini_dim2) * 3 + 3] * t[6];
		lpt[0] = lambdaiwan[(i__ + *inode * lambdaiwan_dim2) * 3 + 1] 
			* t[1] + lambdaiwan[(i__ + *inode * lambdaiwan_dim2) *
			 3 + 2] * t[2] + lambdaiwan[(i__ + *inode * 
			lambdaiwan_dim2) * 3 + 3] * t[3];
		lpt[1] = lambdaiwan[(i__ + *inode * lambdaiwan_dim2) * 3 + 1] 
			* t[4] + lambdaiwan[(i__ + *inode * lambdaiwan_dim2) *
			 3 + 2] * t[5] + lambdaiwan[(i__ + *inode * 
			lambdaiwan_dim2) * 3 + 3] * t[6];
		d__[0] = *iwan * lptini[0] + kiwan * utilt[1];
		d__[1] = *iwan * lptini[1] + kiwan * utilt[2];
		nd = sqrt(d__[0] * d__[0] + d__[1] * d__[1]);
		nlpt = sqrt(lpt[0] * lpt[0] + lpt[1] * lpt[1]);
		nhelp = sqrt(utilt[1] * utilt[1] + utilt[2] * utilt[2]);
		resreg[1] = d__[0];
		resreg[2] = d__[1];
		if (nd < fstar[i__ - 1] || *iit == 1) {

/*     update ok */

		    for (j = 1; j <= 3; ++j) {
			for (k = 1; k <= 2; ++k) {
			    ltslip[(k - 1) * 3 + j] += kiwan / (real) (*iwan) 
				    * t[(k - 1) * 3 + j];

/*     check for iwan>1 */

			    rslip[(k - 1) * 3 + j] += *mu * (lpt[k - 1] - d__[
				    k - 1] / (real) (*iwan)) / *bp * n[j];
			}
		    }
		    ltu[1] += lpt[0];
		    ltu[2] += lpt[1];
		} else {

/*     radial return mapping */

		    ++(*yielded);
		    ep = fstar[i__ - 1] / (nd * (real) (*iwan));
/* Computing MAX */
		    d__1 = fstar[i__ - 1] / (real) (*iwan);
		    fp[0] = lpt[0] * d__[0] / (nd * max(d__1,nlpt));
/* Computing MAX */
		    d__1 = fstar[i__ - 1] / (real) (*iwan);
		    fp[1] = lpt[0] * d__[1] / (nd * max(d__1,nlpt));
/* Computing MAX */
		    d__1 = fstar[i__ - 1] / (real) (*iwan);
		    fp[2] = lpt[1] * d__[0] / (nd * max(d__1,nlpt));
/* Computing MAX */
		    d__1 = fstar[i__ - 1] / (real) (*iwan);
		    fp[3] = lpt[1] * d__[1] / (nd * max(d__1,nlpt));
		    mp[0] = -(ep * fp[0] - ep);
		    mp[1] = -ep * fp[1];
		    mp[2] = -ep * fp[2];
		    mp[3] = -(ep * fp[3] - ep);
		    lp[0] = kiwan * mp[0];
		    lp[1] = kiwan * mp[1];
		    lp[2] = kiwan * mp[2];
		    lp[3] = kiwan * mp[3];
		    if (*debug == 1) {
			s_wsle(&io___36);
			do_lio(&c__9, &c__1, "t1", (ftnlen)2);
			do_lio(&c__5, &c__1, (char *)&t[1], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&t[2], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&t[3], (ftnlen)sizeof(
				doublereal));
			e_wsle();
			s_wsle(&io___37);
			do_lio(&c__9, &c__1, "t1", (ftnlen)2);
			do_lio(&c__5, &c__1, (char *)&t[4], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&t[5], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&t[6], (ftnlen)sizeof(
				doublereal));
			e_wsle();
			s_wsle(&io___38);
			do_lio(&c__9, &c__1, "ep", (ftnlen)2);
			do_lio(&c__5, &c__1, (char *)&ep, (ftnlen)sizeof(
				doublereal));
			e_wsle();
			s_wsle(&io___39);
			do_lio(&c__9, &c__1, "fp", (ftnlen)2);
			do_lio(&c__5, &c__1, (char *)&fp[0], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&fp[1], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&fp[2], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&fp[3], (ftnlen)sizeof(
				doublereal));
			e_wsle();
			s_wsle(&io___40);
			do_lio(&c__9, &c__1, "mp", (ftnlen)2);
			do_lio(&c__5, &c__1, (char *)&mp[0], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&mp[1], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&mp[2], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&mp[3], (ftnlen)sizeof(
				doublereal));
			e_wsle();
			s_wsle(&io___41);
			do_lio(&c__9, &c__1, "lp", (ftnlen)2);
			do_lio(&c__5, &c__1, (char *)&lp[0], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&lp[1], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&lp[2], (ftnlen)sizeof(
				doublereal));
			do_lio(&c__5, &c__1, (char *)&lp[3], (ftnlen)sizeof(
				doublereal));
			e_wsle();
			s_wsle(&io___42);
			do_lio(&c__9, &c__1, "rn", (ftnlen)2);
			d__1 = d__[0] / nd * alpha[i__ - 1] * *mu * n[1];
			do_lio(&c__5, &c__1, (char *)&d__1, (ftnlen)sizeof(
				doublereal));
			d__2 = d__[0] / nd * alpha[i__ - 1] * *mu * n[2];
			do_lio(&c__5, &c__1, (char *)&d__2, (ftnlen)sizeof(
				doublereal));
			d__3 = d__[0] / nd * alpha[i__ - 1] * *mu * n[3];
			do_lio(&c__5, &c__1, (char *)&d__3, (ftnlen)sizeof(
				doublereal));
			e_wsle();
			s_wsle(&io___43);
			do_lio(&c__9, &c__1, "rn", (ftnlen)2);
			d__1 = d__[1] / nd * alpha[i__ - 1] * *mu * n[1];
			do_lio(&c__5, &c__1, (char *)&d__1, (ftnlen)sizeof(
				doublereal));
			d__2 = d__[1] / nd * alpha[i__ - 1] * *mu * n[2];
			do_lio(&c__5, &c__1, (char *)&d__2, (ftnlen)sizeof(
				doublereal));
			d__3 = d__[1] / nd * alpha[i__ - 1] * *mu * n[3];
			do_lio(&c__5, &c__1, (char *)&d__3, (ftnlen)sizeof(
				doublereal));
			e_wsle();
			det = lp[0] * lp[3] - lp[1] * lp[2];
			s_wsle(&io___44);
			do_lio(&c__9, &c__1, "det", (ftnlen)3);
			do_lio(&c__5, &c__1, (char *)&det, (ftnlen)sizeof(
				doublereal));
			e_wsle();
		    }
		    for (j = 1; j <= 3; ++j) {
			for (k = 1; k <= 2; ++k) {
			    ltslip[(k - 1) * 3 + j] = ltslip[(k - 1) * 3 + j] 
				    + lp[(k - 1) * 2] * t[j] + lp[(k - 1 << 1)
				     + 1] * t[j + 3];

			    rslip[(k - 1) * 3 + j] -= d__[k - 1] / nd * alpha[
				    i__ - 1] * *mu * n[j];
			}
		    }
		}
	    }
	}
    }

    return 0;
} /* regularization_slip_iwan__ */

