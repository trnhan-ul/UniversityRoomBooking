import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { getRooms } from "../services/roomService";
import { formatTime12Hour } from "../utils/timeFormat";
import Header from "../components/layout/Header";

const SearchClassrooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Get current time in HH:mm format
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const [filters, setFilters] = useState({
    date: new Date().toISOString().split("T")[0],
    time: getCurrentTime(),
    minCapacity: 0,
    maxCapacity: 250,
    equipment: {
      projector: false,
      ac: false,
      whiteboard: false,
    },
  });
  const [activeTab, setActiveTab] = useState("all");
  const [favorites, setFavorites] = useState(() => {
    // Load favorites from localStorage on initial render
    const savedFavorites = localStorage.getItem("roomFavorites");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("roomFavorites", JSON.stringify(favorites));
  }, [favorites]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await getRooms(""); // Get all rooms regardless of status
      if (response.success) {
        console.log("Rooms data:", response.data); // Debug: Check if images are included
        setRooms(response.data);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (roomId) => {
    setFavorites((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId],
    );
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEquipmentChange = (equipment) => {
    setFilters((prev) => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        [equipment]: !prev.equipment[equipment],
      },
    }));
  };

  // Equipment icon mapping
  const equipmentIcons = {
    projector: { icon: "videocam", title: "Projector" },
    ac: { icon: "ac_unit", title: "Air Conditioning" },
    whiteboard: { icon: "draw", title: "Whiteboard" },
    computer: { icon: "desktop_windows", title: "Workstations" },
    natural_light: { icon: "wb_sunny", title: "Natural Light" },
  };

  const filteredRooms = rooms
    .filter((room) => {
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = room.room_name?.toLowerCase().includes(query);
        const matchesCode = room.room_code?.toLowerCase().includes(query);
        const matchesLocation = room.location?.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesLocation) {
          return false;
        }
      }

      // Filter by capacity range
      if (
        room.capacity < filters.minCapacity ||
        room.capacity > filters.maxCapacity
      ) {
        return false;
      }

      // Filter by equipment
      const selectedEquipment = Object.keys(filters.equipment).filter(
        (key) => filters.equipment[key],
      );
      if (selectedEquipment.length > 0) {
        const roomEquipment = room.equipment || [];
        const hasAllEquipment = selectedEquipment.every((eq) =>
          roomEquipment.includes(eq),
        );
        if (!hasAllEquipment) {
          return false;
        }
      }

      // Filter by active tab
      if (activeTab === "available") {
        return room.status === "AVAILABLE";
      }
      return true;
    })
    .sort((a, b) => {
      // Sort: favorites first
      const aIsFavorite = favorites.includes(a._id);
      const bIsFavorite = favorites.includes(b._id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return 0;
    });

  // Sample images for rooms
  const roomImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCWUiFU9aGgWn1znPY54fZ3mjgp2AaExSkppmVrNbrogN2J4zxrsjnRhm7Qf2PoQstCULNDh0fz2FroFWPiexZ5jDCU3voZvJg1xa3gKxD7BialuAowcYefNVDAgWSSNMp8sgqfb_BsELGv2kutm0Lsr98-UOWi68srT2QBVI8vv9ZqkZz3V0Wuy1uqIDg5-mgqZkrGajjYcjJ6z3JtdOovk65NjqH6UlbPb4yRaGzOCcba46HFAzHlO0KM8Y57s67-I-VWuQcnNHs",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBU8WjM-_Myu7YJELwBj3JI9VnbUsPCJ8qF6YY_l8oqho-uFYg6eXOpGQctnbCSbGOF1wLEnjyBAGrkXFIrX_53wxJbUilG1zW2Dhg9MGvMBZyxIuhyew53ceXy9tIynf6jUXSYvqFM1InSvFvtam111tjsxmU9zyT1xn2CBmRsJb3MrQ2BbB0LkMet6ONHPlTdYZKu-G9-TntrNLcc1tQVve8aE6zQNF1qciLhubWFbCLZQ_NQZE3ZJTRURQ3oyP-mBjO9L7EdF-0",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBlwTjokCuO7115DTwtDwywW61aJ82qyedWC8quDals7xYGsvLSNRmdHuid3UmXK0Z4yM5lpclT34300Vti1WyM8Qji0bDJFn4hVmk-hyaehrZhx1_MzhdL_PJTl6XQp5OEScj_qhFaoOpY3lGCQSM0PUxJyUcv-xMCMGizy8uLK8oKUwSAXsNfeqBj3DPd7-faEizr6230Lw5rWf2KU1-4d-U9M7qIkFIRr7GzElf_-RR66ZoqJ8yph0KJOVufErVKKRqtQcd73sI",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAX3Vs09lG6OYrQPDVXWSftUNI2rNBn_0E2kL_WdRZYqmZLjTem2SqACWzVUXD--oFklHQWMoswitWSeY7onNiyyYc4DF6Br7ChBxdF_cE02FyTRryHdEVWin6u7dHOK7MncJHVxAyh5SaD24AqImEbdLgcpRo6Bt-QTPdjLV-tzwD4JErdyDwqc_7su3K_kCwA24jzKbyu0MHGZ9wpvWEIiaZFLivolCulDbbhMf-wGXRMRFtGwGBYj8Spz_z1iFPM7pXCVxOhA20",
  ];

  // Export for use in ClassroomDetails
  window.roomImages = roomImages;

  return (
    <div className="min-h-screen bg-slate-50 text-black">
      <div className="layout-container flex h-full grow flex-col">
        <Header />

        {/* Main Content */}
        <main className="px-10 py-8 max-w-[1440px] mx-auto w-full">
          {/* Headline Section */}
          <div className="mb-8">
            <h1 className="text-black tracking-tight text-4xl font-bold leading-tight pb-2">
              Classrooms
            </h1>
            <p className="text-slate-500">
              Discover and book rooms across campus in real-time.
            </p>
            <div className="mt-4 max-w-lg">
              <div className="flex w-full items-stretch rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-center pl-4 text-slate-500">
                  <span className="material-symbols-outlined text-xl">
                    search
                  </span>
                </div>
                <input
                  className="form-input flex w-full min-w-0 flex-1 border-none bg-transparent px-4 py-3 pl-2 text-sm font-normal placeholder:text-slate-500 focus:outline-0 focus:ring-0"
                  placeholder="Quick find room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Date & Time */}
              <div className="space-y-4">
                <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Availability
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="material-symbols-outlined text-primary mr-2">
                      calendar_today
                    </span>
                    <input
                      className="bg-transparent border-none focus:ring-0 text-sm w-full"
                      type="date"
                      value={filters.date}
                      onChange={(e) =>
                        handleFilterChange("date", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-1 flex items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="material-symbols-outlined text-primary mr-2">
                      schedule
                    </span>
                    <span className="text-sm text-slate-700">
                      {formatTime12Hour(filters.time)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Capacity Slider */}
              <div className="space-y-4">
                <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Capacity Range
                </p>
                <div className="pt-4 px-2">
                  <div className="relative w-full h-1 bg-slate-200 rounded-full">
                    <div
                      className="absolute h-full bg-primary"
                      style={{
                        left: `${(filters.minCapacity / 250) * 100}%`,
                        right: `${100 - (filters.maxCapacity / 250) * 100}%`,
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
                          handleFilterChange("minCapacity", newMin);
                        }
                      }}
                      className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                      style={{ top: "-6px" }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="250"
                      value={filters.maxCapacity}
                      onChange={(e) => {
                        const newMax = parseInt(e.target.value);
                        if (newMax > filters.minCapacity + 10) {
                          handleFilterChange("maxCapacity", newMax);
                        }
                      }}
                      className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                      style={{ top: "-6px" }}
                    />
                    <div
                      className="absolute -top-1.5 w-4 h-4 rounded-full bg-primary shadow-md border-2 border-white pointer-events-none z-20"
                      style={{
                        left: `calc(${(filters.minCapacity / 250) * 100}% - 8px)`,
                      }}
                    ></div>
                    <div
                      className="absolute -top-1.5 w-4 h-4 rounded-full bg-primary shadow-md border-2 border-white pointer-events-none z-20"
                      style={{
                        left: `calc(${(filters.maxCapacity / 250) * 100}% - 8px)`,
                      }}
                    ></div>
                    <div
                      className="absolute -bottom-6 text-xs font-medium"
                      style={{
                        left: `calc(${(filters.minCapacity / 250) * 100}% - 12px)`,
                      }}
                    >
                      {filters.minCapacity}
                    </div>
                    <div
                      className="absolute -bottom-6 text-xs font-medium"
                      style={{
                        left: `calc(${(filters.maxCapacity / 250) * 100}% - 12px)`,
                      }}
                    >
                      {filters.maxCapacity}
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment Checkboxes */}
              <div className="space-y-4">
                <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Equipment
                </p>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      checked={filters.equipment.projector}
                      onChange={() => handleEquipmentChange("projector")}
                      className="rounded text-primary focus:ring-primary/50"
                      type="checkbox"
                    />
                    <span className="text-sm group-hover:text-primary transition-colors">
                      Projector
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      checked={filters.equipment.ac}
                      onChange={() => handleEquipmentChange("ac")}
                      className="rounded text-primary focus:ring-primary/50"
                      type="checkbox"
                    />
                    <span className="text-sm group-hover:text-primary transition-colors">
                      AC
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      checked={filters.equipment.whiteboard}
                      onChange={() => handleEquipmentChange("whiteboard")}
                      className="rounded text-primary focus:ring-primary/50"
                      type="checkbox"
                    />
                    <span className="text-sm group-hover:text-primary transition-colors">
                      Whiteboard
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mb-6">
            <div className="flex border-b border-slate-200 gap-8 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-2 border-b-[3px] pb-3 pt-2 whitespace-nowrap ${
                  activeTab === "all"
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-primary"
                } transition-colors`}
              >
                <span className="text-sm font-bold tracking-[0.015em]">
                  All Classrooms
                </span>
                <span
                  className={`${
                    activeTab === "all"
                      ? "bg-primary/10 text-primary"
                      : "bg-slate-100 text-slate-500"
                  } text-[10px] px-2 py-0.5 rounded-full`}
                >
                  {rooms.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("available")}
                className={`flex items-center gap-2 border-b-[3px] pb-3 pt-2 whitespace-nowrap ${
                  activeTab === "available"
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-primary"
                } transition-colors`}
              >
                <span className="text-sm font-bold tracking-[0.015em]">
                  Available Now
                </span>
                <span
                  className={`${
                    activeTab === "available"
                      ? "bg-primary/10 text-primary"
                      : "bg-slate-100 text-slate-500"
                  } text-[10px] px-2 py-0.5 rounded-full`}
                >
                  {rooms.filter((r) => r.status === "AVAILABLE").length}
                </span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading classrooms...</p>
            </div>
          )}

          {/* Classroom Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRooms.map((room, index) => (
                <div
                  key={room._id}
                  className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div
                    className={`relative h-48 w-full overflow-hidden ${
                      room.status === "AVAILABLE"
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-60"
                    }`}
                    onClick={() =>
                      room.status === "AVAILABLE" &&
                      navigate(`/classroom-details?roomId=${room._id}`)
                    }
                    onMouseEnter={() => {
                      if (room.images && room.images.length > 1) {
                        const interval = setInterval(() => {
                          setCurrentImageIndexes((prev) => ({
                            ...prev,
                            [room._id]:
                              ((prev[room._id] || 0) + 1) % room.images.length,
                          }));
                        }, 2000);
                        setCurrentImageIndexes((prev) => ({
                          ...prev,
                          [`${room._id}_interval`]: interval,
                        }));
                      }
                    }}
                    onMouseLeave={() => {
                      const interval =
                        currentImageIndexes[`${room._id}_interval`];
                      if (interval) {
                        clearInterval(interval);
                        setCurrentImageIndexes((prev) => {
                          const newIndexes = { ...prev };
                          delete newIndexes[`${room._id}_interval`];
                          newIndexes[room._id] = 0;
                          return newIndexes;
                        });
                      }
                    }}
                  >
                    <div
                      className={`absolute top-4 left-4 z-10 ${
                        room.status === "AVAILABLE"
                          ? "bg-emerald-500"
                          : "bg-slate-500"
                      } text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded`}
                    >
                      {room.status === "AVAILABLE" ? "Available" : "Occupied"}
                    </div>
                    <img
                      alt={room.room_name}
                      className={`w-full h-full object-cover transition-all duration-700 ${
                        room.status === "AVAILABLE"
                          ? "group-hover:scale-105"
                          : ""
                      }`}
                      src={
                        room.images && room.images.length > 0
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
                                ? "w-6 bg-white"
                                : "w-1.5 bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold shadow-sm">
                      {room.location}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold">{room.room_name}</h3>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          {room.room_code}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleFavorite(room._id)}
                        className={`transition-colors ${
                          favorites.includes(room._id)
                            ? "text-red-500"
                            : "text-slate-300 hover:text-red-500"
                        }`}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontVariationSettings: favorites.includes(room._id)
                              ? "'FILL' 1"
                              : "'FILL' 0",
                          }}
                        >
                          favorite
                        </span>
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 mb-4">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          groups
                        </span>
                        <span className="text-xs">{room.capacity} Cap.</span>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        {(room.equipment || []).map((eq, idx) => {
                          const equipIcon = equipmentIcons[eq];
                          if (!equipIcon) return null;
                          return (
                            <span
                              key={idx}
                              className="material-symbols-outlined text-sm"
                              title={equipIcon.title}
                            >
                              {equipIcon.icon}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    {room.status === "AVAILABLE" ? (
                      <button
                        onClick={() =>
                          navigate(`/classroom-details?roomId=${room._id}`)
                        }
                        className="mt-auto w-full bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <span>Book Room</span>
                        <span className="material-symbols-outlined text-lg">
                          arrow_forward
                        </span>
                      </button>
                    ) : (
                      <div className="flex gap-2 mt-auto">
                        <button className="flex-1 bg-slate-100 text-slate-500 font-bold py-2.5 rounded-lg cursor-not-allowed">
                          Full until 2PM
                        </button>
                        <button className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors">
                          <span className="material-symbols-outlined">
                            more_horiz
                          </span>
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
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">
                search_off
              </span>
              <p className="text-slate-600">No classrooms found</p>
            </div>
          )}

          {/* Footer Pagination */}
          {!loading && filteredRooms.length > 0 && (
            <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6">
              <p className="text-sm text-slate-500">
                Showing {filteredRooms.length} of {rooms.length} classrooms
              </p>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors disabled:opacity-50"
                  disabled
                >
                  Previous
                </button>
                <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors">
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
