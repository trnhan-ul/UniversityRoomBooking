const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Apply authentication and authorization middleware
router.use(authenticate);
router.use(authorizeRoles(["ADMINISTRATOR"]));

// UC40: Get all roles
router.get('/', roleController.getAllRoles);

// UC40: Get role by ID
router.get('/:id', roleController.getRoleById);

// UC40: Create new role
router.post('/', roleController.createRole);

// UC40: Update role
router.patch('/:id', roleController.updateRole);

// UC40: Delete role
router.delete('/:id', roleController.deleteRole);

// UC41: Assign permissions to role
router.patch('/:id/permissions', roleController.assignPermissions);

// Get available permissions
router.get('/permissions/available', roleController.getAvailablePermissions);

module.exports = router;
