/* beamintscheme.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int beamintscheme_(char *lakonl, integer *mint3d, integer *
	npropstart, doublereal *prop, integer *kk, doublereal *xi, doublereal 
	*et, doublereal *ze, doublereal *weight, ftnlen lakonl_len)
{
    /* Builtin functions */
    double sqrt(doublereal), atan(doublereal), cos(doublereal), sin(
	    doublereal);

    /* Local variables */
    doublereal a, b, r__, t1, t2, t3, t4;
    integer jj;
    doublereal theta, ratio, ratio2, dtheta;


/*     provides the integration scheme for beams with a cross section */
/*     which is not rectangular nor elliptical */

/*     mint3d: number of integration points (returned if kk=0) */
/*     xi,et,ze: local coordinates of integration point kk */
/*     weight: weight for integration point kk */







    /* Parameter adjustments */
    --prop;

    /* Function Body */
    if (*(unsigned char *)&lakonl[7] == 'P') {

/*        pipe cross section */

	if (*kk == 0) {
	    *mint3d = 16;
	    return 0;
	}

/*        ratio of inner radius to outer radius */

	ratio = (prop[*npropstart + 1] - prop[*npropstart + 2]) / prop[*
		npropstart + 1];
	ratio2 = ratio * ratio;

	if (*kk > 8) {
	    jj = *kk - 8;
	    *xi = 1. / sqrt(3.);
	} else {
	    jj = *kk;
	    *xi = -1. / sqrt(3.);
	}

/*        pi/4 */

	dtheta = atan(1.);

	theta = (jj - 1) * dtheta;
	r__ = sqrt((ratio2 + 1.) / 2.);

	*et = r__ * cos(theta);
	*ze = r__ * sin(theta);
	*weight = dtheta * (1. - ratio2) / 2.;

/*     Box cross section */
    } else if (*(unsigned char *)&lakonl[7] == 'B') {
	if (*kk == 0) {
	    *mint3d = 32;
	    return 0;
	}

/*        2 pts in long direction xi */

	if (*kk > 16) {
	    jj = *kk - 16;
	    *xi = 1. / sqrt(3.);
	} else {
	    jj = *kk;
	    *xi = -1. / sqrt(3.);
	}

/*        pts in cross sections */

	a = prop[*npropstart + 1];
	b = prop[*npropstart + 2];
	t1 = prop[*npropstart + 3];
	t2 = prop[*npropstart + 4];
	t3 = prop[*npropstart + 5];
	t4 = prop[*npropstart + 6];

	if (jj == 1) {
	    *et = -(t4 - b) / b;
	    *ze = -(t1 - a) / a;
	    *weight = -(((a * -2 + t1 * 2 + t3) * t4 + t1 * t2 - b * 2 * t1) /
		     (a * b)) / 6.;
	} else if (jj == 2) {
	    *et = -((t4 * 3 - t2 - b * 2) / b) / 4.;
	    *ze = -(t1 - a) / a;
	    *weight = -((t1 * 2 * t4 + t1 * 2 * t2 - b * 4 * t1) / (a * b)) / 
		    3.;
	} else if (jj == 3) {
	    *et = -((t4 - t2) / b) / 2.;
	    *ze = -(t1 - a) / a;
	    *weight = -((t1 * t4 + t1 * t2 - b * 2 * t1) / (a * b)) / 3.;
	} else if (jj == 4) {
	    *et = -((t4 - t2 * 3 + b * 2) / b) / 4.;
	    *ze = -(t1 - a) / a;
	    *weight = -((t1 * 2 * t4 + t1 * 2 * t2 - b * 4 * t1) / (a * b)) / 
		    3.;
	} else if (jj == 5) {
	    *et = (t2 - b) / b;
	    *ze = -(t1 - a) / a;
	    *weight = -((t1 * t4 + t2 * t3 + (t1 * 2 - a * 2) * t2 - b * 2 * 
		    t1) / (a * b)) / 6.;
	} else if (jj == 6) {
	    *et = (t2 - b) / b;
	    *ze = (t3 - t1 * 3 + a * 2) / a / 4.;
	    *weight = -((t2 * 2 * t3 + (t1 * 2 - a * 4) * t2) / (a * b)) / 3.;
	} else if (jj == 7) {
	    *et = (t2 - b) / b;
	    *ze = (t3 - t1) / a / 2.;
	    *weight = -((t2 * t3 + (t1 - a * 2) * t2) / (a * b)) / 3.;
	} else if (jj == 8) {
	    *et = (t2 - b) / b;
	    *ze = (t3 * 3 - t1 - a * 2) / a / 4.;
	    *weight = -((t2 * 2 * t3 + (t1 * 2 - a * 4) * t2) / (a * b)) / 3.;
	} else if (jj == 9) {
	    *et = (t2 - b) / b;
	    *ze = (t3 - a) / a;
	    *weight = -((t3 * t4 + (t2 * 2 - b * 2) * t3 + (t1 - a * 2) * t2) 
		    / (a * b)) / 6.;
	} else if (jj == 10) {
	    *et = -((t4 - t2 * 3 + b * 2) / b) / 4.;
	    *ze = (t3 - a) / a;
	    *weight = -((t3 * 2 * t4 + (t2 * 2 - b * 4) * t3) / (a * b)) / 3.;
	} else if (jj == 11) {
	    *et = -((t4 - t2) / b) / 2.;
	    *ze = (t3 - a) / a;
	    *weight = -((t3 * t4 + (t2 - b * 2) * t3) / (a * b)) / 3.;
	} else if (jj == 12) {
	    *et = -((t4 * 3 - t2 - b * 2) / b) / 4.;
	    *ze = (t3 - a) / a;
	    *weight = -((t3 * 2 * t4 + (t2 * 2 - b * 4) * t3) / (a * b)) / 3.;
	} else if (jj == 13) {
	    *et = -(t4 - b) / b;
	    *ze = (t3 - a) / a;
	    *weight = -(((a * -2 + t1 + t3 * 2) * t4 + (t2 - b * 2) * t3) / (
		    a * b)) / 6.;
	} else if (jj == 14) {
	    *et = -(t4 - b) / b;
	    *ze = (t3 * 3 - t1 - a * 2) / a / 4.;
	    *weight = -((t3 * 2 + t1 * 2 - a * 4) * t4 / (a * b)) / 3.;
	} else if (jj == 15) {
	    *et = -(t4 - b) / b;
	    *ze = (t3 - t1) / a / 2.;
	    *weight = -((t3 + t1 - a * 2) * t4 / (a * b)) / 3.;
	} else if (jj == 16) {
	    *et = -(t4 - b) / b;
	    *ze = (t3 - t1 * 3 + a * 2) / a / 4.;
	    *weight = -((t3 * 2 + t1 * 2 - a * 4) * t4 / (a * b)) / 3.;
	}
    }

    return 0;
} /* beamintscheme_ */

