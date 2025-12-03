/* getcontactparams.f -- translated by f2c (version 20200916).
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
/*     Copyright (C) 1998-2023 Guido Dhondt */

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



/*   function extracting the contact constants */

/*  [out] mu             friction coefficient */
/*  [out] regmode        regularization method in normal direction (=1 linear, =2 piece-wise liner,=3 exponent
ial,=4 tied) */
/*  [out] regmodet       regularization method in tangential direction (=1 linear, =2 Iwan model) */
/*  [out] fkninv         inverse of normal stiffness \f$ \frac{1}{a_n} \f$ */
/*  [out] fktauinv       inverse of tangential stiffness \f$ \frac{1}{a_\tau} \f$ */
/*  [out] p0             parameter needed for exponential regularization */
/*  [out] beta           parameter needed for exponential regularization */
/*  [out] iwan           number of Iwan elements (1-10) for Iwan model */

/* Subroutine */ int getcontactparams_(doublereal *mu, integer *regmode, 
	integer *regmodet, doublereal *fkninv, doublereal *fktauinv, 
	doublereal *p0, doublereal *beta, doublereal *tietol, doublereal *
	elcon, integer *itie, integer *ncmat___, integer *ntmat___, integer *
	iwan)
{
    /* System generated locals */
    integer elcon_dim1, elcon_dim2, elcon_offset;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    integer imat;
    extern /* Subroutine */ int exit_(integer *);

    /* Fortran I/O blocks */
    static cilist io___2 = { 0, 6, 0, 0, 0 };
    static cilist io___3 = { 0, 6, 0, 0, 0 };



/*     Author: Saskia Sitzmann */




    /* Parameter adjustments */
    tietol -= 5;
    elcon_dim1 = *ncmat___ - 0 + 1;
    elcon_dim2 = *ntmat___;
    elcon_offset = 0 + elcon_dim1 * (1 + elcon_dim2);
    elcon -= elcon_offset;

    /* Function Body */
    ++(*itie);
    imat = (integer) tietol[(*itie << 2) + 2];

    if (*ncmat___ < 6) {
	*mu = 0.f;
	*fktauinv = 0.f;
	*regmodet = 1;
	*iwan = 1;
    } else {
	*mu = elcon[(imat * elcon_dim2 + 1) * elcon_dim1 + 6];
	if (elcon[(imat * elcon_dim2 + 1) * elcon_dim1 + 7] <= 0.f) {
	    *fktauinv = 0.f;
	} else {
	    *fktauinv = 1.f / elcon[(imat * elcon_dim2 + 1) * elcon_dim1 + 7];
	}
	*regmodet = 1;
	if (elcon[(imat * elcon_dim2 + 1) * elcon_dim1 + 8] <= .99f) {
	    *regmodet = 1;
	    *iwan = 1;
	} else {
	    *regmodet = 2;
	    *iwan = (integer) elcon[(imat * elcon_dim2 + 1) * elcon_dim1 + 8];
	    *iwan = min(10,*iwan);
	}
	if (*fktauinv < 1e-8f) {
	    *regmodet = 1;
	    *iwan = 1;
	}
    }

/*     exponential regularization */

    if (*ncmat___ > 2) {
	if (elcon[(imat * elcon_dim2 + 1) * elcon_dim1 + 3] > 1.4f && elcon[(
		imat * elcon_dim2 + 1) * elcon_dim1 + 3] < 1.6f) {
	    *regmode = 3;
	    *p0 = elcon[(imat * elcon_dim2 + 1) * elcon_dim1 + 2];
	    *beta = 1.f / elcon[(imat * elcon_dim2 + 1) * elcon_dim1 + 1];
	    *fkninv = 0.f;
	    if (*mu > 1e-10f) {
		s_wsle(&io___2);
		do_lio(&c__9, &c__1, "getcontactparams:", (ftnlen)17);
		e_wsle();
		s_wsle(&io___3);
		do_lio(&c__9, &c__1, "*ERROR in getcontactparams:", (ftnlen)
			27);
		do_lio(&c__9, &c__1, " exponential pressure overclosure", (
			ftnlen)33);
		do_lio(&c__9, &c__1, " with friction not yet supported", (
			ftnlen)32);
		e_wsle();
		exit_(&c__201);
	    }

/*     linear regularization */

	} else if (elcon[(imat * elcon_dim2 + 1) * elcon_dim1 + 3] > 2.4f && 
		elcon[(imat * elcon_dim2 + 1) * elcon_dim1 + 3] < 2.6f) {
	    *regmode = 1;
	    *fkninv = 1.f / elcon[(imat * elcon_dim2 + 1) * elcon_dim1 + 2];
	    *p0 = 0.f;
	    *beta = 0.f;

/*     piecewiese linear regularization */

	} else if (elcon[(imat * elcon_dim2 + 1) * elcon_dim1 + 3] > 3.4f && 
		elcon[(imat * elcon_dim2 + 1) * elcon_dim1 + 3] < 3.6f) {
	    *regmode = 2;
	    *p0 = 0.f;
	    *beta = 0.f;
	    *fkninv = 0.f;

/*     tied contact */

	} else if (elcon[(imat * elcon_dim2 + 1) * elcon_dim1 + 3] > 4.4f && 
		elcon[(imat * elcon_dim2 + 1) * elcon_dim1 + 3] < 4.6f) {
	    *regmode = 4;
	    *p0 = 0.f;
	    *beta = 0.f;
	    *fkninv = 0.f;
	    *mu = 0.f;
	    *fktauinv = 0.f;
	    *regmodet = 4;
	} else {
	    *regmode = 1;
	    *fkninv = 0.f;
	    *p0 = 0.f;
	    *beta = 0.f;
	}
    } else {
	*regmode = 1;
	*fkninv = 0.f;
	*p0 = 0.f;
	*beta = 0.f;
    }
    --(*itie);

    return 0;
} /* getcontactparams_ */

