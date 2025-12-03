/* umat.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int umat_(doublereal *stress, doublereal *statev, doublereal 
	*ddsdde, doublereal *sse, doublereal *spd, doublereal *scd, 
	doublereal *rpl, doublereal *ddsddt, doublereal *drplde, doublereal *
	drpldt, doublereal *stran, doublereal *dstran, doublereal *time, 
	doublereal *dtime, doublereal *temp, doublereal *dtemp, doublereal *
	predef, doublereal *dpred, char *cmname, integer *ndi, integer *nshr, 
	integer *ntens, integer *nstatv, doublereal *props, integer *nprops, 
	doublereal *coords, doublereal *drot, doublereal *pnewdt, doublereal *
	celent, doublereal *dfgrd0, doublereal *dfgrd1, integer *noel, 
	integer *npt, integer *layer, integer *kspt, integer *kstep, integer *
	kinc, ftnlen cmname_len)
{
    /* System generated locals */
    integer ddsdde_dim1, ddsdde_offset;

    /* Local variables */
    doublereal e;
    integer i__, j;
    doublereal al, um, un, am1;


/*     here, an ABAQUS umat routine can be inserted */

/*     note that reals should be double precision (REAL*8) */





/*     START EXAMPLE LINEAR ELASTIC MATERIAL */


/*      write(*,*) 'noel,npt ',noel,npt */
/*      write(*,*) 'stress ',(stress(i),i=1,6) */
/*      write(*,*) 'stran ',(stran(i),i=1,6) */
/*      write(*,*) 'dstran ',(dstran(i),i=1,6) */
/*      write(*,*) 'drot ',((drot(i,j),i=1,3),j=1,3) */
    /* Parameter adjustments */
    --time;
    --dstran;
    --stran;
    --drplde;
    --ddsddt;
    ddsdde_dim1 = *ntens;
    ddsdde_offset = 1 + ddsdde_dim1;
    ddsdde -= ddsdde_offset;
    --stress;
    --statev;
    --props;
    --coords;
    drot -= 4;
    dfgrd0 -= 4;
    dfgrd1 -= 4;

    /* Function Body */
    e = props[1];
    un = props[2];
    al = un * e / ((un + 1.) * (1. - un * 2.));
    um = e / ((un + 1.) * 2.);
    am1 = al + um * 2.;

/*     stress */

    stress[1] = am1 * (stran[1] + dstran[1]) + al * (stran[2] + dstran[2] + 
	    stran[3] + dstran[3]);
    stress[2] = am1 * (stran[2] + dstran[2]) + al * (stran[3] + dstran[3] + 
	    stran[1] + dstran[1]);
    stress[3] = am1 * (stran[3] + dstran[3]) + al * (stran[1] + dstran[1] + 
	    stran[2] + dstran[2]);
    stress[4] = um * (stran[4] + dstran[4]);
    stress[5] = um * (stran[5] + dstran[5]);
    stress[6] = um * (stran[6] + dstran[6]);

/*     stiffness */

    for (i__ = 1; i__ <= 6; ++i__) {
	for (j = 1; j <= 6; ++j) {
	    ddsdde[i__ + j * ddsdde_dim1] = 0.;
	}
    }
    ddsdde[ddsdde_dim1 + 1] = al + um * 2.;
    ddsdde[(ddsdde_dim1 << 1) + 1] = al;
    ddsdde[ddsdde_dim1 + 2] = al;
    ddsdde[(ddsdde_dim1 << 1) + 2] = al + um * 2.;
    ddsdde[ddsdde_dim1 * 3 + 1] = al;
    ddsdde[ddsdde_dim1 + 3] = al;
    ddsdde[ddsdde_dim1 * 3 + 2] = al;
    ddsdde[(ddsdde_dim1 << 1) + 3] = al;
    ddsdde[ddsdde_dim1 * 3 + 3] = al + um * 2.;
    ddsdde[(ddsdde_dim1 << 2) + 4] = um;
    ddsdde[ddsdde_dim1 * 5 + 5] = um;
    ddsdde[ddsdde_dim1 * 6 + 6] = um;

/*     END EXAMPLE LINEAR ELASTIC MATERIAL */

    return 0;
} /* umat_ */

