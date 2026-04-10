// utils/geocode.js
// Uses OpenStreetMap Nominatim (free, no API key required)

async function geocodeAddress(address) {
  const parts = [address.street, address.city, address.state, address.pincode].filter(Boolean);
  const query = parts.join(', ');
  if (!query) return [0, 0];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'RoommateRadar/1.0' },
    });
    const data = await res.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lon), parseFloat(data[0].lat)]; // GeoJSON: [lng, lat]
    }
  } catch (err) {
    console.error('Geocoding failed:', err.message);
  }
  return [0, 0];
}

module.exports = { geocodeAddress };
