/* transformfs.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int transformfs_(char *inpc, char *textpart, doublereal *
	trab, integer *ntrans, integer *ntrans___, char *set, integer *
	istartset, integer *iendset, integer *ialset, integer *nset, integer *
	istep, integer *istat, integer *n, integer *iline, integer *ipol, 
	integer *inl, integer *ipoinp, integer *inp, integer *ipoinpc, 
	doublereal *xload, char *sideload, integer *nelemload, integer *
	idefload, integer *nload, integer *nload___, integer *ne, integer *
	nam, integer *iamload, integer *ier, ftnlen inpc_len, ftnlen 
	textpart_len, ftnlen set_len, ftnlen sideload_len)
{
    /* System generated locals */
    integer i__1;
    icilist ici__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void), s_cmp(char *, char *, ftnlen, ftnlen);
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);
    integer i_indx(char *, char *, ftnlen, ftnlen), s_rsfi(icilist *), do_fio(
	    integer *, char *, ftnlen), e_rsfi(void), s_wsfi(icilist *), 
	    e_wsfi(void);

    /* Local variables */
    integer i__, j, l, id, iamplitude;
    extern /* Subroutine */ int getnewline_(char *, char *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *, ftnlen, ftnlen);
    char surfaceset[81];
    doublereal xmagnitude;
    extern /* Subroutine */ int inputerror_(char *, integer *, integer *, 
	    char *, integer *, ftnlen, ftnlen);
    integer key, iset, ipos;
    char label[20];
    extern /* Subroutine */ int inputwarning_(char *, integer *, integer *, 
	    char *, ftnlen, ftnlen);
    integer nelem, ifacel;
    extern /* Subroutine */ int loadadd_(integer *, char *, doublereal *, 
	    integer *, char *, doublereal *, integer *, integer *, integer *, 
	    integer *, integer *, integer *, integer *, ftnlen, ftnlen), 
	    cident81_(char *, char *, integer *, integer *, ftnlen, ftnlen);

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 6, 0, 0, 0 };
    static cilist io___2 = { 0, 6, 0, 0, 0 };
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___11 = { 0, 6, 0, 0, 0 };
    static cilist io___13 = { 0, 6, 0, 0, 0 };
    static cilist io___14 = { 0, 6, 0, 0, 0 };
    static cilist io___15 = { 0, 6, 0, 0, 0 };
    static cilist io___16 = { 0, 6, 0, 0, 0 };



/*     reading the input deck: *TRANSFORMF */






    /* Parameter adjustments */
    --iamload;
    --idefload;
    nelemload -= 3;
    sideload -= 20;
    xload -= 3;
    inp -= 4;
    ipoinp -= 3;
    --ialset;
    --iendset;
    --istartset;
    set -= 81;
    trab -= 8;
    textpart -= 132;
    --inpc;

    /* Function Body */
    if (*istep > 0) {
	s_wsle(&io___1);
	do_lio(&c__9, &c__1, "*ERROR reading *TRANSFORMF: *TRANSFORMF should"
		" be", (ftnlen)49);
	e_wsle();
	s_wsle(&io___2);
	do_lio(&c__9, &c__1, "  placed before all step definitions", (ftnlen)
		36);
	e_wsle();
	*ier = 1;
	return 0;
    }

    ++(*ntrans);
    if (*ntrans > *ntrans___) {
	s_wsle(&io___3);
	do_lio(&c__9, &c__1, "*ERROR reading *TRANSFORMF: increase ntrans_", (
		ftnlen)44);
	e_wsle();
	*ier = 1;
	return 0;
    }

    ipos = 1;
    xmagnitude = 0.;
    iamplitude = 0;

/*     rectangular coordinate system: trab(7,norien)=1 */
/*     cylindrical coordinate system: trab(7,norien)=-1 */
/*     default is rectangular */

    trab[*ntrans * 7 + 7] = 1.;

    i__1 = *n;
    for (i__ = 2; i__ <= i__1; ++i__) {
	if (s_cmp(textpart + i__ * 132, "TYPE=", (ftnlen)5, (ftnlen)5) == 0) {
	    if (*(unsigned char *)&textpart[i__ * 132 + 5] == 'C') {
		trab[*ntrans * 7 + 7] = -1.;
	    }
	} else if (s_cmp(textpart + i__ * 132, "SURFACE=", (ftnlen)8, (ftnlen)
		8) == 0) {
	    s_copy(surfaceset, textpart + (i__ * 132 + 8), (ftnlen)80, (
		    ftnlen)80);
	    *(unsigned char *)&surfaceset[80] = ' ';
	    ipos = i_indx(surfaceset, " ", (ftnlen)81, (ftnlen)1);
	    *(unsigned char *)&surfaceset[ipos - 1] = 'T';
/*            do iset=1,nset */
/*               if(set(iset).eq.surfaceset) exit */
/*            enddo */
	    cident81_(set + 81, surfaceset, nset, &id, (ftnlen)81, (ftnlen)81)
		    ;
	    iset = *nset + 1;
	    if (id > 0) {
		if (s_cmp(surfaceset, set + id * 81, (ftnlen)81, (ftnlen)81) 
			== 0) {
		    iset = id;
		}
	    }
	    if (iset > *nset) {
		s_wsle(&io___11);
		do_lio(&c__9, &c__1, "*WARNING reading *TRANSFORMF: element "
			"surface ", (ftnlen)46);
		do_lio(&c__9, &c__1, surfaceset, ipos - 1);
		do_lio(&c__9, &c__1, " does not exist", (ftnlen)15);
		e_wsle();
		getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, 
			ipol, inl, &ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (
			ftnlen)132);
		return 0;
	    }
	} else {
	    s_wsle(&io___13);
	    do_lio(&c__9, &c__1, "*WARNING reading *TRANSFORMF: parameter no"
		    "t recognized:", (ftnlen)55);
	    e_wsle();
	    s_wsle(&io___14);
	    do_lio(&c__9, &c__1, "         ", (ftnlen)9);
	    do_lio(&c__9, &c__1, textpart + i__ * 132, i_indx(textpart + i__ *
		     132, " ", (ftnlen)132, (ftnlen)1) - 1);
	    e_wsle();
	    inputwarning_(inpc + 1, ipoinpc, iline, "*TRANSFORMF%", (ftnlen)1,
		     (ftnlen)12);
	}
    }

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);
    if (*istat < 0 || key == 1) {
	s_wsle(&io___15);
	do_lio(&c__9, &c__1, "*ERROR reading *TRANSFORMF: definition of a", (
		ftnlen)43);
	e_wsle();
	s_wsle(&io___16);
	do_lio(&c__9, &c__1, "  transformation is not complete", (ftnlen)32);
	e_wsle();
	inputerror_(inpc + 1, ipoinpc, iline, "*TRANSFORMF%", ier, (ftnlen)1, 
		(ftnlen)12);
	return 0;
    }

    for (i__ = 1; i__ <= 6; ++i__) {
	ici__1.icierr = 1;
	ici__1.iciend = 1;
	ici__1.icirnum = 1;
	ici__1.icirlen = 20;
	ici__1.iciunit = textpart + i__ * 132;
	ici__1.icifmt = "(f20.0)";
	*istat = s_rsfi(&ici__1);
	if (*istat != 0) {
	    goto L100001;
	}
	*istat = do_fio(&c__1, (char *)&trab[i__ + *ntrans * 7], (ftnlen)
		sizeof(doublereal));
	if (*istat != 0) {
	    goto L100001;
	}
	*istat = e_rsfi();
L100001:
	if (*istat > 0) {
	    inputerror_(inpc + 1, ipoinpc, iline, "*TRANSFORMF%", ier, (
		    ftnlen)1, (ftnlen)12);
	    return 0;
	}
    }

    s_copy(label, "T                   ", (ftnlen)20, (ftnlen)20);
    i__1 = iendset[iset];
    for (j = istartset[iset]; j <= i__1; ++j) {
	l = ialset[j];
	nelem = (integer) (l / 10.);
	ifacel = l - nelem * 10;
	ici__1.icierr = 0;
	ici__1.icirnum = 1;
	ici__1.icirlen = 1;
	ici__1.iciunit = label + 1;
	ici__1.icifmt = "(i1)";
	s_wsfi(&ici__1);
	do_fio(&c__1, (char *)&ifacel, (ftnlen)sizeof(integer));
	e_wsfi();
	loadadd_(&nelem, label, &xmagnitude, &nelemload[3], sideload + 20, &
		xload[3], nload, nload___, &iamload[1], &iamplitude, nam, 
		ntrans, &idefload[1], (ftnlen)20, (ftnlen)20);
    }

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

    return 0;
} /* transformfs_ */

