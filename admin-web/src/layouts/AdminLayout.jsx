import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Bus, Users, Map as MapIcon, Activity, MapPin, Calendar } from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', icon: Activity, label: 'Dashboard' },
    { to: '/fleet', icon: Bus, label: 'Fleet' },
    { to: '/routes', icon: MapIcon, label: 'Routes' },
    { to: '/stops', icon: MapPin, label: 'Stops' },
    { to: '/schedules', icon: Calendar, label: 'Schedules' },
    { to: '/drivers', icon: Users, label: 'Drivers' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-4 flex items-center gap-2 border-b border-slate-700">
          <Activity className="text-blue-400" />
          <span className="font-bold text-lg">Transit Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 p-2 rounded transition ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="text-xs text-slate-400 mb-2">{user?.name}</div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-slate-300 hover:text-white w-full"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
