const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Public/authenticated GET routes (anyone can view equipment)
router.get('/', authenticate, equipmentController.getAllEquipment);
router.get('/room/:roomId', authenticate, equipmentController.getEquipmentByRoom);
router.get('/:id', authenticate, equipmentController.getEquipmentById);

// Protected routes (only FM/Admin can create/update/delete)
router.post('/', authenticate, authorizeRoles('FACILITY_MANAGER', 'ADMINISTRATOR'), equipmentController.createEquipment);
router.patch('/:id', authenticate, authorizeRoles('FACILITY_MANAGER', 'ADMINISTRATOR'), equipmentController.updateEquipment);
router.delete('/:id', authenticate, authorizeRoles('FACILITY_MANAGER', 'ADMINISTRATOR'), equipmentController.deleteEquipment);

module.exports = router;
