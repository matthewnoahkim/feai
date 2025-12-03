/* designvariabless.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int designvariabless_(char *inpc, char *textpart, char *
	tieset, doublereal *tietol, integer *istep, integer *istat, integer *
	n, integer *iline, integer *ipol, integer *inl, integer *ipoinp, 
	integer *inp, integer *ntie, integer *ntie___, integer *ipoinpc, char 
	*set, integer *nset, integer *ier, ftnlen inpc_len, ftnlen 
	textpart_len, ftnlen tieset_len, ftnlen set_len)
{
    /* System generated locals */
    integer i__1;
    icilist ici__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void), s_cmp(char *, char *, ftnlen, ftnlen), s_rsfi(
	    icilist *), do_fio(integer *, char *, ftnlen), e_rsfi(void), 
	    i_indx(char *, char *, ftnlen, ftnlen);
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    integer i__, id;
    extern /* Subroutine */ int getnewline_(char *, char *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *, ftnlen, ftnlen), inputerror_(char *, 
	    integer *, integer *, char *, integer *, ftnlen, ftnlen);
    integer key, ipos;
    extern /* Subroutine */ int inputwarning_(char *, integer *, integer *, 
	    char *, ftnlen, ftnlen);
    integer itype;
    extern /* Subroutine */ int cident81_(char *, char *, integer *, integer *
	    , ftnlen, ftnlen);

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 6, 0, 0, 0 };
    static cilist io___2 = { 0, 6, 0, 0, 0 };
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___6 = { 0, 6, 0, 0, 0 };
    static cilist io___7 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___10 = { 0, 6, 0, 0, 0 };
    static cilist io___11 = { 0, 6, 0, 0, 0 };
    static cilist io___14 = { 0, 6, 0, 0, 0 };
    static cilist io___15 = { 0, 6, 0, 0, 0 };



/*     reading the input deck: *DESIGN VARIABLES */





/*     Check of correct position in Inputdeck */

    /* Parameter adjustments */
    set -= 81;
    inp -= 4;
    ipoinp -= 3;
    tietol -= 5;
    tieset -= 324;
    textpart -= 132;
    --inpc;

    /* Function Body */
    if (*istep > 0) {
	s_wsle(&io___1);
	do_lio(&c__9, &c__1, "*ERROR reading *DESIGN VARIABLES: *DESIGN VARI"
		"ABLES", (ftnlen)51);
	e_wsle();
	s_wsle(&io___2);
	do_lio(&c__9, &c__1, " should be placed before all step definitions", 
		(ftnlen)45);
	e_wsle();
	*ier = 1;
	return 0;
    }

/*     Check of correct number of ties */

    ++(*ntie);
    if (*ntie > *ntie___) {
	s_wsle(&io___3);
	do_lio(&c__9, &c__1, "*ERROR reading *DESIGN VARIABLES: increase nti"
		"e_", (ftnlen)48);
	e_wsle();
	*ier = 1;
	return 0;
    }

/*     Read in *DESIGN VARIABLES */

    itype = 0;
    i__1 = *n;
    for (i__ = 2; i__ <= i__1; ++i__) {
	if (s_cmp(textpart + i__ * 132, "TYPE=", (ftnlen)5, (ftnlen)5) == 0) {
	    ici__1.icierr = 1;
	    ici__1.iciend = 1;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 80;
	    ici__1.iciunit = textpart + (i__ * 132 + 5);
	    ici__1.icifmt = "(a80)";
	    *istat = s_rsfi(&ici__1);
	    if (*istat != 0) {
		goto L100001;
	    }
	    *istat = do_fio(&c__1, tieset + (*ntie * 3 + 1) * 81, (ftnlen)80);
	    if (*istat != 0) {
		goto L100001;
	    }
	    *istat = e_rsfi();
L100001:
	    if (*istat > 0) {
		inputerror_(inpc + 1, ipoinpc, iline, "*DESIGN VARIABLES%", 
			ier, (ftnlen)1, (ftnlen)18);
		return 0;
	    }
	    itype = 1;
	} else {
	    s_wsle(&io___6);
	    do_lio(&c__9, &c__1, "*WARNING reading *DESIGN VARIABLES: parame"
		    "ter not recognized:", (ftnlen)61);
	    e_wsle();
	    s_wsle(&io___7);
	    do_lio(&c__9, &c__1, "         ", (ftnlen)9);
	    do_lio(&c__9, &c__1, textpart + i__ * 132, i_indx(textpart + i__ *
		     132, " ", (ftnlen)132, (ftnlen)1) - 1);
	    e_wsle();
	    inputwarning_(inpc + 1, ipoinpc, iline, "*DESIGN VARIABLES%", (
		    ftnlen)1, (ftnlen)18);
	}
    }

    if (itype == 0) {
	s_wsle(&io___8);
	do_lio(&c__9, &c__1, "*ERROR reading *DESIGN VARIABLES: type is lack"
		"ing", (ftnlen)49);
	e_wsle();
	inputerror_(inpc + 1, ipoinpc, iline, "*DESIGN VARIABLES%", ier, (
		ftnlen)1, (ftnlen)18);
	return 0;
    }

/*     Add "D" at the end of the name of the designvariable keyword */

    *(unsigned char *)&tieset[(*ntie * 3 + 1) * 81 + 80] = 'D';

    if (s_cmp(tieset + (*ntie * 3 + 1) * 81, "COORDINATE", (ftnlen)10, (
	    ftnlen)10) == 0) {
	getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, 
		inl, &ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);
	if (*istat < 0 || key == 1) {
	    s_wsle(&io___10);
	    do_lio(&c__9, &c__1, "*ERROR reading *DESIGN VARIABLES: definiti"
		    "on", (ftnlen)44);
	    e_wsle();
	    s_wsle(&io___11);
	    do_lio(&c__9, &c__1, "      is not complete.", (ftnlen)22);
	    e_wsle();
	    *ier = 1;
	    return 0;
	}

/*        Read the name of the design variable node set */

	s_copy(tieset + (*ntie * 3 + 2) * 81, textpart + 132, (ftnlen)81, (
		ftnlen)81);
	ipos = i_indx(tieset + (*ntie * 3 + 2) * 81, " ", (ftnlen)81, (ftnlen)
		1);
	*(unsigned char *)&tieset[(*ntie * 3 + 2) * 81 + (ipos - 1)] = 'N';

/*        Check existence of the node set */

	cident81_(set + 81, tieset + (*ntie * 3 + 2) * 81, nset, &id, (ftnlen)
		81, (ftnlen)81);
	i__ = *nset + 1;
	if (id > 0) {
	    if (s_cmp(tieset + (*ntie * 3 + 2) * 81, set + id * 81, (ftnlen)
		    81, (ftnlen)81) == 0) {
		i__ = id;
	    }
	}
	if (i__ > *nset) {
	    s_wsle(&io___14);
	    do_lio(&c__9, &c__1, "*ERROR reading *DESIGN VARIABLES", (ftnlen)
		    32);
	    e_wsle();
	    s_wsle(&io___15);
	    do_lio(&c__9, &c__1, "node set ", (ftnlen)9);
	    do_lio(&c__9, &c__1, tieset + (*ntie * 3 + 2) * 81, ipos - 1);
	    do_lio(&c__9, &c__1, "does not exist. Card image:", (ftnlen)27);
	    e_wsle();
	    inputerror_(inpc + 1, ipoinpc, iline, "*DESIGN VARIABLES%", ier, (
		    ftnlen)1, (ftnlen)18);
	    return 0;
	}
    }

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

    return 0;
} /* designvariabless_ */

