import React, { useState } from 'react';
import FeedScreen from '../feed/FeedScreen.tsx';
import LeaderboardScreen from '../leaderboard/LeaderboardScreen.tsx';
import ProfileScreen from '../profile/ProfileScreen.tsx';

const SocialScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('feed'); // Default to feed

  return (
    <div className="min-h-screen" id="social-screen">
      <header className="bg-[#4a148c] p-4 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Comunidad</h1>
          <button className="text-white">
            <span className="material-icons">notifications</span>
          </button>
        </div>
      </header>
      <main className="p-4 container mx-auto">
        <div className="w-full">
          <div className="mb-4 border-b border-gray-200">
            <nav aria-label="Tabs" className="-mb-px flex space-x-8">
              <button
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'feed' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setActiveTab('feed')}
              >
                Feed
              </button>
              <button
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'leaderboard' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setActiveTab('leaderboard')}
              >
                Clasificación
              </button>
              <button
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setActiveTab('profile')}
              >
                Mi Perfil
              </button>
            </nav>
          </div>
          {activeTab === 'feed' && <FeedScreen />}
          {activeTab === 'leaderboard' && <LeaderboardScreen />}
          {activeTab === 'profile' && <ProfileScreen />}
        </div>
      </main>
      <div className="pb-20"></div>
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-t-md flex justify-around py-2 border-t border-gray-200">
        <a className="text-center text-gray-500 hover:text-purple-600" href="#">
          <span className="material-icons">dashboard</span>
          <span className="text-xs block">Dashboard</span>
        </a>
        <a className="text-center text-gray-500 hover:text-purple-600" href="#">
          <span className="material-icons">track_changes</span>
          <span className="text-xs block">Tracker</span>
        </a>
        <a className="text-center text-gray-500 hover:text-purple-600" href="#">
          <span className="material-icons">article</span>
          <span className="text-xs block">Routines</span>
        </a>
        <a className="text-center text-purple-600 font-bold" href="#">
          <span className="material-icons">people</span>
          <span className="text-xs block">Social</span>
        </a>
        <a className="text-center text-gray-500 hover:text-purple-600" href="#">
          <span className="material-icons">store</span>
          <span className="text-xs block">Store</span>
        </a>
      </nav>
    </div>
  );
};

export default SocialScreen;
