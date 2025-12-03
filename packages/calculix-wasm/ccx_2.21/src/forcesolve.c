/* forcesolve.f -- translated by f2c (version 20200916).
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
static integer c__7 = 7;
static integer c__201 = 201;


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

/* Subroutine */ int forcesolve_(doublecomplex *zc, integer *nev, 
	doublecomplex *a, doublecomplex *b, doublecomplex *x, doublecomplex *
	eiga, doublecomplex *eigb, doublecomplex *eigxx, integer *iter, 
	doublereal *d__, integer *neq, doublereal *z__, integer *istartnmd, 
	integer *iendnmd, integer *nmd, integer *cyclicsymmetry, integer *
	neqact, integer *igeneralizedforce)
{
    /* System generated locals */
    integer z_dim1, z_offset, a_dim1, a_offset, b_dim1, b_offset, x_dim1, 
	    x_offset, zc_dim1, zc_offset, i__1, i__2, i__3, i__4, i__5, i__6, 
	    i__7, i__8, i__9, i__10;
    doublecomplex z__1, z__2, z__3, z__4, z__5;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);
    double z_abs(doublecomplex *);
    void z_div(doublecomplex *, doublecomplex *, doublecomplex *), z_sqrt(
	    doublecomplex *, doublecomplex *);

    /* Local variables */
    integer i__, j, k, l;
    extern /* Subroutine */ int exit_(integer *), dlzit_(integer *, 
	    doublecomplex *, integer *, doublecomplex *, integer *, 
	    doublecomplex *, integer *, logical *, integer *, doublecomplex *,
	     doublecomplex *);
    logical wantx;
    extern /* Subroutine */ int dlzhes_(integer *, doublecomplex *, integer *,
	     doublecomplex *, integer *, doublecomplex *, integer *, logical *
	    );

    /* Fortran I/O blocks */
    static cilist io___4 = { 0, 6, 0, 0, 0 };
    static cilist io___6 = { 0, 6, 0, 0, 0 };
    static cilist io___7 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___10 = { 0, 6, 0, 0, 0 };
    static cilist io___11 = { 0, 6, 0, 0, 0 };
    static cilist io___12 = { 0, 6, 0, 0, 0 };
    static cilist io___13 = { 0, 6, 0, 0, 0 };



/*     solves for the complex eigenfrequencies due to Coriolis */
/*     forces */






    /* Parameter adjustments */
    x_dim1 = *nev;
    x_offset = 1 + x_dim1;
    x -= x_offset;
    b_dim1 = *nev;
    b_offset = 1 + b_dim1;
    b -= b_offset;
    a_dim1 = *nev;
    a_offset = 1 + a_dim1;
    a -= a_offset;
    --eiga;
    --eigb;
    --eigxx;
    --iter;
    --d__;
    z_dim1 = *neq;
    z_offset = 1 + z_dim1;
    z__ -= z_offset;
    --istartnmd;
    --iendnmd;
    zc_dim1 = *neqact;
    zc_offset = 1 + zc_dim1;
    zc -= zc_offset;

    /* Function Body */
    if (*igeneralizedforce == 0) {

/*        no generalized force: multiplication with the eigenmodes */
/*        is necessary */

	if (*cyclicsymmetry == 0) {
	    i__1 = *nev;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		i__2 = *nev;
		for (j = 1; j <= i__2; ++j) {
		    i__3 = *neq;
		    for (k = 1; k <= i__3; ++k) {
			i__4 = i__ + j * a_dim1;
			i__5 = i__ + j * a_dim1;
			i__6 = k + i__ * z_dim1;
			i__7 = k + j * zc_dim1;
			z__2.r = z__[i__6] * zc[i__7].r, z__2.i = z__[i__6] * 
				zc[i__7].i;
			z__1.r = a[i__5].r + z__2.r, z__1.i = a[i__5].i + 
				z__2.i;
			a[i__4].r = z__1.r, a[i__4].i = z__1.i;
		    }
		}
		s_wsle(&io___4);
		do_lio(&c__9, &c__1, "aerodynamic stiffness/structural stiff"
			"ness = ", (ftnlen)45);
		i__2 = i__ + i__ * a_dim1;
		i__3 = i__;
		z__2.r = a[i__2].r / d__[i__3], z__2.i = a[i__2].i / d__[i__3]
			;
		z__1.r = z__2.r, z__1.i = z__2.i;
		do_lio(&c__7, &c__1, (char *)&z__1, (ftnlen)sizeof(
			doublecomplex));
		e_wsle();
		i__2 = i__ + i__ * a_dim1;
		i__3 = i__ + i__ * a_dim1;
		i__4 = i__;
		z__1.r = a[i__3].r + d__[i__4], z__1.i = a[i__3].i;
		a[i__2].r = z__1.r, a[i__2].i = z__1.i;
		i__2 = i__ + i__ * b_dim1;
		b[i__2].r = 1., b[i__2].i = 0.;
	    }
	} else {

/*     cyclic symmetry */

	    i__1 = *nmd;
	    for (l = 1; l <= i__1; ++l) {
		i__2 = iendnmd[l];
		for (i__ = istartnmd[l]; i__ <= i__2; ++i__) {
		    i__3 = iendnmd[l];
		    for (j = istartnmd[l]; j <= i__3; ++j) {
			i__4 = *neqact;
			for (k = 1; k <= i__4; ++k) {
			    i__5 = i__ + j * a_dim1;
			    i__6 = i__ + j * a_dim1;
			    i__7 = k + i__ * z_dim1;
			    i__8 = k + j * zc_dim1;
			    z__3.r = z__[i__7] * zc[i__8].r, z__3.i = z__[
				    i__7] * zc[i__8].i;
			    z__2.r = a[i__6].r + z__3.r, z__2.i = a[i__6].i + 
				    z__3.i;
			    i__9 = k + *neqact + i__ * z_dim1;
			    i__10 = k + j * zc_dim1;
			    z__5.r = z__[i__9] * zc[i__10].r, z__5.i = z__[
				    i__9] * zc[i__10].i;
			    z__4.r = z__5.r * 0. - z__5.i * 1., z__4.i = 
				    z__5.r * 1. + z__5.i * 0.;
			    z__1.r = z__2.r - z__4.r, z__1.i = z__2.i - 
				    z__4.i;
			    a[i__5].r = z__1.r, a[i__5].i = z__1.i;
			}
		    }
		    s_wsle(&io___6);
		    do_lio(&c__9, &c__1, "aerodynamic stiffness/structural s"
			    "tiffness = ", (ftnlen)45);
		    i__3 = i__ + i__ * a_dim1;
		    i__4 = i__;
		    z__2.r = a[i__3].r / d__[i__4], z__2.i = a[i__3].i / d__[
			    i__4];
		    z__1.r = z__2.r, z__1.i = z__2.i;
		    do_lio(&c__7, &c__1, (char *)&z__1, (ftnlen)sizeof(
			    doublecomplex));
		    e_wsle();
		    i__3 = i__ + i__ * a_dim1;
		    i__4 = i__ + i__ * a_dim1;
		    i__5 = i__;
		    z__1.r = a[i__4].r + d__[i__5], z__1.i = a[i__4].i;
		    a[i__3].r = z__1.r, a[i__3].i = z__1.i;
		    i__3 = i__ + i__ * b_dim1;
		    b[i__3].r = 1., b[i__3].i = 0.;
		}
	    }
	}
    } else {

/*        generalized force: the a-matrix is (apart from the diagonal) */
/*        known */

	if (*cyclicsymmetry == 0) {
	    i__1 = *nev;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		s_wsle(&io___7);
		do_lio(&c__9, &c__1, "aerodynamic stiffness/structural stiff"
			"ness = ", (ftnlen)45);
		i__2 = i__ + i__ * a_dim1;
		i__3 = i__;
		z__2.r = a[i__2].r / d__[i__3], z__2.i = a[i__2].i / d__[i__3]
			;
		z__1.r = z__2.r, z__1.i = z__2.i;
		do_lio(&c__7, &c__1, (char *)&z__1, (ftnlen)sizeof(
			doublecomplex));
		e_wsle();
		i__2 = i__ + i__ * a_dim1;
		i__3 = i__ + i__ * a_dim1;
		i__4 = i__;
		z__1.r = a[i__3].r + d__[i__4], z__1.i = a[i__3].i;
		a[i__2].r = z__1.r, a[i__2].i = z__1.i;
		i__2 = i__ + i__ * b_dim1;
		b[i__2].r = 1., b[i__2].i = 0.;
	    }
	} else {

/*     cyclic symmetry */

	    i__1 = *nmd;
	    for (l = 1; l <= i__1; ++l) {
		i__2 = iendnmd[l];
		for (i__ = istartnmd[l]; i__ <= i__2; ++i__) {
		    s_wsle(&io___8);
		    do_lio(&c__9, &c__1, "aerodynamic stiffness/structural s"
			    "tiffness = ", (ftnlen)45);
		    i__3 = i__ + i__ * a_dim1;
		    i__4 = i__;
		    z__2.r = a[i__3].r / d__[i__4], z__2.i = a[i__3].i / d__[
			    i__4];
		    z__1.r = z__2.r, z__1.i = z__2.i;
		    do_lio(&c__7, &c__1, (char *)&z__1, (ftnlen)sizeof(
			    doublecomplex));
		    e_wsle();
		    i__3 = i__ + i__ * a_dim1;
		    i__4 = i__ + i__ * a_dim1;
		    i__5 = i__;
		    z__1.r = a[i__4].r + d__[i__5], z__1.i = a[i__4].i;
		    a[i__3].r = z__1.r, a[i__3].i = z__1.i;
		    i__3 = i__ + i__ * b_dim1;
		    b[i__3].r = 1., b[i__3].i = 0.;
		}
	    }
	}
    }

    wantx = TRUE_;

/*     solving for the complex eigenvalues */

    dlzhes_(nev, &a[a_offset], nev, &b[b_offset], nev, &x[x_offset], nev, &
	    wantx);
    dlzit_(nev, &a[a_offset], nev, &b[b_offset], nev, &x[x_offset], nev, &
	    wantx, &iter[1], &eiga[1], &eigb[1]);

    i__1 = *nev;
    for (i__ = 1; i__ <= i__1; ++i__) {
	if (iter[i__] == -1) {
	    s_wsle(&io___10);
	    do_lio(&c__9, &c__1, "*ERROR in forcesolve: fatal error", (ftnlen)
		    33);
	    e_wsle();
	    s_wsle(&io___11);
	    do_lio(&c__9, &c__1, "       in dlzit", (ftnlen)15);
	    e_wsle();
	    exit_(&c__201);
	} else if (z_abs(&eigb[i__]) < 1e-10) {
	    s_wsle(&io___12);
	    do_lio(&c__9, &c__1, "*ERROR in forcesolve: eigenvalue", (ftnlen)
		    32);
	    e_wsle();
	    s_wsle(&io___13);
	    do_lio(&c__9, &c__1, "       out of bounds", (ftnlen)20);
	    e_wsle();
	    exit_(&c__201);
	} else {
	    i__2 = i__;
	    z_div(&z__2, &eiga[i__], &eigb[i__]);
	    z_sqrt(&z__1, &z__2);
	    eigxx[i__2].r = z__1.r, eigxx[i__2].i = z__1.i;
	}
    }

    return 0;
} /* forcesolve_ */

