/* ties.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int ties_(char *inpc, char *textpart, char *tieset, 
	doublereal *tietol, integer *istep, integer *istat, integer *n, 
	integer *iline, integer *ipol, integer *inl, integer *ipoinp, integer 
	*inp, integer *ntie, integer *ntie___, integer *ipoinpc, integer *ier,
	 ftnlen inpc_len, ftnlen textpart_len, ftnlen tieset_len)
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
    integer i__;
    extern /* Subroutine */ int getnewline_(char *, char *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *, ftnlen, ftnlen);
    logical multistage;
    extern /* Subroutine */ int inputerror_(char *, integer *, integer *, 
	    char *, integer *, ftnlen, ftnlen);
    integer key;
    logical tied;
    integer ipos;
    extern /* Subroutine */ int inputwarning_(char *, integer *, integer *, 
	    char *, ftnlen, ftnlen);

    /* Fortran I/O blocks */
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___4 = { 0, 6, 0, 0, 0 };
    static cilist io___5 = { 0, 6, 0, 0, 0 };
    static cilist io___7 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___11 = { 0, 6, 0, 0, 0 };
    static cilist io___12 = { 0, 6, 0, 0, 0 };



/*     reading the input deck: *TIE */






    /* Parameter adjustments */
    inp -= 4;
    ipoinp -= 3;
    tietol -= 5;
    tieset -= 324;
    textpart -= 132;
    --inpc;

    /* Function Body */
    multistage = FALSE_;
    tied = TRUE_;

    if (*istep > 0) {
	s_wsle(&io___3);
	do_lio(&c__9, &c__1, "*ERROR reading *TIE: *TIE should", (ftnlen)32);
	e_wsle();
	s_wsle(&io___4);
	do_lio(&c__9, &c__1, "  be placed before all step definitions", (
		ftnlen)39);
	e_wsle();
	*ier = 1;
	return 0;
    }

    ++(*ntie);
    if (*ntie > *ntie___) {
	s_wsle(&io___5);
	do_lio(&c__9, &c__1, "*ERROR reading *TIE: increase ntie_", (ftnlen)
		35);
	e_wsle();
	*ier = 1;
	return 0;
    }

    tietol[(*ntie << 2) + 1] = -1.;
    tietol[(*ntie << 2) + 2] = 1.;
    *(unsigned char *)&tieset[(*ntie * 3 + 1) * 81] = ' ';

    i__1 = *n;
    for (i__ = 2; i__ <= i__1; ++i__) {
	if (s_cmp(textpart + i__ * 132, "POSITIONTOLERANCE=", (ftnlen)18, (
		ftnlen)18) == 0) {
	    ici__1.icierr = 1;
	    ici__1.iciend = 1;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 20;
	    ici__1.iciunit = textpart + (i__ * 132 + 18);
	    ici__1.icifmt = "(f20.0)";
	    *istat = s_rsfi(&ici__1);
	    if (*istat != 0) {
		goto L100001;
	    }
	    *istat = do_fio(&c__1, (char *)&tietol[(*ntie << 2) + 1], (ftnlen)
		    sizeof(doublereal));
	    if (*istat != 0) {
		goto L100001;
	    }
	    *istat = e_rsfi();
L100001:
	    if (*istat > 0) {
		inputerror_(inpc + 1, ipoinpc, iline, "*TIE%", ier, (ftnlen)1,
			 (ftnlen)5);
		return 0;
	    }
	} else if (s_cmp(textpart + i__ * 132, "NAME=", (ftnlen)5, (ftnlen)5) 
		== 0) {
	    ici__1.icierr = 1;
	    ici__1.iciend = 1;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 80;
	    ici__1.iciunit = textpart + (i__ * 132 + 5);
	    ici__1.icifmt = "(a80)";
	    *istat = s_rsfi(&ici__1);
	    if (*istat != 0) {
		goto L100002;
	    }
	    *istat = do_fio(&c__1, tieset + (*ntie * 3 + 1) * 81, (ftnlen)80);
	    if (*istat != 0) {
		goto L100002;
	    }
	    *istat = e_rsfi();
L100002:
	    if (*istat > 0) {
		inputerror_(inpc + 1, ipoinpc, iline, "*TIE%", ier, (ftnlen)1,
			 (ftnlen)5);
		return 0;
	    }
	} else if (s_cmp(textpart + i__ * 132, "CYCLICSYMMETRY", (ftnlen)14, (
		ftnlen)14) == 0) {
	    tied = FALSE_;
	} else if (s_cmp(textpart + i__ * 132, "MULTISTAGE", (ftnlen)10, (
		ftnlen)10) == 0) {
	    multistage = TRUE_;
	    tied = FALSE_;
	} else if (s_cmp(textpart + i__ * 132, "ADJUST=NO", (ftnlen)9, (
		ftnlen)9) == 0) {
	    tietol[(*ntie << 2) + 2] = -1.;
	} else {
	    s_wsle(&io___7);
	    do_lio(&c__9, &c__1, "*WARNING reading *TIE: parameter not recog"
		    "nized:", (ftnlen)48);
	    e_wsle();
	    s_wsle(&io___8);
	    do_lio(&c__9, &c__1, "         ", (ftnlen)9);
	    do_lio(&c__9, &c__1, textpart + i__ * 132, i_indx(textpart + i__ *
		     132, " ", (ftnlen)132, (ftnlen)1) - 1);
	    e_wsle();
	    inputwarning_(inpc + 1, ipoinpc, iline, "*TIE%", (ftnlen)1, (
		    ftnlen)5);
	}
    }
    if (*(unsigned char *)&tieset[(*ntie * 3 + 1) * 81] == ' ') {
	s_wsle(&io___9);
	do_lio(&c__9, &c__1, "*ERROR reading *TIE: tie name is lacking", (
		ftnlen)40);
	e_wsle();
	inputerror_(inpc + 1, ipoinpc, iline, "*TIE%", ier, (ftnlen)1, (
		ftnlen)5);
	return 0;
    }

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);
    if (*istat < 0 || key == 1) {
	s_wsle(&io___11);
	do_lio(&c__9, &c__1, "*ERROR reading *TIE: definition of the tie", (
		ftnlen)42);
	e_wsle();
	s_wsle(&io___12);
	do_lio(&c__9, &c__1, "      is not complete.", (ftnlen)22);
	e_wsle();
	*ier = 1;
	return 0;
    }

    if (multistage) {
	*(unsigned char *)&tieset[(*ntie * 3 + 1) * 81 + 80] = 'M';
    } else if (tied) {
	*(unsigned char *)&tieset[(*ntie * 3 + 1) * 81 + 80] = 'T';
    } else {
	*(unsigned char *)&tieset[(*ntie * 3 + 1) * 81 + 80] = ' ';
    }

    if (tied) {

/*        slave surface can be nodal or facial */

	s_copy(tieset + (*ntie * 3 + 2) * 81, textpart + 132, (ftnlen)80, (
		ftnlen)80);
	*(unsigned char *)&tieset[(*ntie * 3 + 2) * 81 + 80] = ' ';

/*        master surface must be facial */

	s_copy(tieset + (*ntie * 3 + 3) * 81, textpart + 264, (ftnlen)80, (
		ftnlen)80);
	*(unsigned char *)&tieset[(*ntie * 3 + 3) * 81 + 80] = ' ';
	ipos = i_indx(tieset + (*ntie * 3 + 3) * 81, " ", (ftnlen)81, (ftnlen)
		1);
	*(unsigned char *)&tieset[(*ntie * 3 + 3) * 81 + (ipos - 1)] = 'T';
    } else if (multistage) {

/*        slave and master surface must be nodal */

	s_copy(tieset + (*ntie * 3 + 2) * 81, textpart + 132, (ftnlen)80, (
		ftnlen)80);
	*(unsigned char *)&tieset[(*ntie * 3 + 2) * 81 + 80] = ' ';
	ipos = i_indx(tieset + (*ntie * 3 + 2) * 81, " ", (ftnlen)81, (ftnlen)
		1);
	*(unsigned char *)&tieset[(*ntie * 3 + 2) * 81 + (ipos - 1)] = 'S';

	s_copy(tieset + (*ntie * 3 + 3) * 81, textpart + 264, (ftnlen)80, (
		ftnlen)80);
	*(unsigned char *)&tieset[(*ntie * 3 + 3) * 81 + 80] = ' ';
	ipos = i_indx(tieset + (*ntie * 3 + 3) * 81, " ", (ftnlen)81, (ftnlen)
		1);
	*(unsigned char *)&tieset[(*ntie * 3 + 3) * 81 + (ipos - 1)] = 'S';
    } else {

/*        cyclic symmetry tie */
/*        slave and master surface may be nodal or facial */

	s_copy(tieset + (*ntie * 3 + 2) * 81, textpart + 132, (ftnlen)80, (
		ftnlen)80);
	*(unsigned char *)&tieset[(*ntie * 3 + 2) * 81 + 80] = ' ';

	s_copy(tieset + (*ntie * 3 + 3) * 81, textpart + 264, (ftnlen)80, (
		ftnlen)80);
	*(unsigned char *)&tieset[(*ntie * 3 + 3) * 81 + 80] = ' ';
    }

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

    return 0;
} /* ties_ */

