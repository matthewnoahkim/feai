/* vortex.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int vortex_(integer *node1, integer *node2, integer *nodem, 
	integer *nelem, char *lakon, integer *kon, integer *ipkon, integer *
	nactdog, logical *identity, integer *ielprop, doublereal *prop, 
	integer *kflag, doublereal *v, doublereal *xflow, doublereal *f, 
	integer *nodef, integer *idirf, doublereal *df, doublereal *cp, 
	doublereal *r__, integer *numf, char *set, integer *mi, doublereal *
	ttime, doublereal *time, integer *iaxial, integer *iplausi, ftnlen 
	lakon_len, ftnlen set_len)
{
    /* Format strings */
    static char fmt_55[] = "(1x,a,i6,a,i6,a,e11.4,a,a,e11.4,a)";
    static char fmt_56[] = "(1x,a,i6,a,e11.4,a,e11.4,a,e11.4,a,e11.4)";
    static char fmt_57[] = "(1x,a,e11.4,a,e11.4,a)";

    /* System generated locals */
    integer v_dim1, v_offset;
    doublereal d__1, d__2;

    /* Builtin functions */
    double atan(doublereal);
    integer s_cmp(char *, char *, ftnlen, ftnlen), i_dnnt(doublereal *), 
	    s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);
    double pow_dd(doublereal *, doublereal *);
    integer s_wsfe(cilist *), do_fio(integer *, char *, ftnlen), e_wsfe(void);

    /* Local variables */
    doublereal k1, p1, p2, r1, r2, t1, t2, u1, xflow_oil__, pi, kr, ui, r1d, 
	    r2d, km1, c1u, c2u;
    integer nelemswirl;
    doublereal eta, ciu;
    integer inv;
    doublereal cte1, cte2, omega, kappa;
    integer index;
    doublereal expon, cinput;
    integer t_chang__;

    /* Fortran I/O blocks */
    static cilist io___23 = { 0, 6, 0, 0, 0 };
    static cilist io___24 = { 0, 6, 0, 0, 0 };
    static cilist io___25 = { 0, 6, 0, 0, 0 };
    static cilist io___26 = { 0, 6, 0, 0, 0 };
    static cilist io___33 = { 0, 6, 0, 0, 0 };
    static cilist io___34 = { 0, 6, 0, 0, 0 };
    static cilist io___35 = { 0, 6, 0, 0, 0 };
    static cilist io___36 = { 0, 6, 0, 0, 0 };
    static cilist io___38 = { 0, 1, 0, 0, 0 };
    static cilist io___39 = { 0, 1, 0, fmt_55, 0 };
    static cilist io___40 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___41 = { 0, 1, 0, 0, 0 };
    static cilist io___42 = { 0, 1, 0, fmt_57, 0 };
    static cilist io___43 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___44 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___45 = { 0, 1, 0, 0, 0 };
    static cilist io___46 = { 0, 1, 0, fmt_57, 0 };
    static cilist io___47 = { 0, 1, 0, fmt_56, 0 };



/*     vortex element */

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

	*xflow = 0.;

    } else if (*kflag == 2) {

	*numf = 4;
	index = ielprop[*nelem];
	kappa = *cp / (*cp - *r__);
	km1 = kappa - 1;
	pi = atan(1.) * 4.;

/*     radius downstream */
	r2d = prop[index + 1];

/*     radius upstream */
	r1d = prop[index + 2];

/*     pressure correction factor */
	eta = prop[index + 3];

	p1 = v[*node1 * v_dim1 + 2];
	p2 = v[*node2 * v_dim1 + 2];

	*xflow = v[*nodem * v_dim1 + 1] * *iaxial;

	if (*xflow > 0.) {
	    inv = 1;
	    p1 = v[*node1 * v_dim1 + 2];
	    p2 = v[*node2 * v_dim1 + 2];
	    t1 = v[*node1 * v_dim1];
	    t2 = v[*node2 * v_dim1];
	    r1 = r1d;
	    r2 = r2d;

	    nodef[1] = *node1;
	    nodef[2] = *node1;
	    nodef[3] = *nodem;
	    nodef[4] = *node2;

	} else if (*xflow < 0.) {
	    inv = -1;
	    r1 = r2d;
	    r2 = r1d;
	    p1 = v[*node2 * v_dim1 + 2];
	    p2 = v[*node1 * v_dim1 + 2];
	    t1 = v[*node2 * v_dim1];
	    t2 = v[*node1 * v_dim1];
	    *xflow = -v[*nodem * v_dim1 + 1] * *iaxial;

	    nodef[1] = *node2;
	    nodef[2] = *node2;
	    nodef[3] = *nodem;
	    nodef[4] = *node1;

	}

	idirf[1] = 2;
	idirf[2] = 0;
	idirf[3] = 1;
	idirf[4] = 2;

	kappa = *cp / (*cp - *r__);

/*     FREE VORTEX */

	if (s_cmp(lakon + ((*nelem << 3) + 3), "FR", (ftnlen)2, (ftnlen)2) == 
		0) {

/*     rotation induced loss (correction factor) */
	    k1 = prop[index + 4];

/*     tangential velocity of the disk at vortex entry */
	    u1 = prop[index + 5];

/*     number of the element generating the upstream swirl */
	    nelemswirl = i_dnnt(&prop[index + 6]);

/*     rotation speed (revolution per minutes) */
	    omega = prop[index + 7];

/*     Temperature change */
	    t_chang__ = (integer) prop[index + 8];

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
/*     preswirl nozzle */
		if (s_cmp(lakon + ((nelemswirl << 3) + 1), "ORPN", (ftnlen)4, 
			(ftnlen)4) == 0) {
		    cinput = prop[ielprop[nelemswirl] + 5];
/*     rotating orifices */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "ORMM", (
			ftnlen)4, (ftnlen)4) == 0 || s_cmp(lakon + ((
			nelemswirl << 3) + 1), "ORMA", (ftnlen)4, (ftnlen)4) 
			== 0 || s_cmp(lakon + ((nelemswirl << 3) + 1), "ORPM",
			 (ftnlen)4, (ftnlen)4) == 0 || s_cmp(lakon + ((
			nelemswirl << 3) + 1), "ORPA", (ftnlen)4, (ftnlen)4) 
			== 0) {
		    cinput = prop[ielprop[nelemswirl] + 7];
/*     forced vortex */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "VOFO", (
			ftnlen)4, (ftnlen)4) == 0) {
		    cinput = prop[ielprop[nelemswirl] + 7];
/*     free vortex */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "VOFR", (
			ftnlen)4, (ftnlen)4) == 0) {
		    cinput = prop[ielprop[nelemswirl] + 9];
/*     Moehring */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "MRG", (
			ftnlen)3, (ftnlen)3) == 0) {
		    cinput = prop[ielprop[nelemswirl] + 10];
/*     RCAVO */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "ROR", (
			ftnlen)3, (ftnlen)3) == 0 || s_cmp(lakon + ((
			nelemswirl << 3) + 1), "ROA", (ftnlen)3, (ftnlen)3) ==
			 0) {
		    cinput = prop[ielprop[nelemswirl] + 6];
/*     RCAVI */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "RCV", (
			ftnlen)3, (ftnlen)3) == 0) {
		    cinput = prop[ielprop[nelemswirl] + 5];
		} else {
		    s_wsle(&io___23);
		    do_lio(&c__9, &c__1, "*ERROR in vortex:", (ftnlen)17);
		    e_wsle();
		    s_wsle(&io___24);
		    do_lio(&c__9, &c__1, " element", (ftnlen)8);
		    do_lio(&c__3, &c__1, (char *)&nelemswirl, (ftnlen)sizeof(
			    integer));
		    e_wsle();
		    s_wsle(&io___25);
		    do_lio(&c__9, &c__1, " referred by element", (ftnlen)20);
		    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			    integer));
		    e_wsle();
		    s_wsle(&io___26);
		    do_lio(&c__9, &c__1, " is not a swirl generating element",
			     (ftnlen)34);
		    e_wsle();
		    cinput = 0.;
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

	    expon = kappa / km1;

	    if (r2 >= r1) {

/* Computing 2nd power */
		d__1 = c1u;
		cte1 = d__1 * d__1 / (*cp * 2 * t1);
/* Computing 2nd power */
		d__1 = r1 / r2;
		cte2 = 1 - d__1 * d__1;
		d__1 = cte1 * cte2 + 1;
		*f = p2 / p1 - 1. - eta * (pow_dd(&d__1, &expon) - 1.);

/* Computing 2nd power */
		d__1 = p1;
		df[1] = -p2 / (d__1 * d__1);

		d__1 = cte1 * cte2 + 1;
		d__2 = expon - 1;
		df[2] = eta * expon * cte1 / t1 * cte2 * pow_dd(&d__1, &d__2);

		df[3] = 0.;

		df[4] = 1 / p1;

	    } else if (r2 < r1) {

/* Computing 2nd power */
		d__1 = c2u;
		cte1 = d__1 * d__1 / (*cp * 2 * t2);
/* Computing 2nd power */
		d__1 = r2 / r1;
		cte2 = 1 - d__1 * d__1;

		d__1 = cte1 * cte2 + 1;
		*f = p1 / p2 - 1. - eta * (pow_dd(&d__1, &expon) - 1.);

		df[1] = 1 / p2;

		d__1 = cte1 * cte2 + 1;
		d__2 = expon - 1;
		df[2] = eta * expon * cte1 / t1 * cte2 * pow_dd(&d__1, &d__2);

		df[3] = 0.;

/* Computing 2nd power */
		d__1 = p2;
		df[4] = -p1 / (d__1 * d__1);

	    }

/*     FORCED VORTEX */

	} else if (s_cmp(lakon + ((*nelem << 3) + 3), "FO", (ftnlen)2, (
		ftnlen)2) == 0) {

/*    core swirl ratio */
	    kr = prop[index + 4];

/*     rotation speed (revolution per minutes) of the rotating part */
/*     responsible for the swirl */
	    omega = prop[index + 5];

/*     Temperature change */
	    t_chang__ = (integer) prop[index + 6];

	    if (r2 >= r1) {
		ui = omega * r1;
		c1u = ui * kr;
		c2u = c1u * r2 / r1;
	    } else if (r2 < r1) {
		ui = omega * r2;
		c2u = ui * kr;
		c1u = c2u * r1 / r2;
	    }

/*     storing the tengential velocity for later use (wirbel cascade) */
	    if (inv > 0) {
		prop[index + 7] = c2u;
	    } else if (inv < 0) {
		prop[index + 7] = c1u;
	    }

	    expon = kappa / km1;

	    if (r2 >= r1 && *xflow > 0. || r2 < r1 && *xflow < 0.) {

/* Computing 2nd power */
		d__1 = c1u;
		cte1 = d__1 * d__1 / (*cp * 2 * t1);
/* Computing 2nd power */
		d__1 = r2 / r1;
		cte2 = d__1 * d__1 - 1;

		d__1 = cte1 * cte2 + 1;
		*f = p2 / p1 - 1 - eta * (pow_dd(&d__1, &expon) - 1);

/*     pressure node1 */
/* Computing 2nd power */
		d__1 = p1;
		df[1] = -p2 / (d__1 * d__1);

/*     temperature node1 */
		d__1 = cte1 * cte2 + 1;
		d__2 = expon - 1;
		df[2] = eta * expon * cte1 / t1 * cte2 * pow_dd(&d__1, &d__2);

/*     massflow nodem */
		df[3] = 0.;

/*     pressure node2 */
		df[4] = 1 / p1;

	    } else if (r2 < r1 && *xflow > 0. || r2 > r1 && *xflow < 0.) {
/* Computing 2nd power */
		d__1 = c2u;
		cte1 = d__1 * d__1 / (*cp * 2 * t2);
/* Computing 2nd power */
		d__1 = r1 / r2;
		cte2 = d__1 * d__1 - 1;

		d__1 = cte1 * cte2 + 1;
		*f = p1 / p2 - 1 - eta * (pow_dd(&d__1, &expon) - 1);

/*     pressure node1 */
		df[1] = 1 / p2;

/*     temperature node1 */
		d__1 = cte1 * cte2 + 1;
		d__2 = expon - 1;
		df[2] = eta * expon * cte1 / t2 * cte2 * pow_dd(&d__1, &d__2);

/*     massflow nodem */
		df[3] = 0.;

/*     pressure node2 */
/* Computing 2nd power */
		d__1 = p2;
		df[4] = -p1 / (d__1 * d__1);

	    }
	}

/*     outpout */

    } else if (*kflag == 3) {

	index = ielprop[*nelem];
	kappa = *cp / (*cp - *r__);
	km1 = kappa - 1;
	pi = atan(1.) * 4.;

/*     radius downstream */
	r2d = prop[index + 1];

/*     radius upstream */
	r1d = prop[index + 2];

/*     pressure correction factor */
	eta = prop[index + 3];

	p1 = v[*node1 * v_dim1 + 2];
	p2 = v[*node2 * v_dim1 + 2];

	*xflow = v[*nodem * v_dim1 + 1] * *iaxial;

	if (*xflow > 0.) {
	    inv = 1;
	    p1 = v[*node1 * v_dim1 + 2];
	    p2 = v[*node2 * v_dim1 + 2];
	    t1 = v[*node1 * v_dim1];
	    t2 = v[*node2 * v_dim1];
	    r1 = r1d;
	    r2 = r2d;

	    nodef[1] = *node1;
	    nodef[2] = *node1;
	    nodef[3] = *nodem;
	    nodef[4] = *node2;

	} else if (*xflow < 0.) {
	    inv = -1;
	    r1 = r2d;
	    r2 = r1d;
	    p1 = v[*node2 * v_dim1 + 2];
	    p2 = v[*node1 * v_dim1 + 2];
	    t1 = v[*node2 * v_dim1];
	    t2 = v[*node1 * v_dim1];
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;

	    nodef[1] = *node2;
	    nodef[2] = *node2;
	    nodef[3] = *nodem;
	    nodef[4] = *node1;

	}

	idirf[1] = 2;
	idirf[2] = 0;
	idirf[3] = 1;
	idirf[4] = 2;

	kappa = *cp / (*cp - *r__);

/*     FREE VORTEX */

	if (s_cmp(lakon + ((*nelem << 3) + 3), "FR", (ftnlen)2, (ftnlen)2) == 
		0) {

/*     rotation induced loss (correction factor) */
	    k1 = prop[index + 4];

/*     tengential velocity of the disk at vortex entry */
	    u1 = prop[index + 5];

/*     number of the element generating the upstream swirl */
	    nelemswirl = i_dnnt(&prop[index + 6]);

/*     rotation speed (revolution per minutes) */
	    omega = prop[index + 7];

/*     Temperature change */
	    t_chang__ = (integer) prop[index + 8];

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
/*     swirl generating element */

/*     preswirl nozzle */
		if (s_cmp(lakon + ((nelemswirl << 3) + 1), "ORPN", (ftnlen)4, 
			(ftnlen)4) == 0) {
		    cinput = prop[ielprop[nelemswirl] + 5];
/*     rotating orifices */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "ORMM", (
			ftnlen)4, (ftnlen)4) == 0 || s_cmp(lakon + ((
			nelemswirl << 3) + 1), "ORMA", (ftnlen)4, (ftnlen)4) 
			== 0 || s_cmp(lakon + ((nelemswirl << 3) + 1), "ORPM",
			 (ftnlen)4, (ftnlen)4) == 0 || s_cmp(lakon + ((
			nelemswirl << 3) + 1), "ORPA", (ftnlen)4, (ftnlen)4) 
			== 0) {
		    cinput = prop[ielprop[nelemswirl] + 7];
/*     forced vortex */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "VOFO", (
			ftnlen)4, (ftnlen)4) == 0) {
		    cinput = prop[ielprop[nelemswirl] + 7];
/*     free vortex */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "VOFR", (
			ftnlen)4, (ftnlen)4) == 0) {
		    cinput = prop[ielprop[nelemswirl] + 9];
/*     Moehring */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "MRG", (
			ftnlen)3, (ftnlen)3) == 0) {
		    cinput = prop[ielprop[nelemswirl] + 10];
/*     RCAVO */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "ROR", (
			ftnlen)3, (ftnlen)3) == 0 || s_cmp(lakon + ((
			nelemswirl << 3) + 1), "ROA", (ftnlen)3, (ftnlen)3) ==
			 0) {
		    cinput = prop[ielprop[nelemswirl] + 6];
/*     RCAVI */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "RCV", (
			ftnlen)3, (ftnlen)3) == 0) {
		    cinput = prop[ielprop[nelemswirl] + 5];
		} else {
		    s_wsle(&io___33);
		    do_lio(&c__9, &c__1, "*ERROR in vortex:", (ftnlen)17);
		    e_wsle();
		    s_wsle(&io___34);
		    do_lio(&c__9, &c__1, " element", (ftnlen)8);
		    do_lio(&c__3, &c__1, (char *)&nelemswirl, (ftnlen)sizeof(
			    integer));
		    e_wsle();
		    s_wsle(&io___35);
		    do_lio(&c__9, &c__1, " referred by element", (ftnlen)20);
		    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			    integer));
		    e_wsle();
		    s_wsle(&io___36);
		    do_lio(&c__9, &c__1, " is not a swirl generating element",
			     (ftnlen)34);
		    e_wsle();
		    cinput = 0.;
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

	    expon = kappa / km1;

	    if (r2 >= r1) {

/* Computing 2nd power */
		d__1 = c1u;
		cte1 = d__1 * d__1 / (*cp * 2 * t1);
/* Computing 2nd power */
		d__1 = r1 / r2;
		cte2 = 1 - d__1 * d__1;
		d__1 = cte1 * cte2 + 1;
		*f = p2 / p1 - 1. - eta * (pow_dd(&d__1, &expon) - 1.);

/* Computing 2nd power */
		d__1 = p1;
		df[1] = -p2 / (d__1 * d__1);

		d__1 = cte1 * cte2 + 1;
		d__2 = expon - 1;
		df[2] = eta * expon * cte1 / t1 * cte2 * pow_dd(&d__1, &d__2);

		df[3] = 0.;

		df[4] = 1 / p1;

	    } else if (r2 < r1) {

/* Computing 2nd power */
		d__1 = c2u;
		cte1 = d__1 * d__1 / (*cp * 2 * t2);
/* Computing 2nd power */
		d__1 = r2 / r1;
		cte2 = 1 - d__1 * d__1;

		d__1 = cte1 * cte2 + 1;
		*f = p1 / p2 - 1. - eta * (pow_dd(&d__1, &expon) - 1.);

		df[1] = 1 / p2;

		d__1 = cte1 * cte2 + 1;
		d__2 = expon - 1;
		df[2] = eta * expon * cte1 / t1 * cte2 * pow_dd(&d__1, &d__2);

		df[3] = 0.;

/* Computing 2nd power */
		d__1 = p2;
		df[4] = -p1 / (d__1 * d__1);

	    }

/*     FORCED VORTEX */

	} else if (s_cmp(lakon + ((*nelem << 3) + 3), "FO", (ftnlen)2, (
		ftnlen)2) == 0) {

/*    core swirl ratio */
	    kr = prop[index + 4];

/*     rotation speed (revolution per minutes) of the rotating part */
/*     responsible for the swirl */
	    omega = prop[index + 5];

/*     Temperature change */
	    t_chang__ = (integer) prop[index + 6];

/*    no element generating the upstream swirl */
	    nelemswirl = 0;

	    if (r2 >= r1) {
		ui = omega * r1;
		c1u = ui * kr;
		c2u = c1u * r2 / r1;
	    } else if (r2 < r1) {
		ui = omega * r2;
		c2u = ui * kr;
		c1u = c2u * r1 / r2;
	    }

/*     storing the tengential velocity for later use (wirbel cascade) */
	    if (inv > 0) {
		prop[index + 7] = c2u;
	    } else if (inv < 0) {
		prop[index + 7] = c1u;
	    }

	    expon = kappa / km1;
	}

	xflow_oil__ = 0.;

	s_wsle(&io___38);
	do_lio(&c__9, &c__1, "", (ftnlen)0);
	e_wsle();
	s_wsfe(&io___39);
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

	if (inv == 1) {
	    s_wsfe(&io___40);
	    do_fio(&c__1, "       Inlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	    do_fio(&c__1, " :     Tt1 = ", (ftnlen)13);
	    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Ts1 = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Pt1 = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&p1, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	    s_wsle(&io___41);
	    do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
	    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(integer));
	    do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
	    e_wsle();
	    s_wsfe(&io___42);
	    do_fio(&c__1, "             C1u = ", (ftnlen)19);
	    do_fio(&c__1, (char *)&c1u, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , C2u = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&c2u, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	    s_wsfe(&io___43);
	    do_fio(&c__1, "      Outlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	    do_fio(&c__1, " :    Tt2 = ", (ftnlen)12);
	    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Ts2 = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Pt2 = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&p2, (ftnlen)sizeof(doublereal));
	    e_wsfe();

	} else if (inv == -1) {
	    s_wsfe(&io___44);
	    do_fio(&c__1, "       Inlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	    do_fio(&c__1, ":     Tt1 = ", (ftnlen)12);
	    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Ts1 = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Pt1 = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&p1, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	    s_wsle(&io___45);
	    do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
	    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(integer));
	    do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
	    e_wsle();
	    s_wsfe(&io___46);
	    do_fio(&c__1, "             C1u = ", (ftnlen)19);
	    do_fio(&c__1, (char *)&c1u, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , C2u = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&c2u, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	    s_wsfe(&io___47);
	    do_fio(&c__1, "      Outlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	    do_fio(&c__1, "     Tt2 = ", (ftnlen)11);
	    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Ts2 = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Pt2 = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&p2, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	}
    }


    *xflow /= *iaxial;
    df[3] *= *iaxial;

    return 0;
} /* vortex_ */

