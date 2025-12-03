/* rectcylvold.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int rectcylvold_(doublereal *co, doublereal *vold, 
	doublereal *cs, integer *icntrl, integer *mi, integer *iznode, 
	integer *nznode, integer *nsectors, integer *nk)
{
    /* System generated locals */
    integer vold_dim1, vold_offset, i__1, i__2;

    /* Local variables */
    doublereal a[9]	/* was [3][3] */;
    integer i__, j, ii, jj;
    doublereal xr, xt, xz, csab[7];
    integer node;
    extern /* Subroutine */ int transformatrix_(doublereal *, doublereal *, 
	    doublereal *);


/*     special version of routine rectcyl for use in expand.c */
/*     transforms the reference displacements */

/*     icntrl=2:  rectangular to cylindrical coordinates for field */
/*                vold */
/*     icntrl=-2: cylindrical to rectangular coordinates for field */
/*                vold */

/*     nk: number of nodes in one segment */
/*     nkt: number of nodes in 360 */




    /* Parameter adjustments */
    co -= 4;
    cs -= 18;
    --mi;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;
    --iznode;

    /* Function Body */
    for (i__ = 1; i__ <= 7; ++i__) {
	csab[i__ - 1] = cs[i__ + 22];
    }

    if (*icntrl == 2) {
	i__1 = *nznode;
	for (ii = 1; ii <= i__1; ++ii) {
	    i__ = iznode[ii];
	    j = i__;
	    transformatrix_(csab, &co[i__ * 3 + 1], a);

	    xr = vold[j * vold_dim1 + 1] * a[0] + vold[j * vold_dim1 + 2] * a[
		    1] + vold[j * vold_dim1 + 3] * a[2];
	    xt = vold[j * vold_dim1 + 1] * a[3] + vold[j * vold_dim1 + 2] * a[
		    4] + vold[j * vold_dim1 + 3] * a[5];
	    xz = vold[j * vold_dim1 + 1] * a[6] + vold[j * vold_dim1 + 2] * a[
		    7] + vold[j * vold_dim1 + 3] * a[8];
	    vold[j * vold_dim1 + 1] = xr;
	    vold[j * vold_dim1 + 2] = xt;
	    vold[j * vold_dim1 + 3] = xz;

	}
    } else if (*icntrl == -2) {
	i__1 = *nznode;
	for (ii = 1; ii <= i__1; ++ii) {
	    node = iznode[ii];
	    i__2 = *nsectors;
	    for (jj = 1; jj <= i__2; ++jj) {
		i__ = node + (jj - 1) * *nk;
		j = i__;
		transformatrix_(csab, &co[i__ * 3 + 1], a);

		xr = vold[j * vold_dim1 + 1] * a[0] + vold[j * vold_dim1 + 2] 
			* a[3] + vold[j * vold_dim1 + 3] * a[6];
		xt = vold[j * vold_dim1 + 1] * a[1] + vold[j * vold_dim1 + 2] 
			* a[4] + vold[j * vold_dim1 + 3] * a[7];
		xz = vold[j * vold_dim1 + 1] * a[2] + vold[j * vold_dim1 + 2] 
			* a[5] + vold[j * vold_dim1 + 3] * a[8];
		vold[j * vold_dim1 + 1] = xr;
		vold[j * vold_dim1 + 2] = xt;
		vold[j * vold_dim1 + 3] = xz;

	    }
	}
    }

    return 0;
} /* rectcylvold_ */

