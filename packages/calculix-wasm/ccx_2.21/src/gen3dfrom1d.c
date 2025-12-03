/* gen3dfrom1d.f -- translated by f2c (version 20200916).
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
static integer c__3 = 3;
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

/* Subroutine */ int gen3dfrom1d_(integer *i__, integer *kon, integer *ipkon, 
	char *lakon, integer *ne, integer *iponor, doublereal *xnor, integer *
	knor, doublereal *thicke, integer *ntrans, integer *inotr, doublereal 
	*trab, integer *nk, integer *nk___, doublereal *co, doublereal *
	offset, integer *mi, ftnlen lakon_len)
{
    /* System generated locals */
    integer thicke_dim1, thicke_offset, i__1;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen), s_wsle(cilist *), do_lio(
	    integer *, integer *, char *, ftnlen), e_wsle(void);
    double sqrt(doublereal);

    /* Local variables */
    integer j, k;
    doublereal sc;
    integer nope;
    extern /* Subroutine */ int exit_(integer *);
    integer nodeb[24]	/* was [8][3] */, nodel[8];
    doublereal xnorb[18]	/* was [6][3] */, thickb[6]	/* was [2][3] 
	    */;
    integer indexe, indexk, ishift, indexx;

    /* Fortran I/O blocks */
    static cilist io___12 = { 0, 6, 0, 0, 0 };
    static cilist io___13 = { 0, 6, 0, 0, 0 };



/*     expands 1d element i into a 3d element */





    /* Parameter adjustments */
    --kon;
    --ipkon;
    lakon -= 8;
    iponor -= 3;
    --xnor;
    --knor;
    inotr -= 3;
    trab -= 8;
    co -= 4;
    offset -= 3;
    --mi;
    thicke_dim1 = mi[3];
    thicke_offset = 1 + thicke_dim1;
    thicke -= thicke_offset;

    /* Function Body */
    indexe = ipkon[*i__];

/*     check whether linear or quadratic */

    if (*(unsigned char *)&lakon[(*i__ << 3) + 2] == '1' || *(unsigned char *)
	    &lakon[(*i__ << 3) + 3] == '2') {
	nope = 2;
	if (*(unsigned char *)&lakon[(*i__ << 3) + 3] == 'R') {
	    ishift = 8;
	} else {
	    ishift = 11;
	}
    } else if (*(unsigned char *)&lakon[(*i__ << 3) + 2] == '2' || s_cmp(
	    lakon + ((*i__ << 3) + 3), "3", (ftnlen)2, (ftnlen)1) == 0) {
	nope = 3;
	ishift = 20;
    }

/*     localizing the nodes, thicknesses and normals for the */
/*     beam element */

/*      do j=1,3 */
    i__1 = nope;
    for (j = 1; j <= i__1; ++j) {
	nodel[j - 1] = kon[indexe + j];
	kon[indexe + ishift + j] = nodel[j - 1];
	indexx = iponor[(indexe + j << 1) + 1];
	indexk = iponor[(indexe + j << 1) + 2];
	thickb[(j << 1) - 2] = thicke[(indexe + j) * thicke_dim1 + 1];
	thickb[(j << 1) - 1] = thicke[(indexe + j) * thicke_dim1 + 2];
	for (k = 1; k <= 6; ++k) {
	    xnorb[k + j * 6 - 7] = xnor[indexx + k];
	}
	for (k = 1; k <= 8; ++k) {
	    nodeb[k + (j << 3) - 9] = knor[indexk + k];
	}
	if (*ntrans > 0) {
	    for (k = 1; k <= 8; ++k) {
		inotr[(nodeb[k + (j << 3) - 9] << 1) + 1] = inotr[(nodel[j - 
			1] << 1) + 1];
	    }
	}
    }

/*     generating the 3-D element topology for beam elements */

/*     rectangular cross section (or parent section) */

    if (*(unsigned char *)&lakon[(*i__ << 3) + 7] != 'C') {
	kon[indexe + 1] = nodeb[0];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[0] * 3] = co[j + nodel[0] * 3] - thickb[0] * xnorb[j 
		    - 1] * (offset[(*i__ << 1) + 1] + .5) + thickb[1] * xnorb[
		    j + 2] * (.5 - offset[(*i__ << 1) + 2]);
	}
	kon[indexe + 2] = nodeb[(nope << 3) - 8];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[(nope << 3) - 8] * 3] = co[j + nodel[nope - 1] * 3] 
		    - thickb[(nope << 1) - 2] * xnorb[j + nope * 6 - 7] * (
		    offset[(*i__ << 1) + 1] + .5) + thickb[(nope << 1) - 1] * 
		    xnorb[j + 3 + nope * 6 - 7] * (.5 - offset[(*i__ << 1) + 
		    2]);
	}
	kon[indexe + 3] = nodeb[(nope << 3) - 7];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[(nope << 3) - 7] * 3] = co[j + nodel[nope - 1] * 3] 
		    - thickb[(nope << 1) - 2] * xnorb[j + nope * 6 - 7] * (
		    offset[(*i__ << 1) + 1] + .5) - thickb[(nope << 1) - 1] * 
		    xnorb[j + 3 + nope * 6 - 7] * (offset[(*i__ << 1) + 2] + 
		    .5);
	}
	kon[indexe + 4] = nodeb[1];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[1] * 3] = co[j + nodel[0] * 3] - thickb[0] * xnorb[j 
		    - 1] * (offset[(*i__ << 1) + 1] + .5) - thickb[1] * xnorb[
		    j + 2] * (offset[(*i__ << 1) + 2] + .5);
	}
	kon[indexe + 5] = nodeb[3];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[3] * 3] = co[j + nodel[0] * 3] + thickb[0] * xnorb[j 
		    - 1] * (.5 - offset[(*i__ << 1) + 1]) + thickb[1] * xnorb[
		    j + 2] * (.5 - offset[(*i__ << 1) + 2]);
	}
	kon[indexe + 6] = nodeb[(nope << 3) - 5];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[(nope << 3) - 5] * 3] = co[j + nodel[nope - 1] * 3] 
		    + thickb[(nope << 1) - 2] * xnorb[j + nope * 6 - 7] * (.5 
		    - offset[(*i__ << 1) + 1]) + thickb[(nope << 1) - 1] * 
		    xnorb[j + 3 + nope * 6 - 7] * (.5 - offset[(*i__ << 1) + 
		    2]);
	}
	kon[indexe + 7] = nodeb[(nope << 3) - 6];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[(nope << 3) - 6] * 3] = co[j + nodel[nope - 1] * 3] 
		    + thickb[(nope << 1) - 2] * xnorb[j + nope * 6 - 7] * (.5 
		    - offset[(*i__ << 1) + 1]) - thickb[(nope << 1) - 1] * 
		    xnorb[j + 3 + nope * 6 - 7] * (offset[(*i__ << 1) + 2] + 
		    .5);
	}
	kon[indexe + 8] = nodeb[2];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[2] * 3] = co[j + nodel[0] * 3] + thickb[0] * xnorb[j 
		    - 1] * (.5 - offset[(*i__ << 1) + 1]) - thickb[1] * xnorb[
		    j + 2] * (offset[(*i__ << 1) + 2] + .5);
	}

/*        middle nodes for quadratic elements */

	if (nope == 3) {
	    kon[indexe + 9] = nodeb[8];
	    for (j = 1; j <= 3; ++j) {
		co[j + nodeb[8] * 3] = co[j + nodel[1] * 3] - thickb[2] * 
			xnorb[j + 5] * (offset[(*i__ << 1) + 1] + .5) + 
			thickb[3] * xnorb[j + 8] * (.5 - offset[(*i__ << 1) + 
			2]);
	    }
	    kon[indexe + 10] = nodeb[20];
	    for (j = 1; j <= 3; ++j) {
		co[j + nodeb[20] * 3] = co[j + nodel[2] * 3] - thickb[4] * 
			xnorb[j + 11] * (offset[(*i__ << 1) + 1] + .5) - 
			thickb[5] * xnorb[j + 14] * offset[(*i__ << 1) + 2];
	    }
	    kon[indexe + 11] = nodeb[9];
	    for (j = 1; j <= 3; ++j) {
		co[j + nodeb[9] * 3] = co[j + nodel[1] * 3] - thickb[2] * 
			xnorb[j + 5] * (offset[(*i__ << 1) + 1] + .5) - 
			thickb[3] * xnorb[j + 8] * (offset[(*i__ << 1) + 2] + 
			.5);
	    }
	    kon[indexe + 12] = nodeb[4];
	    for (j = 1; j <= 3; ++j) {
		co[j + nodeb[4] * 3] = co[j + nodel[0] * 3] - thickb[0] * 
			xnorb[j - 1] * (offset[(*i__ << 1) + 1] + .5) - 
			thickb[1] * xnorb[j + 2] * offset[(*i__ << 1) + 2];
	    }
	    kon[indexe + 13] = nodeb[11];
	    for (j = 1; j <= 3; ++j) {
		co[j + nodeb[11] * 3] = co[j + nodel[1] * 3] + thickb[2] * 
			xnorb[j + 5] * (.5 - offset[(*i__ << 1) + 1]) + 
			thickb[3] * xnorb[j + 8] * (.5 - offset[(*i__ << 1) + 
			2]);
	    }
	    kon[indexe + 14] = nodeb[22];
	    for (j = 1; j <= 3; ++j) {
		co[j + nodeb[22] * 3] = co[j + nodel[2] * 3] + thickb[4] * 
			xnorb[j + 11] * (.5 - offset[(*i__ << 1) + 1]) - 
			thickb[5] * xnorb[j + 14] * offset[(*i__ << 1) + 2];
	    }
	    kon[indexe + 15] = nodeb[10];
	    for (j = 1; j <= 3; ++j) {
		co[j + nodeb[10] * 3] = co[j + nodel[1] * 3] + thickb[2] * 
			xnorb[j + 5] * (.5 - offset[(*i__ << 1) + 1]) - 
			thickb[3] * xnorb[j + 8] * (offset[(*i__ << 1) + 2] + 
			.5);
	    }
	    kon[indexe + 16] = nodeb[6];
	    for (j = 1; j <= 3; ++j) {
		co[j + nodeb[6] * 3] = co[j + nodel[0] * 3] + thickb[0] * 
			xnorb[j - 1] * (.5 - offset[(*i__ << 1) + 1]) - 
			thickb[1] * xnorb[j + 2] * offset[(*i__ << 1) + 2];
	    }
	    kon[indexe + 17] = nodeb[7];
	    for (j = 1; j <= 3; ++j) {
		co[j + nodeb[7] * 3] = co[j + nodel[0] * 3] - thickb[0] * 
			xnorb[j - 1] * offset[(*i__ << 1) + 1] + thickb[1] * 
			xnorb[j + 2] * (.5 - offset[(*i__ << 1) + 2]);
	    }
	    kon[indexe + 18] = nodeb[23];
	    for (j = 1; j <= 3; ++j) {
		co[j + nodeb[23] * 3] = co[j + nodel[2] * 3] - thickb[4] * 
			xnorb[j + 11] * offset[(*i__ << 1) + 1] + thickb[5] * 
			xnorb[j + 14] * (.5 - offset[(*i__ << 1) + 2]);
	    }
	    kon[indexe + 19] = nodeb[21];
	    for (j = 1; j <= 3; ++j) {
		co[j + nodeb[21] * 3] = co[j + nodel[2] * 3] - thickb[4] * 
			xnorb[j + 11] * offset[(*i__ << 1) + 1] - thickb[5] * 
			xnorb[j + 14] * (offset[(*i__ << 1) + 2] + .5);
	    }
	    kon[indexe + 20] = nodeb[5];
	    for (j = 1; j <= 3; ++j) {
		co[j + nodeb[5] * 3] = co[j + nodel[0] * 3] - thickb[0] * 
			xnorb[j - 1] * offset[(*i__ << 1) + 1] - thickb[1] * 
			xnorb[j + 2] * (offset[(*i__ << 1) + 2] + .5);
	    }

/*           generating coordinates for the expanded nodes which */
/*           are not used by the C3D20(R) element (needed for the */
/*           determination of the knot dimension) */

	    for (j = 1; j <= 3; ++j) {
		co[j + nodeb[12] * 3] = co[j + nodel[1] * 3] - thickb[0] * 
			xnorb[j - 1] * (offset[(*i__ << 1) + 1] + .5) - 
			thickb[1] * xnorb[j + 2] * offset[(*i__ << 1) + 2];
	    }
	    for (j = 1; j <= 3; ++j) {
		co[j + nodeb[14] * 3] = co[j + nodel[1] * 3] + thickb[0] * 
			xnorb[j - 1] * (.5 - offset[(*i__ << 1) + 1]) - 
			thickb[1] * xnorb[j + 2] * offset[(*i__ << 1) + 2];
	    }
	    for (j = 1; j <= 3; ++j) {
		co[j + nodeb[15] * 3] = co[j + nodel[1] * 3] - thickb[0] * 
			xnorb[j - 1] * offset[(*i__ << 1) + 1] + thickb[1] * 
			xnorb[j + 2] * (.5 - offset[(*i__ << 1) + 2]);
	    }
	    for (j = 1; j <= 3; ++j) {
		co[j + nodeb[13] * 3] = co[j + nodel[1] * 3] - thickb[0] * 
			xnorb[j - 1] * offset[(*i__ << 1) + 1] - thickb[1] * 
			xnorb[j + 2] * (offset[(*i__ << 1) + 2] + .5);
	    }
	}
    } else {

/*                 circular cross section */

	if (nope == 2) {
	    s_wsle(&io___12);
	    do_lio(&c__9, &c__1, "*ERROR in gen3dfrom1d: element ", (ftnlen)
		    31);
	    do_lio(&c__3, &c__1, (char *)&(*i__), (ftnlen)sizeof(integer));
	    do_lio(&c__9, &c__1, "is a linear beam element with circular cro"
		    "ss section", (ftnlen)52);
	    e_wsle();
	    s_wsle(&io___13);
	    do_lio(&c__9, &c__1, "       Please use quadratic elements for b"
		    "eams  with circular cross section.", (ftnlen)76);
	    e_wsle();
	    exit_(&c__201);
	}

	sc = .5 / sqrt(2.);
	kon[indexe + 1] = nodeb[0];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[0] * 3] = co[j + nodel[0] * 3] - thickb[0] * xnorb[j 
		    - 1] * (sc + offset[(*i__ << 1) + 1]) + thickb[1] * xnorb[
		    j + 2] * (sc - offset[(*i__ << 1) + 2]);
	}
	kon[indexe + 2] = nodeb[16];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[16] * 3] = co[j + nodel[2] * 3] - thickb[4] * xnorb[
		    j + 11] * (sc + offset[(*i__ << 1) + 1]) + thickb[5] * 
		    xnorb[j + 14] * (sc - offset[(*i__ << 1) + 2]);
	}
	kon[indexe + 3] = nodeb[17];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[17] * 3] = co[j + nodel[2] * 3] - thickb[4] * xnorb[
		    j + 11] * (sc + offset[(*i__ << 1) + 1]) - thickb[5] * 
		    xnorb[j + 14] * (sc + offset[(*i__ << 1) + 2]);
	}
	kon[indexe + 4] = nodeb[1];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[1] * 3] = co[j + nodel[0] * 3] - thickb[0] * xnorb[j 
		    - 1] * (sc + offset[(*i__ << 1) + 1]) - thickb[1] * xnorb[
		    j + 2] * (sc + offset[(*i__ << 1) + 2]);
	}
	kon[indexe + 5] = nodeb[3];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[3] * 3] = co[j + nodel[0] * 3] + thickb[0] * xnorb[j 
		    - 1] * (sc - offset[(*i__ << 1) + 1]) + thickb[1] * xnorb[
		    j + 2] * (sc - offset[(*i__ << 1) + 2]);
	}
	kon[indexe + 6] = nodeb[19];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[19] * 3] = co[j + nodel[2] * 3] + thickb[4] * xnorb[
		    j + 11] * (sc - offset[(*i__ << 1) + 1]) + thickb[5] * 
		    xnorb[j + 14] * (sc - offset[(*i__ << 1) + 2]);
	}
	kon[indexe + 7] = nodeb[18];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[18] * 3] = co[j + nodel[2] * 3] + thickb[4] * xnorb[
		    j + 11] * (sc - offset[(*i__ << 1) + 1]) - thickb[5] * 
		    xnorb[j + 14] * (sc + offset[(*i__ << 1) + 2]);
	}
	kon[indexe + 8] = nodeb[2];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[2] * 3] = co[j + nodel[0] * 3] + thickb[0] * xnorb[j 
		    - 1] * (sc - offset[(*i__ << 1) + 1]) - thickb[1] * xnorb[
		    j + 2] * (sc + offset[(*i__ << 1) + 2]);
	}
	kon[indexe + 9] = nodeb[8];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[8] * 3] = co[j + nodel[1] * 3] - thickb[2] * xnorb[j 
		    + 5] * (sc + offset[(*i__ << 1) + 1]) + thickb[3] * xnorb[
		    j + 8] * (sc - offset[(*i__ << 1) + 2]);
	}
	kon[indexe + 10] = nodeb[20];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[20] * 3] = co[j + nodel[2] * 3] - thickb[4] * xnorb[
		    j + 11] * (offset[(*i__ << 1) + 1] + .5) - thickb[5] * 
		    xnorb[j + 14] * offset[(*i__ << 1) + 2];
	}
	kon[indexe + 11] = nodeb[9];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[9] * 3] = co[j + nodel[1] * 3] - thickb[2] * xnorb[j 
		    + 5] * (sc + offset[(*i__ << 1) + 1]) - thickb[3] * xnorb[
		    j + 8] * (sc + offset[(*i__ << 1) + 2]);
	}
	kon[indexe + 12] = nodeb[4];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[4] * 3] = co[j + nodel[0] * 3] - thickb[0] * xnorb[j 
		    - 1] * (offset[(*i__ << 1) + 1] + .5) - thickb[1] * xnorb[
		    j + 2] * offset[(*i__ << 1) + 2];
	}
	kon[indexe + 13] = nodeb[11];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[11] * 3] = co[j + nodel[1] * 3] + thickb[2] * xnorb[
		    j + 5] * (sc - offset[(*i__ << 1) + 1]) + thickb[3] * 
		    xnorb[j + 8] * (sc - offset[(*i__ << 1) + 2]);
	}
	kon[indexe + 14] = nodeb[22];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[22] * 3] = co[j + nodel[2] * 3] + thickb[4] * xnorb[
		    j + 11] * (.5 - offset[(*i__ << 1) + 1]) - thickb[5] * 
		    xnorb[j + 14] * offset[(*i__ << 1) + 2];
	}
	kon[indexe + 15] = nodeb[10];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[10] * 3] = co[j + nodel[1] * 3] + thickb[2] * xnorb[
		    j + 5] * (sc - offset[(*i__ << 1) + 1]) - thickb[3] * 
		    xnorb[j + 8] * (sc + offset[(*i__ << 1) + 2]);
	}
	kon[indexe + 16] = nodeb[6];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[6] * 3] = co[j + nodel[0] * 3] + thickb[0] * xnorb[j 
		    - 1] * (.5 - offset[(*i__ << 1) + 1]) - thickb[1] * xnorb[
		    j + 2] * offset[(*i__ << 1) + 2];
	}
	kon[indexe + 17] = nodeb[7];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[7] * 3] = co[j + nodel[0] * 3] - thickb[0] * xnorb[j 
		    - 1] * offset[(*i__ << 1) + 1] + thickb[1] * xnorb[j + 2] 
		    * (.5 - offset[(*i__ << 1) + 2]);
	}
	kon[indexe + 18] = nodeb[23];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[23] * 3] = co[j + nodel[2] * 3] - thickb[4] * xnorb[
		    j + 11] * offset[(*i__ << 1) + 1] + thickb[5] * xnorb[j + 
		    14] * (.5 - offset[(*i__ << 1) + 2]);
	}
	kon[indexe + 19] = nodeb[21];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[21] * 3] = co[j + nodel[2] * 3] - thickb[4] * xnorb[
		    j + 11] * offset[(*i__ << 1) + 1] - thickb[5] * xnorb[j + 
		    14] * (offset[(*i__ << 1) + 2] + .5);
	}
	kon[indexe + 20] = nodeb[5];
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[5] * 3] = co[j + nodel[0] * 3] - thickb[0] * xnorb[j 
		    - 1] * offset[(*i__ << 1) + 1] - thickb[1] * xnorb[j + 2] 
		    * (offset[(*i__ << 1) + 2] + .5);
	}

/*           generating coordinates for the expanded nodes which */
/*           are not used by the C3D20(R) element (needed for the */
/*           determination of the knot dimension) */

	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[12] * 3] = co[j + nodel[1] * 3] - thickb[0] * xnorb[
		    j - 1] * (offset[(*i__ << 1) + 1] + .5) - thickb[1] * 
		    xnorb[j + 2] * offset[(*i__ << 1) + 2];
	}
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[14] * 3] = co[j + nodel[1] * 3] + thickb[0] * xnorb[
		    j - 1] * (.5 - offset[(*i__ << 1) + 1]) - thickb[1] * 
		    xnorb[j + 2] * offset[(*i__ << 1) + 2];
	}
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[15] * 3] = co[j + nodel[1] * 3] - thickb[0] * xnorb[
		    j - 1] * offset[(*i__ << 1) + 1] + thickb[1] * xnorb[j + 
		    2] * (.5 - offset[(*i__ << 1) + 2]);
	}
	for (j = 1; j <= 3; ++j) {
	    co[j + nodeb[13] * 3] = co[j + nodel[1] * 3] - thickb[0] * xnorb[
		    j - 1] * offset[(*i__ << 1) + 1] - thickb[1] * xnorb[j + 
		    2] * (offset[(*i__ << 1) + 2] + .5);
	}
    }

    return 0;
} /* gen3dfrom1d_ */

