import React, { useEffect, useState } from 'react';
import { Bus, Map as MapIcon, Activity, Users } from 'lucide-react';
import apiClient from '../services/api';

export default function DashboardOverview() {
  const [stats, setStats] = useState({ buses: 0, routes: 0, drivers: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [busesRes, routesRes] = await Promise.all([
          apiClient.get('/buses'),
          apiClient.get('/routes'),
        ]);
        setStats({
          buses: busesRes.data.count || 0,
          routes: routesRes.data.count || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Buses', value: stats.buses, icon: Bus, color: 'blue' },
    { label: 'Active Routes', value: stats.routes, icon: MapIcon, color: 'green' },
    { label: 'System Status', value: 'Online', icon: Activity, color: 'emerald' },
  ];

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">System overview and key metrics</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase">{card.label}</p>
                <p className={`text-3xl font-bold ${card.color === 'emerald' ? 'text-green-600' : 'text-gray-800'}`}>
                  {card.value}
                </p>
              </div>
              <div className={`p-3 bg-${card.color}-100 text-${card.color}-600 rounded-full`}>
                <card.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
