import cheerio, { CheerioAPI } from 'cheerio'
import axios from 'axios'

interface Lettura {
    titolo: string
    versetto: string
    content: string
}

interface Salmo {
    titolo: string
    rit: string
    versi: string[]
}

const fetchLiturgia = async (url: string) => {
    const { data } = await axios.get(url);
    return cheerio.load(data);
};

const parseSalmo = ($: CheerioAPI): Salmo => {
    const versi = $('.cci-liturgia-giorno-salmo').children('p').find("br").replaceWith("\n").end().text().split('R.')
    const titolo = $('.cci-liturgia-giorno-salmo > .cci-liturgia-giorno-section-title').find("br").replaceWith("\n").end().text().split('\n')[1]
    let rit = $('.cci-liturgia-giorno-ritornello-content').text()
    if (rit.startsWith('R.')) {
        rit = rit.slice(2).trim()
    }
    return {titolo: titolo, rit: rit, versi: versi}
}

const parseVangelo = ($: CheerioAPI, lettura: string): Lettura | undefined => {
    let lect = ""
    $(lettura + ' > div').children('p').find("br").replaceWith("\n").end().each((i, el) => {
        lect += $(el).text() + '\n'
    })
    const lecture = lect.split('\n')
    const titolo = lecture[0]
    //TODO: Gestire letture alternative (forma breve/lunga)
    const versetto = lecture[1]
    let lett = lecture.slice(2).join('\n')
    if(lett.trim().endsWith('Parola del Signore.')) lett = lett.replace('Parola del Signore.', '')
    if(lett.trim() === '') {
        return undefined
    }
    return {titolo: titolo, versetto: versetto, content: lett.trim()}
}

const parseLettura = ($: CheerioAPI, lettura: string): Lettura | undefined => {
    let lect = ""
    $(lettura).children('p').find("br").replaceWith("\n").end().each((i, el) => {
        lect += $(el).text() + '\n'
    })
    const lecture = lect.split('\n')
    const titolo = lecture[0]
    const versetto = lecture[1]
    let lett = lecture.slice(2).join('\n')
    if(lett.trim().endsWith('Parola di Dio.')) lett = lett.replace('Parola di Dio.', '')
    if(lett.trim() === '') {
        return undefined
    }
    return {titolo: titolo, versetto: versetto, content: lett.trim()}
}

export const extractLiturgia = async (url: string) => {
    const $ = await fetchLiturgia(url);
    const firstLecture = parseLettura($, ".cci-liturgia-giorno-prima-lettura")
    const secondaLecture = parseLettura($, ".cci-liturgia-giorno-seconda-lettura")
    
    const psalm = parseSalmo($)
    const gospel = parseVangelo($, ".cci-liturgia-giorno-vangelo")
    //const gospel = $(".cci-liturgia-giorno-vangelo").text().trim();
    return { firstLecture, secondaLecture,psalm, gospel };
};

export class LiturgyOfDay {
  firstLecture: Lettura;
  psalm: Salmo;
  secondLecture?: Lettura;
  gospel: Lettura;
 
  constructor(body: any) {
    this.firstLecture = body.firstLecture
    this.psalm = body.psalm
    this.secondLecture = body.secondLecture
    this.gospel = body.gospel
  }
}
 