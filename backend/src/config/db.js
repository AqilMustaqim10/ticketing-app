/**
 * Database Configuration Utility (Prisma 7 Driver Adapter)
 *
 * Configures and exports a PrismaClient instance using the better-sqlite3
 * driver adapter required by Prisma 7.
 */

const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const Database = require("better-sqlite3");
const path = require("path");

// Resolve path to SQLite database file
const dbPath = path.join(__dirname, "../../prisma/dev.db");
const sqlite = new Database(dbPath);

// Initialize the adapter
const adapter = new PrismaBetterSqlite3(sqlite);

// Pass the adapter into the PrismaClient constructor
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
