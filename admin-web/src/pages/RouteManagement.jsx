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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Route Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Define transit routes, paths, and stop sequences</p>
        </div>
        <button onClick={() => setShowCreateRoute(true)} className="flex items-center gap-1.5 bg-blue-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 shadow-xs transition w-fit">
          <Plus size={16} /> Create Route
        </button>
      </header>

      {message.text && (
        <div className={`mb-4 p-3 rounded-xl border text-sm flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="font-bold text-lg leading-none ml-2">&times;</button>
        </div>
      )}

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {loading ? (
          <p className="text-gray-400 col-span-full text-center py-8">Loading...</p>
        ) : routes.length === 0 ? (
          <p className="text-gray-400 col-span-full text-center py-8">No routes defined yet.</p>
        ) : (
          routes.map((route) => (
            <div key={route._id} className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900">{route.routeName}</h3>
                  <button
                    onClick={() => handleDeleteRoute(route._id, route.routeName)}
                    className="text-red-600 hover:text-red-800 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-3">{route.origin} → {route.destination}</p>
                <div className="flex flex-wrap gap-1.5">
                  {route.stops?.map((stop, i) => (
                    <span key={stop._id || i} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-lg border border-blue-200/80 font-medium">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Create New Route</h2>
            <form onSubmit={handleCreateRoute}>
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Route Name</label>
                <input type="text" className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" placeholder="e.g. Route 2: South Loop"
                  value={newRoute.routeName} onChange={(e) => setNewRoute({ ...newRoute, routeName: e.target.value })} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Origin</label>
                  <input type="text" className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" placeholder="Start point"
                    value={newRoute.origin} onChange={(e) => setNewRoute({ ...newRoute, origin: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Destination</label>
                  <input type="text" className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" placeholder="End point"
                    value={newRoute.destination} onChange={(e) => setNewRoute({ ...newRoute, destination: e.target.value })} required />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Stops (in order)</label>
                {stops.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No stops available. Create stops first.</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1">
                    {stops.map((stop) => (
                      <label key={stop._id} className="flex items-center gap-2.5 p-1.5 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newRoute.stops.includes(stop._id)}
                          onChange={() => toggleStop(stop._id)}
                          className="accent-blue-600 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">{stop.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {newRoute.stops.length > 0 && (
                  <p className="text-xs font-semibold text-blue-600 mt-1.5">{newRoute.stops.length} stop(s) selected</p>
                )}
              </div>
              <div className="flex gap-2.5 justify-end pt-2">
                <button type="button" onClick={() => setShowCreateRoute(false)} className="px-4 py-2 border rounded-xl hover:bg-gray-50 text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold shadow">Create Route</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
