/* resultsmech_u.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int resultsmech_u__(doublereal *co, integer *kon, integer *
	ipkon, char *lakon, integer *ne, doublereal *v, doublereal *stx, 
	doublereal *elcon, integer *nelcon, doublereal *rhcon, integer *
	nrhcon, doublereal *alcon, integer *nalcon, doublereal *alzero, 
	integer *ielmat, integer *ielorien, integer *norien, doublereal *orab,
	 integer *ntmat___, doublereal *t0, doublereal *t1, integer *ithermal,
	 doublereal *prestr, integer *iprestr, doublereal *eme, integer *
	iperturb, doublereal *fn, integer *iout, doublereal *qa, doublereal *
	vold, integer *nmethod, doublereal *veold, doublereal *dtime, 
	doublereal *time, doublereal *ttime, doublereal *plicon, integer *
	nplicon, doublereal *plkcon, integer *nplkcon, doublereal *xstateini, 
	doublereal *xstiff, doublereal *xstate, integer *npmat___, char *
	matname, integer *mi, integer *ielas, integer *icmd, integer *
	ncmat___, integer *nstate___, doublereal *stiini, doublereal *vini, 
	doublereal *ener, doublereal *eei, doublereal *enerini, integer *
	istep, integer *iinc, doublereal *reltime, integer *calcul_fn__, 
	integer *calcul_qa__, integer *calcul_cauchy__, integer *nener, 
	integer *ikin, integer *nal, integer *ne0, doublereal *thicke, 
	doublereal *emeini, integer *nelem, integer *ielprop, doublereal *
	prop, doublereal *t0g, doublereal *t1g, ftnlen lakon_len, ftnlen 
	matname_len)
{
    /* System generated locals */
    integer ielmat_dim1, ielmat_offset, ielorien_dim1, ielorien_offset, 
	    nplicon_dim1, nplicon_offset, nplkcon_dim1, nplkcon_offset, 
	    v_dim1, v_offset, stiini_dim2, stiini_offset, stx_dim2, 
	    stx_offset, elcon_dim1, elcon_dim2, elcon_offset, rhcon_dim2, 
	    rhcon_offset, alcon_dim2, alcon_offset, vini_dim1, vini_offset, 
	    fn_dim1, fn_offset, prestr_dim2, prestr_offset, eme_dim2, 
	    eme_offset, vold_dim1, vold_offset, ener_dim2, ener_offset, 
	    eei_dim2, eei_offset, enerini_dim2, enerini_offset, veold_dim1, 
	    veold_offset, plicon_dim1, plicon_dim2, plicon_offset, 
	    plkcon_dim1, plkcon_dim2, plkcon_offset, xstiff_dim2, 
	    xstiff_offset, xstate_dim1, xstate_dim2, xstate_offset, 
	    xstateini_dim1, xstateini_dim2, xstateini_offset, thicke_dim1, 
	    thicke_offset, emeini_dim2, emeini_offset;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    extern /* Subroutine */ int resultsmech_us45__(doublereal *, integer *, 
	    integer *, char *, integer *, doublereal *, doublereal *, 
	    doublereal *, integer *, doublereal *, integer *, doublereal *, 
	    integer *, doublereal *, integer *, integer *, integer *, 
	    doublereal *, integer *, doublereal *, doublereal *, integer *, 
	    doublereal *, integer *, doublereal *, integer *, doublereal *, 
	    integer *, doublereal *, doublereal *, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     doublereal *, integer *, doublereal *, doublereal *, doublereal *
	    , integer *, char *, integer *, integer *, integer *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *,
	     doublereal *, integer *, integer *, doublereal *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    doublereal *, doublereal *, integer *, integer *, doublereal *, 
	    doublereal *, doublereal *, ftnlen, ftnlen), resultsmech_matrix__(
	    doublereal *, integer *, integer *, char *, integer *, doublereal 
	    *, doublereal *, doublereal *, integer *, doublereal *, integer *,
	     doublereal *, integer *, doublereal *, integer *, integer *, 
	    integer *, doublereal *, integer *, doublereal *, doublereal *, 
	    integer *, doublereal *, integer *, doublereal *, integer *, 
	    doublereal *, integer *, doublereal *, doublereal *, integer *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, doublereal *, integer *, doublereal *, 
	    doublereal *, doublereal *, integer *, char *, integer *, integer 
	    *, integer *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, integer *, integer *, 
	    doublereal *, integer *, integer *, integer *, integer *, integer 
	    *, integer *, integer *, doublereal *, doublereal *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, ftnlen, 
	    ftnlen), resultsmech_u1__(doublereal *, integer *, integer *, 
	    char *, integer *, doublereal *, doublereal *, doublereal *, 
	    integer *, doublereal *, integer *, doublereal *, integer *, 
	    doublereal *, integer *, integer *, integer *, doublereal *, 
	    integer *, doublereal *, doublereal *, integer *, doublereal *, 
	    integer *, doublereal *, integer *, doublereal *, integer *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     doublereal *, doublereal *, doublereal *, integer *, doublereal *
	    , integer *, doublereal *, doublereal *, doublereal *, integer *, 
	    char *, integer *, integer *, integer *, integer *, integer *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, integer *, doublereal *, integer *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    doublereal *, doublereal *, integer *, integer *, doublereal *, 
	    doublereal *, doublereal *, ftnlen, ftnlen), resultsmech_us3__(
	    doublereal *, integer *, integer *, char *, integer *, doublereal 
	    *, doublereal *, doublereal *, integer *, doublereal *, integer *,
	     doublereal *, integer *, doublereal *, integer *, integer *, 
	    integer *, doublereal *, integer *, doublereal *, doublereal *, 
	    integer *, doublereal *, integer *, doublereal *, integer *, 
	    doublereal *, integer *, doublereal *, doublereal *, integer *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, doublereal *, integer *, doublereal *, 
	    doublereal *, doublereal *, integer *, char *, integer *, integer 
	    *, integer *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, integer *, integer *, 
	    doublereal *, integer *, integer *, integer *, integer *, integer 
	    *, integer *, integer *, doublereal *, doublereal *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, ftnlen, 
	    ftnlen);


/*     calculates nal,qa,fn,xstiff,ener,eme,eei,stx for user elements */





    /* Parameter adjustments */
    co -= 4;
    --kon;
    --ipkon;
    lakon -= 8;
    nelcon -= 3;
    --nrhcon;
    nalcon -= 3;
    --alzero;
    orab -= 8;
    nplkcon_dim1 = *ntmat___ - 0 + 1;
    nplkcon_offset = 0 + nplkcon_dim1;
    nplkcon -= nplkcon_offset;
    nplicon_dim1 = *ntmat___ - 0 + 1;
    nplicon_offset = 0 + nplicon_dim1;
    nplicon -= nplicon_offset;
    alcon_dim2 = *ntmat___;
    alcon_offset = 0 + 7 * (1 + alcon_dim2);
    alcon -= alcon_offset;
    rhcon_dim2 = *ntmat___;
    rhcon_offset = 0 + 2 * (1 + rhcon_dim2);
    rhcon -= rhcon_offset;
    --t0;
    --t1;
    --ithermal;
    --iperturb;
    --qa;
    plkcon_dim1 = 2 * *npmat___ - 0 + 1;
    plkcon_dim2 = *ntmat___;
    plkcon_offset = 0 + plkcon_dim1 * (1 + plkcon_dim2);
    plkcon -= plkcon_offset;
    plicon_dim1 = 2 * *npmat___ - 0 + 1;
    plicon_dim2 = *ntmat___;
    plicon_offset = 0 + plicon_dim1 * (1 + plicon_dim2);
    plicon -= plicon_offset;
    matname -= 80;
    --mi;
    emeini_dim2 = mi[1];
    emeini_offset = 1 + 6 * (1 + emeini_dim2);
    emeini -= emeini_offset;
    thicke_dim1 = mi[3];
    thicke_offset = 1 + thicke_dim1;
    thicke -= thicke_offset;
    enerini_dim2 = mi[1];
    enerini_offset = 1 + 2 * (1 + enerini_dim2);
    enerini -= enerini_offset;
    eei_dim2 = mi[1];
    eei_offset = 1 + 6 * (1 + eei_dim2);
    eei -= eei_offset;
    ener_dim2 = mi[1];
    ener_offset = 1 + 2 * (1 + ener_dim2);
    ener -= ener_offset;
    vini_dim1 = mi[2] - 0 + 1;
    vini_offset = 0 + vini_dim1;
    vini -= vini_offset;
    stiini_dim2 = mi[1];
    stiini_offset = 1 + 6 * (1 + stiini_dim2);
    stiini -= stiini_offset;
    xstiff_dim2 = mi[1];
    xstiff_offset = 1 + 27 * (1 + xstiff_dim2);
    xstiff -= xstiff_offset;
    veold_dim1 = mi[2] - 0 + 1;
    veold_offset = 0 + veold_dim1;
    veold -= veold_offset;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;
    fn_dim1 = mi[2] - 0 + 1;
    fn_offset = 0 + fn_dim1;
    fn -= fn_offset;
    eme_dim2 = mi[1];
    eme_offset = 1 + 6 * (1 + eme_dim2);
    eme -= eme_offset;
    prestr_dim2 = mi[1];
    prestr_offset = 1 + 6 * (1 + prestr_dim2);
    prestr -= prestr_offset;
    ielorien_dim1 = mi[3];
    ielorien_offset = 1 + ielorien_dim1;
    ielorien -= ielorien_offset;
    ielmat_dim1 = mi[3];
    ielmat_offset = 1 + ielmat_dim1;
    ielmat -= ielmat_offset;
    stx_dim2 = mi[1];
    stx_offset = 1 + 6 * (1 + stx_dim2);
    stx -= stx_offset;
    v_dim1 = mi[2] - 0 + 1;
    v_offset = 0 + v_dim1;
    v -= v_offset;
    elcon_dim1 = *ncmat___ - 0 + 1;
    elcon_dim2 = *ntmat___;
    elcon_offset = 0 + elcon_dim1 * (1 + elcon_dim2);
    elcon -= elcon_offset;
    xstate_dim1 = *nstate___;
    xstate_dim2 = mi[1];
    xstate_offset = 1 + xstate_dim1 * (1 + xstate_dim2);
    xstate -= xstate_offset;
    xstateini_dim1 = *nstate___;
    xstateini_dim2 = mi[1];
    xstateini_offset = 1 + xstateini_dim1 * (1 + xstateini_dim2);
    xstateini -= xstateini_offset;
    --ielprop;
    --prop;
    t0g -= 3;
    t1g -= 3;

    /* Function Body */
    if (*(unsigned char *)&lakon[(*nelem << 3) + 1] == '1') {

/*     user element u1 timoshenko beam */

	resultsmech_u1__(&co[4], &kon[1], &ipkon[1], lakon + 8, ne, &v[
		v_offset], &stx[stx_offset], &elcon[elcon_offset], &nelcon[3],
		 &rhcon[rhcon_offset], &nrhcon[1], &alcon[alcon_offset], &
		nalcon[3], &alzero[1], &ielmat[ielmat_offset], &ielorien[
		ielorien_offset], norien, &orab[8], ntmat___, &t0[1], &t1[1], 
		&ithermal[1], &prestr[prestr_offset], iprestr, &eme[
		eme_offset], &iperturb[1], &fn[fn_offset], iout, &qa[1], &
		vold[vold_offset], nmethod, &veold[veold_offset], dtime, time,
		 ttime, &plicon[plicon_offset], &nplicon[nplicon_offset], &
		plkcon[plkcon_offset], &nplkcon[nplkcon_offset], &xstateini[
		xstateini_offset], &xstiff[xstiff_offset], &xstate[
		xstate_offset], npmat___, matname + 80, &mi[1], ielas, icmd, 
		ncmat___, nstate___, &stiini[stiini_offset], &vini[
		vini_offset], &ener[ener_offset], &eei[eei_offset], &enerini[
		enerini_offset], istep, iinc, reltime, calcul_fn__, 
		calcul_qa__, calcul_cauchy__, nener, ikin, nal, ne0, &thicke[
		thicke_offset], &emeini[emeini_offset], nelem, &ielprop[1], &
		prop[1], &t0g[3], &t1g[3], (ftnlen)8, (ftnlen)80);
    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "S45", (ftnlen)3, (ftnlen)3)
	     == 0) {

/*     user element us45 flat shell element with 4 nodes (5dof) */

	resultsmech_us45__(&co[4], &kon[1], &ipkon[1], lakon + 8, ne, &v[
		v_offset], &stx[stx_offset], &elcon[elcon_offset], &nelcon[3],
		 &rhcon[rhcon_offset], &nrhcon[1], &alcon[alcon_offset], &
		nalcon[3], &alzero[1], &ielmat[ielmat_offset], &ielorien[
		ielorien_offset], norien, &orab[8], ntmat___, &t0[1], &t1[1], 
		&ithermal[1], &prestr[prestr_offset], iprestr, &eme[
		eme_offset], &iperturb[1], &fn[fn_offset], iout, &qa[1], &
		vold[vold_offset], nmethod, &veold[veold_offset], dtime, time,
		 ttime, &plicon[plicon_offset], &nplicon[nplicon_offset], &
		plkcon[plkcon_offset], &nplkcon[nplkcon_offset], &xstateini[
		xstateini_offset], &xstiff[xstiff_offset], &xstate[
		xstate_offset], npmat___, matname + 80, &mi[1], ielas, icmd, 
		ncmat___, nstate___, &stiini[stiini_offset], &vini[
		vini_offset], &ener[ener_offset], &eei[eei_offset], &enerini[
		enerini_offset], istep, iinc, reltime, calcul_fn__, 
		calcul_qa__, calcul_cauchy__, nener, ikin, nal, ne0, &thicke[
		thicke_offset], &emeini[emeini_offset], nelem, &ielprop[1], &
		prop[1], &t0g[3], &t1g[3], (ftnlen)8, (ftnlen)80);

    } else if (s_cmp(lakon + ((*nelem << 3) + 1), "S3", (ftnlen)2, (ftnlen)2) 
	    == 0) {

/*     user element us3 flat shell element with 3 nodes (6dof) */

	resultsmech_us3__(&co[4], &kon[1], &ipkon[1], lakon + 8, ne, &v[
		v_offset], &stx[stx_offset], &elcon[elcon_offset], &nelcon[3],
		 &rhcon[rhcon_offset], &nrhcon[1], &alcon[alcon_offset], &
		nalcon[3], &alzero[1], &ielmat[ielmat_offset], &ielorien[
		ielorien_offset], norien, &orab[8], ntmat___, &t0[1], &t1[1], 
		&ithermal[1], &prestr[prestr_offset], iprestr, &eme[
		eme_offset], &iperturb[1], &fn[fn_offset], iout, &qa[1], &
		vold[vold_offset], nmethod, &veold[veold_offset], dtime, time,
		 ttime, &plicon[plicon_offset], &nplicon[nplicon_offset], &
		plkcon[plkcon_offset], &nplkcon[nplkcon_offset], &xstateini[
		xstateini_offset], &xstiff[xstiff_offset], &xstate[
		xstate_offset], npmat___, matname + 80, &mi[1], ielas, icmd, 
		ncmat___, nstate___, &stiini[stiini_offset], &vini[
		vini_offset], &ener[ener_offset], &eei[eei_offset], &enerini[
		enerini_offset], istep, iinc, reltime, calcul_fn__, 
		calcul_qa__, calcul_cauchy__, nener, ikin, nal, ne0, &thicke[
		thicke_offset], &emeini[emeini_offset], nelem, &ielprop[1], &
		prop[1], &t0g[3], &t1g[3], (ftnlen)8, (ftnlen)80);
    } else {

/*       substructure (also called superelement) */

	resultsmech_matrix__(&co[4], &kon[1], &ipkon[1], lakon + 8, ne, &v[
		v_offset], &stx[stx_offset], &elcon[elcon_offset], &nelcon[3],
		 &rhcon[rhcon_offset], &nrhcon[1], &alcon[alcon_offset], &
		nalcon[3], &alzero[1], &ielmat[ielmat_offset], &ielorien[
		ielorien_offset], norien, &orab[8], ntmat___, &t0[1], &t1[1], 
		&ithermal[1], &prestr[prestr_offset], iprestr, &eme[
		eme_offset], &iperturb[1], &fn[fn_offset], iout, &qa[1], &
		vold[vold_offset], nmethod, &veold[veold_offset], dtime, time,
		 ttime, &plicon[plicon_offset], &nplicon[nplicon_offset], &
		plkcon[plkcon_offset], &nplkcon[nplkcon_offset], &xstateini[
		xstateini_offset], &xstiff[xstiff_offset], &xstate[
		xstate_offset], npmat___, matname + 80, &mi[1], ielas, icmd, 
		ncmat___, nstate___, &stiini[stiini_offset], &vini[
		vini_offset], &ener[ener_offset], &eei[eei_offset], &enerini[
		enerini_offset], istep, iinc, reltime, calcul_fn__, 
		calcul_qa__, calcul_cauchy__, nener, ikin, nal, ne0, &thicke[
		thicke_offset], &emeini[emeini_offset], nelem, &ielprop[1], &
		prop[1], &t0g[3], &t1g[3], (ftnlen)8, (ftnlen)80);
/*         write(*,*) '*ERROR in resultsmech_u.f: user element' */
/*         write(*,*) '       ',lakon(nelem)(1:5),' is not defined' */
/*         call exit(201) */
    }

    return 0;
} /* resultsmech_u__ */

