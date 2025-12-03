/* extrapolate_u.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int extrapolate_u__(doublereal *yi, doublereal *yn, integer *
	ipkon, integer *inum, integer *kon, char *lakon, integer *nfield, 
	integer *nk, integer *ne, integer *mi, integer *ndim, doublereal *
	orab, integer *ielorien, doublereal *co, integer *iorienloc, char *
	cflag, doublereal *vold, integer *iforce, integer *ielmat, doublereal 
	*thicke, integer *ielprop, doublereal *prop, integer *i__, ftnlen 
	lakon_len, ftnlen cflag_len)
{
    /* System generated locals */
    integer ielorien_dim1, ielorien_offset, ielmat_dim1, ielmat_offset, 
	    yi_dim1, yi_dim2, yi_offset, yn_dim1, yn_offset, vold_dim1, 
	    vold_offset, thicke_dim1, thicke_offset;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    extern /* Subroutine */ int extrapolate_us45__(doublereal *, doublereal *,
	     integer *, integer *, integer *, char *, integer *, integer *, 
	    integer *, integer *, integer *, doublereal *, integer *, 
	    doublereal *, integer *, char *, doublereal *, integer *, integer 
	    *, doublereal *, integer *, doublereal *, integer *, ftnlen, 
	    ftnlen), extrapolate_u1__(doublereal *, doublereal *, integer *, 
	    integer *, integer *, char *, integer *, integer *, integer *, 
	    integer *, integer *, doublereal *, integer *, doublereal *, 
	    integer *, char *, doublereal *, integer *, integer *, doublereal 
	    *, integer *, doublereal *, integer *, ftnlen, ftnlen), 
	    extrapolate_us3__(doublereal *, doublereal *, integer *, integer *
	    , integer *, char *, integer *, integer *, integer *, integer *, 
	    integer *, doublereal *, integer *, doublereal *, integer *, char 
	    *, doublereal *, integer *, integer *, doublereal *, integer *, 
	    doublereal *, integer *, ftnlen, ftnlen);


/*     extrapolates nfield values at the integration points to the */
/*     nodes for user element i */





    /* Parameter adjustments */
    --ipkon;
    --inum;
    --kon;
    lakon -= 8;
    yn_dim1 = *nfield;
    yn_offset = 1 + yn_dim1;
    yn -= yn_offset;
    --mi;
    thicke_dim1 = mi[3];
    thicke_offset = 1 + thicke_dim1;
    thicke -= thicke_offset;
    ielmat_dim1 = mi[3];
    ielmat_offset = 1 + ielmat_dim1;
    ielmat -= ielmat_offset;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;
    ielorien_dim1 = mi[3];
    ielorien_offset = 1 + ielorien_dim1;
    ielorien -= ielorien_offset;
    yi_dim1 = *ndim;
    yi_dim2 = mi[1];
    yi_offset = 1 + yi_dim1 * (1 + yi_dim2);
    yi -= yi_offset;
    orab -= 8;
    co -= 4;
    --ielprop;
    --prop;

    /* Function Body */
    if (s_cmp(lakon + ((*i__ << 3) + 1), "1 ", (ftnlen)2, (ftnlen)2) == 0) {
	extrapolate_u1__(&yi[yi_offset], &yn[yn_offset], &ipkon[1], &inum[1], 
		&kon[1], lakon + 8, nfield, nk, ne, &mi[1], ndim, &orab[8], &
		ielorien[ielorien_offset], &co[4], iorienloc, cflag, &vold[
		vold_offset], iforce, &ielmat[ielmat_offset], &thicke[
		thicke_offset], &ielprop[1], &prop[1], i__, (ftnlen)8, (
		ftnlen)1);
    } else if (s_cmp(lakon + ((*i__ << 3) + 1), "S3", (ftnlen)2, (ftnlen)2) ==
	     0) {
	extrapolate_us3__(&yi[yi_offset], &yn[yn_offset], &ipkon[1], &inum[1],
		 &kon[1], lakon + 8, nfield, nk, ne, &mi[1], ndim, &orab[8], &
		ielorien[ielorien_offset], &co[4], iorienloc, cflag, &vold[
		vold_offset], iforce, &ielmat[ielmat_offset], &thicke[
		thicke_offset], &ielprop[1], &prop[1], i__, (ftnlen)8, (
		ftnlen)1);
    } else if (s_cmp(lakon + ((*i__ << 3) + 1), "S45", (ftnlen)3, (ftnlen)3) 
	    == 0) {
	extrapolate_us45__(&yi[yi_offset], &yn[yn_offset], &ipkon[1], &inum[1]
		, &kon[1], lakon + 8, nfield, nk, ne, &mi[1], ndim, &orab[8], 
		&ielorien[ielorien_offset], &co[4], iorienloc, cflag, &vold[
		vold_offset], iforce, &ielmat[ielmat_offset], &thicke[
		thicke_offset], &ielprop[1], &prop[1], i__, (ftnlen)8, (
		ftnlen)1);
    }

    return 0;
} /* extrapolate_u__ */

