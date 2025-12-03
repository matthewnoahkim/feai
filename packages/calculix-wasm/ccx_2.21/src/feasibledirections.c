/* feasibledirections.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int feasibledirections_(char *inpc, char *textpart, integer *
	istat, integer *n, integer *key, integer *iline, integer *ipol, 
	integer *inl, integer *ipoinp, integer *inp, integer *ipoinpc, 
	integer *nmethod, integer *istep, integer *ier, doublereal *tmax, 
	doublereal *tinc, ftnlen inpc_len, ftnlen textpart_len)
{
    /* System generated locals */
    integer i__1;
    icilist ici__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void), s_cmp(char *, char *, ftnlen, ftnlen), s_rsfi(
	    icilist *), do_fio(integer *, char *, ftnlen), e_rsfi(void);

    /* Local variables */
    integer i__;
    extern /* Subroutine */ int getnewline_(char *, char *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *, ftnlen, ftnlen), inputerror_(char *, 
	    integer *, integer *, char *, integer *, ftnlen, ftnlen), 
	    inputwarning_(char *, integer *, integer *, char *, ftnlen, 
	    ftnlen);

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
    static cilist io___15 = { 0, 6, 0, 0, 0 };
    static cilist io___16 = { 0, 6, 0, 0, 0 };
    static cilist io___17 = { 0, 6, 0, 0, 0 };
    static cilist io___18 = { 0, 6, 0, 0, 0 };
    static cilist io___19 = { 0, 6, 0, 0, 0 };
    static cilist io___20 = { 0, 6, 0, 0, 0 };



/*     reading the input deck: *FEASIBLE DIRECTION */





    /* Parameter adjustments */
    inp -= 4;
    ipoinp -= 3;
    textpart -= 132;
    --inpc;

    /* Function Body */
    *tmax = 0.;
    *tinc = -1.;

    if (*istep < 1) {
	s_wsle(&io___1);
	do_lio(&c__9, &c__1, "*ERROR reading *FEASIBLE DIRECTION:", (ftnlen)
		35);
	e_wsle();
	s_wsle(&io___2);
	do_lio(&c__9, &c__1, "       *FEASIBLE DIRECTION can only be used", (
		ftnlen)43);
	e_wsle();
	s_wsle(&io___3);
	do_lio(&c__9, &c__1, "       within a STEP", (ftnlen)20);
	e_wsle();
	*ier = 1;
	return 0;
    }

    *nmethod = 16;

/*     read optimization method */
/*     tmax=1.5: Gradient Descent Akin Method (GDAM, default) */
/*     tmax=2.5: Gradient Projection Method (GPM) */

    i__1 = *n;
    for (i__ = 2; i__ <= i__1; ++i__) {
	if (s_cmp(textpart + i__ * 132, "METHOD=", (ftnlen)7, (ftnlen)7) == 0)
		 {
	    if (s_cmp(textpart + (i__ * 132 + 7), "GRADIENTDESCENT", (ftnlen)
		    15, (ftnlen)15) == 0) {
		*tmax = 1.5f;
	    } else if (s_cmp(textpart + (i__ * 132 + 7), "GRADIENTPROJECTION",
		     (ftnlen)18, (ftnlen)18) == 0) {
		*tmax = 2.5f;
	    } else {
		s_wsle(&io___5);
		e_wsle();
		s_wsle(&io___6);
		do_lio(&c__9, &c__1, "*WARNING reading *FEASIBLE DIRECTION; ",
			 (ftnlen)38);
		e_wsle();
		s_wsle(&io___7);
		do_lio(&c__9, &c__1, "         Method for computation of ", (
			ftnlen)35);
		e_wsle();
		s_wsle(&io___8);
		do_lio(&c__9, &c__1, "         *FEASIBLE DIRECTION not valid;"
			, (ftnlen)39);
		e_wsle();
		s_wsle(&io___9);
		do_lio(&c__9, &c__1, "         Gradient Descent taken as def"
			"ault", (ftnlen)42);
		e_wsle();
		s_wsle(&io___10);
		do_lio(&c__9, &c__1, " ", (ftnlen)1);
		e_wsle();
		inputwarning_(inpc + 1, ipoinpc, iline, "*FEASIBLEDIRECTION%",
			 (ftnlen)1, (ftnlen)19);
	    }
	}
    }

    if (*tmax < 1.) {
	*tmax = 1.5f;
	s_wsle(&io___11);
	e_wsle();
	s_wsle(&io___12);
	do_lio(&c__9, &c__1, "*WARNING reading *FEASIBLE DIRECTION; ", (
		ftnlen)38);
	e_wsle();
	s_wsle(&io___13);
	do_lio(&c__9, &c__1, "         Method for computation of ", (ftnlen)
		35);
	e_wsle();
	s_wsle(&io___14);
	do_lio(&c__9, &c__1, "         *FEASIBLE DIRECTION not specified;", (
		ftnlen)43);
	e_wsle();
	s_wsle(&io___15);
	do_lio(&c__9, &c__1, "         Gradient Descent taken as default", (
		ftnlen)42);
	e_wsle();
	s_wsle(&io___16);
	do_lio(&c__9, &c__1, " ", (ftnlen)1);
	e_wsle();
	inputwarning_(inpc + 1, ipoinpc, iline, "*FEASIBLEDIRECTION%", (
		ftnlen)1, (ftnlen)19);
    }

    getnewline_(inpc + 1, textpart + 132, istat, n, key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);
    if (*istat < 0 || *key == 1) {
	s_wsle(&io___17);
	do_lio(&c__9, &c__1, "*ERROR reading *FEASIBLE DIRECTION", (ftnlen)34)
		;
	e_wsle();
	s_wsle(&io___18);
	do_lio(&c__9, &c__1, "       no size of mesh modification specified", 
		(ftnlen)45);
	e_wsle();
	*ier = 1;
	return 0;
    }

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
    *istat = do_fio(&c__1, (char *)&(*tinc), (ftnlen)sizeof(doublereal));
    if (*istat != 0) {
	goto L100001;
    }
    *istat = e_rsfi();
L100001:
    if (*istat > 0) {
	inputerror_(inpc + 1, ipoinpc, iline, "*FEASIBLE DIRECTION%", ier, (
		ftnlen)1, (ftnlen)20);
	return 0;
    }

/*     tinc is the maximum size of the requested mesh modification */
/*     for optimization */

    if (*tinc <= 0.) {
	s_wsle(&io___19);
	do_lio(&c__9, &c__1, "*ERROR reading *FEASIBLE DIRECTION", (ftnlen)34)
		;
	e_wsle();
	s_wsle(&io___20);
	do_lio(&c__9, &c__1, "       no size of mesh modification specified", 
		(ftnlen)45);
	e_wsle();
	*ier = 1;
	return 0;
    }

    getnewline_(inpc + 1, textpart + 132, istat, n, key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

    return 0;
} /* feasibledirections_ */

