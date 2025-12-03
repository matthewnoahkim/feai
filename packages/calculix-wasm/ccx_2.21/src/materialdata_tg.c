/* materialdata_tg.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int materialdata_tg__(integer *imat, integer *ntmat___, 
	doublereal *t1l, doublereal *shcon, integer *nshcon, doublereal *sph, 
	doublereal *r__, doublereal *dvi, doublereal *rhcon, integer *nrhcon, 
	doublereal *rho)
{
    /* System generated locals */
    integer shcon_dim2, shcon_offset, rhcon_dim2, rhcon_offset;

    /* Local variables */
    integer id, two, four;
    extern /* Subroutine */ int ident2_(doublereal *, doublereal *, integer *,
	     integer *, integer *);



/*     determines the following gas properties: the density, */
/*     the specific heat, the dynamic viscosity and the specific gas constant */





    /* Parameter adjustments */
    rhcon_dim2 = *ntmat___;
    rhcon_offset = 0 + 2 * (1 + rhcon_dim2);
    rhcon -= rhcon_offset;
    shcon_dim2 = *ntmat___;
    shcon_offset = 0 + 4 * (1 + shcon_dim2);
    shcon -= shcon_offset;
    --nshcon;
    --nrhcon;

    /* Function Body */
    two = 2;
    four = 4;

/*     calculating the density (needed for liquids) */

    ident2_(&rhcon[(*imat * rhcon_dim2 + 1) * 2], t1l, &nrhcon[*imat], &two, &
	    id);
    if (nrhcon[*imat] == 0) {
	*rho = 0.;
    } else if (nrhcon[*imat] == 1) {
	*rho = rhcon[(*imat * rhcon_dim2 + 1 << 1) + 1];
    } else if (id == 0) {
	*rho = rhcon[(*imat * rhcon_dim2 + 1 << 1) + 1];
    } else if (id == nrhcon[*imat]) {
	*rho = rhcon[(id + *imat * rhcon_dim2 << 1) + 1];
    } else {
	*rho = rhcon[(id + *imat * rhcon_dim2 << 1) + 1] + (rhcon[(id + 1 + *
		imat * rhcon_dim2 << 1) + 1] - rhcon[(id + *imat * rhcon_dim2 
		<< 1) + 1]) * (*t1l - rhcon[(id + *imat * rhcon_dim2) * 2]) / 
		(rhcon[(id + 1 + *imat * rhcon_dim2) * 2] - rhcon[(id + *imat 
		* rhcon_dim2) * 2]);
    }

/*     calculating the specific heat and the dynamic viscosity */

    ident2_(&shcon[(*imat * shcon_dim2 + 1) * 4], t1l, &nshcon[*imat], &four, 
	    &id);
    if (nshcon[*imat] == 0) {
    } else if (nshcon[*imat] == 1) {
	*sph = shcon[(*imat * shcon_dim2 + 1 << 2) + 1];
	*dvi = shcon[(*imat * shcon_dim2 + 1 << 2) + 2];
    } else if (id == 0) {
	*sph = shcon[(*imat * shcon_dim2 + 1 << 2) + 1];
	*dvi = shcon[(*imat * shcon_dim2 + 1 << 2) + 2];
    } else if (id == nshcon[*imat]) {
	*sph = shcon[(id + *imat * shcon_dim2 << 2) + 1];
	*dvi = shcon[(id + *imat * shcon_dim2 << 2) + 2];
    } else {
	*sph = shcon[(id + *imat * shcon_dim2 << 2) + 1] + (shcon[(id + 1 + *
		imat * shcon_dim2 << 2) + 1] - shcon[(id + *imat * shcon_dim2 
		<< 2) + 1]) * (*t1l - shcon[(id + *imat * shcon_dim2) * 4]) / 
		(shcon[(id + 1 + *imat * shcon_dim2) * 4] - shcon[(id + *imat 
		* shcon_dim2) * 4]);
	*dvi = shcon[(id + *imat * shcon_dim2 << 2) + 2] + (shcon[(id + 1 + *
		imat * shcon_dim2 << 2) + 2] - shcon[(id + *imat * shcon_dim2 
		<< 2) + 2]) * (*t1l - shcon[(id + *imat * shcon_dim2) * 4]) / 
		(shcon[(id + 1 + *imat * shcon_dim2) * 4] - shcon[(id + *imat 
		* shcon_dim2) * 4]);
    }

/*     specific gas constant */

    *r__ = shcon[(*imat * shcon_dim2 + 1 << 2) + 3];

    return 0;
} /* materialdata_tg__ */

