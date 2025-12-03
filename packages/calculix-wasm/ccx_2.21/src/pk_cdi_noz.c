/* pk_cdi_noz.f -- translated by f2c (version 20200916).
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

static doublereal c_b2 = 2.;
static doublereal c_b3 = 3.;


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

/* cd  incompressible for ASME nozzles eq 4a 4b */

/*     author: Yannick Muller */

/* Subroutine */ int pk_cdi_noz__(doublereal *reynolds, doublereal *cdi_noz__)
{
    /* System generated locals */
    doublereal d__1;

    /* Builtin functions */
    double log(doublereal), pow_dd(doublereal *, doublereal *), sqrt(
	    doublereal);

    /* Local variables */
    doublereal e, cdi_noz_hr__, cdi_noz_lr__, ln_reynolds__, reynolds_cor__;




    if (*reynolds < 4e4) {

/* formerly pk_cdi_noz_lr : for low Reynolds nsumber */

	if (*reynolds == 0.) {
	    reynolds_cor__ = 1.;
	} else {
	    reynolds_cor__ = *reynolds;
	}
	e = 2.718281828459045;
	ln_reynolds__ = log(reynolds_cor__) / log(e);

	cdi_noz_lr__ = ln_reynolds__ * .152884 + .19436 - pow_dd(&
		ln_reynolds__, &c_b2) * .0097785 + pow_dd(&ln_reynolds__, &
		c_b3) * 2.0903e-4;

	*cdi_noz__ = cdi_noz_lr__;

    } else if (*reynolds < 5e4) {

	if (*reynolds == 0.) {
	    reynolds_cor__ = 1.;
	} else {
	    reynolds_cor__ = *reynolds;
	}

	e = 2.718281828459045;
	ln_reynolds__ = log(reynolds_cor__) / log(e);

/* Computing 2nd power */
	d__1 = ln_reynolds__;
	cdi_noz_lr__ = ln_reynolds__ * .152884 + .19436 - d__1 * d__1 * 
		.0097785 + pow_dd(&ln_reynolds__, &c_b3) * 2.0903e-4;

	cdi_noz_hr__ = .9975 - sqrt(20.) * .00653;
/*     linear interpolation in order to achieve continuity */

	*cdi_noz__ = cdi_noz_lr__ + (cdi_noz_hr__ - cdi_noz_lr__) * (*
		reynolds - 4e4) / 1e4;
    } else {

/*     formerly pk_cdi_noz_hr for high Reynolds numbers */

	*cdi_noz__ = .9975 - sqrt(1e6 / *reynolds) * .00653;
    }
    return 0;
} /* pk_cdi_noz__ */

