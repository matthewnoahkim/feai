/* robustdesigns.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int robustdesigns_(char *inpc, char *textpart, integer *
	nmethod, integer *istep, integer *istat, integer *n, integer *iline, 
	integer *ipol, integer *inl, integer *ipoinp, integer *inp, char *
	tieset, integer *ipoinpc, integer *ntie, doublereal *tinc, doublereal 
	*tper, doublereal *tmin, doublereal *tmax, doublereal *tincf, integer 
	*isens, integer *ier, doublereal *physcon, integer *irobustdesign, 
	ftnlen inpc_len, ftnlen textpart_len, ftnlen tieset_len)
{
    /* System generated locals */
    icilist ici__1;

    /* Builtin functions */
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void), s_rsfi(icilist *), do_fio(integer *, char *, ftnlen)
	    , e_rsfi(void);

    /* Local variables */
    extern /* Subroutine */ int getnewline_(char *, char *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *, ftnlen, ftnlen), inputerror_(char *, 
	    integer *, integer *, char *, integer *, ftnlen, ftnlen);
    integer key;
    doublereal reliability;
    logical iread, iwrite;

    /* Fortran I/O blocks */
    static cilist io___1 = { 0, 6, 0, 0, 0 };
    static cilist io___2 = { 0, 6, 0, 0, 0 };
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___4 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___10 = { 0, 6, 0, 0, 0 };
    static cilist io___11 = { 0, 6, 0, 0, 0 };
    static cilist io___12 = { 0, 6, 0, 0, 0 };
    static cilist io___13 = { 0, 6, 0, 0, 0 };
    static cilist io___14 = { 0, 6, 0, 0, 0 };
    static cilist io___15 = { 0, 6, 0, 0, 0 };



/*     reading the input deck: *ROBUST DESIGN */






/*     Read in *ROBUST DESIGN */

    /* Parameter adjustments */
    --irobustdesign;
    --physcon;
    tieset -= 324;
    inp -= 4;
    ipoinp -= 3;
    textpart -= 132;
    --inpc;

    /* Function Body */
    if (*isens == 1) {
	s_wsle(&io___1);
	do_lio(&c__9, &c__1, "*ERROR reading *ROBUST DESIGN:", (ftnlen)30);
	e_wsle();
	s_wsle(&io___2);
	do_lio(&c__9, &c__1, "      no more than one *ROBUST DESIGN", (ftnlen)
		37);
	e_wsle();
	s_wsle(&io___3);
	do_lio(&c__9, &c__1, "      is allowed per input deck", (ftnlen)31);
	e_wsle();
	*ier = 1;
	return 0;
    }

    if (*istep < 1) {
	s_wsle(&io___4);
	do_lio(&c__9, &c__1, "*ERROR reading *ROBUST DESIGN: *ROBUST DESIGN "
		"can           only be used within a STEP", (ftnlen)86);
	e_wsle();
	*ier = 1;
	return 0;
    }

/*      if(istep.lt.2) then */
/*         write(*,*) '*ERROR reading *ROBUST DESIGN: *ROBUST DESIGN' */
/*         write(*,*) '      requires a previous *STATIC step' */
/*         ier=1 */
/*         return */
/*      endif */

    *tinc = 0.;
    *tper = 0.;
    *tmin = 0.;
    *tmax = 0.;
    *tincf = 0.;

    iwrite = FALSE_;
    iread = FALSE_;

    *nmethod = 14;

/*     check whether design variables were defined */

/*      do i=1,ntie */
/*         if(tieset(1,i)(81:81).eq.'D') exit */
/*      enddo */
/*      if(i.gt.ntie) then */
/*         write(*,*) '*ERROR reading *ROBUST DESIGN' */
/*         write(*,*) '      no design variables were defined' */
/*         call inputerror(inpc,ipoinpc,iline, */
/*     &        "*ROBUST DESIGN%",ier) */
/*         return */
/*      endif */

/*     check what information is requested by the user */
/*     irobustdesign(1)=1 --> the full stochastic perturbation method */
/*                         is performed (default) */
/*     irobustdesign(1)=2 --> only the eigenvectors of the randomfield is */
/*                         calculated */

/*      if(n.eq.2) then */
/*         if(textpart(2)(1:15).eq.'RANDOMFIELDONLY') then */
    irobustdesign[1] = 2;
/*         else */
/*            irobustdesign(1)=1 */
/*            write(*,*) '*WARNING Keyword in *ROBUST DESIGN' */
/*            write(*,*) '   not known, keyword ignored' */
/*         endif */
/*      endif */

/*     Read in the reliability of the random field */

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

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
    *istat = do_fio(&c__1, (char *)&reliability, (ftnlen)sizeof(doublereal));
    if (*istat != 0) {
	goto L100001;
    }
    *istat = e_rsfi();
L100001:
    if (*istat > 0) {
	s_wsle(&io___9);
	do_lio(&c__9, &c__1, "*ERROR in *ROBUST DESIGN reliability of", (
		ftnlen)39);
	e_wsle();
	s_wsle(&io___10);
	do_lio(&c__9, &c__1, "       the random field not specified", (ftnlen)
		37);
	e_wsle();
	inputerror_(inpc + 1, ipoinpc, iline, "*ROBUST DESIGN%", ier, (ftnlen)
		1, (ftnlen)15);
	return 0;
    }
    if (reliability <= 0. || reliability >= 1.) {
	s_wsle(&io___11);
	do_lio(&c__9, &c__1, "*ERROR reading *ROBUST DESIGN", (ftnlen)29);
	e_wsle();
	s_wsle(&io___12);
	do_lio(&c__9, &c__1, "       Reliability of the random field", (
		ftnlen)38);
	e_wsle();
	s_wsle(&io___13);
	do_lio(&c__9, &c__1, "       has to be in the range", (ftnlen)29);
	e_wsle();
	s_wsle(&io___14);
	do_lio(&c__9, &c__1, "       between 0 and 1", (ftnlen)22);
	e_wsle();
	s_wsle(&io___15);
	e_wsle();
	inputerror_(inpc + 1, ipoinpc, iline, "*ROBUST DESIGN%", ier, (ftnlen)
		1, (ftnlen)15);
	return 0;
    }
    physcon[11] = reliability;

    getnewline_(inpc + 1, textpart + 132, istat, n, &key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

    return 0;
} /* robustdesigns_ */

