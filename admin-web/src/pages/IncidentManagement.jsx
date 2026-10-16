import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Sliders,
  ShieldAlert,
  X,
  ExternalLink,
  Radio,
  Eye
} from 'lucide-react';
import apiClient from '../services/api';
import socket from '../services/socket';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getTileUrl, MAP_ATTRIBUTION, MAP_SUBDOMAINS } from '../utils/mapConfig';

// Leaflet icon for stale last-known position
const staleBusIcon = L.divIcon({
  className: 'custom-stale-bus-icon',
  html: `
    <div class="relative flex items-center justify-center">
      <span class="absolute inline-flex h-8 w-8 rounded-full bg-red-500 opacity-30 animate-ping"></span>
      <div class="relative bg-red-600 text-white rounded-full p-2 border-2 border-white shadow-lg">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      </div>
      <div class="absolute -top-6 bg-red-950 text-red-200 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-red-800 shadow whitespace-nowrap">
        STALE POSITION
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export default function IncidentManagement() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [mapIncident, setMapIncident] = useState(null);

  // Configuration Modal state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configData, setConfigData] = useState({
    interruptedTimeoutSeconds: 30,
    offlineTimeoutSeconds: 120,
    checkIntervalSeconds: 10,
    recoveryFreshnessSeconds: 60,
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchIncidents = async () => {
    try {
      const res = await apiClient.get('/incidents?limit=100');
      setIncidents(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch incidents', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await apiClient.get('/incidents/config');
      if (res.data.data) {
        setConfigData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch offline timeout config', err);
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchConfig();

    // Real-time socket listeners
    const handleBusOffline = (alert) => {
      fetchIncidents();
      setNotification({
        type: 'danger',
        title: '🔴 Bus Offline Alert',
        message: `Bus ${alert.busNumber} has ceased transmitting GPS signals (> ${alert.timeSinceLastUpdateFormatted || 'timeout'}).`,
      });
    };

    const handleBackOnline = (recovery) => {
      fetchIncidents();
      setNotification({
        type: 'success',
        title: '🟢 Bus Back Online',
        message: `Bus ${recovery.busNumber} has recovered and is transmitting live GPS telemetry.`,
      });
    };

    const handleAcknowledged = () => {
      fetchIncidents();
    };

    socket.on('bus:offline', handleBusOffline);
    socket.on('bus:back_online', handleBackOnline);
    socket.on('incident:acknowledged', handleAcknowledged);

    return () => {
      socket.off('bus:offline', handleBusOffline);
      socket.off('bus:back_online', handleBackOnline);
      socket.off('incident:acknowledged', handleAcknowledged);
    };
  }, []);

  const handleAcknowledge = async (id) => {
    try {
      await apiClient.post(`/incidents/${id}/acknowledge`, { notes: 'Acknowledged via Admin Dashboard' });
      fetchIncidents();
      if (selectedIncident && selectedIncident._id === id) {
        setSelectedIncident((prev) => ({ ...prev, status: 'ACKNOWLEDGED', acknowledgedAt: new Date() }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to acknowledge incident');
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await apiClient.put('/incidents/config', configData);
      setShowConfigModal(false);
      alert('Monitoring thresholds updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  const filtered = incidents.filter((inc) => {
    if (activeFilter === 'ALL') return true;
    return inc.status === activeFilter;
  });

  const openCount = incidents.filter((i) => i.status === 'OPEN').length;
  const acknowledgedCount = incidents.filter((i) => i.status === 'ACKNOWLEDGED').length;
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between shadow-lg transition-all ${
          notification.type === 'danger'
            ? 'bg-red-950/90 border-red-700 text-white'
            : 'bg-emerald-950/90 border-emerald-700 text-white'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'danger' ? (
              <ShieldAlert size={22} className="text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
            )}
            <div>
              <p className="font-extrabold text-sm">{notification.title}</p>
              <p className="text-xs text-zinc-300 mt-0.5">{notification.message}</p>
            </div>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <ShieldAlert size={28} className="text-red-600" />
            Incidents & Offline Monitoring
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Centralized telemetry supervisor, heartbeat detection & outage resolution
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-xl shadow-xs transition"
          >
            <Sliders size={15} /> Configure Thresholds
          </button>
          <button
            onClick={() => { setLoading(true); fetchIncidents(); }}
            className="flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-xl shadow-xs transition"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </header>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Recorded</span>
          <p className="text-2xl font-black text-gray-900 mt-1">{incidents.length}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-2xl border border-red-200 shadow-xs">
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            Open Outages
          </span>
          <p className="text-2xl font-black text-red-700 mt-1">{openCount}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Acknowledged</span>
          <p className="text-2xl font-black text-amber-800 mt-1">{acknowledgedCount}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Recovered</span>
          <p className="text-2xl font-black text-emerald-800 mt-1">{resolvedCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {['ALL', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeFilter === filter
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {filter} {filter === 'OPEN' && openCount > 0 && `(${openCount})`}
          </button>
        ))}
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Bus & Vehicle</th>
                <th className="p-4">Driver & Route</th>
                <th className="p-4">Status</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Last GPS Ping</th>
                <th className="p-4">Detected At</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">Loading incident history...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    No {activeFilter.toLowerCase()} incidents recorded. Fleet operations are nominal.
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => (
                  <tr key={inc._id} className="hover:bg-gray-50/60 transition">
                    <td className="p-4">
                      <div className="font-extrabold text-gray-900">{inc.busNumber}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{inc.licensePlate || 'No License Plate'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{inc.driverName || 'Unassigned'}</div>
                      <div className="text-[11px] text-gray-500">{inc.routeName || 'Unassigned Route'}</div>
                    </td>
                    <td className="p-4">
                      {inc.status === 'OPEN' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-700 border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                          OPEN OFFLINE
                        </span>
                      ) : inc.status === 'ACKNOWLEDGED' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          ACKNOWLEDGED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={12} /> RESOLVED
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-gray-700 font-medium">{inc.reason || 'NO_RECENT_LOCATION'}</span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {inc.lastLocationAt ? new Date(inc.lastLocationAt).toLocaleTimeString() : 'N/A'}
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(inc.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inc.status === 'OPEN' && (
                          <button
                            onClick={() => handleAcknowledge(inc._id)}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-xs transition"
                          >
                            Acknowledge
                          </button>
                        )}
                        {inc.lastKnownLocation?.latitude && inc.lastKnownLocation?.longitude && (
                          <button
                            onClick={() => setMapIncident(inc)}
                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"
                            title="View Last Known Location"
                          >
                            <MapPin size={13} className="text-red-500" /> Map
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedIncident(inc)}
                          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"
                        >
                          <Eye size={13} /> Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- View Map Modal with STALE Labeling --- */}
      {mapIncident && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200">
            <div className="p-4 bg-zinc-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  Last Known Position — Bus {mapIncident.busNumber}
                </h3>
                <p className="text-xs text-red-300 font-semibold mt-0.5">
                  ⚠️ STALE TELEMETRY: This is the last recorded location prior to disconnection.
                </p>
              </div>
              <button
                onClick={() => setMapIncident(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="h-80 w-full relative">
              <MapContainer
                center={[mapIncident.lastKnownLocation.latitude, mapIncident.lastKnownLocation.longitude]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution={MAP_ATTRIBUTION}
                  url={getTileUrl('voyager')}
                  subdomains={MAP_SUBDOMAINS}
                />
                <Marker
                  position={[mapIncident.lastKnownLocation.latitude, mapIncident.lastKnownLocation.longitude]}
                  icon={staleBusIcon}
                >
                  <Popup>
                    <div className="p-1">
                      <p className="font-bold text-red-600 text-xs uppercase tracking-wider">Last Known Location (Stale)</p>
                      <p className="font-extrabold text-sm">Bus {mapIncident.busNumber}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        GPS Recorded: {mapIncident.lastLocationAt ? new Date(mapIncident.lastLocationAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-xs text-gray-600">
                <span className="font-bold">Coordinates: </span>
                {mapIncident.lastKnownLocation.latitude.toFixed(5)}, {mapIncident.lastKnownLocation.longitude.toFixed(5)}
              </div>
              <button
                onClick={() => setMapIncident(null)}
                className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800"
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Incident Details Modal --- */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert size={20} className="text-red-600" />
                <h3 className="text-lg font-black text-gray-900">Incident Details: Bus {selectedIncident.busNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-semibold">Incident ID</span>
                <span className="font-mono text-gray-800">{selectedIncident._id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-semibold">Current Status</span>
                <span className="font-bold text-gray-900">{selectedIncident.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-semibold">Assigned Driver</span>
                <span className="font-bold text-gray-800">{selectedIncident.driverName || 'None'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-semibold">Assigned Route</span>
                <span className="font-bold text-gray-800">{selectedIncident.routeName || 'None'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-semibold">Detection Reason</span>
                <span className="font-bold text-gray-800">{selectedIncident.reason}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-semibold">Detected At</span>
                <span className="font-semibold text-gray-700">{new Date(selectedIncident.detectedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 font-semibold">Last GPS Timestamp</span>
                <span className="font-semibold text-gray-700">
                  {selectedIncident.lastLocationAt ? new Date(selectedIncident.lastLocationAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              {selectedIncident.acknowledgedAt && (
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 font-semibold">Acknowledged At</span>
                  <span className="font-semibold text-amber-700">{new Date(selectedIncident.acknowledgedAt).toLocaleString()}</span>
                </div>
              )}
              {selectedIncident.recoveredAt && (
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 font-semibold">Recovered At</span>
                  <span className="font-semibold text-emerald-700">{new Date(selectedIncident.recoveredAt).toLocaleString()}</span>
                </div>
              )}
              {selectedIncident.deduplicationKey && (
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 font-semibold">Deduplication Key</span>
                  <span className="font-mono text-[11px] text-gray-400 truncate max-w-[200px]">{selectedIncident.deduplicationKey}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {selectedIncident.status === 'OPEN' && (
                <button
                  onClick={() => handleAcknowledge(selectedIncident._id)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Acknowledge Incident
                </button>
              )}
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Configure Thresholds Modal --- */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Sliders size={20} className="text-blue-600" />
                Fleet Heartbeat Thresholds
              </h3>
              <button onClick={() => setShowConfigModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Warning / Interrupted Timeout (Seconds)
                </label>
                <input
                  type="number"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={configData.interruptedTimeoutSeconds}
                  onChange={(e) => setConfigData({ ...configData, interruptedTimeoutSeconds: parseInt(e.target.value) })}
                  min="5"
                  required
                />
                <span className="text-[11px] text-gray-400">Default: 30s. Triggers SUSPECTED_OFFLINE / warning.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Offline Outage Timeout (Seconds)
                </label>
                <input
                  type="number"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={configData.offlineTimeoutSeconds}
                  onChange={(e) => setConfigData({ ...configData, offlineTimeoutSeconds: parseInt(e.target.value) })}
                  min="10"
                  required
                />
                <span className="text-[11px] text-gray-400">Default: 120s. Creates persistent incident & emits alert.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Fleet Scan Check Interval (Seconds)
                </label>
                <input
                  type="number"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={configData.checkIntervalSeconds}
                  onChange={(e) => setConfigData({ ...configData, checkIntervalSeconds: parseInt(e.target.value) })}
                  min="2"
                  required
                />
                <span className="text-[11px] text-gray-400">Frequency of background monitoring sweep across all buses.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Recovery Freshness Window (Seconds)
                </label>
                <input
                  type="number"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={configData.recoveryFreshnessSeconds}
                  onChange={(e) => setConfigData({ ...configData, recoveryFreshnessSeconds: parseInt(e.target.value) })}
                  min="5"
                  required
                />
                <span className="text-[11px] text-gray-400">Locations older than this (queued historical playback) will NOT trigger online recovery.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow"
                >
                  {savingConfig ? 'Saving...' : 'Apply Thresholds'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
