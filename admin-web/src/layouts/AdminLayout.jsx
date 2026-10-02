import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Bus, Users, Map as MapIcon, Activity, MapPin, Calendar, Menu, X } from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', icon: Activity, label: 'Dashboard' },
    { to: '/fleet', icon: Bus, label: 'Fleet' },
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
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 text-white flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="p-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow">
              <Activity size={18} />
            </div>
            <span className="font-extrabold text-lg tracking-tight">Transit Admin</span>
          </div>
          {/* Close button on mobile drawer */}
          <button
            onClick={closeMobileMenu}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700"
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
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md font-semibold'
                    : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/80">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs uppercase border border-blue-500/30">
              {user?.name ? user.name.slice(0, 2) : 'AD'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</div>
              <div className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@bustracker.com'}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-700/50 hover:bg-rose-600/80 p-2 rounded-xl transition w-full"
          >
            <LogOut size={15} /> Sign Out
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
            <Activity size={20} className="text-blue-600" />
            <span className="font-bold text-base text-gray-800">Transit Admin</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
