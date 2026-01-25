import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { getRooms } from '../services/roomService';

const SearchClassrooms = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  
  // Get current time in HH:mm format
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    time: getCurrentTime(),
    minCapacity: 0,
    maxCapacity: 250,
    equipment: {
      projector: false,
      ac: false,
      whiteboard: false
    }
  });
  const [activeTab, setActiveTab] = useState('all');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await getRooms(''); // Get all rooms regardless of status
      if (response.success) {
        console.log('Rooms data:', response.data); // Debug: Check if images are included
        setRooms(response.data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (roomId) => {
    setFavorites(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEquipmentChange = (equipment) => {
    setFilters(prev => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        [equipment]: !prev.equipment[equipment]
      }
    }));
  };

  // Equipment icon mapping
  const equipmentIcons = {
    projector: { icon: 'videocam', title: 'Projector' },
    ac: { icon: 'ac_unit', title: 'Air Conditioning' },
    whiteboard: { icon: 'draw', title: 'Whiteboard' },
    computer: { icon: 'desktop_windows', title: 'Workstations' },
    natural_light: { icon: 'wb_sunny', title: 'Natural Light' }
  };

  const filteredRooms = rooms.filter(room => {
    // Filter by capacity range
    if (room.capacity < filters.minCapacity || room.capacity > filters.maxCapacity) {
      return false;
    }
    
    // Filter by equipment
    const selectedEquipment = Object.keys(filters.equipment).filter(key => filters.equipment[key]);
    if (selectedEquipment.length > 0) {
      const roomEquipment = room.equipment || [];
      const hasAllEquipment = selectedEquipment.every(eq => roomEquipment.includes(eq));
      if (!hasAllEquipment) {
        return false;
      }
    }
    
    // Filter by active tab
    if (activeTab === 'available') {
      return room.status === 'AVAILABLE';
    }
    return true;
  });

  // Sample images for rooms
  const roomImages = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCWUiFU9aGgWn1znPY54fZ3mjgp2AaExSkppmVrNbrogN2J4zxrsjnRhm7Qf2PoQstCULNDh0fz2FroFWPiexZ5jDCU3voZvJg1xa3gKxD7BialuAowcYefNVDAgWSSNMp8sgqfb_BsELGv2kutm0Lsr98-UOWi68srT2QBVI8vv9ZqkZz3V0Wuy1uqIDg5-mgqZkrGajjYcjJ6z3JtdOovk65NjqH6UlbPb4yRaGzOCcba46HFAzHlO0KM8Y57s67-I-VWuQcnNHs',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBU8WjM-_Myu7YJELwBj3JI9VnbUsPCJ8qF6YY_l8oqho-uFYg6eXOpGQctnbCSbGOF1wLEnjyBAGrkXFIrX_53wxJbUilG1zW2Dhg9MGvMBZyxIuhyew53ceXy9tIynf6jUXSYvqFM1InSvFvtam111tjsxmU9zyT1xn2CBmRsJb3MrQ2BbB0LkMet6ONHPlTdYZKu-G9-TntrNLcc1tQVve8aE6zQNF1qciLhubWFbCLZQ_NQZE3ZJTRURQ3oyP-mBjO9L7EdF-0',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBlwTjokCuO7115DTwtDwywW61aJ82qyedWC8quDals7xYGsvLSNRmdHuid3UmXK0Z4yM5lpclT34300Vti1WyM8Qji0bDJFn4hVmk-hyaehrZhx1_MzhdL_PJTl6XQp5OEScj_qhFaoOpY3lGCQSM0PUxJyUcv-xMCMGizy8uLK8oKUwSAXsNfeqBj3DPd7-faEizr6230Lw5rWf2KU1-4d-U9M7qIkFIRr7GzElf_-RR66ZoqJ8yph0KJOVufErVKKRqtQcd73sI',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAX3Vs09lG6OYrQPDVXWSftUNI2rNBn_0E2kL_WdRZYqmZLjTem2SqACWzVUXD--oFklHQWMoswitWSeY7onNiyyYc4DF6Br7ChBxdF_cE02FyTRryHdEVWin6u7dHOK7MncJHVxAyh5SaD24AqImEbdLgcpRo6Bt-QTPdjLV-tzwD4JErdyDwqc_7su3K_kCwA24jzKbyu0MHGZ9wpvWEIiaZFLivolCulDbbhMf-wGXRMRFtGwGBYj8Spz_z1iFPM7pXCVxOhA20'
  ];

  // Export for use in ClassroomDetails
  window.roomImages = roomImages;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark text-black dark:text-slate-50">
      <div className="layout-container flex h-full grow flex-col">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-10 py-3 sticky top-0 z-50">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-primary">
              <div className="w-8 h-8">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" fill="currentColor"></path>
                  <path clipRule="evenodd" d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] text-[#000000] dark:text-slate-50">UniBooking SaaS</h2>
            </div>
            <nav className="flex items-center gap-9">
              <button onClick={() => navigate('/search-classrooms')} className="text-sm font-medium leading-normal hover:text-primary transition-colors">Classrooms</button>
              <button onClick={() => navigate('/my-bookings')} className="text-sm font-medium leading-normal hover:text-primary transition-colors">My Bookings</button>
              <button onClick={() => navigate('/schedule-grid')} className="text-sm font-medium leading-normal hover:text-primary transition-colors">Schedule Grid</button>
            </nav>
          </div>
          <div className="flex flex-1 justify-end gap-6 items-center">
            <label className="flex flex-col min-w-40 h-10 max-w-64">
              <div className="flex w-full flex-1 items-stretch rounded-lg bg-slate-100 dark:bg-slate-800 border-none">
                <div className="text-slate-500 dark:text-slate-400 flex items-center justify-center pl-4">
                  <span className="material-symbols-outlined text-xl">search</span>
                </div>
                <input 
                  className="form-input flex w-full min-w-0 flex-1 border-none bg-transparent focus:outline-0 focus:ring-0 text-sm font-normal placeholder:text-slate-500 dark:placeholder:text-slate-400 px-4 pl-2" 
                  placeholder="Quick find room..."
                />
              </div>
            </label>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button 
                onClick={() => navigate('/my-profile')}
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 border-2 border-primary cursor-pointer" 
                style={{ backgroundImage: `url("https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=136dec&color=fff")` }}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-10 py-8 max-w-[1440px] mx-auto w-full">
          {/* Headline Section */}
          <div className="mb-8">
            <h1 className="text-black dark:text-slate-50 tracking-tight text-4xl font-bold leading-tight pb-2">Classrooms</h1>
            <p className="text-slate-500 dark:text-slate-400">Discover and book rooms across campus in real-time.</p>
          </div>

          {/* Filter Controls */}
          <div className="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Date & Time */}
              <div className="space-y-4">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Availability</p>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-primary mr-2">calendar_today</span>
                    <input 
                      className="bg-transparent border-none focus:ring-0 text-sm w-full" 
                      type="date" 
                      value={filters.date}
                      onChange={(e) => handleFilterChange('date', e.target.value)}
                    />
                  </div>
                  <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200 dark:border-slate-700 pointer-events-none">
                    <span className="material-symbols-outlined text-primary mr-2">schedule</span>
                    <input 
                      className="bg-transparent border-none focus:ring-0 text-sm w-full pointer-events-none"
                      type="time"
                      value={filters.time}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Capacity Slider */}
              <div className="space-y-4">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Capacity Range</p>
                <div className="pt-4 px-2">
                  <div className="relative w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                    <div 
                      className="absolute h-full bg-primary"
                      style={{
                        left: `${(filters.minCapacity / 250) * 100}%`,
                        right: `${100 - (filters.maxCapacity / 250) * 100}%`
                      }}
                    ></div>
                    <input
                      type="range"
                      min="0"
                      max="250"
                      value={filters.minCapacity}
                      onChange={(e) => {
                        const newMin = parseInt(e.target.value);
                        if (newMin < filters.maxCapacity - 10) {
                          handleFilterChange('minCapacity', newMin);
                        }
                      }}
                      className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                      style={{ top: '-6px' }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="250"
                      value={filters.maxCapacity}
                      onChange={(e) => {
                        const newMax = parseInt(e.target.value);
                        if (newMax > filters.minCapacity + 10) {
                          handleFilterChange('maxCapacity', newMax);
                        }
                      }}
                      className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                      style={{ top: '-6px' }}
                    />
                    <div 
                      className="absolute -top-1.5 w-4 h-4 rounded-full bg-primary shadow-md border-2 border-white dark:border-slate-900 pointer-events-none z-20"
                      style={{ left: `calc(${(filters.minCapacity / 250) * 100}% - 8px)` }}
                    ></div>
                    <div 
                      className="absolute -top-1.5 w-4 h-4 rounded-full bg-primary shadow-md border-2 border-white dark:border-slate-900 pointer-events-none z-20"
                      style={{ left: `calc(${(filters.maxCapacity / 250) * 100}% - 8px)` }}
                    ></div>
                    <div 
                      className="absolute -bottom-6 text-xs font-medium"
                      style={{ left: `calc(${(filters.minCapacity / 250) * 100}% - 12px)` }}
                    >{filters.minCapacity}</div>
                    <div 
                      className="absolute -bottom-6 text-xs font-medium"
                      style={{ left: `calc(${(filters.maxCapacity / 250) * 100}% - 12px)` }}
                    >{filters.maxCapacity}</div>
                  </div>
                </div>
              </div>

              {/* Equipment Checkboxes */}
              <div className="space-y-4">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Equipment</p>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      checked={filters.equipment.projector}
                      onChange={() => handleEquipmentChange('projector')}
                      className="rounded text-primary focus:ring-primary/50" 
                      type="checkbox"
                    />
                    <span className="text-sm group-hover:text-primary transition-colors">Projector</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      checked={filters.equipment.ac}
                      onChange={() => handleEquipmentChange('ac')}
                      className="rounded text-primary focus:ring-primary/50" 
                      type="checkbox"
                    />
                    <span className="text-sm group-hover:text-primary transition-colors">AC</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      checked={filters.equipment.whiteboard}
                      onChange={() => handleEquipmentChange('whiteboard')}
                      className="rounded text-primary focus:ring-primary/50" 
                      type="checkbox"
                    />
                    <span className="text-sm group-hover:text-primary transition-colors">Whiteboard</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mb-6">
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-8 overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-2 border-b-[3px] pb-3 pt-2 whitespace-nowrap ${
                  activeTab === 'all' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-500 hover:text-primary'
                } transition-colors`}
              >
                <span className="text-sm font-bold tracking-[0.015em]">All Classrooms</span>
                <span className={`${
                  activeTab === 'all'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                } text-[10px] px-2 py-0.5 rounded-full`}>{rooms.length}</span>
              </button>
              <button 
                onClick={() => setActiveTab('available')}
                className={`flex items-center gap-2 border-b-[3px] pb-3 pt-2 whitespace-nowrap ${
                  activeTab === 'available' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-500 hover:text-primary'
                } transition-colors`}
              >
                <span className="text-sm font-bold tracking-[0.015em]">Available Now</span>
                <span className={`${
                  activeTab === 'available'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                } text-[10px] px-2 py-0.5 rounded-full`}>{rooms.filter(r => r.status === 'AVAILABLE').length}</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading classrooms...</p>
            </div>
          )}

          {/* Classroom Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRooms.map((room, index) => (
                <div key={room._id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div 
                    className={`relative h-48 w-full overflow-hidden ${
                      room.status === 'AVAILABLE' ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                    }`}
                    onClick={() => room.status === 'AVAILABLE' && navigate(`/classroom-details?roomId=${room._id}`)}
                    onMouseEnter={() => {
                      if (room.images && room.images.length > 1) {
                        const interval = setInterval(() => {
                          setCurrentImageIndexes(prev => ({
                            ...prev,
                            [room._id]: ((prev[room._id] || 0) + 1) % room.images.length
                          }));
                        }, 2000);
                        setCurrentImageIndexes(prev => ({ ...prev, [`${room._id}_interval`]: interval }));
                      }
                    }}
                    onMouseLeave={() => {
                      const interval = currentImageIndexes[`${room._id}_interval`];
                      if (interval) {
                        clearInterval(interval);
                        setCurrentImageIndexes(prev => {
                          const newIndexes = { ...prev };
                          delete newIndexes[`${room._id}_interval`];
                          newIndexes[room._id] = 0;
                          return newIndexes;
                        });
                      }
                    }}
                  >
                    <div className={`absolute top-4 left-4 z-10 ${
                      room.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-slate-500'
                    } text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded`}>
                      {room.status === 'AVAILABLE' ? 'Available' : 'Occupied'}
                    </div>
                    <img 
                      alt={room.room_name}
                      className={`w-full h-full object-cover transition-all duration-700 ${
                        room.status === 'AVAILABLE' ? 'group-hover:scale-105' : ''
                      }`}
                      src={(room.images && room.images.length > 0) 
                        ? room.images[currentImageIndexes[room._id] || 0] 
                        : roomImages[index % roomImages.length]
                      }
                    />
                    {room.images && room.images.length > 1 && (
                      <div className="absolute bottom-4 left-4 flex gap-1.5">
                        {room.images.map((_, idx) => (
                          <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              idx === (currentImageIndexes[room._id] || 0)
                                ? 'w-6 bg-white'
                                : 'w-1.5 bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold shadow-sm">
                      {room.location}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold">{room.room_name}</h3>
                      <button 
                        onClick={() => toggleFavorite(room._id)}
                        className={`transition-colors ${
                          favorites.includes(room._id) ? 'text-primary' : 'text-slate-300 hover:text-rose-500'
                        }`}
                      >
                        <span 
                          className="material-symbols-outlined"
                          style={{ fontVariationSettings: favorites.includes(room._id) ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          favorite
                        </span>
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 mb-4">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">groups</span>
                        <span className="text-xs">{room.capacity} Cap.</span>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        {(room.equipment || []).map((eq, idx) => {
                          const equipIcon = equipmentIcons[eq];
                          if (!equipIcon) return null;
                          return (
                            <span key={idx} className="material-symbols-outlined text-sm" title={equipIcon.title}>
                              {equipIcon.icon}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    {room.status === 'AVAILABLE' ? (
                      <button 
                        onClick={() => navigate(`/classroom-details?roomId=${room._id}`)}
                        className="mt-auto w-full bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <span>Book Room</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </button>
                    ) : (
                      <div className="flex gap-2 mt-auto">
                        <button className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold py-2.5 rounded-lg cursor-not-allowed">Full until 2PM</button>
                        <button className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                          <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredRooms.length === 0 && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">search_off</span>
              <p className="text-slate-600 dark:text-slate-400">No classrooms found</p>
            </div>
          )}

          {/* Footer Pagination */}
          {!loading && filteredRooms.length > 0 && (
            <div className="mt-12 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
              <p className="text-sm text-slate-500">Showing {filteredRooms.length} of {rooms.length} classrooms</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Next
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchClassrooms;
