/* gen3dmembrane.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int gen3dmembrane_(integer *ipompc, integer *nodempc, 
	doublereal *coefmpc, integer *nmpc, integer *nmpc___, integer *
	mpcfree, integer *ikmpc, integer *ilmpc, char *labmpc, integer *nk, 
	integer *ithermal, integer *i__, ftnlen labmpc_len)
{
    /* System generated locals */
    integer i__1, i__2;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    integer j, id, mpcfreenew, jend, idof, idir;
    extern /* Subroutine */ int exit_(integer *), nident_(integer *, integer *
	    , integer *, integer *);
    integer jstart, newnode;

    /* Fortran I/O blocks */
    static cilist io___7 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___10 = { 0, 6, 0, 0, 0 };
    static cilist io___12 = { 0, 6, 0, 0, 0 };



/*     connects nodes of 1-D and 2-D elements, for which SPC's were */
/*     defined, to the nodes of their expanded counterparts */





/*     generating a hinge at a node of a membrane element */

/*     u(n_1)+u(n_3)=2*u(n) */

    /* Parameter adjustments */
    --ithermal;
    labmpc -= 20;
    --ilmpc;
    --ikmpc;
    --coefmpc;
    nodempc -= 4;
    --ipompc;

    /* Function Body */
    newnode = *nk - 1;

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
		do_lio(&c__9, &c__1, "*ERROR in gen3dmembrane: increase nmpc_"
			, (ftnlen)39);
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
		do_lio(&c__9, &c__1, "*ERROR in gen3dmembrane: increase memm"
			"pc_", (ftnlen)41);
		e_wsle();
		exit_(&c__201);
	    }
	    nodempc[*mpcfree * 3 + 1] = *nk + 1;
	    nodempc[*mpcfree * 3 + 2] = idir;
	    coefmpc[*mpcfree] = 1.;
	    *mpcfree = nodempc[*mpcfree * 3 + 3];
	    if (*mpcfree == 0) {
		s_wsle(&io___10);
		do_lio(&c__9, &c__1, "*ERROR in gen3dmembrane: increase memm"
			"pc_", (ftnlen)41);
		e_wsle();
		exit_(&c__201);
	    }
	    nodempc[*mpcfree * 3 + 1] = *i__;
	    nodempc[*mpcfree * 3 + 2] = idir;
	    coefmpc[*mpcfree] = -2.;
	    mpcfreenew = nodempc[*mpcfree * 3 + 3];
	    if (mpcfreenew == 0) {
		s_wsle(&io___12);
		do_lio(&c__9, &c__1, "*ERROR in gen3dmembrane: increase memm"
			"pc_", (ftnlen)41);
		e_wsle();
		exit_(&c__201);
	    }
	    nodempc[*mpcfree * 3 + 3] = 0;
	    *mpcfree = mpcfreenew;
	}
    }

    return 0;
} /* gen3dmembrane_ */

