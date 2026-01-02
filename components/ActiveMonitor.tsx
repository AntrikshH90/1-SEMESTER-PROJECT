import React from 'react';
import { Bell, BellOff, MapPin, Navigation } from 'lucide-react';
import { Zone } from '../utils/geolocation';

interface ActiveMonitorProps {
  activeZone: Zone | null;
  nearestZone: Zone | null;
  distanceToNearest: number | null;
  reminderMessage: string;
  hasZones: boolean;
}

export const ActiveMonitor: React.FC<ActiveMonitorProps> = ({
  activeZone,
  nearestZone,
  distanceToNearest,
  reminderMessage,
  hasZones
}) => {

  if (!hasZones) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
        <MapPin className="w-12 h-12 mb-4 opacity-50" />
        <p>No classes configured.</p>
        <p className="text-sm">Add a class location below.</p>
      </div>
    );
  }

  const isInsideZone = !!activeZone;

  return (
    <div className={`
      relative overflow-hidden rounded-3xl p-8 text-center transition-all duration-700 shadow-2xl
      ${isInsideZone 
        ? 'bg-gradient-to-br from-rose-900 to-red-950 border-2 border-rose-500/50 shadow-rose-900/50' 
        : 'bg-gradient-to-br from-emerald-900 to-teal-950 border-2 border-emerald-500/50 shadow-emerald-900/50'}
    `}>
      {/* Background Pulse Effect */}
      <div className={`absolute inset-0 opacity-20 pointer-events-none ${isInsideZone ? 'bg-red-500 animate-pulse-slow' : 'bg-emerald-500'}`}></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Status Icon */}
        <div className={`
          w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all duration-500
          ${isInsideZone ? 'bg-rose-500/20 text-rose-200' : 'bg-emerald-500/20 text-emerald-200'}
        `}>
          {isInsideZone ? (
            <BellOff className="w-16 h-16 animate-bounce" />
          ) : (
            <Bell className="w-16 h-16" />
          )}
        </div>

        {/* Main Status Text */}
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          {isInsideZone ? 'SILENT MODE' : 'RINGER ON'}
        </h1>
        
        <p className={`text-lg font-medium mb-6 ${isInsideZone ? 'text-rose-200' : 'text-emerald-200'}`}>
          {isInsideZone 
            ? `You are in ${activeZone?.name}` 
            : nearestZone 
              ? `You are outside ${nearestZone.name}`
              : 'You are outside all classes'}
        </p>

        {/* Stats */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center gap-4 border border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-slate-400" />
            <span className="text-xl font-mono text-white">
              {distanceToNearest !== null ? Math.round(distanceToNearest) : '---'} <span className="text-sm text-slate-400">meters to {isInsideZone ? 'exit' : 'class'}</span>
            </span>
          </div>
        </div>

        {/* AI Reminder Message */}
        {reminderMessage && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 max-w-sm border border-white/10">
            <p className="text-sm italic text-white/90">
              "{reminderMessage}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};