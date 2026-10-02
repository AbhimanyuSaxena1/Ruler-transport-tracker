import React, { useState, useEffect, useRef } from 'react';
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
  ChevronRight,
  Play,
  Pause,
  Sun,
  Moon
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState('cute'); // 'cute' | 'alex'
  const [isPlaying, setIsPlaying] = useState(true);
  const heroVideoRef = useRef(null);
  const bgVideoRef = useRef(null);

  // Light / Dark Theme State (persisted in localStorage)
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
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-950 relative overflow-x-hidden ${
        isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#fafafa] text-zinc-900'
      }`}
    >
      {/* ----------------- Background Video & Minimalist Atmosphere ----------------- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Looping Transport Background Video (low-contrast monochromatic scrim) */}
        <video
          ref={bgVideoRef}
          key={videoSrc + '-bg'}
          autoPlay
          loop
          muted
          playsInline
          className={`w-full h-full object-cover scale-105 filter transition-opacity duration-700 ${
            isDark ? 'opacity-[0.08] grayscale' : 'opacity-[0.06] grayscale'
          }`}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* Minimalist Monochrome Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: isDark
              ? 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)'
              : 'radial-gradient(rgba(0, 0, 0, 0.07) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        ></div>

        {/* Minimalist Edge Gradient Vignette */}
        <div
          className={`absolute inset-0 transition-colors duration-300 ${
            isDark
              ? 'bg-gradient-to-b from-[#09090b]/80 via-transparent to-[#09090b]'
              : 'bg-gradient-to-b from-[#fafafa]/80 via-transparent to-[#fafafa]'
          }`}
        ></div>
      </div>

      {/* ----------------- Floating Minimalist Capsule Navbar ----------------- */}
      <header className="relative z-30 pt-4 sm:pt-6 px-4 max-w-7xl mx-auto">
        <nav
          className={`mx-auto max-w-5xl rounded-full px-4 sm:px-6 py-3 flex items-center justify-between transition-all duration-300 border backdrop-blur-xl ${
            isDark
              ? 'bg-zinc-950/70 border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
              : 'bg-white/80 border-zinc-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
          }`}
        >
          {/* Brand Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                isDark ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'
              }`}
            >
              <Bus className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-base font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-zinc-950'
                }`}
              >
                MetroPulse
              </span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border hidden sm:inline-flex items-center gap-1.5 ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
                    : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Live 2.0
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div
            className={`hidden md:flex items-center gap-8 text-xs font-medium ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}
          >
            <a
              href="#live-radar"
              className={`transition-colors ${
                isDark ? 'hover:text-white' : 'hover:text-zinc-950'
              }`}
            >
              Live Radar
            </a>
            <a
              href="#features"
              className={`transition-colors ${
                isDark ? 'hover:text-white' : 'hover:text-zinc-950'
              }`}
            >
              Features
            </a>
            <a
              href="#routes"
              className={`transition-colors ${
                isDark ? 'hover:text-white' : 'hover:text-zinc-950'
              }`}
            >
              Routes
            </a>
            <a
              href="#stats"
              className={`transition-colors ${
                isDark ? 'hover:text-white' : 'hover:text-zinc-950'
              }`}
            >
              Telemetry
            </a>
          </div>

          {/* Controls: Theme Toggle & Live Map CTA */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle light and dark theme"
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                isDark
                  ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
                  : 'border-zinc-200 bg-zinc-100 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200'
              }`}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Launch Map Button */}
            <button
              onClick={() => navigate('/map')}
              className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                isDark
                  ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                  : 'bg-zinc-950 text-white hover:bg-zinc-800'
              }`}
            >
              <span>Live Map</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </nav>
      </header>

      {/* ----------------- Hero Section ----------------- */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-center lg:text-left">
            {/* Eyebrow Badge */}
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide transition-colors ${
                isDark
                  ? 'bg-zinc-900/90 border-zinc-800 text-zinc-300'
                  : 'bg-white border-zinc-200 text-zinc-700 shadow-2xs'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Real-Time Transit Engine</span>
              <span className={isDark ? 'text-zinc-600' : 'text-zinc-300'}>•</span>
              <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                WebSocket GPS
              </span>
            </div>

            {/* Headline */}
            <h1
              className={`text-4xl sm:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.08] ${
                isDark ? 'text-white' : 'text-zinc-950'
              }`}
            >
              Urban transit. <br />
              <span
                className={
                  isDark
                    ? 'text-zinc-400 font-semibold'
                    : 'text-zinc-500 font-semibold'
                }
              >
                Tracked in real time.
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className={`text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed ${
                isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}
            >
              Live vehicle coordinates, automated 200-meter arrival geofencing,
              and predictive departure timetables — designed for effortless daily
              commuting.
            </p>

            {/* Minimalist Search Bar */}
            <div className="max-w-xl mx-auto lg:mx-0">
              <form
                onSubmit={handleSearch}
                className={`p-2 rounded-full border flex items-center gap-2 transition-all duration-200 ${
                  isDark
                    ? 'bg-zinc-900/80 border-zinc-800 focus-within:border-zinc-500'
                    : 'bg-white border-zinc-300 focus-within:border-zinc-900 shadow-xs'
                }`}
              >
                <div className="flex-1 flex items-center gap-3 pl-3.5">
                  <Search
                    className={`w-4 h-4 ${
                      isDark ? 'text-zinc-500' : 'text-zinc-400'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Search bus number, route or stop..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full bg-transparent font-normal text-sm focus:outline-none ${
                      isDark
                        ? 'text-white placeholder-zinc-500'
                        : 'text-zinc-950 placeholder-zinc-400'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className={`text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    isDark
                      ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                      : 'bg-zinc-950 text-white hover:bg-zinc-800'
                  }`}
                >
                  <span>Search</span>
                  <ArrowRight size={13} />
                </button>
              </form>

              {/* Quick Route Shortcuts */}
              <div
                className={`flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-3 text-xs ${
                  isDark ? 'text-zinc-500' : 'text-zinc-500'
                }`}
              >
                <span className="text-[11px] font-medium uppercase tracking-wider">
                  Popular:
                </span>
                {['Route 101', 'City Express', 'Connaught Place', 'India Gate'].map(
                  (item) => (
                    <button
                      key={item}
                      onClick={() => handleQuickRoute(item)}
                      className={`px-3 py-1 rounded-full border text-[11px] font-medium transition-colors cursor-pointer ${
                        isDark
                          ? 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-600 hover:text-white'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-950'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Trust Highlights */}
            <div
              className={`flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2 text-xs font-medium ${
                isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className={`w-4 h-4 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}
                />{' '}
                Open Public Access
              </div>
              <div className="flex items-center gap-2">
                <Activity
                  className={`w-4 h-4 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}
                />{' '}
                WebSocket GPS Radar
              </div>
              <div className="flex items-center gap-2">
                <Compass
                  className={`w-4 h-4 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}
                />{' '}
                No App Download Required
              </div>
            </div>
          </div>

          {/* Right Column: Hand-Coded Minimalist 3D Showcase Card */}
          <div className="lg:col-span-5 relative" id="live-radar">
            <div
              className={`rounded-3xl border p-4 sm:p-5 transition-all duration-300 backdrop-blur-xl ${
                isDark
                  ? 'bg-zinc-950/80 border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
                  : 'bg-white/90 border-zinc-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.06)]'
              }`}
            >
              {/* Card Header with Route & Status */}
              <div
                className={`flex items-center justify-between mb-4 pb-3 border-b ${
                  isDark ? 'border-zinc-800' : 'border-zinc-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isDark
                        ? 'bg-zinc-800 text-white border border-zinc-700'
                        : 'bg-zinc-100 text-zinc-950 border border-zinc-200'
                    }`}
                  >
                    101
                  </div>
                  <div>
                    <div
                      className={`font-semibold text-sm flex items-center gap-2 ${
                        isDark ? 'text-white' : 'text-zinc-950'
                      }`}
                    >
                      Route 1: City Express
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                    <div
                      className={`text-xs ${
                        isDark ? 'text-zinc-400' : 'text-zinc-500'
                      }`}
                    >
                      Connaught Place ➔ Lodi Gardens
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-800 text-emerald-400'
                      : 'bg-zinc-50 border-zinc-200 text-emerald-700'
                  }`}
                >
                  On Route
                </span>
              </div>

              {/* Minimalist Video Viewport (Hand-Coded Frame) */}
              <div
                className={`relative rounded-2xl overflow-hidden border aspect-video group ${
                  isDark ? 'border-zinc-800 bg-black' : 'border-zinc-200 bg-zinc-950'
                }`}
              >
                {/* 3D Transport Video */}
                <video
                  ref={heroVideoRef}
                  key={videoSrc + '-hero'}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                >
                  <source src={videoSrc} type="video/mp4" />
                </video>

                {/* Subtle Monochrome Vignette Inside Video */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none"></div>

                {/* Floating Badge: Telemetry (Top Left) */}
                <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[10px] font-semibold text-white tracking-wide">
                    BUS-101 • 38 km/h
                  </span>
                </div>

                {/* Controls (Top Right) */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-zinc-950/80 backdrop-blur-md border border-white/10 p-1 rounded-full">
                  <button
                    onClick={() =>
                      setActiveVideo(activeVideo === 'cute' ? 'alex' : 'cute')
                    }
                    title="Toggle Animation"
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-zinc-300 hover:text-white bg-white/10 hover:bg-white/20 transition cursor-pointer"
                  >
                    {activeVideo === 'cute' ? 'City Loop' : 'FANCY 3D'}
                  </button>
                  <button
                    onClick={togglePlayback}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={11} /> : <Play size={11} />}
                  </button>
                </div>

                {/* Floating Badge: Geofence (Bottom Left) */}
                <div className="absolute bottom-3 left-3 bg-zinc-950/85 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <MapPin size={10} className="text-zinc-300" />
                  <span className="text-[10px] font-medium text-zinc-300">
                    200m Geofence Active
                  </span>
                </div>

                {/* Floating Badge: ETA (Bottom Right) */}
                <div className="absolute bottom-3 right-3 bg-white text-zinc-950 px-2.5 py-1 rounded-full flex items-center gap-1 font-bold text-[10px] shadow-sm">
                  <Clock size={10} />
                  <span>ETA ~2m</span>
                </div>
              </div>

              {/* Stop-by-Stop Progress Timeline */}
              <div className="space-y-3.5 relative pl-6 my-5">
                <div
                  className={`absolute left-2.5 top-2 bottom-2 w-px ${
                    isDark ? 'bg-zinc-800' : 'bg-zinc-200'
                  }`}
                ></div>

                <div className="relative flex items-center justify-between text-xs">
                  <div
                    className={`absolute -left-6 w-2.5 h-2.5 rounded-full ${
                      isDark ? 'bg-zinc-400' : 'bg-zinc-900'
                    }`}
                  ></div>
                  <span
                    className={`font-medium ${
                      isDark ? 'text-zinc-300' : 'text-zinc-700'
                    }`}
                  >
                    Connaught Place
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                    }`}
                  >
                    Departed
                  </span>
                </div>

                <div className="relative flex items-center justify-between text-xs">
                  <div className="absolute -left-6 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
                  <span
                    className={`font-semibold ${
                      isDark ? 'text-white' : 'text-zinc-950'
                    }`}
                  >
                    India Gate
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-800 text-emerald-400'
                        : 'bg-zinc-100 border-zinc-200 text-emerald-700'
                    }`}
                  >
                    Arriving ~2m
                  </span>
                </div>

                <div className="relative flex items-center justify-between text-xs">
                  <div
                    className={`absolute -left-6 w-2.5 h-2.5 rounded-full ${
                      isDark ? 'bg-zinc-800' : 'bg-zinc-300'
                    }`}
                  ></div>
                  <span
                    className={`font-normal ${
                      isDark ? 'text-zinc-500' : 'text-zinc-400'
                    }`}
                  >
                    Lodi Gardens
                  </span>
                  <span
                    className={`text-[10px] ${
                      isDark ? 'text-zinc-500' : 'text-zinc-400'
                    }`}
                  >
                    ~8m away
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => navigate('/map')}
                className={`w-full py-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  isDark
                    ? 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white'
                    : 'border-zinc-300 bg-zinc-50 text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950'
                }`}
              >
                <span>Track Bus on Live Map</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- Minimalist Telemetry Metrics ----------------- */}
      <section id="stats" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              stat: '< 12',
              unit: 'ms',
              label: 'WebSocket Latency',
              desc: 'Sub-second GPS telemetry sync',
            },
            {
              stat: '200',
              unit: 'm',
              label: 'Geofence Radius',
              desc: 'Automated stop arrival alerts',
            },
            {
              stat: '99.98',
              unit: '%',
              label: 'System Uptime',
              desc: 'Distributed fault-tolerant engine',
            },
            {
              stat: '100',
              unit: '%',
              label: 'Public Access',
              desc: 'Zero registration or install required',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`border rounded-2xl p-5 sm:p-6 transition-all duration-200 ${
                isDark
                  ? 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                  : 'bg-white border-zinc-200/90 shadow-2xs hover:border-zinc-300'
              }`}
            >
              <div
                className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-1 ${
                  isDark ? 'text-white' : 'text-zinc-950'
                }`}
              >
                {item.stat}
                <span
                  className={`text-lg sm:text-xl font-normal ml-0.5 ${
                    isDark ? 'text-zinc-500' : 'text-zinc-400'
                  }`}
                >
                  {item.unit}
                </span>
              </div>
              <div
                className={`text-xs sm:text-sm font-semibold ${
                  isDark ? 'text-zinc-300' : 'text-zinc-800'
                }`}
              >
                {item.label}
              </div>
              <div
                className={`text-[11px] mt-1 ${
                  isDark ? 'text-zinc-500' : 'text-zinc-500'
                }`}
              >
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------- Features Bento Grid (Monochrome Hand-Coded) ----------------- */}
      <section
        id="features"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24"
      >
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider mb-3 ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
                : 'bg-zinc-100 border-zinc-200 text-zinc-700'
            }`}
          >
            Engineering Standards
          </div>
          <h2
            className={`text-3xl sm:text-4xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-zinc-950'
            }`}
          >
            Engineered for modern commuters
          </h2>
          <p
            className={`text-sm sm:text-base mt-2.5 ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}
          >
            A high-performance transit tracking stack designed for zero friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1: GPS Telemetry */}
          <div
            className={`border rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 ${
              isDark
                ? 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                : 'bg-white border-zinc-200/90 shadow-2xs hover:border-zinc-300'
            }`}
          >
            <div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 text-white'
                    : 'bg-zinc-100 border-zinc-200 text-zinc-950'
                }`}
              >
                <Activity className="w-5 h-5" />
              </div>
              <h3
                className={`text-lg font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-zinc-950'
                }`}
              >
                Live GPS Telemetry
              </h3>
              <p
                className={`text-xs sm:text-sm leading-relaxed mb-6 ${
                  isDark ? 'text-zinc-400' : 'text-zinc-600'
                }`}
              >
                High-frequency WebSocket protocol synchronizes latitude,
                longitude, and bearing vectors straight to your browser without
                reloads.
              </p>
            </div>
            <div
              className={`pt-4 border-t text-xs font-semibold flex items-center justify-between ${
                isDark
                  ? 'border-zinc-800/80 text-zinc-300'
                  : 'border-zinc-100 text-zinc-700'
              }`}
            >
              <span>Sub-second streaming</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Card 2: Predictive ETA */}
          <div
            className={`border rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 ${
              isDark
                ? 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                : 'bg-white border-zinc-200/90 shadow-2xs hover:border-zinc-300'
            }`}
          >
            <div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 text-white'
                    : 'bg-zinc-100 border-zinc-200 text-zinc-950'
                }`}
              >
                <Clock className="w-5 h-5" />
              </div>
              <h3
                className={`text-lg font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-zinc-950'
                }`}
              >
                Predictive ETA Calculations
              </h3>
              <p
                className={`text-xs sm:text-sm leading-relaxed mb-6 ${
                  isDark ? 'text-zinc-400' : 'text-zinc-600'
                }`}
              >
                Haversine distance algorithms combine real-time vehicle speed and
                station intervals to forecast arrival times down to the minute.
              </p>
            </div>
            <div
              className={`pt-4 border-t text-xs font-semibold flex items-center justify-between ${
                isDark
                  ? 'border-zinc-800/80 text-zinc-300'
                  : 'border-zinc-100 text-zinc-700'
              }`}
            >
              <span>Minute-accurate ETAs</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Card 3: Geofence Radar */}
          <div
            className={`border rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 ${
              isDark
                ? 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                : 'bg-white border-zinc-200/90 shadow-2xs hover:border-zinc-300'
            }`}
          >
            <div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 text-white'
                    : 'bg-zinc-100 border-zinc-200 text-zinc-950'
                }`}
              >
                <MapPin className="w-5 h-5" />
              </div>
              <h3
                className={`text-lg font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-zinc-950'
                }`}
              >
                200m Geofencing Radar
              </h3>
              <p
                className={`text-xs sm:text-sm leading-relaxed mb-6 ${
                  isDark ? 'text-zinc-400' : 'text-zinc-600'
                }`}
              >
                Automated spatial perimeter scanning triggers arrival alerts as
                the vehicle reaches within 200 meters of your pickup stop.
              </p>
            </div>
            <div
              className={`pt-4 border-t text-xs font-semibold flex items-center justify-between ${
                isDark
                  ? 'border-zinc-800/80 text-zinc-300'
                  : 'border-zinc-100 text-zinc-700'
              }`}
            >
              <span>Automated arrival radar</span>
              <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- Route Quick Explorer Banner ----------------- */}
      <section id="routes" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div
          className={`border rounded-3xl p-8 sm:p-12 transition-all duration-300 ${
            isDark
              ? 'bg-zinc-950/90 border-zinc-800 shadow-[0_15px_40px_rgba(0,0,0,0.5)]'
              : 'bg-white border-zinc-200 shadow-xs'
          }`}
        >
          <div className="max-w-2xl">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`}
            >
              Full Fleet Radar
            </span>
            <h3
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold mt-2 mb-3 ${
                isDark ? 'text-white' : 'text-zinc-950'
              }`}
            >
              Track your daily bus commute live.
            </h3>
            <p
              className={`text-sm sm:text-base leading-relaxed mb-6 ${
                isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}
            >
              Open the interactive map to locate active buses, browse routes,
              inspect station arrival sequences, and check vehicle telemetry in real
              time.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/map')}
                className={`text-xs sm:text-sm font-semibold px-6 py-3 rounded-full transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  isDark
                    ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                    : 'bg-zinc-950 text-white hover:bg-zinc-800'
                }`}
              >
                <span>Launch Live Map</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- Minimalist Studio Footer ----------------- */}
      <footer
        className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs transition-colors duration-300 ${
          isDark
            ? 'border-zinc-900 text-zinc-500'
            : 'border-zinc-200/80 text-zinc-500'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          <span>All Telemetry Nodes Active & Streaming</span>
        </div>
        <div>
          © {new Date().getFullYear()} MetroPulse Transit System. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
