const express = require("express");
const router = express.Router();
const auditLogController = require("../controllers/auditLogController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// All routes require authentication and ADMINISTRATOR or FACILITY_MANAGER role
router.use(authenticate);
router.use(authorizeRoles("ADMINISTRATOR", "FACILITY_MANAGER"));

// GET /api/audit-logs -> Get all audit logs with pagination and filters
router.get("/", auditLogController.getAuditLogs);

// GET /api/audit-logs/stats -> Get audit log statistics
router.get("/stats", auditLogController.getAuditLogStats);

// GET /api/audit-logs/:id -> Get single audit log by ID
router.get("/:id", auditLogController.getAuditLogById);

module.exports = router;
