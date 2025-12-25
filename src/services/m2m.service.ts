import NodeCache from 'node-cache';
import type { Request } from 'express';

const tokenCache = new NodeCache({ stdTTL: 3300 }); // Cache for 55 minutes

interface Auth0TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface FetchOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
}

export async function getM2MToken(): Promise<string> {
    const cached = tokenCache.get<string>('m2m_token');
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: process.env.AUTH0_M2M_CLIENT_ID,
                client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
                audience: process.env.YSD_API_AUDIENCE,
                grant_type: 'client_credentials'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to get M2M token: ${response.statusText} - ${errorText}`);
        }

        const data = (await response.json()) as Auth0TokenResponse;
        tokenCache.set('m2m_token', data.access_token);

        return data.access_token;
    } catch (error) {
        throw error;
    }
}

export async function callYSDAPI(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
    const token = await getM2MToken();

    return fetch(`${process.env.YSD_API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'X-Request-Source': 'nodejs-api',
            'Content-Type': 'application/json',
        },
    });
}

export async function proxyRequestToYSDAPI(
  req: Request & { auth?: any },
  endpoint: string
): Promise<Response> {
    /**
     * Proxies request from MSD client to YSD API through MSD API
     * Passes original User Token + user context
     */
    const userToken = req.headers.authorization;
    const userId = (req as any).auth?.sub;
    const userType = (req as any).auth?.payload?.['https://yourshippingdata.com/user_type'];

    return fetch(`${process.env.YSD_API_URL}${endpoint}`, {
        method: req.method,
        headers: {
            'Authorization': userToken ?? '',
            'X-User-Id': userId ?? '',
            'X-User-Type': userType ?? '',
            'X-Request-Source': 'client-a-proxy',
            'Content-Type': 'application/json',
        },
        body: req.method !== 'GET' && req.method !== 'HEAD'
          ? JSON.stringify(req.body)
          : undefined,
    });
}
