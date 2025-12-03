/* cload.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int cload_(doublereal *xload, integer *kstep, integer *kinc, 
	doublereal *time, integer *node, integer *idof, doublereal *coords, 
	doublereal *vold, integer *mi, integer *ntrans, doublereal *trab, 
	integer *inotr, doublereal *veold)
{
    /* System generated locals */
    integer vold_dim1, vold_offset, veold_dim1, veold_offset;

    /* Local variables */
    doublereal a[9]	/* was [3][3] */, f1, f2, f3, ve1, ve2, ve3;
    integer itr;
    extern /* Subroutine */ int transformatrix_(doublereal *, doublereal *, 
	    doublereal *);


/*     user subroutine cload */


/*     INPUT: */

/*     kstep              step number */
/*     kinc               increment number */
/*     time(1)            current step time */
/*     time(2)            current total time */
/*     node               node number */
/*     idof               degree of freedom */
/*     coords(1..3)       global coordinates of the node */
/*     vold(0..mi(2) */
/*              ,1..nk)   solution field in all nodes (for modal */
/*                        dynamics: in all nodes for which output */
/*                        was requested or a force was applied) */
/*                        (not available for CFD-calculations) */
/*                        0: temperature */
/*                        1: displacement in global x-direction */
/*                        2: displacement in global y-direction */
/*                        3: displacement in global z-direction */
/*                        4: not used */
/*     mi(1)              max # of integration points per element (max */
/*                        over all elements) */
/*     mi(2)              max degree of freedomm per node (max over all */
/*                        nodes) in fields like v(0:mi(2))... */
/*     veold(0..mi(2) */
/*               ,1..nk)  For non-CFD-calculations: */
/*                        derivative of the solution field w.r.t. */
/*                        time in all nodes(for modal */
/*                        dynamics: in all nodes for which output */
/*                        was requested or a force was applied) */
/*                        0: temperature rate */
/*                        1: velocity in global x-direction */
/*                        2: velocity in global y-direction */
/*                        3: velocity in global z-direction */

/*                        For CFD-calculations: */
/*                        0: temperature */
/*                        1: velocity in global x-direction */
/*                        2: velocity in global y-direction */
/*                        3: velocity in global z-direction */
/*                        4: static pressure */

/*     ntrans             number of transform definitions */
/*     trab(1..6,i)       coordinates of two points defining transform i */
/*     trab(7,i)          -1: cylindrical transformation */
/*                         1: rectangular transformation */
/*     inotr(1,j)         transformation number applied to node j */
/*     inotr(2,j)         a SPC in a node j in which a transformation */
/*                        applied corresponds to a MPC. inotr(2,j) */
/*                        contains the number of a new node generated */
/*                        for the inhomogeneous part of the MPC */

/*     OUTPUT: */

/*     xload              concentrated load in direction idof of node */
/*                        "node" (global coordinates) */




/*     displacements vold and velocities veold are given in */
/*     the global system */

/*     example how to transform the velocity into the local system */
/*     defined in node "node" */

    /* Parameter adjustments */
    --time;
    --coords;
    --mi;
    veold_dim1 = mi[2] - 0 + 1;
    veold_offset = 0 + veold_dim1;
    veold -= veold_offset;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;
    trab -= 8;
    inotr -= 3;

    /* Function Body */
    if (*ntrans == 0) {
	itr = 0;
    } else {
	itr = inotr[(*node << 1) + 1];
    }

    if (itr != 0) {
	transformatrix_(&trab[itr * 7 + 1], &coords[1], a);
	ve1 = veold[*node * veold_dim1 + 1] * a[0] + veold[*node * veold_dim1 
		+ 2] * a[1] + veold[*node * veold_dim1 + 3] * a[2];
	ve2 = veold[*node * veold_dim1 + 1] * a[3] + veold[*node * veold_dim1 
		+ 2] * a[4] + veold[*node * veold_dim1 + 3] * a[5];
	ve3 = veold[*node * veold_dim1 + 1] * a[6] + veold[*node * veold_dim1 
		+ 2] * a[7] + veold[*node * veold_dim1 + 3] * a[8];

/*     suppose you know the size of the force in local coordinates: */
/*     f1, f2 and f3. Calculating the size of the force in */
/*     direction idof in global coordinates is done in the following */
/*     way: */

	*xload = f1 * a[*idof - 1] + f2 * a[*idof + 2] + f3 * a[*idof + 5];
    } else {

/*        no local system defined in node "node"; suppose the force in */
/*        global coordinates has components f1, f2 and f3 */

	if (*idof == 1) {
	    *xload = f1;
	} else if (*idof == 2) {
	    *xload = f2;
	} else if (*idof == 3) {
	    *xload = f3;
	}
    }

    return 0;
} /* cload_ */

