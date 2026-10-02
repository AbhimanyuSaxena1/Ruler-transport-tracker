import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bus,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowRight,
  Activity,
  Search,
  Compass,
  Radio,
  Sparkles,
  Zap,
  Navigation,
  Layers,
  ChevronRight,
  Play,
  Pause
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState('cute'); // 'cute' | 'alex'
  const [isPlaying, setIsPlaying] = useState(true);
  const heroVideoRef = useRef(null);
  const bgVideoRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/map${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`);
  };

  const handleQuickRoute = (routeQuery) => {
    navigate(`/map?search=${encodeURIComponent(routeQuery)}`);
  };

  const togglePlayback = () => {
    if (heroVideoRef.current && bgVideoRef.current) {
      if (isPlaying) {
        heroVideoRef.current.pause();
        bgVideoRef.current.pause();
      } else {
        heroVideoRef.current.play();
        bgVideoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const videoSrc = activeVideo === 'cute' ? '/cute-transport-loop.mp4' : '/alex-bender-3d.mp4';

  return (
    <div className="min-h-screen bg-[#060811] text-white font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* ----------------- Background Video & Ambient Glow Atmosphere ----------------- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Looping Cute Transport Background Video */}
        <video
          ref={bgVideoRef}
          key={videoSrc + '-bg'}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-15 filter blur-xs scale-105 transition-opacity duration-1000"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* Dark Vignette Overlay & Grid Pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060811]/90 via-[#060811]/75 to-[#060811]"></div>
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
          }}
        ></div>

        {/* Ambient Alex Bender Style Luminous Light Orbs */}
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px]"></div>
      </div>

      {/* ----------------- Floating Pill Capsule Navbar (FANCY Style) ----------------- */}
      <header className="relative z-30 pt-4 sm:pt-6 px-4 max-w-7xl mx-auto">
        <nav className="mx-auto max-w-5xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)] rounded-full px-4 sm:px-6 py-3 flex items-center justify-between transition-all">
          {/* Brand Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Metro<span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">Pulse</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hidden sm:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Live 3D
                </span>
              </span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#live-radar" className="hover:text-white transition flex items-center gap-1.5">
              <Radio size={13} className="text-blue-400" /> Live Radar
            </a>
            <a href="#features" className="hover:text-white transition flex items-center gap-1.5">
              <Zap size={13} className="text-indigo-400" /> Features
            </a>
            <a href="#routes" className="hover:text-white transition flex items-center gap-1.5">
              <Navigation size={13} className="text-emerald-400" /> Routes
            </a>
            <a href="#stats" className="hover:text-white transition flex items-center gap-1.5">
              <Activity size={13} className="text-purple-400" /> Telemetry
            </a>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/map')}
              className="group relative flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-size-200 text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-full shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] hover:scale-[1.03] transition-all"
            >
              <span>Explore Live Map</span>
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </nav>
      </header>

      {/* ----------------- Hero Section with 3D Transport Centerpiece ----------------- */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
                Next-Gen 3D Transit Intelligence 2.0
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="hidden sm:inline-flex text-[11px] font-semibold text-blue-400 items-center gap-1">
                <Sparkles size={11} /> WebSocket GPS
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.08]">
              Navigate Urban <br />
              <span className="bg-gradient-to-r from-white via-blue-200 to-slate-300 bg-clip-text text-transparent">
                Transit In
              </span>{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent inline-block drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                Real-Time 3D.
              </span>
            </h1>

            {/* Description */}
            <p className="text-slate-300/80 text-base sm:text-lg lg:text-xl font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Track live bus positions, get automatic 200m geofence arrival radar alerts, and stream precision timetables — designed for effortless daily commuting.
            </p>

            {/* Interactive Search Bar (Alex Bender Glass Capsule) */}
            <div className="max-w-xl mx-auto lg:mx-0">
              <form
                onSubmit={handleSearch}
                className="relative bg-slate-900/80 p-2 sm:p-2.5 rounded-full border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.6)] backdrop-blur-2xl flex items-center gap-2 group focus-within:border-blue-500/60 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all"
              >
                <div className="flex-1 flex items-center gap-3 pl-4">
                  <Search className="text-slate-400 group-focus-within:text-blue-400 w-5 h-5 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search bus number, route or stop..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-slate-400 font-medium text-sm sm:text-base focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm px-5 sm:px-7 py-3 rounded-full transition-all shadow-md shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] flex items-center gap-1.5"
                >
                  <span>Search</span>
                  <ArrowRight size={15} />
                </button>
              </form>

              {/* Quick Search Chips */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-3 text-xs text-slate-400">
                <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Quick:</span>
                <button
                  onClick={() => handleQuickRoute('Route 101')}
                  className="px-2.5 py-1 rounded-full bg-slate-900/70 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-blue-300 transition text-[11px] font-medium"
                >
                  Route 101
                </button>
                <button
                  onClick={() => handleQuickRoute('City Express')}
                  className="px-2.5 py-1 rounded-full bg-slate-900/70 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-blue-300 transition text-[11px] font-medium"
                >
                  City Express
                </button>
                <button
                  onClick={() => handleQuickRoute('Connaught Place')}
                  className="px-2.5 py-1 rounded-full bg-slate-900/70 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-blue-300 transition text-[11px] font-medium"
                >
                  Connaught Place
                </button>
                <button
                  onClick={() => handleQuickRoute('India Gate')}
                  className="px-2.5 py-1 rounded-full bg-slate-900/70 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-blue-300 transition text-[11px] font-medium"
                >
                  India Gate
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-2 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-400 w-4 h-4" /> 100% Free Public Access
              </div>
              <div className="flex items-center gap-2">
                <Activity className="text-blue-400 w-4 h-4" /> WebSocket GPS Radar
              </div>
              <div className="flex items-center gap-2">
                <Compass className="text-indigo-400 w-4 h-4" /> No App Download Required
              </div>
            </div>
          </div>

          {/* Right Column: 3D Cute Transport Video Showcase Card (Alex Bender Style) */}
          <div className="lg:col-span-5 relative" id="live-radar">
            {/* Outer Glow Halo */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-30 blur-2xl group-hover:opacity-60 transition duration-1000"></div>

            {/* Main 3D Showcase Card */}
            <div className="relative rounded-3xl bg-slate-900/85 border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden p-4 sm:p-5">
              {/* Card Header with Live Bus Metadata */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-blue-500/30">
                    101
                  </div>
                  <div>
                    <div className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                      Route 1: City Express
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    </div>
                    <div className="text-xs text-slate-400">Connaught Place ➔ Lodi Gardens</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[11px] font-bold uppercase tracking-wider">
                    On Route
                  </span>
                </div>
              </div>

              {/* 3D Transport Video Container */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video group">
                {/* Embedded Cute 3D Transport Animation Video */}
                <video
                  ref={heroVideoRef}
                  key={videoSrc + '-hero'}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                >
                  <source src={videoSrc} type="video/mp4" />
                </video>

                {/* Subtle Gradient Shadow Inside Video */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none"></div>

                {/* Floating Glass Tag: Real-time Telemetry (Top Left) */}
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[11px] font-bold text-white tracking-wide">
                    BUS-101 • 38 km/h
                  </span>
                </div>

                {/* Video Switcher & Playback Control (Top Right) */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-white/15 p-1 rounded-full shadow-lg">
                  <button
                    onClick={() => setActiveVideo(activeVideo === 'cute' ? 'alex' : 'cute')}
                    title="Toggle 3D Animation Style"
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-200 hover:text-white bg-blue-600/30 hover:bg-blue-600 transition"
                  >
                    {activeVideo === 'cute' ? '3D City Loop' : 'FANCY 3D'}
                  </button>
                  <button
                    onClick={togglePlayback}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition"
                    title={isPlaying ? 'Pause video' : 'Play video'}
                  >
                    {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                  </button>
                </div>

                {/* Floating Glass Tag: Geofence Active (Bottom Left) */}
                <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                  <MapPin size={11} className="text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-300">
                    200m Geofence Active
                  </span>
                </div>

                {/* Floating Glass Tag: ETA (Bottom Right) */}
                <div className="absolute bottom-3 right-3 bg-blue-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg font-bold text-[10px]">
                  <Clock size={11} />
                  <span>ETA ~2 mins</span>
                </div>
              </div>

              {/* Stop-by-Stop Progress Timeline */}
              <div className="space-y-3.5 relative pl-6 my-5">
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-blue-600/30"></div>

                <div className="relative flex items-center justify-between text-xs">
                  <div className="absolute -left-6 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
                  <span className="font-bold text-slate-200">Connaught Place</span>
                  <span className="font-bold text-[11px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Departed
                  </span>
                </div>

                <div className="relative flex items-center justify-between text-xs">
                  <div className="absolute -left-6 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-500/30"></div>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    India Gate
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                  </span>
                  <span className="font-bold text-[11px] bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                    Arriving in 2m
                  </span>
                </div>

                <div className="relative flex items-center justify-between text-xs">
                  <div className="absolute -left-6 w-3 h-3 rounded-full bg-slate-700"></div>
                  <span className="font-medium text-slate-400">Lodi Gardens</span>
                  <span className="text-[11px] text-slate-500">~8m away</span>
                </div>
              </div>

              {/* Primary Action Button to Interactive Map */}
              <button
                onClick={() => navigate('/map')}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 hover:from-blue-600 hover:to-indigo-600 text-blue-300 hover:text-white border border-blue-500/40 hover:border-transparent font-bold rounded-2xl transition-all duration-300 text-xs sm:text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 group cursor-pointer"
              >
                <span>Track Bus on Interactive 3D Map</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- Real-Time Telemetry Metrics Ribbon ----------------- */}
      <section id="stats" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1 tracking-tight">
              &lt; 12<span className="text-blue-400 text-xl sm:text-2xl">ms</span>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-400">WebSocket Ping Latency</div>
            <div className="text-[11px] text-slate-500 mt-1">Real-time driver GPS sync</div>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1 tracking-tight">
              200<span className="text-emerald-400 text-xl sm:text-2xl">m</span>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-400">Geofence Radius</div>
            <div className="text-[11px] text-slate-500 mt-1">Automated stop arrival alerts</div>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden group hover:border-indigo-500/50 transition-all">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1 tracking-tight">
              99.98<span className="text-indigo-400 text-xl sm:text-2xl">%</span>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-400">Telemetry Uptime</div>
            <div className="text-[11px] text-slate-500 mt-1">Fault-tolerant distributed engine</div>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden group hover:border-purple-500/50 transition-all">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1 tracking-tight">
              100<span className="text-purple-400 text-xl sm:text-2xl">%</span>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-400">Open Public Access</div>
            <div className="text-[11px] text-slate-500 mt-1">No registration required</div>
          </div>
        </div>
      </section>

      {/* ----------------- Alex Bender Bento Grid Feature Showcase ----------------- */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
            Architected for Precision
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Engineered for Modern Commuters
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-xl mx-auto">
            Everything you need for an effortless, stress-free daily transit journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1: GPS Telemetry */}
          <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 group backdrop-blur-xl hover:shadow-[0_15px_40px_rgba(37,99,235,0.15)] flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-blue-400/20 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-blue-500/30">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Live GPS Telemetry</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Real-time WebSocket stream broadcasts high-frequency latitude, longitude, and bearing updates directly onto your live interactive map.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-xs font-semibold text-blue-400 flex items-center gap-1">
              <span>Zero refresh latency</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Card 2: Predictive ETA Engine */}
          <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/10 hover:border-emerald-500/50 transition-all duration-300 group backdrop-blur-xl hover:shadow-[0_15px_40px_rgba(16,185,129,0.15)] flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600/30 to-emerald-400/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-emerald-500/30">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Predictive ETA Engine</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Haversine distance algorithms dynamically correlate current bus speed and traffic vectors to calculate accurate arrival times down to the minute.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <span>Dynamic arrival forecasts</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Card 3: 200m Geofencing */}
          <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/10 hover:border-indigo-500/50 transition-all duration-300 group backdrop-blur-xl hover:shadow-[0_15px_40px_rgba(99,102,241,0.15)] flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-indigo-400/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-indigo-500/30">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">200m Geofence Radar</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Spatial perimeter scanning triggers automatic arrival notifications when the bus approaches within 200 meters of your pickup station.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-xs font-semibold text-indigo-400 flex items-center gap-1">
              <span>Automatic stop detection</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- Route Quick Explorer Banner ----------------- */}
      <section id="routes" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-900/40 via-slate-900/80 to-indigo-950/40 border border-white/15 p-8 sm:p-12 overflow-hidden backdrop-blur-2xl">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Interactive Fleet Coverage
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-2 mb-4">
              Ready to explore your daily commute in real-time?
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              Open the interactive live map to view active buses, search routes, inspect stop-by-stop arrival schedules, and pinpoint your closest transit hub.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/map')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-7 py-3.5 rounded-full shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>Launch Live Map Now</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- Footer ----------------- */}
      <footer className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span>All GPS Telemetry Nodes Active & Streaming</span>
        </div>
        <div>
          © {new Date().getFullYear()} MetroPulse Transit Engine. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
