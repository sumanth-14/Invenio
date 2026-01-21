import { useState } from 'react';
import JobDashboard from './components/JobDashboard';
import Settings from './components/Settings';

function App() {
  const [view, setView] = useState('dashboard');

  return (
    <div className="min-h-screen font-sans selection:bg-[#014D4E]/30 text-black">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#014D4E] flex items-center justify-center shadow-md shadow-[#014D4E]/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-black">Invenio</span>
          </div>

          <div className="flex gap-2 p-1 rounded-lg">
            <button
              onClick={() => setView('dashboard')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all border ${view === 'dashboard'
                ? 'bg-[#014D4E] text-white border-[#014D4E] shadow-md'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView('settings')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all border ${view === 'settings'
                ? 'bg-[#014D4E] text-white border-[#014D4E] shadow-md'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
            >
              Settings
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="animate-fade-in">
          {view === 'dashboard' ? <JobDashboard /> : <Settings />}
        </div>
      </main>
    </div>
  );
}

export default App;
