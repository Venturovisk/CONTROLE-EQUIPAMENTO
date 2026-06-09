import { useState, useMemo } from 'react';
import { Plus, Search, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select, TextArea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { AppStore } from '@/store/useStore';
import { formatDate, formatCurrency } from '@/utils/helpers';

interface MaintenancePageProps {
  store: AppStore;
}

export function MaintenancePage({ store }: MaintenancePageProps) {
  const { maintenances, equipment, addMaintenance } = store;

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    equipmentId: '',
    date: new Date().toISOString().split('T')[0],
    problemReported: '',
    diagnosis: '',
    solution: '',
    technician: '',
    cost: 0,
  });

  const sorted = useMemo(() => {
    return [...maintenances]
      .filter(m => {
        return !searchTerm || [m.equipmentName, m.equipmentCode, m.problemReported, m.technician]
          .some(f => f?.toLowerCase().includes(searchTerm.toLowerCase()));
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [maintenances, searchTerm]);

  const totalCost = maintenances.reduce((sum, m) => sum + (m.cost || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eq = equipment.find(e2 => e2.id === formData.equipmentId);
    if (!eq) return;

    addMaintenance({
      equipmentId: eq.id,
      equipmentName: eq.name,
      equipmentCode: eq.patrimonialCode,
      date: formData.date,
      problemReported: formData.problemReported,
      diagnosis: formData.diagnosis,
      solution: formData.solution,
      technician: formData.technician,
      cost: formData.cost,
    });

    setShowForm(false);
    setFormData({
      equipmentId: '',
      date: new Date().toISOString().split('T')[0],
      problemReported: '',
      diagnosis: '',
      solution: '',
      technician: '',
      cost: 0,
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manutenções</h1>
          <p className="text-gray-500">{maintenances.length} registro(s) · Custo total: {formatCurrency(totalCost)}</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Nova Manutenção
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Buscar por equipamento, problema, técnico..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <div className="space-y-3">
        {sorted.map(m => (
          <Card key={m.id} className="p-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="p-2 bg-yellow-50 rounded-lg self-start">
                <Wrench className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-900">{m.equipmentName}</span>
                  <span className="text-xs font-mono text-gray-400">{m.equipmentCode}</span>
                  <span className="text-sm text-gray-400">· {formatDate(m.date)}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">Problema: </span>
                    <span className="text-gray-700">{m.problemReported}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Diagnóstico: </span>
                    <span className="text-gray-700">{m.diagnosis}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Solução: </span>
                    <span className="text-gray-700">{m.solution}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Técnico: </span>
                    <span className="text-gray-700">{m.technician}</span>
                  </div>
                </div>
                <Badge className="bg-orange-100 text-orange-800">
                  Custo: {formatCurrency(m.cost)}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
        {sorted.length === 0 && (
          <Card className="p-12 text-center text-gray-400">
            Nenhuma manutenção registrada
          </Card>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nova Manutenção" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Equipamento *"
            options={[
              { value: '', label: 'Selecione o equipamento...' },
              ...equipment.map(e => ({ value: e.id, label: `${e.patrimonialCode} - ${e.name}` }))
            ]}
            value={formData.equipmentId}
            onChange={e => setFormData(p => ({ ...p, equipmentId: e.target.value }))}
          />
          <Input label="Data *" type="date" required value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
          <TextArea label="Problema Relatado *" required value={formData.problemReported} onChange={e => setFormData(p => ({ ...p, problemReported: e.target.value }))} />
          <TextArea label="Diagnóstico" value={formData.diagnosis} onChange={e => setFormData(p => ({ ...p, diagnosis: e.target.value }))} />
          <TextArea label="Solução Aplicada" value={formData.solution} onChange={e => setFormData(p => ({ ...p, solution: e.target.value }))} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Técnico Responsável" value={formData.technician} onChange={e => setFormData(p => ({ ...p, technician: e.target.value }))} />
            <Input label="Custo (R$)" type="number" step="0.01" min="0" value={formData.cost || ''} onChange={e => setFormData(p => ({ ...p, cost: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit">Registrar Manutenção</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
