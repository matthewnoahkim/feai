/* materialdata_rho.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int materialdata_rho__(doublereal *rhcon, integer *nrhcon, 
	integer *imat, doublereal *rho, doublereal *t1l, integer *ntmat___, 
	integer *ithermal)
{
    /* System generated locals */
    integer rhcon_dim2, rhcon_offset;

    /* Local variables */
    integer id, two;
    extern /* Subroutine */ int ident2_(doublereal *, doublereal *, integer *,
	     integer *, integer *);



/*     determines the density of the material */



    /* Parameter adjustments */
    --nrhcon;
    rhcon_dim2 = *ntmat___;
    rhcon_offset = 0 + 2 * (1 + rhcon_dim2);
    rhcon -= rhcon_offset;
    --ithermal;

    /* Function Body */
    two = 2;

    if (ithermal[1] == 0) {
	*rho = rhcon[(*imat * rhcon_dim2 + 1 << 1) + 1];
    } else {
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
    }

    return 0;
} /* materialdata_rho__ */

