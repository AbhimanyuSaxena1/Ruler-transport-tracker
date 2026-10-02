import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import apiClient from '../services/api';

export default function RouteManagement() {
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateRoute, setShowCreateRoute] = useState(false);
  const [newRoute, setNewRoute] = useState({ routeName: '', origin: '', destination: '', stops: [] });

  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [routesRes, stopsRes] = await Promise.all([
        apiClient.get('/routes'),
        apiClient.get('/routes/stops'),
      ]);
      setRoutes(routesRes.data.data || []);
      setStops(stopsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/routes', newRoute);
      setMessage({ text: `Route "${newRoute.routeName}" created!`, type: 'success' });
      setShowCreateRoute(false);
      setNewRoute({ routeName: '', origin: '', destination: '', stops: [] });
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to create route', type: 'error' });
    }
  };

  const toggleStop = (stopId) => {
    setNewRoute((prev) => {
      const exists = prev.stops.includes(stopId);
      return {
        ...prev,
        stops: exists ? prev.stops.filter((id) => id !== stopId) : [...prev.stops, stopId],
      };
    });
  };

  const handleDeleteRoute = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete route "${name}"?`)) return;
    try {
      await apiClient.delete(`/routes/${id}`);
      setMessage({ text: `Route "${name}" deleted.`, type: 'success' });
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to delete route', type: 'error' });
    }
  };

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Route Management</h1>
          <p className="text-gray-500">Define and manage transit routes</p>
        </div>
        <button onClick={() => setShowCreateRoute(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus size={18} /> Create Route
        </button>
      </header>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
          {message.text}
          <button onClick={() => setMessage({ text: '', type: '' })} className="float-right font-bold">&times;</button>
        </div>
      )}

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-400 col-span-3 text-center py-8">Loading...</p>
        ) : routes.length === 0 ? (
          <p className="text-gray-400 col-span-3 text-center py-8">No routes defined yet.</p>
        ) : (
          routes.map((route) => (
            <div key={route._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-lg text-gray-800">{route.routeName}</h3>
                  <button
                    onClick={() => handleDeleteRoute(route._id, route.routeName)}
                    className="text-red-600 hover:text-red-800 text-xs font-semibold px-2 py-1 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-3">{route.origin} → {route.destination}</p>
                <div className="flex flex-wrap gap-1">
                  {route.stops?.map((stop, i) => (
                    <span key={stop._id || i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200">
                      {stop.name || stop}
                    </span>
                  ))}
                  {(!route.stops || route.stops.length === 0) && (
                    <span className="text-xs text-gray-400 italic">No stops assigned</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Route Modal */}
      {showCreateRoute && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Create New Route</h2>
            <form onSubmit={handleCreateRoute}>
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Route Name</label>
                <input type="text" className="w-full p-2 border rounded-md" placeholder="e.g. Route 2: South Loop"
                  value={newRoute.routeName} onChange={(e) => setNewRoute({ ...newRoute, routeName: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Origin</label>
                  <input type="text" className="w-full p-2 border rounded-md" placeholder="Start point"
                    value={newRoute.origin} onChange={(e) => setNewRoute({ ...newRoute, origin: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Destination</label>
                  <input type="text" className="w-full p-2 border rounded-md" placeholder="End point"
                    value={newRoute.destination} onChange={(e) => setNewRoute({ ...newRoute, destination: e.target.value })} required />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Stops (in order)</label>
                {stops.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No stops available. Create stops first.</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                    {stops.map((stop) => (
                      <label key={stop._id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newRoute.stops.includes(stop._id)}
                          onChange={() => toggleStop(stop._id)}
                          className="accent-blue-600"
                        />
                        <span className="text-sm">{stop.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {newRoute.stops.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{newRoute.stops.length} stop(s) selected</p>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowCreateRoute(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Route</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
