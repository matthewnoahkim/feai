/* triloc.f -- translated by f2c (version 20200916).
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

/*     S.W. Sloan, Adv.Eng.Software,1987,9(1),34-55. */
/*     Permission for use with the GPL license granted by Prof. Scott */
/*     Sloan on 17. Nov. 2013 */

integer triloc_(doublereal *xp, doublereal *yp, doublereal *x, doublereal *y, 
	integer *v, integer *e, integer *numtri)
{
    /* System generated locals */
    integer ret_val;

    /* Local variables */
    integer i__, t, v1, v2;





    /* Parameter adjustments */
    e -= 4;
    v -= 4;
    --y;
    --x;

    /* Function Body */
    t = *numtri;
L10:
    for (i__ = 1; i__ <= 3; ++i__) {
	v1 = v[i__ + t * 3];
	v2 = v[i__ % 3 + 1 + t * 3];
	if ((y[v1] - *yp) * (x[v2] - *xp) > (x[v1] - *xp) * (y[v2] - *yp)) {
	    t = e[i__ + t * 3];
	    goto L10;
	}
/* L20: */
    }
    ret_val = t;
    return ret_val;
} /* triloc_ */

