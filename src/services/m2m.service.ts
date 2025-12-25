import fetch from 'node-fetch';
import NodeCache from 'node-cache';

const tokenCache = new NodeCache({ stdTTL: 3300 }); // Cache for 55 минут

export async function getM2MToken() {
    const cached = tokenCache.get('m2m_token');
    if (cached) return cached;

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
            throw new Error(`Failed to get M2M token: ${response.statusText}`);
        }

        const data = await response.json();
        tokenCache.set('m2m_token', data.access_token);
        return data.access_token;
    } catch (error) {
        console.error('M2M token error:', error);
        throw error;
    }
}

export async function callYSDAPI(endpoint, options = {}) {
    const token = await getM2MToken();

    return fetch(`${process.env.YSD_API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'X-Request-Source': 'nodejs-api',
            'Content-Type': 'application/json'
        }
    });
}

export async function proxyRequestToYSDAPI(req, endpoint) {
    /**
     * Proxies request from MSD client to YSD API through MSD API
     * Passes original User Token + user context
     */
    const userToken = req.headers.authorization;
    const userId = req.auth.sub;
    const userType = req.auth.payload['https://yourshippingdata.com/user_type'];

    return fetch(`${process.env.YSD_API_URL}${endpoint}`, {
        method: req.method,
        headers: {
            'Authorization': userToken,
            'X-User-Id': userId,
            'X-User-Type': userType,
            'X-Request-Source': 'client-a-proxy',
            'Content-Type': 'application/json'
        },
        body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    });
}
