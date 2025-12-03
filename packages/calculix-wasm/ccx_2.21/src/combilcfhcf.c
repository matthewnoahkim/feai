/* combilcfhcf.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int combilcfhcf_(doublereal *tempf, doublereal *stressf, 
	doublereal *stress, doublereal *hcfstress, doublereal *temp, integer *
	nbounnod, integer *mei, integer *nstep)
{
    /* System generated locals */
    integer stress_dim2, stress_offset, temp_dim1, temp_offset, i__1;

    /* Local variables */
    integer i__, j;


/*     calculates LCF+HCF and LCF-HCF and stores the resulting fields */
/*     in tempf and stressf */




    /* Parameter adjustments */
    tempf -= 3;
    stressf -= 19;
    hcfstress -= 7;
    --mei;
    temp_dim1 = *nstep;
    temp_offset = 1 + temp_dim1;
    temp -= temp_offset;
    stress_dim2 = *nstep;
    stress_offset = 1 + 6 * (1 + stress_dim2);
    stress -= stress_offset;

    /* Function Body */
    i__1 = *nbounnod;
    for (i__ = 1; i__ <= i__1; ++i__) {
	for (j = 1; j <= 6; ++j) {
	    stressf[j + ((i__ << 1) + 1) * 6] = stress[j + (mei[2] + i__ * 
		    stress_dim2) * 6] + hcfstress[j + i__ * 6];
	    stressf[j + ((i__ << 1) + 2) * 6] = stress[j + (mei[2] + i__ * 
		    stress_dim2) * 6] - hcfstress[j + i__ * 6];
	}
	tempf[(i__ << 1) + 1] = temp[mei[2] + i__ * temp_dim1];
	tempf[(i__ << 1) + 2] = temp[mei[2] + i__ * temp_dim1];
    }

    return 0;
} /* combilcfhcf_ */

