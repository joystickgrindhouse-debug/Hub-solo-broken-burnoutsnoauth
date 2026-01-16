import { z } from 'zod';
import { insertCalibrationSchema, insertMatchSchema, calibrations, matches } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  calibration: {
    get: {
      method: 'GET' as const,
      path: '/api/calibration',
      responses: {
        200: z.custom<typeof calibrations.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    save: {
      method: 'POST' as const,
      path: '/api/calibration',
      input: insertCalibrationSchema,
      responses: {
        201: z.custom<typeof calibrations.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  matches: {
    list: {
      method: 'GET' as const,
      path: '/api/matches',
      responses: {
        200: z.array(z.custom<typeof matches.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/matches',
      input: insertMatchSchema,
      responses: {
        201: z.custom<typeof matches.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
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
