import { z } from 'zod';
import { coinSchema, insertPortfolioSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  crypto: {
    prices: {
      method: 'GET' as const,
      path: '/api/crypto/prices' as const,
      responses: {
        200: z.array(coinSchema),
        500: errorSchemas.internal,
      },
    },
  },
  portfolio: {
    get: {
      method: 'GET' as const,
      path: '/api/portfolio' as const,
      responses: {
        200: z.array(z.object({
          coinId: z.string(),
          amount: z.string(),
        })),
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/portfolio' as const,
      input: z.object({
        coinId: z.string(),
        amount: z.string(),
      }),
      responses: {
        200: z.object({ success: z.boolean() }),
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

export type CryptoPricesResponse = z.infer<typeof api.crypto.prices.responses[200]>;
