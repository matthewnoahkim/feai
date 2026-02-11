import Link from 'next/link';

// Force dynamic rendering to prevent SSR issues with SessionProvider in layout
export const dynamic = 'force-dynamic';

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white" style={{ color: '#1a4d8f' }}>
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6" style={{ borderBottom: '1px solid #1a4d8f' }}>
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 flex items-center justify-center" style={{ background: '#1a4d8f' }}>
            <span style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>F</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: '1.125rem', color: '#1a4d8f' }}>FEAI</span>
        </Link>
        <Link
          href="/dashboard"
          className="px-4 py-2 text-sm font-sans text-white bg-cad-accent hover:bg-cad-accent-hover transition-colors no-underline"
        >
          Dashboard
        </Link>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-8 py-16">
        <h1 className="mb-4" style={{ fontSize: '2.5rem', fontWeight: 300 }}>
          API Documentation
        </h1>
        <p className="mb-12" style={{ fontSize: '1.1rem', opacity: 0.7 }}>
          RESTful API for FEAI engineering simulation platform
        </p>

        <div className="space-y-12">
          {/* Authentication */}
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Authentication
            </h2>
            <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
              The API uses session-based authentication via NextAuth.js. Sign in with Google OAuth
              to access protected endpoints.
            </p>
            <div className="p-4" style={{ background: '#f8fafc', border: '1px solid #1a4d8f' }}>
              <code style={{ fontSize: '0.875rem' }}>
                POST /api/auth/signin/google
              </code>
            </div>
          </section>

          {/* Projects */}
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Projects
            </h2>
            
            <div className="space-y-6">
              <div className="p-4" style={{ background: '#f8fafc', border: '1px solid #1a4d8f' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs font-mono text-white" style={{ background: '#22c55e' }}>GET</span>
                  <code style={{ fontSize: '0.875rem' }}>/api/projects</code>
                </div>
                <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>List all projects for the authenticated user</p>
              </div>

              <div className="p-4" style={{ background: '#f8fafc', border: '1px solid #1a4d8f' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs font-mono text-white" style={{ background: '#3b82f6' }}>POST</span>
                  <code style={{ fontSize: '0.875rem' }}>/api/projects</code>
                </div>
                <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Create a new project</p>
                <div className="mt-2 p-2" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
                  <pre style={{ fontSize: '0.75rem', margin: 0 }}>{`{
  "name": "My Project",
  "description": "Optional description"
}`}</pre>
                </div>
              </div>

              <div className="p-4" style={{ background: '#f8fafc', border: '1px solid #1a4d8f' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs font-mono text-white" style={{ background: '#22c55e' }}>GET</span>
                  <code style={{ fontSize: '0.875rem' }}>/api/projects/:id</code>
                </div>
                <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Get a specific project by ID</p>
              </div>

              <div className="p-4" style={{ background: '#f8fafc', border: '1px solid #1a4d8f' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs font-mono text-white" style={{ background: '#f59e0b' }}>PATCH</span>
                  <code style={{ fontSize: '0.875rem' }}>/api/projects/:id</code>
                </div>
                <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Update project metadata</p>
              </div>

              <div className="p-4" style={{ background: '#f8fafc', border: '1px solid #1a4d8f' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs font-mono text-white" style={{ background: '#ef4444' }}>DELETE</span>
                  <code style={{ fontSize: '0.875rem' }}>/api/projects/:id</code>
                </div>
                <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Delete a project</p>
              </div>

              <div className="p-4" style={{ background: '#f8fafc', border: '1px solid #1a4d8f' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs font-mono text-white" style={{ background: '#8b5cf6' }}>PUT</span>
                  <code style={{ fontSize: '0.875rem' }}>/api/projects/:id/data</code>
                </div>
                <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Save project CAD data</p>
              </div>
            </div>
          </section>

          {/* Response Format */}
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Response Format
            </h2>
            <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
              All endpoints return JSON. Error responses include an error code and message:
            </p>
            <div className="p-4" style={{ background: '#f8fafc', border: '1px solid #1a4d8f' }}>
              <pre style={{ fontSize: '0.75rem', margin: 0 }}>{`{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Project not found"
  }
}`}</pre>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8" style={{ borderTop: '1px solid #1a4d8f' }}>
          <Link 
            href="/dashboard"
            style={{ 
              color: '#1a4d8f', 
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
