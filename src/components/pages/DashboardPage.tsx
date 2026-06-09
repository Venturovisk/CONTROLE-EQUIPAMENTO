import {
  Monitor, Package, Wrench, AlertTriangle, DollarSign,
  Shield, ShieldAlert, ShieldCheck, TrendingUp
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { AppStore } from '@/store/useStore';
import { formatCurrency, warrantyStatus, warrantyDaysRemaining, formatDate } from '@/utils/helpers';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface DashboardPageProps {
  store: AppStore;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#ec4899'];

export function DashboardPage({ store }: DashboardPageProps) {
  const { equipment, movements } = store;

  const totalEquipment = equipment.length;
  const inUse = equipment.filter(e => e.status === 'Em uso').length;
  const inStock = equipment.filter(e => e.status === 'Em estoque').length;
  const inMaintenance = equipment.filter(e => e.status === 'Em manutenção').length;
  const lost = equipment.filter(e => e.status === 'Extraviado').length;
  const totalValue = equipment.reduce((sum, e) => sum + (e.purchaseValue || 0), 0);

  const expiredWarranties = equipment.filter(e => e.warrantyEnd && warrantyStatus(e.warrantyEnd) === 'expired').length;
  const expiringWarranties = equipment.filter(e => e.warrantyEnd && warrantyStatus(e.warrantyEnd) === 'expiring').length;

  // Category chart data
  const categoryMap = new Map<string, number>();
  equipment.forEach(e => {
    categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + 1);
  });
  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Sector chart data
  const sectorMap = new Map<string, number>();
  equipment.forEach(e => {
    const sector = e.sector || 'Sem setor';
    sectorMap.set(sector, (sectorMap.get(sector) || 0) + 1);
  });
  const sectorData = Array.from(sectorMap.entries()).map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Status chart data
  const statusMap = new Map<string, number>();
  equipment.forEach(e => {
    statusMap.set(e.status, (statusMap.get(e.status) || 0) + 1);
  });
  const statusData = Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));

  // Sector value data
  const sectorValueMap = new Map<string, number>();
  equipment.forEach(e => {
    const sector = e.sector || 'Sem setor';
    sectorValueMap.set(sector, (sectorValueMap.get(sector) || 0) + (e.purchaseValue || 0));
  });
  const sectorValueData = Array.from(sectorValueMap.entries()).map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Warranties expiring soon
  const expiringList = equipment
    .filter(e => e.warrantyEnd && warrantyStatus(e.warrantyEnd) === 'expiring')
    .map(e => ({ ...e, daysLeft: warrantyDaysRemaining(e.warrantyEnd) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  // Recent movements
  const recentMovements = [...movements].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  const statCards = [
    { label: 'Total de Equipamentos', value: totalEquipment, icon: <Monitor className="w-6 h-6" />, color: 'bg-blue-500', bgLight: 'bg-blue-50' },
    { label: 'Em Uso', value: inUse, icon: <TrendingUp className="w-6 h-6" />, color: 'bg-green-500', bgLight: 'bg-green-50' },
    { label: 'Em Estoque', value: inStock, icon: <Package className="w-6 h-6" />, color: 'bg-cyan-500', bgLight: 'bg-cyan-50' },
    { label: 'Em Manutenção', value: inMaintenance, icon: <Wrench className="w-6 h-6" />, color: 'bg-yellow-500', bgLight: 'bg-yellow-50' },
    { label: 'Extraviados', value: lost, icon: <AlertTriangle className="w-6 h-6" />, color: 'bg-red-500', bgLight: 'bg-red-50' },
    { label: 'Garantias Vencidas', value: expiredWarranties, icon: <ShieldAlert className="w-6 h-6" />, color: 'bg-red-500', bgLight: 'bg-red-50' },
    { label: 'Garantias Vencendo', value: expiringWarranties, icon: <Shield className="w-6 h-6" />, color: 'bg-yellow-500', bgLight: 'bg-yellow-50' },
    { label: 'Valor do Patrimônio', value: formatCurrency(totalValue), icon: <DollarSign className="w-6 h-6" />, color: 'bg-emerald-500', bgLight: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral do patrimônio da empresa</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {typeof card.value === 'number' ? card.value.toLocaleString('pt-BR') : card.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.bgLight}`}>
                <div className={`${card.color} text-white p-2 rounded-lg`}>
                  {card.icon}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment by Category */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipamentos por Categoria</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Nenhum equipamento cadastrado
            </div>
          )}
        </Card>

        {/* Equipment by Sector */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipamentos por Setor</h3>
          {sectorData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Nenhum equipamento cadastrado
            </div>
          )}
        </Card>

        {/* Status Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Equipamentos</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Nenhum equipamento cadastrado
            </div>
          )}
        </Card>

        {/* Patrimônio por Setor */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Valor Patrimonial por Setor</h3>
          {sectorValueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectorValueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Nenhum equipamento cadastrado
            </div>
          )}
        </Card>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Warranties */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-yellow-500" />
            Garantias Próximas do Vencimento
          </h3>
          {expiringList.length > 0 ? (
            <div className="space-y-3">
              {expiringList.map(eq => (
                <div key={eq.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{eq.name}</p>
                    <p className="text-sm text-gray-500">{eq.patrimonialCode}</p>
                  </div>
                  <Badge className="bg-yellow-200 text-yellow-800">
                    {eq.daysLeft} dias restantes
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Nenhuma garantia próxima do vencimento</p>
          )}
        </Card>

        {/* Recent Movements */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Movimentações Recentes</h3>
          {recentMovements.length > 0 ? (
            <div className="space-y-3">
              {recentMovements.map(mov => (
                <div key={mov.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{mov.equipmentName}</p>
                    <p className="text-sm text-gray-500">{mov.type}</p>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(mov.date)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Nenhuma movimentação registrada</p>
          )}
        </Card>
      </div>
    </div>
  );
}
