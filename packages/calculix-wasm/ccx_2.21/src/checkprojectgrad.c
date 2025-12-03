/* checkprojectgrad.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int checkprojectgrad_(integer *nactiveold, integer *nactive, 
	integer *ipoacti, integer *ipoactiold, char *objectset, doublereal *
	xlambd, integer *nnlconst, integer *iconstacti, integer *
	iconstactiold, integer *inameacti, integer *inameactiold, doublereal *
	g0, integer *nobject, integer *ndesi, integer *nodedesi, doublereal *
	dgdxglob, integer *nk, ftnlen objectset_len)
{
    /* System generated locals */
    integer dgdxglob_dim2, dgdxglob_offset, i__1, i__2;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    integer i__, j;
    doublereal val;
    integer nnlconstold, iact, node;


/*     checks the lagrange multipliers and reduces the number of active */
/*     constraints if possible and update the values of the response */
/*     functions for the linear constraints */






    /* Parameter adjustments */
    --ipoacti;
    --ipoactiold;
    objectset -= 486;
    --xlambd;
    --iconstacti;
    --iconstactiold;
    --inameacti;
    --inameactiold;
    --g0;
    --nodedesi;
    dgdxglob_dim2 = *nk;
    dgdxglob_offset = 1 + 2 * (1 + dgdxglob_dim2);
    dgdxglob -= dgdxglob_offset;

    /* Function Body */
    i__1 = *nactive;
    for (i__ = 1; i__ <= i__1; ++i__) {
	ipoactiold[i__] = ipoacti[i__];
	iconstactiold[i__] = iconstacti[i__];
	inameactiold[i__] = inameacti[i__];
    }

    *nactiveold = *nactive;
    nnlconstold = *nnlconst;
    *nactive = 0;
    *nnlconst = 0;

    i__1 = *nactiveold;
    for (i__ = 1; i__ <= i__1; ++i__) {

/*        check of all nonlinear constraints */

	if (i__ <= nnlconstold) {
	    if (iconstactiold[i__] == -1) {
		if (xlambd[i__] < 0.) {
		    ++(*nactive);
		    ++(*nnlconst);
		    ipoacti[*nactive] = ipoactiold[i__];
		    iconstacti[*nactive] = iconstactiold[i__];
		    inameacti[*nactive] = inameactiold[i__];
		}
	    } else if (iconstactiold[i__] == 1) {
		if (xlambd[i__] > 0.) {
		    ++(*nactive);
		    ++(*nnlconst);
		    ipoacti[*nactive] = ipoactiold[i__];
		    iconstacti[*nactive] = iconstactiold[i__];
		    inameacti[*nactive] = inameactiold[i__];
		}
	    }

/*        check of all geometric (linear) constraints */

	} else {

/*           MAXMEMBERSIZE */

	    if (s_cmp(objectset + (inameacti[i__] * 5 + 1) * 81, "MAXMEMBERS"
		    "IZE", (ftnlen)13, (ftnlen)13) == 0) {
		node = nodedesi[ipoacti[i__]];
		val = dgdxglob[(node + inameacti[i__] * dgdxglob_dim2 << 1) + 
			2];
		if (xlambd[i__] < 0. && val > 0.) {
		    ++(*nactive);
		    ipoacti[*nactive] = ipoactiold[i__];
		    iconstacti[*nactive] = iconstactiold[i__];
		    inameacti[*nactive] = inameactiold[i__];
		}

/*           MINMEMBERSIZE */

	    } else if (s_cmp(objectset + (inameacti[i__] * 5 + 1) * 81, "MIN"
		    "MEMBERSIZE", (ftnlen)13, (ftnlen)13) == 0) {
		node = nodedesi[ipoacti[i__]];
		val = dgdxglob[(node + inameacti[i__] * dgdxglob_dim2 << 1) + 
			2];
		if (xlambd[i__] > 0. && val > 0.) {
		    ++(*nactive);
		    ipoacti[*nactive] = ipoactiold[i__];
		    iconstacti[*nactive] = iconstactiold[i__];
		    inameacti[*nactive] = inameactiold[i__];
		}

/*           MAXSHRINKAGE */

	    } else if (s_cmp(objectset + ((inameacti[i__] * 5 + 1) * 81 + 3), 
		    "SHRINKAGE", (ftnlen)9, (ftnlen)9) == 0) {
		node = nodedesi[ipoactiold[i__]];
		val = dgdxglob[(node + inameactiold[i__] * dgdxglob_dim2 << 1)
			 + 2];
		if (xlambd[i__] > 0. && val >= 0.) {
		    ++(*nactive);
		    ipoacti[*nactive] = ipoactiold[i__];
		    iconstacti[*nactive] = iconstactiold[i__];
		    inameacti[*nactive] = inameactiold[i__];
		}

/*           MAXGROWTH */

	    } else if (s_cmp(objectset + ((inameacti[i__] * 5 + 1) * 81 + 3), 
		    "GROWTH", (ftnlen)6, (ftnlen)6) == 0) {
		node = nodedesi[ipoactiold[i__]];
		val = dgdxglob[(node + inameactiold[i__] * dgdxglob_dim2 << 1)
			 + 2];
		if (xlambd[i__] < 0. && val >= 0.) {
		    ++(*nactive);
		    ipoacti[*nactive] = ipoactiold[i__];
		    iconstacti[*nactive] = iconstactiold[i__];
		    inameacti[*nactive] = inameactiold[i__];
		}

/*           PACKAGING */

	    } else if (s_cmp(objectset + (inameacti[i__] * 5 + 1) * 81, "PAC"
		    "KAGING", (ftnlen)9, (ftnlen)9) == 0) {
		node = nodedesi[ipoactiold[i__]];
		val = dgdxglob[(node + inameactiold[i__] * dgdxglob_dim2 << 1)
			 + 2];
		if (xlambd[i__] < 0. && val >= 0.) {
		    ++(*nactive);
		    ipoacti[*nactive] = ipoactiold[i__];
		    iconstacti[*nactive] = iconstactiold[i__];
		    inameacti[*nactive] = inameactiold[i__];
		}
	    }
	}
    }

/*     update the values of the response functions and */
/*     the sensitivities for the linear constraint */

    i__1 = *nobject - 1;
    for (i__ = 1; i__ <= i__1; ++i__) {
	if (*(unsigned char *)&objectset[(i__ * 5 + 5) * 81 + 80] == 'G') {
	    iact = 0;
	    i__2 = *nactive;
	    for (j = 1; j <= i__2; ++j) {
		if (inameacti[j] == i__) {
		    ++iact;
		}
	    }
	    g0[i__] = (doublereal) iact;
	}
    }

    return 0;
} /* checkprojectgrad_ */

