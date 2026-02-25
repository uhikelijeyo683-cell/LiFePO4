import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ThermometerSun } from 'lucide-react';

export const BatterySimulation: React.FC = () => {
  // UI State (for controls)
  const [uiTemperature, setUiTemperature] = useState<number>(-30);
  const [uiIsCharging, setUiIsCharging] = useState<boolean>(false);
  const [uiHeaterOn, setUiHeaterOn] = useState<boolean>(false);
  const [uiDendriteLevel, setUiDendriteLevel] = useState<number>(0);
  const [uiChargeLevel, setUiChargeLevel] = useState<number>(20);

  // Simulation State (Refs for performance in animation loop)
  const temperatureRef = useRef<number>(-30);
  const isChargingRef = useRef<boolean>(false);
  const heaterOnRef = useRef<boolean>(false);
  const dendriteLevelRef = useRef<number>(0);
  const chargeLevelRef = useRef<number>(20);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  // Simulation constants
  const IONS_COUNT = 40;
  const ions = useRef(Array.from({ length: IONS_COUNT }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 200 + 50,
    speed: 0,
    state: 'electrolyte' // 'electrolyte', 'intercalated', 'plated'
  })));

  // Sync UI state to Refs
  useEffect(() => { temperatureRef.current = uiTemperature; }, [uiTemperature]);
  useEffect(() => { isChargingRef.current = uiIsCharging; }, [uiIsCharging]);
  useEffect(() => { heaterOnRef.current = uiHeaterOn; }, [uiHeaterOn]);

  // Main Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const temp = temperatureRef.current;
      const charging = isChargingRef.current;
      const heater = heaterOnRef.current;

      // --- Physics Update ---

      // Heater Logic
      if (heater) {
        if (temperatureRef.current < 25) {
          temperatureRef.current += 0.1;
          setUiTemperature(Math.round(temperatureRef.current * 10) / 10); // Sync back to UI occasionally
        }
      }

      const mobility = Math.max(0.05, (temp + 40) / 70); // 0.05 at -40, ~1.0 at +30
      const intercalationProbability = temp > 0 ? 0.95 : 0.05; // Sharp drop-off below 0°C

      ions.current.forEach(ion => {
        if (charging) {
          // Move towards anode (right)
          if (ion.state === 'electrolyte') {
            ion.x += (ion.speed + 0.5) * mobility;
            
            // Accelerate slightly
            if (ion.speed < 2) ion.speed += 0.05;

            // Collision with Anode Boundary
            if (ion.x > canvas.width - 60) {
              if (Math.random() < intercalationProbability) {
                // Success: Intercalation
                ion.state = 'intercalated';
                ion.x = canvas.width - 40 + Math.random() * 30;
                ion.y = Math.random() * (canvas.height - 20) + 10;
                chargeLevelRef.current = Math.min(100, chargeLevelRef.current + 0.2);
              } else {
                // Failure: Plating (Dendrite)
                ion.state = 'plated';
                ion.x = canvas.width - 55 - (Math.random() * 5); // Stick to surface
                dendriteLevelRef.current = Math.min(100, dendriteLevelRef.current + 0.5);
              }
            }
          }
        } else {
           // Random movement (diffusion) when not charging
           if (ion.state === 'electrolyte') {
             ion.x += (Math.random() - 0.5) * mobility;
             ion.y += (Math.random() - 0.5) * mobility;
             
             // Keep in bounds
             if (ion.x < 50) ion.x = 50;
             if (ion.x > canvas.width - 60) ion.x = canvas.width - 60;
           }
        }

        // Reset ion if it goes off screen or completes cycle (for visual continuity)
        if (ion.state !== 'electrolyte' && Math.random() < 0.01) {
           ion.state = 'electrolyte';
           ion.x = 10;
           ion.y = Math.random() * (canvas.height - 40) + 20;
           ion.speed = 0;
        }
      });

      // Sync simulation state to UI state for display (throttled by React, but we do it here for simplicity)
      // Actually, let's just draw the values on canvas to avoid React re-renders during animation
      // We only update the React state for the "Critical Failure" overlay or other UI elements outside canvas
      if (Math.random() < 0.1) {
         setUiDendriteLevel(dendriteLevelRef.current);
         setUiChargeLevel(chargeLevelRef.current);
      }

      // --- Drawing ---

      // 1. Backgrounds
      // Cathode (Left)
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, 0, 50, canvas.height);
      
      // Anode (Right)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(canvas.width - 50, 0, 50, canvas.height);

      // Electrolyte (Middle)
      // Color changes with temperature: Blue (cold) -> Yellow/Warm (hot)
      const coldColor = [206, 231, 254]; // Light Blue
      const warmColor = [254, 243, 199]; // Light Yellow
      const tFactor = Math.min(1, Math.max(0, (temp + 30) / 60)); // 0 at -30, 1 at +30
      
      const r = Math.round(coldColor[0] + (warmColor[0] - coldColor[0]) * tFactor);
      const g = Math.round(coldColor[1] + (warmColor[1] - coldColor[1]) * tFactor);
      const b = Math.round(coldColor[2] + (warmColor[2] - coldColor[2]) * tFactor);
      
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
      ctx.fillRect(50, 0, canvas.width - 100, canvas.height);

      // Heater overlay
      if (heater) {
        ctx.fillStyle = `rgba(255, 100, 0, ${0.1 + Math.sin(Date.now() / 200) * 0.05})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. Labels
      ctx.fillStyle = '#fff';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('Cathode (Li+ Source)', 5, 20);
      ctx.fillText('Anode (Graphite)', canvas.width - 95, 20);

      // 3. Ions
      ions.current.forEach(ion => {
        ctx.beginPath();
        ctx.arc(ion.x, ion.y, 4, 0, Math.PI * 2);
        if (ion.state === 'plated') {
            ctx.fillStyle = '#ef4444'; // Red
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#ef4444';
        } else if (ion.state === 'intercalated') {
            ctx.fillStyle = '#22c55e'; // Green
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = '#3b82f6'; // Blue
            ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      });

      // 4. Dendrites (Visual representation of accumulation)
      if (dendriteLevelRef.current > 0) {
        const dendriteWidth = (dendriteLevelRef.current / 100) * 80;
        ctx.beginPath();
        // Draw jagged lines from anode surface inwards
        ctx.moveTo(canvas.width - 50, canvas.height / 2);
        ctx.lineTo(canvas.width - 50 - dendriteWidth, canvas.height / 2);
        
        // Add some random jaggedness
        for(let i=0; i<5; i++) {
            const y = (canvas.height/5) * i + 30;
            const w = (dendriteLevelRef.current / 100) * (50 + Math.random() * 30);
            ctx.moveTo(canvas.width - 50, y);
            ctx.lineTo(canvas.width - 50 - w, y + (Math.random() - 0.5) * 10);
        }

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationRef.current);
  }, []); // Empty dependency array = run once and use refs

  const resetSim = () => {
    setUiIsCharging(false);
    setUiHeaterOn(false);
    setUiTemperature(-30);
    setUiDendriteLevel(0);
    setUiChargeLevel(20);

    isChargingRef.current = false;
    heaterOnRef.current = false;
    temperatureRef.current = -30;
    dendriteLevelRef.current = 0;
    chargeLevelRef.current = 20;

    ions.current.forEach(ion => {
      ion.x = Math.random() * 100;
      ion.state = 'electrolyte';
      ion.speed = 0;
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">Interactive Simulation</h2>
        <div className="flex gap-4 text-sm font-mono">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span> Li+ Ion
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span> Safe
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span> Plated (Dendrite)
            </div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 h-[350px]">
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={350} 
            className="w-full h-full"
          />
          
          {/* HUD */}
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur p-3 rounded-lg text-xs font-mono border border-slate-700 text-slate-300 space-y-1">
            <div className="flex justify-between w-32">
                <span>Temp:</span>
                <span className={uiTemperature < 0 ? "text-blue-400" : "text-orange-400"}>
                    {uiTemperature.toFixed(1)}°C
                </span>
            </div>
            <div className="flex justify-between w-32">
                <span>Charge:</span>
                <span className="text-green-400">{uiChargeLevel.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between w-32">
                <span>Dendrites:</span>
                <span className={uiDendriteLevel > 20 ? "text-red-500 font-bold" : "text-slate-400"}>
                    {uiDendriteLevel.toFixed(1)}%
                </span>
            </div>
          </div>

          {/* Warnings */}
          {uiDendriteLevel > 50 && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900/40 backdrop-blur-[2px] z-10">
              <div className="bg-red-600 text-white px-6 py-4 rounded-xl font-bold animate-pulse shadow-xl border border-red-400 text-center">
                CRITICAL FAILURE DETECTED<br/>
                <span className="text-sm font-normal opacity-90">Short Circuit Imminent due to Dendrite Growth</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-72 space-y-6">
          
          {/* Main Actions */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Charger Control</div>
            <button 
              onClick={() => setUiIsCharging(!uiIsCharging)}
              disabled={uiDendriteLevel > 50}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${
                uiIsCharging 
                  ? 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {uiIsCharging ? <Pause size={18} /> : <Play size={18} />}
              {uiIsCharging ? 'PAUSE CHARGING' : 'START CHARGING'}
            </button>
            
            <button 
              onClick={resetSim}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium"
            >
              <RotateCcw size={14} /> Reset Simulation
            </button>
          </div>

          {/* Thermal Management */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Thermal Management (BMS)</div>
            
            <button 
              onClick={() => setUiHeaterOn(!uiHeaterOn)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                uiHeaterOn 
                  ? 'bg-orange-50 border-orange-200 text-orange-700 shadow-inner' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 shadow-sm'
              }`}
            >
              <span className="flex items-center gap-2 font-medium">
                <ThermometerSun size={18} /> Pre-heating System
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${uiHeaterOn ? 'bg-orange-200 text-orange-800' : 'bg-slate-100 text-slate-500'}`}>
                {uiHeaterOn ? 'ACTIVE' : 'OFF'}
              </span>
            </button>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Manual Override</span>
                <span>{uiTemperature}°C</span>
              </div>
              <input 
                type="range" 
                min="-40" 
                max="40" 
                value={uiTemperature} 
                onChange={(e) => setUiTemperature(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-40°C</span>
                <span>0°C</span>
                <span>+40°C</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100 leading-relaxed">
            <strong>Experiment:</strong>
            <ol className="list-decimal ml-4 mt-1 space-y-1">
              <li>Set Temp to <strong>-30°C</strong>. Start Charging. Watch dendrites form (red).</li>
              <li>Reset. Turn on <strong>Pre-heating</strong>. Wait for Temp {'>'} 0°C.</li>
              <li>Start Charging. Watch safe intercalation (green).</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
