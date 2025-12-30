export const getAuth0Config = () => ({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_M2M_CLIENT_ID_NODE!,
  clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET_NODE!,
  spaClientId: process.env.AUTH0_SPA_CLIENT_ID!,
  spaClientSecret: process.env.AUTH0_SPA_CLIENT_SECRET!,
  audience: process.env.AUTH0_AUDIENCE!,
  connection: process.env.AUTH0_CONNECTION!,
});

export let auth0Config: ReturnType<typeof getAuth0Config>;

export const initAuth0Config = () => {
  auth0Config = getAuth0Config();

  const requiredEnvVars = [
    'AUTH0_DOMAIN',
    'AUTH0_M2M_CLIENT_ID',
    'AUTH0_M2M_CLIENT_SECRET',
    'AUTH0_SPA_CLIENT_ID',
    'AUTH0_SPA_CLIENT_SECRET',
    'AUTH0_AUDIENCE',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required env var: ${envVar}`);
    }
  }
};
