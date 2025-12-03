/* objective_stress_se.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int objective_stress_se__(integer *nk, integer *iobject, 
	integer *mi, doublereal *dstn, char *objectset, integer *ialnneigh, 
	integer *naneigh, integer *nbneigh, doublereal *stn, doublereal *
	dksper, ftnlen objectset_len)
{
    /* System generated locals */
    integer i__1;
    icilist ici__1;

    /* Builtin functions */
    integer s_rsfi(icilist *), do_fio(integer *, char *, ftnlen), e_rsfi(void)
	    ;
    double exp(doublereal);

    /* Local variables */
    integer j, k;
    doublereal stressval;
    extern /* Subroutine */ int calcstress_(char *, integer *, doublereal *, 
	    integer *, doublereal *, ftnlen);
    doublereal rho, stress, dstress, xstress;


/*     calculates the sum of the square of the von Mises stress of a node */
/*     set */





/*     reading rho and the mean stress for the Kreisselmeier-Steinhauser */
/*     function */

    /* Parameter adjustments */
    stn -= 7;
    --ialnneigh;
    objectset -= 486;
    dstn -= 7;
    --mi;

    /* Function Body */
    ici__1.icierr = 0;
    ici__1.iciend = 0;
    ici__1.icirnum = 1;
    ici__1.icirlen = 20;
    ici__1.iciunit = objectset + ((*iobject * 5 + 2) * 81 + 40);
    ici__1.icifmt = "(f20.0)";
    s_rsfi(&ici__1);
    do_fio(&c__1, (char *)&rho, (ftnlen)sizeof(doublereal));
    e_rsfi();
    ici__1.icierr = 0;
    ici__1.iciend = 0;
    ici__1.icirnum = 1;
    ici__1.icirlen = 20;
    ici__1.iciunit = objectset + ((*iobject * 5 + 2) * 81 + 60);
    ici__1.icifmt = "(f20.0)";
    s_rsfi(&ici__1);
    do_fio(&c__1, (char *)&xstress, (ftnlen)sizeof(doublereal));
    e_rsfi();

    *dksper = 0.;
    i__1 = *nbneigh;
    for (j = *naneigh; j <= i__1; ++j) {
	k = ialnneigh[j];

/*        Calculate unperturbed stress (Mises,PS1 or PS3) */

	calcstress_(objectset + 486, iobject, &stn[7], &k, &stressval, (
		ftnlen)81);
	stress = stressval;

/*        Calculate perturbed stress (Mises,PS1 or PS3) */

	calcstress_(objectset + 486, iobject, &dstn[7], &k, &stressval, (
		ftnlen)81);
	dstress = stressval;

/*        Calculate delta stress (Mises,PS1 or PS3) */

	dstress -= stress;

	*dksper += exp(rho * stressval / xstress) * dstress;
    }

    *dksper /= xstress;

    return 0;
} /* objective_stress_se__ */

