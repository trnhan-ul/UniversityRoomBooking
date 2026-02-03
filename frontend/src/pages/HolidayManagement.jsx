import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const HolidayManagement = () => {
  const [holidays, setHolidays] = useState([]);
  const [filteredHolidays, setFilteredHolidays] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentHoliday, setCurrentHoliday] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    isRecurring: false
  });

  const fetchHolidays = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/holidays?year=${selectedYear}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHolidays(response.data.holidays || []);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  }, [selectedYear]);

  const filterHolidays = useCallback(() => {
    let filtered = holidays;
    if (searchTerm) {
      filtered = holidays.filter(h => 
        h.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredHolidays(filtered);
  }, [holidays, searchTerm]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  useEffect(() => {
    filterHolidays();
  }, [filterHolidays]);

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/holidays`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setFormData({ name: '', date: '', description: '', isRecurring: false });
      fetchHolidays();
    } catch (error) {
      console.error('Error adding holiday:', error);
      alert(error.response?.data?.message || 'Failed to add holiday');
    }
  };

  const handleUpdateHoliday = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/holidays/${currentHoliday._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEditModal(false);
      setCurrentHoliday(null);
      setFormData({ name: '', date: '', description: '', isRecurring: false });
      fetchHolidays();
    } catch (error) {
      console.error('Error updating holiday:', error);
      alert(error.response?.data?.message || 'Failed to update holiday');
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/holidays/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchHolidays();
    } catch (error) {
      console.error('Error deleting holiday:', error);
      alert(error.response?.data?.message || 'Failed to delete holiday');
    }
  };

  const openEditModal = (holiday) => {
    setCurrentHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: new Date(holiday.date).toISOString().split('T')[0],
      description: holiday.description || '',
      isRecurring: holiday.isRecurring
    });
    setShowEditModal(true);
  };

  // Calendar generation
  const generateCalendar = (year) => {
    const months = [];
    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const days = [];
      // Empty cells for days before month starts
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
      }

      months.push({
        name: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        days
      });
    }
    return months;
  };

  const isHoliday = (year, monthIndex, day) => {
    if (!day) return false;
    const dateStr = new Date(year, monthIndex, day).toISOString().split('T')[0];
    return holidays.some(h => new Date(h.date).toISOString().split('T')[0] === dateStr);
  };

  const calendar = generateCalendar(selectedYear);

  // Pagination
  const totalPages = Math.ceil(filteredHolidays.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHolidays = filteredHolidays.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Academic Holidays</h1>
              <p className="text-gray-600 mt-1">Mark campus closures and block room bookings for specific dates.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Plus size={20} />
              Add New Holiday
            </button>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Calendar View</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedYear(selectedYear - 1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-lg font-medium">Academic Year {selectedYear}-{selectedYear + 1}</span>
              <button
                onClick={() => setSelectedYear(selectedYear + 1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {calendar.slice(0, 3).map((month, monthIndex) => (
              <div key={monthIndex} className="border rounded-lg p-4">
                <h3 className="font-semibold text-center mb-3">{month.name}</h3>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="font-medium text-gray-500">{day}</div>
                  ))}
                  {month.days.map((day, idx) => (
                    <div
                      key={idx}
                      className={`p-1 ${day ? 'hover:bg-gray-100' : ''} ${
                        day && isHoliday(selectedYear, monthIndex, day)
                          ? 'bg-red-100 text-red-600 font-semibold rounded'
                          : day ? 'text-gray-700' : ''
                      }`}
                    >
                      {day || ''}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Holidays Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Holidays</h2>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Filter holidays..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50 transition">
                <Filter size={18} />
                Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">HOLIDAY NAME</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">START DATE</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">END DATE</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">RECUR ANNUALLY</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedHolidays.map((holiday) => (
                  <tr key={holiday._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="font-medium">{holiday.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(holiday.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(holiday.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={holiday.isRecurring}
                          readOnly
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(holiday)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Edit2 size={18} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteHoliday(holiday._id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Trash2 size={18} className="text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredHolidays.length)} of {filteredHolidays.length} holidays
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Holiday Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add New Holiday</h2>
            <form onSubmit={handleAddHoliday}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Holiday Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Labor Day"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Additional details about this holiday"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isRecurring" className="ml-2 text-sm font-medium">
                    Recur annually
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ name: '', date: '', description: '', isRecurring: false });
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Holiday Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Holiday</h2>
            <form onSubmit={handleUpdateHoliday}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Holiday Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editIsRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="editIsRecurring" className="ml-2 text-sm font-medium">
                    Recur annually
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentHoliday(null);
                    setFormData({ name: '', date: '', description: '', isRecurring: false });
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Update Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidayManagement;
