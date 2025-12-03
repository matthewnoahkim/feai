/* calcfeasibledirection_gd.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int calcfeasibledirection_gd__(integer *ndesi, integer *
	nodedesi, doublereal *dgdxglob, integer *nactive, integer *nobject, 
	integer *nk, doublereal *gradproj, char *objectset, ftnlen 
	objectset_len)
{
    /* System generated locals */
    integer dgdxglob_dim2, dgdxglob_offset, i__1;
    doublereal d__1;

    /* Builtin functions */
    double sqrt(doublereal);

    /* Local variables */
    integer i__;
    doublereal dd, xi;
    integer node;


/*     calculates the projected gradient */





    /* Parameter adjustments */
    --nodedesi;
    dgdxglob_dim2 = *nk;
    dgdxglob_offset = 1 + 2 * (1 + dgdxglob_dim2);
    dgdxglob -= dgdxglob_offset;
    gradproj -= 4;
    objectset -= 486;

    /* Function Body */
    xi = .98f;

/*     copy sensitivities of objective function to field gradproj(2,*) */

    i__1 = *ndesi;
    for (i__ = 1; i__ <= i__1; ++i__) {
	node = nodedesi[i__];
	gradproj[node * 3 + 2] = dgdxglob[(node + dgdxglob_dim2 << 1) + 2];
    }

/*     Assembly of feasible direction */

    i__1 = *ndesi;
    for (i__ = 1; i__ <= i__1; ++i__) {
	node = nodedesi[i__];
	if (*nobject > 1) {
	    gradproj[node * 3 + 3] = gradproj[node * 3 + 2] - xi * gradproj[
		    node * 3 + 1];
	} else {
	    gradproj[node * 3 + 3] = gradproj[node * 3 + 2];
	}
    }

/*     Normalization of feasible direction */

    if (*nobject > 1) {
	dd = 0.;
	i__1 = *ndesi;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    node = nodedesi[i__];
/* Computing 2nd power */
	    d__1 = gradproj[node * 3 + 3];
	    dd += d__1 * d__1;
	}
	if (dd <= 0.) {
	    dd = 1.;
	}
	dd = sqrt(dd);
	i__1 = *ndesi;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    node = nodedesi[i__];
	    gradproj[node * 3 + 3] /= dd;
	}
    }
/* ! */
/* !     calculation of coefficients alpha1 and alpha2 */
/* ! */
/*      cosphi=0 */
/*      do i=1,ndesi */
/*         node=nodedesi(i) */
/*         cosphi=cosphi+gradproj(1,node)*gradproj(2,node) */
/*      enddo */
/*      lambda1=1-cosphi */
/*      lambda2=1+cosphi */
/*      if(lambda1.lt.1.0e-10) then */
/*         lambda1=0.d0 */
/*      endif */
/*      if(lambda2.lt.1.0e-10) then */
/*         lambda2=0.d0 */
/*      endif */
/*      primaleig=dsqrt(lambda1) */
/*      dualeig=dsqrt(lambda2) */
/*      cosalpha1=primaleig/sqrt(2.0) */
/*      cosalpha2=dualeig/sqrt(2.0) */
/* ! */
/*      write(5,*) '' */
/*      write(5,*) '' */
/*      write(5,*) '  ####################################### */
/*     &#########################' */
/*      write(5,*) '  S I N G U L A R   V A L U E */
/*     &D E C O M P O S I T I O N' */
/*      write(5,*) '' */
/*      write(5,'(3x,a18,e14.7)') 'PRIMAL EIGENVALUE: ', primaleig */
/*      write(5,'(3x,a18,e14.7)') 'DUAL EIGENVALUE:   ', dualeig */
/*      write(5,'(3x,a18,e14.7)') 'COS ALPHA1:        ', cosalpha1 */
/*      write(5,'(3x,a18,e14.7)') 'COS ALPHA2:        ', cosalpha2 */
/*      write(5,*) '' */
/*      write(5,*) '  ####################################### */
/*     &#########################' */

    return 0;
} /* calcfeasibledirection_gd__ */

