/* creep.f -- translated by f2c (version 20200916).
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

static doublereal c_b2 = .2;


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

/* Subroutine */ int creep_(doublereal *decra, doublereal *deswa, doublereal *
	statev, doublereal *serd, doublereal *ec, doublereal *esw, doublereal 
	*p, doublereal *qtild, doublereal *temp, doublereal *dtemp, 
	doublereal *predef, doublereal *dpred, doublereal *time, doublereal *
	dtime, char *cmname, integer *leximp, integer *lend, doublereal *
	coords, integer *nstatv, integer *noel, integer *npt, integer *layer, 
	integer *kspt, integer *kstep, integer *kinc, ftnlen cmname_len)
{
    /* System generated locals */
    doublereal d__1;

    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *);


/*     user creep routine */

/*     INPUT (general): */

/*     statev(1..nstatv)  internal variables */
/*     serd               not used */
/*     ec(1)              equivalent creep at the start of the increment */
/*     ec(2)              not used */
/*     esw(1..2)          not used */
/*     p                  not used */
/*     temp               temperature at the end of the increment */
/*     dtemp              not used */
/*     predef             not used */
/*     dpred              not used */
/*     time(1)            value of the step time at the end of the increment */
/*     time(2)            value of the total time at the end of the increment */
/*     dtime              time increment */
/*     cmname             material name */
/*     leximp             not used */
/*     lend               if = 2: isotropic creep */
/*                        if = 3: anisotropic creep */
/*     coords(1..3)       coordinates of the current integration point */
/*     nstatv             number of internal variables */
/*     noel               element number */
/*     npt                integration point number */
/*     layer              not used */
/*     kspt               not used */
/*     kstep              not used */
/*     kinc               not used */

/*    INPUT only for elastic isotropic materials: */
/*     qtild              von Mises stress */

/*    INPUT only for elastic anisotropic materials: */
/*     decra(1)           equivalent deviatoric creep strain increment */


/*     OUTPUT (general): */

/*     decra(5)           derivative of the equivalent deviatoric */
/*                        creep strain increment w.r.t. the von Mises */
/*                        stress */

/*     OUTPUT only for elastic isotropic materials: */
/*     decra(1)           equivalent deviatoric creep strain increment */

/*     OUTPUT only for elastic anisotropic materials: */
/*     qtild              von Mises stress */





    /* Parameter adjustments */
    --coords;
    --time;
    --dpred;
    --predef;
    --esw;
    --ec;
    --statev;
    --deswa;
    --decra;

    /* Function Body */
    d__1 = decra[1] * 1e10 / *dtime;
    *qtild = pow_dd(&d__1, &c_b2);
/* Computing 4th power */
    d__1 = *qtild, d__1 *= d__1;
    decra[5] = *dtime * 5e-10 * (d__1 * d__1);

    return 0;
} /* creep_ */

