/* resultsv1.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int resultsv1_(integer *nk, integer *nactdoh, doublereal *v, 
	doublereal *sol, integer *ipompc, integer *nodempc, doublereal *
	coefmpc, integer *nmpc, integer *mi)
{
    /* System generated locals */
    integer v_dim1, v_offset, i__1;

    /* Local variables */
    integer i__, j;


/*     calculates the velocity correction (STEP 1) in the nodes */




/*     extracting the 1st velocity correction from the solution (STEP 1) */

    /* Parameter adjustments */
    nactdoh -= 5;
    --sol;
    --ipompc;
    nodempc -= 4;
    --coefmpc;
    --mi;
    v_dim1 = mi[2] - 0 + 1;
    v_offset = 0 + v_dim1;
    v -= v_offset;

    /* Function Body */
    i__1 = *nk;
    for (i__ = 1; i__ <= i__1; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    if (nactdoh[j + i__ * 5] > 0) {
		v[j + i__ * v_dim1] = sol[nactdoh[j + i__ * 5]];
	    } else {
		v[j + i__ * v_dim1] = 0.;
	    }
	}
/*         write(*,*) 'sollll ',i,(v(j,i),j=1,3) */
    }
/*      write(*,*) 'sol307',v(1,307),v(2,307),v(3,307) */

/*     inserting the mpc information */

/*      do i=1,nmpc */
/*         ist=ipompc(i) */
/*         node=nodempc(1,ist) */
/*         ndir=nodempc(2,ist) */
/*         index=nodempc(3,ist) */
/*         fixed_disp=0.d0 */
/*         if(index.ne.0) then */
/*            do */
/*               fixed_disp=fixed_disp-coefmpc(index)* */
/*     &              v(nodempc(2,index),nodempc(1,index)) */
/*               index=nodempc(3,index) */
/*               if(index.eq.0) exit */
/*            enddo */
/*         endif */
/*         fixed_disp=fixed_disp/coefmpc(ist) */
/*         v(ndir,node)=fixed_disp */
/*      enddo */

    return 0;
} /* resultsv1_ */

