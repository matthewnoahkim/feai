/* writeturdircs.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int writeturdircs_(doublereal *xn, char *turdir, integer *
	nev, integer *nm, ftnlen turdir_len)
{
    /* Format strings */
    static char fmt_100[] = "(\002    Axis reference direction:\002,3(1x,e11"
	    ".4))";

    /* System generated locals */
    integer i__1;
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
    static cilist io___4 = { 0, 5, 0, fmt_100, 0 };
    static cilist io___6 = { 0, 5, 0, 0, 0 };
    static cilist io___7 = { 0, 5, 0, 0, 0 };
    static cilist io___8 = { 0, 5, 0, 0, 0 };
    static cilist io___9 = { 0, 5, 0, 0, 0 };



/*     writes the eigenvalues in the .dat file */



    /* Parameter adjustments */
    --turdir;
    --xn;

    /* Function Body */
    s_wsle(&io___1);
    e_wsle();
    s_wsle(&io___2);
    do_lio(&c__9, &c__1, "    E I G E N M O D E   T U R N I N G   D I R E C "
	    "T I O N", (ftnlen)57);
    e_wsle();
    s_wsle(&io___3);
    e_wsle();
    s_wsfe(&io___4);
    for (j = 1; j <= 3; ++j) {
	do_fio(&c__1, (char *)&xn[j], (ftnlen)sizeof(doublereal));
    }
    e_wsfe();
    s_wsle(&io___6);
    e_wsle();
    s_wsle(&io___7);
    do_lio(&c__9, &c__1, " NODAL   MODE NO     TURNING DIRECTION (F=FORWARD,"
	    "B=BACKWARD)", (ftnlen)61);
    e_wsle();
    s_wsle(&io___8);
    do_lio(&c__9, &c__1, "DIAMETER", (ftnlen)8);
    e_wsle();
    s_wsle(&io___9);
    e_wsle();
    i__1 = *nev;
    for (j = 1; j <= i__1; ++j) {
	ci__1.cierr = 0;
	ci__1.ciunit = 5;
	ci__1.cifmt = "(i5,4x,i7,10x,a1)";
	s_wsfe(&ci__1);
	do_fio(&c__1, (char *)&(*nm), (ftnlen)sizeof(integer));
	do_fio(&c__1, (char *)&j, (ftnlen)sizeof(integer));
	do_fio(&c__1, turdir + j, (ftnlen)1);
	e_wsfe();
    }

    return 0;
} /* writeturdircs_ */

