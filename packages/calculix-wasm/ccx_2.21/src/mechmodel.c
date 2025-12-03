/* mechmodel.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int mechmodel_(doublereal *elconloc, doublereal *elas, 
	doublereal *emec, integer *kode, doublereal *emec0, integer *ithermal,
	 integer *icmd, doublereal *beta, doublereal *stre, doublereal *xkl, 
	doublereal *ckl, doublereal *vj, doublereal *xikl, doublereal *vij, 
	doublereal *plconloc, doublereal *xstate, doublereal *xstateini, 
	integer *ielas, char *amat, doublereal *t1l, doublereal *dtime, 
	doublereal *time, doublereal *ttime, integer *iel, integer *iint, 
	integer *nstate___, integer *mi, integer *iorien, doublereal *pgauss, 
	doublereal *orab, doublereal *eloc, integer *mattyp, doublereal *
	pnewdt, integer *istep, integer *iinc, integer *ipkon, integer *
	nmethod, integer *iperturb, doublereal *depvisc, integer *
	nlgeom_undo__, doublereal *physcon, integer *ncmat___, ftnlen 
	amat_len)
{
    /* System generated locals */
    integer xstate_dim1, xstate_dim2, xstate_offset, xstateini_dim1, 
	    xstateini_dim2, xstateini_offset;

    /* Local variables */
    extern /* Subroutine */ int umat_main__(char *, integer *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *,
	     doublereal *, doublereal *, doublereal *, doublereal *, integer *
	    , doublereal *, doublereal *, doublereal *, doublereal *, integer 
	    *, integer *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     doublereal *, integer *, integer *, integer *, integer *, 
	    integer *, doublereal *, doublereal *, integer *, doublereal *, 
	    integer *, ftnlen), incplas_lin__(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     integer *, doublereal *, doublereal *, doublereal *, integer *, 
	    integer *, char *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, integer *, integer *, integer *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     ftnlen), mohrcoulomb_(doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, integer *, doublereal *,
	     doublereal *, integer *, doublereal *, doublereal *, doublereal *
	    , integer *, integer *, integer *, integer *, doublereal *);
    doublereal didc[27], dldc[27], dudc[9];
    extern /* Subroutine */ int umat_abaqusnl_total__(char *, integer *, 
	    integer *, integer *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, doublereal *, doublereal *, doublereal *,
	     doublereal *, integer *, integer *, integer *, integer *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     doublereal *, doublereal *, integer *, integer *, doublereal *, 
	    integer *, integer *, ftnlen);
    doublereal dibdc[27], d2idc2[243], dlbdc[27], d2ldc2[243], d2udc2[81];
    extern /* Subroutine */ int linel_(integer *, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     doublereal *, doublereal *, integer *);
    doublereal d2ibdc2[243], d2lbdc2[243];
    extern /* Subroutine */ int rubber_(doublereal *, doublereal *, 
	    doublereal *, integer *, doublereal *, doublereal *, doublereal *,
	     doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, integer *, integer *, 
	    doublereal *, doublereal *, integer *), incplas_(doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, integer *, integer *, char *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, integer *, integer *, 
	    integer *, integer *, doublereal *, doublereal *, integer *, 
	    doublereal *, doublereal *, ftnlen);


/*     kode=-1: Arruda-Boyce */
/*          -2: Mooney-Rivlin */
/*          -3: Neo-Hooke */
/*          -4: Ogden (N=1) */
/*          -5: Ogden (N=2) */
/*          -6: Ogden (N=3) */
/*          -7: Polynomial (N=1) */
/*          -8: Polynomial (N=2) */
/*          -9: Polynomial (N=3) */
/*          -10: Reduced Polynomial (N=1) */
/*          -11: Reduced Polynomial (N=2) */
/*          -12: Reduced Polynomial (N=3) */
/*          -13: Van der Waals (not implemented yet) */
/*          -14: Yeoh */
/*          -15: Hyperfoam (N=1) */
/*          -16: Hyperfoam (N=2) */
/*          -17: Hyperfoam (N=3) */
/*          -50: deformation plasticity */
/*          -51: incremental plasticity (no viscosity) */
/*          -52: viscoplasticity */
/*          -53: Mohr-Coulomb plasticity */
/*       < -100: user material routine with -kode-100 user */
/*               defined constants with keyword *USER MATERIAL */






    /* Parameter adjustments */
    --elconloc;
    --elas;
    --emec;
    --emec0;
    --ithermal;
    --beta;
    --stre;
    --xkl;
    --ckl;
    --xikl;
    --plconloc;
    --mi;
    xstateini_dim1 = *nstate___;
    xstateini_dim2 = mi[1];
    xstateini_offset = 1 + xstateini_dim1 * (1 + xstateini_dim2);
    xstateini -= xstateini_offset;
    xstate_dim1 = *nstate___;
    xstate_dim2 = mi[1];
    xstate_offset = 1 + xstate_dim1 * (1 + xstate_dim2);
    xstate -= xstate_offset;
    --pgauss;
    orab -= 8;
    --eloc;
    --ipkon;
    --iperturb;
    --physcon;

    /* Function Body */
    if (*kode > 0) {
	linel_(kode, mattyp, &beta[1], &emec[1], &stre[1], &elas[1], &
		elconloc[1], iorien, &orab[8], &pgauss[1], ncmat___);
    } else if (*kode > -50) {
	*mattyp = 3;
	rubber_(&elconloc[1], &elas[1], &emec[1], kode, didc, d2idc2, dibdc, 
		d2ibdc2, dudc, d2udc2, dldc, d2ldc2, dlbdc, d2lbdc2, &
		ithermal[1], icmd, &beta[1], &stre[1], ncmat___);
    } else if (*kode == -50) {
	*mattyp = 3;
/*         call defplas(elconloc,elas,emec,ithermal,icmd,beta,stre, */
/*     &     ckl,vj,xstate,nstate_,iel,iint,mi) */
	umat_abaqusnl_total__(amat, iel, iint, kode, &elconloc[1], &emec[1], &
		emec0[1], &beta[1], &xikl[1], vij, &xkl[1], vj, &ithermal[1], 
		t1l, dtime, time, ttime, icmd, ielas, &mi[1], nstate___, &
		xstateini[xstateini_offset], &xstate[xstate_offset], &stre[1],
		 &elas[1], iorien, &pgauss[1], &orab[8], istep, iinc, pnewdt, 
		nmethod, &iperturb[1], (ftnlen)80);
    } else if (*kode == -51 || *kode == -52) {
	*mattyp = 3;
	if (iperturb[2] == 1) {
	    incplas_(&elconloc[1], &plconloc[1], &xstate[xstate_offset], &
		    xstateini[xstateini_offset], &elas[1], &emec[1], &
		    ithermal[1], icmd, &beta[1], &stre[1], vj, kode, ielas, 
		    amat, t1l, dtime, time, ttime, iel, iint, nstate___, &mi[
		    1], &eloc[1], &pgauss[1], nmethod, pnewdt, depvisc, (
		    ftnlen)80);
	} else {
	    incplas_lin__(&elconloc[1], &plconloc[1], &xstate[xstate_offset], 
		    &xstateini[xstateini_offset], &elas[1], &emec[1], &
		    ithermal[1], icmd, &beta[1], &stre[1], vj, kode, ielas, 
		    amat, t1l, dtime, time, ttime, iel, iint, nstate___, &mi[
		    1], &eloc[1], &pgauss[1], nmethod, pnewdt, depvisc, (
		    ftnlen)80);
	}
    } else if (*kode == -53) {
	*mattyp = 3;
	mohrcoulomb_(&elconloc[1], &plconloc[1], &xstate[xstate_offset], &
		xstateini[xstateini_offset], &elas[1], &emec[1], icmd, &beta[
		1], &stre[1], ielas, dtime, time, ttime, iel, iint, nstate___,
		 &mi[1], pnewdt);
    } else {
	*mattyp = 3;
	umat_main__(amat, iel, iint, kode, &elconloc[1], &emec[1], &emec0[1], 
		&beta[1], &xikl[1], vij, &xkl[1], vj, &ithermal[1], t1l, 
		dtime, time, ttime, icmd, ielas, &mi[1], nstate___, &
		xstateini[xstateini_offset], &xstate[xstate_offset], &stre[1],
		 &elas[1], iorien, &pgauss[1], &orab[8], pnewdt, istep, iinc, 
		&ipkon[1], nmethod, &iperturb[1], depvisc, &eloc[1], 
		nlgeom_undo__, &physcon[1], ncmat___, (ftnlen)80);
    }

    return 0;
} /* mechmodel_ */

