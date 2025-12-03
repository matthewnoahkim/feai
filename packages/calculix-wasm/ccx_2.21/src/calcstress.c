/* calcstress.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int calcstress_(char *objectset, integer *iobject, 
	doublereal *stn, integer *inode, doublereal *stressval, ftnlen 
	objectset_len)
{
    /* System generated locals */
    doublereal d__1, d__2, d__3, d__4, d__5, d__6;

    /* Builtin functions */
    double atan(doublereal);
    integer s_cmp(char *, char *, ftnlen, ftnlen);
    double sqrt(doublereal), acos(doublereal), cos(doublereal);
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    integer j;
    doublereal p[3], q, i1, i2, i3, p___[3], sd[6], pi, phi, val1, val2, mean,
	     maxs;
    extern /* Subroutine */ int exit_(integer *);

    /* Fortran I/O blocks */
    static cilist io___15 = { 0, 6, 0, 0, 0 };
    static cilist io___16 = { 0, 6, 0, 0, 0 };



/*     calculates the stress measure defined in obejctset */





    /* Parameter adjustments */
    stn -= 7;
    objectset -= 486;

    /* Function Body */
    pi = atan(1.) * 4.;

/*     Calculate Mises stress */

    if (s_cmp(objectset + (*iobject * 5 + 1) * 81, "MISESSTRESS", (ftnlen)11, 
	    (ftnlen)11) == 0 || s_cmp(objectset + (*iobject * 5 + 1) * 81, 
	    "MODALSTRESS", (ftnlen)11, (ftnlen)11) == 0) {
	q = -(stn[*inode * 6 + 1] + stn[*inode * 6 + 2] + stn[*inode * 6 + 3])
		 / 3.;
/* Computing 2nd power */
	d__1 = stn[*inode * 6 + 1] + q;
/* Computing 2nd power */
	d__2 = stn[*inode * 6 + 2] + q;
/* Computing 2nd power */
	d__3 = stn[*inode * 6 + 3] + q;
/* Computing 2nd power */
	d__4 = stn[*inode * 6 + 4];
/* Computing 2nd power */
	d__5 = stn[*inode * 6 + 5];
/* Computing 2nd power */
	d__6 = stn[*inode * 6 + 6];
	*stressval = sqrt((d__1 * d__1 + d__2 * d__2 + d__3 * d__3 + (d__4 * 
		d__4 + d__5 * d__5 + d__6 * d__6) * 2.) * 1.5);

/*     Calculate Principal stresses */

    } else if (s_cmp(objectset + (*iobject * 5 + 1) * 81, "PS1STRESS", (
	    ftnlen)9, (ftnlen)9) == 0 || s_cmp(objectset + (*iobject * 5 + 1) 
	    * 81, "PS3STRESS", (ftnlen)9, (ftnlen)9) == 0) {

/*     check if stress tensor contains only zeros */

	maxs = 0.;
	for (j = 1; j <= 6; ++j) {
/* Computing MAX */
	    d__2 = maxs, d__3 = (d__1 = stn[j + *inode * 6], abs(d__1));
	    maxs = max(d__2,d__3);
	}
	if (maxs == 0.) {
	    p[0] = 0.;
	    p[1] = 0.;
	    p[2] = 0.;
	} else {
	    for (j = 1; j <= 6; ++j) {
		sd[j - 1] = stn[j + *inode * 6] / maxs;
	    }
	    mean = 0.;
	    for (j = 1; j <= 3; ++j) {
		mean += sd[j - 1];
	    }

/*     calculation of invariants */

	    i1 = -(sd[0] + sd[1] + sd[2]);
	    i2 = sd[0] * sd[1] + sd[1] * sd[2] + sd[2] * sd[0] - sd[3] * sd[3]
		     - sd[4] * sd[4] - sd[5] * sd[5];
	    i3 = -(sd[0] * sd[1] * sd[2] + sd[3] * 2 * sd[4] * sd[5] - sd[0] *
		     sd[4] * sd[4] - sd[1] * sd[5] * sd[5] - sd[2] * sd[3] * 
		    sd[3]);

	    if (abs(i1) <= 0. && abs(i2) <= 0. && abs(i3) <= 0.) {

/*     if all principals 0 */

		p[0] = 0.;
		p[1] = 0.;
		p[2] = 0.;
	    } else if (abs(i2) < 0. && abs(i3) <= 0.) {

/*     if just one principal is not zero */

		p[0] = 0.;
		p[1] = 0.;
		p[2] = 0.;
		if (-i1 < 0.) {
		    p___[2] = -i1 * maxs;
		} else {
		    p___[0] = -i1 * maxs;
		}
	    } else if ((d__1 = (sd[0] - sd[1]) / mean, abs(d__1)) < 1e-5f && (
		    d__2 = (sd[0] - sd[2]) / mean, abs(d__2)) < 1e-5f) {

/*     case of hydrstatic stress state */

		if ((d__1 = sd[3] / mean, abs(d__1)) < 1e-5f && (d__2 = sd[4] 
			/ mean, abs(d__2)) < 1e-5f && (d__3 = sd[5] / mean, 
			abs(d__3)) < 1e-5f) {

/*     case that shear stresses are zero */
/*     --> principal stresses already available */

		    i1 = 0.;
		    for (j = 1; j <= 6; ++j) {
			i1 += sd[j - 1] * maxs;
		    }
		    p[0] = i1;
		    p[1] = i1;
		    p[2] = i1;
		} else {

/*     case that shear stresses are to zero */
/*     --> principal stresses have to be calculated */

		    val1 = (i2 - i1 * i1 / 3.f) / 3.f;
		    val2 = (i1 * i1 * i1 / 13.5f - i1 * i2 / 3.f + i3) * .5f;

		    val1 = sqrt((abs(val1))) * abs(val2) / val2;
		    phi = val2 / (val1 * val1 * val1);

		    if (phi > 1.) {
			phi = 0.;
		    } else if (phi < -1.) {
			phi = pi;
		    } else {
			phi = acos(phi);
		    }
		    p___[0] = val1 * -2 * cos(phi / 3.f) - i1 / 3.f;
		    p___[1] = val1 * 2 * cos(pi / 3.f - phi / 3.f) - i1 / 3.f;
		    p___[2] = val1 * 2 * cos(pi / 3.f + phi / 3.f) - i1 / 3.f;
		}
	    } else {

/*     all other cases */

		val1 = (i2 - i1 * i1 / 3.f) / 3.f;
		val2 = (i1 * i1 * i1 / 13.5f - i1 * i2 / 3.f + i3) * .5f;

		val1 = sqrt((abs(val1))) * abs(val2) / val2;
		phi = val2 / (val1 * val1 * val1);

		if (phi > 1.) {
		    phi = 0.;
		} else if (phi < -1.) {
		    phi = pi;
		} else {
		    phi = acos(phi);
		}
		p___[0] = val1 * -2 * cos(phi / 3.f) - i1 / 3.f;
		p___[1] = val1 * 2 * cos(pi / 3.f - phi / 3.f) - i1 / 3.f;
		p___[2] = val1 * 2 * cos(pi / 3.f + phi / 3.f) - i1 / 3.f;
	    }
	}

/*     sorting of principal stress */

	for (j = 1; j <= 3; ++j) {
	    p___[j - 1] *= maxs;
	}

/*     1st greatest */

	if (p___[0] >= p___[1] && p___[0] >= p___[2]) {
	    p[0] = p___[0];
	    if (p___[1] > p___[2]) {
		p[1] = p___[1];
		p[2] = p___[2];
	    } else {
		p[1] = p___[2];
		p[2] = p___[1];
	    }

/*     2nd greatest */

	} else if (p___[1] >= p___[0] && p___[1] >= p___[2]) {
	    p[0] = p___[1];
	    if (p___[0] > p___[2]) {
		p[1] = p___[0];
		p[2] = p___[2];
	    } else {
		p[1] = p___[2];
		p[2] = p___[0];
	    }

/*     3rd greatest */

	} else if (p___[2] >= p___[0] && p___[2] >= p___[1]) {
	    p[0] = p___[2];
	    if (p___[0] > p___[1]) {
		p[1] = p___[0];
		p[2] = p___[1];
	    } else {
		p[1] = p___[1];
		p[2] = p___[0];
	    }
	} else {
	    s_wsle(&io___15);
	    do_lio(&c__9, &c__1, "ERROR: calcualtion of principal stresses as"
		    , (ftnlen)43);
	    e_wsle();
	    s_wsle(&io___16);
	    do_lio(&c__9, &c__1, "       input for the KS-function failed", (
		    ftnlen)39);
	    e_wsle();
	    exit_(&c__201);
	}

/*     return of PS1 or PS3 stress value */

	if (s_cmp(objectset + (*iobject * 5 + 1) * 81, "PS1STRESS", (ftnlen)9,
		 (ftnlen)9) == 0) {
	    *stressval = p[0];
	} else if (s_cmp(objectset + (*iobject * 5 + 1) * 81, "PS3STRESS", (
		ftnlen)9, (ftnlen)9) == 0) {
	    *stressval = p[2];
	}
    }

    return 0;
} /* calcstress_ */

