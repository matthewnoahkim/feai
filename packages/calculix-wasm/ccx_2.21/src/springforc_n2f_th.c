/* springforc_n2f_th.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int springforc_n2f_th__(doublereal *xl, doublereal *vl, 
	integer *imat, doublereal *elcon, integer *nelcon, doublereal *tnl, 
	integer *ncmat___, integer *ntmat___, integer *nope, integer *kode, 
	doublereal *elconloc, doublereal *plkcon, integer *nplkcon, integer *
	npmat___, integer *mi, doublereal *springarea, doublereal *timeend, 
	char *matname, integer *node, integer *noel, integer *istep, integer *
	iinc, integer *iperturb, ftnlen matname_len)
{
    /* System generated locals */
    integer nplkcon_dim1, nplkcon_offset, vl_dim1, vl_offset, elcon_dim1, 
	    elcon_dim2, elcon_offset, plkcon_dim1, plkcon_dim2, plkcon_offset,
	     i__1;
    doublereal d__1;

    /* Builtin functions */
    double sqrt(doublereal), log(doublereal), exp(doublereal), atan(
	    doublereal);

    /* Local variables */
    doublereal plconloc[802];
    extern /* Subroutine */ int attach_2d__(doublereal *, doublereal *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *)
	    ;
    doublereal pressure, d__[2];
    integer i__, j;
    extern /* Subroutine */ int shape3tri_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *)
	    , shape6tri_(doublereal *, doublereal *, doublereal *, doublereal 
	    *, doublereal *, doublereal *, integer *);
    doublereal ak[5];
    integer id;
    doublereal al[3], dm, pi, et, pl[30]	/* was [3][10] */, xi, xk, xn[
	    3], t1l, xs2[21]	/* was [3][7] */, val, eps, conductance, shp2[
	    63]	/* was [7][9] */, xsj2[3], beta, dist, temp[2];
    integer niso;
    doublereal xiso[200], yiso[200];
    integer iflag;
    doublereal alpha;
    extern /* Subroutine */ int ident_(doublereal *, doublereal *, integer *, 
	    integer *);
    doublereal tmean;
    integer npred;
    doublereal dtemp, ratio[9], flowm[2], pproj[3], predef[2];
    extern /* Subroutine */ int gapcon_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, char *, 
	    char *, char *, doublereal *, integer *, integer *, integer *, 
	    integer *, integer *, doublereal *, ftnlen, ftnlen, ftnlen);
    char slname[80], msname[80];
    doublereal coords[3];
    integer nterms;
    extern /* Subroutine */ int shape4q_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *)
	    , shape8q_(doublereal *, doublereal *, doublereal *, doublereal *,
	     doublereal *, doublereal *, integer *), materialdata_sp__(
	    doublereal *, integer *, integer *, integer *, integer *, 
	    doublereal *, doublereal *, integer *, doublereal *, integer *, 
	    integer *, doublereal *, integer *);


/*     calculates the heat flux across a contact area */





    /* Parameter adjustments */
    xl -= 4;
    nelcon -= 3;
    --tnl;
    nplkcon_dim1 = *ntmat___ - 0 + 1;
    nplkcon_offset = 0 + nplkcon_dim1;
    nplkcon -= nplkcon_offset;
    elcon_dim1 = *ncmat___ - 0 + 1;
    elcon_dim2 = *ntmat___;
    elcon_offset = 0 + elcon_dim1 * (1 + elcon_dim2);
    elcon -= elcon_offset;
    --elconloc;
    plkcon_dim1 = 2 * *npmat___ - 0 + 1;
    plkcon_dim2 = *ntmat___;
    plkcon_offset = 0 + plkcon_dim1 * (1 + plkcon_dim2);
    plkcon -= plkcon_offset;
    --mi;
    vl_dim1 = mi[2] - 0 + 1;
    vl_offset = 0 + vl_dim1;
    vl -= vl_offset;
    --timeend;
    matname -= 80;
    --iperturb;

    /* Function Body */
    iflag = 2;

/*     actual positions of the nodes belonging to the contact spring */
/*     (for geometrically linear static calculations the undeformed position */
/*      is taken) */

    if (iperturb[2] == 0) {
	i__1 = *nope;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    for (j = 1; j <= 3; ++j) {
		pl[j + i__ * 3 - 4] = xl[j + i__ * 3];
	    }
	}
    } else {
	i__1 = *nope;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    for (j = 1; j <= 3; ++j) {
		pl[j + i__ * 3 - 4] = xl[j + i__ * 3] + vl[j + i__ * vl_dim1];
	    }
	}
    }

    nterms = *nope - 1;

/*     vector vr connects the dependent node with its projection */
/*     on the independent face */

    for (i__ = 1; i__ <= 3; ++i__) {
	pproj[i__ - 1] = pl[i__ + *nope * 3 - 4];
    }
    attach_2d__(pl, pproj, &nterms, ratio, &dist, &xi, &et);
    for (i__ = 1; i__ <= 3; ++i__) {
	al[i__ - 1] = pl[i__ + *nope * 3 - 4] - pproj[i__ - 1];
    }

/*     determining the jacobian vector on the surface */

    if (nterms == 8) {
	shape8q_(&xi, &et, pl, xsj2, xs2, shp2, &iflag);
    } else if (nterms == 4) {
	shape4q_(&xi, &et, pl, xsj2, xs2, shp2, &iflag);
    } else if (nterms == 6) {
	shape6tri_(&xi, &et, pl, xsj2, xs2, shp2, &iflag);
    } else {
	shape3tri_(&xi, &et, pl, xsj2, xs2, shp2, &iflag);
    }

/*     normal on the surface */

    dm = sqrt(xsj2[0] * xsj2[0] + xsj2[1] * xsj2[1] + xsj2[2] * xsj2[2]);
    for (i__ = 1; i__ <= 3; ++i__) {
	xn[i__ - 1] = xsj2[i__ - 1] / dm;
    }

/*     distance from surface along normal */

    val = al[0] * xn[0] + al[1] * xn[1] + al[2] * xn[2];

/*     representative area: usually the slave surface stored in */
/*     springarea; however, if no area was assigned because the */
/*     node does not belong to any element, the master surface */
/*     is used */

    if (*springarea <= 0.) {
	if (nterms == 3) {
	    *springarea = dm / 2.;
	} else {
	    *springarea = dm * 4.;
	}
    }

    if (elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 1] > 0.) {

/*        exponential overclosure */

	if ((d__1 = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 2], abs(
		d__1)) < 1e-30) {
	    pressure = 0.;
	    beta = 1.;
	} else {

	    alpha = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 2];
	    beta = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 1];
	    if (-beta * val > 23. - log(alpha)) {
		beta = (log(alpha) - 23.) / val;
	    }
	    pressure = exp(-beta * val + log(alpha));
	}
    } else {

/*        linear overclosure */

	pi = atan(1.) * 4.;
	eps = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 1] * pi / elcon[(*
		imat * elcon_dim2 + 1) * elcon_dim1 + 2];
	pressure = -elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 2] * val * (
		atan(-val / eps) / pi + .5);
    }

/*     calculating the temperature difference across the contact */
/*     area and the mean temperature for the determination of the */
/*     conductance */

    t1l = 0.;
    i__1 = nterms;
    for (j = 1; j <= i__1; ++j) {
	t1l += ratio[j - 1] * vl[j * vl_dim1];
    }
    dtemp = t1l - vl[*nope * vl_dim1];
    tmean = (vl[*nope * vl_dim1] + t1l) / 2.;

/*     interpolating the material data according to temperature */

    materialdata_sp__(&elcon[elcon_offset], &nelcon[3], imat, ntmat___, &i__, 
	    &tmean, &elconloc[1], kode, &plkcon[plkcon_offset], &nplkcon[
	    nplkcon_offset], npmat___, plconloc, ncmat___);

/*     interpolating the material data according to pressure */

    niso = (integer) plconloc[800];

    if (niso == 0) {
	d__[0] = val;
	d__[1] = pressure;
	temp[0] = vl[*nope * vl_dim1];
	temp[1] = t1l;
	for (j = 1; j <= 3; ++j) {
	    coords[j - 1] = xl[j + *nope * 3];
	}
	gapcon_(ak, d__, flowm, temp, predef, &timeend[1], matname + *imat * 
		80, slname, msname, coords, noel, node, &npred, istep, iinc, 
		springarea, (ftnlen)80, (ftnlen)80, (ftnlen)80);
	conductance = ak[0];
    } else {
	i__1 = niso;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    xiso[i__ - 1] = plconloc[(i__ << 1) - 2];
	    yiso[i__ - 1] = plconloc[(i__ << 1) - 1];
	}
	ident_(xiso, &pressure, &niso, &id);
	if (id == 0) {
	    xk = 0.;
	    conductance = yiso[0];
	} else if (id == niso) {
	    xk = 0.;
	    conductance = yiso[niso - 1];
	} else {
	    xk = (yiso[id] - yiso[id - 1]) / (xiso[id] - xiso[id - 1]);
	    conductance = yiso[id - 1] + xk * (pressure - xiso[id - 1]);
	}
    }

/*     calculating the concentrated heat flow */

    tnl[*nope] = -(*springarea) * conductance * dtemp;
    i__1 = nterms;
    for (j = 1; j <= i__1; ++j) {
	tnl[j] = -ratio[j - 1] * tnl[*nope];
    }

    return 0;
} /* springforc_n2f_th__ */

