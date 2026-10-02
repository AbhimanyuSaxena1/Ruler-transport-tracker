import React, { useEffect, useState } from 'react';
import { Plus, Bus as BusIcon, UserPlus, MapPin } from 'lucide-react';
import apiClient from '../services/api';

export default function FleetManagement() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Bus Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBus, setNewBus] = useState({ busNumber: '', capacity: 40 });

  // Assign Driver Modal
  const [showAssignDriverModal, setShowAssignDriverModal] = useState(false);
  const [assignDriverData, setAssignDriverData] = useState({ busId: '', driverId: '' });

  // Assign Route Modal
  const [showAssignRouteModal, setShowAssignRouteModal] = useState(false);
  const [assignRouteData, setAssignRouteData] = useState({ busId: '', routeId: '' });

  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [busesRes, routesRes, driversRes] = await Promise.all([
        apiClient.get('/buses'),
        apiClient.get('/routes'),
        apiClient.get('/auth/users?role=driver'),
      ]);
      setBuses(busesRes.data.data || []);
      setRoutes(routesRes.data.data || []);
      setDrivers(driversRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateBus = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/buses', newBus);
      setMessage({ text: `Bus ${newBus.busNumber} created successfully!`, type: 'success' });
      setShowCreateModal(false);
      setNewBus({ busNumber: '', capacity: 40 });
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to create bus', type: 'error' });
    }
  };

  const handleAssignDriver = async (e) => {
    e.preventDefault();
    try {
      await apiClient.patch(`/buses/${assignDriverData.busId}/assign-driver`, {
        driverId: assignDriverData.driverId,
      });
      setMessage({ text: 'Driver assigned successfully!', type: 'success' });
      setShowAssignDriverModal(false);
      setAssignDriverData({ busId: '', driverId: '' });
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to assign driver', type: 'error' });
    }
  };

  const handleAssignRoute = async (e) => {
    e.preventDefault();
    try {
      await apiClient.patch(`/buses/${assignRouteData.busId}/assign-route`, {
        routeId: assignRouteData.routeId,
      });
      setMessage({ text: 'Route assigned successfully!', type: 'success' });
      setShowAssignRouteModal(false);
      setAssignRouteData({ busId: '', routeId: '' });
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to assign route', type: 'error' });
    }
  };

  const handleDeleteBus = async (id, number) => {
    if (!window.confirm(`Are you sure you want to delete bus "${number}"?`)) return;
    try {
      await apiClient.delete(`/buses/${id}`);
      setMessage({ text: `Bus "${number}" deleted.`, type: 'success' });
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to delete bus', type: 'error' });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Fleet Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage buses, assign drivers, and routes</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-1.5 bg-blue-600 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl hover:bg-blue-700 shadow-xs transition">
            <Plus size={16} /> Add Bus
          </button>
          <button onClick={() => setShowAssignDriverModal(true)} className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl hover:bg-emerald-700 shadow-xs transition">
            <UserPlus size={16} /> Assign Driver
          </button>
          <button onClick={() => setShowAssignRouteModal(true)} className="flex items-center gap-1.5 bg-purple-600 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl hover:bg-purple-700 shadow-xs transition">
            <MapPin size={16} /> Assign Route
          </button>
        </div>
      </header>

      {/* Flash Message */}
      {message.text && (
        <div className={`mb-4 p-3 rounded-xl border text-sm flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="font-bold text-lg leading-none ml-2">&times;</button>
        </div>
      )}

      {/* Buses Table with Responsive Scroll */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Bus Number</th>
                <th className="p-4">Status</th>
                <th className="p-4">Capacity</th>
                <th className="p-4">Assigned Driver</th>
                <th className="p-4">Assigned Route</th>
                <th className="p-4">Last Location Update</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-400">Loading...</td></tr>
            ) : buses.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-400">No buses registered yet.</td></tr>
            ) : (
              buses.map((bus) => (
                <tr key={bus._id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                    <BusIcon size={18} className="text-blue-500" /> {bus.busNumber}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      bus.status === 'active' ? 'bg-green-100 text-green-700' :
                      bus.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {bus.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{bus.capacity}</td>
                  <td className="p-4 text-gray-600">
                    {bus.assignedDriver?.name || bus.assignedDriver || <span className="text-gray-400 italic">None</span>}
                  </td>
                  <td className="p-4 text-gray-600">
                    {bus.assignedRoute?.routeName || bus.assignedRoute || <span className="text-gray-400 italic">None</span>}
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {bus.lastLocationUpdate ? new Date(bus.lastLocationUpdate).toLocaleString() : '—'}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteBus(bus._id, bus.busNumber)}
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
      </div>

      {/* Create Bus Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Register New Bus</h2>
            <form onSubmit={handleCreateBus}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bus Number</label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. BUS-201"
                  value={newBus.busNumber}
                  onChange={(e) => setNewBus({ ...newBus, busNumber: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={newBus.capacity}
                  onChange={(e) => setNewBus({ ...newBus, capacity: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
              <div className="flex gap-2.5 justify-end pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-xl hover:bg-gray-50 text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold shadow">Create Bus</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {showAssignDriverModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Assign Driver to Bus</h2>
            <form onSubmit={handleAssignDriver}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Bus</label>
                <select className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" value={assignDriverData.busId} onChange={(e) => setAssignDriverData({ ...assignDriverData, busId: e.target.value })} required>
                  <option value="">-- Select Bus --</option>
                  {buses.map(b => <option key={b._id} value={b._id}>{b.busNumber}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Driver</label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={assignDriverData.driverId}
                  onChange={(e) => setAssignDriverData({ ...assignDriverData, driverId: e.target.value })}
                  required
                >
                  <option value="">-- Select Driver --</option>
                  {drivers.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2.5 justify-end pt-2">
                <button type="button" onClick={() => setShowAssignDriverModal(false)} className="px-4 py-2 border rounded-xl hover:bg-gray-50 text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-semibold shadow">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Route Modal */}
      {showAssignRouteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Assign Route to Bus</h2>
            <form onSubmit={handleAssignRoute}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Bus</label>
                <select className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" value={assignRouteData.busId} onChange={(e) => setAssignRouteData({ ...assignRouteData, busId: e.target.value })} required>
                  <option value="">-- Select Bus --</option>
                  {buses.map(b => <option key={b._id} value={b._id}>{b.busNumber}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Route</label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={assignRouteData.routeId}
                  onChange={(e) => setAssignRouteData({ ...assignRouteData, routeId: e.target.value })}
                  required
                >
                  <option value="">-- Select Route --</option>
                  {routes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.routeName} ({r.origin} ➔ {r.destination})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2.5 justify-end pt-2">
                <button type="button" onClick={() => setShowAssignRouteModal(false)} className="px-4 py-2 border rounded-xl hover:bg-gray-50 text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm font-semibold shadow">Assign Route</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
