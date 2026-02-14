/**
 * Calculate delivery fee based on distance tiers
 * Distance tiers:
 * - 0-5 km → 200 ETB
 * - 5-10 km → 300 ETB
 * - 10+ km → 400 ETB
 */

/**
 * Calculate distance using Google Maps Distance Matrix API
 * Falls back to estimation if API is not available
 * 
 * @param {Object} origin - Origin location { lat, lng, city, location/address }
 * @param {Object} destination - Destination location { lat, lng, city, location/address }
 * @returns {Promise<number>} Distance in kilometers
 */
export const calculateDistance = async (origin, destination) => {
  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  // If we have coordinates, use Google Maps Distance Matrix API
  if (googleApiKey && origin.lat && origin.lng && destination.lat && destination.lng) {
    try {
      const originStr = `${origin.lat},${origin.lng}`;
      const destStr = `${destination.lat},${destination.lng}`;
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(originStr)}&destinations=${encodeURIComponent(destStr)}&units=metric&key=${googleApiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.rows && data.rows[0] && data.rows[0].elements && data.rows[0].elements[0]) {
        const element = data.rows[0].elements[0];
        if (element.status === 'OK' && element.distance) {
          // Convert meters to kilometers
          return element.distance.value / 1000;
        }
      }
    } catch (error) {
      console.error('Error calculating distance with Google Maps:', error);
      // Fall through to estimation
    }
  }
  
  // Fallback: Use geocoding API to get coordinates if we have addresses
  if (googleApiKey && origin.city && destination.city) {
    try {
      // Geocode origin
      const originAddress = `${origin.location || origin.address || ''}, ${origin.city}, Ethiopia`;
      const originGeoResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(originAddress)}&key=${googleApiKey}`
      );
      const originGeoData = await originGeoResponse.json();
      
      // Geocode destination
      const destAddress = `${destination.location || destination.address || ''}, ${destination.city}, Ethiopia`;
      const destGeoResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destAddress)}&key=${googleApiKey}`
      );
      const destGeoData = await destGeoResponse.json();
      
      if (originGeoData.status === 'OK' && originGeoData.results && originGeoData.results[0] &&
          destGeoData.status === 'OK' && destGeoData.results && destGeoData.results[0]) {
        const originLat = originGeoData.results[0].geometry.location.lat;
        const originLng = originGeoData.results[0].geometry.location.lng;
        const destLat = destGeoData.results[0].geometry.location.lat;
        const destLng = destGeoData.results[0].geometry.location.lng;
        
        // Calculate distance using Distance Matrix API
        const distanceResponse = await fetch(
          `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&units=metric&key=${googleApiKey}`
        );
        
        const distanceData = await distanceResponse.json();
        if (distanceData.status === 'OK' && distanceData.rows && distanceData.rows[0] && 
            distanceData.rows[0].elements && distanceData.rows[0].elements[0]) {
          const element = distanceData.rows[0].elements[0];
          if (element.status === 'OK' && element.distance) {
            return element.distance.value / 1000;
          }
        }
      }
    } catch (error) {
      console.error('Error geocoding addresses:', error);
      // Fall through to estimation
    }
  }
  
  // Final fallback: Simple estimation based on city matching
  const originCity = origin.city || '';
  const destinationCity = destination.city || '';
  const originLocation = origin.location || origin.address || '';
  const destinationLocation = destination.location || destination.address || '';
  
  // If same city (especially Addis Ababa), estimate based on location similarity
  if (originCity && destinationCity && originCity.toLowerCase().trim() === destinationCity.toLowerCase().trim()) {
    // For Addis Ababa, use more refined estimation
    if (originCity.toLowerCase().includes('addis') || originCity.toLowerCase().includes('addis ababa')) {
      if (originLocation && destinationLocation) {
        const originLower = originLocation.toLowerCase().trim();
        const destinationLower = destinationLocation.toLowerCase().trim();
        
        // If locations are very similar, assume close distance (0-5 km)
        if (originLower === destinationLower || originLower.includes(destinationLower) || destinationLower.includes(originLower)) {
          return 3; // ~3 km
        }
      }
      // Same city but different locations - estimate 5-10 km for Addis Ababa
      return 7; // ~7 km average for Addis Ababa
    }
    
    // Same city - estimate based on location similarity
    if (originLocation && destinationLocation) {
      const originLower = originLocation.toLowerCase().trim();
      const destinationLower = destinationLocation.toLowerCase().trim();
      
      if (originLower === destinationLower || originLower.includes(destinationLower) || destinationLower.includes(originLower)) {
        return 3; // ~3 km
      }
    }
    return 7; // ~7 km
  }
  
  // Different cities - estimate 10+ km
  return 15; // ~15 km (default for different cities)
};

/**
 * Calculate delivery fee based on distance
 * @param {number} distanceKm - Distance in kilometers
 * @returns {number} Delivery fee in ETB
 */
export const calculateDeliveryFee = (distanceKm) => {
  if (distanceKm <= 5) {
    return 200; // 0-5 km → 200 ETB
  } else if (distanceKm <= 10) {
    return 300; // 5-10 km → 300 ETB
  } else {
    return 400; // 10+ km → 400 ETB
  }
};

/**
 * Calculate delivery fee from addresses (async - uses Google Maps API if available)
 * @param {Object} origin - Origin address { lat, lng, city, location, address }
 * @param {Object} destination - Destination address { lat, lng, city, location, address }
 * @returns {Promise<number>} Delivery fee in ETB
 */
export const getDeliveryFeeFromAddresses = async (origin, destination) => {
  if (!origin || !destination) {
    // Default fee if addresses are not provided
    return 300; // Default to middle tier
  }
  
  const distance = await calculateDistance(origin, destination);
  
  return calculateDeliveryFee(distance);
};
