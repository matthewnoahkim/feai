/* pk_cdc_cl3a.f -- translated by f2c (version 20200916).
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

/* cd compressible for class 3 orifice where, l/d>0 and r/d>0 */
/* typ a) with 0 <= l/d<=0.28 (eq. 25 modified) */

/* Subroutine */ int pk_cdc_cl3a__(doublereal *lqd, doublereal *rqd, 
	doublereal *reynolds, doublereal *p2p1, doublereal *beta, doublereal *
	kappa, doublereal *cdc_cl3a__)
{
    extern /* Subroutine */ int pk_y0_yg__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *);
    doublereal cdqcv_rl__;
    extern /* Subroutine */ int pk_cdi_se__(doublereal *, doublereal *, 
	    doublereal *), pk_cdi_rl__(doublereal *, doublereal *, doublereal 
	    *, doublereal *, doublereal *);
    doublereal cdqcv_noz__, y0, yg;
    extern /* Subroutine */ int pk_cdi_noz__(doublereal *, doublereal *);
    doublereal cdi_se__, cdi_rl__, cdi_noz__;




/*     cd incompressible nozlle eq 4a 4b */
    pk_cdi_noz__(reynolds, &cdi_noz__);
/*     cd incompresible eq.6 */
    pk_cdi_rl__(lqd, rqd, reynolds, beta, &cdi_rl__);
/*     cd incompressible sharp edge eq.3 */
    pk_cdi_se__(reynolds, beta, &cdi_se__);
/*     y0,yg ,eq. 15-17, eq.18 */
    pk_y0_yg__(p2p1, beta, kappa, &y0, &yg);

    cdqcv_noz__ = cdi_noz__ / (cdi_noz__ * .0718 + .9282);
    cdqcv_rl__ = cdi_rl__ / (cdi_rl__ * .0718 + .9282);

/*     eq.26 modified for class 3a */

    *cdc_cl3a__ = cdi_rl__ * ((cdqcv_noz__ - cdqcv_rl__) / (cdqcv_noz__ - 
	    cdi_se__ / .971) * (y0 / yg - 1.) + 1.);

    return 0;

} /* pk_cdc_cl3a__ */

