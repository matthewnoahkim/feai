/* calceigenvalues.f -- translated by f2c (version 20200916).
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

/* Table of constant values */

static doublereal c_b2 = .33333333333333331;


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

/* Subroutine */ int calceigenvalues_(doublereal *c__, doublereal *al)
{
    /* Initialized data */

    static integer three = 3;

    /* System generated locals */
    doublereal d__1;

    /* Builtin functions */
    double atan(doublereal), pow_dd(doublereal *, doublereal *), sqrt(
	    doublereal), atan2(doublereal, doublereal), cos(doublereal);

    /* Local variables */
    integer i__;
    doublereal v1, v2, v3, bb, cc, cm, cn, pi, tt;
    extern /* Subroutine */ int insertsortd_(doublereal *, integer *);


/*     calculates the eigenvalues al of the symmetric 3x3 matrix c */
/*     the eigenvalues are sorted in increasing order */




    /* Parameter adjustments */
    --al;
    c__ -= 4;

    /* Function Body */

/*     calculation of the eigenvalues of c */
/*     Simo & Hughes Computational Inelasticity p 244 */

    pi = 4. * atan(1.);

    v1 = c__[4] + c__[8] + c__[12];
    v2 = c__[8] * c__[12] + c__[4] * c__[12] + c__[4] * c__[8] - (c__[11] * 
	    c__[11] + c__[10] * c__[10] + c__[7] * c__[7]);
    v3 = c__[4] * (c__[8] * c__[12] - c__[11] * c__[11]) - c__[7] * (c__[7] * 
	    c__[12] - c__[10] * c__[11]) + c__[10] * (c__[7] * c__[11] - c__[
	    10] * c__[8]);

    bb = v2 - v1 * v1 / 3.;
/* Computing 3rd power */
    d__1 = v1;
    cc = d__1 * (d__1 * d__1) * -2. / 27. + v1 * v2 / 3. - v3;
    if (abs(bb) <= 1e-10) {
	if (abs(cc) > 1e-10) {
	    al[1] = -pow_dd(&cc, &c_b2);
	} else {
	    al[1] = 0.;
	}
	al[2] = al[1];
	al[3] = al[1];
    } else {
	cm = sqrt(-bb / 3.) * 2.;
	cn = cc * 3. / (cm * bb);
	if (abs(cn) > 1.) {
	    if (cn > 1.) {
		cn = 1.;
	    } else {
		cn = -1.;
	    }
	}
	tt = atan2(sqrt(1. - cn * cn), cn) / 3.;
	al[1] = cm * cos(tt);
	al[2] = cm * cos(tt + pi * 2. / 3.);
	al[3] = cm * cos(tt + pi * 4. / 3.);
    }
    for (i__ = 1; i__ <= 3; ++i__) {
	al[i__] += v1 / 3.;
    }

/*     sorting */

    insertsortd_(&al[1], &three);
/*      call dsort(al,idummy,three,kflag) */

    return 0;
} /* calceigenvalues_ */

