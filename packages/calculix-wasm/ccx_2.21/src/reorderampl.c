/* reorderampl.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int reorderampl_(char *amname, integer *namta, integer *nam, 
	ftnlen amname_len)
{
    /* System generated locals */
    integer i__1;

    /* Builtin functions */
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    char amnamecp[80];
    integer i__, j, id;
    extern /* Subroutine */ int cident80_(char *, char *, integer *, integer *
	    , ftnlen, ftnlen);
    integer namtacp[3];


/*     reorders amname in alphabetical order */




    /* Parameter adjustments */
    namta -= 4;
    amname -= 80;

    /* Function Body */
    i__1 = *nam - 1;
    cident80_(amname + 80, amname + *nam * 80, &i__1, &id, (ftnlen)80, (
	    ftnlen)80);

    s_copy(amnamecp, amname + *nam * 80, (ftnlen)80, (ftnlen)80);
    for (i__ = 1; i__ <= 3; ++i__) {
	namtacp[i__ - 1] = namta[i__ + *nam * 3];
    }

    i__1 = id + 2;
    for (j = *nam; j >= i__1; --j) {
	s_copy(amname + j * 80, amname + (j - 1) * 80, (ftnlen)80, (ftnlen)80)
		;
	for (i__ = 1; i__ <= 3; ++i__) {
	    namta[i__ + j * 3] = namta[i__ + (j - 1) * 3];
	}
    }

    s_copy(amname + (id + 1) * 80, amnamecp, (ftnlen)80, (ftnlen)80);
    for (i__ = 1; i__ <= 3; ++i__) {
	namta[i__ + (id + 1) * 3] = namtacp[i__ - 1];
    }

    return 0;
} /* reorderampl_ */

