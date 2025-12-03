/* moehring.f -- translated by f2c (version 20200916).
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

static doublereal c_b4 = .5714285714285714;
static doublereal c_b5 = 3.6;
static integer c__9 = 9;
static integer c__1 = 1;
static integer c__5 = 5;
static integer c__201 = 201;
static doublereal c_b18 = .2;
static doublereal c_b25 = -.2;
static doublereal c_b37 = 1.75;


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

/* Subroutine */ int moehring_(integer *node1, integer *node2, integer *nodem,
	 integer *nelem, char *lakon, integer *kon, integer *ipkon, integer *
	nactdog, logical *identity, integer *ielprop, doublereal *prop, 
	integer *kflag, doublereal *v, doublereal *xflow, doublereal *f, 
	integer *nodef, integer *idirf, doublereal *df, doublereal *cp, 
	doublereal *r__, doublereal *dvi, integer *numf, char *set, integer *
	mi, doublereal *ttime, doublereal *time, integer *iaxial, integer *
	iplausi, ftnlen lakon_len, ftnlen set_len)
{
    /* System generated locals */
    integer v_dim1, v_offset;
    doublereal d__1, d__2, d__3, d__4;

    /* Builtin functions */
    double atan(doublereal), sqrt(doublereal), pow_dd(doublereal *, 
	    doublereal *);
    integer i_dnnt(doublereal *), s_cmp(char *, char *, ftnlen, ftnlen), 
	    s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    doublereal r_shroud__, swirl_up__, a, b, pdiff_min__;
    integer node_down__;
    doublereal k0, qred_crit__, p1, p2, t1, t2, cm, cq, cr, pi, mr, pr, zk0;
    extern doublereal f_k__();
    doublereal c_p__;
    extern doublereal f_m__(), f_p__();
    doublereal gap;
    extern doublereal f_t__();
    integer ier;
    doublereal phi;
    integer key;
    doublereal kup, pup, rup, tup, cq_0__;
    extern doublereal f_cm__();
    extern /* Subroutine */ int dqag_(D_fp, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     integer *, integer *, integer *, integer *, integer *, integer *,
	     doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *);
    integer last, lenw;
    extern /* Subroutine */ int exit_(integer *);
    doublereal rurd, work[1200], phi_0__, omega, pdiff, kappa;
    integer neval;
    doublereal r_min__;
    integer index;
    doublereal r_max__;
    integer limit;
    doublereal pdown, rdown, tdown;
    integer iwork2[400];
    doublereal re_phi__, epsabs, abserr, epsrel, lambda1, lambda2, rsrmax, 
	    result, xflow_0__;
    integer node_up__;

    /* Fortran I/O blocks */
    static cilist io___28 = { 0, 6, 0, 0, 0 };
    static cilist io___29 = { 0, 6, 0, 0, 0 };
    static cilist io___30 = { 0, 6, 0, 0, 0 };



/*     moehring element */
/*     This subroutines computes the evolution of the core swirl ratio */
/*     for a disc stator system with either centrifugal or centripetal */
/*     flow. */
/*     Theoretical explanations can be found in */
/*     "Untersuchung dfes radialen Druckverlaufes und des übertragenen */
/*     drehmomentes im Radseitenraum von Kreiselpumpen bei glatter, */
/*     ebene Radwand und bei Anvendung von Rückenschaufeln" */
/*     Uwe Klaus Möhring , Dissertation, */
/*     An der Üniversität Carolo-Wilhelmina zu Braunschweig 1976 */

/*     author: Yannick Muller */








/*      numf=4 */

    /* Parameter adjustments */
    lakon -= 8;
    --kon;
    --ipkon;
    nactdog -= 4;
    --ielprop;
    --prop;
    --nodef;
    --idirf;
    --df;
    set -= 81;
    --mi;
    v_dim1 = mi[2] - 0 + 1;
    v_offset = 0 + v_dim1;
    v -= v_offset;

    /* Function Body */
    if (*kflag == 0) {
	*identity = TRUE_;

	if (nactdog[(*node1 << 2) + 2] != 0) {
	    *identity = FALSE_;
	} else if (nactdog[(*node2 << 2) + 2] != 0) {
	    *identity = FALSE_;
	} else if (nactdog[(*nodem << 2) + 1] != 0) {
	    *identity = FALSE_;
	}

    } else if (*kflag == 1) {
	if (v[*nodem * v_dim1 + 1] != 0.) {
	    *xflow = v[*nodem * v_dim1 + 1];
	    return 0;
	}

	pi = atan(1.) * 4.;
	kappa = *cp / (*cp - *r__);
	index = ielprop[*nelem];
	d__1 = (kappa - 1.) * .5 + 1.;
	d__2 = (kappa + 1.) * -.5 / (kappa - 1.);
	qred_crit__ = sqrt(kappa / *r__) * pow_dd(&d__1, &d__2);

/*     Because there is no explicit expression relating massflow */
/*     to pressure loss for möhrings */
/*     initial mass flow is set to arbitrarily */
/*     with consideration to flow direction */

	*node1 = kon[ipkon[*nelem] + 1];
	*node2 = kon[ipkon[*nelem] + 3];
	p1 = v[*node1 * v_dim1 + 2];
	p2 = v[*node2 * v_dim1 + 2];
	t1 = v[*node1 * v_dim1];
	t2 = v[*node2 * v_dim1];

/*     fictious cross section */
/*         A=1d-5 */
	if (p1 > p2) {
	    *xflow = 1 / sqrt(t1) * p1 * qred_crit__ * .5;
	} else {
	    *xflow = -1 / sqrt(t1) * p1 * qred_crit__ * .5;
	}

    } else if (*kflag == 2) {

	*numf = 4;
	index = ielprop[*nelem];
	pi = atan(1.) * 4.;

/*     Cr */
	cr = .315;

/*     minimal disc radius */
	r_min__ = prop[index + 1];

/*     maximal disc radius */
	r_max__ = prop[index + 2];

/*     R_min/R_max */
	rurd = r_min__ / r_max__;

/*     disc/stator gap */
	gap = prop[index + 3];

/*     shroud radius */
	r_shroud__ = prop[index + 4];

/*     R_schroud/R_max */
	rsrmax = r_shroud__ / r_max__;

/*     defining flow parameters */

/*     massflow */
	*xflow = v[*nodem * v_dim1 + 1] * *iaxial;

/*     upstream node */
	node_up__ = i_dnnt(&prop[index + 5]);

/*     downstream node */
	node_down__ = i_dnnt(&prop[index + 6]);

/*     centripetal */
	if (s_cmp(lakon + ((*nelem << 3) + 1), "MRGP", (ftnlen)4, (ftnlen)4) 
		== 0) {
	    if (*xflow < 0.) {
		*xflow = -(*xflow);
	    }

	    rup = r_max__;
	    rdown = r_min__;

	    nodef[1] = node_up__;
	    nodef[2] = node_up__;
	    nodef[3] = *nodem;
	    nodef[4] = node_down__;

/*     centrifugal */
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "MRGF", (ftnlen)4, (
		ftnlen)4) == 0) {
	    if (*xflow > 0.) {
		*xflow = -(*xflow);
	    }

	    rup = r_min__;
	    rdown = r_max__;

/*            if(xflow.gt.0) then */
	    nodef[1] = node_up__;
	    nodef[2] = node_up__;
	    nodef[3] = *nodem;
	    nodef[4] = node_down__;
	}

/*     upstream pressure */
	pup = v[node_up__ * v_dim1 + 2];

/*     downstream pressure */
	pdown = v[node_down__ * v_dim1 + 2];

/*     Upstream temperature */
	tup = v[node_up__ * v_dim1];

/*     downstream temperature */
	tdown = v[node_down__ * v_dim1];

	idirf[1] = 2;
	idirf[2] = 0;
	idirf[3] = 1;
	idirf[4] = 2;

/*     rotation related parameters */

/*     rotation */

	omega = prop[index + 7];

/*     swirl at R_upstream */
	swirl_up__ = prop[index + 8];

/*     core swirl ratio when xflow=0 */
	d__1 = pow_dd(&rsrmax, &c_b5) * (rsrmax + gap * 4.6 / r_max__);
	k0 = 1. / (pow_dd(&d__1, &c_b4) + 1.);

/*     core swirl ratio at R_inlet */
	kup = swirl_up__ / (omega * rup);

/*     dynamic_viscosity */
	if (abs(*dvi) < 1e-30) {
	    s_wsle(&io___28);
	    do_lio(&c__9, &c__1, "*ERROR in moehring: ", (ftnlen)20);
	    e_wsle();
	    s_wsle(&io___29);
	    do_lio(&c__9, &c__1, "       no dynamic viscosity defined", (
		    ftnlen)35);
	    e_wsle();
	    s_wsle(&io___30);
	    do_lio(&c__9, &c__1, "       dvi= ", (ftnlen)12);
	    do_lio(&c__5, &c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    e_wsle();
	    exit_(&c__201);
	}

/*     defining common coefficients */

/* Computing 3rd power */
	d__1 = r_max__;
	cq = *xflow * *r__ * tup / (pup * omega * (d__1 * (d__1 * d__1)));

/* Computing 2nd power */
	d__1 = r_max__;
	re_phi__ = omega * (d__1 * d__1) * pup / (*dvi * *r__ * tup);

	phi = cq * pow_dd(&re_phi__, &c_b18);

	zk0 = (1 - k0) / k0;

/*     lambda1 */
/* Computing 2nd power */
	d__3 = r_max__;
	d__2 = omega * (d__3 * d__3);
/* Computing 3rd power */
	d__4 = r_max__;
	lambda1 = (r_max__ - r_min__) / (d__1 = r_max__ - r_min__, abs(d__1)) 
		* pi * cr / 4 * (*dvi * *r__ / pow_dd(&d__2, &c_b18) * (omega 
		* (d__4 * (d__4 * d__4))) / *r__);

/*     lambda2 */
/* Computing 2nd power */
	d__1 = omega;
/* Computing 2nd power */
	d__2 = r_max__;
	lambda2 = *r__ * 2. / (d__1 * d__1 * (d__2 * d__2));

/* ************************************************************************* */
/*     integration of K(X),dKdp(X),dKdT(X),dKdm(X) */
	limit = 201;
	lenw = limit * 5;

/*         if(lakon(nelem)(2:5).eq.'MRGF') then */
/* xflow.lt.0d0) then */

/*     lower integration boundary */
	a = rurd;

/*     upper integration boundary */
	b = 1.;

/*         elseif(lakon(nelem)(2:5).eq.'MRGP') then */

/*     lower integration boundary */
/*            a=1d0 */

/*     upper integration boundary */
/*            b=rurd */
/*         endif */

/*     absolute error */
	epsabs = 1e-7;

/*     relative error */
	epsrel = 1e-7;

/*     choice for local integration rule */
	key = 1;

/*     determining minimal pressure difference for xflow<<1 */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "MRGF", (ftnlen)4, (ftnlen)4) 
		== 0) {
	    xflow_0__ = -3e-11;
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "MRGP", (ftnlen)4, (
		ftnlen)4) == 0) {
	    xflow_0__ = 3e-11;
	}

/* Computing 3rd power */
	d__1 = r_max__;
	cq_0__ = xflow_0__ * *r__ * tup / (pup * omega * (d__1 * (d__1 * d__1)
		));

	phi_0__ = cq_0__ * pow_dd(&re_phi__, &c_b18);

	dqag_((D_fp)f_k__, &a, &b, &epsabs, &epsrel, &key, &result, &abserr, &
		neval, &ier, &limit, &lenw, &last, iwork2, work, &phi_0__, &
		lambda1, &zk0, &pup, &tup, &rurd, &xflow_0__, &kup);

/*     pressure coefficient */
	c_p__ = result * 2;
/* Computing 2nd power */
	d__1 = omega;
/* Computing 2nd power */
	d__2 = r_max__;
	pdiff_min__ = c_p__ * pup / (*r__ * 4 * tup) * (d__1 * d__1) * (d__2 *
		 d__2);
	pdiff = (d__1 = pdown - pup, abs(d__1));

/*     K(x) */

	dqag_((D_fp)f_k__, &a, &b, &epsabs, &epsrel, &key, &result, &abserr, &
		neval, &ier, &limit, &lenw, &last, iwork2, work, &phi, &
		lambda1, &zk0, &pup, &tup, &rurd, xflow, &kup);

/*     residual */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "MRGF", (ftnlen)4, (ftnlen)4) 
		== 0) {
	    *f = lambda2 * (pdown - pup) / (pdown + pup) * tup - result;
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "MRGP", (ftnlen)4, (
		ftnlen)4) == 0) {
	    *f = lambda2 * (pup - pdown) / (pup + pdown) * tup - result;
	}

/*     pressure coefficient */
	c_p__ = result * 2;

/*     moment coefficient */
	dqag_((D_fp)f_cm__, &a, &b, &epsabs, &epsrel, &key, &result, &abserr, 
		&neval, &ier, &limit, &lenw, &last, iwork2, work, &phi, &
		lambda1, &zk0, &pup, &tup, &rurd, xflow, &kup);

	cm = pi * .5 * cr * pow_dd(&re_phi__, &c_b25) * result;
/* Computing 2nd power */
	d__1 = omega;
/* Computing 5th power */
	d__2 = r_max__, d__3 = d__2, d__2 *= d__2;
	mr = cm * .5 * (pup / 1e3 / (*r__ * tup)) * (d__1 * d__1) * (d__3 * (
		d__2 * d__2));
	pr = mr * omega;

/*     pressure */

	dqag_((D_fp)f_p__, &a, &b, &epsabs, &epsrel, &key, &result, &abserr, &
		neval, &ier, &limit, &lenw, &last, iwork2, work, &phi, &
		lambda1, &zk0, &pup, &tup, &rurd, xflow, &kup);

/*     partial derivative (upstream pressure) */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "MRGF", (ftnlen)4, (ftnlen)4) 
		== 0) {
/* Computing 2nd power */
	    d__1 = pdown + pup;
	    df[1] = pow_dd(&lambda2, &pdown) * -2 / (d__1 * d__1) * tup - 
		    result;
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "MRGP", (ftnlen)4, (
		ftnlen)4) == 0) {
/* Computing 2nd power */
	    d__1 = pdown + pup;
	    df[1] = pow_dd(&lambda2, &pdown) * 2 / (d__1 * d__1) * tup - 
		    result;
	}

/*     temperature */

	dqag_((D_fp)f_t__, &a, &b, &epsabs, &epsrel, &key, &result, &abserr, &
		neval, &ier, &limit, &lenw, &last, iwork2, work, &phi, &
		lambda1, &zk0, &pup, &tup, &rurd, xflow, &kup);

/*     partial derivative (upstream temperature) */
	if (s_cmp(lakon + ((*nelem << 3) + 1), "MRGF", (ftnlen)4, (ftnlen)4) 
		== 0) {
	    d__1 = pdown - pup;
	    df[2] = pow_dd(&lambda2, &d__1) / (pdown + pup) - result;
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "MRGP", (ftnlen)4, (
		ftnlen)4) == 0) {
	    d__1 = pup - pdown;
	    df[2] = pow_dd(&lambda2, &d__1) / (pdown + pup) - result;
	}

/*     mass flow */

	dqag_((D_fp)f_m__, &a, &b, &epsabs, &epsrel, &key, &result, &abserr, &
		neval, &ier, &limit, &lenw, &last, iwork2, work, &phi, &
		lambda1, &zk0, &pup, &tup, &rurd, xflow, &kup);

/*     partial derivative (mass flow) */
	df[3] = -result;

/*     pressure */
/*     partial derivative (downstream pressure) */
	if (s_cmp(lakon + ((*nelem << 3) + 1), "MRGF", (ftnlen)4, (ftnlen)4) 
		== 0) {
/* Computing 2nd power */
	    d__1 = pdown + pup;
	    df[4] = pow_dd(&lambda2, &pup) * 2 / (d__1 * d__1) * tup;
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "MRGP", (ftnlen)4, (
		ftnlen)4) == 0) {
/* Computing 2nd power */
	    d__1 = pdown + pup;
	    df[4] = pow_dd(&lambda2, &pup) * -2 / (d__1 * d__1) * tup;
	}

    }

    *xflow /= *iaxial;
    df[3] *= *iaxial;

    return 0;
} /* moehring_ */


/* ***************************************************************************** */
doublereal f_k__(doublereal *x, doublereal *phi, doublereal *lambda1, 
	doublereal *zk0, doublereal *pup, doublereal *tup, doublereal *rurd, 
	doublereal *xflow, doublereal *kup)
{
    /* System generated locals */
    doublereal ret_val, d__1;

    /* Local variables */
    integer j;
    doublereal t, y[1];
    integer neq, liw, lrw, idid;
    extern /* Subroutine */ int dkdx_();
    integer ipar;
    doublereal info[15], atol, rpar[8], rtol;
    integer iwork[100];
    doublereal rwork[160];
    extern /* Subroutine */ int ddeabm_(U_fp, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, doublereal *, integer *, integer *, 
	    integer *, doublereal *, integer *);




/*     storing the parameters */
    rpar[0] = *phi;
    rpar[2] = *zk0;

/*    relative error */
    rtol = 1e-7;
/*     absolute error */
    atol = 1e-7;

/*     initial value */
    if (*xflow < 0.) {
	t = *rurd;
    } else {
	t = 1.;
    }
    neq = 1;

/*     initialisation info field */
    for (j = 1; j <= 15; ++j) {
	info[j - 1] = 0.;
    }
/*     initial condition f(0) */
/*     core swirl ratio at Rup repectively Rdown depending */
/*     on the type of element centrifugal or centripetal */

    y[0] = *kup;

    lrw = 160;
    liw = 60;

/*     solving the differential equation Möhring 3.35 */
/*     dK/dX=f(K(X)) */

    if (abs(*xflow) > 1e-6) {
	ddeabm_((U_fp)dkdx_, &neq, &t, y, x, info, &rtol, &atol, &idid, rwork,
		 &lrw, iwork, &liw, rpar, &ipar);
    } else {
	y[0] = 1 / (*zk0 + 1);
    }

/* Computing 2nd power */
    d__1 = y[0];
    ret_val = d__1 * d__1 * *x;

    return ret_val;
} /* f_k__ */

/* ***************************************************************************** */
doublereal f_p__(doublereal *x, doublereal *phi, doublereal *lambda1, 
	doublereal *zk0, doublereal *pup, doublereal *tup, doublereal *rurd, 
	doublereal *xflow, doublereal *kup)
{
    /* System generated locals */
    doublereal ret_val;

    /* Local variables */
    integer j;
    doublereal t, y[1];
    integer neq, liw, lrw, idid;
    extern /* Subroutine */ int dkdp_();
    integer ipar;
    doublereal info[15], atol, rpar[8], rtol;
    integer iwork[100];
    doublereal rwork[160];
    extern /* Subroutine */ int ddeabm_(U_fp, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, doublereal *, integer *, integer *, 
	    integer *, doublereal *, integer *);



/*     storing the parameters */
    rpar[0] = *phi;
    rpar[1] = *lambda1;
    rpar[2] = *zk0;
    rpar[3] = *pup;
    rpar[4] = *tup;
    rpar[5] = *rurd;
    rpar[6] = *xflow;
    rpar[7] = *kup;

/*    relative error */
    rtol = 1e-7;
/*     absolute error */
    atol = 1e-7;

/*     initial value */
    if (*xflow < 0.) {
	t = *rurd;
    } else {
	t = 1.;
    }
    neq = 1;

/*     initialisation info field */
    for (j = 1; j <= 15; ++j) {
	info[j - 1] = 0.;
    }
/*     initial condition f(0) */
/*     core swirl ratio at Rup */

    y[0] = 0.;

    lrw = 160;
    liw = 60;

    ddeabm_((U_fp)dkdp_, &neq, &t, y, x, info, &rtol, &atol, &idid, rwork, &
	    lrw, iwork, &liw, rpar, &ipar);

    ret_val = y[0] * 2 * *x;

    return ret_val;
} /* f_p__ */

/* **************************************************************************** */
doublereal f_t__(doublereal *x, doublereal *phi, doublereal *lambda1, 
	doublereal *zk0, doublereal *pup, doublereal *tup, doublereal *rurd, 
	doublereal *xflow, doublereal *kup)
{
    /* System generated locals */
    doublereal ret_val;

    /* Local variables */
    integer j;
    doublereal t, y[1];
    integer neq, liw, lrw, idid;
    extern /* Subroutine */ int dkdt_();
    integer ipar;
    doublereal info[15], atol, rpar[8], rtol;
    integer iwork[100];
    doublereal rwork[160];
    extern /* Subroutine */ int ddeabm_(U_fp, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, doublereal *, integer *, integer *, 
	    integer *, doublereal *, integer *);




/*     storing the parameters */
    rpar[0] = *phi;
    rpar[1] = *lambda1;
    rpar[2] = *zk0;
    rpar[3] = *pup;
    rpar[4] = *tup;
    rpar[5] = *rurd;
    rpar[6] = *xflow;
    rpar[7] = *kup;

/*     relative error */
    rtol = 1e-7;
/*     absolute error */
    atol = 1e-7;

/*     initial value */
    if (*xflow < 0.) {
	t = *rurd;
    } else {
	t = 1.;
    }
/*      if(xflow.lt.0d0) then */
/*         t=rurd */
/*      else */
/*         t=1.d0 */
/*      endif */
    neq = 1;

/*     initialisation info field */
    for (j = 1; j <= 15; ++j) {
	info[j - 1] = 0.;
    }
/*     initial condition f(0) */
/*     core swirl ratio at Rup */

    y[0] = 0.;

    lrw = 160;
    liw = 60;

    ddeabm_((U_fp)dkdt_, &neq, &t, y, x, info, &rtol, &atol, &idid, rwork, &
	    lrw, iwork, &liw, rpar, &ipar);

    ret_val = y[0] * 2. * *x;

    return ret_val;
} /* f_t__ */

/* ***************************************************************************** */
doublereal f_m__(doublereal *x, doublereal *phi, doublereal *lambda1, 
	doublereal *zk0, doublereal *pup, doublereal *tup, doublereal *rurd, 
	doublereal *xflow, doublereal *kup)
{
    /* System generated locals */
    doublereal ret_val;

    /* Local variables */
    integer j;
    doublereal t, y[1];
    integer neq, liw, lrw, idid;
    extern /* Subroutine */ int dkdm_();
    integer ipar;
    doublereal info[15], atol, rpar[8], rtol;
    integer iwork[100];
    doublereal rwork[160];
    extern /* Subroutine */ int ddeabm_(U_fp, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, doublereal *, integer *, integer *, 
	    integer *, doublereal *, integer *);




/*     storing the parameters */
    rpar[0] = *phi;
    rpar[1] = *lambda1;
    rpar[2] = *zk0;
    rpar[3] = *pup;
    rpar[4] = *tup;
    rpar[5] = *rurd;
    rpar[6] = *xflow;
    rpar[7] = *kup;

/*     relative error */
    rtol = 1e-7;
/*     absolute error */
    atol = 1e-7;

/*     initial value */
    if (*xflow < 0.) {
	t = *rurd;
    } else {
	t = 1.;
    }
    neq = 1;

/*     initialisation info field */
    for (j = 1; j <= 15; ++j) {
	info[j - 1] = 0.;
    }
/*     initial condition f(0) */
/*     core swirl ratio at Rup */

    y[0] = 0.;

    lrw = 160;
    liw = 60;

/*     solving the differential equation Möhring 3.35 */
/*     dK/dX=f(K(X)) */

    ddeabm_((U_fp)dkdm_, &neq, &t, y, x, info, &rtol, &atol, &idid, rwork, &
	    lrw, iwork, &liw, rpar, &ipar);

    ret_val = y[0] * 2 * *x;

    return ret_val;
} /* f_m__ */

/* ***************************************************************************** */
doublereal f_cm__(doublereal *x, doublereal *phi, doublereal *lambda1, 
	doublereal *zk0, doublereal *pup, doublereal *tup, doublereal *rurd, 
	doublereal *xflow, doublereal *kup)
{
    /* System generated locals */
    doublereal ret_val, d__1, d__2, d__3;

    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *);

    /* Local variables */
    integer j;
    doublereal t, y[1];
    integer neq, liw, lrw, idid;
    extern /* Subroutine */ int dkdx_();
    integer ipar;
    doublereal info[15], atol, rpar[8], rtol;
    integer iwork[100];
    doublereal rwork[160];
    extern /* Subroutine */ int ddeabm_(U_fp, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, doublereal *, integer *, integer *, 
	    integer *, doublereal *, integer *);




/*     storing the parameters */
    rpar[0] = *phi;
    rpar[1] = *lambda1;
    rpar[2] = *zk0;
    rpar[3] = *pup;
    rpar[4] = *tup;
    rpar[5] = *rurd;
    rpar[6] = *xflow;
    rpar[7] = *kup;

/*     relative error */
    rtol = 1e-7;
/*     absolute error */
    atol = 1e-7;
/*     initial value */

    if (*xflow < 0.) {
	t = *rurd;
    } else {
	t = 1.;
    }

    neq = 1;

/*     initialisation info field */
    for (j = 1; j <= 15; ++j) {
	info[j - 1] = 0.;
    }
/*     initial condition f(0) */
/*     core swirl ratio at Rup */

    y[0] = *kup;

    lrw = 160;
    liw = 60;

/*     solving the differential equation Möhring 3.35 */
/*     dK/dX=f(K(X)) */

    ddeabm_((U_fp)dkdx_, &neq, &t, y, x, info, &rtol, &atol, &idid, rwork, &
	    lrw, iwork, &liw, rpar, &ipar);

    d__3 = (d__2 = 1 - y[0], abs(d__2));
    ret_val = (d__1 = 1 - y[0], abs(d__1)) / (1 - y[0]) * pow_dd(&d__3, &
	    c_b37) * pow_dd(x, &c_b5);

    return ret_val;
} /* f_cm__ */

