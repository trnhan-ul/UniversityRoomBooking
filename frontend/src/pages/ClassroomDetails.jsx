import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { getRoomById } from '../services/roomService';

const ClassroomDetails = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const [room, setRoom] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [menuTimeout, setMenuTimeout] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
    purpose: 'Academic Lecture'
  });

  // Fetch room data from API
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId) return;
      
      try {
        setLoading(true);
        const response = await getRoomById(roomId);
        if (response.success) {
          setRoom(response.data);
        } else {
          // Fallback to mock data if API fails
          const mockRooms = window.mockRooms || [];
          const mockRoom = mockRooms.find(r => r._id === roomId) || mockRooms[0] || {};
          setRoom(mockRoom);
        }
      } catch (error) {
        console.error('Error fetching room:', error);
        // Fallback to mock data
        const mockRooms = window.mockRooms || [];
        const mockRoom = mockRooms.find(r => r._id === roomId) || mockRooms[0] || {};
        setRoom(mockRoom);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId]);

  // Equipment icon mapping
  const equipmentIcons = {
    projector: { icon: 'videocam', title: 'Projector' },
    ac: { icon: 'ac_unit', title: 'Air Conditioning' },
    whiteboard: { icon: 'draw', title: 'Whiteboard' },
    computer: { icon: 'desktop_windows', title: 'Workstations' },
    natural_light: { icon: 'wb_sunny', title: 'Natural Light' }
  };

  // Get room images - use images from room data if available
  const roomImages = (room.images && room.images.length > 0) 
    ? room.images 
    : [(window.roomImages && window.roomImages[0]) || 'https://via.placeholder.com/800x400?text=Classroom'];

  const roomImage = roomImages[currentImageIndex] || roomImages[0];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % roomImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + roomImages.length) % roomImages.length);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuEnter = () => {
    if (menuTimeout) {
      clearTimeout(menuTimeout);
      setMenuTimeout(null);
    }
    setShowProfileMenu(true);
  };

  const handleMenuLeave = () => {
    const timeout = setTimeout(() => {
      setShowProfileMenu(false);
    }, 300);
    setMenuTimeout(timeout);
  };

  if (loading) {
    return (
      <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading room details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <span className="material-symbols-outlined block">domain</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight">UniBooking</h1>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a onClick={() => navigate('/search-classrooms')} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer">Classrooms</a>
              <a onClick={() => navigate('/my-bookings')} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer">My Bookings</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div 
              className="relative"
              onMouseEnter={handleMenuEnter}
              onMouseLeave={handleMenuLeave}
            >
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-primary hover:border-blue-600 transition-colors cursor-pointer"
              >
                <img className="w-full h-full object-cover" data-alt="User profile avatar portrait" src={`https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=136dec&color=fff`}/>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/my-profile');
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">person</span>
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/my-profile');
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">lock</span>
                    Change Password
                  </button>
                  <hr className="my-2 border-slate-200 dark:border-slate-700" />
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Main Content */}
          <div className="flex-1 space-y-8">
            {/* Hero Section & Gallery */}
            <section className="space-y-4">
              <div className="relative group h-[400px] w-full rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                <div className="absolute inset-0 bg-cover bg-center" data-alt={`Wide shot of ${room.room_name}`} style={{backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%), url('${roomImage}')`}}></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h2 className="text-3xl font-bold">{room.room_name}</h2>
                  <p className="text-slate-300 text-sm font-semibold mb-1">{room.room_code}</p>
                  <p className="text-slate-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {room.location}
                  </p>
                </div>
                {roomImages.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                    <div className="absolute bottom-6 right-6 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">photo_library</span>
                      {currentImageIndex + 1} / {roomImages.length}
                    </div>
                  </>
                )}
              </div>
              {roomImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {roomImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex 
                          ? 'border-primary scale-105' 
                          : 'border-slate-300 dark:border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`${room.room_name} view ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Room Specifications Grid */}
            <section>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                Room Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 flex flex-col gap-2">
                  <span className="material-symbols-outlined text-primary">groups</span>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Capacity</p>
                    <p className="font-semibold">{room.capacity} Persons</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 flex flex-col gap-2">
                  <span className="material-symbols-outlined text-primary">wifi</span>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Connectivity</p>
                    <p className="font-semibold">Wi-Fi 6 Ready</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 flex flex-col gap-2">
                  <span className="material-symbols-outlined text-primary">ac_unit</span>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Climate</p>
                    <p className="font-semibold">A/C Controlled</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 flex flex-col gap-2">
                  <span className="material-symbols-outlined text-primary">accessible</span>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Access</p>
                    <p className="font-semibold">Full Access</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Equipment Section */}
            <section>
              <h3 className="text-xl font-bold mb-4">Technical Equipment</h3>
              <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(room.equipment || []).map((eq, idx) => {
                    const equipIcon = equipmentIcons[eq];
                    if (!equipIcon) return null;
                    return (
                      <li key={idx} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg"><span className="material-symbols-outlined">{equipIcon.icon}</span></div>
                          <span className="font-medium">{equipIcon.title}</span>
                        </div>
                        <span className="text-sm text-slate-500">Available</span>
                      </li>
                    );
                  })}
                  {(!room.equipment || room.equipment.length === 0) && (
                    <li className="p-4 text-center text-slate-500">
                      No equipment information available
                    </li>
                  )}
                </ul>
              </div>
            </section>
          </div>

          {/* Right Column: Booking Sidebar */}
          <aside className="w-full lg:w-96">
            <div className="sticky top-24 space-y-6">
              {/* Booking Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-2xl font-bold">{room.room_name}</h4>
                      <p className="text-slate-500 text-sm">{room.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase font-bold">Status</p>
                      <p className={`font-semibold ${room.status === 'AVAILABLE' ? 'text-green-500' : 'text-slate-500'}`}>{room.status}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Select Date</span>
                      <div className="mt-1 relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">calendar_today</span>
                        <input 
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all" 
                          type="date" 
                          value={bookingData.date}
                          onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Start Time</span>
                        <div className="mt-1 relative">
                          <input 
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all" 
                            type="time" 
                            value={bookingData.startTime}
                            onChange={(e) => setBookingData(prev => ({ ...prev, startTime: e.target.value }))}
                          />
                        </div>
                      </label>
                      <label className="block">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">End Time</span>
                        <div className="mt-1 relative">
                          <input 
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all" 
                            type="time" 
                            value={bookingData.endTime}
                            onChange={(e) => setBookingData(prev => ({ ...prev, endTime: e.target.value }))}
                          />
                        </div>
                      </label>
                    </div>
                    <label className="block">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Booking Purpose</span>
                      <select 
                        className="mt-1 w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        value={bookingData.purpose}
                        onChange={(e) => setBookingData(prev => ({ ...prev, purpose: e.target.value }))}
                      >
                        <option>Academic Lecture</option>
                        <option>Student Society Meeting</option>
                        <option>Exam / Assessment</option>
                        <option>Guest Speaker</option>
                      </select>
                    </label>
                  </div>
                  <button 
                    onClick={() => navigate(`/create-booking?roomId=${roomId}&date=${bookingData.date}&startTime=${bookingData.startTime}&endTime=${bookingData.endTime}&purpose=${bookingData.purpose}`)}
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    disabled={room.status !== 'AVAILABLE'}
                  >
                    <span className="material-symbols-outlined">bolt</span>
                    {room.status === 'AVAILABLE' ? 'Book Now' : 'Not Available'}
                  </button>
                  <p className="text-center text-xs text-slate-400">
                    This room requires faculty approval for bookings longer than 3 hours.
                  </p>
                </div>
              </div>

              {/* Room Manager Card */}
              <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <h5 className="text-sm font-bold mb-3">Room Supervisor</h5>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full overflow-hidden bg-slate-300">
                    <img className="w-full h-full object-cover" data-alt="Portrait of the classroom manager" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBB-i8KbW-0ovoWKXcQTkzMb0vXCEcN_fPN3bR_fKGyf7ct6F-VALSrWpTcQlQCE1r0Eg-XIVkCYy-LbQgCxOO9KBQV9I9UPaJtL5UMjXkr--I-3OQJcW5R1nBRjDu7rFfMuiO98CYCTK5MVrPEn87-M4ouAh8F2NqsU2hDyRJWmSB07Yg7HtRY0ZYZpZHsT7UHmSIstX_03H3Dm1gkRiLwiKi8RDE4I53EF-SgO_QkcPXGEvTEHO-K3c2efI_I3RHWBHY7zVYmJYE"/>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Admin</p>
                    <p className="text-xs text-slate-500">Engineering Department</p>
                  </div>
                  <button className="ml-auto p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-sm">mail</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-12 py-8 bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="material-symbols-outlined">domain</span>
            <p className="text-sm">© 2026 UniBooking. All rights reserved.</p>
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <a className="hover:text-primary" href="#">Terms</a>
            <a className="hover:text-primary" href="#">Privacy</a>
            <a className="hover:text-primary" href="#">Help Center</a>
            <a className="hover:text-primary" href="#">Contact Admin</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClassroomDetails;
