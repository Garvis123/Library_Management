// backend/config/jwt.js
const jwt = require('jsonwebtoken');

// JWT Configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
  expiresIn: process.env.JWT_EXPIRE || '7d',
  issuer: 'library-management-system',
  audience: 'library-users'
};

// Generate JWT token with additional claims
const generateToken = (payload) => {
  try {
    const tokenPayload = {
      id: payload.id || payload._id,
      email: payload.email,
      role: payload.role,
      // Add issued at and not before claims
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000)
    };

    const options = {
      expiresIn: jwtConfig.expiresIn,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      algorithm: 'HS256'
    };

    const token = jwt.sign(tokenPayload, jwtConfig.secret, options);
    
    return {
      token,
      expiresIn: jwtConfig.expiresIn,
      type: 'Bearer'
    };
  } catch (error) {
    console.error('JWT Generation Error:', error);
    throw new Error('Token generation failed');
  }
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    const options = {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      algorithms: ['HS256']
    };

    const decoded = jwt.verify(token, jwtConfig.secret, options);
    return {
      valid: true,
      decoded,
      error: null
    };
  } catch (error) {
    console.error('JWT Verification Error:', error);
    
    let errorMessage = 'Token verification failed';
    
    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token has expired';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token';
    } else if (error.name === 'NotBeforeError') {
      errorMessage = 'Token not active yet';
    }

    return {
      valid: false,
      decoded: null,
      error: errorMessage,
      type: error.name
    };
  }
};

// Decode JWT token without verification (for inspection)
const decodeToken = (token) => {
  try {
    const decoded = jwt.decode(token, { complete: true });
    return decoded;
  } catch (error) {
    console.error('JWT Decode Error:', error);
    return null;
  }
};

// Get token expiration time
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    console.error('JWT Expiration Check Error:', error);
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const expirationDate = getTokenExpiration(token);
    if (!expirationDate) return true;
    
    return new Date() > expirationDate;
  } catch (error) {
    console.error('JWT Expiration Check Error:', error);
    return true;
  }
};

// Refresh token (generate new token with same payload)
const refreshToken = (oldToken) => {
  try {
    const decoded = jwt.decode(oldToken);
    
    if (!decoded) {
      throw new Error('Invalid token for refresh');
    }

    // Create new token with same user data
    const newTokenData = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    return generateToken(newTokenData);
  } catch (error) {
    console.error('JWT Refresh Error:', error);
    throw new Error('Token refresh failed');
  }
};

// Extract token from Authorization header
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  // Check if header starts with 'Bearer '
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7); // Remove 'Bearer ' prefix
  }

  // Return the header as-is if no Bearer prefix
  return authHeader;
};

// Validate JWT configuration
const validateJWTConfig = () => {
  const issues = [];

  if (!process.env.JWT_SECRET) {
    issues.push('JWT_SECRET environment variable is not set');
  } else if (process.env.JWT_SECRET.length < 32) {
    issues.push('JWT_SECRET should be at least 32 characters long for security');
  }

  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === 'fallback_secret_change_in_production') {
    issues.push('Using fallback JWT_SECRET in production is not secure');
  }

  return {
    valid: issues.length === 0,
    issues
  };
};

// JWT middleware helper
const createJWTMiddleware = () => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const token = extractTokenFromHeader(authHeader);

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.'
        });
      }

      const verification = verifyToken(token);

      if (!verification.valid) {
        return res.status(401).json({
          success: false,
          message: verification.error
        });
      }

      // Attach user info to request
      req.user = verification.decoded;
      req.token = token;
      
      next();
    } catch (error) {
      console.error('JWT Middleware Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Token processing failed'
      });
    }
  };
};

// Export all JWT utilities
module.exports = {
  jwtConfig,
  generateToken,
  verifyToken,
  decodeToken,
  getTokenExpiration,
  isTokenExpired,
  refreshToken,
  extractTokenFromHeader,
  validateJWTConfig,
  createJWTMiddleware
};