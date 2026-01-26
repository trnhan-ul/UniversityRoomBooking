import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRooms, deleteRoom } from '../services/roomService';

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
        <button 
          onClick={() => navigate('/create-classroom')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold text-sm shadow-md hover:bg-primary/90 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>Add New Classroom</span>
        </button>
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
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={() => setShowFilters(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-white rounded-lg font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 border border-[#cfdbe7] dark:border-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">filter_list</span>
              <span>Filters</span>
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-white rounded-lg font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 border border-[#cfdbe7] dark:border-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">file_download</span>
              <span>Export</span>
            </button>
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
    </div>
  );
};

export default RoomInventory;
