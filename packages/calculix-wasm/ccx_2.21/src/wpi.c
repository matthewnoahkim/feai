/* wpi.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int wpi_(doublereal *w, doublereal *pi, doublereal *q, 
	doublereal *sqtt, doublereal *kappa, doublereal *rgas)
{
    /* System generated locals */
    doublereal d__1, d__2;

    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *), sqrt(doublereal);

    /* Local variables */
    doublereal kappah, kappaq, pikrit, wkritf;


/* ----------------------------------------------------------------------- */
/*                                                                      | */
/*     Dieses Unterprogramm berechnet die Stroemungs-Geschwindigkeit    | */
/*     fuer das eingegebene Druckverhaeltnis PI.                        | */
/*                                                                      | */
/*     Eingabe-Groessen:                                                | */
/*       PI     = Druckverhaeltnis PS/PT                                | */
/*       Q      = reduzierter Durchsatz                                 | */
/*       SQTT   = SQRT (Totaltemperatur)                                | */
/*                                                                      | */
/*     Ausgabe-Groessen:                                                | */
/*       W      = Stroemungs-Geschwindigkeit                            | */
/*                                                                      | */
/* ----------------------------------------------------------------------- */

/*       INCLUDE 'comkapfk.inc' */

/* ----------------------------------------------------------------------- */

    kappaq = 1. / *kappa;
    d__1 = 2. / (*kappa + 1.);
    d__2 = *kappa / (*kappa - 1.);
    pikrit = pow_dd(&d__1, &d__2);

    kappah = *kappa * 2. / (*kappa + 1.);
    wkritf = sqrt(kappah * *rgas);

    if (*pi >= 1.) {
/*       Druckverhaeltnis groesser gleich 1 */
	*w = 0.;
    } else if (*pi > pikrit) {
/*       Druckverhaeltnis unterkritisch */
	if (*q > 0.) {
	    d__1 = -kappaq;
	    *w = *q * *rgas * *sqtt * pow_dd(pi, &d__1);
	} else {
	    *w = 0.;
	}
    } else if (*pi > 0.) {
/*       Druckverhaeltnis ueberkritisch */
	*w = wkritf * *sqtt;
    } else {
/*       Druckverhaeltnis ungueltig */
	*w = 1e20;
    }

    return 0;
} /* wpi_ */

