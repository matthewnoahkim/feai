/* addizdofcload.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int addizdofcload_(integer *nodeforc, integer *ndirforc, 
	integer *nactdof, integer *mi, integer *izdof, integer *nzdof, 
	integer *iforc, integer *iznode, integer *nznode, integer *nk, 
	integer *imdnode, integer *nmdnode, doublereal *xforc, integer *
	ntrans, integer *inotr)
{
    /* System generated locals */
    integer nactdof_dim1, nactdof_offset;

    /* Local variables */
    integer j, nodebasis, itr, jdof, node;
    extern /* Subroutine */ int addimd_(integer *, integer *, integer *);


/*     adds the dof in which a point force was applied to iznode, izdof */
/*     and to ** imdnode if user-defined load ** */
/*     (needed in dyna.c and steadystate.c) */




    /* Parameter adjustments */
    nodeforc -= 3;
    --ndirforc;
    --mi;
    nactdof_dim1 = mi[2] - 0 + 1;
    nactdof_offset = 0 + nactdof_dim1;
    nactdof -= nactdof_offset;
    --izdof;
    --iznode;
    --imdnode;
    --xforc;
    inotr -= 3;

    /* Function Body */
    node = nodeforc[(*iforc << 1) + 1];

/*     adding the nodes in the basis sector to iznode */

    nodebasis = node % *nk;
    addimd_(&iznode[1], nznode, &nodebasis);
/* ! */
/* !     user-defined load */
/* ! */
/*      if((xforc(iforc).lt.1.2357111318d0).and. */
/*     &     (xforc(iforc).gt.1.2357111316d0)) then */
/*         call addimd(imdnode,nmdnode,node) */
/*      endif */

    if (*ntrans == 0) {
	itr = 0;
    } else {
	itr = inotr[(node << 1) + 1];
    }

    if (itr == 0) {

/*        no local transformation */

	j = ndirforc[*iforc];

/*        C-convention! */

	jdof = nactdof[j + node * nactdof_dim1] - 1;
	if (jdof > 0) {
	    addimd_(&izdof[1], nzdof, &jdof);
	}
    } else {

/*        local transformation: loop over all dofs */

	for (j = 1; j <= 3; ++j) {
	    jdof = nactdof[j + node * nactdof_dim1] - 1;
	    if (jdof > 0) {
		addimd_(&izdof[1], nzdof, &jdof);
	    }
	}
    }

    return 0;
} /* addizdofcload_ */

