/* user_network_element_p1.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int user_network_element_p1__(integer *node1, integer *node2,
	 integer *nodem, integer *nelem, char *lakon, integer *kon, integer *
	ipkon, integer *nactdog, logical *identity, integer *ielprop, 
	doublereal *prop, integer *kflag, doublereal *v, doublereal *xflow, 
	doublereal *f, integer *nodef, integer *idirf, doublereal *df, 
	doublereal *cp, doublereal *r__, doublereal *physcon, doublereal *dvi,
	 integer *numf, char *set, doublereal *co, doublereal *vold, integer *
	mi, doublereal *ttime, doublereal *time, integer *iaxial, integer *
	iplausi, ftnlen lakon_len, ftnlen set_len)
{
    /* Format strings */
    static char fmt_55[] = "(1x,a,i6,a,i6,a,e11.4,a,a,e11.4,a)";
    static char fmt_56[] = "(1x,a,i6,a,e11.4,a,e11.4,a,e11.4,a)";
    static char fmt_57[] = "(1x,a,e11.4,a,e11.4,a,e11.4)";

    /* System generated locals */
    integer v_dim1, v_offset, vold_dim1, vold_offset;
    doublereal d__1, d__2;

    /* Builtin functions */
    double atan(doublereal), sqrt(doublereal);
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);
    double pow_dd(doublereal *, doublereal *);
    integer s_wsfe(cilist *), do_fio(integer *, char *, ftnlen), e_wsfe(void);

    /* Local variables */
    doublereal reynolds, a, c__, d__, t1, t2, xflow_oil__, pi, pt1, pt2, tt1, 
	    tt2;
    integer inv;
    extern /* Subroutine */ int exit_(integer *);
    integer icase;
    doublereal kappa, xmach;
    integer index;
    extern /* Subroutine */ int ts_calc__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *);

    /* Fortran I/O blocks */
    static cilist io___14 = { 0, 6, 0, 0, 0 };
    static cilist io___15 = { 0, 6, 0, 0, 0 };
    static cilist io___16 = { 0, 6, 0, 0, 0 };
    static cilist io___21 = { 0, 1, 0, 0, 0 };
    static cilist io___22 = { 0, 1, 0, fmt_55, 0 };
    static cilist io___23 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___24 = { 0, 1, 0, 0, 0 };
    static cilist io___25 = { 0, 1, 0, fmt_57, 0 };
    static cilist io___26 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___27 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___28 = { 0, 1, 0, 0, 0 };
    static cilist io___29 = { 0, 1, 0, fmt_57, 0 };
    static cilist io___30 = { 0, 1, 0, fmt_56, 0 };



/*     UP1 element: mass flow = c * dsqrt(pt2-pt1) */

/*     f:= c * dsqrt(pt2-pt1) - mass flow */

/*     for this element it is known that the flow direction */
/*     has to correspond to the pressure drop */

/*     INPUT: */

/*     node1              first node in element topology */
/*     node2              third node in element topology */
/*     nodem              second node in element topology (middle node) */
/*     nelem              element number */
/*     lakon(i)           label of element i */
/*     kon                connectivity list of all elements; the topology */
/*                        of element i starts at kon(ipkon(i)) */
/*     ipkon(i)           pointer of element i into list kon */
/*     nactdog(j,i)       global degree of freedom in the network */
/*                        equation system of local dof j (0,1 or 2 for */
/*                        networks) of node i. If nactdog(j,i)=0 the */
/*                        variable is known */
/*     ielprop(i)         pointer for element i into field prop. The */
/*                        properties for element i start at */
/*                        prop(ielprop(i)+1,...) */
/*     prop               field of all properties */
/*     kflag              indicates what information should be returned */
/*                        by the routine: */
/*                        0: identity */
/*                        1: xflow */
/*                        2: numf, nodef, idirf, f, df */
/*                        3: none */
/*     v(0..mi(2),i)      values at node i in the current network */
/*                        iteration (0=total temperature, */
/*                        1=mass flow, 2=total pressure for network nodes, */
/*                        0=temperature, 1..3=displacements for structural */
/*                        nodes) */
/*     cp                 specific heat at constant pressure corresponding */
/*                        to a mean static temperature across the element */
/*     R                  specific gas constant */
/*     physcon(1..)       physical constants (e.g. physcon(1) is absolute */
/*                        zero in the unit systemof the user; cf. the */
/*                        user's manual for the other entries) */
/*     dvi                dynamical viscosity corresponding */
/*                        to a mean static temperature across the element */
/*     set(i)             set name corresponding to set i */
/*     co(1..3,i)         coordinates of node i in the global system */
/*     vold(0..mi(2),i)   values at node i at the start of the current network */
/*                        iterations (0=total temperature, */
/*                        1=mass flow, 2=total pressure for network nodes, */
/*                        0=temperature, 1..3=displacements for structural */
/*                        nodes) */
/*     mi(2)              max degree of freedom per node (max over all */
/*                        nodes) in fields like v(0:mi(2))...; the other */
/*                        values of mi are not relevant here */
/*     ttime              total time at the end of the current */
/*                        thermo-mechanical increment. To reach the end */
/*                        of this increment several thermo-mechanical */
/*                        iterations are performed. For each of these */
/*                        iterations a loop of network iterations is */
/*                        performed */
/*     time               step time a the end of the current thermo- */
/*                        mechanical increment */
/*     iaxial             number of times the current structure fits into */
/*                        360 degrees */
/*     iplausi            flag telling whether any plausibility checks */
/*                        have been violated up to entry in this routine */
/*                        0: plausibility checks not satisfied */
/*                        1: plausibility checks (if any) are satisfied */


/*     OUTPUT: */

/*     identity           if .true. the user_network_element routine is */
/*                        not needed (all variables known) */
/*     xflow              mass flow */
/*     f                  value of the element equation */
/*     nodef              nodes corresponding to the variables in the */
/*                        element equation */
/*     idirf              degrees of freedom corresponding to the variables */
/*                        in the element equation */
/*     df                 derivatives of the element equation w.r.t. its */
/*                        variables */
/*     numf               number of variables in the element equation */
/*     iplausi            flag telling whether any plausibility checks */
/*                        were violated at return time from this routine */
/*                        0: plausibility checks not satisfied */
/*                        1: plausibility checks (if any) are satisfied */
/*                        only feasible change within this routine is from */
/*                        1 to 0. */







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

/*        called by envtemp.f: */

/*        check whether element equation is needed (this is the */
/*        case if identity=.false. */

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

/*        called by initialnet.f: */

/*        calculation of the mass flow if everything else is known */

	index = ielprop[*nelem];
	c__ = prop[index + 2];

	pt1 = v[*node1 * v_dim1 + 2];
	pt2 = v[*node2 * v_dim1 + 2];
	if (pt1 >= pt2) {
	    inv = 1;
	} else {
	    inv = -1;
	    pt1 = v[*node2 * v_dim1 + 2];
	    pt2 = v[*node1 * v_dim1 + 2];
	}

	*xflow = c__ * sqrt(pt1 - pt2);

    } else if (*kflag == 2) {

/*        called by resultnet.f and mafillnet.f */

	*numf = 3;
	index = ielprop[*nelem];

	pt1 = v[*node1 * v_dim1 + 2];
	pt2 = v[*node2 * v_dim1 + 2];
	if (pt1 >= pt2) {

/*           flow direction corresponds to element orientation */

	    inv = 1;
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    nodef[1] = *node1;
	    nodef[2] = *nodem;
	    nodef[3] = *node2;
	} else {

/*           flow direction does not correspond to element orientation */

	    inv = -1;
	    pt1 = v[*node2 * v_dim1 + 2];
	    pt2 = v[*node1 * v_dim1 + 2];
	    *xflow = -v[*nodem * v_dim1 + 1] * *iaxial;
	    nodef[1] = *node2;
	    nodef[2] = *nodem;
	    nodef[3] = *node1;
	}

	idirf[1] = 2;
	idirf[2] = 1;
	idirf[3] = 2;

/*        nodef and idirf show that the variables are (if inv=1): */
/*        1. total pressure in node 1 */
/*        2. mass flow */
/*        3. total pressure in node 2 */

	c__ = prop[index + 2];

	*f = c__ * sqrt(pt1 - pt2) - *xflow;
	df[1] = c__ / (sqrt(pt1 - pt2) * 2.);
	df[2] = inv * -1.;
	df[3] = -df[1];

/*     output */

    } else if (*kflag == 3) {

/*        called by flowoutput.f */

/*        storage in the .net-file */

	index = ielprop[*nelem];
	a = prop[index + 1];
	kappa = *cp / (*cp - *r__);
	icase = 1;

	pt1 = v[*node1 * v_dim1 + 2];
	pt2 = v[*node2 * v_dim1 + 2];
	if (pt1 >= pt2) {
	    inv = 1;
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    tt1 = v[*node1 * v_dim1] - physcon[1];
	    tt2 = v[*node2 * v_dim1] - physcon[1];
	} else {
	    inv = -1;
	    pt1 = v[*node2 * v_dim1 + 2];
	    pt2 = v[*node1 * v_dim1 + 2];
	    *xflow = -v[*nodem * v_dim1 + 1] * *iaxial;
	    tt1 = v[*node2 * v_dim1] - physcon[1];
	    tt2 = v[*node1 * v_dim1] - physcon[1];
	}

/*        calculation of the static temperatures */

	if (*(unsigned char *)&lakon[(*nelem << 3) + 2] == 'P') {

/*           "pipe"-like element: total and static temperatures */
/*           differ */

	    ts_calc__(xflow, &tt1, &pt1, &kappa, r__, &a, &t1, &icase);
	    ts_calc__(xflow, &tt2, &pt2, &kappa, r__, &a, &t2, &icase);
	} else {

/*           "chamber-connecting"-like element: total and static */
/*           temperatures are equal */

	    t1 = tt1;
	    t2 = tt2;
	}

/*     calculation of the dynamic viscosity */

	if (abs(*dvi) < 1e-30) {
	    s_wsle(&io___14);
	    do_lio(&c__9, &c__1, "*ERROR in orifice: ", (ftnlen)19);
	    e_wsle();
	    s_wsle(&io___15);
	    do_lio(&c__9, &c__1, "       no dynamic viscosity defined", (
		    ftnlen)35);
	    e_wsle();
	    s_wsle(&io___16);
	    do_lio(&c__9, &c__1, "       dvi= ", (ftnlen)12);
	    do_lio(&c__5, &c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    e_wsle();
	    exit_(&c__201);
	}

	index = ielprop[*nelem];
	kappa = *cp / (*cp - *r__);
	a = prop[index + 1];
	d__ = sqrt(a * 4 / pi);
	reynolds = abs(*xflow) * d__ / (*dvi * a);
	d__1 = pt1 / pt2;
	d__2 = (kappa - 1.) / kappa;
	xmach = sqrt((pow_dd(&d__1, &d__2) - 1.) * 2. / (kappa - 1.));

	xflow_oil__ = 0.;

	s_wsle(&io___21);
	do_lio(&c__9, &c__1, "", (ftnlen)0);
	e_wsle();
	s_wsfe(&io___22);
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
	    s_wsfe(&io___23);
	    do_fio(&c__1, "       Inlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	    do_fio(&c__1, " :   Tt1 = ", (ftnlen)11);
	    do_fio(&c__1, (char *)&tt1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Ts1 = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Pt1 = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&pt1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " ", (ftnlen)1);
	    e_wsfe();

	    s_wsle(&io___24);
	    do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
	    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(integer));
	    do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
	    e_wsle();
	    s_wsfe(&io___25);
	    do_fio(&c__1, "             dyn.visc = ", (ftnlen)24);
	    do_fio(&c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Re = ", (ftnlen)9);
	    do_fio(&c__1, (char *)&reynolds, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", M = ", (ftnlen)6);
	    do_fio(&c__1, (char *)&xmach, (ftnlen)sizeof(doublereal));
	    e_wsfe();

	    s_wsfe(&io___26);
	    do_fio(&c__1, "      Outlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	    do_fio(&c__1, " :   Tt2 = ", (ftnlen)11);
	    do_fio(&c__1, (char *)&tt2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Ts2 = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Pt2 = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&pt2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " ", (ftnlen)1);
	    e_wsfe();

	} else if (inv == -1) {
	    s_wsfe(&io___27);
	    do_fio(&c__1, "       Inlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	    do_fio(&c__1, ":    Tt1 = ", (ftnlen)11);
	    do_fio(&c__1, (char *)&tt1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Ts1 = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , Pt1 = ", (ftnlen)9);
	    do_fio(&c__1, (char *)&pt1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " ", (ftnlen)1);
	    e_wsfe();
	    s_wsle(&io___28);
	    do_lio(&c__9, &c__1, "             element R    ", (ftnlen)26);
	    do_lio(&c__9, &c__1, set + *numf * 81, (ftnlen)30);
	    e_wsle();
	    s_wsfe(&io___29);
	    do_fio(&c__1, "             dyn.visc. = ", (ftnlen)25);
	    do_fio(&c__1, (char *)&(*dvi), (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , Re =", (ftnlen)7);
	    do_fio(&c__1, (char *)&reynolds, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", M = ", (ftnlen)6);
	    do_fio(&c__1, (char *)&xmach, (ftnlen)sizeof(doublereal));
	    e_wsfe();

	    s_wsfe(&io___30);
	    do_fio(&c__1, "      Outlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	    do_fio(&c__1, ":    Tt2 = ", (ftnlen)11);
	    do_fio(&c__1, (char *)&tt2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Ts2 = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Pt2 = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&pt2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " ", (ftnlen)1);
	    e_wsfe();
	}

    }


/*     degree of freedom 2 is the mass flow dof (cf. field idirf) */

    *xflow /= *iaxial;
    df[2] *= *iaxial;

    return 0;
} /* user_network_element_p1__ */

