/* addimdnodedload.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int addimdnodedload_(integer *nelemload, char *sideload, 
	integer *ipkon, integer *kon, char *lakon, integer *iload, integer *
	imdnode, integer *nmdnode, integer *ikmpc, integer *ilmpc, integer *
	ipompc, integer *nodempc, integer *nmpc, integer *imddof, integer *
	nmddof, integer *nactdof, integer *mi, integer *imdmpc, integer *
	nmdmpc, integer *imdboun, integer *nmdboun, integer *ikboun, integer *
	nboun, integer *ilboun, integer *ithermal, ftnlen sideload_len, 
	ftnlen lakon_len)
{
    /* Initialized data */

    static integer ifaceq[48]	/* was [8][6] */ = { 4,3,2,1,11,10,9,12,5,6,7,
	    8,13,14,15,16,1,2,6,5,9,18,13,17,2,3,7,6,10,19,14,18,3,4,8,7,11,
	    20,15,19,4,1,5,8,12,17,16,20 };
    static integer ifacet[24]	/* was [6][4] */ = { 1,3,2,7,6,5,1,2,4,5,9,8,
	    2,3,4,6,10,9,1,4,3,8,10,7 };
    static integer ifacew[40]	/* was [8][5] */ = { 1,3,2,9,8,7,0,0,4,5,6,10,
	    11,12,0,0,1,2,5,4,7,14,10,13,2,3,6,5,8,15,11,14,4,6,3,1,12,15,9,
	    13 };

    /* System generated locals */
    integer nactdof_dim1, nactdof_offset, i__1;
    icilist ici__1;

    /* Builtin functions */
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);
    integer s_cmp(char *, char *, ftnlen, ftnlen), s_rsfi(icilist *), do_fio(
	    integer *, char *, ftnlen), e_rsfi(void);

    /* Local variables */
    integer k, ig, ii, node, nope, ielem;
    extern /* Subroutine */ int addimdnodedof_(integer *, integer *, integer *
	    , integer *, integer *, integer *, integer *, integer *, integer *
	    , integer *, integer *, integer *, integer *, integer *, integer *
	    , integer *, integer *, integer *, integer *, integer *);
    integer nopes;
    extern /* Subroutine */ int addimd_(integer *, integer *, integer *);
    integer indexe;
    char lakonl[8];


/*     adds the nodes belonging to a user-defined facial load to imdnode */
/*     (needed in dyna.c and steadystate.c) */




    /* Parameter adjustments */
    nelemload -= 3;
    sideload -= 20;
    --ipkon;
    --kon;
    lakon -= 8;
    --imdnode;
    --ikmpc;
    --ilmpc;
    --ipompc;
    nodempc -= 4;
    --imddof;
    --mi;
    nactdof_dim1 = mi[2] - 0 + 1;
    nactdof_offset = 0 + nactdof_dim1;
    nactdof -= nactdof_offset;
    --imdmpc;
    --imdboun;
    --ikboun;
    --ilboun;
    --ithermal;

    /* Function Body */

    ielem = nelemload[(0 + (0 + (1 + (*iload << 1) << 2))) / 4];
    s_copy(lakonl, lakon + (ielem << 3), (ftnlen)8, (ftnlen)8);
    indexe = ipkon[ielem];

    if (*(unsigned char *)&sideload[*iload * 20] == 'P' && s_cmp(sideload + (*
	    iload * 20 + 2), "NU", (ftnlen)2, (ftnlen)2) == 0) {
	ici__1.icierr = 0;
	ici__1.iciend = 0;
	ici__1.icirnum = 1;
	ici__1.icirlen = 1;
	ici__1.iciunit = sideload + (*iload * 20 + 1);
	ici__1.icifmt = "(i1)";
	s_rsfi(&ici__1);
	do_fio(&c__1, (char *)&ig, (ftnlen)sizeof(integer));
	e_rsfi();

/*        surface pressure: number of nodes belonging to the face */

	if (*(unsigned char *)&lakonl[3] == '2') {
	    nopes = 8;
	} else if (*(unsigned char *)&lakonl[3] == '8') {
	    nopes = 4;
	} else if (s_cmp(lakonl + 3, "10", (ftnlen)2, (ftnlen)2) == 0) {
	    nopes = 6;
	} else if (*(unsigned char *)&lakonl[3] == '4') {
	    nopes = 3;
	} else if (s_cmp(lakonl + 3, "15", (ftnlen)2, (ftnlen)2) == 0) {
	    if (ig <= 2) {
		nopes = 6;
	    } else {
		nopes = 8;
	    }
	} else if (*(unsigned char *)&lakonl[3] == '6') {
	    if (ig <= 2) {
		nopes = 3;
	    } else {
		nopes = 4;
	    }
	}

	i__1 = nopes;
	for (ii = 1; ii <= i__1; ++ii) {
	    if (*(unsigned char *)&lakonl[3] == '2' || *(unsigned char *)&
		    lakonl[3] == '8') {
		node = kon[indexe + ifaceq[ii + (ig << 3) - 9]];
	    } else if (s_cmp(lakonl + 3, "10", (ftnlen)2, (ftnlen)2) == 0 || *
		    (unsigned char *)&lakonl[3] == '4') {
		node = kon[indexe + ifacet[ii + ig * 6 - 7]];
	    } else if (s_cmp(lakonl + 3, "15", (ftnlen)2, (ftnlen)2) == 0 || *
		    (unsigned char *)&lakonl[3] == '6') {
		node = kon[indexe + ifacew[ii + (ig << 3) - 9]];
	    }

/*           user-defined load */

	    if (s_cmp(sideload + (*iload * 20 + 2), "NU", (ftnlen)2, (ftnlen)
		    2) == 0) {
		addimd_(&imdnode[1], nmdnode, &node);

/*        add the degrees of freedom corresponding to the node */

		if (ithermal[1] != 2) {
		    for (k = 1; k <= 3; ++k) {
			addimdnodedof_(&node, &k, &ikmpc[1], &ilmpc[1], &
				ipompc[1], &nodempc[4], nmpc, &imdnode[1], 
				nmdnode, &imddof[1], nmddof, &nactdof[
				nactdof_offset], &mi[1], &imdmpc[1], nmdmpc, &
				imdboun[1], nmdboun, &ikboun[1], nboun, &
				ilboun[1]);
		    }
		} else {
		    k = 0;
		    addimdnodedof_(&node, &k, &ikmpc[1], &ilmpc[1], &ipompc[1]
			    , &nodempc[4], nmpc, &imdnode[1], nmdnode, &
			    imddof[1], nmddof, &nactdof[nactdof_offset], &mi[
			    1], &imdmpc[1], nmdmpc, &imdboun[1], nmdboun, &
			    ikboun[1], nboun, &ilboun[1]);
		}
	    }

	}
    } else if (*(unsigned char *)&sideload[*iload * 20] == 'B' && s_cmp(
	    sideload + (*iload * 20 + 2), "NU", (ftnlen)2, (ftnlen)2) == 0) {

/*        volumetric load; number of nodes in the element */

	if (*(unsigned char *)&lakonl[3] == '2') {
	    nope = 20;
	} else if (*(unsigned char *)&lakonl[3] == '8') {
	    nope = 8;
	} else if (s_cmp(lakonl + 3, "10", (ftnlen)2, (ftnlen)2) == 0) {
	    nope = 10;
	} else if (*(unsigned char *)&lakonl[3] == '4') {
	    nope = 4;
	} else if (s_cmp(lakonl + 3, "15", (ftnlen)2, (ftnlen)2) == 0) {
	    nope = 15;
	} else if (*(unsigned char *)&lakonl[3] == '6') {
	    nope = 6;
	}

	i__1 = nope;
	for (ii = 1; ii <= i__1; ++ii) {
	    node = kon[indexe + ii];

/*     user-defined load */

/*            if(sideload(iload)(3:4).eq.'NU') then */
	    addimd_(&imdnode[1], nmdnode, &node);

/*     add the degrees of freedom corresponding to the node */

	    if (ithermal[1] != 2) {
		for (k = 1; k <= 3; ++k) {
		    addimdnodedof_(&node, &k, &ikmpc[1], &ilmpc[1], &ipompc[1]
			    , &nodempc[4], nmpc, &imdnode[1], nmdnode, &
			    imddof[1], nmddof, &nactdof[nactdof_offset], &mi[
			    1], &imdmpc[1], nmdmpc, &imdboun[1], nmdboun, &
			    ikboun[1], nboun, &ilboun[1]);
		}
	    } else {
		k = 0;
		addimdnodedof_(&node, &k, &ikmpc[1], &ilmpc[1], &ipompc[1], &
			nodempc[4], nmpc, &imdnode[1], nmdnode, &imddof[1], 
			nmddof, &nactdof[nactdof_offset], &mi[1], &imdmpc[1], 
			nmdmpc, &imdboun[1], nmdboun, &ikboun[1], nboun, &
			ilboun[1]);
	    }
/*            endif */
	}

    }

    return 0;
} /* addimdnodedload_ */

