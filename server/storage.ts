import { type Equipment, type InsertEquipment, type MaintenanceRequest, type InsertMaintenanceRequest, type UpdateMaintenanceRequest } from "@shared/schema";

export interface IStorage {
  // Equipment
  getEquipment(): Promise<Equipment[]>;
  getEquipmentById(id: number): Promise<Equipment | undefined>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  
  // Maintenance Requests
  getMaintenanceRequests(): Promise<MaintenanceRequest[]>;
  createMaintenanceRequest(request: InsertMaintenanceRequest): Promise<MaintenanceRequest>;
  updateMaintenanceRequest(id: number, request: UpdateMaintenanceRequest): Promise<MaintenanceRequest>;
}

export class MemStorage implements IStorage {
  private equipment: Map<number, Equipment>;
  private requests: Map<number, MaintenanceRequest>;
  private equipmentIdCounter: number;
  private requestIdCounter: number;

  constructor() {
    this.equipment = new Map();
    this.requests = new Map();
    this.equipmentIdCounter = 1;
    this.requestIdCounter = 1;
  }

  async getEquipment(): Promise<Equipment[]> {
    return Array.from(this.equipment.values());
  }

  async getEquipmentById(id: number): Promise<Equipment | undefined> {
    return this.equipment.get(id);
  }

  async createEquipment(insertEquipment: InsertEquipment): Promise<Equipment> {
    const id = this.equipmentIdCounter++;
    const equipment: Equipment = { ...insertEquipment, id };
    this.equipment.set(id, equipment);
    return equipment;
  }

  async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    return Array.from(this.requests.values());
  }

  async createMaintenanceRequest(insertRequest: InsertMaintenanceRequest): Promise<MaintenanceRequest> {
    const id = this.requestIdCounter++;
    // Check overdue status on creation
    const isOverdue = new Date(insertRequest.scheduledDate) < new Date() && insertRequest.status !== 'repaired' && insertRequest.status !== 'scrap';
    
    const request: MaintenanceRequest = { 
      ...insertRequest, 
      id,
      isOverdue,
      durationHours: insertRequest.durationHours ?? 1,
      type: insertRequest.type ?? 'corrective'
    };
    this.requests.set(id, request);
    return request;
  }

  async updateMaintenanceRequest(id: number, updateRequest: UpdateMaintenanceRequest): Promise<MaintenanceRequest> {
    const existing = this.requests.get(id);
    if (!existing) {
      throw new Error(`Maintenance request ${id} not found`);
    }
    
    const updated = { ...existing, ...updateRequest };
    
    // Re-check overdue
    updated.isOverdue = new Date(updated.scheduledDate) < new Date() && updated.status !== 'repaired' && updated.status !== 'scrap';
    
    this.requests.set(id, updated);
    return updated;
  }
}

async function seedDatabase(storage: IStorage) {
  const equipment = await storage.getEquipment();
  if (equipment.length === 0) {
    const eq1 = await storage.createEquipment({ name: "Hydraulic Press X1", serialNumber: "HP-2024-001", department: "Operations", assignedTeam: "Alpha", isUnderRepair: true });
    const eq2 = await storage.createEquipment({ name: "Conveyor Belt System", serialNumber: "CB-2023-882", department: "Logistics", assignedTeam: "Beta", isUnderRepair: false });
    const eq3 = await storage.createEquipment({ name: "CNC Milling Machine", serialNumber: "CNC-992-X", department: "Engineering", assignedTeam: "Gamma", isUnderRepair: true });
    const eq4 = await storage.createEquipment({ name: "Forklift MK-4", serialNumber: "FL-5521", department: "Logistics", assignedTeam: "Delta", isUnderRepair: false });
    const eq5 = await storage.createEquipment({ name: "Server Rack A1", serialNumber: "SR-001-IT", department: "IT", assignedTeam: "Omega", isUnderRepair: false });

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    await storage.createMaintenanceRequest({ title: "Oil Leak in Piston", equipmentId: eq1.id, status: "in_progress", scheduledDate: yesterday, technician: "Sarah Connor", priority: "high", type: "corrective", durationHours: 2 });
    await storage.createMaintenanceRequest({ title: "Annual Safety Check", equipmentId: eq1.id, status: "new", scheduledDate: tomorrow, technician: "John Doe", priority: "low", type: "preventive", durationHours: 4 });
    await storage.createMaintenanceRequest({ title: "Belt Alignment", equipmentId: eq2.id, status: "repaired", scheduledDate: lastWeek, technician: "Mike Ross", priority: "medium", type: "corrective", durationHours: 1 });
    await storage.createMaintenanceRequest({ title: "Spindle Calibration", equipmentId: eq3.id, status: "in_progress", scheduledDate: yesterday, technician: "Jessica Pearson", priority: "critical", type: "corrective", durationHours: 3 });
    await storage.createMaintenanceRequest({ title: "Coolant Flush", equipmentId: eq3.id, status: "new", scheduledDate: tomorrow, technician: "Louis Litt", priority: "medium", type: "preventive", durationHours: 2 });
    await storage.createMaintenanceRequest({ title: "Battery Replacement", equipmentId: eq4.id, status: "new", scheduledDate: tomorrow, technician: "Harvey Specter", priority: "medium", type: "corrective", durationHours: 1 });
    await storage.createMaintenanceRequest({ title: "Firmware Update", equipmentId: eq5.id, status: "new", scheduledDate: tomorrow, technician: "Donna Paulsen", priority: "low", type: "preventive", durationHours: 1 });
    await storage.createMaintenanceRequest({ title: "Fan Noise Investigation", equipmentId: eq5.id, status: "scrap", scheduledDate: lastWeek, technician: "Rachel Zane", priority: "low", type: "corrective", durationHours: 2 });
  }
}

export const storage = new MemStorage();
seedDatabase(storage);
