/* writedeigdx.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int writedeigdx_(integer *iev, doublereal *d__, integer *
	ndesi, char *orname, doublereal *dgdx, ftnlen orname_len)
{
    /* System generated locals */
    integer dgdx_dim1, dgdx_offset, i__1;
    cilist ci__1;

    /* Builtin functions */
    integer s_wsle(cilist *), e_wsle(void), do_lio(integer *, integer *, char 
	    *, ftnlen), s_wsfe(cilist *), do_fio(integer *, char *, ftnlen), 
	    e_wsfe(void);
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    char angle[5];
    integer iangle, iorien, idesvar;

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 5, 0, 0, 0 };
    static cilist io___2 = { 0, 5, 0, 0, 0 };
    static cilist io___3 = { 0, 5, 0, 0, 0 };
    static cilist io___4 = { 0, 5, 0, 0, 0 };



/*     writes the derivative of the eigenfrequencies w.r.t. */
/*     the orientations in the .dat file */






    /* Parameter adjustments */
    --d__;
    dgdx_dim1 = *ndesi;
    dgdx_offset = 1 + dgdx_dim1;
    dgdx -= dgdx_offset;
    orname -= 80;

    /* Function Body */
    s_wsle(&io___1);
    e_wsle();
    s_wsle(&io___2);
    do_lio(&c__9, &c__1, "    E I G E N V A L U E   S E N S I T I V I T Y", (
	    ftnlen)47);
    e_wsle();
    s_wsle(&io___3);
    e_wsle();
    ci__1.cierr = 0;
    ci__1.ciunit = 5;
    ci__1.cifmt = "(a10,2x,i5,2x,e11.4)";
    s_wsfe(&ci__1);
    do_fio(&c__1, "EIGENVALUE", (ftnlen)10);
    i__1 = *iev + 1;
    do_fio(&c__1, (char *)&i__1, (ftnlen)sizeof(integer));
    do_fio(&c__1, (char *)&d__[*iev + 1], (ftnlen)sizeof(doublereal));
    e_wsfe();
    s_wsle(&io___4);
    e_wsle();

    i__1 = *ndesi;
    for (idesvar = 1; idesvar <= i__1; ++idesvar) {
	iorien = (idesvar - 1) / 3 + 1;
	iangle = idesvar - (idesvar - 1) / 3 * 3;
	if (iangle == 1) {
	    s_copy(angle, "   Rx", (ftnlen)5, (ftnlen)5);
	} else if (iangle == 2) {
	    s_copy(angle, "   Ry", (ftnlen)5, (ftnlen)5);
	} else {
	    s_copy(angle, "   Rz", (ftnlen)5, (ftnlen)5);
	}
	ci__1.cierr = 0;
	ci__1.ciunit = 5;
	ci__1.cifmt = "(a80,1x,a5,1x,e11.4)";
	s_wsfe(&ci__1);
	do_fio(&c__1, orname + iorien * 80, (ftnlen)80);
	do_fio(&c__1, angle, (ftnlen)5);
	do_fio(&c__1, (char *)&dgdx[idesvar + dgdx_dim1], (ftnlen)sizeof(
		doublereal));
	e_wsfe();
    }

    return 0;
} /* writedeigdx_ */

