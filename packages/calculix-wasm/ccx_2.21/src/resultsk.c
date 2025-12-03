/* resultsk.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int resultsk_(integer *nk, integer *nactdok, doublereal *v, 
	doublereal *solk, doublereal *solt, integer *ipompc, integer *nodempc,
	 doublereal *coefmpc, integer *nmpc, integer *mi)
{
    /* System generated locals */
    integer v_dim1, v_offset, i__1;

    /* Local variables */
    integer i__;


/*     calculates the turbulence correction (STEP 5) in the nodes */




/*     extracting the turbulence correction from the solution */

    /* Parameter adjustments */
    --nactdok;
    --solk;
    --solt;
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
	if (nactdok[i__] > 0) {
	    v[i__ * v_dim1 + 5] = solk[nactdok[i__]];
	    v[i__ * v_dim1 + 6] = solt[nactdok[i__]];
	} else {
	    v[i__ * v_dim1 + 5] = 0.;
	    v[i__ * v_dim1 + 6] = 0.;
	}
    }

/*     inserting the mpc information: it is assumed that the */
/*     temperature MPC's also apply to the turbulence */

/*      do i=1,nmpc */
/*         ist=ipompc(i) */
/*         node=nodempc(1,ist) */
/*         ndir=nodempc(2,ist) */
/*         if(ndir.ne.0) cycle */
/*         index=nodempc(3,ist) */
/*         fixed_dispk=0.d0 */
/*         fixed_dispt=0.d0 */
/*         if(index.ne.0) then */
/*            do */
/*               fixed_dispk=fixed_dispk-coefmpc(index)* */
/*     &              vtu(1,nodempc(1,index)) */
/*               fixed_dispt=fixed_dispt-coefmpc(index)* */
/*     &              vtu(2,nodempc(1,index)) */
/*               index=nodempc(3,index) */
/*               if(index.eq.0) exit */
/*            enddo */
/*         endif */
/*         fixed_dispk=fixed_dispk/coefmpc(ist) */
/*         vtu(1,node)=fixed_dispk */
/*         fixed_dispt=fixed_dispt/coefmpc(ist) */
/*         vtu(2,node)=fixed_dispt */
/*      enddo */

    return 0;
} /* resultsk_ */

