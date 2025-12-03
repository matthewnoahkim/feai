/* checktime.f -- translated by f2c (version 20200916).
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
static integer c__201 = 201;
static integer c__5 = 5;


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

/* Subroutine */ int checktime_(integer *itpamp, integer *namta, doublereal *
	tinc, doublereal *ttime, doublereal *amta, doublereal *tmin, integer *
	inext, integer *itp, integer *istep, doublereal *tper)
{
    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    extern /* Subroutine */ int identamta_(doublereal *, doublereal *, 
	    integer *, integer *, integer *);
    integer id, iend, inew;
    extern /* Subroutine */ int exit_(integer *);
    integer istart;
    doublereal reftime;

    /* Fortran I/O blocks */
    static cilist io___6 = { 0, 6, 0, 0, 0 };
    static cilist io___7 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___10 = { 0, 6, 0, 0, 0 };
    static cilist io___11 = { 0, 6, 0, 0, 0 };



/*     checks whether tmin does not exceed the first time point, */
/*     in case a time points amplitude is active */




    /* Parameter adjustments */
    amta -= 3;
    namta -= 4;

    /* Function Body */
    if (*itpamp > 0) {

/*        identifying the location in the time points amplitude */
/*        of the starting time of the step */

/*        for time points amplitudes based on total time the inext */
/*        value from the previous step should be used starting with the */
/*        second step */

	if (namta[*itpamp * 3 + 3] >= 0 || *inext == 0) {
	    if (namta[*itpamp * 3 + 3] < 0) {
		reftime = *ttime;
	    } else {
		reftime = 0.;
	    }
	    istart = namta[*itpamp * 3 + 1];
	    iend = namta[*itpamp * 3 + 2];
	    identamta_(&amta[3], &reftime, &istart, &iend, &id);
	    if (id < istart) {
		*inext = istart;
	    } else {
		*inext = id + 1;
	    }
	}

/*        identifying the location in the time points amplitude */
/*        of the starting point increased by tinc */

	if (namta[*itpamp * 3 + 3] < 0) {
	    reftime = *ttime + *tinc;
	} else {
	    reftime = *tinc;
	}
	istart = namta[*itpamp * 3 + 1];
	iend = namta[*itpamp * 3 + 2];
	identamta_(&amta[3], &reftime, &istart, &iend, &id);
	if (id < istart) {
	    inew = istart;
	} else {
	    inew = id + 1;
	}

/*        if the end of the new increment is less than a time */
/*        point by less than 1.e-6 (theta-value) dtheta is */
/*        enlarged up to this time point */

	if (*inext == inew && inew <= iend) {
	    if (amta[(inew << 1) + 1] - reftime < *tper * 1e-6) {
		++inew;
	    }
	}

/*        if the next time point precedes tinc or tmin */
/*        appropriate action must be taken */

	if (inew > *inext) {
	    if (namta[*itpamp * 3 + 3] < 0) {
		*tinc = amta[(*inext << 1) + 1] - *ttime;
	    } else {
		*tinc = amta[(*inext << 1) + 1];
	    }
	    ++(*inext);
	    *itp = 1;
	    if (*tinc < *tmin) {
		s_wsle(&io___6);
		do_lio(&c__9, &c__1, "*ERROR in checktime: a time point", (
			ftnlen)33);
		e_wsle();
		s_wsle(&io___7);
		do_lio(&c__9, &c__1, "       precedes the minimum time tmin", 
			(ftnlen)37);
		e_wsle();
		exit_(&c__201);
	    } else {
		s_wsle(&io___8);
		do_lio(&c__9, &c__1, "*WARNING in checktime: a time point", (
			ftnlen)35);
		e_wsle();
		s_wsle(&io___9);
		do_lio(&c__9, &c__1, "         precedes the initial time", (
			ftnlen)34);
		e_wsle();
		s_wsle(&io___10);
		do_lio(&c__9, &c__1, "         increment tinc; tinc is", (
			ftnlen)32);
		e_wsle();
		s_wsle(&io___11);
		do_lio(&c__9, &c__1, "         decreased to ", (ftnlen)22);
		do_lio(&c__5, &c__1, (char *)&(*tinc), (ftnlen)sizeof(
			doublereal));
		e_wsle();
	    }
	}
    }

    return 0;
} /* checktime_ */

