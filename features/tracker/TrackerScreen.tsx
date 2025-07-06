import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const TrackerScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('total');

  // Placeholder for totalTimeForPeriod, replace with actual logic if available
  const totalTimeForPeriod = 1250 * 3600; // Example: 1250 hours in seconds

  // Placeholder for filteredLogsForPeriod, replace with actual data if available
  const filteredLogsForPeriod = [
    { id: '1', category: 'Listening', custom_title: null, sub_activity: 'Podcast: "News in Slow..."', duration_seconds: 1800, date: '2024-07-05' },
    { id: '2', category: 'Study', custom_title: null, sub_activity: 'Lesson 3 Completed', duration_seconds: 2700, date: '2024-07-04' },
    { id: '3', category: 'Watching', custom_title: null, sub_activity: '"La Casa de Papel" ', duration_seconds: 2700, date: '2024-07-04' },
    { id: '4', category: 'Reading', custom_title: null, sub_activity: '"El Principito" - Ch. 1', duration_seconds: 900, date: '2024-07-03' },
  ];

  const formatDurationFromSeconds = (seconds: number, unit: string) => {
    if (unit === 'mm') {
      return Math.floor(seconds / 60);
    }
    return seconds;
  };

  const formatDisplayDateForLogList = (isoDateString: string): string => {
    if (!isoDateString) return '';
    const [year, month, day] = isoDateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#4a148c] px-4 pt-4 pb-4 flex items-center sticky top-0 z-10 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-white rounded-full p-1 flex items-center justify-center w-8 h-8">
            <span className="text-[#4a148c] font-bold text-xl">A</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Tracker</h1>
        </div>
      </header>
      <main className="flex-grow px-6 pb-24 pt-6">
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
          <h2 className="text-gray-500 font-medium mb-1">Hour Milestones</h2>
          <div className="flex items-baseline space-x-2">
            <p className="text-4xl font-bold text-purple-700">{Math.floor(totalTimeForPeriod / 3600)}</p>
            <span className="text-lg text-gray-400 font-medium">/ 1,500 hours</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2.5 rounded-full" style={{ width: `${(Math.floor(totalTimeForPeriod / 3600) / 1500) * 100}%` }}></div>
          </div>
          <p className="text-right text-gray-500 mt-2 text-sm font-medium">Next milestone: 1,500 hours</p>
        </div>
        <div>
          <div className="flex space-x-4 border-b border-gray-200">
            <button className={`flex-1 pb-2 text-center text-sm ${activeTab === 'total' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('total')}>Tiempo Total</button>
            <button className={`flex-1 pb-2 text-center text-sm ${activeTab === 'type' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('type')}>Por Tipo</button>
            <button className={`flex-1 pb-2 text-center text-sm ${activeTab === 'skill' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('skill')}>Por Habilidad</button>
          </div>
          <div className="mt-4 chart-container flex items-center justify-center bg-white rounded-2xl shadow-md p-4">
            {activeTab === 'total' && (
              <div className="w-full h-full" id="line-chart-container">
                <svg className="w-full h-full" viewBox="0 0 300 200">
                  <text className="text-xs fill-gray-400" x="5" y="25">10h</text>
                  <text className="text-xs fill-gray-400" x="5" y="75">5h</text>
                  <text className="text-xs fill-gray-400" x="5" y="125">2h</text>
                  <text className="text-xs fill-gray-400" x="5" y="175">0h</text>
                  <line className="stroke-gray-200 stroke-1" strokeDasharray="2 2" x1="30" x2="295" y1="20" y2="20"></line>
                  <line className="stroke-gray-200 stroke-1" strokeDasharray="2 2" x1="30" x2="295" y1="70" y2="70"></line>
                  <line className="stroke-gray-200 stroke-1" strokeDasharray="2 2" x1="30" x2="295" y1="120" y2="120"></line>
                  <line className="stroke-gray-300 stroke-1" x1="30" x2="295" y1="170" y2="170"></line>
                  <polyline className="fill-none stroke-[var(--accent-color)]" points="30,120 80,90 130,100 180,60 230,80 280,50" strokeWidth="2.5"></polyline>
                  <text className="text-xs fill-gray-400" textAnchor="middle" x="30" y="185">Lun</text>
                  <text className="text-xs fill-gray-400" textAnchor="middle" x="80" y="185">Mar</text>
                  <text className="text-xs fill-gray-400" textAnchor="middle" x="130" y="185">Mie</text>
                  <text className="text-xs fill-gray-400" textAnchor="middle" x="180" y="185">Jue</text>
                  <text className="text-xs fill-gray-400" textAnchor="middle" x="230" y="185">Vie</text>
                  <text className="text-xs fill-gray-400" textAnchor="middle" x="280" y="185">Sab</text>
                </svg>
              </div>
            )}
            {activeTab === 'type' && (
              <div className="w-full h-full flex items-center justify-center relative" id="doughnut-chart-container">
                <svg className="transform -rotate-90" height="180" viewBox="0 0 100 100" width="180">
                  <circle className="stroke-current text-gray-200" cx="50" cy="50" fill="transparent" r="40" strokeWidth="12"></circle>
                  <circle className="stroke-current text-purple-600" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset="125.6" strokeWidth="12"></circle>
                  <circle className="stroke-current text-blue-500" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset="188.4" strokeWidth="12"></circle>
                  <circle className="stroke-current text-green-500" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset="226.08" strokeWidth="12"></circle>
                  <circle className="stroke-current text-red-500" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset="251.2" strokeWidth="12"></circle>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold text-gray-800">25h</span>
                  <span className="text-sm text-gray-500">Total</span>
                </div>
              </div>
            )}
            {activeTab === 'skill' && (
              <div className="w-full h-full flex items-end justify-around px-4" id="bar-chart-container">
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-8 bg-purple-600" style={{ height: '70%' }}></div>
                  <span className="text-xs text-gray-500">Reading</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-8 bg-blue-500" style={{ height: '90%' }}></div>
                  <span className="text-xs text-gray-500">Listening</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-8 bg-green-500" style={{ height: '50%' }}></div>
                  <span className="text-xs text-gray-500">Speaking</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-8 bg-red-500" style={{ height: '75%' }}></div>
                  <span className="text-xs text-gray-500">Writing</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-8 bg-yellow-500" style={{ height: '40%' }}></div>
                  <span className="text-xs text-gray-500">Grammar</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Historial de Actividad</h2>
          <div className="space-y-3">
            {filteredLogsForPeriod.map(log => (
              <div key={log.id} className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-lg p-3 mr-4">
                    <i className="material-icons">{log.category === 'Listening' ? 'headphones' : log.category === 'Study' ? 'school' : log.category === 'Watching' ? 'movie' : 'menu_book'}</i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{log.custom_title || log.sub_activity}</p>
                    <p className="text-sm text-gray-500">{log.custom_title ? log.sub_activity : ''} {log.custom_title && log.category ? `(${log.category})` : log.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-700">{formatDurationFromSeconds(log.duration_seconds, 'mm')} min</p>
                  <p className="text-sm text-gray-400">{formatDisplayDateForLogList(log.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <div className="fixed bottom-24 right-6 z-20">
        <button onClick={() => navigate('/log')} className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center w-16 h-16">
          <i className="material-icons text-4xl">add</i>
        </button>
      </div>
      <footer className="bg-white/70 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)] fixed bottom-0 w-full rounded-t-2xl">
        <nav className="flex justify-around py-3">
          <a className="flex flex-col items-center justify-center nav-inactive w-16" href="#">
            <i className="material-icons">dashboard</i>
            <span className="text-xs mt-1">Dashboard</span>
          </a>
          <a className="flex flex-col items-center justify-center nav-active w-16" href="#">
            <i className="material-icons">trending_up</i>
            <span className="text-xs mt-1">Tracker</span>
          </a>
          <a className="flex flex-col items-center justify-center nav-inactive w-16" href="#">
            <i className="material-icons">list_alt</i>
            <span className="text-xs mt-1">Routines</span>
          </a>
          <a className="flex flex-col items-center justify-center nav-inactive w-16" href="#">
            <i className="material-icons">people</i>
            <span className="text-xs mt-1">Social</span>
          </a>
          <a className="flex flex-col items-center justify-center nav-inactive w-16" href="#">
            <i className="material-icons">store</i>
            <span className="text-xs mt-1">Store</span>
          </a>
        </nav>
      </footer>
    </div>
  );
};

export default TrackerScreen;