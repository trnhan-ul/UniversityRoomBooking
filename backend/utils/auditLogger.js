const AuditLog = require("../models/AuditLog");

const logAudit = async ({
  user,
  action,
  target_type,
  target_id = null,
  description,
  req = null,
}) => {
  try {
    // Extract IP address and user agent from request if available
    const ip_address = req ? req.ip || req.connection.remoteAddress : null;
    const user_agent = req ? req.get("user-agent") : null;

    const auditLog = await AuditLog.create({
      user_id: user._id,
      action,
      target_type,
      target_id,
      description,
      ip_address,
      user_agent,
    });

    return auditLog;
  } catch (error) {
    console.error("Error creating audit log:", error);
    // Don't throw error to prevent breaking the main operation
    return null;
  }
};

/**
 * Helper function to log authentication actions (LOGIN, LOGOUT)
 */
const logAuthAction = async (user, action, req) => {
  return logAudit({
    user,
    action,
    target_type: "User",
    target_id: user._id,
    description: `User ${action.toLowerCase()}: ${user.email}`,
    req,
  });
};

const logBookingAction = async (user, action, booking, description, req) => {
  return logAudit({
    user,
    action,
    target_type: "Booking",
    target_id: booking._id,
    description,
    req,
  });
};

const logRoomAction = async (user, action, room, description, req) => {
  return logAudit({
    user,
    action,
    target_type: "Room",
    target_id: room._id,
    description,
    req,
  });
};


const logUserAction = async (user, action, targetUser, description, req) => {
  return logAudit({
    user,
    action,
    target_type: "User",
    target_id: targetUser._id,
    description,
    req,
  });
};

const logEquipmentAction = async (user, action, equipment, description, req) => {
  return logAudit({
    user,
    action,
    target_type: "Equipment",
    target_id: equipment._id,
    description,
    req,
  });
};

const logSettingsAction = async (user, description, req) => {
  return logAudit({
    user,
    action: "UPDATE",
    target_type: "Setting",
    description,
    req,
  });
};

const logAuditAction = async (user, action, facilityIssue, description, req) => {
  return logAudit({
    user,
    action,
    target_type: "FacilityIssue",
    target_id: facilityIssue._id,
    description,
    req,
  });
};

module.exports = {
  logAudit,
  logAuthAction,
  logBookingAction,
  logRoomAction,
  logUserAction,
  logEquipmentAction,
  logSettingsAction,
  logAuditAction,
};
