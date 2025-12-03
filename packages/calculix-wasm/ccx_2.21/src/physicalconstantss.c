/* physicalconstantss.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int physicalconstantss_(char *inpc, char *textpart, 
	doublereal *physcon, integer *istep, integer *istat, integer *n, 
	integer *iline, integer *ipol, integer *inl, integer *ipoinp, integer 
	*inp, integer *ipoinpc, integer *ier, ftnlen inpc_len, ftnlen 
	textpart_len)
{
    /* System generated locals */
    integer i__1;
    icilist ici__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void), s_cmp(char *, char *, ftnlen, ftnlen), s_rsfi(
	    icilist *), do_fio(integer *, char *, ftnlen), e_rsfi(void), 
	    i_indx(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    integer i__;
    extern /* Subroutine */ int getnewline_(char *, char *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *, ftnlen, ftnlen), inputerror_(char *, 
	    integer *, integer *, char *, integer *, ftnlen, ftnlen);
    integer key;
    extern /* Subroutine */ int inputwarning_(char *, integer *, integer *, 
	    char *, ftnlen, ftnlen);

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 6, 0, 0, 0 };
    static cilist io___2 = { 0, 6, 0, 0, 0 };
    static cilist io___4 = { 0, 6, 0, 0, 0 };
    static cilist io___5 = { 0, 6, 0, 0, 0 };



/*     reading the input deck: *PHYSICAL CONSTANTS */

/*     physcon(1): absolute zero temperature */
/*            (2): Stefan-Boltzmann constant */
/*            (3): Newton gravity constant */
/*            (4): Static temperature at infinity (CFD) */
/*            (5): Norm of the velocity vector at infinity (CFD) */
/*            (6): Static pressure at infinity (CFD) */
/*            (7): Density at infinity (CFD) */
/*            (8): Length of the computational domain (CFD) */
/*            (9): perturbation flag (CFD) */





    /* Parameter adjustments */
    inp -= 4;
    ipoinp -= 3;
    --physcon;
    textpart -= 132;
    --inpc;

    /* Function Body */
    if (*istep > 0) {
	s_wsle(&io___1);
	do_lio(&c__9, &c__1, "*ERROR reading *PHYSICAL CONSTANTS: *PHYSICAL "
		"CONSTANTS", (ftnlen)55);
	e_wsle();
	s_wsle(&io___2);
	do_lio(&c__9, &c__1, "        should only be used before the first S"
		"TEP", (ftnlen)49);
	e_wsle();
	*ier = 1;
	return 0;
    }

    i__1 = *n;
    for (i__ = 2; i__ <= i__1; ++i__) {
	if (s_cmp(textpart + i__ * 132, "ABSOLUTEZERO=", (ftnlen)13, (ftnlen)
		13) == 0) {
	    ici__1.icierr = 1;
	    ici__1.iciend = 1;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 20;
	    ici__1.iciunit = textpart + (i__ * 132 + 13);
	    ici__1.icifmt = "(f20.0)";
	    *istat = s_rsfi(&ici__1);
	    if (*istat != 0) {
		goto L100001;
	    }
	    *istat = do_fio(&c__1, (char *)&physcon[1], (ftnlen)sizeof(
		    doublereal));
	    if (*istat != 0) {
		goto L100001;
	    }
	    *istat = e_rsfi();
L100001:
	    if (*istat > 0) {
		inputerror_(inpc + 1, ipoinpc, iline, "*PHYSICAL CONSTANTS%", 
			ier, (ftnlen)1, (ftnlen)20);
		return 0;
	    }
	} else if (s_cmp(textpart + i__ * 132, "STEFANBOLTZMANN=", (ftnlen)16,
		 (ftnlen)16) == 0) {
	    ici__1.icierr = 1;
	    ici__1.iciend = 1;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 20;
	    ici__1.iciunit = textpart + (i__ * 132 + 16);
	    ici__1.icifmt = "(f20.0)";
	    *istat = s_rsfi(&ici__1);
	    if (*istat != 0) {
		goto L100002;
	    }
	    *istat = do_fio(&c__1, (char *)&physcon[2], (ftnlen)sizeof(
		    doublereal));
	    if (*istat != 0) {
		goto L100002;
	    }
	    *istat = e_rsfi();
L100002:
	    if (*istat > 0) {
		inputerror_(inpc + 1, ipoinpc, iline, "*PHYSICAL CONSTANTS%", 
			ier, (ftnlen)1, (ftnlen)20);
		return 0;
	    }
	} else if (s_cmp(textpart + i__ * 132, "NEWTONGRAVITY=", (ftnlen)14, (
		ftnlen)14) == 0) {
	    ici__1.icierr = 1;
	    ici__1.iciend = 1;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 10;
	    ici__1.iciunit = textpart + (i__ * 132 + 14);
	    ici__1.icifmt = "(f20.0)";
	    *istat = s_rsfi(&ici__1);
	    if (*istat != 0) {
		goto L100003;
	    }
	    *istat = do_fio(&c__1, (char *)&physcon[3], (ftnlen)sizeof(
		    doublereal));
	    if (*istat != 0) {
		goto L100003;
	    }
	    *istat = e_rsfi();
L100003:
	    if (*istat > 0) {
		inputerror_(inpc + 1, ipoinpc, iline, "*PHYSICAL CONSTANTS%", 
			ier, (ftnlen)1, (ftnlen)20);
		return 0;
	    }
	} else {
	    s_wsle(&io___4);
	    do_lio(&c__9, &c__1, "*WARNING in physicalconstants: parameter n"
		    "ot recognized:", (ftnlen)56);
	    e_wsle();
	    s_wsle(&io___5);
	    do_lio(&c__9, &c__1, "         ", (ftnlen)9);
	    do_lio(&c__9, &c__1, textpart + i__ * 132, i_indx(textpart + i__ *
		     132, " ", (ftnlen)132, (ftnlen)1) - 1);
	    e_wsle();
	    inputwarning_(inpc + 1, ipoinpc, iline, "*PHYSICAL CONSTANTS%", (
		    ftnlen)1, (ftnlen)20);
	}
    }

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

    return 0;
} /* physicalconstantss_ */

