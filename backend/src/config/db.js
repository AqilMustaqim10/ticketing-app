/**
 * Database Configuration Utility
 *
 * Initializes and exports a singleton instance of the PrismaClient.
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = prisma;
