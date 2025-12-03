/* planempc.f -- translated by f2c (version 20200916).
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
static integer c__3 = 3;


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

/* Subroutine */ int planempc_(integer *ipompc, integer *nodempc, doublereal *
	coefmpc, char *labmpc, integer *nmpc, integer *nmpc___, integer *
	mpcfree, integer *ikmpc, integer *ilmpc, integer *nk, integer *nk___, 
	integer *nodeboun, integer *ndirboun, integer *ikboun, integer *
	ilboun, integer *nboun, integer *nboun___, doublereal *xboun, integer 
	*inode, integer *node, doublereal *co, char *typeboun, ftnlen 
	labmpc_len, ftnlen typeboun_len)
{
    /* System generated locals */
    integer i__1;
    doublereal d__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    integer j, k, l, m;
    doublereal dd;
    integer id, mpcfreeold;
    doublereal pac[3], pbc[3];
    integer idof;
    doublereal dmax__;
    static integer jmax;
    extern /* Subroutine */ int exit_(integer *);
    static integer nodea, nodeb, nodec;
    extern /* Subroutine */ int nident_(integer *, integer *, integer *, 
	    integer *);

    /* Fortran I/O blocks */
    static cilist io___10 = { 0, 6, 0, 0, 0 };
    static cilist io___15 = { 0, 6, 0, 0, 0 };
    static cilist io___16 = { 0, 6, 0, 0, 0 };
    static cilist io___17 = { 0, 6, 0, 0, 0 };
    static cilist io___18 = { 0, 6, 0, 0, 0 };
    static cilist io___19 = { 0, 6, 0, 0, 0 };
    static cilist io___22 = { 0, 6, 0, 0, 0 };



/*     generates MPC's for nodes staying on a straight line defined */
/*     by two nodes a and b. The parameter inode indicates how many */
/*     times the present routine was called within the same *MPC */
/*     definition. For inode=1 "node" is node a, for inode=2 "node" */
/*     is node b. Starting with inode=3 MPC's are defined. */






    /* Parameter adjustments */
    --typeboun;
    co -= 4;
    --xboun;
    --ilboun;
    --ikboun;
    --ndirboun;
    --nodeboun;
    --ilmpc;
    --ikmpc;
    labmpc -= 20;
    coefmpc -= 4;
    nodempc -= 4;
    --ipompc;

    /* Function Body */
    if (*inode == 1) {
	nodea = *node;
	return 0;
    } else if (*inode == 2) {
	nodeb = *node;
	return 0;
    } else if (*inode == 3) {
	nodec = *node;
	for (j = 1; j <= 3; ++j) {
	    pac[j - 1] = co[j + nodea * 3] - co[j + nodec * 3];
	    pbc[j - 1] = co[j + nodeb * 3] - co[j + nodec * 3];
	}
	dmax__ = (d__1 = pac[1] * pbc[2] - pac[2] * pbc[1], abs(d__1));
	jmax = 1;
	dd = (d__1 = pac[0] * pbc[2] - pac[2] * pbc[0], abs(d__1));
	if (dd > dmax__) {
	    dmax__ = dd;
	    jmax = 2;
	}
	dd = (d__1 = pac[0] * pbc[1] - pac[1] * pbc[0], abs(d__1));
	if (dd > dmax__) {
	    dmax__ = dd;
	    jmax = 3;
	}
	return 0;
    }

    ++(*nk);
    if (*nk > *nk___) {
	s_wsle(&io___10);
	do_lio(&c__9, &c__1, "*ERROR in planempc: increase nk_", (ftnlen)32);
	e_wsle();
	exit_(&c__201);
    }

    j = jmax;
    k = j + 1;
    if (k > 3) {
	k = 1;
    }
    l = k + 1;
    if (l > 3) {
	l = 1;
    }

    idof = (*node - 1 << 3) + j;
    nident_(&ikmpc[1], &idof, nmpc, &id);
    if (id > 0) {
	if (ikmpc[id] == idof) {
	    s_wsle(&io___15);
	    do_lio(&c__9, &c__1, "*WARNING in planempc: DOF for node ", (
		    ftnlen)35);
	    do_lio(&c__3, &c__1, (char *)&(*node), (ftnlen)sizeof(integer));
	    e_wsle();
	    s_wsle(&io___16);
	    do_lio(&c__9, &c__1, "         in direction ", (ftnlen)22);
	    do_lio(&c__3, &c__1, (char *)&j, (ftnlen)sizeof(integer));
	    do_lio(&c__9, &c__1, " has been used", (ftnlen)14);
	    e_wsle();
	    s_wsle(&io___17);
	    do_lio(&c__9, &c__1, "         on the dependent side of another "
		    "MPC", (ftnlen)45);
	    e_wsle();
	    s_wsle(&io___18);
	    do_lio(&c__9, &c__1, "         PLANE constraint cannot be applied"
		    , (ftnlen)43);
	    e_wsle();
	    return 0;
	}
    }
    ++(*nmpc);
    if (*nmpc > *nmpc___) {
	s_wsle(&io___19);
	do_lio(&c__9, &c__1, "*ERROR in planempc: increase nmpc_", (ftnlen)34)
		;
	e_wsle();
	exit_(&c__201);
    }

    ipompc[*nmpc] = *mpcfree;
    s_copy(labmpc + *nmpc * 20, "PLANE               ", (ftnlen)20, (ftnlen)
	    20);

    i__1 = id + 2;
    for (m = *nmpc; m >= i__1; --m) {
	ikmpc[m] = ikmpc[m - 1];
	ilmpc[m] = ilmpc[m - 1];
    }
    ikmpc[id + 1] = idof;
    ilmpc[id + 1] = *nmpc;

    nodempc[*mpcfree * 3 + 1] = *node;
    nodempc[*mpcfree * 3 + 2] = j;
    *mpcfree = nodempc[*mpcfree * 3 + 3];
    nodempc[*mpcfree * 3 + 1] = *node;
    nodempc[*mpcfree * 3 + 2] = k;
    *mpcfree = nodempc[*mpcfree * 3 + 3];
    nodempc[*mpcfree * 3 + 1] = *node;
    nodempc[*mpcfree * 3 + 2] = l;
    *mpcfree = nodempc[*mpcfree * 3 + 3];
    nodempc[*mpcfree * 3 + 1] = nodea;
    nodempc[*mpcfree * 3 + 2] = j;
    *mpcfree = nodempc[*mpcfree * 3 + 3];
    nodempc[*mpcfree * 3 + 1] = nodea;
    nodempc[*mpcfree * 3 + 2] = k;
    *mpcfree = nodempc[*mpcfree * 3 + 3];
    nodempc[*mpcfree * 3 + 1] = nodea;
    nodempc[*mpcfree * 3 + 2] = l;
    *mpcfree = nodempc[*mpcfree * 3 + 3];
    nodempc[*mpcfree * 3 + 1] = nodeb;
    nodempc[*mpcfree * 3 + 2] = j;
    *mpcfree = nodempc[*mpcfree * 3 + 3];
    nodempc[*mpcfree * 3 + 1] = nodeb;
    nodempc[*mpcfree * 3 + 2] = k;
    *mpcfree = nodempc[*mpcfree * 3 + 3];
    nodempc[*mpcfree * 3 + 1] = nodeb;
    nodempc[*mpcfree * 3 + 2] = l;
    *mpcfree = nodempc[*mpcfree * 3 + 3];
    nodempc[*mpcfree * 3 + 1] = nodec;
    nodempc[*mpcfree * 3 + 2] = j;
    *mpcfree = nodempc[*mpcfree * 3 + 3];
    nodempc[*mpcfree * 3 + 1] = nodec;
    nodempc[*mpcfree * 3 + 2] = k;
    *mpcfree = nodempc[*mpcfree * 3 + 3];
    nodempc[*mpcfree * 3 + 1] = nodec;
    nodempc[*mpcfree * 3 + 2] = l;
    *mpcfree = nodempc[*mpcfree * 3 + 3];
    nodempc[*mpcfree * 3 + 1] = *nk;
    nodempc[*mpcfree * 3 + 2] = j;
    mpcfreeold = *mpcfree;
    *mpcfree = nodempc[*mpcfree * 3 + 3];
    nodempc[mpcfreeold * 3 + 3] = 0;
    idof = (*nk - 1 << 3) + j;
    nident_(&ikboun[1], &idof, nboun, &id);
    ++(*nboun);
    if (*nboun > *nboun___) {
	s_wsle(&io___22);
	do_lio(&c__9, &c__1, "*ERROR in planempc: increase nboun_", (ftnlen)
		35);
	e_wsle();
	exit_(&c__201);
    }
    nodeboun[*nboun] = *nk;
    ndirboun[*nboun] = j;
    *(unsigned char *)&typeboun[*nboun] = 'U';
    i__1 = id + 2;
    for (m = *nboun; m >= i__1; --m) {
	ikboun[m] = ikboun[m - 1];
	ilboun[m] = ilboun[m - 1];
    }
    ikboun[id + 1] = idof;
    ilboun[id + 1] = *nboun;

    return 0;
} /* planempc_ */

