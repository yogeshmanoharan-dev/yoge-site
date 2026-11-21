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
  security: {
    checkOrigin: true,
    csp: {
      directives: [
        "default-src 'self'",
        'frame-src https://challenges.cloudflare.com',
        "connect-src 'self' https://challenges.cloudflare.com",
      ],
      scriptDirective: { resources: ["'self'", 'https://challenges.cloudflare.com'] },
      styleDirective: {
        resources: [
          { resource: "'self'", kind: 'element' },
          { resource: "'unsafe-inline'", kind: 'attribute' },
        ],
      },
    },
  },
  devToolbar: { enabled: false },
  server: { host: '127.0.0.1', port: 4321 },
});
