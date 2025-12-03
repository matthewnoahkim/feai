/* writepf.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int writepf_(doublereal *d__, doublereal *bjr, doublereal *
	bji, doublereal *freq, integer *nev, integer *mode, integer *nherm)
{
    /* Format strings */
    static char fmt_100[] = "(\002P A R T I C I P A T I O N   F A C T O R S "
	    "  F O R\002,\002   F R E Q U E N C Y   \002,e20.13,\002 (CYCLES/"
	    "TIME)\002)";
    static char fmt_101[] = "(\002P A R T I C I P A T I O N   F A C T O R S "
	    "  F O R\002,\002   M O D E   \002,i5)";

    /* System generated locals */
    integer i__1;
    doublereal d__1;
    cilist ci__1;

    /* Builtin functions */
    double atan(doublereal);
    integer s_wsle(cilist *), e_wsle(void), s_wsfe(cilist *), do_fio(integer *
	    , char *, ftnlen), e_wsfe(void), do_lio(integer *, integer *, 
	    char *, ftnlen);

    /* Local variables */
    integer j;
    doublereal pi;

    /* Fortran I/O blocks */
    static cilist io___2 = { 0, 5, 0, 0, 0 };
    static cilist io___3 = { 0, 5, 0, fmt_100, 0 };
    static cilist io___4 = { 0, 5, 0, fmt_101, 0 };
    static cilist io___5 = { 0, 5, 0, 0, 0 };
    static cilist io___6 = { 0, 5, 0, 0, 0 };
    static cilist io___7 = { 0, 5, 0, 0, 0 };
    static cilist io___8 = { 0, 5, 0, 0, 0 };
    static cilist io___10 = { 0, 5, 0, 0, 0 };
    static cilist io___11 = { 0, 5, 0, 0, 0 };
    static cilist io___12 = { 0, 5, 0, 0, 0 };
    static cilist io___13 = { 0, 5, 0, 0, 0 };



/*     writes the participation factors to unit 5 */



    /* Parameter adjustments */
    --bji;
    --bjr;
    --d__;

    /* Function Body */
    pi = atan(1.) * 4.;

    s_wsle(&io___2);
    e_wsle();
    if (*mode == 0) {
	s_wsfe(&io___3);
	do_fio(&c__1, (char *)&(*freq), (ftnlen)sizeof(doublereal));
	e_wsfe();
    } else {
	s_wsfe(&io___4);
	do_fio(&c__1, (char *)&(*mode), (ftnlen)sizeof(integer));
	e_wsfe();
    }


    if (*nherm == 1) {
	s_wsle(&io___5);
	e_wsle();
	s_wsle(&io___6);
	do_lio(&c__9, &c__1, "MODE NO    FREQUENCY               FACTOR", (
		ftnlen)41);
	e_wsle();
	s_wsle(&io___7);
	do_lio(&c__9, &c__1, "          (CYCLES/TIME)      REAL        IMAGI"
		"NARY", (ftnlen)50);
	e_wsle();
	s_wsle(&io___8);
	e_wsle();
	i__1 = *nev;
	for (j = 1; j <= i__1; ++j) {
	    ci__1.cierr = 0;
	    ci__1.ciunit = 5;
	    ci__1.cifmt = "(i7,3(2x,e14.7))";
	    s_wsfe(&ci__1);
	    do_fio(&c__1, (char *)&j, (ftnlen)sizeof(integer));
	    d__1 = d__[j] / (pi * 2.);
	    do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, (char *)&bjr[j], (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, (char *)&bji[j], (ftnlen)sizeof(doublereal));
	    e_wsfe();
	}
    } else {
	s_wsle(&io___10);
	e_wsle();
	s_wsle(&io___11);
	do_lio(&c__9, &c__1, "MODE NO    FREQ. (REAL)   FREQ. (IMAG)        "
		"     FACTOR", (ftnlen)57);
	e_wsle();
	s_wsle(&io___12);
	do_lio(&c__9, &c__1, "          (CYCLES/TIME)    (RAD/TIME)        R"
		"EAL      IMAGINARY", (ftnlen)64);
	e_wsle();
	s_wsle(&io___13);
	e_wsle();
	i__1 = *nev;
	for (j = 1; j <= i__1; ++j) {
	    ci__1.cierr = 0;
	    ci__1.ciunit = 5;
	    ci__1.cifmt = "(i7,4(2x,e14.7))";
	    s_wsfe(&ci__1);
	    do_fio(&c__1, (char *)&j, (ftnlen)sizeof(integer));
	    d__1 = d__[(j << 1) - 1] / (pi * 2.);
	    do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, (char *)&d__[j * 2], (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, (char *)&bjr[j], (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, (char *)&bji[j], (ftnlen)sizeof(doublereal));
	    e_wsfe();
	}
    }

    return 0;
} /* writepf_ */

