/* createteleinv.f -- translated by f2c (version 20200916).
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

static integer c__4 = 4;
static integer c__3 = 3;
static integer c__9 = 9;
static integer c__1 = 1;
static integer c__5 = 5;


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


/*     Generate local transformation matrix \f$ T_e^{quad,-1} \f$ needed for quad-quad mortar method */
/*    see phd-thesis Sitzmann equation (4.3) for \f$ T_e^{quad} \f$ */
/*    Author: Saskia Sitzmann */

/*    [in]     ipkon       pointer into field kon */
/*    [in]     kon         Field containing the connectivity of the elements in succesive order */
/*    [in]     lakon       element label */
/*    [in]     islavsurf   islavsurf(1,i) slaveface i islavsurf(2,i) pointer into imastsurf and pmastsurf */
/*    [out]    contr       field containing T_e contributions for current face */
/*    [out]    icontr1     (i)  row  of contribution(i) */
/*    [out]    icontr2     (i)  column of contribution(i) */
/*    [out]    icounter    counter variable for contr */
/*    [in]     lface	 current slave face */

/* Subroutine */ int createteleinv_(integer *ipkon, integer *kon, char *lakon,
	 integer *islavsurf, doublereal *contr, integer *icontr1, integer *
	icontr2, integer *icounter, integer *lface, ftnlen lakon_len)
{
    /* System generated locals */
    integer i__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    extern integer getlocno_(integer *, integer *, integer *);
    integer j, m;
    extern /* Subroutine */ int getnumberofnodes_(integer *, integer *, char *
	    , integer *, integer *, integer *, ftnlen);
    integer ifac;
    extern integer modf_(integer *, integer *);
    integer nope, konl[20];
    doublereal alpha;
    logical debug;
    integer lnode[16]	/* was [2][8] */, nopes, ifaces, jfaces, nelems, 
	    idummy;

    /* Fortran I/O blocks */
    static cilist io___14 = { 0, 6, 0, 0, 0 };
    static cilist io___15 = { 0, 6, 0, 0, 0 };



/*     Generate local transformation matrix T */

/*     Author: Sitzmann,Saskia ; */






    /* Parameter adjustments */
    --icontr2;
    --icontr1;
    --contr;
    islavsurf -= 3;
    lakon -= 8;
    --kon;
    --ipkon;

    /* Function Body */
    debug = FALSE_;
    alpha = .20000000000000001f;
/*      alpha=5.0/16.0 */
    *icounter = 0;
    ifaces = islavsurf[(*lface << 1) + 1];
    nelems = ifaces / 10;
    jfaces = ifaces - nelems * 10;
    getnumberofnodes_(&nelems, &jfaces, lakon + 8, &nope, &nopes, &idummy, (
	    ftnlen)8);
    i__1 = nope;
    for (j = 1; j <= i__1; ++j) {
	konl[j - 1] = kon[ipkon[nelems] + j];
    }
    i__1 = nopes;
    for (m = 1; m <= i__1; ++m) {
	ifac = getlocno_(&m, &jfaces, &nope);
	lnode[(m << 1) - 2] = konl[ifac - 1];
    }
    if (nopes == 8) {
	for (j = 1; j <= 4; ++j) {
	    ++(*icounter);
	    contr[*icounter] = 1.f;
	    icontr1[*icounter] = lnode[(j << 1) - 2];
	    icontr2[*icounter] = lnode[(j << 1) - 2];
	}
	for (j = 5; j <= 8; ++j) {
	    ++(*icounter);
	    contr[*icounter] = 1.f / (1.f - alpha * 2);
	    icontr1[*icounter] = lnode[(j << 1) - 2];
	    icontr2[*icounter] = lnode[(j << 1) - 2];
	}
	for (j = 1; j <= 4; ++j) {
	    ++(*icounter);
	    contr[*icounter] = -alpha / (1 - alpha * 2);
	    icontr1[*icounter] = lnode[(j + 4 << 1) - 2];
	    icontr2[*icounter] = lnode[(j << 1) - 2];
	    ++(*icounter);
	    contr[*icounter] = -alpha / (1 - alpha * 2);
	    i__1 = j - 1;
	    icontr1[*icounter] = lnode[(modf_(&c__4, &i__1) + 4 << 1) - 2];
	    icontr2[*icounter] = lnode[(j << 1) - 2];
	}
    } else if (nopes == 4) {
	for (j = 1; j <= 4; ++j) {
	    ++(*icounter);
	    contr[*icounter] = 1.f;
	    icontr1[*icounter] = lnode[(j << 1) - 2];
	    icontr2[*icounter] = lnode[(j << 1) - 2];
	}
    } else if (nopes == 6) {
	for (j = 1; j <= 3; ++j) {
	    ++(*icounter);
	    contr[*icounter] = 1.f;
	    icontr1[*icounter] = lnode[(j << 1) - 2];
	    icontr2[*icounter] = lnode[(j << 1) - 2];
	}
	for (j = 4; j <= 6; ++j) {
	    ++(*icounter);
	    contr[*icounter] = 1 / (1.f - alpha * 2);
	    icontr1[*icounter] = lnode[(j << 1) - 2];
	    icontr2[*icounter] = lnode[(j << 1) - 2];
	}
	for (j = 1; j <= 3; ++j) {
	    ++(*icounter);
	    contr[*icounter] = -alpha / (1 - alpha * 2);
	    icontr1[*icounter] = lnode[(j + 3 << 1) - 2];
	    icontr2[*icounter] = lnode[(j << 1) - 2];
	    ++(*icounter);
	    contr[*icounter] = -alpha / (1 - alpha * 2);
	    i__1 = j - 1;
	    icontr1[*icounter] = lnode[(modf_(&c__3, &i__1) + 3 << 1) - 2];
	    icontr2[*icounter] = lnode[(j << 1) - 2];
	}
    } else {
	for (j = 1; j <= 3; ++j) {
	    ++(*icounter);
	    contr[*icounter] = 1.f;
	    icontr1[*icounter] = lnode[(j << 1) - 2];
	    icontr2[*icounter] = lnode[(j << 1) - 2];
	}
    }

    if (debug) {
	s_wsle(&io___14);
	do_lio(&c__9, &c__1, "createtele: contri,iscontr,imcontr", (ftnlen)34)
		;
	do_lio(&c__3, &c__1, (char *)&(*lface), (ftnlen)sizeof(integer));
	e_wsle();
	i__1 = *icounter;
	for (j = 1; j <= i__1; ++j) {
	    s_wsle(&io___15);
	    do_lio(&c__5, &c__1, (char *)&contr[j], (ftnlen)sizeof(doublereal)
		    );
	    do_lio(&c__3, &c__1, (char *)&icontr1[j], (ftnlen)sizeof(integer))
		    ;
	    do_lio(&c__3, &c__1, (char *)&icontr2[j], (ftnlen)sizeof(integer))
		    ;
	    e_wsle();
	}
    }

    return 0;
} /* createteleinv_ */

