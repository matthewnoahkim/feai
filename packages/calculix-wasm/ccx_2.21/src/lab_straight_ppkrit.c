/* lab_straight_ppkrit.f -- translated by f2c (version 20200916).
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

/*     this subroutines enables to calculate the critical pressure ratio of a straight */
/*     labyrinth seal as a function of the number of spikes (n). */

/*     The following table is obtained by solving iteratively the equation : */
/*     Ps_inf/Pt0=ppkrit=1/dsqrt(1+2.n-ln(ppkrit)) */

/*     this equation can be found by using the formula for the ideal mass flow in a straight labyrinth */
/*     see "Air system Correlations Part 1 : Labyrith Seals" H.Zimmermann and K.H. Wollf ASME98-GT-206 */
/*     and determining the maximum flow for a given number of fin. */

/*     author: Yannick Muller */

/* Subroutine */ int lab_straight_ppkrit__(integer *n, doublereal *ppkrit)
{
    /* Initialized data */

    static doublereal fppkrit[9] = { .47113022,.37968106,.32930492,.29569704,
	    .27105479,.25191791,.23646609,.22363192,.21274011 };






    *ppkrit = fppkrit[(0 + (0 + (*n - 1 << 3))) / 8];

    return 0;
} /* lab_straight_ppkrit__ */

