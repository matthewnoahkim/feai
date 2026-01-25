/**
 * Google OAuth Configuration
 * Loads and validates OAuth settings from environment variables
 */

interface AuthConfig {
  google: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cookie: {
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    domain?: string;
  };
  clientUrl: string;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOptionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

/**
 * Load and validate auth configuration from environment
 * Throws if required variables are missing
 */
export function loadAuthConfig(): AuthConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    google: {
      clientId: getRequiredEnv('GOOGLE_CLIENT_ID'),
      clientSecret: getRequiredEnv('GOOGLE_CLIENT_SECRET'),
      redirectUri: getRequiredEnv('GOOGLE_REDIRECT_URI'),
      // Request minimal scopes - only what we need
      scopes: [
        'openid',
        'email',
        'profile',
      ],
    },
    jwt: {
      // In production, JWT_SECRET should be a strong random string
      secret: getRequiredEnv('JWT_SECRET'),
      expiresIn: getOptionalEnv('JWT_EXPIRES_IN', '7d'),
    },
    cookie: {
      // SECURITY: Cookies should be secure in production (HTTPS only)
      secure: isProduction,
      // SECURITY: 'lax' allows redirects from Google, 'strict' would break OAuth
      sameSite: 'lax',
      // Set domain in production for cross-subdomain cookies if needed
      domain: process.env.COOKIE_DOMAIN,
    },
    // URL to redirect users after successful login
    clientUrl: getOptionalEnv('CLIENT_URL', 'http://localhost:3001'),
  };
}

// Lazy-loaded singleton to avoid initialization errors during import
let _config: AuthConfig | null = null;

export function getAuthConfig(): AuthConfig {
  if (!_config) {
    _config = loadAuthConfig();
  }
  return _config;
}
