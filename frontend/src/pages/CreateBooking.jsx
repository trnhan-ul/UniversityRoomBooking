import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createBooking } from '../services/bookingService';
import { getRooms } from '../services/roomService';

const CreateBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get URL search params
  const searchParams = new URLSearchParams(location.search);
  const urlRoomId = searchParams.get('roomId');
  const urlDate = searchParams.get('date');
  const urlStartTime = searchParams.get('startTime');
  const urlEndTime = searchParams.get('endTime');
  const urlPurpose = searchParams.get('purpose');
  
  // Get room data from navigation state (if user clicked from room list)
  const preSelectedRoom = location.state?.room;
  const preSelectedDate = location.state?.date;
  const preSelectedTime = location.state?.time;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Form state - prioritize URL params over state
  const [formData, setFormData] = useState({
    room_id: urlRoomId || preSelectedRoom?._id || '',
    date: urlDate || preSelectedDate || '',
    start_time: urlStartTime || preSelectedTime?.start || '08:00',
    end_time: urlEndTime || preSelectedTime?.end || '10:00',
    purpose: urlPurpose || '',
  });

  // Fetch rooms from database
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        const response = await getRooms('AVAILABLE');
        if (response.success) {
          setRooms(response.data);
          // Set first room as default if no preselected room
          if (!preSelectedRoom && response.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              room_id: response.data[0]._id
            }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
        setError('Failed to load rooms');
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [preSelectedRoom]);

  // Get currently selected room from rooms array
  const selectedRoom = rooms.find(r => r._id === formData.room_id) || {
    room_name: 'Select a room',
    room_code: '',
    location: '',
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
    setError('');
    setLoading(true);

    try {
      const response = await createBooking(formData);
      if (response.success) {
        alert('Booking created successfully! Waiting for approval.');
        navigate('/my-bookings');
      }
    } catch (err) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem('booking_draft', JSON.stringify(formData));
    alert('Draft saved successfully!');
  };

  const canProceedToStep2 = formData.room_id && formData.date && formData.start_time && formData.end_time;
  const canProceedToStep3 = canProceedToStep2 && formData.purpose;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
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
                <h1 className="text-2xl font-bold text-gray-900">Create New Booking</h1>
                <p className="text-sm text-gray-500">Complete the steps below to reserve your classroom.</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              STEP {currentStep} OF 3 • VERIFICATION
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div className={`flex items-center gap-3 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <span className="font-medium hidden sm:inline">Selection Summary</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-4">
              <div className={`h-full bg-blue-600 transition-all ${currentStep >= 2 ? 'w-full' : 'w-0'}`} />
            </div>

            {/* Step 2 */}
            <div className={`flex items-center gap-3 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className="font-medium hidden sm:inline">Purpose</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-4">
              <div className={`h-full bg-blue-600 transition-all ${currentStep >= 3 ? 'w-full' : 'w-0'}`} />
            </div>

            {/* Step 3 */}
            <div className={`flex items-center gap-3 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <span className="font-medium hidden sm:inline">Review & Confirm</span>
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
                <span className="material-symbols-outlined text-blue-600">calendar_today</span>
                <h2 className="text-lg font-semibold text-gray-900">1. Selection Summary</h2>
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
                        <p className="text-sm text-gray-500 mt-2">Loading rooms...</p>
                      </div>
                    ) : rooms.length === 0 ? (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
                        No available rooms found
                      </div>
                    ) : (
                      <select
                        value={formData.room_id}
                        onChange={(e) => handleInputChange('room_id', e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">-- Select a room --</option>
                        {rooms.map((room) => (
                          <option key={room._id} value={room._id}>
                            {room.room_name} ({room.room_code}) - {room.location} - {room.capacity} seats
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
                        {selectedRoom.room_name} {selectedRoom.room_code && `- ${selectedRoom.room_code}`}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">location_on</span>
                          {selectedRoom.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">groups</span>
                          {selectedRoom.capacity} seats
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
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
                          onChange={(e) => handleInputChange('start_time', e.target.value)}
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
                          onChange={(e) => handleInputChange('end_time', e.target.value)}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
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
                  disabled={!canProceedToStep2}
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
                <span className="material-symbols-outlined text-blue-600">description</span>
                <h2 className="text-lg font-semibold text-gray-900">2. Purpose of Use</h2>
              </div>

              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose / Activity Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    placeholder="Briefly describe what you'll be doing in the classroom..."
                    required
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Provide details about your planned activity (min. 20 characters)
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
                <span className="material-symbols-outlined text-blue-600">check_circle</span>
                <h2 className="text-lg font-semibold text-gray-900">3. Review & Confirm</h2>
              </div>

              <div className="max-w-2xl space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium text-gray-900">{selectedRoom.room_name} ({selectedRoom.room_code})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium text-gray-900">{selectedRoom.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium text-gray-900">{formData.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium text-gray-900">{formData.start_time} - {formData.end_time}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-600">Purpose:</span>
                      <span className="font-medium text-gray-900 text-right max-w-xs">{formData.purpose}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Note:</span> Your booking will be sent for approval. 
                    You will receive a notification once it has been reviewed by the facility manager.
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
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-6 py-2 text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    Save as Draft
                  </button>
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
                    ) : (
                      <>
                        Confirm Booking →
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
};

export default CreateBooking;
