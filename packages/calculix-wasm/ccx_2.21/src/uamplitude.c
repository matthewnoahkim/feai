/* uamplitude.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int uamplitude_(doublereal *time, char *name__, doublereal *
	amplitude, ftnlen name_len)
{
    /* System generated locals */
    doublereal d__1;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen), s_wsle(cilist *), do_lio(
	    integer *, integer *, char *, ftnlen), e_wsle(void);

    /* Local variables */
    extern /* Subroutine */ int exit_(integer *);

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 6, 0, 0, 0 };



/*     user subroutine uamplitude: user defined amplitude definition */

/*     INPUT: */

/*     name               amplitude name */
/*     time               time at which the amplitude is to be */
/*                        evaluated */

/*     OUTPUT: */

/*     amplitude          value of the amplitude at time */




    if (s_cmp(name__, "QUADRATIC", (ftnlen)9, (ftnlen)9) == 0) {
/* Computing 2nd power */
	d__1 = *time;
	*amplitude = d__1 * d__1;
    } else {
	s_wsle(&io___1);
	do_lio(&c__9, &c__1, "*ERROR in uamplitude: unknown amplitude", (
		ftnlen)39);
	e_wsle();
	exit_(&c__201);
    }

    return 0;
} /* uamplitude_ */

