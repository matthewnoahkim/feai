/* propertynet.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int propertynet_(integer *ieg, integer *nflow, doublereal *
	prop, integer *ielprop, char *lakon, integer *iin, doublereal *
	prop_store__, doublereal *ttime, doublereal *time, integer *nam, char 
	*amname, integer *namta, doublereal *amta, ftnlen lakon_len, ftnlen 
	amname_len)
{

/*     user subroutine propertynet */


/*     INPUT: */

/*     ieg(i)             global element number corresponding to */
/*                        network element i (i=1,...,nflow) */
/*     nflow              number of network elements */
/*     ielprop(i)         property to the position in fields prop and */
/*                        prop_store after which the properties for */
/*                        element i start (prop(ielprop(i)+1), */
/*                        prop(ielprop(i)+2).....). The number is dictated */
/*                        by the type of element. */
/*     lakon(i)           label of element i */
/*     iin                gas network iteration number */
/*     prop_store         property values as specified in the */
/*                        input deck */
/*     ttime              total time */
/*     time               step time */
/*     nam                number of amplitudes */
/*     amname(i)          amplitude name of amplitude i */
/*     namta(1,i)         location of first (time,amplitude) pair in */
/*                        field amta */
/*     namta(2,i)         location of last (time,amplitude) pair in */
/*                        field amta */
/*     namta(3,i)         in absolute value the amplitude it refers to; if */
/*                        abs(namta(3,i))=i it refers to itself. If */
/*                        abs(namta(3,i))=j, amplitude i is a time delay */
/*                        of amplitude j; in that case the value of the */
/*                        time delay is stored in */
/*                        amta(1,namta(1,i)); in the latter case */
/*                        amta(2,namta(1,i)) is without meaning; if */
/*                        namta(3,i)>0 the time in amta for amplitude i is */
/*                        step time, else it is total time. */
/*     amta(1,i)          time of (time,amplitude)-pair i */
/*     amta(2,i)          amplitude of (time,amplitude)-pair i */

/*     OUTPUT: */

/*     prop               actual property values */







    /* Parameter adjustments */
    amta -= 3;
    namta -= 4;
    amname -= 80;
    --prop_store__;
    lakon -= 8;
    --ielprop;
    --prop;
    --ieg;

    /* Function Body */
    return 0;
} /* propertynet_ */

