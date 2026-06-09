import { useMemo, useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import type { AppStore } from '@/store/useStore';
import { formatDate, warrantyDaysRemaining, warrantyStatus, warrantyColor } from '@/utils/helpers';

interface WarrantiesPageProps {
  store: AppStore;
}

export function WarrantiesPage({ store }: WarrantiesPageProps) {
  const { equipment } = store;
  const [filter, setFilter] = useState('all');

  const withWarranty = useMemo(() => {
    return equipment
      .filter(e => e.warrantyEnd)
      .map(e => ({
        ...e,
        daysLeft: warrantyDaysRemaining(e.warrantyEnd),
        wStatus: warrantyStatus(e.warrantyEnd),
      }))
      .filter(e => {
        if (filter === 'expired') return e.wStatus === 'expired';
        if (filter === 'expiring') return e.wStatus === 'expiring';
        if (filter === 'active') return e.wStatus === 'active';
        return true;
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [equipment, filter]);

  const expired = equipment.filter(e => e.warrantyEnd && warrantyStatus(e.warrantyEnd) === 'expired').length;
  const expiring = equipment.filter(e => e.warrantyEnd && warrantyStatus(e.warrantyEnd) === 'expiring').length;
  const active = equipment.filter(e => e.warrantyEnd && warrantyStatus(e.warrantyEnd) === 'active').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Garantias</h1>
        <p className="text-gray-500">Controle de garantias dos equipamentos</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-600">{expired}</p>
              <p className="text-sm text-gray-500">Garantias Vencidas</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-yellow-500">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold text-yellow-600">{expiring}</p>
              <p className="text-sm text-gray-500">Vencendo em 30 dias</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-green-600">{active}</p>
              <p className="text-sm text-gray-500">Garantias Ativas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <Select
          label="Filtrar por Status"
          options={[
            { value: 'all', label: 'Todas as Garantias' },
            { value: 'expired', label: '🔴 Vencidas' },
            { value: 'expiring', label: '🟡 Vencendo em 30 dias' },
            { value: 'active', label: '🟢 Ativas' },
          ]}
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </Card>

      {/* List */}
      <div className="space-y-3">
        {withWarranty.map(eq => (
          <Card key={eq.id} className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className={`p-2 rounded-lg ${eq.wStatus === 'expired' ? 'bg-red-50' : eq.wStatus === 'expiring' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                <Shield className={`w-5 h-5 ${eq.wStatus === 'expired' ? 'text-red-500' : eq.wStatus === 'expiring' ? 'text-yellow-500' : 'text-green-500'}`} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-900">{eq.name}</span>
                  <span className="text-xs font-mono text-gray-400">{eq.patrimonialCode}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {eq.brand} {eq.model} · Responsável: {eq.responsibleName || '-'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">
                  {formatDate(eq.warrantyStart)} → {formatDate(eq.warrantyEnd)}
                </p>
                <Badge className={warrantyColor(eq.warrantyEnd)}>
                  {eq.wStatus === 'expired'
                    ? `Vencida há ${Math.abs(eq.daysLeft)} dias`
                    : `${eq.daysLeft} dias restantes`}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
        {withWarranty.length === 0 && (
          <Card className="p-12 text-center text-gray-400">
            Nenhuma garantia encontrada
          </Card>
        )}
      </div>
    </div>
  );
}
