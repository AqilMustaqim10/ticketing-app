/**
 * Ticket Controller
 *
 * Implements business logic for IT support tickets with strict Role-Based
 * Access Control (RBAC) filtering for ADMIN, AGENT, and USER roles.
 */

const prisma = require("../config/db");

/**
 * Get tickets based on user role and business unit scope
 * @route GET /api/tickets
 */
const getTickets = async (req, res) => {
  try {
    const { role, businessUnitId, id: userId } = req.user;
    let tickets = [];

    if (role === "ADMIN") {
      // ADMIN: Global scope - sees all tickets across all business units
      tickets = await prisma.ticket.findMany({
        include: {
          createdBy: { select: { id: true, fullName: true, username: true } },
          assignedTo: { select: { id: true, fullName: true, username: true } },
          businessUnit: true,
          department: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "AGENT") {
      // AGENT: Scoped strictly to their assigned Business Unit
      tickets = await prisma.ticket.findMany({
        where: { businessUnitId: businessUnitId },
        include: {
          createdBy: { select: { id: true, fullName: true, username: true } },
          assignedTo: { select: { id: true, fullName: true, username: true } },
          businessUnit: true,
          department: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "USER") {
      // USER: Scoped to their own personal tickets created
      tickets = await prisma.ticket.findMany({
        where: { createdById: userId },
        include: {
          createdBy: { select: { id: true, fullName: true, username: true } },
          assignedTo: { select: { id: true, fullName: true, username: true } },
          businessUnit: true,
          department: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return res.status(403).json({ error: "Unauthorized role access." });
    }

    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return res
      .status(500)
      .json({ error: "Internal server error while fetching tickets." });
  }
};

/**
 * Create a new IT support ticket
 * @route POST /api/tickets
 */
const createTicket = async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const { id: userId, businessUnitId, departmentId } = req.user;

    // Validate required fields
    if (!title || !description || !priority) {
      return res.status(400).json({
        error: "Title, description, and priority are required fields.",
      });
    }

    // Generate unique ticket number (e.g., TCK-1001 based on current count)
    const ticketCount = await prisma.ticket.count();
    const ticketNumber = `TCK-${1001 + ticketCount}`;

    // Create ticket linked to user's business unit and department
    const newTicket = await prisma.ticket.create({
      data: {
        ticketNumber,
        title,
        description,
        status: "OPEN", // Default initial status
        priority, // "LOW", "MEDIUM", "HIGH", "URGENT"
        createdById: userId,
        businessUnitId,
        departmentId,
      },
      include: {
        createdBy: { select: { id: true, fullName: true, username: true } },
        businessUnit: true,
        department: true,
      },
    });

    return res.status(201).json({
      message: "Ticket created successfully",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res
      .status(500)
      .json({ error: "Internal server error while creating ticket." });
  }
};

/**
 * Update an existing ticket (status, priority, assignment)
 * @route PUT /api/tickets/:id
 */
const updateTicket = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { status, priority, assignedToId } = req.body;
    const { role, businessUnitId, id: userId } = req.user;

    // Find existing ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    // Enforce RBAC update permissions
    if (role === "USER" && ticket.createdById !== userId) {
      return res
        .status(403)
        .json({ error: "You do not have permission to modify this ticket." });
    }
    if (role === "AGENT" && ticket.businessUnitId !== businessUnitId) {
      return res.status(403).json({
        error:
          "Agents can only update tickets within their assigned Business Unit.",
      });
    }

    // Perform update
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: status !== undefined ? status : ticket.status,
        priority: priority !== undefined ? priority : ticket.priority,
        assignedToId:
          assignedToId !== undefined ? assignedToId : ticket.assignedToId,
      },
      include: {
        createdBy: { select: { id: true, fullName: true, username: true } },
        assignedTo: { select: { id: true, fullName: true, username: true } },
        businessUnit: true,
        department: true,
      },
    });

    return res.status(200).json({
      message: "Ticket updated successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return res
      .status(500)
      .json({ error: "Internal server error while updating ticket." });
  }
};

/**
 * Delete a ticket (Admin or authorized agent only)
 * @route DELETE /api/tickets/:id
 */
const deleteTicket = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { role, businessUnitId } = req.user;

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    // Only ADMIN or AGENT from the matching business unit can delete tickets
    if (role === "AGENT" && ticket.businessUnitId !== businessUnitId) {
      return res.status(403).json({
        error:
          "Permission denied to delete tickets outside your business unit.",
      });
    }
    if (role === "USER") {
      return res
        .status(403)
        .json({ error: "Users are not permitted to delete tickets." });
    }

    await prisma.ticket.delete({
      where: { id: ticketId },
    });

    return res.status(200).json({ message: "Ticket deleted successfully." });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return res
      .status(500)
      .json({ error: "Internal server error while deleting ticket." });
  }
};

module.exports = {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
};
