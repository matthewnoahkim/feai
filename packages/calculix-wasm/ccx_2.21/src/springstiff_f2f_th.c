/* springstiff_f2f_th.f -- translated by f2c (version 20200916).
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

static integer c__1 = 1;


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

/* Subroutine */ int springstiff_f2f_th__(doublereal *xl, doublereal *voldl, 
	doublereal *s, integer *imat, doublereal *elcon, integer *nelcon, 
	integer *ncmat___, integer *ntmat___, integer *nope, char *lakonl, 
	integer *kode, doublereal *elconloc, doublereal *plicon, integer *
	nplicon, integer *npmat___, doublereal *springarea, integer *nmethod, 
	integer *mi, doublereal *reltime, integer *jfaces, integer *igauss, 
	doublereal *pslavsurf, doublereal *pmastsurf, doublereal *clearini, 
	char *matname, doublereal *plkcon, integer *nplkcon, integer *node, 
	integer *noel, integer *istep, integer *iinc, doublereal *timeend, 
	ftnlen lakonl_len, ftnlen matname_len)
{
    /* System generated locals */
    integer nplicon_dim1, nplicon_offset, nplkcon_dim1, nplkcon_offset, 
	    voldl_dim1, voldl_offset, elcon_dim1, elcon_dim2, elcon_offset, 
	    plicon_dim1, plicon_dim2, plicon_offset, plkcon_dim1, plkcon_dim2,
	     plkcon_offset, i__1, i__2;
    doublereal d__1;
    icilist ici__1;

    /* Builtin functions */
    integer s_rsfi(icilist *), do_fio(integer *, char *, ftnlen), e_rsfi(void)
	    ;
    double log(doublereal), exp(doublereal);

    /* Local variables */
    doublereal plconloc[802], constant, pressure, d__[2];
    integer i__, j, k;
    extern /* Subroutine */ int shape3tri_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *)
	    , shape6tri_(doublereal *, doublereal *, doublereal *, doublereal 
	    *, doublereal *, doublereal *, integer *);
    doublereal ak[5];
    integer id;
    doublereal al[3], et, pl[57]	/* was [3][19] */, xi, xk, xm[3], xn[
	    3], xs2[21]	/* was [3][7] */, conductance, t1lm, t1ls, xs2s[21]	
	    /* was [3][7] */, beta, temp[2];
    integer niso;
    doublereal xiso[20], yiso[20], shp2m[63]	/* was [7][9] */, shp2s[63]	
	    /* was [7][9] */, xsj2s[3];
    integer iflag;
    doublereal alpha, clear;
    extern /* Subroutine */ int ident_(doublereal *, doublereal *, integer *, 
	    integer *);
    doublereal tmean;
    integer npred;
    doublereal dtemp;
    integer nopem, nopep, nopes;
    doublereal flowm[2], pproj[3], dpresdoverlap, predef[2];
    extern /* Subroutine */ int gapcon_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, char *, 
	    char *, char *, doublereal *, integer *, integer *, integer *, 
	    integer *, integer *, doublereal *, ftnlen, ftnlen, ftnlen);
    char slname[80], msname[80];
    doublereal weight, coords[3];
    extern /* Subroutine */ int shape4q_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *)
	    , shape8q_(doublereal *, doublereal *, doublereal *, doublereal *,
	     doublereal *, doublereal *, integer *);
    doublereal overlap;
    extern /* Subroutine */ int materialdata_sp__(doublereal *, integer *, 
	    integer *, integer *, integer *, doublereal *, doublereal *, 
	    integer *, doublereal *, integer *, integer *, doublereal *, 
	    integer *);


/*     calculates the stiffness of a spring (face-to-face penalty) */






    /* Parameter adjustments */
    xl -= 4;
    s -= 61;
    nelcon -= 3;
    nplkcon_dim1 = *ntmat___ - 0 + 1;
    nplkcon_offset = 0 + nplkcon_dim1;
    nplkcon -= nplkcon_offset;
    nplicon_dim1 = *ntmat___ - 0 + 1;
    nplicon_offset = 0 + nplicon_dim1;
    nplicon -= nplicon_offset;
    elcon_dim1 = *ncmat___ - 0 + 1;
    elcon_dim2 = *ntmat___;
    elcon_offset = 0 + elcon_dim1 * (1 + elcon_dim2);
    elcon -= elcon_offset;
    --elconloc;
    plkcon_dim1 = 2 * *npmat___ - 0 + 1;
    plkcon_dim2 = *ntmat___;
    plkcon_offset = 0 + plkcon_dim1 * (1 + plkcon_dim2);
    plkcon -= plkcon_offset;
    plicon_dim1 = 2 * *npmat___ - 0 + 1;
    plicon_dim2 = *ntmat___;
    plicon_offset = 0 + plicon_dim1 * (1 + plicon_dim2);
    plicon -= plicon_offset;
    --springarea;
    --mi;
    voldl_dim1 = mi[2] - 0 + 1;
    voldl_offset = 0 + voldl_dim1;
    voldl -= voldl_offset;
    pslavsurf -= 4;
    pmastsurf -= 7;
    clearini -= 31;
    matname -= 80;
    --timeend;

    /* Function Body */
    iflag = 1;

/*     # of master nodes */

    ici__1.icierr = 0;
    ici__1.iciend = 0;
    ici__1.icirnum = 1;
    ici__1.icirlen = 1;
    ici__1.iciunit = lakonl + 7;
    ici__1.icifmt = "(i1)";
    s_rsfi(&ici__1);
    do_fio(&c__1, (char *)&nopem, (ftnlen)sizeof(integer));
    e_rsfi();

/*     # of slave nodes */

    nopes = *nope - nopem;

/*     actual positions of the nodes belonging to the contact spring */
/*     (otherwise no contact force) */

    i__1 = nopem;
    for (i__ = 1; i__ <= i__1; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    pl[j + i__ * 3 - 4] = xl[j + i__ * 3] + voldl[j + i__ * 
		    voldl_dim1];
	}
    }

    i__1 = *nope;
    for (i__ = nopem + 1; i__ <= i__1; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    pl[j + i__ * 3 - 4] = xl[j + i__ * 3] + voldl[j + i__ * 
		    voldl_dim1] + clearini[j + (i__ - nopem + *jfaces * 9) * 
		    3] * *reltime;
	}
    }

/*     contact springs */

    ici__1.icierr = 0;
    ici__1.iciend = 0;
    ici__1.icirnum = 1;
    ici__1.icirlen = 1;
    ici__1.iciunit = lakonl + 7;
    ici__1.icifmt = "(i1)";
    s_rsfi(&ici__1);
    do_fio(&c__1, (char *)&nopem, (ftnlen)sizeof(integer));
    e_rsfi();
    nopes = *nope - nopem;

    xi = pslavsurf[*igauss * 3 + 1];
    et = pslavsurf[*igauss * 3 + 2];
    weight = pslavsurf[*igauss * 3 + 3];

    if (nopes == 8) {
	shape8q_(&xi, &et, &pl[(nopem + 1) * 3 - 3], xsj2s, xs2s, shp2s, &
		iflag);
    } else if (nopes == 4) {
	shape4q_(&xi, &et, &pl[(nopem + 1) * 3 - 3], xsj2s, xs2s, shp2s, &
		iflag);
    } else if (nopes == 6) {
	shape6tri_(&xi, &et, &pl[(nopem + 1) * 3 - 3], xsj2s, xs2s, shp2s, &
		iflag);
    } else {
	shape3tri_(&xi, &et, &pl[(nopem + 1) * 3 - 3], xsj2s, xs2s, shp2s, &
		iflag);
    }

    nopep = *nope + 1;

    for (k = 1; k <= 3; ++k) {
	pl[k + nopep * 3 - 4] = 0.;
    }
    t1ls = 0.;
    i__1 = nopes;
    for (j = 1; j <= i__1; ++j) {
	for (k = 1; k <= 3; ++k) {
	    pl[k + nopep * 3 - 4] += shp2s[j * 7 - 4] * pl[k + (nopem + j) * 
		    3 - 4];
	}
	t1ls += shp2s[j * 7 - 4] * voldl[(nopem + j) * voldl_dim1];
    }

    xi = pmastsurf[*igauss * 6 + 1];
    et = pmastsurf[*igauss * 6 + 2];

/*     determining the jacobian vector on the surface */

    if (nopem == 8) {
	shape8q_(&xi, &et, pl, xm, xs2, shp2m, &iflag);
    } else if (nopem == 4) {
	shape4q_(&xi, &et, pl, xm, xs2, shp2m, &iflag);
    } else if (nopem == 6) {
	shape6tri_(&xi, &et, pl, xm, xs2, shp2m, &iflag);
    } else {
	shape3tri_(&xi, &et, pl, xm, xs2, shp2m, &iflag);
    }

    t1lm = 0.;
    for (i__ = 1; i__ <= 3; ++i__) {
	pproj[i__ - 1] = 0.;
    }
    i__1 = nopem;
    for (j = 1; j <= i__1; ++j) {
	for (i__ = 1; i__ <= 3; ++i__) {
	    pproj[i__ - 1] += shp2m[j * 7 - 4] * pl[i__ + j * 3 - 4];
	}
	t1lm += shp2m[j * 7 - 4] * voldl[j * voldl_dim1];
    }

    for (i__ = 1; i__ <= 3; ++i__) {
	al[i__ - 1] = pl[i__ + nopep * 3 - 4] - pproj[i__ - 1];
    }

/*     normal vector on master face */

    xn[0] = pmastsurf[*igauss * 6 + 4];
    xn[1] = pmastsurf[*igauss * 6 + 5];
    xn[2] = pmastsurf[*igauss * 6 + 6];

/*     distance from surface along normal (= clearance) */

    clear = al[0] * xn[0] + al[1] * xn[1] + al[2] * xn[2];
    if (*nmethod == 1) {
	clear -= springarea[2] * (1. - *reltime);
    }

/*     pressure-overclosure relationship */

    if ((integer) elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 3] == 1) {

/*        exponential overclosure */

	if ((d__1 = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 2], abs(
		d__1)) < 1e-30) {
	    pressure = 0.;
	} else {
	    alpha = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 2];
	    beta = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 1];
	    if (-beta * clear > 23. - log(alpha)) {
		beta = (log(alpha) - 23.) / clear;
	    }
	    pressure = exp(-beta * clear + log(alpha));
	}
    } else if ((integer) elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 3] == 
	    2 || (integer) elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 3] ==
	     4) {

/*        linear overclosure */

	pressure = -elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 2] * clear;
    } else if ((integer) elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 3] == 
	    3) {

/*        tabular overclosure */

/*        interpolating the material data */

	materialdata_sp__(&elcon[elcon_offset], &nelcon[3], imat, ntmat___, &
		i__, &tmean, &elconloc[1], kode, &plicon[plicon_offset], &
		nplicon[nplicon_offset], npmat___, plconloc, ncmat___);
	overlap = -clear;
	niso = (integer) plconloc[80];
	i__1 = niso;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    xiso[i__ - 1] = plconloc[(i__ << 1) - 2];
	    yiso[i__ - 1] = plconloc[(i__ << 1) - 1];
	}
	ident_(xiso, &overlap, &niso, &id);
	if (id == 0) {
	    pressure = yiso[0];
	} else if (id == niso) {
	    pressure = yiso[niso - 1];
	} else {
	    dpresdoverlap = (yiso[id] - yiso[id - 1]) / (xiso[id] - xiso[id - 
		    1]);
	    pressure = yiso[id - 1] + dpresdoverlap * (overlap - xiso[id - 1])
		    ;
	}
    }

/*     calculating the temperature difference across the contact */
/*     area and the mean temperature for the determination of the */
/*     conductance */

    dtemp = t1lm - t1ls;
    tmean = (t1lm + t1ls) / 2.;

/*     interpolating the material data according to temperature */

    materialdata_sp__(&elcon[elcon_offset], &nelcon[3], imat, ntmat___, &i__, 
	    &tmean, &elconloc[1], kode, &plkcon[plkcon_offset], &nplkcon[
	    nplkcon_offset], npmat___, plconloc, ncmat___);

/*     interpolating the material data according to pressure */

    niso = (integer) plconloc[800];

    if (niso == 0) {

/*        user subroutine for the conductance */

	d__[0] = clear;
	d__[1] = pressure;
	temp[0] = t1ls;
	temp[1] = t1lm;
	for (k = 1; k <= 3; ++k) {
	    coords[k - 1] = 0.;
	    i__1 = nopes;
	    for (j = 1; j <= i__1; ++j) {
		coords[k - 1] += shp2s[j * 7 - 4] * xl[k + (nopem + j) * 3];
	    }
	}
	gapcon_(ak, d__, flowm, temp, predef, &timeend[1], matname + *imat * 
		80, slname, msname, coords, noel, node, &npred, istep, iinc, &
		springarea[1], (ftnlen)80, (ftnlen)80, (ftnlen)80);
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

/*     assembling the upper triangle of the element matrix */

    constant = conductance * springarea[1];

    i__1 = nopem;
    for (i__ = 1; i__ <= i__1; ++i__) {
	i__2 = nopem;
	for (j = i__; j <= i__2; ++j) {
	    s[i__ + j * 60] = shp2m[i__ * 7 - 4] * shp2m[j * 7 - 4] * 
		    constant;
	}
    }

    i__1 = nopem;
    for (i__ = 1; i__ <= i__1; ++i__) {
	i__2 = nopes;
	for (j = 1; j <= i__2; ++j) {
	    s[i__ + (nopem + j) * 60] = -shp2m[i__ * 7 - 4] * shp2s[j * 7 - 4]
		     * constant;
	}
    }

    i__1 = nopes;
    for (i__ = 1; i__ <= i__1; ++i__) {
	i__2 = nopes;
	for (j = i__; j <= i__2; ++j) {
	    s[nopem + i__ + (nopem + j) * 60] = shp2s[i__ * 7 - 4] * shp2s[j *
		     7 - 4] * constant;
	}
    }

    return 0;
} /* springstiff_f2f_th__ */

