/* writelm.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int writelm_(integer *iter, doublereal *xlambd, integer *
	nactive, integer *nnlconst, char *objectset, integer *nobject, 
	integer *ipoacti, integer *iconstacti, integer *inameacti, integer *
	nodedesi, doublereal *dgdxglob, integer *nk, ftnlen objectset_len)
{
    /* Format strings */
    static char fmt_103[] = "(1(3x,13a,3x,a16,a8,3x,a14,5x,a10,3x,a10))";
    static char fmt_101[] = "(1(3x,i2,8x,3x,a16,a4,3x,e14.7,3x,a8,3x,a80))";
    static char fmt_102[] = "(1(3x,i2,8x,3x,a16,a4,3x,e14.7,3x,a8,3x,i6))";

    /* System generated locals */
    integer dgdxglob_dim2, dgdxglob_offset, i__1, i__2;
    cilist ci__1;

    /* Builtin functions */
    integer s_wsle(cilist *), e_wsle(void), do_lio(integer *, integer *, char 
	    *, ftnlen), s_wsfe(cilist *), do_fio(integer *, char *, ftnlen), 
	    e_wsfe(void), s_cmp(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    integer i__;
    doublereal val;
    integer node, ipos;

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 5, 0, 0, 0 };
    static cilist io___2 = { 0, 5, 0, 0, 0 };
    static cilist io___3 = { 0, 5, 0, 0, 0 };
    static cilist io___4 = { 0, 5, 0, 0, 0 };
    static cilist io___5 = { 0, 5, 0, 0, 0 };
    static cilist io___6 = { 0, 5, 0, 0, 0 };
    static cilist io___7 = { 0, 5, 0, 0, 0 };
    static cilist io___8 = { 0, 5, 0, fmt_103, 0 };
    static cilist io___9 = { 0, 5, 0, fmt_103, 0 };
    static cilist io___10 = { 0, 5, 0, 0, 0 };
    static cilist io___11 = { 0, 5, 0, 0, 0 };
    static cilist io___14 = { 0, 5, 0, fmt_101, 0 };
    static cilist io___15 = { 0, 5, 0, fmt_101, 0 };
    static cilist io___16 = { 0, 5, 0, fmt_101, 0 };
    static cilist io___17 = { 0, 5, 0, fmt_101, 0 };
    static cilist io___20 = { 0, 5, 0, fmt_102, 0 };
    static cilist io___21 = { 0, 5, 0, fmt_102, 0 };
    static cilist io___22 = { 0, 5, 0, fmt_102, 0 };
    static cilist io___23 = { 0, 5, 0, fmt_102, 0 };
    static cilist io___24 = { 0, 5, 0, fmt_102, 0 };
    static cilist io___25 = { 0, 5, 0, fmt_102, 0 };
    static cilist io___26 = { 0, 5, 0, fmt_102, 0 };
    static cilist io___27 = { 0, 5, 0, fmt_102, 0 };
    static cilist io___28 = { 0, 5, 0, fmt_102, 0 };
    static cilist io___29 = { 0, 5, 0, fmt_102, 0 };
    static cilist io___30 = { 0, 5, 0, 0, 0 };



/*     calculates the projected gradient */





    /* Parameter adjustments */
    --xlambd;
    objectset -= 486;
    --ipoacti;
    --iconstacti;
    --inameacti;
    --nodedesi;
    dgdxglob_dim2 = *nk;
    dgdxglob_offset = 1 + 2 * (1 + dgdxglob_dim2);
    dgdxglob -= dgdxglob_offset;

    /* Function Body */
    s_wsle(&io___1);
    e_wsle();
    s_wsle(&io___2);
    e_wsle();
    s_wsle(&io___3);
    do_lio(&c__9, &c__1, "  #######################################         "
	    "    #####################################", (ftnlen)91);
    e_wsle();
    if (*iter == 1) {
	s_wsle(&io___4);
	do_lio(&c__9, &c__1, "  L A G R A N G E   M U L T I P L I E R S     "
		"        1ST   I T E R A T I O N", (ftnlen)77);
	e_wsle();
    } else if (*iter == 2) {
	s_wsle(&io___5);
	do_lio(&c__9, &c__1, "  L A G R A N G E   M U L T I P L I E R S     "
		"        2ND   I T E R A T I O N", (ftnlen)77);
	e_wsle();
    } else if (*iter == 3) {
	s_wsle(&io___6);
	do_lio(&c__9, &c__1, "  L A G R A N G E   M U L T I P L I E R S     "
		"        3RD   I T E R A T I O N", (ftnlen)77);
	e_wsle();
    } else if (*iter > 3 && *iter < 10) {
	ci__1.cierr = 0;
	ci__1.ciunit = 5;
	ci__1.cifmt = "(a42,i1,a22)";
	s_wsfe(&ci__1);
	do_fio(&c__1, "  L A G R A N G E                        M U L T I P "
		"L I E R S   ", (ftnlen)65);
	do_fio(&c__1, (char *)&(*iter), (ftnlen)sizeof(integer));
	do_fio(&c__1, "TH   I T E R A T I O N", (ftnlen)22);
	e_wsfe();
    } else {
	ci__1.cierr = 0;
	ci__1.ciunit = 5;
	ci__1.cifmt = "(a42,i3,a22)";
	s_wsfe(&ci__1);
	do_fio(&c__1, "  L A G R A N G E                        M U L T I P "
		"L I E R S   ", (ftnlen)65);
	do_fio(&c__1, (char *)&(*iter), (ftnlen)sizeof(integer));
	do_fio(&c__1, "TH   I T E R A T I O N", (ftnlen)22);
	e_wsfe();
    }
    s_wsle(&io___7);
    e_wsle();
    s_wsfe(&io___8);
    do_fio(&c__1, "NUMBER OF                                               ", 
	    (ftnlen)56);
    do_fio(&c__1, "CONSTRAINT      ", (ftnlen)16);
    do_fio(&c__1, "LE/     ", (ftnlen)8);
    do_fio(&c__1, "LAGRANGE      ", (ftnlen)14);
    do_fio(&c__1, "  ACTIVE/    ", (ftnlen)13);
    do_fio(&c__1, "   NAME OF", (ftnlen)10);
    e_wsfe();
    s_wsfe(&io___9);
    do_fio(&c__1, "CONSTRAINT                                             ", (
	    ftnlen)55);
    do_fio(&c__1, "FUNCTION        ", (ftnlen)16);
    do_fio(&c__1, "GE      ", (ftnlen)8);
    do_fio(&c__1, "MULTIPLIER    ", (ftnlen)14);
    do_fio(&c__1, "  INACTIVE", (ftnlen)10);
    do_fio(&c__1, "   CONSTRAINT", (ftnlen)13);
    e_wsfe();
    s_wsle(&io___10);
    do_lio(&c__9, &c__1, "  #######################################         "
	    "    #####################################", (ftnlen)91);
    e_wsle();
    s_wsle(&io___11);
    e_wsle();

    i__1 = *nactive;
    for (i__ = 1; i__ <= i__1; ++i__) {
	ipos = ipoacti[i__];

/*        writing of all nonlinear constraints */

	if (i__ <= *nnlconst) {
	    if (iconstacti[i__] == -1) {
		if (xlambd[i__] > 0.) {
		    s_wsfe(&io___14);
		    i__2 = ipos - 1;
		    do_fio(&c__1, (char *)&i__2, (ftnlen)sizeof(integer));
		    do_fio(&c__1, objectset + (ipos * 5 + 1) * 81, (ftnlen)81)
			    ;
		    do_fio(&c__1, "LE  ", (ftnlen)4);
		    do_fio(&c__1, (char *)&xlambd[i__], (ftnlen)sizeof(
			    doublereal));
		    do_fio(&c__1, "ACTIVE  ", (ftnlen)8);
		    do_fio(&c__1, objectset + (ipos * 5 + 5) * 81, (ftnlen)81)
			    ;
		    e_wsfe();
		} else {
		    s_wsfe(&io___15);
		    i__2 = ipos - 1;
		    do_fio(&c__1, (char *)&i__2, (ftnlen)sizeof(integer));
		    do_fio(&c__1, objectset + (ipos * 5 + 1) * 81, (ftnlen)81)
			    ;
		    do_fio(&c__1, "LE  ", (ftnlen)4);
		    do_fio(&c__1, (char *)&xlambd[i__], (ftnlen)sizeof(
			    doublereal));
		    do_fio(&c__1, "INACTIVE", (ftnlen)8);
		    do_fio(&c__1, objectset + (ipos * 5 + 5) * 81, (ftnlen)81)
			    ;
		    e_wsfe();
		}
	    } else {
		if (xlambd[i__] > 0.) {
		    s_wsfe(&io___16);
		    i__2 = ipos - 1;
		    do_fio(&c__1, (char *)&i__2, (ftnlen)sizeof(integer));
		    do_fio(&c__1, objectset + (ipos * 5 + 1) * 81, (ftnlen)81)
			    ;
		    do_fio(&c__1, "GE  ", (ftnlen)4);
		    do_fio(&c__1, (char *)&xlambd[i__], (ftnlen)sizeof(
			    doublereal));
		    do_fio(&c__1, "INACTIVE", (ftnlen)8);
		    do_fio(&c__1, objectset + (ipos * 5 + 5) * 81, (ftnlen)81)
			    ;
		    e_wsfe();
		} else {
		    s_wsfe(&io___17);
		    i__2 = ipos - 1;
		    do_fio(&c__1, (char *)&i__2, (ftnlen)sizeof(integer));
		    do_fio(&c__1, objectset + (ipos * 5 + 1) * 81, (ftnlen)81)
			    ;
		    do_fio(&c__1, "GE  ", (ftnlen)4);
		    do_fio(&c__1, (char *)&xlambd[i__], (ftnlen)sizeof(
			    doublereal));
		    do_fio(&c__1, "ACTIVE  ", (ftnlen)8);
		    do_fio(&c__1, objectset + (ipos * 5 + 5) * 81, (ftnlen)81)
			    ;
		    e_wsfe();
		}
	    }

/*        writing of all linear (geometric) constraints */

	} else {

/*           MAXMEMBERSIZE */

	    if (s_cmp(objectset + (inameacti[i__] * 5 + 1) * 81, "MAXMEMBERS"
		    "IZE", (ftnlen)13, (ftnlen)13) == 0) {
		node = nodedesi[ipoacti[i__]];
		val = dgdxglob[(node + inameacti[i__] * dgdxglob_dim2 << 1) + 
			2];
		if (xlambd[i__] < 0. && val > 0.) {
		    s_wsfe(&io___20);
		    i__2 = inameacti[i__] - 1;
		    do_fio(&c__1, (char *)&i__2, (ftnlen)sizeof(integer));
		    do_fio(&c__1, objectset + (inameacti[i__] * 5 + 1) * 81, (
			    ftnlen)81);
		    do_fio(&c__1, "LE  ", (ftnlen)4);
		    do_fio(&c__1, (char *)&xlambd[i__], (ftnlen)sizeof(
			    doublereal));
		    do_fio(&c__1, "ACTIVE  ", (ftnlen)8);
		    do_fio(&c__1, (char *)&nodedesi[ipos], (ftnlen)sizeof(
			    integer));
		    e_wsfe();
		} else {
		    s_wsfe(&io___21);
		    i__2 = inameacti[i__] - 1;
		    do_fio(&c__1, (char *)&i__2, (ftnlen)sizeof(integer));
		    do_fio(&c__1, objectset + (inameacti[i__] * 5 + 1) * 81, (
			    ftnlen)81);
		    do_fio(&c__1, "LE  ", (ftnlen)4);
		    do_fio(&c__1, (char *)&xlambd[i__], (ftnlen)sizeof(
			    doublereal));
		    do_fio(&c__1, "INACTIVE", (ftnlen)8);
		    do_fio(&c__1, (char *)&nodedesi[ipos], (ftnlen)sizeof(
			    integer));
		    e_wsfe();
		}

/*           MINMEMBERSIZE */

	    } else if (s_cmp(objectset + (inameacti[i__] * 5 + 1) * 81, "MIN"
		    "MEMBERSIZE", (ftnlen)13, (ftnlen)13) == 0) {
		node = nodedesi[ipoacti[i__]];
		val = dgdxglob[(node + inameacti[i__] * dgdxglob_dim2 << 1) + 
			2];
		if (xlambd[i__] > 0. && val > 0.) {
		    s_wsfe(&io___22);
		    i__2 = inameacti[i__] - 1;
		    do_fio(&c__1, (char *)&i__2, (ftnlen)sizeof(integer));
		    do_fio(&c__1, objectset + (inameacti[i__] * 5 + 1) * 81, (
			    ftnlen)81);
		    do_fio(&c__1, "LE  ", (ftnlen)4);
		    do_fio(&c__1, (char *)&xlambd[i__], (ftnlen)sizeof(
			    doublereal));
		    do_fio(&c__1, "ACTIVE  ", (ftnlen)8);
		    do_fio(&c__1, (char *)&nodedesi[ipos], (ftnlen)sizeof(
			    integer));
		    e_wsfe();
		} else {
		    s_wsfe(&io___23);
		    i__2 = inameacti[i__] - 1;
		    do_fio(&c__1, (char *)&i__2, (ftnlen)sizeof(integer));
		    do_fio(&c__1, objectset + (inameacti[i__] * 5 + 1) * 81, (
			    ftnlen)81);
		    do_fio(&c__1, "LE  ", (ftnlen)4);
		    do_fio(&c__1, (char *)&xlambd[i__], (ftnlen)sizeof(
			    doublereal));
		    do_fio(&c__1, "INACTIVE", (ftnlen)8);
		    do_fio(&c__1, (char *)&nodedesi[ipos], (ftnlen)sizeof(
			    integer));
		    e_wsfe();
		}

/*           MAXSHRINKAGE */

	    } else if (s_cmp(objectset + ((inameacti[i__] * 5 + 1) * 81 + 3), 
		    "SHRINKAGE", (ftnlen)9, (ftnlen)9) == 0) {
		node = nodedesi[ipoacti[i__]];
		val = dgdxglob[(node + inameacti[i__] * dgdxglob_dim2 << 1) + 
			2];
		if (xlambd[i__] > 0. && val >= 0.) {
		    s_wsfe(&io___24);
		    i__2 = inameacti[i__] - 1;
		    do_fio(&c__1, (char *)&i__2, (ftnlen)sizeof(integer));
		    do_fio(&c__1, objectset + (inameacti[i__] * 5 + 1) * 81, (
			    ftnlen)81);
		    do_fio(&c__1, "LE  ", (ftnlen)4);
		    do_fio(&c__1, (char *)&xlambd[i__], (ftnlen)sizeof(
			    doublereal));
		    do_fio(&c__1, "ACTIVE  ", (ftnlen)8);
		    do_fio(&c__1, (char *)&nodedesi[ipos], (ftnlen)sizeof(
			    integer));
		    e_wsfe();
		} else {
		    s_wsfe(&io___25);
		    i__2 = inameacti[i__] - 1;
		    do_fio(&c__1, (char *)&i__2, (ftnlen)sizeof(integer));
		    do_fio(&c__1, objectset + (inameacti[i__] * 5 + 1) * 81, (
			    ftnlen)81);
		    do_fio(&c__1, "LE  ", (ftnlen)4);
		    do_fio(&c__1, (char *)&xlambd[i__], (ftnlen)sizeof(
			    doublereal));
		    do_fio(&c__1, "INACTIVE", (ftnlen)8);
		    do_fio(&c__1, (char *)&nodedesi[ipos], (ftnlen)sizeof(
			    integer));
		    e_wsfe();
		}

/*           MAXGROWTH */

	    } else if (s_cmp(objectset + ((inameacti[i__] * 5 + 1) * 81 + 3), 
		    "GROWTH", (ftnlen)6, (ftnlen)6) == 0) {
		node = nodedesi[ipoacti[i__]];
		val = dgdxglob[(node + inameacti[i__] * dgdxglob_dim2 << 1) + 
			2];
		if (xlambd[i__] < 0. && val >= 0.) {
		    s_wsfe(&io___26);
		    i__2 = inameacti[i__] - 1;
		    do_fio(&c__1, (char *)&i__2, (ftnlen)sizeof(integer));
		    do_fio(&c__1, objectset + (inameacti[i__] * 5 + 1) * 81, (
			    ftnlen)81);
		    do_fio(&c__1, "LE  ", (ftnlen)4);
		    do_fio(&c__1, (char *)&xlambd[i__], (ftnlen)sizeof(
			    doublereal));
		    do_fio(&c__1, "ACTIVE  ", (ftnlen)8);
		    do_fio(&c__1, (char *)&nodedesi[ipos], (ftnlen)sizeof(
			    integer));
		    e_wsfe();
		} else {
		    s_wsfe(&io___27);
		    i__2 = inameacti[i__] - 1;
		    do_fio(&c__1, (char *)&i__2, (ftnlen)sizeof(integer));
		    do_fio(&c__1, objectset + (inameacti[i__] * 5 + 1) * 81, (
			    ftnlen)81);
		    do_fio(&c__1, "LE  ", (ftnlen)4);
		    do_fio(&c__1, (char *)&xlambd[i__], (ftnlen)sizeof(
			    doublereal));
		    do_fio(&c__1, "INACTIVE", (ftnlen)8);
		    do_fio(&c__1, (char *)&nodedesi[ipos], (ftnlen)sizeof(
			    integer));
		    e_wsfe();
		}

/*           PACKAGING */

	    } else if (s_cmp(objectset + (inameacti[i__] * 5 + 1) * 81, "PAC"
		    "KAGING", (ftnlen)9, (ftnlen)9) == 0) {
		node = nodedesi[ipoacti[i__]];
		val = dgdxglob[(node + inameacti[i__] * dgdxglob_dim2 << 1) + 
			2];
		if (xlambd[i__] < 0. && val >= 0.) {
		    s_wsfe(&io___28);
		    i__2 = inameacti[i__] - 1;
		    do_fio(&c__1, (char *)&i__2, (ftnlen)sizeof(integer));
		    do_fio(&c__1, objectset + (inameacti[i__] * 5 + 1) * 81, (
			    ftnlen)81);
		    do_fio(&c__1, "GE  ", (ftnlen)4);
		    do_fio(&c__1, (char *)&xlambd[i__], (ftnlen)sizeof(
			    doublereal));
		    do_fio(&c__1, "ACTIVE  ", (ftnlen)8);
		    do_fio(&c__1, (char *)&nodedesi[ipos], (ftnlen)sizeof(
			    integer));
		    e_wsfe();
		} else {
		    s_wsfe(&io___29);
		    i__2 = inameacti[i__] - 1;
		    do_fio(&c__1, (char *)&i__2, (ftnlen)sizeof(integer));
		    do_fio(&c__1, objectset + (inameacti[i__] * 5 + 1) * 81, (
			    ftnlen)81);
		    do_fio(&c__1, "GE  ", (ftnlen)4);
		    do_fio(&c__1, (char *)&xlambd[i__], (ftnlen)sizeof(
			    doublereal));
		    do_fio(&c__1, "INACTIVE", (ftnlen)8);
		    do_fio(&c__1, (char *)&nodedesi[ipos], (ftnlen)sizeof(
			    integer));
		    e_wsfe();
		}
	    }
	}
    }
    s_wsle(&io___30);
    e_wsle();

    return 0;


} /* writelm_ */

