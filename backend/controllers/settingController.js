const Setting = require('../models/Setting');

// Get all settings
const getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.find().sort({ key: 1 });
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get all settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
};

// Get working hours settings
const getWorkingHours = async (req, res) => {
  try {
    const workingHoursStart = await Setting.findOne({ key: 'WORKING_HOURS_START' });
    const workingHoursEnd = await Setting.findOne({ key: 'WORKING_HOURS_END' });
    
    // Default values if not set
    const workingHours = {
      start: workingHoursStart?.value || '07:00',
      end: workingHoursEnd?.value || '21:00'
    };
    
    res.status(200).json({
      success: true,
      data: workingHours
    });
  } catch (error) {
    console.error('Get working hours error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch working hours',
      error: error.message
    });
  }
};

// Update working hours
const updateWorkingHours = async (req, res) => {
  try {
    const { start, end } = req.body;
    const userId = req.user.id;
    
    // Validation
    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Start time and end time are required'
      });
    }
    
    // Validate time format (HH:mm)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(start) || !timeRegex.test(end)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time format. Use HH:mm format (e.g., 07:00)'
      });
    }
    
    // Validate start < end
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (startMinutes >= endMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be before end time'
      });
    }
    
    // Update or create settings
    const startSetting = await Setting.findOneAndUpdate(
      { key: 'WORKING_HOURS_START' },
      {
        key: 'WORKING_HOURS_START',
        value: start,
        description: 'Working hours start time',
        data_type: 'TIME',
        updated_by: userId
      },
      { upsert: true, new: true }
    );
    
    const endSetting = await Setting.findOneAndUpdate(
      { key: 'WORKING_HOURS_END' },
      {
        key: 'WORKING_HOURS_END',
        value: end,
        description: 'Working hours end time',
        data_type: 'TIME',
        updated_by: userId
      },
      { upsert: true, new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Working hours updated successfully',
      data: {
        start: startSetting.value,
        end: endSetting.value
      }
    });
  } catch (error) {
    console.error('Update working hours error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update working hours',
      error: error.message
    });
  }
};

// Get a single setting by key
const getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    
    const setting = await Setting.findOne({ key: key.toUpperCase() });
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: setting
    });
  } catch (error) {
    console.error('Get setting by key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch setting',
      error: error.message
    });
  }
};

// Update a single setting
const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description, data_type } = req.body;
    const userId = req.user.id;
    
    if (!value) {
      return res.status(400).json({
        success: false,
        message: 'Value is required'
      });
    }
    
    const setting = await Setting.findOneAndUpdate(
      { key: key.toUpperCase() },
      {
        value,
        description: description || '',
        data_type: data_type || 'STRING',
        updated_by: userId
      },
      { new: true }
    );
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Setting updated successfully',
      data: setting
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update setting',
      error: error.message
    });
  }
};

module.exports = {
  getAllSettings,
  getWorkingHours,
  updateWorkingHours,
  getSettingByKey,
  updateSetting
};
