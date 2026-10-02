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
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Fleet Management</h1>
          <p className="text-gray-500">Manage buses, assign drivers, and routes</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            <Plus size={18} /> Add Bus
          </button>
          <button onClick={() => setShowAssignDriverModal(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
            <UserPlus size={18} /> Assign Driver
          </button>
          <button onClick={() => setShowAssignRouteModal(true)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
            <MapPin size={18} /> Assign Route
          </button>
        </div>
      </header>

      {/* Flash Message */}
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
          {message.text}
          <button onClick={() => setMessage({ text: '', type: '' })} className="float-right font-bold">&times;</button>
        </div>
      )}

      {/* Buses Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-600">Bus Number</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Capacity</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Assigned Driver</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Assigned Route</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Last Location Update</th>
              <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
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

      {/* Create Bus Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Register New Bus</h2>
            <form onSubmit={handleCreateBus}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bus Number</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
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
                  className="w-full p-2 border rounded-md"
                  value={newBus.capacity}
                  onChange={(e) => setNewBus({ ...newBus, capacity: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Bus</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {showAssignDriverModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Assign Driver to Bus</h2>
            <form onSubmit={handleAssignDriver}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Bus</label>
                <select className="w-full p-2 border rounded-md" value={assignDriverData.busId} onChange={(e) => setAssignDriverData({ ...assignDriverData, busId: e.target.value })} required>
                  <option value="">-- Select Bus --</option>
                  {buses.map(b => <option key={b._id} value={b._id}>{b.busNumber}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Driver</label>
                <select
                  className="w-full p-2 border rounded-md"
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
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowAssignDriverModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Route Modal */}
      {showAssignRouteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Assign Route to Bus</h2>
            <form onSubmit={handleAssignRoute}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Bus</label>
                <select className="w-full p-2 border rounded-md" value={assignRouteData.busId} onChange={(e) => setAssignRouteData({ ...assignRouteData, busId: e.target.value })} required>
                  <option value="">-- Select Bus --</option>
                  {buses.map(b => <option key={b._id} value={b._id}>{b.busNumber}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Route</label>
                <select className="w-full p-2 border rounded-md" value={assignRouteData.routeId} onChange={(e) => setAssignRouteData({ ...assignRouteData, routeId: e.target.value })} required>
                  <option value="">-- Select Route --</option>
                  {routes.map(r => <option key={r._id} value={r._id}>{r.routeName}</option>)}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowAssignRouteModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
