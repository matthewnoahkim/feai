/* add_bo_st.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int add_bo_st__(doublereal *au, integer *jq, integer *irow, 
	integer *i__, integer *j, doublereal *value)
{
    /* System generated locals */
    integer i__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    integer ipointer, id;
    extern /* Subroutine */ int exit_(integer *), nident_(integer *, integer *
	    , integer *, integer *);

    /* Fortran I/O blocks */
    static cilist io___3 = { 0, 6, 0, 0, 0 };



/*     stores the boundary stiffness coefficient (i,j) with value "value" */
/*     in the stiffness matrix stored in spare matrix format */






    /* Parameter adjustments */
    --irow;
    --jq;
    --au;

    /* Function Body */
    i__1 = jq[*j + 1] - jq[*j];
    nident_(&irow[jq[*j]], i__, &i__1, &id);

    ipointer = jq[*j] + id - 1;

    if (irow[ipointer] != *i__) {
/*         write(*,*) i,j,ipointer,irow(ipointer) */
	s_wsle(&io___3);
	do_lio(&c__9, &c__1, "*ERROR in add_bo_st: coefficient should be 0", (
		ftnlen)44);
	e_wsle();
	exit_(&c__201);
    } else {
	au[ipointer] += *value;
    }

    return 0;
} /* add_bo_st__ */

