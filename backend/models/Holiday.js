const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Holiday name is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Holiday date is required"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
holidaySchema.index({ date: 1 });
holidaySchema.index({ createdBy: 1 });

const Holiday = mongoose.model("Holiday", holidaySchema);

module.exports = Holiday;
