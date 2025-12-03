/* writeobj.f -- translated by f2c (version 20200916).
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

static integer c__1 = 1;
static integer c__9 = 9;


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

/* Subroutine */ int writeobj_(char *objectset, integer *iobject, doublereal *
	g0, doublereal *dgdxglob, integer *nobject, integer *ndesi, integer *
	nodedesi, integer *nk, integer *nobjectstart, ftnlen objectset_len)
{
    /* System generated locals */
    integer dgdxglob_dim2, dgdxglob_offset, i__1;
    doublereal d__1;
    cilist ci__1;

    /* Builtin functions */
    integer s_wsle(cilist *), e_wsle(void), s_wsfe(cilist *), do_fio(integer *
	    , char *, ftnlen), e_wsfe(void), do_lio(integer *, integer *, 
	    char *, ftnlen);
    double sqrt(doublereal);

    /* Local variables */
    integer i__, j;
    doublereal dd, inode;

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 5, 0, 0, 0 };
    static cilist io___2 = { 0, 5, 0, 0, 0 };
    static cilist io___3 = { 0, 5, 0, 0, 0 };
    static cilist io___4 = { 0, 5, 0, 0, 0 };



/*     writes the results design repsonse information in the .dat file */






/*     write header in .dat file */

    /* Parameter adjustments */
    objectset -= 486;
    --g0;
    --nodedesi;
    dgdxglob_dim2 = *nk;
    dgdxglob_offset = 1 + 2 * (1 + dgdxglob_dim2);
    dgdxglob -= dgdxglob_offset;

    /* Function Body */
    if (*iobject == *nobjectstart) {
	s_wsle(&io___1);
	e_wsle();
	ci__1.cierr = 0;
	ci__1.ciunit = 5;
	ci__1.cifmt = "(a113)";
	s_wsfe(&ci__1);
	do_fio(&c__1, "   ##################################################"
		"############################################################"
		"###", (ftnlen)116);
	e_wsfe();
	s_wsle(&io___2);
	do_lio(&c__9, &c__1, "  D E S I G N   R E S P O N S E               "
		"     I N F O R M A T I O N", (ftnlen)72);
	e_wsle();
	s_wsle(&io___3);
	e_wsle();
	ci__1.cierr = 0;
	ci__1.ciunit = 5;
	ci__1.cifmt = "(3x,16a,3x,18a,3x,18a,3x,80a)";
	s_wsfe(&ci__1);
	do_fio(&c__1, "FUNCTION        ", (ftnlen)16);
	do_fio(&c__1, "FUNCTION VALUE    ", (ftnlen)18);
	do_fio(&c__1, "LENGTH GRADIENT   ", (ftnlen)18);
	do_fio(&c__1, "NAME                                                 "
		"       ", (ftnlen)60);
	e_wsfe();
	ci__1.cierr = 0;
	ci__1.ciunit = 5;
	ci__1.cifmt = "(a113)";
	s_wsfe(&ci__1);
	do_fio(&c__1, "   ##################################################"
		"############################################################"
		"###", (ftnlen)116);
	e_wsfe();
	s_wsle(&io___4);
	e_wsle();
    }

/*     write design repsonse in .dat file */

    i__ = *iobject + 1;
    dd = 0.;
    i__1 = *ndesi;
    for (j = 1; j <= i__1; ++j) {
	inode = (doublereal) nodedesi[j];
/* Computing 2nd power */
	d__1 = dgdxglob[((integer) inode + i__ * dgdxglob_dim2 << 1) + 1];
	dd += d__1 * d__1;
    }
    dd = sqrt(dd);
    ci__1.cierr = 0;
    ci__1.ciunit = 5;
    ci__1.cifmt = "(3x,a16,e14.7,3x,e16.7,3x,a80)";
    s_wsfe(&ci__1);
    do_fio(&c__1, objectset + (i__ * 5 + 1) * 81, (ftnlen)81);
    do_fio(&c__1, (char *)&g0[i__], (ftnlen)sizeof(doublereal));
    do_fio(&c__1, (char *)&dd, (ftnlen)sizeof(doublereal));
    do_fio(&c__1, objectset + (i__ * 5 + 5) * 81, (ftnlen)81);
    e_wsfe();

/* L101: */
/* L102: */

    return 0;
} /* writeobj_ */

