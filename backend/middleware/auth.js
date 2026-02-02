const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment");
      return res
        .status(500)
        .json({ success: false, message: "Server misconfiguration" });
    }

    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Missing or invalid Authorization header",
      });
    }

    const token = authHeader.split(" ")[1];
    // Include SERVER_START_TIME to reject tokens from previous server sessions
    const secret = `${process.env.JWT_SECRET}_${global.SERVER_START_TIME || ""}`;
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token: user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

// roles: array of allowed role names e.g. ['ADMINISTRATOR', 'FACILITY_MANAGER']
// Can be called as: authorizeRoles('ADMIN', 'MANAGER') or authorizeRoles(['ADMIN', 'MANAGER'])
const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      // Support both authorizeRoles('A', 'B') and authorizeRoles(['A', 'B'])
      const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;

      const userRole = (req.user.role || "").toUpperCase();
      const allowed = allowedRoles.map((r) => r.toUpperCase());

      if (!allowed.includes(userRole)) {
        return res
          .status(403)
          .json({ success: false, message: "Forbidden: insufficient role" });
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

module.exports = { authenticate, authorizeRoles };
