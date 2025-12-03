/* changedepterm.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int changedepterm_(integer *ikmpc, integer *ilmpc, integer *
	nmpc, integer *mpc, integer *idofrem, integer *idofins)
{
    /* System generated locals */
    integer i__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    integer k, id;
    extern /* Subroutine */ int exit_(integer *), nident_(integer *, integer *
	    , integer *, integer *);

    /* Fortran I/O blocks */
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___4 = { 0, 6, 0, 0, 0 };
    static cilist io___5 = { 0, 6, 0, 0, 0 };
    static cilist io___6 = { 0, 6, 0, 0, 0 };
    static cilist io___7 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___10 = { 0, 6, 0, 0, 0 };



/*     changes the dependent term in ikmpc and ilmpc for MPC mpc. */



/*     remove MPC from ikmpc */

    /* Parameter adjustments */
    --ilmpc;
    --ikmpc;

    /* Function Body */
    nident_(&ikmpc[1], idofrem, nmpc, &id);
    if (id > 0) {
	if (ikmpc[id] == *idofrem) {
	    i__1 = *nmpc;
	    for (k = id + 1; k <= i__1; ++k) {
		ikmpc[k - 1] = ikmpc[k];
		ilmpc[k - 1] = ilmpc[k];
	    }
	} else {
	    s_wsle(&io___3);
	    do_lio(&c__9, &c__1, "*ERROR in changedepterm", (ftnlen)23);
	    e_wsle();
	    s_wsle(&io___4);
	    do_lio(&c__9, &c__1, "       ikmpc database corrupted", (ftnlen)
		    31);
	    e_wsle();
	    exit_(&c__201);
	}
    } else {
	s_wsle(&io___5);
	do_lio(&c__9, &c__1, "*ERROR in changedepterm", (ftnlen)23);
	e_wsle();
	s_wsle(&io___6);
	do_lio(&c__9, &c__1, "       ikmpc database corrupted", (ftnlen)31);
	e_wsle();
	exit_(&c__201);
    }

/*     insert new MPC */

    i__1 = *nmpc - 1;
    nident_(&ikmpc[1], idofins, &i__1, &id);
    if (id > 0 && ikmpc[id] == *idofins) {
	s_wsle(&io___7);
	do_lio(&c__9, &c__1, "*ERROR in changedepterm: dependent DOF", (
		ftnlen)38);
	e_wsle();
	s_wsle(&io___8);
	do_lio(&c__9, &c__1, "       of nonlinear MPC cannot be changed", (
		ftnlen)41);
	e_wsle();
	s_wsle(&io___9);
	do_lio(&c__9, &c__1, "       since new dependent DOF is already", (
		ftnlen)41);
	e_wsle();
	s_wsle(&io___10);
	do_lio(&c__9, &c__1, "       used in another MPC", (ftnlen)26);
	e_wsle();
	exit_(&c__201);
    } else {
	i__1 = id + 2;
	for (k = *nmpc; k >= i__1; --k) {
	    ikmpc[k] = ikmpc[k - 1];
	    ilmpc[k] = ilmpc[k - 1];
	}
	ikmpc[id + 1] = *idofins;
	ilmpc[id + 1] = *mpc;
    }

    return 0;
} /* changedepterm_ */

