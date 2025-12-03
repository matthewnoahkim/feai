/* ddeabm.f -- translated by f2c (version 20200916).
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

static integer c__1 = 1;
static integer c__13 = 13;
static integer c__2 = 2;
static integer c__5 = 5;
static integer c__4 = 4;
static integer c__3 = 3;
static integer c__14 = 14;
static integer c__6 = 6;
static integer c__7 = 7;
static integer c__8 = 8;
static doublereal c_b100 = 1.;
static integer c__9 = 9;
static integer c__10 = 10;
static integer c__11 = 11;
static integer c__12 = 12;
static integer c__0 = 0;
static logical c_false = FALSE_;
static integer c_n1 = -1;
static integer c__72 = 72;
static logical c_true = TRUE_;
static doublereal c_b400 = .375;
static doublereal c_b418 = 10.;


/*    SLATEC: public domain */

/* DECK DDEABM */
/* Subroutine */ int ddeabm_(U_fp df, integer *neq, doublereal *t, doublereal 
	*y, doublereal *tout, integer *info, doublereal *rtol, doublereal *
	atol, integer *idid, doublereal *rwork, integer *lrw, integer *iwork, 
	integer *liw, doublereal *rpar, integer *ipar)
{
    /* System generated locals */
    address a__1[5], a__2[2];
    integer i__1[5], i__2[2];
    char ch__1[223], ch__2[106], ch__3[96];
    icilist ici__1;

    /* Builtin functions */
    integer s_wsfi(icilist *), do_fio(integer *, char *, ftnlen), e_wsfi(void)
	    ;
    /* Subroutine */ int s_cat(char *, char **, integer *, integer *, ftnlen);

    /* Local variables */
    integer ig, ip, iv, iw, igi, iyp, iwt, iyy;
    extern /* Subroutine */ int ddes_(U_fp, integer *, doublereal *, 
	    doublereal *, doublereal *, integer *, doublereal *, doublereal *,
	     integer *, doublereal *, doublereal *, doublereal *, doublereal *
	    , doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, logical *,
	     logical *, logical *, logical *, logical *, integer *, integer *,
	     integer *, integer *, integer *, integer *, integer *, integer *,
	     integer *, integer *, integer *, doublereal *, integer *);
    integer iphi, isig, ipsi;
    char xern1[8], xern3[16];
    integer ibeta, ihold, itold;
    logical stiff;
    integer ixold;
    logical nornd, start;
    integer itwou;
    logical phase1;
    integer ialpha, idelsn;
    extern /* Subroutine */ int xermsg_(char *, char *, char *, integer *, 
	    integer *, ftnlen, ftnlen, ftnlen);
    integer itstar, ifouru;
    logical intout;
    integer iypout;

/* ***BEGIN PROLOGUE  DDEABM */
/* ***PURPOSE  Solve an initial value problem in ordinary differential */
/*            equations using an Adams-Bashforth method. */
/* ***LIBRARY   SLATEC (DEPAC) */
/* ***CATEGORY  I1A1B */
/* ***TYPE      DOUBLE PRECISION (DEABM-S, DDEABM-D) */
/* ***KEYWORDS  ADAMS-BASHFORTH METHOD, DEPAC, INITIAL VALUE PROBLEMS, */
/*             ODE, ORDINARY DIFFERENTIAL EQUATIONS, PREDICTOR-CORRECTOR */
/* ***AUTHOR  Shampine, L. F., (SNLA) */
/*           Watts, H. A., (SNLA) */
/* ***DESCRIPTION */

/*   This is the Adams code in the package of differential equation */
/*   solvers DEPAC, consisting of the codes DDERKF, DDEABM, and DDEBDF. */
/*   Design of the package was by L. F. Shampine and H. A. Watts. */
/*   It is documented in */
/*        SAND79-2374 , DEPAC - Design of a User Oriented Package of ODE */
/*                              Solvers. */
/*   DDEABM is a driver for a modification of the code ODE written by */
/*             L. F. Shampine and M. K. Gordon */
/*             Sandia Laboratories */
/*             Albuquerque, New Mexico 87185 */

/* ********************************************************************** */
/* * ABSTRACT * */
/* ************ */

/*   Subroutine DDEABM uses the Adams-Bashforth-Moulton */
/*   Predictor-Corrector formulas of orders one through twelve to */
/*   integrate a system of NEQ first order ordinary differential */
/*   equations of the form */
/*                         DU/DX = DF(X,U) */
/*   when the vector Y(*) of initial values for U(*) at X=T is given. */
/*   The subroutine integrates from T to TOUT. It is easy to continue the */
/*   integration to get results at additional TOUT.  This is the interval */
/*   mode of operation.  It is also easy for the routine to return with */
/*   the solution at each intermediate step on the way to TOUT.  This is */
/*   the intermediate-output mode of operation. */

/*   DDEABM uses subprograms DDES, DSTEPS, DINTP, DHSTRT, DHVNRM, */
/*   D1MACH, and the error handling routine XERMSG.  The only machine */
/*   dependent parameters to be assigned appear in D1MACH. */

/* ********************************************************************** */
/* * Description of The Arguments To DDEABM (An Overview) * */
/* ********************************************************************** */

/*   The Parameters are */

/*      DF -- This is the name of a subroutine which you provide to */
/*             define the differential equations. */

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

/*      RTOL, ATOL -- These DOUBLE PRECISION quantities represent */
/*                    relative and absolute error tolerances which you */
/*                    provide to indicate how accurately you wish the */
/*                    solution to be computed.  You may choose them to be */
/*                    both scalars or else both vectors. */

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
/*             calling program and the DF subroutine. */

/*  Quantities which are used as input items are */
/*             NEQ, T, Y(*), TOUT, INFO(*), */
/*             RTOL, ATOL, RWORK(1), LRW and LIW. */

/*  Quantities which may be altered by the code are */
/*             T, Y(*), INFO(1), RTOL, ATOL, */
/*             IDID, RWORK(*) and IWORK(*). */

/* ********************************************************************** */
/* * INPUT -- What To Do On The First Call To DDEABM * */
/* ********************************************************************** */

/*   The first call of the code is defined to be the start of each new */
/*   problem.  Read through the descriptions of all the following items, */
/*   provide sufficient storage space for designated arrays, set */
/*   appropriate variables for the initialization of the problem, and */
/*   give information about how you want the problem to be solved. */


/*      DF -- Provide a subroutine of the form */
/*                               DF(X,U,UPRIME,RPAR,IPAR) */
/*             to define the system of first order differential equations */
/*             which is to be solved.  For the given values of X and the */
/*             vector  U(*)=(U(1),U(2),...,U(NEQ)) , the subroutine must */
/*             evaluate the NEQ components of the system of differential */
/*             equations  DU/DX=DF(X,U)  and store the derivatives in the */
/*             array UPRIME(*), that is,  UPRIME(I) = * DU(I)/DX *  for */
/*             equations I=1,...,NEQ. */

/*             Subroutine DF must NOT alter X or U(*).  You must declare */
/*             the name df in an external statement in your program that */
/*             calls DDEABM.  You must dimension U and UPRIME in DF. */

/*             RPAR and IPAR are DOUBLE PRECISION and INTEGER parameter */
/*             arrays which you can use for communication between your */
/*             calling program and subroutine DF. They are not used or */
/*             altered by DDEABM.  If you do not need RPAR or IPAR, */
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

/*      TOUT -- Set it to the first point at which a solution */
/*             is desired.  You can take TOUT = T, in which case the code */
/*             will evaluate the derivative of the solution at T and */
/*             return. Integration either forward in T  (TOUT .GT. T)  or */
/*             backward in T  (TOUT .LT. T)  is permitted. */

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
/*             the problem. By using the fact that the code will not step */
/*             past TOUT in the first step, you could, if necessary, */
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
/*             DEPAC or possible future extensions, though DDEABM uses */
/*             only the first four entries.  You must respond to all of */
/*             the following items which are arranged as questions.  The */
/*             simplest use of the code corresponds to answering all */
/*             questions as YES ,i.e. setting ALL entries of INFO to 0. */

/*        INFO(1) -- This parameter enables the code to initialize */
/*               itself.  You must set it to indicate the start of every */
/*               new problem. */

/*            **** Is this the first call for this problem ... */
/*                  YES -- set INFO(1) = 0 */
/*                   NO -- not applicable here. */
/*                         See below for continuation calls.  **** */

/*        INFO(2) -- How much accuracy you want of your solution */
/*               is specified by the error tolerances RTOL and ATOL. */
/*               The simplest use is to take them both to be scalars. */
/*               To obtain more flexibility, they can both be vectors. */
/*               The code must be told your choice. */

/*            **** Are both error tolerances RTOL, ATOL scalars ... */
/*                  YES -- set INFO(2) = 0 */
/*                         and input scalars for both RTOL and ATOL */
/*                   NO -- set INFO(2) = 1 */
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
/*                 TOUT (and not at the next intermediate step) ... */
/*                  YES -- set INFO(3) = 0 */
/*                   NO -- set INFO(3) = 1 **** */

/*        INFO(4) -- To handle solutions at a great many specific */
/*               values TOUT efficiently, this code may integrate past */
/*               TOUT and interpolate to obtain the result at TOUT. */
/*               Sometimes it is not possible to integrate beyond some */
/*               point TSTOP because the equation changes there or it is */
/*               not defined past TSTOP.  Then you must tell the code */
/*               not to go past. */

/*            **** Can the integration be carried out without any */
/*                 Restrictions on the independent variable T ... */
/*                  YES -- set INFO(4)=0 */
/*                   NO -- set INFO(4)=1 */
/*                         and define the stopping point TSTOP by */
/*                         setting RWORK(1)=TSTOP **** */

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
/*             (More specifically, a Euclidean norm is used to measure */
/*             the size of vectors, and the error test uses the magnitude */
/*             of the solution at the beginning of the step.) */

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

/*             Setting ATOL=0.D0 results in a pure relative error test on */
/*             that component. Setting RTOL=0. results in a pure absolute */
/*             error test on that component.  A mixed test with non-zero */
/*             RTOL and ATOL corresponds roughly to a relative error */
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
/*             (for some problems it may not be permissible to integrate */
/*             past a point TSTOP because a discontinuity occurs there */
/*             or the solution or its derivative is not defined beyond */
/*             TSTOP.) */

/*      LRW -- Set it to the declared length of the RWORK array. */
/*             You must have  LRW .GE. 130+21*NEQ */

/*      IWORK(*) -- Dimension this INTEGER work array of length LIW in */
/*             your calling program. */

/*      LIW -- Set it to the declared length of the IWORK array. */
/*             You must have  LIW .GE. 51 */

/*      RPAR, IPAR -- These are parameter arrays, of DOUBLE PRECISION and */
/*             INTEGER type, respectively.  You can use them for */
/*             communication between your program that calls DDEABM and */
/*             the  DF subroutine.  They are not used or altered by */
/*             DDEABM.  If you do not need RPAR or IPAR, ignore these */
/*             parameters by treating them as dummy arguments.  If you do */
/*             choose to use them, dimension them in your calling program */
/*             and in DF as arrays of appropriate length. */

/* ********************************************************************** */
/* * OUTPUT -- After Any Return From DDEABM * */
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

/*             IDID = -4 -- The problem appears to be stiff. */

/*             IDID = -5,-6,-7,..,-32  -- Not applicable for this code */
/*                       but used by other members of DEPAC or possible */
/*                       future extensions. */

/*                         *** Task Terminated *** */
/*                   Reported by the value of IDID=-33 */

/*             IDID = -33 -- The code has encountered trouble from which */
/*                       it cannot recover.  A message is printed */
/*                       explaining the trouble and control is returned */
/*                       to the calling program. For example, this occurs */
/*                       when invalid input is detected. */

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

/*             RWORK(12)--if the tolerances have been increased by the */
/*                        code (IDID = -2) , they were multiplied by the */
/*                        value in RWORK(12). */

/*             RWORK(13)--Which contains the current value of the */
/*                        independent variable, i.e. the farthest point */
/*                        integration has reached. This will be different */
/*                        from T only when interpolation has been */
/*                        performed (IDID=3). */

/*             RWORK(20+I)--Which contains the approximate derivative */
/*                        of the solution component Y(I).  In DDEABM, it */
/*                        is obtained by calling subroutine DF to */
/*                        evaluate the differential equation using T and */
/*                        Y(*) when IDID=1 or 2, and by interpolation */
/*                        when IDID=3. */

/* ********************************************************************** */
/* * INPUT -- What To Do To Continue The Integration * */
/* *             (calls after the first)             * */
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

/*        The parameter INFO(1) is used by the code to indicate the */
/*        beginning of a new problem and to indicate whether integration */
/*        is to be continued.  You must input the value  INFO(1) = 0 */
/*        when starting a new problem.  You must input the value */
/*        INFO(1) = 1  if you wish to continue after an interrupted task. */
/*        Do not set  INFO(1) = 0  on a continuation call unless you */
/*        want the code to restart at the current T. */

/*                         *** Following A Completed Task *** */
/*         If */
/*             IDID = 1, call the code again to continue the integration */
/*                     another step in the direction of TOUT. */

/*             IDID = 2 or 3, define a new TOUT and call the code again. */
/*                     TOUT must be different from T. You cannot change */
/*                     the direction of integration without restarting. */

/*                         *** Following An Interrupted Task *** */
/*                     To show the code that you realize the task was */
/*                     interrupted and that you want to continue, you */
/*                     must take appropriate action and reset INFO(1) = 1 */
/*         If */
/*             IDID = -1, the code has attempted 500 steps. */
/*                     If you want to continue, set INFO(1) = 1 and */
/*                     call the code again. An additional 500 steps */
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

/*             IDID = -4, the problem appears to be stiff.  It is very */
/*                     inefficient to solve such problems with DDEABM. */
/*                     The code DDEBDF in DEPAC handles this task */
/*                     efficiently.  If you are absolutely sure you want */
/*                     to continue with DDEABM, set INFO(1)=1 and call */
/*                     the code again. */

/*             IDID = -5,-6,-7,..,-32  --- cannot occur with this code */
/*                     but used by other members of DEPAC or possible */
/*                     future extensions. */

/*                         *** Following A Terminated Task *** */
/*         If */
/*             IDID = -33, you cannot continue the solution of this */
/*                     problem.  An attempt to do so will result in your */
/*                     run being terminated. */

/* ********************************************************************** */
/* *Long Description: */

/* ********************************************************************** */
/* *             DEPAC Package Overview           * */
/* ********************************************************************** */

/* ....   You have a choice of three differential equation solvers from */
/* ....   DEPAC. The following brief descriptions are meant to aid you in */
/* ....   choosing the most appropriate code for your problem. */

/* ....   DDERKF is a fifth order Runge-Kutta code. It is the simplest of */
/* ....   the three choices, both algorithmically and in the use of the */
/* ....   code. DDERKF is primarily designed to solve non-stiff and */
/* ....   mildly stiff differential equations when derivative evaluations */
/* ....   are not expensive. It should generally not be used to get high */
/* ....   accuracy results nor answers at a great many specific points. */
/* ....   Because DDERKF has very low overhead costs, it will usually */
/* ....   result in the least expensive integration when solving */
/* ....   problems requiring a modest amount of accuracy and having */
/* ....   equations that are not costly to evaluate. DDERKF attempts to */
/* ....   discover when it is not suitable for the task posed. */

/* ....   DDEABM is a variable order (one through twelve) Adams code. */
/* ....   Its complexity lies somewhere between that of DDERKF and */
/* ....   DDEBDF.  DDEABM is primarily designed to solve non-stiff and */
/* ....   mildly stiff differential equations when derivative evaluations */
/* ....   are expensive, high accuracy results are needed or answers at */
/* ....   many specific points are required. DDEABM attempts to discover */
/* ....   when it is not suitable for the task posed. */

/* ....   DDEBDF is a variable order (one through five) backward */
/* ....   differentiation formula code. it is the most complicated of */
/* ....   the three choices. DDEBDF is primarily designed to solve stiff */
/* ....   differential equations at crude to moderate tolerances. */
/* ....   If the problem is very stiff at all, DDERKF and DDEABM will be */
/* ....   quite inefficient compared to DDEBDF. However, DDEBDF will be */
/* ....   inefficient compared to DDERKF and DDEABM on non-stiff problems */
/* ....   because it uses much more storage, has a much larger overhead, */
/* ....   and the low order formulas will not give high accuracies */
/* ....   efficiently. */

/* ....   The concept of stiffness cannot be described in a few words. */
/* ....   If you do not know the problem to be stiff, try either DDERKF */
/* ....   or DDEABM. Both of these codes will inform you of stiffness */
/* ....   when the cost of solving such problems becomes important. */

/* ********************************************************************* */

/* ***REFERENCES  L. F. Shampine and H. A. Watts, DEPAC - design of a user */
/*                 oriented package of ODE solvers, Report SAND79-2374, */
/*                 Sandia Laboratories, 1979. */
/* ***ROUTINES CALLED  DDES, XERMSG */
/* ***REVISION HISTORY  (YYMMDD) */
/*   820301  DATE WRITTEN */
/*   890531  Changed all specific intrinsics to generic.  (WRB) */
/*   890831  Modified array declarations.  (WRB) */
/*   891006  Cosmetic changes to prologue.  (WRB) */
/*   891024  Changed references from DVNORM to DHVNRM.  (WRB) */
/*   891024  REVISION DATE from Version 3.2 */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900510  Convert XERRWV calls to XERMSG calls.  (RWC) */
/*   920501  Reformatted the REFERENCES section.  (WRB) */
/* ***END PROLOGUE  DDEABM */





/*     CHECK FOR AN APPARENT INFINITE LOOP */

/* ***FIRST EXECUTABLE STATEMENT  DDEABM */
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
	    xermsg_("SLATEC", "DDEABM", ch__1, &c__13, &c__2, (ftnlen)6, (
		    ftnlen)6, (ftnlen)223);
	    return 0;
	}
    }

/*     CHECK LRW AND LIW FOR SUFFICIENT STORAGE ALLOCATION */

    *idid = 0;
    if (*lrw < *neq * 21 + 130) {
	ici__1.icierr = 0;
	ici__1.icirnum = 1;
	ici__1.icirlen = 8;
	ici__1.iciunit = xern1;
	ici__1.icifmt = "(I8)";
	s_wsfi(&ici__1);
	do_fio(&c__1, (char *)&(*lrw), (ftnlen)sizeof(integer));
	e_wsfi();
/* Writing concatenation */
	i__2[0] = 98, a__2[0] = "THE LENGTH OF THE RWORK ARRAY MUST BE AT LE"
		"AST 130 + 21*NEQ.$$YOU HAVE CALLED THE CODE WITH LRW = ";
	i__2[1] = 8, a__2[1] = xern1;
	s_cat(ch__2, a__2, i__2, &c__2, (ftnlen)106);
	xermsg_("SLATEC", "DDEABM", ch__2, &c__1, &c__1, (ftnlen)6, (ftnlen)6,
		 (ftnlen)106);
	*idid = -33;
    }

    if (*liw < 51) {
	ici__1.icierr = 0;
	ici__1.icirnum = 1;
	ici__1.icirlen = 8;
	ici__1.iciunit = xern1;
	ici__1.icifmt = "(I8)";
	s_wsfi(&ici__1);
	do_fio(&c__1, (char *)&(*liw), (ftnlen)sizeof(integer));
	e_wsfi();
/* Writing concatenation */
	i__2[0] = 88, a__2[0] = "THE LENGTH OF THE IWORK ARRAY MUST BE AT LE"
		"AST 51.$$YOU HAVE CALLED THE CODE WITH LIW = ";
	i__2[1] = 8, a__2[1] = xern1;
	s_cat(ch__3, a__2, i__2, &c__2, (ftnlen)96);
	xermsg_("SLATEC", "DDEABM", ch__3, &c__2, &c__1, (ftnlen)6, (ftnlen)6,
		 (ftnlen)96);
	*idid = -33;
    }

/*     COMPUTE THE INDICES FOR THE ARRAYS TO BE STORED IN THE WORK ARRAY */

    iypout = 21;
    itstar = *neq + 21;
    iyp = itstar + 1;
    iyy = *neq + iyp;
    iwt = *neq + iyy;
    ip = *neq + iwt;
    iphi = *neq + ip;
    ialpha = (*neq << 4) + iphi;
    ibeta = ialpha + 12;
    ipsi = ibeta + 12;
    iv = ipsi + 12;
    iw = iv + 12;
    isig = iw + 12;
    ig = isig + 13;
    igi = ig + 13;
    ixold = igi + 11;
    ihold = ixold + 1;
    itold = ihold + 1;
    idelsn = itold + 1;
    itwou = idelsn + 1;
    ifouru = itwou + 1;

    rwork[itstar] = *t;
    if (info[1] == 0) {
	goto L50;
    }
    start = iwork[21] != -1;
    phase1 = iwork[22] != -1;
    nornd = iwork[23] != -1;
    stiff = iwork[24] != -1;
    intout = iwork[25] != -1;

L50:
    ddes_((U_fp)df, neq, t, &y[1], tout, &info[1], &rtol[1], &atol[1], idid, &
	    rwork[iypout], &rwork[iyp], &rwork[iyy], &rwork[iwt], &rwork[ip], 
	    &rwork[iphi], &rwork[ialpha], &rwork[ibeta], &rwork[ipsi], &rwork[
	    iv], &rwork[iw], &rwork[isig], &rwork[ig], &rwork[igi], &rwork[11]
	    , &rwork[12], &rwork[13], &rwork[ixold], &rwork[ihold], &rwork[
	    itold], &rwork[idelsn], &rwork[1], &rwork[itwou], &rwork[ifouru], 
	    &start, &phase1, &nornd, &stiff, &intout, &iwork[26], &iwork[27], 
	    &iwork[28], &iwork[29], &iwork[30], &iwork[31], &iwork[32], &
	    iwork[33], &iwork[34], &iwork[35], &iwork[45], &rpar[1], &ipar[1])
	    ;

    iwork[21] = -1;
    if (start) {
	iwork[21] = 1;
    }
    iwork[22] = -1;
    if (phase1) {
	iwork[22] = 1;
    }
    iwork[23] = -1;
    if (nornd) {
	iwork[23] = 1;
    }
    iwork[24] = -1;
    if (stiff) {
	iwork[24] = 1;
    }
    iwork[25] = -1;
    if (intout) {
	iwork[25] = 1;
    }

    if (*idid != -2) {
	++iwork[*liw];
    }
    if (*t != rwork[itstar]) {
	iwork[*liw] = 0;
    }

    return 0;
} /* ddeabm_ */

/* DECK DDES */
/* Subroutine */ int ddes_(S_fp df, integer *neq, doublereal *t, doublereal *
	y, doublereal *tout, integer *info, doublereal *rtol, doublereal *
	atol, integer *idid, doublereal *ypout, doublereal *yp, doublereal *
	yy, doublereal *wt, doublereal *p, doublereal *phi, doublereal *alpha,
	 doublereal *beta, doublereal *psi, doublereal *v, doublereal *w, 
	doublereal *sig, doublereal *g, doublereal *gi, doublereal *h__, 
	doublereal *eps, doublereal *x, doublereal *xold, doublereal *hold, 
	doublereal *told, doublereal *delsgn, doublereal *tstop, doublereal *
	twou, doublereal *fouru, logical *start, logical *phase1, logical *
	nornd, logical *stiff, logical *intout, integer *ns, integer *kord, 
	integer *kold, integer *init, integer *ksteps, integer *kle4, integer 
	*iquit, integer *kprev, integer *ivc, integer *iv, integer *kgi, 
	doublereal *rpar, integer *ipar)
{
    /* Initialized data */

    static integer maxnum = 500;

    /* System generated locals */
    address a__1[2], a__2[6], a__3[7], a__4[3], a__5[5];
    integer phi_dim1, phi_offset, i__1[2], i__2, i__3[6], i__4[7], i__5[3], 
	    i__6[5];
    doublereal d__1, d__2, d__3, d__4, d__5;
    char ch__1[221], ch__2[144], ch__3[166], ch__4[172], ch__5[114], ch__6[
	    223], ch__7[197], ch__8[113], ch__9[128], ch__10[159];
    icilist ici__1;

    /* Builtin functions */
    integer s_wsfi(icilist *), do_fio(integer *, char *, ftnlen), e_wsfi(void)
	    ;
    /* Subroutine */ int s_cat(char *, char **, integer *, integer *, ftnlen);
    double d_sign(doublereal *, doublereal *);

    /* Local variables */
    doublereal a;
    integer k, l;
    doublereal u, ha, dt, del;
    integer ltol;
    char xern1[8], xern3[16], xern4[16];
    logical crash;
    extern /* Subroutine */ int dintp_(doublereal *, doublereal *, doublereal 
	    *, doublereal *, doublereal *, integer *, integer *, doublereal *,
	     integer *, integer *, integer *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *);
    extern doublereal d1mach_(integer *);
    doublereal absdel;
    integer natolp;
    extern /* Subroutine */ int dsteps_(S_fp, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, logical *,
	     doublereal *, integer *, integer *, logical *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, logical *, integer *, logical *, integer *, 
	    doublereal *, doublereal *, doublereal *, integer *, integer *, 
	    integer *, integer *, doublereal *, doublereal *, integer *), 
	    xermsg_(char *, char *, char *, integer *, integer *, ftnlen, 
	    ftnlen, ftnlen);
    integer nrtolp;

/* ***BEGIN PROLOGUE  DDES */
/* ***SUBSIDIARY */
/* ***PURPOSE  Subsidiary to DDEABM */
/* ***LIBRARY   SLATEC */
/* ***TYPE      DOUBLE PRECISION (DES-S, DDES-D) */
/* ***AUTHOR  Watts, H. A., (SNLA) */
/* ***DESCRIPTION */

/*   DDEABM merely allocates storage for DDES to relieve the user of the */
/*   inconvenience of a long call list.  Consequently  DDES  is used as */
/*   described in the comments for  DDEABM . */

/* ***SEE ALSO  DDEABM */
/* ***ROUTINES CALLED  D1MACH, DINTP, DSTEPS, XERMSG */
/* ***REVISION HISTORY  (YYMMDD) */
/*   820301  DATE WRITTEN */
/*   890531  Changed all specific intrinsics to generic.  (WRB) */
/*   890831  Modified array declarations.  (WRB) */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900328  Added TYPE section.  (WRB) */
/*   900510  Convert XERRWV calls to XERMSG calls, cvt GOTOs to */
/*           IF-THEN-ELSE.  (RWC) */
/*   910722  Updated AUTHOR section.  (ALS) */
/* ***END PROLOGUE  DDES */




/* ....................................................................... */

/*  THE EXPENSE OF SOLVING THE PROBLEM IS MONITORED BY COUNTING THE */
/*  NUMBER OF  STEPS ATTEMPTED. WHEN THIS EXCEEDS  MAXNUM, THE COUNTER */
/*  IS RESET TO ZERO AND THE USER IS INFORMED ABOUT POSSIBLE EXCESSIVE */
/*  WORK. */

    /* Parameter adjustments */
    phi_dim1 = *neq;
    phi_offset = 1 + phi_dim1;
    phi -= phi_offset;
    --y;
    --info;
    --rtol;
    --atol;
    --ypout;
    --yp;
    --yy;
    --wt;
    --p;
    --alpha;
    --beta;
    --psi;
    --v;
    --w;
    --sig;
    --g;
    --gi;
    --iv;
    --rpar;
    --ipar;

    /* Function Body */

/* ....................................................................... */

/* ***FIRST EXECUTABLE STATEMENT  DDES */
    if (info[1] == 0) {

/* ON THE FIRST CALL , PERFORM INITIALIZATION -- */
/*        DEFINE THE MACHINE UNIT ROUNDOFF QUANTITY  U  BY CALLING THE */
/*        FUNCTION ROUTINE  D1MACH. THE USER MUST MAKE SURE THAT THE */
/*        VALUES SET IN D1MACH ARE RELEVANT TO THE COMPUTER BEING USED. */

	u = d1mach_(&c__4);
/*                       -- SET ASSOCIATED MACHINE DEPENDENT PARAMETERS */
	*twou = u * 2.;
	*fouru = u * 4.;
/*                       -- SET TERMINATION FLAG */
	*iquit = 0;
/*                       -- SET INITIALIZATION INDICATOR */
	*init = 0;
/*                       -- SET COUNTER FOR ATTEMPTED STEPS */
	*ksteps = 0;
/*                       -- SET INDICATOR FOR INTERMEDIATE-OUTPUT */
	*intout = FALSE_;
/*                       -- SET INDICATOR FOR STIFFNESS DETECTION */
	*stiff = FALSE_;
/*                       -- SET STEP COUNTER FOR STIFFNESS DETECTION */
	*kle4 = 0;
/*                       -- SET INDICATORS FOR STEPS CODE */
	*start = TRUE_;
	*phase1 = TRUE_;
	*nornd = TRUE_;
/*                       -- RESET INFO(1) FOR SUBSEQUENT CALLS */
	info[1] = 1;
    }

/* ....................................................................... */

/*      CHECK VALIDITY OF INPUT PARAMETERS ON EACH ENTRY */

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
	i__1[0] = 213, a__1[0] = "IN DDEABM, INFO(1) MUST BE SET TO 0 FOR TH"
		"E START OF A NEW PROBLEM, AND MUST BE SET TO 1 FOLLOWING AN "
		"INTERRUPTED TASK.  YOU ARE ATTEMPTING TO CONTINUE THE INTEGR"
		"ATION ILLEGALLY BY CALLING THE CODE WITH INFO(1) = ";
	i__1[1] = 8, a__1[1] = xern1;
	s_cat(ch__1, a__1, i__1, &c__2, (ftnlen)221);
	xermsg_("SLATEC", "DDES", ch__1, &c__3, &c__1, (ftnlen)6, (ftnlen)4, (
		ftnlen)221);
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
	i__1[0] = 136, a__1[0] = "IN DDEABM, INFO(2) MUST BE 0 OR 1 INDICATI"
		"NG SCALAR AND VECTOR ERROR TOLERANCES, RESPECTIVELY.  YOU HA"
		"VE CALLED THE CODE WITH INFO(2) = ";
	i__1[1] = 8, a__1[1] = xern1;
	s_cat(ch__2, a__1, i__1, &c__2, (ftnlen)144);
	xermsg_("SLATEC", "DDES", ch__2, &c__4, &c__1, (ftnlen)6, (ftnlen)4, (
		ftnlen)144);
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
	i__1[0] = 158, a__1[0] = "IN DDEABM, INFO(3) MUST BE 0 OR 1 INDICATI"
		"NG THE INTERVAL OR INTERMEDIATE-OUTPUT MODE OF INTEGRATION, "
		"RESPECTIVELY.  YOU HAVE CALLED THE CODE WITH  INFO(3) = ";
	i__1[1] = 8, a__1[1] = xern1;
	s_cat(ch__3, a__1, i__1, &c__2, (ftnlen)166);
	xermsg_("SLATEC", "DDES", ch__3, &c__5, &c__1, (ftnlen)6, (ftnlen)4, (
		ftnlen)166);
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
	i__1[0] = 164, a__1[0] = "IN DDEABM, INFO(4) MUST BE 0 OR 1 INDICATI"
		"NG WHETHER OR NOT THE INTEGRATION INTERVAL IS TO BE RESTRICT"
		"ED BY A POINT TSTOP.  YOU HAVE CALLED THE CODE WITH INFO(4) "
		"= ";
	i__1[1] = 8, a__1[1] = xern1;
	s_cat(ch__4, a__1, i__1, &c__2, (ftnlen)172);
	xermsg_("SLATEC", "DDES", ch__4, &c__14, &c__1, (ftnlen)6, (ftnlen)4, 
		(ftnlen)172);
	*idid = -33;
    }

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
	i__1[0] = 106, a__1[0] = "IN DDEABM,  THE NUMBER OF EQUATIONS NEQ MU"
		"ST BE A POSITIVE INTEGER.  YOU HAVE CALLED THE CODE WITH  NE"
		"Q = ";
	i__1[1] = 8, a__1[1] = xern1;
	s_cat(ch__5, a__1, i__1, &c__2, (ftnlen)114);
	xermsg_("SLATEC", "DDES", ch__5, &c__6, &c__1, (ftnlen)6, (ftnlen)4, (
		ftnlen)114);
	*idid = -33;
    }

    nrtolp = 0;
    natolp = 0;
    i__2 = *neq;
    for (k = 1; k <= i__2; ++k) {
	if (nrtolp == 0 && rtol[k] < 0.) {
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
	    i__3[0] = 105, a__2[0] = "IN DDEABM, THE RELATIVE ERROR TOLERANC"
		    "ES RTOL MUST BE NON-NEGATIVE.  YOU HAVE CALLED THE CODE "
		    "WITH  RTOL(";
	    i__3[1] = 8, a__2[1] = xern1;
	    i__3[2] = 4, a__2[2] = ") = ";
	    i__3[3] = 16, a__2[3] = xern3;
	    i__3[4] = 43, a__2[4] = ".  IN THE CASE OF VECTOR ERROR TOLERANC"
		    "ES, ";
	    i__3[5] = 47, a__2[5] = "NO FURTHER CHECKING OF RTOL COMPONENTS "
		    "IS DONE.";
	    s_cat(ch__6, a__2, i__3, &c__6, (ftnlen)223);
	    xermsg_("SLATEC", "DDES", ch__6, &c__7, &c__1, (ftnlen)6, (ftnlen)
		    4, (ftnlen)223);
	    *idid = -33;
	    nrtolp = 1;
	}

	if (natolp == 0 && atol[k] < 0.) {
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
	    i__3[0] = 105, a__2[0] = "IN DDEABM, THE ABSOLUTE ERROR TOLERANC"
		    "ES ATOL MUST BE NON-NEGATIVE.  YOU HAVE CALLED THE CODE "
		    "WITH  ATOL(";
	    i__3[1] = 8, a__2[1] = xern1;
	    i__3[2] = 4, a__2[2] = ") = ";
	    i__3[3] = 16, a__2[3] = xern3;
	    i__3[4] = 43, a__2[4] = ".  IN THE CASE OF VECTOR ERROR TOLERANC"
		    "ES, ";
	    i__3[5] = 47, a__2[5] = "NO FURTHER CHECKING OF ATOL COMPONENTS "
		    "IS DONE.";
	    s_cat(ch__6, a__2, i__3, &c__6, (ftnlen)223);
	    xermsg_("SLATEC", "DDES", ch__6, &c__8, &c__1, (ftnlen)6, (ftnlen)
		    4, (ftnlen)223);
	    *idid = -33;
	    natolp = 1;
	}

	if (info[2] == 0) {
	    goto L100;
	}
	if (natolp > 0 && nrtolp > 0) {
	    goto L100;
	}
/* L90: */
    }

L100:
    if (info[4] == 1) {
	d__3 = *tout - *t;
	d__4 = *tstop - *t;
	if (d_sign(&c_b100, &d__3) != d_sign(&c_b100, &d__4) || (d__1 = *tout 
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
	    i__4[0] = 49, a__3[0] = "IN DDEABM, YOU HAVE CALLED THE CODE WIT"
		    "H  TOUT = ";
	    i__4[1] = 16, a__3[1] = xern3;
	    i__4[2] = 5, a__3[2] = " BUT ";
	    i__4[3] = 49, a__3[3] = "YOU HAVE ALSO TOLD THE CODE (INFO(4) = "
		    "1) NOT TO ";
	    i__4[4] = 33, a__3[4] = "INTEGRATE PAST THE POINT TSTOP = ";
	    i__4[5] = 16, a__3[5] = xern4;
	    i__4[6] = 29, a__3[6] = " THESE INSTRUCTIONS CONFLICT.";
	    s_cat(ch__7, a__3, i__4, &c__7, (ftnlen)197);
	    xermsg_("SLATEC", "DDES", ch__7, &c__14, &c__1, (ftnlen)6, (
		    ftnlen)4, (ftnlen)197);
	    *idid = -33;
	}
    }

/*     CHECK SOME CONTINUATION POSSIBILITIES */

    if (*init != 0) {
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
	    i__5[0] = 53, a__4[0] = "IN DDEABM, YOU HAVE CALLED THE CODE WIT"
		    "H  T = TOUT = ";
	    i__5[1] = 16, a__4[1] = xern3;
	    i__5[2] = 44, a__4[2] = "$$THIS IS NOT ALLOWED ON CONTINUATION C"
		    "ALLS.";
	    s_cat(ch__8, a__4, i__5, &c__3, (ftnlen)113);
	    xermsg_("SLATEC", "DDES", ch__8, &c__9, &c__1, (ftnlen)6, (ftnlen)
		    4, (ftnlen)113);
	    *idid = -33;
	}

	if (*t != *told) {
	    ici__1.icierr = 0;
	    ici__1.icirnum = 1;
	    ici__1.icirlen = 16;
	    ici__1.iciunit = xern3;
	    ici__1.icifmt = "(1PE15.6)";
	    s_wsfi(&ici__1);
	    do_fio(&c__1, (char *)&(*told), (ftnlen)sizeof(doublereal));
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
	    i__6[0] = 48, a__5[0] = "IN DDEABM, YOU HAVE CHANGED THE VALUE O"
		    "F T FROM ";
	    i__6[1] = 16, a__5[1] = xern3;
	    i__6[2] = 4, a__5[2] = " TO ";
	    i__6[3] = 16, a__5[3] = xern4;
	    i__6[4] = 44, a__5[4] = "  THIS IS NOT ALLOWED ON CONTINUATION C"
		    "ALLS.";
	    s_cat(ch__9, a__5, i__6, &c__5, (ftnlen)128);
	    xermsg_("SLATEC", "DDES", ch__9, &c__10, &c__1, (ftnlen)6, (
		    ftnlen)4, (ftnlen)128);
	    *idid = -33;
	}

	if (*init != 1) {
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
		i__6[0] = 43, a__5[0] = "IN DDEABM, BY CALLING THE CODE WITH"
			" TOUT = ";
		i__6[1] = 16, a__5[1] = xern3;
		i__6[2] = 47, a__5[2] = " YOU ARE ATTEMPTING TO CHANGE THE D"
			"IRECTION OF ";
		i__6[3] = 42, a__5[3] = "INTEGRATION.$$THIS IS NOT ALLOWED W"
			"ITHOUT ";
		i__6[4] = 11, a__5[4] = "RESTARTING.";
		s_cat(ch__10, a__5, i__6, &c__5, (ftnlen)159);
		xermsg_("SLATEC", "DDES", ch__10, &c__11, &c__1, (ftnlen)6, (
			ftnlen)4, (ftnlen)159);
		*idid = -33;
	    }
	}
    }

/*     INVALID INPUT DETECTED */

    if (*idid == -33) {
	if (*iquit != -33) {
	    *iquit = -33;
	    info[1] = -1;
	} else {
	    xermsg_("SLATEC", "DDES", "IN DDEABM, INVALID INPUT WAS DETECTED"
		    " ON SUCCESSIVE ENTRIES.  IT IS IMPOSSIBLE TO PROCEED BEC"
		    "AUSE YOU HAVE NOT CORRECTED THE PROBLEM, SO EXECUTION IS"
		    " BEING TERMINATED.", &c__12, &c__2, (ftnlen)6, (ftnlen)4, 
		    (ftnlen)167);
	}
	return 0;
    }

/* ....................................................................... */

/*     RTOL = ATOL = 0. IS ALLOWED AS VALID INPUT AND INTERPRETED AS */
/*     ASKING FOR THE MOST ACCURATE SOLUTION POSSIBLE. IN THIS CASE, */
/*     THE RELATIVE ERROR TOLERANCE RTOL IS RESET TO THE SMALLEST VALUE */
/*     FOURU WHICH IS LIKELY TO BE REASONABLE FOR THIS METHOD AND MACHINE */

    i__2 = *neq;
    for (k = 1; k <= i__2; ++k) {
	if (rtol[k] + atol[k] > 0.) {
	    goto L170;
	}
	rtol[k] = *fouru;
	*idid = -2;
L170:
	if (info[2] == 0) {
	    goto L190;
	}
/* L180: */
    }

L190:
    if (*idid != -2) {
	goto L200;
    }
/*                       RTOL=ATOL=0 ON INPUT, SO RTOL IS CHANGED TO A */
/*                                                SMALL POSITIVE VALUE */
    info[1] = -1;
    return 0;

/*     BRANCH ON STATUS OF INITIALIZATION INDICATOR */
/*            INIT=0 MEANS INITIAL DERIVATIVES AND NOMINAL STEP SIZE */
/*                   AND DIRECTION NOT YET SET */
/*            INIT=1 MEANS NOMINAL STEP SIZE AND DIRECTION NOT YET SET */
/*            INIT=2 MEANS NO FURTHER INITIALIZATION REQUIRED */

L200:
    if (*init == 0) {
	goto L210;
    }
    if (*init == 1) {
	goto L220;
    }
    goto L240;

/* ....................................................................... */

/*     MORE INITIALIZATION -- */
/*                         -- EVALUATE INITIAL DERIVATIVES */

L210:
    *init = 1;
    a = *t;
    (*df)(&a, &y[1], &yp[1], &rpar[1], &ipar[1]);
    if (*t != *tout) {
	goto L220;
    }
    *idid = 2;
    i__2 = *neq;
    for (l = 1; l <= i__2; ++l) {
/* L215: */
	ypout[l] = yp[l];
    }
    *told = *t;
    return 0;

/*                         -- SET INDEPENDENT AND DEPENDENT VARIABLES */
/*                                              X AND YY(*) FOR STEPS */
/*                         -- SET SIGN OF INTEGRATION DIRECTION */
/*                         -- INITIALIZE THE STEP SIZE */

L220:
    *init = 2;
    *x = *t;
    i__2 = *neq;
    for (l = 1; l <= i__2; ++l) {
/* L230: */
	yy[l] = y[l];
    }
    d__1 = *tout - *t;
    *delsgn = d_sign(&c_b100, &d__1);
/* Computing MAX */
    d__3 = *fouru * abs(*x), d__4 = (d__1 = *tout - *x, abs(d__1));
    d__2 = max(d__3,d__4);
    d__5 = *tout - *x;
    *h__ = d_sign(&d__2, &d__5);

/* ....................................................................... */

/*   ON EACH CALL SET INFORMATION WHICH DETERMINES THE ALLOWED INTERVAL */
/*   OF INTEGRATION BEFORE RETURNING WITH AN ANSWER AT TOUT */

L240:
    del = *tout - *t;
    absdel = abs(del);

/* ....................................................................... */

/*   IF ALREADY PAST OUTPUT POINT, INTERPOLATE AND RETURN */

L250:
    if ((d__1 = *x - *t, abs(d__1)) < absdel) {
	goto L260;
    }
    dintp_(x, &yy[1], tout, &y[1], &ypout[1], neq, kold, &phi[phi_offset], 
	    ivc, &iv[1], kgi, &gi[1], &alpha[1], &g[1], &w[1], xold, &p[1]);
    *idid = 3;
    if (*x != *tout) {
	goto L255;
    }
    *idid = 2;
    *intout = FALSE_;
L255:
    *t = *tout;
    *told = *t;
    return 0;

/*   IF CANNOT GO PAST TSTOP AND SUFFICIENTLY CLOSE, */
/*   EXTRAPOLATE AND RETURN */

L260:
    if (info[4] != 1) {
	goto L280;
    }
    if ((d__1 = *tstop - *x, abs(d__1)) >= *fouru * abs(*x)) {
	goto L280;
    }
    dt = *tout - *x;
    i__2 = *neq;
    for (l = 1; l <= i__2; ++l) {
/* L270: */
	y[l] = yy[l] + dt * yp[l];
    }
    (*df)(tout, &y[1], &ypout[1], &rpar[1], &ipar[1]);
    *idid = 3;
    *t = *tout;
    *told = *t;
    return 0;

L280:
    if (info[3] == 0 || ! (*intout)) {
	goto L300;
    }

/*   INTERMEDIATE-OUTPUT MODE */

    *idid = 1;
    i__2 = *neq;
    for (l = 1; l <= i__2; ++l) {
	y[l] = yy[l];
/* L290: */
	ypout[l] = yp[l];
    }
    *t = *x;
    *told = *t;
    *intout = FALSE_;
    return 0;

/* ....................................................................... */

/*     MONITOR NUMBER OF STEPS ATTEMPTED */

L300:
    if (*ksteps <= maxnum) {
	goto L330;
    }

/*                       A SIGNIFICANT AMOUNT OF WORK HAS BEEN EXPENDED */
    *idid = -1;
    *ksteps = 0;
    if (! (*stiff)) {
	goto L310;
    }

/*                       PROBLEM APPEARS TO BE STIFF */
    *idid = -4;
    *stiff = FALSE_;
    *kle4 = 0;

L310:
    i__2 = *neq;
    for (l = 1; l <= i__2; ++l) {
	y[l] = yy[l];
/* L320: */
	ypout[l] = yp[l];
    }
    *t = *x;
    *told = *t;
    info[1] = -1;
    *intout = FALSE_;
    return 0;

/* ....................................................................... */

/*   LIMIT STEP SIZE, SET WEIGHT VECTOR AND TAKE A STEP */

L330:
    ha = abs(*h__);
    if (info[4] != 1) {
	goto L340;
    }
/* Computing MIN */
    d__2 = ha, d__3 = (d__1 = *tstop - *x, abs(d__1));
    ha = min(d__2,d__3);
L340:
    *h__ = d_sign(&ha, h__);
    *eps = 1.;
    ltol = 1;
    i__2 = *neq;
    for (l = 1; l <= i__2; ++l) {
	if (info[2] == 1) {
	    ltol = l;
	}
	wt[l] = rtol[ltol] * (d__1 = yy[l], abs(d__1)) + atol[ltol];
	if (wt[l] <= 0.) {
	    goto L360;
	}
/* L350: */
    }
    goto L380;

/*                       RELATIVE ERROR CRITERION INAPPROPRIATE */
L360:
    *idid = -3;
    i__2 = *neq;
    for (l = 1; l <= i__2; ++l) {
	y[l] = yy[l];
/* L370: */
	ypout[l] = yp[l];
    }
    *t = *x;
    *told = *t;
    info[1] = -1;
    *intout = FALSE_;
    return 0;

L380:
    dsteps_((S_fp)df, neq, &yy[1], x, h__, eps, &wt[1], start, hold, kord, 
	    kold, &crash, &phi[phi_offset], &p[1], &yp[1], &psi[1], &alpha[1],
	     &beta[1], &sig[1], &v[1], &w[1], &g[1], phase1, ns, nornd, 
	    ksteps, twou, fouru, xold, kprev, ivc, &iv[1], kgi, &gi[1], &rpar[
	    1], &ipar[1]);

/* ....................................................................... */

    if (! crash) {
	goto L420;
    }

/*                       TOLERANCES TOO SMALL */
    *idid = -2;
    rtol[1] = *eps * rtol[1];
    atol[1] = *eps * atol[1];
    if (info[2] == 0) {
	goto L400;
    }
    i__2 = *neq;
    for (l = 2; l <= i__2; ++l) {
	rtol[l] = *eps * rtol[l];
/* L390: */
	atol[l] = *eps * atol[l];
    }
L400:
    i__2 = *neq;
    for (l = 1; l <= i__2; ++l) {
	y[l] = yy[l];
/* L410: */
	ypout[l] = yp[l];
    }
    *t = *x;
    *told = *t;
    info[1] = -1;
    *intout = FALSE_;
    return 0;

/*   (STIFFNESS TEST) COUNT NUMBER OF CONSECUTIVE STEPS TAKEN WITH THE */
/*   ORDER OF THE METHOD BEING LESS OR EQUAL TO FOUR */

L420:
    ++(*kle4);
    if (*kold > 4) {
	*kle4 = 0;
    }
    if (*kle4 >= 50) {
	*stiff = TRUE_;
    }
    *intout = TRUE_;
    goto L250;
} /* ddes_ */

/* DECK DINTP */
/* Subroutine */ int dintp_(doublereal *x, doublereal *y, doublereal *xout, 
	doublereal *yout, doublereal *ypout, integer *neqn, integer *kold, 
	doublereal *phi, integer *ivc, integer *iv, integer *kgi, doublereal *
	gi, doublereal *alpha, doublereal *og, doublereal *ow, doublereal *ox,
	 doublereal *oy)
{
    /* System generated locals */
    integer phi_dim1, phi_offset, i__1, i__2;

    /* Local variables */
    doublereal c__[13], g[13], h__;
    integer i__, j, l, m;
    doublereal w[13], hi;
    integer iq, jq, iw;
    doublereal xi;
    integer kp1, kp2;
    doublereal gdi, alp, hmu, xiq, rmu, xim1, gdif, temp1, temp2, temp3, 
	    gamma, sigma;

/* ***BEGIN PROLOGUE  DINTP */
/* ***PURPOSE  Approximate the solution at XOUT by evaluating the */
/*            polynomial computed in DSTEPS at XOUT.  Must be used in */
/*            conjunction with DSTEPS. */
/* ***LIBRARY   SLATEC (DEPAC) */
/* ***CATEGORY  I1A1B */
/* ***TYPE      DOUBLE PRECISION (SINTRP-S, DINTP-D) */
/* ***KEYWORDS  ADAMS METHOD, DEPAC, INITIAL VALUE PROBLEMS, ODE, */
/*             ORDINARY DIFFERENTIAL EQUATIONS, PREDICTOR-CORRECTOR, */
/*             SMOOTH INTERPOLANT */
/* ***AUTHOR  Watts, H. A., (SNLA) */
/* ***DESCRIPTION */

/*   The methods in subroutine  DSTEPS  approximate the solution near  X */
/*   by a polynomial.  Subroutine  DINTP  approximates the solution at */
/*   XOUT  by evaluating the polynomial there.  Information defining this */
/*   polynomial is passed from  DSTEPS  so  DINTP  cannot be used alone. */

/*   Subroutine DSTEPS is completely explained and documented in the text */
/*   "Computer Solution of Ordinary Differential Equations, the Initial */
/*   Value Problem"  by L. F. Shampine and M. K. Gordon. */

/*   Input to DINTP -- */

/*   The user provides storage in the calling program for the arrays in */
/*   the call list */
/*      DIMENSION Y(NEQN),YOUT(NEQN),YPOUT(NEQN),PHI(NEQN,16),OY(NEQN) */
/*                AND ALPHA(12),OG(13),OW(12),GI(11),IV(10) */
/*   and defines */
/*      XOUT -- point at which solution is desired. */
/*   The remaining parameters are defined in  DSTEPS  and passed to */
/*   DINTP  from that subroutine */

/*   Output from  DINTP -- */

/*      YOUT(*) -- solution at  XOUT */
/*      YPOUT(*) -- derivative of solution at  XOUT */
/*   The remaining parameters are returned unaltered from their input */
/*   values.  Integration with  DSTEPS  may be continued. */

/* ***REFERENCES  H. A. Watts, A smoother interpolant for DE/STEP, INTRP */
/*                 II, Report SAND84-0293, Sandia Laboratories, 1984. */
/* ***ROUTINES CALLED  (NONE) */
/* ***REVISION HISTORY  (YYMMDD) */
/*   840201  DATE WRITTEN */
/*   890831  Modified array declarations.  (WRB) */
/*   890831  REVISION DATE from Version 3.2 */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   920501  Reformatted the REFERENCES section.  (WRB) */
/* ***END PROLOGUE  DINTP */



/* ***FIRST EXECUTABLE STATEMENT  DINTP */
    /* Parameter adjustments */
    --y;
    --yout;
    --ypout;
    phi_dim1 = *neqn;
    phi_offset = 1 + phi_dim1;
    phi -= phi_offset;
    --iv;
    --gi;
    --alpha;
    --og;
    --ow;
    --oy;

    /* Function Body */
    kp1 = *kold + 1;
    kp2 = *kold + 2;

    hi = *xout - *ox;
    h__ = *x - *ox;
    xi = hi / h__;
    xim1 = xi - 1.;

/*   INITIALIZE W(*) FOR COMPUTING G(*) */

    xiq = xi;
    i__1 = kp1;
    for (iq = 1; iq <= i__1; ++iq) {
	xiq = xi * xiq;
	temp1 = (doublereal) (iq * (iq + 1));
/* L10: */
	w[iq - 1] = xiq / temp1;
    }

/*   COMPUTE THE DOUBLE INTEGRAL TERM GDI */

    if (*kold <= *kgi) {
	goto L50;
    }
    if (*ivc > 0) {
	goto L20;
    }
    gdi = 1. / temp1;
    m = 2;
    goto L30;
L20:
    iw = iv[*ivc];
    gdi = ow[iw];
    m = *kold - iw + 3;
L30:
    if (m > *kold) {
	goto L60;
    }
    i__1 = *kold;
    for (i__ = m; i__ <= i__1; ++i__) {
/* L40: */
	gdi = ow[kp2 - i__] - alpha[i__] * gdi;
    }
    goto L60;
L50:
    gdi = gi[*kold];

/*   COMPUTE G(*) AND C(*) */

L60:
    g[0] = xi;
    g[1] = xi * .5 * xi;
    c__[0] = 1.;
    c__[1] = xi;
    if (*kold < 2) {
	goto L90;
    }
    i__1 = *kold;
    for (i__ = 2; i__ <= i__1; ++i__) {
	alp = alpha[i__];
	gamma = xim1 * alp + 1.;
	l = kp2 - i__;
	i__2 = l;
	for (jq = 1; jq <= i__2; ++jq) {
/* L70: */
	    w[jq - 1] = gamma * w[jq - 1] - alp * w[jq];
	}
	g[i__] = w[0];
/* L80: */
	c__[i__] = gamma * c__[i__ - 1];
    }

/*   DEFINE INTERPOLATION PARAMETERS */

L90:
    sigma = (w[1] - xim1 * w[0]) / gdi;
    rmu = xim1 * c__[kp1 - 1] / gdi;
    hmu = rmu / h__;

/*   INTERPOLATE FOR THE SOLUTION -- YOUT */
/*   AND FOR THE DERIVATIVE OF THE SOLUTION -- YPOUT */

    i__1 = *neqn;
    for (l = 1; l <= i__1; ++l) {
	yout[l] = 0.;
/* L100: */
	ypout[l] = 0.;
    }
    i__1 = *kold;
    for (j = 1; j <= i__1; ++j) {
	i__ = kp2 - j;
	gdif = og[i__] - og[i__ - 1];
	temp2 = g[i__ - 1] - g[i__ - 2] - sigma * gdif;
	temp3 = c__[i__ - 1] - c__[i__ - 2] + rmu * gdif;
	i__2 = *neqn;
	for (l = 1; l <= i__2; ++l) {
	    yout[l] += temp2 * phi[l + i__ * phi_dim1];
/* L110: */
	    ypout[l] += temp3 * phi[l + i__ * phi_dim1];
	}
/* L120: */
    }
    i__1 = *neqn;
    for (l = 1; l <= i__1; ++l) {
	yout[l] = (1. - sigma) * oy[l] + sigma * y[l] + h__ * (yout[l] + (g[0]
		 - sigma * og[1]) * phi[l + phi_dim1]);
/* L130: */
	ypout[l] = hmu * (oy[l] - y[l]) + (ypout[l] + (c__[0] + rmu * og[1]) *
		 phi[l + phi_dim1]);
    }

    return 0;
} /* dintp_ */

/* DECK XERMSG */
/* Subroutine */ int xermsg_(char *librar, char *subrou, char *messg, integer 
	*nerr, integer *level, ftnlen librar_len, ftnlen subrou_len, ftnlen 
	messg_len)
{
    /* System generated locals */
    address a__1[2];
    integer i__1, i__2, i__3[2];
    char ch__1[87];
    icilist ici__1;

    /* Builtin functions */
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);
    integer i_len(char *, ftnlen), s_wsfi(icilist *), do_fio(integer *, char *
	    , ftnlen), e_wsfi(void);
    /* Subroutine */ int s_cat(char *, char **, integer *, integer *, ftnlen);

    /* Local variables */
    integer i__, lerr;
    char temp[72];
    extern /* Subroutine */ int fdump_(void);
    char xlibr[8];
    integer ltemp, kount;
    char xsubr[8];
    extern integer j4save_(integer *, integer *, logical *);
    integer llevel, maxmes;
    char lfirst[20];
    extern /* Subroutine */ int xercnt_(char *, char *, char *, integer *, 
	    integer *, integer *, ftnlen, ftnlen, ftnlen);
    integer lkntrl, kdummy;
    extern /* Subroutine */ int xerhlt_(char *, ftnlen);
    integer mkntrl;
    extern /* Subroutine */ int xersve_(char *, char *, char *, integer *, 
	    integer *, integer *, integer *, ftnlen, ftnlen, ftnlen), xerprn_(
	    char *, integer *, char *, integer *, ftnlen, ftnlen);

/* ***BEGIN PROLOGUE  XERMSG */
/* ***PURPOSE  Process error messages for SLATEC and other libraries. */
/* ***LIBRARY   SLATEC (XERROR) */
/* ***CATEGORY  R3C */
/* ***TYPE      ALL (XERMSG-A) */
/* ***KEYWORDS  ERROR MESSAGE, XERROR */
/* ***AUTHOR  Fong, Kirby, (NMFECC at LLNL) */
/* ***DESCRIPTION */

/*   XERMSG processes a diagnostic message in a manner determined by the */
/*   value of LEVEL and the current value of the library error control */
/*   flag, KONTRL.  See subroutine XSETF for details. */

/*    LIBRAR   A character constant (or character variable) with the name */
/*             of the library.  This will be 'SLATEC' for the SLATEC */
/*             Common Math Library.  The error handling package is */
/*             general enough to be used by many libraries */
/*             simultaneously, so it is desirable for the routine that */
/*             detects and reports an error to identify the library name */
/*             as well as the routine name. */

/*    SUBROU   A character constant (or character variable) with the name */
/*             of the routine that detected the error.  Usually it is the */
/*             name of the routine that is calling XERMSG.  There are */
/*             some instances where a user callable library routine calls */
/*             lower level subsidiary routines where the error is */
/*             detected.  In such cases it may be more informative to */
/*             supply the name of the routine the user called rather than */
/*             the name of the subsidiary routine that detected the */
/*             error. */

/*    MESSG    A character constant (or character variable) with the text */
/*             of the error or warning message.  In the example below, */
/*             the message is a character constant that contains a */
/*             generic message. */

/*                   CALL XERMSG ('SLATEC', 'MMPY', */
/*                  *'THE ORDER OF THE MATRIX EXCEEDS THE ROW DIMENSION', */
/*                  *3, 1) */

/*             It is possible (and is sometimes desirable) to generate a */
/*             specific message--e.g., one that contains actual numeric */
/*             values.  Specific numeric values can be converted into */
/*             character strings using formatted WRITE statements into */
/*             character variables.  This is called standard Fortran */
/*             internal file I/O and is exemplified in the first three */
/*             lines of the following example.  You can also catenate */
/*             substrings of characters to construct the error message. */
/*             Here is an example showing the use of both writing to */
/*             an internal file and catenating character strings. */

/*                   CHARACTER*5 CHARN, CHARL */
/*                   WRITE (CHARN,10) N */
/*                   WRITE (CHARL,10) LDA */
/*                10 FORMAT(I5) */
/*                   CALL XERMSG ('SLATEC', 'MMPY', 'THE ORDER'//CHARN// */
/*                  *   ' OF THE MATRIX EXCEEDS ITS ROW DIMENSION OF'// */
/*                  *   CHARL, 3, 1) */

/*             There are two subtleties worth mentioning.  One is that */
/*             the // for character catenation is used to construct the */
/*             error message so that no single character constant is */
/*             continued to the next line.  This avoids confusion as to */
/*             whether there are trailing blanks at the end of the line. */
/*             The second is that by catenating the parts of the message */
/*             as an actual argument rather than encoding the entire */
/*             message into one large character variable, we avoid */
/*             having to know how long the message will be in order to */
/*             declare an adequate length for that large character */
/*             variable.  XERMSG calls XERPRN to print the message using */
/*             multiple lines if necessary.  If the message is very long, */
/*             XERPRN will break it into pieces of 72 characters (as */
/*             requested by XERMSG) for printing on multiple lines. */
/*             Also, XERMSG asks XERPRN to prefix each line with ' *  ' */
/*             so that the total line length could be 76 characters. */
/*             Note also that XERPRN scans the error message backwards */
/*             to ignore trailing blanks.  Another feature is that */
/*             the substring '$$' is treated as a new line sentinel */
/*             by XERPRN.  If you want to construct a multiline */
/*             message without having to count out multiples of 72 */
/*             characters, just use '$$' as a separator.  '$$' */
/*             obviously must occur within 72 characters of the */
/*             start of each line to have its intended effect since */
/*             XERPRN is asked to wrap around at 72 characters in */
/*             addition to looking for '$$'. */

/*    NERR     An integer value that is chosen by the library routine's */
/*             author.  It must be in the range -99 to 999 (three */
/*             printable digits).  Each distinct error should have its */
/*             own error number.  These error numbers should be described */
/*             in the machine readable documentation for the routine. */
/*             The error numbers need be unique only within each routine, */
/*             so it is reasonable for each routine to start enumerating */
/*             errors from 1 and proceeding to the next integer. */

/*    LEVEL    An integer value in the range 0 to 2 that indicates the */
/*             level (severity) of the error.  Their meanings are */

/*            -1  A warning message.  This is used if it is not clear */
/*                that there really is an error, but the user's attention */
/*                may be needed.  An attempt is made to only print this */
/*                message once. */

/*             0  A warning message.  This is used if it is not clear */
/*                that there really is an error, but the user's attention */
/*                may be needed. */

/*             1  A recoverable error.  This is used even if the error is */
/*                so serious that the routine cannot return any useful */
/*                answer.  If the user has told the error package to */
/*                return after recoverable errors, then XERMSG will */
/*                return to the Library routine which can then return to */
/*                the user's routine.  The user may also permit the error */
/*                package to terminate the program upon encountering a */
/*                recoverable error. */

/*             2  A fatal error.  XERMSG will not return to its caller */
/*                after it receives a fatal error.  This level should */
/*                hardly ever be used; it is much better to allow the */
/*                user a chance to recover.  An example of one of the few */
/*                cases in which it is permissible to declare a level 2 */
/*                error is a reverse communication Library routine that */
/*                is likely to be called repeatedly until it integrates */
/*                across some interval.  If there is a serious error in */
/*                the input such that another step cannot be taken and */
/*                the Library routine is called again without the input */
/*                error having been corrected by the caller, the Library */
/*                routine will probably be called forever with improper */
/*                input.  In this case, it is reasonable to declare the */
/*                error to be fatal. */

/*    Each of the arguments to XERMSG is input; none will be modified by */
/*    XERMSG.  A routine may make multiple calls to XERMSG with warning */
/*    level messages; however, after a call to XERMSG with a recoverable */
/*    error, the routine should return to the user.  Do not try to call */
/*    XERMSG with a second recoverable error after the first recoverable */
/*    error because the error package saves the error number.  The user */
/*    can retrieve this error number by calling another entry point in */
/*    the error handling package and then clear the error number when */
/*    recovering from the error.  Calling XERMSG in succession causes the */
/*    old error number to be overwritten by the latest error number. */
/*    This is considered harmless for error numbers associated with */
/*    warning messages but must not be done for error numbers of serious */
/*    errors.  After a call to XERMSG with a recoverable error, the user */
/*    must be given a chance to call NUMXER or XERCLR to retrieve or */
/*    clear the error number. */
/* ***REFERENCES  R. E. Jones and D. K. Kahaner, XERROR, the SLATEC */
/*                 Error-handling Package, SAND82-0800, Sandia */
/*                 Laboratories, 1982. */
/* ***ROUTINES CALLED  FDUMP, J4SAVE, XERCNT, XERHLT, XERPRN, XERSVE */
/* ***REVISION HISTORY  (YYMMDD) */
/*   880101  DATE WRITTEN */
/*   880621  REVISED AS DIRECTED AT SLATEC CML MEETING OF FEBRUARY 1988. */
/*           THERE ARE TWO BASIC CHANGES. */
/*           1.  A NEW ROUTINE, XERPRN, IS USED INSTEAD OF XERPRT TO */
/*               PRINT MESSAGES.  THIS ROUTINE WILL BREAK LONG MESSAGES */
/*               INTO PIECES FOR PRINTING ON MULTIPLE LINES.  '$$' IS */
/*               ACCEPTED AS A NEW LINE SENTINEL.  A PREFIX CAN BE */
/*               ADDED TO EACH LINE TO BE PRINTED.  XERMSG USES EITHER */
/*               ' ***' OR ' *  ' AND LONG MESSAGES ARE BROKEN EVERY */
/*               72 CHARACTERS (AT MOST) SO THAT THE MAXIMUM LINE */
/*               LENGTH OUTPUT CAN NOW BE AS GREAT AS 76. */
/*           2.  THE TEXT OF ALL MESSAGES IS NOW IN UPPER CASE SINCE THE */
/*               FORTRAN STANDARD DOCUMENT DOES NOT ADMIT THE EXISTENCE */
/*               OF LOWER CASE. */
/*   880708  REVISED AFTER THE SLATEC CML MEETING OF JUNE 29 AND 30. */
/*           THE PRINCIPAL CHANGES ARE */
/*           1.  CLARIFY COMMENTS IN THE PROLOGUES */
/*           2.  RENAME XRPRNT TO XERPRN */
/*           3.  REWORK HANDLING OF '$$' IN XERPRN TO HANDLE BLANK LINES */
/*               SIMILAR TO THE WAY FORMAT STATEMENTS HANDLE THE / */
/*               CHARACTER FOR NEW RECORDS. */
/*   890706  REVISED WITH THE HELP OF FRED FRITSCH AND REG CLEMENS TO */
/*           CLEAN UP THE CODING. */
/*   890721  REVISED TO USE NEW FEATURE IN XERPRN TO COUNT CHARACTERS IN */
/*           PREFIX. */
/*   891013  REVISED TO CORRECT COMMENTS. */
/*   891214  Prologue converted to Version 4.0 format.  (WRB) */
/*   900510  Changed test on NERR to be -9999999 < NERR < 99999999, but */
/*           NERR .ne. 0, and on LEVEL to be -2 < LEVEL < 3.  Added */
/*           LEVEL=-1 logic, changed calls to XERSAV to XERSVE, and */
/*           XERCTL to XERCNT.  (RWC) */
/*   920501  Reformatted the REFERENCES section.  (WRB) */
/* ***END PROLOGUE  XERMSG */
/* ***FIRST EXECUTABLE STATEMENT  XERMSG */
    lkntrl = j4save_(&c__2, &c__0, &c_false);
    maxmes = j4save_(&c__4, &c__0, &c_false);

/*       LKNTRL IS A LOCAL COPY OF THE CONTROL FLAG KONTRL. */
/*       MAXMES IS THE MAXIMUM NUMBER OF TIMES ANY PARTICULAR MESSAGE */
/*          SHOULD BE PRINTED. */

/*       WE PRINT A FATAL ERROR MESSAGE AND TERMINATE FOR AN ERROR IN */
/*          CALLING XERMSG.  THE ERROR NUMBER SHOULD BE POSITIVE, */
/*          AND THE LEVEL SHOULD BE BETWEEN 0 AND 2. */

    if (*nerr < -9999999 || *nerr > 99999999 || *nerr == 0 || *level < -1 || *
	    level > 2) {
	xerprn_(" ***", &c_n1, "FATAL ERROR IN...$$ XERMSG -- INVALID ERROR "
		"NUMBER OR LEVEL$$ JOB ABORT DUE TO FATAL ERROR.", &c__72, (
		ftnlen)4, (ftnlen)91);
	xersve_(" ", " ", " ", &c__0, &c__0, &c__0, &kdummy, (ftnlen)1, (
		ftnlen)1, (ftnlen)1);
	xerhlt_(" ***XERMSG -- INVALID INPUT", (ftnlen)27);
	return 0;
    }

/*       RECORD THE MESSAGE. */

    i__ = j4save_(&c__1, nerr, &c_true);
    xersve_(librar, subrou, messg, &c__1, nerr, level, &kount, librar_len, 
	    subrou_len, messg_len);

/*       HANDLE PRINT-ONCE WARNING MESSAGES. */

    if (*level == -1 && kount > 1) {
	return 0;
    }

/*       ALLOW TEMPORARY USER OVERRIDE OF THE CONTROL FLAG. */

    s_copy(xlibr, librar, (ftnlen)8, librar_len);
    s_copy(xsubr, subrou, (ftnlen)8, subrou_len);
    s_copy(lfirst, messg, (ftnlen)20, messg_len);
    lerr = *nerr;
    llevel = *level;
    xercnt_(xlibr, xsubr, lfirst, &lerr, &llevel, &lkntrl, (ftnlen)8, (ftnlen)
	    8, (ftnlen)20);

/* Computing MAX */
    i__1 = -2, i__2 = min(2,lkntrl);
    lkntrl = max(i__1,i__2);
    mkntrl = abs(lkntrl);

/*       SKIP PRINTING IF THE CONTROL FLAG VALUE AS RESET IN XERCNT IS */
/*       ZERO AND THE ERROR IS NOT FATAL. */

    if (*level < 2 && lkntrl == 0) {
	goto L30;
    }
    if (*level == 0 && kount > maxmes) {
	goto L30;
    }
    if (*level == 1 && kount > maxmes && mkntrl == 1) {
	goto L30;
    }
    if (*level == 2 && kount > max(1,maxmes)) {
	goto L30;
    }

/*       ANNOUNCE THE NAMES OF THE LIBRARY AND SUBROUTINE BY BUILDING A */
/*       MESSAGE IN CHARACTER VARIABLE TEMP (NOT EXCEEDING 66 CHARACTERS) */
/*       AND SENDING IT OUT VIA XERPRN.  PRINT ONLY IF CONTROL FLAG */
/*       IS NOT ZERO. */

    if (lkntrl != 0) {
	s_copy(temp, "MESSAGE FROM ROUTINE ", (ftnlen)21, (ftnlen)21);
/* Computing MIN */
	i__1 = i_len(subrou, subrou_len);
	i__ = min(i__1,16);
	s_copy(temp + 21, subrou, i__, i__);
	i__1 = i__ + 21;
	s_copy(temp + i__1, " IN LIBRARY ", i__ + 33 - i__1, (ftnlen)12);
	ltemp = i__ + 33;
/* Computing MIN */
	i__1 = i_len(librar, librar_len);
	i__ = min(i__1,16);
	i__1 = ltemp;
	s_copy(temp + i__1, librar, ltemp + i__ - i__1, i__);
	i__1 = ltemp + i__;
	s_copy(temp + i__1, ".", ltemp + i__ + 1 - i__1, (ftnlen)1);
	ltemp = ltemp + i__ + 1;
	xerprn_(" ***", &c_n1, temp, &c__72, (ftnlen)4, ltemp);
    }

/*       IF LKNTRL IS POSITIVE, PRINT AN INTRODUCTORY LINE BEFORE */
/*       PRINTING THE MESSAGE.  THE INTRODUCTORY LINE TELLS THE CHOICE */
/*       FROM EACH OF THE FOLLOWING THREE OPTIONS. */
/*       1.  LEVEL OF THE MESSAGE */
/*              'INFORMATIVE MESSAGE' */
/*              'POTENTIALLY RECOVERABLE ERROR' */
/*              'FATAL ERROR' */
/*       2.  WHETHER CONTROL FLAG WILL ALLOW PROGRAM TO CONTINUE */
/*              'PROG CONTINUES' */
/*              'PROG ABORTED' */
/*       3.  WHETHER OR NOT A TRACEBACK WAS REQUESTED.  (THE TRACEBACK */
/*           MAY NOT BE IMPLEMENTED AT SOME SITES, SO THIS ONLY TELLS */
/*           WHAT WAS REQUESTED, NOT WHAT WAS DELIVERED.) */
/*              'TRACEBACK REQUESTED' */
/*              'TRACEBACK NOT REQUESTED' */
/*       NOTICE THAT THE LINE INCLUDING FOUR PREFIX CHARACTERS WILL NOT */
/*       EXCEED 74 CHARACTERS. */
/*       WE SKIP THE NEXT BLOCK IF THE INTRODUCTORY LINE IS NOT NEEDED. */

    if (lkntrl > 0) {

/*       THE FIRST PART OF THE MESSAGE TELLS ABOUT THE LEVEL. */

	if (*level <= 0) {
	    s_copy(temp, "INFORMATIVE MESSAGE,", (ftnlen)20, (ftnlen)20);
	    ltemp = 20;
	} else if (*level == 1) {
	    s_copy(temp, "POTENTIALLY RECOVERABLE ERROR,", (ftnlen)30, (
		    ftnlen)30);
	    ltemp = 30;
	} else {
	    s_copy(temp, "FATAL ERROR,", (ftnlen)12, (ftnlen)12);
	    ltemp = 12;
	}

/*       THEN WHETHER THE PROGRAM WILL CONTINUE. */

	if (mkntrl == 2 && *level >= 1 || mkntrl == 1 && *level == 2) {
	    i__1 = ltemp;
	    s_copy(temp + i__1, " PROG ABORTED,", ltemp + 14 - i__1, (ftnlen)
		    14);
	    ltemp += 14;
	} else {
	    i__1 = ltemp;
	    s_copy(temp + i__1, " PROG CONTINUES,", ltemp + 16 - i__1, (
		    ftnlen)16);
	    ltemp += 16;
	}

/*       FINALLY TELL WHETHER THERE SHOULD BE A TRACEBACK. */

	if (lkntrl > 0) {
	    i__1 = ltemp;
	    s_copy(temp + i__1, " TRACEBACK REQUESTED", ltemp + 20 - i__1, (
		    ftnlen)20);
	    ltemp += 20;
	} else {
	    i__1 = ltemp;
	    s_copy(temp + i__1, " TRACEBACK NOT REQUESTED", ltemp + 24 - i__1,
		     (ftnlen)24);
	    ltemp += 24;
	}
	xerprn_(" ***", &c_n1, temp, &c__72, (ftnlen)4, ltemp);
    }

/*       NOW SEND OUT THE MESSAGE. */

    xerprn_(" *  ", &c_n1, messg, &c__72, (ftnlen)4, messg_len);

/*       IF LKNTRL IS POSITIVE, WRITE THE ERROR NUMBER AND REQUEST A */
/*          TRACEBACK. */

    if (lkntrl > 0) {
	ici__1.icierr = 0;
	ici__1.icirnum = 1;
	ici__1.icirlen = 72;
	ici__1.iciunit = temp;
	ici__1.icifmt = "('ERROR NUMBER = ', I8)";
	s_wsfi(&ici__1);
	do_fio(&c__1, (char *)&(*nerr), (ftnlen)sizeof(integer));
	e_wsfi();
	for (i__ = 16; i__ <= 22; ++i__) {
	    if (*(unsigned char *)&temp[i__ - 1] != ' ') {
		goto L20;
	    }
/* L10: */
	}

L20:
/* Writing concatenation */
	i__3[0] = 15, a__1[0] = temp;
	i__3[1] = 23 - (i__ - 1), a__1[1] = temp + (i__ - 1);
	s_cat(ch__1, a__1, i__3, &c__2, (ftnlen)87);
	xerprn_(" *  ", &c_n1, ch__1, &c__72, (ftnlen)4, 23 - (i__ - 1) + 15);
	fdump_();
    }

/*       IF LKNTRL IS NOT ZERO, PRINT A BLANK LINE AND AN END OF MESSAGE. */

    if (lkntrl != 0) {
	xerprn_(" *  ", &c_n1, " ", &c__72, (ftnlen)4, (ftnlen)1);
	xerprn_(" ***", &c_n1, "END OF MESSAGE", &c__72, (ftnlen)4, (ftnlen)
		14);
	xerprn_("    ", &c__0, " ", &c__72, (ftnlen)4, (ftnlen)1);
    }

/*       IF THE ERROR IS NOT FATAL OR THE ERROR IS RECOVERABLE AND THE */
/*       CONTROL FLAG IS SET FOR RECOVERY, THEN RETURN. */

L30:
    if (*level <= 0 || *level == 1 && mkntrl <= 1) {
	return 0;
    }

/*       THE PROGRAM WILL BE STOPPED DUE TO AN UNRECOVERED ERROR OR A */
/*       FATAL ERROR.  PRINT THE REASON FOR THE ABORT AND THE ERROR */
/*       SUMMARY IF THE CONTROL FLAG AND THE MAXIMUM ERROR COUNT PERMIT. */

    if (lkntrl > 0 && kount < max(1,maxmes)) {
	if (*level == 1) {
	    xerprn_(" ***", &c_n1, "JOB ABORT DUE TO UNRECOVERED ERROR.", &
		    c__72, (ftnlen)4, (ftnlen)35);
	} else {
	    xerprn_(" ***", &c_n1, "JOB ABORT DUE TO FATAL ERROR.", &c__72, (
		    ftnlen)4, (ftnlen)29);
	}
	xersve_(" ", " ", " ", &c_n1, &c__0, &c__0, &kdummy, (ftnlen)1, (
		ftnlen)1, (ftnlen)1);
	xerhlt_(" ", (ftnlen)1);
    } else {
	xerhlt_(messg, messg_len);
    }
    return 0;
} /* xermsg_ */

/* DECK XERPRN */
/* Subroutine */ int xerprn_(char *prefix, integer *npref, char *messg, 
	integer *nwrap, ftnlen prefix_len, ftnlen messg_len)
{
    /* System generated locals */
    integer i__1, i__2;
    cilist ci__1;

    /* Builtin functions */
    integer i_len(char *, ftnlen);
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);
    integer s_wsfe(cilist *), do_fio(integer *, char *, ftnlen), e_wsfe(void),
	     i_indx(char *, char *, ftnlen, ftnlen), s_cmp(char *, char *, 
	    ftnlen, ftnlen);

    /* Local variables */
    integer i__, n, iu[5];
    char cbuff[148];
    integer lpref, nextc, lwrap, nunit;
    extern integer i1mach_(integer *);
    integer lpiece, idelta, lenmsg;
    extern /* Subroutine */ int xgetua_(integer *, integer *);

/* ***BEGIN PROLOGUE  XERPRN */
/* ***SUBSIDIARY */
/* ***PURPOSE  Print error messages processed by XERMSG. */
/* ***LIBRARY   SLATEC (XERROR) */
/* ***CATEGORY  R3C */
/* ***TYPE      ALL (XERPRN-A) */
/* ***KEYWORDS  ERROR MESSAGES, PRINTING, XERROR */
/* ***AUTHOR  Fong, Kirby, (NMFECC at LLNL) */
/* ***DESCRIPTION */

/* This routine sends one or more lines to each of the (up to five) */
/* logical units to which error messages are to be sent.  This routine */
/* is called several times by XERMSG, sometimes with a single line to */
/* print and sometimes with a (potentially very long) message that may */
/* wrap around into multiple lines. */

/* PREFIX  Input argument of type CHARACTER.  This argument contains */
/*         characters to be put at the beginning of each line before */
/*         the body of the message.  No more than 16 characters of */
/*         PREFIX will be used. */

/* NPREF   Input argument of type INTEGER.  This argument is the number */
/*         of characters to use from PREFIX.  If it is negative, the */
/*         intrinsic function LEN is used to determine its length.  If */
/*         it is zero, PREFIX is not used.  If it exceeds 16 or if */
/*         LEN(PREFIX) exceeds 16, only the first 16 characters will be */
/*         used.  If NPREF is positive and the length of PREFIX is less */
/*         than NPREF, a copy of PREFIX extended with blanks to length */
/*         NPREF will be used. */

/* MESSG   Input argument of type CHARACTER.  This is the text of a */
/*         message to be printed.  If it is a long message, it will be */
/*         broken into pieces for printing on multiple lines.  Each line */
/*         will start with the appropriate prefix and be followed by a */
/*         piece of the message.  NWRAP is the number of characters per */
/*         piece; that is, after each NWRAP characters, we break and */
/*         start a new line.  In addition the characters '$$' embedded */
/*         in MESSG are a sentinel for a new line.  The counting of */
/*         characters up to NWRAP starts over for each new line.  The */
/*         value of NWRAP typically used by XERMSG is 72 since many */
/*         older error messages in the SLATEC Library are laid out to */
/*         rely on wrap-around every 72 characters. */

/* NWRAP   Input argument of type INTEGER.  This gives the maximum size */
/*         piece into which to break MESSG for printing on multiple */
/*         lines.  An embedded '$$' ends a line, and the count restarts */
/*         at the following character.  If a line break does not occur */
/*         on a blank (it would split a word) that word is moved to the */
/*         next line.  Values of NWRAP less than 16 will be treated as */
/*         16.  Values of NWRAP greater than 132 will be treated as 132. */
/*         The actual line length will be NPREF + NWRAP after NPREF has */
/*         been adjusted to fall between 0 and 16 and NWRAP has been */
/*         adjusted to fall between 16 and 132. */

/* ***REFERENCES  R. E. Jones and D. K. Kahaner, XERROR, the SLATEC */
/*                 Error-handling Package, SAND82-0800, Sandia */
/*                 Laboratories, 1982. */
/* ***ROUTINES CALLED  I1MACH, XGETUA */
/* ***REVISION HISTORY  (YYMMDD) */
/*   880621  DATE WRITTEN */
/*   880708  REVISED AFTER THE SLATEC CML SUBCOMMITTEE MEETING OF */
/*           JUNE 29 AND 30 TO CHANGE THE NAME TO XERPRN AND TO REWORK */
/*           THE HANDLING OF THE NEW LINE SENTINEL TO BEHAVE LIKE THE */
/*           SLASH CHARACTER IN FORMAT STATEMENTS. */
/*   890706  REVISED WITH THE HELP OF FRED FRITSCH AND REG CLEMENS TO */
/*           STREAMLINE THE CODING AND FIX A BUG THAT CAUSED EXTRA BLANK */
/*           LINES TO BE PRINTED. */
/*   890721  REVISED TO ADD A NEW FEATURE.  A NEGATIVE VALUE OF NPREF */
/*           CAUSES LEN(PREFIX) TO BE USED AS THE LENGTH. */
/*   891013  REVISED TO CORRECT ERROR IN CALCULATING PREFIX LENGTH. */
/*   891214  Prologue converted to Version 4.0 format.  (WRB) */
/*   900510  Added code to break messages between words.  (RWC) */
/*   920501  Reformatted the REFERENCES section.  (WRB) */
/* ***END PROLOGUE  XERPRN */
/* ***FIRST EXECUTABLE STATEMENT  XERPRN */
    xgetua_(iu, &nunit);

/*       A ZERO VALUE FOR A LOGICAL UNIT NUMBER MEANS TO USE THE STANDARD */
/*       ERROR MESSAGE UNIT INSTEAD.  I1MACH(4) RETRIEVES THE STANDARD */
/*       ERROR MESSAGE UNIT. */

    n = i1mach_(&c__4);
    i__1 = nunit;
    for (i__ = 1; i__ <= i__1; ++i__) {
	if (iu[i__ - 1] == 0) {
	    iu[i__ - 1] = n;
	}
/* L10: */
    }

/*       LPREF IS THE LENGTH OF THE PREFIX.  THE PREFIX IS PLACED AT THE */
/*       BEGINNING OF CBUFF, THE CHARACTER BUFFER, AND KEPT THERE DURING */
/*       THE REST OF THIS ROUTINE. */

    if (*npref < 0) {
	lpref = i_len(prefix, prefix_len);
    } else {
	lpref = *npref;
    }
    lpref = min(16,lpref);
    if (lpref != 0) {
	s_copy(cbuff, prefix, lpref, prefix_len);
    }

/*       LWRAP IS THE MAXIMUM NUMBER OF CHARACTERS WE WANT TO TAKE AT ONE */
/*       TIME FROM MESSG TO PRINT ON ONE LINE. */

/* Computing MAX */
    i__1 = 16, i__2 = min(132,*nwrap);
    lwrap = max(i__1,i__2);

/*       SET LENMSG TO THE LENGTH OF MESSG, IGNORE ANY TRAILING BLANKS. */

    lenmsg = i_len(messg, messg_len);
    n = lenmsg;
    i__1 = n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	if (*(unsigned char *)&messg[lenmsg - 1] != ' ') {
	    goto L30;
	}
	--lenmsg;
/* L20: */
    }
L30:

/*       IF THE MESSAGE IS ALL BLANKS, THEN PRINT ONE BLANK LINE. */

    if (lenmsg == 0) {
	i__1 = lpref;
	s_copy(cbuff + i__1, " ", lpref + 1 - i__1, (ftnlen)1);
	i__1 = nunit;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    ci__1.cierr = 0;
	    ci__1.ciunit = iu[i__ - 1];
	    ci__1.cifmt = "(A)";
	    s_wsfe(&ci__1);
	    do_fio(&c__1, cbuff, lpref + 1);
	    e_wsfe();
/* L40: */
	}
	return 0;
    }

/*       SET NEXTC TO THE POSITION IN MESSG WHERE THE NEXT SUBSTRING */
/*       STARTS.  FROM THIS POSITION WE SCAN FOR THE NEW LINE SENTINEL. */
/*       WHEN NEXTC EXCEEDS LENMSG, THERE IS NO MORE TO PRINT. */
/*       WE LOOP BACK TO LABEL 50 UNTIL ALL PIECES HAVE BEEN PRINTED. */

/*       WE LOOK FOR THE NEXT OCCURRENCE OF THE NEW LINE SENTINEL.  THE */
/*       INDEX INTRINSIC FUNCTION RETURNS ZERO IF THERE IS NO OCCURRENCE */
/*       OR IF THE LENGTH OF THE FIRST ARGUMENT IS LESS THAN THE LENGTH */
/*       OF THE SECOND ARGUMENT. */

/*       THERE ARE SEVERAL CASES WHICH SHOULD BE CHECKED FOR IN THE */
/*       FOLLOWING ORDER.  WE ARE ATTEMPTING TO SET LPIECE TO THE NUMBER */
/*       OF CHARACTERS THAT SHOULD BE TAKEN FROM MESSG STARTING AT */
/*       POSITION NEXTC. */

/*       LPIECE .EQ. 0   THE NEW LINE SENTINEL DOES NOT OCCUR IN THE */
/*                       REMAINDER OF THE CHARACTER STRING.  LPIECE */
/*                       SHOULD BE SET TO LWRAP OR LENMSG+1-NEXTC, */
/*                       WHICHEVER IS LESS. */

/*       LPIECE .EQ. 1   THE NEW LINE SENTINEL STARTS AT MESSG(NEXTC: */
/*                       NEXTC).  LPIECE IS EFFECTIVELY ZERO, AND WE */
/*                       PRINT NOTHING TO AVOID PRODUCING UNNECESSARY */
/*                       BLANK LINES.  THIS TAKES CARE OF THE SITUATION */
/*                       WHERE THE LIBRARY ROUTINE HAS A MESSAGE OF */
/*                       EXACTLY 72 CHARACTERS FOLLOWED BY A NEW LINE */
/*                       SENTINEL FOLLOWED BY MORE CHARACTERS.  NEXTC */
/*                       SHOULD BE INCREMENTED BY 2. */

/*       LPIECE .GT. LWRAP+1  REDUCE LPIECE TO LWRAP. */

/*       ELSE            THIS LAST CASE MEANS 2 .LE. LPIECE .LE. LWRAP+1 */
/*                       RESET LPIECE = LPIECE-1.  NOTE THAT THIS */
/*                       PROPERLY HANDLES THE END CASE WHERE LPIECE .EQ. */
/*                       LWRAP+1.  THAT IS, THE SENTINEL FALLS EXACTLY */
/*                       AT THE END OF A LINE. */

    nextc = 1;
L50:
    lpiece = i_indx(messg + (nextc - 1), "$$", lenmsg - (nextc - 1), (ftnlen)
	    2);
    if (lpiece == 0) {

/*       THERE WAS NO NEW LINE SENTINEL FOUND. */

	idelta = 0;
/* Computing MIN */
	i__1 = lwrap, i__2 = lenmsg + 1 - nextc;
	lpiece = min(i__1,i__2);
	if (lpiece < lenmsg + 1 - nextc) {
	    for (i__ = lpiece + 1; i__ >= 2; --i__) {
		i__1 = nextc + i__ - 2;
		if (s_cmp(messg + i__1, " ", nextc + i__ - 1 - i__1, (ftnlen)
			1) == 0) {
		    lpiece = i__ - 1;
		    idelta = 1;
		    goto L54;
		}
/* L52: */
	    }
	}
L54:
	i__1 = lpref;
	s_copy(cbuff + i__1, messg + (nextc - 1), lpref + lpiece - i__1, 
		nextc + lpiece - 1 - (nextc - 1));
	nextc = nextc + lpiece + idelta;
    } else if (lpiece == 1) {

/*       WE HAVE A NEW LINE SENTINEL AT MESSG(NEXTC:NEXTC+1). */
/*       DON'T PRINT A BLANK LINE. */

	nextc += 2;
	goto L50;
    } else if (lpiece > lwrap + 1) {

/*       LPIECE SHOULD BE SET DOWN TO LWRAP. */

	idelta = 0;
	lpiece = lwrap;
	for (i__ = lpiece + 1; i__ >= 2; --i__) {
	    i__1 = nextc + i__ - 2;
	    if (s_cmp(messg + i__1, " ", nextc + i__ - 1 - i__1, (ftnlen)1) ==
		     0) {
		lpiece = i__ - 1;
		idelta = 1;
		goto L58;
	    }
/* L56: */
	}
L58:
	i__1 = lpref;
	s_copy(cbuff + i__1, messg + (nextc - 1), lpref + lpiece - i__1, 
		nextc + lpiece - 1 - (nextc - 1));
	nextc = nextc + lpiece + idelta;
    } else {

/*       IF WE ARRIVE HERE, IT MEANS 2 .LE. LPIECE .LE. LWRAP+1. */
/*       WE SHOULD DECREMENT LPIECE BY ONE. */

	--lpiece;
	i__1 = lpref;
	s_copy(cbuff + i__1, messg + (nextc - 1), lpref + lpiece - i__1, 
		nextc + lpiece - 1 - (nextc - 1));
	nextc = nextc + lpiece + 2;
    }

/*       PRINT */

    i__1 = nunit;
    for (i__ = 1; i__ <= i__1; ++i__) {
	ci__1.cierr = 0;
	ci__1.ciunit = iu[i__ - 1];
	ci__1.cifmt = "(A)";
	s_wsfe(&ci__1);
	do_fio(&c__1, cbuff, lpref + lpiece);
	e_wsfe();
/* L60: */
    }

    if (nextc <= lenmsg) {
	goto L50;
    }
    return 0;
} /* xerprn_ */

/* DECK XERSVE */
/* Subroutine */ int xersve_(char *librar, char *subrou, char *messg, integer 
	*kflag, integer *nerr, integer *level, integer *icount, ftnlen 
	librar_len, ftnlen subrou_len, ftnlen messg_len)
{
    /* Initialized data */

    static integer kountx = 0;
    static integer nmsg = 0;

    /* Format strings */
    static char fmt_9000[] = "(\0020          ERROR MESSAGE SUMMARY\002/\002"
	    " LIBRARY    SUBROUTINE MESSAGE START             NERR\002,\002  "
	    "   LEVEL     COUNT\002)";
    static char fmt_9010[] = "(1x,a,3x,a,3x,a,3i10)";
    static char fmt_9020[] = "(\0020OTHER ERRORS NOT INDIVIDUALLY TABULATED "
	    "= \002,i10)";
    static char fmt_9030[] = "(1x)";

    /* System generated locals */
    integer i__1, i__2;

    /* Builtin functions */
    integer s_wsfe(cilist *), e_wsfe(void), do_fio(integer *, char *, ftnlen);
    /* Subroutine */ int s_copy(char *, char *, ftnlen, ftnlen);
    integer s_cmp(char *, char *, ftnlen, ftnlen);

    /* Local variables */
    integer i__;
    char lib[8], mes[20], sub[8];
    integer lun[5], iunit, kunit, nunit;
    static integer kount[10];
    extern integer i1mach_(integer *);
    static char libtab[8*10], mestab[20*10];
    static integer nertab[10], levtab[10];
    static char subtab[8*10];
    extern /* Subroutine */ int xgetua_(integer *, integer *);

    /* Fortran I/O blocks */
    static cilist io___102 = { 0, 0, 0, fmt_9000, 0 };
    static cilist io___104 = { 0, 0, 0, fmt_9010, 0 };
    static cilist io___111 = { 0, 0, 0, fmt_9020, 0 };
    static cilist io___112 = { 0, 0, 0, fmt_9030, 0 };


/* ***BEGIN PROLOGUE  XERSVE */
/* ***SUBSIDIARY */
/* ***PURPOSE  Record that an error has occurred. */
/* ***LIBRARY   SLATEC (XERROR) */
/* ***CATEGORY  R3 */
/* ***TYPE      ALL (XERSVE-A) */
/* ***KEYWORDS  ERROR, XERROR */
/* ***AUTHOR  Jones, R. E., (SNLA) */
/* ***DESCRIPTION */

/* *Usage: */

/*        INTEGER  KFLAG, NERR, LEVEL, ICOUNT */
/*        CHARACTER * (len) LIBRAR, SUBROU, MESSG */

/*        CALL XERSVE (LIBRAR, SUBROU, MESSG, KFLAG, NERR, LEVEL, ICOUNT) */

/* *Arguments: */

/*        LIBRAR :IN    is the library that the message is from. */
/*        SUBROU :IN    is the subroutine that the message is from. */
/*        MESSG  :IN    is the message to be saved. */
/*        KFLAG  :IN    indicates the action to be performed. */
/*                      when KFLAG > 0, the message in MESSG is saved. */
/*                      when KFLAG=0 the tables will be dumped and */
/*                      cleared. */
/*                      when KFLAG < 0, the tables will be dumped and */
/*                      not cleared. */
/*        NERR   :IN    is the error number. */
/*        LEVEL  :IN    is the error severity. */
/*        ICOUNT :OUT   the number of times this message has been seen, */
/*                      or zero if the table has overflowed and does not */
/*                      contain this message specifically.  When KFLAG=0, */
/*                      ICOUNT will not be altered. */

/* *Description: */

/*   Record that this error occurred and possibly dump and clear the */
/*   tables. */

/* ***REFERENCES  R. E. Jones and D. K. Kahaner, XERROR, the SLATEC */
/*                 Error-handling Package, SAND82-0800, Sandia */
/*                 Laboratories, 1982. */
/* ***ROUTINES CALLED  I1MACH, XGETUA */
/* ***REVISION HISTORY  (YYMMDD) */
/*   800319  DATE WRITTEN */
/*   861211  REVISION DATE from Version 3.2 */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900413  Routine modified to remove reference to KFLAG.  (WRB) */
/*   900510  Changed to add LIBRARY NAME and SUBROUTINE to calling */
/*           sequence, use IF-THEN-ELSE, make number of saved entries */
/*           easily changeable, changed routine name from XERSAV to */
/*           XERSVE.  (RWC) */
/*   910626  Added LIBTAB and SUBTAB to SAVE statement.  (BKS) */
/*   920501  Reformatted the REFERENCES section.  (WRB) */
/* ***END PROLOGUE  XERSVE */
/* ***FIRST EXECUTABLE STATEMENT  XERSVE */

    if (*kflag <= 0) {

/*        Dump the table. */

	if (nmsg == 0) {
	    return 0;
	}

/*        Print to each unit. */

	xgetua_(lun, &nunit);
	i__1 = nunit;
	for (kunit = 1; kunit <= i__1; ++kunit) {
	    iunit = lun[kunit - 1];
	    if (iunit == 0) {
		iunit = i1mach_(&c__4);
	    }

/*           Print the table header. */

	    io___102.ciunit = iunit;
	    s_wsfe(&io___102);
	    e_wsfe();

/*           Print body of table. */

	    i__2 = nmsg;
	    for (i__ = 1; i__ <= i__2; ++i__) {
		io___104.ciunit = iunit;
		s_wsfe(&io___104);
		do_fio(&c__1, libtab + (i__ - 1 << 3), (ftnlen)8);
		do_fio(&c__1, subtab + (i__ - 1 << 3), (ftnlen)8);
		do_fio(&c__1, mestab + (i__ - 1) * 20, (ftnlen)20);
		do_fio(&c__1, (char *)&nertab[i__ - 1], (ftnlen)sizeof(
			integer));
		do_fio(&c__1, (char *)&levtab[i__ - 1], (ftnlen)sizeof(
			integer));
		do_fio(&c__1, (char *)&kount[i__ - 1], (ftnlen)sizeof(integer)
			);
		e_wsfe();
/* L10: */
	    }

/*           Print number of other errors. */

	    if (kountx != 0) {
		io___111.ciunit = iunit;
		s_wsfe(&io___111);
		do_fio(&c__1, (char *)&kountx, (ftnlen)sizeof(integer));
		e_wsfe();
	    }
	    io___112.ciunit = iunit;
	    s_wsfe(&io___112);
	    e_wsfe();
/* L20: */
	}

/*        Clear the error tables. */

	if (*kflag == 0) {
	    nmsg = 0;
	    kountx = 0;
	}
    } else {

/*        PROCESS A MESSAGE... */
/*        SEARCH FOR THIS MESSG, OR ELSE AN EMPTY SLOT FOR THIS MESSG, */
/*        OR ELSE DETERMINE THAT THE ERROR TABLE IS FULL. */

	s_copy(lib, librar, (ftnlen)8, librar_len);
	s_copy(sub, subrou, (ftnlen)8, subrou_len);
	s_copy(mes, messg, (ftnlen)20, messg_len);
	i__1 = nmsg;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    if (s_cmp(lib, libtab + (i__ - 1 << 3), (ftnlen)8, (ftnlen)8) == 
		    0 && s_cmp(sub, subtab + (i__ - 1 << 3), (ftnlen)8, (
		    ftnlen)8) == 0 && s_cmp(mes, mestab + (i__ - 1) * 20, (
		    ftnlen)20, (ftnlen)20) == 0 && *nerr == nertab[i__ - 1] &&
		     *level == levtab[i__ - 1]) {
		++kount[i__ - 1];
		*icount = kount[i__ - 1];
		return 0;
	    }
/* L30: */
	}

	if (nmsg < 10) {

/*           Empty slot found for new message. */

	    ++nmsg;
	    s_copy(libtab + (i__ - 1 << 3), lib, (ftnlen)8, (ftnlen)8);
	    s_copy(subtab + (i__ - 1 << 3), sub, (ftnlen)8, (ftnlen)8);
	    s_copy(mestab + (i__ - 1) * 20, mes, (ftnlen)20, (ftnlen)20);
	    nertab[i__ - 1] = *nerr;
	    levtab[i__ - 1] = *level;
	    kount[i__ - 1] = 1;
	    *icount = 1;
	} else {

/*           Table is full. */

	    ++kountx;
	    *icount = 0;
	}
    }
    return 0;

/*     Formats. */

} /* xersve_ */

/* DECK D1MACH */
doublereal d1mach_(integer *i__)
{
    /* Initialized data */

    static doublereal dmach[5] = { 2.23e-308,1.79e308,1.111e-16,2.222e-16,
	    .30102999566398119521 };

    /* System generated locals */
    doublereal ret_val;

    /* Local variables */
    extern /* Subroutine */ int xermsg_(char *, char *, char *, integer *, 
	    integer *, ftnlen, ftnlen, ftnlen);

/* ***BEGIN PROLOGUE  D1MACH */
/* ***PURPOSE  Return floating point machine dependent constants. */
/* ***LIBRARY   SLATEC */
/* ***CATEGORY  R1 */
/* ***TYPE      DOUBLE PRECISION (R1MACH-S, D1MACH-D) */
/* ***KEYWORDS  MACHINE CONSTANTS */
/* ***AUTHOR  Fox, P. A., (Bell Labs) */
/*           Hall, A. D., (Bell Labs) */
/*           Schryer, N. L., (Bell Labs) */
/* ***DESCRIPTION */

/*   D1MACH can be used to obtain machine-dependent parameters for the */
/*   local machine environment.  It is a function subprogram with one */
/*   (input) argument, and can be referenced as follows: */

/*        D = D1MACH(I) */

/*   where I=1,...,5.  The (output) value of D above is determined by */
/*   the (input) value of I.  The results for various values of I are */
/*   discussed below. */

/*   D1MACH( 1) = B**(EMIN-1), the smallest positive magnitude. */
/*   D1MACH( 2) = B**EMAX*(1 - B**(-T)), the largest magnitude. */
/*   D1MACH( 3) = B**(-T), the smallest relative spacing. */
/*   D1MACH( 4) = B**(1-T), the largest relative spacing. */
/*   D1MACH( 5) = LOG10(B) */

/*   Assume double precision numbers are represented in the T-digit, */
/*   base-B form */

/*              sign (B**E)*( (X(1)/B) + ... + (X(T)/B**T) ) */

/*   where 0 .LE. X(I) .LT. B for I=1,...,T, 0 .LT. X(1), and */
/*   EMIN .LE. E .LE. EMAX. */

/*   The values of B, T, EMIN and EMAX are provided in I1MACH as */
/*   follows: */
/*   I1MACH(10) = B, the base. */
/*   I1MACH(14) = T, the number of base-B digits. */
/*   I1MACH(15) = EMIN, the smallest exponent E. */
/*   I1MACH(16) = EMAX, the largest exponent E. */

/*   To alter this function for a particular environment, the desired */
/*   set of DATA statements should be activated by removing the C from */
/*   column 1.  Also, the values of D1MACH(1) - D1MACH(4) should be */
/*   checked for consistency with the local operating system. */

/* ***REFERENCES  P. A. Fox, A. D. Hall and N. L. Schryer, Framework for */
/*                 a portable library, ACM Transactions on Mathematical */
/*                 Software 4, 2 (June 1978), pp. 177-188. */
/* ***ROUTINES CALLED  XERMSG */
/* ***REVISION HISTORY  (YYMMDD) */
/*   750101  DATE WRITTEN */
/*   890213  REVISION DATE from Version 3.2 */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900315  CALLs to XERROR changed to CALLs to XERMSG.  (THJ) */
/*   900618  Added DEC RISC constants.  (WRB) */
/*   900723  Added IBM RS 6000 constants.  (WRB) */
/*   900911  Added SUN 386i constants.  (WRB) */
/*   910710  Added HP 730 constants.  (SMR) */
/*   911114  Added Convex IEEE constants.  (WRB) */
/*   920121  Added SUN -r8 compiler option constants.  (WRB) */
/*   920229  Added Touchstone Delta i860 constants.  (WRB) */
/*   920501  Reformatted the REFERENCES section.  (WRB) */
/*   920625  Added CONVEX -p8 and -pd8 compiler option constants. */
/*           (BKS, WRB) */
/*   930201  Added DEC Alpha and SGI constants.  (RWC and WRB) */
/*   010817  Elevated IEEE to highest importance; see next set of */
/*           comments below.  (DWL) */
/* ***END PROLOGUE  D1MACH */


/* Initial data here correspond to the IEEE standard.  The values for */
/* DMACH(1), DMACH(3) and DMACH(4) are slight upper bounds.  The value */
/* for DMACH(2) is a slight lower bound.  The value for DMACH(5) is */
/* a 20-digit approximation.  If one of the sets of initial data below */
/* is preferred, do the necessary commenting and uncommenting. (DWL) */

/* c      EQUIVALENCE (DMACH(1),SMALL(1)) */
/* c      EQUIVALENCE (DMACH(2),LARGE(1)) */
/* c      EQUIVALENCE (DMACH(3),RIGHT(1)) */
/* c      EQUIVALENCE (DMACH(4),DIVER(1)) */
/* c      EQUIVALENCE (DMACH(5),LOG10(1)) */

/*     MACHINE CONSTANTS FOR THE AMIGA */
/*     ABSOFT FORTRAN COMPILER USING THE 68020/68881 COMPILER OPTION */

/*     DATA SMALL(1), SMALL(2) / Z'00100000', Z'00000000' / */
/*     DATA LARGE(1), LARGE(2) / Z'7FEFFFFF', Z'FFFFFFFF' / */
/*     DATA RIGHT(1), RIGHT(2) / Z'3CA00000', Z'00000000' / */
/*     DATA DIVER(1), DIVER(2) / Z'3CB00000', Z'00000000' / */
/*     DATA LOG10(1), LOG10(2) / Z'3FD34413', Z'509F79FF' / */

/*     MACHINE CONSTANTS FOR THE AMIGA */
/*     ABSOFT FORTRAN COMPILER USING SOFTWARE FLOATING POINT */

/*     DATA SMALL(1), SMALL(2) / Z'00100000', Z'00000000' / */
/*     DATA LARGE(1), LARGE(2) / Z'7FDFFFFF', Z'FFFFFFFF' / */
/*     DATA RIGHT(1), RIGHT(2) / Z'3CA00000', Z'00000000' / */
/*     DATA DIVER(1), DIVER(2) / Z'3CB00000', Z'00000000' / */
/*     DATA LOG10(1), LOG10(2) / Z'3FD34413', Z'509F79FF' / */

/*     MACHINE CONSTANTS FOR THE APOLLO */

/*     DATA SMALL(1), SMALL(2) / 16#00100000, 16#00000000 / */
/*     DATA LARGE(1), LARGE(2) / 16#7FFFFFFF, 16#FFFFFFFF / */
/*     DATA RIGHT(1), RIGHT(2) / 16#3CA00000, 16#00000000 / */
/*     DATA DIVER(1), DIVER(2) / 16#3CB00000, 16#00000000 / */
/*     DATA LOG10(1), LOG10(2) / 16#3FD34413, 16#509F79FF / */

/*     MACHINE CONSTANTS FOR THE BURROUGHS 1700 SYSTEM */

/*     DATA SMALL(1) / ZC00800000 / */
/*     DATA SMALL(2) / Z000000000 / */
/*     DATA LARGE(1) / ZDFFFFFFFF / */
/*     DATA LARGE(2) / ZFFFFFFFFF / */
/*     DATA RIGHT(1) / ZCC5800000 / */
/*     DATA RIGHT(2) / Z000000000 / */
/*     DATA DIVER(1) / ZCC6800000 / */
/*     DATA DIVER(2) / Z000000000 / */
/*     DATA LOG10(1) / ZD00E730E7 / */
/*     DATA LOG10(2) / ZC77800DC0 / */

/*     MACHINE CONSTANTS FOR THE BURROUGHS 5700 SYSTEM */

/*     DATA SMALL(1) / O1771000000000000 / */
/*     DATA SMALL(2) / O0000000000000000 / */
/*     DATA LARGE(1) / O0777777777777777 / */
/*     DATA LARGE(2) / O0007777777777777 / */
/*     DATA RIGHT(1) / O1461000000000000 / */
/*     DATA RIGHT(2) / O0000000000000000 / */
/*     DATA DIVER(1) / O1451000000000000 / */
/*     DATA DIVER(2) / O0000000000000000 / */
/*     DATA LOG10(1) / O1157163034761674 / */
/*     DATA LOG10(2) / O0006677466732724 / */

/*     MACHINE CONSTANTS FOR THE BURROUGHS 6700/7700 SYSTEMS */

/*     DATA SMALL(1) / O1771000000000000 / */
/*     DATA SMALL(2) / O7770000000000000 / */
/*     DATA LARGE(1) / O0777777777777777 / */
/*     DATA LARGE(2) / O7777777777777777 / */
/*     DATA RIGHT(1) / O1461000000000000 / */
/*     DATA RIGHT(2) / O0000000000000000 / */
/*     DATA DIVER(1) / O1451000000000000 / */
/*     DATA DIVER(2) / O0000000000000000 / */
/*     DATA LOG10(1) / O1157163034761674 / */
/*     DATA LOG10(2) / O0006677466732724 / */

/*     MACHINE CONSTANTS FOR THE CDC 170/180 SERIES USING NOS/VE */

/*     DATA SMALL(1) / Z"3001800000000000" / */
/*     DATA SMALL(2) / Z"3001000000000000" / */
/*     DATA LARGE(1) / Z"4FFEFFFFFFFFFFFE" / */
/*     DATA LARGE(2) / Z"4FFE000000000000" / */
/*     DATA RIGHT(1) / Z"3FD2800000000000" / */
/*     DATA RIGHT(2) / Z"3FD2000000000000" / */
/*     DATA DIVER(1) / Z"3FD3800000000000" / */
/*     DATA DIVER(2) / Z"3FD3000000000000" / */
/*     DATA LOG10(1) / Z"3FFF9A209A84FBCF" / */
/*     DATA LOG10(2) / Z"3FFFF7988F8959AC" / */

/*     MACHINE CONSTANTS FOR THE CDC 6000/7000 SERIES */

/*     DATA SMALL(1) / 00564000000000000000B / */
/*     DATA SMALL(2) / 00000000000000000000B / */
/*     DATA LARGE(1) / 37757777777777777777B / */
/*     DATA LARGE(2) / 37157777777777777777B / */
/*     DATA RIGHT(1) / 15624000000000000000B / */
/*     DATA RIGHT(2) / 00000000000000000000B / */
/*     DATA DIVER(1) / 15634000000000000000B / */
/*     DATA DIVER(2) / 00000000000000000000B / */
/*     DATA LOG10(1) / 17164642023241175717B / */
/*     DATA LOG10(2) / 16367571421742254654B / */

/*     MACHINE CONSTANTS FOR THE CELERITY C1260 */

/*     DATA SMALL(1), SMALL(2) / Z'00100000', Z'00000000' / */
/*     DATA LARGE(1), LARGE(2) / Z'7FEFFFFF', Z'FFFFFFFF' / */
/*     DATA RIGHT(1), RIGHT(2) / Z'3CA00000', Z'00000000' / */
/*     DATA DIVER(1), DIVER(2) / Z'3CB00000', Z'00000000' / */
/*     DATA LOG10(1), LOG10(2) / Z'3FD34413', Z'509F79FF' / */

/*     MACHINE CONSTANTS FOR THE CONVEX */
/*     USING THE -fn OR -pd8 COMPILER OPTION */

/*     DATA DMACH(1) / Z'0010000000000000' / */
/*     DATA DMACH(2) / Z'7FFFFFFFFFFFFFFF' / */
/*     DATA DMACH(3) / Z'3CC0000000000000' / */
/*     DATA DMACH(4) / Z'3CD0000000000000' / */
/*     DATA DMACH(5) / Z'3FF34413509F79FF' / */

/*     MACHINE CONSTANTS FOR THE CONVEX */
/*     USING THE -fi COMPILER OPTION */

/*     DATA DMACH(1) / Z'0010000000000000' / */
/*     DATA DMACH(2) / Z'7FEFFFFFFFFFFFFF' / */
/*     DATA DMACH(3) / Z'3CA0000000000000' / */
/*     DATA DMACH(4) / Z'3CB0000000000000' / */
/*     DATA DMACH(5) / Z'3FD34413509F79FF' / */

/*     MACHINE CONSTANTS FOR THE CONVEX */
/*     USING THE -p8 COMPILER OPTION */

/*     DATA DMACH(1) / Z'00010000000000000000000000000000' / */
/*     DATA DMACH(2) / Z'7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF' / */
/*     DATA DMACH(3) / Z'3F900000000000000000000000000000' / */
/*     DATA DMACH(4) / Z'3F910000000000000000000000000000' / */
/*     DATA DMACH(5) / Z'3FFF34413509F79FEF311F12B35816F9' / */

/*     MACHINE CONSTANTS FOR THE CRAY */

/*     DATA SMALL(1) / 201354000000000000000B / */
/*     DATA SMALL(2) / 000000000000000000000B / */
/*     DATA LARGE(1) / 577767777777777777777B / */
/*     DATA LARGE(2) / 000007777777777777774B / */
/*     DATA RIGHT(1) / 376434000000000000000B / */
/*     DATA RIGHT(2) / 000000000000000000000B / */
/*     DATA DIVER(1) / 376444000000000000000B / */
/*     DATA DIVER(2) / 000000000000000000000B / */
/*     DATA LOG10(1) / 377774642023241175717B / */
/*     DATA LOG10(2) / 000007571421742254654B / */

/*     MACHINE CONSTANTS FOR THE DATA GENERAL ECLIPSE S/200 */
/*     NOTE - IT MAY BE APPROPRIATE TO INCLUDE THE FOLLOWING CARD - */
/*     STATIC DMACH(5) */

/*     DATA SMALL /    20K, 3*0 / */
/*     DATA LARGE / 77777K, 3*177777K / */
/*     DATA RIGHT / 31420K, 3*0 / */
/*     DATA DIVER / 32020K, 3*0 / */
/*     DATA LOG10 / 40423K, 42023K, 50237K, 74776K / */

/*     MACHINE CONSTANTS FOR THE DEC ALPHA */
/*     USING G_FLOAT */

/*     DATA DMACH(1) / '0000000000000010'X / */
/*     DATA DMACH(2) / 'FFFFFFFFFFFF7FFF'X / */
/*     DATA DMACH(3) / '0000000000003CC0'X / */
/*     DATA DMACH(4) / '0000000000003CD0'X / */
/*     DATA DMACH(5) / '79FF509F44133FF3'X / */

/*     MACHINE CONSTANTS FOR THE DEC ALPHA */
/*     USING IEEE_FORMAT */

/*     DATA DMACH(1) / '0010000000000000'X / */
/*     DATA DMACH(2) / '7FEFFFFFFFFFFFFF'X / */
/*     DATA DMACH(3) / '3CA0000000000000'X / */
/*     DATA DMACH(4) / '3CB0000000000000'X / */
/*     DATA DMACH(5) / '3FD34413509F79FF'X / */

/*     MACHINE CONSTANTS FOR THE DEC RISC */

/*     DATA SMALL(1), SMALL(2) / Z'00000000', Z'00100000'/ */
/*     DATA LARGE(1), LARGE(2) / Z'FFFFFFFF', Z'7FEFFFFF'/ */
/*     DATA RIGHT(1), RIGHT(2) / Z'00000000', Z'3CA00000'/ */
/*     DATA DIVER(1), DIVER(2) / Z'00000000', Z'3CB00000'/ */
/*     DATA LOG10(1), LOG10(2) / Z'509F79FF', Z'3FD34413'/ */

/*     MACHINE CONSTANTS FOR THE DEC VAX */
/*     USING D_FLOATING */
/*     (EXPRESSED IN INTEGER AND HEXADECIMAL) */
/*     THE HEX FORMAT BELOW MAY NOT BE SUITABLE FOR UNIX SYSTEMS */
/*     THE INTEGER FORMAT SHOULD BE OK FOR UNIX SYSTEMS */

/*     DATA SMALL(1), SMALL(2) /        128,           0 / */
/*     DATA LARGE(1), LARGE(2) /     -32769,          -1 / */
/*     DATA RIGHT(1), RIGHT(2) /       9344,           0 / */
/*     DATA DIVER(1), DIVER(2) /       9472,           0 / */
/*     DATA LOG10(1), LOG10(2) /  546979738,  -805796613 / */

/*     DATA SMALL(1), SMALL(2) / Z00000080, Z00000000 / */
/*     DATA LARGE(1), LARGE(2) / ZFFFF7FFF, ZFFFFFFFF / */
/*     DATA RIGHT(1), RIGHT(2) / Z00002480, Z00000000 / */
/*     DATA DIVER(1), DIVER(2) / Z00002500, Z00000000 / */
/*     DATA LOG10(1), LOG10(2) / Z209A3F9A, ZCFF884FB / */

/*     MACHINE CONSTANTS FOR THE DEC VAX */
/*     USING G_FLOATING */
/*     (EXPRESSED IN INTEGER AND HEXADECIMAL) */
/*     THE HEX FORMAT BELOW MAY NOT BE SUITABLE FOR UNIX SYSTEMS */
/*     THE INTEGER FORMAT SHOULD BE OK FOR UNIX SYSTEMS */

/*     DATA SMALL(1), SMALL(2) /         16,           0 / */
/*     DATA LARGE(1), LARGE(2) /     -32769,          -1 / */
/*     DATA RIGHT(1), RIGHT(2) /      15552,           0 / */
/*     DATA DIVER(1), DIVER(2) /      15568,           0 / */
/*     DATA LOG10(1), LOG10(2) /  1142112243, 2046775455 / */

/*     DATA SMALL(1), SMALL(2) / Z00000010, Z00000000 / */
/*     DATA LARGE(1), LARGE(2) / ZFFFF7FFF, ZFFFFFFFF / */
/*     DATA RIGHT(1), RIGHT(2) / Z00003CC0, Z00000000 / */
/*     DATA DIVER(1), DIVER(2) / Z00003CD0, Z00000000 / */
/*     DATA LOG10(1), LOG10(2) / Z44133FF3, Z79FF509F / */

/*     MACHINE CONSTANTS FOR THE ELXSI 6400 */
/*     (ASSUMING REAL*8 IS THE DEFAULT DOUBLE PRECISION) */

/*     DATA SMALL(1), SMALL(2) / '00100000'X,'00000000'X / */
/*     DATA LARGE(1), LARGE(2) / '7FEFFFFF'X,'FFFFFFFF'X / */
/*     DATA RIGHT(1), RIGHT(2) / '3CB00000'X,'00000000'X / */
/*     DATA DIVER(1), DIVER(2) / '3CC00000'X,'00000000'X / */
/*     DATA LOG10(1), LOG10(2) / '3FD34413'X,'509F79FF'X / */

/*     MACHINE CONSTANTS FOR THE HARRIS 220 */

/*     DATA SMALL(1), SMALL(2) / '20000000, '00000201 / */
/*     DATA LARGE(1), LARGE(2) / '37777777, '37777577 / */
/*     DATA RIGHT(1), RIGHT(2) / '20000000, '00000333 / */
/*     DATA DIVER(1), DIVER(2) / '20000000, '00000334 / */
/*     DATA LOG10(1), LOG10(2) / '23210115, '10237777 / */

/*     MACHINE CONSTANTS FOR THE HONEYWELL 600/6000 SERIES */

/*     DATA SMALL(1), SMALL(2) / O402400000000, O000000000000 / */
/*     DATA LARGE(1), LARGE(2) / O376777777777, O777777777777 / */
/*     DATA RIGHT(1), RIGHT(2) / O604400000000, O000000000000 / */
/*     DATA DIVER(1), DIVER(2) / O606400000000, O000000000000 / */
/*     DATA LOG10(1), LOG10(2) / O776464202324, O117571775714 / */

/*     MACHINE CONSTANTS FOR THE HP 730 */

/*     DATA DMACH(1) / Z'0010000000000000' / */
/*     DATA DMACH(2) / Z'7FEFFFFFFFFFFFFF' / */
/*     DATA DMACH(3) / Z'3CA0000000000000' / */
/*     DATA DMACH(4) / Z'3CB0000000000000' / */
/*     DATA DMACH(5) / Z'3FD34413509F79FF' / */

/*     MACHINE CONSTANTS FOR THE HP 2100 */
/*     THREE WORD DOUBLE PRECISION OPTION WITH FTN4 */

/*     DATA SMALL(1), SMALL(2), SMALL(3) / 40000B,       0,       1 / */
/*     DATA LARGE(1), LARGE(2), LARGE(3) / 77777B, 177777B, 177776B / */
/*     DATA RIGHT(1), RIGHT(2), RIGHT(3) / 40000B,       0,    265B / */
/*     DATA DIVER(1), DIVER(2), DIVER(3) / 40000B,       0,    276B / */
/*     DATA LOG10(1), LOG10(2), LOG10(3) / 46420B,  46502B,  77777B / */

/*     MACHINE CONSTANTS FOR THE HP 2100 */
/*     FOUR WORD DOUBLE PRECISION OPTION WITH FTN4 */

/*     DATA SMALL(1), SMALL(2) /  40000B,       0 / */
/*     DATA SMALL(3), SMALL(4) /       0,       1 / */
/*     DATA LARGE(1), LARGE(2) /  77777B, 177777B / */
/*     DATA LARGE(3), LARGE(4) / 177777B, 177776B / */
/*     DATA RIGHT(1), RIGHT(2) /  40000B,       0 / */
/*     DATA RIGHT(3), RIGHT(4) /       0,    225B / */
/*     DATA DIVER(1), DIVER(2) /  40000B,       0 / */
/*     DATA DIVER(3), DIVER(4) /       0,    227B / */
/*     DATA LOG10(1), LOG10(2) /  46420B,  46502B / */
/*     DATA LOG10(3), LOG10(4) /  76747B, 176377B / */

/*     MACHINE CONSTANTS FOR THE HP 9000 */

/*     DATA SMALL(1), SMALL(2) / 00040000000B, 00000000000B / */
/*     DATA LARGE(1), LARGE(2) / 17737777777B, 37777777777B / */
/*     DATA RIGHT(1), RIGHT(2) / 07454000000B, 00000000000B / */
/*     DATA DIVER(1), DIVER(2) / 07460000000B, 00000000000B / */
/*     DATA LOG10(1), LOG10(2) / 07764642023B, 12047674777B / */

/*     MACHINE CONSTANTS FOR THE IBM 360/370 SERIES, */
/*     THE XEROX SIGMA 5/7/9, THE SEL SYSTEMS 85/86, AND */
/*     THE PERKIN ELMER (INTERDATA) 7/32. */

/*     DATA SMALL(1), SMALL(2) / Z00100000, Z00000000 / */
/*     DATA LARGE(1), LARGE(2) / Z7FFFFFFF, ZFFFFFFFF / */
/*     DATA RIGHT(1), RIGHT(2) / Z33100000, Z00000000 / */
/*     DATA DIVER(1), DIVER(2) / Z34100000, Z00000000 / */
/*     DATA LOG10(1), LOG10(2) / Z41134413, Z509F79FF / */

/*     MACHINE CONSTANTS FOR THE IBM PC */
/*     ASSUMES THAT ALL ARITHMETIC IS DONE IN DOUBLE PRECISION */
/*     ON 8088, I.E., NOT IN 80 BIT FORM FOR THE 8087. */

/*     DATA SMALL(1) / 2.23D-308  / */
/*     DATA LARGE(1) / 1.79D+308  / */
/*     DATA RIGHT(1) / 1.11D-16   / */
/*     DATA DIVER(1) / 2.22D-16   / */
/*     DATA LOG10(1) / 0.301029995663981195D0 / */

/*     MACHINE CONSTANTS FOR THE IBM RS 6000 */

/*     DATA DMACH(1) / Z'0010000000000000' / */
/*     DATA DMACH(2) / Z'7FEFFFFFFFFFFFFF' / */
/*     DATA DMACH(3) / Z'3CA0000000000000' / */
/*     DATA DMACH(4) / Z'3CB0000000000000' / */
/*     DATA DMACH(5) / Z'3FD34413509F79FF' / */

/*     MACHINE CONSTANTS FOR THE INTEL i860 */

/*     DATA DMACH(1) / Z'0010000000000000' / */
/*     DATA DMACH(2) / Z'7FEFFFFFFFFFFFFF' / */
/*     DATA DMACH(3) / Z'3CA0000000000000' / */
/*     DATA DMACH(4) / Z'3CB0000000000000' / */
/*     DATA DMACH(5) / Z'3FD34413509F79FF' / */

/*     MACHINE CONSTANTS FOR THE PDP-10 (KA PROCESSOR) */

/*     DATA SMALL(1), SMALL(2) / "033400000000, "000000000000 / */
/*     DATA LARGE(1), LARGE(2) / "377777777777, "344777777777 / */
/*     DATA RIGHT(1), RIGHT(2) / "113400000000, "000000000000 / */
/*     DATA DIVER(1), DIVER(2) / "114400000000, "000000000000 / */
/*     DATA LOG10(1), LOG10(2) / "177464202324, "144117571776 / */

/*     MACHINE CONSTANTS FOR THE PDP-10 (KI PROCESSOR) */

/*     DATA SMALL(1), SMALL(2) / "000400000000, "000000000000 / */
/*     DATA LARGE(1), LARGE(2) / "377777777777, "377777777777 / */
/*     DATA RIGHT(1), RIGHT(2) / "103400000000, "000000000000 / */
/*     DATA DIVER(1), DIVER(2) / "104400000000, "000000000000 / */
/*     DATA LOG10(1), LOG10(2) / "177464202324, "476747767461 / */

/*     MACHINE CONSTANTS FOR PDP-11 FORTRAN SUPPORTING */
/*     32-BIT INTEGERS (EXPRESSED IN INTEGER AND OCTAL). */

/*     DATA SMALL(1), SMALL(2) /    8388608,           0 / */
/*     DATA LARGE(1), LARGE(2) / 2147483647,          -1 / */
/*     DATA RIGHT(1), RIGHT(2) /  612368384,           0 / */
/*     DATA DIVER(1), DIVER(2) /  620756992,           0 / */
/*     DATA LOG10(1), LOG10(2) / 1067065498, -2063872008 / */

/*     DATA SMALL(1), SMALL(2) / O00040000000, O00000000000 / */
/*     DATA LARGE(1), LARGE(2) / O17777777777, O37777777777 / */
/*     DATA RIGHT(1), RIGHT(2) / O04440000000, O00000000000 / */
/*     DATA DIVER(1), DIVER(2) / O04500000000, O00000000000 / */
/*     DATA LOG10(1), LOG10(2) / O07746420232, O20476747770 / */

/*     MACHINE CONSTANTS FOR PDP-11 FORTRAN SUPPORTING */
/*     16-BIT INTEGERS (EXPRESSED IN INTEGER AND OCTAL). */

/*     DATA SMALL(1), SMALL(2) /    128,      0 / */
/*     DATA SMALL(3), SMALL(4) /      0,      0 / */
/*     DATA LARGE(1), LARGE(2) /  32767,     -1 / */
/*     DATA LARGE(3), LARGE(4) /     -1,     -1 / */
/*     DATA RIGHT(1), RIGHT(2) /   9344,      0 / */
/*     DATA RIGHT(3), RIGHT(4) /      0,      0 / */
/*     DATA DIVER(1), DIVER(2) /   9472,      0 / */
/*     DATA DIVER(3), DIVER(4) /      0,      0 / */
/*     DATA LOG10(1), LOG10(2) /  16282,   8346 / */
/*     DATA LOG10(3), LOG10(4) / -31493, -12296 / */

/*     DATA SMALL(1), SMALL(2) / O000200, O000000 / */
/*     DATA SMALL(3), SMALL(4) / O000000, O000000 / */
/*     DATA LARGE(1), LARGE(2) / O077777, O177777 / */
/*     DATA LARGE(3), LARGE(4) / O177777, O177777 / */
/*     DATA RIGHT(1), RIGHT(2) / O022200, O000000 / */
/*     DATA RIGHT(3), RIGHT(4) / O000000, O000000 / */
/*     DATA DIVER(1), DIVER(2) / O022400, O000000 / */
/*     DATA DIVER(3), DIVER(4) / O000000, O000000 / */
/*     DATA LOG10(1), LOG10(2) / O037632, O020232 / */
/*     DATA LOG10(3), LOG10(4) / O102373, O147770 / */

/*     MACHINE CONSTANTS FOR THE SILICON GRAPHICS */

/*     DATA SMALL(1), SMALL(2) / Z'00100000', Z'00000000' / */
/*     DATA LARGE(1), LARGE(2) / Z'7FEFFFFF', Z'FFFFFFFF' / */
/*     DATA RIGHT(1), RIGHT(2) / Z'3CA00000', Z'00000000' / */
/*     DATA DIVER(1), DIVER(2) / Z'3CB00000', Z'00000000' / */
/*     DATA LOG10(1), LOG10(2) / Z'3FD34413', Z'509F79FF' / */

/*     MACHINE CONSTANTS FOR THE SUN */

/*     DATA DMACH(1) / Z'0010000000000000' / */
/*     DATA DMACH(2) / Z'7FEFFFFFFFFFFFFF' / */
/*     DATA DMACH(3) / Z'3CA0000000000000' / */
/*     DATA DMACH(4) / Z'3CB0000000000000' / */
/*     DATA DMACH(5) / Z'3FD34413509F79FF' / */

/*     MACHINE CONSTANTS FOR THE SUN */
/*     USING THE -r8 COMPILER OPTION */

/*     DATA DMACH(1) / Z'00010000000000000000000000000000' / */
/*     DATA DMACH(2) / Z'7FFEFFFFFFFFFFFFFFFFFFFFFFFFFFFF' / */
/*     DATA DMACH(3) / Z'3F8E0000000000000000000000000000' / */
/*     DATA DMACH(4) / Z'3F8F0000000000000000000000000000' / */
/*     DATA DMACH(5) / Z'3FFD34413509F79FEF311F12B35816F9' / */

/*     MACHINE CONSTANTS FOR THE SUN 386i */

/*     DATA SMALL(1), SMALL(2) / Z'FFFFFFFD', Z'000FFFFF' / */
/*     DATA LARGE(1), LARGE(2) / Z'FFFFFFB0', Z'7FEFFFFF' / */
/*     DATA RIGHT(1), RIGHT(2) / Z'000000B0', Z'3CA00000' / */
/*     DATA DIVER(1), DIVER(2) / Z'FFFFFFCB', Z'3CAFFFFF' */
/*     DATA LOG10(1), LOG10(2) / Z'509F79E9', Z'3FD34413' / */

/*     MACHINE CONSTANTS FOR THE UNIVAC 1100 SERIES FTN COMPILER */

/*     DATA SMALL(1), SMALL(2) / O000040000000, O000000000000 / */
/*     DATA LARGE(1), LARGE(2) / O377777777777, O777777777777 / */
/*     DATA RIGHT(1), RIGHT(2) / O170540000000, O000000000000 / */
/*     DATA DIVER(1), DIVER(2) / O170640000000, O000000000000 / */
/*     DATA LOG10(1), LOG10(2) / O177746420232, O411757177572 / */

/* ***FIRST EXECUTABLE STATEMENT  D1MACH */
    if (*i__ < 1 || *i__ > 5) {
	xermsg_("SLATEC", "D1MACH", "I OUT OF BOUNDS", &c__1, &c__2, (ftnlen)
		6, (ftnlen)6, (ftnlen)15);
    }

    ret_val = dmach[*i__ - 1];
    return ret_val;

} /* d1mach_ */

/* DECK XGETUA */
/* Subroutine */ int xgetua_(integer *iunita, integer *n)
{
    /* System generated locals */
    integer i__1;

    /* Local variables */
    integer i__, index;
    extern integer j4save_(integer *, integer *, logical *);

/* ***BEGIN PROLOGUE  XGETUA */
/* ***PURPOSE  Return unit number(s) to which error messages are being */
/*            sent. */
/* ***LIBRARY   SLATEC (XERROR) */
/* ***CATEGORY  R3C */
/* ***TYPE      ALL (XGETUA-A) */
/* ***KEYWORDS  ERROR, XERROR */
/* ***AUTHOR  Jones, R. E., (SNLA) */
/* ***DESCRIPTION */

/*     Abstract */
/*        XGETUA may be called to determine the unit number or numbers */
/*        to which error messages are being sent. */
/*        These unit numbers may have been set by a call to XSETUN, */
/*        or a call to XSETUA, or may be a default value. */

/*     Description of Parameters */
/*      --Output-- */
/*        IUNIT - an array of one to five unit numbers, depending */
/*                on the value of N.  A value of zero refers to the */
/*                default unit, as defined by the I1MACH machine */
/*                constant routine.  Only IUNIT(1),...,IUNIT(N) are */
/*                defined by XGETUA.  The values of IUNIT(N+1),..., */
/*                IUNIT(5) are not defined (for N .LT. 5) or altered */
/*                in any way by XGETUA. */
/*        N     - the number of units to which copies of the */
/*                error messages are being sent.  N will be in the */
/*                range from 1 to 5. */

/* ***REFERENCES  R. E. Jones and D. K. Kahaner, XERROR, the SLATEC */
/*                 Error-handling Package, SAND82-0800, Sandia */
/*                 Laboratories, 1982. */
/* ***ROUTINES CALLED  J4SAVE */
/* ***REVISION HISTORY  (YYMMDD) */
/*   790801  DATE WRITTEN */
/*   861211  REVISION DATE from Version 3.2 */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   920501  Reformatted the REFERENCES section.  (WRB) */
/* ***END PROLOGUE  XGETUA */
/* ***FIRST EXECUTABLE STATEMENT  XGETUA */
    /* Parameter adjustments */
    --iunita;

    /* Function Body */
    *n = j4save_(&c__5, &c__0, &c_false);
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	index = i__ + 4;
	if (i__ == 1) {
	    index = 3;
	}
	iunita[i__] = j4save_(&index, &c__0, &c_false);
/* L30: */
    }
    return 0;
} /* xgetua_ */

/* DECK DSTEPS */
/* Subroutine */ int dsteps_(S_fp df, integer *neqn, doublereal *y, 
	doublereal *x, doublereal *h__, doublereal *eps, doublereal *wt, 
	logical *start, doublereal *hold, integer *k, integer *kold, logical *
	crash, doublereal *phi, doublereal *p, doublereal *yp, doublereal *
	psi, doublereal *alpha, doublereal *beta, doublereal *sig, doublereal 
	*v, doublereal *w, doublereal *g, logical *phase1, integer *ns, 
	logical *nornd, integer *ksteps, doublereal *twou, doublereal *fouru, 
	doublereal *xold, integer *kprev, integer *ivc, integer *iv, integer *
	kgi, doublereal *gi, doublereal *rpar, integer *ipar)
{
    /* Initialized data */

    static doublereal two[13] = { 2.,4.,8.,16.,32.,64.,128.,256.,512.,1024.,
	    2048.,4096.,8192. };
    static doublereal gstr[13] = { .5,.0833,.0417,.0264,.0188,.0143,.0114,
	    .00936,.00789,.00679,.00592,.00524,.00468 };

    /* System generated locals */
    integer phi_dim1, phi_offset, i__1, i__2;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    double d_sign(doublereal *, doublereal *), sqrt(doublereal), pow_dd(
	    doublereal *, doublereal *);

    /* Local variables */
    integer i__, j, l;
    doublereal r__, u;
    integer iq, jv, im1, km1, ip1, km2, kp1, kp2;
    doublereal big, erk, err, rho, tau;
    integer nsm2, nsp1, nsp2;
    doublereal absh, hnew;
    integer knew;
    doublereal erkm1, erkm2, erkp1, temp1, temp2, temp3, temp4, temp5, temp6, 
	    p5eps;
    integer ifail;
    doublereal reali, round;
    extern doublereal d1mach_(integer *);
    integer limit1, limit2;
    doublereal realns;
    extern /* Subroutine */ int dhstrt_(S_fp, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, doublereal *, integer *,
	     doublereal *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, integer *, doublereal *)
	    ;

/* ***BEGIN PROLOGUE  DSTEPS */
/* ***PURPOSE  Integrate a system of first order ordinary differential */
/*            equations one step. */
/* ***LIBRARY   SLATEC (DEPAC) */
/* ***CATEGORY  I1A1B */
/* ***TYPE      DOUBLE PRECISION (STEPS-S, DSTEPS-D) */
/* ***KEYWORDS  ADAMS METHOD, DEPAC, INITIAL VALUE PROBLEMS, ODE, */
/*             ORDINARY DIFFERENTIAL EQUATIONS, PREDICTOR-CORRECTOR */
/* ***AUTHOR  Shampine, L. F., (SNLA) */
/*           Gordon, M. K., (SNLA) */
/*             MODIFIED BY H.A. WATTS */
/* ***DESCRIPTION */

/*   Written by L. F. Shampine and M. K. Gordon */

/*   Abstract */

/*   Subroutine  DSTEPS  is normally used indirectly through subroutine */
/*   DDEABM .  Because  DDEABM  suffices for most problems and is much */
/*   easier to use, using it should be considered before using  DSTEPS */
/*   alone. */

/*   Subroutine DSTEPS integrates a system of  NEQN  first order ordinary */
/*   differential equations one step, normally from X to X+H, using a */
/*   modified divided difference form of the Adams Pece formulas.  Local */
/*   extrapolation is used to improve absolute stability and accuracy. */
/*   The code adjusts its order and step size to control the local error */
/*   per unit step in a generalized sense.  Special devices are included */
/*   to control roundoff error and to detect when the user is requesting */
/*   too much accuracy. */

/*   This code is completely explained and documented in the text, */
/*   Computer Solution of Ordinary Differential Equations, The Initial */
/*   Value Problem  by L. F. Shampine and M. K. Gordon. */
/*   Further details on use of this code are available in "Solving */
/*   Ordinary Differential Equations with ODE, STEP, and INTRP", */
/*   by L. F. Shampine and M. K. Gordon, SLA-73-1060. */


/*   The parameters represent -- */
/*      DF -- subroutine to evaluate derivatives */
/*      NEQN -- number of equations to be integrated */
/*      Y(*) -- solution vector at X */
/*      X -- independent variable */
/*      H -- appropriate step size for next step.  Normally determined by */
/*           code */
/*      EPS -- local error tolerance */
/*      WT(*) -- vector of weights for error criterion */
/*      START -- logical variable set .TRUE. for first step,  .FALSE. */
/*           otherwise */
/*      HOLD -- step size used for last successful step */
/*      K -- appropriate order for next step (determined by code) */
/*      KOLD -- order used for last successful step */
/*      CRASH -- logical variable set .TRUE. when no step can be taken, */
/*           .FALSE. otherwise. */
/*      YP(*) -- derivative of solution vector at  X  after successful */
/*           step */
/*      KSTEPS -- counter on attempted steps */
/*      TWOU -- 2.*U where U is machine unit roundoff quantity */
/*      FOURU -- 4.*U where U is machine unit roundoff quantity */
/*      RPAR,IPAR -- parameter arrays which you may choose to use */
/*            for communication between your program and subroutine F. */
/*            They are not altered or used by DSTEPS. */
/*   The variables X,XOLD,KOLD,KGI and IVC and the arrays Y,PHI,ALPHA,G, */
/*   W,P,IV and GI are required for the interpolation subroutine SINTRP. */
/*   The remaining variables and arrays are included in the call list */
/*   only to eliminate local retention of variables between calls. */

/*   Input to DSTEPS */

/*      First call -- */

/*   The user must provide storage in his calling program for all arrays */
/*   in the call list, namely */

/*     DIMENSION Y(NEQN),WT(NEQN),PHI(NEQN,16),P(NEQN),YP(NEQN),PSI(12), */
/*    1  ALPHA(12),BETA(12),SIG(13),V(12),W(12),G(13),GI(11),IV(10), */
/*    2  RPAR(*),IPAR(*) */

/*    **Note** */

/*   The user must also declare  START ,  CRASH ,  PHASE1  and  NORND */
/*   logical variables and  DF  an EXTERNAL subroutine, supply the */
/*   subroutine  DF(X,Y,YP)  to evaluate */
/*      DY(I)/DX = YP(I) = DF(X,Y(1),Y(2),...,Y(NEQN)) */
/*   and initialize only the following parameters. */
/*      NEQN -- number of equations to be integrated */
/*      Y(*) -- vector of initial values of dependent variables */
/*      X -- initial value of the independent variable */
/*      H -- nominal step size indicating direction of integration */
/*           and maximum size of step.  Must be variable */
/*      EPS -- local error tolerance per step.  Must be variable */
/*      WT(*) -- vector of non-zero weights for error criterion */
/*      START -- .TRUE. */
/*      YP(*) -- vector of initial derivative values */
/*      KSTEPS -- set KSTEPS to zero */
/*      TWOU -- 2.*U where U is machine unit roundoff quantity */
/*      FOURU -- 4.*U where U is machine unit roundoff quantity */
/*   Define U to be the machine unit roundoff quantity by calling */
/*   the function routine  D1MACH,  U = D1MACH(4), or by */
/*   computing U so that U is the smallest positive number such */
/*   that 1.0+U .GT. 1.0. */

/*   DSTEPS  requires that the L2 norm of the vector with components */
/*   LOCAL ERROR(L)/WT(L)  be less than  EPS  for a successful step.  The */
/*   array  WT  allows the user to specify an error test appropriate */
/*   for his problem.  For example, */
/*      WT(L) = 1.0  specifies absolute error, */
/*            = ABS(Y(L))  error relative to the most recent value of the */
/*                 L-th component of the solution, */
/*            = ABS(YP(L))  error relative to the most recent value of */
/*                 the L-th component of the derivative, */
/*            = MAX(WT(L),ABS(Y(L)))  error relative to the largest */
/*                 magnitude of L-th component obtained so far, */
/*            = ABS(Y(L))*RELERR/EPS + ABSERR/EPS  specifies a mixed */
/*                 relative-absolute test where  RELERR  is relative */
/*                 error,  ABSERR  is absolute error and  EPS = */
/*                 MAX(RELERR,ABSERR) . */

/*      Subsequent calls -- */

/*   Subroutine  DSTEPS  is designed so that all information needed to */
/*   continue the integration, including the step size  H  and the order */
/*   K , is returned with each step.  With the exception of the step */
/*   size, the error tolerance, and the weights, none of the parameters */
/*   should be altered.  The array  WT  must be updated after each step */
/*   to maintain relative error tests like those above.  Normally the */
/*   integration is continued just beyond the desired endpoint and the */
/*   solution interpolated there with subroutine  SINTRP .  If it is */
/*   impossible to integrate beyond the endpoint, the step size may be */
/*   reduced to hit the endpoint since the code will not take a step */
/*   larger than the  H  input.  Changing the direction of integration, */
/*   i.e., the sign of  H , requires the user set  START = .TRUE. before */
/*   calling  DSTEPS  again.  This is the only situation in which  START */
/*   should be altered. */

/*   Output from DSTEPS */

/*      Successful Step -- */

/*   The subroutine returns after each successful step with  START  and */
/*   CRASH  set .FALSE. .  X  represents the independent variable */
/*   advanced one step of length  HOLD  from its value on input and  Y */
/*   the solution vector at the new value of  X .  All other parameters */
/*   represent information corresponding to the new  X  needed to */
/*   continue the integration. */

/*      Unsuccessful Step -- */

/*   When the error tolerance is too small for the machine precision, */
/*   the subroutine returns without taking a step and  CRASH = .TRUE. . */
/*   An appropriate step size and error tolerance for continuing are */
/*   estimated and all other information is restored as upon input */
/*   before returning.  To continue with the larger tolerance, the user */
/*   just calls the code again.  A restart is neither required nor */
/*   desirable. */

/* ***REFERENCES  L. F. Shampine and M. K. Gordon, Solving ordinary */
/*                 differential equations with ODE, STEP, and INTRP, */
/*                 Report SLA-73-1060, Sandia Laboratories, 1973. */
/* ***ROUTINES CALLED  D1MACH, DHSTRT */
/* ***REVISION HISTORY  (YYMMDD) */
/*   740101  DATE WRITTEN */
/*   890531  Changed all specific intrinsics to generic.  (WRB) */
/*   890831  Modified array declarations.  (WRB) */
/*   890831  REVISION DATE from Version 3.2 */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   920501  Reformatted the REFERENCES section.  (WRB) */
/* ***END PROLOGUE  DSTEPS */


    /* Parameter adjustments */
    phi_dim1 = *neqn;
    phi_offset = 1 + phi_dim1;
    phi -= phi_offset;
    --y;
    --wt;
    --p;
    --yp;
    --psi;
    --alpha;
    --beta;
    --sig;
    --v;
    --w;
    --g;
    --iv;
    --gi;
    --rpar;
    --ipar;

    /* Function Body */

/*       ***     BEGIN BLOCK 0     *** */
/*   CHECK IF STEP SIZE OR ERROR TOLERANCE IS TOO SMALL FOR MACHINE */
/*   PRECISION.  IF FIRST STEP, INITIALIZE PHI ARRAY AND ESTIMATE A */
/*   STARTING STEP SIZE. */
/*                   *** */

/*   IF STEP SIZE IS TOO SMALL, DETERMINE AN ACCEPTABLE ONE */

/* ***FIRST EXECUTABLE STATEMENT  DSTEPS */
    *crash = TRUE_;
    if (abs(*h__) >= *fouru * abs(*x)) {
	goto L5;
    }
    d__1 = *fouru * abs(*x);
    *h__ = d_sign(&d__1, h__);
    return 0;
L5:
    p5eps = *eps * .5;

/*   IF ERROR TOLERANCE IS TOO SMALL, INCREASE IT TO AN ACCEPTABLE VALUE */

    round = 0.;
    i__1 = *neqn;
    for (l = 1; l <= i__1; ++l) {
/* L10: */
/* Computing 2nd power */
	d__1 = y[l] / wt[l];
	round += d__1 * d__1;
    }
    round = *twou * sqrt(round);
    if (p5eps >= round) {
	goto L15;
    }
    *eps = round * 2. * (*fouru + 1.);
    return 0;
L15:
    *crash = FALSE_;
    g[1] = 1.;
    g[2] = .5;
    sig[1] = 1.;
    if (! (*start)) {
	goto L99;
    }

/*   INITIALIZE.  COMPUTE APPROPRIATE STEP SIZE FOR FIRST STEP */

/*     CALL DF(X,Y,YP,RPAR,IPAR) */
/*     SUM = 0.0 */
    i__1 = *neqn;
    for (l = 1; l <= i__1; ++l) {
	phi[l + phi_dim1] = yp[l];
/* L20: */
	phi[l + (phi_dim1 << 1)] = 0.;
    }
/* 20     SUM = SUM + (YP(L)/WT(L))**2 */
/*     SUM = SQRT(SUM) */
/*     ABSH = ABS(H) */
/*     IF(EPS .LT. 16.0*SUM*H*H) ABSH = 0.25*SQRT(EPS/SUM) */
/*     H = SIGN(MAX(ABSH,FOURU*ABS(X)),H) */

    u = d1mach_(&c__4);
    big = sqrt(d1mach_(&c__2));
    d__1 = *x + *h__;
    dhstrt_((S_fp)df, neqn, x, &d__1, &y[1], &yp[1], &wt[1], &c__1, &u, &big, 
	    &phi[phi_dim1 * 3 + 1], &phi[(phi_dim1 << 2) + 1], &phi[phi_dim1 *
	     5 + 1], &phi[phi_dim1 * 6 + 1], &rpar[1], &ipar[1], h__);

    *hold = 0.;
    *k = 1;
    *kold = 0;
    *kprev = 0;
    *start = FALSE_;
    *phase1 = TRUE_;
    *nornd = TRUE_;
    if (p5eps > round * 100.) {
	goto L99;
    }
    *nornd = FALSE_;
    i__1 = *neqn;
    for (l = 1; l <= i__1; ++l) {
/* L25: */
	phi[l + phi_dim1 * 15] = 0.;
    }
L99:
    ifail = 0;
/*       ***     END BLOCK 0     *** */

/*       ***     BEGIN BLOCK 1     *** */
/*   COMPUTE COEFFICIENTS OF FORMULAS FOR THIS STEP.  AVOID COMPUTING */
/*   THOSE QUANTITIES NOT CHANGED WHEN STEP SIZE IS NOT CHANGED. */
/*                   *** */

L100:
    kp1 = *k + 1;
    kp2 = *k + 2;
    km1 = *k - 1;
    km2 = *k - 2;

/*   NS IS THE NUMBER OF DSTEPS TAKEN WITH SIZE H, INCLUDING THE CURRENT */
/*   ONE.  WHEN K.LT.NS, NO COEFFICIENTS CHANGE */

    if (*h__ != *hold) {
	*ns = 0;
    }
    if (*ns <= *kold) {
	++(*ns);
    }
    nsp1 = *ns + 1;
    if (*k < *ns) {
	goto L199;
    }

/*   COMPUTE THOSE COMPONENTS OF ALPHA(*),BETA(*),PSI(*),SIG(*) WHICH */
/*   ARE CHANGED */

    beta[*ns] = 1.;
    realns = (doublereal) (*ns);
    alpha[*ns] = 1. / realns;
    temp1 = *h__ * realns;
    sig[nsp1] = 1.;
    if (*k < nsp1) {
	goto L110;
    }
    i__1 = *k;
    for (i__ = nsp1; i__ <= i__1; ++i__) {
	im1 = i__ - 1;
	temp2 = psi[im1];
	psi[im1] = temp1;
	beta[i__] = beta[im1] * psi[im1] / temp2;
	temp1 = temp2 + *h__;
	alpha[i__] = *h__ / temp1;
	reali = (doublereal) i__;
/* L105: */
	sig[i__ + 1] = reali * alpha[i__] * sig[i__];
    }
L110:
    psi[*k] = temp1;

/*   COMPUTE COEFFICIENTS G(*) */

/*   INITIALIZE V(*) AND SET W(*). */

    if (*ns > 1) {
	goto L120;
    }
    i__1 = *k;
    for (iq = 1; iq <= i__1; ++iq) {
	temp3 = (doublereal) (iq * (iq + 1));
	v[iq] = 1. / temp3;
/* L115: */
	w[iq] = v[iq];
    }
    *ivc = 0;
    *kgi = 0;
    if (*k == 1) {
	goto L140;
    }
    *kgi = 1;
    gi[1] = w[2];
    goto L140;

/*   IF ORDER WAS RAISED, UPDATE DIAGONAL PART OF V(*) */

L120:
    if (*k <= *kprev) {
	goto L130;
    }
    if (*ivc == 0) {
	goto L122;
    }
    jv = kp1 - iv[*ivc];
    --(*ivc);
    goto L123;
L122:
    jv = 1;
    temp4 = (doublereal) (*k * kp1);
    v[*k] = 1. / temp4;
    w[*k] = v[*k];
    if (*k != 2) {
	goto L123;
    }
    *kgi = 1;
    gi[1] = w[2];
L123:
    nsm2 = *ns - 2;
    if (nsm2 < jv) {
	goto L130;
    }
    i__1 = nsm2;
    for (j = jv; j <= i__1; ++j) {
	i__ = *k - j;
	v[i__] -= alpha[j + 1] * v[i__ + 1];
/* L125: */
	w[i__] = v[i__];
    }
    if (i__ != 2) {
	goto L130;
    }
    *kgi = *ns - 1;
    gi[*kgi] = w[2];

/*   UPDATE V(*) AND SET W(*) */

L130:
    limit1 = kp1 - *ns;
    temp5 = alpha[*ns];
    i__1 = limit1;
    for (iq = 1; iq <= i__1; ++iq) {
	v[iq] -= temp5 * v[iq + 1];
/* L135: */
	w[iq] = v[iq];
    }
    g[nsp1] = w[1];
    if (limit1 == 1) {
	goto L137;
    }
    *kgi = *ns;
    gi[*kgi] = w[2];
L137:
    w[limit1 + 1] = v[limit1 + 1];
    if (*k >= *kold) {
	goto L140;
    }
    ++(*ivc);
    iv[*ivc] = limit1 + 2;

/*   COMPUTE THE G(*) IN THE WORK VECTOR W(*) */

L140:
    nsp2 = *ns + 2;
    *kprev = *k;
    if (kp1 < nsp2) {
	goto L199;
    }
    i__1 = kp1;
    for (i__ = nsp2; i__ <= i__1; ++i__) {
	limit2 = kp2 - i__;
	temp6 = alpha[i__ - 1];
	i__2 = limit2;
	for (iq = 1; iq <= i__2; ++iq) {
/* L145: */
	    w[iq] -= temp6 * w[iq + 1];
	}
/* L150: */
	g[i__] = w[1];
    }
L199:
/*       ***     END BLOCK 1     *** */

/*       ***     BEGIN BLOCK 2     *** */
/*   PREDICT A SOLUTION P(*), EVALUATE DERIVATIVES USING PREDICTED */
/*   SOLUTION, ESTIMATE LOCAL ERROR AT ORDER K AND ERRORS AT ORDERS K, */
/*   K-1, K-2 AS IF CONSTANT STEP SIZE WERE USED. */
/*                   *** */

/*   INCREMENT COUNTER ON ATTEMPTED DSTEPS */

    ++(*ksteps);

/*   CHANGE PHI TO PHI STAR */

    if (*k < nsp1) {
	goto L215;
    }
    i__1 = *k;
    for (i__ = nsp1; i__ <= i__1; ++i__) {
	temp1 = beta[i__];
	i__2 = *neqn;
	for (l = 1; l <= i__2; ++l) {
/* L205: */
	    phi[l + i__ * phi_dim1] = temp1 * phi[l + i__ * phi_dim1];
	}
/* L210: */
    }

/*   PREDICT SOLUTION AND DIFFERENCES */

L215:
    i__1 = *neqn;
    for (l = 1; l <= i__1; ++l) {
	phi[l + kp2 * phi_dim1] = phi[l + kp1 * phi_dim1];
	phi[l + kp1 * phi_dim1] = 0.;
/* L220: */
	p[l] = 0.;
    }
    i__1 = *k;
    for (j = 1; j <= i__1; ++j) {
	i__ = kp1 - j;
	ip1 = i__ + 1;
	temp2 = g[i__];
	i__2 = *neqn;
	for (l = 1; l <= i__2; ++l) {
	    p[l] += temp2 * phi[l + i__ * phi_dim1];
/* L225: */
	    phi[l + i__ * phi_dim1] += phi[l + ip1 * phi_dim1];
	}
/* L230: */
    }
    if (*nornd) {
	goto L240;
    }
    i__1 = *neqn;
    for (l = 1; l <= i__1; ++l) {
	tau = *h__ * p[l] - phi[l + phi_dim1 * 15];
	p[l] = y[l] + tau;
/* L235: */
	phi[l + (phi_dim1 << 4)] = p[l] - y[l] - tau;
    }
    goto L250;
L240:
    i__1 = *neqn;
    for (l = 1; l <= i__1; ++l) {
/* L245: */
	p[l] = y[l] + *h__ * p[l];
    }
L250:
    *xold = *x;
    *x += *h__;
    absh = abs(*h__);
    (*df)(x, &p[1], &yp[1], &rpar[1], &ipar[1]);

/*   ESTIMATE ERRORS AT ORDERS K,K-1,K-2 */

    erkm2 = 0.;
    erkm1 = 0.;
    erk = 0.;
    i__1 = *neqn;
    for (l = 1; l <= i__1; ++l) {
	temp3 = 1. / wt[l];
	temp4 = yp[l] - phi[l + phi_dim1];
	if (km2 < 0) {
	    goto L265;
	} else if (km2 == 0) {
	    goto L260;
	} else {
	    goto L255;
	}
L255:
/* Computing 2nd power */
	d__1 = (phi[l + km1 * phi_dim1] + temp4) * temp3;
	erkm2 += d__1 * d__1;
L260:
/* Computing 2nd power */
	d__1 = (phi[l + *k * phi_dim1] + temp4) * temp3;
	erkm1 += d__1 * d__1;
L265:
/* Computing 2nd power */
	d__1 = temp4 * temp3;
	erk += d__1 * d__1;
    }
    if (km2 < 0) {
	goto L280;
    } else if (km2 == 0) {
	goto L275;
    } else {
	goto L270;
    }
L270:
    erkm2 = absh * sig[km1] * gstr[km2 - 1] * sqrt(erkm2);
L275:
    erkm1 = absh * sig[*k] * gstr[km1 - 1] * sqrt(erkm1);
L280:
    temp5 = absh * sqrt(erk);
    err = temp5 * (g[*k] - g[kp1]);
    erk = temp5 * sig[kp1] * gstr[*k - 1];
    knew = *k;

/*   TEST IF ORDER SHOULD BE LOWERED */

    if (km2 < 0) {
	goto L299;
    } else if (km2 == 0) {
	goto L290;
    } else {
	goto L285;
    }
L285:
    if (max(erkm1,erkm2) <= erk) {
	knew = km1;
    }
    goto L299;
L290:
    if (erkm1 <= erk * .5) {
	knew = km1;
    }

/*   TEST IF STEP SUCCESSFUL */

L299:
    if (err <= *eps) {
	goto L400;
    }
/*       ***     END BLOCK 2     *** */

/*       ***     BEGIN BLOCK 3     *** */
/*   THE STEP IS UNSUCCESSFUL.  RESTORE  X, PHI(*,*), PSI(*) . */
/*   IF THIRD CONSECUTIVE FAILURE, SET ORDER TO ONE.  IF STEP FAILS MORE */
/*   THAN THREE TIMES, CONSIDER AN OPTIMAL STEP SIZE.  DOUBLE ERROR */
/*   TOLERANCE AND RETURN IF ESTIMATED STEP SIZE IS TOO SMALL FOR MACHINE */
/*   PRECISION. */
/*                   *** */

/*   RESTORE X, PHI(*,*) AND PSI(*) */

    *phase1 = FALSE_;
    *x = *xold;
    i__1 = *k;
    for (i__ = 1; i__ <= i__1; ++i__) {
	temp1 = 1. / beta[i__];
	ip1 = i__ + 1;
	i__2 = *neqn;
	for (l = 1; l <= i__2; ++l) {
/* L305: */
	    phi[l + i__ * phi_dim1] = temp1 * (phi[l + i__ * phi_dim1] - phi[
		    l + ip1 * phi_dim1]);
	}
/* L310: */
    }
    if (*k < 2) {
	goto L320;
    }
    i__1 = *k;
    for (i__ = 2; i__ <= i__1; ++i__) {
/* L315: */
	psi[i__ - 1] = psi[i__] - *h__;
    }

/*   ON THIRD FAILURE, SET ORDER TO ONE.  THEREAFTER, USE OPTIMAL STEP */
/*   SIZE */

L320:
    ++ifail;
    temp2 = .5;
    if ((i__1 = ifail - 3) < 0) {
	goto L335;
    } else if (i__1 == 0) {
	goto L330;
    } else {
	goto L325;
    }
L325:
    if (p5eps < erk * .25) {
	temp2 = sqrt(p5eps / erk);
    }
L330:
    knew = 1;
L335:
    *h__ = temp2 * *h__;
    *k = knew;
    *ns = 0;
    if (abs(*h__) >= *fouru * abs(*x)) {
	goto L340;
    }
    *crash = TRUE_;
    d__1 = *fouru * abs(*x);
    *h__ = d_sign(&d__1, h__);
    *eps += *eps;
    return 0;
L340:
    goto L100;
/*       ***     END BLOCK 3     *** */

/*       ***     BEGIN BLOCK 4     *** */
/*   THE STEP IS SUCCESSFUL.  CORRECT THE PREDICTED SOLUTION, EVALUATE */
/*   THE DERIVATIVES USING THE CORRECTED SOLUTION AND UPDATE THE */
/*   DIFFERENCES.  DETERMINE BEST ORDER AND STEP SIZE FOR NEXT STEP. */
/*                   *** */
L400:
    *kold = *k;
    *hold = *h__;

/*   CORRECT AND EVALUATE */

    temp1 = *h__ * g[kp1];
    if (*nornd) {
	goto L410;
    }
    i__1 = *neqn;
    for (l = 1; l <= i__1; ++l) {
	temp3 = y[l];
	rho = temp1 * (yp[l] - phi[l + phi_dim1]) - phi[l + (phi_dim1 << 4)];
	y[l] = p[l] + rho;
	phi[l + phi_dim1 * 15] = y[l] - p[l] - rho;
/* L405: */
	p[l] = temp3;
    }
    goto L420;
L410:
    i__1 = *neqn;
    for (l = 1; l <= i__1; ++l) {
	temp3 = y[l];
	y[l] = p[l] + temp1 * (yp[l] - phi[l + phi_dim1]);
/* L415: */
	p[l] = temp3;
    }
L420:
    (*df)(x, &y[1], &yp[1], &rpar[1], &ipar[1]);

/*   UPDATE DIFFERENCES FOR NEXT STEP */

    i__1 = *neqn;
    for (l = 1; l <= i__1; ++l) {
	phi[l + kp1 * phi_dim1] = yp[l] - phi[l + phi_dim1];
/* L425: */
	phi[l + kp2 * phi_dim1] = phi[l + kp1 * phi_dim1] - phi[l + kp2 * 
		phi_dim1];
    }
    i__1 = *k;
    for (i__ = 1; i__ <= i__1; ++i__) {
	i__2 = *neqn;
	for (l = 1; l <= i__2; ++l) {
/* L430: */
	    phi[l + i__ * phi_dim1] += phi[l + kp1 * phi_dim1];
	}
/* L435: */
    }

/*   ESTIMATE ERROR AT ORDER K+1 UNLESS: */
/*     IN FIRST PHASE WHEN ALWAYS RAISE ORDER, */
/*     ALREADY DECIDED TO LOWER ORDER, */
/*     STEP SIZE NOT CONSTANT SO ESTIMATE UNRELIABLE */

    erkp1 = 0.;
    if (knew == km1 || *k == 12) {
	*phase1 = FALSE_;
    }
    if (*phase1) {
	goto L450;
    }
    if (knew == km1) {
	goto L455;
    }
    if (kp1 > *ns) {
	goto L460;
    }
    i__1 = *neqn;
    for (l = 1; l <= i__1; ++l) {
/* L440: */
/* Computing 2nd power */
	d__1 = phi[l + kp2 * phi_dim1] / wt[l];
	erkp1 += d__1 * d__1;
    }
    erkp1 = absh * gstr[kp1 - 1] * sqrt(erkp1);

/*   USING ESTIMATED ERROR AT ORDER K+1, DETERMINE APPROPRIATE ORDER */
/*   FOR NEXT STEP */

    if (*k > 1) {
	goto L445;
    }
    if (erkp1 >= erk * .5) {
	goto L460;
    }
    goto L450;
L445:
    if (erkm1 <= min(erk,erkp1)) {
	goto L455;
    }
    if (erkp1 >= erk || *k == 12) {
	goto L460;
    }

/*   HERE ERKP1 .LT. ERK .LT. MAX(ERKM1,ERKM2) ELSE ORDER WOULD HAVE */
/*   BEEN LOWERED IN BLOCK 2.  THUS ORDER IS TO BE RAISED */

/*   RAISE ORDER */

L450:
    *k = kp1;
    erk = erkp1;
    goto L460;

/*   LOWER ORDER */

L455:
    *k = km1;
    erk = erkm1;

/*   WITH NEW ORDER DETERMINE APPROPRIATE STEP SIZE FOR NEXT STEP */

L460:
    hnew = *h__ + *h__;
    if (*phase1) {
	goto L465;
    }
    if (p5eps >= erk * two[*k]) {
	goto L465;
    }
    hnew = *h__;
    if (p5eps >= erk) {
	goto L465;
    }
    temp2 = (doublereal) (*k + 1);
    d__1 = p5eps / erk;
    d__2 = 1. / temp2;
    r__ = pow_dd(&d__1, &d__2);
/* Computing MAX */
    d__1 = .5, d__2 = min(.9,r__);
    hnew = absh * max(d__1,d__2);
/* Computing MAX */
    d__2 = hnew, d__3 = *fouru * abs(*x);
    d__1 = max(d__2,d__3);
    hnew = d_sign(&d__1, h__);
L465:
    *h__ = hnew;
    return 0;
/*       ***     END BLOCK 4     *** */
} /* dsteps_ */

/* DECK FDUMP */
/* Subroutine */ int fdump_(void)
{
/* ***BEGIN PROLOGUE  FDUMP */
/* ***PURPOSE  Symbolic dump (should be locally written). */
/* ***LIBRARY   SLATEC (XERROR) */
/* ***CATEGORY  R3 */
/* ***TYPE      ALL (FDUMP-A) */
/* ***KEYWORDS  ERROR, XERMSG */
/* ***AUTHOR  Jones, R. E., (SNLA) */
/* ***DESCRIPTION */

/*        ***Note*** Machine Dependent Routine */
/*        FDUMP is intended to be replaced by a locally written */
/*        version which produces a symbolic dump.  Failing this, */
/*        it should be replaced by a version which prints the */
/*        subprogram nesting list.  Note that this dump must be */
/*        printed on each of up to five files, as indicated by the */
/*        XGETUA routine.  See XSETUA and XGETUA for details. */

/*     Written by Ron Jones, with SLATEC Common Math Library Subcommittee */

/* ***REFERENCES  (NONE) */
/* ***ROUTINES CALLED  (NONE) */
/* ***REVISION HISTORY  (YYMMDD) */
/*   790801  DATE WRITTEN */
/*   861211  REVISION DATE from Version 3.2 */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/* ***END PROLOGUE  FDUMP */
/* ***FIRST EXECUTABLE STATEMENT  FDUMP */
    return 0;
} /* fdump_ */

/* DECK I1MACH */
integer i1mach_(integer *i__)
{
    /* Initialized data */

    static integer imach[16] = { 5,6,6,6,32,4,2,31,2147483647,2,24,-126,127,
	    53,-1022,1023 };

    /* Format strings */
    static char fmt_9000[] = "(\0021ERROR    1 IN I1MACH - I OUT OF BOUND"
	    "S\002)";

    /* System generated locals */
    integer ret_val;

    /* Builtin functions */
    integer s_wsfe(cilist *), e_wsfe(void);
    /* Subroutine */ int s_stop(char *, ftnlen);

    /* Local variables */
    integer output;

    /* Fortran I/O blocks */
    static cilist io___163 = { 0, 0, 0, fmt_9000, 0 };


/* ***BEGIN PROLOGUE  I1MACH */
/* ***PURPOSE  Return integer machine dependent constants. */
/* ***LIBRARY   SLATEC */
/* ***CATEGORY  R1 */
/* ***TYPE      INTEGER (I1MACH-I) */
/* ***KEYWORDS  MACHINE CONSTANTS */
/* ***AUTHOR  Fox, P. A., (Bell Labs) */
/*           Hall, A. D., (Bell Labs) */
/*           Schryer, N. L., (Bell Labs) */
/* ***DESCRIPTION */

/*   I1MACH can be used to obtain machine-dependent parameters for the */
/*   local machine environment.  It is a function subprogram with one */
/*   (input) argument and can be referenced as follows: */

/*        K = I1MACH(I) */

/*   where I=1,...,16.  The (output) value of K above is determined by */
/*   the (input) value of I.  The results for various values of I are */
/*   discussed below. */

/*   I/O unit numbers: */
/*     I1MACH( 1) = the standard input unit. */
/*     I1MACH( 2) = the standard output unit. */
/*     I1MACH( 3) = the standard punch unit. */
/*     I1MACH( 4) = the standard error message unit. */

/*   Words: */
/*     I1MACH( 5) = the number of bits per integer storage unit. */
/*     I1MACH( 6) = the number of characters per integer storage unit. */

/*   Integers: */
/*     assume integers are represented in the S-digit, base-A form */

/*                sign ( X(S-1)*A**(S-1) + ... + X(1)*A + X(0) ) */

/*                where 0 .LE. X(I) .LT. A for I=0,...,S-1. */
/*     I1MACH( 7) = A, the base. */
/*     I1MACH( 8) = S, the number of base-A digits. */
/*     I1MACH( 9) = A**S - 1, the largest magnitude. */

/*   Floating-Point Numbers: */
/*     Assume floating-point numbers are represented in the T-digit, */
/*     base-B form */
/*                sign (B**E)*( (X(1)/B) + ... + (X(T)/B**T) ) */

/*                where 0 .LE. X(I) .LT. B for I=1,...,T, */
/*                0 .LT. X(1), and EMIN .LE. E .LE. EMAX. */
/*     I1MACH(10) = B, the base. */

/*   Single-Precision: */
/*     I1MACH(11) = T, the number of base-B digits. */
/*     I1MACH(12) = EMIN, the smallest exponent E. */
/*     I1MACH(13) = EMAX, the largest exponent E. */

/*   Double-Precision: */
/*     I1MACH(14) = T, the number of base-B digits. */
/*     I1MACH(15) = EMIN, the smallest exponent E. */
/*     I1MACH(16) = EMAX, the largest exponent E. */

/*   To alter this function for a particular environment, the desired */
/*   set of DATA statements should be activated by removing the C from */
/*   column 1.  Also, the values of I1MACH(1) - I1MACH(4) should be */
/*   checked for consistency with the local operating system. */

/* ***REFERENCES  P. A. Fox, A. D. Hall and N. L. Schryer, Framework for */
/*                 a portable library, ACM Transactions on Mathematical */
/*                 Software 4, 2 (June 1978), pp. 177-188. */
/* ***ROUTINES CALLED  (NONE) */
/* ***REVISION HISTORY  (YYMMDD) */
/*   750101  DATE WRITTEN */
/*   891012  Added VAX G-floating constants.  (WRB) */
/*   891012  REVISION DATE from Version 3.2 */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900618  Added DEC RISC constants.  (WRB) */
/*   900723  Added IBM RS 6000 constants.  (WRB) */
/*   901009  Correct I1MACH(7) for IBM Mainframes. Should be 2 not 16. */
/*           (RWC) */
/*   910710  Added HP 730 constants.  (SMR) */
/*   911114  Added Convex IEEE constants.  (WRB) */
/*   920121  Added SUN -r8 compiler option constants.  (WRB) */
/*   920229  Added Touchstone Delta i860 constants.  (WRB) */
/*   920501  Reformatted the REFERENCES section.  (WRB) */
/*   920625  Added Convex -p8 and -pd8 compiler option constants. */
/*           (BKS, WRB) */
/*   930201  Added DEC Alpha and SGI constants.  (RWC and WRB) */
/*   930618  Corrected I1MACH(5) for Convex -p8 and -pd8 compiler */
/*           options.  (DWL, RWC and WRB). */
/*   010817  Elevated IEEE to highest importance; see next set of */
/*           comments below.  (DWL) */
/* ***END PROLOGUE  I1MACH */

/* Initial data here correspond to the IEEE standard.  If one of the */
/* sets of initial data below is preferred, do the necessary commenting */
/* and uncommenting. (DWL) */
/* c      EQUIVALENCE (IMACH(4),OUTPUT) */

/*     MACHINE CONSTANTS FOR THE AMIGA */
/*     ABSOFT COMPILER */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          5 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         31 / */
/*     DATA IMACH( 9) / 2147483647 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -126 / */
/*     DATA IMACH(13) /        127 / */
/*     DATA IMACH(14) /         53 / */
/*     DATA IMACH(15) /      -1022 / */
/*     DATA IMACH(16) /       1023 / */

/*     MACHINE CONSTANTS FOR THE APOLLO */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          6 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         31 / */
/*     DATA IMACH( 9) / 2147483647 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -125 / */
/*     DATA IMACH(13) /        129 / */
/*     DATA IMACH(14) /         53 / */
/*     DATA IMACH(15) /      -1021 / */
/*     DATA IMACH(16) /       1025 / */

/*     MACHINE CONSTANTS FOR THE BURROUGHS 1700 SYSTEM */

/*     DATA IMACH( 1) /          7 / */
/*     DATA IMACH( 2) /          2 / */
/*     DATA IMACH( 3) /          2 / */
/*     DATA IMACH( 4) /          2 / */
/*     DATA IMACH( 5) /         36 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         33 / */
/*     DATA IMACH( 9) / Z1FFFFFFFF / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -256 / */
/*     DATA IMACH(13) /        255 / */
/*     DATA IMACH(14) /         60 / */
/*     DATA IMACH(15) /       -256 / */
/*     DATA IMACH(16) /        255 / */

/*     MACHINE CONSTANTS FOR THE BURROUGHS 5700 SYSTEM */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          7 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         48 / */
/*     DATA IMACH( 6) /          6 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         39 / */
/*     DATA IMACH( 9) / O0007777777777777 / */
/*     DATA IMACH(10) /          8 / */
/*     DATA IMACH(11) /         13 / */
/*     DATA IMACH(12) /        -50 / */
/*     DATA IMACH(13) /         76 / */
/*     DATA IMACH(14) /         26 / */
/*     DATA IMACH(15) /        -50 / */
/*     DATA IMACH(16) /         76 / */

/*     MACHINE CONSTANTS FOR THE BURROUGHS 6700/7700 SYSTEMS */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          7 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         48 / */
/*     DATA IMACH( 6) /          6 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         39 / */
/*     DATA IMACH( 9) / O0007777777777777 / */
/*     DATA IMACH(10) /          8 / */
/*     DATA IMACH(11) /         13 / */
/*     DATA IMACH(12) /        -50 / */
/*     DATA IMACH(13) /         76 / */
/*     DATA IMACH(14) /         26 / */
/*     DATA IMACH(15) /     -32754 / */
/*     DATA IMACH(16) /      32780 / */

/*     MACHINE CONSTANTS FOR THE CDC 170/180 SERIES USING NOS/VE */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          7 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         64 / */
/*     DATA IMACH( 6) /          8 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         63 / */
/*     DATA IMACH( 9) / 9223372036854775807 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         47 / */
/*     DATA IMACH(12) /      -4095 / */
/*     DATA IMACH(13) /       4094 / */
/*     DATA IMACH(14) /         94 / */
/*     DATA IMACH(15) /      -4095 / */
/*     DATA IMACH(16) /       4094 / */

/*     MACHINE CONSTANTS FOR THE CDC 6000/7000 SERIES */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          7 / */
/*     DATA IMACH( 4) /    6LOUTPUT/ */
/*     DATA IMACH( 5) /         60 / */
/*     DATA IMACH( 6) /         10 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         48 / */
/*     DATA IMACH( 9) / 00007777777777777777B / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         47 / */
/*     DATA IMACH(12) /       -929 / */
/*     DATA IMACH(13) /       1070 / */
/*     DATA IMACH(14) /         94 / */
/*     DATA IMACH(15) /       -929 / */
/*     DATA IMACH(16) /       1069 / */

/*     MACHINE CONSTANTS FOR THE CELERITY C1260 */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          6 / */
/*     DATA IMACH( 4) /          0 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         31 / */
/*     DATA IMACH( 9) / Z'7FFFFFFF' / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -126 / */
/*     DATA IMACH(13) /        127 / */
/*     DATA IMACH(14) /         53 / */
/*     DATA IMACH(15) /      -1022 / */
/*     DATA IMACH(16) /       1023 / */

/*     MACHINE CONSTANTS FOR THE CONVEX */
/*     USING THE -fn COMPILER OPTION */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          7 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         31 / */
/*     DATA IMACH( 9) / 2147483647 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -127 / */
/*     DATA IMACH(13) /        127 / */
/*     DATA IMACH(14) /         53 / */
/*     DATA IMACH(15) /      -1023 / */
/*     DATA IMACH(16) /       1023 / */

/*     MACHINE CONSTANTS FOR THE CONVEX */
/*     USING THE -fi COMPILER OPTION */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          7 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         31 / */
/*     DATA IMACH( 9) / 2147483647 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -125 / */
/*     DATA IMACH(13) /        128 / */
/*     DATA IMACH(14) /         53 / */
/*     DATA IMACH(15) /      -1021 / */
/*     DATA IMACH(16) /       1024 / */

/*     MACHINE CONSTANTS FOR THE CONVEX */
/*     USING THE -p8 COMPILER OPTION */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          7 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         64 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         63 / */
/*     DATA IMACH( 9) / 9223372036854775807 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         53 / */
/*     DATA IMACH(12) /      -1023 / */
/*     DATA IMACH(13) /       1023 / */
/*     DATA IMACH(14) /        113 / */
/*     DATA IMACH(15) /     -16383 / */
/*     DATA IMACH(16) /      16383 / */

/*     MACHINE CONSTANTS FOR THE CONVEX */
/*     USING THE -pd8 COMPILER OPTION */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          7 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         64 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         63 / */
/*     DATA IMACH( 9) / 9223372036854775807 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         53 / */
/*     DATA IMACH(12) /      -1023 / */
/*     DATA IMACH(13) /       1023 / */
/*     DATA IMACH(14) /         53 / */
/*     DATA IMACH(15) /      -1023 / */
/*     DATA IMACH(16) /       1023 / */

/*     MACHINE CONSTANTS FOR THE CRAY */
/*     USING THE 46 BIT INTEGER COMPILER OPTION */

/*     DATA IMACH( 1) /        100 / */
/*     DATA IMACH( 2) /        101 / */
/*     DATA IMACH( 3) /        102 / */
/*     DATA IMACH( 4) /        101 / */
/*     DATA IMACH( 5) /         64 / */
/*     DATA IMACH( 6) /          8 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         46 / */
/*     DATA IMACH( 9) / 1777777777777777B / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         47 / */
/*     DATA IMACH(12) /      -8189 / */
/*     DATA IMACH(13) /       8190 / */
/*     DATA IMACH(14) /         94 / */
/*     DATA IMACH(15) /      -8099 / */
/*     DATA IMACH(16) /       8190 / */

/*     MACHINE CONSTANTS FOR THE CRAY */
/*     USING THE 64 BIT INTEGER COMPILER OPTION */

/*     DATA IMACH( 1) /        100 / */
/*     DATA IMACH( 2) /        101 / */
/*     DATA IMACH( 3) /        102 / */
/*     DATA IMACH( 4) /        101 / */
/*     DATA IMACH( 5) /         64 / */
/*     DATA IMACH( 6) /          8 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         63 / */
/*     DATA IMACH( 9) / 777777777777777777777B / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         47 / */
/*     DATA IMACH(12) /      -8189 / */
/*     DATA IMACH(13) /       8190 / */
/*     DATA IMACH(14) /         94 / */
/*     DATA IMACH(15) /      -8099 / */
/*     DATA IMACH(16) /       8190 / */

/*     MACHINE CONSTANTS FOR THE DATA GENERAL ECLIPSE S/200 */

/*     DATA IMACH( 1) /         11 / */
/*     DATA IMACH( 2) /         12 / */
/*     DATA IMACH( 3) /          8 / */
/*     DATA IMACH( 4) /         10 / */
/*     DATA IMACH( 5) /         16 / */
/*     DATA IMACH( 6) /          2 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         15 / */
/*     DATA IMACH( 9) /      32767 / */
/*     DATA IMACH(10) /         16 / */
/*     DATA IMACH(11) /          6 / */
/*     DATA IMACH(12) /        -64 / */
/*     DATA IMACH(13) /         63 / */
/*     DATA IMACH(14) /         14 / */
/*     DATA IMACH(15) /        -64 / */
/*     DATA IMACH(16) /         63 / */

/*     MACHINE CONSTANTS FOR THE DEC ALPHA */
/*     USING G_FLOAT */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          5 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         31 / */
/*     DATA IMACH( 9) / 2147483647 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -127 / */
/*     DATA IMACH(13) /        127 / */
/*     DATA IMACH(14) /         53 / */
/*     DATA IMACH(15) /      -1023 / */
/*     DATA IMACH(16) /       1023 / */

/*     MACHINE CONSTANTS FOR THE DEC ALPHA */
/*     USING IEEE_FLOAT */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          6 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         31 / */
/*     DATA IMACH( 9) / 2147483647 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -125 / */
/*     DATA IMACH(13) /        128 / */
/*     DATA IMACH(14) /         53 / */
/*     DATA IMACH(15) /      -1021 / */
/*     DATA IMACH(16) /       1024 / */

/*     MACHINE CONSTANTS FOR THE DEC RISC */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          6 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         31 / */
/*     DATA IMACH( 9) / 2147483647 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -125 / */
/*     DATA IMACH(13) /        128 / */
/*     DATA IMACH(14) /         53 / */
/*     DATA IMACH(15) /      -1021 / */
/*     DATA IMACH(16) /       1024 / */

/*     MACHINE CONSTANTS FOR THE DEC VAX */
/*     USING D_FLOATING */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          5 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         31 / */
/*     DATA IMACH( 9) / 2147483647 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -127 / */
/*     DATA IMACH(13) /        127 / */
/*     DATA IMACH(14) /         56 / */
/*     DATA IMACH(15) /       -127 / */
/*     DATA IMACH(16) /        127 / */

/*     MACHINE CONSTANTS FOR THE DEC VAX */
/*     USING G_FLOATING */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          5 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         31 / */
/*     DATA IMACH( 9) / 2147483647 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -127 / */
/*     DATA IMACH(13) /        127 / */
/*     DATA IMACH(14) /         53 / */
/*     DATA IMACH(15) /      -1023 / */
/*     DATA IMACH(16) /       1023 / */

/*     MACHINE CONSTANTS FOR THE ELXSI 6400 */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          6 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         32 / */
/*     DATA IMACH( 9) / 2147483647 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -126 / */
/*     DATA IMACH(13) /        127 / */
/*     DATA IMACH(14) /         53 / */
/*     DATA IMACH(15) /      -1022 / */
/*     DATA IMACH(16) /       1023 / */

/*     MACHINE CONSTANTS FOR THE HARRIS 220 */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          0 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         24 / */
/*     DATA IMACH( 6) /          3 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         23 / */
/*     DATA IMACH( 9) /    8388607 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         23 / */
/*     DATA IMACH(12) /       -127 / */
/*     DATA IMACH(13) /        127 / */
/*     DATA IMACH(14) /         38 / */
/*     DATA IMACH(15) /       -127 / */
/*     DATA IMACH(16) /        127 / */

/*     MACHINE CONSTANTS FOR THE HONEYWELL 600/6000 SERIES */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /         43 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         36 / */
/*     DATA IMACH( 6) /          6 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         35 / */
/*     DATA IMACH( 9) / O377777777777 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         27 / */
/*     DATA IMACH(12) /       -127 / */
/*     DATA IMACH(13) /        127 / */
/*     DATA IMACH(14) /         63 / */
/*     DATA IMACH(15) /       -127 / */
/*     DATA IMACH(16) /        127 / */

/*     MACHINE CONSTANTS FOR THE HP 730 */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          6 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         31 / */
/*     DATA IMACH( 9) / 2147483647 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -125 / */
/*     DATA IMACH(13) /        128 / */
/*     DATA IMACH(14) /         53 / */
/*     DATA IMACH(15) /      -1021 / */
/*     DATA IMACH(16) /       1024 / */

/*     MACHINE CONSTANTS FOR THE HP 2100 */
/*     3 WORD DOUBLE PRECISION OPTION WITH FTN4 */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          4 / */
/*     DATA IMACH( 4) /          1 / */
/*     DATA IMACH( 5) /         16 / */
/*     DATA IMACH( 6) /          2 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         15 / */
/*     DATA IMACH( 9) /      32767 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         23 / */
/*     DATA IMACH(12) /       -128 / */
/*     DATA IMACH(13) /        127 / */
/*     DATA IMACH(14) /         39 / */
/*     DATA IMACH(15) /       -128 / */
/*     DATA IMACH(16) /        127 / */

/*     MACHINE CONSTANTS FOR THE HP 2100 */
/*     4 WORD DOUBLE PRECISION OPTION WITH FTN4 */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          4 / */
/*     DATA IMACH( 4) /          1 / */
/*     DATA IMACH( 5) /         16 / */
/*     DATA IMACH( 6) /          2 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         15 / */
/*     DATA IMACH( 9) /      32767 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         23 / */
/*     DATA IMACH(12) /       -128 / */
/*     DATA IMACH(13) /        127 / */
/*     DATA IMACH(14) /         55 / */
/*     DATA IMACH(15) /       -128 / */
/*     DATA IMACH(16) /        127 / */

/*     MACHINE CONSTANTS FOR THE HP 9000 */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          6 / */
/*     DATA IMACH( 4) /          7 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         32 / */
/*     DATA IMACH( 9) / 2147483647 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -126 / */
/*     DATA IMACH(13) /        127 / */
/*     DATA IMACH(14) /         53 / */
/*     DATA IMACH(15) /      -1015 / */
/*     DATA IMACH(16) /       1017 / */

/*     MACHINE CONSTANTS FOR THE IBM 360/370 SERIES, */
/*     THE XEROX SIGMA 5/7/9, THE SEL SYSTEMS 85/86, AND */
/*     THE PERKIN ELMER (INTERDATA) 7/32. */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          7 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         31 / */
/*     DATA IMACH( 9) /  Z7FFFFFFF / */
/*     DATA IMACH(10) /         16 / */
/*     DATA IMACH(11) /          6 / */
/*     DATA IMACH(12) /        -64 / */
/*     DATA IMACH(13) /         63 / */
/*     DATA IMACH(14) /         14 / */
/*     DATA IMACH(15) /        -64 / */
/*     DATA IMACH(16) /         63 / */

/*     MACHINE CONSTANTS FOR THE IBM PC */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          0 / */
/*     DATA IMACH( 4) /          0 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         31 / */
/*     DATA IMACH( 9) / 2147483647 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -125 / */
/*     DATA IMACH(13) /        127 / */
/*     DATA IMACH(14) /         53 / */
/*     DATA IMACH(15) /      -1021 / */
/*     DATA IMACH(16) /       1023 / */

/*     MACHINE CONSTANTS FOR THE IBM RS 6000 */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          6 / */
/*     DATA IMACH( 4) /          0 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         31 / */
/*     DATA IMACH( 9) / 2147483647 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -125 / */
/*     DATA IMACH(13) /        128 / */
/*     DATA IMACH(14) /         53 / */
/*     DATA IMACH(15) /      -1021 / */
/*     DATA IMACH(16) /       1024 / */

/*     MACHINE CONSTANTS FOR THE INTEL i860 */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          6 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         31 / */
/*     DATA IMACH( 9) / 2147483647 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -125 / */
/*     DATA IMACH(13) /        128 / */
/*     DATA IMACH(14) /         53 / */
/*     DATA IMACH(15) /      -1021 / */
/*     DATA IMACH(16) /       1024 / */

/*     MACHINE CONSTANTS FOR THE PDP-10 (KA PROCESSOR) */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          5 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         36 / */
/*     DATA IMACH( 6) /          5 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         35 / */
/*     DATA IMACH( 9) / "377777777777 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         27 / */
/*     DATA IMACH(12) /       -128 / */
/*     DATA IMACH(13) /        127 / */
/*     DATA IMACH(14) /         54 / */
/*     DATA IMACH(15) /       -101 / */
/*     DATA IMACH(16) /        127 / */

/*     MACHINE CONSTANTS FOR THE PDP-10 (KI PROCESSOR) */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          5 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         36 / */
/*     DATA IMACH( 6) /          5 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         35 / */
/*     DATA IMACH( 9) / "377777777777 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         27 / */
/*     DATA IMACH(12) /       -128 / */
/*     DATA IMACH(13) /        127 / */
/*     DATA IMACH(14) /         62 / */
/*     DATA IMACH(15) /       -128 / */
/*     DATA IMACH(16) /        127 / */

/*     MACHINE CONSTANTS FOR PDP-11 FORTRAN SUPPORTING */
/*     32-BIT INTEGER ARITHMETIC. */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          5 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         31 / */
/*     DATA IMACH( 9) / 2147483647 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -127 / */
/*     DATA IMACH(13) /        127 / */
/*     DATA IMACH(14) /         56 / */
/*     DATA IMACH(15) /       -127 / */
/*     DATA IMACH(16) /        127 / */

/*     MACHINE CONSTANTS FOR PDP-11 FORTRAN SUPPORTING */
/*     16-BIT INTEGER ARITHMETIC. */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          5 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         16 / */
/*     DATA IMACH( 6) /          2 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         15 / */
/*     DATA IMACH( 9) /      32767 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -127 / */
/*     DATA IMACH(13) /        127 / */
/*     DATA IMACH(14) /         56 / */
/*     DATA IMACH(15) /       -127 / */
/*     DATA IMACH(16) /        127 / */

/*     MACHINE CONSTANTS FOR THE SILICON GRAPHICS */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          6 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         31 / */
/*     DATA IMACH( 9) / 2147483647 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -125 / */
/*     DATA IMACH(13) /        128 / */
/*     DATA IMACH(14) /         53 / */
/*     DATA IMACH(15) /      -1021 / */
/*     DATA IMACH(16) /       1024 / */

/*     MACHINE CONSTANTS FOR THE SUN */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          6 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         31 / */
/*     DATA IMACH( 9) / 2147483647 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -125 / */
/*     DATA IMACH(13) /        128 / */
/*     DATA IMACH(14) /         53 / */
/*     DATA IMACH(15) /      -1021 / */
/*     DATA IMACH(16) /       1024 / */

/*     MACHINE CONSTANTS FOR THE SUN */
/*     USING THE -r8 COMPILER OPTION */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          6 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         32 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         31 / */
/*     DATA IMACH( 9) / 2147483647 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         53 / */
/*     DATA IMACH(12) /      -1021 / */
/*     DATA IMACH(13) /       1024 / */
/*     DATA IMACH(14) /        113 / */
/*     DATA IMACH(15) /     -16381 / */
/*     DATA IMACH(16) /      16384 / */

/*     MACHINE CONSTANTS FOR THE UNIVAC 1100 SERIES FTN COMPILER */

/*     DATA IMACH( 1) /          5 / */
/*     DATA IMACH( 2) /          6 / */
/*     DATA IMACH( 3) /          1 / */
/*     DATA IMACH( 4) /          6 / */
/*     DATA IMACH( 5) /         36 / */
/*     DATA IMACH( 6) /          4 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         35 / */
/*     DATA IMACH( 9) / O377777777777 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         27 / */
/*     DATA IMACH(12) /       -128 / */
/*     DATA IMACH(13) /        127 / */
/*     DATA IMACH(14) /         60 / */
/*     DATA IMACH(15) /      -1024 / */
/*     DATA IMACH(16) /       1023 / */

/*     MACHINE CONSTANTS FOR THE Z80 MICROPROCESSOR */

/*     DATA IMACH( 1) /          1 / */
/*     DATA IMACH( 2) /          1 / */
/*     DATA IMACH( 3) /          0 / */
/*     DATA IMACH( 4) /          1 / */
/*     DATA IMACH( 5) /         16 / */
/*     DATA IMACH( 6) /          2 / */
/*     DATA IMACH( 7) /          2 / */
/*     DATA IMACH( 8) /         15 / */
/*     DATA IMACH( 9) /      32767 / */
/*     DATA IMACH(10) /          2 / */
/*     DATA IMACH(11) /         24 / */
/*     DATA IMACH(12) /       -127 / */
/*     DATA IMACH(13) /        127 / */
/*     DATA IMACH(14) /         56 / */
/*     DATA IMACH(15) /       -127 / */
/*     DATA IMACH(16) /        127 / */

/* ***FIRST EXECUTABLE STATEMENT  I1MACH */
    if (*i__ < 1 || *i__ > 16) {
	goto L10;
    }

    ret_val = imach[*i__ - 1];
    return ret_val;

L10:
    io___163.ciunit = output;
    s_wsfe(&io___163);
    e_wsfe();

/*     CALL FDUMP */

    s_stop("", (ftnlen)0);
    return ret_val;
} /* i1mach_ */

/* DECK DHSTRT */
/* Subroutine */ int dhstrt_(S_fp df, integer *neq, doublereal *a, doublereal 
	*b, doublereal *y, doublereal *yprime, doublereal *etol, integer *
	morder, doublereal *small, doublereal *big, doublereal *spy, 
	doublereal *pv, doublereal *yp, doublereal *sf, doublereal *rpar, 
	integer *ipar, doublereal *h__)
{
    /* System generated locals */
    integer i__1, i__2;
    doublereal d__1, d__2, d__3, d__4;

    /* Builtin functions */
    double pow_dd(doublereal *, doublereal *), d_sign(doublereal *, 
	    doublereal *), d_lg10(doublereal *), sqrt(doublereal);

    /* Local variables */
    integer j, k;
    doublereal da;
    integer lk;
    doublereal dx, dy, fbnd, delf, dely, ydpb, tolp, dfdub, dfdxb, absdx, 
	    relper;
    extern doublereal dhvnrm_(doublereal *, integer *);
    doublereal tolmin, srydpb, tolexp, tolsum;

/* ***BEGIN PROLOGUE  DHSTRT */
/* ***SUBSIDIARY */
/* ***PURPOSE  Subsidiary to DDEABM, DDEBDF and DDERKF */
/* ***LIBRARY   SLATEC */
/* ***TYPE      DOUBLE PRECISION (HSTART-S, DHSTRT-D) */
/* ***AUTHOR  Watts, H. A., (SNLA) */
/* ***DESCRIPTION */

/*   DHSTRT computes a starting step size to be used in solving initial */
/*   value problems in ordinary differential equations. */

/* ********************************************************************** */
/*  ABSTRACT */

/*     Subroutine DHSTRT computes a starting step size to be used by an */
/*     initial value method in solving ordinary differential equations. */
/*     It is based on an estimate of the local Lipschitz constant for the */
/*     differential equation   (lower bound on a norm of the Jacobian) , */
/*     a bound on the differential equation  (first derivative) , and */
/*     a bound on the partial derivative of the equation with respect to */
/*     the independent variable. */
/*     (all approximated near the initial point A) */

/*     Subroutine DHSTRT uses a function subprogram DHVNRM for computing */
/*     a vector norm. The maximum norm is presently utilized though it */
/*     can easily be replaced by any other vector norm. It is presumed */
/*     that any replacement norm routine would be carefully coded to */
/*     prevent unnecessary underflows or overflows from occurring, and */
/*     also, would not alter the vector or number of components. */

/* ********************************************************************** */
/*  On input you must provide the following */

/*      DF -- This is a subroutine of the form */
/*                               DF(X,U,UPRIME,RPAR,IPAR) */
/*             which defines the system of first order differential */
/*             equations to be solved. For the given values of X and the */
/*             vector  U(*)=(U(1),U(2),...,U(NEQ)) , the subroutine must */
/*             evaluate the NEQ components of the system of differential */
/*             equations  DU/DX=DF(X,U)  and store the derivatives in the */
/*             array UPRIME(*), that is,  UPRIME(I) = * DU(I)/DX *  for */
/*             equations I=1,...,NEQ. */

/*             Subroutine DF must not alter X or U(*). You must declare */
/*             the name DF in an external statement in your program that */
/*             calls DHSTRT. You must dimension U and UPRIME in DF. */

/*             RPAR and IPAR are DOUBLE PRECISION and INTEGER parameter */
/*             arrays which you can use for communication between your */
/*             program and subroutine DF. They are not used or altered by */
/*             DHSTRT. If you do not need RPAR or IPAR, ignore these */
/*             parameters by treating them as dummy arguments. If you do */
/*             choose to use them, dimension them in your program and in */
/*             DF as arrays of appropriate length. */

/*      NEQ -- This is the number of (first order) differential equations */
/*             to be integrated. */

/*      A -- This is the initial point of integration. */

/*      B -- This is a value of the independent variable used to define */
/*             the direction of integration. A reasonable choice is to */
/*             set  B  to the first point at which a solution is desired. */
/*             You can also use  B, if necessary, to restrict the length */
/*             of the first integration step because the algorithm will */
/*             not compute a starting step length which is bigger than */
/*             ABS(B-A), unless  B  has been chosen too close to  A. */
/*             (it is presumed that DHSTRT has been called with  B */
/*             different from  A  on the machine being used. Also see the */
/*             discussion about the parameter  SMALL.) */

/*      Y(*) -- This is the vector of initial values of the NEQ solution */
/*             components at the initial point  A. */

/*      YPRIME(*) -- This is the vector of derivatives of the NEQ */
/*             solution components at the initial point  A. */
/*             (defined by the differential equations in subroutine DF) */

/*      ETOL -- This is the vector of error tolerances corresponding to */
/*             the NEQ solution components. It is assumed that all */
/*             elements are positive. Following the first integration */
/*             step, the tolerances are expected to be used by the */
/*             integrator in an error test which roughly requires that */
/*                        ABS(LOCAL ERROR)  .LE.  ETOL */
/*             for each vector component. */

/*      MORDER -- This is the order of the formula which will be used by */
/*             the initial value method for taking the first integration */
/*             step. */

/*      SMALL -- This is a small positive machine dependent constant */
/*             which is used for protecting against computations with */
/*             numbers which are too small relative to the precision of */
/*             floating point arithmetic.  SMALL  should be set to */
/*             (approximately) the smallest positive DOUBLE PRECISION */
/*             number such that  (1.+SMALL) .GT. 1.  on the machine being */
/*             used. The quantity  SMALL**(3/8)  is used in computing */
/*             increments of variables for approximating derivatives by */
/*             differences.  Also the algorithm will not compute a */
/*             starting step length which is smaller than */
/*             100*SMALL*ABS(A). */

/*      BIG -- This is a large positive machine dependent constant which */
/*             is used for preventing machine overflows. A reasonable */
/*             choice is to set big to (approximately) the square root of */
/*             the largest DOUBLE PRECISION number which can be held in */
/*             the machine. */

/*      SPY(*),PV(*),YP(*),SF(*) -- These are DOUBLE PRECISION work */
/*             arrays of length NEQ which provide the routine with needed */
/*             storage space. */

/*      RPAR,IPAR -- These are parameter arrays, of DOUBLE PRECISION and */
/*             INTEGER type, respectively, which can be used for */
/*             communication between your program and the DF subroutine. */
/*             They are not used or altered by DHSTRT. */

/* ********************************************************************** */
/*  On Output  (after the return from DHSTRT), */

/*      H -- is an appropriate starting step size to be attempted by the */
/*             differential equation method. */

/*           All parameters in the call list remain unchanged except for */
/*           the working arrays SPY(*),PV(*),YP(*), and SF(*). */

/* ********************************************************************** */

/* ***SEE ALSO  DDEABM, DDEBDF, DDERKF */
/* ***ROUTINES CALLED  DHVNRM */
/* ***REVISION HISTORY  (YYMMDD) */
/*   820301  DATE WRITTEN */
/*   890531  Changed all specific intrinsics to generic.  (WRB) */
/*   890831  Modified array declarations.  (WRB) */
/*   890911  Removed unnecessary intrinsics.  (WRB) */
/*   891024  Changed references from DVNORM to DHVNRM.  (WRB) */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900328  Added TYPE section.  (WRB) */
/*   910722  Updated AUTHOR section.  (ALS) */
/* ***END PROLOGUE  DHSTRT */


/*     .................................................................. */

/*     BEGIN BLOCK PERMITTING ...EXITS TO 160 */
/* ***FIRST EXECUTABLE STATEMENT  DHSTRT */
    /* Parameter adjustments */
    --ipar;
    --rpar;
    --sf;
    --yp;
    --pv;
    --spy;
    --etol;
    --yprime;
    --y;

    /* Function Body */
    dx = *b - *a;
    absdx = abs(dx);
    relper = pow_dd(small, &c_b400);

/*        ............................................................... */

/*             COMPUTE AN APPROXIMATE BOUND (DFDXB) ON THE PARTIAL */
/*             DERIVATIVE OF THE EQUATION WITH RESPECT TO THE */
/*             INDEPENDENT VARIABLE. PROTECT AGAINST AN OVERFLOW. */
/*             ALSO COMPUTE A BOUND (FBND) ON THE FIRST DERIVATIVE */
/*             LOCALLY. */

/* Computing MAX */
/* Computing MIN */
    d__4 = relper * abs(*a);
    d__2 = min(d__4,absdx), d__3 = *small * 100. * abs(*a);
    d__1 = max(d__2,d__3);
    da = d_sign(&d__1, &dx);
    if (da == 0.) {
	da = relper * dx;
    }
    d__1 = *a + da;
    (*df)(&d__1, &y[1], &sf[1], &rpar[1], &ipar[1]);
    i__1 = *neq;
    for (j = 1; j <= i__1; ++j) {
	yp[j] = sf[j] - yprime[j];
/* L10: */
    }
    delf = dhvnrm_(&yp[1], neq);
    dfdxb = *big;
    if (delf < *big * abs(da)) {
	dfdxb = delf / abs(da);
    }
    fbnd = dhvnrm_(&sf[1], neq);

/*        ............................................................... */

/*             COMPUTE AN ESTIMATE (DFDUB) OF THE LOCAL LIPSCHITZ */
/*             CONSTANT FOR THE SYSTEM OF DIFFERENTIAL EQUATIONS. THIS */
/*             ALSO REPRESENTS AN ESTIMATE OF THE NORM OF THE JACOBIAN */
/*             LOCALLY.  THREE ITERATIONS (TWO WHEN NEQ=1) ARE USED TO */
/*             ESTIMATE THE LIPSCHITZ CONSTANT BY NUMERICAL DIFFERENCES. */
/*             THE FIRST PERTURBATION VECTOR IS BASED ON THE INITIAL */
/*             DERIVATIVES AND DIRECTION OF INTEGRATION. THE SECOND */
/*             PERTURBATION VECTOR IS FORMED USING ANOTHER EVALUATION OF */
/*             THE DIFFERENTIAL EQUATION.  THE THIRD PERTURBATION VECTOR */
/*             IS FORMED USING PERTURBATIONS BASED ONLY ON THE INITIAL */
/*             VALUES. COMPONENTS THAT ARE ZERO ARE ALWAYS CHANGED TO */
/*             NON-ZERO VALUES (EXCEPT ON THE FIRST ITERATION). WHEN */
/*             INFORMATION IS AVAILABLE, CARE IS TAKEN TO ENSURE THAT */
/*             COMPONENTS OF THE PERTURBATION VECTOR HAVE SIGNS WHICH ARE */
/*             CONSISTENT WITH THE SLOPES OF LOCAL SOLUTION CURVES. */
/*             ALSO CHOOSE THE LARGEST BOUND (FBND) FOR THE FIRST */
/*             DERIVATIVE. */

/*                               PERTURBATION VECTOR SIZE IS HELD */
/*                               CONSTANT FOR ALL ITERATIONS. COMPUTE */
/*                               THIS CHANGE FROM THE */
/*                                       SIZE OF THE VECTOR OF INITIAL */
/*                                       VALUES. */
    dely = relper * dhvnrm_(&y[1], neq);
    if (dely == 0.) {
	dely = relper;
    }
    dely = d_sign(&dely, &dx);
    delf = dhvnrm_(&yprime[1], neq);
    fbnd = max(fbnd,delf);
    if (delf == 0.) {
	goto L30;
    }
/*           USE INITIAL DERIVATIVES FOR FIRST PERTURBATION */
    i__1 = *neq;
    for (j = 1; j <= i__1; ++j) {
	spy[j] = yprime[j];
	yp[j] = yprime[j];
/* L20: */
    }
    goto L50;
L30:
/*           CANNOT HAVE A NULL PERTURBATION VECTOR */
    i__1 = *neq;
    for (j = 1; j <= i__1; ++j) {
	spy[j] = 0.;
	yp[j] = 1.;
/* L40: */
    }
    delf = dhvnrm_(&yp[1], neq);
L50:

    dfdub = 0.;
/* Computing MIN */
    i__1 = *neq + 1;
    lk = min(i__1,3);
    i__1 = lk;
    for (k = 1; k <= i__1; ++k) {
/*           DEFINE PERTURBED VECTOR OF INITIAL VALUES */
	i__2 = *neq;
	for (j = 1; j <= i__2; ++j) {
	    pv[j] = y[j] + dely * (yp[j] / delf);
/* L60: */
	}
	if (k == 2) {
	    goto L80;
	}
/*              EVALUATE DERIVATIVES ASSOCIATED WITH PERTURBED */
/*              VECTOR  AND  COMPUTE CORRESPONDING DIFFERENCES */
	(*df)(a, &pv[1], &yp[1], &rpar[1], &ipar[1]);
	i__2 = *neq;
	for (j = 1; j <= i__2; ++j) {
	    pv[j] = yp[j] - yprime[j];
/* L70: */
	}
	goto L100;
L80:
/*              USE A SHIFTED VALUE OF THE INDEPENDENT VARIABLE */
/*                                    IN COMPUTING ONE ESTIMATE */
	d__1 = *a + da;
	(*df)(&d__1, &pv[1], &yp[1], &rpar[1], &ipar[1]);
	i__2 = *neq;
	for (j = 1; j <= i__2; ++j) {
	    pv[j] = yp[j] - sf[j];
/* L90: */
	}
L100:
/*           CHOOSE LARGEST BOUNDS ON THE FIRST DERIVATIVE */
/*                          AND A LOCAL LIPSCHITZ CONSTANT */
/* Computing MAX */
	d__1 = fbnd, d__2 = dhvnrm_(&yp[1], neq);
	fbnd = max(d__1,d__2);
	delf = dhvnrm_(&pv[1], neq);
/*        ...EXIT */
	if (delf >= *big * abs(dely)) {
	    goto L150;
	}
/* Computing MAX */
	d__1 = dfdub, d__2 = delf / abs(dely);
	dfdub = max(d__1,d__2);
/*     ......EXIT */
	if (k == lk) {
	    goto L160;
	}
/*           CHOOSE NEXT PERTURBATION VECTOR */
	if (delf == 0.) {
	    delf = 1.;
	}
	i__2 = *neq;
	for (j = 1; j <= i__2; ++j) {
	    if (k == 2) {
		goto L110;
	    }
	    dy = (d__1 = pv[j], abs(d__1));
	    if (dy == 0.) {
		dy = delf;
	    }
	    goto L120;
L110:
	    dy = y[j];
	    if (dy == 0.) {
		dy = dely / relper;
	    }
L120:
	    if (spy[j] == 0.) {
		spy[j] = yp[j];
	    }
	    if (spy[j] != 0.) {
		dy = d_sign(&dy, &spy[j]);
	    }
	    yp[j] = dy;
/* L130: */
	}
	delf = dhvnrm_(&yp[1], neq);
/* L140: */
    }
L150:

/*        PROTECT AGAINST AN OVERFLOW */
    dfdub = *big;
L160:

/*     .................................................................. */

/*          COMPUTE A BOUND (YDPB) ON THE NORM OF THE SECOND DERIVATIVE */

    ydpb = dfdxb + dfdub * fbnd;

/*     .................................................................. */

/*          DEFINE THE TOLERANCE PARAMETER UPON WHICH THE STARTING STEP */
/*          SIZE IS TO BE BASED.  A VALUE IN THE MIDDLE OF THE ERROR */
/*          TOLERANCE RANGE IS SELECTED. */

    tolmin = *big;
    tolsum = 0.;
    i__1 = *neq;
    for (k = 1; k <= i__1; ++k) {
	tolexp = d_lg10(&etol[k]);
	tolmin = min(tolmin,tolexp);
	tolsum += tolexp;
/* L170: */
    }
    d__1 = (tolsum / *neq + tolmin) * .5 / (*morder + 1);
    tolp = pow_dd(&c_b418, &d__1);

/*     .................................................................. */

/*          COMPUTE A STARTING STEP SIZE BASED ON THE ABOVE FIRST AND */
/*          SECOND DERIVATIVE INFORMATION */

/*                            RESTRICT THE STEP LENGTH TO BE NOT BIGGER */
/*                            THAN ABS(B-A).   (UNLESS  B  IS TOO CLOSE */
/*                            TO  A) */
    *h__ = absdx;

    if (ydpb != 0. || fbnd != 0.) {
	goto L180;
    }

/*        BOTH FIRST DERIVATIVE TERM (FBND) AND SECOND */
/*                     DERIVATIVE TERM (YDPB) ARE ZERO */
    if (tolp < 1.) {
	*h__ = absdx * tolp;
    }
    goto L200;
L180:

    if (ydpb != 0.) {
	goto L190;
    }

/*        ONLY SECOND DERIVATIVE TERM (YDPB) IS ZERO */
    if (tolp < fbnd * absdx) {
	*h__ = tolp / fbnd;
    }
    goto L200;
L190:

/*        SECOND DERIVATIVE TERM (YDPB) IS NON-ZERO */
    srydpb = sqrt(ydpb * .5);
    if (tolp < srydpb * absdx) {
	*h__ = tolp / srydpb;
    }
L200:

/*     FURTHER RESTRICT THE STEP LENGTH TO BE NOT */
/*                               BIGGER THAN  1/DFDUB */
    if (*h__ * dfdub > 1.) {
	*h__ = 1. / dfdub;
    }

/*     FINALLY, RESTRICT THE STEP LENGTH TO BE NOT */
/*     SMALLER THAN  100*SMALL*ABS(A).  HOWEVER, IF */
/*     A=0. AND THE COMPUTED H UNDERFLOWED TO ZERO, */
/*     THE ALGORITHM RETURNS  SMALL*ABS(B)  FOR THE */
/*                                     STEP LENGTH. */
/* Computing MAX */
    d__1 = *h__, d__2 = *small * 100. * abs(*a);
    *h__ = max(d__1,d__2);
    if (*h__ == 0.) {
	*h__ = *small * abs(*b);
    }

/*     NOW SET DIRECTION OF INTEGRATION */
    *h__ = d_sign(h__, &dx);

    return 0;
} /* dhstrt_ */

/* DECK DHVNRM */
doublereal dhvnrm_(doublereal *v, integer *ncomp)
{
    /* System generated locals */
    integer i__1;
    doublereal ret_val, d__1, d__2, d__3;

    /* Local variables */
    integer k;

/* ***BEGIN PROLOGUE  DHVNRM */
/* ***SUBSIDIARY */
/* ***PURPOSE  Subsidiary to DDEABM, DDEBDF and DDERKF */
/* ***LIBRARY   SLATEC */
/* ***TYPE      DOUBLE PRECISION (HVNRM-S, DHVNRM-D) */
/* ***AUTHOR  Watts, H. A., (SNLA) */
/* ***DESCRIPTION */

/*     Compute the maximum norm of the vector V(*) of length NCOMP and */
/*     return the result as DHVNRM */

/* ***SEE ALSO  DDEABM, DDEBDF, DDERKF */
/* ***ROUTINES CALLED  (NONE) */
/* ***REVISION HISTORY  (YYMMDD) */
/*   820301  DATE WRITTEN */
/*   890531  Changed all specific intrinsics to generic.  (WRB) */
/*   890831  Modified array declarations.  (WRB) */
/*   891024  Changed references from DVNORM to DHVNRM.  (WRB) */
/*   891024  Changed routine name from DVNORM to DHVNRM.  (WRB) */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900328  Added TYPE section.  (WRB) */
/*   910722  Updated AUTHOR section.  (ALS) */
/* ***END PROLOGUE  DHVNRM */

/* ***FIRST EXECUTABLE STATEMENT  DHVNRM */
    /* Parameter adjustments */
    --v;

    /* Function Body */
    ret_val = 0.;
    i__1 = *ncomp;
    for (k = 1; k <= i__1; ++k) {
/* Computing MAX */
	d__2 = ret_val, d__3 = (d__1 = v[k], abs(d__1));
	ret_val = max(d__2,d__3);
/* L10: */
    }
    return ret_val;
} /* dhvnrm_ */

/* DECK J4SAVE */
integer j4save_(integer *iwhich, integer *ivalue, logical *iset)
{
    /* Initialized data */

    static integer iparam[9] = { 0,2,0,10,1,0,0,0,0 };

    /* System generated locals */
    integer ret_val;

/* ***BEGIN PROLOGUE  J4SAVE */
/* ***SUBSIDIARY */
/* ***PURPOSE  Save or recall global variables needed by error */
/*            handling routines. */
/* ***LIBRARY   SLATEC (XERROR) */
/* ***TYPE      INTEGER (J4SAVE-I) */
/* ***KEYWORDS  ERROR MESSAGES, ERROR NUMBER, RECALL, SAVE, XERROR */
/* ***AUTHOR  Jones, R. E., (SNLA) */
/* ***DESCRIPTION */

/*     Abstract */
/*        J4SAVE saves and recalls several global variables needed */
/*        by the library error handling routines. */

/*     Description of Parameters */
/*      --Input-- */
/*        IWHICH - Index of item desired. */
/*                = 1 Refers to current error number. */
/*                = 2 Refers to current error control flag. */
/*                = 3 Refers to current unit number to which error */
/*                    messages are to be sent.  (0 means use standard.) */
/*                = 4 Refers to the maximum number of times any */
/*                     message is to be printed (as set by XERMAX). */
/*                = 5 Refers to the total number of units to which */
/*                     each error message is to be written. */
/*                = 6 Refers to the 2nd unit for error messages */
/*                = 7 Refers to the 3rd unit for error messages */
/*                = 8 Refers to the 4th unit for error messages */
/*                = 9 Refers to the 5th unit for error messages */
/*        IVALUE - The value to be set for the IWHICH-th parameter, */
/*                 if ISET is .TRUE. . */
/*        ISET   - If ISET=.TRUE., the IWHICH-th parameter will BE */
/*                 given the value, IVALUE.  If ISET=.FALSE., the */
/*                 IWHICH-th parameter will be unchanged, and IVALUE */
/*                 is a dummy parameter. */
/*      --Output-- */
/*        The (old) value of the IWHICH-th parameter will be returned */
/*        in the function value, J4SAVE. */

/* ***SEE ALSO  XERMSG */
/* ***REFERENCES  R. E. Jones and D. K. Kahaner, XERROR, the SLATEC */
/*                 Error-handling Package, SAND82-0800, Sandia */
/*                 Laboratories, 1982. */
/* ***ROUTINES CALLED  (NONE) */
/* ***REVISION HISTORY  (YYMMDD) */
/*   790801  DATE WRITTEN */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900205  Minor modifications to prologue.  (WRB) */
/*   900402  Added TYPE section.  (WRB) */
/*   910411  Added KEYWORDS section.  (WRB) */
/*   920501  Reformatted the REFERENCES section.  (WRB) */
/* ***END PROLOGUE  J4SAVE */
/* ***FIRST EXECUTABLE STATEMENT  J4SAVE */
    ret_val = iparam[(0 + (0 + (*iwhich - 1 << 2))) / 4];
    if (*iset) {
	iparam[*iwhich - 1] = *ivalue;
    }
    return ret_val;
} /* j4save_ */

/* DECK XERCNT */
/* Subroutine */ int xercnt_(char *librar, char *subrou, char *messg, integer 
	*nerr, integer *level, integer *kontrl, ftnlen librar_len, ftnlen 
	subrou_len, ftnlen messg_len)
{
/* ***BEGIN PROLOGUE  XERCNT */
/* ***SUBSIDIARY */
/* ***PURPOSE  Allow user control over handling of errors. */
/* ***LIBRARY   SLATEC (XERROR) */
/* ***CATEGORY  R3C */
/* ***TYPE      ALL (XERCNT-A) */
/* ***KEYWORDS  ERROR, XERROR */
/* ***AUTHOR  Jones, R. E., (SNLA) */
/* ***DESCRIPTION */

/*     Abstract */
/*        Allows user control over handling of individual errors. */
/*        Just after each message is recorded, but before it is */
/*        processed any further (i.e., before it is printed or */
/*        a decision to abort is made), a call is made to XERCNT. */
/*        If the user has provided his own version of XERCNT, he */
/*        can then override the value of KONTROL used in processing */
/*        this message by redefining its value. */
/*        KONTRL may be set to any value from -2 to 2. */
/*        The meanings for KONTRL are the same as in XSETF, except */
/*        that the value of KONTRL changes only for this message. */
/*        If KONTRL is set to a value outside the range from -2 to 2, */
/*        it will be moved back into that range. */

/*     Description of Parameters */

/*      --Input-- */
/*        LIBRAR - the library that the routine is in. */
/*        SUBROU - the subroutine that XERMSG is being called from */
/*        MESSG  - the first 20 characters of the error message. */
/*        NERR   - same as in the call to XERMSG. */
/*        LEVEL  - same as in the call to XERMSG. */
/*        KONTRL - the current value of the control flag as set */
/*                 by a call to XSETF. */

/*      --Output-- */
/*        KONTRL - the new value of KONTRL.  If KONTRL is not */
/*                 defined, it will remain at its original value. */
/*                 This changed value of control affects only */
/*                 the current occurrence of the current message. */

/* ***REFERENCES  R. E. Jones and D. K. Kahaner, XERROR, the SLATEC */
/*                 Error-handling Package, SAND82-0800, Sandia */
/*                 Laboratories, 1982. */
/* ***ROUTINES CALLED  (NONE) */
/* ***REVISION HISTORY  (YYMMDD) */
/*   790801  DATE WRITTEN */
/*   861211  REVISION DATE from Version 3.2 */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900206  Routine changed from user-callable to subsidiary.  (WRB) */
/*   900510  Changed calling sequence to include LIBRARY and SUBROUTINE */
/*           names, changed routine name from XERCTL to XERCNT.  (RWC) */
/*   920501  Reformatted the REFERENCES section.  (WRB) */
/* ***END PROLOGUE  XERCNT */
/* ***FIRST EXECUTABLE STATEMENT  XERCNT */
    return 0;
} /* xercnt_ */

/* DECK XERHLT */
/* Subroutine */ int xerhlt_(char *messg, ftnlen messg_len)
{
    /* Builtin functions */
    /* Subroutine */ int s_stop(char *, ftnlen);

/* ***BEGIN PROLOGUE  XERHLT */
/* ***SUBSIDIARY */
/* ***PURPOSE  Abort program execution and print error message. */
/* ***LIBRARY   SLATEC (XERROR) */
/* ***CATEGORY  R3C */
/* ***TYPE      ALL (XERHLT-A) */
/* ***KEYWORDS  ABORT PROGRAM EXECUTION, ERROR, XERROR */
/* ***AUTHOR  Jones, R. E., (SNLA) */
/* ***DESCRIPTION */

/*     Abstract */
/*        ***Note*** machine dependent routine */
/*        XERHLT aborts the execution of the program. */
/*        The error message causing the abort is given in the calling */
/*        sequence, in case one needs it for printing on a dayfile, */
/*        for example. */

/*     Description of Parameters */
/*        MESSG is as in XERMSG. */

/* ***REFERENCES  R. E. Jones and D. K. Kahaner, XERROR, the SLATEC */
/*                 Error-handling Package, SAND82-0800, Sandia */
/*                 Laboratories, 1982. */
/* ***ROUTINES CALLED  (NONE) */
/* ***REVISION HISTORY  (YYMMDD) */
/*   790801  DATE WRITTEN */
/*   861211  REVISION DATE from Version 3.2 */
/*   891214  Prologue converted to Version 4.0 format.  (BAB) */
/*   900206  Routine changed from user-callable to subsidiary.  (WRB) */
/*   900510  Changed calling sequence to delete length of character */
/*           and changed routine name from XERABT to XERHLT.  (RWC) */
/*   920501  Reformatted the REFERENCES section.  (WRB) */
/* ***END PROLOGUE  XERHLT */
/* ***FIRST EXECUTABLE STATEMENT  XERHLT */
    s_stop("", (ftnlen)0);
    return 0;
} /* xerhlt_ */

