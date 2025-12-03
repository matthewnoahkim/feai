/* createblock_struct.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int createblock_struct__(integer *neq, integer *ipointers, 
	integer *icolpardiso, doublereal *aupardiso, integer *nestart, 
	integer *num_cpus__, integer *ja, integer *nz_num__)
{
    /* System generated locals */
    integer i__1, i__2, i__3;

    /* Local variables */
    integer i__, j, k, m, isubtract, icol, numd;


/*     generates num_cpu blocks */



/*     nestart(i) points to the element before the block for which */
/*     cpu i is responsible */

    /* Parameter adjustments */
    --ja;
    --nestart;
    --aupardiso;
    --icolpardiso;
    --ipointers;

    /* Function Body */
    numd = *neq / *num_cpus__ + 1;
    nestart[1] = 0;
    i__1 = *num_cpus__;
    for (i__ = 2; i__ <= i__1; ++i__) {
	nestart[i__] = nestart[i__ - 1] + numd;
    }
    nestart[*num_cpus__ + 1] = *neq;

/*     ipointers(i) points to the first entry of row i in icolpardiso */
/*     ja(i) points to the entry in icolpardiso before the start of row i */

    j = 0;

    i__1 = *num_cpus__;
    for (k = 1; k <= i__1; ++k) {
	i__2 = nestart[k + 1];
	for (i__ = nestart[k] + 1; i__ <= i__2; ++i__) {
	    ja[i__] = j;
	    i__3 = ipointers[i__ + 1] - 1;
	    for (m = ipointers[i__]; m <= i__3; ++m) {
		icol = icolpardiso[m];
		if (icol > nestart[k] && icol <= nestart[k + 1]) {
		    ++j;
		    icolpardiso[j] = icol;
		    aupardiso[j] = aupardiso[m];
		}
	    }
	}
    }
    ja[*neq + 1] = j;
    *nz_num__ = j;

/*     subtracting from iam the number of elements belonging */
/*     to the preceding blocks */

    i__1 = *num_cpus__;
    for (k = 2; k <= i__1; ++k) {
	isubtract = nestart[k];
	i__2 = nestart[k + 1];
	for (i__ = nestart[k] + 1; i__ <= i__2; ++i__) {
	    i__3 = ja[i__ + 1];
	    for (j = ja[i__] + 1; j <= i__3; ++j) {
		icolpardiso[j] -= isubtract;
	    }
	}
    }

    return 0;
} /* createblock_struct__ */

