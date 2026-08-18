/**
 * Ticket Routes
 *
 * Maps ticket endpoints to controller actions with authentication middleware protection.
 */

const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// All ticket routes require a valid JWT token
router.use(verifyToken);

// GET /api/tickets - Fetch tickets based on role scope
router.get("/", ticketController.getTickets);

// POST /api/tickets - Create a new support ticket (All roles can create)
router.post("/", ticketController.createTicket);

// PUT /api/tickets/:id - Update ticket details / status
router.put("/:id", ticketController.updateTicket);

// DELETE /api/tickets/:id - Delete ticket (Admin and Agents only)
router.delete(
  "/:id",
  authorizeRoles("ADMIN", "AGENT"),
  ticketController.deleteTicket,
);

module.exports = router;
