/* filters.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int filters_(char *inpc, char *textpart, integer *istep, 
	integer *istat, integer *n, integer *iline, integer *ipol, integer *
	inl, integer *ipoinp, integer *inp, integer *ipoinpc, char *objectset,
	 integer *ier, integer *nobject, integer *nmethod, ftnlen inpc_len, 
	ftnlen textpart_len, ftnlen objectset_len)
{
    /* System generated locals */
    integer i__1;
    icilist ici__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void), s_cmp(char *, char *, ftnlen, ftnlen);
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);
    integer i_indx(char *, char *, ftnlen, ftnlen), s_rsfi(icilist *), do_fio(
	    integer *, char *, ftnlen), e_rsfi(void);

    /* Local variables */
    integer boundact, i__, filteract;
    extern /* Subroutine */ int getnewline_(char *, char *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *, ftnlen, ftnlen), inputerror_(char *, 
	    integer *, integer *, char *, integer *, ftnlen, ftnlen);
    integer key;
    extern /* Subroutine */ int inputwarning_(char *, integer *, integer *, 
	    char *, ftnlen, ftnlen);
    doublereal radius;

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 6, 0, 0, 0 };
    static cilist io___2 = { 0, 6, 0, 0, 0 };
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___4 = { 0, 6, 0, 0, 0 };
    static cilist io___5 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___10 = { 0, 6, 0, 0, 0 };
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
    static cilist io___24 = { 0, 6, 0, 0, 0 };
    static cilist io___25 = { 0, 6, 0, 0, 0 };
    static cilist io___26 = { 0, 6, 0, 0, 0 };
    static cilist io___27 = { 0, 6, 0, 0, 0 };



/*     reading the input deck: *FILTER */

/*     options: TYPE */
/*              BOUNDARY WEIGHTING */
/*              EDGE PRESERVATION */
/*              DIRECTION WEIGHTING */





/*      if(istep.lt.1) then */
    /* Parameter adjustments */
    objectset -= 486;
    inp -= 4;
    ipoinp -= 3;
    textpart -= 132;
    --inpc;

    /* Function Body */
    if (*nmethod != 12) {
	s_wsle(&io___1);
	do_lio(&c__9, &c__1, "*ERROR reading *FILTER: *FILTER can           "
		"      only be used within a SENSITIVITY STEP", (ftnlen)90);
	e_wsle();
	*ier = 1;
	return 0;
    }

    if (*nobject == 0) {
	s_wsle(&io___2);
	do_lio(&c__9, &c__1, "*ERROR reading *FILTER: at least one", (ftnlen)
		36);
	e_wsle();
	s_wsle(&io___3);
	do_lio(&c__9, &c__1, "       *DESIGN RESPONSE must have been", (
		ftnlen)38);
	e_wsle();
	s_wsle(&io___4);
	do_lio(&c__9, &c__1, "       defined before the definition of", (
		ftnlen)39);
	e_wsle();
	s_wsle(&io___5);
	do_lio(&c__9, &c__1, "       a filter", (ftnlen)15);
	e_wsle();
	*ier = 1;
	return 0;
    }

    boundact = 0;
    filteract = 0;

    i__1 = *n;
    for (i__ = 2; i__ <= i__1; ++i__) {

/*        reading filter options: */

/*        type of filter */

	if (s_cmp(textpart + i__ * 132, "TYPE=", (ftnlen)5, (ftnlen)5) == 0) {
	    s_copy(objectset + 567, textpart + (i__ * 132 + 5), (ftnlen)5, (
		    ftnlen)5);
	    filteract = 1;

/*        boundary weighting activated */

	} else if (s_cmp(textpart + i__ * 132, "BOUNDARYWEIGHTING=", (ftnlen)
		18, (ftnlen)18) == 0) {
	    if (s_cmp(textpart + (i__ * 132 + 18), "YES", (ftnlen)3, (ftnlen)
		    3) == 0) {
		boundact = 1;
		s_copy(objectset + 572, "BOU", (ftnlen)3, (ftnlen)3);
	    } else {
		boundact = 0;
	    }

/*        edge weighting activated */

	} else if (s_cmp(textpart + i__ * 132, "EDGEPRESERVATION=", (ftnlen)
		17, (ftnlen)17) == 0) {
	    if (s_cmp(textpart + (i__ * 132 + 17), "YES", (ftnlen)3, (ftnlen)
		    3) == 0) {
		s_copy(objectset + 576, "EDG", (ftnlen)3, (ftnlen)3);
	    }

/*        direction weighting activated */

	} else if (s_cmp(textpart + i__ * 132, "DIRECTIONWEIGHTING=", (ftnlen)
		19, (ftnlen)19) == 0) {
	    if (s_cmp(textpart + (i__ * 132 + 19), "YES", (ftnlen)3, (ftnlen)
		    3) == 0) {
		s_copy(objectset + 580, "DIR", (ftnlen)3, (ftnlen)3);
	    }

/*        parameter not recognized */

	} else {
	    s_wsle(&io___9);
	    do_lio(&c__9, &c__1, "*WARNING reading *FILTER: parameter not re"
		    "cognized:", (ftnlen)51);
	    e_wsle();
	    s_wsle(&io___10);
	    do_lio(&c__9, &c__1, "         ", (ftnlen)9);
	    do_lio(&c__9, &c__1, textpart + i__ * 132, i_indx(textpart + i__ *
		     132, " ", (ftnlen)132, (ftnlen)1) - 1);
	    e_wsle();
	    inputwarning_(inpc + 1, ipoinpc, iline, "*FILTER%", (ftnlen)1, (
		    ftnlen)8);
	}
    }

/*     reading the radii */

    if (filteract == 1 || boundact == 1) {

	getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, 
		inl, &ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

/*     reading in the filter radius */

	if (filteract == 1) {
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
	    *istat = do_fio(&c__1, (char *)&radius, (ftnlen)sizeof(doublereal)
		    );
	    if (*istat != 0) {
		goto L100001;
	    }
	    *istat = e_rsfi();
L100001:
	    if (*istat > 0) {
		inputerror_(inpc + 1, ipoinpc, iline, "*FILTER%", ier, (
			ftnlen)1, (ftnlen)8);
		return 0;
	    }
	    if (radius < 0.) {
		s_wsle(&io___13);
		do_lio(&c__9, &c__1, "*ERROR reading *FILTER", (ftnlen)22);
		e_wsle();
		s_wsle(&io___14);
		do_lio(&c__9, &c__1, "       Radius of the sensitivity", (
			ftnlen)32);
		e_wsle();
		s_wsle(&io___15);
		do_lio(&c__9, &c__1, "       filter cannot be less than 0", (
			ftnlen)35);
		e_wsle();
		s_wsle(&io___16);
		e_wsle();
		inputerror_(inpc + 1, ipoinpc, iline, "*FILTER%", ier, (
			ftnlen)1, (ftnlen)8);
		return 0;
	    }
	    s_copy(objectset + 587, textpart + 132, (ftnlen)20, (ftnlen)20);
	}

/*     reading in the radius for boundary weighting */

	if (*n == 2 && boundact == 1) {
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
	    *istat = do_fio(&c__1, (char *)&radius, (ftnlen)sizeof(doublereal)
		    );
	    if (*istat != 0) {
		goto L100002;
	    }
	    *istat = e_rsfi();
L100002:
	    if (*istat > 0) {
		inputerror_(inpc + 1, ipoinpc, iline, "*FILTER%", ier, (
			ftnlen)1, (ftnlen)8);
		return 0;
	    }
	    if (radius < 0.) {
		s_wsle(&io___17);
		do_lio(&c__9, &c__1, "*ERROR reading *FILTER", (ftnlen)22);
		e_wsle();
		s_wsle(&io___18);
		do_lio(&c__9, &c__1, "       Radius for the boundary", (
			ftnlen)30);
		e_wsle();
		s_wsle(&io___19);
		do_lio(&c__9, &c__1, "       weighting cannot be less", (
			ftnlen)31);
		e_wsle();
		s_wsle(&io___20);
		do_lio(&c__9, &c__1, "       than 0", (ftnlen)13);
		e_wsle();
		s_wsle(&io___21);
		e_wsle();
		inputerror_(inpc + 1, ipoinpc, iline, "*FILTER%", ier, (
			ftnlen)1, (ftnlen)8);
		return 0;
	    }
	    s_copy(objectset + 506, textpart + 264, (ftnlen)20, (ftnlen)20);
	} else if (*n == 1 && boundact == 1) {
	    s_wsle(&io___22);
	    do_lio(&c__9, &c__1, "*WARNING reading *FILTER:", (ftnlen)25);
	    e_wsle();
	    s_wsle(&io___23);
	    do_lio(&c__9, &c__1, "         boundary weighting activated", (
		    ftnlen)37);
	    e_wsle();
	    s_wsle(&io___24);
	    do_lio(&c__9, &c__1, "         but no radius defined", (ftnlen)30)
		    ;
	    e_wsle();
	    s_wsle(&io___25);
	    do_lio(&c__9, &c__1, "         The radius of the sensitivity", (
		    ftnlen)38);
	    e_wsle();
	    s_wsle(&io___26);
	    do_lio(&c__9, &c__1, "         filter will be taken", (ftnlen)29);
	    e_wsle();
	    s_wsle(&io___27);
	    e_wsle();
	    inputwarning_(inpc + 1, ipoinpc, iline, "*FILTER%", (ftnlen)1, (
		    ftnlen)8);
	    s_copy(objectset + 506, objectset + 587, (ftnlen)20, (ftnlen)20);
	}

	getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, 
		inl, &ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

    } else {
	getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, 
		inl, &ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);
    }

    return 0;
} /* filters_ */

