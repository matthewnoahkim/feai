/* labyrinth.f -- translated by f2c (version 20200916).
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

static doublereal c_b4 = 2.;
static integer c__9 = 9;
static integer c__1 = 1;
static integer c__5 = 5;
static integer c__201 = 201;
static doublereal c_b21 = 3.;
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

/* Subroutine */ int labyrinth_(integer *node1, integer *node2, integer *
	nodem, integer *nelem, char *lakon, integer *nactdog, logical *
	identity, integer *ielprop, doublereal *prop, integer *kflag, 
	doublereal *v, doublereal *xflow, doublereal *f, integer *nodef, 
	integer *idirf, doublereal *df, doublereal *cp, doublereal *r__, 
	doublereal *physcon, doublereal *co, doublereal *dvi, integer *numf, 
	doublereal *vold, char *set, integer *kon, integer *ipkon, integer *
	mi, doublereal *ttime, doublereal *time, integer *iaxial, integer *
	iplausi, ftnlen lakon_len, ftnlen set_len)
{
    /* Format strings */
    static char fmt_55[] = "(1x,a,i6,a,i6,a,e11.4,a,a,e11.4,a)";
    static char fmt_56[] = "(1x,a,i6,a,e11.4,a,e11.4,a,e11.4,a)";
    static char fmt_57[] = "(1x,a,e11.5,a,e11.4,a,e11.4,a,e11.4)";
    static char fmt_58[] = "(1x,a,e11.4,a,e11.4,a,e11.4)";
    static char fmt_59[] = "(1x,a,e11.4,a,e11.4,a,e11.4,a,e11.4)";
    static char fmt_60[] = "(1x,a,e11.4,a,e11.4)";

    /* System generated locals */
    integer v_dim1, v_offset, vold_dim1, vold_offset;
    doublereal d__1, d__2;

    /* Builtin functions */
    double atan(doublereal);
    integer s_cmp(char *, char *, ftnlen, ftnlen), i_dnnt(doublereal *);
    double sqrt(doublereal), pow_dd(doublereal *, doublereal *), log(
	    doublereal);
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void), s_wsfe(cilist *), do_fio(integer *, char *, ftnlen),
	     e_wsfe(void);

    /* Local variables */
    extern /* Subroutine */ int cd_bragg__(doublereal *, doublereal *, 
	    doublereal *, integer *), cd_lab_honeycomb__(doublereal *, 
	    doublereal *, doublereal *);
    doublereal reynolds, cd_1spike__, a, b, d__, e, h__;
    integer n;
    doublereal s, t, x, y, cd_radius__, c1, c2, c3, p1, p2, t1, t2;
    extern /* Subroutine */ int cd_lab_correction__(doublereal *, doublereal *
	    , doublereal *, doublereal *);
    doublereal xflow_oil__, cd, dh, pi, ca1, cb1, ca2, cb2, km1, dt1, kp1, 
	    carry_over__, bdh, dlc, rad, cdu, p2p1, p1p2, cst;
    integer inv;
    doublereal hst, num, szt, aeff;
    extern /* Subroutine */ int lab_straight_ppkrit__(integer *, doublereal *)
	    ;
    doublereal rzdh;
    extern /* Subroutine */ int exit_(integer *);
    doublereal cd_honeycomb__, kdkm1, km1dk;
    extern /* Subroutine */ int cd_lab_1spike__(doublereal *, doublereal *, 
	    doublereal *, doublereal *);
    doublereal tdkp1;
    integer nodea, nodeb;
    doublereal kappa, denom;
    integer index;
    extern /* Subroutine */ int cd_lab_radius__(doublereal *, doublereal *, 
	    doublereal *, doublereal *);
    integer itype;
    doublereal cd_correction__;
    extern /* Subroutine */ int cd_mcgreehan_schotsch__(doublereal *, 
	    doublereal *, doublereal *, doublereal *);
    doublereal cd_lab__, ppkrit, pt0zps1, alambda, cdbragg;
    extern /* Subroutine */ int cd_lab_straight__(integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *);

    /* Fortran I/O blocks */
    static cilist io___40 = { 0, 6, 0, 0, 0 };
    static cilist io___41 = { 0, 6, 0, 0, 0 };
    static cilist io___42 = { 0, 6, 0, 0, 0 };
    static cilist io___64 = { 0, 6, 0, 0, 0 };
    static cilist io___65 = { 0, 6, 0, 0, 0 };
    static cilist io___66 = { 0, 6, 0, 0, 0 };
    static cilist io___68 = { 0, 1, 0, 0, 0 };
    static cilist io___69 = { 0, 1, 0, fmt_55, 0 };
    static cilist io___70 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___71 = { 0, 1, 0, 0, 0 };
    static cilist io___72 = { 0, 1, 0, fmt_57, 0 };
    static cilist io___73 = { 0, 1, 0, fmt_58, 0 };
    static cilist io___74 = { 0, 1, 0, fmt_59, 0 };
    static cilist io___75 = { 0, 1, 0, fmt_60, 0 };
    static cilist io___76 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___77 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___78 = { 0, 1, 0, 0, 0 };
    static cilist io___79 = { 0, 1, 0, fmt_57, 0 };
    static cilist io___80 = { 0, 1, 0, fmt_58, 0 };
    static cilist io___81 = { 0, 1, 0, fmt_59, 0 };
    static cilist io___82 = { 0, 1, 0, fmt_60, 0 };
    static cilist io___83 = { 0, 1, 0, fmt_56, 0 };



/*     labyrinth element */

/*     author: Yannick Muller */







    /* Parameter adjustments */
    lakon -= 8;
    nactdog -= 4;
    --ielprop;
    --prop;
    --nodef;
    --idirf;
    --df;
    --physcon;
    co -= 4;
    set -= 81;
    --kon;
    --ipkon;
    --mi;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;
    v_dim1 = mi[2] - 0 + 1;
    v_offset = 0 + v_dim1;
    v -= v_offset;

    /* Function Body */
    itype = 1;
    pi = atan(1.) * 4.;
    e = 2.718281828459045;

    index = ielprop[*nelem];

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

	kappa = *cp / (*cp - *r__);

/*     Usual Labyrinth */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "LABF", (ftnlen)4, (ftnlen)4) 
		!= 0) {
	    t = prop[index + 1];
	    s = prop[index + 2];
	    d__ = prop[index + 4];
	    n = i_dnnt(&prop[index + 5]);
	    b = prop[index + 6];
	    h__ = prop[index + 7];
	    dlc = prop[index + 8];
	    rad = prop[index + 9];
	    x = prop[index + 10];
	    hst = prop[index + 11];

	    a = pi * d__ * s;

/*    "flexible" labyrinth for thermomechanical coupling */

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "LABF", (ftnlen)4, (
		ftnlen)4) == 0) {
	    nodea = i_dnnt(&prop[index + 1]);
	    nodeb = i_dnnt(&prop[index + 2]);
	    t = prop[index + 4];
	    d__ = prop[index + 5];
	    n = i_dnnt(&prop[index + 6]);
	    b = prop[index + 7];
	    h__ = prop[index + 8];
	    dlc = prop[index + 9];
	    rad = prop[index + 10];
	    x = prop[index + 11];
	    hst = prop[index + 12];

/*     gap definition */
/* Computing 2nd power */
	    d__1 = co[nodeb * 3 + 1] + vold[nodeb * vold_dim1 + 1] - co[nodea 
		    * 3 + 1] - vold[nodea * vold_dim1 + 1];
	    s = sqrt(d__1 * d__1);
	    a = pi * d__ * s;
	}

	p1 = v[*node1 * v_dim1 + 2];
	p2 = v[*node2 * v_dim1 + 2];
	if (p1 >= p2) {
	    inv = 1;
	    t1 = v[*node1 * v_dim1] - physcon[1];
	} else {
	    inv = -1;
	    p1 = v[*node2 * v_dim1 + 2];
	    p2 = v[*node1 * v_dim1 + 2];
	    t1 = v[*node2 * v_dim1] - physcon[1];
	}

	cd = 1.;
	aeff = a * cd;
	p2p1 = p2 / p1;

/* ************************ */
/*     one fin */
/* ************************* */
	if (n == 1) {

	    km1 = kappa - 1.;
	    kp1 = kappa + 1.;
	    kdkm1 = kappa / km1;
	    tdkp1 = 2. / kp1;
	    c2 = pow_dd(&tdkp1, &kdkm1);

/*     subcritical */

	    if (p2p1 > c2) {
		d__1 = 2. / kappa;
		d__2 = 1. / kdkm1;
		*xflow = inv * p1 * aeff * sqrt(kdkm1 * 2. * pow_dd(&p2p1, &
			d__1) * (1. - pow_dd(&p2p1, &d__2)) / *r__) / sqrt(t1)
			;

/*     critical */

	    } else {
		d__1 = kp1 / (km1 * 2.);
		*xflow = inv * p1 * aeff * sqrt(kappa / *r__) * pow_dd(&tdkp1,
			 &d__1) / sqrt(t1);
	    }
	}

/* *********************** */
/*     straight labyrinth and stepped labyrinth */
/*     method found in "Air system Correlations Part1 Labyrinth Seals" */
/*     H.Zimmermann and K.H. Wolff */
/*     ASME 98-GT-206 */
/* ********************** */

	if (n >= 2) {

	    lab_straight_ppkrit__(&n, &ppkrit);

/*     subcritical case */

	    if (p2p1 > ppkrit) {
		*xflow = inv * p1 * aeff / sqrt(t1) * sqrt((1. - pow_dd(&p2p1,
			 &c_b4)) / (*r__ * (n - log(p2p1) / log(e))));

/*     critical case */

	    } else {
		*xflow = inv * p1 * aeff / sqrt(t1) * sqrt(2. / *r__) * 
			ppkrit;
	    }
	}

    } else if (*kflag == 2) {
	*numf = 4;
	alambda = 1e4;

	p1 = v[*node1 * v_dim1 + 2];
	p2 = v[*node2 * v_dim1 + 2];
	if (p1 >= p2) {
	    inv = 1;
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    t1 = v[*node1 * v_dim1] - physcon[1];
	    t2 = v[*node2 * v_dim1] - physcon[1];
	    nodef[1] = *node1;
	    nodef[2] = *node1;
	    nodef[3] = *nodem;
	    nodef[4] = *node2;
	} else {
	    inv = -1;
	    p1 = v[*node2 * v_dim1 + 2];
	    p2 = v[*node1 * v_dim1 + 2];
	    *xflow = -v[*nodem * v_dim1 + 1] * *iaxial;
	    t1 = v[*node2 * v_dim1] - physcon[1];
	    t2 = v[*node1 * v_dim1] - physcon[1];
	    nodef[1] = *node2;
	    nodef[2] = *node2;
	    nodef[3] = *nodem;
	    nodef[4] = *node1;
	}

	idirf[1] = 2;
	idirf[2] = 0;
	idirf[3] = 1;
	idirf[4] = 2;

/*     Usual labyrinth */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "LABF", (ftnlen)4, (ftnlen)4) 
		!= 0) {
	    kappa = *cp / (*cp - *r__);
	    t = prop[index + 1];
	    s = prop[index + 2];
	    d__ = prop[index + 4];
	    n = i_dnnt(&prop[index + 5]);
	    b = prop[index + 6];
	    h__ = prop[index + 7];
	    dlc = prop[index + 8];
	    rad = prop[index + 9];
	    x = prop[index + 10];
	    hst = prop[index + 11];
	    a = pi * d__ * s;

/*     Flexible labyrinth for coupled calculations */

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "LABF", (ftnlen)4, (
		ftnlen)4) == 0) {
	    nodea = i_dnnt(&prop[index + 1]);
	    nodeb = i_dnnt(&prop[index + 2]);
/*            iaxial=nint(prop(index+3)) */
	    t = prop[index + 4];
	    d__ = prop[index + 5];
	    n = i_dnnt(&prop[index + 6]);
	    b = prop[index + 7];
	    h__ = prop[index + 8];
	    dlc = prop[index + 9];
	    rad = prop[index + 10];
	    x = prop[index + 11];
	    hst = prop[index + 12];

/*     gap definition */
/* Computing 2nd power */
	    d__1 = co[nodeb * 3 + 1] + vold[nodeb * vold_dim1 + 1] - co[nodea 
		    * 3 + 1] - vold[nodea * vold_dim1 + 1];
	    s = sqrt(d__1 * d__1);
	    a = pi * d__ * s;
	}

	p2p1 = p2 / p1;
	dt1 = sqrt(t1);

	aeff = a;

/*     honeycomb stator correction */

	cd_honeycomb__ = 1.;
	if (dlc != 0.) {
	    cd_lab_honeycomb__(&s, &dlc, &cd_honeycomb__);
	    cd_honeycomb__ = cd_honeycomb__ / 100 + 1;
	}

/*     inlet radius correction */

	cd_radius__ = 1.;
	if (rad != 0. && (doublereal) n != 1.) {
	    cd_lab_radius__(&rad, &s, &hst, &cd_radius__);
	}

/*     carry over factor (only for straight throught labyrinth) */

	if (n >= 2 && hst == 0.) {
	    cst = n / (n - 1.);
	    szt = s / t;
	    carry_over__ = cst / sqrt(cst - szt / (szt + .02));
	    aeff *= carry_over__;
	}

/*     calculation of the dynamic viscosity */

	if (abs(*dvi) < 1e-30) {
	    s_wsle(&io___40);
	    do_lio(&c__9, &c__1, "*ERROR in labyrinth: ", (ftnlen)21);
	    e_wsle();
	    s_wsle(&io___41);
	    do_lio(&c__9, &c__1, "       no dynamic viscosity defined", (
		    ftnlen)35);
	    e_wsle();
	    s_wsle(&io___42);
	    do_lio(&c__9, &c__1, "       dvi= ", (ftnlen)12);
	    do_lio(&c__5, &c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    e_wsle();
	    exit_(&c__201);
	}

/*     calculation of the number of reynolds for a gap */

	reynolds = abs(*xflow) * 2. * s / (*dvi * a * cd_honeycomb__ / 
		cd_radius__);

/* ************************************** */
/*     single fin labyrinth */
/*     the resolution procedure is the same as for the restrictor */
/* ************************************** */

	if (n == 1) {

/*     single fin labyrinth */

/*     incompressible basis cd , reynolds correction,and radius correction */

/*     "Flow Characteristics of long orifices with rotation and corner radiusing" */
/*     W.F. Mcgreehan and M.J. Schotsch */
/*     ASME 87-GT-162 */

	    dh = s * 2;
	    bdh = b / dh;
	    rzdh = rad / dh;

	    cd_mcgreehan_schotsch__(&rzdh, &bdh, &reynolds, &cdu);

/*     compressibility correction factor */

/*     S.L.Bragg */
/*     "Effect of conpressibility on the discharge coefficient of orifices and convergent nozzles" */
/*     Journal of Mechanical engineering vol 2 No 1 1960 */

	    cd_bragg__(&cdu, &p2p1, &cdbragg, &itype);
	    cd = cdbragg;
	    aeff *= cd;

	    km1 = kappa - 1.;
	    kp1 = kappa + 1.;
	    kdkm1 = kappa / km1;
	    tdkp1 = 2. / kp1;
	    c2 = pow_dd(&tdkp1, &kdkm1);

	    if (p2p1 > c2) {
		c1 = sqrt(kdkm1 * 2. / *r__) * aeff;
		km1dk = 1. / kdkm1;
		y = pow_dd(&p2p1, &km1dk);
		x = sqrt(1. - y);
		ca1 = -c1 * x / (kappa * p1 * y);
		cb1 = c1 * km1dk / (p1 * 2.);
		ca2 = -ca1 * p2p1 - *xflow * dt1 / (p1 * p1);
		cb2 = -cb1 * p2p1;
		d__1 = 1. / kappa;
		*f = *xflow * dt1 / p1 - c1 * pow_dd(&p2p1, &d__1) * x;
		if (cb2 <= -(alambda + ca2) * x) {
		    df[1] = -alambda;
		} else if (cb2 >= (alambda - ca2) * x) {
		    df[1] = alambda;
		} else {
		    df[1] = ca2 + cb2 / x;
		}
		df[2] = *xflow / (p1 * 2. * dt1);
		df[3] = inv * dt1 / p1;
		if (cb1 <= -(alambda + ca1) * x) {
		    df[4] = -alambda;
		} else if (cb1 >= (alambda - ca1) * x) {
		    df[4] = alambda;
		} else {
		    df[4] = ca1 + cb1 / x;
		}
	    } else {
		d__1 = kp1 / (km1 * 2.);
		c3 = sqrt(kappa / *r__) * pow_dd(&tdkp1, &d__1) * aeff;
		*f = *xflow * dt1 / p1 - c3;
/* Computing 2nd power */
		d__1 = p1;
		df[1] = -(*xflow) * dt1 / (d__1 * d__1);
		df[2] = *xflow / (p1 * 2 * dt1);
		df[3] = inv * dt1 / p1;
		df[4] = 0.;
	    }
	}

/* **************************************** */
/*     straight labyrinth & stepped labyrinth */
/*     method found in "Air system Correlations Part1 Labyrinth Seals" */
/*     H.Zimmermann and K.H. Wolff */
/*     ASME 98-GT-206 */
/* **************************************** */

	if (n >= 2) {
/* Computing 2nd power */
	    d__1 = p2p1;
	    num = 1. - d__1 * d__1;
	    denom = *r__ * (n - log(p2p1) / log(e));

/*     straight labyrinth */

	    if (hst == 0. && n != 1) {
		cd_lab_straight__(&n, &p2p1, &s, &b, &reynolds, &cd_lab__);
		aeff = aeff * cd_lab__ * cd_honeycomb__ * cd_radius__;

/*     Stepped Labyrinth */

	    } else {
/*     corrective term for the first spike */
		p1p2 = p1 / p2;
		d__1 = 1 / prop[index + 4];
		pt0zps1 = pow_dd(&p1p2, &d__1);
		cd_lab_1spike__(&pt0zps1, &s, &b, &cd_1spike__);

/*     corrective term for cd_lab_1spike */

		cd_lab_correction__(&p1p2, &s, &b, &cd_correction__);

/*     calculation of the discharge coefficient of the stepped labyrinth */

		cd = cd_1spike__ * cd_correction__;
		cd_lab__ = cd;

		aeff = aeff * cd_lab__ * cd_radius__ * cd_honeycomb__;
	    }

	    lab_straight_ppkrit__(&n, &ppkrit);

/*     subcritical case */

	    if (p2p1 > ppkrit) {

		*f = *xflow * dt1 / p1 - sqrt(num / denom) * aeff;

		df[1] = *xflow * dt1 / pow_dd(&p1, &c_b4) - aeff / 2. * sqrt(
			denom / num) * (pow_dd(&p2, &c_b4) / pow_dd(&p1, &
			c_b21) * 2. / denom) + num / pow_dd(&denom, &c_b4) * *
			r__ / p1;
		df[2] = *xflow / (p1 * 2. * dt1);
		df[3] = inv * dt1 / p1;
		df[4] = -aeff / 2. * sqrt(denom / num) * (p2 / pow_dd(&p1, &
			c_b4) * -2. / denom) + num / pow_dd(&denom, &c_b4) * *
			r__ / p2;

/*     critical case */

	    } else {
		c2 = sqrt(2 / *r__) * aeff * ppkrit;

		*f = *xflow * dt1 / p1 - c2;
/* Computing 2nd power */
		d__1 = p1;
		df[1] = -(*xflow) * dt1 / (d__1 * d__1);
		df[2] = *xflow / (p1 * 2. * dt1);
		df[3] = inv * dt1 / p1;
		df[4] = 0.;
	    }
	}

/*     output */

    } else if (*kflag == 3) {

	p1 = v[*node1 * v_dim1 + 2];
	p2 = v[*node2 * v_dim1 + 2];
	if (p1 >= p2) {
	    inv = 1;
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    t1 = v[*node1 * v_dim1] - physcon[1];
	    t2 = v[*node2 * v_dim1] - physcon[1];
	    nodef[1] = *node1;
	    nodef[2] = *node1;
	    nodef[3] = *nodem;
	    nodef[4] = *node2;
	} else {
	    inv = -1;
	    p1 = v[*node2 * v_dim1 + 2];
	    p2 = v[*node1 * v_dim1 + 2];
	    *xflow = -v[*nodem * v_dim1 + 1] * *iaxial;
	    t1 = v[*node2 * v_dim1] - physcon[1];
	    t2 = v[*node2 * v_dim1] - physcon[1];
	    nodef[1] = *node2;
	    nodef[2] = *node2;
	    nodef[3] = *nodem;
	    nodef[4] = *node1;
	}

	kappa = *cp / (*cp - *r__);
	t = prop[index + 1];
	s = prop[index + 2];
	d__ = prop[index + 3];
	n = i_dnnt(&prop[index + 4]);
	b = prop[index + 5];
	h__ = prop[index + 6];
	dlc = prop[index + 7];
	rad = prop[index + 8];
	x = prop[index + 9];
	hst = prop[index + 10];

	p2p1 = p2 / p1;
	dt1 = sqrt(t1);

	pi = atan(1.) * 4.;
	a = pi * d__ * s;
	aeff = a;
	e = 2.718281828459045;

/*     honeycomb stator correction */

	if (dlc != 0.) {
	    cd_lab_honeycomb__(&s, &dlc, &cd_honeycomb__);
	    aeff *= cd_honeycomb__ / 100. + 1.;
	} else {
	    cd_honeycomb__ = 0.;
	}

/*     inlet radius correction */

	if (rad != 0. && (doublereal) n != 1.) {
	    cd_lab_radius__(&rad, &s, &hst, &cd_radius__);
	    aeff *= cd_radius__;
	} else {
	    cd_radius__ = 1.;
	}

/*     carry over factor (only for straight throught labyrinth) */

	if (n > 1 && hst == 0.) {
	    cst = n / (n - 1.);
	    szt = s / t;
	    carry_over__ = cst / sqrt(cst - szt / (szt + .02));
	    aeff *= carry_over__;
	}

/*     calculation of the dynamic viscosity */

	if (abs(*dvi) < 1e-30) {
	    s_wsle(&io___64);
	    do_lio(&c__9, &c__1, "*ERROR in labyrinth: ", (ftnlen)21);
	    e_wsle();
	    s_wsle(&io___65);
	    do_lio(&c__9, &c__1, "       no dynamic viscosity defined", (
		    ftnlen)35);
	    e_wsle();
	    s_wsle(&io___66);
	    do_lio(&c__9, &c__1, "       dvi= ", (ftnlen)12);
	    do_lio(&c__5, &c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    e_wsle();
	    exit_(&c__201);
	}

/*     calculation of the number of reynolds for a gap */

	reynolds = abs(*xflow) * 2. * s / (*dvi * a);
/* ************************************** */
/*     single fin labyrinth */
/*     the resolution procedure is the same as for the restrictor */
/* ************************************** */

	if (n == 1) {

/*     single fin labyrinth */

/*     incompressible basis cd , reynolds correction,and radius correction */

/*     "Flow Characteristics of long orifices with rotation and corner radiusing" */
/*     W.F. Mcgreehan and M.J. Schotsch */
/*     ASME 87-GT-162 */

	    dh = s * 2;
	    bdh = b / dh;
	    rzdh = rad / dh;

	    cd_mcgreehan_schotsch__(&rzdh, &bdh, &reynolds, &cdu);

/*     compressibility correction factor */

/*     S.L.Bragg */
/*     "Effect of conpressibility on the discharge coefficient of orifices and convergent nozzles" */
/*     Journal of Mechanical engineering vol 2 No 1 1960 */

	    cd_bragg__(&cdu, &p2p1, &cdbragg, &itype);
	    cd = cdbragg;
	    aeff *= cd;
	}

/* **************************************** */
/*     straight labyrinth & stepped labyrinth */
/*     method found in "Air system Correlations Part1 Labyrinth Seals" */
/*     H.Zimmermann and K.H. Wolff */
/*     ASME 98-GT-206 */
/* **************************************** */

	if (n >= 2) {
/* Computing 2nd power */
	    d__1 = p2p1;
	    num = 1. - d__1 * d__1;
	    denom = *r__ * (n - log(p2p1) / log(e));

/*     straight labyrinth */

	    if (hst == 0. && n != 1) {
		cd_lab_straight__(&n, &p2p1, &s, &b, &reynolds, &cd_lab__);
		aeff = aeff * cd_lab__ * cd_honeycomb__ * cd_radius__;

/*     Stepped Labyrinth */

	    } else {
/*     corrective term for the first spike */
		p1p2 = p1 / p2;
		d__1 = 1 / prop[index + 4];
		pt0zps1 = pow_dd(&p1p2, &d__1);
		cd_lab_1spike__(&pt0zps1, &s, &b, &cd_1spike__);

/*     corrective term for cd_lab_1spike */

		cd_lab_correction__(&p1p2, &s, &b, &cd_correction__);

/*     calculation of the discharge coefficient of the stepped labyrinth */

		cd = cd_1spike__ * cd_correction__;
		cd_lab__ = cd;

		aeff = aeff * cd_lab__ * cd_radius__ * cd_honeycomb__;
	    }

	    lab_straight_ppkrit__(&n, &ppkrit);

	}

	xflow_oil__ = 0.;

	s_wsle(&io___68);
	do_lio(&c__9, &c__1, "", (ftnlen)0);
	e_wsle();
	s_wsfe(&io___69);
	do_fio(&c__1, " from node", (ftnlen)10);
	do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	do_fio(&c__1, " to node", (ftnlen)8);
	do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	do_fio(&c__1, ":   air massflow rate= ", (ftnlen)23);
	do_fio(&c__1, (char *)&(*xflow), (ftnlen)sizeof(doublereal));
	do_fio(&c__1, ", oil massflow rate= ", (ftnlen)21);
	do_fio(&c__1, (char *)&xflow_oil__, (ftnlen)sizeof(doublereal));
	e_wsfe();
	if (inv == 1) {
	    s_wsfe(&io___70);
	    do_fio(&c__1, "       Inlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	    do_fio(&c__1, ":   Tt1=", (ftnlen)8);
	    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", Ts1=", (ftnlen)6);
	    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", Pt1=", (ftnlen)6);
	    do_fio(&c__1, (char *)&p1, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	    s_wsle(&io___71);
	    do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
	    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(integer));
	    do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
	    e_wsle();
	    s_wsfe(&io___72);
	    do_fio(&c__1, "             dyn.visc.= ", (ftnlen)24);
	    do_fio(&c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", Re= ", (ftnlen)6);
	    do_fio(&c__1, (char *)&reynolds, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", Cd_radius= ", (ftnlen)13);
	    do_fio(&c__1, (char *)&cd_radius__, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", Cd_honeycomb= ", (ftnlen)16);
	    d__1 = cd_honeycomb__ / 100 + 1;
	    do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
	    e_wsfe();

/*     straight labyrinth */
	    if (hst == 0. && n != 1) {
		s_wsfe(&io___73);
		do_fio(&c__1, "             COF= ", (ftnlen)18);
		do_fio(&c__1, (char *)&carry_over__, (ftnlen)sizeof(
			doublereal));
		do_fio(&c__1, ", Cd_lab= ", (ftnlen)10);
		do_fio(&c__1, (char *)&cd_lab__, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, ", Cd= ", (ftnlen)6);
		d__1 = carry_over__ * cd_lab__;
		do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
		e_wsfe();
/*     stepped labyrinth */
	    } else if (hst != 0.) {
		s_wsfe(&io___74);
		do_fio(&c__1, "             Cd_1_fin= ", (ftnlen)23);
		do_fio(&c__1, (char *)&cd_1spike__, (ftnlen)sizeof(doublereal)
			);
		do_fio(&c__1, ", Cd= ", (ftnlen)6);
		do_fio(&c__1, (char *)&cd, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, ", pt0/ps1= ", (ftnlen)11);
		do_fio(&c__1, (char *)&pt0zps1, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, ", p0/pn= ", (ftnlen)9);
		d__1 = p1 / p2;
		do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
		e_wsfe();
/*     single fin labyrinth */
	    } else if (n == 1) {
		s_wsfe(&io___75);
		do_fio(&c__1, "             Cd_Mcgreehan= ", (ftnlen)27);
		do_fio(&c__1, (char *)&cdu, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, ", Cd= ", (ftnlen)6);
		do_fio(&c__1, (char *)&cdbragg, (ftnlen)sizeof(doublereal));
		e_wsfe();
	    }
	    s_wsfe(&io___76);
	    do_fio(&c__1, "      Outlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	    do_fio(&c__1, ":   Tt2= ", (ftnlen)9);
	    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", Ts2= ", (ftnlen)7);
	    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", Pt2= ", (ftnlen)7);
	    do_fio(&c__1, (char *)&p2, (ftnlen)sizeof(doublereal));
	    e_wsfe();

	} else if (inv == -1) {
	    s_wsfe(&io___77);
	    do_fio(&c__1, "       Inlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	    do_fio(&c__1, ":    Tt1= ", (ftnlen)10);
	    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", Ts1= ", (ftnlen)7);
	    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", Pt1= ", (ftnlen)7);
	    do_fio(&c__1, (char *)&p1, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	    s_wsle(&io___78);
	    do_lio(&c__9, &c__1, "             element ", (ftnlen)21);
	    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(integer));
	    do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
	    e_wsle();
	    s_wsfe(&io___79);
	    do_fio(&c__1, "             dyn.visc.=", (ftnlen)23);
	    do_fio(&c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", Re= ", (ftnlen)6);
	    do_fio(&c__1, (char *)&reynolds, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", Cd_radius= ", (ftnlen)13);
	    do_fio(&c__1, (char *)&cd_radius__, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", Cd_honeycomb= ", (ftnlen)16);
	    d__1 = cd_honeycomb__ / 100 + 1;
	    do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
	    e_wsfe();

/*     straight labyrinth */
	    if (hst == 0. && n != 1) {
		s_wsfe(&io___80);
		do_fio(&c__1, "                  COF = ", (ftnlen)24);
		do_fio(&c__1, (char *)&carry_over__, (ftnlen)sizeof(
			doublereal));
		do_fio(&c__1, ", Cd_lab= ", (ftnlen)10);
		do_fio(&c__1, (char *)&cd_lab__, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, ", Cd= ", (ftnlen)6);
		d__1 = carry_over__ * cd_lab__;
		do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
		e_wsfe();

/*     stepped labyrinth */
	    } else if (hst != 0.) {
		s_wsfe(&io___81);
		do_fio(&c__1, "                 Cd_1_fin= ", (ftnlen)27);
		do_fio(&c__1, (char *)&cd_1spike__, (ftnlen)sizeof(doublereal)
			);
		do_fio(&c__1, ", Cd= ", (ftnlen)6);
		do_fio(&c__1, (char *)&cd, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, ", pt0/ps1= ", (ftnlen)11);
		do_fio(&c__1, (char *)&pt0zps1, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, ", p0/pn= ", (ftnlen)9);
		d__1 = p1 / p2;
		do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
		e_wsfe();
/*     single fin labyrinth */
	    } else if (n == 1) {
		s_wsfe(&io___82);
		do_fio(&c__1, "              Cd_Mcgreehan= ", (ftnlen)28);
		do_fio(&c__1, (char *)&cdu, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, " Cd= ", (ftnlen)5);
		do_fio(&c__1, (char *)&cdbragg, (ftnlen)sizeof(doublereal));
		e_wsfe();
	    }
	    s_wsfe(&io___83);
	    do_fio(&c__1, "      Outlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	    do_fio(&c__1, ":    Tt2= ", (ftnlen)10);
	    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", Ts2= ", (ftnlen)7);
	    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", Pt2= ", (ftnlen)7);
	    do_fio(&c__1, (char *)&p2, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	}

    }

    *xflow /= *iaxial;
    df[3] *= *iaxial;

    return 0;
} /* labyrinth_ */

