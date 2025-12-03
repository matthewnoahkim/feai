/* resultsp.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int resultsp_(integer *nk, integer *nactdoh, doublereal *v, 
	doublereal *sol, integer *mi)
{
    /* System generated locals */
    integer v_dim1, v_offset, i__1;

    /* Local variables */
    integer i__;


/*     calculates the pressure correction (STEP 2) in the nodes */




/*     extracting the pressure correction from the solution */

    /* Parameter adjustments */
    --nactdoh;
    --sol;
    --mi;
    v_dim1 = *nk;
    v_offset = 1 + v_dim1 * 0;
    v -= v_offset;

    /* Function Body */
    i__1 = *nk;
    for (i__ = 1; i__ <= i__1; ++i__) {
	if (nactdoh[i__] > 0) {
	    v[i__ + (v_dim1 << 2)] = sol[nactdoh[i__]];
	} else {
	    v[i__ + (v_dim1 << 2)] = 0.;
	}
    }

    return 0;
} /* resultsp_ */

