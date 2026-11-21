import astro from '@astrojs/cloudflare/entrypoints/server';
import { cleanupExpired } from './lib/cleanup';

export default {
  fetch: astro.fetch,
  async scheduled(controller, env) {
    await cleanupExpired(env.DB, new Date(controller.scheduledTime));
  },
} satisfies ExportedHandler<CloudflareBindings>;
