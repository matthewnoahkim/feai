/* noanalysiss.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int noanalysiss_(char *inpc, char *textpart, integer *
	nmethod, integer *iperturb, integer *istep, integer *istat, integer *
	n, integer *iline, integer *ipol, integer *inl, integer *ipoinp, 
	integer *inp, integer *ipoinpc, doublereal *tper, integer *ier, 
	ftnlen inpc_len, ftnlen textpart_len)
{
    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    extern /* Subroutine */ int getnewline_(char *, char *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *, ftnlen, ftnlen);
    integer key;

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 6, 0, 0, 0 };
    static cilist io___2 = { 0, 6, 0, 0, 0 };
    static cilist io___3 = { 0, 6, 0, 0, 0 };



/*     reading the input deck: *NO ANALYSIS */





    /* Parameter adjustments */
    inp -= 4;
    ipoinp -= 3;
    --iperturb;
    textpart -= 132;
    --inpc;

    /* Function Body */
    if (*istep < 1) {
	s_wsle(&io___1);
	do_lio(&c__9, &c__1, "*ERROR reading *NO ANALYSIS: *NO ANALYSIS can "
		"only be used", (ftnlen)58);
	e_wsle();
	s_wsle(&io___2);
	do_lio(&c__9, &c__1, "  within a STEP", (ftnlen)15);
	e_wsle();
	*ier = 1;
	return 0;
    }

    s_wsle(&io___3);
    do_lio(&c__9, &c__1, "*WARNING: no analysis option was chosen", (ftnlen)
	    39);
    e_wsle();

    *nmethod = 0;
    iperturb[1] = 0;
    *tper = 1.;

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

    return 0;
} /* noanalysiss_ */

