import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LiveMap from './pages/LiveMap';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/map" element={<LiveMap />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
