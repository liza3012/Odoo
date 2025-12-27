import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS (Mock tables for type compatibility, using MemStorage at runtime) ===
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  serialNumber: text("serial_number").notNull(),
  department: text("department").notNull(),
  assignedTeam: text("assigned_team").notNull(),
  isUnderRepair: boolean("is_under_repair").default(false),
});

export const maintenanceRequests = pgTable("maintenance_requests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  equipmentId: integer("equipment_id").notNull(),
  status: text("status", { enum: ["new", "in_progress", "repaired", "scrap"] }).notNull().default("new"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  technician: text("technician").notNull(), // Just a name for avatar seed
  priority: text("priority", { enum: ["low", "medium", "high", "critical"] }).default("medium"),
  isOverdue: boolean("is_overdue").default(false),
});

// === SCHEMAS ===
export const insertEquipmentSchema = createInsertSchema(equipment).omit({ id: true });
export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests).omit({ id: true, isOverdue: true });

// === TYPES ===
export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;

export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;

// Request types
export type CreateEquipmentRequest = InsertEquipment;
export type CreateMaintenanceRequest = InsertMaintenanceRequest;
export type UpdateMaintenanceRequest = Partial<InsertMaintenanceRequest>;
