/* fminsirefine.f -- translated by f2c (version 20200916).
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
static integer c__3 = 3;

/* Subroutine */ int fminsirefine_(integer *n, doublereal *x, D_fp fu, 
	doublereal *eps, doublereal *fmin, integer *ier, doublereal *cotet, 
	integer *kontet, integer *ipoeln, integer *ieln, integer *node, 
	integer *iedge, integer *ipoeled, integer *ieled, integer *iedgmid, 
	integer *iedtet)
{
    /* Initialized data */

    static doublereal alpha = 1.;
    static doublereal small = 1e-9;
    static doublereal vsmall = 1e-30;
    static doublereal beta = .5;
    static doublereal gamm0 = 1.;
    static doublereal gamm1 = 3.;
    static doublereal rmult = 8.;
    static integer istmax = 10;
    static doublereal zero = 0.;
    static doublereal one = 1.;
    static doublereal half = .5;

    /* Format strings */
    static char fmt_1003[] = "(\002 +++++FMINSI : N =\002,i3,\002 ILLEGAL"
	    "\002)";
    static char fmt_1000[] = "(\002 +++++FMINSI: DIMENSION N =\002,i4,\002 T"
	    "OO LARGE\002)";
    static char fmt_1002[] = "(\002 +++++FMINSI: Function approximately cons"
	    "tant\002,\002 around starting point\002,/,14x,\002F= \002,e13.6)";
    static char fmt_1001[] = "(\002 +++++FMINSI: STOPPED AFTER\002,i7,\002 I"
	    "TERATIONS\002,/\002              NO CONVERGENCE REACHED\002)";

    /* System generated locals */
    integer i__1, i__2;
    doublereal d__1, d__2, d__3, d__4;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void), s_wsfe(cilist *), do_fio(integer *, char *, ftnlen),
	     e_wsfe(void);
    double d_sign(doublereal *, doublereal *);

    /* Local variables */
    doublereal f[217], h__;
    integer i__, j, k, l;
    doublereal f0, f1, he, hg;
    integer np;
    doublereal edn, fhi;
    integer ihi;
    doublereal flo;
    integer ilo;
    doublereal sim[46872]	/* was [216][217] */, fst, xav[216], xst[216];
    integer imin;
    doublereal epsi[216];
    logical test;
    extern /* Subroutine */ int ranstarefine_(integer *, doublereal *, D_fp, 
	    doublereal *, doublereal *, integer *, doublereal *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *);
    doublereal gamma, gammd;
    integer nsucc, itmax;
    doublereal start, fstst, xstst[216];
    logical modeps, avgupd;
    integer noxsuc;

    /* Fortran I/O blocks */
    static cilist io___14 = { 0, 6, 0, 0, 0 };
    static cilist io___15 = { 0, 6, 0, fmt_1003, 0 };
    static cilist io___16 = { 0, 6, 0, fmt_1000, 0 };
    static cilist io___18 = { 0, 6, 0, 0, 0 };
    static cilist io___26 = { 0, 6, 0, 0, 0 };
    static cilist io___28 = { 0, 6, 0, 0, 0 };
    static cilist io___30 = { 0, 6, 0, 0, 0 };
    static cilist io___32 = { 0, 6, 0, 0, 0 };
    static cilist io___35 = { 0, 6, 0, 0, 0 };
    static cilist io___37 = { 0, 6, 0, 0, 0 };
    static cilist io___42 = { 0, 6, 0, 0, 0 };
    static cilist io___44 = { 0, 6, 0, 0, 0 };
    static cilist io___45 = { 0, 6, 0, 0, 0 };
    static cilist io___46 = { 0, 6, 0, fmt_1002, 0 };
    static cilist io___48 = { 0, 6, 0, 0, 0 };
    static cilist io___53 = { 0, 6, 0, fmt_1001, 0 };
    static cilist io___58 = { 0, 6, 0, 0, 0 };
    static cilist io___59 = { 0, 6, 0, 0, 0 };
    static cilist io___60 = { 0, 6, 0, 0, 0 };
    static cilist io___61 = { 0, 6, 0, 0, 0 };
    static cilist io___62 = { 0, 6, 0, 0, 0 };
    static cilist io___64 = { 0, 6, 0, 0, 0 };
    static cilist io___66 = { 0, 6, 0, 0, 0 };
    static cilist io___67 = { 0, 6, 0, 0, 0 };
    static cilist io___68 = { 0, 6, 0, 0, 0 };
    static cilist io___69 = { 0, 6, 0, 0, 0 };
    static cilist io___70 = { 0, 6, 0, 0, 0 };
    static cilist io___72 = { 0, 6, 0, 0, 0 };



/* Minimization of a function of N variables with a polytope method, */
/* using only function values. */

/*   FMINSI - Fortran subroutines for unconstrained function minimization */
/*   Copyright (C) 1992, 2001  Hugo Pfoertner */

/*   This library is free software; you can redistribute it and/or */
/*   modify it under the terms of the GNU Lesser General Public */
/*   License as published by the Free Software Foundation; either */
/*   version 2.1 of the License, or (at your option) any later version. */

/*   This library is distributed in the hope that it will be useful, */
/*   but WITHOUT ANY WARRANTY; without even the implied warranty of */
/*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU */
/*   Lesser General Public License for more details. */

/*   You should have received a copy of the GNU Lesser General Public */
/*   License along with this library; if not, write to the Free Software */
/*   Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307 */
/*   USA */

/*   Contact info: mailto:hugo@pfoertner.org */
/*   or use the information provided at http://www.pfoertner.org/ */

/* Author: Hugo Pfoertner, Oberhaching, Germany */

/* Version History (German Language kept for authenticity ;-) */

/* 22.06.21 adapted fminsi for the mesh refinement procedure in CalculiX */
/*          Author: Guido Dhondt */
/* 21.05.05 Tentative doubleprecision version */
/* 03.06.01 Translation finished, additional comments added, LGPL */
/* 21.04.01 Start English translation of comments */
/* 30.11.92 KOMPLETTE KONTRAKTION NUR BEI VERSAGEN DES EINFACHEN */
/*          KONTRAKTIONSSCHRITTES */
/* 27.11.92 KLEINSTER STARTSCHRITT: RMULT * EPS(I) */
/* 16.11.92 MAXIMALE ITERATIONSZAHL = 400*N + N**3/2, */
/*          ABFRAGE FUER WAHL DES EXPANDIERTEN PUNKTES GEAENDERT, */
/*          MITTELPUNKTSBERECHNUNG UEBER AKTUALISIERUNG, REDUKTION DES */
/*          EXPANSIONSFAKTORS BEI MEHRFACHER ERFOLGLOSER EXPANSION. */
/* 16.01.91 BESCHRAENKUNG DER STARTSCHRITTEXPANSION AUF 10MAL */
/* 15.01.91 BEI STARTWERTSUCHE MITTELS RANSTA WIRD NUR NOCH */
/*          NACH VERAENDERTEM, NICHT MEHR NACH KLEINEREM F GESUCHT. */
/* 13.06.89 EPSI-BERECHNUNG MODIFIZIERT, VERSUCH EINER WIEDERHERSTELLUNG */
/*          DER VOM ANWENDER ANGEGEBENEN GENAUIGKEITSSCHRANKEN, */
/*          ZUSAETZLICHES KONVERGENZKRITERIUM : 3*(N+1) ERFOLGLOSE */
/*          KONTRAKTIONSVERSUCHE. */
/* 09.06.89 EXPANSIONSFAKTOR GAMMA = 1 + 3/N */
/* 28.10.87 ZUSAETZLICHE DIAGNOSEMELDUNGEN BEI GRADIENTENBERECHNUNG */
/*          FUER STARTSCHRITT */
/* 10.04.86 RANDOM-STARTWERTSUCHE UND DIAGNOSEMELDUNGEN */
/* 1982     DIVERSE ERGAENZUNGEN (BUCH GILL/MURRAY), */
/*          VERBESSERTE KONVERGENZKRITERIEN (EINFUEHRUNG EPSI) */
/* 1978     BASISVERSION (ORIGINAL NELDER/MEAD ALGORITHMUS) */

/* References: */
/* NELDER J.A., MEAD R.: A SIMPLEX METHOD FOR FUNCTION MINIMIZATION. */
/* COMPUTER JOURNAL 7, 308-313, 1965 */
/* GILL G.E., MURRAY W., WRIGHT M.H.: PRACTICAL OPTIMIZATION. */
/* ACADEMIC PRESS, LONDON, 1981 (S. 94-96) */
/* BARABINO G.P. ET AL : A STUDY ON THE PERFORMANCE OF SIMPLEX METHODS */
/* FOR FUNCTION MINIMIZATION. IN PROCEEDINGS OF THE IEEE INTERNATIONAL */
/* CONFERENCE ON CIRCUITS AND COMPUTERS ICCC80, IEEE, NEW YORK, 1980 */
/* (S. 1150-1153) */
/* SMITH J.D., HOLLOMAN M.E., OTTO W.E.: SIMMIN - A PROGRAM FOR */
/* MINIMIZING FUNCTIONS BY SIMPLEX METHODS FOR IBM PC. */
/* U.S. ARMY MISSILE COMMAND, REDSTONE ARSENAL, ALABAMA, DIRECTED */
/* ENERGY DIRECTORATE,  TECHNICAL REPORT RD-DE-87-4, JULY 1987 */

/* Description of parameters: */

/* N ... Number of variables. */
/*       Local dimensions currently require N <= 128 */
/* X(N) ... vector of variables. When calling FMINSI the user has to */
/*       provide the starting point of the minimization, i.e. an */
/*       assumed or previously determined estimate of the location */
/*       of a mimimum. */
/*       After completion of FMINSI X contains the best approximation */
/*       found for the loacation of a local minimum of the objective */
/*       function. */
/* FU(N,X) ... REAL FUNCTION, ojective function to be miminized, */
/*       need neither be differentiable nor steady. */
/*       FU has to declared as "EXTERNAL" in the calling program. */
/* EPS ... vector of desired absolute accuracy for the single components */
/*       of the result vector. The minimization is terminated, when the */
/*       change of all components of the variable vector drops below */
/*       the respective EPSI(I) in one optimization step. EPSI(I) is */
/*       derived from the input vector EPS(I) by applying some */
/*       plausibility checks to avoid using convergence limits not */
/*       attainable with single precision arithmetic. */
/* FMIN ... Lowest function value found at termination */
/* IER ... "Return code", when FMINSI is terminated regularly, i.e. if */
/*       a minimum has been found satisfying the convergence criterion, */
/*       IER=0 is set on return. */
/*       Situations returning IER>0: */
/*       IER=1: N greater than max allowable dimension NMAX */
/*       IER=2: No convergence reached within ITMAX (see below) steps. */
/*              X contains the best approximation to the location of */
/*              the minimum found when the iteration was terminated. */
/*       IER=3: Objective function constant in the vicinity of the start */
/*              location. Sometimes this situation is simply caused by */
/*              the programmers failure to assign a value to the */
/*              objective function */
/*  The input value of IER is used to activate a printout of an */
/*  execution trace to standard output using write (*,...) ... */
/*  For a full visibility of the execution flow it is advisable to */
/*  include printouts of the variable vector and of the computed */
/*  function value into the source of the objective function. */
/*  As FMINSI overwrites IER on exit, it is necessary to restore IER */
/*  to a negative value before calling FMINSI again, when trace output */
/*  is required for consecutive executions. */

/* Declaration of local variables (undeclared variables use the */
/* Fortran standard implicit type convention (I..N Integer), else Real */

/* FMINSI uses single precision reals, which I've found to be always */
/* sufficient within the optimization routine in 25 years of optimization */
/* experience, also with "industrial grade" problems. */
/* Double precision is usually only needed for some intermediate */
/* calculations within the objective functions. With the spreading use of */
/* 64 bit processors this problem gradually vanishes in the long term */



/* This limits the problem dimension, using the method for higher N */
/* requires a corresponding modification of NMAX. */
/* It is not recommended to use FMINSI for such high problem dimensions, */
/* mainly due to the inevitable progressive collapse of the search */
/* polytope during the iteration (currently there is no mechanism to */
/* restore the polytope to full rank other than restarting by a new call) */


/* The function name is also passed into the call sequence of */
/* subroutine RANSTA, therefore */
/* **** EXTERNAL FU (declaration already made above) */

/* Factors for shape adjustment of the search polytope */

    /* Parameter adjustments */
    --eps;
    --x;
    cotet -= 4;
    kontet -= 5;
    --ipoeln;
    ieln -= 3;
    --ipoeled;
    ieled -= 3;
    --iedgmid;
    iedtet -= 7;

    /* Function Body */

/* Some other real constants */


/* Activate printout of execution trace */
    test = *ier < 0;

/* Maximum number of iterations, found to be a good compromise except */
/* for really pathological problems */

/*      ITMAX = 400 * N  +  N**3 / 2 */
/* Computing 3rd power */
    i__1 = *n;
    itmax = *n * 1000 + (i__1 * (i__1 * i__1) << 1);

/* Check for admissible range of problem dimension */

    *ier = 0;
    if (test) {
	s_wsle(&io___14);
	do_lio(&c__9, &c__1, " START FMINSI, VERSION 1992/11/30", (ftnlen)33);
	e_wsle();
    }
    if (*n < 1) {
	s_wsfe(&io___15);
	do_fio(&c__1, (char *)&(*n), (ftnlen)sizeof(integer));
	e_wsfe();
	*ier = 1;
	goto L999;
    }

    if (*n > 216) {
	s_wsfe(&io___16);
	do_fio(&c__1, (char *)&(*n), (ftnlen)sizeof(integer));
	e_wsfe();
	*ier = 1;
	goto L999;
    }

/* Expansion factor variable and dependent on problem dimension: */
/* This is the most important enhancement of the original method. */
/* The idea is due to Barabino et al. (see references above), */
/* but they did not provide a method to determine the factor. */
/* The formula used here was found to be the best compromise in */
/* a parameter study performed in 1989 with quadratic problems for N up */
/* to 100, using random coefficients plus a modification of the diagonal */
/* elements to get a prescribed problem condition number. */

    gamma = gamm0 + gamm1 / (real) (*n);
    if (test) {
	s_wsle(&io___18);
	do_lio(&c__9, &c__1, " EXPANSION FACTOR GAMMA = ", (ftnlen)26);
	do_lio(&c__5, &c__1, (char *)&gamma, (ftnlen)sizeof(doublereal));
	e_wsle();
    }

/* Starting value of the expansion factor. The factor is dynamically */
/* adjusted. It is reduced if successive expansion steps fail. */
/* Following successul expansion steps it is restored. */

    gammd = gamma;

/* Number of vertices of the simplex */
    np = *n + 1;

/* Auxiliary value 1 / N */
    edn = 1.f / (real) (*n);

/* Initial choice of the method to determine average of simplex points */
    avgupd = FALSE_;

/* Check plausibility of user supplied absolute accuracy vector. */
/* Internally a (modified if necessary) vector EPSI is used. */

    modeps = FALSE_;
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
/* Computing MAX */
	d__3 = (d__2 = eps[i__], abs(d__2)), d__4 = (d__1 = x[i__], abs(d__1))
		 * 1e-8f;
	epsi[i__ - 1] = max(d__3,d__4);
	if (epsi[i__ - 1] < vsmall) {
/* Computing MAX */
	    d__2 = small, d__3 = (d__1 = x[i__] * small, abs(d__1));
	    epsi[i__ - 1] = max(d__2,d__3);
	}
	if (eps[i__] != epsi[i__ - 1]) {
	    modeps = TRUE_;
	}
/* L305: */
    }
    if (test && modeps) {
	s_wsle(&io___26);
	do_lio(&c__9, &c__1, " CONVERGENCE LIMITS MODIFIED", (ftnlen)28);
	e_wsle();
    }

/* Use a heuristic method to determine step sizes to compute */
/* an approximation of the gradient direction at the starting point */
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
/* Computing MAX */
	d__2 = (d__1 = x[i__], abs(d__1)) * 1e-5f, d__3 = epsi[i__ - 1];
	xav[i__ - 1] = max(d__2,d__3);
/* L306: */
    }
    if (test) {
	s_wsle(&io___28);
	do_lio(&c__9, &c__1, " STEP SIZE TO ESTIMATE GRADIENT : ", (ftnlen)34)
		;
	i__1 = *n;
	for (k = 1; k <= i__1; ++k) {
	    do_lio(&c__5, &c__1, (char *)&xav[k - 1], (ftnlen)sizeof(
		    doublereal));
	}
	e_wsle();
    }

/* Determine the possible expansion of an EPSI sized simplex */
/* by performing an approximate steepest descent step */

/* Difference approximation of -G at starting point, stored on XSTST */
    if (test) {
	s_wsle(&io___30);
	do_lio(&c__9, &c__1, " DIFFERENCE APPROXIMATION FOR -G :", (ftnlen)34)
		;
	e_wsle();
    }
    f0 = (*fu)(n, &x[1], &cotet[4], &kontet[5], &ipoeln[1], &ieln[3], node, 
	    iedge, &ipoeled[1], &ieled[3], &iedgmid[1], &iedtet[7]);
    if (test) {
	s_wsle(&io___32);
	do_lio(&c__9, &c__1, " FUNCTION VALUE AT STARTING POINT : ", (ftnlen)
		36);
	do_lio(&c__5, &c__1, (char *)&f0, (ftnlen)sizeof(doublereal));
	e_wsle();
    }
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	i__2 = *n;
	for (j = 1; j <= i__2; ++j) {
/* L320: */
	    xst[j - 1] = x[j];
	}
	xst[i__ - 1] += xav[i__ - 1];
	if (test) {
	    s_wsle(&io___35);
	    do_lio(&c__9, &c__1, " COMPONENT ", (ftnlen)11);
	    do_lio(&c__3, &c__1, (char *)&i__, (ftnlen)sizeof(integer));
	    do_lio(&c__9, &c__1, " X = ", (ftnlen)5);
	    i__2 = *n;
	    for (k = 1; k <= i__2; ++k) {
		do_lio(&c__5, &c__1, (char *)&xst[k - 1], (ftnlen)sizeof(
			doublereal));
	    }
	    e_wsle();
	}
	h__ = (*fu)(n, xst, &cotet[4], &kontet[5], &ipoeln[1], &ieln[3], node,
		 iedge, &ipoeled[1], &ieled[3], &iedgmid[1], &iedtet[7]);
	if (test) {
	    s_wsle(&io___37);
	    do_lio(&c__9, &c__1, " FUNCTION VALUE : ", (ftnlen)18);
	    do_lio(&c__5, &c__1, (char *)&h__, (ftnlen)sizeof(doublereal));
	    e_wsle();
	}
	f[i__ - 1] = xav[i__ - 1];

/* Determine positive or negative direction along co-ordinate axes */
/* changed 27.11.92, old version: */
/* ***  IF ( F0 .LT. H ) F(I) = -HALF*F(I) */
	if (f0 < h__) {
	    f[i__ - 1] = -f[i__ - 1];
	}
	xstst[i__ - 1] = (f0 - h__) / xav[i__ - 1];
/* L310: */
    }

/* Normalize G to the maximum norm of EPS */
    hg = zero;
    he = zero;
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
/* Computing MAX */
	d__2 = hg, d__3 = (d__1 = xstst[i__ - 1], abs(d__1));
	hg = max(d__2,d__3);
/* Computing MAX */
	d__1 = he, d__2 = xav[i__ - 1];
	he = max(d__1,d__2);
/* L330: */
    }

/* If the norm of the gradient is too small, i.e. the function */
/* is approximately constant in the vicinity of the user supplied */
/* starting point, then a random search with repeated increase */
/* of variance is tried around the starting point, with the aim */
/* of to get away from the flat region. */

    if (hg < vsmall) {
	if (test) {
	    s_wsle(&io___42);
	    do_lio(&c__9, &c__1, " RANDOM SEARCH FOR BETTER STARTING POINT", (
		    ftnlen)40);
	    e_wsle();
	}
	i__1 = *n;
	for (i__ = 1; i__ <= i__1; ++i__) {
/* L333: */
	    xav[i__ - 1] = x[i__];
	}

/* The search is performed by a separate subroutine RANSTA. */
/* It either returns a point with a different function value */
/* or IER=3 if the search failed. */

	ranstarefine_(n, xav, (D_fp)fu, epsi, &f1, ier, &cotet[4], &kontet[5],
		 &ipoeln[1], &ieln[3], node, iedge, &ipoeled[1], &ieled[3], &
		iedgmid[1], &iedtet[7]);
	if (*ier == 0) {
	    if (test) {
		s_wsle(&io___44);
		do_lio(&c__9, &c__1, " SEARCH FOR START POINT SUCCESSFUL, F1"
			" = ", (ftnlen)41);
		do_lio(&c__5, &c__1, (char *)&f1, (ftnlen)sizeof(doublereal));
		e_wsle();
	    }

/* Check for increase of F1 */

	    if (f1 > f0) {
		if (test) {
		    s_wsle(&io___45);
		    do_lio(&c__9, &c__1, " SEARCH DIRECTION REVERSED", (
			    ftnlen)26);
		    e_wsle();
		}
		i__1 = *n;
		for (i__ = 1; i__ <= i__1; ++i__) {
		    f[i__ - 1] = x[i__];
		    x[i__] = xav[i__ - 1];
		    xav[i__ - 1] = f[i__ - 1];
/* L336: */
		}
		h__ = f1;
		f1 = f0;
		f0 = h__;
	    }

/* Difference vector from starting point */

	    i__1 = *n;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		xstst[i__ - 1] = xav[i__ - 1] - x[i__];

/* Steps along the co-ordinate axes are  limited to a minimum */
/* size of EPSI(i) */

		if ((d__1 = xstst[i__ - 1], abs(d__1)) < epsi[i__ - 1]) {
		    f[i__ - 1] = d_sign(&epsi[i__ - 1], &xstst[i__ - 1]);
		} else {
		    f[i__ - 1] = xstst[i__ - 1];
		}
/* L337: */
	    }

/* Skip forward, if starting steps have been successfully determined */
/* by the random search (Label 345 approx 16 lines below) */

/* A short note on software quality: */
/* Sorry to all those software gurus for the GOTOs, but the roots */
/* of FMINSI date back to the mid seventies, using Fortran IV. */
/* You know "IF(I-J)10,20,10" .... */
/* At that time I didn't bother about maintainability of software. */
/* BTW, I have written Ada programs used in aircraft on-board systems, */
/* where software quality assurance would have sent me to hell for using */
/* only 5% of the control flow complexity of this program. */
/* I never tried to determine the McCabe of this code ;-) */

	    goto L345;
	}
	s_wsfe(&io___46);
	do_fio(&c__1, (char *)&f0, (ftnlen)sizeof(doublereal));
	e_wsfe();
	*fmin = f0;
	goto L999;
    }

    hg = he / hg;

    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
/* L340: */
	xstst[i__ - 1] *= hg;
    }

/* Label 345 is the target location, if the first search direction */
/* was the result of a random search */

L345:

/* Perform a quasi steepest descent step */
    start = one / rmult;
    j = 0;

/* Start of expansion loop */

L350:

/* Increase counter J for the number of expansion steps */

    ++j;
    start *= rmult;
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
/* L360: */
	x[i__] += start * xstst[i__ - 1];
    }
    f1 = (*fu)(n, &x[1], &cotet[4], &kontet[5], &ipoeln[1], &ieln[3], node, 
	    iedge, &ipoeled[1], &ieled[3], &iedgmid[1], &iedtet[7]);

/* Expansion is terminated after ISTMAX steps (skip downwards) */

    if (f1 > f0 || j > istmax) {
	goto L370;
    }

/* Size of starting step can be increased further */

    f0 = f1;

/* Skip back to the next expansion step */

    goto L350;

/* The point before the last one was the best */

L370:
    f[np - 1] = f0;

/* Restore the corresponding location */

    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
/* L380: */
	x[i__] -= start * xstst[i__ - 1];
    }
    h__ = rmult;
    start /= h__;

    start = max(start,rmult);

/* L390: */

    if (test) {
	s_wsle(&io___48);
	do_lio(&c__9, &c__1, " MULT=", (ftnlen)6);
	do_lio(&c__5, &c__1, (char *)&start, (ftnlen)sizeof(doublereal));
	do_lio(&c__9, &c__1, " EPSI:", (ftnlen)6);
	i__1 = *n;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    do_lio(&c__5, &c__1, (char *)&epsi[i__ - 1], (ftnlen)sizeof(
		    doublereal));
	}
	e_wsle();
    }

/* Create initial simplex, using the start expansion factor START */
/* and the co-ordinate step sizes stored in vector F */

    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	sim[i__ + np * 216 - 217] = x[i__];
/* L10: */
    }

    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	i__2 = *n;
	for (j = 1; j <= i__2; ++j) {
/* L25: */
	    sim[j + i__ * 216 - 217] = x[j];
	}
	sim[i__ + i__ * 216 - 217] += start * f[i__ - 1];
/* L20: */
    }

/* Compute function values at vertices of simplex */

    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
/* L30: */
	f[i__ - 1] = (*fu)(n, &sim[i__ * 216 - 216], &cotet[4], &kontet[5], &
		ipoeln[1], &ieln[3], node, iedge, &ipoeled[1], &ieled[3], &
		iedgmid[1], &iedtet[7]);
    }

/* Initialize iteration count L */

    l = 0;

/* Initialize no-success counters for expansion and contraction steps */

    nsucc = 0;
    noxsuc = 0;

/* Start of main iteration loop */
/* ============================ */

L35:

    ++l;

/* Test for termination due to exceeding the maximum iteration count */

    if (l > itmax) {
	*ier = 2;
	s_wsfe(&io___53);
	do_fio(&c__1, (char *)&l, (ftnlen)sizeof(integer));
	e_wsfe();

/* Copy best approximation to output and jump to exit */

	i__1 = *n;
	for (i__ = 1; i__ <= i__1; ++i__) {
/* L34: */
	    x[i__] = sim[i__ - 1];
	}
	*fmin = f[0];
	goto L999;
    }

/* Search for minimum and maximum function value */

/* L36: */
    ilo = 1;
    ihi = 1;
    flo = f[0];
    fhi = f[0];

    i__1 = np;
    for (i__ = 2; i__ <= i__1; ++i__) {
	if (f[i__ - 1] < flo) {
	    flo = f[i__ - 1];
	    ilo = i__;
	} else if (f[i__ - 1] > fhi) {
	    fhi = f[i__ - 1];
	    ihi = i__;
	}
/* L50: */
    }
    if (test) {
	s_wsle(&io___58);
	do_lio(&c__9, &c__1, " FLO=", (ftnlen)5);
	do_lio(&c__5, &c__1, (char *)&flo, (ftnlen)sizeof(doublereal));
	do_lio(&c__9, &c__1, " IHI=", (ftnlen)5);
	do_lio(&c__3, &c__1, (char *)&ihi, (ftnlen)sizeof(integer));
	do_lio(&c__9, &c__1, " FHI=", (ftnlen)5);
	do_lio(&c__5, &c__1, (char *)&fhi, (ftnlen)sizeof(doublereal));
	e_wsle();
    }

/* Convergence is assumed if function is constant within simplex */

    if (ilo == ihi) {
	i__1 = *n;
	for (i__ = 1; i__ <= i__1; ++i__) {
/* L55: */
	    x[i__] = sim[i__ + ilo * 216 - 217];
	}
	*fmin = f[ilo - 1];
	if (test) {
	    s_wsle(&io___59);
	    do_lio(&c__9, &c__1, " FUNCTION CONSTANT =", (ftnlen)20);
	    do_lio(&c__5, &c__1, (char *)&(*fmin), (ftnlen)sizeof(doublereal))
		    ;
	    e_wsle();
	}
	goto L999;
    }

/* Move point with highest function value to index NP */

    if (ilo == np) {
	ilo = ihi;
    }
    if (ihi != np) {
	i__1 = *n;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    h__ = sim[i__ + np * 216 - 217];
	    sim[i__ + np * 216 - 217] = sim[i__ + ihi * 216 - 217];
	    sim[i__ + ihi * 216 - 217] = h__;
/* L60: */
	}
	h__ = f[np - 1];
	f[np - 1] = fhi;
	f[ihi - 1] = h__;

/* Update location of center of gravity */
/* (recomputing has been found to be the most expensive loop for */
/* higher N in a performance analysis of the program) */

	if (avgupd) {
	    i__1 = *n;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		xav[i__ - 1] += edn * (sim[i__ + ihi * 216 - 217] - sim[i__ + 
			np * 216 - 217]);
/* L65: */
	    }
	}
    }

/* Move point with lowest function value to index 1 */

    if (ilo != 1) {
	i__1 = *n;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    h__ = sim[i__ - 1];
	    sim[i__ - 1] = sim[i__ + ilo * 216 - 217];
	    sim[i__ + ilo * 216 - 217] = h__;
/* L70: */
	}
	h__ = f[0];
	f[0] = flo;
	f[ilo - 1] = h__;
    }

/* Auxiliary convergence test */
/* (proposed by Smith et al., see references above) */
/* Check for many unsuccessful contraction steps */

    if (nsucc > np * 3) {
	if (test) {
	    s_wsle(&io___60);
	    do_lio(&c__9, &c__1, " STOPPED AFTER ", (ftnlen)15);
	    do_lio(&c__3, &c__1, (char *)&nsucc, (ftnlen)sizeof(integer));
	    do_lio(&c__9, &c__1, " FAILED CONTRACTION STEPS", (ftnlen)25);
	    e_wsle();
	}
	goto L712;
    }

/* Target label for repeating the convergence test, if the */
/* user supplied EPS has been modified during the initial */
/* plausibility check. */

L701:

/* Test for convergence: Assume convergence, if all components */
/* of the difference vector between the maximum and minimum points */
/* of the simplex have an absolute value less than EPSI(i) */

    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	if ((d__1 = sim[i__ + np * 216 - 217] - sim[i__ - 1], abs(d__1)) > 
		epsi[i__ - 1]) {
	    goto L75;
	}
/* L71: */
    }

/* Check if the convergence test was passed against modified limits */

    if (modeps) {

/* Try to restore user supplied limits, unless too demanding */
/* for single precision arithmetic */

	i__1 = *n;
	for (i__ = 1; i__ <= i__1; ++i__) {
/* Computing MAX */
	    d__3 = (d__2 = eps[i__], abs(d__2)), d__4 = (d__1 = sim[i__ - 1], 
		    abs(d__1)) * 1e-5f;
	    epsi[i__ - 1] = max(d__3,d__4);
/* L711: */
	}
	modeps = FALSE_;
	if (test) {
	    s_wsle(&io___61);
	    do_lio(&c__9, &c__1, " CONVERGENCE LIMITS RESTORED", (ftnlen)28);
	    e_wsle();
	}
	goto L701;
    }

/* Target label after exceeding NSUCC */

L712:

/* Convergence reached */

    if (test) {
	s_wsle(&io___62);
	do_lio(&c__9, &c__1, " CONVERGENCE ACHIEVED, FMIN=", (ftnlen)28);
	do_lio(&c__5, &c__1, (char *)&f[0], (ftnlen)sizeof(doublereal));
	e_wsle();
    }
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
/* L72: */
	x[i__] = sim[i__ - 1];
    }
    *fmin = f[0];
    goto L999;

L75:

/* Compute the center of gravity of all points, but */
/* omitting the point with the highest function value. */
/* Normally this is done by an update formula, but after */
/* a contraction of the whole simplex it is necessary to */
/* recompute the whole sum. */

    if (! avgupd) {

	i__1 = *n;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    h__ = zero;
	    i__2 = *n;
	    for (j = 1; j <= i__2; ++j) {
/* L85: */
		h__ += sim[i__ + j * 216 - 217];
	    }
	    xav[i__ - 1] = h__ * edn;
/* L80: */
	}

/* Reset state to "use update formula" */
	avgupd = TRUE_;
    }

/* Reflexion: Reverse the principal search direction */

    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
/* L90: */
	xst[i__ - 1] = (one + alpha) * xav[i__ - 1] - alpha * sim[i__ + np * 
		216 - 217];
    }
    fst = (*fu)(n, xst, &cotet[4], &kontet[5], &ipoeln[1], &ieln[3], node, 
	    iedge, &ipoeled[1], &ieled[3], &iedgmid[1], &iedtet[7]);

/* Check if the reflected point is a new minimum (skip forward) */

    if (fst >= flo) {
	goto L110;
    }

/* Reset counter for unsuccessful contractions */

    nsucc = 0;
    if (test) {
	s_wsle(&io___64);
	do_lio(&c__9, &c__1, " REFLEXION SUCCESSFUL, FST =", (ftnlen)28);
	do_lio(&c__5, &c__1, (char *)&fst, (ftnlen)sizeof(doublereal));
	e_wsle();
    }

/* Try an expansion into the direction of the reflected point */

    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
/* L120: */
	xstst[i__ - 1] = (one - gammd) * xav[i__ - 1] + gammd * xst[i__ - 1];
    }
    fstst = (*fu)(n, xstst, &cotet[4], &kontet[5], &ipoeln[1], &ieln[3], node,
	     iedge, &ipoeled[1], &ieled[3], &iedgmid[1], &iedtet[7]);

/* Changed 16.11.92 : Result of expansion is compared against */
/* result of reflexion and not against minimum */
/* Instead of:  IF ( FSTST .GE. FLO ) THEN */
/* New: */
    if (fstst > fst) {

/* Increase counter for unsuccessful expansions */

	++noxsuc;
	if (noxsuc > *n) {

/* Reduce expansion factor */

	    gammd = half * (gamm0 + gammd);
	    if (test) {
		s_wsle(&io___66);
		do_lio(&c__9, &c__1, " EXPANSION FACTOR REDUCED TO ", (ftnlen)
			29);
		do_lio(&c__5, &c__1, (char *)&gammd, (ftnlen)sizeof(
			doublereal));
		e_wsle();
	    }
	}
/* Skip forward */
	goto L140;
    }

/* A new minimum was found by the expansion step */

    if (test) {
	s_wsle(&io___67);
	do_lio(&c__9, &c__1, " EXPANSION SUCCESSFUL, FSTST =", (ftnlen)30);
	do_lio(&c__5, &c__1, (char *)&fstst, (ftnlen)sizeof(doublereal));
	e_wsle();
    }

/* Reset all non-success counters */

    nsucc = 0;
    noxsuc = 0;

/* Restore expansion factor to the (dimension dependent) */
/* default value */

    gammd = gamma;

/* Target label after successful contraction */

L130:

    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
/* L150: */
	sim[i__ + np * 216 - 217] = xstst[i__ - 1];
    }
    f[np - 1] = fstst;

/* Jump back to the next iteration step */
/* ==================================== */

    goto L35;

/* Reflexion did not find a new minimum */

L110:

/* Check if reflexion result is at least better than one of the */
/* remaining points */

    i__1 = *n;
    for (i__ = 2; i__ <= i__1; ++i__) {
	if (fst < f[i__ - 1]) {
	    goto L140;
	}
/* L170: */
    }

/* Reflected point does not lead to an exchange of maximum */

    goto L171;

/* Target label, if the reflexion result can be used to replace */
/* the worst point */

L140:

/* Replace worst point by XST */

    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
/* L220: */
	sim[i__ + np * 216 - 217] = xst[i__ - 1];
    }
    f[np - 1] = fst;
/* Reset counter for unsuccessful contractions */
    nsucc = 0;

/* Skip back to next iteration step */
/* ================================ */

    goto L35;

/* Target label, if reflected point did not lead to an exchange */
/* of the worst point */

L171:

/* Check if reflected point is at least better than the previous */
/* maximum */

    if (fst < fhi) {
	i__1 = *n;
	for (i__ = 1; i__ <= i__1; ++i__) {
/* L173: */
	    sim[i__ + np * 216 - 217] = xst[i__ - 1];
	}
	f[np - 1] = fst;
	fhi = fst;
    }

/* Reflected point could not replace maximum. */
/* Try to contract point with highest F towards center of gravity. */

    if (test) {
	s_wsle(&io___68);
	do_lio(&c__9, &c__1, " CONTRACTION TOWARDS CENTER", (ftnlen)27);
	e_wsle();
    }
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
/* L180: */
	xstst[i__ - 1] = beta * sim[i__ + np * 216 - 217] + (one - beta) * 
		xav[i__ - 1];
    }
    fstst = (*fu)(n, xstst, &cotet[4], &kontet[5], &ipoeln[1], &ieln[3], node,
	     iedge, &ipoeled[1], &ieled[3], &iedgmid[1], &iedtet[7]);
/* Changed 30.11.92, Instead of : */
/* ***  IF ( FSTST .LT. FHI .AND. FSTST .GT. FLO ) GOTO 130 */
    if (fstst < flo) {

/* Contracted point is new minimum */

	if (test) {
	    s_wsle(&io___69);
	    do_lio(&c__9, &c__1, " NEW MINIMUM FOUND BY CONTRACTION:", (
		    ftnlen)34);
	    do_lio(&c__5, &c__1, (char *)&fstst, (ftnlen)sizeof(doublereal));
	    e_wsle();
	}
	nsucc = 0;
    } else {

/* Increase counter for unsucessful contractions */

	++nsucc;
    }

/* Check if contracted point is better than maximum (go up) */

    if (fstst < fhi) {
	goto L130;
    }

/* After an unsuccessful contraction all points of */
/* the simplex are contracted towards the minimum. */
/* Set flag indicating the need for a full recomputation */
/* of the center of gravity in the next step */

    avgupd = FALSE_;

    if (test) {
	s_wsle(&io___70);
	do_lio(&c__9, &c__1, " SIMPLEX CONTRACTED", (ftnlen)19);
	e_wsle();
    }

    imin = 1;

    i__1 = np;
    for (i__ = 2; i__ <= i__1; ++i__) {
	i__2 = *n;
	for (j = 1; j <= i__2; ++j) {
/* L200: */
	    sim[j + i__ * 216 - 217] = half * (sim[j + i__ * 216 - 217] + sim[
		    j + imin * 216 - 217]);
	}
	f[i__ - 1] = (*fu)(n, &sim[i__ * 216 - 216], &cotet[4], &kontet[5], &
		ipoeln[1], &ieln[3], node, iedge, &ipoeled[1], &ieled[3], &
		iedgmid[1], &iedtet[7]);

/* Check if contracted point is a new minimum, */
/* the remaining points will be moved towards the new target */

	if (f[i__ - 1] < flo) {
	    nsucc = 0;
	    if (test) {
		s_wsle(&io___72);
		do_lio(&c__9, &c__1, " MINIMUM EXCHANGED, I=", (ftnlen)22);
		do_lio(&c__3, &c__1, (char *)&i__, (ftnlen)sizeof(integer));
		do_lio(&c__9, &c__1, " F=", (ftnlen)3);
		do_lio(&c__5, &c__1, (char *)&f[i__ - 1], (ftnlen)sizeof(
			doublereal));
		e_wsle();
	    }
	    flo = f[i__ - 1];
	    imin = i__;
	}

/* L190: */
    }

/* Skip back to next iteration step */
/* ================================ */

    goto L35;

/* End of main iteration loop */

L999:
    return 0;

/* End of subroutine FMINSI */

} /* fminsirefine_ */

