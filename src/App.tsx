import { useState } from 'react';
import { useAppStore } from './store/useStore';
import { Sidebar } from './components/layout/Sidebar';
import type { PageKey } from './components/layout/Sidebar';
import { LoginPage } from './components/pages/LoginPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { EquipmentPage } from './components/pages/EquipmentPage';
import { CollaboratorsPage } from './components/pages/CollaboratorsPage';
import { MovementsPage } from './components/pages/MovementsPage';
import { MaintenancePage } from './components/pages/MaintenancePage';
import { WarrantiesPage } from './components/pages/WarrantiesPage';
import { WorkstationsPage } from './components/pages/WorkstationsPage';
import { TermsPage } from './components/pages/TermsPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { QRCodePage } from './components/pages/QRCodePage';

export default function App() {
  const store = useAppStore();
  const [activePage, setActivePage] = useState<PageKey>('dashboard');

  if (!store.currentUser) {
    return <LoginPage onLogin={store.login} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage store={store} />;
      case 'equipment': return <EquipmentPage store={store} />;
      case 'collaborators': return <CollaboratorsPage store={store} />;
      case 'movements': return <MovementsPage store={store} />;
      case 'maintenance': return <MaintenancePage store={store} />;
      case 'warranties': return <WarrantiesPage store={store} />;
      case 'workstations': return <WorkstationsPage store={store} />;
      case 'terms': return <TermsPage store={store} />;
      case 'reports': return <ReportsPage store={store} />;
      case 'qrcode': return <QRCodePage store={store} />;
      default: return <DashboardPage store={store} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        activePage={activePage}
        onPageChange={setActivePage}
        currentUser={store.currentUser}
        onLogout={store.logout}
      />
      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        {renderPage()}
      </main>
    </div>
  );
}
