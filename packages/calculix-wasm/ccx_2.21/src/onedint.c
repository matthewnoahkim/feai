/* onedint.f -- translated by f2c (version 20200916).
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


/*  1. TASK         INTERPOLATION OF A FUNCTION DEFINED POINT BY POINT */
/*  *********       THE X COORDINATES ARE USER SPECIFIED. */
/*                  THE INTERPOLATION PROCESS CAN BE EITHER CONSTANT,LINEAR */
/*                  OR EVEN dOUBLE QUADRATIC WITH EXTRAPOLATION USING THE */
/*                  POLYNOM HIGHEST ORDER */
/*                  thE DOUBLE QUADRATIC INTERPOLATION IS A 3RD ORDER METHOD */
/*                  BY WHICH 2 PARABOLS ENCOMPASSING EACH 3 AND 4 sAMPLING POINTS */
/*                  ARE DEFINED. */
/*                  THE SOLUTION IS A LINEAR COMBINATION OF THE CONCERNED */
/*                  PARABOLS VALUES DEPENDING ON THE DEFINITION OF THE ACTUAL */
/*                  SAMPLING POINT INTERVAL */


/*  2.INPUT     CALL ONEDINT(XE,YE,NE,XA,YA,NA,IART,IEXP,IER) */
/*  ***********                XE = ABSCISSE VECTOR OF THE SAMPLING POINTS */
/*                             YE = ORDINATE VECTOR OF THE SAMPLING POINTS */
/*                             NE = LENGHT OF THE SAMPLING POINT VECTOR */
/*                             XA = ASCISSE VECTOR OF THE INTERPOLATION POINT(INPUT) */
/*                             YA = ORDINATE VECTOR OF THE INTERPOLATION POINT(OUTPUT) */
/*                             NA = LENGTH OF THE INTERPOLATION VECTOR                         c              
               IART = tYPE OF INTERPOLATION */
/*                                    =0: CONSTANT */
/*                                    =1: LINEAR */
/*                                    =2: DOUBLE QUADRATIC */
/*                             IEXP = TYPE OF EXTRAPOLATION */
/*                                    IEXP = 10*IEX1 + IEXN */
/*                                    IEX1 EXTRAPOLATIONS BEYOND THE */
/*                                         1. SAMPLING POINT IN THE VECTOR */
/*                                    IEXN EXTRAPOLATION BEYOND THE */
/*                                         LAST SAMPLING POINT IN THE VECTOR */
/*                                    SELECTION OF THE EXTRAPOLATION TYPE AS */
/*                                    FOR IART. */
/*                             IER  = ERROR CODE */
/*                                    = 0: NORMAL PROCEEDING */
/*                                    =-1:PROBLEM IN TH EGIVEN VALUES */
/*                                         PROGRAMM STOPS. */

/*  3.RESTRICTION    ABSCISSE VECTOR XE MUST BE STRICTLY MONOTONIC INCREASING SORTED */
/*  ***************  AUTOMATIC CONTROL INSIDE TEH SUBROUTINE: */
/*                   NE = 0: ERROR INTERRUPTION */
/*                   NE = 1: ONLY CONSTANT INTER- EXTRAPOLATION */
/*                   NE = 2: MAXIMAL LINEAR INTER- EXTRAPOLATION */
/*                   NE = 3: MAXIMAL QUADRATIC INTER- EXTRAPOLATIO */
/*                   THE PARAMETER FOR THE TYPE OF EXTRAPOLATION */
/*                   MUST NOT BE GREATER THAN THE ONE FOR TH EINTERPOLATION TYPE */
/*                   OTHERWISE THE  VALUE IS AUTOMATICALLY ADAPTATED */

/* Subroutine */ int onedint_(doublereal *xe, doublereal *ye, integer *ne, 
	doublereal *xa, doublereal *ya, integer *na, integer *iart, integer *
	iexp, integer *ier)
{
    /* System generated locals */
    integer i__1, i__2;
    doublereal d__1;

    /* Local variables */
    integer i__, l, ia, ig;
    doublereal xd, yd, xo, yo, xu, yu, xz, yz;
    integer ie1, na1, ie2, ne1;
    doublereal zw1, zw2, rab;


/* INTERPOLATION FUNCTION */
/* ------------------------ */

/* INPUT/DATA TEST,INTERPOLATION DIVERGENCE,EXTRAPOLATION LIMIT */
/* ---------------------------------------------------------------- */
    /* Parameter adjustments */
    --ye;
    --xe;
    --ya;
    --xa;

    /* Function Body */
    na1 = *na - 1;
    if (*na <= 0) {
	goto L900;
    }
    ne1 = *ne - 1;
    if (ne1 < 0) {
	goto L900;
    } else if (ne1 == 0) {
	goto L22;
    } else {
	goto L18;
    }
L18:
    i__1 = ne1;
    for (l = 1; l <= i__1; ++l) {
/* L20: */
	if (xe[l + 1] - xe[l] <= 0.) {
	    goto L900;
	}
    }
L22:
    ie1 = *iexp / 10;
    ie2 = *iexp - ie1 * 10;
    ia = *iart;
    if (ne1 < ia) {
	ia = ne1;
    }
    if (ia < ie1) {
	ie1 = ia;
    }
    if (ia < ie2) {
	ie2 = ia;
    }

/* SUCCESSIVE PROCESSING THE INTERPOLATION EXIGENCES */
/* ------------------------------------------------------- */

/*     ZUR ERHOEHUNG DER NUMERISCHEN GENAUIGKEIT WIRD EINE */
/*     TRANSLATION VON (XO,YO) IN (0,0) DURCHGEFUEHRT. DIES */
/*     BEWIRKT AUSSERDEM  EINE BESCHLEUNIGUNG DES VERFAHRENS. */

    i__1 = *na;
    for (i__ = 1; i__ <= i__1; ++i__) {
	i__2 = *ne;
	for (l = 1; l <= i__2; ++l) {
	    if (xa[i__] < xe[l]) {
		goto L30;
	    }
/* L24: */
	}
	l = *ne;
	if (ie2 - 1 < 0) {
	    goto L50;
	} else if (ie2 - 1 == 0) {
	    goto L35;
	} else {
	    goto L70;
	}
L30:
	if (l > 1) {
	    goto L40;
	}
	if (ie1 - 1 < 0) {
	    goto L50;
	} else if (ie1 - 1 == 0) {
	    goto L25;
	} else {
	    goto L70;
	}
L40:
	if (ia - 1 < 0) {
	    goto L45;
	} else if (ia - 1 == 0) {
	    goto L60;
	} else {
	    goto L70;
	}

/* CONSTANT INTERPOLATION */
/* ----------------------- */
L45:
	--l;
L50:
	ya[i__] = ye[l];
	goto L100;

/* LINEAR EXTRAPOLATION */
/* ------------------------------ */
L25:
	if (ia == 1) {
	    goto L60;
	}
	xo = xe[2];
	xu = xe[1] - xo;
	yo = ye[2];
	yu = ye[1] - yo;
	xz = xe[3] - xo;
	yz = ye[3] - yo;
	goto L38;
L35:
	if (ia == 1) {
	    goto L60;
	}
	xo = xe[ne1];
	xz = xe[ne1 - 1] - xo;
	xu = xe[*ne] - xo;
	yo = ye[ne1];
	yz = ye[ne1 - 1] - yo;
	yu = ye[*ne] - yo;

/* LINEAR EXTRAPOLATION WITH QUADRATIC INTERPOLATION */
/* ----------------------------------------------------- */
L38:
	rab = yu / xu + xu * ((yz - yu) / (xz - xu) - yu / xu) / xz;
	ya[i__] = yu + yo + (xa[i__] - xu - xo) * rab;
	goto L100;

/* LINEAR INTERPOLATION */
/* --------------------- */
L60:
	ig = l - 1;
	if (ig < 1) {
	    ig = 1;
	}
	ya[i__] = ye[ig] + (xa[i__] - xe[ig]) * (ye[ig + 1] - ye[ig]) / (xe[
		ig + 1] - xe[ig]);
	goto L100;
L70:
	if (l > 2) {
	    goto L80;
	}
	xo = xe[2];
	xu = xe[1] - xo;
	yo = ye[2];
	yu = ye[1] - yo;
	xz = xe[3] - xo;
	yz = ye[3] - yo;
	goto L85;
L80:
	if (l < *ne) {
	    goto L90;
	}
	xo = xe[ne1];
	xu = xe[ne1 - 1] - xo;
	xz = xe[*ne] - xo;
	yo = ye[ne1];
	yu = ye[ne1 - 1] - yo;
	yz = ye[*ne] - yo;
L85:
	d__1 = xa[i__] - xo;
	ya[i__] = yu + yu * (d__1 - xu) / xu + ((yz - yu) / (xz - xu) - yu / 
		xu) * (d__1 - xu) * d__1 / xz + yo;
	goto L100;

/* DOUBLE QUADRATIC INTERPOLATION */
/* ---------------------------------- */
L90:
	xo = xe[l - 1];
	xu = xe[l - 2] - xo;
	xz = xe[l] - xo;
	xd = xe[l + 1] - xo;
	yo = ye[l - 1];
	yu = ye[l - 2] - yo;
	yz = ye[l] - yo;
	yd = ye[l + 1] - yo;
	d__1 = xa[i__] - xo;
	zw1 = yu + yu * (d__1 - xu) / xu + ((yz - yu) / (xz - xu) - yu / xu) *
		 (d__1 - xu) * d__1 / xz;
	d__1 = xa[i__] - xo;
	zw2 = yz * d__1 / xz + (yd / xd - yz / xz) * d__1 * (d__1 - xz) / (xd 
		- xz);
	ya[i__] = zw1 + (zw2 - zw1) * (xa[i__] - xo) / xz + yo;
L100:
	;
    }

/* RETURN BY NORMAL PROCEEDING */
/* ------------------------------- */
    *ier = 0;
    return 0;

/* ERROR RETURN */
/* ------------ */
L900:
    *ier = -1;
    return 0;
} /* onedint_ */

