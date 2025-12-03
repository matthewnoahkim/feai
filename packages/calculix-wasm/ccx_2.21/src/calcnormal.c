/* calcnormal.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int calcnormal_(integer *nelem, integer *jface, char *lakon, 
	doublereal *co, doublereal *xn, integer *indexe, integer *kon, ftnlen 
	lakon_len)
{
    /* Initialized data */

    static integer ifaceq[48]	/* was [8][6] */ = { 4,3,2,1,11,10,9,12,5,6,7,
	    8,13,14,15,16,1,2,6,5,9,18,13,17,2,3,7,6,10,19,14,18,3,4,8,7,11,
	    20,15,19,4,1,5,8,12,17,16,20 };
    static doublereal xi4[4] = { 0.,1.,0.,-1. };
    static doublereal et4[4] = { -1.,0.,1.,0. };
    static integer ifacet[24]	/* was [6][4] */ = { 1,3,2,7,6,5,1,2,4,5,9,8,
	    2,3,4,6,10,9,1,4,3,8,10,7 };
    static integer ifacew1[20]	/* was [4][5] */ = { 1,3,2,0,4,5,6,0,1,2,5,4,
	    2,3,6,5,3,1,4,6 };
    static integer ifacew2[40]	/* was [8][5] */ = { 1,3,2,9,8,7,0,0,4,5,6,10,
	    11,12,0,0,1,2,5,4,7,14,10,13,2,3,6,5,8,15,11,14,3,1,4,6,9,13,12,
	    15 };
    static integer ifacequad[12]	/* was [3][4] */ = { 1,2,5,2,3,6,3,4,
	    7,4,1,8 };
    static integer ifacetria[9]	/* was [3][3] */ = { 1,2,4,2,3,5,3,1,6 };
    static integer iflag = 2;
    static doublereal xi3[3] = { .5,.5,0. };
    static doublereal et3[3] = { 0.,.5,.5 };

    /* System generated locals */
    integer i__1;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen);
    double sqrt(doublereal);

    /* Local variables */
    integer i__, j;
    extern /* Subroutine */ int shape3tri_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *)
	    , shape6tri_(doublereal *, doublereal *, doublereal *, doublereal 
	    *, doublereal *, doublereal *, integer *);
    doublereal dd, et, xd[3], xi, xl[24]	/* was [3][8] */, xs[21]	
	    /* was [3][7] */, xt[3], shp[56]	/* was [7][8] */;
    logical line, quad;
    integer nope, nface, nodef[8], nopes;
    extern /* Subroutine */ int shape3l_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, integer *), shape4q_(
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *), shape8q_(doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *);


/*     determine the local normal on face "jface" of element "nelem". */






/*     nodes per face for hex elements */

    /* Parameter adjustments */
    --kon;
    --xn;
    co -= 4;
    lakon -= 8;

    /* Function Body */

/*     nodes per face for tet elements */


/*     nodes per face for linear wedge elements */


/*     nodes per face for quadratic wedge elements */


/*     nodes per face for quad elements */


/*     nodes per face for tria elements */


/*     flag for shape functions */



/*     line=.true. means that the surface is reduced to a line, */
/*     i.e. it is a face of a plane stress, plane strain, */
/*     axisymmetric or shell element */
/*     initialization: */

    line = FALSE_;

/*     nodes: #nodes in the face */
/*     the nodes are stored in nodef(*) */

    if (*(unsigned char *)&lakon[(*nelem << 3) + 3] == '2') {
	nopes = 8;
	nface = 6;
    } else if (s_cmp(lakon + ((*nelem << 3) + 2), "D8", (ftnlen)2, (ftnlen)2) 
	    == 0) {
	nopes = 4;
	nface = 6;
    } else if (s_cmp(lakon + ((*nelem << 3) + 3), "10", (ftnlen)2, (ftnlen)2) 
	    == 0) {
	nopes = 6;
	nface = 4;
    } else if (s_cmp(lakon + ((*nelem << 3) + 2), "D4", (ftnlen)2, (ftnlen)2) 
	    == 0) {
	nopes = 3;
	nface = 4;
    } else if (s_cmp(lakon + ((*nelem << 3) + 3), "15", (ftnlen)2, (ftnlen)2) 
	    == 0) {
	if (*jface <= 2) {
	    nopes = 6;
	} else {
	    nopes = 8;
	}
	nface = 5;
	nope = 15;
    } else if (s_cmp(lakon + ((*nelem << 3) + 2), "D6", (ftnlen)2, (ftnlen)2) 
	    == 0) {
	if (*jface <= 2) {
	    nopes = 3;
	} else {
	    nopes = 4;
	}
	nface = 5;
	nope = 6;
    } else if (*(unsigned char *)&lakon[(*nelem << 3) + 1] == '8' || *(
	    unsigned char *)&lakon[(*nelem << 3) + 3] == '8') {

/*     8-node 2-D elements */

	nopes = 3;
	nface = 4;
	quad = TRUE_;
/*         if(lakon(nelem)(4:4).eq.'8') then */
	line = TRUE_;
	*jface += -2;
/*         endif */
    } else if (*(unsigned char *)&lakon[(*nelem << 3) + 1] == '6' || *(
	    unsigned char *)&lakon[(*nelem << 3) + 3] == '6') {

/*     6-node 2-D elements */

	nopes = 3;
	nface = 3;
/*         if(lakon(nelem)(4:4).eq.'6') then */
	line = TRUE_;
	*jface += -2;
/*         endif */
    } else if (*(unsigned char *)&lakon[(*nelem << 3) + 1] == '4' || *(
	    unsigned char *)&lakon[(*nelem << 3) + 3] == '4') {

/*     4-node 2-D elements */

	nopes = 2;
	nface = 4;
	quad = TRUE_;
/*         if(lakon(nelem)(4:4).eq.'4') then */
	line = TRUE_;
	*jface += -2;
/*         endif */
    } else if (*(unsigned char *)&lakon[(*nelem << 3) + 1] == '3' || *(
	    unsigned char *)&lakon[(*nelem << 3) + 3] == '3') {

/*     3-node 2-D elements */

	nopes = 2;
	nface = 3;
/*         if(lakon(nelem)(4:4).eq.'3') then */
	line = TRUE_;
	*jface += -2;
/*         endif */
    }

/*     determining the nodes of the face */

    if (nface == 3) {
	i__1 = nopes;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    nodef[i__ - 1] = kon[*indexe + ifacetria[i__ + *jface * 3 - 4]];
	}
    } else if (nface == 4) {
	if (quad) {
	    i__1 = nopes;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		nodef[i__ - 1] = kon[*indexe + ifacequad[i__ + *jface * 3 - 4]
			];
	    }
	} else {
	    i__1 = nopes;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		nodef[i__ - 1] = kon[*indexe + ifacet[i__ + *jface * 6 - 7]];
	    }
	}
    } else if (nface == 5) {
	if (nope == 6) {
	    i__1 = nopes;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		nodef[i__ - 1] = kon[*indexe + ifacew1[i__ + (*jface << 2) - 
			5]];
	    }
	} else if (nope == 15) {
	    i__1 = nopes;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		nodef[i__ - 1] = kon[*indexe + ifacew2[i__ + (*jface << 3) - 
			9]];
	    }
	}
    } else if (nface == 6) {
	i__1 = nopes;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    nodef[i__ - 1] = kon[*indexe + ifaceq[i__ + (*jface << 3) - 9]];
	}
    }

/*     storing the nodes in the face */

    i__1 = nopes;
    for (i__ = 1; i__ <= i__1; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    xl[j + i__ * 3 - 4] = co[j + nodef[i__ - 1] * 3];
	}
    }

    iflag = 2;
    if (nopes == 2) {

/*        side of a 3-node triangular or a 4-node */
/*        quadrilateral element */

	for (j = 1; j <= 3; ++j) {
	    xt[j - 1] = xl[j + 2] - xl[j - 1];
	}
	if (nface == 3) {
	    nope = 3;
	    i__1 = nope;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		for (j = 1; j <= 3; ++j) {
		    xl[j + i__ * 3 - 4] = co[j + kon[*indexe + i__] * 3];
		}
	    }
	    xi = xi3[*jface - 1];
	    et = et3[*jface - 1];
	    shape3tri_(&xi, &et, xl, xd, xs, shp, &iflag);
	} else if (nface == 4) {
	    nope = 4;
	    i__1 = nope;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		for (j = 1; j <= 3; ++j) {
		    xl[j + i__ * 3 - 4] = co[j + kon[*indexe + i__] * 3];
		}
	    }
	    xi = xi4[*jface - 1];
	    et = et4[*jface - 1];
	    shape4q_(&xi, &et, xl, xd, xs, shp, &iflag);
	}
	xn[1] = xt[1] * xd[2] - xt[2] * xd[1];
	xn[2] = xt[2] * xd[0] - xt[0] * xd[2];
	xn[3] = xt[0] * xd[1] - xt[1] * xd[0];
    } else if (nopes == 3) {

/*        side of a 6-node triangular element (2D) or a */
/*        8-node quadrilateral element (2D) or a */
/*        4-node tetrahedral element (3D) */

	if (line) {
	    xi = 0.;
	    shape3l_(&xi, xl, xt, xs, shp, &iflag);
	    if (nface == 3) {
		nope = 6;
		i__1 = nope;
		for (i__ = 1; i__ <= i__1; ++i__) {
		    for (j = 1; j <= 3; ++j) {
			xl[j + i__ * 3 - 4] = co[j + kon[*indexe + i__] * 3];
		    }
		}
		xi = xi3[*jface - 1];
		et = et3[*jface - 1];
		shape6tri_(&xi, &et, xl, xd, xs, shp, &iflag);
	    } else if (nface == 4) {
		nope = 8;
		i__1 = nope;
		for (i__ = 1; i__ <= i__1; ++i__) {
		    for (j = 1; j <= 3; ++j) {
			xl[j + i__ * 3 - 4] = co[j + kon[*indexe + i__] * 3];
		    }
		}
		xi = xi4[*jface - 1];
		et = et4[*jface - 1];
		shape8q_(&xi, &et, xl, xd, xs, shp, &iflag);
	    }
	    xn[1] = xt[1] * xd[2] - xt[2] * xd[1];
	    xn[2] = xt[2] * xd[0] - xt[0] * xd[2];
	    xn[3] = xt[0] * xd[1] - xt[1] * xd[0];
	} else {
	    xi = 0.;
	    et = 0.;
	    shape3tri_(&xi, &et, xl, &xn[1], xs, shp, &iflag);
	}
    } else if (nopes == 4) {

/*        side of a 8-node hex element */

	xi = 0.;
	et = 0.;
	shape4q_(&xi, &et, xl, &xn[1], xs, shp, &iflag);
    } else if (nopes == 6) {

/*        side of a 10-node tet element */

	xi = .33333333333333331;
	et = .33333333333333331;
	shape6tri_(&xi, &et, xl, &xn[1], xs, shp, &iflag);
    } else if (nopes == 8) {
	xi = 0.;
	et = 0.;
	shape8q_(&xi, &et, xl, &xn[1], xs, shp, &iflag);
    }

/*     normalizing */

    dd = sqrt(xn[1] * xn[1] + xn[2] * xn[2] + xn[3] * xn[3]);
    for (i__ = 1; i__ <= 3; ++i__) {
	xn[i__] /= dd;
    }

    return 0;
} /* calcnormal_ */

