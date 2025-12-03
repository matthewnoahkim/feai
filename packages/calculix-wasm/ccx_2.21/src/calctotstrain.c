/* calctotstrain.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int calctotstrain_(doublereal *vkl, doublereal *vokl, 
	doublereal *eloc, doublereal *elineng, integer *iperturb)
{
    /* System generated locals */
    doublereal d__1, d__2, d__3;


/*     calculates the total strain from the displacement gradients */




/*     calculating the strain */

/*     attention! elineng(4),elineng(5) and elineng(6) are engineering strains! */

    /* Parameter adjustments */
    --iperturb;
    --elineng;
    --eloc;
    vokl -= 4;
    vkl -= 4;

    /* Function Body */
    elineng[1] = vkl[5];
    elineng[2] = vkl[10];
    elineng[3] = vkl[15];
    elineng[4] = vkl[9] + vkl[6];
    elineng[5] = vkl[13] + vkl[7];
    elineng[6] = vkl[14] + vkl[11];

    if (iperturb[2] == 1) {

/*     Lagrangian strain */

/* Computing 2nd power */
	d__1 = vkl[5];
/* Computing 2nd power */
	d__2 = vkl[6];
/* Computing 2nd power */
	d__3 = vkl[7];
	elineng[1] += (d__1 * d__1 + d__2 * d__2 + d__3 * d__3) / 2.;
/* Computing 2nd power */
	d__1 = vkl[9];
/* Computing 2nd power */
	d__2 = vkl[10];
/* Computing 2nd power */
	d__3 = vkl[11];
	elineng[2] += (d__1 * d__1 + d__2 * d__2 + d__3 * d__3) / 2.;
/* Computing 2nd power */
	d__1 = vkl[13];
/* Computing 2nd power */
	d__2 = vkl[14];
/* Computing 2nd power */
	d__3 = vkl[15];
	elineng[3] += (d__1 * d__1 + d__2 * d__2 + d__3 * d__3) / 2.;
	elineng[4] = elineng[4] + vkl[5] * vkl[9] + vkl[6] * vkl[10] + vkl[7] 
		* vkl[11];
	elineng[5] = elineng[5] + vkl[5] * vkl[13] + vkl[6] * vkl[14] + vkl[7]
		 * vkl[15];
	elineng[6] = elineng[6] + vkl[9] * vkl[13] + vkl[10] * vkl[14] + vkl[
		11] * vkl[15];

/*     for frequency analysis or buckling with preload the */
/*     strains are calculated with respect to the deformed */
/*     configuration */

    } else if (iperturb[1] == 1) {
	elineng[1] = elineng[1] + vokl[4] * vkl[5] + vokl[5] * vkl[6] + vokl[
		6] * vkl[7];
	elineng[2] = elineng[2] + vokl[7] * vkl[9] + vokl[8] * vkl[10] + vokl[
		9] * vkl[11];
	elineng[3] = elineng[3] + vokl[10] * vkl[13] + vokl[11] * vkl[14] + 
		vokl[12] * vkl[15];
	elineng[4] = elineng[4] + vokl[4] * vkl[9] + vokl[7] * vkl[5] + vokl[
		5] * vkl[10] + vokl[8] * vkl[6] + vokl[6] * vkl[11] + vokl[9] 
		* vkl[7];
	elineng[5] = elineng[5] + vokl[4] * vkl[13] + vokl[10] * vkl[5] + 
		vokl[5] * vkl[14] + vokl[11] * vkl[6] + vokl[6] * vkl[15] + 
		vokl[12] * vkl[7];
	elineng[6] = elineng[6] + vokl[7] * vkl[13] + vokl[10] * vkl[9] + 
		vokl[8] * vkl[14] + vokl[11] * vkl[10] + vokl[9] * vkl[15] + 
		vokl[12] * vkl[11];
    }

/*     storing the local strains */

    if (iperturb[1] != -1) {
	eloc[1] = elineng[1];
	eloc[2] = elineng[2];
	eloc[3] = elineng[3];
	eloc[4] = elineng[4] / 2.;
	eloc[5] = elineng[5] / 2.;
	eloc[6] = elineng[6] / 2.;
    } else {

/*     linear iteration within a nonlinear increment: */

/* Computing 2nd power */
	d__1 = vokl[4];
/* Computing 2nd power */
	d__2 = vokl[5];
/* Computing 2nd power */
	d__3 = vokl[6];
	eloc[1] = vokl[4] + (d__1 * d__1 + d__2 * d__2 + d__3 * d__3) / 2.;
/* Computing 2nd power */
	d__1 = vokl[7];
/* Computing 2nd power */
	d__2 = vokl[8];
/* Computing 2nd power */
	d__3 = vokl[9];
	eloc[2] = vokl[8] + (d__1 * d__1 + d__2 * d__2 + d__3 * d__3) / 2.;
/* Computing 2nd power */
	d__1 = vokl[10];
/* Computing 2nd power */
	d__2 = vokl[11];
/* Computing 2nd power */
	d__3 = vokl[12];
	eloc[3] = vokl[12] + (d__1 * d__1 + d__2 * d__2 + d__3 * d__3) / 2.;
	eloc[4] = (vokl[7] + vokl[5] + vokl[4] * vokl[7] + vokl[5] * vokl[8] 
		+ vokl[6] * vokl[9]) / 2.;
	eloc[5] = (vokl[10] + vokl[6] + vokl[4] * vokl[10] + vokl[5] * vokl[
		11] + vokl[6] * vokl[12]) / 2.;
	eloc[6] = (vokl[11] + vokl[9] + vokl[7] * vokl[10] + vokl[8] * vokl[
		11] + vokl[9] * vokl[12]) / 2.;
    }

    return 0;
} /* calctotstrain_ */

