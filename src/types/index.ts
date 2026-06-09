export type EquipmentCategory =
  | 'PC Completo' | 'CPU' | 'Notebook' | 'Monitor' | 'Teclado'
  | 'Mouse' | 'Headset' | 'Impressora' | 'Celular' | 'Nobreak'
  | 'Switch' | 'Roteador' | 'Televisão' | 'Webcam' | 'Cadeira'
  | 'Mesa' | 'Outros';

export type EquipmentStatus =
  | 'Em uso' | 'Em estoque' | 'Em manutenção'
  | 'Reservado' | 'Baixado' | 'Extraviado';

export type MovementType =
  | 'Entrada' | 'Saída' | 'Transferência' | 'Troca de Responsável'
  | 'Envio para Manutenção' | 'Retorno da Manutenção' | 'Baixa Patrimonial';

export type UserRole = 'admin' | 'gestor' | 'usuario';

export interface Equipment {
  id: string;
  patrimonialCode: string;
  name: string;
  category: EquipmentCategory;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseValue: number;
  supplier: string;
  invoiceFile?: string;
  warrantyStart: string;
  warrantyEnd: string;
  unit: string;
  room: string;
  sector: string;
  responsibleId: string;
  responsibleName: string;
  responsibleRole: string;
  deliveryDate: string;
  status: EquipmentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collaborator {
  id: string;
  fullName: string;
  cpf: string;
  role: string;
  sector: string;
  email: string;
  phone: string;
  admissionDate: string;
  status: 'Ativo' | 'Inativo';
  createdAt: string;
}

export interface Movement {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentCode: string;
  type: MovementType;
  fromResponsible: string;
  toResponsible: string;
  fromLocation: string;
  toLocation: string;
  date: string;
  notes: string;
  createdAt: string;
}

export interface Maintenance {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentCode: string;
  date: string;
  problemReported: string;
  diagnosis: string;
  solution: string;
  technician: string;
  cost: number;
  createdAt: string;
}

export interface Workstation {
  id: string;
  name: string;
  responsibleId: string;
  responsibleName: string;
  location: string;
  sector: string;
  equipmentIds: string[];
  createdAt: string;
}

export interface ResponsibilityTerm {
  id: string;
  collaboratorId: string;
  collaboratorName: string;
  equipmentIds: string[];
  date: string;
  signatureData?: string;
  companySignatureData?: string;
  createdAt: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export const CATEGORIES: EquipmentCategory[] = [
  'PC Completo', 'CPU', 'Notebook', 'Monitor', 'Teclado',
  'Mouse', 'Headset', 'Impressora', 'Celular', 'Nobreak',
  'Switch', 'Roteador', 'Televisão', 'Webcam', 'Cadeira',
  'Mesa', 'Outros'
];

export const STATUSES: EquipmentStatus[] = [
  'Em uso', 'Em estoque', 'Em manutenção',
  'Reservado', 'Baixado', 'Extraviado'
];

export const MOVEMENT_TYPES: MovementType[] = [
  'Entrada', 'Saída', 'Transferência', 'Troca de Responsável',
  'Envio para Manutenção', 'Retorno da Manutenção', 'Baixa Patrimonial'
];
