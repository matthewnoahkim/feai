/* restarts.f -- translated by f2c (version 20200916).
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
static integer c__9 = 9;


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

/* Subroutine */ int restarts_(integer *istep, integer *nset, integer *nload, 
	integer *nforc, integer *nboun, integer *nk, integer *ne, integer *
	nmpc, integer *nalset, integer *nmat, integer *ntmat___, integer *
	npmat___, integer *norien, integer *nam, integer *nprint, integer *mi,
	 integer *ntrans, integer *ncs___, integer *namtot, integer *ncmat___,
	 integer *mpcfree, integer *maxlenmpc, integer *ne1d, integer *ne2d, 
	integer *nflow, integer *nlabel, integer *iplas, integer *nkon, 
	integer *ithermal, integer *nmethod, integer *iperturb, integer *
	nstate___, integer *nener, char *set, integer *istartset, integer *
	iendset, integer *ialset, doublereal *co, integer *kon, integer *
	ipkon, char *lakon, integer *nodeboun, integer *ndirboun, integer *
	iamboun, doublereal *xboun, integer *ikboun, integer *ilboun, integer 
	*ipompc, integer *nodempc, doublereal *coefmpc, char *labmpc, integer 
	*ikmpc, integer *ilmpc, integer *nodeforc, integer *ndirforc, integer 
	*iamforc, doublereal *xforc, integer *ikforc, integer *ilforc, 
	integer *nelemload, integer *iamload, char *sideload, doublereal *
	xload, doublereal *elcon, integer *nelcon, doublereal *rhcon, integer 
	*nrhcon, doublereal *alcon, integer *nalcon, doublereal *alzero, 
	doublereal *plicon, integer *nplicon, doublereal *plkcon, integer *
	nplkcon, char *orname, doublereal *orab, integer *ielorien, 
	doublereal *trab, integer *inotr, char *amname, doublereal *amta, 
	integer *namta, doublereal *t0, doublereal *t1, integer *iamt1, 
	doublereal *veold, integer *ielmat, char *matname, char *prlab, char *
	prset, char *filab, doublereal *vold, integer *nodebounold, integer *
	ndirbounold, doublereal *xbounold, doublereal *xforcold, doublereal *
	xloadold, doublereal *t1old, doublereal *eme, integer *iponor, 
	doublereal *xnor, integer *knor, doublereal *thicke, doublereal *
	offset, integer *iponoel, integer *inoel, integer *rig, doublereal *
	shcon, integer *nshcon, doublereal *cocon, integer *ncocon, integer *
	ics, doublereal *sti, doublereal *ener, doublereal *xstate, char *
	jobnamec, integer *infree, integer *irstrt, char *inpc, char *
	textpart, integer *istat, integer *n, integer *key, doublereal *
	prestr, integer *iprestr, char *cbody, integer *ibody, doublereal *
	xbody, integer *nbody, doublereal *xbodyold, doublereal *ttime, 
	doublereal *qaold, doublereal *cs, integer *mcs, char *output, 
	doublereal *physcon, doublereal *ctrl, char *typeboun, integer *iline,
	 integer *ipol, integer *inl, integer *ipoinp, integer *inp, 
	doublereal *fmpc, char *tieset, integer *ntie, doublereal *tietol, 
	integer *ipoinpc, integer *nslavs, doublereal *t0g, doublereal *t1g, 
	integer *nprop, integer *ielprop, doublereal *prop, integer *mortar, 
	integer *nintpoint, integer *ifacecount, integer *islavsurf, 
	doublereal *pslavsurf, doublereal *clearini, integer *ier, doublereal 
	*vel, integer *nef, doublereal *velo, doublereal *veloo, integer *
	ne2boun, char *heading, integer *network, integer *irestartread, 
	integer *nfc, integer *ndc, doublereal *coeffc, integer *ikdc, 
	doublereal *edc, ftnlen set_len, ftnlen lakon_len, ftnlen labmpc_len, 
	ftnlen sideload_len, ftnlen orname_len, ftnlen amname_len, ftnlen 
	matname_len, ftnlen prlab_len, ftnlen prset_len, ftnlen filab_len, 
	ftnlen jobnamec_len, ftnlen inpc_len, ftnlen textpart_len, ftnlen 
	cbody_len, ftnlen output_len, ftnlen typeboun_len, ftnlen tieset_len, 
	ftnlen heading_len)
{
    /* System generated locals */
    integer i__1;
    icilist ici__1;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen), s_rsfi(icilist *), do_fio(
	    integer *, char *, ftnlen), e_rsfi(void), s_wsle(cilist *), 
	    do_lio(integer *, integer *, char *, ftnlen), e_wsle(void), 
	    i_indx(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    integer i__;
    extern /* Subroutine */ int getnewline_(char *, char *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, integer *, ftnlen, ftnlen), inputerror_(char *, 
	    integer *, integer *, char *, integer *, ftnlen, ftnlen), 
	    restartread_(integer *, integer *, integer *, integer *, integer *
	    , integer *, integer *, integer *, integer *, integer *, integer *
	    , integer *, integer *, integer *, integer *, integer *, integer *
	    , integer *, integer *, integer *, integer *, integer *, integer *
	    , integer *, integer *, integer *, integer *, integer *, integer *
	    , integer *, integer *, integer *, integer *, char *, integer *, 
	    integer *, integer *, doublereal *, integer *, integer *, char *, 
	    integer *, integer *, integer *, doublereal *, integer *, integer 
	    *, integer *, integer *, doublereal *, char *, integer *, integer 
	    *, integer *, integer *, integer *, doublereal *, integer *, 
	    integer *, integer *, integer *, char *, doublereal *, doublereal 
	    *, integer *, doublereal *, integer *, doublereal *, integer *, 
	    doublereal *, doublereal *, integer *, doublereal *, integer *, 
	    char *, doublereal *, integer *, doublereal *, integer *, char *, 
	    doublereal *, integer *, doublereal *, doublereal *, integer *, 
	    doublereal *, integer *, char *, char *, char *, char *, 
	    doublereal *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, integer *, doublereal *,
	     integer *, doublereal *, doublereal *, integer *, integer *, 
	    integer *, doublereal *, integer *, doublereal *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, char *, 
	    integer *, integer *, doublereal *, integer *, char *, integer *, 
	    doublereal *, integer *, doublereal *, doublereal *, doublereal *,
	     doublereal *, integer *, char *, doublereal *, doublereal *, 
	    char *, doublereal *, char *, integer *, doublereal *, integer *, 
	    doublereal *, doublereal *, integer *, integer *, doublereal *, 
	    integer *, integer *, integer *, integer *, doublereal *, 
	    doublereal *, integer *, doublereal *, integer *, doublereal *, 
	    doublereal *, integer *, char *, integer *, integer *, integer *, 
	    doublereal *, integer *, doublereal *, ftnlen, ftnlen, ftnlen, 
	    ftnlen, ftnlen, ftnlen, ftnlen, ftnlen, ftnlen, ftnlen, ftnlen, 
	    ftnlen, ftnlen, ftnlen, ftnlen, ftnlen), inputwarning_(char *, 
	    integer *, integer *, char *, ftnlen, ftnlen);
    integer irestartstep;

    /* Fortran I/O blocks */
    static cilist io___3 = { 0, 6, 0, 0, 0 };
    static cilist io___4 = { 0, 6, 0, 0, 0 };







    /* Parameter adjustments */
    --edc;
    --ikdc;
    --coeffc;
    heading -= 66;
    ne2boun -= 3;
    --veloo;
    --velo;
    --vel;
    --clearini;
    --pslavsurf;
    --islavsurf;
    --prop;
    --ielprop;
    --t1g;
    --t0g;
    --tietol;
    tieset -= 324;
    --fmpc;
    inp -= 4;
    ipoinp -= 3;
    --typeboun;
    --ctrl;
    --physcon;
    cs -= 18;
    --qaold;
    --xbodyold;
    --xbody;
    --ibody;
    cbody -= 81;
    --prestr;
    textpart -= 132;
    --inpc;
    --irstrt;
    --infree;
    jobnamec -= 132;
    --xstate;
    --ener;
    --sti;
    --ics;
    --ncocon;
    --cocon;
    --nshcon;
    --shcon;
    --rig;
    --inoel;
    --iponoel;
    --offset;
    --thicke;
    --knor;
    --xnor;
    --iponor;
    --eme;
    --t1old;
    --xloadold;
    --xforcold;
    --xbounold;
    --ndirbounold;
    --nodebounold;
    --vold;
    filab -= 87;
    prset -= 81;
    prlab -= 6;
    matname -= 80;
    --ielmat;
    --veold;
    --iamt1;
    --t1;
    --t0;
    --namta;
    --amta;
    amname -= 80;
    --inotr;
    --trab;
    --ielorien;
    --orab;
    orname -= 80;
    --nplkcon;
    --plkcon;
    --nplicon;
    --plicon;
    --alzero;
    --nalcon;
    --alcon;
    --nrhcon;
    --rhcon;
    --nelcon;
    --elcon;
    --xload;
    sideload -= 20;
    --iamload;
    --nelemload;
    --ilforc;
    --ikforc;
    --xforc;
    --iamforc;
    --ndirforc;
    --nodeforc;
    --ilmpc;
    --ikmpc;
    labmpc -= 20;
    --coefmpc;
    --nodempc;
    --ipompc;
    --ilboun;
    --ikboun;
    --xboun;
    --iamboun;
    --ndirboun;
    --nodeboun;
    lakon -= 8;
    --ipkon;
    --kon;
    --co;
    --ialset;
    --iendset;
    --istartset;
    set -= 81;
    --iperturb;
    --ithermal;
    --mi;

    /* Function Body */
    irestartstep = 0;

    i__1 = *n;
    for (i__ = 2; i__ <= i__1; ++i__) {
	if (s_cmp(textpart + i__ * 132, "READ", (ftnlen)4, (ftnlen)4) == 0) {
	    *irestartread = 2;
	} else if (s_cmp(textpart + i__ * 132, "STEP=", (ftnlen)5, (ftnlen)5) 
		== 0) {
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
	    *istat = do_fio(&c__1, (char *)&irestartstep, (ftnlen)sizeof(
		    integer));
	    if (*istat != 0) {
		goto L100001;
	    }
	    *istat = e_rsfi();
L100001:
	    if (*istat > 0) {
		inputerror_(inpc + 1, ipoinpc, iline, "*RESTART%", ier, (
			ftnlen)1, (ftnlen)9);
		return 0;
	    }
	} else if (s_cmp(textpart + i__ * 132, "WRITE", (ftnlen)5, (ftnlen)5) 
		== 0) {
	    irstrt[1] = 1;
	} else if (s_cmp(textpart + i__ * 132, "FREQUENCY=", (ftnlen)10, (
		ftnlen)10) == 0) {
	    ici__1.icierr = 1;
	    ici__1.iciend = 1;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 10;
	    ici__1.iciunit = textpart + (i__ * 132 + 10);
	    ici__1.icifmt = "(i10)";
	    *istat = s_rsfi(&ici__1);
	    if (*istat != 0) {
		goto L100002;
	    }
	    *istat = do_fio(&c__1, (char *)&irstrt[1], (ftnlen)sizeof(integer)
		    );
	    if (*istat != 0) {
		goto L100002;
	    }
	    *istat = e_rsfi();
L100002:
	    if (*istat > 0) {
		inputerror_(inpc + 1, ipoinpc, iline, "*RESTART%", ier, (
			ftnlen)1, (ftnlen)9);
		return 0;
	    }
	} else if (s_cmp(textpart + i__ * 132, "OVERLAY", (ftnlen)7, (ftnlen)
		7) == 0) {
	    irstrt[2] = 1;
	} else {
	    s_wsle(&io___3);
	    do_lio(&c__9, &c__1, "*WARNING in restarts: parameter not recogn"
		    "ized:", (ftnlen)47);
	    e_wsle();
	    s_wsle(&io___4);
	    do_lio(&c__9, &c__1, "         ", (ftnlen)9);
	    do_lio(&c__9, &c__1, textpart + i__ * 132, i_indx(textpart + i__ *
		     132, " ", (ftnlen)132, (ftnlen)1) - 1);
	    e_wsle();
	    inputwarning_(inpc + 1, ipoinpc, iline, "*RESTART%", (ftnlen)1, (
		    ftnlen)9);
	}
    }

    if (*irestartread == 2) {
	*irestartread = 1;
	restartread_(istep, nset, nload, nforc, nboun, nk, ne, nmpc, nalset, 
		nmat, ntmat___, npmat___, norien, nam, nprint, &mi[1], ntrans,
		 ncs___, namtot, ncmat___, mpcfree, maxlenmpc, ne1d, ne2d, 
		nflow, nlabel, iplas, nkon, &ithermal[1], nmethod, &iperturb[
		1], nstate___, nener, set + 81, &istartset[1], &iendset[1], &
		ialset[1], &co[1], &kon[1], &ipkon[1], lakon + 8, &nodeboun[1]
		, &ndirboun[1], &iamboun[1], &xboun[1], &ikboun[1], &ilboun[1]
		, &ipompc[1], &nodempc[1], &coefmpc[1], labmpc + 20, &ikmpc[1]
		, &ilmpc[1], &nodeforc[1], &ndirforc[1], &iamforc[1], &xforc[
		1], &ikforc[1], &ilforc[1], &nelemload[1], &iamload[1], 
		sideload + 20, &xload[1], &elcon[1], &nelcon[1], &rhcon[1], &
		nrhcon[1], &alcon[1], &nalcon[1], &alzero[1], &plicon[1], &
		nplicon[1], &plkcon[1], &nplkcon[1], orname + 80, &orab[1], &
		ielorien[1], &trab[1], &inotr[1], amname + 80, &amta[1], &
		namta[1], &t0[1], &t1[1], &iamt1[1], &veold[1], &ielmat[1], 
		matname + 80, prlab + 6, prset + 81, filab + 87, &vold[1], &
		nodebounold[1], &ndirbounold[1], &xbounold[1], &xforcold[1], &
		xloadold[1], &t1old[1], &eme[1], &iponor[1], &xnor[1], &knor[
		1], &thicke[1], &offset[1], &iponoel[1], &inoel[1], &rig[1], &
		shcon[1], &nshcon[1], &cocon[1], &ncocon[1], &ics[1], &sti[1],
		 &ener[1], &xstate[1], jobnamec + 132, &infree[1], &
		irestartstep, &prestr[1], iprestr, cbody + 81, &ibody[1], &
		xbody[1], nbody, &xbodyold[1], ttime, &qaold[1], &cs[18], mcs,
		 output, &physcon[1], &ctrl[1], typeboun + 1, &fmpc[1], 
		tieset + 324, ntie, &tietol[1], nslavs, &t0g[1], &t1g[1], 
		nprop, &ielprop[1], &prop[1], mortar, nintpoint, ifacecount, &
		islavsurf[1], &pslavsurf[1], &clearini[1], &irstrt[1], &vel[1]
		, nef, &velo[1], &veloo[1], &ne2boun[3], heading + 66, 
		network, nfc, ndc, &coeffc[1], &ikdc[1], &edc[1], (ftnlen)81, 
		(ftnlen)8, (ftnlen)20, (ftnlen)20, (ftnlen)80, (ftnlen)80, (
		ftnlen)80, (ftnlen)6, (ftnlen)81, (ftnlen)87, (ftnlen)132, (
		ftnlen)81, (ftnlen)4, (ftnlen)1, (ftnlen)81, (ftnlen)66);
    }

    getnewline_(inpc + 1, textpart + 132, istat, n, key, iline, ipol, inl, &
	    ipoinp[3], &inp[4], ipoinpc, (ftnlen)1, (ftnlen)132);

    return 0;
} /* restarts_ */

