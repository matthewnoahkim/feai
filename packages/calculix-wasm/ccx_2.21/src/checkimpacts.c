/* checkimpacts.f -- translated by f2c (version 20200916).
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
static integer c__5 = 5;


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

/* Subroutine */ int checkimpacts_(integer *ne, integer *neini, doublereal *
	temax, doublereal *sizemaxinc, doublereal *energyref, doublereal *
	tmin, doublereal *tmax, doublereal *tper, integer *idivergence, 
	integer *iforceincsize, integer *istab, doublereal *dtheta, 
	doublereal *r_abs__, doublereal *energy, doublereal *energyini, 
	doublereal *allwk, doublereal *allwkini, doublereal *dampwk, 
	doublereal *dampwkini, doublereal *emax, integer *mortar, doublereal *
	maxdecay, doublereal *enetoll)
{
    /* System generated locals */
    doublereal d__1, d__2;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    doublereal r_rel_bc__, delta_r_abs__, delta_r_rel__, fact, delta, r_rel__;

    /* Fortran I/O blocks */
    static cilist io___7 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };



/*     # # # # # # # # # # # # # # # # # # # # # # # # # # # # # */
/*     Routine that contains the implementation of the logic to */
/*       rule the increment size during contact conditions. */
/*     The values of tolerances have been tested for the ball */
/*       model, the two sliding blades (simplified model of */
/*       blade from Mr. Wittig) and the real blade model. */
/*     Friction has not been tested deeply. */

/*     Main variables and meaning */

/*     sizemaxinc    : maximum size of the current increment */
/*     iforceincsize : flag to set "dtheta=sizemaxinc" in */
/*                       checkconvergence. */
/*     cstate        : vector containing contact data */
/*     temax            : max. natural period of oscillation */
/*     icase         : flag to print debug informations */
/*     emax          : maximum energy of the system over the ti- */
/*                       me history */
/*     r         : energy residual before contact (or re- */
/*                       adapted) */
/*     delta         : eneres normalized */
/*     fact          : factor to set sizemaxinc according to the */
/*                       contact formulation */
/*     stab_th       : \hat{r}_{e}(t_n) -> mod belytschko before */
/*                       contact (or initial value). This is the */
/*                       stability threshold */
/*     delta_r_rel   : \hat{r}_{e}(t) - \hat{r}_{e}(t-1) -> varia- */
/*                       tion of the modified belitschko criterion */
/*                       used to control jumps */
/*     r_rel         : \hat{r}_{e}(t) actual value of the modified */
/*                       belitschko criterion */

/*     Proposed by Matteo Pacher */

/*     # # # # # # # # # # # # # # # # # # # # # # # # # # # # # */




/*     Initialization */

    /* Parameter adjustments */
    --energyini;
    --energy;

    /* Function Body */
    *iforceincsize = 0;

/*     Adaption of the energy residual (absolute/relative check) */

    if (abs(*r_abs__) < *enetoll / 4.) {
	delta = *r_abs__ * *emax;
    } else {
	delta = *r_abs__;
    }

    if (*mortar == 0) {
	fact = 10.;
    } else if (*mortar == 1) {
	fact = 1.;
    }

/*     Compute thresholds and energy values */

    delta_r_abs__ = energy[1] + energy[2] + energy[3] + energy[4] - *allwk - *
	    dampwk - (energyini[1] + energyini[2] + energyini[3] + energyini[
	    4] - *allwkini - *dampwkini);

    if (*emax <= 0.) {

/*     No kinetic energy in the structure: energyref is the internal energy */
/*     this happens at the beginning of the calculation */

	r_rel__ = (energy[1] + energy[2] + energy[3] + energy[4] - *allwk - *
		dampwk - *energyref) / *energyref;
	delta_r_rel__ = delta_r_abs__ / *energyref;
	r_rel_bc__ = delta / *energyref;
    } else {
	r_rel__ = (energy[1] + energy[2] + energy[3] + energy[4] - *allwk - *
		dampwk - *energyref) / *emax;
	delta_r_rel__ = delta_r_abs__ / *emax;
	r_rel_bc__ = delta / *emax;
    }

/*     Logic to adapt the increment size */

    if (*mortar == 0) {

/*     Energy conservation rules for NODE TO SURFACE penalty contact */

	if (delta_r_rel__ < -.008 && *ne >= *neini) {

/*     Impact (or too high variation during pers. contact) */
/*     delta_r_rel = r_rel-r_rel_ini */

	    *idivergence = 1;
	    *sizemaxinc = *dtheta * .25;
	    *iforceincsize = 1;
	} else if (r_rel__ - r_rel_bc__ > .0025 && *ne <= *neini) {

/*     Rebound (or too high variation during pers. contact) */
/*     r_rel_bc is r_rel before contact */

	    *idivergence = 1;
	    *sizemaxinc = *dtheta * .5;
	    *iforceincsize = 1;
	} else {

/*     Persistent Contact */

	    if (r_rel__ > *maxdecay * -.9) {
/* Computing MAX */
		d__1 = fact * *temax / *tper, d__2 = *dtheta * 1.01;
		*sizemaxinc = max(d__1,d__2);
/* Computing MIN */
		d__1 = *sizemaxinc, d__2 = *temax * 100. / *tper;
		*sizemaxinc = min(d__1,d__2);
	    } else {
/* Computing MAX */
		d__1 = *temax / *tper / 10., d__2 = *dtheta * .5;
		*sizemaxinc = max(d__1,d__2);
		*istab = 1;
	    }

	}

    } else if (*mortar == 1) {

/*     Energy conservation rules for SURFACE TO SURFACE penalty contact */

	if (delta_r_rel__ < -.008 && *ne >= *neini) {

/*     Impact (or too high variation during pers. contact) */
/*     delta_r_rel = r_rel-r_rel_ini */

	    *idivergence = 1;
	    *sizemaxinc = *dtheta * .25;
	    *iforceincsize = 1;

	} else if (r_rel__ - r_rel_bc__ > .0025 && *ne <= *neini) {

/*     Rebound (or too high variation during pers. contact) */
/*     r_rel_bc is r_rel before contact */

	    *idivergence = 1;
	    *sizemaxinc = *dtheta * .5;
	    *iforceincsize = 1;

	} else {

/*     Persistent Contact */

	    if (r_rel__ > *maxdecay * -.9) {
/* Computing MIN */
		d__1 = fact * *temax / *tper, d__2 = *dtheta * 1.1;
		*sizemaxinc = min(d__1,d__2);
/* Computing MIN */
		d__1 = *sizemaxinc, d__2 = *temax * 100. / *tper;
		*sizemaxinc = min(d__1,d__2);
	    } else {
/* Computing MAX */
		d__1 = *temax / *tper / 10., d__2 = *dtheta * .5;
		*sizemaxinc = max(d__1,d__2);
		*istab = 1;
	    }
	}
    }

/* (mortar) */
    if (*sizemaxinc < *tmin) {
	*sizemaxinc = *tmin;
    } else if (*sizemaxinc > *tmax) {
	*sizemaxinc = *tmax;
    }

    s_wsle(&io___7);
    do_lio(&c__9, &c__1, "*INFO in checkimpacts: due to impact rules the", (
	    ftnlen)46);
    e_wsle();
    s_wsle(&io___8);
    do_lio(&c__9, &c__1, "      maximum allowed time increment has been", (
	    ftnlen)45);
    e_wsle();
    s_wsle(&io___9);
    do_lio(&c__9, &c__1, "      changed to", (ftnlen)16);
    d__1 = *sizemaxinc * *tper;
    do_lio(&c__5, &c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
    e_wsle();

    return 0;
} /* checkimpacts_ */

