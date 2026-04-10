import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon (Leaflet + bundlers issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapView({ lat, lng, title, address }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || (!lat && !lng)) return;

    // Default to 0,0 if no coordinates
    const latitude = parseFloat(lat) || 0;
    const longitude = parseFloat(lng) || 0;

    // Don't render map if coordinates are 0,0 (not set)
    if (latitude === 0 && longitude === 0) return;

    // Destroy previous map instance
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current).setView([latitude, longitude], 15);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const popupContent = `<strong>${title || 'Listing'}</strong>${address ? `<br/>${address}` : ''}`;
    L.marker([latitude, longitude]).addTo(map).bindPopup(popupContent).openPopup();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, title, address]);

  const latitude = parseFloat(lat) || 0;
  const longitude = parseFloat(lng) || 0;

  if (latitude === 0 && longitude === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-64 rounded-xl overflow-hidden z-0"
      style={{ minHeight: '256px' }}
    />
  );
}
