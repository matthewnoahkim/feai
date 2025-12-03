/* skip.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int skip_(integer *nset, integer *nalset, integer *nload, 
	integer *nbody, integer *nforc, integer *nboun, integer *nk, integer *
	ne, integer *nkon, integer *mi, integer *nmpc, integer *mpcend, 
	integer *nmat, integer *ntmat___, integer *npmat___, integer *
	ncmat___, integer *norien, integer *ntrans, integer *nam, integer *
	nprint, integer *nlabel, integer *ncs___, integer *ne1d, integer *
	ne2d, integer *infree, integer *nmethod, integer *iperturb, integer *
	nener, integer *ithermal, integer *nstate___, integer *iprestr, 
	integer *mcs, integer *ntie, integer *nslavs, integer *nprop, integer 
	*mortar, integer *ifacecount, integer *nintpoint, integer *nef, 
	integer *nheading___, integer *nfc, integer *ndc)
{
    /* System generated locals */
    integer i__1;

    /* Builtin functions */
    integer s_rsue(cilist *), do_uio(integer *, char *, ftnlen), e_rsue(void);

    /* Local variables */
    integer i__;
    char c1[1], c3[3], c6[6], c8[8];
    integer i4;
    doublereal r8;
    char c20[20], c80[80], c81[81], c66[66], c87[87];
    integer mt, maxamta;

    /* Fortran I/O blocks */
    static cilist io___2 = { 0, 15, 0, 0, 0 };
    static cilist io___5 = { 0, 15, 0, 0, 0 };
    static cilist io___7 = { 0, 15, 0, 0, 0 };
    static cilist io___8 = { 0, 15, 0, 0, 0 };
    static cilist io___9 = { 0, 15, 0, 0, 0 };
    static cilist io___11 = { 0, 15, 0, 0, 0 };
    static cilist io___13 = { 0, 15, 0, 0, 0 };
    static cilist io___14 = { 0, 15, 0, 0, 0 };
    static cilist io___15 = { 0, 15, 0, 0, 0 };
    static cilist io___17 = { 0, 15, 0, 0, 0 };
    static cilist io___18 = { 0, 15, 0, 0, 0 };
    static cilist io___19 = { 0, 15, 0, 0, 0 };
    static cilist io___21 = { 0, 15, 0, 0, 0 };
    static cilist io___22 = { 0, 15, 0, 0, 0 };
    static cilist io___23 = { 0, 15, 0, 0, 0 };
    static cilist io___24 = { 0, 15, 0, 0, 0 };
    static cilist io___25 = { 0, 15, 0, 0, 0 };
    static cilist io___26 = { 0, 15, 0, 0, 0 };
    static cilist io___27 = { 0, 15, 0, 0, 0 };
    static cilist io___28 = { 0, 15, 0, 0, 0 };
    static cilist io___29 = { 0, 15, 0, 0, 0 };
    static cilist io___31 = { 0, 15, 0, 0, 0 };
    static cilist io___32 = { 0, 15, 0, 0, 0 };
    static cilist io___33 = { 0, 15, 0, 0, 0 };
    static cilist io___34 = { 0, 15, 0, 0, 0 };
    static cilist io___35 = { 0, 15, 0, 0, 0 };
    static cilist io___36 = { 0, 15, 0, 0, 0 };
    static cilist io___37 = { 0, 15, 0, 0, 0 };
    static cilist io___38 = { 0, 15, 0, 0, 0 };
    static cilist io___39 = { 0, 15, 0, 0, 0 };
    static cilist io___40 = { 0, 15, 0, 0, 0 };
    static cilist io___41 = { 0, 15, 0, 0, 0 };
    static cilist io___42 = { 0, 15, 0, 0, 0 };
    static cilist io___43 = { 0, 15, 0, 0, 0 };
    static cilist io___44 = { 0, 15, 0, 0, 0 };
    static cilist io___45 = { 0, 15, 0, 0, 0 };
    static cilist io___46 = { 0, 15, 0, 0, 0 };
    static cilist io___47 = { 0, 15, 0, 0, 0 };
    static cilist io___48 = { 0, 15, 0, 0, 0 };
    static cilist io___49 = { 0, 15, 0, 0, 0 };
    static cilist io___50 = { 0, 15, 0, 0, 0 };
    static cilist io___51 = { 0, 15, 0, 0, 0 };
    static cilist io___52 = { 0, 15, 0, 0, 0 };
    static cilist io___53 = { 0, 15, 0, 0, 0 };
    static cilist io___54 = { 0, 15, 0, 0, 0 };
    static cilist io___55 = { 0, 15, 0, 0, 0 };
    static cilist io___56 = { 0, 15, 0, 0, 0 };
    static cilist io___58 = { 0, 15, 0, 0, 0 };
    static cilist io___59 = { 0, 15, 0, 0, 0 };
    static cilist io___61 = { 0, 15, 0, 0, 0 };
    static cilist io___62 = { 0, 15, 0, 0, 0 };
    static cilist io___63 = { 0, 15, 0, 0, 0 };
    static cilist io___64 = { 0, 15, 0, 0, 0 };
    static cilist io___65 = { 0, 15, 0, 0, 0 };
    static cilist io___66 = { 0, 15, 0, 0, 0 };
    static cilist io___67 = { 0, 15, 0, 0, 0 };
    static cilist io___68 = { 0, 15, 0, 0, 0 };
    static cilist io___69 = { 0, 15, 0, 0, 0 };
    static cilist io___70 = { 0, 15, 0, 0, 0 };
    static cilist io___71 = { 0, 15, 0, 0, 0 };
    static cilist io___72 = { 0, 15, 0, 0, 0 };
    static cilist io___73 = { 0, 15, 0, 0, 0 };
    static cilist io___74 = { 0, 15, 0, 0, 0 };
    static cilist io___75 = { 0, 15, 0, 0, 0 };
    static cilist io___76 = { 0, 15, 0, 0, 0 };
    static cilist io___77 = { 0, 15, 0, 0, 0 };
    static cilist io___79 = { 0, 15, 0, 0, 0 };
    static cilist io___80 = { 0, 15, 0, 0, 0 };
    static cilist io___81 = { 0, 15, 0, 0, 0 };
    static cilist io___82 = { 0, 15, 0, 0, 0 };
    static cilist io___83 = { 0, 15, 0, 0, 0 };
    static cilist io___84 = { 0, 15, 0, 0, 0 };
    static cilist io___85 = { 0, 15, 0, 0, 0 };
    static cilist io___86 = { 0, 15, 0, 0, 0 };
    static cilist io___88 = { 0, 15, 0, 0, 0 };
    static cilist io___89 = { 0, 15, 0, 0, 0 };
    static cilist io___90 = { 0, 15, 0, 0, 0 };
    static cilist io___91 = { 0, 15, 0, 0, 0 };
    static cilist io___92 = { 0, 15, 0, 0, 0 };
    static cilist io___93 = { 0, 15, 0, 0, 0 };
    static cilist io___94 = { 0, 15, 0, 0, 0 };
    static cilist io___95 = { 0, 15, 0, 0, 0 };
    static cilist io___96 = { 0, 15, 0, 0, 0 };
    static cilist io___97 = { 0, 15, 0, 0, 0 };
    static cilist io___98 = { 0, 15, 0, 0, 0 };
    static cilist io___99 = { 0, 15, 0, 0, 0 };
    static cilist io___100 = { 0, 15, 0, 0, 0 };
    static cilist io___101 = { 0, 15, 0, 0, 0 };
    static cilist io___102 = { 0, 15, 0, 0, 0 };
    static cilist io___103 = { 0, 15, 0, 0, 0 };
    static cilist io___104 = { 0, 15, 0, 0, 0 };
    static cilist io___105 = { 0, 15, 0, 0, 0 };
    static cilist io___106 = { 0, 15, 0, 0, 0 };
    static cilist io___107 = { 0, 15, 0, 0, 0 };
    static cilist io___108 = { 0, 15, 0, 0, 0 };
    static cilist io___109 = { 0, 15, 0, 0, 0 };
    static cilist io___110 = { 0, 15, 0, 0, 0 };
    static cilist io___111 = { 0, 15, 0, 0, 0 };
    static cilist io___112 = { 0, 15, 0, 0, 0 };
    static cilist io___113 = { 0, 15, 0, 0, 0 };
    static cilist io___114 = { 0, 15, 0, 0, 0 };
    static cilist io___115 = { 0, 15, 0, 0, 0 };
    static cilist io___116 = { 0, 15, 0, 0, 0 };
    static cilist io___117 = { 0, 15, 0, 0, 0 };
    static cilist io___118 = { 0, 15, 0, 0, 0 };
    static cilist io___119 = { 0, 15, 0, 0, 0 };
    static cilist io___120 = { 0, 15, 0, 0, 0 };
    static cilist io___121 = { 0, 15, 0, 0, 0 };
    static cilist io___122 = { 0, 15, 0, 0, 0 };
    static cilist io___123 = { 0, 15, 0, 0, 0 };
    static cilist io___124 = { 0, 15, 0, 0, 0 };
    static cilist io___125 = { 0, 15, 0, 0, 0 };
    static cilist io___126 = { 0, 15, 0, 0, 0 };
    static cilist io___127 = { 0, 15, 0, 0, 0 };
    static cilist io___129 = { 0, 15, 0, 0, 0 };
    static cilist io___130 = { 0, 15, 0, 0, 0 };







    /* Parameter adjustments */
    --ithermal;
    --iperturb;
    --infree;
    --mi;

    /* Function Body */
    mt = mi[2] + 1;

/*     skipping the next entries */


/*     sets */

    s_rsue(&io___2);
    i__1 = *nset;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, c81, (ftnlen)81);
    }
    e_rsue();
    s_rsue(&io___5);
    i__1 = *nset;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    s_rsue(&io___7);
    i__1 = *nset;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    i__1 = *nalset;
    for (i__ = 1; i__ <= i__1; ++i__) {
	s_rsue(&io___8);
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	e_rsue();
    }

/*     header lines */

    s_rsue(&io___9);
    i__1 = *nheading___;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, c66, (ftnlen)66);
    }
    e_rsue();

/*     mesh */

    s_rsue(&io___11);
    i__1 = *nk * 3;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();
    s_rsue(&io___13);
    i__1 = *nkon;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    s_rsue(&io___14);
    i__1 = *ne;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    s_rsue(&io___15);
    i__1 = *ne;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, c8, (ftnlen)8);
    }
    e_rsue();

/*     single point constraints */

    s_rsue(&io___17);
    i__1 = *nboun;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    s_rsue(&io___18);
    i__1 = *nboun;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    s_rsue(&io___19);
    i__1 = *nboun;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, c1, (ftnlen)1);
    }
    e_rsue();
    s_rsue(&io___21);
    i__1 = *nboun;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();
    s_rsue(&io___22);
    i__1 = *nboun;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    s_rsue(&io___23);
    i__1 = *nboun;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    if (*nam > 0) {
	s_rsue(&io___24);
	i__1 = *nboun;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	}
	e_rsue();
    }
    s_rsue(&io___25);
    i__1 = *nboun;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    s_rsue(&io___26);
    i__1 = *nboun;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    s_rsue(&io___27);
    i__1 = *nboun;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();

/*     multiple point constraints */

    s_rsue(&io___28);
    i__1 = *nmpc;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    s_rsue(&io___29);
    i__1 = *nmpc;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, c20, (ftnlen)20);
    }
    e_rsue();
    s_rsue(&io___31);
    i__1 = *nmpc;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    s_rsue(&io___32);
    i__1 = *nmpc;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    s_rsue(&io___33);
    i__1 = *nmpc;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();
    s_rsue(&io___34);
    i__1 = *mpcend * 3;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    s_rsue(&io___35);
    i__1 = *mpcend;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();

/*     force constraints */

    if (*nfc > 0) {
	s_rsue(&io___36);
	i__1 = *nfc * 7;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
	s_rsue(&io___37);
	i__1 = *ndc;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	}
	e_rsue();
	s_rsue(&io___38);
	i__1 = *ndc * 12;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
    }

/*     point forces */

    s_rsue(&io___39);
    i__1 = *nforc << 1;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    s_rsue(&io___40);
    i__1 = *nforc;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    s_rsue(&io___41);
    i__1 = *nforc;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();
    s_rsue(&io___42);
    i__1 = *nforc;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    s_rsue(&io___43);
    i__1 = *nforc;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    if (*nam > 0) {
	s_rsue(&io___44);
	i__1 = *nforc;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	}
	e_rsue();
    }
    s_rsue(&io___45);
    i__1 = *nforc;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();

/*     distributed loads */

    s_rsue(&io___46);
    i__1 = *nload << 1;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    s_rsue(&io___47);
    i__1 = *nload;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, c20, (ftnlen)20);
    }
    e_rsue();
    s_rsue(&io___48);
    i__1 = *nload << 1;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();
    if (*nam > 0) {
	s_rsue(&io___49);
	i__1 = *nload << 1;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	}
	e_rsue();
    }
    s_rsue(&io___50);
    i__1 = *nload << 1;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();
    s_rsue(&io___51);
    i__1 = *nbody;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, c81, (ftnlen)81);
    }
    e_rsue();
    s_rsue(&io___52);
    i__1 = *nbody * 3;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    s_rsue(&io___53);
    i__1 = *nbody * 7;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();
    s_rsue(&io___54);
    i__1 = *nbody * 7;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();

/*     prestress */

    if (*iprestr > 0) {
	s_rsue(&io___55);
	i__1 = mi[1] * 6 * *ne;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
    }

/*     labels */

    s_rsue(&io___56);
    i__1 = *nprint;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, c6, (ftnlen)6);
    }
    e_rsue();
    s_rsue(&io___58);
    i__1 = *nprint;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, c81, (ftnlen)81);
    }
    e_rsue();
    s_rsue(&io___59);
    i__1 = *nlabel;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, c87, (ftnlen)87);
    }
    e_rsue();

/*     elastic constants */

    s_rsue(&io___61);
    i__1 = (*ncmat___ + 1) * *ntmat___ * *nmat;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();
    s_rsue(&io___62);
    i__1 = *nmat << 1;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();

/*     density */

    s_rsue(&io___63);
    i__1 = (*ntmat___ << 1) * *nmat;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();
    s_rsue(&io___64);
    i__1 = *nmat;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();

/*     specific heat */

    s_rsue(&io___65);
    i__1 = (*ntmat___ << 2) * *nmat;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();
    s_rsue(&io___66);
    i__1 = *nmat;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();

/*     conductivity */

    s_rsue(&io___67);
    i__1 = *ntmat___ * 7 * *nmat;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();
    s_rsue(&io___68);
    i__1 = *nmat << 1;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();

/*     expansion coefficients */

    s_rsue(&io___69);
    i__1 = *ntmat___ * 7 * *nmat;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();
    s_rsue(&io___70);
    i__1 = *nmat << 1;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();
    s_rsue(&io___71);
    i__1 = *nmat;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();

/*     physical constants */

    s_rsue(&io___72);
    for (i__ = 1; i__ <= 14; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();

/*     plastic data */

    if (*npmat___ != 0) {
	s_rsue(&io___73);
	i__1 = ((*npmat___ << 1) + 1) * *ntmat___ * *nmat;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
	s_rsue(&io___74);
	i__1 = (*ntmat___ + 1) * *nmat;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	}
	e_rsue();
	s_rsue(&io___75);
	i__1 = ((*npmat___ << 1) + 1) * *ntmat___ * *nmat;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
	s_rsue(&io___76);
	i__1 = (*ntmat___ + 1) * *nmat;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	}
	e_rsue();
    }

/*     material orientation */

    if (*norien != 0) {
	s_rsue(&io___77);
	i__1 = *norien;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, c80, (ftnlen)80);
	}
	e_rsue();
	s_rsue(&io___79);
	i__1 = *norien * 7;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
	s_rsue(&io___80);
	i__1 = mi[3] * *ne;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	}
	e_rsue();
    }

/*     fluid section properties */

    if (*nprop != 0) {
	s_rsue(&io___81);
	i__1 = *ne;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	}
	e_rsue();
	s_rsue(&io___82);
	i__1 = *nprop;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
    }

/*     transformations */

    if (*ntrans != 0) {
	s_rsue(&io___83);
	i__1 = *ntrans * 7;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
	s_rsue(&io___84);
	i__1 = *nk << 1;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	}
	e_rsue();
    }

/*     amplitudes */

    if (*nam > 0) {
	s_rsue(&io___85);
	i__1 = *nam;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, c80, (ftnlen)80);
	}
	e_rsue();
	s_rsue(&io___86);
	i__1 = *nam * 3 - 1;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	}
	e_rsue();
	maxamta = i4 << 1;
	s_rsue(&io___88);
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	e_rsue();
	s_rsue(&io___89);
	i__1 = maxamta;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
    }

/*     temperatures */

    if (ithermal[1] > 0) {
	s_rsue(&io___90);
	i__1 = *nk;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
	s_rsue(&io___91);
	i__1 = *nk;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
	if (*ne1d > 0 || *ne2d > 0) {
	    s_rsue(&io___92);
	    i__1 = *nk << 1;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	    }
	    e_rsue();
	    s_rsue(&io___93);
	    i__1 = *nk << 1;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	    }
	    e_rsue();
	}
	if (*nam > 0) {
	    s_rsue(&io___94);
	    i__1 = *nk;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	    }
	    e_rsue();
	}
	s_rsue(&io___95);
	i__1 = *nk;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
    }

/*     materials */

    s_rsue(&io___96);
    i__1 = *nmat;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, c80, (ftnlen)80);
    }
    e_rsue();
    s_rsue(&io___97);
    i__1 = mi[3] * *ne;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();

/*     temperature, displacement, static pressure, velocity and acceleration */

    s_rsue(&io___98);
    i__1 = mt * *nk;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();
    if (*nmethod == 4 || *nmethod == 1 && iperturb[1] >= 2) {
	s_rsue(&io___99);
	i__1 = mt * *nk;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
    }

/*     CFD results at the element centers */

    if (*nef > 0) {
	s_rsue(&io___100);
	i__1 = *nef << 3;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
	s_rsue(&io___101);
	i__1 = *nef << 3;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
	s_rsue(&io___102);
	i__1 = *nef << 3;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
    }

/*     1d and 2d elements */

    if (*ne1d > 0 || *ne2d > 0) {
	s_rsue(&io___103);
	i__1 = *nkon << 1;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	}
	e_rsue();
	s_rsue(&io___104);
	i__1 = infree[1];
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
	s_rsue(&io___105);
	i__1 = infree[2];
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	}
	e_rsue();
	s_rsue(&io___106);
	i__1 = mi[3] * *nkon;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
	s_rsue(&io___107);
	i__1 = *ne << 1;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
	s_rsue(&io___108);
	i__1 = infree[4];
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	}
	e_rsue();
	s_rsue(&io___109);
	i__1 = (infree[3] - 1) * 3;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	}
	e_rsue();
	s_rsue(&io___110);
	i__1 = infree[4];
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	}
	e_rsue();
	s_rsue(&io___111);
	i__1 = infree[4] << 1;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	}
	e_rsue();
    }

/*     tie constraints */

    if (*ntie > 0) {
	s_rsue(&io___112);
	i__1 = *ntie * 3;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, c81, (ftnlen)81);
	}
	e_rsue();
	s_rsue(&io___113);
	i__1 = *ntie << 2;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
    }

/*     cyclic symmetry */

    if (*ncs___ > 0) {
	s_rsue(&io___114);
	i__1 = *ncs___;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	}
	e_rsue();
    }
    if (*mcs > 0) {
	s_rsue(&io___115);
	i__1 = *mcs * 17;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
    }

/*     integration point variables */

    s_rsue(&io___116);
    i__1 = mi[1] * 6 * *ne;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();
    s_rsue(&io___117);
    i__1 = mi[1] * 6 * *ne;
    for (i__ = 1; i__ <= i__1; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();
    if (*nener == 1) {
	if (*mortar != 1) {
	    s_rsue(&io___118);
	    i__1 = (mi[1] << 1) * (*ne + *nslavs);
	    for (i__ = 1; i__ <= i__1; ++i__) {
		do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	    }
	    e_rsue();
	} else {
	    s_rsue(&io___119);
	    i__1 = (mi[1] << 1) * *ne;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	    }
	    e_rsue();
	}
    }
    if (*nstate___ > 0) {
	if (*mortar != 1) {
	    s_rsue(&io___120);
	    i__1 = *nstate___ * mi[1] * (*ne + *nslavs);
	    for (i__ = 1; i__ <= i__1; ++i__) {
		do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	    }
	    e_rsue();
	} else {
	    s_rsue(&io___121);
	    i__1 = *nstate___ * mi[1] * (*ne + *nintpoint);
	    for (i__ = 1; i__ <= i__1; ++i__) {
		do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	    }
	    e_rsue();
	}
    }

/*     face-to-face penalty contact variables */

    if (*mortar == 1) {
	s_rsue(&io___122);
	i__1 = (*ifacecount << 1) + 2;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
	}
	e_rsue();
	s_rsue(&io___123);
	i__1 = *nintpoint * 3;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
	s_rsue(&io___124);
	i__1 = *ifacecount * 27;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
	}
	e_rsue();
    }

/*     control parameters */

    s_rsue(&io___125);
    for (i__ = 1; i__ <= 52; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();
    s_rsue(&io___126);
    for (i__ = 1; i__ <= 2; ++i__) {
	do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    }
    e_rsue();
    s_rsue(&io___127);
    do_uio(&c__1, c3, (ftnlen)3);
    e_rsue();
    s_rsue(&io___129);
    do_uio(&c__1, (char *)&r8, (ftnlen)sizeof(doublereal));
    e_rsue();

/*     restart parameters */

    s_rsue(&io___130);
    for (i__ = 1; i__ <= 2; ++i__) {
	do_uio(&c__1, (char *)&i4, (ftnlen)sizeof(integer));
    }
    e_rsue();

    return 0;
} /* skip_ */

