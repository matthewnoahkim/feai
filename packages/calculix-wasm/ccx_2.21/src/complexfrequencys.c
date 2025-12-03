/* complexfrequencys.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int complexfrequencys_(char *inpc, char *textpart, integer *
	nmethod, integer *mei, integer *iperturb, integer *istep, integer *
	istat, integer *n, integer *iline, integer *ipol, integer *inl, 
	integer *ipoinp, integer *inp, integer *ithermal, doublereal *xboun, 
	integer *nboun, integer *ipoinpc, integer *mcs, doublereal *cs, 
	integer *cyclicsymmetry, integer *ier, ftnlen inpc_len, ftnlen 
	textpart_len)
{
    /* System generated locals */
    integer i__1;
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
    integer key, nev;
    extern /* Subroutine */ int inputwarning_(char *, integer *, integer *, 
	    char *, ftnlen, ftnlen);

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 6, 0, 0, 0 };
    static cilist io___2 = { 0, 6, 0, 0, 0 };
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___5 = { 0, 6, 0, 0, 0 };
    static cilist io___6 = { 0, 6, 0, 0, 0 };
    static cilist io___7 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___10 = { 0, 6, 0, 0, 0 };
    static cilist io___11 = { 0, 6, 0, 0, 0 };
    static cilist io___12 = { 0, 6, 0, 0, 0 };
    static cilist io___13 = { 0, 6, 0, 0, 0 };
    static cilist io___14 = { 0, 6, 0, 0, 0 };
    static cilist io___16 = { 0, 6, 0, 0, 0 };
    static cilist io___17 = { 0, 6, 0, 0, 0 };
    static cilist io___18 = { 0, 6, 0, 0, 0 };
    static cilist io___20 = { 0, 6, 0, 0, 0 };
    static cilist io___21 = { 0, 6, 0, 0, 0 };



/*     reading the input deck: *COMPLEX FREQUENCY */





    /* Parameter adjustments */
    cs -= 18;
    --xboun;
    --ithermal;
    inp -= 4;
    ipoinp -= 3;
    --iperturb;
    --mei;
    textpart -= 132;
    --inpc;

    /* Function Body */
    mei[4] = 0;

    if (*istep < 1) {
	s_wsle(&io___1);
	do_lio(&c__9, &c__1, "*ERROR reading *COMPLEX FREQUENCY:", (ftnlen)34)
		;
	e_wsle();
	s_wsle(&io___2);
	do_lio(&c__9, &c__1, "       *COMPLEX FREQUENCY can only be used", (
		ftnlen)42);
	e_wsle();
	s_wsle(&io___3);
	do_lio(&c__9, &c__1, "       within a STEP", (ftnlen)20);
	e_wsle();
	*ier = 1;
	return 0;
    }

/*     no heat transfer analysis */

    if (ithermal[1] > 1) {
	ithermal[1] = 1;
    }

/*     check for cyclic symmetry */

    if (*mcs != 0 && cs[19] >= 0.) {
	*cyclicsymmetry = 1;
    }

    *nmethod = 0;
    i__1 = *n;
    for (i__ = 2; i__ <= i__1; ++i__) {
	if (s_cmp(textpart + i__ * 132, "CORIOLIS", (ftnlen)8, (ftnlen)8) == 
		0) {
	    *nmethod = 6;
	} else if (s_cmp(textpart + i__ * 132, "FLUTTER", (ftnlen)7, (ftnlen)
		7) == 0) {
	    *nmethod = 7;
	} else if (s_cmp(textpart + i__ * 132, "STORAGE=YES", (ftnlen)11, (
		ftnlen)11) == 0) {
	    s_wsle(&io___5);
	    do_lio(&c__9, &c__1, "*WARNING reading *COMPLEX FREQUENCY:", (
		    ftnlen)36);
	    e_wsle();
	    s_wsle(&io___6);
	    do_lio(&c__9, &c__1, "         for this keyword", (ftnlen)25);
	    e_wsle();
	    s_wsle(&io___7);
	    do_lio(&c__9, &c__1, "         STORAGE=YES is deactivated", (
		    ftnlen)35);
	    e_wsle();
	    s_wsle(&io___8);
	    do_lio(&c__9, &c__1, "         in the CalculiX code", (ftnlen)29);
	    e_wsle();
/*            mei(4)=1 */
	} else {
	    s_wsle(&io___9);
	    do_lio(&c__9, &c__1, "*WARNING reading *COMPLEX FREQUENCY:", (
		    ftnlen)36);
	    e_wsle();
	    s_wsle(&io___10);
	    do_lio(&c__9, &c__1, "         parameter not recognized:", (
		    ftnlen)34);
	    e_wsle();
	    s_wsle(&io___11);
	    do_lio(&c__9, &c__1, "         ", (ftnlen)9);
	    do_lio(&c__9, &c__1, textpart + i__ * 132, i_indx(textpart + i__ *
		     132, " ", (ftnlen)132, (ftnlen)1) - 1);
	    e_wsle();
	    inputwarning_(inpc + 1, ipoinpc, iline, "*COMPLEX FREQUENCY%", (
		    ftnlen)1, (ftnlen)19);
	}
    }
    if (*nmethod == 0) {
	s_wsle(&io___12);
	do_lio(&c__9, &c__1, "*ERROR reading *COMPLEX FREQUENCY:", (ftnlen)34)
		;
	e_wsle();
	s_wsle(&io___13);
	do_lio(&c__9, &c__1, "       either parameter CORIOLIS", (ftnlen)32);
	e_wsle();
	s_wsle(&io___14);
	do_lio(&c__9, &c__1, "       or parameter FLUTTER is required", (
		ftnlen)39);
	e_wsle();
	inputerror_(inpc + 1, ipoinpc, iline, "*COMPLEX FREQUENCY%", ier, (
		ftnlen)1, (ftnlen)19);
	return 0;
    }

    if (iperturb[1] > 1) {
	iperturb[1] = 0;
    }
    iperturb[2] = 0;

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);
    if (*istat < 0 || key == 1) {
	s_wsle(&io___16);
	do_lio(&c__9, &c__1, "*ERROR reading *COMPLEX FREQUENCY:", (ftnlen)34)
		;
	e_wsle();
	s_wsle(&io___17);
	do_lio(&c__9, &c__1, "       definition not complete", (ftnlen)30);
	e_wsle();
	s_wsle(&io___18);
	do_lio(&c__9, &c__1, "  ", (ftnlen)2);
	e_wsle();
	inputerror_(inpc + 1, ipoinpc, iline, "*COMPLEX FREQUENCY%", ier, (
		ftnlen)1, (ftnlen)19);
	return 0;
    }
    ici__1.icierr = 1;
    ici__1.iciend = 1;
    ici__1.icirnum = 1;
    ici__1.icirlen = 10;
    ici__1.iciunit = textpart + 132;
    ici__1.icifmt = "(i10)";
    *istat = s_rsfi(&ici__1);
    if (*istat != 0) {
	goto L100001;
    }
    *istat = do_fio(&c__1, (char *)&nev, (ftnlen)sizeof(integer));
    if (*istat != 0) {
	goto L100001;
    }
    *istat = e_rsfi();
L100001:
    if (*istat > 0) {
	inputerror_(inpc + 1, ipoinpc, iline, "*COMPLEX FREQUENCY%", ier, (
		ftnlen)1, (ftnlen)19);
	return 0;
    }
    if (nev <= 0) {
	s_wsle(&io___20);
	do_lio(&c__9, &c__1, "*ERROR reading *COMPLEX FREQUENCY:", (ftnlen)34)
		;
	e_wsle();
	s_wsle(&io___21);
	do_lio(&c__9, &c__1, "       less than 1 eigenvalue requested", (
		ftnlen)39);
	e_wsle();
	*ier = 1;
	return 0;
    }

    mei[1] = nev;

/*     removing nonzero boundary conditions */

    i__1 = *nboun;
    for (i__ = 1; i__ <= i__1; ++i__) {
	xboun[i__] = 0.;
    }

/*     correction for cyclic symmetric structures: */
/*     if the present step was not preceded by a frequency step */
/*     no nodal diameter has been selected. To make sure that */
/*     mastructcs is called instead of mastruct a fictitious */
/*     minimum nodal diameter is stored */

    if (*cyclicsymmetry == 1 && *mcs != 0 && cs[19] < 0.) {
	cs[19] = 0.;
    }

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

    return 0;
} /* complexfrequencys_ */

