import React, { useState, useEffect } from 'react';
import { getAllUsers, createUser, updateUser } from "../services/userService";
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  assignPermissions,
  getAvailablePermissions,
} from "../services/roleService";
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
  const [selectedUser, setSelectedUser] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone_number: "",
    role: "STUDENT",
    status: "ACTIVE",
  });

  // Tab state for Users vs Roles
  const [activeTab, setActiveTab] = useState("users");

  // Role management states
  const [roles, setRoles] = useState([]);
  const [roleFilters, setRoleFilters] = useState({
    search: "",
    page: 1,
    limit: 10,
  });

  const [rolePagination, setRolePagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [isRoleCreateModalOpen, setIsRoleCreateModalOpen] = useState(false);
  const [isRoleEditModalOpen, setIsRoleEditModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [availablePermissions, setAvailablePermissions] = useState([]);

  const [roleFormData, setRoleFormData] = useState({
    name: "",
    description: "",
    permissions: [],
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

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Handle create user
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

  // ===== ROLE MANAGEMENT FUNCTIONS =====

  // Fetch roles
  const fetchRoles = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllRoles(roleFilters);
      if (response.success) {
        setRoles(response.data);
        setRolePagination(response.pagination);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  // Fetch available permissions
  const fetchAvailablePermissions = async () => {
    try {
      const response = await getAvailablePermissions();
      if (response.success) {
        setAvailablePermissions(response.data);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch permissions");
    }
  };

  useEffect(() => {
    if (activeTab === "roles") {
      fetchRoles();
      fetchAvailablePermissions();
    }
  }, [activeTab, roleFilters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle create role
  const handleCreateRole = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await createRole(roleFormData);
      if (response.success) {
        setSuccess(`Role ${roleFormData.name} created successfully`);
        setIsRoleCreateModalOpen(false);
        setRoleFormData({ name: "", description: "", permissions: [] });
        fetchRoles();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to create role");
    }
  };

  // Handle edit role
  const handleEditRole = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await updateRole(selectedRole._id, roleFormData);
      if (response.success) {
        setSuccess(`Role ${roleFormData.name} updated successfully`);
        setIsRoleEditModalOpen(false);
        setRoleFormData({ name: "", description: "", permissions: [] });
        setSelectedRole(null);
        fetchRoles();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to update role");
    }
  };

  // Handle delete role
  const handleDeleteRole = async (roleId) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    setError("");
    try {
      const response = await deleteRole(roleId);
      if (response.success) {
        setSuccess("Role deleted successfully");
        fetchRoles();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to delete role");
    }
  };

  // Handle assign permissions
  const handleAssignPermissions = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await assignPermissions(
        selectedRole._id,
        roleFormData.permissions
      );
      if (response.success) {
        setSuccess("Permissions assigned successfully");
        setIsPermissionModalOpen(false);
        setRoleFormData({ name: "", description: "", permissions: [] });
        setSelectedRole(null);
        fetchRoles();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to assign permissions");
    }
  };

  // Open edit role modal
  const openEditRoleModal = (role) => {
    setSelectedRole(role);
    setRoleFormData({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions || [],
    });
    setIsRoleEditModalOpen(true);
  };

  // Open permission modal
  const openPermissionModal = (role) => {
    setSelectedRole(role);
    setRoleFormData({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions || [],
    });
    setIsPermissionModalOpen(true);
  };

  // Reset role form
  const resetRoleForm = () => {
    setRoleFormData({ name: "", description: "", permissions: [] });
    setSelectedRole(null);
  };

  // Handle role filter changes
  const handleRoleFilterChange = (key, value) => {
    setRoleFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle role pagination
  const handleRolePageChange = (newPage) => {
    setRoleFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Group permissions by category
  const groupPermissionsByCategory = (permissions) => {
    const grouped = {};
    permissions.forEach((perm) => {
      const category = perm.category || "Other";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(perm);
    });
    return grouped;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">
            {activeTab === "users" ? "User Management" : "Role Management"}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
            {activeTab === "users"
              ? `${pagination.total} Total Users`
              : `${rolePagination.total} Total Roles`}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() =>
              activeTab === "users"
                ? setIsCreateModalOpen(true)
                : setIsRoleCreateModalOpen(true)
            }
            className="flex items-center gap-2"
          >
            <span className="text-sm">+</span>
            Add New {activeTab === "users" ? "User" : "Role"}
          </Button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-9">
        <div className="px-8 flex gap-8">
          <button
            onClick={() => setActiveTab("users")}
            className={`py-4 px-1 font-medium border-b-2 transition-colors ${
              activeTab === "users"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`py-4 px-1 font-medium border-b-2 transition-colors ${
              activeTab === "roles"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Roles
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
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

        {/* Users Tab */}
        {activeTab === "users" && (
          <>
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
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
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
                  <option value="TEACHER">Lecturer</option>
                  <option value="STAFF">Department Manager</option>
                  <option value="ADMIN">System Admin</option>
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
                              <div className="font-medium">
                                {user.full_name}
                              </div>
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
                              <option value="TEACHER">Lecturer</option>
                              <option value="STAFF">Dept. Manager</option>
                              <option value="ADMIN">System Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={
                                user.status === "ACTIVE"
                                  ? "confirmed"
                                  : "cancelled"
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
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
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
                    {[...Array(Math.min(5, pagination.totalPages))].map(
                      (_, i) => {
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
                      }
                    )}
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
          </>
        )}

        {/* Roles Tab */}
        {activeTab === "roles" && (
          <>
            {/* Role Filters Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={roleFilters.search}
                    onChange={(e) =>
                      handleRoleFilterChange("search", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 rounded-lg border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search roles..."
                  />
                </div>
              </div>
            </div>

            {/* Roles Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 font-semibold text-sm text-slate-600">
                        Role Name
                      </th>
                      <th className="px-6 py-4 font-semibold text-sm text-slate-600">
                        Description
                      </th>
                      <th className="px-6 py-4 font-semibold text-sm text-slate-600">
                        Permissions
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
                          colSpan="4"
                          className="px-6 py-12 text-center text-slate-500"
                        >
                          Loading roles...
                        </td>
                      </tr>
                    ) : roles.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-12 text-center text-slate-500"
                        >
                          No roles found
                        </td>
                      </tr>
                    ) : (
                      roles.map((role) => (
                        <tr
                          key={role._id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium">{role.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {role.description || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                              {role.permissions?.length || 0} permissions
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openPermissionModal(role)}
                                className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-green-600 transition-colors"
                                title="Manage permissions"
                              >
                                🔐
                              </button>
                              <button
                                onClick={() => openEditRoleModal(role)}
                                className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors"
                                title="Edit role"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteRole(role._id)}
                                className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-red-600 transition-colors"
                                title="Delete role"
                              >
                                🗑️
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
              {!loading && roles.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Showing{" "}
                    {(rolePagination.page - 1) * rolePagination.limit + 1} to{" "}
                    {Math.min(
                      rolePagination.page * rolePagination.limit,
                      rolePagination.total
                    )}{" "}
                    of {rolePagination.total} roles
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleRolePageChange(rolePagination.page - 1)
                      }
                      disabled={rolePagination.page === 1}
                      className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {[...Array(Math.min(5, rolePagination.totalPages))].map(
                      (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handleRolePageChange(page)}
                            className={`px-3.5 py-1 rounded-lg font-medium transition-colors ${
                              rolePagination.page === page
                                ? "bg-blue-600 text-white"
                                : "text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                    )}
                    {rolePagination.totalPages > 5 && (
                      <span className="px-2 text-slate-400">...</span>
                    )}
                    <button
                      onClick={() =>
                        handleRolePageChange(rolePagination.page + 1)
                      }
                      disabled={
                        rolePagination.page === rolePagination.totalPages
                      }
                      className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

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
                  <option value="TEACHER">Lecturer</option>
                  <option value="STAFF">Department Manager</option>
                  <option value="ADMIN">System Admin</option>
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
                  <option value="TEACHER">Lecturer</option>
                  <option value="STAFF">Department Manager</option>
                  <option value="ADMIN">System Admin</option>
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

      {/* Create Role Modal */}
      {isRoleCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold">Create New Role</h2>
            </div>
            <form onSubmit={handleCreateRole} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={roleFormData.name}
                  onChange={(e) =>
                    setRoleFormData({ ...roleFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={roleFormData.description}
                  onChange={(e) =>
                    setRoleFormData({
                      ...roleFormData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Create Role
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsRoleCreateModalOpen(false);
                    resetRoleForm();
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

      {/* Edit Role Modal */}
      {isRoleEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold">Edit Role</h2>
            </div>
            <form onSubmit={handleEditRole} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={roleFormData.name}
                  onChange={(e) =>
                    setRoleFormData({ ...roleFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={roleFormData.description}
                  onChange={(e) =>
                    setRoleFormData({
                      ...roleFormData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Update Role
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsRoleEditModalOpen(false);
                    resetRoleForm();
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

      {/* Permission Assignment Modal */}
      {isPermissionModalOpen && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold">
                Assign Permissions - {selectedRole.name}
              </h2>
            </div>
            <form onSubmit={handleAssignPermissions} className="p-6 space-y-6">
              {Object.entries(
                groupPermissionsByCategory(availablePermissions)
              ).map(([category, permissions]) => (
                <div key={category}>
                  <h3 className="font-semibold text-slate-700 mb-3">
                    {category}
                  </h3>
                  <div className="space-y-2 ml-4">
                    {permissions.map((perm) => (
                      <label
                        key={perm._id}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={roleFormData.permissions.includes(perm._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRoleFormData({
                                ...roleFormData,
                                permissions: [
                                  ...roleFormData.permissions,
                                  perm._id,
                                ],
                              });
                            } else {
                              setRoleFormData({
                                ...roleFormData,
                                permissions: roleFormData.permissions.filter(
                                  (id) => id !== perm._id
                                ),
                              });
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">
                          {perm.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({perm.description})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Save Permissions
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsPermissionModalOpen(false);
                    resetRoleForm();
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

      {/* Success Toast */}
      {success && (
        <div className="fixed bottom-8 right-8 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl z-50">
          <span className="text-emerald-400">✓</span>
          <span className="text-sm font-medium">{success}</span>
          <button
            onClick={() => setSuccess("")}
            className="ml-4 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
