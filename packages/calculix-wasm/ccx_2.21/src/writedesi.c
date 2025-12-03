/* writedesi.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int writedesi_(integer *norien, char *orname, ftnlen 
	orname_len)
{
    /* System generated locals */
    integer i__1, i__2;
    cilist ci__1;

    /* Builtin functions */
    integer s_wsle(cilist *), e_wsle(void), do_lio(integer *, integer *, char 
	    *, ftnlen), s_wsfe(cilist *), do_fio(integer *, char *, ftnlen), 
	    e_wsfe(void);

    /* Local variables */
    integer j;

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 5, 0, 0, 0 };
    static cilist io___2 = { 0, 5, 0, 0, 0 };
    static cilist io___3 = { 0, 5, 0, 0, 0 };
    static cilist io___4 = { 0, 5, 0, 0, 0 };



/*     writes the orientation design variables in the .dat file */





    /* Parameter adjustments */
    orname -= 80;

    /* Function Body */
    s_wsle(&io___1);
    e_wsle();
    s_wsle(&io___2);
    do_lio(&c__9, &c__1, "    D E S I G N   V A R I A B L E S", (ftnlen)35);
    e_wsle();
    s_wsle(&io___3);
    e_wsle();
    ci__1.cierr = 0;
    ci__1.ciunit = 5;
    ci__1.cifmt = "(a8,1x,a11,62x,a15)";
    s_wsfe(&ci__1);
    do_fio(&c__1, "VARIABLE", (ftnlen)8);
    do_fio(&c__1, "ORIENTATION", (ftnlen)11);
    do_fio(&c__1, "ROTATION VECTOR", (ftnlen)15);
    e_wsfe();
    s_wsle(&io___4);
    e_wsle();

    i__1 = *norien;
    for (j = 1; j <= i__1; ++j) {
	ci__1.cierr = 0;
	ci__1.ciunit = 5;
	ci__1.cifmt = "(i5,4x,a80,1x,a5)";
	s_wsfe(&ci__1);
	i__2 = (j - 1) * 3 + 1;
	do_fio(&c__1, (char *)&i__2, (ftnlen)sizeof(integer));
	do_fio(&c__1, orname + j * 80, (ftnlen)80);
	do_fio(&c__1, "Rx   ", (ftnlen)5);
	e_wsfe();
	ci__1.cierr = 0;
	ci__1.ciunit = 5;
	ci__1.cifmt = "(i5,4x,a80,1x,a5)";
	s_wsfe(&ci__1);
	i__2 = (j - 1) * 3 + 2;
	do_fio(&c__1, (char *)&i__2, (ftnlen)sizeof(integer));
	do_fio(&c__1, orname + j * 80, (ftnlen)80);
	do_fio(&c__1, "Ry   ", (ftnlen)5);
	e_wsfe();
	ci__1.cierr = 0;
	ci__1.ciunit = 5;
	ci__1.cifmt = "(i5,4x,a80,1x,a5)";
	s_wsfe(&ci__1);
	i__2 = (j - 1) * 3 + 3;
	do_fio(&c__1, (char *)&i__2, (ftnlen)sizeof(integer));
	do_fio(&c__1, orname + j * 80, (ftnlen)80);
	do_fio(&c__1, "Rz   ", (ftnlen)5);
	e_wsfe();
    }

    return 0;
} /* writedesi_ */

