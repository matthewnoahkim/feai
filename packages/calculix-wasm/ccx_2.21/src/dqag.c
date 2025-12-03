/* dqag.f -- translated by f2c (version 20200916).
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

static doublereal c_b17 = 1.5;


/*     CMLIB - public domain */

/* Subroutine */ int dqag_(D_fp f, doublereal *a, doublereal *b, doublereal *
	epsabs, doublereal *epsrel, integer *key, doublereal *result, 
	doublereal *abserr, integer *neval, integer *ier, integer *limit, 
	integer *lenw, integer *last, integer *iwork, doublereal *work, 
	doublereal *phi, doublereal *lambda1, doublereal *zk0, doublereal *
	pup, doublereal *tup, doublereal *rurd, doublereal *xflow, doublereal 
	*kup)
{
    integer l1, l2, l3, lvl;
    extern /* Subroutine */ int dqage_(D_fp, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, integer *, doublereal *, 
	    doublereal *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, integer *, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *);
    doublereal d1mach[4];

/* ***begin prologue  dqag */
/* ***date written   800101   (yymmdd) */
/* ***revision date  830518   (yymmdd) */
/* ***category no.  h2a1a1 */
/* ***keywords  automatic integrator, general-purpose, */
/*             integrand examinator, globally adaptive, */
/*             gauss-kronrod */
/* ***author  piessens,robert,appl. math. & progr. div - k.u.leuven */
/*           de doncker,elise,appl. math. & progr. div. - k.u.leuven */
/* ***purpose  the routine calculates an approximation result to a given */
/*            definite integral i = integral of f over (a,b), */
/*            hopefully satisfying following claim for accuracy */
/*            abs(i-result)le.max(epsabs,epsrel*abs(i)). */
/* ***description */

/*        computation of a definite integral */
/*        standard fortran subroutine */
/*        double precision version */

/*            f      - double precision */
/*                     function subprogam defining the integrand */
/*                     function f(x). the actual name for f needs to be */
/*                     declared e x t e r n a l in the driver program. */

/*            a      - double precision */
/*                     lower limit of integration */

/*            b      - double precision */
/*                     upper limit of integration */

/*            epsabs - double precision */
/*                     absolute accoracy requested */
/*            epsrel - double precision */
/*                     relative accuracy requested */
/*                     if  epsabs.le.0 */
/*                     and epsrel.lt.max(50*rel.mach.acc.,0.5d-28), */
/*                     the routine will end with ier = 6. */

/*            key    - integer */
/*                     key for choice of local integration rule */
/*                     a gauss-kronrod pair is used with */
/*                       7 - 15 points if key.lt.2, */
/*                      10 - 21 points if key = 2, */
/*                      15 - 31 points if key = 3, */
/*                      20 - 41 points if key = 4, */
/*                      25 - 51 points if key = 5, */
/*                      30 - 61 points if key.gt.5. */

/*         on return */
/*            result - double precision */
/*                     approximation to the integral */

/*            abserr - double precision */
/*                     estimate of the modulus of the absolute error, */
/*                     which should equal or exceed abs(i-result) */

/*            neval  - integer */
/*                     number of integrand evaluations */

/*            ier    - integer */
/*                     ier = 0 normal and reliable termination of the */
/*                             routine. it is assumed that the requested */
/*                             accuracy has been achieved. */
/*                     ier.gt.0 abnormal termination of the routine */
/*                             the estimates for result and error are */
/*                             less reliable. it is assumed that the */
/*                             requested accuracy has not been achieved. */
/*                      error messages */
/*                     ier = 1 maximum number of subdivisions allowed */
/*                             has been achieved. one can allow more */
/*                             subdivisions by increasing the value of */
/*                             limit (and taking the according dimension */
/*                             adjustments into account). however, if */
/*                             this yield no improvement it is advised */
/*                             to analyze the integrand in order to */
/*                             determine the integration difficulaties. */
/*                             if the position of a local difficulty can */
/*                             be determined (i.e.singularity, */
/*                             discontinuity within the interval) one */
/*                             will probably gain from splitting up the */
/*                             interval at this point and calling the */
/*                             integrator on the subranges. if possible, */
/*                             an appropriate special-purpose integrator */
/*                             should be used which is designed for */
/*                             handling the type of difficulty involved. */
/*                         = 2 the occurrence of roundoff error is */
/*                             detected, which prevents the requested */
/*                             tolerance from being achieved. */
/*                         = 3 extremely bad integrand behaviour occurs */
/*                             at some points of the integration */
/*                             interval. */
/*                         = 6 the input is invalid, because */
/*                             (epsabs.le.0 and */
/*                              epsrel.lt.max(50*rel.mach.acc.,0.5d-28)) */
/*                             or limit.lt.1 or lenw.lt.limit*4. */
/*                             result, abserr, neval, last are set */
/*                             to zero. */
/*                             except when lenw is invalid, iwork(1), */
/*                             work(limit*2+1) and work(limit*3+1) are */
/*                             set to zero, work(1) is set to a and */
/*                             work(limit+1) to b. */

/*         dimensioning parameters */
/*            limit - integer */
/*                    dimensioning parameter for iwork */
/*                    limit determines the maximum number of subintervals */
/*                    in the partition of the given integration interval */
/*                    (a,b), limit.ge.1. */
/*                    if limit.lt.1, the routine will end with ier = 6. */

/*            lenw  - integer */
/*                    dimensioning parameter for work */
/*                    lenw must be at least limit*4. */
/*                    if lenw.lt.limit*4, the routine will end with */
/*                    ier = 6. */

/*            last  - integer */
/*                    on return, last equals the number of subintervals */
/*                    produced in the subdiviosion process, which */
/*                    determines the number of significant elements */
/*                    actually in the work arrays. */

/*         work arrays */
/*            iwork - integer */
/*                    vector of dimension at least limit, the first k */
/*                    elements of which contain pointers to the error */
/*                    estimates over the subintervals, such that */
/*                    work(limit*3+iwork(1)),... , work(limit*3+iwork(k)) */
/*                    form a decreasing sequence with k = last if */
/*                    last.le.(limit/2+2), and k = limit+1-last otherwise */

/*            work  - double precision */
/*                    vector of dimension at least lenw */
/*                    on return */
/*                    work(1), ..., work(last) contain the left end */
/*                    points of the subintervals in the partition of */
/*                     (a,b), */
/*                    work(limit+1), ..., work(limit+last) contain the */
/*                     right end points, */
/*                    work(limit*2+1), ..., work(limit*2+last) contain */
/*                     the integral approximations over the subintervals, */
/*                    work(limit*3+1), ..., work(limit*3+last) contain */
/*                     the error estimates. */

/* ***references  (none) */
/* ***routines called  dqage,xerror */
/* ***end prologue  dqag */



/*         check validity of lenw. */

    /* Parameter adjustments */
    --iwork;
    --work;

    /* Function Body */
    d1mach[0] = 1e21f;
    d1mach[1] = 0.;
    d1mach[2] = 0.;
    d1mach[3] = 1e-21f;

/* ***first executable statement  dqag */
    *ier = 6;
    *neval = 0;
    *last = 0;
    *result = 0.;
    *abserr = 0.;
    if (*limit < 1 || *lenw < *limit << 2) {
	goto L10;
    }

/*         prepare call for dqage. */

    l1 = *limit + 1;
    l2 = *limit + l1;
    l3 = *limit + l2;

    dqage_((D_fp)f, a, b, epsabs, epsrel, key, limit, result, abserr, neval, 
	    ier, &work[1], &work[l1], &work[l2], &work[l3], &iwork[1], last, 
	    phi, lambda1, zk0, pup, tup, rurd, xflow, kup);

/*         call error handler if necessary. */

    lvl = 0;
L10:
    if (*ier == 6) {
	lvl = 1;
    }
/*      if(ier.ne.0) call xerror(26habnormal return from dqag ,26,ier,lvl) */
    return 0;
} /* dqag_ */

/* Subroutine */ int dqage_(D_fp f, doublereal *a, doublereal *b, doublereal *
	epsabs, doublereal *epsrel, integer *key, integer *limit, doublereal *
	result, doublereal *abserr, integer *neval, integer *ier, doublereal *
	alist__, doublereal *blist, doublereal *rlist, doublereal *elist, 
	integer *iord, integer *last, doublereal *phi, doublereal *lambda1, 
	doublereal *zk0, doublereal *pup, doublereal *tup, doublereal *rurd, 
	doublereal *xflow, doublereal *kup)
{
    /* System generated locals */
    integer i__1;
    doublereal d__1, d__2;

    /* Local variables */
    integer k;
    doublereal a1, a2, b1, b2, area;
    extern /* Subroutine */ int dqk21_(D_fp, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *), dqk31_(
	    D_fp, doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *), dqk41_(D_fp, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *), dqk15_(D_fp, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *), dqk51_(
	    D_fp, doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *), dqk61_(D_fp, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *);
    integer keyf;
    doublereal area1, area2, area12, erro12, defab1, defab2;
    integer nrmax;
    doublereal uflow, d1mach[4];
    integer iroff1, iroff2;
    doublereal error1, error2, defabs, epmach, errbnd, resabs, errmax;
    integer maxerr;
    doublereal errsum;
    extern /* Subroutine */ int dqpsrt_(integer *, integer *, integer *, 
	    doublereal *, doublereal *, integer *, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *);

/* ***begin prologue  dqage */
/* ***date written   800101   (yymmdd) */
/* ***revision date  830518   (yymmdd) */
/* ***category no.  h2a1a1 */
/* ***keywords  automatic integrator, general-purpose, */
/*             integrand examinator, globally adaptive, */
/*             gauss-kronrod */
/* ***author  piessens,robert,appl. math. & progr. div. - k.u.leuven */
/*           de doncker,elise,appl. math. & progr. div. - k.u.leuven */
/* ***purpose  the routine calculates an approximation result to a given */
/*            definite integral   i = integral of f over (a,b), */
/*            hopefully satisfying following claim for accuracy */
/*            abs(i-reslt).le.max(epsabs,epsrel*abs(i)). */
/* ***description */

/*        computation of a definite integral */
/*        standard fortran subroutine */
/*        double precision version */

/*        parameters */
/*         on entry */
/*            f      - double precision */
/*                     function subprogram defining the integrand */
/*                     function f(x). the actual name for f needs to be */
/*                     declared e x t e r n a l in the driver program. */

/*            a      - double precision */
/*                     lower limit of integration */

/*            b      - double precision */
/*                     upper limit of integration */

/*            epsabs - double precision */
/*                     absolute accuracy requested */
/*            epsrel - double precision */
/*                     relative accuracy requested */
/*                     if  epsabs.le.0 */
/*                     and epsrel.lt.max(50*rel.mach.acc.,0.5d-28), */
/*                     the routine will end with ier = 6. */

/*            key    - integer */
/*                     key for choice of local integration rule */
/*                     a gauss-kronrod pair is used with */
/*                          7 - 15 points if key.lt.2, */
/*                         10 - 21 points if key = 2, */
/*                         15 - 31 points if key = 3, */
/*                         20 - 41 points if key = 4, */
/*                         25 - 51 points if key = 5, */
/*                         30 - 61 points if key.gt.5. */

/*            limit  - integer */
/*                     gives an upperbound on the number of subintervals */
/*                     in the partition of (a,b), limit.ge.1. */

/*         on return */
/*            result - double precision */
/*                     approximation to the integral */

/*            abserr - double precision */
/*                     estimate of the modulus of the absolute error, */
/*                     which should equal or exceed abs(i-result) */

/*            neval  - integer */
/*                     number of integrand evaluations */

/*            ier    - integer */
/*                     ier = 0 normal and reliable termination of the */
/*                             routine. it is assumed that the requested */
/*                             accuracy has been achieved. */
/*                     ier.gt.0 abnormal termination of the routine */
/*                             the estimates for result and error are */
/*                             less reliable. it is assumed that the */
/*                             requested accuracy has not been achieved. */
/*            error messages */
/*                     ier = 1 maximum number of subdivisions allowed */
/*                             has been achieved. one can allow more */
/*                             subdivisions by increasing the value */
/*                             of limit. */
/*                             however, if this yields no improvement it */
/*                             is rather advised to analyze the integrand */
/*                             in order to determine the integration */
/*                             difficulties. if the position of a local */
/*                             difficulty can be determined(e.g. */
/*                             singularity, discontinuity within the */
/*                             interval) one will probably gain from */
/*                             splitting up the interval at this point */
/*                             and calling the integrator on the */
/*                             subranges. if possible, an appropriate */
/*                             special-purpose integrator should be used */
/*                             which is designed for handling the type of */
/*                             difficulty involved. */
/*                         = 2 the occurrence of roundoff error is */
/*                             detected, which prevents the requested */
/*                             tolerance from being achieved. */
/*                         = 3 extremely bad integrand behaviour occurs */
/*                             at some points of the integration */
/*                             interval. */
/*                         = 6 the input is invalid, because */
/*                             (epsabs.le.0 and */
/*                              epsrel.lt.max(50*rel.mach.acc.,0.5d-28), */
/*                             result, abserr, neval, last, rlist(1) , */
/*                             elist(1) and iord(1) are set to zero. */
/*                             alist(1) and blist(1) are set to a and b */
/*                             respectively. */

/*            alist   - double precision */
/*                      vector of dimension at least limit, the first */
/*                       last  elements of which are the left */
/*                      end points of the subintervals in the partition */
/*                      of the given integration range (a,b) */

/*            blist   - double precision */
/*                      vector of dimension at least limit, the first */
/*                       last  elements of which are the right */
/*                      end points of the subintervals in the partition */
/*                      of the given integration range (a,b) */

/*            rlist   - double precision */
/*                      vector of dimension at least limit, the first */
/*                       last  elements of which are the */
/*                      integral approximations on the subintervals */

/*            elist   - double precision */
/*                      vector of dimension at least limit, the first */
/*                       last  elements of which are the moduli of the */
/*                      absolute error estimates on the subintervals */

/*            iord    - integer */
/*                      vector of dimension at least limit, the first k */
/*                      elements of which are pointers to the */
/*                      error estimates over the subintervals, */
/*                      such that elist(iord(1)), ..., */
/*                      elist(iord(k)) form a decreasing sequence, */
/*                      with k = last if last.le.(limit/2+2), and */
/*                      k = limit+1-last otherwise */

/*            last    - integer */
/*                      number of subintervals actually produced in the */
/*                      subdivision process */

/* ***references  (none) */
/* ***routines called  d1mach,dqk15,dqk21,dqk31, */
/*                    dqk41,dqk51,dqk61,dqpsrt */
/* ***end prologue  dqage */



    /* Parameter adjustments */
    --iord;
    --elist;
    --rlist;
    --blist;
    --alist__;

    /* Function Body */
    d1mach[0] = 1e21f;
    d1mach[1] = 0.;
    d1mach[2] = 0.;
    d1mach[3] = 1e-21f;

/*            list of major variables */
/*            ----------------------- */

/*           alist     - list of left end points of all subintervals */
/*                       considered up to now */
/*           blist     - list of right end points of all subintervals */
/*                       considered up to now */
/*           rlist(i)  - approximation to the integral over */
/*                      (alist(i),blist(i)) */
/*           elist(i)  - error estimate applying to rlist(i) */
/*           maxerr    - pointer to the interval with largest */
/*                       error estimate */
/*           errmax    - elist(maxerr) */
/*           area      - sum of the integrals over the subintervals */
/*           errsum    - sum of the errors over the subintervals */
/*           errbnd    - requested accuracy max(epsabs,epsrel* */
/*                       abs(result)) */
/*           *****1    - variable for the left subinterval */
/*           *****2    - variable for the right subinterval */
/*           last      - index for subdivision */


/*           machine dependent constants */
/*           --------------------------- */

/*           epmach  is the largest relative spacing. */
/*           uflow  is the smallest positive magnitude. */

/* ***first executable statement  dqage */
    epmach = d1mach[3];
    uflow = d1mach[0];

/*           test on validity of parameters */
/*           ------------------------------ */

    *ier = 0;
    *neval = 0;
    *last = 0;
    *result = 0.;
    *abserr = 0.;
    alist__[1] = *a;
    blist[1] = *b;
    rlist[1] = 0.;
    elist[1] = 0.;
    iord[1] = 0;
/* Computing MAX */
    d__1 = epmach * 50.;
    if (*epsabs <= 0. && *epsrel < max(d__1,5e-29)) {
	*ier = 6;
    }
    if (*ier == 6) {
	goto L999;
    }

/*           first approximation to the integral */
/*           ----------------------------------- */

    keyf = *key;
    if (*key <= 0) {
	keyf = 1;
    }
    if (*key >= 7) {
	keyf = 6;
    }
    *neval = 0;
    if (keyf == 1) {
	dqk15_((D_fp)f, a, b, result, abserr, &defabs, &resabs, phi, lambda1, 
		zk0, pup, tup, rurd, xflow, kup);
    }
    if (keyf == 2) {
	dqk21_((D_fp)f, a, b, result, abserr, &defabs, &resabs, phi, lambda1, 
		zk0, pup, tup, rurd, xflow, kup);
    }
    if (keyf == 3) {
	dqk31_((D_fp)f, a, b, result, abserr, &defabs, &resabs, phi, lambda1, 
		zk0, pup, tup, rurd, xflow, kup);
    }
    if (keyf == 4) {
	dqk41_((D_fp)f, a, b, result, abserr, &defabs, &resabs, phi, lambda1, 
		zk0, pup, tup, rurd, xflow, kup);
    }
    if (keyf == 5) {
	dqk51_((D_fp)f, a, b, result, abserr, &defabs, &resabs, phi, lambda1, 
		zk0, pup, tup, rurd, xflow, kup);
    }
    if (keyf == 6) {
	dqk61_((D_fp)f, a, b, result, abserr, &defabs, &resabs, phi, lambda1, 
		zk0, pup, tup, rurd, xflow, kup);
    }
    *last = 1;
    rlist[1] = *result;
    elist[1] = *abserr;
    iord[1] = 1;

/*           test on accuracy. */

/* Computing MAX */
    d__1 = *epsabs, d__2 = *epsrel * abs(*result);
    errbnd = max(d__1,d__2);
    if (*abserr <= epmach * 50. * defabs && *abserr > errbnd) {
	*ier = 2;
    }
    if (*limit == 1) {
	*ier = 1;
    }
    if (*ier != 0 || *abserr <= errbnd && *abserr != resabs || *abserr == 0.) 
	    {
	goto L60;
    }

/*           initialization */
/*           -------------- */


    errmax = *abserr;
    maxerr = 1;
    area = *result;
    errsum = *abserr;
    nrmax = 1;
    iroff1 = 0;
    iroff2 = 0;

/*           main do-loop */
/*           ------------ */

    i__1 = *limit;
    for (*last = 2; *last <= i__1; ++(*last)) {

/*           bisect the subinterval with the largest error estimate. */

	a1 = alist__[maxerr];
	b1 = (alist__[maxerr] + blist[maxerr]) * .5;
	a2 = b1;
	b2 = blist[maxerr];
	if (keyf == 1) {
	    dqk15_((D_fp)f, &a1, &b1, &area1, &error1, &resabs, &defab1, phi, 
		    lambda1, zk0, pup, tup, rurd, xflow, kup);
	}
	if (keyf == 2) {
	    dqk21_((D_fp)f, &a1, &b1, &area1, &error1, &resabs, &defab1, phi, 
		    lambda1, zk0, pup, tup, rurd, xflow, kup);
	}
	if (keyf == 3) {
	    dqk31_((D_fp)f, &a1, &b1, &area1, &error1, &resabs, &defab1, phi, 
		    lambda1, zk0, pup, tup, rurd, xflow, kup);
	}
	if (keyf == 4) {
	    dqk41_((D_fp)f, &a1, &b1, &area1, &error1, &resabs, &defab1, phi, 
		    lambda1, zk0, pup, tup, rurd, xflow, kup);
	}
	if (keyf == 5) {
	    dqk51_((D_fp)f, &a1, &b1, &area1, &error1, &resabs, &defab1, phi, 
		    lambda1, zk0, pup, tup, rurd, xflow, kup);
	}
	if (keyf == 6) {
	    dqk61_((D_fp)f, &a1, &b1, &area1, &error1, &resabs, &defab1, phi, 
		    lambda1, zk0, pup, tup, rurd, xflow, kup);
	}
	if (keyf == 1) {
	    dqk15_((D_fp)f, &a2, &b2, &area2, &error2, &resabs, &defab2, phi, 
		    lambda1, zk0, pup, tup, rurd, xflow, kup);
	}
	if (keyf == 2) {
	    dqk21_((D_fp)f, &a2, &b2, &area2, &error2, &resabs, &defab2, phi, 
		    lambda1, zk0, pup, tup, rurd, xflow, kup);
	}
	if (keyf == 3) {
	    dqk31_((D_fp)f, &a2, &b2, &area2, &error2, &resabs, &defab2, phi, 
		    lambda1, zk0, pup, tup, rurd, xflow, kup);
	}
	if (keyf == 4) {
	    dqk41_((D_fp)f, &a2, &b2, &area2, &error2, &resabs, &defab2, phi, 
		    lambda1, zk0, pup, tup, rurd, xflow, kup);
	}
	if (keyf == 5) {
	    dqk51_((D_fp)f, &a2, &b2, &area2, &error2, &resabs, &defab2, phi, 
		    lambda1, zk0, pup, tup, rurd, xflow, kup);
	}
	if (keyf == 6) {
	    dqk61_((D_fp)f, &a2, &b2, &area2, &error2, &resabs, &defab2, phi, 
		    lambda1, zk0, pup, tup, rurd, xflow, kup);
	}

/*           improve previous approximations to integral */
/*           and error and test for accuracy. */

	++(*neval);
	area12 = area1 + area2;
	erro12 = error1 + error2;
	errsum = errsum + erro12 - errmax;
	area = area + area12 - rlist[maxerr];
	if (defab1 == error1 || defab2 == error2) {
	    goto L5;
	}
	if ((d__1 = rlist[maxerr] - area12, abs(d__1)) <= abs(area12) * 1e-5 
		&& erro12 >= errmax * .99) {
	    ++iroff1;
	}
	if (*last > 10 && erro12 > errmax) {
	    ++iroff2;
	}
L5:
	rlist[maxerr] = area1;
	rlist[*last] = area2;
/* Computing MAX */
	d__1 = *epsabs, d__2 = *epsrel * abs(area);
	errbnd = max(d__1,d__2);
	if (errsum <= errbnd) {
	    goto L8;
	}

/*           test for roundoff error and eventually set error flag. */

	if (iroff1 >= 6 || iroff2 >= 20) {
	    *ier = 2;
	}

/*           set error flag in the case that the number of subintervals */
/*           equals limit. */

	if (*last == *limit) {
	    *ier = 1;
	}

/*           set error flag in the case of bad integrand behaviour */
/*           at a point of the integration range. */

/* Computing MAX */
	d__1 = abs(a1), d__2 = abs(b2);
	if (max(d__1,d__2) <= (epmach * 100. + 1.) * (abs(a2) + uflow * 1e3)) 
		{
	    *ier = 3;
	}

/*           append the newly-created intervals to the list. */

L8:
	if (error2 > error1) {
	    goto L10;
	}
	alist__[*last] = a2;
	blist[maxerr] = b1;
	blist[*last] = b2;
	elist[maxerr] = error1;
	elist[*last] = error2;
	goto L20;
L10:
	alist__[maxerr] = a2;
	alist__[*last] = a1;
	blist[*last] = b1;
	rlist[maxerr] = area2;
	rlist[*last] = area1;
	elist[maxerr] = error2;
	elist[*last] = error1;

/*           call subroutine dqpsrt to maintain the descending ordering */
/*           in the list of error estimates and select the subinterval */
/*           with the largest error estimate (to be bisected next). */

L20:
	dqpsrt_(limit, last, &maxerr, &errmax, &elist[1], &iord[1], &nrmax, 
		phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
/* ***jump out of do-loop */
	if (*ier != 0 || errsum <= errbnd) {
	    goto L40;
	}
/* L30: */
    }

/*           compute final result. */
/*           --------------------- */

L40:
    *result = 0.;
    i__1 = *last;
    for (k = 1; k <= i__1; ++k) {
	*result += rlist[k];
/* L50: */
    }
    *abserr = errsum;
L60:
    if (keyf != 1) {
	*neval = (keyf * 10 + 1) * ((*neval << 1) + 1);
    }
    if (keyf == 1) {
	*neval = *neval * 30 + 15;
    }
L999:
    return 0;
} /* dqage_ */

/* Subroutine */ int dqk15_(D_fp f, doublereal *a, doublereal *b, doublereal *
	result, doublereal *abserr, doublereal *resabs, doublereal *resasc, 
	doublereal *phi, doublereal *lambda1, doublereal *zk0, doublereal *
	pup, doublereal *tup, doublereal *rurd, doublereal *xflow, doublereal 
	*kup)
{
    /* Initialized data */

    static doublereal wg[4] = { .129484966168869693270611432679082,
	    .27970539148927666790146777142378,
	    .381830050505118944950369775488975,
	    .417959183673469387755102040816327 };
    static doublereal xgk[8] = { .991455371120812639206854697526329,
	    .949107912342758524526189684047851,
	    .864864423359769072789712788640926,
	    .741531185599394439863864773280788,
	    .58608723546769113029414483825873,
	    .405845151377397166906606412076961,
	    .207784955007898467600689403773245,0. };
    static doublereal wgk[8] = { .02293532201052922496373200805897,
	    .063092092629978553290700663189204,
	    .104790010322250183839876322541518,
	    .140653259715525918745189590510238,
	    .16900472663926790282658342659855,
	    .190350578064785409913256402421014,
	    .204432940075298892414161999234649,
	    .209482141084727828012999174891714 };

    /* System generated locals */
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *);

    /* Local variables */
    integer j;
    doublereal fc, fv1[7], fv2[7];
    integer jtw;
    doublereal absc, resg, resk, fsum, fval1, fval2;
    integer jtwm1;
    doublereal hlgth, centr, reskh, uflow, d1mach[4], epmach, dhlgth;

/* ***begin prologue  dqk15 */
/* ***date written   800101   (yymmdd) */
/* ***revision date  830518   (yymmdd) */
/* ***category no.  h2a1a2 */
/* ***keywords  15-point gauss-kronrod rules */
/* ***author  piessens,robert,appl. math. & progr. div. - k.u.leuven */
/*           de doncker,elise,appl. math. & progr. div - k.u.leuven */
/* ***purpose  to compute i = integral of f over (a,b), with error */
/*                           estimate */
/*                       j = integral of abs(f) over (a,b) */
/* ***description */

/*           integration rules */
/*           standard fortran subroutine */
/*           double precision version */

/*           parameters */
/*            on entry */
/*              f      - double precision */
/*                       function subprogram defining the integrand */
/*                       function f(x). the actual name for f needs to be */
/*                       declared e x t e r n a l in the calling program. */

/*              a      - double precision */
/*                       lower limit of integration */

/*              b      - double precision */
/*                       upper limit of integration */

/*            on return */
/*              result - double precision */
/*                       approximation to the integral i */
/*                       result is computed by applying the 15-point */
/*                       kronrod rule (resk) obtained by optimal addition */
/*                       of abscissae to the7-point gauss rule(resg). */

/*              abserr - double precision */
/*                       estimate of the modulus of the absolute error, */
/*                       which should not exceed abs(i-result) */

/*              resabs - double precision */
/*                       approximation to the integral j */

/*              resasc - double precision */
/*                       approximation to the integral of abs(f-i/(b-a)) */
/*                       over (a,b) */

/* ***references  (none) */
/* ***routines called  d1mach */
/* ***end prologue  dqk15 */


    d1mach[0] = 1e21f;
    d1mach[1] = 0.;
    d1mach[2] = 0.;
    d1mach[3] = 1e-21f;

/*           the abscissae and weights are given for the interval (-1,1). */
/*           because of symmetry only the positive abscissae and their */
/*           corresponding weights are given. */

/*           xgk    - abscissae of the 15-point kronrod rule */
/*                    xgk(2), xgk(4), ...  abscissae of the 7-point */
/*                    gauss rule */
/*                    xgk(1), xgk(3), ...  abscissae which are optimally */
/*                    added to the 7-point gauss rule */

/*           wgk    - weights of the 15-point kronrod rule */

/*           wg     - weights of the 7-point gauss rule */


/* gauss quadrature weights and kronron quadrature abscissae and weights */
/* as evaluated with 80 decimal digit arithmetic by l. w. fullerton, */
/* bell labs, nov. 1981. */





/*           list of major variables */
/*           ----------------------- */

/*           centr  - mid point of the interval */
/*           hlgth  - half-length of the interval */
/*           absc   - abscissa */
/*           fval*  - function value */
/*           resg   - result of the 7-point gauss formula */
/*           resk   - result of the 15-point kronrod formula */
/*           reskh  - approximation to the mean value of f over (a,b), */
/*                    i.e. to i/(b-a) */

/*           machine dependent constants */
/*           --------------------------- */

/*           epmach is the largest relative spacing. */
/*           uflow is the smallest positive magnitude. */

/* ***first executable statement  dqk15 */
    epmach = d1mach[3];
    uflow = d1mach[0];

    centr = (*a + *b) * .5;
    hlgth = (*b - *a) * .5;
    dhlgth = abs(hlgth);

/*           compute the 15-point kronrod approximation to */
/*           the integral, and estimate the absolute error. */

    fc = (*f)(&centr, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
    resg = fc * wg[3];
    resk = fc * wgk[7];
    *resabs = abs(resk);
    for (j = 1; j <= 3; ++j) {
	jtw = j << 1;
	absc = hlgth * xgk[jtw - 1];
	d__1 = centr - absc;
	fval1 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	d__1 = centr + absc;
	fval2 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	fv1[jtw - 1] = fval1;
	fv2[jtw - 1] = fval2;
	fsum = fval1 + fval2;
	resg += wg[j - 1] * fsum;
	resk += wgk[jtw - 1] * fsum;
	*resabs += wgk[jtw - 1] * (abs(fval1) + abs(fval2));
/* L10: */
    }
    for (j = 1; j <= 4; ++j) {
	jtwm1 = (j << 1) - 1;
	absc = hlgth * xgk[jtwm1 - 1];
	d__1 = centr - absc;
	fval1 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	d__1 = centr + absc;
	fval2 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	fv1[jtwm1 - 1] = fval1;
	fv2[jtwm1 - 1] = fval2;
	fsum = fval1 + fval2;
	resk += wgk[jtwm1 - 1] * fsum;
	*resabs += wgk[jtwm1 - 1] * (abs(fval1) + abs(fval2));
/* L15: */
    }
    reskh = resk * .5;
    *resasc = wgk[7] * (d__1 = fc - reskh, abs(d__1));
    for (j = 1; j <= 7; ++j) {
	*resasc += wgk[j - 1] * ((d__1 = fv1[j - 1] - reskh, abs(d__1)) + (
		d__2 = fv2[j - 1] - reskh, abs(d__2)));
/* L20: */
    }
    *result = resk * hlgth;
    *resabs *= dhlgth;
    *resasc *= dhlgth;
    *abserr = (d__1 = (resk - resg) * hlgth, abs(d__1));
    if (*resasc != 0. && *abserr != 0.) {
/* Computing MIN */
	d__3 = *abserr * 200. / *resasc;
	d__1 = 1., d__2 = pow_dd(&d__3, &c_b17);
	*abserr = *resasc * min(d__1,d__2);
    }
    if (*resabs > uflow / (epmach * 50.)) {
/* Computing MAX */
	d__1 = epmach * 50. * *resabs;
	*abserr = max(d__1,*abserr);
    }
    return 0;
} /* dqk15_ */

/* Subroutine */ int dqk21_(D_fp f, doublereal *a, doublereal *b, doublereal *
	result, doublereal *abserr, doublereal *resabs, doublereal *resasc, 
	doublereal *phi, doublereal *lambda1, doublereal *zk0, doublereal *
	pup, doublereal *tup, doublereal *rurd, doublereal *xflow, doublereal 
	*kup)
{
    /* Initialized data */

    static doublereal wg[5] = { .066671344308688137593568809893332,
	    .149451349150580593145776339657697,
	    .219086362515982043995534934228163,
	    .269266719309996355091226921569469,
	    .295524224714752870173892994651338 };
    static doublereal xgk[11] = { .995657163025808080735527280689003,
	    .973906528517171720077964012084452,
	    .930157491355708226001207180059508,
	    .865063366688984510732096688423493,
	    .780817726586416897063717578345042,
	    .679409568299024406234327365114874,
	    .562757134668604683339000099272694,
	    .433395394129247190799265943165784,
	    .294392862701460198131126603103866,
	    .14887433898163121088482600112972,0. };
    static doublereal wgk[11] = { .011694638867371874278064396062192,
	    .03255816230796472747881897245939,
	    .05475589657435199603138130024458,
	    .07503967481091995276704314091619,
	    .093125454583697605535065465083366,
	    .109387158802297641899210590325805,
	    .123491976262065851077958109831074,
	    .134709217311473325928054001771707,
	    .142775938577060080797094273138717,
	    .147739104901338491374841515972068,
	    .149445554002916905664936468389821 };

    /* System generated locals */
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *);

    /* Local variables */
    integer j;
    doublereal fc, fv1[10], fv2[10];
    integer jtw;
    doublereal absc, resg, resk, fsum, fval1, fval2;
    integer jtwm1;
    doublereal hlgth, centr, reskh, uflow, d1mach[4], epmach, dhlgth;

/* ***begin prologue  dqk21 */
/* ***date written   800101   (yymmdd) */
/* ***revision date  830518   (yymmdd) */
/* ***category no.  h2a1a2 */
/* ***keywords  21-point gauss-kronrod rules */
/* ***author  piessens,robert,appl. math. & progr. div. - k.u.leuven */
/*           de doncker,elise,appl. math. & progr. div. - k.u.leuven */
/* ***purpose  to compute i = integral of f over (a,b), with error */
/*                           estimate */
/*                       j = integral of abs(f) over (a,b) */
/* ***description */

/*           integration rules */
/*           standard fortran subroutine */
/*           double precision version */

/*           parameters */
/*            on entry */
/*              f      - double precision */
/*                       function subprogram defining the integrand */
/*                       function f(x). the actual name for f needs to be */
/*                       declared e x t e r n a l in the driver program. */

/*              a      - double precision */
/*                       lower limit of integration */

/*              b      - double precision */
/*                       upper limit of integration */

/*            on return */
/*              result - double precision */
/*                       approximation to the integral i */
/*                       result is computed by applying the 21-point */
/*                       kronrod rule (resk) obtained by optimal addition */
/*                       of abscissae to the 10-point gauss rule (resg). */

/*              abserr - double precision */
/*                       estimate of the modulus of the absolute error, */
/*                       which should not exceed abs(i-result) */

/*              resabs - double precision */
/*                       approximation to the integral j */

/*              resasc - double precision */
/*                       approximation to the integral of abs(f-i/(b-a)) */
/*                       over (a,b) */

/* ***references  (none) */
/* ***routines called  d1mach */
/* ***end prologue  dqk21 */


    d1mach[0] = 1e21f;
    d1mach[1] = 0.;
    d1mach[2] = 0.;
    d1mach[3] = 1e-21f;

/*           the abscissae and weights are given for the interval (-1,1). */
/*           because of symmetry only the positive abscissae and their */
/*           corresponding weights are given. */

/*           xgk    - abscissae of the 21-point kronrod rule */
/*                    xgk(2), xgk(4), ...  abscissae of the 10-point */
/*                    gauss rule */
/*                    xgk(1), xgk(3), ...  abscissae which are optimally */
/*                    added to the 10-point gauss rule */

/*           wgk    - weights of the 21-point kronrod rule */

/*           wg     - weights of the 10-point gauss rule */


/* gauss quadrature weights and kronron quadrature abscissae and weights */
/* as evaluated with 80 decimal digit arithmetic by l. w. fullerton, */
/* bell labs, nov. 1981. */





/*           list of major variables */
/*           ----------------------- */

/*           centr  - mid point of the interval */
/*           hlgth  - half-length of the interval */
/*           absc   - abscissa */
/*           fval*  - function value */
/*           resg   - result of the 10-point gauss formula */
/*           resk   - result of the 21-point kronrod formula */
/*           reskh  - approximation to the mean value of f over (a,b), */
/*                    i.e. to i/(b-a) */


/*           machine dependent constants */
/*           --------------------------- */

/*           epmach is the largest relative spacing. */
/*           uflow is the smallest positive magnitude. */

/* ***first executable statement  dqk21 */
    epmach = d1mach[3];
    uflow = d1mach[0];

    centr = (*a + *b) * .5;
    hlgth = (*b - *a) * .5;
    dhlgth = abs(hlgth);

/*           compute the 21-point kronrod approximation to */
/*           the integral, and estimate the absolute error. */

    resg = 0.;
    fc = (*f)(&centr, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
    resk = wgk[10] * fc;
    *resabs = abs(resk);
    for (j = 1; j <= 5; ++j) {
	jtw = j << 1;
	absc = hlgth * xgk[jtw - 1];
	d__1 = centr - absc;
	fval1 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	d__1 = centr + absc;
	fval2 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	fv1[jtw - 1] = fval1;
	fv2[jtw - 1] = fval2;
	fsum = fval1 + fval2;
	resg += wg[j - 1] * fsum;
	resk += wgk[jtw - 1] * fsum;
	*resabs += wgk[jtw - 1] * (abs(fval1) + abs(fval2));
/* L10: */
    }
    for (j = 1; j <= 5; ++j) {
	jtwm1 = (j << 1) - 1;
	absc = hlgth * xgk[jtwm1 - 1];
	d__1 = centr - absc;
	fval1 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	d__1 = centr + absc;
	fval2 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	fv1[jtwm1 - 1] = fval1;
	fv2[jtwm1 - 1] = fval2;
	fsum = fval1 + fval2;
	resk += wgk[jtwm1 - 1] * fsum;
	*resabs += wgk[jtwm1 - 1] * (abs(fval1) + abs(fval2));
/* L15: */
    }
    reskh = resk * .5;
    *resasc = wgk[10] * (d__1 = fc - reskh, abs(d__1));
    for (j = 1; j <= 10; ++j) {
	*resasc += wgk[j - 1] * ((d__1 = fv1[j - 1] - reskh, abs(d__1)) + (
		d__2 = fv2[j - 1] - reskh, abs(d__2)));
/* L20: */
    }
    *result = resk * hlgth;
    *resabs *= dhlgth;
    *resasc *= dhlgth;
    *abserr = (d__1 = (resk - resg) * hlgth, abs(d__1));
    if (*resasc != 0. && *abserr != 0.) {
/* Computing MIN */
	d__3 = *abserr * 200. / *resasc;
	d__1 = 1., d__2 = pow_dd(&d__3, &c_b17);
	*abserr = *resasc * min(d__1,d__2);
    }
    if (*resabs > uflow / (epmach * 50.)) {
/* Computing MAX */
	d__1 = epmach * 50. * *resabs;
	*abserr = max(d__1,*abserr);
    }
    return 0;
} /* dqk21_ */

/* Subroutine */ int dqk31_(D_fp f, doublereal *a, doublereal *b, doublereal *
	result, doublereal *abserr, doublereal *resabs, doublereal *resasc, 
	doublereal *phi, doublereal *lambda1, doublereal *zk0, doublereal *
	pup, doublereal *tup, doublereal *rurd, doublereal *xflow, doublereal 
	*kup)
{
    /* Initialized data */

    static doublereal wg[8] = { .030753241996117268354628393577204,
	    .070366047488108124709267416450667,
	    .107159220467171935011869546685869,
	    .139570677926154314447804794511028,
	    .166269205816993933553200860481209,
	    .186161000015562211026800561866423,
	    .198431485327111576456118326443839,
	    .202578241925561272880620199967519 };
    static doublereal xgk[16] = { .998002298693397060285172840152271,
	    .987992518020485428489565718586613,
	    .967739075679139134257347978784337,
	    .937273392400705904307758947710209,
	    .897264532344081900882509656454496,
	    .848206583410427216200648320774217,
	    .790418501442465932967649294817947,
	    .724417731360170047416186054613938,
	    .650996741297416970533735895313275,
	    .570972172608538847537226737253911,
	    .485081863640239680693655740232351,
	    .394151347077563369897207370981045,
	    .299180007153168812166780024266389,
	    .201194093997434522300628303394596,
	    .101142066918717499027074231447392,0. };
    static doublereal wgk[16] = { .005377479872923348987792051430128,
	    .015007947329316122538374763075807,
	    .025460847326715320186874001019653,
	    .03534636079137584622203794847836,
	    .04458975132476487660822729937328,
	    .05348152469092808726534314723943,
	    .062009567800670640285139230960803,
	    .069854121318728258709520077099147,
	    .076849680757720378894432777482659,
	    .083080502823133021038289247286104,
	    .088564443056211770647275443693774,
	    .093126598170825321225486872747346,
	    .096642726983623678505179907627589,
	    .099173598721791959332393173484603,
	    .10076984552387559504494666261757,
	    .101330007014791549017374792767493 };

    /* System generated locals */
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *);

    /* Local variables */
    integer j;
    doublereal fc, fv1[15], fv2[15];
    integer jtw;
    doublereal absc, resg, resk, fsum, fval1, fval2;
    integer jtwm1;
    doublereal hlgth, centr, reskh, uflow, d1mach[4], epmach, dhlgth;

/* ***begin prologue  dqk31 */
/* ***date written   800101   (yymmdd) */
/* ***revision date  830518   (yymmdd) */
/* ***category no.  h2a1a2 */
/* ***keywords  31-point gauss-kronrod rules */
/* ***author  piessens,robert,appl. math. & progr. div. - k.u.leuven */
/*           de doncker,elise,appl. math. & progr. div. - k.u.leuven */
/* ***purpose  to compute i = integral of f over (a,b) with error */
/*                           estimate */
/*                       j = integral of abs(f) over (a,b) */
/* ***description */

/*           integration rules */
/*           standard fortran subroutine */
/*           double precision version */

/*           parameters */
/*            on entry */
/*              f      - double precision */
/*                       function subprogram defining the integrand */
/*                       function f(x). the actual name for f needs to be */
/*                       declared e x t e r n a l in the calling program. */

/*              a      - double precision */
/*                       lower limit of integration */

/*              b      - double precision */
/*                       upper limit of integration */

/*            on return */
/*              result - double precision */
/*                       approximation to the integral i */
/*                       result is computed by applying the 31-point */
/*                       gauss-kronrod rule (resk), obtained by optimal */
/*                       addition of abscissae to the 15-point gauss */
/*                       rule (resg). */

/*              abserr - double precison */
/*                       estimate of the modulus of the modulus, */
/*                       which should not exceed abs(i-result) */

/*              resabs - double precision */
/*                       approximation to the integral j */

/*              resasc - double precision */
/*                       approximation to the integral of abs(f-i/(b-a)) */
/*                       over (a,b) */

/* ***references  (none) */
/* ***routines called  d1mach */
/* ***end prologue  dqk31 */

    d1mach[0] = 1e21f;
    d1mach[1] = 0.;
    d1mach[2] = 0.;
    d1mach[3] = 1e-21f;

/*           the abscissae and weights are given for the interval (-1,1). */
/*           because of symmetry only the positive abscissae and their */
/*           corresponding weights are given. */

/*           xgk    - abscissae of the 31-point kronrod rule */
/*                    xgk(2), xgk(4), ...  abscissae of the 15-point */
/*                    gauss rule */
/*                    xgk(1), xgk(3), ...  abscissae which are optimally */
/*                    added to the 15-point gauss rule */

/*           wgk    - weights of the 31-point kronrod rule */

/*           wg     - weights of the 15-point gauss rule */


/* gauss quadrature weights and kronron quadrature abscissae and weights */
/* as evaluated with 80 decimal digit arithmetic by l. w. fullerton, */
/* bell labs, nov. 1981. */





/*           list of major variables */
/*           ----------------------- */
/*           centr  - mid point of the interval */
/*           hlgth  - half-length of the interval */
/*           absc   - abscissa */
/*           fval*  - function value */
/*           resg   - result of the 15-point gauss formula */
/*           resk   - result of the 31-point kronrod formula */
/*           reskh  - approximation to the mean value of f over (a,b), */
/*                    i.e. to i/(b-a) */

/*           machine dependent constants */
/*           --------------------------- */
/*           epmach is the largest relative spacing. */
/*           uflow is the smallest positive magnitude. */
/* ***first executable statement  dqk31 */
    epmach = d1mach[3];
    uflow = d1mach[0];

    centr = (*a + *b) * .5;
    hlgth = (*b - *a) * .5;
    dhlgth = abs(hlgth);

/*           compute the 31-point kronrod approximation to */
/*           the integral, and estimate the absolute error. */

    fc = (*f)(&centr, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
    resg = wg[7] * fc;
    resk = wgk[15] * fc;
    *resabs = abs(resk);
    for (j = 1; j <= 7; ++j) {
	jtw = j << 1;
	absc = hlgth * xgk[jtw - 1];
	d__1 = centr - absc;
	fval1 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	d__1 = centr + absc;
	fval2 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	fv1[jtw - 1] = fval1;
	fv2[jtw - 1] = fval2;
	fsum = fval1 + fval2;
	resg += wg[j - 1] * fsum;
	resk += wgk[jtw - 1] * fsum;
	*resabs += wgk[jtw - 1] * (abs(fval1) + abs(fval2));
/* L10: */
    }
    for (j = 1; j <= 8; ++j) {
	jtwm1 = (j << 1) - 1;
	absc = hlgth * xgk[jtwm1 - 1];
	d__1 = centr - absc;
	fval1 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	d__1 = centr + absc;
	fval2 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	fv1[jtwm1 - 1] = fval1;
	fv2[jtwm1 - 1] = fval2;
	fsum = fval1 + fval2;
	resk += wgk[jtwm1 - 1] * fsum;
	*resabs += wgk[jtwm1 - 1] * (abs(fval1) + abs(fval2));
/* L15: */
    }
    reskh = resk * .5;
    *resasc = wgk[15] * (d__1 = fc - reskh, abs(d__1));
    for (j = 1; j <= 15; ++j) {
	*resasc += wgk[j - 1] * ((d__1 = fv1[j - 1] - reskh, abs(d__1)) + (
		d__2 = fv2[j - 1] - reskh, abs(d__2)));
/* L20: */
    }
    *result = resk * hlgth;
    *resabs *= dhlgth;
    *resasc *= dhlgth;
    *abserr = (d__1 = (resk - resg) * hlgth, abs(d__1));
    if (*resasc != 0. && *abserr != 0.) {
/* Computing MIN */
	d__3 = *abserr * 200. / *resasc;
	d__1 = 1., d__2 = pow_dd(&d__3, &c_b17);
	*abserr = *resasc * min(d__1,d__2);
    }
    if (*resabs > uflow / (epmach * 50.)) {
/* Computing MAX */
	d__1 = epmach * 50. * *resabs;
	*abserr = max(d__1,*abserr);
    }
    return 0;
} /* dqk31_ */

/* Subroutine */ int dqk41_(D_fp f, doublereal *a, doublereal *b, doublereal *
	result, doublereal *abserr, doublereal *resabs, doublereal *resasc, 
	doublereal *phi, doublereal *lambda1, doublereal *zk0, doublereal *
	pup, doublereal *tup, doublereal *rurd, doublereal *xflow, doublereal 
	*kup)
{
    /* Initialized data */

    static doublereal wg[10] = { .017614007139152118311861962351853,
	    .040601429800386941331039952274932,
	    .062672048334109063569506535187042,
	    .083276741576704748724758143222046,
	    .10193011981724043503675013548035,
	    .118194531961518417312377377711382,
	    .131688638449176626898494499748163,
	    .142096109318382051329298325067165,
	    .149172986472603746787828737001969,
	    .152753387130725850698084331955098 };
    static doublereal xgk[21] = { .998859031588277663838315576545863,
	    .99312859918509492478612238847132,
	    .981507877450250259193342994720217,
	    .963971927277913791267666131197277,
	    .940822633831754753519982722212443,
	    .912234428251325905867752441203298,
	    .878276811252281976077442995113078,
	    .839116971822218823394529061701521,
	    .795041428837551198350638833272788,
	    .746331906460150792614305070355642,
	    .693237656334751384805490711845932,
	    .636053680726515025452836696226286,
	    .575140446819710315342946036586425,
	    .510867001950827098004364050955251,
	    .44359317523872510319999221349264,
	    .373706088715419560672548177024927,
	    .301627868114913004320555356858592,
	    .227785851141645078080496195368575,
	    .152605465240922675505220241022678,
	    .076526521133497333754640409398838,0. };
    static doublereal wgk[21] = { .003073583718520531501218293246031,
	    .008600269855642942198661787950102,
	    .014626169256971252983787960308868,
	    .020388373461266523598010231432755,
	    .025882133604951158834505067096153,
	    .031287306777032798958543119323801,
	    .036600169758200798030557240707211,
	    .041668873327973686263788305936895,
	    .046434821867497674720231880926108,
	    .050944573923728691932707670050345,
	    .055195105348285994744832372419777,
	    .059111400880639572374967220648594,
	    .062653237554781168025870122174255,
	    .065834597133618422111563556969398,
	    .068648672928521619345623411885368,
	    .07105442355344406830579036172321,
	    .073030690332786667495189417658913,
	    .074582875400499188986581418362488,
	    .075704497684556674659542775376617,
	    .076377867672080736705502835038061,
	    .076600711917999656445049901530102 };

    /* System generated locals */
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *);

    /* Local variables */
    integer j;
    doublereal fc, fv1[20], fv2[20];
    integer jtw;
    doublereal absc, resg, resk, fsum, fval1, fval2;
    integer jtwm1;
    doublereal hlgth, centr, reskh, uflow, d1mach[4], epmach, dhlgth;

/* ***begin prologue  dqk41 */
/* ***date written   800101   (yymmdd) */
/* ***revision date  830518   (yymmdd) */
/* ***category no.  h2a1a2 */
/* ***keywords  41-point gauss-kronrod rules */
/* ***author  piessens,robert,appl. math. & progr. div. - k.u.leuven */
/*           de doncker,elise,appl. math. & progr. div. - k.u.leuven */
/* ***purpose  to compute i = integral of f over (a,b), with error */
/*                           estimate */
/*                       j = integral of abs(f) over (a,b) */
/* ***description */

/*           integration rules */
/*           standard fortran subroutine */
/*           double precision version */

/*           parameters */
/*            on entry */
/*              f      - double precision */
/*                       function subprogram defining the integrand */
/*                       function f(x). the actual name for f needs to be */
/*                       declared e x t e r n a l in the calling program. */

/*              a      - double precision */
/*                       lower limit of integration */

/*              b      - double precision */
/*                       upper limit of integration */

/*            on return */
/*              result - double precision */
/*                       approximation to the integral i */
/*                       result is computed by applying the 41-point */
/*                       gauss-kronrod rule (resk) obtained by optimal */
/*                       addition of abscissae to the 20-point gauss */
/*                       rule (resg). */

/*              abserr - double precision */
/*                       estimate of the modulus of the absolute error, */
/*                       which should not exceed abs(i-result) */

/*              resabs - double precision */
/*                       approximation to the integral j */

/*              resasc - double precision */
/*                       approximation to the integal of abs(f-i/(b-a)) */
/*                       over (a,b) */

/* ***references  (none) */
/* ***routines called  d1mach */
/* ***end prologue  dqk41 */


    d1mach[0] = 1e21f;
    d1mach[1] = 0.;
    d1mach[2] = 0.;
    d1mach[3] = 1e-21f;

/*           the abscissae and weights are given for the interval (-1,1). */
/*           because of symmetry only the positive abscissae and their */
/*           corresponding weights are given. */

/*           xgk    - abscissae of the 41-point gauss-kronrod rule */
/*                    xgk(2), xgk(4), ...  abscissae of the 20-point */
/*                    gauss rule */
/*                    xgk(1), xgk(3), ...  abscissae which are optimally */
/*                    added to the 20-point gauss rule */

/*           wgk    - weights of the 41-point gauss-kronrod rule */

/*           wg     - weights of the 20-point gauss rule */


/* gauss quadrature weights and kronron quadrature abscissae and weights */
/* as evaluated with 80 decimal digit arithmetic by l. w. fullerton, */
/* bell labs, nov. 1981. */





/*           list of major variables */
/*           ----------------------- */

/*           centr  - mid point of the interval */
/*           hlgth  - half-length of the interval */
/*           absc   - abscissa */
/*           fval*  - function value */
/*           resg   - result of the 20-point gauss formula */
/*           resk   - result of the 41-point kronrod formula */
/*           reskh  - approximation to mean value of f over (a,b), i.e. */
/*                    to i/(b-a) */

/*           machine dependent constants */
/*           --------------------------- */

/*           epmach is the largest relative spacing. */
/*           uflow is the smallest positive magnitude. */

/* ***first executable statement  dqk41 */
    epmach = d1mach[3];
    uflow = d1mach[0];

    centr = (*a + *b) * .5;
    hlgth = (*b - *a) * .5;
    dhlgth = abs(hlgth);

/*           compute the 41-point gauss-kronrod approximation to */
/*           the integral, and estimate the absolute error. */

    resg = 0.;
    fc = (*f)(&centr, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
    resk = wgk[20] * fc;
    *resabs = abs(resk);
    for (j = 1; j <= 10; ++j) {
	jtw = j << 1;
	absc = hlgth * xgk[jtw - 1];
	d__1 = centr - absc;
	fval1 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	d__1 = centr + absc;
	fval2 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	fv1[jtw - 1] = fval1;
	fv2[jtw - 1] = fval2;
	fsum = fval1 + fval2;
	resg += wg[j - 1] * fsum;
	resk += wgk[jtw - 1] * fsum;
	*resabs += wgk[jtw - 1] * (abs(fval1) + abs(fval2));
/* L10: */
    }
    for (j = 1; j <= 10; ++j) {
	jtwm1 = (j << 1) - 1;
	absc = hlgth * xgk[jtwm1 - 1];
	d__1 = centr - absc;
	fval1 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	d__1 = centr + absc;
	fval2 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	fv1[jtwm1 - 1] = fval1;
	fv2[jtwm1 - 1] = fval2;
	fsum = fval1 + fval2;
	resk += wgk[jtwm1 - 1] * fsum;
	*resabs += wgk[jtwm1 - 1] * (abs(fval1) + abs(fval2));
/* L15: */
    }
    reskh = resk * .5;
    *resasc = wgk[20] * (d__1 = fc - reskh, abs(d__1));
    for (j = 1; j <= 20; ++j) {
	*resasc += wgk[j - 1] * ((d__1 = fv1[j - 1] - reskh, abs(d__1)) + (
		d__2 = fv2[j - 1] - reskh, abs(d__2)));
/* L20: */
    }
    *result = resk * hlgth;
    *resabs *= dhlgth;
    *resasc *= dhlgth;
    *abserr = (d__1 = (resk - resg) * hlgth, abs(d__1));
    if (*resasc != 0. && *abserr != 0.) {
/* Computing MIN */
	d__3 = *abserr * 200. / *resasc;
	d__1 = 1., d__2 = pow_dd(&d__3, &c_b17);
	*abserr = *resasc * min(d__1,d__2);
    }
    if (*resabs > uflow / (epmach * 50.)) {
/* Computing MAX */
	d__1 = epmach * 50. * *resabs;
	*abserr = max(d__1,*abserr);
    }
    return 0;
} /* dqk41_ */

/* Subroutine */ int dqk51_(D_fp f, doublereal *a, doublereal *b, doublereal *
	result, doublereal *abserr, doublereal *resabs, doublereal *resasc, 
	doublereal *phi, doublereal *lambda1, doublereal *zk0, doublereal *
	pup, doublereal *tup, doublereal *rurd, doublereal *xflow, doublereal 
	*kup)
{
    /* Initialized data */

    static doublereal wg[13] = { .011393798501026287947902964113235,
	    .026354986615032137261901815295299,
	    .040939156701306312655623487711646,
	    .054904695975835191925936891540473,
	    .068038333812356917207187185656708,
	    .080140700335001018013234959669111,
	    .091028261982963649811497220702892,
	    .100535949067050644202206890392686,
	    .108519624474263653116093957050117,
	    .114858259145711648339325545869556,
	    .119455763535784772228178126512901,
	    .122242442990310041688959518945852,
	    .12317605372671545120390287307905 };
    static doublereal xgk[26] = { .999262104992609834193457486540341,
	    .995556969790498097908784946893902,
	    .988035794534077247637331014577406,
	    .976663921459517511498315386479594,
	    .961614986425842512418130033660167,
	    .942974571228974339414011169658471,
	    .920747115281701561746346084546331,
	    .894991997878275368851042006782805,
	    .86584706529327559544899696958834,
	    .83344262876083400142102110869357,
	    .797873797998500059410410904994307,
	    .759259263037357630577282865204361,
	    .717766406813084388186654079773298,
	    .673566368473468364485120633247622,
	    .626810099010317412788122681624518,
	    .577662930241222967723689841612654,
	    .52632528433471918259962377815801,
	    .473002731445714960522182115009192,
	    .417885382193037748851814394594572,
	    .361172305809387837735821730127641,
	    .303089538931107830167478909980339,
	    .243866883720988432045190362797452,
	    .183718939421048892015969888759528,
	    .122864692610710396387359818808037,
	    .061544483005685078886546392366797,0. };
    static doublereal wgk[26] = { .001987383892330315926507851882843,
	    .005561932135356713758040236901066,
	    .009473973386174151607207710523655,
	    .013236229195571674813656405846976,
	    .016847817709128298231516667536336,
	    .020435371145882835456568292235939,
	    .024009945606953216220092489164881,
	    .027475317587851737802948455517811,
	    .030792300167387488891109020215229,
	    .034002130274329337836748795229551,
	    .03711627148341554356033062536762,
	    .040083825504032382074839284467076,
	    .042872845020170049476895792439495,
	    .04550291304992178890987058475266,
	    .047982537138836713906392255756915,
	    .05027767908071567196332525943344,
	    .052362885806407475864366712137873,
	    .054251129888545490144543370459876,
	    .055950811220412317308240686382747,
	    .057437116361567832853582693939506,
	    .058689680022394207961974175856788,
	    .059720340324174059979099291932562,
	    .060539455376045862945360267517565,
	    .061128509717053048305859030416293,
	    .061471189871425316661544131965264,
	    .061580818067832935078759824240066 };

    /* System generated locals */
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *);

    /* Local variables */
    integer j;
    doublereal fc, fv1[25], fv2[25];
    integer jtw;
    doublereal absc, resg, resk, fsum, fval1, fval2;
    integer jtwm1;
    doublereal hlgth, centr, reskh, uflow, d1mach[4], epmach, dhlgth;

/* ***begin prologue  dqk51 */
/* ***date written   800101   (yymmdd) */
/* ***revision date  830518   (yymmdd) */
/* ***category no.  h2a1a2 */
/* ***keywords  51-point gauss-kronrod rules */
/* ***author  piessens,robert,appl. math. & progr. div. - k.u.leuven */
/*           de doncker,elise,appl. math & progr. div. - k.u.leuven */
/* ***purpose  to compute i = integral of f over (a,b) with error */
/*                           estimate */
/*                       j = integral of abs(f) over (a,b) */
/* ***description */

/*           integration rules */
/*           standard fortran subroutine */
/*           double precision version */

/*           parameters */
/*            on entry */
/*              f      - double precision */
/*                       function subroutine defining the integrand */
/*                       function f(x). the actual name for f needs to be */
/*                       declared e x t e r n a l in the calling program. */

/*              a      - double precision */
/*                       lower limit of integration */

/*              b      - double precision */
/*                       upper limit of integration */

/*            on return */
/*              result - double precision */
/*                       approximation to the integral i */
/*                       result is computed by applying the 51-point */
/*                       kronrod rule (resk) obtained by optimal addition */
/*                       of abscissae to the 25-point gauss rule (resg). */

/*              abserr - double precision */
/*                       estimate of the modulus of the absolute error, */
/*                       which should not exceed abs(i-result) */

/*              resabs - double precision */
/*                       approximation to the integral j */

/*              resasc - double precision */
/*                       approximation to the integral of abs(f-i/(b-a)) */
/*                       over (a,b) */

/* ***references  (none) */
/* ***routines called  d1mach */
/* ***end prologue  dqk51 */


    d1mach[0] = 1e21f;
    d1mach[1] = 0.;
    d1mach[2] = 0.;
    d1mach[3] = 1e-21f;

/*           the abscissae and weights are given for the interval (-1,1). */
/*           because of symmetry only the positive abscissae and their */
/*           corresponding weights are given. */

/*           xgk    - abscissae of the 51-point kronrod rule */
/*                    xgk(2), xgk(4), ...  abscissae of the 25-point */
/*                    gauss rule */
/*                    xgk(1), xgk(3), ...  abscissae which are optimally */
/*                    added to the 25-point gauss rule */

/*           wgk    - weights of the 51-point kronrod rule */

/*           wg     - weights of the 25-point gauss rule */


/* gauss quadrature weights and kronron quadrature abscissae and weights */
/* as evaluated with 80 decimal digit arithmetic by l. w. fullerton, */
/* bell labs, nov. 1981. */



/*       note: wgk (26) was calculated from the values of wgk(1..25) */


/*           list of major variables */
/*           ----------------------- */

/*           centr  - mid point of the interval */
/*           hlgth  - half-length of the interval */
/*           absc   - abscissa */
/*           fval*  - function value */
/*           resg   - result of the 25-point gauss formula */
/*           resk   - result of the 51-point kronrod formula */
/*           reskh  - approximation to the mean value of f over (a,b), */
/*                    i.e. to i/(b-a) */

/*           machine dependent constants */
/*           --------------------------- */

/*           epmach is the largest relative spacing. */
/*           uflow is the smallest positive magnitude. */

/* ***first executable statement  dqk51 */
    epmach = d1mach[3];
    uflow = d1mach[0];

    centr = (*a + *b) * .5;
    hlgth = (*b - *a) * .5;
    dhlgth = abs(hlgth);

/*           compute the 51-point kronrod approximation to */
/*           the integral, and estimate the absolute error. */

    fc = (*f)(&centr, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
    resg = wg[12] * fc;
    resk = wgk[25] * fc;
    *resabs = abs(resk);
    for (j = 1; j <= 12; ++j) {
	jtw = j << 1;
	absc = hlgth * xgk[jtw - 1];
	d__1 = centr - absc;
	fval1 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	d__1 = centr + absc;
	fval2 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	fv1[jtw - 1] = fval1;
	fv2[jtw - 1] = fval2;
	fsum = fval1 + fval2;
	resg += wg[j - 1] * fsum;
	resk += wgk[jtw - 1] * fsum;
	*resabs += wgk[jtw - 1] * (abs(fval1) + abs(fval2));
/* L10: */
    }
    for (j = 1; j <= 13; ++j) {
	jtwm1 = (j << 1) - 1;
	absc = hlgth * xgk[jtwm1 - 1];
	d__1 = centr - absc;
	fval1 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	d__1 = centr + absc;
	fval2 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	fv1[jtwm1 - 1] = fval1;
	fv2[jtwm1 - 1] = fval2;
	fsum = fval1 + fval2;
	resk += wgk[jtwm1 - 1] * fsum;
	*resabs += wgk[jtwm1 - 1] * (abs(fval1) + abs(fval2));
/* L15: */
    }
    reskh = resk * .5;
    *resasc = wgk[25] * (d__1 = fc - reskh, abs(d__1));
    for (j = 1; j <= 25; ++j) {
	*resasc += wgk[j - 1] * ((d__1 = fv1[j - 1] - reskh, abs(d__1)) + (
		d__2 = fv2[j - 1] - reskh, abs(d__2)));
/* L20: */
    }
    *result = resk * hlgth;
    *resabs *= dhlgth;
    *resasc *= dhlgth;
    *abserr = (d__1 = (resk - resg) * hlgth, abs(d__1));
    if (*resasc != 0. && *abserr != 0.) {
/* Computing MIN */
	d__3 = *abserr * 200. / *resasc;
	d__1 = 1., d__2 = pow_dd(&d__3, &c_b17);
	*abserr = *resasc * min(d__1,d__2);
    }
    if (*resabs > uflow / (epmach * 50.)) {
/* Computing MAX */
	d__1 = epmach * 50. * *resabs;
	*abserr = max(d__1,*abserr);
    }
    return 0;
} /* dqk51_ */

/* Subroutine */ int dqk61_(D_fp f, doublereal *a, doublereal *b, doublereal *
	result, doublereal *abserr, doublereal *resabs, doublereal *resasc, 
	doublereal *phi, doublereal *lambda1, doublereal *zk0, doublereal *
	pup, doublereal *tup, doublereal *rurd, doublereal *xflow, doublereal 
	*kup)
{
    /* Initialized data */

    static doublereal wg[15] = { .007968192496166605615465883474674,
	    .018466468311090959142302131912047,
	    .028784707883323369349719179611292,
	    .038799192569627049596801936446348,
	    .048402672830594052902938140422808,
	    .057493156217619066481721689402056,
	    .065974229882180495128128515115962,
	    .073755974737705206268243850022191,
	    .08075589522942021535469493846053,
	    .086899787201082979802387530715126,
	    .092122522237786128717632707087619,
	    .09636873717464425963946862635181,
	    .099593420586795267062780282103569,
	    .101762389748405504596428952168554,
	    .102852652893558840341285636705415 };
    static doublereal xgk[31] = { .999484410050490637571325895705811,
	    .996893484074649540271630050918695,
	    .991630996870404594858628366109486,
	    .983668123279747209970032581605663,
	    .973116322501126268374693868423707,
	    .960021864968307512216871025581798,
	    .944374444748559979415831324037439,
	    .926200047429274325879324277080474,
	    .905573307699907798546522558925958,
	    .882560535792052681543116462530226,
	    .857205233546061098958658510658944,
	    .829565762382768397442898119732502,
	    .799727835821839083013668942322683,
	    .767777432104826194917977340974503,
	    .733790062453226804726171131369528,
	    .69785049479331579693229238802664,
	    .660061064126626961370053668149271,
	    .620526182989242861140477556431189,
	    .57934523582636169175602493217254,
	    .536624148142019899264169793311073,
	    .492480467861778574993693061207709,
	    .447033769538089176780609900322854,
	    .400401254830394392535476211542661,
	    .352704725530878113471037207089374,
	    .304073202273625077372677107199257,
	    .254636926167889846439805129817805,
	    .204525116682309891438957671002025,
	    .153869913608583546963794672743256,
	    .102806937966737030147096751318001,
	    .051471842555317695833025213166723,0. };
    static doublereal wgk[31] = { .00138901369867700762455159122676,
	    .003890461127099884051267201844516,
	    .00663070391593129217331982636975,
	    .009273279659517763428441146892024,
	    .011823015253496341742232898853251,
	    .01436972950704580481245143244358,
	    .016920889189053272627572289420322,
	    .019414141193942381173408951050128,
	    .021828035821609192297167485738339,
	    .024191162078080601365686370725232,
	    .026509954882333101610601709335075,
	    .028754048765041292843978785354334,
	    .030907257562387762472884252943092,
	    .032981447057483726031814191016854,
	    .034979338028060024137499670731468,
	    .036882364651821229223911065617136,
	    .038678945624727592950348651532281,
	    .040374538951535959111995279752468,
	    .04196981021516424614714754128597,
	    .043452539701356069316831728117073,
	    .044814800133162663192355551616723,
	    .046059238271006988116271735559374,
	    .047185546569299153945261478181099,
	    .048185861757087129140779492298305,
	    .049055434555029778887528165367238,
	    .049795683427074206357811569379942,
	    .050405921402782346840893085653585,
	    .050881795898749606492297473049805,
	    .051221547849258772170656282604944,
	    .051426128537459025933862879215781,
	    .051494729429451567558340433647099 };

    /* System generated locals */
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *);

    /* Local variables */
    integer j;
    doublereal fc, fv1[30], fv2[30];
    integer jtw;
    doublereal resg, resk, fsum, fval1, fval2;
    integer jtwm1;
    doublereal dabsc, hlgth, centr, reskh, uflow, d1mach[4], epmach, dhlgth;

/* ***begin prologue  dqk61 */
/* ***date written   800101   (yymmdd) */
/* ***revision date  830518   (yymmdd) */
/* ***category no.  h2a1a2 */
/* ***keywords  61-point gauss-kronrod rules */
/* ***author  piessens,robert,appl. math. & progr. div. - k.u.leuven */
/*           de doncker,elise,appl. math. & progr. div. - k.u.leuven */
/* ***purpose  to compute i = integral of f over (a,b) with error */
/*                           estimate */
/*                       j = integral of dabs(f) over (a,b) */
/* ***description */

/*        integration rule */
/*        standard fortran subroutine */
/*        double precision version */


/*        parameters */
/*         on entry */
/*           f      - double precision */
/*                    function subprogram defining the integrand */
/*                    function f(x). the actual name for f needs to be */
/*                    declared e x t e r n a l in the calling program. */

/*           a      - double precision */
/*                    lower limit of integration */

/*           b      - double precision */
/*                    upper limit of integration */

/*         on return */
/*           result - double precision */
/*                    approximation to the integral i */
/*                    result is computed by applying the 61-point */
/*                    kronrod rule (resk) obtained by optimal addition of */
/*                    abscissae to the 30-point gauss rule (resg). */

/*           abserr - double precision */
/*                    estimate of the modulus of the absolute error, */
/*                    which should equal or exceed dabs(i-result) */

/*           resabs - double precision */
/*                    approximation to the integral j */

/*           resasc - double precision */
/*                    approximation to the integral of dabs(f-i/(b-a)) */


/* ***references  (none) */
/* ***routines called  d1mach */
/* ***end prologue  dqk61 */


    d1mach[0] = 1e21f;
    d1mach[1] = 0.;
    d1mach[2] = 0.;
    d1mach[3] = 1e-21f;

/*           the abscissae and weights are given for the */
/*           interval (-1,1). because of symmetry only the positive */
/*           abscissae and their corresponding weights are given. */

/*           xgk   - abscissae of the 61-point kronrod rule */
/*                   xgk(2), xgk(4)  ... abscissae of the 30-point */
/*                   gauss rule */
/*                   xgk(1), xgk(3)  ... optimally added abscissae */
/*                   to the 30-point gauss rule */

/*           wgk   - weights of the 61-point kronrod rule */

/*           wg    - weigths of the 30-point gauss rule */


/* gauss quadrature weights and kronron quadrature abscissae and weights */
/* as evaluated with 80 decimal digit arithmetic by l. w. fullerton, */
/* bell labs, nov. 1981. */




/*           list of major variables */
/*           ----------------------- */

/*           centr  - mid point of the interval */
/*           hlgth  - half-length of the interval */
/*           dabsc  - abscissa */
/*           fval*  - function value */
/*           resg   - result of the 30-point gauss rule */
/*           resk   - result of the 61-point kronrod rule */
/*           reskh  - approximation to the mean value of f */
/*                    over (a,b), i.e. to i/(b-a) */

/*           machine dependent constants */
/*           --------------------------- */

/*           epmach is the largest relative spacing. */
/*           uflow is the smallest positive magnitude. */

    epmach = d1mach[3];
    uflow = d1mach[0];

    centr = (*b + *a) * .5;
    hlgth = (*b - *a) * .5;
    dhlgth = abs(hlgth);

/*           compute the 61-point kronrod approximation to the */
/*           integral, and estimate the absolute error. */

/* ***first executable statement  dqk61 */
    resg = 0.;
    fc = (*f)(&centr, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
    resk = wgk[30] * fc;
    *resabs = abs(resk);
    for (j = 1; j <= 15; ++j) {
	jtw = j << 1;
	dabsc = hlgth * xgk[jtw - 1];
	d__1 = centr - dabsc;
	fval1 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	d__1 = centr + dabsc;
	fval2 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	fv1[jtw - 1] = fval1;
	fv2[jtw - 1] = fval2;
	fsum = fval1 + fval2;
	resg += wg[j - 1] * fsum;
	resk += wgk[jtw - 1] * fsum;
	*resabs += wgk[jtw - 1] * (abs(fval1) + abs(fval2));
/* L10: */
    }
    for (j = 1; j <= 15; ++j) {
	jtwm1 = (j << 1) - 1;
	dabsc = hlgth * xgk[jtwm1 - 1];
	d__1 = centr - dabsc;
	fval1 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	d__1 = centr + dabsc;
	fval2 = (*f)(&d__1, phi, lambda1, zk0, pup, tup, rurd, xflow, kup);
	fv1[jtwm1 - 1] = fval1;
	fv2[jtwm1 - 1] = fval2;
	fsum = fval1 + fval2;
	resk += wgk[jtwm1 - 1] * fsum;
	*resabs += wgk[jtwm1 - 1] * (abs(fval1) + abs(fval2));
/* L15: */
    }
    reskh = resk * .5;
    *resasc = wgk[30] * (d__1 = fc - reskh, abs(d__1));
    for (j = 1; j <= 30; ++j) {
	*resasc += wgk[j - 1] * ((d__1 = fv1[j - 1] - reskh, abs(d__1)) + (
		d__2 = fv2[j - 1] - reskh, abs(d__2)));
/* L20: */
    }
    *result = resk * hlgth;
    *resabs *= dhlgth;
    *resasc *= dhlgth;
    *abserr = (d__1 = (resk - resg) * hlgth, abs(d__1));
    if (*resasc != 0. && *abserr != 0.) {
/* Computing MIN */
	d__3 = *abserr * 200. / *resasc;
	d__1 = 1., d__2 = pow_dd(&d__3, &c_b17);
	*abserr = *resasc * min(d__1,d__2);
    }
    if (*resabs > uflow / (epmach * 50.)) {
/* Computing MAX */
	d__1 = epmach * 50. * *resabs;
	*abserr = max(d__1,*abserr);
    }
    return 0;
} /* dqk61_ */

/* Subroutine */ int dqpsrt_(integer *limit, integer *last, integer *maxerr, 
	doublereal *ermax, doublereal *elist, integer *iord, integer *nrmax, 
	doublereal *phi, doublereal *lambda1, doublereal *zk0, doublereal *
	pup, doublereal *tup, doublereal *rurd, doublereal *xflow, doublereal 
	*kup)
{
    /* System generated locals */
    integer i__1;

    /* Local variables */
    integer i__, j, k, ido, ibeg, jbnd, isucc, jupbn;
    doublereal errmin, errmax;

/* ***begin prologue  dqpsrt */
/* ***refer to  dqage,dqagie,dqagpe,dqawse */
/* ***routines called  (none) */
/* ***revision date  810101   (yymmdd) */
/* ***keywords  sequential sorting */
/* ***author  piessens,robert,appl. math. & progr. div. - k.u.leuven */
/*           de doncker,elise,appl. math. & progr. div. - k.u.leuven */
/* ***purpose  this routine maintains the descending ordering in the */
/*            list of the local error estimated resulting from the */
/*            interval subdivision process. at each call two error */
/*            estimates are inserted using the sequential search */
/*            method, top-down for the largest error estimate and */
/*            bottom-up for the smallest error estimate. */
/* ***description */

/*           ordering routine */
/*           standard fortran subroutine */
/*           double precision version */

/*           parameters (meaning at output) */
/*              limit  - integer */
/*                       maximum number of error estimates the list */
/*                       can contain */

/*              last   - integer */
/*                       number of error estimates currently in the list */

/*              maxerr - integer */
/*                       maxerr points to the nrmax-th largest error */
/*                       estimate currently in the list */

/*              ermax  - double precision */
/*                       nrmax-th largest error estimate */
/*                       ermax = elist(maxerr) */

/*              elist  - double precision */
/*                       vector of dimension last containing */
/*                       the error estimates */

/*              iord   - integer */
/*                       vector of dimension last, the first k elements */
/*                       of which contain pointers to the error */
/*                       estimates, such that */
/*                       elist(iord(1)),...,  elist(iord(k)) */
/*                       form a decreasing sequence, with */
/*                       k = last if last.le.(limit/2+2), and */
/*                       k = limit+1-last otherwise */

/*              nrmax  - integer */
/*                       maxerr = iord(nrmax) */

/* ***end prologue  dqpsrt */


/*           check whether the list contains more than */
/*           two error estimates. */

/* ***first executable statement  dqpsrt */
    /* Parameter adjustments */
    --iord;
    --elist;

    /* Function Body */
    if (*last > 2) {
	goto L10;
    }
    iord[1] = 1;
    iord[2] = 2;
    goto L90;

/*           this part of the routine is only executed if, due to a */
/*           difficult integrand, subdivision increased the error */
/*           estimate. in the normal case the insert procedure should */
/*           start after the nrmax-th largest error estimate. */

L10:
    errmax = elist[*maxerr];
    if (*nrmax == 1) {
	goto L30;
    }
    ido = *nrmax - 1;
    i__1 = ido;
    for (i__ = 1; i__ <= i__1; ++i__) {
	isucc = iord[*nrmax - 1];
/* ***jump out of do-loop */
	if (errmax <= elist[isucc]) {
	    goto L30;
	}
	iord[*nrmax] = isucc;
	--(*nrmax);
/* L20: */
    }

/*           compute the number of elements in the list to be maintained */
/*           in descending order. this number depends on the number of */
/*           subdivisions still allowed. */

L30:
    jupbn = *last;
    if (*last > *limit / 2 + 2) {
	jupbn = *limit + 3 - *last;
    }
    errmin = elist[*last];

/*           insert errmax by traversing the list top-down, */
/*           starting comparison from the element elist(iord(nrmax+1)). */

    jbnd = jupbn - 1;
    ibeg = *nrmax + 1;
    if (ibeg > jbnd) {
	goto L50;
    }
    i__1 = jbnd;
    for (i__ = ibeg; i__ <= i__1; ++i__) {
	isucc = iord[i__];
/* ***jump out of do-loop */
	if (errmax >= elist[isucc]) {
	    goto L60;
	}
	iord[i__ - 1] = isucc;
/* L40: */
    }
L50:
    iord[jbnd] = *maxerr;
    iord[jupbn] = *last;
    goto L90;

/*           insert errmin by traversing the list bottom-up. */

L60:
    iord[i__ - 1] = *maxerr;
    k = jbnd;
    i__1 = jbnd;
    for (j = i__; j <= i__1; ++j) {
	isucc = iord[k];
/* ***jump out of do-loop */
	if (errmin < elist[isucc]) {
	    goto L80;
	}
	iord[k + 1] = isucc;
	--k;
/* L70: */
    }
    iord[i__] = *last;
    goto L90;
L80:
    iord[k + 1] = *last;

/*           set maxerr and ermax. */

L90:
    *maxerr = iord[*nrmax];
    *ermax = elist[*maxerr];
    return 0;
} /* dqpsrt_ */

