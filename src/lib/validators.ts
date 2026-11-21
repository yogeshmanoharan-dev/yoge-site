import { z } from 'zod';

const singleLine = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((value) => !/[\r\n]/.test(value), 'Use one line.');
const email = z.string().trim().toLowerCase().max(254).pipe(z.email());
const publicFormFields = {
  website: z.string().max(2000).optional(),
  'cf-turnstile-response': z.string().min(1).max(2048),
};

export const contactInput = z.object({
  ...publicFormFields,
  name: singleLine(80),
  email,
  subject: singleLine(120),
  body: z.string().trim().min(10).max(5000),
});

export const newsletterConsent =
  'I agree to receive Yoge’s newsletter by email. I can unsubscribe at any time.';

export const subscriberInput = z.object({
  ...publicFormFields,
  email,
  consent: z.literal('on', { error: 'Please confirm your consent.' }),
  source: z.enum(['/', '/newsletter', '/links']).default('/newsletter'),
});

export const newsletterToken = z.string().regex(/^[a-f0-9]{64}$/);
