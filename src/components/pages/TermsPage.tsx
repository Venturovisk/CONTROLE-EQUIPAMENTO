import { useState, useRef, useEffect } from 'react';
import { Plus, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { AppStore } from '@/store/useStore';
import { formatDate } from '@/utils/helpers';
import jsPDF from 'jspdf';

interface TermsPageProps {
  store: AppStore;
}

export function TermsPage({ store }: TermsPageProps) {
  const { terms, equipment, collaborators, addTerm } = store;

  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    collaboratorId: '',
    equipmentIds: [] as string[],
    date: new Date().toISOString().split('T')[0],
  });
  const [signatureData, setSignatureData] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    if (!showForm || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = 150;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if ('touches' in e) {
        return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
      }
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const startDraw = (e: MouseEvent | TouchEvent) => {
      isDrawingRef.current = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const stopDraw = () => {
      isDrawingRef.current = false;
      setSignatureData(canvas.toDataURL());
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);
    canvas.addEventListener('touchstart', startDraw);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDraw);

    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDraw);
      canvas.removeEventListener('mouseleave', stopDraw);
      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDraw);
    };
  }, [showForm]);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const collab = collaborators.find(c => c.id === formData.collaboratorId);
    if (!collab) return;

    addTerm({
      collaboratorId: collab.id,
      collaboratorName: collab.fullName,
      equipmentIds: formData.equipmentIds,
      date: formData.date,
      signatureData,
    });

    setShowForm(false);
    setFormData({ collaboratorId: '', equipmentIds: [], date: new Date().toISOString().split('T')[0] });
    setSignatureData('');
  };

  const addEquipmentToTerm = (eqId: string) => {
    if (eqId && !formData.equipmentIds.includes(eqId)) {
      setFormData(prev => ({ ...prev, equipmentIds: [...prev.equipmentIds, eqId] }));
    }
  };

  const removeEquipmentFromTerm = (eqId: string) => {
    setFormData(prev => ({ ...prev, equipmentIds: prev.equipmentIds.filter(id => id !== eqId) }));
  };

  const generatePDF = (termId: string) => {
    const term = terms.find(t => t.id === termId);
    if (!term) return;

    const collab = collaborators.find(c => c.id === term.collaboratorId);
    const eqs = term.equipmentIds.map(id => equipment.find(e => e.id === id)).filter(Boolean);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMO DE RESPONSABILIDADE', pageWidth / 2, 25, { align: 'center' });
    doc.text('EQUIPAMENTOS PATRIMONIAIS', pageWidth / 2, 33, { align: 'center' });

    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(20, 37, pageWidth - 20, 37);

    // Company info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('EMPRESA: PatriControl Ltda.', 20, 47);
    doc.text('CNPJ: 00.000.000/0001-00', 20, 53);
    doc.text(`DATA: ${formatDate(term.date)}`, 20, 59);

    // Collaborator info
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO COLABORADOR', 20, 72);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${collab?.fullName || term.collaboratorName}`, 20, 80);
    doc.text(`CPF: ${collab?.cpf || '-'}`, 20, 86);
    doc.text(`Cargo: ${collab?.role || '-'}`, 20, 92);
    doc.text(`Setor: ${collab?.sector || '-'}`, 20, 98);

    // Equipment table
    doc.setFont('helvetica', 'bold');
    doc.text('EQUIPAMENTOS RECEBIDOS', 20, 112);

    let y = 120;
    doc.setFontSize(9);

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y - 4, pageWidth - 40, 8, 'F');
    doc.text('Código', 22, y);
    doc.text('Equipamento', 52, y);
    doc.text('Marca/Modelo', 105, y);
    doc.text('Nº Série', 155, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    eqs.forEach(eq => {
      if (!eq) return;
      doc.text(eq.patrimonialCode, 22, y);
      doc.text(eq.name.substring(0, 25), 52, y);
      doc.text(`${eq.brand} ${eq.model}`.substring(0, 25), 105, y);
      doc.text(eq.serialNumber.substring(0, 20), 155, y);
      y += 7;
    });

    // Terms text
    y += 10;
    doc.setFontSize(9);
    doc.text('Declaro ter recebido os equipamentos acima listados em perfeito estado de', 20, y);
    y += 5;
    doc.text('conservação e funcionamento, comprometendo-me a zelar pela sua integridade,', 20, y);
    y += 5;
    doc.text('utilizando-os exclusivamente para fins profissionais, devolvendo-os nas mesmas', 20, y);
    y += 5;
    doc.text('condições em que foram recebidos ao término do vínculo ou quando solicitado.', 20, y);

    // Signatures
    y += 25;
    doc.line(20, y, 90, y);
    doc.text('Assinatura do Colaborador', 30, y + 6);

    doc.line(110, y, 190, y);
    doc.text('Assinatura da Empresa', 130, y + 6);

    // Add signature image if available
    if (term.signatureData) {
      try {
        doc.addImage(term.signatureData, 'PNG', 25, y - 30, 60, 25);
      } catch {
        // ignore signature errors
      }
    }

    doc.save(`termo_responsabilidade_${term.collaboratorName.replace(/\s+/g, '_')}.pdf`);
  };

  const sortedTerms = [...terms].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Termos de Responsabilidade</h1>
          <p className="text-gray-500">{terms.length} termo(s) gerado(s)</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Novo Termo
        </Button>
      </div>

      <div className="space-y-3">
        {sortedTerms.map(term => (
          <Card key={term.id} className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{term.collaboratorName}</p>
                <p className="text-sm text-gray-500">
                  {term.equipmentIds.length} equipamento(s) · {formatDate(term.date)}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-green-100 text-green-800">
                  {term.signatureData ? 'Assinado' : 'Pendente'}
                </Badge>
                <Button size="sm" variant="secondary" onClick={() => generatePDF(term.id)}>
                  <Download className="w-4 h-4" /> PDF
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {terms.length === 0 && (
          <Card className="p-12 text-center text-gray-400">
            Nenhum termo gerado
          </Card>
        )}
      </div>

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Novo Termo de Responsabilidade" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Colaborador *"
              options={[
                { value: '', label: 'Selecione...' },
                ...collaborators.filter(c => c.status === 'Ativo').map(c => ({ value: c.id, label: c.fullName }))
              ]}
              value={formData.collaboratorId}
              onChange={e => setFormData(p => ({ ...p, collaboratorId: e.target.value }))}
            />
            <Input label="Data" type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Equipamentos</h4>
            <div className="space-y-2 mb-3">
              {formData.equipmentIds.map(eqId => {
                const eq = equipment.find(e => e.id === eqId);
                return eq ? (
                  <div key={eqId} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg text-sm">
                    <span>{eq.patrimonialCode} - {eq.name}</span>
                    <button type="button" onClick={() => removeEquipmentFromTerm(eqId)} className="text-red-500 text-xs font-medium">Remover</button>
                  </div>
                ) : null;
              })}
            </div>
            <Select
              options={[
                { value: '', label: 'Adicionar equipamento...' },
                ...equipment.filter(e => !formData.equipmentIds.includes(e.id))
                  .map(e => ({ value: e.id, label: `${e.patrimonialCode} - ${e.name}` }))
              ]}
              value=""
              onChange={e => addEquipmentToTerm(e.target.value)}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Assinatura Digital do Colaborador</h4>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-1">
              <canvas
                ref={canvasRef}
                className="w-full cursor-crosshair signature-canvas bg-white rounded"
                style={{ height: 150, touchAction: 'none' }}
              />
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={clearSignature} className="mt-2">
              Limpar Assinatura
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" disabled={!formData.collaboratorId || formData.equipmentIds.length === 0}>
              Gerar Termo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
