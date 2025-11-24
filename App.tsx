import React, { useState, useEffect } from 'react';
import { User, View } from './types';
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
import RankingPEScreen from './components/results/RankingPEScreen';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import PESelectionScreen from './components/cockpit/PESelectionScreen';
import ProductivityDataSelectionScreen from './components/admin/ProductivityDataSelectionScreen';
import EffectivenessDataSelectionScreen from './components/admin/EffectivenessDataSelectionScreen';
import DataLoadingProductivityWeeklyZone from './components/admin/DataLoadingProductivityWeeklyZone';
import DataLoadingProductivityDailyArea from './components/admin/DataLoadingProductivityDailyArea';
import DataLoadingProductivityWeeklyArea from './components/admin/DataLoadingProductivityWeeklyArea';
import DataLoadingEffectivenessWeeklyZone from './components/admin/DataLoadingEffectivenessWeeklyZone';
import DataLoadingEffectivenessDailyArea from './components/admin/DataLoadingEffectivenessDailyArea';
import DataLoadingEffectivenessWeeklyArea from './components/admin/DataLoadingEffectivenessWeeklyArea';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.LOGIN);

  useEffect(() => {
    // Initialize ADMIN user if it doesn't exist in Firestore
    const checkAdmin = async () => {
      const adminDocRef = doc(db, "users", "ADMIN_USER_ID");
      const adminDocSnap = await getDoc(adminDocRef);

      if (!adminDocSnap.exists()) {
        const adminUser: Omit<User, 'id'> = {
          zona: 'ADMIN',
          area: 'ADMIN',
          telefone: '',
          senha: '1234',
          tipoacesso: 'ADMIN',
        };
        await setDoc(adminDocRef, adminUser);
      } else {
        const adminData = adminDocSnap.data();
        if (!adminData.tipoacesso) {
          await setDoc(adminDocRef, { tipoacesso: 'ADMIN' }, { merge: true });
        }
      }
    };
    checkAdmin();
  }, []);


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
      case View.DATA_LOADING_PRODUCTIVITY_SELECTION:
        return <ProductivityDataSelectionScreen setView={setCurrentView} />;
      case View.DATA_LOADING_EFFECTIVENESS_SELECTION:
        return <EffectivenessDataSelectionScreen setView={setCurrentView} />;
      case View.DATA_LOADING:
        return <DataLoading setView={setCurrentView} />;
      case View.DATA_LOADING_EFFECTIVENESS:
        return <DataLoadingEffectiveness setView={setCurrentView} />;
      case View.DATA_LOADING_PRODUCTIVITY_WEEKLY_ZONE:
        return <DataLoadingProductivityWeeklyZone setView={setCurrentView} />;
      case View.DATA_LOADING_PRODUCTIVITY_DAILY_AREA:
        return <DataLoadingProductivityDailyArea setView={setCurrentView} />;
      case View.DATA_LOADING_PRODUCTIVITY_WEEKLY_AREA:
        return <DataLoadingProductivityWeeklyArea setView={setCurrentView} />;
      case View.DATA_LOADING_EFFECTIVENESS_WEEKLY_ZONE:
        return <DataLoadingEffectivenessWeeklyZone setView={setCurrentView} />;
      case View.DATA_LOADING_EFFECTIVENESS_DAILY_AREA:
        return <DataLoadingEffectivenessDailyArea setView={setCurrentView} />;
      case View.DATA_LOADING_EFFECTIVENESS_WEEKLY_AREA:
        return <DataLoadingEffectivenessWeeklyArea setView={setCurrentView} />;
      case View.COCKPIT:
        return <Cockpit user={currentUser!} onLogout={handleLogout} setView={setCurrentView} />;
      case View.PE_SELECTION:
        return <PESelectionScreen setView={setCurrentView} />;
      case View.PE_RESULTS:
        return <PEResultsScreen user={currentUser!} setView={setCurrentView} />;
      case View.RANKING_PE:
        return <RankingPEScreen user={currentUser!} setView={setCurrentView} />;
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