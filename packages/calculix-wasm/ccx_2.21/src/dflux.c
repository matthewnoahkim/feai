/* dflux.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int dflux_(doublereal *flux, doublereal *sol, integer *kstep,
	 integer *kinc, doublereal *time, integer *noel, integer *npt, 
	doublereal *coords, integer *jltyp, doublereal *temp, doublereal *
	press, char *loadtype, doublereal *area, doublereal *vold, doublereal 
	*co, char *lakonl, integer *konl, integer *ipompc, integer *nodempc, 
	doublereal *coefmpc, integer *nmpc, integer *ikmpc, integer *ilmpc, 
	integer *iscale, integer *mi, doublereal *sti, doublereal *xstateini, 
	doublereal *xstate, integer *nstate___, doublereal *dtime, ftnlen 
	loadtype_len, ftnlen lakonl_len)
{
    /* System generated locals */
    integer vold_dim1, vold_offset, sti_dim2, sti_offset, xstate_dim1, 
	    xstate_dim2, xstate_offset, xstateini_dim1, xstateini_dim2, 
	    xstateini_offset;


/*     user subroutine dflux */


/*     INPUT: */

/*     sol                current temperature value */
/*     kstep              step number */
/*     kinc               increment number */
/*     time(1)            current step time */
/*     time(2)            current total time */
/*     noel               element number */
/*     npt                integration point number */
/*     coords(1..3)       global coordinates of the integration point */
/*     jltyp              loading face kode: */
/*                        1  = body flux */
/*                        11 = face 1 */
/*                        12 = face 2 */
/*                        13 = face 3 */
/*                        14 = face 4 */
/*                        15 = face 5 */
/*                        16 = face 6 */
/*     temp               currently not used */
/*     press              currently not used */
/*     loadtype           load type label */
/*     area               for surface flux: area covered by the */
/*                            integration point */
/*                        for body flux: volume covered by the */
/*                            integration point */
/*     vold(0..4,1..nk)   solution field in all nodes */
/*                        0: temperature */
/*                        1: displacement in global x-direction */
/*                        2: displacement in global y-direction */
/*                        3: displacement in global z-direction */
/*                        4: static pressure */
/*     co(3,1..nk)        coordinates of all nodes */
/*                        1: coordinate in global x-direction */
/*                        2: coordinate in global y-direction */
/*                        3: coordinate in global z-direction */
/*     lakonl             element label */
/*     konl(1..20)        nodes belonging to the element */
/*     ipompc(1..nmpc))   ipompc(i) points to the first term of */
/*                        MPC i in field nodempc */
/*     nodempc(1,*)       node number of a MPC term */
/*     nodempc(2,*)       coordinate direction of a MPC term */
/*     nodempc(3,*)       if not 0: points towards the next term */
/*                                  of the MPC in field nodempc */
/*                        if 0: MPC definition is finished */
/*     coefmpc(*)         coefficient of a MPC term */
/*     nmpc               number of MPC's */
/*     ikmpc(1..nmpc)     ordered global degrees of freedom of the MPC's */
/*                        the global degree of freedom is */
/*                        8*(node-1)+direction of the dependent term of */
/*                        the MPC (direction = 0: temperature; */
/*                        1-3: displacements; 4: static pressure; */
/*                        5-7: rotations) */
/*     ilmpc(1..nmpc)     ilmpc(i) is the MPC number corresponding */
/*                        to the reference number in ikmpc(i) */
/*     mi(1)              max # of integration points per element (max */
/*                        over all elements) */
/*     mi(2)              max degree of freedomm per node (max over all */
/*                        nodes) in fields like v(0:mi(2))... */
/*     sti(i,j,k)         actual Cauchy stress component i at integration */
/*                        point j in element k. The components are */
/*                        in the order xx,yy,zz,xy,xz,yz */
/*     xstateini(i,j,k)   value of the state variable i at integration */
/*                        point j in element k at the beginning of the */
/*                        present increment */
/*     xstate(i,j,k)   value of the state variable i at integration */
/*                        point j in element k at the end of the */
/*                        present increment */
/*     nstate_            number of state variables */
/*     dtime              time length of the increment */


/*     OUTPUT: */

/*     flux(1)            magnitude of the flux */
/*     flux(2)            not used; please do NOT assign any value */
/*     iscale             determines whether the flux has to be */
/*                        scaled for increments smaller than the */
/*                        step time in static calculations */
/*                        0: no scaling */
/*                        1: scaling (default) */







/*     Start of your own code. */

/*     example: heat generation due to plasticity for an isotropic */
/*              material */

/*     the plastic strain tensor is stored in state variables 2...7 */


    /* Parameter adjustments */
    --flux;
    --time;
    --coords;
    co -= 4;
    --konl;
    --ipompc;
    nodempc -= 4;
    --coefmpc;
    --ikmpc;
    --ilmpc;
    --mi;
    sti_dim2 = mi[1];
    sti_offset = 1 + 6 * (1 + sti_dim2);
    sti -= sti_offset;
    vold_dim1 = mi[2] - 0 + 1;
    vold_offset = 0 + vold_dim1;
    vold -= vold_offset;
    xstate_dim1 = *nstate___;
    xstate_dim2 = mi[1];
    xstate_offset = 1 + xstate_dim1 * (1 + xstate_dim2);
    xstate -= xstate_offset;
    xstateini_dim1 = *nstate___;
    xstateini_dim2 = mi[1];
    xstateini_offset = 1 + xstateini_dim1 * (1 + xstateini_dim2);
    xstateini -= xstateini_offset;

    /* Function Body */
    flux[1] = (sti[(*npt + *noel * sti_dim2) * 6 + 1] * (xstate[(*npt + *noel 
	    * xstate_dim2) * xstate_dim1 + 2] - xstateini[(*npt + *noel * 
	    xstateini_dim2) * xstateini_dim1 + 2]) + sti[(*npt + *noel * 
	    sti_dim2) * 6 + 2] * (xstate[(*npt + *noel * xstate_dim2) * 
	    xstate_dim1 + 3] - xstateini[(*npt + *noel * xstateini_dim2) * 
	    xstateini_dim1 + 3]) + sti[(*npt + *noel * sti_dim2) * 6 + 3] * (
	    xstate[(*npt + *noel * xstate_dim2) * xstate_dim1 + 4] - 
	    xstateini[(*npt + *noel * xstateini_dim2) * xstateini_dim1 + 4]) 
	    + (sti[(*npt + *noel * sti_dim2) * 6 + 4] * (xstate[(*npt + *noel 
	    * xstate_dim2) * xstate_dim1 + 5] - xstateini[(*npt + *noel * 
	    xstateini_dim2) * xstateini_dim1 + 5]) + sti[(*npt + *noel * 
	    sti_dim2) * 6 + 5] * (xstate[(*npt + *noel * xstate_dim2) * 
	    xstate_dim1 + 6] - xstateini[(*npt + *noel * xstateini_dim2) * 
	    xstateini_dim1 + 6]) + sti[(*npt + *noel * sti_dim2) * 6 + 6] * (
	    xstate[(*npt + *noel * xstate_dim2) * xstate_dim1 + 7] - 
	    xstateini[(*npt + *noel * xstateini_dim2) * xstateini_dim1 + 7])) 
	    * 2.) / *dtime;

    return 0;
} /* dflux_ */

