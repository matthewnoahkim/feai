/* correlationlengths.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int correlationlengths_(char *inpc, char *textpart, integer *
	istep, integer *istat, integer *n, integer *iline, integer *ipol, 
	integer *inl, integer *ipoinp, integer *inp, integer *ipoinpc, 
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
	    integer *, integer *, ftnlen, ftnlen), inputerror_(char *, 
	    integer *, integer *, char *, integer *, ftnlen, ftnlen);
    integer key;
    doublereal corrlen;

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 6, 0, 0, 0 };
    static cilist io___2 = { 0, 6, 0, 0, 0 };
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___4 = { 0, 6, 0, 0, 0 };
    static cilist io___7 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___10 = { 0, 6, 0, 0, 0 };
    static cilist io___11 = { 0, 6, 0, 0, 0 };



/*     reading the input deck: *CORRELATION LENGTH */







    /* Parameter adjustments */
    --physcon;
    inp -= 4;
    ipoinp -= 3;
    textpart -= 132;
    --inpc;

    /* Function Body */
    if (*istep < 1) {
	s_wsle(&io___1);
	do_lio(&c__9, &c__1, "*ERROR reading *CORRELATION LENGTH:", (ftnlen)
		35);
	e_wsle();
	s_wsle(&io___2);
	do_lio(&c__9, &c__1, "       *CORRELATION LENGTH can only", (ftnlen)
		35);
	e_wsle();
	s_wsle(&io___3);
	do_lio(&c__9, &c__1, "       only be used within a", (ftnlen)28);
	e_wsle();
	s_wsle(&io___4);
	do_lio(&c__9, &c__1, "       *ROBUST DESIGN step", (ftnlen)26);
	e_wsle();
	inputerror_(inpc + 1, ipoinpc, iline, "*CORRELATION LENGTH%", ier, (
		ftnlen)1, (ftnlen)20);
	return 0;
    }

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

/*     reading in the correlation length */

    ici__1.icierr = 1;
    ici__1.iciend = 1;
    ici__1.icirnum = 1;
    ici__1.icirlen = 20;
    ici__1.iciunit = textpart + 132;
    ici__1.icifmt = "(f20.0)";
    *istat = s_rsfi(&ici__1);
    if (*istat != 0) {
	goto L100001;
    }
    *istat = do_fio(&c__1, (char *)&corrlen, (ftnlen)sizeof(doublereal));
    if (*istat != 0) {
	goto L100001;
    }
    *istat = e_rsfi();
L100001:
    if (*istat > 0) {
	inputerror_(inpc + 1, ipoinpc, iline, "*CORRELATION LENGTH%", ier, (
		ftnlen)1, (ftnlen)20);
	return 0;
    }
    if (corrlen < 0.) {
	s_wsle(&io___7);
	do_lio(&c__9, &c__1, "*ERROR reading *CORRELATION LENGTH", (ftnlen)34)
		;
	e_wsle();
	s_wsle(&io___8);
	do_lio(&c__9, &c__1, "      Correlation length for computation", (
		ftnlen)40);
	e_wsle();
	s_wsle(&io___9);
	do_lio(&c__9, &c__1, "      of the random fields cannot", (ftnlen)33);
	e_wsle();
	s_wsle(&io___10);
	do_lio(&c__9, &c__1, "      be less than 0", (ftnlen)20);
	e_wsle();
	s_wsle(&io___11);
	e_wsle();
	inputerror_(inpc + 1, ipoinpc, iline, "*CORRELATION LENGTH%", ier, (
		ftnlen)1, (ftnlen)20);
	return 0;
    }
    physcon[12] = corrlen;
    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

    return 0;
} /* correlationlengths_ */

