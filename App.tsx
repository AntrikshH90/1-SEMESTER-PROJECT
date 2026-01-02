import React, { useState, useEffect, useRef } from 'react';
import { Settings, Info, ShieldCheck } from 'lucide-react';
import { ZoneConfig } from './components/ZoneConfig';
import { ActiveMonitor } from './components/ActiveMonitor';
import { Coordinates, Zone, calculateDistance, isLocationInZone } from './utils/geolocation';
import { generateReminder } from './services/geminiService';
import { VibrationType, VIBRATION_PATTERNS } from './utils/vibration';

const App: React.FC = () => {
  // State
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [activeZone, setActiveZone] = useState<Zone | null>(null);
  
  // Settings
  const [entryVibration, setEntryVibration] = useState<VibrationType>('pulse');
  const [exitVibration, setExitVibration] = useState<VibrationType>('short');
  
  // UI State
  const [distanceToNearest, setDistanceToNearest] = useState<number | null>(null);
  const [nearestZone, setNearestZone] = useState<Zone | null>(null);
  const [reminderMessage, setReminderMessage] = useState<string>("");
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Initialize Geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionError("Geolocation is not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setPermissionError(null);
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || null,
          altitudeAccuracy: position.coords.altitudeAccuracy || null
        };
        setCurrentLocation(coords);
      },
      (error) => {
        console.error("Geo error:", error);
        setPermissionError("Please enable location services to use this app.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Monitor Zones Logic
  useEffect(() => {
    if (!currentLocation || zones.length === 0) {
      setDistanceToNearest(null);
      setNearestZone(null);
      return;
    }

    let minDistance = Infinity;
    let closest: Zone | null = null;
    let foundActive: Zone | null = null;

    // Check all zones
    zones.forEach(zone => {
      // For display purposes, we show simple 2D distance
      const dist = calculateDistance(currentLocation, zone.coordinates);
      
      // Track nearest for display info
      if (dist < minDistance) {
        minDistance = dist;
        closest = zone;
      }

      // Check if inside (includes Altitude Logic if enabled)
      if (isLocationInZone(currentLocation, zone)) {
        foundActive = zone;
      }
    });

    setDistanceToNearest(minDistance === Infinity ? null : minDistance);
    setNearestZone(closest);

    // State Transition Logic
    if (activeZone?.id !== foundActive?.id) {
       // Transition Happened
       if (foundActive) {
         // Entered a zone (or switched zones directly)
         handleTransition(true, foundActive);
       } else {
         // Exited all zones
         handleTransition(false, activeZone!); // Pass the one we just left for context
       }
       setActiveZone(foundActive);
    }

  }, [currentLocation, zones, activeZone]);

  const handleTransition = async (entered: boolean, zoneContext: Zone) => {
    // Generate AI Message
    const msg = await generateReminder(zoneContext.subject || 'Class', entered ? 'enter' : 'exit');
    setReminderMessage(msg);

    // Provide Haptic Feedback based on settings
    if (navigator.vibrate) {
      const patternKey = entered ? entryVibration : exitVibration;
      const pattern = VIBRATION_PATTERNS[patternKey];
      if (pattern && pattern.length > 0) {
        navigator.vibrate(pattern);
      }
    }
  };

  const handleAddZone = (newZoneData: Omit<Zone, 'id'>) => {
    const newZone: Zone = {
      ...newZoneData,
      id: crypto.randomUUID()
    };
    setZones(prev => [...prev, newZone]);
    setReminderMessage(`Added class: ${newZone.name}`);
  };

  const handleRemoveZone = (id: string) => {
    setZones(prev => prev.filter(z => z.id !== id));
    if (activeZone?.id === id) {
      setActiveZone(null);
      setReminderMessage("Class removed. Monitoring stopped.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      {/* Header */}
      <header className="px-6 py-5 flex justify-between items-center bg-slate-900/50 backdrop-blur border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
             <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            SilentZone
          </h1>
        </div>
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className={`p-2 rounded-lg transition-colors ${showConfig ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      <main className="container mx-auto px-4 pt-6 max-w-lg space-y-6">
        
        {permissionError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{permissionError}</p>
          </div>
        )}

        {/* Configuration Panel (Collapsible) */}
        {showConfig && (
          <div className="animate-fade-in-down">
            <ZoneConfig
              currentLocation={currentLocation}
              zones={zones}
              entryVibration={entryVibration}
              exitVibration={exitVibration}
              onAddZone={handleAddZone}
              onRemoveZone={handleRemoveZone}
              onUpdateEntryVibration={setEntryVibration}
              onUpdateExitVibration={setExitVibration}
            />
          </div>
        )}

        {/* Main Status Monitor */}
        <ActiveMonitor 
          activeZone={activeZone}
          nearestZone={nearestZone}
          distanceToNearest={distanceToNearest}
          reminderMessage={reminderMessage}
          hasZones={zones.length > 0}
        />

        {/* Instructions / Info */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">How it works</h3>
          <ul className="space-y-4">
            <li className="flex gap-3 text-sm text-slate-300">
              <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-indigo-400 font-bold text-xs">1</span>
              <span>Go to a classroom (or cabin) and open settings.</span>
            </li>
            <li className="flex gap-3 text-sm text-slate-300">
              <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-indigo-400 font-bold text-xs">2</span>
              <span>Check "Strict Floor Check" if you have classes directly above/below your cabin.</span>
            </li>
            <li className="flex gap-3 text-sm text-slate-300">
              <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-indigo-400 font-bold text-xs">3</span>
              <span>The app will now check your altitude before silencing your phone.</span>
            </li>
          </ul>
        </div>

      </main>
    </div>
  );
};

export default App;