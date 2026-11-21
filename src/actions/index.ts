import { ActionError, defineAction } from 'astro:actions';
import { env } from 'cloudflare:workers';
import { getBackendEnv } from '../lib/env';
import { sendEmail } from '../lib/email';
import { subscribe } from '../lib/newsletter';
import { consumeRateLimit } from '../lib/ratelimit';
import { verifyTurnstile } from '../lib/turnstile';
import { contactInput, subscriberInput } from '../lib/validators';

type Backend = ReturnType<typeof getBackendEnv>;

async function handleForm(
  request: Request,
  action: 'contact' | 'newsletter',
  input: { website?: string; 'cf-turnstile-response': string },
  save: (backend: Backend) => Promise<{ message: string }>,
) {
  if (request.headers.get('Origin') !== new URL(request.url).origin) {
    throw new ActionError({ code: 'FORBIDDEN', message: 'Submit the form from this site.' });
  }
  if (input.website) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Please check the form and try again.' });
  }
  try {
    const backend = getBackendEnv(env);
    if (!(await consumeRateLimit(backend, request, action))) {
      throw new ActionError({ code: 'TOO_MANY_REQUESTS', message: 'Please try again in an hour.' });
    }
    if (!(await verifyTurnstile(backend, input['cf-turnstile-response'], action))) {
      throw new ActionError({
        code: 'BAD_REQUEST',
        message: 'Please complete the verification again.',
      });
    }
    return await save(backend);
  } catch (error) {
    if (error instanceof ActionError) throw error;
    // Astro normally includes the original exception message in the action result.
    // D1 and provider exceptions can include implementation details or form data.
    console.error(`Unable to process ${action} form.`);
    throw new ActionError({
      code: 'SERVICE_UNAVAILABLE',
      message: 'This form is temporarily unavailable. Please try again.',
    });
  }
}

export const server = {
  contact: {
    send: defineAction({
      accept: 'form',
      input: contactInput,
      handler: (input, { request }) =>
        handleForm(request, 'contact', input, async (backend) => {
          const id = crypto.randomUUID();
          await backend.DB.prepare(
            `INSERT INTO messages (id,name,email,subject,body,status,created_at)
          VALUES (?,?,?,?,?,'new',?)`,
          )
            .bind(id, input.name, input.email, input.subject, input.body, new Date().toISOString())
            .run();
          // The stored message is authoritative. An alert outage must not invite
          // a duplicate submission after the database write has succeeded.
          if (backend.RESEND_API_KEY && backend.ALERT_EMAIL_TO) {
            try {
              await sendEmail(
                backend,
                {
                  to: backend.ALERT_EMAIL_TO,
                  reply_to: input.email,
                  subject: 'New website contact message',
                  text: [input.name, input.email, input.subject, '', input.body].join('\n'),
                },
                `contact-${id}`,
              );
            } catch {
              console.warn('Contact message saved; alert delivery could not be verified.');
            }
          }
          return { message: 'Your message has been received.' };
        }),
    }),
  },
  newsletter: {
    subscribe: defineAction({
      accept: 'form',
      input: subscriberInput,
      handler: (input, { request }) =>
        handleForm(request, 'newsletter', input, (backend) =>
          subscribe(backend, input.email, input.source),
        ),
    }),
  },
};
