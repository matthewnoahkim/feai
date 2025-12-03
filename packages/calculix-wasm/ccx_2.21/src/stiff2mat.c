/* stiff2mat.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int stiff2mat_(doublereal *elas, doublereal *ckl, doublereal 
	*vj, integer *cauchy)
{
    /* Initialized data */

    static integer kk[84] = { 1,1,1,1,1,1,2,2,2,2,2,2,1,1,3,3,2,2,3,3,3,3,3,3,
	    1,1,1,2,2,2,1,2,3,3,1,2,1,2,1,2,1,1,1,3,2,2,1,3,3,3,1,3,1,2,1,3,1,
	    3,1,3,1,1,2,3,2,2,2,3,3,3,2,3,1,2,2,3,1,3,2,3,2,3,2,3 };

    doublereal e[21];
    integer i__, k, l, m, n, nt;


/*     elas(21):   stiffness constants in the spatial description, i.e. */
/*                 the derivative of the Cauchy stress or the Kirchhoff */
/*                 stress with respect to the Eulerian strain */
/*     ckl(3,3):   inverse deformation gradient */
/*     vj:         Jacobian determinant */
/*     cauchy:     if 1: elas is written in terms of Cauchy stress */
/*                 if 0: elas is written in terms of Kirchhoff stress */

/*     OUTPUT: */

/*     elas(21):   stiffness constants in the material description,i.e. */
/*                 the derivative of the second Piola-Kirchhoff stress (PK2) */
/*                 with respect to the Lagrangian strain */





    /* Parameter adjustments */
    ckl -= 4;
    --elas;

    /* Function Body */

    nt = 0;
    for (i__ = 1; i__ <= 21; ++i__) {
	k = kk[nt];
	l = kk[nt + 1];
	m = kk[nt + 2];
	n = kk[nt + 3];
	nt += 4;
	e[i__ - 1] = elas[1] * ckl[k + 3] * ckl[l + 3] * ckl[m + 3] * ckl[n + 
		3] + elas[2] * (ckl[k + 6] * ckl[l + 6] * ckl[m + 3] * ckl[n 
		+ 3] + ckl[k + 3] * ckl[l + 3] * ckl[m + 6] * ckl[n + 6]) + 
		elas[3] * ckl[k + 6] * ckl[l + 6] * ckl[m + 6] * ckl[n + 6] + 
		elas[4] * (ckl[k + 9] * ckl[l + 9] * ckl[m + 3] * ckl[n + 3] 
		+ ckl[k + 3] * ckl[l + 3] * ckl[m + 9] * ckl[n + 9]) + elas[5]
		 * (ckl[k + 9] * ckl[l + 9] * ckl[m + 6] * ckl[n + 6] + ckl[k 
		+ 6] * ckl[l + 6] * ckl[m + 9] * ckl[n + 9]) + elas[6] * ckl[
		k + 9] * ckl[l + 9] * ckl[m + 9] * ckl[n + 9] + elas[7] * (
		ckl[k + 6] * ckl[l + 3] * ckl[m + 3] * ckl[n + 3] + ckl[k + 3]
		 * ckl[l + 6] * ckl[m + 3] * ckl[n + 3] + ckl[k + 3] * ckl[l 
		+ 3] * ckl[m + 6] * ckl[n + 3] + ckl[k + 3] * ckl[l + 3] * 
		ckl[m + 3] * ckl[n + 6]) + elas[8] * (ckl[k + 6] * ckl[l + 6] 
		* ckl[m + 6] * ckl[n + 3] + ckl[k + 6] * ckl[l + 6] * ckl[m + 
		3] * ckl[n + 6] + ckl[k + 6] * ckl[l + 3] * ckl[m + 6] * ckl[
		n + 6] + ckl[k + 3] * ckl[l + 6] * ckl[m + 6] * ckl[n + 6]) + 
		elas[9] * (ckl[k + 9] * ckl[l + 9] * ckl[m + 6] * ckl[n + 3] 
		+ ckl[k + 9] * ckl[l + 9] * ckl[m + 3] * ckl[n + 6] + ckl[k + 
		6] * ckl[l + 3] * ckl[m + 9] * ckl[n + 9] + ckl[k + 3] * ckl[
		l + 6] * ckl[m + 9] * ckl[n + 9]) + elas[10] * (ckl[k + 6] * 
		ckl[l + 3] * ckl[m + 6] * ckl[n + 3] + ckl[k + 3] * ckl[l + 6]
		 * ckl[m + 6] * ckl[n + 3] + ckl[k + 6] * ckl[l + 3] * ckl[m 
		+ 3] * ckl[n + 6] + ckl[k + 3] * ckl[l + 6] * ckl[m + 3] * 
		ckl[n + 6]) + elas[11] * (ckl[k + 9] * ckl[l + 3] * ckl[m + 3]
		 * ckl[n + 3] + ckl[k + 3] * ckl[l + 9] * ckl[m + 3] * ckl[n 
		+ 3] + ckl[k + 3] * ckl[l + 3] * ckl[m + 9] * ckl[n + 3] + 
		ckl[k + 3] * ckl[l + 3] * ckl[m + 3] * ckl[n + 9]) + elas[12] 
		* (ckl[k + 6] * ckl[l + 6] * ckl[m + 9] * ckl[n + 3] + ckl[k 
		+ 9] * ckl[l + 3] * ckl[m + 6] * ckl[n + 6] + ckl[k + 3] * 
		ckl[l + 9] * ckl[m + 6] * ckl[n + 6] + ckl[k + 6] * ckl[l + 6]
		 * ckl[m + 9] * ckl[n + 3]) + elas[13] * (ckl[k + 9] * ckl[l 
		+ 9] * ckl[m + 9] * ckl[n + 3] + ckl[k + 9] * ckl[l + 9] * 
		ckl[m + 3] * ckl[n + 9] + ckl[k + 9] * ckl[l + 3] * ckl[m + 9]
		 * ckl[n + 9] + ckl[k + 3] * ckl[l + 9] * ckl[m + 9] * ckl[n 
		+ 9]) + elas[14] * (ckl[k + 9] * ckl[l + 3] * ckl[m + 6] * 
		ckl[n + 3] + ckl[k + 3] * ckl[l + 9] * ckl[m + 6] * ckl[n + 3]
		 + ckl[k + 6] * ckl[l + 3] * ckl[m + 9] * ckl[n + 3] + ckl[k 
		+ 3] * ckl[l + 6] * ckl[m + 9] * ckl[n + 3] + ckl[k + 9] * 
		ckl[l + 3] * ckl[m + 3] * ckl[n + 6] + ckl[k + 3] * ckl[l + 9]
		 * ckl[m + 3] * ckl[n + 6] + ckl[k + 6] * ckl[l + 3] * ckl[m 
		+ 3] * ckl[n + 9] + ckl[k + 3] * ckl[l + 6] * ckl[m + 3] * 
		ckl[n + 9]) + elas[15] * (ckl[k + 9] * ckl[l + 3] * ckl[m + 9]
		 * ckl[n + 3] + ckl[k + 3] * ckl[l + 9] * ckl[m + 9] * ckl[n 
		+ 3] + ckl[k + 9] * ckl[l + 3] * ckl[m + 3] * ckl[n + 9] + 
		ckl[k + 3] * ckl[l + 9] * ckl[m + 3] * ckl[n + 9]) + elas[16] 
		* (ckl[k + 9] * ckl[l + 6] * ckl[m + 3] * ckl[n + 3] + ckl[k 
		+ 6] * ckl[l + 9] * ckl[m + 3] * ckl[n + 3] + ckl[k + 3] * 
		ckl[l + 3] * ckl[m + 9] * ckl[n + 6] + ckl[k + 3] * ckl[l + 3]
		 * ckl[m + 6] * ckl[n + 9]) + elas[17] * (ckl[k + 9] * ckl[l 
		+ 6] * ckl[m + 6] * ckl[n + 6] + ckl[k + 6] * ckl[l + 9] * 
		ckl[m + 6] * ckl[n + 6] + ckl[k + 6] * ckl[l + 6] * ckl[m + 9]
		 * ckl[n + 6] + ckl[k + 6] * ckl[l + 6] * ckl[m + 6] * ckl[n 
		+ 9]) + elas[18] * (ckl[k + 9] * ckl[l + 9] * ckl[m + 9] * 
		ckl[n + 6] + ckl[k + 9] * ckl[l + 9] * ckl[m + 6] * ckl[n + 9]
		 + ckl[k + 9] * ckl[l + 6] * ckl[m + 9] * ckl[n + 9] + ckl[k 
		+ 6] * ckl[l + 9] * ckl[m + 9] * ckl[n + 9]) + elas[19] * (
		ckl[k + 9] * ckl[l + 6] * ckl[m + 6] * ckl[n + 3] + ckl[k + 6]
		 * ckl[l + 9] * ckl[m + 6] * ckl[n + 3] + ckl[k + 9] * ckl[l 
		+ 6] * ckl[m + 3] * ckl[n + 6] + ckl[k + 6] * ckl[l + 9] * 
		ckl[m + 3] * ckl[n + 6] + ckl[k + 6] * ckl[l + 3] * ckl[m + 9]
		 * ckl[n + 6] + ckl[k + 3] * ckl[l + 6] * ckl[m + 9] * ckl[n 
		+ 6] + ckl[k + 6] * ckl[l + 3] * ckl[m + 6] * ckl[n + 9] + 
		ckl[k + 3] * ckl[l + 6] * ckl[m + 6] * ckl[n + 9]) + elas[20] 
		* (ckl[k + 9] * ckl[l + 6] * ckl[m + 9] * ckl[n + 3] + ckl[k 
		+ 6] * ckl[l + 9] * ckl[m + 9] * ckl[n + 3] + ckl[k + 9] * 
		ckl[l + 3] * ckl[m + 9] * ckl[n + 6] + ckl[k + 3] * ckl[l + 9]
		 * ckl[m + 9] * ckl[n + 6] + ckl[k + 9] * ckl[l + 6] * ckl[m 
		+ 3] * ckl[n + 9] + ckl[k + 6] * ckl[l + 9] * ckl[m + 3] * 
		ckl[n + 9] + ckl[k + 9] * ckl[l + 3] * ckl[m + 6] * ckl[n + 9]
		 + ckl[k + 3] * ckl[l + 9] * ckl[m + 6] * ckl[n + 9]) + elas[
		21] * (ckl[k + 9] * ckl[l + 6] * ckl[m + 9] * ckl[n + 6] + 
		ckl[k + 6] * ckl[l + 9] * ckl[m + 9] * ckl[n + 6] + ckl[k + 9]
		 * ckl[l + 6] * ckl[m + 6] * ckl[n + 9] + ckl[k + 6] * ckl[l 
		+ 9] * ckl[m + 6] * ckl[n + 9]);
    }

    if (*cauchy == 1) {
	for (i__ = 1; i__ <= 21; ++i__) {
	    elas[i__] = e[i__ - 1] * *vj;
	}
    } else {
	for (i__ = 1; i__ <= 21; ++i__) {
	    elas[i__] = e[i__ - 1];
	}
    }

    return 0;
} /* stiff2mat_ */

