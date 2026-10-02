import React, { useEffect, useState } from 'react';
import { Bus, Map as MapIcon, Activity, Users, ArrowUpRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';

export default function DashboardOverview() {
  const [stats, setStats] = useState({ buses: 0, routes: 0, drivers: 0, schedules: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [busesRes, routesRes, driversRes, schedulesRes] = await Promise.all([
          apiClient.get('/buses'),
          apiClient.get('/routes'),
          apiClient.get('/auth/users?role=driver'),
          apiClient.get('/schedules'),
        ]);
        setStats({
          buses: busesRes.data.data?.length || busesRes.data.count || 0,
          routes: routesRes.data.data?.length || routesRes.data.count || 0,
          drivers: driversRes.data.data?.length || 0,
          schedules: schedulesRes.data.data?.length || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Fleet', value: stats.buses, icon: Bus, link: '/fleet', color: 'bg-blue-500', lightColor: 'bg-blue-50 text-blue-600' },
    { label: 'Active Routes', value: stats.routes, icon: MapIcon, link: '/routes', color: 'bg-emerald-500', lightColor: 'bg-emerald-50 text-emerald-600' },
    { label: 'Registered Drivers', value: stats.drivers, icon: Users, link: '/drivers', color: 'bg-purple-500', lightColor: 'bg-purple-50 text-purple-600' },
    { label: 'Scheduled Trips', value: stats.schedules, icon: Clock, link: '/schedules', color: 'bg-amber-500', lightColor: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">System Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">Real-time transit operations, metrics, and fleet readiness</p>
      </header>

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
              Live Socket.IO telemetry and Geofence ETA tracking services active.
            </p>
          </div>
        </div>
        <Link
          to="/fleet"
          className="w-full sm:w-auto text-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow"
        >
          Monitor Live Fleet
        </Link>
      </div>
    </div>
  );
}
