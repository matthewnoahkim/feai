/* gasmechbc.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int gasmechbc_(doublereal *vold, integer *nload, char *
	sideload, integer *nelemload, doublereal *xload, integer *mi, ftnlen 
	sideload_len)
{
    /* System generated locals */
    integer vold_dim1, vold_offset, i__1;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    integer i__, node;






/*     updating the boudary conditions in a mechanical */
/*     calculation coming from a previous thermal calculation */

/*     updating the pressure boundary conditions */

    /* Parameter adjustments */
    sideload -= 20;
    nelemload -= 3;
    xload -= 3;
    --mi;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;

    /* Function Body */
    i__1 = *nload;
    for (i__ = 1; i__ <= i__1; ++i__) {
	if (s_cmp(sideload + (i__ * 20 + 2), "NP", (ftnlen)2, (ftnlen)2) == 0)
		 {
	    node = nelemload[(i__ << 1) + 2];
	    xload[(i__ << 1) + 1] = vold[node * vold_dim1 + 2];
	}
    }

    return 0;
} /* gasmechbc_ */

