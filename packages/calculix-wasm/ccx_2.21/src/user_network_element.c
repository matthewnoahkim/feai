/* user_network_element.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int user_network_element__(integer *node1, integer *node2, 
	integer *nodem, integer *nelem, char *lakon, integer *kon, integer *
	ipkon, integer *nactdog, logical *identity, integer *ielprop, 
	doublereal *prop, integer *kflag, doublereal *v, doublereal *xflow, 
	doublereal *f, integer *nodef, integer *idirf, doublereal *df, 
	doublereal *cp, doublereal *r__, doublereal *physcon, doublereal *dvi,
	 integer *numf, char *set, doublereal *co, doublereal *vold, integer *
	mi, doublereal *ttime, doublereal *time, integer *iaxial, integer *
	iplausi, ftnlen lakon_len, ftnlen set_len)
{
    /* System generated locals */
    integer v_dim1, v_offset, vold_dim1, vold_offset;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    extern /* Subroutine */ int user_network_element_p0__(integer *, integer *
	    , integer *, integer *, char *, integer *, integer *, integer *, 
	    logical *, integer *, doublereal *, integer *, doublereal *, 
	    doublereal *, doublereal *, integer *, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     char *, doublereal *, doublereal *, integer *, doublereal *, 
	    doublereal *, integer *, integer *, ftnlen, ftnlen), 
	    user_network_element_p1__(integer *, integer *, integer *, 
	    integer *, char *, integer *, integer *, integer *, logical *, 
	    integer *, doublereal *, integer *, doublereal *, doublereal *, 
	    doublereal *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, integer *, char *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     integer *, integer *, ftnlen, ftnlen);


/*     user network elements */





/*     list of different user network elements */

/*     notice that the input deck is converted into upper case when */
/*     being read by CalculiX. So even if the user has specified "p1" */
/*     in his input deck, at the present stage "P1" is stored. */

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
    co -= 4;
    --mi;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;
    v_dim1 = mi[2] - 0 + 1;
    v_offset = 0 + v_dim1;
    v -= v_offset;

    /* Function Body */
    if (s_cmp(lakon + ((*nelem << 3) + 2), "P0", (ftnlen)2, (ftnlen)2) == 0 ||
	     s_cmp(lakon + ((*nelem << 3) + 2), "0 ", (ftnlen)2, (ftnlen)2) ==
	     0) {

/*        this just contains a skeleton file */

	user_network_element_p0__(node1, node2, nodem, nelem, lakon + 8, &kon[
		1], &ipkon[1], &nactdog[4], identity, &ielprop[1], &prop[1], 
		kflag, &v[v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], 
		cp, r__, &physcon[1], dvi, numf, set + 81, &co[4], &vold[
		vold_offset], &mi[1], ttime, time, iaxial, iplausi, (ftnlen)8,
		 (ftnlen)81);
    } else if (s_cmp(lakon + ((*nelem << 3) + 2), "P1", (ftnlen)2, (ftnlen)2) 
	    == 0 || s_cmp(lakon + ((*nelem << 3) + 2), "1 ", (ftnlen)2, (
	    ftnlen)2) == 0) {

/*        this is a working example */

	user_network_element_p1__(node1, node2, nodem, nelem, lakon + 8, &kon[
		1], &ipkon[1], &nactdog[4], identity, &ielprop[1], &prop[1], 
		kflag, &v[v_offset], xflow, f, &nodef[1], &idirf[1], &df[1], 
		cp, r__, &physcon[1], dvi, numf, set + 81, &co[4], &vold[
		vold_offset], &mi[1], ttime, time, iaxial, iplausi, (ftnlen)8,
		 (ftnlen)81);
    }

    return 0;
} /* user_network_element__ */

