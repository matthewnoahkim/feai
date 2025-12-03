/* createlocalsys.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int createlocalsys_(integer *nnfront, integer *istartfront, 
	integer *iendfront, integer *ifront, doublereal *co, doublereal *xt, 
	doublereal *xn, doublereal *xa, integer *nfront, integer *ifrontrel, 
	doublereal *stress, integer *iedno, integer *ibounedg, integer *ieled,
	 integer *kontri, integer *isubsurffront, integer *istartcrackfro, 
	integer *iendcrackfro, integer *ncrack, doublereal *angle, integer *
	nstep, integer *ier)
{
    /* System generated locals */
    integer stress_dim2, stress_offset, i__1, i__2;
    doublereal d__1, d__2;

    /* Builtin functions */
    double atan(doublereal), sqrt(doublereal), acos(doublereal);

    /* Local variables */
    integer iedgerel, nodelast, nodenext, i__, j, k, j1, j2, n1, n2, n3;
    doublereal dd, p12[3], p23[3], pi, xn1[3], xn2[3], det;
    integer node;
    doublereal xnor[3];
    integer iedge, ielem;
    doublereal xtj2m1[3];
    integer noderel;


/*     creating a local coordinate system at the crack front */




    /* Parameter adjustments */
    --istartfront;
    --iendfront;
    --ifront;
    co -= 4;
    xt -= 4;
    xn -= 4;
    xa -= 4;
    --ifrontrel;
    iedno -= 3;
    --ibounedg;
    ieled -= 3;
    kontri -= 4;
    --isubsurffront;
    --istartcrackfro;
    --iendcrackfro;
    --angle;
    stress_dim2 = *nstep;
    stress_offset = 1 + 6 * (1 + stress_dim2);
    stress -= stress_offset;

    /* Function Body */
    pi = atan(1.) * 4.;

    i__1 = *nnfront;
    for (i__ = 1; i__ <= i__1; ++i__) {
	j1 = istartfront[i__];
	j2 = iendfront[i__];

/*     calculate the tangent vector t */
/*     at the end nodes: tangent to the adjacent front edge */
/*     in all other nodes: mean of the tangent to the adjacent front edges */

	i__2 = j2;
	for (j = j1; j <= i__2; ++j) {
	    node = ifront[j];
	    if (j < j2) {
		nodenext = ifront[j + 1];
		for (k = 1; k <= 3; ++k) {
		    xt[k + j * 3] = co[k + nodenext * 3] - co[k + node * 3];
		}
	    } else if (j == j2) {
		if (isubsurffront[i__] == 1) {
		    nodenext = ifront[j1];
		    for (k = 1; k <= 3; ++k) {
			xt[k + j * 3] = co[k + nodenext * 3] - co[k + node * 
				3];
		    }
		} else {
		    nodelast = ifront[j - 1];
		    for (k = 1; k <= 3; ++k) {
			xt[k + j * 3] = co[k + node * 3] - co[k + nodelast * 
				3];
		    }
		}
	    }

/*     normalizing */

	    dd = sqrt(xt[j * 3 + 1] * xt[j * 3 + 1] + xt[j * 3 + 2] * xt[j * 
		    3 + 2] + xt[j * 3 + 3] * xt[j * 3 + 3]);
	    for (k = 1; k <= 3; ++k) {
		xt[k + j * 3] /= dd;
	    }
	}

/*     taking the mean and normalizing (due to normalizing the factor of */
/*     2 is not important) */

	if (isubsurffront[i__] == 1) {
	    for (k = 1; k <= 3; ++k) {
		xtj2m1[k - 1] = xt[k + (j2 - 1) * 3];
	    }
	}

	i__2 = j1 + 1;
	for (j = j2 - 1; j >= i__2; --j) {
	    for (k = 1; k <= 3; ++k) {
		xt[k + j * 3] = xt[k + (j - 1) * 3] + xt[k + j * 3];
	    }
	    dd = sqrt(xt[j * 3 + 1] * xt[j * 3 + 1] + xt[j * 3 + 2] * xt[j * 
		    3 + 2] + xt[j * 3 + 3] * xt[j * 3 + 3]);
	    for (k = 1; k <= 3; ++k) {
		xt[k + j * 3] /= dd;
	    }
	}

/*     for subsurface cracks: adjust the tangent at the starting and */
/*     end node */

	if (isubsurffront[i__] == 1) {
	    for (k = 1; k <= 3; ++k) {
		xt[k + j1 * 3] += xt[k + j2 * 3];
	    }
	    dd = sqrt(xt[j1 * 3 + 1] * xt[j1 * 3 + 1] + xt[j1 * 3 + 2] * xt[
		    j1 * 3 + 2] + xt[j1 * 3 + 3] * xt[j1 * 3 + 3]);
	    for (k = 1; k <= 3; ++k) {
		xt[k + j1 * 3] /= dd;
	    }
	    for (k = 1; k <= 3; ++k) {
		xt[k + j2 * 3] += xtj2m1[k - 1];
	    }
	    dd = sqrt(xt[j2 * 3 + 1] * xt[j2 * 3 + 1] + xt[j2 * 3 + 2] * xt[
		    j2 * 3 + 2] + xt[j2 * 3 + 3] * xt[j2 * 3 + 3]);
	    for (k = 1; k <= 3; ++k) {
		xt[k + j2 * 3] /= dd;
	    }
	} else {

/*     for surface cracks: calculate the angle between the tangents */
/*     at the crossing points of the crack fronts with the free */
/*     surface; can be used to determine an appropriate shape factor */
/*     in shapefactor.f */

	    angle[i__] = xt[j1 * 3 + 1] * xt[j2 * 3 + 1] + xt[j1 * 3 + 2] * 
		    xt[j2 * 3 + 2] + xt[j1 * 3 + 3] * xt[j2 * 3 + 3];
/* Computing MIN */
/* Computing MAX */
	    d__2 = angle[i__];
	    d__1 = max(d__2,-1.);
	    angle[i__] = min(d__1,1.);
	    angle[i__] = acos(angle[i__]);
	}
    }

/*     creating a local system based on */
/*     - the tangential vector t */
/*     - the normal vector on the adjacent triangles of the crack mesh */
/*     - a = t x n */
/*     the direction of n corresponds according to the corkscrew rule */
/*     with the node numbering of the crack elements */

    i__1 = *ncrack;
    for (i__ = 1; i__ <= i__1; ++i__) {
	i__2 = iendcrackfro[i__];
	for (j = istartcrackfro[i__]; j <= i__2; ++j) {

/*     normal on the triangle belonging to the one adjacent edge */

	    noderel = ifrontrel[j];
	    iedgerel = iedno[(noderel << 1) + 1];
	    iedge = ibounedg[iedgerel];
	    ielem = ieled[(iedge << 1) + 1];

	    n1 = kontri[ielem * 3 + 1];
	    n2 = kontri[ielem * 3 + 2];
	    n3 = kontri[ielem * 3 + 3];
	    for (k = 1; k <= 3; ++k) {
		p12[k - 1] = co[k + n2 * 3] - co[k + n1 * 3];
		p23[k - 1] = co[k + n3 * 3] - co[k + n2 * 3];
	    }
	    xn1[0] = p12[1] * p23[2] - p12[2] * p23[1];
	    xn1[1] = p12[2] * p23[0] - p12[0] * p23[2];
	    xn1[2] = p12[0] * p23[1] - p12[1] * p23[0];

/*     normal on the triangle belonging to the other adjacent edge */

	    iedgerel = iedno[(noderel << 1) + 2];
	    iedge = ibounedg[iedgerel];
	    ielem = ieled[(iedge << 1) + 1];

	    n1 = kontri[ielem * 3 + 1];
	    n2 = kontri[ielem * 3 + 2];
	    n3 = kontri[ielem * 3 + 3];
	    for (k = 1; k <= 3; ++k) {
		p12[k - 1] = co[k + n2 * 3] - co[k + n1 * 3];
		p23[k - 1] = co[k + n3 * 3] - co[k + n2 * 3];
	    }
	    xn2[0] = p12[1] * p23[2] - p12[2] * p23[1];
	    xn2[1] = p12[2] * p23[0] - p12[0] * p23[2];
	    xn2[2] = p12[0] * p23[1] - p12[1] * p23[0];

/*     taking the mean (factor of 2 is not important due to */
/*     subsequent normalization) */

	    for (k = 1; k <= 3; ++k) {
		xn[k + j * 3] = xn1[k - 1] + xn2[k - 1];
	    }

/*     projection on a plane orthogonal to the local tangent vector */
/*     xm.xt=0 must apply */

	    dd = xn[j * 3 + 1] * xt[j * 3 + 1] + xn[j * 3 + 2] * xt[j * 3 + 2]
		     + xn[j * 3 + 3] * xt[j * 3 + 3];
	    for (k = 1; k <= 3; ++k) {
		xn[k + j * 3] -= dd * xt[k + j * 3];
	    }

/*     normalizing vector xm */

	    dd = sqrt(xn[j * 3 + 1] * xn[j * 3 + 1] + xn[j * 3 + 2] * xn[j * 
		    3 + 2] + xn[j * 3 + 3] * xn[j * 3 + 3]);
	    for (k = 1; k <= 3; ++k) {
		xn[k + j * 3] /= dd;
	    }

/*     propagation direction a=t x n */

	    xa[j * 3 + 1] = xt[j * 3 + 2] * xn[j * 3 + 3] - xt[j * 3 + 3] * 
		    xn[j * 3 + 2];
	    xa[j * 3 + 2] = xt[j * 3 + 3] * xn[j * 3 + 1] - xt[j * 3 + 1] * 
		    xn[j * 3 + 3];
	    xa[j * 3 + 3] = xt[j * 3 + 1] * xn[j * 3 + 2] - xt[j * 3 + 2] * 
		    xn[j * 3 + 1];
	}
    }

/*     calculate a fictituous opening angle for each crack front */

    i__1 = *nnfront;
    for (i__ = 1; i__ <= i__1; ++i__) {
	j1 = istartfront[i__];
	j2 = iendfront[i__];

	if (isubsurffront[i__] != 1) {

/*     for surface cracks: calculate the angle between the tangents */
/*     at the crossing points of the crack fronts with the free */
/*     surface; can be used to determine an appropriate shape factor */
/*     in shapefactor.f */

	    angle[i__] = xt[j1 * 3 + 1] * xt[j2 * 3 + 1] + xt[j1 * 3 + 2] * 
		    xt[j2 * 3 + 2] + xt[j1 * 3 + 3] * xt[j2 * 3 + 3];
/* Computing MIN */
/* Computing MAX */
	    d__2 = angle[i__];
	    d__1 = max(d__2,-1.);
	    angle[i__] = min(d__1,1.);

/*     if cos(angle(i))<0, i.e. pi/2 < angle(i) < 3*pi/2, a */
/*     check is performed whether angle(i) > pi or */
/*     angle (i) < pi */
/*     (the cosine of alpha and (2*pi-alpha) is the same) */

	    if (angle[i__] >= 0.) {
		angle[i__] = acos(angle[i__]);
	    } else {
		angle[i__] = acos(angle[i__]);

/*     mean normal on the front */

		for (j = 1; j <= 3; ++j) {
		    xnor[j - 1] = xn[j + j1 * 3] + xn[j + j2 * 3];
		}

/*     check whether angle(i) is less than or greater than pi */
/*     (the cosine of alpha and (2*pi-alpha) is the same */

		det = xnor[0] * (xt[j1 * 3 + 2] * xt[j2 * 3 + 3] - xt[j1 * 3 
			+ 3] * xt[j2 * 3 + 2]) + xnor[1] * (xt[j1 * 3 + 3] * 
			xt[j2 * 3 + 1] - xt[j1 * 3 + 1] * xt[j2 * 3 + 3]) + 
			xnor[2] * (xt[j1 * 3 + 1] * xt[j2 * 3 + 2] - xt[j1 * 
			3 + 2] * xt[j2 * 3 + 1]);
		if (det < 0.) {
		    angle[i__] = pi * 2. - angle[i__];
		}
	    }

	}
    }

/*     do i=1,nfront */
/*     write(*,*) 'createlocalsys xt' */
/*     write(*,*) 'xt ',i,xt(1,i),xt(2,i),xt(3,i) */
/*     enddo */
/*     do i=1,nfront */
/*     write(*,*) 'createlocalsys xn' */
/*     write(*,*) 'xn ',i,xn(1,i),xn(2,i),xn(3,i) */
/*     enddo */
/*     do i=1,nfront */
/*     write(*,*) 'createlocalsys xa' */
/*     write(*,*) 'xa ',i,xa(1,i),xa(2,i),xa(3,i) */
/*     enddo */
/*     write(*,*) */

    return 0;
} /* createlocalsys_ */

