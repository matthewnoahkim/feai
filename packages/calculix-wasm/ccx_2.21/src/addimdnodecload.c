/* addimdnodecload.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int addimdnodecload_(integer *nodeforc, integer *iforc, 
	integer *imdnode, integer *nmdnode, doublereal *xforc, integer *ikmpc,
	 integer *ilmpc, integer *ipompc, integer *nodempc, integer *nmpc, 
	integer *imddof, integer *nmddof, integer *nactdof, integer *mi, 
	integer *imdmpc, integer *nmdmpc, integer *imdboun, integer *nmdboun, 
	integer *ikboun, integer *nboun, integer *ilboun, integer *ithermal)
{
    /* System generated locals */
    integer nactdof_dim1, nactdof_offset;

    /* Local variables */
    integer k, node;
    extern /* Subroutine */ int addimdnodedof_(integer *, integer *, integer *
	    , integer *, integer *, integer *, integer *, integer *, integer *
	    , integer *, integer *, integer *, integer *, integer *, integer *
	    , integer *, integer *, integer *, integer *, integer *), addimd_(
	    integer *, integer *, integer *);


/*     adds the dof in which a user-defined point force was applied to imdnode */
/*     (needed in dyna.c and steadystate.c) */




    /* Parameter adjustments */
    nodeforc -= 3;
    --imdnode;
    --xforc;
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
    node = nodeforc[(*iforc << 1) + 1];

/*     user-defined load */

    if (xforc[*iforc] < 1.2357111318 && xforc[*iforc] > 1.2357111316) {

	addimd_(&imdnode[1], nmdnode, &node);

/*        add the degrees of freedom corresponding to the node */

	if (ithermal[1] != 2) {
	    for (k = 1; k <= 3; ++k) {
		addimdnodedof_(&node, &k, &ikmpc[1], &ilmpc[1], &ipompc[1], &
			nodempc[4], nmpc, &imdnode[1], nmdnode, &imddof[1], 
			nmddof, &nactdof[nactdof_offset], &mi[1], &imdmpc[1], 
			nmdmpc, &imdboun[1], nmdboun, &ikboun[1], nboun, &
			ilboun[1]);
	    }
	} else {
	    k = 0;
	    addimdnodedof_(&node, &k, &ikmpc[1], &ilmpc[1], &ipompc[1], &
		    nodempc[4], nmpc, &imdnode[1], nmdnode, &imddof[1], 
		    nmddof, &nactdof[nactdof_offset], &mi[1], &imdmpc[1], 
		    nmdmpc, &imdboun[1], nmdboun, &ikboun[1], nboun, &ilboun[
		    1]);
	}
    }

    return 0;
} /* addimdnodecload_ */

