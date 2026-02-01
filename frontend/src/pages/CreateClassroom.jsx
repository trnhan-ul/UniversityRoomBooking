import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../services/roomService';

const CreateClassroom = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [formData, setFormData] = useState({
    roomCode: '',
    roomName: '',
    building: '',
    capacity: '',
    roomType: '',
    amenities: {
      projector: false,
      whiteboard: false,
      airConditioning: true,
      wifi: true,
    },
    availability: true,
    images: [],
  });

  const [imagesPreviews, setImagesPreviews] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: !prev.amenities[amenity],
      },
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagesPreviews.length > 5) {
      setError('You can upload maximum 5 images');
      setFieldErrors(prev => ({ ...prev, images: 'Maximum 5 photos allowed' }));
      e.target.value = ''; // Reset input
      return;
    }

    // Clear previous errors
    setError('');
    setFieldErrors(prev => {
      const { images, ...rest } = prev;
      return rest;
    });

    const newPreviews = [];
    const newImages = [];

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setError('Each image must be less than 10MB');
        return;
      }

      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        setError('Only PNG and JPG images are allowed');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setImagesPreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
      newImages.push(file);
    });

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const handleRemoveImage = (index) => {
    setImagesPreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.roomCode.trim()) {
      errors.roomCode = 'Room Code is required';
      isValid = false;
    }
    
    if (!formData.roomName.trim()) {
      errors.roomName = 'Room Name is required';
      isValid = false;
    }
    
    if (!formData.building) {
      errors.building = 'Building / Location is required';
      isValid = false;
    }
    
    if (!formData.capacity) {
      errors.capacity = 'Capacity is required';
      isValid = false;
    } else if (formData.capacity < 1) {
      errors.capacity = 'Capacity must be at least 1';
      isValid = false;
    } else if (formData.capacity > 250) {
      errors.capacity = 'Capacity cannot exceed 250 people';
      isValid = false;
    }
    
    if (!formData.roomType) {
      errors.roomType = 'Room Type is required';
      isValid = false;
    }

    if (imagesPreviews.length === 0) {
      errors.images = 'At least 1 classroom photo is required';
      isValid = false;
    }

    setFieldErrors(errors);
    
    if (!isValid) {
      setError('Please fill in all required fields correctly');
    }
    
    return isValid;
  };

  const handleSubmit = async () => {
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare equipment array
      const equipment = [];
      if (formData.amenities.projector) equipment.push('Projector');
      if (formData.amenities.whiteboard) equipment.push('Whiteboard');
      if (formData.amenities.airConditioning) equipment.push('Air Conditioning');
      if (formData.amenities.wifi) equipment.push('Wi-Fi');

      // Prepare room data
      const roomData = {
        room_code: formData.roomCode.trim().toUpperCase(),
        room_name: formData.roomName.trim(),
        capacity: parseInt(formData.capacity),
        location: formData.building,
        description: `${formData.roomType} room`,
        status: formData.availability ? 'AVAILABLE' : 'UNAVAILABLE',
        equipment: equipment,
        images: imagesPreviews // Send base64 images
      };

      console.log('Submitting room data:', roomData); 

      const response = await createRoom(roomData);

      console.log('Create room response:', response); // Debug log

      if (response.success) {
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error('Create room error:', err); // Debug log
      setError(err.message || 'Failed to create classroom');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-4 flex-1">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Create New Classroom</h2>
          <div className="relative w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-md text-sm focus:ring-1 focus:ring-primary dark:text-slate-200"
              placeholder="Search metrics, users, or rooms..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <span className="material-symbols-outlined text-xl">dark_mode</span>
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
          <button onClick={() => navigate('/admin/dashboard')} className="hover:text-primary">
            Home
          </button>
          <span className="mx-2 text-slate-300 dark:text-slate-700">/</span>
          <button onClick={() => navigate('/room-inventory')} className="hover:text-primary">
            Room Inventory
          </button>
          <span className="mx-2 text-slate-300 dark:text-slate-700">/</span>
          <span className="text-slate-900 dark:text-white font-semibold">Create New Classroom</span>
        </nav>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">          {/* Error/Success Messages */}
          {error && (
            <div className="mx-8 mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Room Registration</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Provide information and visual documentation to register a new classroom.
            </p>
          </div>

          {/* Form Content */}
          <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
            {/* Left Column - Form Fields */}
            <div className="flex-1 p-8 space-y-8">
              {/* Room Name & Building */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Room Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="roomCode"
                    value={formData.roomCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-white dark:bg-slate-800 border ${fieldErrors.roomCode ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-700'} rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none`}
                    placeholder="e.g. R402"
                    type="text"
                  />
                  {fieldErrors.roomCode && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.roomCode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Room Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="roomName"
                    value={formData.roomName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-white dark:bg-slate-800 border ${fieldErrors.roomName ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-700'} rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none`}
                    placeholder="e.g. Bio-Lab 402"
                    type="text"
                  />
                  {fieldErrors.roomName && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.roomName}</p>
                  )}
                </div>
              </div>

              {/* Building & Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Building / Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="building"
                    value={formData.building}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-white dark:bg-slate-800 border ${fieldErrors.building ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-700'} rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none`}
                  >
                    <option value="">Select Building</option>
                    <option value="alpha">Alpha</option>
                    <option value="beta">Beta</option>
                    <option value="gamma">Gamma</option>
                  </select>
                  {fieldErrors.building && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.building}</p>
                  )}
                </div>
              </div>

              {/* Capacity & Room Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Capacity <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 pr-28 bg-white dark:bg-slate-800 border ${fieldErrors.capacity ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-700'} rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                      placeholder="50"
                      type="number"
                      min="1"
                      max="250"
                    />
                    <span className="absolute right-10 text-xs text-slate-400 font-bold uppercase pointer-events-none">
                      People
                    </span>
                    <div className="absolute right-3 flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, capacity: String(Math.min(250, Math.max(1, parseInt(prev.capacity || 0) + 1))) }))}
                        className="w-4 h-3 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        <span className="text-[10px]">▲</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, capacity: String(Math.max(1, parseInt(prev.capacity || 1) - 1)) }))}
                        className="w-4 h-3 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        <span className="text-[10px]">▼</span>
                      </button>
                    </div>
                  </div>
                  {fieldErrors.capacity && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.capacity}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Room Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <label className="flex-1 cursor-pointer">
                      <input
                        className="peer hidden"
                        name="roomType"
                        type="radio"
                        value="lecture"
                        checked={formData.roomType === 'lecture'}
                        onChange={handleInputChange}
                      />
                      <div className="h-full px-2 py-2.5 text-center text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-lg peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/30 peer-checked:border-primary peer-checked:text-primary transition-all">
                        Lecture
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input
                        className="peer hidden"
                        name="roomType"
                        type="radio"
                        value="lab"
                        checked={formData.roomType === 'lab'}
                        onChange={handleInputChange}
                      />
                      <div className="h-full px-2 py-2.5 text-center text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-lg peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/30 peer-checked:border-primary peer-checked:text-primary transition-all">
                        Lab
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input
                        className="peer hidden"
                        name="roomType"
                        type="radio"
                        value="seminar"
                        checked={formData.roomType === 'seminar'}
                        onChange={handleInputChange}
                      />
                      <div className="h-full px-2 py-2.5 text-center text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-lg peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/30 peer-checked:border-primary peer-checked:text-primary transition-all">
                        Seminar
                      </div>
                    </label>
                  </div>
                  {fieldErrors.roomType && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.roomType}</p>
                  )}
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Available Amenities
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer transition-all group">
                    <input
                      className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary focus:ring-offset-0 dark:bg-slate-800"
                      type="checkbox"
                      checked={formData.amenities.projector}
                      onChange={() => handleAmenityChange('projector')}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Projector</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Video</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer transition-all group">
                    <input
                      className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary focus:ring-offset-0 dark:bg-slate-800"
                      type="checkbox"
                      checked={formData.amenities.whiteboard}
                      onChange={() => handleAmenityChange('whiteboard')}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Whiteboard</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Surface</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer transition-all group">
                    <input
                      className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary focus:ring-offset-0 dark:bg-slate-800"
                      type="checkbox"
                      checked={formData.amenities.airConditioning}
                      onChange={() => handleAmenityChange('airConditioning')}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Air Cond.</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Climate</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer transition-all group">
                    <input
                      className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary focus:ring-offset-0 dark:bg-slate-800"
                      type="checkbox"
                      checked={formData.amenities.wifi}
                      onChange={() => handleAmenityChange('wifi')}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Wi-Fi</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Network</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Image Upload */}
            <div className="w-full lg:w-[420px] p-8 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-white mb-1">
                    Classroom Photos
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add up to 5 photos to help students locate and identify the room.
                  </p>
                </div>

                {/* Upload Area */}
                <div className="relative">
                  <div className={`border-2 border-dashed ${fieldErrors.images ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-700'} rounded-2xl p-8 transition-all ${imagesPreviews.length < 5 ? 'hover:border-primary hover:bg-white dark:hover:bg-slate-800 cursor-pointer' : 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800/50'} flex flex-col items-center justify-center gap-4 text-center bg-white/40 dark:bg-transparent`}>
                    <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-3xl">upload_file</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {imagesPreviews.length >= 5 ? (
                          'Maximum 5 photos uploaded'
                        ) : (
                          <>
                            Drag &amp; drop files or{' '}
                            <span className="text-primary underline cursor-pointer">browse</span>
                          </>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold mt-1 uppercase tracking-wider">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                    <input 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      multiple 
                      type="file" 
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleImageUpload}
                      disabled={imagesPreviews.length >= 5}
                    />
                  </div>
                  {fieldErrors.images && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">{fieldErrors.images}</p>
                  )}
                </div>

                {/* Image Preview Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {imagesPreviews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                      <img
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                        src={preview}
                      />
                      <button 
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                  
                  {imagesPreviews.length < 5 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all cursor-pointer bg-white/20 dark:bg-transparent">
                      <span className="material-symbols-outlined text-2xl">add_circle</span>
                      <span className="text-[10px] font-bold mt-1 uppercase">Add</span>
                      <input 
                        className="hidden" 
                        type="file" 
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>

                {/* Availability Toggle */}
                <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">Availability</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Set active for bookings
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        className="sr-only peer"
                        type="checkbox"
                        checked={formData.availability}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, availability: e.target.checked }))
                        }
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center gap-6">
            <button
              onClick={() => navigate('/room-inventory')}
              className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-10 py-3 bg-primary hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xl shadow-blue-500/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <span>Save Room</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-5xl text-green-600 dark:text-green-400">
                  check_circle
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                Success!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Classroom created successfully and added to inventory.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="px-8 pb-8 flex gap-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  // Reset form for creating another room
                  setFormData({
                    roomCode: '',
                    roomName: '',
                    building: '',
                    capacity: 30,
                    roomType: 'Lecture Hall',
                    amenities: {
                      projector: false,
                      whiteboard: false,
                      airConditioning: false,
                      wifi: false,
                    },
                    availability: true,
                  });
                  setImagesPreviews([]);
                }}
                className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-sm font-bold rounded-xl transition-all"
              >
                Create Another
              </button>
              <button
                onClick={() => navigate('/room-inventory')}
                className="flex-1 px-6 py-3 bg-primary hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xl shadow-blue-500/20 transition-all"
              >
                View Rooms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateClassroom;
