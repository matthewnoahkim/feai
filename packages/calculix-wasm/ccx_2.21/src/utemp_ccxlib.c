/* utemp_ccxlib.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int utemp_ccxlib__(doublereal *temp, integer *msecpt, 
	integer *kstep, integer *kinc, doublereal *time, integer *node, 
	doublereal *coords, doublereal *vold, integer *mi, integer *iponoel, 
	integer *inoel, integer *ipobody, doublereal *xbody, integer *ibody)
{
    /* System generated locals */
    integer vold_dim1, vold_offset;


/*     user subroutine utemp */


/*     INPUT: */

/*     msecpt             number of temperature values (for volume elements:1) */
/*     kstep              step number */
/*     kinc               increment number */
/*     time(1)            current step time */
/*     time(2)            current total time */
/*     node               node number */
/*     coords(1..3)       global coordinates of the node */
/*     vold(0..4,1..nk)   solution field in all nodes */
/*                        (not available for CFD-calculations) */
/*                        0: temperature */
/*                        1: displacement in global x-direction */
/*                        2: displacement in global y-direction */
/*                        3: displacement in global z-direction */
/*                        4: not used */
/*     mi(1)              max # of integration points per element (max */
/*                        over all elements) */
/*     mi(2)              max degree of freedomm per node (max over all */
/*                        nodes) in fields like v(0:mi(2))... */
/*     iponoel(i)         the network elements to which node i belongs */
/*                        are stored in inoel(1,iponoel(i)), */
/*                        inoel(1,inoel(2,iponoel(i)))...... until */
/*                        inoel(2,inoel(2,inoel(2......)=0 */
/*     inoel(1..2,*)      field containing the network elements */
/*     ipobody(1,i)       points to an entry in fields ibody and xbody */
/*                        containing the body load applied to element i, */
/*                        if any, else 0 */
/*     ipobody(2,i)       index referring to the line in field ipobody */
/*                        containing a pointer to the next body load */
/*                        applied to element i, else 0 */
/*     ibody(1,i)         code identifying the kind of body load i: */
/*                        -1,1=centrifugal, 2=gravity, 3=generalized gravity */
/*     ibody(2,i)         amplitude number for load i */
/*     ibody(3,i)         load case number for load i */
/*     xbody(1,i)         size of body load i */
/*     xbody(2..4,i)      for centrifugal loading: point on the axis, */
/*                        for gravity loading with known gravity vector: */
/*                          normalized gravity vector */
/*     xbody(5..7,i)      for centrifugal loading: normalized vector on the */
/*                          rotation axis */

/*     OUTPUT: */

/*     temp(1..msecpt)    temperature in the node */






    /* Parameter adjustments */
    --temp;
    --time;
    --coords;
    --mi;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;
    --iponoel;
    inoel -= 3;
    ipobody -= 3;
    xbody -= 8;
    ibody -= 4;

    /* Function Body */
    temp[1] = 293.;

    return 0;
} /* utemp_ccxlib__ */

