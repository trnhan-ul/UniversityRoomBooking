const express = require("express");
const router = express.Router();
const auditLogController = require("../controllers/auditLogController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

router.use(authenticate);
router.use(authorizeRoles("ADMINISTRATOR", "FACILITY_MANAGER"));

router.get("/", auditLogController.getAuditLogs);

router.get("/stats", auditLogController.getAuditLogStats);

router.get("/:id", auditLogController.getAuditLogById);

module.exports = router;
