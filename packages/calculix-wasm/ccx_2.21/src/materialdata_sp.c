/* materialdata_sp.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int materialdata_sp__(doublereal *elcon, integer *nelcon, 
	integer *imat, integer *ntmat___, integer *i__, doublereal *t1l, 
	doublereal *elconloc, integer *kode, doublereal *plicon, integer *
	nplicon, integer *npmat___, doublereal *plconloc, integer *ncmat___)
{
    /* System generated locals */
    integer nplicon_dim1, nplicon_offset, elcon_dim1, elcon_dim2, 
	    elcon_offset, plicon_dim1, plicon_dim2, plicon_offset, i__1;

    /* Local variables */
    integer nelconst, k, id, kin, itemp;
    extern /* Subroutine */ int plmix_(doublereal *, integer *, doublereal *, 
	    integer *, integer *, integer *, integer *, doublereal *, integer 
	    *, integer *), ident2_(doublereal *, doublereal *, integer *, 
	    integer *, integer *), plcopy_(doublereal *, integer *, 
	    doublereal *, integer *, integer *, integer *, integer *, integer 
	    *, integer *);



/*     determines the material data for element i */





/*     nelconst: # constants read from file */

/*     calculating the hardening coefficients */

/*     for the calculation of the spring stiffness, the whole curve */
/*     has to be stored: */
/*     plconloc(2*k-1), k=1...200: displacement */
/*     plconloc(2*k),k=1...200:    force */

    /* Parameter adjustments */
    nelcon -= 3;
    nplicon_dim1 = *ntmat___ - 0 + 1;
    nplicon_offset = 0 + nplicon_dim1;
    nplicon -= nplicon_offset;
    --elconloc;
    plicon_dim1 = 2 * *npmat___ - 0 + 1;
    plicon_dim2 = *ntmat___;
    plicon_offset = 0 + plicon_dim1 * (1 + plicon_dim2);
    plicon -= plicon_offset;
    --plconloc;
    elcon_dim1 = *ncmat___ - 0 + 1;
    elcon_dim2 = *ntmat___;
    elcon_offset = 0 + elcon_dim1 * (1 + elcon_dim2);
    elcon -= elcon_offset;

    /* Function Body */
    if (*kode < -50) {
	if (*npmat___ == 0) {
	    plconloc[801] = .5;
	    plconloc[802] = .5;
	} else {
	    plconloc[1] = 0.;
	    plconloc[2] = 0.;
	    plconloc[3] = 0.;
	    plconloc[801] = nplicon[*imat * nplicon_dim1 + 1] + .5;
	    plconloc[802] = .5;

/*     nonlinear spring characteristic or gap conductance characteristic */

	    if (nplicon[*imat * nplicon_dim1 + 1] != 0) {

		if (nplicon[*imat * nplicon_dim1] == 1) {
		    id = -1;
		} else {
		    i__1 = (*npmat___ << 1) + 1;
		    ident2_(&plicon[(*imat * plicon_dim2 + 1) * plicon_dim1], 
			    t1l, &nplicon[*imat * nplicon_dim1], &i__1, &id);
		}

		if (nplicon[*imat * nplicon_dim1] == 0) {
		} else if (nplicon[*imat * nplicon_dim1] == 1 || id == 0 || 
			id == nplicon[*imat * nplicon_dim1]) {
		    if (id <= 0) {
			itemp = 1;
		    } else {
			itemp = id;
		    }
		    kin = 0;
		    plcopy_(&plicon[plicon_offset], &nplicon[nplicon_offset], 
			    &plconloc[1], npmat___, ntmat___, imat, &itemp, 
			    i__, &kin);
		    if (id == 0 || id == nplicon[*imat * nplicon_dim1]) {
		    }
		} else {
		    kin = 0;
		    i__1 = id + 1;
		    plmix_(&plicon[plicon_offset], &nplicon[nplicon_offset], &
			    plconloc[1], npmat___, ntmat___, imat, &i__1, t1l,
			     i__, &kin);
		}
	    }
	}
    } else {

/*     linear spring characteristic */

	nelconst = nelcon[(*imat << 1) + 1];
	i__1 = *ncmat___ + 1;
	ident2_(&elcon[(*imat * elcon_dim2 + 1) * elcon_dim1], t1l, &nelcon[(*
		imat << 1) + 2], &i__1, &id);
	if (nelcon[(*imat << 1) + 2] == 0) {
	} else if (nelcon[(*imat << 1) + 2] == 1) {
	    i__1 = nelconst;
	    for (k = 1; k <= i__1; ++k) {
		elconloc[k] = elcon[k + (*imat * elcon_dim2 + 1) * elcon_dim1]
			;
	    }
	} else if (id == 0) {
	    i__1 = nelconst;
	    for (k = 1; k <= i__1; ++k) {
		elconloc[k] = elcon[k + (*imat * elcon_dim2 + 1) * elcon_dim1]
			;
	    }
	} else if (id == nelcon[(*imat << 1) + 2]) {
	    i__1 = nelconst;
	    for (k = 1; k <= i__1; ++k) {
		elconloc[k] = elcon[k + (id + *imat * elcon_dim2) * 
			elcon_dim1];
	    }
	} else {
	    i__1 = nelconst;
	    for (k = 1; k <= i__1; ++k) {
		elconloc[k] = elcon[k + (id + *imat * elcon_dim2) * 
			elcon_dim1] + (elcon[k + (id + 1 + *imat * elcon_dim2)
			 * elcon_dim1] - elcon[k + (id + *imat * elcon_dim2) *
			 elcon_dim1]) * (*t1l - elcon[(id + *imat * 
			elcon_dim2) * elcon_dim1]) / (elcon[(id + 1 + *imat * 
			elcon_dim2) * elcon_dim1] - elcon[(id + *imat * 
			elcon_dim2) * elcon_dim1]);
	    }
	}
    }

    return 0;
} /* materialdata_sp__ */

