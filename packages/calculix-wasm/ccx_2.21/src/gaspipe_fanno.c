/* gaspipe_fanno.f -- translated by f2c (version 20200916).
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
static integer c__201 = 201;
static integer c__3 = 3;


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

/* Subroutine */ int gaspipe_fanno__(integer *node1, integer *node2, integer *
	nodem, integer *nelem, char *lakon, integer *kon, integer *ipkon, 
	integer *nactdog, logical *identity, integer *ielprop, doublereal *
	prop, integer *kflag, doublereal *v, doublereal *xflow, doublereal *f,
	 integer *nodef, integer *idirf, doublereal *df, doublereal *cp, 
	doublereal *r__, doublereal *physcon, doublereal *dvi, integer *numf, 
	char *set, doublereal *shcon, integer *nshcon, doublereal *rhcon, 
	integer *nrhcon, integer *ntmat___, doublereal *co, doublereal *vold, 
	integer *mi, doublereal *ttime, doublereal *time, integer *iaxial, 
	integer *iplausi, ftnlen lakon_len, ftnlen set_len)
{
    /* Format strings */
    static char fmt_55[] = "(1x,a,i6,a,i6,a,e11.4,a,e11.4)";
    static char fmt_53[] = "(1x,a,i6,a,e11.4,a,e11.4,a,e11.4,a,e11.4)";
    static char fmt_57[] = "(1x,a,e11.4,a,e11.4)";
    static char fmt_58[] = "(1x,a,e11.4,a,e11.4,a,e11.4,a,e11.4)";

    /* System generated locals */
    integer v_dim1, v_offset, shcon_dim2, shcon_offset, rhcon_dim2, 
	    rhcon_offset, vold_dim1, vold_offset;
    doublereal d__1, d__2;

    /* Builtin functions */
    double atan(doublereal);
    integer s_cmp(char *, char *, ftnlen, ftnlen), i_dnnt(doublereal *);
    double sqrt(doublereal), pow_dd(doublereal *, doublereal *);
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);
    double log(doublereal);
    integer s_wsfe(cilist *), do_fio(integer *, char *, ftnlen), e_wsfe(void);

    /* Local variables */
    doublereal pt2zpt1_c__;
    logical wrongdir;
    doublereal reynolds, a, d__, l, form_fact__, c2, m1, m2, t1, t2, 
	    xflow_air__, z1, z2, xflow_oil__, bb, cc, qred1_crit__, pi, ks, 
	    ee1, ee2, km1, kp1, pt1, pt2, tt1, tt2, lld, phi, p2p1;
    integer inv;
    doublereal m1_c__;
    extern /* Subroutine */ int pt2zpt1_crit__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, logical *,
	     integer *, doublereal *);
    doublereal qred;
    logical crit;
    extern /* Subroutine */ int exit_(integer *);
    doublereal dfdm1, dfdm2, kdkm1, qred1, tdkp1;
    extern /* Subroutine */ int friction_coefficient__(doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *);
    integer icase, nodea, nodeb, nodec;
    doublereal km1d2k, kappa;
    integer k_oil__, index;
    doublereal lambda, radius, pt2zpt1;
    extern /* Subroutine */ int two_phase_flow__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, char *, integer *, integer 
	    *, integer *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     integer *, integer *, doublereal *, doublereal *, integer *, 
	    integer *, ftnlen), ts_calc__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *), tt_calc__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *);

    /* Fortran I/O blocks */
    static cilist io___27 = { 0, 6, 0, 0, 0 };
    static cilist io___28 = { 0, 6, 0, 0, 0 };
    static cilist io___29 = { 0, 6, 0, 0, 0 };
    static cilist io___41 = { 0, 6, 0, 0, 0 };
    static cilist io___42 = { 0, 6, 0, 0, 0 };
    static cilist io___43 = { 0, 6, 0, 0, 0 };
    static cilist io___59 = { 0, 6, 0, 0, 0 };
    static cilist io___60 = { 0, 6, 0, 0, 0 };
    static cilist io___61 = { 0, 6, 0, 0, 0 };
    static cilist io___62 = { 0, 1, 0, 0, 0 };
    static cilist io___63 = { 0, 1, 0, fmt_55, 0 };
    static cilist io___64 = { 0, 1, 0, fmt_53, 0 };
    static cilist io___65 = { 0, 1, 0, 0, 0 };
    static cilist io___66 = { 0, 1, 0, fmt_57, 0 };
    static cilist io___67 = { 0, 1, 0, fmt_58, 0 };
    static cilist io___68 = { 0, 1, 0, fmt_53, 0 };
    static cilist io___69 = { 0, 1, 0, fmt_53, 0 };
    static cilist io___70 = { 0, 1, 0, 0, 0 };
    static cilist io___71 = { 0, 1, 0, fmt_57, 0 };
    static cilist io___72 = { 0, 1, 0, fmt_58, 0 };
    static cilist io___73 = { 0, 1, 0, fmt_53, 0 };



/*     pipe with friction losses (Fanno Formulas) GAPF */

/*     author: Yannick Muller */





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
    --physcon;
    set -= 81;
    --nshcon;
    --nrhcon;
    rhcon_dim2 = *ntmat___;
    rhcon_offset = 0 + 2 * (1 + rhcon_dim2);
    rhcon -= rhcon_offset;
    shcon_dim2 = *ntmat___;
    shcon_offset = 0 + 4 * (1 + shcon_dim2);
    shcon -= shcon_offset;
    co -= 4;
    --mi;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;
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

	pi = atan(1.) * 4.;

	index = ielprop[*nelem];
	kappa = *cp / (*cp - *r__);
	a = prop[index + 1];
	d__ = prop[index + 2];
	l = prop[index + 3];
	ks = prop[index + 4];
	if (s_cmp(lakon + ((*nelem << 3) + 1), "GAPFA", (ftnlen)5, (ftnlen)5) 
		== 0) {
	    icase = 0;
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "GAPFI", (ftnlen)5, (
		ftnlen)5) == 0) {
	    icase = 1;
	}
	form_fact__ = prop[index + 5];
	xflow_oil__ = prop[index + 6];
	k_oil__ = i_dnnt(&prop[index + 7]);

	if (s_cmp(lakon + ((*nelem << 3) + 6), "FR", (ftnlen)2, (ftnlen)2) == 
		0) {

/*     flexible radius */

	    nodea = i_dnnt(&prop[index + 1]);
	    nodeb = i_dnnt(&prop[index + 2]);
/* Computing 2nd power */
	    d__1 = co[nodeb * 3 + 1] + vold[nodeb * vold_dim1 + 1] - co[nodea 
		    * 3 + 1] - vold[nodea * vold_dim1 + 1];
	    radius = sqrt(d__1 * d__1);

/* Computing 2nd power */
	    d__1 = radius;
	    a = pi * (d__1 * d__1);
	    d__ = radius * 2;

	} else if (s_cmp(lakon + ((*nelem << 3) + 6), "RL", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     flexible radius and length */

	    nodea = i_dnnt(&prop[index + 1]);
	    nodeb = i_dnnt(&prop[index + 2]);
	    nodec = i_dnnt(&prop[index + 3]);
/* Computing 2nd power */
	    d__1 = co[nodeb * 3 + 1] + vold[nodeb * vold_dim1 + 1] - co[nodea 
		    * 3 + 1] - vold[nodea * vold_dim1 + 1];
	    radius = sqrt(d__1 * d__1);
	    d__ = radius * 2;
/* Computing 2nd power */
	    d__1 = radius;
	    a = pi * (d__1 * d__1);
/* Computing 2nd power */
	    d__1 = co[nodec * 3 + 2] + vold[nodec * vold_dim1 + 2] - co[nodeb 
		    * 3 + 2] - vold[nodeb * vold_dim1 + 2];
	    l = sqrt(d__1 * d__1);
	}

	pt1 = v[*node1 * v_dim1 + 2];
	pt2 = v[*node2 * v_dim1 + 2];

	if (pt1 >= pt2) {
	    inv = 1;
	    tt1 = v[*node1 * v_dim1] - physcon[1];
	    tt2 = v[*node2 * v_dim1] - physcon[1];
	} else {
	    inv = -1;
	    pt1 = v[*node2 * v_dim1 + 2];
	    pt2 = v[*node1 * v_dim1 + 2];
	    tt1 = v[*node2 * v_dim1] - physcon[1];
	    tt2 = v[*node1 * v_dim1] - physcon[1];
	}

	p2p1 = pt2 / pt1;
	km1 = kappa - 1.;
	kp1 = kappa + 1.;
	kdkm1 = kappa / km1;
	tdkp1 = 2. / kp1;
	c2 = pow_dd(&tdkp1, &kdkm1);

/*     estimate of the flow using the orifice relationships */
/*     the flow is needed for Reynolds, Reynolds is needed */
/*     for the friction coefficient */

	if (v[*nodem * v_dim1 + 1] * inv <= 0.) {
	    if (p2p1 > c2) {
		d__1 = 2. / kappa;
		d__2 = 1. / kdkm1;
		*xflow = inv * pt1 * a * sqrt(kdkm1 * 2. * pow_dd(&p2p1, &
			d__1) * (1. - pow_dd(&p2p1, &d__2)) / *r__) / sqrt(
			tt1);
	    } else {
		d__1 = kp1 / (km1 * 2.);
		*xflow = inv * pt1 * a * sqrt(kappa / *r__) * pow_dd(&tdkp1, &
			d__1) / sqrt(tt1);
	    }
	} else {
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	}

/*     calculation of the dynamic viscosity */

	if (abs(*dvi) < 1e-30) {
	    s_wsle(&io___27);
	    do_lio(&c__9, &c__1, "*ERROR in gaspipe_fanno: ", (ftnlen)25);
	    e_wsle();
	    s_wsle(&io___28);
	    do_lio(&c__9, &c__1, "       no dynamic viscosity defined", (
		    ftnlen)35);
	    e_wsle();
	    s_wsle(&io___29);
	    do_lio(&c__9, &c__1, "       dvi= ", (ftnlen)12);
	    do_lio(&c__5, &c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    e_wsle();
	    exit_(&c__201);
	}

	reynolds = abs(*xflow) * d__ / (*dvi * a);

	friction_coefficient__(&l, &d__, &ks, &reynolds, &form_fact__, &
		lambda);

/*     estimate of the flow using the incompressible relationships */
/*     for a gas pipe (for zero initial flow or flow from low */
/*     to high pressure) */

	if (v[*nodem * v_dim1 + 1] * inv <= 0.) {
	    *xflow = inv * a * sqrt(d__ / (lambda * l) * 2 * pt1 / (*r__ * 
		    tt1) * (pt1 - pt2));
	}

	pt2zpt1_crit__(&pt2, &pt1, &tt1, &lambda, &kappa, r__, &l, &d__, &
		pt2zpt1_c__, &qred1_crit__, &crit, &icase, &m1_c__);

	qred = abs(*xflow) * sqrt(tt1) / (a * pt1);

/*     correcting the mass flow if not physical */
/*     (pt2/pt1 too small or Qred too big) */

	if (crit) {

/*     the flow is set to half the critical value */

	    *xflow = inv * .5 * qred1_crit__ * pt1 * a / sqrt(tt1);
	} else if (qred > qred1_crit__) {

/*     the flow is set to half the critical value */

	    *xflow = inv * .5 * qred1_crit__ * pt1 * a / sqrt(tt1);
	}

/*     isothermal case: correcting the temperatures */

	if (icase == 1) {
	    ts_calc__(xflow, &tt1, &pt1, &kappa, r__, &a, &t1, &icase);
	    ts_calc__(xflow, &tt2, &pt2, &kappa, r__, &a, &t2, &icase);
	    if (inv == 1) {
		v[*node1 * v_dim1 + 3] = t1;
		v[*node2 * v_dim1 + 3] = t1;
		if (nactdog[*node2 * 4] == 1) {
		    v[*node2 * v_dim1] = t1 * (tt2 / t2);
		}
	    } else {
		v[*node2 * v_dim1 + 3] = t1;
		v[*node1 * v_dim1 + 3] = t1;
		if (nactdog[*node1 * 4] == 1) {
		    v[*node1 * v_dim1] = t1 * (tt2 / t2);
		}
	    }
	}

/*     the pressure ratio can be such that the section is critical; */
/*     then, the mass flow is limited by the critical value; if, */
/*     however, the user has specified a mass flow v(1,nodem)*iaxial */
/*     which is smaller than the critical value xflow, the former */
/*     should be taken */

/*        if((v(1,nodem)*iaxial.lt.xflow).and.(v(1,nodem).ne.0.d0)) then */
/*          xflow=v(1,nodem)*iaxial */
/*        endif */

    } else if (*kflag == 2) {

	*numf = 5;

	pi = atan(1.) * 4.;

	kappa = *cp / (*cp - *r__);
	km1 = kappa - 1.;
	kp1 = kappa + 1.;

	index = ielprop[*nelem];
	a = prop[index + 1];
	d__ = prop[index + 2];

	l = prop[index + 3];
	ks = prop[index + 4];
	if (s_cmp(lakon + ((*nelem << 3) + 1), "GAPFA", (ftnlen)5, (ftnlen)5) 
		== 0) {
	    icase = 0;
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "GAPFI", (ftnlen)5, (
		ftnlen)5) == 0) {
	    icase = 1;
	}
	form_fact__ = prop[index + 5];
	xflow_oil__ = prop[index + 6];
	k_oil__ = i_dnnt(&prop[index + 7]);

	if (s_cmp(lakon + ((*nelem << 3) + 6), "FR", (ftnlen)2, (ftnlen)2) == 
		0) {

/*     flexible radius */

	    nodea = i_dnnt(&prop[index + 1]);
	    nodeb = i_dnnt(&prop[index + 2]);
/* Computing 2nd power */
	    d__1 = co[nodeb * 3 + 1] + vold[nodeb * vold_dim1 + 1] - co[nodea 
		    * 3 + 1] - vold[nodea * vold_dim1 + 1];
	    radius = sqrt(d__1 * d__1);
/* Computing 2nd power */
	    d__1 = radius;
	    a = pi * (d__1 * d__1);
	    d__ = radius * 2;

	} else if (s_cmp(lakon + ((*nelem << 3) + 6), "RL", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     flexible radius and length */

	    nodea = i_dnnt(&prop[index + 1]);
	    nodeb = i_dnnt(&prop[index + 2]);
	    nodec = i_dnnt(&prop[index + 3]);
/* Computing 2nd power */
	    d__1 = co[nodeb * 3 + 1] + vold[nodeb * vold_dim1 + 1] - co[nodea 
		    * 3 + 1] - vold[nodea * vold_dim1 + 1];
	    radius = sqrt(d__1 * d__1);
	    d__ = radius * 2;
/* Computing 2nd power */
	    d__1 = radius;
	    a = pi * (d__1 * d__1);
/* Computing 2nd power */
	    d__1 = co[nodec * 3 + 2] + vold[nodec * vold_dim1 + 2] - co[nodeb 
		    * 3 + 2] - vold[nodeb * vold_dim1 + 2];
	    l = sqrt(d__1 * d__1);
	}

	pt1 = v[*node1 * v_dim1 + 2];
	pt2 = v[*node2 * v_dim1 + 2];
	*xflow = v[*nodem * v_dim1 + 1] * *iaxial;

/*     inv is the sign of the flow */
/*     xflow is replaced by its absolute value */
/*     wrongdir means that the flow goes from low */
/*     pressure to high pressure */

	if (*xflow < 0.) {
	    inv = -1;
	} else {
	    inv = 1;
	}
/*     xflow=dabs(xflow) */
	if ((pt1 - pt2) * inv < 0.) {
	    wrongdir = TRUE_;
	} else {
	    wrongdir = FALSE_;
	}

/*     the element is reoriented such that the mass flow */
/*     is directed from node 1 to node 2; */
/*     the pressure in node 1 may be more or less than */
/*     the pressure in node 2 */

	if (pt1 > pt2) {

	    tt1 = v[*node1 * v_dim1] - physcon[1];
	    ts_calc__(xflow, &tt1, &pt1, &kappa, r__, &a, &t1, &icase);

	    nodef[1] = *node1;
	    nodef[2] = *node1;
	    nodef[3] = *nodem;
	    nodef[4] = *node2;
	    nodef[5] = *node2;
	} else {
	    pt1 = v[*node2 * v_dim1 + 2];
	    pt2 = v[*node1 * v_dim1 + 2];

	    tt1 = v[*node2 * v_dim1] - physcon[1];
	    ts_calc__(xflow, &tt1, &pt1, &kappa, r__, &a, &t1, &icase);

	    nodef[1] = *node2;
	    nodef[2] = *node2;
	    nodef[3] = *nodem;
	    nodef[4] = *node1;
	    nodef[5] = *node1;
	}

	idirf[1] = 2;
	idirf[2] = 0;
	idirf[3] = 1;
	idirf[4] = 2;
	idirf[5] = 0;

	pt2zpt1 = pt2 / pt1;

/*     calculation of the dynamic viscosity */

	if (abs(*dvi) < 1e-30) {
	    s_wsle(&io___41);
	    do_lio(&c__9, &c__1, "*ERROR in gaspipe_fanno: ", (ftnlen)25);
	    e_wsle();
	    s_wsle(&io___42);
	    do_lio(&c__9, &c__1, "       no dynamic viscosity defined", (
		    ftnlen)35);
	    e_wsle();
	    s_wsle(&io___43);
	    do_lio(&c__9, &c__1, "       dvi= ", (ftnlen)12);
	    do_lio(&c__5, &c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    e_wsle();
	    exit_(&c__201);
	}

	reynolds = abs(*xflow) * d__ / (*dvi * a);

/*     calculation of the friction coefficient */

	if (xflow_oil__ != 0.) {

/*     two-phase-flow */

	    xflow_air__ = *xflow;
	    two_phase_flow__(&tt1, &pt1, &t1, &tt2, &pt2, &t2, &xflow_air__, &
		    xflow_oil__, nelem, lakon + 8, &kon[1], &ipkon[1], &
		    ielprop[1], &prop[1], &v[v_offset], dvi, cp, r__, &
		    k_oil__, &phi, &lambda, &nshcon[1], &nrhcon[1], &shcon[
		    shcon_offset], &rhcon[rhcon_offset], ntmat___, &mi[1], (
		    ftnlen)8);
	    lambda *= phi;
	} else {

/*     for pure air */

/*     phi=1.d0 */
	    friction_coefficient__(&l, &d__, &ks, &reynolds, &form_fact__, &
		    lambda);
	}

/*     calculating the critical conditions */

	pt2zpt1_crit__(&pt2, &pt1, &tt1, &lambda, &kappa, r__, &l, &d__, &
		pt2zpt1_c__, &qred1_crit__, &crit, &icase, &m1_c__);

	if (wrongdir) {
	    lambda = -lambda;
	}

	qred1 = abs(*xflow) * sqrt(tt1) / (a * pt1);

/*     check whether flow is critical */
/*     assigning the physcical correct sign to xflow */

	if (crit) {
	    *xflow = inv * qred1_crit__ * a * pt1 / sqrt(tt1);

/*     check whether flow has changed; if so, update v */
/*     for consistency */

	    if ((d__1 = (*xflow - *iaxial * v[*nodem * v_dim1 + 1]) / *xflow, 
		    abs(d__1)) > 1e-5) {
		*iplausi = 0;
/*     if(nactdog(1,nodem).ne.0) v(1,nodem)=xflow/iaxial */
	    }

	    m1 = sqrt(2 / km1 * (tt1 / t1 - 1.));
	    if (icase == 0) {
		m1 = min(m1,.999);
	    } else {
/* Computing MIN */
		d__1 = m1, d__2 = .999 / sqrt(kappa);
		m1 = min(d__1,d__2);
	    }
	} else {
	    if (qred1 > qred1_crit__) {
		*xflow = inv * qred1_crit__ * a * pt1 / sqrt(tt1);

/*     check whether flow has changed; if so, update v */
/*     for consistency */

		if ((d__1 = (*xflow - *iaxial * v[*nodem * v_dim1 + 1]) / *
			xflow, abs(d__1)) > 1e-5) {
		    *iplausi = 0;
		    if (nactdog[(*nodem << 2) + 1] != 0) {
			v[*nodem * v_dim1 + 1] = *xflow / *iaxial;
		    }
		}

		m1 = m1_c__;
	    } else {
		m1 = sqrt(2 / km1 * (tt1 / t1 - 1.));
	    }

/*     determining M2: Tt2 -> T2 -> Tt2/T2 -> M2 */
/*     the actual value of Tt2 is not relevant */

	    if (icase == 0) {
		tt2 = tt1;
	    } else if (inv == 1) {
		tt2 = v[*node2 * v_dim1] - physcon[1];
	    } else {
		tt2 = v[*node1 * v_dim1] - physcon[1];
	    }
	    ts_calc__(xflow, &tt2, &pt2, &kappa, r__, &a, &t2, &icase);
	    m2 = sqrt(2 / km1 * (tt2 / t2 - 1.));
	}

/* Computing 2nd power */
	d__1 = m1;
	z1 = d__1 * d__1;

	bb = km1 / 2.;
	cc = -kp1 / (km1 * 2.);
	ee1 = m1 * (bb * z1 + 1.) / (bb * z1 * (cc * 2. + 1.) + 1.);

/*     definition of the coefficients */

	lld = lambda * l / d__;

/*     adiabatic case */

	if (icase == 0) {

/* Computing 3rd power */
	    d__1 = m1;
	    dfdm1 = (z1 - 1.) * 2. / (kappa * (d__1 * (d__1 * d__1)) * (bb * 
		    z1 + 1.));

	    if (! crit) {

/*     residual */

/* Computing 2nd power */
		d__1 = m2;
		z2 = d__1 * d__1;

		ee2 = m2 * (bb * z2 + 1.) / (bb * z2 * (cc * 2. + 1.) + 1.);
/* Computing 3rd power */
		d__1 = m2;
		dfdm2 = (1. - z2) * 2. / (kappa * (d__1 * (d__1 * d__1)) * (
			bb * z2 + 1.));

		*f = (1. / z1 - 1. / z2) / kappa + kp1 / (kappa * 2.) * log((
			bb * z2 + 1.) * z1 / ((bb * z1 + 1.) * z2)) - lld;

/*     pressure node1 */

		df[1] = -dfdm1 * ee1 / pt1;

/*     temperature node1 */

		df[2] = dfdm1 * ee1 / (tt1 * 2.);

/*     mass flow */

		df[3] = (dfdm1 * ee1 + dfdm2 * ee2) / *xflow;

/*     pressure node2 */

		df[4] = -dfdm2 * ee2 / pt2;

/*     temperature node2 */

		df[5] = dfdm2 * ee2 / (tt2 * 2.);

	    } else {

		*f = (1. / z1 - 1.) / kappa + kp1 / (kappa * 2.) * log((bb + 
			1.) * z1 / (bb * z1 + 1.)) - lld;

/*     pressure node1 */

		df[1] = -dfdm1 * ee1 / pt1;

/*     temperature node1 */

		df[2] = dfdm1 * ee1 / (tt1 * 2.);

/*     mass flow */

		df[3] = dfdm1 * ee1 / *xflow;

/*     pressure node2 */

		df[4] = 0.;

/*     temperature node2 */

		df[5] = 0.;

	    }
	} else if (icase == 1) {

/*     isothermal icase */

/* Computing 3rd power */
	    d__1 = m1;
	    dfdm1 = (kappa * z1 - 1.) * 2. / (kappa * (d__1 * (d__1 * d__1)));

	    if (! crit) {

/* Computing 2nd power */
		d__1 = m2;
		z2 = d__1 * d__1;

		ee2 = m2 * (bb * z2 + 1.) / (bb * z2 * (cc * 2. + 1.) + 1.);
/* Computing 3rd power */
		d__1 = m2;
		dfdm2 = (1. - kappa * z2) * 2. / (kappa * (d__1 * (d__1 * 
			d__1)));

/*     redidual */

		*f = (1. / z1 - 1. / z2) / kappa + log(z1 / z2) - lld;

/*     pressure node1 */

		df[1] = -dfdm1 * ee1 / pt1;

/*     temperature node1 */

		df[2] = dfdm1 * ee1 / (tt1 * 2.);

/*     mass flow */

		df[3] = (dfdm1 * ee1 + dfdm2 * ee2) / *xflow;
/*     df(3)=(dfdM1*ee1+dfdM2*ee2)/(inv*xflow) */

/*     pressure node2 */

		df[4] = -dfdm2 * ee2 / pt2;

/*     temperature node2 */

		df[5] = dfdm2 * ee2 / (tt2 * 2.);

	    } else {

/*     residual */

		*f = (1. / z1 - kappa) / kappa + log(kappa * z1) - lld;

/*     pressure node1 */

		df[1] = -dfdm1 * ee1 / pt1;

/*     temperature node1 */

		df[2] = dfdm1 * ee1 / (tt1 * 2.);

/*     mass flow */

		df[3] = dfdm1 * ee1 / *xflow;
/*     df(3)=dfdM1*ee1/(inv*xflow) */

/*     pressure node2 */

		df[4] = 0.;

/*     temperature node2 */

		df[5] = 0.;

	    }
	}

/*     output */

    } else if (*kflag == 3) {

	pi = atan(1.) * 4.;

	kappa = *cp / (*cp - *r__);
	km1 = kappa - 1.;
	kp1 = kappa + 1.;
	km1d2k = km1 / (kappa * 2.);

	index = ielprop[*nelem];
	a = prop[index + 1];
	d__ = prop[index + 2];
	l = prop[index + 3];

	lambda = .5;

	ks = prop[index + 4];
	if (s_cmp(lakon + ((*nelem << 3) + 1), "GAPFA", (ftnlen)5, (ftnlen)5) 
		== 0) {
	    icase = 0;
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "GAPFI", (ftnlen)5, (
		ftnlen)5) == 0) {
	    icase = 1;
	}
	form_fact__ = prop[index + 5];
	xflow_oil__ = prop[index + 6];
	k_oil__ = i_dnnt(&prop[index + 7]);

	pt1 = v[*node1 * v_dim1 + 2];
	pt2 = v[*node2 * v_dim1 + 2];

	if (pt1 > pt2) {
	    inv = 1;
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    tt1 = v[*node1 * v_dim1] - physcon[1];
	    ts_calc__(xflow, &tt1, &pt1, &kappa, r__, &a, &t1, &icase);
	    if (icase == 0) {
		tt2 = tt1;
	    } else {
		t2 = t1;
	    }

	} else {
	    inv = -1;
	    pt1 = v[*node2 * v_dim1 + 2];
	    pt2 = v[*node1 * v_dim1 + 2];
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    tt1 = v[*node2 * v_dim1] - physcon[1];
	    ts_calc__(xflow, &tt1, &pt1, &kappa, r__, &a, &t1, &icase);
	    if (icase == 0) {
		tt2 = tt1;
	    } else {
		t2 = t1;
	    }

	}

	pt2zpt1 = pt2 / pt1;

/*     calculation of the dynamic viscosity */

	if (abs(*dvi) < 1e-30) {
	    s_wsle(&io___59);
	    do_lio(&c__9, &c__1, "*ERROR in gaspipe_fanno: ", (ftnlen)25);
	    e_wsle();
	    s_wsle(&io___60);
	    do_lio(&c__9, &c__1, "       no dynamic viscosity defined", (
		    ftnlen)35);
	    e_wsle();
	    s_wsle(&io___61);
	    do_lio(&c__9, &c__1, "       dvi= ", (ftnlen)12);
	    do_lio(&c__5, &c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    e_wsle();
	    exit_(&c__201);
	}

	reynolds = abs(*xflow) * d__ / (*dvi * a);

	if (reynolds < 1.) {
	    reynolds = 1.;
	}

/*     definition of the friction coefficient for 2 phase flows and pure air */

	if (xflow_oil__ != 0.) {
	    two_phase_flow__(&tt1, &pt1, &t1, &tt2, &pt2, &t2, xflow, &
		    xflow_oil__, nelem, lakon + 8, &kon[1], &ipkon[1], &
		    ielprop[1], &prop[1], &v[v_offset], dvi, cp, r__, &
		    k_oil__, &phi, &lambda, &nshcon[1], &nrhcon[1], &shcon[
		    shcon_offset], &rhcon[rhcon_offset], ntmat___, &mi[1], (
		    ftnlen)8);
	    lambda *= phi;

/*     for pure air */

	} else {
	    phi = 1.;
	    friction_coefficient__(&l, &d__, &ks, &reynolds, &form_fact__, &
		    lambda);
	}

	pt2zpt1_crit__(&pt2, &pt1, &tt1, &lambda, &kappa, r__, &l, &d__, &
		pt2zpt1_c__, &qred1_crit__, &crit, &icase, &m1_c__);

/*     definition of the coefficients */

	m1 = sqrt(2 / km1 * (tt1 / t1 - 1));
	if (crit) {
	    if (icase == 0) {
		m2 = 1.;
		t2 = tt2 * 2. / kp1;
	    } else {
		m2 = 1. / sqrt(kappa);
		tt2 = t2 * (km1d2k + 1.);
	    }
	} else {
	    if (icase == 0) {
		ts_calc__(xflow, &tt2, &pt2, &kappa, r__, &a, &t2, &icase);
	    } else {
		tt2 = v[*node2 * v_dim1] - physcon[1];
		tt_calc__(xflow, &tt2, &pt2, &kappa, r__, &a, &t2, &icase);
	    }
	    m2 = sqrt(2 / km1 * (tt2 / t2 - 1));
	}

	s_wsle(&io___62);
	do_lio(&c__9, &c__1, "", (ftnlen)0);
	e_wsle();
	s_wsfe(&io___63);
	do_fio(&c__1, " from node ", (ftnlen)11);
	do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	do_fio(&c__1, " to node ", (ftnlen)9);
	do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	do_fio(&c__1, ":   air massflow rate = ", (ftnlen)24);
	do_fio(&c__1, (char *)&(*xflow), (ftnlen)sizeof(doublereal));
	do_fio(&c__1, " , oil massflow rate = ", (ftnlen)23);
	do_fio(&c__1, (char *)&xflow_oil__, (ftnlen)sizeof(doublereal));
	e_wsfe();

	if (inv == 1) {
	    s_wsfe(&io___64);
	    do_fio(&c__1, "       Inlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	    do_fio(&c__1, " :    Tt1 = ", (ftnlen)12);
	    do_fio(&c__1, (char *)&tt1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , Ts1 = ", (ftnlen)9);
	    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Pt1 = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&pt1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , M1 = ", (ftnlen)8);
	    do_fio(&c__1, (char *)&m1, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	    s_wsle(&io___65);
	    do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
	    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(integer));
	    do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
	    e_wsle();
	    s_wsfe(&io___66);
	    do_fio(&c__1, "             dvi = ", (ftnlen)19);
	    do_fio(&c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , Re = ", (ftnlen)8);
	    do_fio(&c__1, (char *)&reynolds, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	    s_wsfe(&io___67);
	    do_fio(&c__1, "             PHI = ", (ftnlen)19);
	    do_fio(&c__1, (char *)&phi, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , LAMBDA = ", (ftnlen)12);
	    do_fio(&c__1, (char *)&lambda, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", LAMBDA*l/d = ", (ftnlen)15);
	    d__1 = lambda * l / d__;
	    do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , ZETA_PHI = ", (ftnlen)14);
	    d__2 = phi * lambda * l / d__;
	    do_fio(&c__1, (char *)&d__2, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	    s_wsfe(&io___68);
	    do_fio(&c__1, "      Outlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	    do_fio(&c__1, " :    Tt2 = ", (ftnlen)12);
	    do_fio(&c__1, (char *)&tt2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , Ts2 = ", (ftnlen)9);
	    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Pt2 = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&pt2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , M2 = ", (ftnlen)8);
	    do_fio(&c__1, (char *)&m2, (ftnlen)sizeof(doublereal));
	    e_wsfe();

	} else if (inv == -1) {
	    s_wsfe(&io___69);
	    do_fio(&c__1, "       Inlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	    do_fio(&c__1, ":    Tt1= ", (ftnlen)10);
	    do_fio(&c__1, (char *)&tt1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , Ts1= ", (ftnlen)8);
	    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , Pt1= ", (ftnlen)8);
	    do_fio(&c__1, (char *)&pt1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , M1= ", (ftnlen)7);
	    do_fio(&c__1, (char *)&m1, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	    s_wsle(&io___70);
	    do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
	    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(integer));
	    do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
	    e_wsle();
	    s_wsfe(&io___71);
	    do_fio(&c__1, "             dvi = ", (ftnlen)19);
	    do_fio(&c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , Re = ", (ftnlen)8);
	    do_fio(&c__1, (char *)&reynolds, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	    s_wsfe(&io___72);
	    do_fio(&c__1, "             PHI = ", (ftnlen)19);
	    do_fio(&c__1, (char *)&phi, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , LAMBDA = ", (ftnlen)12);
	    do_fio(&c__1, (char *)&lambda, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", LAMBDA*l/d = ", (ftnlen)15);
	    d__1 = lambda * l / d__;
	    do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , ZETA_PHI = ", (ftnlen)14);
	    d__2 = phi * lambda * l / d__;
	    do_fio(&c__1, (char *)&d__2, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	    s_wsfe(&io___73);
	    do_fio(&c__1, "      Outlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	    do_fio(&c__1, " :    Tt2 = ", (ftnlen)12);
	    do_fio(&c__1, (char *)&tt2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , Ts2 = ", (ftnlen)9);
	    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Pt2 =", (ftnlen)9);
	    do_fio(&c__1, (char *)&pt2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , M2 = ", (ftnlen)8);
	    do_fio(&c__1, (char *)&m2, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	}
    }


    *xflow /= *iaxial;
    df[3] *= *iaxial;

    return 0;
} /* gaspipe_fanno__ */

