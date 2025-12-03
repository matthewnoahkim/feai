/* buckles.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int buckles_(char *inpc, char *textpart, integer *nmethod, 
	integer *mei, doublereal *fei, integer *nforc, integer *nload, 
	integer *ithermal, integer *iprestr, integer *nbody, doublereal *t0, 
	doublereal *t1, integer *nk, integer *iperturb, integer *istep, 
	integer *istat, integer *n, integer *iline, integer *ipol, integer *
	inl, integer *ipoinp, integer *inp, integer *isolver, integer *
	ipoinpc, integer *ier, ftnlen inpc_len, ftnlen textpart_len)
{
    /* System generated locals */
    integer i__1;
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
    extern /* Subroutine */ int getnewline_(char *, char *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *, ftnlen, ftnlen), inputerror_(char *, 
	    integer *, integer *, char *, integer *, ftnlen, ftnlen);
    integer ncv, key, nev;
    doublereal tol;
    extern /* Subroutine */ int inputwarning_(char *, integer *, integer *, 
	    char *, ftnlen, ftnlen);
    integer mxiter;
    char solver[20];

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 6, 0, 0, 0 };
    static cilist io___2 = { 0, 6, 0, 0, 0 };
    static cilist io___5 = { 0, 6, 0, 0, 0 };
    static cilist io___6 = { 0, 6, 0, 0, 0 };
    static cilist io___7 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___10 = { 0, 6, 0, 0, 0 };
    static cilist io___11 = { 0, 6, 0, 0, 0 };
    static cilist io___12 = { 0, 6, 0, 0, 0 };
    static cilist io___13 = { 0, 6, 0, 0, 0 };
    static cilist io___14 = { 0, 6, 0, 0, 0 };
    static cilist io___15 = { 0, 6, 0, 0, 0 };
    static cilist io___16 = { 0, 6, 0, 0, 0 };
    static cilist io___18 = { 0, 6, 0, 0, 0 };
    static cilist io___19 = { 0, 6, 0, 0, 0 };
    static cilist io___21 = { 0, 6, 0, 0, 0 };



/*     reading the input deck: *BUCKLE */





    /* Parameter adjustments */
    inp -= 4;
    ipoinp -= 3;
    --iperturb;
    --t1;
    --t0;
    --ithermal;
    --fei;
    --mei;
    textpart -= 132;
    --inpc;

    /* Function Body */
    if (*istep < 1) {
	s_wsle(&io___1);
	do_lio(&c__9, &c__1, "*ERROR reading *BUCKLE: *BUCKLE can only be us"
		"ed", (ftnlen)48);
	e_wsle();
	s_wsle(&io___2);
	do_lio(&c__9, &c__1, "  within a STEP", (ftnlen)15);
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
	} else {
	    s_wsle(&io___5);
	    do_lio(&c__9, &c__1, "*WARNING reading *BUCKLE: parameter not re"
		    "cognized:", (ftnlen)51);
	    e_wsle();
	    s_wsle(&io___6);
	    do_lio(&c__9, &c__1, "         ", (ftnlen)9);
	    do_lio(&c__9, &c__1, textpart + i__ * 132, i_indx(textpart + i__ *
		     132, " ", (ftnlen)132, (ftnlen)1) - 1);
	    e_wsle();
	    inputwarning_(inpc + 1, ipoinpc, iline, "*BUCKLE%", (ftnlen)1, (
		    ftnlen)8);
	}
    }

    if (s_cmp(solver, "SPOOLES", (ftnlen)7, (ftnlen)7) == 0) {
	*isolver = 0;
    } else if (s_cmp(solver, "ITERATIVESCALING", (ftnlen)16, (ftnlen)16) == 0)
	     {
	s_wsle(&io___7);
	do_lio(&c__9, &c__1, "*WARNING in frequencies: the iterative scaling",
		 (ftnlen)46);
	e_wsle();
	s_wsle(&io___8);
	do_lio(&c__9, &c__1, "         procedure is not available for buckli"
		"ng", (ftnlen)48);
	e_wsle();
	s_wsle(&io___9);
	do_lio(&c__9, &c__1, "         calculations; the default solver is u"
		"sed", (ftnlen)49);
	e_wsle();
    } else if (s_cmp(solver, "ITERATIVECHOLESKY", (ftnlen)17, (ftnlen)17) == 
	    0) {
	s_wsle(&io___10);
	do_lio(&c__9, &c__1, "*WARNING in frequencies: the iterative scaling",
		 (ftnlen)46);
	e_wsle();
	s_wsle(&io___11);
	do_lio(&c__9, &c__1, "         procedure is not available for buckli"
		"ng", (ftnlen)48);
	e_wsle();
	s_wsle(&io___12);
	do_lio(&c__9, &c__1, "         calculations; the default solver is u"
		"sed", (ftnlen)49);
	e_wsle();
    } else if (s_cmp(solver, "SGI", (ftnlen)3, (ftnlen)3) == 0) {
	*isolver = 4;
    } else if (s_cmp(solver, "TAUCS", (ftnlen)5, (ftnlen)5) == 0) {
	*isolver = 5;
    } else if (s_cmp(solver, "MATRIXSTORAGE", (ftnlen)13, (ftnlen)13) == 0) {
	*isolver += 10;
    } else if (s_cmp(solver, "PARDISO", (ftnlen)7, (ftnlen)7) == 0) {
	*isolver = 7;
    } else if (s_cmp(solver, "PASTIX", (ftnlen)6, (ftnlen)6) == 0) {
	*isolver = 8;
    } else {
	s_wsle(&io___13);
	do_lio(&c__9, &c__1, "*WARNING reading *BUCKLE: unknown solver;", (
		ftnlen)41);
	e_wsle();
	s_wsle(&io___14);
	do_lio(&c__9, &c__1, "         the default solver is used", (ftnlen)
		35);
	e_wsle();
    }

    if (*isolver == 2 || *isolver == 3) {
	s_wsle(&io___15);
	do_lio(&c__9, &c__1, "*ERROR reading *BUCKLE: the default solver ", (
		ftnlen)43);
	do_lio(&c__9, &c__1, solver, (ftnlen)20);
	e_wsle();
	s_wsle(&io___16);
	do_lio(&c__9, &c__1, "       cannot be used for buckling calculation"
		"s ", (ftnlen)48);
	e_wsle();
	*ier = 1;
	return 0;
    }

    *nmethod = 3;
    if (iperturb[1] > 1) {
	iperturb[1] = 0;
    }
    iperturb[2] = 0;

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);
    if (*istat < 0 || key == 1) {
	s_wsle(&io___18);
	do_lio(&c__9, &c__1, "*ERROR reading *BUCKLE: definition not complete"
		, (ftnlen)47);
	e_wsle();
	s_wsle(&io___19);
	do_lio(&c__9, &c__1, "  ", (ftnlen)2);
	e_wsle();
	inputerror_(inpc + 1, ipoinpc, iline, "*BUCKLE%", ier, (ftnlen)1, (
		ftnlen)8);
	return 0;
    }
    ici__1.icierr = 1;
    ici__1.iciend = 1;
    ici__1.icirnum = 1;
    ici__1.icirlen = 10;
    ici__1.iciunit = textpart + 132;
    ici__1.icifmt = "(i10)";
    *istat = s_rsfi(&ici__1);
    if (*istat != 0) {
	goto L100001;
    }
    *istat = do_fio(&c__1, (char *)&nev, (ftnlen)sizeof(integer));
    if (*istat != 0) {
	goto L100001;
    }
    *istat = e_rsfi();
L100001:
    if (*istat > 0) {
	inputerror_(inpc + 1, ipoinpc, iline, "*BUCKLE%", ier, (ftnlen)1, (
		ftnlen)8);
	return 0;
    }
    if (nev <= 0) {
	s_wsle(&io___21);
	do_lio(&c__9, &c__1, "*ERROR reading *BUCKLE: less than 1 eigenvalue"
		" req uested", (ftnlen)57);
	e_wsle();
	*ier = 1;
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
	goto L100002;
    }
    *istat = do_fio(&c__1, (char *)&tol, (ftnlen)sizeof(doublereal));
    if (*istat != 0) {
	goto L100002;
    }
    *istat = e_rsfi();
L100002:
    if (*istat > 0) {
	inputerror_(inpc + 1, ipoinpc, iline, "*BUCKLE%", ier, (ftnlen)1, (
		ftnlen)8);
	return 0;
    }
    if (tol <= 0.) {
	tol = .01;
    }
    ici__1.icierr = 1;
    ici__1.iciend = 1;
    ici__1.icirnum = 1;
    ici__1.icirlen = 10;
    ici__1.iciunit = textpart + 396;
    ici__1.icifmt = "(i10)";
    *istat = s_rsfi(&ici__1);
    if (*istat != 0) {
	goto L100003;
    }
    *istat = do_fio(&c__1, (char *)&ncv, (ftnlen)sizeof(integer));
    if (*istat != 0) {
	goto L100003;
    }
    *istat = e_rsfi();
L100003:
    if (*istat > 0) {
	inputerror_(inpc + 1, ipoinpc, iline, "*BUCKLE%", ier, (ftnlen)1, (
		ftnlen)8);
	return 0;
    }
    if (ncv <= 0) {
	ncv = nev << 2;
    }
    ncv += nev;
    ici__1.icierr = 1;
    ici__1.iciend = 1;
    ici__1.icirnum = 1;
    ici__1.icirlen = 10;
    ici__1.iciunit = textpart + 528;
    ici__1.icifmt = "(i10)";
    *istat = s_rsfi(&ici__1);
    if (*istat != 0) {
	goto L100004;
    }
    *istat = do_fio(&c__1, (char *)&mxiter, (ftnlen)sizeof(integer));
    if (*istat != 0) {
	goto L100004;
    }
    *istat = e_rsfi();
L100004:
    if (*istat > 0) {
	inputerror_(inpc + 1, ipoinpc, iline, "*BUCKLE%", ier, (ftnlen)1, (
		ftnlen)8);
	return 0;
    }
    if (mxiter <= 0) {
	mxiter = 1000;
    }

/*     removing the natural boundary conditions */

    *nforc = 0;
    *nload = 0;
    *nbody = 0;
    *iprestr = 0;
    if (ithermal[1] == 1) {
	i__1 = *nk;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    t1[i__] = t0[i__];
	}
    }

    mei[1] = nev;
    mei[2] = ncv;
    mei[3] = mxiter;
    fei[1] = tol;

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

    return 0;
} /* buckles_ */

