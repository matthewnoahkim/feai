/* fricheat.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int fricheat_(doublereal *et, doublereal *f, doublereal *
	vnorm, doublereal *time, char *ciname, integer *noel, integer *nelems,
	 integer *jfaces, integer *nelemm, integer *jfacem, doublereal *um, 
	integer *kstep, integer *kinc, doublereal *area, doublereal *pressure,
	 doublereal *coords, ftnlen ciname_len)
{

/*     user subroutine fricheat (only for surface-to-surface contact) */

/*     INPUT: */

/*     time(1)            step time at the end of the increment */
/*     time(2)            total time at the end of the increment */
/*     ciname             surface interaction name */
/*     noel               element number of the contact spring element */
/*     nelems             slave element number */
/*     jfaces             local slave face number */
/*     nelemm             master element number */
/*     jfacem             local master face number */
/*     um                 friction coefficient */
/*     kstep              step number */
/*     kinc               increment number */
/*     area               slave area corresponding to the contact */
/*                        spring element */
/*     pressure           actual pressure */
/*     coords(1..3)       coordinates of the slave integration point */

/*     OUTPUT: */

/*     et                 portion of the work converted into heat */
/*                        (0 <= et <= 1) */
/*     f                  portion of the heat going into the slave */
/*                        surface; 0 <= f <= 1; the portion of the */
/*                        heat going into the master surface is 1-f */
/*     vnorm              differential velocity between the surfaces */
/*                        in friction (>0) */







/*     insert code here */

    /* Parameter adjustments */
    --coords;
    --time;

    /* Function Body */
    *et = .9f;
    *f = .3f;
    *vnorm = 200.f;

    return 0;
} /* fricheat_ */

