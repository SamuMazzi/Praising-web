import { extractLiturgia } from '@/logic/scraper_liturgy';
import { AxiosError } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { date } = req.query;
  const url = `https://www.chiesacattolica.it/liturgia-del-giorno/?data-liturgia=${date}`;

  try {
    const out = await extractLiturgia(url);
    res.status(200).json(out);
  } catch (e: any) {
    if (e instanceof AxiosError) {
      if (e.code === 'EAI_AGAIN') {
        res.status(500).json({ error: 'Errore di connessione' });
        return;
      }
    }
    res.status(500).json({ error: e.message });
  }
}
