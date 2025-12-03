/* twodint.f -- translated by f2c (version 20200916).
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


/*  1.TASK          INTERPOLATION OF A TWO DIMENSIONAL FUNCTION DEFINED POINT BY POINT */
/*  *********       THE X COORDINATES ARE USER SPECIFIED. */
/*                  THE INTERPOLATION TYPE CAN BE INDEPENDANTLY CHOSEN IN THE TWO DIRECTIONS */
/*                  EITHER CONSTANT, LINEAR OR DOUBLE QUADRATIC. */
/*                  BEYOND THE FIELD OF INTERPOLATION AN EXTRAOLATION IS CARRIED OUT. */
/*                  FOR ALL FOUR EXTRAPOLATION DIRECTIONS DIFFERENT EXTRAPOLATION METHOD */
/*                 (C ONSTANT,LINEAR,QUADRATIC) CAN BE CHOSEN, WHICH ORDER MUST NOT BE HIGHER */
/*                  THAN THE IONTERPOLATION ORDER */

/*  2.UP-AUFRUF     CALL TWODINT(T,LSP,IART,XA,YA,ZA,NA,IEXP,IER) */
/*  ***********                 T = MATRIX OF THE SAMPLE POINTS FORMATED AS FOLLOW */
/*                                  T(1,1) = NX + NY * 0.001 */
/*                                         NX = NUMBER OF LINES T */
/*                                         NY = NUMBER OF COLUMNS T */
/*                                  T(1,2) ... T(1,NY) */
/*                                        VECTOR OF THE Y COORDINATES OF THE T MATRIX */
/*                                  T(2,1) ... T(NX,1) */
/*                                         VECTOR OF THE X COORDINATES OF THE T MATRIX */
/*                                  REST  OF T-MATRIX: */
/*                                          POINT(X,Y) OF THE T MATRIX */

/*                              LSP  = COLUMN STEPOF  T */
/*                              IART = TYPE OF INTERPOLATION */
/*                                     IART = INTX * 10 + INTY */
/*                                     INTX INTERPOLATION TYPE IN X-DIRECTION */
/*                                     INTY INTERPOLATION TYPE IN Y-DIRECTION */
/*                              XA = VECTOR OF THE X COORDINATES OF THE VALUE TO BE INTERPOLATED */
/*                              YA = VECTOR OF THE Y COORDINATES OF THE VALUE TO BE INTERPOLATED */
/*                              ZA = VECTOR OF THE INTERPOLATED VALUES */
/*                              NA = ACTUAL LENGTH OF THE 3 PREVIOUS VECTORS */
/*                              IEXP = TWO ELEMENT VECTOR CONTRAINING THE TYPE OF EXTRAPOLATION */
/*                                      CHOSEN BEYOND THE INTERPOLATION DOMAIN */
/*                                     IEXP(1): EXTRAPOLATION IN X-DIRECTION */
/*                                     IEXP(1) = IEXPX1 * 10 + IEXPXN */
/*                                     IEXPX1: EXTRAPOLATION BENEATH THE FIRST POINT */
/*                                     IEXPXN: EXTRAPOLATION BEYOND THE LAST POINT */
/*                                     IEXP(2): EXTRAPOLATION IN Y-DIRECTION */
/*                                     IEXP(2) = IEXPY1 * 10 + IEXPYN */
/*                                     SAME METHOD AS FOR IEXP(1): */
/*                              IER = ERROR CODE */
/*                                     IER = 0: NORMAL PROCEEDING */
/*                                     IER = -1: ERROR  INPUTDATA */

/*                           REMARK: CHOICE OF THE INTER- EXTRAPOLATION TYPE  IART AND IEXP - */
/*                         --------             ASSIGNEMENT OF  INTX,INTY,IEXPX1, */
/*                                       IEXPXN,IEXPY1,IEXPYN: */
/*                                        = 0 :   CONSTANT */
/*                                        = 1 :   LINEAR */
/*                                        = 2 :   DOUBLE QUADRATIC FROM */
/*                                                THE  SECOND UNTIL PENULTIMATE */
/*                                                INTERVAL IN THE INTERPOLATION MATRIX T,OTHERWISE QUADRATIC 
*/

/* 3.RESTRICTIONS   THE SAMPLING POINT VECTORS (X UND Y COORDINATES */
/* ***************  OF THE MATRICX T MUST BE  STRICTLY MONOTONIC INCREASING SORTED */
/*                  THE PARAMETER FOR THE TYPE OF EXTRAPOLATION */
/*                  MUST NOT BE GREATER THAN THE ONE FOR TH EINTERPOLATION TYPE */
/*                  OTHERWISE THE  VALUE IS AUTOMATICALLY ADAPTATED */
/*                  IF THE NUMBER OF THE SAMPLING POINTS FOR THE REQUIRED TYPE OF INTERPOLATION IS TOO SMALL, 
*/
/*                  THE DEGREE OF INTERPOLATION WILL BE ACCORDINGLY ADAPTATED */

/*  4.USED UP'S     ONEDINT (ONE DIMENSIONAL INTERPOLATION ANALOG TO THIS PROGRAMM) */

/* Subroutine */ int twodint_(doublereal *t, integer *lsp, integer *iart, 
	doublereal *xa, doublereal *ya, doublereal *za, integer *na, integer *
	iexp, integer *ier)
{
    /* System generated locals */
    integer t_dim1, t_offset, i__1, i__2;

    /* Local variables */
    integer l;
    doublereal z1[4], z2[4];
    integer ll, lx, ly, nx, ny, one, idx, idy, ixo, iyo, ixu, iyu, inpx, inpy,
	     iexpx1, iexpy1, iexpxn, iexpyn;
    extern /* Subroutine */ int onedint_(doublereal *, doublereal *, integer *
	    , doublereal *, doublereal *, integer *, integer *, integer *, 
	    integer *);

/*      ENTRY ZWEINT (T,LSP,IART,XA,YA,ZA,NA,IEXP,IER) */
    /* Parameter adjustments */
    t_dim1 = *lsp;
    t_offset = 1 + t_dim1;
    t -= t_offset;
    --xa;
    --ya;
    --za;
    --iexp;

    /* Function Body */
    *ier = 0;
    one = 1;
    nx = (integer) t[t_dim1 + 1];
    ny = (integer) ((t[t_dim1 + 1] - nx) * 1000 + .1);

/* TESTING INPUT */
/* -------------- */
    if (nx - 2 < 0) {
	goto L900;
    } else if (nx - 2 == 0) {
	goto L30;
    } else {
	goto L10;
    }
L10:
    i__1 = nx;
    for (l = 3; l <= i__1; ++l) {
/* L20: */
	if (t[l + t_dim1] - t[l - 1 + t_dim1] <= 0.) {
	    goto L900;
	}
    }
L30:
    if (ny - 2 < 0) {
	goto L900;
    } else if (ny - 2 == 0) {
	goto L60;
    } else {
	goto L40;
    }
L40:
    i__1 = ny;
    for (l = 3; l <= i__1; ++l) {
/* L50: */
	if (t[l * t_dim1 + 1] - t[(l - 1) * t_dim1 + 1] <= 0.) {
	    goto L900;
	}
    }
L60:
    if (*na <= 0) {
	goto L900;
    }

/* DEFINING THE CONTROL VALUES */
/* --------------------------- */
    inpx = *iart / 10;
    inpy = (integer) (*iart - inpx * 10 + .1);
    iexpx1 = iexp[1] / 10;
    iexpxn = iexp[1] - iexpx1 * 10;
    iexpy1 = iexp[2] / 10;
    iexpyn = iexp[2] - iexpy1 * 10;
    if (nx - 2 < inpx) {
	inpx = nx - 2;
    }
    if (ny - 2 < inpy) {
	inpy = ny - 2;
    }
    if (iexpx1 > inpx) {
	iexpx1 = inpx;
    }
    if (iexpxn > inpx) {
	iexpxn = inpx;
    }
    if (iexpy1 > inpy) {
	iexpy1 = inpy;
    }
    if (iexpyn > inpy) {
	iexpyn = inpy;
    }

/* SUCCESSIVE PROCESSING THE INTERPOLATION EXIGENCES */
/* ------------------------------------------------------- */
    i__1 = *na;
    for (l = 1; l <= i__1; ++l) {
	lx = 2;

/* SETTING REFERENCE POINTS (LX,LY) */
/* --------------------------------- */
L200:
	if (xa[l] < t[lx + t_dim1]) {
	    goto L220;
	}
	++lx;
	if (lx - nx <= 0) {
	    goto L200;
	} else {
	    goto L210;
	}
L210:
	lx = nx;
L220:
	i__2 = ny;
	for (ly = 2; ly <= i__2; ++ly) {
/* L230: */
	    if (ya[l] < t[ly * t_dim1 + 1]) {
		goto L235;
	    }
	}
	ly = ny;
L235:
	iyu = ly - inpy;
	iyo = ly + inpy - 1;
	if (iyu >= 2) {
	    goto L240;
	}
	iyu = 2;
	iyo = iyu + inpy;
L240:
	if (iyo > ny) {
	    iyo = ny;
	}
	ixu = lx - inpx;
	ixo = lx + inpx - 1;
	if (ixu >= 2) {
	    goto L245;
	}
	ixu = 2;
	ixo = ixu + inpx;
L245:
	if (ixo > nx) {
	    ixo = nx;
	}
	idx = ixo - ixu + 1;
	if (ixu < ixo) {
	    goto L270;
	}
	if (iyu < iyo) {
	    goto L250;
	}

/* CONSTANT INTERPOLATION */
/* ------------------------ */
	if (lx > 2 && xa[l] < t[nx + t_dim1]) {
	    --lx;
	}
	if (ly > 2 && ya[l] < t[ny * t_dim1 + 1]) {
	    --ly;
	}
	za[l] = t[lx + ly * t_dim1];
	goto L400;

/* LINEAR AND  QUADRATIC INTERPOLATION USING ONEDINT (ONEDIMENSIONAL) */
/* --------------------------------------------------------------------- */

/* INTERPOLATION ONLY IN Y-DIRECTION */

L250:
	idy = 0;
	i__2 = iyo;
	for (ll = iyu; ll <= i__2; ++ll) {
	    ++idy;
	    z1[idy - 1] = t[ll * t_dim1 + 1];
/* L260: */
	    z2[idy - 1] = t[lx + ll * t_dim1];
	}
	goto L300;

/* INTERPOLATION ONLY IN X-DIRECTION */

L270:
	if (iyu < iyo) {
	    goto L280;
	}
	onedint_(&t[ixu + t_dim1], &t[ixu + ly * t_dim1], &idx, &xa[l], &za[l]
		, &one, &inpx, &iexp[1], ier);
	if (*ier == 0) {
	    goto L400;
	} else {
	    goto L900;
	}

/* 1.INTERPOLATION STEP IN X-DIRECTION */

L280:
	idy = 0;
	i__2 = iyo;
	for (ll = iyu; ll <= i__2; ++ll) {
	    ++idy;
	    z1[idy - 1] = t[ll * t_dim1 + 1];
	    onedint_(&t[ixu + t_dim1], &t[ixu + ll * t_dim1], &idx, &xa[l], &
		    z2[idy - 1], &one, &inpx, &iexp[1], ier);
	    if (*ier == 0) {
		goto L290;
	    } else {
		goto L900;
	    }
L290:
	    ;
	}

/* 1.OR 2.INTERPOLATION STEP IN Y-DIRECTION */

L300:
	onedint_(z1, z2, &idy, &ya[l], &za[l], &one, &inpy, &iexp[2], ier);
	if (*ier == 0) {
	    goto L400;
	} else {
	    goto L900;
	}

/* RETURN BY NORMAL PROCEEDING */
/* -------------------------------- */
L400:
	;
    }
    *ier = 0;
    return 0;

/* ERROR RETURN */
/* ------------- */
L900:
    *ier = -1;
    return 0;
} /* twodint_ */

