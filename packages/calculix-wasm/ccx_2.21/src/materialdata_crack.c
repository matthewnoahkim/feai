/* materialdata_crack.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int materialdata_crack__(doublereal *crcon, integer *
	ncrconst, integer *ncrtem, doublereal *t1l, doublereal *crconloc)
{
    /* System generated locals */
    integer crcon_dim1, crcon_offset, i__1;

    /* Local variables */
    integer k, id;
    extern /* Subroutine */ int ident2_(doublereal *, doublereal *, integer *,
	     integer *, integer *);


/*     calculate the crack propagation increment */




    /* Parameter adjustments */
    crcon_dim1 = *ncrconst - 0 + 1;
    crcon_offset = 0 + crcon_dim1;
    crcon -= crcon_offset;
    --crconloc;

    /* Function Body */
    i__1 = *ncrconst + 1;
    ident2_(&crcon[crcon_offset], t1l, ncrtem, &i__1, &id);
    if (*ncrtem == 0) {
    } else if (*ncrtem == 1) {
	i__1 = *ncrconst;
	for (k = 1; k <= i__1; ++k) {
	    crconloc[k] = crcon[k + crcon_dim1];
	}
    } else if (id == 0) {
	i__1 = *ncrconst;
	for (k = 1; k <= i__1; ++k) {
	    crconloc[k] = crcon[k + crcon_dim1];
	}
    } else if (id == *ncrtem) {
	i__1 = *ncrconst;
	for (k = 1; k <= i__1; ++k) {
	    crconloc[k] = crcon[k + id * crcon_dim1];
	}
    } else {
	i__1 = *ncrconst;
	for (k = 1; k <= i__1; ++k) {
	    crconloc[k] = crcon[k + id * crcon_dim1] + (crcon[k + (id + 1) * 
		    crcon_dim1] - crcon[k + id * crcon_dim1]) * (*t1l - crcon[
		    id * crcon_dim1]) / (crcon[(id + 1) * crcon_dim1] - crcon[
		    id * crcon_dim1]);
	}
    }

    return 0;
} /* materialdata_crack__ */

