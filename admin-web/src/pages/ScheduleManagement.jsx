import React, { useEffect, useState } from 'react';
import { Plus, Calendar, Clock, Trash2 } from 'lucide-react';
import apiClient from '../services/api';

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    bus: '',
    route: '',
    driver: '',
    startTime: '08:00 AM',
    endTime: '09:30 AM',
    operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedRes, busRes, routeRes, driverRes] = await Promise.all([
        apiClient.get('/schedules'),
        apiClient.get('/buses'),
        apiClient.get('/routes'),
        apiClient.get('/auth/users?role=driver'),
      ]);
      setSchedules(schedRes.data.data || []);
      setBuses(busRes.data.data || []);
      setRoutes(routeRes.data.data || []);
      setDrivers(driverRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/schedules', newSchedule);
      setMessage({ text: 'Trip Schedule created successfully!', type: 'success' });
      setShowModal(false);
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to create schedule', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip schedule?')) return;
    try {
      await apiClient.delete(`/schedules/${id}`);
      setMessage({ text: 'Schedule deleted.', type: 'success' });
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to delete schedule', type: 'error' });
    }
  };

  const toggleDay = (day) => {
    setNewSchedule((prev) => {
      const exists = prev.operatingDays.includes(day);
      return {
        ...prev,
        operatingDays: exists ? prev.operatingDays.filter(d => d !== day) : [...prev.operatingDays, day]
      };
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Trip Schedules & Timetables</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage route timetables, operating days, and assigned buses</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-blue-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 shadow-xs transition w-fit">
          <Plus size={16} /> Create Schedule
        </button>
      </header>

      {message.text && (
        <div className={`mb-4 p-3 rounded-xl border text-sm flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="font-bold text-lg leading-none ml-2">&times;</button>
        </div>
      )}

      {/* Schedules Table with Horizontal Scroll */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Route</th>
                <th className="p-4">Bus Number</th>
                <th className="p-4">Driver</th>
                <th className="p-4">Departure / Arrival</th>
                <th className="p-4">Operating Days</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading...</td></tr>
            ) : schedules.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-400">No schedules configured yet.</td></tr>
            ) : (
              schedules.map((s) => (
                <tr key={s._id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-800">
                    {s.route?.routeName || '—'}
                  </td>
                  <td className="p-4 text-gray-700 font-medium">
                    {s.bus?.busNumber || '—'}
                  </td>
                  <td className="p-4 text-gray-600">
                    {s.driver?.name || '—'}
                  </td>
                  <td className="p-4 text-gray-700">
                    <span className="flex items-center gap-1 font-semibold text-blue-600">
                      <Clock size={14} /> {s.startTime} - {s.endTime}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {s.operatingDays?.map((d) => (
                        <span key={d} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded font-mono">
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(s._id)}
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

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Create Trip Schedule</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Route</label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  value={newSchedule.route}
                  onChange={(e) => setNewSchedule({ ...newSchedule, route: e.target.value })}
                  required
                >
                  <option value="">-- Select Route --</option>
                  {routes.map(r => <option key={r._id} value={r._id}>{r.routeName}</option>)}
                </select>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bus</label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  value={newSchedule.bus}
                  onChange={(e) => setNewSchedule({ ...newSchedule, bus: e.target.value })}
                  required
                >
                  <option value="">-- Select Bus --</option>
                  {buses.map(b => <option key={b._id} value={b._id}>{b.busNumber}</option>)}
                </select>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Driver (Optional)</label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  value={newSchedule.driver}
                  onChange={(e) => setNewSchedule({ ...newSchedule, driver: e.target.value })}
                >
                  <option value="">-- Select Driver --</option>
                  {drivers.map(d => <option key={d._id} value={d._id}>{d.name} ({d.email})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    placeholder="08:00 AM"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">End Time</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    placeholder="09:30 AM"
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Operating Days</label>
                <div className="flex flex-wrap gap-1.5">
                  {allDays.map((day) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 text-xs rounded-xl font-semibold border transition ${
                        newSchedule.operatingDays.includes(day)
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl hover:bg-gray-50 text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold shadow">Create Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
