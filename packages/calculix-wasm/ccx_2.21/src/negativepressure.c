/* negativepressure.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int negativepressure_(integer *ne0, integer *ne, integer *mi,
	 doublereal *stx, doublereal *pressureratio)
{
    /* System generated locals */
    integer stx_dim2, stx_offset, i__1;

    /* Local variables */
    integer i__;
    doublereal presmin, presmax;


/*     calculating the ratio of the smallest pressure to the */
/*     largest pressure for face-to-face contact */
/*     if the pressure is somewhere negative, this ratio will */
/*     be negative */




    /* Parameter adjustments */
    --mi;
    stx_dim2 = mi[1];
    stx_offset = 1 + 6 * (1 + stx_dim2);
    stx -= stx_offset;

    /* Function Body */
    presmax = 0.;
    presmin = 0.;

    i__1 = *ne;
    for (i__ = *ne0 + 1; i__ <= i__1; ++i__) {
	if (stx[(i__ * stx_dim2 + 1) * 6 + 4] > presmax) {
	    presmax = stx[(i__ * stx_dim2 + 1) * 6 + 4];
	} else if (stx[(i__ * stx_dim2 + 1) * 6 + 4] < presmin) {
	    presmin = stx[(i__ * stx_dim2 + 1) * 6 + 4];
	}
    }
    *pressureratio = presmin / presmax;

    return 0;
} /* negativepressure_ */

