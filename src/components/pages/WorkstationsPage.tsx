import { useState } from 'react';
import { Plus, Trash2, Edit, Monitor, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { AppStore } from '@/store/useStore';
import { statusColor } from '@/utils/helpers';

interface WorkstationsPageProps {
  store: AppStore;
}

export function WorkstationsPage({ store }: WorkstationsPageProps) {
  const { workstations, equipment, collaborators, addWorkstation, updateWorkstation, deleteWorkstation } = store;

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    responsibleId: '',
    responsibleName: '',
    location: '',
    sector: '',
    equipmentIds: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateWorkstation(editingId, formData);
    } else {
      addWorkstation(formData);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', responsibleId: '', responsibleName: '', location: '', sector: '', equipmentIds: [] });
  };

  const handleEdit = (ws: typeof workstations[0]) => {
    setFormData({
      name: ws.name,
      responsibleId: ws.responsibleId,
      responsibleName: ws.responsibleName,
      location: ws.location,
      sector: ws.sector,
      equipmentIds: ws.equipmentIds,
    });
    setEditingId(ws.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Excluir esta estação de trabalho?')) {
      deleteWorkstation(id);
    }
  };

  const addEquipmentToStation = (eqId: string) => {
    if (eqId && !formData.equipmentIds.includes(eqId)) {
      setFormData(prev => ({ ...prev, equipmentIds: [...prev.equipmentIds, eqId] }));
    }
  };

  const removeEquipmentFromStation = (eqId: string) => {
    setFormData(prev => ({ ...prev, equipmentIds: prev.equipmentIds.filter(id => id !== eqId) }));
  };

  const handleResponsibleSelect = (collabId: string) => {
    const collab = collaborators.find(c => c.id === collabId);
    setFormData(prev => ({
      ...prev,
      responsibleId: collabId,
      responsibleName: collab?.fullName || '',
    }));
  };

  const getEquipment = (eqId: string) => equipment.find(e => e.id === eqId);

  // Equipment available (not already in another workstation)
  const usedEquipmentIds = new Set(workstations.flatMap(ws =>
    ws.id !== editingId ? ws.equipmentIds : []
  ));
  const availableEquipment = equipment.filter(e =>
    !usedEquipmentIds.has(e.id) && !formData.equipmentIds.includes(e.id)
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estações de Trabalho</h1>
          <p className="text-gray-500">{workstations.length} estação(ões)</p>
        </div>
        <Button onClick={() => {
          setFormData({ name: '', responsibleId: '', responsibleName: '', location: '', sector: '', equipmentIds: [] });
          setEditingId(null);
          setShowForm(true);
        }}>
          <Plus className="w-4 h-4" /> Nova Estação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {workstations.map(ws => (
          <Card key={ws.id} className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Monitor className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{ws.name}</h3>
                  <p className="text-sm text-gray-500">{ws.responsibleName || 'Sem responsável'}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(ws)} className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(ws.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-3">
              📍 {ws.location || '-'} · {ws.sector || '-'}
            </div>
            <div className="space-y-2">
              {ws.equipmentIds.map(eqId => {
                const eq = getEquipment(eqId);
                if (!eq) return null;
                return (
                  <div key={eqId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <span className="font-medium">{eq.name}</span>
                      <span className="text-gray-400 ml-2">{eq.brand}</span>
                    </div>
                    <Badge className={statusColor(eq.status)}>{eq.category}</Badge>
                  </div>
                );
              })}
              {ws.equipmentIds.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2">Nenhum equipamento vinculado</p>
              )}
            </div>
          </Card>
        ))}
        {workstations.length === 0 && (
          <Card className="col-span-full p-12 text-center text-gray-400">
            Nenhuma estação de trabalho cadastrada
          </Card>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingId(null); }} title={editingId ? 'Editar Estação' : 'Nova Estação de Trabalho'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome da Estação *" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Estação 01" />
          <Select
            label="Responsável"
            options={[
              { value: '', label: 'Selecione...' },
              ...collaborators.filter(c => c.status === 'Ativo').map(c => ({ value: c.id, label: c.fullName }))
            ]}
            value={formData.responsibleId}
            onChange={e => handleResponsibleSelect(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Local" value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} />
            <Input label="Setor" value={formData.sector} onChange={e => setFormData(p => ({ ...p, sector: e.target.value }))} />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Equipamentos da Estação</h4>

            {/* Selected equipment */}
            <div className="space-y-2 mb-3">
              {formData.equipmentIds.map(eqId => {
                const eq = getEquipment(eqId);
                if (!eq) return null;
                return (
                  <div key={eqId} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg text-sm">
                    <span>{eq.patrimonialCode} - {eq.name} ({eq.category})</span>
                    <button type="button" onClick={() => removeEquipmentFromStation(eqId)} className="p-1 hover:bg-red-100 rounded text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add equipment */}
            <Select
              label="Adicionar equipamento"
              options={[
                { value: '', label: 'Selecione para adicionar...' },
                ...availableEquipment.map(e => ({
                  value: e.id,
                  label: `${e.patrimonialCode} - ${e.name} (${e.category})`
                }))
              ]}
              value=""
              onChange={e => addEquipmentToStation(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" type="button" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancelar</Button>
            <Button type="submit">{editingId ? 'Salvar' : 'Criar Estação'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
