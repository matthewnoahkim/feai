/* dsort.f -- translated by f2c (version 20200916).
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

static integer c__9 = 9;
static integer c__1 = 1;
static integer c__3 = 3;
static integer c__201 = 201;


/*     SLATEC: public domain */

/* deck dsort */
/* Subroutine */ int dsort_(doublereal *dx, integer *iy, integer *n, integer *
	kflag)
{
    /* System generated locals */
    integer i__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    integer i__, j, k, l, m;
    doublereal r__, t;
    integer ij, il[31], kk, nn, iu[31];
    doublereal tt;
    integer ty, tty;
    extern /* Subroutine */ int exit_(integer *);

    /* Fortran I/O blocks */
    static cilist io___2 = { 0, 6, 0, 0, 0 };
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___5 = { 0, 6, 0, 0, 0 };
    static cilist io___6 = { 0, 6, 0, 0, 0 };



/*    slight change: XERMSG was removed; error messages are */
/*                   led to the screen; */

/* ***BEGIN PROLOGUE  DSORT */
/* ***PURPOSE  Sort an array and optionally make the same interchanges in */
/*            an auxiliary array.  The array may be sorted in increasing */
/*            or decreasing order.  A slightly modified QUICKSORT */
/*            algorithm is used. */
/* ***LIBRARY   SLATEC */
/* ***CATEGORY  N6A2B */
/* ***TYPE      DOUBLE PRECISION (SSORT-S, DSORT-D, ISORT-I) */
/* ***KEYWORDS  SINGLETON QUICKSORT, SORT, SORTING */
/* ***AUTHOR  Jones, R. E., (SNLA) */
/*           Wisniewski, J. A., (SNLA) */
/* ***ROUTINES CALLED  XERMSG */
/* ***DESCRIPTION */

/*   DSORT sorts array DX and optionally makes the same interchanges in */
/*   array IY.  The array DX may be sorted in increasing order or */
/*   decreasing order.  A slightly modified quicksort algorithm is used. */

/*   Description of Parameters */
/*      DX - array of values to be sorted   (usually abscissas) */
/*      IY - array to be (optionally) carried along */
/*      N  - number of values in array DX to be sorted */
/*      KFLAG - control parameter */
/*            =  2  means sort DX in increasing order and carry IY along. */
/*            =  1  means sort DX in increasing order (ignoring IY) */
/*            = -1  means sort DX in decreasing order (ignoring IY) */
/*            = -2  means sort DX in decreasing order and carry IY along. */

/* ***REFERENCES  R. C. Singleton, Algorithm 347, An efficient algorithm */
/*                 for sorting with minimal storage, Communications of */
/*                 the ACM, 12, 3 (1969), pp. 185-187. */
/* ***REVISION HISTORY  (YYMMDD) */
/*   761101  DATE WRITTEN */
/*   761118  Modified to use the Singleton quicksort algorithm.  (JAW) */
/*   890531  Changed all specific intrinsics to generic.  (WRB) */
/*   890831  Modified array declarations.  (WRB) */
/*   891009  Removed unreferenced statement labels.  (WRB) */
/*   891024  Changed category.  (WRB) */
/*   891024  REVISION DATE from Version 3.2 */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900315  CALLs to XERROR changed to CALLs to XERMSG.  (THJ) */
/*   901012  Declared all variables; changed X,Y to DX,IY; changed */
/*           code to parallel SSORT. (M. McClain) */
/*   920501  Reformatted the REFERENCES section.  (DWL, WRB) */
/*   920519  Clarified error messages.  (DWL) */
/*   920801  Declarations section rebuilt and code restructured to use */
/*           IF-THEN-ELSE-ENDIF.  (RWC, WRB) */
/*   100411  changed the dimension of IL and IU from 21 to 31. */
/*   150514  inserted intent statements */

/*     field IL and IU have the dimension 31. This is log2 of the largest */
/*     array size to be sorted. If arrays larger than 2**31 in length have */
/*     to be sorted, this dimension has to be modified accordingly */

/* ***END PROLOGUE  DSORT */
/*     .. Scalar Arguments .. */
/*     .. Array Arguments .. */
/*     .. Local Scalars .. */
/*     .. Local Arrays .. */
/*     .. External Subroutines .. */
/*      EXTERNAL XERMSG */
/*     .. Intrinsic Functions .. */


/* ***FIRST EXECUTABLE STATEMENT  DSORT */
    /* Parameter adjustments */
    --iy;
    --dx;

    /* Function Body */
    nn = *n;
    if (nn < 1) {
	s_wsle(&io___2);
	do_lio(&c__9, &c__1, "*error in dsort: the number of values to be", (
		ftnlen)43);
	e_wsle();
	s_wsle(&io___3);
	do_lio(&c__9, &c__1, "       sorted is not positive: ", (ftnlen)31);
	do_lio(&c__3, &c__1, (char *)&nn, (ftnlen)sizeof(integer));
	e_wsle();
	exit_(&c__201);
    }

    kk = abs(*kflag);
    if (kk != 1 && kk != 2) {
	s_wsle(&io___5);
	do_lio(&c__9, &c__1, "*error in dsort: the sort control parameter is",
		 (ftnlen)46);
	e_wsle();
	s_wsle(&io___6);
	do_lio(&c__9, &c__1, "       not 2, 1, -1 or -2", (ftnlen)25);
	e_wsle();
	exit_(&c__201);
    }

/*     Alter array DX to get decreasing order if needed */

    if (*kflag <= -1) {
	i__1 = nn;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    dx[i__] = -dx[i__];
/* L10: */
	}
    }

    if (kk == 2) {
	goto L100;
    }

/*     Sort DX only */

    m = 1;
    i__ = 1;
    j = nn;
    r__ = .375;

L20:
    if (i__ == j) {
	goto L60;
    }
    if (r__ <= .5898437) {
	r__ += .0390625;
    } else {
	r__ += -.21875;
    }

L30:
    k = i__;

/*     Select a central element of the array and save it in location T */

    ij = i__ + (integer) ((j - i__) * r__);
    t = dx[ij];

/*     If first element of array is greater than T, interchange with T */

    if (dx[i__] > t) {
	dx[ij] = dx[i__];
	dx[i__] = t;
	t = dx[ij];
    }
    l = j;

/*     If last element of array is less than than T, interchange with T */

    if (dx[j] < t) {
	dx[ij] = dx[j];
	dx[j] = t;
	t = dx[ij];

/*        If first element of array is greater than T, interchange with T */

	if (dx[i__] > t) {
	    dx[ij] = dx[i__];
	    dx[i__] = t;
	    t = dx[ij];
	}
    }

/*     Find an element in the second half of the array which is smaller */
/*     than T */

L40:
    --l;
    if (dx[l] > t) {
	goto L40;
    }

/*     Find an element in the first half of the array which is greater */
/*     than T */

L50:
    ++k;
    if (dx[k] < t) {
	goto L50;
    }

/*     Interchange these elements */

    if (k <= l) {
	tt = dx[l];
	dx[l] = dx[k];
	dx[k] = tt;
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
    t = dx[i__ + 1];
    if (dx[i__] <= t) {
	goto L80;
    }
    k = i__;

L90:
    dx[k + 1] = dx[k];
    --k;
    if (t < dx[k]) {
	goto L90;
    }
    dx[k + 1] = t;
    goto L80;

/*     Sort DX and carry IY along */

L100:
    m = 1;
    i__ = 1;
    j = nn;
    r__ = .375;

L110:
    if (i__ == j) {
	goto L150;
    }
    if (r__ <= .5898437) {
	r__ += .0390625;
    } else {
	r__ += -.21875;
    }

L120:
    k = i__;

/*     Select a central element of the array and save it in location T */

    ij = i__ + (integer) ((j - i__) * r__);
    t = dx[ij];
    ty = iy[ij];

/*     If first element of array is greater than T, interchange with T */

    if (dx[i__] > t) {
	dx[ij] = dx[i__];
	dx[i__] = t;
	t = dx[ij];
	iy[ij] = iy[i__];
	iy[i__] = ty;
	ty = iy[ij];
    }
    l = j;

/*     If last element of array is less than T, interchange with T */

    if (dx[j] < t) {
	dx[ij] = dx[j];
	dx[j] = t;
	t = dx[ij];
	iy[ij] = iy[j];
	iy[j] = ty;
	ty = iy[ij];

/*        If first element of array is greater than T, interchange with T */

	if (dx[i__] > t) {
	    dx[ij] = dx[i__];
	    dx[i__] = t;
	    t = dx[ij];
	    iy[ij] = iy[i__];
	    iy[i__] = ty;
	    ty = iy[ij];
	}
    }

/*     Find an element in the second half of the array which is smaller */
/*     than T */

L130:
    --l;
    if (dx[l] > t) {
	goto L130;
    }

/*     Find an element in the first half of the array which is greater */
/*     than T */

L140:
    ++k;
    if (dx[k] < t) {
	goto L140;
    }

/*     Interchange these elements */

    if (k <= l) {
	tt = dx[l];
	dx[l] = dx[k];
	dx[k] = tt;
	tty = iy[l];
	iy[l] = iy[k];
	iy[k] = tty;
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
    t = dx[i__ + 1];
    ty = iy[i__ + 1];
    if (dx[i__] <= t) {
	goto L170;
    }
    k = i__;

L180:
    dx[k + 1] = dx[k];
    iy[k + 1] = iy[k];
    --k;
    if (t < dx[k]) {
	goto L180;
    }
    dx[k + 1] = t;
    iy[k + 1] = ty;
    goto L170;

/*     Clean up */

L190:
    if (*kflag <= -1) {
	i__1 = nn;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    dx[i__] = -dx[i__];
/* L200: */
	}
    }
    return 0;
} /* dsort_ */

