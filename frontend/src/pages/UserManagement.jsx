import React, { useState, useEffect } from "react";
import { getAllUsers, createUser, updateUser, adminResetUserPassword } from "../services/userService";
import { Button, Badge } from "../components/common";
import { useAuthContext } from "../context/AuthContext";

const UserManagement = () => {
  const { user: currentUser } = useAuthContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetPasswordData, setResetPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [showResetNewPass, setShowResetNewPass] = useState(false);
  const [showResetConfirmPass, setShowResetConfirmPass] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone_number: "",
    role: "STUDENT",
    status: "ACTIVE",
  });

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllUsers(filters);
      if (response.success) {
        setUsers(response.data);
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };


  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await createUser(formData);
      if (response.success) {
        setSuccess(`User ${formData.full_name} created successfully`);
        setIsCreateModalOpen(false);
        resetForm();
        fetchUsers();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to create user");
    }
  };

  // Handle edit user
  const handleEditUser = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { password, email, ...updateData } = formData;
      const response = await updateUser(selectedUser._id, updateData);
      if (response.success) {
        setSuccess(`User ${formData.full_name} updated successfully`);
        setIsEditModalOpen(false);
        resetForm();
        fetchUsers();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to update user");
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await updateUser(userId, { status: newStatus });
      setSuccess(`User status updated to ${newStatus}`);
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update status");
    }
  };

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUser(userId, { role: newRole });
      setSuccess("Role updated successfully");
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update role");
    }
  };

  // Open edit modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      phone_number: user.phone_number || "",
      role: user.role,
      status: user.status,
      password: "",
    });
    setIsEditModalOpen(true);
  };

  // Open reset password modal
  const openResetPasswordModal = (user) => {
    setSelectedUser(user);
    setResetPasswordData({ newPassword: '', confirmPassword: '' });
    setShowResetNewPass(false);
    setShowResetConfirmPass(false);
    setIsResetPasswordModalOpen(true);
  };

  // Handle admin reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setResetPasswordLoading(true);
    try {
      const response = await adminResetUserPassword(selectedUser._id, resetPasswordData);
      if (response.success) {
        setSuccess(response.message);
        setIsResetPasswordModalOpen(false);
        setSelectedUser(null);
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      full_name: "",
      phone_number: "",
      role: "STUDENT",
      status: "ACTIVE",
    });
    setSelectedUser(null);
  };

  // Get user initials
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Top Header */}
      <header className="mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">User Management</h1>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
            {pagination.total} Total Users
          </span>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <span className="text-sm">+</span>
            Add New User
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div>
        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
            {success}
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by name or email..."
              />
            </div>

            <select
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
              className="w-48 py-2 rounded-lg border-slate-200 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Filter by Role</option>
              <option value="STUDENT">Student</option>
              <option value="LECTURER">Lecturer</option>
              <option value="FACILITY_MANAGER">Facility Manager</option>
              <option value="ADMINISTRATOR">Administrator</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-48 py-2 rounded-lg border-slate-200 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Filter by Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            {(filters.search || filters.role || filters.status) && (
              <button
                onClick={() =>
                  setFilters({
                    search: "",
                    role: "",
                    status: "",
                    page: 1,
                    limit: 10,
                  })
                }
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold text-sm text-slate-600">
                    User Name
                  </th>
                  <th className="px-6 py-4 font-semibold text-sm text-slate-600">
                    Email Address
                  </th>
                  <th className="px-6 py-4 font-semibold text-sm text-slate-600">
                    Phone
                  </th>
                  <th className="px-6 py-4 font-semibold text-sm text-slate-600">
                    Role
                  </th>
                  <th className="px-6 py-4 font-semibold text-sm text-slate-600">
                    Status
                  </th>
                  <th className="px-6 py-4 font-semibold text-sm text-slate-600 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className={`hover:bg-slate-50 transition-colors ${
                        user.status === "INACTIVE" ? "opacity-60" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                            {getInitials(user.full_name)}
                          </div>
                          <div className="font-medium">{user.full_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {user.phone_number || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user._id, e.target.value)
                          }
                          disabled={
                            user.status === "INACTIVE" ||
                            user._id === currentUser?._id
                          }
                          className="text-xs bg-slate-50 border-slate-200 rounded-lg py-1 px-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <option value="STUDENT">Student</option>
                          <option value="LECTURER">Lecturer</option>
                          <option value="FACILITY_MANAGER">
                            Facility Manager
                          </option>
                          <option value="ADMINISTRATOR">Administrator</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            user.status === "ACTIVE" ? "confirmed" : "cancelled"
                          }
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors"
                            title="Edit user"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => openResetPasswordModal(user)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-colors"
                            title="Reset password & send email"
                          >
                            🔑 Reset Password
                          </button>
                          <button
                            onClick={() =>
                              handleToggleStatus(user._id, user.status)
                            }
                            disabled={user._id === currentUser?._id}
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                              user.status === "ACTIVE"
                                ? "bg-blue-600"
                                : "bg-slate-300"
                            }`}
                            title={
                              user.status === "ACTIVE"
                                ? "Deactivate"
                                : "Activate"
                            }
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                user.status === "ACTIVE"
                                  ? "translate-x-5"
                                  : "translate-x-1"
                              }`}
                            ></span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && users.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3.5 py-1 rounded-lg font-medium transition-colors ${
                        pagination.page === page
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                {pagination.totalPages > 5 && (
                  <span className="px-2 text-slate-400">...</span>
                )}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset Password Modal */}
      {isResetPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">🔑 Reset Password</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedUser.full_name}{" "}
                    <span className="text-slate-400">({selectedUser.email})</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsResetPasswordModalOpen(false);
                    setSelectedUser(null);
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors text-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              {/* Info banner */}
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-sm">
                ⚠️ The new password will be sent to the user's email address after reset.
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showResetNewPass ? "text" : "password"}
                    value={resetPasswordData.newPassword}
                    onChange={(e) =>
                      setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })
                    }
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Min. 6 characters, include letters & numbers"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetNewPass(!showResetNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showResetNewPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showResetConfirmPass ? "text" : "password"}
                    value={resetPasswordData.confirmPassword}
                    onChange={(e) =>
                      setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })
                    }
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                      resetPasswordData.confirmPassword &&
                      resetPasswordData.newPassword !== resetPasswordData.confirmPassword
                        ? "border-red-400 bg-red-50"
                        : "border-slate-300"
                    }`}
                    placeholder="Re-enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetConfirmPass(!showResetConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showResetConfirmPass ? "🙈" : "👁"}
                  </button>
                </div>
                {resetPasswordData.confirmPassword &&
                  resetPasswordData.newPassword !== resetPasswordData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                  )}
              </div>

              {/* Password rules */}
              <ul className="text-xs text-slate-500 space-y-1 pl-1">
                <li className={resetPasswordData.newPassword.length >= 6 ? "text-green-600" : ""}>
                  {resetPasswordData.newPassword.length >= 6 ? "✅" : "○"} At least 6 characters
                </li>
                <li className={/(?=.*[A-Za-z])(?=.*\d)/.test(resetPasswordData.newPassword) ? "text-green-600" : ""}>
                  {/(?=.*[A-Za-z])(?=.*\d)/.test(resetPasswordData.newPassword) ? "✅" : "○"} Contains letters and numbers
                </li>
                <li
                  className={
                    resetPasswordData.confirmPassword &&
                    resetPasswordData.newPassword === resetPasswordData.confirmPassword
                      ? "text-green-600"
                      : ""
                  }
                >
                  {resetPasswordData.confirmPassword &&
                  resetPasswordData.newPassword === resetPasswordData.confirmPassword
                    ? "✅"
                    : "○"}{" "}
                  Passwords match
                </li>
              </ul>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={
                    resetPasswordLoading ||
                    !resetPasswordData.newPassword ||
                    resetPasswordData.newPassword !== resetPasswordData.confirmPassword
                  }
                  className="flex-1 py-2 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {resetPasswordLoading ? "Resetting..." : "Reset & Send Email"}
                </button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsResetPasswordModalOpen(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold">Add New User</h2>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  pattern="[0-9]{10,11}"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="STUDENT">Student</option>
                  <option value="LECTURER">Lecturer</option>
                  <option value="FACILITY_MANAGER">Facility Manager</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Create User
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold">Edit User</h2>
            </div>
            <form onSubmit={handleEditUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  pattern="[0-9]{10,11}"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="STUDENT">Student</option>
                  <option value="LECTURER">Lecturer</option>
                  <option value="FACILITY_MANAGER">Facility Manager</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Update User
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
