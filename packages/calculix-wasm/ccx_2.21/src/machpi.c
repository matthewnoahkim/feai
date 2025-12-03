/* machpi.f -- translated by f2c (version 20200916).
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


/*     author: Yannick Muller */

/* Subroutine */ int machpi_(doublereal *mach, doublereal *pi, doublereal *
	kappa, doublereal *rgas)
{
    /* System generated locals */
    doublereal d__1, d__2;

    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *), sqrt(doublereal);

    /* Local variables */
    doublereal ma2, kappam, kappax, pikrit;


/* ----------------------------------------------------------------------- */
/*                                                                      | */
/*     Dieses Unterprogramm berechnet die Mach-Zahl fuer das            | */
/*     eingegebene Druckverhaeltnis PI.                                 | */
/*                                                                      | */
/*     Eingabe-Groessen:                                                | */
/*       PI     = Druckverhaeltnis PS/PT                                | */
/*                                                                      | */
/*     Ausgabe-Groessen:                                                | */
/*       MACH   = Mach-Zahl                                             | */
/*                                                                      | */
/* ----------------------------------------------------------------------- */


/* ----------------------------------------------------------------------- */

    kappax = (*kappa - 1) / *kappa;
    kappam = 2. / (*kappa - 1.);
    d__1 = 2. / (*kappa + 1.);
    d__2 = *kappa / (*kappa - 1.);
    pikrit = pow_dd(&d__1, &d__2);

    if (*pi >= 1.) {
/*       Druckverhaeltnis groesser gleich 1 */
	*mach = 0.;
    } else if (*pi > pikrit) {
/*       Druckverhaeltnis unterkritisch */
	d__1 = -kappax;
	ma2 = kappam * (pow_dd(pi, &d__1) - 1.);
	if (ma2 > 0.) {
	    *mach = sqrt(ma2);
	} else {
	    *mach = 0.;
	}
    } else if (*pi > 0.) {
/*       Druckverhaeltnis ueberkritisch */
	*mach = 1.;
    } else {
/*       Druckverhaeltnis ungueltig */
	*mach = 1e20;
    }

    return 0;
} /* machpi_ */

