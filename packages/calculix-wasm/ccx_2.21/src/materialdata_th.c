/* materialdata_th.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int materialdata_th__(doublereal *cocon, integer *ncocon, 
	integer *imat, integer *iorien, doublereal *pgauss, doublereal *orab, 
	integer *ntmat___, doublereal *coconloc, integer *mattyp, doublereal *
	t1l, doublereal *rhcon, integer *nrhcon, doublereal *rho, doublereal *
	shcon, integer *nshcon, doublereal *sph, doublereal *xstiff, integer *
	iint, integer *iel, integer *istiff, integer *mi)
{
    /* System generated locals */
    integer cocon_dim2, cocon_offset, rhcon_dim2, rhcon_offset, shcon_dim2, 
	    shcon_offset, xstiff_dim2, xstiff_offset, i__1;

    /* Local variables */
    integer ncoconst, k, id, two, four, ncond, seven;
    extern /* Subroutine */ int ident2_(doublereal *, doublereal *, integer *,
	     integer *, integer *);



/*     determines the density, the specific heat and the conductivity */
/*     in an integration point with coordinates pgauss */



    /* Parameter adjustments */
    ncocon -= 3;
    --pgauss;
    orab -= 8;
    shcon_dim2 = *ntmat___;
    shcon_offset = 0 + 4 * (1 + shcon_dim2);
    shcon -= shcon_offset;
    rhcon_dim2 = *ntmat___;
    rhcon_offset = 0 + 2 * (1 + rhcon_dim2);
    rhcon -= rhcon_offset;
    cocon_dim2 = *ntmat___;
    cocon_offset = 0 + 7 * (1 + cocon_dim2);
    cocon -= cocon_offset;
    --coconloc;
    --nrhcon;
    --nshcon;
    --mi;
    xstiff_dim2 = mi[1];
    xstiff_offset = 1 + 27 * (1 + xstiff_dim2);
    xstiff -= xstiff_offset;

    /* Function Body */
    two = 2;
    four = 4;
    seven = 7;

    if (*istiff == 1) {

	ncond = ncocon[(*imat << 1) + 1];
	if (ncond <= -100 || *iorien != 0) {
	    ncond = 6;
	}

/*        calculating the density (needed for the capacity matrix) */

	ident2_(&rhcon[(*imat * rhcon_dim2 + 1) * 2], t1l, &nrhcon[*imat], &
		two, &id);
	if (nrhcon[*imat] == 0) {
	} else if (nrhcon[*imat] == 1) {
	    *rho = rhcon[(*imat * rhcon_dim2 + 1 << 1) + 1];
	} else if (id == 0) {
	    *rho = rhcon[(*imat * rhcon_dim2 + 1 << 1) + 1];
	} else if (id == nrhcon[*imat]) {
	    *rho = rhcon[(id + *imat * rhcon_dim2 << 1) + 1];
	} else {
	    *rho = rhcon[(id + *imat * rhcon_dim2 << 1) + 1] + (rhcon[(id + 1 
		    + *imat * rhcon_dim2 << 1) + 1] - rhcon[(id + *imat * 
		    rhcon_dim2 << 1) + 1]) * (*t1l - rhcon[(id + *imat * 
		    rhcon_dim2) * 2]) / (rhcon[(id + 1 + *imat * rhcon_dim2) *
		     2] - rhcon[(id + *imat * rhcon_dim2) * 2]);
	}

/*        calculating the specific heat (needed for the capacity matrix) */

	ident2_(&shcon[(*imat * shcon_dim2 + 1) * 4], t1l, &nshcon[*imat], &
		four, &id);
	if (nshcon[*imat] == 0) {
	} else if (nshcon[*imat] == 1) {
	    *sph = shcon[(*imat * shcon_dim2 + 1 << 2) + 1];
	} else if (id == 0) {
	    *sph = shcon[(*imat * shcon_dim2 + 1 << 2) + 1];
	} else if (id == nshcon[*imat]) {
	    *sph = shcon[(id + *imat * shcon_dim2 << 2) + 1];
	} else {
	    *sph = shcon[(id + *imat * shcon_dim2 << 2) + 1] + (shcon[(id + 1 
		    + *imat * shcon_dim2 << 2) + 1] - shcon[(id + *imat * 
		    shcon_dim2 << 2) + 1]) * (*t1l - shcon[(id + *imat * 
		    shcon_dim2) * 4]) / (shcon[(id + 1 + *imat * shcon_dim2) *
		     4] - shcon[(id + *imat * shcon_dim2) * 4]);
	}

/*        determining the conductivity coefficients */

	for (k = 1; k <= 6; ++k) {
	    coconloc[k] = xstiff[k + 21 + (*iint + *iel * xstiff_dim2) * 27];
	}

/*        determining the type: isotropic, orthotropic or anisotropic */

	if (ncond <= 1) {
	    *mattyp = 1;
	} else if (ncond <= 3) {
	    *mattyp = 2;
	} else {
	    *mattyp = 3;
	}

    } else {

	ncoconst = ncocon[(*imat << 1) + 1];
	if (ncoconst <= -100) {
	    ncoconst = -ncoconst - 100;
	}

/*     calculating the conductivity coefficients */

	ident2_(&cocon[(*imat * cocon_dim2 + 1) * 7], t1l, &ncocon[(*imat << 
		1) + 2], &seven, &id);
	if (ncocon[(*imat << 1) + 2] == 0) {
	    for (k = 1; k <= 6; ++k) {
		coconloc[k] = 0.;
	    }
	} else if (ncocon[(*imat << 1) + 2] == 1) {
	    i__1 = ncoconst;
	    for (k = 1; k <= i__1; ++k) {
		coconloc[k] = cocon[k + (*imat * cocon_dim2 + 1) * 7];
	    }
	} else if (id == 0) {
	    i__1 = ncoconst;
	    for (k = 1; k <= i__1; ++k) {
		coconloc[k] = cocon[k + (*imat * cocon_dim2 + 1) * 7];
	    }
	} else if (id == ncocon[(*imat << 1) + 2]) {
	    i__1 = ncoconst;
	    for (k = 1; k <= i__1; ++k) {
		coconloc[k] = cocon[k + (id + *imat * cocon_dim2) * 7];
	    }
	} else {
	    i__1 = ncoconst;
	    for (k = 1; k <= i__1; ++k) {
		coconloc[k] = cocon[k + (id + *imat * cocon_dim2) * 7] + (
			cocon[k + (id + 1 + *imat * cocon_dim2) * 7] - cocon[
			k + (id + *imat * cocon_dim2) * 7]) * (*t1l - cocon[(
			id + *imat * cocon_dim2) * 7]) / (cocon[(id + 1 + *
			imat * cocon_dim2) * 7] - cocon[(id + *imat * 
			cocon_dim2) * 7]);
	    }
	}
    }

    return 0;
} /* materialdata_th__ */

