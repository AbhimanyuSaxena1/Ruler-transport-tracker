import React, { useEffect, useState } from 'react';
import {
  Bus,
  Map as MapIcon,
  Activity,
  Users,
  ArrowUpRight,
  Clock,
  ShieldAlert,
  MapPin,
  CheckCircle,
  ExternalLink,
  X,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import socket from '../services/socket';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getTileUrl, MAP_ATTRIBUTION, MAP_SUBDOMAINS } from '../utils/mapConfig';

const staleMapIcon = L.divIcon({
  className: 'dashboard-stale-icon',
  html: `
    <div class="relative flex items-center justify-center">
      <span class="absolute inline-flex h-8 w-8 rounded-full bg-red-600 opacity-40 animate-ping"></span>
      <div class="relative bg-red-600 text-white rounded-full p-2 border-2 border-white shadow-lg">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      </div>
      <div class="absolute -top-6 bg-red-950 text-red-100 text-[10px] font-black px-1.5 py-0.5 rounded border border-red-800 shadow whitespace-nowrap">
        STALE POSITION
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export default function DashboardOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ buses: 0, routes: 0, drivers: 0, schedules: 0 });
  const [offlineAlerts, setOfflineAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapAlert, setMapAlert] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [busesRes, routesRes, driversRes, schedulesRes, incidentsRes] = await Promise.all([
        apiClient.get('/buses'),
        apiClient.get('/routes'),
        apiClient.get('/auth/users?role=driver'),
        apiClient.get('/schedules'),
        apiClient.get('/incidents?status=OPEN'),
      ]);

      setStats({
        buses: busesRes.data.data?.length || busesRes.data.count || 0,
        routes: routesRes.data.data?.length || routesRes.data.count || 0,
        drivers: driversRes.data.data?.length || 0,
        schedules: schedulesRes.data.data?.length || 0,
      });

      setOfflineAlerts(incidentsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen to real-time offline alerts & recoveries via Socket.IO
    const onBusOffline = (alert) => {
      setOfflineAlerts((prev) => {
        const exists = prev.find((item) => String(item.busId) === String(alert.busId));
        if (exists) return prev;
        return [alert, ...prev];
      });
    };

    const onBusBackOnline = (recovery) => {
      setOfflineAlerts((prev) => prev.filter((item) => String(item.busId?._id || item.busId) !== String(recovery.busId)));
    };

    const onIncidentAcknowledged = (ack) => {
      setOfflineAlerts((prev) => prev.filter((item) => String(item._id) !== String(ack.incidentId)));
    };

    socket.on('bus:offline', onBusOffline);
    socket.on('bus:back_online', onBusBackOnline);
    socket.on('incident:acknowledged', onIncidentAcknowledged);

    return () => {
      socket.off('bus:offline', onBusOffline);
      socket.off('bus:back_online', onBusBackOnline);
      socket.off('incident:acknowledged', onIncidentAcknowledged);
    };
  }, []);

  const handleAcknowledge = async (incidentId) => {
    try {
      await apiClient.post(`/incidents/${incidentId}/acknowledge`, {
        notes: 'Acknowledged from System Dashboard alert panel',
      });
      setOfflineAlerts((prev) => prev.filter((i) => i._id !== incidentId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to acknowledge alert');
    }
  };

  const cards = [
    { label: 'Total Fleet', value: stats.buses, icon: Bus, link: '/fleet', color: 'bg-blue-500', lightColor: 'bg-blue-50 text-blue-600' },
    { label: 'Active Routes', value: stats.routes, icon: MapIcon, link: '/routes', color: 'bg-emerald-500', lightColor: 'bg-emerald-50 text-emerald-600' },
    { label: 'Registered Drivers', value: stats.drivers, icon: Users, link: '/drivers', color: 'bg-purple-500', lightColor: 'bg-purple-50 text-purple-600' },
    { label: 'Scheduled Trips', value: stats.schedules, icon: Clock, link: '/schedules', color: 'bg-amber-500', lightColor: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">System Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Real-time transit operations, metrics, and fleet readiness</p>
        </div>
        <Link
          to="/incidents"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm font-bold shadow-xs hover:bg-gray-50 transition w-fit"
        >
          <ShieldAlert size={16} className={offlineAlerts.length > 0 ? 'text-red-500' : 'text-gray-400'} />
          Incident Log {offlineAlerts.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-extrabold">{offlineAlerts.length}</span>}
        </Link>
      </header>

      {/* --- PROMINENT BUS OFFLINE ALERTS SECTION --- */}
      {offlineAlerts.length > 0 && (
        <section className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
              <h2 className="text-lg font-black text-red-600 uppercase tracking-wide">
                Active Outage Alerts ({offlineAlerts.length})
              </h2>
            </div>
            <Link to="/incidents" className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">
              View History <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offlineAlerts.map((alert) => {
              const lastSeenDate = alert.lastLocationAt ? new Date(alert.lastLocationAt) : null;
              const ageSeconds = lastSeenDate ? Math.floor((Date.now() - lastSeenDate.getTime()) / 1000) : 0;
              const formattedDuration = `${Math.floor(ageSeconds / 60)} minutes`;

              return (
                <div
                  key={alert._id || alert.busId}
                  className="bg-white rounded-2xl border-2 border-red-500/80 p-5 shadow-lg shadow-red-500/5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    🔴 OFFLINE
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <ShieldAlert size={26} />
                    </div>
                    <div className="flex-1 min-w-0 pr-16">
                      <h3 className="text-base font-black text-gray-900 tracking-tight">
                        Bus Offline Alert: Bus {alert.busNumber}
                      </h3>
                      <p className="text-xs text-red-600 font-semibold mt-0.5">
                        Reason: {alert.reason || 'No location received within timeout'}
                      </p>

                      <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400 font-semibold block">Vehicle</span>
                          <span className="font-extrabold text-gray-800">{alert.licensePlate || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold block">Driver</span>
                          <span className="font-extrabold text-gray-800">{alert.driverName || alert.driver || 'Assigned Driver'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold block">Last GPS Ping</span>
                          <span className="font-extrabold text-gray-800">
                            {lastSeenDate ? lastSeenDate.toLocaleTimeString() : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold block">Time Since Update</span>
                          <span className="font-extrabold text-red-600">{formattedDuration}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                        {alert.lastKnownLocation?.latitude && alert.lastKnownLocation?.longitude && (
                          <button
                            onClick={() => setMapAlert(alert)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold transition cursor-pointer"
                          >
                            <MapPin size={13} className="text-red-600" />
                            View on Map (Stale)
                          </button>
                        )}
                        <button
                          onClick={() => handleAcknowledge(alert._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          <CheckCircle size={13} />
                          Acknowledge Alert
                        </button>
                        <Link
                          to="/incidents"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition ml-auto"
                        >
                          Incident Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="group bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-gray-200/80 hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`p-3 rounded-xl ${card.lightColor} group-hover:scale-110 transition-transform`}>
                <card.icon size={22} />
              </span>
              <span className="text-gray-400 group-hover:text-gray-600 transition">
                <ArrowUpRight size={18} />
              </span>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                {loading ? '...' : card.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* System Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Activity size={22} />
          </div>
          <div>
            <div className="font-bold text-base flex items-center gap-2">
              Telemetric System Status
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Operational
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Live Socket.IO telemetry and Automated Fleet Offline Supervisor active.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            to="/incidents"
            className="w-full sm:w-auto text-center px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-bold rounded-xl transition border border-zinc-700"
          >
            Incident Center
          </Link>
          <Link
            to="/fleet"
            className="w-full sm:w-auto text-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow"
          >
            Monitor Live Fleet
          </Link>
        </div>
      </div>

      {/* Stale Location Leaflet Map Modal */}
      {mapAlert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200">
            <div className="p-4 bg-zinc-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  Last Known Location — Bus {mapAlert.busNumber}
                </h3>
                <p className="text-xs text-red-300 font-semibold mt-0.5">
                  ⚠️ STALE TELEMETRY: This bus is currently OFFLINE. Position was recorded at{' '}
                  {mapAlert.lastLocationAt ? new Date(mapAlert.lastLocationAt).toLocaleTimeString() : 'N/A'}.
                </p>
              </div>
              <button
                onClick={() => setMapAlert(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="h-80 w-full relative">
              <MapContainer
                center={[mapAlert.lastKnownLocation.latitude, mapAlert.lastKnownLocation.longitude]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution={MAP_ATTRIBUTION}
                  url={getTileUrl('voyager')}
                  subdomains={MAP_SUBDOMAINS}
                />
                <Marker
                  position={[mapAlert.lastKnownLocation.latitude, mapAlert.lastKnownLocation.longitude]}
                  icon={staleMapIcon}
                >
                  <Popup>
                    <div className="p-1">
                      <p className="font-bold text-red-600 text-xs uppercase tracking-wider">STALE POSITION (OFFLINE)</p>
                      <p className="font-extrabold text-sm">Bus {mapAlert.busNumber}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        GPS Recorded: {mapAlert.lastLocationAt ? new Date(mapAlert.lastLocationAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-xs text-gray-600">
                <span className="font-bold">Coordinates: </span>
                {mapAlert.lastKnownLocation.latitude.toFixed(5)}, {mapAlert.lastKnownLocation.longitude.toFixed(5)}
              </div>
              <button
                onClick={() => setMapAlert(null)}
                className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800"
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
