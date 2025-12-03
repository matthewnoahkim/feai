/* calcgeomelemnet.f -- translated by f2c (version 20200916).
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
/*     Copyright (C) 1998-2023 Guido Dhondt */

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

/* Subroutine */ int calcgeomelemnet_(doublereal *vold, doublereal *co, 
	doublereal *prop, char *lakon, integer *nelem, doublereal *ttime, 
	doublereal *time, integer *ielprop, integer *mi, doublereal *a, 
	doublereal *a2, doublereal *d__, doublereal *l, doublereal *s, ftnlen 
	lakon_len)
{
    /* System generated locals */
    integer vold_dim1, vold_offset;
    doublereal d__1;

    /* Builtin functions */
    double atan(doublereal);
    integer s_cmp(char *, char *, ftnlen, ftnlen), i_dnnt(doublereal *);
    double sqrt(doublereal);

    /* Local variables */
    doublereal pi;
    integer nodea, nodeb, nodec, index;
    doublereal radius;


/*     user subroutine */

/*     calculate the cross section for flexible network */
/*     elements and user defined network elements */

/*     INPUT: */

/*     vold(0..4,1..nk)   solution field in all nodes; */
/*                        for structural nodes: */
/*                        0: temperature */
/*                        1: displacement in global x-direction */
/*                        2: displacement in global y-direction */
/*                        3: displacement in global z-direction */
/*                        4: static pressure */
/*                        for network nodes */
/*                        0: total temperature (at end nodes) */
/*                           = static temperature for liquids */
/*                        1: mass flow (at middle nodes) */
/*                        2: total pressure (at end nodes) */
/*                           = static pressure for liquids */
/*                        3: static temperature (at end nodes; only for gas) */
/*     co(3,1..nk)        coordinates of all nodes */
/*                        1: coordinate in global x-direction */
/*                        2: coordinate in global y-direction */
/*                        3: coordinate in global z-direction */
/*     prop(*)            contains the properties of all network elements. The */
/*                        properties of element i start at prop(ielprop(i)+1) */
/*                        and continues until all properties are covered. The */
/*                        appropriate amount of properties depends on the */
/*                        element label. The kind of properties, their */
/*                        number and their order corresponds */
/*                        to the description in the user's manual, */
/*                        cf. the sections "Fluid Section Types" */
/*     lakon(i)           contains the label of element i */
/*     nelem              actual element number */
/*     ttime              total time at the start of actual thermomechanical */
/*                        increment */
/*     time               step time at the end of the actual thermomechanical */
/*                        increment */
/*     ielprop(i)         points to the location in field prop preceding */
/*                        the properties of element i */
/*     mi(1)              max # of integration points per element (max */
/*                        over all elements) */
/*     mi(2)              max degree of freedom per node (max over all */
/*                        nodes) in fields like v(0:mi(2))... */
/*     A2                 presently not used */
/*     d                  presently not used */
/*     l                  presently not used */
/*     s                  presently not used */

/*     OUTPUT: */

/*     A                  cross section */







    /* Parameter adjustments */
    co -= 4;
    --prop;
    lakon -= 8;
    --ielprop;
    --mi;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;

    /* Function Body */
    index = ielprop[*nelem];
    pi = atan(1.) * 4.;

    *a = 0.;

    if (s_cmp(lakon + ((*nelem << 3) + 1), "GAPFA", (ftnlen)5, (ftnlen)5) == 
	    0 || s_cmp(lakon + ((*nelem << 3) + 1), "GAPFI", (ftnlen)5, (
	    ftnlen)5) == 0) {

	if (s_cmp(lakon + ((*nelem << 3) + 6), "FR", (ftnlen)2, (ftnlen)2) == 
		0) {

/*     flexible radius */

	    nodea = i_dnnt(&prop[index + 1]);
	    nodeb = i_dnnt(&prop[index + 2]);
/* Computing 2nd power */
	    d__1 = co[nodeb * 3 + 1] + vold[nodeb * vold_dim1 + 1] - co[nodea 
		    * 3 + 1] - vold[nodea * vold_dim1 + 1];
	    radius = sqrt(d__1 * d__1);

/* Computing 2nd power */
	    d__1 = radius;
	    *a = pi * (d__1 * d__1);

	} else if (s_cmp(lakon + ((*nelem << 3) + 6), "RL", (ftnlen)2, (
		ftnlen)2) == 0) {

/*     flexible radius and length */

	    nodea = i_dnnt(&prop[index + 1]);
	    nodeb = i_dnnt(&prop[index + 2]);
	    nodec = i_dnnt(&prop[index + 3]);
/* Computing 2nd power */
	    d__1 = co[nodeb * 3 + 1] + vold[nodeb * vold_dim1 + 1] - co[nodea 
		    * 3 + 1] - vold[nodea * vold_dim1 + 1];
	    radius = sqrt(d__1 * d__1);
/* Computing 2nd power */
	    d__1 = radius;
	    *a = pi * (d__1 * d__1);
	}
    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "UP", (ftnlen)2, (ftnlen)2) 
	    == 0) {

/*        determine the relevant cross section (used in the */
/*        calculation of the static temperature from the */
/*        total temperature) for user network elements */

/*        START insert */

	*a = prop[index + 1];

/*        END insert */

    }

    return 0;
} /* calcgeomelemnet_ */

