const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

    // Validate email must be @fpt.edu.vn
    if (!email.toLowerCase().endsWith("@fpt.edu.vn")) {
      return res.status(400).json({
        success: false,
        message: "Please use FPT University email (@fpt.edu.vn)",
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
      is_email_verified: true, // Admin-created accounts are pre-verified
    });

    // Gửi email chào mừng với thông tin tài khoản
    try {
      const { sendAccountCreatedEmail } = require('../services/emailService');
      await sendAccountCreatedEmail({
        email: newUser.email,
        password: password, // Send plain password to user
        full_name: newUser.full_name,
        role: newUser.role,
        phone_number: newUser.phone_number,
      });
      console.log('Account creation email sent successfully');
    } catch (emailError) {
      console.error('Failed to send account creation email:', emailError);
      // Continue even if email fails - don't block user creation
    }

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


exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;

    
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
    const { full_name, phone_number, role, status, avatar_url, is_email_verified } = req.body;

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
    if (is_email_verified !== undefined) updateData.is_email_verified = is_email_verified;

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
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
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



// UC-XX: Get My Profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; // From authenticate middleware

    // Find user without password
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return user info (password already excluded by default select: false)
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        phone_number: user.phone_number,
        avatar_url: user.avatar_url,
        role: user.role,
        status: user.status,
        is_email_verified: user.is_email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// UC-XX: Update My Profile
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; // From authenticate middleware
    const { full_name, phone_number, avatar_url } = req.body;

    // Build update object with only allowed fields
    const updateData = {};

    // Validate and add full_name
    if (full_name !== undefined) {
      if (typeof full_name !== 'string' || full_name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Full name cannot be empty'
        });
      }
      updateData.full_name = full_name.trim();
    }

    // Validate and add phone_number
    if (phone_number !== undefined) {
      if (phone_number && !/^[0-9]{10,11}$/.test(phone_number)) {
        return res.status(400).json({
          success: false,
          message: 'Phone number must be 10-11 digits'
        });
      }
      updateData.phone_number = phone_number;
    }

    // Add avatar_url
    if (avatar_url !== undefined) {
      // Validate base64 image size (max ~5MB base64 string)
      if (avatar_url && avatar_url.length > 7000000) {
        return res.status(400).json({
          success: false,
          message: 'Avatar image is too large. Please use an image smaller than 5MB'
        });
      }
      updateData.avatar_url = avatar_url;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    // Add metadata
    updateData.updated_by = userId;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return updated user info
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser._id,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        phone_number: updatedUser.phone_number,
        avatar_url: updatedUser.avatar_url,
        role: updatedUser.role,
        updated_at: updatedUser.updated_at
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)[0].message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// UC-XX: Change My Password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; // From authenticate middleware
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // 1. Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password and confirm password are required'
      });
    }

    // 2. Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // 3. Check if new password matches confirm password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match'
      });
    }

    // 4. Check if new password is same as current password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // 5. Find user with password
    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 6. Verify current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // 7. Update password (will be auto-hashed by pre-save hook)
    user.password = newPassword;
    user.updated_by = userId;
    await user.save();

    // 8. Return success response
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

