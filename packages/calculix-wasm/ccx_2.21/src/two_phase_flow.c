/* two_phase_flow.f -- translated by f2c (version 20200916).
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
static doublereal c_b20 = .16666666666666666;
static doublereal c_b21 = .83333333333333337;
static doublereal c_b30 = .553;
static doublereal c_b31 = .111;


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

/* Subroutine */ int two_phase_flow__(doublereal *tt1, doublereal *pt1, 
	doublereal *t1, doublereal *tt2, doublereal *pt2, doublereal *t2, 
	doublereal *xflow_air__, doublereal *xflow_oil__, integer *nelem, 
	char *lakon, integer *kon, integer *ipkon, integer *ielprop, 
	doublereal *prop, doublereal *v, doublereal *dvi_air__, doublereal *
	cp, doublereal *r__, integer *k_oil__, doublereal *phi, doublereal *
	lambda, integer *nshcon, integer *nrhcon, doublereal *shcon, 
	doublereal *rhcon, integer *ntmat___, integer *mi, integer *iaxial, 
	ftnlen lakon_len)
{
    /* Initialized data */

    static doublereal tx[17] = { .01,.02,.04,.07,.1,.2,.4,.7,1.,2.,4.,7.,10.,
	    20.,40.,70.,100. };
    static doublereal tf[17] = { 1.28,1.37,1.54,1.71,1.85,2.23,2.83,3.53,4.2,
	    6.2,9.5,13.7,17.5,29.5,51.5,82.,111. };
    static integer n1 = 1;
    static integer n2 = 2;
    static integer n11 = 11;

    /* System generated locals */
    integer v_dim1, v_offset, shcon_dim2, shcon_offset, rhcon_dim2, 
	    rhcon_offset;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen), s_wsle(cilist *), do_lio(
	    integer *, integer *, char *, ftnlen), e_wsle(void);
    double atan(doublereal), sqrt(doublereal), pow_dd(doublereal *, 
	    doublereal *);

    /* Local variables */
    doublereal reynolds, a, d__, f, x;
    extern /* Subroutine */ int zeta_calc__(integer *, doublereal *, integer *
	    , char *, doublereal *, doublereal *, doublereal *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, integer *, 
	    integer *, ftnlen);
    doublereal form_fact__, a1, a2, p1, dl, ks, xp, reynolds_h__, isothermal, 
	    rad;
    integer ier;
    doublereal mpg, xpm2;
    integer kgas;
    doublereal zeta;
    extern /* Subroutine */ int friction_coefficient__(doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *);
    integer icase;
    doublereal l_neg__, dvi_h__, kappa, theta, r_oil__;
    integer index;
    doublereal rho_q__;
    integer mtlog;
    doublereal cp_oil__, zeta_h__, auxphi;
    extern /* Subroutine */ int ts_calc__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *);
    doublereal nue_air__, rho_air__, dvi_oil__, nue_oil__, rho_oil__;
    extern /* Subroutine */ int onedint_(doublereal *, doublereal *, integer *
	    , doublereal *, doublereal *, integer *, integer *, integer *, 
	    integer *);
    doublereal phizeta;
    extern /* Subroutine */ int materialdata_tg__(integer *, integer *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     doublereal *, doublereal *, integer *, doublereal *);

    /* Fortran I/O blocks */
    static cilist io___12 = { 0, 6, 0, 0, 0 };
    static cilist io___13 = { 0, 6, 0, 0, 0 };
    static cilist io___14 = { 0, 6, 0, 0, 0 };



/*    two phase flow correlations */

/*     author: Yannick Muller */




/*     note: Tt2 and T2 are used in company routines */



/*     this subroutine enables to take in account the existence of */
/*     2 phase flows (air /oil) in some flow elements. */

/*     lambda: friction coefficient solely due to air */
/*     phi: correction due to the presence of oil */
/*     (lambda_corrected=lambda*phi) */

/*     the 2 following tables are used in Lockhart Martinelli Method. */
/*     See table p.44 */

    /* Parameter adjustments */
    lakon -= 8;
    --kon;
    --ipkon;
    --ielprop;
    --prop;
    --nshcon;
    --nrhcon;
    rhcon_dim2 = *ntmat___;
    rhcon_offset = 0 + 2 * (1 + rhcon_dim2);
    rhcon -= rhcon_offset;
    shcon_dim2 = *ntmat___;
    shcon_offset = 0 + 4 * (1 + shcon_dim2);
    shcon -= shcon_offset;
    --mi;
    v_dim1 = mi[2] - 0 + 1;
    v_offset = 0 + v_dim1;
    v -= v_offset;

    /* Function Body */





    index = ielprop[(0 + (0 + (*nelem << 2))) / 4];

    if (s_cmp(lakon + ((*nelem << 3) + 1), "GAPF", (ftnlen)4, (ftnlen)4) == 0)
	     {
	a = prop[index + 1];
	d__ = prop[index + 2];
	dl = prop[index + 3];
	ks = prop[index + 4];
	form_fact__ = prop[index + 5];
    }

    if (*xflow_oil__ == 0.) {
	s_wsle(&io___12);
	do_lio(&c__9, &c__1, "*WARNING:in two_phase_flow", (ftnlen)26);
	e_wsle();
	s_wsle(&io___13);
	do_lio(&c__9, &c__1, "massflow oil for element", (ftnlen)24);
	do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(integer));
	do_lio(&c__9, &c__1, "in null", (ftnlen)7);
	e_wsle();
	s_wsle(&io___14);
	do_lio(&c__9, &c__1, "Calculation proceeds without oil correction", (
		ftnlen)43);
	e_wsle();
	*phi = 1.;
    }

    *xflow_air__ = abs(*xflow_air__);
    kappa = *cp / (*cp - *r__);

/*     First case: */
/*     the element is a restrictor of type */
/*     THICK-WALLED ORIFICE IN LARGE WALL (L/DH > 0.015) */
/*     I.E. IDL'CHIK (SECTION IV PAGE 144)! */
/*     and */
/*     Second case: */
/*     the element is a restrictor of type */
/*     SMOOTH BENDS B.H.R.A HANDBOOK (Miller) */

/*     Two phase flow correlations are taken from: */
/*     H.Zimmermann, A.Kammerer, R.Fischer and D. Rebhan */
/*     "Two phase flow correlations in Air/Oil systems of */
/*     Aero Engines." */
/*     ASME 91-GT-54 */

    if (s_cmp(lakon + ((*nelem << 3) + 1), "RELOID", (ftnlen)6, (ftnlen)6) == 
	    0 || s_cmp(lakon + ((*nelem << 3) + 1), "REBEMI", (ftnlen)6, (
	    ftnlen)6) == 0) {

	icase = 0;

	a1 = prop[index + 1];
	a2 = prop[index + 2];
	ts_calc__(xflow_air__, tt1, pt1, &kappa, r__, &a1, t1, &icase);

	d__ = sqrt(a1 * 4 / (atan(1.) * 4.));

/*     calculating the dynamic viscosity, the kinematic viscosity and */
/*     the density of air */

	kgas = 0;

	d__1 = *t1 / *tt1;
	d__2 = kappa / kappa - 1;
	p1 = *pt1 * pow_dd(&d__1, &d__2);
	rho_air__ = p1 / (*r__ * *t1);
	nue_air__ = *dvi_air__ / rho_air__;

/*     calculating the dynamic viscosity, the kinematic viscosity and */
/*     the density of oil */

	materialdata_tg__(k_oil__, ntmat___, t1, &shcon[shcon_offset], &
		nshcon[1], &cp_oil__, &r_oil__, &dvi_oil__, &rhcon[
		rhcon_offset], &nrhcon[1], &rho_oil__);

	if (*xflow_oil__ == 0.) {

/*     pure air */
	    zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &reynolds, &
		    zeta, &isothermal, &kon[1], &ipkon[1], r__, &kappa, &v[
		    v_offset], &mi[1], iaxial, (ftnlen)8);
	    *lambda = zeta;
	    return 0;
	} else {

/*     air/oil mixture for orifice or bend */
/*     For Bend see section 4.2.1 */
/*     For orifices see 4.2.3 */

	    mpg = *xflow_air__ + *xflow_oil__;
	    xp = *xflow_air__ / mpg;
	    if (mpg > *xflow_air__ * 1e10) {
		xpm2 = 1e20;
	    } else {
/* Computing 2nd power */
		d__1 = mpg / *xflow_air__;
		xpm2 = d__1 * d__1;
	    }

	    rho_q__ = rho_oil__ / rho_air__;

/*     homogene dynamic viscosity (mass flow rate averaged) */

	    dvi_h__ = dvi_oil__ * *dvi_air__ / ((dvi_oil__ - *dvi_air__) * xp 
		    + *dvi_air__);

/*     homogene reynolds number */

	    reynolds_h__ = mpg * d__ / (a1 * dvi_h__);

	    zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &
		    reynolds_h__, &zeta_h__, &isothermal, &kon[1], &ipkon[1], 
		    r__, &kappa, &v[v_offset], &mi[1], iaxial, (ftnlen)8);

/*     orifice in a wall */

	    if (s_cmp(lakon + ((*nelem << 3) + 1), "RELOID", (ftnlen)6, (
		    ftnlen)6) == 0) {
		auxphi = (xp * (pow_dd(&rho_q__, &c_b20) - 1.) + 1.) * (xp * (
			pow_dd(&rho_q__, &c_b21) - 1.) + 1.);

/*     bend */

	    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "REBEMI", (ftnlen)6,
		     (ftnlen)6) == 0) {

/*     radius of the bend */

		rad = prop[index + 4];

/*     angle of the bend */

		theta = prop[index + 5];

/* Computing 2nd power */
		d__1 = xp;
		f = (theta * 2.2 / 90. / (zeta_h__ * (rad / d__ + 2.)) + 1.) *
			 xp * (1. - xp) + d__1 * d__1;

		auxphi = (rho_q__ - 1.) * f + 1.;
	    }

	    *phi = 1 / rho_q__ * auxphi * xpm2;
	    phizeta = zeta_h__ / rho_q__ * auxphi * xpm2;
	    *lambda = zeta_h__;

	}

/*     Third case: */
/*     the element is a pipe */
/*     the zeta coefficient is corrected according to */
/*     Lockhart Martinelli Method */
/*     Reference: R.W. Lockhart and R.C. Martinelli */
/*                University of California, BErkeley, California */
/*                "Proposed correlation of data for */
/*                 isothermal two-phase two-component */
/*                 flow in pipes" */
/*                 Chemical Engineering Progress vol.45, N°1 */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "GAPF", (ftnlen)4, (ftnlen)
	    4) == 0 || s_cmp(lakon + ((*nelem << 3) + 1), "REBEMI", (ftnlen)6,
	     (ftnlen)6) != 0 && s_cmp(lakon + ((*nelem << 3) + 1), "RELOID", (
	    ftnlen)6, (ftnlen)6) != 0) {

	if (s_cmp(lakon + ((*nelem << 3) + 1), "GAPFA", (ftnlen)5, (ftnlen)5) 
		== 0) {
	    icase = 0;
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "GAPFI", (ftnlen)5, (
		ftnlen)5) == 0) {
	    icase = 1;
	} else {
	    icase = 0;
	}

	if (s_cmp(lakon + ((*nelem << 3) + 1), "RE", (ftnlen)2, (ftnlen)2) == 
		0 && s_cmp(lakon + ((*nelem << 3) + 3), "BR", (ftnlen)2, (
		ftnlen)2) != 0) {
/* Computing MIN */
	    d__1 = prop[index + 1], d__2 = prop[index + 2];
	    a = min(d__1,d__2);
	}

	ts_calc__(xflow_air__, tt1, pt1, &kappa, r__, &a, t1, &icase);

/*     calculating kinematic viscosity and density for air */

	d__1 = *t1 / *tt1;
	d__2 = kappa / kappa - 1;
	p1 = *pt1 * pow_dd(&d__1, &d__2);
	rho_air__ = p1 / (*r__ * *t1);
	nue_air__ = *dvi_air__ / rho_air__;

/*     calculation of the dynamic viscosity for oil */

	materialdata_tg__(k_oil__, ntmat___, t1, &shcon[shcon_offset], &
		nshcon[1], &cp_oil__, &r_oil__, &dvi_oil__, &rhcon[
		rhcon_offset], &nrhcon[1], &rho_oil__);

	nue_oil__ = dvi_oil__ / rho_oil__;

/*     Definition of the two phase flow modulus as defined in table 1 */

	d__2 = rho_air__ / rho_oil__;
	d__3 = nue_oil__ / nue_air__;
	x = (d__1 = *xflow_oil__ / *xflow_air__, abs(d__1)) * pow_dd(&d__2, &
		c_b30) * pow_dd(&d__3, &c_b31);

	mtlog = 17;
/*     Interpolating x in the table */
	onedint_(tx, tf, &mtlog, &x, phi, &n1, &n2, &n11, &ier);

	if (s_cmp(lakon + ((*nelem << 3) + 1), "GAP", (ftnlen)3, (ftnlen)3) ==
		 0) {

/*     Computing the friction coefficient */

	    reynolds = abs(*xflow_air__) * d__ / (*dvi_air__ * a);

	    if (reynolds < 100.) {
		reynolds = 100.;
	    }

	    friction_coefficient__(&l_neg__, &d__, &ks, &reynolds, &
		    form_fact__, lambda);
	} else {
	    *lambda = 0.;
	}
    }

    return 0;
} /* two_phase_flow__ */

