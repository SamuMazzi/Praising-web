import type { NextApiRequest, NextApiResponse } from 'next'
import cheerio from 'cheerio'
import axios from 'axios'

const fetchLiturgia = async (url: string) => {
    const { data } = await axios.get(url);
    return cheerio.load(data);
};

const extractLiturgia = async (url: string) => {
    const $ = await fetchLiturgia(url);
    const firstLecture = $(".cci-liturgia-giorno-prima-lettura").text().trim()
    //.toArray()
    //.map((elem) => $(elem).text().trim());
    
    const psalm = $(".cci-liturgia-giorno-salmo").text().trim();
    const gospel = $(".cci-liturgia-giorno-vangelo").text().trim();
    return { firstLecture, psalm, gospel };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { date } = req.query
    const url = `https://www.chiesacattolica.it/liturgia-del-giorno/?data-liturgia=${date}`;

    const out = await extractLiturgia(url)

    res.status(200).json(out);
}