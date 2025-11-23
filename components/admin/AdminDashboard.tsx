import React from 'react';
import { View } from '../../types';
import Card from '../ui/Card';

interface AdminDashboardProps {
  setView: (view: View) => void;
  onLogout: () => void;
}

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const DataUploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);


const AdminDashboard: React.FC<AdminDashboardProps> = ({ setView, onLogout }) => {
  return (
    <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-indigo-800">Painel do Administrador</h1>
            <p className="text-gray-500 mt-2">Selecione uma opção para gerenciar o sistema.</p>
        </div>
        <button onClick={onLogout} className="text-sm text-indigo-600 hover:underline">Sair</button>
      </div>
      <div className="space-y-4">
        <Card
          icon={<UsersIcon />}
          title="Gerenciamento de Usuários"
          description="Adicione, remova ou visualize os usuários do sistema."
          onClick={() => setView(View.USER_MANAGEMENT)}
        />
        <Card
          icon={<SettingsIcon />}
          title="Parâmetros do Sistema"
          description="Configure os targets e valores de referência para os painéis."
          onClick={() => setView(View.SYSTEM_PARAMETERS)}
        />
         <Card
          icon={<DataUploadIcon />}
          title="Carregamento de Dados"
          description="Importe, exporte ou exclua dados dos indicadores."
          onClick={() => setView(View.DATA_LOADING_SELECTION)}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;