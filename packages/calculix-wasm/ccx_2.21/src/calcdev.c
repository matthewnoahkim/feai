/* calcdev.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int calcdev_(doublereal *vold, doublereal *vcon, doublereal *
	v, integer *nk, integer *iturbulent, integer *mi, doublereal *vconmax,
	 doublereal *vmax, integer *iexplicit, integer *nka, integer *nkb)
{
    /* System generated locals */
    integer v_dim1, v_offset, vold_dim1, vold_offset, vcon_dim1, vcon_offset, 
	    i__1;
    doublereal d__1;

    /* Local variables */
    integer i__, j;


/*     calculates the change in solution */




/*     first subiteration: calculate the size of the conservative */
/*     fields */

    /* Parameter adjustments */
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
    for (j = 0; j <= 6; ++j) {
	vconmax[j] = 0.;
    }

    if (*iexplicit == 1) {

/*     for incompressible fluids the density is stored */
/*     in vcon(4,*), the change in density in v(*,4) */

	i__1 = *nkb;
	for (i__ = *nka; i__ <= i__1; ++i__) {
	    for (j = 0; j <= 4; ++j) {
/* Computing 2nd power */
		d__1 = vcon[i__ + j * vcon_dim1];
		vconmax[j] += d__1 * d__1;
	    }
	}
    } else {
	i__1 = *nkb;
	for (i__ = *nka; i__ <= i__1; ++i__) {
	    for (j = 0; j <= 3; ++j) {
/* Computing 2nd power */
		d__1 = vcon[i__ + j * vcon_dim1];
		vconmax[j] += d__1 * d__1;
	    }

/*     for incompressible fluids the pressure is stored */
/*     in vold(4,*), the change in pressure in v(*,4) */

/* Computing 2nd power */
	    d__1 = vold[i__ * vold_dim1 + 4];
	    vconmax[4] += d__1 * d__1;
	}
    }
    if (*iturbulent != 0) {
	i__1 = *nkb;
	for (i__ = *nka; i__ <= i__1; ++i__) {
	    for (j = 5; j <= 6; ++j) {
/* Computing 2nd power */
		d__1 = vcon[i__ + j * vcon_dim1];
		vconmax[j] += d__1 * d__1;
	    }
	}
    }

/*     all subiterations: calculate the size of the change of */
/*     the conservative variables */

    for (j = 0; j <= 6; ++j) {
	vmax[j] = 0.;
    }

    if (*iexplicit == 1) {

/*     for incompressible fluids the density is stored */
/*     in vcon(*,4), the change in density in v(*,4) */

	i__1 = *nkb;
	for (i__ = *nka; i__ <= i__1; ++i__) {
	    for (j = 0; j <= 4; ++j) {
/* Computing 2nd power */
		d__1 = v[i__ + j * v_dim1];
		vmax[j] += d__1 * d__1;
	    }
	}
    } else {
	i__1 = *nkb;
	for (i__ = *nka; i__ <= i__1; ++i__) {
	    for (j = 0; j <= 3; ++j) {
/* Computing 2nd power */
		d__1 = v[i__ + j * v_dim1];
		vmax[j] += d__1 * d__1;
	    }

/*     for incompressible fluids the pressure is stored */
/*     in vold(4,*), the change in pressure in v(*,4) */

/* Computing 2nd power */
	    d__1 = v[i__ + (v_dim1 << 2)];
	    vmax[4] += d__1 * d__1;
	}
    }
    if (*iturbulent != 0) {
	i__1 = *nkb;
	for (i__ = *nka; i__ <= i__1; ++i__) {
	    for (j = 5; j <= 6; ++j) {
/* Computing 2nd power */
		d__1 = v[i__ + j * v_dim1];
		vmax[j] += d__1 * d__1;
	    }
	}
    }

    return 0;
} /* calcdev_ */

