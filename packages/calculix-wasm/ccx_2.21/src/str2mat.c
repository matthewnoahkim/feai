/* str2mat.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int str2mat_(doublereal *str, doublereal *ckl, doublereal *
	vj, integer *cauchy)
{
    integer i__;
    doublereal s[6];
    integer m1, m2;


/*     converts the stress in spatial coordinates into material coordinates */
/*     or the strain in material coordinates into spatial coordinates. */

/*     INPUT: */

/*     str(6):     Cauchy stress, Kirchhoff stress or Lagrange strain */
/*                 component order: 11,22,33,12,13,23 */
/*     ckl(3,3):   the inverse deformation gradient */
/*     vj:         Jakobian determinant */
/*     cauchy:     integer variable */
/*                 if 1: str contains the Cauchy stress */
/*                 if 0: str contains the Kirchhoff stress or */
/*                           Lagrange strain */

/*     OUTPUT: */

/*     str(6):     Piola-Kirchhoff stress of the second kind (PK2) or */
/*                 Euler strain */





    /* Parameter adjustments */
    ckl -= 4;
    --str;

    /* Function Body */
    for (i__ = 1; i__ <= 6; ++i__) {
	if (i__ == 1) {
	    m1 = 1;
	    m2 = 1;
	} else if (i__ == 2) {
	    m1 = 2;
	    m2 = 2;
	} else if (i__ == 3) {
	    m1 = 3;
	    m2 = 3;
	} else if (i__ == 4) {
	    m1 = 2;
	    m2 = 1;
	} else if (i__ == 5) {
	    m1 = 3;
	    m2 = 1;
	} else {
	    m1 = 3;
	    m2 = 2;
	}

	s[i__ - 1] = str[1] * ckl[m1 + 3] * ckl[m2 + 3] + str[2] * ckl[m1 + 6]
		 * ckl[m2 + 6] + str[3] * ckl[m1 + 9] * ckl[m2 + 9] + str[4] *
		 (ckl[m1 + 3] * ckl[m2 + 6] + ckl[m1 + 6] * ckl[m2 + 3]) + 
		str[5] * (ckl[m1 + 3] * ckl[m2 + 9] + ckl[m1 + 9] * ckl[m2 + 
		3]) + str[6] * (ckl[m1 + 6] * ckl[m2 + 9] + ckl[m1 + 9] * ckl[
		m2 + 6]);

    }

    if (*cauchy == 1) {
	for (i__ = 1; i__ <= 6; ++i__) {
	    str[i__] = s[i__ - 1] * *vj;
	}
    } else {
	for (i__ = 1; i__ <= 6; ++i__) {
	    str[i__] = s[i__ - 1];
	}
    }

    return 0;
} /* str2mat_ */

