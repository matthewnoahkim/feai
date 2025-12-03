/* isortiid.f -- translated by f2c (version 20200916).
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


/*     SLATEC: public domain */

/* deck isort */
/* Subroutine */ int isortiid_(integer *ix, integer *iy, doublereal *dy, 
	integer *n, integer *kflag)
{
    /* System generated locals */
    integer i__1;

    /* Local variables */
    integer i__, j, k, l, m;
    real r__;
    integer t, ij, il[31], kk, nn, iu[31], tt;
    doublereal ty;
    integer uy;
    doublereal tty;
    integer uuy;


/*     modified to make the same interchanges in an integer (iy) */
/*     and double (dy) array! */

/* ***BEGIN PROLOGUE  ISORT */
/* ***PURPOSE  Sort an array and optionally make the same interchanges in */
/*            an auxiliary array.  The array may be sorted in increasing */
/*            or decreasing order.  A slightly modified QUICKSORT */
/*            algorithm is used. */
/* ***LIBRARY   SLATEC */
/* ***CATEGORY  N6A2A */
/* ***TYPE      INTEGER (SSORT-S, DSORT-D, ISORT-I) */
/* ***KEYWORDS  SINGLETON QUICKSORT, SORT, SORTING */
/* ***AUTHOR  Jones, R. E., (SNLA) */
/*           Kahaner, D. K., (NBS) */
/*           Wisniewski, J. A., (SNLA) */
/* ***DESCRIPTION */

/*   ISORT sorts array IX and optionally makes the same interchanges in */
/*   array IY.  The array IX may be sorted in increasing order or */
/*   decreasing order.  A slightly modified quicksort algorithm is used. */

/*   Description of Parameters */
/*      IX - integer array of values to be sorted */
/*      IY - integer array to be (optionally) carried along */
/*      N  - number of values in integer array IX to be sorted */
/*      KFLAG - control parameter */
/*            =  2  means sort IX in increasing order and carry IY along. */
/*            =  1  means sort IX in increasing order (ignoring IY) */
/*            = -1  means sort IX in decreasing order (ignoring IY) */
/*            = -2  means sort IX in decreasing order and carry IY along. */

/* ***REFERENCES  R. C. Singleton, Algorithm 347, An efficient algorithm */
/*                 for sorting with minimal storage, Communications of */
/*                 the ACM, 12, 3 (1969), pp. 185-187. */
/* ***ROUTINES CALLED  XERMSG */
/* ***REVISION HISTORY  (YYMMDD) */
/*   761118  DATE WRITTEN */
/*   810801  Modified by David K. Kahaner. */
/*   890531  Changed all specific intrinsics to generic.  (WRB) */
/*   890831  Modified array declarations.  (WRB) */
/*   891009  Removed unreferenced statement labels.  (WRB) */
/*   891009  REVISION DATE from Version 3.2 */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900315  CALLs to XERROR changed to CALLs to XERMSG.  (THJ) */
/*   901012  Declared all variables; changed X,Y to IX,IY. (M. McClain) */
/*   920501  Reformatted the REFERENCES section.  (DWL, WRB) */
/*   920519  Clarified error messages.  (DWL) */
/*   920801  Declarations section rebuilt and code restructured to use */
/*           IF-THEN-ELSE-ENDIF.  (RWC, WRB) */
/*   100411  changed the dimension of IL and IU from 21 to 31. */

/*     field IL and IU have the dimension 31. This is log2 of the largest */
/*     array size to be sorted. If arrays larger than 2**31 in length have */
/*     to be sorted, this dimension has to be modified accordingly */

/* ***END PROLOGUE  ISORT */

/*     .. Scalar Arguments .. */
/*     .. Array Arguments .. */
/*     .. Local Scalars .. */
/*     .. Local Arrays .. */
/*     .. External Subroutines .. */
/*      EXTERNAL XERMSG */
/*     .. Intrinsic Functions .. */
/* ***FIRST EXECUTABLE STATEMENT  ISORT */
    /* Parameter adjustments */
    --dy;
    --iy;
    --ix;

    /* Function Body */
    nn = *n;
    if (nn < 1) {
/*         CALL XERMSG ('SLATEC', 'ISORT', */
/*     +      'The number of values to be sorted is not positive.', 1, 1) */
	return 0;
    }

    kk = abs(*kflag);
    if (kk != 1 && kk != 2) {
/*         CALL XERMSG ('SLATEC', 'ISORT', */
/*     +      'The sort control parameter, K, is not 2, 1, -1, or -2.', 2, */
/*     +      1) */
	return 0;
    }

/*     Alter array IX to get decreasing order if needed */

    if (*kflag <= -1) {
	i__1 = nn;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    ix[i__] = -ix[i__];
/* L10: */
	}
    }

    if (kk == 2) {
	goto L100;
    }

/*     Sort IX only */

    m = 1;
    i__ = 1;
    j = nn;
    r__ = .375f;

L20:
    if (i__ == j) {
	goto L60;
    }
    if (r__ <= .5898437f) {
	r__ += .0390625f;
    } else {
	r__ += -.21875f;
    }

L30:
    k = i__;

/*     Select a central element of the array and save it in location T */

    ij = i__ + (integer) ((j - i__) * r__);
    t = ix[ij];

/*     If first element of array is greater than T, interchange with T */

    if (ix[i__] > t) {
	ix[ij] = ix[i__];
	ix[i__] = t;
	t = ix[ij];
    }
    l = j;

/*     If last element of array is less than than T, interchange with T */

    if (ix[j] < t) {
	ix[ij] = ix[j];
	ix[j] = t;
	t = ix[ij];

/*        If first element of array is greater than T, interchange with T */

	if (ix[i__] > t) {
	    ix[ij] = ix[i__];
	    ix[i__] = t;
	    t = ix[ij];
	}
    }

/*     Find an element in the second half of the array which is smaller */
/*     than T */

L40:
    --l;
    if (ix[l] > t) {
	goto L40;
    }

/*     Find an element in the first half of the array which is greater */
/*     than T */

L50:
    ++k;
    if (ix[k] < t) {
	goto L50;
    }

/*     Interchange these elements */

    if (k <= l) {
	tt = ix[l];
	ix[l] = ix[k];
	ix[k] = tt;
	goto L40;
    }

/*     Save upper and lower subscripts of the array yet to be sorted */

    if (l - i__ > j - k) {
	il[m - 1] = i__;
	iu[m - 1] = l;
	i__ = k;
	++m;
    } else {
	il[m - 1] = k;
	iu[m - 1] = j;
	j = l;
	++m;
    }
    goto L70;

/*     Begin again on another portion of the unsorted array */

L60:
    --m;
    if (m == 0) {
	goto L190;
    }
    i__ = il[m - 1];
    j = iu[m - 1];

L70:
    if (j - i__ >= 1) {
	goto L30;
    }
    if (i__ == 1) {
	goto L20;
    }
    --i__;

L80:
    ++i__;
    if (i__ == j) {
	goto L60;
    }
    t = ix[i__ + 1];
    if (ix[i__] <= t) {
	goto L80;
    }
    k = i__;

L90:
    ix[k + 1] = ix[k];
    --k;
    if (t < ix[k]) {
	goto L90;
    }
    ix[k + 1] = t;
    goto L80;

/*     Sort IX and carry IY along */

L100:
    m = 1;
    i__ = 1;
    j = nn;
    r__ = .375f;

L110:
    if (i__ == j) {
	goto L150;
    }
    if (r__ <= .5898437f) {
	r__ += .0390625f;
    } else {
	r__ += -.21875f;
    }

L120:
    k = i__;

/*     Select a central element of the array and save it in location T */

    ij = i__ + (integer) ((j - i__) * r__);
    t = ix[ij];
    ty = dy[ij];
    uy = iy[ij];

/*     If first element of array is greater than T, interchange with T */

    if (ix[i__] > t) {
	ix[ij] = ix[i__];
	ix[i__] = t;
	t = ix[ij];
	dy[ij] = dy[i__];
	iy[ij] = iy[i__];
	dy[i__] = ty;
	iy[i__] = uy;
	ty = dy[ij];
	uy = iy[ij];
    }
    l = j;

/*     If last element of array is less than T, interchange with T */

    if (ix[j] < t) {
	ix[ij] = ix[j];
	ix[j] = t;
	t = ix[ij];
	dy[ij] = dy[j];
	iy[ij] = iy[j];
	dy[j] = ty;
	iy[j] = uy;
	ty = dy[ij];
	uy = iy[ij];

/*        If first element of array is greater than T, interchange with T */

	if (ix[i__] > t) {
	    ix[ij] = ix[i__];
	    ix[i__] = t;
	    t = ix[ij];
	    dy[ij] = dy[i__];
	    iy[ij] = iy[i__];
	    dy[i__] = ty;
	    iy[i__] = uy;
	    ty = dy[ij];
	    uy = iy[ij];
	}
    }

/*     Find an element in the second half of the array which is smaller */
/*     than T */

L130:
    --l;
    if (ix[l] > t) {
	goto L130;
    }

/*     Find an element in the first half of the array which is greater */
/*     than T */

L140:
    ++k;
    if (ix[k] < t) {
	goto L140;
    }

/*     Interchange these elements */

    if (k <= l) {
	tt = ix[l];
	ix[l] = ix[k];
	ix[k] = tt;
	tty = dy[l];
	uuy = iy[l];
	dy[l] = dy[k];
	iy[l] = iy[k];
	dy[k] = tty;
	iy[k] = uuy;
	goto L130;
    }

/*     Save upper and lower subscripts of the array yet to be sorted */

    if (l - i__ > j - k) {
	il[m - 1] = i__;
	iu[m - 1] = l;
	i__ = k;
	++m;
    } else {
	il[m - 1] = k;
	iu[m - 1] = j;
	j = l;
	++m;
    }
    goto L160;

/*     Begin again on another portion of the unsorted array */

L150:
    --m;
    if (m == 0) {
	goto L190;
    }
    i__ = il[m - 1];
    j = iu[m - 1];

L160:
    if (j - i__ >= 1) {
	goto L120;
    }
    if (i__ == 1) {
	goto L110;
    }
    --i__;

L170:
    ++i__;
    if (i__ == j) {
	goto L150;
    }
    t = ix[i__ + 1];
    ty = dy[i__ + 1];
    uy = iy[i__ + 1];
    if (ix[i__] <= t) {
	goto L170;
    }
    k = i__;

L180:
    ix[k + 1] = ix[k];
    dy[k + 1] = dy[k];
    iy[k + 1] = iy[k];
    --k;
    if (t < ix[k]) {
	goto L180;
    }
    ix[k + 1] = t;
    dy[k + 1] = ty;
    iy[k + 1] = uy;
    goto L170;

/*     Clean up */

L190:
    if (*kflag <= -1) {
	i__1 = nn;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    ix[i__] = -ix[i__];
/* L200: */
	}
    }
    return 0;
} /* isortiid_ */

