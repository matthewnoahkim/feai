/* writeinput.f -- translated by f2c (version 20200916).
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
static integer c__201 = 201;


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

/* Subroutine */ int writeinput_(char *inpc, integer *ipoinp, integer *inp, 
	integer *nline, integer *ninp, integer *ipoinpc, ftnlen inpc_len)
{
    /* Initialized data */

    static char nameref[20*19] = "RESTART,READ        " "NODE                "
	     "USERELEMENT         " "ELEMENT             " "MATRIXASSEMBLE  "
	    "    " "NSET                " "ELSET               " "SURFACE    "
	    "         " "TRANSFORM           " "MATERIAL            " "DISTRI"
	    "BUTION        " "ORIENTATION         " "TIE                 " 
	    "INTERACTION         " "INITIALCONDITIONS   " "AMPLITUDE        "
	    "   " "CONTACTPAIR         " "COUPLING            " "REST        "
	    "        ";

    /* System generated locals */
    integer i__1, i__2;
    cilist ci__1;
    olist o__1;
    cllist cl__1;

    /* Builtin functions */
    integer f_open(olist *), s_wsfe(cilist *), do_fio(integer *, char *, 
	    ftnlen), e_wsfe(void), f_clos(cllist *), s_wsle(cilist *), do_lio(
	    integer *, integer *, char *, ftnlen), e_wsle(void);

    /* Local variables */
    integer i__, j;
    extern /* Subroutine */ int exit_(integer *);

    /* Fortran I/O blocks */
    static cilist io___4 = { 0, 6, 0, 0, 0 };
    static cilist io___5 = { 0, 6, 0, 0, 0 };
    static cilist io___6 = { 0, 6, 0, 0, 0 };







    /* Parameter adjustments */
    --inpc;
    ipoinp -= 3;
    inp -= 4;

    /* Function Body */

    o__1.oerr = 1;
    o__1.ounit = 16;
    o__1.ofnmlen = 10;
    o__1.ofnm = "input.inpc";
    o__1.orl = 0;
    o__1.osta = "unknown";
    o__1.oacc = 0;
    o__1.ofm = 0;
    o__1.oblnk = 0;
    i__1 = f_open(&o__1);
    if (i__1 != 0) {
	goto L161;
    }
    i__1 = *nline;
    for (i__ = 1; i__ <= i__1; ++i__) {
	ci__1.cierr = 0;
	ci__1.ciunit = 16;
	ci__1.cifmt = "(1x,i6,1x,1320a1)";
	s_wsfe(&ci__1);
	do_fio(&c__1, (char *)&i__, (ftnlen)sizeof(integer));
	i__2 = ipoinpc[i__];
	for (j = ipoinpc[i__ - 1] + 1; j <= i__2; ++j) {
	    do_fio(&c__1, inpc + j, (ftnlen)1);
	}
	e_wsfe();
    }
    cl__1.cerr = 0;
    cl__1.cunit = 16;
    cl__1.csta = 0;
    f_clos(&cl__1);

    o__1.oerr = 1;
    o__1.ounit = 16;
    o__1.ofnmlen = 12;
    o__1.ofnm = "input.ipoinp";
    o__1.orl = 0;
    o__1.osta = "unknown";
    o__1.oacc = 0;
    o__1.ofm = 0;
    o__1.oblnk = 0;
    i__1 = f_open(&o__1);
    if (i__1 != 0) {
	goto L162;
    }
    for (i__ = 1; i__ <= 19; ++i__) {
	ci__1.cierr = 0;
	ci__1.ciunit = 16;
	ci__1.cifmt = "(1x,a20,1x,i6,1x,i6)";
	s_wsfe(&ci__1);
	do_fio(&c__1, nameref + (i__ - 1) * 20, (ftnlen)20);
	for (j = 1; j <= 2; ++j) {
	    do_fio(&c__1, (char *)&ipoinp[j + (i__ << 1)], (ftnlen)sizeof(
		    integer));
	}
	e_wsfe();
    }
    cl__1.cerr = 0;
    cl__1.cunit = 16;
    cl__1.csta = 0;
    f_clos(&cl__1);

    o__1.oerr = 1;
    o__1.ounit = 16;
    o__1.ofnmlen = 9;
    o__1.ofnm = "input.inp";
    o__1.orl = 0;
    o__1.osta = "unknown";
    o__1.oacc = 0;
    o__1.ofm = 0;
    o__1.oblnk = 0;
    i__1 = f_open(&o__1);
    if (i__1 != 0) {
	goto L163;
    }
    i__1 = *ninp;
    for (i__ = 1; i__ <= i__1; ++i__) {
	ci__1.cierr = 0;
	ci__1.ciunit = 16;
	ci__1.cifmt = "(1x,i3,1x,i6,1x,i6,1x,i6)";
	s_wsfe(&ci__1);
	do_fio(&c__1, (char *)&i__, (ftnlen)sizeof(integer));
	for (j = 1; j <= 3; ++j) {
	    do_fio(&c__1, (char *)&inp[j + i__ * 3], (ftnlen)sizeof(integer));
	}
	e_wsfe();
    }
    cl__1.cerr = 0;
    cl__1.cunit = 16;
    cl__1.csta = 0;
    f_clos(&cl__1);

    return 0;

L161:
    s_wsle(&io___4);
    do_lio(&c__9, &c__1, "*ERROR in writeinput: could not open file input.in"
	    "pc", (ftnlen)52);
    e_wsle();
    exit_(&c__201);

L162:
    s_wsle(&io___5);
    do_lio(&c__9, &c__1, "*ERROR in writeinput: could not open file input.ip"
	    "oinp", (ftnlen)54);
    e_wsle();
    exit_(&c__201);

L163:
    s_wsle(&io___6);
    do_lio(&c__9, &c__1, "*ERROR in writeinput: could not open file input.inp"
	    , (ftnlen)51);
    e_wsle();
    exit_(&c__201);
    return 0;
} /* writeinput_ */

