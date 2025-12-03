/* calcfeasibledirection_gp.f -- translated by f2c (version 20200916).
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

static integer c__9 = 9;
static integer c__1 = 1;


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

/* Subroutine */ int calcfeasibledirection_gp__(integer *ndesi, integer *
	nodedesi, doublereal *dgdxglob, integer *nactive, integer *nobject, 
	integer *nk, doublereal *gradproj)
{
    /* System generated locals */
    integer dgdxglob_dim2, dgdxglob_offset, i__1;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    integer s_wsle(cilist *), e_wsle(void), do_lio(integer *, integer *, char 
	    *, ftnlen);

    /* Local variables */
    integer i__;
    doublereal dd1, dd2;
    integer node;

    /* Fortran I/O blocks */
    static cilist io___5 = { 0, 6, 0, 0, 0 };
    static cilist io___6 = { 0, 6, 0, 0, 0 };
    static cilist io___7 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___10 = { 0, 6, 0, 0, 0 };
    static cilist io___11 = { 0, 6, 0, 0, 0 };
    static cilist io___12 = { 0, 6, 0, 0, 0 };
    static cilist io___13 = { 0, 6, 0, 0, 0 };



/*     calculates the projected gradient */




    /* Parameter adjustments */
    --nodedesi;
    dgdxglob_dim2 = *nk;
    dgdxglob_offset = 1 + 2 * (1 + dgdxglob_dim2);
    dgdxglob -= dgdxglob_offset;
    gradproj -= 4;

    /* Function Body */
    dd1 = 0.;
    dd2 = 0.;

/*     calc projected gradient if nactive greater than 0 */
/*     else, take sensitivity of objective function directly */

    if (*nactive > 0) {
	i__1 = *ndesi;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    node = nodedesi[i__];
	    gradproj[node * 3 + 2] = dgdxglob[(node + dgdxglob_dim2 << 1) + 2]
		     - gradproj[node * 3 + 2];
	}
	s_wsle(&io___5);
	e_wsle();
	s_wsle(&io___6);
	do_lio(&c__9, &c__1, "*INFO: at least 1 constraint active,", (ftnlen)
		36);
	e_wsle();
	s_wsle(&io___7);
	do_lio(&c__9, &c__1, "       projected gradient calculated", (ftnlen)
		36);
	e_wsle();
	s_wsle(&io___8);
	e_wsle();
    } else {
	i__1 = *ndesi;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    node = nodedesi[i__];
	    gradproj[node * 3 + 1] = 0.;
	    gradproj[node * 3 + 2] = dgdxglob[(node + dgdxglob_dim2 << 1) + 2]
		    ;
	}
	s_wsle(&io___9);
	e_wsle();
	s_wsle(&io___10);
	do_lio(&c__9, &c__1, "*INFO: no constraint active, sensitivity of", (
		ftnlen)43);
	e_wsle();
	s_wsle(&io___11);
	do_lio(&c__9, &c__1, "      objective function taken as projected", (
		ftnlen)43);
	e_wsle();
	s_wsle(&io___12);
	do_lio(&c__9, &c__1, "       gradient", (ftnlen)15);
	e_wsle();
	s_wsle(&io___13);
	e_wsle();
    }

/*     calc inifinity norms of the correction vector and */
/*     gradient projection vector and normalize gradient fields */

    i__1 = *ndesi;
    for (i__ = 1; i__ <= i__1; ++i__) {
	node = nodedesi[i__];
/* Computing MAX */
	d__2 = dd1, d__3 = (d__1 = gradproj[node * 3 + 1], abs(d__1));
	dd1 = max(d__2,d__3);
/* Computing MAX */
	d__2 = dd2, d__3 = (d__1 = gradproj[node * 3 + 2], abs(d__1));
	dd2 = max(d__2,d__3);
    }
    if (dd1 <= 0.) {
	dd1 = 1.;
    }
    if (dd2 <= 0.) {
	dd2 = 1.;
    }

    i__1 = *ndesi;
    for (i__ = 1; i__ <= i__1; ++i__) {
	node = nodedesi[i__];
	gradproj[node * 3 + 1] /= dd1;
	gradproj[node * 3 + 2] /= dd2;
	gradproj[node * 3 + 3] = gradproj[node * 3 + 2];
    }

    return 0;
} /* calcfeasibledirection_gp__ */

