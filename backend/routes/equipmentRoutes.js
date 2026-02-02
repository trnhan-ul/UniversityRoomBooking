const express = require("express");
const router = express.Router();
const equipmentController = require("../controllers/equipmentController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// All equipment routes require authentication and FM/Admin roles
router.use(authenticate);
router.use(authorizeRoles("FACILITY_MANAGER", "ADMINISTRATOR"));

// Get all equipment (with optional filters)
router.get("/", equipmentController.getAllEquipment);

// Get equipment by room ID
router.get("/room/:roomId", equipmentController.getEquipmentByRoom);

// Get single equipment by ID
router.get("/:id", equipmentController.getEquipmentById);

// Create new equipment
router.post("/", equipmentController.createEquipment);

// Update equipment
router.patch("/:id", equipmentController.updateEquipment);

// Delete equipment
router.delete("/:id", equipmentController.deleteEquipment);

module.exports = router;
