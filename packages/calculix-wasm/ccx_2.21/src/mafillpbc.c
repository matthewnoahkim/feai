/* mafillpbc.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int mafillpbc_(integer *nef, doublereal *au, doublereal *ad, 
	integer *jq, integer *irow, doublereal *b, integer *
	iatleastonepressurebc, integer *nzs)
{
    /* System generated locals */
    integer i__1;

    /* Local variables */
    integer i__;


/*     filling the lhs and rhs to calculate p */




/*     at least one pressure bc is needed. If none is applied, */
/*     the last dof is set to 0 */

/*     a pressure bc is only recognized if not all velocity degrees of */
/*     freedom are prescribed on the same face */

/*      write(*,*) 'mafillpbc', iatleastonepressurebc */
    /* Parameter adjustments */
    --b;
    --irow;
    --jq;
    --ad;
    --au;

    /* Function Body */
    if (*iatleastonepressurebc == 0) {
	ad[*nef] = 1.;
	b[*nef] = 0.;
	i__1 = *nef;
	for (i__ = 2; i__ <= i__1; ++i__) {
	    if (jq[i__] - 1 > 0) {
		if (irow[jq[i__] - 1] == *nef) {
		    au[jq[i__] - 1] = 0.;
		}
	    }
	}
    }

/*      do i=1,nzs */
/*         write(*,*) 'mafillp irow,au',i,au(i) */
/*      enddo */
/*      do i=1,nef */
/*         write(*,*) 'mafillp ad b',i,ad(i),b(i) */
/*      enddo */

    return 0;
} /* mafillpbc_ */

