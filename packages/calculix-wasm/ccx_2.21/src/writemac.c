/* writemac.f -- translated by f2c (version 20200916).
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


/*      CalculiX - A 3-dimensional finite element program */
/*               Copyright (C) 1998-2023 Guido Dhondt */

/*      This program is free software; you can redistribute it and/or */
/*      modify it under the terms of the GNU General Public License as */
/*      published by the Free Software Foundation(version 2); */


/*      This program is distributed in the hope that it will be useful, */
/*      but WITHOUT ANY WARRANTY; without even the implied warranty of */
/*      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the */
/*      GNU General Public License for more details. */

/*      You should have received a copy of the GNU General Public License */
/*      along with this program; if not, write to the Free Software */
/*      Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA. */

/* Subroutine */ int writemac_(doublereal *mac, integer *nev, integer *
	nevcomplex)
{
    /* Format strings */
    static char fmt_100[] = "(15(1x,e11.4))";

    /* System generated locals */
    integer mac_dim1, mac_offset, i__1, i__2;

    /* Builtin functions */
    integer s_wsle(cilist *), e_wsle(void), do_lio(integer *, integer *, char 
	    *, ftnlen), s_wsfe(cilist *), do_fio(integer *, char *, ftnlen), 
	    e_wsfe(void);

    /* Local variables */
    integer i__, j;

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 5, 0, 0, 0 };
    static cilist io___2 = { 0, 5, 0, 0, 0 };
    static cilist io___3 = { 0, 5, 0, 0, 0 };
    static cilist io___5 = { 0, 5, 0, fmt_100, 0 };



/*      writes the results of MAC-caculation in *_mac.dat */

/*      nm is the nodal diameter in case of complex frequency */
/*      nev is the number of eigenvectors */
/*      mac contains the MAC-Values */



    /* Parameter adjustments */
    mac_dim1 = *nev;
    mac_offset = 1 + mac_dim1;
    mac -= mac_offset;

    /* Function Body */
    s_wsle(&io___1);
    e_wsle();
    s_wsle(&io___2);
    do_lio(&c__9, &c__1, "Modal Assurance Criterium", (ftnlen)25);
    e_wsle();
    s_wsle(&io___3);
    e_wsle();
    i__1 = *nev;
    for (i__ = 1; i__ <= i__1; ++i__) {
	s_wsfe(&io___5);
	i__2 = *nevcomplex;
	for (j = 1; j <= i__2; ++j) {
	    do_fio(&c__1, (char *)&mac[i__ + j * mac_dim1], (ftnlen)sizeof(
		    doublereal));
	}
	e_wsfe();
    }

    return 0;
} /* writemac_ */

