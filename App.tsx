import React, { useState, useEffect } from 'react';
import { User, View } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import LoginScreen from './components/auth/LoginScreen';
import ChangePasswordScreen from './components/auth/ChangePasswordScreen';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import SystemParameters from './components/admin/SystemParameters';
import DataLoading from './components/admin/DataLoading';
import DataLoadingSelection from './components/admin/DataLoadingSelection';
import DataLoadingEffectiveness from './components/admin/DataLoadingEffectiveness';
import Cockpit from './components/cockpit/Cockpit';
import PEResultsScreen from './components/results/PEResultsScreen';

const App: React.FC = () => {
  const [users, setUsers] = useLocalStorage<User[]>('users', []);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.LOGIN);

  useEffect(() => {
    // Initialize ADMIN user if no users exist
    if (users.length === 0) {
      const adminUser: User = {
        id: '1',
        zona: 'ADMIN',
        area: 'ADMIN',
        telefone: '',
        senha: '1234', // Set initial password
      };
      setUsers([adminUser]);
    }
  }, [users, setUsers]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.zona.toUpperCase() === 'ADMIN') {
      setCurrentView(View.ADMIN_DASHBOARD);
    } else {
      setCurrentView(View.COCKPIT);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView(View.LOGIN);
  };
  
  const renderContent = () => {
    switch (currentView) {
      case View.LOGIN:
        return <LoginScreen setView={setCurrentView} onLogin={handleLogin} />;
      case View.CHANGE_PASSWORD:
        return <ChangePasswordScreen setView={setCurrentView} />;
      case View.ADMIN_DASHBOARD:
        return <AdminDashboard setView={setCurrentView} onLogout={handleLogout} />;
      case View.USER_MANAGEMENT:
        return <UserManagement setView={setCurrentView} />;
      case View.SYSTEM_PARAMETERS:
        return <SystemParameters setView={setCurrentView} />;
      case View.DATA_LOADING_SELECTION:
        return <DataLoadingSelection setView={setCurrentView} />;
      case View.DATA_LOADING:
        return <DataLoading setView={setCurrentView} />;
      case View.DATA_LOADING_EFFECTIVENESS:
        return <DataLoadingEffectiveness setView={setCurrentView} />;
      case View.COCKPIT:
        return <Cockpit user={currentUser!} onLogout={handleLogout} setView={setCurrentView} />;
      case View.PE_RESULTS:
        return <PEResultsScreen user={currentUser!} setView={setCurrentView} />;
      default:
        return <LoginScreen setView={setCurrentView} onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      {renderContent()}
    </div>
  );
};

export default App;