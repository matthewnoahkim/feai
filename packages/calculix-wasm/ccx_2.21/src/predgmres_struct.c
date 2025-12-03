/* predgmres_struct.f -- translated by f2c (version 20200916).
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

/*     y=A*x for real sparse matrices (symmetric and non-symmetric) */

/*     storage of the matrix in a: */
/*        - first the lower triangular terms */
/*        - then, if the matrix is non-symmetric, the upper triangular terms */
/*        - finally the diagonal terms */

/* Subroutine */ int predgmres_struct__(integer *n, doublereal *b, doublereal 
	*x, integer *nelt, integer *ia, integer *ja, doublereal *a, integer *
	isym, integer *itol, doublereal *tol, integer *itmax, integer *iter, 
	doublereal *err, integer *ierr, integer *iunit, doublereal *sb, 
	doublereal *sx, doublereal *rgwk, integer *lrgw, integer *igwk, 
	integer *ligw, doublereal *rwork, integer *iwork)
{
    extern /* Subroutine */ int matvec_struct__(), msolve_struct__();
    extern /* Subroutine */ int dgmres_(integer *, doublereal *, doublereal *,
	     integer *, integer *, integer *, doublereal *, integer *, U_fp, 
	    U_fp, integer *, doublereal *, integer *, integer *, doublereal *,
	     integer *, integer *, doublereal *, doublereal *, doublereal *, 
	    integer *, integer *, integer *, doublereal *, integer *);






    /* Parameter adjustments */
    --iwork;
    --rwork;
    --igwk;
    --rgwk;
    --sx;
    --sb;
    --a;
    --ja;
    --ia;
    --x;
    --b;

    /* Function Body */
    *itol = 0;
    *tol = 1e-6f;
    *itmax = 0;
    *iunit = 0;

    igwk[1] = 10;
    igwk[2] = 10;
    igwk[3] = 0;
    igwk[4] = 1;
    igwk[5] = 10;
    *ligw = 20;

    dgmres_(n, &b[1], &x[1], nelt, &ia[1], &ja[1], &a[1], isym, (U_fp)
	    matvec_struct__, (U_fp)msolve_struct__, itol, tol, itmax, iter, 
	    err, ierr, iunit, &sb[1], &sx[1], &rgwk[1], lrgw, &igwk[1], ligw, 
	    &rwork[1], &iwork[1]);

    return 0;
} /* predgmres_struct__ */

