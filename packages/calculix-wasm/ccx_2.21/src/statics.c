/* statics.f -- translated by f2c (version 20200916).
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
static integer c__5 = 5;


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

/* Subroutine */ int statics_(char *inpc, char *textpart, integer *nmethod, 
	integer *iperturb, integer *isolver, integer *istep, integer *istat, 
	integer *n, doublereal *tinc, doublereal *tper, doublereal *tmin, 
	doublereal *tmax, integer *idrct, integer *iline, integer *ipol, 
	integer *inl, integer *ipoinp, integer *inp, integer *ithermal, 
	doublereal *cs, integer *ics, char *tieset, integer *istartset, 
	integer *iendset, integer *ialset, integer *ipompc, integer *nodempc, 
	doublereal *coefmpc, integer *nmpc, integer *nmpc___, integer *ikmpc, 
	integer *ilmpc, integer *mpcfree, integer *mcs, char *set, integer *
	nset, char *labmpc, integer *ipoinpc, integer *iexpl, integer *nef, 
	doublereal *ttime, integer *iaxial, integer *nelcon, integer *nmat, 
	doublereal *tincf, integer *ier, ftnlen inpc_len, ftnlen textpart_len,
	 ftnlen tieset_len, ftnlen set_len, ftnlen labmpc_len)
{
    /* System generated locals */
    integer i__1;
    doublereal d__1, d__2, d__3;
    icilist ici__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);
    integer s_cmp(char *, char *, ftnlen, ftnlen), s_rsfi(icilist *), do_fio(
	    integer *, char *, ftnlen), e_rsfi(void), i_indx(char *, char *, 
	    ftnlen, ftnlen);

    /* Local variables */
    integer i__;
    logical timereset;
    extern /* Subroutine */ int getnewline_(char *, char *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *, ftnlen, ftnlen), inputerror_(char *, 
	    integer *, integer *, char *, integer *, ftnlen, ftnlen);
    integer key;
    extern /* Subroutine */ int selectcyclicsymmetrymodess_(char *, char *, 
	    doublereal *, integer *, char *, integer *, integer *, integer *, 
	    integer *, integer *, doublereal *, integer *, integer *, integer 
	    *, integer *, integer *, integer *, char *, integer *, char *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, ftnlen, 
	    ftnlen, ftnlen, ftnlen, ftnlen), inputwarning_(char *, integer *, 
	    integer *, char *, ftnlen, ftnlen);
    char solver[20];

    /* Fortran I/O blocks */
    static cilist io___2 = { 0, 6, 0, 0, 0 };
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___6 = { 0, 6, 0, 0, 0 };
    static cilist io___7 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___10 = { 0, 6, 0, 0, 0 };
    static cilist io___12 = { 0, 6, 0, 0, 0 };
    static cilist io___13 = { 0, 6, 0, 0, 0 };
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
    static cilist io___26 = { 0, 6, 0, 0, 0 };
    static cilist io___27 = { 0, 6, 0, 0, 0 };
    static cilist io___28 = { 0, 6, 0, 0, 0 };
    static cilist io___29 = { 0, 6, 0, 0, 0 };
    static cilist io___30 = { 0, 6, 0, 0, 0 };
    static cilist io___31 = { 0, 6, 0, 0, 0 };
    static cilist io___32 = { 0, 6, 0, 0, 0 };
    static cilist io___33 = { 0, 6, 0, 0, 0 };



/*     reading the input deck: *STATIC */

/*     isolver=0: SPOOLES */
/*             2: iterative solver with diagonal scaling */
/*             3: iterative solver with Cholesky preconditioning */
/*             4: sgi solver */
/*             5: TAUCS */
/*             7: pardiso */
/*             8: pastix */

/*      iexpl==0:  structure:implicit, fluid:incompressible */






    /* Parameter adjustments */
    nelcon -= 3;
    labmpc -= 20;
    set -= 81;
    --ilmpc;
    --ikmpc;
    --coefmpc;
    nodempc -= 4;
    --ipompc;
    --ialset;
    --iendset;
    --istartset;
    tieset -= 324;
    --ics;
    cs -= 18;
    --ithermal;
    inp -= 4;
    ipoinp -= 3;
    --iperturb;
    textpart -= 132;
    --inpc;

    /* Function Body */
    *idrct = 0;
    *tmin = 0.;
    *tmax = 0.;
    timereset = FALSE_;

    if (*istep < 1) {
	s_wsle(&io___2);
	do_lio(&c__9, &c__1, "*ERROR reading *STATIC: *STATIC can only be us"
		"ed", (ftnlen)48);
	e_wsle();
	s_wsle(&io___3);
	do_lio(&c__9, &c__1, "       within a STEP", (ftnlen)20);
	e_wsle();
	*ier = 1;
	return 0;
    }

/*     no heat transfer analysis */

    if (ithermal[1] > 1) {
	ithermal[1] = 1;
    }

/*     default solver */

    s_copy(solver, "                    ", (ftnlen)20, (ftnlen)20);
    if (*isolver == 0) {
	s_copy(solver, "SPOOLES", (ftnlen)7, (ftnlen)7);
    } else if (*isolver == 2) {
	s_copy(solver, "ITERATIVESCALING", (ftnlen)16, (ftnlen)16);
    } else if (*isolver == 3) {
	s_copy(solver, "ITERATIVECHOLESKY", (ftnlen)17, (ftnlen)17);
    } else if (*isolver == 4) {
	s_copy(solver, "SGI", (ftnlen)3, (ftnlen)3);
    } else if (*isolver == 5) {
	s_copy(solver, "TAUCS", (ftnlen)5, (ftnlen)5);
    } else if (*isolver == 7) {
	s_copy(solver, "PARDISO", (ftnlen)7, (ftnlen)7);
    } else if (*isolver == 8) {
	s_copy(solver, "PASTIX", (ftnlen)6, (ftnlen)6);
    }

    i__1 = *n;
    for (i__ = 2; i__ <= i__1; ++i__) {
	if (s_cmp(textpart + i__ * 132, "SOLVER=", (ftnlen)7, (ftnlen)7) == 0)
		 {
	    ici__1.icierr = 0;
	    ici__1.iciend = 0;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 20;
	    ici__1.iciunit = textpart + (i__ * 132 + 7);
	    ici__1.icifmt = "(a20)";
	    s_rsfi(&ici__1);
	    do_fio(&c__1, solver, (ftnlen)20);
	    e_rsfi();
	} else if (s_cmp(textpart + i__ * 132, "DIRECT", (ftnlen)6, (ftnlen)6)
		 == 0 && s_cmp(textpart + i__ * 132, "DIRECT=NO", (ftnlen)9, (
		ftnlen)9) != 0) {
	    *idrct = 1;
	} else if (s_cmp(textpart + i__ * 132, "TIMERESET", (ftnlen)9, (
		ftnlen)9) == 0) {
	    timereset = TRUE_;
	} else if (s_cmp(textpart + i__ * 132, "TOTALTIMEATSTART=", (ftnlen)
		17, (ftnlen)17) == 0) {
	    ici__1.icierr = 1;
	    ici__1.iciend = 1;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 20;
	    ici__1.iciunit = textpart + (i__ * 132 + 17);
	    ici__1.icifmt = "(f20.0)";
	    *istat = s_rsfi(&ici__1);
	    if (*istat != 0) {
		goto L100001;
	    }
	    *istat = do_fio(&c__1, (char *)&(*ttime), (ftnlen)sizeof(
		    doublereal));
	    if (*istat != 0) {
		goto L100001;
	    }
	    *istat = e_rsfi();
L100001:
	    ;
	} else {
	    s_wsle(&io___6);
	    do_lio(&c__9, &c__1, "*WARNING reading *STATIC: parameter not re"
		    "cognized:", (ftnlen)51);
	    e_wsle();
	    s_wsle(&io___7);
	    do_lio(&c__9, &c__1, "         ", (ftnlen)9);
	    do_lio(&c__9, &c__1, textpart + i__ * 132, i_indx(textpart + i__ *
		     132, " ", (ftnlen)132, (ftnlen)1) - 1);
	    e_wsle();
	    inputwarning_(inpc + 1, ipoinpc, iline, "*STATIC%", (ftnlen)1, (
		    ftnlen)8);
	}
    }

    if (s_cmp(solver, "SPOOLES", (ftnlen)7, (ftnlen)7) == 0) {
	*isolver = 0;
    } else if (s_cmp(solver, "ITERATIVESCALING", (ftnlen)16, (ftnlen)16) == 0)
	     {
	*isolver = 2;
    } else if (s_cmp(solver, "ITERATIVECHOLESKY", (ftnlen)17, (ftnlen)17) == 
	    0) {
	*isolver = 3;
    } else if (s_cmp(solver, "SGI", (ftnlen)3, (ftnlen)3) == 0) {
	*isolver = 4;
    } else if (s_cmp(solver, "TAUCS", (ftnlen)5, (ftnlen)5) == 0) {
	*isolver = 5;
    } else if (s_cmp(solver, "PARDISO", (ftnlen)7, (ftnlen)7) == 0) {
	*isolver = 7;
    } else if (s_cmp(solver, "PASTIX", (ftnlen)6, (ftnlen)6) == 0) {
	*isolver = 8;
    } else {
	s_wsle(&io___8);
	do_lio(&c__9, &c__1, "*WARNING reading *STATIC: unknown solver;", (
		ftnlen)41);
	e_wsle();
	s_wsle(&io___9);
	do_lio(&c__9, &c__1, "         the default solver is used", (ftnlen)
		35);
	e_wsle();
	s_wsle(&io___10);
	e_wsle();
    }

    *nmethod = 1;

/*     check for nodes on a cyclic symmetry axis */

    if (*mcs == 0 || *iaxial == 180) {
	getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, 
		inl, &ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);
    } else {
	*n = 3;
	s_copy(textpart + 264, "NMIN=0                                      "
		"                                                            "
		"                            ", (ftnlen)132, (ftnlen)132);
	s_copy(textpart + 396, "NMAX=0                                      "
		"                                                            "
		"                            ", (ftnlen)132, (ftnlen)132);
	*nmethod = 2;
	selectcyclicsymmetrymodess_(inpc + 1, textpart + 132, &cs[18], &ics[1]
		, tieset + 324, &istartset[1], &iendset[1], &ialset[1], &
		ipompc[1], &nodempc[4], &coefmpc[1], nmpc, nmpc___, &ikmpc[1],
		 &ilmpc[1], mpcfree, mcs, set + 81, nset, labmpc + 20, istep, 
		istat, n, iline, ipol, inl, &ipoinp[3], &inp[4], nmethod, &
		key, ipoinpc, (ftnlen)1, (ftnlen)132, (ftnlen)81, (ftnlen)81, 
		(ftnlen)20);
	*nmethod = 1;
	i__1 = *mcs;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    cs[i__ * 17 + 2] = -.5;
	    cs[i__ * 17 + 3] = -.5;
	}
    }

    if (*istat < 0 || key == 1) {
	if (iperturb[1] >= 2 || *nef > 0) {
	    s_wsle(&io___12);
	    do_lio(&c__9, &c__1, "*WARNING reading *STATIC: a nonlinear anal"
		    "ysis is requested", (ftnlen)59);
	    e_wsle();
	    s_wsle(&io___13);
	    do_lio(&c__9, &c__1, "         but no time increment nor step is"
		    " specified", (ftnlen)52);
	    e_wsle();
	    s_wsle(&io___14);
	    do_lio(&c__9, &c__1, "         the defaults (1,1) are used", (
		    ftnlen)36);
	    e_wsle();
	    s_wsle(&io___15);
	    e_wsle();
	    *tinc = 1.;
	    *tper = 1.;
/*            tmin=1.d-5 */
	    *tmin = 1e-6;
	    *tmax = 1e30;
	    *tincf = -1.;
	} else {
	    *tper = 1.;
	}
	if (timereset) {
	    *ttime -= *tper;
	}
	return 0;
    }

    ici__1.icierr = 1;
    ici__1.iciend = 1;
    ici__1.icirnum = 1;
    ici__1.icirlen = 20;
    ici__1.iciunit = textpart + 132;
    ici__1.icifmt = "(f20.0)";
    *istat = s_rsfi(&ici__1);
    if (*istat != 0) {
	goto L100002;
    }
    *istat = do_fio(&c__1, (char *)&(*tinc), (ftnlen)sizeof(doublereal));
    if (*istat != 0) {
	goto L100002;
    }
    *istat = e_rsfi();
L100002:
    if (*istat > 0) {
	inputerror_(inpc + 1, ipoinpc, iline, "*STATIC%", ier, (ftnlen)1, (
		ftnlen)8);
	return 0;
    }
    ici__1.icierr = 1;
    ici__1.iciend = 1;
    ici__1.icirnum = 1;
    ici__1.icirlen = 20;
    ici__1.iciunit = textpart + 264;
    ici__1.icifmt = "(f20.0)";
    *istat = s_rsfi(&ici__1);
    if (*istat != 0) {
	goto L100003;
    }
    *istat = do_fio(&c__1, (char *)&(*tper), (ftnlen)sizeof(doublereal));
    if (*istat != 0) {
	goto L100003;
    }
    *istat = e_rsfi();
L100003:
    if (*istat > 0) {
	inputerror_(inpc + 1, ipoinpc, iline, "*STATIC%", ier, (ftnlen)1, (
		ftnlen)8);
	return 0;
    }
    ici__1.icierr = 1;
    ici__1.iciend = 1;
    ici__1.icirnum = 1;
    ici__1.icirlen = 20;
    ici__1.iciunit = textpart + 396;
    ici__1.icifmt = "(f20.0)";
    *istat = s_rsfi(&ici__1);
    if (*istat != 0) {
	goto L100004;
    }
    *istat = do_fio(&c__1, (char *)&(*tmin), (ftnlen)sizeof(doublereal));
    if (*istat != 0) {
	goto L100004;
    }
    *istat = e_rsfi();
L100004:
    if (*istat > 0) {
	inputerror_(inpc + 1, ipoinpc, iline, "*STATIC%", ier, (ftnlen)1, (
		ftnlen)8);
	return 0;
    }
    ici__1.icierr = 1;
    ici__1.iciend = 1;
    ici__1.icirnum = 1;
    ici__1.icirlen = 20;
    ici__1.iciunit = textpart + 528;
    ici__1.icifmt = "(f20.0)";
    *istat = s_rsfi(&ici__1);
    if (*istat != 0) {
	goto L100005;
    }
    *istat = do_fio(&c__1, (char *)&(*tmax), (ftnlen)sizeof(doublereal));
    if (*istat != 0) {
	goto L100005;
    }
    *istat = e_rsfi();
L100005:
    if (*istat > 0) {
	inputerror_(inpc + 1, ipoinpc, iline, "*STATIC%", ier, (ftnlen)1, (
		ftnlen)8);
	return 0;
    }
    ici__1.icierr = 1;
    ici__1.iciend = 1;
    ici__1.icirnum = 1;
    ici__1.icirlen = 20;
    ici__1.iciunit = textpart + 660;
    ici__1.icifmt = "(f20.0)";
    *istat = s_rsfi(&ici__1);
    if (*istat != 0) {
	goto L100006;
    }
    *istat = do_fio(&c__1, (char *)&(*tincf), (ftnlen)sizeof(doublereal));
    if (*istat != 0) {
	goto L100006;
    }
    *istat = e_rsfi();
L100006:
    if (*istat > 0) {
	inputerror_(inpc + 1, ipoinpc, iline, "*STATIC%", ier, (ftnlen)1, (
		ftnlen)8);
	return 0;
    }

    if (*tper < 0.) {
	s_wsle(&io___16);
	do_lio(&c__9, &c__1, "*ERROR reading *STATIC: step size is negative", 
		(ftnlen)45);
	e_wsle();
	*ier = 1;
	return 0;
    } else if (*tper <= 0.) {
	*tper = 1.;
    }
    if (*tinc < 0.) {
	s_wsle(&io___17);
	do_lio(&c__9, &c__1, "*ERROR reading *STATIC: initial increment size"
		" is negative", (ftnlen)58);
	e_wsle();
	*ier = 1;
	return 0;
    } else if (*tinc <= 0.) {
	*tinc = *tper;
    }
    if (*tinc > *tper) {
	s_wsle(&io___18);
	do_lio(&c__9, &c__1, "*ERROR reading *STATIC: initial increment size"
		" exceeds step size", (ftnlen)64);
	e_wsle();
	*ier = 1;
	return 0;
    }

    if (*idrct != 1) {
	if (abs(*tmin) < *tper * 1e-6) {
	    s_wsle(&io___19);
	    do_lio(&c__9, &c__1, "*WARNING reading *STATIC:", (ftnlen)25);
	    e_wsle();
	    s_wsle(&io___20);
	    do_lio(&c__9, &c__1, "         the minimum increment ", (ftnlen)
		    31);
	    do_lio(&c__5, &c__1, (char *)&(*tmin), (ftnlen)sizeof(doublereal))
		    ;
	    e_wsle();
	    s_wsle(&io___21);
	    do_lio(&c__9, &c__1, "         is smaller then 1.e-6 times the ", 
		    (ftnlen)41);
	    e_wsle();
	    s_wsle(&io___22);
	    do_lio(&c__9, &c__1, "         step time;", (ftnlen)19);
	    e_wsle();
	    s_wsle(&io___23);
	    do_lio(&c__9, &c__1, "         the minimum increment is changed", 
		    (ftnlen)41);
	    e_wsle();
	    s_wsle(&io___24);
	    do_lio(&c__9, &c__1, "         to ", (ftnlen)12);
/* Computing MIN */
	    d__2 = *tinc, d__3 = *tper * 1e-6;
	    d__1 = min(d__2,d__3);
	    do_lio(&c__5, &c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
	    e_wsle();
	    s_wsle(&io___25);
	    do_lio(&c__9, &c__1, "         which is the minimum of the initi"
		    "al", (ftnlen)44);
	    e_wsle();
	    s_wsle(&io___26);
	    do_lio(&c__9, &c__1, "         increment time and 1.e-6 times th"
		    "e step time", (ftnlen)53);
	    e_wsle();
	    s_wsle(&io___27);
	    e_wsle();
/* Computing MIN */
	    d__1 = *tinc, d__2 = *tper * 1e-6;
	    *tmin = min(d__1,d__2);
	}
	if (abs(*tmax) < 1e-10) {
	    *tmax = 1e30;
	}
	if (*tinc > abs(*tmax)) {
	    s_wsle(&io___28);
	    do_lio(&c__9, &c__1, "*WARNING reading *STATIC:", (ftnlen)25);
	    e_wsle();
	    s_wsle(&io___29);
	    do_lio(&c__9, &c__1, "         the initial increment ", (ftnlen)
		    31);
	    do_lio(&c__5, &c__1, (char *)&(*tinc), (ftnlen)sizeof(doublereal))
		    ;
	    e_wsle();
	    s_wsle(&io___30);
	    do_lio(&c__9, &c__1, "         exceeds the maximum increment ", (
		    ftnlen)39);
	    do_lio(&c__5, &c__1, (char *)&(*tmax), (ftnlen)sizeof(doublereal))
		    ;
	    e_wsle();
	    s_wsle(&io___31);
	    do_lio(&c__9, &c__1, "         the initial increment is reduced", 
		    (ftnlen)41);
	    e_wsle();
	    s_wsle(&io___32);
	    do_lio(&c__9, &c__1, "         to the maximum value", (ftnlen)29);
	    e_wsle();
	    s_wsle(&io___33);
	    e_wsle();
	    *tinc = abs(*tmax);
	}
    }

    if (timereset) {
	*ttime -= *tper;
    }

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

    return 0;
} /* statics_ */

