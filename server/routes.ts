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
        type: z.enum(["corrective", "preventive"]),
        durationHours: z.coerce.number().min(1),
      });
      const input = bodySchema.parse(req.body);
      const request = await storage.createMaintenanceRequest(input as any);
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
        type: z.enum(["corrective", "preventive"]).optional(),
        durationHours: z.coerce.number().min(1).optional(),
      });
      const input = bodySchema.parse(req.body);
      const request = await storage.updateMaintenanceRequest(Number(req.params.id), input as any);
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

  return httpServer;
}
