import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { EmailPayloadProposalSong } from '@/logic/server/emails';
import {
  checkRateLimit,
  escapeHtml,
  getClientIp
} from '@/logic/api/email_helpers';
import {
  CertificatesUnavailableError,
  getBearerToken,
  InvalidTokenError,
  verifyIdToken
} from '@/logic/api/verify_auth';

type ApiResponse = {
  message?: string;
  error?: string;
};

const MAX_PROPOSALS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS ||
    !process.env.RECIPIENT_EMAIL
  ) {
    console.error('Missing email environment variables');
    return res.status(500).json({ error: 'Internal error' });
  }

  // Identity comes from the verified ID token, never from the request body.
  let user;
  try {
    user = await verifyIdToken(getBearerToken(req.headers.authorization));
  } catch (error) {
    if (error instanceof InvalidTokenError) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (error instanceof CertificatesUnavailableError) {
      console.error('Could not fetch Google signing certificates:', error);
      return res.status(503).json({ error: 'Try again later' });
    }
    throw error;
  }

  if (user.signInProvider === 'anonymous') {
    return res
      .status(403)
      .json({ error: 'Sign in with Google to propose a song' });
  }
  if (!/\S+@\S+\.\S+/.test(user.email)) {
    return res.status(403).json({ error: 'Account has no usable email' });
  }

  const rateLimit = checkRateLimit(
    `propose-song:${user.uid}:${getClientIp(req)}`,
    MAX_PROPOSALS,
    RATE_LIMIT_WINDOW_MS
  );
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', rateLimit.retryAfterSeconds.toString());
    return res.status(429).json({ error: 'Too many proposals, try later' });
  }

  const { linkSong, linkChords } = req.body as EmailPayloadProposalSong;

  if (!linkSong) {
    return res.status(400).json({ error: 'The song link is required' });
  }
  if (!/\S+\/\/\S+/.test(linkSong)) {
    return res.status(400).json({ error: 'Invalid link song format' });
  }
  if (linkChords && !/\S+\/\/\S+/.test(linkChords)) {
    return res.status(400).json({ error: 'Invalid link chords format' });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.RECIPIENT_EMAIL,
      subject: `Praising - New song proposed`,
      html: `
          <h2>A new song has been proposed</h2>

          <h3>Song Details:</h3>
          <ul>
            <li><strong>Song Link:</strong> ${escapeHtml(linkSong)}</li>
            <li><strong>Chords Link:</strong> ${escapeHtml(linkChords ?? '')}</li>
            <li><strong>Shared by User ID:</strong> ${escapeHtml(user.uid)}</li>
            <li><strong>User email:</strong> ${escapeHtml(user.email)}</li>
          </ul>
        `
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending the song proposal email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
