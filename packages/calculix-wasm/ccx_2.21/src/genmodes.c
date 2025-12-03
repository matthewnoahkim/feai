/* genmodes.f -- translated by f2c (version 20200916).
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
static integer c__201 = 201;


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

/*     Bernhardi start */
/* Subroutine */ int genmodes_(integer *i__, integer *kon, integer *ipkon, 
	char *lakon, integer *ne, integer *nk, integer *nk___, doublereal *co,
	 ftnlen lakon_len)
{
    /* System generated locals */
    integer i__1;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen), s_wsle(cilist *), do_lio(
	    integer *, integer *, char *, ftnlen), e_wsle(void);

    /* Local variables */
    integer j, k, nope;
    extern /* Subroutine */ int exit_(integer *);
    integer indexe;
    doublereal coords[3];
    integer nopeexp;

    /* Fortran I/O blocks */
    static cilist io___4 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 6, 0, 0, 0 };



/*     generate nodes for incompatible modes */





    /* Parameter adjustments */
    co -= 4;
    lakon -= 8;
    --ipkon;
    --kon;

    /* Function Body */
    indexe = ipkon[*i__];

/*     check for elements which may have been deactivated */

    if (indexe < -1) {
	indexe = -2 - indexe;
    }

    if (s_cmp(lakon + (*i__ << 3), "C3D8I", (ftnlen)5, (ftnlen)5) == 0) {
	nope = 8;
	nopeexp = 3;
    } else {
	s_wsle(&io___4);
	do_lio(&c__9, &c__1, "*ERROR in genmodes: wrong element type, elemen"
		"t=", (ftnlen)48);
	do_lio(&c__9, &c__1, lakon + (*i__ << 3), (ftnlen)8);
	e_wsle();
	exit_(&c__201);
    }

/*     generating additional nodes for the incompatible element. */

/*     determining the mean value of the coordinates of the element */

    for (k = 1; k <= 3; ++k) {
	coords[k - 1] = 0.;
	i__1 = nope;
	for (j = 1; j <= i__1; ++j) {
	    coords[k - 1] += co[k + kon[indexe + j] * 3];
	}
	coords[k - 1] /= 8.;
    }

    i__1 = nopeexp;
    for (j = 1; j <= i__1; ++j) {
	++(*nk);
	if (*nk > *nk___) {
	    s_wsle(&io___8);
	    do_lio(&c__9, &c__1, "*ERROR in genmodes: increase nk_", (ftnlen)
		    32);
	    e_wsle();
	    exit_(&c__201);
	}
	kon[indexe + nope + j] = *nk;
	for (k = 1; k <= 3; ++k) {
	    co[k + *nk * 3] = coords[k - 1];
	}
    }

    return 0;
} /* genmodes_ */

