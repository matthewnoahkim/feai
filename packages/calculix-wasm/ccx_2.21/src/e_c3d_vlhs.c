/* e_c3d_vlhs.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int e_c3d_vlhs__(char *lakonl, doublereal *sm, integer *
	nelem, integer *ipvar, doublereal *var, ftnlen lakonl_len)
{
    /* System generated locals */
    integer i__1, i__2, i__3;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    integer i__, j, k;
    doublereal shp[80]	/* was [4][20] */;
    integer nope, index, mint3d;
    doublereal weight;


/*     computation of the velocity element matrix for the element with */
/*     the topology in konl */





    /* Parameter adjustments */
    --var;
    --ipvar;
    sm -= 9;

    /* Function Body */
    if (*(unsigned char *)&lakonl[3] == '8') {
	nope = 8;
    } else if (*(unsigned char *)&lakonl[3] == '4') {
	nope = 4;
    } else if (*(unsigned char *)&lakonl[3] == '6') {
	nope = 6;
    }

    if (*(unsigned char *)&lakonl[3] != '4') {
	if (s_cmp(lakonl + 3, "8R", (ftnlen)2, (ftnlen)2) == 0) {
	    mint3d = 1;
	} else if (*(unsigned char *)&lakonl[3] == '8') {
	    mint3d = 8;
	} else if (*(unsigned char *)&lakonl[3] == '4') {
	    mint3d = 1;
	} else if (s_cmp(lakonl + 3, "6 ", (ftnlen)2, (ftnlen)2) == 0) {
	    mint3d = 2;
	}

/*     initialisation of sm */

	i__1 = nope;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    i__2 = nope;
	    for (j = 1; j <= i__2; ++j) {
		sm[i__ + (j << 3)] = 0.;
	    }
	}

/*     computation of the matrix: loop over the Gauss points */

	index = ipvar[*nelem];
	i__1 = mint3d;
	for (k = 1; k <= i__1; ++k) {

/*     copying the shape functions, their derivatives and the */
/*     Jacobian determinant from field var */

	    i__2 = nope;
	    for (j = 1; j <= i__2; ++j) {
/*            do i=1,4 */
/*              index=index+1 */
		index += 4;
/*              shp(i,j)=var(index) */
		shp[(j << 2) - 1] = var[index];
/*            enddo */
	    }
	    ++index;
	    weight = var[index];

	    ++index;

	    i__2 = nope;
	    for (j = 1; j <= i__2; ++j) {
		i__3 = j;
		for (i__ = 1; i__ <= i__3; ++i__) {

/*     lhs velocity matrix */

		    sm[i__ + (j << 3)] += shp[(i__ << 2) - 1] * shp[(j << 2) 
			    - 1] * weight;
		}
	    }
	}
    } else {

/*        C3D4: analytical solution (agrees with a 4 point integration */
/*              scheme */

	index = ipvar[*nelem] + 17;
	weight = var[index];
	for (j = 1; j <= 4; ++j) {
	    i__1 = j - 1;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		sm[i__ + (j << 3)] = weight * .05;
	    }
	    sm[j + (j << 3)] = weight * .1;
	}
    }

    return 0;
} /* e_c3d_vlhs__ */

