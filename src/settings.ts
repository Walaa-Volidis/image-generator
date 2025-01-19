import { z } from 'zod';

export const ZServerSettings = z.object({
  replicateApiToken: z.string(),
});

export const SERVER_SETTINGS = ZServerSettings.parse({
  replicateApiToken: process.env['REPLICATE_API_TOKEN'],
});
