/* swap.f -- translated by f2c (version 20200916).
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

logical swap_(doublereal *x1, doublereal *y1, doublereal *x2, doublereal *y2, 
	doublereal *x3, doublereal *y3, doublereal *xp, doublereal *yp)
{
    /* System generated locals */
    logical ret_val;

    /* Local variables */
    doublereal x13, y13, x23, y23, x1p, y1p, x2p, y2p, cosa, cosb, sina, sinb;






    x13 = *x1 - *x3;
    y13 = *y1 - *y3;
    x23 = *x2 - *x3;
    y23 = *y2 - *y3;
    x1p = *x1 - *xp;
    y1p = *y1 - *yp;
    x2p = *x2 - *xp;
    y2p = *y2 - *yp;
    cosa = x13 * x23 + y13 * y23;
    cosb = x2p * x1p + y1p * y2p;
    if (cosa >= 0. && cosb >= 0.) {
	ret_val = FALSE_;
    } else if (cosa < 0. && cosb < 0.) {
	ret_val = TRUE_;
    } else {
	sina = x13 * y23 - x23 * y13;
	sinb = x2p * y1p - x1p * y2p;
	if (sina * cosb + sinb * cosa < 0.) {
	    ret_val = TRUE_;
	} else {
	    ret_val = FALSE_;
	}
    }
    return ret_val;
} /* swap_ */

