import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LogOut,
  Bus,
  Users,
  Map as MapIcon,
  Activity,
  MapPin,
  Calendar,
  Menu,
  X,
  ShieldAlert,
  Bell
} from 'lucide-react';
import apiClient from '../services/api';
import socket from '../services/socket';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openAlertsCount, setOpenAlertsCount] = useState(0);
  const [activeBannerAlert, setActiveBannerAlert] = useState(null);

  const fetchOpenAlerts = async () => {
    try {
      const res = await apiClient.get('/incidents?status=OPEN');
      const count = res.data.pagination?.total ?? (res.data.data?.length || 0);
      setOpenAlertsCount(count);
    } catch (err) {
      console.warn('Failed to load incident count:', err.message);
    }
  };

  useEffect(() => {
    fetchOpenAlerts();

    // Real-time socket listeners
    const handleBusOffline = (alert) => {
      setOpenAlertsCount((prev) => prev + 1);
      setActiveBannerAlert(alert);
    };

    const handleBackOnline = () => {
      fetchOpenAlerts();
    };

    const handleAcknowledged = () => {
      fetchOpenAlerts();
    };

    socket.on('bus:offline', handleBusOffline);
    socket.on('bus:back_online', handleBackOnline);
    socket.on('incident:acknowledged', handleAcknowledged);

    // Re-sync on socket reconnect
    socket.on('reconnect', fetchOpenAlerts);

    return () => {
      socket.off('bus:offline', handleBusOffline);
      socket.off('bus:back_online', handleBackOnline);
      socket.off('incident:acknowledged', handleAcknowledged);
      socket.off('reconnect', fetchOpenAlerts);
    };
  }, []);

  const navItems = [
    { to: '/', icon: Activity, label: 'Dashboard' },
    { to: '/fleet', icon: Bus, label: 'Fleet' },
    { to: '/incidents', icon: ShieldAlert, label: 'Incidents & Alerts', badge: openAlertsCount },
    { to: '/routes', icon: MapIcon, label: 'Routes' },
    { to: '/stops', icon: MapPin, label: 'Stops' },
    { to: '/schedules', icon: Calendar, label: 'Schedules' },
    { to: '/drivers', icon: Users, label: 'Drivers' },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* --- Sidebar Navigation (Desktop Persistent & Mobile Slide-out Drawer) --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 text-white border-r border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="p-4 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-zinc-950 flex items-center justify-center font-bold shadow-xs">
              <Bus size={17} />
            </div>
            <span className="font-bold text-base tracking-tight text-white">Transit Admin</span>
          </div>
          {/* Close button on mobile drawer */}
          <button
            onClick={closeMobileMenu}
            className="md:hidden text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all ${
                  isActive
                    ? 'bg-white text-zinc-950 font-bold shadow-xs'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white font-medium'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon size={17} />
                {item.label}
              </div>
              {item.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-red-600 text-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold text-xs uppercase border border-zinc-700">
              {user?.name ? user.name.slice(0, 2) : 'AD'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</div>
              <div className="text-[11px] text-zinc-400 truncate">{user?.email || 'admin@bustracker.com'}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-2.5 rounded-xl transition w-full cursor-pointer"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Bar (Only visible on mobile/tablet) */}
        <header className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 shadow-xs z-30">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Bus size={18} className="text-zinc-950" />
            <span className="font-bold text-base text-gray-900">Transit Admin</span>
          </div>
          <div className="flex items-center gap-2">
            {openAlertsCount > 0 && (
              <button
                onClick={() => navigate('/incidents')}
                className="relative p-1.5 rounded-lg bg-red-50 text-red-600"
              >
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                  {openAlertsCount}
                </span>
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
          </div>
        </header>

        {/* Global Live Offline Alert Toast / Banner */}
        {activeBannerAlert && (
          <div className="bg-red-600 text-white px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-bold shadow-md z-20">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              <span>
                🔴 ALERT: Bus {activeBannerAlert.busNumber} is OFFLINE! No GPS location received within timeout.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveBannerAlert(null);
                  navigate('/incidents');
                }}
                className="px-2.5 py-1 bg-white text-red-700 rounded-lg text-xs font-black hover:bg-red-50 transition cursor-pointer"
              >
                Inspect Incident
              </button>
              <button
                onClick={() => setActiveBannerAlert(null)}
                className="p-1 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
