/* umat_user.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int umat_user__(char *amat, integer *iel, integer *iint, 
	integer *kode, doublereal *elconloc, doublereal *emec, doublereal *
	emec0, doublereal *beta, doublereal *xokl, doublereal *voj, 
	doublereal *xkl, doublereal *vj, integer *ithermal, doublereal *t1l, 
	doublereal *dtime, doublereal *time, doublereal *ttime, integer *icmd,
	 integer *ielas, integer *mi, integer *nstate___, doublereal *
	xstateini, doublereal *xstate, doublereal *stre, doublereal *stiff, 
	integer *iorien, doublereal *pgauss, doublereal *orab, doublereal *
	pnewdt, integer *ipkon, ftnlen amat_len)
{
    /* System generated locals */
    integer xstate_dim1, xstate_dim2, xstate_offset, xstateini_dim1, 
	    xstateini_dim2, xstateini_offset;


/*     calculates stiffness and stresses for a user defined material */
/*     law */

/*     icmd=3: calculates stress at mechanical strain */
/*     else: calculates stress at mechanical strain and the stiffness */
/*           matrix */

/*     INPUT: */

/*     amat               material name */
/*     iel                element number */
/*     iint               integration point number */

/*     kode               material type (-100-#of constants entered */
/*                        under *USER MATERIAL): can be used for materials */
/*                        with varying number of constants */

/*     elconloc(*)        user defined constants defined by the keyword */
/*                        card *USER MATERIAL (actual # = */
/*                        -kode-100), interpolated for the */
/*                        actual temperature t1l */

/*     emec(6)            Lagrange mechanical strain tensor (component order: */
/*                        11,22,33,12,13,23) at the end of the increment */
/*                        (thermal strains are subtracted) */
/*     emec0(6)           Lagrange mechanical strain tensor at the start of the */
/*                        increment (thermal strains are subtracted) */
/*     beta(6)            residual stress tensor (the stress entered under */
/*                        the keyword *INITIAL CONDITIONS,TYPE=STRESS) */

/*     xokl(3,3)          deformation gradient at the start of the increment */
/*     voj                Jacobian at the start of the increment */
/*     xkl(3,3)           deformation gradient at the end of the increment */
/*     vj                 Jacobian at the end of the increment */

/*     ithermal           0: no thermal effects are taken into account */
/*                        >0: thermal effects are taken into account (triggered */
/*                        by the keyword *INITIAL CONDITIONS,TYPE=TEMPERATURE) */
/*     t1l                temperature at the end of the increment */
/*     dtime              time length of the increment */
/*     time               step time at the end of the current increment */
/*     ttime              total time at the start of the current step */

/*     icmd               not equal to 3: calculate stress and stiffness */
/*                        3: calculate only stress */
/*     ielas              0: no elastic iteration: irreversible effects */
/*                        are allowed */
/*                        1: elastic iteration, i.e. no irreversible */
/*                           deformation allowed */

/*     mi(1)              max. # of integration points per element in the */
/*                        model */
/*     nstate_            max. # of state variables in the model */

/*     xstateini(nstate_,mi(1),# of elements) */
/*                        state variables at the start of the increment */
/*     xstate(nstate_,mi(1),# of elements) */
/*                        state variables at the end of the increment */

/*     stre(6)            Piola-Kirchhoff stress of the second kind */
/*                        at the start of the increment */

/*     iorien             number of the local coordinate axis system */
/*                        in the integration point at stake (takes the value */
/*                        0 if no local system applies) */
/*     pgauss(3)          global coordinates of the integration point */
/*     orab(7,*)          description of all local coordinate systems. */
/*                        If a local coordinate system applies the global */
/*                        tensors can be obtained by premultiplying the local */
/*                        tensors with skl(3,3). skl is  determined by calling */
/*                        the subroutine transformatrix: */
/*                        call transformatrix(orab(1,iorien),pgauss,skl) */


/*     OUTPUT: */

/*     xstate(nstate_,mi(1),# of elements) */
/*                        updated state variables at the end of the increment */
/*     stre(6)            Piola-Kirchhoff stress of the second kind at the */
/*                        end of the increment */
/*     stiff(21):         consistent tangent stiffness matrix in the material */
/*                        frame of reference at the end of the increment. In */
/*                        other words: the derivative of the PK2 stress with */
/*                        respect to the Lagrangian strain tensor. The matrix */
/*                        is supposed to be symmetric, only the upper half is */
/*                        to be given in the same order as for a fully */
/*                        anisotropic elastic material (*ELASTIC,TYPE=ANISO). */
/*                        Notice that the matrix is an integral part of the */
/*                        fourth order material tensor, i.e. the Voigt notation */
/*                        is not used. */
/*     pnewdt             to be specified by the user if the material */
/*                        routine is unable to return the stiffness matrix */
/*                        and/or the stress due to divergence within the */
/*                        routine. pnewdt is the factor by which the time */
/*                        increment is to be multiplied in the next */
/*                        trial and should exceed zero but be less than 1. */
/*                        Default is -1 indicating that the user routine */
/*                        has converged. */
/*     ipkon(*)           ipkon(iel) points towards the position in field */
/*                        kon prior to the first node of the element's */
/*                        topology. If ipkon(iel) is smaller than 0, the */
/*                        element is not used. */






/*     insert here code to calculate the stresses */

    /* Parameter adjustments */
    --elconloc;
    --emec;
    --emec0;
    --beta;
    xokl -= 4;
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

    /* Function Body */
    if (*icmd != 3) {

/*        insert here code to calculate the stiffness matrix */

    }

    return 0;
} /* umat_user__ */

