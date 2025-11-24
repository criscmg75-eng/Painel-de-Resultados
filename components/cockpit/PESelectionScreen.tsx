import React from 'react';
import { View } from '../../types';
import Card from '../ui/Card';

interface PESelectionScreenProps {
  setView: (view: View) => void;
}

const ChartBarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8V4m0 4h.01M9 8h6m-6 0h.01M12 20.947A4.5 4.5 0 0015.75 16H8.25A4.5 4.5 0 0012 20.947zM12 20.947V16m0 4.947a4.5 4.5 0 01-3.75-4.947H15.75A4.5 4.5 0 0112 20.947zM5 8h14M5 8a2 2 0 01-2-2V4a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2M5 8v8a2 2 0 002 2h10a2 2 0 002-2V8" />
    </svg>
);


const PESelectionScreen: React.FC<PESelectionScreenProps> = ({ setView }) => {
  return (
    <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Seleção P&E</h1>
            <p className="text-gray-500 mt-2">Escolha qual visualização você deseja acessar.</p>
        </div>
        <button onClick={() => setView(View.COCKPIT)} className="text-sm text-indigo-600 hover:underline">
          Voltar
        </button>
      </div>
      <div className="space-y-4">
        <Card
          icon={<ChartBarIcon />}
          title="Resultados - P&E"
          description="Visualize os resultados detalhados por DVV."
          onClick={() => setView(View.PE_RESULTS)}
        />
        <Card
          icon={<TrophyIcon />}
          title="Ranking - P&E"
          description="Compare o desempenho e a classificação das zonas."
          onClick={() => setView(View.RANKING_PE)}
        />
      </div>
    </div>
  );
};

export default PESelectionScreen;