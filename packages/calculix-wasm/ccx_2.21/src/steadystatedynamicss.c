/* steadystatedynamicss.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int steadystatedynamicss_(char *inpc, char *textpart, 
	integer *nmethod, integer *iexpl, integer *istep, integer *istat, 
	integer *n, integer *iline, integer *ipol, integer *inl, integer *
	ipoinp, integer *inp, integer *iperturb, integer *isolver, doublereal 
	*xmodal, doublereal *cs, integer *mcs, integer *ipoinpc, integer *
	nforc, integer *nload, integer *nbody, integer *iprestr, doublereal *
	t0, doublereal *t1, integer *ithermal, integer *nk, char *set, 
	integer *nset, integer *cyclicsymmetry, integer *ibody, integer *ier, 
	ftnlen inpc_len, ftnlen textpart_len, ftnlen set_len)
{
    /* System generated locals */
    integer i__1;
    icilist ici__1;

    /* Builtin functions */
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void), s_cmp(char *, char *, ftnlen, ftnlen), s_rsfi(
	    icilist *), do_fio(integer *, char *, ftnlen), e_rsfi(void), 
	    i_indx(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    char harmonic[3];
    logical nodalset;
    integer i__, j;
    extern /* Subroutine */ int getnewline_(char *, char *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *, ftnlen, ftnlen), inputerror_(char *, 
	    integer *, integer *, char *, integer *, ftnlen, ftnlen);
    integer key;
    doublereal bias, fmin, fmax, tmin, tmax;
    extern /* Subroutine */ int inputwarning_(char *, integer *, integer *, 
	    char *, ftnlen, ftnlen);
    integer ndata, nfour;
    char solver[20];

    /* Fortran I/O blocks */
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___4 = { 0, 6, 0, 0, 0 };
    static cilist io___5 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___10 = { 0, 6, 0, 0, 0 };
    static cilist io___11 = { 0, 6, 0, 0, 0 };
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
    static cilist io___25 = { 0, 6, 0, 0, 0 };
    static cilist io___26 = { 0, 6, 0, 0, 0 };
    static cilist io___27 = { 0, 6, 0, 0, 0 };
    static cilist io___31 = { 0, 6, 0, 0, 0 };
    static cilist io___32 = { 0, 6, 0, 0, 0 };
    static cilist io___33 = { 0, 6, 0, 0, 0 };
    static cilist io___34 = { 0, 6, 0, 0, 0 };



/*     reading the input deck: *STEADY STATE DYNAMICS */






    /* Parameter adjustments */
    ibody -= 4;
    set -= 81;
    --ithermal;
    --t1;
    --t0;
    cs -= 18;
    --xmodal;
    --iperturb;
    inp -= 4;
    ipoinp -= 3;
    textpart -= 132;
    --inpc;

    /* Function Body */
    *iexpl = 0;
    iperturb[2] = 0;
    s_copy(harmonic, "YES", (ftnlen)3, (ftnlen)3);
    if (*mcs != 0 && cs[19] >= 0.) {
	*cyclicsymmetry = 1;
    }
    nodalset = FALSE_;

    if (*istep < 1) {
	s_wsle(&io___3);
	do_lio(&c__9, &c__1, "*ERROR reading *STEADY STATE DYNAMICS:", (
		ftnlen)38);
	e_wsle();
	s_wsle(&io___4);
	do_lio(&c__9, &c__1, "               *STEADY STATE DYNAMICS", (ftnlen)
		37);
	e_wsle();
	s_wsle(&io___5);
	do_lio(&c__9, &c__1, "  can only be used within a STEP", (ftnlen)32);
	e_wsle();
	*ier = 1;
	return 0;
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
	} else if (s_cmp(textpart + i__ * 132, "HARMONIC=", (ftnlen)9, (
		ftnlen)9) == 0) {
	    ici__1.icierr = 0;
	    ici__1.iciend = 0;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 3;
	    ici__1.iciunit = textpart + (i__ * 132 + 9);
	    ici__1.icifmt = "(a3)";
	    s_rsfi(&ici__1);
	    do_fio(&c__1, harmonic, (ftnlen)3);
	    e_rsfi();
	} else {
	    s_wsle(&io___8);
	    do_lio(&c__9, &c__1, "*WARNING reading *STEADY STATE DYNAMICS:", (
		    ftnlen)40);
	    e_wsle();
	    s_wsle(&io___9);
	    do_lio(&c__9, &c__1, "         parameter not recognized:", (
		    ftnlen)34);
	    e_wsle();
	    s_wsle(&io___10);
	    do_lio(&c__9, &c__1, "         ", (ftnlen)9);
	    do_lio(&c__9, &c__1, textpart + i__ * 132, i_indx(textpart + i__ *
		     132, " ", (ftnlen)132, (ftnlen)1) - 1);
	    e_wsle();
	    inputwarning_(inpc + 1, ipoinpc, iline, "*STEADY STATE DYNAMICS%",
		     (ftnlen)1, (ftnlen)23);
	}
    }

    if (s_cmp(solver, "SPOOLES", (ftnlen)7, (ftnlen)7) == 0) {
	*isolver = 0;
    } else if (s_cmp(solver, "ITERATIVESCALING", (ftnlen)16, (ftnlen)16) == 0)
	     {
	s_wsle(&io___11);
	do_lio(&c__9, &c__1, "*WARNING reading *STEADY STATE DYNAMICS:", (
		ftnlen)40);
	e_wsle();
	s_wsle(&io___12);
	do_lio(&c__9, &c__1, "         the iterative scaling", (ftnlen)30);
	e_wsle();
	s_wsle(&io___13);
	do_lio(&c__9, &c__1, "         procedure is not available for modal", 
		(ftnlen)45);
	e_wsle();
	s_wsle(&io___14);
	do_lio(&c__9, &c__1, "         dynamic calculations; the default sol"
		"ver", (ftnlen)49);
	e_wsle();
	s_wsle(&io___15);
	do_lio(&c__9, &c__1, "         is used", (ftnlen)16);
	e_wsle();
    } else if (s_cmp(solver, "ITERATIVECHOLESKY", (ftnlen)17, (ftnlen)17) == 
	    0) {
	s_wsle(&io___16);
	do_lio(&c__9, &c__1, "*WARNING reading *STEADY STATE DYNAMICS:", (
		ftnlen)40);
	e_wsle();
	s_wsle(&io___17);
	do_lio(&c__9, &c__1, "         the iterative scaling", (ftnlen)30);
	e_wsle();
	s_wsle(&io___18);
	do_lio(&c__9, &c__1, "         procedure is not available for modal", 
		(ftnlen)45);
	e_wsle();
	s_wsle(&io___19);
	do_lio(&c__9, &c__1, "         dynamic calculations; the default sol"
		"ver", (ftnlen)49);
	e_wsle();
	s_wsle(&io___20);
	do_lio(&c__9, &c__1, "         is used", (ftnlen)16);
	e_wsle();
    } else if (s_cmp(solver, "SGI", (ftnlen)3, (ftnlen)3) == 0) {
	*isolver = 4;
    } else if (s_cmp(solver, "TAUCS", (ftnlen)5, (ftnlen)5) == 0) {
	*isolver = 5;
    } else if (s_cmp(solver, "PARDISO", (ftnlen)7, (ftnlen)7) == 0) {
	*isolver = 7;
    } else if (s_cmp(solver, "PASTIX", (ftnlen)6, (ftnlen)6) == 0) {
	*isolver = 8;
    } else {
	s_wsle(&io___21);
	do_lio(&c__9, &c__1, "*WARNING reading *STEADY STATE DYNAMICS:", (
		ftnlen)40);
	e_wsle();
	s_wsle(&io___22);
	do_lio(&c__9, &c__1, "         unknown solver;", (ftnlen)24);
	e_wsle();
	s_wsle(&io___23);
	do_lio(&c__9, &c__1, "         the default solver is used", (ftnlen)
		35);
	e_wsle();
    }

/*      if((isolver.eq.2).or.(isolver.eq.3)) then */
/*         write(*,*) '*ERROR reading *STEADY STATE DYNAMICS:' */
/*         write(*,*) '       the default solver ',solver */
/*         write(*,*) '       cannot be used for modal dynamic' */
/*         write(*,*) '       calculations ' */
/*         ier=1 */
/*         return */
/*      endif */

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);
    if (*istat < 0 || key == 1) {
	s_wsle(&io___25);
	do_lio(&c__9, &c__1, "*ERROR reading *STEADY STATE DYNAMICS:", (
		ftnlen)38);
	e_wsle();
	s_wsle(&io___26);
	do_lio(&c__9, &c__1, "       definition not complete", (ftnlen)30);
	e_wsle();
	s_wsle(&io___27);
	do_lio(&c__9, &c__1, "       ", (ftnlen)7);
	e_wsle();
	inputerror_(inpc + 1, ipoinpc, iline, "*STEADY STATE DYNAMICS%", ier, 
		(ftnlen)1, (ftnlen)23);
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
	goto L100001;
    }
    *istat = do_fio(&c__1, (char *)&fmin, (ftnlen)sizeof(doublereal));
    if (*istat != 0) {
	goto L100001;
    }
    *istat = e_rsfi();
L100001:
    if (*istat > 0) {
	inputerror_(inpc + 1, ipoinpc, iline, "*STEADY STATE DYNAMICS%", ier, 
		(ftnlen)1, (ftnlen)23);
	return 0;
    }
    xmodal[3] = fmin;
    ici__1.icierr = 1;
    ici__1.iciend = 1;
    ici__1.icirnum = 1;
    ici__1.icirlen = 20;
    ici__1.iciunit = textpart + 264;
    ici__1.icifmt = "(f20.0)";
    *istat = s_rsfi(&ici__1);
    if (*istat != 0) {
	goto L100002;
    }
    *istat = do_fio(&c__1, (char *)&fmax, (ftnlen)sizeof(doublereal));
    if (*istat != 0) {
	goto L100002;
    }
    *istat = e_rsfi();
L100002:
    if (*istat > 0) {
	inputerror_(inpc + 1, ipoinpc, iline, "*STEADY STATE DYNAMICS%", ier, 
		(ftnlen)1, (ftnlen)23);
	return 0;
    }
    xmodal[4] = fmax;
    ici__1.icierr = 1;
    ici__1.iciend = 1;
    ici__1.icirnum = 1;
    ici__1.icirlen = 20;
    ici__1.iciunit = textpart + 396;
    ici__1.icifmt = "(i10)";
    *istat = s_rsfi(&ici__1);
    if (*istat != 0) {
	goto L100003;
    }
    *istat = do_fio(&c__1, (char *)&ndata, (ftnlen)sizeof(integer));
    if (*istat != 0) {
	goto L100003;
    }
    *istat = e_rsfi();
L100003:
    if (*istat > 0) {
	inputerror_(inpc + 1, ipoinpc, iline, "*STEADY STATE DYNAMICS%", ier, 
		(ftnlen)1, (ftnlen)23);
	return 0;
    }
    if (*(unsigned char *)&textpart[396] == ' ') {
	ndata = 20;
    } else if (ndata < 2) {
	s_wsle(&io___31);
	do_lio(&c__9, &c__1, "*WARNING reading *STEADY STATE DYNAMICS:", (
		ftnlen)40);
	e_wsle();
	s_wsle(&io___32);
	do_lio(&c__9, &c__1, "         number of data points:", (ftnlen)31);
	do_lio(&c__3, &c__1, (char *)&ndata, (ftnlen)sizeof(integer));
	e_wsle();
	s_wsle(&io___33);
	do_lio(&c__9, &c__1, "         is smaller than 2;", (ftnlen)27);
	e_wsle();
	s_wsle(&io___34);
	do_lio(&c__9, &c__1, "         2 data points are taken instead", (
		ftnlen)40);
	e_wsle();
	ndata = 2;
    }
    xmodal[5] = ndata + .5;
    ici__1.icierr = 1;
    ici__1.iciend = 1;
    ici__1.icirnum = 1;
    ici__1.icirlen = 20;
    ici__1.iciunit = textpart + 528;
    ici__1.icifmt = "(f20.0)";
    *istat = s_rsfi(&ici__1);
    if (*istat != 0) {
	goto L100004;
    }
    *istat = do_fio(&c__1, (char *)&bias, (ftnlen)sizeof(doublereal));
    if (*istat != 0) {
	goto L100004;
    }
    *istat = e_rsfi();
L100004:
    if (*istat > 0) {
	inputerror_(inpc + 1, ipoinpc, iline, "*STEADY STATE DYNAMICS%", ier, 
		(ftnlen)1, (ftnlen)23);
	return 0;
    }
    if (bias < 1.f) {
	bias = 3.;
    }
    xmodal[6] = bias;

    if (s_cmp(harmonic, "YES", (ftnlen)3, (ftnlen)3) == 0) {
	xmodal[7] = -.5;
    } else {
	ici__1.icierr = 1;
	ici__1.iciend = 1;
	ici__1.icirnum = 1;
	ici__1.icirlen = 10;
	ici__1.iciunit = textpart + 660;
	ici__1.icifmt = "(i10)";
	*istat = s_rsfi(&ici__1);
	if (*istat != 0) {
	    goto L100005;
	}
	*istat = do_fio(&c__1, (char *)&nfour, (ftnlen)sizeof(integer));
	if (*istat != 0) {
	    goto L100005;
	}
	*istat = e_rsfi();
L100005:
	if (*istat > 0) {
	    inputerror_(inpc + 1, ipoinpc, iline, "*STEADY STATE DYNAMICS%", 
		    ier, (ftnlen)1, (ftnlen)23);
	    return 0;
	}
	if (nfour <= 0) {
	    nfour = 20;
	}
	if (*n >= 6) {
	    ici__1.icierr = 1;
	    ici__1.iciend = 1;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 20;
	    ici__1.iciunit = textpart + 792;
	    ici__1.icifmt = "(f20.0)";
	    *istat = s_rsfi(&ici__1);
	    if (*istat != 0) {
		goto L100006;
	    }
	    *istat = do_fio(&c__1, (char *)&tmin, (ftnlen)sizeof(doublereal));
	    if (*istat != 0) {
		goto L100006;
	    }
	    *istat = e_rsfi();
L100006:
	    if (*istat > 0) {
		inputerror_(inpc + 1, ipoinpc, iline, "*STEADY STATE DYNAMIC"
			"S%", ier, (ftnlen)1, (ftnlen)23);
		return 0;
	    }
	} else {
	    tmin = 0.;
	}
	if (*n >= 7) {
	    ici__1.icierr = 1;
	    ici__1.iciend = 1;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 20;
	    ici__1.iciunit = textpart + 924;
	    ici__1.icifmt = "(f20.0)";
	    *istat = s_rsfi(&ici__1);
	    if (*istat != 0) {
		goto L100007;
	    }
	    *istat = do_fio(&c__1, (char *)&tmax, (ftnlen)sizeof(doublereal));
	    if (*istat != 0) {
		goto L100007;
	    }
	    *istat = e_rsfi();
L100007:
	    if (*istat > 0) {
		inputerror_(inpc + 1, ipoinpc, iline, "*STEADY STATE DYNAMIC"
			"S%", ier, (ftnlen)1, (ftnlen)23);
		return 0;
	    }
	} else {
	    tmax = 1.;
	}
	xmodal[7] = nfour + .5;
	xmodal[8] = tmin;
	xmodal[9] = tmax;
    }

/*     removing the present loading except centrigufal loading */

    *nforc = 0;
    *nload = 0;
    i__1 = *nbody;
    for (i__ = 1; i__ <= i__1; ++i__) {
	if (ibody[i__ * 3 + 1] != 1) {
	    ibody[i__ * 3 + 1] = 0;
	}
    }
/*      nbody=0 */
    *iprestr = 0;
    if (ithermal[1] == 1 || ithermal[1] == 3) {
	i__1 = *nk;
	for (j = 1; j <= i__1; ++j) {
	    t1[j] = t0[j];
	}
    }

    *nmethod = 5;

/*     correction for cyclic symmetric structures: */
/*       if the present step was not preceded by a frequency step */
/*       no nodal diameter has been selected. To make sure that */
/*       mastructcs is called instead of mastruct a fictitious */
/*       minimum nodal diameter is stored */

    if (*cyclicsymmetry == 1 && *mcs != 0 && cs[19] < 0.) {
	cs[19] = 0.;
    }

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

    return 0;
} /* steadystatedynamicss_ */

