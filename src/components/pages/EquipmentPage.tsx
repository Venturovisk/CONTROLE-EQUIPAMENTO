import { useState, useMemo } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, Download
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select, TextArea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { AppStore } from '@/store/useStore';
import type { Equipment, EquipmentCategory, EquipmentStatus } from '@/types';
import { CATEGORIES, STATUSES } from '@/types';
import {
  formatDate, formatCurrency, statusColor, warrantyColor,
  warrantyDaysRemaining, warrantyStatus, generateCSV, downloadFile
} from '@/utils/helpers';
import QRCode from 'qrcode';
import { useEffect, useRef } from 'react';

interface EquipmentPageProps {
  store: AppStore;
}

const emptyEquipment = {
  name: '', category: 'PC Completo' as EquipmentCategory, brand: '', model: '',
  serialNumber: '', purchaseDate: '', purchaseValue: 0, supplier: '',
  warrantyStart: '', warrantyEnd: '', unit: '', room: '', sector: '',
  responsibleId: '', responsibleName: '', responsibleRole: '', deliveryDate: '',
  status: 'Em estoque' as EquipmentStatus, notes: '',
};

export function EquipmentPage({ store }: EquipmentPageProps) {
  const { equipment, collaborators, addEquipment, updateEquipment, deleteEquipment } = store;

  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState(emptyEquipment);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSector, setFilterSector] = useState('');

  const sectors = useMemo(() => {
    const s = new Set(equipment.map(e => e.sector).filter(Boolean));
    return Array.from(s);
  }, [equipment]);

  const filtered = useMemo(() => {
    return equipment.filter(eq => {
      const matchesSearch = !searchTerm || [eq.name, eq.patrimonialCode, eq.serialNumber, eq.responsibleName, eq.brand, eq.model]
        .some(f => f?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = !filterCategory || eq.category === filterCategory;
      const matchesStatus = !filterStatus || eq.status === filterStatus;
      const matchesSector = !filterSector || eq.sector === filterSector;
      return matchesSearch && matchesCategory && matchesStatus && matchesSector;
    });
  }, [equipment, searchTerm, filterCategory, filterStatus, filterSector]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateEquipment(editingId, formData);
    } else {
      addEquipment(formData);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyEquipment);
  };

  const handleEdit = (eq: Equipment) => {
    setFormData({
      name: eq.name, category: eq.category, brand: eq.brand, model: eq.model,
      serialNumber: eq.serialNumber, purchaseDate: eq.purchaseDate,
      purchaseValue: eq.purchaseValue, supplier: eq.supplier,
      warrantyStart: eq.warrantyStart, warrantyEnd: eq.warrantyEnd,
      unit: eq.unit, room: eq.room, sector: eq.sector,
      responsibleId: eq.responsibleId, responsibleName: eq.responsibleName,
      responsibleRole: eq.responsibleRole, deliveryDate: eq.deliveryDate,
      status: eq.status, notes: eq.notes,
    });
    setEditingId(eq.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este equipamento?')) {
      deleteEquipment(id);
    }
  };

  const handleView = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setShowDetail(true);
  };

  const handleCollaboratorSelect = (collabId: string) => {
    const collab = collaborators.find(c => c.id === collabId);
    if (collab) {
      setFormData(prev => ({
        ...prev,
        responsibleId: collab.id,
        responsibleName: collab.fullName,
        responsibleRole: collab.role,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        responsibleId: '',
        responsibleName: '',
        responsibleRole: '',
      }));
    }
  };

  const exportCSV = () => {
    const headers = ['Código', 'Nome', 'Categoria', 'Marca', 'Modelo', 'Nº Série', 'Status', 'Responsável', 'Setor', 'Valor'];
    const rows = filtered.map(eq => [
      eq.patrimonialCode, eq.name, eq.category, eq.brand, eq.model,
      eq.serialNumber, eq.status, eq.responsibleName, eq.sector,
      eq.purchaseValue.toString()
    ]);
    const csv = generateCSV(headers, rows);
    downloadFile(csv, 'equipamentos.csv', 'text/csv');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipamentos</h1>
          <p className="text-gray-500">{filtered.length} equipamento(s) encontrado(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportCSV}>
            <Download className="w-4 h-4" /> Exportar
          </Button>
          <Button onClick={() => { setFormData(emptyEquipment); setEditingId(null); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> Novo Equipamento
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Buscar por nome, código, série, responsável..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            options={[{ value: '', label: 'Todas Categorias' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          />
          <Select
            options={[{ value: '', label: 'Todos Status' }, ...STATUSES.map(s => ({ value: s, label: s }))]}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          />
          <Select
            options={[{ value: '', label: 'Todos Setores' }, ...sectors.map(s => ({ value: s, label: s }))]}
            value={filterSector}
            onChange={e => setFilterSector(e.target.value)}
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Código</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Equipamento</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">Responsável</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">Setor</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden xl:table-cell">Garantia</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(eq => (
                <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-primary-600">{eq.patrimonialCode}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{eq.name}</p>
                      <p className="text-xs text-gray-500">{eq.brand} {eq.model}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">{eq.category}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600">{eq.responsibleName || '-'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600">{eq.sector || '-'}</td>
                  <td className="px-4 py-3">
                    <Badge className={statusColor(eq.status)}>{eq.status}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    {eq.warrantyEnd ? (
                      <Badge className={warrantyColor(eq.warrantyEnd)}>
                        {warrantyStatus(eq.warrantyEnd) === 'expired' ? 'Vencida' :
                          `${warrantyDaysRemaining(eq.warrantyEnd)} dias`}
                      </Badge>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleView(eq)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(eq)} className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(eq.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    Nenhum equipamento encontrado
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
        title={editingId ? 'Editar Equipamento' : 'Novo Equipamento'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Nome do Equipamento *" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
            <Select label="Categoria *" options={CATEGORIES.map(c => ({ value: c, label: c }))} value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value as EquipmentCategory }))} />
            <Input label="Marca" value={formData.brand} onChange={e => setFormData(p => ({ ...p, brand: e.target.value }))} />
            <Input label="Modelo" value={formData.model} onChange={e => setFormData(p => ({ ...p, model: e.target.value }))} />
            <Input label="Número de Série" value={formData.serialNumber} onChange={e => setFormData(p => ({ ...p, serialNumber: e.target.value }))} />
            <Select label="Status" options={STATUSES.map(s => ({ value: s, label: s }))} value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as EquipmentStatus }))} />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Dados Financeiros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Data de Compra" type="date" value={formData.purchaseDate} onChange={e => setFormData(p => ({ ...p, purchaseDate: e.target.value }))} />
              <Input label="Valor de Compra (R$)" type="number" step="0.01" min="0" value={formData.purchaseValue || ''} onChange={e => setFormData(p => ({ ...p, purchaseValue: parseFloat(e.target.value) || 0 }))} />
              <Input label="Fornecedor" value={formData.supplier} onChange={e => setFormData(p => ({ ...p, supplier: e.target.value }))} />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Garantia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Início da Garantia" type="date" value={formData.warrantyStart} onChange={e => setFormData(p => ({ ...p, warrantyStart: e.target.value }))} />
              <Input label="Término da Garantia" type="date" value={formData.warrantyEnd} onChange={e => setFormData(p => ({ ...p, warrantyEnd: e.target.value }))} />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Localização</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Unidade" value={formData.unit} onChange={e => setFormData(p => ({ ...p, unit: e.target.value }))} />
              <Input label="Sala" value={formData.room} onChange={e => setFormData(p => ({ ...p, room: e.target.value }))} />
              <Input label="Setor" value={formData.sector} onChange={e => setFormData(p => ({ ...p, sector: e.target.value }))} />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Responsável</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Colaborador"
                options={[
                  { value: '', label: 'Selecione...' },
                  ...collaborators.filter(c => c.status === 'Ativo').map(c => ({ value: c.id, label: c.fullName }))
                ]}
                value={formData.responsibleId}
                onChange={e => handleCollaboratorSelect(e.target.value)}
              />
              <Input label="Cargo" value={formData.responsibleRole} readOnly className="bg-gray-50" />
              <Input label="Data de Entrega" type="date" value={formData.deliveryDate} onChange={e => setFormData(p => ({ ...p, deliveryDate: e.target.value }))} />
            </div>
          </div>

          <div className="border-t pt-4">
            <TextArea label="Observações" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" type="button" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancelar</Button>
            <Button type="submit">{editingId ? 'Salvar Alterações' : 'Cadastrar Equipamento'}</Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {selectedEquipment && (
        <EquipmentDetailModal
          isOpen={showDetail}
          onClose={() => setShowDetail(false)}
          equipment={selectedEquipment}
          store={store}
        />
      )}
    </div>
  );
}

function EquipmentDetailModal({ isOpen, onClose, equipment, store }: {
  isOpen: boolean; onClose: () => void; equipment: Equipment; store: AppStore;
}) {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const { movements, maintenances } = store;

  const eqMovements = movements.filter(m => m.equipmentId === equipment.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const eqMaintenances = maintenances.filter(m => m.equipmentId === equipment.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  useEffect(() => {
    if (qrRef.current && isOpen) {
      const data = JSON.stringify({
        code: equipment.patrimonialCode,
        name: equipment.name,
        serial: equipment.serialNumber,
        status: equipment.status,
      });
      QRCode.toCanvas(qrRef.current, data, { width: 150 });
    }
  }, [equipment, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${equipment.name} - ${equipment.patrimonialCode}`} size="xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoField label="Categoria" value={equipment.category} />
            <InfoField label="Marca" value={equipment.brand} />
            <InfoField label="Modelo" value={equipment.model} />
            <InfoField label="Nº Série" value={equipment.serialNumber} />
            <InfoField label="Status" value={equipment.status} badge={statusColor(equipment.status)} />
            <InfoField label="Fornecedor" value={equipment.supplier} />
            <InfoField label="Data de Compra" value={formatDate(equipment.purchaseDate)} />
            <InfoField label="Valor" value={formatCurrency(equipment.purchaseValue)} />
            <InfoField label="Unidade" value={equipment.unit} />
            <InfoField label="Sala" value={equipment.room} />
            <InfoField label="Setor" value={equipment.sector} />
            <InfoField label="Responsável" value={equipment.responsibleName} />
            <InfoField label="Garantia Início" value={formatDate(equipment.warrantyStart)} />
            <InfoField label="Garantia Fim" value={formatDate(equipment.warrantyEnd)} />
            {equipment.warrantyEnd && (
              <InfoField
                label="Status Garantia"
                value={warrantyStatus(equipment.warrantyEnd) === 'expired' ? 'Vencida' :
                  `${warrantyDaysRemaining(equipment.warrantyEnd)} dias restantes`}
                badge={warrantyColor(equipment.warrantyEnd)}
              />
            )}
          </div>

          {equipment.notes && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Observações</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{equipment.notes}</p>
            </div>
          )}

          {/* Movements */}
          {eqMovements.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Movimentações</h4>
              <div className="space-y-2">
                {eqMovements.map(m => (
                  <div key={m.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{m.type}</span>
                      <span className="text-gray-400">{formatDate(m.date)}</span>
                    </div>
                    {m.notes && <p className="text-gray-500 mt-1">{m.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenances */}
          {eqMaintenances.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Manutenções</h4>
              <div className="space-y-2">
                {eqMaintenances.map(m => (
                  <div key={m.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{m.problemReported}</span>
                      <span className="text-gray-400">{formatDate(m.date)}</span>
                    </div>
                    <p className="text-gray-500 mt-1">Diagnóstico: {m.diagnosis}</p>
                    <p className="text-gray-500">Solução: {m.solution}</p>
                    <p className="text-gray-500">Técnico: {m.technician} | Custo: {formatCurrency(m.cost)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
            <canvas ref={qrRef} />
          </div>
          <p className="text-sm text-gray-500 text-center">QR Code do equipamento</p>
          <Badge className={statusColor(equipment.status)}>{equipment.status}</Badge>
        </div>
      </div>
    </Modal>
  );
}

function InfoField({ label, value, badge }: { label: string; value: string; badge?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      {badge ? (
        <Badge className={badge}>{value || '-'}</Badge>
      ) : (
        <p className="text-sm font-medium text-gray-900 mt-0.5">{value || '-'}</p>
      )}
    </div>
  );
}
