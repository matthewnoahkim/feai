/* sdvini.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int sdvini_(doublereal *statev, doublereal *coords, integer *
	nstatv, integer *ncrds, integer *noel, integer *npt, integer *layer, 
	integer *kspt)
{
    /* System generated locals */
    integer i__1;

    /* Local variables */
    integer i__;


/*     user subroutine sdvini */


/*     INPUT: */

/*     coords(1..3)       global coordinates of the integration point */
/*     nstatv             number of internal variables (must be */
/*                        defined by the user with the *DEPVAR card) */
/*     ncrds              number of coordinates */
/*     noel               element number */
/*     npt                integration point number */
/*     layer              not used */
/*     kspt               not used */

/*     OUTPUT: */

/*     statev(1..nstatv)  initial value of the internal state */
/*                        variables */




/*     code for retrieving the internal state variables */

/*      do i=1,13 */
    /* Parameter adjustments */
    --statev;
    --coords;

    /* Function Body */
    i__1 = *nstatv;
    for (i__ = 1; i__ <= i__1; ++i__) {
	statev[i__] = 1.;
    }
    return 0;
} /* sdvini_ */

