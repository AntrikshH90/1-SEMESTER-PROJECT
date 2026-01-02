import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Smartphone, Play, BookOpen, Ruler, Layers, AlertTriangle } from 'lucide-react';
import { Coordinates, Zone } from '../utils/geolocation';
import { VibrationType, VIBRATION_LABELS, VIBRATION_PATTERNS } from '../utils/vibration';

interface ZoneConfigProps {
  currentLocation: Coordinates | null;
  zones: Zone[];
  entryVibration: VibrationType;
  exitVibration: VibrationType;
  onAddZone: (zone: Omit<Zone, 'id'>) => void;
  onRemoveZone: (id: string) => void;
  onUpdateEntryVibration: (type: VibrationType) => void;
  onUpdateExitVibration: (type: VibrationType) => void;
}

export const ZoneConfig: React.FC<ZoneConfigProps> = ({
  currentLocation,
  zones,
  entryVibration,
  exitVibration,
  onAddZone,
  onRemoveZone,
  onUpdateEntryVibration,
  onUpdateExitVibration
}) => {
  // Local state for the new zone form
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [radius, setRadius] = useState(25);
  const [useAltitude, setUseAltitude] = useState(false);

  const handleTestVibration = (type: VibrationType) => {
    if (navigator.vibrate) {
      navigator.vibrate(VIBRATION_PATTERNS[type]);
    }
  };

  const handleAdd = () => {
    if (currentLocation && name && subject) {
      onAddZone({
        name,
        subject,
        radius,
        coordinates: currentLocation,
        useAltitude: useAltitude && currentLocation.altitude !== null,
        heightTolerance: 4 // Default roughly 1 floor (4 meters)
      });
      setName('');
      setSubject('');
      setUseAltitude(false);
    }
  };

  const hasAltitudeSignal = currentLocation?.altitude !== null;

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 space-y-8">
      
      {/* ADD NEW ZONE SECTION */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center text-white">
          <MapPin className="mr-2 text-indigo-400" />
          Add New Class
        </h2>
        
        {/* Signal Status */}
        <div className="mb-4 flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700">
           <span className="text-xs text-slate-400">GPS Signal</span>
           <div className="text-right">
             <div className="text-xs font-mono text-emerald-400">
               {currentLocation ? `${currentLocation.latitude.toFixed(5)}, ${currentLocation.longitude.toFixed(5)}` : 'Scanning...'}
             </div>
             <div className={`text-xs flex items-center justify-end gap-1 ${hasAltitudeSignal ? 'text-indigo-400' : 'text-slate-600'}`}>
               <Layers className="w-3 h-3" />
               {hasAltitudeSignal ? `Alt: ${Math.round(currentLocation.altitude!)}m` : 'No Altitude Data'}
             </div>
           </div>
        </div>
        
        <div className="space-y-4">
           {/* Inputs Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Class Name (e.g. Room 101)</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Room Name"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Subject (e.g. History)</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
           </div>

          {/* Radius Slider */}
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
             <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400 flex items-center gap-2"><Ruler className="w-3 h-3"/> Trigger Radius</span>
              <span className="text-indigo-400 font-bold">{radius}m</span>
             </div>
             <input 
              type="range" 
              min="10" 
              max="100" 
              step="5"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
             />
          </div>

          {/* Altitude Toggle */}
          <div className={`p-3 rounded-lg border transition-colors ${useAltitude ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-900/50 border-slate-700'}`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={useAltitude}
                onChange={(e) => setUseAltitude(e.target.checked)}
                disabled={!hasAltitudeSignal}
                className="mt-1 w-4 h-4 rounded bg-slate-800 border-slate-600 text-indigo-500 focus:ring-indigo-500" 
              />
              <div>
                <span className={`block text-sm font-medium ${hasAltitudeSignal ? 'text-white' : 'text-slate-500'}`}>
                  Strict Floor Check
                </span>
                <span className="block text-xs text-slate-400 mt-1">
                  Only silence if altitude matches (approx. +/- 4m). Useful if your cabin is directly below the classroom.
                </span>
                {!hasAltitudeSignal && (
                  <span className="flex items-center gap-1 text-xs text-amber-500 mt-2">
                    <AlertTriangle className="w-3 h-3" /> Altitude not available on this device/browser.
                  </span>
                )}
              </div>
            </label>
          </div>

          <button 
            onClick={handleAdd}
            disabled={!currentLocation || !name || !subject}
            className={`w-full flex items-center justify-center py-3 rounded-xl font-semibold transition-all
              ${currentLocation && name && subject
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
          >
            <Plus className="w-5 h-5 mr-2" />
            Save Current Location
          </button>
        </div>
      </div>

      {/* EXISTING ZONES LIST */}
      {zones.length > 0 && (
        <div className="border-t border-slate-700 pt-6">
          <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">Your Classes</h3>
          <div className="space-y-3">
            {zones.map((zone) => (
              <div key={zone.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex justify-between items-center group hover:border-indigo-500/50 transition-colors">
                <div>
                  <h4 className="font-bold text-white flex items-center gap-2">
                    {zone.name}
                    {zone.useAltitude && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Floor Locked
                      </span>
                    )}
                  </h4>
                  <div className="flex gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3"/> {zone.subject}</span>
                    <span className="flex items-center gap-1"><Ruler className="w-3 h-3"/> {zone.radius}m</span>
                    {zone.useAltitude && zone.coordinates.altitude && (
                       <span className="flex items-center gap-1"><Layers className="w-3 h-3"/> Alt: {Math.round(zone.coordinates.altitude)}m</span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => onRemoveZone(zone.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIBRATION SETTINGS */}
      <div className="border-t border-slate-700 pt-6">
        <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-4">
          <Smartphone className="w-4 h-4" />
          Haptic Feedback
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">On Entering (Silent)</label>
            <div className="flex gap-2">
              <select 
                value={entryVibration}
                onChange={(e) => onUpdateEntryVibration(e.target.value as VibrationType)}
                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {Object.entries(VIBRATION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <button onClick={() => handleTestVibration(entryVibration)} className="p-2 bg-slate-700 rounded-lg text-indigo-400">
                <Play className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">On Leaving (Ring)</label>
            <div className="flex gap-2">
              <select 
                value={exitVibration}
                onChange={(e) => onUpdateExitVibration(e.target.value as VibrationType)}
                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {Object.entries(VIBRATION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <button onClick={() => handleTestVibration(exitVibration)} className="p-2 bg-slate-700 rounded-lg text-indigo-400">
                <Play className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};