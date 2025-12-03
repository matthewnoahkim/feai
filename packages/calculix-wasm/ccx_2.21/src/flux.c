/* flux.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int flux_(integer *node1, integer *node2, integer *nodem, 
	integer *nelem, char *lakon, integer *kon, integer *ipkon, integer *
	nactdog, logical *identity, integer *ielprop, doublereal *prop, 
	integer *kflag, doublereal *v, doublereal *xflow, doublereal *f, 
	integer *nodef, integer *idirf, doublereal *df, doublereal *cp, 
	doublereal *r__, doublereal *rho, doublereal *physcon, doublereal *g, 
	doublereal *co, doublereal *dvi, integer *numf, doublereal *vold, 
	char *set, doublereal *shcon, integer *nshcon, doublereal *rhcon, 
	integer *nrhcon, integer *ntmat___, integer *mi, integer *ider, 
	doublereal *ttime, doublereal *time, integer *iaxial, integer *
	iplausi, ftnlen lakon_len, ftnlen set_len)
{
    /* System generated locals */
    integer v_dim1, v_offset, vold_dim1, vold_offset, shcon_dim2, 
	    shcon_offset, rhcon_dim2, rhcon_offset;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    extern /* Subroutine */ int moehring_(integer *, integer *, integer *, 
	    integer *, char *, integer *, integer *, integer *, logical *, 
	    integer *, doublereal *, integer *, doublereal *, doublereal *, 
	    doublereal *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, char *, integer *, 
	    doublereal *, doublereal *, integer *, integer *, ftnlen, ftnlen),
	     massflow_percent__(integer *, integer *, integer *, integer *, 
	    char *, integer *, integer *, integer *, logical *, integer *, 
	    doublereal *, integer *, doublereal *, doublereal *, doublereal *,
	     integer *, integer *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, char *, doublereal *, 
	    integer *, doublereal *, integer *, integer *, doublereal *, 
	    doublereal *, integer *, doublereal *, doublereal *, integer *, 
	    integer *, ftnlen, ftnlen), air_valve__(integer *, integer *, 
	    integer *, integer *, char *, integer *, integer *, integer *, 
	    logical *, integer *, doublereal *, integer *, doublereal *, 
	    doublereal *, doublereal *, integer *, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     char *, doublereal *, doublereal *, integer *, doublereal *, 
	    doublereal *, integer *, integer *, ftnlen, ftnlen), labyrinth_(
	    integer *, integer *, integer *, integer *, char *, integer *, 
	    logical *, integer *, doublereal *, integer *, doublereal *, 
	    doublereal *, doublereal *, integer *, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, doublereal *, char *, integer *, integer 
	    *, integer *, doublereal *, doublereal *, integer *, integer *, 
	    ftnlen, ftnlen), free_disc_pumping__(integer *, integer *, 
	    integer *, integer *, char *, integer *, integer *, integer *, 
	    logical *, integer *, doublereal *, integer *, doublereal *, 
	    doublereal *, doublereal *, integer *, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     char *, doublereal *, integer *, doublereal *, integer *, 
	    integer *, doublereal *, doublereal *, integer *, doublereal *, 
	    doublereal *, integer *, integer *, ftnlen, ftnlen), 
	    absolute_relative__(integer *, integer *, integer *, integer *, 
	    char *, integer *, integer *, integer *, logical *, integer *, 
	    doublereal *, integer *, doublereal *, doublereal *, doublereal *,
	     integer *, integer *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, char *, integer *, doublereal *, 
	    doublereal *, integer *, integer *, ftnlen, ftnlen), liquidpipe_(
	    integer *, integer *, integer *, integer *, char *, integer *, 
	    logical *, integer *, doublereal *, integer *, doublereal *, 
	    doublereal *, doublereal *, integer *, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     doublereal *, integer *, integer *, integer *, char *, 
	    doublereal *, doublereal *, integer *, integer *, ftnlen, ftnlen),
	     liquidpump_(integer *, integer *, integer *, integer *, integer *
	    , logical *, integer *, doublereal *, integer *, doublereal *, 
	    doublereal *, doublereal *, integer *, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, integer *, integer *, 
	    doublereal *, doublereal *, integer *, integer *), restrictor_(
	    integer *, integer *, integer *, integer *, char *, integer *, 
	    integer *, integer *, logical *, integer *, doublereal *, integer 
	    *, doublereal *, doublereal *, doublereal *, integer *, integer *,
	     doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, char *, doublereal *, integer *, 
	    doublereal *, integer *, integer *, integer *, doublereal *, 
	    doublereal *, integer *, doublereal *, doublereal *, integer *, 
	    ftnlen, ftnlen), tee_(integer *, integer *, integer *, integer *, 
	    char *, integer *, integer *, integer *, logical *, integer *, 
	    doublereal *, integer *, doublereal *, doublereal *, doublereal *,
	     integer *, integer *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, char *, integer *, integer *, doublereal 
	    *, doublereal *, integer *, integer *, ftnlen, ftnlen), wye_(
	    integer *, integer *, integer *, integer *, char *, integer *, 
	    integer *, integer *, logical *, integer *, doublereal *, integer 
	    *, doublereal *, doublereal *, doublereal *, integer *, integer *,
	     doublereal *, doublereal *, doublereal *, doublereal *, integer *
	    , char *, integer *, integer *, doublereal *, doublereal *, 
	    integer *, integer *, doublereal *, ftnlen, ftnlen), 
	    acctube_one__(integer *, integer *, integer *, integer *, char *, 
	    integer *, integer *, integer *, logical *, integer *, doublereal 
	    *, integer *, doublereal *, doublereal *, doublereal *, integer *,
	     integer *, doublereal *, doublereal *, doublereal *, doublereal *
	    , doublereal *, integer *, char *, integer *, integer *, 
	    doublereal *, doublereal *, integer *, integer *, ftnlen, ftnlen),
	     carbon_seal__(integer *, integer *, integer *, integer *, char *,
	     integer *, logical *, integer *, doublereal *, integer *, 
	    doublereal *, doublereal *, doublereal *, integer *, integer *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     char *, integer *, doublereal *, doublereal *, integer *, 
	    integer *, ftnlen, ftnlen), gaspipe_rot__(integer *, integer *, 
	    integer *, integer *, char *, integer *, integer *, integer *, 
	    logical *, integer *, doublereal *, integer *, doublereal *, 
	    doublereal *, doublereal *, integer *, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     char *, doublereal *, integer *, doublereal *, integer *, 
	    integer *, doublereal *, doublereal *, integer *, doublereal *, 
	    doublereal *, integer *, integer *, ftnlen, ftnlen), 
	    cross_split__(integer *, integer *, integer *, integer *, char *, 
	    integer *, integer *, integer *, logical *, integer *, doublereal 
	    *, integer *, doublereal *, doublereal *, doublereal *, integer *,
	     integer *, doublereal *, doublereal *, doublereal *, doublereal *
	    , integer *, char *, integer *, integer *, doublereal *, 
	    doublereal *, integer *, integer *, ftnlen, ftnlen), rcavi_(
	    integer *, integer *, integer *, integer *, char *, integer *, 
	    integer *, integer *, logical *, integer *, doublereal *, integer 
	    *, doublereal *, doublereal *, doublereal *, integer *, integer *,
	     doublereal *, doublereal *, doublereal *, doublereal *, integer *
	    , char *, integer *, doublereal *, doublereal *, integer *, 
	    integer *, ftnlen, ftnlen), user_network_element__(integer *, 
	    integer *, integer *, integer *, char *, integer *, integer *, 
	    integer *, logical *, integer *, doublereal *, integer *, 
	    doublereal *, doublereal *, doublereal *, integer *, integer *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, char *, doublereal *, doublereal *, 
	    integer *, doublereal *, doublereal *, integer *, integer *, 
	    ftnlen, ftnlen), gaspipe_fanno__(integer *, integer *, integer *, 
	    integer *, char *, integer *, integer *, integer *, logical *, 
	    integer *, doublereal *, integer *, doublereal *, doublereal *, 
	    doublereal *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, integer *, char *, 
	    doublereal *, integer *, doublereal *, integer *, integer *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     integer *, integer *, ftnlen, ftnlen), rcavi2_(integer *, 
	    integer *, integer *, integer *, char *, integer *, integer *, 
	    integer *, logical *, integer *, doublereal *, integer *, 
	    doublereal *, doublereal *, doublereal *, integer *, integer *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     char *, integer *, doublereal *, doublereal *, integer *, 
	    integer *, ftnlen, ftnlen), scavenge_pump__(integer *, integer *, 
	    integer *, integer *, char *, integer *, integer *, integer *, 
	    logical *, integer *, doublereal *, integer *, doublereal *, 
	    doublereal *, doublereal *, integer *, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     char *, integer *, integer *, doublereal *, doublereal *, 
	    integer *, integer *, ftnlen, ftnlen), characteristic_(integer *, 
	    integer *, integer *, integer *, char *, integer *, integer *, 
	    integer *, logical *, integer *, doublereal *, integer *, 
	    doublereal *, doublereal *, doublereal *, integer *, integer *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, char *, integer *, doublereal *, 
	    doublereal *, integer *, integer *, ftnlen, ftnlen), vortex_(
	    integer *, integer *, integer *, integer *, char *, integer *, 
	    integer *, integer *, logical *, integer *, doublereal *, integer 
	    *, doublereal *, doublereal *, doublereal *, integer *, integer *,
	     doublereal *, doublereal *, doublereal *, integer *, char *, 
	    integer *, doublereal *, doublereal *, integer *, integer *, 
	    ftnlen, ftnlen), acctube_(integer *, integer *, integer *, 
	    integer *, char *, integer *, integer *, integer *, logical *, 
	    integer *, doublereal *, integer *, doublereal *, doublereal *, 
	    doublereal *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, integer *, char *, 
	    integer *, integer *, doublereal *, doublereal *, integer *, 
	    integer *, ftnlen, ftnlen), orifice_(integer *, integer *, 
	    integer *, integer *, char *, integer *, integer *, integer *, 
	    logical *, integer *, doublereal *, integer *, doublereal *, 
	    doublereal *, doublereal *, integer *, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     char *, doublereal *, doublereal *, integer *, doublereal *, 
	    doublereal *, integer *, integer *, ftnlen, ftnlen), rimseal_(
	    integer *, integer *, integer *, integer *, char *, integer *, 
	    integer *, integer *, logical *, integer *, doublereal *, integer 
	    *, doublereal *, doublereal *, doublereal *, integer *, integer *,
	     doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, char *, integer *, doublereal *, 
	    doublereal *, integer *, doublereal *, doublereal *, integer *, 
	    ftnlen, ftnlen), free_convection__(integer *, integer *, integer *
	    , integer *, char *, integer *, integer *, integer *, logical *, 
	    integer *, doublereal *, integer *, doublereal *, doublereal *, 
	    doublereal *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, integer *, char *, 
	    doublereal *, integer *, doublereal *, integer *, integer *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     integer *, integer *, ftnlen, ftnlen);


/*     gas element routines */

/*     mass flow input for all gas element routines is the gas */
/*     flow for a 2 degrees segment with the correct sign */
/*     (positive if from node 1 to node2 of the element, */
/*      negative if from node 2 to node1 of the element) */





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
    --g;
    co -= 4;
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

    /* Function Body */
    if (s_cmp(lakon + ((*nelem << 3) + 1), "ATR", (ftnlen)3, (ftnlen)3) == 0 
	    || s_cmp(lakon + ((*nelem << 3) + 1), "RTA", (ftnlen)3, (ftnlen)3)
	     == 0) {

/*        absolute to relative system or vice versa */

	absolute_relative__(node1, node2, nodem, nelem, lakon + 8, &kon[1], &
		ipkon[1], &nactdog[4], identity, &ielprop[1], &prop[1], kflag,
		 &v[v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, 
		r__, &physcon[1], numf, set + 81, &mi[1], ttime, time, iaxial,
		 iplausi, (ftnlen)8, (ftnlen)81);

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "ACCTUBO", (ftnlen)7, (
	    ftnlen)7) == 0) {

/*        code not available in the internet distribution of CalculiX */

	acctube_one__(node1, node2, nodem, nelem, lakon + 8, &kon[1], &ipkon[
		1], &nactdog[4], identity, &ielprop[1], &prop[1], kflag, &v[
		v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, r__, &
		physcon[1], dvi, numf, set + 81, &mi[1], ider, ttime, time, 
		iaxial, iplausi, (ftnlen)8, (ftnlen)81);

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "ACCTUBE", (ftnlen)7, (
	    ftnlen)7) == 0) {

/*        code not available in the internet distribution of CalculiX */

	acctube_(node1, node2, nodem, nelem, lakon + 8, &kon[1], &ipkon[1], &
		nactdog[4], identity, &ielprop[1], &prop[1], kflag, &v[
		v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, r__, &
		physcon[1], dvi, numf, set + 81, &mi[1], ider, ttime, time, 
		iaxial, iplausi, (ftnlen)8, (ftnlen)81);

/* 	 code not available in the internet distribution of CalculiX */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "AVLV", (ftnlen)4, (ftnlen)
	    4) == 0) {

	air_valve__(node1, node2, nodem, nelem, lakon + 8, &kon[1], &ipkon[1],
		 &nactdog[4], identity, &ielprop[1], &prop[1], kflag, &v[
		v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, r__, &
		physcon[1], dvi, numf, set + 81, &co[4], &vold[vold_offset], &
		mi[1], ttime, time, iaxial, iplausi, (ftnlen)8, (ftnlen)81);

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "CARBS", (ftnlen)5, (ftnlen)
	    5) == 0) {

/*        carbon seal */

	carbon_seal__(node1, node2, nodem, nelem, lakon + 8, &nactdog[4], 
		identity, &ielprop[1], &prop[1], kflag, &v[v_offset], xflow, 
		f, &nodef[1], &idirf[1], &df[1], r__, &physcon[1], dvi, numf, 
		set + 81, &mi[1], ttime, time, iaxial, iplausi, (ftnlen)8, (
		ftnlen)81);

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "CHAR", (ftnlen)4, (ftnlen)
	    4) == 0) {

/*        characteristic */

	characteristic_(node1, node2, nodem, nelem, lakon + 8, &kon[1], &
		ipkon[1], &nactdog[4], identity, &ielprop[1], &prop[1], kflag,
		 &v[v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, 
		r__, &physcon[1], dvi, numf, set + 81, &mi[1], ttime, time, 
		iaxial, iplausi, (ftnlen)8, (ftnlen)81);

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "CROS", (ftnlen)4, (ftnlen)
	    4) == 0) {

/*        cross split */

	cross_split__(node1, node2, nodem, nelem, lakon + 8, &kon[1], &ipkon[
		1], &nactdog[4], identity, &ielprop[1], &prop[1], kflag, &v[
		v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, r__, &
		physcon[1], numf, set + 81, &mi[1], ider, ttime, time, iaxial,
		 iplausi, (ftnlen)8, (ftnlen)81);

/*     code not available in the internet distribution of CalculiX */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "FDPF", (ftnlen)4, (ftnlen)
	    4) == 0) {
	free_disc_pumping__(node1, node2, nodem, nelem, lakon + 8, &kon[1], &
		ipkon[1], &nactdog[4], identity, &ielprop[1], &prop[1], kflag,
		 &v[v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, 
		r__, &physcon[1], dvi, numf, set + 81, &shcon[shcon_offset], &
		nshcon[1], &rhcon[rhcon_offset], &nrhcon[1], ntmat___, &co[4],
		 &vold[vold_offset], &mi[1], ttime, time, iaxial, iplausi, (
		ftnlen)8, (ftnlen)81);

/*     code not available in the internet distribution of CalculiX */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "FCVF", (ftnlen)4, (ftnlen)
	    4) == 0) {
	free_convection__(node1, node2, nodem, nelem, lakon + 8, &kon[1], &
		ipkon[1], &nactdog[4], identity, &ielprop[1], &prop[1], kflag,
		 &v[v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, 
		r__, &physcon[1], dvi, numf, set + 81, &shcon[shcon_offset], &
		nshcon[1], &rhcon[rhcon_offset], &nrhcon[1], ntmat___, &co[4],
		 &vold[vold_offset], &mi[1], ttime, time, iaxial, iplausi, (
		ftnlen)8, (ftnlen)81);

/*     gas pipe fanno */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "GAPF", (ftnlen)4, (ftnlen)
	    4) == 0) {

	gaspipe_fanno__(node1, node2, nodem, nelem, lakon + 8, &kon[1], &
		ipkon[1], &nactdog[4], identity, &ielprop[1], &prop[1], kflag,
		 &v[v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, 
		r__, &physcon[1], dvi, numf, set + 81, &shcon[shcon_offset], &
		nshcon[1], &rhcon[rhcon_offset], &nrhcon[1], ntmat___, &co[4],
		 &vold[vold_offset], &mi[1], ttime, time, iaxial, iplausi, (
		ftnlen)8, (ftnlen)81);

/*     rotating gas pipe */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "GAPR", (ftnlen)4, (ftnlen)
	    4) == 0) {

	gaspipe_rot__(node1, node2, nodem, nelem, lakon + 8, &kon[1], &ipkon[
		1], &nactdog[4], identity, &ielprop[1], &prop[1], kflag, &v[
		v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, r__, &
		physcon[1], dvi, numf, set + 81, &shcon[shcon_offset], &
		nshcon[1], &rhcon[rhcon_offset], &nrhcon[1], ntmat___, &co[4],
		 &vold[vold_offset], &mi[1], ttime, time, iaxial, iplausi, (
		ftnlen)8, (ftnlen)81);

/*     straight and stepped labyrinth */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "LAB", (ftnlen)3, (ftnlen)3)
	     == 0) {

	labyrinth_(node1, node2, nodem, nelem, lakon + 8, &nactdog[4], 
		identity, &ielprop[1], &prop[1], kflag, &v[v_offset], xflow, 
		f, &nodef[1], &idirf[1], &df[1], cp, r__, &physcon[1], &co[4],
		 dvi, numf, &vold[vold_offset], set + 81, &kon[1], &ipkon[1], 
		&mi[1], ttime, time, iaxial, iplausi, (ftnlen)8, (ftnlen)81);

/*     liquid pipes including loss elements (hydraulic elements) */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "LIPI", (ftnlen)4, (ftnlen)
	    4) == 0) {

	liquidpipe_(node1, node2, nodem, nelem, lakon + 8, &nactdog[4], 
		identity, &ielprop[1], &prop[1], kflag, &v[v_offset], xflow, 
		f, &nodef[1], &idirf[1], &df[1], rho, &g[1], &co[4], dvi, 
		numf, &vold[vold_offset], &mi[1], &ipkon[1], &kon[1], set + 
		81, ttime, time, iaxial, iplausi, (ftnlen)8, (ftnlen)81);

/*     liquid pump */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "LIPU", (ftnlen)4, (ftnlen)
	    4) == 0) {

	liquidpump_(node1, node2, nodem, nelem, &nactdog[4], identity, &
		ielprop[1], &prop[1], kflag, &v[v_offset], xflow, f, &nodef[1]
		, &idirf[1], &df[1], rho, &g[1], &co[4], numf, &mi[1], ttime, 
		time, iaxial, iplausi);

/*     liquid pipes including loss elements (types derived from their */
/*     compressible equivalent) */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "LP", (ftnlen)2, (ftnlen)2) 
	    == 0) {

	liquidpipe_(node1, node2, nodem, nelem, lakon + 8, &nactdog[4], 
		identity, &ielprop[1], &prop[1], kflag, &v[v_offset], xflow, 
		f, &nodef[1], &idirf[1], &df[1], rho, &g[1], &co[4], dvi, 
		numf, &vold[vold_offset], &mi[1], &ipkon[1], &kon[1], set + 
		81, ttime, time, iaxial, iplausi, (ftnlen)8, (ftnlen)81);

/*     element that fixes the mass flow as a specific percentage of the */
/*     sum of the massflow of up to 10 other elements */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "MFPC", (ftnlen)4, (ftnlen)
	    4) == 0) {
	massflow_percent__(node1, node2, nodem, nelem, lakon + 8, &kon[1], &
		ipkon[1], &nactdog[4], identity, &ielprop[1], &prop[1], kflag,
		 &v[v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, 
		r__, &physcon[1], dvi, numf, set + 81, &shcon[shcon_offset], &
		nshcon[1], &rhcon[rhcon_offset], &nrhcon[1], ntmat___, &co[4],
		 &vold[vold_offset], &mi[1], ttime, time, iaxial, iplausi, (
		ftnlen)8, (ftnlen)81);

/*     Moehring */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "MRG", (ftnlen)3, (ftnlen)3)
	     == 0) {

	moehring_(node1, node2, nodem, nelem, lakon + 8, &kon[1], &ipkon[1], &
		nactdog[4], identity, &ielprop[1], &prop[1], kflag, &v[
		v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, r__, 
		dvi, numf, set + 81, &mi[1], ttime, time, iaxial, iplausi, (
		ftnlen)8, (ftnlen)81);

/*     Bleed tapping, orifice and pre-swirl nozzle */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "OR", (ftnlen)2, (ftnlen)2) 
	    == 0) {

	orifice_(node1, node2, nodem, nelem, lakon + 8, &kon[1], &ipkon[1], &
		nactdog[4], identity, &ielprop[1], &prop[1], kflag, &v[
		v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, r__, &
		physcon[1], dvi, numf, set + 81, &co[4], &vold[vold_offset], &
		mi[1], ttime, time, iaxial, iplausi, (ftnlen)8, (ftnlen)81);

/*     code not available in the internet distribution of CalculiX */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "RCV", (ftnlen)3, (ftnlen)3)
	     == 0) {

	rcavi_(node1, node2, nodem, nelem, lakon + 8, &kon[1], &ipkon[1], &
		nactdog[4], identity, &ielprop[1], &prop[1], kflag, &v[
		v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, r__, 
		dvi, numf, set + 81, &mi[1], ttime, time, iaxial, iplausi, (
		ftnlen)8, (ftnlen)81);

/*     code not available in the internet distribution of CalculiX */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "RO", (ftnlen)2, (ftnlen)2) 
	    == 0) {

	rcavi2_(node1, node2, nodem, nelem, lakon + 8, &kon[1], &ipkon[1], &
		nactdog[4], identity, &ielprop[1], &prop[1], kflag, &v[
		v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, r__, 
		dvi, numf, set + 81, &mi[1], ttime, time, iaxial, iplausi, (
		ftnlen)8, (ftnlen)81);

/*     restrictors */

    } else if ((s_cmp(lakon + ((*nelem << 3) + 1), "RE", (ftnlen)2, (ftnlen)2)
	     == 0 || s_cmp(lakon + ((*nelem << 3) + 1), "RB", (ftnlen)2, (
	    ftnlen)2) == 0) && s_cmp(lakon + ((*nelem << 3) + 1), "REBRSI1", (
	    ftnlen)7, (ftnlen)7) != 0 && s_cmp(lakon + ((*nelem << 3) + 1), 
	    "REBRSI2", (ftnlen)7, (ftnlen)7) != 0) {

	restrictor_(node1, node2, nodem, nelem, lakon + 8, &kon[1], &ipkon[1],
		 &nactdog[4], identity, &ielprop[1], &prop[1], kflag, &v[
		v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, r__, &
		physcon[1], dvi, numf, set + 81, &shcon[shcon_offset], &
		nshcon[1], &rhcon[rhcon_offset], &nrhcon[1], ntmat___, &mi[1],
		 ttime, time, iaxial, &co[4], &vold[vold_offset], iplausi, (
		ftnlen)8, (ftnlen)81);

/*     code not available in the internet distribution of CalculiX */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "RIMS", (ftnlen)4, (ftnlen)
	    4) == 0 || s_cmp(lakon + ((*nelem << 3) + 1), "RIMFLEX", (ftnlen)
	    7, (ftnlen)7) == 0) {

	rimseal_(node1, node2, nodem, nelem, lakon + 8, &kon[1], &ipkon[1], &
		nactdog[4], identity, &ielprop[1], &prop[1], kflag, &v[
		v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, r__, &
		physcon[1], dvi, numf, set + 81, &mi[1], ttime, time, iaxial, 
		&co[4], &vold[vold_offset], iplausi, (ftnlen)8, (ftnlen)81);

/*     code not available in the internet distribution of CalculiX */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "SPUMP", (ftnlen)5, (ftnlen)
	    5) == 0) {

	scavenge_pump__(node1, node2, nodem, nelem, lakon + 8, &kon[1], &
		ipkon[1], &nactdog[4], identity, &ielprop[1], &prop[1], kflag,
		 &v[v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, 
		r__, &physcon[1], dvi, numf, set + 81, ntmat___, &mi[1], 
		ttime, time, iaxial, iplausi, (ftnlen)8, (ftnlen)81);

/*     branch split Idelchik2 */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "REBRSI2", (ftnlen)7, (
	    ftnlen)7) == 0) {

	tee_(node1, node2, nodem, nelem, lakon + 8, &kon[1], &ipkon[1], &
		nactdog[4], identity, &ielprop[1], &prop[1], kflag, &v[
		v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, r__, &
		physcon[1], numf, set + 81, &mi[1], ider, ttime, time, iaxial,
		 iplausi, (ftnlen)8, (ftnlen)81);

/*     user element */

    } else if (*(unsigned char *)&lakon[(*nelem << 3) + 1] == 'U') {

	user_network_element__(node1, node2, nodem, nelem, lakon + 8, &kon[1],
		 &ipkon[1], &nactdog[4], identity, &ielprop[1], &prop[1], 
		kflag, &v[v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], 
		cp, r__, &physcon[1], dvi, numf, set + 81, &co[4], &vold[
		vold_offset], &mi[1], ttime, time, iaxial, iplausi, (ftnlen)8,
		 (ftnlen)81);

/*     vortex */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "VO", (ftnlen)2, (ftnlen)2) 
	    == 0) {

	vortex_(node1, node2, nodem, nelem, lakon + 8, &kon[1], &ipkon[1], &
		nactdog[4], identity, &ielprop[1], &prop[1], kflag, &v[
		v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, r__, 
		numf, set + 81, &mi[1], ttime, time, iaxial, iplausi, (ftnlen)
		8, (ftnlen)81);

/*     branch split Idelchik1 */

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "REBRSI1", (ftnlen)7, (
	    ftnlen)7) == 0) {

	wye_(node1, node2, nodem, nelem, lakon + 8, &kon[1], &ipkon[1], &
		nactdog[4], identity, &ielprop[1], &prop[1], kflag, &v[
		v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], cp, r__, &
		physcon[1], numf, set + 81, &mi[1], ider, ttime, time, iaxial,
		 iplausi, dvi, (ftnlen)8, (ftnlen)81);

    } else {
	*identity = TRUE_;

    }

    return 0;
} /* flux_ */

