/* materialdata_cond.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int materialdata_cond__(integer *imat, integer *ntmat___, 
	doublereal *t1l, doublereal *cocon, integer *ncocon, doublereal *cond)
{
    /* System generated locals */
    integer cocon_dim2, cocon_offset;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    integer ncoconst, id;
    extern /* Subroutine */ int exit_(integer *);
    integer seven;
    extern /* Subroutine */ int ident2_(doublereal *, doublereal *, integer *,
	     integer *, integer *);

    /* Fortran I/O blocks */
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___4 = { 0, 6, 0, 0, 0 };
    static cilist io___5 = { 0, 6, 0, 0, 0 };
    static cilist io___6 = { 0, 6, 0, 0, 0 };




/*     determines the thermal conductivity */



    /* Parameter adjustments */
    cocon_dim2 = *ntmat___;
    cocon_offset = 0 + 7 * (1 + cocon_dim2);
    cocon -= cocon_offset;
    ncocon -= 3;

    /* Function Body */
    seven = 7;

/*     calculating the conductivity coefficients */

    ncoconst = ncocon[(*imat << 1) + 1];
    if (ncoconst == 0) {
	s_wsle(&io___3);
	do_lio(&c__9, &c__1, "*ERROR in materialdata_cond", (ftnlen)27);
	e_wsle();
	s_wsle(&io___4);
	do_lio(&c__9, &c__1, "       fluid conductivity is lacking", (ftnlen)
		36);
	e_wsle();
	exit_(&c__201);
    } else if (ncoconst > 1) {
	s_wsle(&io___5);
	do_lio(&c__9, &c__1, "*ERROR in materialdata_cond", (ftnlen)27);
	e_wsle();
	s_wsle(&io___6);
	do_lio(&c__9, &c__1, "       conductivity for fluids must be isotrop"
		"ic", (ftnlen)48);
	e_wsle();
	exit_(&c__201);
    }

    ident2_(&cocon[(*imat * cocon_dim2 + 1) * 7], t1l, &ncocon[(*imat << 1) + 
	    2], &seven, &id);
    if (ncocon[(*imat << 1) + 2] == 0) {
	*cond = 0.;
    } else if (ncocon[(*imat << 1) + 2] == 1) {
	*cond = cocon[(*imat * cocon_dim2 + 1) * 7 + 1];
    } else if (id == 0) {
	*cond = cocon[(*imat * cocon_dim2 + 1) * 7 + 1];
    } else if (id == ncocon[(*imat << 1) + 2]) {
	*cond = cocon[(id + *imat * cocon_dim2) * 7 + 1];
    } else {
	*cond = cocon[(id + *imat * cocon_dim2) * 7 + 1] + (cocon[(id + 1 + *
		imat * cocon_dim2) * 7 + 1] - cocon[(id + *imat * cocon_dim2) 
		* 7 + 1]) * (*t1l - cocon[(id + *imat * cocon_dim2) * 7]) / (
		cocon[(id + 1 + *imat * cocon_dim2) * 7] - cocon[(id + *imat *
		 cocon_dim2) * 7]);
    }

    return 0;
} /* materialdata_cond__ */

