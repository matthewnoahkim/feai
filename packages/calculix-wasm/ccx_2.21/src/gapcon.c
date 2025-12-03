/* gapcon.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int gapcon_(doublereal *ak, doublereal *d__, doublereal *
	flowm, doublereal *temp, doublereal *predef, doublereal *time, char *
	ciname, char *slname, char *msname, doublereal *coords, integer *noel,
	 integer *node, integer *npred, integer *kstep, integer *kinc, 
	doublereal *area, ftnlen ciname_len, ftnlen slname_len, ftnlen 
	msname_len)
{

/*     user subroutine gapcon */


/*     INPUT: */

/*     d(1)               separation between the surfaces */
/*     d(2)               pressure transmitted across the surfaces */
/*     flowm              not used */
/*     temp(1)            temperature at the slave node (node-to-face */
/*                        contact) or at the slave integration point */
/*                        (face-to-face contact) */
/*     temp(2)            temperature at the corresponding master */
/*                        position */
/*     predef             not used */
/*     time(1)            step time at the end of the increment */
/*     time(2)            total time at the end of the increment */
/*     ciname             surface interaction name */
/*     slname             not used */
/*     msname             not used */
/*     coords(1..3)       coordinates of the slave node (node-to-face */
/*                        contact) or of the slave integration point */
/*                        (face-to-face contact) */
/*     noel               element number of the contact spring element */
/*     node               slave node number; zero for face-to-face contact */
/*     npred              not used */
/*     kstep              step number */
/*     kinc               increment number */
/*     area               slave area corresponding to the contact spring */
/*                        element */

/*     OUTPUT: */

/*     ak(1)              gap conductance */
/*     ak(2..5)           not used */







/*     insert code here */

    /* Parameter adjustments */
    --coords;
    --time;
    predef -= 3;
    --temp;
    --flowm;
    --d__;
    --ak;

    /* Function Body */
    return 0;
} /* gapcon_ */

