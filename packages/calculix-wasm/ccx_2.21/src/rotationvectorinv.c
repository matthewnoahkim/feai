/* rotationvectorinv.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int rotationvectorinv_(doublereal *c__, doublereal *v)
{
    /* Builtin functions */
    double sqrt(doublereal), cos(doublereal), sin(doublereal);

    /* Local variables */
    doublereal dc, ds, theta;


/*     calculates rotation matrix from rotation vector */





    /* Parameter adjustments */
    --v;
    c__ -= 4;

    /* Function Body */
    theta = sqrt(v[1] * v[1] + v[2] * v[2] + v[3] * v[3]);

    if (theta == 0.) {
	c__[4] = 1.;
	c__[7] = 0.;
	c__[10] = 0.;
	c__[5] = 0.;
	c__[8] = 1.;
	c__[11] = 0.;
	c__[6] = 0.;
	c__[9] = 0.;
	c__[12] = 1.;
    } else {

	dc = cos(theta);
	ds = sin(theta);

/*     C-matrix from Guido Dhondt, The Finite Element */
/*     Method for Three-Dimensional Thermomechanical */
/*     Applications p 158 */

	c__[4] = dc + (1. - dc) * v[1] * v[1] / (theta * theta);
	c__[7] = (1. - dc) * v[1] * v[2] / (theta * theta) - ds * v[3] / 
		theta;
	c__[10] = (1. - dc) * v[1] * v[3] / (theta * theta) + ds * v[2] / 
		theta;
	c__[5] = (1. - dc) * v[2] * v[1] / (theta * theta) + ds * v[3] / 
		theta;
	c__[8] = dc + (1. - dc) * v[2] * v[2] / (theta * theta);
	c__[11] = (1. - dc) * v[2] * v[3] / (theta * theta) - ds * v[1] / 
		theta;
	c__[6] = (1. - dc) * v[3] * v[1] / (theta * theta) - ds * v[2] / 
		theta;
	c__[9] = (1. - dc) * v[3] * v[2] / (theta * theta) + ds * v[1] / 
		theta;
	c__[12] = dc + (1. - dc) * v[3] * v[3] / (theta * theta);
    }

    return 0;

} /* rotationvectorinv_ */

