/* springstiff_f2f.f -- translated by f2c (version 20200916).
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

/* Subroutine */ int springstiff_f2f__(doublereal *xl, doublereal *elas, 
	doublereal *voldl, doublereal *s, integer *imat, doublereal *elcon, 
	integer *nelcon, integer *ncmat___, integer *ntmat___, integer *nope, 
	char *lakonl, doublereal *t1l, integer *kode, doublereal *elconloc, 
	doublereal *plicon, integer *nplicon, integer *npmat___, integer *
	iperturb, doublereal *springarea, integer *nmethod, integer *mi, 
	integer *ne0, integer *nstate___, doublereal *xstateini, doublereal *
	xstate, doublereal *reltime, integer *nasym, integer *jfaces, integer 
	*igauss, doublereal *pslavsurf, doublereal *pmastsurf, doublereal *
	clearini, integer *kscale, ftnlen lakonl_len)
{
    /* System generated locals */
    integer nplicon_dim1, nplicon_offset, voldl_dim1, voldl_offset, 
	    elcon_dim1, elcon_dim2, elcon_offset, plicon_dim1, plicon_dim2, 
	    plicon_offset, xstate_dim1, xstate_dim2, xstate_offset, 
	    xstateini_dim1, xstateini_dim2, xstateini_offset, i__1, i__2;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double log(doublereal), exp(doublereal), sqrt(doublereal);

    /* Local variables */
    doublereal plconloc[82];
    integer i__, j, k, l;
    extern /* Subroutine */ int shape3tri_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *)
	    ;
    doublereal t[3];
    extern /* Subroutine */ int shape6tri_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *)
	    ;
    doublereal c1, c3, dg;
    integer id;
    doublereal al[3], et, te[3], pl[57]	/* was [3][19] */, xi, um, xk, xm[3], 
	    xn[3], tp[3], tu[9]	/* was [3][3] */, xs2[21]	/* was [3][7] 
	    */, stickslope, dfn[3], dte, fnl[3], val, fpu[9]	/* was [3][3] 
	    */, xs2s[21]	/* was [3][7] */, beta, dfnl;
    integer niso;
    doublereal pres, xiso[20], yiso[20], shp2m[63]	/* was [7][9] */, 
	    shp2s[63]	/* was [7][9] */, xsj2s[3];
    integer iflag;
    doublereal alpha, clear;
    extern /* Subroutine */ int ident_(doublereal *, doublereal *, integer *, 
	    integer *);
    doublereal dftdt[9]	/* was [3][3] */, alnew[3];
    integer nopem, nopep, nopes;
    doublereal pproj[3], dpresdoverlap, ftrial[3], weight;
    extern /* Subroutine */ int shape4q_(doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *)
	    , shape8q_(doublereal *, doublereal *, doublereal *, doublereal *,
	     doublereal *, doublereal *, integer *);
    doublereal dfshear, dftrial, overlap;
    extern /* Subroutine */ int materialdata_sp__(doublereal *, integer *, 
	    integer *, integer *, integer *, doublereal *, doublereal *, 
	    integer *, doublereal *, integer *, integer *, doublereal *, 
	    integer *);


/*     calculates the stiffness of a spring (face-to-face penalty) */





    /* Parameter adjustments */
    xl -= 4;
    --elas;
    s -= 61;
    nelcon -= 3;
    nplicon_dim1 = *ntmat___ - 0 + 1;
    nplicon_offset = 0 + nplicon_dim1;
    nplicon -= nplicon_offset;
    elcon_dim1 = *ncmat___ - 0 + 1;
    elcon_dim2 = *ntmat___;
    elcon_offset = 0 + elcon_dim1 * (1 + elcon_dim2);
    elcon -= elcon_offset;
    --elconloc;
    plicon_dim1 = 2 * *npmat___ - 0 + 1;
    plicon_dim2 = *ntmat___;
    plicon_offset = 0 + plicon_dim1 * (1 + plicon_dim2);
    plicon -= plicon_offset;
    --iperturb;
    --springarea;
    --mi;
    voldl_dim1 = mi[2] - 0 + 1;
    voldl_offset = 0 + voldl_dim1;
    voldl -= voldl_offset;
    xstate_dim1 = *nstate___;
    xstate_dim2 = mi[1];
    xstate_offset = 1 + xstate_dim1 * (1 + xstate_dim2);
    xstate -= xstate_offset;
    xstateini_dim1 = *nstate___;
    xstateini_dim2 = mi[1];
    xstateini_offset = 1 + xstateini_dim1 * (1 + xstateini_dim2);
    xstateini -= xstateini_offset;
    pslavsurf -= 4;
    pmastsurf -= 7;
    clearini -= 31;

    /* Function Body */
    iflag = 1;

/*     # of master nodes */

    nopem = *(unsigned char *)&lakonl[7] - 48;

/*     # of slave nodes */

    nopes = *nope - nopem;

/*     actual positions of the nodes belonging to the contact spring */
/*     (otherwise no contact force) */

/*     master nodes */

    i__1 = nopem;
    for (i__ = 1; i__ <= i__1; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    pl[j + i__ * 3 - 4] = xl[j + i__ * 3] + voldl[j + i__ * 
		    voldl_dim1];
	}
    }

/*     slave nodes */

    i__1 = *nope;
    for (i__ = nopem + 1; i__ <= i__1; ++i__) {
	for (j = 1; j <= 3; ++j) {
	    pl[j + i__ * 3 - 4] = xl[j + i__ * 3] + voldl[j + i__ * 
		    voldl_dim1] + clearini[j + (i__ - nopem + *jfaces * 9) * 
		    3] * *reltime;
	}
    }

/*     contact springs */

    xi = pslavsurf[*igauss * 3 + 1];
    et = pslavsurf[*igauss * 3 + 2];
    weight = pslavsurf[*igauss * 3 + 3];

    if (nopes == 8) {
	shape8q_(&xi, &et, &pl[(nopem + 1) * 3 - 3], xsj2s, xs2s, shp2s, &
		iflag);
    } else if (nopes == 4) {
	shape4q_(&xi, &et, &pl[(nopem + 1) * 3 - 3], xsj2s, xs2s, shp2s, &
		iflag);
    } else if (nopes == 6) {
	shape6tri_(&xi, &et, &pl[(nopem + 1) * 3 - 3], xsj2s, xs2s, shp2s, &
		iflag);
    } else {
	shape3tri_(&xi, &et, &pl[(nopem + 1) * 3 - 3], xsj2s, xs2s, shp2s, &
		iflag);
    }

    nopep = *nope + 1;

/*     position and displacements of the integration point in the */
/*     slave face */

    for (k = 1; k <= 3; ++k) {
	pl[k + nopep * 3 - 4] = 0.;
	voldl[k + nopep * voldl_dim1] = 0.;
	i__1 = nopes;
	for (j = 1; j <= i__1; ++j) {
	    pl[k + nopep * 3 - 4] += shp2s[j * 7 - 4] * pl[k + (nopem + j) * 
		    3 - 4];
	    voldl[k + nopep * voldl_dim1] += shp2s[j * 7 - 4] * voldl[k + (
		    nopem + j) * voldl_dim1];
	}
    }

    xi = pmastsurf[*igauss * 6 + 1];
    et = pmastsurf[*igauss * 6 + 2];

/*     determining the jacobian vector on the surface */

    if (nopem == 8) {
	shape8q_(&xi, &et, pl, xm, xs2, shp2m, &iflag);
    } else if (nopem == 4) {
	shape4q_(&xi, &et, pl, xm, xs2, shp2m, &iflag);
    } else if (nopem == 6) {
	shape6tri_(&xi, &et, pl, xm, xs2, shp2m, &iflag);
    } else {
	shape3tri_(&xi, &et, pl, xm, xs2, shp2m, &iflag);
    }

/*     position of the projection of the slave integration point */
/*     on the master faces (done at the start of the increment) */

    for (i__ = 1; i__ <= 3; ++i__) {
	pproj[i__ - 1] = 0.;
	i__1 = nopem;
	for (j = 1; j <= i__1; ++j) {
	    pproj[i__ - 1] += shp2m[j * 7 - 4] * pl[i__ + j * 3 - 4];
	}
    }

/*     vector connecting the integration point with its projection */
/*     on the master face */

    for (i__ = 1; i__ <= 3; ++i__) {
	al[i__ - 1] = pl[i__ + nopep * 3 - 4] - pproj[i__ - 1];
    }

/*     normal vector on master face */

    xn[0] = pmastsurf[*igauss * 6 + 4];
    xn[1] = pmastsurf[*igauss * 6 + 5];
    xn[2] = pmastsurf[*igauss * 6 + 6];

/*     distance from surface along normal (= clearance) */

    clear = al[0] * xn[0] + al[1] * xn[1] + al[2] * xn[2];
    if (*nmethod == 1) {
	clear -= springarea[2] * (1. - *reltime);
    }

/*     alpha and beta, taking the representative area into account */
/*     (conversion of pressure into force) */

    if ((integer) elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 3] == 1) {

/*        exponential overclosure */

	if ((d__1 = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 2], abs(
		d__1)) < 1e-30) {
	    elas[1] = 0.;
	    elas[2] = 0.;
	} else {
	    alpha = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 2] * 
		    springarea[1];
	    beta = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 1];
	    if (-beta * clear > 23. - log(alpha)) {
		beta = (log(alpha) - 23.) / clear;
	    }
	    elas[1] = exp(-beta * clear + log(alpha));
	    elas[2] = -beta * elas[1];
	}
    } else if ((integer) elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 3] == 
	    2 || (integer) elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 3] ==
	     4) {

/*        linear overclosure/tied overclosure */

/*        write(*,*) 'springstiff_f2f',springarea(1),elcon(2,1,imat), */
/*     &       kscale */
	elas[2] = -springarea[1] * elcon[(*imat * elcon_dim2 + 1) * 
		elcon_dim1 + 2] / *kscale;
	elas[1] = elas[2] * clear;
    } else if ((integer) elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 3] == 
	    3) {

/*        tabular overclosure */

/*        interpolating the material data */

	materialdata_sp__(&elcon[elcon_offset], &nelcon[3], imat, ntmat___, &
		i__, t1l, &elconloc[1], kode, &plicon[plicon_offset], &
		nplicon[nplicon_offset], npmat___, plconloc, ncmat___);
	overlap = -clear;
	niso = (integer) plconloc[80];
	i__1 = niso;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    xiso[i__ - 1] = plconloc[(i__ << 1) - 2];
	    yiso[i__ - 1] = plconloc[(i__ << 1) - 1];
	}
	ident_(xiso, &overlap, &niso, &id);
	if (id == 0) {
	    dpresdoverlap = 0.;
	    pres = yiso[0];
	} else if (id == niso) {
	    dpresdoverlap = 0.;
	    pres = yiso[niso - 1];
	} else {
	    dpresdoverlap = (yiso[id] - yiso[id - 1]) / (xiso[id] - xiso[id - 
		    1]);
	    pres = yiso[id - 1] + dpresdoverlap * (overlap - xiso[id - 1]);
	}
	elas[1] = springarea[1] * pres;
	elas[2] = -springarea[1] * dpresdoverlap;
    }

/*     contact force */

    for (i__ = 1; i__ <= 3; ++i__) {
	fnl[i__ - 1] = -elas[1] * xn[i__ - 1];
    }

    c3 = elas[2];

/*     derivatives of the forces w.r.t. the displacement vectors */

    for (j = 1; j <= 3; ++j) {
	for (i__ = 1; i__ <= 3; ++i__) {
	    fpu[i__ + j * 3 - 4] = -c3 * xn[i__ - 1] * xn[j - 1];
	}
    }

/*     Coulomb friction for static calculations */

    if (*ncmat___ >= 7 || (integer) elcon[(*imat * elcon_dim2 + 1) * 
	    elcon_dim1 + 3] == 4) {

/*        tied contact */

	if ((integer) elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 3] == 4) {
	    um = 1e30;
	} else {
	    um = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 6];
	}
	stickslope = elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 7] / *
		kscale;

	if (um > 0.) {

/*     stiffness of shear stress versus slip curve */

	    xk = stickslope * springarea[1];

/*     calculating the relative displacement between the slave node */
/*     and its projection on the master surface */

	    for (i__ = 1; i__ <= 3; ++i__) {
		alnew[i__ - 1] = voldl[i__ + nopep * voldl_dim1];
		i__1 = nopem;
		for (j = 1; j <= i__1; ++j) {
		    alnew[i__ - 1] -= shp2m[j * 7 - 4] * voldl[i__ + j * 
			    voldl_dim1];
		}
	    }

/*     calculating the difference in relative displacement since */
/*     the start of the increment = lamda^* */

	    for (i__ = 1; i__ <= 3; ++i__) {
		al[i__ - 1] = alnew[i__ - 1] - xstateini[i__ + 3 + ((*ne0 + *
			igauss) * xstateini_dim2 + 1) * xstateini_dim1];
	    }

/*     ||lambda^*|| */

	    val = al[0] * xn[0] + al[1] * xn[1] + al[2] * xn[2];

/*     update the relative tangential displacement */

	    for (i__ = 1; i__ <= 3; ++i__) {
		t[i__ - 1] = xstateini[i__ + 6 + ((*ne0 + *igauss) * 
			xstateini_dim2 + 1) * xstateini_dim1] + al[i__ - 1] - 
			val * xn[i__ - 1];
	    }

/*     store the actual relative displacement and */
/*     the actual relative tangential displacement */

	    for (i__ = 1; i__ <= 3; ++i__) {
		xstate[i__ + 3 + ((*ne0 + *igauss) * xstate_dim2 + 1) * 
			xstate_dim1] = alnew[i__ - 1];
		xstate[i__ + 6 + ((*ne0 + *igauss) * xstate_dim2 + 1) * 
			xstate_dim1] = t[i__ - 1];
	    }

/*     d t/d u_k */

	    for (j = 1; j <= 3; ++j) {
		for (i__ = 1; i__ <= 3; ++i__) {
		    tu[i__ + j * 3 - 4] = -xn[i__ - 1] * xn[j - 1];
		}
		tu[j + j * 3 - 4] += 1.;
	    }

/*     size of normal force */

/* Computing 2nd power */
	    d__1 = fnl[0];
/* Computing 2nd power */
	    d__2 = fnl[1];
/* Computing 2nd power */
	    d__3 = fnl[2];
	    dfnl = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);

/*     maximum size of shear force */

	    if ((integer) elcon[(*imat * elcon_dim2 + 1) * elcon_dim1 + 3] == 
		    4) {
		dfshear = 1e30;
	    } else {
		dfshear = um * dfnl;
	    }
/*            dfshear=um*dfnl */

/*     plastic and elastic slip */

	    for (i__ = 1; i__ <= 3; ++i__) {
		tp[i__ - 1] = xstateini[i__ + ((*ne0 + *igauss) * 
			xstateini_dim2 + 1) * xstateini_dim1];
		te[i__ - 1] = t[i__ - 1] - tp[i__ - 1];
	    }

	    dte = sqrt(te[0] * te[0] + te[1] * te[1] + te[2] * te[2]);

/*     trial force */

	    for (i__ = 1; i__ <= 3; ++i__) {
		ftrial[i__ - 1] = xk * te[i__ - 1];
	    }
/* Computing 2nd power */
	    d__1 = ftrial[0];
/* Computing 2nd power */
	    d__2 = ftrial[1];
/* Computing 2nd power */
	    d__3 = ftrial[2];
	    dftrial = sqrt(d__1 * d__1 + d__2 * d__2 + d__3 * d__3);

/*     check whether stick or slip */

	    if (dftrial < dfshear || dftrial <= 0.) {

/*     stick force */

		for (i__ = 1; i__ <= 3; ++i__) {
		    fnl[i__ - 1] += ftrial[i__ - 1];
		    xstate[i__ + ((*ne0 + *igauss) * xstate_dim2 + 1) * 
			    xstate_dim1] = tp[i__ - 1];
		}

/*     stick stiffness */

		for (j = 1; j <= 3; ++j) {
		    for (i__ = 1; i__ <= 3; ++i__) {
			fpu[i__ + j * 3 - 4] += xk * tu[i__ + j * 3 - 4];
		    }
		}
	    } else {

/*     slip force */

		dg = (dftrial - dfshear) / xk;
		for (i__ = 1; i__ <= 3; ++i__) {
		    ftrial[i__ - 1] = te[i__ - 1] / dte;
		    fnl[i__ - 1] += dfshear * ftrial[i__ - 1];
		    xstate[i__ + ((*ne0 + *igauss) * xstate_dim2 + 1) * 
			    xstate_dim1] = tp[i__ - 1] + dg * ftrial[i__ - 1];
		}

/*     slip stiffness */

		for (i__ = 1; i__ <= 3; ++i__) {
		    dfn[i__ - 1] = -xn[0] * fpu[i__ * 3 - 3] - xn[1] * fpu[
			    i__ * 3 - 2] - xn[2] * fpu[i__ * 3 - 1];
		}

		c1 = xk * dfshear / dftrial;
		for (i__ = 1; i__ <= 3; ++i__) {
		    for (j = 1; j <= 3; ++j) {
			dftdt[i__ + j * 3 - 4] = -c1 * ftrial[i__ - 1] * 
				ftrial[j - 1];
		    }
		    dftdt[i__ + i__ * 3 - 4] += c1;
		}

		for (j = 1; j <= 3; ++j) {
		    for (i__ = 1; i__ <= 3; ++i__) {
			for (l = 1; l <= 3; ++l) {
			    fpu[i__ + j * 3 - 4] += dftdt[i__ + l * 3 - 4] * 
				    tu[l + j * 3 - 4];
			}
			if (*nmethod != 4 || iperturb[1] > 1) {
			    fpu[i__ + j * 3 - 4] += um * ftrial[i__ - 1] * 
				    dfn[j - 1];
			}
		    }
		}
	    }
	}
    }

/*     determining the stiffness matrix contributions */

/*     dFkm/dUlm */

    i__1 = nopem;
    for (k = 1; k <= i__1; ++k) {
	for (i__ = 1; i__ <= 3; ++i__) {
	    i__2 = nopem;
	    for (l = 1; l <= i__2; ++l) {
		for (j = 1; j <= 3; ++j) {
		    s[i__ + (k - 1) * 3 + (j + (l - 1) * 3) * 60] = shp2m[k * 
			    7 - 4] * shp2m[l * 7 - 4] * fpu[i__ + j * 3 - 4];
		}
	    }
	}
    }

/*     dFks/dUls */

    i__1 = nopem + nopes;
    for (k = nopem + 1; k <= i__1; ++k) {
	for (i__ = 1; i__ <= 3; ++i__) {
	    i__2 = nopem + nopes;
	    for (l = nopem + 1; l <= i__2; ++l) {
		for (j = 1; j <= 3; ++j) {
		    s[i__ + (k - 1) * 3 + (j + (l - 1) * 3) * 60] = shp2s[(k 
			    - nopem) * 7 - 4] * shp2s[(l - nopem) * 7 - 4] * 
			    fpu[i__ + j * 3 - 4];
		}
	    }
	}
    }

/*     dFkm/dUls */

    i__1 = nopem;
    for (k = 1; k <= i__1; ++k) {
	for (i__ = 1; i__ <= 3; ++i__) {
	    i__2 = nopem + nopes;
	    for (l = nopem + 1; l <= i__2; ++l) {
		for (j = 1; j <= 3; ++j) {
		    s[i__ + (k - 1) * 3 + (j + (l - 1) * 3) * 60] = -shp2s[(l 
			    - nopem) * 7 - 4] * shp2m[k * 7 - 4] * fpu[i__ + 
			    j * 3 - 4];
		}
	    }
	}
    }

/*     dFks/dUlm */

    i__1 = nopem + nopes;
    for (k = nopem + 1; k <= i__1; ++k) {
	for (i__ = 1; i__ <= 3; ++i__) {
	    i__2 = nopem;
	    for (l = 1; l <= i__2; ++l) {
		for (j = 1; j <= 3; ++j) {
		    s[i__ + (k - 1) * 3 + (j + (l - 1) * 3) * 60] = -shp2s[(k 
			    - nopem) * 7 - 4] * shp2m[l * 7 - 4] * fpu[i__ + 
			    j * 3 - 4];
		}
	    }
	}
    }

/*     symmetrizing the matrix */
/*     this is done in the absence of friction or for modal dynamic */
/*     calculations */

    if (*nasym == 0 || *nmethod == 4 && iperturb[1] <= 1) {
	i__1 = *nope * 3;
	for (j = 1; j <= i__1; ++j) {
	    i__2 = j - 1;
	    for (i__ = 1; i__ <= i__2; ++i__) {
		s[i__ + j * 60] = (s[i__ + j * 60] + s[j + i__ * 60]) / 2.;
	    }
	}
    }

    return 0;
} /* springstiff_f2f__ */

