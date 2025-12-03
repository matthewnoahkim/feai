/* orthotropic.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int orthotropic_(doublereal *orthol, doublereal *anisox)
{

/*     expands the 9 orthotropic elastic constants into a */
/*     3x3x3x3 matrix */





    /* Parameter adjustments */
    anisox -= 40;
    --orthol;

    /* Function Body */
    anisox[40] = orthol[1];
    anisox[67] = 0.;
    anisox[94] = 0.;
    anisox[49] = 0.;
    anisox[76] = orthol[2];
    anisox[103] = 0.;
    anisox[58] = 0.;
    anisox[85] = 0.;
    anisox[112] = orthol[4];
    anisox[43] = 0.;
    anisox[70] = orthol[7];
    anisox[97] = 0.;
    anisox[52] = orthol[7];
    anisox[79] = 0.;
    anisox[106] = 0.;
    anisox[61] = 0.;
    anisox[88] = 0.;
    anisox[115] = 0.;
    anisox[46] = 0.;
    anisox[73] = 0.;
    anisox[100] = orthol[8];
    anisox[55] = 0.;
    anisox[82] = 0.;
    anisox[109] = 0.;
    anisox[64] = orthol[8];
    anisox[91] = 0.;
    anisox[118] = 0.;
    anisox[41] = 0.;
    anisox[68] = orthol[7];
    anisox[95] = 0.;
    anisox[50] = orthol[7];
    anisox[77] = 0.;
    anisox[104] = 0.;
    anisox[59] = 0.;
    anisox[86] = 0.;
    anisox[113] = 0.;
    anisox[44] = orthol[2];
    anisox[71] = 0.;
    anisox[98] = 0.;
    anisox[53] = 0.;
    anisox[80] = orthol[3];
    anisox[107] = 0.;
    anisox[62] = 0.;
    anisox[89] = 0.;
    anisox[116] = orthol[5];
    anisox[47] = 0.;
    anisox[74] = 0.;
    anisox[101] = 0.;
    anisox[56] = 0.;
    anisox[83] = 0.;
    anisox[110] = orthol[9];
    anisox[65] = 0.;
    anisox[92] = orthol[9];
    anisox[119] = 0.;
    anisox[42] = 0.;
    anisox[69] = 0.;
    anisox[96] = orthol[8];
    anisox[51] = 0.;
    anisox[78] = 0.;
    anisox[105] = 0.;
    anisox[60] = orthol[8];
    anisox[87] = 0.;
    anisox[114] = 0.;
    anisox[45] = 0.;
    anisox[72] = 0.;
    anisox[99] = 0.;
    anisox[54] = 0.;
    anisox[81] = 0.;
    anisox[108] = orthol[9];
    anisox[63] = 0.;
    anisox[90] = orthol[9];
    anisox[117] = 0.;
    anisox[48] = orthol[4];
    anisox[75] = 0.;
    anisox[102] = 0.;
    anisox[57] = 0.;
    anisox[84] = orthol[5];
    anisox[111] = 0.;
    anisox[66] = 0.;
    anisox[93] = 0.;
    anisox[120] = orthol[6];

    return 0;
} /* orthotropic_ */

