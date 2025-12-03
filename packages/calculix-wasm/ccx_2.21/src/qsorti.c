/* qsorti.f -- translated by f2c (version 20200916).
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

/*     S.W. Sloan, Adv.Eng.Software,1987,9(1),34-55. */
/*     Permission for use with the GPL license granted by Prof. Scott */
/*     Sloan on 17. Nov. 2013 */

/* Subroutine */ int qsorti_(integer *n, integer *list, integer *key)
{
    integer ll, lm, nl, lr, nr, ltemp, guess, lstack[32], rstack[32], stktop;






    /* Parameter adjustments */
    --key;
    --list;

    /* Function Body */
    ll = 1;
    lr = *n;
    stktop = 0;
L10:
    if (ll < lr) {
	nl = ll;
	nr = lr;
	lm = (ll + lr) / 2;
	guess = key[list[lm]];
L20:
	if (key[list[nl]] < guess) {
	    ++nl;
	    goto L20;
	}
L30:
	if (guess < key[list[nr]]) {
	    --nr;
	    goto L30;
	}
	if (nl < nr - 1) {
	    ltemp = list[nl];
	    list[nl] = list[nr];
	    list[nr] = ltemp;
	    ++nl;
	    --nr;
	    goto L20;
	}
	if (nl <= nr) {
	    if (nl < nr) {
		ltemp = list[nl];
		list[nl] = list[nr];
		list[nr] = ltemp;
	    }
	    ++nl;
	    --nr;
	}
	++stktop;
	if (nr < lm) {
	    lstack[stktop - 1] = nl;
	    rstack[stktop - 1] = lr;
	    lr = nr;
	} else {
	    lstack[stktop - 1] = ll;
	    rstack[stktop - 1] = nr;
	    ll = nl;
	}
	goto L10;
    }
    if (stktop != 0) {
	ll = lstack[stktop - 1];
	lr = rstack[stktop - 1];
	--stktop;
	goto L10;
    }
    return 0;
} /* qsorti_ */

