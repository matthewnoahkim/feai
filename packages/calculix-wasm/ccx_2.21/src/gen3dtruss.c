/* gen3dtruss.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int gen3dtruss_(integer *ipompc, integer *nodempc, 
	doublereal *coefmpc, integer *nmpc, integer *nmpc___, integer *
	mpcfree, integer *ikmpc, integer *ilmpc, char *labmpc, integer *nk, 
	integer *ithermal, integer *i__, integer *nodeboun, integer *ndirboun,
	 integer *ikboun, integer *ilboun, integer *nboun, integer *nboun___, 
	char *typeboun, doublereal *xboun, doublereal *xta, integer *jact, 
	doublereal *co, integer *knor, integer *ntrans, integer *inotr, 
	doublereal *trab, doublereal *vold, integer *mi, integer *nmethod, 
	integer *nk___, integer *nam, integer *iperturb, integer *indexk, 
	integer *iamboun, integer *iflagpl, ftnlen labmpc_len, ftnlen 
	typeboun_len)
{
    /* System generated locals */
    integer i__1, i__2;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    integer j, k, id, mpcfreenew, iamplitude;
    doublereal val;
    integer jend, idof, idir;
    extern /* Subroutine */ int exit_(integer *);
    char type__[1], label[20];
    logical fixed;
    extern /* Subroutine */ int nident_(integer *, integer *, integer *, 
	    integer *);
    integer nnodes, jstart, nodeact;
    extern /* Subroutine */ int bounadd_(integer *, integer *, integer *, 
	    doublereal *, integer *, integer *, doublereal *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    doublereal *, integer *, integer *, integer *, integer *, 
	    doublereal *, integer *, integer *, integer *, integer *, integer 
	    *, doublereal *, integer *, integer *, char *, char *, char *, 
	    integer *, integer *, logical *, doublereal *, integer *, integer 
	    *, char *, ftnlen, ftnlen, ftnlen, ftnlen);
    integer idirref, newnode;
    extern /* Subroutine */ int usermpc_(integer *, integer *, doublereal *, 
	    char *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *, integer *, integer *, doublereal *, char *, 
	    char *, integer *, integer *, integer *, doublereal *, ftnlen, 
	    ftnlen, ftnlen);

    /* Fortran I/O blocks */
    static cilist io___7 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___11 = { 0, 6, 0, 0, 0 };
    static cilist io___13 = { 0, 6, 0, 0, 0 };



/*     - connects the expanded nodes of a truss element to the */
/*       original node */
/*     - sets the rotation about the truss axis to zero */








/*     generating a hinge at a node of a truss element */

/*     u(n_1)+u(n_2)+u(n_3)+u(n_4)=4*u(n) */

    /* Parameter adjustments */
    --ipompc;
    nodempc -= 4;
    --coefmpc;
    --ikmpc;
    --ilmpc;
    labmpc -= 20;
    --ithermal;
    --nodeboun;
    --ndirboun;
    --ikboun;
    --ilboun;
    --typeboun;
    --xboun;
    xta -= 4;
    co -= 4;
    --knor;
    inotr -= 3;
    trab -= 8;
    --mi;
    --iperturb;
    --iamboun;

    /* Function Body */
    newnode = *nk - 7;

    if (ithermal[2] <= 1) {
	jstart = 1;
	jend = 3;
    } else if (ithermal[2] == 2) {
	jstart = 0;
	jend = 0;
    } else {
	jstart = 0;
	jend = 3;
    }

    i__1 = jend;
    for (idir = jstart; idir <= i__1; ++idir) {
	idof = (newnode - 1 << 3) + idir;
	nident_(&ikmpc[1], &idof, nmpc, &id);
	if (id <= 0 || ikmpc[id] != idof) {
	    ++(*nmpc);
	    if (*nmpc > *nmpc___) {
		s_wsle(&io___7);
		do_lio(&c__9, &c__1, "*ERROR in gen3dtruss: increase nmpc_", (
			ftnlen)36);
		e_wsle();
		exit_(&c__201);
	    }
	    s_copy(labmpc + *nmpc * 20, "                    ", (ftnlen)20, (
		    ftnlen)20);
	    ipompc[*nmpc] = *mpcfree;
	    i__2 = id + 2;
	    for (j = *nmpc; j >= i__2; --j) {
		ikmpc[j] = ikmpc[j - 1];
		ilmpc[j] = ilmpc[j - 1];
	    }
	    ikmpc[id + 1] = idof;
	    ilmpc[id + 1] = *nmpc;
	    nodempc[*mpcfree * 3 + 1] = newnode;
	    nodempc[*mpcfree * 3 + 2] = idir;
	    coefmpc[*mpcfree] = 1.;
	    *mpcfree = nodempc[*mpcfree * 3 + 3];
	    if (*mpcfree == 0) {
		s_wsle(&io___9);
		do_lio(&c__9, &c__1, "*ERROR in gen3dtruss: increase memmpc_",
			 (ftnlen)38);
		e_wsle();
		exit_(&c__201);
	    }
	    for (k = 2; k <= 4; ++k) {
		nodempc[*mpcfree * 3 + 1] = *nk - 8 + k;
		nodempc[*mpcfree * 3 + 2] = idir;
		coefmpc[*mpcfree] = 1.;
		*mpcfree = nodempc[*mpcfree * 3 + 3];
		if (*mpcfree == 0) {
		    s_wsle(&io___11);
		    do_lio(&c__9, &c__1, "*ERROR in gen3dtruss: increase mem"
			    "mpc_", (ftnlen)38);
		    e_wsle();
		    exit_(&c__201);
		}
	    }
	    nodempc[*mpcfree * 3 + 1] = *i__;
	    nodempc[*mpcfree * 3 + 2] = idir;

/*           in the presence of 2D plane strain/stress/axi elements */
/*           (iflagpl=1) the displacements in z are to be fixed */

	    if (*iflagpl == 1 && idir == 3) {
		coefmpc[*mpcfree] = 0.;
	    } else {
		coefmpc[*mpcfree] = -4.;
	    }
	    mpcfreenew = nodempc[*mpcfree * 3 + 3];
	    if (mpcfreenew == 0) {
		s_wsle(&io___13);
		do_lio(&c__9, &c__1, "*ERROR in gen3dtruss: increase memmpc_",
			 (ftnlen)38);
		e_wsle();
		exit_(&c__201);
	    }
	    nodempc[*mpcfree * 3 + 3] = 0;
	    *mpcfree = mpcfreenew;
	}
    }

/*     mean rotation MPC to restrain rotation about the beam */
/*     axis */

    s_copy(label, "MEANROTBS           ", (ftnlen)20, (ftnlen)20);

/*     axis of the beam is defined as x-axis in the local beam */
/*     system (only needed for printing in usermpc.f) */

    idirref = 1;
    nnodes = 0;
    for (j = 4; j >= 1; --j) {
	nodeact = knor[*indexk + j];
	for (k = 1; k <= 3; ++k) {
	    ++nnodes;
	    usermpc_(&ipompc[1], &nodempc[4], &coefmpc[1], labmpc + 20, nmpc, 
		    nmpc___, mpcfree, &ikmpc[1], &ilmpc[1], nk, nk___, &
		    nodeboun[1], &ndirboun[1], &ikboun[1], &ilboun[1], nboun, 
		    nboun___, &nnodes, &nodeact, &co[4], label, typeboun + 1, 
		    &iperturb[1], i__, &idirref, &xboun[1], (ftnlen)20, (
		    ftnlen)20, (ftnlen)1);
	}
    }

/*     rotation value term */

    nodeact = *nk + 1;
    for (k = 1; k <= 3; ++k) {
	co[k + nodeact * 3] = xta[k + *jact * 3];
    }
    ++nnodes;
    usermpc_(&ipompc[1], &nodempc[4], &coefmpc[1], labmpc + 20, nmpc, nmpc___,
	     mpcfree, &ikmpc[1], &ilmpc[1], nk, nk___, &nodeboun[1], &
	    ndirboun[1], &ikboun[1], &ilboun[1], nboun, nboun___, &nnodes, &
	    nodeact, &co[4], label, typeboun + 1, &iperturb[1], i__, &idirref,
	     &xboun[1], (ftnlen)20, (ftnlen)20, (ftnlen)1);

/*     inhomogeneous term */

    nodeact = 0;
    usermpc_(&ipompc[1], &nodempc[4], &coefmpc[1], labmpc + 20, nmpc, nmpc___,
	     mpcfree, &ikmpc[1], &ilmpc[1], nk, nk___, &nodeboun[1], &
	    ndirboun[1], &ikboun[1], &ilboun[1], nboun, nboun___, &nnodes, &
	    nodeact, &co[4], label, typeboun + 1, &iperturb[1], i__, &idirref,
	     &xboun[1], (ftnlen)20, (ftnlen)20, (ftnlen)1);

/*     end meanrotationmpc */

/*     SPC angle term */

    if (nodeact != -1) {
	idir = 1;
	*(unsigned char *)type__ = 'B';
	val = 0.;
	iamplitude = 0;
	fixed = FALSE_;
	bounadd_(nk, &idir, &idir, &val, &nodeboun[1], &ndirboun[1], &xboun[1]
		, nboun, nboun___, &iamboun[1], &iamplitude, nam, &ipompc[1], 
		&nodempc[4], &coefmpc[1], nmpc, nmpc___, mpcfree, &inotr[3], &
		trab[8], ntrans, &ikboun[1], &ilboun[1], &ikmpc[1], &ilmpc[1],
		 &co[4], nk, nk___, labmpc + 20, type__, typeboun + 1, 
		nmethod, &iperturb[1], &fixed, vold, nk, &mi[1], label, (
		ftnlen)20, (ftnlen)1, (ftnlen)1, (ftnlen)20);

/*     storing the index of the SPC with the angle */
/*     value in ilboun(id) */

	ilboun[id] = *nboun;
    }

    return 0;
} /* gen3dtruss_ */

