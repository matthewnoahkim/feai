/* dlz.f -- translated by f2c (version 20200916).
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


/* Module 496 in TOMS */
/* Based upon the LZ-algorithm */
/* (see L.C. Kaufman, ACM TOMS 1 (1975) pp. 271-281) */

/* Subroutine */ int dlzhes_(integer *n, doublecomplex *a, integer *na, 
	doublecomplex *b, integer *nb, doublecomplex *x, integer *nx, logical 
	*wantx)
{
    /* System generated locals */
    integer a_dim1, a_offset, b_dim1, b_offset, x_dim1, x_offset, i__1, i__2, 
	    i__3, i__4, i__5, i__6;
    doublereal d__1, d__2, d__3, d__4;
    doublecomplex z__1, z__2;

    /* Builtin functions */
    double d_imag(doublecomplex *);
    void z_div(doublecomplex *, doublecomplex *, doublecomplex *);

    /* Local variables */
    doublereal c__, d__;
    integer i__, j, k;
    doublecomplex w, y, z__;
    integer ii, im1, jm2, ip1, jp1, nm1, nm2, imj;

/* THIS SUBROUTINE REDUCES THE COMPLEX MATRIX A TO UPPER */
/* HESSENBERG FORM AND REDUCES THE COMPLEX MATRIX B TO */
/* TRIANGULAR FORM */
/* INPUT PARAMETERS.. */
/* N   THE ORDER OF THE A AND B MATRICES */
/* A   A COMPLEX MATRIX */
/* NA  THE ROW DIMENSION OF THE A MATRIX */
/* B   A COMPLEX MATRIX */
/* NB  THE ROW DIMENSION OF THE B MATRIX */
/* NX  THE ROW DIMENSION OF THE X MATRIX */
/* WANTX A LOGICAL VARIABLE WHICH IS SET TO .TRUE. IF */
/*       THE EIGENVECTORS ARE WANTED. OTHERWISE IT SHOULD */
/*     BE SET TO .FALSE. */
/* OUTPUT PARAMETERS.. */
/* A  ON OUTPUT A IS AN UPPER HESSENBERG MATRIX, THE */
/*    ORIGINAL MATRIX HAS BEEN DESTROYED */
/* B  AN UPPER TRIANGULAR MATRIX, THE ORIGINAL MATRIX */
/*    HAS BEEN DESTROYED */
/* X  CONTAINS THE TRANSFORMATIONS NEEDED TO COMPUTE */
/*    THE EIGENVECTORS OF THE ORIGINAL SYSTEM */





    /* Parameter adjustments */
    a_dim1 = *na;
    a_offset = 1 + a_dim1;
    a -= a_offset;
    b_dim1 = *nb;
    b_offset = 1 + b_dim1;
    b -= b_offset;
    x_dim1 = *nx;
    x_offset = 1 + x_dim1;
    x -= x_offset;

    /* Function Body */
    nm1 = *n - 1;
/* REDUCE B TO TRIANGULAR FORM USING ELEMENTARY */
/* TRANSFORMATIONS */
    i__1 = nm1;
    for (i__ = 1; i__ <= i__1; ++i__) {
	d__ = 0.;
	ip1 = i__ + 1;
	i__2 = *n;
	for (k = ip1; k <= i__2; ++k) {
	    i__3 = k + i__ * b_dim1;
	    y.r = b[i__3].r, y.i = b[i__3].i;
	    c__ = (d__1 = y.r, abs(d__1)) + (d__2 = d_imag(&y), abs(d__2));
	    if (c__ <= d__) {
		goto L10;
	    }
	    d__ = c__;
	    ii = k;
L10:
	    ;
	}
	if (d__ == 0.) {
	    goto L80;
	}
	i__2 = i__ + i__ * b_dim1;
	y.r = b[i__2].r, y.i = b[i__2].i;
	if (d__ <= (d__1 = y.r, abs(d__1)) + (d__2 = d_imag(&y), abs(d__2))) {
	    goto L40;
	}
/* MUST INTERCHANGE */
	i__2 = *n;
	for (j = 1; j <= i__2; ++j) {
	    i__3 = i__ + j * a_dim1;
	    y.r = a[i__3].r, y.i = a[i__3].i;
	    i__3 = i__ + j * a_dim1;
	    i__4 = ii + j * a_dim1;
	    a[i__3].r = a[i__4].r, a[i__3].i = a[i__4].i;
	    i__3 = ii + j * a_dim1;
	    a[i__3].r = y.r, a[i__3].i = y.i;
/* L20: */
	}
	i__2 = *n;
	for (j = i__; j <= i__2; ++j) {
	    i__3 = i__ + j * b_dim1;
	    y.r = b[i__3].r, y.i = b[i__3].i;
	    i__3 = i__ + j * b_dim1;
	    i__4 = ii + j * b_dim1;
	    b[i__3].r = b[i__4].r, b[i__3].i = b[i__4].i;
	    i__3 = ii + j * b_dim1;
	    b[i__3].r = y.r, b[i__3].i = y.i;
/* L30: */
	}
L40:
	i__2 = *n;
	for (j = ip1; j <= i__2; ++j) {
	    z_div(&z__1, &b[j + i__ * b_dim1], &b[i__ + i__ * b_dim1]);
	    y.r = z__1.r, y.i = z__1.i;
	    if (y.r == 0. && d_imag(&y) == 0.) {
		goto L70;
	    }
	    i__3 = *n;
	    for (k = 1; k <= i__3; ++k) {
		i__4 = j + k * a_dim1;
		i__5 = j + k * a_dim1;
		i__6 = i__ + k * a_dim1;
		z__2.r = y.r * a[i__6].r - y.i * a[i__6].i, z__2.i = y.r * a[
			i__6].i + y.i * a[i__6].r;
		z__1.r = a[i__5].r - z__2.r, z__1.i = a[i__5].i - z__2.i;
		a[i__4].r = z__1.r, a[i__4].i = z__1.i;
/* L50: */
	    }
	    i__3 = *n;
	    for (k = ip1; k <= i__3; ++k) {
		i__4 = j + k * b_dim1;
		i__5 = j + k * b_dim1;
		i__6 = i__ + k * b_dim1;
		z__2.r = y.r * b[i__6].r - y.i * b[i__6].i, z__2.i = y.r * b[
			i__6].i + y.i * b[i__6].r;
		z__1.r = b[i__5].r - z__2.r, z__1.i = b[i__5].i - z__2.i;
		b[i__4].r = z__1.r, b[i__4].i = z__1.i;
/* L60: */
	    }
L70:
	    ;
	}
	i__2 = ip1 + i__ * b_dim1;
	b[i__2].r = 0., b[i__2].i = 0.;
L80:
	;
    }
/* INITIALIZE X */
    if (! (*wantx)) {
	goto L110;
    }
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	i__2 = *n;
	for (j = 1; j <= i__2; ++j) {
	    i__3 = i__ + j * x_dim1;
	    x[i__3].r = 0., x[i__3].i = 0.;
/* L90: */
	}
	i__2 = i__ + i__ * x_dim1;
	x[i__2].r = 1., x[i__2].i = 0.;
/* L100: */
    }
/* REDUCE A TO UPPER HESSENBERG FORM */
L110:
    nm2 = *n - 2;
    if (nm2 < 1) {
	goto L270;
    }
    i__1 = nm2;
    for (j = 1; j <= i__1; ++j) {
	jm2 = nm1 - j;
	jp1 = j + 1;
	i__2 = jm2;
	for (ii = 1; ii <= i__2; ++ii) {
	    i__ = *n + 1 - ii;
	    im1 = i__ - 1;
	    imj = i__ - j;
	    i__3 = i__ + j * a_dim1;
	    w.r = a[i__3].r, w.i = a[i__3].i;
	    i__3 = im1 + j * a_dim1;
	    z__.r = a[i__3].r, z__.i = a[i__3].i;
	    if ((d__1 = w.r, abs(d__1)) + (d__2 = d_imag(&w), abs(d__2)) <= (
		    d__3 = z__.r, abs(d__3)) + (d__4 = d_imag(&z__), abs(d__4)
		    )) {
		goto L140;
	    }
/* MUST INTERCHANGE ROWS */
	    i__3 = *n;
	    for (k = j; k <= i__3; ++k) {
		i__4 = i__ + k * a_dim1;
		y.r = a[i__4].r, y.i = a[i__4].i;
		i__4 = i__ + k * a_dim1;
		i__5 = im1 + k * a_dim1;
		a[i__4].r = a[i__5].r, a[i__4].i = a[i__5].i;
		i__4 = im1 + k * a_dim1;
		a[i__4].r = y.r, a[i__4].i = y.i;
/* L120: */
	    }
	    i__3 = *n;
	    for (k = im1; k <= i__3; ++k) {
		i__4 = i__ + k * b_dim1;
		y.r = b[i__4].r, y.i = b[i__4].i;
		i__4 = i__ + k * b_dim1;
		i__5 = im1 + k * b_dim1;
		b[i__4].r = b[i__5].r, b[i__4].i = b[i__5].i;
		i__4 = im1 + k * b_dim1;
		b[i__4].r = y.r, b[i__4].i = y.i;
/* L130: */
	    }
L140:
	    i__3 = i__ + j * a_dim1;
	    z__.r = a[i__3].r, z__.i = a[i__3].i;
	    if (z__.r == 0. && d_imag(&z__) == 0.) {
		goto L170;
	    }
	    z_div(&z__1, &z__, &a[im1 + j * a_dim1]);
	    y.r = z__1.r, y.i = z__1.i;
	    i__3 = *n;
	    for (k = jp1; k <= i__3; ++k) {
		i__4 = i__ + k * a_dim1;
		i__5 = i__ + k * a_dim1;
		i__6 = im1 + k * a_dim1;
		z__2.r = y.r * a[i__6].r - y.i * a[i__6].i, z__2.i = y.r * a[
			i__6].i + y.i * a[i__6].r;
		z__1.r = a[i__5].r - z__2.r, z__1.i = a[i__5].i - z__2.i;
		a[i__4].r = z__1.r, a[i__4].i = z__1.i;
/* L150: */
	    }
	    i__3 = *n;
	    for (k = im1; k <= i__3; ++k) {
		i__4 = i__ + k * b_dim1;
		i__5 = i__ + k * b_dim1;
		i__6 = im1 + k * b_dim1;
		z__2.r = y.r * b[i__6].r - y.i * b[i__6].i, z__2.i = y.r * b[
			i__6].i + y.i * b[i__6].r;
		z__1.r = b[i__5].r - z__2.r, z__1.i = b[i__5].i - z__2.i;
		b[i__4].r = z__1.r, b[i__4].i = z__1.i;
/* L160: */
	    }
/* TRANSFORMATION FROM THE RIGHT */
L170:
	    i__3 = i__ + im1 * b_dim1;
	    w.r = b[i__3].r, w.i = b[i__3].i;
	    i__3 = i__ + i__ * b_dim1;
	    z__.r = b[i__3].r, z__.i = b[i__3].i;
	    if ((d__1 = w.r, abs(d__1)) + (d__2 = d_imag(&w), abs(d__2)) <= (
		    d__3 = z__.r, abs(d__3)) + (d__4 = d_imag(&z__), abs(d__4)
		    )) {
		goto L210;
	    }
/* MUST INTERCHANGE COLUMNS */
	    i__3 = i__;
	    for (k = 1; k <= i__3; ++k) {
		i__4 = k + i__ * b_dim1;
		y.r = b[i__4].r, y.i = b[i__4].i;
		i__4 = k + i__ * b_dim1;
		i__5 = k + im1 * b_dim1;
		b[i__4].r = b[i__5].r, b[i__4].i = b[i__5].i;
		i__4 = k + im1 * b_dim1;
		b[i__4].r = y.r, b[i__4].i = y.i;
/* L180: */
	    }
	    i__3 = *n;
	    for (k = 1; k <= i__3; ++k) {
		i__4 = k + i__ * a_dim1;
		y.r = a[i__4].r, y.i = a[i__4].i;
		i__4 = k + i__ * a_dim1;
		i__5 = k + im1 * a_dim1;
		a[i__4].r = a[i__5].r, a[i__4].i = a[i__5].i;
		i__4 = k + im1 * a_dim1;
		a[i__4].r = y.r, a[i__4].i = y.i;
/* L190: */
	    }
	    if (! (*wantx)) {
		goto L210;
	    }
	    i__3 = *n;
	    for (k = imj; k <= i__3; ++k) {
		i__4 = k + i__ * x_dim1;
		y.r = x[i__4].r, y.i = x[i__4].i;
		i__4 = k + i__ * x_dim1;
		i__5 = k + im1 * x_dim1;
		x[i__4].r = x[i__5].r, x[i__4].i = x[i__5].i;
		i__4 = k + im1 * x_dim1;
		x[i__4].r = y.r, x[i__4].i = y.i;
/* L200: */
	    }
L210:
	    i__3 = i__ + im1 * b_dim1;
	    z__.r = b[i__3].r, z__.i = b[i__3].i;
	    if (z__.r == 0. && d_imag(&z__) == 0.) {
		goto L250;
	    }
	    z_div(&z__1, &z__, &b[i__ + i__ * b_dim1]);
	    y.r = z__1.r, y.i = z__1.i;
	    i__3 = im1;
	    for (k = 1; k <= i__3; ++k) {
		i__4 = k + im1 * b_dim1;
		i__5 = k + im1 * b_dim1;
		i__6 = k + i__ * b_dim1;
		z__2.r = y.r * b[i__6].r - y.i * b[i__6].i, z__2.i = y.r * b[
			i__6].i + y.i * b[i__6].r;
		z__1.r = b[i__5].r - z__2.r, z__1.i = b[i__5].i - z__2.i;
		b[i__4].r = z__1.r, b[i__4].i = z__1.i;
/* L220: */
	    }
	    i__3 = i__ + im1 * b_dim1;
	    b[i__3].r = 0., b[i__3].i = 0.;
	    i__3 = *n;
	    for (k = 1; k <= i__3; ++k) {
		i__4 = k + im1 * a_dim1;
		i__5 = k + im1 * a_dim1;
		i__6 = k + i__ * a_dim1;
		z__2.r = y.r * a[i__6].r - y.i * a[i__6].i, z__2.i = y.r * a[
			i__6].i + y.i * a[i__6].r;
		z__1.r = a[i__5].r - z__2.r, z__1.i = a[i__5].i - z__2.i;
		a[i__4].r = z__1.r, a[i__4].i = z__1.i;
/* L230: */
	    }
	    if (! (*wantx)) {
		goto L250;
	    }
	    i__3 = *n;
	    for (k = imj; k <= i__3; ++k) {
		i__4 = k + im1 * x_dim1;
		i__5 = k + im1 * x_dim1;
		i__6 = k + i__ * x_dim1;
		z__2.r = y.r * x[i__6].r - y.i * x[i__6].i, z__2.i = y.r * x[
			i__6].i + y.i * x[i__6].r;
		z__1.r = x[i__5].r - z__2.r, z__1.i = x[i__5].i - z__2.i;
		x[i__4].r = z__1.r, x[i__4].i = z__1.i;
/* L240: */
	    }
L250:
	    ;
	}
	i__2 = jp1 + 1 + j * a_dim1;
	a[i__2].r = 0., a[i__2].i = 0.;
/* L260: */
    }
L270:
    return 0;
} /* dlzhes_ */

/* Subroutine */ int dlzit_(integer *n, doublecomplex *a, integer *na, 
	doublecomplex *b, integer *nb, doublecomplex *x, integer *nx, logical 
	*wantx, integer *iter, doublecomplex *eiga, doublecomplex *eigb)
{
    /* System generated locals */
    integer a_dim1, a_offset, b_dim1, b_offset, x_dim1, x_offset, i__1, i__2, 
	    i__3, i__4, i__5;
    doublereal d__1, d__2, d__3, d__4, d__5, d__6;
    doublecomplex z__1, z__2, z__3, z__4, z__5;

    /* Builtin functions */
    double d_imag(doublecomplex *);
    void z_sqrt(doublecomplex *, doublecomplex *), z_div(doublecomplex *, 
	    doublecomplex *, doublecomplex *);

    /* Local variables */
    doublereal c__;
    doublecomplex d__;
    integer i__, j, k, l, m;
    doublereal r__;
    doublecomplex s, w, y, z__;
    doublereal d0, d1, d2, e0, e1;
    integer l1, lb, mb, nl, nn;
    doublecomplex sl;
    doublereal ss;
    integer nm1;
    doublecomplex den;
    doublereal ani, bni;
    doublecomplex num;
    integer its, lor1;
    doublecomplex alfm, betm;
    doublereal epsa, epsb;
    doublecomplex annm1, anm1m1;
    doublereal anorm, bnorm;
    integer nnorn;

/* THIS SUBROUTINE SOLVES THE GENERALIZED EIGENVALUE PROBLEM */
/*              A X  = LAMBDA B X */
/* WHERE A IS A COMPLEX UPPER HESSENBERG MATRIX OF */
/* ORDER N AND B IS A COMPLEX UPPER TRIANGULAR MATRIX OF ORDER N */
/* INPUT PARAMETERS */
/* N      ORDER OF A AND B */
/* A      AN N X N UPPER HESSENBERG COMPLEX MATRIX */
/* NA     THE ROW DIMENSION OF THE A MATRIX */
/* B      AN N X N UPPER TRIANGULAR COMPLEX MATRIX */
/* NB     THE ROW DIMENSION OF THE B MATRIX */
/* X      CONTAINS TRANSFORMATIONS TO OBTAIN EIGENVECTORS OF */
/*        ORIGINAL SYSTEM. IF EIGENVECTORS ARE REQUESTED AND QZHES */
/*        IS NOT CALLED, X SHOULD BE SET TO THE IDENTITY MATRIX */
/* NX     THE ROW DIMENSION OF THE X MATRIX */
/* WANTX  LOGICAL VARIABLE WHICH SHOULD BE SET TO .TRUE. */
/*        IF EIGENVECTORS ARE WANTED. OTHERWISE IT */
/*        SHOULD BE SET TO .FALSE. */
/* OUTPUT PARAMETERS */
/* X      THE ITH COLUMN CONTAINS THE ITH EIGENVECTOR */
/*        IF EIGENVECTORS ARE REQUESTED */
/* ITER   AN INTEGER ARRAY OF LENGTH N WHOSE ITH ENTRY */
/*        CONTAINS THE NUMBER OF ITERATIONS NEEDED TO FIND */
/*        THE ITH EIGENVALUE. FOR ANY I IF ITER(I) =-1 THEN */
/*        AFTER 30 ITERATIONS THERE HAS NOT BEEN A SUFFICIENT */
/*        DECREASE IN THE LAST SUBDIAGONAL ELEMENT OF A */
/*        TO CONTINUE ITERATING. */
/* EIGA   A COMPLEX ARRAY OF LENGTH N CONTAINING THE DIAGONAL OF A */
/* EIGB   A COMPLEX ARRAY OF LENGTH N CONTAINING THE DIAGONAL OF B */
/* THE ITH EIGENVALUE CAN BE FOUND BY DIVIDING EIGA(I) BY */
/* EIGB(I). WATCH OUT FOR EIGB(I) BEING ZERO */
    /* Parameter adjustments */
    --eigb;
    --eiga;
    --iter;
    a_dim1 = *na;
    a_offset = 1 + a_dim1;
    a -= a_offset;
    b_dim1 = *nb;
    b_offset = 1 + b_dim1;
    b -= b_offset;
    x_dim1 = *nx;
    x_offset = 1 + x_dim1;
    x -= x_offset;

    /* Function Body */
    nn = *n;
/* COMPUTE THE MACHINE PRECISION TIMES THE NORM OF A AND B */
    anorm = 0.;
    bnorm = 0.;
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	ani = 0.;
	if (i__ == 1) {
	    goto L10;
	}
	i__2 = i__ + (i__ - 1) * a_dim1;
	y.r = a[i__2].r, y.i = a[i__2].i;
	ani = ani + (d__1 = y.r, abs(d__1)) + (d__2 = d_imag(&y), abs(d__2));
L10:
	bni = 0.;
	i__2 = *n;
	for (j = i__; j <= i__2; ++j) {
	    i__3 = i__ + j * a_dim1;
	    ani = ani + (d__1 = a[i__3].r, abs(d__1)) + (d__2 = d_imag(&a[i__ 
		    + j * a_dim1]), abs(d__2));
	    i__3 = i__ + j * b_dim1;
	    bni = bni + (d__1 = b[i__3].r, abs(d__1)) + (d__2 = d_imag(&b[i__ 
		    + j * b_dim1]), abs(d__2));
/* L20: */
	}
	if (ani > anorm) {
	    anorm = ani;
	}
	if (bni > bnorm) {
	    bnorm = bni;
	}
/* L30: */
    }
    if (anorm == 0.) {
	anorm = 1.;
    }
    if (bnorm == 0.) {
	bnorm = 1.;
    }
    epsb = bnorm;
    epsa = anorm;
L40:
    epsa /= 2.;
    epsb /= 2.;
    c__ = anorm + epsa;
    if (c__ > anorm) {
	goto L40;
    }
    if (*n <= 1) {
	goto L320;
    }
L50:
    its = 0;
    nm1 = nn - 1;
/* CHECK FOR NEGLIGIBLE SUBDIAGONAL ELEMENTS */
L60:
    i__1 = nn + nn * a_dim1;
    d2 = (d__1 = a[i__1].r, abs(d__1)) + (d__2 = d_imag(&a[nn + nn * a_dim1]),
	     abs(d__2));
    i__1 = nn;
    for (lb = 2; lb <= i__1; ++lb) {
	l = nn + 2 - lb;
	ss = d2;
	i__2 = l - 1 + (l - 1) * a_dim1;
	y.r = a[i__2].r, y.i = a[i__2].i;
	d2 = (d__1 = y.r, abs(d__1)) + (d__2 = d_imag(&y), abs(d__2));
	ss += d2;
	i__2 = l + (l - 1) * a_dim1;
	y.r = a[i__2].r, y.i = a[i__2].i;
	r__ = ss + (d__1 = y.r, abs(d__1)) + (d__2 = d_imag(&y), abs(d__2));
	if (r__ == ss) {
	    goto L80;
	}
/* L70: */
    }
    l = 1;
L80:
    if (l == nn) {
	goto L320;
    }
    if (its < 30) {
	goto L90;
    }
    iter[nn] = -1;
    i__1 = nn + nm1 * a_dim1;
    if ((d__1 = a[i__1].r, abs(d__1)) + (d__2 = d_imag(&a[nn + nm1 * a_dim1]),
	     abs(d__2)) > (d__3 = annm1.r, abs(d__3)) * .8 + (d__4 = d_imag(&
	    annm1), abs(d__4))) {
	return 0;
    }
L90:
    if (its == 10 || its == 20) {
	goto L110;
    }
/* COMPUTE SHIFT AS EIGENVALUE OF LOWER 2 BY 2 */
    i__1 = nn + nm1 * a_dim1;
    annm1.r = a[i__1].r, annm1.i = a[i__1].i;
    i__1 = nm1 + nm1 * a_dim1;
    anm1m1.r = a[i__1].r, anm1m1.i = a[i__1].i;
    i__1 = nn + nn * a_dim1;
    i__2 = nm1 + nm1 * b_dim1;
    z__2.r = a[i__1].r * b[i__2].r - a[i__1].i * b[i__2].i, z__2.i = a[i__1]
	    .r * b[i__2].i + a[i__1].i * b[i__2].r;
    i__3 = nm1 + nn * b_dim1;
    z__3.r = annm1.r * b[i__3].r - annm1.i * b[i__3].i, z__3.i = annm1.r * b[
	    i__3].i + annm1.i * b[i__3].r;
    z__1.r = z__2.r - z__3.r, z__1.i = z__2.i - z__3.i;
    s.r = z__1.r, s.i = z__1.i;
    i__1 = nn + nn * b_dim1;
    z__2.r = annm1.r * b[i__1].r - annm1.i * b[i__1].i, z__2.i = annm1.r * b[
	    i__1].i + annm1.i * b[i__1].r;
    i__2 = nm1 + nn * a_dim1;
    i__3 = nm1 + nm1 * b_dim1;
    z__4.r = a[i__2].r * b[i__3].r - a[i__2].i * b[i__3].i, z__4.i = a[i__2]
	    .r * b[i__3].i + a[i__2].i * b[i__3].r;
    i__4 = nm1 + nn * b_dim1;
    z__5.r = b[i__4].r * anm1m1.r - b[i__4].i * anm1m1.i, z__5.i = b[i__4].r *
	     anm1m1.i + b[i__4].i * anm1m1.r;
    z__3.r = z__4.r - z__5.r, z__3.i = z__4.i - z__5.i;
    z__1.r = z__2.r * z__3.r - z__2.i * z__3.i, z__1.i = z__2.r * z__3.i + 
	    z__2.i * z__3.r;
    w.r = z__1.r, w.i = z__1.i;
    i__1 = nn + nn * b_dim1;
    z__3.r = anm1m1.r * b[i__1].r - anm1m1.i * b[i__1].i, z__3.i = anm1m1.r * 
	    b[i__1].i + anm1m1.i * b[i__1].r;
    z__2.r = z__3.r - s.r, z__2.i = z__3.i - s.i;
    z__1.r = z__2.r / 2.f, z__1.i = z__2.i / 2.f;
    y.r = z__1.r, y.i = z__1.i;
    z__3.r = y.r * y.r - y.i * y.i, z__3.i = y.r * y.i + y.i * y.r;
    z__2.r = z__3.r + w.r, z__2.i = z__3.i + w.i;
    z_sqrt(&z__1, &z__2);
    z__.r = z__1.r, z__.i = z__1.i;
    if (z__.r == 0. && d_imag(&z__) == 0.) {
	goto L100;
    }
    z_div(&z__1, &y, &z__);
    d0 = z__1.r;
    if (d0 < 0.) {
	z__1.r = -z__.r, z__1.i = -z__.i;
	z__.r = z__1.r, z__.i = z__1.i;
    }
L100:
    z__3.r = y.r + z__.r, z__3.i = y.i + z__.i;
    i__1 = nm1 + nm1 * b_dim1;
    z__2.r = z__3.r * b[i__1].r - z__3.i * b[i__1].i, z__2.i = z__3.r * b[
	    i__1].i + z__3.i * b[i__1].r;
    i__2 = nn + nn * b_dim1;
    z__1.r = z__2.r * b[i__2].r - z__2.i * b[i__2].i, z__1.i = z__2.r * b[
	    i__2].i + z__2.i * b[i__2].r;
    den.r = z__1.r, den.i = z__1.i;
    if (den.r == 0. && d_imag(&den) == 0.) {
	z__1.r = epsa, z__1.i = 0.;
	den.r = z__1.r, den.i = z__1.i;
    }
    z__3.r = y.r + z__.r, z__3.i = y.i + z__.i;
    z__2.r = z__3.r * s.r - z__3.i * s.i, z__2.i = z__3.r * s.i + z__3.i * 
	    s.r;
    z__1.r = z__2.r - w.r, z__1.i = z__2.i - w.i;
    num.r = z__1.r, num.i = z__1.i;
    goto L120;
/* AD-HOC SHIFT */
L110:
    i__1 = nm1 + (nn - 2) * a_dim1;
    y.r = a[i__1].r, y.i = a[i__1].i;
    d__5 = (d__1 = annm1.r, abs(d__1)) + (d__2 = d_imag(&annm1), abs(d__2));
    d__6 = (d__3 = y.r, abs(d__3)) + (d__4 = d_imag(&y), abs(d__4));
    z__1.r = d__5, z__1.i = d__6;
    num.r = z__1.r, num.i = z__1.i;
    den.r = 1., den.i = 0.;
/* CHECK FOR 2 CONSECUTIVE SMALL SUBDIAGONAL ELEMENTS */
L120:
    if (nn == l + 1) {
	goto L140;
    }
    i__1 = nm1 + nm1 * a_dim1;
    d2 = (d__1 = a[i__1].r, abs(d__1)) + (d__2 = d_imag(&a[nm1 + nm1 * a_dim1]
	    ), abs(d__2));
    e1 = (d__1 = annm1.r, abs(d__1)) + (d__2 = d_imag(&annm1), abs(d__2));
    i__1 = nn + nn * a_dim1;
    d1 = (d__1 = a[i__1].r, abs(d__1)) + (d__2 = d_imag(&a[nn + nn * a_dim1]),
	     abs(d__2));
    nl = nn - (l + 1);
    i__1 = nl;
    for (mb = 1; mb <= i__1; ++mb) {
	m = nn - mb;
	e0 = e1;
	i__2 = m + (m - 1) * a_dim1;
	y.r = a[i__2].r, y.i = a[i__2].i;
	e1 = (d__1 = y.r, abs(d__1)) + (d__2 = d_imag(&y), abs(d__2));
	d0 = d1;
	d1 = d2;
	i__2 = m - 1 + (m - 1) * a_dim1;
	y.r = a[i__2].r, y.i = a[i__2].i;
	d2 = (d__1 = y.r, abs(d__1)) + (d__2 = d_imag(&y), abs(d__2));
	i__2 = m + m * a_dim1;
	z__2.r = a[i__2].r * den.r - a[i__2].i * den.i, z__2.i = a[i__2].r * 
		den.i + a[i__2].i * den.r;
	i__3 = m + m * b_dim1;
	z__3.r = b[i__3].r * num.r - b[i__3].i * num.i, z__3.i = b[i__3].r * 
		num.i + b[i__3].i * num.r;
	z__1.r = z__2.r - z__3.r, z__1.i = z__2.i - z__3.i;
	y.r = z__1.r, y.i = z__1.i;
	d0 = (d0 + d1 + d2) * ((d__1 = y.r, abs(d__1)) + (d__2 = d_imag(&y), 
		abs(d__2)));
	e0 = e0 * e1 * ((d__1 = den.r, abs(d__1)) + (d__2 = d_imag(&den), abs(
		d__2))) + d0;
	if (e0 == d0) {
	    goto L150;
	}
/* L130: */
    }
L140:
    m = l;
L150:
    ++its;
    i__1 = m + m * a_dim1;
    z__2.r = a[i__1].r * den.r - a[i__1].i * den.i, z__2.i = a[i__1].r * 
	    den.i + a[i__1].i * den.r;
    i__2 = m + m * b_dim1;
    z__3.r = b[i__2].r * num.r - b[i__2].i * num.i, z__3.i = b[i__2].r * 
	    num.i + b[i__2].i * num.r;
    z__1.r = z__2.r - z__3.r, z__1.i = z__2.i - z__3.i;
    w.r = z__1.r, w.i = z__1.i;
    i__1 = m + 1 + m * a_dim1;
    z__1.r = a[i__1].r * den.r - a[i__1].i * den.i, z__1.i = a[i__1].r * 
	    den.i + a[i__1].i * den.r;
    z__.r = z__1.r, z__.i = z__1.i;
    d1 = (d__1 = z__.r, abs(d__1)) + (d__2 = d_imag(&z__), abs(d__2));
    d2 = (d__1 = w.r, abs(d__1)) + (d__2 = d_imag(&w), abs(d__2));
/* FIND L AND M AND SET A=LAM AND B=LBM */
/*     NP1 = N + 1 */
    lor1 = l;
    nnorn = nn;
    if (! (*wantx)) {
	goto L160;
    }
    lor1 = 1;
    nnorn = *n;
L160:
    i__1 = nm1;
    for (i__ = m; i__ <= i__1; ++i__) {
	j = i__ + 1;
/* FIND ROW TRANSFORMATIONS TO RESTORE A TO */
/* UPPER HESSENBERG FORM. APPLY TRANSFORMATIONS */
/* TO A AND B */
	if (i__ == m) {
	    goto L170;
	}
	i__2 = i__ + (i__ - 1) * a_dim1;
	w.r = a[i__2].r, w.i = a[i__2].i;
	i__2 = j + (i__ - 1) * a_dim1;
	z__.r = a[i__2].r, z__.i = a[i__2].i;
	d1 = (d__1 = z__.r, abs(d__1)) + (d__2 = d_imag(&z__), abs(d__2));
	d2 = (d__1 = w.r, abs(d__1)) + (d__2 = d_imag(&w), abs(d__2));
	if (d1 == 0.) {
	    goto L60;
	}
L170:
	if (d2 > d1) {
	    goto L190;
	}
/* MUST INTERCHANGE ROWS */
	i__2 = nnorn;
	for (k = i__; k <= i__2; ++k) {
	    i__3 = i__ + k * a_dim1;
	    y.r = a[i__3].r, y.i = a[i__3].i;
	    i__3 = i__ + k * a_dim1;
	    i__4 = j + k * a_dim1;
	    a[i__3].r = a[i__4].r, a[i__3].i = a[i__4].i;
	    i__3 = j + k * a_dim1;
	    a[i__3].r = y.r, a[i__3].i = y.i;
	    i__3 = i__ + k * b_dim1;
	    y.r = b[i__3].r, y.i = b[i__3].i;
	    i__3 = i__ + k * b_dim1;
	    i__4 = j + k * b_dim1;
	    b[i__3].r = b[i__4].r, b[i__3].i = b[i__4].i;
	    i__3 = j + k * b_dim1;
	    b[i__3].r = y.r, b[i__3].i = y.i;
/* L180: */
	}
	if (i__ > m) {
	    i__2 = i__ + (i__ - 1) * a_dim1;
	    i__3 = j + (i__ - 1) * a_dim1;
	    a[i__2].r = a[i__3].r, a[i__2].i = a[i__3].i;
	}
	if (d2 == 0.) {
	    goto L220;
	}
/* THE SCALING OF W AND Z IS DESIGNED TO AVOID A DIVISION BY ZERO */
/* WHEN THE DENOMINATOR IS SMALL */
	d__1 = w.r / d1;
	d__2 = d_imag(&w) / d1;
	z__2.r = d__1, z__2.i = d__2;
	d__3 = z__.r / d1;
	d__4 = d_imag(&z__) / d1;
	z__3.r = d__3, z__3.i = d__4;
	z_div(&z__1, &z__2, &z__3);
	y.r = z__1.r, y.i = z__1.i;
	goto L200;
L190:
	d__1 = z__.r / d2;
	d__2 = d_imag(&z__) / d2;
	z__2.r = d__1, z__2.i = d__2;
	d__3 = w.r / d2;
	d__4 = d_imag(&w) / d2;
	z__3.r = d__3, z__3.i = d__4;
	z_div(&z__1, &z__2, &z__3);
	y.r = z__1.r, y.i = z__1.i;
L200:
	i__2 = nnorn;
	for (k = i__; k <= i__2; ++k) {
	    i__3 = j + k * a_dim1;
	    i__4 = j + k * a_dim1;
	    i__5 = i__ + k * a_dim1;
	    z__2.r = y.r * a[i__5].r - y.i * a[i__5].i, z__2.i = y.r * a[i__5]
		    .i + y.i * a[i__5].r;
	    z__1.r = a[i__4].r - z__2.r, z__1.i = a[i__4].i - z__2.i;
	    a[i__3].r = z__1.r, a[i__3].i = z__1.i;
	    i__3 = j + k * b_dim1;
	    i__4 = j + k * b_dim1;
	    i__5 = i__ + k * b_dim1;
	    z__2.r = y.r * b[i__5].r - y.i * b[i__5].i, z__2.i = y.r * b[i__5]
		    .i + y.i * b[i__5].r;
	    z__1.r = b[i__4].r - z__2.r, z__1.i = b[i__4].i - z__2.i;
	    b[i__3].r = z__1.r, b[i__3].i = z__1.i;
/* L210: */
	}
L220:
	if (i__ > m) {
	    i__2 = j + (i__ - 1) * a_dim1;
	    a[i__2].r = 0., a[i__2].i = 0.;
	}
/* PERFORM TRANSFORMATIONS FROM RIGHT TO RESTORE B TO */
/*   TRIANGLULAR FORM */
/* APPLY TRANSFORMATIONS TO A */
	i__2 = j + i__ * b_dim1;
	z__.r = b[i__2].r, z__.i = b[i__2].i;
	i__2 = j + j * b_dim1;
	w.r = b[i__2].r, w.i = b[i__2].i;
	d2 = (d__1 = w.r, abs(d__1)) + (d__2 = d_imag(&w), abs(d__2));
	d1 = (d__1 = z__.r, abs(d__1)) + (d__2 = d_imag(&z__), abs(d__2));
	if (d1 == 0.) {
	    goto L60;
	}
	if (d2 > d1) {
	    goto L270;
	}
/* MUST INTERCHANGE COLUMNS */
	i__2 = j;
	for (k = lor1; k <= i__2; ++k) {
	    i__3 = k + j * a_dim1;
	    y.r = a[i__3].r, y.i = a[i__3].i;
	    i__3 = k + j * a_dim1;
	    i__4 = k + i__ * a_dim1;
	    a[i__3].r = a[i__4].r, a[i__3].i = a[i__4].i;
	    i__3 = k + i__ * a_dim1;
	    a[i__3].r = y.r, a[i__3].i = y.i;
	    i__3 = k + j * b_dim1;
	    y.r = b[i__3].r, y.i = b[i__3].i;
	    i__3 = k + j * b_dim1;
	    i__4 = k + i__ * b_dim1;
	    b[i__3].r = b[i__4].r, b[i__3].i = b[i__4].i;
	    i__3 = k + i__ * b_dim1;
	    b[i__3].r = y.r, b[i__3].i = y.i;
/* L230: */
	}
	if (i__ == nm1) {
	    goto L240;
	}
	i__2 = j + 1 + j * a_dim1;
	y.r = a[i__2].r, y.i = a[i__2].i;
	i__2 = j + 1 + j * a_dim1;
	i__3 = j + 1 + i__ * a_dim1;
	a[i__2].r = a[i__3].r, a[i__2].i = a[i__3].i;
	i__2 = j + 1 + i__ * a_dim1;
	a[i__2].r = y.r, a[i__2].i = y.i;
L240:
	if (! (*wantx)) {
	    goto L260;
	}
	i__2 = *n;
	for (k = 1; k <= i__2; ++k) {
	    i__3 = k + j * x_dim1;
	    y.r = x[i__3].r, y.i = x[i__3].i;
	    i__3 = k + j * x_dim1;
	    i__4 = k + i__ * x_dim1;
	    x[i__3].r = x[i__4].r, x[i__3].i = x[i__4].i;
	    i__3 = k + i__ * x_dim1;
	    x[i__3].r = y.r, x[i__3].i = y.i;
/* L250: */
	}
L260:
	if (d2 == 0.) {
	    goto L310;
	}
	d__1 = w.r / d1;
	d__2 = d_imag(&w) / d1;
	z__2.r = d__1, z__2.i = d__2;
	d__3 = z__.r / d1;
	d__4 = d_imag(&z__) / d1;
	z__3.r = d__3, z__3.i = d__4;
	z_div(&z__1, &z__2, &z__3);
	z__.r = z__1.r, z__.i = z__1.i;
	goto L280;
L270:
	d__1 = z__.r / d2;
	d__2 = d_imag(&z__) / d2;
	z__2.r = d__1, z__2.i = d__2;
	d__3 = w.r / d2;
	d__4 = d_imag(&w) / d2;
	z__3.r = d__3, z__3.i = d__4;
	z_div(&z__1, &z__2, &z__3);
	z__.r = z__1.r, z__.i = z__1.i;
L280:
	i__2 = j;
	for (k = lor1; k <= i__2; ++k) {
	    i__3 = k + i__ * a_dim1;
	    i__4 = k + i__ * a_dim1;
	    i__5 = k + j * a_dim1;
	    z__2.r = z__.r * a[i__5].r - z__.i * a[i__5].i, z__2.i = z__.r * 
		    a[i__5].i + z__.i * a[i__5].r;
	    z__1.r = a[i__4].r - z__2.r, z__1.i = a[i__4].i - z__2.i;
	    a[i__3].r = z__1.r, a[i__3].i = z__1.i;
	    i__3 = k + i__ * b_dim1;
	    i__4 = k + i__ * b_dim1;
	    i__5 = k + j * b_dim1;
	    z__2.r = z__.r * b[i__5].r - z__.i * b[i__5].i, z__2.i = z__.r * 
		    b[i__5].i + z__.i * b[i__5].r;
	    z__1.r = b[i__4].r - z__2.r, z__1.i = b[i__4].i - z__2.i;
	    b[i__3].r = z__1.r, b[i__3].i = z__1.i;
/* L290: */
	}
	i__2 = j + i__ * b_dim1;
	b[i__2].r = 0., b[i__2].i = 0.;
	if (i__ < nm1) {
	    i__2 = i__ + 2 + i__ * a_dim1;
	    i__3 = i__ + 2 + i__ * a_dim1;
	    i__4 = i__ + 2 + j * a_dim1;
	    z__2.r = z__.r * a[i__4].r - z__.i * a[i__4].i, z__2.i = z__.r * 
		    a[i__4].i + z__.i * a[i__4].r;
	    z__1.r = a[i__3].r - z__2.r, z__1.i = a[i__3].i - z__2.i;
	    a[i__2].r = z__1.r, a[i__2].i = z__1.i;
	}
	if (! (*wantx)) {
	    goto L310;
	}
	i__2 = *n;
	for (k = 1; k <= i__2; ++k) {
	    i__3 = k + i__ * x_dim1;
	    i__4 = k + i__ * x_dim1;
	    i__5 = k + j * x_dim1;
	    z__2.r = z__.r * x[i__5].r - z__.i * x[i__5].i, z__2.i = z__.r * 
		    x[i__5].i + z__.i * x[i__5].r;
	    z__1.r = x[i__4].r - z__2.r, z__1.i = x[i__4].i - z__2.i;
	    x[i__3].r = z__1.r, x[i__3].i = z__1.i;
/* L300: */
	}
L310:
	;
    }
    goto L60;
L320:
    i__1 = nn;
    i__2 = nn + nn * a_dim1;
    eiga[i__1].r = a[i__2].r, eiga[i__1].i = a[i__2].i;
    i__1 = nn;
    i__2 = nn + nn * b_dim1;
    eigb[i__1].r = b[i__2].r, eigb[i__1].i = b[i__2].i;
    if (nn == 1) {
	goto L330;
    }
    iter[nn] = its;
    nn = nm1;
    if (nn > 1) {
	goto L50;
    }
    iter[1] = 0;
    goto L320;
/* FIND EIGENVECTORS USING B FOR INTERMEDIATE STORAGE */
L330:
    if (! (*wantx)) {
	return 0;
    }
    m = *n;
L340:
    i__1 = m + m * a_dim1;
    alfm.r = a[i__1].r, alfm.i = a[i__1].i;
    i__1 = m + m * b_dim1;
    betm.r = b[i__1].r, betm.i = b[i__1].i;
    i__1 = m + m * b_dim1;
    b[i__1].r = 1., b[i__1].i = 0.;
    l = m - 1;
    if (l == 0) {
	goto L370;
    }
L350:
    l1 = l + 1;
    sl.r = 0., sl.i = 0.;
    i__1 = m;
    for (j = l1; j <= i__1; ++j) {
	i__2 = l + j * a_dim1;
	z__4.r = betm.r * a[i__2].r - betm.i * a[i__2].i, z__4.i = betm.r * a[
		i__2].i + betm.i * a[i__2].r;
	i__3 = l + j * b_dim1;
	z__5.r = alfm.r * b[i__3].r - alfm.i * b[i__3].i, z__5.i = alfm.r * b[
		i__3].i + alfm.i * b[i__3].r;
	z__3.r = z__4.r - z__5.r, z__3.i = z__4.i - z__5.i;
	i__4 = j + m * b_dim1;
	z__2.r = z__3.r * b[i__4].r - z__3.i * b[i__4].i, z__2.i = z__3.r * b[
		i__4].i + z__3.i * b[i__4].r;
	z__1.r = sl.r + z__2.r, z__1.i = sl.i + z__2.i;
	sl.r = z__1.r, sl.i = z__1.i;
/* L360: */
    }
    i__1 = l + l * a_dim1;
    z__2.r = betm.r * a[i__1].r - betm.i * a[i__1].i, z__2.i = betm.r * a[
	    i__1].i + betm.i * a[i__1].r;
    i__2 = l + l * b_dim1;
    z__3.r = alfm.r * b[i__2].r - alfm.i * b[i__2].i, z__3.i = alfm.r * b[
	    i__2].i + alfm.i * b[i__2].r;
    z__1.r = z__2.r - z__3.r, z__1.i = z__2.i - z__3.i;
    y.r = z__1.r, y.i = z__1.i;
    if (y.r == 0. && d_imag(&y) == 0.) {
	d__1 = (epsa + epsb) / 2.;
	z__1.r = d__1, z__1.i = 0.;
	y.r = z__1.r, y.i = z__1.i;
    }
    i__1 = l + m * b_dim1;
    z__2.r = -sl.r, z__2.i = -sl.i;
    z_div(&z__1, &z__2, &y);
    b[i__1].r = z__1.r, b[i__1].i = z__1.i;
    --l;
L370:
    if (l > 0) {
	goto L350;
    }
    --m;
    if (m > 0) {
	goto L340;
    }
/* TRANSFORM TO ORIGINAL COORDINATE SYSTEM */
    m = *n;
L380:
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	s.r = 0., s.i = 0.;
	i__2 = m;
	for (j = 1; j <= i__2; ++j) {
	    i__3 = i__ + j * x_dim1;
	    i__4 = j + m * b_dim1;
	    z__2.r = x[i__3].r * b[i__4].r - x[i__3].i * b[i__4].i, z__2.i = 
		    x[i__3].r * b[i__4].i + x[i__3].i * b[i__4].r;
	    z__1.r = s.r + z__2.r, z__1.i = s.i + z__2.i;
	    s.r = z__1.r, s.i = z__1.i;
/* L390: */
	}
	i__2 = i__ + m * x_dim1;
	x[i__2].r = s.r, x[i__2].i = s.i;
/* L400: */
    }
    --m;
    if (m > 0) {
	goto L380;
    }
/* NORMALIZE SO THAT LARGEST COMPONENT = 1. */
    m = *n;
L410:
    ss = 0.;
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	i__2 = i__ + m * x_dim1;
	r__ = (d__1 = x[i__2].r, abs(d__1)) + (d__2 = d_imag(&x[i__ + m * 
		x_dim1]), abs(d__2));
	if (r__ < ss) {
	    goto L420;
	}
	ss = r__;
	i__2 = i__ + m * x_dim1;
	d__.r = x[i__2].r, d__.i = x[i__2].i;
L420:
	;
    }
    if (ss == 0.) {
	goto L440;
    }
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	i__2 = i__ + m * x_dim1;
	z_div(&z__1, &x[i__ + m * x_dim1], &d__);
	x[i__2].r = z__1.r, x[i__2].i = z__1.i;
/* L430: */
    }
L440:
    --m;
    if (m > 0) {
	goto L410;
    }
    return 0;
} /* dlzit_ */

