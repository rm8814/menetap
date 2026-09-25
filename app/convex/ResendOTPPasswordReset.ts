import Resend from '@auth/core/providers/resend';
import { Resend as ResendAPI } from 'resend';
import { RandomReader, generateRandomString } from '@oslojs/crypto/random';

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

export const ResendOTPPasswordReset = Resend({
  id: 'resend-otp',
  apiKey: env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    const random: RandomReader = { read(bytes) { crypto.getRandomValues(bytes as Uint8Array<ArrayBuffer>); } };
    return generateRandomString(random, '0123456789', 8);
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: env.AUTH_RESEND_FROM ?? 'Menetap <onboarding@resend.dev>',
      to: [email],
      subject: 'Reset your Menetap password',
      text: `Your Menetap password reset code is ${token}. It expires shortly.`,
    });
    if (error) throw new Error('Could not send password reset email.');
  },
});
