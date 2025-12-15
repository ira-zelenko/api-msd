// backend/src/config/auth0.config.ts
export const auth0Config = {
  domain: process.env.AUTH0_DOMAIN!,

  // M2M Application (for creating users)
  clientId: process.env.AUTH0_M2M_CLIENT_ID!,
  clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET!,

  // SPA Application (for password grant / getting tokens)
  spaClientId: process.env.AUTH0_SPA_CLIENT_ID!,
  spaClientSecret: process.env.AUTH0_SPA_CLIENT_SECRET!,

  audience: process.env.AUTH0_AUDIENCE!,
  connection: 'Username-Password-Authentication',
};

console.log('🔧 Auth0 Config loaded:', {
  domain: auth0Config.domain,
  m2mClientId: auth0Config.clientId,
  spaClientId: auth0Config.spaClientId,
  connection: auth0Config.connection,
  audience: auth0Config.audience,
});

// Validate required environment variables
const requiredEnvVars = [
  'AUTH0_DOMAIN',
  'AUTH0_M2M_CLIENT_ID',
  'AUTH0_M2M_CLIENT_SECRET',
  'AUTH0_SPA_CLIENT_ID',
  'AUTH0_AUDIENCE',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
