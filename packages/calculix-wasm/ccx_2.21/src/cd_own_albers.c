/* cd_own_albers.f -- translated by f2c (version 20200916).
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

/*     author: Yannick Muller */

/* Subroutine */ int cd_own_albers__(doublereal *p1, doublereal *p2, 
	doublereal *xl, doublereal *d__, doublereal *cd, doublereal *u, 
	doublereal *t1, doublereal *r__, doublereal *kappa)
{
    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 6, 0, 0, 0 };
    static cilist io___2 = { 0, 6, 0, 0, 0 };





    *p1 = *p1;
    *p2 = *p2;
    *xl = *xl;
    *d__ = *d__;
    *u = *u;
    *t1 = *t1;
    *r__ = *r__;
    *kappa = *kappa;
    *cd = 1.;
    s_wsle(&io___1);
    do_lio(&c__9, &c__1, "*WARNING while using subroutine cd_own_albers.f", (
	    ftnlen)47);
    e_wsle();
    s_wsle(&io___2);
    do_lio(&c__9, &c__1, "cd implicitely taken equal to 1", (ftnlen)31);
    e_wsle();

    return 0;

} /* cd_own_albers__ */

