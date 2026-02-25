import { z } from 'zod';
import { coinSchema, coinSearchResultSchema } from './schema';

export const api = {
  crypto: {
    prices: {
      method: 'GET' as const,
      path: '/api/crypto/prices' as const,
      responses: {
        200: z.array(coinSchema),
        500: z.object({ message: z.string() }),
      },
    },
    search: {
      method: 'GET' as const,
      path: '/api/crypto/search' as const,
      responses: {
        200: z.array(coinSearchResultSchema),
        500: z.object({ message: z.string() }),
      },
    },
  },
};

export type CryptoPricesResponse = z.infer<typeof api.crypto.prices.responses[200]>;
