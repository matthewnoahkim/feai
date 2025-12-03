/* ranuwh.f -- translated by f2c (version 20200916).
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

/* Common Block Declarations */

struct rwhran_1_ {
    integer ix, iy, iz;
};

#define rwhran_1 (*(struct rwhran_1_ *) &rwhran_)

/* Initialized data */

struct {
    integer e_1[3];
    } rwhran_ = { 1974, 235, 337 };


/* Table of constant values */

static real c_b2 = 1.f;

doublereal ranuwh_(void)
{
    /* System generated locals */
    real ret_val, r__1;

    /* Builtin functions */
    double r_mod(real *, real *);


/* Portable uniform random number generator, using the */
/* method of Wichmann and Hill. This file contains the program units */
/* RANUWH, INIRAN and RAWHIN. These are auxiliary functions for FMINSI, */
/* but may also be used separately. */

/*   FMINSI - Fortran subroutines for unconstrained function minimization */
/*   Copyright (C) 1992, 1995, 2001  Hugo Pfoertner */

/*   This library is free software; you can redistribute it and/or */
/*   modify it under the terms of the GNU Lesser General Public */
/*   License as published by the Free Software Foundation; either */
/*   version 2.1 of the License, or (at your option) any later version. */

/*   This library is distributed in the hope that it will be useful, */
/*   but WITHOUT ANY WARRANTY; without even the implied warranty of */
/*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU */
/*   Lesser General Public License for more details. */

/*   You should have received a copy of the GNU Lesser General Public */
/*   License along with this library; if not, write to the Free Software */
/*   Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307 */
/*   USA */

/*   Contact info: mailto:hugo@pfoertner.org */
/*   or use the information provided at http://www.pfoertner.org/ */

/* Author: Hugo Pfoertner, Oberhaching, Germany */

/* Uniform random numbers R in the range 0.0 <= R < 1.0 are created */
/* This function is written in portable Fortran 77 and does not depend */
/* on the implementation of overflow of integers. It should return */
/* the same sequence of random numbers on any machine, independent of */
/* the machine's architecture. Only standard integer arithmetic is used. */


/* Version History (left in German): */
/* 02.06.01 English translation of comments, LGPL header added */
/* 26.08.95 EXTERNAL RAEWIN ENGEFUEGT, UM UEBER BLOCKDATA-LINK */
/*          STARTBELEGUNG AUCH OHNE INIRAN-AUFRUF ZU ERZWINGEN */
/* 07.12.92 BASISVERSION */

/* Reference: WICHMANN AND HILL: APPL. STATIST. (JRSSC), */
/*                               (31) 188-190, (1982) */

/* Memory, implemented in Common block RWHRAN */
/* Before the first call the memory of the function has to be */
/* preset by calling INIRAN */


/* The block data program unit is referenced here to assure a */
/* proper initialization of the memory, even if the call to */
/* INIRAN is forgotten. The EXTERNAL statement forces the linker */
/* to include the initial values. */


/* Advance memory */
    rwhran_1.ix = rwhran_1.ix % 177 * 171 - (rwhran_1.ix / 177 << 1);
    rwhran_1.iy = rwhran_1.iy % 176 * 172 - rwhran_1.iy / 176 * 35;
    rwhran_1.iz = rwhran_1.iz % 178 * 170 - rwhran_1.iz / 178 * 63;

/* Bring into non-negative range */
    if (rwhran_1.ix < 0) {
	rwhran_1.ix += 30269;
    }
    if (rwhran_1.iy < 0) {
	rwhran_1.iy += 30307;
    }
    if (rwhran_1.iz < 0) {
	rwhran_1.iz += 30323;
    }

/* Truncate to 0..1 real number */
    r__1 = (real) rwhran_1.ix / 30269.f + (real) rwhran_1.iy / 30307.f + (
	    real) rwhran_1.iz / 30323.f;
    ret_val = r_mod(&r__1, &c_b2);

    return ret_val;
/* End of function RANUWH */
} /* ranuwh_ */

/* ******************************************************************* */
/* Subroutine */ int iniran_(void)
{

/* This subroutine is part of the FMINSI program library. */
/* Purpose: */
/* Set starting values for uniform random number generator RANUWH */
/* See copyright notice given in function RANUWH */

/* Author: Hugo Pfoertner, Oberhaching */

/* Version History: */
/* 07.12.92 Initial version */

/* Reference: WICHMANN AND HILL: APPL. STATIST. (JRSSC), */
/*                               (31) 188-190, (1982) */

/* Memory: */

/* Set initial values */
    rwhran_1.ix = 1974;
    rwhran_1.iy = 235;
    rwhran_1.iz = 337;

    return 0;
/* End of subroutine INIRAN */
} /* iniran_ */

/* ******************************************************************* */
/* Subroutine */ int rawhin_(void)
{
    return 0;
} /* rawhin_ */


/* This program unit is part of the FMINSI program library */
/* Purpose: */
/* Forced setting of initial values (e.g. if call to INIRAN is omitted) */
/* See copyright notice given in function RANUWH */

/* Author: Hugo Pfoertner, Oberhaching */

/* Version History: */
/* 26.08.95 Initial version */

/* End of blockdata RAWHIN */

