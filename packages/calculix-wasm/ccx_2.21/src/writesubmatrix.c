/* writesubmatrix.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int writesubmatrix_(doublereal *submatrix, integer *
	noderetain, integer *ndirretain, integer *nretain, char *jobnamec, 
	integer *jmax, ftnlen jobnamec_len)
{
    /* Format strings */
    static char fmt_100[] = "(\002**\002)";
    static char fmt_101[] = "(\002** GENERATION OF SUBSTRUCTURE\002)";
    static char fmt_102[] = "(\002*USER ELEMENT,NODES= \002,i10,\002,LINEA"
	    "R\002)";
    static char fmt_103[] = "(\002** ELEMENT NODES\002)";
    static char fmt_104[] = "(\002**\002,i10,\002,\002,i10,\002,\002,i10,"
	    "\002,\002,i10,\002,\002,i10,\002,\002,i10,\002,\002,i10,\002,"
	    "\002,i10,\002,\002,i10,\002,\002,i10,\002,\002)";
    static char fmt_105[] = "(i10)";
    static char fmt_106[] = "(i10,\002,\002,i10)";
    static char fmt_107[] = "(\002*MATRIX,TYPE=STIFFNESS\002)";
    static char fmt_108[] = "(e20.13,\002,\002,e20.13,\002,\002,e20.13,\002"
	    ",\002,e20.13,\002,\002)";
    static char fmt_109[] = "(i10,\002,\002,i5,\002,\002,i10,\002,\002,i5"
	    ",\002,\002,e20.13)";

    /* System generated locals */
    integer submatrix_dim1, submatrix_offset, i__1, i__2;
    olist o__1;
    cllist cl__1;

    /* Builtin functions */
    integer i_indx(char *, char *, ftnlen, ftnlen), s_wsle(cilist *), do_lio(
	    integer *, integer *, char *, ftnlen), e_wsle(void);
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);
    integer f_open(olist *), s_wsfe(cilist *), e_wsfe(void), do_fio(integer *,
	     char *, ftnlen), f_clos(cllist *);

    /* Local variables */
    integer i__, j;
    char fn[132];
    integer ilen;
    extern /* Subroutine */ int exit_(integer *);

    /* Fortran I/O blocks */
    static cilist io___2 = { 0, 6, 0, 0, 0 };
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___4 = { 0, 6, 0, 0, 0 };
    static cilist io___5 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 12, 0, fmt_100, 0 };
    static cilist io___9 = { 0, 12, 0, fmt_101, 0 };
    static cilist io___10 = { 0, 12, 0, fmt_102, 0 };
    static cilist io___11 = { 0, 12, 0, fmt_103, 0 };
    static cilist io___12 = { 0, 12, 0, fmt_104, 0 };
    static cilist io___13 = { 0, 12, 0, fmt_105, 0 };
    static cilist io___14 = { 0, 12, 0, fmt_106, 0 };
    static cilist io___15 = { 0, 12, 0, fmt_107, 0 };
    static cilist io___17 = { 0, 12, 0, fmt_108, 0 };
    static cilist io___18 = { 0, 12, 0, fmt_109, 0 };



/*     writing the matrix of a substructure to a .mtx-file */





    /* Parameter adjustments */
    --noderetain;
    --ndirretain;
    submatrix_dim1 = *nretain;
    submatrix_offset = 1 + submatrix_dim1;
    submatrix -= submatrix_offset;
    jobnamec -= 132;
    --jmax;

    /* Function Body */
    ilen = i_indx(jobnamec + 660, " ", (ftnlen)132, (ftnlen)1);
    if (ilen > 129) {
	s_wsle(&io___2);
	do_lio(&c__9, &c__1, "*ERROR in writesubmatrix:", (ftnlen)25);
	e_wsle();
	s_wsle(&io___3);
	do_lio(&c__9, &c__1, "       name of file for storing the submatrix", 
		(ftnlen)45);
	e_wsle();
	s_wsle(&io___4);
	do_lio(&c__9, &c__1, "       is too long (> 128 char); name = ", (
		ftnlen)40);
	e_wsle();
	s_wsle(&io___5);
	do_lio(&c__9, &c__1, jobnamec + 660, (ftnlen)132);
	e_wsle();
	exit_(&c__201);
    } else {
	s_copy(fn, jobnamec + 660, ilen - 1, ilen - 1);
	s_copy(fn + (ilen - 1), ".mtx", (ftnlen)4, (ftnlen)4);
	for (i__ = ilen + 4; i__ <= 132; ++i__) {
	    *(unsigned char *)&fn[i__ - 1] = ' ';
	}
    }

    if (jmax[1] == 1) {

/*       *USER ELEMENT format */

	o__1.oerr = 0;
	o__1.ounit = 12;
	o__1.ofnmlen = 132;
	o__1.ofnm = fn;
	o__1.orl = 0;
	o__1.osta = "unknown";
	o__1.oacc = 0;
	o__1.ofm = 0;
	o__1.oblnk = 0;
	f_open(&o__1);
	s_wsfe(&io___8);
	e_wsfe();
	s_wsfe(&io___9);
	e_wsfe();
	s_wsfe(&io___10);
	do_fio(&c__1, (char *)&(*nretain), (ftnlen)sizeof(integer));
	e_wsfe();
	s_wsfe(&io___11);
	e_wsfe();
	s_wsfe(&io___12);
	i__1 = *nretain;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_fio(&c__1, (char *)&noderetain[i__], (ftnlen)sizeof(integer));
	}
	e_wsfe();
	s_wsfe(&io___13);
	do_fio(&c__1, (char *)&ndirretain[1], (ftnlen)sizeof(integer));
	e_wsfe();
	s_wsfe(&io___14);
	i__1 = *nretain;
	for (i__ = 2; i__ <= i__1; ++i__) {
	    do_fio(&c__1, (char *)&i__, (ftnlen)sizeof(integer));
	    do_fio(&c__1, (char *)&ndirretain[i__], (ftnlen)sizeof(integer));
	}
	e_wsfe();
	s_wsfe(&io___15);
	e_wsfe();
	i__1 = *nretain;
	for (j = 1; j <= i__1; ++j) {
	    s_wsfe(&io___17);
	    i__2 = j;
	    for (i__ = 1; i__ <= i__2; ++i__) {
		do_fio(&c__1, (char *)&submatrix[i__ + j * submatrix_dim1], (
			ftnlen)sizeof(doublereal));
	    }
	    e_wsfe();
	}
	cl__1.cerr = 0;
	cl__1.cunit = 12;
	cl__1.csta = 0;
	f_clos(&cl__1);
    } else if (jmax[1] == 2) {

/*       *MATRIX ASSEMBLE format */

	o__1.oerr = 0;
	o__1.ounit = 12;
	o__1.ofnmlen = 132;
	o__1.ofnm = fn;
	o__1.orl = 0;
	o__1.osta = "unknown";
	o__1.oacc = 0;
	o__1.ofm = 0;
	o__1.oblnk = 0;
	f_open(&o__1);
	i__1 = *nretain;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    i__2 = i__;
	    for (j = 1; j <= i__2; ++j) {
		s_wsfe(&io___18);
		do_fio(&c__1, (char *)&noderetain[i__], (ftnlen)sizeof(
			integer));
		do_fio(&c__1, (char *)&ndirretain[i__], (ftnlen)sizeof(
			integer));
		do_fio(&c__1, (char *)&noderetain[j], (ftnlen)sizeof(integer))
			;
		do_fio(&c__1, (char *)&ndirretain[j], (ftnlen)sizeof(integer))
			;
		do_fio(&c__1, (char *)&submatrix[i__ + j * submatrix_dim1], (
			ftnlen)sizeof(doublereal));
		e_wsfe();
	    }
	}
	cl__1.cerr = 0;
	cl__1.cunit = 12;
	cl__1.csta = 0;
	f_clos(&cl__1);
    }

    return 0;
} /* writesubmatrix_ */

