/* prefilter.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int prefilter_(doublereal *co, integer *nodedesi, integer *
	ndesi, doublereal *xo, doublereal *yo, doublereal *zo, doublereal *x, 
	doublereal *y, doublereal *z__, integer *nx, integer *ny, integer *nz,
	 char *objectset, doublereal *filterrad, ftnlen objectset_len)
{
    /* System generated locals */
    integer i__1;
    icilist ici__1;

    /* Builtin functions */
    integer s_rsfi(icilist *), do_fio(integer *, char *, ftnlen), e_rsfi(void)
	    , s_cmp(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    integer m, kflag, istat;
    extern /* Subroutine */ int dsort_(doublereal *, integer *, integer *, 
	    integer *);


/*     Filtering of sensitivities and assigning the filterradius */





/*     Create set of designnodes and perform the sorting */
/*     needed for near3d_se */

    /* Parameter adjustments */
    co -= 4;
    --nodedesi;
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

    /* Function Body */
    i__1 = *ndesi;
    for (m = 1; m <= i__1; ++m) {
	xo[m] = co[nodedesi[m] * 3 + 1];
	x[m] = xo[m];
	nx[m] = m;
	yo[m] = co[nodedesi[m] * 3 + 2];
	y[m] = yo[m];
	ny[m] = m;
	zo[m] = co[nodedesi[m] * 3 + 3];
	z__[m] = zo[m];
	nz[m] = m;
    }
    kflag = 2;
    dsort_(&x[1], &nx[1], ndesi, &kflag);
    dsort_(&y[1], &ny[1], ndesi, &kflag);
    dsort_(&z__[1], &nz[1], ndesi, &kflag);

/*     assinging the filterradius */

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
    istat = do_fio(&c__1, (char *)&(*filterrad), (ftnlen)sizeof(doublereal));
    if (istat != 0) {
	goto L100001;
    }
    istat = e_rsfi();
L100001:

/*     For the GAUSS filter search in the 3sigma distance */

    if (s_cmp(objectset + 567, "GAUSS", (ftnlen)5, (ftnlen)5) == 0) {
	*filterrad *= 3;
    }

    return 0;
} /* prefilter_ */

