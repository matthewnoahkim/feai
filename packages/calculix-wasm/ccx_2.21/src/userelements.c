/* userelements.f -- translated by f2c (version 20200916).
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

static integer c__1 = 1;
static integer c__9 = 9;
static integer c__3 = 3;


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

/* Subroutine */ int userelements_(char *textpart, integer *n, integer *iuel, 
	integer *nuel, char *inpc, integer *ipoinpc, integer *iline, integer *
	ier, integer *ipoinp, integer *inp, integer *inl, integer *ipol, 
	ftnlen textpart_len, ftnlen inpc_len)
{
    /* System generated locals */
    integer i__1;
    icilist ici__1;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen), s_rsfi(icilist *), do_fio(
	    integer *, char *, ftnlen), e_rsfi(void), s_wsle(cilist *), 
	    do_lio(integer *, integer *, char *, ftnlen), e_wsle(void);

    /* Local variables */
    integer i__, j, intpoints, id;
    extern /* Subroutine */ int inputerror_(char *, integer *, integer *, 
	    char *, integer *, ftnlen, ftnlen);
    integer four, nodes, istat, maxdof, number;
    extern /* Subroutine */ int nidentk_(integer *, integer *, integer *, 
	    integer *, integer *);

    /* Fortran I/O blocks */
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___10 = { 0, 6, 0, 0, 0 };
    static cilist io___11 = { 0, 6, 0, 0, 0 };
    static cilist io___12 = { 0, 6, 0, 0, 0 };
    static cilist io___13 = { 0, 6, 0, 0, 0 };
    static cilist io___15 = { 0, 6, 0, 0, 0 };
    static cilist io___16 = { 0, 6, 0, 0, 0 };



/*     reading the input deck: *USER ELEMENT */




    /* Parameter adjustments */
    inp -= 4;
    ipoinp -= 3;
    --inpc;
    iuel -= 5;
    textpart -= 132;

    /* Function Body */
    four = 4;

    i__1 = *n;
    for (i__ = 2; i__ <= i__1; ++i__) {
	if (s_cmp(textpart + i__ * 132, "TYPE=U", (ftnlen)6, (ftnlen)6) == 0) 
		{
	    number = (*(unsigned char *)&textpart[i__ * 132 + 6] << 24) + (*(
		    unsigned char *)&textpart[i__ * 132 + 7] << 16) + (*(
		    unsigned char *)&textpart[i__ * 132 + 8] << 8) + *(
		    unsigned char *)&textpart[i__ * 132 + 9];
	} else if (s_cmp(textpart + i__ * 132, "NODES=", (ftnlen)6, (ftnlen)6)
		 == 0) {
	    ici__1.icierr = 1;
	    ici__1.iciend = 1;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 10;
	    ici__1.iciunit = textpart + (i__ * 132 + 6);
	    ici__1.icifmt = "(i10)";
	    istat = s_rsfi(&ici__1);
	    if (istat != 0) {
		goto L100001;
	    }
	    istat = do_fio(&c__1, (char *)&nodes, (ftnlen)sizeof(integer));
	    if (istat != 0) {
		goto L100001;
	    }
	    istat = e_rsfi();
L100001:
	    if (istat > 0) {
		inputerror_(inpc + 1, ipoinpc, iline, "*USER ELEMENT%", ier, (
			ftnlen)1, (ftnlen)14);
		return 0;
	    }
	} else if (s_cmp(textpart + i__ * 132, "INTEGRATIONPOINTS=", (ftnlen)
		18, (ftnlen)18) == 0) {
	    ici__1.icierr = 1;
	    ici__1.iciend = 1;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 10;
	    ici__1.iciunit = textpart + (i__ * 132 + 18);
	    ici__1.icifmt = "(i10)";
	    istat = s_rsfi(&ici__1);
	    if (istat != 0) {
		goto L100002;
	    }
	    istat = do_fio(&c__1, (char *)&intpoints, (ftnlen)sizeof(integer))
		    ;
	    if (istat != 0) {
		goto L100002;
	    }
	    istat = e_rsfi();
L100002:
	    if (istat > 0) {
		inputerror_(inpc + 1, ipoinpc, iline, "*USER ELEMENT%", ier, (
			ftnlen)1, (ftnlen)14);
		return 0;
	    }
	} else if (s_cmp(textpart + i__ * 132, "MAXDOF=", (ftnlen)7, (ftnlen)
		7) == 0) {
	    ici__1.icierr = 1;
	    ici__1.iciend = 1;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 10;
	    ici__1.iciunit = textpart + (i__ * 132 + 7);
	    ici__1.icifmt = "(i10)";
	    istat = s_rsfi(&ici__1);
	    if (istat != 0) {
		goto L100003;
	    }
	    istat = do_fio(&c__1, (char *)&maxdof, (ftnlen)sizeof(integer));
	    if (istat != 0) {
		goto L100003;
	    }
	    istat = e_rsfi();
L100003:
	    if (istat > 0) {
		inputerror_(inpc + 1, ipoinpc, iline, "*USER ELEMENT%", ier, (
			ftnlen)1, (ftnlen)14);
		return 0;
	    }
	}
    }

/*     check range */

    if (intpoints > 255) {
	s_wsle(&io___8);
	do_lio(&c__9, &c__1, "*ERROR reading *USER ELEMENT", (ftnlen)28);
	e_wsle();
	s_wsle(&io___9);
	do_lio(&c__9, &c__1, "       number of integration points ", (ftnlen)
		36);
	do_lio(&c__3, &c__1, (char *)&intpoints, (ftnlen)sizeof(integer));
	do_lio(&c__9, &c__1, " exceeds 255", (ftnlen)12);
	e_wsle();
	*ier = 1;
	return 0;
    }

    if (maxdof > 255) {
	s_wsle(&io___10);
	do_lio(&c__9, &c__1, "*ERROR reading *USER ELEMENT", (ftnlen)28);
	e_wsle();
	s_wsle(&io___11);
	do_lio(&c__9, &c__1, "       highest degree of freedom ", (ftnlen)33);
	do_lio(&c__3, &c__1, (char *)&maxdof, (ftnlen)sizeof(integer));
	do_lio(&c__9, &c__1, " exceeds 255", (ftnlen)12);
	e_wsle();
	*ier = 1;
	return 0;
    }

    if (nodes > 255) {
	s_wsle(&io___12);
	do_lio(&c__9, &c__1, "*ERROR reading *USER ELEMENT", (ftnlen)28);
	e_wsle();
	s_wsle(&io___13);
	do_lio(&c__9, &c__1, "       number of nodes ", (ftnlen)23);
	do_lio(&c__3, &c__1, (char *)&nodes, (ftnlen)sizeof(integer));
	do_lio(&c__9, &c__1, " exceeds 255", (ftnlen)12);
	e_wsle();
	*ier = 1;
	return 0;
    }

/*     storing the element information in iuel */

    nidentk_(&iuel[5], &number, nuel, &id, &four);

    if (id > 0) {
	if (iuel[(id << 2) + 1] == number) {
	    s_wsle(&io___15);
	    do_lio(&c__9, &c__1, "*ERROR reading *USER ELEMENT", (ftnlen)28);
	    e_wsle();
	    s_wsle(&io___16);
	    do_lio(&c__9, &c__1, "       element number was already defined", 
		    (ftnlen)41);
	    e_wsle();
	    *ier = 1;
	    return 0;
	}
    }

    ++(*nuel);
    i__1 = id + 2;
    for (i__ = *nuel; i__ >= i__1; --i__) {
	for (j = 1; j <= 4; ++j) {
	    iuel[j + (i__ << 2)] = iuel[j + (i__ - 1 << 2)];
	}
    }
    iuel[(id + 1 << 2) + 1] = number;
    iuel[(id + 1 << 2) + 2] = intpoints;
    iuel[(id + 1 << 2) + 3] = maxdof;
    iuel[(id + 1 << 2) + 4] = nodes;

    return 0;
} /* userelements_ */

