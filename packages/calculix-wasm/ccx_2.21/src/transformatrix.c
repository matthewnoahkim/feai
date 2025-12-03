/* transformatrix.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int transformatrix_(doublereal *xab, doublereal *p, 
	doublereal *a)
{
    /* Builtin functions */
    double sqrt(doublereal);

    /* Local variables */
    integer j;
    doublereal e1[3], e2[3], e3[3], dd;


/*     determines the transformation matrix a in a point p for a carthesian */
/*     (xab(7)>0) or cylindrical transformation (xab(7)<0) */

/*     the matrix a(i,j) corresponds to matrix T, p. 100 in */
/*     Dhondt, G., The Finite Element Method for Three-Dimensional */
/*                 Thermomechanical Applications, Wiley (2004). */




    /* Parameter adjustments */
    a -= 4;
    --p;
    --xab;

    /* Function Body */
    if (xab[7] > 0.) {

/*        carthesian transformation */

	e1[0] = xab[1];
	e1[1] = xab[2];
	e1[2] = xab[3];

	e2[0] = xab[4];
	e2[1] = xab[5];
	e2[2] = xab[6];

	dd = sqrt(e1[0] * e1[0] + e1[1] * e1[1] + e1[2] * e1[2]);
	for (j = 1; j <= 3; ++j) {
	    e1[j - 1] /= dd;
	}

	dd = e1[0] * e2[0] + e1[1] * e2[1] + e1[2] * e2[2];
	for (j = 1; j <= 3; ++j) {
	    e2[j - 1] -= dd * e1[j - 1];
	}

	dd = sqrt(e2[0] * e2[0] + e2[1] * e2[1] + e2[2] * e2[2]);
	for (j = 1; j <= 3; ++j) {
	    e2[j - 1] /= dd;
	}

	e3[0] = e1[1] * e2[2] - e2[1] * e1[2];
	e3[1] = e1[2] * e2[0] - e1[0] * e2[2];
	e3[2] = e1[0] * e2[1] - e2[0] * e1[1];

    } else {

/*        cylindrical coordinate system in point p */

	e1[0] = p[1] - xab[1];
	e1[1] = p[2] - xab[2];
	e1[2] = p[3] - xab[3];

	e3[0] = xab[4] - xab[1];
	e3[1] = xab[5] - xab[2];
	e3[2] = xab[6] - xab[3];

	dd = sqrt(e3[0] * e3[0] + e3[1] * e3[1] + e3[2] * e3[2]);

	for (j = 1; j <= 3; ++j) {
	    e3[j - 1] /= dd;
	}

	dd = e1[0] * e3[0] + e1[1] * e3[1] + e1[2] * e3[2];

	for (j = 1; j <= 3; ++j) {
	    e1[j - 1] -= dd * e3[j - 1];
	}

	dd = sqrt(e1[0] * e1[0] + e1[1] * e1[1] + e1[2] * e1[2]);

/*        check whether p belongs to the cylindrical coordinate axis */
/*        if so, an arbitrary vector perpendicular to the axis can */
/*        be taken */

	if (dd < 1e-10) {
/*            write(*,*) '*WARNING in transformatrix: point on axis' */
	    if (abs(e3[0]) > 1e-10) {
		e1[1] = 1.;
		e1[2] = 0.;
		e1[0] = -e3[1] / e3[0];
	    } else if (abs(e3[1]) > 1e-10) {
		e1[2] = 1.;
		e1[0] = 0.;
		e1[1] = -e3[2] / e3[1];
	    } else {
		e1[0] = 1.;
		e1[1] = 0.;
		e1[2] = -e3[0] / e3[2];
	    }
	    dd = sqrt(e1[0] * e1[0] + e1[1] * e1[1] + e1[2] * e1[2]);
	}

	for (j = 1; j <= 3; ++j) {
	    e1[j - 1] /= dd;
	}

	e2[0] = e3[1] * e1[2] - e1[1] * e3[2];
	e2[1] = e3[2] * e1[0] - e1[2] * e3[0];
	e2[2] = e3[0] * e1[1] - e1[0] * e3[1];

    }

/*     finding the transformation matrix */

    for (j = 1; j <= 3; ++j) {
	a[j + 3] = e1[j - 1];
	a[j + 6] = e2[j - 1];
	a[j + 9] = e3[j - 1];
    }

    return 0;
} /* transformatrix_ */

