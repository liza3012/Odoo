import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === Equipment Routes ===
  app.get(api.equipment.list.path, async (req, res) => {
    const equipment = await storage.getEquipment();
    res.json(equipment);
  });

  app.get(api.equipment.get.path, async (req, res) => {
    const item = await storage.getEquipmentById(Number(req.params.id));
    if (!item) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(item);
  });

  app.post(api.equipment.create.path, async (req, res) => {
    try {
      const input = api.equipment.create.input.parse(req.body);
      const item = await storage.createEquipment(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // === Maintenance Routes ===
  app.get(api.maintenance.list.path, async (req, res) => {
    const requests = await storage.getMaintenanceRequests();
    res.json(requests);
  });

  app.post(api.maintenance.create.path, async (req, res) => {
    try {
      const bodySchema = api.maintenance.create.input.extend({
        scheduledDate: z.coerce.date(),
        durationHours: z.coerce.number().optional(),
      });
      const input = bodySchema.parse(req.body);
      const request = await storage.createMaintenanceRequest(input);
      res.status(201).json(request);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.maintenance.update.path, async (req, res) => {
    try {
      const bodySchema = api.maintenance.update.input.extend({
        scheduledDate: z.coerce.date().optional(),
      });
      const input = bodySchema.parse(req.body);
      const request = await storage.updateMaintenanceRequest(Number(req.params.id), input);
      res.json(request);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      // If not found
      res.status(404).json({ message: 'Request not found' });
    }
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const equipment = await storage.getEquipment();
  if (equipment.length === 0) {
    const depts = ["Engineering", "Operations", "Logistics", "IT"];
    
    // Seed Equipment
    const eq1 = await storage.createEquipment({ name: "Hydraulic Press X1", serialNumber: "HP-2024-001", department: "Operations", assignedTeam: "Alpha", isUnderRepair: true });
    const eq2 = await storage.createEquipment({ name: "Conveyor Belt System", serialNumber: "CB-2023-882", department: "Logistics", assignedTeam: "Beta", isUnderRepair: false });
    const eq3 = await storage.createEquipment({ name: "CNC Milling Machine", serialNumber: "CNC-992-X", department: "Engineering", assignedTeam: "Gamma", isUnderRepair: true });
    const eq4 = await storage.createEquipment({ name: "Forklift MK-4", serialNumber: "FL-5521", department: "Logistics", assignedTeam: "Delta", isUnderRepair: false });
    const eq5 = await storage.createEquipment({ name: "Server Rack A1", serialNumber: "SR-001-IT", department: "IT", assignedTeam: "Omega", isUnderRepair: false });

    // Seed Requests
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    await storage.createMaintenanceRequest({ title: "Oil Leak in Piston", equipmentId: eq1.id, status: "in_progress", scheduledDate: yesterday, technician: "Sarah Connor", priority: "high" });
    await storage.createMaintenanceRequest({ title: "Annual Safety Check", equipmentId: eq1.id, status: "new", scheduledDate: tomorrow, technician: "John Doe", priority: "low" });
    
    await storage.createMaintenanceRequest({ title: "Belt Alignment", equipmentId: eq2.id, status: "repaired", scheduledDate: lastWeek, technician: "Mike Ross", priority: "medium" });
    
    await storage.createMaintenanceRequest({ title: "Spindle Calibration", equipmentId: eq3.id, status: "in_progress", scheduledDate: yesterday, technician: "Jessica Pearson", priority: "critical" });
    await storage.createMaintenanceRequest({ title: "Coolant Flush", equipmentId: eq3.id, status: "new", scheduledDate: tomorrow, technician: "Louis Litt", priority: "medium" });

    await storage.createMaintenanceRequest({ title: "Battery Replacement", equipmentId: eq4.id, status: "new", scheduledDate: tomorrow, technician: "Harvey Specter", priority: "medium" });
    
    await storage.createMaintenanceRequest({ title: "Firmware Update", equipmentId: eq5.id, status: "new", scheduledDate: tomorrow, technician: "Donna Paulsen", priority: "low" });
    await storage.createMaintenanceRequest({ title: "Fan Noise Investigation", equipmentId: eq5.id, status: "scrap", scheduledDate: lastWeek, technician: "Rachel Zane", priority: "low" });
  }
}
