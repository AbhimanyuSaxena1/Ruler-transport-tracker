import React, { useEffect, useState } from 'react';
import { Plus, MapPin, Search, Crosshair } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import apiClient from '../services/api';

// Custom Marker Pin for Map Picker
const stopPickerIcon = L.divIcon({
  className: 'custom-stop-picker-pin',
  html: `
    <div class="flex items-center justify-center -translate-x-1/2 -translate-y-full">
      <div class="bg-red-600 text-white p-2 rounded-full shadow-xl border-2 border-white ring-4 ring-red-200 animate-bounce">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

// Helper component to handle map clicks & center updates
function MapController({ center, onSelectLocation }) {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 15, { duration: 1 });
    }
  }, [center, map]);

  useMapEvents({
    click(e) {
      onSelectLocation(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export default function StopManagement() {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStop, setNewStop] = useState({ name: '', latitude: 28.6139, longitude: 77.209 });
  const [mapCenter, setMapCenter] = useState([28.6139, 77.209]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchStops = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/routes/stops');
      setStops(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
  }, []);

  const handleSelectLocation = (lat, lng) => {
    const roundedLat = parseFloat(lat.toFixed(6));
    const roundedLng = parseFloat(lng.toFixed(6));
    setNewStop((prev) => ({ ...prev, latitude: roundedLat, longitude: roundedLng }));
    setMapCenter([roundedLat, roundedLng]);
  };

  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const results = await response.json();

      if (results && results.length > 0) {
        const topResult = results[0];
        const lat = parseFloat(topResult.lat);
        const lng = parseFloat(topResult.lon);
        handleSelectLocation(lat, lng);

        // Auto-fill stop name if currently empty
        if (!newStop.name) {
          const shortName = topResult.display_name.split(',')[0];
          setNewStop((prev) => ({ ...prev, name: shortName }));
        }
      } else {
        setMessage({ text: 'Location not found on map. Try another search query.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to search location', type: 'error' });
    } finally {
      setSearching(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/routes/stops', {
        name: newStop.name,
        latitude: parseFloat(newStop.latitude),
        longitude: parseFloat(newStop.longitude),
      });
      setMessage({ text: `Stop "${newStop.name}" created!`, type: 'success' });
      setShowCreateModal(false);
      setNewStop({ name: '', latitude: 28.6139, longitude: 77.209 });
      fetchStops();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to create stop', type: 'error' });
    }
  };

  const handleDeleteStop = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete stop "${name}"?`)) return;
    try {
      await apiClient.delete(`/routes/stops/${id}`);
      setMessage({ text: `Stop "${name}" deleted.`, type: 'success' });
      fetchStops();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to delete stop', type: 'error' });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Stop Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Define physical bus stops with interactive map location picking</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 bg-blue-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 shadow-xs transition w-fit"
        >
          <Plus size={16} /> Add Stop
        </button>
      </header>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded-xl border text-sm flex items-center justify-between ${
            message.type === 'success' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="font-bold text-lg leading-none ml-2">
            &times;
          </button>
        </div>
      )}

      {/* Stops Table with Horizontal Scroll */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Stop Name</th>
                <th className="p-4">Latitude</th>
                <th className="p-4">Longitude</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : stops.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    No stops created yet.
                  </td>
                </tr>
              ) : (
                stops.map((stop) => (
                  <tr key={stop._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/80 transition">
                    <td className="p-4 font-semibold text-gray-800 flex items-center gap-2">
                      <MapPin size={16} className="text-red-500" /> {stop.name}
                    </td>
                    <td className="p-4 text-sm text-gray-600 font-mono">{stop.location?.coordinates?.[1]?.toFixed(6)}</td>
                    <td className="p-4 text-sm text-gray-600 font-mono">{stop.location?.coordinates?.[0]?.toFixed(6)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          stop.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {stop.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteStop(stop._id, stop.name)}
                        className="text-red-600 hover:text-red-800 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Stop Modal with Interactive Map Picker */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add New Bus Stop</h2>
                <p className="text-xs text-gray-500 mt-0.5">Click directly on the map or search to place a stop marker</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">
                &times;
              </button>
            </div>

            {/* Location Search Bar */}
            <form onSubmit={handleSearchLocation} className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search location (e.g. Connaught Place, Railway Station)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition flex items-center gap-1.5"
              >
                {searching ? 'Searching...' : 'Search Map'}
              </button>
            </form>

            {/* Interactive Leaflet Map */}
            <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-gray-300 mb-4 shadow-inner">
              <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController center={mapCenter} onSelectLocation={handleSelectLocation} />
                <Marker position={[newStop.latitude, newStop.longitude]} icon={stopPickerIcon} />
              </MapContainer>
              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg shadow-md border text-xs font-semibold text-gray-700 flex items-center gap-1.5 z-[1000]">
                <Crosshair size={14} className="text-blue-600 animate-spin" /> Click map to select location
              </div>
            </div>

            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Stop Name</label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  placeholder="e.g. Central Station"
                  value={newStop.name}
                  onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Selected Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full p-2 border border-gray-200 bg-gray-50 rounded-xl text-sm font-mono text-gray-700"
                    value={newStop.latitude}
                    onChange={(e) => handleSelectLocation(parseFloat(e.target.value) || 0, newStop.longitude)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Selected Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full p-2 border border-gray-200 bg-gray-50 rounded-xl text-sm font-mono text-gray-700"
                    value={newStop.longitude}
                    onChange={(e) => handleSelectLocation(newStop.latitude, parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2.5 justify-end pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-50 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold shadow transition"
                >
                  Save Stop Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

