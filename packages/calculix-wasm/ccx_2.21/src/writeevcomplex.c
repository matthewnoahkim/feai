/* writeevcomplex.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int writeevcomplex_(doublecomplex *x, integer *nx, 
	doublereal *fmin, doublereal *fmax)
{
    /* System generated locals */
    integer i__1, i__2, i__3;
    doublereal d__1, d__2, d__3;
    cilist ci__1;

    /* Builtin functions */
    double atan(doublereal);
    integer s_wsle(cilist *), e_wsle(void), do_lio(integer *, integer *, char 
	    *, ftnlen), s_wsfe(cilist *), do_fio(integer *, char *, ftnlen);
    double d_imag(doublecomplex *);
    integer e_wsfe(void);

    /* Local variables */
    integer j;
    doublereal pi;

    /* Fortran I/O blocks */
    static cilist io___2 = { 0, 5, 0, 0, 0 };
    static cilist io___3 = { 0, 5, 0, 0, 0 };
    static cilist io___4 = { 0, 5, 0, 0, 0 };
    static cilist io___5 = { 0, 5, 0, 0, 0 };
    static cilist io___6 = { 0, 5, 0, 0, 0 };
    static cilist io___7 = { 0, 5, 0, 0, 0 };
    static cilist io___8 = { 0, 5, 0, 0, 0 };



/*     writes the eigenvalues in the .dat file */



    /* Parameter adjustments */
    --x;

    /* Function Body */
    pi = atan(1.) * 4.;

    s_wsle(&io___2);
    e_wsle();
    s_wsle(&io___3);
    do_lio(&c__9, &c__1, "    E I G E N V A L U E   O U T P U T", (ftnlen)37);
    e_wsle();
    s_wsle(&io___4);
    e_wsle();
    s_wsle(&io___5);
    do_lio(&c__9, &c__1, "MODE NO                     FREQUENCY             "
	    "      ", (ftnlen)56);
    e_wsle();
    s_wsle(&io___6);
    do_lio(&c__9, &c__1, "                     REAL PART         IMAGINARY P"
	    "ART", (ftnlen)53);
    e_wsle();
    s_wsle(&io___7);
    do_lio(&c__9, &c__1, "            (RAD/TIME)   (CYCLES/TIME)   (RAD/TIME)"
	    , (ftnlen)51);
    e_wsle();
    s_wsle(&io___8);
    e_wsle();
    i__1 = *nx;
    for (j = 1; j <= i__1; ++j) {
	ci__1.cierr = 0;
	ci__1.ciunit = 5;
	ci__1.cifmt = "(i7,4(2x,e14.7))";
	s_wsfe(&ci__1);
	do_fio(&c__1, (char *)&j, (ftnlen)sizeof(integer));
	i__2 = j;
	d__1 = x[i__2].r;
	do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
	i__3 = j;
	d__2 = x[i__3].r / (pi * 2.);
	do_fio(&c__1, (char *)&d__2, (ftnlen)sizeof(doublereal));
	d__3 = d_imag(&x[j]);
	do_fio(&c__1, (char *)&d__3, (ftnlen)sizeof(doublereal));
	e_wsfe();
    }

    return 0;
} /* writeevcomplex_ */

