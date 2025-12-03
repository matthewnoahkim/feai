/* checksharp.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int checksharp_(integer *nexternedg, integer *iedgextfa, 
	doublereal *cotet, integer *ifacext, integer *isharp)
{
    /* System generated locals */
    integer i__1;
    doublereal d__1;

    /* Builtin functions */
    double sqrt(doublereal);

    /* Local variables */
    integer i__, j, k;
    extern /* Subroutine */ int shape3tri_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *)
	    ;
    doublereal dd, et, xi, xl[9]	/* was [3][3] */, xs[21]	/* 
	    was [3][7] */, xn1[3], xn2[3], shp[21]	/* was [7][3] */, xsj[
	    3];
    integer iflag, imastfa;


/*     check which edges of the unrefined mesh are sharp */

/*     the check is done on the angle between the normals on the */
/*     adjacent faces */

/*     To this end middle nodes are NOT taken into account, i.e. quadratic */
/*     faces are reduced to linear faces */






    /* Parameter adjustments */
    --isharp;
    ifacext -= 7;
    cotet -= 4;
    iedgextfa -= 3;

    /* Function Body */
    iflag = 2;
    xi = .33333333333333331;
    et = .33333333333333331;

    i__1 = *nexternedg;
    for (i__ = 1; i__ <= i__1; ++i__) {

/*     first neighboring face */

	imastfa = iedgextfa[(i__ << 1) + 1];
	for (j = 1; j <= 3; ++j) {
	    for (k = 1; k <= 3; ++k) {
		xl[k + j * 3 - 4] = cotet[k + ifacext[j + imastfa * 6] * 3];
	    }
	}
	shape3tri_(&xi, &et, xl, xsj, xs, shp, &iflag);
	dd = sqrt(xsj[0] * xsj[0] + xsj[1] * xsj[1] + xsj[2] * xsj[2]);
	for (j = 1; j <= 3; ++j) {
	    xn1[j - 1] = xsj[j - 1] / dd;
	}

/*     second neighboring face */

	imastfa = iedgextfa[(i__ << 1) + 2];
	for (j = 1; j <= 3; ++j) {
	    for (k = 1; k <= 3; ++k) {
		xl[k + j * 3 - 4] = cotet[k + ifacext[j + imastfa * 6] * 3];
	    }
	}
	shape3tri_(&xi, &et, xl, xsj, xs, shp, &iflag);
	dd = sqrt(xsj[0] * xsj[0] + xsj[1] * xsj[1] + xsj[2] * xsj[2]);
	for (j = 1; j <= 3; ++j) {
	    xn2[j - 1] = xsj[j - 1] / dd;
	}

/*     if the normals are nearly parallel, the edge is no sharp edge */
/*     "nearly parallel" means that the angle between the vectors */
/*     is smaller than 0.0464 degrees. */

	if ((d__1 = xn1[0] * xn2[0] + xn1[1] * xn2[1] + xn1[2] * xn2[2] - 1., 
		abs(d__1)) > 1e-10) {
	    isharp[i__] = 1;
	}
    }

    return 0;
} /* checksharp_ */

