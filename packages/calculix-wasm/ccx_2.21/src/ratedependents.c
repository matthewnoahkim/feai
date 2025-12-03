/* ratedependents.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int ratedependents_(char *inpc, char *textpart, integer *
	nelcon, integer *nmat, integer *ntmat___, integer *iplas, integer *
	iperturb, integer *nstate___, integer *ncmat___, doublereal *elcon, 
	char *matname, integer *irstrt, integer *istep, integer *istat, 
	integer *n, integer *iline, integer *ipol, integer *inl, integer *
	ipoinp, integer *inp, integer *ipoinpc, integer *ier, ftnlen inpc_len,
	 ftnlen textpart_len, ftnlen matname_len)
{
    /* System generated locals */
    integer elcon_dim1, elcon_dim2, elcon_offset, i__1;
    icilist ici__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void), s_cmp(char *, char *, ftnlen, ftnlen), i_indx(char *
	    , char *, ftnlen, ftnlen), s_rsfi(icilist *), do_fio(integer *, 
	    char *, ftnlen), e_rsfi(void);

    /* Local variables */
    integer i__;
    extern /* Subroutine */ int getnewline_(char *, char *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *, ftnlen, ftnlen), inputerror_(char *, 
	    integer *, integer *, char *, integer *, ftnlen, ftnlen);
    integer key;
    logical johnsoncook;
    extern /* Subroutine */ int inputwarning_(char *, integer *, integer *, 
	    char *, ftnlen, ftnlen);
    integer npmat, ntmat;

    /* Fortran I/O blocks */
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___4 = { 0, 6, 0, 0, 0 };
    static cilist io___5 = { 0, 6, 0, 0, 0 };
    static cilist io___6 = { 0, 6, 0, 0, 0 };
    static cilist io___7 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___10 = { 0, 6, 0, 0, 0 };
    static cilist io___11 = { 0, 6, 0, 0, 0 };
    static cilist io___13 = { 0, 6, 0, 0, 0 };
    static cilist io___14 = { 0, 6, 0, 0, 0 };
    static cilist io___15 = { 0, 6, 0, 0, 0 };
    static cilist io___16 = { 0, 6, 0, 0, 0 };
    static cilist io___17 = { 0, 6, 0, 0, 0 };
    static cilist io___18 = { 0, 6, 0, 0, 0 };
    static cilist io___19 = { 0, 6, 0, 0, 0 };
    static cilist io___20 = { 0, 6, 0, 0, 0 };
    static cilist io___22 = { 0, 6, 0, 0, 0 };
    static cilist io___23 = { 0, 6, 0, 0, 0 };
    static cilist io___24 = { 0, 6, 0, 0, 0 };
    static cilist io___25 = { 0, 6, 0, 0, 0 };
    static cilist io___27 = { 0, 6, 0, 0, 0 };
    static cilist io___28 = { 0, 6, 0, 0, 0 };
    static cilist io___29 = { 0, 6, 0, 0, 0 };
    static cilist io___30 = { 0, 6, 0, 0, 0 };
    static cilist io___31 = { 0, 6, 0, 0, 0 };
    static cilist io___32 = { 0, 6, 0, 0, 0 };



/*     reading the input deck: *RATE DEPENDENT */






    /* Parameter adjustments */
    --inpc;
    textpart -= 132;
    nelcon -= 3;
    --iperturb;
    elcon_dim1 = *ncmat___ - 0 + 1;
    elcon_dim2 = *ntmat___;
    elcon_offset = 0 + elcon_dim1 * (1 + elcon_dim2);
    elcon -= elcon_offset;
    matname -= 80;
    --irstrt;
    ipoinp -= 3;
    inp -= 4;

    /* Function Body */
    johnsoncook = FALSE_;

    npmat = 0;

    if (*istep > 0 && irstrt[1] >= 0) {
	s_wsle(&io___3);
	do_lio(&c__9, &c__1, "*ERROR reading *RATE DEPENDENT:", (ftnlen)31);
	e_wsle();
	s_wsle(&io___4);
	do_lio(&c__9, &c__1, "       *RATE DEPENDENT should be placed", (
		ftnlen)39);
	e_wsle();
	s_wsle(&io___5);
	do_lio(&c__9, &c__1, "       before all step definitions", (ftnlen)34)
		;
	e_wsle();
	*ier = 1;
	return 0;
    }

    if (*nmat == 0) {
	s_wsle(&io___6);
	do_lio(&c__9, &c__1, "*ERROR reading *RATE DEPENDENT:", (ftnlen)31);
	e_wsle();
	s_wsle(&io___7);
	do_lio(&c__9, &c__1, "       *RATE DEPENDENT should be preceded", (
		ftnlen)41);
	e_wsle();
	s_wsle(&io___8);
	do_lio(&c__9, &c__1, "       by a *MATERIAL card", (ftnlen)26);
	e_wsle();
	*ier = 1;
	return 0;
    }

    if (nelcon[(*nmat << 1) + 1] != 2 && s_cmp(matname + *nmat * 80, "JOHNSO"
	    "NCOOK", (ftnlen)11, (ftnlen)11) != 0) {
	s_wsle(&io___9);
	do_lio(&c__9, &c__1, "*ERROR reading *RATE DEPENDENT:", (ftnlen)31);
	e_wsle();
	s_wsle(&io___10);
	do_lio(&c__9, &c__1, "       *RATE DEPENDENT should be preceded", (
		ftnlen)41);
	e_wsle();
	s_wsle(&io___11);
	do_lio(&c__9, &c__1, "       by an *ELASTIC,TYPE=ISO card", (ftnlen)
		35);
	e_wsle();
	*ier = 1;
	return 0;
    }

    iperturb[1] = 3;

    i__1 = *n;
    for (i__ = 2; i__ <= i__1; ++i__) {
	if (s_cmp(textpart + i__ * 132, "TYPE=JOHNSONCOOK", (ftnlen)16, (
		ftnlen)16) == 0) {
	    johnsoncook = TRUE_;
	} else {
	    s_wsle(&io___13);
	    do_lio(&c__9, &c__1, "*WARNING reading *RATE DEPENDENT:", (ftnlen)
		    33);
	    e_wsle();
	    s_wsle(&io___14);
	    do_lio(&c__9, &c__1, "         parameter not recognized:", (
		    ftnlen)34);
	    e_wsle();
	    s_wsle(&io___15);
	    do_lio(&c__9, &c__1, "         ", (ftnlen)9);
	    do_lio(&c__9, &c__1, textpart + i__ * 132, i_indx(textpart + i__ *
		     132, " ", (ftnlen)132, (ftnlen)1) - 1);
	    e_wsle();
	    inputwarning_(inpc + 1, ipoinpc, iline, "*RATE DEPENDENT%", (
		    ftnlen)1, (ftnlen)16);
	}
    }

/*     Johnson-Cook */
/*     user material; npmat=0; ntmat=1; */

    if (johnsoncook) {
	*iplas = 1;
	if (s_cmp(matname + *nmat * 80, "JOHNSONCOOK", (ftnlen)11, (ftnlen)11)
		 != 0) {
	    s_wsle(&io___16);
	    do_lio(&c__9, &c__1, "*ERROR reading *RATE DEPENDENT", (ftnlen)30)
		    ;
	    e_wsle();
	    s_wsle(&io___17);
	    do_lio(&c__9, &c__1, "       the name of a Johnson Cook material",
		     (ftnlen)42);
	    e_wsle();
	    s_wsle(&io___18);
	    do_lio(&c__9, &c__1, "       must start with JOHNSONCOOK", (
		    ftnlen)34);
	    e_wsle();
	    s_wsle(&io___19);
	    do_lio(&c__9, &c__1, "       (blanks are allowed at any location",
		     (ftnlen)42);
	    e_wsle();
	    s_wsle(&io___20);
	    do_lio(&c__9, &c__1, "        and the string is not case sensiti"
		    "ve)", (ftnlen)45);
	    e_wsle();
	    inputerror_(inpc + 1, ipoinpc, iline, "*RATE DEPENDENT%", ier, (
		    ftnlen)1, (ftnlen)16);
	    return 0;
	}
	nelcon[(*nmat << 1) + 1] = -111;
	*nstate___ = max(*nstate___,9);
	getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, 
		inl, &ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);
	if (*istat < 0 || key == 1 || *n < 2) {
	    s_wsle(&io___22);
	    do_lio(&c__9, &c__1, "*ERROR reading *RATE DEPENDENT", (ftnlen)30)
		    ;
	    e_wsle();
	    s_wsle(&io___23);
	    do_lio(&c__9, &c__1, "       for the Johnson-Cook model at least",
		     (ftnlen)42);
	    e_wsle();
	    s_wsle(&io___24);
	    do_lio(&c__9, &c__1, "       C and the reference strain rate must"
		    , (ftnlen)43);
	    e_wsle();
	    s_wsle(&io___25);
	    do_lio(&c__9, &c__1, "       be given", (ftnlen)15);
	    e_wsle();
	    inputerror_(inpc + 1, ipoinpc, iline, "*RATE DEPENDENT%", ier, (
		    ftnlen)1, (ftnlen)16);
	    return 0;
	}
	ntmat = 1;
	if (ntmat > *ntmat___) {
	    s_wsle(&io___27);
	    do_lio(&c__9, &c__1, "*ERROR reading *RATE DEPENDENT: increase n"
		    "tmat_", (ftnlen)47);
	    e_wsle();
	    *ier = 1;
	    return 0;
	}

/*     reading C and the reference strain rate (elcon(7,8)) */

	for (i__ = 1; i__ <= 2; ++i__) {
	    ici__1.icierr = 1;
	    ici__1.iciend = 1;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 20;
	    ici__1.iciunit = textpart + i__ * 132;
	    ici__1.icifmt = "(f20.0)";
	    *istat = s_rsfi(&ici__1);
	    if (*istat != 0) {
		goto L100001;
	    }
	    *istat = do_fio(&c__1, (char *)&elcon[i__ + 6 + (ntmat + *nmat * 
		    elcon_dim2) * elcon_dim1], (ftnlen)sizeof(doublereal));
	    if (*istat != 0) {
		goto L100001;
	    }
	    *istat = e_rsfi();
L100001:
	    ;
	}
	if (elcon[(ntmat + *nmat * elcon_dim2) * elcon_dim1 + 8] <= 0.) {
	    s_wsle(&io___28);
	    do_lio(&c__9, &c__1, "*ERROR reading *RATE DEPENDENT", (ftnlen)30)
		    ;
	    e_wsle();
	    s_wsle(&io___29);
	    do_lio(&c__9, &c__1, "       the reference strain rate must be", (
		    ftnlen)40);
	    e_wsle();
	    s_wsle(&io___30);
	    do_lio(&c__9, &c__1, "       strictly positive", (ftnlen)24);
	    e_wsle();
	    inputerror_(inpc + 1, ipoinpc, iline, "*RATE DEPENDENT%", ier, (
		    ftnlen)1, (ftnlen)16);
	    return 0;
	}
    } else {
	s_wsle(&io___31);
	do_lio(&c__9, &c__1, "*ERROR reading *RATE DEPENDENT", (ftnlen)30);
	e_wsle();
	s_wsle(&io___32);
	do_lio(&c__9, &c__1, "       TYPE=JOHNSON COOK is lacking", (ftnlen)
		35);
	e_wsle();
	inputerror_(inpc + 1, ipoinpc, iline, "*RATE DEPENDENT%", ier, (
		ftnlen)1, (ftnlen)16);
	return 0;
    }

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

    return 0;
} /* ratedependents_ */

