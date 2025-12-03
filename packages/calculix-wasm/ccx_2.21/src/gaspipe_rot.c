/* gaspipe_rot.f -- translated by f2c (version 20200916).
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
static integer c__8 = 8;
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

/* Subroutine */ int gaspipe_rot__(integer *node1, integer *node2, integer *
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
    doublereal d__1, d__2, d__3, d__4, d__5;

    /* Builtin functions */
    double atan(doublereal), sqrt(doublereal);
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);
    double pow_dd(doublereal *, doublereal *), log(doublereal);
    integer s_wsfe(cilist *), do_fio(integer *, char *, ftnlen), e_wsfe(void);

    /* Local variables */
    doublereal pt2zpt1_c__, reynolds, a, d__, form_fact__, a1, a2, d1, d2, m1,
	     m2, r1, r2, t1, t2, z1, z2, bb, cc, qred1_crit__, qred2_crit__, 
	    pi, za, zb, zc, ks, xl, ee1, ee2, km1, kp1, om2, pt1, pt2, tt1, 
	    tt2;
    extern /* Subroutine */ int pt2zpt1_rot__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, logical *,
	     integer *, doublereal *, doublereal *, doublereal *, doublereal *
	    , doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *);
    doublereal phi;
    integer ith;
    doublereal rho;
    integer inv;
    doublereal m1_c__, m2_c__, beta, coef, km1d2, qred;
    logical crit;
    doublereal term;
    extern /* Subroutine */ int exit_(integer *);
    doublereal dfdm1, dfdm2, kdkm1, kdkp1, qred1, qred2;
    extern /* Subroutine */ int friction_coefficient__(doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *);
    integer icase;
    doublereal alpha, omega, kappa;
    integer index;
    doublereal lambda, pt2zpt1;
    extern /* Subroutine */ int ts_calc__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *);

    /* Fortran I/O blocks */
    static cilist io___22 = { 0, 6, 0, 0, 0 };
    static cilist io___23 = { 0, 6, 0, 0, 0 };
    static cilist io___24 = { 0, 6, 0, 0, 0 };
    static cilist io___34 = { 0, 6, 0, 0, 0 };
    static cilist io___35 = { 0, 6, 0, 0, 0 };
    static cilist io___36 = { 0, 6, 0, 0, 0 };
    static cilist io___37 = { 0, 6, 0, 0, 0 };
    static cilist io___38 = { 0, 6, 0, 0, 0 };
    static cilist io___57 = { 0, 6, 0, 0, 0 };
    static cilist io___59 = { 0, 6, 0, 0, 0 };
    static cilist io___60 = { 0, 6, 0, 0, 0 };
    static cilist io___61 = { 0, 6, 0, 0, 0 };
    static cilist io___62 = { 0, 6, 0, 0, 0 };
    static cilist io___63 = { 0, 6, 0, 0, 0 };
    static cilist io___64 = { 0, 6, 0, 0, 0 };
    static cilist io___65 = { 0, 6, 0, 0, 0 };
    static cilist io___66 = { 0, 6, 0, 0, 0 };
    static cilist io___67 = { 0, 6, 0, 0, 0 };
    static cilist io___68 = { 0, 6, 0, 0, 0 };
    static cilist io___69 = { 0, 6, 0, 0, 0 };
    static cilist io___70 = { 0, 6, 0, 0, 0 };
    static cilist io___71 = { 0, 6, 0, 0, 0 };
    static cilist io___72 = { 0, 6, 0, 0, 0 };
    static cilist io___73 = { 0, 6, 0, 0, 0 };
    static cilist io___75 = { 0, 6, 0, 0, 0 };
    static cilist io___76 = { 0, 6, 0, 0, 0 };
    static cilist io___77 = { 0, 6, 0, 0, 0 };
    static cilist io___88 = { 0, 6, 0, 0, 0 };
    static cilist io___89 = { 0, 6, 0, 0, 0 };
    static cilist io___90 = { 0, 6, 0, 0, 0 };
    static cilist io___92 = { 0, 1, 0, 0, 0 };
    static cilist io___93 = { 0, 1, 0, fmt_55, 0 };
    static cilist io___94 = { 0, 1, 0, fmt_53, 0 };
    static cilist io___95 = { 0, 1, 0, 0, 0 };
    static cilist io___96 = { 0, 1, 0, fmt_57, 0 };
    static cilist io___97 = { 0, 1, 0, fmt_58, 0 };
    static cilist io___98 = { 0, 1, 0, fmt_53, 0 };
    static cilist io___99 = { 0, 1, 0, fmt_53, 0 };
    static cilist io___100 = { 0, 1, 0, 0, 0 };
    static cilist io___101 = { 0, 1, 0, fmt_57, 0 };
    static cilist io___102 = { 0, 1, 0, fmt_58, 0 };
    static cilist io___103 = { 0, 1, 0, fmt_53, 0 };



/*     rotating pipe with friction and variable cross section */





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
    ith = 0;

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

	index = ielprop[*nelem];
	kappa = *cp / (*cp - *r__);

	a1 = prop[index + 1];
	a2 = prop[index + 2];
	xl = prop[index + 3];
	ks = prop[index + 4];
	form_fact__ = prop[index + 5];
	d1 = prop[index + 6];
	if (form_fact__ == 1.) {
	    d1 = sqrt(a1 / pi) * 2.;
	}
	d2 = prop[index + 7];
	if (form_fact__ == 1.) {
	    d2 = sqrt(a2 / pi) * 2.;
	}
	r1 = prop[index + 8];
	r2 = prop[index + 9];
	omega = prop[index + 10];

	pt1 = v[*node1 * v_dim1 + 2];
	pt2 = v[*node2 * v_dim1 + 2];

	tt1 = v[*node1 * v_dim1] - physcon[1];
	tt2 = v[*node2 * v_dim1] - physcon[1];

	a = (a1 + a2) / 2.;
	d__ = (d1 + d2) / 2.;
	if (r2 >= r1) {
/* Computing 2nd power */
	    d__1 = omega;
	    om2 = d__1 * d__1;
	} else {
/* Computing 2nd power */
	    d__1 = omega;
	    om2 = -(d__1 * d__1);
	}

/*        calculation of the dynamic viscosity */

	if (abs(*dvi) < 1e-30) {
	    s_wsle(&io___22);
	    do_lio(&c__9, &c__1, "*ERROR in gaspipe_fanno: ", (ftnlen)25);
	    e_wsle();
	    s_wsle(&io___23);
	    do_lio(&c__9, &c__1, "       no dynamic viscosity defined", (
		    ftnlen)35);
	    e_wsle();
	    s_wsle(&io___24);
	    do_lio(&c__9, &c__1, "       dvi= ", (ftnlen)12);
	    do_lio(&c__5, &c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    e_wsle();
	    exit_(&c__201);
	}

/*        assumed value for the reynolds number */

	reynolds = 3e3f;

	friction_coefficient__(&xl, &d__, &ks, &reynolds, &form_fact__, &
		lambda);

/*        estimate of the flow using the incompressible relationships */
/*        for a gas pipe */

/*        mean density */

	rho = (pt1 / (*r__ * tt1) + pt2 / (*r__ * tt2)) / 2.;
/* Computing 2nd power */
	d__1 = rho;
/* Computing 2nd power */
	d__2 = r2;
/* Computing 2nd power */
	d__3 = r1;
	term = (rho * (pt1 - pt2) + d__1 * d__1 * om2 * (d__2 * d__2 - d__3 * 
		d__3) / 2.) * 2. * d__ / (lambda * xl);

	if (term >= 0.) {
	    inv = 1;
	    if (v[*nodem * v_dim1 + 1] <= 0.) {
		*xflow = a * sqrt(term);
	    } else {
		*xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    }
	} else {

/*           if the term underneath the square root is negative, */
/*           lambda must have a negative sign, which means that the flow */
/*           direction has to be reversed */

	    inv = -1;
	    lambda = -lambda;
	    if (v[*nodem * v_dim1 + 1] >= 0.) {
		*xflow = -a * sqrt(-term);
	    } else {
		*xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    }
	}

	kp1 = kappa + 1.;
	km1 = kappa - 1.;
	km1d2 = km1 / 2.;

/*        check whether the flow does not exceed the critical one */

	alpha = (d2 - d1) * -4. / (xl * d__) - (r1 + r2) * om2 * kp1 / (*cp * 
		(tt1 + tt2) * km1);
	if (alpha == 0.) {
	    s_wsle(&io___34);
	    do_lio(&c__9, &c__1, "*ERROR in gaspipe_rot: looks like the", (
		    ftnlen)37);
	    e_wsle();
	    s_wsle(&io___35);
	    do_lio(&c__9, &c__1, "       cross section is constant and", (
		    ftnlen)36);
	    e_wsle();
	    s_wsle(&io___36);
	    do_lio(&c__9, &c__1, "       the rotational speed is zero;", (
		    ftnlen)36);
	    e_wsle();
	    s_wsle(&io___37);
	    do_lio(&c__9, &c__1, "       please use the gaspipe_fanno", (
		    ftnlen)35);
	    e_wsle();
	    s_wsle(&io___38);
	    do_lio(&c__9, &c__1, "       element instead", (ftnlen)22);
	    e_wsle();
	    exit_(&c__201);
	}
	beta = lambda * kappa / d__;

/*        for subsonic flow: */
/*        coef>0.d0 means that the Mach number increases from 1 to 2 */
/*           (i.e. sonic conditions can only occur at 2) */
/*        coef<0.d0 means that the Mach number decreases from 1 to 2 */
/*           (i.e. sonic conditions can only occur at 1) */

	ts_calc__(xflow, &tt1, &pt1, &kappa, r__, &a1, &t1, &ith);
	m1 = sqrt((tt1 / t1 - 1.) / km1d2);
	ts_calc__(xflow, &tt2, &pt2, &kappa, r__, &a2, &t2, &ith);
	m2 = sqrt((tt2 / t2 - 1.) / km1d2);
/* Computing 2nd power */
	d__1 = (m1 + m2) / 2.;
	coef = alpha + beta * (d__1 * d__1);

/*        icase tells where sonic conditions can occur, if any. */

	if (coef >= 0.) {
	    icase = 2;
	} else {
	    icase = 1;
	}

	za = 1. / alpha;
	zb = (alpha + beta) * beta / (alpha * (alpha * km1d2 - beta));
	zc = kp1 * km1d2 / (beta * 2. - alpha * km1);

	if (omega == 0.) {
	    pt2zpt1_rot__(&pt2, &pt1, &kappa, r__, &xl, &pt2zpt1_c__, &crit, &
		    icase, &m1_c__, &m2_c__, &za, &zb, &zc, &alpha, &beta, &
		    qred1_crit__, &qred2_crit__, &a1, &a2);
	} else {
	    crit = FALSE_;
	}

/*        check for critical flow only in the absence of rotational */
/*        speed */

	if (icase == 1 && omega == 0.) {
/*         if(icase.eq.1) then */

/*           decreasing Mach number from 1 to 2 */

	    qred2 = abs(*xflow) * sqrt(tt2) / (a2 * pt2);

/*           check whether flow is critical */
/*           assigning the physcical correct sign to xflow */

	    if (crit) {

/*              the flow is set to half the critical value or */
/*              one of the pressures is adapted (depending on */
/*              which variable is unknown) */

		*xflow = inv * .5 * qred2_crit__ * pt2 * a2 / sqrt(tt2);
	    } else if (qred > qred2_crit__) {

/*              the flow is set to half the critical value */

		*xflow = inv * .5 * qred2_crit__ * pt2 * a2 / sqrt(tt2);
	    }
	} else {

/*           increasing Mach number from 1 to 2 */

	    qred = abs(*xflow) * sqrt(tt1) / (a1 * pt1);
	    if (crit) {

/*              the flow is set to half the critical value or */
/*              one of the pressures is adapted (depending on */
/*              which variable is unknown) */

		*xflow = inv * .5 * qred1_crit__ * pt1 * a1 / sqrt(tt1);
	    } else if (qred > qred1_crit__) {

/*              the flow is set to half the critical value */

		*xflow = inv * .5 * qred1_crit__ * pt1 * a1 / sqrt(tt1);
	    }
	}

    } else if (*kflag == 2) {

	*numf = 5;

	pi = atan(1.) * 4.;

	index = ielprop[*nelem];
	kappa = *cp / (*cp - *r__);

	a1 = prop[index + 1];
	a2 = prop[index + 2];
	xl = prop[index + 3];
	ks = prop[index + 4];
	form_fact__ = prop[index + 5];
	d1 = prop[index + 6];
	if (form_fact__ == 1.) {
	    d1 = sqrt(a1 / pi) * 2.;
	}
	d2 = prop[index + 7];
	if (form_fact__ == 1.) {
	    d2 = sqrt(a2 / pi) * 2.;
	}
	r1 = prop[index + 8];
	r2 = prop[index + 9];
	omega = prop[index + 10];

	pt1 = v[*node1 * v_dim1 + 2];
	pt2 = v[*node2 * v_dim1 + 2];

	tt1 = v[*node1 * v_dim1] - physcon[1];
	tt2 = v[*node2 * v_dim1] - physcon[1];

	*xflow = v[*nodem * v_dim1 + 1] * *iaxial;

	s_wsle(&io___57);
	do_lio(&c__9, &c__1, "gaspipe_rot pt..: ", (ftnlen)18);
	do_lio(&c__5, &c__1, (char *)&pt1, (ftnlen)sizeof(doublereal));
	do_lio(&c__5, &c__1, (char *)&pt2, (ftnlen)sizeof(doublereal));
	do_lio(&c__5, &c__1, (char *)&(*xflow), (ftnlen)sizeof(doublereal));
	do_lio(&c__5, &c__1, (char *)&tt1, (ftnlen)sizeof(doublereal));
	do_lio(&c__5, &c__1, (char *)&tt2, (ftnlen)sizeof(doublereal));
	e_wsle();

	idirf[1] = 2;
	idirf[2] = 0;
	idirf[3] = 1;
	idirf[4] = 2;
	idirf[5] = 0;

	nodef[1] = *node1;
	nodef[2] = *node1;
	nodef[3] = *nodem;
	nodef[4] = *node2;
	nodef[5] = *node2;

	pt2zpt1 = pt2 / pt1;

	a = (a1 + a2) / 2.;
	d__ = (d1 + d2) / 2.;
	if (r2 >= r1) {
/* Computing 2nd power */
	    d__1 = omega;
	    om2 = d__1 * d__1;
	} else {
/* Computing 2nd power */
	    d__1 = omega;
	    om2 = -(d__1 * d__1);
	}

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

/*        calculation of the friction coefficient */

	friction_coefficient__(&xl, &d__, &ks, &reynolds, &form_fact__, &
		lambda);

	if (*xflow < 0.) {
	    lambda = -lambda;
	    inv = -1;
	} else {
	    inv = 1;
	}

	kp1 = kappa + 1.;
	km1 = kappa - 1.;
	km1d2 = km1 / 2.;

	alpha = (d2 - d1) * -4. / (xl * d__) - (r1 + r2) * om2 * kp1 / (*cp * 
		(tt1 + tt2) * km1);
	if (alpha == 0.) {
	    s_wsle(&io___62);
	    do_lio(&c__9, &c__1, "*ERROR in gaspipe_rot: looks like the", (
		    ftnlen)37);
	    e_wsle();
	    s_wsle(&io___63);
	    do_lio(&c__9, &c__1, "       cross section is constant and", (
		    ftnlen)36);
	    e_wsle();
	    s_wsle(&io___64);
	    do_lio(&c__9, &c__1, "       the rotational speed is zero;", (
		    ftnlen)36);
	    e_wsle();
	    s_wsle(&io___65);
	    do_lio(&c__9, &c__1, "       please use the gaspipe_fanno", (
		    ftnlen)35);
	    e_wsle();
	    s_wsle(&io___66);
	    do_lio(&c__9, &c__1, "       element instead", (ftnlen)22);
	    e_wsle();
	    exit_(&c__201);
	}
	beta = lambda * kappa / d__;

/*        for subsonic flow: */
/*        coef>0.d0 means that the Mach number increases from 1 to 2 */
/*           (i.e. sonic conditions can only occur at 2) */
/*        coef<0.d0 means that the Mach number decreases from 1 to 2 */
/*           (i.e. sonic conditions can only occur at 1) */

	ts_calc__(xflow, &tt1, &pt1, &kappa, r__, &a1, &t1, &ith);
	m1 = sqrt((tt1 / t1 - 1.) / km1d2);
	ts_calc__(xflow, &tt2, &pt2, &kappa, r__, &a2, &t2, &ith);
	m2 = sqrt((tt2 / t2 - 1.) / km1d2);
/* Computing 2nd power */
	d__1 = (m1 + m2) / 2.;
	coef = alpha + beta * (d__1 * d__1);
	s_wsle(&io___67);
	do_lio(&c__9, &c__1, "gaspipe_rot M1,M2", (ftnlen)17);
	do_lio(&c__5, &c__1, (char *)&m1, (ftnlen)sizeof(doublereal));
	do_lio(&c__5, &c__1, (char *)&m2, (ftnlen)sizeof(doublereal));
	e_wsle();

/*        icase tells where sonic conditions can occur, if any. */

	if (coef >= 0.) {
	    icase = 2;
	} else {
	    icase = 1;
	}

	za = 1. / alpha;
	zb = (alpha + beta) * beta / (alpha * (alpha * km1d2 - beta));
	zc = kp1 * km1d2 / (beta * 2. - alpha * km1);
	s_wsle(&io___68);
	do_lio(&c__9, &c__1, "gaspipe_rot alpha beta", (ftnlen)22);
	do_lio(&c__5, &c__1, (char *)&alpha, (ftnlen)sizeof(doublereal));
	do_lio(&c__5, &c__1, (char *)&beta, (ftnlen)sizeof(doublereal));
	e_wsle();
	s_wsle(&io___69);
	do_lio(&c__9, &c__1, "za zb zc", (ftnlen)8);
	do_lio(&c__5, &c__1, (char *)&za, (ftnlen)sizeof(doublereal));
	do_lio(&c__5, &c__1, (char *)&zb, (ftnlen)sizeof(doublereal));
	do_lio(&c__5, &c__1, (char *)&zc, (ftnlen)sizeof(doublereal));
	e_wsle();

	if (omega == 0.) {
	    pt2zpt1_rot__(&pt2, &pt1, &kappa, r__, &xl, &pt2zpt1_c__, &crit, &
		    icase, &m1_c__, &m2_c__, &za, &zb, &zc, &alpha, &beta, &
		    qred1_crit__, &qred2_crit__, &a1, &a2);
	} else {
	    crit = FALSE_;
	}
	s_wsle(&io___70);
	do_lio(&c__9, &c__1, "gaspipe_rot crit ", (ftnlen)17);
	do_lio(&c__8, &c__1, (char *)&crit, (ftnlen)sizeof(logical));
	e_wsle();

/*        check for critical flow only in the absence of rotational */
/*        speed */

	if (icase == 1 && omega == 0.) {

/*           decreasing Mach number from 1 to 2 */

	    qred2 = abs(*xflow) * sqrt(tt2) / (a2 * pt2);

/*           check whether flow is critical */
/*           assigning the physcical correct sign to xflow */

	    if (crit) {
		s_wsle(&io___71);
		do_lio(&c__9, &c__1, "*WARNING in gaspipe_rot", (ftnlen)23);
		e_wsle();
		s_wsle(&io___72);
		do_lio(&c__9, &c__1, "         critical conditions detected", 
			(ftnlen)37);
		e_wsle();
		s_wsle(&io___73);
		do_lio(&c__9, &c__1, "         in element ", (ftnlen)20);
		do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			integer));
		e_wsle();
		*xflow = inv * qred2_crit__ * a2 * pt2 / sqrt(tt2);

/*              check whether flow has changed; if so, update v */
/*              for consistency */

		if ((d__1 = (*xflow - *iaxial * v[*nodem * v_dim1 + 1]) / *
			xflow, abs(d__1)) > 1e-5) {
		    *iplausi = 0;
/*                  if(nactdog(1,nodem).ne.0) v(1,nodem)=xflow/iaxial */
		}
		m2 = sqrt((tt2 / t2 - 1.) / km1d2);
		m2 = min(m2,.999);
		if ((alpha + beta * m2 * m2) / (alpha + beta) < 0.) {
		    m2 = m2_c__;
		}

/*                 recalculate M1 */

		ts_calc__(xflow, &tt1, &pt1, &kappa, r__, &a1, &t1, &ith);
		m1 = sqrt((tt1 / t1 - 1.) / km1d2);
	    } else {
		if (qred2 > qred2_crit__) {
		    *xflow = inv * qred2_crit__ * a2 * pt2 / sqrt(tt2);

/*                 check whether flow has changed; if so, update v */
/*                 for consistency */

		    if ((d__1 = (*xflow - *iaxial * v[*nodem * v_dim1 + 1]) / 
			    *xflow, abs(d__1)) > 1e-5) {
			*iplausi = 0;
			if (nactdog[(*nodem << 2) + 1] != 0) {
			    v[*nodem * v_dim1 + 1] = *xflow / *iaxial;
			}
		    }

		    m2 = m2_c__;

/*                 recalculate M1 */

		    ts_calc__(xflow, &tt1, &pt1, &kappa, r__, &a1, &t1, &ith);
		    m1 = sqrt((tt1 / t1 - 1.) / km1d2);
/*               else */
/*                  call ts_calc(xflow,Tt2,pt2,kappa,r,A2,T2,ith) */
/*                  M2=dsqrt(((Tt2/T2)-1.d0)/km1d2) */
		}

/*               Tt1=Tt2 */
/*               call ts_calc(xflow,Tt1,pt1,kappa,r,A1,T1,ith) */
/*               M1=dsqrt(((Tt1/T1)-1.d0)/km1d2) */
	    }
	} else if (icase == 2 && omega == 0.) {

/*           increasing Mach number from 1 to 2 */

	    qred1 = abs(*xflow) * sqrt(tt1) / (a1 * pt1);

/*           check whether flow is critical */
/*           assigning the physcical correct sign to xflow */

	    if (crit) {
		s_wsle(&io___75);
		do_lio(&c__9, &c__1, "*WARNING in gaspipe_rot", (ftnlen)23);
		e_wsle();
		s_wsle(&io___76);
		do_lio(&c__9, &c__1, "         critical conditions detected", 
			(ftnlen)37);
		e_wsle();
		s_wsle(&io___77);
		do_lio(&c__9, &c__1, "         in element ", (ftnlen)20);
		do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			integer));
		e_wsle();
		*xflow = inv * qred1_crit__ * a1 * pt1 / sqrt(tt1);

/*              check whether flow has changed; if so, update v */
/*              for consistency */

		if ((d__1 = (*xflow - *iaxial * v[*nodem * v_dim1 + 1]) / *
			xflow, abs(d__1)) > 1e-5) {
		    *iplausi = 0;
/*                  if(nactdog(1,nodem).ne.0) v(1,nodem)=xflow/iaxial */
		}

		m1 = sqrt((tt1 / t1 - 1.) / km1d2);
		m1 = min(m1,.999);
		if ((alpha + beta) / (alpha + beta * m1 * m1) < 0.) {
		    m1 = m1_c__;
		}

/*                 recalculate M2 */

		ts_calc__(xflow, &tt2, &pt2, &kappa, r__, &a2, &t2, &ith);
		m2 = sqrt((tt2 / t2 - 1.) / km1d2);
	    } else {
		if (qred1 > qred1_crit__) {
		    *xflow = inv * qred1_crit__ * a1 * pt1 / sqrt(tt1);

/*                 check whether flow has changed; if so, update v */
/*                 for consistency */

		    if ((d__1 = (*xflow - *iaxial * v[*nodem * v_dim1 + 1]) / 
			    *xflow, abs(d__1)) > 1e-5) {
			*iplausi = 0;
			if (nactdog[(*nodem << 2) + 1] != 0) {
			    v[*nodem * v_dim1 + 1] = *xflow / *iaxial;
			}
		    }

		    m1 = m1_c__;

/*                 recalculate M2 */

		    ts_calc__(xflow, &tt2, &pt2, &kappa, r__, &a2, &t2, &ith);
		    m2 = sqrt((tt2 / t2 - 1.) / km1d2);
/*               else */
/*                  call ts_calc(xflow,Tt1,pt1,kappa,r,A1,T1,ith) */
/*                  M1=dsqrt(((Tt1/T1)-1.d0)/km1d2) */
		}

/*               Tt2=Tt1 */
		ts_calc__(xflow, &tt2, &pt2, &kappa, r__, &a2, &t2, &ith);
		m2 = sqrt((tt2 / t2 - 1.) / km1d2);
	    }
/*         elseif(icase.eq.1) then */
/*         else */
	}

	bb = km1d2;
	cc = -kp1 / (km1 * 2.);

/*     definition of the coefficients */

	if (icase == 1) {

/*           decreasing Mach number from 1 to 2 */

/* Computing 2nd power */
	    d__1 = m2;
	    z2 = d__1 * d__1;
	    ee2 = m2 * (bb * z2 + 1.) / (bb * z2 * (cc * 2. + 1.) + 1.);
	    dfdm2 = m2 * 2. * (za / z2 + zb / (alpha + beta * z2) + zc / (
		    km1d2 * z2 + 1.));

	    if (! crit) {

/*              residual */

/* Computing 2nd power */
		d__1 = m1;
		z1 = d__1 * d__1;
		ee1 = m1 * (bb * z1 + 1.) / (bb * z1 * (cc * 2. + 1.) + 1.);
		dfdm1 = m1 * -2. * (za / z1 + zb / (alpha + beta * z1) + zc / 
			(km1d2 * z1 + 1.));

		d__1 = z2 / z1;
		d__2 = (alpha + beta * z2) / (alpha + beta * z1);
		d__3 = zb / beta;
		d__4 = (km1d2 * z2 + 1.) / (km1d2 * z1 + 1.);
		d__5 = zc / km1d2;
		*f = log(pow_dd(&d__1, &za) * pow_dd(&d__2, &d__3) * pow_dd(&
			d__4, &d__5)) - xl;

/*              pressure node1 */

		df[1] = -dfdm1 * ee1 / pt1;

/*              temperature node1 */

		df[2] = dfdm1 * ee1 / (tt1 * 2.);

/*              mass flow */

		df[3] = (dfdm1 * ee1 + dfdm2 * ee2) / *xflow;

/*              pressure node2 */

		df[4] = -dfdm2 * ee2 / pt2;

/*              temperature node2 */

		df[5] = dfdm2 * ee2 / (tt2 * 2.);

	    } else {

		d__1 = (alpha + beta * z2) / (alpha + beta);
		d__2 = zb / beta;
		d__3 = (km1d2 * z2 + 1.) / (km1d2 + 1.);
		d__4 = zc / km1d2;
		*f = log(pow_dd(&z2, &za) * pow_dd(&d__1, &d__2) * pow_dd(&
			d__3, &d__4)) - xl;

/*              pressure node1 */

		df[1] = 0.;

/*              temperature node1 */

		df[2] = 0.;

/*              mass flow */

		df[3] = dfdm2 * ee2 / *xflow;

/*              pressure node2 */

		df[4] = -dfdm2 * ee2 / pt2;

/*              temperature node2 */

		df[5] = dfdm2 * ee2 / (tt2 * 2.);

	    }
	} else if (icase == 2) {

/*           increasing Mach number from 1 to 2 */

/* Computing 2nd power */
	    d__1 = m1;
	    z1 = d__1 * d__1;
	    ee1 = m1 * (bb * z1 + 1.) / (bb * z1 * (cc * 2. + 1.) + 1.);
	    dfdm1 = m1 * -2. * (za / z1 + zb / (alpha + beta * z1) + zc / (
		    km1d2 * z1 + 1.));

	    if (! crit) {

/*              residual */

/* Computing 2nd power */
		d__1 = m2;
		z2 = d__1 * d__1;
		ee2 = m2 * (bb * z2 + 1.) / (bb * z2 * (cc * 2. + 1.) + 1.);
		dfdm2 = m2 * 2. * (za / z2 + zb / (alpha + beta * z2) + zc / (
			km1d2 * z2 + 1.));

		d__1 = z2 / z1;
		d__2 = (alpha + beta * z2) / (alpha + beta * z1);
		d__3 = zb / beta;
		d__4 = (km1d2 * z2 + 1.) / (km1d2 * z1 + 1.);
		d__5 = zc / km1d2;
		*f = log(pow_dd(&d__1, &za) * pow_dd(&d__2, &d__3) * pow_dd(&
			d__4, &d__5)) - xl;

/*              pressure node1 */

		df[1] = -dfdm1 * ee1 / pt1;

/*              temperature node1 */

		df[2] = dfdm1 * ee1 / (tt1 * 2.);

/*              mass flow */

		df[3] = (dfdm1 * ee1 + dfdm2 * ee2) / *xflow;

/*              pressure node2 */

		df[4] = -dfdm2 * ee2 / pt2;

/*              temperature node2 */

		df[5] = dfdm2 * ee2 / (tt2 * 2.);

	    } else {

		d__1 = 1. / z1;
		d__2 = (alpha + beta) / (alpha + beta * z1);
		d__3 = zb / beta;
		d__4 = (km1d2 + 1.) / (km1d2 * z1 + 1.);
		d__5 = zc / km1d2;
		*f = log(pow_dd(&d__1, &za) * pow_dd(&d__2, &d__3) * pow_dd(&
			d__4, &d__5)) - xl;

/*              pressure node1 */

		df[1] = -dfdm1 * ee1 / pt1;

/*              temperature node1 */

		df[2] = dfdm1 * ee1 / (tt1 * 2.);

/*              mass flow */

		df[3] = dfdm1 * ee1 / *xflow;

/*              pressure node2 */

		df[4] = 0.;

/*              temperature node2 */

		df[5] = 0.;

	    }
	}

/*     output */

    } else if (*kflag == 3) {

	pi = atan(1.) * 4.;

	kappa = *cp / (*cp - *r__);
	km1 = kappa - 1.;
	km1d2 = km1 / 2.;
	kp1 = kappa + 1.;
	kdkm1 = kappa / km1;
	kdkp1 = kappa / kp1;

	index = ielprop[*nelem];
	a1 = prop[index + 1];
	a2 = prop[index + 2];
	xl = prop[index + 3];

	lambda = .5;

	ks = prop[index + 4];
	form_fact__ = prop[index + 5];
	d1 = prop[index + 6];
	if (form_fact__ == 1.) {
	    d1 = sqrt(a1 / pi) * 2.;
	}
	d2 = prop[index + 7];
	if (form_fact__ == 1.) {
	    d2 = sqrt(a2 / pi) * 2.;
	}
	r1 = prop[index + 8];
	r2 = prop[index + 9];
	omega = prop[index + 10];

	pt1 = v[*node1 * v_dim1 + 2];
	pt2 = v[*node2 * v_dim1 + 2];

	if (*xflow >= 0.) {
	    inv = 1;
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    tt1 = v[*node1 * v_dim1] - physcon[1];
	    tt2 = v[*node2 * v_dim1] - physcon[1];
	} else {
	    inv = -1;
	    pt1 = v[*node2 * v_dim1 + 2];
	    pt2 = v[*node1 * v_dim1 + 2];
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    tt1 = v[*node2 * v_dim1] - physcon[1];
	    tt2 = v[*node1 * v_dim1] - physcon[1];
	}
	ts_calc__(xflow, &tt1, &pt1, &kappa, r__, &a1, &t1, &ith);
/*         Tt2=Tt1 */
	ts_calc__(xflow, &tt2, &pt2, &kappa, r__, &a2, &t2, &ith);

	pt2zpt1 = pt2 / pt1;

	a = (a1 + a2) / 2.;
	d__ = (d1 + d2) / 2.;

/*     calculation of the dynamic viscosity */

	if (abs(*dvi) < 1e-30) {
	    s_wsle(&io___88);
	    do_lio(&c__9, &c__1, "*ERROR in gaspipe_fanno: ", (ftnlen)25);
	    e_wsle();
	    s_wsle(&io___89);
	    do_lio(&c__9, &c__1, "       no dynamic viscosity defined", (
		    ftnlen)35);
	    e_wsle();
	    s_wsle(&io___90);
	    do_lio(&c__9, &c__1, "       dvi= ", (ftnlen)12);
	    do_lio(&c__5, &c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    e_wsle();
	    exit_(&c__201);
	}

	reynolds = abs(*xflow) * d__ / (*dvi * a);

	if (reynolds < 1.) {
	    reynolds = 1.;
	}

/*     definition of the friction coefficient for pure air */

	phi = 1.;
	friction_coefficient__(&xl, &d__, &ks, &reynolds, &form_fact__, &
		lambda);

/*     definition of the coefficients */

	m1 = sqrt((tt1 / t1 - 1) / km1d2);
	m2 = sqrt((tt2 / t2 - 1) / km1d2);

	s_wsle(&io___92);
	do_lio(&c__9, &c__1, "", (ftnlen)0);
	e_wsle();
	s_wsfe(&io___93);
	do_fio(&c__1, " from node ", (ftnlen)11);
	do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	do_fio(&c__1, " to node ", (ftnlen)9);
	do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	do_fio(&c__1, ":   air massflow rate = ", (ftnlen)24);
	do_fio(&c__1, (char *)&(*xflow), (ftnlen)sizeof(doublereal));
	e_wsfe();

	if (inv == 1) {
	    s_wsfe(&io___94);
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
	    s_wsle(&io___95);
	    do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
	    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(integer));
	    do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
	    e_wsle();
	    s_wsfe(&io___96);
	    do_fio(&c__1, "             dvi = ", (ftnlen)19);
	    do_fio(&c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , Re = ", (ftnlen)8);
	    do_fio(&c__1, (char *)&reynolds, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	    s_wsfe(&io___97);
	    do_fio(&c__1, "             PHI = ", (ftnlen)19);
	    do_fio(&c__1, (char *)&phi, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , LAMBDA = ", (ftnlen)12);
	    do_fio(&c__1, (char *)&lambda, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", LAMBDA*l/d = ", (ftnlen)15);
	    d__1 = lambda * xl / d__;
	    do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , ZETA_PHI = ", (ftnlen)14);
	    d__2 = phi * lambda * xl / d__;
	    do_fio(&c__1, (char *)&d__2, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	    s_wsfe(&io___98);
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
	    s_wsfe(&io___99);
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
	    s_wsle(&io___100);
	    do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
	    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(integer));
	    do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
	    e_wsle();
	    s_wsfe(&io___101);
	    do_fio(&c__1, "             dvi = ", (ftnlen)19);
	    do_fio(&c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , Re = ", (ftnlen)8);
	    do_fio(&c__1, (char *)&reynolds, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	    s_wsfe(&io___102);
	    do_fio(&c__1, "             PHI = ", (ftnlen)19);
	    do_fio(&c__1, (char *)&phi, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , LAMBDA = ", (ftnlen)12);
	    do_fio(&c__1, (char *)&lambda, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", LAMBDA*l/d = ", (ftnlen)15);
	    d__1 = lambda * xl / d__;
	    do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , ZETA_PHI = ", (ftnlen)14);
	    d__2 = phi * lambda * xl / d__;
	    do_fio(&c__1, (char *)&d__2, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	    s_wsfe(&io___103);
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
} /* gaspipe_rot__ */

