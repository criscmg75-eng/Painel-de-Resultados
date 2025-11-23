import React from 'react';
import { User, View } from '../../types';

interface CockpitProps {
  user: User;
  onLogout: () => void;
  setView: (view: View) => void;
}

const Cockpit: React.FC<CockpitProps> = ({ user, onLogout, setView }) => {
  const indicators = [
    { name: 'P&E', view: View.PE_RESULTS, enabled: true },
    { name: 'Parceria', enabled: false },
    { name: 'Inadimplência', enabled: false },
    { name: 'ULP', enabled: false },
    { name: 'F&S', enabled: false },
    { name: 'Varejo 360º', enabled: false }
  ];

  return (
    <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-lg space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Cockpit</h1>
          <p className="text-gray-500 mt-2">Bem-vindo, {user.zona}!</p>
        </div>
        <button onClick={onLogout} className="text-sm text-indigo-600 hover:underline">Sair</button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {indicators.map(indicator => (
          <button 
            key={indicator.name}
            onClick={() => indicator.enabled && indicator.view && setView(indicator.view)}
            disabled={!indicator.enabled}
            className={`p-6 rounded-lg shadow-md transition-all duration-300 font-semibold text-lg ${
              indicator.enabled
                ? 'bg-indigo-50 text-indigo-700 hover:shadow-lg hover:bg-indigo-100 cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {indicator.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Cockpit;