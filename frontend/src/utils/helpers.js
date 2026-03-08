// Format date helpers
export const formatDate = (dateString, locale = 'en-US') => {
  return new Date(dateString).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime = (timeString) => {
  return timeString;
};

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Status helpers
export const getStatusVariant = (status) => {
  const statusMap = {
    PENDING: 'pending',
    APPROVED: 'approved',
    CONFIRMED: 'confirmed',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    'CHECKED-IN': 'checked-in'
  };
  return statusMap[status] || 'default';
};

export const getStatusLabel = (status) => {
  const labels = {
    APPROVED: 'Confirmed',
    PENDING: 'Pending',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
    'CHECKED-IN': 'Checked In'
  };
  return labels[status] || status;
};

// Room helpers
export const getRoomIcon = (roomName) => {
  if (!roomName) return 'door_front';
  const name = roomName.toLowerCase();
  if (name.includes('lab')) return 'science';
  if (name.includes('lecture')) return 'meeting_room';
  if (name.includes('study')) return 'menu_book';
  if (name.includes('computer') || name.includes('it')) return 'computer';
  return 'door_front';
};

// Validation helpers
export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone) => {
  return /^[0-9]{10,11}$/.test(phone);
};
