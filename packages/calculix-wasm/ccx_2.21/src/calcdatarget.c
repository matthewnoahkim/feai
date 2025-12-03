/* calcdatarget.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int calcdatarget_(integer *ifront, doublereal *co, integer *
	nnfront, integer *istartfront, integer *iendfront, integer *
	isubsurffront, doublereal *damax, doublereal *datarget, doublereal *
	acrack, integer *nstep)
{
    /* System generated locals */
    integer i__1, i__2;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double sqrt(doublereal);

    /* Local variables */
    integer i__, j;
    doublereal dd, xa, ya, za, xn, yn, xp, yp, zp, zn, denominator;
    integer iend;
    doublereal xlan, xlpa, rcur, xlnp;
    integer istart;


/*     calculate the crack propagation increment: */
/*     it is the minimum of: */
/*     - the user-defined increment */
/*     - one fifth of the minimum crack front curvature */
/*     - one fifth of the smallest crack length */




    /* Parameter adjustments */
    --acrack;
    --isubsurffront;
    --iendfront;
    --istartfront;
    co -= 4;
    --ifront;

    /* Function Body */
    *datarget = *damax;

/*     loop over all fronts */

    i__1 = *nnfront;
    for (i__ = 1; i__ <= i__1; ++i__) {
	if (isubsurffront[i__] == 1) {
	    istart = istartfront[i__];
	    iend = iendfront[i__];
	} else {
	    istart = istartfront[i__] + 1;
	    iend = iendfront[i__] - 1;
	}

/*     loop over nodes belonging to front */

	i__2 = iend;
	for (j = istart; j <= i__2; ++j) {
	    if (j == istart) {

/*     previous node */

		if (isubsurffront[i__] == 1) {
		    xp = co[ifront[iend] * 3 + 1];
		    yp = co[ifront[iend] * 3 + 2];
		    zp = co[ifront[iend] * 3 + 3];
		} else {
		    xp = co[ifront[j - 1] * 3 + 1];
		    yp = co[ifront[j - 1] * 3 + 2];
		    zp = co[ifront[j - 1] * 3 + 3];
		}

/*     actual node */

		xa = co[ifront[j] * 3 + 1];
		ya = co[ifront[j] * 3 + 2];
		za = co[ifront[j] * 3 + 3];
	    } else {

/*     new previous node is old actual node */

		xp = xa;
		yp = ya;
		zp = za;

/*     new actual node is old next node */

		xa = xn;
		ya = yn;
		za = zn;
	    }

/*     next node */

	    if (j == iend && isubsurffront[i__] == 1) {
		xn = co[ifront[istart] * 3 + 1];
		yn = co[ifront[istart] * 3 + 2];
		zn = co[ifront[istart] * 3 + 3];
	    } else {
		xn = co[ifront[j + 1] * 3 + 1];
		yn = co[ifront[j + 1] * 3 + 2];
		zn = co[ifront[j + 1] * 3 + 3];
	    }

/*     calculate the radius of a circle going through the previous, */
/*     actual and next node (formula of Heron) */

	    if (j == istart) {
/* Computing 2nd power */
		d__1 = xa - xp;
/* Computing 2nd power */
		d__2 = ya - yp;
/* Computing 2nd power */
		d__3 = za - zp;
		xlpa = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);
	    } else {
		xlpa = xlan;
	    }
/* Computing 2nd power */
	    d__1 = xn - xa;
/* Computing 2nd power */
	    d__2 = yn - ya;
/* Computing 2nd power */
	    d__3 = zn - za;
	    xlan = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);
/* Computing 2nd power */
	    d__1 = xp - xn;
/* Computing 2nd power */
	    d__2 = yp - yn;
/* Computing 2nd power */
	    d__3 = zp - zn;
	    xlnp = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);
	    dd = (xlpa + xlan + xlnp) / 2.;

/*         radius of the circle */

	    denominator = sqrt(dd * (d__1 = dd - xlpa, abs(d__1)) * (d__2 = 
		    dd - xlan, abs(d__2)) * (d__3 = dd - xlnp, abs(d__3))) * 
		    4.;
	    if (denominator < 1e-10) {
		rcur = 1e10;
	    } else {
		rcur = xlpa * xlan * xlnp / denominator;
	    }

/*          rcur=xlpa*xlan*xlnp/ */
/*     &         (4.d0*dsqrt(dd*(dd-xlpa)*(dd-xlan)*(dd-xlnp))) */

/*     datarget=min(datarget,rcur/5.d0,acrack(j)/5.d0) */
/* Computing MIN */
	    d__1 = *datarget, d__2 = rcur / 5.;
	    *datarget = min(d__1,d__2);
/* Computing MIN */
	    d__1 = *datarget, d__2 = acrack[j] / 5.;
	    *datarget = min(d__1,d__2);
	}
    }

    return 0;
} /* calcdatarget_ */

