/* cd_Mcgreehan_Schotsch.f -- translated by f2c (version 20200916).
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


/*     this subroutine enables to calculate the basis incompressible */
/*     discharge coefficient */

/*     "Flow Characteristics of long orifices with rotation and corner radiusing" */
/*     W.F. Mcgreehan and M.J. Schotsch */
/*     ASME 87-GT-162 */

/*     author: Yannick Muller */

/* Subroutine */ int cd_mcgreehan_schotsch__(doublereal *rzdh, doublereal *
	bdh, doublereal *reynolds, doublereal *cdu)
{
    /* System generated locals */
    doublereal d__1;

    /* Builtin functions */
    double exp(doublereal);

    /* Local variables */
    doublereal cd_r__, cd_re__;




    cd_re__ = 372. / *reynolds + .5885;

/*     the radius correction */

/* Computing 2nd power */
    d__1 = *rzdh;
    cd_r__ = 1 - (exp(*rzdh * -5.5 - d__1 * d__1 * 3.5) * .992 + .008) * (1 - 
	    cd_re__);

    *cdu = 1. - (1. - cd_r__) * (exp(*bdh * *bdh * -1.606) * 1.3 + 1.) * (*
	    bdh * .021 + .435);

    return 0;

} /* cd_mcgreehan_schotsch__ */

