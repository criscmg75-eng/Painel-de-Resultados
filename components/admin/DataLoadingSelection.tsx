import React from 'react';
import { View } from '../../types';
import Card from '../ui/Card';

interface DataLoadingSelectionProps {
  setView: (view: View) => void;
}

const ChartBarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);


const DataLoadingSelection: React.FC<DataLoadingSelectionProps> = ({ setView }) => {
  return (
    <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Seleção de Carregamento</h1>
            <p className="text-gray-500 mt-2">Escolha qual indicador você deseja carregar os dados.</p>
        </div>
        <button onClick={() => setView(View.ADMIN_DASHBOARD)} className="text-sm text-indigo-600 hover:underline">
          Voltar
        </button>
      </div>
      <div className="space-y-4">
        <Card
          icon={<ChartBarIcon />}
          title="Produtividade"
          description="Carregar dados para o indicador de produtividade."
          onClick={() => setView(View.DATA_LOADING)}
        />
        <Card
          icon={<ChartBarIcon />}
          title="Efetividade"
          description="Carregar dados para o indicador de efetividade."
          onClick={() => setView(View.DATA_LOADING_EFFECTIVENESS)}
        />
      </div>
    </div>
  );
};

export default DataLoadingSelection;