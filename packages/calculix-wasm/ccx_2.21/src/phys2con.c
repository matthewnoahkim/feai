/* phys2con.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int phys2con_(integer *inomat, doublereal *vold, integer *
	ntmat___, doublereal *shcon, integer *nshcon, doublereal *physcon, 
	integer *compressible, doublereal *vcon, doublereal *rhcon, integer *
	nrhcon, integer *ithermal, integer *mi, integer *ifreesurface, 
	integer *ierr, doublereal *dgravity, doublereal *depth, integer *nk, 
	integer *nka, integer *nkb)
{
    /* System generated locals */
    integer rhcon_dim2, rhcon_offset, shcon_dim2, shcon_offset, vold_dim1, 
	    vold_offset, vcon_dim1, vcon_offset, i__1;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);
    double sqrt(doublereal);

    /* Local variables */
    extern /* Subroutine */ int materialdata_rho__(doublereal *, integer *, 
	    integer *, doublereal *, doublereal *, integer *, integer *);
    integer k;
    doublereal r__, cp, rho;
    extern /* Subroutine */ int materialdata_cp_sec__(integer *, integer *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *)
	    ;
    integer node, imat;
    doublereal temp;

    /* Fortran I/O blocks */
    static cilist io___7 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 6, 0, 0, 0 };



/*     calculates the conservative variables from the physical variables */
/*     only for vcon(0...4), i.e. rho*epsilon,rho*vx,rho*vy,rho*vz,rho */

/*     NOT for the turbulent parameters */




    /* Parameter adjustments */
    --inomat;
    rhcon_dim2 = *ntmat___;
    rhcon_offset = 0 + 2 * (1 + rhcon_dim2);
    rhcon -= rhcon_offset;
    shcon_dim2 = *ntmat___;
    shcon_offset = 0 + 4 * (1 + shcon_dim2);
    shcon -= shcon_offset;
    --nshcon;
    --physcon;
    --nrhcon;
    --ithermal;
    --mi;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;
    --depth;
    vcon_dim1 = *nk;
    vcon_offset = 1 + vcon_dim1 * 0;
    vcon -= vcon_offset;

    /* Function Body */
    i__1 = *nkb;
    for (node = *nka; node <= i__1; ++node) {
	imat = inomat[node];
	temp = vold[node * vold_dim1];
	materialdata_cp_sec__(&imat, ntmat___, &temp, &shcon[shcon_offset], &
		nshcon[1], &cp, &physcon[1]);

	if (*compressible == 1) {

/*     compressible calculations (gas or shallow water) */

	    if (*ifreesurface == 0) {
		r__ = shcon[(imat * shcon_dim2 + 1 << 2) + 3];
		rho = vold[node * vold_dim1 + 4] / (r__ * (vold[node * 
			vold_dim1] - physcon[1]));
/* Computing 2nd power */
		d__1 = vold[node * vold_dim1 + 1];
/* Computing 2nd power */
		d__2 = vold[node * vold_dim1 + 2];
/* Computing 2nd power */
		d__3 = vold[node * vold_dim1 + 3];
		vcon[node] = rho * (cp * (temp - physcon[1]) + (d__1 * d__1 + 
			d__2 * d__2 + d__3 * d__3) / 2.) - vold[node * 
			vold_dim1 + 4];
	    } else {

/*     shallow water equations */

/* Computing 2nd power */
		d__1 = depth[node];
		rho = vold[node * vold_dim1 + 4] * 2. / *dgravity + d__1 * 
			d__1;
		if (rho <= 0.) {
		    s_wsle(&io___7);
		    do_lio(&c__9, &c__1, "*ERROR in phys2con: fluid depth ca"
			    "nnot", (ftnlen)38);
		    e_wsle();
		    s_wsle(&io___8);
		    do_lio(&c__9, &c__1, "       be determined", (ftnlen)20);
		    e_wsle();
		    *ierr = 1;
		    return 0;
		} else {
		    rho = sqrt(rho);
		}
		if (ithermal[1] > 1) {
/* Computing 2nd power */
		    d__1 = vold[node * vold_dim1 + 1];
/* Computing 2nd power */
		    d__2 = vold[node * vold_dim1 + 2];
/* Computing 2nd power */
		    d__3 = vold[node * vold_dim1 + 3];
		    vcon[node] = rho * (cp * (temp - physcon[1]) + (d__1 * 
			    d__1 + d__2 * d__2 + d__3 * d__3) / 2.);
		}
	    }
	    vcon[node + (vcon_dim1 << 2)] = rho;
	} else {

/*     incompressible calculations (liquid) */

	    if (ithermal[1] > 1) {
		materialdata_rho__(&rhcon[rhcon_offset], &nrhcon[1], &imat, &
			rho, &temp, ntmat___, &ithermal[1]);
/* Computing 2nd power */
		d__1 = vold[node * vold_dim1 + 1];
/* Computing 2nd power */
		d__2 = vold[node * vold_dim1 + 2];
/* Computing 2nd power */
		d__3 = vold[node * vold_dim1 + 3];
		vcon[node] = rho * (cp * (temp - physcon[1]) + (d__1 * d__1 + 
			d__2 * d__2 + d__3 * d__3) / 2.);
		vcon[node + (vcon_dim1 << 2)] = rho;
	    } else {
		rho = vcon[node + (vcon_dim1 << 2)];
	    }
	}

	for (k = 1; k <= 3; ++k) {
	    vcon[node + k * vcon_dim1] = rho * vold[k + node * vold_dim1];
	}
    }

    return 0;
} /* phys2con_ */

