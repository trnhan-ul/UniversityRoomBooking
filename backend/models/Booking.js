const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    start_time: {
      type: String,
      required: [true, "Start time is required"],
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Please provide valid time format (HH:mm)",
      ],
    },
    end_time: {
      type: String,
      required: [true, "End time is required"],
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Please provide valid time format (HH:mm)",
      ],
    },
    purpose: {
      type: String,
      required: [true, "Purpose is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "CHECKED-IN"],
      default: "PENDING",
      required: true,
    },
    reject_reason: {
      type: String,
      trim: true,
      default: null,
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approved_at: {
      type: Date,
      default: null,
    },
    qr_code_token: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    checked_in_at: {
      type: Date,
      default: null,
    },
    check_in_type: {
      type: String,
      enum: ["ON_TIME", "LATE"],
      default: null,
    },
    recurrence_id: {
      type: String,
      default: null,
    },
    recurrence_type: {
      type: String,
      enum: ["NONE", "WEEKLY", "MONTHLY"],
      default: "NONE",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes
bookingSchema.index({ user_id: 1 });
bookingSchema.index({ room_id: 1 });
bookingSchema.index({ date: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ room_id: 1, date: 1, start_time: 1, end_time: 1 });

// Virtual để check conflict
bookingSchema.virtual("time_slot").get(function () {
  return `${this.start_time}-${this.end_time}`;
});

module.exports = mongoose.model("Booking", bookingSchema);
