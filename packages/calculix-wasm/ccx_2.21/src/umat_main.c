/* umat_main.f -- translated by f2c (version 20200916).
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
static integer c__201 = 201;


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

/* Subroutine */ int umat_main__(char *amat, integer *iel, integer *iint, 
	integer *kode, doublereal *elconloc, doublereal *emec, doublereal *
	emec0, doublereal *beta, doublereal *xikl, doublereal *vij, 
	doublereal *xkl, doublereal *vj, integer *ithermal, doublereal *t1l, 
	doublereal *dtime, doublereal *time, doublereal *ttime, integer *icmd,
	 integer *ielas, integer *mi, integer *nstate___, doublereal *
	xstateini, doublereal *xstate, doublereal *stre, doublereal *stiff, 
	integer *iorien, doublereal *pgauss, doublereal *orab, doublereal *
	pnewdt, integer *istep, integer *iinc, integer *ipkon, integer *
	nmethod, integer *iperturb, doublereal *depvisc, doublereal *eloc, 
	integer *nlgeom_undo__, doublereal *physcon, integer *ncmat___, 
	ftnlen amat_len)
{
    /* System generated locals */
    integer xstate_dim1, xstate_dim2, xstate_offset, xstateini_dim1, 
	    xstateini_dim2, xstateini_offset;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen);
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);

    /* Local variables */
    extern /* Subroutine */ int umat_undo_nlgeom_lin_el__(char *, integer *, 
	    integer *, integer *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, doublereal *, doublereal *, doublereal *,
	     doublereal *, integer *, integer *, integer *, integer *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     doublereal *, doublereal *, doublereal *, integer *, integer *, 
	    ftnlen), call_external_umat_user__(char *, integer *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *,
	     doublereal *, doublereal *, doublereal *, doublereal *, integer *
	    , doublereal *, doublereal *, doublereal *, doublereal *, integer 
	    *, integer *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     doublereal *, integer *, ftnlen), umat_aniso_creep__(char *, 
	    integer *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     doublereal *, doublereal *, integer *, integer *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *,
	     integer *, doublereal *, doublereal *, integer *, doublereal *, 
	    doublereal *, ftnlen), umat_user__(char *, integer *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *,
	     doublereal *, doublereal *, doublereal *, doublereal *, integer *
	    , doublereal *, doublereal *, doublereal *, doublereal *, integer 
	    *, integer *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     doublereal *, integer *, ftnlen), umat_lin_el_corot__(char *, 
	    integer *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     doublereal *, doublereal *, integer *, integer *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *,
	     integer *, doublereal *, doublereal *, doublereal *, integer *, 
	    ftnlen), umat_tension_only__(char *, integer *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *,
	     doublereal *, doublereal *, doublereal *, doublereal *, integer *
	    , doublereal *, doublereal *, doublereal *, doublereal *, integer 
	    *, integer *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     ftnlen), umat_single_crystal_creep__(char *, integer *, integer *
	    , integer *, doublereal *, doublereal *, doublereal *, doublereal 
	    *, doublereal *, doublereal *, doublereal *, doublereal *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *,
	     integer *, integer *, integer *, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, integer *, doublereal *,
	     doublereal *, doublereal *, ftnlen), umat_elastic_fiber__(char *,
	     integer *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     doublereal *, doublereal *, integer *, integer *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *,
	     integer *, doublereal *, doublereal *, ftnlen), umat_abaqus__(
	    char *, integer *, integer *, integer *, doublereal *, doublereal 
	    *, doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     doublereal *, doublereal *, integer *, integer *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *,
	     integer *, doublereal *, doublereal *, integer *, integer *, 
	    doublereal *, integer *, integer *, ftnlen), 
	    umat_abaqusnl_total__(char *, integer *, integer *, integer *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     doublereal *, doublereal *, doublereal *, doublereal *, integer *
	    , integer *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     integer *, integer *, doublereal *, integer *, integer *, ftnlen)
	    , umat_single_crystal__(char *, integer *, integer *, integer *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     doublereal *, doublereal *, doublereal *, doublereal *, integer *
	    , integer *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     ftnlen), exit_(integer *), umat_undo_nlgeom_lin_iso_el__(char *, 
	    integer *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     doublereal *, doublereal *, integer *, integer *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *,
	     integer *, doublereal *, doublereal *, doublereal *, integer *, 
	    ftnlen), umat_abaqusnl__(char *, integer *, integer *, integer *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     doublereal *, doublereal *, doublereal *, doublereal *, integer *
	    , integer *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     integer *, integer *, doublereal *, integer *, integer *, ftnlen)
	    , umat_ideal_gas__(char *, integer *, integer *, integer *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     doublereal *, doublereal *, doublereal *, doublereal *, integer *
	    , integer *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     doublereal *, ftnlen), umat_compression_only__(char *, integer *,
	     integer *, integer *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, doublereal *, doublereal *, doublereal *,
	     doublereal *, integer *, integer *, integer *, integer *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     doublereal *, doublereal *, ftnlen);
    char amatloc[80];
    extern /* Subroutine */ int umat_ciarlet_el__(char *, integer *, integer *
	    , integer *, doublereal *, doublereal *, doublereal *, doublereal 
	    *, doublereal *, doublereal *, doublereal *, doublereal *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *,
	     integer *, integer *, integer *, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, integer *, doublereal *,
	     doublereal *, ftnlen), umat_lin_iso_el__(char *, integer *, 
	    integer *, integer *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, doublereal *, doublereal *, doublereal *,
	     doublereal *, integer *, integer *, integer *, integer *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     doublereal *, doublereal *, ftnlen), umat_aniso_plas__(char *, 
	    integer *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     doublereal *, doublereal *, integer *, integer *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *,
	     integer *, doublereal *, doublereal *, integer *, doublereal *, 
	    ftnlen);

    /* Fortran I/O blocks */
    static cilist io___2 = { 0, 6, 0, 0, 0 };
    static cilist io___3 = { 0, 6, 0, 0, 0 };



/*     calculates stiffness and stresses for a user defined material */
/*     law */






    /* Parameter adjustments */
    --elconloc;
    --emec;
    --emec0;
    --beta;
    xikl -= 4;
    xkl -= 4;
    --ithermal;
    --mi;
    xstate_dim1 = *nstate___;
    xstate_dim2 = mi[1];
    xstate_offset = 1 + xstate_dim1 * (1 + xstate_dim2);
    xstate -= xstate_offset;
    xstateini_dim1 = *nstate___;
    xstateini_dim2 = mi[1];
    xstateini_offset = 1 + xstateini_dim1 * (1 + xstateini_dim2);
    xstateini -= xstateini_offset;
    --stre;
    --stiff;
    --pgauss;
    orab -= 8;
    --ipkon;
    --iperturb;
    --eloc;
    --physcon;

    /* Function Body */
    if (s_cmp(amat, "ABAQUSNL", (ftnlen)8, (ftnlen)8) == 0) {
	s_copy(amatloc, amat + 8, (ftnlen)72, (ftnlen)72);
	s_copy(amatloc + 72, "        ", (ftnlen)8, (ftnlen)8);
	umat_abaqusnl__(amatloc, iel, iint, kode, &elconloc[1], &emec[1], &
		emec0[1], &beta[1], &xikl[4], vij, &xkl[4], vj, &ithermal[1], 
		t1l, dtime, time, ttime, icmd, ielas, &mi[1], nstate___, &
		xstateini[xstateini_offset], &xstate[xstate_offset], &stre[1],
		 &stiff[1], iorien, &pgauss[1], &orab[8], istep, iinc, pnewdt,
		 nmethod, &iperturb[1], (ftnlen)80);

    } else if (s_cmp(amat, "@ABAQUSNL", (ftnlen)9, (ftnlen)9) == 0) {

	umat_abaqusnl__(amat, iel, iint, kode, &elconloc[1], &emec[1], &emec0[
		1], &beta[1], &xikl[4], vij, &xkl[4], vj, &ithermal[1], t1l, 
		dtime, time, ttime, icmd, ielas, &mi[1], nstate___, &
		xstateini[xstateini_offset], &xstate[xstate_offset], &stre[1],
		 &stiff[1], iorien, &pgauss[1], &orab[8], istep, iinc, pnewdt,
		 nmethod, &iperturb[1], (ftnlen)80);

    } else if (s_cmp(amat, "ABAQUS", (ftnlen)6, (ftnlen)6) == 0) {

	s_copy(amatloc, amat + 6, (ftnlen)74, (ftnlen)74);
	s_copy(amatloc + 74, "      ", (ftnlen)6, (ftnlen)6);
	umat_abaqus__(amatloc, iel, iint, kode, &elconloc[1], &emec[1], &
		emec0[1], &beta[1], &xikl[4], vij, &xkl[4], vj, &ithermal[1], 
		t1l, dtime, time, ttime, icmd, ielas, &mi[1], nstate___, &
		xstateini[xstateini_offset], &xstate[xstate_offset], &stre[1],
		 &stiff[1], iorien, &pgauss[1], &orab[8], istep, iinc, pnewdt,
		 nmethod, &iperturb[1], (ftnlen)80);

    } else if (s_cmp(amat, "@ABAQUS", (ftnlen)7, (ftnlen)7) == 0) {
	umat_abaqus__(amat, iel, iint, kode, &elconloc[1], &emec[1], &emec0[1]
		, &beta[1], &xikl[4], vij, &xkl[4], vj, &ithermal[1], t1l, 
		dtime, time, ttime, icmd, ielas, &mi[1], nstate___, &
		xstateini[xstateini_offset], &xstate[xstate_offset], &stre[1],
		 &stiff[1], iorien, &pgauss[1], &orab[8], istep, iinc, pnewdt,
		 nmethod, &iperturb[1], (ftnlen)80);

    } else if (s_cmp(amat, "ANISO_PLAS", (ftnlen)10, (ftnlen)10) == 0) {

	s_copy(amatloc, amat + 10, (ftnlen)70, (ftnlen)70);
	s_copy(amatloc + 70, "          ", (ftnlen)10, (ftnlen)10);
	umat_aniso_plas__(amatloc, iel, iint, kode, &elconloc[1], &emec[1], &
		emec0[1], &beta[1], &xikl[4], vij, &xkl[4], vj, &ithermal[1], 
		t1l, dtime, time, ttime, icmd, ielas, &mi[1], nstate___, &
		xstateini[xstateini_offset], &xstate[xstate_offset], &stre[1],
		 &stiff[1], iorien, &pgauss[1], &orab[8], nmethod, pnewdt, (
		ftnlen)80);

    } else if (s_cmp(amat, "ANISO_CREEP", (ftnlen)11, (ftnlen)11) == 0) {

	s_copy(amatloc, amat + 11, (ftnlen)69, (ftnlen)69);
	s_copy(amatloc + 69, "           ", (ftnlen)11, (ftnlen)11);
	umat_aniso_creep__(amatloc, iel, iint, kode, &elconloc[1], &emec[1], &
		emec0[1], &beta[1], &xikl[4], vij, &xkl[4], vj, &ithermal[1], 
		t1l, dtime, time, ttime, icmd, ielas, &mi[1], nstate___, &
		xstateini[xstateini_offset], &xstate[xstate_offset], &stre[1],
		 &stiff[1], iorien, &pgauss[1], &orab[8], nmethod, pnewdt, 
		depvisc, (ftnlen)80);

    } else if (s_cmp(amat, "CIARLET_EL", (ftnlen)10, (ftnlen)10) == 0) {

	s_copy(amatloc, amat + 10, (ftnlen)70, (ftnlen)70);
	s_copy(amatloc + 70, "          ", (ftnlen)10, (ftnlen)10);
	umat_ciarlet_el__(amatloc, iel, iint, kode, &elconloc[1], &emec[1], &
		emec0[1], &beta[1], &xikl[4], vij, &xkl[4], vj, &ithermal[1], 
		t1l, dtime, time, ttime, icmd, ielas, &mi[1], nstate___, &
		xstateini[xstateini_offset], &xstate[xstate_offset], &stre[1],
		 &stiff[1], iorien, &pgauss[1], &orab[8], (ftnlen)80);

    } else if (s_cmp(amat, "COMPRESSION_ONLY", (ftnlen)16, (ftnlen)16) == 0) {

	s_copy(amatloc, amat + 16, (ftnlen)64, (ftnlen)64);
	s_copy(amatloc + 64, "                ", (ftnlen)16, (ftnlen)16);
	umat_compression_only__(amatloc, iel, iint, kode, &elconloc[1], &emec[
		1], &emec0[1], &beta[1], &xikl[4], vij, &xkl[4], vj, &
		ithermal[1], t1l, dtime, time, ttime, icmd, ielas, &mi[1], 
		nstate___, &xstateini[xstateini_offset], &xstate[
		xstate_offset], &stre[1], &stiff[1], iorien, &pgauss[1], &
		orab[8], (ftnlen)80);

    } else if (s_cmp(amat, "ELASTIC_FIBER", (ftnlen)13, (ftnlen)13) == 0) {

	s_copy(amatloc, amat + 13, (ftnlen)67, (ftnlen)67);
	s_copy(amatloc + 67, "             ", (ftnlen)13, (ftnlen)13);
	umat_elastic_fiber__(amat + 13, iel, iint, kode, &elconloc[1], &emec[
		1], &emec0[1], &beta[1], &xikl[4], vij, &xkl[4], vj, &
		ithermal[1], t1l, dtime, time, ttime, icmd, ielas, &mi[1], 
		nstate___, &xstateini[xstateini_offset], &xstate[
		xstate_offset], &stre[1], &stiff[1], iorien, &pgauss[1], &
		orab[8], (ftnlen)67);

    } else if (s_cmp(amat, "JOHNSONCOOK", (ftnlen)11, (ftnlen)11) == 0) {

	umat_abaqusnl_total__(amat, iel, iint, kode, &elconloc[1], &emec[1], &
		emec0[1], &beta[1], &xikl[4], vij, &xkl[4], vj, &ithermal[1], 
		t1l, dtime, time, ttime, icmd, ielas, &mi[1], nstate___, &
		xstateini[xstateini_offset], &xstate[xstate_offset], &stre[1],
		 &stiff[1], iorien, &pgauss[1], &orab[8], istep, iinc, pnewdt,
		 nmethod, &iperturb[1], (ftnlen)80);

    } else if (s_cmp(amat, "LIN_EL_COROT", (ftnlen)12, (ftnlen)12) == 0) {

	s_copy(amatloc, amat + 12, (ftnlen)68, (ftnlen)68);
	s_copy(amatloc + 68, "            ", (ftnlen)12, (ftnlen)12);
	umat_lin_el_corot__(amatloc, iel, iint, kode, &elconloc[1], &emec[1], 
		&emec0[1], &beta[1], &xikl[4], vij, &xkl[4], vj, &ithermal[1],
		 t1l, dtime, time, ttime, icmd, ielas, &mi[1], nstate___, &
		xstateini[xstateini_offset], &xstate[xstate_offset], &stre[1],
		 &stiff[1], iorien, &pgauss[1], &orab[8], &eloc[1], 
		nlgeom_undo__, (ftnlen)80);

    } else if (s_cmp(amat, "LIN_ISO_EL", (ftnlen)10, (ftnlen)10) == 0) {

	s_copy(amatloc, amat + 10, (ftnlen)70, (ftnlen)70);
	s_copy(amatloc + 70, "          ", (ftnlen)10, (ftnlen)10);
	umat_lin_iso_el__(amatloc, iel, iint, kode, &elconloc[1], &emec[1], &
		emec0[1], &beta[1], &xikl[4], vij, &xkl[4], vj, &ithermal[1], 
		t1l, dtime, time, ttime, icmd, ielas, &mi[1], nstate___, &
		xstateini[xstateini_offset], &xstate[xstate_offset], &stre[1],
		 &stiff[1], iorien, &pgauss[1], &orab[8], (ftnlen)80);

    } else if (s_cmp(amat, "IDEAL_GAS", (ftnlen)9, (ftnlen)9) == 0) {

	s_copy(amatloc, amat + 9, (ftnlen)71, (ftnlen)71);
	s_copy(amatloc + 71, "          ", (ftnlen)9, (ftnlen)10);
	umat_ideal_gas__(amatloc, iel, iint, kode, &elconloc[1], &emec[1], &
		emec0[1], &beta[1], &xikl[4], vij, &xkl[4], vj, &ithermal[1], 
		t1l, dtime, time, ttime, icmd, ielas, &mi[1], nstate___, &
		xstateini[xstateini_offset], &xstate[xstate_offset], &stre[1],
		 &stiff[1], iorien, &pgauss[1], &orab[8], &physcon[1], (
		ftnlen)80);

    } else if (s_cmp(amat, "SINGLE_CRYSTAL_CREEP", (ftnlen)20, (ftnlen)20) == 
	    0) {

	s_copy(amatloc, amat + 20, (ftnlen)60, (ftnlen)60);
	s_copy(amatloc + 60, "                    ", (ftnlen)20, (ftnlen)20);
	umat_single_crystal_creep__(amatloc, iel, iint, kode, &elconloc[1], &
		emec[1], &emec0[1], &beta[1], &xikl[4], vij, &xkl[4], vj, &
		ithermal[1], t1l, dtime, time, ttime, icmd, ielas, &mi[1], 
		nstate___, &xstateini[xstateini_offset], &xstate[
		xstate_offset], &stre[1], &stiff[1], iorien, &pgauss[1], &
		orab[8], pnewdt, (ftnlen)80);

    } else if (s_cmp(amat, "SINGLE_CRYSTAL", (ftnlen)14, (ftnlen)14) == 0) {

	s_copy(amatloc, amat + 14, (ftnlen)66, (ftnlen)66);
	s_copy(amatloc + 66, "              ", (ftnlen)14, (ftnlen)14);
	umat_single_crystal__(amatloc, iel, iint, kode, &elconloc[1], &emec[1]
		, &emec0[1], &beta[1], &xikl[4], vij, &xkl[4], vj, &ithermal[
		1], t1l, dtime, time, ttime, icmd, ielas, &mi[1], nstate___, &
		xstateini[xstateini_offset], &xstate[xstate_offset], &stre[1],
		 &stiff[1], iorien, &pgauss[1], &orab[8], (ftnlen)80);

    } else if (s_cmp(amat, "TENSION_ONLY", (ftnlen)12, (ftnlen)12) == 0) {

	s_copy(amatloc, amat + 12, (ftnlen)68, (ftnlen)68);
	s_copy(amatloc + 68, "            ", (ftnlen)12, (ftnlen)12);
	umat_tension_only__(amatloc, iel, iint, kode, &elconloc[1], &emec[1], 
		&emec0[1], &beta[1], &xikl[4], vij, &xkl[4], vj, &ithermal[1],
		 t1l, dtime, time, ttime, icmd, ielas, &mi[1], nstate___, &
		xstateini[xstateini_offset], &xstate[xstate_offset], &stre[1],
		 &stiff[1], iorien, &pgauss[1], &orab[8], (ftnlen)80);

    } else if (s_cmp(amat, "USER", (ftnlen)4, (ftnlen)4) == 0) {

	s_copy(amatloc, amat + 4, (ftnlen)76, (ftnlen)76);
	s_copy(amatloc + 76, "    ", (ftnlen)4, (ftnlen)4);
	umat_user__(amatloc, iel, iint, kode, &elconloc[1], &emec[1], &emec0[
		1], &beta[1], &xikl[4], vij, &xkl[4], vj, &ithermal[1], t1l, 
		dtime, time, ttime, icmd, ielas, &mi[1], nstate___, &
		xstateini[xstateini_offset], &xstate[xstate_offset], &stre[1],
		 &stiff[1], iorien, &pgauss[1], &orab[8], pnewdt, &ipkon[1], (
		ftnlen)80);

    } else if (s_cmp(amat, "UNDO_NLGEOM_LIN_EL", (ftnlen)18, (ftnlen)18) == 0)
	     {

	s_copy(amatloc, amat + 18, (ftnlen)62, (ftnlen)62);
	s_copy(amatloc + 62, "                  ", (ftnlen)18, (ftnlen)18);
	umat_undo_nlgeom_lin_el__(amatloc, iel, iint, kode, &elconloc[1], &
		emec[1], &emec0[1], &beta[1], &xikl[4], vij, &xkl[4], vj, &
		ithermal[1], t1l, dtime, time, ttime, icmd, ielas, &mi[1], 
		nstate___, &xstateini[xstateini_offset], &xstate[
		xstate_offset], &stre[1], &stiff[1], iorien, &pgauss[1], &
		orab[8], &eloc[1], nlgeom_undo__, ncmat___, (ftnlen)80);

    } else if (s_cmp(amat, "UNDO_NLGEOM_LIN_ISO_EL", (ftnlen)22, (ftnlen)22) 
	    == 0) {

	s_copy(amatloc, amat + 22, (ftnlen)58, (ftnlen)58);
	s_copy(amatloc + 58, "                      ", (ftnlen)22, (ftnlen)22)
		;
	umat_undo_nlgeom_lin_iso_el__(amatloc, iel, iint, kode, &elconloc[1], 
		&emec[1], &emec0[1], &beta[1], &xikl[4], vij, &xkl[4], vj, &
		ithermal[1], t1l, dtime, time, ttime, icmd, ielas, &mi[1], 
		nstate___, &xstateini[xstateini_offset], &xstate[
		xstate_offset], &stre[1], &stiff[1], iorien, &pgauss[1], &
		orab[8], &eloc[1], nlgeom_undo__, (ftnlen)80);

    } else if (*(unsigned char *)amat == '@') {

	call_external_umat_user__(amat, iel, iint, kode, &elconloc[1], &emec[
		1], &emec0[1], &beta[1], &xikl[4], vij, &xkl[4], vj, &
		ithermal[1], t1l, dtime, time, ttime, icmd, ielas, &mi[1], 
		nstate___, &xstateini[xstateini_offset], &xstate[
		xstate_offset], &stre[1], &stiff[1], iorien, &pgauss[1], &
		orab[8], pnewdt, &ipkon[1], (ftnlen)80);
    } else {
	s_wsle(&io___2);
	do_lio(&c__9, &c__1, "*ERROR in umat: no user material subroutine", (
		ftnlen)43);
	e_wsle();
	s_wsle(&io___3);
	do_lio(&c__9, &c__1, "       defined for material ", (ftnlen)28);
	do_lio(&c__9, &c__1, amat, (ftnlen)80);
	e_wsle();
	exit_(&c__201);
    }

    return 0;
} /* umat_main__ */

