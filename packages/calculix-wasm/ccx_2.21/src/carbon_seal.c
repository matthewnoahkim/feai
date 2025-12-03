/* carbon_seal.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int carbon_seal__(integer *node1, integer *node2, integer *
	nodem, integer *nelem, char *lakon, integer *nactdog, logical *
	identity, integer *ielprop, doublereal *prop, integer *kflag, 
	doublereal *v, doublereal *xflow, doublereal *f, integer *nodef, 
	integer *idirf, doublereal *df, doublereal *r__, doublereal *physcon, 
	doublereal *dvi, integer *numf, char *set, integer *mi, doublereal *
	ttime, doublereal *time, integer *iaxial, integer *iplausi, ftnlen 
	lakon_len, ftnlen set_len)
{
    /* Format strings */
    static char fmt_55[] = "(1x,a,i6,a,i6,a,e11.4,a,a,e11.4,a)";
    static char fmt_56[] = "(1x,a,i6,a,e11.4,a,e11.4,a,e11.4,a)";

    /* System generated locals */
    integer v_dim1, v_offset;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double atan(doublereal);
    integer s_cmp(char *, char *, ftnlen, ftnlen), s_wsle(cilist *), do_lio(
	    integer *, integer *, char *, ftnlen), e_wsle(void), s_wsfe(
	    cilist *), do_fio(integer *, char *, ftnlen), e_wsfe(void);

    /* Local variables */
    doublereal d__, s, p1, p2, t1, t2, dl, pi;
    integer inv, index;

    /* Fortran I/O blocks */
    static cilist io___10 = { 0, 6, 0, 0, 0 };
    static cilist io___11 = { 0, 6, 0, 0, 0 };
    static cilist io___12 = { 0, 6, 0, 0, 0 };
    static cilist io___14 = { 0, 1, 0, 0, 0 };
    static cilist io___15 = { 0, 1, 0, fmt_55, 0 };
    static cilist io___16 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___17 = { 0, 1, 0, 0, 0 };
    static cilist io___18 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___19 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___20 = { 0, 1, 0, 0, 0 };
    static cilist io___21 = { 0, 1, 0, fmt_56, 0 };



/*     carbon seal element calculated with Richter method */
/*      Richter "Rohrhydraulik", Springer ,1971,p. 175 */

/*     author: Yannick Muller */







    /* Parameter adjustments */
    lakon -= 8;
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
	    *xflow = v[*nodem * v_dim1 + 1];
	    return 0;
	}

	index = ielprop[*nelem];
	d__ = prop[index + 1];
	s = prop[index + 2];
	dl = prop[index + 3];
	pi = atan(1.) * 4.;

	p1 = v[*node1 * v_dim1 + 2];
	p2 = v[*node2 * v_dim1 + 2];
	if (p1 >= p2) {
	    inv = 1;
	    t1 = v[*node1 * v_dim1] - physcon[1];
	} else {
	    inv = -1;
	    p1 = v[*node2 * v_dim1 + 2];
	    p2 = v[*node1 * v_dim1 + 2];
	    t1 = v[*node2 * v_dim1] - physcon[1];
	}

	if (s_cmp(lakon + ((*nelem << 3) + 1), "CARBS", (ftnlen)5, (ftnlen)5) 
		== 0) {

/*     gapflow */
/*     Richter "Rohrhydraulik", Springer ,1971,p. 175 */

/* Computing 3rd power */
	    d__1 = s;
/* Computing 2nd power */
	    d__2 = p1;
/* Computing 2nd power */
	    d__3 = p2;
	    *xflow = inv * pi * d__ * (d__1 * (d__1 * d__1)) * (d__2 * d__2 - 
		    d__3 * d__3) / (*r__ * 24. * t1 * *dvi * dl);
	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "CARBS", (ftnlen)5, (
		ftnlen)5) != 0) {
	    s_wsle(&io___10);
	    do_lio(&c__9, &c__1, "*WARNING in Carbon_seal.f", (ftnlen)25);
	    e_wsle();
	    s_wsle(&io___11);
	    do_lio(&c__9, &c__1, "unable to perform carbon seal calculation", 
		    (ftnlen)41);
	    e_wsle();
	    s_wsle(&io___12);
	    do_lio(&c__9, &c__1, "check input file", (ftnlen)16);
	    e_wsle();
	}

    } else if (*kflag == 2) {

	*numf = 4;
	p1 = v[*node1 * v_dim1 + 2];
	p2 = v[*node2 * v_dim1 + 2];
	if (p1 >= p2) {
	    inv = 1;
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    t1 = v[*node1 * v_dim1] - physcon[1];
	    nodef[1] = *node1;
	    nodef[2] = *node1;
	    nodef[3] = *nodem;
	    nodef[4] = *node2;
	} else {
	    inv = -1;
	    p1 = v[*node2 * v_dim1 + 2];
	    p2 = v[*node1 * v_dim1 + 2];
	    *xflow = -v[*nodem * v_dim1 + 1] * *iaxial;
	    t1 = v[*node2 * v_dim1] - physcon[1];
	    nodef[1] = *node2;
	    nodef[2] = *node2;
	    nodef[3] = *nodem;
	    nodef[4] = *node1;
	}

	idirf[1] = 2;
	idirf[2] = 0;
	idirf[3] = 1;
	idirf[4] = 2;

	index = ielprop[*nelem];
	d__ = prop[index + 1];
	s = prop[index + 2];
	dl = prop[index + 3];
	pi = atan(1.) * 4.;

	if (s_cmp(lakon + ((*nelem << 3) + 1), "CARBS", (ftnlen)5, (ftnlen)5) 
		== 0) {

/* Computing 3rd power */
	    d__1 = s;
/* Computing 2nd power */
	    d__2 = p1;
/* Computing 2nd power */
	    d__3 = p2;
	    *f = *xflow * t1 - pi * d__ * (d__1 * (d__1 * d__1)) * (d__2 * 
		    d__2 - d__3 * d__3) / (*r__ * 24. * *dvi * dl);

/* Computing 3rd power */
	    d__1 = s;
	    df[1] = -(pi * d__ * (d__1 * (d__1 * d__1)) * p1) / (*r__ * 12. * 
		    *dvi * dl);
	    df[2] = *xflow;
	    df[3] = t1;
/* Computing 3rd power */
	    d__1 = s;
	    df[4] = pi * d__ * (d__1 * (d__1 * d__1)) * p2 / (*r__ * 12. * *
		    dvi * dl);

	}
    } else if (*kflag == 3) {
	p1 = v[*node1 * v_dim1 + 2];
	p2 = v[*node2 * v_dim1 + 2];
	if (p1 >= p2) {
	    inv = 1;
	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    t1 = v[*node1 * v_dim1] - physcon[1];
	    t2 = v[*node2 * v_dim1] - physcon[1];
	    nodef[1] = *node1;
	    nodef[2] = *node1;
	    nodef[3] = *nodem;
	    nodef[4] = *node2;
	} else {
	    inv = -1;
	    p1 = v[*node2 * v_dim1 + 2];
	    p2 = v[*node1 * v_dim1 + 2];
	    *xflow = -v[*nodem * v_dim1 + 1] * *iaxial;
	    t1 = v[*node2 * v_dim1] - physcon[1];
	    t2 = v[*node1 * v_dim1] - physcon[1];
	    nodef[1] = *node2;
	    nodef[2] = *node2;
	    nodef[3] = *nodem;
	    nodef[4] = *node1;
	}
	s_wsle(&io___14);
	do_lio(&c__9, &c__1, "", (ftnlen)0);
	e_wsle();
	s_wsfe(&io___15);
	do_fio(&c__1, " from node", (ftnlen)10);
	do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	do_fio(&c__1, " to node", (ftnlen)8);
	do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	do_fio(&c__1, ":   air massflow rate=", (ftnlen)22);
	do_fio(&c__1, (char *)&(*xflow), (ftnlen)sizeof(doublereal));
	e_wsfe();
	if (inv == 1) {
	    s_wsfe(&io___16);
	    do_fio(&c__1, "       Inlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	    do_fio(&c__1, ":   Tt1=", (ftnlen)8);
	    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , Ts1=", (ftnlen)7);
	    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , Pt1=", (ftnlen)7);
	    do_fio(&c__1, (char *)&p1, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	    s_wsle(&io___17);
	    do_lio(&c__9, &c__1, "             Element", (ftnlen)20);
	    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(integer));
	    do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
	    e_wsle();
	    s_wsfe(&io___18);
	    do_fio(&c__1, "      Outlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	    do_fio(&c__1, ":   Tt2=", (ftnlen)8);
	    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , Ts2=", (ftnlen)7);
	    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , Pt2=", (ftnlen)7);
	    do_fio(&c__1, (char *)&p2, (ftnlen)sizeof(doublereal));
	    e_wsfe();

	} else if (inv == -1) {
	    s_wsfe(&io___19);
	    do_fio(&c__1, "       Inlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	    do_fio(&c__1, ":    Tt1=", (ftnlen)9);
	    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , Ts1=", (ftnlen)7);
	    do_fio(&c__1, (char *)&t1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , Pt1=", (ftnlen)7);
	    do_fio(&c__1, (char *)&p1, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	    s_wsle(&io___20);
	    do_lio(&c__9, &c__1, "             Element", (ftnlen)20);
	    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(integer));
	    do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
	    e_wsle();
	    s_wsfe(&io___21);
	    do_fio(&c__1, "      Outlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	    do_fio(&c__1, ":    Tt2=", (ftnlen)9);
	    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , Ts2=", (ftnlen)7);
	    do_fio(&c__1, (char *)&t2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " , Pt2=", (ftnlen)7);
	    do_fio(&c__1, (char *)&p2, (ftnlen)sizeof(doublereal));
	    e_wsfe();
	}
    }

    *xflow /= *iaxial;
    df[3] *= *iaxial;

    return 0;
} /* carbon_seal__ */

