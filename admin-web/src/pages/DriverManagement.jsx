import React, { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import apiClient from '../services/api';

export default function DriverManagement() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      // We don't have a dedicated "get all drivers" endpoint, so let's add a query param to the auth or user endpoint.
      // For now, we'll call a custom endpoint we'll create.
      const res = await apiClient.get('/auth/users?role=driver');
      setDrivers(res.data.data || []);
    } catch (err) {
      console.error(err);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrivers(); }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/auth/register', {
        name: newDriver.name,
        email: newDriver.email,
        password: newDriver.password,
        role: 'driver',
      });
      setMessage({ text: `Driver "${newDriver.name}" registered!`, type: 'success' });
      setShowRegisterModal(false);
      setNewDriver({ name: '', email: '', password: '' });
      fetchDrivers();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to register driver', type: 'error' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete driver "${name}"?`)) return;
    try {
      await apiClient.delete(`/auth/users/${id}`);
      setMessage({ text: `Driver "${name}" deleted.`, type: 'success' });
      fetchDrivers();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to delete driver', type: 'error' });
    }
  };

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Driver Management</h1>
          <p className="text-gray-500">Register and manage bus drivers</p>
        </div>
        <button onClick={() => setShowRegisterModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <UserPlus size={18} /> Register Driver
        </button>
      </header>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
          {message.text}
          <button onClick={() => setMessage({ text: '', type: '' })} className="float-right font-bold">&times;</button>
        </div>
      )}

      {/* Drivers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-600">Name</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Email</th>
              <th className="p-4 text-sm font-semibold text-gray-600">ID (for assignment)</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Assigned Bus</th>
              <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading...</td></tr>
            ) : drivers.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-400">No drivers registered yet.</td></tr>
            ) : (
              drivers.map((driver) => (
                <tr key={driver._id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="p-4 font-semibold text-gray-800">{driver.name}</td>
                  <td className="p-4 text-gray-600">{driver.email}</td>
                  <td className="p-4 text-gray-500 text-xs font-mono">{driver._id}</td>
                  <td className="p-4 text-gray-600">
                    {driver.assignedBus?.busNumber || driver.assignedBus || <span className="text-gray-400 italic">None</span>}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(driver._id, driver.name)}
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

      {/* Register Driver Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Register New Driver</h2>
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input type="text" className="w-full p-2 border rounded-md" placeholder="John Doe"
                  value={newDriver.name} onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })} required />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full p-2 border rounded-md" placeholder="driver@company.com"
                  value={newDriver.email} onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })} required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input type="password" className="w-full p-2 border rounded-md" placeholder="Min 6 characters"
                  value={newDriver.password} onChange={(e) => setNewDriver({ ...newDriver, password: e.target.value })} required />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowRegisterModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
