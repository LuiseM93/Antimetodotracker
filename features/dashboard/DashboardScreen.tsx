import React from 'react';

const DashboardScreen: React.FC = () => {
  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-purple-50">
      <header className="fixed top-0 left-0 right-0 z-30 bg-[var(--brand-primary)] text-white shadow-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--brand-primary)]">
              <span className="text-2xl font-bold">A</span>
            </div>
            <span className="text-xl font-bold">El Antimetodo</span>
          </div>
          <button className="text-white">
            <span className="material-symbols-outlined !text-2xl">settings</span>
          </button>
        </div>
      </header>
      <div className="flex-grow pt-16 pb-28">
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hello Alex!</h1>
              <p className="text-gray-500">Let's learn Spanish today.</p>
            </div>
            <button className="relative">
              <img alt="User avatar" className="h-14 w-14 rounded-full border-4 border-purple-200 object-cover shadow-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8uIWr0KU2dFmKYzy_BGZ6B55qQ7KMWr1DO49kxbs9q15I9e_iclJx-jmDgv1vL3Yw8AEghoIDvJ7RDzhoqahb3il_jE6k52AfG_TkhvGZlVXAd2IlSxgbrNa_jY1fF1E0z4NrreE2Ah4jC63XVeB3pK54yHqKzUpkapatuw-ihAufDWx2Fts4DOMTvDfyZS5jIUCMWq3d-ZtO9_pNPr2o4lfbzTzfYhkQNj0tFF10xFsORtiwsrb3gH9ijGgN6fB4_v-RbpjU2Co"/>
              <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full border-2 border-white bg-green-400"></span>
            </button>
          </div>
        </div>
        <div className="px-5">
          <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl bg-white p-3 text-center shadow-lg">
            <div>
              <p className="text-sm font-semibold text-gray-500">Points</p>
              <p className="text-lg font-bold text-purple-700">1,250</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Study Days</p>
              <p className="text-lg font-bold text-purple-700">42</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Consistency</p>
              <p className="text-lg font-bold text-purple-700">85%</p>
            </div>
          </div>
        </div>
        <main className="p-5 pt-0">
          <section className="mb-6">
            <div className="relative rounded-2xl bg-white p-6 text-center shadow-lg">
              <div className="relative flex flex-col items-center justify-center">
                <svg className="h-48 w-48">
                  <circle className="text-purple-100" cx="96" cy="96" fill="transparent" r="60" stroke="currentColor" strokeWidth="12"></circle>
                  <circle className="text-purple-600 transition-all duration-1000" cx="96" cy="96" fill="transparent" r="60" stroke="currentColor" strokeLinecap="round" strokeWidth="12" transform="rotate(-90 96 96)"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-purple-800">75%</p>
                  <p className="text-sm font-medium text-gray-500">150/200 min</p>
                </div>
              </div>
              <p className="mt-4 text-lg font-semibold text-gray-700">Today's Habits Progress</p>
            </div>
          </section>
          <section className="mb-8">
            <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 p-5 text-white shadow-lg">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-200">Your Focus</h3>
              <p className="mt-1 text-2xl font-bold">Total Immersion</p>
            </div>
          </section>
          <section className="mb-8">
            <h3 className="mb-4 text-xl font-bold text-gray-900">Recent Activity</h3>
            <div className="space-y-4">
              <div className="rounded-xl bg-white p-4 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                    <span className="material-symbols-outlined">headset</span>
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800">Listening Practice</p>
                    <p className="text-sm text-gray-500">Podcast: "News in Slow Spanish"</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-purple-700">+25 XP</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                    <span className="material-symbols-outlined">school</span>
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800">Lesson 5 Completed</p>
                    <p className="text-sm text-gray-500">Grammar: Past Tense</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-green-700">+50 XP</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section>
            <h3 className="mb-4 text-xl font-bold text-gray-900">Personal Goals</h3>
            <div className="space-y-4">
              <div className="rounded-xl bg-white p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-800">Complete 20 lessons</p>
                  <p className="text-sm font-medium text-gray-500">14 / 20</p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-purple-100">
                  <div className="h-2 rounded-full bg-purple-600" style={{ width: '70%' }}></div>
                </div>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-800">Listen to 10 podcasts</p>
                  <p className="text-sm font-medium text-gray-500">5 / 10</p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-purple-100">
                  <div className="h-2 rounded-full bg-purple-600" style={{ width: '50%' }}></div>
                </div>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-800">Achieve 30-day streak</p>
                  <p className="text-sm font-medium text-gray-500">21 / 30</p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-purple-100">
                  <div className="h-2 rounded-full bg-purple-600" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
      <button className="fixed bottom-24 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition-transform duration-300 hover:scale-110 active:bg-purple-700">
        <span className="material-symbols-outlined !text-4xl">add</span>
      </button>
      <footer className="fixed bottom-0 left-0 right-0 z-20 rounded-t-2xl border-t border-gray-200 bg-white pb-3 pt-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around">
          <a className="flex flex-1 flex-col items-center justify-end gap-1 text-purple-700" href="#">
            <div className="flex h-8 w-16 items-center justify-center rounded-full bg-purple-100">
              <span className="material-symbols-outlined !text-2xl">dashboard</span>
            </div>
            <p className="text-xs font-semibold tracking-wide">Dashboard</p>
          </a>
          <a className="flex flex-1 flex-col items-center justify-end gap-1 text-gray-500 transition-colors hover:text-purple-700" href="#">
            <div className="flex h-8 w-16 items-center justify-center">
              <span className="material-symbols-outlined !text-2xl">monitoring</span>
            </div>
            <p className="text-xs font-medium tracking-wide">Tracker</p>
          </a>
          <a className="flex flex-1 flex-col items-center justify-end gap-1 text-gray-500 transition-colors hover:text-purple-700" href="#">
            <div className="flex h-8 w-16 items-center justify-center">
              <span className="material-symbols-outlined !text-2xl">all_inbox</span>
            </div>
            <p className="text-xs font-medium tracking-wide">Routines</p>
          </a>
          <a className="flex flex-1 flex-col items-center justify-end gap-1 text-gray-500 transition-colors hover:text-purple-700" href="#">
            <div className="flex h-8 w-16 items-center justify-center">
              <span className="material-symbols-outlined !text-2xl">group</span>
            </div>
            <p className="text-xs font-medium tracking-wide">Social</p>
          </a>
          <a className="flex flex-1 flex-col items-center justify-end gap-1 text-gray-500 transition-colors hover:text-purple-700" href="#">
            <div className="flex h-8 w-16 items-center justify-center">
              <span className="material-symbols-outlined !text-2xl">store</span>
            </div>
            <p className="text-xs font-medium tracking-wide">Store</p>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default DashboardScreen;