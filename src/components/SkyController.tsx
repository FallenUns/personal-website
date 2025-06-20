// src/components/SkyController.tsx
import React from 'react';

interface SkyControllerProps {
  time: number;
  onTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isAuto: boolean;
  onToggleAuto: () => void;
}

const SkyController: React.FC<SkyControllerProps> = ({
  time,
  onTimeChange,
  isDarkMode,
  onToggleDarkMode,
  isAuto,
  onToggleAuto
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm p-4">
        <div className="w-full text-white p-4">
          <div className="mb-4">
            <label htmlFor="time-slider" className="block text-sm font-medium mb-2">
              Manual Time Control ({String(Math.floor(time)).padStart(2, '0')}:{String(Math.round((time % 1) * 60)).padStart(2, '0')})
            </label>
            <input
              id="time-slider"
              type="range"
              min="0"
              max="23.99"
              step="0.01"
              value={time}
              onChange={onTimeChange}
              disabled={isAuto}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span>Auto-Sync Time</span>
              <button
                onClick={onToggleAuto}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAuto ? 'bg-blue-400' : 'bg-gray-500'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAuto ? 'translate-x-6' : 'translate-x-1'}`}/>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              {/* Text updated from "Night/Day" to "Dark/Light" */}
              <span>{isDarkMode ? 'Dark' : 'Light'} Mode</span>
              <button
                onClick={onToggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-purple-500' : 'bg-yellow-400'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default SkyController;