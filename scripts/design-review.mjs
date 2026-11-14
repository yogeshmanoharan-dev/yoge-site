import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export default function designReview() {
  return {
    name: 'yoge-design-review',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        if (![undefined, 'preview'].includes(process.env.CLOUDFLARE_ENV)) return;
        for (const [pattern, filename] of [
          ['/styleguide', 'Styleguide.astro'],
          ['/styleguide/type-a', 'TypeA.astro'],
          ['/styleguide/type-b', 'TypeB.astro'],
        ]) {
          injectRoute({
            pattern,
            entrypoint: fileURLToPath(new URL(`../src/review/${filename}`, import.meta.url)),
          });
        }
      },
      'astro:routes:resolved': ({ routes }) => {
        mkdirSync('.cache', { recursive: true });
        writeFileSync(
          '.cache/resolved-routes.json',
          JSON.stringify(
            {
              environment: process.env.CLOUDFLARE_ENV ?? 'local',
              routes: routes.map((route) => String(route.pattern)),
            },
            null,
            2,
          ),
        );
      },
    },
  };
}
