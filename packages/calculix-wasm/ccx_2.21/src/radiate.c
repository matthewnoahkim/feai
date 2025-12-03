/* radiate.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int radiate_(doublereal *e, doublereal *sink, doublereal *
	temp, integer *kstep, integer *kinc, doublereal *time, integer *noel, 
	integer *npt, doublereal *coords, integer *jltyp, doublereal *field, 
	integer *nfield, char *loadtype, integer *node, doublereal *area, 
	doublereal *vold, integer *mi, integer *iemchange, ftnlen 
	loadtype_len)
{
    /* System generated locals */
    integer vold_dim1, vold_offset;


/*     user subroutine radiate */


/*     INPUT: */

/*     sink               present sink temperature */
/*     temp               current temperature value */
/*     kstep              step number */
/*     kinc               increment number */
/*     time(1)            current step time */
/*     time(2)            current total time */
/*     noel               element number */
/*     npt                integration point number */
/*     coords(1..3)       global coordinates of the integration point */
/*     jltyp              loading face kode: */
/*                        11 = face 1 */
/*                        12 = face 2 */
/*                        13 = face 3 */
/*                        14 = face 4 */
/*                        15 = face 5 */
/*                        16 = face 6 */
/*     field              currently not used */
/*     nfield             currently not used (value = 1) */
/*     loadtype           load type label */
/*     node               currently not used */
/*     area               area covered by the integration point */
/*     vold(0..4,1..nk)   solution field in all nodes */
/*                        0: temperature */
/*                        1: displacement in global x-direction */
/*                        2: displacement in global y-direction */
/*                        3: displacement in global z-direction */
/*                        4: static pressure */
/*     mi(1)              max # of integration points per element (max */
/*                        over all elements) */
/*     mi(2)              max degree of freedomm per node (max over all */
/*                        nodes) in fields like v(0:mi(2))... */

/*     OUTPUT: */

/*     e(1)               magnitude of the emissivity */
/*     e(2)               not used; please do NOT assign any value */
/*     sink               sink temperature (need not be defined */
/*                        for cavity radiation) */
/*     iemchange          = 1 if the emissivity is changed during */
/*                        a step, else zero. */





    /* Parameter adjustments */
    --e;
    --time;
    --coords;
    --field;
    --mi;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;

    /* Function Body */
    e[1] = .72;

    return 0;
} /* radiate_ */

