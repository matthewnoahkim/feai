/* stressintensity.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int stressintensity_(integer *nfront, integer *ifrontrel, 
	doublereal *stress, doublereal *xt, doublereal *xn, doublereal *xa, 
	doublereal *dk1, doublereal *dk2, doublereal *dk3, doublereal *xkeq, 
	doublereal *phi, doublereal *psi, doublereal *acrack, doublereal *
	shape, integer *nstep)
{
    /* Format strings */
    static char fmt_100[] = "(2i10,3(1x,e11.4))";

    /* System generated locals */
    integer stress_dim2, stress_offset, dk1_dim1, dk1_offset, dk2_dim1, 
	    dk2_offset, dk3_dim1, dk3_offset, xkeq_dim1, xkeq_offset, 
	    phi_dim1, phi_offset, psi_dim1, psi_offset, i__1, i__2;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double atan(doublereal), sqrt(doublereal);
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void), s_wsfe(cilist *), do_fio(integer *, char *, ftnlen),
	     e_wsfe(void);

    /* Local variables */
    doublereal constant;
    integer i__, m;
    doublereal s[9]	/* was [3][3] */, t[3], c1, c2, c3, c4, pi, term, 
	    ratio;
    integer noderel;

    /* Fortran I/O blocks */
    static cilist io___13 = { 0, 6, 0, 0, 0 };
    static cilist io___14 = { 0, 6, 0, 0, 0 };
    static cilist io___16 = { 0, 6, 0, fmt_100, 0 };
    static cilist io___17 = { 0, 6, 0, 0, 0 };
    static cilist io___18 = { 0, 6, 0, 0, 0 };
    static cilist io___19 = { 0, 6, 0, 0, 0 };
    static cilist io___20 = { 0, 6, 0, fmt_100, 0 };
    static cilist io___21 = { 0, 6, 0, 0, 0 };



/*     calculate the stress intensity factors along the crack fronts */




    /* Parameter adjustments */
    --ifrontrel;
    xt -= 4;
    xn -= 4;
    xa -= 4;
    --acrack;
    shape -= 4;
    psi_dim1 = *nstep;
    psi_offset = 1 + psi_dim1;
    psi -= psi_offset;
    phi_dim1 = *nstep;
    phi_offset = 1 + phi_dim1;
    phi -= phi_offset;
    xkeq_dim1 = *nstep;
    xkeq_offset = 1 + xkeq_dim1;
    xkeq -= xkeq_offset;
    dk3_dim1 = *nstep;
    dk3_offset = 1 + dk3_dim1;
    dk3 -= dk3_offset;
    dk2_dim1 = *nstep;
    dk2_offset = 1 + dk2_dim1;
    dk2 -= dk2_offset;
    dk1_dim1 = *nstep;
    dk1_offset = 1 + dk1_dim1;
    dk1 -= dk1_offset;
    stress_dim2 = *nstep;
    stress_offset = 1 + 6 * (1 + stress_dim2);
    stress -= stress_offset;

    /* Function Body */
    pi = atan(1.) * 4.;
    c2 = pi * 70. / 180.;
    c3 = pi * 78. / 180.;
    c4 = pi * 33. / 180.;

    i__1 = *nfront;
    for (i__ = 1; i__ <= i__1; ++i__) {

/*     loop over all nodes belonging to the crack front(s) */

	noderel = ifrontrel[i__];

	i__2 = *nstep;
	for (m = 1; m <= i__2; ++m) {
	    s[0] = stress[(m + noderel * stress_dim2) * 6 + 1];
	    s[3] = stress[(m + noderel * stress_dim2) * 6 + 4];
	    s[6] = stress[(m + noderel * stress_dim2) * 6 + 6];
	    s[1] = s[3];
	    s[4] = stress[(m + noderel * stress_dim2) * 6 + 2];
	    s[7] = stress[(m + noderel * stress_dim2) * 6 + 5];
	    s[2] = s[6];
	    s[5] = s[7];
	    s[8] = stress[(m + noderel * stress_dim2) * 6 + 3];

/*     calculating the stress vector on the crack plane */

	    t[0] = s[0] * xn[i__ * 3 + 1] + s[3] * xn[i__ * 3 + 2] + s[6] * 
		    xn[i__ * 3 + 3];
	    t[1] = s[1] * xn[i__ * 3 + 1] + s[4] * xn[i__ * 3 + 2] + s[7] * 
		    xn[i__ * 3 + 3];
	    t[2] = s[2] * xn[i__ * 3 + 1] + s[5] * xn[i__ * 3 + 2] + s[8] * 
		    xn[i__ * 3 + 3];

/*     calculating the stress intensity factors */

	    dk1[m + i__ * dk1_dim1] = t[0] * xn[i__ * 3 + 1] + t[1] * xn[i__ *
		     3 + 2] + t[2] * xn[i__ * 3 + 3];
	    dk2[m + i__ * dk2_dim1] = t[0] * xa[i__ * 3 + 1] + t[1] * xa[i__ *
		     3 + 2] + t[2] * xa[i__ * 3 + 3];
	    dk3[m + i__ * dk3_dim1] = t[0] * xt[i__ * 3 + 1] + t[1] * xt[i__ *
		     3 + 2] + t[2] * xt[i__ * 3 + 3];

/*     taking the formula for the subsurface circular crack */

/*          write(*,*) 'sh1 ',shape(1,i),shape(2,i),shape(3,i) */
/*          write(*,*) */
	    constant = sqrt(pi * acrack[i__]);
	    dk1[m + i__ * dk1_dim1] = dk1[m + i__ * dk1_dim1] * shape[i__ * 3 
		    + 1] * constant;
	    dk2[m + i__ * dk2_dim1] = dk2[m + i__ * dk2_dim1] * shape[i__ * 3 
		    + 2] * constant;
	    dk3[m + i__ * dk3_dim1] = dk3[m + i__ * dk3_dim1] * shape[i__ * 3 
		    + 3] * constant;
	}
    }

/*     calculating the equivalent K-factor, the deflection angle */
/*     and twist angle (formulas by Hans Richard, University of Paderborn; */
/*     slightly modified to accomodate negative dk1 as well) */

    i__1 = *nfront;
    for (i__ = 1; i__ <= i__1; ++i__) {
	i__2 = *nstep;
	for (m = 1; m <= i__2; ++m) {
	    if (dk1[m + i__ * dk1_dim1] >= 0.) {
		xkeq[m + i__ * xkeq_dim1] = (dk1[m + i__ * dk1_dim1] + sqrt(
			dk1[m + i__ * dk1_dim1] * dk1[m + i__ * dk1_dim1] + 
			dk2[m + i__ * dk2_dim1] * 5.3361f * dk2[m + i__ * 
			dk2_dim1] + dk3[m + i__ * dk3_dim1] * 4. * dk3[m + 
			i__ * dk3_dim1])) / 2.;
		if (xkeq[m + i__ * xkeq_dim1] > 1e-20) {
		    term = dk1[m + i__ * dk1_dim1] + (d__1 = dk2[m + i__ * 
			    dk2_dim1], abs(d__1)) + (d__2 = dk3[m + i__ * 
			    dk3_dim1], abs(d__2));
		    ratio = (d__1 = dk2[m + i__ * dk2_dim1], abs(d__1)) / 
			    term;
		    phi[m + i__ * phi_dim1] = -c2 * ratio * (2. - ratio) * 
			    dk2[m + i__ * dk2_dim1] / (d__1 = dk2[m + i__ * 
			    dk2_dim1], abs(d__1));
		    ratio = (d__1 = dk3[m + i__ * dk3_dim1], abs(d__1)) / 
			    term;
		    psi[m + i__ * psi_dim1] = -ratio * (c3 - c4 * ratio) * 
			    dk3[m + i__ * dk3_dim1] / (d__1 = dk3[m + i__ * 
			    dk3_dim1], abs(d__1));
		} else {
		    phi[m + i__ * phi_dim1] = 0.;
		    psi[m + i__ * psi_dim1] = 0.;
		}
	    } else {
		xkeq[m + i__ * xkeq_dim1] = -(-dk1[m + i__ * dk1_dim1] + sqrt(
			dk1[m + i__ * dk1_dim1] * dk1[m + i__ * dk1_dim1] + 
			dk2[m + i__ * dk2_dim1] * 5.3361f * dk2[m + i__ * 
			dk2_dim1] + dk3[m + i__ * dk3_dim1] * 4. * dk3[m + 
			i__ * dk3_dim1])) / 2.;

/*     for negative equivalent K-factor the formulas of Richard */
/*     probably do not apply: to be checked! */

		phi[m + i__ * phi_dim1] = 0.;
		psi[m + i__ * psi_dim1] = 0.;
	    }
	}
    }

    s_wsle(&io___13);
    do_lio(&c__9, &c__1, "stressintensity k1 k2 k3", (ftnlen)24);
    e_wsle();
    s_wsle(&io___14);
    e_wsle();
    c1 = 1. / sqrt(1e3);
    i__1 = *nstep;
    for (m = 1; m <= i__1; ++m) {
	i__2 = *nfront;
	for (i__ = 1; i__ <= i__2; ++i__) {
	    s_wsfe(&io___16);
	    do_fio(&c__1, (char *)&m, (ftnlen)sizeof(integer));
	    do_fio(&c__1, (char *)&i__, (ftnlen)sizeof(integer));
	    d__1 = c1 * dk1[m + i__ * dk1_dim1];
	    do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
	    d__2 = c1 * dk2[m + i__ * dk2_dim1];
	    do_fio(&c__1, (char *)&d__2, (ftnlen)sizeof(doublereal));
	    d__3 = c1 * dk3[m + i__ * dk3_dim1];
	    do_fio(&c__1, (char *)&d__3, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	}
	s_wsle(&io___17);
	e_wsle();
    }

    s_wsle(&io___18);
    do_lio(&c__9, &c__1, "stressintensity keq phi psi", (ftnlen)27);
    e_wsle();
    s_wsle(&io___19);
    e_wsle();
    i__1 = *nstep;
    for (m = 1; m <= i__1; ++m) {
	i__2 = *nfront;
	for (i__ = 1; i__ <= i__2; ++i__) {
	    s_wsfe(&io___20);
	    do_fio(&c__1, (char *)&m, (ftnlen)sizeof(integer));
	    do_fio(&c__1, (char *)&i__, (ftnlen)sizeof(integer));
	    d__1 = c1 * xkeq[m + i__ * xkeq_dim1];
	    do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
	    d__2 = phi[m + i__ * phi_dim1] * 180. / pi;
	    do_fio(&c__1, (char *)&d__2, (ftnlen)sizeof(doublereal));
	    d__3 = psi[m + i__ * psi_dim1] * 180. / pi;
	    do_fio(&c__1, (char *)&d__3, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	}
	s_wsle(&io___21);
	e_wsle();
    }

    return 0;
} /* stressintensity_ */

