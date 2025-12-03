/* spooles_read.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int spooles_read__(doublereal *ad, doublereal *au, 
	doublereal *adb, doublereal *aub, doublereal *sigma, doublereal *b, 
	integer *icol, integer *irow, integer *neq, integer *nzs, integer *
	symmetryflag, integer *inputformat, integer *nzs3)
{
    /* Format strings */
    static char fmt_101[] = "(5i10)";
    static char fmt_100[] = "(e20.13)";

    /* System generated locals */
    integer i__1;
    olist o__1;
    cllist cl__1;

    /* Builtin functions */
    integer f_open(olist *), s_rsfe(cilist *), do_fio(integer *, char *, 
	    ftnlen), e_rsfe(void), f_clos(cllist *);

    /* Local variables */
    integer i__;

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 18, 0, fmt_101, 0 };
    static cilist io___2 = { 0, 18, 0, fmt_100, 0 };
    static cilist io___4 = { 0, 18, 0, fmt_100, 0 };
    static cilist io___5 = { 0, 18, 0, fmt_100, 0 };
    static cilist io___6 = { 0, 18, 0, fmt_100, 0 };
    static cilist io___7 = { 0, 18, 0, fmt_101, 0 };
    static cilist io___8 = { 0, 18, 0, fmt_101, 0 };






    /* Parameter adjustments */
    --irow;
    --icol;
    --b;
    --aub;
    --adb;
    --au;
    --ad;

    /* Function Body */
    o__1.oerr = 0;
    o__1.ounit = 18;
    o__1.ofnmlen = 14;
    o__1.ofnm = "spooles_matrix";
    o__1.orl = 0;
    o__1.osta = "unknown";
    o__1.oacc = 0;
    o__1.ofm = 0;
    o__1.oblnk = 0;
    f_open(&o__1);

    s_rsfe(&io___1);
    do_fio(&c__1, (char *)&(*neq), (ftnlen)sizeof(integer));
    do_fio(&c__1, (char *)&(*nzs), (ftnlen)sizeof(integer));
    do_fio(&c__1, (char *)&(*symmetryflag), (ftnlen)sizeof(integer));
    do_fio(&c__1, (char *)&(*inputformat), (ftnlen)sizeof(integer));
    do_fio(&c__1, (char *)&(*nzs3), (ftnlen)sizeof(integer));
    e_rsfe();
    s_rsfe(&io___2);
    do_fio(&c__1, (char *)&(*sigma), (ftnlen)sizeof(doublereal));
    e_rsfe();
    i__1 = *neq;
    for (i__ = 1; i__ <= i__1; ++i__) {
	s_rsfe(&io___4);
	do_fio(&c__1, (char *)&ad[i__], (ftnlen)sizeof(doublereal));
	e_rsfe();
    }
    i__1 = *nzs;
    for (i__ = 1; i__ <= i__1; ++i__) {
	s_rsfe(&io___5);
	do_fio(&c__1, (char *)&au[i__], (ftnlen)sizeof(doublereal));
	e_rsfe();
    }
    i__1 = *neq;
    for (i__ = 1; i__ <= i__1; ++i__) {
	s_rsfe(&io___6);
	do_fio(&c__1, (char *)&b[i__], (ftnlen)sizeof(doublereal));
	e_rsfe();
    }
    i__1 = *neq;
    for (i__ = 1; i__ <= i__1; ++i__) {
	s_rsfe(&io___7);
	do_fio(&c__1, (char *)&icol[i__], (ftnlen)sizeof(integer));
	e_rsfe();
    }
    i__1 = *nzs;
    for (i__ = 1; i__ <= i__1; ++i__) {
	s_rsfe(&io___8);
	do_fio(&c__1, (char *)&irow[i__], (ftnlen)sizeof(integer));
	e_rsfe();
    }
    cl__1.cerr = 0;
    cl__1.cunit = 18;
    cl__1.csta = 0;
    f_clos(&cl__1);
    return 0;
} /* spooles_read__ */

