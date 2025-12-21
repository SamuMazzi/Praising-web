import { EmailPayloadVersionSong } from '@/logic/server/emails';
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
  
    const { userId, songId, nameSong, versionId, email } = req.body as EmailPayloadVersionSong;
  
    // Validate required fields
    if (!userId || !songId || !nameSong || !versionId || !email) {
      return res.status(400).json({ 
        error: 'All fields are required (message, userId, songId, nameSong, versionId)' 
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.RECIPIENT_EMAIL) {
      console.error('Missing email environment variables');
      return res.status(500).json({ error: 'Internal error' });
    }

    if (parseInt(songId, 10) <= 0 || Number.isNaN(parseInt(songId, 10))) {
      return res.status(400).json({ error: 'Invalid songId' });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
      const personalMail = transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.RECIPIENT_EMAIL,
        subject: `Praising - New version song: ${nameSong}`,
        html: `
          <h2>A new version has been uploaded</h2>

          <h3>Song Details:</h3>
          <ul>
            <li><strong>Song Name:</strong> ${nameSong}</li>
            <li><strong>Song ID:</strong> ${songId}</li>
            <li><strong>Version ID of the song:</strong> ${versionId}</li>
            <li><strong>Shared by User ID:</strong> ${userId}</li>
            <li><strong>User email:</strong> ${email}</li>
          </ul>
        `
      });

      const userEmail = transporter.sendMail({
        from: `Praising Staff <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Praising - Grazie per aver caricato una nuova versione per: ${nameSong}`,
        html: `
          <p>Ciao! Grazie per il tuo supporto nell'aiutare tutta la community con la tua versione di <strong>${nameSong}</strong></p>
          <p>Provvederò a revisionare personalmente la versione che hai caricato e cercherò di confermarla il prima possibile
          cosicchè anche tutti gli altri utenti possano vederla.</p>

          <p>Ti auguro una buona giornata!</p>
          <p>Praising Staff (per ora solo Samu)</p>
        `
      });
      await Promise.all([personalMail, userEmail]);
  
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.log('Sending email notification for new song version...', process.env.EMAIL_USER, process.env.RECIPIENT_EMAIL, process.env.EMAIL_PASS);
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  }
