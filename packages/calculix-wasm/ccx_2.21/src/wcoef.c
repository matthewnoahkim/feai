/* wcoef.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int wcoef_(doublereal *v, doublereal *vo, doublereal *al, 
	doublereal *um)
{
    /* System generated locals */
    doublereal d__1, d__2;

    /* Local variables */
    doublereal p1, p2, p3, au, a2u;


/*     computation of the coefficients of w in the derivation of the */
/*     second order element stiffness matrix */






    /* Parameter adjustments */
    vo -= 4;
    v -= 40;

    /* Function Body */
    a2u = *al + *um * 2.;
    au = *al + *um;

    p1 = vo[4] + 1.;
    p2 = vo[8] + 1.;
    p3 = vo[12] + 1.;

/* Computing 2nd power */
    d__1 = vo[7];
/* Computing 2nd power */
    d__2 = vo[10];
    v[40] = a2u * p1 * p1 + *um * (d__1 * d__1 + d__2 * d__2);
    v[41] = au * vo[7] * p1;
    v[42] = au * vo[10] * p1;
    v[43] = v[41];
/* Computing 2nd power */
    d__1 = vo[7];
/* Computing 2nd power */
    d__2 = vo[10];
    v[44] = a2u * (d__1 * d__1) + *um * (p1 * p1 + d__2 * d__2);
    v[45] = au * vo[7] * vo[10];
    v[46] = v[42];
    v[47] = v[45];
/* Computing 2nd power */
    d__1 = vo[10];
/* Computing 2nd power */
    d__2 = vo[7];
    v[48] = a2u * (d__1 * d__1) + *um * (p1 * p1 + d__2 * d__2);

    v[49] = *al * vo[5] * p1 + *um * (vo[5] * 2. * p1 + vo[7] * p2 + vo[11] * 
	    vo[10]);
    v[50] = *al * p1 * p2 + *um * vo[5] * vo[7];
    v[51] = *al * vo[11] * p1 + *um * vo[5] * vo[10];
    v[52] = *al * vo[5] * vo[7] + *um * p1 * p2;
    v[53] = *al * vo[7] * p2 + *um * (vo[5] * p1 + vo[7] * 2. * p2 + vo[11] * 
	    vo[10]);
    v[54] = *al * vo[11] * vo[7] + *um * vo[10] * p2;
    v[55] = *al * vo[5] * vo[10] + *um * vo[11] * p1;
    v[56] = *al * vo[10] * p2 + *um * vo[11] * vo[7];
    v[57] = a2u * vo[11] * vo[10] + *um * (vo[5] * p1 + vo[7] * p2);

    v[58] = *al * vo[6] * p1 + *um * (vo[10] * p3 + vo[6] * 2. * p1 + vo[9] * 
	    vo[7]);
    v[59] = *al * vo[9] * p1 + *um * vo[6] * vo[7];
    v[60] = *al * p1 * p3 + *um * vo[6] * vo[10];
    v[61] = *al * vo[6] * vo[7] + *um * vo[9] * p1;
    v[62] = a2u * vo[9] * vo[7] + *um * (vo[10] * p3 + vo[6] * p1);
    v[63] = *al * vo[7] * p3 + *um * vo[9] * vo[10];
    v[64] = *al * vo[6] * vo[10] + *um * p1 * p3;
    v[65] = *al * vo[9] * vo[10] + *um * vo[7] * p3;
    v[66] = *al * vo[10] * p3 + *um * (vo[10] * 2. * p3 + vo[6] * p1 + vo[9] *
	     vo[7]);

    v[67] = *al * vo[5] * p1 + *um * (vo[7] * p2 + vo[5] * 2. * p1 + vo[10] * 
	    vo[11]);
    v[68] = *al * vo[7] * vo[5] + *um * p1 * p2;
    v[69] = *al * vo[10] * vo[5] + *um * vo[11] * p1;
    v[70] = *al * p1 * p2 + *um * vo[7] * vo[5];
    v[71] = *al * vo[7] * p2 + *um * (vo[7] * 2. * p2 + vo[5] * p1 + vo[10] * 
	    vo[11]);
    v[72] = *al * vo[10] * p2 + *um * vo[7] * vo[11];
    v[73] = *al * vo[11] * p1 + *um * vo[10] * vo[5];
    v[74] = *al * vo[7] * vo[11] + *um * vo[10] * p2;
    v[75] = a2u * vo[10] * vo[11] + *um * (vo[7] * p2 + vo[5] * p1);

/* Computing 2nd power */
    d__1 = vo[5];
/* Computing 2nd power */
    d__2 = vo[11];
    v[76] = a2u * (d__1 * d__1) + *um * (p2 * p2 + d__2 * d__2);
    v[77] = au * vo[5] * p2;
    v[78] = au * vo[11] * vo[5];
    v[79] = v[77];
/* Computing 2nd power */
    d__1 = vo[5];
/* Computing 2nd power */
    d__2 = vo[11];
    v[80] = a2u * p2 * p2 + *um * (d__1 * d__1 + d__2 * d__2);
    v[81] = au * vo[11] * p2;
    v[82] = v[78];
    v[83] = v[81];
/* Computing 2nd power */
    d__1 = vo[11];
/* Computing 2nd power */
    d__2 = vo[5];
    v[84] = a2u * (d__1 * d__1) + *um * (p2 * p2 + d__2 * d__2);

    v[85] = a2u * vo[6] * vo[5] + *um * (vo[9] * p2 + vo[11] * p3);
    v[86] = *al * vo[9] * vo[5] + *um * vo[6] * p2;
    v[87] = *al * vo[5] * p3 + *um * vo[6] * vo[11];
    v[88] = *al * vo[6] * p2 + *um * vo[9] * vo[5];
    v[89] = *al * vo[9] * p2 + *um * (vo[9] * 2. * p2 + vo[11] * p3 + vo[6] * 
	    vo[5]);
    v[90] = *al * p2 * p3 + *um * vo[9] * vo[11];
    v[91] = *al * vo[6] * vo[11] + *um * vo[5] * p3;
    v[92] = *al * vo[9] * vo[11] + *um * p2 * p3;
    v[93] = *al * vo[11] * p3 + *um * (vo[9] * p2 + vo[11] * 2. * p3 + vo[6] *
	     vo[5]);

    v[94] = *al * vo[6] * p1 + *um * (vo[10] * p3 + vo[6] * 2. * p1 + vo[7] * 
	    vo[9]);
    v[95] = *al * vo[7] * vo[6] + *um * vo[9] * p1;
    v[96] = *al * vo[10] * vo[6] + *um * p1 * p3;
    v[97] = *al * vo[9] * p1 + *um * vo[7] * vo[6];
    v[98] = a2u * vo[7] * vo[9] + *um * (vo[10] * p3 + vo[6] * p1);
    v[99] = *al * vo[10] * vo[9] + *um * vo[7] * p3;
    v[100] = *al * p1 * p3 + *um * vo[10] * vo[6];
    v[101] = *al * vo[7] * p3 + *um * vo[10] * vo[9];
    v[102] = *al * vo[10] * p3 + *um * (vo[10] * 2. * p3 + vo[6] * p1 + vo[7] 
	    * vo[9]);

    v[103] = a2u * vo[5] * vo[6] + *um * (vo[11] * p3 + vo[9] * p2);
    v[104] = *al * vo[6] * p2 + *um * vo[5] * vo[9];
    v[105] = *al * vo[11] * vo[6] + *um * vo[5] * p3;
    v[106] = *al * vo[5] * vo[9] + *um * vo[6] * p2;
    v[107] = *al * vo[9] * p2 + *um * (vo[11] * p3 + vo[9] * 2. * p2 + vo[5] *
	     vo[6]);
    v[108] = *al * vo[11] * vo[9] + *um * p2 * p3;
    v[109] = *al * vo[5] * p3 + *um * vo[11] * vo[6];
    v[110] = *al * p2 * p3 + *um * vo[11] * vo[9];
    v[111] = *al * vo[11] * p3 + *um * (vo[11] * 2. * p3 + vo[9] * p2 + vo[5] 
	    * vo[6]);

/* Computing 2nd power */
    d__1 = vo[6];
/* Computing 2nd power */
    d__2 = vo[9];
    v[112] = a2u * (d__1 * d__1) + *um * (p3 * p3 + d__2 * d__2);
    v[113] = au * vo[9] * vo[6];
    v[114] = au * vo[6] * p3;
    v[115] = v[113];
/* Computing 2nd power */
    d__1 = vo[9];
/* Computing 2nd power */
    d__2 = vo[6];
    v[116] = a2u * (d__1 * d__1) + *um * (p3 * p3 + d__2 * d__2);
    v[117] = au * vo[9] * p3;
    v[118] = v[114];
    v[119] = v[117];
/* Computing 2nd power */
    d__1 = vo[6];
/* Computing 2nd power */
    d__2 = vo[9];
    v[120] = a2u * p3 * p3 + *um * (d__1 * d__1 + d__2 * d__2);

    return 0;
} /* wcoef_ */

