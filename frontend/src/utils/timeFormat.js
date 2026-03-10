// Convert 24-hour format to 12-hour AM/PM format
export const formatTime12Hour = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${period}`;
};

// Convert 12-hour AM/PM format to 24-hour format
export const formatTime24Hour = (time12) => {
  if (!time12) return '';
  const match = time12.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return time12;
  
  let [, hours, minutes, period] = match;
  hours = parseInt(hours);
  
  if (period.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

// Generate time options for dropdown (in 30-minute intervals)
export const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 30]) {
      const time24 = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const time12 = formatTime12Hour(time24);
      options.push({ value: time24, label: time12 });
    }
  }
  return options;
};
