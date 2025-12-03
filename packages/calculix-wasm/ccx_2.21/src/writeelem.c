/* writeelem.f -- translated by f2c (version 20200916).
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
static integer c__3 = 3;
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

/* Subroutine */ int writeelem_(integer *i__, char *lakon, ftnlen lakon_len)
{
    /* System generated locals */
    integer i__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    extern /* Subroutine */ int exit_(integer *);

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 6, 0, 0, 0 };
    static cilist io___2 = { 0, 6, 0, 0, 0 };
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___4 = { 0, 6, 0, 0, 0 };
    static cilist io___5 = { 0, 6, 0, 0, 0 };
    static cilist io___6 = { 0, 6, 0, 0, 0 };



/*     this routine is called if an inconsistency is noticed between */
/*     the element count and the number of elements stored in the frd- */
/*     file. Such an inconsistency will lead to a crash while reading */
/*     a binary frd-file */




    /* Parameter adjustments */
    lakon -= 8;

    /* Function Body */
    s_wsle(&io___1);
    do_lio(&c__9, &c__1, "*ERROR in writeelem:", (ftnlen)20);
    e_wsle();
    s_wsle(&io___2);
    do_lio(&c__9, &c__1, "       element ", (ftnlen)15);
    i__1 = *i__ + 1;
    do_lio(&c__3, &c__1, (char *)&i__1, (ftnlen)sizeof(integer));
    do_lio(&c__9, &c__1, " with label ", (ftnlen)12);
    do_lio(&c__9, &c__1, lakon + (*i__ + 1 << 3), (ftnlen)8);
    e_wsle();
    s_wsle(&io___3);
    do_lio(&c__9, &c__1, "       is not stored in the frd-file. Yet, ", (
	    ftnlen)43);
    e_wsle();
    s_wsle(&io___4);
    do_lio(&c__9, &c__1, "       it is taken into account in the element", (
	    ftnlen)46);
    e_wsle();
    s_wsle(&io___5);
    do_lio(&c__9, &c__1, "       count: inconsistency. Please contact the", (
	    ftnlen)47);
    e_wsle();
    s_wsle(&io___6);
    do_lio(&c__9, &c__1, "       author of CalculiX", (ftnlen)25);
    e_wsle();
    exit_(&c__201);

    return 0;
} /* writeelem_ */

