import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRooms, deleteRoom, getRoomById, updateRoomImages } from '../services/roomService';

const RoomInventory = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    location: '',
  });
  const roomsPerPage = 5;

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await getRooms(''); // Get all rooms regardless of status
      if (response.success) {
        setRooms(response.data);
        setTotalRooms(response.data.length);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setShowFilters(false);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: '', location: '' });
    setShowFilters(false);
    setCurrentPage(1);
  };

  const handleDelete = (room) => {
    setRoomToDelete(room);
    setShowDeleteModal(true);
  };

  const handleManageImages = (room) => {
    setSelectedRoom(room);
    setShowImageModal(true);
  };

  const confirmDelete = async () => {
    if (!roomToDelete) return;
    
    try {
      const response = await deleteRoom(roomToDelete._id);
      if (response.success) {
        setShowDeleteModal(false);
        setRoomToDelete(null);
        fetchRooms(); // Refresh list
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      alert(error.message || 'Failed to delete room');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Room Code', 'Room Name', 'Location', 'Capacity', 'Status'],
      ...filteredRooms.map(room => [
        room.room_code,
        room.room_name,
        room.location,
        room.capacity,
        room.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `room-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredRooms = rooms.filter(room => {
    const matchSearch = room.room_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.room_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = !filters.status || room.status === filters.status;
    const matchLocation = !filters.location || room.location?.toLowerCase().includes(filters.location.toLowerCase());

    return matchSearch && matchStatus && matchLocation;
  });

  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

  const getStatusBadge = (status) => {
    const statusStyles = {
      AVAILABLE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      UNAVAILABLE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      MAINTENANCE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    };

    const statusLabels = {
      AVAILABLE: 'Available',
      UNAVAILABLE: 'Unavailable',
      MAINTENANCE: 'Maintenance'
    };

    const statusDotColors = {
      AVAILABLE: 'bg-green-600 dark:bg-green-400',
      UNAVAILABLE: 'bg-red-600 dark:bg-red-400',
      MAINTENANCE: 'bg-amber-600 dark:bg-amber-400'
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusStyles[status] || statusStyles.AVAILABLE}`}>
        <span className={`size-1.5 rounded-full ${statusDotColors[status] || statusDotColors.AVAILABLE}`}></span>
        {statusLabels[status] || 'Available'}
      </span>
    );
  };

  const getRoomIcon = (roomName) => {
    const name = roomName?.toLowerCase() || '';
    if (name.includes('lab')) return 'science';
    if (name.includes('auditorium') || name.includes('theater')) return 'theaters';
    return 'meeting_room';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-background-light dark:bg-background-dark">
      {/* Page Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-[#0d141b] dark:text-white text-3xl font-black leading-tight tracking-tight">
            Room Inventory
          </h2>
          <p className="text-[#4c739a] text-sm">Manage and monitor all facility spaces in real-time.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/create-classroom')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold text-sm shadow-md hover:bg-primary/90 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span>Add New Classroom</span>
          </button>
        </div>
      </header>

      {/* Toolbar & Search */}
      <section className="px-8 pb-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-[#cfdbe7] dark:border-slate-700">
          <div className="flex flex-1 w-full max-w-md">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#cfdbe7] dark:border-slate-600 bg-background-light dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all dark:text-white"
                placeholder="Search rooms by name, building, or type..."
                type="text"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Data Table Container */}
      <section className="px-8 flex-1 pb-8">
        <div className="overflow-hidden bg-white dark:bg-slate-800 rounded-xl border border-[#cfdbe7] dark:border-slate-700 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-[#cfdbe7] dark:border-slate-700">
                  <th className="px-6 py-4 text-[#4c739a] text-xs font-bold uppercase tracking-wider w-[25%]">
                    Room Name
                  </th>
                  <th className="px-6 py-4 text-[#4c739a] text-xs font-bold uppercase tracking-wider">
                    Room Code
                  </th>
                  <th className="px-6 py-4 text-[#4c739a] text-xs font-bold uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-[#4c739a] text-xs font-bold uppercase tracking-wider text-center">
                    Capacity
                  </th>
                  <th className="px-6 py-4 text-[#4c739a] text-xs font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[#4c739a] text-xs font-bold uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cfdbe7] dark:divide-slate-700">
                {currentRooms.length > 0 ? (
                  currentRooms.map((room) => (
                    <tr key={room._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="size-8 bg-primary/10 rounded flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-base">
                              {getRoomIcon(room.room_name)}
                            </span>
                          </div>
                          <span className="font-semibold text-[#0d141b] dark:text-white">
                            {room.room_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[#4c739a] dark:text-slate-300">
                        {room.room_code}
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-[#4c739a] dark:text-slate-300">
                          {room.location}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center font-medium dark:text-slate-300">
                        {room.capacity}
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(room.status)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleManageImages(room)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg border border-primary dark:border-primary bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-primary transition-all"
                            title="Manage images"
                          >
                            <span className="material-symbols-outlined text-lg">photo_library</span>
                          </button>
                          <button 
                            onClick={() => navigate(`/update-classroom/${room._id}`)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                            title="Edit room"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(room)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                            title="Delete room"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-[#4c739a]">
                      No rooms found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredRooms.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-[#cfdbe7] dark:border-slate-700">
              <span className="text-sm text-[#4c739a] font-medium">
                Showing {indexOfFirstRoom + 1} to {Math.min(indexOfLastRoom, filteredRooms.length)} of {filteredRooms.length} rooms
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 rounded-lg border border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                      currentPage === index + 1
                        ? 'bg-primary text-white'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  className="p-2 rounded-lg border border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowFilters(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Filter Rooms</h3>
              <button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                >
                  <option value="">All Status</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="Enter location..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">warning</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Delete Room</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to delete <strong>{roomToDelete?.room_name}</strong>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Manager Modal */}
      <ImageManagerModal
        isOpen={showImageModal}
        onClose={() => {
          setShowImageModal(false);
          setSelectedRoom(null);
        }}
        roomId={selectedRoom?._id}
        roomName={selectedRoom?.room_name}
        onSuccess={() => {
          fetchRooms(); // Refresh room list after updating images
        }}
      />
    </div>
  );
};

// ImageManagerModal Component (embedded)
const ImageManagerModal = ({ isOpen, onClose, roomId, roomName, onSuccess }) => {
  const [images, setImages] = useState([]);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && roomId) {
      loadRoomImages();
    }
  }, [isOpen, roomId]);

  const loadRoomImages = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getRoomById(roomId);
      
      if (response.success) {
        const roomImages = response.data.images || [];
        setImagesPreviews(roomImages);
        setImages(roomImages);
      }
    } catch (err) {
      setError(err.message || 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagesPreviews.length > 10) {
      setError('Maximum 10 images allowed');
      e.target.value = '';
      return;
    }

    setError('');
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
          setImages((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
      newImages.push(file);
    });

    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    setImagesPreviews((prev) => prev.filter((_, i) => i !== index));
    setImages((prev) => prev.filter((_, i) => i !== index));
    
    if (index === coverIndex) {
      setCoverIndex(0);
    } else if (index < coverIndex) {
      setCoverIndex(prev => prev - 1);
    }
  };

  const handleSetCover = (index) => {
    setCoverIndex(index);
  };

  const handleSave = async () => {
    if (images.length === 0) {
      setError('At least 1 image is required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const reorderedImages = [...images];
      if (coverIndex !== 0) {
        const coverImage = reorderedImages.splice(coverIndex, 1)[0];
        reorderedImages.unshift(coverImage);
      }

      // Call new API endpoint for updating images only
      const response = await updateRoomImages(roomId, reorderedImages);

      if (response.success) {
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to update images');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                Manage Classroom Images
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {roomName}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={saving}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Add New Images
            </label>
            <div className="relative">
              <div className={`border-2 border-dashed ${imagesPreviews.length >= 10 ? 'border-slate-300 dark:border-slate-700 opacity-50 cursor-not-allowed' : 'border-primary hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer'} rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-3 text-center`}>
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">upload_file</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {imagesPreviews.length >= 10 ? 'Maximum 10 images reached' : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    PNG, JPG up to 10MB ({imagesPreviews.length}/10 images)
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImageUpload}
                  disabled={imagesPreviews.length >= 10}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Current Images ({imagesPreviews.length})
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : imagesPreviews.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700">image</span>
                <p className="text-slate-500 dark:text-slate-400 mt-2">No images yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagesPreviews.map((preview, index) => (
                  <div
                    key={index}
                    className={`relative group aspect-square rounded-xl overflow-hidden border-2 ${index === coverIndex ? 'border-yellow-500 shadow-lg' : 'border-slate-200 dark:border-slate-700'} bg-slate-100 dark:bg-slate-800 hover:border-primary transition-all`}
                  >
                    <img
                      src={preview}
                      alt={`Room image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {index === coverIndex && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <span className="material-symbols-outlined text-sm">star</span>
                        Cover
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {index !== coverIndex && (
                        <button
                          onClick={() => handleSetCover(index)}
                          className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                          title="Set as cover"
                        >
                          <span className="material-symbols-outlined text-lg">star</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        title="Delete image"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            * Click star icon to set cover image. Cover image will be displayed first.
          </p>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || imagesPreviews.length === 0}
            className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomInventory;
