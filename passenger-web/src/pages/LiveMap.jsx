import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getBuses, getRoutes, getSchedules } from '../services/api';
import socket from '../services/socket';
import L from 'leaflet';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Bus as BusIcon,
  Sun,
  Moon,
  ArrowLeft,
  Navigation,
  Clock,
  Radio,
  MapPin
} from 'lucide-react';

// --- Custom Minimalist Leaflet Marker Icons ---
const createBusDivIcon = (busNumber, isDark = true) => {
  const pinBg = isDark
    ? 'bg-white text-zinc-950 border-zinc-900'
    : 'bg-zinc-950 text-white border-white';
  const tagBg = isDark
    ? 'bg-zinc-950 text-white border-zinc-800'
    : 'bg-white text-zinc-950 border-zinc-200';
  const ringColor = isDark ? 'bg-zinc-400' : 'bg-zinc-700';

  return L.divIcon({
    className: 'custom-bus-icon',
    html: `
      <div class="relative group cursor-pointer flex items-center justify-center">
        <!-- Subtle pulse ring -->
        <span class="absolute inline-flex h-9 w-9 rounded-full ${ringColor} opacity-20 animate-ping"></span>
        <!-- Inner Bus Pin -->
        <div class="relative ${pinBg} rounded-full p-2 shadow-xl border-2 flex items-center justify-center transform transition-transform duration-200 group-hover:scale-110">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h8m-8 4h8m-8 4h8M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"></path>
          </svg>
        </div>
        <!-- Tooltip Label -->
        <div class="absolute -top-7 ${tagBg} text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-md whitespace-nowrap opacity-95">
          Bus ${busNumber}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const createStopDivIcon = (isArrived, isNext, isDark = true) => {
  let innerClass = isDark ? 'bg-zinc-600 border-zinc-900' : 'bg-zinc-400 border-white';
  if (isArrived) {
    innerClass = 'bg-emerald-500 border-white ring-2 ring-emerald-500/30';
  } else if (isNext) {
    innerClass = isDark
      ? 'bg-white border-zinc-900 ring-2 ring-white/30'
      : 'bg-zinc-950 border-white ring-2 ring-black/20';
  }

  return L.divIcon({
    className: 'custom-stop-icon',
    html: `
      <div class="flex items-center justify-center cursor-pointer group">
        <div class="w-3.5 h-3.5 rounded-full ${innerClass} border-2 shadow-md transform transition-transform group-hover:scale-125"></div>
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
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [buses, setBuses] = useState({});
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [activeTab, setActiveTab] = useState('stops'); // 'stops' | 'timetable' | 'buses'
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.209]);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  // Light / Dark Theme State synchronized with localStorage
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('metropulse-theme');
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    localStorage.setItem('metropulse-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';

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
          // If query matches a route, pick that route
          if (initialSearch) {
            const match = fetchedRoutes.find((r) =>
              r.routeName.toLowerCase().includes(initialSearch.toLowerCase())
            );
            setSelectedRoute(match || fetchedRoutes[0]);
          } else {
            setSelectedRoute(fetchedRoutes[0]);
          }
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
  }, [initialSearch]);

  // Filter routes & buses by search query
  const searchLower = searchQuery.toLowerCase().trim();

  const filteredBuses = Object.values(buses).filter(
    (b) =>
      b.busNumber?.toLowerCase().includes(searchLower) ||
      (b.assignedRoute?.routeName &&
        b.assignedRoute.routeName.toLowerCase().includes(searchLower))
  );

  const filteredRoutes = routes.filter((r) => {
    if (!searchLower) return true;
    const matchesRoute =
      r.routeName.toLowerCase().includes(searchLower) ||
      r.origin.toLowerCase().includes(searchLower) ||
      r.destination.toLowerCase().includes(searchLower);
    const matchesBusNumber = filteredBuses.some((b) => {
      const bRouteId = b.assignedRoute?._id || b.assignedRoute;
      return bRouteId && String(bRouteId) === String(r._id);
    });
    return matchesRoute || matchesBusNumber;
  });

  const activeBusesList = Object.values(buses);

  // Attached buses for the currently selected route
  const attachedBuses = activeBusesList.filter((b) => {
    const bRouteId = b.assignedRoute?._id || b.assignedRoute;
    return selectedRoute && bRouteId && String(bRouteId) === String(selectedRoute._id);
  });

  const handleSelectRoute = (route) => {
    setSelectedRoute(route);
    // Find if any live bus is assigned to this route
    const liveBus = activeBusesList.find((b) => {
      const bRouteId = b.assignedRoute?._id || b.assignedRoute;
      return bRouteId && String(bRouteId) === String(route._id);
    });

    if (
      liveBus &&
      liveBus.currentLocation?.latitude &&
      liveBus.currentLocation?.longitude
    ) {
      setMapCenter([
        liveBus.currentLocation.latitude,
        liveBus.currentLocation.longitude,
      ]);
    } else if (route.path?.coordinates?.length > 0) {
      setMapCenter([route.path.coordinates[0][1], route.path.coordinates[0][0]]);
    }
  };

  const handleSelectBus = (bus) => {
    if (bus.currentLocation?.latitude && bus.currentLocation?.longitude) {
      setMapCenter([bus.currentLocation.latitude, bus.currentLocation.longitude]);
    }
    // Auto-select route if assigned
    const bRouteId = bus.assignedRoute?._id || bus.assignedRoute;
    if (bRouteId) {
      const matchingRoute = routes.find((r) => String(r._id) === String(bRouteId));
      if (matchingRoute) {
        setSelectedRoute(matchingRoute);
      }
    }
  };

  const renderRoutePath = () => {
    if (!selectedRoute?.path?.coordinates) return null;
    const positions = selectedRoute.path.coordinates.map((c) => [c[1], c[0]]);
    const polylineColor = isDark ? '#ffffff' : '#18181b';

    return (
      <>
        <Polyline
          positions={positions}
          color={polylineColor}
          weight={4}
          opacity={0.85}
          lineCap="round"
        />
        {selectedRoute.stops?.map((stop, idx) => {
          const lat = stop.location.coordinates[1];
          const lng = stop.location.coordinates[0];

          // Find live ETA info for this stop from active buses
          let etaBadge = null;
          activeBusesList.forEach((b) => {
            const foundEta = b.stopETAs?.find(
              (s) => s.stopId === stop._id || s.stopName === stop.name
            );
            if (foundEta) {
              etaBadge = foundEta;
            }
          });

          return (
            <Marker
              key={stop._id || idx}
              position={[lat, lng]}
              icon={createStopDivIcon(
                etaBadge?.isArrived,
                etaBadge?.etaMinutes <= 3,
                isDark
              )}
            >
              <Popup className="rounded-2xl shadow-xl">
                <div className="p-1">
                  <div
                    className={`font-bold text-sm ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    {stop.name}
                  </div>
                  <div
                    className={`text-xs mt-0.5 ${
                      isDark ? 'text-zinc-400' : 'text-zinc-500'
                    }`}
                  >
                    Stop #{idx + 1}
                  </div>
                  {etaBadge && (
                    <div
                      className={`mt-2 text-xs px-2.5 py-1 rounded-full font-bold text-center border ${
                        etaBadge.isArrived
                          ? isDark
                            ? 'bg-zinc-900 border-zinc-800 text-emerald-400'
                            : 'bg-zinc-100 border-zinc-200 text-emerald-700'
                          : isDark
                          ? 'bg-zinc-900 border-zinc-800 text-white'
                          : 'bg-zinc-100 border-zinc-200 text-zinc-950'
                      }`}
                    >
                      {etaBadge.isArrived
                        ? 'Arrived / At Stop'
                        : `ETA: ~${etaBadge.etaMinutes} mins`}
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

  // CartoDB Tile URL based on current theme
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <div
      className={`relative w-full h-screen overflow-hidden font-sans transition-colors duration-300 ${
        isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#fafafa] text-zinc-900'
      }`}
    >
      {/* --- Hand-Coded Minimalist Floating Control Panel (Left) --- */}
      <div
        className="absolute top-3 left-3 right-3 sm:right-auto sm:left-4 sm:top-4 sm:w-80 md:w-96 pointer-events-auto"
        style={{ zIndex: 1000 }}
      >
        <div
          className={`rounded-3xl border transition-all duration-300 backdrop-blur-2xl overflow-hidden ${
            isDark
              ? 'bg-zinc-950/90 border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
              : 'bg-white/95 border-zinc-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.08)]'
          }`}
        >
          {/* Header & Search Bar */}
          <div
            className={`p-4 sm:p-5 border-b transition-colors duration-200 ${
              isDark ? 'border-zinc-800/80 bg-zinc-950' : 'border-zinc-100 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              {/* Brand Logo & Back Action */}
              <div
                onClick={() => navigate('/')}
                className="flex items-center gap-2.5 cursor-pointer group"
                title="Return to Welcome Page"
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                    isDark ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'
                  }`}
                >
                  <BusIcon className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-bold text-base tracking-tight ${
                      isDark ? 'text-white' : 'text-zinc-950'
                    }`}
                  >
                    MetroPulse
                  </span>
                </div>
              </div>

              {/* Action Buttons: Live Indicator, Theme Switcher & Collapse */}
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
                      : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {activeBusesList.length} Live
                </span>

                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                    isDark
                      ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
                      : 'border-zinc-200 bg-zinc-100 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200'
                  }`}
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDark ? <Sun size={13} /> : <Moon size={13} />}
                </button>

                {/* Collapse toggle (Mobile) */}
                <button
                  onClick={() => setPanelCollapsed((p) => !p)}
                  className={`md:hidden p-1.5 rounded-full border transition cursor-pointer ${
                    isDark
                      ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                      : 'border-zinc-200 bg-zinc-100 text-zinc-600 hover:text-zinc-950'
                  }`}
                  aria-label={panelCollapsed ? 'Expand panel' : 'Collapse panel'}
                >
                  {panelCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
              </div>
            </div>

            {/* Collapsible Body */}
            {!panelCollapsed && (
              <>
                {/* Search Input */}
                <div className="relative mt-1">
                  <Search
                    className={`w-4 h-4 absolute left-3.5 top-3 ${
                      isDark ? 'text-zinc-500' : 'text-zinc-400'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Search bus number or route..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm font-normal border transition-colors focus:outline-none ${
                      isDark
                        ? 'bg-zinc-900/80 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-600'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-950 placeholder-zinc-400 focus:border-zinc-950'
                    }`}
                  />
                </div>

                {/* Route Selector Pills */}
                <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar">
                  {filteredRoutes.map((r) => (
                    <button
                      key={r._id}
                      onClick={() => handleSelectRoute(r)}
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                        selectedRoute?._id === r._id
                          ? isDark
                            ? 'bg-white text-zinc-950 border-white font-semibold'
                            : 'bg-zinc-950 text-white border-zinc-950 font-semibold'
                          : isDark
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                          : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:border-zinc-300'
                      }`}
                    >
                      {r.routeName}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Tab Navigation & Content */}
          {!panelCollapsed && (
            <>
              {/* Tab Navigation */}
              <div
                className={`flex border-b p-1 transition-colors ${
                  isDark
                    ? 'border-zinc-800 bg-zinc-900/60'
                    : 'border-zinc-100 bg-zinc-50/80'
                }`}
              >
                {[
                  { id: 'stops', label: 'Route Stops' },
                  { id: 'buses', label: `Fleet (${filteredBuses.length})` },
                  { id: 'timetable', label: 'Schedule' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? isDark
                          ? 'bg-zinc-800 text-white shadow-2xs'
                          : 'bg-white text-zinc-950 shadow-2xs'
                        : isDark
                        ? 'text-zinc-400 hover:text-zinc-200'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Panel Content Area */}
              <div className="p-3 sm:p-4 max-h-[35vh] sm:max-h-[50vh] overflow-y-auto space-y-3">
                {/* STOPS TAB */}
                {activeTab === 'stops' && (
                  <div>
                    {selectedRoute ? (
                      <div>
                        {/* Selected Route Info Card */}
                        <div
                          className={`mb-2 p-3 rounded-2xl border ${
                            isDark
                              ? 'bg-zinc-900/70 border-zinc-800'
                              : 'bg-zinc-50 border-zinc-200'
                          }`}
                        >
                          <div
                            className={`text-[10px] font-semibold uppercase tracking-wider ${
                              isDark ? 'text-zinc-400' : 'text-zinc-500'
                            }`}
                          >
                            Selected Route
                          </div>
                          <div
                            className={`font-bold text-sm sm:text-base mt-0.5 ${
                              isDark ? 'text-white' : 'text-zinc-950'
                            }`}
                          >
                            {selectedRoute.routeName}
                          </div>
                          <div
                            className={`text-xs mt-0.5 ${
                              isDark ? 'text-zinc-400' : 'text-zinc-500'
                            }`}
                          >
                            {selectedRoute.origin} ➔ {selectedRoute.destination}
                          </div>
                        </div>

                        {/* Attached Bus Banner / Detector */}
                        <div
                          className={`mb-3 p-3 rounded-2xl border ${
                            isDark
                              ? 'bg-zinc-900/90 border-zinc-800'
                              : 'bg-zinc-50 border-zinc-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border ${
                                  isDark
                                    ? 'bg-zinc-800 border-zinc-700 text-white'
                                    : 'bg-white border-zinc-200 text-zinc-950'
                                }`}
                              >
                                <BusIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <div
                                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                                    isDark ? 'text-zinc-400' : 'text-zinc-500'
                                  }`}
                                >
                                  Attached Bus
                                </div>
                                <div
                                  className={`font-bold text-xs sm:text-sm ${
                                    isDark ? 'text-white' : 'text-zinc-950'
                                  }`}
                                >
                                  {attachedBuses.length > 0
                                    ? `Bus ${attachedBuses[0].busNumber}`
                                    : 'No live bus attached'}
                                </div>
                              </div>
                            </div>
                            {attachedBuses.length > 0 && (
                              <button
                                onClick={() => handleSelectBus(attachedBuses[0])}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                                  isDark
                                    ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                                    : 'bg-zinc-950 text-white hover:bg-zinc-800'
                                }`}
                              >
                                Locate Bus
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Timeline List */}
                        <div className="relative pl-6 space-y-4 my-2">
                          <div
                            className={`absolute left-2.5 top-3 bottom-3 w-px ${
                              isDark ? 'bg-zinc-800' : 'bg-zinc-200'
                            }`}
                          ></div>

                          {selectedRoute.stops?.map((stop, idx) => {
                            let etaBadge = null;
                            activeBusesList.forEach((b) => {
                              const found = b.stopETAs?.find(
                                (s) =>
                                  s.stopId === stop._id || s.stopName === stop.name
                              );
                              if (found) etaBadge = found;
                            });

                            return (
                              <div
                                key={stop._id || idx}
                                className="relative flex items-center justify-between group"
                              >
                                {/* Dot */}
                                <div
                                  className={`absolute -left-6 w-2.5 h-2.5 rounded-full border ${
                                    etaBadge?.isArrived
                                      ? 'bg-emerald-500 border-white ring-2 ring-emerald-500/20'
                                      : isDark
                                      ? 'bg-zinc-500 border-zinc-900'
                                      : 'bg-zinc-400 border-white'
                                  }`}
                                ></div>

                                <div>
                                  <div
                                    className={`text-xs sm:text-sm font-semibold transition ${
                                      isDark
                                        ? 'text-zinc-200 group-hover:text-white'
                                        : 'text-zinc-800 group-hover:text-zinc-950'
                                    }`}
                                  >
                                    {stop.name}
                                  </div>
                                  <div
                                    className={`text-[11px] ${
                                      isDark ? 'text-zinc-500' : 'text-zinc-400'
                                    }`}
                                  >
                                    Stop #{idx + 1}
                                  </div>
                                </div>

                                {etaBadge && (
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                      etaBadge.isArrived
                                        ? isDark
                                          ? 'bg-zinc-900 border-zinc-800 text-emerald-400'
                                          : 'bg-zinc-100 border-zinc-200 text-emerald-700'
                                        : isDark
                                        ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
                                        : 'bg-zinc-100 border-zinc-200 text-zinc-800'
                                    }`}
                                  >
                                    {etaBadge.isArrived
                                      ? 'Arrived'
                                      : `~${etaBadge.etaMinutes}m`}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p
                        className={`text-xs text-center py-4 ${
                          isDark ? 'text-zinc-500' : 'text-zinc-400'
                        }`}
                      >
                        Select a route above to inspect stops.
                      </p>
                    )}
                  </div>
                )}

                {/* BUSES TAB */}
                {activeTab === 'buses' && (
                  <div className="space-y-2">
                    {filteredBuses.length === 0 ? (
                      <p
                        className={`text-xs text-center py-6 ${
                          isDark ? 'text-zinc-500' : 'text-zinc-400'
                        }`}
                      >
                        No matching buses broadcasting GPS.
                      </p>
                    ) : (
                      filteredBuses.map((bus) => (
                        <div
                          key={bus._id}
                          onClick={() => handleSelectBus(bus)}
                          className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                            isDark
                              ? 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                              : 'bg-zinc-50 border-zinc-200/80 hover:bg-zinc-100 hover:border-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${
                                isDark
                                  ? 'bg-zinc-800 border-zinc-700 text-white'
                                  : 'bg-white border-zinc-200 text-zinc-950'
                              }`}
                            >
                              {bus.busNumber.replace('BUS-', '')}
                            </div>
                            <div>
                              <div
                                className={`font-semibold text-xs sm:text-sm ${
                                  isDark ? 'text-white' : 'text-zinc-950'
                                }`}
                              >
                                Bus {bus.busNumber}
                              </div>
                              <div
                                className={`text-[11px] ${
                                  isDark ? 'text-zinc-400' : 'text-zinc-500'
                                }`}
                              >
                                {bus.assignedRoute?.routeName
                                  ? `Route: ${bus.assignedRoute.routeName}`
                                  : 'No route'}{' '}
                                • {Math.round(bus.speed)} km/h
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                              isDark
                                ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                                : 'bg-white border-zinc-200 text-zinc-800'
                            }`}
                          >
                            Locate
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
                      <p
                        className={`text-xs text-center py-6 ${
                          isDark ? 'text-zinc-500' : 'text-zinc-400'
                        }`}
                      >
                        No departure schedules posted.
                      </p>
                    ) : (
                      schedules
                        .filter(
                          (s) => !selectedRoute || s.route?._id === selectedRoute._id
                        )
                        .map((s) => (
                          <div
                            key={s._id}
                            className={`p-3 rounded-2xl border ${
                              isDark
                                ? 'bg-zinc-900/60 border-zinc-800'
                                : 'bg-zinc-50 border-zinc-200'
                            }`}
                          >
                            <div
                              className={`flex justify-between items-center font-semibold text-xs sm:text-sm ${
                                isDark ? 'text-white' : 'text-zinc-950'
                              }`}
                            >
                              <span>{s.route?.routeName || 'Scheduled Trip'}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                                  isDark
                                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                                    : 'bg-white border-zinc-200 text-zinc-800'
                                }`}
                              >
                                {s.startTime}
                              </span>
                            </div>
                            <div
                              className={`text-[11px] mt-1 flex justify-between ${
                                isDark ? 'text-zinc-400' : 'text-zinc-500'
                              }`}
                            >
                              <span>Vehicle: {s.bus?.busNumber || 'Assigned'}</span>
                              <span>Days: {s.operatingDays?.join(', ')}</span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- Fullscreen Minimalist Map View with CartoDB Tile Layer --- */}
      <MapContainer
        center={mapCenter}
        zoom={12}
        zoomControl={false}
        style={{ height: '100vh', width: '100vw' }}
      >
        <TileLayer
          key={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
          subdomains={['a', 'b', 'c', 'd']}
        />

        <MapRecenter center={mapCenter} />

        {renderRoutePath()}

        {activeBusesList.map((bus) => (
          <Marker
            key={bus._id}
            position={[bus.currentLocation.latitude, bus.currentLocation.longitude]}
            icon={createBusDivIcon(bus.busNumber, isDark)}
          >
            <Popup className="rounded-2xl shadow-xl">
              <div className="p-1">
                <div
                  className={`font-bold text-sm ${
                    isDark ? 'text-white' : 'text-zinc-950'
                  }`}
                >
                  Bus {bus.busNumber}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    isDark ? 'text-zinc-400' : 'text-zinc-600'
                  }`}
                >
                  Speed: {Math.round(bus.speed)} km/h
                </div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    isDark ? 'text-zinc-500' : 'text-zinc-400'
                  }`}
                >
                  Telemetry Sync: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
