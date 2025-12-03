/* regularization_gt_c.f -- translated by f2c (version 20200916).
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


/*     regularization function for tangential contact mortar */
/*     (old, only for stressmortar) */

/*  [in]	lambdatt	lambdatilde_tau=lambda_tau-bar{lambda}_tau */
/*  [in]	divmode 	indicates whether funtion or derivate */
/*                             	should be called */
/*                    		=0 function called */
/*                    		=1 derivative called */
/*  [in]	regmode        	selects regularization funtion */
/*                    		=1 perturbed Lagrange */
/*  [out] gtc	        result regularization function */
/*  [in]  atauinvloc      stiffness constant for perturbed Lagrange */

/* Subroutine */ int regularization_gt_c__(doublereal *lambdatt, integer *
	divmode, integer *regmode, doublereal *gtc, doublereal *atauinvloc)
{
    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    doublereal t1l;
    integer kode;
    extern /* Subroutine */ int exit_(integer *);

    /* Fortran I/O blocks */
    static cilist io___3 = { 0, 6, 0, 0, 0 };



/*     regularization function for tangential contact */
/*     Author: Saskia Sitzmann */






    /* Parameter adjustments */
    --gtc;
    --lambdatt;

    /* Function Body */
    kode = -51;
    t1l = 0.f;

/*     perturbed Lagrange */

    if (*regmode == 1) {
	if (*divmode == 0) {
	    gtc[1] = *atauinvloc * lambdatt[1];
	    gtc[2] = *atauinvloc * lambdatt[2];
	} else if (*divmode == 1) {
	    gtc[1] = *atauinvloc;
	    gtc[2] = *atauinvloc;
	} else {
	    s_wsle(&io___3);
	    do_lio(&c__9, &c__1, "error in regularzation_gt_c.f!", (ftnlen)30)
		    ;
	    e_wsle();
	    exit_(&c__201);
	}
    } else {
	gtc[1] = 0.f;
	gtc[2] = 0.f;
    }

    return 0;
} /* regularization_gt_c__ */

