/* materialdata_em.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int materialdata_em__(doublereal *elcon, integer *nelcon, 
	doublereal *alcon, integer *nalcon, integer *imat, integer *ntmat___, 
	doublereal *t1l, doublereal *elconloc, integer *ncmat___, doublereal *
	alpha)
{
    /* System generated locals */
    integer elcon_dim1, elcon_dim2, elcon_offset, alcon_dim2, alcon_offset, 
	    i__1;

    /* Local variables */
    integer nelconst, k, id, seven;
    extern /* Subroutine */ int ident2_(doublereal *, doublereal *, integer *,
	     integer *, integer *);



/*     determines the electric conductance and the magnetic */
/*     permeability for temperature t1l */



    /* Parameter adjustments */
    nelcon -= 3;
    nalcon -= 3;
    alcon_dim2 = *ntmat___;
    alcon_offset = 0 + 7 * (1 + alcon_dim2);
    alcon -= alcon_offset;
    --elconloc;
    elcon_dim1 = *ncmat___ - 0 + 1;
    elcon_dim2 = *ntmat___;
    elcon_offset = 0 + elcon_dim1 * (1 + elcon_dim2);
    elcon -= elcon_offset;
    --alpha;

    /* Function Body */
    seven = 7;

    nelconst = nelcon[(*imat << 1) + 1];

/*     calculating the electric conductance */

    ident2_(&alcon[(*imat * alcon_dim2 + 1) * 7], t1l, &nalcon[(*imat << 1) + 
	    2], &seven, &id);
    if (nalcon[(*imat << 1) + 2] == 0) {
	for (k = 1; k <= 6; ++k) {
	    alpha[k] = 0.;
	}
    } else if (nalcon[(*imat << 1) + 2] == 1) {
	i__1 = nalcon[(*imat << 1) + 1];
	for (k = 1; k <= i__1; ++k) {
	    alpha[k] = alcon[k + (*imat * alcon_dim2 + 1) * 7];
	}
    } else if (id == 0) {
	i__1 = nalcon[(*imat << 1) + 1];
	for (k = 1; k <= i__1; ++k) {
	    alpha[k] = alcon[k + (*imat * alcon_dim2 + 1) * 7];
	}
    } else if (id == nalcon[(*imat << 1) + 2]) {
	i__1 = nalcon[(*imat << 1) + 1];
	for (k = 1; k <= i__1; ++k) {
	    alpha[k] = alcon[k + (id + *imat * alcon_dim2) * 7];
	}
    } else {
	i__1 = nalcon[(*imat << 1) + 1];
	for (k = 1; k <= i__1; ++k) {
	    alpha[k] = alcon[k + (id + *imat * alcon_dim2) * 7] + (alcon[k + (
		    id + 1 + *imat * alcon_dim2) * 7] - alcon[k + (id + *imat 
		    * alcon_dim2) * 7]) * (*t1l - alcon[(id + *imat * 
		    alcon_dim2) * 7]) / (alcon[(id + 1 + *imat * alcon_dim2) *
		     7] - alcon[(id + *imat * alcon_dim2) * 7]);
	}
    }

/*     calculating the permeability */

    i__1 = *ncmat___ + 1;
    ident2_(&elcon[(*imat * elcon_dim2 + 1) * elcon_dim1], t1l, &nelcon[(*
	    imat << 1) + 2], &i__1, &id);
    if (nelcon[(*imat << 1) + 2] == 0) {
    } else if (nelcon[(*imat << 1) + 2] == 1) {
	i__1 = nelconst;
	for (k = 1; k <= i__1; ++k) {
	    elconloc[k] = elcon[k + (*imat * elcon_dim2 + 1) * elcon_dim1];
	}
    } else if (id == 0) {
	i__1 = nelconst;
	for (k = 1; k <= i__1; ++k) {
	    elconloc[k] = elcon[k + (*imat * elcon_dim2 + 1) * elcon_dim1];
	}
    } else if (id == nelcon[(*imat << 1) + 2]) {
	i__1 = nelconst;
	for (k = 1; k <= i__1; ++k) {
	    elconloc[k] = elcon[k + (id + *imat * elcon_dim2) * elcon_dim1];
	}
    } else {
	i__1 = nelconst;
	for (k = 1; k <= i__1; ++k) {
	    elconloc[k] = elcon[k + (id + *imat * elcon_dim2) * elcon_dim1] + 
		    (elcon[k + (id + 1 + *imat * elcon_dim2) * elcon_dim1] - 
		    elcon[k + (id + *imat * elcon_dim2) * elcon_dim1]) * (*
		    t1l - elcon[(id + *imat * elcon_dim2) * elcon_dim1]) / (
		    elcon[(id + 1 + *imat * elcon_dim2) * elcon_dim1] - elcon[
		    (id + *imat * elcon_dim2) * elcon_dim1]);
	}
    }

    return 0;
} /* materialdata_em__ */

