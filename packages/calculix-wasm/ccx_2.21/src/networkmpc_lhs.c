/* networkmpc_lhs.f -- translated by f2c (version 20200916).
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
/*     Copyright (C) 1998-2023 Guido Dhondt */

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

/*     construction of the B matrix */

/* Subroutine */ int networkmpc_lhs__(integer *i__, integer *ipompc, integer *
	nodempc, doublereal *coefmpc, char *labmpc, doublereal *v, integer *
	nactdog, doublereal *ac, integer *j, integer *mi, integer *nteq, 
	integer *ipkon, integer *kon, char *lakon, integer *iponoel, integer *
	inoel, integer *ielprop, doublereal *prop, integer *ielmat, 
	doublereal *shcon, integer *nshcon, doublereal *rhcon, integer *
	nrhcon, integer *ntmat___, doublereal *cocon, integer *ncocon, ftnlen 
	labmpc_len, ftnlen lakon_len)
{
    /* System generated locals */
    integer ielmat_dim1, ielmat_offset, v_dim1, v_offset, ac_dim1, ac_offset, 
	    shcon_dim2, shcon_offset, rhcon_dim2, rhcon_offset, cocon_dim2, 
	    cocon_offset;

    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen), s_wsle(cilist *), do_lio(
	    integer *, integer *, char *, ftnlen), e_wsle(void);

    /* Local variables */
    integer node, idir;
    extern /* Subroutine */ int exit_(integer *);
    integer index;

    /* Fortran I/O blocks */
    static cilist io___4 = { 0, 6, 0, 0, 0 };
    static cilist io___5 = { 0, 6, 0, 0, 0 };



/*     user defined network mpc: calculation of the left hand */
/*     side */

/*     INPUT: */

/*     i                  MPC number */
/*     ipompc(1..nmpc))   ipompc(i) points to the first term of */
/*                        MPC i in field nodempc */
/*     nodempc(1,*)       node number of a MPC term */
/*     nodempc(2,*)       coordinate direction of a MPC term */
/*     nodempc(3,*)       if not 0: points towards the next term */
/*                                  of the MPC in field nodempc */
/*                        if 0: MPC definition is finished */
/*     coefmpc(*)         coefficient of a MPC term */
/*     labmpc(*)          label of the MPC. For user-defined */
/*                        network MPC's it starts with NETWORK; */
/*                        the remaining 13 characters can be used */
/*                        to distinguish between different kinds of */
/*                        network user MPC's */
/*     v(0..mi(2),1..nk)  actual solution field in all nodes */
/*                        0: total temperature */
/*                        1: mass flow */
/*                        2: total pressure */
/*     nactdog(j,i)       determines the network equation corresponding */
/*                        to degree of freedom j in node i; */
/*                        if zero the degree of freedom is not active */
/*     j                  network equation corresponding to the */
/*                        present MPC (i.e. MPC i) */
/*     mi(*)              field with global information; mi(2) is the */
/*                        highest variable number */
/*     nteq               number of network equations */
/*     ipkon(i)           points to the location in field kon preceding */
/*                        the topology of element i */
/*     kon(*)             contains the topology of all elements. The */
/*                        topology of element i starts at kon(ipkon(i)+1) */
/*                        and continues until all nodes are covered. The */
/*                        number of nodes depends on the element label */
/*     lakon(i)           contains the label of element i */
/*     iponoel(i)         the network elements to which node i belongs */
/*                        are stored in inoel(1,iponoel(i)), */
/*                        inoel(1,inoel(2,iponoel(i)))...... until */
/*                        inoel(2,inoel(2,inoel(2......)=0 */
/*     inoel(1..2,*)      field containing the network elements */
/*     ielprop(i)         points to the location in field prop preceding */
/*                        the properties of element i */
/*     prop(*)            contains the properties of all network elements. The */
/*                        properties of element i start at prop(ielprop(i)+1) */
/*                        and continues until all properties are covered. The */
/*                        appropriate amount of properties depends on the */
/*                        element label. The kind of properties, their */
/*                        number and their order corresponds */
/*                        to the description in the user's manual, */
/*                        cf. the sections "Fluid Section Types" */
/*     ielmat(j,i)        contains the material number for element i */
/*                        and layer j */
/*     shcon(0,j,i)       temperature at temperature point j of material i */
/*     shcon(1,j,i)       specific heat at constant pressure at the */
/*                        temperature point j of material i */
/*     shcon(2,j,i)       dynamic viscosity at the temperature point j of */
/*                        material i */
/*     shcon(3,1,i)       specific gas constant of material i */
/*     nshcon(i)          number of temperature data points for the specific */
/*                        heat of material i */
/*     rhcon(0,j,i)       temperature at density temperature point j of */
/*                        material i */
/*     rhcon(1,j,i)       density at the density temperature point j of */
/*                        material i */
/*     nrhcon(i)          number of temperature data points for the density */
/*                        of material i */
/*     ntmat_             maximum number of temperature data points for */
/*                        any material property for any material */
/*     ncocon(1,i)        number of conductivity constants for material i */
/*     ncocon(2,i)        number of temperature data points for the */
/*                        conductivity coefficients of material i */
/*     cocon(0,j,i)       temperature at conductivity temperature point */
/*                        j of material i */
/*     cocon(k,j,i)       conductivity coefficient k at conductivity */
/*                        temperature point j of material i */

/*     OUTPUT: */

/*     ac(*)              left hand side of the system of network */
/*                        equations; this routines should return the */
/*                        derivative of the network MPC at stake w.r.t. */
/*                        all active degrees of freedom occurring in the */
/*                        MPC and store them in row j of matrix ac. */







    /* Parameter adjustments */
    --ipompc;
    nodempc -= 4;
    --coefmpc;
    labmpc -= 20;
    nactdog -= 4;
    --mi;
    ielmat_dim1 = mi[3];
    ielmat_offset = 1 + ielmat_dim1;
    ielmat -= ielmat_offset;
    v_dim1 = mi[2] - 0 + 1;
    v_offset = 0 + v_dim1;
    v -= v_offset;
    ac_dim1 = *nteq;
    ac_offset = 1 + ac_dim1;
    ac -= ac_offset;
    --ipkon;
    --kon;
    lakon -= 8;
    --iponoel;
    inoel -= 3;
    --ielprop;
    --prop;
    --nshcon;
    --nrhcon;
    cocon_dim2 = *ntmat___;
    cocon_offset = 0 + 7 * (1 + cocon_dim2);
    cocon -= cocon_offset;
    rhcon_dim2 = *ntmat___;
    rhcon_offset = 0 + 2 * (1 + rhcon_dim2);
    rhcon -= rhcon_offset;
    shcon_dim2 = *ntmat___;
    shcon_offset = 0 + 4 * (1 + shcon_dim2);
    shcon -= shcon_offset;
    ncocon -= 3;

    /* Function Body */
    if (s_cmp(labmpc + (*i__ * 20 + 7), "QUADRATIC", (ftnlen)9, (ftnlen)9) == 
	    0) {

/*        example equation of the form */
/*        f:=a*v(idir1,node1)+b*v(idir2,node2)**2=0 */

/*        a,idir1,node1,b,idir2,node2 are given in the input deck */
/*        using the *NETWORK MPC keyword */
/*        to be calculated: a*df/d(v(idir1,node1)) */
/*                          b*df/d(v(idir2,node2)) */

	index = ipompc[*i__];
	node = nodempc[index * 3 + 1];
	idir = nodempc[index * 3 + 2];
	ac[*j + nactdog[idir + (node << 2)] * ac_dim1] = coefmpc[index];

	index = nodempc[index * 3 + 3];
	node = nodempc[index * 3 + 1];
	idir = nodempc[index * 3 + 2];

/*        if nactdog(idir,node) is zero the degree of freedom is */
/*        not active */

	if (nactdog[idir + (node << 2)] != 0) {
	    ac[*j + nactdog[idir + (node << 2)] * ac_dim1] = coefmpc[index] * 
		    2. * v[idir + node * v_dim1];
	}
    } else {
	s_wsle(&io___4);
	do_lio(&c__9, &c__1, "*ERROR in networkmpc_lhs:", (ftnlen)25);
	e_wsle();
	s_wsle(&io___5);
	do_lio(&c__9, &c__1, "       unknown MPC: ", (ftnlen)20);
	do_lio(&c__9, &c__1, labmpc + *i__ * 20, (ftnlen)20);
	e_wsle();
	exit_(&c__201);
    }

    return 0;
} /* networkmpc_lhs__ */

