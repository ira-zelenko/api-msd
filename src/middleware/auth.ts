import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

let jwksCache = null;
let jwksCacheTime = 0;

async function getJWKS() {
    // Caching for 10 minutes
    if (jwksCache && Date.now() - jwksCacheTime < 600000) {
        return jwksCache;
    }

    const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`);
    jwksCache = await response.json();
    jwksCacheTime = Date.now();
    return jwksCache;
}

function getSigningKey(kid) {
    const jwks = getJWKS().then(j => {
        const key = j.keys.find(k => k.kid === kid);
        if (!key) throw new Error('Unable to find a signing key');
        return key;
    });
    return jwks;
}

export const jwtCheck = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ');

    if (!token) {
        return res.status(401).json({ error: 'No authorization token provided' });
    }

    try {
        const decoded = jwt.decode(token, { complete: true });

        if (!decoded) {
            return res.status(401).json({ error: 'Invalid token format' });
        }

        const key = await getSigningKey(decoded.header.kid);
        const verified = jwt.verify(token, key, {
            audience: process.env.AUTH0_AUDIENCE,
            issuer: `https://${process.env.AUTH0_DOMAIN}/`,
            algorithms: ['RS256']
        });

        req.auth = {
            payload: verified,
            sub: verified.sub
        };

        next();
    } catch (error) {
        console.error('JWT verification error:', error.message);
        res.status(401).json({ error: 'Invalid token' });
    }
};

export const requireClientType = (req, res, next) => {
    const userType = req.auth.payload['https://yourshippingdata.com/user_type'];

    if (userType !== 'client') {
        return res.status(403).json({
            error: 'Access Denied',
            message: 'This endpoint requires client type user',
            your_type: userType
        });
    }

    next();
};

export const requireManagerType = (req, res, next) => {
    const userType = req.auth.payload['https://yourshippingdata.com/user_type'];

    if (userType !== 'manager') {
        return res.status(403).json({
            error: 'Access Denied',
            message: 'This endpoint requires manager type user',
            your_type: userType
        });
    }

    next();
};
