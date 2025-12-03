/* rectcyl.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int rectcyl_(doublereal *co, doublereal *v, doublereal *fn, 
	doublereal *stn, doublereal *qfn, doublereal *een, doublereal *cs, 
	integer *n, integer *icntrl, doublereal *t, char *filab, integer *
	imag, integer *mi, doublereal *emn, ftnlen filab_len)
{
    /* System generated locals */
    integer v_dim1, v_offset, fn_dim1, fn_offset, i__1;

    /* Builtin functions */
    double sqrt(doublereal), atan2(doublereal, doublereal), cos(doublereal), 
	    sin(doublereal);
    integer s_cmp(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    doublereal a[9]	/* was [3][3] */, b[9]	/* was [3][3] */, c__[9]	
	    /* was [3][3] */;
    integer i__, j;
    doublereal r__[3], u[3], z__, dd, ct, rr, xn[3], st, xr, xt, xz, ddx, ddy,
	     ctm, csab[7], theta;
    extern /* Subroutine */ int transformatrix_(doublereal *, doublereal *, 
	    doublereal *);


/*     icntrl=1:  rectangular to cylindrical coordinates for nodal */
/*                coordinates in field co */
/*     icntrl=-1: cylindrical to rectangular coordinates for nodal */
/*                coordinates in field co */
/*     icntrl=2:  rectangular to cylindrical coordinates for fields */
/*                v,fn,stn,een and emn */
/*     icntrl=-2: cylindrical to rectangular coordinates for fields */
/*                v,fn,stn, een and emn */

/*     the axis of the cylindrical coordinates is defined by points */
/*     a with coordinates csab(1..3) and b with coordinates csab(4..6). */
/*     Theta=0 (2nd cylindrical coordinate) is defined by the vector t, */
/*     which is perpendicular to the axis. The subroutine should be called */
/*     with icntrl=1 before calling it with icntrl=-1. */

/*     for icntrl=2 the imaginary part is extra taken into account if */
/*     imag=1 */



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
    emn -= 7;

    /* Function Body */
    for (i__ = 1; i__ <= 7; ++i__) {
	csab[i__ - 1] = cs[i__ + 22];
    }

    if (*icntrl == 1) {

/*        normal along the cylindrical axis */

	xn[0] = csab[3] - csab[0];
	xn[1] = csab[4] - csab[1];
	xn[2] = csab[5] - csab[2];
	dd = sqrt(xn[0] * xn[0] + xn[1] * xn[1] + xn[2] * xn[2]);
	for (i__ = 1; i__ <= 3; ++i__) {
	    xn[i__ - 1] /= dd;
	}

/*        normal to the cylindrical axis (vector t) */

	if (abs(xn[0]) > 1e-10) {
	    t[2] = 1.;
	    t[3] = 0.;
	    t[1] = -xn[1] / xn[0];
	} else if (abs(xn[1]) > 1e-10) {
	    t[3] = 1.;
	    t[1] = 0.;
	    t[2] = -xn[2] / xn[1];
	} else {
	    t[1] = 1.;
	    t[2] = 0.;
	    t[3] = -xn[0] / xn[2];
	}
	dd = sqrt(t[1] * t[1] + t[2] * t[2] + t[3] * t[3]);
	for (i__ = 1; i__ <= 3; ++i__) {
	    t[i__] /= dd;
	}

/*        normal to xn and t */

	u[0] = xn[1] * t[3] - xn[2] * t[2];
	u[1] = -xn[0] * t[3] + xn[2] * t[1];
	u[2] = xn[0] * t[2] - xn[1] * t[1];

/*        loop over all nodes to convert */

	i__1 = *n;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    for (j = 1; j <= 3; ++j) {
		r__[j - 1] = co[j + i__ * 3] - csab[j - 1];
	    }
	    z__ = r__[0] * xn[0] + r__[1] * xn[1] + r__[2] * xn[2];
	    for (j = 1; j <= 3; ++j) {
		r__[j - 1] -= z__ * xn[j - 1];
	    }
	    rr = sqrt(r__[0] * r__[0] + r__[1] * r__[1] + r__[2] * r__[2]);
	    if (abs(rr) < 1e-10) {
		theta = 0.;
	    } else {
		for (j = 1; j <= 3; ++j) {
		    r__[j - 1] /= rr;
		}
		ddx = t[1] * r__[0] + t[2] * r__[1] + t[3] * r__[2];
		ddy = u[0] * r__[0] + u[1] * r__[1] + u[2] * r__[2];
		theta = atan2(ddy, ddx);
	    }
	    co[i__ * 3 + 1] = rr;
	    co[i__ * 3 + 2] = theta;
	    co[i__ * 3 + 3] = z__;
	}
    } else if (*icntrl == -1) {

/*        normal along the cylindrical axis */

	xn[0] = csab[3] - csab[0];
	xn[1] = csab[4] - csab[1];
	xn[2] = csab[5] - csab[2];
	dd = sqrt(xn[0] * xn[0] + xn[1] * xn[1] + xn[2] * xn[2]);
	for (i__ = 1; i__ <= 3; ++i__) {
	    xn[i__ - 1] /= dd;
	}

/*        loop over all nodes to convert */

	i__1 = *n;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    rr = co[i__ * 3 + 1];
	    theta = co[i__ * 3 + 2];
/*            write(*,*) 'rectcyl',i,co(2,i) */
	    z__ = co[i__ * 3 + 3];
	    ct = cos(theta);
	    st = sin(theta);
	    ctm = 1. - ct;

/*           rotation matrix */

	    c__[0] = ct + ctm * xn[0] * xn[0];
	    c__[3] = -st * xn[2] + ctm * xn[0] * xn[1];
	    c__[6] = st * xn[1] + ctm * xn[0] * xn[2];
	    c__[1] = st * xn[2] + ctm * xn[1] * xn[0];
	    c__[4] = ct + ctm * xn[1] * xn[1];
	    c__[7] = -st * xn[0] + ctm * xn[1] * xn[2];
	    c__[2] = -st * xn[1] + ctm * xn[2] * xn[0];
	    c__[5] = st * xn[0] + ctm * xn[2] * xn[1];
	    c__[8] = ct + ctm * xn[2] * xn[2];

	    co[i__ * 3 + 1] = csab[0] + z__ * xn[0] + rr * (c__[0] * t[1] + 
		    c__[3] * t[2] + c__[6] * t[3]);
	    co[i__ * 3 + 2] = csab[1] + z__ * xn[1] + rr * (c__[1] * t[1] + 
		    c__[4] * t[2] + c__[7] * t[3]);
	    co[i__ * 3 + 3] = csab[2] + z__ * xn[2] + rr * (c__[2] * t[1] + 
		    c__[5] * t[2] + c__[8] * t[3]);
	}
    } else if (*icntrl == 2) {
	i__1 = *n;
	for (i__ = 1; i__ <= i__1; ++i__) {
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

		j = i__ + *n;

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
	i__1 = *n;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    j = i__;
	    transformatrix_(csab, &co[i__ * 3 + 1], a);

	    if (s_cmp(filab + 87, "U  ", (ftnlen)3, (ftnlen)3) == 0 || s_cmp(
		    filab + 957, "PU", (ftnlen)4, (ftnlen)2) == 0) {
		xr = v[j * v_dim1 + 1] * a[0] + v[j * v_dim1 + 2] * a[3] + v[
			j * v_dim1 + 3] * a[6];
		xt = v[j * v_dim1 + 1] * a[1] + v[j * v_dim1 + 2] * a[4] + v[
			j * v_dim1 + 3] * a[7];
		xz = v[j * v_dim1 + 1] * a[2] + v[j * v_dim1 + 2] * a[5] + v[
			j * v_dim1 + 3] * a[8];
		v[j * v_dim1 + 1] = xr;
		v[j * v_dim1 + 2] = xt;
		v[j * v_dim1 + 3] = xz;
	    }

	    if (s_cmp(filab + 261, "S   ", (ftnlen)4, (ftnlen)4) == 0 || 
		    s_cmp(filab + 1566, "PHS ", (ftnlen)4, (ftnlen)4) == 0) {
		b[0] = stn[j * 6 + 1] * a[0] + stn[j * 6 + 4] * a[3] + stn[j *
			 6 + 5] * a[6];
		b[3] = stn[j * 6 + 1] * a[1] + stn[j * 6 + 4] * a[4] + stn[j *
			 6 + 5] * a[7];
		b[6] = stn[j * 6 + 1] * a[2] + stn[j * 6 + 4] * a[5] + stn[j *
			 6 + 5] * a[8];
		b[1] = stn[j * 6 + 4] * a[0] + stn[j * 6 + 2] * a[3] + stn[j *
			 6 + 6] * a[6];
		b[4] = stn[j * 6 + 4] * a[1] + stn[j * 6 + 2] * a[4] + stn[j *
			 6 + 6] * a[7];
		b[7] = stn[j * 6 + 4] * a[2] + stn[j * 6 + 2] * a[5] + stn[j *
			 6 + 6] * a[8];
		b[2] = stn[j * 6 + 5] * a[0] + stn[j * 6 + 6] * a[3] + stn[j *
			 6 + 3] * a[6];
		b[5] = stn[j * 6 + 5] * a[1] + stn[j * 6 + 6] * a[4] + stn[j *
			 6 + 3] * a[7];
		b[8] = stn[j * 6 + 5] * a[2] + stn[j * 6 + 6] * a[5] + stn[j *
			 6 + 3] * a[8];

		stn[j * 6 + 1] = a[0] * b[0] + a[3] * b[1] + a[6] * b[2];
		stn[j * 6 + 2] = a[1] * b[3] + a[4] * b[4] + a[7] * b[5];
		stn[j * 6 + 3] = a[2] * b[6] + a[5] * b[7] + a[8] * b[8];
		stn[j * 6 + 4] = a[0] * b[3] + a[3] * b[4] + a[6] * b[5];
		stn[j * 6 + 5] = a[0] * b[6] + a[3] * b[7] + a[6] * b[8];
		stn[j * 6 + 6] = a[1] * b[6] + a[4] * b[7] + a[7] * b[8];
	    }

	    if (s_cmp(filab + 348, "E   ", (ftnlen)4, (ftnlen)4) == 0) {
		b[0] = een[j * 6 + 1] * a[0] + een[j * 6 + 4] * a[3] + een[j *
			 6 + 5] * a[6];
		b[3] = een[j * 6 + 1] * a[1] + een[j * 6 + 4] * a[4] + een[j *
			 6 + 5] * a[7];
		b[6] = een[j * 6 + 1] * a[2] + een[j * 6 + 4] * a[5] + een[j *
			 6 + 5] * a[8];
		b[1] = een[j * 6 + 4] * a[0] + een[j * 6 + 2] * a[3] + een[j *
			 6 + 6] * a[6];
		b[4] = een[j * 6 + 4] * a[1] + een[j * 6 + 2] * a[4] + een[j *
			 6 + 6] * a[7];
		b[7] = een[j * 6 + 4] * a[2] + een[j * 6 + 2] * a[5] + een[j *
			 6 + 6] * a[8];
		b[2] = een[j * 6 + 5] * a[0] + een[j * 6 + 6] * a[3] + een[j *
			 6 + 3] * a[6];
		b[5] = een[j * 6 + 5] * a[1] + een[j * 6 + 6] * a[4] + een[j *
			 6 + 3] * a[7];
		b[8] = een[j * 6 + 5] * a[2] + een[j * 6 + 6] * a[5] + een[j *
			 6 + 3] * a[8];

		een[j * 6 + 1] = a[0] * b[0] + a[3] * b[1] + a[6] * b[2];
		een[j * 6 + 2] = a[1] * b[3] + a[4] * b[4] + a[7] * b[5];
		een[j * 6 + 3] = a[2] * b[6] + a[5] * b[7] + a[8] * b[8];
		een[j * 6 + 4] = a[0] * b[3] + a[3] * b[4] + a[6] * b[5];
		een[j * 6 + 5] = a[0] * b[6] + a[3] * b[7] + a[6] * b[8];
		een[j * 6 + 6] = a[1] * b[6] + a[4] * b[7] + a[7] * b[8];
	    }

	    if (s_cmp(filab + 435, "RF  ", (ftnlen)4, (ftnlen)4) == 0) {
		xr = fn[j * fn_dim1 + 1] * a[0] + fn[j * fn_dim1 + 2] * a[3] 
			+ fn[j * fn_dim1 + 3] * a[6];
		xt = fn[j * fn_dim1 + 1] * a[1] + fn[j * fn_dim1 + 2] * a[4] 
			+ fn[j * fn_dim1 + 3] * a[7];
		xz = fn[j * fn_dim1 + 1] * a[2] + fn[j * fn_dim1 + 2] * a[5] 
			+ fn[j * fn_dim1 + 3] * a[8];
		fn[j * fn_dim1 + 1] = xr;
		fn[j * fn_dim1 + 2] = xt;
		fn[j * fn_dim1 + 3] = xz;
	    }

	    if (s_cmp(filab + 783, "HFL ", (ftnlen)4, (ftnlen)4) == 0) {
		xr = qfn[j * 3 + 1] * a[0] + qfn[j * 3 + 2] * a[3] + qfn[j * 
			3 + 3] * a[6];
		xt = qfn[j * 3 + 1] * a[1] + qfn[j * 3 + 2] * a[4] + qfn[j * 
			3 + 3] * a[7];
		xz = qfn[j * 3 + 1] * a[2] + qfn[j * 3 + 2] * a[5] + qfn[j * 
			3 + 3] * a[8];
		qfn[j * 3 + 1] = xr;
		qfn[j * 3 + 2] = xt;
		qfn[j * 3 + 3] = xz;
	    }

	    if (s_cmp(filab + 2784, "ME  ", (ftnlen)4, (ftnlen)4) == 0) {
		b[0] = emn[j * 6 + 1] * a[0] + emn[j * 6 + 4] * a[3] + emn[j *
			 6 + 5] * a[6];
		b[3] = emn[j * 6 + 1] * a[1] + emn[j * 6 + 4] * a[4] + emn[j *
			 6 + 5] * a[7];
		b[6] = emn[j * 6 + 1] * a[2] + emn[j * 6 + 4] * a[5] + emn[j *
			 6 + 5] * a[8];
		b[1] = emn[j * 6 + 4] * a[0] + emn[j * 6 + 2] * a[3] + emn[j *
			 6 + 6] * a[6];
		b[4] = emn[j * 6 + 4] * a[1] + emn[j * 6 + 2] * a[4] + emn[j *
			 6 + 6] * a[7];
		b[7] = emn[j * 6 + 4] * a[2] + emn[j * 6 + 2] * a[5] + emn[j *
			 6 + 6] * a[8];
		b[2] = emn[j * 6 + 5] * a[0] + emn[j * 6 + 6] * a[3] + emn[j *
			 6 + 3] * a[6];
		b[5] = emn[j * 6 + 5] * a[1] + emn[j * 6 + 6] * a[4] + emn[j *
			 6 + 3] * a[7];
		b[8] = emn[j * 6 + 5] * a[2] + emn[j * 6 + 6] * a[5] + emn[j *
			 6 + 3] * a[8];

		emn[j * 6 + 1] = a[0] * b[0] + a[3] * b[1] + a[6] * b[2];
		emn[j * 6 + 2] = a[1] * b[3] + a[4] * b[4] + a[7] * b[5];
		emn[j * 6 + 3] = a[2] * b[6] + a[5] * b[7] + a[8] * b[8];
		emn[j * 6 + 4] = a[0] * b[3] + a[3] * b[4] + a[6] * b[5];
		emn[j * 6 + 5] = a[0] * b[6] + a[3] * b[7] + a[6] * b[8];
		emn[j * 6 + 6] = a[1] * b[6] + a[4] * b[7] + a[7] * b[8];
	    }

/*           imaginary part for cyclic symmetry frequency calculations */

	    if (*imag == 1) {

		j = i__ + *n;

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
} /* rectcyl_ */

