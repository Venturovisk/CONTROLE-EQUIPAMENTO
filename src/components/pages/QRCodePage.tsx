import { useState, useEffect, useRef } from 'react';
import { Search, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { AppStore } from '@/store/useStore';
import type { Equipment } from '@/types';
import { CATEGORIES } from '@/types';
import { statusColor, formatDate, warrantyDaysRemaining, warrantyStatus, formatCurrency } from '@/utils/helpers';
import QRCodeLib from 'qrcode';

interface QRCodePageProps {
  store: AppStore;
}

export function QRCodePage({ store }: QRCodePageProps) {
  const { equipment } = store;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedForPrint, setSelectedForPrint] = useState<Set<string>>(new Set());

  const filtered = equipment.filter(eq => {
    const matchSearch = !searchTerm || [eq.name, eq.patrimonialCode, eq.serialNumber]
      .some(f => f?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = !filterCategory || eq.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const toggleSelect = (id: string) => {
    setSelectedForPrint(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedForPrint.size === filtered.length) {
      setSelectedForPrint(new Set());
    } else {
      setSelectedForPrint(new Set(filtered.map(e => e.id)));
    }
  };

  const handleView = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setShowDetail(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Codes</h1>
          <p className="text-gray-500">Gere e imprima QR Codes dos equipamentos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={selectAll}>
            {selectedForPrint.size === filtered.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </Button>
          {selectedForPrint.size > 0 && (
            <PrintQRCodes equipment={equipment.filter(e => selectedForPrint.has(e.id))} />
          )}
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Buscar equipamento..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            options={[{ value: '', label: 'Todas Categorias' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map(eq => (
          <QRCodeCard
            key={eq.id}
            equipment={eq}
            selected={selectedForPrint.has(eq.id)}
            onToggle={() => toggleSelect(eq.id)}
            onView={() => handleView(eq)}
          />
        ))}
        {filtered.length === 0 && (
          <Card className="col-span-full p-12 text-center text-gray-400">
            Nenhum equipamento encontrado
          </Card>
        )}
      </div>

      {selectedEquipment && (
        <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Detalhes do Equipamento" size="md">
          <QRCodeDetail equipment={selectedEquipment} store={store} />
        </Modal>
      )}
    </div>
  );
}

function QRCodeCard({ equipment: eq, selected, onToggle, onView }: {
  equipment: Equipment; selected: boolean; onToggle: () => void; onView: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const data = JSON.stringify({
        code: eq.patrimonialCode,
        name: eq.name,
        serial: eq.serialNumber,
      });
      QRCodeLib.toCanvas(canvasRef.current, data, { width: 120, margin: 1 });
    }
  }, [eq]);

  return (
    <Card className={`p-4 text-center transition-all ${selected ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="w-4 h-4 rounded border-gray-300 text-primary-600"
        />
        <Badge className={statusColor(eq.status)}>{eq.status}</Badge>
      </div>
      <div className="flex justify-center mb-3 cursor-pointer" onClick={onView}>
        <canvas ref={canvasRef} />
      </div>
      <p className="font-mono text-xs text-primary-600 font-bold">{eq.patrimonialCode}</p>
      <p className="text-sm font-medium text-gray-900 truncate mt-1">{eq.name}</p>
      <p className="text-xs text-gray-500 truncate">{eq.brand} {eq.model}</p>
    </Card>
  );
}

function QRCodeDetail({ equipment: eq, store }: { equipment: Equipment; store: AppStore }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { movements, maintenances } = store;

  useEffect(() => {
    if (canvasRef.current) {
      const data = JSON.stringify({
        code: eq.patrimonialCode,
        name: eq.name,
        serial: eq.serialNumber,
        status: eq.status,
        responsible: eq.responsibleName,
      });
      QRCodeLib.toCanvas(canvasRef.current, data, { width: 200 });
    }
  }, [eq]);

  const eqMovements = movements.filter(m => m.equipmentId === eq.id).slice(0, 5);
  const eqMaintenances = maintenances.filter(m => m.equipmentId === eq.id).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <canvas ref={canvasRef} />
        <div className="space-y-2">
          <h3 className="text-lg font-bold">{eq.name}</h3>
          <p className="text-sm text-gray-500">Código: {eq.patrimonialCode}</p>
          <Badge className={statusColor(eq.status)}>{eq.status}</Badge>
          <p className="text-sm">Responsável: <strong>{eq.responsibleName || '-'}</strong></p>
          <p className="text-sm">Setor: {eq.sector || '-'}</p>
          <p className="text-sm">Valor: {formatCurrency(eq.purchaseValue)}</p>
          {eq.warrantyEnd && (
            <p className="text-sm">
              Garantia: {warrantyStatus(eq.warrantyEnd) === 'expired' ? 'Vencida' : `${warrantyDaysRemaining(eq.warrantyEnd)} dias restantes`}
            </p>
          )}
        </div>
      </div>

      {eqMovements.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Movimentações Recentes</h4>
          {eqMovements.map(m => (
            <div key={m.id} className="p-2 bg-gray-50 rounded-lg text-sm mb-1">
              {m.type} - {formatDate(m.date)}
            </div>
          ))}
        </div>
      )}

      {eqMaintenances.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Manutenções Recentes</h4>
          {eqMaintenances.map(m => (
            <div key={m.id} className="p-2 bg-gray-50 rounded-lg text-sm mb-1">
              {m.problemReported} - {formatDate(m.date)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PrintQRCodes({ equipment }: { equipment: Equipment[] }) {
  const handlePrint = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const canvases: string[] = [];
    for (const eq of equipment) {
      const data = JSON.stringify({
        code: eq.patrimonialCode,
        name: eq.name,
        serial: eq.serialNumber,
      });
      const url = await QRCodeLib.toDataURL(data, { width: 150, margin: 1 });
      canvases.push(`
        <div style="display:inline-block;text-align:center;margin:10px;padding:10px;border:1px dashed #ccc;width:180px;">
          <img src="${url}" style="width:150px;height:150px;" />
          <p style="font-family:monospace;font-size:12px;font-weight:bold;margin:5px 0 2px;">${eq.patrimonialCode}</p>
          <p style="font-size:11px;margin:0;">${eq.name}</p>
          <p style="font-size:10px;color:#666;margin:0;">${eq.brand} ${eq.model}</p>
        </div>
      `);
    }

    printWindow.document.write(`
      <html>
        <head><title>QR Codes - PatriControl</title></head>
        <body style="font-family:Arial,sans-serif;">
          <h2 style="text-align:center;">QR Codes - Patrimônio</h2>
          <div style="display:flex;flex-wrap:wrap;justify-content:center;">
            ${canvases.join('')}
          </div>
          <script>setTimeout(() => window.print(), 500);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Button onClick={handlePrint}>
      <Printer className="w-4 h-4" /> Imprimir ({equipment.length})
    </Button>
  );
}
