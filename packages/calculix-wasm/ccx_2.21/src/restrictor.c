/* restrictor.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int restrictor_(integer *node1, integer *node2, integer *
	nodem, integer *nelem, char *lakon, integer *kon, integer *ipkon, 
	integer *nactdog, logical *identity, integer *ielprop, doublereal *
	prop, integer *kflag, doublereal *v, doublereal *xflow, doublereal *f,
	 integer *nodef, integer *idirf, doublereal *df, doublereal *cp, 
	doublereal *r__, doublereal *physcon, doublereal *dvi, integer *numf, 
	char *set, doublereal *shcon, integer *nshcon, doublereal *rhcon, 
	integer *nrhcon, integer *ntmat___, integer *mi, doublereal *ttime, 
	doublereal *time, integer *iaxial, doublereal *co, doublereal *vold, 
	integer *iplausi, ftnlen lakon_len, ftnlen set_len)
{
    /* Format strings */
    static char fmt_55[] = "(1x,a,i6,a,i6,a,e11.4,a,a,e11.4,a)";
    static char fmt_56[] = "(1x,a,i6,a,e11.4,a,e11.4,a,e11.4,a,e11.4)";
    static char fmt_57[] = "(1x,a,e11.4,a,e11.4)";
    static char fmt_58[] = "(1x,a,e11.4,a,e11.4,a,e11.4)";

    /* System generated locals */
    integer v_dim1, v_offset, vold_dim1, vold_offset, shcon_dim2, 
	    shcon_offset, rhcon_dim2, rhcon_offset;
    doublereal d__1, d__2, d__3, d__4;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen), i_dnnt(doublereal *);
    double pow_dd(doublereal *, doublereal *), sqrt(doublereal), atan(
	    doublereal);
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void), s_wsfe(cilist *), do_fio(integer *, char *, ftnlen),
	     e_wsfe(void);

    /* Local variables */
    doublereal zeta_phi__, reynolds, d__;
    extern /* Subroutine */ int zeta_calc__(integer *, doublereal *, integer *
	    , char *, doublereal *, doublereal *, logical *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, integer *, 
	    integer *, ftnlen);
    doublereal a1, a2, c2, qred_crit__, m1, m2, t1, t2, xflow_oil__, pi, km1, 
	    kp1, pt1;
    logical isothermal;
    doublereal pt2, tt1, tt2, pt1pt2_crit__, phi;
    integer inv;
    extern /* Subroutine */ int pt2_lim_calc__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *)
	    ;
    doublereal aeff;
    logical crit;
    doublereal zeta;
    extern /* Subroutine */ int exit_(integer *);
    doublereal root, sqrt__, fact1, fact2, kdkm1, kdkp1, qred1, qred2, tdkp1;
    integer icase;
    doublereal kappa;
    integer k_oil__, index;
    doublereal pt2pt1, pt1pt2, expon1, expon2, expon3, pt2_lim__;
    extern /* Subroutine */ int two_phase_flow__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, char *, integer *, integer 
	    *, integer *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     integer *, integer *, doublereal *, doublereal *, integer *, 
	    integer *, integer *, ftnlen), ts_calc__(doublereal *, doublereal 
	    *, doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *), limit_case_calc__(doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *);

    /* Fortran I/O blocks */
    static cilist io___34 = { 0, 6, 0, 0, 0 };
    static cilist io___35 = { 0, 6, 0, 0, 0 };
    static cilist io___36 = { 0, 6, 0, 0, 0 };
    static cilist io___48 = { 0, 6, 0, 0, 0 };
    static cilist io___49 = { 0, 6, 0, 0, 0 };
    static cilist io___50 = { 0, 6, 0, 0, 0 };
    static cilist io___51 = { 0, 6, 0, 0, 0 };
    static cilist io___52 = { 0, 6, 0, 0, 0 };
    static cilist io___54 = { 0, 1, 0, 0, 0 };
    static cilist io___55 = { 0, 1, 0, fmt_55, 0 };
    static cilist io___56 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___57 = { 0, 1, 0, 0, 0 };
    static cilist io___58 = { 0, 1, 0, fmt_57, 0 };
    static cilist io___59 = { 0, 1, 0, fmt_58, 0 };
    static cilist io___60 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___61 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___62 = { 0, 1, 0, 0, 0 };
    static cilist io___63 = { 0, 1, 0, fmt_57, 0 };
    static cilist io___64 = { 0, 1, 0, fmt_58, 0 };
    static cilist io___65 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___66 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___67 = { 0, 1, 0, 0, 0 };
    static cilist io___68 = { 0, 1, 0, fmt_57, 0 };
    static cilist io___69 = { 0, 1, 0, fmt_58, 0 };
    static cilist io___70 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___71 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___72 = { 0, 1, 0, 0, 0 };
    static cilist io___73 = { 0, 1, 0, fmt_57, 0 };
    static cilist io___74 = { 0, 1, 0, fmt_58, 0 };
    static cilist io___75 = { 0, 1, 0, fmt_56, 0 };



/*     pressure loss element with partial total head loss */

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
    --mi;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;
    v_dim1 = mi[2] - 0 + 1;
    v_offset = 0 + v_dim1;
    v -= v_offset;
    co -= 4;

    /* Function Body */
    phi = 0.;
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

/*     complementing the properties of restrictor elements */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "REEX", (ftnlen)4, (ftnlen)4) 
		== 0) {
	    prop[index + 2] = prop[index + 1] * 100000;
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "REWAOR", (ftnlen)6, (
		ftnlen)6) == 0) {
	    prop[index + 1] = prop[index + 2] * 100000;
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "REEN", (ftnlen)4, (
		ftnlen)4) == 0) {
	    prop[index + 1] = prop[index + 2] * 100000;
	    prop[index + 4] = .5;
	}

	isothermal = FALSE_;
	kappa = *cp / (*cp - *r__);
	kp1 = kappa + 1.;
	km1 = kappa - 1.;

/*     defining surfaces for branch elements */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "REBRJ", (ftnlen)5, (ftnlen)5) 
		== 0) {
	    if (*nelem == i_dnnt(&prop[index + 2])) {
		a1 = prop[index + 5];
		a2 = a1;
	    } else if (*nelem == i_dnnt(&prop[index + 3])) {
		a1 = prop[index + 6];
		a2 = a1;
	    }
	    zeta = 1.;
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "REBRS", (ftnlen)5, (
		ftnlen)5) == 0) {
	    if (*nelem == i_dnnt(&prop[index + 2])) {
		a1 = prop[index + 5];
		a2 = a1;
	    } else if (*nelem == i_dnnt(&prop[index + 3])) {
		a1 = prop[index + 6];
		a2 = a1;
	    }
	    zeta = 1.;
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "REUS", (ftnlen)4, (
		ftnlen)4) == 0) {

/*     for other Restrictor elements */

	    a1 = prop[index + 1];
	    a2 = prop[index + 2];
	    zeta = prop[index + 4];

/*     change in flow direction */

	    if (v[*node1 * v_dim1 + 2] >= v[*node2 * v_dim1 + 2]) {
		zeta = prop[index + 4];
	    } else {
		zeta = prop[index + 7];
		if (zeta <= 0.) {
		    zeta = prop[index + 4];
		}
	    }

	    if (a1 > a2) {
		a1 = a2;
	    }
	} else {
	    a1 = prop[index + 1];
	    a2 = prop[index + 2];
	    zeta = 1.;
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

	pt1pt2 = pt1 / pt2;
	pt2pt1 = 1 / pt1pt2;
	km1 = kappa - 1.;
	kp1 = kappa + 1.;
	kdkm1 = kappa / km1;

	if (! isothermal) {
	    d__1 = kp1 * .5;
	    d__2 = zeta * kdkm1;
	    pt1pt2_crit__ = pow_dd(&d__1, &d__2);
	} else {
	    d__1 = kappa * 3 - 1;
	    d__2 = zeta * kdkm1;
	    pt1pt2_crit__ = pow_dd(&d__1, &d__2) * .5;
	}

	if (pt1pt2 > pt1pt2_crit__) {
	    crit = TRUE_;
	    pt1pt2 = pt1pt2_crit__;
	}

	if (a1 <= a2) {

	    d__1 = kp1 * -.5 / (kappa * zeta);
	    d__2 = km1 / (kappa * zeta);
	    qred1 = sqrt(kappa / *r__) * pow_dd(&pt1pt2, &d__1) * sqrt(2. / 
		    km1 * (pow_dd(&pt1pt2, &d__2) - 1.));

	    qred2 = pt1pt2 * a1 / a2 * qred1;

	    if (! isothermal) {
		d__1 = km1 * .5 + 1.;
		d__2 = kp1 * -.5 / km1;
		qred_crit__ = sqrt(kappa / *r__) * pow_dd(&d__1, &d__2);
	    } else {
		d__1 = km1 * .5 / kappa + 1;
		d__2 = kp1 * -.5 / km1;
		qred_crit__ = sqrt(1 / *r__) * pow_dd(&d__1, &d__2);
	    }

	    if (qred2 < qred_crit__) {
		if (qred1 > qred_crit__ || pt1pt2 > pt1pt2_crit__) {
		    *xflow = inv * a1 * pt1 * qred_crit__ / sqrt(tt1);
		} else {
		    *xflow = inv * a1 * pt1 * qred1 / sqrt(tt1);
		}
	    } else {
		pt2_lim_calc__(&pt1, &a2, &a1, &kappa, &zeta, &pt2_lim__, 
			iplausi);

		*xflow = inv * a2 * pt2_lim__ * qred_crit__ / sqrt(tt2);

	    }

	} else {
	    d__1 = km1 * .5 + 1.;
	    d__2 = kp1 * -.5 / km1;
	    qred_crit__ = sqrt(kappa / *r__) * pow_dd(&d__1, &d__2);
	    pt2_lim_calc__(&pt1, &a2, &a1, &kappa, &zeta, &pt2_lim__, iplausi)
		    ;

	    *xflow = inv * a2 * pt2_lim__ * qred_crit__ / sqrt(tt2);
	}

	pt2pt1 = pt2 / pt1;
	km1 = kappa - 1.;
	kp1 = kappa + 1.;
	kdkm1 = kappa / km1;
	tdkp1 = 2. / kp1;
	c2 = pow_dd(&tdkp1, &kdkm1);
	if (a1 > a2) {
	    aeff = a2;
	} else {
	    aeff = a1;
	}
	if (pt2pt1 > c2) {
	    d__1 = 2. / kappa;
	    d__2 = 1. / kdkm1;
	    *xflow = inv * pt1 * aeff * sqrt(kdkm1 * 2. * pow_dd(&pt2pt1, &
		    d__1) * (1. - pow_dd(&pt2pt1, &d__2)) / *r__) / sqrt(tt1);
	} else {
	    d__1 = kp1 / (km1 * 2.);
	    *xflow = inv * pt1 * aeff * sqrt(kappa / *r__) * pow_dd(&tdkp1, &
		    d__1) / sqrt(tt1);
	}
	if (s_cmp(lakon + ((*nelem << 3) + 1), "RECO", (ftnlen)4, (ftnlen)4) 
		!= 0) {
	    *xflow *= .75;
	} else {
	    *xflow = *xflow;
	}

    } else if (*kflag == 2) {

/*     complementing the properties of restrictor elements */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "REEX", (ftnlen)4, (ftnlen)4) 
		== 0) {
	    prop[index + 2] = prop[index + 1] * 100000;
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "REWAOR", (ftnlen)6, (
		ftnlen)6) == 0) {
	    prop[index + 1] = prop[index + 2] * 100000;
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "REEN", (ftnlen)4, (
		ftnlen)4) == 0) {
	    prop[index + 1] = prop[index + 2] * 100000;
	    prop[index + 4] = .5;
	}

	*numf = 4;
	isothermal = FALSE_;
	pi = atan(1.) * 4.;
	kappa = *cp / (*cp - *r__);
	km1 = kappa - 1.;
	kp1 = kappa + 1.;
	kdkm1 = kappa / km1;
	kdkp1 = kappa / kp1;

	pt1 = v[*node1 * v_dim1 + 2];
	pt2 = v[*node2 * v_dim1 + 2];

	if (pt1 >= pt2) {
	    inv = 1;
	} else {
	    inv = -1;
	}

/*     defining surfaces and oil properties for branches elements */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "REBRJ", (ftnlen)5, (ftnlen)5) 
		== 0) {
	    if (*nelem == i_dnnt(&prop[index + 2])) {
		a1 = prop[index + 5];
		a2 = a1;
		xflow_oil__ = prop[index + 9];
		k_oil__ = i_dnnt(&prop[index + 11]);
	    } else if (*nelem == i_dnnt(&prop[index + 3])) {
		a1 = prop[index + 6];
		a2 = a1;
		xflow_oil__ = prop[index + 10];
		k_oil__ = i_dnnt(&prop[index + 11]);
	    }
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "REBRS", (ftnlen)5, (
		ftnlen)5) == 0) {
	    if (*nelem == i_dnnt(&prop[index + 2])) {
		a1 = prop[index + 5];
		a2 = a1;
		if (s_cmp(lakon + ((*nelem << 3) + 1), "REBRSI1", (ftnlen)7, (
			ftnlen)7) == 0) {
		    xflow_oil__ = prop[index + 11];
		    k_oil__ = i_dnnt(&prop[index + 13]);
		} else {
		    xflow_oil__ = prop[index + 9];
		    k_oil__ = i_dnnt(&prop[index + 11]);
		}
	    } else if (*nelem == i_dnnt(&prop[index + 3])) {
		a1 = prop[index + 6];
		a2 = a1;
		if (s_cmp(lakon + ((*nelem << 3) + 1), "REBRSI1", (ftnlen)7, (
			ftnlen)7) == 0) {
		    xflow_oil__ = prop[index + 12];
		    k_oil__ = i_dnnt(&prop[index + 13]);
		} else {
		    xflow_oil__ = prop[index + 10];
		    k_oil__ = i_dnnt(&prop[index + 11]);
		}
	    }
	} else {

/*     for other Restrictor elements */

	    if ((doublereal) inv > 0.) {
		a1 = prop[index + 1];
		a2 = prop[index + 2];
	    } else {
		a1 = prop[index + 2];
		a2 = prop[index + 1];
	    }

	    if (s_cmp(lakon + ((*nelem << 3) + 1), "REEL", (ftnlen)4, (ftnlen)
		    4) == 0) {
		xflow_oil__ = prop[index + 4];
		k_oil__ = i_dnnt(&prop[index + 5]);
	    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "RELOID", (ftnlen)6,
		     (ftnlen)6) == 0 || s_cmp(lakon + ((*nelem << 3) + 1), 
		    "REUS", (ftnlen)4, (ftnlen)4) == 0 || s_cmp(lakon + ((*
		    nelem << 3) + 1), "REEN", (ftnlen)4, (ftnlen)4) == 0 || 
		    s_cmp(lakon + ((*nelem << 3) + 1), "REEX", (ftnlen)4, (
		    ftnlen)4) == 0 || s_cmp(lakon + ((*nelem << 3) + 1), 
		    "REWAOR", (ftnlen)6, (ftnlen)6) == 0 || s_cmp(lakon + ((*
		    nelem << 3) + 1), "RELOLI", (ftnlen)6, (ftnlen)6) == 0) {
		xflow_oil__ = prop[index + 5];
		k_oil__ = i_dnnt(&prop[index + 6]);
	    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "RECO", (ftnlen)4, (
		    ftnlen)4) == 0 || s_cmp(lakon + ((*nelem << 3) + 1), 
		    "REBEMA", (ftnlen)6, (ftnlen)6) == 0 || s_cmp(lakon + ((*
		    nelem << 3) + 1), "REBEMI", (ftnlen)6, (ftnlen)6) == 0 || 
		    s_cmp(lakon + ((*nelem << 3) + 1), "REBEIDC", (ftnlen)7, (
		    ftnlen)7) == 0) {
		xflow_oil__ = prop[index + 6];
		k_oil__ = i_dnnt(&prop[index + 7]);
	    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "REBEIDR", (ftnlen)
		    7, (ftnlen)7) == 0) {
		xflow_oil__ = prop[index + 8];
		k_oil__ = i_dnnt(&prop[index + 9]);
	    }
	}

	if (pt1 > pt2) {
	    inv = 1;
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    tt1 = v[*node1 * v_dim1] - physcon[1];
	    tt2 = v[*node2 * v_dim1] - physcon[1];

	    icase = 0;
	    ts_calc__(xflow, &tt1, &pt1, &kappa, r__, &a1, &t1, &icase);
	    ts_calc__(xflow, &tt2, &pt2, &kappa, r__, &a2, &t2, &icase);

	    nodef[1] = *node1;
	    nodef[2] = *node1;
	    nodef[3] = *nodem;
	    nodef[4] = *node2;

	} else if (pt1 == pt2) {
	    inv = 1;
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    tt1 = v[*node1 * v_dim1] - physcon[1];
	    tt2 = v[*node2 * v_dim1] - physcon[1];

	    pt2 -= pt2 * .01;
	    icase = 0;
	    ts_calc__(xflow, &tt1, &pt1, &kappa, r__, &a1, &t1, &icase);
	    ts_calc__(xflow, &tt2, &pt2, &kappa, r__, &a2, &t2, &icase);

	    nodef[1] = *node1;
	    nodef[2] = *node1;
	    nodef[3] = *nodem;
	    nodef[4] = *node2;

	} else {
	    inv = -1;
	    pt1 = v[*node2 * v_dim1 + 2];
	    pt2 = v[*node1 * v_dim1 + 2];
	    *xflow = -v[*nodem * v_dim1 + 1] * *iaxial;
	    tt1 = v[*node2 * v_dim1] - physcon[1];
	    tt2 = v[*node1 * v_dim1] - physcon[1];
	    icase = 0;
	    ts_calc__(xflow, &tt1, &pt1, &kappa, r__, &a1, &t1, &icase);
	    ts_calc__(xflow, &tt2, &pt2, &kappa, r__, &a2, &t2, &icase);
	    nodef[1] = *node2;
	    nodef[2] = *node2;
	    nodef[3] = *nodem;
	    nodef[4] = *node1;
	}

	idirf[1] = 2;
	idirf[2] = 0;
	idirf[3] = 1;
	idirf[4] = 2;

/*     calculation of the dynamic viscosity */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "RE", (ftnlen)2, (ftnlen)2) == 
		0) {
	    icase = 0;
	}

	if (abs(*dvi) < 1e-30) {
	    s_wsle(&io___34);
	    do_lio(&c__9, &c__1, "*ERROR in restrictor: ", (ftnlen)22);
	    e_wsle();
	    s_wsle(&io___35);
	    do_lio(&c__9, &c__1, "       no dynamic viscosity defined", (
		    ftnlen)35);
	    e_wsle();
	    s_wsle(&io___36);
	    do_lio(&c__9, &c__1, "       dvi= ", (ftnlen)12);
	    do_lio(&c__5, &c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    e_wsle();
	    exit_(&c__201);
	}

/*     Reynolds number calculation */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "REBR", (ftnlen)4, (ftnlen)4) 
		== 0) {
	    d__ = sqrt(a1 * 4. / pi);
	    reynolds = abs(*xflow) * d__ / (*dvi * a1);
	} else {
	    d__ = prop[index + 3];
	    if (a1 <= a2) {
		reynolds = abs(*xflow) * d__ / (*dvi * a1);
	    } else {
		reynolds = abs(*xflow) * d__ / (*dvi * a2);
	    }
	}
	if (xflow_oil__ < 1e-10) {
	    xflow_oil__ = 0.;
	}
	if (s_cmp(lakon + ((*nelem << 3) + 1), "REBEMI", (ftnlen)6, (ftnlen)6)
		 == 0) {

/*     BEND MILLER with oil */

	    if (xflow_oil__ != 0.) {

		two_phase_flow__(&tt1, &pt1, &t1, &tt2, &pt2, &t2, xflow, &
			xflow_oil__, nelem, lakon + 8, &kon[1], &ipkon[1], &
			ielprop[1], &prop[1], &v[v_offset], dvi, cp, r__, &
			k_oil__, &phi, &zeta, &nshcon[1], &nrhcon[1], &shcon[
			shcon_offset], &rhcon[rhcon_offset], ntmat___, &mi[1],
			 iaxial, (ftnlen)8);

		zeta = phi * zeta;
	    } else {
		zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &
			reynolds, &zeta, &isothermal, &kon[1], &ipkon[1], r__,
			 &kappa, &v[v_offset], &mi[1], iaxial, (ftnlen)8);
		phi = 1.;
	    }
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "RELOID", (ftnlen)6, (
		ftnlen)6) == 0) {

/*     long orifice idelchick with oil */

	    if (xflow_oil__ != 0.) {

		two_phase_flow__(&tt1, &pt1, &t1, &tt2, &pt2, &t2, xflow, &
			xflow_oil__, nelem, lakon + 8, &kon[1], &ipkon[1], &
			ielprop[1], &prop[1], &v[v_offset], dvi, cp, r__, &
			k_oil__, &phi, &zeta, &nshcon[1], &nrhcon[1], &shcon[
			shcon_offset], &rhcon[rhcon_offset], ntmat___, &mi[1],
			 iaxial, (ftnlen)8);
		zeta = phi * zeta;
	    } else {
		zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &
			reynolds, &zeta, &isothermal, &kon[1], &ipkon[1], r__,
			 &kappa, &v[v_offset], &mi[1], iaxial, (ftnlen)8);
		phi = 1.;
	    }

	} else {

/*     every other zeta elements with/without oil */

	    if (xflow_oil__ != 0.) {
		two_phase_flow__(&tt1, &pt1, &t1, &tt2, &pt2, &t2, xflow, &
			xflow_oil__, nelem, lakon + 8, &kon[1], &ipkon[1], &
			ielprop[1], &prop[1], &v[v_offset], dvi, cp, r__, &
			k_oil__, &phi, &zeta, &nshcon[1], &nrhcon[1], &shcon[
			shcon_offset], &rhcon[rhcon_offset], ntmat___, &mi[1],
			 iaxial, (ftnlen)8);
		zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &
			reynolds, &zeta, &isothermal, &kon[1], &ipkon[1], r__,
			 &kappa, &v[v_offset], &mi[1], iaxial, (ftnlen)8);
		zeta = phi * zeta;
	    } else {
		phi = 1.;
		zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &
			reynolds, &zeta, &isothermal, &kon[1], &ipkon[1], r__,
			 &kappa, &v[v_offset], &mi[1], iaxial, (ftnlen)8);
		zeta = phi * zeta;
	    }
	}

	if (abs(zeta) < 1e-10) {
	    zeta = 0.;
	}

	if (zeta < 0.) {
	    pt1 = v[*node1 * v_dim1 + 2];
	    pt2 = v[*node2 * v_dim1 + 2];
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    tt2 = v[*node2 * v_dim1];
	    tt1 = v[*node1 * v_dim1];
	    ts_calc__(xflow, &tt1, &pt1, &kappa, r__, &a1, &t1, &icase);
	    ts_calc__(xflow, &tt2, &pt2, &kappa, r__, &a2, &t2, &icase);

	    nodef[1] = *node1;
	    nodef[2] = *node1;
	    nodef[3] = *nodem;
	    nodef[4] = *node2;

	}

	if (! isothermal) {
	    d__1 = kp1 * .5;
	    d__2 = zeta * kdkm1;
	    pt1pt2_crit__ = pow_dd(&d__1, &d__2);
	} else {
	    d__1 = kappa * 3 - 1;
	    d__2 = zeta * kdkm1;
	    pt1pt2_crit__ = pow_dd(&d__1, &d__2) * .5;
	}
	pt1pt2 = pt1 / pt2;

/*     Mach number caclulation */

	m1 = sqrt(2. / km1 * (tt1 / t1 - 1.));
	if (1. - m1 <= 1e-6) {
	    if (zeta > 0.) {
		limit_case_calc__(&a2, &pt1, &tt2, xflow, &zeta, r__, &kappa, 
			&pt2_lim__, &m2);

	    }
	} else {
	    m2 = sqrt(2. / km1 * (tt2 / t2 - 1.));
	}

/*     Section A1 smaller than or equal to section A2 */
/*     or for all BRANCHES ELEMENTS */

	if (a1 <= a2) {

/*     definition of the reduced mass flows */

	    if (zeta > 0.) {

		d__1 = kp1 * -.5 / (kappa * zeta);
		d__2 = km1 / (kappa * zeta);
		qred1 = sqrt(kappa / *r__) * pow_dd(&pt1pt2, &d__1) * sqrt(2. 
			/ km1 * (pow_dd(&pt1pt2, &d__2) - 1.));

	    } else if (zeta < 0.) {

		qred1 = abs(*xflow) * sqrt(tt1) / (pt1 * a1);

	    }

	    qred2 = pt1pt2 * a1 / a2 * qred1;

	    if (! isothermal) {
		d__1 = km1 * .5 + 1.;
		d__2 = kp1 * -.5 / km1;
		qred_crit__ = sqrt(kappa / *r__) * pow_dd(&d__1, &d__2);
	    } else {
		d__1 = km1 * .5 / kappa + 1;
		d__2 = kp1 * -.5 / km1;
		qred_crit__ = sqrt(1 / *r__) * pow_dd(&d__1, &d__2);
	    }

/*     icase zeta greater than zero */

	    if (zeta > 0.) {

/*     definition of the coefficients */

		if (pt1pt2 >= .9999999999 && pt1pt2 <= 1.000000000111111) {
		    pt1 = pt2 * 1.0001;
		    pt1pt2 = pt1 / pt2;
		}

		sqrt__ = sqrt(*r__ * tt1 / kappa);
		expon1 = kp1 * -.5 / (zeta * kappa);
		fact1 = pow_dd(&pt1pt2, &expon1);
		expon2 = km1 / (zeta * kappa);
		fact2 = pow_dd(&pt1pt2, &expon2);
		expon3 = 1. / (zeta * kappa);
		root = 2. / km1 * (fact2 - 1.);

		if (qred2 < qred_crit__) {

		    if (qred1 < qred_crit__ && pt1pt2 < pt1pt2_crit__) {

/*     section 1 is not critical */

/*     residual */

			*f = *xflow * sqrt__ / (a1 * pt1) - fact1 * sqrt(root)
				;

/*     pressure node1 */

/* Computing 2nd power */
			d__1 = pt1;
			df[1] = -(*xflow) * sqrt__ / (a1 * (d__1 * d__1)) + 
				fact1 / pt1 * sqrt(root) * (-expon1 - expon3 *
				 fact2 / root);

/*     temperature node1 */

			df[2] = *xflow * .5 * sqrt(*r__ / (kappa * tt1)) / (
				a1 * pt1);

/*     mass flow */

			df[3] = inv * sqrt__ / (a1 * pt1);

/*     pressure node2 */

			df[4] = fact1 / pt2 * sqrt(root) * (expon1 + expon3 * 
				fact2 / root);

		    } else {

/*     section1 is critical */

			*f = *xflow * sqrt__ / (pt1 * a1) - sqrt(*r__ / kappa)
				 * qred_crit__;

/*     pressure node1 */

/* Computing 2nd power */
			d__1 = pt1;
			df[1] = -(*xflow) * sqrt__ / (a1 * (d__1 * d__1));

/*     temperature node1 */

			df[2] = *xflow * .5 * sqrt(*r__ / kappa) / (pt1 * a1 *
				 sqrt(tt1));

/*     mass flow */

			df[3] = inv * sqrt__ / (a1 * pt1);

/*     pressure node2 */

			df[4] = 0.;

		    }

		} else {

/*     section A2 critical */

		    pt2_lim_calc__(&pt1, &a2, &a1, &kappa, &zeta, &pt2_lim__, 
			    iplausi);
		    pt1pt2 = pt1 / pt2_lim__;

		    fact1 = pow_dd(&pt1pt2, &expon1);

		    fact2 = pow_dd(&pt1pt2, &expon2);

		    root = 2. / km1 * (fact2 - 1.);

		    *f = *xflow * sqrt__ / (a1 * pt1) - fact1 * sqrt(root);

/*     pressure node1 */

/* Computing 2nd power */
		    d__1 = pt1;
		    df[1] = -(*xflow) * sqrt__ / (a1 * (d__1 * d__1)) + fact1 
			    / pt1 * sqrt(root) * (-expon1 - expon3 * fact2 / 
			    root);

/*     temperature node1 */

		    df[2] = *xflow * .5 * sqrt(*r__ / (kappa * tt1)) / (a1 * 
			    pt1);

/*     mass flow */

		    df[3] = inv * sqrt__ / (a1 * pt1);

/*     pressure node2 */

		    df[4] = 0.;

		}

/*     icase zeta less than zero */

	    } else if (zeta < 0.) {

		expon1 = -kp1 / (zeta * kappa);
		fact1 = pow_dd(&pt1pt2, &expon1);
		expon2 = km1 / (zeta * kappa);
		fact2 = pow_dd(&pt1pt2, &expon2);
		expon3 = 1. / (zeta * kappa);
		root = 2. / km1 * (fact2 - 1.);

		if (qred1 < qred_crit__) {

/*     section 1 is not critical */

/*     residual */

/* Computing 2nd power */
		    d__1 = *xflow;
/* Computing 2nd power */
		    d__2 = a1;
/* Computing 2nd power */
		    d__3 = pt1;
		    *f = d__1 * d__1 * *r__ * tt1 / (d__2 * d__2 * (d__3 * 
			    d__3) * kappa) - fact1 * root;

/*     pressure node1 */

/* Computing 2nd power */
		    d__1 = *xflow;
/* Computing 2nd power */
		    d__2 = a1;
/* Computing 3rd power */
		    d__3 = pt1;
		    df[1] = d__1 * d__1 * -2 * *r__ * tt1 / (d__2 * d__2 * (
			    d__3 * (d__3 * d__3)) * kappa) - 1 / pt1 * fact1 *
			     (expon1 * root + 2 / (zeta * kappa) * fact2);

/*     temperature node1 */

/* Computing 2nd power */
		    d__1 = *xflow;
/* Computing 2nd power */
		    d__2 = a1;
/* Computing 2nd power */
		    d__3 = pt1;
		    df[2] = d__1 * d__1 * *r__ / (d__2 * d__2 * (d__3 * d__3) 
			    * kappa);

/*     mass flow */

/* Computing 2nd power */
		    d__1 = a1;
/* Computing 2nd power */
		    d__2 = pt1;
		    df[3] = *xflow * 2 * *r__ * tt1 / (d__1 * d__1 * (d__2 * 
			    d__2) * kappa);

/*     pressure node2 */

		    df[4] = -(1 / pt2 * fact1) * (-expon1 * root - 2 / (zeta *
			     kappa) * fact2);

		} else {

/*     section1 is critical */

/* Computing 2nd power */
		    d__1 = *xflow;
/* Computing 2nd power */
		    d__2 = a1;
/* Computing 2nd power */
		    d__3 = pt1;
/* Computing 2nd power */
		    d__4 = qred_crit__;
		    *f = d__1 * d__1 * *r__ * tt1 / (d__2 * d__2 * (d__3 * 
			    d__3) * kappa) - *r__ / kappa * (d__4 * d__4);

/*     pressure node1 */

/* Computing 2nd power */
		    d__1 = *xflow;
/* Computing 2nd power */
		    d__2 = a1;
/* Computing 3rd power */
		    d__3 = pt1;
		    df[1] = d__1 * d__1 * -2 * *r__ * tt1 / (d__2 * d__2 * (
			    d__3 * (d__3 * d__3)) * kappa);

/*     temperature node1 */

/* Computing 2nd power */
		    d__1 = *xflow;
/* Computing 2nd power */
		    d__2 = a1;
/* Computing 2nd power */
		    d__3 = pt1;
		    df[2] = d__1 * d__1 * *r__ / (d__2 * d__2 * (d__3 * d__3) 
			    * kappa);

/*     mass flow */

/* Computing 2nd power */
		    d__1 = a1;
/* Computing 2nd power */
		    d__2 = pt1;
		    df[3] = *xflow * 2 * *r__ * tt1 / (d__1 * d__1 * (d__2 * 
			    d__2) * kappa);

/*     pressure node2 */

		    df[4] = 0.;

		}

	    } else if (zeta == 0.) {

/*     zeta = 0 */

		*f = pt1 / pt2 - 1.;

		df[1] = 1 / pt2;
		df[2] = 0.;
		df[3] = 0.;
/* Computing 2nd power */
		d__1 = pt2;
		df[4] = -pt1 / (d__1 * d__1);

	    }

	} else {

/*     A1 greater than A2 */

	    qred2 = abs(*xflow) * sqrt(tt2) / (a2 * pt2);

	    qred1 = 1 / pt1pt2 * a2 / a1 * qred2;

	    d__1 = km1 * .5 + 1.;
	    d__2 = kp1 * -.5 / km1;
	    qred_crit__ = sqrt(kappa / *r__) * pow_dd(&d__1, &d__2);

/*     definition of the coefficients */

	    if (zeta > 0.) {

		sqrt__ = sqrt(*r__ * tt1 / kappa);

		if (pt1pt2 >= .9999999999 && pt1pt2 <= 1.000000000111111) {
		    pt1 = pt2 * 1.0001;
		    pt1pt2 = pt1 / pt2;
		}

		expon1 = kp1 * -.5 / (zeta * kappa);
		fact1 = pow_dd(&pt1pt2, &expon1);
		expon2 = km1 / (zeta * kappa);
		fact2 = pow_dd(&pt1pt2, &expon2);
		expon3 = 1. / (zeta * kappa);
		root = 2. / km1 * (fact2 - 1.);

		if (pt1pt2 >= pt1pt2_crit__) {
		    pt1pt2 = pt1pt2_crit__;
		    pt2 = pt1 / pt1pt2_crit__;
		}

		if (qred2 < qred_crit__ && pt1 / pt2 < pt1pt2_crit__) {

/*     section 2 is not critical */

/*     residual */

		    *f = *xflow * sqrt__ / (a2 * pt2) - fact1 * sqrt(root);

/*     pressure node1 */

		    df[1] = -fact1 / pt1 * sqrt(root) * (expon1 + expon3 * 
			    fact2 / root);

/*     temperature node1 */

		    df[2] = *xflow * .5 * sqrt__ / (a2 * pt2 * tt1);

/*     mass flow */

		    df[3] = inv * sqrt__ / (a2 * pt2);

/*     pressure node2 */

/* Computing 2nd power */
		    d__1 = pt2;
		    df[4] = -(*xflow) * sqrt__ / (a2 * (d__1 * d__1)) - fact1 
			    / pt2 * sqrt(root) * (-expon1 - expon3 * fact2 / 
			    root);

		} else {
		    s_wsle(&io___48);
		    do_lio(&c__9, &c__1, "*WARNING in restrictor: A1 greater"
			    " than A2", (ftnlen)42);
		    e_wsle();
		    s_wsle(&io___49);
		    do_lio(&c__9, &c__1, "         critical flow in element", 
			    (ftnlen)33);
		    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			    integer));
		    e_wsle();

/*     section2 is critical */

		    pt2 = pt1 / pt1pt2_crit__;

		    *f = *xflow * sqrt(tt1) / (pt2 * a2) - qred_crit__;

/*     pressure node1 */

		    df[1] = 0.;

/*     temperature node1 */

		    df[2] = *xflow * .5 / (a2 * pt2 * sqrt(tt2));

/*     mass flow */

		    df[3] = inv * sqrt(tt1) / (a2 * pt2);

/*     pressure node2 */

/* Computing 2nd power */
		    d__1 = pt2;
		    df[4] = -(*xflow) * sqrt(tt1) / (a2 * (d__1 * d__1));

		}

	    } else if (zeta == 0.) {

		qred1 = abs(*xflow) * sqrt(tt1 * kappa / *r__) / (a1 * pt1);
		qred2 = abs(*xflow) * sqrt(tt2 * kappa / *r__) / (a2 * pt2);
		d__1 = km1 * .5 + 1.;
		d__2 = kp1 * -.5 / km1;
		qred_crit__ = sqrt(kappa / *r__) * pow_dd(&d__1, &d__2);

		*f = pt1 / pt2 - 1.;

		df[1] = 1 / pt2;

		df[2] = 0.;

		df[3] = 0.;

/* Computing 2nd power */
		d__1 = pt2;
		df[4] = -pt1 / (d__1 * d__1);

	    }
	}

    } else if (*kflag == 3 || *kflag == 4) {

/*     complementing the properties of restrictor elements */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "REEX", (ftnlen)4, (ftnlen)4) 
		== 0) {
	    prop[index + 2] = prop[index + 1] * 100000;
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "REWAOR", (ftnlen)6, (
		ftnlen)6) == 0) {
	    prop[index + 1] = prop[index + 2] * 100000;
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "REEN", (ftnlen)4, (
		ftnlen)4) == 0) {
	    prop[index + 1] = prop[index + 2] * 100000;
	    prop[index + 4] = .5;
	}

	isothermal = FALSE_;
	pi = atan(1.) * 4.;
	kappa = *cp / (*cp - *r__);
	km1 = kappa - 1.;
	kp1 = kappa + 1.;
	kdkm1 = kappa / km1;
	kdkp1 = kappa / kp1;

	pt1 = v[*node1 * v_dim1 + 2];
	pt2 = v[*node2 * v_dim1 + 2];
	if (pt1 >= pt2) {
	    inv = 1;
	} else {
	    inv = -1;
	}

/*     defining surfaces for branches elements */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "REBRJ", (ftnlen)5, (ftnlen)5) 
		== 0) {
	    if (*nelem == i_dnnt(&prop[index + 2])) {
		a1 = prop[index + 5];
		a2 = a1;
		xflow_oil__ = prop[index + 9];
		k_oil__ = i_dnnt(&prop[index + 11]);
	    } else if (*nelem == i_dnnt(&prop[index + 3])) {
		a1 = prop[index + 6];
		a2 = a1;
		xflow_oil__ = prop[index + 10];
		k_oil__ = i_dnnt(&prop[index + 11]);
	    }
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "REBRS", (ftnlen)5, (
		ftnlen)5) == 0) {
	    if (*nelem == i_dnnt(&prop[index + 2])) {
		a1 = prop[index + 5];
		a2 = a1;
		if (s_cmp(lakon + ((*nelem << 3) + 1), "REBRSI1", (ftnlen)7, (
			ftnlen)7) == 0) {
		    xflow_oil__ = prop[index + 11];
		    k_oil__ = i_dnnt(&prop[index + 13]);
		} else {
		    xflow_oil__ = prop[index + 9];
		    k_oil__ = i_dnnt(&prop[index + 11]);
		}
	    } else if (*nelem == i_dnnt(&prop[index + 3])) {
		a1 = prop[index + 6];
		a2 = a1;
		if (s_cmp(lakon + ((*nelem << 3) + 1), "REBRSI1", (ftnlen)7, (
			ftnlen)7) == 0) {
		    xflow_oil__ = prop[index + 12];
		    k_oil__ = i_dnnt(&prop[index + 13]);
		} else {
		    xflow_oil__ = prop[index + 10];
		    k_oil__ = i_dnnt(&prop[index + 11]);
		}
	    }
	} else {

/*     for other Restrictor elements */

	    a1 = prop[index + 1];
	    a2 = prop[index + 2];
	    if (s_cmp(lakon + ((*nelem << 3) + 1), "REEL", (ftnlen)4, (ftnlen)
		    4) == 0) {
		xflow_oil__ = prop[index + 4];
		k_oil__ = i_dnnt(&prop[index + 5]);
	    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "RELOID", (ftnlen)6,
		     (ftnlen)6) == 0 || s_cmp(lakon + ((*nelem << 3) + 1), 
		    "REUS", (ftnlen)4, (ftnlen)4) == 0 || s_cmp(lakon + ((*
		    nelem << 3) + 1), "REEN", (ftnlen)4, (ftnlen)4) == 0 || 
		    s_cmp(lakon + ((*nelem << 3) + 1), "REEX", (ftnlen)4, (
		    ftnlen)4) == 0 || s_cmp(lakon + ((*nelem << 3) + 1), 
		    "REWAOR", (ftnlen)6, (ftnlen)6) == 0 || s_cmp(lakon + ((*
		    nelem << 3) + 1), "RELOLI", (ftnlen)6, (ftnlen)6) == 0) {
		xflow_oil__ = prop[index + 5];
		k_oil__ = i_dnnt(&prop[index + 6]);
	    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "RECO", (ftnlen)4, (
		    ftnlen)4) == 0 || s_cmp(lakon + ((*nelem << 3) + 1), 
		    "REBEMA", (ftnlen)6, (ftnlen)6) == 0 || s_cmp(lakon + ((*
		    nelem << 3) + 1), "REBEMI", (ftnlen)6, (ftnlen)6) == 0 || 
		    s_cmp(lakon + ((*nelem << 3) + 1), "REBEIDC", (ftnlen)7, (
		    ftnlen)7) == 0) {
		xflow_oil__ = prop[index + 6];
		k_oil__ = i_dnnt(&prop[index + 7]);
	    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "REBEIDR", (ftnlen)
		    7, (ftnlen)7) == 0) {
		xflow_oil__ = prop[index + 8];
		k_oil__ = i_dnnt(&prop[index + 9]);
	    }
	}

	if (pt1 >= pt2) {
	    inv = 1;
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    tt1 = v[*node1 * v_dim1] - physcon[1];
	    tt2 = v[*node2 * v_dim1] - physcon[1];
	    icase = 0;
	    ts_calc__(xflow, &tt1, &pt1, &kappa, r__, &a1, &t1, &icase);
	    ts_calc__(xflow, &tt2, &pt2, &kappa, r__, &a2, &t2, &icase);

	} else {
	    inv = -1;
	    pt1 = v[*node2 * v_dim1 + 2];
	    pt2 = v[*node1 * v_dim1 + 2];
	    *xflow = -v[*nodem * v_dim1 + 1] * *iaxial;
	    tt1 = v[*node2 * v_dim1] - physcon[1];
	    tt2 = v[*node1 * v_dim1] - physcon[1];
	    icase = 0;
	    ts_calc__(xflow, &tt1, &pt1, &kappa, r__, &a1, &t1, &icase);
	    ts_calc__(xflow, &tt2, &pt2, &kappa, r__, &a2, &t2, &icase);

	}

/*     calculation of the dynamic viscosity */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "RE", (ftnlen)2, (ftnlen)2) == 
		0) {
	    icase = 0;
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "REEX", (ftnlen)4, (
		ftnlen)4) == 0) {
	    if (s_cmp(lakon + ((i_dnnt(&prop[index + 4]) << 3) + 1), "GAPFA", 
		    (ftnlen)5, (ftnlen)5) == 0) {
		icase = 0;
	    } else if (s_cmp(lakon + ((i_dnnt(&prop[index + 4]) << 3) + 1), 
		    "GAPFI", (ftnlen)5, (ftnlen)5) == 0) {
		icase = 1;
	    }
	}

	if (abs(*dvi) < 1e-30) {
	    s_wsle(&io___50);
	    do_lio(&c__9, &c__1, "*ERROR in restrictor: ", (ftnlen)22);
	    e_wsle();
	    s_wsle(&io___51);
	    do_lio(&c__9, &c__1, "       no dynamic viscosity defined", (
		    ftnlen)35);
	    e_wsle();
	    s_wsle(&io___52);
	    do_lio(&c__9, &c__1, "       dvi= ", (ftnlen)12);
	    do_lio(&c__5, &c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    e_wsle();
	    exit_(&c__201);
	}

/*     Reynolds number calculation */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "REBR", (ftnlen)4, (ftnlen)4) 
		== 0) {
	    d__ = sqrt(a1 * 4. / pi);
	    reynolds = abs(*xflow) * d__ / (*dvi * a1);
	} else {
	    d__ = prop[index + 3];
	    if (a1 <= a2) {
		reynolds = abs(*xflow) * d__ / (*dvi * a1);
	    } else {
		reynolds = abs(*xflow) * d__ / (*dvi * a2);
	    }
	}

	if (xflow_oil__ < 1e-10) {
	    xflow_oil__ = 0.;
	}

/*     BEND MILLER with oil */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "REBEMI", (ftnlen)6, (ftnlen)6)
		 == 0) {
	    if (xflow_oil__ != 0.) {
		two_phase_flow__(&tt1, &pt1, &t1, &tt2, &pt2, &t2, xflow, &
			xflow_oil__, nelem, lakon + 8, &kon[1], &ipkon[1], &
			ielprop[1], &prop[1], &v[v_offset], dvi, cp, r__, &
			k_oil__, &phi, &zeta, &nshcon[1], &nrhcon[1], &shcon[
			shcon_offset], &rhcon[rhcon_offset], ntmat___, &mi[1],
			 iaxial, (ftnlen)8);
		zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &
			reynolds, &zeta, &isothermal, &kon[1], &ipkon[1], r__,
			 &kappa, &v[v_offset], &mi[1], iaxial, (ftnlen)8);

		zeta_phi__ = phi * zeta;
	    } else {

		zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &
			reynolds, &zeta, &isothermal, &kon[1], &ipkon[1], r__,
			 &kappa, &v[v_offset], &mi[1], iaxial, (ftnlen)8);
		phi = 1.;
		zeta_phi__ = phi * zeta;

	    }
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "RELOID", (ftnlen)6, (
		ftnlen)6) == 0) {

/*     long  orifice in a wall with oil after Idelchik */

	    if (xflow_oil__ != 0.) {
		two_phase_flow__(&tt1, &pt1, &t1, &tt2, &pt2, &t2, xflow, &
			xflow_oil__, nelem, lakon + 8, &kon[1], &ipkon[1], &
			ielprop[1], &prop[1], &v[v_offset], dvi, cp, r__, &
			k_oil__, &phi, &zeta, &nshcon[1], &nrhcon[1], &shcon[
			shcon_offset], &rhcon[rhcon_offset], ntmat___, &mi[1],
			 iaxial, (ftnlen)8);

		zeta_phi__ = phi * zeta;
	    } else {

		zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &
			reynolds, &zeta, &isothermal, &kon[1], &ipkon[1], r__,
			 &kappa, &v[v_offset], &mi[1], iaxial, (ftnlen)8);
		phi = 1.;
		zeta_phi__ = phi * zeta;
	    }

	} else {

/*     every other zeta elements with/without oil */

	    if (xflow_oil__ != 0.) {
		two_phase_flow__(&tt1, &pt1, &t1, &tt2, &pt2, &t2, xflow, &
			xflow_oil__, nelem, lakon + 8, &kon[1], &ipkon[1], &
			ielprop[1], &prop[1], &v[v_offset], dvi, cp, r__, &
			k_oil__, &phi, &zeta, &nshcon[1], &nrhcon[1], &shcon[
			shcon_offset], &rhcon[rhcon_offset], ntmat___, &mi[1],
			 iaxial, (ftnlen)8);

		zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &
			reynolds, &zeta, &isothermal, &kon[1], &ipkon[1], r__,
			 &kappa, &v[v_offset], &mi[1], iaxial, (ftnlen)8);

		zeta_phi__ = phi * zeta;
	    } else {
		phi = 1.;
		zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &
			reynolds, &zeta, &isothermal, &kon[1], &ipkon[1], r__,
			 &kappa, &v[v_offset], &mi[1], iaxial, (ftnlen)8);
		zeta_phi__ = phi * zeta;
	    }
	}

	if (zeta <= 0.) {
	    pt1 = v[*node1 * v_dim1 + 2];
	    pt2 = v[*node2 * v_dim1 + 2];
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    tt1 = v[*node1 * v_dim1];
	    tt2 = v[*node2 * v_dim1];

	}

	if (! isothermal) {
	    d__1 = kp1 * .5;
	    d__2 = zeta * kdkm1;
	    pt1pt2_crit__ = pow_dd(&d__1, &d__2);
	} else {
	    d__1 = kappa * 3 - 1;
	    d__2 = zeta * kdkm1;
	    pt1pt2_crit__ = pow_dd(&d__1, &d__2) * .5;
	}
	pt1pt2 = pt1 / pt2;

/*     Mach number calculation */

	m1 = sqrt(2. / km1 * (tt1 / t1 - 1.));
	if (1. - m1 <= .001) {
	    if (zeta > 0.) {
		if (xflow_oil__ == 0.) {
		    limit_case_calc__(&a2, &pt1, &tt2, xflow, &zeta, r__, &
			    kappa, &pt2_lim__, &m2);
		} else {
		    limit_case_calc__(&a2, &pt1, &tt2, xflow, &zeta_phi__, 
			    r__, &kappa, &pt2_lim__, &m2);
		}
	    }
	} else {
	    m2 = sqrt(2. / km1 * (tt2 / t2 - 1.));
	}

	if (*kflag == 3) {
	    s_wsle(&io___54);
	    do_lio(&c__9, &c__1, "", (ftnlen)0);
	    e_wsle();
	    s_wsfe(&io___55);
	    do_fio(&c__1, " from node ", (ftnlen)11);
	    do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	    do_fio(&c__1, " to node ", (ftnlen)9);
	    do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	    do_fio(&c__1, " :   air massflow rate = ", (ftnlen)25);
	    do_fio(&c__1, (char *)&(*xflow), (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " ", (ftnlen)1);
	    do_fio(&c__1, " , oil massflow rate = ", (ftnlen)23);
	    do_fio(&c__1, (char *)&xflow_oil__, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " ", (ftnlen)1);
	    e_wsfe();

	    if (s_cmp(lakon + ((*nelem << 3) + 3), "BR", (ftnlen)2, (ftnlen)2)
		     != 0) {

/*     for restrictors */

		if (inv == 1) {
		    s_wsfe(&io___56);
		    do_fio(&c__1, "       Inlet node ", (ftnlen)18);
		    do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
		    do_fio(&c__1, " :    Tt1=  ", (ftnlen)12);
		    do_fio(&c__1, (char *)&tt1, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , Ts1 = ", (ftnlen)10);
		    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , Pt1 = ", (ftnlen)10);
		    do_fio(&c__1, (char *)&pt1, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , M1 = ", (ftnlen)9);
		    do_fio(&c__1, (char *)&m1, (ftnlen)sizeof(doublereal));
		    e_wsfe();
		    s_wsle(&io___57);
		    do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
		    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			    integer));
		    do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
		    e_wsle();
		    s_wsfe(&io___58);
		    do_fio(&c__1, "             dyn.visc. = ", (ftnlen)25);
		    do_fio(&c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal))
			    ;
		    do_fio(&c__1, " , Re = ", (ftnlen)8);
		    do_fio(&c__1, (char *)&reynolds, (ftnlen)sizeof(
			    doublereal));
		    e_wsfe();
		    s_wsfe(&io___59);
		    do_fio(&c__1, "             PHI = ", (ftnlen)19);
		    do_fio(&c__1, (char *)&phi, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , ZETA = ", (ftnlen)10);
		    do_fio(&c__1, (char *)&zeta, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , ZETA_PHI = ", (ftnlen)14);
		    d__1 = phi * zeta;
		    do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
		    e_wsfe();
		    s_wsfe(&io___60);
		    do_fio(&c__1, "      Outlet node ", (ftnlen)18);
		    do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
		    do_fio(&c__1, " :   Tt2 = ", (ftnlen)11);
		    do_fio(&c__1, (char *)&tt2, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , Ts2 = ", (ftnlen)9);
		    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , Pt2 = ", (ftnlen)10);
		    do_fio(&c__1, (char *)&pt2, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , M2= ", (ftnlen)8);
		    do_fio(&c__1, (char *)&m2, (ftnlen)sizeof(doublereal));
		    e_wsfe();

		} else if (inv == -1) {
		    s_wsfe(&io___61);
		    do_fio(&c__1, "       Inlet node ", (ftnlen)18);
		    do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
		    do_fio(&c__1, " :    Tt1= ", (ftnlen)11);
		    do_fio(&c__1, (char *)&tt1, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , Ts1= ", (ftnlen)8);
		    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , Pt1= ", (ftnlen)8);
		    do_fio(&c__1, (char *)&pt1, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , M1= ", (ftnlen)7);
		    do_fio(&c__1, (char *)&m1, (ftnlen)sizeof(doublereal));
		    e_wsfe();
		    s_wsle(&io___62);
		    do_lio(&c__9, &c__1, "            Element ", (ftnlen)20);
		    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			    integer));
		    do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
		    e_wsle();
		    s_wsfe(&io___63);
		    do_fio(&c__1, "             dyn.visc. =", (ftnlen)24);
		    do_fio(&c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal))
			    ;
		    do_fio(&c__1, "  , Re = ", (ftnlen)9);
		    do_fio(&c__1, (char *)&reynolds, (ftnlen)sizeof(
			    doublereal));
		    e_wsfe();
		    s_wsfe(&io___64);
		    do_fio(&c__1, "             PHI = ", (ftnlen)19);
		    do_fio(&c__1, (char *)&phi, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , ZETA = ", (ftnlen)10);
		    do_fio(&c__1, (char *)&zeta, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , ZETA_PHI = ", (ftnlen)14);
		    d__1 = phi * zeta;
		    do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
		    e_wsfe();
		    s_wsfe(&io___65);
		    do_fio(&c__1, "      Outlet node ", (ftnlen)18);
		    do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
		    do_fio(&c__1, " :   Tt2 = ", (ftnlen)11);
		    do_fio(&c__1, (char *)&tt2, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , Ts2 = ", (ftnlen)10);
		    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , Pt2 = ", (ftnlen)10);
		    do_fio(&c__1, (char *)&pt2, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , M2 = ", (ftnlen)9);
		    do_fio(&c__1, (char *)&m2, (ftnlen)sizeof(doublereal));
		    e_wsfe();
		}
	    } else {

/*     for branches */

		if (inv == 1) {
		    s_wsfe(&io___66);
		    do_fio(&c__1, "       Inlet node ", (ftnlen)18);
		    do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
		    do_fio(&c__1, " :    Tt1 = ", (ftnlen)12);
		    do_fio(&c__1, (char *)&tt1, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , Ts1 = ", (ftnlen)10);
		    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , Pt1 = ", (ftnlen)10);
		    do_fio(&c__1, (char *)&pt1, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , M1 = ", (ftnlen)9);
		    do_fio(&c__1, (char *)&m1, (ftnlen)sizeof(doublereal));
		    e_wsfe();
		    s_wsle(&io___67);
		    do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
		    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			    integer));
		    do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
		    e_wsle();
		    s_wsfe(&io___68);
		    do_fio(&c__1, "             dyn.visc. = ", (ftnlen)25);
		    do_fio(&c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal))
			    ;
		    do_fio(&c__1, " , Re = ", (ftnlen)8);
		    do_fio(&c__1, (char *)&reynolds, (ftnlen)sizeof(
			    doublereal));
		    e_wsfe();
		    s_wsfe(&io___69);
		    do_fio(&c__1, "             PHI = ", (ftnlen)19);
		    do_fio(&c__1, (char *)&phi, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , ZETA = ", (ftnlen)10);
		    do_fio(&c__1, (char *)&zeta, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , ZETA_PHI = ", (ftnlen)14);
		    d__1 = phi * zeta;
		    do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
		    e_wsfe();
		    s_wsfe(&io___70);
		    do_fio(&c__1, "      Outlet node ", (ftnlen)18);
		    do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
		    do_fio(&c__1, " :   Tt2 = ", (ftnlen)11);
		    do_fio(&c__1, (char *)&tt2, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , Ts2 = ", (ftnlen)10);
		    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , Pt2 = ", (ftnlen)10);
		    do_fio(&c__1, (char *)&pt2, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , M2 = ", (ftnlen)9);
		    do_fio(&c__1, (char *)&m2, (ftnlen)sizeof(doublereal));
		    e_wsfe();

		} else if (inv == -1) {
		    s_wsfe(&io___71);
		    do_fio(&c__1, "       Inlet node ", (ftnlen)18);
		    do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
		    do_fio(&c__1, " :    Tt1 = ", (ftnlen)12);
		    do_fio(&c__1, (char *)&tt1, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, ", Ts1 = ", (ftnlen)8);
		    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , Pt1 = ", (ftnlen)9);
		    do_fio(&c__1, (char *)&pt1, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , M1 = ", (ftnlen)9);
		    do_fio(&c__1, (char *)&m1, (ftnlen)sizeof(doublereal));
		    e_wsfe();
		    s_wsle(&io___72);
		    do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
		    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			    integer));
		    do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
		    e_wsle();
		    s_wsfe(&io___73);
		    do_fio(&c__1, "             dyn.visc. =", (ftnlen)24);
		    do_fio(&c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal))
			    ;
		    do_fio(&c__1, "  , Re = ", (ftnlen)9);
		    do_fio(&c__1, (char *)&reynolds, (ftnlen)sizeof(
			    doublereal));
		    e_wsfe();
		    s_wsfe(&io___74);
		    do_fio(&c__1, "             PHI = ", (ftnlen)19);
		    do_fio(&c__1, (char *)&phi, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , ZETA = ", (ftnlen)10);
		    do_fio(&c__1, (char *)&zeta, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , ZETA_PHI = ", (ftnlen)14);
		    d__1 = phi * zeta;
		    do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
		    e_wsfe();
		    s_wsfe(&io___75);
		    do_fio(&c__1, "      Outlet node ", (ftnlen)18);
		    do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
		    do_fio(&c__1, " :   Tt2 = ", (ftnlen)11);
		    do_fio(&c__1, (char *)&tt2, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , Ts2 = ", (ftnlen)10);
		    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , Pt2 = ", (ftnlen)10);
		    do_fio(&c__1, (char *)&pt2, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , M2 = ", (ftnlen)9);
		    do_fio(&c__1, (char *)&m2, (ftnlen)sizeof(doublereal));
		    e_wsfe();
		}
	    }

	}
    }


    *xflow /= *iaxial;
    df[3] *= *iaxial;

    return 0;
} /* restrictor_ */

