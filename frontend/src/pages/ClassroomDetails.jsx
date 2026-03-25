import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { getRoomById } from "../services/roomService";
import { getEquipmentByRoom } from "../services/equipmentService";
import Header from "../components/layout/Header";
import { useAuthContext } from "../context/AuthContext";

const ClassroomDetails = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const [room, setRoom] = useState({});
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEquipment, setLoadingEquipment] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingData, setBookingData] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "11:00",
    purpose: "Academic Lecture",
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
          const mockRoom =
            mockRooms.find((r) => r._id === roomId) || mockRooms[0] || {};
          setRoom(mockRoom);
        }
      } catch (error) {
        console.error("Error fetching room:", error);
        // Fallback to mock data
        const mockRooms = window.mockRooms || [];
        const mockRoom =
          mockRooms.find((r) => r._id === roomId) || mockRooms[0] || {};
        setRoom(mockRoom);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId]);

  // Fetch equipment for the room
  useEffect(() => {
    const fetchEquipment = async () => {
      if (!roomId) return;

      try {
        setLoadingEquipment(true);
        console.log("Fetching equipment for room:", roomId);
        const response = await getEquipmentByRoom(roomId);
        console.log("Equipment response:", response);
        if (response.success) {
          console.log("Equipment data:", response.data);
          setEquipment(response.data);
        }
      } catch (error) {
        console.error("Error fetching equipment:", error);
        setEquipment([]);
      } finally {
        setLoadingEquipment(false);
      }
    };

    fetchEquipment();
  }, [roomId]);

  // Equipment icon mapping for fallback
  const getEquipmentIcon = (equipmentName) => {
    const name = equipmentName.toLowerCase();
    if (name.includes("máy chiếu") || name.includes("projector"))
      return "videocam";
    if (name.includes("wi-fi") || name.includes("wifi")) return "wifi";
    if (
      name.includes("air") ||
      name.includes("điều hòa") ||
      name.includes("ac")
    )
      return "ac_unit";
    if (name.includes("whiteboard") || name.includes("bảng")) return "draw";
    if (name.includes("computer") || name.includes("máy tính"))
      return "computer";
    if (name.includes("speaker") || name.includes("loa")) return "volume_up";
    if (name.includes("microphone") || name.includes("mic")) return "mic";
    if (name.includes("screen") || name.includes("màn hình")) return "tv";
    return "devices"; // default icon
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      WORKING: "text-green-600",
      BROKEN: "text-red-600",
      MAINTENANCE: "text-yellow-600",
    };
    return colors[status] || "text-gray-600";
  };

  const getStatusText = (status) => {
    const texts = {
      WORKING: "Available",
      BROKEN: "Broken",
      MAINTENANCE: "Maintenance",
    };
    return texts[status] || status;
  };

  // Get room images - use images from room data if available
  const roomImages =
    room.images && room.images.length > 0
      ? room.images
      : [
          (window.roomImages && window.roomImages[0]) ||
            "https://via.placeholder.com/800x400?text=Classroom",
        ];

  const roomImage = roomImages[currentImageIndex] || roomImages[0];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % roomImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + roomImages.length) % roomImages.length,
    );
  };

  if (loading) {
    return (
      <div className="bg-background-light text-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light text-slate-900 min-h-screen">
      <Header />

      <main className="max-w-[1280px] mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Main Content */}
          <div className="flex-1 space-y-8">
            {/* Hero Section & Gallery */}
            <section className="space-y-4">
              <div className="relative group h-[400px] w-full rounded-xl overflow-hidden bg-slate-200">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  data-alt={`Wide shot of ${room.room_name}`}
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%), url('${roomImage}')`,
                  }}
                ></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h2 className="text-3xl font-bold">{room.room_name}</h2>
                  <p className="text-slate-300 text-sm font-semibold mb-1">
                    {room.room_code}
                  </p>
                  <p className="text-slate-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      location_on
                    </span>
                    {room.location}
                  </p>
                </div>
                {roomImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined">
                        chevron_left
                      </span>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined">
                        chevron_right
                      </span>
                    </button>
                    <div className="absolute bottom-6 right-6 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        photo_library
                      </span>
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
                          ? "border-primary scale-105"
                          : "border-slate-300 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${room.room_name} view ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Room Specifications Grid */}
            <section>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  info
                </span>
                Room Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-2">
                  <span className="material-symbols-outlined text-primary">
                    groups
                  </span>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                      Capacity
                    </p>
                    <p className="font-semibold">{room.capacity} Persons</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-2">
                  <span className="material-symbols-outlined text-primary">
                    wifi
                  </span>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                      Connectivity
                    </p>
                    <p className="font-semibold">Wi-Fi 6 Ready</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-2">
                  <span className="material-symbols-outlined text-primary">
                    ac_unit
                  </span>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                      Climate
                    </p>
                    <p className="font-semibold">A/C Controlled</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-2">
                  <span className="material-symbols-outlined text-primary">
                    accessible
                  </span>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                      Access
                    </p>
                    <p className="font-semibold">Full Access</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Equipment Section */}
            <section>
              <h3 className="text-xl font-bold mb-4">
                Technical Equipment
                {!loadingEquipment && equipment.length > 0 && (
                  <span className="ml-2 text-sm text-slate-500 font-normal">
                    ({equipment.length} items)
                  </span>
                )}
              </h3>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loadingEquipment ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-slate-500">
                      Loading equipment...
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {equipment.length > 0 ? (
                      equipment.map((eq, index) => (
                        <li
                          key={eq._id || index}
                          className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-slate-100 rounded-lg">
                              <span className="material-symbols-outlined">
                                {getEquipmentIcon(eq.name)}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">{eq.name}</span>
                              {eq.quantity > 1 && (
                                <span className="ml-2 text-xs text-slate-500">
                                  x{eq.quantity}
                                </span>
                              )}
                              {eq.description && (
                                <p className="text-xs text-slate-500 mt-1">
                                  {eq.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-sm font-medium ${getStatusColor(eq.status)}`}
                          >
                            {getStatusText(eq.status)}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="p-8 text-center">
                        <div className="flex flex-col items-center text-slate-500">
                          <span className="material-symbols-outlined text-5xl mb-3 opacity-50">
                            devices_other
                          </span>
                          <p className="font-medium mb-1">
                            No equipment available for this room
                          </p>
                          <div className="text-xs mt-2 bg-slate-100 rounded-lg p-3">
                            <p className="font-mono">
                              {room.room_code} - {room.room_name}
                            </p>
                          </div>
                          {(user?.role === "ADMINISTRATOR" ||
                            user?.role === "FACILITY_MANAGER") && (
                            <button
                              onClick={() => navigate("/equipment-management")}
                              className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-base">
                                add
                              </span>
                              Add Equipment to This Room
                            </button>
                          )}
                        </div>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Booking Sidebar */}
          <aside className="w-full lg:w-96">
            <div className="sticky top-24 space-y-6">
              {/* Booking Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-2xl font-bold">{room.room_name}</h4>
                      <p className="text-slate-500 text-sm">{room.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase font-bold">
                        Status
                      </p>
                      <p
                        className={`font-semibold ${room.status === "AVAILABLE" ? "text-green-500" : "text-slate-500"}`}
                      >
                        {room.status}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-sm font-bold text-slate-700">
                        Select Date
                      </span>
                      <div className="mt-1 relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          calendar_today
                        </span>
                        <input
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                          type="date"
                          value={bookingData.date}
                          onChange={(e) =>
                            setBookingData((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-sm font-bold text-slate-700">
                          Start Time
                        </span>
                        <div className="mt-1 relative">
                          <input
                            type="time"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            value={bookingData.startTime}
                            onChange={(e) =>
                              setBookingData((prev) => ({
                                ...prev,
                                startTime: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </label>
                      <label className="block">
                        <span className="text-sm font-bold text-slate-700">
                          End Time
                        </span>
                        <div className="mt-1 relative">
                          <input
                            type="time"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            value={bookingData.endTime}
                            onChange={(e) =>
                              setBookingData((prev) => ({
                                ...prev,
                                endTime: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </label>
                    </div>
                    <label className="block">
                      <span className="text-sm font-bold text-slate-700">
                        Booking Purpose
                      </span>
                      <select
                        className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        value={bookingData.purpose}
                        onChange={(e) =>
                          setBookingData((prev) => ({
                            ...prev,
                            purpose: e.target.value,
                          }))
                        }
                      >
                        <option>Academic Lecture</option>
                        <option>Student Society Meeting</option>
                        <option>Exam / Assessment</option>
                        <option>Guest Speaker</option>
                      </select>
                    </label>
                  </div>
                  <button
                    onClick={() =>
                      navigate(
                        `/create-booking?roomId=${roomId}&date=${bookingData.date}&startTime=${bookingData.startTime}&endTime=${bookingData.endTime}&purpose=${bookingData.purpose}`,
                      )
                    }
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    disabled={room.status !== "AVAILABLE"}
                  >
                    <span className="material-symbols-outlined">bolt</span>
                    {room.status === "AVAILABLE" ? "Book Now" : "Not Available"}
                  </button>
                  <p className="text-center text-xs text-slate-400">
                    This room requires faculty approval for bookings longer than
                    3 hours.
                  </p>
                </div>
              </div>

              {/* Room Manager Card */}
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
                <h5 className="text-sm font-bold mb-3">Room Supervisor</h5>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full overflow-hidden bg-slate-300">
                    <img
                      className="w-full h-full object-cover"
                      alt="Portrait of the classroom manager"
                      data-alt="Portrait of the classroom manager"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBB-i8KbW-0ovoWKXcQTkzMb0vXCEcN_fPN3bR_fKGyf7ct6F-VALSrWpTcQlQCE1r0Eg-XIVkCYy-LbQgCxOO9KBQV9I9UPaJtL5UMjXkr--I-3OQJcW5R1nBRjDu7rFfMuiO98CYCTK5MVrPEn87-M4ouAh8F2NqsU2hDyRJWmSB07Yg7HtRY0ZYZpZHsT7UHmSIstX_03H3Dm1gkRiLwiKi8RDE4I53EF-SgO_QkcPXGEvTEHO-K3c2efI_I3RHWBHY7zVYmJYE"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Admin</p>
                    <p className="text-xs text-slate-500">
                      Engineering Department
                    </p>
                  </div>
                  <button className="ml-auto p-2 bg-white rounded-lg border border-slate-200">
                    <span className="material-symbols-outlined text-sm">
                      mail
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-12 py-8 bg-white border-t border-slate-200">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="material-symbols-outlined">domain</span>
            <p className="text-sm">© 2026 UniBooking. All rights reserved.</p>
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <button type="button" className="hover:text-primary">
              Terms
            </button>
            <button type="button" className="hover:text-primary">
              Privacy
            </button>
            <button type="button" className="hover:text-primary">
              Help Center
            </button>
            <button type="button" className="hover:text-primary">
              Contact Admin
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClassroomDetails;
