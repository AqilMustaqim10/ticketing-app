/**
 * Authentication Middleware
 *
 * Verifies JWT Bearer tokens sent in request headers and attaches
 * the authenticated user session payload to req.user.
 */

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Check if authorization header is present
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Access denied. No token provided or invalid format.",
    });
  }

  // Extract token string after "Bearer "
  const token = authHeader.split(" ")[1];

  try {
    // Verify token using the secret key from environment variables
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ||
        "super_secret_jwt_key_change_in_production_123!",
    );

    // Attach decoded user payload to request object
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      error: "Invalid or expired token.",
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Authorization Middleware
 *
 * Restricts endpoint access to specified roles (e.g., ["ADMIN", "AGENT"]).
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error:
          "Forbidden. You do not have the required permissions for this action.",
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles,
};
