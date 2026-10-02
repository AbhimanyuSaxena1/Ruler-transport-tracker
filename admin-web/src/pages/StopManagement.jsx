import React, { useEffect, useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import apiClient from '../services/api';

export default function StopManagement() {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStop, setNewStop] = useState({ name: '', latitude: '', longitude: '' });
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

  useEffect(() => { fetchStops(); }, []);

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
      setNewStop({ name: '', latitude: '', longitude: '' });
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
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Stop Management</h1>
          <p className="text-gray-500">Define physical bus stops with GPS coordinates</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus size={18} /> Add Stop
        </button>
      </header>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
          {message.text}
          <button onClick={() => setMessage({ text: '', type: '' })} className="float-right font-bold">&times;</button>
        </div>
      )}

      {/* Stops Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-600">Stop Name</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Latitude</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Longitude</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading...</td></tr>
            ) : stops.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-400">No stops created yet.</td></tr>
            ) : (
              stops.map((stop) => (
                <tr key={stop._id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="p-4 font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin size={16} className="text-red-500" /> {stop.name}
                  </td>
                  <td className="p-4 text-gray-600">{stop.location?.coordinates?.[1]?.toFixed(6)}</td>
                  <td className="p-4 text-gray-600">{stop.location?.coordinates?.[0]?.toFixed(6)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${stop.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {stop.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteStop(stop._id, stop.name)}
                      className="text-red-600 hover:text-red-800 text-xs font-semibold px-2 py-1 rounded hover:bg-red-50"
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

      {/* Create Stop Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Stop</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Stop Name</label>
                <input type="text" className="w-full p-2 border rounded-md" placeholder="e.g. Central Station"
                  value={newStop.name} onChange={(e) => setNewStop({ ...newStop, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Latitude</label>
                  <input type="number" step="any" className="w-full p-2 border rounded-md" placeholder="28.6139"
                    value={newStop.latitude} onChange={(e) => setNewStop({ ...newStop, latitude: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Longitude</label>
                  <input type="number" step="any" className="w-full p-2 border rounded-md" placeholder="77.2090"
                    value={newStop.longitude} onChange={(e) => setNewStop({ ...newStop, longitude: e.target.value })} required />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Stop</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
