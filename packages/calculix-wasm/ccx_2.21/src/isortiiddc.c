/* isortiiddc.f -- translated by f2c (version 20200916).
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

/* Table of constant values */

static integer c__1 = 1;


/*     SLATEC: public domain */

/* deck isort */
/* Subroutine */ int isortiiddc_(integer *ix1, integer *ix2, doublereal *dy1, 
	doublereal *dy2, char *cy, integer *n, integer *kflag, ftnlen cy_len)
{
    /* System generated locals */
    integer i__1;
    icilist ici__1;

    /* Builtin functions */
    integer s_rsfi(icilist *), do_fio(integer *, char *, ftnlen), e_rsfi(void)
	    ;
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    integer i__, j, k, l, m;
    real r__;
    integer t, ij, il[31], kk, nn, iu[31], tt;
    char uy[20];
    integer tx21, tx12, tx22;
    doublereal ty11, ty12, ty21, ty22;
    char uuy[20];
    integer ttx21, ttx12, ttx22;
    doublereal tty11, tty12, tty21, tty22;
    integer iside, istat;


/*     modified to make the same interchanges in an integer (ix2), two */
/*     double (dy1 and dy2) and a char*20 aray (cy) */

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

/*   ISORT sorts array IX1 and optionally makes the same interchanges in */
/*   array IY.  The array IX1 may be sorted in increasing order or */
/*   decreasing order.  A slightly modified quicksort algorithm is used. */

/*   Description of Parameters */
/*      IX1 - integer array of values to be sorted */
/*      IY - integer array to be (optionally) carried along */
/*      N  - number of values in integer array IX1 to be sorted */
/*      KFLAG - control parameter */
/*            =  2  means sort IX1 in increasing order and carry IY along. */
/*            =  1  means sort IX1 in increasing order (ignoring IY) */
/*            = -1  means sort IX1 in decreasing order (ignoring IY) */
/*            = -2  means sort IX1 in decreasing order and carry IY along. */

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
/*   901012  Declared all variables; changed X,Y to IX1,IY. (M. McClain) */
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
    cy -= 20;
    dy2 -= 3;
    dy1 -= 3;
    ix2 -= 3;
    ix1 -= 3;

    /* Function Body */
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	ici__1.icierr = 1;
	ici__1.iciend = 1;
	ici__1.icirnum = 1;
	ici__1.icirlen = 1;
	ici__1.iciunit = cy + (i__ * 20 + 1);
	ici__1.icifmt = "(i1)";
	istat = s_rsfi(&ici__1);
	if (istat != 0) {
	    goto L100001;
	}
	istat = do_fio(&c__1, (char *)&iside, (ftnlen)sizeof(integer));
	if (istat != 0) {
	    goto L100001;
	}
	istat = e_rsfi();
L100001:
	if (istat > 0) {
	    iside = 0;
	}
	ix1[(i__ << 1) + 1] = ix1[(i__ << 1) + 1] * 10 + iside;
    }

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

/*     Alter array IX1 to get decreasing order if needed */

    if (*kflag <= -1) {
	i__1 = nn;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    ix1[(i__ << 1) + 1] = -ix1[(i__ << 1) + 1];
/* L10: */
	}
    }

    if (kk == 2) {
	goto L100;
    }

/*     Sort IX1 only */

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
    t = ix1[(ij << 1) + 1];

/*     If first element of array is greater than T, interchange with T */

    if (ix1[(i__ << 1) + 1] > t) {
	ix1[(ij << 1) + 1] = ix1[(i__ << 1) + 1];
	ix1[(i__ << 1) + 1] = t;
	t = ix1[(ij << 1) + 1];
    }
    l = j;

/*     If last element of array is less than than T, interchange with T */

    if (ix1[(j << 1) + 1] < t) {
	ix1[(ij << 1) + 1] = ix1[(j << 1) + 1];
	ix1[(j << 1) + 1] = t;
	t = ix1[(ij << 1) + 1];

/*        If first element of array is greater than T, interchange with T */

	if (ix1[(i__ << 1) + 1] > t) {
	    ix1[(ij << 1) + 1] = ix1[(i__ << 1) + 1];
	    ix1[(i__ << 1) + 1] = t;
	    t = ix1[(ij << 1) + 1];
	}
    }

/*     Find an element in the second half of the array which is smaller */
/*     than T */

L40:
    --l;
    if (ix1[(l << 1) + 1] > t) {
	goto L40;
    }

/*     Find an element in the first half of the array which is greater */
/*     than T */

L50:
    ++k;
    if (ix1[(k << 1) + 1] < t) {
	goto L50;
    }

/*     Interchange these elements */

    if (k <= l) {
	tt = ix1[(l << 1) + 1];
	ix1[(l << 1) + 1] = ix1[(k << 1) + 1];
	ix1[(k << 1) + 1] = tt;
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
    t = ix1[(i__ + 1 << 1) + 1];
    if (ix1[(i__ << 1) + 1] <= t) {
	goto L80;
    }
    k = i__;

L90:
    ix1[(k + 1 << 1) + 1] = ix1[(k << 1) + 1];
    --k;
    if (t < ix1[(k << 1) + 1]) {
	goto L90;
    }
    ix1[(k + 1 << 1) + 1] = t;
    goto L80;

/*     Sort IX1 and carry IY along */

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
    t = ix1[(ij << 1) + 1];
    ty11 = dy1[(ij << 1) + 1];
    ty21 = dy1[(ij << 1) + 2];
    ty12 = dy2[(ij << 1) + 1];
    ty22 = dy2[(ij << 1) + 2];
    tx21 = ix1[(ij << 1) + 2];
    tx12 = ix2[(ij << 1) + 1];
    tx22 = ix2[(ij << 1) + 2];
    s_copy(uy, cy + ij * 20, (ftnlen)20, (ftnlen)20);

/*     If first element of array is greater than T, interchange with T */

    if (ix1[(i__ << 1) + 1] > t) {
	ix1[(ij << 1) + 1] = ix1[(i__ << 1) + 1];
	ix1[(i__ << 1) + 1] = t;
	t = ix1[(ij << 1) + 1];
	dy1[(ij << 1) + 1] = dy1[(i__ << 1) + 1];
	dy1[(ij << 1) + 2] = dy1[(i__ << 1) + 2];
	dy2[(ij << 1) + 1] = dy2[(i__ << 1) + 1];
	dy2[(ij << 1) + 2] = dy2[(i__ << 1) + 2];
	ix1[(ij << 1) + 2] = ix1[(i__ << 1) + 2];
	ix2[(ij << 1) + 1] = ix2[(i__ << 1) + 1];
	ix2[(ij << 1) + 2] = ix2[(i__ << 1) + 2];
	s_copy(cy + ij * 20, cy + i__ * 20, (ftnlen)20, (ftnlen)20);
	dy1[(i__ << 1) + 1] = ty11;
	dy1[(i__ << 1) + 2] = ty21;
	dy2[(i__ << 1) + 1] = ty12;
	dy2[(i__ << 1) + 2] = ty22;
	ix1[(i__ << 1) + 2] = tx21;
	ix2[(i__ << 1) + 1] = tx12;
	ix2[(i__ << 1) + 2] = tx22;
	s_copy(cy + i__ * 20, uy, (ftnlen)20, (ftnlen)20);
	ty11 = dy1[(ij << 1) + 1];
	ty21 = dy1[(ij << 1) + 2];
	ty12 = dy2[(ij << 1) + 1];
	ty22 = dy2[(ij << 1) + 2];
	tx21 = ix1[(ij << 1) + 2];
	tx12 = ix2[(ij << 1) + 1];
	tx22 = ix2[(ij << 1) + 2];
	s_copy(uy, cy + ij * 20, (ftnlen)20, (ftnlen)20);
    }
    l = j;

/*     If last element of array is less than T, interchange with T */

    if (ix1[(j << 1) + 1] < t) {
	ix1[(ij << 1) + 1] = ix1[(j << 1) + 1];
	ix1[(j << 1) + 1] = t;
	t = ix1[(ij << 1) + 1];
	dy1[(ij << 1) + 1] = dy1[(j << 1) + 1];
	dy1[(ij << 1) + 2] = dy1[(j << 1) + 2];
	dy2[(ij << 1) + 1] = dy2[(j << 1) + 1];
	dy2[(ij << 1) + 2] = dy2[(j << 1) + 2];
	ix1[(ij << 1) + 2] = ix1[(j << 1) + 2];
	ix2[(ij << 1) + 1] = ix2[(j << 1) + 1];
	ix2[(ij << 1) + 2] = ix2[(j << 1) + 2];
	s_copy(cy + ij * 20, cy + j * 20, (ftnlen)20, (ftnlen)20);
	dy1[(j << 1) + 1] = ty11;
	dy1[(j << 1) + 2] = ty21;
	dy2[(j << 1) + 1] = ty12;
	dy2[(j << 1) + 2] = ty22;
	ix1[(j << 1) + 2] = tx21;
	ix2[(j << 1) + 1] = tx12;
	ix2[(j << 1) + 2] = tx22;
	s_copy(cy + j * 20, uy, (ftnlen)20, (ftnlen)20);
	ty11 = dy1[(ij << 1) + 1];
	ty21 = dy1[(ij << 1) + 2];
	ty12 = dy2[(ij << 1) + 1];
	ty22 = dy2[(ij << 1) + 2];
	tx21 = ix1[(ij << 1) + 2];
	tx12 = ix2[(ij << 1) + 1];
	tx22 = ix2[(ij << 1) + 2];
	s_copy(uy, cy + ij * 20, (ftnlen)20, (ftnlen)20);

/*        If first element of array is greater than T, interchange with T */

	if (ix1[(i__ << 1) + 1] > t) {
	    ix1[(ij << 1) + 1] = ix1[(i__ << 1) + 1];
	    ix1[(i__ << 1) + 1] = t;
	    t = ix1[(ij << 1) + 1];
	    dy1[(ij << 1) + 1] = dy1[(i__ << 1) + 1];
	    dy1[(ij << 1) + 2] = dy1[(i__ << 1) + 2];
	    dy2[(ij << 1) + 1] = dy2[(i__ << 1) + 1];
	    dy2[(ij << 1) + 2] = dy2[(i__ << 1) + 2];
	    ix1[(ij << 1) + 2] = ix1[(i__ << 1) + 2];
	    ix2[(ij << 1) + 1] = ix2[(i__ << 1) + 1];
	    ix2[(ij << 1) + 2] = ix2[(i__ << 1) + 2];
	    s_copy(cy + ij * 20, cy + i__ * 20, (ftnlen)20, (ftnlen)20);
	    dy1[(i__ << 1) + 1] = ty11;
	    dy1[(i__ << 1) + 2] = ty21;
	    dy2[(i__ << 1) + 1] = ty12;
	    dy2[(i__ << 1) + 2] = ty22;
	    ix1[(i__ << 1) + 2] = tx21;
	    ix2[(i__ << 1) + 1] = tx12;
	    ix2[(i__ << 1) + 2] = tx22;
	    s_copy(cy + i__ * 20, uy, (ftnlen)20, (ftnlen)20);
	    ty11 = dy1[(ij << 1) + 1];
	    ty21 = dy1[(ij << 1) + 2];
	    ty12 = dy2[(ij << 1) + 1];
	    ty22 = dy2[(ij << 1) + 2];
	    tx21 = ix1[(ij << 1) + 2];
	    tx12 = ix2[(ij << 1) + 1];
	    tx22 = ix2[(ij << 1) + 2];
	    s_copy(uy, cy + ij * 20, (ftnlen)20, (ftnlen)20);
	}
    }

/*     Find an element in the second half of the array which is smaller */
/*     than T */

L130:
    --l;
    if (ix1[(l << 1) + 1] > t) {
	goto L130;
    }

/*     Find an element in the first half of the array which is greater */
/*     than T */

L140:
    ++k;
    if (ix1[(k << 1) + 1] < t) {
	goto L140;
    }

/*     Interchange these elements */

    if (k <= l) {
	tt = ix1[(l << 1) + 1];
	ix1[(l << 1) + 1] = ix1[(k << 1) + 1];
	ix1[(k << 1) + 1] = tt;
	tty11 = dy1[(l << 1) + 1];
	tty21 = dy1[(l << 1) + 2];
	tty12 = dy2[(l << 1) + 1];
	tty22 = dy2[(l << 1) + 2];
	ttx21 = ix1[(l << 1) + 2];
	ttx12 = ix2[(l << 1) + 1];
	ttx22 = ix2[(l << 1) + 2];
	s_copy(uuy, cy + l * 20, (ftnlen)20, (ftnlen)20);
	dy1[(l << 1) + 1] = dy1[(k << 1) + 1];
	dy1[(l << 1) + 2] = dy1[(k << 1) + 2];
	dy2[(l << 1) + 1] = dy2[(k << 1) + 1];
	dy2[(l << 1) + 2] = dy2[(k << 1) + 2];
	ix1[(l << 1) + 2] = ix1[(k << 1) + 2];
	ix2[(l << 1) + 1] = ix2[(k << 1) + 1];
	ix2[(l << 1) + 2] = ix2[(k << 1) + 2];
	s_copy(cy + l * 20, cy + k * 20, (ftnlen)20, (ftnlen)20);
	dy1[(k << 1) + 1] = tty11;
	dy1[(k << 1) + 2] = tty21;
	dy2[(k << 1) + 1] = tty12;
	dy2[(k << 1) + 2] = tty22;
	ix1[(k << 1) + 2] = ttx21;
	ix2[(k << 1) + 1] = ttx12;
	ix2[(k << 1) + 2] = ttx22;
	s_copy(cy + k * 20, uuy, (ftnlen)20, (ftnlen)20);
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
    t = ix1[(i__ + 1 << 1) + 1];
    ty11 = dy1[(i__ + 1 << 1) + 1];
    ty21 = dy1[(i__ + 1 << 1) + 2];
    ty12 = dy2[(i__ + 1 << 1) + 1];
    ty22 = dy2[(i__ + 1 << 1) + 2];
    tx21 = ix1[(i__ + 1 << 1) + 2];
    tx12 = ix2[(i__ + 1 << 1) + 1];
    tx22 = ix2[(i__ + 1 << 1) + 2];
    s_copy(uy, cy + (i__ + 1) * 20, (ftnlen)20, (ftnlen)20);
    if (ix1[(i__ << 1) + 1] <= t) {
	goto L170;
    }
    k = i__;

L180:
    ix1[(k + 1 << 1) + 1] = ix1[(k << 1) + 1];
    dy1[(k + 1 << 1) + 1] = dy1[(k << 1) + 1];
    dy1[(k + 1 << 1) + 2] = dy1[(k << 1) + 2];
    dy2[(k + 1 << 1) + 1] = dy2[(k << 1) + 1];
    dy2[(k + 1 << 1) + 2] = dy2[(k << 1) + 2];
    ix1[(k + 1 << 1) + 2] = ix1[(k << 1) + 2];
    ix2[(k + 1 << 1) + 1] = ix2[(k << 1) + 1];
    ix2[(k + 1 << 1) + 2] = ix2[(k << 1) + 2];
    s_copy(cy + (k + 1) * 20, cy + k * 20, (ftnlen)20, (ftnlen)20);
    --k;
    if (t < ix1[(k << 1) + 1]) {
	goto L180;
    }
    ix1[(k + 1 << 1) + 1] = t;
    dy1[(k + 1 << 1) + 1] = ty11;
    dy1[(k + 1 << 1) + 2] = ty21;
    dy2[(k + 1 << 1) + 1] = ty12;
    dy2[(k + 1 << 1) + 2] = ty22;
    ix1[(k + 1 << 1) + 2] = tx21;
    ix2[(k + 1 << 1) + 1] = tx12;
    ix2[(k + 1 << 1) + 2] = tx22;
    s_copy(cy + (k + 1) * 20, uy, (ftnlen)20, (ftnlen)20);
    goto L170;

/*     Clean up */

L190:
    if (*kflag <= -1) {
	i__1 = nn;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    ix1[(i__ << 1) + 1] = -ix1[(i__ << 1) + 1];
/* L200: */
	}
    }

    i__1 = nn;
    for (i__ = 1; i__ <= i__1; ++i__) {
	ici__1.icierr = 1;
	ici__1.iciend = 1;
	ici__1.icirnum = 1;
	ici__1.icirlen = 1;
	ici__1.iciunit = cy + (i__ * 20 + 1);
	ici__1.icifmt = "(i1)";
	istat = s_rsfi(&ici__1);
	if (istat != 0) {
	    goto L100002;
	}
	istat = do_fio(&c__1, (char *)&iside, (ftnlen)sizeof(integer));
	if (istat != 0) {
	    goto L100002;
	}
	istat = e_rsfi();
L100002:
	if (istat > 0) {
	    iside = 0;
	}
	ix1[(i__ << 1) + 1] = (ix1[(i__ << 1) + 1] - iside) / 10;
    }

    return 0;
} /* isortiiddc_ */

