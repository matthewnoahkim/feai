/* extrapolate_us3.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int extrapolate_us3__(doublereal *yi, doublereal *yn, 
	integer *ipkon, integer *inum, integer *kon, char *lakon, integer *
	nfield, integer *nk, integer *ne, integer *mi, integer *ndim, 
	doublereal *orab, integer *ielorien, doublereal *co, integer *
	iorienloc, char *cflag, doublereal *vold, integer *iforce, integer *
	ielmat, doublereal *thicke, integer *ielprop, doublereal *prop, 
	integer *i__, ftnlen lakon_len, ftnlen cflag_len)
{
    /* System generated locals */
    integer ielorien_dim1, ielorien_offset, ielmat_dim1, ielmat_offset, 
	    yi_dim1, yi_dim2, yi_offset, yn_dim1, yn_offset, vold_dim1, 
	    vold_offset, thicke_dim1, thicke_offset;

    /* Local variables */
    integer j, node, indexe;


/*     extrapolates field values at the integration points to the */
/*     nodes for user element i of type us3 */

/*     the present routine is called for each user element of type us3; */
/*     routine to calculate inum(i) for nodes i belonging to shell */
/*     elements of type us3. This guarantees that the coordinates and */
/*     fields such as U, S or SNEG are stored for these nodes in the */
/*     frd-file. */

/*     In this routine no extrapolation is done. For 'true' shell elements */
/*     the extrapolation is done in extrapolateshell_us3.f */

/*     INPUT: */

/*     yi(ndim,mi(1),*)   value of the variables at the integration */
/*                        points */
/*     yn(nfield,*)       sum of the extrapolated variables at the nodes */
/*                        from all elements treated previously */
/*     ipkon(i)           points to the location in field kon preceding */
/*                        the topology of element i */
/*     inum(i)            < 0: node i is a network node */
/*                        > 0: node i is a structural node; its value is */
/*                             number of extrapolations performed to this */
/*                             node so far */
/*                        =0: node i is not used */
/*     kon(*)             contains the topology of all elements. The */
/*                        topology of element i starts at kon(ipkon(i)+1) */
/*                        and continues until all nodes are covered. The */
/*                        number of nodes depends on the element label */
/*     lakon(i)           contains the label of element i */
/*     nfield             number of variables to be extrapolated */
/*     nk                 maximum node number in the mesh */
/*     ne                 maximum element number in the mesh */
/*     ndim               number of variables in the integration point */
/*                        field to be extrapolated */
/*     orab(7,*)          description of all local coordinate systems. */
/*                        (cf. List of variables and their meaning in the */
/*                        User's manual) */
/*     ielorien(i)        orientation in element i */
/*     co(1..3,i)         global coordinates of node i */
/*     iorienloc          0: extrapolated variables requested in global */
/*                           coordinates */
/*                        1: extrapolated variables requested in local */
/*                           coordinates */
/*     cflag (char*1)     I: interpolate 3D results onto 1D/2D */
/*                        E: store extrapolated 1D/2D results */
/*                        M: store 1D section forces */
/*                        blank: any other case */
/*     vold(j,i)          value of variable j in node i at the end */
/*                        of the previous iteration */
/*     iforce             binary integer; if 1 the values to */
/*                        be extrapolated are force values; important for */
/*                        interpolation from 3D expanded structures on the */
/*                        original 1D/2D structure: forces across the */
/*                        expansion have to be summed, not interpolated */
/*     ielmat(i)          material of element i */
/*     thicke(j,i)        thickness of layer j in node i */
/*     ielprop(i)         properties for element i are stored in */
/*                        prop(ielprop(i)+1),prop(ielprop(i)+2),.... */
/*                        (number of properties depends on the type of */
/*                        element) */
/*     prop               property field */
/*     i                  number of the element for which the extrapolation */
/*                        is to be performed */

/*     OUTPUT: */

/*     inum(i)            < 0: node i is a network node */
/*                        > 0: node i is a structural node; inum(i) */
/*                             should be incremented by 1 if in the */
/*                             call of this routine an extrapolated value */
/*                             was stored for this node */
/*                        =0: node i is not used */






    /* Parameter adjustments */
    --ipkon;
    --inum;
    --kon;
    lakon -= 8;
    yn_dim1 = *nfield;
    yn_offset = 1 + yn_dim1;
    yn -= yn_offset;
    --mi;
    thicke_dim1 = mi[3];
    thicke_offset = 1 + thicke_dim1;
    thicke -= thicke_offset;
    ielmat_dim1 = mi[3];
    ielmat_offset = 1 + ielmat_dim1;
    ielmat -= ielmat_offset;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;
    ielorien_dim1 = mi[3];
    ielorien_offset = 1 + ielorien_dim1;
    ielorien -= ielorien_offset;
    yi_dim1 = *ndim;
    yi_dim2 = mi[1];
    yi_offset = 1 + yi_dim1 * (1 + yi_dim2);
    yi -= yi_offset;
    orab -= 8;
    co -= 4;
    --ielprop;
    --prop;

    /* Function Body */
    indexe = ipkon[*i__];
    for (j = 1; j <= 3; ++j) {
	node = kon[indexe + j];
	++inum[node];
    }

    return 0;
} /* extrapolate_us3__ */

