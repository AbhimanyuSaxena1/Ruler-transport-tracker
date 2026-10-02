import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getBuses, getRoutes, getSchedules } from '../services/api';
import socket from '../services/socket';
import L from 'leaflet';

// --- Custom Leaflet Marker Icons ---
const createBusDivIcon = (busNumber, heading = 0) => {
  return L.divIcon({
    className: 'custom-bus-icon',
    html: `
      <div class="relative group cursor-pointer flex items-center justify-center">
        <!-- Pulse ring -->
        <span class="absolute inline-flex h-10 w-10 rounded-full bg-blue-500 opacity-30 animate-ping"></span>
        <!-- Inner Bus Pin -->
        <div class="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-2.5 shadow-xl border-2 border-white flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8m-8 4h8m-8 4h8M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"></path>
          </svg>
        </div>
        <!-- Tooltip Label -->
        <div class="absolute -top-8 bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap opacity-90">
          Bus ${busNumber}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const createStopDivIcon = (isArrived, isNext) => {
  const bgColor = isArrived ? 'bg-emerald-500 ring-4 ring-emerald-200' : isNext ? 'bg-blue-600 ring-4 ring-blue-200' : 'bg-slate-700';
  return L.divIcon({
    className: 'custom-stop-icon',
    html: `
      <div class="flex items-center justify-center cursor-pointer group">
        <div class="w-4 h-4 rounded-full ${bgColor} border-2 border-white shadow-md transform transition-transform group-hover:scale-125"></div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

// Helper component to center map on selection
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function LiveMap() {
  const navigate = useNavigate();
  const [buses, setBuses] = useState({});
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [activeTab, setActiveTab] = useState('stops'); // 'stops' | 'timetable' | 'buses'
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedBuses, fetchedRoutes, fetchedSchedules] = await Promise.all([
          getBuses(),
          getRoutes(),
          getSchedules(),
        ]);

        const busMap = {};
        fetchedBuses.forEach((b) => {
          if (b.currentLocation?.latitude && b.currentLocation?.longitude) {
            busMap[b._id] = b;
          }
        });
        setBuses(busMap);
        setRoutes(fetchedRoutes);
        setSchedules(fetchedSchedules || []);

        if (fetchedRoutes.length > 0) {
          setSelectedRoute(fetchedRoutes[0]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    fetchData();

    socket.on('locationUpdate', (update) => {
      setBuses((prev) => ({
        ...prev,
        [update.busId]: {
          ...prev[update.busId],
          _id: update.busId,
          busNumber: update.busNumber,
          currentLocation: {
            latitude: update.latitude,
            longitude: update.longitude,
          },
          speed: update.speed,
          heading: update.heading,
          stopETAs: update.stopETAs || [],
        },
      }));
    });

    return () => {
      socket.off('locationUpdate');
    };
  }, []);

  // Filter routes by search query
  const filteredRoutes = routes.filter(
    (r) =>
      r.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeBusesList = Object.values(buses);

  const renderRoutePath = () => {
    if (!selectedRoute?.path?.coordinates) return null;
    const positions = selectedRoute.path.coordinates.map((c) => [c[1], c[0]]);

    return (
      <>
        <Polyline positions={positions} color="#3B82F6" weight={5} opacity={0.85} lineCap="round" />
        {selectedRoute.stops?.map((stop, idx) => {
          const lat = stop.location.coordinates[1];
          const lng = stop.location.coordinates[0];

          // Find live ETA info for this stop from active buses
          let etaBadge = null;
          activeBusesList.forEach((b) => {
            const foundEta = b.stopETAs?.find((s) => s.stopId === stop._id || s.stopName === stop.name);
            if (foundEta) {
              etaBadge = foundEta;
            }
          });

          return (
            <Marker
              key={stop._id || idx}
              position={[lat, lng]}
              icon={createStopDivIcon(etaBadge?.isArrived, etaBadge?.etaMinutes <= 3)}
            >
              <Popup className="rounded-xl shadow-xl">
                <div className="p-1">
                  <div className="font-bold text-gray-800 text-sm">{stop.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Stop #{idx + 1}</div>
                  {etaBadge && (
                    <div className={`mt-2 text-xs px-2 py-1 rounded-full font-bold text-center ${
                      etaBadge.isArrived ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {etaBadge.isArrived ? 'Arrived / At Stop' : `ETA: ~${etaBadge.etaMinutes} mins`}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </>
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 font-sans">
      {/* --- OutletBuddy Style Floating Control Panel (Left) --- */}
      <div className="absolute top-4 left-4 w-full max-w-sm md:max-w-md pointer-events-auto" style={{ zIndex: 1000 }}>
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden transition-all duration-300">
          
          {/* Header & Search Bar */}
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white">
            <div className="flex items-center justify-between mb-3">
              <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md font-extrabold text-sm">
                  MP
                </div>
                <span className="font-black text-lg tracking-tight text-slate-800">
                  Metro<span className="text-blue-600">Pulse</span>
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {activeBusesList.length} Live Buses
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search route or station..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100/80 hover:bg-gray-100 focus:bg-white border border-gray-200 focus:border-blue-500 rounded-2xl text-sm font-medium focus:outline-none transition"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Route Selector Pills */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
              {filteredRoutes.map((r) => (
                <button
                  key={r._id}
                  onClick={() => {
                    setSelectedRoute(r);
                    if (r.path?.coordinates?.length > 0) {
                      setMapCenter([r.path.coordinates[0][1], r.path.coordinates[0][0]]);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedRoute?._id === r._id
                      ? 'bg-slate-900 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {r.routeName}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100 bg-gray-50/50 p-1">
            {[
              { id: 'stops', label: 'Route Stops' },
              { id: 'buses', label: `Active Fleet (${activeBusesList.length})` },
              { id: 'timetable', label: 'Schedule' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel Content Area */}
          <div className="p-4 max-h-[50vh] overflow-y-auto space-y-3">
            {/* STOPS TAB */}
            {activeTab === 'stops' && (
              <div>
                {selectedRoute ? (
                  <div>
                    <div className="mb-3 p-3 bg-blue-50/80 rounded-2xl border border-blue-100">
                      <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Selected Route</div>
                      <div className="font-extrabold text-slate-800 text-base">{selectedRoute.routeName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {selectedRoute.origin} ➔ {selectedRoute.destination}
                      </div>
                    </div>

                    {/* Timeline List */}
                    <div className="relative pl-6 space-y-4 my-2">
                      <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-blue-200"></div>

                      {selectedRoute.stops?.map((stop, idx) => {
                        let etaBadge = null;
                        activeBusesList.forEach((b) => {
                          const found = b.stopETAs?.find((s) => s.stopId === stop._id || s.stopName === stop.name);
                          if (found) etaBadge = found;
                        });

                        return (
                          <div key={stop._id || idx} className="relative flex items-center justify-between group">
                            {/* Dot */}
                            <div className={`absolute -left-6 w-3 h-3 rounded-full border-2 border-white shadow ${
                              etaBadge?.isArrived ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-blue-600'
                            }`}></div>

                            <div>
                              <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition">
                                {stop.name}
                              </div>
                              <div className="text-xs text-gray-400">Stop #{idx + 1}</div>
                            </div>

                            {etaBadge && (
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                etaBadge.isArrived
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse'
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}>
                                {etaBadge.isArrived ? 'Arrived' : `~${etaBadge.etaMinutes} mins`}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">Select a route above to view stops.</p>
                )}
              </div>
            )}

            {/* BUSES TAB */}
            {activeTab === 'buses' && (
              <div className="space-y-2">
                {activeBusesList.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No buses currently broadcasting GPS.</p>
                ) : (
                  activeBusesList.map((bus) => (
                    <div
                      key={bus._id}
                      onClick={() => setMapCenter([bus.currentLocation.latitude, bus.currentLocation.longitude])}
                      className="p-3 bg-gray-50/80 hover:bg-blue-50/60 rounded-2xl border border-gray-200/80 cursor-pointer transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                          {bus.busNumber.replace('BUS-', '')}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">Bus {bus.busNumber}</div>
                          <div className="text-xs text-gray-500">Speed: {Math.round(bus.speed)} km/h</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                        Live GPS
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TIMETABLE TAB */}
            {activeTab === 'timetable' && (
              <div className="space-y-2">
                {schedules.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No departure schedules posted.</p>
                ) : (
                  schedules
                    .filter((s) => !selectedRoute || s.route?._id === selectedRoute._id)
                    .map((s) => (
                      <div key={s._id} className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
                        <div className="flex justify-between items-center font-bold text-slate-800 text-sm">
                          <span>{s.route?.routeName || 'Scheduled Trip'}</span>
                          <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs">
                            {s.startTime}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex justify-between">
                          <span>Vehicle: {s.bus?.busNumber || 'Assigned'}</span>
                          <span>Days: {s.operatingDays?.join(', ')}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* --- Fullscreen Map View with CartoDB Voyager Tile --- */}
      <MapContainer center={mapCenter} zoom={12} zoomControl={false} style={{ height: '100vh', width: '100vw' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={mapCenter} />

        {renderRoutePath()}

        {activeBusesList.map((bus) => (
          <Marker
            key={bus._id}
            position={[bus.currentLocation.latitude, bus.currentLocation.longitude]}
            icon={createBusDivIcon(bus.busNumber, bus.heading)}
          >
            <Popup className="rounded-xl shadow-xl">
              <div className="p-1">
                <div className="font-extrabold text-blue-600 text-base">Bus {bus.busNumber}</div>
                <div className="text-xs text-gray-600 mt-1">Live Speed: {Math.round(bus.speed)} km/h</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
