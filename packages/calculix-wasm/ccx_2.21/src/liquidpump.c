/* liquidpump.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int liquidpump_(integer *node1, integer *node2, integer *
	nodem, integer *nelem, integer *nactdog, logical *identity, integer *
	ielprop, doublereal *prop, integer *kflag, doublereal *v, doublereal *
	xflow, doublereal *f, integer *nodef, integer *idirf, doublereal *df, 
	doublereal *rho, doublereal *g, doublereal *co, integer *numf, 
	integer *mi, doublereal *ttime, doublereal *time, integer *iaxial, 
	integer *iplausi)
{
    /* System generated locals */
    integer v_dim1, v_offset, i__1;

    /* Builtin functions */
    integer i_dnnt(doublereal *);
    double sqrt(doublereal);

    /* Local variables */
    integer i__;
    doublereal p1, p2, z1, z2, dg, dh;
    integer id, inv, npu;
    doublereal xpu[10], ypu[10], xxpu[10], yypu[10];
    extern /* Subroutine */ int ident_(doublereal *, doublereal *, integer *, 
	    integer *);
    integer index;


/*     pump for incompressible media */







    /* Parameter adjustments */
    nactdog -= 4;
    --ielprop;
    --prop;
    --nodef;
    --idirf;
    --df;
    --g;
    co -= 4;
    --mi;
    v_dim1 = mi[2] - 0 + 1;
    v_offset = 0 + v_dim1;
    v -= v_offset;

    /* Function Body */
    *numf = 3;

    if (*kflag == 0) {
	*identity = TRUE_;

	if (nactdog[(*node1 << 2) + 2] != 0) {
	    *identity = FALSE_;
	} else if (nactdog[(*node2 << 2) + 2] != 0) {
	    *identity = FALSE_;
	} else if (nactdog[(*nodem << 2) + 1] != 0) {
	    *identity = FALSE_;
	}

    } else if (*kflag == 1 || *kflag == 2) {
	if (*kflag == 1) {
	    if (v[*nodem * v_dim1 + 1] != 0.) {
		*xflow = v[*nodem * v_dim1 + 1];
		return 0;
	    }
	}

	index = ielprop[*nelem];

	npu = i_dnnt(&prop[index + 1]);
	i__1 = npu;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    xpu[i__ - 1] = prop[index + (i__ << 1)];
	    ypu[i__ - 1] = prop[index + (i__ << 1) + 1];
	}

	p1 = v[*node1 * v_dim1 + 2];
	p2 = v[*node2 * v_dim1 + 2];

	z1 = -g[1] * co[*node1 * 3 + 1] - g[2] * co[*node1 * 3 + 2] - g[3] * 
		co[*node1 * 3 + 3];
	z2 = -g[1] * co[*node2 * 3 + 1] - g[2] * co[*node2 * 3 + 2] - g[3] * 
		co[*node2 * 3 + 3];

	if (*kflag == 2) {
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    if (*xflow >= 0.) {
		inv = 1;
	    } else {
		inv = -1;
	    }
	    nodef[1] = *node1;
	    nodef[2] = *nodem;
	    nodef[3] = *node2;
	    idirf[1] = 2;
	    idirf[2] = 1;
	    idirf[3] = 2;
	}

	dg = sqrt(g[1] * g[1] + g[2] * g[2] + g[3] * g[3]);

	if (*kflag == 1) {
	    dh = (z2 - z1 + (p2 - p1) / *rho) / dg;

/*           reverting the order in xpu and ypu and storing the */
/*           result in xxpu and yypu */

	    i__1 = npu;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		xxpu[i__ - 1] = xpu[npu + 1 - i__ - 1];
		yypu[i__ - 1] = ypu[npu + 1 - i__ - 1];
	    }
	    ident_(yypu, &dh, &npu, &id);
	    if (id == 0) {
		*xflow = xxpu[0];
	    } else if (id == npu) {
		*xflow = 0.;
	    } else {
		*xflow = xxpu[id - 1] + (xxpu[id] - xxpu[id - 1]) * (dh - 
			yypu[id - 1]) / (yypu[id] - yypu[id - 1]);
	    }
	} else {
	    df[1] = 1. / *rho;
	    df[3] = -df[1];
	    *xflow /= *rho;
	    ident_(xpu, xflow, &npu, &id);
	    if (id == 0) {
		if (*xflow >= 0.) {
		    *f = z1 - z2 + (p1 - p2) / *rho + dg * ypu[0];
		    df[2] = 0.;
		} else {
		    df[2] = -1e10;
		    *f = z1 - z2 + (p1 - p2) / *rho + dg * (ypu[0] + *xflow * 
			    df[2]);
		    df[2] = df[2] * dg / *rho;
		}
	    } else if (id == npu) {
		df[2] = -1e10;
		*f = z1 - z2 + (p1 - p2) / *rho + dg * (ypu[npu - 1] + df[2] *
			 (*xflow - xpu[npu - 1]));
		df[2] = df[2] * dg / *rho;
	    } else {
		df[2] = (ypu[id] - ypu[id - 1]) / (xpu[id] - xpu[id - 1]);
		*f = z1 - z2 + (p1 - p2) / *rho + dg * (ypu[id - 1] + (*xflow 
			- xpu[id - 1]) * df[2]);
		df[2] = df[2] * dg / *rho;
	    }
	}

    }

    *xflow /= *iaxial;
    df[2] *= *iaxial;

    return 0;
} /* liquidpump_ */

