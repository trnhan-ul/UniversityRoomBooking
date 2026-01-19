import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { getRoomById } from '../services/roomService';

const ClassroomDetails = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const [room, setRoom] = useState({});
  const [loading, setLoading] = useState(true);

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

  // Get room image
  const roomImages = window.roomImages || [];
  const mockRooms = window.mockRooms || [];
  const roomIndex = mockRooms.findIndex(r => r._id === roomId);
  const roomImage = roomImages[roomIndex >= 0 ? roomIndex : 0] || roomImages[0];

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
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary transition-all" placeholder="Find a room..." type="text"/>
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600">
              <img className="w-full h-full object-cover" data-alt="User profile avatar portrait" src={`https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=136dec&color=fff`}/>
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
                  <p className="text-slate-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {room.location}
                  </p>
                </div>
                <div className="absolute top-6 right-6 flex gap-2">
                  <span className={`px-3 py-1 ${room.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-slate-500'} text-white text-sm font-bold rounded-full shadow-lg`}>{room.status === 'AVAILABLE' ? 'AVAILABLE' : 'OCCUPIED'}</span>
                  <button className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-colors">
                    <span className="material-symbols-outlined">favorite</span>
                  </button>
                </div>
              </div>
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

            {/* Weekly Calendar */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Weekly Availability</h3>
                <div className="flex gap-2">
                  <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><span className="material-symbols-outlined">chevron_left</span></button>
                  <button className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-sm">Oct 23 - Oct 29, 2023</button>
                  <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><span className="material-symbols-outlined">chevron_right</span></button>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-700">
                    <div className="p-4 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"></div>
                    <div className="p-4 text-center border-r border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500">MON</p><p className="font-bold">23</p></div>
                    <div className="p-4 text-center border-r border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500">TUE</p><p className="font-bold">24</p></div>
                    <div className="p-4 text-center border-r border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500">WED</p><p className="font-bold">25</p></div>
                    <div className="p-4 text-center border-r border-slate-200 dark:border-slate-700 bg-primary/5"><p className="text-xs text-primary">THU</p><p className="font-bold text-primary">26</p></div>
                    <div className="p-4 text-center border-r border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500">FRI</p><p className="font-bold">27</p></div>
                    <div className="p-4 text-center border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-400"><p className="text-xs">SAT</p><p className="font-bold">28</p></div>
                    <div className="p-4 text-center bg-slate-50 dark:bg-slate-900/50 text-slate-400"><p className="text-xs">SUN</p><p className="font-bold">29</p></div>
                  </div>
                  <div className="grid grid-cols-8 h-[400px]">
                    <div className="border-r border-slate-200 dark:border-slate-700 flex flex-col">
                      <div className="h-20 p-2 text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">08:00 AM</div>
                      <div className="h-20 p-2 text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">10:00 AM</div>
                      <div className="h-20 p-2 text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">12:00 PM</div>
                      <div className="h-20 p-2 text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">02:00 PM</div>
                      <div className="h-20 p-2 text-xs text-slate-400">04:00 PM</div>
                    </div>
                    {/* Monday */}
                    <div className="border-r border-slate-200 dark:border-slate-700 relative bg-slate-50/30 dark:bg-slate-900/10">
                      <div className="absolute top-0 left-1 right-1 h-32 bg-slate-100 dark:bg-slate-700 border-l-4 border-slate-400 rounded p-2 text-[10px] font-bold">ENG 101 Lecture</div>
                    </div>
                    {/* Tuesday */}
                    <div className="border-r border-slate-200 dark:border-slate-700 relative">
                      <div className="absolute top-20 left-1 right-1 h-20 bg-slate-100 dark:bg-slate-700 border-l-4 border-slate-400 rounded p-2 text-[10px] font-bold">Faculty Meeting</div>
                    </div>
                    {/* Wednesday */}
                    <div className="border-r border-slate-200 dark:border-slate-700 relative">
                      <div className="absolute top-40 left-1 right-1 h-40 bg-slate-100 dark:bg-slate-700 border-l-4 border-slate-400 rounded p-2 text-[10px] font-bold">ENG 204 Workshop</div>
                    </div>
                    {/* Thursday (Current Day) */}
                    <div className="border-r border-slate-200 dark:border-slate-700 relative bg-primary/5">
                      <div className="absolute top-20 left-1 right-1 h-24 bg-primary/10 border-l-4 border-primary rounded p-2 text-[10px] font-bold text-primary">In Use: CS Lab</div>
                      {/* Current Time Line */}
                      <div className="absolute top-64 w-full border-t-2 border-red-500 z-10 flex items-center">
                        <div className="size-2 rounded-full bg-red-500 -ml-1"></div>
                      </div>
                    </div>
                    {/* Friday */}
                    <div className="border-r border-slate-200 dark:border-slate-700 relative"></div>
                    {/* Sat/Sun */}
                    <div className="border-r border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-900/50"></div>
                    <div className="bg-slate-100/50 dark:bg-slate-900/50"></div>
                  </div>
                </div>
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
                        <input className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all" type="text" defaultValue="Thursday, Oct 26"/>
                      </div>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Start Time</span>
                        <div className="mt-1 relative">
                          <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all" type="text" defaultValue="09:00 AM"/>
                        </div>
                      </label>
                      <label className="block">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">End Time</span>
                        <div className="mt-1 relative">
                          <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all" type="text" defaultValue="11:00 AM"/>
                        </div>
                      </label>
                    </div>
                    <label className="block">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Booking Purpose</span>
                      <select className="mt-1 w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all">
                        <option>Academic Lecture</option>
                        <option>Student Society Meeting</option>
                        <option>Exam / Assessment</option>
                        <option>Guest Speaker</option>
                      </select>
                    </label>
                  </div>
                  <button 
                    onClick={() => navigate(`/create-booking?roomId=${roomId}`)}
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">bolt</span>
                    Book Now
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
