/* massflow_percent.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int massflow_percent__(integer *node1, integer *node2, 
	integer *nodem, integer *nelem, char *lakon, integer *kon, integer *
	ipkon, integer *nactdog, logical *identity, integer *ielprop, 
	doublereal *prop, integer *kflag, doublereal *v, doublereal *xflow, 
	doublereal *f, integer *nodef, integer *idirf, doublereal *df, 
	doublereal *cp, doublereal *r__, doublereal *physcon, doublereal *dvi,
	 integer *numf, char *set, doublereal *shcon, integer *nshcon, 
	doublereal *rhcon, integer *nrhcon, integer *ntmat___, doublereal *co,
	 doublereal *vold, integer *mi, doublereal *ttime, doublereal *time, 
	integer *iaxial, integer *iplausi, ftnlen lakon_len, ftnlen set_len)
{
    /* Format strings */
    static char fmt_55[] = "(1x,a,i6,a,i6,a,e11.4,a,a,e11.4,a)";
    static char fmt_56[] = "(1x,a,i6,a,e11.4,a,e11.4,a,e11.4,a)";
    static char fmt_57[] = "(1x,a,e11.4,a)";
    static char fmt_58[] = "(1x,a,e11.4)";

    /* System generated locals */
    integer v_dim1, v_offset, vold_dim1, vold_offset, shcon_dim2, 
	    shcon_offset, rhcon_dim2, rhcon_offset;
    doublereal d__1;

    /* Builtin functions */
    double atan(doublereal);
    integer i_dnnt(doublereal *), s_wsle(cilist *), do_lio(integer *, integer 
	    *, char *, ftnlen), e_wsle(void), s_wsfe(cilist *), do_fio(
	    integer *, char *, ftnlen), e_wsfe(void);

    /* Local variables */
    integer i__;
    doublereal xflow_oil__, xflow_sum__, pi, pt1, pt2, tt1, tt2;
    integer inv, index;
    doublereal percent_xflow__;
    integer nodemup;

    /* Fortran I/O blocks */
    static cilist io___13 = { 0, 1, 0, 0, 0 };
    static cilist io___14 = { 0, 1, 0, fmt_55, 0 };
    static cilist io___15 = { 0, 1, 0, fmt_56, 0 };
    static cilist io___16 = { 0, 1, 0, 0, 0 };
    static cilist io___17 = { 0, 1, 0, fmt_57, 0 };
    static cilist io___18 = { 0, 1, 0, fmt_58, 0 };
    static cilist io___19 = { 0, 1, 0, fmt_56, 0 };



/*     partial massflow  element */

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
    --nshcon;
    --nrhcon;
    rhcon_dim2 = *ntmat___;
    rhcon_offset = 0 + 2 * (1 + rhcon_dim2);
    rhcon -= rhcon_offset;
    shcon_dim2 = *ntmat___;
    shcon_offset = 0 + 4 * (1 + shcon_dim2);
    shcon -= shcon_offset;
    co -= 4;
    --mi;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;
    v_dim1 = mi[2] - 0 + 1;
    v_offset = 0 + v_dim1;
    v -= v_offset;

    /* Function Body */
    pi = atan(1.) * 4.;
    index = ielprop[*nelem];

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

	percent_xflow__ = prop[index + 1];
	xflow_sum__ = 0.;

	for (i__ = 2; i__ <= 10; ++i__) {
	    if (i_dnnt(&prop[index + i__]) != 0) {
		nodemup = kon[ipkon[i_dnnt(&prop[index + i__])] + 2];
		if (v[nodemup * v_dim1 + 1] > 0.) {
		    xflow_sum__ += v[nodemup * v_dim1 + 1] * *iaxial;
		}
	    }
	}

	if (xflow_sum__ == 0.) {
	    xflow_sum__ = .001;
	}

	*xflow = xflow_sum__ * percent_xflow__;

    } else if (*kflag == 2 || *kflag == 3) {

	percent_xflow__ = prop[index + 1];
	xflow_sum__ = 0.;
	for (i__ = 2; i__ <= 10; ++i__) {
	    if (i_dnnt(&prop[index + i__]) != 0) {
		nodemup = kon[ipkon[i_dnnt(&prop[index + i__])] + 2];
		if (v[nodemup * v_dim1 + 1] > 0.) {
		    xflow_sum__ += v[nodemup * v_dim1 + 1] * *iaxial;
		}
	    }
	}
	if (xflow_sum__ == 0.) {
	    xflow_sum__ = 1e-5;
	}

	inv = 1;

	pt1 = v[*node1 * v_dim1 + 2];
	pt2 = v[*node2 * v_dim1 + 2];
	*xflow = v[*nodem * v_dim1 + 1] * *iaxial;
	tt1 = v[*node1 * v_dim1] - physcon[1];
	tt2 = v[*node2 * v_dim1] - physcon[1];

	nodef[1] = *node1;
	nodef[2] = *node1;
	nodef[3] = *nodem;
	nodef[4] = *node2;

	idirf[1] = 2;
	idirf[2] = 0;
	idirf[3] = 1;
	idirf[4] = 2;

	if (*kflag == 2) {
	    *numf = 4;

	    *f = *xflow / xflow_sum__ - percent_xflow__;

	    df[1] = 0.;
	    df[2] = 0.;
	    df[3] = 1 / xflow_sum__;
	    df[4] = 0.;

/*     output */

	} else if (*kflag == 3) {

	    xflow_oil__ = 0.;

	    s_wsle(&io___13);
	    do_lio(&c__9, &c__1, "", (ftnlen)0);
	    e_wsle();
	    s_wsfe(&io___14);
	    do_fio(&c__1, " from node ", (ftnlen)11);
	    do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	    do_fio(&c__1, " to node ", (ftnlen)9);
	    do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	    do_fio(&c__1, " :   air massflow rate = ", (ftnlen)25);
	    d__1 = inv * *xflow;
	    do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", oil massflow rate = ", (ftnlen)22);
	    do_fio(&c__1, (char *)&xflow_oil__, (ftnlen)sizeof(doublereal));
	    e_wsfe();

	    s_wsfe(&io___15);
	    do_fio(&c__1, "       Inlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node1), (ftnlen)sizeof(integer));
	    do_fio(&c__1, " :   Tt1 = ", (ftnlen)11);
	    do_fio(&c__1, (char *)&tt1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Ts1 = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&tt1, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, "  , Pt1 = ", (ftnlen)10);
	    do_fio(&c__1, (char *)&pt1, (ftnlen)sizeof(doublereal));
	    e_wsfe();

	    s_wsle(&io___16);
	    do_lio(&c__9, &c__1, "             Element ", (ftnlen)21);
	    do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(integer));
	    do_lio(&c__9, &c__1, lakon + (*nelem << 3), (ftnlen)8);
	    e_wsle();
	    s_wsfe(&io___17);
	    do_fio(&c__1, "        Massflow upstream = ", (ftnlen)28);
	    do_fio(&c__1, (char *)&xflow_sum__, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, " [kg/s]", (ftnlen)7);
	    e_wsfe();
	    s_wsfe(&io___18);
	    do_fio(&c__1, "        Massflow fraction = ", (ftnlen)28);
	    do_fio(&c__1, (char *)&percent_xflow__, (ftnlen)sizeof(doublereal)
		    );
	    e_wsfe();
	    s_wsfe(&io___19);
	    do_fio(&c__1, "      Outlet node ", (ftnlen)18);
	    do_fio(&c__1, (char *)&(*node2), (ftnlen)sizeof(integer));
	    do_fio(&c__1, ":    Tt2=", (ftnlen)9);
	    do_fio(&c__1, (char *)&tt2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", Ts2=", (ftnlen)6);
	    do_fio(&c__1, (char *)&tt2, (ftnlen)sizeof(doublereal));
	    do_fio(&c__1, ", Pt2=", (ftnlen)6);
	    do_fio(&c__1, (char *)&pt2, (ftnlen)sizeof(doublereal));
	    e_wsfe();

	}
    }


    *xflow /= *iaxial;
    df[3] *= *iaxial;

    return 0;
} /* massflow_percent__ */

