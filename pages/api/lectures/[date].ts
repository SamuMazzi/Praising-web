import { extractLiturgia } from '@/logic/scraper_liturgy';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { date } = req.query
    const url = `https://www.chiesacattolica.it/liturgia-del-giorno/?data-liturgia=${date}`;

    const out = await extractLiturgia(url)

    res.status(200).json(out);
}