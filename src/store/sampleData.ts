import type { Equipment, Collaborator, Movement, Maintenance } from '../types';

export const sampleCollaborators: Omit<Collaborator, 'id' | 'createdAt'>[] = [
  { fullName: 'Ana Silva', cpf: '12345678901', role: 'Analista de Sistemas', sector: 'TI', email: 'ana.silva@empresa.com', phone: '11999887766', admissionDate: '2022-03-15', status: 'Ativo' },
  { fullName: 'Carlos Oliveira', cpf: '23456789012', role: 'Gerente Financeiro', sector: 'Financeiro', email: 'carlos.oliveira@empresa.com', phone: '11988776655', admissionDate: '2021-06-10', status: 'Ativo' },
  { fullName: 'Maria Santos', cpf: '34567890123', role: 'Designer', sector: 'Marketing', email: 'maria.santos@empresa.com', phone: '11977665544', admissionDate: '2023-01-20', status: 'Ativo' },
  { fullName: 'João Ferreira', cpf: '45678901234', role: 'Desenvolvedor', sector: 'TI', email: 'joao.ferreira@empresa.com', phone: '11966554433', admissionDate: '2022-08-01', status: 'Ativo' },
  { fullName: 'Patrícia Lima', cpf: '56789012345', role: 'Coordenadora RH', sector: 'RH', email: 'patricia.lima@empresa.com', phone: '11955443322', admissionDate: '2020-11-05', status: 'Ativo' },
  { fullName: 'Roberto Almeida', cpf: '67890123456', role: 'Diretor Comercial', sector: 'Comercial', email: 'roberto.almeida@empresa.com', phone: '11944332211', admissionDate: '2019-04-22', status: 'Ativo' },
  { fullName: 'Fernanda Costa', cpf: '78901234567', role: 'Estagiária', sector: 'TI', email: 'fernanda.costa@empresa.com', phone: '11933221100', admissionDate: '2024-02-01', status: 'Ativo' },
  { fullName: 'Lucas Mendes', cpf: '89012345678', role: 'Analista Financeiro', sector: 'Financeiro', email: 'lucas.mendes@empresa.com', phone: '11922110099', admissionDate: '2023-07-15', status: 'Inativo' },
];

export function generateSampleEquipment(collaboratorIds: string[], collaboratorNames: string[]): Omit<Equipment, 'id' | 'patrimonialCode' | 'createdAt' | 'updatedAt'>[] {
  const today = new Date();
  const past = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };
  const future = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  return [
    { name: 'Desktop Dell OptiPlex 7090', category: 'CPU', brand: 'Dell', model: 'OptiPlex 7090', serialNumber: 'DL7090-001', purchaseDate: past(365), purchaseValue: 4500, supplier: 'Dell Brasil', warrantyStart: past(365), warrantyEnd: future(365), unit: 'Matriz', room: 'Sala 101', sector: 'TI', responsibleId: collaboratorIds[0], responsibleName: collaboratorNames[0], responsibleRole: 'Analista de Sistemas', deliveryDate: past(360), status: 'Em uso', notes: '' },
    { name: 'Monitor LG UltraWide 29"', category: 'Monitor', brand: 'LG', model: '29WN600', serialNumber: 'LG29-001', purchaseDate: past(365), purchaseValue: 1800, supplier: 'Dell Brasil', warrantyStart: past(365), warrantyEnd: future(365), unit: 'Matriz', room: 'Sala 101', sector: 'TI', responsibleId: collaboratorIds[0], responsibleName: collaboratorNames[0], responsibleRole: 'Analista de Sistemas', deliveryDate: past(360), status: 'Em uso', notes: '' },
    { name: 'Teclado Logitech MX Keys', category: 'Teclado', brand: 'Logitech', model: 'MX Keys', serialNumber: 'LOG-MXK-001', purchaseDate: past(300), purchaseValue: 650, supplier: 'KaBuM!', warrantyStart: past(300), warrantyEnd: future(65), unit: 'Matriz', room: 'Sala 101', sector: 'TI', responsibleId: collaboratorIds[0], responsibleName: collaboratorNames[0], responsibleRole: 'Analista de Sistemas', deliveryDate: past(295), status: 'Em uso', notes: '' },
    { name: 'Mouse Logitech MX Master 3', category: 'Mouse', brand: 'Logitech', model: 'MX Master 3', serialNumber: 'LOG-MXM-001', purchaseDate: past(300), purchaseValue: 500, supplier: 'KaBuM!', warrantyStart: past(300), warrantyEnd: future(65), unit: 'Matriz', room: 'Sala 101', sector: 'TI', responsibleId: collaboratorIds[0], responsibleName: collaboratorNames[0], responsibleRole: 'Analista de Sistemas', deliveryDate: past(295), status: 'Em uso', notes: '' },
    { name: 'Headset HyperX Cloud II', category: 'Headset', brand: 'HyperX', model: 'Cloud II', serialNumber: 'HX-CLD2-001', purchaseDate: past(200), purchaseValue: 450, supplier: 'Amazon', warrantyStart: past(200), warrantyEnd: future(165), unit: 'Matriz', room: 'Sala 101', sector: 'TI', responsibleId: collaboratorIds[0], responsibleName: collaboratorNames[0], responsibleRole: 'Analista de Sistemas', deliveryDate: past(195), status: 'Em uso', notes: '' },

    { name: 'Notebook Lenovo ThinkPad T14', category: 'Notebook', brand: 'Lenovo', model: 'ThinkPad T14', serialNumber: 'LNV-T14-001', purchaseDate: past(180), purchaseValue: 6200, supplier: 'Lenovo Brasil', warrantyStart: past(180), warrantyEnd: future(185), unit: 'Matriz', room: 'Sala 201', sector: 'Financeiro', responsibleId: collaboratorIds[1], responsibleName: collaboratorNames[1], responsibleRole: 'Gerente Financeiro', deliveryDate: past(175), status: 'Em uso', notes: 'Notebook para uso em reuniões' },
    { name: 'Monitor Dell 24" P2422H', category: 'Monitor', brand: 'Dell', model: 'P2422H', serialNumber: 'DL-P24-001', purchaseDate: past(180), purchaseValue: 1400, supplier: 'Dell Brasil', warrantyStart: past(180), warrantyEnd: future(185), unit: 'Matriz', room: 'Sala 201', sector: 'Financeiro', responsibleId: collaboratorIds[1], responsibleName: collaboratorNames[1], responsibleRole: 'Gerente Financeiro', deliveryDate: past(175), status: 'Em uso', notes: '' },

    { name: 'iMac Apple 24"', category: 'PC Completo', brand: 'Apple', model: 'iMac 24 M1', serialNumber: 'APL-IMAC-001', purchaseDate: past(400), purchaseValue: 12000, supplier: 'Apple Store', warrantyStart: past(400), warrantyEnd: past(35), unit: 'Matriz', room: 'Sala 301', sector: 'Marketing', responsibleId: collaboratorIds[2], responsibleName: collaboratorNames[2], responsibleRole: 'Designer', deliveryDate: past(395), status: 'Em uso', notes: 'Para design gráfico' },
    { name: 'Webcam Logitech C920', category: 'Webcam', brand: 'Logitech', model: 'C920 HD Pro', serialNumber: 'LOG-C920-001', purchaseDate: past(250), purchaseValue: 400, supplier: 'KaBuM!', warrantyStart: past(250), warrantyEnd: future(115), unit: 'Matriz', room: 'Sala 301', sector: 'Marketing', responsibleId: collaboratorIds[2], responsibleName: collaboratorNames[2], responsibleRole: 'Designer', deliveryDate: past(245), status: 'Em uso', notes: '' },

    { name: 'Desktop Dell OptiPlex 5090', category: 'CPU', brand: 'Dell', model: 'OptiPlex 5090', serialNumber: 'DL5090-001', purchaseDate: past(500), purchaseValue: 3800, supplier: 'Dell Brasil', warrantyStart: past(500), warrantyEnd: past(135), unit: 'Matriz', room: 'Sala 102', sector: 'TI', responsibleId: collaboratorIds[3], responsibleName: collaboratorNames[3], responsibleRole: 'Desenvolvedor', deliveryDate: past(495), status: 'Em uso', notes: '' },
    { name: 'Monitor Samsung 27" Curvo', category: 'Monitor', brand: 'Samsung', model: 'CF396', serialNumber: 'SAM-CF-001', purchaseDate: past(500), purchaseValue: 1600, supplier: 'Amazon', warrantyStart: past(500), warrantyEnd: past(135), unit: 'Matriz', room: 'Sala 102', sector: 'TI', responsibleId: collaboratorIds[3], responsibleName: collaboratorNames[3], responsibleRole: 'Desenvolvedor', deliveryDate: past(495), status: 'Em uso', notes: '' },
    { name: 'Monitor Samsung 27" Curvo', category: 'Monitor', brand: 'Samsung', model: 'CF396', serialNumber: 'SAM-CF-002', purchaseDate: past(500), purchaseValue: 1600, supplier: 'Amazon', warrantyStart: past(500), warrantyEnd: past(135), unit: 'Matriz', room: 'Sala 102', sector: 'TI', responsibleId: collaboratorIds[3], responsibleName: collaboratorNames[3], responsibleRole: 'Desenvolvedor', deliveryDate: past(495), status: 'Em uso', notes: 'Segundo monitor' },

    { name: 'Notebook Dell Latitude 5520', category: 'Notebook', brand: 'Dell', model: 'Latitude 5520', serialNumber: 'DL-L55-001', purchaseDate: past(90), purchaseValue: 5500, supplier: 'Dell Brasil', warrantyStart: past(90), warrantyEnd: future(275), unit: 'Matriz', room: 'Sala 401', sector: 'RH', responsibleId: collaboratorIds[4], responsibleName: collaboratorNames[4], responsibleRole: 'Coordenadora RH', deliveryDate: past(85), status: 'Em uso', notes: '' },

    { name: 'Notebook HP ProBook 450', category: 'Notebook', brand: 'HP', model: 'ProBook 450 G8', serialNumber: 'HP-PB450-001', purchaseDate: past(150), purchaseValue: 4800, supplier: 'HP Store', warrantyStart: past(150), warrantyEnd: future(215), unit: 'Filial SP', room: 'Sala 1', sector: 'Comercial', responsibleId: collaboratorIds[5], responsibleName: collaboratorNames[5], responsibleRole: 'Diretor Comercial', deliveryDate: past(145), status: 'Em uso', notes: '' },

    { name: 'Desktop Lenovo V530', category: 'CPU', brand: 'Lenovo', model: 'V530', serialNumber: 'LNV-V530-001', purchaseDate: past(60), purchaseValue: 3200, supplier: 'Lenovo Brasil', warrantyStart: past(60), warrantyEnd: future(305), unit: 'Matriz', room: 'Sala 103', sector: 'TI', responsibleId: collaboratorIds[6], responsibleName: collaboratorNames[6], responsibleRole: 'Estagiária', deliveryDate: past(55), status: 'Em uso', notes: '' },

    { name: 'Impressora HP LaserJet Pro', category: 'Impressora', brand: 'HP', model: 'M404dn', serialNumber: 'HP-LJP-001', purchaseDate: past(700), purchaseValue: 2200, supplier: 'HP Store', warrantyStart: past(700), warrantyEnd: past(335), unit: 'Matriz', room: 'Copa', sector: 'Compartilhado', responsibleId: '', responsibleName: '', responsibleRole: '', deliveryDate: '', status: 'Em uso', notes: 'Impressora compartilhada' },
    { name: 'Nobreak SMS 1500VA', category: 'Nobreak', brand: 'SMS', model: 'Station II 1500', serialNumber: 'SMS-1500-001', purchaseDate: past(600), purchaseValue: 900, supplier: 'KaBuM!', warrantyStart: past(600), warrantyEnd: past(235), unit: 'Matriz', room: 'Sala Servidores', sector: 'TI', responsibleId: '', responsibleName: '', responsibleRole: '', deliveryDate: '', status: 'Em uso', notes: '' },
    { name: 'Switch TP-Link 24 portas', category: 'Switch', brand: 'TP-Link', model: 'TL-SG1024D', serialNumber: 'TPL-SW24-001', purchaseDate: past(800), purchaseValue: 600, supplier: 'KaBuM!', warrantyStart: past(800), warrantyEnd: past(435), unit: 'Matriz', room: 'Sala Servidores', sector: 'TI', responsibleId: '', responsibleName: '', responsibleRole: '', deliveryDate: '', status: 'Em uso', notes: '' },
    { name: 'Roteador Ubiquiti UniFi', category: 'Roteador', brand: 'Ubiquiti', model: 'UAP-AC-PRO', serialNumber: 'UBQ-AP-001', purchaseDate: past(500), purchaseValue: 1200, supplier: 'Amazon', warrantyStart: past(500), warrantyEnd: past(135), unit: 'Matriz', room: 'Recepção', sector: 'TI', responsibleId: '', responsibleName: '', responsibleRole: '', deliveryDate: '', status: 'Em uso', notes: 'Access Point principal' },

    { name: 'Celular Samsung Galaxy A54', category: 'Celular', brand: 'Samsung', model: 'Galaxy A54', serialNumber: 'SAM-A54-001', purchaseDate: past(100), purchaseValue: 2500, supplier: 'Amazon', warrantyStart: past(100), warrantyEnd: future(265), unit: 'Matriz', room: '-', sector: 'Comercial', responsibleId: collaboratorIds[5], responsibleName: collaboratorNames[5], responsibleRole: 'Diretor Comercial', deliveryDate: past(95), status: 'Em uso', notes: 'Celular corporativo' },

    { name: 'Televisão Samsung 55" 4K', category: 'Televisão', brand: 'Samsung', model: 'UHD TU7000', serialNumber: 'SAM-TV55-001', purchaseDate: past(400), purchaseValue: 3500, supplier: 'Magazine Luiza', warrantyStart: past(400), warrantyEnd: past(35), unit: 'Matriz', room: 'Sala de Reuniões', sector: 'Compartilhado', responsibleId: '', responsibleName: '', responsibleRole: '', deliveryDate: '', status: 'Em uso', notes: '' },

    { name: 'Cadeira Ergonômica ThunderX3', category: 'Cadeira', brand: 'ThunderX3', model: 'YAMA1', serialNumber: 'TX3-YM1-001', purchaseDate: past(200), purchaseValue: 1800, supplier: 'KaBuM!', warrantyStart: past(200), warrantyEnd: future(530), unit: 'Matriz', room: 'Sala 101', sector: 'TI', responsibleId: collaboratorIds[0], responsibleName: collaboratorNames[0], responsibleRole: 'Analista de Sistemas', deliveryDate: past(195), status: 'Em uso', notes: '' },
    { name: 'Mesa Escritório L 1,60m', category: 'Mesa', brand: 'Escritolândia', model: 'ML160', serialNumber: 'ESC-ML-001', purchaseDate: past(400), purchaseValue: 800, supplier: 'Escritolândia', warrantyStart: past(400), warrantyEnd: future(330), unit: 'Matriz', room: 'Sala 101', sector: 'TI', responsibleId: collaboratorIds[0], responsibleName: collaboratorNames[0], responsibleRole: 'Analista de Sistemas', deliveryDate: past(395), status: 'Em uso', notes: '' },

    // Estoque
    { name: 'Mouse Microsoft Sculpt', category: 'Mouse', brand: 'Microsoft', model: 'Sculpt', serialNumber: 'MS-SCL-001', purchaseDate: past(30), purchaseValue: 250, supplier: 'KaBuM!', warrantyStart: past(30), warrantyEnd: future(335), unit: 'Matriz', room: 'Almoxarifado', sector: 'Estoque', responsibleId: '', responsibleName: '', responsibleRole: '', deliveryDate: '', status: 'Em estoque', notes: 'Reserva' },
    { name: 'Teclado Microsoft Wired 600', category: 'Teclado', brand: 'Microsoft', model: 'Wired 600', serialNumber: 'MS-W600-001', purchaseDate: past(30), purchaseValue: 100, supplier: 'KaBuM!', warrantyStart: past(30), warrantyEnd: future(335), unit: 'Matriz', room: 'Almoxarifado', sector: 'Estoque', responsibleId: '', responsibleName: '', responsibleRole: '', deliveryDate: '', status: 'Em estoque', notes: 'Reserva' },
    { name: 'Webcam Microsoft LifeCam', category: 'Webcam', brand: 'Microsoft', model: 'LifeCam HD-3000', serialNumber: 'MS-LC-001', purchaseDate: past(30), purchaseValue: 200, supplier: 'Amazon', warrantyStart: past(30), warrantyEnd: future(335), unit: 'Matriz', room: 'Almoxarifado', sector: 'Estoque', responsibleId: '', responsibleName: '', responsibleRole: '', deliveryDate: '', status: 'Em estoque', notes: '' },

    // Manutenção
    { name: 'Notebook Dell Inspiron 15', category: 'Notebook', brand: 'Dell', model: 'Inspiron 15 3000', serialNumber: 'DL-I15-001', purchaseDate: past(600), purchaseValue: 3500, supplier: 'Dell Brasil', warrantyStart: past(600), warrantyEnd: past(235), unit: 'Matriz', room: '-', sector: 'TI', responsibleId: '', responsibleName: '', responsibleRole: '', deliveryDate: '', status: 'Em manutenção', notes: 'Tela com defeito' },

    // Reservado
    { name: 'Notebook HP EliteBook 840', category: 'Notebook', brand: 'HP', model: 'EliteBook 840 G8', serialNumber: 'HP-EB840-001', purchaseDate: past(20), purchaseValue: 7500, supplier: 'HP Store', warrantyStart: past(20), warrantyEnd: future(710), unit: 'Matriz', room: 'Almoxarifado', sector: 'Estoque', responsibleId: '', responsibleName: '', responsibleRole: '', deliveryDate: '', status: 'Reservado', notes: 'Reservado para novo colaborador' },
  ];
}

export function generateSampleMovements(equipmentData: { id: string; name: string; code: string }[]): Omit<Movement, 'id' | 'createdAt'>[] {
  const today = new Date();
  const past = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  if (equipmentData.length < 3) return [];

  return [
    { equipmentId: equipmentData[0].id, equipmentName: equipmentData[0].name, equipmentCode: equipmentData[0].code, type: 'Entrada', fromResponsible: '', toResponsible: 'Ana Silva', fromLocation: 'Fornecedor', toLocation: 'Matriz / TI', date: past(360), notes: 'Recebimento de equipamento novo' },
    { equipmentId: equipmentData[5].id, equipmentName: equipmentData[5].name, equipmentCode: equipmentData[5].code, type: 'Entrada', fromResponsible: '', toResponsible: 'Carlos Oliveira', fromLocation: 'Fornecedor', toLocation: 'Matriz / Financeiro', date: past(175), notes: 'Notebook recebido' },
    { equipmentId: equipmentData[0].id, equipmentName: equipmentData[0].name, equipmentCode: equipmentData[0].code, type: 'Transferência', fromResponsible: 'Estoque', toResponsible: 'Ana Silva', fromLocation: 'Almoxarifado', toLocation: 'Sala 101', date: past(355), notes: '' },
  ];
}

export function generateSampleMaintenances(equipmentData: { id: string; name: string; code: string }[]): Omit<Maintenance, 'id' | 'createdAt'>[] {
  const today = new Date();
  const past = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  if (equipmentData.length < 10) return [];

  return [
    { equipmentId: equipmentData[9].id, equipmentName: equipmentData[9].name, equipmentCode: equipmentData[9].code, date: past(30), problemReported: 'Tela piscando intermitentemente', diagnosis: 'Cabo flat da tela com mau contato', solution: 'Substituição do cabo flat', technician: 'TechService Informática', cost: 280 },
    { equipmentId: equipmentData[15].id, equipmentName: equipmentData[15].name, equipmentCode: equipmentData[15].code, date: past(60), problemReported: 'Papel emperrando', diagnosis: 'Rolo de alimentação desgastado', solution: 'Substituição do rolo de alimentação', technician: 'PrintFix Assistência', cost: 350 },
  ];
}
