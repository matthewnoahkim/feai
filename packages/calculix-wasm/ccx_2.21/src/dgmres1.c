/* dgmres1.f -- translated by f2c (version 20200916).
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

struct {
    doublereal soln[1];
} dslblk_;

#define dslblk_1 dslblk_

/* Table of constant values */

static integer c__3 = 3;
static integer c__1 = 1;


/*    SLATEC: public domain */

/*    Change on 20180508 (eight of May 2018): matvec and msolve were */
/*                       removed from all argument lists, i.e. these */
/*                       surroutine names are fixed now (G. Dhondt) */
/*                       Needed for the multithreading parallellization */

/* DECK DGMRES1 */
/* Subroutine */ int dgmres1_(integer *n, doublereal *b, doublereal *x, 
	integer *nelt, integer *ia, integer *ja, doublereal *a, integer *isym,
	 integer *itol, doublereal *tol, integer *itmax, integer *iter, 
	doublereal *err, integer *ierr, integer *iunit, doublereal *sb, 
	doublereal *sx, doublereal *rgwk, integer *lrgw, integer *igwk, 
	integer *ligw, doublereal *rwork, integer *iwork)
{
    /* System generated locals */
    integer i__1;
    doublereal d__1;

    /* Builtin functions */
    double sqrt(doublereal);

    /* Local variables */
    integer i__, lq, lr, lv, lw, lz, ldl, kmp, nms, lxl;
    doublereal sum;
    integer lzm1, lhes;
    doublereal bnrm;
    integer jpre;
    doublereal rhol;
    integer lgmr, maxl, nmsl;
    extern doublereal dnrm2_(integer *, doublereal *, integer *);
    integer iflag, jscal;
    extern /* Subroutine */ int dcopy_(integer *, doublereal *, integer *, 
	    doublereal *, integer *);
    integer nrmax;
    extern doublereal d1mach_(integer *);
    integer nrsts, maxlp1;
    extern /* Subroutine */ int matvec_(integer *, doublereal *, doublereal *,
	     integer *, integer *, integer *, doublereal *, integer *), 
	    msolve_(integer *, doublereal *, doublereal *, integer *, integer 
	    *, integer *, doublereal *, integer *, doublereal *, integer *), 
	    dpigmr1_(integer *, doublereal *, doublereal *, doublereal *, 
	    integer *, integer *, integer *, integer *, integer *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *,
	     integer *, doublereal *, integer *, doublereal *, doublereal *, 
	    doublereal *, integer *, doublereal *, doublereal *, doublereal *,
	     doublereal *, integer *, doublereal *, integer *, integer *, 
	    integer *, doublereal *, integer *, integer *, integer *, 
	    doublereal *);

/* ***BEGIN PROLOGUE  DGMRES */
/* ***PURPOSE  Preconditioned GMRES iterative sparse Ax=b solver. */
/*            This routine uses the generalized minimum residual */
/*            (GMRES) method with preconditioning to solve */
/*            non-symmetric linear systems of the form: Ax = b. */
/* ***LIBRARY   SLATEC (SLAP) */
/* ***CATEGORY  D2A4, D2B4 */
/* ***TYPE      DOUBLE PRECISION (SGMRES-S, DGMRES-D) */
/* ***KEYWORDS  GENERALIZED MINIMUM RESIDUAL, ITERATIVE PRECONDITION, */
/*             NON-SYMMETRIC LINEAR SYSTEM, SLAP, SPARSE */
/* ***AUTHOR  Brown, Peter, (LLNL), pnbrown@llnl.gov */
/*           Hindmarsh, Alan, (LLNL), alanh@llnl.gov */
/*           Seager, Mark K., (LLNL), seager@llnl.gov */
/*             Lawrence Livermore National Laboratory */
/*             PO Box 808, L-60 */
/*             Livermore, CA 94550 (510) 423-3141 */
/* ***DESCRIPTION */

/* *Usage: */
/*      INTEGER   N, NELT, IA(NELT), JA(NELT), ISYM, ITOL, ITMAX */
/*      INTEGER   ITER, IERR, IUNIT, LRGW, IGWK(LIGW), LIGW */
/*      INTEGER   IWORK(USER DEFINED) */
/*      DOUBLE PRECISION B(N), X(N), A(NELT), TOL, ERR, SB(N), SX(N) */
/*      DOUBLE PRECISION RGWK(LRGW), RWORK(USER DEFINED) */
/*      EXTERNAL  MATVEC, MSOLVE */

/*      CALL DGMRES(N, B, X, NELT, IA, JA, A, ISYM, MATVEC, MSOLVE, */
/*     $     ITOL, TOL, ITMAX, ITER, ERR, IERR, IUNIT, SB, SX, */
/*     $     RGWK, LRGW, IGWK, LIGW, RWORK, IWORK) */

/* *Arguments: */
/* N      :IN       Integer. */
/*         Order of the Matrix. */
/* B      :IN       Double Precision B(N). */
/*         Right-hand side vector. */
/* X      :INOUT    Double Precision X(N). */
/*         On input X is your initial guess for the solution vector. */
/*         On output X is the final approximate solution. */
/* NELT   :IN       Integer. */
/*         Number of Non-Zeros stored in A. */
/* IA     :IN       Integer IA(NELT). */
/* JA     :IN       Integer JA(NELT). */
/* A      :IN       Double Precision A(NELT). */
/*         These arrays contain the matrix data structure for A. */
/*         It could take any form.  See "Description", below, */
/*         for more details. */
/* ISYM   :IN       Integer. */
/*         Flag to indicate symmetric storage format. */
/*         If ISYM=0, all non-zero entries of the matrix are stored. */
/*         If ISYM=1, the matrix is symmetric, and only the upper */
/*         or lower triangle of the matrix is stored. */
/* MATVEC :EXT      External. */
/*         Name of a routine which performs the matrix vector multiply */
/*         Y = A*X given A and X.  The name of the MATVEC routine must */
/*         be declared external in the calling program.  The calling */
/*         sequence to MATVEC is: */
/*             CALL MATVEC(N, X, Y, NELT, IA, JA, A, ISYM) */
/*         where N is the number of unknowns, Y is the product A*X */
/*         upon return, X is an input vector, and NELT is the number of */
/*         non-zeros in the SLAP IA, JA, A storage for the matrix A. */
/*         ISYM is a flag which, if non-zero, denotes that A is */
/*         symmetric and only the lower or upper triangle is stored. */
/* MSOLVE :EXT      External. */
/*         Name of the routine which solves a linear system Mz = r for */
/*         z given r with the preconditioning matrix M (M is supplied via */
/*         RWORK and IWORK arrays.  The name of the MSOLVE routine must */
/*         be declared external in the calling program.  The calling */
/*         sequence to MSOLVE is: */
/*             CALL MSOLVE(N, R, Z, NELT, IA, JA, A, ISYM, RWORK, IWORK) */
/*         Where N is the number of unknowns, R is the right-hand side */
/*         vector and Z is the solution upon return.  NELT, IA, JA, A and */
/*         ISYM are defined as above.  RWORK is a double precision array */
/*         that can be used to pass necessary preconditioning information */
/*         and/or workspace to MSOLVE.  IWORK is an integer work array */
/*         for the same purpose as RWORK. */
/* ITOL   :IN       Integer. */
/*         Flag to indicate the type of convergence criterion used. */
/*         ITOL=0  Means the  iteration stops when the test described */
/*                 below on  the  residual RL  is satisfied.  This is */
/*                 the  "Natural Stopping Criteria" for this routine. */
/*                 Other values  of   ITOL  cause  extra,   otherwise */
/*                 unnecessary, computation per iteration and     are */
/*                 therefore  much less  efficient.  See  ISDGMR (the */
/*                 stop test routine) for more information. */
/*         ITOL=1  Means   the  iteration stops   when the first test */
/*                 described below on  the residual RL  is satisfied, */
/*                 and there  is either right  or  no preconditioning */
/*                 being used. */
/*         ITOL=2  Implies     that   the  user    is   using    left */
/*                 preconditioning, and the second stopping criterion */
/*                 below is used. */
/*         ITOL=3  Means the  iteration stops   when  the  third test */
/*                 described below on Minv*Residual is satisfied, and */
/*                 there is either left  or no  preconditioning being */
/*                 used. */
/*         ITOL=11 is    often  useful  for   checking  and comparing */
/*                 different routines.  For this case, the  user must */
/*                 supply  the  "exact" solution or  a  very accurate */
/*                 approximation (one with  an  error much less  than */
/*                 TOL) through a common block, */
/*                     COMMON /DSLBLK/ SOLN( ) */
/*                 If ITOL=11, iteration stops when the 2-norm of the */
/*                 difference between the iterative approximation and */
/*                 the user-supplied solution  divided by the  2-norm */
/*                 of the  user-supplied solution  is  less than TOL. */
/*                 Note that this requires  the  user to  set up  the */
/*                 "COMMON     /DSLBLK/ SOLN(LENGTH)"  in the calling */
/*                 routine.  The routine with this declaration should */
/*                 be loaded before the stop test so that the correct */
/*                 length is used by  the loader.  This procedure  is */
/*                 not standard Fortran and may not work correctly on */
/*                 your   system (although  it  has  worked  on every */
/*                 system the authors have tried).  If ITOL is not 11 */
/*                 then this common block is indeed standard Fortran. */
/* TOL    :INOUT    Double Precision. */
/*         Convergence criterion, as described below.  If TOL is set */
/*         to zero on input, then a default value of 500*(the smallest */
/*         positive magnitude, machine epsilon) is used. */
/* ITMAX  :DUMMY    Integer. */
/*         Maximum number of iterations in most SLAP routines.  In */
/*         this routine this does not make sense.  The maximum number */
/*         of iterations here is given by ITMAX = MAXL*(NRMAX+1). */
/*         See IGWK for definitions of MAXL and NRMAX. */
/* ITER   :OUT      Integer. */
/*         Number of iterations required to reach convergence, or */
/*         ITMAX if convergence criterion could not be achieved in */
/*         ITMAX iterations. */
/* ERR    :OUT      Double Precision. */
/*         Error estimate of error in final approximate solution, as */
/*         defined by ITOL.  Letting norm() denote the Euclidean */
/*         norm, ERR is defined as follows.. */

/*         If ITOL=0, then ERR = norm(SB*(B-A*X(L)))/norm(SB*B), */
/*                               for right or no preconditioning, and */
/*                         ERR = norm(SB*(M-inverse)*(B-A*X(L)))/ */
/*                                norm(SB*(M-inverse)*B), */
/*                               for left preconditioning. */
/*         If ITOL=1, then ERR = norm(SB*(B-A*X(L)))/norm(SB*B), */
/*                               since right or no preconditioning */
/*                               being used. */
/*         If ITOL=2, then ERR = norm(SB*(M-inverse)*(B-A*X(L)))/ */
/*                                norm(SB*(M-inverse)*B), */
/*                               since left preconditioning is being */
/*                               used. */
/*         If ITOL=3, then ERR =  Max  |(Minv*(B-A*X(L)))(i)/x(i)| */
/*                               i=1,n */
/*         If ITOL=11, then ERR = norm(SB*(X(L)-SOLN))/norm(SB*SOLN). */
/* IERR   :OUT      Integer. */
/*         Return error flag. */
/*               IERR = 0 => All went well. */
/*               IERR = 1 => Insufficient storage allocated for */
/*                           RGWK or IGWK. */
/*               IERR = 2 => Routine DGMRES failed to reduce the norm */
/*                           of the current residual on its last call, */
/*                           and so the iteration has stalled.  In */
/*                           this case, X equals the last computed */
/*                           approximation.  The user must either */
/*                           increase MAXL, or choose a different */
/*                           initial guess. */
/*               IERR =-1 => Insufficient length for RGWK array. */
/*                           IGWK(6) contains the required minimum */
/*                           length of the RGWK array. */
/*               IERR =-2 => Illegal value of ITOL, or ITOL and JPRE */
/*                           values are inconsistent. */
/*         For IERR <= 2, RGWK(1) = RHOL, which is the norm on the */
/*         left-hand-side of the relevant stopping test defined */
/*         below associated with the residual for the current */
/*         approximation X(L). */
/* IUNIT  :IN       Integer. */
/*         Unit number on which to write the error at each iteration, */
/*         if this is desired for monitoring convergence.  If unit */
/*         number is 0, no writing will occur. */
/* SB     :IN       Double Precision SB(N). */
/*         Array of length N containing scale factors for the right */
/*         hand side vector B.  If JSCAL.eq.0 (see below), SB need */
/*         not be supplied. */
/* SX     :IN       Double Precision SX(N). */
/*         Array of length N containing scale factors for the solution */
/*         vector X.  If JSCAL.eq.0 (see below), SX need not be */
/*         supplied.  SB and SX can be the same array in the calling */
/*         program if desired. */
/* RGWK   :INOUT    Double Precision RGWK(LRGW). */
/*         Double Precision array used for workspace by DGMRES. */
/*         On return, RGWK(1) = RHOL.  See IERR for definition of RHOL. */
/* LRGW   :IN       Integer. */
/*         Length of the double precision workspace, RGWK. */
/*         LRGW >= 1 + N*(MAXL+6) + MAXL*(MAXL+3). */
/*         See below for definition of MAXL. */
/*         For the default values, RGWK has size at least 131 + 16*N. */
/* IGWK   :INOUT    Integer IGWK(LIGW). */
/*         The following IGWK parameters should be set by the user */
/*         before calling this routine. */
/*         IGWK(1) = MAXL.  Maximum dimension of Krylov subspace in */
/*            which X - X0 is to be found (where, X0 is the initial */
/*            guess).  The default value of MAXL is 10. */
/*         IGWK(2) = KMP.  Maximum number of previous Krylov basis */
/*            vectors to which each new basis vector is made orthogonal. */
/*            The default value of KMP is MAXL. */
/*         IGWK(3) = JSCAL.  Flag indicating whether the scaling */
/*            arrays SB and SX are to be used. */
/*            JSCAL = 0 => SB and SX are not used and the algorithm */
/*               will perform as if all SB(I) = 1 and SX(I) = 1. */
/*            JSCAL = 1 =>  Only SX is used, and the algorithm */
/*               performs as if all SB(I) = 1. */
/*            JSCAL = 2 =>  Only SB is used, and the algorithm */
/*               performs as if all SX(I) = 1. */
/*            JSCAL = 3 =>  Both SB and SX are used. */
/*         IGWK(4) = JPRE.  Flag indicating whether preconditioning */
/*            is being used. */
/*            JPRE = 0  =>  There is no preconditioning. */
/*            JPRE > 0  =>  There is preconditioning on the right */
/*               only, and the solver will call routine MSOLVE. */
/*            JPRE < 0  =>  There is preconditioning on the left */
/*               only, and the solver will call routine MSOLVE. */
/*         IGWK(5) = NRMAX.  Maximum number of restarts of the */
/*            Krylov iteration.  The default value of NRMAX = 10. */
/*            if IWORK(5) = -1,  then no restarts are performed (in */
/*            this case, NRMAX is set to zero internally). */
/*         The following IWORK parameters are diagnostic information */
/*         made available to the user after this routine completes. */
/*         IGWK(6) = MLWK.  Required minimum length of RGWK array. */
/*         IGWK(7) = NMS.  The total number of calls to MSOLVE. */
/* LIGW   :IN       Integer. */
/*         Length of the integer workspace, IGWK.  LIGW >= 20. */
/* RWORK  :WORK     Double Precision RWORK(USER DEFINED). */
/*         Double Precision array that can be used for workspace in */
/*         MSOLVE. */
/* IWORK  :WORK     Integer IWORK(USER DEFINED). */
/*         Integer array that can be used for workspace in MSOLVE. */

/* *Description: */
/*       DGMRES solves a linear system A*X = B rewritten in the form: */

/*        (SB*A*(M-inverse)*(SX-inverse))*(SX*M*X) = SB*B, */

/*       with right preconditioning, or */

/*        (SB*(M-inverse)*A*(SX-inverse))*(SX*X) = SB*(M-inverse)*B, */

/*       with left preconditioning, where A is an N-by-N double precision */
/*       matrix, X and B are N-vectors,  SB and SX  are diagonal scaling */
/*       matrices,   and M is  a preconditioning    matrix.   It uses */
/*       preconditioned  Krylov   subpace  methods  based     on  the */
/*       generalized minimum residual  method (GMRES).   This routine */
/*       optionally performs  either  the  full     orthogonalization */
/*       version of the  GMRES  algorithm or an incomplete variant of */
/*       it.  Both versions use restarting of the linear iteration by */
/*       default, although the user can disable this feature. */

/*       The GMRES  algorithm generates a sequence  of approximations */
/*       X(L) to the  true solution of the above  linear system.  The */
/*       convergence criteria for stopping the  iteration is based on */
/*       the size  of the  scaled norm of  the residual  R(L)  =  B - */
/*       A*X(L).  The actual stopping test is either: */

/*               norm(SB*(B-A*X(L))) .le. TOL*norm(SB*B), */

/*       for right preconditioning, or */

/*               norm(SB*(M-inverse)*(B-A*X(L))) .le. */
/*                       TOL*norm(SB*(M-inverse)*B), */

/*       for left preconditioning, where norm() denotes the Euclidean */
/*       norm, and TOL is  a positive scalar less  than one  input by */
/*       the user.  If TOL equals zero  when DGMRES is called, then a */
/*       default  value  of 500*(the   smallest  positive  magnitude, */
/*       machine epsilon) is used.  If the  scaling arrays SB  and SX */
/*       are used, then  ideally they  should be chosen  so  that the */
/*       vectors SX*X(or SX*M*X) and  SB*B have all their  components */
/*       approximately equal  to  one in  magnitude.  If one wants to */
/*       use the same scaling in X  and B, then  SB and SX can be the */
/*       same array in the calling program. */

/*       The following is a list of the other routines and their */
/*       functions used by DGMRES: */
/*       DPIGMR  Contains the main iteration loop for GMRES. */
/*       DORTH   Orthogonalizes a new vector against older basis vectors. */
/*       DHEQR   Computes a QR decomposition of a Hessenberg matrix. */
/*       DHELS   Solves a Hessenberg least-squares system, using QR */
/*               factors. */
/*       DRLCAL  Computes the scaled residual RL. */
/*       DXLCAL  Computes the solution XL. */
/*       ISDGMR  User-replaceable stopping routine. */

/*       This routine does  not care  what matrix data   structure is */
/*       used for  A and M.  It simply   calls  the MATVEC and MSOLVE */
/*       routines, with  the arguments as  described above.  The user */
/*       could write any type of structure and the appropriate MATVEC */
/*       and MSOLVE routines.  It is assumed  that A is stored in the */
/*       IA, JA, A  arrays in some fashion and  that M (or INV(M)) is */
/*       stored  in  IWORK  and  RWORK   in  some fashion.   The SLAP */
/*       routines DSDCG and DSICCG are examples of this procedure. */

/*       Two  examples  of  matrix  data structures  are the: 1) SLAP */
/*       Triad  format and 2) SLAP Column format. */

/*       =================== S L A P Triad format =================== */
/*       This routine requires that the  matrix A be   stored in  the */
/*       SLAP  Triad format.  In  this format only the non-zeros  are */
/*       stored.  They may appear in  *ANY* order.  The user supplies */
/*       three arrays of  length NELT, where  NELT is  the number  of */
/*       non-zeros in the matrix: (IA(NELT), JA(NELT), A(NELT)).  For */
/*       each non-zero the user puts the row and column index of that */
/*       matrix element  in the IA and  JA arrays.  The  value of the */
/*       non-zero   matrix  element is  placed  in  the corresponding */
/*       location of the A array.   This is  an  extremely  easy data */
/*       structure to generate.  On  the  other hand it   is  not too */
/*       efficient on vector computers for  the iterative solution of */
/*       linear systems.  Hence,   SLAP changes   this  input    data */
/*       structure to the SLAP Column format  for  the iteration (but */
/*       does not change it back). */

/*       Here is an example of the  SLAP Triad   storage format for a */
/*       5x5 Matrix.  Recall that the entries may appear in any order. */

/*           5x5 Matrix      SLAP Triad format for 5x5 matrix on left. */
/*                              1  2  3  4  5  6  7  8  9 10 11 */
/*       |11 12  0  0 15|   A: 51 12 11 33 15 53 55 22 35 44 21 */
/*       |21 22  0  0  0|  IA:  5  1  1  3  1  5  5  2  3  4  2 */
/*       | 0  0 33  0 35|  JA:  1  2  1  3  5  3  5  2  5  4  1 */
/*       | 0  0  0 44  0| */
/*       |51  0 53  0 55| */

/*       =================== S L A P Column format ================== */

/*       This routine  requires that  the matrix A  be stored in  the */
/*       SLAP Column format.  In this format the non-zeros are stored */
/*       counting down columns (except for  the diagonal entry, which */
/*       must appear first in each  "column")  and are stored  in the */
/*       double precision array A.   In other words,  for each column */
/*       in the matrix put the diagonal entry in  A.  Then put in the */
/*       other non-zero  elements going down  the column (except  the */
/*       diagonal) in order.   The  IA array holds the  row index for */
/*       each non-zero.  The JA array holds the offsets  into the IA, */
/*       A arrays  for  the  beginning  of each   column.   That  is, */
/*       IA(JA(ICOL)),  A(JA(ICOL)) points   to the beginning  of the */
/*       ICOL-th   column    in    IA and   A.      IA(JA(ICOL+1)-1), */
/*       A(JA(ICOL+1)-1) points to  the  end of the   ICOL-th column. */
/*       Note that we always have  JA(N+1) = NELT+1,  where N is  the */
/*       number of columns in  the matrix and NELT  is the number  of */
/*       non-zeros in the matrix. */

/*       Here is an example of the  SLAP Column  storage format for a */
/*       5x5 Matrix (in the A and IA arrays '|'  denotes the end of a */
/*       column): */

/*           5x5 Matrix      SLAP Column format for 5x5 matrix on left. */
/*                              1  2  3    4  5    6  7    8    9 10 11 */
/*       |11 12  0  0 15|   A: 11 21 51 | 22 12 | 33 53 | 44 | 55 15 35 */
/*       |21 22  0  0  0|  IA:  1  2  5 |  2  1 |  3  5 |  4 |  5  1  3 */
/*       | 0  0 33  0 35|  JA:  1  4  6    8  9   12 */
/*       | 0  0  0 44  0| */
/*       |51  0 53  0 55| */

/* *Cautions: */
/*     This routine will attempt to write to the Fortran logical output */
/*     unit IUNIT, if IUNIT .ne. 0.  Thus, the user must make sure that */
/*     this logical unit is attached to a file or terminal before calling */
/*     this routine with a non-zero value for IUNIT.  This routine does */
/*     not check for the validity of a non-zero IUNIT unit number. */

/* ***REFERENCES  1. Peter N. Brown and A. C. Hindmarsh, Reduced Storage */
/*                  Matrix Methods in Stiff ODE Systems, Lawrence Liver- */
/*                  more National Laboratory Report UCRL-95088, Rev. 1, */
/*                  Livermore, California, June 1987. */
/*               2. Mark K. Seager, A SLAP for the Masses, in */
/*                  G. F. Carey, Ed., Parallel Supercomputing: Methods, */
/*                  Algorithms and Applications, Wiley, 1989, pp.135-155. */
/* ***ROUTINES CALLED  D1MACH, DCOPY, DNRM2, DPIGMR */
/* ***REVISION HISTORY  (YYMMDD) */
/*   890404  DATE WRITTEN */
/*   890404  Previous REVISION DATE */
/*   890915  Made changes requested at July 1989 CML Meeting.  (MKS) */
/*   890922  Numerous changes to prologue to make closer to SLATEC */
/*           standard.  (FNF) */
/*   890929  Numerous changes to reduce SP/DP differences.  (FNF) */
/*   891004  Added new reference. */
/*   910411  Prologue converted to Version 4.0 format.  (BAB) */
/*   910506  Corrected errors in C***ROUTINES CALLED list.  (FNF) */
/*   920407  COMMON BLOCK renamed DSLBLK.  (WRB) */
/*   920511  Added complete declaration section.  (WRB) */
/*   920929  Corrected format of references.  (FNF) */
/*   921019  Changed 500.0 to 500 to reduce SP/DP differences.  (FNF) */
/*   921026  Added check for valid value of ITOL.  (FNF) */
/* ***END PROLOGUE  DGMRES */
/*         The following is for optimized compilation on LLNL/LTSS Crays. */
/* LLL. OPTIMIZE */
/*     .. Scalar Arguments .. */
/*     .. Array Arguments .. */
/*     .. Local Scalars .. */
/*     .. External Functions .. */
/*     .. External Subroutines .. */
/*     .. Intrinsic Functions .. */
/* ***FIRST EXECUTABLE STATEMENT  DGMRES */
    /* Parameter adjustments */
    --sx;
    --sb;
    --x;
    --b;
    --a;
    --ja;
    --ia;
    --rgwk;
    --igwk;
    --rwork;
    --iwork;

    /* Function Body */
    *ierr = 0;
/*   ------------------------------------------------------------------ */
/*         Load method parameters with user values or defaults. */
/*   ------------------------------------------------------------------ */
    maxl = igwk[1];
    if (maxl == 0) {
	maxl = 10;
    }
    if (maxl > *n) {
	maxl = *n;
    }
    kmp = igwk[2];
    if (kmp == 0) {
	kmp = maxl;
    }
    if (kmp > maxl) {
	kmp = maxl;
    }
    jscal = igwk[3];
    jpre = igwk[4];
/*         Check for valid value of ITOL. */
    if (*itol < 0 || *itol > 3 && *itol != 11) {
	goto L650;
    }
/*         Check for consistent values of ITOL and JPRE. */
    if (*itol == 1 && jpre < 0) {
	goto L650;
    }
    if (*itol == 2 && jpre >= 0) {
	goto L650;
    }
    nrmax = igwk[5];
    if (nrmax == 0) {
	nrmax = 10;
    }
/*         If NRMAX .eq. -1, then set NRMAX = 0 to turn off restarting. */
    if (nrmax == -1) {
	nrmax = 0;
    }
/*         If input value of TOL is zero, set it to its default value. */
    if (*tol == 0.) {
	*tol = d1mach_(&c__3) * 500;
    }

/*         Initialize counters. */
    *iter = 0;
    nms = 0;
    nrsts = 0;
/*   ------------------------------------------------------------------ */
/*         Form work array segment pointers. */
/*   ------------------------------------------------------------------ */
    maxlp1 = maxl + 1;
    lv = 1;
    lr = lv + *n * maxlp1;
    lhes = lr + *n + 1;
    lq = lhes + maxl * maxlp1;
    ldl = lq + (maxl << 1);
    lw = ldl + *n;
    lxl = lw + *n;
    lz = lxl + *n;

/*         Load IGWK(6) with required minimum length of the RGWK array. */
    igwk[6] = lz + *n - 1;
    if (lz + *n - 1 > *lrgw) {
	goto L640;
    }
/*   ------------------------------------------------------------------ */
/*         Calculate scaled-preconditioned norm of RHS vector b. */
/*   ------------------------------------------------------------------ */
    if (jpre < 0) {
	msolve_(n, &b[1], &rgwk[lr], nelt, &ia[1], &ja[1], &a[1], isym, &
		rwork[1], &iwork[1]);
	++nms;
    } else {
	dcopy_(n, &b[1], &c__1, &rgwk[lr], &c__1);
    }
    if (jscal == 2 || jscal == 3) {
	sum = 0.;
	i__1 = *n;
	for (i__ = 1; i__ <= i__1; ++i__) {
/* Computing 2nd power */
	    d__1 = rgwk[lr - 1 + i__] * sb[i__];
	    sum += d__1 * d__1;
/* L10: */
	}
	bnrm = sqrt(sum);
    } else {
	bnrm = dnrm2_(n, &rgwk[lr], &c__1);
    }
/*   ------------------------------------------------------------------ */
/*         Calculate initial residual. */
/*   ------------------------------------------------------------------ */
    matvec_(n, &x[1], &rgwk[lr], nelt, &ia[1], &ja[1], &a[1], isym);
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	rgwk[lr - 1 + i__] = b[i__] - rgwk[lr - 1 + i__];
/* L50: */
    }
/*   ------------------------------------------------------------------ */
/*         If performing restarting, then load the residual into the */
/*         correct location in the RGWK array. */
/*   ------------------------------------------------------------------ */
L100:
    if (nrsts > nrmax) {
	goto L610;
    }
    if (nrsts > 0) {
/*         Copy the current residual to a different location in the RGWK */
/*         array. */
	dcopy_(n, &rgwk[ldl], &c__1, &rgwk[lr], &c__1);
    }
/*   ------------------------------------------------------------------ */
/*         Use the DPIGMR algorithm to solve the linear system A*Z = R. */
/*   ------------------------------------------------------------------ */
    dpigmr1_(n, &rgwk[lr], &sb[1], &sx[1], &jscal, &maxl, &maxlp1, &kmp, &
	    nrsts, &jpre, &nmsl, &rgwk[lz], &rgwk[lv], &rgwk[lhes], &rgwk[lq],
	     &lgmr, &rwork[1], &iwork[1], &rgwk[lw], &rgwk[ldl], &rhol, &
	    nrmax, &b[1], &bnrm, &x[1], &rgwk[lxl], itol, tol, nelt, &ia[1], &
	    ja[1], &a[1], isym, iunit, &iflag, err);
    *iter += lgmr;
    nms += nmsl;

/*         Increment X by the current approximate solution Z of A*Z = R. */

    lzm1 = lz - 1;
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	x[i__] += rgwk[lzm1 + i__];
/* L110: */
    }
    if (iflag == 0) {
	goto L600;
    }
    if (iflag == 1) {
	++nrsts;
	goto L100;
    }
    if (iflag == 2) {
	goto L620;
    }
/*   ------------------------------------------------------------------ */
/*         All returns are made through this section. */
/*   ------------------------------------------------------------------ */
/*         The iteration has converged. */

L600:
    igwk[7] = nms;
    rgwk[1] = rhol;
    *ierr = 0;
    return 0;

/*         Max number((NRMAX+1)*MAXL) of linear iterations performed. */
L610:
    igwk[7] = nms;
    rgwk[1] = rhol;
    *ierr = 1;
    return 0;

/*         GMRES failed to reduce last residual in MAXL iterations. */
/*         The iteration has stalled. */
L620:
    igwk[7] = nms;
    rgwk[1] = rhol;
    *ierr = 2;
    return 0;
/*         Error return.  Insufficient length for RGWK array. */
L640:
    *err = *tol;
    *ierr = -1;
    return 0;
/*         Error return.  Inconsistent ITOL and JPRE values. */
L650:
    *err = *tol;
    *ierr = -2;
    return 0;
/* ------------- LAST LINE OF DGMRES FOLLOWS ---------------------------- */
} /* dgmres1_ */

/* DECK DPIGMR */
/* Subroutine */ int dpigmr1_(integer *n, doublereal *r0, doublereal *sr, 
	doublereal *sz, integer *jscal, integer *maxl, integer *maxlp1, 
	integer *kmp, integer *nrsts, integer *jpre, integer *nmsl, 
	doublereal *z__, doublereal *v, doublereal *hes, doublereal *q, 
	integer *lgmr, doublereal *rpar, integer *ipar, doublereal *wk, 
	doublereal *dl, doublereal *rhol, integer *nrmax, doublereal *b, 
	doublereal *bnrm, doublereal *x, doublereal *xl, integer *itol, 
	doublereal *tol, integer *nelt, integer *ia, integer *ja, doublereal *
	a, integer *isym, integer *iunit, integer *iflag, doublereal *err)
{
    /* System generated locals */
    integer hes_dim1, hes_offset, v_dim1, v_offset, i__1, i__2, i__3;
    doublereal d__1;

    /* Local variables */
    doublereal c__;
    integer i__, j, k;
    doublereal s;
    integer i2, ll, ip1;
    doublereal tem, rho;
    integer llp1, info;
    doublereal prod;
    integer iter;
    extern doublereal dnrm2_(integer *, doublereal *, integer *);
    doublereal r0nrm;
    extern /* Subroutine */ int dscal_(integer *, doublereal *, doublereal *, 
	    integer *), dhels_(doublereal *, integer *, integer *, doublereal 
	    *, doublereal *), dheqr_(doublereal *, integer *, integer *, 
	    doublereal *, integer *, integer *);
    doublereal dlnrm;
    extern /* Subroutine */ int dcopy_(integer *, doublereal *, integer *, 
	    doublereal *, integer *), dorth_(doublereal *, doublereal *, 
	    doublereal *, integer *, integer *, integer *, integer *, 
	    doublereal *);
    integer itmax;
    extern /* Subroutine */ int daxpy_(integer *, doublereal *, doublereal *, 
	    integer *, doublereal *, integer *), drlcal_(integer *, integer *,
	     integer *, integer *, doublereal *, doublereal *, doublereal *, 
	    doublereal *, doublereal *, doublereal *), matvec_(integer *, 
	    doublereal *, doublereal *, integer *, integer *, integer *, 
	    doublereal *, integer *), msolve_(integer *, doublereal *, 
	    doublereal *, integer *, integer *, integer *, doublereal *, 
	    integer *, doublereal *, integer *);
    doublereal snormw;
    extern integer isdgmr1_(integer *, doublereal *, doublereal *, doublereal 
	    *, integer *, integer *, integer *, doublereal *, integer *, 
	    integer *, integer *, doublereal *, integer *, integer *, 
	    doublereal *, integer *, doublereal *, doublereal *, doublereal *,
	     doublereal *, integer *, doublereal *, doublereal *, doublereal *
	    , doublereal *, integer *, integer *, integer *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *,
	     doublereal *, doublereal *, integer *);

/* ***BEGIN PROLOGUE  DPIGMR */
/* ***SUBSIDIARY */
/* ***PURPOSE  Internal routine for DGMRES. */
/* ***LIBRARY   SLATEC (SLAP) */
/* ***CATEGORY  D2A4, D2B4 */
/* ***TYPE      DOUBLE PRECISION (SPIGMR-S, DPIGMR-D) */
/* ***KEYWORDS  GENERALIZED MINIMUM RESIDUAL, ITERATIVE PRECONDITION, */
/*             NON-SYMMETRIC LINEAR SYSTEM, SLAP, SPARSE */
/* ***AUTHOR  Brown, Peter, (LLNL), pnbrown@llnl.gov */
/*           Hindmarsh, Alan, (LLNL), alanh@llnl.gov */
/*           Seager, Mark K., (LLNL), seager@llnl.gov */
/*             Lawrence Livermore National Laboratory */
/*             PO Box 808, L-60 */
/*             Livermore, CA 94550 (510) 423-3141 */
/* ***DESCRIPTION */
/*         This routine solves the linear system A * Z = R0 using a */
/*         scaled preconditioned version of the generalized minimum */
/*         residual method.  An initial guess of Z = 0 is assumed. */

/* *Usage: */
/*      INTEGER N, JSCAL, MAXL, MAXLP1, KMP, NRSTS, JPRE, NMSL, LGMR */
/*      INTEGER IPAR(USER DEFINED), NRMAX, ITOL, NELT, IA(NELT), JA(NELT) */
/*      INTEGER ISYM, IUNIT, IFLAG */
/*      DOUBLE PRECISION R0(N), SR(N), SZ(N), Z(N), V(N,MAXLP1), */
/*     $                 HES(MAXLP1,MAXL), Q(2*MAXL), RPAR(USER DEFINED), */
/*     $                 WK(N), DL(N), RHOL, B(N), BNRM, X(N), XL(N), */
/*     $                 TOL, A(NELT), ERR */
/*      EXTERNAL MATVEC, MSOLVE */

/*      CALL DPIGMR(N, R0, SR, SZ, JSCAL, MAXL, MAXLP1, KMP, */
/*     $     NRSTS, JPRE, MATVEC, MSOLVE, NMSL, Z, V, HES, Q, LGMR, */
/*     $     RPAR, IPAR, WK, DL, RHOL, NRMAX, B, BNRM, X, XL, */
/*     $     ITOL, TOL, NELT, IA, JA, A, ISYM, IUNIT, IFLAG, ERR) */

/* *Arguments: */
/* N      :IN       Integer */
/*         The order of the matrix A, and the lengths */
/*         of the vectors SR, SZ, R0 and Z. */
/* R0     :IN       Double Precision R0(N) */
/*         R0 = the right hand side of the system A*Z = R0. */
/*         R0 is also used as workspace when computing */
/*         the final approximation. */
/*         (R0 is the same as V(*,MAXL+1) in the call to DPIGMR.) */
/* SR     :IN       Double Precision SR(N) */
/*         SR is a vector of length N containing the non-zero */
/*         elements of the diagonal scaling matrix for R0. */
/* SZ     :IN       Double Precision SZ(N) */
/*         SZ is a vector of length N containing the non-zero */
/*         elements of the diagonal scaling matrix for Z. */
/* JSCAL  :IN       Integer */
/*         A flag indicating whether arrays SR and SZ are used. */
/*         JSCAL=0 means SR and SZ are not used and the */
/*                 algorithm will perform as if all */
/*                 SR(i) = 1 and SZ(i) = 1. */
/*         JSCAL=1 means only SZ is used, and the algorithm */
/*                 performs as if all SR(i) = 1. */
/*         JSCAL=2 means only SR is used, and the algorithm */
/*                 performs as if all SZ(i) = 1. */
/*         JSCAL=3 means both SR and SZ are used. */
/* MAXL   :IN       Integer */
/*         The maximum allowable order of the matrix H. */
/* MAXLP1 :IN       Integer */
/*         MAXPL1 = MAXL + 1, used for dynamic dimensioning of HES. */
/* KMP    :IN       Integer */
/*         The number of previous vectors the new vector VNEW */
/*         must be made orthogonal to.  (KMP .le. MAXL) */
/* NRSTS  :IN       Integer */
/*         Counter for the number of restarts on the current */
/*         call to DGMRES.  If NRSTS .gt. 0, then the residual */
/*         R0 is already scaled, and so scaling of it is */
/*         not necessary. */
/* JPRE   :IN       Integer */
/*         Preconditioner type flag. */
/* MATVEC :EXT      External. */
/*         Name of a routine which performs the matrix vector multiply */
/*         Y = A*X given A and X.  The name of the MATVEC routine must */
/*         be declared external in the calling program.  The calling */
/*         sequence to MATVEC is: */
/*             CALL MATVEC(N, X, Y, NELT, IA, JA, A, ISYM) */
/*         where N is the number of unknowns, Y is the product A*X */
/*         upon return, X is an input vector, and NELT is the number of */
/*         non-zeros in the SLAP IA, JA, A storage for the matrix A. */
/*         ISYM is a flag which, if non-zero, denotes that A is */
/*         symmetric and only the lower or upper triangle is stored. */
/* MSOLVE :EXT      External. */
/*         Name of the routine which solves a linear system Mz = r for */
/*         z given r with the preconditioning matrix M (M is supplied via */
/*         RPAR and IPAR arrays.  The name of the MSOLVE routine must */
/*         be declared external in the calling program.  The calling */
/*         sequence to MSOLVE is: */
/*             CALL MSOLVE(N, R, Z, NELT, IA, JA, A, ISYM, RPAR, IPAR) */
/*         Where N is the number of unknowns, R is the right-hand side */
/*         vector and Z is the solution upon return.  NELT, IA, JA, A and */
/*         ISYM are defined as below.  RPAR is a double precision array */
/*         that can be used to pass necessary preconditioning information */
/*         and/or workspace to MSOLVE.  IPAR is an integer work array */
/*         for the same purpose as RPAR. */
/* NMSL   :OUT      Integer */
/*         The number of calls to MSOLVE. */
/* Z      :OUT      Double Precision Z(N) */
/*         The final computed approximation to the solution */
/*         of the system A*Z = R0. */
/* V      :OUT      Double Precision V(N,MAXLP1) */
/*         The N by (LGMR+1) array containing the LGMR */
/*         orthogonal vectors V(*,1) to V(*,LGMR). */
/* HES    :OUT      Double Precision HES(MAXLP1,MAXL) */
/*         The upper triangular factor of the QR decomposition */
/*         of the (LGMR+1) by LGMR upper Hessenberg matrix whose */
/*         entries are the scaled inner-products of A*V(*,I) */
/*         and V(*,K). */
/* Q      :OUT      Double Precision Q(2*MAXL) */
/*         A double precision array of length 2*MAXL containing the */
/*         components of the Givens rotations used in the QR */
/*         decomposition of HES.  It is loaded in DHEQR and used in */
/*         DHELS. */
/* LGMR   :OUT      Integer */
/*         The number of iterations performed and */
/*         the current order of the upper Hessenberg */
/*         matrix HES. */
/* RPAR   :IN       Double Precision RPAR(USER DEFINED) */
/*         Double Precision workspace passed directly to the MSOLVE */
/*         routine. */
/* IPAR   :IN       Integer IPAR(USER DEFINED) */
/*         Integer workspace passed directly to the MSOLVE routine. */
/* WK     :IN       Double Precision WK(N) */
/*         A double precision work array of length N used by routines */
/*         MATVEC and MSOLVE. */
/* DL     :INOUT    Double Precision DL(N) */
/*         On input, a double precision work array of length N used for */
/*         calculation of the residual norm RHO when the method is */
/*         incomplete (KMP.lt.MAXL), and/or when using restarting. */
/*         On output, the scaled residual vector RL.  It is only loaded */
/*         when performing restarts of the Krylov iteration. */
/* RHOL   :OUT      Double Precision */
/*         A double precision scalar containing the norm of the final */
/*         residual. */
/* NRMAX  :IN       Integer */
/*         The maximum number of restarts of the Krylov iteration. */
/*         NRMAX .gt. 0 means restarting is active, while */
/*         NRMAX = 0 means restarting is not being used. */
/* B      :IN       Double Precision B(N) */
/*         The right hand side of the linear system A*X = b. */
/* BNRM   :IN       Double Precision */
/*         The scaled norm of b. */
/* X      :IN       Double Precision X(N) */
/*         The current approximate solution as of the last */
/*         restart. */
/* XL     :IN       Double Precision XL(N) */
/*         An array of length N used to hold the approximate */
/*         solution X(L) when ITOL=11. */
/* ITOL   :IN       Integer */
/*         A flag to indicate the type of convergence criterion */
/*         used.  See the driver for its description. */
/* TOL    :IN       Double Precision */
/*         The tolerance on residuals R0-A*Z in scaled norm. */
/* NELT   :IN       Integer */
/*         The length of arrays IA, JA and A. */
/* IA     :IN       Integer IA(NELT) */
/*         An integer array of length NELT containing matrix data. */
/*         It is passed directly to the MATVEC and MSOLVE routines. */
/* JA     :IN       Integer JA(NELT) */
/*         An integer array of length NELT containing matrix data. */
/*         It is passed directly to the MATVEC and MSOLVE routines. */
/* A      :IN       Double Precision A(NELT) */
/*         A double precision array of length NELT containing matrix */
/*         data. It is passed directly to the MATVEC and MSOLVE routines. */
/* ISYM   :IN       Integer */
/*         A flag to indicate symmetric matrix storage. */
/*         If ISYM=0, all non-zero entries of the matrix are */
/*         stored.  If ISYM=1, the matrix is symmetric and */
/*         only the upper or lower triangular part is stored. */
/* IUNIT  :IN       Integer */
/*         The i/o unit number for writing intermediate residual */
/*         norm values. */
/* IFLAG  :OUT      Integer */
/*         An integer error flag.. */
/*         0 means convergence in LGMR iterations, LGMR.le.MAXL. */
/*         1 means the convergence test did not pass in MAXL */
/*           iterations, but the residual norm is .lt. norm(R0), */
/*           and so Z is computed. */
/*         2 means the convergence test did not pass in MAXL */
/*           iterations, residual .ge. norm(R0), and Z = 0. */
/* ERR    :OUT      Double Precision. */
/*         Error estimate of error in final approximate solution, as */
/*         defined by ITOL. */

/* *Cautions: */
/*     This routine will attempt to write to the Fortran logical output */
/*     unit IUNIT, if IUNIT .ne. 0.  Thus, the user must make sure that */
/*     this logical unit is attached to a file or terminal before calling */
/*     this routine with a non-zero value for IUNIT.  This routine does */
/*     not check for the validity of a non-zero IUNIT unit number. */

/* ***SEE ALSO  DGMRES */
/* ***ROUTINES CALLED  DAXPY, DCOPY, DHELS, DHEQR, DNRM2, DORTH, DRLCAL, */
/*                    DSCAL, ISDGMR */
/* ***REVISION HISTORY  (YYMMDD) */
/*   890404  DATE WRITTEN */
/*   890404  Previous REVISION DATE */
/*   890915  Made changes requested at July 1989 CML Meeting.  (MKS) */
/*   890922  Numerous changes to prologue to make closer to SLATEC */
/*           standard.  (FNF) */
/*   890929  Numerous changes to reduce SP/DP differences.  (FNF) */
/*   910411  Prologue converted to Version 4.0 format.  (BAB) */
/*   910502  Removed MATVEC and MSOLVE from ROUTINES CALLED list.  (FNF) */
/*   910506  Made subsidiary to DGMRES.  (FNF) */
/*   920511  Added complete declaration section.  (WRB) */
/* ***END PROLOGUE  DPIGMR */
/*         The following is for optimized compilation on LLNL/LTSS Crays. */
/* LLL. OPTIMIZE */
/*     .. Scalar Arguments .. */
/*     .. Array Arguments .. */
/*     .. Local Scalars .. */
/*     .. External Functions .. */
/*     .. External Subroutines .. */
/*     .. Intrinsic Functions .. */
/* ***FIRST EXECUTABLE STATEMENT  DPIGMR */

/*         Zero out the Z array. */

    /* Parameter adjustments */
    v_dim1 = *n;
    v_offset = 1 + v_dim1;
    v -= v_offset;
    --r0;
    --sr;
    --sz;
    hes_dim1 = *maxlp1;
    hes_offset = 1 + hes_dim1;
    hes -= hes_offset;
    --z__;
    --q;
    --rpar;
    --ipar;
    --wk;
    --dl;
    --b;
    --x;
    --xl;
    --a;
    --ja;
    --ia;

    /* Function Body */
    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	z__[i__] = 0.;
/* L5: */
    }

    *iflag = 0;
    *lgmr = 0;
    *nmsl = 0;
/*         Load ITMAX, the maximum number of iterations. */
    itmax = (*nrmax + 1) * *maxl;
/*   ------------------------------------------------------------------- */
/*         The initial residual is the vector R0. */
/*         Apply left precon. if JPRE < 0 and this is not a restart. */
/*         Apply scaling to R0 if JSCAL = 2 or 3. */
/*   ------------------------------------------------------------------- */
    if (*jpre < 0 && *nrsts == 0) {
	dcopy_(n, &r0[1], &c__1, &wk[1], &c__1);
	msolve_(n, &wk[1], &r0[1], nelt, &ia[1], &ja[1], &a[1], isym, &rpar[1]
		, &ipar[1]);
	++(*nmsl);
    }
    if ((*jscal == 2 || *jscal == 3) && *nrsts == 0) {
	i__1 = *n;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    v[i__ + v_dim1] = r0[i__] * sr[i__];
/* L10: */
	}
    } else {
	i__1 = *n;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    v[i__ + v_dim1] = r0[i__];
/* L20: */
	}
    }
    r0nrm = dnrm2_(n, &v[v_offset], &c__1);
    iter = *nrsts * *maxl;

/*         Call stopping routine ISDGMR. */

    if (isdgmr1_(n, &b[1], &x[1], &xl[1], nelt, &ia[1], &ja[1], &a[1], isym, 
	    nmsl, itol, tol, &itmax, &iter, err, iunit, &v[v_dim1 + 1], &z__[
	    1], &wk[1], &rpar[1], &ipar[1], &r0nrm, bnrm, &sr[1], &sz[1], 
	    jscal, kmp, lgmr, maxl, maxlp1, &v[v_offset], &q[1], &snormw, &
	    prod, &r0nrm, &hes[hes_offset], jpre) != 0) {
	return 0;
    }
    tem = 1. / r0nrm;
    dscal_(n, &tem, &v[v_dim1 + 1], &c__1);

/*         Zero out the HES array. */

    i__1 = *maxl;
    for (j = 1; j <= i__1; ++j) {
	i__2 = *maxlp1;
	for (i__ = 1; i__ <= i__2; ++i__) {
	    hes[i__ + j * hes_dim1] = 0.;
/* L40: */
	}
/* L50: */
    }
/*   ------------------------------------------------------------------- */
/*         Main loop to compute the vectors V(*,2) to V(*,MAXL). */
/*         The running product PROD is needed for the convergence test. */
/*   ------------------------------------------------------------------- */
    prod = 1.;
    i__1 = *maxl;
    for (ll = 1; ll <= i__1; ++ll) {
	*lgmr = ll;
/*   ------------------------------------------------------------------- */
/*        Unscale  the  current V(LL)  and store  in WK.  Call routine */
/*        MSOLVE    to   compute(M-inverse)*WK,   where    M   is  the */
/*        preconditioner matrix.  Save the answer in Z.   Call routine */
/*        MATVEC to compute  VNEW  = A*Z,  where  A is  the the system */
/*        matrix.  save the answer in  V(LL+1).  Scale V(LL+1).   Call */
/*        routine DORTH  to  orthogonalize the    new vector VNEW   = */
/*        V(*,LL+1).  Call routine DHEQR to update the factors of HES. */
/*   ------------------------------------------------------------------- */
	if (*jscal == 1 || *jscal == 3) {
	    i__2 = *n;
	    for (i__ = 1; i__ <= i__2; ++i__) {
		wk[i__] = v[i__ + ll * v_dim1] / sz[i__];
/* L60: */
	    }
	} else {
	    dcopy_(n, &v[ll * v_dim1 + 1], &c__1, &wk[1], &c__1);
	}
	if (*jpre > 0) {
	    msolve_(n, &wk[1], &z__[1], nelt, &ia[1], &ja[1], &a[1], isym, &
		    rpar[1], &ipar[1]);
	    ++(*nmsl);
	    matvec_(n, &z__[1], &v[(ll + 1) * v_dim1 + 1], nelt, &ia[1], &ja[
		    1], &a[1], isym);
	} else {
	    matvec_(n, &wk[1], &v[(ll + 1) * v_dim1 + 1], nelt, &ia[1], &ja[1]
		    , &a[1], isym);
	}
	if (*jpre < 0) {
	    dcopy_(n, &v[(ll + 1) * v_dim1 + 1], &c__1, &wk[1], &c__1);
	    msolve_(n, &wk[1], &v[(ll + 1) * v_dim1 + 1], nelt, &ia[1], &ja[1]
		    , &a[1], isym, &rpar[1], &ipar[1]);
	    ++(*nmsl);
	}
	if (*jscal == 2 || *jscal == 3) {
	    i__2 = *n;
	    for (i__ = 1; i__ <= i__2; ++i__) {
		v[i__ + (ll + 1) * v_dim1] *= sr[i__];
/* L65: */
	    }
	}
	dorth_(&v[(ll + 1) * v_dim1 + 1], &v[v_offset], &hes[hes_offset], n, &
		ll, maxlp1, kmp, &snormw);
	hes[ll + 1 + ll * hes_dim1] = snormw;
	dheqr_(&hes[hes_offset], maxlp1, &ll, &q[1], &info, &ll);
	if (info == ll) {
	    goto L120;
	}
/*   ------------------------------------------------------------------- */
/*         Update RHO, the estimate of the norm of the residual R0-A*ZL. */
/*         If KMP <  MAXL, then the vectors V(*,1),...,V(*,LL+1) are not */
/*         necessarily orthogonal for LL > KMP.  The vector DL must then */
/*         be computed, and its norm used in the calculation of RHO. */
/*   ------------------------------------------------------------------- */
	prod *= q[ll * 2];
	rho = (d__1 = prod * r0nrm, abs(d__1));
	if (ll > *kmp && *kmp < *maxl) {
	    if (ll == *kmp + 1) {
		dcopy_(n, &v[v_dim1 + 1], &c__1, &dl[1], &c__1);
		i__2 = *kmp;
		for (i__ = 1; i__ <= i__2; ++i__) {
		    ip1 = i__ + 1;
		    i2 = i__ << 1;
		    s = q[i2];
		    c__ = q[i2 - 1];
		    i__3 = *n;
		    for (k = 1; k <= i__3; ++k) {
			dl[k] = s * dl[k] + c__ * v[k + ip1 * v_dim1];
/* L70: */
		    }
/* L75: */
		}
	    }
	    s = q[ll * 2];
	    c__ = q[(ll << 1) - 1] / snormw;
	    llp1 = ll + 1;
	    i__2 = *n;
	    for (k = 1; k <= i__2; ++k) {
		dl[k] = s * dl[k] + c__ * v[k + llp1 * v_dim1];
/* L80: */
	    }
	    dlnrm = dnrm2_(n, &dl[1], &c__1);
	    rho *= dlnrm;
	}
	*rhol = rho;
/*   ------------------------------------------------------------------- */
/*         Test for convergence.  If passed, compute approximation ZL. */
/*         If failed and LL < MAXL, then continue iterating. */
/*   ------------------------------------------------------------------- */
	iter = *nrsts * *maxl + *lgmr;
	if (isdgmr1_(n, &b[1], &x[1], &xl[1], nelt, &ia[1], &ja[1], &a[1], 
		isym, nmsl, itol, tol, &itmax, &iter, err, iunit, &dl[1], &
		z__[1], &wk[1], &rpar[1], &ipar[1], rhol, bnrm, &sr[1], &sz[1]
		, jscal, kmp, lgmr, maxl, maxlp1, &v[v_offset], &q[1], &
		snormw, &prod, &r0nrm, &hes[hes_offset], jpre) != 0) {
	    goto L200;
	}
	if (ll == *maxl) {
	    goto L100;
	}
/*   ------------------------------------------------------------------- */
/*         Rescale so that the norm of V(1,LL+1) is one. */
/*   ------------------------------------------------------------------- */
	tem = 1. / snormw;
	dscal_(n, &tem, &v[(ll + 1) * v_dim1 + 1], &c__1);
/* L90: */
    }
L100:
    if (rho < r0nrm) {
	goto L150;
    }
L120:
    *iflag = 2;

/*         Load approximate solution with zero. */

    i__1 = *n;
    for (i__ = 1; i__ <= i__1; ++i__) {
	z__[i__] = 0.;
/* L130: */
    }
    return 0;
L150:
    *iflag = 1;

/*         Tolerance not met, but residual norm reduced. */

    if (*nrmax > 0) {

/*        If performing restarting (NRMAX > 0)  calculate the residual */
/*        vector RL and  store it in the DL  array.  If the incomplete */
/*        version is being used (KMP < MAXL) then DL has  already been */
/*        calculated up to a scaling factor.   Use DRLCAL to calculate */
/*        the scaled residual vector. */

	drlcal_(n, kmp, maxl, maxl, &v[v_offset], &q[1], &dl[1], &snormw, &
		prod, &r0nrm);
    }
/*   ------------------------------------------------------------------- */
/*         Compute the approximation ZL to the solution.  Since the */
/*         vector Z was used as workspace, and the initial guess */
/*         of the linear iteration is zero, Z must be reset to zero. */
/*   ------------------------------------------------------------------- */
L200:
    ll = *lgmr;
    llp1 = ll + 1;
    i__1 = llp1;
    for (k = 1; k <= i__1; ++k) {
	r0[k] = 0.;
/* L210: */
    }
    r0[1] = r0nrm;
    dhels_(&hes[hes_offset], maxlp1, &ll, &q[1], &r0[1]);
    i__1 = *n;
    for (k = 1; k <= i__1; ++k) {
	z__[k] = 0.;
/* L220: */
    }
    i__1 = ll;
    for (i__ = 1; i__ <= i__1; ++i__) {
	daxpy_(n, &r0[i__], &v[i__ * v_dim1 + 1], &c__1, &z__[1], &c__1);
/* L230: */
    }
    if (*jscal == 1 || *jscal == 3) {
	i__1 = *n;
	for (i__ = 1; i__ <= i__1; ++i__) {
	    z__[i__] /= sz[i__];
/* L240: */
	}
    }
    if (*jpre > 0) {
	dcopy_(n, &z__[1], &c__1, &wk[1], &c__1);
	msolve_(n, &wk[1], &z__[1], nelt, &ia[1], &ja[1], &a[1], isym, &rpar[
		1], &ipar[1]);
	++(*nmsl);
    }
    return 0;
/* ------------- LAST LINE OF DPIGMR FOLLOWS ---------------------------- */
} /* dpigmr1_ */

/* DECK ISDGMR */
integer isdgmr1_(integer *n, doublereal *b, doublereal *x, doublereal *xl, 
	integer *nelt, integer *ia, integer *ja, doublereal *a, integer *isym,
	 integer *nmsl, integer *itol, doublereal *tol, integer *itmax, 
	integer *iter, doublereal *err, integer *iunit, doublereal *r__, 
	doublereal *z__, doublereal *dz, doublereal *rwork, integer *iwork, 
	doublereal *rnrm, doublereal *bnrm, doublereal *sb, doublereal *sx, 
	integer *jscal, integer *kmp, integer *lgmr, integer *maxl, integer *
	maxlp1, doublereal *v, doublereal *q, doublereal *snormw, doublereal *
	prod, doublereal *r0nrm, doublereal *hes, integer *jpre)
{
    /* Format strings */
    static char fmt_1020[] = "(1x,\002 ITER = \002,i5,\002 IELMAX = \002,i5"
	    ",\002 |R(IELMAX)/X(IELMAX)| = \002,d12.5)";
    static char fmt_1000[] = "(\002 Generalized Minimum Residual(\002,i3,i3"
	    ",\002) for \002,\002N, ITOL = \002,i5,i5,/\002 ITER\002,\002   N"
	    "atural Err Est\002,\002   Error Estimate\002)";
    static char fmt_1010[] = "(1x,i4,1x,d16.7,1x,d16.7)";

    /* System generated locals */
    integer hes_dim1, hes_offset, v_dim1, v_offset, ret_val, i__1;
    doublereal d__1, d__2, d__3;

    /* Builtin functions */
    integer s_wsfe(cilist *), do_fio(integer *, char *, ftnlen), e_wsfe(void);
    double sqrt(doublereal);

    /* Local variables */
    integer i__;
    doublereal tem, rat, fuzz;
    extern doublereal dnrm2_(integer *, doublereal *, integer *);
    extern /* Subroutine */ int dscal_(integer *, doublereal *, doublereal *, 
	    integer *), dcopy_(integer *, doublereal *, integer *, doublereal 
	    *, integer *);
    doublereal dxnrm;
    extern doublereal d1mach_(integer *);
    extern /* Subroutine */ int drlcal_(integer *, integer *, integer *, 
	    integer *, doublereal *, doublereal *, doublereal *, doublereal *,
	     doublereal *, doublereal *);
    integer ielmax;
    doublereal ratmax;
    extern /* Subroutine */ int msolve_(integer *, doublereal *, doublereal *,
	     integer *, integer *, integer *, doublereal *, integer *, 
	    doublereal *, integer *);
    static doublereal solnrm;
    extern /* Subroutine */ int dxlcal1_(integer *, integer *, doublereal *, 
	    doublereal *, doublereal *, doublereal *, integer *, doublereal *,
	     doublereal *, doublereal *, doublereal *, doublereal *, integer *
	    , integer *, integer *, doublereal *, integer *, integer *, 
	    integer *, integer *, doublereal *, integer *);

    /* Fortran I/O blocks */
    static cilist io___49 = { 0, 0, 0, fmt_1020, 0 };
    static cilist io___52 = { 0, 0, 0, fmt_1000, 0 };
    static cilist io___53 = { 0, 0, 0, fmt_1010, 0 };


/* ***BEGIN PROLOGUE  ISDGMR */
/* ***SUBSIDIARY */
/* ***PURPOSE  Generalized Minimum Residual Stop Test. */
/*            This routine calculates the stop test for the Generalized */
/*            Minimum RESidual (GMRES) iteration scheme.  It returns a */
/*            non-zero if the error estimate (the type of which is */
/*            determined by ITOL) is less than the user specified */
/*            tolerance TOL. */
/* ***LIBRARY   SLATEC (SLAP) */
/* ***CATEGORY  D2A4, D2B4 */
/* ***TYPE      DOUBLE PRECISION (ISSGMR-S, ISDGMR-D) */
/* ***KEYWORDS  GMRES, LINEAR SYSTEM, SLAP, SPARSE, STOP TEST */
/* ***AUTHOR  Brown, Peter, (LLNL), pnbrown@llnl.gov */
/*           Hindmarsh, Alan, (LLNL), alanh@llnl.gov */
/*           Seager, Mark K., (LLNL), seager@llnl.gov */
/*             Lawrence Livermore National Laboratory */
/*             PO Box 808, L-60 */
/*             Livermore, CA 94550 (510) 423-3141 */
/* ***DESCRIPTION */

/* *Usage: */
/*      INTEGER N, NELT, IA(NELT), JA(NELT), ISYM, NMSL, ITOL */
/*      INTEGER ITMAX, ITER, IUNIT, IWORK(USER DEFINED), JSCAL */
/*      INTEGER KMP, LGMR, MAXL, MAXLP1, JPRE */
/*      DOUBLE PRECISION B(N), X(N), XL(MAXL), A(NELT), TOL, ERR, */
/*     $                 R(N), Z(N), DZ(N), RWORK(USER DEFINED), */
/*     $                 RNRM, BNRM, SB(N), SX(N), V(N,MAXLP1), */
/*     $                 Q(2*MAXL), SNORMW, PROD, R0NRM, */
/*     $                 HES(MAXLP1,MAXL) */
/*      EXTERNAL MSOLVE */

/*      IF (ISDGMR(N, B, X, XL, NELT, IA, JA, A, ISYM, MSOLVE, */
/*     $     NMSL, ITOL, TOL, ITMAX, ITER, ERR, IUNIT, R, Z, DZ, */
/*     $     RWORK, IWORK, RNRM, BNRM, SB, SX, JSCAL, */
/*     $     KMP, LGMR, MAXL, MAXLP1, V, Q, SNORMW, PROD, R0NRM, */
/*     $     HES, JPRE) .NE. 0) THEN ITERATION DONE */

/* *Arguments: */
/* N      :IN       Integer. */
/*         Order of the Matrix. */
/* B      :IN       Double Precision B(N). */
/*         Right-hand-side vector. */
/* X      :IN       Double Precision X(N). */
/*         Approximate solution vector as of the last restart. */
/* XL     :OUT      Double Precision XL(N) */
/*         An array of length N used to hold the approximate */
/*         solution as of the current iteration.  Only computed by */
/*         this routine when ITOL=11. */
/* NELT   :IN       Integer. */
/*         Number of Non-Zeros stored in A. */
/* IA     :IN       Integer IA(NELT). */
/* JA     :IN       Integer JA(NELT). */
/* A      :IN       Double Precision A(NELT). */
/*         These arrays contain the matrix data structure for A. */
/*         It could take any form.  See "Description", in the DGMRES, */
/*         DSLUGM and DSDGMR routines for more details. */
/* ISYM   :IN       Integer. */
/*         Flag to indicate symmetric storage format. */
/*         If ISYM=0, all non-zero entries of the matrix are stored. */
/*         If ISYM=1, the matrix is symmetric, and only the upper */
/*         or lower triangle of the matrix is stored. */
/* MSOLVE :EXT      External. */
/*         Name of a routine which solves a linear system Mz = r for  z */
/*         given r with the preconditioning matrix M (M is supplied via */
/*         RWORK and IWORK arrays.  The name of the MSOLVE routine must */
/*         be declared external in the calling program.  The calling */
/*         sequence to MSOLVE is: */
/*             CALL MSOLVE(N, R, Z, NELT, IA, JA, A, ISYM, RWORK, IWORK) */
/*         Where N is the number of unknowns, R is the right-hand side */
/*         vector and Z is the solution upon return.  NELT, IA, JA, A and */
/*         ISYM are defined as above.  RWORK is a double precision array */
/*         that can be used to pass necessary preconditioning information */
/*         and/or workspace to MSOLVE.  IWORK is an integer work array */
/*         for the same purpose as RWORK. */
/* NMSL   :INOUT    Integer. */
/*         A counter for the number of calls to MSOLVE. */
/* ITOL   :IN       Integer. */
/*         Flag to indicate the type of convergence criterion used. */
/*         ITOL=0  Means the  iteration stops when the test described */
/*                 below on  the  residual RL  is satisfied.  This is */
/*                 the  "Natural Stopping Criteria" for this routine. */
/*                 Other values  of   ITOL  cause  extra,   otherwise */
/*                 unnecessary, computation per iteration and     are */
/*                 therefore much less efficient. */
/*         ITOL=1  Means   the  iteration stops   when the first test */
/*                 described below on  the residual RL  is satisfied, */
/*                 and there  is either right  or  no preconditioning */
/*                 being used. */
/*         ITOL=2  Implies     that   the  user    is   using    left */
/*                 preconditioning, and the second stopping criterion */
/*                 below is used. */
/*         ITOL=3  Means the  iteration stops   when  the  third test */
/*                 described below on Minv*Residual is satisfied, and */
/*                 there is either left  or no  preconditioning begin */
/*                 used. */
/*         ITOL=11 is    often  useful  for   checking  and comparing */
/*                 different routines.  For this case, the  user must */
/*                 supply  the  "exact" solution or  a  very accurate */
/*                 approximation (one with  an  error much less  than */
/*                 TOL) through a common block, */
/*                     COMMON /DSLBLK/ SOLN( ) */
/*                 If ITOL=11, iteration stops when the 2-norm of the */
/*                 difference between the iterative approximation and */
/*                 the user-supplied solution  divided by the  2-norm */
/*                 of the  user-supplied solution  is  less than TOL. */
/*                 Note that this requires  the  user to  set up  the */
/*                 "COMMON     /DSLBLK/ SOLN(LENGTH)"  in the calling */
/*                 routine.  The routine with this declaration should */
/*                 be loaded before the stop test so that the correct */
/*                 length is used by  the loader.  This procedure  is */
/*                 not standard Fortran and may not work correctly on */
/*                 your   system (although  it  has  worked  on every */
/*                 system the authors have tried).  If ITOL is not 11 */
/*                 then this common block is indeed standard Fortran. */
/* TOL    :IN       Double Precision. */
/*         Convergence criterion, as described above. */
/* ITMAX  :IN       Integer. */
/*         Maximum number of iterations. */
/* ITER   :IN       Integer. */
/*         The iteration for which to check for convergence. */
/* ERR    :OUT      Double Precision. */
/*         Error estimate of error in final approximate solution, as */
/*         defined by ITOL.  Letting norm() denote the Euclidean */
/*         norm, ERR is defined as follows.. */

/*         If ITOL=0, then ERR = norm(SB*(B-A*X(L)))/norm(SB*B), */
/*                               for right or no preconditioning, and */
/*                         ERR = norm(SB*(M-inverse)*(B-A*X(L)))/ */
/*                                norm(SB*(M-inverse)*B), */
/*                               for left preconditioning. */
/*         If ITOL=1, then ERR = norm(SB*(B-A*X(L)))/norm(SB*B), */
/*                               since right or no preconditioning */
/*                               being used. */
/*         If ITOL=2, then ERR = norm(SB*(M-inverse)*(B-A*X(L)))/ */
/*                                norm(SB*(M-inverse)*B), */
/*                               since left preconditioning is being */
/*                               used. */
/*         If ITOL=3, then ERR =  Max  |(Minv*(B-A*X(L)))(i)/x(i)| */
/*                               i=1,n */
/*         If ITOL=11, then ERR = norm(SB*(X(L)-SOLN))/norm(SB*SOLN). */
/* IUNIT  :IN       Integer. */
/*         Unit number on which to write the error at each iteration, */
/*         if this is desired for monitoring convergence.  If unit */
/*         number is 0, no writing will occur. */
/* R      :INOUT    Double Precision R(N). */
/*         Work array used in calling routine.  It contains */
/*         information necessary to compute the residual RL = B-A*XL. */
/* Z      :WORK     Double Precision Z(N). */
/*         Workspace used to hold the pseudo-residual M z = r. */
/* DZ     :WORK     Double Precision DZ(N). */
/*         Workspace used to hold temporary vector(s). */
/* RWORK  :WORK     Double Precision RWORK(USER DEFINED). */
/*         Double Precision array that can be used by MSOLVE. */
/* IWORK  :WORK     Integer IWORK(USER DEFINED). */
/*         Integer array that can be used by MSOLVE. */
/* RNRM   :IN       Double Precision. */
/*         Norm of the current residual.  Type of norm depends on ITOL. */
/* BNRM   :IN       Double Precision. */
/*         Norm of the right hand side.  Type of norm depends on ITOL. */
/* SB     :IN       Double Precision SB(N). */
/*         Scaling vector for B. */
/* SX     :IN       Double Precision SX(N). */
/*         Scaling vector for X. */
/* JSCAL  :IN       Integer. */
/*         Flag indicating if scaling arrays SB and SX are being */
/*         used in the calling routine DPIGMR. */
/*         JSCAL=0 means SB and SX are not used and the */
/*                 algorithm will perform as if all */
/*                 SB(i) = 1 and SX(i) = 1. */
/*         JSCAL=1 means only SX is used, and the algorithm */
/*                 performs as if all SB(i) = 1. */
/*         JSCAL=2 means only SB is used, and the algorithm */
/*                 performs as if all SX(i) = 1. */
/*         JSCAL=3 means both SB and SX are used. */
/* KMP    :IN       Integer */
/*         The number of previous vectors the new vector VNEW */
/*         must be made orthogonal to.  (KMP .le. MAXL) */
/* LGMR   :IN       Integer */
/*         The number of GMRES iterations performed on the current call */
/*         to DPIGMR (i.e., # iterations since the last restart) and */
/*         the current order of the upper Hessenberg */
/*         matrix HES. */
/* MAXL   :IN       Integer */
/*         The maximum allowable order of the matrix H. */
/* MAXLP1 :IN       Integer */
/*         MAXPL1 = MAXL + 1, used for dynamic dimensioning of HES. */
/* V      :IN       Double Precision V(N,MAXLP1) */
/*         The N by (LGMR+1) array containing the LGMR */
/*         orthogonal vectors V(*,1) to V(*,LGMR). */
/* Q      :IN       Double Precision Q(2*MAXL) */
/*         A double precision array of length 2*MAXL containing the */
/*         components of the Givens rotations used in the QR */
/*         decomposition of HES. */
/* SNORMW :IN       Double Precision */
/*         A scalar containing the scaled norm of VNEW before it */
/*         is renormalized in DPIGMR. */
/* PROD   :IN       Double Precision */
/*         The product s1*s2*...*sl = the product of the sines of the */
/*         Givens rotations used in the QR factorization of the */
/*         Hessenberg matrix HES. */
/* R0NRM  :IN       Double Precision */
/*         The scaled norm of initial residual R0. */
/* HES    :IN       Double Precision HES(MAXLP1,MAXL) */
/*         The upper triangular factor of the QR decomposition */
/*         of the (LGMR+1) by LGMR upper Hessenberg matrix whose */
/*         entries are the scaled inner-products of A*V(*,I) */
/*         and V(*,K). */
/* JPRE   :IN       Integer */
/*         Preconditioner type flag. */
/*         (See description of IGWK(4) in DGMRES.) */

/* *Description */
/*       When using the GMRES solver,  the preferred value  for ITOL */
/*       is 0.  This is due to the fact that when ITOL=0 the norm of */
/*       the residual required in the stopping test is  obtained for */
/*       free, since this value is already  calculated  in the GMRES */
/*       algorithm.   The  variable  RNRM contains the   appropriate */
/*       norm, which is equal to norm(SB*(RL - A*XL))  when right or */
/*       no   preconditioning is  being  performed,   and equal   to */
/*       norm(SB*Minv*(RL - A*XL))  when using left preconditioning. */
/*       Here, norm() is the Euclidean norm.  Nonzero values of ITOL */
/*       require  additional work  to  calculate the  actual  scaled */
/*       residual  or its scaled/preconditioned  form,  and/or   the */
/*       approximate solution XL.  Hence, these values of  ITOL will */
/*       not be as efficient as ITOL=0. */

/* *Cautions: */
/*     This routine will attempt to write to the Fortran logical output */
/*     unit IUNIT, if IUNIT .ne. 0.  Thus, the user must make sure that */
/*     this logical unit is attached to a file or terminal before calling */
/*     this routine with a non-zero value for IUNIT.  This routine does */
/*     not check for the validity of a non-zero IUNIT unit number. */

/*     This routine does not verify that ITOL has a valid value. */
/*     The calling routine should make such a test before calling */
/*     ISDGMR, as is done in DGMRES. */

/* ***SEE ALSO  DGMRES */
/* ***ROUTINES CALLED  D1MACH, DCOPY, DNRM2, DRLCAL, DSCAL, DXLCAL */
/* ***COMMON BLOCKS    DSLBLK */
/* ***REVISION HISTORY  (YYMMDD) */
/*   890404  DATE WRITTEN */
/*   890404  Previous REVISION DATE */
/*   890915  Made changes requested at July 1989 CML Meeting.  (MKS) */
/*   890922  Numerous changes to prologue to make closer to SLATEC */
/*           standard.  (FNF) */
/*   890929  Numerous changes to reduce SP/DP differences.  (FNF) */
/*   910411  Prologue converted to Version 4.0 format.  (BAB) */
/*   910502  Corrected conversion errors, etc.  (FNF) */
/*   910502  Removed MSOLVE from ROUTINES CALLED list.  (FNF) */
/*   910506  Made subsidiary to DGMRES.  (FNF) */
/*   920407  COMMON BLOCK renamed DSLBLK.  (WRB) */
/*   920511  Added complete declaration section.  (WRB) */
/*   921026  Corrected D to E in output format.  (FNF) */
/*   921113  Corrected C***CATEGORY line.  (FNF) */
/* ***END PROLOGUE  ISDGMR */
/*     .. Scalar Arguments .. */
/*     .. Array Arguments .. */
/*     .. Arrays in Common .. */
/*     .. Local Scalars .. */
/*     .. External Functions .. */
/*     .. External Subroutines .. */
/*     .. Intrinsic Functions .. */
/*     .. Common blocks .. */
/*     .. Save statement .. */
/* ***FIRST EXECUTABLE STATEMENT  ISDGMR */
    /* Parameter adjustments */
    v_dim1 = *n;
    v_offset = 1 + v_dim1;
    v -= v_offset;
    --b;
    --x;
    --xl;
    --ia;
    --ja;
    --a;
    --r__;
    --z__;
    --dz;
    --rwork;
    --iwork;
    --sb;
    --sx;
    hes_dim1 = *maxlp1;
    hes_offset = 1 + hes_dim1;
    hes -= hes_offset;
    --q;

    /* Function Body */
    ret_val = 0;
    if (*itol == 0) {

/*       Use input from DPIGMR to determine if stop conditions are met. */

	*err = *rnrm / *bnrm;
    }
    if (*itol > 0 && *itol <= 3) {

/*       Use DRLCAL to calculate the scaled residual vector. */
/*       Store answer in R. */

	if (*lgmr != 0) {
	    drlcal_(n, kmp, lgmr, maxl, &v[v_offset], &q[1], &r__[1], snormw, 
		    prod, r0nrm);
	}
	if (*itol <= 2) {
/*         err = ||Residual||/||RightHandSide||(2-Norms). */
	    *err = dnrm2_(n, &r__[1], &c__1) / *bnrm;

/*         Unscale R by R0NRM*PROD when KMP < MAXL. */

	    if (*kmp < *maxl && *lgmr != 0) {
		tem = 1. / (*r0nrm * *prod);
		dscal_(n, &tem, &r__[1], &c__1);
	    }
	} else if (*itol == 3) {
/*         err = Max |(Minv*Residual)(i)/x(i)| */
/*         When JPRE .lt. 0, R already contains Minv*Residual. */
	    if (*jpre > 0) {
		msolve_(n, &r__[1], &dz[1], nelt, &ia[1], &ja[1], &a[1], isym,
			 &rwork[1], &iwork[1]);
		++(*nmsl);
	    }

/*         Unscale R by R0NRM*PROD when KMP < MAXL. */

	    if (*kmp < *maxl && *lgmr != 0) {
		tem = 1. / (*r0nrm * *prod);
		dscal_(n, &tem, &r__[1], &c__1);
	    }

	    fuzz = d1mach_(&c__1);
	    ielmax = 1;
/* Computing MAX */
	    d__1 = abs(x[1]);
	    ratmax = abs(dz[1]) / max(d__1,fuzz);
	    i__1 = *n;
	    for (i__ = 2; i__ <= i__1; ++i__) {
/* Computing MAX */
		d__3 = (d__2 = x[i__], abs(d__2));
		rat = (d__1 = dz[i__], abs(d__1)) / max(d__3,fuzz);
		if (rat > ratmax) {
		    ielmax = i__;
		    ratmax = rat;
		}
/* L25: */
	    }
	    *err = ratmax;
	    if (ratmax <= *tol) {
		ret_val = 1;
	    }
	    if (*iunit > 0) {
		io___49.ciunit = *iunit;
		s_wsfe(&io___49);
		do_fio(&c__1, (char *)&(*iter), (ftnlen)sizeof(integer));
		do_fio(&c__1, (char *)&ielmax, (ftnlen)sizeof(integer));
		do_fio(&c__1, (char *)&ratmax, (ftnlen)sizeof(doublereal));
		e_wsfe();
	    }
	    return ret_val;
	}
    }
    if (*itol == 11) {

/*       Use DXLCAL to calculate the approximate solution XL. */

	if (*lgmr != 0 && *iter > 0) {
	    dxlcal1_(n, lgmr, &x[1], &xl[1], &xl[1], &hes[hes_offset], maxlp1,
		     &q[1], &v[v_offset], r0nrm, &dz[1], &sx[1], jscal, jpre, 
		    nmsl, &rwork[1], &iwork[1], nelt, &ia[1], &ja[1], &a[1], 
		    isym);
	} else if (*iter == 0) {
/*         Copy X to XL to check if initial guess is good enough. */
	    dcopy_(n, &x[1], &c__1, &xl[1], &c__1);
	} else {
/*         Return since this is the first call to DPIGMR on a restart. */
	    return ret_val;
	}

	if (*jscal == 0 || *jscal == 2) {
/*         err = ||x-TrueSolution||/||TrueSolution||(2-Norms). */
	    if (*iter == 0) {
		solnrm = dnrm2_(n, dslblk_1.soln, &c__1);
	    }
	    i__1 = *n;
	    for (i__ = 1; i__ <= i__1; ++i__) {
		dz[i__] = xl[i__] - dslblk_1.soln[i__ - 1];
/* L30: */
	    }
	    *err = dnrm2_(n, &dz[1], &c__1) / solnrm;
	} else {
	    if (*iter == 0) {
		solnrm = 0.;
		i__1 = *n;
		for (i__ = 1; i__ <= i__1; ++i__) {
/* Computing 2nd power */
		    d__1 = sx[i__] * dslblk_1.soln[i__ - 1];
		    solnrm += d__1 * d__1;
/* L40: */
		}
		solnrm = sqrt(solnrm);
	    }
	    dxnrm = 0.;
	    i__1 = *n;
	    for (i__ = 1; i__ <= i__1; ++i__) {
/* Computing 2nd power */
		d__1 = sx[i__] * (xl[i__] - dslblk_1.soln[i__ - 1]);
		dxnrm += d__1 * d__1;
/* L50: */
	    }
	    dxnrm = sqrt(dxnrm);
/*         err = ||SX*(x-TrueSolution)||/||SX*TrueSolution|| (2-Norms). */
	    *err = dxnrm / solnrm;
	}
    }

    if (*iunit != 0) {
	if (*iter == 0) {
	    io___52.ciunit = *iunit;
	    s_wsfe(&io___52);
	    do_fio(&c__1, (char *)&(*n), (ftnlen)sizeof(integer));
	    do_fio(&c__1, (char *)&(*itol), (ftnlen)sizeof(integer));
	    do_fio(&c__1, (char *)&(*maxl), (ftnlen)sizeof(integer));
	    do_fio(&c__1, (char *)&(*kmp), (ftnlen)sizeof(integer));
	    e_wsfe();
	}
	io___53.ciunit = *iunit;
	s_wsfe(&io___53);
	do_fio(&c__1, (char *)&(*iter), (ftnlen)sizeof(integer));
	d__1 = *rnrm / *bnrm;
	do_fio(&c__1, (char *)&d__1, (ftnlen)sizeof(doublereal));
	do_fio(&c__1, (char *)&(*err), (ftnlen)sizeof(doublereal));
	e_wsfe();
    }
    if (*err <= *tol) {
	ret_val = 1;
    }

    return ret_val;
/* ------------- LAST LINE OF ISDGMR FOLLOWS ---------------------------- */
} /* isdgmr1_ */

/* DECK DXLCAL */
/* Subroutine */ int dxlcal1_(integer *n, integer *lgmr, doublereal *x, 
	doublereal *xl, doublereal *zl, doublereal *hes, integer *maxlp1, 
	doublereal *q, doublereal *v, doublereal *r0nrm, doublereal *wk, 
	doublereal *sz, integer *jscal, integer *jpre, integer *nmsl, 
	doublereal *rpar, integer *ipar, integer *nelt, integer *ia, integer *
	ja, doublereal *a, integer *isym)
{
    /* System generated locals */
    integer hes_dim1, hes_offset, v_dim1, v_offset, i__1;

    /* Local variables */
    integer i__, k, ll, llp1;
    extern /* Subroutine */ int dhels_(doublereal *, integer *, integer *, 
	    doublereal *, doublereal *), dcopy_(integer *, doublereal *, 
	    integer *, doublereal *, integer *), daxpy_(integer *, doublereal 
	    *, doublereal *, integer *, doublereal *, integer *), msolve_(
	    integer *, doublereal *, doublereal *, integer *, integer *, 
	    integer *, doublereal *, integer *, doublereal *, integer *);

/* ***BEGIN PROLOGUE  DXLCAL */
/* ***SUBSIDIARY */
/* ***PURPOSE  Internal routine for DGMRES. */
/* ***LIBRARY   SLATEC (SLAP) */
/* ***CATEGORY  D2A4, D2B4 */
/* ***TYPE      DOUBLE PRECISION (SXLCAL-S, DXLCAL-D) */
/* ***KEYWORDS  GENERALIZED MINIMUM RESIDUAL, ITERATIVE PRECONDITION, */
/*             NON-SYMMETRIC LINEAR SYSTEM, SLAP, SPARSE */
/* ***AUTHOR  Brown, Peter, (LLNL), pnbrown@llnl.gov */
/*           Hindmarsh, Alan, (LLNL), alanh@llnl.gov */
/*           Seager, Mark K., (LLNL), seager@llnl.gov */
/*             Lawrence Livermore National Laboratory */
/*             PO Box 808, L-60 */
/*             Livermore, CA 94550 (510) 423-3141 */
/* ***DESCRIPTION */
/*        This  routine computes the solution  XL,  the current DGMRES */
/*        iterate, given the  V(I)'s and  the  QR factorization of the */
/*        Hessenberg  matrix HES.   This routine  is  only called when */
/*        ITOL=11. */

/* *Usage: */
/*      INTEGER N, LGMR, MAXLP1, JSCAL, JPRE, NMSL, IPAR(USER DEFINED) */
/*      INTEGER NELT, IA(NELT), JA(NELT), ISYM */
/*      DOUBLE PRECISION X(N), XL(N), ZL(N), HES(MAXLP1,MAXL), Q(2*MAXL), */
/*     $                 V(N,MAXLP1), R0NRM, WK(N), SZ(N), */
/*     $                 RPAR(USER DEFINED), A(NELT) */
/*      EXTERNAL MSOLVE */

/*      CALL DXLCAL(N, LGMR, X, XL, ZL, HES, MAXLP1, Q, V, R0NRM, */
/*     $     WK, SZ, JSCAL, JPRE, MSOLVE, NMSL, RPAR, IPAR, */
/*     $     NELT, IA, JA, A, ISYM) */

/* *Arguments: */
/* N      :IN       Integer */
/*         The order of the matrix A, and the lengths */
/*         of the vectors SR, SZ, R0 and Z. */
/* LGMR   :IN       Integer */
/*         The number of iterations performed and */
/*         the current order of the upper Hessenberg */
/*         matrix HES. */
/* X      :IN       Double Precision X(N) */
/*         The current approximate solution as of the last restart. */
/* XL     :OUT      Double Precision XL(N) */
/*         An array of length N used to hold the approximate */
/*         solution X(L). */
/*         Warning: XL and ZL are the same array in the calling routine. */
/* ZL     :IN       Double Precision ZL(N) */
/*         An array of length N used to hold the approximate */
/*         solution Z(L). */
/* HES    :IN       Double Precision HES(MAXLP1,MAXL) */
/*         The upper triangular factor of the QR decomposition */
/*         of the (LGMR+1) by LGMR upper Hessenberg matrix whose */
/*         entries are the scaled inner-products of A*V(*,i) and V(*,k). */
/* MAXLP1 :IN       Integer */
/*         MAXLP1 = MAXL + 1, used for dynamic dimensioning of HES. */
/*         MAXL is the maximum allowable order of the matrix HES. */
/* Q      :IN       Double Precision Q(2*MAXL) */
/*         A double precision array of length 2*MAXL containing the */
/*         components of the Givens rotations used in the QR */
/*         decomposition of HES.  It is loaded in DHEQR. */
/* V      :IN       Double Precision V(N,MAXLP1) */
/*         The N by(LGMR+1) array containing the LGMR */
/*         orthogonal vectors V(*,1) to V(*,LGMR). */
/* R0NRM  :IN       Double Precision */
/*         The scaled norm of the initial residual for the */
/*         current call to DPIGMR. */
/* WK     :IN       Double Precision WK(N) */
/*         A double precision work array of length N. */
/* SZ     :IN       Double Precision SZ(N) */
/*         A vector of length N containing the non-zero */
/*         elements of the diagonal scaling matrix for Z. */
/* JSCAL  :IN       Integer */
/*         A flag indicating whether arrays SR and SZ are used. */
/*         JSCAL=0 means SR and SZ are not used and the */
/*                 algorithm will perform as if all */
/*                 SR(i) = 1 and SZ(i) = 1. */
/*         JSCAL=1 means only SZ is used, and the algorithm */
/*                 performs as if all SR(i) = 1. */
/*         JSCAL=2 means only SR is used, and the algorithm */
/*                 performs as if all SZ(i) = 1. */
/*         JSCAL=3 means both SR and SZ are used. */
/* JPRE   :IN       Integer */
/*         The preconditioner type flag. */
/* MSOLVE :EXT      External. */
/*         Name of the routine which solves a linear system Mz = r for */
/*         z given r with the preconditioning matrix M (M is supplied via */
/*         RPAR and IPAR arrays.  The name of the MSOLVE routine must */
/*         be declared external in the calling program.  The calling */
/*         sequence to MSOLVE is: */
/*             CALL MSOLVE(N, R, Z, NELT, IA, JA, A, ISYM, RPAR, IPAR) */
/*         Where N is the number of unknowns, R is the right-hand side */
/*         vector and Z is the solution upon return.  NELT, IA, JA, A and */
/*         ISYM are defined as below.  RPAR is a double precision array */
/*         that can be used to pass necessary preconditioning information */
/*         and/or workspace to MSOLVE.  IPAR is an integer work array */
/*         for the same purpose as RPAR. */
/* NMSL   :IN       Integer */
/*         The number of calls to MSOLVE. */
/* RPAR   :IN       Double Precision RPAR(USER DEFINED) */
/*         Double Precision workspace passed directly to the MSOLVE */
/*         routine. */
/* IPAR   :IN       Integer IPAR(USER DEFINED) */
/*         Integer workspace passed directly to the MSOLVE routine. */
/* NELT   :IN       Integer */
/*         The length of arrays IA, JA and A. */
/* IA     :IN       Integer IA(NELT) */
/*         An integer array of length NELT containing matrix data. */
/*         It is passed directly to the MATVEC and MSOLVE routines. */
/* JA     :IN       Integer JA(NELT) */
/*         An integer array of length NELT containing matrix data. */
/*         It is passed directly to the MATVEC and MSOLVE routines. */
/* A      :IN       Double Precision A(NELT) */
/*         A double precision array of length NELT containing matrix */
/*         data. */
/*         It is passed directly to the MATVEC and MSOLVE routines. */
/* ISYM   :IN       Integer */
/*         A flag to indicate symmetric matrix storage. */
/*         If ISYM=0, all non-zero entries of the matrix are */
/*         stored.  If ISYM=1, the matrix is symmetric and */
/*         only the upper or lower triangular part is stored. */

/* ***SEE ALSO  DGMRES */
/* ***ROUTINES CALLED  DAXPY, DCOPY, DHELS */
/* ***REVISION HISTORY  (YYMMDD) */
/*   890404  DATE WRITTEN */
/*   890404  Previous REVISION DATE */
/*   890915  Made changes requested at July 1989 CML Meeting.  (MKS) */
/*   890922  Numerous changes to prologue to make closer to SLATEC */
/*           standard.  (FNF) */
/*   890929  Numerous changes to reduce SP/DP differences.  (FNF) */
/*   910411  Prologue converted to Version 4.0 format.  (BAB) */
/*   910502  Removed MSOLVE from ROUTINES CALLED list.  (FNF) */
/*   910506  Made subsidiary to DGMRES.  (FNF) */
/*   920511  Added complete declaration section.  (WRB) */
/* ***END PROLOGUE  DXLCAL */
/*         The following is for optimized compilation on LLNL/LTSS Crays. */
/* LLL. OPTIMIZE */
/*     .. Scalar Arguments .. */
/*     .. Array Arguments .. */
/*     .. Local Scalars .. */
/*     .. External Subroutines .. */
/* ***FIRST EXECUTABLE STATEMENT  DXLCAL */
    /* Parameter adjustments */
    --wk;
    v_dim1 = *n;
    v_offset = 1 + v_dim1;
    v -= v_offset;
    --zl;
    --xl;
    --x;
    hes_dim1 = *maxlp1;
    hes_offset = 1 + hes_dim1;
    hes -= hes_offset;
    --q;
    --sz;
    --rpar;
    --ipar;
    --a;
    --ja;
    --ia;

    /* Function Body */
    ll = *lgmr;
    llp1 = ll + 1;
    i__1 = llp1;
    for (k = 1; k <= i__1; ++k) {
	wk[k] = 0.;
/* L10: */
    }
    wk[1] = *r0nrm;
    dhels_(&hes[hes_offset], maxlp1, &ll, &q[1], &wk[1]);
    i__1 = *n;
    for (k = 1; k <= i__1; ++k) {
	zl[k] = 0.;
/* L20: */
    }
    i__1 = ll;
    for (i__ = 1; i__ <= i__1; ++i__) {
	daxpy_(n, &wk[i__], &v[i__ * v_dim1 + 1], &c__1, &zl[1], &c__1);
/* L30: */
    }
    if (*jscal == 1 || *jscal == 3) {
	i__1 = *n;
	for (k = 1; k <= i__1; ++k) {
	    zl[k] /= sz[k];
/* L40: */
	}
    }
    if (*jpre > 0) {
	dcopy_(n, &zl[1], &c__1, &wk[1], &c__1);
	msolve_(n, &wk[1], &zl[1], nelt, &ia[1], &ja[1], &a[1], isym, &rpar[1]
		, &ipar[1]);
	++(*nmsl);
    }
/*         calculate XL from X and ZL. */
    i__1 = *n;
    for (k = 1; k <= i__1; ++k) {
	xl[k] = x[k] + zl[k];
/* L50: */
    }
    return 0;
/* ------------- LAST LINE OF DXLCAL FOLLOWS ---------------------------- */
} /* dxlcal1_ */

