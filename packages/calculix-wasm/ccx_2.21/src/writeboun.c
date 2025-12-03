/* writeboun.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int writeboun_(integer *nodeboun, integer *ndirboun, 
	doublereal *xboun, char *typeboun, integer *nboun, ftnlen 
	typeboun_len)
{
    /* System generated locals */
    integer i__1;
    cilist ci__1;

    /* Builtin functions */
    integer s_wsle(cilist *), e_wsle(void), s_wsfe(cilist *), e_wsfe(void), 
	    do_fio(integer *, char *, ftnlen);

    /* Local variables */
    integer i__;

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 6, 0, 0, 0 };



/*     writes an MPC to standard output (for debugging purposes) */



    /* Parameter adjustments */
    --typeboun;
    --xboun;
    --ndirboun;
    --nodeboun;

    /* Function Body */
    s_wsle(&io___1);
    e_wsle();
    ci__1.cierr = 0;
    ci__1.ciunit = 6;
    ci__1.cifmt = "('SPC ')";
    s_wsfe(&ci__1);
    e_wsfe();
    i__1 = *nboun;
    for (i__ = 1; i__ <= i__1; ++i__) {
	ci__1.cierr = 0;
	ci__1.ciunit = 6;
	ci__1.cifmt = "(i5,1x,i10,1x,i5,1x,e11.4,1x,a1)";
	s_wsfe(&ci__1);
	do_fio(&c__1, (char *)&i__, (ftnlen)sizeof(integer));
	do_fio(&c__1, (char *)&nodeboun[i__], (ftnlen)sizeof(integer));
	do_fio(&c__1, (char *)&ndirboun[i__], (ftnlen)sizeof(integer));
	do_fio(&c__1, (char *)&xboun[i__], (ftnlen)sizeof(doublereal));
	do_fio(&c__1, typeboun + i__, (ftnlen)1);
	e_wsfe();
    }

    return 0;
} /* writeboun_ */

