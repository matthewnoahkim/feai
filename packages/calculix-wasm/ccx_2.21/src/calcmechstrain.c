/* calcmechstrain.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int calcmechstrain_(doublereal *vkl, doublereal *vokl, 
	doublereal *emec, doublereal *eth, integer *iperturb)
{
    /* System generated locals */
    doublereal d__1, d__2, d__3;

    /* Local variables */
    doublereal wkl[9]	/* was [3][3] */, wokl[9]	/* was [3][3] */, 
	    elineng[6];


/*     calculates the mechanical strain from the displacement gradients */
/*     and the thermal stretches */




/*     subtracting the thermal stretch from the deformation gradients */
/*     at the end of the increment */

    /* Parameter adjustments */
    --iperturb;
    --eth;
    --emec;
    vokl -= 4;
    vkl -= 4;

    /* Function Body */
    wkl[0] = vkl[5] - eth[1];
    wkl[4] = vkl[10] - eth[2];
    wkl[8] = vkl[15] - eth[3];
    wkl[3] = vkl[9] - eth[4];
    wkl[6] = vkl[13] - eth[5];
    wkl[7] = vkl[14] - eth[6];
    wkl[1] = vkl[6] - eth[4];
    wkl[2] = vkl[7] - eth[5];
    wkl[5] = vkl[11] - eth[6];

/*     attention! elineng(4),elineng(5) and elineng(6) are engineering strains! */

    elineng[0] = wkl[0];
    elineng[1] = wkl[4];
    elineng[2] = wkl[8];
    elineng[3] = wkl[3] + wkl[1];
    elineng[4] = wkl[6] + wkl[2];
    elineng[5] = wkl[7] + wkl[5];
/*      write(*,*) 'elineng,wkl ',elineng(1),wkl(1,1) */

    if (iperturb[2] == 1) {

/*     Lagrangian strain */

/* Computing 2nd power */
	d__1 = wkl[0];
/* Computing 2nd power */
	d__2 = wkl[1];
/* Computing 2nd power */
	d__3 = wkl[2];
	elineng[0] += (d__1 * d__1 + d__2 * d__2 + d__3 * d__3) / 2.;
/* Computing 2nd power */
	d__1 = wkl[3];
/* Computing 2nd power */
	d__2 = wkl[4];
/* Computing 2nd power */
	d__3 = wkl[5];
	elineng[1] += (d__1 * d__1 + d__2 * d__2 + d__3 * d__3) / 2.;
/* Computing 2nd power */
	d__1 = wkl[6];
/* Computing 2nd power */
	d__2 = wkl[7];
/* Computing 2nd power */
	d__3 = wkl[8];
	elineng[2] += (d__1 * d__1 + d__2 * d__2 + d__3 * d__3) / 2.;
	elineng[3] = elineng[3] + wkl[0] * wkl[3] + wkl[1] * wkl[4] + wkl[2] *
		 wkl[5];
	elineng[4] = elineng[4] + wkl[0] * wkl[6] + wkl[1] * wkl[7] + wkl[2] *
		 wkl[8];
	elineng[5] = elineng[5] + wkl[3] * wkl[6] + wkl[4] * wkl[7] + wkl[5] *
		 wkl[8];

/*     for frequency analysis or buckling with preload the */
/*     strains are calculated with respect to the deformed */
/*     configuration */

    } else if (iperturb[1] == 1) {

/*     subtracting the thermal stretch from the deformation gradients */
/*     at the start of the increment */

	wokl[0] = vokl[4] - eth[1];
	wokl[4] = vokl[8] - eth[2];
	wokl[8] = vokl[12] - eth[3];
	wokl[3] = vokl[7] - eth[4];
	wokl[6] = vokl[10] - eth[5];
	wokl[7] = vokl[11] - eth[6];
	wokl[1] = vokl[5] - eth[4];
	wokl[2] = vokl[6] - eth[5];
	wokl[5] = vokl[9] - eth[6];

	elineng[0] = elineng[0] + wokl[0] * wkl[0] + wokl[1] * wkl[1] + wokl[
		2] * wkl[2];
	elineng[1] = elineng[1] + wokl[3] * wkl[3] + wokl[4] * wkl[4] + wokl[
		5] * wkl[5];
	elineng[2] = elineng[2] + wokl[6] * wkl[6] + wokl[7] * wkl[7] + wokl[
		8] * wkl[8];
	elineng[3] = elineng[3] + wokl[0] * wkl[3] + wokl[3] * wkl[0] + wokl[
		1] * wkl[4] + wokl[4] * wkl[1] + wokl[2] * wkl[5] + wokl[5] * 
		wkl[2];
	elineng[4] = elineng[4] + wokl[0] * wkl[6] + wokl[6] * wkl[0] + wokl[
		1] * wkl[7] + wokl[7] * wkl[1] + wokl[2] * wkl[8] + wokl[8] * 
		wkl[2];
	elineng[5] = elineng[5] + wokl[3] * wkl[6] + wokl[6] * wkl[3] + wokl[
		4] * wkl[7] + wokl[7] * wkl[4] + wokl[5] * wkl[8] + wokl[8] * 
		wkl[5];
    }

/*     storing the local strains */

    if (iperturb[1] != -1) {
	emec[1] = elineng[0];
	emec[2] = elineng[1];
	emec[3] = elineng[2];
	emec[4] = elineng[3] / 2.;
	emec[5] = elineng[4] / 2.;
	emec[6] = elineng[5] / 2.;
    } else {

/*        linear iteration within a nonlinear increment: */

/*        subtracting the thermal stretch from the deformation gradients */
/*        at the start of the increment */

	wokl[0] = vokl[4] - eth[1];
	wokl[4] = vokl[8] - eth[2];
	wokl[8] = vokl[12] - eth[3];
	wokl[3] = vokl[7] - eth[4];
	wokl[6] = vokl[10] - eth[5];
	wokl[7] = vokl[11] - eth[6];
	wokl[1] = vokl[5] - eth[4];
	wokl[2] = vokl[6] - eth[5];
	wokl[5] = vokl[9] - eth[6];

/* Computing 2nd power */
	d__1 = wokl[0];
/* Computing 2nd power */
	d__2 = wokl[1];
/* Computing 2nd power */
	d__3 = wokl[2];
	emec[1] = wokl[0] + (d__1 * d__1 + d__2 * d__2 + d__3 * d__3) / 2.;
/* Computing 2nd power */
	d__1 = wokl[3];
/* Computing 2nd power */
	d__2 = wokl[4];
/* Computing 2nd power */
	d__3 = wokl[5];
	emec[2] = wokl[4] + (d__1 * d__1 + d__2 * d__2 + d__3 * d__3) / 2.;
/* Computing 2nd power */
	d__1 = wokl[6];
/* Computing 2nd power */
	d__2 = wokl[7];
/* Computing 2nd power */
	d__3 = wokl[8];
	emec[3] = wokl[8] + (d__1 * d__1 + d__2 * d__2 + d__3 * d__3) / 2.;
	emec[4] = (wokl[3] + wokl[1] + wokl[0] * wokl[3] + wokl[1] * wokl[4] 
		+ wokl[2] * wokl[5]) / 2.;
	emec[5] = (wokl[6] + wokl[2] + wokl[0] * wokl[6] + wokl[1] * wokl[7] 
		+ wokl[2] * wokl[8]) / 2.;
	emec[6] = (wokl[7] + wokl[5] + wokl[3] * wokl[6] + wokl[4] * wokl[7] 
		+ wokl[5] * wokl[8]) / 2.;
    }
/*      write(*,*) 'emec ',emec(1) */

    return 0;
} /* calcmechstrain_ */

