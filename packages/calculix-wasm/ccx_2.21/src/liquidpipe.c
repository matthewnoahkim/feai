/* liquidpipe.f -- translated by f2c (version 20200916).
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

static doublereal c_b5 = 1.3333333333333333;
static doublereal c_b9 = 2.;
static integer c__9 = 9;
static integer c__1 = 1;
static integer c__201 = 201;
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

/* Subroutine */ int liquidpipe_(integer *node1, integer *node2, integer *
	nodem, integer *nelem, char *lakon, integer *nactdog, logical *
	identity, integer *ielprop, doublereal *prop, integer *kflag, 
	doublereal *v, doublereal *xflow, doublereal *f, integer *nodef, 
	integer *idirf, doublereal *df, doublereal *rho, doublereal *g, 
	doublereal *co, doublereal *dvi, integer *numf, doublereal *vold, 
	integer *mi, integer *ipkon, integer *kon, char *set, doublereal *
	ttime, doublereal *time, integer *iaxial, integer *iplausi, ftnlen 
	lakon_len, ftnlen set_len)
{
    /* Initialized data */

    static integer ncoel = 11;
    static doublereal ybe[7] = { .21,.12,.1,.09,.09,.08,.2 };
    static doublereal zbe[7] = { .51,.32,.29,.26,.26,.17,.31 };
    static integer nen = 10;
    static doublereal xen[10] = { .1,.2,.3,.4,.5,.6,.7,.8,.9,1. };
    static doublereal yen[10] = { 232.,51.,18.8,9.6,5.26,3.08,1.88,1.17,.734,
	    .46 };
    static integer ngv = 8;
    static doublereal xgv[8] = { .125,.25,.375,.5,.625,.75,.875,1. };
    static doublereal ygv[8] = { 98.,17.,5.52,2.,.81,.26,.15,.12 };
    static doublereal xcoel[11] = { 0.,.1,.2,.3,.4,.5,.6,.7,.8,.9,1. };
    static doublereal yco[11] = { .5,.46,.41,.36,.3,.24,.18,.12,.06,.02,0. };
    static doublereal yel[11] = { 1.,.81,.64,.49,.36,.25,.16,.09,.04,.01,0. };
    static integer ndi = 10;
    static doublereal xdi[10] = { .1,.2,.3,.4,.5,.6,.7,.8,.9,1. };
    static doublereal ydi[10] = { 226.,47.5,17.5,7.8,3.75,1.8,.8,.29,.06,0. };
    static integer nbe = 7;
    static doublereal xbe[7] = { 1.,1.5,2.,3.,4.,6.,10. };

    /* Format strings */
    static char fmt_55[] = "(1x,a,i6,a,i6,a,e11.4,a,e11.4,a)";
    static char fmt_57[] = "(1x,a,e11.4,a,e11.4,a,e11.4,a)";
    static char fmt_56[] = "(1x,a,i6,a,e11.4,a,e11.4,a)";
    static char fmt_58[] = "(1x,a,e11.4,a,e11.4)";
    static char fmt_59[] = "(1x,a,e11.4,a,e11.4,a,e11.4)";

    /* System generated locals */
    integer v_dim1, v_offset, vold_dim1, vold_offset;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double atan(doublereal);
    integer s_cmp(char *, char *, ftnlen, ftnlen), i_dnnt(doublereal *);
    double sqrt(doublereal), pow_dd(doublereal *, doublereal *), d_lg10(
	    doublereal *);
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void), s_wsfe(cilist *), do_fio(integer *, char *, ftnlen),
	     e_wsfe(void);

    /* Local variables */
    doublereal friction, reynolds, a, d__, r__, t;
    extern /* Subroutine */ int zeta_calc__(integer *, doublereal *, integer *
	    , char *, doublereal *, doublereal *, integer *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, integer *, 
	    integer *, ftnlen);
    doublereal form_fact__, a0, a1, a2, k1, p1, p2, r1, r2, u1, z1, z2, 
	    xflow_vol__, dg, dh;
    integer id;
    doublereal dl, rd, pi, rh, kr, ui, xk, un, xn, r1d, r2d, c1u, c2u, xk1;
    integer isothermal;
    doublereal xk2, coarseness;
    integer nelemswirl;
    doublereal eta, ciu;
    integer inv;
    doublereal xkn, xkp, xks, dzetadalpha, dkda;
    logical flowunknown;
    doublereal zeta;
    extern /* Subroutine */ int exit_(integer *), friction_coefficient__(
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *);
    doublereal alpha;
    integer nodea, nodeb;
    doublereal omega, kappa;
    extern /* Subroutine */ int ident_(doublereal *, doublereal *, integer *, 
	    integer *);
    integer index;
    doublereal ratio, radius, cinput, t_chang__;

    /* Fortran I/O blocks */
    static cilist io___54 = { 0, 6, 0, 0, 0 };
    static cilist io___55 = { 0, 6, 0, 0, 0 };
    static cilist io___56 = { 0, 6, 0, 0, 0 };
    static cilist io___57 = { 0, 6, 0, 0, 0 };
    static cilist io___58 = { 0, 6, 0, 0, 0 };
    static cilist io___59 = { 0, 6, 0, 0, 0 };
    static cilist io___60 = { 0, 6, 0, 0, 0 };
    static cilist io___61 = { 0, 6, 0, 0, 0 };
    static cilist io___62 = { 0, 6, 0, 0, 0 };
    static cilist io___67 = { 0, 6, 0, 0, 0 };
    static cilist io___68 = { 0, 6, 0, 0, 0 };
    static cilist io___69 = { 0, 6, 0, 0, 0 };
    static cilist io___70 = { 0, 6, 0, 0, 0 };
    static cilist io___71 = { 0, 6, 0, 0, 0 };
    static cilist io___72 = { 0, 6, 0, 0, 0 };
    static cilist io___91 = { 0, 6, 0, 0, 0 };
    static cilist io___92 = { 0, 6, 0, 0, 0 };
    static cilist io___93 = { 0, 6, 0, 0, 0 };
    static cilist io___94 = { 0, 6, 0, 0, 0 };
    static cilist io___97 = { 0, 1, 0, 0, 0 };
    static cilist io___98 = { 0, 1, 0, fmt_55, 0 };
    static cilist io___99 = { 0, 1, 0, fmt_57, 0 };
    static cilist io___100 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___101 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___102 = { 0, 1, 0, 0, 0 };
    static cilist io___103 = { 0, 1, 0, fmt_58, 0 };
    static cilist io___104 = { 0, 1, 0, 0, 0 };
    static cilist io___105 = { 0, 1, 0, fmt_58, 0 };
    static cilist io___106 = { 0, 1, 0, 0, 0 };
    static cilist io___107 = { 0, 1, 0, fmt_59, 0 };
    static cilist io___108 = { 0, 1, 0, 0, 0 };
    static cilist io___109 = { 0, 1, 0, 0, 0 };
    static cilist io___110 = { 0, 1, 0, 0, 0 };
    static cilist io___111 = { 0, 1, 0, fmt_58, 0 };
    static cilist io___112 = { 0, 1, 0, 0, 0 };
    static cilist io___113 = { 0, 1, 0, fmt_58, 0 };
    static cilist io___114 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___115 = { 0, 1, 0, fmt_56, 0 };



/*     pipe element for incompressible media */

/*     kflag=0: check whether element equation is needed */
/*     kflag=1: calculate mass flow */
/*     kflag=2: calculate residual and derivative w.r.t.independent */
/*              variables */
/*     kflag=3: output */







    /* Parameter adjustments */
    lakon -= 8;
    nactdog -= 4;
    --ielprop;
    --prop;
    --nodef;
    --idirf;
    --df;
    --g;
    co -= 4;
    --mi;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;
    v_dim1 = mi[2] - 0 + 1;
    v_offset = 0 + v_dim1;
    v -= v_offset;
    --ipkon;
    --kon;
    set -= 81;

    /* Function Body */





    *numf = 4;

    pi = atan(1.) * 4.;
    dkda = 0.;

    if (*kflag == 0) {
	*identity = TRUE_;

	if (nactdog[(*node1 << 2) + 2] != 0) {
	    *identity = FALSE_;
	} else if (nactdog[(*node2 << 2) + 2] != 0) {
	    *identity = FALSE_;
	} else if (nactdog[(*nodem << 2) + 1] != 0) {
	    *identity = FALSE_;
	} else if (nactdog[(*nodem << 2) + 3] != 0) {
	    *identity = FALSE_;
	}

    } else if (*kflag == 1 || *kflag == 2 || *kflag == 3) {
	if (*kflag == 1) {
	    if (v[*nodem * v_dim1 + 1] != 0.) {
		*xflow = v[*nodem * v_dim1 + 1];
		return 0;
	    }
	}

	index = ielprop[*nelem];

	p1 = v[*node1 * v_dim1 + 2];
	p2 = v[*node2 * v_dim1 + 2];

	z1 = -g[1] * co[*node1 * 3 + 1] - g[2] * co[*node1 * 3 + 2] - g[3] * 
		co[*node1 * 3 + 3];
	z2 = -g[1] * co[*node2 * 3 + 1] - g[2] * co[*node2 * 3 + 2] - g[3] * 
		co[*node2 * 3 + 3];

	t = v[*node1 * v_dim1];

	if (*kflag == 1) {
	    inv = 0;
	    if (nactdog[(*nodem << 2) + 1] != 0) {
		flowunknown = TRUE_;
	    } else {
		flowunknown = FALSE_;
		*xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    }
	} else {
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    if (*xflow >= 0.) {
		inv = 1;
	    } else {
		inv = -1;
	    }
	    nodef[1] = *node1;
	    nodef[2] = *nodem;
	    nodef[3] = *node2;
	    nodef[4] = *nodem;
	    idirf[1] = 2;
	    idirf[2] = 1;
	    idirf[3] = 2;
	    idirf[4] = 3;
	}

	if (s_cmp(lakon + ((*nelem << 3) + 3), "BE", (ftnlen)2, (ftnlen)2) != 
		0 && s_cmp(lakon + ((*nelem << 3) + 5), "MA", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     pipe, Manning (LIPIMA) */

	    if (*(unsigned char *)&lakon[(*nelem << 3) + 7] == 'F') {
		nodea = i_dnnt(&prop[index + 1]);
		nodeb = i_dnnt(&prop[index + 2]);
		xn = prop[index + 3];
/* Computing 2nd power */
		d__1 = co[nodeb * 3 + 1] + vold[nodeb * vold_dim1 + 1] - co[
			nodea * 3 + 1] - vold[nodea * vold_dim1 + 1];
/* Computing 2nd power */
		d__2 = co[nodeb * 3 + 2] + vold[nodeb * vold_dim1 + 2] - co[
			nodea * 3 + 2] - vold[nodea * vold_dim1 + 2];
/* Computing 2nd power */
		d__3 = co[nodeb * 3 + 3] + vold[nodeb * vold_dim1 + 3] - co[
			nodea * 3 + 3] - vold[nodea * vold_dim1 + 3];
		radius = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);
		a = pi * radius * radius;
		rh = radius / 2.;
	    } else {
		a = prop[index + 1];
		rh = prop[index + 2];
	    }
	    reynolds = *xflow * 4. * rh / (*dvi * a);
	    xn = prop[index + 3];
	    a1 = a;
	    a2 = a;
/* Computing 2nd power */
	    d__1 = co[*node2 * 3 + 1] - co[*node1 * 3 + 1];
/* Computing 2nd power */
	    d__2 = co[*node2 * 3 + 2] - co[*node1 * 3 + 2];
/* Computing 2nd power */
	    d__3 = co[*node2 * 3 + 3] - co[*node1 * 3 + 3];
	    dl = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);
	    dg = sqrt(g[1] * g[1] + g[2] * g[2] + g[3] * g[3]);
	    if (inv != 0) {
		xk = xn * 2. * xn * dl * dg / (a * a * pow_dd(&rh, &c_b5));
	    } else {
		xkn = xn * 2. * xn * dl * dg / (a * a * pow_dd(&rh, &c_b5));
		xkp = xkn;
	    }
	} else if (s_cmp(lakon + ((*nelem << 3) + 5), "WC", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     pipe, White-Colebrook */

	    if (*(unsigned char *)&lakon[(*nelem << 3) + 7] == 'F') {
		nodea = i_dnnt(&prop[index + 1]);
		nodeb = i_dnnt(&prop[index + 2]);
		xn = prop[index + 3];
/* Computing 2nd power */
		d__1 = co[nodeb * 3 + 1] + vold[nodeb * vold_dim1 + 1] - co[
			nodea * 3 + 1] - vold[nodea * vold_dim1 + 1];
/* Computing 2nd power */
		d__2 = co[nodeb * 3 + 2] + vold[nodeb * vold_dim1 + 2] - co[
			nodea * 3 + 2] - vold[nodea * vold_dim1 + 2];
/* Computing 2nd power */
		d__3 = co[nodeb * 3 + 3] + vold[nodeb * vold_dim1 + 3] - co[
			nodea * 3 + 3] - vold[nodea * vold_dim1 + 3];
		radius = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);
		a = pi * radius * radius;
		d__ = radius * 2.;
	    } else {
		a = prop[index + 1];
		d__ = prop[index + 2];
	    }
	    dl = prop[index + 3];
	    if (dl <= 0.) {
/* Computing 2nd power */
		d__1 = co[*node2 * 3 + 1] - co[*node1 * 3 + 1];
/* Computing 2nd power */
		d__2 = co[*node2 * 3 + 2] - co[*node1 * 3 + 2];
/* Computing 2nd power */
		d__3 = co[*node2 * 3 + 3] - co[*node1 * 3 + 3];
		dl = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);
	    }
	    xks = prop[index + 4];
	    form_fact__ = prop[index + 5];
	    a1 = a;
	    a2 = a;
	    if (*kflag == 1) {

/*              assuming large reynolds number */

		d__2 = xks / (d__ * 3.7);
		d__1 = d_lg10(&d__2) * 2.03;
		friction = 1. / pow_dd(&d__1, &c_b9);
	    } else {

/*              solving the implicit White-Colebrook equation */

		reynolds = *xflow * d__ / (a * *dvi);
		friction_coefficient__(&dl, &d__, &xks, &reynolds, &
			form_fact__, &friction);
	    }
	    if (inv != 0) {
		xk = friction * dl / (d__ * a * a);
		dkda = xk * -2.5 / a;
	    } else {
		xkn = friction * dl / (d__ * a * a);
		xkp = xkn;
	    }
	} else if (s_cmp(lakon + ((*nelem << 3) + 5), "EL", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     pipe, sudden enlargement Berlamont version: fully turbulent */
/*     all section ratios */

	    a1 = prop[index + 1];
	    a2 = prop[index + 2];
	    dh = sqrt(a1 * 4 / pi);
	    if (inv == 0) {
		reynolds = 5e3;
	    } else {
		reynolds = *xflow * dh / (*dvi * a1);
	    }
	    ratio = a1 / a2;
	    ident_(xcoel, &ratio, &ncoel, &id);
	    if (inv >= 0) {
		if (id == 0) {
		    zeta = yel[0];
		} else if (id == ncoel) {
		    zeta = yel[ncoel - 1];
		} else {
		    zeta = yel[id - 1] + (yel[id] - yel[id - 1]) * (ratio - 
			    xcoel[id - 1]) / (xcoel[id] - xcoel[id - 1]);
		}
		if (inv != 0) {
		    xk = zeta / (a1 * a1);
		} else {
		    xkp = zeta / (a1 * a1);
		}
	    }
	    if (inv <= 0) {
		if (id == 0) {
		    zeta = yco[0];
		} else if (id == ncoel) {
		    zeta = yco[ncoel - 1];
		} else {
		    zeta = yco[id - 1] + (yco[id] - yco[id - 1]) * (ratio - 
			    xcoel[id - 1]) / (xcoel[id] - xcoel[id - 1]);
		}
		if (inv != 0) {
		    xk = zeta / (a1 * a1);
		} else {
		    xkn = zeta / (a1 * a1);
		}
	    }
	} else if (s_cmp(lakon + ((*nelem << 3) + 3), "EL", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     pipe, sudden enlargement Idelchik version: reynolds dependent, */
/*     0.01 <= section ratio <= 0.6 */

	    a1 = prop[index + 1];
	    a2 = prop[index + 2];
	    dh = prop[index + 3];
	    if (dh == 0.) {
		dh = sqrt(a1 * 4 / pi);
	    }
	    if (inv == 0) {
		reynolds = 5e3;
	    } else {
		reynolds = *xflow * dh / (*dvi * a1);
	    }
	    if (inv >= 0) {
		zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &
			reynolds, &zeta, &isothermal, &kon[1], &ipkon[1], &
			r__, &kappa, &v[v_offset], &mi[1], iaxial, (ftnlen)8);
		if (inv != 0) {
		    xk = zeta / (a1 * a1);
		} else {
		    xkp = zeta / (a1 * a1);
		}
	    }
	    if (inv <= 0) {
		reynolds = -reynolds;

/*              setting length and angle for contraction to zero */

		prop[index + 4] = 0.;
		prop[index + 5] = 0.;
		s_copy(lakon + ((*nelem << 3) + 3), "CO", (ftnlen)2, (ftnlen)
			2);
		zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &
			reynolds, &zeta, &isothermal, &kon[1], &ipkon[1], &
			r__, &kappa, &v[v_offset], &mi[1], iaxial, (ftnlen)8);
		s_copy(lakon + ((*nelem << 3) + 3), "EL", (ftnlen)2, (ftnlen)
			2);
		if (inv != 0) {
		    xk = zeta / (a1 * a1);
		} else {
		    xkn = zeta / (a1 * a1);
		}
	    }
	} else if (s_cmp(lakon + ((*nelem << 3) + 5), "CO", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     pipe, sudden contraction Berlamont version: fully turbulent */
/*     all section ratios */

	    a1 = prop[index + 1];
	    a2 = prop[index + 2];
	    dh = sqrt(a2 * 4 / pi);
	    if (inv == 0) {
		reynolds = 5e3;
	    } else {
		reynolds = *xflow * dh / (*dvi * a2);
	    }
	    ratio = a2 / a1;
	    ident_(xcoel, &ratio, &ncoel, &id);
	    if (inv >= 0) {
		if (id == 0) {
		    zeta = yco[0];
		} else if (id == ncoel) {
		    zeta = yco[ncoel - 1];
		} else {
		    zeta = yco[id - 1] + (yco[id] - yco[id - 1]) * (ratio - 
			    xcoel[id - 1]) / (xcoel[id] - xcoel[id - 1]);
		}
		if (inv != 0) {
		    xk = zeta / (a2 * a2);
		} else {
		    xkp = zeta / (a2 * a2);
		}
	    }
	    if (inv <= 0) {
		if (id == 0) {
		    zeta = yel[0];
		} else if (id == ncoel) {
		    zeta = yel[ncoel - 1];
		} else {
		    zeta = yel[id - 1] + (yel[id] - yel[id - 1]) * (ratio - 
			    xcoel[id - 1]) / (xcoel[id] - xcoel[id - 1]);
		}
		if (inv != 0) {
		    xk = zeta / (a2 * a2);
		} else {
		    xkn = zeta / (a2 * a2);
		}
	    }
	} else if (s_cmp(lakon + ((*nelem << 3) + 3), "CO", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     pipe, sudden contraction Idelchik version: reynolds dependent, */
/*     0.1 <= section ratio <= 0.6 */

	    a1 = prop[index + 1];
	    a2 = prop[index + 2];
	    dh = prop[index + 3];
	    if (dh == 0.) {
		dh = sqrt(a2 * 4 / pi);
	    }
	    if (inv == 0) {
		reynolds = 5e3;
	    } else {
		reynolds = *xflow * dh / (*dvi * a2);
	    }
	    if (inv >= 0) {
		zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &
			reynolds, &zeta, &isothermal, &kon[1], &ipkon[1], &
			r__, &kappa, &v[v_offset], &mi[1], iaxial, (ftnlen)8);
		if (inv != 0) {
		    xk = zeta / (a2 * a2);
		} else {
		    xkp = zeta / (a2 * a2);
		}
	    }
	    if (inv <= 0) {
		reynolds = -reynolds;
		s_copy(lakon + ((*nelem << 3) + 3), "EL", (ftnlen)2, (ftnlen)
			2);
		zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &
			reynolds, &zeta, &isothermal, &kon[1], &ipkon[1], &
			r__, &kappa, &v[v_offset], &mi[1], iaxial, (ftnlen)8);
		s_copy(lakon + ((*nelem << 3) + 3), "CO", (ftnlen)2, (ftnlen)
			2);
		if (inv != 0) {
		    xk = zeta / (a2 * a2);
		} else {
		    xkn = zeta / (a2 * a2);
		}
	    }
	} else if (s_cmp(lakon + ((*nelem << 3) + 5), "DI", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     pipe, diaphragm */

	    a = prop[index + 1];
	    a0 = prop[index + 2];
	    a1 = a;
	    a2 = a;
	    dh = sqrt(a1 * 4 / pi);
	    if (inv == 0) {
		reynolds = 5e3;
	    } else {
		reynolds = *xflow * dh / (*dvi * a1);
	    }
	    ratio = a0 / a;
	    ident_(xdi, &ratio, &ndi, &id);
	    if (id == 0) {
		zeta = ydi[0];
	    } else if (id == ndi) {
		zeta = ydi[ndi - 1];
	    } else {
		zeta = ydi[id - 1] + (ydi[id] - ydi[id - 1]) * (ratio - xdi[
			id - 1]) / (xdi[id] - xdi[id - 1]);
	    }
	    if (inv != 0) {
		xk = zeta / (a * a);
	    } else {
		xkn = zeta / (a * a);
		xkp = xkn;
	    }
	} else if (s_cmp(lakon + ((*nelem << 3) + 5), "EN", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     pipe, entrance (Berlamont data) */

	    a = prop[index + 1];
	    a0 = prop[index + 2];
	    a1 = a * 1e10;
	    a2 = a;
	    dh = sqrt(a2 * 4 / pi);
	    if (inv == 0) {
		reynolds = 5e3;
	    } else {
		reynolds = abs(*xflow) * dh / (*dvi * a2);
	    }
	    ratio = a0 / a;
	    ident_(xen, &ratio, &nen, &id);
	    if (id == 0) {
		zeta = yen[0];
	    } else if (id == nen) {
		zeta = yen[nen - 1];
	    } else {
		zeta = yen[id - 1] + (yen[id] - yen[id - 1]) * (ratio - xen[
			id - 1]) / (xen[id] - xen[id - 1]);
	    }
	    if (inv != 0) {
		if (inv > 0) {
/*                 entrance */
		    xk = zeta / (a * a);
		} else {
/*                 exit */
		    xk = 1. / (a * a);
		}
	    } else {
		xkn = 1. / (a * a);
		xkp = zeta / (a * a);
	    }
	} else if (s_cmp(lakon + ((*nelem << 3) + 3), "EN", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     pipe, entrance (Idelchik) */

	    a1 = prop[index + 1];
	    a2 = prop[index + 2];
	    zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &reynolds, &
		    zeta, &isothermal, &kon[1], &ipkon[1], &r__, &kappa, &v[
		    v_offset], &mi[1], iaxial, (ftnlen)8);

/*           check for negative flow: in that case the loss */
/*           coefficient is wrong */

	    if (inv < 0) {
		s_wsle(&io___54);
		do_lio(&c__9, &c__1, "*ERROR in liquidpipe: loss coefficients"
			, (ftnlen)39);
		e_wsle();
		s_wsle(&io___55);
		do_lio(&c__9, &c__1, "       for entrance (Idelchik) do not "
			"apply", (ftnlen)43);
		e_wsle();
		s_wsle(&io___56);
		do_lio(&c__9, &c__1, "       to reversed flow", (ftnlen)23);
		e_wsle();
		exit_(&c__201);
	    }

	    dh = prop[index + 3];
	    if (dh == 0.) {
		dh = sqrt(a2 * 4 / pi);
	    }
	    if (inv == 0) {
		reynolds = 5e3;
	    } else {
		reynolds = abs(*xflow) * dh / (*dvi * a2);
	    }

	    if (inv != 0) {
		xk = zeta / (a2 * a2);
	    } else {
		xkn = zeta / (a2 * a2);
		xkp = xkn;
	    }
	} else if (s_cmp(lakon + ((*nelem << 3) + 3), "EX", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     pipe, exit (Idelchik) */

	    a1 = prop[index + 1];
	    a2 = prop[index + 2];
	    zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &reynolds, &
		    zeta, &isothermal, &kon[1], &ipkon[1], &r__, &kappa, &v[
		    v_offset], &mi[1], iaxial, (ftnlen)8);
	    if (inv < 0) {
		s_wsle(&io___57);
		do_lio(&c__9, &c__1, "*ERROR in liquidpipe: loss coefficients"
			, (ftnlen)39);
		e_wsle();
		s_wsle(&io___58);
		do_lio(&c__9, &c__1, "       for exit (Idelchik) do not appl"
			"y to", (ftnlen)42);
		e_wsle();
		s_wsle(&io___59);
		do_lio(&c__9, &c__1, "       reversed flow", (ftnlen)20);
		e_wsle();
		exit_(&c__201);
	    }

	    dh = prop[index + 3];
	    if (dh == 0.) {
		dh = sqrt(a1 * 4 / pi);
	    }
	    if (inv == 0) {
		reynolds = 5e3;
	    } else {
		reynolds = abs(*xflow) * dh / (*dvi * a1);
	    }

	    if (inv != 0) {
		xk = zeta / (a1 * a1);
	    } else {
		xkn = zeta / (a1 * a1);
		xkp = xkn;
	    }
	} else if (s_cmp(lakon + ((*nelem << 3) + 3), "US", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     pipe, user defined loss coefficient */

	    a1 = prop[index + 1];
	    a2 = prop[index + 2];
	    zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &reynolds, &
		    zeta, &isothermal, &kon[1], &ipkon[1], &r__, &kappa, &v[
		    v_offset], &mi[1], iaxial, (ftnlen)8);
	    if (inv < 0) {
		s_wsle(&io___60);
		do_lio(&c__9, &c__1, "*ERROR in liquidpipe: loss coefficients"
			, (ftnlen)39);
		e_wsle();
		s_wsle(&io___61);
		do_lio(&c__9, &c__1, "       for a user element do not apply"
			" to", (ftnlen)41);
		e_wsle();
		s_wsle(&io___62);
		do_lio(&c__9, &c__1, "       reversed flow", (ftnlen)20);
		e_wsle();
		exit_(&c__201);
	    }
	    if (a1 < a2) {
		a = a1;
		a2 = a1;
	    } else {
		a = a2;
		a1 = a2;
	    }

	    dh = prop[index + 3];
	    if (dh == 0.) {
		dh = sqrt(a * 4 / pi);
	    }
	    if (inv == 0) {
		reynolds = 5e3;
	    } else {
		reynolds = abs(*xflow) * dh / (*dvi * a);
	    }

	    if (inv != 0) {
		xk = zeta / (a * a);
	    } else {
		xkn = zeta / (a * a);
		xkp = xkn;
	    }
	} else if (s_cmp(lakon + ((*nelem << 3) + 5), "GV", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     pipe, gate valve (Berlamont) */

	    a = prop[index + 1];
	    if (nactdog[(*nodem << 2) + 3] == 0) {
/*              geometry is fixed */
		alpha = prop[index + 2];
	    } else {
/*              geometry is unknown */
		alpha = v[*nodem * v_dim1 + 3];
	    }
	    a1 = a;
	    a2 = a;
	    dh = sqrt(a1 * 4 / pi);
	    if (inv == 0) {
		reynolds = 5e3;
	    } else {
		reynolds = *xflow * dh / (*dvi * a1);
	    }
	    dzetadalpha = 0.;
	    ident_(xgv, &alpha, &ngv, &id);
	    if (id == 0) {
		zeta = ygv[0];
	    } else if (id == ngv) {
		zeta = ygv[ngv - 1];
	    } else {
		dzetadalpha = (ygv[id] - ygv[id - 1]) / (xgv[id] - xgv[id - 1]
			);
		zeta = ygv[id - 1] + dzetadalpha * (alpha - xgv[id - 1]);
	    }
	    if (inv != 0) {
		xk = zeta / (a * a);
		dkda = dzetadalpha / (a * a);
	    } else {
		if (flowunknown) {
		    xkn = zeta / (a * a);
		    xkp = xkn;
		}
	    }
	} else if (s_cmp(lakon + ((*nelem << 3) + 5), "BE", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     pipe, bend; values from Berlamont */

	    a = prop[index + 1];
	    rd = prop[index + 2];
	    alpha = prop[index + 3];
	    coarseness = prop[index + 4];
	    a1 = a;
	    a2 = a;
	    dh = sqrt(a1 * 4 / pi);
	    if (inv == 0) {
		reynolds = 5e3;
	    } else {
		reynolds = *xflow * dh / (*dvi * a1);
	    }
	    ident_(xbe, &rd, &nbe, &id);
	    if (id == 0) {
		zeta = ybe[0] + (zbe[0] - ybe[0]) * coarseness;
	    } else if (id == nbe) {
		zeta = ybe[nbe - 1] + (zbe[nbe - 1] - ybe[nbe - 1]) * 
			coarseness;
	    } else {
		zeta = (1. - coarseness) * (ybe[id - 1] + (ybe[id] - ybe[id - 
			1]) * (rd - xbe[id - 1]) / (xbe[id] - xbe[id - 1])) + 
			coarseness * (zbe[id - 1] + (zbe[id] - zbe[id - 1]) * 
			(rd - xbe[id - 1]) / (xbe[id] - xbe[id - 1]));
	    }
	    zeta = zeta * alpha / 90.;
	    if (inv != 0) {
		xk = zeta / (a * a);
	    } else {
		xkn = zeta / (a * a);
		xkp = xkn;
	    }
	} else if (s_cmp(lakon + ((*nelem << 3) + 3), "BE", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     pipe, bend; values from Idelchik or Miller, OWN */

	    a = prop[index + 1];
	    dh = prop[index + 3];
	    if (dh == 0.) {
		dh = sqrt(a * 4 / pi);
	    }
	    if (inv == 0) {
		reynolds = 5e3;
	    } else {
		reynolds = abs(*xflow) * dh / (*dvi * a);
	    }
	    zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &reynolds, &
		    zeta, &isothermal, &kon[1], &ipkon[1], &r__, &kappa, &v[
		    v_offset], &mi[1], iaxial, (ftnlen)8);
	    if (inv != 0) {
		xk = zeta / (a * a);
	    } else {
		xkn = zeta / (a * a);
		xkp = xkn;
	    }
	    a1 = a;
	    a2 = a;
	} else if (s_cmp(lakon + ((*nelem << 3) + 3), "LO", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     long orifice; values from Idelchik or Lichtarowicz */

	    a1 = prop[index + 1];
	    dh = prop[index + 3];
	    if (inv == 0) {
		reynolds = 5e3;
	    } else {
		reynolds = abs(*xflow) * dh / (*dvi * a1);
	    }
	    zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &reynolds, &
		    zeta, &isothermal, &kon[1], &ipkon[1], &r__, &kappa, &v[
		    v_offset], &mi[1], iaxial, (ftnlen)8);
	    if (inv != 0) {
		xk = zeta / (a1 * a1);
	    } else {
		xkn = zeta / (a1 * a1);
		xkp = xkn;
	    }
	    a2 = a1;
	} else if (s_cmp(lakon + ((*nelem << 3) + 3), "WA", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     wall orifice; values from Idelchik */

/*           entrance is infinitely large */

	    a1 = prop[index + 1] * 1e10;

/*           reduced cross section */

	    a2 = prop[index + 2];
	    dh = prop[index + 3];
	    if (inv == 0) {
		reynolds = 5e3;
	    } else {
		reynolds = abs(*xflow) * dh / (*dvi * a2);
	    }
	    zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &reynolds, &
		    zeta, &isothermal, &kon[1], &ipkon[1], &r__, &kappa, &v[
		    v_offset], &mi[1], iaxial, (ftnlen)8);

/*           check for negative flow: in that case the loss */
/*           coefficient is wrong */

	    if (inv < 0) {
		s_wsle(&io___67);
		do_lio(&c__9, &c__1, "*ERROR in liquidpipe: loss coefficients"
			, (ftnlen)39);
		e_wsle();
		s_wsle(&io___68);
		do_lio(&c__9, &c__1, "       for wall orifice do not apply to"
			, (ftnlen)39);
		e_wsle();
		s_wsle(&io___69);
		do_lio(&c__9, &c__1, "       reversed flow", (ftnlen)20);
		e_wsle();
		exit_(&c__201);
	    }
	    if (inv != 0) {
		xk = zeta / (a2 * a2);
	    } else {
		xkn = zeta / (a2 * a2);
		xkp = xkn;
	    }
	} else if (s_cmp(lakon + ((*nelem << 3) + 3), "BR", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     branches (joints and splits); values from Idelchik and GE */

	    if (*nelem == i_dnnt(&prop[index + 2])) {
		a = prop[index + 5];
	    } else {
		a = prop[index + 6];
	    }
	    a1 = a;
	    a2 = a;

/*           check for negative flow: in that case the loss */
/*           coefficient is wroing */

	    if (inv < 0) {
		s_wsle(&io___70);
		do_lio(&c__9, &c__1, "*ERROR in liquidpipe: loss coefficients"
			, (ftnlen)39);
		e_wsle();
		s_wsle(&io___71);
		do_lio(&c__9, &c__1, "       for branches do not apply to", (
			ftnlen)35);
		e_wsle();
		s_wsle(&io___72);
		do_lio(&c__9, &c__1, "       reversed flow", (ftnlen)20);
		e_wsle();
		exit_(&c__201);
	    }
	    if (inv != 0) {
		zeta_calc__(nelem, &prop[1], &ielprop[1], lakon + 8, &
			reynolds, &zeta, &isothermal, &kon[1], &ipkon[1], &
			r__, &kappa, &v[v_offset], &mi[1], iaxial, (ftnlen)8);
		xk = zeta / (a * a);
	    } else {

/*              here, the flow is unknown. To this end zeta is needed. However, */
/*              zeta depends on the flow: circular argument. Therefore a */
/*              fixed initial value for zeta is taken */

		zeta = .5;
		xkn = zeta / (a * a);
		xkp = xkn;
	    }

/*     all types of orifices */

	} else if (s_cmp(lakon + ((*nelem << 3) + 3), "C1", (ftnlen)2, (
		ftnlen)2) == 0) {
	    a1 = prop[index + 1];
	    a2 = a1;
	    dh = prop[index + 2];
	    if (inv == 0) {
		reynolds = 5e3;
	    } else {
		reynolds = abs(*xflow) * dh / (*dvi * a1);
	    }
	    zeta = 1.;

	    a = a1;
/* Computing 2nd power */
	    d__1 = zeta;
	    zeta = 1 / (d__1 * d__1);
	    if (inv != 0) {
		xk = zeta / (a * a);
	    } else {
		xkn = zeta / (a * a);
		xkp = xkn;
	    }

/*     all types of vorticies */

	} else if (*(unsigned char *)&lakon[(*nelem << 3) + 3] == 'V') {

/*     radius downstream */
	    r2d = prop[index + 1];

/*     radius upstream */
	    r1d = prop[index + 2];

/*     pressure correction factor */
	    eta = prop[index + 3];

	    if (*xflow > 0. && r2d > r1d || r2d < r1d && *xflow < 0.) {
		inv = 1;
		p1 = v[*node1 * v_dim1 + 2];
		p2 = v[*node2 * v_dim1 + 2];
		r1 = r1d;
		r2 = r2d;

	    } else if (*xflow > 0. && r2d < r1d || r2d > r1d && *xflow < 0.) {
		inv = -1;
		r1 = r2d;
		r2 = r1d;
		p1 = v[*node2 * v_dim1 + 2];
		p2 = v[*node1 * v_dim1 + 2];
		*xflow = -v[*nodem * v_dim1 + 1] * *iaxial;

		nodef[1] = *node2;
		nodef[2] = *nodem;
		nodef[3] = *node1;

	    }

	    idirf[1] = 2;
	    idirf[2] = 1;
	    idirf[3] = 2;

/*     FREE VORTEX */

	    if (s_cmp(lakon + ((*nelem << 3) + 3), "VF", (ftnlen)2, (ftnlen)2)
		     == 0) {
/*     rotation induced loss (correction factor) */
		k1 = prop[index + 4];

/*     tangential velocity of the disk at vortex entry */
		u1 = prop[index + 5];

/*     number of the element generating the upstream swirl */
		nelemswirl = i_dnnt(&prop[index + 6]);

/*     rotation speed (revolution per minutes) */
		omega = prop[index + 7];

/*     Temperature change */
		t_chang__ = prop[index + 8];

		if (omega > 0.) {

/*     rotation speed is given if the swirl comes from a rotating part */
/*     typically the blade of a coverplate */

/*     C_u is given by radius r1d (see definition of the flow direction) */
/*     C_u related to radius r2d is a function of r1d */

		    if (inv > 0) {
			c1u = omega * r1;

/*     flow rotation at outlet */
			c2u = c1u * r1 / r2;

		    } else if (inv < 0) {
			c2u = omega * r2;

			c1u = c2u * r2 / r1;
		    }

		} else if (nelemswirl > 0) {
		    if (s_cmp(lakon + ((nelemswirl << 3) + 1), "LPPN", (
			    ftnlen)4, (ftnlen)4) == 0) {
			cinput = prop[ielprop[nelemswirl] + 5];
		    } else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "LPVF", 
			    (ftnlen)4, (ftnlen)4) == 0) {
			cinput = prop[ielprop[nelemswirl] + 9];
		    } else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "LPFS", 
			    (ftnlen)4, (ftnlen)4) == 0) {
			cinput = prop[ielprop[nelemswirl] + 7];
		    }

		    cinput = u1 + k1 * (cinput - u1);

		    if (inv > 0) {
			c1u = cinput;
			c2u = c1u * r1 / r2;
		    } else if (inv < 0) {
			c2u = cinput;
			c1u = c2u * r2 / r1;
		    }
		}
/*     storing the tengential velocity for later use (wirbel cascade) */
		if (inv > 0) {
		    prop[index + 9] = c2u;
		} else if (inv < 0) {
		    prop[index + 9] = c1u;
		}

/*    inner rotation */

		if (r1 < r2) {
		    ciu = c1u;
		} else if (r1 >= r2) {
		    ciu = c2u;
		}

/*               if (kflag.eq.1) then */
		a1 = 1e-6;
		a2 = a1;
		if (inv != 0) {
/* Computing 2nd power */
		    d__1 = ciu;
/* Computing 2nd power */
		    d__2 = r1 / r2;
		    xkn = *rho / 2 * (d__1 * d__1) * (1 - d__2 * d__2);
		    xkp = xkn;
		} else {
/* Computing 2nd power */
		    d__1 = ciu;
/* Computing 2nd power */
		    d__2 = r1 / r2;
		    xkn = *rho / 2 * (d__1 * d__1) * (1 - d__2 * d__2);
		    xkp = xkn;
		}
	    }

/*     FORCED VORTEX */

	    if (s_cmp(lakon + ((*nelem << 3) + 3), "VS", (ftnlen)2, (ftnlen)2)
		     == 0) {

/*     core swirl ratio */
		kr = prop[index + 4];

/*     rotation speed (revolution per minutes) of the rotating part */
/*     responsible for the swirl */
		omega = prop[index + 5];

/*     Temperature change */
		t_chang__ = prop[index + 6];

		ui = omega * r1;
		c1u = ui * kr;
		c2u = c1u * r2 / r1;

/*     storing the tengential velocity for later use (wirbel cascade) */
		if (inv > 0) {
		    prop[index + 7] = c2u;
		} else if (inv < 0) {
		    prop[index + 7] = c1u;
		}

		a1 = 1e-6;
		a2 = a1;
		if (*kflag == 1) {
		    *xflow = .5;
		}

		if (inv != 0) {
/* Computing 2nd power */
		    d__1 = ui;
/* Computing 2nd power */
		    d__2 = r2 / r1;
		    xkn = *rho / 2 * (d__1 * d__1) * (d__2 * d__2 - 1);
		    xkp = xkn;
		} else {
/* Computing 2nd power */
		    d__1 = ui;
/* Computing 2nd power */
		    d__2 = r2 / r1;
		    xkn = *rho / 2 * (d__1 * d__1) * (d__2 * d__2 - 1);
		    xkp = xkn;
		}
	    }
	}

	if (*kflag == 1) {
	    if (flowunknown) {

		xk1 = 1. / (a1 * a1);
		xk2 = 1. / (a2 * a2);
		*xflow = (z1 - z2 + (p1 - p2) / *rho) / (xk2 - xk1 + xkp);
		if (*xflow < 0.) {
		    *xflow = (z1 - z2 + (p1 - p2) / *rho) / (xk2 - xk1 - xkn);
		    if (*xflow < 0.) {
			s_wsle(&io___91);
			do_lio(&c__9, &c__1, "*WARNING in liquidpipe:", (
				ftnlen)23);
			e_wsle();
			s_wsle(&io___92);
			do_lio(&c__9, &c__1, "         initial mass flow cou"
				"ld", (ftnlen)32);
			e_wsle();
			s_wsle(&io___93);
			do_lio(&c__9, &c__1, "         not be determined", (
				ftnlen)26);
			e_wsle();
			s_wsle(&io___94);
			do_lio(&c__9, &c__1, "         1.d-10 is taken", (
				ftnlen)24);
			e_wsle();
			*xflow = 1e-10;
		    } else {
			*xflow = -(*rho) * sqrt(*xflow * 2.);
		    }
		} else {
		    *xflow = *rho * sqrt(*xflow * 2.);
		}
	    } else {

/*              mass flow known, geometry unknown */

		if (s_cmp(lakon + ((*nelem << 3) + 5), "GV", (ftnlen)2, (
			ftnlen)2) == 0) {
		    prop[index + 2] = .5;
		}
	    }
	} else if (*kflag == 2) {
	    xk1 = 1. / (a1 * a1);
	    xk2 = 1. / (a2 * a2);

	    if (*(unsigned char *)&lakon[(*nelem << 3) + 3] != 'V') {

		*numf = 4;
		df[3] = 1. / *rho;
		df[1] = -df[3];
		df[2] = (xk2 - xk1 + inv * xk) * *xflow / (*rho * *rho);
		df[4] = *xflow * *xflow * inv * dkda / (*rho * 2. * *rho);
		*f = df[3] * p2 + df[1] * p1 + df[2] * *xflow / 2. + z2 - z1;

	    } else if (s_cmp(lakon + ((*nelem << 3) + 3), "VF", (ftnlen)2, (
		    ftnlen)2) == 0) {
		*numf = 3;
		if (r2 >= r1) {
		    *f = p1 - p2 + xkp;
		    df[1] = 1.;
		    df[2] = 0.;
		    df[3] = -1.;
		} else if (r2 < r1) {
		    *f = p1 - p2 - xkp;
		    df[1] = 1.;
		    df[2] = 0.;
		    df[3] = -1.;
		}
	    } else if (s_cmp(lakon + ((*nelem << 3) + 3), "VS", (ftnlen)2, (
		    ftnlen)2) == 0) {
		if (r2 >= r1 && *xflow > 0. || r2 < r1 && *xflow < 0.) {

		    *f = p1 - p2 + xkn;
/*     pressure node1 */
		    df[1] = 1.;
/*     massflow nodem */
		    df[2] = 0.;
/*     pressure node2 */
		    df[3] = -1.;

		} else if (r2 < r1 && *xflow > 0. || r2 > r1 && *xflow < 0.) {

		    *f = p2 - p1 + xkn;
/*     pressure node1 */
		    df[1] = -1.;
/*     massflow nodem */
		    df[2] = 0.;
/*     pressure node2 */
		    df[3] = 1.;
		}
	    }

	} else if (*kflag == 3) {
	    xflow_vol__ = *xflow / *rho;
	    un = *dvi / *rho;
	    if (inv == 1) {
		t = v[*node1 * v_dim1];
	    } else {
		t = v[*node2 * v_dim1];
	    }

	    s_wsle(&io___97);
	    do_lio(&c__9, &c__1, "", (ftnlen)0);
	    e_wsle();
	    s_wsfe(&io___98);
	    do_fio(&c__1, " from node", (ftnlen)10);
	    do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	    do_fio(&c__1, " to node", (ftnlen)8);
	    do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	    do_fio(&c__1, ":  massflow rate = ", (ftnlen)19);
	    do_fio(&c__1, (char *)&(*xflow), (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " i.e. in volume per time ", (ftnlen)25);
	    do_fio(&c__1, (char *)&xflow_vol__, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	    s_wsfe(&io___99);
	    do_fio(&c__1, "                                                R"
		    "ho=   ", (ftnlen)55);
	    do_fio(&c__1, (char *)&(*rho), (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", Nu=   ", (ftnlen)8);
	    do_fio(&c__1, (char *)&un, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", dyn.visc.=   ", (ftnlen)15);
	    do_fio(&c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    e_wsfe();

	    if (inv == 1) {
		s_wsfe(&io___100);
		do_fio(&c__1, "       Inlet node  ", (ftnlen)19);
		do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
		do_fio(&c__1, ":   T=", (ftnlen)6);
		do_fio(&c__1, (char *)&t, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, ", P=", (ftnlen)4);
		do_fio(&c__1, (char *)&p1, (ftnlen)sizeof(doublereal));
		e_wsfe();
	    } else if (inv == -1) {
		s_wsfe(&io___101);
		do_fio(&c__1, "       Inlet node  ", (ftnlen)19);
		do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
		do_fio(&c__1, ":   T=", (ftnlen)6);
		do_fio(&c__1, (char *)&t, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, ", P=", (ftnlen)4);
		do_fio(&c__1, (char *)&p2, (ftnlen)sizeof(doublereal));
		e_wsfe();
	    }

	    if (s_cmp(lakon + ((*nelem << 3) + 3), "EL", (ftnlen)2, (ftnlen)2)
		     == 0 || s_cmp(lakon + ((*nelem << 3) + 3), "CO", (ftnlen)
		    2, (ftnlen)2) == 0 || s_cmp(lakon + ((*nelem << 3) + 3), 
		    "EN", (ftnlen)2, (ftnlen)2) == 0 || s_cmp(lakon + ((*
		    nelem << 3) + 3), "EX", (ftnlen)2, (ftnlen)2) == 0 || 
		    s_cmp(lakon + ((*nelem << 3) + 3), "US", (ftnlen)2, (
		    ftnlen)2) == 0 || s_cmp(lakon + ((*nelem << 3) + 3), 
		    "BE", (ftnlen)2, (ftnlen)2) == 0 || s_cmp(lakon + ((*
		    nelem << 3) + 3), "LO", (ftnlen)2, (ftnlen)2) == 0 || 
		    s_cmp(lakon + ((*nelem << 3) + 3), "WA", (ftnlen)2, (
		    ftnlen)2) == 0 || s_cmp(lakon + ((*nelem << 3) + 3), 
		    "BR", (ftnlen)2, (ftnlen)2) == 0 || s_cmp(lakon + ((*
		    nelem << 3) + 5), "EL", (ftnlen)2, (ftnlen)2) == 0 || 
		    s_cmp(lakon + ((*nelem << 3) + 5), "CO", (ftnlen)2, (
		    ftnlen)2) == 0 || s_cmp(lakon + ((*nelem << 3) + 5), 
		    "DI", (ftnlen)2, (ftnlen)2) == 0 || s_cmp(lakon + ((*
		    nelem << 3) + 5), "EN", (ftnlen)2, (ftnlen)2) == 0 || 
		    s_cmp(lakon + ((*nelem << 3) + 5), "GV", (ftnlen)2, (
		    ftnlen)2) == 0 || s_cmp(lakon + ((*nelem << 3) + 5), 
		    "BE", (ftnlen)2, (ftnlen)2) == 0) {
		s_wsle(&io___102);
		do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
		do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			integer));
		do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
		e_wsle();
		s_wsfe(&io___103);
		do_fio(&c__1, "             Re=   ", (ftnlen)19);
		do_fio(&c__1, (char *)&reynolds, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, " zeta=   ", (ftnlen)9);
		do_fio(&c__1, (char *)&zeta, (ftnlen)sizeof(doublereal));
		e_wsfe();

	    } else if (s_cmp(lakon + ((*nelem << 3) + 3), "C1", (ftnlen)2, (
		    ftnlen)2) == 0) {
		s_wsle(&io___104);
		do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
		do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			integer));
		do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
		e_wsle();
		s_wsfe(&io___105);
		do_fio(&c__1, "             Re=   ", (ftnlen)19);
		do_fio(&c__1, (char *)&reynolds, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, " cd=   ", (ftnlen)7);
		do_fio(&c__1, (char *)&zeta, (ftnlen)sizeof(doublereal));
		e_wsfe();

	    } else if (s_cmp(lakon + ((*nelem << 3) + 3), "FR", (ftnlen)2, (
		    ftnlen)2) == 0) {
		s_wsle(&io___106);
		do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
		do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			integer));
		do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
		e_wsle();
		s_wsfe(&io___107);
		do_fio(&c__1, "             Re=   ", (ftnlen)19);
		do_fio(&c__1, (char *)&reynolds, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, " lambda=       ", (ftnlen)15);
		do_fio(&c__1, (char *)&friction, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, "  lambda*L/D=   ", (ftnlen)16);
		d__1 = friction * dl / d__;
		do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
		e_wsfe();

	    } else if (*(unsigned char *)&lakon[(*nelem << 3) + 3] == 'V') {
		s_wsle(&io___108);
		do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
		do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			integer));
		do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
		e_wsle();
		s_wsle(&io___109);
		do_lio(&c__9, &c__1, "             C1u= ", (ftnlen)18);
		do_lio(&c__5, &c__1, (char *)&c1u, (ftnlen)sizeof(doublereal))
			;
		do_lio(&c__9, &c__1, "m/s ,C2u= ", (ftnlen)10);
		do_lio(&c__5, &c__1, (char *)&c2u, (ftnlen)sizeof(doublereal))
			;
		do_lio(&c__9, &c__1, "m/s", (ftnlen)3);
		do_lio(&c__9, &c__1, " ,DeltaP= ", (ftnlen)10);
		do_lio(&c__5, &c__1, (char *)&xkn, (ftnlen)sizeof(doublereal))
			;
		e_wsle();

	    } else if (s_cmp(lakon + ((*nelem << 3) + 5), "MA", (ftnlen)2, (
		    ftnlen)2) == 0) {
		s_wsle(&io___110);
		do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
		do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			integer));
		do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
		e_wsle();
		s_wsfe(&io___111);
		do_fio(&c__1, "             Re=   ", (ftnlen)19);
		do_fio(&c__1, (char *)&reynolds, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, " n=   ", (ftnlen)6);
		do_fio(&c__1, (char *)&xn, (ftnlen)sizeof(doublereal));
		e_wsfe();

	    } else if (s_cmp(lakon + ((*nelem << 3) + 3), "WC", (ftnlen)2, (
		    ftnlen)2) == 0) {
		s_wsle(&io___112);
		do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
		do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			integer));
		do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
		e_wsle();
		s_wsfe(&io___113);
		do_fio(&c__1, "             Re=   ", (ftnlen)19);
		do_fio(&c__1, (char *)&reynolds, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, " f=   ", (ftnlen)6);
		do_fio(&c__1, (char *)&friction, (ftnlen)sizeof(doublereal));
		e_wsfe();
	    }

	    if (inv == 1) {
		s_wsfe(&io___114);
		do_fio(&c__1, "       Outlet node ", (ftnlen)19);
		do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
		do_fio(&c__1, ":   T=", (ftnlen)6);
		do_fio(&c__1, (char *)&t, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, ", P=", (ftnlen)4);
		do_fio(&c__1, (char *)&p2, (ftnlen)sizeof(doublereal));
		e_wsfe();
	    } else if (inv == -1) {
		s_wsfe(&io___115);
		do_fio(&c__1, "       Outlet node ", (ftnlen)19);
		do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
		do_fio(&c__1, ":   T=", (ftnlen)6);
		do_fio(&c__1, (char *)&t, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, ", P=", (ftnlen)4);
		do_fio(&c__1, (char *)&p1, (ftnlen)sizeof(doublereal));
		e_wsfe();
	    }

	}

    }

    *xflow /= *iaxial;
    df[2] *= *iaxial;

    return 0;
} /* liquidpipe_ */

