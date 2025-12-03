/* sluicegate.f -- translated by f2c (version 20200916).
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
static doublereal c_b14 = 1.5;
static integer c__3 = 3;


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

/*     Solve the Bresse equation for the turbulent stationary flow */
/*     in channels with a non-erosive bottom: sluice gate */

/* Subroutine */ int sluicegate_(integer *nelem, integer *ielprop, doublereal 
	*prop, integer *nup, integer *nmid, integer *ndo, doublereal *co, 
	doublereal *g, doublereal *dg, char *mode, doublereal *xflow, 
	doublereal *rho, doublereal *dvi, integer *nelup, integer *neldo, 
	integer *istack, integer *nstack, integer *ikboun, integer *nboun, 
	integer *mi, doublereal *v, integer *ipkon, integer *kon, integer *
	inv, doublereal *epsilon, char *lakon, ftnlen mode_len, ftnlen 
	lakon_len)
{
    /* System generated locals */
    integer v_dim1, v_offset;
    doublereal d__1;

    /* Builtin functions */
    double tan(doublereal);
    integer s_wsle(cilist *), do_lio(integer *, integer *, char *, ftnlen), 
	    e_wsle(void);
    double sqrt(doublereal);
    integer s_cmp(char *, char *, ftnlen, ftnlen);
    double pow_dd(doublereal *, doublereal *);

    /* Local variables */
    doublereal friction, reynolds, xflowcor, b, form_fact__, s0, aa, bb, cc, 
	    cd, ha, hd;
    integer id;
    doublereal he, dl, hk, hw, hdo, hup, tth, xks, area;
    integer idof;
    extern /* Subroutine */ int exit_(integer *), friction_coefficient__(
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *);
    doublereal theta;
    integer index;
    doublereal hkmax;
    extern /* Subroutine */ int hcrit_(doublereal *, doublereal *, doublereal 
	    *, doublereal *, doublereal *, doublereal *, doublereal *), 
	    hnorm_(doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *);
    doublereal sqrts0;
    extern /* Subroutine */ int nident_(integer *, integer *, integer *, 
	    integer *);

    /* Fortran I/O blocks */
    static cilist io___7 = { 0, 6, 0, 0, 0 };
    static cilist io___8 = { 0, 6, 0, 0, 0 };
    static cilist io___9 = { 0, 6, 0, 0, 0 };
    static cilist io___27 = { 0, 6, 0, 0, 0 };
    static cilist io___28 = { 0, 6, 0, 0, 0 };
    static cilist io___29 = { 0, 6, 0, 0, 0 };
    static cilist io___30 = { 0, 6, 0, 0, 0 };



/*     treats the channel elements SLUICE GATE and WEAR */





/*     determining the properties */

    /* Parameter adjustments */
    --ielprop;
    --prop;
    co -= 4;
    --g;
    istack -= 3;
    --ikboun;
    --mi;
    v_dim1 = mi[2] - 0 + 1;
    v_offset = 0 + v_dim1;
    v -= v_offset;
    --ipkon;
    --kon;
    lakon -= 8;

    /* Function Body */
    index = ielprop[*nelem];

/*     width of the downstream channel at zero depth */
/*     needed to calculate the critical depth (hk) */

    b = prop[index + 1];

/*     trapezoidal angle of the downstream channel cross section */
/*     needed to calculate the critical depth (hk) */

    theta = prop[index + 2];
    tth = tan(theta);

/*     length of the downstream element (actually not needed for this */
/*     element) */

    dl = prop[index + 3];

/*     s0: sine of downstream slope (the slope is the angle phi between the */
/*         channel bottom and a plane orthogonal to the gravity vector */
/*     sqrts0: cosine of downstream slope */
/*     needed to calculate the normal depth (he) */

    s0 = prop[index + 4];
    if (s0 < -1.) {
	s_wsle(&io___7);
	do_lio(&c__9, &c__1, "*ERROR in sluicegatewear: sine of slope", (
		ftnlen)39);
	e_wsle();
	s_wsle(&io___8);
	do_lio(&c__9, &c__1, "       must be given explicitly", (ftnlen)31);
	e_wsle();
	s_wsle(&io___9);
	do_lio(&c__9, &c__1, "       for sluice gate or wear", (ftnlen)30);
	e_wsle();
	exit_(&c__201);
    }
    sqrts0 = 1. - s0 * s0;
    if (sqrts0 < 0.) {
	sqrts0 = 0.;
    } else {
	sqrts0 = sqrt(sqrts0);
    }

/*     grain size of downstream channel (if positive: White-Colebrook friction, */
/*     if negative: Manning); needed to calculate the normal depth (he) */

    xks = prop[index + 5];

    if (s_cmp(lakon + ((*nelem << 3) + 5), "SG", (ftnlen)2, (ftnlen)2) == 0) {

/*       depth underneath the sluice gate */

	ha = prop[index + 6];
	cd = 1.;
	hw = 0.;
    } else if (s_cmp(lakon + ((*nelem << 3) + 5), "WE", (ftnlen)2, (ftnlen)2) 
	    == 0) {

/*       height of the wear crest */

	hw = prop[index + 6];
	cd = prop[index + 7] * pow_dd(&c_b14, &c_b14) / sqrt(*dg);
	ha = 1e30;
    }

    hup = v[*nup * v_dim1 + 2];

/*     forward mode (frontwater curve) */

    if (*(unsigned char *)mode == 'F') {

/*       frontwater curve */

	if (hup == 0.) {

/*         upstream height not known: flow must be known */

	    v[*nmid * v_dim1 + 1] = *inv * *xflow;

/*         determine the critical depth */

	    hcrit_(xflow, rho, &b, &theta, dg, &sqrts0, &hk);
	    v[*ndo * v_dim1 + 3] = hk;

	    if (ha < hk) {

/*           A3 or B2 or B3 */

		area = (b + ha * tth) * ha;
		v[*ndo * v_dim1 + 2] = ha * sqrts0;
/* Computing 2nd power */
		d__1 = *xflow / (area * *rho);
		v[*nup * v_dim1 + 2] = d__1 * d__1 / (*dg * 2.) + ha;
		*nelup = *nelem;
		*nelem = 0;
		*nup = *ndo;
	    } else {

/*           depth underneath sluice gate exceeds critical depth */

/*           calculate the normal depth */

		if (xks > 0.) {
		    reynolds = *xflow / (b * *dvi);
		    form_fact__ = 1.;
		    hd = hk * 4.;
		    friction_coefficient__(&dl, &hd, &xks, &reynolds, &
			    form_fact__, &friction);
		}
		hnorm_(xflow, rho, &b, &theta, dg, &s0, &friction, &xks, &he);

		if (he < hk) {

/*             B2 */

		    area = (b + hk * tth) * hk;
/*              v(2,ndo)=(hk-epsilon)*sqrts0 */
		    v[*ndo * v_dim1 + 2] = hk * sqrts0;
/* Computing 2nd power */
		    d__1 = *xflow / (cd * area * *rho);
		    v[*nup * v_dim1 + 2] = d__1 * d__1 / (*dg * 2.) + hk * 
			    sqrts0 + hw;
		    *nelup = *nelem;
		    *nelem = 0;
		    *nup = *ndo;
		} else {

/*             no frontwater solution */

		    v[*ndo * v_dim1 + 2] = -1.;
		    *nelup = *nelem;
		    *nelem = 0;
		    *nup = *ndo;
		}
	    }
	} else if (hup - hw > 0. && *xflow == 0.) {

/*         upstream depth known: flow not known (start of a new branch) */

/*         calculate hk(Qmax) and compare with ha */

	    if (theta < 1e-10) {

/*           rectangular cross section */

		hkmax = (hup - hw) * 2. / 3.;
	    } else {

/*           trapezoidal cross section */

		aa = tth * 5. * sqrts0;
		bb = (hup - hw) * -4. * tth + b * 3. * sqrts0;
		cc = b * -2. * (hup - hw);
		hkmax = (-bb + sqrt(bb * bb - aa * 4. * cc)) / (aa * 2.);
	    }

	    if (ha < hkmax) {

/*           A3 or B2 or B3 */

		area = (b + ha * tth) * ha;
		*xflow = area * sqrt(*dg * 2. * (hup - ha * sqrts0)) * *rho;
		v[*nmid * v_dim1 + 1] = *inv * *xflow;
		if (kon[ipkon[*nelup] + 1] == 0) {
		    v[kon[ipkon[*nelup] + 2] * v_dim1 + 1] = *xflow;
		} else {
		    v[kon[ipkon[*nelup] + 2] * v_dim1 + 1] = -(*xflow);
		}
		v[*ndo * v_dim1 + 2] = ha * sqrts0;
		*nelup = *nelem;
		*nelem = 0;
		*nup = *ndo;
	    } else {

/*           calculate maximal flow */

		area = (b + hkmax * tth) * hkmax;
		*xflow = *rho * cd * area * sqrt(*dg * 2. * (hup - hw - hkmax)
			);

/*           calculate the normal depth */

		if (xks > 0.) {
		    reynolds = *xflow / (b * *dvi);
		    form_fact__ = 1.;
		    hd = hkmax * 4.;
		    friction_coefficient__(&dl, &hd, &xks, &reynolds, &
			    form_fact__, &friction);
		}
		hnorm_(xflow, rho, &b, &theta, dg, &s0, &friction, &xks, &he);

		if (he < hkmax) {

/*             B2 */

/*              v(2,ndo)=(hkmax-epsilon)*sqrts0 */
		    v[*ndo * v_dim1 + 2] = hkmax * sqrts0;
		    v[*nmid * v_dim1 + 1] = *inv * *xflow;
		    if (kon[ipkon[*nelup] + 1] == 0) {
			v[kon[ipkon[*nelup] + 2] * v_dim1 + 1] = *xflow;
		    } else {
			v[kon[ipkon[*nelup] + 2] * v_dim1 + 1] = -(*xflow);
		    }
		    *nelup = *nelem;
		    *nelem = 0;
		    *nup = *ndo;
		} else {

/*             no frontwater solution */

		    v[*ndo * v_dim1 + 2] = -1.;
		    *nelup = *nelem;
		    *nelem = 0;
		    *nup = *ndo;
		}
	    }
	} else {

/*         upstream depth known and flow known: sluice gate in the */
/*         middle of a channel: fluid depth upstream of gate is */
/*         recalculated; a wear in the middle of a channel is */
/*         simulated by a step and straight channel */

	    if (s_cmp(lakon + ((*nelem << 3) + 5), "WE", (ftnlen)2, (ftnlen)2)
		     == 0) {
		s_wsle(&io___27);
		do_lio(&c__9, &c__1, "*ERROR in sluicegatewear: WEAR element",
			 (ftnlen)38);
		e_wsle();
		s_wsle(&io___28);
		do_lio(&c__9, &c__1, "       must on one side be connected", (
			ftnlen)36);
		e_wsle();
		s_wsle(&io___29);
		do_lio(&c__9, &c__1, "       to exactly one CHANNEL INOUT", (
			ftnlen)35);
		e_wsle();
		s_wsle(&io___30);
		do_lio(&c__9, &c__1, "       element; faulty element:", (
			ftnlen)31);
		do_lio(&c__3, &c__1, (char *)&(*nelem), (ftnlen)sizeof(
			integer));
		e_wsle();
		exit_(&c__201);
	    }

	    v[*nmid * v_dim1 + 1] = *inv * *xflow;

/*          if((hup.lt.0.d0).or.(hup.gt.ha)) then */
	    if (hup > ha) {

/*           determine the critical depth */

		hcrit_(xflow, rho, &b, &theta, dg, &sqrts0, &hk);
		v[*ndo * v_dim1 + 3] = hk;

/*            if(ha.lt.hk) then */

/*     A3 or B2 or B3 */

		area = (b + ha * tth) * ha;
		v[*ndo * v_dim1 + 2] = ha * sqrts0;
		*(unsigned char *)mode = 'B';
		++(*nstack);
		istack[(*nstack << 1) + 1] = *nelem;
		istack[(*nstack << 1) + 2] = *ndo;
/*            else */
/* ! */
/* !             no disturbance of the flow */
/* ! */
/*              v(2,ndo)=v(2,nup) */
/*              v(1,nmid)=inv*xflow */
/*              nelup=nelem */
/*              nelem=0 */
/*              nup=ndo */
/* ! */
/* !     depth underneath sluice gate exceeds critical depth */
/* ! */
/* !     calculate the normal depth */
/* ! */
/*              if(xks.gt.0.d0) then */
/*                reynolds=xflow/(b*dvi) */
/*                form_fact=1.d0 */
/*                hd=4.d0*hk */
/*                call friction_coefficient(dl,hd,xks,reynolds,form_fact, */
/*     &               friction) */
/*              endif */
/*              call hnorm(xflow,rho,b,theta,dg,s0,friction,xks,he) */
/* ! */
/*              if(he.lt.hk) then */
/* ! */
/* !     B2 */
/* ! */
/*                area=(b+hk*tth)*hk */
/*                v(2,ndo)=(hk-epsilon)*sqrts0 */
/*                mode='B' */
/*                nstack=nstack+1 */
/*                istack(1,nstack)=nelem */
/*                istack(2,nstack)=ndo */
/*              else */
/* ! */
/* !     no frontwater solution */
/* ! */
/*                v(2,ndo)=-1.d0 */
/*                nelup=nelem */
/*                nelem=0 */
/*                nup=ndo */
/*              endif */
/* ! */
/* !             calculate the depth in the upstream node; */
/* !             for a gate element or wear in between other elements */
/* !             the upstream velocity is not assumed to be zero, */
/* !             i.e. no big reservoir since this makes no sense for */
/* !             steady state calculations */
/* ! */
/*              if(mode.eq.'B') then */
/*                if(v(2,ndo).ge.ha*sqrts0) then */
/*                  call hns(xflow,rho,b,theta,dg,sqrts0,ha,h2) */
/*                  v(2,nup)=h2/sqrts0 */
/* c                else */
/* c                  v(2,nup)=v(2,ndo)+hw */
/*                endif */
/*                neldo=nelem */
/*                ndo=nup */
/*                nelem=0 */
/*              endif */
/*            endif */
	    } else {

/*           no disturbance of the flow */

		v[*ndo * v_dim1 + 2] = v[*nup * v_dim1 + 2];
		v[*nmid * v_dim1 + 1] = *inv * *xflow;
		*nelup = *nelem;
		*nelem = 0;
		*nup = *ndo;
	    }
	}
    } else {

/*       mode = 'B': backwater curve */

	hdo = v[*ndo * v_dim1 + 2] / sqrts0;

	idof = (*nup - 1 << 3) + 2;
	nident_(&ikboun[1], &idof, nboun, &id);
	if (id > 0) {
	    if (ikboun[id] == idof) {

/*         hup is a boundary condition */

		if (hdo <= ha) {
		    area = (b + hdo * tth) * hdo;
		} else {
		    area = (b + ha * tth) * ha;
		}
		xflowcor = *rho * area * sqrt(*dg * 2. * (v[*nup * v_dim1 + 2]
			 - hdo * sqrts0));
		if ((d__1 = *xflow - xflowcor, abs(d__1)) <= *xflow * .001) {

/*     corrected flow is sufficiently close to assumed flow: */
/*     solution found */

		    if (*nstack > 0) {
			v[*nmid * v_dim1 + 1] = *xflow;
			*ndo = *nup;
			*neldo = *nelem;
			*nelem = 0;
			return 0;
		    }
		} else {

/*             new guess: mean of xflow and xflowcorr */

		    *xflow = (xflowcor + *xflow) / 2.;
		    *nelem = istack[(*nstack << 1) + 1];
		    *ndo = istack[(*nstack << 1) + 2];
		    return 0;
		}
	    }
	}

/*       xflow is given */

	if (hdo <= ha) {
	    area = (b + hdo * tth) * hdo;
	} else {
	    area = (b + ha * tth) * ha;
	}
/* Computing 2nd power */
	d__1 = *xflow / (*rho * area);
	v[*nup * v_dim1 + 2] = hdo * sqrts0 + d__1 * d__1 / (*dg * 2.);
	*ndo = *nup;
	*neldo = *nelem;
	*nelem = 0;
    }

    return 0;
} /* sluicegate_ */

