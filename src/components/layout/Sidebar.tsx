import {
  LayoutDashboard, Monitor, Users, ArrowLeftRight,
  Wrench, Shield, Building2, FileText, BarChart3,
  QrCode, LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import type { AppUser } from '@/types';

export type PageKey =
  | 'dashboard' | 'equipment' | 'collaborators' | 'movements'
  | 'maintenance' | 'warranties' | 'workstations' | 'terms'
  | 'reports' | 'qrcode';

interface SidebarProps {
  activePage: PageKey;
  onPageChange: (page: PageKey) => void;
  currentUser: AppUser;
  onLogout: () => void;
}

const menuItems: { key: PageKey; label: string; icon: React.ReactNode; section?: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, section: 'Principal' },
  { key: 'equipment', label: 'Equipamentos', icon: <Monitor className="w-5 h-5" />, section: 'Cadastros' },
  { key: 'collaborators', label: 'Colaboradores', icon: <Users className="w-5 h-5" /> },
  { key: 'workstations', label: 'Estações', icon: <Building2 className="w-5 h-5" /> },
  { key: 'movements', label: 'Movimentações', icon: <ArrowLeftRight className="w-5 h-5" />, section: 'Operações' },
  { key: 'maintenance', label: 'Manutenção', icon: <Wrench className="w-5 h-5" /> },
  { key: 'warranties', label: 'Garantias', icon: <Shield className="w-5 h-5" /> },
  { key: 'terms', label: 'Termos', icon: <FileText className="w-5 h-5" />, section: 'Documentos' },
  { key: 'reports', label: 'Relatórios', icon: <BarChart3 className="w-5 h-5" /> },
  { key: 'qrcode', label: 'QR Code', icon: <QrCode className="w-5 h-5" /> },
];

export function Sidebar({ activePage, onPageChange, currentUser, onLogout }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
    

  const roleLabels = { admin: 'Administrador', gestor: 'Gestor', usuario: 'Usuário' };

  const nav = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">PatriControl</h1>
            <p className="text-xs text-gray-400">Controle Patrimonial</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.key}>
            {item.section && (
              <p className="px-3 pt-4 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {item.section}
              </p>
            )}
            <button
              onClick={() => { onPageChange(item.key); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activePage === item.key
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          </div>
        ))}
      </nav>

      {/* User Info */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">{currentUser.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-400">{roleLabels[currentUser.role]}</p>
          </div>
          <button onClick={onLogout} className="p-1.5 rounded-lg hover:bg-sidebar-hover text-gray-400 hover:text-white">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar rounded-lg text-white shadow-lg"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-sidebar min-h-screen fixed left-0 top-0 bottom-0 z-30">
        {nav}
      </aside>

      {/* Mobile sidebar */}
      <aside className={`lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-sidebar z-50 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {nav}
      </aside>
    </>
  );
}
