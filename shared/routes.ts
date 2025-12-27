import { z } from 'zod';
import { insertEquipmentSchema, insertMaintenanceRequestSchema, equipment, maintenanceRequests } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
};

export const api = {
  equipment: {
    list: {
      method: 'GET' as const,
      path: '/api/equipment',
      responses: {
        200: z.array(z.custom<typeof equipment.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/equipment/:id',
      responses: {
        200: z.custom<typeof equipment.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/equipment',
      input: insertEquipmentSchema,
      responses: {
        201: z.custom<typeof equipment.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  maintenance: {
    list: {
      method: 'GET' as const,
      path: '/api/maintenance-requests',
      responses: {
        200: z.array(z.custom<typeof maintenanceRequests.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/maintenance-requests',
      input: insertMaintenanceRequestSchema,
      responses: {
        201: z.custom<typeof maintenanceRequests.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/maintenance-requests/:id',
      input: insertMaintenanceRequestSchema.partial(),
      responses: {
        200: z.custom<typeof maintenanceRequests.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
