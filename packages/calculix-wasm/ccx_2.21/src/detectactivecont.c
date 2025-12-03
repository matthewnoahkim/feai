/* detectactivecont.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int detectactivecont_(doublereal *gapnorm, doublereal *
	gapdisp, doublereal *auw, integer *iroww, integer *jqw, integer *
	nslavs, doublereal *springarea, integer *iacti, integer *nacti)
{
    /* System generated locals */
    integer i__1, i__2;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);
    /* Subroutine */ int s_stop(char *, ftnlen);

    /* Local variables */
    integer i__, j, icol;
    doublereal value;
    integer inorm;

    /* Fortran I/O blocks */
    static cilist io___6 = { 0, 6, 0, 0, 0 };



/*     computing g_Npre=g0+Wb^T*gapdisp */




/*     premultiply gapdisp with Wb^T (taking only normal directions */
/*     into account, i.e. nslav entries) */

    /* Parameter adjustments */
    --iacti;
    springarea -= 3;
    --jqw;
    --iroww;
    --auw;
    --gapdisp;
    --gapnorm;

    /* Function Body */
    i__1 = *nslavs;
    for (i__ = 1; i__ <= i__1; ++i__) {
	inorm = (i__ - 1) * 3 + 1;
/* only normal node DOF */
	i__2 = jqw[inorm + 1] - 1;
	for (j = jqw[inorm]; j <= i__2; ++j) {
	    value = auw[j];
	    icol = iroww[j];
	    gapnorm[i__] += value * gapdisp[icol];
/* TODOCMT friction c */
	}
    }

    *nacti = 0;
    i__1 = *nslavs;
    for (i__ = 1; i__ <= i__1; ++i__) {

	j = (i__ - 1) * 3;

/*     contact evaluation: active degrees of freedom are those for */
/*     which there is overlap (with added initial clearance at time 0) */
/*     and for the NON-zero columns (these are nodes which have no master face). */

	if (gapnorm[i__] + springarea[(i__ << 1) + 2] <= 0. && jqw[j + 1] != 
		jqw[j + 2]) {

	    if (jqw[j + 1] == jqw[j + 2]) {
		s_wsle(&io___6);
		do_lio(&c__9, &c__1, "Zero column detected!!! Singular conta"
			"ct matrix", (ftnlen)47);
		e_wsle();
		s_stop("", (ftnlen)0);
	    }

/*     identifying the indices only of the active normals. */

	    iacti[j + 1] = *nacti + 1;
	    iacti[j + 2] = *nacti + 2;
	    iacti[j + 3] = *nacti + 3;
	    *nacti += 3;
	}
    }

    return 0;
} /* detectactivecont_ */

