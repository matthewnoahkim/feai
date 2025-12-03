/* writevector.f -- translated by f2c (version 20200916).
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

static integer c__3 = 3;
static integer c__9 = 9;
static integer c__1 = 1;
static integer c__5 = 5;


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

/* Subroutine */ int writevector_(doublereal *ad, integer *neq, integer *
	number)
{
    /* System generated locals */
    address a__1[3];
    integer i__1[3], i__2;
    char ch__1[1];
    olist o__1;
    cllist cl__1;

    /* Builtin functions */
    /* Subroutine */ int s_cat(char *, char **, integer *, integer *, ftnlen);
    integer f_open(olist *), s_wsle(cilist *), do_lio(integer *, integer *, 
	    char *, ftnlen), e_wsle(void), f_clos(cllist *);

    /* Local variables */
    integer i__;
    char name__[12], name2[14];

    /* Fortran I/O blocks */
    static cilist io___3 = { 0, 10, 0, 0, 0 };
    static cilist io___5 = { 0, 10, 0, 0, 0 };



/*      writes an vector to file (for debugging purposes) */





    /* Parameter adjustments */
    --ad;

    /* Function Body */
/* Writing concatenation */
    i__1[0] = 7, a__1[0] = "vector_";
    *(unsigned char *)&ch__1[0] = *number + 96;
    i__1[1] = 1, a__1[1] = ch__1;
    i__1[2] = 4, a__1[2] = ".out";
    s_cat(name__, a__1, i__1, &c__3, (ftnlen)12);
/* Writing concatenation */
    i__1[0] = 7, a__1[0] = "vector_";
    *(unsigned char *)&ch__1[0] = *number + 96;
    i__1[1] = 1, a__1[1] = ch__1;
    i__1[2] = 6, a__1[2] = "_t.out";
    s_cat(name2, a__1, i__1, &c__3, (ftnlen)14);
    o__1.oerr = 0;
    o__1.ounit = 10;
    o__1.ofnmlen = 12;
    o__1.ofnm = name__;
    o__1.orl = 0;
    o__1.osta = "unknown";
    o__1.oacc = 0;
    o__1.ofm = 0;
    o__1.oblnk = 0;
    f_open(&o__1);
    s_wsle(&io___3);
    do_lio(&c__9, &c__1, "vector  number ", (ftnlen)15);
    do_lio(&c__3, &c__1, (char *)&(*number), (ftnlen)sizeof(integer));
    e_wsle();

    i__2 = *neq;
    for (i__ = 1; i__ <= i__2; ++i__) {
/*         if(ad(i).gt.1.0e-10.or.ad(i).lt.-1.0e-10)then */
	s_wsle(&io___5);
	do_lio(&c__9, &c__1, "row ", (ftnlen)4);
	do_lio(&c__3, &c__1, (char *)&i__, (ftnlen)sizeof(integer));
	do_lio(&c__9, &c__1, " value ", (ftnlen)7);
	do_lio(&c__5, &c__1, (char *)&ad[i__], (ftnlen)sizeof(doublereal));
	e_wsle();
/*         endif */
    }

    cl__1.cerr = 0;
    cl__1.cunit = 10;
    cl__1.csta = 0;
    f_clos(&cl__1);
    return 0;
} /* writevector_ */

