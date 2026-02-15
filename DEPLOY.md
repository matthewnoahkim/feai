# FEAI – Production deployment & OAuth checklist

Use this checklist so Google OAuth works in production (e.g. https://feai.app).

---

## 1. OAuth callback route must exist in production

NextAuth is wired at:

- **Route file:** `packages/frontend/src/app/api/auth/[...nextauth]/route.ts`
- **Callback URL:** `https://feai.app/api/auth/callback/google`

If you get a **404 after Google redirect**, the callback route is not deployed or not reachable.

**Check:**

- Open: https://feai.app/api/auth/signin  
  - If it **404s** → Next.js API routes are not deployed or Root Directory is wrong.
- Open: https://feai.app/api/auth/callback/google  
  - Expect a 400/redirect from NextAuth, **not** 404.

---

## 2. Vercel: Root Directory and build

The app is a **monorepo**: the frontend depends on workspace packages `@feai/shared` and `@feai/kernel`. Install and build must run from the **repo root** so those packages are available.

- **Root Directory = `packages/frontend` (recommended for Next.js):**  
  - In Vercel: Project Settings → General → **Root Directory** → `packages/frontend`.  
  - Use the repo’s `vercel.json`: it runs **install** and **build** from the repo root (`cd ../.. && npm install` / `cd ../.. && npm run build`) so workspaces are linked and `@feai/shared` / `@feai/kernel` are built first.  
  - **Output Directory** is `.next` (relative to `packages/frontend`).  
  - Do **not** change Install/Build in Vercel UI to run only inside `packages/frontend`, or you’ll get “Cannot find module '@feai/shared'”.

- **Root Directory = repo root:**  
  - Set **Output Directory** to `packages/frontend/.next` and use a build that runs the full monorepo build from root (e.g. root `npm run build`).

If you see **“non-standard NODE_ENV”** in the build log, set in Vercel → Environment Variables: `NODE_ENV=production` for Production.  
If `/api/auth/signin` 404s in production, ensure Root Directory is `packages/frontend` and the build completes (so API routes are deployed).

---

## 3. NEXTAUTH_URL in production

In your **production** env (e.g. Vercel → Settings → Environment Variables), set:

```bash
NEXTAUTH_URL=https://feai.app
```

**Not** `http://localhost:3000` and **not** `http://feai.app` (must be HTTPS in production).  
Wrong or missing `NEXTAUTH_URL` can cause OAuth to fail or redirect incorrectly.

---

## 4. Google Cloud Console – Authorized redirect URI

In **Google Cloud Console** → **APIs & Services** → **Credentials** → your **OAuth 2.0 Client ID**:

- **Authorized redirect URIs** must include **exactly**:
  ```text
  https://feai.app/api/auth/callback/google
  ```

Check:

- `https` (not `http`)
- No `www` unless your app is served at `www.feai.app`
- No trailing slash
- Path is `/api/auth/callback/google`

Add separate entries for local and production if you use both:

- `http://localhost:3000/api/auth/callback/google`
- `https://feai.app/api/auth/callback/google`

---

## 5. Production env vars

In production, confirm these are set (and not from a wrong project):

- `NEXTAUTH_URL=https://feai.app`
- `NEXTAUTH_SECRET` (strong, random secret)
- `GOOGLE_CLIENT_ID` (from the same OAuth client that has the redirect URI above)
- `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL` (production DB)

If any are missing or point to dev/wrong project, OAuth or DB will fail.

---

## 6. Hosting / rewrites

If you use a static host (e.g. Netlify, Cloudflare Pages) **without** Next.js server, `/api/auth/...` will not exist. NextAuth needs a Node server (e.g. Vercel serverless or a Node server).

For **Vercel** with Next.js, no extra rewrites are needed for `/api/auth/...`; the App Router route handles it.

---

## Quick debug checklist

1. **Production:**  
   - https://feai.app/api/auth/signin → should **not** 404.  
   - https://feai.app/api/auth/callback/google → should **not** 404 (may 400/redirect).

2. **Env:**  
   - `NEXTAUTH_URL=https://feai.app` in production.

3. **Google Console:**  
   - Redirect URI: `https://feai.app/api/auth/callback/google` (exact).

4. **If 404 on `/api/auth/...`:**  
   - Backend/API routes are not deployed → fix Root Directory and build so the Next.js app in `packages/frontend` is built and deployed (see §2).
