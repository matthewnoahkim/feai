/* updatecon.f -- translated by f2c (version 20200916).
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
/*     Copyright (C) 1998-2023 Guido Dhondt */

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

/* Subroutine */ int updatecon_(doublereal *vold, doublereal *vcon, 
	doublereal *v, integer *nk, integer *ithermal, integer *iturbulent, 
	integer *mi, integer *compressible, integer *nka, integer *nkb)
{
    /* System generated locals */
    integer v_dim1, v_offset, vold_dim1, vold_offset, vcon_dim1, vcon_offset, 
	    i__1;

    /* Local variables */
    integer i__, j;


/*     updating the conservative variables */




/*     volumetric energy density */

    /* Parameter adjustments */
    --ithermal;
    --mi;
    v_dim1 = *nk;
    v_offset = 1 + v_dim1 * 0;
    v -= v_offset;
    vcon_dim1 = *nk;
    vcon_offset = 1 + vcon_dim1 * 0;
    vcon -= vcon_offset;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;

    /* Function Body */
    if (ithermal[1] > 1) {
	i__1 = *nkb;
	for (i__ = *nka; i__ <= i__1; ++i__) {
	    vcon[i__] += v[i__];
	}
    }

/*     volumetric momentum density */
/*     pressure (liquid) or density (gas) */

    i__1 = *nkb;
    for (i__ = *nka; i__ <= i__1; ++i__) {

	for (j = 1; j <= 3; ++j) {
	    vcon[i__ + j * vcon_dim1] += v[i__ + j * v_dim1];
	}

	if (*compressible == 1) {

/*     explicit compressible: v contains the change in */
/*     density, vcon the density */

	    vcon[i__ + (vcon_dim1 << 2)] += v[i__ + (v_dim1 << 2)];
	} else {
	    vold[i__ * vold_dim1 + 4] += v[i__ + (v_dim1 << 2)];
	}
    }

/*     volumetric turbulent density */

    if (*iturbulent != 0) {
	i__1 = *nkb;
	for (i__ = *nka; i__ <= i__1; ++i__) {
	    if (vcon[i__ + vcon_dim1 * 5] + v[i__ + v_dim1 * 5] > 1e-10) {
		vcon[i__ + vcon_dim1 * 5] += v[i__ + v_dim1 * 5];
	    } else {
		v[i__ + v_dim1 * 5] = 0.;
	    }
	    if (vcon[i__ + vcon_dim1 * 6] + v[i__ + v_dim1 * 6] > 0.) {
		vcon[i__ + vcon_dim1 * 6] += v[i__ + v_dim1 * 6];
	    } else {
		v[i__ + v_dim1 * 6] = 0.;
	    }
	}
    }

    return 0;
} /* updatecon_ */

