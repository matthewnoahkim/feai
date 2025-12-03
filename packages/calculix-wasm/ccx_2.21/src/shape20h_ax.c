/* shape20h_ax.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int shape20h_ax__(doublereal *xi, doublereal *et, doublereal 
	*ze, doublereal *xl, doublereal *xsj, doublereal *shp, integer *iflag)
{
    integer j, k;
    doublereal dd, xs[9]	/* was [3][3] */, dd1, dd2, dd3, omg, omh, 
	    opg, oph, omr, opr, xsi[9]	/* was [3][3] */, shpe[80]	/* 
	    was [4][20] */, omgopg, omhoph, omropr, omgmopg, omhmoph, tmgmhmr,
	     tmgmhpr, tmgphmr, tpgmhmr, tmgphpr, tpgmhpr, tpgphmr, tpgphpr, 
	    omrmopr;


/*     shape functions and derivatives for a 20-node quadratic */
/*     isoparametric brick element. -1<=xi,et,ze<=1 */
/*     special case: axisymmetric elements */

/*     iflag=1: calculate only the value of the shape functions */
/*     iflag=2: calculate the value of the shape functions and */
/*              the Jacobian determinant */
/*     iflag=3: calculate the value of the shape functions, the */
/*              value of their derivatives w.r.t. the global */
/*              coordinates and the Jacobian determinant */







/*     shape functions and their glocal derivatives */

    /* Parameter adjustments */
    shp -= 5;
    xl -= 4;

    /* Function Body */
    omg = 1. - *xi;
    omh = 1. - *et;
    omr = 1. - *ze;
    opg = *xi + 1.;
    oph = *et + 1.;
    opr = *ze + 1.;
    tpgphpr = opg + oph + *ze;
    tmgphpr = omg + oph + *ze;
    tmgmhpr = omg + omh + *ze;
    tpgmhpr = opg + omh + *ze;
    tpgphmr = opg + oph - *ze;
    tmgphmr = omg + oph - *ze;
    tmgmhmr = omg + omh - *ze;
    tpgmhmr = opg + omh - *ze;
    omgopg = omg * opg / 4.;
    omhoph = omh * oph / 4.;
    omropr = omr * opr / 4.;
    omgmopg = (omg - opg) / 4.;
    omhmoph = (omh - oph) / 4.;
    omrmopr = (omr - opr) / 4.;

/*     shape functions */

    shp[8] = -omg * omh * omr * tpgphpr / 8.;
    shp[12] = -opg * omh * omr * tmgphpr / 8.;
    shp[16] = -opg * oph * omr * tmgmhpr / 8.;
    shp[20] = -omg * oph * omr * tpgmhpr / 8.;
    shp[24] = -omg * omh * opr * tpgphmr / 8.;
    shp[28] = -opg * omh * opr * tmgphmr / 8.;
    shp[32] = -opg * oph * opr * tmgmhmr / 8.;
    shp[36] = -omg * oph * opr * tpgmhmr / 8.;
    shp[40] = omgopg * omh * omr;
    shp[44] = omhoph * opg * omr;
    shp[48] = omgopg * oph * omr;
    shp[52] = omhoph * omg * omr;
    shp[56] = omgopg * omh * opr;
    shp[60] = omhoph * opg * opr;
    shp[64] = omgopg * oph * opr;
    shp[68] = omhoph * omg * opr;
    shp[72] = omropr * omg * omh;
    shp[76] = omropr * opg * omh;
    shp[80] = omropr * opg * oph;
    shp[84] = omropr * omg * oph;

    if (*iflag == 1) {
	return 0;
    }

/*     local derivatives of the shape functions: xi-derivative */

    shpe[0] = omh * omr * (tpgphpr - omg) / 8.;
    shpe[4] = (opg - tmgphpr) * omh * omr / 8.;
    shpe[8] = (opg - tmgmhpr) * oph * omr / 8.;
    shpe[12] = oph * omr * (tpgmhpr - omg) / 8.;
    shpe[16] = omh * opr * (tpgphmr - omg) / 8.;
    shpe[20] = (opg - tmgphmr) * omh * opr / 8.;
    shpe[24] = (opg - tmgmhmr) * oph * opr / 8.;
    shpe[28] = oph * opr * (tpgmhmr - omg) / 8.;
    shpe[32] = omgmopg * omh * omr;
    shpe[36] = omhoph * omr;
    shpe[40] = omgmopg * oph * omr;
    shpe[44] = -omhoph * omr;
    shpe[48] = omgmopg * omh * opr;
    shpe[52] = omhoph * opr;
    shpe[56] = omgmopg * oph * opr;
    shpe[60] = -omhoph * opr;
    shpe[64] = -omropr * omh;
    shpe[68] = omropr * omh;
    shpe[72] = omropr * oph;
    shpe[76] = -omropr * oph;

/*     local derivatives of the shape functions: eta-derivative */

    shpe[1] = omg * omr * (tpgphpr - omh) / 8.;
    shpe[5] = opg * omr * (tmgphpr - omh) / 8.;
    shpe[9] = opg * (oph - tmgmhpr) * omr / 8.;
    shpe[13] = omg * (oph - tpgmhpr) * omr / 8.;
    shpe[17] = omg * opr * (tpgphmr - omh) / 8.;
    shpe[21] = opg * opr * (tmgphmr - omh) / 8.;
    shpe[25] = opg * (oph - tmgmhmr) * opr / 8.;
    shpe[29] = omg * (oph - tpgmhmr) * opr / 8.;
    shpe[33] = -omgopg * omr;
    shpe[37] = omhmoph * opg * omr;
    shpe[41] = omgopg * omr;
    shpe[45] = omhmoph * omg * omr;
    shpe[49] = -omgopg * opr;
    shpe[53] = omhmoph * opg * opr;
    shpe[57] = omgopg * opr;
    shpe[61] = omhmoph * omg * opr;
    shpe[65] = -omropr * omg;
    shpe[69] = -omropr * opg;
    shpe[73] = omropr * opg;
    shpe[77] = omropr * omg;

/*     local derivatives of the shape functions: zeta-derivative */

    shpe[2] = omg * omh * (tpgphpr - omr) / 8.;
    shpe[6] = opg * omh * (tmgphpr - omr) / 8.;
    shpe[10] = opg * oph * (tmgmhpr - omr) / 8.;
    shpe[14] = omg * oph * (tpgmhpr - omr) / 8.;
    shpe[18] = omg * omh * (opr - tpgphmr) / 8.;
    shpe[22] = opg * omh * (opr - tmgphmr) / 8.;
    shpe[26] = opg * oph * (opr - tmgmhmr) / 8.;
    shpe[30] = omg * oph * (opr - tpgmhmr) / 8.;
    shpe[34] = -omgopg * omh;
    shpe[38] = -omhoph * opg;
    shpe[42] = -omgopg * oph;
    shpe[46] = -omhoph * omg;
    shpe[50] = omgopg * omh;
    shpe[54] = omhoph * opg;
    shpe[58] = omgopg * oph;
    shpe[62] = omhoph * omg;
    shpe[66] = omrmopr * omg * omh;
    shpe[70] = omrmopr * opg * omh;
    shpe[74] = omrmopr * opg * oph;
    shpe[78] = omrmopr * omg * oph;

/*     computation of the local derivative of the global coordinates */
/*     (xs) */

/*      do i=1,3 */
/*        do j=1,3 */
/*          xs(i,j)=0.d0 */
/*          do k=1,20 */
/*            xs(i,j)=xs(i,j)+xl(i,k)*shpe(j,k) */
/*          enddo */
/*        enddo */
/*      enddo */
    for (j = 1; j <= 3; ++j) {
	xs[j * 3 - 3] = xl[4] * (shpe[j - 1] + shpe[j + 15]) + xl[7] * (shpe[
		j + 3] + shpe[j + 19]) + xl[10] * (shpe[j + 7] + shpe[j + 23])
		 + xl[13] * (shpe[j + 11] + shpe[j + 27]) + xl[28] * (shpe[j 
		+ 31] + shpe[j + 47]) + xl[31] * (shpe[j + 35] + shpe[j + 51])
		 + xl[34] * (shpe[j + 39] + shpe[j + 55]) + xl[37] * (shpe[j 
		+ 43] + shpe[j + 59]) + xl[52] * shpe[j + 63] + xl[55] * shpe[
		j + 67] + xl[58] * shpe[j + 71] + xl[61] * shpe[j + 75];
	xs[j * 3 - 2] = xl[5] * (shpe[j - 1] + shpe[j + 15] + shpe[j + 63]) + 
		xl[8] * (shpe[j + 3] + shpe[j + 19] + shpe[j + 67]) + xl[11] *
		 (shpe[j + 7] + shpe[j + 23] + shpe[j + 71]) + xl[14] * (shpe[
		j + 11] + shpe[j + 27] + shpe[j + 75]) + xl[29] * (shpe[j + 
		31] + shpe[j + 47]) + xl[32] * (shpe[j + 35] + shpe[j + 51]) 
		+ xl[35] * (shpe[j + 39] + shpe[j + 55]) + xl[38] * (shpe[j + 
		43] + shpe[j + 59]);
	xs[j * 3 - 1] = xl[6] * (shpe[j - 1] - shpe[j + 15]) + xl[9] * (shpe[
		j + 3] - shpe[j + 19]) + xl[12] * (shpe[j + 7] - shpe[j + 23])
		 + xl[15] * (shpe[j + 11] - shpe[j + 27]) + xl[30] * (shpe[j 
		+ 31] - shpe[j + 47]) + xl[33] * (shpe[j + 35] - shpe[j + 51])
		 + xl[36] * (shpe[j + 39] - shpe[j + 55]) + xl[39] * (shpe[j 
		+ 43] - shpe[j + 59]);
    }

/*     computation of the jacobian determinant */

    dd1 = xs[4] * xs[8] - xs[7] * xs[5];
    dd2 = xs[7] * xs[2] - xs[1] * xs[8];
    dd3 = xs[1] * xs[5] - xs[4] * xs[2];
    *xsj = xs[0] * dd1 + xs[3] * dd2 + xs[6] * dd3;
/*      xsj=xs(1,1)*(xs(2,2)*xs(3,3)-xs(2,3)*xs(3,2)) */
/*     &   -xs(1,2)*(xs(2,1)*xs(3,3)-xs(2,3)*xs(3,1)) */
/*     &   +xs(1,3)*(xs(2,1)*xs(3,2)-xs(2,2)*xs(3,1)) */

    if (*iflag == 2) {
	return 0;
    }

    dd = 1. / *xsj;

/*     computation of the global derivative of the local coordinates */
/*     (xsi) (inversion of xs) */

    xsi[0] = dd1 * dd;
    xsi[3] = (xs[6] * xs[5] - xs[3] * xs[8]) * dd;
    xsi[6] = (xs[3] * xs[7] - xs[4] * xs[6]) * dd;
    xsi[1] = dd2 * dd;
    xsi[4] = (xs[0] * xs[8] - xs[2] * xs[6]) * dd;
    xsi[7] = (xs[6] * xs[1] - xs[0] * xs[7]) * dd;
    xsi[2] = dd3 * dd;
    xsi[5] = (xs[3] * xs[2] - xs[0] * xs[5]) * dd;
    xsi[8] = (xs[0] * xs[4] - xs[1] * xs[3]) * dd;
/*      xsi(1,1)=(xs(2,2)*xs(3,3)-xs(3,2)*xs(2,3))*dd */
/*      xsi(1,2)=(xs(1,3)*xs(3,2)-xs(1,2)*xs(3,3))*dd */
/*      xsi(1,3)=(xs(1,2)*xs(2,3)-xs(2,2)*xs(1,3))*dd */
/*      xsi(2,1)=(xs(2,3)*xs(3,1)-xs(2,1)*xs(3,3))*dd */
/*      xsi(2,2)=(xs(1,1)*xs(3,3)-xs(3,1)*xs(1,3))*dd */
/*      xsi(2,3)=(xs(1,3)*xs(2,1)-xs(1,1)*xs(2,3))*dd */
/*      xsi(3,1)=(xs(2,1)*xs(3,2)-xs(3,1)*xs(2,2))*dd */
/*      xsi(3,2)=(xs(1,2)*xs(3,1)-xs(1,1)*xs(3,2))*dd */
/*      xsi(3,3)=(xs(1,1)*xs(2,2)-xs(2,1)*xs(1,2))*dd */

/*     computation of the global derivatives of the shape functions */

    for (k = 1; k <= 20; ++k) {
	for (j = 1; j <= 3; ++j) {
	    shp[j + (k << 2)] = shpe[(k << 2) - 4] * xsi[j * 3 - 3] + shpe[(k 
		    << 2) - 3] * xsi[j * 3 - 2] + shpe[(k << 2) - 2] * xsi[j *
		     3 - 1];
	}
    }

    return 0;
} /* shape20h_ax__ */

