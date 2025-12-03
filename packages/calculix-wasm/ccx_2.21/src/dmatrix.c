/* dmatrix.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int dmatrix_(doublereal *ad, doublereal *au, integer *jqs, 
	integer *irows, integer *icols, integer *ndesi, integer *nodedesi, 
	doublereal *add, doublereal *aud, integer *jqd, integer *irowd, 
	integer *ndesibou, integer *nodedesibou)
{
    /* System generated locals */
    integer i__1, i__2;

    /* Local variables */
    integer j, idof, jdof, ipos1, ipos2, ipos3, inode1, inode2;
    extern /* Subroutine */ int nident_(integer *, integer *, integer *, 
	    integer *);


/*     calculates the values of the D-matrix */




    /* Parameter adjustments */
    --nodedesibou;
    --irowd;
    --jqd;
    --aud;
    --add;
    --nodedesi;
    --icols;
    --irows;
    --jqs;
    --au;
    --ad;

    /* Function Body */
    i__1 = *ndesibou;
    for (idof = 1; idof <= i__1; ++idof) {
	inode1 = nodedesibou[idof];
	nident_(&nodedesi[1], &inode1, ndesi, &ipos1);
	add[idof] = ad[ipos1];
	i__2 = jqd[idof + 1] - 1;
	for (j = jqd[idof]; j <= i__2; ++j) {
	    jdof = irowd[j];
	    inode2 = nodedesibou[jdof];
	    nident_(&nodedesi[1], &inode2, ndesi, &ipos2);
	    nident_(&irows[jqs[ipos1]], &ipos2, &icols[ipos1], &ipos3);

/*     assign the value to the D-matrix */

	    aud[j] = au[jqs[ipos1] - 1 + ipos3];
	}
    }

    return 0;
} /* dmatrix_ */

