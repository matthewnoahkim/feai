/* rotationvector.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int rotationvector_(doublereal *a, doublereal *v)
{
    /* Builtin functions */
    double atan(doublereal), sqrt(doublereal), acos(doublereal);

    /* Local variables */
    doublereal q[4], pi, theta, length;


/*     calculates rotation vector v from rotation matrix a */





/*     based on: J.M.P. van Waveren, From Quaternion to Matrix and Back */
/*     February 27th 2005, Id Software, Inc. */
/*     and */
/*     Jay A. Farrel, Computation of the Quaternion from a Rotation */
/*     Matrix, November 30, 2015, University of California, Riverside */

    /* Parameter adjustments */
    --v;
    a -= 4;

    /* Function Body */
    pi = atan(1.) * 4.;

    if (a[4] + a[8] + a[12] > 0.) {
	q[0] = sqrt(a[4] + a[8] + a[12] + 1.) / 2.;
	q[1] = (a[9] - a[11]) / (q[0] * 4.);
	q[2] = (a[10] - a[6]) / (q[0] * 4.);
	q[3] = (a[5] - a[7]) / (q[0] * 4.);
    } else if (a[4] > a[8] && a[4] > a[12]) {
	q[1] = sqrt(a[4] - a[8] - a[12] + 1.) / 2.;
	q[0] = (a[9] - a[11]) / (q[1] * 4.);
	q[2] = (a[7] + a[5]) / (q[1] * 4.);
	q[3] = (a[10] + a[6]) / (q[1] * 4.);
    } else if (a[8] > a[12]) {
	q[2] = sqrt(-a[4] + a[8] - a[12] + 1.) / 2.;
	q[0] = (a[10] - a[6]) / (q[2] * 4.);
	q[1] = (a[7] + a[5]) / (q[2] * 4.);
	q[3] = (a[11] + a[9]) / (q[2] * 4.);
    } else {
	q[3] = sqrt(-a[4] - a[8] + a[12] + 1.) / 2.;
	q[0] = (a[5] - a[7]) / (q[3] * 4.);
	q[1] = (a[10] + a[6]) / (q[3] * 4.);
	q[2] = (a[11] + a[9]) / (q[3] * 4.);
    }

    length = sqrt(q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
    theta = acos(q[0]) * 2.;

/*     if pi<theta<2*pi: reverse direction of rotation vector */
/*     and map angle in the range (0,pi) */

    if (theta > pi) {
	theta = pi * 2 - theta;
	q[1] = -q[1];
	q[2] = -q[2];
	q[3] = -q[3];
    }

    if (length != 0.) {
	v[1] = theta * q[1] / length;
	v[2] = theta * q[2] / length;
	v[3] = theta * q[3] / length;
    } else {
	v[1] = 0.;
	v[2] = 0.;
	v[3] = 0.;
    }

/*     if theta=pi: */
/*     if x<0 -> change sign of rotation vector */
/*     elseif x=0 and y<0 -> change sign of rotation vector */
/*     elseif x=0 and y=0 and z<0 -> change sign of rotation vector */

    if (theta == pi) {
	if (v[1] < 0.) {
/*                 +++ vs --- */
/*                 ++- vs --+ */
/*                 +-+ vs -+- */
/*                 +-- vs -++ */
/*                 +0+ vs -0- */
/*                 ++0 vs --0 */
/*                 +0- vs -0+ */
/*                 +-0 vs -+0 */
/*                 +00 vs -00 */
	    v[1] = -v[1];
	    v[2] = -v[2];
	    v[3] = -v[3];
	} else if (v[1] == 0.) {
	    if (v[2] < 0.) {
/*                       0+- vs 0-+ */
/*                       0+0 vs 0-0 */
/*                       0++ vs 0-- */
		v[2] = -v[2];
		v[3] = -v[3];
	    } else if (v[2] == 0.) {
		if (v[3] < 0.) {
/*                             00+ vs 00- */
		    v[3] = -v[3];
		}
	    }
	}
    }

/*      write(*,*)'ROTATION VECTOR' */
/*      write(*,*)v(1),v(2),v(3) */

    return 0;

} /* rotationvector_ */

