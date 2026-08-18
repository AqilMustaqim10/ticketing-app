const express = require("express");
const router = express.Router();
const prisma = require("../config/db");

// GET all tickets
router.get("/", async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        businessUnit: true,
        department: true,
        createdBy: true,
        assignedTo: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets." });
  }
});

// POST create a new ticket
router.post("/", async (req, res) => {
  try {
    const { title, description, priority, departmentId, businessUnitId } =
      req.body;

    // Generate unique ticket reference number
    const ticketNumber = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket = await prisma.ticket.create({
      data: {
        ticketNumber,
        title,
        description,
        priority: priority || "MEDIUM",
        status: "OPEN",
        departmentId: parseInt(departmentId),
        businessUnitId: parseInt(businessUnitId),
        createdById: 1, // Fallback creator ID for current context
      },
      include: {
        businessUnit: true,
        department: true,
        createdBy: true,
      },
    });

    res.status(201).json(newTicket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: "Failed to create ticket." });
  }
});

// PATCH ticket status
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedTicket = await prisma.ticket.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        businessUnit: true,
        department: true,
        createdBy: true,
        assignedTo: true,
      },
    });

    res.json(updatedTicket);
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({ error: "Failed to update ticket status." });
  }
});

module.exports = router;
