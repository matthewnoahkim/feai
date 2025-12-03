/* randomfields.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int randomfields_(char *inpc, char *textpart, integer *istep,
	 integer *istat, integer *n, integer *iline, integer *ipol, integer *
	inl, integer *ipoinp, integer *inp, integer *ipoinpc, integer *nener, 
	doublereal *physcon, integer *ier, ftnlen inpc_len, ftnlen 
	textpart_len)
{
    /* System generated locals */
    icilist ici__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void), s_rsfi(icilist *), do_fio(integer *, char *, ftnlen)
	    , e_rsfi(void);

    /* Local variables */
    extern /* Subroutine */ int getnewline_(char *, char *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *, ftnlen, ftnlen);
    integer key, neigenvectors;

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 6, 0, 0, 0 };
    static cilist io___2 = { 0, 6, 0, 0, 0 };



/*     reading the input deck: *RANDOM FIELD */

/*     characterized by standarddeviation and correlation length */





    /* Parameter adjustments */
    --physcon;
    inp -= 4;
    ipoinp -= 3;
    textpart -= 132;
    --inpc;

    /* Function Body */
    if (*istep < 1) {
	s_wsle(&io___1);
	do_lio(&c__9, &c__1, "*ERROR reading *RANDOM FIELD: *RANDOM FIELD can"
		, (ftnlen)47);
	e_wsle();
	s_wsle(&io___2);
	do_lio(&c__9, &c__1, "       only be used within a *SENSITIVITY step",
		 (ftnlen)46);
	e_wsle();
	*ier = 1;
	return 0;
    }

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

/*     reading the standard deviation and the correlation length */

/*     Number of eigenvectors used for the creation of the random field */

    ici__1.icierr = 1;
    ici__1.iciend = 1;
    ici__1.icirnum = 1;
    ici__1.icirlen = 20;
    ici__1.iciunit = textpart + 132;
    ici__1.icifmt = "(i10)";
    *istat = s_rsfi(&ici__1);
    if (*istat != 0) {
	goto L100001;
    }
    *istat = do_fio(&c__1, (char *)&neigenvectors, (ftnlen)sizeof(integer));
    if (*istat != 0) {
	goto L100001;
    }
    *istat = e_rsfi();
L100001:
    physcon[11] = neigenvectors * 1.;

/*     Standard deviation */

    ici__1.icierr = 1;
    ici__1.iciend = 1;
    ici__1.icirnum = 1;
    ici__1.icirlen = 20;
    ici__1.iciunit = textpart + 264;
    ici__1.icifmt = "(f20.0)";
    *istat = s_rsfi(&ici__1);
    if (*istat != 0) {
	goto L100002;
    }
    *istat = do_fio(&c__1, (char *)&physcon[12], (ftnlen)sizeof(doublereal));
    if (*istat != 0) {
	goto L100002;
    }
    *istat = e_rsfi();
L100002:

/*     Correlation length */

    ici__1.icierr = 1;
    ici__1.iciend = 1;
    ici__1.icirnum = 1;
    ici__1.icirlen = 20;
    ici__1.iciunit = textpart + 396;
    ici__1.icifmt = "(f20.0)";
    *istat = s_rsfi(&ici__1);
    if (*istat != 0) {
	goto L100003;
    }
    *istat = do_fio(&c__1, (char *)&physcon[13], (ftnlen)sizeof(doublereal));
    if (*istat != 0) {
	goto L100003;
    }
    *istat = e_rsfi();
L100003:

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

    return 0;
} /* randomfields_ */

