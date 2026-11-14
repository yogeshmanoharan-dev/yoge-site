import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import designReview from './scripts/design-review.mjs';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({ imageService: 'compile' }),
  integrations: [react(), designReview()],
  // Admin sessions will be implemented in D1 in Phase 4; do not provision KV.
  session: false,
  security: { checkOrigin: true },
  devToolbar: { enabled: false },
  server: { host: '127.0.0.1', port: 4321 },
});
