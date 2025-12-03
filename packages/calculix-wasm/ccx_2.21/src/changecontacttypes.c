/* changecontacttypes.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int changecontacttypes_(char *inpc, char *textpart, integer *
	istep, integer *istat, integer *n, integer *iline, integer *ipol, 
	integer *inl, integer *ipoinp, integer *inp, integer *iperturb, 
	integer *ipoinpc, integer *mortar, integer *ier, integer *iexpl, 
	integer *nmethod, ftnlen inpc_len, ftnlen textpart_len)
{
    /* System generated locals */
    integer i__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void), s_cmp(char *, char *, ftnlen, ftnlen), i_indx(char *
	    , char *, ftnlen, ftnlen);

    /* Local variables */
    integer i__;
    extern /* Subroutine */ int getnewline_(char *, char *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *, ftnlen, ftnlen);
    integer key;
    extern /* Subroutine */ int inputwarning_(char *, integer *, integer *, 
	    char *, ftnlen, ftnlen);

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 6, 0, 0, 0 };
    static cilist io___2 = { 0, 6, 0, 0, 0 };
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___4 = { 0, 6, 0, 0, 0 };
    static cilist io___5 = { 0, 6, 0, 0, 0 };
    static cilist io___6 = { 0, 6, 0, 0, 0 };
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
    static cilist io___21 = { 0, 6, 0, 0, 0 };
    static cilist io___22 = { 0, 6, 0, 0, 0 };
    static cilist io___23 = { 0, 6, 0, 0, 0 };



/*     reading the input deck: *CHANGE CONTACT TYPE */




    /* Parameter adjustments */
    --iperturb;
    inp -= 4;
    ipoinp -= 3;
    textpart -= 132;
    --inpc;

    /* Function Body */
    if (*istep < 1) {
	s_wsle(&io___1);
	do_lio(&c__9, &c__1, "*ERROR reading *CHANGE CONTACT TYPE:", (ftnlen)
		36);
	e_wsle();
	s_wsle(&io___2);
	do_lio(&c__9, &c__1, "       *CHANGE CONTACT TYPE can only be used", (
		ftnlen)44);
	e_wsle();
	s_wsle(&io___3);
	do_lio(&c__9, &c__1, "       within a STEP", (ftnlen)20);
	e_wsle();
	*ier = 1;
	return 0;
    }

    if (*nmethod != 4 || iperturb[1] <= 1) {
	s_wsle(&io___4);
	do_lio(&c__9, &c__1, "*ERROR reading *CHANGE CONTACT TYPE:", (ftnlen)
		36);
	e_wsle();
	s_wsle(&io___5);
	do_lio(&c__9, &c__1, "       *CHANGE CONTACT TYPE can only be used", (
		ftnlen)44);
	e_wsle();
	s_wsle(&io___6);
	do_lio(&c__9, &c__1, "       in a nonmodal dynamic step", (ftnlen)33);
	e_wsle();
	*ier = 1;
	return 0;
    }

    i__1 = *n;
    for (i__ = 2; i__ <= i__1; ++i__) {
	if (s_cmp(textpart + i__ * 132, "TONODETOSURFACE", (ftnlen)15, (
		ftnlen)15) == 0) {
	    *mortar = 0;
	} else if (s_cmp(textpart + i__ * 132, "TOMASSLESS", (ftnlen)12, (
		ftnlen)10) == 0) {
	    if (*iexpl <= 1) {
		s_wsle(&io___8);
		do_lio(&c__9, &c__1, "*ERROR reading *CHANGE CONTACT TYPE:", (
			ftnlen)36);
		e_wsle();
		s_wsle(&io___9);
		do_lio(&c__9, &c__1, "       *CHANGE CONTACT TYPE,TO MASSLESS"
			, (ftnlen)39);
		e_wsle();
		s_wsle(&io___10);
		do_lio(&c__9, &c__1, "       can only be used in explicit dy"
			"namics", (ftnlen)44);
		e_wsle();
		*ier = 1;
		return 0;
	    }
	    *mortar = -1;
	} else {
	    s_wsle(&io___11);
	    do_lio(&c__9, &c__1, "*WARNING reading *CHANGE CONTACT TYPE:", (
		    ftnlen)38);
	    e_wsle();
	    s_wsle(&io___12);
	    do_lio(&c__9, &c__1, "         parameter not recognized:", (
		    ftnlen)34);
	    e_wsle();
	    s_wsle(&io___13);
	    do_lio(&c__9, &c__1, "         ", (ftnlen)9);
	    do_lio(&c__9, &c__1, textpart + i__ * 132, i_indx(textpart + i__ *
		     132, " ", (ftnlen)132, (ftnlen)1) - 1);
	    e_wsle();
	    inputwarning_(inpc + 1, ipoinpc, iline, "*CONTACT PAIR%", (ftnlen)
		    1, (ftnlen)14);
	}
    }

    s_wsle(&io___14);
    do_lio(&c__9, &c__1, "*INFO reading *CHANGE CONTACT TYPE:", (ftnlen)35);
    e_wsle();
    s_wsle(&io___15);
    do_lio(&c__9, &c__1, "      actual contact type:", (ftnlen)26);
    e_wsle();
    if (*mortar == -1) {
	s_wsle(&io___16);
	do_lio(&c__9, &c__1, "      MASSLESS", (ftnlen)14);
	e_wsle();
    } else if (*mortar == 0) {
	s_wsle(&io___17);
	do_lio(&c__9, &c__1, "      NODE TO SURFACE", (ftnlen)21);
	e_wsle();
    } else if (*mortar == 1) {
	s_wsle(&io___18);
	do_lio(&c__9, &c__1, "      SURFACE TO SURFACE", (ftnlen)24);
	e_wsle();
    } else if (*mortar == 2) {
	s_wsle(&io___19);
	do_lio(&c__9, &c__1, "      MORTAR", (ftnlen)12);
	e_wsle();
    } else if (*mortar == 3) {
	s_wsle(&io___20);
	do_lio(&c__9, &c__1, "      LINMORTAR", (ftnlen)15);
	e_wsle();
    } else if (*mortar == 4) {
	s_wsle(&io___21);
	do_lio(&c__9, &c__1, "      PGLINMORTAR", (ftnlen)17);
	e_wsle();
    } else if (*mortar == 5) {
	s_wsle(&io___22);
	do_lio(&c__9, &c__1, "      PGMORTAR", (ftnlen)14);
	e_wsle();
    }
    s_wsle(&io___23);
    e_wsle();

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

    return 0;
} /* changecontacttypes_ */

