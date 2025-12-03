/* networkstiff.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int networkstiff_(doublereal *voldl, doublereal *s, integer *
	imat, integer *konl, integer *mi, integer *ntmat___, doublereal *
	shcon, integer *nshcon, doublereal *rhcon, integer *nrhcon)
{
    /* System generated locals */
    integer voldl_dim1, voldl_offset, shcon_dim2, shcon_offset, rhcon_dim2, 
	    rhcon_offset;

    /* Local variables */
    doublereal r__, cp, dvi, rho, gastemp;
    extern /* Subroutine */ int materialdata_tg__(integer *, integer *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     doublereal *, doublereal *, integer *, doublereal *);


/*     calculates the stiffness of a generic networkelement */
/*     element label: D + blank */






    /* Parameter adjustments */
    s -= 61;
    --konl;
    --mi;
    voldl_dim1 = mi[2] - 0 + 1;
    voldl_offset = 0 + voldl_dim1;
    voldl -= voldl_offset;
    rhcon_dim2 = *ntmat___;
    rhcon_offset = 0 + 2 * (1 + rhcon_dim2);
    rhcon -= rhcon_offset;
    shcon_dim2 = *ntmat___;
    shcon_offset = 0 + 4 * (1 + shcon_dim2);
    shcon -= shcon_offset;
    --nshcon;
    --nrhcon;

    /* Function Body */
    gastemp = (voldl[voldl_dim1] + voldl[voldl_dim1 * 3]) / 2.;

    materialdata_tg__(imat, ntmat___, &gastemp, &shcon[shcon_offset], &nshcon[
	    1], &cp, &r__, &dvi, &rhcon[rhcon_offset], &nrhcon[1], &rho);

    if (voldl[(voldl_dim1 << 1) + 1] > 0.) {
	s[63] = -cp * voldl[(voldl_dim1 << 1) + 1];
	s[183] = -s[63];
    } else {
	s[61] = -cp * voldl[(voldl_dim1 << 1) + 1];
	s[181] = -s[61];
    }

    return 0;
} /* networkstiff_ */

