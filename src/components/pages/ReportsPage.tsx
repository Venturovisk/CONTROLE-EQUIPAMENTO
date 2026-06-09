import { useState } from 'react';
import { BarChart3, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { AppStore } from '@/store/useStore';
import {
  formatDate, formatCurrency, warrantyStatus, warrantyDaysRemaining,
  generateCSV, downloadFile
} from '@/utils/helpers';
import jsPDF from 'jspdf';

interface ReportsPageProps {
  store: AppStore;
}

type ReportType =
  | 'inventory' | 'by-sector' | 'by-responsible' | 'in-maintenance'
  | 'expired-warranty' | 'expiring-warranty' | 'patrimony-sector' | 'movements';

const reportOptions: { key: ReportType; label: string; description: string }[] = [
  { key: 'inventory', label: 'Inventário Completo', description: 'Listagem completa de todos os equipamentos cadastrados' },
  { key: 'by-sector', label: 'Equipamentos por Setor', description: 'Agrupamento de equipamentos por setor da empresa' },
  { key: 'by-responsible', label: 'Equipamentos por Responsável', description: 'Equipamentos vinculados a cada colaborador' },
  { key: 'in-maintenance', label: 'Equipamentos em Manutenção', description: 'Equipamentos atualmente em manutenção' },
  { key: 'expired-warranty', label: 'Garantias Vencidas', description: 'Equipamentos com garantia expirada' },
  { key: 'expiring-warranty', label: 'Garantias a Vencer', description: 'Equipamentos com garantia próxima do vencimento' },
  { key: 'patrimony-sector', label: 'Patrimônio por Setor', description: 'Valor patrimonial agrupado por setor' },
  { key: 'movements', label: 'Histórico de Movimentações', description: 'Todas as movimentações registradas' },
];

export function ReportsPage({ store }: ReportsPageProps) {
  const { equipment, movements, maintenances, collaborators } = store;
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);

  const getReportData = (type: ReportType) => {
    switch (type) {
      case 'inventory':
        return {
          headers: ['Código', 'Nome', 'Categoria', 'Marca', 'Modelo', 'Nº Série', 'Status', 'Responsável', 'Setor', 'Valor'],
          rows: equipment.map(e => [
            e.patrimonialCode, e.name, e.category, e.brand, e.model,
            e.serialNumber, e.status, e.responsibleName, e.sector,
            e.purchaseValue.toString()
          ]),
        };
      case 'by-sector': {
        const sectors = new Map<string, typeof equipment>();
        equipment.forEach(e => {
          const s = e.sector || 'Sem setor';
          if (!sectors.has(s)) sectors.set(s, []);
          sectors.get(s)!.push(e);
        });
        const rows: string[][] = [];
        sectors.forEach((eqs, sector) => {
          eqs.forEach(e => {
            rows.push([sector, e.patrimonialCode, e.name, e.category, e.status, e.responsibleName]);
          });
        });
        return {
          headers: ['Setor', 'Código', 'Nome', 'Categoria', 'Status', 'Responsável'],
          rows,
        };
      }
      case 'by-responsible': {
        const rows: string[][] = [];
        collaborators.forEach(c => {
          const eqs = equipment.filter(e => e.responsibleId === c.id);
          eqs.forEach(e => {
            rows.push([c.fullName, c.sector, e.patrimonialCode, e.name, e.category, e.status]);
          });
        });
        return {
          headers: ['Responsável', 'Setor', 'Código', 'Nome', 'Categoria', 'Status'],
          rows,
        };
      }
      case 'in-maintenance':
        return {
          headers: ['Código', 'Nome', 'Problema', 'Data', 'Técnico', 'Custo'],
          rows: maintenances.map(m => [
            m.equipmentCode, m.equipmentName, m.problemReported,
            formatDate(m.date), m.technician, m.cost.toString()
          ]),
        };
      case 'expired-warranty':
        return {
          headers: ['Código', 'Nome', 'Marca', 'Garantia Fim', 'Dias Vencida', 'Responsável'],
          rows: equipment
            .filter(e => e.warrantyEnd && warrantyStatus(e.warrantyEnd) === 'expired')
            .map(e => [
              e.patrimonialCode, e.name, e.brand,
              formatDate(e.warrantyEnd),
              Math.abs(warrantyDaysRemaining(e.warrantyEnd)).toString(),
              e.responsibleName
            ]),
        };
      case 'expiring-warranty':
        return {
          headers: ['Código', 'Nome', 'Marca', 'Garantia Fim', 'Dias Restantes', 'Responsável'],
          rows: equipment
            .filter(e => e.warrantyEnd && warrantyStatus(e.warrantyEnd) === 'expiring')
            .map(e => [
              e.patrimonialCode, e.name, e.brand,
              formatDate(e.warrantyEnd),
              warrantyDaysRemaining(e.warrantyEnd).toString(),
              e.responsibleName
            ]),
        };
      case 'patrimony-sector': {
        const sectorMap = new Map<string, number>();
        equipment.forEach(e => {
          const s = e.sector || 'Sem setor';
          sectorMap.set(s, (sectorMap.get(s) || 0) + (e.purchaseValue || 0));
        });
        return {
          headers: ['Setor', 'Valor Total'],
          rows: Array.from(sectorMap.entries()).map(([s, v]) => [s, formatCurrency(v)]),
        };
      }
      case 'movements':
        return {
          headers: ['Data', 'Tipo', 'Equipamento', 'Código', 'De', 'Para', 'Observações'],
          rows: movements.map(m => [
            formatDate(m.date), m.type, m.equipmentName, m.equipmentCode,
            m.fromResponsible, m.toResponsible, m.notes
          ]),
        };
    }
  };

  const exportToCSV = (type: ReportType) => {
    const data = getReportData(type);
    const csv = generateCSV(data.headers, data.rows);
    const report = reportOptions.find(r => r.key === type);
    downloadFile(csv, `${report?.label || 'relatorio'}.csv`, 'text/csv');
  };

  const exportToPDF = (type: ReportType) => {
    const data = getReportData(type);
    const report = reportOptions.find(r => r.key === type);
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(report?.label || 'Relatório', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${formatDate(new Date().toISOString())}`, pageWidth / 2, 28, { align: 'center' });

    let y = 40;
    const colWidth = (pageWidth - 20) / data.headers.length;

    // Headers
    doc.setFillColor(59, 130, 246);
    doc.rect(10, y - 5, pageWidth - 20, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    data.headers.forEach((h, i) => {
      doc.text(h.substring(0, 15), 12 + i * colWidth, y);
    });
    y += 8;

    // Rows
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    data.rows.forEach((row, ri) => {
      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
      if (ri % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(10, y - 4, pageWidth - 20, 7, 'F');
      }
      row.forEach((cell, i) => {
        doc.text((cell || '-').substring(0, 20), 12 + i * colWidth, y);
      });
      y += 7;
    });

    doc.save(`${report?.label || 'relatorio'}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500">Gere relatórios gerenciais do patrimônio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportOptions.map(report => (
          <Card
            key={report.key}
            className={`p-5 cursor-pointer transition-all ${selectedReport === report.key ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-md'}`}
            onClick={() => setSelectedReport(report.key)}
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{report.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{report.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedReport && (
        <Card className="p-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {reportOptions.find(r => r.key === selectedReport)?.label}
            </h3>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => exportToCSV(selectedReport)}>
                <FileSpreadsheet className="w-4 h-4" /> CSV
              </Button>
              <Button variant="secondary" size="sm" onClick={() => exportToPDF(selectedReport)}>
                <FileText className="w-4 h-4" /> PDF
              </Button>
            </div>
          </div>

          {/* Preview table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  {getReportData(selectedReport).headers.map((h, i) => (
                    <th key={i} className="text-left px-3 py-2 font-semibold text-gray-700 text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {getReportData(selectedReport).rows.slice(0, 20).map((row, ri) => (
                  <tr key={ri} className="hover:bg-gray-50">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-gray-600 text-xs">{cell || '-'}</td>
                    ))}
                  </tr>
                ))}
                {getReportData(selectedReport).rows.length === 0 && (
                  <tr>
                    <td colSpan={getReportData(selectedReport).headers.length} className="px-3 py-8 text-center text-gray-400">
                      Sem dados para este relatório
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {getReportData(selectedReport).rows.length > 20 && (
              <p className="text-xs text-gray-400 text-center py-2">
                Mostrando 20 de {getReportData(selectedReport).rows.length} registros. Exporte para ver todos.
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
