import { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { AppStore } from '@/store/useStore';
import type { Collaborator } from '@/types';
import { formatDate, formatCPF, formatPhone } from '@/utils/helpers';

interface CollaboratorsPageProps {
  store: AppStore;
}

const emptyCollab: {
  fullName: string; cpf: string; role: string; sector: string;
  email: string; phone: string; admissionDate: string;
  status: 'Ativo' | 'Inativo';
} = {
  fullName: '', cpf: '', role: '', sector: '',
  email: '', phone: '', admissionDate: '',
  status: 'Ativo',
};

export function CollaboratorsPage({ store }: CollaboratorsPageProps) {
  const { collaborators, equipment, movements, addCollaborator, updateCollaborator, deleteCollaborator } = store;

  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCollab, setSelectedCollab] = useState<Collaborator | null>(null);
  const [formData, setFormData] = useState(emptyCollab);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    return collaborators.filter(c => {
      return !searchTerm || [c.fullName, c.cpf, c.role, c.sector, c.email]
        .some(f => f?.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [collaborators, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCollaborator(editingId, formData);
    } else {
      addCollaborator(formData);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyCollab);
  };

  const handleEdit = (c: Collaborator) => {
    setFormData({
      fullName: c.fullName, cpf: c.cpf, role: c.role, sector: c.sector,
      email: c.email, phone: c.phone, admissionDate: c.admissionDate,
      status: c.status,
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este colaborador?')) {
      deleteCollaborator(id);
    }
  };

  const getEquipmentCount = (collabId: string) => {
    return equipment.filter(e => e.responsibleId === collabId).length;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
          <p className="text-gray-500">{filtered.length} colaborador(es)</p>
        </div>
        <Button onClick={() => { setFormData(emptyCollab); setEditingId(null); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Novo Colaborador
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Buscar por nome, CPF, cargo, setor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nome</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">CPF</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Cargo</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">Setor</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">Equipamentos</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{c.fullName}</p>
                      <p className="text-xs text-gray-500">{c.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600 font-mono text-xs">{formatCPF(c.cpf)}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">{c.role}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600">{c.sector}</td>
                  <td className="px-4 py-3">
                    <Badge className={c.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <Badge className="bg-blue-100 text-blue-800">{getEquipmentCount(c.id)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setSelectedCollab(c); setShowDetail(true); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Nenhum colaborador encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingId(null); }}
        title={editingId ? 'Editar Colaborador' : 'Novo Colaborador'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome Completo *" required value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))} />
            <Input label="CPF *" required value={formData.cpf} onChange={e => setFormData(p => ({ ...p, cpf: e.target.value }))} placeholder="000.000.000-00" />
            <Input label="Cargo *" required value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))} />
            <Input label="Setor *" required value={formData.sector} onChange={e => setFormData(p => ({ ...p, sector: e.target.value }))} />
            <Input label="E-mail" type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
            <Input label="Telefone" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="(00) 00000-0000" />
            <Input label="Data de Admissão" type="date" value={formData.admissionDate} onChange={e => setFormData(p => ({ ...p, admissionDate: e.target.value }))} />
            <Select
              label="Status"
              options={[{ value: 'Ativo', label: 'Ativo' }, { value: 'Inativo', label: 'Inativo' }]}
              value={formData.status}
              onChange={e => setFormData(p => ({ ...p, status: e.target.value as 'Ativo' | 'Inativo' }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" type="button" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancelar</Button>
            <Button type="submit">{editingId ? 'Salvar' : 'Cadastrar'}</Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {selectedCollab && (
        <Modal
          isOpen={showDetail}
          onClose={() => setShowDetail(false)}
          title={selectedCollab.fullName}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoItem label="CPF" value={formatCPF(selectedCollab.cpf)} />
              <InfoItem label="Cargo" value={selectedCollab.role} />
              <InfoItem label="Setor" value={selectedCollab.sector} />
              <InfoItem label="E-mail" value={selectedCollab.email} />
              <InfoItem label="Telefone" value={formatPhone(selectedCollab.phone)} />
              <InfoItem label="Admissão" value={formatDate(selectedCollab.admissionDate)} />
              <InfoItem label="Status" value={selectedCollab.status} />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Equipamentos Vinculados</h4>
              <div className="space-y-2">
                {equipment.filter(e => e.responsibleId === selectedCollab.id).map(eq => (
                  <div key={eq.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <p className="font-medium">{eq.name}</p>
                      <p className="text-gray-500">{eq.patrimonialCode} - {eq.category}</p>
                    </div>
                    <Badge className={statusColor(eq.status)}>{eq.status}</Badge>
                  </div>
                ))}
                {equipment.filter(e => e.responsibleId === selectedCollab.id).length === 0 && (
                  <p className="text-sm text-gray-400">Nenhum equipamento vinculado</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Histórico de Movimentações</h4>
              <div className="space-y-2">
                {movements
                  .filter(m => m.toResponsible === selectedCollab.fullName || m.fromResponsible === selectedCollab.fullName)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(m => (
                    <div key={m.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{m.type} - {m.equipmentName}</span>
                        <span className="text-gray-400">{formatDate(m.date)}</span>
                      </div>
                    </div>
                  ))
                }
                {movements.filter(m => m.toResponsible === selectedCollab.fullName || m.fromResponsible === selectedCollab.fullName).length === 0 && (
                  <p className="text-sm text-gray-400">Nenhuma movimentação registrada</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value || '-'}</p>
    </div>
  );
}

function statusColor(status: string): string {
  switch (status) {
    case 'Em uso': return 'bg-blue-100 text-blue-800';
    case 'Em estoque': return 'bg-green-100 text-green-800';
    case 'Em manutenção': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}
