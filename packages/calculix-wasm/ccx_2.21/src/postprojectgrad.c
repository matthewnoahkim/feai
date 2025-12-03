/* postprojectgrad.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int postprojectgrad_(integer *ndesi, integer *nodedesi, 
	doublereal *dgdxglob, integer *nactive, integer *nobject, integer *
	nnlconst, integer *ipoacti, integer *nk, char *objectset, integer *
	inameacti, ftnlen objectset_len)
{
    /* System generated locals */
    integer dgdxglob_dim2, dgdxglob_offset, i__1;

    /* Builtin functions */
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);
    integer s_wsle(cilist *), e_wsle(void), do_lio(integer *, integer *, char 
	    *, ftnlen);

    /* Local variables */
    integer i__, node, irow;

    /* Fortran I/O blocks */
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___4 = { 0, 6, 0, 0, 0 };
    static cilist io___5 = { 0, 6, 0, 0, 0 };
    static cilist io___7 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___10 = { 0, 6, 0, 0, 0 };
    static cilist io___11 = { 0, 6, 0, 0, 0 };
    static cilist io___12 = { 0, 6, 0, 0, 0 };



/*     calculates the projected gradient */





/*     calculation of final projected gradient */
/*     in case of an active constraint */

    /* Parameter adjustments */
    --nodedesi;
    --ipoacti;
    dgdxglob_dim2 = *nk;
    dgdxglob_offset = 1 + 2 * (1 + dgdxglob_dim2);
    dgdxglob -= dgdxglob_offset;
    objectset -= 486;
    --inameacti;

    /* Function Body */
    if (*nactive > 0) {
	i__1 = *ndesi;
	for (irow = 1; irow <= i__1; ++irow) {
	    node = nodedesi[irow];
	    dgdxglob[(node + *nobject * dgdxglob_dim2 << 1) + 2] = dgdxglob[(
		    node + dgdxglob_dim2 << 1) + 2] - dgdxglob[(node + *
		    nobject * dgdxglob_dim2 << 1) + 2];
	}
	s_copy(objectset + (*nobject * 5 + 1) * 81, "PROJECTGRAD", (ftnlen)11,
		 (ftnlen)11);

	s_wsle(&io___3);
	e_wsle();
	s_wsle(&io___4);
	do_lio(&c__9, &c__1, "*INFO: at least 1 constraint active.", (ftnlen)
		36);
	e_wsle();
	s_wsle(&io___5);
	do_lio(&c__9, &c__1, "       projected gradient calculated", (ftnlen)
		36);
	e_wsle();

/*     prepare output of objective sensitivity as feasible direction */

    } else {
	s_copy(objectset + 486, "PROJECTGRAD", (ftnlen)11, (ftnlen)11);
	for (i__ = 12; i__ <= 20; ++i__) {
	    *(unsigned char *)&objectset[i__ + 485] = ' ';
	}
	i__1 = *ndesi;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    dgdxglob[(nodedesi[i__] + dgdxglob_dim2 << 1) + 1] = 0.;
	}
	s_wsle(&io___7);
	e_wsle();
	s_wsle(&io___8);
	do_lio(&c__9, &c__1, "*INFO: no constraint active", (ftnlen)27);
	e_wsle();
	s_wsle(&io___9);
	do_lio(&c__9, &c__1, "       no projected gradient calculated", (
		ftnlen)39);
	e_wsle();
	s_wsle(&io___10);
	do_lio(&c__9, &c__1, "       senstivity of the objective function", (
		ftnlen)43);
	e_wsle();
	s_wsle(&io___11);
	do_lio(&c__9, &c__1, "       taken as feasible direction", (ftnlen)34)
		;
	e_wsle();
	s_wsle(&io___12);
	e_wsle();
    }

    return 0;
} /* postprojectgrad_ */

