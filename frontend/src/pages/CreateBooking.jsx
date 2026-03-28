import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createBooking, createRecurringBooking } from '../services/bookingService';
import { getRooms } from '../services/roomService';
import { formatTime12Hour } from "../utils/timeFormat";
import Header from "../components/layout/Header";
import { useAuthContext } from "../context/AuthContext";

const CreateBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const canUseRecurring = user?.role === "LECTURER";

  // Get URL search params
  const searchParams = new URLSearchParams(location.search);
  const urlRoomId = searchParams.get("roomId");
  const urlDate = searchParams.get("date");
  const urlStartTime = searchParams.get("startTime");
  const urlEndTime = searchParams.get("endTime");
  const urlPurpose = searchParams.get("purpose");

  // Get room data from navigation state (if user clicked from room list)
  const preSelectedRoom = location.state?.room;
  const preSelectedDate = location.state?.date;
  const preSelectedTime = location.state?.time;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Recurring state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringData, setRecurringData] = useState({
    recurrence_type: "WEEKLY",
    occurrences: 4,
  });
  const [recurringResult, setRecurringResult] = useState(null);

  // Form state - prioritize URL params over state
  const [formData, setFormData] = useState({
    room_id: urlRoomId || preSelectedRoom?._id || "",
    date: urlDate || preSelectedDate || "",
    start_time: urlStartTime || preSelectedTime?.start || "08:00",
    end_time: urlEndTime || preSelectedTime?.end || "10:00",
    purpose: urlPurpose || "",
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        const response = await getRooms("AVAILABLE");
        if (response.success) {
          setRooms(response.data);
          // Set first room as default if no preselected room
          if (!preSelectedRoom && response.data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              room_id: response.data[0]._id,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
        setError("Failed to load rooms");
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [preSelectedRoom]);

  useEffect(() => {
    if (!canUseRecurring && isRecurring) {
      setIsRecurring(false);
    }
  }, [canUseRecurring, isRecurring]);

  // Get currently selected room from rooms array
  const selectedRoom = rooms.find((r) => r._id === formData.room_id) || {
    room_name: "Select a room",
    room_code: "",
    location: "",
    capacity: 0,
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRecurring && canUseRecurring) {
        const lastDate = previewDates[previewDates.length - 1];
        const response = await createRecurringBooking({
          room_id: formData.room_id,
          start_date: formData.date,
          end_date: lastDate,
          start_time: formData.start_time,
          end_time: formData.end_time,
          purpose: formData.purpose,
          recurrence_type: recurringData.recurrence_type,
        });
        if (response.success) {
          setRecurringResult(response.data);
        }
      } else {
        const response = await createBooking(formData);
        if (response.success) {
          alert("Booking created successfully! Waiting for approval.");
          navigate("/my-bookings");
        }
      }
    } catch (err) {
      setError(err.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem("booking_draft", JSON.stringify(formData));
    alert("Draft saved successfully!");
  };

  // Generate preview dates based on start date + occurrences
  const previewDates = useMemo(() => {
    if (!isRecurring || !formData.date || !recurringData.occurrences) return [];
    const start = new Date(formData.date);
    const maxOcc = recurringData.recurrence_type === "WEEKLY" ? 52 : 12;
    const count = Math.min(Number(recurringData.occurrences), maxOcc);
    const dates = [];
    let cur = new Date(start);
    for (let i = 0; i < count; i++) {
      dates.push(cur.toISOString().split("T")[0]);
      if (recurringData.recurrence_type === "WEEKLY") {
        cur = new Date(cur);
        cur.setDate(cur.getDate() + 7);
      } else {
        cur = new Date(cur);
        cur.setMonth(cur.getMonth() + 1);
      }
    }
    return dates;
  }, [isRecurring, formData.date, recurringData]);

  const canProceedToStep2 =
    formData.room_id &&
    formData.date &&
    formData.start_time &&
    formData.end_time;
  const recurringReady =
    !isRecurring || (recurringData.occurrences > 0 && previewDates.length > 0);
  const canProceedToStep3 = canProceedToStep2 && formData.purpose;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page Header */}
      <section className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create New Booking
                </h1>
                <p className="text-sm text-gray-500">
                  Complete the steps below to reserve your classroom.
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              STEP {currentStep} OF 3 • VERIFICATION
            </div>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div
              className={`flex items-center gap-3 ${currentStep >= 1 ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </div>
              <span className="font-medium hidden sm:inline">
                Selection Summary
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-4">
              <div
                className={`h-full bg-blue-600 transition-all ${currentStep >= 2 ? "w-full" : "w-0"}`}
              />
            </div>

            {/* Step 2 */}
            <div
              className={`flex items-center gap-3 ${currentStep >= 2 ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <span className="font-medium hidden sm:inline">Purpose</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-4">
              <div
                className={`h-full bg-blue-600 transition-all ${currentStep >= 3 ? "w-full" : "w-0"}`}
              />
            </div>

            {/* Step 3 */}
            <div
              className={`flex items-center gap-3 ${currentStep >= 3 ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= 3
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                3
              </div>
              <span className="font-medium hidden sm:inline">
                Review & Confirm
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm">
          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: Selection Summary */}
          {currentStep === 1 && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-blue-600">
                  calendar_today
                </span>
                <h2 className="text-lg font-semibold text-gray-900">
                  1. Selection Summary
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Room Selection */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Room Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Room <span className="text-red-500">*</span>
                    </label>
                    {loadingRooms ? (
                      <div className="text-center py-4">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-sm text-gray-500 mt-2">
                          Loading rooms...
                        </p>
                      </div>
                    ) : rooms.length === 0 ? (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
                        No available rooms found
                      </div>
                    ) : (
                      <select
                        value={formData.room_id}
                        onChange={(e) =>
                          handleInputChange("room_id", e.target.value)
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">-- Select a room --</option>
                        {rooms.map((room) => (
                          <option key={room._id} value={room._id}>
                            {room.room_name} ({room.room_code}) -{" "}
                            {room.location} - {room.capacity} seats
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Selected Room Display */}
                  {formData.room_id && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full mb-2">
                        SELECTED ROOM
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedRoom.room_name}{" "}
                        {selectedRoom.room_code &&
                          `- ${selectedRoom.room_code}`}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">
                            location_on
                          </span>
                          {selectedRoom.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">
                            groups
                          </span>
                          {selectedRoom.capacity} seats
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isRecurring ? "Start Date" : "Date"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          handleInputChange("date", e.target.value)
                        }
                        min={new Date().toISOString().split("T")[0]}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={formData.start_time}
                          onChange={(e) =>
                            handleInputChange("start_time", e.target.value)
                          }
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={formData.end_time}
                          onChange={(e) =>
                            handleInputChange("end_time", e.target.value)
                          }
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recurring Booking Toggle */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔁</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Recurring Booking
                          </p>
                          <p className="text-xs text-gray-500">
                            {canUseRecurring
                              ? "Repeat this booking weekly or monthly"
                              : "Only lecturers can use recurring booking"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={!canUseRecurring}
                        onClick={() => setIsRecurring(!isRecurring)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          isRecurring ? "bg-blue-600" : "bg-gray-300"
                        } ${!canUseRecurring ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isRecurring ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {canUseRecurring && isRecurring && (
                      <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                        {/* Recurrence Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recurrence Type
                          </label>
                          <div className="flex gap-4">
                            {["WEEKLY", "MONTHLY"].map((type) => (
                              <label
                                key={type}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name="recurrence_type"
                                  value={type}
                                  checked={
                                    recurringData.recurrence_type === type
                                  }
                                  onChange={() =>
                                    setRecurringData({
                                      ...recurringData,
                                      recurrence_type: type,
                                    })
                                  }
                                  className="text-blue-600"
                                />
                                <span className="text-sm text-gray-700">
                                  {type === "WEEKLY"
                                    ? "📅 Weekly (every 7 days)"
                                    : "🗓️ Monthly (same day each month)"}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Occurrences */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Repeat <span className="text-red-500">*</span>
                            <span className="ml-1 text-xs text-gray-400 font-normal">
                              (max{" "}
                              {recurringData.recurrence_type === "WEEKLY"
                                ? "52"
                                : "12"}{" "}
                              times)
                            </span>
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min="1"
                              max={
                                recurringData.recurrence_type === "WEEKLY"
                                  ? 52
                                  : 12
                              }
                              value={recurringData.occurrences}
                              onChange={(e) =>
                                setRecurringData({
                                  ...recurringData,
                                  occurrences: Math.max(
                                    1,
                                    parseInt(e.target.value) || 1,
                                  ),
                                })
                              }
                              className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-semibold text-lg"
                            />
                            <span className="text-sm text-gray-600">
                              {recurringData.recurrence_type === "WEEKLY"
                                ? "week(s)"
                                : "month(s)"}
                            </span>
                          </div>
                        </div>

                        {/* Date Preview List */}
                        {previewDates.length > 0 && (
                          <div className="border border-blue-200 rounded-lg overflow-hidden">
                            <div className="bg-blue-600 px-3 py-2 flex items-center gap-2">
                              <span className="text-white text-sm font-semibold">
                                📅 Schedule Preview
                              </span>
                              <span className="ml-auto bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                {previewDates.length} sessions
                              </span>
                            </div>
                            <div className="max-h-44 overflow-y-auto divide-y divide-gray-100">
                              {previewDates.map((date, idx) => {
                                const d = new Date(date + "T00:00:00");
                                const dayName = d.toLocaleDateString("en-US", {
                                  weekday: "short",
                                });
                                const formatted = d.toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                );
                                return (
                                  <div
                                    key={date}
                                    className="flex items-center gap-3 px-3 py-2 bg-white hover:bg-blue-50"
                                  >
                                    <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 text-xs font-bold rounded-full">
                                      {idx + 1}
                                    </span>
                                    <span className="text-xs font-semibold text-blue-500 w-8">
                                      {dayName}
                                    </span>
                                    <span className="text-sm text-gray-800">
                                      {formatted}
                                    </span>
                                    <span className="ml-auto text-xs text-gray-400">
                                      {formatTime12Hour(formData.start_time)} –{" "}
                                      {formatTime12Hour(formData.end_time)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Room Image */}
                <div className="hidden lg:block">
                  <img
                    src="https://images.unsplash.com/photo-1562774053-701939374585?w=400"
                    alt="Classroom"
                    className="w-full h-48 object-cover rounded-lg shadow-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back to Search
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!canProceedToStep2 || !recurringReady}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Purpose of Use */}
          {currentStep === 2 && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-blue-600">
                  description
                </span>
                <h2 className="text-lg font-semibold text-gray-900">
                  2. Purpose of Use
                </h2>
              </div>

              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose / Activity Description{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.purpose}
                    onChange={(e) =>
                      handleInputChange("purpose", e.target.value)
                    }
                    placeholder="Briefly describe what you'll be doing in the classroom..."
                    required
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Provide details about your planned activity (min. 20
                    characters)
                  </p>
                </div>
              </div>

              <div className="flex justify-between gap-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={!canProceedToStep3}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Additional Requirements */}
          {currentStep === 3 && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-blue-600">
                  check_circle
                </span>
                <h2 className="text-lg font-semibold text-gray-900">
                  3. Review & Confirm
                </h2>
              </div>

              <div className="max-w-2xl space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Booking Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium text-gray-900">
                        {selectedRoom.room_name} ({selectedRoom.room_code})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium text-gray-900">
                        {selectedRoom.location}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {isRecurring ? "Start Date" : "Date"}:
                      </span>
                      <span className="font-medium text-gray-900">
                        {formData.date}
                      </span>
                    </div>
                    {isRecurring && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Recurrence:</span>
                          <span className="font-medium text-blue-700">
                            🔁 {recurringData.recurrence_type} ×{" "}
                            {previewDates.length} sessions
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last session:</span>
                          <span className="font-medium text-gray-900">
                            {previewDates[previewDates.length - 1]}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium text-gray-900">
                        {formatTime12Hour(formData.start_time)} -{" "}
                        {formatTime12Hour(formData.end_time)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-600">Purpose:</span>
                      <span className="font-medium text-gray-900 text-right max-w-xs">
                        {formData.purpose}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Note:</span> Your booking
                    will be sent for approval. You will receive a notification
                    once it has been reviewed by the facility manager.
                  </p>
                </div>
              </div>

              <div className="flex justify-between gap-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ← Back
                </button>
                <div className="flex gap-3">
                  {/* <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-6 py-2 text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    Save as Draft
                  </button> */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : isRecurring ? (
                      <>🔁 Create {previewDates.length} Bookings</>
                    ) : (
                      <>Confirm Booking →</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </main>

      {/* Recurring Result Modal */}
      {recurringResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">
                  {recurringResult.created_count > 0 ? "✅" : "❌"}
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {recurringResult.created_count} of{" "}
                  {recurringResult.total_attempted} bookings created
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  🔁 {recurringResult.recurrence_type} recurring booking
                </p>
              </div>

              {/* Created */}
              {recurringResult.created_count > 0 && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-800 mb-2">
                    ✅ {recurringResult.created_count} bookings created —
                    pending approval
                  </p>
                </div>
              )}

              {/* Failed list */}
              {recurringResult.failed_count > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-orange-700 mb-2">
                    ⚠️ {recurringResult.failed_count} dates skipped:
                  </p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {recurringResult.failed.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 px-3 py-2 bg-orange-50 border border-orange-100 rounded text-xs"
                      >
                        <span className="text-orange-500 mt-0.5">•</span>
                        <div>
                          <span className="font-medium text-gray-900">
                            {f.date}
                          </span>
                          <span className="text-orange-700 ml-2">
                            — {f.reason}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate("/my-bookings")}
                className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                View My Bookings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateBooking;
