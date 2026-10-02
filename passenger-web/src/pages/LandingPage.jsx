import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, MapPin, Clock, ShieldCheck, ArrowRight, Activity, Search, Compass } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/map${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Gradient Orbs (Halo Lab Signature Style) */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none"></div>

      {/* --- Navbar --- */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Metro<span className="text-blue-500">Pulse</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
          <a href="#stats" className="hover:text-white transition">Coverage</a>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-105 transition-all"
          >
            <span>Live Map Tracker</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 text-center md:text-left grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Hero Text */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-300">Real-Time City Transit Engine 2.0</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Navigate Your City <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              In Real-Time.
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
            Track live bus positions, get automated 200m geofence arrival alerts, and access exact departure timetables — instantly from any device.
          </p>

          {/* Halo Lab Style Interactive Search Bar */}
          <form onSubmit={handleSearch} className="bg-slate-900/90 p-2.5 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl max-w-xl flex items-center gap-2">
            <div className="flex-1 flex items-center gap-3 pl-3">
              <Search className="text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter bus route or stop name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white placeholder-slate-500 font-medium text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-md"
            >
              Search Route
            </button>
          </form>

          {/* Trust Highlights */}
          <div className="flex flex-wrap gap-6 pt-4 text-xs font-bold text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-400 w-4 h-4" /> 100% Free Public Access
            </div>
            <div className="flex items-center gap-2">
              <Activity className="text-blue-400 w-4 h-4" /> WebSocket GPS Telemetry
            </div>
            <div className="flex items-center gap-2">
              <Compass className="text-indigo-400 w-4 h-4" /> No App Download Required
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Card (Halo Lab Aesthetic) */}
        <div className="lg:col-span-5 relative">
          <div className="relative bg-slate-900/80 rounded-3xl p-6 border border-slate-800 shadow-2xl backdrop-blur-xl">
            {/* Live Card Preview Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-lg">
                  101
                </div>
                <div>
                  <div className="font-extrabold text-white text-base">Route 1: City Express</div>
                  <div className="text-xs text-slate-400">Connaught Place ➔ Lodi Gardens</div>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
                Live Now
              </span>
            </div>

            {/* Interactive Timeline Mock */}
            <div className="space-y-4 relative pl-6 my-6">
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-blue-600/40"></div>

              <div className="relative flex items-center justify-between">
                <div className="absolute -left-6 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
                <span className="font-bold text-sm text-slate-200">Connaught Place</span>
                <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Arrived</span>
              </div>

              <div className="relative flex items-center justify-between">
                <div className="absolute -left-6 w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-blue-500/20"></div>
                <span className="font-bold text-sm text-slate-200">India Gate</span>
                <span className="text-xs font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">~3 mins away</span>
              </div>

              <div className="relative flex items-center justify-between">
                <div className="absolute -left-6 w-3.5 h-3.5 rounded-full bg-slate-700"></div>
                <span className="font-bold text-sm text-slate-400">Lodi Gardens</span>
                <span className="text-xs text-slate-500">~8 mins away</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/map')}
              className="w-full mt-4 py-3 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 font-bold rounded-2xl transition-all text-sm text-center flex items-center justify-center gap-2"
            >
              <span>Explore Interactive Map</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* --- Feature Grid --- */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-16 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
            Built for Modern Commuters
          </h2>
          <p className="text-slate-400 text-base">
            Everything you need for an effortless, stress-free daily transit experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800/80 hover:border-blue-500/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Live GPS Telemetry</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Real-time WebSocket connection Streams exact bus positions with zero refresh latency.
            </p>
          </div>

          <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800/80 hover:border-blue-500/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Predictive ETA Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Haversine formula & live vehicle speed calculations predict arrival times down to the minute.
            </p>
          </div>

          <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800/80 hover:border-blue-500/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">200m Geofencing</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automatic geofence detection instantly alerts passengers when a bus reaches their stop.
            </p>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-8 border-t border-slate-900 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} MetroPulse Transit System. All rights reserved.
      </footer>
    </div>
  );
}
