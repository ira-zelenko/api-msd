import jwt, { JwtPayload } from 'jsonwebtoken';
import { createPublicKey } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

interface JWKS {
    keys: Array<{
        kid: string;
        kty: string;
        use: string;
        n: string;
        e: string;
        x5c?: string[];
    }>;
}

let jwksCache: JWKS | null = null;
let jwksCacheTime = 0;

async function getJWKS(): Promise<JWKS> {
    // Caching for 10 minutes
    if (jwksCache && Date.now() - jwksCacheTime < 600000) {
        return jwksCache;
    }

    const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`);
    jwksCache = await response.json() as JWKS;
    jwksCacheTime = Date.now();

    return jwksCache;
}

async function getSigningKey(kid: string): Promise<string> {
    const jwks = await getJWKS();
    const key = jwks.keys.find((k) => k.kid === kid);

    if (!key) {
        throw new Error('Unable to find a signing key');
    }

    const publicKey = createPublicKey({ key, format: 'jwk' });

    return publicKey.export({ type: 'spki', format: 'pem' }).toString();
}

export const jwtCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No authorization token provided' });

        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.decode(token, { complete: true }) as {
            header: { kid: string };
            payload: JwtPayload;
        } | null;

        if (!decoded) {
            res.status(401).json({ error: 'Invalid token format' });

            return;
        }

        const key = await getSigningKey(decoded.header.kid);

        const verified = jwt.verify(token, key, {
            audience: process.env.AUTH0_AUDIENCE,
            issuer: `https://${process.env.AUTH0_DOMAIN}/`,
            algorithms: ['RS256'],
        }) as JwtPayload;

        (req as any).auth = {
            payload: verified,
            sub: verified.sub,
        };

        next();
    } catch (err) {
        const error = err as Error;
        console.error('JWT verification error:', error.message);
        res.status(401).json({ error: 'Invalid token' });
    }
};

export const requireClientType = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
    const userType = (req as any).auth.payload['https://yourshippingdata.com/user_type'];

    if (userType !== 'MSD_User') {
        res.status(403).json({
            error: 'Access Denied',
            message: 'This endpoint requires client type user',
            your_type: userType,
        });

        return;
    }

    next();
};

export const requireManagerType = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
    const userType = (req as any).auth.payload['https://yourshippingdata.com/user_type'];

    if (userType !== 'YSD_User') {
        res.status(403).json({
            error: 'Access Denied',
            message: 'This endpoint requires manager type user',
            your_type: userType,
        });

        return;
    }

    next();
};
