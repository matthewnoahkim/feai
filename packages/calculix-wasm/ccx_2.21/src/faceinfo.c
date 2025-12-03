/* faceinfo.f -- translated by f2c (version 20200916).
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


/*     subroutine to find the right # nodes for element and surface */
/*     based on current element number nelem and face number jface */

/* Subroutine */ int faceinfo_(integer *nelem, integer *jface, char *lakon, 
	integer *nope, integer *nopes, integer *mint2d, ftnlen lakon_len)
{
    /* Builtin functions */
    integer s_cmp(char *, char *, ftnlen, ftnlen);


/*     autor: Saskia Sitzmann */




    /* Parameter adjustments */
    lakon -= 8;

    /* Function Body */
    if (s_cmp(lakon + ((*nelem << 3) + 3), "8R", (ftnlen)2, (ftnlen)2) == 0) {
	*mint2d = 1;
	*nopes = 4;
	*nope = 8;
    } else if (*(unsigned char *)&lakon[(*nelem << 3) + 3] == '8') {
	*mint2d = 4;
	*nopes = 4;
	*nope = 8;
    } else if (s_cmp(lakon + ((*nelem << 3) + 3), "20R", (ftnlen)3, (ftnlen)3)
	     == 0) {
	*mint2d = 4;
	*nopes = 8;
	*nope = 20;
    } else if (*(unsigned char *)&lakon[(*nelem << 3) + 3] == '2') {
	*mint2d = 9;
	*nopes = 8;
	*nope = 20;
    } else if (s_cmp(lakon + ((*nelem << 3) + 3), "10", (ftnlen)2, (ftnlen)2) 
	    == 0) {
	*mint2d = 3;
	*nopes = 6;
	*nope = 10;
    } else if (*(unsigned char *)&lakon[(*nelem << 3) + 3] == '4') {
	*mint2d = 1;
	*nopes = 3;
	*nope = 4;
    }

/*     treatment of wedge faces */

    if (*(unsigned char *)&lakon[(*nelem << 3) + 3] == '6') {
	*mint2d = 1;
	*nope = 6;
	if (*jface <= 2) {
	    *nopes = 3;
	} else {
	    *nopes = 4;
	}
    }
    if (s_cmp(lakon + ((*nelem << 3) + 3), "15", (ftnlen)2, (ftnlen)2) == 0) {
	*nope = 15;
	if (*jface <= 2) {
	    *mint2d = 3;
	    *nopes = 6;
	} else {
	    *mint2d = 4;
	    *nopes = 8;
	}
    }

    return 0;
} /* faceinfo_ */

