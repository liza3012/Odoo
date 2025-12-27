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
      isOverdue 
    };
    this.requests.set(id, request);
    return request;
  }

  async updateMaintenanceRequest(id: number, updateRequest: UpdateMaintenanceRequest): Promise<MaintenanceRequest> {
    const existing = this.requests.get(id);
    if (!existing) {
      throw new Error(`Maintenance request ${id} not found`);
    }
    
    // Check status change to update equipment status if needed
    if (updateRequest.status) {
       // Logic to update parent equipment status could go here if we wanted to be strict,
       // but for this MVP we'll handle it visually or via simple checks
    }

    const updated = { ...existing, ...updateRequest };
    
    // Re-check overdue
    updated.isOverdue = new Date(updated.scheduledDate) < new Date() && updated.status !== 'repaired' && updated.status !== 'scrap';
    
    this.requests.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
