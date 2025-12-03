/* storeresidual.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int storeresidual_(integer *nactdof, doublereal *b, 
	doublereal *fn, char *filab, integer *ithermal, integer *nk, 
	doublereal *sti, doublereal *stn, integer *ipkon, integer *inum, 
	integer *kon, char *lakon, integer *ne, integer *mi, doublereal *orab,
	 integer *ielorien, doublereal *co, integer *itg, integer *ntg, 
	doublereal *vold, integer *ielmat, doublereal *thicke, integer *
	ielprop, doublereal *prop, ftnlen filab_len, ftnlen lakon_len)
{
    /* System generated locals */
    integer nactdof_dim1, nactdof_offset, ielmat_dim1, ielmat_offset, fn_dim1,
	     fn_offset, sti_dim2, sti_offset, vold_dim1, vold_offset, 
	    thicke_dim1, thicke_offset, i__1, i__2;

    /* Builtin functions */
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    integer i__, j;
    extern /* Subroutine */ int map3dto1d2d_(doublereal *, integer *, integer 
	    *, integer *, char *, integer *, integer *, integer *, char *, 
	    doublereal *, doublereal *, integer *, integer *, integer *, 
	    doublereal *, ftnlen, ftnlen);
    integer mt, iorienglob;
    extern /* Subroutine */ int networkextrapolate_(doublereal *, integer *, 
	    integer *, integer *, char *, integer *, integer *, ftnlen), 
	    extrapolate_(doublereal *, doublereal *, integer *, integer *, 
	    integer *, char *, integer *, integer *, integer *, integer *, 
	    integer *, doublereal *, integer *, doublereal *, integer *, char 
	    *, doublereal *, integer *, integer *, doublereal *, integer *, 
	    doublereal *, ftnlen, ftnlen);
    integer ndim;
    char cflag[1];
    integer nlabel, nfield, iforce, icfdout;


/*     This routine is called in case of divergence: */
/*     stores the residual forces in fn and changes the */
/*     file storage labels so that the independent */
/*     variables (displacements and/or temperatures) and */
/*     the corresponding residual forces are stored in the */
/*     frd file */





    /* Parameter adjustments */
    --b;
    filab -= 87;
    --ithermal;
    stn -= 7;
    --ipkon;
    --inum;
    --kon;
    lakon -= 8;
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
    sti_dim2 = mi[1];
    sti_offset = 1 + 6 * (1 + sti_dim2);
    sti -= sti_offset;
    fn_dim1 = mi[2] - 0 + 1;
    fn_offset = 0 + fn_dim1;
    fn -= fn_offset;
    nactdof_dim1 = mi[2] - 0 + 1;
    nactdof_offset = 0 + nactdof_dim1;
    nactdof -= nactdof_offset;
    orab -= 8;
    co -= 4;
    --itg;
    --ielprop;
    --prop;

    /* Function Body */
    mt = mi[2] + 1;

    nlabel = 55;

/*     storing the residual forces in field fn */

    i__1 = *nk;
    for (i__ = 1; i__ <= i__1; ++i__) {
	i__2 = mi[2];
	for (j = 0; j <= i__2; ++j) {
	    if (nactdof[j + i__ * nactdof_dim1] > 0) {
		fn[j + i__ * fn_dim1] = b[nactdof[j + i__ * nactdof_dim1]];
	    } else {
		fn[j + i__ * fn_dim1] = 0.;
	    }
	}
    }

/*     adapting the storage labels */

    i__1 = nlabel;
    for (i__ = 1; i__ <= i__1; ++i__) {
	s_copy(filab + i__ * 87, "    ", (ftnlen)4, (ftnlen)4);
    }

    if (ithermal[1] != 2) {
	s_copy(filab + 87, "U  ", (ftnlen)3, (ftnlen)3);
	s_copy(filab + 435, "RF  ", (ftnlen)4, (ftnlen)4);
    } else {
	s_copy(filab + 87, "    ", (ftnlen)4, (ftnlen)4);
	s_copy(filab + 435, "    ", (ftnlen)4, (ftnlen)4);
    }

    if (ithermal[1] > 1) {
	s_copy(filab + 174, "NT  ", (ftnlen)4, (ftnlen)4);
	s_copy(filab + 870, "RFL ", (ftnlen)4, (ftnlen)4);
	s_copy(filab + 1218, "TT  ", (ftnlen)4, (ftnlen)4);
	s_copy(filab + 1305, "MF  ", (ftnlen)4, (ftnlen)4);
	s_copy(filab + 1392, "TP  ", (ftnlen)4, (ftnlen)4);
	s_copy(filab + 1479, "ST  ", (ftnlen)4, (ftnlen)4);
    } else {
	s_copy(filab + 174, "    ", (ftnlen)4, (ftnlen)4);
	s_copy(filab + 870, "    ", (ftnlen)4, (ftnlen)4);
	s_copy(filab + 1218, "    ", (ftnlen)4, (ftnlen)4);
	s_copy(filab + 1305, "    ", (ftnlen)4, (ftnlen)4);
	s_copy(filab + 1392, "    ", (ftnlen)4, (ftnlen)4);
	s_copy(filab + 1479, "    ", (ftnlen)4, (ftnlen)4);
    }

/*     calculating inum */

    nfield = 0;
    ndim = 0;
    iorienglob = 0;
    *(unsigned char *)cflag = *(unsigned char *)&filab[91];
    icfdout = 0;
    iforce = 0;
    extrapolate_(&sti[sti_offset], &stn[7], &ipkon[1], &inum[1], &kon[1], 
	    lakon + 8, &nfield, nk, ne, &mi[1], &ndim, &orab[8], ielorien, &
	    co[4], &iorienglob, cflag, &vold[vold_offset], &iforce, &ielmat[
	    ielmat_offset], &thicke[thicke_offset], &ielprop[1], &prop[1], (
	    ftnlen)8, (ftnlen)1);

    if (ithermal[1] > 1) {
	networkextrapolate_(&vold[vold_offset], &ipkon[1], &inum[1], &kon[1], 
		lakon + 8, ne, &mi[1], (ftnlen)8);
    }

/*     interpolation for 1d/2d elements */

    if (*(unsigned char *)&filab[91] == 'I') {
	nfield = mt;
	*(unsigned char *)cflag = *(unsigned char *)&filab[91];
	iforce = 0;
	map3dto1d2d_(&vold[vold_offset], &ipkon[1], &inum[1], &kon[1], lakon 
		+ 8, &nfield, nk, ne, cflag, &co[4], &vold[vold_offset], &
		iforce, &mi[1], &ielprop[1], &prop[1], (ftnlen)8, (ftnlen)1);
    }

/*     marking gas nodes by multiplying inum by -1 */

    i__1 = *ntg;
    for (i__ = 1; i__ <= i__1; ++i__) {
	inum[itg[i__]] = -inum[itg[i__]];
    }

    return 0;
} /* storeresidual_ */

