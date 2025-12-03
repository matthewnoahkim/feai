/* distattach_3d.f -- translated by f2c (version 20200916).
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

static integer c__9 = 9;
static integer c__1 = 1;
static integer c__3 = 3;
static integer c__201 = 201;


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

/* Subroutine */ int distattach_3d__(doublereal *xig, doublereal *etg, 
	doublereal *zeg, doublereal *pneigh, doublereal *pnode, doublereal *a,
	 doublereal *p, doublereal *ratio, integer *nterms)
{
    /* System generated locals */
    integer i__1;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    integer i__, j, n;
    doublereal al, et, dx[3], ze, xi, omg, omh, opg, oph, omr, opr;
    extern /* Subroutine */ int insertsortd_(doublereal *, integer *), exit_(
	    integer *);
    doublereal dummy, omgopg, omhoph, omropr, omgmopg, omhmoph, tmgmhmr, 
	    tmgmhpr, tmgphmr, tpgmhmr, tmgphpr, tpgmhpr, tpgphmr, tpgphpr, 
	    omrmopr;

    /* Fortran I/O blocks */
    static cilist io___28 = { 0, 6, 0, 0, 0 };
    static cilist io___29 = { 0, 6, 0, 0, 0 };



/*     calculates the distance between the node with coordinates */
/*     in "pnode" and the node with local coordinates xig and etg */
/*     in a face described by "nterms" nodes with coordinates */
/*     in pneigh */




    /* Parameter adjustments */
    --ratio;
    --p;
    --pnode;
    pneigh -= 4;

    /* Function Body */
    n = 3;

    if (*nterms == 4) {
	xi = (*xig + 1.) / 2.;
	et = (*etg + 1.) / 2.;
	ze = (*zeg + 1.) / 2.;
	dx[0] = xi;
	dx[1] = et;
	dx[2] = ze;
	insertsortd_(dx, &n);
/*         call dsort(dx,iy,n,kflag) */
	if (dx[2] > 1e-30) {
	    al = dx[2] / (xi + et + ze);
	    xi = al * xi;
	    et = al * et;
	    ze = al * ze;
	}

/*        shape functions */

	ratio[1] = 1. - xi - et - ze;
	ratio[2] = xi;
	ratio[3] = et;
	ratio[4] = ze;
    } else if (*nterms == 6) {
	xi = (*xig + 1.) / 2.;
	et = (*etg + 1.) / 2.;
	if (xi + et > 1.) {
	    dummy = xi;
	    xi = 1. - et;
	    et = 1. - dummy;
	}

	ze = *zeg;
	*a = 1. - xi - et;

/*     shape functions */

	ratio[1] = *a * .5 * (1. - ze);
	ratio[2] = xi * .5 * (1. - ze);
	ratio[3] = et * .5 * (1. - ze);
	ratio[4] = *a * .5 * (ze + 1.);
	ratio[5] = xi * .5 * (ze + 1.);
	ratio[6] = et * .5 * (ze + 1.);
    } else if (*nterms == 8) {
	xi = *xig;
	et = *etg;
	ze = *zeg;

	omg = 1. - xi;
	omh = 1. - et;
	omr = 1. - ze;
	opg = xi + 1.;
	oph = et + 1.;
	opr = ze + 1.;

/*        shape functions */

	ratio[1] = omg * omh * omr / 8.;
	ratio[2] = opg * omh * omr / 8.;
	ratio[3] = opg * oph * omr / 8.;
	ratio[4] = omg * oph * omr / 8.;
	ratio[5] = omg * omh * opr / 8.;
	ratio[6] = opg * omh * opr / 8.;
	ratio[7] = opg * oph * opr / 8.;
	ratio[8] = omg * oph * opr / 8.;
    } else if (*nterms == 10) {
	xi = (*xig + 1.) / 2.;
	et = (*etg + 1.) / 2.;
	ze = (*zeg + 1.) / 2.;
	dx[0] = xi;
	dx[1] = et;
	dx[2] = ze;
	insertsortd_(dx, &n);
/*         call dsort(dx,iy,n,kflag) */
	if (dx[2] > 1e-30) {
	    al = dx[2] / (xi + et + ze);
	    xi = al * xi;
	    et = al * et;
	    ze = al * ze;
	}
/*         if(xi+et+ze.gt.1.d0) then */
/*            dummy=2.d0*(1.d0-xi-et-ze)/3.d0 */
/*            xi=dummy+xi */
/*            et=dummy+et */
/*            ze=dummy+ze */
/*         endif */

/*        shape functions */

	*a = 1. - xi - et - ze;
	ratio[1] = (*a * 2. - 1.) * *a;
	ratio[2] = xi * (xi * 2. - 1.);
	ratio[3] = et * (et * 2. - 1.);
	ratio[4] = ze * (ze * 2. - 1.);
	ratio[5] = xi * 4. * *a;
	ratio[6] = xi * 4. * et;
	ratio[7] = et * 4. * *a;
	ratio[8] = ze * 4. * *a;
	ratio[9] = xi * 4. * ze;
	ratio[10] = et * 4. * ze;
    } else if (*nterms == 15) {
	xi = (*xig + 1.) / 2.;
	et = (*etg + 1.) / 2.;
	if (xi + et > 1.) {
	    dummy = xi;
	    xi = 1. - et;
	    et = 1. - dummy;
	}

	ze = *zeg;
	*a = 1. - xi - et;

/*     shape functions */

	ratio[1] = *a * -.5 * (1. - ze) * (xi * 2. + et * 2. + ze);
	ratio[2] = xi * .5 * (1. - ze) * (xi * 2. - 2. - ze);
	ratio[3] = et * .5 * (1. - ze) * (et * 2. - 2. - ze);
	ratio[4] = *a * -.5 * (ze + 1.) * (xi * 2. + et * 2. - ze);
	ratio[5] = xi * .5 * (ze + 1.) * (xi * 2. - 2. + ze);
	ratio[6] = et * .5 * (ze + 1.) * (et * 2. - 2. + ze);
	ratio[7] = xi * 2. * *a * (1. - ze);
	ratio[8] = xi * 2. * et * (1. - ze);
	ratio[9] = et * 2. * *a * (1. - ze);
	ratio[10] = xi * 2. * *a * (ze + 1.);
	ratio[11] = xi * 2. * et * (ze + 1.);
	ratio[12] = et * 2. * *a * (ze + 1.);
	ratio[13] = *a * (1. - ze * ze);
	ratio[14] = xi * (1. - ze * ze);
	ratio[15] = et * (1. - ze * ze);
    } else if (*nterms == 20) {
	xi = *xig;
	et = *etg;
	ze = *zeg;

	omg = 1. - xi;
	omh = 1. - et;
	omr = 1. - ze;
	opg = xi + 1.;
	oph = et + 1.;
	opr = ze + 1.;
	tpgphpr = opg + oph + ze;
	tmgphpr = omg + oph + ze;
	tmgmhpr = omg + omh + ze;
	tpgmhpr = opg + omh + ze;
	tpgphmr = opg + oph - ze;
	tmgphmr = omg + oph - ze;
	tmgmhmr = omg + omh - ze;
	tpgmhmr = opg + omh - ze;
	omgopg = omg * opg / 4.;
	omhoph = omh * oph / 4.;
	omropr = omr * opr / 4.;
	omgmopg = (omg - opg) / 4.;
	omhmoph = (omh - oph) / 4.;
	omrmopr = (omr - opr) / 4.;

/*     shape functions */

	ratio[1] = -omg * omh * omr * tpgphpr / 8.;
	ratio[2] = -opg * omh * omr * tmgphpr / 8.;
	ratio[3] = -opg * oph * omr * tmgmhpr / 8.;
	ratio[4] = -omg * oph * omr * tpgmhpr / 8.;
	ratio[5] = -omg * omh * opr * tpgphmr / 8.;
	ratio[6] = -opg * omh * opr * tmgphmr / 8.;
	ratio[7] = -opg * oph * opr * tmgmhmr / 8.;
	ratio[8] = -omg * oph * opr * tpgmhmr / 8.;
	ratio[9] = omgopg * omh * omr;
	ratio[10] = omhoph * opg * omr;
	ratio[11] = omgopg * oph * omr;
	ratio[12] = omhoph * omg * omr;
	ratio[13] = omgopg * omh * opr;
	ratio[14] = omhoph * opg * opr;
	ratio[15] = omgopg * oph * opr;
	ratio[16] = omhoph * omg * opr;
	ratio[17] = omropr * omg * omh;
	ratio[18] = omropr * opg * omh;
	ratio[19] = omropr * opg * oph;
	ratio[20] = omropr * omg * oph;
    } else {
	s_wsle(&io___28);
	do_lio(&c__9, &c__1, "*ERROR in distattach: case with ", (ftnlen)32);
	do_lio(&c__3, &c__1, (char *)&(*nterms), (ftnlen)sizeof(integer));
	e_wsle();
	s_wsle(&io___29);
	do_lio(&c__9, &c__1, "       terms is not covered", (ftnlen)27);
	e_wsle();
	exit_(&c__201);
    }

/*     calculating the position in the face */

    for (i__ = 1; i__ <= 3; ++i__) {
	p[i__] = 0.;
	i__1 = *nterms;
	for (j = 1; j <= i__1; ++j) {
	    p[i__] += ratio[j] * pneigh[i__ + j * 3];
	}
    }

/*     calculating the distance */

/* Computing 2nd power */
    d__1 = pnode[1] - p[1];
/* Computing 2nd power */
    d__2 = pnode[2] - p[2];
/* Computing 2nd power */
    d__3 = pnode[3] - p[3];
    *a = d__1 * d__1 + d__2 * d__2 + d__3 * d__3;

    return 0;
} /* distattach_3d__ */

