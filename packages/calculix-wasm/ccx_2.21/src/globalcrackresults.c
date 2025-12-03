/* globalcrackresults.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int globalcrackresults_(integer *nfront, integer *ifront, 
	doublereal *wk1, doublereal *wk2, doublereal *wk3, doublereal *dkeq, 
	doublereal *domphi, doublereal *dadn, integer *ncyc, doublereal *
	wk1glob, doublereal *wk2glob, doublereal *wk3glob, doublereal *
	dkeqglob, doublereal *phiglob, doublereal *dadnglob, doublereal *
	dnglob, doublereal *acrack, doublereal *acrackglob, integer *nstep, 
	doublereal *xkeqmin, doublereal *xkeqmax, doublereal *xkeqminglob, 
	doublereal *xkeqmaxglob, integer *iinc, integer *iincglob, doublereal 
	*domstep, doublereal *domstepglob, doublereal *r__, doublereal *rglob)
{
    /* System generated locals */
    integer i__1;

    /* Local variables */
    integer i__, node;


/*     calculate the stress intensity factors along the crack fronts */




    /* Parameter adjustments */
    --rglob;
    --r__;
    --domstepglob;
    --domstep;
    --iincglob;
    --xkeqmaxglob;
    --xkeqminglob;
    --xkeqmax;
    --xkeqmin;
    --acrackglob;
    --acrack;
    --dnglob;
    --dadnglob;
    --phiglob;
    --dkeqglob;
    --wk3glob;
    --wk2glob;
    --wk1glob;
    --dadn;
    --domphi;
    --dkeq;
    --wk3;
    --wk2;
    --wk1;
    --ifront;

    /* Function Body */
    i__1 = *nfront;
    for (i__ = 1; i__ <= i__1; ++i__) {

/*     loop over all nodes belonging to the non-propagated crack front(s); */
/*     the crack length is the one corresponding to step 1; */
/*     although acrackglob(node) already has values from the previous */
/*     increment (except in the first increment), the value of */
/*     acrack(i) may be different due to cracklength_smoothing; */

	node = ifront[i__];
	wk1glob[node] = wk1[i__];
	wk2glob[node] = wk2[i__];
	wk3glob[node] = wk3[i__];
	xkeqminglob[node] = xkeqmin[i__];
	xkeqmaxglob[node] = xkeqmax[i__];
	dkeqglob[node] = dkeq[i__];
	rglob[node] = r__[i__];
	phiglob[node] = domphi[i__];
	dadnglob[node] = dadn[i__];
	acrackglob[node] = acrack[i__];

/*       the following line is needed for the first increment */

	iincglob[node] = *iinc;
	domstepglob[node] = domstep[i__];
    }

    return 0;
} /* globalcrackresults_ */

