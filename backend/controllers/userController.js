const User = require('../models/User');
const mongoose = require('mongoose');

// Danh sách role hợp lệ lấy từ enum của User
const AVAILABLE_ROLES = [
  "STUDENT",
  "LECTURER",
  "FACILITY_MANAGER",
  "ADMINISTRATOR",
];

// Trả về danh sách role để FE hiển thị
exports.getAvailableRoles = (req, res) => {
  return res.status(200).json({ success: true, data: AVAILABLE_ROLES });
};

// UC41: View User Detail - Admin views user details
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const user = await User.findById(id)
      .populate('created_by', 'full_name email')
      .populate('updated_by', 'full_name email')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user details'
    });
  }
};

// UC42: Create User - Admin creates new user
exports.createUser = async (req, res) => {
  try {
    const { email, password, full_name, phone_number, role, status } = req.body;

    // Validation
    if (!email || !password || !full_name || !role) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: email, password, full_name, role",
      });
    }

    // Validate email format
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate role
    const validRoles = [
      "STUDENT",
      "LECTURER",
      "FACILITY_MANAGER",
      "ADMINISTRATOR",
    ];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      });
    }

    // Validate status if provided
    if (status && !["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be ACTIVE or INACTIVE",
      });
    }

    // Validate phone number if provided
    if (phone_number && !/^[0-9]{10,11}$/.test(phone_number)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number. Must be 10-11 digits",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user
    const newUser = await User.create({
      email,
      password,
      full_name,
      phone_number,
      role,
      status: status || "ACTIVE",
      created_by: req.user._id,
      is_email_verified: false,
    });

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Create user error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

// Get all users with filters - Admin views user list
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select("-password")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
    });
  }
};

// Update user - Admin updates user information
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone_number, role, status, avatar_url } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Build update object
    const updateData = {
      updated_by: req.user._id,
    };

    if (full_name) updateData.full_name = full_name;
    if (phone_number) {
      if (!/^[0-9]{10,11}$/.test(phone_number)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number. Must be 10-11 digits",
        });
      }
      updateData.phone_number = phone_number;
    }
    if (role) {
      const validRoles = [
        "STUDENT",
        "LECTURER",
        "FACILITY_MANAGER",
        "ADMINISTRATOR",
      ];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
        });
      }
      updateData.role = role;
    }
    if (status) {
      if (!["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be ACTIVE or INACTIVE",
        });
      }
      updateData.status = status;
    }
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

// Delete user (soft delete by setting status to INACTIVE)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Prevent deleting self
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { 
        status: 'INACTIVE',
        updated_by: req.user._id
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};
