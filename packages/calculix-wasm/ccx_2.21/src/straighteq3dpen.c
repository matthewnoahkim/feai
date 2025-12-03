/* straighteq3dpen.f -- translated by f2c (version 20200916).
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
/*              Copyright (C) 1998 Guido Dhondt */

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

/* Subroutine */ int straighteq3dpen_(doublereal *col, doublereal *straight, 
	doublereal *xnor, integer *noeq)
{
    /* Builtin functions */
    double sqrt(doublereal);

    /* Local variables */
    integer i__;
    doublereal dd, p12[3], p31[3], p23[3], dd12, dd31, dd23, xp12[3], xp31[3],
	     xp23[3], xq12[3], xq23[3], xq31[3], dxp, dxq, scal1, scal2, 
	    edgenor[9]	/* was [3][3] */;


/*     calculate the equation of the planes through the */
/*     edges of a triangle and perpendicular to the representative */
/*     normal of each triangle edge together */
/*     with the plane of the triangle itself with */
/*     (col(1,1),col(2,1),col(3,1)),(col(1,2),col(2,2),col(3,2)), */
/*     (col(1,3),col(2,3),col(3,3)) */
/*     as vertices (nodet(1),nodet(2),nodet(3)). */
/*     The equation of the plane through the edge */
/*     opposite nodet(1) is of the form */
/*     straight(1)*x+straight(2)*y+straight(3)*z+straight(4)=0, such that the */
/*     vector (straight(1),straight(2),straight(3)) points outwards; */
/*     for the edge opposite of nodet(2) the equation is */
/*     straight(5)*x+straight(6)*y+straight(7)*z+straight(8)=0 and for the edge */
/*     oppositie of nodet(3) it is */
/*     straight(9)*x+straight(10)*y+straight(11)*z+straight(12)=0. */
/*     Here too, the normals */
/*     (straight(5),straight(6),straight(7)) and */
/*     (straight(9),straight(10),straight(11)) point */
/*     outwards of the triangle. The equation of the triangle plane is */
/*     straight(13)*x+straight(14)*y+straight(15)*z+straight(16)=0 such */
/*     that the triangle is numbered clockwise when looking in the */
/*     direction of vector (straight(13),straight(14),straight(15)). */
/*     edgenor(*,1) is the representative normal for the triangle edge going */
/*     through the nodes 2-3, edgenor(*,2) for the edge 3-1 and */
/*     edgenor(*,3) for the edge 1-2 */

/*     noeq is the triangle nodes for which the opposite side should not get */
/*     an equation (all coefficients zero; this is needed for plane strain, */
/*     plane stress and axisymmetric elements */




/*     sides of the triangle */

    /* Parameter adjustments */
    xnor -= 4;
    --straight;
    col -= 4;

    /* Function Body */
    for (i__ = 1; i__ <= 3; ++i__) {
	p12[i__ - 1] = col[i__ + 6] - col[i__ + 3];
	p23[i__ - 1] = col[i__ + 9] - col[i__ + 6];
	p31[i__ - 1] = col[i__ + 3] - col[i__ + 9];
    }
    dd12 = p12[0] * p12[0] + p12[1] * p12[1] + p12[2] * p12[2];
    dd23 = p23[0] * p23[0] + p23[1] * p23[1] + p23[2] * p23[2];
    dd31 = p31[0] * p31[0] + p31[1] * p31[1] + p31[2] * p31[2];

/*     calculating the representative normal for each triangle edge */
/*     edgenor(*,1) for p23 | edgenor(*,2) for p31 | edgenor(*,3) for p12 */

    scal1 = (xnor[7] * p23[0] + xnor[8] * p23[1] + xnor[9] * p23[2]) / dd23;
    scal2 = (xnor[10] * p23[0] + xnor[11] * p23[1] + xnor[12] * p23[2]) / 
	    dd23;
    for (i__ = 1; i__ <= 3; ++i__) {
	xp23[i__ - 1] = xnor[i__ + 6] - scal1 * p23[i__ - 1];
	xq23[i__ - 1] = xnor[i__ + 9] - scal2 * p23[i__ - 1];
    }
    dxp = sqrt(xp23[0] * xp23[0] + xp23[1] * xp23[1] + xp23[2] * xp23[2]);
    dxq = sqrt(xq23[0] * xq23[0] + xq23[1] * xq23[1] + xq23[2] * xq23[2]);
    for (i__ = 1; i__ <= 3; ++i__) {
	xp23[i__ - 1] /= dxp;
	xq23[i__ - 1] /= dxq;
    }

    scal1 = (xnor[10] * p31[0] + xnor[11] * p31[1] + xnor[12] * p31[2]) / 
	    dd31;
    scal2 = (xnor[4] * p31[0] + xnor[5] * p31[1] + xnor[6] * p31[2]) / dd31;
    for (i__ = 1; i__ <= 3; ++i__) {
	xp31[i__ - 1] = xnor[i__ + 9] - scal1 * p31[i__ - 1];
	xq31[i__ - 1] = xnor[i__ + 3] - scal2 * p31[i__ - 1];
    }
    dxp = sqrt(xp31[0] * xp31[0] + xp31[1] * xp31[1] + xp31[2] * xp31[2]);
    dxq = sqrt(xq31[0] * xq31[0] + xq31[1] * xq31[1] + xq31[2] * xq31[2]);
    for (i__ = 1; i__ <= 3; ++i__) {
	xp31[i__ - 1] /= dxp;
	xq31[i__ - 1] /= dxq;
    }

    scal1 = (xnor[4] * p12[0] + xnor[5] * p12[1] + xnor[6] * p12[2]) / dd12;
    scal2 = (xnor[7] * p12[0] + xnor[8] * p12[1] + xnor[9] * p12[2]) / dd12;
    for (i__ = 1; i__ <= 3; ++i__) {
	xp12[i__ - 1] = xnor[i__ + 3] - scal1 * p12[i__ - 1];
	xq12[i__ - 1] = xnor[i__ + 6] - scal2 * p12[i__ - 1];
    }
    dxp = sqrt(xp12[0] * xp12[0] + xp12[1] * xp12[1] + xp12[2] * xp12[2]);
    dxq = sqrt(xq12[0] * xq12[0] + xq12[1] * xq12[1] + xq12[2] * xq12[2]);
    for (i__ = 1; i__ <= 3; ++i__) {
	xp12[i__ - 1] /= dxp;
	xq12[i__ - 1] /= dxq;
    }

    for (i__ = 1; i__ <= 3; ++i__) {
	edgenor[i__ - 1] = xp23[i__ - 1] + xq23[i__ - 1];
	edgenor[i__ + 2] = xp31[i__ - 1] + xq31[i__ - 1];
	edgenor[i__ + 5] = xp12[i__ - 1] + xq12[i__ - 1];
    }

/*     normalized vector normal to each side of the triangle */

    dd = sqrt(edgenor[0] * edgenor[0] + edgenor[1] * edgenor[1] + edgenor[2] *
	     edgenor[2]);
    for (i__ = 1; i__ <= 3; ++i__) {
	edgenor[i__ - 1] /= dd;
    }
    dd = sqrt(edgenor[3] * edgenor[3] + edgenor[4] * edgenor[4] + edgenor[5] *
	     edgenor[5]);
    for (i__ = 1; i__ <= 3; ++i__) {
	edgenor[i__ + 2] /= dd;
    }
    dd = sqrt(edgenor[6] * edgenor[6] + edgenor[7] * edgenor[7] + edgenor[8] *
	     edgenor[8]);
    for (i__ = 1; i__ <= 3; ++i__) {
	edgenor[i__ + 5] /= dd;
    }

/*     normalized vector normal to the triangle: xn = p12 x p23 */

    straight[13] = p12[1] * p23[2] - p12[2] * p23[1];
    straight[14] = p12[2] * p23[0] - p12[0] * p23[2];
    straight[15] = p12[0] * p23[1] - p12[1] * p23[0];
    dd = sqrt(straight[13] * straight[13] + straight[14] * straight[14] + 
	    straight[15] * straight[15]);
    for (i__ = 13; i__ <= 15; ++i__) {
	straight[i__] /= dd;
    }

/*     p12 x edgenor(*,3) */

    if (*noeq != 3) {
	straight[9] = p12[1] * edgenor[8] - p12[2] * edgenor[7];
	straight[10] = p12[2] * edgenor[6] - p12[0] * edgenor[8];
	straight[11] = p12[0] * edgenor[7] - p12[1] * edgenor[6];
	dd = sqrt(straight[9] * straight[9] + straight[10] * straight[10] + 
		straight[11] * straight[11]);
	for (i__ = 9; i__ <= 11; ++i__) {
	    straight[i__] /= dd;
	}
    } else {
	for (i__ = 9; i__ <= 11; ++i__) {
	    straight[i__] = 0.;
	}
    }

/*     p23 x edgenor(*,1) */

    if (*noeq != 1) {
	straight[1] = p23[1] * edgenor[2] - p23[2] * edgenor[1];
	straight[2] = p23[2] * edgenor[0] - p23[0] * edgenor[2];
	straight[3] = p23[0] * edgenor[1] - p23[1] * edgenor[0];
	dd = sqrt(straight[1] * straight[1] + straight[2] * straight[2] + 
		straight[3] * straight[3]);
	for (i__ = 1; i__ <= 3; ++i__) {
	    straight[i__] /= dd;
	}
    } else {
	for (i__ = 1; i__ <= 3; ++i__) {
	    straight[i__] = 0.;
	}
    }

/*     p31 x edgenor(*,2) */

    if (*noeq != 2) {
	straight[5] = p31[1] * edgenor[5] - p31[2] * edgenor[4];
	straight[6] = p31[2] * edgenor[3] - p31[0] * edgenor[5];
	straight[7] = p31[0] * edgenor[4] - p31[1] * edgenor[3];
	dd = sqrt(straight[5] * straight[5] + straight[6] * straight[6] + 
		straight[7] * straight[7]);
	for (i__ = 5; i__ <= 7; ++i__) {
	    straight[i__] /= dd;
	}
    } else {
	for (i__ = 5; i__ <= 7; ++i__) {
	    straight[i__] = 0.;
	}
    }

/*     determining the inhomogeneous terms */

    straight[12] = -straight[9] * col[4] - straight[10] * col[5] - straight[
	    11] * col[6];
    straight[4] = -straight[1] * col[7] - straight[2] * col[8] - straight[3] *
	     col[9];
    straight[8] = -straight[5] * col[10] - straight[6] * col[11] - straight[7]
	     * col[12];
    straight[16] = -straight[13] * col[4] - straight[14] * col[5] - straight[
	    15] * col[6];

    return 0;
} /* straighteq3dpen_ */

