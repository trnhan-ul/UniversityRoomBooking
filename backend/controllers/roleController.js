const Role = require('../models/Role');
const User = require('../models/User');

// UC40: Get all roles (with pagination)
const getAllRoles = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await Role.countDocuments(filter);

    // Get roles with pagination
    const roles = await Role.find(filter)
      .populate('created_by', 'full_name email')
      .populate('updated_by', 'full_name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      message: 'Roles retrieved successfully',
      data: {
        roles,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve roles'
    });
  }
};

// UC40: Get role by ID
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id)
      .populate('created_by', 'full_name email')
      .populate('updated_by', 'full_name email');

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Role retrieved successfully',
      data: role
    });
  } catch (error) {
    console.error('Get role by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve role'
    });
  }
};

// UC40: Update role
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions = [] } = req.body;

    // Find role
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Chỉ cho phép chỉnh sửa role hệ thống hiện có, không đổi tên
    const predefinedRoles = ['STUDENT', 'LECTURER', 'FACILITY_MANAGER', 'ADMINISTRATOR'];
    if (!predefinedRoles.includes(role.name)) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ được chỉnh sửa role hệ thống hiện có'
      });
    }

    // Không cho đổi tên role
    if (name && name.toUpperCase() !== role.name) {
      return res.status(400).json({
        success: false,
        message: 'Không được đổi tên role hệ thống'
      });
    }

    // Update fields
    if (description !== undefined) role.description = description;
    if (permissions && Array.isArray(permissions)) role.permissions = permissions;
    role.updated_by = req.user._id;

    await role.save();
    await role.populate('created_by', 'full_name email');
    await role.populate('updated_by', 'full_name email');

    res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update role'
    });
  }
};

// UC41: Assign permissions to role
const assignPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions = [] } = req.body;

    // Validation
    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Permissions must be an array'
      });
    }

    // Find role
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Chỉ cho phép gán quyền cho role hệ thống
    const predefinedRoles = ['STUDENT', 'LECTURER', 'FACILITY_MANAGER', 'ADMINISTRATOR'];
    if (!predefinedRoles.includes(role.name)) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ được gán quyền cho role hệ thống'
      });
    }

    // Update permissions
    role.permissions = permissions;
    role.updated_by = req.user._id;
    await role.save();

    await role.populate('created_by', 'full_name email');
    await role.populate('updated_by', 'full_name email');

    res.status(200).json({
      success: true,
      message: 'Permissions assigned successfully',
      data: role
    });
  } catch (error) {
    console.error('Assign permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign permissions'
    });
  }
};

// Get available permissions
const getAvailablePermissions = async (req, res) => {
  try {
    const availablePermissions = [
      // Booking permissions
      { id: 'booking.create', name: 'Create Booking', category: 'Booking' },
      { id: 'booking.read', name: 'View Booking', category: 'Booking' },
      { id: 'booking.update', name: 'Update Booking', category: 'Booking' },
      { id: 'booking.delete', name: 'Cancel Booking', category: 'Booking' },
      { id: 'booking.approve', name: 'Approve Booking', category: 'Booking' },
      { id: 'booking.reject', name: 'Reject Booking', category: 'Booking' },

      // Room permissions
      { id: 'room.create', name: 'Create Room', category: 'Room' },
      { id: 'room.read', name: 'View Room', category: 'Room' },
      { id: 'room.update', name: 'Update Room', category: 'Room' },
      { id: 'room.delete', name: 'Delete Room', category: 'Room' },

      // User permissions
      { id: 'user.create', name: 'Create User', category: 'User' },
      { id: 'user.read', name: 'View User', category: 'User' },
      { id: 'user.update', name: 'Update User', category: 'User' },
      { id: 'user.delete', name: 'Delete User', category: 'User' },

      // Role permissions
      { id: 'role.read', name: 'View Role', category: 'Role' },
      { id: 'role.update', name: 'Update Role', category: 'Role' },

      // System permissions
      { id: 'system.settings', name: 'Manage Settings', category: 'System' },
      { id: 'system.analytics', name: 'View Analytics', category: 'System' },
      { id: 'system.logs', name: 'View Audit Logs', category: 'System' }
    ];

    res.status(200).json({
      success: true,
      message: 'Available permissions retrieved',
      data: availablePermissions
    });
  } catch (error) {
    console.error('Get available permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve available permissions'
    });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  updateRole,
  assignPermissions,
  getAvailablePermissions
};
