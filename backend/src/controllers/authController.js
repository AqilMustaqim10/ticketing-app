/**
 * Authentication Controller
 *
 * Handles user authentication, password comparison, and JWT token generation.
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

/**
 * Login user and generate JWT token
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate request body inputs
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required." });
    }

    // Find user in database including business unit and department relations
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        businessUnit: true,
        department: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Compare submitted password with stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Create JWT payload containing necessary session metadata
    const payload = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role, // "ADMIN", "AGENT", or "USER"
      businessUnitId: user.businessUnitId,
      departmentId: user.departmentId,
    };

    // Sign token (expires in 24 hours)
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET ||
        "super_secret_jwt_key_change_in_production_123!",
      { expiresIn: "24h" },
    );

    // Return token and user profile details (excluding password)
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        businessUnit: user.businessUnit,
        department: user.department,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error during login." });
  }
};

module.exports = {
  login,
};
