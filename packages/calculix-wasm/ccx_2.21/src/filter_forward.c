/* filter_forward.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int filter_forward__(doublereal *gradproj, integer *nk, 
	integer *nodedesi, integer *ndesi, char *objectset, doublereal *xo, 
	doublereal *yo, doublereal *zo, doublereal *x, doublereal *y, 
	doublereal *z__, integer *nx, integer *ny, integer *nz, integer *
	neighbor, doublereal *r__, integer *ndesia, integer *ndesib, 
	doublereal *xdesi, doublereal *distmin, doublereal *feasdir, 
	doublereal *filterval, ftnlen objectset_len)
{
    /* System generated locals */
    integer i__1, i__2;
    doublereal d__1, d__2;
    icilist ici__1;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen), s_rsfi(icilist *), do_fio(
	    integer *, char *, ftnlen), e_rsfi(void);
    double sqrt(doublereal), atan(doublereal), exp(doublereal);

    /* Local variables */
    extern /* Subroutine */ int near3d_se__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     integer *, integer *, doublereal *, doublereal *, doublereal *, 
	    integer *, integer *, doublereal *, integer *, doublereal *);
    integer i__, j;
    doublereal filterrad, nominator, pi, denominator;
    integer nnodesinside;
    doublereal sigma;
    integer istat;
    doublereal scalar;
    integer actdir;


/*     Filtering of sensitivities */




/*     Calculate filtered sensitivities */

/*     Check if direction weighting is turned on */

    /* Parameter adjustments */
    --filterval;
    feasdir -= 3;
    xdesi -= 4;
    --r__;
    --neighbor;
    --nz;
    --ny;
    --nx;
    --z__;
    --y;
    --x;
    --zo;
    --yo;
    --xo;
    objectset -= 486;
    --nodedesi;
    gradproj -= 4;

    /* Function Body */
    if (s_cmp(objectset + 580, "DIR", (ftnlen)3, (ftnlen)3) == 0) {
	actdir = 1;
    } else {
	actdir = 0;
    }

/*     Assign filter radius (taken from first defined object function) */

    ici__1.icierr = 1;
    ici__1.iciend = 1;
    ici__1.icirnum = 1;
    ici__1.icirlen = 20;
    ici__1.iciunit = objectset + 587;
    ici__1.icifmt = "(f20.0)";
    istat = s_rsfi(&ici__1);
    if (istat != 0) {
	goto L100001;
    }
    istat = do_fio(&c__1, (char *)&filterrad, (ftnlen)sizeof(doublereal));
    if (istat != 0) {
	goto L100001;
    }
    istat = e_rsfi();
L100001:

/*     For the GAUSS filter search in the 3sigma distance */

    if (s_cmp(objectset + 567, "GAUSS", (ftnlen)5, (ftnlen)5) == 0) {
	sigma = filterrad;
	filterrad *= 3;
    }

    i__1 = *ndesib;
    for (j = *ndesia; j <= i__1; ++j) {

	near3d_se__(&xo[1], &yo[1], &zo[1], &x[1], &y[1], &z__[1], &nx[1], &
		ny[1], &nz[1], &xo[j], &yo[j], &zo[j], ndesi, &neighbor[1], &
		r__[1], &nnodesinside, &filterrad);

/*        Calculate function value of the filterfunction CONST */

	if (s_cmp(objectset + 567, "CONST", (ftnlen)5, (ftnlen)5) == 0) {
	    i__2 = nnodesinside;
	    for (i__ = 1; i__ <= i__2; ++i__) {
		filterval[i__] = 1.;
	    }

/*        Calculate function value of the filterfunction LIN */

	} else if (s_cmp(objectset + 567, "LIN", (ftnlen)3, (ftnlen)3) == 0) {
	    i__2 = nnodesinside;
	    for (i__ = 1; i__ <= i__2; ++i__) {
		filterval[i__] = (1 - sqrt(r__[i__]) / filterrad) * filterrad;
	    }

/*        Calculate function value of the filterfunction QUAD */

	} else if (s_cmp(objectset + 567, "QUAD", (ftnlen)4, (ftnlen)4) == 0) 
		{
	    i__2 = nnodesinside;
	    for (i__ = 1; i__ <= i__2; ++i__) {
		filterval[i__] = -(sqrt(r__[i__]) / filterrad + 1) * (sqrt(
			r__[i__]) / filterrad - 1) * filterrad;
	    }

/*        Calculate function value of the filterfunction CUB */

	} else if (s_cmp(objectset + 567, "CUBIC", (ftnlen)5, (ftnlen)5) == 0)
		 {
	    i__2 = nnodesinside;
	    for (i__ = 1; i__ <= i__2; ++i__) {
/* Computing 3rd power */
		d__1 = sqrt(r__[i__]) / filterrad;
/* Computing 2nd power */
		d__2 = sqrt(r__[i__]) / filterrad;
		filterval[i__] = (d__1 * (d__1 * d__1) * 2 - d__2 * d__2 * 3 
			+ 1) * filterrad;
	    }

/*        Calculate function value of the filterfunction GAUSS */

	} else if (s_cmp(objectset + 567, "GAUSS", (ftnlen)5, (ftnlen)5) == 0)
		 {
	    pi = atan(1.) * 4.;
	    i__2 = nnodesinside;
	    for (i__ = 1; i__ <= i__2; ++i__) {
/* Computing 2nd power */
		d__1 = sqrt(r__[i__]);
/* Computing 2nd power */
		d__2 = sigma;
		filterval[i__] = 1 / (sqrt(pi * 2) * sigma) * exp(-(d__1 * 
			d__1) / (d__2 * d__2 * 2));
	    }
	}

/*        Calculate filtered sensitivity */

	nominator = 0.;
	denominator = 0.;
	i__2 = nnodesinside;
	for (i__ = 1; i__ <= i__2; ++i__) {
	    if (actdir == 1) {
/* Computing 2nd power */
		d__1 = *distmin;
		scalar = (xdesi[j * 3 + 1] * xdesi[neighbor[i__] * 3 + 1] + 
			xdesi[j * 3 + 2] * xdesi[neighbor[i__] * 3 + 2] + 
			xdesi[j * 3 + 3] * xdesi[neighbor[i__] * 3 + 3]) / (
			d__1 * d__1);
/*          if(objectset(1,m)(1:4).eq.'MASS') then */
/*             scalar=1.d0 */
/*          endif */
		if (scalar < 0.) {
		    scalar = 0.;
		}
		nominator += filterval[i__] * scalar * gradproj[nodedesi[
			neighbor[i__]] * 3 + 3];
		denominator += filterval[i__];
	    } else {
		nominator += filterval[i__] * gradproj[nodedesi[neighbor[i__]]
			 * 3 + 3];
		denominator += filterval[i__];
	    }
	}
/*     ALREADY DONE AT THE START OF FILTER_FORWARDMAIN */
/*         feasdir(1,nodedesi(j))=gradproj(3,nodedesi(j)) */
	feasdir[(nodedesi[j] << 1) + 2] = nominator / denominator;
    }

    return 0;
} /* filter_forward__ */

