import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  Equipment, Collaborator, Movement, Maintenance,
  Workstation, ResponsibilityTerm, AppUser
} from '../types';
import {
  sampleCollaborators, generateSampleEquipment,
  generateSampleMovements, generateSampleMaintenances
} from './sampleData';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch { /* empty */ }
  return defaultValue;
}

function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

const defaultUsers: AppUser[] = [
  { id: '1', name: 'Administrador', email: 'admin@empresa.com', password: 'admin123', role: 'admin' },
  { id: '2', name: 'Gestor', email: 'gestor@empresa.com', password: 'gestor123', role: 'gestor' },
  { id: '3', name: 'Usuário', email: 'usuario@empresa.com', password: 'user123', role: 'usuario' },
];

function initializeSampleData() {
  if (localStorage.getItem('dataInitialized')) return null;

  // Create collaborators
  const collabs: Collaborator[] = sampleCollaborators.map(c => ({
    ...c,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }));

  const collabIds = collabs.map(c => c.id);
  const collabNames = collabs.map(c => c.fullName);

  // Create equipment
  const eqData = generateSampleEquipment(collabIds, collabNames);
  let codeCounter = 0;
  const eqs: Equipment[] = eqData.map(e => {
    codeCounter++;
    return {
      ...e,
      id: uuidv4(),
      patrimonialCode: `PAT-${String(codeCounter).padStart(5, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  // Create movements
  const eqRefs = eqs.map(e => ({ id: e.id, name: e.name, code: e.patrimonialCode }));
  const movData = generateSampleMovements(eqRefs);
  const movs: Movement[] = movData.map(m => ({
    ...m,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }));

  // Create maintenances
  const maintData = generateSampleMaintenances(eqRefs);
  const maints: Maintenance[] = maintData.map(m => ({
    ...m,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }));

  // Create workstation
  const ws: Workstation[] = [{
    id: uuidv4(),
    name: 'Estação 01 - Ana Silva',
    responsibleId: collabIds[0],
    responsibleName: collabNames[0],
    location: 'Sala 101',
    sector: 'TI',
    equipmentIds: eqs.slice(0, 5).map(e => e.id),
    createdAt: new Date().toISOString(),
  }, {
    id: uuidv4(),
    name: 'Estação 02 - João Ferreira',
    responsibleId: collabIds[3],
    responsibleName: collabNames[3],
    location: 'Sala 102',
    sector: 'TI',
    equipmentIds: eqs.slice(9, 12).map(e => e.id),
    createdAt: new Date().toISOString(),
  }];

  saveToStorage('collaborators', collabs);
  saveToStorage('equipment', eqs);
  saveToStorage('movements', movs);
  saveToStorage('maintenances', maints);
  saveToStorage('workstations', ws);
  localStorage.setItem('dataInitialized', 'true');

  return { collabs, eqs, movs, maints, ws };
}

export function useAppStore() {
  useState(() => initializeSampleData());

  const [equipment, setEquipment] = useState<Equipment[]>(() => loadFromStorage('equipment', []));
  const [collaborators, setCollaborators] = useState<Collaborator[]>(() => loadFromStorage('collaborators', []));
  const [movements, setMovements] = useState<Movement[]>(() => loadFromStorage('movements', []));
  const [maintenances, setMaintenances] = useState<Maintenance[]>(() => loadFromStorage('maintenances', []));
  const [workstations, setWorkstations] = useState<Workstation[]>(() => loadFromStorage('workstations', []));
  const [terms, setTerms] = useState<ResponsibilityTerm[]>(() => loadFromStorage('terms', []));
  const [users] = useState<AppUser[]>(() => loadFromStorage('users', defaultUsers));
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => loadFromStorage('currentUser', null));

  const login = useCallback((email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      saveToStorage('currentUser', user);
      return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  }, []);

  const nextPatrimonialCode = useCallback(() => {
    const maxCode = equipment.reduce((max, eq) => {
      const num = parseInt(eq.patrimonialCode.replace('PAT-', ''), 10);
      return num > max ? num : max;
    }, 0);
    return `PAT-${String(maxCode + 1).padStart(5, '0')}`;
  }, [equipment]);

  // Equipment CRUD
  const addEquipment = useCallback((eq: Omit<Equipment, 'id' | 'patrimonialCode' | 'createdAt' | 'updatedAt'>) => {
    const newEq: Equipment = {
      ...eq,
      id: uuidv4(),
      patrimonialCode: nextPatrimonialCode(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEquipment(prev => {
      const updated = [...prev, newEq];
      saveToStorage('equipment', updated);
      return updated;
    });
    return newEq;
  }, [nextPatrimonialCode]);

  const updateEquipment = useCallback((id: string, data: Partial<Equipment>) => {
    setEquipment(prev => {
      const updated = prev.map(eq => eq.id === id ? { ...eq, ...data, updatedAt: new Date().toISOString() } : eq);
      saveToStorage('equipment', updated);
      return updated;
    });
  }, []);

  const deleteEquipment = useCallback((id: string) => {
    setEquipment(prev => {
      const updated = prev.filter(eq => eq.id !== id);
      saveToStorage('equipment', updated);
      return updated;
    });
  }, []);

  // Collaborators CRUD
  const addCollaborator = useCallback((col: Omit<Collaborator, 'id' | 'createdAt'>) => {
    const newCol: Collaborator = { ...col, id: uuidv4(), createdAt: new Date().toISOString() };
    setCollaborators(prev => {
      const updated = [...prev, newCol];
      saveToStorage('collaborators', updated);
      return updated;
    });
    return newCol;
  }, []);

  const updateCollaborator = useCallback((id: string, data: Partial<Collaborator>) => {
    setCollaborators(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...data } : c);
      saveToStorage('collaborators', updated);
      return updated;
    });
  }, []);

  const deleteCollaborator = useCallback((id: string) => {
    setCollaborators(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveToStorage('collaborators', updated);
      return updated;
    });
  }, []);

  // Movements
  const addMovement = useCallback((mov: Omit<Movement, 'id' | 'createdAt'>) => {
    const newMov: Movement = { ...mov, id: uuidv4(), createdAt: new Date().toISOString() };
    setMovements(prev => {
      const updated = [...prev, newMov];
      saveToStorage('movements', updated);
      return updated;
    });
    return newMov;
  }, []);

  // Maintenances
  const addMaintenance = useCallback((m: Omit<Maintenance, 'id' | 'createdAt'>) => {
    const newM: Maintenance = { ...m, id: uuidv4(), createdAt: new Date().toISOString() };
    setMaintenances(prev => {
      const updated = [...prev, newM];
      saveToStorage('maintenances', updated);
      return updated;
    });
    return newM;
  }, []);

  // Workstations
  const addWorkstation = useCallback((ws: Omit<Workstation, 'id' | 'createdAt'>) => {
    const newWs: Workstation = { ...ws, id: uuidv4(), createdAt: new Date().toISOString() };
    setWorkstations(prev => {
      const updated = [...prev, newWs];
      saveToStorage('workstations', updated);
      return updated;
    });
    return newWs;
  }, []);

  const updateWorkstation = useCallback((id: string, data: Partial<Workstation>) => {
    setWorkstations(prev => {
      const updated = prev.map(ws => ws.id === id ? { ...ws, ...data } : ws);
      saveToStorage('workstations', updated);
      return updated;
    });
  }, []);

  const deleteWorkstation = useCallback((id: string) => {
    setWorkstations(prev => {
      const updated = prev.filter(ws => ws.id !== id);
      saveToStorage('workstations', updated);
      return updated;
    });
  }, []);

  // Terms
  const addTerm = useCallback((t: Omit<ResponsibilityTerm, 'id' | 'createdAt'>) => {
    const newT: ResponsibilityTerm = { ...t, id: uuidv4(), createdAt: new Date().toISOString() };
    setTerms(prev => {
      const updated = [...prev, newT];
      saveToStorage('terms', updated);
      return updated;
    });
    return newT;
  }, []);

  return {
    equipment, collaborators, movements, maintenances,
    workstations, terms, users, currentUser,
    login, logout,
    addEquipment, updateEquipment, deleteEquipment,
    addCollaborator, updateCollaborator, deleteCollaborator,
    addMovement, addMaintenance,
    addWorkstation, updateWorkstation, deleteWorkstation,
    addTerm,
  };
}

export type AppStore = ReturnType<typeof useAppStore>;
