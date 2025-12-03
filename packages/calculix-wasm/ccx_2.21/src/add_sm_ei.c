/* add_sm_ei.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int add_sm_ei__(doublereal *au, doublereal *ad, doublereal *
	aub, doublereal *adb, integer *jq, integer *irow, integer *i__, 
	integer *j, doublereal *value, doublereal *valuem, integer *i0, 
	integer *i1)
{
    /* System generated locals */
    integer i__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    integer ipointer, id, ii, jj;
    extern /* Subroutine */ int nident_(integer *, integer *, integer *, 
	    integer *);

    /* Fortran I/O blocks */
    static cilist io___5 = { 0, 6, 0, 0, 0 };



/*     stores the stiffness coefficient (i,j) with value "value" */
/*     in the stiffness matrix stored in sparse matrix format and */
/*     the mass coefficient (i,j) with value "valuem" in the */
/*     mass matrix stored in sparse matrix format */




    /* Parameter adjustments */
    --irow;
    --jq;
    --adb;
    --aub;
    --ad;
    --au;

    /* Function Body */
    if (*i__ == *j) {
	if (*i0 == *i1) {
	    ad[*i__] += *value;
	    adb[*i__] += *valuem;
	} else {
	    ad[*i__] += *value * 2.;
	    adb[*i__] += *valuem * 2.;
	}
	return 0;
    } else if (*i__ > *j) {
	ii = *i__;
	jj = *j;
    } else {
	ii = *j;
	jj = *i__;
    }
/*      write(*,*) ii,jj,value,valuem */

    i__1 = jq[jj + 1] - jq[jj];
    nident_(&irow[jq[jj]], &ii, &i__1, &id);

    ipointer = jq[jj] + id - 1;

    if (irow[ipointer] != ii) {
	s_wsle(&io___5);
	do_lio(&c__9, &c__1, "*ERROR in add_sm_ei: coefficient should be 0", (
		ftnlen)44);
	e_wsle();
/*         write(*,*) i,j,ii,jj,ipointer,irow(ipointer) */
/*         call exit(201) */
    } else {
	au[ipointer] += *value;
	aub[ipointer] += *valuem;
    }

    return 0;
} /* add_sm_ei__ */

