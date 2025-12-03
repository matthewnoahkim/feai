/* rectcylexp.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int rectcylexp_(doublereal *co, doublereal *v, doublereal *
	fn, doublereal *stn, doublereal *qfn, doublereal *een, doublereal *cs,
	 integer *nkt, integer *icntrl, doublereal *t, char *filab, integer *
	imag, integer *mi, integer *iznode, integer *nznode, integer *
	nsectors, integer *nk, doublereal *emn, ftnlen filab_len)
{
    /* System generated locals */
    integer v_dim1, v_offset, fn_dim1, fn_offset, i__1, i__2;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    doublereal a[9]	/* was [3][3] */, b[9]	/* was [3][3] */;
    integer i__, j, ii, jj;
    doublereal xr, xt, xz, csab[7];
    integer node;
    extern /* Subroutine */ int transformatrix_(doublereal *, doublereal *, 
	    doublereal *);


/*     special version of routine rectcyl for use in expand.c */

/*     icntrl=2:  rectangular to cylindrical coordinates for fields */
/*                v,fn,stn, een and emn */
/*     icntrl=-2: cylindrical to rectangular coordinates for fields */
/*                v,fn,stn, een and emn */

/*     for icntrl=2 the imaginary part is extra taken into account if */
/*     imag=1 */

/*     nk: number of nodes in one segment */
/*     nkt: number of nodes in 360 */



    /* Parameter adjustments */
    co -= 4;
    stn -= 7;
    qfn -= 4;
    een -= 7;
    cs -= 18;
    --t;
    filab -= 87;
    --mi;
    fn_dim1 = mi[2] - 0 + 1;
    fn_offset = 0 + fn_dim1;
    fn -= fn_offset;
    v_dim1 = mi[2] - 0 + 1;
    v_offset = 0 + v_dim1;
    v -= v_offset;
    --iznode;
    emn -= 7;

    /* Function Body */
    for (i__ = 1; i__ <= 7; ++i__) {
	csab[i__ - 1] = cs[i__ + 22];
    }

    if (*icntrl == 2) {
	i__1 = *nznode;
	for (ii = 1; ii <= i__1; ++ii) {
	    i__ = iznode[ii];
	    j = i__;
	    transformatrix_(csab, &co[i__ * 3 + 1], a);

	    if (s_cmp(filab + 87, "U  ", (ftnlen)3, (ftnlen)3) == 0 || s_cmp(
		    filab + 957, "PU", (ftnlen)4, (ftnlen)2) == 0) {
		xr = v[j * v_dim1 + 1] * a[0] + v[j * v_dim1 + 2] * a[1] + v[
			j * v_dim1 + 3] * a[2];
		xt = v[j * v_dim1 + 1] * a[3] + v[j * v_dim1 + 2] * a[4] + v[
			j * v_dim1 + 3] * a[5];
		xz = v[j * v_dim1 + 1] * a[6] + v[j * v_dim1 + 2] * a[7] + v[
			j * v_dim1 + 3] * a[8];
		v[j * v_dim1 + 1] = xr;
		v[j * v_dim1 + 2] = xt;
		v[j * v_dim1 + 3] = xz;
	    }

	    if (s_cmp(filab + 261, "S   ", (ftnlen)4, (ftnlen)4) == 0 || 
		    s_cmp(filab + 1566, "PHS ", (ftnlen)4, (ftnlen)4) == 0) {
		b[0] = stn[j * 6 + 1] * a[0] + stn[j * 6 + 4] * a[1] + stn[j *
			 6 + 5] * a[2];
		b[3] = stn[j * 6 + 1] * a[3] + stn[j * 6 + 4] * a[4] + stn[j *
			 6 + 5] * a[5];
		b[6] = stn[j * 6 + 1] * a[6] + stn[j * 6 + 4] * a[7] + stn[j *
			 6 + 5] * a[8];
		b[1] = stn[j * 6 + 4] * a[0] + stn[j * 6 + 2] * a[1] + stn[j *
			 6 + 6] * a[2];
		b[4] = stn[j * 6 + 4] * a[3] + stn[j * 6 + 2] * a[4] + stn[j *
			 6 + 6] * a[5];
		b[7] = stn[j * 6 + 4] * a[6] + stn[j * 6 + 2] * a[7] + stn[j *
			 6 + 6] * a[8];
		b[2] = stn[j * 6 + 5] * a[0] + stn[j * 6 + 6] * a[1] + stn[j *
			 6 + 3] * a[2];
		b[5] = stn[j * 6 + 5] * a[3] + stn[j * 6 + 6] * a[4] + stn[j *
			 6 + 3] * a[5];
		b[8] = stn[j * 6 + 5] * a[6] + stn[j * 6 + 6] * a[7] + stn[j *
			 6 + 3] * a[8];

		stn[j * 6 + 1] = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
		stn[j * 6 + 2] = a[3] * b[3] + a[4] * b[4] + a[5] * b[5];
		stn[j * 6 + 3] = a[6] * b[6] + a[7] * b[7] + a[8] * b[8];
		stn[j * 6 + 4] = a[0] * b[3] + a[1] * b[4] + a[2] * b[5];
		stn[j * 6 + 5] = a[0] * b[6] + a[1] * b[7] + a[2] * b[8];
		stn[j * 6 + 6] = a[3] * b[6] + a[4] * b[7] + a[5] * b[8];
	    }

	    if (s_cmp(filab + 348, "E   ", (ftnlen)4, (ftnlen)4) == 0) {
		b[0] = een[j * 6 + 1] * a[0] + een[j * 6 + 4] * a[1] + een[j *
			 6 + 5] * a[2];
		b[3] = een[j * 6 + 1] * a[3] + een[j * 6 + 4] * a[4] + een[j *
			 6 + 5] * a[5];
		b[6] = een[j * 6 + 1] * a[6] + een[j * 6 + 4] * a[7] + een[j *
			 6 + 5] * a[8];
		b[1] = een[j * 6 + 4] * a[0] + een[j * 6 + 2] * a[1] + een[j *
			 6 + 6] * a[2];
		b[4] = een[j * 6 + 4] * a[3] + een[j * 6 + 2] * a[4] + een[j *
			 6 + 6] * a[5];
		b[7] = een[j * 6 + 4] * a[6] + een[j * 6 + 2] * a[7] + een[j *
			 6 + 6] * a[8];
		b[2] = een[j * 6 + 5] * a[0] + een[j * 6 + 6] * a[1] + een[j *
			 6 + 3] * a[2];
		b[5] = een[j * 6 + 5] * a[3] + een[j * 6 + 6] * a[4] + een[j *
			 6 + 3] * a[5];
		b[8] = een[j * 6 + 5] * a[6] + een[j * 6 + 6] * a[7] + een[j *
			 6 + 3] * a[8];

		een[j * 6 + 1] = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
		een[j * 6 + 2] = a[3] * b[3] + a[4] * b[4] + a[5] * b[5];
		een[j * 6 + 3] = a[6] * b[6] + a[7] * b[7] + a[8] * b[8];
		een[j * 6 + 4] = a[0] * b[3] + a[1] * b[4] + a[2] * b[5];
		een[j * 6 + 5] = a[0] * b[6] + a[1] * b[7] + a[2] * b[8];
		een[j * 6 + 6] = a[3] * b[6] + a[4] * b[7] + a[5] * b[8];
	    }

	    if (s_cmp(filab + 435, "RF  ", (ftnlen)4, (ftnlen)4) == 0) {
		xr = fn[j * fn_dim1 + 1] * a[0] + fn[j * fn_dim1 + 2] * a[1] 
			+ fn[j * fn_dim1 + 3] * a[2];
		xt = fn[j * fn_dim1 + 1] * a[3] + fn[j * fn_dim1 + 2] * a[4] 
			+ fn[j * fn_dim1 + 3] * a[5];
		xz = fn[j * fn_dim1 + 1] * a[6] + fn[j * fn_dim1 + 2] * a[7] 
			+ fn[j * fn_dim1 + 3] * a[8];
		fn[j * fn_dim1 + 1] = xr;
		fn[j * fn_dim1 + 2] = xt;
		fn[j * fn_dim1 + 3] = xz;
	    }

	    if (s_cmp(filab + 783, "HFL ", (ftnlen)4, (ftnlen)4) == 0) {
		xr = qfn[j * 3 + 1] * a[0] + qfn[j * 3 + 2] * a[1] + qfn[j * 
			3 + 3] * a[2];
		xt = qfn[j * 3 + 1] * a[3] + qfn[j * 3 + 2] * a[4] + qfn[j * 
			3 + 3] * a[5];
		xz = qfn[j * 3 + 1] * a[6] + qfn[j * 3 + 2] * a[7] + qfn[j * 
			3 + 3] * a[8];
		qfn[j * 3 + 1] = xr;
		qfn[j * 3 + 2] = xt;
		qfn[j * 3 + 3] = xz;
	    }

	    if (s_cmp(filab + 2784, "ME  ", (ftnlen)4, (ftnlen)4) == 0) {
		b[0] = emn[j * 6 + 1] * a[0] + emn[j * 6 + 4] * a[1] + emn[j *
			 6 + 5] * a[2];
		b[3] = emn[j * 6 + 1] * a[3] + emn[j * 6 + 4] * a[4] + emn[j *
			 6 + 5] * a[5];
		b[6] = emn[j * 6 + 1] * a[6] + emn[j * 6 + 4] * a[7] + emn[j *
			 6 + 5] * a[8];
		b[1] = emn[j * 6 + 4] * a[0] + emn[j * 6 + 2] * a[1] + emn[j *
			 6 + 6] * a[2];
		b[4] = emn[j * 6 + 4] * a[3] + emn[j * 6 + 2] * a[4] + emn[j *
			 6 + 6] * a[5];
		b[7] = emn[j * 6 + 4] * a[6] + emn[j * 6 + 2] * a[7] + emn[j *
			 6 + 6] * a[8];
		b[2] = emn[j * 6 + 5] * a[0] + emn[j * 6 + 6] * a[1] + emn[j *
			 6 + 3] * a[2];
		b[5] = emn[j * 6 + 5] * a[3] + emn[j * 6 + 6] * a[4] + emn[j *
			 6 + 3] * a[5];
		b[8] = emn[j * 6 + 5] * a[6] + emn[j * 6 + 6] * a[7] + emn[j *
			 6 + 3] * a[8];

		emn[j * 6 + 1] = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
		emn[j * 6 + 2] = a[3] * b[3] + a[4] * b[4] + a[5] * b[5];
		emn[j * 6 + 3] = a[6] * b[6] + a[7] * b[7] + a[8] * b[8];
		emn[j * 6 + 4] = a[0] * b[3] + a[1] * b[4] + a[2] * b[5];
		emn[j * 6 + 5] = a[0] * b[6] + a[1] * b[7] + a[2] * b[8];
		emn[j * 6 + 6] = a[3] * b[6] + a[4] * b[7] + a[5] * b[8];
	    }

/*           imaginary part for cyclic symmetry frequency calculations */

	    if (*imag == 1) {

		j = i__ + *nkt;

		if (s_cmp(filab + 87, "U  ", (ftnlen)3, (ftnlen)3) == 0 || 
			s_cmp(filab + 957, "PU", (ftnlen)4, (ftnlen)2) == 0) {
		    xr = v[j * v_dim1 + 1] * a[0] + v[j * v_dim1 + 2] * a[1] 
			    + v[j * v_dim1 + 3] * a[2];
		    xt = v[j * v_dim1 + 1] * a[3] + v[j * v_dim1 + 2] * a[4] 
			    + v[j * v_dim1 + 3] * a[5];
		    xz = v[j * v_dim1 + 1] * a[6] + v[j * v_dim1 + 2] * a[7] 
			    + v[j * v_dim1 + 3] * a[8];
		    v[j * v_dim1 + 1] = xr;
		    v[j * v_dim1 + 2] = xt;
		    v[j * v_dim1 + 3] = xz;
		}

		if (s_cmp(filab + 261, "S   ", (ftnlen)4, (ftnlen)4) == 0 || 
			s_cmp(filab + 1566, "PHS ", (ftnlen)4, (ftnlen)4) == 
			0) {
		    b[0] = stn[j * 6 + 1] * a[0] + stn[j * 6 + 4] * a[1] + 
			    stn[j * 6 + 5] * a[2];
		    b[3] = stn[j * 6 + 1] * a[3] + stn[j * 6 + 4] * a[4] + 
			    stn[j * 6 + 5] * a[5];
		    b[6] = stn[j * 6 + 1] * a[6] + stn[j * 6 + 4] * a[7] + 
			    stn[j * 6 + 5] * a[8];
		    b[1] = stn[j * 6 + 4] * a[0] + stn[j * 6 + 2] * a[1] + 
			    stn[j * 6 + 6] * a[2];
		    b[4] = stn[j * 6 + 4] * a[3] + stn[j * 6 + 2] * a[4] + 
			    stn[j * 6 + 6] * a[5];
		    b[7] = stn[j * 6 + 4] * a[6] + stn[j * 6 + 2] * a[7] + 
			    stn[j * 6 + 6] * a[8];
		    b[2] = stn[j * 6 + 5] * a[0] + stn[j * 6 + 6] * a[1] + 
			    stn[j * 6 + 3] * a[2];
		    b[5] = stn[j * 6 + 5] * a[3] + stn[j * 6 + 6] * a[4] + 
			    stn[j * 6 + 3] * a[5];
		    b[8] = stn[j * 6 + 5] * a[6] + stn[j * 6 + 6] * a[7] + 
			    stn[j * 6 + 3] * a[8];

		    stn[j * 6 + 1] = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
		    stn[j * 6 + 2] = a[3] * b[3] + a[4] * b[4] + a[5] * b[5];
		    stn[j * 6 + 3] = a[6] * b[6] + a[7] * b[7] + a[8] * b[8];
		    stn[j * 6 + 4] = a[0] * b[3] + a[1] * b[4] + a[2] * b[5];
		    stn[j * 6 + 5] = a[0] * b[6] + a[1] * b[7] + a[2] * b[8];
		    stn[j * 6 + 6] = a[3] * b[6] + a[4] * b[7] + a[5] * b[8];
		}

		if (s_cmp(filab + 348, "E   ", (ftnlen)4, (ftnlen)4) == 0) {
		    b[0] = een[j * 6 + 1] * a[0] + een[j * 6 + 4] * a[1] + 
			    een[j * 6 + 5] * a[2];
		    b[3] = een[j * 6 + 1] * a[3] + een[j * 6 + 4] * a[4] + 
			    een[j * 6 + 5] * a[5];
		    b[6] = een[j * 6 + 1] * a[6] + een[j * 6 + 4] * a[7] + 
			    een[j * 6 + 5] * a[8];
		    b[1] = een[j * 6 + 4] * a[0] + een[j * 6 + 2] * a[1] + 
			    een[j * 6 + 6] * a[2];
		    b[4] = een[j * 6 + 4] * a[3] + een[j * 6 + 2] * a[4] + 
			    een[j * 6 + 6] * a[5];
		    b[7] = een[j * 6 + 4] * a[6] + een[j * 6 + 2] * a[7] + 
			    een[j * 6 + 6] * a[8];
		    b[2] = een[j * 6 + 5] * a[0] + een[j * 6 + 6] * a[1] + 
			    een[j * 6 + 3] * a[2];
		    b[5] = een[j * 6 + 5] * a[3] + een[j * 6 + 6] * a[4] + 
			    een[j * 6 + 3] * a[5];
		    b[8] = een[j * 6 + 5] * a[6] + een[j * 6 + 6] * a[7] + 
			    een[j * 6 + 3] * a[8];

		    een[j * 6 + 1] = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
		    een[j * 6 + 2] = a[3] * b[3] + a[4] * b[4] + a[5] * b[5];
		    een[j * 6 + 3] = a[6] * b[6] + a[7] * b[7] + a[8] * b[8];
		    een[j * 6 + 4] = a[0] * b[3] + a[1] * b[4] + a[2] * b[5];
		    een[j * 6 + 5] = a[0] * b[6] + a[1] * b[7] + a[2] * b[8];
		    een[j * 6 + 6] = a[3] * b[6] + a[4] * b[7] + a[5] * b[8];
		}

		if (s_cmp(filab + 435, "RF  ", (ftnlen)4, (ftnlen)4) == 0) {
		    xr = fn[j * fn_dim1 + 1] * a[0] + fn[j * fn_dim1 + 2] * a[
			    1] + fn[j * fn_dim1 + 3] * a[2];
		    xt = fn[j * fn_dim1 + 1] * a[3] + fn[j * fn_dim1 + 2] * a[
			    4] + fn[j * fn_dim1 + 3] * a[5];
		    xz = fn[j * fn_dim1 + 1] * a[6] + fn[j * fn_dim1 + 2] * a[
			    7] + fn[j * fn_dim1 + 3] * a[8];
		    fn[j * fn_dim1 + 1] = xr;
		    fn[j * fn_dim1 + 2] = xt;
		    fn[j * fn_dim1 + 3] = xz;
		}

		if (s_cmp(filab + 783, "HFL ", (ftnlen)4, (ftnlen)4) == 0) {
		    xr = qfn[j * 3 + 1] * a[0] + qfn[j * 3 + 2] * a[1] + qfn[
			    j * 3 + 3] * a[2];
		    xt = qfn[j * 3 + 1] * a[3] + qfn[j * 3 + 2] * a[4] + qfn[
			    j * 3 + 3] * a[5];
		    xz = qfn[j * 3 + 1] * a[6] + qfn[j * 3 + 2] * a[7] + qfn[
			    j * 3 + 3] * a[8];
		    qfn[j * 3 + 1] = xr;
		    qfn[j * 3 + 2] = xt;
		    qfn[j * 3 + 3] = xz;
		}

		if (s_cmp(filab + 2784, "ME  ", (ftnlen)4, (ftnlen)4) == 0) {
		    b[0] = emn[j * 6 + 1] * a[0] + emn[j * 6 + 4] * a[1] + 
			    emn[j * 6 + 5] * a[2];
		    b[3] = emn[j * 6 + 1] * a[3] + emn[j * 6 + 4] * a[4] + 
			    emn[j * 6 + 5] * a[5];
		    b[6] = emn[j * 6 + 1] * a[6] + emn[j * 6 + 4] * a[7] + 
			    emn[j * 6 + 5] * a[8];
		    b[1] = emn[j * 6 + 4] * a[0] + emn[j * 6 + 2] * a[1] + 
			    emn[j * 6 + 6] * a[2];
		    b[4] = emn[j * 6 + 4] * a[3] + emn[j * 6 + 2] * a[4] + 
			    emn[j * 6 + 6] * a[5];
		    b[7] = emn[j * 6 + 4] * a[6] + emn[j * 6 + 2] * a[7] + 
			    emn[j * 6 + 6] * a[8];
		    b[2] = emn[j * 6 + 5] * a[0] + emn[j * 6 + 6] * a[1] + 
			    emn[j * 6 + 3] * a[2];
		    b[5] = emn[j * 6 + 5] * a[3] + emn[j * 6 + 6] * a[4] + 
			    emn[j * 6 + 3] * a[5];
		    b[8] = emn[j * 6 + 5] * a[6] + emn[j * 6 + 6] * a[7] + 
			    emn[j * 6 + 3] * a[8];

		    emn[j * 6 + 1] = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
		    emn[j * 6 + 2] = a[3] * b[3] + a[4] * b[4] + a[5] * b[5];
		    emn[j * 6 + 3] = a[6] * b[6] + a[7] * b[7] + a[8] * b[8];
		    emn[j * 6 + 4] = a[0] * b[3] + a[1] * b[4] + a[2] * b[5];
		    emn[j * 6 + 5] = a[0] * b[6] + a[1] * b[7] + a[2] * b[8];
		    emn[j * 6 + 6] = a[3] * b[6] + a[4] * b[7] + a[5] * b[8];
		}
	    }
	}
    } else if (*icntrl == -2) {
	i__1 = *nznode;
	for (ii = 1; ii <= i__1; ++ii) {
	    node = iznode[ii];
	    i__2 = *nsectors;
	    for (jj = 1; jj <= i__2; ++jj) {
		i__ = node + (jj - 1) * *nk;
		j = i__;
		transformatrix_(csab, &co[i__ * 3 + 1], a);

		if (s_cmp(filab + 87, "U  ", (ftnlen)3, (ftnlen)3) == 0 || 
			s_cmp(filab + 957, "PU", (ftnlen)4, (ftnlen)2) == 0) {
		    xr = v[j * v_dim1 + 1] * a[0] + v[j * v_dim1 + 2] * a[3] 
			    + v[j * v_dim1 + 3] * a[6];
		    xt = v[j * v_dim1 + 1] * a[1] + v[j * v_dim1 + 2] * a[4] 
			    + v[j * v_dim1 + 3] * a[7];
		    xz = v[j * v_dim1 + 1] * a[2] + v[j * v_dim1 + 2] * a[5] 
			    + v[j * v_dim1 + 3] * a[8];
		    v[j * v_dim1 + 1] = xr;
		    v[j * v_dim1 + 2] = xt;
		    v[j * v_dim1 + 3] = xz;
		}

		if (s_cmp(filab + 261, "S   ", (ftnlen)4, (ftnlen)4) == 0 || 
			s_cmp(filab + 1566, "PHS ", (ftnlen)4, (ftnlen)4) == 
			0) {
		    b[0] = stn[j * 6 + 1] * a[0] + stn[j * 6 + 4] * a[3] + 
			    stn[j * 6 + 5] * a[6];
		    b[3] = stn[j * 6 + 1] * a[1] + stn[j * 6 + 4] * a[4] + 
			    stn[j * 6 + 5] * a[7];
		    b[6] = stn[j * 6 + 1] * a[2] + stn[j * 6 + 4] * a[5] + 
			    stn[j * 6 + 5] * a[8];
		    b[1] = stn[j * 6 + 4] * a[0] + stn[j * 6 + 2] * a[3] + 
			    stn[j * 6 + 6] * a[6];
		    b[4] = stn[j * 6 + 4] * a[1] + stn[j * 6 + 2] * a[4] + 
			    stn[j * 6 + 6] * a[7];
		    b[7] = stn[j * 6 + 4] * a[2] + stn[j * 6 + 2] * a[5] + 
			    stn[j * 6 + 6] * a[8];
		    b[2] = stn[j * 6 + 5] * a[0] + stn[j * 6 + 6] * a[3] + 
			    stn[j * 6 + 3] * a[6];
		    b[5] = stn[j * 6 + 5] * a[1] + stn[j * 6 + 6] * a[4] + 
			    stn[j * 6 + 3] * a[7];
		    b[8] = stn[j * 6 + 5] * a[2] + stn[j * 6 + 6] * a[5] + 
			    stn[j * 6 + 3] * a[8];

		    stn[j * 6 + 1] = a[0] * b[0] + a[3] * b[1] + a[6] * b[2];
		    stn[j * 6 + 2] = a[1] * b[3] + a[4] * b[4] + a[7] * b[5];
		    stn[j * 6 + 3] = a[2] * b[6] + a[5] * b[7] + a[8] * b[8];
		    stn[j * 6 + 4] = a[0] * b[3] + a[3] * b[4] + a[6] * b[5];
		    stn[j * 6 + 5] = a[0] * b[6] + a[3] * b[7] + a[6] * b[8];
		    stn[j * 6 + 6] = a[1] * b[6] + a[4] * b[7] + a[7] * b[8];
		}

		if (s_cmp(filab + 348, "E   ", (ftnlen)4, (ftnlen)4) == 0) {
		    b[0] = een[j * 6 + 1] * a[0] + een[j * 6 + 4] * a[3] + 
			    een[j * 6 + 5] * a[6];
		    b[3] = een[j * 6 + 1] * a[1] + een[j * 6 + 4] * a[4] + 
			    een[j * 6 + 5] * a[7];
		    b[6] = een[j * 6 + 1] * a[2] + een[j * 6 + 4] * a[5] + 
			    een[j * 6 + 5] * a[8];
		    b[1] = een[j * 6 + 4] * a[0] + een[j * 6 + 2] * a[3] + 
			    een[j * 6 + 6] * a[6];
		    b[4] = een[j * 6 + 4] * a[1] + een[j * 6 + 2] * a[4] + 
			    een[j * 6 + 6] * a[7];
		    b[7] = een[j * 6 + 4] * a[2] + een[j * 6 + 2] * a[5] + 
			    een[j * 6 + 6] * a[8];
		    b[2] = een[j * 6 + 5] * a[0] + een[j * 6 + 6] * a[3] + 
			    een[j * 6 + 3] * a[6];
		    b[5] = een[j * 6 + 5] * a[1] + een[j * 6 + 6] * a[4] + 
			    een[j * 6 + 3] * a[7];
		    b[8] = een[j * 6 + 5] * a[2] + een[j * 6 + 6] * a[5] + 
			    een[j * 6 + 3] * a[8];

		    een[j * 6 + 1] = a[0] * b[0] + a[3] * b[1] + a[6] * b[2];
		    een[j * 6 + 2] = a[1] * b[3] + a[4] * b[4] + a[7] * b[5];
		    een[j * 6 + 3] = a[2] * b[6] + a[5] * b[7] + a[8] * b[8];
		    een[j * 6 + 4] = a[0] * b[3] + a[3] * b[4] + a[6] * b[5];
		    een[j * 6 + 5] = a[0] * b[6] + a[3] * b[7] + a[6] * b[8];
		    een[j * 6 + 6] = a[1] * b[6] + a[4] * b[7] + a[7] * b[8];
		}

		if (s_cmp(filab + 435, "RF  ", (ftnlen)4, (ftnlen)4) == 0) {
		    xr = fn[j * fn_dim1 + 1] * a[0] + fn[j * fn_dim1 + 2] * a[
			    3] + fn[j * fn_dim1 + 3] * a[6];
		    xt = fn[j * fn_dim1 + 1] * a[1] + fn[j * fn_dim1 + 2] * a[
			    4] + fn[j * fn_dim1 + 3] * a[7];
		    xz = fn[j * fn_dim1 + 1] * a[2] + fn[j * fn_dim1 + 2] * a[
			    5] + fn[j * fn_dim1 + 3] * a[8];
		    fn[j * fn_dim1 + 1] = xr;
		    fn[j * fn_dim1 + 2] = xt;
		    fn[j * fn_dim1 + 3] = xz;
		}

		if (s_cmp(filab + 783, "HFL ", (ftnlen)4, (ftnlen)4) == 0) {
		    xr = qfn[j * 3 + 1] * a[0] + qfn[j * 3 + 2] * a[3] + qfn[
			    j * 3 + 3] * a[6];
		    xt = qfn[j * 3 + 1] * a[1] + qfn[j * 3 + 2] * a[4] + qfn[
			    j * 3 + 3] * a[7];
		    xz = qfn[j * 3 + 1] * a[2] + qfn[j * 3 + 2] * a[5] + qfn[
			    j * 3 + 3] * a[8];
		    qfn[j * 3 + 1] = xr;
		    qfn[j * 3 + 2] = xt;
		    qfn[j * 3 + 3] = xz;
		}

		if (s_cmp(filab + 2784, "ME  ", (ftnlen)4, (ftnlen)4) == 0) {
		    b[0] = emn[j * 6 + 1] * a[0] + emn[j * 6 + 4] * a[3] + 
			    emn[j * 6 + 5] * a[6];
		    b[3] = emn[j * 6 + 1] * a[1] + emn[j * 6 + 4] * a[4] + 
			    emn[j * 6 + 5] * a[7];
		    b[6] = emn[j * 6 + 1] * a[2] + emn[j * 6 + 4] * a[5] + 
			    emn[j * 6 + 5] * a[8];
		    b[1] = emn[j * 6 + 4] * a[0] + emn[j * 6 + 2] * a[3] + 
			    emn[j * 6 + 6] * a[6];
		    b[4] = emn[j * 6 + 4] * a[1] + emn[j * 6 + 2] * a[4] + 
			    emn[j * 6 + 6] * a[7];
		    b[7] = emn[j * 6 + 4] * a[2] + emn[j * 6 + 2] * a[5] + 
			    emn[j * 6 + 6] * a[8];
		    b[2] = emn[j * 6 + 5] * a[0] + emn[j * 6 + 6] * a[3] + 
			    emn[j * 6 + 3] * a[6];
		    b[5] = emn[j * 6 + 5] * a[1] + emn[j * 6 + 6] * a[4] + 
			    emn[j * 6 + 3] * a[7];
		    b[8] = emn[j * 6 + 5] * a[2] + emn[j * 6 + 6] * a[5] + 
			    emn[j * 6 + 3] * a[8];

		    emn[j * 6 + 1] = a[0] * b[0] + a[3] * b[1] + a[6] * b[2];
		    emn[j * 6 + 2] = a[1] * b[3] + a[4] * b[4] + a[7] * b[5];
		    emn[j * 6 + 3] = a[2] * b[6] + a[5] * b[7] + a[8] * b[8];
		    emn[j * 6 + 4] = a[0] * b[3] + a[3] * b[4] + a[6] * b[5];
		    emn[j * 6 + 5] = a[0] * b[6] + a[3] * b[7] + a[6] * b[8];
		    emn[j * 6 + 6] = a[1] * b[6] + a[4] * b[7] + a[7] * b[8];
		}

	    }
	}
    }

    return 0;
} /* rectcylexp_ */

