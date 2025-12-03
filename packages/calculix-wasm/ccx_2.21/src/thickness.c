/* thickness.f -- translated by f2c (version 20200916).
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

/* Table of constant values */

static integer c__1 = 1;
static integer c__9 = 9;
static integer c__3 = 3;


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

/* Subroutine */ int thickness_(integer *nodedesiboun, integer *ndesiboun, 
	char *objectset, doublereal *xo, doublereal *yo, doublereal *zo, 
	doublereal *x, doublereal *y, doublereal *z__, integer *nx, integer *
	ny, integer *nz, doublereal *co, integer *ifree, integer *ndesia, 
	integer *ndesib, integer *iobject, doublereal *dgdxglob, integer *nk, 
	doublereal *extnor, doublereal *g0, doublereal *coini, ftnlen 
	objectset_len)
{
    /* System generated locals */
    integer dgdxglob_dim2, dgdxglob_offset, i__1;
    doublereal d__1, d__2, d__3;
    icilist ici__1;

    /* Builtin functions */
    integer s_rsfi(icilist *), do_fio(integer *, char *, ftnlen), e_rsfi(void)
	    ;
    double sqrt(doublereal);
    integer s_cmp(char *, char *, ftnlen, ftnlen), s_wsle(cilist *), do_lio(
	    integer *, integer *, char *, ftnlen), e_wsle(void);

    /* Local variables */
    integer iactnode, irefnode, neighbor[10], j;
    doublereal inivector[3], bound, xdesi, ydesi, zdesi;
    integer istat;
    extern /* Subroutine */ int near3d_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     integer *, integer *, doublereal *, doublereal *, doublereal *, 
	    integer *, integer *, integer *);
    doublereal scalar, deltax, deltay, deltaz;
    integer nnodes;
    doublereal actdist;

    /* Fortran I/O blocks */
    static cilist io___17 = { 0, 6, 0, 0, 0 };
    static cilist io___18 = { 0, 6, 0, 0, 0 };
    static cilist io___19 = { 0, 6, 0, 0, 0 };
    static cilist io___20 = { 0, 6, 0, 0, 0 };


/* ! */
/*     calcualtion of the actual wall thickness */





    /* Parameter adjustments */
    --nodedesiboun;
    objectset -= 486;
    --xo;
    --yo;
    --zo;
    --x;
    --y;
    --z__;
    --nx;
    --ny;
    --nz;
    co -= 4;
    dgdxglob_dim2 = *nk;
    dgdxglob_offset = 1 + 2 * (1 + dgdxglob_dim2);
    dgdxglob -= dgdxglob_offset;
    extnor -= 4;
    --g0;
    coini -= 4;

    /* Function Body */
    ici__1.icierr = 1;
    ici__1.iciend = 1;
    ici__1.icirnum = 1;
    ici__1.icirlen = 20;
    ici__1.iciunit = objectset + ((*iobject * 5 + 1) * 81 + 60);
    ici__1.icifmt = "(f20.0)";
    istat = s_rsfi(&ici__1);
    if (istat != 0) {
	goto L100001;
    }
    istat = do_fio(&c__1, (char *)&bound, (ftnlen)sizeof(doublereal));
    if (istat != 0) {
	goto L100001;
    }
    istat = e_rsfi();
L100001:

/*     MAXMEMBERSIZE is related to a LE constraint: */
/*     actdist<=bound --> actdist-bound<=0 */
/*     MINMEMBERSIZE is related to a GE constraint: */
/*     actdist>=bound --> bound-actdist<=0 */

    nnodes = 1;
    i__1 = *ndesib;
    for (j = *ndesia; j <= i__1; ++j) {

	iactnode = nodedesiboun[j];
	xdesi = co[iactnode * 3 + 1];
	ydesi = co[iactnode * 3 + 2];
	zdesi = co[iactnode * 3 + 3];

	near3d_(&xo[1], &yo[1], &zo[1], &x[1], &y[1], &z__[1], &nx[1], &ny[1],
		 &nz[1], &xdesi, &ydesi, &zdesi, ifree, neighbor, &nnodes);

/*       Calculate the vector between the design variable */
/*       and the closest node from the reference node set */

	irefnode = neighbor[0];
	deltax = xo[irefnode] - xdesi;
	deltay = yo[irefnode] - ydesi;
	deltaz = zo[irefnode] - zdesi;

/*       check if node lies in negativ normal direction w.r.t. the */
/*       design variable */
/*       --> simplified check that node lies on other side of the volume */

	scalar = deltax * extnor[iactnode * 3 + 1] + deltay * extnor[iactnode 
		* 3 + 2] + deltaz * extnor[iactnode * 3 + 3];

	if (scalar < 0.) {

/*          calculated distance */

/* Computing 2nd power */
	    d__1 = deltax;
/* Computing 2nd power */
	    d__2 = deltay;
/* Computing 2nd power */
	    d__3 = deltaz;
	    actdist = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);
	    dgdxglob[(iactnode + *iobject * dgdxglob_dim2 << 1) + 1] = 
		    actdist;

/*          calculate the function value of the objective function */

	    if (s_cmp(objectset + (*iobject * 5 + 1) * 81, "MINMEMBERSIZE", (
		    ftnlen)13, (ftnlen)13) == 0) {
		dgdxglob[(iactnode + *iobject * dgdxglob_dim2 << 1) + 2] = 
			bound - actdist;
	    } else if (s_cmp(objectset + (*iobject * 5 + 1) * 81, "MAXMEMBER"
		    "SIZE", (ftnlen)13, (ftnlen)13) == 0) {
		dgdxglob[(iactnode + *iobject * dgdxglob_dim2 << 1) + 2] = 
			actdist - bound;
	    }

/*          Calculate the normalized objective function and check if vectors */
/*          of actual and inital design variable position still point in the */
/*          same direction --> measure that both points lie on the same side */
/*          of the bound verifiying that the bound has not been crossed */
/*          (only relevant for minmembersize) */

	    if (s_cmp(objectset + (*iobject * 5 + 1) * 81, "MINMEMBERSIZE", (
		    ftnlen)13, (ftnlen)13) == 0) {

		inivector[0] = xo[irefnode] - coini[iactnode * 3 + 1];
		inivector[1] = yo[irefnode] - coini[iactnode * 3 + 2];
		inivector[2] = zo[irefnode] - coini[iactnode * 3 + 3];
		scalar = deltax * inivector[0] + deltay * inivector[1] + 
			deltaz * inivector[2];
		if (scalar < 0. && dgdxglob[(iactnode + *iobject * 
			dgdxglob_dim2 << 1) + 2] > 0.) {
		    dgdxglob[(iactnode + *iobject * dgdxglob_dim2 << 1) + 2] =
			     -dgdxglob[(iactnode + *iobject * dgdxglob_dim2 <<
			     1) + 2];
		}
	    }
	} else {
	    s_wsle(&io___17);
	    do_lio(&c__9, &c__1, "*WARNING no reference node found in negati"
		    "ve", (ftnlen)44);
	    e_wsle();
	    s_wsle(&io___18);
	    do_lio(&c__9, &c__1, "         normal direction for node ", (
		    ftnlen)35);
	    do_lio(&c__3, &c__1, (char *)&iactnode, (ftnlen)sizeof(integer));
	    e_wsle();
	    s_wsle(&io___19);
	    do_lio(&c__9, &c__1, "         node ", (ftnlen)14);
	    do_lio(&c__3, &c__1, (char *)&iactnode, (ftnlen)sizeof(integer));
	    do_lio(&c__9, &c__1, "ignored for", (ftnlen)11);
	    e_wsle();
	    s_wsle(&io___20);
	    do_lio(&c__9, &c__1, "         MEMBERSIZE constraint", (ftnlen)30)
		    ;
	    e_wsle();
	    dgdxglob[(iactnode + *iobject * dgdxglob_dim2 << 1) + 1] = -1.f;
	}

/*       count number of active nodes */

	if (dgdxglob[(iactnode + *iobject * dgdxglob_dim2 << 1) + 2] >= 0.) {
	    g0[*iobject] += 1.;
	}

    }

    return 0;
} /* thickness_ */

