/* cmatrix.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int cmatrix_(doublereal *ad, doublereal *au, integer *jqs, 
	integer *irows, integer *icols, integer *ndesi, integer *nodedesi, 
	doublereal *auc, integer *jqc, integer *irowc, integer *nodedesibou)
{
    /* System generated locals */
    integer i__1, i__2;

    /* Local variables */
    integer jj, kk, irow, ipos1, ipos2, inode1, inode2;
    extern /* Subroutine */ int nident_(integer *, integer *, integer *, 
	    integer *);


/*     calculates the values of the C-matrix */




    /* Parameter adjustments */
    --nodedesibou;
    --irowc;
    --jqc;
    --auc;
    --nodedesi;
    --icols;
    --irows;
    --jqs;
    --au;
    --ad;

    /* Function Body */
    i__1 = *ndesi;
    for (kk = 1; kk <= i__1; ++kk) {
	inode1 = nodedesi[kk];
	i__2 = jqc[kk + 1] - 1;
	for (jj = jqc[kk]; jj <= i__2; ++jj) {
	    irow = irowc[jj];
	    inode2 = nodedesibou[irow];
	    if (inode1 == inode2) {
		auc[jj] = ad[kk];
	    } else if (inode1 < inode2) {
		nident_(&nodedesi[1], &inode2, ndesi, &ipos1);
		nident_(&irows[jqs[kk]], &ipos1, &icols[kk], &ipos2);
		auc[jj] = au[jqs[kk] - 1 + ipos2];
	    } else {
		nident_(&nodedesi[1], &inode2, ndesi, &ipos1);
		nident_(&irows[jqs[ipos1]], &kk, &icols[ipos1], &ipos2);
		auc[jj] = au[jqs[ipos1] - 1 + ipos2];
	    }
	}
    }

    return 0;
} /* cmatrix_ */

