import { EmailPayloadPartSong } from '@/logic/server/emails';
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
  
    const { userName, songId, nameSong, partId, email, namePart } = req.body as EmailPayloadPartSong;
  
    // Validate required fields
    if (!userName || !songId || !nameSong || !partId || !namePart) {
      return res.status(400).json({ 
        error: 'All fields are required (message, userId, songId, nameSong, versionId)' 
      });
    }
  
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.RECIPIENT_EMAIL,
        subject: `Praising - New part for song: ${nameSong}`,
        /* text: `
            Message: ${message}
            
            Song Details:
            - Song Name: ${nameSong}
            - Song ID: ${songId}
            - Shared by User ID: ${userId}
        `, */
        // Optional: HTML version
        html: `
          <h2>A new part has been uploaded</h2>

          <h3>Song Details:</h3>
          <ul>
            <li><strong>Song Name:</strong> ${nameSong}</li>
            <li><strong>Song ID:</strong> ${songId}</li>
            <li><strong>Part ID of the song:</strong> ${partId}</li>
            <li><strong>Part name:</strong> ${namePart}</li>
            <li><strong>Shared by User:</strong> ${userName}</li>
            <li><strong>User email:</strong> ${email}</li>
          </ul>
        `
      });
  
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  }