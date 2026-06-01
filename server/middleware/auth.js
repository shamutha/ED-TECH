import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

/**
 * Middleware to verify JWT and attach user payload to request.
 * Usage: app.use(requireAuth(['student', 'company', 'admin']));
 */
export function requireAuth(allowedRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1]; // Expect "Bearer <token>"
    if (!token) {
      return res.status(401).json({ error: 'Missing authentication token' });
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      // payload should contain { id, role, email, ... }
      if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      req.user = payload;
      next();
    } catch (err) {
      console.warn('Auth error:', err.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

/**
 * Helper to generate JWT for a given user payload.
 */
export function generateToken(userPayload) {
  // token valid for 15 minutes
  const accessToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '15m' });
  // optional refresh token (longer expiry) could be added later
  return { accessToken };
}
