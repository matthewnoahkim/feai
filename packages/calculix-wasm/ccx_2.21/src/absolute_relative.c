/* absolute_relative.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int absolute_relative__(integer *node1, integer *node2, 
	integer *nodem, integer *nelem, char *lakon, integer *kon, integer *
	ipkon, integer *nactdog, logical *identity, integer *ielprop, 
	doublereal *prop, integer *kflag, doublereal *v, doublereal *xflow, 
	doublereal *f, integer *nodef, integer *idirf, doublereal *df, 
	doublereal *cp, doublereal *r__, doublereal *physcon, integer *numf, 
	char *set, integer *mi, doublereal *ttime, doublereal *time, integer *
	iaxial, integer *iplausi, ftnlen lakon_len, ftnlen set_len)
{
    /* Format strings */
    static char fmt_55[] = "(1x,a,i6,a,i6,a,e11.4,a,a,e11.4,a)";
    static char fmt_56[] = "(1x,a,i6,a,e11.4,a,e11.4,a,e11.4,a,e11.4)";
    static char fmt_57[] = "(1x,a,e11.4,a,e11.4,a)";

    /* System generated locals */
    integer v_dim1, v_offset;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    integer i_dnnt(doublereal *), s_cmp(char *, char *, ftnlen, ftnlen), 
	    s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);
    double pow_dd(doublereal *, doublereal *);
    integer s_wsfe(cilist *), do_fio(integer *, char *, ftnlen), e_wsfe(void);

    /* Local variables */
    doublereal u, ct, km1, kp1, pt1, pt2, tt1, tt2;
    integer nelemswirl;
    doublereal fact;
    extern /* Subroutine */ int cp_corrected__(doublereal *, doublereal *, 
	    doublereal *, doublereal *);
    doublereal kdkm1, kdkp1, kappa;
    integer index;
    doublereal cp_cor__;

    /* Fortran I/O blocks */
    static cilist io___14 = { 0, 6, 0, 0, 0 };
    static cilist io___15 = { 0, 6, 0, 0, 0 };
    static cilist io___16 = { 0, 6, 0, 0, 0 };
    static cilist io___17 = { 0, 6, 0, 0, 0 };
    static cilist io___18 = { 0, 6, 0, 0, 0 };
    static cilist io___19 = { 0, 6, 0, 0, 0 };
    static cilist io___20 = { 0, 6, 0, 0, 0 };
    static cilist io___21 = { 0, 6, 0, 0, 0 };
    static cilist io___22 = { 0, 6, 0, 0, 0 };
    static cilist io___23 = { 0, 6, 0, 0, 0 };
    static cilist io___24 = { 0, 6, 0, 0, 0 };
    static cilist io___25 = { 0, 6, 0, 0, 0 };
    static cilist io___28 = { 0, 6, 0, 0, 0 };
    static cilist io___29 = { 0, 6, 0, 0, 0 };
    static cilist io___30 = { 0, 6, 0, 0, 0 };
    static cilist io___31 = { 0, 6, 0, 0, 0 };
    static cilist io___32 = { 0, 6, 0, 0, 0 };
    static cilist io___33 = { 0, 6, 0, 0, 0 };
    static cilist io___34 = { 0, 6, 0, 0, 0 };
    static cilist io___35 = { 0, 6, 0, 0, 0 };
    static cilist io___36 = { 0, 6, 0, 0, 0 };
    static cilist io___37 = { 0, 6, 0, 0, 0 };
    static cilist io___38 = { 0, 6, 0, 0, 0 };
    static cilist io___39 = { 0, 6, 0, 0, 0 };
    static cilist io___40 = { 0, 1, 0, 0, 0 };
    static cilist io___41 = { 0, 1, 0, fmt_55, 0 };
    static cilist io___42 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___43 = { 0, 1, 0, 0, 0 };
    static cilist io___44 = { 0, 1, 0, fmt_57, 0 };
    static cilist io___45 = { 0, 1, 0, fmt_56, 0 };



/*     orifice element */

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
	*xflow = 0.;

    } else if (*kflag == 2) {

	*numf = 4;
	kappa = *cp / (*cp - *r__);
	km1 = kappa - 1.;
	kp1 = kappa + 1.;
	kdkm1 = kappa / km1;
	kdkp1 = kappa / kp1;

	index = ielprop[*nelem];

	u = prop[index + 1];
	ct = prop[index + 2];
	nelemswirl = i_dnnt(&prop[index + 3]);

	if (nelemswirl != 0) {

/*     previous element is a preswirl nozzle */

	    if (s_cmp(lakon + ((nelemswirl << 3) + 1), "ORPN", (ftnlen)4, (
		    ftnlen)4) == 0) {
		ct = prop[ielprop[nelemswirl] + 5];

/*     previous element is a forced vortex */

	    } else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "VOFO", (ftnlen)
		    4, (ftnlen)4) == 0) {
		ct = prop[ielprop[nelemswirl] + 7];

/*     previous element is a free vortex */

	    } else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "VOFR", (ftnlen)
		    4, (ftnlen)4) == 0) {
		ct = prop[ielprop[nelemswirl] + 9];
	    }
	}

	pt1 = v[*node1 * v_dim1 + 2];
	pt2 = v[*node2 * v_dim1 + 2];

	if (s_cmp(lakon + ((*nelem << 3) + 1), "ATR", (ftnlen)3, (ftnlen)3) ==
		 0) {

	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    tt1 = v[*node1 * v_dim1] - physcon[1];
	    tt2 = v[*node2 * v_dim1] - physcon[1];

	    nodef[1] = *node1;
	    nodef[2] = *node1;
	    nodef[3] = *nodem;
	    nodef[4] = *node2;

/*     in the case of a negative flow direction */

	    if (*xflow <= 0.) {
		s_wsle(&io___14);
		do_lio(&c__9, &c__1, "", (ftnlen)0);
		e_wsle();
		s_wsle(&io___15);
		do_lio(&c__9, &c__1, "*WARNING:", (ftnlen)9);
		e_wsle();
		s_wsle(&io___16);
		do_lio(&c__9, &c__1, "in element", (ftnlen)10);
		do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			integer));
		e_wsle();
		s_wsle(&io___17);
		do_lio(&c__9, &c__1, "TYPE=ABSOLUTE TO RELATIVE", (ftnlen)25);
		e_wsle();
		s_wsle(&io___18);
		do_lio(&c__9, &c__1, "mass flow negative!", (ftnlen)19);
		e_wsle();
		s_wsle(&io___19);
		do_lio(&c__9, &c__1, "check results and element definition", (
			ftnlen)36);
		e_wsle();
	    }

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "RTA", (ftnlen)3, (
		ftnlen)3) == 0) {

	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    tt1 = v[*node1 * v_dim1] - physcon[1];
	    tt2 = v[*node2 * v_dim1] - physcon[1];

	    nodef[1] = *node1;
	    nodef[2] = *node1;
	    nodef[3] = *nodem;
	    nodef[4] = *node2;

	    if (*xflow <= 0.) {
		s_wsle(&io___20);
		do_lio(&c__9, &c__1, "", (ftnlen)0);
		e_wsle();
		s_wsle(&io___21);
		do_lio(&c__9, &c__1, "*WARNING:", (ftnlen)9);
		e_wsle();
		s_wsle(&io___22);
		do_lio(&c__9, &c__1, "in element", (ftnlen)10);
		do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			integer));
		e_wsle();
		s_wsle(&io___23);
		do_lio(&c__9, &c__1, "TYPE=RELATIVE TO ABSOLUTE", (ftnlen)25);
		e_wsle();
		s_wsle(&io___24);
		do_lio(&c__9, &c__1, "mass flow negative!", (ftnlen)19);
		e_wsle();
		s_wsle(&io___25);
		do_lio(&c__9, &c__1, "check results and element definition", (
			ftnlen)36);
		e_wsle();
	    }
	}

	idirf[1] = 2;
	idirf[2] = 0;
	idirf[3] = 1;
	idirf[4] = 2;

/*     computing temperature corrected Cp=Cp(T) coefficient */
	cp_corrected__(cp, &tt1, &tt2, &cp_cor__);

	if (tt1 < 273.) {
	    tt1 = tt2;
	}

	if (cp_cor__ == 0.) {
	    cp_cor__ = *cp;
	}

/*     transformation from absolute system to relative system */

	if (s_cmp(lakon + ((*nelem << 3) + 1), "ATR", (ftnlen)3, (ftnlen)3) ==
		 0) {

/* Computing 2nd power */
	    d__1 = u;
	    fact = (d__1 * d__1 - u * 2 * ct) / (cp_cor__ * 2 * tt1) + 1;

	    *f = pt2 - pt1 * pow_dd(&fact, &kdkm1);

/*     pressure node 1 */

	    df[1] = -pow_dd(&fact, &kdkm1);

/*     temperature node1 */

/* Computing 2nd power */
	    d__1 = u;
/* Computing 2nd power */
	    d__2 = tt1;
	    d__3 = kdkm1 - 1;
	    df[2] = -pt1 * kdkm1 * (-(d__1 * d__1 - u * 2 * ct) / (cp_cor__ * 
		    2 * (d__2 * d__2))) * pow_dd(&fact, &d__3);

/*     mass flow node m */

	    df[3] = 0.;

/*     pressure node 2 */

	    df[4] = 1.;

/*     transformation from relative system to absolute system */

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "RTA", (ftnlen)3, (
		ftnlen)3) == 0) {

/* Computing 2nd power */
	    d__1 = u;
	    fact = 1 - (d__1 * d__1 - u * 2 * ct) / (*cp * 2 * tt1);

	    *f = pt2 - pt1 * pow_dd(&fact, &kdkm1);

	    df[1] = -pow_dd(&fact, &kdkm1);

/* Computing 2nd power */
	    d__1 = u;
/* Computing 2nd power */
	    d__2 = tt1;
	    d__3 = kdkm1 - 1;
	    df[2] = -pt1 * kdkm1 * ((d__1 * d__1 - u * 2 * ct) / (*cp * 2 * (
		    d__2 * d__2))) * pow_dd(&fact, &d__3);

	    df[3] = 0.;

	    df[4] = 1.;

	}
    } else if (*kflag == 3) {
	kappa = *cp / (*cp - *r__);
	km1 = kappa - 1.;
	kp1 = kappa + 1.;
	kdkm1 = kappa / km1;
	kdkp1 = kappa / kp1;

	index = ielprop[*nelem];

	u = prop[index + 1];
	ct = prop[index + 2];
	nelemswirl = i_dnnt(&prop[index + 3]);

	if (nelemswirl != 0) {

/*     previous element is a preswirl nozzle */

	    if (s_cmp(lakon + ((nelemswirl << 3) + 1), "ORPN", (ftnlen)4, (
		    ftnlen)4) == 0) {
		ct = prop[ielprop[nelemswirl] + 5];

/*     previous element is a forced vortex */

	    } else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "VOFO", (ftnlen)
		    4, (ftnlen)4) == 0) {
		ct = prop[ielprop[nelemswirl] + 7];

/*     previous element is a free vortex */

	    } else if (s_cmp(lakon + ((nelemswirl << 3) + 1), "VOFR", (ftnlen)
		    4, (ftnlen)4) == 0) {
		ct = prop[ielprop[nelemswirl] + 9];
	    }
	}

	pt1 = v[*node1 * v_dim1 + 2];
	pt2 = v[*node2 * v_dim1 + 2];

	if (s_cmp(lakon + ((*nelem << 3) + 1), "ATR", (ftnlen)3, (ftnlen)3) ==
		 0) {

	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    tt1 = v[*node1 * v_dim1] - physcon[1];
	    tt2 = v[*node2 * v_dim1] - physcon[1];

	    nodef[1] = *node1;
	    nodef[2] = *node1;
	    nodef[3] = *nodem;
	    nodef[4] = *node2;

/*     in the case of a negative flow direction */

	    if (*xflow <= 0.) {
		s_wsle(&io___28);
		do_lio(&c__9, &c__1, "", (ftnlen)0);
		e_wsle();
		s_wsle(&io___29);
		do_lio(&c__9, &c__1, "*WARNING:", (ftnlen)9);
		e_wsle();
		s_wsle(&io___30);
		do_lio(&c__9, &c__1, "in element", (ftnlen)10);
		do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			integer));
		e_wsle();
		s_wsle(&io___31);
		do_lio(&c__9, &c__1, "TYPE=ABSOLUTE TO RELATIVE", (ftnlen)25);
		e_wsle();
		s_wsle(&io___32);
		do_lio(&c__9, &c__1, "mass flow negative!", (ftnlen)19);
		e_wsle();
		s_wsle(&io___33);
		do_lio(&c__9, &c__1, "check results and element definition", (
			ftnlen)36);
		e_wsle();
	    }

	} else if (s_cmp(lakon + ((*nelem << 3) + 1), "RTA", (ftnlen)3, (
		ftnlen)3) == 0) {

	    *xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	    tt1 = v[*node1 * v_dim1] - physcon[1];
	    tt2 = v[*node2 * v_dim1] - physcon[1];

	    nodef[1] = *node1;
	    nodef[2] = *node1;
	    nodef[3] = *nodem;
	    nodef[4] = *node2;

	    if (*xflow <= 0.) {
		s_wsle(&io___34);
		do_lio(&c__9, &c__1, "", (ftnlen)0);
		e_wsle();
		s_wsle(&io___35);
		do_lio(&c__9, &c__1, "*WARNING:", (ftnlen)9);
		e_wsle();
		s_wsle(&io___36);
		do_lio(&c__9, &c__1, "in element", (ftnlen)10);
		do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			integer));
		e_wsle();
		s_wsle(&io___37);
		do_lio(&c__9, &c__1, "TYPE=RELATIVE TO ABSOLUTE", (ftnlen)25);
		e_wsle();
		s_wsle(&io___38);
		do_lio(&c__9, &c__1, "mass flow negative!", (ftnlen)19);
		e_wsle();
		s_wsle(&io___39);
		do_lio(&c__9, &c__1, "check results and element definition", (
			ftnlen)36);
		e_wsle();
	    }
	}

	idirf[1] = 2;
	idirf[2] = 0;
	idirf[3] = 1;
	idirf[4] = 2;

/*     computing temperature corrected Cp=Cp(T) coefficient */
	cp_corrected__(cp, &tt1, &tt2, &cp_cor__);

	if (tt1 < 273.) {
	    tt1 = tt2;
	}

	if (cp_cor__ == 0.) {
	    cp_cor__ = *cp;
	}
	s_wsle(&io___40);
	do_lio(&c__9, &c__1, "", (ftnlen)0);
	e_wsle();
	s_wsfe(&io___41);
	do_fio(&c__1, " from node", (ftnlen)10);
	do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	do_fio(&c__1, " to node", (ftnlen)8);
	do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	do_fio(&c__1, ":   air massflow rate=", (ftnlen)22);
	do_fio(&c__1, (char *)&(*xflow), (ftnlen)sizeof(doublereal));
	do_fio(&c__1, "", (ftnlen)0);
	e_wsfe();
	s_wsfe(&io___42);
	do_fio(&c__1, "       Inlet node ", (ftnlen)18);
	do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	do_fio(&c__1, ":     Tt1= ", (ftnlen)11);
	do_fio(&c__1, (char *)&tt1, (ftnlen)sizeof(doublereal));
	do_fio(&c__1, ", Ts1= ", (ftnlen)7);
	do_fio(&c__1, (char *)&tt1, (ftnlen)sizeof(doublereal));
	do_fio(&c__1, ", Pt1= ", (ftnlen)7);
	do_fio(&c__1, (char *)&pt1, (ftnlen)sizeof(doublereal));
	e_wsfe();
	s_wsle(&io___43);
	do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
	do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(integer));
	do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
	e_wsle();
	s_wsfe(&io___44);
	do_fio(&c__1, "             u= ", (ftnlen)16);
	do_fio(&c__1, (char *)&u, (ftnlen)sizeof(doublereal));
	do_fio(&c__1, " ,Ct= ", (ftnlen)6);
	do_fio(&c__1, (char *)&ct, (ftnlen)sizeof(doublereal));
	do_fio(&c__1, "", (ftnlen)0);
	e_wsfe();
	s_wsfe(&io___45);
	do_fio(&c__1, "      Outlet node ", (ftnlen)18);
	do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	do_fio(&c__1, ":     Tt2= ", (ftnlen)11);
	do_fio(&c__1, (char *)&tt2, (ftnlen)sizeof(doublereal));
	do_fio(&c__1, ", Ts2= ", (ftnlen)7);
	do_fio(&c__1, (char *)&tt2, (ftnlen)sizeof(doublereal));
	do_fio(&c__1, ", Pt2= ", (ftnlen)7);
	do_fio(&c__1, (char *)&pt2, (ftnlen)sizeof(doublereal));
	e_wsfe();

    }

    *xflow /= *iaxial;
    df[3] *= *iaxial;

    return 0;
} /* absolute_relative__ */

