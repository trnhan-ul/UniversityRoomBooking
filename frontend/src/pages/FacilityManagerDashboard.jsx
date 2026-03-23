import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getPendingBookings } from "../services/bookingService";
import { getRooms } from "../services/roomService";
import { getAllEquipment } from "../services/equipmentService";
import { getFacilityIssueStats } from "../services/facilityIssueService";

const StatCard = ({ title, value, subText, color = "blue" }) => {
  const colorClass = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    orange: "text-orange-600 bg-orange-50",
    red: "text-red-600 bg-red-50",
    purple: "text-purple-600 bg-purple-50",
  }[color] || "text-blue-600 bg-blue-50";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-slate-500">{title}</p>
      <div className={`mt-2 inline-block rounded-lg p-2 ${colorClass}`}>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <p className="mt-2 text-xs text-slate-600">{subText}</p>
    </div>
  );
};

const FacilityManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    pendingRequests: 0,
    totalRooms: 0,
    availableRooms: 0,
    totalEquipment: 0,
    openIssues: 0,
    criticalIssues: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [pendingRes, roomsRes, equipmentRes, issueStatsRes] = await Promise.all([
          getPendingBookings(1, 1),
          getRooms(),
          getAllEquipment({ page: 1, limit: 1 }),
          getFacilityIssueStats(),
        ]);

        const pendingCount =
          pendingRes?.data?.pagination?.total ||
          pendingRes?.data?.pagination?.totalItems ||
          0;

        const roomList = Array.isArray(roomsRes?.data)
          ? roomsRes.data
          : roomsRes?.data?.rooms || [];

        const availableRooms = roomList.filter((room) => room.status === "AVAILABLE").length;

        const equipmentCount =
          equipmentRes?.pagination?.total ||
          equipmentRes?.pagination?.totalItems ||
          equipmentRes?.data?.length ||
          0;

        const issueStats = issueStatsRes?.data || {};

        setStats({
          pendingRequests: pendingCount,
          totalRooms: roomList.length,
          availableRooms,
          totalEquipment: equipmentCount,
          openIssues: issueStats.open || 0,
          criticalIssues: issueStats.bySeverity?.CRITICAL || 0,
        });
      } catch (loadError) {
        setError(loadError?.message || "Failed to load facility dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light">
        <p className="text-slate-600">Loading manager dashboard...</p>
      </div>
    );
  }

  // Data for charts
  const bookingRequestsData = [
    { name: "Pending", value: stats.pendingRequests, fill: "#fbbf24" },
  ];

  const roomAvailabilityData = [
    { name: "Available", value: stats.availableRooms, fill: "#10b981" },
    { name: "In Use/Blocked", value: stats.totalRooms - stats.availableRooms, fill: "#ef4444" },
  ];

  const issuesSeverityData = [
    { name: "Open Issues", value: stats.openIssues, fill: "#3b82f6" },
    { name: "Critical", value: stats.criticalIssues, fill: "#dc2626" },
  ];

  const summaryData = [
    { category: "Pending Requests", count: stats.pendingRequests, fill: "#fbbf24" },
    { category: "Equipment", count: stats.totalEquipment, fill: "#8b5cf6" },
    { category: "Rooms", count: stats.totalRooms, fill: "#10b981" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Facility Manager Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Operational overview of facility management metrics
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Top Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Pending Requests"
            value={stats.pendingRequests}
            subText="Booking requests awaiting approval"
            color="orange"
          />
          <StatCard
            title="Total Rooms"
            value={stats.totalRooms}
            subText={`${stats.availableRooms} available now`}
            color="green"
          />
          <StatCard
            title="Equipment Items"
            value={stats.totalEquipment}
            subText="All equipment managed"
            color="purple"
          />
          <StatCard
            title="Open Issues"
            value={stats.openIssues}
            subText="Facility maintenance issues"
            color="blue"
          />
          <StatCard
            title="Critical Issues"
            value={stats.criticalIssues}
            subText="High severity issues"
            color="red"
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Room Availability Status */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Room Availability</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={roomAvailabilityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roomAvailabilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} rooms`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Issues Status */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Facility Issues Status</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={issuesSeverityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" name="Count">
                  {issuesSeverityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pending Requests Preview */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Pending Requests Overview</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bookingRequestsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} requests`} />
                <Bar dataKey="value" fill="#fbbf24" radius={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Overview */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Management Summary</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={summaryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={100} />
                <Tooltip formatter={(value) => `${value} items`} />
                <Bar dataKey="count" fill="#3b82f6" radius={4}>
                  {summaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityManagerDashboard;
