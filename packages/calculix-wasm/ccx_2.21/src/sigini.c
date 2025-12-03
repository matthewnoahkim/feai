/* sigini.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int sigini_(doublereal *sigma, doublereal *coords, integer *
	ntens, integer *ncrds, integer *noel, integer *npt, integer *layer, 
	integer *kspt, integer *lrebar, char *rebarn, ftnlen rebarn_len)
{

/*     user subroutine sigini */

/*     INPUT: */

/*     coords             coordinates of the integration point */
/*     ntens              number of stresses to be defined */
/*     ncrds              number of coordinates */
/*     noel               element number */
/*     npt                integration point number */
/*     layer              currently not used */
/*     kspt               currently not used */
/*     lrebar             currently not used (value: 0) */
/*     rebarn             currently not used */

/*     OUTPUT: */

/*     sigma(1..ntens)    residual stress values in the integration */
/*                        point. If ntens=6 the order of the */
/*                        components is 11,22,33,12,13,23 */



    /* Parameter adjustments */
    --coords;
    --sigma;

    /* Function Body */
    sigma[1] = coords[2] * -100.;
    sigma[2] = coords[2] * -100.;
    sigma[3] = coords[2] * -100.;
    sigma[4] = 0.;
    sigma[5] = 0.;
    sigma[6] = 0.;

    return 0;
} /* sigini_ */

