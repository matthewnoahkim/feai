/* writerandomfield.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int writerandomfield_(doublereal *d__, doublereal *relerr, 
	integer *imodes)
{
    /* System generated locals */
    cilist ci__1;

    /* Builtin functions */
    integer s_wsle(cilist *), e_wsle(void), do_lio(integer *, integer *, char 
	    *, ftnlen), s_wsfe(cilist *), do_fio(integer *, char *, ftnlen), 
	    e_wsfe(void);

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 5, 0, 0, 0 };
    static cilist io___2 = { 0, 5, 0, 0, 0 };
    static cilist io___3 = { 0, 5, 0, 0, 0 };
    static cilist io___4 = { 0, 5, 0, 0, 0 };



/*     writes the error measures of the randomfield in the .dat file */



    if (*imodes == 1) {
	s_wsle(&io___1);
	e_wsle();
	s_wsle(&io___2);
	do_lio(&c__9, &c__1, "SPECTRAL DECOMPOSITION OF RANDOMFIELD", (ftnlen)
		37);
	e_wsle();
	s_wsle(&io___3);
	do_lio(&c__9, &c__1, "MODESHAPE   EIGENVALUE   GLOBAL RELIABILITY", (
		ftnlen)43);
	e_wsle();
	s_wsle(&io___4);
	e_wsle();
	ci__1.cierr = 0;
	ci__1.ciunit = 5;
	ci__1.cifmt = "(1x,i3.3,6x,e13.4,e13.4)";
	s_wsfe(&ci__1);
	do_fio(&c__1, (char *)&(*imodes), (ftnlen)sizeof(integer));
	do_fio(&c__1, (char *)&(*d__), (ftnlen)sizeof(doublereal));
	do_fio(&c__1, (char *)&(*relerr), (ftnlen)sizeof(doublereal));
	e_wsfe();
    } else {
	ci__1.cierr = 0;
	ci__1.ciunit = 5;
	ci__1.cifmt = "(1x,i3.3,6x,e13.4,e13.4)";
	s_wsfe(&ci__1);
	do_fio(&c__1, (char *)&(*imodes), (ftnlen)sizeof(integer));
	do_fio(&c__1, (char *)&(*d__), (ftnlen)sizeof(doublereal));
	do_fio(&c__1, (char *)&(*relerr), (ftnlen)sizeof(doublereal));
	e_wsfe();
    }

    return 0;
} /* writerandomfield_ */

