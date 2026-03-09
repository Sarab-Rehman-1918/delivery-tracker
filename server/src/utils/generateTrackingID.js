// server/src/utils/generateTrackingId.js

const generateTrackingId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `TRK-${timestamp}-${random}`;
};

module.exports = generateTrackingId;

// Example output → TRK-LK7X2A-P9QR3