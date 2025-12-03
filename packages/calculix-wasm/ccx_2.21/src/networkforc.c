/* networkforc.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int networkforc_(doublereal *vl, doublereal *tnl, integer *
	imat, integer *konl, integer *mi, integer *ntmat___, doublereal *
	shcon, integer *nshcon, doublereal *rhcon, integer *nrhcon)
{
    /* System generated locals */
    integer vl_dim1, vl_offset, shcon_dim2, shcon_offset, rhcon_dim2, 
	    rhcon_offset;

    /* Local variables */
    doublereal r__, cp, dvi, rho, gastemp;
    extern /* Subroutine */ int materialdata_tg__(integer *, integer *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     doublereal *, doublereal *, integer *, doublereal *);


/*     calculates the concentrated flux of a generic networkelement */
/*     element label: D + blank */




    /* Parameter adjustments */
    --tnl;
    --konl;
    --mi;
    vl_dim1 = mi[2] - 0 + 1;
    vl_offset = 0 + vl_dim1;
    vl -= vl_offset;
    rhcon_dim2 = *ntmat___;
    rhcon_offset = 0 + 2 * (1 + rhcon_dim2);
    rhcon -= rhcon_offset;
    shcon_dim2 = *ntmat___;
    shcon_offset = 0 + 4 * (1 + shcon_dim2);
    shcon -= shcon_offset;
    --nshcon;
    --nrhcon;

    /* Function Body */
    gastemp = (vl[vl_dim1] + vl[vl_dim1 * 3]) / 2.;

    materialdata_tg__(imat, ntmat___, &gastemp, &shcon[shcon_offset], &nshcon[
	    1], &cp, &r__, &dvi, &rhcon[rhcon_offset], &nrhcon[1], &rho);

/*     internal force = - external force */

    if (vl[(vl_dim1 << 1) + 1] > 0.) {
	tnl[3] = cp * (vl[vl_dim1 * 3] - vl[vl_dim1]) * vl[(vl_dim1 << 1) + 1]
		;
    } else {
	tnl[1] = -cp * (vl[vl_dim1] - vl[vl_dim1 * 3]) * vl[(vl_dim1 << 1) + 
		1];
    }

    return 0;
} /* networkforc_ */

