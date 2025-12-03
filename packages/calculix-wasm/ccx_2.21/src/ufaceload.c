/* ufaceload.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int ufaceload_(doublereal *co, integer *ipkon, integer *kon, 
	char *lakon, integer *nboun, integer *nodeboun, integer *nelemload, 
	char *sideload, integer *nload, integer *ne, integer *nk, ftnlen 
	lakon_len, ftnlen sideload_len)
{


/*     INPUT: */

/*     co(0..3,1..nk)     coordinates of the nodes */
/*     ipkon(*)           element topology pointer into field kon */
/*     kon(*)             topology vector of all elements */
/*     lakon(*)           vector with elements labels */
/*     nboun              number of SPC's */
/*     nodeboun(*)        SPC node */
/*     nelemload(1..2,*)  1: elements faces of which are loaded */
/*                        2: nodes for environmental temperatures */
/*     sideload(*)        load label */
/*     nload              number of facial distributed loads */
/*     ne                 highest element number */
/*     nk                 highest node number */

/*     user routine called at the start of each step; possible use: */
/*     calculation of the area of sets of elements for */
/*     further use to calculate film or radiation coefficients. */
/*     The areas can be shared using common blocks. */





/*     enter code here */

    /* Parameter adjustments */
    sideload -= 20;
    nelemload -= 3;
    --nodeboun;
    lakon -= 8;
    --kon;
    --ipkon;
    co -= 4;

    /* Function Body */
    return 0;
} /* ufaceload_ */

