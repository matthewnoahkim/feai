/* plcopy.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int plcopy_(doublereal *plcon, integer *nplcon, doublereal *
	plconloc, integer *npmat___, integer *ntmat___, integer *imat, 
	integer *itemp, integer *nelem, integer *kin)
{
    /* System generated locals */
    integer nplcon_dim1, nplcon_offset, plcon_dim1, plcon_dim2, plcon_offset, 
	    i__1;

    /* Local variables */
    integer k;
    extern /* Subroutine */ int plinterpol_(doublereal *, integer *, integer *
	    , doublereal *, doublereal *, integer *, integer *, integer *, 
	    integer *, doublereal *);
    doublereal epla, depl;
    integer ndata;
    doublereal dummy, eplmin, eplmax;


/*     copies the hardening data for material imat and temperature */
/*     itemp from plcon into plconloc if the number of data points does */
/*     not exceed 200. Else, the equivalent plastic strain range is */
/*     divided into 199 intervals and the values are interpolated. */
/*     Attention: in plcon the odd storage spaces contain the Von */
/*                Mises stress, the even ones the equivalent plastic */
/*                strain. For plconloc, this order is reversed. */




    /* Parameter adjustments */
    --plconloc;
    nplcon_dim1 = *ntmat___ - 0 + 1;
    nplcon_offset = 0 + nplcon_dim1;
    nplcon -= nplcon_offset;
    plcon_dim1 = 2 * *npmat___ - 0 + 1;
    plcon_dim2 = *ntmat___;
    plcon_offset = 0 + plcon_dim1 * (1 + plcon_dim2);
    plcon -= plcon_offset;

    /* Function Body */
    ndata = nplcon[*itemp + *imat * nplcon_dim1];

    if (ndata <= 200) {
	if (*kin == 0) {
	    i__1 = ndata;
	    for (k = 1; k <= i__1; ++k) {
		plconloc[(k << 1) - 1] = plcon[(k << 1) + (*itemp + *imat * 
			plcon_dim2) * plcon_dim1];
		plconloc[k * 2] = plcon[(k << 1) - 1 + (*itemp + *imat * 
			plcon_dim2) * plcon_dim1];
	    }
	    plconloc[801] = (real) ndata + .5;
	} else {
	    i__1 = ndata;
	    for (k = 1; k <= i__1; ++k) {
		plconloc[(k << 1) + 399] = plcon[(k << 1) + (*itemp + *imat * 
			plcon_dim2) * plcon_dim1];
		plconloc[(k << 1) + 400] = plcon[(k << 1) - 1 + (*itemp + *
			imat * plcon_dim2) * plcon_dim1];
	    }
	    plconloc[802] = (real) ndata + .5;
	}
    } else {
	if (*kin == 0) {
	    eplmin = plcon[(*itemp + *imat * plcon_dim2) * plcon_dim1 + 2];
	    eplmax = plcon[(nplcon[*itemp + *imat * nplcon_dim1] << 1) + (*
		    itemp + *imat * plcon_dim2) * plcon_dim1] - 1e-10;
	    depl = (eplmax - eplmin) / 199.;
	    for (k = 1; k <= 200; ++k) {
		epla = eplmin + (k - 1) * depl;
		plinterpol_(&plcon[plcon_offset], &nplcon[nplcon_offset], 
			itemp, &plconloc[k * 2], &dummy, npmat___, ntmat___, 
			imat, nelem, &epla);
		plconloc[(k << 1) - 1] = epla;
	    }
	    plconloc[801] = 200.5;
	} else {
	    eplmin = plcon[(*itemp + *imat * plcon_dim2) * plcon_dim1 + 2];
	    eplmax = plcon[(nplcon[*itemp + *imat * nplcon_dim1] << 1) + (*
		    itemp + *imat * plcon_dim2) * plcon_dim1] - 1e-10;
	    depl = (eplmax - eplmin) / 199.;
	    for (k = 1; k <= 200; ++k) {
		epla = eplmin + (k - 1) * depl;
		plinterpol_(&plcon[plcon_offset], &nplcon[nplcon_offset], 
			itemp, &plconloc[(k << 1) + 400], &dummy, npmat___, 
			ntmat___, imat, nelem, &epla);
		plconloc[(k << 1) + 399] = epla;
	    }
	}
	plconloc[802] = 200.5;
    }

    return 0;
} /* plcopy_ */

