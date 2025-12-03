/* rcavi.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int rcavi_(integer *node1, integer *node2, integer *nodem, 
	integer *nelem, char *lakon, integer *kon, integer *ipkon, integer *
	nactdog, logical *identity, integer *ielprop, doublereal *prop, 
	integer *kflag, doublereal *v, doublereal *xflow, doublereal *f, 
	integer *nodef, integer *idirf, doublereal *df, doublereal *cp, 
	doublereal *r__, doublereal *physcon, doublereal *dvi, integer *numf, 
	char *set, integer *mi, doublereal *ttime, doublereal *time, integer *
	iaxial, integer *iplausi, ftnlen lakon_len, ftnlen set_len)
{
    /* System generated locals */
    integer v_dim1, v_offset;

    /* Builtin functions */
    double atan(doublereal);

    /* Local variables */
    doublereal p1, pi;
    extern /* Subroutine */ int rcavi_cp_lt__(doublereal *), rcavi_cp_nt__(
	    doublereal *);


/*     rotating cavity element */

/*     author: Yannick Muller */







    /* Parameter adjustments */
    lakon -= 8;
    --kon;
    --ipkon;
    nactdog -= 4;
    --ielprop;
    --prop;
    --nodef;
    --idirf;
    --df;
    --physcon;
    set -= 81;
    --mi;
    v_dim1 = mi[2] - 0 + 1;
    v_offset = 0 + v_dim1;
    v -= v_offset;

    /* Function Body */
    pi = atan(1.) * 4.;
    if (*kflag == 0) {
	*identity = TRUE_;

	if (nactdog[(*node1 << 2) + 2] != 0) {
	    *identity = FALSE_;
	} else if (nactdog[(*node2 << 2) + 2] != 0) {
	    *identity = FALSE_;
	} else if (nactdog[(*nodem << 2) + 1] != 0) {
	    *identity = FALSE_;
	}

    } else if (*kflag == 1) {
	if (v[*nodem * v_dim1 + 1] != 0.) {
	    return 0;
	}

	p1 = v[*node1 * v_dim1 + 2];
	rcavi_cp_lt__(xflow);
	rcavi_cp_nt__(xflow);
    } else if (*kflag == 2) {

    } else if (*kflag == 3) {

    }
    return 0;
} /* rcavi_ */

