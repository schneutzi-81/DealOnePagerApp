import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const TENANT_ID = process.env.AZURE_TENANT_ID!;
const CLIENT_ID = process.env.AZURE_CLIENT_ID!;

const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`,
  cache: true,
  rateLimit: true,
});

function getSigningKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export interface AuthenticatedUser {
  oid: string;       // Object ID (unique user identifier)
  name: string;
  email: string;
  roles: string[];   // App roles from Entra ID
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  jwt.verify(
    token,
    getSigningKey,
    {
      audience: CLIENT_ID,
      issuer: `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
      algorithms: ['RS256'],
    },
    (err, decoded) => {
      if (err) {
        res.status(401).json({ error: 'Invalid token', details: err.message });
        return;
      }

      const payload = decoded as jwt.JwtPayload;
      req.user = {
        oid: payload.oid || payload.sub || '',
        name: payload.name || 'Unknown',
        email: payload.preferred_username || payload.email || '',
        roles: (payload.roles as string[]) || [],
      };

      next();
    }
  );
}
