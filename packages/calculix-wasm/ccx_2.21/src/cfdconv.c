/* cfdconv.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int cfdconv_(integer *nmethod, integer *iconvergence, 
	integer *ithermal, integer *iit, integer *iturbulent, doublereal *
	dtimef, doublereal *vconmax, doublereal *vmax)
{
    /* System generated locals */
    cilist ci__1;

    /* Builtin functions */
    double sqrt(doublereal);
    integer s_wsfe(cilist *), do_fio(integer *, char *, ftnlen), e_wsfe(void);

    /* Local variables */
    integer i__;
    doublereal ratio[7];


/*     calculates the change in solution */




/*     check convergence */

    /* Parameter adjustments */
    --ithermal;

    /* Function Body */
    if (*iturbulent == 0) {

/*     laminar */

	for (i__ = 0; i__ <= 4; ++i__) {
	    vconmax[i__] = sqrt(vconmax[i__]);
	}
	for (i__ = 0; i__ <= 4; ++i__) {
	    vmax[i__] = sqrt(vmax[i__]);
	    if (vconmax[i__] < 1e-10) {
		ratio[i__] = 0.;
		vmax[i__] = 0.;
	    } else {
		ratio[i__] = vmax[i__] / vconmax[i__];
	    }
	}
	if (*nmethod == 1) {
	    if ((vmax[0] < vconmax[0] * 1e-8 || vconmax[0] < 1e-10) && (vmax[
		    1] < vconmax[1] * 1e-8 || vconmax[1] < 1e-10) && (vmax[2] 
		    < vconmax[2] * 1e-8 || vconmax[2] < 1e-10) && (vmax[3] < 
		    vconmax[3] * 1e-8 || vconmax[3] < 1e-10) && (vmax[4] < 
		    vconmax[4] * 1e-8 || vconmax[4] < 1e-10) && *iit > 1) {
		*iconvergence = 1;
	    }
	}
	if (*iit > 1) {
	    ci__1.cierr = 0;
	    ci__1.ciunit = 12;
	    ci__1.cifmt = "(i7,15(1x,e10.3))";
	    s_wsfe(&ci__1);
	    do_fio(&c__1, (char *)&(*iit), (ftnlen)sizeof(integer));
	    do_fio(&c__1, (char *)&ratio[0], (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, (char *)&ratio[1], (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, (char *)&ratio[2], (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, (char *)&ratio[3], (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, (char *)&ratio[4], (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, (char *)&(*dtimef), (ftnlen)sizeof(doublereal));
	    e_wsfe();
	}
    } else {

/*     turbulent */

	for (i__ = 0; i__ <= 6; ++i__) {
	    vconmax[i__] = sqrt(vconmax[i__]);
	}
	for (i__ = 0; i__ <= 6; ++i__) {
	    vmax[i__] = sqrt(vmax[i__]);
	    if (vconmax[i__] < 1e-10) {
		ratio[i__] = 0.;
		vmax[i__] = 0.;
	    } else {
		ratio[i__] = vmax[i__] / vconmax[i__];
	    }
	}
	if (ithermal[1] == 0) {
	    vconmax[0] = 1.;
	}
	if (*nmethod == 1) {
	    if ((vmax[0] < vconmax[0] * 1e-8 || vconmax[0] < 1e-10) && (vmax[
		    1] < vconmax[1] * 1e-8 || vconmax[1] < 1e-10) && (vmax[2] 
		    < vconmax[2] * 1e-8 || vconmax[2] < 1e-10) && (vmax[3] < 
		    vconmax[3] * 1e-8 || vconmax[3] < 1e-10) && (vmax[4] < 
		    vconmax[4] * 1e-8 || vconmax[4] < 1e-10) && (vmax[5] < 
		    vconmax[5] * 1e-8 || vconmax[5] < 1e-10) && (vmax[6] < 
		    vconmax[6] * 1e-8 || vconmax[6] < 1e-10) && *iit > 1) {
		*iconvergence = 1;
	    }
	}
	if (*iit > 1) {
	    ci__1.cierr = 0;
	    ci__1.ciunit = 12;
	    ci__1.cifmt = "(i7,15(1x,e10.3))";
	    s_wsfe(&ci__1);
	    do_fio(&c__1, (char *)&(*iit), (ftnlen)sizeof(integer));
	    do_fio(&c__1, (char *)&ratio[0], (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, (char *)&ratio[1], (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, (char *)&ratio[2], (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, (char *)&ratio[3], (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, (char *)&ratio[4], (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, (char *)&ratio[5], (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, (char *)&ratio[6], (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, (char *)&(*dtimef), (ftnlen)sizeof(doublereal));
	    e_wsfe();
	}
    }

    return 0;
} /* cfdconv_ */

