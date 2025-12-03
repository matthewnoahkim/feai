/* crackshape.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int crackshape_(integer *nnfront, integer *ifront, integer *
	istartfront, integer *iendfront, integer *isubsurffront, doublereal *
	angle, doublereal *posfront, doublereal *shape)
{
    /* System generated locals */
    integer i__1, i__2;
    doublereal d__1;

    /* Builtin functions */
    double atan(doublereal);

    /* Local variables */
    integer i__, j, k;
    doublereal s, pi, shapeangle, shape0, twodpi, shapepi;


/*     User Subroutine */

/*     determine the shape factor for each crack front node */

/*     INPUT: */

/*     nnfront            number of crack fronts */
/*     ifront(i)          node number of front node i; the fronts are */
/*                        stored consecutively in ifront; within each */
/*                        front the nodes or stored by adjacency */
/*     istartfront(j)     start of front j in field ifront */
/*     iendfront(j)       end of front j in field ifront */
/*     isubsurffront(j)   0: front j is a front belonging to a surface */
/*                           crack */
/*                        1: front j belongs to a subsurface crack */
/*     angle(j)           angle between tangents at start and end of */
/*                        front j */
/*     posfront(i)        relative position of node ifront(i) within the */
/*                        the front it belongs to; 0<=posfront(i)<=1 */


/*     OUTPUT (general): */

/*     shape(k,i)         shape factor for mode k (1<=k<=3) at front */
/*                        node ifront(i) */




    /* Parameter adjustments */
    shape -= 4;
    --posfront;
    --angle;
    --isubsurffront;
    --iendfront;
    --istartfront;
    --ifront;

    /* Function Body */
    pi = atan(1.) * 4.;
    twodpi = 2. / pi;

    i__1 = *nnfront;
    for (i__ = 1; i__ <= i__1; ++i__) {
	if (isubsurffront[i__] == 1) {
	    i__2 = iendfront[i__];
	    for (j = istartfront[i__]; j <= i__2; ++j) {
		for (k = 1; k <= 3; ++k) {
		    shape[k + j * 3] = twodpi;
		}
	    }
	} else {
	    if (angle[i__] < pi) {
		i__2 = iendfront[i__];
		for (j = istartfront[i__]; j <= i__2; ++j) {
		    s = (d__1 = posfront[j] - .5, abs(d__1)) * 2.;
		    shape0 = (1. - s * s * .02) * 1.12;
		    shapepi = twodpi * (s * s * 1.1 + 1.04f);
		    shapeangle = shape0 * (1. - angle[i__] / pi) + shapepi * 
			    angle[i__] / pi;
		    for (k = 1; k <= 3; ++k) {
			shape[k + j * 3] = shapeangle;
		    }
		}
	    } else {
		i__2 = iendfront[i__];
		for (j = istartfront[i__]; j <= i__2; ++j) {
		    s = (d__1 = posfront[j] - .5, abs(d__1)) * 2.;
		    shapepi = twodpi * (s * s * 1.1 + 1.04f);
		    for (k = 1; k <= 3; ++k) {
			shape[k + j * 3] = shapepi;
		    }
		}
	    }
	}
    }

    return 0;
} /* crackshape_ */

