# 🚀 Vercel Deployment Guide - Complete Solution

## 🔴 **THE PROBLEM**

You're getting `FUNCTION_INVOCATION_FAILED` because:

1. **Serverless functions are stateless** - Express sessions stored in memory don't work across function invocations
2. **Wrong file path in vercel.json** - Pointing to TypeScript source instead of compiled JavaScript
3. **Missing session persistence** - Sessions need a database-backed store for serverless

---

## ✅ **THE SOLUTION** (Step by Step)

### **Step 1: Update Session Handling for Serverless**

We need to change from memory-based sessions to a simpler token-based auth that works in serverless environments.

#### Option A: Use JWT Tokens (Recommended for Serverless)

This removes the need for server-side session storage entirely.

**Changes needed:**
1. Replace express-session with JWT tokens
2. Send JWT in OAuth callback
3. Verify JWT on protected routes

#### Option B: Use Database Session Store (If you want to keep sessions)

Install a session store package and configure it.

**For Vercel Postgres:**
```bash
npm install connect-pg-simple --save -w @feai/backend
```

**For any Postgres (including Neon, Supabase):**
Use Prisma to store sessions.

---

### **Step 2: Fix Vercel Configuration**

I've already updated `vercel.json` to:
- Point to compiled JavaScript (`packages/backend/dist/index.js`)
- Include Prisma client files
- Set proper environment variables
- Increase max duration to 30s

---

### **Step 3: Environment Variables**

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | Postgres connection string | `postgresql://user:pass@host/db` |
| `GOOGLE_CLIENT_ID` | ✅ Yes | Google OAuth Client ID | `123.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | ✅ Yes | Google OAuth Secret | `GOCSPX-abc123` |
| `SESSION_SECRET` | ✅ Yes | Random secret for sessions | Generate with crypto |
| `NODE_ENV` | ✅ Yes | Must be "production" | `production` |
| `CLIENT_URL` | ⚠️  Optional | Your Vercel URL | `https://feai.vercel.app` |

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### **Step 4: Fix Google OAuth Redirect URI**

In [Google Cloud Console](https://console.cloud.google.com/):

1. Go to **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Add these **Authorized redirect URIs**:
   - `http://localhost:3001/auth/google/callback` (for local dev)
   - `https://your-app.vercel.app/auth/google/callback` (for production)
   - `https://your-app-*.vercel.app/auth/google/callback` (for preview deployments)

---

## 🎯 **ROOT CAUSE EXPLANATION**

### **Why This Error Occurs**

Vercel uses **serverless functions**, which are:
- **Stateless**: Each request might run on a different server/container
- **Cold starts**: Functions spin up on demand and shut down after
- **No persistent memory**: Variables stored in memory don't persist

Your code was designed for a **traditional server** that:
- Runs continuously on one machine
- Stores sessions in memory
- Maintains state between requests

### **The Conceptual Mismatch**

```
❌ Traditional Server (What you had):
┌─────────────────────┐
│  Express Server     │
│  ┌───────────────┐  │
│  │ Memory Store  │  │ ← Sessions stored here
│  │ Sessions: {   │  │
│  │   user123: {} │  │
│  │ }             │  │
│  └───────────────┘  │
└─────────────────────┘
      ↓ stays running ↓

✅ Serverless (What Vercel needs):
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Function │  │ Function │  │ Function │
│ Instance │  │ Instance │  │ Instance │
│ (Request │  │ (Request │  │ (Request │
│    1)    │  │    2)    │  │    3)    │
└──────────┘  └──────────┘  └──────────┘
      ↓           ↓              ↓
      No shared memory between them!
      
      Solution: Store in Database ↓
            ┌──────────────┐
            │   Postgres   │
            │  (Sessions)  │
            └──────────────┘
```

### **What the Code Was Doing Wrong**

```typescript
// ❌ This doesn't work in serverless:
app.use(session({
  secret: 'mysecret',
  // No "store" option = uses MemoryStore
}));

// When function restarts (after ~5-10 seconds of inactivity):
// 1. Memory is cleared
// 2. All sessions are lost
// 3. User appears logged out
// 4. OAuth callback fails because state is gone
```

---

## 🧠 **THE CORRECT MENTAL MODEL**

### **Serverless Functions Are Like Restaurant Kitchens**

**Traditional Server** = One chef who remembers your order:
- You tell the chef your order once
- Chef keeps it in their head (memory)
- Chef makes your food when ready

**Serverless** = Different chefs each time:
- Request 1: Chef A takes your order
- Request 2: Chef B handles cooking (doesn't know your order!)
- **Solution**: Write orders down (database) so any chef can read them

### **Session Storage Options for Serverless**

1. **JWT Tokens** (Stateless - Recommended)
   - ✅ No database needed for sessions
   - ✅ Scales infinitely
   - ✅ Fast
   - ⚠️  Can't revoke immediately (until expiry)
   - ⚠️  Token contains data (keep it small)

2. **Database Session Store** (Stateful)
   - ✅ Can revoke immediately
   - ✅ More control
   - ⚠️  Requires database query on each request
   - ⚠️  Slightly slower

3. **Redis/Upstash** (Fastest Stateful)
   - ✅ Very fast (in-memory database)
   - ✅ Can revoke immediately
   - ⚠️  Another service to manage
   - ⚠️  Extra cost

---

## ⚠️ **WARNING SIGNS - How to Recognize This Issue**

### **Code Smells That Won't Work in Serverless:**

```typescript
// ❌ RED FLAG #1: In-memory storage
const sessions = new Map(); // Lost on restart
let userCache = {}; // Lost on restart

// ❌ RED FLAG #2: File system writes
fs.writeFileSync('./uploads/file.jpg'); // Lost on restart

// ❌ RED FLAG #3: Background tasks
setInterval(() => cleanup(), 60000); // Stops when function stops

// ❌ RED FLAG #4: WebSockets
const wss = new WebSocketServer(); // Doesn't work in serverless

// ❌ RED FLAG #5: Session without store
app.use(session({ secret: '...' })); // Missing "store" option
```

### **Patterns That Work:**

```typescript
// ✅ GOOD: Database storage
await prisma.session.create({ ... });

// ✅ GOOD: External storage
await s3.upload(file);

// ✅ GOOD: Stateless auth
const token = jwt.sign({ userId }, secret);

// ✅ GOOD: Database-backed sessions
app.use(session({
  secret: '...',
  store: new PrismaSessionStore() // Persisted!
}));
```

---

## 🔍 **DEBUGGING CHECKLIST**

When you see `FUNCTION_INVOCATION_FAILED`:

1. **Check Vercel Function Logs** (Most Important!)
   - Go to Vercel Dashboard → Deployment → Functions
   - Click on your function
   - View runtime logs - the actual error will be here

2. **Common Errors and Their Meaning:**

   ```
   "Cannot find module 'path'"
   → Missing import or wrong path in code
   
   "PrismaClient is unable to be run in the browser"
   → Prisma not configured correctly for serverless
   
   "Can't reach database server"
   → DATABASE_URL not set or wrong
   
   "connect ECONNREFUSED"
   → Database isn't accessible from Vercel
   
   "Session secret not set"
   → SESSION_SECRET environment variable missing
   
   "req.session.save is not a function"
   → Session middleware not initialized properly
   ```

3. **Local vs Production Differences:**

   | Aspect | Local Development | Vercel Production |
   |--------|------------------|-------------------|
   | Process | Long-running | Starts/stops per request |
   | File system | Read/write | Read-only (except /tmp) |
   | Environment | .env file | Vercel environment variables |
   | Logs | Console | Vercel dashboard |
   | Sessions | Memory works | Need persistent store |
   | Database | Can use SQLite | Must use remote DB |

---

## 🛠️ **RECOMMENDED FIX (Immediate)**

Since you're on Vercel, the fastest fix is to switch to **JWT-based authentication**:

### **Pros:**
- ✅ Works perfectly in serverless
- ✅ No database session table needed
- ✅ Faster (no session lookup)
- ✅ Scales infinitely

### **What needs to change:**

1. **OAuth callback** - Issue JWT token instead of session
2. **Protected routes** - Verify JWT instead of checking session
3. **Frontend** - Already stores token in localStorage ✅

### **The good news:**
Your frontend already expects token-based auth! (It's using `localStorage.getItem('auth_token')`).

You just need to make the backend match this pattern.

---

## 📋 **DEPLOYMENT CHECKLIST**

Before deploying to Vercel:

### **Code**
- [x] vercel.json points to `packages/backend/dist/index.js`
- [ ] Session store configured (or switched to JWT)
- [ ] All file paths use `__dirname` or `path.join()`
- [ ] No file writes outside `/tmp`
- [ ] Environment variables used (not hardcoded)

### **Vercel Dashboard**
- [ ] DATABASE_URL set
- [ ] GOOGLE_CLIENT_ID set
- [ ] GOOGLE_CLIENT_SECRET set
- [ ] SESSION_SECRET set (64+ character random string)
- [ ] NODE_ENV set to "production"

### **Google Cloud Console**
- [ ] Redirect URI added: `https://your-app.vercel.app/auth/google/callback`
- [ ] Redirect URI added for preview: `https://your-app-*.vercel.app/auth/google/callback`

### **Database**
- [ ] Postgres database created (Vercel Postgres, Neon, Supabase, etc.)
- [ ] Connection string works from Vercel
- [ ] `npx prisma db push` run (to create tables)

---

## 🎬 **NEXT STEPS**

1. **Decide on auth approach:**
   - **Option A**: I can convert to JWT tokens (30 min, recommended)
   - **Option B**: I can set up Prisma session store (45 min)

2. **Test locally** with the changes

3. **Deploy to Vercel**

4. **Verify** it works:
   - Visit `https://your-app.vercel.app/api/health`
   - Try signing in
   - Check dashboard access

---

## 💡 **KEY TAKEAWAY**

**Serverless = Stateless by default**

If you need state (like sessions), you must explicitly persist it somewhere external (database, Redis, etc.). Memory doesn't survive between function invocations.

---

**Want me to implement the JWT token solution now?** This will make your auth work seamlessly on Vercel.

