/* anisotropic.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int anisotropic_(doublereal *anisol, doublereal *anisox)
{

/*     expands the 21 anisotropic elastic constants into a */
/*     3x3x3x3 matrix */



    /* Parameter adjustments */
    anisox -= 40;
    --anisol;

    /* Function Body */
    anisox[40] = anisol[1];
    anisox[67] = anisol[7];
    anisox[94] = anisol[11];
    anisox[49] = anisol[7];
    anisox[76] = anisol[2];
    anisox[103] = anisol[16];
    anisox[58] = anisol[11];
    anisox[85] = anisol[16];
    anisox[112] = anisol[4];
    anisox[43] = anisol[7];
    anisox[70] = anisol[10];
    anisox[97] = anisol[14];
    anisox[52] = anisol[10];
    anisox[79] = anisol[8];
    anisox[106] = anisol[19];
    anisox[61] = anisol[14];
    anisox[88] = anisol[19];
    anisox[115] = anisol[9];
    anisox[46] = anisol[11];
    anisox[73] = anisol[14];
    anisox[100] = anisol[15];
    anisox[55] = anisol[14];
    anisox[82] = anisol[12];
    anisox[109] = anisol[20];
    anisox[64] = anisol[15];
    anisox[91] = anisol[20];
    anisox[118] = anisol[13];
    anisox[41] = anisol[7];
    anisox[68] = anisol[10];
    anisox[95] = anisol[14];
    anisox[50] = anisol[10];
    anisox[77] = anisol[8];
    anisox[104] = anisol[19];
    anisox[59] = anisol[14];
    anisox[86] = anisol[19];
    anisox[113] = anisol[9];
    anisox[44] = anisol[2];
    anisox[71] = anisol[8];
    anisox[98] = anisol[12];
    anisox[53] = anisol[8];
    anisox[80] = anisol[3];
    anisox[107] = anisol[17];
    anisox[62] = anisol[12];
    anisox[89] = anisol[17];
    anisox[116] = anisol[5];
    anisox[47] = anisol[16];
    anisox[74] = anisol[19];
    anisox[101] = anisol[20];
    anisox[56] = anisol[19];
    anisox[83] = anisol[17];
    anisox[110] = anisol[21];
    anisox[65] = anisol[20];
    anisox[92] = anisol[21];
    anisox[119] = anisol[18];
    anisox[42] = anisol[11];
    anisox[69] = anisol[14];
    anisox[96] = anisol[15];
    anisox[51] = anisol[14];
    anisox[78] = anisol[12];
    anisox[105] = anisol[20];
    anisox[60] = anisol[15];
    anisox[87] = anisol[20];
    anisox[114] = anisol[13];
    anisox[45] = anisol[16];
    anisox[72] = anisol[19];
    anisox[99] = anisol[20];
    anisox[54] = anisol[19];
    anisox[81] = anisol[17];
    anisox[108] = anisol[21];
    anisox[63] = anisol[20];
    anisox[90] = anisol[21];
    anisox[117] = anisol[18];
    anisox[48] = anisol[4];
    anisox[75] = anisol[9];
    anisox[102] = anisol[13];
    anisox[57] = anisol[9];
    anisox[84] = anisol[5];
    anisox[111] = anisol[18];
    anisox[66] = anisol[13];
    anisox[93] = anisol[18];
    anisox[120] = anisol[6];

    return 0;
} /* anisotropic_ */

