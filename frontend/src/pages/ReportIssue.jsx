import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from "../components/layout/Header";
import { createFacilityIssue } from "../services/facilityIssueService";
import { getMyBookings } from "../services/bookingService";
import { getEquipmentByRoom } from "../services/equipmentService";
import { formatTime12Hour } from "../utils/timeFormat";

const ReportIssue = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get pre-selected booking from navigation state
  const preSelectedBooking = location.state?.booking;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [equipment, setEquipment] = useState([]);
  const [loadingEquipment, setLoadingEquipment] = useState(false);

  const isBookingActiveNow = (booking) => {
    if (!booking?.date || !booking?.start_time || !booking?.end_time) {
      return false;
    }

    const now = new Date();
    const bookingDate = new Date(booking.date);

    const nowDayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    const bookingDayKey = `${bookingDate.getFullYear()}-${bookingDate.getMonth()}-${bookingDate.getDate()}`;

    if (nowDayKey !== bookingDayKey) {
      return false;
    }

    const toMinutes = (time) => {
      const [h, m] = (time || '').split(':').map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) return null;
      return h * 60 + m;
    };

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = toMinutes(booking.start_time);
    const endMinutes = toMinutes(booking.end_time);

    if (startMinutes === null || endMinutes === null) {
      return false;
    }

    return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
  };

  const [formData, setFormData] = useState({
    booking_id: preSelectedBooking?._id || "",
    room_id: preSelectedBooking?.room_id?._id || "",
    issue_type: "EQUIPMENT_DAMAGE",
    equipment_id: "",
    title: "",
    description: "",
    severity: "MEDIUM",
    location: "",
    images: [],
  });

  // Fetch user's bookings (only approved or checked-in bookings)
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoadingBookings(true);
        const response = await getMyBookings(1, 100);
        if (response.success && response.data) {
          // Only allow report during the current booking time slot.
          const allBookings = response.data.bookings || [];
          const validBookings = allBookings.filter(
            (booking) =>
              ["APPROVED", "CHECKED-IN"].includes(booking.status) &&
              isBookingActiveNow(booking),
          );
          setBookings(validBookings);
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setError("Failed to load your bookings");
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, []);

  // Fetch equipment for selected room
  useEffect(() => {
    const fetchEquipment = async () => {
      if (!formData.room_id) {
        setEquipment([]);
        return;
      }

      try {
        setLoadingEquipment(true);
        const response = await getEquipmentByRoom(formData.room_id);
        if (response.success) {
          setEquipment(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch equipment:", err);
      } finally {
        setLoadingEquipment(false);
      }
    };

    fetchEquipment();
  }, [formData.room_id]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // When booking changes, update room_id
    if (field === "booking_id") {
      const selectedBooking = bookings.find((b) => b._id === value);
      if (selectedBooking) {
        setFormData((prev) => ({
          ...prev,
          room_id: selectedBooking.room_id._id,
        }));
      }
    }

    // Clear equipment_id if issue type changes away from EQUIPMENT_DAMAGE
    if (field === "issue_type" && value !== "EQUIPMENT_DAMAGE") {
      setFormData((prev) => ({
        ...prev,
        equipment_id: "",
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    // Limit to 3 images
    if (files.length + formData.images.length > 3) {
      setError("You can upload a maximum of 3 images");
      return;
    }

    // Convert to base64
    const promises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises)
      .then((base64Images) => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...base64Images],
        }));
      })
      .catch((err) => {
        console.error("Error reading images:", err);
        setError("Failed to process images");
      });
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    console.log("=== SUBMITTING FACILITY ISSUE ===");
    console.log("Form data:", formData);

    try {
      // Validation
      if (
        !formData.booking_id ||
        !formData.room_id ||
        !formData.title ||
        !formData.description
      ) {
        const missingFields = [];
        if (!formData.booking_id) missingFields.push("booking");
        if (!formData.room_id) missingFields.push("room");
        if (!formData.title) missingFields.push("title");
        if (!formData.description) missingFields.push("description");
        const errorMsg = `Please fill in all required fields: ${missingFields.join(", ")}`;
        console.error("Validation failed:", errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      if (!selectedBooking || !isBookingActiveNow(selectedBooking)) {
        setError("You can only report facility issues during your current booking time slot");
        setLoading(false);
        return;
      }

      if (
        formData.issue_type === "EQUIPMENT_DAMAGE" &&
        !formData.equipment_id
      ) {
        console.error("Validation failed: No equipment selected");
        setError("Please select the damaged equipment");
        setLoading(false);
        return;
      }

      console.log("Validation passed, calling API...");
      const response = await createFacilityIssue(formData);
      console.log("API response:", response);

      if (response.success) {
        setSuccess("Facility issue reported successfully!");
        console.log("✓ Issue reported successfully");
        // Don't auto-redirect, let user click the button
      } else {
        console.error("API returned success=false:", response);
        setError(response.message || "Failed to report issue");
      }
    } catch (err) {
      console.error("Error submitting facility issue:", err);
      console.error("Error details:", err.response?.data || err.message);
      setError(
        err.response?.data?.message || err.message || "Failed to report issue",
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedBooking = bookings.find((b) => b._id === formData.booking_id);

  const issueTypes = [
    { value: "EQUIPMENT_DAMAGE", label: "Equipment Damage" },
    { value: "FACILITY_DAMAGE", label: "Facility Damage" },
    { value: "CLEANLINESS", label: "Cleanliness Issue" },
    { value: "SAFETY", label: "Safety Concern" },
    { value: "OTHER", label: "Other" },
  ];

  const severityLevels = [
    { value: "LOW", label: "Low", color: "text-green-600" },
    { value: "MEDIUM", label: "Medium", color: "text-yellow-600" },
    { value: "HIGH", label: "High", color: "text-orange-600" },
    { value: "CRITICAL", label: "Critical", color: "text-red-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Report Facility Issue
          </h1>
          <p className="mt-2 text-gray-600">
            Report any facility problems or equipment damage you encountered
            during your booking
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-green-700 font-medium">{success}</p>
                  <p className="text-green-600 text-sm mt-1">
                    Your issue has been submitted and is being reviewed.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigate("/my-reported-issues")}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                View My Issues
              </button>
              <button
                onClick={() => {
                  setSuccess("");
                  setFormData({
                    booking_id: "",
                    room_id: "",
                    issue_type: "EQUIPMENT_DAMAGE",
                    equipment_id: "",
                    title: "",
                    description: "",
                    severity: "MEDIUM",
                    location: "",
                    images: [],
                  });
                }}
                className="flex-1 px-4 py-2 bg-white text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-sm"
              >
                Report Another Issue
              </button>
            </div>
          </div>
        )}

        {/* Form - Hide when success */}
        {!success && (
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded-lg p-6 space-y-6"
          >
            {/* Booking Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Booking <span className="text-red-500">*</span>
              </label>
              {loadingBookings ? (
                <div className="text-gray-500">Loading bookings...</div>
              ) : bookings.length === 0 ? (
                <div className="text-gray-500 bg-gray-50 p-4 rounded-lg">
                  No current booking slot found. You can only report issues
                  during your active booking time.
                </div>
              ) : (
                <select
                  value={formData.booking_id}
                  onChange={(e) =>
                    handleInputChange("booking_id", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">-- Select a booking --</option>
                  {bookings.map((booking) => (
                    <option key={booking._id} value={booking._id}>
                      {booking.room_id?.room_code ||
                        booking.room_id?.room_name ||
                        "Room"}{" "}
                      - {new Date(booking.date).toLocaleDateString()} (
                      {formatTime12Hour(booking.start_time)} -{" "}
                      {formatTime12Hour(booking.end_time)})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected Booking Info */}
            {selectedBooking && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Booking Details
                </h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>
                    <strong>Room:</strong> {selectedBooking.room_id?.room_code}{" "}
                    - {selectedBooking.room_id?.room_name}
                  </p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {selectedBooking.room_id?.location}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(selectedBooking.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Time:</strong>{" "}
                    {formatTime12Hour(selectedBooking.start_time)} -{" "}
                    {formatTime12Hour(selectedBooking.end_time)}
                  </p>
                  <p>
                    <strong>Purpose:</strong> {selectedBooking.purpose}
                  </p>
                </div>
              </div>
            )}

            {/* Issue Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.issue_type}
                onChange={(e) =>
                  handleInputChange("issue_type", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {issueTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Equipment Selection (only for EQUIPMENT_DAMAGE) */}
            {formData.issue_type === "EQUIPMENT_DAMAGE" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Equipment <span className="text-red-500">*</span>
                </label>
                {loadingEquipment ? (
                  <div className="text-gray-500">Loading equipment...</div>
                ) : equipment.length === 0 ? (
                  <div className="text-gray-500 bg-gray-50 p-4 rounded-lg">
                    No equipment found for this room
                  </div>
                ) : (
                  <select
                    value={formData.equipment_id}
                    onChange={(e) =>
                      handleInputChange("equipment_id", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">-- Select equipment --</option>
                    {equipment.map((eq) => (
                      <option key={eq._id} value={eq._id}>
                        {eq.name} (Status: {eq.status})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {severityLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => handleInputChange("severity", level.value)}
                    className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                      formData.severity === level.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <span className={level.color}>{level.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Brief description of the issue"
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/200 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Provide detailed information about the issue..."
                rows={5}
                maxLength={2000}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/2000 characters
              </p>
            </div>

            {/* Location within room */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Location (Optional)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="E.g., Front desk, Back corner, Near projector..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images (Optional, max 3)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={formData.images.length >= 3}
              />
              {formData.images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || bookings.length === 0}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Submitting..." : "Report Issue"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportIssue;
