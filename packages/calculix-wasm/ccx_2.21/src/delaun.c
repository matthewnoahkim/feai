/* delaun.f -- translated by f2c (version 20200916).
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

/*     S.W. Sloan, Adv.Eng.Software,1987,9(1),34-55. */
/*     Permission for use with the GPL license granted by Prof. Scott */
/*     Sloan on 17. Nov. 2013 */

/* Subroutine */ int delaun_(integer *numpts, integer *n, doublereal *x, 
	doublereal *y, integer *list, integer *stack, integer *v, integer *e, 
	integer *numtri)
{
    /* System generated locals */
    integer i__1, i__2;
    cilist ci__1;

    /* Builtin functions */
    integer s_wsfe(cilist *), e_wsfe(void);

    /* Local variables */
    integer a, b, c__, i__, l, p, r__, t, v1, v2, v3;
    doublereal xp, yp;
    extern integer edg_(integer *, integer *, integer *);
    integer era, erb, erl;
    extern integer pop_(integer *, integer *);
    extern /* Subroutine */ int exit_(integer *);
    extern logical swap_(doublereal *, doublereal *, doublereal *, doublereal 
	    *, doublereal *, doublereal *, doublereal *, doublereal *);
    extern /* Subroutine */ int push_(integer *, integer *, integer *, 
	    integer *);
    integer tstop, tstrt;
    extern integer triloc_(doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, integer *, integer *);
    integer maxstk, topstk;







    /* Parameter adjustments */
    e -= 4;
    v -= 4;
    --stack;
    --list;
    --y;
    --x;

    /* Function Body */
    v1 = *numpts + 1;
    v2 = *numpts + 2;
    v3 = *numpts + 3;
    v[4] = v1;
    v[5] = v2;
    v[6] = v3;
    e[4] = 0;
    e[5] = 0;
    e[6] = 0;

    x[v1] = -1e5;
    x[v2] = 1e5;
    x[v3] = 0.;
    y[v1] = -1e5;
    y[v2] = -1e5;
    y[v3] = 1e5;

    *numtri = 1;
    topstk = 0;
    maxstk = *numpts;
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	p = list[i__];
	xp = x[p];
	yp = y[p];
	t = triloc_(&xp, &yp, &x[1], &y[1], &v[4], &e[4], numtri);
	a = e[t * 3 + 1];
	b = e[t * 3 + 2];
	c__ = e[t * 3 + 3];
	v1 = v[t * 3 + 1];
	v2 = v[t * 3 + 2];
	v3 = v[t * 3 + 3];
	v[t * 3 + 1] = p;
	v[t * 3 + 2] = v1;
	v[t * 3 + 3] = v2;
	e[t * 3 + 1] = *numtri + 2;
	e[t * 3 + 2] = a;
	e[t * 3 + 3] = *numtri + 1;

	++(*numtri);
	v[*numtri * 3 + 1] = p;
	v[*numtri * 3 + 2] = v2;
	v[*numtri * 3 + 3] = v3;
	e[*numtri * 3 + 1] = t;
	e[*numtri * 3 + 2] = b;
	e[*numtri * 3 + 3] = *numtri + 1;
	++(*numtri);
	v[*numtri * 3 + 1] = p;
	v[*numtri * 3 + 2] = v3;
	v[*numtri * 3 + 3] = v1;
	e[*numtri * 3 + 1] = *numtri - 1;
	e[*numtri * 3 + 2] = c__;
	e[*numtri * 3 + 3] = t;

	if (a != 0) {
	    push_(&t, &maxstk, &topstk, &stack[1]);
	}
	if (b != 0) {
	    e[edg_(&b, &t, &e[4]) + b * 3] = *numtri - 1;
	    i__2 = *numtri - 1;
	    push_(&i__2, &maxstk, &topstk, &stack[1]);
	}
	if (c__ != 0) {
	    e[edg_(&c__, &t, &e[4]) + c__ * 3] = *numtri;
	    push_(numtri, &maxstk, &topstk, &stack[1]);
	}

L50:
	if (topstk > 0) {
	    l = pop_(&topstk, &stack[1]);
	    r__ = e[l * 3 + 2];

	    erl = edg_(&r__, &l, &e[4]);
	    era = erl % 3 + 1;
	    erb = era % 3 + 1;
	    v1 = v[erl + r__ * 3];
	    v2 = v[era + r__ * 3];
	    v3 = v[erb + r__ * 3];
	    if (swap_(&x[v1], &y[v1], &x[v2], &y[v2], &x[v3], &y[v3], &xp, &
		    yp)) {
		a = e[era + r__ * 3];
		b = e[erb + r__ * 3];
		c__ = e[l * 3 + 3];
		v[l * 3 + 3] = v3;
		e[l * 3 + 2] = a;
		e[l * 3 + 3] = r__;
		v[r__ * 3 + 1] = p;
		v[r__ * 3 + 2] = v3;
		v[r__ * 3 + 3] = v1;
		e[r__ * 3 + 1] = l;
		e[r__ * 3 + 2] = b;
		e[r__ * 3 + 3] = c__;
		if (a != 0) {
		    e[edg_(&a, &r__, &e[4]) + a * 3] = l;
		    push_(&l, &maxstk, &topstk, &stack[1]);
		}
		if (b != 0) {
		    push_(&r__, &maxstk, &topstk, &stack[1]);
		}
		if (c__ != 0) {
		    e[edg_(&c__, &l, &e[4]) + c__ * 3] = r__;
		}
	    }
	    goto L50;
	}
/* L100: */
    }
    if (*numtri != (*n << 1) + 1) {
	ci__1.cierr = 0;
	ci__1.ciunit = 6;
	ci__1.cifmt = "(\"o***error in subroutine delaun***\")";
	s_wsfe(&ci__1);
	e_wsfe();
	ci__1.cierr = 0;
	ci__1.ciunit = 6;
	ci__1.cifmt = "(\" ***incorrect number of triangls formed***\")";
	s_wsfe(&ci__1);
	e_wsfe();
	exit_(&c__201);
    }
    i__1 = *numtri;
    for (t = 1; t <= i__1; ++t) {
	if (v[t * 3 + 1] > *numpts || v[t * 3 + 2] > *numpts || v[t * 3 + 3] 
		> *numpts) {
	    for (i__ = 1; i__ <= 3; ++i__) {
		a = e[i__ + t * 3];
		if (a != 0) {
		    e[edg_(&a, &t, &e[4]) + a * 3] = 0;
		}
/* L110: */
	    }
	    goto L125;
	}
/* L120: */
    }
L125:
    tstrt = t + 1;
    tstop = *numtri;
    *numtri = t - 1;
    i__1 = tstop;
    for (t = tstrt; t <= i__1; ++t) {
	if (v[t * 3 + 1] > *numpts || v[t * 3 + 2] > *numpts || v[t * 3 + 3] 
		> *numpts) {
	    for (i__ = 1; i__ <= 3; ++i__) {
		a = e[i__ + t * 3];
		if (a != 0) {
		    e[edg_(&a, &t, &e[4]) + a * 3] = 0;
		}
/* L130: */
	    }
	} else {
	    ++(*numtri);
	    for (i__ = 1; i__ <= 3; ++i__) {
		a = e[i__ + t * 3];
		e[i__ + *numtri * 3] = a;
		v[i__ + *numtri * 3] = v[i__ + t * 3];
		if (a != 0) {
		    e[edg_(&a, &t, &e[4]) + a * 3] = *numtri;
		}
/* L140: */
	    }
	}
/* L200: */
    }
    return 0;
} /* delaun_ */

