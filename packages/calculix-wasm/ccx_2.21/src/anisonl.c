/* anisonl.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int anisonl_(doublereal *w, doublereal *vo, doublereal *elas,
	 doublereal *s, integer *ii1, integer *jj1, doublereal *weight)
{

/*     This routine replaces the following lines in e_c3d.f for */
/*     an anisotropic material */

/*                      do i1=1,3 */
/*                        iii1=ii1+i1-1 */
/*                        do j1=1,3 */
/*                          jjj1=jj1+j1-1 */
/*                          do k1=1,3 */
/*                            do l1=1,3 */
/*                              s(iii1,jjj1)=s(iii1,jjj1) */
/*     &                              +anisox(i1,k1,j1,l1)*w(k1,l1) */
/*                              do m1=1,3 */
/*                                s(iii1,jjj1)=s(iii1,jjj1) */
/*     &                              +anisox(i1,k1,m1,l1)*w(k1,l1) */
/*     &                                 *vo(j1,m1) */
/*     &                              +anisox(m1,k1,j1,l1)*w(k1,l1) */
/*     &                                 *vo(i1,m1) */
/*                                do n1=1,3 */
/*                                  s(iii1,jjj1)=s(iii1,jjj1) */
/*     &                                  +anisox(m1,k1,n1,l1) */
/*     &                                  *w(k1,l1)*vo(i1,m1)*vo(j1,n1) */
/*                                enddo */
/*                              enddo */
/*                            enddo */
/*                          enddo */
/*                        enddo */
/*                      enddo */






    /* Parameter adjustments */
    s -= 61;
    --elas;
    vo -= 4;
    w -= 4;

    /* Function Body */
    s[*ii1 + *jj1 * 60] += ((elas[1] + elas[1] * vo[4] + elas[7] * vo[7] + 
	    elas[11] * vo[10] + (elas[1] + elas[1] * vo[4] + elas[7] * vo[7] 
	    + elas[11] * vo[10]) * vo[4] + (elas[7] + elas[7] * vo[4] + elas[
	    10] * vo[7] + elas[14] * vo[10]) * vo[7] + (elas[11] + elas[11] * 
	    vo[4] + elas[14] * vo[7] + elas[15] * vo[10]) * vo[10]) * w[4] + (
	    elas[7] + elas[7] * vo[4] + elas[2] * vo[7] + elas[16] * vo[10] + 
	    (elas[7] + elas[7] * vo[4] + elas[2] * vo[7] + elas[16] * vo[10]) 
	    * vo[4] + (elas[10] + elas[10] * vo[4] + elas[8] * vo[7] + elas[
	    19] * vo[10]) * vo[7] + (elas[14] + elas[14] * vo[4] + elas[12] * 
	    vo[7] + elas[20] * vo[10]) * vo[10]) * w[7] + (elas[11] + elas[11]
	     * vo[4] + elas[16] * vo[7] + elas[4] * vo[10] + (elas[11] + elas[
	    11] * vo[4] + elas[16] * vo[7] + elas[4] * vo[10]) * vo[4] + (
	    elas[14] + elas[14] * vo[4] + elas[19] * vo[7] + elas[9] * vo[10])
	     * vo[7] + (elas[15] + elas[15] * vo[4] + elas[20] * vo[7] + elas[
	    13] * vo[10]) * vo[10]) * w[10] + (elas[7] + elas[7] * vo[4] + 
	    elas[10] * vo[7] + elas[14] * vo[10] + (elas[7] + elas[7] * vo[4] 
	    + elas[10] * vo[7] + elas[14] * vo[10]) * vo[4] + (elas[2] + elas[
	    2] * vo[4] + elas[8] * vo[7] + elas[12] * vo[10]) * vo[7] + (elas[
	    16] + elas[16] * vo[4] + elas[19] * vo[7] + elas[20] * vo[10]) * 
	    vo[10]) * w[5] + (elas[10] + elas[10] * vo[4] + elas[8] * vo[7] + 
	    elas[19] * vo[10] + (elas[10] + elas[10] * vo[4] + elas[8] * vo[7]
	     + elas[19] * vo[10]) * vo[4] + (elas[8] + elas[8] * vo[4] + elas[
	    3] * vo[7] + elas[17] * vo[10]) * vo[7] + (elas[19] + elas[19] * 
	    vo[4] + elas[17] * vo[7] + elas[21] * vo[10]) * vo[10]) * w[8] + (
	    elas[14] + elas[14] * vo[4] + elas[19] * vo[7] + elas[9] * vo[10] 
	    + (elas[14] + elas[14] * vo[4] + elas[19] * vo[7] + elas[9] * vo[
	    10]) * vo[4] + (elas[12] + elas[12] * vo[4] + elas[17] * vo[7] + 
	    elas[5] * vo[10]) * vo[7] + (elas[20] + elas[20] * vo[4] + elas[
	    21] * vo[7] + elas[18] * vo[10]) * vo[10]) * w[11] + (elas[11] + 
	    elas[11] * vo[4] + elas[14] * vo[7] + elas[15] * vo[10] + (elas[
	    11] + elas[11] * vo[4] + elas[14] * vo[7] + elas[15] * vo[10]) * 
	    vo[4] + (elas[16] + elas[16] * vo[4] + elas[19] * vo[7] + elas[20]
	     * vo[10]) * vo[7] + (elas[4] + elas[4] * vo[4] + elas[9] * vo[7] 
	    + elas[13] * vo[10]) * vo[10]) * w[6] + (elas[14] + elas[14] * vo[
	    4] + elas[12] * vo[7] + elas[20] * vo[10] + (elas[14] + elas[14] *
	     vo[4] + elas[12] * vo[7] + elas[20] * vo[10]) * vo[4] + (elas[19]
	     + elas[19] * vo[4] + elas[17] * vo[7] + elas[21] * vo[10]) * vo[
	    7] + (elas[9] + elas[9] * vo[4] + elas[5] * vo[7] + elas[18] * vo[
	    10]) * vo[10]) * w[9] + (elas[15] + elas[15] * vo[4] + elas[20] * 
	    vo[7] + elas[13] * vo[10] + (elas[15] + elas[15] * vo[4] + elas[
	    20] * vo[7] + elas[13] * vo[10]) * vo[4] + (elas[20] + elas[20] * 
	    vo[4] + elas[21] * vo[7] + elas[18] * vo[10]) * vo[7] + (elas[13] 
	    + elas[13] * vo[4] + elas[18] * vo[7] + elas[6] * vo[10]) * vo[10]
	    ) * w[12]) * *weight;
    s[*ii1 + (*jj1 + 1) * 60] += ((elas[7] + elas[1] * vo[5] + elas[7] * vo[8]
	     + elas[11] * vo[11] + (elas[7] + elas[1] * vo[5] + elas[7] * vo[
	    8] + elas[11] * vo[11]) * vo[4] + (elas[10] + elas[7] * vo[5] + 
	    elas[10] * vo[8] + elas[14] * vo[11]) * vo[7] + (elas[14] + elas[
	    11] * vo[5] + elas[14] * vo[8] + elas[15] * vo[11]) * vo[10]) * w[
	    4] + (elas[2] + elas[7] * vo[5] + elas[2] * vo[8] + elas[16] * vo[
	    11] + (elas[2] + elas[7] * vo[5] + elas[2] * vo[8] + elas[16] * 
	    vo[11]) * vo[4] + (elas[8] + elas[10] * vo[5] + elas[8] * vo[8] + 
	    elas[19] * vo[11]) * vo[7] + (elas[12] + elas[14] * vo[5] + elas[
	    12] * vo[8] + elas[20] * vo[11]) * vo[10]) * w[7] + (elas[16] + 
	    elas[11] * vo[5] + elas[16] * vo[8] + elas[4] * vo[11] + (elas[16]
	     + elas[11] * vo[5] + elas[16] * vo[8] + elas[4] * vo[11]) * vo[4]
	     + (elas[19] + elas[14] * vo[5] + elas[19] * vo[8] + elas[9] * vo[
	    11]) * vo[7] + (elas[20] + elas[15] * vo[5] + elas[20] * vo[8] + 
	    elas[13] * vo[11]) * vo[10]) * w[10] + (elas[10] + elas[7] * vo[5]
	     + elas[10] * vo[8] + elas[14] * vo[11] + (elas[10] + elas[7] * 
	    vo[5] + elas[10] * vo[8] + elas[14] * vo[11]) * vo[4] + (elas[8] 
	    + elas[2] * vo[5] + elas[8] * vo[8] + elas[12] * vo[11]) * vo[7] 
	    + (elas[19] + elas[16] * vo[5] + elas[19] * vo[8] + elas[20] * vo[
	    11]) * vo[10]) * w[5] + (elas[8] + elas[10] * vo[5] + elas[8] * 
	    vo[8] + elas[19] * vo[11] + (elas[8] + elas[10] * vo[5] + elas[8] 
	    * vo[8] + elas[19] * vo[11]) * vo[4] + (elas[3] + elas[8] * vo[5] 
	    + elas[3] * vo[8] + elas[17] * vo[11]) * vo[7] + (elas[17] + elas[
	    19] * vo[5] + elas[17] * vo[8] + elas[21] * vo[11]) * vo[10]) * w[
	    8] + (elas[19] + elas[14] * vo[5] + elas[19] * vo[8] + elas[9] * 
	    vo[11] + (elas[19] + elas[14] * vo[5] + elas[19] * vo[8] + elas[9]
	     * vo[11]) * vo[4] + (elas[17] + elas[12] * vo[5] + elas[17] * vo[
	    8] + elas[5] * vo[11]) * vo[7] + (elas[21] + elas[20] * vo[5] + 
	    elas[21] * vo[8] + elas[18] * vo[11]) * vo[10]) * w[11] + (elas[
	    14] + elas[11] * vo[5] + elas[14] * vo[8] + elas[15] * vo[11] + (
	    elas[14] + elas[11] * vo[5] + elas[14] * vo[8] + elas[15] * vo[11]
	    ) * vo[4] + (elas[19] + elas[16] * vo[5] + elas[19] * vo[8] + 
	    elas[20] * vo[11]) * vo[7] + (elas[9] + elas[4] * vo[5] + elas[9] 
	    * vo[8] + elas[13] * vo[11]) * vo[10]) * w[6] + (elas[12] + elas[
	    14] * vo[5] + elas[12] * vo[8] + elas[20] * vo[11] + (elas[12] + 
	    elas[14] * vo[5] + elas[12] * vo[8] + elas[20] * vo[11]) * vo[4] 
	    + (elas[17] + elas[19] * vo[5] + elas[17] * vo[8] + elas[21] * vo[
	    11]) * vo[7] + (elas[5] + elas[9] * vo[5] + elas[5] * vo[8] + 
	    elas[18] * vo[11]) * vo[10]) * w[9] + (elas[20] + elas[15] * vo[5]
	     + elas[20] * vo[8] + elas[13] * vo[11] + (elas[20] + elas[15] * 
	    vo[5] + elas[20] * vo[8] + elas[13] * vo[11]) * vo[4] + (elas[21] 
	    + elas[20] * vo[5] + elas[21] * vo[8] + elas[18] * vo[11]) * vo[7]
	     + (elas[18] + elas[13] * vo[5] + elas[18] * vo[8] + elas[6] * vo[
	    11]) * vo[10]) * w[12]) * *weight;
    s[*ii1 + (*jj1 + 2) * 60] += ((elas[11] + elas[1] * vo[6] + elas[7] * vo[
	    9] + elas[11] * vo[12] + (elas[11] + elas[1] * vo[6] + elas[7] * 
	    vo[9] + elas[11] * vo[12]) * vo[4] + (elas[14] + elas[7] * vo[6] 
	    + elas[10] * vo[9] + elas[14] * vo[12]) * vo[7] + (elas[15] + 
	    elas[11] * vo[6] + elas[14] * vo[9] + elas[15] * vo[12]) * vo[10])
	     * w[4] + (elas[16] + elas[7] * vo[6] + elas[2] * vo[9] + elas[16]
	     * vo[12] + (elas[16] + elas[7] * vo[6] + elas[2] * vo[9] + elas[
	    16] * vo[12]) * vo[4] + (elas[19] + elas[10] * vo[6] + elas[8] * 
	    vo[9] + elas[19] * vo[12]) * vo[7] + (elas[20] + elas[14] * vo[6] 
	    + elas[12] * vo[9] + elas[20] * vo[12]) * vo[10]) * w[7] + (elas[
	    4] + elas[11] * vo[6] + elas[16] * vo[9] + elas[4] * vo[12] + (
	    elas[4] + elas[11] * vo[6] + elas[16] * vo[9] + elas[4] * vo[12]) 
	    * vo[4] + (elas[9] + elas[14] * vo[6] + elas[19] * vo[9] + elas[9]
	     * vo[12]) * vo[7] + (elas[13] + elas[15] * vo[6] + elas[20] * vo[
	    9] + elas[13] * vo[12]) * vo[10]) * w[10] + (elas[14] + elas[7] * 
	    vo[6] + elas[10] * vo[9] + elas[14] * vo[12] + (elas[14] + elas[7]
	     * vo[6] + elas[10] * vo[9] + elas[14] * vo[12]) * vo[4] + (elas[
	    12] + elas[2] * vo[6] + elas[8] * vo[9] + elas[12] * vo[12]) * vo[
	    7] + (elas[20] + elas[16] * vo[6] + elas[19] * vo[9] + elas[20] * 
	    vo[12]) * vo[10]) * w[5] + (elas[19] + elas[10] * vo[6] + elas[8] 
	    * vo[9] + elas[19] * vo[12] + (elas[19] + elas[10] * vo[6] + elas[
	    8] * vo[9] + elas[19] * vo[12]) * vo[4] + (elas[17] + elas[8] * 
	    vo[6] + elas[3] * vo[9] + elas[17] * vo[12]) * vo[7] + (elas[21] 
	    + elas[19] * vo[6] + elas[17] * vo[9] + elas[21] * vo[12]) * vo[
	    10]) * w[8] + (elas[9] + elas[14] * vo[6] + elas[19] * vo[9] + 
	    elas[9] * vo[12] + (elas[9] + elas[14] * vo[6] + elas[19] * vo[9] 
	    + elas[9] * vo[12]) * vo[4] + (elas[5] + elas[12] * vo[6] + elas[
	    17] * vo[9] + elas[5] * vo[12]) * vo[7] + (elas[18] + elas[20] * 
	    vo[6] + elas[21] * vo[9] + elas[18] * vo[12]) * vo[10]) * w[11] + 
	    (elas[15] + elas[11] * vo[6] + elas[14] * vo[9] + elas[15] * vo[
	    12] + (elas[15] + elas[11] * vo[6] + elas[14] * vo[9] + elas[15] *
	     vo[12]) * vo[4] + (elas[20] + elas[16] * vo[6] + elas[19] * vo[9]
	     + elas[20] * vo[12]) * vo[7] + (elas[13] + elas[4] * vo[6] + 
	    elas[9] * vo[9] + elas[13] * vo[12]) * vo[10]) * w[6] + (elas[20] 
	    + elas[14] * vo[6] + elas[12] * vo[9] + elas[20] * vo[12] + (elas[
	    20] + elas[14] * vo[6] + elas[12] * vo[9] + elas[20] * vo[12]) * 
	    vo[4] + (elas[21] + elas[19] * vo[6] + elas[17] * vo[9] + elas[21]
	     * vo[12]) * vo[7] + (elas[18] + elas[9] * vo[6] + elas[5] * vo[9]
	     + elas[18] * vo[12]) * vo[10]) * w[9] + (elas[13] + elas[15] * 
	    vo[6] + elas[20] * vo[9] + elas[13] * vo[12] + (elas[13] + elas[
	    15] * vo[6] + elas[20] * vo[9] + elas[13] * vo[12]) * vo[4] + (
	    elas[18] + elas[20] * vo[6] + elas[21] * vo[9] + elas[18] * vo[12]
	    ) * vo[7] + (elas[6] + elas[13] * vo[6] + elas[18] * vo[9] + elas[
	    6] * vo[12]) * vo[10]) * w[12]) * *weight;
    s[*ii1 + 1 + *jj1 * 60] += ((elas[7] + elas[7] * vo[4] + elas[10] * vo[7] 
	    + elas[14] * vo[10] + (elas[1] + elas[1] * vo[4] + elas[7] * vo[7]
	     + elas[11] * vo[10]) * vo[5] + (elas[7] + elas[7] * vo[4] + elas[
	    10] * vo[7] + elas[14] * vo[10]) * vo[8] + (elas[11] + elas[11] * 
	    vo[4] + elas[14] * vo[7] + elas[15] * vo[10]) * vo[11]) * w[4] + (
	    elas[10] + elas[10] * vo[4] + elas[8] * vo[7] + elas[19] * vo[10] 
	    + (elas[7] + elas[7] * vo[4] + elas[2] * vo[7] + elas[16] * vo[10]
	    ) * vo[5] + (elas[10] + elas[10] * vo[4] + elas[8] * vo[7] + elas[
	    19] * vo[10]) * vo[8] + (elas[14] + elas[14] * vo[4] + elas[12] * 
	    vo[7] + elas[20] * vo[10]) * vo[11]) * w[7] + (elas[14] + elas[14]
	     * vo[4] + elas[19] * vo[7] + elas[9] * vo[10] + (elas[11] + elas[
	    11] * vo[4] + elas[16] * vo[7] + elas[4] * vo[10]) * vo[5] + (
	    elas[14] + elas[14] * vo[4] + elas[19] * vo[7] + elas[9] * vo[10])
	     * vo[8] + (elas[15] + elas[15] * vo[4] + elas[20] * vo[7] + elas[
	    13] * vo[10]) * vo[11]) * w[10] + (elas[2] + elas[2] * vo[4] + 
	    elas[8] * vo[7] + elas[12] * vo[10] + (elas[7] + elas[7] * vo[4] 
	    + elas[10] * vo[7] + elas[14] * vo[10]) * vo[5] + (elas[2] + elas[
	    2] * vo[4] + elas[8] * vo[7] + elas[12] * vo[10]) * vo[8] + (elas[
	    16] + elas[16] * vo[4] + elas[19] * vo[7] + elas[20] * vo[10]) * 
	    vo[11]) * w[5] + (elas[8] + elas[8] * vo[4] + elas[3] * vo[7] + 
	    elas[17] * vo[10] + (elas[10] + elas[10] * vo[4] + elas[8] * vo[7]
	     + elas[19] * vo[10]) * vo[5] + (elas[8] + elas[8] * vo[4] + elas[
	    3] * vo[7] + elas[17] * vo[10]) * vo[8] + (elas[19] + elas[19] * 
	    vo[4] + elas[17] * vo[7] + elas[21] * vo[10]) * vo[11]) * w[8] + (
	    elas[12] + elas[12] * vo[4] + elas[17] * vo[7] + elas[5] * vo[10] 
	    + (elas[14] + elas[14] * vo[4] + elas[19] * vo[7] + elas[9] * vo[
	    10]) * vo[5] + (elas[12] + elas[12] * vo[4] + elas[17] * vo[7] + 
	    elas[5] * vo[10]) * vo[8] + (elas[20] + elas[20] * vo[4] + elas[
	    21] * vo[7] + elas[18] * vo[10]) * vo[11]) * w[11] + (elas[16] + 
	    elas[16] * vo[4] + elas[19] * vo[7] + elas[20] * vo[10] + (elas[
	    11] + elas[11] * vo[4] + elas[14] * vo[7] + elas[15] * vo[10]) * 
	    vo[5] + (elas[16] + elas[16] * vo[4] + elas[19] * vo[7] + elas[20]
	     * vo[10]) * vo[8] + (elas[4] + elas[4] * vo[4] + elas[9] * vo[7] 
	    + elas[13] * vo[10]) * vo[11]) * w[6] + (elas[19] + elas[19] * vo[
	    4] + elas[17] * vo[7] + elas[21] * vo[10] + (elas[14] + elas[14] *
	     vo[4] + elas[12] * vo[7] + elas[20] * vo[10]) * vo[5] + (elas[19]
	     + elas[19] * vo[4] + elas[17] * vo[7] + elas[21] * vo[10]) * vo[
	    8] + (elas[9] + elas[9] * vo[4] + elas[5] * vo[7] + elas[18] * vo[
	    10]) * vo[11]) * w[9] + (elas[20] + elas[20] * vo[4] + elas[21] * 
	    vo[7] + elas[18] * vo[10] + (elas[15] + elas[15] * vo[4] + elas[
	    20] * vo[7] + elas[13] * vo[10]) * vo[5] + (elas[20] + elas[20] * 
	    vo[4] + elas[21] * vo[7] + elas[18] * vo[10]) * vo[8] + (elas[13] 
	    + elas[13] * vo[4] + elas[18] * vo[7] + elas[6] * vo[10]) * vo[11]
	    ) * w[12]) * *weight;
    s[*ii1 + 1 + (*jj1 + 1) * 60] += ((elas[10] + elas[7] * vo[5] + elas[10] *
	     vo[8] + elas[14] * vo[11] + (elas[7] + elas[1] * vo[5] + elas[7] 
	    * vo[8] + elas[11] * vo[11]) * vo[5] + (elas[10] + elas[7] * vo[5]
	     + elas[10] * vo[8] + elas[14] * vo[11]) * vo[8] + (elas[14] + 
	    elas[11] * vo[5] + elas[14] * vo[8] + elas[15] * vo[11]) * vo[11])
	     * w[4] + (elas[8] + elas[10] * vo[5] + elas[8] * vo[8] + elas[19]
	     * vo[11] + (elas[2] + elas[7] * vo[5] + elas[2] * vo[8] + elas[
	    16] * vo[11]) * vo[5] + (elas[8] + elas[10] * vo[5] + elas[8] * 
	    vo[8] + elas[19] * vo[11]) * vo[8] + (elas[12] + elas[14] * vo[5] 
	    + elas[12] * vo[8] + elas[20] * vo[11]) * vo[11]) * w[7] + (elas[
	    19] + elas[14] * vo[5] + elas[19] * vo[8] + elas[9] * vo[11] + (
	    elas[16] + elas[11] * vo[5] + elas[16] * vo[8] + elas[4] * vo[11])
	     * vo[5] + (elas[19] + elas[14] * vo[5] + elas[19] * vo[8] + elas[
	    9] * vo[11]) * vo[8] + (elas[20] + elas[15] * vo[5] + elas[20] * 
	    vo[8] + elas[13] * vo[11]) * vo[11]) * w[10] + (elas[8] + elas[2] 
	    * vo[5] + elas[8] * vo[8] + elas[12] * vo[11] + (elas[10] + elas[
	    7] * vo[5] + elas[10] * vo[8] + elas[14] * vo[11]) * vo[5] + (
	    elas[8] + elas[2] * vo[5] + elas[8] * vo[8] + elas[12] * vo[11]) *
	     vo[8] + (elas[19] + elas[16] * vo[5] + elas[19] * vo[8] + elas[
	    20] * vo[11]) * vo[11]) * w[5] + (elas[3] + elas[8] * vo[5] + 
	    elas[3] * vo[8] + elas[17] * vo[11] + (elas[8] + elas[10] * vo[5] 
	    + elas[8] * vo[8] + elas[19] * vo[11]) * vo[5] + (elas[3] + elas[
	    8] * vo[5] + elas[3] * vo[8] + elas[17] * vo[11]) * vo[8] + (elas[
	    17] + elas[19] * vo[5] + elas[17] * vo[8] + elas[21] * vo[11]) * 
	    vo[11]) * w[8] + (elas[17] + elas[12] * vo[5] + elas[17] * vo[8] 
	    + elas[5] * vo[11] + (elas[19] + elas[14] * vo[5] + elas[19] * vo[
	    8] + elas[9] * vo[11]) * vo[5] + (elas[17] + elas[12] * vo[5] + 
	    elas[17] * vo[8] + elas[5] * vo[11]) * vo[8] + (elas[21] + elas[
	    20] * vo[5] + elas[21] * vo[8] + elas[18] * vo[11]) * vo[11]) * w[
	    11] + (elas[19] + elas[16] * vo[5] + elas[19] * vo[8] + elas[20] *
	     vo[11] + (elas[14] + elas[11] * vo[5] + elas[14] * vo[8] + elas[
	    15] * vo[11]) * vo[5] + (elas[19] + elas[16] * vo[5] + elas[19] * 
	    vo[8] + elas[20] * vo[11]) * vo[8] + (elas[9] + elas[4] * vo[5] + 
	    elas[9] * vo[8] + elas[13] * vo[11]) * vo[11]) * w[6] + (elas[17] 
	    + elas[19] * vo[5] + elas[17] * vo[8] + elas[21] * vo[11] + (elas[
	    12] + elas[14] * vo[5] + elas[12] * vo[8] + elas[20] * vo[11]) * 
	    vo[5] + (elas[17] + elas[19] * vo[5] + elas[17] * vo[8] + elas[21]
	     * vo[11]) * vo[8] + (elas[5] + elas[9] * vo[5] + elas[5] * vo[8] 
	    + elas[18] * vo[11]) * vo[11]) * w[9] + (elas[21] + elas[20] * vo[
	    5] + elas[21] * vo[8] + elas[18] * vo[11] + (elas[20] + elas[15] *
	     vo[5] + elas[20] * vo[8] + elas[13] * vo[11]) * vo[5] + (elas[21]
	     + elas[20] * vo[5] + elas[21] * vo[8] + elas[18] * vo[11]) * vo[
	    8] + (elas[18] + elas[13] * vo[5] + elas[18] * vo[8] + elas[6] * 
	    vo[11]) * vo[11]) * w[12]) * *weight;
    s[*ii1 + 1 + (*jj1 + 2) * 60] += ((elas[14] + elas[7] * vo[6] + elas[10] *
	     vo[9] + elas[14] * vo[12] + (elas[11] + elas[1] * vo[6] + elas[7]
	     * vo[9] + elas[11] * vo[12]) * vo[5] + (elas[14] + elas[7] * vo[
	    6] + elas[10] * vo[9] + elas[14] * vo[12]) * vo[8] + (elas[15] + 
	    elas[11] * vo[6] + elas[14] * vo[9] + elas[15] * vo[12]) * vo[11])
	     * w[4] + (elas[19] + elas[10] * vo[6] + elas[8] * vo[9] + elas[
	    19] * vo[12] + (elas[16] + elas[7] * vo[6] + elas[2] * vo[9] + 
	    elas[16] * vo[12]) * vo[5] + (elas[19] + elas[10] * vo[6] + elas[
	    8] * vo[9] + elas[19] * vo[12]) * vo[8] + (elas[20] + elas[14] * 
	    vo[6] + elas[12] * vo[9] + elas[20] * vo[12]) * vo[11]) * w[7] + (
	    elas[9] + elas[14] * vo[6] + elas[19] * vo[9] + elas[9] * vo[12] 
	    + (elas[4] + elas[11] * vo[6] + elas[16] * vo[9] + elas[4] * vo[
	    12]) * vo[5] + (elas[9] + elas[14] * vo[6] + elas[19] * vo[9] + 
	    elas[9] * vo[12]) * vo[8] + (elas[13] + elas[15] * vo[6] + elas[
	    20] * vo[9] + elas[13] * vo[12]) * vo[11]) * w[10] + (elas[12] + 
	    elas[2] * vo[6] + elas[8] * vo[9] + elas[12] * vo[12] + (elas[14] 
	    + elas[7] * vo[6] + elas[10] * vo[9] + elas[14] * vo[12]) * vo[5] 
	    + (elas[12] + elas[2] * vo[6] + elas[8] * vo[9] + elas[12] * vo[
	    12]) * vo[8] + (elas[20] + elas[16] * vo[6] + elas[19] * vo[9] + 
	    elas[20] * vo[12]) * vo[11]) * w[5] + (elas[17] + elas[8] * vo[6] 
	    + elas[3] * vo[9] + elas[17] * vo[12] + (elas[19] + elas[10] * vo[
	    6] + elas[8] * vo[9] + elas[19] * vo[12]) * vo[5] + (elas[17] + 
	    elas[8] * vo[6] + elas[3] * vo[9] + elas[17] * vo[12]) * vo[8] + (
	    elas[21] + elas[19] * vo[6] + elas[17] * vo[9] + elas[21] * vo[12]
	    ) * vo[11]) * w[8] + (elas[5] + elas[12] * vo[6] + elas[17] * vo[
	    9] + elas[5] * vo[12] + (elas[9] + elas[14] * vo[6] + elas[19] * 
	    vo[9] + elas[9] * vo[12]) * vo[5] + (elas[5] + elas[12] * vo[6] + 
	    elas[17] * vo[9] + elas[5] * vo[12]) * vo[8] + (elas[18] + elas[
	    20] * vo[6] + elas[21] * vo[9] + elas[18] * vo[12]) * vo[11]) * w[
	    11] + (elas[20] + elas[16] * vo[6] + elas[19] * vo[9] + elas[20] *
	     vo[12] + (elas[15] + elas[11] * vo[6] + elas[14] * vo[9] + elas[
	    15] * vo[12]) * vo[5] + (elas[20] + elas[16] * vo[6] + elas[19] * 
	    vo[9] + elas[20] * vo[12]) * vo[8] + (elas[13] + elas[4] * vo[6] 
	    + elas[9] * vo[9] + elas[13] * vo[12]) * vo[11]) * w[6] + (elas[
	    21] + elas[19] * vo[6] + elas[17] * vo[9] + elas[21] * vo[12] + (
	    elas[20] + elas[14] * vo[6] + elas[12] * vo[9] + elas[20] * vo[12]
	    ) * vo[5] + (elas[21] + elas[19] * vo[6] + elas[17] * vo[9] + 
	    elas[21] * vo[12]) * vo[8] + (elas[18] + elas[9] * vo[6] + elas[5]
	     * vo[9] + elas[18] * vo[12]) * vo[11]) * w[9] + (elas[18] + elas[
	    20] * vo[6] + elas[21] * vo[9] + elas[18] * vo[12] + (elas[13] + 
	    elas[15] * vo[6] + elas[20] * vo[9] + elas[13] * vo[12]) * vo[5] 
	    + (elas[18] + elas[20] * vo[6] + elas[21] * vo[9] + elas[18] * vo[
	    12]) * vo[8] + (elas[6] + elas[13] * vo[6] + elas[18] * vo[9] + 
	    elas[6] * vo[12]) * vo[11]) * w[12]) * *weight;
    s[*ii1 + 2 + *jj1 * 60] += ((elas[11] + elas[11] * vo[4] + elas[14] * vo[
	    7] + elas[15] * vo[10] + (elas[1] + elas[1] * vo[4] + elas[7] * 
	    vo[7] + elas[11] * vo[10]) * vo[6] + (elas[7] + elas[7] * vo[4] + 
	    elas[10] * vo[7] + elas[14] * vo[10]) * vo[9] + (elas[11] + elas[
	    11] * vo[4] + elas[14] * vo[7] + elas[15] * vo[10]) * vo[12]) * w[
	    4] + (elas[14] + elas[14] * vo[4] + elas[12] * vo[7] + elas[20] * 
	    vo[10] + (elas[7] + elas[7] * vo[4] + elas[2] * vo[7] + elas[16] *
	     vo[10]) * vo[6] + (elas[10] + elas[10] * vo[4] + elas[8] * vo[7] 
	    + elas[19] * vo[10]) * vo[9] + (elas[14] + elas[14] * vo[4] + 
	    elas[12] * vo[7] + elas[20] * vo[10]) * vo[12]) * w[7] + (elas[15]
	     + elas[15] * vo[4] + elas[20] * vo[7] + elas[13] * vo[10] + (
	    elas[11] + elas[11] * vo[4] + elas[16] * vo[7] + elas[4] * vo[10])
	     * vo[6] + (elas[14] + elas[14] * vo[4] + elas[19] * vo[7] + elas[
	    9] * vo[10]) * vo[9] + (elas[15] + elas[15] * vo[4] + elas[20] * 
	    vo[7] + elas[13] * vo[10]) * vo[12]) * w[10] + (elas[16] + elas[
	    16] * vo[4] + elas[19] * vo[7] + elas[20] * vo[10] + (elas[7] + 
	    elas[7] * vo[4] + elas[10] * vo[7] + elas[14] * vo[10]) * vo[6] + 
	    (elas[2] + elas[2] * vo[4] + elas[8] * vo[7] + elas[12] * vo[10]) 
	    * vo[9] + (elas[16] + elas[16] * vo[4] + elas[19] * vo[7] + elas[
	    20] * vo[10]) * vo[12]) * w[5] + (elas[19] + elas[19] * vo[4] + 
	    elas[17] * vo[7] + elas[21] * vo[10] + (elas[10] + elas[10] * vo[
	    4] + elas[8] * vo[7] + elas[19] * vo[10]) * vo[6] + (elas[8] + 
	    elas[8] * vo[4] + elas[3] * vo[7] + elas[17] * vo[10]) * vo[9] + (
	    elas[19] + elas[19] * vo[4] + elas[17] * vo[7] + elas[21] * vo[10]
	    ) * vo[12]) * w[8] + (elas[20] + elas[20] * vo[4] + elas[21] * vo[
	    7] + elas[18] * vo[10] + (elas[14] + elas[14] * vo[4] + elas[19] *
	     vo[7] + elas[9] * vo[10]) * vo[6] + (elas[12] + elas[12] * vo[4] 
	    + elas[17] * vo[7] + elas[5] * vo[10]) * vo[9] + (elas[20] + elas[
	    20] * vo[4] + elas[21] * vo[7] + elas[18] * vo[10]) * vo[12]) * w[
	    11] + (elas[4] + elas[4] * vo[4] + elas[9] * vo[7] + elas[13] * 
	    vo[10] + (elas[11] + elas[11] * vo[4] + elas[14] * vo[7] + elas[
	    15] * vo[10]) * vo[6] + (elas[16] + elas[16] * vo[4] + elas[19] * 
	    vo[7] + elas[20] * vo[10]) * vo[9] + (elas[4] + elas[4] * vo[4] + 
	    elas[9] * vo[7] + elas[13] * vo[10]) * vo[12]) * w[6] + (elas[9] 
	    + elas[9] * vo[4] + elas[5] * vo[7] + elas[18] * vo[10] + (elas[
	    14] + elas[14] * vo[4] + elas[12] * vo[7] + elas[20] * vo[10]) * 
	    vo[6] + (elas[19] + elas[19] * vo[4] + elas[17] * vo[7] + elas[21]
	     * vo[10]) * vo[9] + (elas[9] + elas[9] * vo[4] + elas[5] * vo[7] 
	    + elas[18] * vo[10]) * vo[12]) * w[9] + (elas[13] + elas[13] * vo[
	    4] + elas[18] * vo[7] + elas[6] * vo[10] + (elas[15] + elas[15] * 
	    vo[4] + elas[20] * vo[7] + elas[13] * vo[10]) * vo[6] + (elas[20] 
	    + elas[20] * vo[4] + elas[21] * vo[7] + elas[18] * vo[10]) * vo[9]
	     + (elas[13] + elas[13] * vo[4] + elas[18] * vo[7] + elas[6] * vo[
	    10]) * vo[12]) * w[12]) * *weight;
    s[*ii1 + 2 + (*jj1 + 1) * 60] += ((elas[14] + elas[11] * vo[5] + elas[14] 
	    * vo[8] + elas[15] * vo[11] + (elas[7] + elas[1] * vo[5] + elas[7]
	     * vo[8] + elas[11] * vo[11]) * vo[6] + (elas[10] + elas[7] * vo[
	    5] + elas[10] * vo[8] + elas[14] * vo[11]) * vo[9] + (elas[14] + 
	    elas[11] * vo[5] + elas[14] * vo[8] + elas[15] * vo[11]) * vo[12])
	     * w[4] + (elas[12] + elas[14] * vo[5] + elas[12] * vo[8] + elas[
	    20] * vo[11] + (elas[2] + elas[7] * vo[5] + elas[2] * vo[8] + 
	    elas[16] * vo[11]) * vo[6] + (elas[8] + elas[10] * vo[5] + elas[8]
	     * vo[8] + elas[19] * vo[11]) * vo[9] + (elas[12] + elas[14] * vo[
	    5] + elas[12] * vo[8] + elas[20] * vo[11]) * vo[12]) * w[7] + (
	    elas[20] + elas[15] * vo[5] + elas[20] * vo[8] + elas[13] * vo[11]
	     + (elas[16] + elas[11] * vo[5] + elas[16] * vo[8] + elas[4] * vo[
	    11]) * vo[6] + (elas[19] + elas[14] * vo[5] + elas[19] * vo[8] + 
	    elas[9] * vo[11]) * vo[9] + (elas[20] + elas[15] * vo[5] + elas[
	    20] * vo[8] + elas[13] * vo[11]) * vo[12]) * w[10] + (elas[19] + 
	    elas[16] * vo[5] + elas[19] * vo[8] + elas[20] * vo[11] + (elas[
	    10] + elas[7] * vo[5] + elas[10] * vo[8] + elas[14] * vo[11]) * 
	    vo[6] + (elas[8] + elas[2] * vo[5] + elas[8] * vo[8] + elas[12] * 
	    vo[11]) * vo[9] + (elas[19] + elas[16] * vo[5] + elas[19] * vo[8] 
	    + elas[20] * vo[11]) * vo[12]) * w[5] + (elas[17] + elas[19] * vo[
	    5] + elas[17] * vo[8] + elas[21] * vo[11] + (elas[8] + elas[10] * 
	    vo[5] + elas[8] * vo[8] + elas[19] * vo[11]) * vo[6] + (elas[3] + 
	    elas[8] * vo[5] + elas[3] * vo[8] + elas[17] * vo[11]) * vo[9] + (
	    elas[17] + elas[19] * vo[5] + elas[17] * vo[8] + elas[21] * vo[11]
	    ) * vo[12]) * w[8] + (elas[21] + elas[20] * vo[5] + elas[21] * vo[
	    8] + elas[18] * vo[11] + (elas[19] + elas[14] * vo[5] + elas[19] *
	     vo[8] + elas[9] * vo[11]) * vo[6] + (elas[17] + elas[12] * vo[5] 
	    + elas[17] * vo[8] + elas[5] * vo[11]) * vo[9] + (elas[21] + elas[
	    20] * vo[5] + elas[21] * vo[8] + elas[18] * vo[11]) * vo[12]) * w[
	    11] + (elas[9] + elas[4] * vo[5] + elas[9] * vo[8] + elas[13] * 
	    vo[11] + (elas[14] + elas[11] * vo[5] + elas[14] * vo[8] + elas[
	    15] * vo[11]) * vo[6] + (elas[19] + elas[16] * vo[5] + elas[19] * 
	    vo[8] + elas[20] * vo[11]) * vo[9] + (elas[9] + elas[4] * vo[5] + 
	    elas[9] * vo[8] + elas[13] * vo[11]) * vo[12]) * w[6] + (elas[5] 
	    + elas[9] * vo[5] + elas[5] * vo[8] + elas[18] * vo[11] + (elas[
	    12] + elas[14] * vo[5] + elas[12] * vo[8] + elas[20] * vo[11]) * 
	    vo[6] + (elas[17] + elas[19] * vo[5] + elas[17] * vo[8] + elas[21]
	     * vo[11]) * vo[9] + (elas[5] + elas[9] * vo[5] + elas[5] * vo[8] 
	    + elas[18] * vo[11]) * vo[12]) * w[9] + (elas[18] + elas[13] * vo[
	    5] + elas[18] * vo[8] + elas[6] * vo[11] + (elas[20] + elas[15] * 
	    vo[5] + elas[20] * vo[8] + elas[13] * vo[11]) * vo[6] + (elas[21] 
	    + elas[20] * vo[5] + elas[21] * vo[8] + elas[18] * vo[11]) * vo[9]
	     + (elas[18] + elas[13] * vo[5] + elas[18] * vo[8] + elas[6] * vo[
	    11]) * vo[12]) * w[12]) * *weight;
    s[*ii1 + 2 + (*jj1 + 2) * 60] += ((elas[15] + elas[11] * vo[6] + elas[14] 
	    * vo[9] + elas[15] * vo[12] + (elas[11] + elas[1] * vo[6] + elas[
	    7] * vo[9] + elas[11] * vo[12]) * vo[6] + (elas[14] + elas[7] * 
	    vo[6] + elas[10] * vo[9] + elas[14] * vo[12]) * vo[9] + (elas[15] 
	    + elas[11] * vo[6] + elas[14] * vo[9] + elas[15] * vo[12]) * vo[
	    12]) * w[4] + (elas[20] + elas[14] * vo[6] + elas[12] * vo[9] + 
	    elas[20] * vo[12] + (elas[16] + elas[7] * vo[6] + elas[2] * vo[9] 
	    + elas[16] * vo[12]) * vo[6] + (elas[19] + elas[10] * vo[6] + 
	    elas[8] * vo[9] + elas[19] * vo[12]) * vo[9] + (elas[20] + elas[
	    14] * vo[6] + elas[12] * vo[9] + elas[20] * vo[12]) * vo[12]) * w[
	    7] + (elas[13] + elas[15] * vo[6] + elas[20] * vo[9] + elas[13] * 
	    vo[12] + (elas[4] + elas[11] * vo[6] + elas[16] * vo[9] + elas[4] 
	    * vo[12]) * vo[6] + (elas[9] + elas[14] * vo[6] + elas[19] * vo[9]
	     + elas[9] * vo[12]) * vo[9] + (elas[13] + elas[15] * vo[6] + 
	    elas[20] * vo[9] + elas[13] * vo[12]) * vo[12]) * w[10] + (elas[
	    20] + elas[16] * vo[6] + elas[19] * vo[9] + elas[20] * vo[12] + (
	    elas[14] + elas[7] * vo[6] + elas[10] * vo[9] + elas[14] * vo[12])
	     * vo[6] + (elas[12] + elas[2] * vo[6] + elas[8] * vo[9] + elas[
	    12] * vo[12]) * vo[9] + (elas[20] + elas[16] * vo[6] + elas[19] * 
	    vo[9] + elas[20] * vo[12]) * vo[12]) * w[5] + (elas[21] + elas[19]
	     * vo[6] + elas[17] * vo[9] + elas[21] * vo[12] + (elas[19] + 
	    elas[10] * vo[6] + elas[8] * vo[9] + elas[19] * vo[12]) * vo[6] + 
	    (elas[17] + elas[8] * vo[6] + elas[3] * vo[9] + elas[17] * vo[12])
	     * vo[9] + (elas[21] + elas[19] * vo[6] + elas[17] * vo[9] + elas[
	    21] * vo[12]) * vo[12]) * w[8] + (elas[18] + elas[20] * vo[6] + 
	    elas[21] * vo[9] + elas[18] * vo[12] + (elas[9] + elas[14] * vo[6]
	     + elas[19] * vo[9] + elas[9] * vo[12]) * vo[6] + (elas[5] + elas[
	    12] * vo[6] + elas[17] * vo[9] + elas[5] * vo[12]) * vo[9] + (
	    elas[18] + elas[20] * vo[6] + elas[21] * vo[9] + elas[18] * vo[12]
	    ) * vo[12]) * w[11] + (elas[13] + elas[4] * vo[6] + elas[9] * vo[
	    9] + elas[13] * vo[12] + (elas[15] + elas[11] * vo[6] + elas[14] *
	     vo[9] + elas[15] * vo[12]) * vo[6] + (elas[20] + elas[16] * vo[6]
	     + elas[19] * vo[9] + elas[20] * vo[12]) * vo[9] + (elas[13] + 
	    elas[4] * vo[6] + elas[9] * vo[9] + elas[13] * vo[12]) * vo[12]) *
	     w[6] + (elas[18] + elas[9] * vo[6] + elas[5] * vo[9] + elas[18] *
	     vo[12] + (elas[20] + elas[14] * vo[6] + elas[12] * vo[9] + elas[
	    20] * vo[12]) * vo[6] + (elas[21] + elas[19] * vo[6] + elas[17] * 
	    vo[9] + elas[21] * vo[12]) * vo[9] + (elas[18] + elas[9] * vo[6] 
	    + elas[5] * vo[9] + elas[18] * vo[12]) * vo[12]) * w[9] + (elas[6]
	     + elas[13] * vo[6] + elas[18] * vo[9] + elas[6] * vo[12] + (elas[
	    13] + elas[15] * vo[6] + elas[20] * vo[9] + elas[13] * vo[12]) * 
	    vo[6] + (elas[18] + elas[20] * vo[6] + elas[21] * vo[9] + elas[18]
	     * vo[12]) * vo[9] + (elas[6] + elas[13] * vo[6] + elas[18] * vo[
	    9] + elas[6] * vo[12]) * vo[12]) * w[12]) * *weight;

    return 0;
} /* anisonl_ */

