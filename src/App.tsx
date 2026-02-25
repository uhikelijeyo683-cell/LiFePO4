import React from 'react';
import { TheorySection } from './components/TheorySection';
import { BatterySimulation } from './components/BatterySimulation';
import { VideoGenerator } from './components/VideoGenerator';
import { Zap, Snowflake } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-20">
      {/* Hero Section */}
      <header className="bg-slate-900 text-white pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Snowflake size={300} />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-4 text-blue-300">
            <Zap size={24} />
            <span className="font-mono tracking-wider uppercase text-sm">Engineering Analysis</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            LFP Battery Charging <br/>
            <span className="text-blue-400">at Extreme Cold (-30°C)</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            Interactive visualization of the thermodynamic vs. kinetic conflict in LiFePO4 cells.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 -mt-16 space-y-8 relative z-20">
        
        {/* Simulation Card */}
        <BatterySimulation />

        {/* Theory Card */}
        <TheorySection />

        {/* AI Video Generator */}
        <VideoGenerator />

      </main>

      <footer className="text-center text-slate-400 text-sm mt-20 pb-8">
        <p>Built with React, Tailwind, and Google Veo 3</p>
      </footer>
    </div>
  );
}
