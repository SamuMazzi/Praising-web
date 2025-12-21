import { EmailPayloadProposalSong } from '@/logic/server/emails';
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

type ApiResponse = {
    message?: string;
    error?: string;
}
  
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
  
    const { userId, linkSong, linkChords, email } = req.body as EmailPayloadProposalSong;
  
    // Validate required fields
    if (!userId || !linkSong || !email) {
      return res.status(400).json({ 
        error: 'All fields are required (message, userId, linkSong, email)' 
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.RECIPIENT_EMAIL) {
      console.error('Missing email environment variables');
      return res.status(500).json({ error: 'Internal error' });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
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
            <li><strong>Song Link:</strong> ${linkSong}</li>
            <li><strong>Chords Link:</strong> ${linkChords}</li>
            <li><strong>Shared by User ID:</strong> ${userId}</li>
            <li><strong>User email:</strong> ${email}</li>
          </ul>
        `
      });
  
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.log('Sending email notification for new song version...', process.env.EMAIL_USER, process.env.RECIPIENT_EMAIL, process.env.EMAIL_PASS);
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  }
