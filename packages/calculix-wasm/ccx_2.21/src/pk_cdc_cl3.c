/* pk_cdc_cl3.f -- translated by f2c (version 20200916).
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

/*     cd compresibble for class 3 orifices where l/d>0 and r/d>0 */

/*     author: Yannick Muller */

/* Subroutine */ int pk_cdc_cl3__(doublereal *lqd, doublereal *rqd, 
	doublereal *reynolds, doublereal *p2p1, doublereal *beta, doublereal *
	kappa, doublereal *cdc_cl3__)
{
    extern /* Subroutine */ int pk_cdc_cl3a__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *), pk_cdc_cl3b__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *), pk_cdc_cl3d__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *);
    doublereal cdc_cl3a__, cdc_cl3b__, cdc_cl3d__;




    cdc_cl3a__ = 0.;
    cdc_cl3b__ = 0.;
    cdc_cl3d__ = 0.;

    if (*lqd <= .28) {
	pk_cdc_cl3a__(lqd, rqd, reynolds, p2p1, beta, kappa, &cdc_cl3a__);
	*cdc_cl3__ = cdc_cl3a__;
    } else if (*lqd <= .5) {
	pk_cdc_cl3b__(lqd, rqd, reynolds, p2p1, beta, kappa, &cdc_cl3b__);
	*cdc_cl3__ = cdc_cl3b__;
    } else {
	pk_cdc_cl3d__(lqd, rqd, reynolds, p2p1, beta, &cdc_cl3d__);
	*cdc_cl3__ = cdc_cl3d__;

    }

    return 0;

} /* pk_cdc_cl3__ */

