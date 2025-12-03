/* cubic.f -- translated by f2c (version 20200916).
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
static integer c__5 = 5;
static doublereal c_b20 = .33333333333333331;
static doublereal c_b30 = .16666666666666666;


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

/* Subroutine */ int cubic_(doublereal *a0, doublereal *a1, doublereal *a2, 
	doublereal *solreal, doublereal *solimag, integer *n)
{
    /* System generated locals */
    doublereal d__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);
    double sqrt(doublereal), pow_dd(doublereal *, doublereal *), atan2(
	    doublereal, doublereal), cos(doublereal), sin(doublereal);

    /* Local variables */
    doublereal a, d__, q, r__, s1, s2, s1i, s1r, phi;

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 30, 0, 0, 0 };
    static cilist io___5 = { 0, 30, 0, 0, 0 };
    static cilist io___8 = { 0, 30, 0, 0, 0 };
    static cilist io___11 = { 0, 30, 0, 0, 0 };
    static cilist io___14 = { 0, 30, 0, 0, 0 };



/*     solves the cubic equation x**3+a2*x**2+a1*x+a0=0 */
/*     (analytical solution) */
/*     there are three solutions in C (complex plane) */
/*     the real part of the solutions is stored in solreal(1..3), */
/*     the imaginary part in solimag(1..3). The real solutions have */
/*     the lower indices, their number is n */

/*     Reference: Abramowitz, M. and Stegun, I., Handbook of */
/*     Mathematical Functions (10th printing, 1972 p 17) */




    /* Parameter adjustments */
    --solimag;
    --solreal;

    /* Function Body */
    s_wsle(&io___1);
    do_lio(&c__9, &c__1, "a2,a1,a0 ", (ftnlen)9);
    do_lio(&c__5, &c__1, (char *)&(*a2), (ftnlen)sizeof(doublereal));
    do_lio(&c__5, &c__1, (char *)&(*a1), (ftnlen)sizeof(doublereal));
    do_lio(&c__5, &c__1, (char *)&(*a0), (ftnlen)sizeof(doublereal));
    e_wsle();
    q = *a1 / 3. - *a2 * *a2 / 9.;
/* Computing 3rd power */
    d__1 = *a2;
    r__ = (*a1 * *a2 - *a0 * 3.) / 6. - d__1 * (d__1 * d__1) / 27.;

/* Computing 3rd power */
    d__1 = q;
    d__ = d__1 * (d__1 * d__1) + r__ * r__;
    s_wsle(&io___5);
    do_lio(&c__9, &c__1, "q,r,d ", (ftnlen)6);
    do_lio(&c__5, &c__1, (char *)&q, (ftnlen)sizeof(doublereal));
    do_lio(&c__5, &c__1, (char *)&r__, (ftnlen)sizeof(doublereal));
    do_lio(&c__5, &c__1, (char *)&d__, (ftnlen)sizeof(doublereal));
    e_wsle();

    if (d__ > 0.) {

/*        one real solution, two complex conjugate complex */
/*        solutions */

	*n = 1;
	d__1 = r__ + sqrt(d__);
	s1 = pow_dd(&d__1, &c_b20);
	s2 = r__ - sqrt(d__);
	if (s2 > 0.) {
	    s2 = pow_dd(&s2, &c_b20);
	} else {
	    d__1 = -s2;
	    s2 = -pow_dd(&d__1, &c_b20);
	}
	s_wsle(&io___8);
	do_lio(&c__9, &c__1, "d>0 s1,s2 ", (ftnlen)10);
	do_lio(&c__5, &c__1, (char *)&s1, (ftnlen)sizeof(doublereal));
	do_lio(&c__5, &c__1, (char *)&s2, (ftnlen)sizeof(doublereal));
	e_wsle();

	solreal[1] = s1 + s2 - *a2 / 3.;
	solreal[2] = -(s1 + s2) / 2. - *a2 / 3.;
	solreal[3] = solreal[2];

	solimag[1] = 0.;
	solimag[2] = (s1 - s2) * sqrt(3.) / 2.;
	solimag[3] = -solimag[2];
    } else {

/*        three real solutions */

	*n = 3;

/*        amplitude and phase of s1 */

	d__1 = r__ * r__ - d__;
	a = pow_dd(&d__1, &c_b30);
	phi = atan2(sqrt(-d__), r__) / 3.;
/*         phi=(datan(dsqrt(-d)/r))/3.d0 */
	s_wsle(&io___11);
	do_lio(&c__9, &c__1, "d <=0 a,phi ", (ftnlen)12);
	do_lio(&c__5, &c__1, (char *)&a, (ftnlen)sizeof(doublereal));
	do_lio(&c__5, &c__1, (char *)&phi, (ftnlen)sizeof(doublereal));
	e_wsle();

/*        real and imaginary part of s1 */

	s1r = a * cos(phi);
	s1i = a * sin(phi);
	s_wsle(&io___14);
	do_lio(&c__9, &c__1, "d >=0 s1r,s1i ", (ftnlen)14);
	do_lio(&c__5, &c__1, (char *)&s1r, (ftnlen)sizeof(doublereal));
	do_lio(&c__5, &c__1, (char *)&s1i, (ftnlen)sizeof(doublereal));
	e_wsle();

	solreal[1] = s1r * 2. - *a2 / 3.;
	solreal[2] = -s1r - *a2 / 3. - s1i * sqrt(3.);
	solreal[3] = -s1r - *a2 / 3. + s1i * sqrt(3.);

	solimag[1] = 0.;
	solimag[2] = 0.;
	solimag[3] = 0.;
    }

    return 0;
} /* cubic_ */

