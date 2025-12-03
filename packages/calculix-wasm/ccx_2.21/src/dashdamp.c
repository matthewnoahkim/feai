/* dashdamp.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int dashdamp_(doublereal *xl, doublereal *elas, integer *
	konl, doublereal *voldl, doublereal *s, integer *imat, doublereal *
	elcon, integer *nelcon, integer *ncmat___, integer *ntmat___, integer 
	*nope, char *lakonl, doublereal *t0l, doublereal *t1l, integer *kode, 
	doublereal *elconloc, doublereal *plicon, integer *nplicon, integer *
	npmat___, integer *iperturb, doublereal *time, integer *nmethod, 
	ftnlen lakonl_len)
{
    /* System generated locals */
    integer nplicon_dim1, nplicon_offset, elcon_dim1, elcon_dim2, 
	    elcon_offset, plicon_dim1, plicon_dim2, plicon_offset, i__1;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double sqrt(doublereal);
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    doublereal plconloc[802];
    integer i__, j;
    doublereal dd;
    integer id;
    doublereal pl[27]	/* was [3][9] */, xn[3], damp;
    integer niso;
    extern /* Subroutine */ int exit_(integer *);
    doublereal xiso[200], yiso[200];
    extern /* Subroutine */ int ident_(doublereal *, doublereal *, integer *, 
	    integer *), materialdata_sp__(doublereal *, integer *, integer *, 
	    integer *, integer *, doublereal *, doublereal *, integer *, 
	    doublereal *, integer *, integer *, doublereal *, integer *);

    /* Fortran I/O blocks */
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___10 = { 0, 6, 0, 0, 0 };
    static cilist io___11 = { 0, 6, 0, 0, 0 };



/*     calculates the damping coefficient of a dashpot */





/*     original positions of the nodes belonging to the dashpot */

    /* Parameter adjustments */
    xl -= 4;
    --elas;
    --konl;
    voldl -= 4;
    s -= 61;
    nelcon -= 3;
    nplicon_dim1 = *ntmat___ - 0 + 1;
    nplicon_offset = 0 + nplicon_dim1;
    nplicon -= nplicon_offset;
    elcon_dim1 = *ncmat___ - 0 + 1;
    elcon_dim2 = *ntmat___;
    elcon_offset = 0 + elcon_dim1 * (1 + elcon_dim2);
    elcon -= elcon_offset;
    --elconloc;
    plicon_dim1 = 2 * *npmat___ - 0 + 1;
    plicon_dim2 = *ntmat___;
    plicon_offset = 0 + plicon_dim1 * (1 + plicon_dim2);
    plicon -= plicon_offset;
    --iperturb;

    /* Function Body */
    if (iperturb[1] == 0) {
	i__1 = *nope;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    for (j = 1; j <= 3; ++j) {
		pl[j + i__ * 3 - 4] = xl[j + i__ * 3];
	    }
	}
    } else {
	i__1 = *nope;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    for (j = 1; j <= 3; ++j) {
		pl[j + i__ * 3 - 4] = xl[j + i__ * 3] + voldl[j + i__ * 3];
	    }
	}
    }

/* Computing 2nd power */
    d__1 = pl[3] - pl[0];
/* Computing 2nd power */
    d__2 = pl[4] - pl[1];
/* Computing 2nd power */
    d__3 = pl[5] - pl[2];
    dd = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);
    for (i__ = 1; i__ <= 3; ++i__) {
	xn[i__ - 1] = (pl[i__ + 2] - pl[i__ - 1]) / dd;
    }

/*     interpolating the material data */

    materialdata_sp__(&elcon[elcon_offset], &nelcon[3], imat, ntmat___, &i__, 
	    t1l, &elconloc[1], kode, &plicon[plicon_offset], &nplicon[
	    nplicon_offset], npmat___, plconloc, ncmat___);

/*     calculating the damping force and damping coefficient */

    if (*kode == 2) {
	damp = elconloc[1];
    } else {
	if (*nmethod != 5) {
	    s_wsle(&io___8);
	    do_lio(&c__9, &c__1, "*ERROR in dashdamp: the damping coefficient"
		    , (ftnlen)43);
	    e_wsle();
	    s_wsle(&io___9);
	    do_lio(&c__9, &c__1, "       may depend on temperature and frequ"
		    "ency", (ftnlen)46);
	    e_wsle();
	    s_wsle(&io___10);
	    do_lio(&c__9, &c__1, "       only; the latter is only allowed for"
		    , (ftnlen)43);
	    e_wsle();
	    s_wsle(&io___11);
	    do_lio(&c__9, &c__1, "       steady state dynamics calculations", 
		    (ftnlen)41);
	    e_wsle();
	    exit_(&c__201);
	}
	niso = (integer) plconloc[800];
	i__1 = niso;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    xiso[i__ - 1] = plconloc[(i__ << 1) - 2];
	    yiso[i__ - 1] = plconloc[(i__ << 1) - 1];
	}
	ident_(xiso, time, &niso, &id);
	if (id == 0) {
	    damp = yiso[0];
	} else if (id == niso) {
	    damp = yiso[niso - 1];
	} else {
	    damp = yiso[id - 1] + (yiso[id] - yiso[id - 1]) / (xiso[id] - 
		    xiso[id - 1]) * (*time - xiso[id - 1]);
	}
    }
/*      write(*,*) 'dashdamp ',time,damp */

    for (i__ = 1; i__ <= 3; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    s[i__ + j * 60] = damp * xn[i__ - 1] * xn[j - 1];
	}
    }
    for (i__ = 1; i__ <= 3; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    s[i__ + 3 + j * 60] = -s[i__ + j * 60];
	    s[i__ + (j + 3) * 60] = -s[i__ + j * 60];
	    s[i__ + 3 + (j + 3) * 60] = s[i__ + j * 60];
	}
    }

    return 0;
} /* dashdamp_ */

