import { CheerioAPI, load } from "cheerio";
import axios from "axios";

// FIXME: No second lecture

interface WebStructLiturgy {
  firstLecture: Lettura;
  psalm: Salmo;
  secondLecture?: Lettura;
  gospel: Lettura;
}

export interface Lettura {
  titolo: string;
  versetto: string;
  content: string;
}

interface Salmo {
  titolo: string;
  rit: string;
  versi: string[];
}

const fetchLiturgia = async (url: string) => {
  const { data } = await axios.get(url);
  return load(data);
};

const parseSalmo = ($: CheerioAPI): Salmo => {
  const tag = ".cci-liturgia-giorno-dettagli-content:icontains('Salmo responsoriale')"
  const versi = $(tag+ " > .cci-liturgia-giorno-section-content")
    .children("p:not(:empty)").last()
    .find("br").replaceWith("\n")
    .end().text()
    .split("R.");
  const titolo = $(tag + " > .cci-liturgia-giorno-section-content")
    .children("p:not(:empty)").first()
    .find("br").replaceWith("\n")
    .end().text()
    .split("\n")[1];
  let rit = $(tag + " > .cci-liturgia-giorno-section-versetto").text()
  if (rit.startsWith("R.")) {
    rit = rit.slice(2).trim();
  }
  return { titolo: titolo, rit: rit, versi: versi };
};

const parseLettura = ($: CheerioAPI, lettura: string): Lettura | undefined => {
  let lect = "";
  const tag = ".cci-liturgia-giorno-dettagli-content:not(:icontains('Acclamazione al vangelo')):icontains('"+ lettura +"') > .cci-liturgia-giorno-section-content"
  //console.log($(tag).text())
  $(tag)
    .children("p")
    .find("br")
    .replaceWith("\n")  // TODO: Correggere questo
    .end()
    .each((i, el) => {
      lect += $(el).text() + "\n";
    });
  const lecture = lect.trim().split("\n");
  const titolo = lecture[0];
  const versetto = lecture[1];
  let lett = lecture.slice(2).join("\n");
  if (lett.trim().endsWith("Parola di Dio."))
    lett = lett.replace("Parola di Dio.", "");
  if (lett.trim() === "") {
    return undefined;
  }
  return { titolo: titolo, versetto: versetto, content: lett.trim() };
};

export const extractLiturgia = async (url: string) => {
  const $ = await fetchLiturgia(url);
  const firstLecture = parseLettura($, "Prima lettura")!;
  const secondLecture = parseLettura($, "Seconda lettura");

  const psalm = parseSalmo($);
  const gospel = parseLettura($, "Vangelo")!;

  const out: WebStructLiturgy = { firstLecture, secondLecture, psalm, gospel };
  return out;
};

export class LiturgyOfDay {
  firstLecture: Lettura;
  psalm: Salmo;
  secondLecture?: Lettura;
  gospel: Lettura;

  constructor(body: WebStructLiturgy) {
    this.firstLecture = body.firstLecture;
    this.psalm = body.psalm;
    this.secondLecture = body.secondLecture;
    this.gospel = body.gospel;
  }
}
