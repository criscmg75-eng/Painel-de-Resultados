import React from 'react';
import { View } from '../../types';
import Card from '../ui/Card';

interface EffectivenessDataSelectionScreenProps {
  setView: (view: View) => void;
}

const DocumentTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const CollectionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
);

const GlobeAltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 00-9-9m9 9a9 9 0 00-9-9" />
    </svg>
);


const EffectivenessDataSelectionScreen: React.FC<EffectivenessDataSelectionScreenProps> = ({ setView }) => {
  return (
    <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Carregamento - Efetividade</h1>
            <p className="text-gray-500 mt-2">Escolha o tipo de dado de efetividade para carregar.</p>
        </div>
        <button onClick={() => setView(View.DATA_LOADING_SELECTION)} className="text-sm text-indigo-600 hover:underline">
          Voltar
        </button>
      </div>
      <div className="space-y-4">
        <Card
          icon={<DocumentTextIcon />}
          title="Dados diários"
          description="Carregue os dados detalhados por dia e DVV."
          onClick={() => setView(View.DATA_LOADING_EFFECTIVENESS)}
        />
        <Card
          icon={<CollectionIcon />}
          title="Dados Consolidados Semanais"
          description="Carregue os totais consolidados por semana."
          onClick={() => alert('Funcionalidade ainda não implementada.')}
        />
        <Card
          icon={<GlobeAltIcon />}
          title="Dados Consolidados Área"
          description="Carregue os totais consolidados para a área."
          onClick={() => alert('Funcionalidade ainda não implementada.')}
        />
      </div>
    </div>
  );
};

export default EffectivenessDataSelectionScreen;