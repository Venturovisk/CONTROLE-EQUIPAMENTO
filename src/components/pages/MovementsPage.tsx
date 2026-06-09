import { useState, useMemo } from 'react';
import { Plus, Search, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select, TextArea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { AppStore } from '@/store/useStore';
import type { MovementType } from '@/types';
import { MOVEMENT_TYPES } from '@/types';
import { formatDate } from '@/utils/helpers';

interface MovementsPageProps {
  store: AppStore;
}

export function MovementsPage({ store }: MovementsPageProps) {
  const { movements, equipment, collaborators, addMovement, updateEquipment } = store;

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [formData, setFormData] = useState({
    equipmentId: '',
    type: 'Entrada' as MovementType,
    fromResponsible: '',
    toResponsible: '',
    fromLocation: '',
    toLocation: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const sorted = useMemo(() => {
    return [...movements]
      .filter(m => {
        const matchSearch = !searchTerm || [m.equipmentName, m.equipmentCode, m.type, m.fromResponsible, m.toResponsible]
          .some(f => f?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchType = !filterType || m.type === filterType;
        return matchSearch && matchType;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [movements, searchTerm, filterType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eq = equipment.find(e2 => e2.id === formData.equipmentId);
    if (!eq) return;

    addMovement({
      equipmentId: eq.id,
      equipmentName: eq.name,
      equipmentCode: eq.patrimonialCode,
      type: formData.type,
      fromResponsible: formData.fromResponsible,
      toResponsible: formData.toResponsible,
      fromLocation: formData.fromLocation,
      toLocation: formData.toLocation,
      date: formData.date,
      notes: formData.notes,
    });

    // Update equipment status based on movement type
    const statusMap: Partial<Record<MovementType, string>> = {
      'Entrada': 'Em estoque',
      'Saída': 'Em uso',
      'Envio para Manutenção': 'Em manutenção',
      'Retorno da Manutenção': 'Em estoque',
      'Baixa Patrimonial': 'Baixado',
    };
    const newStatus = statusMap[formData.type];
    if (newStatus) {
      updateEquipment(eq.id, { status: newStatus as typeof eq.status });
    }

    // Update responsible on transfer
    if (formData.type === 'Transferência' || formData.type === 'Troca de Responsável') {
      const newCollab = collaborators.find(c => c.fullName === formData.toResponsible);
      if (newCollab) {
        updateEquipment(eq.id, {
          responsibleId: newCollab.id,
          responsibleName: newCollab.fullName,
          responsibleRole: newCollab.role,
        });
      }
    }

    setShowForm(false);
    setFormData({
      equipmentId: '',
      type: 'Entrada',
      fromResponsible: '',
      toResponsible: '',
      fromLocation: '',
      toLocation: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleEquipmentSelect = (eqId: string) => {
    const eq = equipment.find(e2 => e2.id === eqId);
    setFormData(prev => ({
      ...prev,
      equipmentId: eqId,
      fromResponsible: eq?.responsibleName || '',
      fromLocation: eq ? `${eq.unit} / ${eq.sector}` : '',
    }));
  };

  const movementColor = (type: string) => {
    switch (type) {
      case 'Entrada': return 'bg-green-100 text-green-800';
      case 'Saída': return 'bg-blue-100 text-blue-800';
      case 'Transferência': return 'bg-purple-100 text-purple-800';
      case 'Troca de Responsável': return 'bg-cyan-100 text-cyan-800';
      case 'Envio para Manutenção': return 'bg-yellow-100 text-yellow-800';
      case 'Retorno da Manutenção': return 'bg-teal-100 text-teal-800';
      case 'Baixa Patrimonial': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Movimentações</h1>
          <p className="text-gray-500">{sorted.length} registro(s)</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Nova Movimentação
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            options={[{ value: '', label: 'Todos os Tipos' }, ...MOVEMENT_TYPES.map(t => ({ value: t, label: t }))]}
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          />
        </div>
      </Card>

      <div className="space-y-3">
        {sorted.map(mov => (
          <Card key={mov.id} className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <ArrowLeftRight className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={movementColor(mov.type)}>{mov.type}</Badge>
                  <span className="text-sm font-medium text-gray-900">{mov.equipmentName}</span>
                  <span className="text-xs text-gray-400 font-mono">{mov.equipmentCode}</span>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {mov.fromResponsible && <span>De: {mov.fromResponsible}</span>}
                  {mov.fromResponsible && mov.toResponsible && <span> → </span>}
                  {mov.toResponsible && <span>Para: {mov.toResponsible}</span>}
                </div>
                {mov.notes && <p className="text-xs text-gray-400 mt-1">{mov.notes}</p>}
              </div>
              <div className="text-sm text-gray-400 whitespace-nowrap">{formatDate(mov.date)}</div>
            </div>
          </Card>
        ))}
        {sorted.length === 0 && (
          <Card className="p-12 text-center text-gray-400">
            Nenhuma movimentação registrada
          </Card>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nova Movimentação" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Equipamento *"
            options={[
              { value: '', label: 'Selecione o equipamento...' },
              ...equipment.map(e => ({ value: e.id, label: `${e.patrimonialCode} - ${e.name}` }))
            ]}
            value={formData.equipmentId}
            onChange={e => handleEquipmentSelect(e.target.value)}
          />
          <Select
            label="Tipo de Movimentação *"
            options={MOVEMENT_TYPES.map(t => ({ value: t, label: t }))}
            value={formData.type}
            onChange={e => setFormData(p => ({ ...p, type: e.target.value as MovementType }))}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="De (Responsável)" value={formData.fromResponsible} onChange={e => setFormData(p => ({ ...p, fromResponsible: e.target.value }))} />
            <Select
              label="Para (Responsável)"
              options={[
                { value: '', label: 'Selecione...' },
                ...collaborators.filter(c => c.status === 'Ativo').map(c => ({ value: c.fullName, label: c.fullName }))
              ]}
              value={formData.toResponsible}
              onChange={e => setFormData(p => ({ ...p, toResponsible: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Local de Origem" value={formData.fromLocation} onChange={e => setFormData(p => ({ ...p, fromLocation: e.target.value }))} />
            <Input label="Local de Destino" value={formData.toLocation} onChange={e => setFormData(p => ({ ...p, toLocation: e.target.value }))} />
          </div>
          <Input label="Data *" type="date" required value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
          <TextArea label="Observações" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit">Registrar Movimentação</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
