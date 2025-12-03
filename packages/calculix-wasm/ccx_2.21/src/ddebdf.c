/* ddebdf.f -- translated by f2c (version 20200916).
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

/* Common Block Declarations */

union {
    struct {
	doublereal told, rowns[210], el0, h__, hmin, hmxi, hu, tn, uround;
	integer iquit, init, iyh, iewt, iacor, isavf, iwm, ksteps, ibegin, 
		itol, iinteg, itstop, ijac, iband, iowns[6], ier, jstart, 
		kflag, l, meth, miter, maxord, n, nq, nst, nfe, nje, nqu;
    } _1;
    struct {
	doublereal told, rowns[210], el0, h__, hmin, hmxi, hu, x, u;
	integer iquit, init, lyh, lewt, lacor, lsavf, lwm, ksteps, ibegin, 
		itol, iinteg, itstop, ijac, iband, iowns[6], ier, jstart, 
		kflag, ldum, meth, miter, maxord, n, nq, nst, nfe, nje, nqu;
    } _2;
    struct {
	doublereal rownd, conit, crate, el[13], elco[156]	/* was [13][
		12] */, hold, rc, rmax, tesco[36]	/* was [3][12] */, 
		el0, h__, hmin, hmxi, hu, tn, uround;
	integer iownd[7], ksteps, iod[6], ialth, ipup, lmax, meo, nqnyh, 
		nstepj, ier, jstart, kflag, l, meth, miter, maxord, n, nq, 
		nst, nfe, nje, nqu;
    } _3;
    struct {
	doublereal rownd, rowns[210], el0, h__, hmin, hmxi, hu, tn, uround;
	integer iownd[14], iowns[6], ier, jstart, kflag, l, meth, miter, 
		maxord, n, nq, nst, nfe, nje, nqu;
    } _4;
} ddebd1_;

#define ddebd1_1 (ddebd1_._1)
#define ddebd1_2 (ddebd1_._2)
#define ddebd1_3 (ddebd1_._3)
#define ddebd1_4 (ddebd1_._4)

/* Table of constant values */

static integer c__1 = 1;
static integer c__13 = 13;
static integer c__2 = 2;
static integer c__5 = 5;
static integer c__3 = 3;
static integer c__4 = 4;
static integer c__14 = 14;
static integer c__15 = 15;
static integer c__16 = 16;
static integer c__17 = 17;
static integer c__18 = 18;
static integer c__6 = 6;
static integer c__7 = 7;
static integer c__8 = 8;
static doublereal c_b134 = 1.;
static integer c__9 = 9;
static integer c__10 = 10;
static integer c__11 = 11;
static integer c__12 = 12;
static integer c__0 = 0;


/*    SLATEC: public domain */

/* DECK DDEBDF */
/* Subroutine */ int ddebdf_(U_fp df, integer *neq, doublereal *t, doublereal 
	*y, doublereal *tout, integer *info, doublereal *rtol, doublereal *
	atol, integer *idid, doublereal *rwork, integer *lrw, integer *iwork, 
	integer *liw, doublereal *rpar, integer *ipar, U_fp djac)
{
    /* System generated locals */
    address a__1[5], a__2[2], a__3[4];
    integer i__1[5], i__2[2], i__3[4];
    char ch__1[223], ch__2[212], ch__3[133], ch__4[155], ch__5[161], ch__6[
	    219], ch__7[196], ch__8[268], ch__9[109], ch__10[117], ch__11[90];
    icilist ici__1;

    /* Builtin functions */
    integer s_wsfi(icilist *), do_fio(integer *, char *, ftnlen), e_wsfi(void)
	    ;
    /* Subroutine */ int s_cat(char *, char **, integer *, integer *, ftnlen);

    /* Local variables */
    integer ml, mu, ilrw;
    char xern1[8], xern2[8], xern3[16];
    integer icomi;
    extern /* Subroutine */ int dlsod_(U_fp, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, integer *, U_fp, 
	    logical *, doublereal *, doublereal *, doublereal *, doublereal *,
	     integer *);
    integer icomr, idelsn;
    extern /* Subroutine */ int xermsg_(char *, char *, char *, integer *, 
	    integer *, ftnlen, ftnlen, ftnlen);
    integer itstar, iinout;
    logical intout;
    integer iypout;

/* ***BEGIN PROLOGUE  DDEBDF */
/* ***PURPOSE  Solve an initial value problem in ordinary differential */
/*            equations using backward differentiation formulas.  It is */
/*            intended primarily for stiff problems. */
/* ***LIBRARY   SLATEC (DEPAC) */
/* ***CATEGORY  I1A2 */
/* ***TYPE      DOUBLE PRECISION (DEBDF-S, DDEBDF-D) */
/* ***KEYWORDS  BACKWARD DIFFERENTIATION FORMULAS, DEPAC, */
/*             INITIAL VALUE PROBLEMS, ODE, */
/*             ORDINARY DIFFERENTIAL EQUATIONS, STIFF */
/* ***AUTHOR  Shampine, L. F., (SNLA) */
/*           Watts, H. A., (SNLA) */
/* ***DESCRIPTION */

/*   This is the backward differentiation code in the package of */
/*   differential equation solvers DEPAC, consisting of the codes */
/*   DDERKF, DDEABM, and DDEBDF.  Design of the package was by */
/*   L. F. Shampine and H. A. Watts.  It is documented in */
/*        SAND-79-2374 , DEPAC - Design of a User Oriented Package of ODE */
/*                              Solvers. */
/*   DDEBDF is a driver for a modification of the code LSODE written by */
/*             A. C. Hindmarsh */
/*             Lawrence Livermore Laboratory */
/*             Livermore, California 94550 */

/* ********************************************************************** */
/* **             DEPAC PACKAGE OVERVIEW           ** */
/* ********************************************************************** */

/*        You have a choice of three differential equation solvers from */
/*        DEPAC.  The following brief descriptions are meant to aid you */
/*        in choosing the most appropriate code for your problem. */

/*        DDERKF is a fifth order Runge-Kutta code. It is the simplest of */
/*        the three choices, both algorithmically and in the use of the */
/*        code. DDERKF is primarily designed to solve non-stiff and mild- */
/*        ly stiff differential equations when derivative evaluations are */
/*        not expensive.  It should generally not be used to get high */
/*        accuracy results nor answers at a great many specific points. */
/*        Because DDERKF has very low overhead costs, it will usually */
/*        result in the least expensive integration when solving */
/*        problems requiring a modest amount of accuracy and having */
/*        equations that are not costly to evaluate.  DDERKF attempts to */
/*        discover when it is not suitable for the task posed. */

/*        DDEABM is a variable order (one through twelve) Adams code. Its */
/*        complexity lies somewhere between that of DDERKF and DDEBDF. */
/*        DDEABM is primarily designed to solve non-stiff and mildly */
/*        stiff differential equations when derivative evaluations are */
/*        expensive, high accuracy results are needed or answers at */
/*        many specific points are required.  DDEABM attempts to discover */
/*        when it is not suitable for the task posed. */

/*        DDEBDF is a variable order (one through five) backward */
/*        differentiation formula code.  It is the most complicated of */
/*        the three choices.  DDEBDF is primarily designed to solve stiff */
/*        differential equations at crude to moderate tolerances. */
/*        If the problem is very stiff at all, DDERKF and DDEABM will be */
/*        quite inefficient compared to DDEBDF.  However, DDEBDF will be */
/*        inefficient compared to DDERKF and DDEABM on non-stiff problems */
/*        because it uses much more storage, has a much larger overhead, */
/*        and the low order formulas will not give high accuracies */
/*        efficiently. */

/*        The concept of stiffness cannot be described in a few words. */
/*        If you do not know the problem to be stiff, try either DDERKF */
/*        or DDEABM.  Both of these codes will inform you of stiffness */
/*        when the cost of solving such problems becomes important. */

/* ********************************************************************** */
/* ** ABSTRACT ** */
/* ********************************************************************** */

/*   Subroutine DDEBDF uses the backward differentiation formulas of */
/*   orders one through five to integrate a system of NEQ first order */
/*   ordinary differential equations of the form */
/*                         DU/DX = DF(X,U) */
/*   when the vector Y(*) of initial values for U(*) at X=T is given. */
/*   The subroutine integrates from T to TOUT. It is easy to continue the */
/*   integration to get results at additional TOUT. This is the interval */
/*   mode of operation. It is also easy for the routine to return with */
/*   the solution at each intermediate step on the way to TOUT. This is */
/*   the intermediate-output mode of operation. */

/* ********************************************************************** */
/* * Description of The Arguments To DDEBDF (An Overview) * */
/* ********************************************************************** */

/*   The Parameters are: */

/*      DF -- This is the name of a subroutine which you provide to */
/*            define the differential equations. */

/*      NEQ -- This is the number of (first order) differential */
/*             equations to be integrated. */

/*      T -- This is a DOUBLE PRECISION value of the independent */
/*           variable. */

/*      Y(*) -- This DOUBLE PRECISION array contains the solution */
/*              components at T. */

/*      TOUT -- This is a DOUBLE PRECISION point at which a solution is */
/*              desired. */

/*      INFO(*) -- The basic task of the code is to integrate the */
/*             differential equations from T to TOUT and return an */
/*             answer at TOUT.  INFO(*) is an INTEGER array which is used */
/*             to communicate exactly how you want this task to be */
/*             carried out. */

/*      RTOL, ATOL -- These DOUBLE PRECISION quantities */
/*             represent relative and absolute error tolerances which you */
/*             provide to indicate how accurately you wish the solution */
/*             to be computed.  You may choose them to be both scalars */
/*             or else both vectors. */

/*      IDID -- This scalar quantity is an indicator reporting what */
/*             the code did.  You must monitor this INTEGER variable to */
/*             decide what action to take next. */

/*      RWORK(*), LRW -- RWORK(*) is a DOUBLE PRECISION work array of */
/*             length LRW which provides the code with needed storage */
/*             space. */

/*      IWORK(*), LIW -- IWORK(*) is an INTEGER work array of length LIW */
/*             which provides the code with needed storage space and an */
/*             across call flag. */

/*      RPAR, IPAR -- These are DOUBLE PRECISION and INTEGER parameter */
/*             arrays which you can use for communication between your */
/*             calling program and the DF subroutine (and the DJAC */
/*             subroutine). */

/*      DJAC -- This is the name of a subroutine which you may choose to */
/*             provide for defining the Jacobian matrix of partial */
/*             derivatives DF/DU. */

/*  Quantities which are used as input items are */
/*             NEQ, T, Y(*), TOUT, INFO(*), */
/*             RTOL, ATOL, RWORK(1), LRW, */
/*             IWORK(1), IWORK(2), and LIW. */

/*  Quantities which may be altered by the code are */
/*             T, Y(*), INFO(1), RTOL, ATOL, */
/*             IDID, RWORK(*) and IWORK(*). */

/* ********************************************************************** */
/* * INPUT -- What To Do On The First Call To DDEBDF * */
/* ********************************************************************** */

/*   The first call of the code is defined to be the start of each new */
/*   problem.  Read through the descriptions of all the following items, */
/*   provide sufficient storage space for designated arrays, set */
/*   appropriate variables for the initialization of the problem, and */
/*   give information about how you want the problem to be solved. */


/*      DF -- Provide a subroutine of the form */
/*                               DF(X,U,UPRIME,RPAR,IPAR) */
/*             to define the system of first order differential equations */
/*             which is to be solved. For the given values of X and the */
/*             vector  U(*)=(U(1),U(2),...,U(NEQ)) , the subroutine must */
/*             evaluate the NEQ components of the system of differential */
/*             equations  DU/DX=DF(X,U)  and store the derivatives in the */
/*             array UPRIME(*), that is,  UPRIME(I) = * DU(I)/DX *  for */
/*             equations I=1,...,NEQ. */

/*             Subroutine DF must not alter X or U(*). You must declare */
/*             the name DF in an external statement in your program that */
/*             calls DDEBDF. You must dimension U and UPRIME in DF. */

/*             RPAR and IPAR are DOUBLE PRECISION and INTEGER parameter */
/*             arrays which you can use for communication between your */
/*             calling program and subroutine DF. They are not used or */
/*             altered by DDEBDF.  If you do not need RPAR or IPAR, */
/*             ignore these parameters by treating them as dummy */
/*             arguments. If you do choose to use them, dimension them in */
/*             your calling program and in DF as arrays of appropriate */
/*             length. */

/*      NEQ -- Set it to the number of differential equations. */
/*             (NEQ .GE. 1) */

/*      T -- Set it to the initial point of the integration. */
/*             You must use a program variable for T because the code */
/*             changes its value. */

/*      Y(*) -- Set this vector to the initial values of the NEQ solution */
/*             components at the initial point.  You must dimension Y at */
/*             least NEQ in your calling program. */

/*      TOUT -- Set it to the first point at which a solution is desired. */
/*             You can take TOUT = T, in which case the code */
/*             will evaluate the derivative of the solution at T and */
/*             return.  Integration either forward in T  (TOUT .GT. T) */
/*             or backward in T  (TOUT .LT. T)  is permitted. */

/*             The code advances the solution from T to TOUT using */
/*             step sizes which are automatically selected so as to */
/*             achieve the desired accuracy.  If you wish, the code will */
/*             return with the solution and its derivative following */
/*             each intermediate step (intermediate-output mode) so that */
/*             you can monitor them, but you still must provide TOUT in */
/*             accord with the basic aim of the code. */

/*             The first step taken by the code is a critical one */
/*             because it must reflect how fast the solution changes near */
/*             the initial point.  The code automatically selects an */
/*             initial step size which is practically always suitable for */
/*             the problem.  By using the fact that the code will not */
/*             step past TOUT in the first step, you could, if necessary, */
/*             restrict the length of the initial step size. */

/*             For some problems it may not be permissible to integrate */
/*             past a point TSTOP because a discontinuity occurs there */
/*             or the solution or its derivative is not defined beyond */
/*             TSTOP.  When you have declared a TSTOP point (see INFO(4) */
/*             and RWORK(1)), you have told the code not to integrate */
/*             past TSTOP.  In this case any TOUT beyond TSTOP is invalid */
/*             input. */

/*      INFO(*) -- Use the INFO array to give the code more details about */
/*             how you want your problem solved.  This array should be */
/*             dimensioned of length 15 to accommodate other members of */
/*             DEPAC or possible future extensions, though DDEBDF uses */
/*             only the first six entries.  You must respond to all of */
/*             the following items which are arranged as questions.  The */
/*             simplest use of the code corresponds to answering all */
/*             questions as YES ,i.e. setting all entries of INFO to 0. */

/*        INFO(1) -- This parameter enables the code to initialize */
/*               itself.  You must set it to indicate the start of every */
/*               new problem. */

/*            **** Is this the first call for this problem ... */
/*                  YES -- Set INFO(1) = 0 */
/*                   NO -- Not applicable here. */
/*                         See below for continuation calls.  **** */

/*        INFO(2) -- How much accuracy you want of your solution */
/*               is specified by the error tolerances RTOL and ATOL. */
/*               The simplest use is to take them both to be scalars. */
/*               To obtain more flexibility, they can both be vectors. */
/*               The code must be told your choice. */

/*            **** Are both error tolerances RTOL, ATOL scalars ... */
/*                  YES -- Set INFO(2) = 0 */
/*                         and input scalars for both RTOL and ATOL */
/*                   NO -- Set INFO(2) = 1 */
/*                         and input arrays for both RTOL and ATOL **** */

/*        INFO(3) -- The code integrates from T in the direction */
/*               of TOUT by steps.  If you wish, it will return the */
/*               computed solution and derivative at the next */
/*               intermediate step (the intermediate-output mode) or */
/*               TOUT, whichever comes first.  This is a good way to */
/*               proceed if you want to see the behavior of the solution. */
/*               If you must have solutions at a great many specific */
/*               TOUT points, this code will compute them efficiently. */

/*            **** Do you want the solution only at */
/*                 TOUT (and NOT at the next intermediate step) ... */
/*                  YES -- Set INFO(3) = 0 */
/*                   NO -- Set INFO(3) = 1 **** */

/*        INFO(4) -- To handle solutions at a great many specific */
/*               values TOUT efficiently, this code may integrate past */
/*               TOUT and interpolate to obtain the result at TOUT. */
/*               Sometimes it is not possible to integrate beyond some */
/*               point TSTOP because the equation changes there or it is */
/*               not defined past TSTOP.  Then you must tell the code */
/*               not to go past. */

/*            **** Can the integration be carried out without any */
/*                 restrictions on the independent variable T ... */
/*                  YES -- Set INFO(4)=0 */
/*                   NO -- Set INFO(4)=1 */
/*                         and define the stopping point TSTOP by */
/*                         setting RWORK(1)=TSTOP **** */

/*        INFO(5) -- To solve stiff problems it is necessary to use the */
/*               Jacobian matrix of partial derivatives of the system */
/*               of differential equations.  If you do not provide a */
/*               subroutine to evaluate it analytically (see the */
/*               description of the item DJAC in the call list), it will */
/*               be approximated by numerical differencing in this code. */
/*               Although it is less trouble for you to have the code */
/*               compute partial derivatives by numerical differencing, */
/*               the solution will be more reliable if you provide the */
/*               derivatives via DJAC.  Sometimes numerical differencing */
/*               is cheaper than evaluating derivatives in DJAC and */
/*               sometimes it is not - this depends on your problem. */

/*               If your problem is linear, i.e. has the form */
/*               DU/DX = DF(X,U) = J(X)*U + G(X)   for some matrix J(X) */
/*               and vector G(X), the Jacobian matrix  DF/DU = J(X). */
/*               Since you must provide a subroutine to evaluate DF(X,U) */
/*               analytically, it is little extra trouble to provide */
/*               subroutine DJAC for evaluating J(X) analytically. */
/*               Furthermore, in such cases, numerical differencing is */
/*               much more expensive than analytic evaluation. */

/*            **** Do you want the code to evaluate the partial */
/*                 derivatives automatically by numerical differences ... */
/*                  YES -- Set INFO(5)=0 */
/*                   NO -- Set INFO(5)=1 */
/*                         and provide subroutine DJAC for evaluating the */
/*                         Jacobian matrix **** */

/*        INFO(6) -- DDEBDF will perform much better if the Jacobian */
/*               matrix is banded and the code is told this.  In this */
/*               case, the storage needed will be greatly reduced, */
/*               numerical differencing will be performed more cheaply, */
/*               and a number of important algorithms will execute much */
/*               faster.  The differential equation is said to have */
/*               half-bandwidths ML (lower) and MU (upper) if equation I */
/*               involves only unknowns Y(J) with */
/*                              I-ML .LE. J .LE. I+MU */
/*               for all I=1,2,...,NEQ.  Thus, ML and MU are the widths */
/*               of the lower and upper parts of the band, respectively, */
/*               with the main diagonal being excluded.  If you do not */
/*               indicate that the equation has a banded Jacobian, */
/*               the code works with a full matrix of NEQ**2 elements */
/*               (stored in the conventional way).  Computations with */
/*               banded matrices cost less time and storage than with */
/*               full matrices if  2*ML+MU .LT. NEQ.  If you tell the */
/*               code that the Jacobian matrix has a banded structure and */
/*               you want to provide subroutine DJAC to compute the */
/*               partial derivatives, then you must be careful to store */
/*               the elements of the Jacobian matrix in the special form */
/*               indicated in the description of DJAC. */

/*            **** Do you want to solve the problem using a full */
/*                 (dense) Jacobian matrix (and not a special banded */
/*                 structure) ... */
/*                  YES -- Set INFO(6)=0 */
/*                   NO -- Set INFO(6)=1 */
/*                         and provide the lower (ML) and upper (MU) */
/*                         bandwidths by setting */
/*                         IWORK(1)=ML */
/*                         IWORK(2)=MU **** */

/*      RTOL, ATOL -- You must assign relative (RTOL) and absolute (ATOL) */
/*             error tolerances to tell the code how accurately you want */
/*             the solution to be computed.  They must be defined as */
/*             program variables because the code may change them.  You */
/*             have two choices -- */
/*                  Both RTOL and ATOL are scalars. (INFO(2)=0) */
/*                  Both RTOL and ATOL are vectors. (INFO(2)=1) */
/*             In either case all components must be non-negative. */

/*             The tolerances are used by the code in a local error test */
/*             at each step which requires roughly that */
/*                     ABS(LOCAL ERROR) .LE. RTOL*ABS(Y)+ATOL */
/*             for each vector component. */
/*             (More specifically, a root-mean-square norm is used to */
/*             measure the size of vectors, and the error test uses the */
/*             magnitude of the solution at the beginning of the step.) */

/*             The true (global) error is the difference between the true */
/*             solution of the initial value problem and the computed */
/*             approximation.  Practically all present day codes, */
/*             including this one, control the local error at each step */
/*             and do not even attempt to control the global error */
/*             directly.  Roughly speaking, they produce a solution Y(T) */
/*             which satisfies the differential equations with a */
/*             residual R(T),    DY(T)/DT = DF(T,Y(T)) + R(T)   , */
/*             and, almost always, R(T) is bounded by the error */
/*             tolerances.  Usually, but not always, the true accuracy of */
/*             the computed Y is comparable to the error tolerances. This */
/*             code will usually, but not always, deliver a more accurate */
/*             solution if you reduce the tolerances and integrate again. */
/*             By comparing two such solutions you can get a fairly */
/*             reliable idea of the true error in the solution at the */
/*             bigger tolerances. */

/*             Setting ATOL=0. results in a pure relative error test on */
/*             that component.  Setting RTOL=0. results in a pure abso- */
/*             lute error test on that component.  A mixed test with non- */
/*             zero RTOL and ATOL corresponds roughly to a relative error */
/*             test when the solution component is much bigger than ATOL */
/*             and to an absolute error test when the solution component */
/*             is smaller than the threshold ATOL. */

/*             Proper selection of the absolute error control parameters */
/*             ATOL  requires you to have some idea of the scale of the */
/*             solution components.  To acquire this information may mean */
/*             that you will have to solve the problem more than once. In */
/*             the absence of scale information, you should ask for some */
/*             relative accuracy in all the components (by setting  RTOL */
/*             values non-zero) and perhaps impose extremely small */
/*             absolute error tolerances to protect against the danger of */
/*             a solution component becoming zero. */

/*             The code will not attempt to compute a solution at an */
/*             accuracy unreasonable for the machine being used.  It will */
/*             advise you if you ask for too much accuracy and inform */
/*             you as to the maximum accuracy it believes possible. */

/*      RWORK(*) -- Dimension this DOUBLE PRECISION work array of length */
/*             LRW in your calling program. */

/*      RWORK(1) -- If you have set INFO(4)=0, you can ignore this */
/*             optional input parameter.  Otherwise you must define a */
/*             stopping point TSTOP by setting   RWORK(1) = TSTOP. */
/*             (For some problems it may not be permissible to integrate */
/*             past a point TSTOP because a discontinuity occurs there */
/*             or the solution or its derivative is not defined beyond */
/*             TSTOP.) */

/*      LRW -- Set it to the declared length of the RWORK array. */
/*             You must have */
/*                  LRW .GE. 250+10*NEQ+NEQ**2 */
/*             for the full (dense) Jacobian case (when INFO(6)=0),  or */
/*                  LRW .GE. 250+10*NEQ+(2*ML+MU+1)*NEQ */
/*             for the banded Jacobian case (when INFO(6)=1). */

/*      IWORK(*) -- Dimension this INTEGER work array of length LIW in */
/*             your calling program. */

/*      IWORK(1), IWORK(2) -- If you have set INFO(6)=0, you can ignore */
/*             these optional input parameters. Otherwise you must define */
/*             the half-bandwidths ML (lower) and MU (upper) of the */
/*             Jacobian matrix by setting    IWORK(1) = ML   and */
/*             IWORK(2) = MU.  (The code will work with a full matrix */
/*             of NEQ**2 elements unless it is told that the problem has */
/*             a banded Jacobian, in which case the code will work with */
/*             a matrix containing at most  (2*ML+MU+1)*NEQ  elements.) */

/*      LIW -- Set it to the declared length of the IWORK array. */
/*             You must have LIW .GE. 56+NEQ. */

/*      RPAR, IPAR -- These are parameter arrays, of DOUBLE PRECISION and */
/*             INTEGER type, respectively. You can use them for */
/*             communication between your program that calls DDEBDF and */
/*             the  DF subroutine (and the DJAC subroutine). They are not */
/*             used or altered by DDEBDF. If you do not need RPAR or */
/*             IPAR, ignore these parameters by treating them as dummy */
/*             arguments. If you do choose to use them, dimension them in */
/*             your calling program and in DF (and in DJAC) as arrays of */
/*             appropriate length. */

/*      DJAC -- If you have set INFO(5)=0, you can ignore this parameter */
/*             by treating it as a dummy argument. (For some compilers */
/*             you may have to write a dummy subroutine named  DJAC  in */
/*             order to avoid problems associated with missing external */
/*             routine names.)  Otherwise, you must provide a subroutine */
/*             of the form */
/*                          DJAC(X,U,PD,NROWPD,RPAR,IPAR) */
/*             to define the Jacobian matrix of partial derivatives DF/DU */
/*             of the system of differential equations   DU/DX = DF(X,U). */
/*             For the given values of X and the vector */
/*             U(*)=(U(1),U(2),...,U(NEQ)), the subroutine must evaluate */
/*             the non-zero partial derivatives  DF(I)/DU(J)  for each */
/*             differential equation I=1,...,NEQ and each solution */
/*             component J=1,...,NEQ , and store these values in the */
/*             matrix PD.  The elements of PD are set to zero before each */
/*             call to DJAC so only non-zero elements need to be defined. */

/*             Subroutine DJAC must not alter X, U(*), or NROWPD. You */
/*             must declare the name DJAC in an external statement in */
/*             your program that calls DDEBDF. NROWPD is the row */
/*             dimension of the PD matrix and is assigned by the code. */
/*             Therefore you must dimension PD in DJAC according to */
/*                              DIMENSION PD(NROWPD,1) */
/*             You must also dimension U in DJAC. */

/*             The way you must store the elements into the PD matrix */
/*             depends on the structure of the Jacobian which you */
/*             indicated by INFO(6). */
/*             *** INFO(6)=0 -- Full (Dense) Jacobian *** */
/*                 When you evaluate the (non-zero) partial derivative */
/*                 of equation I with respect to variable J, you must */
/*                 store it in PD according to */
/*                                PD(I,J) = * DF(I)/DU(J) * */
/*             *** INFO(6)=1 -- Banded Jacobian with ML Lower and MU */
/*                 Upper Diagonal Bands (refer to INFO(6) description of */
/*                 ML and MU) *** */
/*                 When you evaluate the (non-zero) partial derivative */
/*                 of equation I with respect to variable J, you must */
/*                 store it in PD according to */
/*                                IROW = I - J + ML + MU + 1 */
/*                                PD(IROW,J) = * DF(I)/DU(J) * */

/*             RPAR and IPAR are DOUBLE PRECISION and INTEGER parameter */
/*             arrays which you can use for communication between your */
/*             calling program and your Jacobian subroutine DJAC. They */
/*             are not altered by DDEBDF. If you do not need RPAR or */
/*             IPAR, ignore these parameters by treating them as dummy */
/*             arguments.  If you do choose to use them, dimension them */
/*             in your calling program and in DJAC as arrays of */
/*             appropriate length. */

/* ********************************************************************** */
/* * OUTPUT -- After any return from DDEBDF * */
/* ********************************************************************** */

/*   The principal aim of the code is to return a computed solution at */
/*   TOUT, although it is also possible to obtain intermediate results */
/*   along the way.  To find out whether the code achieved its goal */
/*   or if the integration process was interrupted before the task was */
/*   completed, you must check the IDID parameter. */


/*      T -- The solution was successfully advanced to the */
/*             output value of T. */

/*      Y(*) -- Contains the computed solution approximation at T. */
/*             You may also be interested in the approximate derivative */
/*             of the solution at T.  It is contained in */
/*             RWORK(21),...,RWORK(20+NEQ). */

/*      IDID -- Reports what the code did */

/*                         *** Task Completed *** */
/*                   Reported by positive values of IDID */

/*             IDID = 1 -- A step was successfully taken in the */
/*                       intermediate-output mode.  The code has not */
/*                       yet reached TOUT. */

/*             IDID = 2 -- The integration to TOUT was successfully */
/*                       completed (T=TOUT) by stepping exactly to TOUT. */

/*             IDID = 3 -- The integration to TOUT was successfully */
/*                       completed (T=TOUT) by stepping past TOUT. */
/*                       Y(*) is obtained by interpolation. */

/*                         *** Task Interrupted *** */
/*                   Reported by negative values of IDID */

/*             IDID = -1 -- A large amount of work has been expended. */
/*                       (500 steps attempted) */

/*             IDID = -2 -- The error tolerances are too stringent. */

/*             IDID = -3 -- The local error test cannot be satisfied */
/*                       because you specified a zero component in ATOL */
/*                       and the corresponding computed solution */
/*                       component is zero.  Thus, a pure relative error */
/*                       test is impossible for this component. */

/*             IDID = -4,-5  -- Not applicable for this code but used */
/*                       by other members of DEPAC. */

/*             IDID = -6 -- DDEBDF had repeated convergence test failures */
/*                       on the last attempted step. */

/*             IDID = -7 -- DDEBDF had repeated error test failures on */
/*                       the last attempted step. */

/*             IDID = -8,..,-32  -- Not applicable for this code but */
/*                       used by other members of DEPAC or possible */
/*                       future extensions. */

/*                         *** Task Terminated *** */
/*                   Reported by the value of IDID=-33 */

/*             IDID = -33 -- The code has encountered trouble from which */
/*                       it cannot recover.  A message is printed */
/*                       explaining the trouble and control is returned */
/*                       to the calling program.  For example, this */
/*                       occurs when invalid input is detected. */

/*      RTOL, ATOL -- These quantities remain unchanged except when */
/*             IDID = -2.  In this case, the error tolerances have been */
/*             increased by the code to values which are estimated to be */
/*             appropriate for continuing the integration.  However, the */
/*             reported solution at T was obtained using the input values */
/*             of RTOL and ATOL. */

/*      RWORK, IWORK -- Contain information which is usually of no */
/*             interest to the user but necessary for subsequent calls. */
/*             However, you may find use for */

/*             RWORK(11)--which contains the step size H to be */
/*                        attempted on the next step. */

/*             RWORK(12)--If the tolerances have been increased by the */
/*                        code (IDID = -2) , they were multiplied by the */
/*                        value in RWORK(12). */

/*             RWORK(13)--which contains the current value of the */
/*                        independent variable, i.e. the farthest point */
/*                        integration has reached.  This will be */
/*                        different from T only when interpolation has */
/*                        been performed (IDID=3). */

/*             RWORK(20+I)--which contains the approximate derivative */
/*                        of the solution component Y(I).  In DDEBDF, it */
/*                        is never obtained by calling subroutine DF to */
/*                        evaluate the differential equation using T and */
/*                        Y(*), except at the initial point of */
/*                        integration. */

/* ********************************************************************** */
/* ** INPUT -- What To Do To Continue The Integration ** */
/* **             (calls after the first)             ** */
/* ********************************************************************** */

/*        This code is organized so that subsequent calls to continue the */
/*        integration involve little (if any) additional effort on your */
/*        part. You must monitor the IDID parameter in order to determine */
/*        what to do next. */

/*        Recalling that the principal task of the code is to integrate */
/*        from T to TOUT (the interval mode), usually all you will need */
/*        to do is specify a new TOUT upon reaching the current TOUT. */

/*        Do not alter any quantity not specifically permitted below, */
/*        in particular do not alter NEQ, T, Y(*), RWORK(*), IWORK(*) or */
/*        the differential equation in subroutine DF. Any such alteration */
/*        constitutes a new problem and must be treated as such, i.e. */
/*        you must start afresh. */

/*        You cannot change from vector to scalar error control or vice */
/*        versa (INFO(2)) but you can change the size of the entries of */
/*        RTOL, ATOL.  Increasing a tolerance makes the equation easier */
/*        to integrate.  Decreasing a tolerance will make the equation */
/*        harder to integrate and should generally be avoided. */

/*        You can switch from the intermediate-output mode to the */
/*        interval mode (INFO(3)) or vice versa at any time. */

/*        If it has been necessary to prevent the integration from going */
/*        past a point TSTOP (INFO(4), RWORK(1)), keep in mind that the */
/*        code will not integrate to any TOUT beyond the currently */
/*        specified TSTOP.  Once TSTOP has been reached you must change */
/*        the value of TSTOP or set INFO(4)=0.  You may change INFO(4) */
/*        or TSTOP at any time but you must supply the value of TSTOP in */
/*        RWORK(1) whenever you set INFO(4)=1. */

/*        Do not change INFO(5), INFO(6), IWORK(1), or IWORK(2) */
/*        unless you are going to restart the code. */

/*        The parameter INFO(1) is used by the code to indicate the */
/*        beginning of a new problem and to indicate whether integration */
/*        is to be continued.  You must input the value  INFO(1) = 0 */
/*        when starting a new problem.  You must input the value */
/*        INFO(1) = 1  if you wish to continue after an interrupted task. */
/*        Do not set  INFO(1) = 0  on a continuation call unless you */
/*        want the code to restart at the current T. */

/*                         *** Following a Completed Task *** */
/*         If */
/*             IDID = 1, call the code again to continue the integration */
/*                     another step in the direction of TOUT. */

/*             IDID = 2 or 3, define a new TOUT and call the code again. */
/*                     TOUT must be different from T.  You cannot change */
/*                     the direction of integration without restarting. */

/*                         *** Following an Interrupted Task *** */
/*                     To show the code that you realize the task was */
/*                     interrupted and that you want to continue, you */
/*                     must take appropriate action and reset INFO(1) = 1 */
/*         If */
/*             IDID = -1, the code has attempted 500 steps. */
/*                     If you want to continue, set INFO(1) = 1 and */
/*                     call the code again.  An additional 500 steps */
/*                     will be allowed. */

/*             IDID = -2, the error tolerances RTOL, ATOL have been */
/*                     increased to values the code estimates appropriate */
/*                     for continuing.  You may want to change them */
/*                     yourself.  If you are sure you want to continue */
/*                     with relaxed error tolerances, set INFO(1)=1 and */
/*                     call the code again. */

/*             IDID = -3, a solution component is zero and you set the */
/*                     corresponding component of ATOL to zero.  If you */
/*                     are sure you want to continue, you must first */
/*                     alter the error criterion to use positive values */
/*                     for those components of ATOL corresponding to zero */
/*                     solution components, then set INFO(1)=1 and call */
/*                     the code again. */

/*             IDID = -4,-5  --- cannot occur with this code but used */
/*                     by other members of DEPAC. */

/*             IDID = -6, repeated convergence test failures occurred */
/*                     on the last attempted step in DDEBDF.  An inaccu- */
/*                     rate Jacobian may be the problem.  If you are */
/*                     absolutely certain you want to continue, restart */
/*                     the integration at the current T by setting */
/*                     INFO(1)=0 and call the code again. */

/*             IDID = -7, repeated error test failures occurred on the */
/*                     last attempted step in DDEBDF.  A singularity in */
/*                     the solution may be present.  You should re- */
/*                     examine the problem being solved.  If you are */
/*                     absolutely certain you want to continue, restart */
/*                     the integration at the current T by setting */
/*                     INFO(1)=0 and call the code again. */

/*             IDID = -8,..,-32  --- cannot occur with this code but */
/*                     used by other members of DDEPAC or possible future */
/*                     extensions. */

/*                         *** Following a Terminated Task *** */
/*         If */
/*             IDID = -33, you cannot continue the solution of this */
/*                     problem.  An attempt to do so will result in your */
/*                     run being terminated. */

/* ********************************************************************** */

/*         ***** Warning ***** */

/*     If DDEBDF is to be used in an overlay situation, you must save and */
/*     restore certain items used internally by DDEBDF  (values in the */
/*     common block DDEBD1).  This can be accomplished as follows. */

/*     To save the necessary values upon return from DDEBDF, simply call */
/*        DSVCO(RWORK(22+NEQ),IWORK(21+NEQ)). */

/*     To restore the necessary values before the next call to DDEBDF, */
/*     simply call    DRSCO(RWORK(22+NEQ),IWORK(21+NEQ)). */

/* ***REFERENCES  L. F. Shampine and H. A. Watts, DEPAC - design of a user */
/*                 oriented package of ODE solvers, Report SAND79-2374, */
/*                 Sandia Laboratories, 1979. */
/* ***ROUTINES CALLED  DLSOD, XERMSG */
/* ***COMMON BLOCKS    DDEBD1 */
/* ***REVISION HISTORY  (YYMMDD) */
/*   820301  DATE WRITTEN */
/*   890831  Modified array declarations.  (WRB) */
/*   891024  Changed references from DVNORM to DHVNRM.  (WRB) */
/*   891024  REVISION DATE from Version 3.2 */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900326  Removed duplicate information from DESCRIPTION section. */
/*           (WRB) */
/*   900510  Convert XERRWV calls to XERMSG calls, make Prologue comments */
/*           consistent with DEBDF.  (RWC) */
/*   920501  Reformatted the REFERENCES section.  (WRB) */
/* ***END PROLOGUE  DDEBDF */




/*        CHECK FOR AN APPARENT INFINITE LOOP */

/* ***FIRST EXECUTABLE STATEMENT  DDEBDF */
    /* Parameter adjustments */
    --ipar;
    --rpar;
    --iwork;
    --rwork;
    --atol;
    --rtol;
    --info;
    --y;

    /* Function Body */
    if (info[1] == 0) {
	iwork[*liw] = 0;
    }

    if (iwork[*liw] >= 5) {
	if (*t == rwork[*neq + 21]) {
	    ici__1.icierr = 0;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 16;
	    ici__1.iciunit = xern3;
	    ici__1.icifmt = "(1PE15.6)";
	    s_wsfi(&ici__1);
	    do_fio(&c__1, (char *)&(*t), (ftnlen)sizeof(doublereal));
	    e_wsfi();
/* Writing concatenation */
	    i__1[0] = 82, a__1[0] = "AN APPARENT INFINITE LOOP HAS BEEN DETE"
		    "CTED.$$YOU HAVE MADE REPEATED CALLS AT T = ";
	    i__1[1] = 16, a__1[1] = xern3;
	    i__1[2] = 50, a__1[2] = " AND THE INTEGRATION HAS NOT ADVANCED. "
		    " CHECK THE ";
	    i__1[3] = 48, a__1[3] = "WAY YOU HAVE SET PARAMETERS FOR THE CAL"
		    "L TO THE ";
	    i__1[4] = 27, a__1[4] = "CODE, PARTICULARLY INFO(1).";
	    s_cat(ch__1, a__1, i__1, &c__5, (ftnlen)223);
	    xermsg_("SLATEC", "DDEBDF", ch__1, &c__13, &c__2, (ftnlen)6, (
		    ftnlen)6, (ftnlen)223);
	    return 0;
	}
    }

    *idid = 0;

/*        CHECK VALIDITY OF INFO PARAMETERS */

    if (info[1] != 0 && info[1] != 1) {
	ici__1.icierr = 0;
	ici__1.icirnum = 1;
	ici__1.icirlen = 8;
	ici__1.iciunit = xern1;
	ici__1.icifmt = "(I8)";
	s_wsfi(&ici__1);
	do_fio(&c__1, (char *)&info[1], (ftnlen)sizeof(integer));
	e_wsfi();
/* Writing concatenation */
	i__2[0] = 204, a__2[0] = "INFO(1) MUST BE SET TO 0 FOR THE  START OF"
		" A NEW PROBLEM, AND MUST BE SET TO 1 FOLLOWING AN INTERRUPTE"
		"D TASK.  YOU ARE ATTEMPTING TO CONTINUE THE INTEGRATION ILLE"
		"GALLY BY CALLING THE CODE WITH  INFO(1) = ";
	i__2[1] = 8, a__2[1] = xern1;
	s_cat(ch__2, a__2, i__2, &c__2, (ftnlen)212);
	xermsg_("SLATEC", "DDEBDF", ch__2, &c__3, &c__1, (ftnlen)6, (ftnlen)6,
		 (ftnlen)212);
	*idid = -33;
    }

    if (info[2] != 0 && info[2] != 1) {
	ici__1.icierr = 0;
	ici__1.icirnum = 1;
	ici__1.icirlen = 8;
	ici__1.iciunit = xern1;
	ici__1.icifmt = "(I8)";
	s_wsfi(&ici__1);
	do_fio(&c__1, (char *)&info[2], (ftnlen)sizeof(integer));
	e_wsfi();
/* Writing concatenation */
	i__2[0] = 125, a__2[0] = "INFO(2) MUST BE 0 OR 1 INDICATING SCALAR A"
		"ND VECTOR ERROR TOLERANCES, RESPECTIVELY.  YOU HAVE CALLED T"
		"HE CODE WITH INFO(2) = ";
	i__2[1] = 8, a__2[1] = xern1;
	s_cat(ch__3, a__2, i__2, &c__2, (ftnlen)133);
	xermsg_("SLATEC", "DDEBDF", ch__3, &c__4, &c__1, (ftnlen)6, (ftnlen)6,
		 (ftnlen)133);
	*idid = -33;
    }

    if (info[3] != 0 && info[3] != 1) {
	ici__1.icierr = 0;
	ici__1.icirnum = 1;
	ici__1.icirlen = 8;
	ici__1.iciunit = xern1;
	ici__1.icifmt = "(I8)";
	s_wsfi(&ici__1);
	do_fio(&c__1, (char *)&info[3], (ftnlen)sizeof(integer));
	e_wsfi();
/* Writing concatenation */
	i__2[0] = 147, a__2[0] = "INFO(3) MUST BE 0 OR 1 INDICATING THE INTE"
		"RVAL OR INTERMEDIATE-OUTPUT MODE OF INTEGRATION, RESPECTIVEL"
		"Y.  YOU HAVE CALLED THE CODE WITH  INFO(3) = ";
	i__2[1] = 8, a__2[1] = xern1;
	s_cat(ch__4, a__2, i__2, &c__2, (ftnlen)155);
	xermsg_("SLATEC", "DDEBDF", ch__4, &c__5, &c__1, (ftnlen)6, (ftnlen)6,
		 (ftnlen)155);
	*idid = -33;
    }

    if (info[4] != 0 && info[4] != 1) {
	ici__1.icierr = 0;
	ici__1.icirnum = 1;
	ici__1.icirlen = 8;
	ici__1.iciunit = xern1;
	ici__1.icifmt = "(I8)";
	s_wsfi(&ici__1);
	do_fio(&c__1, (char *)&info[4], (ftnlen)sizeof(integer));
	e_wsfi();
/* Writing concatenation */
	i__2[0] = 153, a__2[0] = "INFO(4) MUST BE 0 OR 1 INDICATING WHETHER "
		"OR NOT THE INTEGRATION INTERVAL IS TO BE RESTRICTED BY A POI"
		"NT TSTOP.  YOU HAVE CALLED THE CODE WITH INFO(4) = ";
	i__2[1] = 8, a__2[1] = xern1;
	s_cat(ch__5, a__2, i__2, &c__2, (ftnlen)161);
	xermsg_("SLATEC", "DDEBDF", ch__5, &c__14, &c__1, (ftnlen)6, (ftnlen)
		6, (ftnlen)161);
	*idid = -33;
    }

    if (info[5] != 0 && info[5] != 1) {
	ici__1.icierr = 0;
	ici__1.icirnum = 1;
	ici__1.icirlen = 8;
	ici__1.iciunit = xern1;
	ici__1.icifmt = "(I8)";
	s_wsfi(&ici__1);
	do_fio(&c__1, (char *)&info[5], (ftnlen)sizeof(integer));
	e_wsfi();
/* Writing concatenation */
	i__2[0] = 211, a__2[0] = "INFO(5) MUST BE 0 OR 1 INDICATING WHETHER "
		"THE CODE IS TOLD TO FORM THE JACOBIAN MATRIX BY NUMERICAL DI"
		"FFERENCING OR YOU PROVIDE A SUBROUTINE TO EVALUATE IT ANALYT"
		"ICALLY.  YOU HAVE CALLED THE CODE WITH INFO(5) = ";
	i__2[1] = 8, a__2[1] = xern1;
	s_cat(ch__6, a__2, i__2, &c__2, (ftnlen)219);
	xermsg_("SLATEC", "DDEBDF", ch__6, &c__15, &c__1, (ftnlen)6, (ftnlen)
		6, (ftnlen)219);
	*idid = -33;
    }

    if (info[6] != 0 && info[6] != 1) {
	ici__1.icierr = 0;
	ici__1.icirnum = 1;
	ici__1.icirlen = 8;
	ici__1.iciunit = xern1;
	ici__1.icifmt = "(I8)";
	s_wsfi(&ici__1);
	do_fio(&c__1, (char *)&info[6], (ftnlen)sizeof(integer));
	e_wsfi();
/* Writing concatenation */
	i__2[0] = 188, a__2[0] = "INFO(6) MUST BE 0 OR 1 INDICATING WHETHER "
		"THE CODE IS TOLD TO TREAT THE JACOBIAN AS A FULL (DENSE) MAT"
		"RIX OR AS HAVING A SPECIAL BANDED STRUCTURE.  YOU HAVE CALLE"
		"D THE CODE WITH INFO(6) = ";
	i__2[1] = 8, a__2[1] = xern1;
	s_cat(ch__7, a__2, i__2, &c__2, (ftnlen)196);
	xermsg_("SLATEC", "DDEBDF", ch__7, &c__16, &c__1, (ftnlen)6, (ftnlen)
		6, (ftnlen)196);
	*idid = -33;
    }

    ilrw = *neq;
    if (info[6] != 0) {

/*        CHECK BANDWIDTH PARAMETERS */

	ml = iwork[1];
	mu = iwork[2];
	ilrw = (ml << 1) + mu + 1;

	if (ml < 0 || ml >= *neq || mu < 0 || mu >= *neq) {
	    ici__1.icierr = 0;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 8;
	    ici__1.iciunit = xern1;
	    ici__1.icifmt = "(I8)";
	    s_wsfi(&ici__1);
	    do_fio(&c__1, (char *)&ml, (ftnlen)sizeof(integer));
	    e_wsfi();
	    ici__1.icierr = 0;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 8;
	    ici__1.iciunit = xern2;
	    ici__1.icifmt = "(I8)";
	    s_wsfi(&ici__1);
	    do_fio(&c__1, (char *)&mu, (ftnlen)sizeof(integer));
	    e_wsfi();
/* Writing concatenation */
	    i__3[0] = 242, a__3[0] = "YOU HAVE SET INFO(6) = 1, TELLING THE "
		    "CODE THAT THE JACOBIAN MATRIX HAS A SPECIAL BANDED STRUC"
		    "TURE.  HOWEVER, THE LOWER (UPPER) BANDWIDTHS  ML (MU) VI"
		    "OLATE THE CONSTRAINTS ML,MU .GE. 0 AND  ML,MU .LT. NEQ. "
		    " YOU HAVE CALLED THE CODE WITH ML = ";
	    i__3[1] = 8, a__3[1] = xern1;
	    i__3[2] = 10, a__3[2] = " AND MU = ";
	    i__3[3] = 8, a__3[3] = xern2;
	    s_cat(ch__8, a__3, i__3, &c__4, (ftnlen)268);
	    xermsg_("SLATEC", "DDEBDF", ch__8, &c__17, &c__1, (ftnlen)6, (
		    ftnlen)6, (ftnlen)268);
	    *idid = -33;
	}
    }

/*        CHECK LRW AND LIW FOR SUFFICIENT STORAGE ALLOCATION */

    if (*lrw < (ilrw + 10) * *neq + 250) {
	ici__1.icierr = 0;
	ici__1.icirnum = 1;
	ici__1.icirlen = 8;
	ici__1.iciunit = xern1;
	ici__1.icifmt = "(I8)";
	s_wsfi(&ici__1);
	do_fio(&c__1, (char *)&(*lrw), (ftnlen)sizeof(integer));
	e_wsfi();
	if (info[6] == 0) {
/* Writing concatenation */
	    i__2[0] = 101, a__2[0] = "LENGTH OF ARRAY RWORK MUST BE AT LEAST"
		    " 250 + 10*NEQ + NEQ*NEQ.$$YOU HAVE CALLED THE CODE WITH "
		    " LRW = ";
	    i__2[1] = 8, a__2[1] = xern1;
	    s_cat(ch__9, a__2, i__2, &c__2, (ftnlen)109);
	    xermsg_("SLATEC", "DDEBDF", ch__9, &c__1, &c__1, (ftnlen)6, (
		    ftnlen)6, (ftnlen)109);
	} else {
/* Writing concatenation */
	    i__2[0] = 109, a__2[0] = "LENGTH OF ARRAY RWORK MUST BE AT LEAST"
		    " 250 + 10*NEQ + (2*ML+MU+1)*NEQ.$$YOU HAVE CALLED THE CO"
		    "DE WITH  LRW = ";
	    i__2[1] = 8, a__2[1] = xern1;
	    s_cat(ch__10, a__2, i__2, &c__2, (ftnlen)117);
	    xermsg_("SLATEC", "DDEBDF", ch__10, &c__18, &c__1, (ftnlen)6, (
		    ftnlen)6, (ftnlen)117);
	}
	*idid = -33;
    }

    if (*liw < *neq + 56) {
	ici__1.icierr = 0;
	ici__1.icirnum = 1;
	ici__1.icirlen = 8;
	ici__1.iciunit = xern1;
	ici__1.icifmt = "(I8)";
	s_wsfi(&ici__1);
	do_fio(&c__1, (char *)&(*liw), (ftnlen)sizeof(integer));
	e_wsfi();
/* Writing concatenation */
	i__2[0] = 82, a__2[0] = "LENGTH OF ARRAY IWORK BE AT LEAST  56 + NEQ"
		".  YOU HAVE CALLED THE CODE WITH LIW = ";
	i__2[1] = 8, a__2[1] = xern1;
	s_cat(ch__11, a__2, i__2, &c__2, (ftnlen)90);
	xermsg_("SLATEC", "DDEBDF", ch__11, &c__2, &c__1, (ftnlen)6, (ftnlen)
		6, (ftnlen)90);
	*idid = -33;
    }

/*        COMPUTE THE INDICES FOR THE ARRAYS TO BE STORED IN THE WORK */
/*        ARRAY AND RESTORE COMMON BLOCK DATA */

    icomi = *neq + 21;
    iinout = icomi + 33;

    iypout = 21;
    itstar = *neq + 21;
    icomr = *neq + 22;

    if (info[1] != 0) {
	intout = iwork[iinout] != -1;
    }
/*     CALL DRSCO(RWORK(ICOMR),IWORK(ICOMI)) */

    ddebd1_1.iyh = icomr + 218;
    ddebd1_1.iewt = ddebd1_1.iyh + *neq * 6;
    ddebd1_1.isavf = ddebd1_1.iewt + *neq;
    ddebd1_1.iacor = ddebd1_1.isavf + *neq;
    ddebd1_1.iwm = ddebd1_1.iacor + *neq;
    idelsn = ddebd1_1.iwm + 2 + ilrw * *neq;

    ddebd1_1.ibegin = info[1];
    ddebd1_1.itol = info[2];
    ddebd1_1.iinteg = info[3];
    ddebd1_1.itstop = info[4];
    ddebd1_1.ijac = info[5];
    ddebd1_1.iband = info[6];
    rwork[itstar] = *t;

    dlsod_((U_fp)df, neq, t, &y[1], tout, &rtol[1], &atol[1], idid, &rwork[
	    iypout], &rwork[ddebd1_1.iyh], &rwork[ddebd1_1.iyh], &rwork[
	    ddebd1_1.iewt], &rwork[ddebd1_1.isavf], &rwork[ddebd1_1.iacor], &
	    rwork[ddebd1_1.iwm], &iwork[1], (U_fp)djac, &intout, &rwork[1], &
	    rwork[12], &rwork[idelsn], &rpar[1], &ipar[1]);

    iwork[iinout] = -1;
    if (intout) {
	iwork[iinout] = 1;
    }

    if (*idid != -2) {
	++iwork[*liw];
    }
    if (*t != rwork[itstar]) {
	iwork[*liw] = 0;
    }
/*     CALL DSVCO(RWORK(ICOMR),IWORK(ICOMI)) */
    rwork[11] = ddebd1_1.h__;
    rwork[13] = ddebd1_1.tn;
    info[1] = ddebd1_1.ibegin;

    return 0;
} /* ddebdf_ */

/* DECK DLSOD */
/* Subroutine */ int dlsod_(S_fp df, integer *neq, doublereal *t, doublereal *
	y, doublereal *tout, doublereal *rtol, doublereal *atol, integer *
	idid, doublereal *ypout, doublereal *yh, doublereal *yh1, doublereal *
	ewt, doublereal *savf, doublereal *acor, doublereal *wm, integer *iwm,
	 U_fp djac, logical *intout, doublereal *tstop, doublereal *tolfac, 
	doublereal *delsgn, doublereal *rpar, integer *ipar)
{
    /* Initialized data */

    static integer maxnum = 500;

    /* System generated locals */
    address a__1[2], a__2[7], a__3[6], a__4[8], a__5[3], a__6[5];
    integer yh_dim1, yh_offset, i__1[2], i__2, i__3[7], i__4[6], i__5[8], 
	    i__6[3], i__7[5];
    doublereal d__1, d__2, d__3, d__4;
    char ch__1[108], ch__2[216], ch__3[208], ch__4[112], ch__5[128], ch__6[
	    159];
    icilist ici__1;

    /* Builtin functions */
    double sqrt(doublereal);
    integer s_wsfi(icilist *), do_fio(integer *, char *, ftnlen), e_wsfi(void)
	    ;
    /* Subroutine */ int s_cat(char *, char **, integer *, integer *, ftnlen);
    double d_sign(doublereal *, doublereal *);

    /* Local variables */
    integer k, l;
    doublereal ha, dt, big, del, tol;
    integer ltol;
    char xern1[8], xern3[16], xern4[16];
    extern /* Subroutine */ int dstod_(integer *, doublereal *, doublereal *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *,
	     doublereal *, integer *, S_fp, U_fp, doublereal *, integer *);
    extern doublereal d1mach_(integer *);
    doublereal absdel;
    integer intflg;
    extern /* Subroutine */ int dintyd_(doublereal *, integer *, doublereal *,
	     integer *, doublereal *, integer *);
    integer natolp;
    extern /* Subroutine */ int xermsg_(char *, char *, char *, integer *, 
	    integer *, ftnlen, ftnlen, ftnlen), dhstrt_(S_fp, integer *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, integer *, doublereal *, doublereal *, doublereal *,
	     doublereal *, doublereal *, doublereal *, doublereal *, integer *
	    , doublereal *);
    extern doublereal dvnrms_(integer *, doublereal *, doublereal *);
    integer nrtolp;

/* ***BEGIN PROLOGUE  DLSOD */
/* ***SUBSIDIARY */
/* ***PURPOSE  Subsidiary to DDEBDF */
/* ***LIBRARY   SLATEC */
/* ***TYPE      DOUBLE PRECISION (LSOD-S, DLSOD-D) */
/* ***AUTHOR  (UNKNOWN) */
/* ***DESCRIPTION */

/*   DDEBDF  merely allocates storage for  DLSOD  to relieve the user of */
/*   the inconvenience of a long call list.  Consequently  DLSOD  is used */
/*   as described in the comments for  DDEBDF . */

/* ***SEE ALSO  DDEBDF */
/* ***ROUTINES CALLED  D1MACH, DHSTRT, DINTYD, DSTOD, DVNRMS, XERMSG */
/* ***COMMON BLOCKS    DDEBD1 */
/* ***REVISION HISTORY  (YYMMDD) */
/*   820301  DATE WRITTEN */
/*   890531  Changed all specific intrinsics to generic.  (WRB) */
/*   890831  Modified array declarations.  (WRB) */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900328  Added TYPE section.  (WRB) */
/*   900510  Convert XERRWV calls to XERMSG calls.  (RWC) */
/* ***END PROLOGUE  DLSOD */






/*     .................................................................. */

/*       THE EXPENSE OF SOLVING THE PROBLEM IS MONITORED BY COUNTING THE */
/*       NUMBER OF  STEPS ATTEMPTED. WHEN THIS EXCEEDS  MAXNUM, THE */
/*       COUNTER IS RESET TO ZERO AND THE USER IS INFORMED ABOUT POSSIBLE */
/*       EXCESSIVE WORK. */

    /* Parameter adjustments */
    yh_dim1 = *neq;
    yh_offset = 1 + yh_dim1;
    yh -= yh_offset;
    --y;
    --rtol;
    --atol;
    --ypout;
    --yh1;
    --ewt;
    --savf;
    --acor;
    --wm;
    --iwm;
    --rpar;
    --ipar;

    /* Function Body */

/*     .................................................................. */

/* ***FIRST EXECUTABLE STATEMENT  DLSOD */
    if (ddebd1_2.ibegin == 0) {

/*        ON THE FIRST CALL , PERFORM INITIALIZATION -- */
/*        DEFINE THE MACHINE UNIT ROUNDOFF QUANTITY  U  BY CALLING THE */
/*        FUNCTION ROUTINE D1MACH. THE USER MUST MAKE SURE THAT THE */
/*        VALUES SET IN D1MACH ARE RELEVANT TO THE COMPUTER BEING USED. */

	ddebd1_2.u = d1mach_(&c__4);
/*                          -- SET ASSOCIATED MACHINE DEPENDENT PARAMETER */
	wm[1] = sqrt(ddebd1_2.u);
/*                          -- SET TERMINATION FLAG */
	ddebd1_2.iquit = 0;
/*                          -- SET INITIALIZATION INDICATOR */
	ddebd1_2.init = 0;
/*                          -- SET COUNTER FOR ATTEMPTED STEPS */
	ddebd1_2.ksteps = 0;
/*                          -- SET INDICATOR FOR INTERMEDIATE-OUTPUT */
	*intout = FALSE_;
/*                          -- SET START INDICATOR FOR DSTOD CODE */
	ddebd1_2.jstart = 0;
/*                          -- SET BDF METHOD INDICATOR */
	ddebd1_2.meth = 2;
/*                          -- SET MAXIMUM ORDER FOR BDF METHOD */
	ddebd1_2.maxord = 5;
/*                          -- SET ITERATION MATRIX INDICATOR */

	if (ddebd1_2.ijac == 0 && ddebd1_2.iband == 0) {
	    ddebd1_2.miter = 2;
	}
	if (ddebd1_2.ijac == 1 && ddebd1_2.iband == 0) {
	    ddebd1_2.miter = 1;
	}
	if (ddebd1_2.ijac == 0 && ddebd1_2.iband == 1) {
	    ddebd1_2.miter = 5;
	}
	if (ddebd1_2.ijac == 1 && ddebd1_2.iband == 1) {
	    ddebd1_2.miter = 4;
	}

/*                          -- SET OTHER NECESSARY ITEMS IN COMMON BLOCK */
	ddebd1_2.n = *neq;
	ddebd1_2.nst = 0;
	ddebd1_2.nje = 0;
	ddebd1_2.hmxi = 0.;
	ddebd1_2.nq = 1;
	ddebd1_2.h__ = 1.;
/*                          -- RESET IBEGIN FOR SUBSEQUENT CALLS */
	ddebd1_2.ibegin = 1;
    }

/*     .................................................................. */

/*      CHECK VALIDITY OF INPUT PARAMETERS ON EACH ENTRY */

    if (*neq < 1) {
	ici__1.icierr = 0;
	ici__1.icirnum = 1;
	ici__1.icirlen = 8;
	ici__1.iciunit = xern1;
	ici__1.icifmt = "(I8)";
	s_wsfi(&ici__1);
	do_fio(&c__1, (char *)&(*neq), (ftnlen)sizeof(integer));
	e_wsfi();
/* Writing concatenation */
	i__1[0] = 100, a__1[0] = "IN DDEBDF, THE NUMBER OF EQUATIONS MUST BE"
		" A POSITIVE INTEGER.$$YOU HAVE CALLED THE CODE WITH NEQ = ";
	i__1[1] = 8, a__1[1] = xern1;
	s_cat(ch__1, a__1, i__1, &c__2, (ftnlen)108);
	xermsg_("SLATEC", "DLSOD", ch__1, &c__6, &c__1, (ftnlen)6, (ftnlen)5, 
		(ftnlen)108);
	*idid = -33;
    }

    nrtolp = 0;
    natolp = 0;
    i__2 = *neq;
    for (k = 1; k <= i__2; ++k) {
	if (nrtolp <= 0) {
	    if (rtol[k] < 0.f) {
		ici__1.icierr = 0;
		ici__1.icirnum = 1;
		ici__1.icirlen = 8;
		ici__1.iciunit = xern1;
		ici__1.icifmt = "(I8)";
		s_wsfi(&ici__1);
		do_fio(&c__1, (char *)&k, (ftnlen)sizeof(integer));
		e_wsfi();
		ici__1.icierr = 0;
		ici__1.icirnum = 1;
		ici__1.icirlen = 16;
		ici__1.iciunit = xern3;
		ici__1.icifmt = "(1PE15.6)";
		s_wsfi(&ici__1);
		do_fio(&c__1, (char *)&rtol[k], (ftnlen)sizeof(doublereal));
		e_wsfi();
/* Writing concatenation */
		i__3[0] = 99, a__2[0] = "IN DDEBDF, THE RELATIVE ERROR TOLER"
			"ANCES MUST BE NON-NEGATIVE.$$YOU HAVE CALLED THE COD"
			"E WITH RTOL(";
		i__3[1] = 8, a__2[1] = xern1;
		i__3[2] = 4, a__2[2] = ") = ";
		i__3[3] = 16, a__2[3] = xern3;
		i__3[4] = 9, a__2[4] = "$$IN THE ";
		i__3[5] = 44, a__2[5] = "CASE OF VECTOR ERROR TOLERANCES, NO"
			" FURTHER ";
		i__3[6] = 36, a__2[6] = "CHECKING OF RTOL COMPONENTS IS DONE."
			;
		s_cat(ch__2, a__2, i__3, &c__7, (ftnlen)216);
		xermsg_("SLATEC", "DLSOD", ch__2, &c__7, &c__1, (ftnlen)6, (
			ftnlen)5, (ftnlen)216);
		*idid = -33;
		if (natolp > 0) {
		    goto L70;
		}
		nrtolp = 1;
	    } else if (natolp > 0) {
		goto L50;
	    }
	}

	if (atol[k] < 0.f) {
	    ici__1.icierr = 0;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 8;
	    ici__1.iciunit = xern1;
	    ici__1.icifmt = "(I8)";
	    s_wsfi(&ici__1);
	    do_fio(&c__1, (char *)&k, (ftnlen)sizeof(integer));
	    e_wsfi();
	    ici__1.icierr = 0;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 16;
	    ici__1.iciunit = xern3;
	    ici__1.icifmt = "(1PE15.6)";
	    s_wsfi(&ici__1);
	    do_fio(&c__1, (char *)&atol[k], (ftnlen)sizeof(doublereal));
	    e_wsfi();
/* Writing concatenation */
	    i__4[0] = 99, a__3[0] = "IN DDEBDF, THE ABSOLUTE ERROR TOLERANCE"
		    "S MUST BE NON-NEGATIVE.$$YOU HAVE CALLED THE CODE WITH A"
		    "TOL(";
	    i__4[1] = 8, a__3[1] = xern1;
	    i__4[2] = 4, a__3[2] = ") = ";
	    i__4[3] = 16, a__3[3] = xern3;
	    i__4[4] = 53, a__3[4] = "$$IN THE CASE OF VECTOR ERROR TOLERANCE"
		    "S, NO FURTHER ";
	    i__4[5] = 36, a__3[5] = "CHECKING OF ATOL COMPONENTS IS DONE.";
	    s_cat(ch__2, a__3, i__4, &c__6, (ftnlen)216);
	    xermsg_("SLATEC", "DLSOD", ch__2, &c__8, &c__1, (ftnlen)6, (
		    ftnlen)5, (ftnlen)216);
	    *idid = -33;
	    if (nrtolp > 0) {
		goto L70;
	    }
	    natolp = 1;
	}
L50:
	if (ddebd1_2.itol == 0) {
	    goto L70;
	}
/* L60: */
    }

L70:
    if (ddebd1_2.itstop == 1) {
	d__3 = *tout - *t;
	d__4 = *tstop - *t;
	if (d_sign(&c_b134, &d__3) != d_sign(&c_b134, &d__4) || (d__1 = *tout 
		- *t, abs(d__1)) > (d__2 = *tstop - *t, abs(d__2))) {
	    ici__1.icierr = 0;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 16;
	    ici__1.iciunit = xern3;
	    ici__1.icifmt = "(1PE15.6)";
	    s_wsfi(&ici__1);
	    do_fio(&c__1, (char *)&(*tout), (ftnlen)sizeof(doublereal));
	    e_wsfi();
	    ici__1.icierr = 0;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 16;
	    ici__1.iciunit = xern4;
	    ici__1.icifmt = "(1PE15.6)";
	    s_wsfi(&ici__1);
	    do_fio(&c__1, (char *)&(*tstop), (ftnlen)sizeof(doublereal));
	    e_wsfi();
/* Writing concatenation */
	    i__5[0] = 48, a__4[0] = "IN DDEBDF, YOU HAVE CALLED THE CODE WIT"
		    "H TOUT = ";
	    i__5[1] = 16, a__4[1] = xern3;
	    i__5[2] = 15, a__4[2] = "$$BUT YOU HAVE ";
	    i__5[3] = 51, a__4[3] = "ALSO TOLD THE CODE NOT TO INTEGRATE PAS"
		    "T THE POINT ";
	    i__5[4] = 8, a__4[4] = "TSTOP = ";
	    i__5[5] = 16, a__4[5] = xern4;
	    i__5[6] = 26, a__4[6] = " BY SETTING INFO(4) = 1.$$";
	    i__5[7] = 28, a__4[7] = "THESE INSTRUCTIONS CONFLICT.";
	    s_cat(ch__3, a__4, i__5, &c__8, (ftnlen)208);
	    xermsg_("SLATEC", "DLSOD", ch__3, &c__14, &c__1, (ftnlen)6, (
		    ftnlen)5, (ftnlen)208);
	    *idid = -33;
	}
    }

/*        CHECK SOME CONTINUATION POSSIBILITIES */

    if (ddebd1_2.init != 0) {
	if (*t == *tout) {
	    ici__1.icierr = 0;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 16;
	    ici__1.iciunit = xern3;
	    ici__1.icifmt = "(1PE15.6)";
	    s_wsfi(&ici__1);
	    do_fio(&c__1, (char *)&(*t), (ftnlen)sizeof(doublereal));
	    e_wsfi();
/* Writing concatenation */
	    i__6[0] = 52, a__5[0] = "IN DDEBDF, YOU HAVE CALLED THE CODE WIT"
		    "H T = TOUT = ";
	    i__6[1] = 16, a__5[1] = xern3;
	    i__6[2] = 44, a__5[2] = "$$THIS IS NOT ALLOWED ON CONTINUATION C"
		    "ALLS.";
	    s_cat(ch__4, a__5, i__6, &c__3, (ftnlen)112);
	    xermsg_("SLATEC", "DLSOD", ch__4, &c__9, &c__1, (ftnlen)6, (
		    ftnlen)5, (ftnlen)112);
	    *idid = -33;
	}

	if (*t != ddebd1_2.told) {
	    ici__1.icierr = 0;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 16;
	    ici__1.iciunit = xern3;
	    ici__1.icifmt = "(1PE15.6)";
	    s_wsfi(&ici__1);
	    do_fio(&c__1, (char *)&ddebd1_2.told, (ftnlen)sizeof(doublereal));
	    e_wsfi();
	    ici__1.icierr = 0;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 16;
	    ici__1.iciunit = xern4;
	    ici__1.icifmt = "(1PE15.6)";
	    s_wsfi(&ici__1);
	    do_fio(&c__1, (char *)&(*t), (ftnlen)sizeof(doublereal));
	    e_wsfi();
/* Writing concatenation */
	    i__7[0] = 48, a__6[0] = "IN DDEBDF, YOU HAVE CHANGED THE VALUE O"
		    "F T FROM ";
	    i__7[1] = 16, a__6[1] = xern3;
	    i__7[2] = 4, a__6[2] = " TO ";
	    i__7[3] = 16, a__6[3] = xern4;
	    i__7[4] = 44, a__6[4] = "  THIS IS NOT ALLOWED ON CONTINUATION C"
		    "ALLS.";
	    s_cat(ch__5, a__6, i__7, &c__5, (ftnlen)128);
	    xermsg_("SLATEC", "DLSOD", ch__5, &c__10, &c__1, (ftnlen)6, (
		    ftnlen)5, (ftnlen)128);
	    *idid = -33;
	}

	if (ddebd1_2.init != 1) {
	    if (*delsgn * (*tout - *t) < 0.) {
		ici__1.icierr = 0;
		ici__1.icirnum = 1;
		ici__1.icirlen = 16;
		ici__1.iciunit = xern3;
		ici__1.icifmt = "(1PE15.6)";
		s_wsfi(&ici__1);
		do_fio(&c__1, (char *)&(*tout), (ftnlen)sizeof(doublereal));
		e_wsfi();
/* Writing concatenation */
		i__7[0] = 43, a__6[0] = "IN DDEBDF, BY CALLING THE CODE WITH"
			" TOUT = ";
		i__7[1] = 16, a__6[1] = xern3;
		i__7[2] = 34, a__6[2] = " YOU ARE ATTEMPTING TO CHANGE THE ";
		i__7[3] = 47, a__6[3] = "DIRECTION OF INTEGRATION.$$THIS IS "
			"NOT ALLOWED ";
		i__7[4] = 19, a__6[4] = "WITHOUT RESTARTING.";
		s_cat(ch__6, a__6, i__7, &c__5, (ftnlen)159);
		xermsg_("SLATEC", "DLSOD", ch__6, &c__11, &c__1, (ftnlen)6, (
			ftnlen)5, (ftnlen)159);
		*idid = -33;
	    }
	}
    }

    if (*idid == -33) {
	if (ddebd1_2.iquit != -33) {
/*                       INVALID INPUT DETECTED */
	    ddebd1_2.iquit = -33;
	    ddebd1_2.ibegin = -1;
	} else {
	    xermsg_("SLATEC", "DLSOD", "IN DDEBDF, INVALID INPUT WAS DETECTE"
		    "D ON SUCCESSIVE ENTRIES.  IT IS IMPOSSIBLE TO PROCEED BE"
		    "CAUSE YOU HAVE NOT CORRECTED THE PROBLEM, SO EXECUTION I"
		    "S BEING TERMINATED.", &c__12, &c__2, (ftnlen)6, (ftnlen)5,
		     (ftnlen)167);
	}
	return 0;
    }

/*        ............................................................... */

/*             RTOL = ATOL = 0. IS ALLOWED AS VALID INPUT AND INTERPRETED */
/*             AS ASKING FOR THE MOST ACCURATE SOLUTION POSSIBLE. IN THIS */
/*             CASE, THE RELATIVE ERROR TOLERANCE RTOL IS RESET TO THE */
/*             SMALLEST VALUE 100*U WHICH IS LIKELY TO BE REASONABLE FOR */
/*             THIS METHOD AND MACHINE */

    i__2 = *neq;
    for (k = 1; k <= i__2; ++k) {
	if (rtol[k] + atol[k] > 0.) {
	    goto L170;
	}
	rtol[k] = ddebd1_2.u * 100.;
	*idid = -2;
L170:
/*     ...EXIT */
	if (ddebd1_2.itol == 0) {
	    goto L190;
	}
/* L180: */
    }
L190:

    if (*idid != -2) {
	goto L200;
    }
/*        RTOL=ATOL=0 ON INPUT, SO RTOL IS CHANGED TO A */
/*                                 SMALL POSITIVE VALUE */
    ddebd1_2.ibegin = -1;
    goto L460;
L200:
/*        BEGIN BLOCK PERMITTING ...EXITS TO 450 */
/*           BEGIN BLOCK PERMITTING ...EXITS TO 430 */
/*              BEGIN BLOCK PERMITTING ...EXITS TO 260 */
/*                 BEGIN BLOCK PERMITTING ...EXITS TO 230 */

/*                    BRANCH ON STATUS OF INITIALIZATION INDICATOR */
/*                           INIT=0 MEANS INITIAL DERIVATIVES AND */
/*                           NOMINAL STEP SIZE */
/*                                  AND DIRECTION NOT YET SET */
/*                           INIT=1 MEANS NOMINAL STEP SIZE AND */
/*                           DIRECTION NOT YET SET INIT=2 MEANS NO */
/*                           FURTHER INITIALIZATION REQUIRED */

    if (ddebd1_2.init == 0) {
	goto L210;
    }
/*                 ......EXIT */
    if (ddebd1_2.init == 1) {
	goto L230;
    }
/*              .........EXIT */
    goto L260;
L210:

/*                    ................................................ */

/*                         MORE INITIALIZATION -- */
/*                                             -- EVALUATE INITIAL */
/*                                             DERIVATIVES */

    ddebd1_2.init = 1;
    (*df)(t, &y[1], &yh[(yh_dim1 << 1) + 1], &rpar[1], &ipar[1]);
    ddebd1_2.nfe = 1;
/*                 ...EXIT */
    if (*t != *tout) {
	goto L230;
    }
    *idid = 2;
    i__2 = *neq;
    for (l = 1; l <= i__2; ++l) {
	ypout[l] = yh[l + (yh_dim1 << 1)];
/* L220: */
    }
    ddebd1_2.told = *t;
/*        ............EXIT */
    goto L450;
L230:

/*                 -- COMPUTE INITIAL STEP SIZE */
/*                 -- SAVE SIGN OF INTEGRATION DIRECTION */
/*                 -- SET INDEPENDENT AND DEPENDENT VARIABLES */
/*                                      X AND YH(*) FOR DSTOD */

    ltol = 1;
    i__2 = *neq;
    for (l = 1; l <= i__2; ++l) {
	if (ddebd1_2.itol == 1) {
	    ltol = l;
	}
	tol = rtol[ltol] * (d__1 = y[l], abs(d__1)) + atol[ltol];
	if (tol == 0.) {
	    goto L390;
	}
	ewt[l] = tol;
/* L240: */
    }

    big = sqrt(d1mach_(&c__2));
    dhstrt_((S_fp)df, neq, t, tout, &y[1], &yh[(yh_dim1 << 1) + 1], &ewt[1], &
	    c__1, &ddebd1_2.u, &big, &yh[yh_dim1 * 3 + 1], &yh[(yh_dim1 << 2) 
	    + 1], &yh[yh_dim1 * 5 + 1], &yh[yh_dim1 * 6 + 1], &rpar[1], &ipar[
	    1], &ddebd1_2.h__);

    d__1 = *tout - *t;
    *delsgn = d_sign(&c_b134, &d__1);
    ddebd1_2.x = *t;
    i__2 = *neq;
    for (l = 1; l <= i__2; ++l) {
	yh[l + yh_dim1] = y[l];
	yh[l + (yh_dim1 << 1)] = ddebd1_2.h__ * yh[l + (yh_dim1 << 1)];
/* L250: */
    }
    ddebd1_2.init = 2;
L260:

/*              ...................................................... */

/*                 ON EACH CALL SET INFORMATION WHICH DETERMINES THE */
/*                 ALLOWED INTERVAL OF INTEGRATION BEFORE RETURNING */
/*                 WITH AN ANSWER AT TOUT */

    del = *tout - *t;
    absdel = abs(del);

/*              ...................................................... */

/*                 IF ALREADY PAST OUTPUT POINT, INTERPOLATE AND */
/*                 RETURN */

L270:
/*                 BEGIN BLOCK PERMITTING ...EXITS TO 400 */
/*                    BEGIN BLOCK PERMITTING ...EXITS TO 380 */
    if ((d__1 = ddebd1_2.x - *t, abs(d__1)) < absdel) {
	goto L290;
    }
    dintyd_(tout, &c__0, &yh[yh_offset], neq, &y[1], &intflg);
    dintyd_(tout, &c__1, &yh[yh_offset], neq, &ypout[1], &intflg);
    *idid = 3;
    if (ddebd1_2.x != *tout) {
	goto L280;
    }
    *idid = 2;
    *intout = FALSE_;
L280:
    *t = *tout;
    ddebd1_2.told = *t;
/*        ..................EXIT */
    goto L450;
L290:

/*                       IF CANNOT GO PAST TSTOP AND SUFFICIENTLY */
/*                       CLOSE, EXTRAPOLATE AND RETURN */

    if (ddebd1_2.itstop != 1) {
	goto L310;
    }
    if ((d__1 = *tstop - ddebd1_2.x, abs(d__1)) >= ddebd1_2.u * 100. * abs(
	    ddebd1_2.x)) {
	goto L310;
    }
    dt = *tout - ddebd1_2.x;
    i__2 = *neq;
    for (l = 1; l <= i__2; ++l) {
	y[l] = yh[l + yh_dim1] + dt / ddebd1_2.h__ * yh[l + (yh_dim1 << 1)];
/* L300: */
    }
    (*df)(tout, &y[1], &ypout[1], &rpar[1], &ipar[1]);
    ++ddebd1_2.nfe;
    *idid = 3;
    *t = *tout;
    ddebd1_2.told = *t;
/*        ..................EXIT */
    goto L450;
L310:

    if (ddebd1_2.iinteg == 0 || ! (*intout)) {
	goto L320;
    }

/*                          INTERMEDIATE-OUTPUT MODE */

    *idid = 1;
    goto L370;
L320:

/*                       ............................................. */

/*                            MONITOR NUMBER OF STEPS ATTEMPTED */

    if (ddebd1_2.ksteps <= maxnum) {
	goto L330;
    }

/*                          A SIGNIFICANT AMOUNT OF WORK HAS BEEN */
/*                          EXPENDED */
    *idid = -1;
    ddebd1_2.ksteps = 0;
    ddebd1_2.ibegin = -1;
    goto L370;
L330:

/*                          .......................................... */

/*                             LIMIT STEP SIZE AND SET WEIGHT VECTOR */

    ddebd1_2.hmin = ddebd1_2.u * 100. * abs(ddebd1_2.x);
/* Computing MAX */
    d__1 = abs(ddebd1_2.h__);
    ha = max(d__1,ddebd1_2.hmin);
    if (ddebd1_2.itstop == 1) {
/* Computing MIN */
	d__2 = ha, d__3 = (d__1 = *tstop - ddebd1_2.x, abs(d__1));
	ha = min(d__2,d__3);
    }
    ddebd1_2.h__ = d_sign(&ha, &ddebd1_2.h__);
    ltol = 1;
    i__2 = *neq;
    for (l = 1; l <= i__2; ++l) {
	if (ddebd1_2.itol == 1) {
	    ltol = l;
	}
	ewt[l] = rtol[ltol] * (d__1 = yh[l + yh_dim1], abs(d__1)) + atol[ltol]
		;
/*                    .........EXIT */
	if (ewt[l] <= 0.) {
	    goto L380;
	}
/* L340: */
    }
    *tolfac = ddebd1_2.u * dvnrms_(neq, &yh[yh_offset], &ewt[1]);
/*                 .........EXIT */
    if (*tolfac <= 1.) {
	goto L400;
    }

/*                          TOLERANCES TOO SMALL */
    *idid = -2;
    *tolfac *= 2.;
    rtol[1] = *tolfac * rtol[1];
    atol[1] = *tolfac * atol[1];
    if (ddebd1_2.itol == 0) {
	goto L360;
    }
    i__2 = *neq;
    for (l = 2; l <= i__2; ++l) {
	rtol[l] = *tolfac * rtol[l];
	atol[l] = *tolfac * atol[l];
/* L350: */
    }
L360:
    ddebd1_2.ibegin = -1;
L370:
/*           ............EXIT */
    goto L430;
L380:

/*                    RELATIVE ERROR CRITERION INAPPROPRIATE */
L390:
    *idid = -3;
    ddebd1_2.ibegin = -1;
/*           .........EXIT */
    goto L430;
L400:

/*                 ................................................... */

/*                      TAKE A STEP */

    dstod_(neq, &y[1], &yh[yh_offset], neq, &yh1[1], &ewt[1], &savf[1], &acor[
	    1], &wm[1], &iwm[1], (S_fp)df, (U_fp)djac, &rpar[1], &ipar[1]);

    ddebd1_2.jstart = -2;
    *intout = TRUE_;
    if (ddebd1_2.kflag == 0) {
	goto L270;
    }

/*              ...................................................... */

    if (ddebd1_2.kflag == -1) {
	goto L410;
    }

/*                 REPEATED CORRECTOR CONVERGENCE FAILURES */
    *idid = -6;
    ddebd1_2.ibegin = -1;
    goto L420;
L410:

/*                 REPEATED ERROR TEST FAILURES */
    *idid = -7;
    ddebd1_2.ibegin = -1;
L420:
L430:

/*           ......................................................... */

/*                                  STORE VALUES BEFORE RETURNING TO */
/*                                  DDEBDF */
    i__2 = *neq;
    for (l = 1; l <= i__2; ++l) {
	y[l] = yh[l + yh_dim1];
	ypout[l] = yh[l + (yh_dim1 << 1)] / ddebd1_2.h__;
/* L440: */
    }
    *t = ddebd1_2.x;
    ddebd1_2.told = *t;
    *intout = FALSE_;
L450:
L460:
    return 0;
} /* dlsod_ */

/* DECK DSTOD */
/* Subroutine */ int dstod_(integer *neq, doublereal *y, doublereal *yh, 
	integer *nyh, doublereal *yh1, doublereal *ewt, doublereal *savf, 
	doublereal *acor, doublereal *wm, integer *iwm, S_fp df, U_fp djac, 
	doublereal *rpar, integer *ipar)
{
    /* System generated locals */
    integer yh_dim1, yh_offset, i__1, i__2;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *);

    /* Local variables */
    integer i__, j, m;
    doublereal r__;
    integer i1, jb;
    doublereal rh, del, ddn;
    integer ncf;
    doublereal dsm, dup, dcon, delp, exdn, rhdn, told;
    integer iret;
    doublereal rhsm;
    integer newq;
    doublereal exsm, rhup, exup;
    extern /* Subroutine */ int dcfod_(integer *, doublereal *, doublereal *),
	     dpjac_(integer *, doublereal *, doublereal *, integer *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     S_fp, U_fp, doublereal *, integer *);
    integer iredo;
    extern /* Subroutine */ int dslvs_(doublereal *, integer *, doublereal *, 
	    doublereal *);
    extern doublereal dvnrms_(integer *, doublereal *, doublereal *);

/* ***BEGIN PROLOGUE  DSTOD */
/* ***SUBSIDIARY */
/* ***PURPOSE  Subsidiary to DDEBDF */
/* ***LIBRARY   SLATEC */
/* ***TYPE      DOUBLE PRECISION (STOD-S, DSTOD-D) */
/* ***AUTHOR  Watts, H. A., (SNLA) */
/* ***DESCRIPTION */

/*   DSTOD integrates a system of first order odes over one step in the */
/*   integrator package DDEBDF. */
/* ---------------------------------------------------------------------- */
/* DSTOD  performs one step of the integration of an initial value */
/* problem for a system of ordinary differential equations. */
/* Note.. DSTOD  is independent of the value of the iteration method */
/* indicator MITER, when this is .NE. 0, and hence is independent */
/* of the type of chord method used, or the Jacobian structure. */
/* Communication with DSTOD  is done with the following variables.. */

/* Y      = An array of length .GE. N used as the Y argument in */
/*          all calls to DF and DJAC. */
/* NEQ    = Integer array containing problem size in NEQ(1), and */
/*          passed as the NEQ argument in all calls to DF and DJAC. */
/* YH     = An NYH by LMAX array containing the dependent variables */
/*          and their approximate scaled derivatives, where */
/*          LMAX = MAXORD + 1.  YH(I,J+1) contains the approximate */
/*          J-th derivative of Y(I), scaled by H**J/FACTORIAL(J) */
/*          (J = 0,1,...,NQ).  On entry for the first step, the first */
/*          two columns of YH must be set from the initial values. */
/* NYH    = A constant integer .GE. N, the first dimension of YH. */
/* YH1    = A one-dimensional array occupying the same space as YH. */
/* EWT    = An array of N elements with which the estimated local */
/*          errors in YH are compared. */
/* SAVF   = An array of working storage, of length N. */
/* ACOR   = A work array of length N, used for the accumulated */
/*          corrections.  On a successful return, ACOR(I) contains */
/*          the estimated one-step local error in Y(I). */
/* WM,IWM = DOUBLE PRECISION and INTEGER work arrays associated with */
/*          matrix operations in chord iteration (MITER .NE. 0). */
/* DPJAC   = Name of routine to evaluate and preprocess Jacobian matrix */
/*          if a chord method is being used. */
/* DSLVS   = Name of routine to solve linear system in chord iteration. */
/* H      = The step size to be attempted on the next step. */
/*          H is altered by the error control algorithm during the */
/*          problem.  H can be either positive or negative, but its */
/*          sign must remain constant throughout the problem. */
/* HMIN   = The minimum absolute value of the step size H to be used. */
/* HMXI   = Inverse of the maximum absolute value of H to be used. */
/*          HMXI = 0.0 is allowed and corresponds to an infinite HMAX. */
/*          HMIN and HMXI may be changed at any time, but will not */
/*          take effect until the next change of H is considered. */
/* TN     = The independent variable. TN is updated on each step taken. */
/* JSTART = An integer used for input only, with the following */
/*          values and meanings.. */
/*               0  Perform the first step. */
/*           .GT.0  Take a new step continuing from the last. */
/*              -1  Take the next step with a new value of H, MAXORD, */
/*                    N, METH, MITER, and/or matrix parameters. */
/*              -2  Take the next step with a new value of H, */
/*                    but with other inputs unchanged. */
/*          On return, JSTART is set to 1 to facilitate continuation. */
/* KFLAG  = a completion code with the following meanings.. */
/*               0  The step was successful. */
/*              -1  The requested error could not be achieved. */
/*              -2  Corrector convergence could not be achieved. */
/*          A return with KFLAG = -1 or -2 means either */
/*          ABS(H) = HMIN or 10 consecutive failures occurred. */
/*          On a return with KFLAG negative, the values of TN and */
/*          the YH array are as of the beginning of the last */
/*          step, and H is the last step size attempted. */
/* MAXORD = The maximum order of integration method to be allowed. */
/* METH/MITER = The method flags.  See description in driver. */
/* N      = The number of first-order differential equations. */
/* ---------------------------------------------------------------------- */

/* ***SEE ALSO  DDEBDF */
/* ***ROUTINES CALLED  DCFOD, DPJAC, DSLVS, DVNRMS */
/* ***COMMON BLOCKS    DDEBD1 */
/* ***REVISION HISTORY  (YYMMDD) */
/*   820301  DATE WRITTEN */
/*   890531  Changed all specific intrinsics to generic.  (WRB) */
/*   890911  Removed unnecessary intrinsics.  (WRB) */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900328  Added TYPE section.  (WRB) */
/*   910722  Updated AUTHOR section.  (ALS) */
/*   920422  Changed DIMENSION statement.  (WRB) */
/* ***END PROLOGUE  DSTOD */




/*     BEGIN BLOCK PERMITTING ...EXITS TO 690 */
/*        BEGIN BLOCK PERMITTING ...EXITS TO 60 */
/* ***FIRST EXECUTABLE STATEMENT  DSTOD */
    /* Parameter adjustments */
    --y;
    yh_dim1 = *nyh;
    yh_offset = 1 + yh_dim1;
    yh -= yh_offset;
    --yh1;
    --ewt;
    --savf;
    --acor;
    --wm;
    --iwm;
    --rpar;
    --ipar;

    /* Function Body */
    ddebd1_3.kflag = 0;
    told = ddebd1_3.tn;
    ncf = 0;
    if (ddebd1_3.jstart > 0) {
	goto L160;
    }
    if (ddebd1_3.jstart == -1) {
	goto L10;
    }
    if (ddebd1_3.jstart == -2) {
	goto L90;
    }
/*              --------------------------------------------------------- */
/*               ON THE FIRST CALL, THE ORDER IS SET TO 1, AND OTHER */
/*               VARIABLES ARE INITIALIZED.  RMAX IS THE MAXIMUM RATIO BY */
/*               WHICH H CAN BE INCREASED IN A SINGLE STEP.  IT IS */
/*               INITIALLY 1.E4 TO COMPENSATE FOR THE SMALL INITIAL H, */
/*               BUT THEN IS NORMALLY EQUAL TO 10.  IF A FAILURE OCCURS */
/*               (IN CORRECTOR CONVERGENCE OR ERROR TEST), RMAX IS SET AT */
/*               2 FOR THE NEXT INCREASE. */
/*              --------------------------------------------------------- */
    ddebd1_3.lmax = ddebd1_3.maxord + 1;
    ddebd1_3.nq = 1;
    ddebd1_3.l = 2;
    ddebd1_3.ialth = 2;
    ddebd1_3.rmax = 1e4;
    ddebd1_3.rc = 0.;
    ddebd1_3.el0 = 1.;
    ddebd1_3.crate = .7;
    delp = 0.;
    ddebd1_3.hold = ddebd1_3.h__;
    ddebd1_3.meo = ddebd1_3.meth;
    ddebd1_3.nstepj = 0;
    iret = 3;
    goto L50;
L10:
/*              BEGIN BLOCK PERMITTING ...EXITS TO 30 */
/*                 ------------------------------------------------------ */
/*                  THE FOLLOWING BLOCK HANDLES PRELIMINARIES NEEDED WHEN */
/*                  JSTART = -1.  IPUP IS SET TO MITER TO FORCE A MATRIX */
/*                  UPDATE.  IF AN ORDER INCREASE IS ABOUT TO BE */
/*                  CONSIDERED (IALTH = 1), IALTH IS RESET TO 2 TO */
/*                  POSTPONE CONSIDERATION ONE MORE STEP.  IF THE CALLER */
/*                  HAS CHANGED METH, DCFOD  IS CALLED TO RESET THE */
/*                  COEFFICIENTS OF THE METHOD.  IF THE CALLER HAS */
/*                  CHANGED MAXORD TO A VALUE LESS THAN THE CURRENT */
/*                  ORDER NQ, NQ IS REDUCED TO MAXORD, AND A NEW H CHOSEN */
/*                  ACCORDINGLY.  IF H IS TO BE CHANGED, YH MUST BE */
/*                  RESCALED.  IF H OR METH IS BEING CHANGED, IALTH IS */
/*                  RESET TO L = NQ + 1 TO PREVENT FURTHER CHANGES IN H */
/*                  FOR THAT MANY STEPS. */
/*                 ------------------------------------------------------ */
    ddebd1_3.ipup = ddebd1_3.miter;
    ddebd1_3.lmax = ddebd1_3.maxord + 1;
    if (ddebd1_3.ialth == 1) {
	ddebd1_3.ialth = 2;
    }
    if (ddebd1_3.meth == ddebd1_3.meo) {
	goto L20;
    }
    dcfod_(&ddebd1_3.meth, ddebd1_3.elco, ddebd1_3.tesco);
    ddebd1_3.meo = ddebd1_3.meth;
/*              ......EXIT */
    if (ddebd1_3.nq > ddebd1_3.maxord) {
	goto L30;
    }
    ddebd1_3.ialth = ddebd1_3.l;
    iret = 1;
/*        ............EXIT */
    goto L60;
L20:
    if (ddebd1_3.nq <= ddebd1_3.maxord) {
	goto L90;
    }
L30:
    ddebd1_3.nq = ddebd1_3.maxord;
    ddebd1_3.l = ddebd1_3.lmax;
    i__1 = ddebd1_3.l;
    for (i__ = 1; i__ <= i__1; ++i__) {
	ddebd1_3.el[i__ - 1] = ddebd1_3.elco[i__ + ddebd1_3.nq * 13 - 14];
/* L40: */
    }
    ddebd1_3.nqnyh = ddebd1_3.nq * *nyh;
    ddebd1_3.rc = ddebd1_3.rc * ddebd1_3.el[0] / ddebd1_3.el0;
    ddebd1_3.el0 = ddebd1_3.el[0];
    ddebd1_3.conit = .5 / (ddebd1_3.nq + 2);
    ddn = dvnrms_(&ddebd1_3.n, &savf[1], &ewt[1]) / ddebd1_3.tesco[ddebd1_3.l 
	    * 3 - 3];
    exdn = 1. / ddebd1_3.l;
    rhdn = 1. / (pow_dd(&ddn, &exdn) * 1.3 + 1.3e-6);
    rh = min(rhdn,1.);
    iredo = 3;
    if (ddebd1_3.h__ == ddebd1_3.hold) {
	goto L660;
    }
/* Computing MIN */
    d__2 = rh, d__3 = (d__1 = ddebd1_3.h__ / ddebd1_3.hold, abs(d__1));
    rh = min(d__2,d__3);
    ddebd1_3.h__ = ddebd1_3.hold;
    goto L100;
L50:
/*           ------------------------------------------------------------ */
/*            DCFOD  IS CALLED TO GET ALL THE INTEGRATION COEFFICIENTS */
/*            FOR THE CURRENT METH.  THEN THE EL VECTOR AND RELATED */
/*            CONSTANTS ARE RESET WHENEVER THE ORDER NQ IS CHANGED, OR AT */
/*            THE START OF THE PROBLEM. */
/*           ------------------------------------------------------------ */
    dcfod_(&ddebd1_3.meth, ddebd1_3.elco, ddebd1_3.tesco);
L60:
L70:
/*           BEGIN BLOCK PERMITTING ...EXITS TO 680 */
    i__1 = ddebd1_3.l;
    for (i__ = 1; i__ <= i__1; ++i__) {
	ddebd1_3.el[i__ - 1] = ddebd1_3.elco[i__ + ddebd1_3.nq * 13 - 14];
/* L80: */
    }
    ddebd1_3.nqnyh = ddebd1_3.nq * *nyh;
    ddebd1_3.rc = ddebd1_3.rc * ddebd1_3.el[0] / ddebd1_3.el0;
    ddebd1_3.el0 = ddebd1_3.el[0];
    ddebd1_3.conit = .5 / (ddebd1_3.nq + 2);
    switch (iret) {
	case 1:  goto L90;
	case 2:  goto L660;
	case 3:  goto L160;
    }
/*              --------------------------------------------------------- */
/*               IF H IS BEING CHANGED, THE H RATIO RH IS CHECKED AGAINST */
/*               RMAX, HMIN, AND HMXI, AND THE YH ARRAY RESCALED.  IALTH */
/*               IS SET TO L = NQ + 1 TO PREVENT A CHANGE OF H FOR THAT */
/*               MANY STEPS, UNLESS FORCED BY A CONVERGENCE OR ERROR TEST */
/*               FAILURE. */
/*              --------------------------------------------------------- */
L90:
    if (ddebd1_3.h__ == ddebd1_3.hold) {
	goto L160;
    }
    rh = ddebd1_3.h__ / ddebd1_3.hold;
    ddebd1_3.h__ = ddebd1_3.hold;
    iredo = 3;
L100:
L110:
    rh = min(rh,ddebd1_3.rmax);
/* Computing MAX */
    d__1 = 1., d__2 = abs(ddebd1_3.h__) * ddebd1_3.hmxi * rh;
    rh /= max(d__1,d__2);
    r__ = 1.;
    i__1 = ddebd1_3.l;
    for (j = 2; j <= i__1; ++j) {
	r__ *= rh;
	i__2 = ddebd1_3.n;
	for (i__ = 1; i__ <= i__2; ++i__) {
	    yh[i__ + j * yh_dim1] *= r__;
/* L120: */
	}
/* L130: */
    }
    ddebd1_3.h__ *= rh;
    ddebd1_3.rc *= rh;
    ddebd1_3.ialth = ddebd1_3.l;
    if (iredo != 0) {
	goto L150;
    }
    ddebd1_3.rmax = 10.;
    r__ = 1. / ddebd1_3.tesco[ddebd1_3.nqu * 3 - 2];
    i__1 = ddebd1_3.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	acor[i__] *= r__;
/* L140: */
    }
/*     ...............EXIT */
    goto L690;
L150:
/*                 ------------------------------------------------------ */
/*                  THIS SECTION COMPUTES THE PREDICTED VALUES BY */
/*                  EFFECTIVELY MULTIPLYING THE YH ARRAY BY THE PASCAL */
/*                  TRIANGLE MATRIX.  RC IS THE RATIO OF NEW TO OLD */
/*                  VALUES OF THE COEFFICIENT  H*EL(1).  WHEN RC DIFFERS */
/*                  FROM 1 BY MORE THAN 30 PERCENT, IPUP IS SET TO MITER */
/*                  TO FORCE DPJAC TO BE CALLED, IF A JACOBIAN IS */
/*                  INVOLVED.  IN ANY CASE, DPJAC IS CALLED AT LEAST */
/*                  EVERY 20-TH STEP. */
/*                 ------------------------------------------------------ */
L160:
L170:
/*                    BEGIN BLOCK PERMITTING ...EXITS TO 610 */
/*                       BEGIN BLOCK PERMITTING ...EXITS TO 490 */
    if ((d__1 = ddebd1_3.rc - 1., abs(d__1)) > .3) {
	ddebd1_3.ipup = ddebd1_3.miter;
    }
    if (ddebd1_3.nst >= ddebd1_3.nstepj + 20) {
	ddebd1_3.ipup = ddebd1_3.miter;
    }
    ddebd1_3.tn += ddebd1_3.h__;
    i1 = ddebd1_3.nqnyh + 1;
    i__1 = ddebd1_3.nq;
    for (jb = 1; jb <= i__1; ++jb) {
	i1 -= *nyh;
	i__2 = ddebd1_3.nqnyh;
	for (i__ = i1; i__ <= i__2; ++i__) {
	    yh1[i__] += yh1[i__ + *nyh];
/* L180: */
	}
/* L190: */
    }
    ++ddebd1_3.ksteps;
/*                          --------------------------------------------- */
/*                           UP TO 3 CORRECTOR ITERATIONS ARE TAKEN.  A */
/*                           CONVERGENCE TEST IS MADE ON THE R.M.S. NORM */
/*                           OF EACH CORRECTION, WEIGHTED BY THE ERROR */
/*                           WEIGHT VECTOR EWT.  THE SUM OF THE */
/*                           CORRECTIONS IS ACCUMULATED IN THE VECTOR */
/*                           ACOR(I).  THE YH ARRAY IS NOT ALTERED IN THE */
/*                           CORRECTOR LOOP. */
/*                          --------------------------------------------- */
L200:
    m = 0;
    i__1 = ddebd1_3.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	y[i__] = yh[i__ + yh_dim1];
/* L210: */
    }
    (*df)(&ddebd1_3.tn, &y[1], &savf[1], &rpar[1], &ipar[1]);
    ++ddebd1_3.nfe;
    if (ddebd1_3.ipup <= 0) {
	goto L220;
    }
/*                                --------------------------------------- */
/*                                 IF INDICATED, THE MATRIX P = I - */
/*                                 H*EL(1)*J IS REEVALUATED AND */
/*                                 PREPROCESSED BEFORE STARTING THE */
/*                                 CORRECTOR ITERATION.  IPUP IS SET TO 0 */
/*                                 AS AN INDICATOR THAT THIS HAS BEEN */
/*                                 DONE. */
/*                                --------------------------------------- */
    ddebd1_3.ipup = 0;
    ddebd1_3.rc = 1.;
    ddebd1_3.nstepj = ddebd1_3.nst;
    ddebd1_3.crate = .7;
    dpjac_(neq, &y[1], &yh[yh_offset], nyh, &ewt[1], &acor[1], &savf[1], &wm[
	    1], &iwm[1], (S_fp)df, (U_fp)djac, &rpar[1], &ipar[1]);
/*                          ......EXIT */
    if (ddebd1_3.ier != 0) {
	goto L440;
    }
L220:
    i__1 = ddebd1_3.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	acor[i__] = 0.;
/* L230: */
    }
L240:
    if (ddebd1_3.miter != 0) {
	goto L270;
    }
/*                                   ------------------------------------ */
/*                                    IN THE CASE OF FUNCTIONAL */
/*                                    ITERATION, UPDATE Y DIRECTLY FROM */
/*                                    THE RESULT OF THE LAST FUNCTION */
/*                                    EVALUATION. */
/*                                   ------------------------------------ */
    i__1 = ddebd1_3.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	savf[i__] = ddebd1_3.h__ * savf[i__] - yh[i__ + (yh_dim1 << 1)];
	y[i__] = savf[i__] - acor[i__];
/* L250: */
    }
    del = dvnrms_(&ddebd1_3.n, &y[1], &ewt[1]);
    i__1 = ddebd1_3.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	y[i__] = yh[i__ + yh_dim1] + ddebd1_3.el[0] * savf[i__];
	acor[i__] = savf[i__];
/* L260: */
    }
    goto L300;
L270:
/*                                   ------------------------------------ */
/*                                    IN THE CASE OF THE CHORD METHOD, */
/*                                    COMPUTE THE CORRECTOR ERROR, AND */
/*                                    SOLVE THE LINEAR SYSTEM WITH THAT */
/*                                    AS RIGHT-HAND SIDE AND P AS */
/*                                    COEFFICIENT MATRIX. */
/*                                   ------------------------------------ */
    i__1 = ddebd1_3.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	y[i__] = ddebd1_3.h__ * savf[i__] - (yh[i__ + (yh_dim1 << 1)] + acor[
		i__]);
/* L280: */
    }
    dslvs_(&wm[1], &iwm[1], &y[1], &savf[1]);
/*                             ......EXIT */
    if (ddebd1_3.ier != 0) {
	goto L430;
    }
    del = dvnrms_(&ddebd1_3.n, &y[1], &ewt[1]);
    i__1 = ddebd1_3.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	acor[i__] += y[i__];
	y[i__] = yh[i__ + yh_dim1] + ddebd1_3.el[0] * acor[i__];
/* L290: */
    }
L300:
/*                                --------------------------------------- */
/*                                 TEST FOR CONVERGENCE.  IF M.GT.0, AN */
/*                                 ESTIMATE OF THE CONVERGENCE RATE */
/*                                 CONSTANT IS STORED IN CRATE, AND THIS */
/*                                 IS USED IN THE TEST. */
/*                                --------------------------------------- */
    if (m != 0) {
/* Computing MAX */
	d__1 = ddebd1_3.crate * .2, d__2 = del / delp;
	ddebd1_3.crate = max(d__1,d__2);
    }
/* Computing MIN */
    d__1 = 1., d__2 = ddebd1_3.crate * 1.5;
    dcon = del * min(d__1,d__2) / (ddebd1_3.tesco[ddebd1_3.nq * 3 - 2] * 
	    ddebd1_3.conit);
    if (dcon > 1.) {
	goto L420;
    }
/*                                   ------------------------------------ */
/*                                    THE CORRECTOR HAS CONVERGED.  IPUP */
/*                                    IS SET TO -1 IF MITER .NE. 0, TO */
/*                                    SIGNAL THAT THE JACOBIAN INVOLVED */
/*                                    MAY NEED UPDATING LATER.  THE LOCAL */
/*                                    ERROR TEST IS MADE AND CONTROL */
/*                                    PASSES TO STATEMENT 500 IF IT */
/*                                    FAILS. */
/*                                   ------------------------------------ */
    if (ddebd1_3.miter != 0) {
	ddebd1_3.ipup = -1;
    }
    if (m == 0) {
	dsm = del / ddebd1_3.tesco[ddebd1_3.nq * 3 - 2];
    }
    if (m > 0) {
	dsm = dvnrms_(&ddebd1_3.n, &acor[1], &ewt[1]) / ddebd1_3.tesco[
		ddebd1_3.nq * 3 - 2];
    }
    if (dsm > 1.) {
	goto L380;
    }
/*                                      BEGIN BLOCK */
/*                                      PERMITTING ...EXITS TO 360 */
/*                                         ------------------------------ */
/*                                          AFTER A SUCCESSFUL STEP, */
/*                                          UPDATE THE YH ARRAY. */
/*                                          CONSIDER CHANGING H IF IALTH */
/*                                          = 1.  OTHERWISE DECREASE */
/*                                          IALTH BY 1.  IF IALTH IS THEN */
/*                                          1 AND NQ .LT. MAXORD, THEN */
/*                                          ACOR IS SAVED FOR USE IN A */
/*                                          POSSIBLE ORDER INCREASE ON */
/*                                          THE NEXT STEP.  IF A CHANGE */
/*                                          IN H IS CONSIDERED, AN */
/*                                          INCREASE OR DECREASE IN ORDER */
/*                                          BY ONE IS CONSIDERED ALSO.  A */
/*                                          CHANGE IN H IS MADE ONLY IF */
/*                                          IT IS BY A FACTOR OF AT LEAST */
/*                                          1.1.  IF NOT, IALTH IS SET TO */
/*                                          3 TO PREVENT TESTING FOR THAT */
/*                                          MANY STEPS. */
/*                                         ------------------------------ */
    ddebd1_3.kflag = 0;
    iredo = 0;
    ++ddebd1_3.nst;
    ddebd1_3.hu = ddebd1_3.h__;
    ddebd1_3.nqu = ddebd1_3.nq;
    i__1 = ddebd1_3.l;
    for (j = 1; j <= i__1; ++j) {
	i__2 = ddebd1_3.n;
	for (i__ = 1; i__ <= i__2; ++i__) {
	    yh[i__ + j * yh_dim1] += ddebd1_3.el[j - 1] * acor[i__];
/* L310: */
	}
/* L320: */
    }
    --ddebd1_3.ialth;
    if (ddebd1_3.ialth != 0) {
	goto L340;
    }
/*                                            --------------------------- */
/*                                             REGARDLESS OF THE SUCCESS */
/*                                             OR FAILURE OF THE STEP, */
/*                                             FACTORS RHDN, RHSM, AND */
/*                                             RHUP ARE COMPUTED, BY */
/*                                             WHICH H COULD BE */
/*                                             MULTIPLIED AT ORDER NQ - */
/*                                             1, ORDER NQ, OR ORDER NQ + */
/*                                             1, RESPECTIVELY.  IN THE */
/*                                             CASE OF FAILURE, RHUP = */
/*                                             0.0 TO AVOID AN ORDER */
/*                                             INCREASE.  THE LARGEST OF */
/*                                             THESE IS DETERMINED AND */
/*                                             THE NEW ORDER CHOSEN */
/*                                             ACCORDINGLY.  IF THE ORDER */
/*                                             IS TO BE INCREASED, WE */
/*                                             COMPUTE ONE ADDITIONAL */
/*                                             SCALED DERIVATIVE. */
/*                                            --------------------------- */
    rhup = 0.;
/*                       .....................EXIT */
    if (ddebd1_3.l == ddebd1_3.lmax) {
	goto L490;
    }
    i__1 = ddebd1_3.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	savf[i__] = acor[i__] - yh[i__ + ddebd1_3.lmax * yh_dim1];
/* L330: */
    }
    dup = dvnrms_(&ddebd1_3.n, &savf[1], &ewt[1]) / ddebd1_3.tesco[
	    ddebd1_3.nq * 3 - 1];
    exup = 1. / (ddebd1_3.l + 1);
    rhup = 1. / (pow_dd(&dup, &exup) * 1.4 + 1.4e-6);
/*                       .....................EXIT */
    goto L490;
L340:
/*                                      ...EXIT */
    if (ddebd1_3.ialth > 1) {
	goto L360;
    }
/*                                      ...EXIT */
    if (ddebd1_3.l == ddebd1_3.lmax) {
	goto L360;
    }
    i__1 = ddebd1_3.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	yh[i__ + ddebd1_3.lmax * yh_dim1] = acor[i__];
/* L350: */
    }
L360:
    r__ = 1. / ddebd1_3.tesco[ddebd1_3.nqu * 3 - 2];
    i__1 = ddebd1_3.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	acor[i__] *= r__;
/* L370: */
    }
/*     .................................EXIT */
    goto L690;
L380:
/*                                   ------------------------------------ */
/*                                    THE ERROR TEST FAILED.  KFLAG KEEPS */
/*                                    TRACK OF MULTIPLE FAILURES. */
/*                                    RESTORE TN AND THE YH ARRAY TO */
/*                                    THEIR PREVIOUS VALUES, AND PREPARE */
/*                                    TO TRY THE STEP AGAIN.  COMPUTE THE */
/*                                    OPTIMUM STEP SIZE FOR THIS OR ONE */
/*                                    LOWER ORDER.  AFTER 2 OR MORE */
/*                                    FAILURES, H IS FORCED TO DECREASE */
/*                                    BY A FACTOR OF 0.2 OR LESS. */
/*                                   ------------------------------------ */
    --ddebd1_3.kflag;
    ddebd1_3.tn = told;
    i1 = ddebd1_3.nqnyh + 1;
    i__1 = ddebd1_3.nq;
    for (jb = 1; jb <= i__1; ++jb) {
	i1 -= *nyh;
	i__2 = ddebd1_3.nqnyh;
	for (i__ = i1; i__ <= i__2; ++i__) {
	    yh1[i__] -= yh1[i__ + *nyh];
/* L390: */
	}
/* L400: */
    }
    ddebd1_3.rmax = 2.;
    if (abs(ddebd1_3.h__) > ddebd1_3.hmin * 1.00001) {
	goto L410;
    }
/*                                      --------------------------------- */
/*                                       ALL RETURNS ARE MADE THROUGH */
/*                                       THIS SECTION.  H IS SAVED IN */
/*                                       HOLD TO ALLOW THE CALLER TO */
/*                                       CHANGE H ON THE NEXT STEP. */
/*                                      --------------------------------- */
    ddebd1_3.kflag = -1;
/*     .................................EXIT */
    goto L690;
L410:
/*                    ...............EXIT */
    if (ddebd1_3.kflag <= -3) {
	goto L610;
    }
    iredo = 2;
    rhup = 0.;
/*                       ............EXIT */
    goto L490;
L420:
    ++m;
/*                             ...EXIT */
    if (m == 3) {
	goto L430;
    }
/*                             ...EXIT */
    if (m >= 2 && del > delp * 2.) {
	goto L430;
    }
    delp = del;
    (*df)(&ddebd1_3.tn, &y[1], &savf[1], &rpar[1], &ipar[1]);
    ++ddebd1_3.nfe;
    goto L240;
L430:
/*                             ------------------------------------------ */
/*                              THE CORRECTOR ITERATION FAILED TO */
/*                              CONVERGE IN 3 TRIES.  IF MITER .NE. 0 AND */
/*                              THE JACOBIAN IS OUT OF DATE, DPJAC IS */
/*                              CALLED FOR THE NEXT TRY.  OTHERWISE THE */
/*                              YH ARRAY IS RETRACTED TO ITS VALUES */
/*                              BEFORE PREDICTION, AND H IS REDUCED, IF */
/*                              POSSIBLE.  IF H CANNOT BE REDUCED OR 10 */
/*                              FAILURES HAVE OCCURRED, EXIT WITH KFLAG = */
/*                              -2. */
/*                             ------------------------------------------ */
/*                          ...EXIT */
    if (ddebd1_3.ipup == 0) {
	goto L440;
    }
    ddebd1_3.ipup = ddebd1_3.miter;
    goto L200;
L440:
    ddebd1_3.tn = told;
    ++ncf;
    ddebd1_3.rmax = 2.;
    i1 = ddebd1_3.nqnyh + 1;
    i__1 = ddebd1_3.nq;
    for (jb = 1; jb <= i__1; ++jb) {
	i1 -= *nyh;
	i__2 = ddebd1_3.nqnyh;
	for (i__ = i1; i__ <= i__2; ++i__) {
	    yh1[i__] -= yh1[i__ + *nyh];
/* L450: */
	}
/* L460: */
    }
    if (abs(ddebd1_3.h__) > ddebd1_3.hmin * 1.00001) {
	goto L470;
    }
    ddebd1_3.kflag = -2;
/*     ........................EXIT */
    goto L690;
L470:
    if (ncf != 10) {
	goto L480;
    }
    ddebd1_3.kflag = -2;
/*     ........................EXIT */
    goto L690;
L480:
    rh = .25;
    ddebd1_3.ipup = ddebd1_3.miter;
    iredo = 1;
/*                 .........EXIT */
    goto L650;
L490:
    exsm = 1. / ddebd1_3.l;
    rhsm = 1. / (pow_dd(&dsm, &exsm) * 1.2 + 1.2e-6);
    rhdn = 0.;
    if (ddebd1_3.nq == 1) {
	goto L500;
    }
    ddn = dvnrms_(&ddebd1_3.n, &yh[ddebd1_3.l * yh_dim1 + 1], &ewt[1]) / 
	    ddebd1_3.tesco[ddebd1_3.nq * 3 - 3];
    exdn = 1. / ddebd1_3.nq;
    rhdn = 1. / (pow_dd(&ddn, &exdn) * 1.3 + 1.3e-6);
L500:
    if (rhsm >= rhup) {
	goto L550;
    }
    if (rhup <= rhdn) {
	goto L540;
    }
    newq = ddebd1_3.l;
    rh = rhup;
    if (rh >= 1.1) {
	goto L520;
    }
    ddebd1_3.ialth = 3;
    r__ = 1. / ddebd1_3.tesco[ddebd1_3.nqu * 3 - 2];
    i__1 = ddebd1_3.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	acor[i__] *= r__;
/* L510: */
    }
/*     ...........................EXIT */
    goto L690;
L520:
    r__ = ddebd1_3.el[ddebd1_3.l - 1] / ddebd1_3.l;
    i__1 = ddebd1_3.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	yh[i__ + (newq + 1) * yh_dim1] = acor[i__] * r__;
/* L530: */
    }
    ddebd1_3.nq = newq;
    ddebd1_3.l = ddebd1_3.nq + 1;
    iret = 2;
/*           ..................EXIT */
    goto L680;
L540:
    goto L580;
L550:
    if (rhsm < rhdn) {
	goto L580;
    }
    newq = ddebd1_3.nq;
    rh = rhsm;
    if (ddebd1_3.kflag == 0 && rh < 1.1) {
	goto L560;
    }
    if (ddebd1_3.kflag <= -2) {
	rh = min(rh,.2);
    }
/*                             ------------------------------------------ */
/*                              IF THERE IS A CHANGE OF ORDER, RESET NQ, */
/*                              L, AND THE COEFFICIENTS.  IN ANY CASE H */
/*                              IS RESET ACCORDING TO RH AND THE YH ARRAY */
/*                              IS RESCALED.  THEN EXIT FROM 680 IF THE */
/*                              STEP WAS OK, OR REDO THE STEP OTHERWISE. */
/*                             ------------------------------------------ */
/*                 ............EXIT */
    if (newq == ddebd1_3.nq) {
	goto L650;
    }
    ddebd1_3.nq = newq;
    ddebd1_3.l = ddebd1_3.nq + 1;
    iret = 2;
/*           ..................EXIT */
    goto L680;
L560:
    ddebd1_3.ialth = 3;
    r__ = 1. / ddebd1_3.tesco[ddebd1_3.nqu * 3 - 2];
    i__1 = ddebd1_3.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	acor[i__] *= r__;
/* L570: */
    }
/*     .....................EXIT */
    goto L690;
L580:
    newq = ddebd1_3.nq - 1;
    rh = rhdn;
    if (ddebd1_3.kflag < 0 && rh > 1.) {
	rh = 1.;
    }
    if (ddebd1_3.kflag == 0 && rh < 1.1) {
	goto L590;
    }
    if (ddebd1_3.kflag <= -2) {
	rh = min(rh,.2);
    }
/*                          --------------------------------------------- */
/*                           IF THERE IS A CHANGE OF ORDER, RESET NQ, L, */
/*                           AND THE COEFFICIENTS.  IN ANY CASE H IS */
/*                           RESET ACCORDING TO RH AND THE YH ARRAY IS */
/*                           RESCALED.  THEN EXIT FROM 680 IF THE STEP */
/*                           WAS OK, OR REDO THE STEP OTHERWISE. */
/*                          --------------------------------------------- */
/*                 .........EXIT */
    if (newq == ddebd1_3.nq) {
	goto L650;
    }
    ddebd1_3.nq = newq;
    ddebd1_3.l = ddebd1_3.nq + 1;
    iret = 2;
/*           ...............EXIT */
    goto L680;
L590:
    ddebd1_3.ialth = 3;
    r__ = 1. / ddebd1_3.tesco[ddebd1_3.nqu * 3 - 2];
    i__1 = ddebd1_3.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	acor[i__] *= r__;
/* L600: */
    }
/*     ..................EXIT */
    goto L690;
L610:
/*                    --------------------------------------------------- */
/*                     CONTROL REACHES THIS SECTION IF 3 OR MORE FAILURES */
/*                     HAVE OCCURRED.  IF 10 FAILURES HAVE OCCURRED, EXIT */
/*                     WITH KFLAG = -1.  IT IS ASSUMED THAT THE */
/*                     DERIVATIVES THAT HAVE ACCUMULATED IN THE YH ARRAY */
/*                     HAVE ERRORS OF THE WRONG ORDER.  HENCE THE FIRST */
/*                     DERIVATIVE IS RECOMPUTED, AND THE ORDER IS SET TO */
/*                     1.  THEN H IS REDUCED BY A FACTOR OF 10, AND THE */
/*                     STEP IS RETRIED, UNTIL IT SUCCEEDS OR H REACHES */
/*                     HMIN. */
/*                    --------------------------------------------------- */
    if (ddebd1_3.kflag != -10) {
	goto L620;
    }
/*                       ------------------------------------------------ */
/*                        ALL RETURNS ARE MADE THROUGH THIS SECTION.  H */
/*                        IS SAVED IN HOLD TO ALLOW THE CALLER TO CHANGE */
/*                        H ON THE NEXT STEP. */
/*                       ------------------------------------------------ */
    ddebd1_3.kflag = -1;
/*     ..................EXIT */
    goto L690;
L620:
    rh = .1;
/* Computing MAX */
    d__1 = ddebd1_3.hmin / abs(ddebd1_3.h__);
    rh = max(d__1,rh);
    ddebd1_3.h__ *= rh;
    i__1 = ddebd1_3.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	y[i__] = yh[i__ + yh_dim1];
/* L630: */
    }
    (*df)(&ddebd1_3.tn, &y[1], &savf[1], &rpar[1], &ipar[1]);
    ++ddebd1_3.nfe;
    i__1 = ddebd1_3.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	yh[i__ + (yh_dim1 << 1)] = ddebd1_3.h__ * savf[i__];
/* L640: */
    }
    ddebd1_3.ipup = ddebd1_3.miter;
    ddebd1_3.ialth = 5;
/*              ......EXIT */
    if (ddebd1_3.nq != 1) {
	goto L670;
    }
    goto L170;
L650:
L660:
/* Computing MAX */
    d__1 = rh, d__2 = ddebd1_3.hmin / abs(ddebd1_3.h__);
    rh = max(d__1,d__2);
    goto L110;
L670:
    ddebd1_3.nq = 1;
    ddebd1_3.l = 2;
    iret = 3;
L680:
    goto L70;
L690:
    ddebd1_3.hold = ddebd1_3.h__;
    ddebd1_3.jstart = 1;
    return 0;
/*     ----------------------- END OF SUBROUTINE DSTOD */
/*     ----------------------- */
} /* dstod_ */

/* DECK DCFOD */
/* Subroutine */ int dcfod_(integer *meth, doublereal *elco, doublereal *
	tesco)
{
    /* System generated locals */
    integer i__1;

    /* Local variables */
    integer i__, ib;
    doublereal pc[12];
    integer nq;
    doublereal fnq;
    integer nqm1, nqp1;
    doublereal ragq, pint, xpin, fnqm1, agamq, rqfac, tsign, rq1fac;

/* ***BEGIN PROLOGUE  DCFOD */
/* ***SUBSIDIARY */
/* ***PURPOSE  Subsidiary to DDEBDF */
/* ***LIBRARY   SLATEC */
/* ***TYPE      DOUBLE PRECISION (CFOD-S, DCFOD-D) */
/* ***AUTHOR  (UNKNOWN) */
/* ***DESCRIPTION */

/*   DCFOD defines coefficients needed in the integrator package DDEBDF */

/* ***SEE ALSO  DDEBDF */
/* ***ROUTINES CALLED  (NONE) */
/* ***REVISION HISTORY  (YYMMDD) */
/*   820301  DATE WRITTEN */
/*   890911  Removed unnecessary intrinsics.  (WRB) */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900328  Added TYPE section.  (WRB) */
/* ***END PROLOGUE  DCFOD */


/*     ------------------------------------------------------------------ */
/*      DCFOD  IS CALLED BY THE INTEGRATOR ROUTINE TO SET COEFFICIENTS */
/*      NEEDED THERE.  THE COEFFICIENTS FOR THE CURRENT METHOD, AS */
/*      GIVEN BY THE VALUE OF METH, ARE SET FOR ALL ORDERS AND SAVED. */
/*      THE MAXIMUM ORDER ASSUMED HERE IS 12 IF METH = 1 AND 5 IF METH = */
/*      2.  (A SMALLER VALUE OF THE MAXIMUM ORDER IS ALSO ALLOWED.) */
/*      DCFOD  IS CALLED ONCE AT THE BEGINNING OF THE PROBLEM, */
/*      AND IS NOT CALLED AGAIN UNLESS AND UNTIL METH IS CHANGED. */

/*      THE ELCO ARRAY CONTAINS THE BASIC METHOD COEFFICIENTS. */
/*      THE COEFFICIENTS EL(I), 1 .LE. I .LE. NQ+1, FOR THE METHOD OF */
/*      ORDER NQ ARE STORED IN ELCO(I,NQ).  THEY ARE GIVEN BY A */
/*      GENERATING POLYNOMIAL, I.E., */
/*          L(X) = EL(1) + EL(2)*X + ... + EL(NQ+1)*X**NQ. */
/*      FOR THE IMPLICIT ADAMS METHODS, L(X) IS GIVEN BY */
/*          DL/DX = (X+1)*(X+2)*...*(X+NQ-1)/FACTORIAL(NQ-1),    L(-1) = */
/*      0.  FOR THE BDF METHODS, L(X) IS GIVEN BY */
/*          L(X) = (X+1)*(X+2)* ... *(X+NQ)/K, */
/*      WHERE         K = FACTORIAL(NQ)*(1 + 1/2 + ... + 1/NQ). */

/*      THE TESCO ARRAY CONTAINS TEST CONSTANTS USED FOR THE */
/*      LOCAL ERROR TEST AND THE SELECTION OF STEP SIZE AND/OR ORDER. */
/*      AT ORDER NQ, TESCO(K,NQ) IS USED FOR THE SELECTION OF STEP */
/*      SIZE AT ORDER NQ - 1 IF K = 1, AT ORDER NQ IF K = 2, AND AT ORDER */
/*      NQ + 1 IF K = 3. */
/*     ------------------------------------------------------------------ */

/* ***FIRST EXECUTABLE STATEMENT  DCFOD */
    /* Parameter adjustments */
    tesco -= 4;
    elco -= 14;

    /* Function Body */
    switch (*meth) {
	case 1:  goto L10;
	case 2:  goto L60;
    }

L10:
    elco[14] = 1.;
    elco[15] = 1.;
    tesco[4] = 0.;
    tesco[5] = 2.;
    tesco[7] = 1.;
    tesco[39] = 0.;
    pc[0] = 1.;
    rqfac = 1.;
    for (nq = 2; nq <= 12; ++nq) {
/*           ------------------------------------------------------------ */
/*            THE PC ARRAY WILL CONTAIN THE COEFFICIENTS OF THE */
/*                POLYNOMIAL P(X) = (X+1)*(X+2)*...*(X+NQ-1). */
/*            INITIALLY, P(X) = 1. */
/*           ------------------------------------------------------------ */
	rq1fac = rqfac;
	rqfac /= nq;
	nqm1 = nq - 1;
	fnqm1 = (doublereal) nqm1;
	nqp1 = nq + 1;
/*           FORM COEFFICIENTS OF P(X)*(X+NQ-1). */
/*           ---------------------------------- */
	pc[nq - 1] = 0.;
	i__1 = nqm1;
	for (ib = 1; ib <= i__1; ++ib) {
	    i__ = nqp1 - ib;
	    pc[i__ - 1] = pc[i__ - 2] + fnqm1 * pc[i__ - 1];
/* L20: */
	}
	pc[0] = fnqm1 * pc[0];
/*           COMPUTE INTEGRAL, -1 TO 0, OF P(X) AND X*P(X). */
/*           ----------------------- */
	pint = pc[0];
	xpin = pc[0] / 2.;
	tsign = 1.;
	i__1 = nq;
	for (i__ = 2; i__ <= i__1; ++i__) {
	    tsign = -tsign;
	    pint += tsign * pc[i__ - 1] / i__;
	    xpin += tsign * pc[i__ - 1] / (i__ + 1);
/* L30: */
	}
/*           STORE COEFFICIENTS IN ELCO AND TESCO. */
/*           -------------------------------- */
	elco[nq * 13 + 1] = pint * rq1fac;
	elco[nq * 13 + 2] = 1.;
	i__1 = nq;
	for (i__ = 2; i__ <= i__1; ++i__) {
	    elco[i__ + 1 + nq * 13] = rq1fac * pc[i__ - 1] / i__;
/* L40: */
	}
	agamq = rqfac * xpin;
	ragq = 1. / agamq;
	tesco[nq * 3 + 2] = ragq;
	if (nq < 12) {
	    tesco[nqp1 * 3 + 1] = ragq * rqfac / nqp1;
	}
	tesco[nqm1 * 3 + 3] = ragq;
/* L50: */
    }
    goto L100;

L60:
    pc[0] = 1.;
    rq1fac = 1.;
    for (nq = 1; nq <= 5; ++nq) {
/*           ------------------------------------------------------------ */
/*            THE PC ARRAY WILL CONTAIN THE COEFFICIENTS OF THE */
/*                POLYNOMIAL P(X) = (X+1)*(X+2)*...*(X+NQ). */
/*            INITIALLY, P(X) = 1. */
/*           ------------------------------------------------------------ */
	fnq = (doublereal) nq;
	nqp1 = nq + 1;
/*           FORM COEFFICIENTS OF P(X)*(X+NQ). */
/*           ------------------------------------ */
	pc[nqp1 - 1] = 0.;
	i__1 = nq;
	for (ib = 1; ib <= i__1; ++ib) {
	    i__ = nq + 2 - ib;
	    pc[i__ - 1] = pc[i__ - 2] + fnq * pc[i__ - 1];
/* L70: */
	}
	pc[0] = fnq * pc[0];
/*           STORE COEFFICIENTS IN ELCO AND TESCO. */
/*           -------------------------------- */
	i__1 = nqp1;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    elco[i__ + nq * 13] = pc[i__ - 1] / pc[1];
/* L80: */
	}
	elco[nq * 13 + 2] = 1.;
	tesco[nq * 3 + 1] = rq1fac;
	tesco[nq * 3 + 2] = nqp1 / elco[nq * 13 + 1];
	tesco[nq * 3 + 3] = (nq + 2) / elco[nq * 13 + 1];
	rq1fac /= fnq;
/* L90: */
    }
L100:
    return 0;
/*     ----------------------- END OF SUBROUTINE DCFOD */
/*     ----------------------- */
} /* dcfod_ */

/* DECK DVNRMS */
doublereal dvnrms_(integer *n, doublereal *v, doublereal *w)
{
    /* System generated locals */
    integer i__1;
    doublereal ret_val, d__1;

    /* Builtin functions */
    double sqrt(doublereal);

    /* Local variables */
    integer i__;
    doublereal sum;

/* ***BEGIN PROLOGUE  DVNRMS */
/* ***SUBSIDIARY */
/* ***PURPOSE  Subsidiary to DDEBDF */
/* ***LIBRARY   SLATEC */
/* ***TYPE      DOUBLE PRECISION (VNWRMS-S, DVNRMS-D) */
/* ***AUTHOR  (UNKNOWN) */
/* ***DESCRIPTION */

/*   DVNRMS computes a weighted root-mean-square vector norm for the */
/*   integrator package DDEBDF. */

/* ***SEE ALSO  DDEBDF */
/* ***ROUTINES CALLED  (NONE) */
/* ***REVISION HISTORY  (YYMMDD) */
/*   820301  DATE WRITTEN */
/*   890531  Changed all specific intrinsics to generic.  (WRB) */
/*   890831  Modified array declarations.  (WRB) */
/*   890911  Removed unnecessary intrinsics.  (WRB) */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900328  Added TYPE section.  (WRB) */
/* ***END PROLOGUE  DVNRMS */
/* ***FIRST EXECUTABLE STATEMENT  DVNRMS */
    /* Parameter adjustments */
    --w;
    --v;

    /* Function Body */
    sum = 0.;
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
/* Computing 2nd power */
	d__1 = v[i__] / w[i__];
	sum += d__1 * d__1;
/* L10: */
    }
    ret_val = sqrt(sum / *n);
    return ret_val;
/*     ----------------------- END OF FUNCTION DVNRMS */
/*     ------------------------ */
} /* dvnrms_ */

/* DECK DINTYD */
/* Subroutine */ int dintyd_(doublereal *t, integer *k, doublereal *yh, 
	integer *nyh, doublereal *dky, integer *iflag)
{
    /* System generated locals */
    integer yh_dim1, yh_offset, i__1, i__2;

    /* Builtin functions */
    double pow_di(doublereal *, integer *);

    /* Local variables */
    doublereal c__;
    integer i__, j;
    doublereal r__, s;
    integer ic, jb, jj;
    doublereal tp;
    integer jb2, jj1, jp1;

/* ***BEGIN PROLOGUE  DINTYD */
/* ***SUBSIDIARY */
/* ***PURPOSE  Subsidiary to DDEBDF */
/* ***LIBRARY   SLATEC */
/* ***TYPE      DOUBLE PRECISION (INTYD-S, DINTYD-D) */
/* ***AUTHOR  Watts, H. A., (SNLA) */
/* ***DESCRIPTION */

/*   DINTYD approximates the solution and derivatives at T by polynomial */
/*   interpolation. Must be used in conjunction with the integrator */
/*   package DDEBDF. */
/* ---------------------------------------------------------------------- */
/* DINTYD computes interpolated values of the K-th derivative of the */
/* dependent variable vector Y, and stores it in DKY. */
/* This routine is called by DDEBDF with K = 0,1 and T = TOUT, but may */
/* also be called by the user for any K up to the current order. */
/* (see detailed instructions in LSODE usage documentation.) */
/* ---------------------------------------------------------------------- */
/* The computed values in DKY are gotten by interpolation using the */
/* Nordsieck history array YH.  This array corresponds uniquely to a */
/* vector-valued polynomial of degree NQCUR or less, and DKY is set */
/* to the K-th derivative of this polynomial at T. */
/* The formula for DKY is.. */
/*              Q */
/*  DKY(I)  =  Sum  C(J,K) * (T - TN)**(J-K) * H**(-J) * YH(I,J+1) */
/*             J=K */
/* where  C(J,K) = J*(J-1)*...*(J-K+1), Q = NQCUR, TN = TCUR, H = HCUR. */
/* The quantities  NQ = NQCUR, L = NQ+1, N = NEQ, TN, and H are */
/* communicated by common.  The above sum is done in reverse order. */
/* IFLAG is returned negative if either K or T is out of bounds. */
/* ---------------------------------------------------------------------- */

/* ***SEE ALSO  DDEBDF */
/* ***ROUTINES CALLED  (NONE) */
/* ***COMMON BLOCKS    DDEBD1 */
/* ***REVISION HISTORY  (YYMMDD) */
/*   820301  DATE WRITTEN */
/*   890911  Removed unnecessary intrinsics.  (WRB) */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900328  Added TYPE section.  (WRB) */
/*   910722  Updated AUTHOR section.  (ALS) */
/* ***END PROLOGUE  DINTYD */


/*     BEGIN BLOCK PERMITTING ...EXITS TO 130 */
/* ***FIRST EXECUTABLE STATEMENT  DINTYD */
    /* Parameter adjustments */
    yh_dim1 = *nyh;
    yh_offset = 1 + yh_dim1;
    yh -= yh_offset;
    --dky;

    /* Function Body */
    *iflag = 0;
    if (*k < 0 || *k > ddebd1_4.nq) {
	goto L110;
    }
    tp = ddebd1_4.tn - ddebd1_4.hu * (ddebd1_4.uround * 100. + 1.);
    if ((*t - tp) * (*t - ddebd1_4.tn) <= 0.) {
	goto L10;
    }
    *iflag = -2;
/*     .........EXIT */
    goto L130;
L10:

    s = (*t - ddebd1_4.tn) / ddebd1_4.h__;
    ic = 1;
    if (*k == 0) {
	goto L30;
    }
    jj1 = ddebd1_4.l - *k;
    i__1 = ddebd1_4.nq;
    for (jj = jj1; jj <= i__1; ++jj) {
	ic *= jj;
/* L20: */
    }
L30:
    c__ = (doublereal) ic;
    i__1 = ddebd1_4.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	dky[i__] = c__ * yh[i__ + ddebd1_4.l * yh_dim1];
/* L40: */
    }
    if (*k == ddebd1_4.nq) {
	goto L90;
    }
    jb2 = ddebd1_4.nq - *k;
    i__1 = jb2;
    for (jb = 1; jb <= i__1; ++jb) {
	j = ddebd1_4.nq - jb;
	jp1 = j + 1;
	ic = 1;
	if (*k == 0) {
	    goto L60;
	}
	jj1 = jp1 - *k;
	i__2 = j;
	for (jj = jj1; jj <= i__2; ++jj) {
	    ic *= jj;
/* L50: */
	}
L60:
	c__ = (doublereal) ic;
	i__2 = ddebd1_4.n;
	for (i__ = 1; i__ <= i__2; ++i__) {
	    dky[i__] = c__ * yh[i__ + jp1 * yh_dim1] + s * dky[i__];
/* L70: */
	}
/* L80: */
    }
/*     .........EXIT */
    if (*k == 0) {
	goto L130;
    }
L90:
    i__1 = -(*k);
    r__ = pow_di(&ddebd1_4.h__, &i__1);
    i__1 = ddebd1_4.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	dky[i__] = r__ * dky[i__];
/* L100: */
    }
    goto L120;
L110:

    *iflag = -1;
L120:
L130:
    return 0;
/*     ----------------------- END OF SUBROUTINE DINTYD */
/*     ----------------------- */
} /* dintyd_ */

/* DECK DPJAC */
/* Subroutine */ int dpjac_(integer *neq, doublereal *y, doublereal *yh, 
	integer *nyh, doublereal *ewt, doublereal *ftem, doublereal *savf, 
	doublereal *wm, integer *iwm, S_fp df, S_fp djac, doublereal *rpar, 
	integer *ipar)
{
    /* System generated locals */
    integer yh_dim1, yh_offset, i__1, i__2, i__3, i__4;
    doublereal d__1, d__2;

    /* Local variables */
    integer i__, j;
    doublereal r__;
    integer i1, i2, j1;
    doublereal r0, di;
    integer ii, jj, ml, mu;
    doublereal yi, yj, hl0;
    integer ml3;
    doublereal fac;
    integer mba;
    doublereal con, yjj;
    integer meb1, lenp;
    doublereal srur;
    extern /* Subroutine */ int dgbfa_(doublereal *, integer *, integer *, 
	    integer *, integer *, integer *, integer *), dgefa_(doublereal *, 
	    integer *, integer *, integer *, integer *);
    integer mband, meband;
    extern doublereal dvnrms_(integer *, doublereal *, doublereal *);

/* ***BEGIN PROLOGUE  DPJAC */
/* ***SUBSIDIARY */
/* ***PURPOSE  Subsidiary to DDEBDF */
/* ***LIBRARY   SLATEC */
/* ***TYPE      DOUBLE PRECISION (PJAC-S, DPJAC-D) */
/* ***AUTHOR  Watts, H. A., (SNLA) */
/* ***DESCRIPTION */

/*   DPJAC sets up the iteration matrix (involving the Jacobian) for the */
/*   integration package DDEBDF. */

/* ***SEE ALSO  DDEBDF */
/* ***ROUTINES CALLED  DGBFA, DGEFA, DVNRMS */
/* ***COMMON BLOCKS    DDEBD1 */
/* ***REVISION HISTORY  (YYMMDD) */
/*   820301  DATE WRITTEN */
/*   890531  Changed all specific intrinsics to generic.  (WRB) */
/*   890911  Removed unnecessary intrinsics.  (WRB) */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900328  Added TYPE section.  (WRB) */
/*   910722  Updated AUTHOR section.  (ALS) */
/*   920422  Changed DIMENSION statement.  (WRB) */
/* ***END PROLOGUE  DPJAC */

/*     ------------------------------------------------------------------ */
/*      DPJAC IS CALLED BY DSTOD  TO COMPUTE AND PROCESS THE MATRIX */
/*      P = I - H*EL(1)*J , WHERE J IS AN APPROXIMATION TO THE JACOBIAN. */
/*      HERE J IS COMPUTED BY THE USER-SUPPLIED ROUTINE DJAC IF */
/*      MITER = 1 OR 4, OR BY FINITE DIFFERENCING IF MITER = 2, 3, OR 5. */
/*      IF MITER = 3, A DIAGONAL APPROXIMATION TO J IS USED. */
/*      J IS STORED IN WM AND REPLACED BY P.  IF MITER .NE. 3, P IS THEN */
/*      SUBJECTED TO LU DECOMPOSITION IN PREPARATION FOR LATER SOLUTION */
/*      OF LINEAR SYSTEMS WITH P AS COEFFICIENT MATRIX. THIS IS DONE */
/*      BY DGEFA IF MITER = 1 OR 2, AND BY DGBFA IF MITER = 4 OR 5. */

/*      IN ADDITION TO VARIABLES DESCRIBED PREVIOUSLY, COMMUNICATION */
/*      WITH DPJAC USES THE FOLLOWING.. */
/*      Y    = ARRAY CONTAINING PREDICTED VALUES ON ENTRY. */
/*      FTEM = WORK ARRAY OF LENGTH N (ACOR IN DSTOD ). */
/*      SAVF = ARRAY CONTAINING DF EVALUATED AT PREDICTED Y. */
/*      WM   = DOUBLE PRECISION WORK SPACE FOR MATRICES.  ON OUTPUT IT */
/*      CONTAINS THE */
/*             INVERSE DIAGONAL MATRIX IF MITER = 3 AND THE LU */
/*             DECOMPOSITION OF P IF MITER IS 1, 2 , 4, OR 5. */
/*             STORAGE OF MATRIX ELEMENTS STARTS AT WM(3). */
/*             WM ALSO CONTAINS THE FOLLOWING MATRIX-RELATED DATA.. */
/*             WM(1) = SQRT(UROUND), USED IN NUMERICAL JACOBIAN */
/*             INCREMENTS.  WM(2) = H*EL0, SAVED FOR LATER USE IF MITER = */
/*             3. */
/*      IWM  = INTEGER WORK SPACE CONTAINING PIVOT INFORMATION, STARTING */
/*             AT IWM(21), IF MITER IS 1, 2, 4, OR 5.  IWM ALSO CONTAINS */
/*             THE BAND PARAMETERS ML = IWM(1) AND MU = IWM(2) IF MITER */
/*             IS 4 OR 5. */
/*      EL0  = EL(1) (INPUT). */
/*      IER  = OUTPUT ERROR FLAG,  = 0 IF NO TROUBLE, .NE. 0 IF */
/*             P MATRIX FOUND TO BE SINGULAR. */
/*      THIS ROUTINE ALSO USES THE COMMON VARIABLES EL0, H, TN, UROUND, */
/*      MITER, N, NFE, AND NJE. */
/* ----------------------------------------------------------------------- */
/*     BEGIN BLOCK PERMITTING ...EXITS TO 240 */
/*        BEGIN BLOCK PERMITTING ...EXITS TO 220 */
/*           BEGIN BLOCK PERMITTING ...EXITS TO 130 */
/*              BEGIN BLOCK PERMITTING ...EXITS TO 70 */
/* ***FIRST EXECUTABLE STATEMENT  DPJAC */
    /* Parameter adjustments */
    --y;
    yh_dim1 = *nyh;
    yh_offset = 1 + yh_dim1;
    yh -= yh_offset;
    --ewt;
    --ftem;
    --savf;
    --wm;
    --iwm;
    --rpar;
    --ipar;

    /* Function Body */
    ++ddebd1_4.nje;
    hl0 = ddebd1_4.h__ * ddebd1_4.el0;
    switch (ddebd1_4.miter) {
	case 1:  goto L10;
	case 2:  goto L40;
	case 3:  goto L90;
	case 4:  goto L140;
	case 5:  goto L170;
    }
/*                 IF MITER = 1, CALL DJAC AND MULTIPLY BY SCALAR. */
/*                 ----------------------- */
L10:
    lenp = ddebd1_4.n * ddebd1_4.n;
    i__1 = lenp;
    for (i__ = 1; i__ <= i__1; ++i__) {
	wm[i__ + 2] = 0.;
/* L20: */
    }
    (*djac)(&ddebd1_4.tn, &y[1], &wm[3], &ddebd1_4.n, &rpar[1], &ipar[1]);
    con = -hl0;
    i__1 = lenp;
    for (i__ = 1; i__ <= i__1; ++i__) {
	wm[i__ + 2] *= con;
/* L30: */
    }
/*              ...EXIT */
    goto L70;
/*                 IF MITER = 2, MAKE N CALLS TO DF TO APPROXIMATE J. */
/*                 -------------------- */
L40:
    fac = dvnrms_(&ddebd1_4.n, &savf[1], &ewt[1]);
    r0 = abs(ddebd1_4.h__) * 1e3 * ddebd1_4.uround * ddebd1_4.n * fac;
    if (r0 == 0.) {
	r0 = 1.;
    }
    srur = wm[1];
    j1 = 2;
    i__1 = ddebd1_4.n;
    for (j = 1; j <= i__1; ++j) {
	yj = y[j];
/* Computing MAX */
	d__1 = srur * abs(yj), d__2 = r0 * ewt[j];
	r__ = max(d__1,d__2);
	y[j] += r__;
	fac = -hl0 / r__;
	(*df)(&ddebd1_4.tn, &y[1], &ftem[1], &rpar[1], &ipar[1]);
	i__2 = ddebd1_4.n;
	for (i__ = 1; i__ <= i__2; ++i__) {
	    wm[i__ + j1] = (ftem[i__] - savf[i__]) * fac;
/* L50: */
	}
	y[j] = yj;
	j1 += ddebd1_4.n;
/* L60: */
    }
    ddebd1_4.nfe += ddebd1_4.n;
L70:
/*              ADD IDENTITY MATRIX. */
/*              ------------------------------------------------- */
    j = 3;
    i__1 = ddebd1_4.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	wm[j] += 1.;
	j += ddebd1_4.n + 1;
/* L80: */
    }
/*              DO LU DECOMPOSITION ON P. */
/*              -------------------------------------------- */
    dgefa_(&wm[3], &ddebd1_4.n, &ddebd1_4.n, &iwm[21], &ddebd1_4.ier);
/*     .........EXIT */
    goto L240;
/*              IF MITER = 3, CONSTRUCT A DIAGONAL APPROXIMATION TO J AND */
/*              P. --------- */
L90:
    wm[2] = hl0;
    ddebd1_4.ier = 0;
    r__ = ddebd1_4.el0 * .1;
    i__1 = ddebd1_4.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	y[i__] += r__ * (ddebd1_4.h__ * savf[i__] - yh[i__ + (yh_dim1 << 1)]);
/* L100: */
    }
    (*df)(&ddebd1_4.tn, &y[1], &wm[3], &rpar[1], &ipar[1]);
    ++ddebd1_4.nfe;
    i__1 = ddebd1_4.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	r0 = ddebd1_4.h__ * savf[i__] - yh[i__ + (yh_dim1 << 1)];
	di = r0 * .1 - ddebd1_4.h__ * (wm[i__ + 2] - savf[i__]);
	wm[i__ + 2] = 1.;
	if (abs(r0) < ddebd1_4.uround * ewt[i__]) {
	    goto L110;
	}
/*           .........EXIT */
	if (abs(di) == 0.) {
	    goto L130;
	}
	wm[i__ + 2] = r0 * .1 / di;
L110:
/* L120: */
	;
    }
/*     .........EXIT */
    goto L240;
L130:
    ddebd1_4.ier = -1;
/*     ......EXIT */
    goto L240;
/*           IF MITER = 4, CALL DJAC AND MULTIPLY BY SCALAR. */
/*           ----------------------- */
L140:
    ml = iwm[1];
    mu = iwm[2];
    ml3 = 3;
    mband = ml + mu + 1;
    meband = mband + ml;
    lenp = meband * ddebd1_4.n;
    i__1 = lenp;
    for (i__ = 1; i__ <= i__1; ++i__) {
	wm[i__ + 2] = 0.;
/* L150: */
    }
    (*djac)(&ddebd1_4.tn, &y[1], &wm[ml3], &meband, &rpar[1], &ipar[1]);
    con = -hl0;
    i__1 = lenp;
    for (i__ = 1; i__ <= i__1; ++i__) {
	wm[i__ + 2] *= con;
/* L160: */
    }
/*        ...EXIT */
    goto L220;
/*           IF MITER = 5, MAKE MBAND CALLS TO DF TO APPROXIMATE J. */
/*           ---------------- */
L170:
    ml = iwm[1];
    mu = iwm[2];
    mband = ml + mu + 1;
    mba = min(mband,ddebd1_4.n);
    meband = mband + ml;
    meb1 = meband - 1;
    srur = wm[1];
    fac = dvnrms_(&ddebd1_4.n, &savf[1], &ewt[1]);
    r0 = abs(ddebd1_4.h__) * 1e3 * ddebd1_4.uround * ddebd1_4.n * fac;
    if (r0 == 0.) {
	r0 = 1.;
    }
    i__1 = mba;
    for (j = 1; j <= i__1; ++j) {
	i__2 = ddebd1_4.n;
	i__3 = mband;
	for (i__ = j; i__3 < 0 ? i__ >= i__2 : i__ <= i__2; i__ += i__3) {
	    yi = y[i__];
/* Computing MAX */
	    d__1 = srur * abs(yi), d__2 = r0 * ewt[i__];
	    r__ = max(d__1,d__2);
	    y[i__] += r__;
/* L180: */
	}
	(*df)(&ddebd1_4.tn, &y[1], &ftem[1], &rpar[1], &ipar[1]);
	i__3 = ddebd1_4.n;
	i__2 = mband;
	for (jj = j; i__2 < 0 ? jj >= i__3 : jj <= i__3; jj += i__2) {
	    y[jj] = yh[jj + yh_dim1];
	    yjj = y[jj];
/* Computing MAX */
	    d__1 = srur * abs(yjj), d__2 = r0 * ewt[jj];
	    r__ = max(d__1,d__2);
	    fac = -hl0 / r__;
/* Computing MAX */
	    i__4 = jj - mu;
	    i1 = max(i__4,1);
/* Computing MIN */
	    i__4 = jj + ml;
	    i2 = min(i__4,ddebd1_4.n);
	    ii = jj * meb1 - ml + 2;
	    i__4 = i2;
	    for (i__ = i1; i__ <= i__4; ++i__) {
		wm[ii + i__] = (ftem[i__] - savf[i__]) * fac;
/* L190: */
	    }
/* L200: */
	}
/* L210: */
    }
    ddebd1_4.nfe += mba;
L220:
/*        ADD IDENTITY MATRIX. */
/*        ------------------------------------------------- */
    ii = mband + 2;
    i__1 = ddebd1_4.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	wm[ii] += 1.;
	ii += meband;
/* L230: */
    }
/*        DO LU DECOMPOSITION OF P. */
/*        -------------------------------------------- */
    dgbfa_(&wm[3], &meband, &ddebd1_4.n, &ml, &mu, &iwm[21], &ddebd1_4.ier);
L240:
    return 0;
/*     ----------------------- END OF SUBROUTINE DPJAC */
/*     ----------------------- */
} /* dpjac_ */

/* DECK DSLVS */
/* Subroutine */ int dslvs_(doublereal *wm, integer *iwm, doublereal *x, 
	doublereal *tem)
{
    /* System generated locals */
    integer i__1;

    /* Local variables */
    integer i__;
    doublereal r__, di;
    integer ml, mu;
    doublereal hl0, phl0;
    extern /* Subroutine */ int dgbsl_(doublereal *, integer *, integer *, 
	    integer *, integer *, integer *, doublereal *, integer *), dgesl_(
	    doublereal *, integer *, integer *, integer *, doublereal *, 
	    integer *);
    integer meband;

/* ***BEGIN PROLOGUE  DSLVS */
/* ***SUBSIDIARY */
/* ***PURPOSE  Subsidiary to DDEBDF */
/* ***LIBRARY   SLATEC */
/* ***TYPE      DOUBLE PRECISION (SLVS-S, DSLVS-D) */
/* ***AUTHOR  Watts, H. A., (SNLA) */
/* ***DESCRIPTION */

/*   DSLVS solves the linear system in the iteration scheme for the */
/*   integrator package DDEBDF. */

/* ***SEE ALSO  DDEBDF */
/* ***ROUTINES CALLED  DGBSL, DGESL */
/* ***COMMON BLOCKS    DDEBD1 */
/* ***REVISION HISTORY  (YYMMDD) */
/*   820301  DATE WRITTEN */
/*   890531  Changed all specific intrinsics to generic.  (WRB) */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900328  Added TYPE section.  (WRB) */
/*   910722  Updated AUTHOR section.  (ALS) */
/*   920422  Changed DIMENSION statement.  (WRB) */
/* ***END PROLOGUE  DSLVS */

/*     ------------------------------------------------------------------ */
/*      THIS ROUTINE MANAGES THE SOLUTION OF THE LINEAR SYSTEM ARISING */
/*      FROM A CHORD ITERATION.  IT IS CALLED BY DSTOD  IF MITER .NE. 0. */
/*      IF MITER IS 1 OR 2, IT CALLS DGESL TO ACCOMPLISH THIS. */
/*      IF MITER = 3 IT UPDATES THE COEFFICIENT H*EL0 IN THE DIAGONAL */
/*      MATRIX, AND THEN COMPUTES THE SOLUTION. */
/*      IF MITER IS 4 OR 5, IT CALLS DGBSL. */
/*      COMMUNICATION WITH DSLVS USES THE FOLLOWING VARIABLES.. */
/*      WM  = DOUBLE PRECISION WORK SPACE CONTAINING THE INVERSE DIAGONAL */
/*      MATRIX IF MITER */
/*            IS 3 AND THE LU DECOMPOSITION OF THE MATRIX OTHERWISE. */
/*            STORAGE OF MATRIX ELEMENTS STARTS AT WM(3). */
/*            WM ALSO CONTAINS THE FOLLOWING MATRIX-RELATED DATA.. */
/*            WM(1) = SQRT(UROUND) (NOT USED HERE), */
/*            WM(2) = HL0, THE PREVIOUS VALUE OF H*EL0, USED IF MITER = */
/*            3. */
/*      IWM = INTEGER WORK SPACE CONTAINING PIVOT INFORMATION, STARTING */
/*            AT IWM(21), IF MITER IS 1, 2, 4, OR 5.  IWM ALSO CONTAINS */
/*            THE BAND PARAMETERS ML = IWM(1) AND MU = IWM(2) IF MITER IS */
/*            4 OR 5. */
/*      X   = THE RIGHT-HAND SIDE VECTOR ON INPUT, AND THE SOLUTION */
/*            VECTOR ON OUTPUT, OF LENGTH N. */
/*      TEM = VECTOR OF WORK SPACE OF LENGTH N, NOT USED IN THIS VERSION. */
/*      IER = OUTPUT FLAG (IN COMMON).  IER = 0 IF NO TROUBLE OCCURRED. */
/*            IER = -1 IF A SINGULAR MATRIX AROSE WITH MITER = 3. */
/*      THIS ROUTINE ALSO USES THE COMMON VARIABLES EL0, H, MITER, AND N. */
/* ----------------------------------------------------------------------- */
/*     BEGIN BLOCK PERMITTING ...EXITS TO 80 */
/*        BEGIN BLOCK PERMITTING ...EXITS TO 60 */
/* ***FIRST EXECUTABLE STATEMENT  DSLVS */
    /* Parameter adjustments */
    --tem;
    --x;
    --iwm;
    --wm;

    /* Function Body */
    ddebd1_4.ier = 0;
    switch (ddebd1_4.miter) {
	case 1:  goto L10;
	case 2:  goto L10;
	case 3:  goto L20;
	case 4:  goto L70;
	case 5:  goto L70;
    }
L10:
    dgesl_(&wm[3], &ddebd1_4.n, &ddebd1_4.n, &iwm[21], &x[1], &c__0);
/*     ......EXIT */
    goto L80;

L20:
    phl0 = wm[2];
    hl0 = ddebd1_4.h__ * ddebd1_4.el0;
    wm[2] = hl0;
    if (hl0 == phl0) {
	goto L40;
    }
    r__ = hl0 / phl0;
    i__1 = ddebd1_4.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	di = 1. - r__ * (1. - 1. / wm[i__ + 2]);
/*        .........EXIT */
	if (abs(di) == 0.) {
	    goto L60;
	}
	wm[i__ + 2] = 1. / di;
/* L30: */
    }
L40:
    i__1 = ddebd1_4.n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	x[i__] = wm[i__ + 2] * x[i__];
/* L50: */
    }
/*     ......EXIT */
    goto L80;
L60:
    ddebd1_4.ier = -1;
/*     ...EXIT */
    goto L80;

L70:
    ml = iwm[1];
    mu = iwm[2];
    meband = (ml << 1) + mu + 1;
    dgbsl_(&wm[3], &meband, &ddebd1_4.n, &ml, &mu, &iwm[21], &x[1], &c__0);
L80:
    return 0;
/*     ----------------------- END OF SUBROUTINE DSLVS */
/*     ----------------------- */
} /* dslvs_ */

/* DECK DGBFA */
/* Subroutine */ int dgbfa_(doublereal *abd, integer *lda, integer *n, 
	integer *ml, integer *mu, integer *ipvt, integer *info)
{
    /* System generated locals */
    integer abd_dim1, abd_offset, i__1, i__2, i__3, i__4;

    /* Local variables */
    integer i__, j, k, l, m;
    doublereal t;
    integer i0, j0, j1, lm, mm, ju, jz, kp1, nm1;
    extern /* Subroutine */ int dscal_(integer *, doublereal *, doublereal *, 
	    integer *), daxpy_(integer *, doublereal *, doublereal *, integer 
	    *, doublereal *, integer *);
    extern integer idamax_(integer *, doublereal *, integer *);

/* ***BEGIN PROLOGUE  DGBFA */
/* ***PURPOSE  Factor a band matrix using Gaussian elimination. */
/* ***LIBRARY   SLATEC (LINPACK) */
/* ***CATEGORY  D2A2 */
/* ***TYPE      DOUBLE PRECISION (SGBFA-S, DGBFA-D, CGBFA-C) */
/* ***KEYWORDS  BANDED, LINEAR ALGEBRA, LINPACK, MATRIX FACTORIZATION */
/* ***AUTHOR  Moler, C. B., (U. of New Mexico) */
/* ***DESCRIPTION */

/*     DGBFA factors a double precision band matrix by elimination. */

/*     DGBFA is usually called by DGBCO, but it can be called */
/*     directly with a saving in time if  RCOND  is not needed. */

/*     On Entry */

/*        ABD     DOUBLE PRECISION(LDA, N) */
/*                contains the matrix in band storage.  The columns */
/*                of the matrix are stored in the columns of  ABD  and */
/*                the diagonals of the matrix are stored in rows */
/*                ML+1 through 2*ML+MU+1 of  ABD . */
/*                See the comments below for details. */

/*        LDA     INTEGER */
/*                the leading dimension of the array  ABD . */
/*                LDA must be .GE. 2*ML + MU + 1 . */

/*        N       INTEGER */
/*                the order of the original matrix. */

/*        ML      INTEGER */
/*                number of diagonals below the main diagonal. */
/*                0 .LE. ML .LT.  N . */

/*        MU      INTEGER */
/*                number of diagonals above the main diagonal. */
/*                0 .LE. MU .LT.  N . */
/*                More efficient if  ML .LE. MU . */
/*     On Return */

/*        ABD     an upper triangular matrix in band storage and */
/*                the multipliers which were used to obtain it. */
/*                The factorization can be written  A = L*U  where */
/*                L  is a product of permutation and unit lower */
/*                triangular matrices and  U  is upper triangular. */

/*        IPVT    INTEGER(N) */
/*                an integer vector of pivot indices. */

/*        INFO    INTEGER */
/*                = 0  normal value. */
/*                = K  if  U(K,K) .EQ. 0.0 .  This is not an error */
/*                     condition for this subroutine, but it does */
/*                     indicate that DGBSL will divide by zero if */
/*                     called.  Use  RCOND  in DGBCO for a reliable */
/*                     indication of singularity. */

/*     Band Storage */

/*           If  A  is a band matrix, the following program segment */
/*           will set up the input. */

/*                   ML = (band width below the diagonal) */
/*                   MU = (band width above the diagonal) */
/*                   M = ML + MU + 1 */
/*                   DO 20 J = 1, N */
/*                      I1 = MAX(1, J-MU) */
/*                      I2 = MIN(N, J+ML) */
/*                      DO 10 I = I1, I2 */
/*                         K = I - J + M */
/*                         ABD(K,J) = A(I,J) */
/*                10    CONTINUE */
/*                20 CONTINUE */

/*           This uses rows  ML+1  through  2*ML+MU+1  of  ABD . */
/*           In addition, the first  ML  rows in  ABD  are used for */
/*           elements generated during the triangularization. */
/*           The total number of rows needed in  ABD  is  2*ML+MU+1 . */
/*           The  ML+MU by ML+MU  upper left triangle and the */
/*           ML by ML  lower right triangle are not referenced. */

/* ***REFERENCES  J. J. Dongarra, J. R. Bunch, C. B. Moler, and G. W. */
/*                 Stewart, LINPACK Users' Guide, SIAM, 1979. */
/* ***ROUTINES CALLED  DAXPY, DSCAL, IDAMAX */
/* ***REVISION HISTORY  (YYMMDD) */
/*   780814  DATE WRITTEN */
/*   890531  Changed all specific intrinsics to generic.  (WRB) */
/*   890831  Modified array declarations.  (WRB) */
/*   890831  REVISION DATE from Version 3.2 */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900326  Removed duplicate information from DESCRIPTION section. */
/*           (WRB) */
/*   920501  Reformatted the REFERENCES section.  (WRB) */
/* ***END PROLOGUE  DGBFA */


/* ***FIRST EXECUTABLE STATEMENT  DGBFA */
    /* Parameter adjustments */
    abd_dim1 = *lda;
    abd_offset = 1 + abd_dim1;
    abd -= abd_offset;
    --ipvt;

    /* Function Body */
    m = *ml + *mu + 1;
    *info = 0;

/*     ZERO INITIAL FILL-IN COLUMNS */

    j0 = *mu + 2;
    j1 = min(*n,m) - 1;
    if (j1 < j0) {
	goto L30;
    }
    i__1 = j1;
    for (jz = j0; jz <= i__1; ++jz) {
	i0 = m + 1 - jz;
	i__2 = *ml;
	for (i__ = i0; i__ <= i__2; ++i__) {
	    abd[i__ + jz * abd_dim1] = 0.;
/* L10: */
	}
/* L20: */
    }
L30:
    jz = j1;
    ju = 0;

/*     GAUSSIAN ELIMINATION WITH PARTIAL PIVOTING */

    nm1 = *n - 1;
    if (nm1 < 1) {
	goto L130;
    }
    i__1 = nm1;
    for (k = 1; k <= i__1; ++k) {
	kp1 = k + 1;

/*        ZERO NEXT FILL-IN COLUMN */

	++jz;
	if (jz > *n) {
	    goto L50;
	}
	if (*ml < 1) {
	    goto L50;
	}
	i__2 = *ml;
	for (i__ = 1; i__ <= i__2; ++i__) {
	    abd[i__ + jz * abd_dim1] = 0.;
/* L40: */
	}
L50:

/*        FIND L = PIVOT INDEX */

/* Computing MIN */
	i__2 = *ml, i__3 = *n - k;
	lm = min(i__2,i__3);
	i__2 = lm + 1;
	l = idamax_(&i__2, &abd[m + k * abd_dim1], &c__1) + m - 1;
	ipvt[k] = l + k - m;

/*        ZERO PIVOT IMPLIES THIS COLUMN ALREADY TRIANGULARIZED */

	if (abd[l + k * abd_dim1] == 0.) {
	    goto L100;
	}

/*           INTERCHANGE IF NECESSARY */

	if (l == m) {
	    goto L60;
	}
	t = abd[l + k * abd_dim1];
	abd[l + k * abd_dim1] = abd[m + k * abd_dim1];
	abd[m + k * abd_dim1] = t;
L60:

/*           COMPUTE MULTIPLIERS */

	t = -1. / abd[m + k * abd_dim1];
	dscal_(&lm, &t, &abd[m + 1 + k * abd_dim1], &c__1);

/*           ROW ELIMINATION WITH COLUMN INDEXING */

/* Computing MIN */
/* Computing MAX */
	i__3 = ju, i__4 = *mu + ipvt[k];
	i__2 = max(i__3,i__4);
	ju = min(i__2,*n);
	mm = m;
	if (ju < kp1) {
	    goto L90;
	}
	i__2 = ju;
	for (j = kp1; j <= i__2; ++j) {
	    --l;
	    --mm;
	    t = abd[l + j * abd_dim1];
	    if (l == mm) {
		goto L70;
	    }
	    abd[l + j * abd_dim1] = abd[mm + j * abd_dim1];
	    abd[mm + j * abd_dim1] = t;
L70:
	    daxpy_(&lm, &t, &abd[m + 1 + k * abd_dim1], &c__1, &abd[mm + 1 + 
		    j * abd_dim1], &c__1);
/* L80: */
	}
L90:
	goto L110;
L100:
	*info = k;
L110:
/* L120: */
	;
    }
L130:
    ipvt[*n] = *n;
    if (abd[m + *n * abd_dim1] == 0.) {
	*info = *n;
    }
    return 0;
} /* dgbfa_ */

/* DECK DGBSL */
/* Subroutine */ int dgbsl_(doublereal *abd, integer *lda, integer *n, 
	integer *ml, integer *mu, integer *ipvt, doublereal *b, integer *job)
{
    /* System generated locals */
    integer abd_dim1, abd_offset, i__1, i__2, i__3;

    /* Local variables */
    integer k, l, m;
    doublereal t;
    integer kb, la, lb, lm, nm1;
    extern doublereal ddot_(integer *, doublereal *, integer *, doublereal *, 
	    integer *);
    extern /* Subroutine */ int daxpy_(integer *, doublereal *, doublereal *, 
	    integer *, doublereal *, integer *);

/* ***BEGIN PROLOGUE  DGBSL */
/* ***PURPOSE  Solve the real band system A*X=B or TRANS(A)*X=B using */
/*            the factors computed by DGBCO or DGBFA. */
/* ***LIBRARY   SLATEC (LINPACK) */
/* ***CATEGORY  D2A2 */
/* ***TYPE      DOUBLE PRECISION (SGBSL-S, DGBSL-D, CGBSL-C) */
/* ***KEYWORDS  BANDED, LINEAR ALGEBRA, LINPACK, MATRIX, SOLVE */
/* ***AUTHOR  Moler, C. B., (U. of New Mexico) */
/* ***DESCRIPTION */

/*     DGBSL solves the double precision band system */
/*     A * X = B  or  TRANS(A) * X = B */
/*     using the factors computed by DGBCO or DGBFA. */

/*     On Entry */

/*        ABD     DOUBLE PRECISION(LDA, N) */
/*                the output from DGBCO or DGBFA. */

/*        LDA     INTEGER */
/*                the leading dimension of the array  ABD . */

/*        N       INTEGER */
/*                the order of the original matrix. */

/*        ML      INTEGER */
/*                number of diagonals below the main diagonal. */

/*        MU      INTEGER */
/*                number of diagonals above the main diagonal. */

/*        IPVT    INTEGER(N) */
/*                the pivot vector from DGBCO or DGBFA. */

/*        B       DOUBLE PRECISION(N) */
/*                the right hand side vector. */

/*        JOB     INTEGER */
/*                = 0         to solve  A*X = B , */
/*                = nonzero   to solve  TRANS(A)*X = B , where */
/*                            TRANS(A)  is the transpose. */

/*     On Return */

/*        B       the solution vector  X . */

/*     Error Condition */

/*        A division by zero will occur if the input factor contains a */
/*        zero on the diagonal.  Technically this indicates singularity */
/*        but it is often caused by improper arguments or improper */
/*        setting of LDA .  It will not occur if the subroutines are */
/*        called correctly and if DGBCO has set RCOND .GT. 0.0 */
/*        or DGBFA has set INFO .EQ. 0 . */

/*     To compute  INVERSE(A) * C  where  C  is a matrix */
/*     with  P  columns */
/*           CALL DGBCO(ABD,LDA,N,ML,MU,IPVT,RCOND,Z) */
/*           IF (RCOND is too small) GO TO ... */
/*           DO 10 J = 1, P */
/*              CALL DGBSL(ABD,LDA,N,ML,MU,IPVT,C(1,J),0) */
/*        10 CONTINUE */

/* ***REFERENCES  J. J. Dongarra, J. R. Bunch, C. B. Moler, and G. W. */
/*                 Stewart, LINPACK Users' Guide, SIAM, 1979. */
/* ***ROUTINES CALLED  DAXPY, DDOT */
/* ***REVISION HISTORY  (YYMMDD) */
/*   780814  DATE WRITTEN */
/*   890531  Changed all specific intrinsics to generic.  (WRB) */
/*   890831  Modified array declarations.  (WRB) */
/*   890831  REVISION DATE from Version 3.2 */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900326  Removed duplicate information from DESCRIPTION section. */
/*           (WRB) */
/*   920501  Reformatted the REFERENCES section.  (WRB) */
/* ***END PROLOGUE  DGBSL */

/* ***FIRST EXECUTABLE STATEMENT  DGBSL */
    /* Parameter adjustments */
    abd_dim1 = *lda;
    abd_offset = 1 + abd_dim1;
    abd -= abd_offset;
    --ipvt;
    --b;

    /* Function Body */
    m = *mu + *ml + 1;
    nm1 = *n - 1;
    if (*job != 0) {
	goto L50;
    }

/*        JOB = 0 , SOLVE  A * X = B */
/*        FIRST SOLVE L*Y = B */

    if (*ml == 0) {
	goto L30;
    }
    if (nm1 < 1) {
	goto L30;
    }
    i__1 = nm1;
    for (k = 1; k <= i__1; ++k) {
/* Computing MIN */
	i__2 = *ml, i__3 = *n - k;
	lm = min(i__2,i__3);
	l = ipvt[k];
	t = b[l];
	if (l == k) {
	    goto L10;
	}
	b[l] = b[k];
	b[k] = t;
L10:
	daxpy_(&lm, &t, &abd[m + 1 + k * abd_dim1], &c__1, &b[k + 1], &c__1);
/* L20: */
    }
L30:

/*        NOW SOLVE  U*X = Y */

    i__1 = *n;
    for (kb = 1; kb <= i__1; ++kb) {
	k = *n + 1 - kb;
	b[k] /= abd[m + k * abd_dim1];
	lm = min(k,m) - 1;
	la = m - lm;
	lb = k - lm;
	t = -b[k];
	daxpy_(&lm, &t, &abd[la + k * abd_dim1], &c__1, &b[lb], &c__1);
/* L40: */
    }
    goto L100;
L50:

/*        JOB = NONZERO, SOLVE  TRANS(A) * X = B */
/*        FIRST SOLVE  TRANS(U)*Y = B */

    i__1 = *n;
    for (k = 1; k <= i__1; ++k) {
	lm = min(k,m) - 1;
	la = m - lm;
	lb = k - lm;
	t = ddot_(&lm, &abd[la + k * abd_dim1], &c__1, &b[lb], &c__1);
	b[k] = (b[k] - t) / abd[m + k * abd_dim1];
/* L60: */
    }

/*        NOW SOLVE TRANS(L)*X = Y */

    if (*ml == 0) {
	goto L90;
    }
    if (nm1 < 1) {
	goto L90;
    }
    i__1 = nm1;
    for (kb = 1; kb <= i__1; ++kb) {
	k = *n - kb;
/* Computing MIN */
	i__2 = *ml, i__3 = *n - k;
	lm = min(i__2,i__3);
	b[k] += ddot_(&lm, &abd[m + 1 + k * abd_dim1], &c__1, &b[k + 1], &
		c__1);
	l = ipvt[k];
	if (l == k) {
	    goto L70;
	}
	t = b[l];
	b[l] = b[k];
	b[k] = t;
L70:
/* L80: */
	;
    }
L90:
L100:
    return 0;
} /* dgbsl_ */

/* DECK DGEFA */
/* Subroutine */ int dgefa_(doublereal *a, integer *lda, integer *n, integer *
	ipvt, integer *info)
{
    /* System generated locals */
    integer a_dim1, a_offset, i__1, i__2, i__3;

    /* Local variables */
    integer j, k, l;
    doublereal t;
    integer kp1, nm1;
    extern /* Subroutine */ int dscal_(integer *, doublereal *, doublereal *, 
	    integer *), daxpy_(integer *, doublereal *, doublereal *, integer 
	    *, doublereal *, integer *);
    extern integer idamax_(integer *, doublereal *, integer *);

/* ***BEGIN PROLOGUE  DGEFA */
/* ***PURPOSE  Factor a matrix using Gaussian elimination. */
/* ***LIBRARY   SLATEC (LINPACK) */
/* ***CATEGORY  D2A1 */
/* ***TYPE      DOUBLE PRECISION (SGEFA-S, DGEFA-D, CGEFA-C) */
/* ***KEYWORDS  GENERAL MATRIX, LINEAR ALGEBRA, LINPACK, */
/*             MATRIX FACTORIZATION */
/* ***AUTHOR  Moler, C. B., (U. of New Mexico) */
/* ***DESCRIPTION */

/*     DGEFA factors a double precision matrix by Gaussian elimination. */

/*     DGEFA is usually called by DGECO, but it can be called */
/*     directly with a saving in time if  RCOND  is not needed. */
/*     (Time for DGECO) = (1 + 9/N)*(Time for DGEFA) . */

/*     On Entry */

/*        A       DOUBLE PRECISION(LDA, N) */
/*                the matrix to be factored. */

/*        LDA     INTEGER */
/*                the leading dimension of the array  A . */

/*        N       INTEGER */
/*                the order of the matrix  A . */

/*     On Return */

/*        A       an upper triangular matrix and the multipliers */
/*                which were used to obtain it. */
/*                The factorization can be written  A = L*U  where */
/*                L  is a product of permutation and unit lower */
/*                triangular matrices and  U  is upper triangular. */

/*        IPVT    INTEGER(N) */
/*                an integer vector of pivot indices. */

/*        INFO    INTEGER */
/*                = 0  normal value. */
/*                = K  if  U(K,K) .EQ. 0.0 .  This is not an error */
/*                     condition for this subroutine, but it does */
/*                     indicate that DGESL or DGEDI will divide by zero */
/*                     if called.  Use  RCOND  in DGECO for a reliable */
/*                     indication of singularity. */

/* ***REFERENCES  J. J. Dongarra, J. R. Bunch, C. B. Moler, and G. W. */
/*                 Stewart, LINPACK Users' Guide, SIAM, 1979. */
/* ***ROUTINES CALLED  DAXPY, DSCAL, IDAMAX */
/* ***REVISION HISTORY  (YYMMDD) */
/*   780814  DATE WRITTEN */
/*   890831  Modified array declarations.  (WRB) */
/*   890831  REVISION DATE from Version 3.2 */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900326  Removed duplicate information from DESCRIPTION section. */
/*           (WRB) */
/*   920501  Reformatted the REFERENCES section.  (WRB) */
/* ***END PROLOGUE  DGEFA */


/*     GAUSSIAN ELIMINATION WITH PARTIAL PIVOTING */

/* ***FIRST EXECUTABLE STATEMENT  DGEFA */
    /* Parameter adjustments */
    a_dim1 = *lda;
    a_offset = 1 + a_dim1;
    a -= a_offset;
    --ipvt;

    /* Function Body */
    *info = 0;
    nm1 = *n - 1;
    if (nm1 < 1) {
	goto L70;
    }
    i__1 = nm1;
    for (k = 1; k <= i__1; ++k) {
	kp1 = k + 1;

/*        FIND L = PIVOT INDEX */

	i__2 = *n - k + 1;
	l = idamax_(&i__2, &a[k + k * a_dim1], &c__1) + k - 1;
	ipvt[k] = l;

/*        ZERO PIVOT IMPLIES THIS COLUMN ALREADY TRIANGULARIZED */

	if (a[l + k * a_dim1] == 0.) {
	    goto L40;
	}

/*           INTERCHANGE IF NECESSARY */

	if (l == k) {
	    goto L10;
	}
	t = a[l + k * a_dim1];
	a[l + k * a_dim1] = a[k + k * a_dim1];
	a[k + k * a_dim1] = t;
L10:

/*           COMPUTE MULTIPLIERS */

	t = -1. / a[k + k * a_dim1];
	i__2 = *n - k;
	dscal_(&i__2, &t, &a[k + 1 + k * a_dim1], &c__1);

/*           ROW ELIMINATION WITH COLUMN INDEXING */

	i__2 = *n;
	for (j = kp1; j <= i__2; ++j) {
	    t = a[l + j * a_dim1];
	    if (l == k) {
		goto L20;
	    }
	    a[l + j * a_dim1] = a[k + j * a_dim1];
	    a[k + j * a_dim1] = t;
L20:
	    i__3 = *n - k;
	    daxpy_(&i__3, &t, &a[k + 1 + k * a_dim1], &c__1, &a[k + 1 + j * 
		    a_dim1], &c__1);
/* L30: */
	}
	goto L50;
L40:
	*info = k;
L50:
/* L60: */
	;
    }
L70:
    ipvt[*n] = *n;
    if (a[*n + *n * a_dim1] == 0.) {
	*info = *n;
    }
    return 0;
} /* dgefa_ */

/* DECK DGESL */
/* Subroutine */ int dgesl_(doublereal *a, integer *lda, integer *n, integer *
	ipvt, doublereal *b, integer *job)
{
    /* System generated locals */
    integer a_dim1, a_offset, i__1, i__2;

    /* Local variables */
    integer k, l;
    doublereal t;
    integer kb, nm1;
    extern doublereal ddot_(integer *, doublereal *, integer *, doublereal *, 
	    integer *);
    extern /* Subroutine */ int daxpy_(integer *, doublereal *, doublereal *, 
	    integer *, doublereal *, integer *);

/* ***BEGIN PROLOGUE  DGESL */
/* ***PURPOSE  Solve the real system A*X=B or TRANS(A)*X=B using the */
/*            factors computed by DGECO or DGEFA. */
/* ***LIBRARY   SLATEC (LINPACK) */
/* ***CATEGORY  D2A1 */
/* ***TYPE      DOUBLE PRECISION (SGESL-S, DGESL-D, CGESL-C) */
/* ***KEYWORDS  LINEAR ALGEBRA, LINPACK, MATRIX, SOLVE */
/* ***AUTHOR  Moler, C. B., (U. of New Mexico) */
/* ***DESCRIPTION */

/*     DGESL solves the double precision system */
/*     A * X = B  or  TRANS(A) * X = B */
/*     using the factors computed by DGECO or DGEFA. */

/*     On Entry */

/*        A       DOUBLE PRECISION(LDA, N) */
/*                the output from DGECO or DGEFA. */

/*        LDA     INTEGER */
/*                the leading dimension of the array  A . */

/*        N       INTEGER */
/*                the order of the matrix  A . */

/*        IPVT    INTEGER(N) */
/*                the pivot vector from DGECO or DGEFA. */

/*        B       DOUBLE PRECISION(N) */
/*                the right hand side vector. */

/*        JOB     INTEGER */
/*                = 0         to solve  A*X = B , */
/*                = nonzero   to solve  TRANS(A)*X = B  where */
/*                            TRANS(A)  is the transpose. */

/*     On Return */

/*        B       the solution vector  X . */

/*     Error Condition */

/*        A division by zero will occur if the input factor contains a */
/*        zero on the diagonal.  Technically this indicates singularity */
/*        but it is often caused by improper arguments or improper */
/*        setting of LDA .  It will not occur if the subroutines are */
/*        called correctly and if DGECO has set RCOND .GT. 0.0 */
/*        or DGEFA has set INFO .EQ. 0 . */

/*     To compute  INVERSE(A) * C  where  C  is a matrix */
/*     with  P  columns */
/*           CALL DGECO(A,LDA,N,IPVT,RCOND,Z) */
/*           IF (RCOND is too small) GO TO ... */
/*           DO 10 J = 1, P */
/*              CALL DGESL(A,LDA,N,IPVT,C(1,J),0) */
/*        10 CONTINUE */

/* ***REFERENCES  J. J. Dongarra, J. R. Bunch, C. B. Moler, and G. W. */
/*                 Stewart, LINPACK Users' Guide, SIAM, 1979. */
/* ***ROUTINES CALLED  DAXPY, DDOT */
/* ***REVISION HISTORY  (YYMMDD) */
/*   780814  DATE WRITTEN */
/*   890831  Modified array declarations.  (WRB) */
/*   890831  REVISION DATE from Version 3.2 */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900326  Removed duplicate information from DESCRIPTION section. */
/*           (WRB) */
/*   920501  Reformatted the REFERENCES section.  (WRB) */
/* ***END PROLOGUE  DGESL */

/* ***FIRST EXECUTABLE STATEMENT  DGESL */
    /* Parameter adjustments */
    a_dim1 = *lda;
    a_offset = 1 + a_dim1;
    a -= a_offset;
    --ipvt;
    --b;

    /* Function Body */
    nm1 = *n - 1;
    if (*job != 0) {
	goto L50;
    }

/*        JOB = 0 , SOLVE  A * X = B */
/*        FIRST SOLVE  L*Y = B */

    if (nm1 < 1) {
	goto L30;
    }
    i__1 = nm1;
    for (k = 1; k <= i__1; ++k) {
	l = ipvt[k];
	t = b[l];
	if (l == k) {
	    goto L10;
	}
	b[l] = b[k];
	b[k] = t;
L10:
	i__2 = *n - k;
	daxpy_(&i__2, &t, &a[k + 1 + k * a_dim1], &c__1, &b[k + 1], &c__1);
/* L20: */
    }
L30:

/*        NOW SOLVE  U*X = Y */

    i__1 = *n;
    for (kb = 1; kb <= i__1; ++kb) {
	k = *n + 1 - kb;
	b[k] /= a[k + k * a_dim1];
	t = -b[k];
	i__2 = k - 1;
	daxpy_(&i__2, &t, &a[k * a_dim1 + 1], &c__1, &b[1], &c__1);
/* L40: */
    }
    goto L100;
L50:

/*        JOB = NONZERO, SOLVE  TRANS(A) * X = B */
/*        FIRST SOLVE  TRANS(U)*Y = B */

    i__1 = *n;
    for (k = 1; k <= i__1; ++k) {
	i__2 = k - 1;
	t = ddot_(&i__2, &a[k * a_dim1 + 1], &c__1, &b[1], &c__1);
	b[k] = (b[k] - t) / a[k + k * a_dim1];
/* L60: */
    }

/*        NOW SOLVE TRANS(L)*X = Y */

    if (nm1 < 1) {
	goto L90;
    }
    i__1 = nm1;
    for (kb = 1; kb <= i__1; ++kb) {
	k = *n - kb;
	i__2 = *n - k;
	b[k] += ddot_(&i__2, &a[k + 1 + k * a_dim1], &c__1, &b[k + 1], &c__1);
	l = ipvt[k];
	if (l == k) {
	    goto L70;
	}
	t = b[l];
	b[l] = b[k];
	b[k] = t;
L70:
/* L80: */
	;
    }
L90:
L100:
    return 0;
} /* dgesl_ */

