/* calcheatnet.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int calcheatnet_(integer *nelem, char *lakon, integer *ipkon,
	 integer *kon, doublereal *v, integer *ielprop, doublereal *prop, 
	integer *ielmat, integer *ntmat___, doublereal *shcon, integer *
	nshcon, doublereal *rhcon, integer *nrhcon, integer *ipobody, integer 
	*ibody, doublereal *xbody, integer *mi, integer *nacteq, doublereal *
	bc, doublereal *qat, integer *nalt, ftnlen lakon_len)
{
    /* System generated locals */
    integer ielmat_dim1, ielmat_offset, shcon_dim2, shcon_offset, rhcon_dim2, 
	    rhcon_offset, v_dim1, v_offset;
    doublereal d__1, d__2;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen), i_dnnt(doublereal *);

    /* Local variables */
    doublereal r__, r1, r2, cp, om, tg1, tg2;
    integer ieq;
    doublereal dvi, rin, rho, uin, heat;
    integer imat;
    doublereal rout;
    extern /* Subroutine */ int cp_corrected__(doublereal *, doublereal *, 
	    doublereal *, doublereal *);
    doublereal uout;
    integer node1, node2, nodem, index;
    doublereal xflow, cp_cor__, gastemp;
    extern /* Subroutine */ int materialdata_tg__(integer *, integer *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     doublereal *, doublereal *, integer *, doublereal *);


/*     user subroutine film */


/*     INPUT: */

/*     nelem              actual element number */
/*     lakon(i)           contains the label of element i */
/*     ipkon(i)           points to the location in field kon preceding */
/*                        the topology of element i */
/*     kon(*)             contains the topology of all elements. The */
/*                        topology of element i starts at kon(ipkon(i)+1) */
/*                        and continues until all nodes are covered. The */
/*                        number of nodes depends on the element label */
/*     v(0..4,1..nk)      actual solution field in all nodes; */
/*                        for structural nodes: */
/*                        0: temperature */
/*                        1: displacement in global x-direction */
/*                        2: displacement in global y-direction */
/*                        3: displacement in global z-direction */
/*                        4: static pressure */
/*                        for network nodes */
/*                        0: total temperature (at end nodes) */
/*                           = static temperature for liquids */
/*                        1: mass flow (at middle nodes) */
/*                        2: total pressure (at end nodes) */
/*                           = static pressure for liquids */
/*                        3: static temperature (at end nodes; only for gas) */
/*     ielprop(i)         points to the location in field prop preceding */
/*                        the properties of element i */
/*     prop(*)            contains the properties of all network elements. The */
/*                        properties of element i start at prop(ielprop(i)+1) */
/*                        and continues until all properties are covered. The */
/*                        appropriate amount of properties depends on the */
/*                        element label. The kind of properties, their */
/*                        number and their order corresponds */
/*                        to the description in the user's manual, */
/*                        cf. the sections "Fluid Section Types" */
/*     ielmat(j,i)        contains the material number for element i */
/*                        and layer j */
/*     ntmat_             maximum number of temperature data points for */
/*                        any material property for any material */
/*     shcon(0,j,i)       temperature at temperature point j of material i */
/*     shcon(1,j,i)       specific heat at constant pressure at the */
/*                        temperature point j of material i */
/*     shcon(2,j,i)       dynamic viscosity at the temperature point j of */
/*                        material i */
/*     shcon(3,1,i)       specific gas constant of material i */
/*     nshcon(i)          number of temperature data points for the specific */
/*                        heat of material i */
/*     rhcon(0,j,i)       temperature at density temperature point j of */
/*                        material i */
/*     rhcon(1,j,i)       density at the density temperature point j of */
/*                        material i */
/*     nrhcon(i)          number of temperature data points for the density */
/*                        of material i */
/*     ipobody(1,i)       points to an entry in fields ibody and xbody */
/*                        containing the body load applied to element i, */
/*                        if any, else 0 */
/*     ipobody(2,i)       index referring to the line in field ipobody */
/*                        containing a pointer to the next body load */
/*                        applied to element i, else 0 */
/*     ibody(1,i)         code identifying the kind of body load i: */
/*                        -1,1=centrifugal, 2=gravity, 3=generalized gravity */
/*     ibody(2,i)         amplitude number for load i */
/*     ibody(3,i)         load case number for load i */
/*     xbody(1,i)         size of body load i */
/*     xbody(2..4,i)      for centrifugal loading: point on the axis, */
/*                        for gravity loading with known gravity vector: */
/*                          normalized gravity vector */
/*     xbody(5..7,i)      for centrifugal loading: normalized vector on the */
/*                          rotation axis */
/*     mi(1)              max # of integration points per element (max */
/*                        over all elements) */
/*     mi(2)              max degree of freedom per node (max over all */
/*                        nodes) in fields like v(0:mi(2))... */
/*     mi(3)              max # of layers in any element */
/*     nacteq(j,i)      contains the number of an equation expressed at */
/*                        network node i (i=1..,ntg, ntg is the number of */
/*                        network nodes) */
/*                        j=0: energy conservation */
/*                        j=1: mass conservation */
/*                        j=2: element equation */
/*                        j=3: geometric equation */

/*     OUTPUT: */

/*     bc(*)              right hand side of the network equation system */
/*     qat                sum of energy contributions in the network */
/*     nalt               number of energy contributions: used to calculate */
/*                        a typical energy flow (used in the convergence */
/*                        criteria) */







    /* Parameter adjustments */
    lakon -= 8;
    --ipkon;
    --kon;
    --ielprop;
    --prop;
    rhcon_dim2 = *ntmat___;
    rhcon_offset = 0 + 2 * (1 + rhcon_dim2);
    rhcon -= rhcon_offset;
    shcon_dim2 = *ntmat___;
    shcon_offset = 0 + 4 * (1 + shcon_dim2);
    shcon -= shcon_offset;
    --nshcon;
    --nrhcon;
    ipobody -= 3;
    ibody -= 4;
    xbody -= 8;
    --mi;
    ielmat_dim1 = mi[3];
    ielmat_offset = 1 + ielmat_dim1;
    ielmat -= ielmat_offset;
    v_dim1 = mi[2] - 0 + 1;
    v_offset = 0 + v_dim1;
    v -= v_offset;
    nacteq -= 4;
    --bc;

    /* Function Body */
    heat = 0.;

    nodem = kon[ipkon[*nelem] + 2];
    xflow = v[nodem * v_dim1 + 1];
    node1 = kon[ipkon[*nelem] + 1];
    node2 = kon[ipkon[*nelem] + 3];
    if (node1 == 0 || node2 == 0) {
	return 0;
    }

    if (s_cmp(lakon + ((*nelem << 3) + 1), "VO", (ftnlen)2, (ftnlen)2) == 0) {

	index = ielprop[*nelem];

	if (xflow > 0.) {
	    r1 = prop[index + 2];
	    r2 = prop[index + 1];
	    rout = r2;
	    rin = r1;
	} else {
	    r1 = prop[index + 2];
	    r2 = prop[index + 1];
	    rout = r1;
	    rin = r2;
	}

/*     computing temperature corrected Cp=Cp(T) coefficient */

	tg1 = v[node1 * v_dim1];
	tg2 = v[node2 * v_dim1];
	if (s_cmp(lakon + ((*nelem << 3) + 1), "LP", (ftnlen)2, (ftnlen)2) != 
		0 && s_cmp(lakon + ((*nelem << 3) + 1), "LI", (ftnlen)2, (
		ftnlen)2) != 0) {
	    gastemp = (tg1 + tg2) / 2.;
	} else {
	    if (xflow > 0.) {
		gastemp = tg1;
	    } else {
		gastemp = tg2;
	    }
	}

	imat = ielmat[*nelem * ielmat_dim1 + 1];
	materialdata_tg__(&imat, ntmat___, &gastemp, &shcon[shcon_offset], &
		nshcon[1], &cp, &r__, &dvi, &rhcon[rhcon_offset], &nrhcon[1], 
		&rho);

	cp_corrected__(&cp, &tg1, &tg2, &cp_cor__);

/*         Uout=prop(index+5)*Rout */
/*         Uin=prop(index+5)*Rin */

/*     free and forced vortices with temperature */
/*     change in the relative system of coordinates */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "VOFR", (ftnlen)4, (ftnlen)4) 
		== 0 && i_dnnt(&prop[index + 8]) == -1) {

	    uout = prop[index + 7] * rout;
	    uin = prop[index + 7] * rin;

/* Computing 2nd power */
	    d__1 = uout;
/* Computing 2nd power */
	    d__2 = uin;
	    heat = cp * .5 / cp_cor__ * (d__1 * d__1 - d__2 * d__2) * xflow;

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "VOFO", (ftnlen)4, (
		ftnlen)4) == 0 && i_dnnt(&prop[index + 6]) == -1) {

	    uout = prop[index + 5] * rout;
	    uin = prop[index + 5] * rin;

/* Computing 2nd power */
	    d__1 = uout;
/* Computing 2nd power */
	    d__2 = uin;
	    heat = cp * .5 / cp_cor__ * (d__1 * d__1 - d__2 * d__2) * xflow;

/*     forced vortices with temperature change in the absolute system */

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "VOFO", (ftnlen)4, (
		ftnlen)4) == 0 && i_dnnt(&prop[index + 6]) == 1) {

	    uout = prop[index + 5] * rout;
	    uin = prop[index + 5] * rin;
/* Computing 2nd power */
	    d__1 = uout;
/* Computing 2nd power */
	    d__2 = uin;
	    heat = cp / cp_cor__ * (d__1 * d__1 - d__2 * d__2) * xflow;

	}
    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "GAPR", (ftnlen)4, (ftnlen)
	    4) == 0) {

/*        heat production in a rotating pipe (in the relative */
/*        system) */

	index = ielprop[*nelem];

	r1 = prop[index + 8];
	r2 = prop[index + 9];
	om = prop[index + 10];
	if (xflow > 0.) {
	    rin = r1;
	    rout = r2;
	} else {
	    rin = r2;
	    rout = r1;
	}
	uin = rin * om;
	uout = rout * om;

/* Computing 2nd power */
	d__1 = uout;
/* Computing 2nd power */
	d__2 = uin;
	heat = (d__1 * d__1 - d__2 * d__2) * xflow / 2.;

    } else if (*(unsigned char *)&lakon[(*nelem << 3) + 1] == 'U') {

/*        insert here the heat generated in user defined network elements */

/*        START insert */

	heat = 0.;

/*        END insert */

    } else {
	return 0;
    }

/*     including the resulting additional heat flux in the energy equation */

    if (xflow > 0.) {
	ieq = nacteq[node2 * 4];
	if (ieq != 0) {
	    bc[ieq] += heat;
	    *qat += abs(heat);
	    ++(*nalt);
	}
    } else {
	ieq = nacteq[node1 * 4];
	if (ieq != 0) {
	    bc[ieq] += heat;
	    *qat += abs(heat);
	    ++(*nalt);
	}
    }

    return 0;
} /* calcheatnet_ */

