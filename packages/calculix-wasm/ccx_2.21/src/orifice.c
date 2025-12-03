/* orifice.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int orifice_(integer *node1, integer *node2, integer *nodem, 
	integer *nelem, char *lakon, integer *kon, integer *ipkon, integer *
	nactdog, logical *identity, integer *ielprop, doublereal *prop, 
	integer *kflag, doublereal *v, doublereal *xflow, doublereal *f, 
	integer *nodef, integer *idirf, doublereal *df, doublereal *cp, 
	doublereal *r__, doublereal *physcon, doublereal *dvi, integer *numf, 
	char *set, doublereal *co, doublereal *vold, integer *mi, doublereal *
	ttime, doublereal *time, integer *iaxial, integer *iplausi, ftnlen 
	lakon_len, ftnlen set_len)
{
    /* Format strings */
    static char fmt_55[] = "(1x,a,i6,a,i6,a,e11.4,a,a,e11.4,a)";
    static char fmt_56[] = "(1x,a,i6,a,e11.4,a,e11.4,a,e11.4,a)";
    static char fmt_57[] = "(1x,a,e11.4,a,e11.4,a,e11.4)";
    static char fmt_58[] = "(1x,a,e11.4)";
    static char fmt_59[] = "(1x,a,e11.4,a,e11.4,a,e11.4,a)";
    static char fmt_63[] = "(1x,a,e11.4,a,e11.4,a,e11.4,a,i2,a,e11.4)";
    static char fmt_62[] = "(1x,a,e11.4,a,e11.4,a,e11.4,a)";

    /* System generated locals */
    integer v_dim1, v_offset, vold_dim1, vold_offset, i__1;
    doublereal d__1, d__2, d__3, d__4;

    /* Builtin functions */
    double atan(doublereal);
    integer s_cmp(char *, char *, ftnlen, ftnlen), i_dnnt(doublereal *);
    double sqrt(doublereal), pow_dd(doublereal *, doublereal *);
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);
    double cos(doublereal);
    integer s_wsfe(cilist *), do_fio(integer *, char *, ftnlen), e_wsfe(void);

    /* Local variables */
    doublereal cd_chamf__;
    extern /* Subroutine */ int cd_bragg__(doublereal *, doublereal *, 
	    doublereal *, integer *), cd_pk_ms__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *), cd_ms_ms__(doublereal *, doublereal *
	    , doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *);
    doublereal reynolds, a, d__;
    integer i__;
    doublereal u, x, y, c1, c2, c3, p1, p2, t1, t2, xflow_oil__, cd, dl, pi;
    extern /* Subroutine */ int cd_chamfer__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *);
    doublereal ca1, cb1, ca2, cb2;
    extern /* Subroutine */ int cd_preswirlnozzle__(doublereal *, doublereal *
	    , integer *, doublereal *, doublereal *, doublereal *, doublereal 
	    *);
    doublereal km1, dt1, kp1;
    integer nelemswirl;
    doublereal rad, p2p1, vid;
    integer inv;
    doublereal aeff, beta, uref;
    extern /* Subroutine */ int cd_pk_albers__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *), exit_(integer *);
    doublereal kdkm1, km1dk, tdkp1;
    integer nodea, nodeb;
    doublereal angle, k_phi__, kappa, x_tab__[100], y_tab__[100], xmach, 
	    theta;
    integer index;
    doublereal curve, ps1pt1;
    integer itype;
    extern /* Subroutine */ int cd_own_albers__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *);
    doublereal x_tab2__[100], y_tab2__[100], cdcrit, offset, radius;
    integer number;
    doublereal initial_radius__, c2u_new__, alambda;
    extern /* Subroutine */ int cd_bleedtapping__(doublereal *, doublereal *, 
	    doublereal *, integer *, doublereal *, doublereal *, doublereal *,
	     doublereal *);

    /* Fortran I/O blocks */
    static cilist io___25 = { 0, 6, 0, 0, 0 };
    static cilist io___26 = { 0, 6, 0, 0, 0 };
    static cilist io___27 = { 0, 6, 0, 0, 0 };
    static cilist io___31 = { 0, 6, 0, 0, 0 };
    static cilist io___32 = { 0, 6, 0, 0, 0 };
    static cilist io___33 = { 0, 6, 0, 0, 0 };
    static cilist io___34 = { 0, 6, 0, 0, 0 };
    static cilist io___42 = { 0, 6, 0, 0, 0 };
    static cilist io___43 = { 0, 6, 0, 0, 0 };
    static cilist io___44 = { 0, 6, 0, 0, 0 };
    static cilist io___45 = { 0, 6, 0, 0, 0 };
    static cilist io___46 = { 0, 6, 0, 0, 0 };
    static cilist io___47 = { 0, 6, 0, 0, 0 };
    static cilist io___48 = { 0, 6, 0, 0, 0 };
    static cilist io___49 = { 0, 6, 0, 0, 0 };
    static cilist io___62 = { 0, 6, 0, 0, 0 };
    static cilist io___63 = { 0, 6, 0, 0, 0 };
    static cilist io___64 = { 0, 6, 0, 0, 0 };
    static cilist io___65 = { 0, 6, 0, 0, 0 };
    static cilist io___77 = { 0, 6, 0, 0, 0 };
    static cilist io___78 = { 0, 6, 0, 0, 0 };
    static cilist io___79 = { 0, 6, 0, 0, 0 };
    static cilist io___80 = { 0, 6, 0, 0, 0 };
    static cilist io___81 = { 0, 6, 0, 0, 0 };
    static cilist io___82 = { 0, 6, 0, 0, 0 };
    static cilist io___83 = { 0, 6, 0, 0, 0 };
    static cilist io___84 = { 0, 6, 0, 0, 0 };
    static cilist io___85 = { 0, 6, 0, 0, 0 };
    static cilist io___86 = { 0, 6, 0, 0, 0 };
    static cilist io___87 = { 0, 6, 0, 0, 0 };
    static cilist io___88 = { 0, 6, 0, 0, 0 };
    static cilist io___89 = { 0, 6, 0, 0, 0 };
    static cilist io___90 = { 0, 6, 0, 0, 0 };
    static cilist io___91 = { 0, 6, 0, 0, 0 };
    static cilist io___92 = { 0, 6, 0, 0, 0 };
    static cilist io___93 = { 0, 6, 0, 0, 0 };
    static cilist io___94 = { 0, 6, 0, 0, 0 };
    static cilist io___95 = { 0, 6, 0, 0, 0 };
    static cilist io___98 = { 0, 1, 0, 0, 0 };
    static cilist io___99 = { 0, 1, 0, fmt_55, 0 };
    static cilist io___100 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___101 = { 0, 1, 0, 0, 0 };
    static cilist io___102 = { 0, 1, 0, fmt_57, 0 };
    static cilist io___103 = { 0, 1, 0, fmt_58, 0 };
    static cilist io___104 = { 0, 1, 0, fmt_59, 0 };
    static cilist io___105 = { 0, 1, 0, fmt_63, 0 };
    static cilist io___106 = { 0, 1, 0, fmt_62, 0 };
    static cilist io___107 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___108 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___109 = { 0, 1, 0, 0, 0 };
    static cilist io___110 = { 0, 1, 0, fmt_57, 0 };
    static cilist io___111 = { 0, 1, 0, fmt_58, 0 };
    static cilist io___112 = { 0, 1, 0, fmt_59, 0 };
    static cilist io___113 = { 0, 1, 0, fmt_63, 0 };
    static cilist io___114 = { 0, 1, 0, 0, 0 };
    static cilist io___115 = { 0, 1, 0, fmt_56, 0 };



/*     orifice element */

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
    co -= 4;
    --mi;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;
    v_dim1 = mi[2] - 0 + 1;
    v_offset = 0 + v_dim1;
    v -= v_offset;

    /* Function Body */
    pi = atan(1.) * 4.;
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

	index = ielprop[*nelem];
	kappa = *cp / (*cp - *r__);
	a = prop[index + 1];
	d__ = prop[index + 2];
	dl = prop[index + 3];

	if (s_cmp(lakon + ((*nelem << 3) + 1), "ORFL", (ftnlen)4, (ftnlen)4) 
		== 0) {
	    nodea = i_dnnt(&prop[index + 1]);
	    nodeb = i_dnnt(&prop[index + 2]);
	    offset = prop[index + 4];
/* Computing 2nd power */
	    d__1 = co[nodeb * 3 + 1] + vold[nodeb * vold_dim1 + 1] - co[nodea 
		    * 3 + 1] - vold[nodea * vold_dim1 + 1];
	    radius = sqrt(d__1 * d__1) - offset;
/* Computing 2nd power */
	    d__1 = co[nodeb * 3 + 1] - co[nodea * 3 + 1];
	    initial_radius__ = sqrt(d__1 * d__1) - offset;
/* Computing 2nd power */
	    d__1 = radius;
	    a = pi * (d__1 * d__1);
	    d__ = radius * 2;
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

	p2p1 = p2 / p1;
	km1 = kappa - 1.;
	kp1 = kappa + 1.;
	kdkm1 = kappa / km1;
	tdkp1 = 2. / kp1;
	c2 = pow_dd(&tdkp1, &kdkm1);
	aeff = a * cd;
	if (p2p1 > c2) {
	    d__1 = 2. / kappa;
	    d__2 = 1. / kdkm1;
	    *xflow = inv * p1 * aeff * sqrt(kdkm1 * 2. * pow_dd(&p2p1, &d__1) 
		    * (1. - pow_dd(&p2p1, &d__2)) / *r__) / sqrt(t1);
	} else {
	    d__1 = kp1 / (km1 * 2.);
	    *xflow = inv * p1 * aeff * sqrt(kappa / *r__) * pow_dd(&tdkp1, &
		    d__1) / sqrt(t1);
	}

    } else if (*kflag == 2) {

	*numf = 4;
	alambda = 1e4;
	index = ielprop[*nelem];
	kappa = *cp / (*cp - *r__);
	a = prop[index + 1];

	p1 = v[*node1 * v_dim1 + 2];
	p2 = v[*node2 * v_dim1 + 2];
	if (p1 >= p2) {
	    inv = 1;
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    t1 = v[*node1 * v_dim1] - physcon[1];
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


	if (abs(*dvi) < 1e-30) {
	    s_wsle(&io___25);
	    do_lio(&c__9, &c__1, "*ERROR in orifice: ", (ftnlen)19);
	    e_wsle();
	    s_wsle(&io___26);
	    do_lio(&c__9, &c__1, "       no dynamic viscosity defined", (
		    ftnlen)35);
	    e_wsle();
	    s_wsle(&io___27);
	    do_lio(&c__9, &c__1, "       dvi= ", (ftnlen)12);
	    do_lio(&c__5, &c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    e_wsle();
	    exit_(&c__201);
	}

	if (s_cmp(lakon + ((*nelem << 3) + 3), "BT", (ftnlen)2, (ftnlen)2) != 
		0 && s_cmp(lakon + ((*nelem << 3) + 3), "PN", (ftnlen)2, (
		ftnlen)2) != 0 && s_cmp(lakon + ((*nelem << 3) + 3), "C1", (
		ftnlen)2, (ftnlen)2) != 0 && s_cmp(lakon + ((*nelem << 3) + 3)
		, "FL", (ftnlen)2, (ftnlen)2) != 0) {
	    d__ = prop[index + 2];
	    dl = prop[index + 3];
/*     circumferential velocity of the rotating hole (same as disc @ given radius) */
	    u = prop[index + 7];
	    nelemswirl = i_dnnt(&prop[index + 8]);
	    if (nelemswirl == 0) {
		uref = 0.;
	    } else {
/*     swirl generating element */

/*     preswirl nozzle */
		if (s_cmp(lakon + ((nelemswirl << 3) + 1), "ORPN", (ftnlen)4, 
			(ftnlen)4) == 0) {
		    uref = prop[ielprop[nelemswirl] + 5];
/*     rotating orifices */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "ORMM", (
			ftnlen)4, (ftnlen)4) == 0 || s_cmp(lakon + ((
			nelemswirl << 3) + 1), "ORMA", (ftnlen)4, (ftnlen)4) 
			== 0 || s_cmp(lakon + ((nelemswirl << 3) + 1), "ORPM",
			 (ftnlen)4, (ftnlen)4) == 0 || s_cmp(lakon + ((
			nelemswirl << 3) + 1), "ORPA", (ftnlen)4, (ftnlen)4) 
			== 0) {
		    uref = prop[ielprop[nelemswirl] + 7];
/*     forced vortex */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "VOFO", (
			ftnlen)4, (ftnlen)4) == 0) {
		    uref = prop[ielprop[nelemswirl] + 7];
/*     free vortex */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "VOFR", (
			ftnlen)4, (ftnlen)4) == 0) {
		    uref = prop[ielprop[nelemswirl] + 9];
/*     Moehring */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "MRG", (
			ftnlen)3, (ftnlen)3) == 0) {
		    uref = prop[ielprop[nelemswirl] + 10];
/*     RCAVO */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "ROR", (
			ftnlen)3, (ftnlen)3) == 0 || s_cmp(lakon + ((
			nelemswirl << 3) + 1), "ROA", (ftnlen)3, (ftnlen)3) ==
			 0) {
		    uref = prop[ielprop[nelemswirl] + 6];
/*     RCAVI */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "RCV", (
			ftnlen)3, (ftnlen)3) == 0) {
		    uref = prop[ielprop[nelemswirl] + 5];

		} else {
		    s_wsle(&io___31);
		    do_lio(&c__9, &c__1, "*ERROR in orifice:", (ftnlen)18);
		    e_wsle();
		    s_wsle(&io___32);
		    do_lio(&c__9, &c__1, " element", (ftnlen)8);
		    do_lio(&c__3, &c__1, (char *)&nelemswirl, (ftnlen)sizeof(
			    integer));
		    e_wsle();
		    s_wsle(&io___33);
		    do_lio(&c__9, &c__1, " refered by element", (ftnlen)19);
		    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			    integer));
		    e_wsle();
		    s_wsle(&io___34);
		    do_lio(&c__9, &c__1, " is not a swirl generating element",
			     (ftnlen)34);
		    e_wsle();
		}
	    }
/*     write(*,*) 'nelem',nelem, u, uref */
	    u -= uref;
	    angle = prop[index + 5];

	}

/*     calculate the discharge coefficient using Bragg's Method */
/*     "Effect of Compressibility on the discharge coefficient */
/*     of orifices and convergent nozzles" */
/*     journal of mechanical Engineering */
/*     vol2 No 1 1960 */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "ORBG", (ftnlen)4, (ftnlen)4) 
		== 0) {

	    p2p1 = p2 / p1;
	    cdcrit = prop[index + 2];

	    itype = 2;
	    cd_bragg__(&cdcrit, &p2p1, &cd, &itype);

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "ORMA", (ftnlen)4, (
		ftnlen)4) == 0) {

/*     calculate the discharge coefficient using own table data and */
/*     using Dr.Albers method for rotating cavities */

	    cd_own_albers__(&p1, &p2, &dl, &d__, &cd, &u, &t1, r__, &kappa);

/*     outlet circumferential velocity of the fluid is equal to the circumferential velocity of the hole */
/*     as the holes are perpendicular to the rotating surface and rotating with it */
/*     prop(index+7) */

/*     chamfer correction */

	    if (angle > 0.) {
		cd_chamfer__(&dl, &d__, &p1, &p2, &angle, &cd_chamf__);
		cd *= cd_chamf__;
	    }

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "ORMM", (ftnlen)4, (
		ftnlen)4) == 0) {

/*     calculate the discharge coefficient using McGreehan and Schotsch method */

	    rad = prop[index + 4];

	    reynolds = abs(*xflow) * d__ / (*dvi * a);

/*     outlet circumferential velocity of the fluid is equal to the circumferential velocity of the hole */
/*     as the holes are perpendicular to the rotating surface and rotating with it */
/*     prop(index+7) */

	    cd_ms_ms__(&p1, &p2, &t1, &rad, &d__, &dl, &kappa, r__, &reynolds,
		     &u, &vid, &cd);

	    if (cd >= 1.) {
		s_wsle(&io___42);
		do_lio(&c__9, &c__1, "", (ftnlen)0);
		e_wsle();
		s_wsle(&io___43);
		do_lio(&c__9, &c__1, "**WARNING**", (ftnlen)11);
		e_wsle();
		s_wsle(&io___44);
		do_lio(&c__9, &c__1, "in RESTRICTOR ", (ftnlen)14);
		do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			integer));
		e_wsle();
		s_wsle(&io___45);
		do_lio(&c__9, &c__1, "Calculation using", (ftnlen)17);
		e_wsle();
		s_wsle(&io___46);
		do_lio(&c__9, &c__1, " McGreehan and Schotsch method:", (
			ftnlen)31);
		e_wsle();
		s_wsle(&io___47);
		do_lio(&c__9, &c__1, " Cd=", (ftnlen)4);
		do_lio(&c__5, &c__1, (char *)&cd, (ftnlen)sizeof(doublereal));
		do_lio(&c__9, &c__1, ">1 !", (ftnlen)4);
		e_wsle();
		s_wsle(&io___48);
		do_lio(&c__9, &c__1, "Calcultion will proceed will Cd=1", (
			ftnlen)33);
		e_wsle();
		s_wsle(&io___49);
		do_lio(&c__9, &c__1, "l/d=", (ftnlen)4);
		d__1 = dl / d__;
		do_lio(&c__5, &c__1, (char *)&d__1, (ftnlen)sizeof(doublereal)
			);
		do_lio(&c__9, &c__1, "r/d=", (ftnlen)4);
		d__2 = rad / d__;
		do_lio(&c__5, &c__1, (char *)&d__2, (ftnlen)sizeof(doublereal)
			);
		do_lio(&c__9, &c__1, "u/vid=", (ftnlen)6);
		d__3 = u / vid;
		do_lio(&c__5, &c__1, (char *)&d__3, (ftnlen)sizeof(doublereal)
			);
		e_wsle();
		cd = 1.;
	    }

/*     chamfer correction */

	    if (angle > 0.) {
		cd_chamfer__(&dl, &d__, &p1, &p2, &angle, &cd_chamf__);
		cd *= cd_chamf__;
	    }

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "ORPA", (ftnlen)4, (
		ftnlen)4) == 0) {

/*     calculate the discharge coefficient using Parker and Kercher method */
/*     and using Dr. Albers method for rotating cavities */

	    rad = prop[index + 4];

	    beta = prop[index + 6];

	    reynolds = abs(*xflow) * d__ / (*dvi * a);

	    cd_pk_albers__(&rad, &d__, &dl, &reynolds, &p2, &p1, &beta, &
		    kappa, &cd, &u, &t1, r__);

/*     outlet circumferential velocity of the fluid is equal to the circumferential velocity of the hole */
/*     as the holes are perpendicular to the rotating surface and rotating with it */
/*     prop(index+7) */

/*     chamfer correction */

	    if (angle > 0.) {
		cd_chamfer__(&dl, &d__, &p1, &p2, &angle, &cd_chamf__);
		cd *= cd_chamf__;
	    }

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "ORPM", (ftnlen)4, (
		ftnlen)4) == 0) {

/*     calculate the discharge coefficient using Parker and Kercher method */
/*     and using Mac Grehan and Schotsch method for rotating cavities */

	    rad = prop[index + 4];

	    beta = prop[index + 6];
	    reynolds = abs(*xflow) * d__ / (*dvi * a);

	    cd_pk_ms__(&rad, &d__, &dl, &reynolds, &p2, &p1, &beta, &kappa, &
		    cd, &u, &t1, r__);

/*     outlet circumferential velocity of the fluid is equal to the circumferential velocity of the hole */
/*     as the holes are perpendicular to the rotating surface and rotating with it */
/*     prop(index+7) */

/*     chamfer correction */

	    if (angle > 0.) {
		cd_chamfer__(&dl, &d__, &p1, &p2, &angle, &cd_chamf__);
		cd *= cd_chamf__;
	    }

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "ORC1", (ftnlen)4, (
		ftnlen)4) == 0) {

	    d__ = sqrt(a * 4 / pi);
	    reynolds = abs(*xflow) * d__ / (*dvi * a);
	    cd = 1.;

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "ORBT", (ftnlen)4, (
		ftnlen)4) == 0) {

/*     calculate the discharge coefficient of bleed tappings (OWN tables) */

	    ps1pt1 = prop[index + 2];
	    curve = (doublereal) i_dnnt(&prop[index + 3]);
	    number = i_dnnt(&prop[index + 4]);

	    if ((doublereal) number != 0.) {
		i__1 = number;
		for (i__ = 1; i__ <= i__1; ++i__) {
		    x_tab__[i__ - 1] = prop[index + (i__ << 1) + 3];
		    y_tab__[i__ - 1] = prop[index + (i__ << 1) + 4];
		}
	    }

	    cd_bleedtapping__(&p2, &p1, &ps1pt1, &number, &curve, x_tab__, 
		    y_tab__, &cd);

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "ORPN", (ftnlen)4, (
		ftnlen)4) == 0) {

/*     calculate the discharge coefficient of preswirl nozzle (OWN tables) */

	    d__ = sqrt(a * 4 / pi);
	    reynolds = abs(*xflow) * d__ / (*dvi * a);
	    curve = (doublereal) i_dnnt(&prop[index + 4]);
	    number = i_dnnt(&prop[index + 6]);
	    if ((doublereal) number != 0.) {
		i__1 = number;
		for (i__ = 1; i__ <= i__1; ++i__) {
		    x_tab2__[i__ - 1] = prop[index + (i__ << 1) + 5];
		    y_tab2__[i__ - 1] = prop[index + (i__ << 1) + 6];
		}
	    }
	    cd_preswirlnozzle__(&p2, &p1, &number, &curve, x_tab2__, y_tab2__,
		     &cd);

	    theta = prop[index + 2];
	    k_phi__ = prop[index + 3];

	    d__1 = 2 / (kappa + 1.);
	    d__2 = kappa / (kappa - 1.);
	    if (p2 / p1 > pow_dd(&d__1, &d__2)) {
/*               c2u_new=k_phi*cd*sin(theta*Pi/180.d0)*r* */
/*     &              dsqrt(2.d0*kappa/(r*(kappa-1)))* */
/*     &              dsqrt(T1*(1.d0-(p2/p1)**((kappa-1)/kappa))) */
		d__1 = p2 / p1;
		d__2 = 2. / kappa;
		d__3 = p2 / p1;
		d__4 = (kappa - 1) / kappa;
		c2u_new__ = k_phi__ * cd * cos(theta * pi / 180.) * *r__ * 
			sqrt(kappa * 2. / (*r__ * (kappa - 1.)) * pow_dd(&
			d__1, &d__2)) * sqrt(t1 * (1. - pow_dd(&d__3, &d__4)))
			;

	    } else {
/*               c2u_new=k_phi*cd*sin(theta*Pi/180.d0)*r* */
/*     &              dsqrt(2.d0*kappa/(r*(kappa-1)))* */
/*     &              dsqrt(T1*(1.d0-2/(kappa+1))) */
		d__1 = 2. / (kappa + 1.);
		d__2 = 2. / (kappa - 1.);
		c2u_new__ = k_phi__ * cd * cos(theta * pi / 180.) * *r__ * 
			sqrt(kappa * 2. / (*r__ * (kappa - 1)) * pow_dd(&d__1,
			 &d__2)) * sqrt(t1 * (1. - 2 / (kappa + 1)));
	    }
	    prop[index + 5] = c2u_new__;

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "ORFL", (ftnlen)4, (
		ftnlen)4) == 0) {
	    nodea = i_dnnt(&prop[index + 1]);
	    nodeb = i_dnnt(&prop[index + 2]);
	    offset = prop[index + 4];
/* Computing 2nd power */
	    d__1 = co[nodeb * 3 + 1] + vold[nodeb * vold_dim1 + 1] - co[nodea 
		    * 3 + 1] - vold[nodea * vold_dim1 + 1];
	    radius = sqrt(d__1 * d__1) - offset;

/* Computing 2nd power */
	    d__1 = co[nodeb * 3 + 1] - co[nodea * 3 + 1];
	    initial_radius__ = sqrt(d__1 * d__1) - offset;

/*            if(iaxial.ne.0) then */
/*               A=pi*radius**2/iaxial */
/*            else */
/* Computing 2nd power */
	    d__1 = radius;
	    a = pi * (d__1 * d__1);
/*            endif */
	    d__ = radius * 2;
	    reynolds = abs(*xflow) * d__ / (*dvi * a);
	    cd = 1.;

	}

	if (cd > 1.) {
	    s_wsle(&io___62);
	    do_lio(&c__9, &c__1, "*WARNING:", (ftnlen)9);
	    e_wsle();
	    s_wsle(&io___63);
	    do_lio(&c__9, &c__1, "In RESTRICTOR", (ftnlen)13);
	    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(integer));
	    e_wsle();
	    s_wsle(&io___64);
	    do_lio(&c__9, &c__1, "Cd greater than 1", (ftnlen)17);
	    e_wsle();
	    s_wsle(&io___65);
	    do_lio(&c__9, &c__1, "Calculation will proceed using Cd=1", (
		    ftnlen)35);
	    e_wsle();
	    cd = 1.;
	}

	p2p1 = p2 / p1;
	km1 = kappa - 1.;
	kp1 = kappa + 1.;
	kdkm1 = kappa / km1;
	tdkp1 = 2. / kp1;
	c2 = pow_dd(&tdkp1, &kdkm1);
	aeff = a * cd;
	dt1 = sqrt(t1);

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

/*     output */

    } else if (*kflag == 3) {

	pi = atan(1.) * 4.;
	p1 = v[*node1 * v_dim1 + 2];
	p2 = v[*node2 * v_dim1 + 2];
	if (p1 >= p2) {
	    inv = 1;
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    t1 = v[*node1 * v_dim1] - physcon[1];
	    t2 = v[*node2 * v_dim1] - physcon[1];
	} else {
	    inv = -1;
	    p1 = v[*node2 * v_dim1 + 2];
	    p2 = v[*node1 * v_dim1 + 2];
	    *xflow = -v[*nodem * v_dim1 + 1] * *iaxial;
	    t1 = v[*node2 * v_dim1] - physcon[1];
	    t2 = v[*node1 * v_dim1] - physcon[1];
	}

/*     calculation of the dynamic viscosity */

	if (abs(*dvi) < 1e-30) {
	    s_wsle(&io___77);
	    do_lio(&c__9, &c__1, "*ERROR in orifice: ", (ftnlen)19);
	    e_wsle();
	    s_wsle(&io___78);
	    do_lio(&c__9, &c__1, "       no dynamic viscosity defined", (
		    ftnlen)35);
	    e_wsle();
	    s_wsle(&io___79);
	    do_lio(&c__9, &c__1, "       dvi= ", (ftnlen)12);
	    do_lio(&c__5, &c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    e_wsle();
	    exit_(&c__201);
	}

	index = ielprop[*nelem];
	kappa = *cp / (*cp - *r__);
	a = prop[index + 1];

	if (s_cmp(lakon + ((*nelem << 3) + 3), "BT", (ftnlen)2, (ftnlen)2) != 
		0 && s_cmp(lakon + ((*nelem << 3) + 3), "PN", (ftnlen)2, (
		ftnlen)2) != 0 && s_cmp(lakon + ((*nelem << 3) + 3), "C1", (
		ftnlen)2, (ftnlen)2) != 0) {
	    d__ = prop[index + 2];
	    dl = prop[index + 3];
	    u = prop[index + 7];
	    nelemswirl = i_dnnt(&prop[index + 8]);
	    if (nelemswirl == 0) {
		uref = 0.;
	    } else {
/*     swirl generating element */

/*     preswirl nozzle */
		if (s_cmp(lakon + ((nelemswirl << 3) + 1), "ORPN", (ftnlen)4, 
			(ftnlen)4) == 0) {
		    uref = prop[ielprop[nelemswirl] + 5];
/*     rotating orifices */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "ORMM", (
			ftnlen)4, (ftnlen)4) == 0 || s_cmp(lakon + ((
			nelemswirl << 3) + 1), "ORMA", (ftnlen)4, (ftnlen)4) 
			== 0 || s_cmp(lakon + ((nelemswirl << 3) + 1), "ORPM",
			 (ftnlen)4, (ftnlen)4) == 0 || s_cmp(lakon + ((
			nelemswirl << 3) + 1), "ORPA", (ftnlen)4, (ftnlen)4) 
			== 0) {
		    uref = prop[ielprop[nelemswirl] + 7];
/*     forced vortex */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "VOFO", (
			ftnlen)4, (ftnlen)4) == 0) {
		    uref = prop[ielprop[nelemswirl] + 7];

/*     free vortex */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "VOFR", (
			ftnlen)4, (ftnlen)4) == 0) {
		    uref = prop[ielprop[nelemswirl] + 9];
/*     Moehring */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "MRG", (
			ftnlen)3, (ftnlen)3) == 0) {
		    uref = prop[ielprop[nelemswirl] + 10];
/*     RCAVO */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "ROR", (
			ftnlen)3, (ftnlen)3) == 0 || s_cmp(lakon + ((
			nelemswirl << 3) + 1), "ROA", (ftnlen)3, (ftnlen)3) ==
			 0) {
		    uref = prop[ielprop[nelemswirl] + 6];
/*     RCAVI */
		} else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "RCV", (
			ftnlen)3, (ftnlen)3) == 0) {
		    uref = prop[ielprop[nelemswirl] + 5];
		} else {
		    s_wsle(&io___80);
		    do_lio(&c__9, &c__1, "*ERROR in orifice:", (ftnlen)18);
		    e_wsle();
		    s_wsle(&io___81);
		    do_lio(&c__9, &c__1, " element", (ftnlen)8);
		    do_lio(&c__3, &c__1, (char *)&nelemswirl, (ftnlen)sizeof(
			    integer));
		    e_wsle();
		    s_wsle(&io___82);
		    do_lio(&c__9, &c__1, "refered by element", (ftnlen)18);
		    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			    integer));
		    e_wsle();
		    s_wsle(&io___83);
		    do_lio(&c__9, &c__1, "is not a swirl generating element", 
			    (ftnlen)33);
		    e_wsle();
		}
	    }
/*     write(*,*) 'nelem',nelem, u, uref */
	    u -= uref;
	    angle = prop[index + 5];

	}

/*     calculate the discharge coefficient using Bragg's Method */
/*     "Effect of Compressibility on the discharge coefficient */
/*     of orifices and convergent nozzles" */
/*     journal of mechanical Engineering */
/*     vol2 No 1 1960 */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "ORBG", (ftnlen)4, (ftnlen)4) 
		== 0) {

	    p2p1 = p2 / p1;
	    d__ = sqrt(a * 4 / pi);
	    reynolds = abs(*xflow) * d__ / (*dvi * a);
	    cdcrit = prop[index + 2];

	    itype = 2;
	    cd_bragg__(&cdcrit, &p2p1, &cd, &itype);

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "ORMA", (ftnlen)4, (
		ftnlen)4) == 0) {

/*     calculate the discharge coefficient using own table data and */
/*     using Dr.Albers method for rotating cavities */

	    reynolds = abs(*xflow) * d__ / (*dvi * a);

	    cd_own_albers__(&p1, &p2, &dl, &d__, &cd, &u, &t1, r__, &kappa);

/*     chamfer correction */

	    if (angle > 0.) {
		cd_chamfer__(&dl, &d__, &p1, &p2, &angle, &cd_chamf__);
		cd *= cd_chamf__;
	    }

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "ORMM", (ftnlen)4, (
		ftnlen)4) == 0) {

/*     calculate the discharge coefficient using McGreehan and Schotsch method */

	    rad = prop[index + 4];

	    reynolds = abs(*xflow) * d__ / (*dvi * a);

	    cd_ms_ms__(&p1, &p2, &t1, &rad, &d__, &dl, &kappa, r__, &reynolds,
		     &u, &vid, &cd);

	    if (cd >= 1.) {
		s_wsle(&io___84);
		do_lio(&c__9, &c__1, "", (ftnlen)0);
		e_wsle();
		s_wsle(&io___85);
		do_lio(&c__9, &c__1, "**WARNING**", (ftnlen)11);
		e_wsle();
		s_wsle(&io___86);
		do_lio(&c__9, &c__1, "in RESTRICTOR ", (ftnlen)14);
		do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			integer));
		e_wsle();
		s_wsle(&io___87);
		do_lio(&c__9, &c__1, "Calculation using", (ftnlen)17);
		e_wsle();
		s_wsle(&io___88);
		do_lio(&c__9, &c__1, " McGreehan and Schotsch method:", (
			ftnlen)31);
		e_wsle();
		s_wsle(&io___89);
		do_lio(&c__9, &c__1, " Cd=", (ftnlen)4);
		do_lio(&c__5, &c__1, (char *)&cd, (ftnlen)sizeof(doublereal));
		do_lio(&c__9, &c__1, ">1 !", (ftnlen)4);
		e_wsle();
		s_wsle(&io___90);
		do_lio(&c__9, &c__1, "Calcultion will proceed will Cd=1", (
			ftnlen)33);
		e_wsle();
		s_wsle(&io___91);
		do_lio(&c__9, &c__1, "l/d=", (ftnlen)4);
		d__1 = dl / d__;
		do_lio(&c__5, &c__1, (char *)&d__1, (ftnlen)sizeof(doublereal)
			);
		do_lio(&c__9, &c__1, "r/d=", (ftnlen)4);
		d__2 = rad / d__;
		do_lio(&c__5, &c__1, (char *)&d__2, (ftnlen)sizeof(doublereal)
			);
		do_lio(&c__9, &c__1, "u/vid=", (ftnlen)6);
		d__3 = u / vid;
		do_lio(&c__5, &c__1, (char *)&d__3, (ftnlen)sizeof(doublereal)
			);
		e_wsle();
		cd = 1.;
	    }

/*     chamfer correction */

	    if (angle > 0.) {
		cd_chamfer__(&dl, &d__, &p1, &p2, &angle, &cd_chamf__);
		cd *= cd_chamf__;
	    }

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "ORPA", (ftnlen)4, (
		ftnlen)4) == 0) {

/*     calculate the discharge coefficient using Parker and Kercher method */
/*     and using Dr. Albers method for rotating cavities */

	    rad = prop[index + 4];

	    beta = prop[index + 6];

	    reynolds = abs(*xflow) * d__ / (*dvi * a);

	    cd_pk_albers__(&rad, &d__, &dl, &reynolds, &p2, &p1, &beta, &
		    kappa, &cd, &u, &t1, r__);

/*     chamfer correction */

	    if (angle > 0.) {
		cd_chamfer__(&dl, &d__, &p1, &p2, &angle, &cd_chamf__);
		cd *= cd_chamf__;
	    }

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "ORPM", (ftnlen)4, (
		ftnlen)4) == 0) {

/*     calculate the discharge coefficient using Parker and Kercher method */
/*     and using Mac Grehan and Schotsch method for rotating cavities */

	    rad = prop[index + 4];

	    beta = prop[index + 6];
	    reynolds = abs(*xflow) * d__ / (*dvi * a);

	    cd_pk_ms__(&rad, &d__, &dl, &reynolds, &p2, &p1, &beta, &kappa, &
		    cd, &u, &t1, r__);

/*     chamfer correction */

	    if (angle > 0.) {
		cd_chamfer__(&dl, &d__, &p1, &p2, &angle, &cd_chamf__);
		cd *= cd_chamf__;
	    }

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "ORC1", (ftnlen)4, (
		ftnlen)4) == 0) {

	    d__ = sqrt(a * 4 / pi);
	    reynolds = abs(*xflow) * d__ / (*dvi * a);
	    cd = 1.;

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "ORBT", (ftnlen)4, (
		ftnlen)4) == 0) {

/*     calculate the discharge coefficient of bleed tappings (OWN tables) */

	    d__ = sqrt(a * pi / 4);
	    reynolds = abs(*xflow) * d__ / (*dvi * a);
	    ps1pt1 = prop[index + 2];
	    curve = (doublereal) i_dnnt(&prop[index + 3]);
	    number = i_dnnt(&prop[index + 4]);
	    reynolds = abs(*xflow) * d__ / (*dvi * a);
	    if ((doublereal) number != 0.) {
		i__1 = number;
		for (i__ = 1; i__ <= i__1; ++i__) {
		    x_tab__[i__ - 1] = prop[index + (i__ << 1) + 3];
		    y_tab__[i__ - 1] = prop[index + (i__ << 1) + 4];
		}
	    }

	    cd_bleedtapping__(&p2, &p1, &ps1pt1, &number, &curve, x_tab__, 
		    y_tab__, &cd);

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "ORPN", (ftnlen)4, (
		ftnlen)4) == 0) {

/*     calculate the discharge coefficient of preswirl nozzle (OWN tables) */

	    d__ = sqrt(a * 4 / pi);
	    reynolds = abs(*xflow) * d__ / (*dvi * a);
	    curve = (doublereal) i_dnnt(&prop[index + 4]);
	    number = i_dnnt(&prop[index + 6]);

	    if ((doublereal) number != 0.) {
		i__1 = number;
		for (i__ = 1; i__ <= i__1; ++i__) {
		    x_tab2__[i__ - 1] = prop[index + (i__ << 1) + 5];
		    y_tab2__[i__ - 1] = prop[index + (i__ << 1) + 6];
		}
	    }

	    cd_preswirlnozzle__(&p2, &p1, &number, &curve, x_tab2__, y_tab2__,
		     &cd);

	    theta = prop[index + 2];
	    k_phi__ = prop[index + 3];

	    d__1 = 2 / (kappa + 1.);
	    d__2 = kappa / (kappa - 1.);
	    if (p2 / p1 > pow_dd(&d__1, &d__2)) {
/*               c2u_new=k_phi*cd*sin(theta*Pi/180.d0)*r* */
/*     &              dsqrt(2.d0*kappa/(r*(kappa-1)))* */
/*     &              dsqrt(T1*(1.d0-(p2/p1)**((kappa-1)/kappa))) */
		d__1 = p2 / p1;
		d__2 = 2. / kappa;
		d__3 = p2 / p1;
		d__4 = (kappa - 1) / kappa;
		c2u_new__ = k_phi__ * cd * cos(theta * pi / 180.) * *r__ * 
			sqrt(kappa * 2. / (*r__ * (kappa - 1.)) * pow_dd(&
			d__1, &d__2)) * sqrt(t1 * (1. - pow_dd(&d__3, &d__4)))
			;

	    } else {
/*               c2u_new=k_phi*cd*sin(theta*Pi/180.d0)*r* */
/*     &              dsqrt(2.d0*kappa/(r*(kappa-1)))* */
/*     &              dsqrt(T1*(1.d0-2/(kappa+1))) */
		d__1 = 2. / (kappa + 1.);
		d__2 = 2. / (kappa - 1.);
		c2u_new__ = k_phi__ * cd * cos(theta * pi / 180.) * *r__ * 
			sqrt(kappa * 2. / (*r__ * (kappa - 1)) * pow_dd(&d__1,
			 &d__2)) * sqrt(t1 * (1. - 2 / (kappa + 1)));
	    }
	    prop[index + 5] = c2u_new__;
	}

	if (cd > 1.) {
	    s_wsle(&io___92);
	    do_lio(&c__9, &c__1, "*WARNING:", (ftnlen)9);
	    e_wsle();
	    s_wsle(&io___93);
	    do_lio(&c__9, &c__1, "In RESTRICTOR", (ftnlen)13);
	    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(integer));
	    e_wsle();
	    s_wsle(&io___94);
	    do_lio(&c__9, &c__1, "Cd greater than 1", (ftnlen)17);
	    e_wsle();
	    s_wsle(&io___95);
	    do_lio(&c__9, &c__1, "Calculation will proceed using Cd=1", (
		    ftnlen)35);
	    e_wsle();
	    cd = 1.;
	}
	xflow_oil__ = 0.;

	if (*kflag == 3) {

	    d__1 = p1 / p2;
	    d__2 = (kappa - 1.) / kappa;
	    xmach = sqrt((pow_dd(&d__1, &d__2) - 1.) * 2. / (kappa - 1.));
	    s_wsle(&io___98);
	    do_lio(&c__9, &c__1, "", (ftnlen)0);
	    e_wsle();
	    s_wsfe(&io___99);
	    do_fio(&c__1, " from node ", (ftnlen)11);
	    do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	    do_fio(&c__1, " to node ", (ftnlen)9);
	    do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	    do_fio(&c__1, " :   air massflow rate = ", (ftnlen)25);
	    d__1 = inv * *xflow;
	    do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " ", (ftnlen)1);
	    do_fio(&c__1, ", oil massflow rate = ", (ftnlen)22);
	    do_fio(&c__1, (char *)&xflow_oil__, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " ", (ftnlen)1);
	    e_wsfe();

	    if (inv == 1) {
		s_wsfe(&io___100);
		do_fio(&c__1, "       Inlet node ", (ftnlen)18);
		do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
		do_fio(&c__1, " :   Tt1 = ", (ftnlen)11);
		do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, "  , Ts1 = ", (ftnlen)10);
		do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, "  , Pt1 = ", (ftnlen)10);
		do_fio(&c__1, (char *)&p1, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, " ", (ftnlen)1);
		e_wsfe();

		s_wsle(&io___101);
		do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
		do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			integer));
		do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
		e_wsle();
		s_wsfe(&io___102);
		do_fio(&c__1, "             dyn.visc = ", (ftnlen)24);
		do_fio(&c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
		do_fio(&c__1, "  , Re = ", (ftnlen)9);
		do_fio(&c__1, (char *)&reynolds, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, ", M = ", (ftnlen)6);
		do_fio(&c__1, (char *)&xmach, (ftnlen)sizeof(doublereal));
		e_wsfe();
		if (s_cmp(lakon + ((*nelem << 3) + 1), "ORC1", (ftnlen)4, (
			ftnlen)4) == 0) {
		    s_wsfe(&io___103);
		    do_fio(&c__1, "             CD = ", (ftnlen)18);
		    do_fio(&c__1, (char *)&cd, (ftnlen)sizeof(doublereal));
		    e_wsfe();
		} else if (s_cmp(lakon + ((*nelem << 3) + 1), "ORMA", (ftnlen)
			4, (ftnlen)4) == 0 || s_cmp(lakon + ((*nelem << 3) + 
			1), "ORMM", (ftnlen)4, (ftnlen)4) == 0 || s_cmp(lakon 
			+ ((*nelem << 3) + 1), "ORPM", (ftnlen)4, (ftnlen)4) 
			== 0 || s_cmp(lakon + ((*nelem << 3) + 1), "ORPA", (
			ftnlen)4, (ftnlen)4) == 0) {
		    s_wsfe(&io___104);
		    do_fio(&c__1, "             CD = ", (ftnlen)18);
		    do_fio(&c__1, (char *)&cd, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , C1u = ", (ftnlen)9);
		    do_fio(&c__1, (char *)&u, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , C2u = ", (ftnlen)10);
		    do_fio(&c__1, (char *)&prop[index + 7], (ftnlen)sizeof(
			    doublereal));
		    do_fio(&c__1, " ", (ftnlen)1);
		    e_wsfe();
		}
/*     special for bleed tappings */
		if (s_cmp(lakon + ((*nelem << 3) + 1), "ORBT", (ftnlen)4, (
			ftnlen)4) == 0) {
		    s_wsfe(&io___105);
		    do_fio(&c__1, "             P2/P1 = ", (ftnlen)21);
		    d__1 = p2 / p1;
		    do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , ps1pt1 = ", (ftnlen)12);
		    do_fio(&c__1, (char *)&ps1pt1, (ftnlen)sizeof(doublereal))
			    ;
		    do_fio(&c__1, " , DAB = ", (ftnlen)9);
		    d__2 = (1 - p2 / p1) / (1 - ps1pt1);
		    do_fio(&c__1, (char *)&d__2, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , curve N\260 = ", (ftnlen)14);
		    do_fio(&c__1, (char *)&curve, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , cd = ", (ftnlen)8);
		    do_fio(&c__1, (char *)&cd, (ftnlen)sizeof(doublereal));
		    e_wsfe();
/*     special for preswirlnozzles */
		} else if (s_cmp(lakon + ((*nelem << 3) + 1), "ORPN", (ftnlen)
			4, (ftnlen)4) == 0) {
		    s_wsfe(&io___106);
		    do_fio(&c__1, "             cd = ", (ftnlen)18);
		    do_fio(&c__1, (char *)&cd, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , C2u = ", (ftnlen)10);
		    do_fio(&c__1, (char *)&c2u_new__, (ftnlen)sizeof(
			    doublereal));
		    do_fio(&c__1, " ", (ftnlen)1);
		    e_wsfe();
/*     special for recievers */
		}

		s_wsfe(&io___107);
		do_fio(&c__1, "      Outlet node ", (ftnlen)18);
		do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
		do_fio(&c__1, " :   Tt2 = ", (ftnlen)11);
		do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, "  , Ts2 = ", (ftnlen)10);
		do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, "  , Pt2 = ", (ftnlen)10);
		do_fio(&c__1, (char *)&p2, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, " ", (ftnlen)1);
		e_wsfe();

	    } else if (inv == -1) {
		s_wsfe(&io___108);
		do_fio(&c__1, "       Inlet node ", (ftnlen)18);
		do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
		do_fio(&c__1, ":    Tt1 = ", (ftnlen)11);
		do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, "  , Ts1 = ", (ftnlen)10);
		do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, " , Pt1 = ", (ftnlen)9);
		do_fio(&c__1, (char *)&p1, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, " ", (ftnlen)1);
		e_wsfe();
		s_wsle(&io___109);
		do_lio(&c__9, &c__1, "             element R    ", (ftnlen)26)
			;
		do_lio(&c__9, &c__1, set + *numf * 81, (ftnlen)30);
		e_wsle();
		s_wsfe(&io___110);
		do_fio(&c__1, "             dyn.visc. = ", (ftnlen)25);
		do_fio(&c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
		do_fio(&c__1, " , Re =", (ftnlen)7);
		do_fio(&c__1, (char *)&reynolds, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, ", M = ", (ftnlen)6);
		do_fio(&c__1, (char *)&xmach, (ftnlen)sizeof(doublereal));
		e_wsfe();
		if (s_cmp(lakon + ((*nelem << 3) + 1), "ORC1", (ftnlen)4, (
			ftnlen)4) == 0) {
		    s_wsfe(&io___111);
		    do_fio(&c__1, "             CD = ", (ftnlen)18);
		    do_fio(&c__1, (char *)&cd, (ftnlen)sizeof(doublereal));
		    e_wsfe();
		} else if (s_cmp(lakon + ((*nelem << 3) + 1), "ORMA", (ftnlen)
			4, (ftnlen)4) == 0 || s_cmp(lakon + ((*nelem << 3) + 
			1), "ORMM", (ftnlen)4, (ftnlen)4) == 0 || s_cmp(lakon 
			+ ((*nelem << 3) + 1), "ORPM", (ftnlen)4, (ftnlen)4) 
			== 0 || s_cmp(lakon + ((*nelem << 3) + 1), "ORPA", (
			ftnlen)4, (ftnlen)4) == 0) {
		    s_wsfe(&io___112);
		    do_fio(&c__1, "             CD = ", (ftnlen)18);
		    do_fio(&c__1, (char *)&cd, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , C1u = ", (ftnlen)9);
		    do_fio(&c__1, (char *)&u, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, "  , C2u = ", (ftnlen)10);
		    do_fio(&c__1, (char *)&prop[index + 7], (ftnlen)sizeof(
			    doublereal));
		    do_fio(&c__1, " ", (ftnlen)1);
		    e_wsfe();
		}
/*     special for bleed tappings */
		if (s_cmp(lakon + ((*nelem << 3) + 1), "ORBT", (ftnlen)4, (
			ftnlen)4) == 0) {
		    s_wsfe(&io___113);
		    do_fio(&c__1, "             P2/P1 = ", (ftnlen)21);
		    d__1 = p2 / p1;
		    do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , ps1pt1 = ", (ftnlen)12);
		    do_fio(&c__1, (char *)&ps1pt1, (ftnlen)sizeof(doublereal))
			    ;
		    do_fio(&c__1, " , DAB = ", (ftnlen)9);
		    d__2 = (1 - p2 / p1) / (1 - ps1pt1);
		    do_fio(&c__1, (char *)&d__2, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , curve N\260 = ", (ftnlen)14);
		    do_fio(&c__1, (char *)&curve, (ftnlen)sizeof(doublereal));
		    do_fio(&c__1, " , cd = ", (ftnlen)8);
		    do_fio(&c__1, (char *)&cd, (ftnlen)sizeof(doublereal));
		    e_wsfe();
/*     special for preswirlnozzles */
		} else if (s_cmp(lakon + ((*nelem << 3) + 1), "ORPN", (ftnlen)
			4, (ftnlen)4) == 0) {
		    s_wsle(&io___114);
		    do_lio(&c__9, &c__1, " cd = ", (ftnlen)6);
		    do_lio(&c__5, &c__1, (char *)&cd, (ftnlen)sizeof(
			    doublereal));
		    do_lio(&c__9, &c__1, " , C2u = ", (ftnlen)9);
		    do_lio(&c__5, &c__1, (char *)&c2u_new__, (ftnlen)sizeof(
			    doublereal));
		    do_lio(&c__9, &c__1, " ", (ftnlen)1);
		    e_wsle();
		}

		s_wsfe(&io___115);
		do_fio(&c__1, "      Outlet node ", (ftnlen)18);
		do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
		do_fio(&c__1, ":    Tt2 = ", (ftnlen)11);
		do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, "  , Ts2 = ", (ftnlen)10);
		do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, "  , Pt2 = ", (ftnlen)10);
		do_fio(&c__1, (char *)&p2, (ftnlen)sizeof(doublereal));
		do_fio(&c__1, " ", (ftnlen)1);
		e_wsfe();
	    }
	}


    }


    *xflow /= *iaxial;
    df[3] *= *iaxial;

    return 0;
} /* orifice_ */

