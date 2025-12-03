/* selectcyclicsymmetrymodess.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int selectcyclicsymmetrymodess_(char *inpc, char *textpart, 
	doublereal *cs, integer *ics, char *tieset, integer *istartset, 
	integer *iendset, integer *ialset, integer *ipompc, integer *nodempc, 
	doublereal *coefmpc, integer *nmpc, integer *nmpc___, integer *ikmpc, 
	integer *ilmpc, integer *mpcfree, integer *mcs, char *set, integer *
	nset, char *labmpc, integer *istep, integer *istat, integer *n, 
	integer *iline, integer *ipol, integer *inl, integer *ipoinp, integer 
	*inp, integer *nmethod, integer *key, integer *ipoinpc, integer *ier, 
	ftnlen inpc_len, ftnlen textpart_len, ftnlen tieset_len, ftnlen 
	set_len, ftnlen labmpc_len)
{
    /* Initialized data */

    static integer irepeat = 0;

    /* System generated locals */
    integer i__1, i__2, i__3;
    icilist ici__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void), s_cmp(char *, char *, ftnlen, ftnlen), s_rsfi(
	    icilist *), do_fio(integer *, char *, ftnlen), e_rsfi(void), 
	    i_indx(char *, char *, ftnlen, ftnlen);
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);
    double sqrt(doublereal);

    /* Local variables */
    integer i__, j, k, i1[2], i2[2], i3, i4, i5;
    doublereal x1[2], x2[2], x3, x4, x5, dd;
    integer id, ij, ns[5];
    doublereal xn, yn, zn;
    integer mpcfreeold;
    extern /* Subroutine */ int getnewline_(char *, char *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *, ftnlen, ftnlen), inputerror_(char *, 
	    integer *, integer *, char *, integer *, ftnlen, ftnlen);
    integer mpc;
    doublereal csab[7];
    integer idof, node;
    extern /* Subroutine */ int inputwarning_(char *, integer *, integer *, 
	    char *, ftnlen, ftnlen);
    integer ileft, lprev;
    extern /* Subroutine */ int nident_(integer *, integer *, integer *, 
	    integer *), mpcrem_(integer *, integer *, integer *, integer *, 
	    integer *, integer *, char *, doublereal *, integer *, ftnlen), 
	    cident81_(char *, char *, integer *, integer *, ftnlen, ftnlen);
    char leftset[81];

    /* Fortran I/O blocks */
    static cilist io___2 = { 0, 6, 0, 0, 0 };
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___4 = { 0, 6, 0, 0, 0 };
    static cilist io___5 = { 0, 6, 0, 0, 0 };
    static cilist io___6 = { 0, 6, 0, 0, 0 };
    static cilist io___7 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___12 = { 0, 6, 0, 0, 0 };
    static cilist io___13 = { 0, 6, 0, 0, 0 };
    static cilist io___14 = { 0, 6, 0, 0, 0 };
    static cilist io___15 = { 0, 6, 0, 0, 0 };
    static cilist io___16 = { 0, 6, 0, 0, 0 };
    static cilist io___17 = { 0, 6, 0, 0, 0 };
    static cilist io___18 = { 0, 6, 0, 0, 0 };
    static cilist io___19 = { 0, 6, 0, 0, 0 };
    static cilist io___20 = { 0, 6, 0, 0, 0 };
    static cilist io___31 = { 0, 6, 0, 0, 0 };
    static cilist io___32 = { 0, 6, 0, 0, 0 };
    static cilist io___33 = { 0, 6, 0, 0, 0 };
    static cilist io___34 = { 0, 6, 0, 0, 0 };
    static cilist io___35 = { 0, 6, 0, 0, 0 };
    static cilist io___44 = { 0, 6, 0, 0, 0 };
    static cilist io___45 = { 0, 6, 0, 0, 0 };
    static cilist io___46 = { 0, 6, 0, 0, 0 };
    static cilist io___48 = { 0, 6, 0, 0, 0 };
    static cilist io___49 = { 0, 6, 0, 0, 0 };
    static cilist io___51 = { 0, 6, 0, 0, 0 };
    static cilist io___52 = { 0, 6, 0, 0, 0 };
    static cilist io___59 = { 0, 6, 0, 0, 0 };
    static cilist io___60 = { 0, 6, 0, 0, 0 };
    static cilist io___61 = { 0, 6, 0, 0, 0 };
    static cilist io___62 = { 0, 6, 0, 0, 0 };
    static cilist io___63 = { 0, 6, 0, 0, 0 };
    static cilist io___64 = { 0, 6, 0, 0, 0 };
    static cilist io___65 = { 0, 6, 0, 0, 0 };
    static cilist io___66 = { 0, 6, 0, 0, 0 };
    static cilist io___67 = { 0, 6, 0, 0, 0 };
    static cilist io___68 = { 0, 6, 0, 0, 0 };
    static cilist io___69 = { 0, 6, 0, 0, 0 };
    static cilist io___70 = { 0, 6, 0, 0, 0 };
    static cilist io___71 = { 0, 6, 0, 0, 0 };
    static cilist io___72 = { 0, 6, 0, 0, 0 };



/*     reading the input deck: *SELECT CYCLIC SYMMETRY MODES */





/*     irepeat indicates whether the step was preceded by another */
/*     cyclic symmetry step (irepeat=1) or not (irepeat=0) */

    /* Parameter adjustments */
    inp -= 4;
    ipoinp -= 3;
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
    textpart -= 132;
    --inpc;

    /* Function Body */

    if (*istep == 0) {
	s_wsle(&io___2);
	do_lio(&c__9, &c__1, "*ERROR reading *SELECT CYCLIC SYMMETRY MODES:", 
		(ftnlen)45);
	e_wsle();
	s_wsle(&io___3);
	do_lio(&c__9, &c__1, "       *SELECT CYCLIC SYMMETRY MODES", (ftnlen)
		36);
	e_wsle();
	s_wsle(&io___4);
	do_lio(&c__9, &c__1, "       should be placed within a step definiti"
		"on", (ftnlen)48);
	e_wsle();
	*ier = 1;
	return 0;
    }

/*     check whether in case of cyclic symmetry the frequency procedure */
/*     is chosen */

    if (*nmethod != 2 && *nmethod != 13) {
	s_wsle(&io___5);
	do_lio(&c__9, &c__1, "*ERROR reading *SELECT CYCLIC SYMMETRY MODES:", 
		(ftnlen)45);
	e_wsle();
	s_wsle(&io___6);
	do_lio(&c__9, &c__1, "       the only valid procedures", (ftnlen)32);
	e_wsle();
	s_wsle(&io___7);
	do_lio(&c__9, &c__1, "       for cyclic symmetry calculations", (
		ftnlen)39);
	e_wsle();
	s_wsle(&io___8);
	do_lio(&c__9, &c__1, "       with nodal diameters are *FREQUENCY", (
		ftnlen)42);
	e_wsle();
	s_wsle(&io___9);
	do_lio(&c__9, &c__1, "       and *GREEN", (ftnlen)17);
	e_wsle();
	*ier = 1;
	return 0;
    }

    ns[1] = 0;
    ns[2] = 0;

    i__1 = *n;
    for (i__ = 2; i__ <= i__1; ++i__) {
	if (s_cmp(textpart + i__ * 132, "NMIN=", (ftnlen)5, (ftnlen)5) == 0) {
	    ici__1.icierr = 1;
	    ici__1.iciend = 1;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 10;
	    ici__1.iciunit = textpart + (i__ * 132 + 5);
	    ici__1.icifmt = "(i10)";
	    *istat = s_rsfi(&ici__1);
	    if (*istat != 0) {
		goto L100001;
	    }
	    *istat = do_fio(&c__1, (char *)&ns[1], (ftnlen)sizeof(integer));
	    if (*istat != 0) {
		goto L100001;
	    }
	    *istat = e_rsfi();
L100001:
	    if (*istat > 0) {
		inputerror_(inpc + 1, ipoinpc, iline, "*SELECT CYCLIC SYMMET"
			"RY MODES%", ier, (ftnlen)1, (ftnlen)30);
		return 0;
	    }
	} else if (s_cmp(textpart + i__ * 132, "NMAX=", (ftnlen)5, (ftnlen)5) 
		== 0) {
	    ici__1.icierr = 1;
	    ici__1.iciend = 1;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 10;
	    ici__1.iciunit = textpart + (i__ * 132 + 5);
	    ici__1.icifmt = "(i10)";
	    *istat = s_rsfi(&ici__1);
	    if (*istat != 0) {
		goto L100002;
	    }
	    *istat = do_fio(&c__1, (char *)&ns[2], (ftnlen)sizeof(integer));
	    if (*istat != 0) {
		goto L100002;
	    }
	    *istat = e_rsfi();
L100002:
	    if (*istat > 0) {
		inputerror_(inpc + 1, ipoinpc, iline, "*SELECT CYCLIC SYMMET"
			"RY MODES%", ier, (ftnlen)1, (ftnlen)30);
		return 0;
	    }
	} else {
	    s_wsle(&io___12);
	    do_lio(&c__9, &c__1, "*WARNING reading *SELECT CYCLIC SYMMETRY M"
		    "ODES:", (ftnlen)47);
	    e_wsle();
	    s_wsle(&io___13);
	    do_lio(&c__9, &c__1, "         parameter not recognized:", (
		    ftnlen)34);
	    e_wsle();
	    s_wsle(&io___14);
	    do_lio(&c__9, &c__1, "         ", (ftnlen)9);
	    do_lio(&c__9, &c__1, textpart + i__ * 132, i_indx(textpart + i__ *
		     132, " ", (ftnlen)132, (ftnlen)1) - 1);
	    e_wsle();
	    inputwarning_(inpc + 1, ipoinpc, iline, "*SELECT CYCLIC SYMMETRY"
		    " MODES%", (ftnlen)1, (ftnlen)30);
	}
    }

/*     check the input */

    if (ns[1] < 0) {
	ns[1] = 0;
	s_wsle(&io___15);
	do_lio(&c__9, &c__1, "*WARNING reading *SELECT CYCLIC SYMMETRY MODES:"
		, (ftnlen)47);
	e_wsle();
	s_wsle(&io___16);
	do_lio(&c__9, &c__1, "         minimum nodal", (ftnlen)22);
	e_wsle();
	s_wsle(&io___17);
	do_lio(&c__9, &c__1, "         diameter must be nonnegative", (ftnlen)
		37);
	e_wsle();
    }
    if (ns[2] < ns[1]) {
	s_wsle(&io___18);
	do_lio(&c__9, &c__1, "*ERROR reading *SELECT CYCLIC SYMMETRY MODES:", 
		(ftnlen)45);
	e_wsle();
	s_wsle(&io___19);
	do_lio(&c__9, &c__1, "       maximum nodal", (ftnlen)20);
	e_wsle();
	s_wsle(&io___20);
	do_lio(&c__9, &c__1, "       diameter should not exceed minimal one", 
		(ftnlen)45);
	e_wsle();
	*ier = 1;
	return 0;
    }

/*     loop over all cyclic symmetry parts */

    i__1 = *mcs;
    for (ij = 1; ij <= i__1; ++ij) {
	ns[0] = (integer) cs[ij * 17 + 1];
	ns[3] = (integer) cs[ij * 17 + 4];
	s_copy(leftset, tieset + ((integer) cs[ij * 17 + 17] * 3 + 2) * 81, (
		ftnlen)81, (ftnlen)81);
	lprev = (integer) cs[ij * 17 + 14];
	for (i__ = 1; i__ <= 7; ++i__) {
	    csab[i__ - 1] = cs[i__ + 5 + ij * 17];
	}

/*     check whether cyclic symmetry axis is part of the structure */

/*         do i=1,nset */
/*            if(set(i).eq.leftset) exit */
/*         enddo */
/*         ileft=i */
	cident81_(set + 81, leftset, nset, &id, (ftnlen)81, (ftnlen)81);
	ileft = *nset + 1;
	if (id > 0) {
	    if (s_cmp(leftset, set + id * 81, (ftnlen)81, (ftnlen)81) == 0) {
		ileft = id;
	    }
	}

/*     if this step was preceded by a cyclic symmetry step: */
/*     check for MPC's for nodes on the cyclic symmetry axis */
/*     and delete them */

	if (irepeat == 1) {
	    i__2 = ns[3];
	    for (i__ = 1; i__ <= i__2; ++i__) {
		node = ics[lprev + i__];
		if (node < 0) {
		    node = -node;
		    for (k = 1; k <= 3; ++k) {
			idof = (node - 1 << 3) + k;
			nident_(&ikmpc[1], &idof, nmpc, &id);
			if (id > 0) {
			    if (ikmpc[id] == idof) {
/*                           write(*,*) 'removing MPC',node,k */
				mpc = ilmpc[id];
				mpcrem_(&mpc, mpcfree, &nodempc[4], nmpc, &
					ikmpc[1], &ilmpc[1], labmpc + 20, &
					coefmpc[1], &ipompc[1], (ftnlen)20);
			    }
			}
		    }
		}
	    }
	}

	i__2 = ns[3];
	for (i__ = 1; i__ <= i__2; ++i__) {
	    node = ics[lprev + i__];
	    if (node < 0) {
		node = -node;
		if (ns[1] != ns[2]) {
		    if (ns[1] == 0 || ns[1] == 1) {
			s_wsle(&io___31);
			do_lio(&c__9, &c__1, "*ERROR: axis of cyclic symmetry"
				, (ftnlen)31);
			e_wsle();
			s_wsle(&io___32);
			do_lio(&c__9, &c__1, "        is part of the structu"
				"re;", (ftnlen)33);
			e_wsle();
			s_wsle(&io___33);
			do_lio(&c__9, &c__1, "        nodal diameters 0, 1, "
				"and", (ftnlen)33);
			e_wsle();
			s_wsle(&io___34);
			do_lio(&c__9, &c__1, "        those above must be ea"
				"ch in", (ftnlen)35);
			e_wsle();
			s_wsle(&io___35);
			do_lio(&c__9, &c__1, "        separate steps.", (
				ftnlen)23);
			e_wsle();
			*ier = 1;
			return 0;
		    }
		}

/*     specifying special MPC's for nodes on the axis */

/*     normal along the axis */

		xn = csab[3] - csab[0];
		yn = csab[4] - csab[1];
		zn = csab[5] - csab[2];
		dd = sqrt(xn * xn + yn * yn + zn * zn);
		xn /= dd;
		yn /= dd;
		zn /= dd;

/*     nodal diameter 0 */

		if (ns[1] == 0) {
		    if (abs(xn) > 1e-10) {
			i1[0] = 2;
			i1[1] = 3;
			i2[0] = 1;
			i2[1] = 1;
			x1[0] = xn;
			x1[1] = xn;
			x2[0] = -yn;
			x2[1] = -zn;
		    } else if (abs(yn) > 1e-10) {
			i1[0] = 1;
			i1[1] = 3;
			i2[0] = 2;
			i2[1] = 2;
			x1[0] = yn;
			x1[1] = yn;
			x2[0] = -xn;
			x2[1] = -zn;
		    } else if (abs(zn) > 1e-10) {
			i1[0] = 1;
			i1[1] = 2;
			i2[0] = 3;
			i2[1] = 3;
			x1[0] = zn;
			x1[1] = zn;
			x2[0] = -xn;
			x2[1] = -yn;
		    }

/*     generating two MPC's expressing that the nodes cannot */
/*     move in planes perpendicular to the cyclic symmetry */
/*     axis */

		    for (k = 1; k <= 2; ++k) {
			idof = (node - 1 << 3) + i1[k - 1];
			nident_(&ikmpc[1], &idof, nmpc, &id);
			if (id > 0) {
			    if (ikmpc[id] == idof) {
				s_wsle(&io___44);
				do_lio(&c__9, &c__1, "*ERROR reading *SELECT"
					" CYCLIC SYMMETRY MODES:", (ftnlen)45);
				e_wsle();
				s_wsle(&io___45);
				do_lio(&c__9, &c__1, "       node", (ftnlen)
					11);
				do_lio(&c__3, &c__1, (char *)&node, (ftnlen)
					sizeof(integer));
				do_lio(&c__9, &c__1, " on cyclic symmetry", (
					ftnlen)19);
				e_wsle();
				s_wsle(&io___46);
				do_lio(&c__9, &c__1, "       axis is used in"
					" other MPC", (ftnlen)32);
				e_wsle();
				*ier = 1;
				return 0;
			    }
			}
			++(*nmpc);
			ipompc[*nmpc] = *mpcfree;
			s_copy(labmpc + *nmpc * 20, "                    ", (
				ftnlen)20, (ftnlen)20);

/*     updating ikmpc and ilmpc */

			i__3 = id + 2;
			for (j = *nmpc; j >= i__3; --j) {
			    ikmpc[j] = ikmpc[j - 1];
			    ilmpc[j] = ilmpc[j - 1];
			}
			ikmpc[id + 1] = idof;
			ilmpc[id + 1] = *nmpc;

			nodempc[*mpcfree * 3 + 1] = node;
			nodempc[*mpcfree * 3 + 2] = i1[k - 1];
			coefmpc[*mpcfree] = x1[k - 1];
			*mpcfree = nodempc[*mpcfree * 3 + 3];
			if (*mpcfree == 0) {
			    s_wsle(&io___48);
			    do_lio(&c__9, &c__1, "*ERROR reading *SELECT CYC"
				    "LIC SYMMETRY MODES:", (ftnlen)45);
			    e_wsle();
			    s_wsle(&io___49);
			    do_lio(&c__9, &c__1, "       increase memmpc_", (
				    ftnlen)23);
			    e_wsle();
			    *ier = 1;
			    return 0;
			}
			nodempc[*mpcfree * 3 + 1] = node;
			nodempc[*mpcfree * 3 + 2] = i2[k - 1];
			coefmpc[*mpcfree] = x2[k - 1];
			mpcfreeold = *mpcfree;
			*mpcfree = nodempc[*mpcfree * 3 + 3];
			if (*mpcfree == 0) {
			    s_wsle(&io___51);
			    do_lio(&c__9, &c__1, "*ERROR reading *SELECT CYC"
				    "LIC SYMMETRY MODES:", (ftnlen)45);
			    e_wsle();
			    s_wsle(&io___52);
			    do_lio(&c__9, &c__1, "       increase memmpc_", (
				    ftnlen)23);
			    e_wsle();
			    *ier = 1;
			    return 0;
			}
			nodempc[mpcfreeold * 3 + 3] = 0;
		    }
		} else if (ns[1] == 1) {

/*     nodal diameter 1 */

		    if (abs(xn) > 1e-10) {
			i3 = 1;
			i4 = 2;
			i5 = 3;
			x3 = xn;
			x4 = yn;
			x5 = zn;
		    } else if (abs(yn) > 1e-10) {
			i3 = 2;
			i4 = 2;
			i5 = 3;
			x3 = yn;
			x4 = xn;
			x5 = zn;
		    } else {
			i3 = 3;
			i4 = 1;
			i5 = 2;
			x3 = zn;
			x4 = xn;
			x5 = yn;
		    }

/*     generating one MPC expressing that the nodes should */
/*     not move along the axis */

		    idof = (node - 1 << 3) + i3;
		    nident_(&ikmpc[1], &idof, nmpc, &id);
		    if (id > 0) {
			if (ikmpc[id] == idof) {
			    s_wsle(&io___59);
			    do_lio(&c__9, &c__1, "*ERROR reading *SELECT CYC"
				    "LIC SYMMETRY MODES:", (ftnlen)45);
			    e_wsle();
			    s_wsle(&io___60);
			    do_lio(&c__9, &c__1, "       node", (ftnlen)11);
			    do_lio(&c__3, &c__1, (char *)&node, (ftnlen)
				    sizeof(integer));
			    do_lio(&c__9, &c__1, " on cyclic symmetry", (
				    ftnlen)19);
			    e_wsle();
			    s_wsle(&io___61);
			    do_lio(&c__9, &c__1, "       axis is used in oth"
				    "er MPC", (ftnlen)32);
			    e_wsle();
			    *ier = 1;
			    return 0;
			}
		    }
		    ++(*nmpc);
		    ipompc[*nmpc] = *mpcfree;
		    s_copy(labmpc + *nmpc * 20, "                    ", (
			    ftnlen)20, (ftnlen)20);

/*     updating ikmpc and ilmpc */

		    i__3 = id + 2;
		    for (j = *nmpc; j >= i__3; --j) {
			ikmpc[j] = ikmpc[j - 1];
			ilmpc[j] = ilmpc[j - 1];
		    }
		    ikmpc[id + 1] = idof;
		    ilmpc[id + 1] = *nmpc;

		    nodempc[*mpcfree * 3 + 1] = node;
		    nodempc[*mpcfree * 3 + 2] = i3;
		    coefmpc[*mpcfree] = x3;
		    *mpcfree = nodempc[*mpcfree * 3 + 3];
		    if (*mpcfree == 0) {
			s_wsle(&io___62);
			do_lio(&c__9, &c__1, "*ERROR reading *SELECT CYCLIC "
				"SYMMETRY MODES:", (ftnlen)45);
			e_wsle();
			s_wsle(&io___63);
			do_lio(&c__9, &c__1, "       increase memmpc_", (
				ftnlen)23);
			e_wsle();
			*ier = 1;
			return 0;
		    }
		    nodempc[*mpcfree * 3 + 1] = node;
		    nodempc[*mpcfree * 3 + 2] = i4;
		    coefmpc[*mpcfree] = x4;
		    *mpcfree = nodempc[*mpcfree * 3 + 3];
		    if (*mpcfree == 0) {
			s_wsle(&io___64);
			do_lio(&c__9, &c__1, "*ERROR reading *SELECT CYCLIC "
				"SYMMETRY MODES:", (ftnlen)45);
			e_wsle();
			s_wsle(&io___65);
			do_lio(&c__9, &c__1, "       increase memmpc_", (
				ftnlen)23);
			e_wsle();
			*ier = 1;
			return 0;
		    }
		    nodempc[*mpcfree * 3 + 1] = node;
		    nodempc[*mpcfree * 3 + 2] = i5;
		    coefmpc[*mpcfree] = x5;
		    mpcfreeold = *mpcfree;
		    *mpcfree = nodempc[*mpcfree * 3 + 3];
		    if (*mpcfree == 0) {
			s_wsle(&io___66);
			do_lio(&c__9, &c__1, "*ERROR reading *SELECT CYCLIC "
				"SYMMETRY MODES:", (ftnlen)45);
			e_wsle();
			s_wsle(&io___67);
			do_lio(&c__9, &c__1, "       increase memmpc_", (
				ftnlen)23);
			e_wsle();
			*ier = 1;
			return 0;
		    }
		    nodempc[mpcfreeold * 3 + 3] = 0;
		} else {
		    for (k = 1; k <= 3; ++k) {
			idof = (node - 1 << 3) + k;
			nident_(&ikmpc[1], &idof, nmpc, &id);
			if (id > 0) {
			    if (ikmpc[id] == idof) {
				s_wsle(&io___68);
				do_lio(&c__9, &c__1, "*ERROR reading *SELECT"
					" CYCLIC SYMMETRY MODES:", (ftnlen)45);
				e_wsle();
				s_wsle(&io___69);
				do_lio(&c__9, &c__1, "       node", (ftnlen)
					11);
				do_lio(&c__3, &c__1, (char *)&node, (ftnlen)
					sizeof(integer));
				do_lio(&c__9, &c__1, " on cyclic symmetry", (
					ftnlen)19);
				e_wsle();
				s_wsle(&io___70);
				do_lio(&c__9, &c__1, "       axis is used in"
					" other MPC", (ftnlen)32);
				e_wsle();
				*ier = 1;
				return 0;
			    }
			}
			++(*nmpc);
			ipompc[*nmpc] = *mpcfree;
			s_copy(labmpc + *nmpc * 20, "                    ", (
				ftnlen)20, (ftnlen)20);

/*     updating ikmpc and ilmpc */

			i__3 = id + 2;
			for (j = *nmpc; j >= i__3; --j) {
			    ikmpc[j] = ikmpc[j - 1];
			    ilmpc[j] = ilmpc[j - 1];
			}
			ikmpc[id + 1] = idof;
			ilmpc[id + 1] = *nmpc;

			nodempc[*mpcfree * 3 + 1] = node;
			nodempc[*mpcfree * 3 + 2] = k;
			coefmpc[*mpcfree] = 1.;
			mpcfreeold = *mpcfree;
			*mpcfree = nodempc[*mpcfree * 3 + 3];
			if (*mpcfree == 0) {
			    s_wsle(&io___71);
			    do_lio(&c__9, &c__1, "*ERROR reading *SELECT CYC"
				    "LIC SYMMETRY MODES:", (ftnlen)45);
			    e_wsle();
			    s_wsle(&io___72);
			    do_lio(&c__9, &c__1, "       increase memmpc_", (
				    ftnlen)23);
			    e_wsle();
			    *ier = 1;
			    return 0;
			}
			nodempc[mpcfreeold * 3 + 3] = 0;
		    }
		}
	    }
	}

	cs[ij * 17 + 2] = ns[1] + .5;
	cs[ij * 17 + 3] = ns[2] + .5;
    }

    if (irepeat == 0) {
	irepeat = 1;
    }

    getnewline_(inpc + 1, textpart + 132, istat, n, key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

/*      do j=1,nmpc */
/*         call writempc(ipompc,nodempc,coefmpc,labmpc,j) */
/*      enddo */

    return 0;
} /* selectcyclicsymmetrymodess_ */

