// server/src/services/etaService.js

// Calculate distance between 2 coordinates (in km)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // in km
};

// Convert degrees to radians
const toRad = (deg) => deg * (Math.PI / 180);

// Calculate ETA based on distance
const calculateETA = (lat1, lng1, lat2, lng2) => {
  const distance = calculateDistance(lat1, lng1, lat2, lng2);
  const avgSpeedKmH = 30; // average city speed
  const timeInHours = distance / avgSpeedKmH;
  const timeInMinutes = Math.round(timeInHours * 60);

  return {
    distance: `${distance.toFixed(1)} km`,
    eta: timeInMinutes <= 1
      ? 'Arriving now'
      : `${timeInMinutes} mins`,
  };
};

module.exports = { calculateDistance, calculateETA };